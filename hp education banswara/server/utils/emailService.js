const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'hpeducation918@gmail.com',
    pass: 'mdftggtvhvzfxjah'
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: '"HP Education" <hpeducation918@gmail.com>',
      to: to,
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




