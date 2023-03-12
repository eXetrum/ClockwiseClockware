require('dotenv').config();
const bcrypt = require('bcryptjs');

const hashPassword = async (plaintextPassword) => {
    const hash = await bcrypt.hash(plaintextPassword, parseInt(process.env.BCRYPT_SALT_ROUNDS));
    return hash;
};

const compareSync = (plaintextPassword, hash) => bcrypt.compareSync(plaintextPassword, hash);

module.exports = {
    hashPassword,
    compareSync
};
