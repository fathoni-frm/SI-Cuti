"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class KonfigurasiSistem extends Model {
    static associate(models) {
      KonfigurasiSistem.belongsTo(models.Pegawai, { foreignKey: 'idKepalaBalai', as: 'kepalaBalai', constraints: false });
      KonfigurasiSistem.belongsTo(models.Pegawai, { foreignKey: 'idKepalaBagianUmum', as: 'kepalaBagianUmum', constraints: false });
    }
  }
  KonfigurasiSistem.init(
    {
      idKepalaBalai: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      idKepalaBagianUmum: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
    sequelize,
    modelName: 'KonfigurasiSistem',
    tableName: 'KonfigurasiSistems',
    timestamps: true
  }
  );
  return KonfigurasiSistem;
};