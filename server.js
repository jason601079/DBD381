const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');


const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection (use environment variables in real projects)
const MONGO_URI = 'mongodb+srv://taylorleejason:12345@cluster0.q8h13hr.mongodb.net/Ecom-demo';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// User Schema & Model
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  passwordHash: String,
  isAdmin: Boolean,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Order Schema & Model
const orderSchema = new mongoose.Schema({
  userId: String,
  items: [
    {
      productId: String,
      name: String,
      price: Number,
      quantity: Number,
      _id: false // disables _id for each item
    }
  ],
  total: Number,
  status: String,
  createdAt: Date
}, {
  versionKey: false // disables __v
});


const Order = mongoose.model('Order', orderSchema);

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'user.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

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

    // Direct comparison (not secure for production use)
    const passwordMatch = password === user.passwordHash;

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    //  Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    const newUser = new User({
      username,
      email,
      passwordHash: password, // consider hashing this in production
      isAdmin: false
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Registration failed.' });
  }
});



// Add Order Route
app.post('/add-order', async (req, res) => {
  try {
    const orderData = req.body;
    const newOrder = new Order(orderData);

    await newOrder.save();
    res.status(201).json({ message: 'Order inserted successfully!' });
  } catch (err) {
    console.error('Add order error:', err);
    res.status(500).json({ message: 'Insertion failed.' });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
