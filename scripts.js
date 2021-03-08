const Modal = {
    open() {
        document.querySelector(".modal-overlay").classList.toggle("active")
    },
    close() {
        document.querySelector(".modal-overlay").classList.toggle("active")
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));
    }
}


const transactions = [
    {
        description: "Luz",
        amount: -50000,
        date: "23/01/2021"

    },
    {
        description: "Website",
        amount: 500000,
        date: "23/01/2021"
    },
    {
        description: "Internet",
        amount: -20000,
        date: "23/01/2021" 
    }
]

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction);

        App.reload();
    },

    remove(index) {
        Transaction.all.splice(index, 1);

        App.reload();
    },

    incomes() {
        // somar as entradas
        let income = 0;
        Transaction.all.forEach((transaction) => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        });
        return income;
    },
    expenses() {
        // somar as saidas
        let expense = 0;

        Transaction.all.forEach((transaction) => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        });
        return expense;
    },
    total() {
        // somar entradas e subtrair saidas
        let total = 0
        //O sinal já vem negativo em expenses(), por isso o sinal fica positivo em total
        total = Transaction.incomes() + Transaction.expenses();
        return total;
    }
}

const Utils = {
    formatAmount(value) {
        value = Number(value) * 100;

        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-");

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
    },

    // FORMATAÇÃO DOS NUMEROS!!! //
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "";

        // Expressão que faz achar tudo que não são números //
        value = String(value).replace(/\D/g , "");

        value = Number(value) / 100;

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });


        return signal + ' ' + value;
    }
}

const Form = {
    description: document.querySelector("input#description"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),

    getValues() {
        return {
            description : Form.description.value,
            amount : Form.amount.value,
            date : Form.date.value
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues();

        amount = Utils.formatAmount(amount);

        date = Utils.formatDate(date);

        return {
            description,
            amount,
            date
        }
    },

    validateField() {
        // const description = Form.getValues().description;
        // const amount = Form.getValues().amount;
        // const date = Form.getValues().date;
        //   OU   //
        const { description, amount, date } = Form.getValues();

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error('Por favor, preencha todos os campos.');
        }

        // console.log(description);
    },

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    clearFields() {
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },

    submit(event) {
        event.preventDefault();

        try {
            // Verificar se todas as informações foram preenchidas //
            Form.validateField()

            // Formatar os dados para salvar //
            const transaction = Form.formatValues()

            // salvar //
            Form.saveTransaction(transaction);

            // apagar os dados do formulário //
            Form.clearFields();

            // fechar modal //
            Modal.close();
            App.reload();

        } catch(error) {
            alert(error.message)

        }
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;

        DOM.transactionsContainer.appendChild(tr);

    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense";

        const amount = Utils.formatCurrency(transaction.amount)

        const html = 
        `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transacao">
            </td>
        `

        return html;
    },

    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = "";
    }
}



const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction);
        
        DOM.updateBalance();

        Storage.set(Transaction.all);
    },

    reload() {
        DOM.clearTransactions();
        
        App.init();
    },
}

App.init();

