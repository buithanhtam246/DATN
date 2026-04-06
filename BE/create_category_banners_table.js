const { sequelize } = require('./config/database');

async function run() {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS category_banners (
        id INT NOT NULL AUTO_INCREMENT,
        category_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        link_url VARCHAR(255) DEFAULT NULL,
        status ENUM('active','inactive') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_category_banners_category (category_id),
        CONSTRAINT fk_category_banners_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ Table category_banners is ready');
  } catch (error) {
    console.error('❌ Create table failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();
