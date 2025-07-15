const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Cart',
  tableName: 'CART',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    user_id: {
      type: 'uuid',
      nullable: false,
      unique: true,
    },
    discount_id: {
      type: 'smallint',
      nullable: true,
    },
    order_id: {
      type: 'uuid',
      nullable: true,
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
    },
  },
  relations: {
    Discount_method: {
      type: 'many-to-one',
      target: 'Discount_method',
      joinColumn: {
        name: 'discount_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'cart_discount_id_fk',
      },
    },
    User: {
      type: 'one-to-one',
      target: 'User',
      joinColumn: {
        name: 'user_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'cart_user_id_fk',
      },
    },
    Cart_link_product: {
      type: 'one-to-many',
      target: 'Cart_link_product',
      inverseSide: 'Cart',
    },
    Order: {
      type: 'one-to-one',
      target: 'Order',
      joinColumn: {
        name: 'order_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'cart_order_id_fk',
      },
    },
  },
});
