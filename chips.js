// ========================================
// CHIP & BREAD MANAGER
// ========================================
// CUSTOMER + PRODUCT + CREDIT SALES
// PAYMENTS + DASHBOARD + TRANSACTIONS
// WHATSAPP + BACKUP + RESTORE
// CUSTOMER STATEMENTS
// ========================================


// ========================================
// CUSTOMERS
// ========================================

let customers = JSON.parse(
    localStorage.getItem("customers")
) || [];


// Open customer form
function openCustomerForm() {

    const form = document.getElementById("customerForm");

    if (form) {
        form.style.display = "block";
    }
}


// Close customer form
function closeCustomerForm() {

    const form = document.getElementById("customerForm");

    if (form) {
        form.style.display = "none";
    }
}


// Add customer
function addCustomer(event) {

    event.preventDefault();

    const name = document
        .getElementById("customerName")
        .value
        .trim();

    const phone = document
        .getElementById("customerPhone")
        .value
        .trim();


    if (!name) {

        alert("Please enter the customer's name.");

        return;
    }


    const customer = {

        id: Date.now(),

        name: name,

        phone: phone,

        balance: 0

    };


    customers.push(customer);


    localStorage.setItem(
        "customers",
        JSON.stringify(customers)
    );


    document.getElementById("customerName").value = "";

    document.getElementById("customerPhone").value = "";


    closeCustomerForm();

    displayCustomers();

    updateDashboard();


    alert("Customer added successfully!");
}


// Display customers
function displayCustomers() {

    const customerList =
        document.getElementById("customerList");

    if (!customerList) return;


    if (customers.length === 0) {

        customerList.innerHTML = `
            <div class="empty-state">
                <p>No customers yet.</p>
                <small>Add a customer to get started.</small>
            </div>
        `;

        return;
    }


    customerList.innerHTML = "";


    customers.forEach(function(customer) {

        const customerElement =
            document.createElement("div");


        customerElement.className = "customer";


        customerElement.innerHTML = `

            <div class="customer-info">

                <h3>${customer.name}</h3>

                <p>
                    ${customer.phone || "No phone number"}
                </p>

                <p>
                    Balance:
                    <strong>
                        ₦${Number(
                            customer.balance || 0
                        ).toLocaleString()}
                    </strong>
                </p>

            </div>


            <div class="customer-actions">

                <button
                    onclick="viewCustomer(${customer.id})"
                >
                    View
                </button>


                <button
                    class="whatsapp-btn"
                    onclick="sendWhatsAppReminder(${customer.id})"
                >
                    WhatsApp
                </button>


                <button
                    class="delete-btn"
                    onclick="deleteCustomer(${customer.id})"
                >
                    Delete
                </button>

            </div>

        `;


        customerList.appendChild(customerElement);

    });
}


// ========================================
// CUSTOMER STATEMENT
// ========================================

