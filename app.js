
$(document).ready(function () {
    const $chatMessages = $("#chat-messages");
    const $userInput = $("#user-input");
    const $sendButton = $("#send-button");
    const $apiInput = $("#api-key");
    let messagesArry = [];
    class Message{
        role
        content
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

    function appendMessage(sender, message) {
        //if sender is user then the text is blue, if not its green
        const messageClass = sender === "user" ? "text-right text-blue-400" : "text-left text-green-400";
        //create the element
        let messageHTML = '';
            // If no triple backticks found, render it as a regular message
            messageHTML = `
            <div class="${messageClass}">${escapeHtml(message)}</div>
        `;

        //create a message and add it to our array
        let thisMessage = new Message();
        thisMessage.role = sender;
        thisMessage.content = message;
        if(sender !== "webclient"){
            messagesArry.push(thisMessage);
        }

        //add the element we just made to the chatMessages div
        $chatMessages.append(messageHTML);

        // Scroll to the bottom of the chat container to show the latest message
        $chatMessages.scrollTop($chatMessages[0].scrollHeight);
    }
    function escapeHtml(text) {
        const element = document.createElement('div');
        element.innerText = text;
        return element.innerHTML;
    }
    function sendAPIRequest() {
        const apiKey = localStorage.getItem("api_key");
        //const apiKey = "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"; // Replace with your actual API key
        const apiUrl = "https://api.openai.com/v1/chat/completions"; // Replace with the appropriate API endpoint
        if(apiKey!=null || apiKey!==""){
        const requestData = {
            model: "gpt-3.5-turbo",
            //we send in the message history
            messages: messagesArry,
            "temperature": 0.7
        };
        //Jquery AJAX xmlhttprequest
        $.ajax({
            type: "POST",
            url: apiUrl,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            data: JSON.stringify(requestData),
            success: function (data) {
                //on success, append the response to the messages
                const chatGptResponse = data.choices[0].message.content;
                appendMessage("assistant", chatGptResponse);
            },
            error: function (error) {
                console.error("API Request Error:", error);
                appendMessage("webclient", "Please enter a valid api key in the settings tab");
            }
        });
        }else{
            appendMessage("webclient", "Please enter a valid api key in the settings tab");
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



