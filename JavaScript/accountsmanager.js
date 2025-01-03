// // Function to decode JWT token and extract role and branchId
function decodeJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload); // Return the decoded token payload
    } catch (e) {
        console.error('Invalid token', e);
        return null;
    }
}

function showAccountDetails(account) {
    const modal = document.getElementById("accountModal");
    const modalContent = document.getElementById("modalContent");
    console.log(account)
    // Format account details
    modalContent.innerHTML = `
        <p><strong>Account Number:</strong> ${account.accountNumber}</p>
        <p><strong>Account Type:</strong> ${account.accountType}</p>
        <p><strong>Balance:</strong> ${formatIndianCurrency(account.balance)}</p>
        <p><strong>Date of Opening:</strong> ${formatDate(account.dateOfOpening)}</p>
        <p><strong>Account Holder:</strong> ${account.name}</p>
        <p><strong>Branch ID:</strong> ${account.branchId}</p>
        <p><strong>Status:</strong> ${account.status}</p>
    `;

    // Show the modal
    modal.style.display = "block";
}

function showBranchDetails(branch) {
    console.log(branch)
    const modal = document.getElementById("branchModal");
    const modalContent = document.getElementById("branchModalContent");

    // Format branch details
    modalContent.innerHTML = `
        <p><strong>Branch ID:</strong> ${branch[0].branchId}</p>
        <p><strong>Branch Name:</strong> ${branch[0].name}</p>
        <p><strong>Address:</strong> ${branch[0].address}</p>
        <p><strong>IFSC:</strong> ${branch[0].ifsc}</p>
        <p><strong>Manager ID:</strong> ${branch[0].employeeId}</p>
    `;

    // Show the modal
    modal.style.display = "block";
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

    // Get the JWT token and decode it to get role and branchId
    const token = localStorage.getItem('jwt');
    const decodedToken = decodeJWT(token);

    const userRole = decodedToken?.role;  // Extract user role (e.g., 'MANAGER' or 'EMPLOYEE')
    const userBranchId = decodedToken?.branchId;  // Extract user branchId

    // Determine if the "Actions" section should be displayed
    let actionsContent = '';
    if (userRole === 'MANAGER') {
        actionsContent = `
            <h3>Actions</h3>
            <a href="statement.html?accountNumber=${accountNumber}" class="btn">Get Statement</a>
            <a href="transaction.html?accountNumber=${accountNumber}" class="btn">Make Transaction</a>
            <a href="action.html?accountNumber=${accountNumber}" class="btn">Block Or Delete</a>
        `;
    } else if (userRole === 'EMPLOYEE') {
        if (userBranchId === branchId) {
            actionsContent = `
                <h3>Actions</h3>
                <a href="statement.html?accountNumber=${accountNumber}" class="btn">Get Statement</a>
                <a href="transaction.html?accountNumber=${accountNumber}" class="btn">Make Transaction</a>
                <a href="action.html?accountNumber=${accountNumber}" class="btn">Block Or Delete</a>
            `;
        } else {
            actionsContent = `
            <div style="width: 240px; color: crimson;">
            <h2 style="font-size: larger;">You cannot perform any actions in this account.</h2>
            </div>`;
        }
    }

    return `
        <div class="valueColumn">
            <div class="columnValues accValue">
                ${accountNumber}
                <div class="more" style="position: fixed; z-index: 2; width: 17%; align-self: center; cursor: pointer; justify-items: flex-end;" data-account='${JSON.stringify(account)}'>
                    <img class="eye-logo-acc more" src="icons/eye-svgrepo-com.svg" alt="view icon" data-account='${JSON.stringify(account)}'>
                </div>
            </div>
            <div class="columnValues">${accountType}</div>
            <div class="columnValues branchValue">
                ${branchId}
                <div class="moreBranch" style="position: fixed; z-index: 2; width: 17%; align-self: center; cursor: pointer; justify-items: flex-end;" data-branch='${JSON.stringify(account)}'>
                    <img class="eye-logo-branch moreBranch" src="icons/eye-svgrepo-com.svg" alt="view icon" data-branch='${JSON.stringify(account)}'>
                </div>
            </div>
            <div class="columnValues" style="display: flex;">${status}
            </div>
        </div>
    `;
}


function viewDetails(accountNumber){
    console.log(accountNumber)
}

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

    const formattedDecimalPart = decimalPart.padEnd(2, '0').slice(0, 2);
    const lastThreeDigits = integerPart.slice(-3);
    const otherDigits = integerPart.slice(0, -3);
    const formattedIntegerPart = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + (otherDigits ? ',' : '') + lastThreeDigits;

    const formattedAmount = `${formattedIntegerPart}.${formattedDecimalPart}`;

    return formattedAmount;
}

