'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notifikasi extends Model {
    static associate(models) {
      Notifikasi.belongsTo(models.Pegawai, { foreignKey: 'idPenerima' });
      Notifikasi.belongsTo(models.PengajuanCuti, { foreignKey: 'idPengajuan' });
    }
  }
  Notifikasi.init({
    idPenerima: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idPengajuan: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    judul: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pesan: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Notifikasi',
    tableName: 'Notifikasis',
    timestamps: true,
  });
  return Notifikasi;
};