const getOTPTemplate = (otp, type = 'login') => {
  const title = type === 'login' ? 'Login Verification Code' : 'Password Change Verification';
  const description = type === 'login' 
    ? 'Someone is trying to log in to your HP Education Admin Panel.' 
    : 'You are attempting to change your administrative password.';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f9fafb;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          padding: 40px 20px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .content {
          padding: 40px 30px;
          background-color: white;
          text-align: center;
        }
        .greeting {
          font-size: 18px;
          color: #1f2937;
          margin-bottom: 10px;
        }
        .description {
          color: #6b7280;
          font-size: 15px;
          margin-bottom: 30px;
          line-height: 1.5;
        }
        .otp-box {
          background-color: #f3f4f6;
          padding: 24px;
          border-radius: 12px;
          display: inline-block;
          margin-bottom: 30px;
          border: 2px dashed #3b82f6;
        }
        .otp-code {
          font-size: 42px;
          font-weight: 800;
          letter-spacing: 8px;
          color: #1e3a8a;
          margin: 0;
        }
        .footer {
          padding: 20px;
          text-align: center;
          background-color: #f3f4f6;
          color: #9ca3af;
          font-size: 12px;
        }
        .warning {
          font-size: 13px;
          color: #ef4444;
          margin-top: 20px;
          padding: 10px;
          background-color: #fef2f2;
          border-radius: 6px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>HP GROUP OF EDUCATION</h1>
        </div>
        <div class="content">
          <div class="greeting">DEAR HP SIR,</div>
          <div class="description">
            ${description}<br>
            Use the following One-Time Password (OTP) to complete the process.
          </div>
          
          <div class="otp-box">
            <h2 class="otp-code">${otp}</h2>
          </div>
          
          <div class="warning">
            <strong>Security Note:</strong> This OTP is valid for 10 minutes. Please do not share this code with anyone.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} HP GROUP OF EDUCATION. All rights reserved.<br>
          Banswara, Rajasthan
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { getOTPTemplate };
