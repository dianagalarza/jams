const express = require('express')
const app = express()
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/jams";
MongoClient.connect(url, function (err, db) {
    if (err) throw err;

    var dbo = db.db("jams");
    dbo.createCollection("pastMessages", function (err, res) {
        if (err) throw err;
        console.log("Collection created!");
        db.close();
    });
});

//set the template engine ejs
app.set('view engine', 'ejs')

//middlewares
app.use(express.static('public'))


//routes
app.get('/', (req, res) => {
    res.render('index')
})

//Listen on port 3000
server = app.listen(3000)



//socket.io instantiation
const io = require("socket.io")(server)


//listen on every connection
io.on('connection', (socket) => {
    console.log('New user connected')
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("jams");
        dbo.collection("pastMessages").find({}).toArray(function (err, result) {
            if (err) throw err;
            console.log(result);
            db.close();
            socket.emit("pastMessages", result);
        });
    });
    //default username
    socket.username = "Anonymous"

    //listen on change_username
    socket.on('change_username', (data) => {
        socket.username = data.username
    })

    //listen on new_message
    socket.on('new_message', (data) => {
        //broadcast the new message
        io.sockets.emit('new_message', { message: data.message, username: socket.username });
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("jams");
            var myobj = { message: data.message, username: socket.username };
             dbo.collection("pastMessages").insertOne(myobj, function (err, res) {
                 if (err) throw err;
                 console.log("1 document inserted");
                 db.close();
             });
        });
    })

    //listen on typing
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', { username: socket.username })
    })
})