function createStatement(transactionId, accountNumber, amount, balance, type, time) {
    if(accountNumber == null)
    {
        // accountNumber = amount > 0 ? "Deposit" : "Withdraw"
        accountNumber = "-"
    }
    const typeColor = (type === "Withdraw" || type === "Debit") ? "red" : "green";
    return `
        <div class="valueColumn">
            <div class="columnValues">${transactionId}</div>
            <div class="columnValues">${accountNumber}</div>
            <div class="columnValues">${formatIndianCurrency(amount)}</div>
            <div class="columnValues">${formatIndianCurrency(balance)}</div>
            <div class="columnValues" style="color: ${typeColor};">${type}</div>
            <div class="columnValues">${formatDate(time)}</div>
        </div>
    `
}
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

function getTransactionNature(amount)
{
    const isNegative = amount < 0;
    return isNegative? `DR.`:`CR.`
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

// document.addEventListener('DOMContentLoaded', function(){
//     const urlParams = new URLSearchParams(window.location.search);
        
//     // Check if 'accountNumber' exists in the query parameters
//     const accountNumber = urlParams.get('accountNumber');
    
//     // If an account number is found in the URL, fill the input field
//     if (accountNumber) {
//         document.getElementById('accountNumber').value = accountNumber;
//     }
    
//     try {
//         const token = localStorage.getItem('jwt');
//         if(!token) {
//             // alert('You must be logged in to view this page.');
//             window.location.href('/login.html');
//             return;
//         }
//     } catch (error) {
//         console.log(error);
//     }

//     document.getElementById('trans').addEventListener('submit', async function(event){
//         event.preventDefault();
        
//         const accountNumber = document.getElementById("accountNumber").value;
//         const fromDate = new Date(document.getElementById("fromDate").value).getTime();
//         const toDate = new Date(document.getElementById("toDate").value).getTime()+86400000;
//         try{
//             const token = localStorage.getItem('jwt')
//             console.log(token)
//             const response = await fetch('http://localhost:8080/NetBanking/statement', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`
//                 },
//                 body: JSON.stringify({accountNumber, fromDate, toDate})
//             });

//             const data = await response.json();

//             if (data.status) {
//                 if(Array.isArray(data.statement))
//                 {
//                     displayStatement(data.statement);
//                 } else {
//                     displayStatement(null);
//                 }
//             } else {
//                 alert(data.message);
//             }
//         } catch (error) {
//             console.error('Error fetching statement:', error);
//             alert('Failed to load statement. Please try again.');
//         }
//     })

//     function displayStatement(statement) {
//         const statementContainer = document.querySelector('#statementInsert');
        
//         document.getElementById('statementid').classList.remove('hidden')
//         if (statement == null || statement.length === 0) {
//             statementContainer.innerHTML = "<p style=\"padding: 10px; font-size: 20px; color: darkred;\">No statement found.</p>";
//             return;
//         }
    
//         statementContainer.innerHTML = '';
    
//         statement.forEach(statement => {
//             let statementHTML = createStatement(
//                 statement.referenceNumber,
//                 statement.transactionAccount,
//                 statement.transactionAmount,
//                 statement.balance,
//                 statement.type,
//                 statement.timestamp
//             );
    
//             statementContainer.insertAdjacentHTML('beforeend', statementHTML);
//         });
//     }
// })

document.addEventListener('DOMContentLoaded', function () {
    let currentPage = 1; // Track the current page
    const limit = 6; // Number of transactions per page
    let totalPages = 1; // Total pages will be calculated after fetching count

    const urlParams = new URLSearchParams(window.location.search);
    const accountNumber = urlParams.get('accountNumber');
    if (accountNumber) {
        document.getElementById('accountNumber').value = accountNumber;
    }

    try {
        const token = localStorage.getItem('jwt');
        if (!token) {
            window.location.href = '/login.html';
            return;
        }
    } catch (error) {
        console.log(error);
    }

    document.getElementById('trans').addEventListener('submit', async function (event) {
        event.preventDefault();
        currentPage = 1; // Reset to the first page when a new request is made
        await fetchTotalCount(); // Fetch the total count before loading the statements
        await fetchStatement(); // Fetch the statements after total count
    });

    // Fetch total count of transactions
    async function fetchTotalCount() {
        const accountNumber = document.getElementById("accountNumber").value;
        const fromDate = new Date(document.getElementById("fromDate").value).getTime();
        const toDate = new Date(document.getElementById("toDate").value).getTime() + 86400000;

        try {
            const token = localStorage.getItem('jwt');
            const response = await fetch('http://localhost:8080/NetBanking/statement', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ accountNumber, fromDate, toDate, count: true }) // Request only the count
            });

            const data = await response.json();

            if (data.status) {
                const totalCount = data.count || 0; // Fetch the total count
                totalPages = Math.ceil(totalCount / limit); // Calculate total pages
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error fetching total count:', error);
            alert('Failed to load total count. Please try again.');
        }
    }

    // Fetch the transaction statement
    async function fetchStatement() {
        const accountNumber = document.getElementById("accountNumber").value;
        const fromDate = new Date(document.getElementById("fromDate").value).getTime();
        const toDate = new Date(document.getElementById("toDate").value).getTime() + 86400000;

        try {
            const token = localStorage.getItem('jwt');
            const response = await fetch('http://localhost:8080/NetBanking/statement', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ accountNumber, fromDate, toDate, currentPage, limit }) // Pass currentPage and limit
            });

            const data = await response.json();

            if (data.status) {
                displayStatement(data.statement);
                updatePaginationControls(); // Ensure pagination controls are updated after fetching statements
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error fetching statement:', error);
            alert('Failed to load statement. Please try again.');
        }
    }

    // Display the fetched statement
    function displayStatement(statement) {
        const statementContainer = document.querySelector('#statementInsert');
        document.getElementById('statementid').classList.remove('hidden');

        if (!statement || statement.length === 0) {
            statementContainer.innerHTML = "<p style=\"padding: 10px; font-size: 20px; color: darkred;\">No statement found.</p>";
            return;
        }

        statementContainer.innerHTML = '';

        statement.forEach((item) => {
            const statementHTML = createStatement(
                item.referenceNumber,
                item.transactionAccount,
                item.transactionAmount,
                item.balance,
                item.type,
                item.timestamp
            );
            statementContainer.insertAdjacentHTML('beforeend', statementHTML);
        });
    }

    // Update the pagination controls
    function updatePaginationControls() {
        let paginationContainer = document.getElementById('paginationControls');
        const statementDiv = document.getElementById('statementid');

        // Create pagination controls only if they don't exist yet
        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.id = 'paginationControls';
            paginationContainer.style.display = 'flex';
            paginationContainer.style.justifyContent = 'center';
            paginationContainer.style.marginTop = '20px'; // Add some space between statement and pagination
            statementDiv.appendChild(paginationContainer);
        }

        paginationContainer.innerHTML = `
            <button id="prevPage" ${currentPage === 1 ? 'disabled' : ''}>Prev</button>
            <span>Page ${currentPage} of ${totalPages}</span>
            <button id="nextPage" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
        `;

        // Event listeners for Prev and Next buttons
        document.getElementById('prevPage').addEventListener('click', function () {
            if (currentPage > 1) {
                currentPage--;
                fetchStatement();
            }
        });

        document.getElementById('nextPage').addEventListener('click', function () {
            if (currentPage < totalPages) {
                currentPage++;
                fetchStatement();
            }
        });
    }
});

