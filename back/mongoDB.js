require('dotenv').config();
const {MongoClient} = require("mongodb");

class Database {
    constructor() {
        this.url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URI}/?retryWrites=true&w=majority&appName=MatisCluster`
        // this.url = "mongodb://mongo_database:27017/Connect4";
        this.client = new MongoClient(this.url);
        this.db = this.client.db("Connect4");

        this.initializeDB().then(() => console.log("Database initialized"));
    }

    async disconnect() {
        await this.client.close();
    }

    async initializeDB() {
        const collections = (await this.db.listCollections().toArray()).map(collection => collection.name);

        // wait for all collections to be created
        const promises = [];
        if (!collections.includes("Users")) promises.push(this.db.createCollection("Users", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["Username", "Email", "Password", "Avatar", "MMR", "Timestamp"],
                    properties: {
                        Username: {
                            bsonType: "string",
                            pattern: "^[a-zA-Z0-9_]{4,}$",
                            minLength: 4
                        },
                        Email: {
                            bsonType: "string",
                            pattern: "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$",
                        },
                        Password: {
                            bsonType: "string",
                            minLength: 8
                        },
                        MMR: {
                            bsonType: "int"
                        },
                        Avatar: {
                            bsonType: "string"
                        },
                        LastConnection: {
                            bsonType: "date"
                        },
                        Timestamp: {
                            bsonType: "date"
                        },
                        Tokens: {
                            bsonType: "object",
                            properties: {
                                jwt_token: {
                                    bsonType: "string"
                                },
                                jwt_refresh: {
                                    bsonType: "string"
                                }
                            }
                        }
                    }
                }
            },
            validationLevel: "strict",
            validationAction: "error"
        }).then(() => console.log("Created collection Users")).catch(e => console.log(e)));
        if (!collections.includes("Games")) promises.push(this.db.createCollection("Games", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["Player1", "Player2", "Winner", "Timestamp"],
                    properties: {
                        Player1: {
                            bsonType: "string",
                        },
                        Player2: {
                            bsonType: "string",
                        },
                        Winner: {
                            bsonType: "string",
                        },
                        Board: {
                            bsonType: "array",
                            items: {
                                bsonType: "array",
                                items: {
                                    bsonType: "string"
                                },
                                minItems: 6
                            },
                            minItems: 7
                        },
                        TurnNumber: {
                            bsonType: "int"
                        },
                        Moves: {
                            bsonType: "string",
                        },
                        Mode: {
                            bsonType: "string"
                        },
                        MMR: {
                            bsonType: "double"
                        },
                        Duration: {
                            bsonType: "double"
                        },
                        Timestamp: {
                            bsonType: "date"
                        }
                    }
                }
            },
            validationLevel: "strict",
            validationAction: "error"
        }).then(() => console.log("Created collection Games")).catch(e => console.log(e)));
        if (!collections.includes("SavedGames")) promises.push(this.db.createCollection("SavedGames", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["Player1", "Player2", "TurnPlayer", "Board", "Timestamp"],
                    properties: {
                        Player1: {
                            bsonType: "string",
                        },
                        Player2: {
                            bsonType: "string",
                        },
                        TurnPlayer: {
                            bsonType: "string",
                        },
                        Board: {
                            bsonType: "array",
                            items: {
                                bsonType: "array",
                                items: {
                                    bsonType: "string"
                                },
                                minItems: 6
                            },
                            minItems: 7
                        },
                        Timestamp: {
                            bsonType: "date"
                        }
                    }
                }
            },
            validationLevel: "strict",
            validationAction: "error"
        }).then(() => console.log("Created collection SavedGames")).catch(e => console.log(e)));
        if (!collections.includes("Friends")) promises.push(this.db.createCollection("Friends", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["Player1", "Player2", "Status", "Timestamp"],
                    properties: {
                        Player1: {
                            bsonType: "string",
                        },
                        Player2: {
                            bsonType: "string",
                        },
                        Status: {
                            bsonType: "string",
                            enum: ["Pending", "Accepted", "Declined", "Blocked"]
                        },
                        Timestamp: {
                            bsonType: "date"
                        }
                    }
                }
            },
            validationLevel: "strict",
            validationAction: "error"
        }).then(() => console.log("Created collection Friends")).catch(e => console.log(e)));
        if (!collections.includes("Messages")) promises.push(this.db.createCollection("Messages", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["Sender", "Receiver", "Message", "Timestamp"],
                    properties: {
                        Sender: {
                            bsonType: "string",
                        },
                        Receiver: {
                            bsonType: "string",
                        },
                        Message: {
                            bsonType: "string",
                        },
                        Timestamp: {
                            bsonType: "date"
                        }
                    }
                }
            },
            validationLevel: "strict",
            validationAction: "error"
        }).then(() => console.log("Created collection Messages")).catch(e => console.log(e)));
        if (!collections.includes("Ranks")) promises.push(this.db.createCollection("Ranks", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["Rank", "Divisions"],
                    properties: {
                        Rank: {
                            bsonType: "string",
                            enum: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Champion", "Legend"],
                        },
                        Divisions: {
                            bsonType: "array",
                            items: {
                                bsonType: "object",
                                required: ["Division", "MMR"],
                                properties: {
                                    Division: {
                                        bsonType: "string",
                                        enum: ["I", "II", "III", "IV", "V", "X"],
                                    },
                                    MMR: {
                                        bsonType: "int",
                                        minimum: 0
                                    }
                                }
                            }
                        }
                    }
                }
            },
            validationLevel: "strict",
            validationAction: "error"
        }).then(() => console.log("Created collection Ranks")).catch(e => console.log(e)));
        if (!collections.includes("Skins")) promises.push(this.db.createCollection("Skins", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["Name", "Skin1", "Skin2", "MMR"],
                    properties: {
                        Name: {
                            bsonType: "string",
                        },
                        Skin1: {
                            bsonType: "string",
                        },
                        Skin2: {
                            bsonType: "string",
                        },
                        MMR: {
                            bsonType: "double"
                        }
                    }
                }
            },
            validationLevel: "strict",
            validationAction: "error"
        }).then(() => console.log("Created collection Skins")).catch(e => console.log(e)));
        if (!collections.includes("AI")) promises.push(this.db.createCollection("AI", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["Moves", "Score"],
                    properties: {
                        Moves: {
                            bsonType: "string",
                        },
                        Score: {
                            bsonType: "array",
                            items: {
                                bsonType: "int",
                            },
                            minItems: 7,
                        }
                    }
                }
            },
            validationLevel: "strict",
            validationAction: "error"
        }).then(() => console.log("Created collection AI")).catch(e => console.log(e)));
        if (!collections.includes("Avatars")) promises.push(this.db.createCollection("Avatars", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["Url", "Data"],
                    properties: {
                        Url: {
                            bsonType: "string",
                        },
                        Data: {
                            bsonType: "string"
                        }
                    }
                }
            },
            validationLevel: "strict",
            validationAction: "error"
        }).then(() => console.log("Created collection Avatars")).catch(e => console.log(e)));
        await Promise.all(promises);

        // Create indexes
        this.db.collection("Users").createIndex({Email: 1}, {unique: true});
        this.db.collection("Games").createIndex({Player1: 1, Player2: 1, Timestamp: 1}, {unique: true});
        this.db.collection("SavedGames").createIndex({Player1: 1, Player2: 1}, {unique: true});
        await this.db.collection("Ranks").createIndex({Rank: 1}, {unique: true});


        if (process.env.PROD === 'dev_start') {

            function generateRandomEmail() {
                const names = ['John', 'Jane', 'Jim', 'Jennifer', 'Jessica', 'Michael', 'Mike', 'Mila', 'Emily', 'Emma'];
                const lastNames = ['Doe', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez'];
                const services = ['gmail', 'yahoo', 'hotmail', 'outlook', 'aol'];
                const domains = ['com', 'fr', 'eu', 'co.uk', 'io', 'net', 'org', 'de'];

                const randomName = names[Math.floor(Math.random() * names.length)];
                const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
                const randomService = services[Math.floor(Math.random() * services.length)];
                const randomDomain = domains[Math.floor(Math.random() * domains.length)];
                const randomNum = Math.floor(Math.random() * 1000);

                return `${randomName}_${randomLastName}_${randomNum}@${randomService}.${randomDomain}`;
            }

            function generateRandomUsername(email) {
                return email.split('@')[0].replace('_', '');
            }

            function generateRandomPassword() {
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let password = '';
                for (let i = 0; i < 10; i++) {
                    password += characters.charAt(Math.floor(Math.random() * characters.length));
                }
                return password;
            }

            // Insert default users
            if (await this.db.collection("Users").countDocuments() < 10) {
                let users = [];
                for (let i = 0; i < 50; i++) {
                    const email = generateRandomEmail();
                    users.push({
                        Email: email,
                        Username: generateRandomUsername(email),
                        Password: generateRandomPassword(),
                        Avatar: "https://blob.sololearn.com/avatars/2f92969c-88fe-43d5-84dd-b018eb353736.jpg",
                        MMR: Math.floor(Math.random() * 10000),
                        Timestamp: new Date()
                    });
                }
                // remove duplicates emails
                users = users.filter((user, index, self) => self.findIndex(u => u.Email === user.Email) === index);
                this.db.collection("Users").insertMany(users).then(() => console.log("Inserted default users")).catch(e => console.log(e));
            }
        }

        // Insert default ranks
        if (await this.db.collection("Ranks").countDocuments() === 0) {
            this.db.collection("Ranks").insertMany([
                {
                    Rank: "Bronze", Divisions: [
                        {Division: "I", MMR: 0},
                        {Division: "II", MMR: 50},
                        {Division: "III", MMR: 100},
                        {Division: "IV", MMR: 150},
                        {Division: "V", MMR: 200},
                    ]
                },
                {
                    Rank: "Silver", Divisions: [
                        {Division: "I", MMR: 250},
                        {Division: "II", MMR: 350},
                        {Division: "III", MMR: 450},
                        {Division: "IV", MMR: 550},
                        {Division: "V", MMR: 650},
                    ]
                },
                {
                    Rank: "Gold", Divisions: [
                        {Division: "I", MMR: 750},
                        {Division: "II", MMR: 900},
                        {Division: "III", MMR: 1050},
                        {Division: "IV", MMR: 1200},
                        {Division: "V", MMR: 1350},
                    ]
                },
                {
                    Rank: "Platinum", Divisions: [
                        {Division: "I", MMR: 1500},
                        {Division: "II", MMR: 1700},
                        {Division: "III", MMR: 1900},
                        {Division: "IV", MMR: 2100},
                        {Division: "V", MMR: 2300},
                    ]
                },
                {
                    Rank: "Diamond", Divisions: [
                        {Division: "I", MMR: 2500},
                        {Division: "II", MMR: 2750},
                        {Division: "III", MMR: 3000},
                        {Division: "IV", MMR: 3250},
                        {Division: "V", MMR: 3500},
                    ]
                },
                {
                    Rank: "Master", Divisions: [
                        {Division: "I", MMR: 3750},
                        {Division: "II", MMR: 4050},
                        {Division: "III", MMR: 4350},
                        {Division: "IV", MMR: 4650},
                        {Division: "V", MMR: 4950},
                    ]
                },
                {
                    Rank: "Grandmaster", Divisions: [
                        {Division: "I", MMR: 5250},
                        {Division: "II", MMR: 5650},
                        {Division: "III", MMR: 6050},
                        {Division: "IV", MMR: 6450},
                        {Division: "V", MMR: 6850},
                    ]
                },
                {
                    Rank: "Champion", Divisions: [
                        {Division: "I", MMR: 7250},
                        {Division: "II", MMR: 7800},
                        {Division: "III", MMR: 8350},
                        {Division: "IV", MMR: 8900},
                        {Division: "V", MMR: 9450},
                    ]
                },
                {
                    Rank: "Legend", Divisions: [
                        {Division: "X", MMR: 10000},
                    ]
                },
            ]).then(() => console.log("Inserted ranks")).catch(() => console.log("Ranks already inserted"));
        }
    }
}

module.exports = new Database();