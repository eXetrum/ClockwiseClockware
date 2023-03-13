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

const sendMail = async ({ orderId, client, master, watch, city, startDate, endDate, totalCost }) => {
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

module.exports = {
    sendMail
};
