<template>
  <div class="app-container home">
    <!-- 欢迎区域 - 增加动态背景 -->
    <div class="home-hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <h1 class="welcome-title">欢迎你，尊敬的{{ nickName }}</h1>
        <p class="welcome-subtitle">探索精选产品，发现热门目的地</p>
          <!-- <el-input 
            v-model="searchQuery" 
            placeholder="搜索产品或目的地..." 
            prefix-icon="Search"
            class="search-input"
          ></el-input> -->
          <el-button class="search-btn" type="primary" >
            <router-link 
                :to="`/userProduct/userProducts`" 
                class="product-link"
              >去看看
          </router-link >
          </el-button>
      </div>
    </div>

    <!-- 热门产品Top5 - 优化布局和动效 -->
    <el-row :gutter="20" class="section-row">
      <el-col :span="24">
        <div class="section-title">
          <span class="title-text">热门产品 Top5</span>
          <span class="title-line"></span>
          <router-link to="/userProduct/userProducts" class="more-link">
            查看全部 <el-icon class="more-icon"><Right /></el-icon>
          </router-link>
        </div>
      </el-col>
      
      <el-col 
        :xs="24" 
        :sm="12" 
        :md="8" 
        :lg="4.8" 
        v-for="(product, index) in hotProducts" 
        :key="product.id"
        class="product-item"
      >
        <div class="product-card" :style="{'animation-delay': `${index * 0.1}s`}">
          <div class="product-badge" v-if="product.isNew">新品</div>
          <div class="product-rank">{{ index + 1 }}</div>
          <div class="product-img">
            <img :src="product.imgUrl" :alt="product.name" class="img-cover">
            <div class="quick-view">
               <router-link 
                :to="`/userProduct/userProducts`" 
                class="product-link"
              >
                查看详情
                <el-icon class="link-icon"><Right /></el-icon>
              </router-link>
            </div>
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <div class="product-price">
              <span class="price-symbol">¥</span>
              <span class="price-value">{{ product.price }}</span>
              <span class="price-unit">起</span>
              <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
            </div>
            <div class="product-rating">
              <el-rate 
                v-model="product.rating" 
                disabled 
                size="small" 
                :max="5"
                :show-text="false"
              ></el-rate>
              <span class="rating-count">({{ product.sales }}人已购)</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 热门目的地Top5 - 增强视觉层次 -->
    <el-row :gutter="20" class="section-row">
      <el-col :span="24">
        <div class="section-title">
          <span class="title-text">热门目的地 Top5</span>
          <span class="title-line"></span>
          <router-link to="/userProduct/userProducts" class="more-link">
            全部目的地 <el-icon class="more-icon"><Right /></el-icon>
          </router-link>
        </div>
      </el-col>
      
      <el-col 
        :xs="24" 
        :sm="12" 
        :lg="12" 
        v-for="(destination, index) in hotDestinations" 
        :key="destination.id"
        class="destination-item"
      >
        <div class="destination-card" :style="{'animation-delay': `${index * 0.15}s`}">
          <div class="destination-img">
            <img :src="destination.imgUrl" :alt="destination.name" class="img-cover">
            <div class="destination-rank">{{ index + 1 }}</div>
            <div class="destination-tag">{{ destination.tag }}</div>
            <div class="overlay-mask"></div>
          </div>
          <div class="destination-info">
            <h3 class="destination-name">{{ destination.name }}</h3>
            <p class="destination-desc">{{ destination.description }}</p>
            <div class="destination-stats">
              <div class="stat-item">
                <el-icon class="stat-icon"><Calendar /></el-icon>
                <span class="stat-text">{{ destination.trips }}+ 旅行</span>
              </div>
              <div class="stat-item">
                <el-icon class="stat-icon"><Star /></el-icon>
                <span class="stat-text">{{ destination.rating }} 好评</span>
              </div>
              <div class="stat-item">
                <el-icon class="stat-icon"><MapLocation /></el-icon>
                <span class="stat-text">{{ destination.distance }}</span>
              </div>
            </div>
            <router-link 
              :to="`/userProduct/userProducts`" 
              class="destination-link"
            >
              探索目的地
              <el-rate 
                v-model="rateValue" 
                disabled 
                :max="1" 
                icon-class="el-icon-arrow-right" 
                void-icon-class="el-icon-arrow-right"
                size="small"
              ></el-rate>
            </router-link>
          </div>
        </div>
      </el-col>
    </el-row>

    
    <!-- 介绍区域 - 增加卡片阴影 -->
    <el-row :gutter="20" style="margin-bottom: 24px;" class="section-row">
      <el-col :span="24">
        <div class="section-title">
          <span class="title-text">关于我们</span>
          <span class="title-line"></span>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="intro-card">
          <Introduction />
        </div>
      </el-col>
    </el-row>

    <!-- 新增推荐理由区域 -->
    <el-row :gutter="30" class="section-row features-section">
      <el-col :span="24">
        <div class="section-title">
          <span class="title-text">为什么选择我们</span>
          <span class="title-line"></span>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8" class="feature-item">
        <div class="feature-card">
          <div class="feature-icon">
            <el-icon><Checked /></el-icon>
          </div>
          <h3 class="feature-title">品质保障</h3>
          <p class="feature-desc">严格筛选产品，确保每一项服务都符合高标准</p>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8" class="feature-item">
        <div class="feature-card">
          <div class="feature-icon">
            <el-icon><Clock /></el-icon>
          </div>
          <h3 class="feature-title">随时退改</h3>
          <p class="feature-desc">灵活的退改政策，让您的行程安排更自由</p>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8" class="feature-item">
        <div class="feature-card">
          <div class="feature-icon">
            <el-icon><Phone /></el-icon>
          </div>
          <h3 class="feature-title">7×24客服</h3>
          <p class="feature-desc">全天候客户服务，随时为您解决问题</p>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
