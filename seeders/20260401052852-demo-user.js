'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [{
      id: '73edc429-9c84-4ae4-90f0-d9e9dac91249',
      full_name: 'john doe',
      email: "john@gmail.com",
      password: "john1234",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '08cebbea-3cab-45b6-9060-d7e16514e88e',
      full_name: 'ranveer singh',
      email: "ranveer@gmail.com",
      password: "ranveer1234",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    ]
    )
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
