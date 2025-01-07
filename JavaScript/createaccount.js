document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('createAccountForm');

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const formData = {
            userId: document.getElementById('userId').value,
            branchId: document.getElementById('branchId').value,
            accountType: document.getElementById('accountType').value,
            balance: document.getElementById('balance').value,
            status: document.getElementById('status').value
        };

        try {
            const token = localStorage.getItem('jwt');
            const response = await fetch('http://localhost:8080/NetBanking/account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.status) {
                alert('Account created successfully!');
                form.reset();
            } else {
                alert(result.message || 'Failed to create account.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while creating the account.');
        }
    });

    const roleElement = document.getElementById('accountType');
    roleElement.addEventListener('change', function() {
        if (this.value) {
            this.classList.add('selected');
        } else {
            this.classList.remove('selected');
        }
    });
    
    const statusElement = document.getElementById('status');
    statusElement.addEventListener('change', function() {
        if (this.value) {
            this.classList.add('selected');
        } else {
            this.classList.remove('selected');
        }
    });
});