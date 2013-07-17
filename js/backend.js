///// presence
  var name = prompt("Your name?", "Guest"), currentStatus = "online";
 // Get a reference to the presence data in Firebase.
  var userListRef = new Firebase("https://sketchdaily.firebaseio.com/users");

  // Generate a reference to a new location for my user with push.
  var myUserRef = userListRef.push();

  // Get a reference to my own presence status.
  var connectedRef = new Firebase("http://sketchdaily.firebaseIO.com/.info/connected");
  connectedRef.on("value", function(isOnline) {
    if (isOnline.val()) {
      // If we lose our internet connection, we want ourselves removed from the list.
      myUserRef.onDisconnect().remove();

      // Set our initial online status.
      setUserStatus("online");
    } else {

      // We need to catch anytime we are marked as offline and then set the correct status. We
      // could be marked as offline 1) on page load or 2) when we lose our internet connection
      // temporarily.
      setUserStatus(currentStatus);
    }
  });
    function setUserStatus(status) {
      // Set our status in the list of online users.
      currentStatus = status;
      myUserRef.set({ name: name, status: status });
    }

    userListRef.on("child_added", function(snapshot) {
      var user = snapshot.val();
      $("#userlist").append("<li id=" + snapshot.name() +">" + user.name + "</li>");
      //$("canvas.can:first-child").clone().appendTo("#wrapper").addClass("layer id"+ snapshot.name());
    });

    userListRef.on("child_removed", function(snapshot) {
      $("#" + snapshot.name()).remove();
     // $("."+ snapshot.name()).remove();
    });



/////chat
// Get a reference to the root of the chat data.
  var messagesRef = new Firebase('https://sketchdaily.firebaseio.com/messages');

  // When the user presses enter on the message input, write the message to firebase.
  $('#messageInput').keypress(function (e) {
    if (e.keyCode == 13) {
      var text = $('#messageInput').val();
      messagesRef.push({name:name, text:text});
      $('#messageInput').val('');
    }
  });

  // Add a callback that is triggered for each chat message.
  messagesRef.limit(10).on('child_added', function (snap) {
    var message = snap.val();
    $('<div/>').text(message.text).prepend($('<em/>')
      .text(message.name+': ')).appendTo($('#messagesDiv'));
    $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
  });