# [PS8 - Connect 4 Showdown](http://showdown.connect4.academy)

## Overview

This project is a cross-platform web-based and mobile multiplayer game of Connect 4 that is hosted on an AWS cloud
server. The game allows players to compete against each other, add friends, chat, ranked ladder mode, where they can
earn points and climb the ranks based on their performance. Non-connected users can also play against AIs or locally
with another player.

## Website

The game is hosted on an AWS cloud server and can be accessed at http://showdown.connect4.academy/

## Directory Structure

```
.
├── .run
├── back
├── cordova
├── docker-compose.yml
├── Dockerfile
├── package-lock.json
├── package.json
└── README.md

```

## Getting Started

1. Clone the repository:

```
git clone https://github.com/<user-name>/PS8-Connect4-Showdown.git
```

2. Change into the project directory:

```
cd PS8-Connect4-Showdown
```

3. Run Docker Compose to build the images and start the containers:

```
docker-compose up -d
```

or use configuration file in .run folder

4. Access the game in your web browser at `http://localhost:8080`

## Playing the Game

- Non-connected users can play against AIs or locally with another player.
- Non-connected users can use in-game chat to communicate with each other.
- Connected users can compete in the online ranked ladder mode, where they
  can earn points and climb the ranks based on their performance.
- Connected Users can save their game and resume it later.
- Connected users can use in-game social features to communicate, send
  friend requests, send challenges, and view their friends' profiles.

## Game Modes

- **Single Player Mode**: Play against another player on the same computer.
- **AI Mode**: Play against an AI.
- **Ranked Ladder Mode**: Compete against other players online in a ranked

## Ranking System

- The ranking system is based on the MMR rating system. Every rank gets harder
  to reach, and the points you earn are based on your rank and the rank of your
  opponent.
- There is a total of 8 ranks, from Bronze to Legend.
- Each rank is divided into 5 divisions, from 1 to 5.

<table>
  <thead>
    <tr>
      <th>Icon</th>
      <th>Name</th>
      <th>Points</th>
      <th>Division</th>
    </tr>
</thead>
<tbody>
  <tr>
    <td><img src="cordova/www/Assets/Bronze_Rank.png" width="100" height="100" alt="Bronze"></td>
    <td>Bronze</td>
    <td>0 - 250</td>
    <td>50 points each</td>
  </tr>
  <tr>
    <td><img src="cordova/www/Assets/Silver_Rank.png" width="100" height="100" alt="Silver"></td>
    <td>Silver</td>
    <td>250 - 750</td>
    <td>100 points each</td>
  </tr>
  <tr>
    <td><img src="cordova/www/Assets/Gold_Rank.png" width="100" height="100" alt="Gold"></td>
    <td>Gold</td>
    <td>750 - 1500</td>
    <td>150 points each</td>
  </tr>
  <tr>
    <td><img src="cordova/www/Assets/Platinum_Rank.png" width="100" height="100" alt="Platinum"></td>
    <td>Platinum</td>
    <td>1500 - 2500</td>
    <td>200 points each</td>
  </tr>
  <tr>
    <td><img src="cordova/www/Assets/Diamond_Rank.png" width="100" height="100" alt="Diamond"></td>
    <td>Diamond</td>
    <td>2500 - 3750</td>
    <td>250 points each</td>
  </tr>
  <tr>
    <td><img src="cordova/www/Assets/Master_Rank.png" width="100" height="100" alt="Master"></td>
    <td>Master</td>
    <td>3750 - 5250</td>
    <td>300 points each</td>
  </tr>
  <tr>
    <td><img src="cordova/www/Assets/Grandmaster_Rank.png" width="100" height="100" alt="GrandMaster"></td>
    <td>Grandmaster</td>
    <td>5250 - 7250</td>
    <td>400 points each</td>
  </tr>
  <tr>
    <td><img src="cordova/www/Assets/Champion_Rank.png" width="100" height="100" alt="legend"></td>
    <td>Champion</td>
    <td>7250 and 10000</td>
    <td>550 points each</td>
  </tr>
  <tr>
    <td><img src="cordova/www/Assets/Legend_Rank.png" width="100" height="100" alt="legend"></td>
    <td>Legend</td>
    <td>10000+</td>
    <td>Unlimited</td>
  </tr>
</tbody>
</table>

## Built With

- Node.js
- JavaScript
- Docker
- AWS
- MongoDB
- Cordova

and as little npm packages as possible.

## Authors

- [**Matis Herrmann**](https://github.com/MatisPrograms)
- [**Valentin Podda**](https://github.com/bernigaud-lecoq)
- [**Benjamin Bernigaud**](https://github.com/ValentinPodda)
