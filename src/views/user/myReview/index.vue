<template>
  <div class="review-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>我的评价</h1>
    </div>

    <!-- 状态筛选器 -->
    <div class="status-filter">
      <button 
        v-for="(item, index) in statusOptions" 
        :key="index"
        @click="handleStatusChange(index)"
        :class="{ active: activeStatus === (index-1) }"
      >
        {{ item.label }}
      </button>
    </div>

    <!-- 评价列表 -->
    <div class="reviews-container">
      <div v-if="filteredReviews.length === 0" class="empty-state">
        <img src="https://picsum.photos/id/20/100/100" alt="暂无评价" class="empty-img">
        <p>暂无符合条件的评价</p>
      </div>
      
      <div v-else class="reviews-list">
        <div class="review-card" v-for="review in filteredReviews" :key="review.reviewId">
          <!-- 评价头部信息 -->
          <div class="review-header">
            <div class="review-status" :class="getStatusClass(review.status)">
              {{ getStatusText(review.status) }}
            </div>
            <div class="review-date">
              {{ formatDate(review.createdAt) }}
            </div>
          </div>

          <!-- 评价标题和总体评分 -->
          <div class="review-title">
            <h3>{{ review.title }}</h3>
            <div class="rating stars-{{ review.overallRating }}">
              <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= review.overallRating }">★</span>
              <span class="rating-text">{{ review.overallRating }}分</span>
            </div>
          </div>

          <!-- 评价内容摘要 -->
          <div class="review-content">
            <p>{{ review.content.length > 100 ? review.content.substring(0, 100) + '...' : review.content }}</p>
          </div>

          <!-- 评价图片缩略图 -->
          <div v-if="review.imageUrls" class="review-images">
            <div class="image-preview" v-for="(img, idx) in review.imageUrls.split(',')" :key="idx">
              <img :src="img" :alt="'评价图片' + (idx + 1)">
            </div>
          </div>

          <!-- 互动信息 -->
          <div class="review-actions">
            <span class="like-count">
              <i class="icon-like"></i> 有用 {{ review.likeCount }}
            </span>
            <button class="view-detail" @click="openDetail(review)">查看详情</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div class="modal-backdrop" v-if="showDetail" @click="closeDetail()">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>评价详情</h2>
          <button class="close-btn" @click="closeDetail()">×</button>
        </div>
        
        <div class="modal-body" v-if="currentReview">
          <!-- 基本信息 -->
          <div class="detail-section">
            <h3>{{ currentReview.title }}</h3>
            <div class="rating stars-{{ currentReview.overallRating }}">
              <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= currentReview.overallRating }">★</span>
              <span class="rating-text">{{ currentReview.overallRating }}分 (总体评分)</span>
            </div>
            <p class="detail-date">{{ formatDate(currentReview.createdAt) }} 
              <span v-if="currentReview.isAnonymous === 1" class="anonymous-tag">匿名评价</span>
            </p>
          </div>

          <!-- 分项评分 -->
          <div class="detail-section scores-section">
            <h4>分项评分</h4>
            <div class="score-item">
              <span>服务评分：</span>
              <div class="rating inline-stars stars-{{ currentReview.serviceRating }}">
                <span v-for="i in 5" :key="'s' + i" class="star" :class="{ filled: i <= currentReview.serviceRating }">★</span>
              </div>
            </div>
            <div class="score-item">
              <span>行程安排：</span>
              <div class="rating inline-stars stars-{{ currentReview.itineraryRating }}">
                <span v-for="i in 5" :key="'i' + i" class="star" :class="{ filled: i <= currentReview.itineraryRating }">★</span>
              </div>
            </div>
            <div class="score-item">
              <span>住宿评分：</span>
              <div class="rating inline-stars stars-{{ currentReview.accommodationRating }}">
                <span v-for="i in 5" :key="'a' + i" class="star" :class="{ filled: i <= currentReview.accommodationRating }">★</span>
              </div>
            </div>
            <div class="score-item">
              <span>餐饮评分：</span>
              <div class="rating inline-stars stars-{{ currentReview.foodRating }}">
                <span v-for="i in 5" :key="'f' + i" class="star" :class="{ filled: i <= currentReview.foodRating }">★</span>
              </div>
            </div>
            <div class="score-item">
              <span>交通评分：</span>
              <div class="rating inline-stars stars-{{ currentReview.transportationRating }}">
                <span v-for="i in 5" :key="'t' + i" class="star" :class="{ filled: i <= currentReview.transportationRating }">★</span>
              </div>
            </div>
            <div class="score-item">
              <span>导游评分：</span>
              <div class="rating inline-stars stars-{{ currentReview.guideRating }}">
                <span v-for="i in 5" :key="'g' + i" class="star" :class="{ filled: i <= currentReview.guideRating }">★</span>
              </div>
            </div>
            <div class="score-item">
              <span>性价比：</span>
              <div class="rating inline-stars stars-{{ currentReview.valueForMoneyRating }}">
                <span v-for="i in 5" :key="'v' + i" class="star" :class="{ filled: i <= currentReview.valueForMoneyRating }">★</span>
              </div>
            </div>
          </div>

          <!-- 评价内容 -->
          <div class="detail-section">
            <h4>评价内容</h4>
            <p class="full-content">{{ currentReview.content }}</p>
          </div>

          <!-- 评价图片 -->
          <div v-if="currentReview.imageUrls" class="detail-section images-section">
            <h4>评价图片</h4>
            <div class="image-grid">
              <img 
                v-for="(img, idx) in currentReview.imageUrls.split(',')" 
                :key="'img' + idx" 
                :src="img" 
                :alt="'评价图片' + (idx + 1)"
                class="detail-image"
              >
            </div>
          </div>

          <!-- 商家回复 -->
          <div v-if="currentReview.replyContent" class="detail-section reply-section">
            <h4>商家回复</h4>
            <div class="reply-content">
              <p>{{ currentReview.replyContent }}</p>
              <p class="reply-time">{{ formatDate(currentReview.repliedAt) }}</p>
            </div>
          </div>

          <!-- 订单信息 -->
          <div class="detail-section order-info">
            <p>订单编号：{{ currentReview.orderId }}</p>
            <p>产品ID: 
                <span v-for="cat in productsList" :key="cat.productId">
                  <span v-if="cat.productId === currentReview.productId">{{ cat.title }}</span>
                </span>
            </p>
          </div>
        </div>
        
        <div class="modal-footer">
          <template v-if="currentReview">
            <template v-if="currentReview.status === 3">
              <!-- 已删除评价 -->
              <button class="btn primary" @click="handleEdit">重新发布</button>
            </template>
            <template v-else>
              <!-- 正常评价 -->
              <button class="btn secondary" @click="handleDelete(currentReview)">删除评论</button>
              <button class="btn primary" @click="handleEdit">重新编辑</button>
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="myReview">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { listReviewsUser, getReviewsUser,updateReviewsUser} from '@/api/user/reviewsUser';
import {listProducts} from '@/api/manage/products';
import { getCurrentInstance } from 'vue';
import useUserStore from '@/store/modules/user';
import { get } from '@vueuse/core/index.cjs';

