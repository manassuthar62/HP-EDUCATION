const https = require('https');
require('dotenv').config();

const sendEmail = async (to, subject, html) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      sender: { name: "HP Education", email: "hpeducation918@gmail.com" },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html
    });

    const options = {
      hostname: 'api.brevo.com',
      port: 443,
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': (process.env.EMAIL_PASS || '').trim(),
        'content-type': 'application/json',
        'content-length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('Email sent successfully via Brevo API');
          resolve({ success: true, info: responseBody });
        } else {
          console.error('Brevo API Error:', responseBody);
          resolve({ success: false, error: responseBody });
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request Error:', error);
      resolve({ success: false, error });
    });

    req.write(data);
    req.end();
  });
};

module.exports = { sendEmail };


