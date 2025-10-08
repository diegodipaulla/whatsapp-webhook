const express = require('express');
const db = require('../services/dbService');
const { hashPassword, comparePassword, createToken, verifyToken } = require('../services/authService');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const hashedPassword = await hashPassword(password);
    const user = await db.createUser({ email, password: hashedPassword });

    const token = createToken(user);
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = createToken(user);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  const user = verifyToken(token);
  if (user == null) {
    return res.sendStatus(403);
  }

  req.user = user;
  next();
}

module.exports = {
  router,
  authenticateToken,
};