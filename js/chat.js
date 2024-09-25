$(function() { 
  var INDEX = 0;

  // Function to send message to the backend (OpenAI API)
  async function sendMessageToBackend(message) {
    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }

      const data = await response.json();
      const botMessage = data.choices[0].message.content.trim();
      generate_message(botMessage, 'bot');  // Generate bot message
    } catch (error) {
      console.error('Error sending message to backend:', error);
    }
  }

  // Click event for submitting user messages
  $("#chat-submit").click(function(e) {
    e.preventDefault();
    var msg = $("#chat-input").val();
    if (msg.trim() == '') {
      return false;
    }
    generate_message(msg, 'user'); // Changed to 'user' for consistency
    sendMessageToBackend(msg);
  });

  // Function to generate messages in the chat
  function generate_message(msg, type) {
    INDEX++;
    var str = "";
    str += "<div id='cm-msg-" + INDEX + "' class=\"chat-msg " + type + "\">";
    
    if (type === 'user') {
      // Include the avatar only for user messages
      str += "  <span class=\"msg-avatar\">";
      // str += "    <img src=\"images/user.png\">";  // Avatar for user
      str += "  </span>";
    }
    
    str += "  <div class=\"cm-msg-text\">";
    str += msg;
    str += "  </div>";
    str += "</div>";

    $(".chat-logs").append(str);
    $("#cm-msg-" + INDEX).hide().fadeIn(300);

    if (type == 'user') {
      $("#chat-input").val('');  // Clear the input field for user messages
    }

    // Auto-scroll to the bottom for new messages
    $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight }, 1000);
  }

  // Function to generate button messages (for bot responses with options)
  function generate_button_message(msg, buttons) {
    INDEX++;
    var btn_obj = buttons.map(function(button) {
      return "              <li class=\"button\"><a href=\"javascript:;\" class=\"btn btn-primary chat-btn\" chat-value=\"" + button.value + "\">" + button.name + "<\/a><\/li>";
    }).join('');

    var str = "";
    str += "<div id='cm-msg-" + INDEX + "' class=\"chat-msg bot\">";
    str += "  <div class=\"cm-msg-text\">";
    str += msg;
    str += "  </div>";
    str += "  <div class=\"cm-msg-button\">";
    str += "    <ul>";
    str += btn_obj;
    str += "    </ul>";
    str += "  </div>";
    str += "</div>";

    $(".chat-logs").append(str);
    $("#cm-msg-" + INDEX).hide().fadeIn(300);
    $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight }, 1000);
    $("#chat-input").attr("disabled", true);  // Disable input while bot options are available
  }

  // Handle clicks on bot response buttons
  $(document).delegate(".chat-btn", "click", function() {
    var value = $(this).attr("chat-value");
    var name = $(this).html();
    $("#chat-input").attr("disabled", false);  // Re-enable input after button click
    generate_message(name, 'user');  // Display the selected option as user message
  });

  // Function to end a session (reset chat)
  function endSession() {
    $(".chat-logs").empty();  // Clear chat logs
    $("#chat-input").val('');  // Clear input field
    $("#chat-input").attr("disabled", true);  // Disable input
    INDEX = 0;  // Reset message index
  }

  // Open and close the chatbox with animation
  $("#chat-circle").click(function() {
    $("#chat-circle").toggle('scale');
    $(".chat-box").toggle('scale');
    startNewSession();  // Start a new session when the chatbox is opened
  });

  // Close the chat box and reset session on toggle button click
  $(".chat-box-toggle").click(function() {
    $("#chat-circle").toggle('scale');
    $(".chat-box").toggle('scale');
    endSession();  // End the session on close
  });

  // Start a new session by enabling input and resetting conditions
  function startNewSession() {
    $("#chat-input").attr("disabled", false);  // Re-enable input for new session
  }
});
