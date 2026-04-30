const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 2525,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    // Send to primary email and secondary email (if exists)
    const recipients = [to];
    if (process.env.SECONDARY_EMAIL) {
      recipients.push(process.env.SECONDARY_EMAIL);
    }

    const mailOptions = {
      from: '"HP Education" <hpeducation918@gmail.com>',
      to: recipients.join(', '),
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return { success: true, info };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

module.exports = { sendEmail };