document.addEventListener('DOMContentLoaded', function () {
    let currentPage = 1; // Current page
    const limit = 8; // Items per page
    let totalPages = 1; // Total pages will be calculated later
    let searchCriteria = {}; 

    const debounce = (func, delay) => {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    const debouncedSearch = debounce(handleRealTimeSearch, 300);

    const accountNumberField = document.getElementById('accountNumber');
    const userIdField = document.getElementById('userId');
    const branchIdField = document.getElementById('branchId');

    accountNumberField.addEventListener('input', debouncedSearch);
    userIdField.addEventListener('input', debouncedSearch);
    branchIdField.addEventListener('input', debouncedSearch);

    async function handleRealTimeSearch() {
        const accountNumber = document.getElementById('accountNumber').value.trim();
        const userId = document.getElementById('userId').value.trim();
        const branchId = document.getElementById('branchId').value.trim();

        // Set search criteria
        searchCriteria = { accountNumber, userId, branchId };

        // Fetch total count and accounts
        await fetchTotalCount(searchCriteria);
        await fetchAccounts();
    }


    // Function to fetch total count based on search criteria
    async function fetchTotalCount(criteria) {
        try {
            const token = localStorage.getItem('jwt');
            const url = new URL('http://localhost:8080/NetBanking/accounts');
            url.searchParams.append('count', 'true');
            if (criteria.accountNumber) url.searchParams.append('accountNumber', criteria.accountNumber);
            if (criteria.userId) url.searchParams.append('userId', criteria.userId);
            if (criteria.branchId) url.searchParams.append('branchId', criteria.branchId);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.status) {
                const totalCount = data.count || 0; // Total accounts count
                totalPages = Math.ceil(totalCount / limit); // Calculate total pages
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error fetching total count:', error);
            alert('Failed to load total count. Please try again.');
        }
    }

    // Function to fetch accounts for the current page
    async function fetchAccounts() {
        try {
            const token = localStorage.getItem('jwt');
            if (!token) {
                window.location.href = "/login.html";
                return;
            }

            const url = new URL('http://localhost:8080/NetBanking/accounts');
            url.searchParams.append('currentPage', currentPage);
            url.searchParams.append('limit', limit);
            if (searchCriteria.accountNumber) url.searchParams.append('accountNumber', searchCriteria.accountNumber);
            if (searchCriteria.userId) url.searchParams.append('userId', searchCriteria.userId);
            if (searchCriteria.branchId) url.searchParams.append('branchId', searchCriteria.branchId);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.status) {
                if (Array.isArray(data.accounts)) {
                    displayAccounts(data.accounts);
                } else {
                    displayAccounts(null);
                }
                updatePaginationControls();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
            alert("Failed to retrieve accounts.");
        }
    }

    async function fetchUserData(userId) {
        try {
            const token = localStorage.getItem('jwt');
            if (!token) {
                window.location.href = "/login.html";
                return;
            }

            const url = new URL('http://localhost:8080/NetBanking/user');
            url.searchParams.append('userId', userId);
            url.searchParams.append('userType', 'customer');
            url.searchParams.append('moreDetails', false);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            if (data.status) {
                return data.users
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
            alert("Failed to retrieve accounts.");
        }
    }

    // Function to display accounts in the UI
    function displayAccounts(accounts) {
        const accountsContainer = document.querySelector('.accountInsert');

        if (!accounts || accounts.length === 0) {
            accountsContainer.innerHTML = "<p>No accounts found.</p>";
            return;
        }

        accountsContainer.innerHTML = ''; // Clear previous accounts
        accounts.forEach(account => {
            const accountHTML = createAccountCard(account);
            accountsContainer.insertAdjacentHTML('beforeend', accountHTML);
        });
    }

    // Function to update pagination controls
    function updatePaginationControls() {
        const paginationContainer = document.getElementById('paginationControls');
        if (!paginationContainer) {
            const cardContentDiv = document.querySelector('.accountInsert');
            const controlsDiv = document.createElement('div');
            controlsDiv.id = 'paginationControls';
            controlsDiv.style.display = 'flex';
            controlsDiv.style.justifyContent = 'center';
            controlsDiv.style.marginTop = '20px';
            cardContentDiv.parentElement.appendChild(controlsDiv);
        }

        paginationContainer.innerHTML = `
            <button id="prevPage" ${currentPage === 1 ? 'disabled' : ''}>Prev</button>
            <span style="margin: 0 15px;">Page ${currentPage} of ${totalPages}</span>
            <button id="nextPage" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
        `;

        document.getElementById('prevPage').addEventListener('click', function () {
            if (currentPage > 1) {
                currentPage--;
                fetchAccounts();
            }
        });

        document.getElementById('nextPage').addEventListener('click', function () {
            if (currentPage < totalPages) {
                currentPage++;
                fetchAccounts();
            }
        });
    }

    // Event listener for the search form
    document.getElementById('searchForm').addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent default form submission
    
        // Get the input values
        const accountNumber = document.getElementById('accountNumber').value.trim();
        const userId = document.getElementById('userId').value.trim();
        const branchId = document.getElementById('branchId').value.trim();
    
        // Validation: At least one input must be provided
        if (!accountNumber && !userId && !branchId) {
            alert("Please enter at least one search criterion.");
            return;
        }
    
        try {
            // Set the search criteria
            searchCriteria.accountNumber = accountNumber;
            searchCriteria.userId = userId;
            searchCriteria.branchId = branchId;
    
            // Reset to the first page
            currentPage = 1;
    
            // Fetch total count and accounts
            await fetchTotalCount(searchCriteria);
            await fetchAccounts();
        } catch (error) {
            console.error('Error during search:', error);
            alert("Failed to retrieve accounts. Check console for details.");
        }
    });
    

    // Initialize with no filters (default behavior)
    async function initialize() {
        try {
            const token = localStorage.getItem('jwt'); // Get the stored JWT token
            if (!token) {
                window.location.href = "/login.html";
                return;
            }
    
            const decodedToken = decodeJWT(token); // Decode the JWT token
            const branchId = decodedToken?.branchId; // Extract the branchId
    
            if (!branchId) {
                alert("Branch ID not found in token.");
                return;
            }
    
            // Set the initial search criteria to the branchId
            searchCriteria = { branchId };
    
            // Fetch total count and accounts based on the branchId
            await fetchTotalCount(searchCriteria);
            await fetchAccounts();
        } catch (error) {
            console.error('Error during initialization:', error);
            alert("Failed to initialize accounts. Please check the console for details.");
        }
    }
    initialize();

    // Function to create modal and add the event listener for closing the modal
    function createModal() {
        // Create modal HTML structure
        const modalHTML = `
            <div id="accountModal" class="modal">
                <div class="modal-content">
                    <span class="close-button" id="closeModal">&times;</span>
                    <h2>Account Details</h2>
                    <div id="modalContent"></div>
                </div>
            </div>
        `;

        // Append the modal HTML to the body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add event listener for closing the modal
        document.getElementById("closeModal").addEventListener("click", function() {
            const modal = document.getElementById("accountModal");
            modal.style.display = "none";
        });
    }

    function createBranchModal() {
        // Create modal HTML structure
        const modalHTML = `
            <div id="branchModal" class="modal">
                <div class="modal-content">
                    <span class="close-button" id="closeModalBranch">&times;</span>
                    <h2>Branch Details</h2>
                    <div id="branchModalContent"></div>
                </div>
            </div>
        `;

        // Append the modal HTML to the body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add event listener for closing the modal
        document.getElementById("closeModalBranch").addEventListener("click", function() {
            const modal = document.getElementById("branchModal");
            modal.style.display = "none";
        });
    }

    // Event listener to show account details when eye icon is clicked
    document.addEventListener("click", async function(event) {
        if (event.target.classList.contains("more")) {
            const account = JSON.parse(event.target.getAttribute("data-account"));
            const user = await fetchUserData(account.userId)
            const detailedAccount = { ...account, ...user[0] };
            showAccountDetails(detailedAccount);
        }
    });

    async function fetchBranchs(branchId) {
        const token = localStorage.getItem('jwt');
        const url = `http://localhost:8080/NetBanking/branch?branchId=${branchId}`;
    
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            const data = await response.json();
            if (data.status) {
                return data.branch; // Return the branch details
            } else {
                alert(data.message);
                return null;
            }
        } catch (error) {
            console.error('Error fetching branch details:', error);
            alert("Failed to fetch branch details.");
            return null;
        }
    }
    
    document.addEventListener("click", async function(event) {
        if (event.target.classList.contains("moreBranch")) {
            // const branchId = JSON.parse(event.target.getAttribute("data-branch"));
            const account = JSON.parse(event.target.getAttribute("data-branch"));
            const branch = await fetchBranchs(account.branchId);
            // console.log(branch[0])
            if(branch){
                showBranchDetails(branch);
            }
        }
    });

    createModal();
    createBranchModal();
});