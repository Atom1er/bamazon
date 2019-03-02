CREATE DATABASE bamazon;
USE bamazon;

CREATE TABLE products(
item_id INT AUTO_INCREMENT NOT NULL,
product_name VARCHAR(50) NOT NULL,
department_name VARCHAR(50) NOT NULL,
price FLOAT NOT NULL,
stock_quantity INT NOT NULL,
PRIMARY KEY (item_id)
);

ALTER TABLE products MODIFY product_sales INT;

CREATE TABLE departments(
   log_id INT AUTO_INCREMENT NOT NULL,
   log_Operiod DATE NOT NULL,
   log_Eperiod DATE NOT NULL,
   over_head_costs INT,
   sold INT,
   interest INT,
   PRIMARY KEY (log_id)
);
INSERT INTO departments(log_Operiod, log_Eperiod, over_head_costs, sold, interest) value();

ALTER TABLE products ADD COLUMN purchase_price INT NOT NULL DEFAULT 0;
SELECT * FROM departments;
DROP TABLE departments;
SELECT * FROM products ;
SELECT * FROM products WHERE department_name = Electronics ;
SELECT department_name, product_sales, price, purchase_price FROM products ORDER BY department_name; 
SELECT department_name, COUNT(item_id), SUM(product_sales) FROM products GROUP BY department_name; -- ORDER BY COUNT(product_sales) DESC



UPDATE products SET purchase_price = products.price - 25 WHERE item_id = 15;

INSERT INTO products(product_name, department_name, price, stock_quantity)
 VALUES ('POWERADD MusicFly Bluetooth/Wireless Speakers', 'Electronics', '45', '10');
 
 INSERT INTO products(product_name, department_name, price, stock_quantity)
 VALUES ('AOMAIS 25W Bluetooth Speakers', 'Electronics', '50', '13');
 
INSERT INTO products(product_name, department_name, price, stock_quantity)
 VALUES ('NAVY XS', 'flags', 150, 23);
 UPDATE `bamazon`.`products` SET `product_sales` = '0' WHERE (`item_id` = '1');
UPDATE `bamazon`.`products` SET product_sales = product_sales + 1 WHERE (item_id = 1);
 UPDATE products SET stock_quantity = stock_quantity - 2 , product_sales = product_sales +1 WHERE item_id = 1;
 UPDATE products SET price = 10 WHERE item_id = 7;
  UPDATE products SET product_sales = 1 + product_sales WHERE item_id = 2;