function viewCustomer(id) {

    const customer = customers.find(
        function(customer) {

            return customer.id === id;

        }
    );


    if (!customer) {

        alert("Customer not found.");

        return;

    }


    const customerSales = sales.filter(
        function(sale) {

            return Number(sale.customerId) === Number(id);

        }
    );


    const customerPayments = payments.filter(
        function(payment) {

            return Number(payment.customerId) === Number(id);

        }
    );


    // Total value of goods given
    const totalCredit = customerSales.reduce(
        function(total, sale) {

            return total + Number(sale.total || 0);

        },
        0
    );


    // Total money received
    const totalPaid = customerPayments.reduce(
        function(total, payment) {

            return total + Number(payment.amount || 0);

        },
        0
    );


    const statementName =
        document.getElementById("statementName");

    const statementPhone =
        document.getElementById("statementPhone");

    const statementBalance =
        document.getElementById("statementBalance");

    const statementCredit =
        document.getElementById("statementCredit");

    const statementPaid =
        document.getElementById("statementPaid");

    const transactionList =
        document.getElementById("statementTransactions");

    const modal =
        document.getElementById("statementModal");


    // Make sure statement HTML exists
    if (
        !statementName ||
        !statementPhone ||
        !statementBalance ||
        !statementCredit ||
        !statementPaid ||
        !transactionList ||
        !modal
    ) {

        alert(
            "Customer statement section is missing from index.html."
        );

        return;

    }


    statementName.textContent =
        customer.name;


    statementPhone.textContent =
        customer.phone || "No phone number";


    statementBalance.textContent =
        "₦" +
        Number(customer.balance || 0)
            .toLocaleString();


    statementCredit.textContent =
        "₦" +
        totalCredit.toLocaleString();


    statementPaid.textContent =
        "₦" +
        totalPaid.toLocaleString();


    // ========================================
    // TRANSACTION HISTORY
    // ========================================

    const transactions = [];


    customerSales.forEach(
        function(sale) {

            transactions.push({

                date: sale.date,

                description:
                    sale.productName +
                    " × " +
                    sale.quantity,

                amount:
                    Number(sale.total || 0),

                type: "sale"

            });

        }
    );


    customerPayments.forEach(
        function(payment) {

            transactions.push({

                date: payment.date,

                description:
                    payment.note
                        ? "Payment — " + payment.note
                        : "Payment",

                amount:
                    Number(payment.amount || 0),

                type: "payment"

            });

        }
    );


    // Newest first

    transactions.sort(
        function(a, b) {

            return new Date(b.date) -
                   new Date(a.date);

        }
    );


    transactionList.innerHTML = "";


    if (transactions.length === 0) {

        transactionList.innerHTML = `

            <tr>

                <td colspan="3">
                    No transactions yet.
                </td>

            </tr>

        `;

    } else {

        transactions.forEach(
            function(transaction) {

                const row =
                    document.createElement("tr");


                const date =
                    new Date(transaction.date)
                        .toLocaleDateString();


                const sign =
                    transaction.type === "sale"
                        ? "+"
                        : "-";


                row.innerHTML = `

                    <td>
                        ${date}
                    </td>

                    <td>
                        ${transaction.description}
                    </td>

                    <td>
                        ${sign}₦${Number(
                            transaction.amount
                        ).toLocaleString()}
                    </td>

                `;


                transactionList.appendChild(row);

            }
        );

    }


    // Show statement

    modal.style.display = "block";
}


// Close statement
function closeStatement() {

    const modal =
        document.getElementById("statementModal");

    if (modal) {

        modal.style.display = "none";

    }
}


// ========================================
// PRINT CUSTOMER STATEMENT
// ========================================

