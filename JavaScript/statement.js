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

function displayStatement(statement) {
    const statementContainer = document.querySelector('#statementInsert');

    if (statement == null || statement.length === 0) {
        statementContainer.innerHTML = "<p style=\"padding: 10px; font-size: 20px; color: darkred;\">No statement found.</p>";
        return;
    }

    statementContainer.innerHTML = '';

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

document.addEventListener('DOMContentLoaded', function(){
    try {
        const token = localStorage.getItem('jwt');
        if(!token) {
            // alert('You must be logged in to view this page.');
            window.location.href('/login.html');
            return;
        }
    } catch (error) {
        console.log(error);
    }

    document.getElementById('trans').addEventListener('submit', async function(event){
        event.preventDefault();
        
        const accountNumber = document.getElementById("accountNumber").value;
        const fromDate = new Date(document.getElementById("fromDate").value).getTime();
        const toDate = new Date(document.getElementById("toDate").value).getTime()+86400000;
        try{
            const token = localStorage.getItem('jwt')
            console.log(token)
            const response = await fetch('http://localhost:8080/NetBanking/statement', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({accountNumber, fromDate, toDate})
            });

            const data = await response.json();

            if (data.status) {
                if(Array.isArray(data.statement))
                {
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
    })
})

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