import { ref, onMounted } from 'vue';
import Introduction from './components/introduction.vue';
import useUserStore from '@/store/modules/user';
import { listTop5Products, listTop5Destinations } from '@/api/manage/statistics';

// 引入Element组件
import { ElRate, ElInput, ElButton } from 'element-plus';

const userStore = useUserStore();
const userId = userStore.id;
const nickName = userStore.nickName;
const rateValue = ref(1);
const searchQuery = ref('');

// 热门产品数据
const hotProducts = ref([]);
// 获取热门产品
function getHotProducts() {
  listTop5Products().then(res => {
    hotProducts.value = res.data;
  });
}

// 热门目的地模拟数据
const hotDestinations = ref([]);

// 获取热门目的地
function getHotDestinations() {
  listTop5Destinations().then(res => {
    hotDestinations.value = res.data;
  });
}

// 页面初始化
onMounted(() => {
  getHotProducts();
  getHotDestinations();
  
  // 滚动动画效果
  const handleScroll = () => {
    const sections = document.querySelectorAll('.section-row');
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85) {
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
      }
    });
  };
  
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // 初始检查
  
  return () => window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped lang="scss">
// 基础样式
$primary: #3a7bd5;
$primary-light: #00d2ff;
$accent: #ff7d00;
$text-dark: #333;
$text-medium: #666;
$text-light: #999;
$white: #fff;
$shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
$shadow-hover: 0 10px 30px rgba(0, 0, 0, 0.12);

.home {
  font-family: 'open sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: $text-medium;
  overflow-x: hidden;
  padding: 0;

  // 通用样式
  ul {
    padding: 0;
    margin: 0;
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  p {
    margin-top: 10px;

    b {
      font-weight: 700;
    }
  }

  .img-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
}

// 英雄区域样式
.home-hero {
  position: relative;
  height: 500px;
  overflow: hidden;
  margin-bottom: 40px;

  .hero-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('src/assets/images/home/homeBG.jpg') center/cover no-repeat;
    filter: brightness(0.8);
    z-index: 1;
    // 视差滚动效果
    transform: translateZ(0);
    will-change: transform;
  }

  .hero-content {
    position: relative;
    z-index: 2;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 0 20px;
    color: $white;

    .welcome-title {
      font-size: 42px;
      font-weight: bold;
      margin: 0 0 15px 0;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      animation: fadeInUp 1s ease forwards;
      opacity: 0;
    }

    .welcome-title {
  &.text-center {
    text-align: center;
    margin-left: 0;
    margin-right: 0;
  }
}

    .welcome-subtitle {
      font-size: 18px;
      margin: 0 0 30px 0;
      max-width: 600px;
      text-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
      animation: fadeInUp 1s ease 0.3s forwards;
      opacity: 0;
    }
  }
}

// 搜索栏样式
.search-bar {
  display: flex;
  width: 100%;
  max-width: 700px;
  margin-top: 20px;
  animation: fadeInUp 1s ease 0.6s forwards;
  opacity: 0;

  .search-input {
    flex: 1;
    height: 50px;
    border-radius: 8px 0 0 8px;
    border: none;
    padding: 0 20px;
    font-size: 16px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .search-btn {
    height: 50px;
    padding: 0 30px;
    border-radius: 0 8px 8px 0;
    background: $primary;
    border: none;
    font-size: 16px;
    transition: all 0.3s ease;

    &:hover {
      background: $primary-light;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(58, 123, 213, 0.3);
    }
  }
}

// 介绍卡片样式
.intro-card {
  background: $white;
  border-radius: 12px;
  padding: 30px;
  margin: 0 15px;
  box-shadow: $shadow;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: $shadow-hover;
    transform: translateY(-3px);
  }
}

// 区块标题样式
.section-row {
  margin-bottom: 60px;
  padding: 0 15px;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.section-title {
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .title-text {
    font-size: 24px;
    font-weight: 600;
    color: $text-dark;
    position: relative;
    padding-right: 15px;

    &:after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -8px;
      width: 40px;
      height: 3px;
      background: $primary;
      border-radius: 3px;
    }
  }

  .title-line {
    flex: 1;
    height: 1px;
    background: #eee;
    margin: 0 20px;
  }

  .more-link {
    color: $primary;
    font-size: 14px;
    text-decoration: none;
    display: flex;
    align-items: center;
    transition: all 0.3s ease;

    &:hover {
      color: $primary-light;
      transform: translateX(5px);
    }

    .more-icon {
      margin-left: 5px;
      font-size: 16px;
    }
  }
}