function printStatement() {

    const statement =
        document.querySelector(".statement-box");

    if (!statement) {

        alert("Customer statement not found.");

        return;

    }


    const printWindow =
        window.open("", "_blank");


    if (!printWindow) {

        alert(
            "Please allow pop-ups in your browser to print the statement."
        );

        return;

    }


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>Customer Statement</title>

            <style>

                body {

                    font-family: Arial, sans-serif;

                    padding: 30px;

                    color: #222;

                }


                h1,
                h2,
                h3 {

                    margin-bottom: 8px;

                }


                .header {

                    text-align: center;

                    margin-bottom: 25px;

                    border-bottom: 2px solid #222;

                    padding-bottom: 15px;

                }


                .customer-info {

                    margin-bottom: 20px;

                }


                .balance {

                    padding: 15px;

                    border: 1px solid #ddd;

                    margin-bottom: 20px;

                }


                .summary {

                    display: flex;

                    gap: 40px;

                    margin-bottom: 25px;

                }


                table {

                    width: 100%;

                    border-collapse: collapse;

                    margin-top: 15px;

                }


                th,
                td {

                    border: 1px solid #ccc;

                    padding: 10px;

                    text-align: left;

                }


                th {

                    background: #f2f2f2;

                }


                .footer {

                    margin-top: 40px;

                    text-align: center;

                    font-size: 13px;

                    color: #666;

                }


                @media print {

                    body {

                        padding: 0;

                    }

                }

            </style>

        </head>


        <body>


            <div class="header">

                <h1>CHIP & BREAD MANAGER</h1>

                <h2>Customer Statement</h2>

            </div>


            <div class="customer-info">

                <h2>
                    ${document.getElementById("statementName").textContent}
                </h2>

                <p>

                    Phone:

                    ${document.getElementById("statementPhone").textContent}

                </p>

            </div>


            <div class="balance">

                <strong>
                    Outstanding Balance
                </strong>

                <h2>

                    ${document.getElementById("statementBalance").textContent}

                </h2>

            </div>


            <div class="summary">

                <div>

                    <strong>
                        Total Credit
                    </strong>

                    <p>

                        ${document.getElementById("statementCredit").textContent}

                    </p>

                </div>


                <div>

                    <strong>
                        Total Paid
                    </strong>

                    <p>

                        ${document.getElementById("statementPaid").textContent}

                    </p>

                </div>

            </div>


            <h3>
                Transaction History
            </h3>


            ${document.querySelector(".statement-table-container").outerHTML}


            <div class="footer">

                <p>
                    Thank you for your business.
                </p>

                <p>
                    Generated by Chip & Bread Manager
                </p>

            </div>


        </body>

        </html>

    `);


    printWindow.document.close();


    printWindow.focus();


    setTimeout(function() {

        printWindow.print();

        printWindow.close();

    }, 500);

}
function deleteCustomer(id) {

    const customer = customers.find(
        function(customer) {

            return customer.id === id;

        }
    );


    if (!customer) return;


    if (Number(customer.balance || 0) > 0) {

        alert(
            "This customer still owes ₦" +
            Number(customer.balance)
                .toLocaleString() +
            ". You cannot delete them yet."
        );

        return;

    }


    const confirmed =
        confirm(
            "Are you sure you want to delete " +
            customer.name +
            "?"
        );


    if (!confirmed) return;


    customers = customers.filter(
        function(customer) {

            return customer.id !== id;

        }
    );


    localStorage.setItem(
        "customers",
        JSON.stringify(customers)
    );


    displayCustomers();

    updateDashboard();

}


// ========================================
// PRODUCTS
// ========================================

let products = JSON.parse(
    localStorage.getItem("products")
) || [];


// Open product form
function openProductForm() {

    const form =
        document.getElementById("productForm");

    if (form) {

        form.style.display = "block";

    }
}


// Close product form
function closeProductForm() {

    const form =
        document.getElementById("productForm");

    if (form) {

        form.style.display = "none";

    }
}


// Add product
function addProduct(event) {

    event.preventDefault();


    const name =
        document
            .getElementById("productName")
            .value
            .trim();


    const price =
        Number(
            document
                .getElementById("productPrice")
                .value
        );


    if (!name || price <= 0) {

        alert(
            "Please enter a valid product and price."
        );

        return;

    }


    const product = {

        id: Date.now(),

        name: name,

        price: price

    };


    products.push(product);


    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );


    document.getElementById("productName").value = "";

    document.getElementById("productPrice").value = "";


    closeProductForm();

    displayProducts();


    alert("Product added successfully!");
}


// Display products
function displayProducts() {

    const productList =
        document.getElementById("productList");

    if (!productList) return;


    if (products.length === 0) {

        productList.innerHTML = `

            <div class="empty-state">

                <p>No products yet.</p>

                <small>
                    Add your first product.
                </small>

            </div>

        `;

        return;

    }


    productList.innerHTML = "";


    products.forEach(function(product) {

        const productElement =
            document.createElement("div");


        productElement.className =
            "product";


        productElement.innerHTML = `

            <div class="product-info">

                <h3>${product.name}</h3>

                <p>
                    ₦${Number(
                        product.price
                    ).toLocaleString()}
                </p>

            </div>


            <div class="product-actions">

                <button
                    onclick="deleteProduct(${product.id})"
                >
                    Delete
                </button>

            </div>

        `;


        productList.appendChild(
            productElement
        );

    });
}


// Delete product
function deleteProduct(id) {

    const product =
        products.find(
            function(product) {

                return product.id === id;

            }
        );


    if (!product) return;


    const confirmed =
        confirm(
            "Delete " +
            product.name +
            "?"
        );


    if (!confirmed) return;


    products =
        products.filter(
            function(product) {

                return product.id !== id;

            }
        );


    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );


    displayProducts();

}


// ========================================
// OTHER BUTTONS
// ========================================

function showCustomers() {

    const section =
        document.querySelector(
            ".customers-section"
        );


    if (section) {

        section.scrollIntoView({
            behavior: "smooth"
        });

    }
}


function showMessage(action) {

    alert(
        action +
        " will be added next."
    );

}


// ========================================
// CREDIT SALES
// ========================================

let sales = JSON.parse(
    localStorage.getItem("sales")
) || [];


// Open credit sale form
function openCreditSaleForm() {

    const form =
        document.getElementById(
            "creditSaleForm"
        );


    if (!form) return;


    form.style.display = "block";


    loadSaleCustomers();

    loadSaleProducts();

}


// Close credit sale form
function closeCreditSaleForm() {

    const form =
        document.getElementById(
            "creditSaleForm"
        );


    if (!form) return;


    form.style.display = "none";

}


// Load sale customers
function loadSaleCustomers() {

    const select =
        document.getElementById(
            "saleCustomer"
        );


    if (!select) return;


    select.innerHTML = `

        <option value="">
            Select customer
        </option>

    `;


    customers.forEach(
        function(customer) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                customer.id;


            option.textContent =
                customer.name;


            select.appendChild(option);

        }
    );

}


// Load sale products
function loadSaleProducts() {

    const select =
        document.getElementById(
            "saleProduct"
        );


    if (!select) return;


    select.innerHTML = `

        <option value="">
            Select product
        </option>

    `;


    products.forEach(
        function(product) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                product.id;


            option.textContent =
                product.name +
                " - ₦" +
                Number(
                    product.price
                ).toLocaleString();


            select.appendChild(option);

        }
    );

}


// Update sale price
function updateSalePrice() {

    const productId =
        Number(
            document
                .getElementById("saleProduct")
                .value
        );


    const product =
        products.find(
            function(product) {

                return product.id === productId;

            }
        );


    if (!product) {

        document.getElementById(
            "salePrice"
        ).value = "₦0";


        return;

    }


    document.getElementById(
        "salePrice"
    ).value =
        "₦" +
        Number(
            product.price
        ).toLocaleString();


    calculateSaleTotal();

}


// Calculate sale total
function calculateSaleTotal() {

    const productId =
        Number(
            document
                .getElementById("saleProduct")
                .value
        );


    const quantity =
        Number(
            document
                .getElementById("saleQuantity")
                .value
        );


    const product =
        products.find(
            function(product) {

                return product.id === productId;

            }
        );


    if (!product || quantity <= 0) {

        document.getElementById(
            "saleTotal"
        ).value = "₦0";


        return;

    }


    const total =
        product.price *
        quantity;


    document.getElementById(
        "saleTotal"
    ).value =
        "₦" +
        total.toLocaleString();


    calculateSaleBalance();

}


// Calculate sale balance
function calculateSaleBalance() {

    const totalText =
        document
            .getElementById("saleTotal")
            .value;


    const total =
        Number(
            totalText.replace(
                /[₦,]/g,
                ""
            )
        );


    const paid =
        Number(
            document
                .getElementById("salePaid")
                .value
        );


    const balance =
        Math.max(
            total - paid,
            0
        );


    document.getElementById(
        "saleBalance"
    ).value =
        "₦" +
        balance.toLocaleString();

}


// Add credit sale
function addCreditSale(event) {

    event.preventDefault();


    const customerId =
        Number(
            document
                .getElementById("saleCustomer")
                .value
        );


    const productId =
        Number(
            document
                .getElementById("saleProduct")
                .value
        );


    const quantity =
        Number(
            document
                .getElementById("saleQuantity")
                .value
        );


    const paid =
        Number(
            document
                .getElementById("salePaid")
                .value
        );


    const customer =
        customers.find(
            function(customer) {

                return customer.id === customerId;

            }
        );


    const product =
        products.find(
            function(product) {

                return product.id === productId;

            }
        );


    if (!customer || !product) {

        alert(
            "Please select a customer and product."
        );

        return;

    }


    if (quantity <= 0) {

        alert(
            "Please enter a valid quantity."
        );

        return;

    }


    if (paid < 0) {

        alert(
            "Payment cannot be negative."
        );

        return;

    }


    const total =
        product.price *
        quantity;


    if (paid > total) {

        alert(
            "Amount paid cannot be greater than the sale."
        );

        return;

    }


    const balance =
        total - paid;


    const sale = {

        id: Date.now(),

        customerId: customerId,

        customerName: customer.name,

        productId: productId,

        productName: product.name,

        quantity: quantity,

        unitPrice: product.price,

        total: total,

        paid: paid,

        balance: balance,

        date: new Date().toISOString()

    };


    sales.push(sale);


    localStorage.setItem(
        "sales",
        JSON.stringify(sales)
    );


    // Update customer debt

    customer.balance =
        Number(
            customer.balance || 0
        ) + balance;


    localStorage.setItem(
        "customers",
        JSON.stringify(customers)
    );


    // If customer paid something immediately,
    // save it as a payment too.

    if (paid > 0) {

        const payment = {

            id: Date.now() + 1,

            customerId:
                customer.id,

            customerName:
                customer.name,

            amount:
                paid,

            note:
                "Payment at sale",

            date:
                new Date().toISOString()

        };


        payments.push(payment);


        localStorage.setItem(
            "payments",
            JSON.stringify(payments)
        );

    }


    // Reset form

    document.getElementById(
        "saleCustomer"
    ).value = "";


    document.getElementById(
        "saleProduct"
    ).value = "";


    document.getElementById(
        "saleQuantity"
    ).value = "1";


    document.getElementById(
        "salePrice"
    ).value = "₦0";


    document.getElementById(
        "saleTotal"
    ).value = "₦0";


    document.getElementById(
        "salePaid"
    ).value = "0";


    document.getElementById(
        "saleBalance"
    ).value = "₦0";


    closeCreditSaleForm();


    displayCustomers();

    displayTransactions();

    updateDashboard();


    alert(
        "Credit sale recorded successfully!\n\n" +
        customer.name +
        " now owes ₦" +
        Number(
            customer.balance
        ).toLocaleString()
    );

}


// ========================================
// PAYMENTS
// ========================================

let payments = JSON.parse(
    localStorage.getItem("payments")
) || [];


// Open payment form
function openPaymentForm() {

    const form =
        document.getElementById(
            "paymentForm"
        );


    if (!form) return;


    form.style.display = "block";


    loadPaymentCustomers();

}


// Close payment form
function closePaymentForm() {

    const form =
        document.getElementById(
            "paymentForm"
        );


    if (form) {

        form.style.display = "none";

    }

}


// Load payment customers
function loadPaymentCustomers() {

    const select =
        document.getElementById(
            "paymentCustomer"
        );


    if (!select) return;


    select.innerHTML = `

        <option value="">
            Select customer
        </option>

    `;


    customers.forEach(
        function(customer) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                customer.id;


            option.textContent =
                customer.name +
                " — Owes ₦" +
                Number(
                    customer.balance || 0
                ).toLocaleString();


            select.appendChild(option);

        }
    );

}


// Add payment
function addPayment(event) {

    event.preventDefault();


    const customerId =
        Number(
            document
                .getElementById(
                    "paymentCustomer"
                )
                .value
        );


    const amount =
        Number(
            document
                .getElementById(
                    "paymentAmount"
                )
                .value
        );


    const note =
        document
            .getElementById(
                "paymentNote"
            )
            .value
            .trim();


    const customer =
        customers.find(
            function(customer) {

                return customer.id === customerId;

            }
        );


    if (!customer) {

        alert(
            "Please select a customer."
        );

        return;

    }


    if (amount <= 0) {

        alert(
            "Please enter a valid payment amount."
        );

        return;

    }


    const currentBalance =
        Number(
            customer.balance || 0
        );


    if (currentBalance <= 0) {

        alert(
            customer.name +
            " does not currently owe you anything."
        );

        return;

    }


    if (amount > currentBalance) {

        alert(
            "This payment is greater than the customer's outstanding debt.\n\n" +
            "Outstanding: ₦" +
            currentBalance.toLocaleString()
        );

        return;

    }


    const payment = {

        id: Date.now(),

        customerId:
            customer.id,

        customerName:
            customer.name,

        amount:
            amount,

        note:
            note,

        date:
            new Date().toISOString()

    };


    payments.push(payment);


    localStorage.setItem(
        "payments",
        JSON.stringify(payments)
    );


    // Reduce debt

    customer.balance =
        currentBalance -
        amount;


    localStorage.setItem(
        "customers",
        JSON.stringify(customers)
    );


    // Clear form

    document.getElementById(
        "paymentCustomer"
    ).value = "";


    document.getElementById(
        "paymentAmount"
    ).value = "";


    document.getElementById(
        "paymentNote"
    ).value = "";


    closePaymentForm();


    displayCustomers();

    displayTransactions();

    updateDashboard();


    alert(
        "Payment recorded successfully!\n\n" +
        customer.name +
        " now owes ₦" +
        Number(
            customer.balance
        ).toLocaleString()
    );

}


// ========================================
// DASHBOARD
// ========================================

function updateDashboard() {

    const totalSales =
        sales.reduce(
            function(total, sale) {

                return total +
                    Number(
                        sale.total || 0
                    );

            },
            0
        );


    const totalCredit =
        sales.reduce(
            function(total, sale) {

                return total +
                    Number(
                        sale.balance || 0
                    );

            },
            0
        );


    const totalPayments =
        payments.reduce(
            function(total, payment) {

                return total +
                    Number(
                        payment.amount || 0
                    );

            },
            0
        );


    const totalDebt =
        customers.reduce(
            function(total, customer) {

                return total +
                    Number(
                        customer.balance || 0
                    );

            },
            0
        );


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const todaySales =
        sales
            .filter(
                function(sale) {

                    return sale.date &&
                        sale.date.startsWith(
                            today
                        );

                }
            )
            .reduce(
                function(total, sale) {

                    return total +
                        Number(
                            sale.total || 0
                        );

                },
                0
            );


    const todayPayments =
        payments
            .filter(
                function(payment) {

                    return payment.date &&
                        payment.date.startsWith(
                            today
                        );

                }
            )
            .reduce(
                function(total, payment) {

                    return total +
                        Number(
                            payment.amount || 0
                        );

                },
                0
            );


    const owingCustomers =
        customers.filter(
            function(customer) {

                return Number(
                    customer.balance || 0
                ) > 0;

            }
        ).length;


    const todaySalesElement =
        document.getElementById(
            "todaySales"
        );


    const creditGivenElement =
        document.getElementById(
            "creditGiven"
        );


    const paymentsReceivedElement =
        document.getElementById(
            "paymentsReceived"
        );


    const totalDebtElement =
        document.getElementById(
            "totalDebt"
        );


    const totalSalesElement =
        document.getElementById(
            "totalSales"
        );


    const totalPaymentsElement =
        document.getElementById(
            "totalPayments"
        );


    const customerCountElement =
        document.getElementById(
            "customerCount"
        );


    const owingCustomersElement =
        document.getElementById(
            "owingCustomers"
        );


    if (todaySalesElement) {

        todaySalesElement.textContent =
            "₦" +
            todaySales.toLocaleString();

    }


    if (creditGivenElement) {

        creditGivenElement.textContent =
            "₦" +
            totalCredit.toLocaleString();

    }


    if (paymentsReceivedElement) {

        paymentsReceivedElement.textContent =
            "₦" +
            todayPayments.toLocaleString();

    }


    if (totalDebtElement) {

        totalDebtElement.textContent =
            "₦" +
            totalDebt.toLocaleString();

    }


    if (totalSalesElement) {

        totalSalesElement.textContent =
            "₦" +
            totalSales.toLocaleString();

    }


    if (totalPaymentsElement) {

        totalPaymentsElement.textContent =
            "₦" +
            totalPayments.toLocaleString();

    }


    if (customerCountElement) {

        customerCountElement.textContent =
            customers.length;

    }


    if (owingCustomersElement) {

        owingCustomersElement.textContent =
            owingCustomers;

    }

}


// ========================================
// TRANSACTION HISTORY
// ========================================

function displayTransactions() {

    const transactionList =
        document.getElementById(
            "transactionList"
        );


    if (!transactionList) return;


    const searchInput =
        document.getElementById(
            "transactionSearch"
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const saleTransactions =
        sales.map(
            function(sale) {

                return {

                    id:
                        sale.id,

                    date:
                        sale.date,

                    customer:
                        sale.customerName,

                    description:
                        sale.productName +
                        " × " +
                        sale.quantity,

                    amount:
                        sale.total,

                    type:
                        "Credit"

                };

            }
        );


    const paymentTransactions =
        payments.map(
            function(payment) {

                return {

                    id:
                        payment.id,

                    date:
                        payment.date,

                    customer:
                        payment.customerName,

                    description:
                        payment.note
                            ? "Payment — " +
                              payment.note
                            : "Payment",

                    amount:
                        payment.amount,

                    type:
                        "Payment"

                };

            }
        );


    let transactions =
        saleTransactions.concat(
            paymentTransactions
        );


    if (search) {

        transactions =
            transactions.filter(
                function(transaction) {

                    return (

                        (
                            transaction.customer ||
                            ""
                        )
                        .toLowerCase()
                        .includes(search)

                        ||

                        (
                            transaction.description ||
                            ""
                        )
                        .toLowerCase()
                        .includes(search)

                    );

                }
            );

    }


    transactions.sort(
        function(a, b) {

            return new Date(b.date) -
                   new Date(a.date);

        }
    );


    if (transactions.length === 0) {

        transactionList.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="transaction-empty"
                >
                    No transactions found.
                </td>

            </tr>

        `;

        return;

    }


    transactionList.innerHTML = "";


    transactions.forEach(
        function(transaction) {

            const row =
                document.createElement("tr");


            const date =
                new Date(
                    transaction.date
                ).toLocaleDateString();


            const statusClass =
                transaction.type === "Credit"
                    ? "credit-status"
                    : "payment-status";


            const sign =
                transaction.type === "Credit"
                    ? "+"
                    : "-";


            row.innerHTML = `

                <td>
                    ${date}
                </td>

                <td>
                    <strong>
                        ${transaction.customer}
                    </strong>
                </td>

                <td>
                    ${transaction.description}
                </td>

                <td>
                    ${sign}₦${Number(
                        transaction.amount
                    ).toLocaleString()}
                </td>

                <td
                    class="${statusClass}"
                >
                    ${transaction.type}
                </td>

            `;


            transactionList.appendChild(row);

        }
    );

}


