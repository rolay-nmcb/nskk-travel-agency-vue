<template>
  <div class="travel-products-page">
    <!-- 页面头部横幅 -->
    <div class="page-banner">
      <div class="banner-content">
        <h1>发现您的完美旅程</h1>
        <p>精选目的地 · 优质服务 · 无忧出行</p>
      </div>
    </div>

    <!-- 搜索筛选区 -->
    <div class="filter-section">
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="80px">
        <el-form-item label="产品名称">
          <el-input
            v-model="queryParams.title"
            placeholder="搜索目的地或产品名称"
            clearable
            @keyup.enter="handleQuery"
            class="search-input"
          />
        </el-form-item>
        <el-form-item label="行程天数">
          <el-select v-model="queryParams.durationDays" placeholder="选择天数" clearable>
            <el-option :value="3" label="3天以内" />
            <el-option :value="5" label="3-5天" />
            <el-option :value="7" label="5-7天" />
            <el-option :value="10" label="7-10天" />
            <el-option :value="99" label="10天以上" />
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="选择状态" clearable>
            <el-option
              v-for="dict in product_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item> -->
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 产品列表区 -->
    <div class="products-section">
      <div class="section-header">
        <h2>推荐产品</h2>
        <div class="sort-controls">
          <span>排序方式：</span>
          <el-radio-group v-model="sortType" @change="handleSortChange">
            <el-radio-button label="default">默认</el-radio-button>
            <el-radio-button label="days">天数</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div v-loading="loading" class="products-grid">
        <!-- 产品卡片 -->
        <div 
          v-for="product in userProductsList" 
          :key="product.productId" 
          class="product-card"
        >
          <div class="product-image">
            <el-image 
              :src="product.coverImage || defaultCover" 
              :preview-src-list="product.coverImage ? [product.coverImage] : []"
              fit="cover"
            >
              <template #error>
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                  <span>暂无图片</span>
                </div>
              </template>
            </el-image>
            <div class="product-tag" v-if="product.status === 1">
              <span>可预订</span>
            </div>
          </div>
          
          <div class="product-info">
            <div class="product-title">
              <h3>{{ product.title }}</h3>
              <div class="travel-days">
                <el-icon><Calendar /></el-icon>
                <span>{{ product.durationDays }}天{{ product.durationNights }}晚</span>
              </div>
            </div>
            
            <p class="product-subtitle">{{ product.subtitle }}</p>
            
            <div class="product-meta">
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>成团人数: {{ product.minTravelers }}-{{ product.maxTravelers }}人</span>
              </div>
              <div class="meta-item">
                <el-icon><Location /></el-icon>
                <span>目的地:
                  <span v-for="dest in destinationList" :key="dest.destinationId">
                    <span v-if="dest.destinationId === product.destinationId">{{ dest.name }}</span>
                  </span>
                </span>
              </div>
            </div>
            
            <div class="product-actions">
              <el-button 
                type="primary" 
                @click="viewDetails(product)"
                class="detail-btn"
              >
                查看详情
              </el-button>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="userProductsList.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无产品数据" />
        </div>
      </div>
      
      <!-- 分页 -->
      <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </div>

    <!-- 产品详情弹窗 -->
    <el-dialog 
      :title="detailTitle" 
      v-model="detailOpen" 
      width="1000px" 
      append-to-body
      :before-close="handleCloseDetail"
    >
      <div v-if="currentProduct" class="detail-container">
        <!-- 详情头部图片 -->
        <div class="detail-header">
          <el-image 
            :src="currentProduct.coverImage || defaultCover" 
            fit="cover"
          >
            <template #error>
              <div class="detail-image-placeholder">暂无封面图</div>
            </template>
          </el-image>
        </div>
        
        <!-- 详情内容 -->
        <div class="detail-content">
          <el-tabs v-model="activeTab" class="detail-tabs">
             <el-tab-pane label="产品相册" name="images">
              <div class="images-section">
                <!-- 修改图片展示部分为走马灯 -->
                <el-carousel 
                  v-if="imageList.length > 0" 
                  height="400px" 
                  indicator-position="outside"
                  arrow="always"
                >
                  <el-carousel-item v-for="(image, index) in imageList" :key="index">
                    <el-image
                      :src="image"
                      class="carousel-image"
                      fit="contain"
                      :preview-src-list="imageList"
                      :preview-teleported="true"
                    />
                  </el-carousel-item>
                </el-carousel>
                <div v-else class="no-images">暂无图片</div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="产品介绍" name="introduction">
              <div class="intro-section">
                <h3 class="section-title">基本信息</h3>
                <div class="basic-info">
                  <div class="info-row">
                    <div class="info-item">
                      <span class="info-label">产品ID：</span>
                      <span>{{ currentProduct.productId }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">分类：</span>
                       <span v-for="PC in productCategoriesList" :key="PC.categoryId">
                        <span v-if="PC.categoryId ===currentProduct.categoryId">{{ PC.name }}</span>
                      </span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">目的地：</span>
                      <span v-for="dest in destinationList" :key="dest.destinationId">
                        <span v-if="dest.destinationId ===currentProduct.destinationId">{{ dest.name }}</span>
                      </span>
                    </div>
                  </div>
                  <div class="info-row">
                    <div class="info-item">
                      <span class="info-label">行程天数：</span>
                      <span>{{ currentProduct.durationDays }}天{{ currentProduct.durationNights }}晚</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">成团人数：</span>
                      <span>{{ currentProduct.minTravelers }}-{{ currentProduct.maxTravelers }}人</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">状态：</span>
                      <dict-tag :options="product_status" :value="currentProduct.status"/>
                    </div>
                  </div>
                </div>
                
                <h3 class="section-title">产品概述</h3>
                <div class="overview-content">
                  {{ currentProduct.overview || '暂无概述信息' }}
                </div>
                
                <h3 class="section-title">行程安排</h3>
                <div class="itinerary-content">
                  {{ currentProduct.itinerary || '暂无行程安排信息' }}
                </div>
                
                <h3 class="section-title">费用说明</h3>
                <div class="cost-section">
                  <div class="cost-item">
                    <h4>费用包含</h4>
                    <p>{{ currentProduct.inclusions || '暂无包含信息' }}</p>
                  </div>
                  <div class="cost-item">
                    <h4>费用不含</h4>
                    <p>{{ currentProduct.exclusions || '暂无不含信息' }}</p>
                  </div>
                </div>
                
                <h3 class="section-title">预订须知</h3>
                <div class="notes-content">
                  {{ currentProduct.notes || '暂无预订须知' }}
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="用户评价" name="reviews">
              <div class="reviews-section">
                <div class="reviews-header">
                  <h3>用户真实评价</h3>
                  <div v-if="reviewsLoading" class="reviews-loading">
                    <el-skeleton active :rows="3" />
                  </div>
                </div>
                
                <div v-if="!reviewsLoading">
                  <!-- 评价统计 -->
                  <div class="reviews-stats" v-if="reviewsList.length > 0">
                    <div class="overall-rating">
                      <div class="rating-value">{{ avgOverallRating.toFixed(1) }}</div>
                      <div class="stars">
                        <el-rate 
                          v-model="avgOverallRating" 
                          disabled 
                          allow-half 
                        />
                      </div>
                      <div class="rating-count">{{ reviewsList.length }} 条评价</div>
                    </div>
                    
                    <div class="rating-details">
                      <div class="rating-item" v-for="item in ratingTypes" :key="item.key">
                        <span class="rating-label">{{ item.label }}</span>
                        <el-progress 
                          :percentage="getAvgRating(item.key)" 
                          :stroke-width="8"
                          :show-text="false"
                        />
                        <span class="rating-score">{{ getAvgRating(item.key).toFixed(1) }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 评价列表 -->
                  <div class="reviews-list">
                    <div 
                      v-for="review in reviewsList" 
                      :key="review.reviewId" 
                      class="review-item"
                    >
                      <div class="review-header">
                        <div class="review-user">
                          <el-avatar :icon="User" />
                          <span class="user-name">
                            {{ review.isAnonymous ? '匿名用户' : `用户${review.userId}` }}
                          </span>
                        </div>
                        <div class="review-date">{{ review.createdAt }}</div>
                      </div>
                      
                      <div class="review-rating">
                        <el-rate 
                          v-model="review.overallRating" 
                          disabled 
                          allow-half
                        />
                        <span class="review-title">{{ review.title }}</span>
                      </div>
                      
                      <div class="review-content">{{ review.content }}</div>
                      
                      <div class="review-images" v-if="review.imageUrls">
                        <el-image
                          v-for="(img, idx) in review.imageUrls.split(',')"
                          :key="idx"
                          :src="img"
                          :preview-src-list="review.imageUrls.split(',')"
                          class="review-img"
                          fit="cover"
                        />
                      </div>
                      
                      <div class="review-like" v-if="review.likeCount >= 0">
                        <el-button 
                          :type="review.isLiked ? 'warning' : 'default'" 
                          @click="toggleLike(review)"
                          size="small"
                        >
                          <el-icon><Star /></el-icon>
                          {{ review.isLiked ? '已点赞' : '点赞' }}
                          <span v-if="review.likeCount > 0">({{ review.likeCount }})</span>
                        </el-button>
                      </div>
                      
                      <div class="review-reply" v-if="review.replyContent">
                        <div class="reply-label">商家回复：</div>
                        <div class="reply-content">{{ review.replyContent }}</div>
                        <div class="reply-time">{{ review.repliedAt }}</div>
                      </div>
                    </div>
                    
                    <!-- 无评价状态 -->
                    <div v-if="reviewsList.length === 0" class="no-reviews">
                      <el-empty description="暂无评价" />
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button 
            type="primary" 
            size="large"
            @click="handlePurchase(currentProduct.productId)"
            :disabled="currentProduct?.status !== 1"
          >
            我要购买
          </el-button>
          <el-button 
            size="large"
            @click="activeTab = 'reviews'"
          >
            查看评价
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="UserProducts">
import { ref, reactive, toRefs, onMounted } from 'vue';
import { getCurrentInstance } from 'vue';
import { 
  Calendar, 
  Location, 
  User, 
  Picture, 
} from '@element-plus/icons-vue';

import { listUserProducts, getUserProducts } from "@/api/user/userProducts";
import { listReviewsUser,updateReviewsUserLike} from "@/api/user/reviewsUser";
import { listProductCategories, getProductCategories } from "@/api/manage/productCategories";
import {listDestinations} from "@/api/manage/destinations";
import { useRoute } from 'vue-router'
import useUserStore from '@/store/modules/user';

const userStore = useUserStore()
const userId = userStore.id

// 常量定义
const defaultCover = '/src/assets/images/introduction/1.jpg'; // 默认封面图

// 评分类型定义
const ratingTypes = [
  { key: 'overallRating', label: '综合评分' },
  { key: 'serviceRating', label: '服务评分' },
  { key: 'itineraryRating', label: '行程评分' },
  { key: 'accommodationRating', label: '住宿评分' },
  { key: 'foodRating', label: '餐饮评分' },
  { key: 'transportationRating', label: '交通评分' },
  { key: 'guideRating', label: '导游评分' },
  { key: 'valueForMoneyRating', label: '性价比评分' }
];

// 组件实例与字典
const { proxy } = getCurrentInstance();
const { product_status } = proxy.useDict('product_status');

// 响应式数据
const userProductsList = ref([]);
const reviewsList = ref([]);
const currentProduct = ref(null);
const avgOverallRating = ref(0);

// 状态管理
const loading = ref(true);
const reviewsLoading = ref(false);
const detailOpen = ref(false);
const detailTitle = ref("");
const activeTab = ref("introduction");
const sortType = ref("default");

// 查询参数
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 12,
    title: null,
    categoryId: null,
    destinationId: null,
    durationDays: null,
    status: null
  }
});
const { queryParams } = toRefs(data);
const total = ref(0);

