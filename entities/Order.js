// entities/orders.js
const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Order',
  tableName: 'ORDER',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    display_id: {
      type: 'varchar',
      length: 14,
      nullable: false,
      unique: true,
    },
    user_id: {
      type: 'uuid',
      nullable: false,
    },
    receiver_id: {
      type: 'uuid',
      nullable: false,
    },
    is_paid: {
      type: 'boolean',
    },
    receipt: {
      type: 'varchar',
      length: 10,
      nullable: true,
    },
    paid_at: {
      type: 'timestamptz',
      nullable: true,
    },
    discount_id: {
      type: 'smallint',
      nullable: true,
    },
    shipping_fee: {
      type: 'integer',
      nullable: false,
    },
    total_price: {
      type: 'integer',
      nullable: false,
    },
    payment_method_id: {
      type: 'smallint',
      nullable: true,
    },
    is_ship: {
      type: 'boolean',
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
    User: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'user_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'order_user_id_fk',
      },
    },
    Receiver: {
      type: 'many-to-one',
      target: 'Receiver',
      joinColumn: {
        name: 'receiver_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'order_receiver_id_fk',
      },
    },
    Discount_method: {
      type: 'many-to-one',
      target: 'Discount_method',
      joinColumn: {
        name: 'discount_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'order_discount_id_fk',
      },
    },
    Payment_method: {
      type: 'many-to-one',
      target: 'Payment_method',
      joinColumn: {
        name: 'payment_method_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'order_payment_id_fk',
      },
    },
    Order_link_product: {
      type: 'one-to-many',
      target: 'Order_link_product',
      inverseSide: 'Order',
    },
  },
});
