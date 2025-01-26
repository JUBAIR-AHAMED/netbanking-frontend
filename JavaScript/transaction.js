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
        const branchId = decodedToken.branchId;
        // Enable the input field for manual entry
        fromAccountInput.disabled = false;

        // Add event listener to fetch accounts dynamically as the user types
        fromAccountInput.addEventListener('input', async function () {
            const inputValue = fromAccountInput.value.trim();
            if (inputValue.length >= 3) { // Fetch matching accounts after 3+ characters
                try {
                    const criteria = { limit: 3, accountNumber: inputValue, searchSimilarFields: ["accountNumber"] };
                    if(role === 'EMPLOYEE'){
                        criteria.branchId = branchId;
                    }
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
                    if (data.status==200) {
                        if(Array.isArray(data.accounts)) {
                        displayAccountsDropdown(data.accounts, fromAccountDropdown);
                        } else {
                            fromAccountDropdown.innerHTML = '<li>No matching accounts found</li>';
                            fromAccountDropdown.style.display = 'block';
                        }
                    }
                } catch (error) {
                    console.error('Error fetching accounts:', error);
                }
            }
        });

        // Handle selecting an account from the dropdown
        fromAccountDropdown.addEventListener('click', function (event) {
            if (event.target.tagName === 'LI') {
                fromAccountInput.value = event.target.dataset.value;
                fromAccountDropdown.style.display = 'none'; // Hide the dropdown after selection
            }
        });
    } else if (role === 'CUSTOMER') {
        fromAccountInput.readOnly = true; // Disable manual typing for customers
    
        // Fetch and populate dropdown for customers on focus
        fromAccountInput.addEventListener('focus', async function () {
            try {
                const response = await fetch('http://localhost:8080/NetBanking/account', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`,
                        'action': 'GET'
                    }
                });
                const data = await response.json();
    
                if (data.status==200) {
                    if(Array.isArray(data.accounts)) {
                        displayAccountsDropdown(data.accounts, fromAccountDropdown);
                    } else {
                        console.error('No accounts found or error in response');
                        fromAccountDropdown.innerHTML = ''; // Clear existing options
                        const noAccountsItem = document.createElement('li');
                        noAccountsItem.textContent = 'No accounts available';
                        noAccountsItem.style.color = 'gray'; // Optional styling
                        fromAccountDropdown.appendChild(noAccountsItem);
                        fromAccountDropdown.style.display = 'block';
                    }
                }
            } catch (error) {
                console.error('Error fetching accounts:', error);
            }
        });
    
        // Handle selecting an account from the dropdown
        fromAccountDropdown.addEventListener('click', function (event) {
            if (event.target.tagName === 'LI') {
                fromAccountInput.value = event.target.dataset.value;
                fromAccountDropdown.style.display = 'none'; // Hide the dropdown after selection
            }
        });
    
        // Hide the dropdown when clicking outside
        document.addEventListener('click', function (event) {
            if (!fromAccountDropdown.contains(event.target) && event.target !== fromAccountInput) {
                fromAccountDropdown.style.display = 'none';
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
        const ifsc = document.getElementById('ifscCode');
        const bankName = document.getElementById('bankName');

        if (transactionType === 'other-bank') {
            console.log("Handling other-bank transaction");
            otherBankFields.classList.remove('hidden');
            ifsc.classList.add('required');
            bankName.classList.add('required');
            toAccountNumberField.classList.remove('hidden');
            toAccountNumberField.classList.add('required');
        } else if (transactionType === 'deposit' || transactionType === 'withdraw') {
            console.log("Handling deposit or withdraw transaction");
            otherBankFields.classList.add('hidden');
            toAccountNumberField.classList.remove('required');
            toAccountNumberField.classList.add('hidden');
            ifsc.classList.remove('required');
            bankName.classList.remove('required');
        } else if (transactionType === 'same-bank') {
            console.log("Handling same-bank transaction");
            otherBankFields.classList.add('hidden');
            toAccountNumberField.classList.add('required');
            toAccountNumberField.classList.remove('hidden');
            ifsc.classList.remove('required');
            bankName.classList.remove('required');
        } else {
            console.log("Unknown transaction type selected");
        }
    });

    
    
    document.getElementById("transactionForm").addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent default form submission behavior
    
        // Validation for required fields
        const requiredFields = document.querySelectorAll(".required");
        let isValid = true;
    
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add("error"); // Add error styling
                isValid = false;
            } else {
                field.classList.remove("error"); // Remove error styling if valid
            }
        });
    
        if (!isValid) {
            alert("Please fill out all required fields.");
            return; // Stop further execution if validation fails
        }
    
        // Proceed with form submission logic if validation passes
        const fromAccount = document.getElementById('fromAccountNumber').value || null;
        const toAccount = document.getElementById('toAccountNumber').value || null;
        const amount = document.getElementById('amount').value || null;
        const bankName = document.getElementById('bankName').value || null;
        const transactionType = document.getElementById('transactionType').value || null;
    
        try {
            const token = localStorage.getItem('jwt'); // Get the stored JWT token
    
            const response = await fetch('http://localhost:8080/NetBanking/transaction', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ fromAccount, toAccount, amount, bankName, transactionType })
            });
    
            const result = await response.json();
            if (result.status === 200) {
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
            listItem.textContent = `${account.accountNumber} - ${account.status}`;
            dropdownElement.appendChild(listItem);
        });
        dropdownElement.style.display = 'block'; // Show the dropdown
    }
});