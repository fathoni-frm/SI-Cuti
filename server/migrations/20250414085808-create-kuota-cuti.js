'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('KuotaCutis', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idPegawai: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      jenisCuti: {
        type: Sequelize.ENUM(
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
        type: Sequelize.INTEGER,
        allowNull: false
      },
      sisaKuota: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('KuotaCutis');
  }
};