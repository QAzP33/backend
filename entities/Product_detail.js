const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Product_detail',
  tableName: 'PRODUCT_DETAIL',
  columns: {
    id: {
      type: 'smallint',
      primary: true,
      generated: 'increment',
    },
    name: {
      type: 'varchar',
      length: 50,
      nullable: false
    },
    description: {
      type: 'text',
      nullable: false,
    },
    feature: {
      type: 'varchar',
      length: 30,
      nullable: false,
    },
    origin: {
      type: 'varchar',
      length: 15,
      nullable: false,
    },
    variety: {
      type: 'varchar',
      length: 30,
      nullable: true,
    },
    process_method: {
      type: 'varchar',
      length: 30,
      nullable: true,
    },
    acidity: {
      type: 'varchar',
      length: 30,
      nullable: true,
    },
    flavor: {
      type: 'varchar',
      length: 30,
      nullable: true,
    },
    aftertaste: {
      type: 'varchar',
      length: 30,
      nullable: true,
    },
    classification_id: {
      type: 'smallint',
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
    }
  },
  relations: {
    Classification: {
      type: 'many-to-one',
      target: 'Classification',
      joinColumn: {
        name: 'classification_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'detail_classification_id_fk',
      }
    }
  }
});