document.addEventListener('DOMContentLoaded', function() {
    fetchUsers();
});

function fetchUsers() {
    fetch('http://localhost:3001/api/users')
        .then(response => response.json())
        .then(users => {
            const tbody = document.querySelector('#userTable tbody');
            tbody.innerHTML = ''; // Clear existing rows
            users.forEach(user => {
                const row = document.createElement('tr');

                const idCell = document.createElement('td');
                idCell.textContent = user.userid;
                row.appendChild(idCell);

                const nameCell = document.createElement('td');
                nameCell.textContent = user.username;
                row.appendChild(nameCell);

                const emailCell = document.createElement('td');
                emailCell.textContent = user.email;
                row.appendChild(emailCell);

                const actionsCell = document.createElement('td');
                
                // Delete button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.onclick = function() {
                    deleteUser(user.userid);
                };
                actionsCell.appendChild(deleteButton);

                // Change Password button
                const changePasswordButton = document.createElement('button');
                changePasswordButton.textContent = 'Change Password';
                changePasswordButton.classList.add('change-password-btn');
                changePasswordButton.onclick = function() {
                    changePassword(user.userid);
                };
                actionsCell.appendChild(changePasswordButton);

                row.appendChild(actionsCell);

                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });
}

function deleteUser(userId) {
    fetch(`http://localhost:3001/api/user/${userId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (response.ok) {
            fetchUsers(); // Refresh the list of users
        } else {
            console.error('Error deleting user');
        }
    })
    .catch(error => {
        console.error('Error deleting user:', error);
    });
}

function changePassword(userId) {
    const newPassword = prompt('Enter new password:');
    if (newPassword) {
        fetch(`http://localhost:3001/api/user/password/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password: newPassword })
        })
        .then(response => {
            if (response.ok) {
                alert('Password changed successfully');
            } else {
                console.error('Error changing password');
            }
        })
        .catch(error => {
            console.error('Error changing password:', error);
        });
    }
}
