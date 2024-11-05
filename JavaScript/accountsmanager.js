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
function createAccountCard(account) {
    const {
        accountNumber,
        balance,
        accountType,
        ifsc,
        dateOfOpening,
        name,
        branchId,
        address,
        status
    } = account;
    
    return `
        <div class="card">
            <div class="cardBody">
                <div>
                    <h3>Account Details</h3>
                    <div class="cardBodyItem"  class="card-number"><span>Account Number: </span>${formatAccountNumber(accountNumber)}</div>
                    <div class="cardBodyItem" ><span>Account Type: </span>${accountType}</div>
                    <div class="cardBodyItem" ><span>IFSC: </span>${ifsc}</div>
                    <div class="cardBodyItem" ><span>Date of Opening: </span>${formatDate(dateOfOpening)}</div>
                    <div class="cardBodyItem" ><span>Status: </span>${capitalizeFirstLetter(status)}</div>
                </div>
                <div>
                    <h3>Branch Details</h3>
                    <div class="cardBodyItem" ><span>Branch Id: </span>${branchId}</div>
                    <div class="cardBodyItem" ><span>Branch Name: </span>${name}</div>
                    <div class="cardBodyItem" ><span>Branch Address: </span>${address}</div >
                </div>
                <div style="width: 350px;">
                    <h3>Balance</h3>
                    <div class="cardBodyItem balance-amount">₹ ${formatIndianCurrency(balance)}</div>
                </div>
                <div class="card-footer">
                    <h3>Actions</h3>
                    <a href="statement.html?accountNumber=${accountNumber}" class="btn">Get Statement</a>
                    <a href="statement.html?accountNumber=${accountNumber}" class="btn">Block Or Delete</a>
                </div>
            </div>
        </div>
    `;
}

let index = 0

function formatAccountNumber(accountNumber) {
    accountNumber = String(accountNumber);
    return accountNumber.replace(/(.{4})/g, '$1 ').trim();
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

document.getElementById('searchForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    try {
        const token = localStorage.getItem('jwt'); // Get the stored JWT token
        if (!token) {
            window.location.href = "/login.html";
            return;
        }

        const accountNumber = document.getElementById('accountNumber').value;
        const searchCriteria = document.getElementById('searchCriteria').value; // Get selected option
        console.log(accountNumber);

        const response = await fetch(`http://localhost:8080/NetBanking/accounts?${searchCriteria}=${accountNumber}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        console.log(data);
        if (data.status) {
            if (Array.isArray(data.accounts)) {
                displayAccounts(data.accounts);
            } else {
                displayAccounts(null)
            }
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.log(error);
        alert("failed");
    }
});

function displayAccounts(accounts) {
    const accountsContainer = document.querySelector('.cardcontent');
    
    if (accounts == null || accounts.length === 0) {
        accountsContainer.innerHTML = "<p>No accounts found.</p>";
        return;
    }
    accountsContainer.innerHTML = ''
    accounts.forEach(account => {
        const accountHTML = createAccountCard(account);
        accountsContainer.insertAdjacentHTML('beforeend', accountHTML);
    });
    // document.querySelector('.pagebody').style.paddingTop = "10px"; 
}

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
