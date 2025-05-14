'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('VerifikasiCutis', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idPengajuan: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      idPimpinan: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      jenisVerifikator: {
        type: Sequelize.ENUM('Kepala Satuan Pelayanan', 'Ketua Tim', 'Kepala Sub Bagian Umum', 'Kepala Balai Besar', 'Admin'),
        allowNull: false
      },
      urutanVerifikasi: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      statusVerifikasi: {
        type: Sequelize.ENUM('Draft', 'Belum Diverifikasi', 'Diproses', 'Disetujui', 'Ditolak', 'Dibatalkan'),
        allowNull: false
      },
      komentar: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      tanggalVerifikasi: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('VerifikasiCutis');
  }
};