const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const chatbotToggler = document.querySelector("#chatbot-toggler");



// API setup 
const API_KEY ="AIzaSyD--XI1P65svoHB4W6mxPSLR24-mWk0yoc";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const  userData ={
    message : null,
    file:{
        data:null,
        mime_type:null
    }
}
const chatHistory = [];
// create message element with dynamic classes and return it 
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes) ;
    div.innerHTML = content ;
    console.log(div);
    return div;
}
// generate bot response using api 
const generateBotResponse = async(incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");
    
    chatHistory.push({
        role: "user",
        parts:[{text: userData.message }, ...(userData.file.data ? [{inline_data: userData.file}] : [])]
        });
   

// API request options 
const requestOptions = {
  method : "POST",
  headers : {"Content-Type": "application/json"},
  body: JSON.stringify({
    contents:chatHistory
    
  })
}

    try {
       const response = await  fetch(API_URL, requestOptions);
   const data = await response.json();
       if(!response.ok) throw new Error(data.error.message);

// extract and display bot's response text  
       const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
       messageElement.innerText = apiResponseText;
       chatHistory.push({
        role:"model",
        parts:[{text: apiResponseText }]
    } );
} catch (error) {
        // handle error in api response 
       console.log(error);
       messageElement.innerText = error.message;
       messageElement.style.color = "#ff0000";

    }
    finally{
        // reset user's file data , removing thinking indicator and scroll chat to bottom 
        userData.file = {};
        incomingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo({top: chatBody.scrollHeight, behavior: "smooth"});

    }
}


// handle outgoing user message 

const  handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();
    messageInput.value = "";

    // create and display user message 
    const messageContent = `    <div class="message-text"></div>  
                             ${userData.file.data ? `<img src ="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment"/>`:""} `;
    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").textContent =  userData.message;
   chatBody.appendChild(outgoingMessageDiv);
   chatBody.scrollTo({top: chatBody.scrollHeight, behavior: "smooth"});

// simulate bot response with thinking indicator after a delay 

   setTimeout(() => {


    const messageContent = ` <img  class="bot-avatar" src="message.png" width="50" height="50"></img>
            <div class="message-text">
                <div class="thinking-indicator">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    
                </div>
            </div>  `;
    const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
   chatBody.appendChild(incomingMessageDiv);
   chatBody.scrollTo({top: chatBody.scrollHeight, behavior: "smooth"});

   generateBotResponse (incomingMessageDiv);
   }, 600);
}
// handle enter key press for sending message 
messageInput.addEventListener("keydown", (e) =>{
    const userMessage = e.target.value.trim();
    if(e.key === "Enter" && userMessage){
        handleOutgoingMessage(userMessage);
    }
});



   
sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));

