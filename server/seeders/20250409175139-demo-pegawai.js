'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("Pegawais", [
      // {
      //   nip: "198705121994021003",
      //   nama: "Fathoni Fairuz",
      //   karpeg: "F304957",
      //   karisKarsu: "042500L",
      //   npwp: "08.175.554.2-123.321",
      //   ttl: "Balikpapan, 1990-05-12",
      //   jenisKelamin: "Laki-laki",
      //   agama: "Islam",
      //   statusKeluarga: "Menikah",
      //   pendidikanTerakhir: "S1",
      //   namaSekolah: "Teknologi Informasi",
      //   namaUniversitas: "Teknologi Informasi",
      //   namaFakultas: "Teknologi Informasi",
      //   namaJurusan: "Sistem Informasi",
      //   namaProgramStudi: "Sistem Informasi",
      //   unitKerja: "Karantina Hewan",
      //   satuanKerja: "'UPT Induk BBKHIT Kalimantan Timur'",
      //   pangkat: "Penata Muda",
      //   golongan: "III/c",
      //   jabatanStruktural: "Kepala",
      //   jabatanFungsional: "Pengawas",
      //   alamatKantor: "Jl. Jenderal Sudirman No.1",
      //   noHP: "081234567890",
      //   emailKantor: "fathoni@kantor.go.id",
      //   emailPribadi: "fathoni@gmail.com",
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      // },
      {
        nip: "-",
        nama: "Admin Kepegawaian",
        karpeg: "-",
        karisKarsu: "-",
        npwp: "-",
        ttl: "-",
        jenisKelamin: "Laki-laki",
        agama: "Islam",
        statusKeluarga: "Menikah",
        pendidikanTerakhir: "S1",
        namaSekolah: "-",
        namaUniversitas: "-",
        namaFakultas: "-",
        namaJurusan: "-",
        namaProgramStudi: "-",
        unitKerja: "Tata Usaha",
        satuanKerja: "UPT Induk BBKHIT Kalimantan Timur",
        pangkat: "Penata Muda",
        golongan: "III/c",
        jabatanStruktural: "Staf",
        jabatanFungsional: "Pengadministrasi Perkantoran",
        alamatKantor: "Jl. Jenderal Sudirman No.1",
        noHP: "",
        emailKantor: "-",
        emailPribadi: "-",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
