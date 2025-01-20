document.getElementById('signout').addEventListener('click', async function() {
    try {
        // Retrieve the JWT token from local storage
        const token = localStorage.getItem("jwt");

        // Fetch profile data from the server
        const response = await fetch('http://localhost:8080/NetBanking/logout', {
            method: "PUT",
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        // Parse response data
        const data = await response.json();

        // If response is OK, render the profile data
        if (response.ok) {
            localStorage.removeItem('jwt');
            window.location.href = '/login.html';
        } else {
            throw error("Logout operation failed.");
        }
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
});
