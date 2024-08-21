if (document.cookie.includes('username' || 'admin')) {
    window.location.href = 'homePage.html';
    window.alert("You are already logged in. Please log out to log in as an user.");
}