const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Receiver',
  tableName: 'RECEIVER',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },
    name: {
      type: 'varchar',
      length: 50,
      nullable: false
    },
    phone: {
      type: 'varchar',
      length: 10,
      nullable: false
    },
    post_code: {
      type: 'varchar',
      length: 6,
      nullable: false
    },
    address: {
      type: 'varchar',
      length: 320,
      nullable: false
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
  }
});