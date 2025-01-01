document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('createBranchForm');

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const formData = {
            name: document.getElementById('name').value,
            ifsc: document.getElementById('ifsc').value,
            address: document.getElementById('address').value,
            employeeId: document.getElementById('employeeId').value
        };

        try {
            const token = localStorage.getItem('jwt');
            const response = await fetch('http://localhost:8080/NetBanking/branch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.status) {
                alert('Branch created successfully!');
                form.reset();
            } else {
                alert(result.message || 'Failed to create branch.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while creating the branch.');
        }
    });
});