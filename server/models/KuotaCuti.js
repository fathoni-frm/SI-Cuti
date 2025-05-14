'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class KuotaCuti extends Model {
    static associate(models) {
      KuotaCuti.belongsTo(models.Pegawai, {
        foreignKey: 'idPegawai',
        onDelete: 'CASCADE'
      });  
    }
  }
  KuotaCuti.init({
    idPegawai: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    jenisCuti: {
      type: DataTypes.ENUM(
        'Cuti Tahunan',
        'Cuti Tahunan N-1',
        'Cuti Tahunan N-2',
        'Cuti Besar',
        'Cuti Sakit',
        'Cuti Alasan Penting',
        'Cuti Di Luar Tanggungan Negara',
        'Cuti Melahirkan'
      ),
      allowNull: false
    },
    totalKuota: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sisaKuota: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'KuotaCuti',
    tableName: 'kuotacutis',
    timestamps: true
  });
  return KuotaCuti;
};