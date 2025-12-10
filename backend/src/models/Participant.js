import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import Room from './Room.js';

class Participant extends Model {}

Participant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    roomId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'rooms',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    userName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 50],
      },
    },
    socketId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Participant',
    tableName: 'participants',
    timestamps: false,
    indexes: [
      {
        fields: ['roomId'],
      },
      {
        unique: true,
        fields: ['socketId'],
      },
    ],
  }
);

// Define associations
Room.hasMany(Participant, {
  foreignKey: 'roomId',
  as: 'participants',
  onDelete: 'CASCADE',
});

Participant.belongsTo(Room, {
  foreignKey: 'roomId',
  as: 'room',
});

// Class methods
Participant.findBySocketId = async function (socketId) {
  return await this.findOne({
    where: { socketId },
    include: [{ model: Room, as: 'room' }],
  });
};

Participant.getByRoomId = async function (roomId) {
  return await this.findAll({
    where: { roomId },
    order: [['joinedAt', 'ASC']],
  });
};

export default Participant;
