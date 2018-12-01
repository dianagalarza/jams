//this link has all the emit stuff thatll probably help a lot:
// https://socket.io/docs/emit-cheatsheet/
const
    io = require("socket.io")
let
    sequenceNumberByClient = new Map();//idk what this does
var usernames = [];//array for all users online
http = require('http');
var server = http.createServer();//http based server (aka ip addresses)
server.listen(1234, '0.0.0.0');//make sure this is the same in client.js
var socketServer = io.listen(server);//server constantly awaits requests from clients
socketServer.on("connection", (socket) => {//server can interact with a client when it actually connects
    console.info(`Client connected [id=${socket.id}]`);
    // initialize this client's sequence number (idk what this means it came with the tutorial I found)
    sequenceNumberByClient.set(socket, 1);

    // when socket disconnects, remove it from the list:
    socket.on("disconnect", () => {
        sequenceNumberByClient.delete(socket);
        console.info(`Client gone [id=${socket.id}], username ` + getClientUsername(socket.id));
    });
    //add new user to username list
    socket.on("createUser", (msg) => {
        console.log("client " + socket.id + "has chosen username: " + msg);
        usernames.push([socket.id, msg ]);
    });
    //send list of usernames to clients who request it
    socket.on("listUsers", (msg) => {
        console.log("User with username '" + getClientUsername(socket.id) + "' has requested usernameList");
        for (var i = 0; i < usernames.length; i++)
        {
            socket.emit("listUsers", "User #" + i + ": " + usernames[i][1]);
        }
    });
    //send DM's to users
    socket.on("message", (msg) => {
        console.log("User with username '" + getClientUsername(socket.id) + "' sends message '" + msg.msg + "' to user with username '" + usernames[msg.numberOnList][1] + "'");
        socketServer.to(usernames[msg.numberOnList][0]).emit('message', [getClientUsername(socket.id), msg.msg]);

    });
});
function getClientUsername(id)  {//cross references client id's (which we don't choose) with chosen usernames
    for (var i = 0; i < usernames.length; i++) {
        if (usernames[i][0] == id) {
            return usernames[i][1];
        }

    }
}
// sends each client its current sequence number (this came with the tutorial idk what it does)
setInterval(() => {
    for (const [client, sequenceNumber] of sequenceNumberByClient.entries()) {
        client.emit("seq-num", sequenceNumber);
        sequenceNumberByClient.set(client, sequenceNumber + 1);
    }
}, 1000);