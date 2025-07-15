const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Classification',
  tableName: 'CLASSIFICATION',
  columns: {
    id: {
      primary: true,
      type: 'smallint',
      generated: 'increment'
    },
    name: {
      type: 'varchar',
      length: 20,
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