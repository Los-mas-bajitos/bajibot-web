function login(){
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    let data = {
        username: username,
        password: password
    }

    console.log(data);

    fetch('https://bajibot-backend.onrender.com/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.status)
        if(data.status === 200){
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

    fetch('https://bajibot-backend.onrender.com/user/insert', {
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

    let endpoint = 'https://bajibot-backend.onrender.com/chat';

    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let formattedMessage = formatResponse(data.response);
            appendMessage('bot: ' + formattedMessage, 'bot');
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

function formatResponse(response) {
    console.log(JSON.stringify(response));
    if (response.ingredients) {
        return formatRecipeResponse(response);
    } else if (Array.isArray(response) && response[0].description) {
        return formatRecommendationResponse(response);
    } else {
        return formatCommonResponse(response);
    }
}

function formatCommonResponse(response) {
    return response.message;
}

function formatRecommendationResponse(recommendations) {
    let stringBuilder = "";
    recommendations.forEach(recommendation => {
        console.log(recommendation);
        stringBuilder += `Nombre: ${recommendation.recipe_name}`;
        stringBuilder += `\n`;
        stringBuilder += `Descripcion:${recommendation.description}`;
        stringBuilder += `\n`;
    });
    return stringBuilder;
}

function formatRecipeResponse(response) {
    let stringBuilder = `Nombre: ${response.recipe_name}\nIngredientes:\n`;
    response.ingredients.forEach(ingredient => {
        stringBuilder += `${ingredient}\n`;
    });
    stringBuilder += `\nInstrucciones:\n`;
    response.instructions.forEach(instruction => {
        stringBuilder += `${instruction}\n`;
    });
    return stringBuilder;
}

function returnToLogin() {
    window.location.href = "index.html";
}