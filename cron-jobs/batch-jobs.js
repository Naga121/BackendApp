const cron = require('node-cron');
const config_dev = require('../config/config-dev');
const Users = require('../models/register');
const transporter = require('../middlewares/nodemailer');

const sendMailToAllUsers = async (emailObj)=>{
    const mailOptions={
        from:'Node Project',
        to:emailObj,
        subject: 'Cron Test Mails',
        html:`<p>Hi this is cron testing mail</p>`
    }
    transporter.sendMail(mailOptions, (error,info)=>{
        if(error){
            console.log(error);
        }else{
            console.log('Mail has been sent : '+info.response);
        }
    });
}

const sendMailAllUser = () => {
    try {
        cron.schedule('*/10 * * * * *', async () => { 
            var allUsers = await Users.find({}).exec();
            if (allUsers.length > 0) {
                var emails = [];
                allUsers.map((user) => {
                    emails.push(user.email)
                });
                sendMailToAllUsers(emails);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    sendMailAllUser
}
