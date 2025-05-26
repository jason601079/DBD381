const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');


const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const uri = 'mongodb+srv://taylorleejason:12345@cluster0.q8h13hr.mongodb.net/'; // or use Atlas URI
const client = new MongoClient(uri);



// Serve user.html first
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'user.html'));
});

// Serve static files (CSS, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html separately
app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Basic plaintext password check (should hash in production)
    if (user.passwordHash !== password) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

//Cart route
app.post('/add-order', async (req, res) => {
  try {
    await client.connect();
    const db = client.db('Ecom-demo');
    const orders = db.collection('orders');

    // Get the incoming data
    const order = req.body;

    // Ensure the correct types
    order._id = new ObjectId(order._id);
    order.createdAt = new Date(order.createdAt);

    await orders.insertOne(order);
    res.status(201).json({ message: 'Order inserted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Insertion failed.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
