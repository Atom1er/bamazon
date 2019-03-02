var inquirer = require('inquirer');
var mysql = require('mysql');
var Table = require('cli-table');
var color = require('colors');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Elvir@93',
    port: 3306,
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    displayQuestion();
});

var managerMenu = [
    {
        type: 'list',
        name: 'menu',
        message: 'What would you like to do?',
        choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Exit']
    }
];

var addToInventory = [
    {
        type : 'input',
        name: 'items_id',
        message: 'Please Enter The Id of the Item you would like to increase: ',
        validate: function(value) {
            if(isNaN(parseFloat(value))){
                return 'Please enter a number';
            } else if (value >= 1 && value <= 6) {
              return true;
            }
            return 'Sorry the Id you have entered does not match any of our item Please enter a valid Id';
          }
    },
    {
        type: 'input',
        name: 'quantityToAdd',
        message: 'How many more would you like to add?',
        validate: function(value) {
          var valid = !isNaN(parseFloat(value));
          return valid || 'Please enter a number';
        },
        filter: Number
      },

];

var newProduct = [
    {
        type: 'input',
        name: 'NewItemName',
        message: 'New Product Name:',
    },
    {
        type: 'input',
        name: 'NewItemDeparment',
        message: 'Departement:',
    },
    {
        type: 'input',
        name: 'NewQuantity',
        message: 'How many more would you like to add?',
        validate: function(value) {
          var valid = !isNaN(parseFloat(value));
          return valid || 'Please enter a number';
        },
        filter: Number
      },
      {
          type: 'input',
          name: 'NewItemPrice',
          message: 'Price:',
          validate: function(value) {
            var valid = !isNaN(parseFloat(value));
            return valid || 'Please enter a number';
          },
          filter: Number
        },
];

function displayQuestion() {
    inquirer.prompt(managerMenu).then(answers => {
        switch (answers.menu) {
            case 'View Products for Sale':
                displayProducts();
                break;
            case 'View Low Inventory':
            displayLowInventory();
                break;
            case 'Add to Inventory':
            increaseInventory();
                break;
            case 'Add New Product':
            addNewProduct();
                break;
            case 'Exit':
            connection.end();
        }
    });
}


function displayProducts() {
    connection.query('SELECT * FROM products', function (err, res) {
        if (err) throw err;
        var table = new Table({
            head: ['Id', 'Items', 'Quantity', 'Prices$'],
            colWidths: [10, 40, 10, 10],
            colAligns: ['middle', 'left', 'middle', 'right']
        });
        for (var i = 0; i < res.length; i++) {
            table.push([res[i].item_id, res[i].product_name, res[i].stock_quantity, res[i].price]);
        }
        console.log(table.toString());
        displayQuestion();
    })
}


function displayLowInventory(){
    connection.query('SELECT * FROM products WHERE stock_quantity < 15', function (err, res) {
        if (err) throw err;
        var table = new Table({
            head: ['Id', 'Items', 'Quantity', 'Prices$'],
            colWidths: [10, 40, 10, 10],
            colAligns: ['middle', 'left', 'middle', 'right']
        });
        for (var i = 0; i < res.length; i++) {
            table.push([res[i].item_id, res[i].product_name, res[i].stock_quantity, res[i].price]);
        }
        console.log(table.toString());
        displayQuestion();
    })
}



function increaseInventory(){
    inquirer.prompt(addToInventory).then(answers =>{
        var id = answers.items_id;
        var quan = answers.quantityToAdd;
        connection.query('UPDATE products SET stock_quantity = stock_quantity +'+quan+' WHERE item_id = '+id);
        console.log('Stock reloaded!');
        displayQuestion();
    })
}


function addNewProduct(){
    inquirer.prompt(newProduct).then(answers =>{
        var product_name = JSON.stringify(answers.NewItemName);
        var department_name = JSON.stringify(answers.NewItemDeparment);
        var price = answers.NewItemPrice;
        var stock_quantity = answers.NewQuantity
        connection.query("INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES("+product_name+", "+department_name+", "+price+", "+stock_quantity+")");
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~');
        console.log('~~~~'+'Product added!!!'.green+'~~~~');
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~');
        displayQuestion();
    })
}