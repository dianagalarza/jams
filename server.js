//this link has all the emit stuff thatll probably help a lot:
// https://socket.io/docs/emit-cheatsheet/
const
    io = require("socket.io"),
    server = io.listen(8000);
let
    sequenceNumberByClient = new Map();
var usernames = [];

// event fired every time a new client connects:
server.on("connection", (socket) => {
    console.info(`Client connected [id=${socket.id}]`);
    // initialize this client's sequence number
    sequenceNumberByClient.set(socket, 1);

    // when socket disconnects, remove it from the list:
    socket.on("disconnect", () => {
        sequenceNumberByClient.delete(socket);
        console.info(`Client gone [id=${socket.id}], username ` + getClientUsername(socket.id));
    });
    socket.on("hello", (msg) => {
        console.log("client " + socket.id + " said " + msg);
        socket.emit("hello", msg);
    });
    socket.on("createUser", (msg) => {
        console.log("client " + socket.id + "has chosen username: " + msg);
        usernames.push([socket.id, msg ]);
    });
    socket.on("listUsers", (msg) => {
        console.log("User with username '" + getClientUsername(socket.id) + "' has requested usernameList");
        for (var i = 0; i < usernames.length; i++)
        {
            socket.emit("listUsers", "User #" + i + ": " + usernames[i][1]);
        }
    });
    socket.on("message", (msg) => {
        console.log("User with username '" + getClientUsername(socket.id) + "' sends message '" + msg.msg + "' to user with username '" + usernames[msg.numberOnList][1] + "'");
        server.to(usernames[msg.numberOnList][0]).emit('message', [getClientUsername(socket.id), msg.msg]);

    });
});
function getClientUsername(id)  {
    for (var i = 0; i < usernames.length; i++) {
        if (usernames[i][0] == id) {
            return usernames[i][1];
        }

    }
}
// sends each client its current sequence number
setInterval(() => {
    for (const [client, sequenceNumber] of sequenceNumberByClient.entries()) {
        client.emit("seq-num", sequenceNumber);
        sequenceNumberByClient.set(client, sequenceNumber + 1);
    }
}, 1000);