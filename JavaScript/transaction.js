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

document.addEventListener('DOMContentLoaded', async function () {
    const jwtToken = localStorage.getItem('jwt');
    const decodedToken = decodeJWT(jwtToken);
    const role = decodedToken ? decodedToken.role : null;

    const fromAccountInput = document.getElementById('fromAccountNumber');
    const fromAccountDropdown = document.getElementById('fromAccountDropdown');

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

    if (role === 'EMPLOYEE' || role === 'MANAGER') {
        // Enable the input field for manual entry
        fromAccountInput.disabled = false;

        // Add event listener to fetch accounts dynamically as the user types
        fromAccountInput.addEventListener('input', async function () {
            const inputValue = fromAccountInput.value.trim();
            if (inputValue.length >= 3) { // Fetch matching accounts after 3+ characters
                try {
                    const criteria = { limit: 3, accountNumber: inputValue, searchSimilar: true };
                    const url = new URL('http://localhost:8080/NetBanking/account');
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${jwtToken}`,
                            'action': 'GET'
                        },
                        body: JSON.stringify(criteria)
                    });

                    const data = await response.json();
                    if (data.status && Array.isArray(data.accounts)) {
                        displayAccountsDropdown(data.accounts, fromAccountDropdown);
                    } else {
                        fromAccountDropdown.innerHTML = '<li>No matching accounts found</li>';
                        fromAccountDropdown.style.display = 'block';
                    }
                } catch (error) {
                    console.error('Error fetching accounts:', error);
                }
            } else {
                fromAccountDropdown.style.display = 'none'; // Hide dropdown if input length < 3
            }
        });

        // Handle selecting an account from the dropdown
        fromAccountDropdown.addEventListener('click', function (event) {
            if (event.target.tagName === 'LI') {
                fromAccountInput.value = event.target.dataset.value;
                fromAccountDropdown.style.display = 'none'; // Hide the dropdown after selection
            }
        });
    } else {
        fromAccountInput.disabled = true;
    }

    document.getElementById('transactionType').addEventListener('change', function(event) {
        const transactionType = event.target.value;
        console.log("Selected Transaction Type:", transactionType); // Debugging
        const otherBankFields = document.getElementById('otherBankFields');
        const toAccountNumberField = document.getElementById('toAccountNumber');
        const fromAccountNumberFieldLabel = document.getElementById('fromAccountNumberLabel');
    
        if (transactionType === 'other-bank') {
            console.log("Handling other-bank transaction");
            otherBankFields.classList.remove('hidden');
            toAccountNumberField.classList.remove('hidden');
            toAccountNumberField.classList.add('required');
            fromAccountNumberFieldLabel.textContent = "Sender Account Number";
        } else if (transactionType === 'deposit' || transactionType === 'withdraw') {
            console.log("Handling deposit or withdraw transaction");
            otherBankFields.classList.add('hidden');
            toAccountNumberField.classList.remove('required');
            toAccountNumberField.classList.add('hidden');
            fromAccountNumberFieldLabel.textContent = "Account Number";
        } else if (transactionType === 'same-bank') {
            console.log("Handling same-bank transaction");
            otherBankFields.classList.add('hidden');
            toAccountNumberField.classList.add('required');
            toAccountNumberField.classList.remove('hidden');
            fromAccountNumberFieldLabel.textContent = "Sender Account Number";
        } else {
            console.log("Unknown transaction type selected");
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
    
    function displayAccountsDropdown(accounts, dropdownElement) {
        dropdownElement.innerHTML = ''; // Clear existing options
        accounts.forEach(account => {
            const listItem = document.createElement('li');
            listItem.dataset.value = account.accountNumber;
            listItem.textContent = `${account.accountNumber} - ${account.accountType}`;
            dropdownElement.appendChild(listItem);
        });
        dropdownElement.style.display = 'block'; // Show the dropdown
    }
});



document.getElementById('toAccountNumber').addEventListener('input', function(event) {
    const input = event.target;
    // Allow only numbers and restrict the input to 16 digits.
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 16);
});



// document.addEventListener('DOMContentLoaded', function() {
//     const urlParams = new URLSearchParams(window.location.search);

//     const accountNumber = urlParams.get('accountNumber');

//     if (accountNumber) {
//         document.getElementById('fromAccountNumber').value = accountNumber;
//     }

//     const jwtToken = localStorage.getItem('jwt');
//     const decodedToken = decodeJWT(jwtToken);
//     const role = decodedToken ? decodedToken.role : null;

//     try{
//         const token = localStorage.getItem('jwt');
//         if (!token) {
//             // alert('You must be logged in to view this page.');
//             window.location.href = "/login.html";
//             return;
//         }
//     } catch (error) {
//         console.log(error)
//     }

//     const transactionTypeSelect = document.getElementById('transactionType');

//     if (role === 'EMPLOYEE' || role === 'MANAGER') {
//         const depositOption = document.createElement('option');
//         depositOption.value = 'deposit';
//         depositOption.textContent = 'Deposit';
//         transactionTypeSelect.appendChild(depositOption);

//         const withdrawOption = document.createElement('option');
//         withdrawOption.value = 'withdraw';
//         withdrawOption.textContent = 'Withdraw';
//         transactionTypeSelect.appendChild(withdrawOption);
//     }

    
// });