function createBar(role) {
    let moreDropdown = '';
    
    if (role === "EMPLOYEE") {
        moreDropdown = `
            <div class="dropdown">
                <a href="#" class="dropbtn" id="moreDropdown">More</a>
                <div class="dropdown-content">
                    <a href="usermanager.html">Customers</a>
                    <a href="createaccount.html">Create Account</a>
                    <a href="createcustomer.html">Create Customer</a>
                </div>
            </div>
        `;
    } else if (role === "MANAGER") {
        moreDropdown = `
            <div class="dropdown">
                <a href="#" class="dropbtn" id="moreDropdown">More</a>
                <div class="dropdown-content">
                    <a href="customermanager.html">Customers</a>
                    <a href="employeemanager.html">Employee</a>
                    <a href="branchmanager.html">Branchs</a>
                    <a href="createemployee.html">Create Employee</a>
                    <a href="createbranch.html">Create Branch</a>
                    <a href="createaccount.html">Create Account</a>
                    <a href="createcustomer.html">Create Customer</a>
                </div>
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
        ${moreDropdown}
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
} else if (currentPage.includes('action.html') || currentPage.includes('createemployee.html') || 
currentPage.includes('createbranch.html') ||  currentPage.includes('createaccount.html')||
currentPage.includes('createcustomer.html')||currentPage.includes('branchmanager.html')||
currentPage.includes('branchmanager.html')||currentPage.includes('employeemanager.html')||currentPage.includes('customermanager.html')) {
    document.querySelector('.dropbtn').classList.add('active');
} 

function toggleDropdown() {
    window.location.href = 'profile.html'; 
}

document.addEventListener('DOMContentLoaded', function() {
    const dropdownButton = document.getElementById('moreDropdown');
    const dropdownContent = document.querySelector('.dropdown-content');

    if (dropdownButton && dropdownContent) {
        let isOpen = false;

        dropdownButton.addEventListener('click', function(e) {
            e.preventDefault();
            isOpen = !isOpen;
            dropdownContent.style.display = isOpen ? 'block' : 'none';
        });

        // Close the dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!dropdownButton.contains(e.target) && !dropdownContent.contains(e.target)) {
                isOpen = false;
                dropdownContent.style.display = 'none';
            }
        });
    }
});