/** 获取产品列表 */
function getList() {
  loading.value = true;
  listUserProducts(queryParams.value).then(response => {
    userProductsList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  }).catch(() => {
    loading.value = false;
  });
}

/** 搜索处理 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置搜索 */
function resetQuery() {
  proxy.resetForm("queryRef");
  queryParams.value={
    pageNum:1,
    pageSize: 12,
    title: null,
    categoryId: null,
    destinationId: null,
    durationDays: null,
    status: null
  }
  handleQuery();
}

// 处理图片列表
const imageList = computed(() => {
  if (currentProduct.value && currentProduct.value.images) {
    return currentProduct.value.images.split(',').filter(img => img.trim() !== '');
  }
  return [];
});

/** 排序处理 */
function handleSortChange() {
  // 这里可以根据需要实现不同的排序逻辑
  if (sortType.value === 'days') {
    // 按行程天数升序排序
    userProductsList.value.sort((a, b) => a.durationDays - b.durationDays);
  } else {
    // 默认排序，按产品ID降序（模拟最新发布的在前）
    userProductsList.value.sort((a, b) => b.productId - a.productId);
  }
}

/** 查看产品详情 */
function viewDetails(product) {
  getUserProducts(product.productId).then(response => {
    currentProduct.value = response.data;
    detailTitle.value = response.data.title;
    detailOpen.value = true;
    activeTab.value = "introduction";
    
    // 获取该产品的评价
    getProductReviews(product.productId);
  });
}

