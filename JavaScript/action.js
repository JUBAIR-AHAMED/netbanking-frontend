document.addEventListener('DOMContentLoaded', function(){
    const urlParams = new URLSearchParams(window.location.search);

    const accountNumber = urlParams.get('accountNumber');

    if (accountNumber) {
        document.getElementById('accountNumber').value = accountNumber;
    }
    
    try {
        const token = localStorage.getItem('jwt');
        if(!token) {
            // alert('You must be logged in to view this page.');
            window.location.href('/login.html');
            return;
        }
    } catch (error) {
        console.log(error);
    }
    document.getElementById('actionId').addEventListener('submit', async function(event){
        event.preventDefault();
    
        const accountNumber = document.getElementById("accountNumber").value;
        const actionType = document.getElementById("actionType").value;
    
        try{
            const token = localStorage.getItem('jwt')
            console.log(token)
            const response = await fetch('http://localhost:8080/NetBanking/action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({accountNumber, actionType})
            });
    
            const data = await response.json();
    
            if (data.status) {
                alert(data.message)
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error fetching statement:', error);
            alert('Failed to load statement. Please try again.');
        }
    })
})
