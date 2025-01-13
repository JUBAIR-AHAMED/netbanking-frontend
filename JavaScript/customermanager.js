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

function showCustomerDetails(user) {
    const modal = document.getElementById("accountModal");
    const modalContent = document.getElementById("modalContent");
    modal.dataset.customer = JSON.stringify(user);
    // Format account details
    modalContent.innerHTML = `
    <div class="info-row">
            <label for="userIdField">User ID</label>
            <div class="non-editable-field">
                <span id="userIdField">${user.userId}</span>
            </div>
        </div>
        <div class="info-row">
            <label for="username">User Name</label>
            <div class="editable-field">
                <span id="username">${user.name}</span>
                <button class="edit-icon" onclick="toggleEdit('username')"><img src="icons/pen.png" alt="edit-logo"></button>
            </div>
        </div>
        <div class="info-row">
            <label for="mail">Email</label>
            <div class="editable-field">
                <span id="mail">${user.email}</span>
                <button class="edit-icon" onclick="toggleEdit('mail')"><img src="icons/pen.png" alt="edit-logo"></button>
            </div>
        </div>
        <div class="info-row">
            <label for="status">Status:</label>
            <div class="editable-field">
                <span id="status">${user.status}</span>
                <button class="edit-icon" onclick="toggleEdit('status')"><img src="icons/pen.png" alt="edit-logo"></button>
            </div>
        </div>
        <div class="info-row">
            <label for="dateOfBirth">Date Of Birth</label>
            <div class="editable-field">
                <span id="dateOfBirth">${user.dateOfBirth}</span>
                <button class="edit-icon" onclick="toggleEdit('dateOfBirth')"><img src="icons/pen.png" alt="edit-logo"></button>
            </div>
        </div>
        <div class="info-row">
            <label for="aadharNumber">Aadhar Number</label>
            <div class="editable-field">
                <span id="aadharNumber">${user.aadharNumber}</span>
                <button class="edit-icon" onclick="toggleEdit('aadharNumber')"><img src="icons/pen.png" alt="edit-logo"></button>
            </div>
        </div>
        <div class="info-row">
            <label for="panNumber">Pan Number</label>
            <div class="editable-field">
                <span id="panNumber">${user.panNumber}</span>
                <button class="edit-icon" onclick="toggleEdit('panNumber')"><img src="icons/pen.png" alt="edit-logo"></button>
            </div>
        </div>
        <button class="save-button">Save Changes</button>    
    `;

    // Show the modal
    modal.style.display = "block";
}

// function toggleEdit(fieldId) {
//     const field = document.getElementById(fieldId);

//     // Check if field is a span and toggle to input
//     if (field && field.tagName === 'SPAN') {
//         const currentText = field.innerText;

//         // Create an input field
//         const input = document.createElement('input');
//         input.type = 'text';
//         input.value = currentText;
//         input.classList.add('editable-input');
//         input.id = fieldId;

//         // Replace span with input field
//         field.replaceWith(input);

//         // Focus the input for immediate editing
//         input.focus();

//         // Save on blur or enter key
//         input.addEventListener('blur', () => {
//             if(document.getElementById(fieldId)) {
//                   saveEdit(fieldId, input.value);
//             }
//         });
//        input.addEventListener('keypress', (e) => {
//            if (e.key === 'Enter') {
//                 if(document.getElementById(fieldId)) {
//                    saveEdit(fieldId, input.value);
//                }
//            }
//        });

//     }
// }

function toggleEdit(fieldId) {
    const field = document.getElementById(fieldId);

    // Check if field is a span and toggle to input
    if (field && field.tagName === 'SPAN') {
        const currentText = field.innerText;

        let input;
        if(fieldId === 'status') {
            input = document.createElement('select');
            input.id = fieldId;
            input.classList.add('editable-input');
            const options = ['ACTIVE','BLOCKED','INACTIVE'];
            options.forEach(option => {
                 const optionElement = document.createElement('option');
                 optionElement.value = option;
                 optionElement.text = option;
                 if (option === currentText) {
                     optionElement.selected = true;
                 }
                  input.appendChild(optionElement)
            })
        }
        else if (fieldId === 'dateOfBirth') {
            input = document.createElement('input');
            input.type = 'date';
            input.value = new Date(Date.parse(currentText.split(".").reverse().join("-"))).toISOString().split('T')[0];; // Set value to current date

            input.classList.add('editable-input');
            input.id = fieldId;
        }
         else {
             input = document.createElement('input');
             input.type = 'text';
             input.value = currentText;
             input.classList.add('editable-input');
             input.id = fieldId;
        }

        // Replace span with input field
        field.replaceWith(input);

        // Focus the input for immediate editing
        input.focus();

        // Save on blur or enter key
        input.addEventListener('blur', () => {
            if(document.getElementById(fieldId)) {
                  saveEdit(fieldId, input.value);
            }
        });
       input.addEventListener('keypress', (e) => {
           if (e.key === 'Enter') {
                if(document.getElementById(fieldId)) {
                   saveEdit(fieldId, input.value);
               }
           }
       });

    }
}


function saveEdit(fieldId, newValue) {
    // Create a span to replace input
    const span = document.createElement('span');
    span.id = fieldId;
    span.innerText = newValue;
    const input = document.getElementById(fieldId);
    if (input) {
        input.replaceWith(span);
    }
}

