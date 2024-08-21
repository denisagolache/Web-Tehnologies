function logoutUserCookie() {
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.reload();
}   

function logoutAdminCookie() {
    document.cookie = "admin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.reload();
}
const manageUsers = document.getElementById('manageUsers');
const login = document.getElementById('login');
const loginAdmin = document.getElementById('loginAdmin');
const register = document.getElementById('register');
const logoutUser = document.getElementById('logoutUser');
const logoutAdmin = document.getElementById('logoutAdmin');
const addActor = document.getElementById('add-actor');
const addToFavorites = document.getElementById('add-to-favorites');
const favoriteButton = document.getElementById('favorites-button');

if (document.cookie.includes('username')) {
    console.log('User is logged in');
    manageUsers.style.display = 'none';
    login.style.display = 'none';
    loginAdmin.style.display = 'none';
    register.style.display = 'none';
    logoutUser.style.display = '';
    logoutAdmin.style.display = 'none';
    addActor.style.display = 'none';
    addToFavorites.style.display = '';
    favoriteButton.style.display = '';
} else if(document.cookie.includes('admin')){
    console.log('Admin is logged in');
    manageUsers.style.display = '';
    login.style.display = 'none';
    loginAdmin.style.display = 'none';
    register.style.display = 'none';
    logoutUser.style.display = 'none';
    logoutAdmin.style.display = '';
    addActor.style.display = '';
    addToFavorites.style.display = 'none';
    favoriteButton.style.display = 'none';
} else {
    console.log('Enter as a guest');
    manageUsers.style.display = 'none';
    login.style.display = '';
    loginAdmin.style.display = '';
    register.style.display = '';
    logoutUser.style.display = 'none';
    logoutAdmin.style.display = 'none';
    addActor.style.display = 'none';
    addToFavorites.style.display = 'none';
    favoriteButton.style.display = 'none';
}

