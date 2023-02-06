require('dotenv').config();
const router = require('express').Router();
const { RouteProtector } = require('../middleware/RouteProtector');
const { getWatchTypes, getAvailableMasters, createOrder, getOrders, deleteOrderById } = require('../models/orders');

const nodemailer = require('nodemailer');
/*const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.NODEMAILER_AUTH_GMAIL_USER || 'youremail@gmail.com',
		pass: process.env.NODEMAILER_AUTH_GMAIL_PASS || 'yourpassword'
	}
});*/


async function sendMail(clientEmail) {
	// Generate test SMTP service account from ethereal.email
	// Only needed if you don't have a real mail account for testing
	let testAccount = await nodemailer.createTestAccount();
	
	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
		host: "smtp.ethereal.email",
		port: 587,
		secure: false, // true for 465, false for other ports
		auth: {
			user: testAccount.user, // generated ethereal user
			pass: testAccount.pass, // generated ethereal password
		},
	});
	
	// send mail with defined transport object
	let info = await transporter.sendMail({
		from: '"Fred Foo 👻" <foo@example.com>', // sender address
		to: clientEmail, // list of receivers
		subject: "Hello ✔", // Subject line
		text: "Hello world?", // plain text body
		html: "<b>Hello world?</b>", // html body
	});

	console.log("Message sent: %s", info.messageId);
	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
	// Preview only available when sending through an Ethereal account
	console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
	// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}


///////// Client part (No route protection)
router.get('/api/watch_types', async (req, res) => {
	try {
		console.log('[route] GET /watch_types');
		let watchTypes = await getWatchTypes();
		console.log('[route] GET /watch_types result: ', watchTypes);
		res.status(200).json({
			watchTypes
		}).end();
	} catch(e) { console.log(e); res.status(400).end();}
});

router.get('/api/available_masters', async (req, res) => {
	try {
		let { cityId, watchTypeId, dateTime } = req.query;
		console.log('[route] GET /available_masters query params: ', cityId, watchTypeId, dateTime);
		let masters = await getAvailableMasters(cityId, watchTypeId, dateTime);
		console.log('[route] GET /available_masters result: ', masters);
		res.status(200).json({
			masters
		}).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.post('/api/orders', async (req, res) => {

	try {
		const { order } = req.body;
		console.log('[route] POST /orders ', order);
		let masters = await createOrder(order);
		console.log('[route] POST /orders result: ', masters);
		res.status(201).json({
			masters
		}).end();

		// TODO send email to client
		const result = await sendMail(order.client.email);
	} catch(e) { console.log(e); res.status(400).end(); }	
});

///////// Admin part (WITH route protection)
router.get('/api/orders', RouteProtector, async (req, res) => {
	try {
		console.log('[route] GET /orders');
		let orders = await getOrders();
		console.log('[route] GET /orders result: ', orders);
		res.status(200).json({
			orders
		}).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.delete('/api/orders/:id', RouteProtector, async (req, res) => {
	try {
		const { id } = req.params;
		console.log('[route] DELETE /orders/:id ', id);
		let orders = await deleteOrderById(id);
		console.log('[route] DELETE /orders/:id result: ', orders);
		res.status(200).json({
			orders
		}).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

module.exports = router;