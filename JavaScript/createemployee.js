document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('createEmployeeForm');

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const formData = {
            username: document.getElementById('name').value,
            password: document.getElementById('password').value,
            email: document.getElementById('email').value,
            mobile: document.getElementById('mobile').value,
            dateOfBirth: document.getElementById('dob').value,
            branchId: document.getElementById('branchId').value || null,
            role: document.getElementById('role').value,
            status: document.getElementById('status').value // Added status field
        };

        try {
            const token = localStorage.getItem('jwt');
            const response = await fetch('http://localhost:8080/NetBanking/createEmployee', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.status) {
                alert('Employee created successfully!');
                alert('Employee Id is '+result.employeeId);
                form.reset();
            } else {
                alert(result.message || 'Failed to create employee.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while creating the employee.');
        }
    });
    
    const roleElement = document.getElementById('role');
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

