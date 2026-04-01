const mysql = require('mysql2/promise');

const dbConfig = {
  HOST: process.env.DB_HOST || "localhost",
  USER: process.env.DB_USER || "root",
  PASSWORD: process.env.DB_PASSWORD || "",
  DB: process.env.DB_NAME || "DATN"
};

async function checkOrdersTable() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: dbConfig.HOST,
      user: dbConfig.USER,
      password: dbConfig.PASSWORD,
      database: dbConfig.DB
    });

    console.log('✓ Connected to MySQL database successfully');
    console.log(`Database: ${dbConfig.DB}\n`);

    // Get column information from the 'orders' table
    const [columns] = await connection.execute(
      "SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'orders' AND TABLE_SCHEMA = ?"
      , [dbConfig.DB]
    );

    if (columns.length === 0) {
      console.log('❌ No columns found. The "orders" table might not exist.');
      await connection.end();
      return;
    }

    console.log('╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                    ORDERS TABLE - COLUMN INFORMATION                        ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

    console.log('Column Details:');
    console.log('─'.repeat(100));
    
    columns.forEach((col, index) => {
      console.log(`\n${index + 1}. Column Name: ${col.COLUMN_NAME}`);
      console.log(`   Data Type: ${col.COLUMN_TYPE}`);
      console.log(`   Nullable: ${col.IS_NULLABLE}`);
      console.log(`   Key: ${col.COLUMN_KEY || 'None'}`);
      console.log(`   Extra: ${col.EXTRA || 'None'}`);
    });

    console.log('\n' + '─'.repeat(100));
    console.log('\nSummary Table:');
    console.log('─'.repeat(100));
    console.table(columns.map(col => ({
      'Column Name': col.COLUMN_NAME,
      'Data Type': col.COLUMN_TYPE,
      'Nullable': col.IS_NULLABLE,
      'Key': col.COLUMN_KEY || '-',
      'Extra': col.EXTRA || '-'
    })));

    await connection.end();
    console.log('\n✓ Connection closed successfully');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

checkOrdersTable();
