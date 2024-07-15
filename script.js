function login(){
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    data={
        username: username,
        password: password
    }

    console.log(data);

    fetch('http://localhost:5000/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.status)
        if(data.status == 200){
            alert(data.message);
            localStorage.setItem('token', data.token);
            window.location.href = "chatbot.html";
        } else {
            alert(data.message);
        }
    }) 
    .catch((error) => {console.error('Error:', error);})

}

function register() {
    var username = document.getElementById("register-username").value;
    var password = document.getElementById("register-password").value;
    var confirmPassword = document.getElementById("register-password-confirm").value;

    if (password !== confirmPassword) {
        console.error('Error: Passwords do not match.');
        return;
    }

    var data = {
        username: username,
        password: password
    };

    console.log(data);

    fetch('http://localhost:5000/user/insert', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 200) {
            showLogin();
        } else {
            console.error('Error:', data.message);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function showLogin() {
    document.getElementById('isLogin').style.display = 'block';
    document.getElementById('isRegister').style.display = 'none';
}

function showRegister() {
    document.getElementById('isLogin').style.display = 'none';
    document.getElementById('isRegister').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('user-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

function sendMessage() {
    var userInput = document.getElementById('user-input').value;
    if (!userInput.trim()) {
        return;
    }
    
    appendMessage('me: ' + userInput, 'user');
    document.getElementById('user-input').value = '';

    var data = {
        message: userInput
    };

    fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            console.log(data.response);
            appendMessage('bot: '+data.response.message, 'bot');
        } else {
            appendMessage('Error: ' + data.error, 'bot');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        appendMessage('Error: ' + error.message, 'bot');
    });
}

function appendMessage(message, sender) {
    var chatBody = document.getElementById('chat-body');
    var messageDiv = document.createElement('div');
    messageDiv.className = 'message ' + sender;
    messageDiv.textContent = message;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function returnToLogin() {
    window.location.href = "index.html";
}