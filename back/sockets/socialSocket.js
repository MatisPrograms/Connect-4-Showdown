const {db} = require("../mongoDB");
const jwt = require("jsonwebtoken");

const socialSocket = (io) => {
    const socialSocket = io.of('api/social');
    const socialPlayers = new Map();
    const pendingChallenges = new Set();

    socialSocket.on('connection', (socket) => {

        function getFriends(username) {
            return new Promise(async (resolve, reject) => {
                const friendsList = await db.collection("Friends").find({
                    $or: [{Player1: username}, {Player2: username}], Status: 'Accepted'
                }).map((player) => player.Player1 === username ? player.Player2 : player.Player1).toArray();
                if (!friendsList) return reject("No friends found");

                const friends = await db.collection("Users").find({Username: {$in: friendsList}}, {
                    projection: {
                        Password: 0,
                        Tokens: 0,
                        _id: 0
                    }
                }).map((player) => ({
                    Type: 'Friend',
                    User: player,
                    Status: socialPlayers.has(player.Username) ? 'Online' : 'Offline'
                })).toArray();
                if (!friends) return reject("No friends found");
                resolve(friends);
            });
        }

        function getRecentPlayers(username) {
            return new Promise(async (resolve, reject) => {
                const recentList = await db.collection("Games").find({
                    $or: [{Player1: username}, {Player2: username}], Mode: 'Ranked'
                }).map((player) => ({
                    player: player.Player1 === username ? player.Player2 : player.Player1,
                    date: player.Timestamp
                })).sort({date: -1})
                    .limit(50)
                    .map((player) => player.player)
                    .toArray();
                if (!recentList) return reject("No recent players found");

                const recent = await db.collection("Users").find({Username: {$in: recentList}}, {
                    projection: {
                        Password: 0,
                        Tokens: 0,
                        _id: 0
                    }
                }).map((player) => ({
                    Type: 'Recent',
                    User: player,
                    Status: socialPlayers.has(player.Username) ? 'Online' : 'Offline'
                })).toArray();
                if (!recent) return reject("No recent players found");
                resolve(recent);
            });
        }

        function getFriendRequests(username) {
            return new Promise(async (resolve, reject) => {
                const friendRequestList = await db.collection("Friends").find({
                    Player2: username, Status: 'Pending'
                }).map((player) => player.Player1 === username ? player.Player2 : player.Player1).toArray();
                if (!friendRequestList) return reject("No friend requests found");

                const friendRequests = await db.collection("Users").find({Username: {$in: friendRequestList}}, {
                    projection: {
                        Password: 0,
                        Tokens: 0,
                        _id: 0
                    }
                }).map((player) => ({
                    Type: 'Friend Request',
                    User: player,
                    Status: socialPlayers.has(player.Username) ? 'Online' : 'Offline'
                })).toArray();
                if (!friendRequests) return reject("No friend requests found");
                resolve(friendRequests);
            });
        }

        function getPendingChallenges(username) {
            return new Promise((resolve) => {
                resolve(
                    Promise.all(Array.from(pendingChallenges)
                        .filter((challenge) => challenge.Challenged === username)
                        .map(async (challenge) => {
                            const player = await db.collection("Users").findOne(
                                {Username: challenge.Challenger},
                                {
                                    projection: {
                                        Password: 0,
                                        Tokens: 0,
                                        _id: 0
                                    },
                                }
                            );
                            return {
                                Type: "Challenge",
                                User: player,
                                Status: socialPlayers.has(challenge.Challenger) ? "Online" : "Offline",
                            };
                        }))
                );
            });
        }

        function getNotifications(username) {
            return new Promise((resolve) => {
                getFriendRequests(username).then((friendRequests) => {
                    getPendingChallenges(username).then((challenges) => {
                        resolve(friendRequests.concat(challenges));
                    });
                })
            });
        }

        async function notifyLinkedAccounts(username) {
            const linkedUsers = []
            await getFriends(username).then((friends) => {
                friends.forEach((friend) => {
                    linkedUsers.push(friend.User.Username);
                });
            });

            await getRecentPlayers(username).then((recentPlayers) => {
                recentPlayers.forEach((recentPlayer) => {
                    linkedUsers.push(recentPlayer.User.Username);
                });
            });

            Array.from(new Set(linkedUsers)).forEach((user) => {
                if (socialPlayers.has(user) && user !== username) socket.to(socialPlayers.get(user)).emit('update');
            });
        }

        function getKeyFromValue(map, value) {
            try {
                return [...map.entries()].find(([key, val]) => val === value)[0];
            } catch (e) {
                return null;
            }
        }

        socket.on('update', async (data) => {
            const token = data.token;
            if (!token) return;

            const decoded = jwt.verify(token.replaceAll('\"', ''), process.env.JWT_ACCESS_TOKEN, (err, decoded) => {
                if (err) return false
                return decoded
            });
            if (!decoded) return;

            const user = await db.collection("Users").findOne({Email: decoded.email}, {
                projection: {
                    Password: 0,
                    Tokens: 0,
                    _id: 0
                }
            });
            if (!user) return;

            socialPlayers.set(user.Username, socket.id);

            getFriends(user.Username).then((friends) => {
                if (friends.length !== 0) socket.emit('friends', friends);
            });

            getRecentPlayers(user.Username).then((recent) => {
                if (recent.length !== 0) socket.emit('recent', recent);
            });

            getNotifications(user.Username).then((notifications) => {
                if (notifications.length !== 0) socket.emit('notifications', notifications);
            });

            if (data.recursive) notifyLinkedAccounts(user.Username).catch((err) => console.log(err));
        });

        socket.on('challenge', async (username) => {
            const challenge = {
                Challenger: getKeyFromValue(socialPlayers, socket.id),
                Challenged: username
            }
            if (challenge.Challenger === challenge.Challenged) return socket.emit('error', 'Cannot challenge yourself');
            if (challenge.Challenger === null || challenge.Challenged === null) return socket.emit('error', 'Invalid Username');

            if (Array.from(pendingChallenges).some((c) => (c.Challenger === challenge.Challenger && c.Challenged === challenge.Challenged)
                || (c.Challenger === challenge.Challenged && c.Challenged === challenge.Challenger))) return socket.emit('error', 'Already challenged');

            pendingChallenges.add(challenge);
            getNotifications(username).then((notifications) => {
                if (notifications.length !== 0) socialSocket.to(socialPlayers.get(username)).emit('notifications', notifications);
            });
        });

        socket.on('addFriend', async (username) => {
            if (await db.collection("Users").count({Username: username}) === 0) return socket.emit('error', 'Invalid Username');
            const sender = getKeyFromValue(socialPlayers, socket.id);
            if (sender === username) return socket.emit('error', 'Cannot add yourself');

            if (await db.collection("Friends").count({
                $or: [{Player1: sender, Player2: username}, {
                    Player1: username,
                    Player2: sender
                }]
            }) > 0) {
                if (await db.collection("Friends").count({
                    $or: [{Player1: sender, Player2: username}, {
                        Player1: username,
                        Player2: sender
                    }], Status: 'Accepted'
                }) > 0)
                    return socket.emit('error', 'Already Friends');
                else if (await db.collection("Friends").count({
                    $or: [{
                        Player1: sender,
                        Player2: username
                    }, {Player1: username, Player2: sender}], Status: 'Blocked'
                }) > 0)
                    return socket.emit('error', 'Blocked');
                return socket.emit('error', 'Already Sent');
            } else await db.collection("Friends").insertOne({
                Player1: sender,
                Player2: username,
                Status: 'Pending',
                Timestamp: new Date()
            });

            if (!socialPlayers.has(username)) return socket.emit('error', 'User not Online');
            getNotifications(username).then((notifications) => {
                socket.to(socialPlayers.get(username)).emit('notifications', notifications);
            }).catch((err) => console.log(err));
        });

        socket.on('removeFriend', async (username) => {
            const sender = getKeyFromValue(socialPlayers, socket.id);
            if (sender === username) return socket.emit('error', 'Cannot remove yourself');

            await db.collection("Friends").deleteOne({
                $or: [{
                    Player1: sender,
                    Player2: username
                }, {
                    Player1: username,
                    Player2: sender
                }], Status: "Accepted"
            });

            getFriends(sender).then((friends) => {
                socket.emit('friends', friends);
            }).catch((err) => console.log(err));

            if (!socialPlayers.has(username)) return socket.emit('error', 'User not Online');
            getFriends(username).then((friends) => {
                socket.to(socialPlayers.get(username)).emit('friends', friends);
            }).catch((err) => console.log(err));
        });

        socket.on('acceptNotification', async (data) => {
            const receiver = getKeyFromValue(socialPlayers, socket.id);
            if (data.Type === 'Friend Request') {
                await db.collection("Friends").updateOne({
                    Player1: data.User,
                    Player2: receiver
                }, {$set: {Status: 'Accepted'}});

                getFriends(receiver).then((friends) => {
                    socket.emit('friends', friends);
                }).catch((err) => console.log(err));

                if (!socialPlayers.has(data.User)) return socket.emit('error', 'User not Online');
                getFriends(data.User).then((friends) => {
                    socket.to(socialPlayers.get(data.User)).emit('friends', friends);
                });
            } else if (data.Type === 'Challenge') {
                // Find the challenge object to remove
                const challengeToRemove = Array.from(pendingChallenges).find((c) =>
                    (c.Challenger === data.User && c.Challenged === receiver) ||
                    (c.Challenger === receiver && c.Challenged === data.User)
                );

                // If the challenge exists, remove it from the set
                if (challengeToRemove) {
                    pendingChallenges.delete(challengeToRemove);
                }

                // If the user is not online, return an error
                if (!socialPlayers.has(data.User)) return socket.emit('error', 'User not Online');

                // If the user is online, emit the challenge to them
                const room = socialPlayers.get(data.User) + ":" + socialPlayers.get(receiver);
                socket.emit('challenge', room);
                socket.to(socialPlayers.get(data.User)).emit('challenge', room);
            }

            getNotifications(receiver).then((notifications) => {
                socket.emit('notifications', notifications);
            }).catch((err) => console.log(err));
        });

        socket.on('declineNotification', async (data) => {
            const receiver = getKeyFromValue(socialPlayers, socket.id);
            if (data.Type === 'Friend Request') {
                await db.collection("Friends").deleteOne({
                    Player1: data.User,
                    Player2: receiver,
                    Status: 'Pending'
                });
            } else {
                // Find the challenge object to remove
                const challengeToRemove = Array.from(pendingChallenges).find((c) =>
                    (c.Challenger === data.User && c.Challenged === receiver) ||
                    (c.Challenger === receiver && c.Challenged === data.User)
                );

                // If the challenge exists, remove it from the set
                if (challengeToRemove) {
                    pendingChallenges.delete(challengeToRemove);
                }
            }

            getNotifications(receiver).then((notifications) => {
                socket.emit('notifications', notifications);
            }).catch((err) => console.log(err));
        });

        socket.on('disconnect', async () => {
            if (socialPlayers.size === 0) return;
            const username = getKeyFromValue(socialPlayers, socket.id);
            if (username) socialPlayers.delete(username);

            notifyLinkedAccounts(username).catch((err) => console.log(err));
        });

        socket.on('conversation', async (username) => {
            const you = getKeyFromValue(socialPlayers, socket.id);
            if (you === null) return socket.emit('error', 'Not Logged In');
            const messages = await db.collection("Messages").find({
                $or: [{
                    Sender: you,
                    Receiver: username
                }, {
                    Sender: username,
                    Receiver: you
                }]
            }, {
                projection: {
                    _id: 0,
                    Timestamp: 0
                }
            }).sort({Timestamp: 1}).toArray();

            const youUser = await db.collection("Users").findOne({Username: you}, {
                projection: {
                    Password: 0,
                    Tokens: 0,
                    _id: 0
                }
            });

            const themUser = await db.collection("Users").findOne({Username: username}, {
                projection: {
                    Password: 0,
                    Tokens: 0,
                    _id: 0
                }
            });

            socket.emit('conversation', username, {
                You: youUser,
                Them: themUser,
                Messages: messages
            });
        });

        socket.on('sendMessage', async (sender, receiver, message) => {
            db.collection("Messages").insertOne({
                Sender: sender,
                Receiver: receiver,
                Message: message,
                Timestamp: new Date()
            })

            let username = getKeyFromValue(socialPlayers, socket.id) === sender ? sender : receiver;
            const user = await db.collection("Users").findOne({Username: username}, {
                projection: {
                    Password: 0,
                    Tokens: 0,
                    _id: 0
                }
            });

            socket.emit('receiveMessage', {
                User: user,
                Message: message
            });

            username = username === sender ? receiver : sender;
            if (!socialPlayers.has(username)) return socket.emit('error', 'User not Online');
            socket.to(socialPlayers.get(username)).emit('receiveMessage', {
                User: user,
                Message: message
            });
        });
    });
};

module.exports = socialSocket;