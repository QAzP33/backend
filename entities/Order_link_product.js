const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Order_link_product',
  tableName: 'ORDER_LINK_PRODUCT',
  columns: {
    order_id: {
      primary: true,
      type: 'uuid',
      nullable: false
    },
    product_id: {
      primary: true,
      type: 'varchar',
      length: 20,
      nullable: false,
    },
    quantity: {
      type: 'integer',
      default: 1,
      nullable: false,
    },
    price: {
      type: 'integer',
      nullable: false,
    },
    created_at: {
      type: 'timestamptz',
      createDate: true,
      nullable: false,
    },
    updated_at: {
      type: 'timestamptz',
      updateDate: true,
      nullable: false,
    },
  },
  relations: {
    Order: {
      type: 'many-to-one',
      target: 'Order',
      joinColumn: {
        name: 'order_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'order_link_product_order_id_fk',
      }
    },
    Product: {
      type: 'many-to-one',
      target: 'Product',
      joinColumn: {
        name: 'product_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'order_link_product_product_id_fk',
      }
    }
  }
});