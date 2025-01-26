let tokenBranchId = null;
let isBranchIdFieldEditing = false; // Flag to track if branchIdField is being edited, declare globally

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

function setupNumericInputValidation(inputElement, maxLength) {
    // Prevent non-numeric input during typing
    inputElement.addEventListener('keypress', function (event) {
        const char = String.fromCharCode(event.which || event.keyCode);
        if (!/^\d$/.test(char)) {
            event.preventDefault(); // Block non-numeric characters
        }
    });

    // Ensure no invalid characters or excess digits after paste or programmatic change
    inputElement.addEventListener('input', function (event) {
        let value = event.target.value;

        // Remove non-numeric characters
        value = value.replace(/\D/g, '');

        // Enforce maximum length
        if (value.length > maxLength) {
            value = value.slice(0, maxLength);
        }

        // Update the input value
        event.target.value = value;
    });
}

// setupNumericInputValidation(document.getElementById('accountNumber'), 16); // Assuming these are in account page, not employee page
// setupNumericInputValidation(document.getElementById('userId'), 6);
// setupNumericInputValidation(document.getElementById('branchId'), 5);


function showEmployeeDetails(user) {
    const modal = document.getElementById("accountModal"); // Reusing accountModal, ensure this is intentional
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
            <label for="branchIdField">Branch Id</label>
            <div class="editable-field editable-field-wrapper"> <!- ADDED editable-field-wrapper CLASS -->
                <span id="branchIdField">${(user.branchId==null? "Not set": user.branchId)}</span>
                <ul id="branchIdDropdown" class="dropdown-menu"></ul> <!- ADDED DROPDOWN UL -->
                <button class="edit-icon" onclick="toggleEdit('branchIdField')"><img src="icons/pen.png" alt="edit-logo"></button>
            </div>
        </div>
         <div class="info-row">
            <label for="roleField">Role</label>
            <div class="editable-field">
                <span id="roleField">${user.role}</span>
                <button class="edit-icon" onclick="toggleEdit('roleField')"><img src="icons/pen.png" alt="edit-logo"></button>
            </div>
        </div>
        <button class="save-button" onclick="saveChanges()">Save Changes</button> <!- ADDED onclick to saveChanges -->
    `;

    // Show the modal
    modal.style.display = "block";
    setupBranchIdDropdown(); // You might need to call setupBranchIdDropdown again if needed for employee modal as well.
}

function closeModal() {
    const modal = document.getElementById("accountModal");
    modal.style.display = "none";
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
    if (fieldId === 'branchIdField') {
        isBranchIdFieldEditing = false; // Clear editing flag when saved
    }
}

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
                 if (option == currentText) {
                     optionElement.selected = true;
                 }
                  input.appendChild(optionElement)
            })
        } else if(fieldId === 'roleField') {
            input = document.createElement('select');
            input.id = fieldId;
            input.classList.add('editable-input');
            const options = ['MANAGER','EMPLOYEE'];
            options.forEach(option => {
                 const optionElement = document.createElement('option');
                 optionElement.value = option;
                 optionElement.text = option;
                 if (option === currentText) {
                     optionElement.selected = true;
                 }
                  input.appendChild(optionElement)
            })
        } else if (fieldId === 'dateOfBirth') {
            input = document.createElement('input');
            input.type = 'date';
            input.value = new Date(Date.parse(currentText.split(".").reverse().join("-"))).toISOString().split('T')[0];; // Set value to current date

            input.classList.add('editable-input');
            input.id = fieldId;
        } else if (fieldId === 'branchIdField') { // BRANCH ID FIELD HANDLING
            input = document.createElement('input');
            input.type = 'text';
            input.value = currentText;
            input.classList.add('editable-input');
            input.id = fieldId;
            input.dataset.originalValue = currentText; // Store original value
            setupBranchIdDropdownInput(input); // Setup dropdown input behavior
            isBranchIdFieldEditing = true; // Set editing flag to true
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

        // Add blur and keypress listeners - CORRECTED to include blur for branchIdField
        if (fieldId !== 'branchIdField') {
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
        } else { // BLUR EVENT LISTENER FOR BRANCH ID FIELD - REVERT LOGIC
            input.addEventListener('blur', () => {
                if (document.getElementById(fieldId)) {
                    if (isBranchIdFieldEditing) { // Check if editing flag is still true
                        const originalValue = input.dataset.originalValue;
                        saveEdit(fieldId, originalValue); // Restore original value if blurred without save
                    } else {
                        saveEdit(fieldId, input.value); // Still save if flag is false (meaning it was saved through dropdown/enter)
                    }
                    isBranchIdFieldEditing = false; // Reset editing flag on blur, regardless of revert or save
                }
            });
        }

    }
}

function createAccountCard(account) { // Reused function, might be employee card now?
    const {
        email,
        name,
        userId,
        mobile,
        role,
        branchId
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
            <div class="columnValues branchValue">
                ${mobile}
            </div>
            <div class="columnValues" style="display: flex;">${email}
            </div>
            <div class="columnValues">${role}</div>
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


function displayBranchDropdown(branchs, dropdownElement) {
    dropdownElement.innerHTML = ''; // Clear existing options
    branchs.forEach(branch => {
        const listItem = document.createElement('li');
        listItem.dataset.value = branch.branchId;
        listItem.textContent = `${branch.branchId} - ${branch.name}`; // Display branchId and name
        listItem.addEventListener('click', function () {
            const inputField = document.getElementById('branchIdField'); // Get the input field
            if (inputField) {
                inputField.value = branch.branchId; // Set input value
                saveEdit('branchIdField', branch.branchId); // Save edit with new value
            }
            dropdownElement.style.display = 'none'; // Hide the dropdown
        });
        dropdownElement.appendChild(listItem);
    });
    dropdownElement.style.display = 'block'; // Show the dropdown
}


let branchDropdownInput; // To hold the branchIdField input element globally within this scope

function setupBranchIdDropdownInput(inputElement) {
    branchDropdownInput = inputElement; // Assign the inputElement to the global variable

    inputElement.addEventListener('input', async function () {
        const inputValue = inputElement.value.trim();
        const dropdownElement = document.getElementById('branchIdDropdown');

        if (inputValue.length >= 1) { // Fetch branches when input length is at least 1
            try {
                const criteria = { branchId: inputValue, searchSimilar: true }; // Enable similar search
                const url = new URL('http://localhost:8080/NetBanking/branch');
                const token = localStorage.getItem('jwt'); // Retrieve JWT token
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'action': 'GET',
                        'Content-Type': 'application/json' // Specify content type
                    },
                    body: JSON.stringify(criteria)
                });

                const data = await response.json();
                if (data.status == 200) {
                    if (Array.isArray(data.branch) && data.branch.length > 0) {
                        displayBranchDropdown(data.branch, dropdownElement);
                    } else {
                        dropdownElement.innerHTML = '<li>No matches</li>';
                        dropdownElement.style.display = 'block';
                    }
                } else {
                    dropdownElement.innerHTML = `<li>Error: ${data.message}</li>`;
                    dropdownElement.style.display = 'block';
                }
            } catch (error) {
                console.error('Error fetching branches:', error);
                dropdownElement.innerHTML = '<li>Error fetching branches</li>';
                dropdownElement.style.display = 'block';
            }
        } else {
            dropdownElement.style.display = 'none'; // Hide dropdown if input is too short
        }
    });

    // Close dropdown on blur
    inputElement.addEventListener('blur', () => {
        const dropdownElement = document.getElementById('branchIdDropdown');
        setTimeout(() => {
            if (!dropdownElement.matches(':hover') && document.activeElement !== inputElement) {
                dropdownElement.style.display = 'none';
                // saveEdit('branchIdField', inputElement.value); // COMMENTED OUT - DEBUG STEP - Prevent saveEdit from here interfering with revert
            }
        }, 150);
    });

    // Handle keypress on input
    inputElement.addEventListener('keypress', function(event) {
        const dropdownElement = document.getElementById('branchIdDropdown');
        if (event.key === 'Enter') {
            dropdownElement.style.display = 'none'; // Hide dropdown on Enter key
            saveEdit('branchIdField', inputElement.value); // Save edit on Enter for branchIdField
            inputElement.blur(); // Optionally remove focus after saving
        }
    });


    // Prevent dropdown from closing immediately on input focus, allow input to gain focus for typing
    inputElement.addEventListener('focus', () => {
        const dropdownElement = document.getElementById('branchIdDropdown');
        if (dropdownElement.style.display !== 'block' && inputElement.value.trim().length >= 1) {
            dropdownElement.style.display = 'block'; // Re-show if it was hidden and input has content
        }
    });
}


function setupBranchIdDropdown() {
    const branchIdElement = document.getElementById("branchIdField");
    if (branchIdElement && branchIdElement.parentElement.classList.contains('editable-field')) {
        branchIdElement.addEventListener('click', function () {
            if (branchIdElement.tagName === 'SPAN') {
                toggleEdit('branchIdField'); // Turn span into input for editing and dropdown
            }
        });
    }
}


document.addEventListener('DOMContentLoaded', function () {
    const userIdField = document.getElementById('userId');
    const nameField = document.getElementById('name');
    const branchIdField = document.getElementById('branchId');

    // Validate User ID: numbers only, max 6 digits
    userIdField.addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, ''); // Allow only numbers
        if (this.value.length > 6) {
            this.value = this.value.slice(0, 6); // Restrict to 6 digits
        }
    });

    // Validate Name: alphabets, ., space
    nameField.addEventListener('input', function () {
        this.value = this.value.replace(/[^a-zA-Z. ]/g, ''); // Allow only letters, ., and spaces
    });

    // Validate Branch ID: numbers only, max 5 digits
    branchIdField.addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, ''); // Allow only numbers
        if (this.value.length > 5) {
            this.value = this.value.slice(0, 5); // Restrict to 5 digits
        }
    });
});


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
    const branchIdField_search = document.getElementById('branchId'); // Renamed to avoid conflict

    nameField.addEventListener('input', debouncedSearch);
    userIdField.addEventListener('input', debouncedSearch);
    emailField.addEventListener('input', debouncedSearch);
    branchIdField_search.addEventListener('input', debouncedSearch);

    async function handleRealTimeSearch() {
        const name = document.getElementById('name').value.trim();
        const userId = document.getElementById('userId').value.trim();
        const email = document.getElementById('email').value.trim();
        const branchId = document.getElementById('branchId').value.trim();

        // Set search criteria
        searchCriteria = { name, userId, email, branchId};

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
            criteria.userId = criteria.userId;
            criteria.name = criteria.name;
            criteria.email = criteria.email;
            criteria.branchId = criteria.branchId;
            criteria.userType = 'employee';
            criteria.moreDetails = true;
            criteria.searchSimilar = true;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'action': 'GET'
                },
                body: JSON.stringify(criteria)
            });
            const data = await response.json();
            if (data.status==200) {
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
            const criteria  = {};
            criteria.currentPage = currentPage;
            criteria.limit = limit;
            criteria.userId = searchCriteria.userId;
            criteria.name = searchCriteria.name;
            criteria.email = searchCriteria.email;
            criteria.branchId = searchCriteria.branchId;
            criteria.userType = 'employee';
            criteria.moreDetails = true;
            criteria.searchSimilar = true;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'action': 'GET',
                },
                body: JSON.stringify(criteria)
            });
            const data = await response.json();
            if (data.status==200) {
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
            accountsContainer.innerHTML = "<p>No employees found.</p>"; // Changed message
            return;
        }

        accountsContainer.innerHTML = ''; // Clear previous accounts
        accounts.forEach(account => {
            const accountHTML = createAccountCard(account); // Reusing account card, might need employee card
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


    async function saveChanges() {
        const modal = document.getElementById("accountModal"); // Reusing accountModal
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

        const branchId = document.getElementById("branchIdField").innerText;
        if (branchId != originalProfile.branchId) updatedProfile.branchId = branchId;

        const role = document.getElementById("roleField").innerText;
        if (role != originalProfile.role) updatedProfile.role = role; // Corrected to role

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
            const response = await fetch('http://localhost:8080/NetBanking/employee', {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedProfile)
            });

            const result = await response.json();

            if (result.status==200) {
                alert("Employee profile updated successfully!"); // Changed alert message
                closeModal(); // Close modal after save
                fetchAccounts(); // Refresh employee list
            } else {
                alert(result.message || "Failed to update employee profile."); // Changed alert message
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred while updating the employee profile."); // Changed alert message
        }
    }

    // Event listener for the search form
    document.getElementById('searchForm').addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent default form submission

        // Get the input values
        const email = document.getElementById('email').value.trim();
        const name = document.getElementById('name').value.trim();
        const userId = document.getElementById('userId').value.trim();
        const branchId = document.getElementById('branchId').value.trim();

        // Validation: At least one input must be provided
        if (!email && !name && !userId && !branchId) {
            alert("Please enter at least one search criterion.");
            return;
        }

        try {
            // Set the search criteria
            searchCriteria.email = email;
            searchCriteria.name = name;
            searchCriteria.userId = userId;
            searchCriteria.branchId = branchId;

            // Reset to the first page
            currentPage = 1;

            // Fetch total count and accounts
            await fetchTotalCount(searchCriteria);
            await fetchAccounts();
        } catch (error) {
            console.error('Error during search:', error);
            alert("Failed to retrieve employees. Check console for details."); // Changed alert message
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
            searchCriteria = { }; // Or adjust initial criteria if needed

            // Fetch total count and accounts based on the branchId
            await fetchTotalCount(searchCriteria);
            await fetchAccounts();
        } catch (error) {
            console.error('Error during initialization:', error);
            alert("Failed to initialize employee list. Please check the console for details."); // Changed alert message
        }
    }
    initialize();

    // Function to create modal and add the event listener for closing the modal
    function createModal() {
        // Create modal HTML structure
        const modalHTML = `
            <div id="accountModal" class="modal"> <!- Reusing accountModal ID -->
                <div class="modal-content">
                    <span class="close-button" id="closeModal">×</span>
                    <h2>Employee Details</h2> <!- Changed Modal Title -->
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

    function createBranchModal() { // Keeping branch modal function, even if not directly used in employee edit yet
        // Create modal HTML structure
        const modalHTML = `
            <div id="branchModal" class="modal">
                <div class="modal-content">
                    <span class="close-button" id="closeModalBranch">×</span>
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
    document.addEventListener("click", function(event) {
        if (event.target.classList.contains("more")) {
            const account = JSON.parse(event.target.getAttribute("data-account"));
            showEmployeeDetails(account);
        }

        if(event.target.classList.contains("save-button")){
            saveChanges();
        }
    });


    createModal();
    createBranchModal();
});