// ========================================
// WHATSAPP REMINDER
// ========================================

function sendWhatsAppReminder(id) {

    const customer =
        customers.find(
            function(customer) {

                return customer.id === id;

            }
        );


    if (!customer) return;


    if (!customer.phone) {

        alert(
            "This customer does not have a phone number."
        );

        return;

    }


    const balance =
        Number(
            customer.balance || 0
        );


    if (balance <= 0) {

        alert(
            customer.name +
            " does not currently owe you any money."
        );

        return;

    }


    let phone =
        customer.phone.replace(
            /\D/g,
            ""
        );


    if (phone.startsWith("0")) {

        phone =
            "234" +
            phone.substring(1);

    }


    const message =
        `Hello ${customer.name},

This is a friendly reminder that your current outstanding balance for goods collected on credit is ₦${balance.toLocaleString()}.

Kindly make payment when convenient. Thank you.`;


    const whatsappURL =
        "https://wa.me/" +
        phone +
        "?text=" +
        encodeURIComponent(
            message
        );


    window.open(
        whatsappURL,
        "_blank"
    );

}


// ========================================
// BACKUP
// ========================================

function backupData() {

    const backup = {

        version: 1,

        date:
            new Date().toISOString(),

        customers:
            customers,

        products:
            products,

        sales:
            sales,

        payments:
            payments

    };


    const data =
        JSON.stringify(
            backup,
            null,
            2
        );


    const blob =
        new Blob(
            [data],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;


    const date =
        new Date()
            .toISOString()
            .split("T")[0];


    link.download =
        "chip-bread-backup-" +
        date +
        ".json";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );


    alert(
        "Backup created successfully!"
    );

}


