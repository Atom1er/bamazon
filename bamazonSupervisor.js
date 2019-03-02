var inquirer = require('inquirer');
var mysql = require('mysql');
var Table = require('cli-table');
var color = require('colors');

//Mysql Connection
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Elvir@93',
  port: 3306,
  database: "bamazon"
});

//Object for promts question
var supervisorQuestion = [
  {
    type: 'list',
    name: 'menu',
    message: 'What would you like to do?',
    choices: ['View Product Sales by Department', 'Create a log', 'Exit']
  }

]

var newLog = [
  {
    type: 'input',
    name: 'closingDate',
    message: 'Starting Period ("YYYY-MM-DD"):'
  },
  {
    name: 'update',
    message: 'OverHead Cost: ',
    type: 'input',
    validate: function (value) {
      var valid = !isNaN(parseFloat(value));
      return valid || 'Please enter a number';
    },
    filter: Number
  }
]


// Setting an over_head_costs for the whole 'store'
var over_head_costs = 300;

//Function for prompt displaying and Supervisor request handling
function displayQuestion() {
  inquirer.prompt(supervisorQuestion).then(answers => {
    switch (answers.menu) {
      case 'View Product Sales by Department':
        viewProductSales();
        break;
      case 'Create a log':
        overHeadCosts();
        break;
      case 'Exit':
        connection.end();
    }
  });
}

// Function for products displaying and operation on database
function viewProductSales() {
  //Showing products in the database
  connection.query('SELECT department_name, SUM(product_sales) FROM products GROUP BY department_name;', function (err, res) {
    if (err) throw err;
    // Generating a table to handle data from database
    var table = new Table({
      head: ['Deparment Name', 'Total item sold'],
      colWidths: [40, 30],
      colAligns: ['middle', 'right']
    });
    for (var i = 0; i < res.length; i++) {
      table.push([res[i].department_name, res[i]['SUM(product_sales)']]);
    }
    console.log(table.toString());
    // Prompt for more details
    inquirer.prompt({
      name: 'more',
      message: 'See more details (sales by product)?',
      type: 'confirm',
      initial: true
    }).then(answers => {
      if (answers.more) {
        // Requesting more details about sales
        connection.query('SELECT product_name, department_name, product_sales, price, purchase_price FROM products ORDER BY department_name;', function (err, response) {
          if (err) throw err;
          // Table to handle response from database
          var tab = new Table({
            head: ['Product', 'Deparment', 'Total sold', 'Unit price', 'Purchased price', 'Profit'],
            colWidths: [40, 20, 15, 15, 15, 15],
            colAligns: ['left', 'left', 'middle', 'right', 'right', 'right']
          });

          var profits = 0;

          for (var i = 0; i < response.length; i++) {
            // Calculating profit based on :
            // 1- Purchase_Price(How much did the saler get those item) 
            // 2- Sold_price(How much did the customer buy them)
            // 3- over_head_costs
            var profit = response[i].product_sales * (response[i].price - response[i].purchase_price);
            profits = profits + profit;
            // Pushing Everything into the table
            tab.push([response[i].product_name, response[i].department_name, response[i].product_sales, response[i].price, response[i].purchase_price, profit]);
          }


          console.log(tab.toString());
          console.log('+~~~~~~~~~~~~~~~~~~~~~~~~~~~~+');
          var profitBO = profits;
          console.log('Total Sales: $' + profitBO);
          // profits = profits - over_head_costs;
          // console.log('Current OverHead Cost: $' + over_head_costs);
          // console.log('Total profit: $' + profits);
          console.log('+~~~~~~~~~~~~~~~~~~~~~~~~~~~~+');
          inquirer.prompt(
            {
              type: 'list',
              name: 'option',
              message: '',
              choices: ['View Interest Based on Current Overhead Cost : $', 'Go back to the main Menu', 'Create a log']
            }
          ).then(answer => {
            switch (answer.option) {
              case 'View Interest Based on Current Overhead Cost':
                inquirer.prompt({
                  type: 'input',
                  name: 'CurrentOHC',
                  message:'Please enter the current Overhead Cost'
                }).then(ans =>{
                  var oHC = parseFloat(ans.CurrentOHC);
                  department(response, oHC);
                })

                break;
              case 'Go back to the main Menu':
                displayQuestion();
                break;
              case 'Create a log':
                overHeadCosts();
                break;
            }
          })

        })
      } else if (!answers.more) {
        displayQuestion();
      }
    })


  })
}


function Department(department_name, departmentSales, departmentExpense, overHeadC, closingDate){
this.department_name = department_name;
this.departmentSales = departmentSales;
this.departmentExpense = departmentExpense;
this.overHeadC = overHeadC;
this.closingDate = closingDate
}


function overHeadCosts() {
  inquirer.prompt(newLog).then(answers => {
    var departmentLog = [];
    var interests = 0;
    // console.log(answers);
    connection.query('SELECT product_name, department_name, product_sales, price, purchase_price FROM products ORDER BY department_name;', function (error, response) {
      if (error) throw error;
    connection.query('SELECT department_name FROM bamazon.products GROUP BY department_name;', function (err, res) {
      if (err) throw err;
      // console.log(res);

        for (var d = 0; d < res.length; d++) {
          var departmentExp = 0;
          var departmentSale = 0;
          
          for (var i = 0; i < response.length; i++) {
          if (res[d].department_name == response[i].department_name) {
            departmentSale = departmentSale + (response[i].product_sales * response[i].price);
            departmentExp = departmentExp + (response[i].product_sales * response[i].purchase_price)
            // console.log(departmentSale+'-'+departmentExp);
            // INSERT INTO departments(log_Operiod, log_Eperiod, over_head_costs, sold, interest) value();
          }
        }
       var department_temp = new Department(res[d].department_name, departmentSale, departmentExp, answers.update, answers.closingDate);
       
       departmentLog.push(department_temp);

      }
      // console.log(departmentLog[0].department_name);
      for(var j = 0; j<departmentLog.length; j++){
      interests = departmentLog[j].departmentSales - departmentLog[j].departmentExpense;
      connection.query('INSERT INTO bamazon.departments (over_head_costs, sold, interest, closing_date, department_name) VALUES (? , ? , ? , ? , ?);', [answers.update, departmentLog[j].departmentSales, interests, answers.closingDate, departmentLog[j].department_name]);
      }
      console.log('New Log Saved!');
      displayQuestion();
    });

  });
 
  });
}


var departmentSales = 0;
var departmentExpense = 0;

function department(response, ohc) {

  connection.query('SELECT department_name FROM bamazon.products GROUP BY department_name;', function (err, res) {
    if (err) throw err;
    // console.log(res);
    for (var i = 0; i < response.length; i++) {
      for (var d = 0; d < res.length; d++) {
        if (res[d].department_name == response[i].department_name) {
          departmentSales = departmentSales + (response[i].product_sales * response[i].price);
          departmentExpense = departmentExpense + (response[i].product_sales * response[i].purchase_price)
          // INSERT INTO departments(log_Operiod, log_Eperiod, over_head_costs, sold, interest) value();
        }
      }
    }
    var interest = departmentSales - (departmentExpense + ohc);
    console.log('+===============================+');
    console.log('Department_sale: $' + departmentSales);
    console.log('Department_Expenses: $' + departmentExpense);
    console.log('+-------------------------------+');
    console.log('Over Head Cost: $' + ohc);
    console.log('+-------------------------------+');
    console.log('Department_Interest: $' + interest);
    console.log('+===============================+');
    displayQuestion();
  });


}

// Connecting to Mysql Server
connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  displayQuestion();
});
