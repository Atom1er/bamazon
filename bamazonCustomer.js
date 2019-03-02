var inquirer = require('inquirer');
var mysql = require('mysql');
var Table = require('cli-table');
var color = require('colors');

var connection = mysql.createConnection({
    host: 'localhost',
    user:'root',
    password: 'Elvir@93',
    port: 3306,
    database: "bamazon"
});

  
var questions = [
    {
        type : 'input',
        name: 'items_id',
        message: 'Please Enter The Id of the Item you would like to purchase: ',
        validate: function(value) {
            if(isNaN(parseFloat(value))){
                return 'Please enter a number';
            } else if (value >= 1 && value <= 15) {
              return true;
            }
      
            return 'Sorry the Id you have entered does not match any of our item Please enter a valid Id';
          }
    },
    {
        type: 'input',
        name: 'quantity',
        message: 'How many do you need?',
        validate: function(value) {
          var valid = !isNaN(parseFloat(value));
          return valid || 'Please enter a number';
        },
        filter: Number
      },

];

var confirm = [
    {
        type: 'rawlist',
        name: 'PlaceOrder',
        message: 'Place Your Order?',
        choices: ['Yes, Place Order!', 'No, Continue Shopping']
    }
]

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    displayProducts();
  });
  
  function displayProducts(){
    connection.query('SELECT * FROM products', function(err, res){
        if (err) throw err;
        var table = new Table({
            head: ['Id', 'Items', 'Prices$'],
            colWidths: [10, 40, 10],
            colAligns:['middle', 'left', 'right']
        });
        for(var i = 0; i < res.length; i++){
            table.push([res[i].item_id , res[i].product_name, res[i].price]);
        }
        console.log(table.toString());
        displayQuestion(res);

    })
  }

  var id;
  var quantity;
  var price;
  var productName;

  function displayQuestion(res){
      inquirer.prompt(questions).then(answers => {
          id = (answers.items_id - 1);
          quantity = answers.quantity;
          var stock = res[id].stock_quantity - quantity;
          price = res[id].price;
          productName = res[id].product_name;
        Confirmation(id, quantity, price, productName);
        // connection.end();
        // 
      });
  }
var cart = [];
var total = 0;

function Products(ids, quantities, prices, productName){
  this.id = ids,
  this.quantity = quantities,
  this.price = prices,
  this.name = productName
}



function Confirmation(id, quan, price, name){
    var product = new Products(id, quan, price, name);
    total = total + (price*quan);
    // var product_sales = quanti * 
    cart.push(product);
    // console.log('Cart : '+ JSON.stringify(cart));
    inquirer.prompt(confirm).then(answers => {

      // If Order place == true
      if(answers.PlaceOrder == 'Yes, Place Order!'){
        console.log('+~~~~~~~~~~~~~~~+');
        console.log('-Order placed! :)'.bgGreen.yellow);
        console.log('--- Order receip:'.bgGreen.white);
        console.log('+~~~~~~~~~~~~~~~+');
        var table = new Table({
          head: ['Items'.green, 'Prices$'.yellow, 'Quantity'.blue],
          colWidths: [45, 10, 10],
          colAligns:['left', 'right', 'middle']
        });

        for(var i = 0; i < cart.length; i++){
          table.push([cart[i].name, cart[i].price, cart[i].quantity]);
           var quanti = parseFloat(cart[i].quantity);
           var id = parseFloat(cart[i].id)+1;
          //  console.log("UPDATE `bamazon`.`products` SET `product_sales` = `product_sales` + 1 WHERE (item_id = "+id+");");
          connection.query("UPDATE `bamazon`.`products` SET stock_quantity = stock_quantity - ? WHERE item_id = ? ;", [quanti, id]);
          for (j=0; j < quanti ; j++){
            connection.query("UPDATE `bamazon`.`products` SET product_sales = product_sales + 1 WHERE (item_id = ?);", [id]);
            console.log('We got here');
          }
          
        };
        
        console.log(table.toString());
        console.log('Total: '.red +'$'+total);
        console.log('Thank you for choosing Bamazon!');
        

      }
      // If Order place == !true
      else if(answers.PlaceOrder == 'No, Continue Shopping'){
        displayProducts();
      }
    })
  }


