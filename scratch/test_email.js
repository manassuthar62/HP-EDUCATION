const nodemailer = require('nodemailer');
require('dotenv').config({ path: './hp education banswara/server/.env' });

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 2525,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const test = async () => {
  try {
    const mailOptions = {
      from: '"HP Education Test" <hpeducation918@gmail.com>',
      to: 'hp9414401525@gmail.com, manassuthar62@gmail.com',
      subject: 'Test Email from Antigravity',
      html: '<h1>Test</h1>'
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Success:', info.response);
  } catch (e) {
    console.error('Failed:', e);
  }
};

test();
