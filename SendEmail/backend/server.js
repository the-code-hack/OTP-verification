const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const User = require('./models/Users');
const cors = require('cors');
const app = express();
app.use(cors());
// Middleware
app.use(bodyParser.json());
// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/g24', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define MongoDB schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
  otp: { type: Number },
});

// Route to handle user registration and OTP sending
app.post('/register', async (req, res) => {
  try {
    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);

    // Create new user
    const user = new User({
      email: req.body.email,
      password: req.body.password,
      verified: false,
      otp: otp,
    });
    // Save user to database
    await user.save();
    // Send OTP via email
    sendOTP(req.body.email, otp);
    res.status(200).send('OTP sent successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


app.post('/verify-otp', async (req, res) => {
    try {
      const otp = req.body.otp;
      const user = await User.findOne({ otp });
  
      if (user) {
        // Update user verification status
        user.verified = true;
        await user.save();
  
        res.json({ success: true, user: { name: user.email } });
      } else {
        res.json({ success: false });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });
  

// Function to send OTP via email
function sendOTP(email, otp) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: '...', // Your Gmail email address
      pass: '...', // Your Gmail app password
    },
  });

  const mailOptions = {
    from: '...', // Your Gmail email address
    to: email,
    subject: 'OTP for registration',
    text: `Your OTP for registration is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`localhost ${PORT}`)
);

