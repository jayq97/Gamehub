const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const cors = require('cors');

const app = express();
app.use(cors());


const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "http://localhost/",
        methods: ["GET", "POST"],
    }
});

const maxPlayer = 4;
const cardDeck = shuffleCards(declareCardDeck());


let room = {};
room['deck'] = cardDeck;
room['turn'] = Math.floor(Math.random() * 4) + 1;;
room['direction'] = Math.random() < 0.5;

let players = [];

for (let j = 0; j < maxPlayer; j++) {
    let p = {};
    p['id'] = 0;
    p['name'] = "";
    p['hand'] = [];
    players[j] = p;
}

room['players'] = players;

io.on('connection', (sock) => {

    sock.on('message', (text) => io.emit('message', text));

    sock.on('requestRoom', (playerName) => {
        let name = "Room1";
        let people;

        try {
            people = io.sockets.adapter.rooms[name].length;
        } catch (e) {
            people = 0;
        }
        sock.playerName = playerName;

        if (people <= maxPlayer) {
            sock.join(name);
            if (people < maxPlayer) {
                sock.on('playerJoin', (name) => io.emit('message', name + ' joined the game! ' + parseInt(people) + '/' + maxPlayer));
            }
            people = io.sockets.adapter.rooms[name].length;
        }
        if (people > maxPlayer) {
            sock.leave(name);
            sock.emit('wait', 'Please wait!');
        } else if (people == maxPlayer) {
            startGame(name);
        }
    });

    sock.on('disconnect', (data) => {
        if (sock.playerName != undefined) {
            io.emit('message', sock.playerName + ' left the lobby!');
        }
        if (io.sockets.adapter.rooms["Room1"] != undefined) {
            if (io.sockets.adapter.rooms["Room1"].length < maxPlayer && io.sockets.adapter.rooms["Room1"].length + 1 == maxPlayer) {
                sock.to("Room1").emit('forceDisconnect', data);
            }
        }
        console.log("2", sock.id);
    });

    sock.on('unoWon', (player) => {
        io.to("Room1").emit('forceDisconnect', player);
    });

    sock.on('drawCard', (playerTurn) => {
        io.to("Room1").emit('drawCard', playerTurn);
    })

    sock.on('playCard', (data, playerTurn, direction, color, drawCounter) => {
        io.to("Room1").emit('playCard', data, playerTurn, direction, color, drawCounter);
    })

});

function startGame(name) {
    let people;
    let sockets_ids = Object.keys(io.sockets.adapter.rooms[name].sockets);
    try {
        people = io.sockets.adapter.rooms[name].length;
    } catch (e) {
        console.log('>> ' + name + ': No people here...');
        return;
    }
    for (let i = 0; i < people; i++) {
        room['players'][i]['id'] = i + 1;
        let playerName = io.sockets.sockets[sockets_ids[i]].playerName;
        room['players'][i]['name'] = playerName;
        console.log('>> ' + name + ': ' + playerName +
            ' (' + sockets_ids[i] + ') is Player ' + parseInt(i + 1));
    }
    io.to("Room1").emit('startGame', room);
}