// ========================================
// RESTORE
// ========================================

function restoreData(event) {

    const file =
        event.target.files[0];


    if (!file) return;


    const reader =
        new FileReader();


    reader.onload =
        function(e) {

            try {

                const backup =
                    JSON.parse(
                        e.target.result
                    );


                if (
                    !Array.isArray(
                        backup.customers
                    ) ||

                    !Array.isArray(
                        backup.products
                    ) ||

                    !Array.isArray(
                        backup.sales
                    ) ||

                    !Array.isArray(
                        backup.payments
                    )
                ) {

                    alert(
                        "This is not a valid business backup file."
                    );

                    return;

                }


                const confirmed =
                    confirm(
                        "Restoring this backup will replace your current records. Continue?"
                    );


                if (!confirmed) return;


                customers =
                    backup.customers;


                products =
                    backup.products;


                sales =
                    backup.sales;


                payments =
                    backup.payments;


                localStorage.setItem(
                    "customers",
                    JSON.stringify(
                        customers
                    )
                );


                localStorage.setItem(
                    "products",
                    JSON.stringify(
                        products
                    )
                );


                localStorage.setItem(
                    "sales",
                    JSON.stringify(
                        sales
                    )
                );


                localStorage.setItem(
                    "payments",
                    JSON.stringify(
                        payments
                    )
                );


                displayCustomers();

                displayProducts();

                displayTransactions();

                updateDashboard();


                alert(
                    "Your business data has been restored successfully!"
                );


            } catch (error) {

                console.error(
                    error
                );


                alert(
                    "Could not read this backup file."
                );

            }

        };


    reader.readAsText(file);

}


// ========================================
// START APPLICATION
// ========================================

displayCustomers();

displayProducts();

displayTransactions();

updateDashboard();
// ========================================
// SERVICE WORKER
// ========================================

if ("serviceWorker" in navigator) {

    window.addEventListener("load", function() {

        navigator.serviceWorker
            .register("./service-worker.js")
            .then(function() {

                console.log(
                    "Service Worker registered successfully."
                );

            })
            .catch(function(error) {

                console.error(
                    "Service Worker registration failed:",
                    error
                );

            });

    });

}