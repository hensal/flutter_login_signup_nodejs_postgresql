const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { body, validationResult } = require('express-validator');

// Load the JWT_SECRET from environment variables
const JWT_SECRET = process.env.JWT_SECRET; 

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 3000;

// PostgreSQL Connection Pool
const pool = new Pool({
  user: 'postgres', 
  host: 'localhost',
  database: 'flutter',
  password: 'password',
  port: 5433,
});

// **Register User API with Gmail Validation**
app.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email')
      .matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)
      .withMessage('Only Gmail addresses are allowed'),
    body('password')
      .isLength({ min: 5 })
      .withMessage('Password must be at least 5 characters long'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if user already exists
      const userExists = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
      if (userExists.rows.length > 0) {
        return res.status(400).json({ message: 'Email already in use.' });
      }

      // Hash password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into the database
      const newUser = await pool.query(
        'INSERT INTO Users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
        [name, email, hashedPassword]
      );

      res.status(201).json({ message: 'User registered successfully', user: newUser.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
      const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

      if (userResult.rows.length === 0) {
          return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const user = userResult.rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
          return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

      res.json({ success: true, message: 'Login successful', token });
  } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Create a Nodemailer transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, 
  },
});   

// Password reset route
app.post('/send-reset-link', async (req, res) => {
  const { email } = req.body;

  // Check if email is valid
  if (!email || !email.includes('@gmail.com')) {
    return res.status(400).json({ message: 'Invalid email address' });
  }

  try {
    // Check if the email exists in the database
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'We cannot find your email, re-check your email!!!' });
    }

    // Generate the reset URL
    const resetUrl = `http://localhost:60966/reset-password?email=${email}`;

    // Create the mailOptions object to send the reset link
    const mailOptions = {
      from: process.env.EMAIL_USER, // The email from which the reset link will be sent
      to: email, // Send to the email that requested the reset
      subject: 'Password Reset Request',
      text: `Hello, you can reset your password here: ${resetUrl}`, 
    };

    // Send email to the requested user
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'Password reset link sent!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error sending email', error: error.message });
  }
});

// Route to reset password (this is just a placeholder)
app.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!newPassword || newPassword.length < 5) {
    return res.status(400).json({ success: false, message: 'Password must be at least 5 characters long.' });
  }

  try {
    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in the database
    const result = await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);

    // Check if any rows were updated
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate new JWT token
    const userResult = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully.',
      token: token
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error resetting password' });
  }
});
 
// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
