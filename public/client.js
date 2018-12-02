const
    io = require("socket.io-client"),
    ioClient = io.connect("http://0.0.0.0:1234");//make sure this is the same in server.js
const readline = require('readline');//needed for CLI
var async = require('async');// needed for CLI
var message = new Object();//objects are kinda like mini classes in javascript 
//the message object specifies the username to send the message to and the actual message contents
const r1 = readline.createInterface({//random stuff needed for typing inputs for the CLI
    input: process.stdin,
    output: process.stdout
});
async.series([
    (callback) => {
        r1.question("Set your username\n", (msg) => {//r1.question is like c++'s cin where msg is the input
            console.log("Selected username: " + msg);
            ioClient.emit("createUser", msg);//emit a "createUser" request to the server with username as the msg
            callback();// needed for CLI
        });
    },
    (callback) => {
        var loop = function () {
            r1.question("Choose a command:\n1: See all users online \n2: Message a user\n", (msg) => {
                if (msg == 1) {
                    console.log("Here are the people online:");
                    ioClient.emit("listUsers");//sends a request to the server requesting the names of everyone online
                }
                else if (msg == 2) {
                    console.log("Which user will you message? (Type the number)");
                    ioClient.emit("listUsers");
                    r1.question("", (msg) => {
                        message.numberOnList = msg;//in JS, you can easily add attributes to objects well after you initialize the object
                        r1.question("What is your message?\n", (msg) => {
                            message.msg = msg;
                            ioClient.emit("message", message);//sends a request to the server to message another user
                            console.log("Message sent");
                        });
                    });
                }
                setTimeout(function () {//there needs to be a little delay because the "Choose a command" prompt comes faster than the "listerUsers" request
                    loop();
                }, 5);//delay is in millis
            });
        }
        loop();


    }
], () => {
});

ioClient.on("listUsers", (msg) => console.info(msg)); //gets user list from server
ioClient.on("message", (msg) => console.info("Got message from '" + msg[0] + "' : " + msg[1]));//gets another user's DM from server