/** 获取产品评价 */
function getProductReviews(productId) {
  reviewsLoading.value = true;
  listReviewsUser({
    pageNum: 1,
    pageSize: 10000,
    productId: productId,
    searchUserId: userId,
    status: 1
  }).then(response => {
    reviewsList.value = response.rows || [];
    calculateAvgRatings();
    reviewsLoading.value = false;
  }).catch(() => {
    reviewsLoading.value = false;
  });
}

/** 计算平均评分 */
function calculateAvgRatings() {
  if (reviewsList.value.length === 0) {
    avgOverallRating.value = 0;
    return;
  }
  
  // 计算综合评分平均值
  const totalOverall = reviewsList.value.reduce((sum, item) => {
    return sum + (item.overallRating || 0);
  }, 0);
  avgOverallRating.value = totalOverall / reviewsList.value.length;

  console.log(avgOverallRating.value)
}

/** 获取特定类型的平均评分 */
function getAvgRating(type) {
  if (reviewsList.value.length === 0) return 0;
  
  const total = reviewsList.value.reduce((sum, item) => {
    return sum + (item[type] || 0);
  }, 0);
  
  return (total / reviewsList.value.length) * 20; // 转为百分比
}

/** 处理购买按钮 */
function handlePurchase(_productId) {
  if (currentProduct.value?.status !== 1) {
    proxy.$modal.msgWarning("该产品目前不可预订");
    return;
  }
  proxy.$router.push({ path: '/purchase', query: { userId: userId , productId: _productId } });
}
/** 关闭详情弹窗 */
function handleCloseDetail() {
  currentProduct.value = null;
  reviewsList.value = [];
  detailOpen.value = false;
}

