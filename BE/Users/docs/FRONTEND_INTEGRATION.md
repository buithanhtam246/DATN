# 🎨 Hướng Dẫn Tích Hợp API Đánh Giá vào Frontend

## 📱 Mô Tả Tính Năng

Người dùng có thể:
1. ⭐ Đánh giá sản phẩm từ 1-5 sao
2. 💬 Viết nhận xét chi tiết
3. 📊 Xem thống kê đánh giá
4. ✏️ Chỉnh sửa đánh giá của mình
5. 🗑️ Xóa đánh giá

---

## 🔧 Cấu Hình JavaScript

### 1. API Service Class

```javascript
// services/reviewService.js

class ReviewService {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  // Lấy token từ localStorage
  getToken() {
    return localStorage.getItem('token');
  }

  // Helper method cho HTTP requests
  async request(method, endpoint, body = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const token = this.getToken();
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseURL}/api/reviews${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Lỗi API');
    }

    return data;
  }

  // Tạo đánh giá
  async createReview(orderDetailId, rating, comment) {
    return this.request('POST', '/create', {
      order_detail_id: orderDetailId,
      rating: Math.round(rating),
      comment: comment.trim()
    });
  }

  // Lấy đánh giá sản phẩm
  async getProductReviews(variantId, page = 1, limit = 10) {
    return this.request('GET', `/product?variant_id=${variantId}&page=${page}&limit=${limit}`, null);
  }

  // Lấy đánh giá đơn hàng
  async getOrderReviews(orderId) {
    return this.request('GET', `/order/${orderId}`, null);
  }

  // Cập nhật đánh giá
  async updateReview(reviewId, rating, comment) {
    return this.request('PUT', `/update/${reviewId}`, {
      rating: rating ? Math.round(rating) : undefined,
      comment: comment ? comment.trim() : undefined
    });
  }

  // Xóa đánh giá
  async deleteReview(reviewId) {
    return this.request('DELETE', `/delete/${reviewId}`, null);
  }
}

// Export
export default new ReviewService();
```

---

## 🎯 UI Components

### 1. Component: Hiển Thị Đánh Giá Sản Phẩm

```html
<!-- ReviewsList.vue / ReviewsList.jsx -->

<template>
  <div class="reviews-section">
    <!-- Thống kê đánh giá -->
    <div class="stats" v-if="stats">
      <div class="rating-summary">
        <h3>{{ stats.avg_rating }} ⭐</h3>
        <p>{{ stats.total_reviews }} đánh giá</p>
      </div>

      <!-- Phân bố rating -->
      <div class="rating-distribution">
        <div class="rating-bar" v-for="star in [5,4,3,2,1]" :key="star">
          <span>{{ star }} ⭐</span>
          <div class="bar">
            <div class="filled" :style="{ 
              width: (stats.rating_distribution[star + '_star'] / stats.total_reviews * 100) + '%' 
            }"></div>
          </div>
          <span>{{ stats.rating_distribution[star + '_star'] }}</span>
        </div>
      </div>
    </div>

    <!-- Danh sách đánh giá -->
    <div class="reviews-list">
      <div class="review-item" v-for="review in reviews" :key="review.id">
        <div class="review-header">
          <span class="rating">{{ '⭐'.repeat(review.rating) }}</span>
          <span class="date">{{ formatDate(review.created_at) }}</span>
        </div>
        <p class="comment">{{ review.comment }}</p>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button 
        @click="previousPage" 
        :disabled="currentPage === 1"
      >← Trước</button>

      <span>{{ currentPage }} / {{ totalPages }}</span>

      <button 
        @click="nextPage" 
        :disabled="currentPage === totalPages"
      >Sau →</button>
    </div>
  </div>
</template>

<script>
import reviewService from '@/services/reviewService';

export default {
  name: 'ReviewsList',
  props: {
    variantId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      reviews: [],
      stats: null,
      currentPage: 1,
      limit: 10,
      totalPages: 1,
      loading: false,
      error: null
    }
  },
  mounted() {
    this.loadReviews();
  },
  methods: {
    async loadReviews() {
      try {
        this.loading = true;
        const response = await reviewService.getProductReviews(
          this.variantId,
          this.currentPage,
          this.limit
        );
        
        this.reviews = response.data.reviews;
        this.stats = response.data.stats;
        this.totalPages = response.data.pagination.total_pages;
      } catch (err) {
        this.error = err.message;
        console.error('Lỗi tải đánh giá:', err);
      } finally {
        this.loading = false;
      }
    },
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadReviews();
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.loadReviews();
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('vi-VN');
    }
  }
}
</script>

<style scoped>
.reviews-section {
  padding: 20px;
}

.rating-summary {
  text-align: center;
  margin-bottom: 20px;
}

.rating-summary h3 {
  font-size: 32px;
  margin: 0;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

.bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.filled {
  height: 100%;
  background: #ffc107;
  transition: width 0.3s;
}

.review-item {
  border: 1px solid #e0e0e0;
  padding: 15px;
  margin: 10px 0;
  border-radius: 8px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.comment {
  margin: 0;
  color: #666;
}
</style>
```

