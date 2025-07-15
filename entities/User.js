const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'User',
  tableName: 'USER',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },
    role: {
      type: 'varchar',
      length: 50,
      nullable: false,
      default: 'USER',
    },
    receiver_id: {
      type: 'uuid',
      nullable: true,
    },
    status: {
      type: 'boolean',
      default: 1,
      nullable: false,
    },
    email: {
      type: 'varchar',
      length: 320,
      nullable: false,
      unique: true,
    },
    password: {
      type: 'varchar',
      length: 72,
      nullable: true,
      select: false,
    },
    forget_token: {
      type: 'varchar',
      length: 64,
      nullable: true,
    },
    forget_token_is_used: {
      type: 'boolean',
      nullable: true,
    },
    forget_token_expire: {
      type: 'timestamptz',
      nullable: true,
    },
    name: {
      type: 'varchar',
      length: 50,
      nullable: false,
    },
    phone: {
      type: 'varchar',
      length: 10,
      nullable: true,
    },
    provider: {
      type: 'varchar',
      length: 50,
      default: 'local',
      nullable: false,
    },
    provider_id: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    birth_date: {
      type: 'date',
      nullable: true,
    },
    gender: {
      type: 'varchar',
      length: 10,
      default: '不願透露',
      nullable: false,
    },
    address: {
      type: 'varchar',
      length: 320,
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
  relations: {
    Receiver: {
      type: 'one-to-one',
      target: 'Receiver',
      joinColumn: {
        name: 'receiver_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'user_receiver_id_fk',
      }
    }
  }
});
