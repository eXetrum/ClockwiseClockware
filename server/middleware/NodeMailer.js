require('dotenv').config();

const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_AUTH_GMAIL_USER,
        pass: process.env.NODEMAILER_AUTH_GMAIL_APP_PASS
    }
});

transporter.use(
    'compile',
    hbs({
        viewEngine: {
            extname: '.hbs',
            layoutsDir: 'views/email/',
            defaultLayout: 'template',
            partialsDir: 'views/partials/'
        },
        viewPath: './views/email/',
        extName: '.hbs'
    })
);

const sendOrderConfirmationMail = async ({ orderId, client, master, watch, city, startDate, endDate, totalCost }) => {
    try {
        const mailOptions = {
            from: `${process.env.NODEMAILER_AUTH_GMAIL_USER}@gmail.com`,
            to: client.email,
            subject: 'Your order details at ClockwiseClockware',
            template: 'order_confirmation_body',
            context: {
                orderId,
                clientName: client.name,
                masterName: master.name,
                masterEmail: master.email,
                watchName: watch.name,
                cityName: city.name,
                startDate,
                endDate,
                totalCost
            }
        };

        const result = await transporter.sendMail(mailOptions);
        if (result != null) {
            // Keep: 'messageId', 'messageTime', and remove rest
            ['accepted', 'rejected', 'ehlo', 'envelopeTime', 'messageSize', 'response', 'envelope'].forEach((prop) => delete result[prop]);
        }
        return result;
    } catch (e) {
        return e;
    }
};

const sendEmailConfirmationMail = async ({ email, password, verificationLink }) => {
    try {
        const mailOptions = {
            from: `${process.env.NODEMAILER_AUTH_GMAIL_USER}@gmail.com`,
            to: email,
            subject: 'Registration at ClockwiseClockware',
            template: 'email_confirmation_body',
            context: {
                email,
                password,
                verificationLink
            }
        };

        const result = await transporter.sendMail(mailOptions);
        if (result != null) {
            // Keep: 'messageId', 'messageTime', and remove rest
            ['accepted', 'rejected', 'ehlo', 'envelopeTime', 'messageSize', 'response', 'envelope'].forEach((prop) => delete result[prop]);
        }
        return result;
    } catch (e) {
        return e;
    }
};

const sendPasswordResetMail = async ({ email, password }) => {
    try {
        const mailOptions = {
            from: `${process.env.NODEMAILER_AUTH_GMAIL_USER}@gmail.com`,
            to: email,
            subject: 'Password Reset',
            template: 'reset_password_body',
            context: {
                email,
                password
            }
        };

        const result = await transporter.sendMail(mailOptions);
        if (result != null) {
            // Keep: 'messageId', 'messageTime', and remove rest
            ['accepted', 'rejected', 'ehlo', 'envelopeTime', 'messageSize', 'response', 'envelope'].forEach((prop) => delete result[prop]);
        }
        return result;
    } catch (e) {
        return e;
    }
};

module.exports = {
    sendOrderConfirmationMail,
    sendEmailConfirmationMail,
    sendPasswordResetMail
};
