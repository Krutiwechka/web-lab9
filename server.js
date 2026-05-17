const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ['websocket']
});
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/chat', (req, res) => {
    const username = req.query.username || 'Аноним';
    res.render('chat', { username });
});

io.on('connection', (socket) => {
    
    socket.on('chat message', (data) => {
        io.emit('chat message', {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            username: data.username,
            text: data.text
        });
    });

    socket.on('message reaction', (data) => {
        io.emit('message reaction', data);
    });

});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
