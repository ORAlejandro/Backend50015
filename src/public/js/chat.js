const socket = io(); 
let user; 
const chatBox = document.getElementById("chatBox");

Swal.fire({
    title: "Identificate", 
    input: "text",
    text: "Como te llamaremos en el chat?", 
    inputValidator: (value) => {
        return !value && "Para ingresar al chat es obligatorio tener un nombre"
    }, 
    allowOutsideClick: false,
}).then( result => {
    user = result.value;
})


chatBox.addEventListener("keyup", (event) => {
    if(event.key === "Enter") {
        //Verifico que el texto sea mayor a cero caracteres antes de enviarlo al chat
        if(chatBox.value.trim().length > 0) {
            socket.emit("message", {user: user, message: chatBox.value}); 
            chatBox.value = "";
        }
    }
})

//Listener de Mensajes
socket.on("message", data => {
    let log = document.getElementById("messagesLogs");
    let messages = "";

    data.forEach( message => {
        messages = messages + `${message.user} dice: ${message.message} <br>`
    })

    log.innerHTML = messages;
})