
$(function(){
    //make connection
    var socket = io.connect('http://localhost:3000')

    //buttons and inputs
    var message = $("#message")
    var username = $("#username")
    var send_message = $("#send_message")
    var send_username = $("#send_username")
    var chatroom = $("#chatroom")
    var feedback = $("#feedback")

    socket.on("pastMessages", (result) => {
        for (var i = 0; i < result.length; i++) {
            chatroom.append("<p class='message'>" + result[i].username + ": " + result[i].message + "</p>")

        }
    })

    //Emit message
    send_message.click(function(){
        socket.emit('new_message', {message : message.val()})
    })

    //Listen for new message
    socket.on("new_message", (data) => {
        feedback.html('');
        message.val('');
        if (data.username == username.val()) {
            chatroom.append("<p class='message' style = 'background-color:#972b45; color:white;'>" + data.username + ": " + data.message + "</p>")
        }
        else {
            chatroom.append("<p class='message'>" + data.username + ": " + data.message + "</p>")
        }
    })

    //Emit a username
    send_username.click(function(){
        socket.emit('change_username', {username : username.val()})
    })

    //Emit typing
    message.bind("keypress", () => {
        socket.emit('typing')
    })

    //Listen on typing
    socket.on('typing', (data) => {
        feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>")
    })

});

