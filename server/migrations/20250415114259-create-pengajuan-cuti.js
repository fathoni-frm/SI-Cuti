'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PengajuanCutis', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idPegawai: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      jenisCuti: {
        type: Sequelize.ENUM('Cuti Tahunan', 'Cuti Besar', 'Cuti Sakit', 'Cuti Alasan Penting', 'Cuti Di Luar Tanggungan Negara', 'Cuti Melahirkan'),
        allowNull: false
      },
      tanggalPengajuan: {
        type: Sequelize.DATE,
        allowNull: true
      },
      totalKuota: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      sisaKuota: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      tanggalMulai: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      tanggalSelesai: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      durasi: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      alasanCuti: {
        type: Sequelize.STRING,
        allowNull: true
      },
      alamatCuti: {
        type: Sequelize.STRING,
        allowNull: true
      },
      lampiran: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('Draft', 'Diproses', 'Disetujui', 'Ditolak', 'Dibatalkan'),
        allowNull: false
      },
      suratCuti: {
        type: Sequelize.STRING,
        allowNull: true, 
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
    await queryInterface.dropTable('PengajuanCutis');
  }
};