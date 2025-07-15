const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('ProductsController');
const Classification = require('../entities/Classification');
const { Between, Not, In } = require('typeorm');
const { isNotValidInteger, isNotValidString } = require('../utils/validUtils');

const productsController = {
  // 取得所有產品簡易資訊
  async getProducts(req, res, next) {
    try {
      const { page, classification } = req.query;
      const perPage = 6;
      const pageNum = Number(page);

      if (isNotValidInteger(pageNum) || isNaN(pageNum) || pageNum < 1) {
        logger.warn('查無此頁數');
        res.status(400).json({
          message: '查無此頁數',
        });
        return;
      }

      const classificationRepo = dataSource.getRepository('Classification');
      let classificationCondition = {};

      if (classification) {
        const findClassification = await classificationRepo.findOne({
          where: { name: classification },
        });

        if (isNotValidString(classification) || !findClassification) {
          logger.warn('查無此分類');
          res.status(400).json({
            message: '查無此分類',
          });
          return;
        }

        classificationCondition = {
          Product_detail: {
            classification_id: findClassification.id,
          },
        };
      }

      const productRepo = dataSource.getRepository('Product');
      const [products, totalCount] = await productRepo.findAndCount({
        relations: ['Product_detail'],
        where: classificationCondition,
        take: perPage,
        skip: perPage * (pageNum - 1),
      });

      const productResult = products.map(product => ({
        id: product.id,
        name: product.name,
        image_url: product.image_url,
        feature: product.Product_detail.feature,
        price: product.price,
        stock: product.stock,
      }));

      const allClassifications = await classificationRepo.find({
        select: ['id', 'name'],
      });

      res.status(200).json({
        message: '成功',
        data: {
          products: productResult,
          total: totalCount,
          classification: allClassifications,
        },
      });
    } catch (error) {
      logger.error('伺服器錯誤', error);
      next(error);
    }
  },

  // 取得單一商品詳細資訊
  async getProductId(req, res, next) {
    try {
      const { product_id } = req.params;
      const productRepo = dataSource.getRepository('Product');

      const findProduct = await productRepo.findOne({
        where: { id: product_id },
        relations: ['Product_detail', 'Product_detail.Classification'],
      });

      if (!findProduct) {
        logger.warn('查無此商品');
        res.status(400).json({
          message: '查無此商品',
        });
        return;
      }

      const { id, name, image_url, image_urls, stock, price, Product_detail } = findProduct;
      const {
        origin,
        feature,
        variety,
        process_method,
        acidity,
        flavor,
        aftertaste,
        description,
        Classification,
      } = Product_detail;

      const result = {
        id,
        classification_name: Classification.name,
        name,
        origin,
        image_url,
        image_urls,
        stock,
        feature,
        variety,
        process_method,
        acidity,
        flavor,
        aftertaste,
        price,
        description,
      };

      res.status(200).json({
        message: '成功',
        data: result,
      });
    } catch (error) {
      logger.error('伺服器錯誤', error);
      next(error);
    }
  },

  // 取得熱賣商品清單
  async getBestSeller(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      const orderLinkProductRepo = dataSource.getRepository('Order_link_product');

      // 設定預設時間範圍（如果沒有提供）
      const startDate = start_date
        ? new Date(start_date)
        : new Date(new Date().setDate(new Date().getDate() - 30)); // 預設30天
      const endDate = end_date ? new Date(end_date) : new Date();

      const bestSellers = await orderLinkProductRepo.find({
        relations: ['Order', 'Product', 'Product.Product_detail'],
        where: {
          Order: {
            created_at: Between(startDate, endDate),
            // status: 'completed',
          },
        },
      });

      // 計算每個商品的總銷售數量
      const productSales = bestSellers.reduce((acc, curr) => {
        if (!acc[curr.product_id]) {
          acc[curr.product_id] = {
            product_id: curr.product_id,
            total_quantity: 0,
            Product: curr.Product,
          };
        }
        acc[curr.product_id].total_quantity += curr.quantity;
        return acc;
      }, {});

      // 轉換為陣列並排序，預設只取前四名(首頁使用)，購物車調整參數 limit = 12
      const limit = parseInt(req.query.limit) || 4;
      const topProducts = Object.values(productSales)
        .sort((a, b) => b.total_quantity - a.total_quantity)
        .slice(0, limit)
        .map(product => ({
          id: product.product_id,
          name: product.Product.name,
          image_url: product.Product.image_url,
          origin: product.Product.Product_detail.origin,
          feature: product.Product.Product_detail.feature,
          description: product.Product.Product_detail.description,
          price: product.Product.price,
          stock: product.Product.stock,
        }));

      res.status(200).json({
        message: '成功',
        data: topProducts,
      });
    } catch (error) {
      next(error);
    }
  },

  // 取得其他商品
  async getExtras(req, res, next) {
    try {
      const productRepo = dataSource.getRepository('Product');

      const extras = await productRepo.find({
        relations: ['Product_detail'],
        where: {
          Product_detail: {
            classification_id: 5,
          },
        },
        order: {
          created_at: 'DESC',
        },
        take: 6,
      });

      const result = extras.map(product => ({
        id: product.id,
        name: product.name,
        image_url: product.image_url,
        description: product.Product_detail.description,
        price: product.price,
      }));

      res.status(200).json({
        message: '取得成功',
        data: result,
      });
    } catch (error) {
      logger.error('伺服器錯誤', error);
      next(error);
    }
  },
};

module.exports = productsController;
