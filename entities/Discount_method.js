const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Discount_method',
  tableName: 'DISCOUNT_METHOD',
  columns: {
    id: {
      primary: true,
      type: 'smallint',
      generated: 'increment',
    },
    discount_kol: {
      type: 'varchar',
      length: 20,
      nullable: false,
    },
    discount_percent: {
      type: 'numeric',
      precision: 3,
      scale: 2,
      default: 1,
      nullable: false,
    },
    discount_price: {
      type: 'integer',
      default: 0,
      nullable: false,
    },
    threshold_price: {
      type: 'integer',
      default: 0,
      nullable: false,
    },
    usage_limit: {
      type: 'integer',
      default: 1,
      nullable: false,
    },
    is_active: {
      type: 'boolean',
      default: true,
      nullable: false,
    },
    expired_at: {
      type: 'timestamptz',
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
  },
});
