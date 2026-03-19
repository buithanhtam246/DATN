#!/usr/bin/env node

/**
 * Test Script cho API Đánh Giá
 * 
 * Sử dụng:
 *   node testReviewAPI.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

class APITester {
  constructor() {
    this.token = null;
    this.userId = null;
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async request(method, endpoint, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, BASE_URL);
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      if (this.token && !headers.Authorization) {
        options.headers.Authorization = `Bearer ${this.token}`;
      }

      const req = http.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              data: JSON.parse(data)
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              data: data
            });
          }
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  async testLogin() {
    this.log('\n📝 TEST 1: Đăng Nhập', 'cyan');
    this.log('═'.repeat(50), 'cyan');

    const response = await this.request('POST', '/api/auth/login', {
      email: 'user@example.com',
      password: 'password123'
    });

    this.log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    
    if (response.data.success && response.data.data.token) {
      this.token = response.data.data.token;
      this.userId = response.data.data.user.id;
      this.log(`✅ Đăng nhập thành công! Token: ${this.token.substring(0, 20)}...`, 'green');
      this.log(`   UserID: ${this.userId}`, 'green');
      return true;
    } else {
      this.log(`❌ Đăng nhập thất bại: ${response.data.message}`, 'red');
      this.log(`   Ghi chú: Hãy đảm bảo user này đã đăng ký`, 'yellow');
      return false;
    }
  }

  async testCreateReview() {
    this.log('\n⭐ TEST 2: Tạo Đánh Giá', 'cyan');
    this.log('═'.repeat(50), 'cyan');

    const reviewData = {
      order_detail_id: 1,
      rating: 5,
      comment: 'Sản phẩm rất tuyệt vời! Chất lượng tốt và giao hàng nhanh chóng.'
    };

    this.log(`Body: ${JSON.stringify(reviewData, null, 2)}`, 'blue');

    const response = await this.request('POST', '/api/reviews/create', reviewData);

    this.log(`Status: ${response.status}`, response.status === 201 ? 'green' : 'red');
    this.log(`Response: ${JSON.stringify(response.data, null, 2)}`, 'blue');

    if (response.data.success) {
      this.log('✅ Tạo đánh giá thành công!', 'green');
      return response.data.data.id;
    } else {
      this.log(`❌ Tạo đánh giá thất bại: ${response.data.message}`, 'red');
      return null;
    }
  }

  async testGetProductReviews() {
    this.log('\n📊 TEST 3: Lấy Đánh Giá Sản Phẩm', 'cyan');
    this.log('═'.repeat(50), 'cyan');

    const endpoint = '/api/reviews/product?variant_id=1&page=1&limit=5';
    this.log(`Endpoint: GET ${endpoint}`, 'blue');

    const response = await this.request('GET', endpoint, null, { 
      Authorization: undefined  // Public endpoint
    });

    this.log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    
    if (response.data.success) {
      this.log('✅ Lấy đánh giá thành công!', 'green');
      this.log(`   Tổng số đánh giá: ${response.data.data.stats.total_reviews}`, 'green');
      this.log(`   Trung bình sao: ${response.data.data.stats.avg_rating}`, 'green');
      this.log(`   Số đánh giá 5 sao: ${response.data.data.stats.rating_distribution['5_star']}`, 'green');
      this.log(`   Danh sách: ${response.data.data.reviews.length} item`, 'green');
    } else {
      this.log(`❌ Lấy đánh giá thất bại: ${response.data.message}`, 'red');
    }
  }

  async testGetOrderReviews() {
    this.log('\n📋 TEST 4: Lấy Đánh Giá Đơn Hàng', 'cyan');
    this.log('═'.repeat(50), 'cyan');

    const endpoint = '/api/reviews/order/1';
    this.log(`Endpoint: GET ${endpoint}`, 'blue');

    const response = await this.request('GET', endpoint);

    this.log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');

    if (response.data.success) {
      this.log('✅ Lấy đánh giá đơn hàng thành công!', 'green');
      this.log(`   Số đánh giá: ${response.data.data.length}`, 'green');
    } else {
      this.log(`❌ Lấy đánh giá đơn hàng thất bại: ${response.data.message}`, 'red');
    }
  }

  async testUpdateReview(reviewId) {
    this.log('\n✏️  TEST 5: Cập Nhật Đánh Giá', 'cyan');
    this.log('═'.repeat(50), 'cyan');

    if (!reviewId) {
      this.log('⏭️  Bỏ qua: không có review ID từ bước tạo đánh giá', 'yellow');
      return;
    }

    const updateData = {
      rating: 4,
      comment: 'Sau khi sử dụng thêm, chất lượng tốt nhưng hơi yếu ở chi tiết nhỏ.'
    };

    this.log(`Body: ${JSON.stringify(updateData, null, 2)}`, 'blue');

    const response = await this.request('PUT', `/api/reviews/update/${reviewId}`, updateData);

    this.log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');

    if (response.data.success) {
      this.log('✅ Cập nhật đánh giá thành công!', 'green');
    } else {
      this.log(`❌ Cập nhật đánh giá thất bại: ${response.data.message}`, 'red');
    }
  }

  async testDeleteReview(reviewId) {
    this.log('\n🗑️  TEST 6: Xóa Đánh Giá', 'cyan');
    this.log('═'.repeat(50), 'cyan');

    if (!reviewId) {
      this.log('⏭️  Bỏ qua: không có review ID từ bước tạo đánh giá', 'yellow');
      return;
    }

    this.log(`Endpoint: DELETE /api/reviews/delete/${reviewId}`, 'blue');

    const response = await this.request('DELETE', `/api/reviews/delete/${reviewId}`);

    this.log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');

    if (response.data.success) {
      this.log('✅ Xóa đánh giá thành công!', 'green');
    } else {
      this.log(`❌ Xóa đánh giá thất bại: ${response.data.message}`, 'red');
    }
  }

  async testServerHealth() {
    this.log('\n🏥 TEST 0: Kiểm Tra Server', 'cyan');
    this.log('═'.repeat(50), 'cyan');

    try {
      const response = await this.request('GET', '/api/health');
      this.log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
      
      if (response.data.status === 'OK') {
        this.log('✅ Server đang chạy bình thường', 'green');
        return true;
      }
    } catch (error) {
      this.log(`❌ Server không phản hồi: ${error.message}`, 'red');
      this.log('💡 Ghi chú: Hãy đảm bảo server đang chạy (npm start)', 'yellow');
      return false;
    }
  }

  async runAllTests() {
    this.log('\n' + '='.repeat(50), 'cyan');
    this.log('🧪 TEST API ĐÁNH GIÁ ĐƠN HÀNG', 'cyan');
    this.log('='.repeat(50), 'cyan');

    // Check server health
    if (!await this.testServerHealth()) {
      process.exit(1);
    }

    // Login
    if (!await this.testLogin()) {
      this.log('\n⚠️  Không thể tiếp tục mà không có token', 'red');
      process.exit(1);
    }

    // Test create
    const reviewId = await this.testCreateReview();

    // Test get product reviews
    await this.testGetProductReviews();

    // Test get order reviews
    await this.testGetOrderReviews();

    // Test update
    await this.testUpdateReview(reviewId);

    // Test delete
    // await this.testDeleteReview(reviewId);

    this.log('\n' + '='.repeat(50), 'cyan');
    this.log('✅ HOÀN THÀNH CÁC TEST!', 'green');
    this.log('='.repeat(50), 'cyan');
    this.log('\n💡 Ghi chú:', 'blue');
    this.log('   - Xóa đánh giá được bỏ qua trong test (bạn có thể test riêng)', 'blue');
    this.log('   - Để test lại, bạn cần user/order/order_detail khác nhau', 'blue');
    this.log('   - Hoặc chỉnh sửa order_detail_id và variant_id trong file này', 'blue');
  }
}

// Run tests
const tester = new APITester();
tester.runAllTests().catch(error => {
  console.error('❌ Lỗi:', error.message);
  process.exit(1);
});
