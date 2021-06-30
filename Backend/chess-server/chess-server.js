const {
    count
} = require('console');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.static(`${__dirname}/../Frontend/inc/chess.html`));
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "http://localhost",
        methods: ["GET", "POST"],
    }
});

let roomCounter = 1;

let players = [];
let p1 = {
    "color": "white",
    "name": ""
};
let p2 = {
    "color": "black",
    "name": ""
};
players[0] = p1;
players[1] = p2;


io.on('connection', socket => {

    socket.on('joinGame', (playerName) => {
        let room = 'Room1';
        let people;

        try {
            people = io.sockets.adapter.rooms[room].length;
        } catch (e) {
            people = 0;
        }

        if (people <= 2) {
            socket.join(room);
            if (people < 2) {
                players[people].name = playerName;
            }
            people = io.sockets.adapter.rooms[room].length;
        }
        if (people > 2) {
            socket.leave(room);
            socket.emit('wait', 'Please wait!');
        } else if (people == 2) {
            console.log(players);
            io.to(room).emit('startGame', players);
        }
    })

    socket.on('disconnect', (data) => {
        if (io.sockets.adapter.rooms["Room1"] != undefined) {
            if (io.sockets.adapter.rooms["Room1"].length == 1) {
                socket.to("Room1").emit('forceDisconnect', data);
            }
        }
        console.log("2", socket.id);
    });

    socket.on("moveFigure", (data) => {
        socket.to("Room1").emit("moveFigure", data);
    })

    socket.on("deletePawn", (data) => {
        socket.to("Room1").emit("deletePawn", data);
    })
    socket.on("Check", () => {
        socket.to("Room1").emit("Check");
    })
    socket.on("Checkmate", (color) => {
        socket.to("Room1").emit("Checkmate", color);
    })
    socket.on("Won", (data) => {
        socket.to("Room1").emit("forceDisconnect", data);
    })
});

io.of("/").adapter.on("create-room", (room) => {
    console.log(`room ${room} was created`);
});

io.of("/").adapter.on("join-room", (room, id) => {
    console.log(`socket ${id} has joined room ${room}`);
});

server.on('error', (err) => {
    console.error(err);
});

server.listen(8080, () => {
    console.log('server ready');
});