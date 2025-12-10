import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import Room from './Room.js';

class VideoHistory extends Model {}

VideoHistory.init(
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
    videoUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    videoTitle: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    addedBy: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'Unknown',
    },
    addedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'VideoHistory',
    tableName: 'video_history',
    timestamps: false,
    indexes: [
      {
        fields: ['roomId'],
      },
      {
        fields: ['addedAt'],
      },
    ],
  }
);

// Define associations
Room.hasMany(VideoHistory, {
  foreignKey: 'roomId',
  as: 'videoHistory',
  onDelete: 'CASCADE',
});

VideoHistory.belongsTo(Room, {
  foreignKey: 'roomId',
  as: 'room',
});

// Class methods
VideoHistory.getByRoomId = async function (roomId, limit = 50) {
  return await this.findAll({
    where: { roomId },
    order: [['addedAt', 'DESC']],
    limit,
  });
};

export default VideoHistory;
