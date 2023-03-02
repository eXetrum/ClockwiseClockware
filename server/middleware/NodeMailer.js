require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
	service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_AUTH_GMAIL_USER,
        pass: process.env.NODEMAILER_AUTH_GMAIL_APP_PASS
    }
});

const sendMail = async(orderId, client, master, watch, city, startDate, endDate) => {
	try {
		const params = {
			from: `${process.env.NODEMAILER_AUTH_GMAIL_USER}@gmail.com`,
			to: client.email,
			subject: 'Your order details at ClockwiseClockware',
			text: '',
			html: `
			<html>
			<head></head>
			<body>
				<p>Mr(s) ${client.name} thank you for trusting us to do the repair work !</p><br/>
				<p>Order details:</p>
				<p>Order ID=${orderId}</p>
				<table>
					<thead>
						<tr>
							<th>Master</th>
							<th>City</th>
							<th>Watch type</th>						
							<th>Start Date</th>
							<th>End Date</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td><b>${master.name}</b>, <i>${master.email}</i></td>
							<td>${city.name}</td>
							<td>${watch.name}</td>						
							<td>${startDate}</td>
							<td>${endDate}</td>
						</tr>
					</tbody>
				</table>
			</body>
			</html>`,
		};
		
		let result = await transporter.sendMail(params);
		if(result != null) {
			//'messageId', 'messageTime'
			['accepted', 'rejected', 'ehlo', 'envelopeTime', 'messageSize', 'response', 'envelope'].forEach(prop => delete result[prop]);
		}
		return result;
	} catch(e) {
		return e;
	}
};

module.exports = {
	sendMail
};