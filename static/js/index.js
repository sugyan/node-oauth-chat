$(function() {
    SessionWebSocket(function(socket) {
        socket.on('message', function(msg) {
            var messages = $('#messages');
            messages.prepend($('<dd>')
                             .append($('<span>').addClass('username').text(msg.user))
                             .append($('<span>').addClass(msg.type + ' message').text(msg.message)));
            messages.prepend($('<dt>').text(msg.date));
        });
        $('#message_form').submit(function(form) {
            var textfield = $(this).find('#textfield');
            if (! textfield.val()) return false;

            socket.send(textfield.val());
            textfield.val('');
            return false;
        });
    });
});
