'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VerifikasiCuti extends Model {
    static associate(models) {
      VerifikasiCuti.belongsTo(models.PengajuanCuti, { foreignKey: 'idPengajuan', onDelete: "CASCADE", });
      VerifikasiCuti.belongsTo(models.Pegawai, { foreignKey: 'idPimpinan', as: 'verifikator' });
    }
  }
  VerifikasiCuti.init({
    idPengajuan: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idPimpinan: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    jenisVerifikator: {
      type: DataTypes.ENUM('Kepala Satuan Pelayanan', 'Ketua Tim', 'Kepala Bagian Umum', 'Kepala Balai Besar', 'Admin'),
      allowNull: false
    },
    urutanVerifikasi: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    statusVerifikasi: {
      type: DataTypes.ENUM('Draft', 'Belum Diverifikasi', 'Diproses', 'Disetujui', 'Ditolak', 'Dibatalkan'),
      allowNull: false
    },
    komentar: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tanggalVerifikasi: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'VerifikasiCuti',
    tableName: 'verifikasicutis',
    timestamps: true
  });
  return VerifikasiCuti;
};