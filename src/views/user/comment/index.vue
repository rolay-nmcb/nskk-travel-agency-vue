<template>
  <div class="review-container">
    <!-- 页面标题 -->
    <div class="page-title">
      <h1>评价订单</h1>
      <p class="order-info">订单号: {{ orderId }}</p>
      <p class="order-info">产品名称: 
        <span v-for="cat in productsList" :key="cat.productId">
           <span v-if="String(cat.productId) === String(productId)">{{ cat.title }}</span>
        </span>
      </p>
    </div>

    <!-- 评分区域 -->
    <div class="rating-section">
      <h2>请为您的体验评分</h2>
      
      <!-- 总体评分 -->
      <div class="rating-item">
        <label>总体评分</label>
        <el-rate
            v-model="review.overallRating"
            :texts= ratingString
            show-text
            clearable
           />
      </div>
      
      <!-- 分项评分 -->
      <div class="rating-grid">
        <div class="rating-item">
          <label>服务评分</label>
          <el-rate
            v-model="review.serviceRating"
            :texts= ratingString
            show-text
            clearable
           />
        </div>
        <div class="rating-item">
          <label>行程安排</label>
          <el-rate
            v-model="review.itineraryRating"
            :texts= ratingString
            show-text
            clearable
           />
        </div>
        <div class="rating-item">
          <label>住宿评分</label>
          <el-rate
            v-model="review.accommodationRating"
            :texts= ratingString
            show-text
            clearable
           />
        </div>
        <div class="rating-item">
          <label>餐饮评分</label>
          <el-rate
            v-model="review.foodRating"
            :texts= ratingString
            show-text
            clearable
           />
        </div>
        <div class="rating-item">
          <label>交通评分</label>
          <el-rate
            v-model="review.transportationRating"
            :texts= ratingString
            show-text
            clearable
           />
        </div>
        <div class="rating-item">
          <label>导游评分</label>
          <el-rate
            v-model="review.guideRating"
            :texts= ratingString
            show-text
            clearable
           />
        </div>
        <div class="rating-item">
          <label>性价比</label>
          <el-rate
            v-model="review.valueForMoneyRating"
            :texts= ratingString
            show-text
            clearable
           />
        </div>
      </div>
    </div>

    <!-- 图片上传 -->
      <div class="image-upload">
        <label>上传图片（可选）</label>
        <image-upload v-model="review.imageUrls" multiple/>
      </div>

    <!-- 评价内容区域 -->
    <div class="review-content">
      <h2>评价内容</h2>
      
      <div class="input-item">
        <label for="title">评价标题</label>
        <input 
          type="text" 
          id="title" 
          v-model="review.title" 
          placeholder="请输入评价标题（如：非常满意的旅行体验）"
          maxlength="50"
        >
      </div>
      
      <div class="input-item">
        <label for="content">评价详情</label>
        <textarea 
          id="content" 
          v-model="review.content" 
          placeholder="请分享您的详细体验...（如行程亮点、服务感受等）"
          rows="6"
          maxlength="500"
        ></textarea>
        <p class="word-count">{{ review.content.length }}/500</p>
      </div>
      
      
      <!-- 匿名选项 -->
      <div class="anonymous-option">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            v-model="review.isAnonymous" 
            true-value="1" 
            false-value="0"
          >
          <span>匿名评价</span>
        </label>
        <p class="hint-text">匿名评价将不会显示您的用户名</p>
      </div>
    </div>

    <!-- 提交按钮 -->
    <div class="submit-section">
      <button 
        class="submit-btn" 
        @click="submitReview"
        :disabled="!isSubmitable"
      >
        提交评价
      </button>
      <button class="cancel-btn" @click="cancelReview">取消</button>
    </div>
  </div>
</template>

<script setup name="commnet">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCurrentInstance } from 'vue';
import {listProducts} from '@/api/manage/products';
import {addReviewsUser,getReviewsUser,updateReviewsUser} from '@/api/user/reviewsUser';
import { status } from 'nprogress';

const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();

// 路由参数
const productId = ref(null);
const userId = ref(null);
const orderId = ref(null);

//基础数据
const productsList = ref([]);
const ratingString = ref(['😡生气', '😞失望', '😐一般', '😊不错', '🥰满意'])


//获取产品列表
function getProductsList() {
  listProducts({
    pageNum: 1,
    pageSize: 10000
  }).then(response => {
    productsList.value = response.rows;
  });
}

// 评价数据
const review = ref({
  userId: null,
  reviewId: null,
  productId: null,
  orderId: null,
  status: null,
  title: '',
  content: '',
  overallRating: null,
  serviceRating: null,
  itineraryRating: null,
  accommodationRating: null,
  foodRating: null,
  transportationRating: null,
  guideRating: null,
  valueForMoneyRating: null,
  imageUrls: '',
  isAnonymous: 0
});


