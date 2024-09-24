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
      generate_message(botMessage, 'bot');
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
    generate_message(msg, 'self');
    sendMessageToBackend(msg);
  });

  // Function to generate message in chat
  function generate_message(msg, type) {
    INDEX++;
    // Avatar logic removed for bot as per new design
    var str = "";
    str += "<div id='cm-msg-" + INDEX + "' class=\"chat-msg " + type + "\">";
    if (type === 'user') {
      str += "          <span class=\"msg-avatar\">";
      str += "            <img src=\"images/user.png\">"; // User avatar remains
      str += "          <\/span>";
    }
    str += "          <div class=\"cm-msg-text\">";
    str += msg;
    str += "          <\/div>";
    str += "        <\/div>";
    
    $(".chat-logs").append(str);
    $("#cm-msg-" + INDEX).hide().fadeIn(300);

    if (type == 'self') {
      $("#chat-input").val('');
    }
    $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight }, 1000);
  }

  // Function to generate buttons (used for possible bot choices)
  function generate_button_message(msg, buttons) {
    INDEX++;
    var btn_obj = buttons.map(function(button) {
      return "              <li class=\"button\"><a href=\"javascript:;\" class=\"btn btn-primary chat-btn\" chat-value=\"" + button.value + "\">" + button.name + "<\/a><\/li>";
    }).join('');
    var str = "";
    str += "<div id='cm-msg-" + INDEX + "' class=\"chat-msg bot\">";
    str += "          <div class=\"cm-msg-text\">";
    str += msg;
    str += "          <\/div>";
    str += "          <div class=\"cm-msg-button\">";
    str += "            <ul>";
    str += btn_obj;
    str += "            <\/ul>";
    str += "          <\/div>";
    str += "        <\/div>";

    $(".chat-logs").append(str);
    $("#cm-msg-" + INDEX).hide().fadeIn(300);
    $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight }, 1000);
    $("#chat-input").attr("disabled", true);
  }

  // Click event for chat buttons (e.g., bot response options)
  $(document).delegate(".chat-btn", "click", function() {
    var value = $(this).attr("chat-value");
    var name = $(this).html();
    $("#chat-input").attr("disabled", false);
    generate_message(name, 'self');
  });

  // Function to end a session (reset chat)
  function endSession() {
    $(".chat-logs").empty();
    $("#chat-input").val('');
    $("#chat-input").attr("disabled", true);
    INDEX = 0;
  }

  // Open the chat box
  $("#chat-circle").click(function() {
    $("#chat-circle").toggle('scale');
    $(".chat-box").toggle('scale');
  });

  // Close the chat box and reset session
  $(".chat-box-toggle").click(function() {
    $("#chat-circle").toggle('scale');
    $(".chat-box").toggle('scale');
    endSession();  // End session on close
  });

  // End session when close button clicked
  $("#close-session").click(function() {
    endSession();
  });

  // Start a new session when chatbot is reopened
  $("#chat-circle").click(function() {
    startNewSession();
  });

  // Re-enable input for new session
  function startNewSession() {
    $("#chat-input").attr("disabled", false);
  }
});