//处理点赞与取消点赞
function toggleLike(review)
{
   const likeData = {
    reviewId: review.reviewId,
    userId: userId,
    isLiked: review.isLiked ? 0 : 1 ,
    likeCount: review.likeCount
  };
  // 调用点赞接口
  updateReviewsUserLike(likeData).then(response => {
    if (response.code === 200) {
      // 更新本地状态
      review.isLiked = review.isLiked ? 0 : 1;
      // 更新点赞数
      if (review.isLiked) {
        review.likeCount++;
      } else {
        review.likeCount--;
      }
      proxy.$modal.msgSuccess(review.isLiked ? '点赞成功' : '取消点赞成功');
    } else {
      proxy.$modal.msgError('操作失败');
    }
  }).catch(error => {
    console.error('点赞操作出错:', error);
    proxy.$modal.msgError('操作失败');
  });
}

//获取产品分类以及目的地列表
const productCategoriesList = ref([])
const destinationList = ref([])

function getProductCategoriesList(){
  listProductCategories({
    pageNum: 1,
    pageSize: 10000
  }).then(response => {
      productCategoriesList.value = response.rows;
    });
}

function getDestinationsList() {
  listDestinations({
    pageNum:1,
    pageSize:10000
  }).then(response => {
    destinationList.value = response.data;
  });
}


