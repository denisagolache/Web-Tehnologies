
if (document.cookie.includes('username' || 'admin')) {
    window.location.href = 'homePage.html';
    window.alert("You are already logged in. Please log out to log in as an user.");
}

document.getElementById('login-form').addEventListener('submit', event => {
    event.preventDefault();

    console.log('Form submitted');
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    }).then(response => {
        if (response.status === 200) {
            if (rememberMe) {
                let date = new Date();
                date.setMonth(date.getMonth() + 1);
                document.cookie = `username=${username}; expires=${date.toUTCString()}; path=/`;
            } else {
                document.cookie = `username=${username}; path=/;`;
            }
            window.location.href = 'homePage.html';
        } else {
            response.json().then(data => {
                const errorDiv = document.getElementById('error-message');
                const errorMessage = document.createElement('p');
                errorMessage.textContent = "Invalid username or password. Please try again.";
                errorMessage.style.color = 'red';
                errorMessage.style.fontSize = '12px';
                errorMessage.style.fontWeight = 'bold';
                errorMessage.classList.add('fade-in');
                
                errorDiv.innerHTML = '';
                errorDiv.appendChild(errorMessage);

            });
        }
    });


});