function createAccountCard(account) {
    const {
        email,
        name,
        userId,
        mobile
    } = account;

    return `
        <div class="valueColumn">
            <div class="columnValues accValue">
                ${userId}
                <div class="more" style="position: fixed; z-index: 2; width: 17%; align-self: center; cursor: pointer; justify-items: flex-end;" data-account='${JSON.stringify(account)}'>
                    <img class="eye-logo-acc more" src="icons/eye-svgrepo-com.svg" alt="view icon" data-account='${JSON.stringify(account)}'>
                </div>
            </div>
            <div class="columnValues">${name}</div>
            <div class="columnValues branchValue">${mobile}</div>
            <div class="columnValues" style="display: flex;">${email}
            </div>
        </div>
    `;
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
}

document.addEventListener('DOMContentLoaded', function () {
    let currentPage = 1; // Current page
    const limit = 8; // Items per page
    let totalPages = 1; // Total pages will be calculated later
    let branch
    let searchCriteria = {}; 

    const debounce = (func, delay) => {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    const debouncedSearch = debounce(handleRealTimeSearch, 300);

    const nameField = document.getElementById('name');
    const userIdField = document.getElementById('userId');
    const emailField = document.getElementById('email');

    nameField.addEventListener('input', debouncedSearch);
    userIdField.addEventListener('input', debouncedSearch);
    emailField.addEventListener('input', debouncedSearch);

    async function handleRealTimeSearch() {
        const name = document.getElementById('name').value.trim();
        const userId = document.getElementById('userId').value.trim();
        const email = document.getElementById('email').value.trim();

        // Set search criteria
        searchCriteria = { name, userId, email };

        // Fetch total count and accounts
        await fetchTotalCount(searchCriteria);
        await fetchAccounts();
    }

    // Function to fetch total count based on search criteria
    async function fetchTotalCount(criteria) {
        try {
            const token = localStorage.getItem('jwt');
            const url = new URL('http://localhost:8080/NetBanking/user');
            criteria.count = true;
            criteria.userType = 'customer';
            criteria.moreDetails = false;
            criteria.searchSimilar=true

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'action': 'GET'
                },
                body: JSON.stringify(criteria)
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

            const url = new URL('http://localhost:8080/NetBanking/user');
            criteria = {}
            criteria.currentPage = currentPage;
            criteria.limit = limit;
            criteria.userId = searchCriteria.userId;
            criteria.name = searchCriteria.name;
            criteria.email = searchCriteria.email;
            criteria.userType = 'customer';
            criteria.moreDetails = 'true';
            criteria.searchSimilar=true

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'action': 'GET'
                },
                body: JSON.stringify(criteria)
            });
            const data = await response.json();
            if (data.status) {
                if (Array.isArray(data.users)) {
                    displayAccounts(data.users);
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
        const email = document.getElementById('email').value.trim();
        const name = document.getElementById('name').value.trim();
        const userId = document.getElementById('userId').value.trim();
    
        // Validation: At least one input must be provided
        if (!email && !name && !userId) {
            alert("Please enter at least one search criterion.");
            return;
        }
    
        try {
            // Set the search criteria
            searchCriteria.email = email;
            searchCriteria.name = name;
            searchCriteria.userId = userId;
    
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
            searchCriteria = { };
    
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
                    <h2>Customer Details</h2>
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

    async function saveChanges() {
        const modal = document.getElementById("accountModal");
        const customerString = modal.dataset.customer; 
        const originalProfile = JSON.parse(customerString); 
        const updatedProfile = {};
    
        // Compare each field with the original data
        const username = document.getElementById("username").innerText;
        if (username !== originalProfile.name) updatedProfile.name = username;
    
        const mail = document.getElementById("mail").innerText;
        if (mail !== originalProfile.email) updatedProfile.email = mail;
    
        const status = document.getElementById("status").innerText;
        if (status !== originalProfile.status) updatedProfile.status = status;

        const dob = document.getElementById("dateOfBirth").innerText;
        if (dob !== originalProfile.dateOfBirth) updatedProfile.dateOfBirth = dob;

        const aadharNumber = document.getElementById("aadharNumber").innerText;
        if (aadharNumber != originalProfile.aadharNumber) updatedProfile.aadharNumber = aadharNumber;

        const panNumber = document.getElementById("panNumber").innerText;
        if (panNumber != originalProfile.panNumber) updatedProfile.panNumber = panNumber;
        
        if (Object.keys(updatedProfile).length === 0) {
            alert("No changes detected.");
            return;
        }
        const userId = document.getElementById("userIdField").innerText;
        updatedProfile.key = userId
        try {
            // Retrieve the JWT token from local storage
            const token = localStorage.getItem("jwt");
    
            // Send updated profile data to the server
            const response = await fetch('http://localhost:8080/NetBanking/customer', {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedProfile)
            });
    
            const result = await response.json();
    
            if (response.ok) {
                alert("Profile updated successfully!");
            } else {
                alert(result.message || "Failed to update profile.");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred while updating the profile.");
        }
    }

    // Event listener to show account details when eye icon is clicked
    document.addEventListener("click", function(event) {
        if (event.target.classList.contains("more")) {
            const account = JSON.parse(event.target.getAttribute("data-account"));
            showCustomerDetails(account);
        }

        if(event.target.classList.contains("save-button")){
            saveChanges();
        }
    });
    // document.addEventListener("click", async function(event) {
    //     if (event.target.classList.contains("moreBranch")) {
    //         // const branchId = JSON.parse(event.target.getAttribute("data-branch"));
    //         const data = JSON.parse(event.target.getAttribute("data-branch"));
    //         const branch = await fetchBranchs(data.branchId);
    //         // console.log(branch[0])
    //         if(branch){
    //             showBranchDetails(branch);
    //         }
    //     }
    // });

    createModal();
    createBranchModal();
});
