function createBar(profileName) {
    return `
            <div>
                <a href="accounts.html" id="accountLink">Account</a>
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

// Apply the 'active' class based on the current page
if (currentPage.includes('accounts.html')) {
    accountLink.classList.add('active');
} else if (currentPage.includes('transaction.html')) {
    transactionLink.classList.add('active');
} else if (currentPage.includes('statement.html')) {
    statementLink.classList.add('active');
}