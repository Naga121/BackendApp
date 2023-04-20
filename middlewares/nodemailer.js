const { config } = require('dotenv');
const nodemailer = require('nodemailer');


// nodemailr stuff
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user:  "a517198dca855e",
        pass:  "8188f92487aa24"
    }
});
transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    } else {
        console.log(success);
    }
});

module.exports= transporter;