### 2. Component: Form Đánh Giá

```html
<!-- ReviewForm.vue / ReviewForm.jsx -->

<template>
  <div class="review-form">
    <h3>Đánh giá sản phẩm</h3>

    <!-- Rating Stars -->
    <div class="rating-input">
      <label>Đánh giá</label>
      <div class="stars">
        <button 
          v-for="star in 5" 
          :key="star"
          @click="rating = star"
          :class="{ active: star <= rating }"
          class="star-btn"
        >
          ⭐
        </button>
      </div>
      <p class="rating-text">{{ rating }} sao</p>
    </div>

    <!-- Comment -->
    <div class="comment-input">
      <label>Nhận xét</label>
      <textarea 
        v-model="comment"
        placeholder="Chia sẻ trải nghiệm của bạn..."
        rows="5"
        maxlength="1000"
      ></textarea>
      <p class="char-count">{{ comment.length }}/1000</p>
    </div>

    <!-- Buttons -->
    <div class="actions">
      <button 
        @click="submitReview" 
        :disabled="!canSubmit || loading"
        class="btn-submit"
      >
        {{ loading ? 'Đang gửi...' : 'Gửi đánh giá' }}
      </button>
      <button 
        @click="resetForm"
        class="btn-cancel"
      >
        Hủy
      </button>
    </div>

    <!-- Error/Success Messages -->
    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="success" class="alert alert-success">{{ success }}</div>
  </div>
</template>

<script>
import reviewService from '@/services/reviewService';

export default {
  name: 'ReviewForm',
  props: {
    orderDetailId: {
      type: Number,
      required: true
    }
  },
  emits: ['reviewSubmitted'],
  data() {
    return {
      rating: 5,
      comment: '',
      loading: false,
      error: null,
      success: null
    }
  },
  computed: {
    canSubmit() {
      return this.rating > 0 && this.comment.trim().length > 0;
    }
  },
  methods: {
    async submitReview() {
      if (!this.canSubmit) return;

      try {
        this.loading = true;
        this.error = null;

        await reviewService.createReview(
          this.orderDetailId,
          this.rating,
          this.comment
        );

        this.success = 'Đánh giá thành công!';
        this.resetForm();

        // Emit event để parent component cập nhật
        this.$emit('reviewSubmitted');

        // Ẩn thông báo sau 3s
        setTimeout(() => {
          this.success = null;
        }, 3000);
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.rating = 5;
      this.comment = '';
    }
  }
}
</script>

<style scoped>
.review-form {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  max-width: 600px;
}

.rating-input {
  margin-bottom: 20px;
}

.stars {
  display: flex;
  gap: 10px;
  margin: 10px 0;
}

.star-btn {
  background: none;
  border: 2px solid #ddd;
  font-size: 24px;
  cursor: pointer;
  width: 45px;
  height: 45px;
  border-radius: 4px;
  transition: all 0.2s;
}

.star-btn.active,
.star-btn:hover {
  border-color: #ffc107;
  background: #fff3cd;
}

.comment-input {
  margin-bottom: 20px;
}

textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
}

.char-count {
  text-align: right;
  color: #999;
  font-size: 12px;
  margin: 5px 0 0 0;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn-submit {
  flex: 1;
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.btn-submit:hover:not(:disabled) {
  background: #0056b3;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-cancel {
  padding: 10px 20px;
  background: #e9ecef;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.alert {
  margin-top: 15px;
  padding: 12px;
  border-radius: 4px;
}

.alert-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}
</style>
```

---

## 📋 Integration Steps

