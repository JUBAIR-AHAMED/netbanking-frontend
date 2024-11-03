document.getElementById('signout').addEventListener('click', function() {
    localStorage.removeItem('jwt');
    window.location.href = '/login.html';
});
