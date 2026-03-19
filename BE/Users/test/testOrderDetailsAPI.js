const http = require('http');

// Test script đơn giản cho API xem chi tiết đơn hàng
async function testGetOrderDetails() {
  console.log('🧪 Testing GET Order Details API...\n');

  // Giả sử server đang chạy và bạn có token
  console.log('📝 Hướng dẫn test thủ công:');
  console.log('1. Đăng nhập để lấy token:');
  console.log('   POST http://localhost:3000/api/auth/login');
  console.log('   Body: {"email": "test@example.com", "password": "123456"}');
  console.log('');

  console.log('2. Tạo đơn hàng:');
  console.log('   POST http://localhost:3000/api/orders/checkout');
  console.log('   Headers: Authorization: Bearer <token>');
  console.log('   Body: {');
  console.log('     "address_id": 1,');
  console.log('     "payment_method_id": 1,');
  console.log('     "items": [{"variant_id": 1, "quantity": 2, "price": 50000}],');
  console.log('     "delivery_cost": 30000');
  console.log('   }');
  console.log('');

  console.log('3. Lấy chi tiết đơn hàng:');
  console.log('   GET http://localhost:3000/api/orders/<order_id>');
  console.log('   Headers: Authorization: Bearer <token>');
  console.log('');

  console.log('4. Kiểm tra response bao gồm:');
  console.log('   - Thông tin đơn hàng (total_price, status, etc.)');
  console.log('   - Chi tiết sản phẩm (details array)');
  console.log('   - Thông tin địa chỉ, payment method, voucher (nếu có)');
  console.log('');

  console.log('✅ API đã sẵn sàng để test!');
}

// Chạy hướng dẫn
testGetOrderDetails();