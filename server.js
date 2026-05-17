const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    transports: ['websocket']
});

app.set('view engine', 'ejs');

let messagesHistory = [];

app.get('/', (req, res) => {
    res.render('index');
});

io.on('connection', (socket) => {
    let currentUsername = 'Аноним';

    socket.on('user joined', (username) => {
        currentUsername = username;
        socket.emit('chat history', messagesHistory);
        io.emit('system notification', `${currentUsername} присоединился к чату`);
    });

    socket.on('chat message', (data) => {
        const newMsg = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            username: data.username,
            text: data.text,
            reactions: { '👍': 0, '❤️': 0, '😂': 0 }
        };

        messagesHistory.push(newMsg);
        if (messagesHistory.length > 20) {
            messagesHistory.shift();
        }

        io.emit('chat message', newMsg);
    });

    socket.on('message reaction', (data) => {
        const msg = messagesHistory.find(m => m.id === data.msgId);
        if (msg) {
            msg.reactions[data.emoji] = (msg.reactions[data.emoji] || 0) + 1;
        }
        io.emit('message reaction', data);
    });

    socket.on('disconnect', () => {
        io.emit('system notification', `${currentUsername} покинул чат`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
