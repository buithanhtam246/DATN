const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;
const ORDERS_FILE_PATH = path.join(__dirname, 'data', 'orders.json');
const USERS_FILE_PATH = path.join(__dirname, 'data', 'users.json');

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

async function ensureOrdersFile() {
  const ordersDir = path.dirname(ORDERS_FILE_PATH);
  await fs.mkdir(ordersDir, { recursive: true });

  try {
    await fs.access(ORDERS_FILE_PATH);
  } catch {
    await fs.writeFile(ORDERS_FILE_PATH, '[]', 'utf8');
  }
}

async function ensureUsersFile() {
  const usersDir = path.dirname(USERS_FILE_PATH);
  await fs.mkdir(usersDir, { recursive: true });

  try {
    await fs.access(USERS_FILE_PATH);
  } catch {
    await fs.writeFile(USERS_FILE_PATH, '[]', 'utf8');
  }
}

async function readOrders() {
  await ensureOrdersFile();
  const rawData = await fs.readFile(ORDERS_FILE_PATH, 'utf8');
  return JSON.parse(rawData || '[]');
}

async function writeOrders(orders) {
  await fs.writeFile(ORDERS_FILE_PATH, JSON.stringify(orders, null, 2), 'utf8');
}

async function readUsers() {
  await ensureUsersFile();
  const rawData = await fs.readFile(USERS_FILE_PATH, 'utf8');
  return JSON.parse(rawData || '[]');
}

async function writeUsers(users) {
  await fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf8');
}

app.post('/api/orders', async (req, res) => {
  try {
    const payload = req.body;

    if (!payload || !Array.isArray(payload.items) || payload.items.length === 0) {
      return res.status(400).json({ message: 'Don hang khong hop le' });
    }

    const orders = await readOrders();
    const orderRecord = {
      id: `order_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...payload
    };

    orders.push(orderRecord);
    await writeOrders(orders);

    return res.status(201).json({
      message: 'Luu don hang thanh cong',
      order: orderRecord
    });
  } catch (error) {
    console.error('Loi luu don hang:', error);
    return res.status(500).json({ message: 'Khong the luu don hang' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body || {};

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Vui long nhap day du thong tin' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Mat khau khong khop' });
    }

    const users = await readUsers();
    const normalizedEmail = String(email).trim().toLowerCase();
    const existedUser = users.find((user) => String(user.email).toLowerCase() === normalizedEmail);

    if (existedUser) {
      return res.status(409).json({ success: false, message: 'Email da ton tai' });
    }

    const userRecord = {
      id: `user_${Date.now()}`,
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash: crypto.createHash('sha256').update(password).digest('hex'),
      createdAt: new Date().toISOString()
    };

    users.push(userRecord);
    await writeUsers(users);

    return res.status(201).json({
      success: true,
      message: 'Dang ky thanh cong',
      data: {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        createdAt: userRecord.createdAt
      }
    });
  } catch (error) {
    console.error('Loi dang ky:', error);
    return res.status(500).json({ success: false, message: 'Khong the dang ky tai khoan' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui long nhap day du thong tin' });
    }

    const users = await readUsers();
    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = users.find((user) => String(user.email).toLowerCase() === normalizedEmail);

    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'Email không tồn tại' });
    }

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    if (existingUser.passwordHash !== passwordHash) {
      return res.status(401).json({ success: false, message: 'Sai mật khẩu' });
    }

    const token = crypto.randomBytes(24).toString('hex');

    return res.status(200).json({
      success: true,
      message: 'Dang nhap thanh cong',
      data: {
        token,
        id: existingUser.id,
        user: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email
        }
      }
    });
  } catch (error) {
    console.error('Loi dang nhap:', error);
    return res.status(500).json({ success: false, message: 'Khong the dang nhap' });
  }
});

app.get('/', (req, res) => {
  res.send('Backend đang chạy cực mượt!');
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});