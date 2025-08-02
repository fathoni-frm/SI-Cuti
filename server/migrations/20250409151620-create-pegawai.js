'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Pegawais', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nip: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      nama: {
        type: Sequelize.STRING,
        allowNull: false
      },
      karpeg: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      karisKarsu: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      npwp: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      ttl: {
        type: Sequelize.STRING,
        allowNull: false
      },
      jenisKelamin: {
        type: Sequelize.ENUM('Laki-laki', 'Perempuan'),
        allowNull: false
      },
      agama: {
        type: Sequelize.ENUM('Islam', 'Kristen', 'Katolik', 'Hindu', 'Budha', 'Konghucu'),
        allowNull: false
      },
      statusKeluarga: {
        type: Sequelize.ENUM('Belum Menikah', 'Menikah', 'Duda / Janda'),
        allowNull: false
      },
      pendidikanTerakhir: {
        type: Sequelize.ENUM('SD / Sederajat', 'SMP / Sederajat', 'SMA / Sederajat', 'D1 / D2', 'D3', 'S1', 'S2', 'S3'),
        allowNull: false
      },
      namaSekolah: {
        type: Sequelize.STRING,
        allowNull: true
      },
      namaUniversitas: {
        type: Sequelize.STRING,
        allowNull: true
      },
      namaFakultas: {
        type: Sequelize.STRING,
        allowNull: true
      },
      namaJurusan: {
        type: Sequelize.STRING,
        allowNull: true
      },
      namaProgramStudi: {
        type: Sequelize.STRING,
        allowNull: true
      },
      unitKerja: {
        type: Sequelize.ENUM('Tata Usaha', 'Karantina Hewan', 'Karantina Ikan', 'Karantina Tumbuhan'),
        allowNull: false
      },
      satuanKerja: {
        type: Sequelize.ENUM('UPT Induk BBKHIT Kalimantan Timur', 'Bandara Internasional SAMS', 'Bandara APT Pranoto', 'Pelabuhan Laut Semayang', 'Pelabuhan Laut Kariangau', 'Pelabuhan Sungai Samarinda', 'Pelabuhan Laut Loktuan', 'Pelabuhan Berau'),
        allowNull: false
      },
      pangkat: {
        type: Sequelize.ENUM('Juru Muda', 'Juru Muda Tingkat I', 'Juru', 'Juru Tingkat I', 'Pengatur Muda', 'Pengatur Muda Tingkat I', 'Pengatur', 'Pengatur Tingkat I', 'Penata Muda', 'Penata Muda Tingkat I', 'Penata', 'Penata Tingkat I', 'Pembina', 'Pembina Tingkat I', 'Pembina Utama Muda', 'Pembina Utama Madya', 'Pembina Utama'),
        allowNull: false
      },
      golongan: {
        type: Sequelize.ENUM('I/a', 'I/b', 'I/c', 'I/d', 'II/a', 'II/b', 'II/c', 'II/d', 'III/a', 'III/b', 'III/c', 'III/d', 'IV/a', 'IV/b', 'IV/c', 'IV/d', 'IV/e'),
        allowNull: false
      },
      jabatanStruktural: {
        type: Sequelize.ENUM('Kepala Balai Besar', 'Kepala Bagian Umum', 'Ketua Tim', 'Kepala Satuan Pelayanan', 'Lainnya'),
        allowNull: true
      },
      jabatanFungsional: {
        type: Sequelize.ENUM('Analis Pengelolaan Keuangan APBN Ahli Muda', 'Analis Perkarantinaan Tumbuhan Ahli Madya', 'Analis Perkarantinaan Tumbuhan Ahli Muda', 'Analis Perkarantinaan Tumbuhan Ahli Pertama', 'Analis Sumber Daya Manusia Aparatur Ahli Muda', 'Arsiparis Terampil', 'Calon Analis Perkarantinaan Tumbuhan Ahli Pertama', 'Dokter Hewan Karantina Ahli Madya', 'Dokter Hewan Karantina Ahli Muda', 'Dokter Hewan Karantina Ahli Pertama', 'Paramedik Karantina Hewan Mahir', 'Paramedik Karantina Hewan Pemula', 'Paramedik Karantina Hewan Penyelia', 'Paramedik Karantina Hewan Terampil', 'Pemeriksa Karantina Tumbuhan Mahir', 'Pemeriksa Karantina Tumbuhan Pemula', 'Pemeriksa Karantina Tumbuhan Penyelia', 'Pemeriksa Karantina Tumbuhan Terampil', 'Penelaah Teknis Kebijakan', 'Pengadministrasi Perkantoran', 'Pengendali Hama dan Penyakit Ikan Ahli Muda', 'Pengendali Hama Dan Penyakit Ikan Ahli Pertama', 'Pranata Hubungan Masyarakat Ahli Pertama', 'Pranata Keuangan APBN Mahir', 'Pranata Keuangan APBN Penyelia', 'Pranata Keuangan APBN Terampil', 'Pranata Komputer Ahli Muda', 'Pranata Komputer Ahli Pertama', 'Pranata Sumber Daya Manusia Aparatur Terampil', 'Teknisi Pengendali Hama dan Penyakit Ikan Mahir', 'Teknisi Pengendali Hama dan Penyakit Ikan Penyelia', 'Teknisi Pengendali Hama dan Penyakit Ikan Terampil', 'Lainnya'),
        allowNull: true
      },
      alamatKantor: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      noHp: {
        type: Sequelize.STRING,
        allowNull: true
      },
      emailKantor: {
        type: Sequelize.STRING,
        allowNull: true
      },
      emailPribadi: {
        type: Sequelize.STRING,
        allowNull: true
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
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Pegawais');
  }
};