### Step 1: Thêm Service
```javascript
// main.js hoặc app.js
import reviewService from './services/reviewService';
Vue.prototype.$reviewService = reviewService;
// Hoặc với Vue 3 Composition API
app.config.globalProperties.$reviewService = reviewService;
```

### Step 2: Sử dụng trong Page Sản Phẩm
```vue
<template>
  <div class="product-page">
    <!-- Thông tin sản phẩm -->
    <div class="product-info">
      <!-- ... -->
    </div>

    <!-- Phần đánh giá -->
    <div class="product-reviews">
      <!-- Form đánh giá (chỉ hiện khi người dùng đã mua) -->
      <ReviewForm 
        v-if="canReview"
        :orderDetailId="orderDetailId"
        @reviewSubmitted="loadReviews"
      />

      <!-- Danh sách đánh giá -->
      <ReviewsList :variantId="variantId" />
    </div>
  </div>
</template>

<script>
import ReviewForm from '@/components/ReviewForm.vue';
import ReviewsList from '@/components/ReviewsList.vue';

export default {
  components: {
    ReviewForm,
    ReviewsList
  },
  data() {
    return {
      variantId: null,
      orderDetailId: null,
      canReview: false
    }
  },
  mounted() {
    this.loadProductData();
  },
  methods: {
    async loadProductData() {
      // Lấy dữ liệu sản phẩm từ route params
      // Kiểm tra xem user đã mua sản phẩm này chưa
    },
    loadReviews() {
      // Reload danh sách đánh giá
    }
  }
}
</script>
```

---

## 🎨 Styling Tips

### Dark Mode Support
```css
@media (prefers-color-scheme: dark) {
  .reviews-section {
    background: #1e1e1e;
    color: #fff;
  }

  .review-item {
    background: #2d2d2d;
    border-color: #444;
  }
}
```

### Responsive Design
```css
@media (max-width: 768px) {
  .rating-distribution {
    display: flex;
    flex-direction: column;
  }

  .review-form {
    max-width: 100%;
  }
}
```

---

## 🔄 State Management (Optional - Vuex)

```javascript
// store/reviewModule.js

export default {
  state: {
    reviews: [],
    stats: null,
    loading: false,
    error: null
  },

  mutations: {
    setReviews(state, reviews) {
      state.reviews = reviews;
    },
    setStats(state, stats) {
      state.stats = stats;
    },
    setLoading(state, loading) {
      state.loading = loading;
    },
    setError(state, error) {
      state.error = error;
    }
  },

  actions: {
    async fetchProductReviews({ commit }, variantId) {
      commit('setLoading', true);
      try {
        const response = await reviewService.getProductReviews(variantId);
        commit('setReviews', response.data.reviews);
        commit('setStats', response.data.stats);
      } catch (err) {
        commit('setError', err.message);
      } finally {
        commit('setLoading', false);
      }
    },

    async submitReview({ commit }, { orderDetailId, rating, comment }) {
      try {
        await reviewService.createReview(orderDetailId, rating, comment);
        // Reload reviews
      } catch (err) {
        commit('setError', err.message);
      }
    }
  }
}
```

---

## 📱 React Version

### React Hook Custom
```javascript
// hooks/useReview.js

import { useState, useCallback } from 'react';

const API_BASE = 'http://localhost:3000';

export const useReview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = useCallback(async (method, endpoint, body = null) => {
    const token = localStorage.getItem('token');
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${API_BASE}/api/reviews${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) throw new Error(data.message);
    return data;
  }, []);

  const createReview = useCallback(async (orderDetailId, rating, comment) => {
    setLoading(true);
    setError(null);
    try {
      return await apiCall('POST', '/create', {
        order_detail_id: orderDetailId,
        rating: Math.round(rating),
        comment: comment.trim()
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const getProductReviews = useCallback(async (variantId, page = 1) => {
    setLoading(true);
    setError(null);
    try {
      return await apiCall('GET', `/product?variant_id=${variantId}&page=${page}&limit=10`, null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  return { loading, error, createReview, getProductReviews };
};
```

---

## ✅ Checklist Integrasi

- [ ] Tạo service class
- [ ] Tạo ReviewsList component
- [ ] Tạo ReviewForm component
- [ ] Thêm vào page sản phẩm
- [ ] Styling hoàn thành
- [ ] Test tất cả functionality
- [ ] Xử lý error cases
- [ ] Loading states
- [ ] Responsive design
- [ ] Token handling

---

**🎉 Frontend Integration Complete!**
