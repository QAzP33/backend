const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Product',
  tableName: 'PRODUCT',
  columns: {
    id: {
      primary: true,
      type: 'varchar',
      length: 20,
      nullable: false,
    },
    product_detail_id: {
      type: 'smallint',
      nullable: false,
    },
    name: {
      type: 'varchar',
      length: 50,
      nullable: false,
    },
    origin_price: {
      type: 'integer',
      nullable: false,
    },
    price: {
      type: 'integer',
      nullable: false,
    },
    stock: {
      type: 'smallint',
      nullable: false,
    },
    image_url: {
      type: 'varchar',
      length: 2048,
      nullable: false,
    },
    image_urls: {
      type: 'text',
      array: true,
      nullable: false,
      default: () => 'ARRAY[]::text[]',
    },
    is_enable: {
      type: 'boolean',
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
    deleted_at: {
      type: 'timestamptz',
      nullable: true
    },
  },
  relations: {
    Product_detail: {
      type: 'many-to-one',
      target: 'Product_detail',
      joinColumn: {
        name: 'product_detail_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'product_detail_id_fk',
      }
    },
  }
});
