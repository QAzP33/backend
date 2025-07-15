const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Cart_link_product',
  tableName: 'CART_LINK_PRODUCT',
  columns: {
    cart_id: {
      primary: true,
      type: 'uuid',
      nullable: false,
    },
    product_id: {
      primary: true,
      type: 'uuid',
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
    is_selected: {
      type: 'boolean',
      default: true, 
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
    deleted_at: {
      type: 'timestamptz',
      nullable: true,
      deleteDate: true,
    },
  },
  relations: {
    Cart: {
      type: 'many-to-one',
      target: 'Cart',
      joinColumn: {
        name: 'cart_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'cart_link_product_cart_id_fk',
      },
    },
    Product: {
      type: 'many-to-one',
      target: 'Product',
      joinColumn: {
        name: 'product_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'cart_link_product_product_id_fk',
      },
    },
  },
});
