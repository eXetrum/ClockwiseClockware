require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
	service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_AUTH_GMAIL_USER,
        pass: process.env.NODEMAILER_AUTH_GMAIL_APP_PASS
    }
});

const sendMail = async(params) => {
	try {
		const result = await transporter.sendMail(params);
		return result;
	} catch(e) {
		return e;
	}
};

module.exports = {
	sendMail
};