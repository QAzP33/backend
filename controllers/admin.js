const bcrypt = require('bcrypt');
const { IsNull, In, Between } = require('typeorm');

const config = require('../config/index');
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('UsersController');
const {
  isNotValidInteger,
  isNotValidString,
  isUndefined,
  isNotValidPassword,
  isNotValidName,
  isNotValidEmail,
  isNotValidGender,
  isNotValidBirthday,
  isNotValidTaiwanMobile,
  isNotValidTaiwanAddressAdvanced,
} = require('../utils/validUtils');
const generateJWT = require('../utils/generateJWT');

const adminController = {
  async getClassification(req, res, next) {
    try {
      const getClass = await dataSource.getRepository('Classification').find({
        select: ['id', 'name'],
      });

      res.status(201).json({
        message: '取得成功',
        data: getClass,
      });
    } catch (error) {
      logger.error('伺服器錯誤', error);
      next(error);
    }
  },

  async postClassification(req, res, next) {
    try {
      const { name } = req.body;
      if (isUndefined(name) || isNotValidString(name)) {
        res.status(400).json({
          message: '欄位未填寫正確',
        });
        return;
      }
      if (name.length < 2 || name.length > 20) {
        res.status(400).json({
          message: '錯誤的名稱格式',
        });
        return;
      }
      const ClassificationRepo = dataSource.getRepository('Classification');
      const exitClassification = await ClassificationRepo.findOne({
        where: { name },
      });

      if (exitClassification) {
        res.status(400).json({
          message: '資料重複',
        });
        return;
      }
      const newClassification = ClassificationRepo.create({ name });
      const result = await ClassificationRepo.save(newClassification);

      res.status(201).json({
        message: '新增成功',
        data: {
          id: result.id,
          name: result.name,
        },
      });
    } catch (error) {
      logger.error('伺服器錯誤', error);
      next(error);
    }
  },

  async postProduct(req, res, next) {
    try {
      const { id, product_detail_id, name, origin_price, price, stock, image_url, is_enable } =
        req.body;

      if (
        isUndefined(id) ||
        isUndefined(name) ||
        isNotValidString(name) ||
        isUndefined(origin_price) ||
        isUndefined(price) ||
        isUndefined(stock) ||
        isUndefined(image_url) ||
        isUndefined(is_enable)
      ) {
        logger.warn('新增商品錯誤: 欄位未填寫正確');
        res.status(400).json({
          message: '欄位未填寫正確',
        });
        return;
      }

      if (name.length > 50) {
        logger.warn('新增商品錯誤: 商品名稱超過長度限制');
        res.status(400).json({
          message: '商品名稱超過長度限制',
        });
        return;
      }

      if (isNotValidInteger(origin_price) || isNotValidInteger(price)) {
        logger.warn('新增商品錯誤: 價格不能為負數');
        res.status(400).json({
          message: '價格不能為負數',
        });
        return;
      }

      if (stock < 0) {
        logger.warn('新增商品錯誤: 庫存不能為負數');
        res.status(400).json({
          message: '庫存不能為負數',
        });
        return;
      }

      const productDetailRepo = dataSource.getRepository('Product_detail');
      const findProductDetail = await productDetailRepo.findOne({
        where: { id: product_detail_id },
      });

      if (!findProductDetail) {
        logger.warn('新增商品錯誤: 查無此商品詳情');
        res.status(400).json({
          message: '查無此商品詳情',
        });
        return;
      }

      const productRepo = dataSource.getRepository('Product');
      const exitProduct = await productRepo.findOne({
        where: { id },
      });
      if (exitProduct) {
        res.status(400).json({
          message: '商品 ID 重複',
        });
        return;
      }
      const newProduct = productRepo.create({
        id,
        product_detail_id,
        name,
        origin_price,
        price,
        stock,
        image_url,
        is_enable,
      });

      const savedProduct = await productRepo.save(newProduct);

      const result = await productRepo.findOne({
        where: { id: savedProduct.id },
        relations: ['Product_detail', 'Product_detail.Classification'],
      });

      res.status(200).json({
        message: '新增成功',
        data: {
          id: result.id,
          product_detail_id: result.Product_detail.id,
          name: result.name,
          origin_price: result.origin_price,
          price: result.price,
          stock: result.stock,
          image_url: result.image_url,
          is_enable: result.is_enable,
          detail: {
            id: result.Product_detail.id,
            origin: result.Product_detail.origin,
            feature: result.Product_detail.feature,
            variety: result.Product_detail.variety,
            process_method: result.Product_detail.process_method,
            acidity: result.Product_detail.acidity,
            flavor: result.Product_detail.flavor,
            aftertaste: result.Product_detail.aftertaste,
            description: result.Product_detail.description,
            classification: result.Product_detail.Classification.name,
          },
        },
      });
    } catch (error) {
      logger.error('新增商品資訊錯誤:', error);
      next(error);
    }
  },

  // 取得單一商品資訊(Product entity)
  async getProductId(req, res, next) {
    try {
      const { id } = req.params;
      const productRepo = dataSource.getRepository('Product');
      const findProduct = await productRepo.find({
        where: { id },
        relations: ['Product_detail', 'Product_detail.Classification'],
      });

      const result = findProduct.map(product => ({
        id: product.id,
        product_detail_id: product.Product_detail.id,
        name: product.name,
        origin_price: product.origin_price,
        price: product.price,
        stock: product.stock,
        image_url: product.image_url,
        is_enable: product.is_enable,
        detail: {
          origin: product.Product_detail.origin,
          name: product.Product_detail.name,
          feature: product.Product_detail.feature,
          variety: product.Product_detail.variety,
          process_method: product.Product_detail.process_method,
          acidity: product.Product_detail.acidity,
          flavor: product.Product_detail.flavor,
          aftertaste: product.Product_detail.aftertaste,
          description: product.Product_detail.description,
          classification: product.Product_detail.Classification.name,
        },
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

  // 修改商品資訊(Product entity)
  async putProductId(req, res, next) {
    try {
      const { id, name, product_detail_id, origin_price, price, stock, image_url, is_enable } =
        req.body;

      const productDetailRepo = dataSource.getRepository('Product_detail');
      const productRepo = dataSource.getRepository('Product');
      const findProductDetail = await productDetailRepo.findOneBy({ id: product_detail_id });

      const newProduct = productRepo.create({
        id,
        name,
        origin_price,
        price,
        stock,
        image_url,
        is_enable,
        Product_detail: findProductDetail,
      });

      const saveProduct = await productRepo.save(newProduct);

      const createProduct = await productRepo.findOne({
        where: { id: saveProduct.id },
        relations: ['Product_detail'],
      });

      const result = {
        product: [
          {
            id: createProduct.id,
            name: createProduct.name,
            product_detail_id: createProduct.Product_detail.id,
            origin_price: createProduct.origin_price,
            price: createProduct.price,
            stock: createProduct.stock,
            image_url: createProduct.image_url,
            is_enable: createProduct.is_enable,
            detail: {
              name: createProduct.Product_detail.name,
              description: createProduct.Product_detail.description,
              feature: createProduct.Product_detail.feature,
            },
          },
        ],
      };

      res.status(201).json({
        message: '新增成功',
        data: result,
      });
    } catch (error) {
      logger.error('伺服器錯誤', error);
      next(error);
    }
  },

  async getProductDetail(req, res, next) {
    try {
      const productDetailRepo = dataSource.getRepository('Product_detail');

      const details = await productDetailRepo.find({
        relations: ['Classification'],
      });

      const result = details.map(detail => ({
        id: detail.id,
        name: detail.name,
        origin: detail.origin,
        feature: detail.feature,
        variety: detail.variety,
        process_method: detail.process_method,
        acidity: detail.acidity,
        flavor: detail.flavor,
        aftertaste: detail.aftertaste,
        description: detail.description,
        classification_id: detail.classification_id,
        classification_name: detail.Classification?.name || null,
      }));

      res.status(200).json({
        message: '取得成功',
        data: result,
      });
    } catch (error) {
      logger.error('取得商品詳情失敗:', error);
      next(error);
    }
  },

  async postProductDetail(req, res, next) {
    try {
      const {
        name,
        origin,
        feature,
        variety,
        process_method,
        acidity,
        flavor,
        aftertaste,
        description,
        classification_id,
      } = req.body;

      if (
        isUndefined(name) ||
        isUndefined(origin) ||
        isUndefined(feature) ||
        isUndefined(description) ||
        isUndefined(classification_id)
      ) {
        logger.warn('新增商品詳情錯誤: 欄位未填寫正確');
        res.status(400).json({
          message: '欄位未填寫正確',
        });
        return;
      }

      if (name.length > 50) {
        res.status(400).json({
          message: '類別名稱長度超過 50 字',
        });
        return;
      }
      if (feature.length > 30) {
        res.status(400).json({
          message: '產品特徵長度超過 30 字',
        });
        return;
      }
      if (origin.length > 15) {
        res.status(400).json({
          message: '產地長度超過 15 字',
        });
        return;
      }
      if (variety && variety.length > 30) {
        res.status(400).json({
          message: '品種長度超過 30 字',
        });
        return;
      }
      if (process_method && process_method.length > 30) {
        res.status(400).json({
          message: '處理方式長度超過 30 字',
        });
        return;
      }
      if (acidity && acidity.length > 30) {
        res.status(400).json({
          message: '酸度長度超過 30 字',
        });
        return;
      }
      if (flavor && flavor.length > 30) {
        res.status(400).json({
          message: '甜感長度超過 30 字',
        });
        return;
      }
      if (aftertaste && aftertaste.length > 30) {
        res.status(400).json({
          message: '尾韻長度超過 30 字',
        });
        return;
      }

      if (isNotValidInteger(classification_id) || classification_id === 0) {
        res.status(400).json({
          message: '分類ID格式錯誤',
        });
        return;
      }

      const classificationRepo = dataSource.getRepository('Classification');
      const classification = await classificationRepo.findOneBy({ id: classification_id });
      if (!classification) {
        res.status(400).json({
          message: '查無此分類',
        });
        return;
      }

      const productDetailRepo = dataSource.getRepository('Product_detail');
      const newProductDetail = productDetailRepo.create({
        name,
        origin,
        feature,
        variety,
        process_method,
        acidity,
        flavor,
        aftertaste,
        description,
        Classification: classification,
      });

      const savedProductDetail = await productDetailRepo.save(newProductDetail);

      res.status(200).json({
        message: '新增成功',
        // data: {
        //   id: savedProductDetail.id,
        //   name: savedProductDetail.name,
        //   origin: savedProductDetail.origin,
        //   feature: savedProductDetail.feature,
        //   variety: savedProductDetail.variety,
        //   process_method: savedProductDetail.process_method,
        //   acidity: savedProductDetail.acidity,
        //   flavor: savedProductDetail.flavor,
        //   aftertaste: savedProductDetail.aftertaste,
        //   description: savedProductDetail.description,
        //   classification_id: savedProductDetail.classification_id,
        // },
      });
    } catch (error) {
      logger.error('新增商品詳情錯誤:', error);
      next(error);
    }
  },

  // 取得所有訂單訊息
  async getAllOrders(req, res, next) {
    try {
      const ordersRepo = dataSource.getRepository('Order');
      const orders = await ordersRepo.find({
        relations: ['user'],
        order: {
          created_at: 'DESC',
        },
      });

      const ordersResult = orders.map(order => {
        const createdTime = order.created_at.toISOString().slice(0, 10).replace(/-/g, '');
        return {
          created_time: createdTime,

          display_id: order.display_id,
          is_ship: order.is_ship ? 1 : 0,
          is_paid: order.is_paid ? 1 : 0,
          total_price: order.total_price,
          user_email: order.user.email,
        };
      });

      res.status(200).json({
        message: '取得成功',
        data: ordersResult,
      });
    } catch (error) {
      logger.error('取得訂單列表錯誤:', error);
      next(error);
    }
  },

  // 取得處理中訂單資訊
  async getProcessingOrders(req, res, next) {
    try {
      const ordersRepo = dataSource.getRepository('Order');
      const orders = await ordersRepo.find({
        relations: ['user'],
        where: { is_ship: false },
        order: {
          created_at: 'DESC',
        },
      });

      const ordersResult = orders.map(order => {
        const createdDay = order.created_at.toISOString().slice(0, 10).replace(/-/g, '');
        return {
          created_day: createdDay,
          is_ship: order.is_ship ? 1 : 0,
          id: order.id,
          display_id: order.display_id,
          is_paid: order.is_paid ? 1 : 0,
          total_price: order.total_price,
          user_email: order.user.email,
        };
      });

      res.status(200).json({
        message: '取得成功',
        data: ordersResult,
      });
    } catch (error) {
      logger.error('取得處理中訂單錯誤:', error);
      next(error);
    }
  },

  async getIsShip(req, res, next) {
    try {
      const orderRepo = dataSource.getRepository('Order');

      const unshippedCount = await orderRepo.count({
        where: { is_ship: false },
      });

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      const shippedThisMonthCount = await orderRepo.count({
        where: {
          is_ship: true,
          created_at: Between(firstDayOfMonth, lastDayOfMonth),
        },
      });

      res.status(200).json({
        message: '取得成功',
        data: {
          unshipped_count: unshippedCount,
          shipped_this_month_count: shippedThisMonthCount,
        },
      });
    } catch (error) {
      logger.error('取得出貨統計錯誤:', error);
      next(error);
    }
  },

  // 編輯訂單進度狀態
  async updateOrderStatus(req, res, next) {
    try {
      const { order_id } = req.params;
      const { is_ship, receiver } = req.body;

      const ordersRepo = dataSource.getRepository('Order');
      const receiverRepo = dataSource.getRepository('Receiver');

      const order = await ordersRepo.findOne({
        where: { id: order_id },
        relations: ['Receiver'],
      });

      if (!order) {
        res.status(400).json({
          message: '查無此訂單',
        });
        return;
      }

      // 更新收件人資訊
      if (receiver) {
        const receiverEntity = await receiverRepo.findOne({
          where: { id: order.receiver_id },
        });

        if (receiverEntity) {
          receiverEntity.name = receiver.name;
          receiverEntity.phone = receiver.phone;
          receiverEntity.post_code = receiver.post_code;
          receiverEntity.address = receiver.address;
          await receiverRepo.save(receiverEntity);
        }
      }

      // 更新訂單狀態
      order.is_ship = is_ship === 1;
      await ordersRepo.save(order);

      res.status(200).json({
        message: '更新成功',
      });
    } catch (error) {
      logger.error('更新訂單狀態錯誤:', error);
      next(error);
    }
  },

  // 取得歷史訂單資訊
  async getOrderHistory(req, res, next) {
    try {
      const ordersRepo = dataSource.getRepository('Order');
      const orders = await ordersRepo.find({
        relations: ['user'],
        where: { is_ship: true },
        order: {
          created_at: 'DESC',
        },
      });

      const ordersResult = orders.map(order => {
        const createdDay = order.created_at.toISOString().slice(0, 10).replace(/-/g, '');
        return {
          created_day: createdDay,
          is_ship: order.is_ship ? 1 : 0,
          id: order.id,
          display_id: order.display_id,
          is_paid: order.is_paid ? 1 : 0,
          total_price: order.total_price,
          user_email: order.user.email,
        };
      });

      res.status(200).json({
        message: '取得成功',
        data: {
          order: ordersResult,
        },
      });
    } catch (error) {
      logger.error('取得歷史訂單錯誤:', error);
      next(error);
    }
  },

  async getRevenue(req, res, next) {
    try {
      const orderRepo = dataSource.getRepository('Order');

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      // 將範圍轉換為 UTC 時間
      const firstDayUTC = new Date(
        firstDayOfMonth.getTime() - firstDayOfMonth.getTimezoneOffset() * 60000
      );
      const lastDayUTC = new Date(
        lastDayOfMonth.getTime() - lastDayOfMonth.getTimezoneOffset() * 60000
      );

      const orders = await orderRepo.find({
        where: {
          is_paid: true,
          created_at: Between(firstDayUTC, lastDayUTC),
        },
      });
      const revenue = orders.reduce((sum, order) => sum + (order.total_price || 0), 0);

      res.status(200).json({
        message: '本月營業額統計成功',
        data: {
          revenue,
        },
      });
    } catch (error) {
      logger.error('取得本月營業額錯誤:', error);
      next(error);
    }
  },

  // 新增優惠碼
  async postDiscount(req, res, next) {
    try {
      const {
        discount_kol,
        discount_percent,
        discount_price,
        threshold_price,
        usage_limit,
        expired_at,
      } = req.body;

      if (isUndefined(discount_kol) || isNotValidString(discount_kol)) {
        return res.status(400).json({ message: '優惠碼格式錯誤' });
      }

      // 折扣類型不能同時設定
      const isPercentValid = !isUndefined(discount_percent) && Number(discount_percent) !== 1;
      const isPriceValid = !isUndefined(discount_price) && Number(discount_price) !== 0;

      if (isPercentValid && isPriceValid) {
        return res.status(400).json({ message: '不能同時設定百分比與固定金額折扣' });
      }

      // 折扣百分比驗證
      if (
        isPercentValid &&
        (isNaN(discount_percent) || discount_percent <= 0 || discount_percent >= 1)
      ) {
        return res.status(400).json({ message: '折扣百分比必須介於 0 與 1 之間' });
      }

      // 折扣金額驗證
      if (isPriceValid && (!Number.isInteger(discount_price) || discount_price < 0)) {
        return res.status(400).json({ message: '折扣金額必須為非負整數' });
      }

      // 門檻金額驗證
      if (
        !isUndefined(threshold_price) &&
        (!Number.isInteger(threshold_price) || threshold_price < 0)
      ) {
        return res.status(400).json({ message: '門檻金額格式錯誤' });
      }

      // 使用次數驗證
      if (!isUndefined(usage_limit) && (!Number.isInteger(usage_limit) || usage_limit < 1)) {
        return res.status(400).json({ message: '使用次數限制必須為正整數' });
      }

      // 到期日驗證
      if (!isUndefined(expired_at) && isNaN(new Date(expired_at).getTime())) {
        return res.status(400).json({ message: '到期日格式錯誤' });
      }

      const discountRepo = dataSource.getRepository('Discount_method');
      const existDiscount = await discountRepo.findOne({ where: { discount_kol } });

      if (existDiscount) {
        return res.status(400).json({ message: '優惠碼重複' });
      }

      const newDiscount = discountRepo.create({
        discount_kol,
        discount_percent: isUndefined(discount_percent) ? 1 : discount_percent,
        discount_price: isUndefined(discount_price) ? 0 : discount_price,
        threshold_price: isUndefined(threshold_price) ? 0 : threshold_price,
        expired_at: isUndefined(expired_at) ? null : expired_at,
        usage_limit: isUndefined(usage_limit) ? 1 : usage_limit,
        is_active: true,
      });

      const result = await discountRepo.save(newDiscount);

      return res.status(201).json({
        message: '新增成功',
        data: {
          id: result.id,
          discount_kol: result.discount_kol,
          discount_percent: result.discount_percent,
          discount_price: result.discount_price,
          threshold_price: result.threshold_price,
          usage_limit: result.usage_limit,
          expired_at: result.expired_at,
          is_active: result.is_active,
          created_at: result.created_at,
          updated_at: result.updated_at,
        },
      });
    } catch (error) {
      logger.error('postDiscount 錯誤:', error);
      return res.status(500).json({ message: '伺服器錯誤' });
    }
  },

  async postPaymentMethod(req, res, next) {
    try {
      const { payment_method } = req.body;

      if (isNotValidString(payment_method)) {
        return res.status(400).json({ message: '欄位為填寫正確' });
      }

      if (payment_method.length > 10) {
        return res.status(400).json({ message: '付款方式名稱長度不可超過 10 個字元' });
      }

      const paymentMethodRepo = dataSource.getRepository('Payment_method');

      const existingMethod = await paymentMethodRepo.findOne({
        where: { payment_method },
      });

      if (existingMethod) {
        return res.status(409).json({ message: '此付款方式已存在' });
      }

      const newMethod = paymentMethodRepo.create({ payment_method });
      const result = await paymentMethodRepo.save(newMethod);

      res.status(201).json({
        message: '新增付款方式成功',
        data: result,
      });
    } catch (error) {
      logger.error('新增付款方式失敗:', error);
      next(error);
    }
  },

  async getNewOrders(req, res, next) {
    try {
      const ordersRepo = dataSource.getRepository('Order');
      const orders = await ordersRepo.find({
        relations: ['User', 'Order_link_product', 'Order_link_product.Product'],
        order: {
          created_at: 'DESC',
        },
        take: 5,
      });

      const ordersResult = orders.map(order => {
        const createdTime = order.created_at.toISOString().slice(0, 10).replace(/-/g, '');

        // 找出最早加入的商品
        const firstProduct = order.Order_link_product.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        )[0];

        return {
          created_time: createdTime,
          display_id: order.display_id,
          is_ship: order.is_ship ? 1 : 0,
          id: order.id,
          is_paid: order.is_paid ? 1 : 0,
          total_price: order.total_price,
          user_email: order.User.email,
          first_product_name: firstProduct.Product.name,
        };
      });

      res.status(200).json({
        message: '取得成功',
        data: ordersResult,
      });
    } catch (error) {
      logger.error('取得新訂單錯誤:', error);
      next(error);
    }
  },
};

module.exports = adminController;
