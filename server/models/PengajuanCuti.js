'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PengajuanCuti extends Model {
    static associate(models) {
      PengajuanCuti.belongsTo(models.Pegawai, { foreignKey: "idPegawai", as: "pegawai" });
      PengajuanCuti.hasMany(models.VerifikasiCuti, { foreignKey: "idPengajuan", onDelete: "CASCADE", hooks: true });
      PengajuanCuti.hasOne(models.PelimpahanTugas, { foreignKey: "idPengajuan", onDelete: "CASCADE", hooks: true })
    }
  }
  PengajuanCuti.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    idPegawai: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    jenisCuti: {
      type: DataTypes.ENUM('Cuti Tahunan', 'Cuti Besar', 'Cuti Sakit', 'Cuti Alasan Penting', 'Cuti Di Luar Tanggungan Negara', 'Cuti Melahirkan'),
      allowNull: false
    },
    tanggalPengajuan: {
      type: DataTypes.DATE,
      allowNull: true
    },
    totalKuota: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sisaKuota: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tanggalMulai: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    tanggalSelesai: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    durasi: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    alasanCuti: {
      type: DataTypes.STRING,
      allowNull: true
    },
    alamatCuti: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lampiran: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Draft', 'Diproses', 'Disetujui', 'Ditolak', 'Dibatalkan'),
      allowNull: false
    },
    suratCuti: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'PengajuanCuti',
    tableName: 'pengajuancutis',
    timestamps: true
  });
  return PengajuanCuti;
};