function declareCardDeck() {
    var deck = [];
    for (let i = 0; i <= 107; i++) {
        deck[i] = {};
        if (i <= 1) {
            deck[i]['src'] = "img/uno/cards/red_1.png";
            deck[i]['type'] = "1";
            deck[i]['color'] = "Red";
        } else if (i <= 3) {
            deck[i]['src'] = "img/uno/cards/red_2.png";
            deck[i]['type'] = "2";
            deck[i]['color'] = "Red";
        } else if (i <= 5) {
            deck[i]['src'] = "img/uno/cards/red_3.png";
            deck[i]['type'] = "3";
            deck[i]['color'] = "Red";
        } else if (i <= 7) {
            deck[i]['src'] = "img/uno/cards/red_4.png";
            deck[i]['type'] = "4";
            deck[i]['color'] = "Red";
        } else if (i <= 9) {
            deck[i]['src'] = "img/uno/cards/red_5.png";
            deck[i]['type'] = "5";
            deck[i]['color'] = "Red";
        } else if (i <= 11) {
            deck[i]['src'] = "img/uno/cards/red_6.png";
            deck[i]['type'] = "6";
            deck[i]['color'] = "Red";
        } else if (i <= 13) {
            deck[i]['src'] = "img/uno/cards/red_7.png";
            deck[i]['type'] = "7";
            deck[i]['color'] = "Red";
        } else if (i <= 15) {
            deck[i]['src'] = "img/uno/cards/red_8.png";
            deck[i]['type'] = "8";
            deck[i]['color'] = "Red";
        } else if (i <= 17) {
            deck[i]['src'] = "img/uno/cards/red_9.png";
            deck[i]['type'] = "9";
            deck[i]['color'] = "Red";
        } else if (i <= 19) {
            deck[i]['src'] = "img/uno/cards/red_S.png";
            deck[i]['type'] = "Skip";
            deck[i]['color'] = "Red";
        } else if (i <= 21) {
            deck[i]['src'] = "img/uno/cards/red_R.png";
            deck[i]['type'] = "Reverse";
            deck[i]['color'] = "Red";
        } else if (i <= 23) {
            deck[i]['src'] = "img/uno/cards/red_22.png";
            deck[i]['type'] = "Draw2";
            deck[i]['color'] = "Red";
        } else if (i <= 25) {
            deck[i]['src'] = "img/uno/cards/blue_1.png";
            deck[i]['type'] = "1";
            deck[i]['color'] = "Blue";
        } else if (i <= 27) {
            deck[i]['src'] = "img/uno/cards/blue_2.png";
            deck[i]['type'] = "2";
            deck[i]['color'] = "Blue";
        } else if (i <= 29) {
            deck[i]['src'] = "img/uno/cards/blue_3.png";
            deck[i]['type'] = "3";
            deck[i]['color'] = "Blue";
        } else if (i <= 31) {
            deck[i]['src'] = "img/uno/cards/blue_4.png";
            deck[i]['type'] = "4";
            deck[i]['color'] = "Blue";
        } else if (i <= 33) {
            deck[i]['src'] = "img/uno/cards/blue_5.png";
            deck[i]['type'] = "5";
            deck[i]['color'] = "Blue";
        } else if (i <= 35) {
            deck[i]['src'] = "img/uno/cards/blue_6.png";
            deck[i]['type'] = "6";
            deck[i]['color'] = "Blue";
        } else if (i <= 37) {
            deck[i]['src'] = "img/uno/cards/blue_7.png";
            deck[i]['type'] = "7";
            deck[i]['color'] = "Blue";
        } else if (i <= 39) {
            deck[i]['src'] = "img/uno/cards/blue_8.png";
            deck[i]['type'] = "8";
            deck[i]['color'] = "Blue";
        } else if (i <= 41) {
            deck[i]['src'] = "img/uno/cards/blue_9.png";
            deck[i]['type'] = "9";
            deck[i]['color'] = "Blue";
        } else if (i <= 43) {
            deck[i]['src'] = "img/uno/cards/blue_S.png";
            deck[i]['type'] = "Skip";
            deck[i]['color'] = "Blue";
        } else if (i <= 45) {
            deck[i]['src'] = "img/uno/cards/blue_R.png";
            deck[i]['type'] = "Reverse";
            deck[i]['color'] = "Blue";
        } else if (i <= 47) {
            deck[i]['src'] = "img/uno/cards/blue_22.png";
            deck[i]['type'] = "Draw2";
            deck[i]['color'] = "Blue";
        } else if (i <= 49) {
            deck[i]['src'] = "img/uno/cards/green_1.png";
            deck[i]['type'] = "1";
            deck[i]['color'] = "Green";
        } else if (i <= 51) {
            deck[i]['src'] = "img/uno/cards/green_2.png";
            deck[i]['type'] = "2";
            deck[i]['color'] = "Green";
        } else if (i <= 53) {
            deck[i]['src'] = "img/uno/cards/green_3.png";
            deck[i]['type'] = "3";
            deck[i]['color'] = "Green";
        } else if (i <= 55) {
            deck[i]['src'] = "img/uno/cards/green_4.png";
            deck[i]['type'] = "4";
            deck[i]['color'] = "Green";
        } else if (i <= 57) {
            deck[i]['src'] = "img/uno/cards/green_5.png";
            deck[i]['type'] = "5";
            deck[i]['color'] = "Green";
        } else if (i <= 59) {
            deck[i]['src'] = "img/uno/cards/green_6.png";
            deck[i]['type'] = "6";
            deck[i]['color'] = "Green";
        } else if (i <= 61) {
            deck[i]['src'] = "img/uno/cards/green_7.png";
            deck[i]['type'] = "7";
            deck[i]['color'] = "Green";
        } else if (i <= 63) {
            deck[i]['src'] = "img/uno/cards/green_8.png";
            deck[i]['type'] = "8";
            deck[i]['color'] = "Green";
        } else if (i <= 65) {
            deck[i]['src'] = "img/uno/cards/green_9.png";
            deck[i]['type'] = "9";
            deck[i]['color'] = "Green";
        } else if (i <= 67) {
            deck[i]['src'] = "img/uno/cards/green_S.png";
            deck[i]['type'] = "Skip";
            deck[i]['color'] = "Green";
        } else if (i <= 69) {
            deck[i]['src'] = "img/uno/cards/green_R.png";
            deck[i]['type'] = "Reverse";
            deck[i]['color'] = "Green";
        } else if (i <= 71) {
            deck[i]['src'] = "img/uno/cards/green_22.png";
            deck[i]['type'] = "Draw2";
            deck[i]['color'] = "Green";
        } else if (i <= 73) {
            deck[i]['src'] = "img/uno/cards/yellow_1.png";
            deck[i]['type'] = "1";
            deck[i]['color'] = "Yellow";
        } else if (i <= 75) {
            deck[i]['src'] = "img/uno/cards/yellow_2.png";
            deck[i]['type'] = "2";
            deck[i]['color'] = "Yellow";
        } else if (i <= 77) {
            deck[i]['src'] = "img/uno/cards/yellow_3.png";
            deck[i]['type'] = "3";
            deck[i]['color'] = "Yellow";
        } else if (i <= 79) {
            deck[i]['src'] = "img/uno/cards/yellow_4.png";
            deck[i]['type'] = "4";
            deck[i]['color'] = "Yellow";
        } else if (i <= 81) {
            deck[i]['src'] = "img/uno/cards/yellow_5.png";
            deck[i]['type'] = "5";
            deck[i]['color'] = "Yellow";
        } else if (i <= 83) {
            deck[i]['src'] = "img/uno/cards/yellow_6.png";
            deck[i]['type'] = "6";
            deck[i]['color'] = "Yellow";
        } else if (i <= 85) {
            deck[i]['src'] = "img/uno/cards/yellow_7.png";
            deck[i]['type'] = "7";
            deck[i]['color'] = "Yellow";
        } else if (i <= 87) {
            deck[i]['src'] = "img/uno/cards/yellow_8.png";
            deck[i]['type'] = "8";
            deck[i]['color'] = "Yellow";
        } else if (i <= 89) {
            deck[i]['src'] = "img/uno/cards/yellow_9.png";
            deck[i]['type'] = "9";
            deck[i]['color'] = "Yellow";
        } else if (i <= 91) {
            deck[i]['src'] = "img/uno/cards/yellow_S.png";
            deck[i]['type'] = "Skip";
            deck[i]['color'] = "Yellow";
        } else if (i <= 93) {
            deck[i]['src'] = "img/uno/cards/yellow_R.png";
            deck[i]['type'] = "Reverse";
            deck[i]['color'] = "Yellow";
        } else if (i <= 95) {
            deck[i]['src'] = "img/uno/cards/yellow_22.png";
            deck[i]['type'] = "Draw2";
            deck[i]['color'] = "Yellow";
        } else if (i <= 99) {
            deck[i]['src'] = "img/uno/cards/black_WC.png";
            deck[i]['type'] = "Wild";
            deck[i]['color'] = "Black";
        } else if (i <= 103) {
            deck[i]['src'] = "img/uno/cards/black_4.png";
            deck[i]['type'] = "Draw4";
            deck[i]['color'] = "Black";
        } else if (i == 104) {
            deck[i]['src'] = "img/uno/cards/red_0.png";
            deck[i]['type'] = "0";
            deck[i]['color'] = "Red";
        } else if (i == 105) {
            deck[i]['src'] = "img/uno/cards/blue_0.png";
            deck[i]['type'] = "0";
            deck[i]['color'] = "Blue";
        } else if (i == 106) {
            deck[i]['src'] = "img/uno/cards/green_0.png";
            deck[i]['type'] = "0";
            deck[i]['color'] = "Green";
        } else if (i == 107) {
            deck[i]['src'] = "img/uno/cards/yellow_0.png";
            deck[i]['type'] = "0";
            deck[i]['color'] = "Yellow";
        }
        deck[i]['id'] = i;
    }
    return deck;
}


function shuffleCards(array) {
    let counter = array.length;

    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;

        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

server.on('error', (err) => {
    console.error(err);
});

server.listen(8040, () => {
    console.log('server ready');
});