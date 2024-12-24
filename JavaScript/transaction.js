function decodeJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Invalid token', e);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);

    const accountNumber = urlParams.get('accountNumber');

    if (accountNumber) {
        document.getElementById('fromAccountNumber').value = accountNumber;
    }

    const jwtToken = localStorage.getItem('jwt');
    const decodedToken = decodeJWT(jwtToken);
    const role = decodedToken ? decodedToken.role : null;

    try{
        const token = localStorage.getItem('jwt');
        if (!token) {
            // alert('You must be logged in to view this page.');
            window.location.href = "/login.html";
            return;
        }
    } catch (error) {
        console.log(error)
    }

    const transactionTypeSelect = document.getElementById('transactionType');

    if (role === 'EMPLOYEE' || role === 'MANAGER') {
        const depositOption = document.createElement('option');
        depositOption.value = 'deposit';
        depositOption.textContent = 'Deposit';
        transactionTypeSelect.appendChild(depositOption);

        const withdrawOption = document.createElement('option');
        withdrawOption.value = 'withdraw';
        withdrawOption.textContent = 'Withdraw';
        transactionTypeSelect.appendChild(withdrawOption);
    }

    document.getElementById('transactionType').addEventListener('change', function(event) {
        const transactionType = event.target.value;
        const otherBankFields = document.getElementById('otherBankFields');
        const toAccountNumberField = document.getElementById('toAccountNumber');
        const toAccountNumberFieldLabel = document.getElementById('toAccountNumberLabel');
        const fromAccountNumberFieldLabel = document.getElementById('fromAccountNumberLabel');

        if (transactionType === 'other-bank') {
            otherBankFields.classList.remove('hidden');
            toAccountNumberField.classList.remove('hidden');
            toAccountNumberFieldLabel.classList.remove('hidden');
            fromAccountNumberFieldLabel.textContent = "Sender Account Number"
        } else if (transactionType === 'deposit' || transactionType === 'withdraw') {
            otherBankFields.classList.add('hidden');
            toAccountNumberField.classList.add('hidden');
            toAccountNumberFieldLabel.classList.add('hidden');
            fromAccountNumberFieldLabel.textContent = "Account Number"
        } else if(transactionType === 'same-bank'){
            otherBankFields.classList.add('hidden');
            toAccountNumberField.classList.remove('hidden');
            toAccountNumberFieldLabel.classList.remove('hidden');
            fromAccountNumberFieldLabel.textContent = "Sender Account Number"
        }
    });

    document.getElementById('transactionForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        let fromAccount = document.getElementById('fromAccountNumber').value || null;
        let toAccount = document.getElementById('toAccountNumber').value || null;
        let amount = document.getElementById('amount').value || null;
        let bankName = document.getElementById('bankName').value || null;
        let transactionType = document.getElementById('transactionType').value || null;

        console.log(fromAccount);
        try {
            const token = localStorage.getItem('jwt'); // Get the stored JWT token

            const response = await fetch('http://localhost:8080/NetBanking/transaction', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({fromAccount, toAccount, amount, bankName, transactionType})
            });

            const result = await response.json();
            if (result.status) {
                alert("Transaction Success");
                window.location.reload();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error during transaction:', error);
            alert('An error occurred during transaction. Please try again.');
        }
    });
});