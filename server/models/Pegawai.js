'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pegawai extends Model {
    static associate(models) {
      Pegawai.hasOne(models.User, { foreignKey: "idPegawai", onDelete: "CASCADE", hooks: true });
      Pegawai.hasMany(models.KuotaCuti, { foreignKey: "idPegawai", onDelete: "CASCADE", hooks: true });
      Pegawai.hasMany(models.PengajuanCuti, { foreignKey: "idPegawai" });
      Pegawai.hasMany(models.PelimpahanTugas, { foreignKey: "idPenerima" });
    }
  }
  Pegawai.init({
    nip: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'NIP sudah terdaftar'
      }
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: false
    },
    karpeg: {
      type: DataTypes.STRING,
      allowNull: false
    },
    karisKarsu: {
      type: DataTypes.STRING,
      allowNull: false
    },
    npwp: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ttl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    jenisKelamin: {
      type: DataTypes.ENUM('Laki-laki', 'Perempuan'),
      allowNull: false
    },
    agama: {
      type: DataTypes.ENUM('Islam', 'Kristen', 'Katolik', 'Hindu', 'Budha', 'Konghucu'),
      allowNull: false
    },
    statusKeluarga: {
      type: DataTypes.ENUM('Belum Menikah', 'Menikah', 'Duda / Janda'),
      allowNull: false
    },
    pendidikanTerakhir: {
      type: DataTypes.ENUM('SD / Sederajat', 'SMP / Sederajat', 'SMA / Sederajat', 'D1 / D2', 'D3', 'S1', 'S2', 'S3'),
      allowNull: false
    },
    namaSekolah: {
      type: DataTypes.STRING,
      allowNull: true
    },
    namaUniversitas: {
      type: DataTypes.STRING,
      allowNull: true
    },
    namaFakultas: {
      type: DataTypes.STRING,
      allowNull: true
    },
    namaJurusan: {
      type: DataTypes.STRING,
      allowNull: true
    },
    namaProgramStudi: {
      type: DataTypes.STRING,
      allowNull: true
    },
    unitKerja: {
      type: DataTypes.ENUM('Karantina Hewan', 'Karantina Ikan', 'Karantina Tumbuhan', 'Tata Usaha'),
      allowNull: false
    },
    satuanKerja: {
      type: DataTypes.ENUM('UPT Induk BBKHIT Kalimantan Timur', 'Bandara Internasional SAMS', 'Bandara APT Pranoto', 'Pelabuhan Laut Semayang', 'Pelabuhan Laut Kariangau', 'Pelabuhan Sungai Samarinda', 'Pelabuhan Laut Loktuan', 'Pelabuhan Berau'),
      allowNull: false
    },
    pangkat: {
      type: DataTypes.ENUM('Juru Muda', 'Juru Muda Tingkat I', 'Juru', 'Juru Tingkat I', 'Pengatur Muda', 'Pengatur Muda Tingkat I', 'Pengatur', 'Pengatur Tingkat I', 'Penata Muda', 'Penata Muda Tingkat I', 'Penata', 'Penata Tingkat I', 'Pembina', 'Pembina Tingkat I', 'Pembina Utama Muda', 'Pembina Utama Madya', 'Pembina Utama'),
      allowNull: false
    },
    golongan: {
      type: DataTypes.ENUM('I/a', 'I/b', 'I/c', 'I/d', 'II/a', 'II/b', 'II/c', 'II/d', 'III/a', 'III/b', 'III/c', 'III/d', 'IV/a', 'IV/b', 'IV/c', 'IV/d', 'IV/e'),
      allowNull: false
    },
    jabatanStruktural: {
      type: DataTypes.ENUM('Kepala Balai Besar', 'Kepala Bagian Umum', 'Ketua Tim', 'Kepala Satuan Pelayanan', 'Lainnya'),
      allowNull: true
    },
    jabatanFungsional: {
      type: DataTypes.ENUM('Analis Pengelolaan Keuangan APBN Ahli Muda', 'Analis Perkarantinaan Tumbuhan Ahli Madya', 'Analis Perkarantinaan Tumbuhan Ahli Muda', 'Analis Perkarantinaan Tumbuhan Ahli Pertama', 'Analis Sumber Daya Manusia Aparatur Ahli Muda', 'Arsiparis Terampil', 'Calon Analis Perkarantinaan Tumbuhan Ahli Pertama', 'Dokter Hewan Karantina Ahli Madya', 'Dokter Hewan Karantina Ahli Muda', 'Dokter Hewan Karantina Ahli Pertama', 'Paramedik Karantina Hewan Mahir', 'Paramedik Karantina Hewan Pemula', 'Paramedik Karantina Hewan Penyelia', 'Paramedik Karantina Hewan Terampil', 'Pemeriksa Karantina Tumbuhan Mahir', 'Pemeriksa Karantina Tumbuhan Pemula', 'Pemeriksa Karantina Tumbuhan Penyelia', 'Pemeriksa Karantina Tumbuhan Terampil', 'Penelaah Teknis Kebijakan', 'Pengadministrasi Perkantoran', 'Pengendali Hama dan Penyakit Ikan Ahli Muda', 'Pengendali Hama Dan Penyakit Ikan Ahli Pertama', 'Pranata Hubungan Masyarakat Ahli Pertama', 'Pranata Keuangan APBN Mahir', 'Pranata Keuangan APBN Penyelia', 'Pranata Keuangan APBN Terampil', 'Pranata Komputer Ahli Muda', 'Pranata Komputer Ahli Pertama', 'Pranata Sumber Daya Manusia Aparatur Terampil', 'Teknisi Pengendali Hama dan Penyakit Ikan Mahir', 'Teknisi Pengendali Hama dan Penyakit Ikan Penyelia', 'Teknisi Pengendali Hama dan Penyakit Ikan Terampil', 'Lainnya'),
      allowNull: true
    },
    alamatKantor: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    noHp: {
      type: DataTypes.STRING,
      allowNull: true
    },
    emailKantor: {
      type: DataTypes.STRING,
      allowNull: true
    },
    emailPribadi: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Pegawai',
    tableName: 'pegawais',
    timestamps: true,
    paranoid: true,
  });

  return Pegawai;
};