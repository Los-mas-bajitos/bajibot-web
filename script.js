let usuario = Object();

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
            usuario = data.user;
            console.log(data);
            localStorage.setItem('user', JSON.stringify(usuario));
            window.location.href = "chatbot.html";
        } else {
            alert(data.message);
        }
    }) 
    .catch((error) => {console.error('Error:', error);})

}

function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;
    const favoriteCuisine = document.getElementById('favorite-cuisine').value;
    const diet = document.getElementById('diet').value;
    const allergies = document.getElementById('allergies').value;
    const preferredMealTime = document.getElementById('preferred-meal-time').value;

    if (password !== passwordConfirm) {
        alert('Las contraseñas no coinciden.');
        return;
    }

    const preferences = {
        favorite_cuisine: favoriteCuisine,
        diet: diet,
        allergies: allergies.split(',').map(allergy => allergy.trim()),
        preferred_meal_time: preferredMealTime
    };

    const user = {
        username: username,
        password: password,
        preferences: preferences
    };

    // Lógica para enviar los datos al servidor
    fetch('https://bajibot-backend.onrender.com/user/insert', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Usuario registrado exitosamente');
                // Redirigir o mostrar mensaje de éxito
            } else {
                alert('Error en el registro: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error en el registro');
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
    const userInput = document.getElementById('user-input').value;
    if (!userInput.trim()) {
        return;
    }

    appendMessage('me: ' + userInput, 'user');
    document.getElementById('user-input').value = '';

    const data = {
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
    const chatBody = document.getElementById('chat-body');
    const messageDiv = document.createElement('div');
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

function displayRecommendations() {
    let endpoint = 'https://bajibot-backend.onrender.com/recommendations';

    usuario = JSON.parse(localStorage.getItem('user'));

    let message = `Dame una lista de 4 recomendaciones de recetas, tengo estas alergias: `;
    for (let allergy of usuario.preferences.allergies) {
        message += `${allergy}`;
    }
    message += ` tengo un gusto por la comida ${usuario.preferences.favorite_cuisine}`;
    message += ` y tengo una dieta ${usuario.preferences.diet}`;

    let data = {
        message: message
    }

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
            let recipes = data.response;
            const recipeList = document.getElementById('recipe-list');
            console.log(recipes);
            recipes.forEach(recipe => {
                const recipeItem = document.createElement('div');
                recipeItem.className = 'list-group-item';
                recipeItem.innerHTML = `<h5>${recipe.recipe_name}</h5><p>${recipe.description}</p>`;
                recipeList.appendChild(recipeItem);
            });
        } else {
            console.log('Error:', data.error);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

document.getElementById('show-recommendations-btn').addEventListener('click', function() {
    toggleView('recommendations');
    displayRecommendations();
});


function toggleView(view) {
    const recommendations = document.getElementById('recommendations');
    const chatBox = document.getElementById('chat-box');
    const showRecommendationsBtn = document.getElementById('show-recommendations-btn');
    const showChatBtn = document.getElementById('show-chat-btn');

    if (view === 'recommendations') {
        recommendations.style.display = 'block';
        chatBox.style.display = 'none';
        showRecommendationsBtn.style.display = 'none';
        showChatBtn.style.display = 'block';
    } else if (view === 'chat') {
        recommendations.style.display = 'none';
        chatBox.style.display = 'block';
        showRecommendationsBtn.style.display = 'block';
        showChatBtn.style.display = 'none';
    }
}