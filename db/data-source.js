const { DataSource, Or } = require('typeorm');
const config = require('../config/index');

const User = require('../entities/User');
const Product = require('../entities/Product');
const Order = require('../entities/Order');
const Product_detail = require('../entities/Product_detail');
const Order_link_product = require('../entities/Order_link_product');
const Cart = require('../entities/Cart');
const Cart_link_product = require('../entities/Cart_link_product');
const Discount_method = require('../entities/Discount_method');
const Payment_method = require('../entities/Payment_method');
const Classification = require('../entities/Classification');
const Receiver = require('../entities/Receiver');
const User_discount_usage = require('../entities/User_discount_usage');



const dataSource = new DataSource({
  type: 'postgres',
  host: config.get('db.host'),
  port: config.get('db.port'),
  username: config.get('db.username'),
  password: config.get('db.password'),
  database: config.get('db.database'),
  synchronize: config.get('db.synchronize'),
  poolSize: 10,
  entities: [
    User,
    Product,
    Order,
    Product_detail,
    Order_link_product,
    Cart,
    Cart_link_product,
    Discount_method,
    Payment_method,
    Classification,
    Receiver,
    User_discount_usage,
  ],
  ssl: config.get('db.ssl'),
});

module.exports = { dataSource };
