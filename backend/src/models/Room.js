import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Room extends Model {}

Room.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    roomCode: {
      type: DataTypes.STRING(8),
      allowNull: false,
      unique: true,
      validate: {
        len: [8, 8],
        isAlphanumeric: true,
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    createdBy: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 50],
      },
    },
    currentVideoUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    videoState: {
      type: DataTypes.ENUM('playing', 'paused'),
      defaultValue: 'paused',
    },
    currentTime: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    lastActivity: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Room',
    tableName: 'rooms',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['roomCode'],
      },
      {
        fields: ['isActive'],
      },
      {
        fields: ['lastActivity'],
      },
    ],
  }
);

// Class methods
Room.findByCode = async function (roomCode) {
  return await this.findOne({
    where: { roomCode, isActive: true },
  });
};

// Instance methods
Room.prototype.updateActivity = async function () {
  this.lastActivity = new Date();
  await this.save();
};

Room.prototype.updateVideoState = async function (state, currentTime) {
  this.videoState = state;
  this.currentTime = currentTime;
  this.lastActivity = new Date();
  await this.save();
};

Room.prototype.changeVideo = async function (videoUrl) {
  this.currentVideoUrl = videoUrl;
  this.currentTime = 0;
  this.videoState = 'paused';
  this.lastActivity = new Date();
  await this.save();
};

export default Room;
