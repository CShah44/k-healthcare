const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const otpStore = {}; // { email: { otp, expires } }

// Configure transporter (use your Gmail and App Password)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
transporter.verify((error, success) => {
    if (error) {
      console.error('SMTP connection failed:', error);
    } else {
      console.log('Server is ready to send emails');
    }
  });
  

// Signup endpoint: send OTP
app.post('/signup', async (req, res) => {
  console.log('Received /signup request', req.body); // <--- Add this line
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 }; // 5 min expiry

  try {
    await transporter.sendMail({
      from: '"Svastheya" <Svastheya@gmail.com>',
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp}`
    });
    res.json({ success: true, message: 'OTP sent to email.' });
  } catch (err) {
    console.error(err); // Add this line
    res.status(500).json({ success: false, message: 'Failed to send email.' });
  }
});

// Verify OTP endpoint
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];
  if (!record) return res.status(400).json({ success: false, message: 'No OTP sent.' });
  if (Date.now() > record.expires) return res.status(400).json({ success: false, message: 'OTP expired.' });
  if (otp !== record.otp) return res.status(400).json({ success: false, message: 'Invalid OTP.' });

  // OTP is valid
  delete otpStore[email]; // Remove OTP after verification
  res.json({ success: true, message: 'Email verified.' });
});

app.listen(3001, () => console.log('Server running on port 3001')); 