/** 页面加载时获取数据 */
onMounted(() => {
  getList();
  getProductCategoriesList();
  getDestinationsList();
});
</script>

<style lang="scss" scoped>
.travel-products-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

// 头部横幅
.page-banner {
  width: 100%;
  height: 280px;
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), 
              url('/src/assets/images/introduction/1.jpg') center/cover no-repeat;
  border-radius: 8px;
  margin: 20px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .banner-content {
    text-align: center;
    color: white;
    
    h1 {
      font-size: 42px;
      margin-bottom: 15px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    
    p {
      font-size: 18px;
      opacity: 0.9;
    }
  }
}

// 筛选区
.filter-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 30px;
  
  .search-input {
    width: 300px;
  }
}

// 产品列表区
.products-section {
  margin-bottom: 40px;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      font-size: 24px;
      color: #333;
      font-weight: 600;
    }
    
    .sort-controls {
      display: flex;
      align-items: center;
      
      span {
        margin-right: 10px;
        color: #666;
      }
    }
  }
  
  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
    margin-bottom: 30px;
  }
  
  .product-card {
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }
    
    .product-image {
      position: relative;
      height: 200px;
      
      .el-image {
        width: 100%;
        height: 100%;
      }
      
      .image-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: #f5f7fa;
        color: #999;
        
        .el-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }
      }
      
      .product-tag {
        position: absolute;
        top: 12px;
        left: 12px;
        
        span {
          background-color: #409eff;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
      }
    }
    
    .product-info {
      padding: 18px;
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .product-title {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 10px;
        
        h3 {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .travel-days {
          display: flex;
          align-items: center;
          font-size: 13px;
          color: #666;
          background-color: #f5f7fa;
          padding: 2px 8px;
          border-radius: 4px;
          
          .el-icon {
            margin-right: 4px;
            font-size: 14px;
          }
        }
      }
      
      .product-subtitle {
        color: #666;
        font-size: 14px;
        margin: 0 0 15px 0;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .product-meta {
        margin-bottom: 20px;
        flex: 1;
        
        .meta-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          font-size: 13px;
          color: #666;
          
          .el-icon {
            margin-right: 6px;
            color: #409eff;
            font-size: 15px;
          }
        }
      }
      
      .product-actions {
        margin-top: auto;
        
        .detail-btn {
          width: 100%;
        }
      }
    }
  }
  
  .empty-state {
    grid-column: 1 / -1;
    padding: 60px 0;
  }
}

