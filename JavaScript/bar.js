function createBar(profileName) {
    return `
            <div>
                <a href="" id="accountLink">Account</a>
            </div>
            <div>
                <a href="transaction.html" id="transactionLink">Transaction</a>
            </div>
            <div>
                <a href="statement.html" id="statementLink">Statement</a>
            </div>

    `;  
}

const profileName = "Jubair Ahamed"

const barContainer = document.querySelector('.bar');

const barHtml = createBar(profileName)

barContainer.innerHTML += barHtml

const currentPage = window.location.pathname;

const accountLink = document.getElementById('accountLink');
const transactionLink = document.getElementById('transactionLink');
const statementLink = document.getElementById('statementLink');

const token = localStorage.getItem('jwt');
let role = null;

if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    role = payload.role;
}

if (role === 'CUSTOMER') {
    accountLink.href = '/accounts.html';
} else if(role === 'EMPLOYEE'||role === 'MANAGER'){
    accountLink.href = '/accountsmanager.html';
}



// Apply the 'active' class based on the current page
if (currentPage.includes('accounts.html')) {
    accountLink.classList.add('active');
} else if (currentPage.includes('transaction.html')) {
    transactionLink.classList.add('active');
} else if (currentPage.includes('statement.html')) {
    statementLink.classList.add('active');
}