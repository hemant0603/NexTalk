const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { chats } = require("./data/data");
const connectDB = require("./config/db");
const userRoutes = require("./Routes/userRoutes");
const chatRoutes = require('./Routes/chatRoutes');
const messageRoutes = require("./Routes/messageRoutes");
const bodyParser = require('body-parser');
const path = require('path');
const { notFound, errorHandler } = require("./Middleware/errorMiddleware");

const app = express();

dotenv.config();
connectDB();


app.use(cors({
    origin: "http://localhost:3000", 
}));


app.use(bodyParser.json());

app.get('/', (req,res) => {
    res.send("Hello Hemant");
})

app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)
app.use("/api/message", messageRoutes);

const _dirname1 = path.resolve();
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(_dirname1, '/client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(_dirname1, 'client', 'build', 'index.html'));
    })

} else {
    app.get('/', (req, res) => {
        res.send('API is running Successfully');
    });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
const server = app.listen(8080, () => console.log(`Server is running on port ${PORT}`));

const io = require('socket.io')(server, {
    pingTimeOut: 60000,
    cors: {
        origins: ["http://localhost:8080"]
    },
});

io.on('connection', (socket) => {
    console.log("Connected to Socket.io");

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });
   
    socket.on("join chat", (room) => {
        socket.join(room);
    });
    
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
    
    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;
        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user) => {
         
            if (user._id == newMessageRecieved.sender._id) return;
            socket.in(user._id).emit("message recieved", newMessageRecieved);

        });

    });

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });

});




