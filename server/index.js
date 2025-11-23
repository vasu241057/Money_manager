import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import dotenv from 'dotenv';

import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

const client = jwksClient({
  jwksUri: `https://api.stack-auth.com/api/v1/projects/${process.env.VITE_STACK_PROJECT_ID}/.well-known/jwks.json`
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function(err, key) {
    if (err) {
      console.error("Error getting signing key:", err);
      return callback(err, null);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

const verifyToken = (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];

  if (!token && req.cookies) {
    // Try to find a JWT in cookies
    // Stack Auth cookie name might vary, so we look for any JWT-like string
    for (const [key, value] of Object.entries(req.cookies)) {
      if (typeof value === 'string' && value.split('.').length === 3) {
        token = value;
        break;
      }
    }
  }

  if (!token) {
    console.log('No token found in headers or cookies');
    return res.status(401).json({ error: 'No token provided' });
  }

  console.log('Verifying token:', token.substring(0, 20) + '...');

  jwt.verify(token, getKey, { algorithms: ['RS256', 'ES256'] }, (err, decoded) => {
    if (err) {
      console.error('Token verification failed:', err);
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
};

// --- Routes ---

// Get Transactions
app.get('/api/transactions', verifyToken, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.sub },
      orderBy: { date: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Create Transaction
app.post('/api/transactions', verifyToken, async (req, res) => {
  try {
    const { amount, type, category, date, description } = req.body;
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        type,
        category,
        date: new Date(date),
        description,
        userId: req.user.sub
      }
    });
    res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Update Transaction
app.put('/api/transactions/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, category, date, description } = req.body;
    
    // Ensure user owns the transaction
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: req.user.sub }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        amount,
        type,
        category,
        date: new Date(date),
        description
      }
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Delete Transaction
app.delete('/api/transactions/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    // Ensure user owns the transaction
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: req.user.sub }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await prisma.transaction.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Get Categories
app.get('/api/categories', verifyToken, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.user.sub }
    });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create Category
app.post('/api/categories', verifyToken, async (req, res) => {
  try {
    const { name, type, color, icon, subCategories } = req.body;
    const category = await prisma.category.create({
      data: {
        name,
        type,
        color,
        icon,
        subCategories: subCategories || [],
        userId: req.user.sub
      }
    });
    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update Category (for subcategories)
app.put('/api/categories/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { subCategories } = req.body;
    
    // Ensure user owns the category
    const category = await prisma.category.findFirst({
      where: { id, userId: req.user.sub }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { subCategories }
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete Category
app.delete('/api/categories/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findFirst({
      where: { id, userId: req.user.sub }
    });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    
    await prisma.category.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
