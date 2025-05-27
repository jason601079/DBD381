const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../User');
const Order = require('../Order');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
  
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }

    jest.spyOn(console, 'error').mockImplementation(() => {}); // Silence console.error
  });
  

afterEach(async () => {
  await User.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('DELETE /delete-user/:id', () => {
  it('should delete a user successfully', async () => {
    const user = await User.create({ name: 'Test', email: 'test@example.com' });

    const res = await request(app).delete(`/delete-user/${user._id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User account deleted successfully!');

    const check = await User.findById(user._id);
    expect(check).toBeNull();
  });

  it('should return 404 if user not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/delete-user/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  it('should return 500 for invalid user ID', async () => {
    const res = await request(app).delete('/delete-user/invalid-id');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });
});

describe('PUT /update-password/:id', () => {
    it('should update password successfully', async () => {
      const user = await User.create({ name: 'John', email: 'john@example.com', passwordHash: 'oldpass' });
  
      const res = await request(app)
        .put(`/update-password/${user._id}`)
        .send({ newPassword: 'newpass123' });
  
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Password updated successfully!');
    });
  
    it('should return 400 if new password is missing', async () => {
      const user = await User.create({ name: 'John', email: 'john@example.com', passwordHash: 'oldpass' });
  
      const res = await request(app)
        .put(`/update-password/${user._id}`)
        .send({ newPassword: '' });
  
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('New password is required');
    });
  
    it('should return 404 if user not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
  
      const res = await request(app)
        .put(`/update-password/${fakeId}`)
        .send({ newPassword: 'newpass123' });
  
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });
  
    it('should return 500 for invalid user ID', async () => {
      const res = await request(app)
        .put('/update-password/invalid-id')
        .send({ newPassword: 'newpass123' });
  
      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Server error');
    });
});

describe('POST /register', () => {
    it('should register a user successfully', async () => {
      const res = await request(app).post('/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
  
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User registered successfully!');
  
      const userInDb = await User.findOne({ username: 'testuser' });
      expect(userInDb).not.toBeNull();
      expect(userInDb.email).toBe('test@example.com');
    });
  
    it('should return 409 if username already exists', async () => {
      await User.create({
        username: 'testuser',
        email: 'existing@example.com',
        passwordHash: 'hashedpass'
      });
  
      const res = await request(app).post('/register').send({
        username: 'testuser',
        email: 'new@example.com',
        password: 'newpass123'
      });
  
      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Username already taken');
    });
  
    it('should return 400 if required fields are missing', async () => {
        const res = await request(app).post('/register').send({
          username: 'incompleteuser',
          email: '' // missing password and email is empty
        });
    
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Missing required fields');
      });
  
    it('should return 500 if saving user throws error', async () => {
      // Simulate error by mocking `save` to throw
      const saveMock = jest.spyOn(User.prototype, 'save').mockImplementation(() => {
        throw new Error('Database error');
      });
  
      const res = await request(app).post('/register').send({
        username: 'erroruser',
        email: 'error@example.com',
        password: '123456'
      });
  
      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Registration failed.');
  
      saveMock.mockRestore();
    });
});

describe('POST /login', () => {
    it('should log in successfully with correct credentials', async () => {
      // Insert user with plain password for test (matches route logic)
      await User.create({
        username: 'loginuser',
        email: 'login@example.com',
        passwordHash: 'testpass123', // In real apps, hash this
      });
  
      const res = await request(app).post('/login').send({
        username: 'loginuser',
        password: 'testpass123',
      });
  
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.user.username).toBe('loginuser');
    });
  
    it('should return 401 if user is not found', async () => {
      const res = await request(app).post('/login').send({
        username: 'nonexistent',
        password: 'irrelevant',
      });
  
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('User not found');
    });
  
    it('should return 401 if password is incorrect', async () => {
      await User.create({
        username: 'wrongpassuser',
        email: 'wrongpass@example.com',
        passwordHash: 'correctpassword',
      });
  
      const res = await request(app).post('/login').send({
        username: 'wrongpassuser',
        password: 'wrongpassword',
      });
  
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Incorrect password');
    });
  
    it('should return 500 if database error occurs', async () => {
      const mock = jest.spyOn(User, 'findOne').mockImplementation(() => {
        throw new Error('Simulated DB error');
      });
  
      const res = await request(app).post('/login').send({
        username: 'anyuser',
        password: 'anypass',
      });
  
      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Server error');
  
      mock.mockRestore();
    });
});

describe('POST /add-order', () => {
    afterEach(async () => {
      await Order.deleteMany(); // Clean up after each test
    });
  
    it('should insert a new order successfully', async () => {
      const orderPayload = {
        userId: 'user123',
        items: [
          {
            productId: 'prod001',
            name: 'Widget A',
            price: 19.99,
            quantity: 2
          },
          {
            productId: 'prod002',
            name: 'Widget B',
            price: 9.99,
            quantity: 1
          }
        ],
        total: 49.97,
        status: 'pending',
        createdAt: new Date()
      };
  
      const res = await request(app).post('/add-order').send(orderPayload);
  
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Order inserted successfully!');
  
      const orderInDb = await Order.findOne({ userId: 'user123' });
      expect(orderInDb).not.toBeNull();
      expect(orderInDb.items.length).toBe(2);
      expect(orderInDb.total).toBe(49.97);
      expect(orderInDb.status).toBe('pending');
    });
  
    it('should return 500 if saving the order throws an error', async () => {
      const saveMock = jest.spyOn(Order.prototype, 'save').mockImplementation(() => {
        throw new Error('Simulated DB error');
      });
  
      const res = await request(app).post('/add-order').send({
        userId: 'errorUser',
        items: [],
        total: 0,
        status: 'failed',
        createdAt: new Date()
      });
  
      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Insertion failed.');
  
      saveMock.mockRestore();
    });
});