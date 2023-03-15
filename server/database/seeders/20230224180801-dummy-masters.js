/* eslint-disable */
'use strict';
const uuid = require('uuid');
const { hashPassword } = require('../../utils');
const master = require('../models/master');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const masters = [
            {
                id: uuid.v4(),
                email: 'master1@dp.ua',
                password: await hashPassword('master1@dp.ua'),
                role: 'master',
                name: 'MasterDp1',
                rating: 5,
                isEmailVerified: true,
                isApprovedByAdmin: true
            },
            {
                id: uuid.v4(),
                email: 'master2@dp.ua',
                password: await hashPassword('master2@dp.ua'),
                role: 'master',
                name: 'MasterDp2',
                rating: 4,
                isEmailVerified: true,
                isApprovedByAdmin: true
            },
            {
                id: uuid.v4(),
                email: 'master1@uz.ua',
                password: await hashPassword('master1@uz.ua'),
                role: 'master',
                name: 'MasterUz1',
                rating: 5,
                isEmailVerified: true,
                isApprovedByAdmin: true
            },
            {
                id: uuid.v4(),
                email: 'orphan@zug.zug',
                password: await hashPassword('orphan@zug.zug'),
                role: 'master',
                name: 'Orphan',
                rating: 5,
                isEmailVerified: true,
                isApprovedByAdmin: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuid.v4(),
                email: 'master1@email-not.verified',
                password: await hashPassword('master1@email-not.verified'),
                role: 'master',
                name: 'Master1EmailNotVerified',
                rating: 5,
                isEmailVerified: false,
                isApprovedByAdmin: true
            },
            {
                id: uuid.v4(),
                email: 'master2@account-not.approved',
                password: await hashPassword('master2@account-not.approved'),
                role: 'master',
                name: 'Master2AccountNotApproved',
                rating: 5,
                isEmailVerified: true,
                isApprovedByAdmin: false
            },
            {
                id: uuid.v4(),
                email: 'master3@email-not-verified-account-not.approved',
                password: await hashPassword('master3@email-not-verified-account-not.approved'),
                role: 'master',
                name: 'Master3EmailNotVerifiedAccountNotApproved',
                rating: 5,
                isEmailVerified: false,
                isApprovedByAdmin: false
            }
        ];

        return queryInterface
            .bulkInsert(
                'users',
                masters.map((master) => {
                    return {
                        id: master.id,
                        email: master.email,
                        password: master.password,
                        role: master.role,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                }),
                {
                    returning: true
                }
            )
            .then((users) => {
                return queryInterface.bulkInsert(
                    'masters',
                    users.map((user) => {
                        return {
                            id: uuid.v4(),
                            userId: user.id,
                            name: masters.find((item) => item.id === user.id).name,
                            rating: masters.find((item) => item.id === user.id).rating,
                            isEmailVerified: masters.find((item) => item.id === user.id).isEmailVerified,
                            isApprovedByAdmin: masters.find((item) => item.id === user.id).isApprovedByAdmin,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                    }),
                    {}
                );
            });
    },

    async down(queryInterface, Sequelize) {
        const Op = Sequelize.Op;
        return queryInterface.sequelize
            .query(
                'SELECT id FROM users WHERE email IN (\
                "master1@dp.ua", "master2@dp.ua", "master1@uz.ua", "orphan@zug.zug", \
                "master1@email-not.verified", "master2@account-not.approved", "master3@email-not-verified-account-not.approved"\
            );',
                { type: queryInterface.sequelize.QueryTypes.SELECT }
            )
            .then(async (users) => {
                const ids = users.map((item) => item.id);
                await queryInterface.bulkDelete('masters', { userId: { [Op.in]: ids } }, {});
                await queryInterface.bulkDelete('users', { id: { [Op.in]: ids } }, {});
            });
    }
};