const { proxy } = getCurrentInstance();
const router = useRouter();
const userStore = useUserStore();
const userId = userStore.id;
const reviewsList = ref([]);

// 状态筛选相关
const statusOptions = [
  { label: '全部评价', value: -1 },
  { label: '待审核', value: 0 },
  { label: '审核通过', value: 1 },
  { label: '审核驳回', value: 2 },
  { label: '已删除', value: 3 }
];
const activeStatus = ref(-1);

// 详情弹窗相关
const showDetail = ref(false);
const currentReview = ref(null);

// 获取我的评价列表
function getReviewsList() {
  listReviewsUser({
    userId: userId,
    pageNum: 1,
    pageSize: 10000,
  }).then(res => {
    reviewsList.value = res.rows;
  });
}

// 筛选评价
const filteredReviews = computed(() => {
  if (activeStatus.value === -1) {
    return reviewsList.value;
  }
  return reviewsList.value.filter(review => review.status === activeStatus.value);
});

// 处理状态切换
function handleStatusChange(index) {
  activeStatus.value = statusOptions[index].value;
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    0: '待审核',
    1: '审核通过',
    2: '审核驳回',
    3: '已删除'
  };
  return statusMap[status] || '未知状态';
}

// 获取状态样式类
function getStatusClass(status) {
  const classMap = {
    0: 'status-pending',
    1: 'status-approved',
    2: 'status-rejected',
    3: 'status-deleted'
  };
  return classMap[status] || 'status-default';
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 打开详情
function openDetail(review) {
  getReviewsUser(review.reviewId).then(res => {
    currentReview.value = res.data;
    showDetail.value = true;
    // 阻止页面滚动
    document.body.style.overflow = 'hidden';
  });
}

// 关闭详情
function closeDetail() {
  showDetail.value = false;
  currentReview.value = null;
  // 恢复页面滚动
  document.body.style.overflow = '';
}

// 编辑评价
function handleEdit() {
  // 这里应该跳转到编辑页面，携带reviewId参数
  router.push({
    path: '/comment',
    query: { reviewId: currentReview.value.reviewId , productId: currentReview.value.productId , userId: userId , orderId: currentReview.value.orderId }
  });
  closeDetail();
}

// 删除评价
function handleDelete(currentReview) {
  if (confirm('确定要删除这条评价吗？')) {
    // 调用修改API的逻辑
    currentReview.status = 3;
    updateReviewsUser(currentReview).then(res => {
      if(res.code === 200)
      {
      proxy.$message.success('评价已删除');
      closeDetail();
      // 重新获取列表
      getReviewsList();
      }else
      {
        proxy.$message.error('删除失败');
      }
    });
  }
}

//查询所有产品列表
const productsList = ref([]);
function getProductsList() {
  listProducts({
    pageNum: 1,
    pageSize: 10000
  }).then(res => {
    productsList.value = res.rows;
  });
}

// 页面初始化
onMounted(() => {
  getReviewsList();
  getProductsList();
});
</script>

<style scoped>
.review-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.page-header {
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.page-header h1 {
  font-size: 24px;
  color: #2c3e50;
  margin: 0;
}

.status-filter {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.status-filter button {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background-color: #f5f5f5;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.status-filter button.active {
  background-color: #3498db;
  color: white;
}

.status-filter button:hover:not(.active) {
  background-color: #e0e0e0;
}

.reviews-container {
  margin-top: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background-color: #fafafa;
  border-radius: 10px;
}

.empty-img {
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-state p {
  color: #999;
  font-size: 16px;
}

.reviews-list {
  display: grid;
  gap: 20px;
}

.review-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.review-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  align-items: center;
}

.review-status {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-approved {
  background-color: #d4edda;
  color: #155724;
}

.status-rejected {
  background-color: #f8d7da;
  color: #721c24;
}

.status-deleted {
  background-color: #e2e3e5;
  color: #383d41;
}

.review-date {
  color: #999;
  font-size: 12px;
}

.review-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.review-title h3 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
  flex: 1;
}

.rating {
  display: flex;
  align-items: center;
}

.star {
  color: #ddd;
  font-size: 16px;
  margin-right: 2px;
}

.star.filled {
  color: #f39c12;
}

.rating-text {
  margin-left: 8px;
  color: #666;
  font-size: 14px;
}

.review-content {
  margin-bottom: 15px;
  line-height: 1.6;
  color: #555;
}

.review-images {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.image-preview {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-preview img:hover {
  transform: scale(1.05);
}

.review-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.like-count {
  color: #999;
  font-size: 14px;
}

.icon-like {
  color: #e74c3c;
  margin-right: 5px;
}

.view-detail {
  color: #3498db;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.view-detail:hover {
  background-color: #f0f7ff;
}

/* 弹窗样式 */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background-color: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.detail-section {
  margin-bottom: 25px;
}

.detail-section h4 {
  margin-bottom: 12px;
  color: #34495e;
  font-size: 16px;
  padding-bottom: 5px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-date {
  color: #999;
  font-size: 14px;
  margin: 5px 0 15px;
}

.anonymous-tag {
  margin-left: 10px;
  padding: 2px 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
  color: #777;
}

.scores-section {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
}

.score-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.score-item span {
  width: 100px;
  color: #666;
  font-size: 14px;
}

.inline-stars {
  flex: 1;
}

.full-content {
  line-height: 1.8;
  color: #555;
  white-space: pre-line;
}

.images-section .image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.detail-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 6px;
  transition: transform 0.3s ease;
  cursor: pointer;
}

.detail-image:hover {
  transform: scale(1.03);
}

.reply-section {
  background-color: #f0f7ff;
  padding: 15px;
  border-radius: 8px;
}

.reply-content {
  background-color: white;
  padding: 15px;
  border-radius: 6px;
  border-left: 3px solid #3498db;
}

.reply-time {
  margin-top: 10px;
  text-align: right;
  color: #999;
  font-size: 12px;
}

.order-info {
  font-size: 14px;
  color: #777;
  padding-top: 10px;
  border-top: 1px dashed #eee;
}

.order-info p {
  margin: 5px 0;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  border: none;
}

.btn.primary {
  background-color: #3498db;
  color: white;
}

.btn.primary:hover {
  background-color: #2980b9;
}

.btn.secondary {
  background-color: #f5f5f5;
  color: #666;
}

.btn.secondary:hover {
  background-color: #e0e0e0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .review-page {
    padding: 15px;
  }
  
  .review-title {
    flex-direction: column;
  }
  
  .rating {
    margin-top: 10px;
    align-self: flex-start;
  }
  
  .images-section .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .detail-image {
    height: 120px;
  }
}
</style>