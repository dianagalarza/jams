const
    io = require("socket.io-client"),
    ioClient = io.connect("http://localhost:8000");
const readline = require('readline');
var async = require('async');
var message = new Object();
const r1 = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
async.series([
    (callback) => {
        r1.question("Set your username\n", (msg) => {
            console.log("Selected username: " + msg);
            ioClient.emit("createUser", msg);
            callback();// r1.close();
        });
    },
    (callback) => {
        var loop = function () {
            r1.question("Choose a command:\n1: See all users online \n2: Message a user\n", (msg) => {
                if (msg == 1) {
                    console.log("Here are the people online:");
                    ioClient.emit("listUsers");
                }
                else if (msg == 2) {
                    console.log("Which user will you message? (Type the number)");
                    ioClient.emit("listUsers");
                    r1.question("", (msg) => {
                        message.numberOnList = msg;
                        r1.question("What is your message?\n", (msg) => {
                            message.msg = msg;
                            ioClient.emit("message", message);
                            console.log("Message sent");
                        });
                    });
                }
                //ioClient.emit("hello", msg);
                setTimeout(function () {
                    loop();
                }, 5);
                // callback();
            });
        }
        loop();


    }
], () => {
    //r1.close();
});

//ioClient.on("seq-num", (msg) => console.info(msg));
ioClient.on("hello", (msg) => console.info("Server got your message: " + msg));
ioClient.on("listUsers", (msg) => console.info(msg));
ioClient.on("message", (msg) => console.info("Got message from '" + msg[0] + "' : " + msg[1]));
