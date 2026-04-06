const { sequelize } = require('./config/database');
const User = require('./Users/model/user.model');

async function syncDatabase() {
  try {
    console.log('🔄 Syncing database...');
    
    // Sync all models
    await sequelize.sync({ alter: true });
    
    console.log('✅ Database synced successfully!');
    
    // Check if admin exists
    const adminCount = await User.count({ where: { role: 'admin' } });
    console.log(`👤 Admin users found: ${adminCount}`);
    
    if (adminCount === 0) {
      console.log('⚠️  No admin found. Creating default admin...');
      
      const bcryptUtil = require('./Users/utils/bcrypt.util');
      const hashedPassword = await bcryptUtil.hash('Admin@123');
      
      const admin = await User.create({
        name: 'Admin',
        email: 'admin@goodshoes.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      });
      
      console.log('✅ Admin created successfully!');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: Admin@123`);
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    process.exit(0);
  }
}

syncDatabase();
