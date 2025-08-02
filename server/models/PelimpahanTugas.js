'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PelimpahanTugas extends Model {
    static associate(models) {
      PelimpahanTugas.belongsTo(models.PengajuanCuti, { foreignKey: "idPengajuan", onDelete: "CASCADE"});
      PelimpahanTugas.belongsTo(models.Pegawai, { foreignKey: "idPenerima", as: "penerima" });
    }
  }
  PelimpahanTugas.init({
    idPengajuan: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idPenerima: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Draft', 'Belum Diverifikasi', 'Diproses', 'Disetujui', 'Ditolak', 'Dibatalkan'),
      allowNull: false,
    },
    komentar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tanggalVerifikasi: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'PelimpahanTugas',
    timestamps: true
  });
  return PelimpahanTugas;
};