// 页面初始化
onMounted(() => {
getProductsList();
  if (route.query.productId) {
    productId.value = route.query.productId;
    review.value.productId = productId.value;
  }
  
  if (route.query.userId) {
    userId.value = route.query.userId;
    review.value.userId = userId.value;
  }

  if (route.query.orderId) {
    orderId.value = route.query.orderId;
    review.value.orderId = orderId.value;
  }
  // 如果是编辑已有的游记，获取游记详情
  if (route.query.reviewId) {
    fetchReviewDetail(route.query.reviewId);
  }
});

// 监听路由变化
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.productId && newQuery.productId !== productId.value) {
      productId.value = newQuery.productId;
      review.value.productId = productId.value;
    }
    
    if (newQuery.userId && newQuery.userId !== userId.value) {
      userId.value = newQuery.userId;
      review.value.userId = userId.value;
    }

    if (newQuery.orderId && newQuery.orderId !== orderId.value) {
      orderId.value = newQuery.orderId;
      review.value.orderId = orderId.value;
    }
  }
);


//如果是编辑已存在的游记，获取游记详情
function fetchReviewDetail(reviewId) {
  getReviewsUser(reviewId).then(response => {
    review.value = response.data;
  });
}


// 检查是否可以提交
const isSubmitable = computed(() => {
  return (
    review.value.overallRating !== null &&
    review.value.title.trim() !== '' &&
    review.value.content.trim() !== ''
  );
});

// 提交评价
const submitReview = async () => {
  try {
      const messageU = ref('评价成功');
      if(review.value.status !== null)
      {
        if(review.value.status !== 1)
        {
          review.value.status = 0;
          messageU.value='评价已提交，请耐心等待审核'
        }
      }
      if(review.value.reviewId){
        updateReviewsUser(review.value).then(response => {
      if (response.code === 200) {
        proxy.$message.success(messageU.value);
        router.back();
      } else {
        proxy.$message.error('修改评价失败：' + (response.msg || '未知错误'));
      }
    }).catch(error => {
      proxy.$message.error('评价出错：' + error.message);
    })
    }else{ 
    addReviewsUser(review.value).then(response => {
    if (response.code === 200) {
      proxy.$message.success(messageU.value);
      router.back();
    } else {
      proxy.$message.error('评价失败：' + (response.msg || '未知错误'));
    }
  }).catch(error => {
    proxy.$message.error('评价出错：' + error.message);
  });
    }
  } catch (error) {
    proxy.$message.error('评价提交失败，请稍后重试');
    console.error('提交评价错误:', error);
  }
};

// 取消评价
const cancelReview = () => {
  if (confirm('确定要取消评价吗？已填写的内容将不会保存。')) {
    router.back();
  }
};
</script>

<style scoped>
.review-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.page-title {
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.page-title h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.order-info {
  color: #666;
  margin: 5px 0 0;
}

.rating-section, .review-content {
  margin-bottom: 30px;
}

h2 {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

h2::before {
  content: "";
  display: inline-block;
  width: 4px;
  height: 18px;
  background-color: #42b983;
  margin-right: 8px;
  border-radius: 2px;
}

.rating-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-top: 20px;
}

.rating-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.rating-item label {
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

.input-item {
  margin-bottom: 20px;
}

.input-item label {
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

.input-item input,
.input-item textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.input-item input:focus,
.input-item textarea:focus {
  border-color: #42b983;
  outline: none;
}

.input-item textarea {
  resize: vertical;
}

.word-count {
  text-align: right;
  margin: 5px 0 0;
  color: #999;
  font-size: 12px;
}

.image-upload {
  margin-bottom: 20px;
}

.upload-area {
  border: 1px dashed #ddd;
  border-radius: 6px;
  padding: 20px;
  transition: border-color 0.3s;
}

.upload-area:hover {
  border-color: #42b983;
}

.file-input {
  display: none;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border: 1px dashed #ccc;
  border-radius: 6px;
  cursor: pointer;
  color: #666;
  transition: all 0.3s;
  flex-direction: column;
}

.upload-btn:hover {
  border-color: #42b983;
  color: #42b983;
}

.icon-plus {
  font-size: 24px;
  margin-bottom: 5px;
}

.preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.preview-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-img {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(255, 0, 0, 0.8);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  padding: 0;
}

.upload-hint {
  margin-top: 10px;
  color: #999;
  font-size: 12px;
}

.anonymous-option {
  margin: 20px 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #333;
}

.checkbox-label input {
  margin-right: 8px;
}

.hint-text {
  margin: 5px 0 0 22px;
  color: #999;
  font-size: 12px;
}

.submit-section {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
}

.submit-btn, .cancel-btn {
  padding: 12px 30px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn {
  background-color: #42b983;
  color: white;
  border: none;
}

.submit-btn:disabled {
  background-color: #a0d9b7;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: white;
  color: #666;
  border: 1px solid #ddd;
}

.cancel-btn:hover {
  background-color: #f5f5f5;
}

/* 星级评分样式 */
.star-rating {
  display: flex;
  gap: 5px;
}

.star {
  font-size: 24px;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s;
}

.star.active {
  color: #ffce31;
}

.star:hover {
  color: #ffce31;
}
</style>