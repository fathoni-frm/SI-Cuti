'use strict';
const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("12345678", 10);
    return queryInterface.bulkInsert("Users", [
      {
        idPegawai: 1,
        username: "Kepegawaian",
        password: hashedPassword,
        role: "Admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
