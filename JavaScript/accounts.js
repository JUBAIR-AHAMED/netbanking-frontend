validate()
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

let accounts = null;
function createAccountCard(accountNumber, balance, accountType, ifsc, dateOfOpening) {
    dateOfOpening = formatDate(dateOfOpening);
    accountNumber = formatAccountNumber(accountNumber); // Format the account number
    return `
        <div class="contents">
            <div class="card">
                <div class="cardbankname">
                    BOU
                </div>
                <span class="cardnumber">${accountNumber}</span>
                <div class="balance-info">
                    <div class="balance">
                        <span>Balance</span>
                        <span class="balancerupee">₹ ${formatIndianCurrency(balance)}</span>
                    </div>
                    <div class="dateOfOpening">
                        <span>Date Of Creation</span>
                        <span class="date">${dateOfOpening}</span>
                    </div>
                </div>
            </div>
        </div>
`;
}

function createStatement(transactionId, accountNumber, amount, balance, time) {
    if(accountNumber == null)
    {
        accountNumber = amount > 0 ? "Deposit" : "Withdraw"
    }
    return `
        <div class="valueColumn">
            <div class="columnValues">${transactionId}</div>
            <div class="columnValues">${accountNumber}</div>
            <div class="columnValuesRightAlign">₹ ${formatIndianCurrency(amount)} ${getTransactionNature(amount)}</div>
            <div class="columnValuesRightAlign">₹ ${formatIndianCurrency(balance)}</div>
            <div class="columnValues">${formatDate(time)}</div>
        </div>
    `
}

let index = 0
// function decrementIndex()
// {
//     console.log(index)
//     index = index -1

// }
// const prevDiv = document.getElementById(".prev")
// prevDiv.addEventListener("click", decrementIndex())

function formatAccountNumber(accountNumber) {
    accountNumber = String(accountNumber);
    return accountNumber.replace(/(.{4})/g, '$1 ').trim();
}

function getTransactionNature(amount)
{
    const isNegative = amount < 0;
    return isNegative? `DR.`:`CR.`
}


function capitalizeFirstLetter(str) {
    if (!str) return str; // Return if the string is empty
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
}

function formatIndianCurrency(amount) {
    const isNegative = amount < 0;

    const absoluteAmount = Math.abs(amount);

    const [integerPart, decimalPart = ''] = absoluteAmount.toString().split('.');

    const formattedDecimalPart = decimalPart.padEnd(2, '0').slice(0, 2)
    const lastThreeDigits = integerPart.slice(-3);
    const otherDigits = integerPart.slice(0, -3);
    const formattedIntegerPart = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + (otherDigits ? ',' : '') + lastThreeDigits;

    const formattedAmount = `${formattedIntegerPart}.${formattedDecimalPart}`;

    return formattedAmount;
}

// Function to fetch account data from the server
async function fetchAccounts() {
    try {
        const token = localStorage.getItem('jwt'); // Get the stored JWT token
        const decodedToken = decodeJWT(token)
        if (!token) {
            window.location.href = "/login.html";
            return;
        }
        
        const role = decodedToken ? decodedToken.role : null;
        if(role !== "CUSTOMER") {
            window.location.href = "/accountsmanager.html"
        }
        console.log(role)

        const response = await fetch('http://localhost:8080/NetBanking/accounts', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

        if (data.status) {
            if(Array.isArray(data.accounts))
            {
                accounts = data.accounts
            } else {
                accounts=null;
            }
            displayAccounts(index);
        } else {
            alert(data.message);
            window.location.href = "/login.html"; // Redirect to login if unauthorized
        }
    } catch (error) {
        console.error('Error fetching accounts:', error);
        alert('Failed to load accounts. Please try again.');
    }
}

async function validate() {
    try {
        const token = localStorage.getItem('jwt'); // Get the stored JWT token
        const decodedToken = decodeJWT(token)
        if (!token) {
            window.location.href = "/login.html";
            return;
        }
        
        const role = decodedToken ? decodedToken.role : null;
        if(role !== "CUSTOMER") {
            window.location.href = "/accountsmanager.html"
        }
    } catch(error) {
        console.error('Error validating:', error);
        alert('Failed to validate.');
    }
}

async function fetchStatement(accountNumber) {
    const limit = 7
    try {
        const token = localStorage.getItem('jwt')
        const response = await fetch('http://localhost:8080/NetBanking/statement', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ accountNumber, limit })
        });

        const data = await response.json();

        if (data.status) {
            if (Array.isArray(data.statement)) {
                displayStatement(data.statement);
            } else {
                displayStatement(null);
            }
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error fetching statement:', error);
        alert('Failed to load statement. Please try again.');
    }
}

function displayAccounts(index) {
    const accountsContainer = document.querySelector('.cardcontent');

    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');

    prevButton.style.visibility = index > 0 ? 'visible' : 'hidden';
    nextButton.style.visibility = index < accounts.length - 1 ? 'visible' : 'hidden';

    if (accounts==null||accounts.length === 0) {
        accountsContainer.innerHTML = "<p>No accounts found.</p>";
        return;
    }
    const accountHTML = createAccountCard(
        accounts[index].accountNumber,
        accounts[index].balance,
        accounts[index].accountType,
        accounts[index].ifsc,
        accounts[index].dateOfOpening
    );
    accountsContainer.innerHTML = accountHTML;
    fetchStatement(accounts[index].accountNumber)
}

function displayStatement(statement) {
    const statementContainer = document.querySelector('#statementInsert');

    if (!statementContainer) {
        console.error("Element with id 'statementInsert' not found in the DOM.");
        return;
    }

    if (statement===null||statement.length === 0) {
        statementContainer.innerHTML = "<p style=\"padding: 10px; font-size: 20px; color: darkred;\">No statement found.</p>";
        return;
    }

    statementContainer.innerHTML = ''; // Clear previous content

    statement.forEach(statement => {
        let statementHTML = createStatement(
            statement.referenceNumber,
            statement.transactionAccount,
            statement.transactionAmount,
            statement.balance,
            statement.timestamp
        );

        statementContainer.insertAdjacentHTML('beforeend', statementHTML);
    });
}


document.getElementById('prev').addEventListener('click', () => {
    if (index > 0) {
        index--;
        displayAccounts(index);
    }
});

document.getElementById('next').addEventListener('click', () => {
    if (index < accounts.length - 1) {
        index++;
        displayAccounts(index);
    }
});


document.addEventListener('DOMContentLoaded', fetchAccounts);

function toggleDropdown() {
    const dropdown = document.getElementById("profileDropdown");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

document.addEventListener("click", function(event) {
    const dropdown = document.getElementById("profileDropdown");
    if (!event.target.closest(".profileimg")) {
        dropdown.style.display = "none";
    }
});