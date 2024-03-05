$(document).ready(function () {
  const $chatMessages = $("#chat-messages");
  const $userInput = $("#user-input");
  const $sendButton = $("#send-button");
  const $apiInput = $("#api-key");
  const modelList = ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"];
  const $modelSelector = $("#model-selector");
  let modelSelection = modelList[0];

  let messagesArry = [];

  populateModels();
  $modelSelector.on("change", (event) => {
    modelSelection = event.target.value;
    console.log("Model changed to " + modelSelection);
  });

  class Message {
    role;
    content;
  }

  $sendButton.click(function () {
    const userMessage = $userInput.val().trim();

    if (userMessage) {
      // Append the user"s message to the chat interface
      appendMessage("user", userMessage);

      // Clear the user input field
      $userInput.val("");

      sendAPIRequest();
    }
  });

  function populateModels() {
    modelList.forEach((model) => {
      let option = document.createElement("option");
      option.id, (option.text = model);

      $modelSelector.append(option);
    });
  }
  function appendMessage(sender, message) {
    // Define classes for the chat bubble appearance
    const userMessageClass =
      "bg-blue-400 text-white rounded-lg rounded-br-none";
    const otherMessageClass =
      "bg-green-400 text-white rounded-lg rounded-bl-none";

    // Determine the alignment and bubble color based on the sender
    const messageAlignmentClass =
      sender === "user"
        ? `text-right ${userMessageClass}`
        : `text-left ${otherMessageClass}`;

    let escapedMessage = marked.parse(message);
    if (sender === "user") {
      escapedMessage = escapeHtml(message);
    }

    // Create the chat bubble element
    let messageHTML = `
        <div class="flex ${
          sender === "user" ? "justify-end" : "justify-start"
        } my-2">
            <div class="${messageAlignmentClass} px-4 py-2 max-w-4xl break-words">
                ${escapedMessage}
            </div>
        </div>
    `;
    if (sender !== "user") {
      const modelInfoHTML = `
          <div class="text-xs text-gray-500 text-left mt-1 ml-2">
              Using model: ${modelSelection}
          </div>
      `;
      messageHTML += modelInfoHTML;
    }

    // Create a message object and add it to our array
    let thisMessage = new Message();
    thisMessage.role = sender;
    thisMessage.content = message;
    if (sender !== "webclient") {
      messagesArry.push(thisMessage);
    }

    // Add the element we just made to the chatMessages div
    $chatMessages.append(messageHTML);

    // Scroll to the bottom of the chat container to show the latest message
    $chatMessages.scrollTop($chatMessages[0].scrollHeight);
  }

  function escapeHtml(text) {
    const element = document.createElement("div");
    element.innerText = text;
    return element.innerHTML;
  }

  function sendAPIRequest() {
    const apiKey = localStorage.getItem("api_key");
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    if (apiKey != null || apiKey !== "") {
      const requestData = {
        model: "gpt-3.5-turbo",
        //we send in the message history
        messages: messagesArry,
        temperature: 0.7,
      };
      //Jquery AJAX xmlhttprequest
      $.ajax({
        type: "POST",
        url: apiUrl,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        data: JSON.stringify(requestData),
        success: function (data) {
          //on success, append the response to the messages
          const chatGptResponse = data.choices[0].message.content;
          appendMessage("assistant", chatGptResponse);
        },
        error: function (error) {
          console.error("API Request Error:", error);
          appendMessage(
            "webclient",
            "Please enter a valid api key in the settings tab"
          );
        },
      });
    } else {
      appendMessage(
        "webclient",
        "Please enter a valid api key in the settings tab"
      );
    }
  }
  // Click event for the "Save API Key" button
  $("#save-api-key").click(function () {
    const apiKey = $apiInput.val().trim();

    if (apiKey) {
      // Save the API key to localStorage
      localStorage.setItem("api_key", apiKey);
      console.log("saved api key");
    } else {
      // Handle the case where the API key is empty or invalid
    }
  });

  $("#download-conversation").click(function () {
    // messagesArry is assumed to be an array containing the conversation messages

    // Convert the messages array to a JSON string
    let txt = JSON.stringify(messagesArry);

    // Create a Blob with the JSON data
    const blob = new Blob([txt], { type: "text/plain" });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a hidden anchor element for downloading
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "conversation.txt";

    // Append the anchor to the body and trigger the download
    document.body.appendChild(a);
    a.click();

    // Clean up by removing the anchor and revoking the URL
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});
