const cloudinary = require('cloudinary').v2;
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('ProductsController');
const Classification = require('../entities/Classification');
const { Between, Not, In } = require('typeorm');
const { isNotValidInteger, isNotValidString } = require('../utils/validUtils');
const { uploadMultipleBuffersToCloudinary } = require('../utils/uploadMulter');

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

      const {
        id,
        name,
        image_url,
        image_urls,
        stock,
        origin_price,
        price,
        is_enable,
        Product_detail,
      } = findProduct;
      const {
        id: detailId,
        name: detailName,
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
        detailId,
        detailName,
        is_enable,
        id,
        classification_name: Classification.name,
        name,
        price,
        origin_price,
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

  // 後台 - 取得新增用的商品基本資訊
  async getCreateProductInfo(req, res, next) {
    try {
      const { detail_id } = req.params;
      const productDetailRepository = dataSource.getRepository('Product_detail');

      const productDetail = await productDetailRepository.findOne({
        where: { id: detail_id },
        relations: ['Classification'],
        select: {
          id: true,
          name: true,
          origin: true,
          feature: true,
          variety: true,
          process_method: true,
          acidity: true,
          flavor: true,
          aftertaste: true,
          description: true,
          Classification: {
            id: true,
            name: true,
          },
        },
      });

      if (!productDetail) {
        return res.status(400).json({
          message: '查無此商品基本資料',
        });
      }

      res.status(200).json({
        message: '取得商品資訊成功',
        data: {
          productDetail,
        },
      });
    } catch (error) {
      logger.error('取得資訊失敗', error);
      next(error);
    }
  },

  // 後台 - 新增商品 (Product)
  async createProduct(req, res, next) {
    try {
      const { id, product_detail_id, name, origin_price, price, stock, is_enable } = req.body;

      if (
        !id ||
        !product_detail_id ||
        !name ||
        !origin_price ||
        !price ||
        !stock ||
        typeof is_enable === 'undefined'
      ) {
        return res.status(400).json({ message: '請填寫完整產品資訊' });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: '請至少上傳 1 張圖片' });
      }

      if (req.files.length > 6) {
        return res.status(400).json({ message: '最多只能上傳 6 張圖片' });
      }

      // 多張上傳
      const images = await uploadMultipleBuffersToCloudinary(req.files, 'product_uploads');
      const imageUrls = images.map(img => img.secure_url);

      const productRepository = dataSource.getRepository('Product');
      const productDetailRepository = dataSource.getRepository('Product_detail');

      const existingProduct = await productRepository.findOne({ where: { id } });
      if (existingProduct) {
        return res.status(400).json({ message: '商品編號已存在，請使用其他編號' });
      }

      const productDetail = await productDetailRepository.findOne({
        where: { id: product_detail_id },
        relations: ['Classification'],
      });

      if (!productDetail) {
        return res.status(400).json({ message: '找不到對應的商品基本資料' });
      }

      const newProduct = productRepository.create({
        id,
        product_detail_id: productDetail.id,
        Product_detail: productDetail,
        name,
        origin_price,
        price,
        stock,
        image_urls: imageUrls,
        is_enable,
      });

      await productRepository.save(newProduct);

      res.status(201).json({
        message: '商品新增成功',
        data: newProduct,
      });
    } catch (error) {
      logger.error('新增商品失敗', error);
      next(error);
    }
  },

  // 後台 - 更新商品 (Product) + 刪除商品圖片
  async updateProduct(req, res, next) {
    try {
      const { product_id } = req.params;
      const { name, origin_price, price, stock, is_enable, delete_image_urls } = req.body;

      const productRepository = dataSource.getRepository('Product');

      const product = await productRepository.findOne({
        where: { id: product_id },
      });

      if (!product) return res.status(404).json({ message: '查無此商品' });

      // 驗證格式
      const numFields = ['origin_price', 'price', 'stock'];
      for (const field of numFields) {
        if (
          req.body[field] !== undefined &&
          req.body[field] !== '' &&
          isNaN(Number(req.body[field]))
        ) {
          return res.status(400).json({ message: '欄位格式填寫錯誤' });
        }
      }

      if (req.body.is_enable !== undefined && req.body.is_enable !== '') {
        const val = req.body.is_enable;
        if (val !== true && val !== false && val !== 'true' && val !== 'false') {
          return res.status(400).json({ message: '欄位格式填寫錯誤' });
        }
      }

      if (req.body.name !== undefined && req.body.name !== '' && req.body.name.length > 50)
        return res.status(400).json({ message: '字數大於或小於限制，請重新調整' });

      const intFields = ['origin_price', 'price', 'stock'];
      for (const field of intFields) {
        if (req.body[field] !== undefined && req.body[field] !== '') {
          const num = Number(req.body[field]);
          if (num > 9999 || num < 0) {
            return res.status(400).json({ message: '字數大於或小於限制，請重新調整' });
          }
        }
      }

      // 更新商品資訊
      if (name && name !== '') product.name = name;
      if (origin_price && origin_price !== '') product.origin_price = Number(origin_price);
      if (price && price !== '') product.price = Number(price);
      if (stock && stock !== '') product.stock = Number(stock);
      if (typeof is_enable !== 'undefined' && is_enable !== '') {
        product.is_enable = is_enable === 'true' || is_enable === true;
      }

      // 刪除指定舊圖片
      let deleteUrls = delete_image_urls;
      if (delete_image_urls && typeof delete_image_urls === 'string') {
        try {
          deleteUrls = JSON.parse(delete_image_urls);
        } catch (e) {
          return res.status(400).json({ message: 'delete_image_urls 格式錯誤' });
        }
      }
      if (!Array.isArray(deleteUrls)) deleteUrls = [];

      const notFound = deleteUrls.filter(url => !product.image_urls.includes(url));
      if (notFound.length > 0) return res.status(400).json({ message: '選擇的圖片不存在' });

      const remainingImages = product.image_urls.length - deleteUrls.length;
      const totalAfterUpdate = remainingImages + (req.files?.length || 0);

      if (totalAfterUpdate > 6) return res.status(400).json({ message: '圖片總數最多 6 張' });
      if (totalAfterUpdate < 1) return res.status(400).json({ message: '商品圖片至少要保留 1 張' });

      for (const url of deleteUrls) {
        const match = url.match(/\/product_uploads\/(.+)\.(jpg|png|jpeg)$/);
        if (match) {
          const publicId = `product_uploads/${match[1]}`;
          await cloudinary.uploader.destroy(publicId);
        }
      }

      product.image_urls = product.image_urls.filter(url => !deleteUrls.includes(url));

      // 上傳新圖片
      if (req.files && req.files.length > 0) {
        const images = await uploadMultipleBuffersToCloudinary(req.files, 'product_uploads');
        const imageUrls = images.map(img => img.secure_url);
        product.image_urls.push(...imageUrls);
      }

      await productRepository.save(product);

      res.status(200).json({
        status: 'Success',
        message: '商品更新成功',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = productsController;
