function createBar(role) {
    let actionDivision = '';
    
    if (role === "EMPLOYEE" || role === "MANAGER") {
        actionDivision = `
            <div>
                <a href="action.html" id="actionLink">Action</a>
            </div>
        `;
    }

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
        ${actionDivision}
    `;
}

const barContainer = document.querySelector('.bar');
const token = localStorage.getItem('jwt');
let role = null;

if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    role = payload.role;
}

const barHtml = createBar(role);
barContainer.innerHTML += barHtml;

const accountLink = document.getElementById('accountLink');
const transactionLink = document.getElementById('transactionLink');
const statementLink = document.getElementById('statementLink');
const actionLink = document.getElementById('actionLink');

if (role === 'CUSTOMER') {
    accountLink.href = '/accounts.html';
} else if (role === 'EMPLOYEE' || role === 'MANAGER') {
    accountLink.href = '/accountsmanager.html';
}

const currentPage = window.location.pathname;
if (currentPage.includes('accounts.html') || currentPage.includes('accountsmanager.html')) {
    accountLink.classList.add('active');
} else if (currentPage.includes('transaction.html')) {
    transactionLink.classList.add('active');
} else if (currentPage.includes('statement.html')) {
    statementLink.classList.add('active');
} else if (currentPage.includes('action.html')) {
    actionLink.classList.add('active');
}

function toggleDropdown() {
    window.location.href = 'profile.html'; 
}