// 热门产品样式
.product-item {
  margin-bottom: 20px;
}

.product-card {
  background: $white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: $shadow;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  opacity: 0;
  transform: translateY(20px);
  animation: slideUp 0.6s ease forwards;
  position: relative;
  height: 100%;

  &:hover {
    transform: translateY(-8px);
    box-shadow: $shadow-hover;

    .img-cover {
      transform: scale(1.1);
    }

    .quick-view {
      opacity: 1;
    }
  }
}

.product-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: $accent;
  color: $white;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 4px;
  z-index: 2;
  font-weight: 500;
}

.product-rank {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 24px;
  height: 24px;
  background: $primary;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  z-index: 2;
  box-shadow: 0 2px 5px rgba(58, 123, 213, 0.3);
}

.product-img {
  height: 180px;
  overflow: hidden;
  position: relative;

  .quick-view {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(58, 123, 213, 0.9);
    color: $white;
    padding: 8px 15px;
    border-radius: 20px;
    font-size: 14px;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 2;
    cursor: pointer;
  }
}

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: $text-dark;
  margin: 0 0 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1; /* 标准属性，增强兼容性 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;

  &:hover {
    color: $primary;
  }
}

.product-price {
  margin-bottom: 10px;
  display: flex;
  align-items: baseline;

  .price-symbol {
    color: #ff4d4f;
    font-size: 14px;
  }

  .price-value {
    color: #ff4d4f;
    font-size: 18px;
    font-weight: 600;
    margin: 0 3px;
  }

  .price-unit {
    color: $text-light;
    font-size: 12px;
  }

  .original-price {
    margin-left: 10px;
    color: $text-light;
    font-size: 14px;
    text-decoration: line-through;
  }
}

.product-rating {
  display: flex;
  align-items: center;
  margin-bottom: 15px;

  .rating-count {
    font-size: 12px;
    color: $text-light;
    margin-left: 5px;
  }
}

.product-link {
  display: inline-flex;
  align-items: center;
  color: #43b154;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    color: $primary-light;
  }

  .link-icon {
    margin-left: 5px;
    font-size: 14px;
    transition: transform 0.3s ease;
  }

  &:hover .link-icon {
    transform: translateX(3px);
  }
}

// 热门目的地样式
.destination-item {
  margin-bottom: 24px;
}

.destination-card {
  background: $white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: $shadow;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  opacity: 0;
  transform: translateY(20px);
  animation: slideUp 0.6s ease forwards;

  @media (min-width: 992px) {
    flex-direction: row;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: $shadow-hover;

    .img-cover {
      transform: scale(1.08);
    }
  }
}

.destination-img {
  height: 200px;
  position: relative;
  overflow: hidden;

  @media (min-width: 992px) {
    width: 40%;
    height: auto;
  }

  .overlay-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%);
    z-index: 1;
  }
}

.destination-rank {
  position: absolute;
  top: 15px;
  left: 15px;
  width: 30px;
  height: 30px;
  background: rgba(58, 123, 213, 0.9);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.destination-tag {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 3px 10px;
  background: rgba(255, 255, 255, 0.9);
  color: $primary;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  z-index: 2;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.destination-info {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.destination-name {
  font-size: 18px;
  font-weight: 600;
  color: $text-dark;
  margin: 0 0 10px 0;
  transition: color 0.3s ease;

  &:hover {
    color: $primary;
  }
}

.destination-desc {
  color: $text-medium;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 15px 0;
  flex: 1;
}

.destination-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: $text-light;

  .stat-icon {
    margin-right: 5px;
    color: $primary;
    font-size: 14px;
  }
}

.destination-link {
  display: inline-flex;
  align-items: center;
  color: $primary;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  margin-top: auto;
  width: fit-content;
  transition: color 0.3s ease;

  .el-rate {
    margin-left: 5px;
  }

  &:hover {
    color: $primary-light;
  }
}

// 推荐理由区域
.features-section {
  background: #f9fafb;
  padding: 60px 0;
  margin-left: 0;
  margin-right: 0;
  border-radius: 12px;
  margin: 0 15px 60px;
}

.feature-item {
  display: flex;
  justify-content: center;
}

.feature-card {
  background: $white;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  width: 100%;
  max-width: 300px;
  box-shadow: $shadow;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: $shadow-hover;
  }

  .feature-icon {
    width: 60px;
    height: 60px;
    background: rgba(58, 123, 213, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;

    el-icon {
      font-size: 28px;
      color: $primary;
    }
  }

  .feature-title {
    font-size: 18px;
    color: $text-dark;
    margin: 0 0 15px 0;
    font-weight: 600;
  }

  .feature-desc {
    color: $text-medium;
    font-size: 14px;
    line-height: 1.6;
    margin: 0;
  }
}

// 动画效果
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 滚动条美化
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: $primary;
}
</style>