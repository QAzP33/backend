const { EntitySchema, Generated } = require('typeorm');
const generateJWT = require('../utils/generateJWT');

module.exports = new EntitySchema({
  name: 'Payment_method',
  tableName: 'PAYMENT_METHOD',
  columns: {
    id: {
      type: 'smallint',
      primary: true,
      generated: 'increment',
    },
    payment_method: {
      type: 'varchar',
      length: 10,
      nullable: false,
    },
    created_at: {
      type: 'timestamptz',
      createDate: true,
      nullable: false
    },
    updated_at: {
      type: 'timestamptz',
      updateDate: true,
      nullable: false
    },
  }
});