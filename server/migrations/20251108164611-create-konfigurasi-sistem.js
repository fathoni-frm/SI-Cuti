"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("KonfigurasiSistems", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      idKepalaBalai: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      idKepalaBagianUmum: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      formatNomorSurat: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nomorTerakhir: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      resetBulanan: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.bulkInsert("KonfigurasiSistems", [
      {
        idKepalaBalai: 1,
        idKepalaBagianUmum: 1,
        formatNomorSurat: "BBKHITK/HRD/{{bulan}}/{{tahun}}",
        nomorTerakhir: 0,
        resetBulanan: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("KonfigurasiSistems");
  },
};
