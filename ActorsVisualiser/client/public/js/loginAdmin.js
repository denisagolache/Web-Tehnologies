
if (document.cookie.includes('username' || 'admin')) {
    window.location.href = 'homePage.html';
    window.alert("You are already logged in. Please log out to log in as an admin.");
}

document.getElementById('login-admin-form').addEventListener('submit', event => {
    event.preventDefault();

    console.log('Form submitted');
    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;
    const key = document.getElementById('key').value;
   
    fetch('http://localhost:3001/api/login/admin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, password, key })
    }).then(response => {
        if (response.status === 200) {
            document.cookie = `admin=${name}; path=/`;
            window.location.href = 'homePage.html';
        } else {
            response.json().then(data => {
                const errorDiv = document.getElementById('error-message');
                const errorMessage = document.createElement('p');
                errorMessage.textContent = "Invalid name, password or key. Please try again.";
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