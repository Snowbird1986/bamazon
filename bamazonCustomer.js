var inquirer = require('inquirer');
var mysql = require("mysql");

var connection1 = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon_DB"
});
var bamazonStore = () => {
inquirer.prompt([
    {
        type: "list",
        message: "What view would you like to see?",
        choices: ["Customer View", "Manager View", "Supervisor View","Quit"],
        name: "view"
      },
    {
      type: "input",
      message: "What is your name?",
      name: "username"
    },
    {
      type: "password",
      message: "Input Password",
      name: "password",
      default:"password"
    },
    {
      type: "confirm",
      message: "Are you sure:",
      name: "confirm",
      default: true
    }
    ])
    .then(answers => {
        switch (answers.view) {
            case 'Customer View':
            connection1.query("SELECT * FROM products", function(err, res) {
                if (err) throw err;
                var productCodes = []
                // var quantityOptions =[]
                console.log("Product IDs : Product Names : Quantity remaining")
                for(var i=0; i<res.length; i++){
                    console.log(res[i].item_id+" : "+res[i].product_name+" : "+res[i].stock_quantity)
                    var productCode = res[i].product_name;
                    productCodes.push(productCode)
                    }
                // for(var j=0;j<res.stock_quantity;j++){
                //     quantityOption = res[i].stock_quantity-j
                //     quantityOptions.push(quantityOption)
                // }
                inquirer.prompt([
                    {
                        // type: "rawlist",
                        type: "list",
                        name: "item",
                        message: "Select Item to bid on",
                        choices: productCodes,
                    },
                    {
                        type: "input",
                        message: "How many would you like to purchase?",
                        name: "number",
                    },
                ]).then(purchaseItem => {
                    connection1.query("SELECT * FROM products WHERE ?",
                            [
                                {
                                product_name: purchaseItem.item
                                }
                            ], function(err, res) {
                                console.log(res)
                                var stock = res[0].stock_quantity
                                var price = res[0].price
                                var quantity = stock-purchaseItem.number
                                var cost = price*purchaseItem.number
                                var sales = res[0].product_sales+cost
                                console.log(quantity)
                                console.log(purchaseItem.item)
                                // console.log(purchaseItem.number)
                                if(quantity>0){
                                connection1.query("UPDATE products SET ? WHERE ?",
                                    [
                                        {
                                        stock_quantity: quantity,
                                        product_sales: sales
                                        },
                                        {
                                        product_name: purchaseItem.item
                                        }
                                    ],
                                    function(err, res) {
                                        if (err) throw err;
                                        console.log("Your order has been placed. You have been charged $"+cost);
                                        bamazonStore()
                            })
                        }else{
                            console.log("Sorry for the inconvenience but we dont have enough supply.  Please try again later or order a different item.")
                        }
                    })
                })
            })
                break;
            case 'Manager View':
                if(answers.username ==="j"&&answers.password==="a"){
                    inquirer.prompt([
                        {
                            type: "list",
                            message: "What would you like to do?",
                            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory","Add New Product","Quit"],
                            name: "action"
                          },
                    ]).then(managerAction => {
                        switch (managerAction.action) {
                            case 'View Products for Sale':
                                connection1.query("SELECT * FROM products", function(err, res) {
                                if (err) throw err;
                                console.log("Product IDs : Product Names : Quantity remaining : Sale Price")
                                for(var i=0; i<res.length; i++){
                                    console.log(res[i].item_id+" : "+res[i].product_name+" : "+res[i].stock_quantity+" : "+res[i].price)
                                    }
                                bamazonStore()
                                })
                                break;
                            case 'View Low Inventory':
                                connection1.query("SELECT * FROM products WHERE stock_quantity<=5",function(err, res) {
                                    if (err) throw err;
                                    // console.log(this.sql)
                                    console.log("Product IDs : Product Names : Quantity remaining : ")
                                    for(var i=0; i<res.length; i++){
                                        console.log(res[i].item_id+" : "+res[i].product_name+" : "+res[i].stock_quantity+" : ")
                                        }
                                bamazonStore()
                                })
                             break;
                            case 'Add to Inventory':
                                connection1.query("SELECT * FROM products", function(err, res) {
                                    if (err) throw err;
                                    var productCodes = []
                                    // var quantityOptions =[]
                                    console.log("Product IDs : Product Names : Quantity remaining")
                                    for(var i=0; i<res.length; i++){
                                        console.log(res[i].item_id+" : "+res[i].product_name+" : "+res[i].stock_quantity)
                                        var productCode = res[i].product_name;
                                        productCodes.push(productCode)
                                        }
                                    // for(var j=0;j<res.stock_quantity;j++){
                                    //     quantityOption = res[i].stock_quantity-j
                                    //     quantityOptions.push(quantityOption)
                                    // }
                                    inquirer.prompt([
                                        {
                                            // type: "rawlist",
                                            type: "list",
                                            name: "item",
                                            message: "Select Item to bid on",
                                            choices: productCodes,
                                        },
                                        {
                                            type: "input",
                                            message: "What should inventory be?",
                                            name: "invAmount"
                                        },
                                    ]).then(updateItem => {
                                        connection1.query(
                                            "UPDATE products SET ? WHERE ?",
                                            [
                                            {
                                                stock_quantity: updateItem.invAmount
                                            },
                                            {
                                                product_name: updateItem.item
                                            }
                                            ],
                                            function(err, res) {
                                                if (err) throw err;
                                                console.log(res.affectedRows + " products updated!\n");
                                                bamazonStore()
                                            })
                                    })
                                })
                                break;
                            case 'Add New Product':
                                inquirer.prompt([
                                    {
                                    type: "input",
                                    message: "Product Name?",
                                    name: "product_name"
                                    },
                                    {
                                        type: "input",
                                        message: "Department Name?",
                                        name: "department_name"
                                    },
                                    {
                                        type: "input",
                                        message: "Price?",
                                        name: "price"
                                    },
                                    {
                                        type: "input",
                                        message: "Quantity?",
                                        name: "stock_quantity"
                                    },
                                    ]).then(itemAnswers => {
                                        connection1.query("INSERT INTO products SET ?",
                                        {
                                            product_name: itemAnswers.product_name,
                                            department_name: itemAnswers.department_name,
                                            price: itemAnswers.price,
                                            stock_quantity: itemAnswers.stock_quantity
                                        }, function(err, res) {
                                            if (err) throw err;
                                            console.log(res.affectedRows + " products updated!\n");
                                            bamazonStore()
                                        })
                                    })
                                break;
                            case 'Quit':
                                connection1.end();
                                break;
                            default:
                                console.log("Incorrect input")
                        }
                    })
                }
                else{
                    console.log("Incorrect Username and/or Password, please try again.")
                    bamazonStore()
                }
                break;
            case 'Supervisor View':
                if(answers.username ==="k"&&answers.password==="b"){
                    inquirer.prompt([
                        {
                            type: "list",
                            message: "What would you like to do?",
                            choices: ["View Product Sales by Department", "Create New Department","Quit"],
                            name: "action"
                          },
                    ]).then(managerAction => {
                        switch (managerAction.action) {
                            case 'View Product Sales by Department':
                                connection1.query("SELECT departments.department_id, departments.department_name, departments.over_head_costs, products.department_name, sum(products.product_sales) AS Department_Sales FROM departments LEFT JOIN products ON departments.department_name=products.department_name GROUP BY departments.department_id, departments.department_name", function(err, res) {
                                    if (err) throw err;
                                    console.log(this.sql)
                                    console.log(res)
                                    console.log("Department IDs : Department Names : over_head_costs : product_sales : total_profit")
                                    for(var i=0; i<res.length; i++){
                                        overhead = res[i].over_head_costs
                                        income = res[i].Department_Sales
                                        profit = income-overhead
                                        console.log(res[i].department_id+" : "+res[i].department_name+" : "+res[i].over_head_costs+" : "+res[i].Department_Sales+" : "+profit)
                                        }
                                    bamazonStore()
                                    })
                                break;
                            case 'Create New Department':
                            inquirer.prompt([
                                {
                                type: "input",
                                message: "department_name?",
                                name: "department_name"
                                },
                                {
                                type: "input",
                                message: "Over Head Costs?",
                                name: "over_head_costs"
                                },
                                ]).then(departmentDetails => {
                                    connection1.query("INSERT INTO departments SET ?",
                                        {
                                            department_name: departmentDetails.department_name,
                                            over_head_costs: departmentDetails.over_head_costs
                                        }, function(err, res) {
                                            if (err) throw err;
                                            console.log(res.affectedRows + " products updated!\n");
                                            bamazonStore()
                                        })
                                })
                                break;
                            case 'Quit':
                                connection1.end();
                                break;
                            default:
                                console.log("Incorrect input")
                        }
                    })
                }
                else{
                    console.log("Incorrect Username and/or Password, please try again.")
                    bamazonStore()
                }
                break;
            case 'Quit':
                connection1.end();
                break;
            default:
                console.log("Incorrect input")
            }
        })
    }
    bamazonStore()