const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'User_discount_usage',
  tableName: 'USER_DISCOUNT_USAGE',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },
    user_id: {
      type: 'uuid',
      nullable: false,
    },
    discount_id: {
      type: 'smallint',
      nullable: false,
    },
    used_at: {
      type: 'timestamptz',
      createDate: true,
    },
  },
  relations: {
    discount: {
      target: 'Discount_method',
      type: 'many-to-one',
      joinColumn: { name: 'discount_id' },
      onDelete: 'CASCADE',
    },
  },
});