// 详情弹窗样式
.detail-container {
  width: 100%;
  
  .detail-header {
    width: 100%;
    height: 300px;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 20px;
    
    .el-image {
      width: 100%;
      height: 100%;
    }
    
    .detail-image-placeholder {
      width: 100%;
      height: 100%;
      background-color: #f5f7fa;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
    }
  }
  
  .detail-content {
    padding: 10px 0;
  }
  
  .detail-tabs {
    .el-tabs__content {
      padding: 15px 0;
    }
  }
  
  .section-title {
    font-size: 18px;
    color: #333;
    font-weight: 600;
    margin: 25px 0 15px;
    padding-left: 8px;
    border-left: 3px solid #409eff;
  }
  
  .basic-info {
    background-color: #f9fafb;
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 20px;
    
    .info-row {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 10px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    .info-item {
      flex: 1;
      min-width: 200px;
      margin-right: 15px;
      margin-bottom: 10px;
      
      &:last-child {
        margin-right: 0;
      }
      
      .info-label {
        color: #666;
        font-weight: 500;
      }
    }
  }
  
  .overview-content,
  .itinerary-content,
  .notes-content {
    line-height: 1.8;
    color: #555;
    padding: 15px;
    background-color: #f9fafb;
    border-radius: 6px;
  }
  
  .cost-section {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    
    .cost-item {
      flex: 1;
      background-color: #f9fafb;
      padding: 15px;
      border-radius: 6px;
      
      h4 {
        margin-top: 0;
        margin-bottom: 10px;
        color: #333;
        font-size: 16px;
      }
      
      p {
        line-height: 1.8;
        color: #555;
        margin: 0;
      }
    }
  }
  
  // 评价部分样式
  .reviews-section {
    .reviews-header {
      margin-bottom: 20px;
    }
    
    .reviews-stats {
      display: flex;
      background-color: #f9fafb;
      padding: 20px;
      border-radius: 6px;
      margin-bottom: 25px;
      
      .overall-rating {
        flex: 0 0 150px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        
        .rating-value {
          font-size: 42px;
          font-weight: bold;
          color: #ff7d00;
          line-height: 1;
        }
        
        .stars {
          margin: 10px 0;
        }
        
        .rating-count {
          color: #666;
          font-size: 14px;
        }
      }
      
      .rating-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 10px;
        
        .rating-item {
          display: flex;
          align-items: center;
          gap: 10px;
          
          .rating-label {
            flex: 0 0 120px;
            font-size: 14px;
            color: #666;
          }
          
          .el-progress {
            flex: 1;
          }
          
          .rating-score {
            flex: 0 0 40px;
            text-align: center;
            color: #ff7d00;
          }
        }
      }
    }
    
    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .review-item {
      padding: 20px;
      border-bottom: 1px solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .review-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        
        .review-user {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .user-name {
            font-size: 14px;
            color: #333;
          }
        }
        
        .review-date {
          font-size: 13px;
          color: #999;
        }
      }
      
      .review-rating {
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        
        .review-title {
          font-weight: 500;
          color: #333;
        }
      }
      
      .review-content {
        line-height: 1.8;
        color: #555;
        margin-bottom: 15px;
      }
      
      .review-images {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
        
        .review-img {
          width: 100px;
          height: 100px;
          border-radius: 4px;
          cursor: pointer;
        }
      }
      
      .review-like {
        display: flex;
        align-items: center;
        gap: 5px;
        color: #999;
        font-size: 13px;
        margin-bottom: 15px;
      }
      
      .review-reply {
        background-color: #f9fafb;
        padding: 12px;
        border-radius: 6px;
        
        .reply-label {
          font-weight: 500;
          color: #666;
          margin-bottom: 5px;
          display: inline-block;
        }
        
        .reply-content {
          color: #555;
          margin-bottom: 5px;
        }
        
        .reply-time {
          font-size: 12px;
          color: #999;
        }
      }
    }
    
    .no-reviews {
      padding: 40px 0;
      text-align: center;
    }
  }
}

// 弹窗底部按钮
::v-deep .dialog-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  
  .el-button {
    min-width: 120px;
  }
}

// 响应式调整
@media (max-width: 768px) {
  .page-banner {
    height: 200px;
    
    .banner-content h1 {
      font-size: 28px;
    }
  }
  
  .filter-section {
    padding: 15px;
    
    .search-input {
      width: 100%;
      margin-bottom: 10px;
    }
    
    .el-form-item {
      width: 100%;
      margin-bottom: 10px;
    }
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-header {
    height: 200px !important;
  }
  
  .reviews-stats {
    flex-direction: column;
    
    .overall-rating {
      margin-bottom: 20px;
    }
  }
}

.images-section {
  padding: 10px;
  
  .carousel-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  .no-images {
    text-align: center;
    color: #909399;
    padding: 20px;
  }
}
</style>