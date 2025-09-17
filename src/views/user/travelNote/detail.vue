<template>
  <div class="note-detail-container">
    <!-- 加载状态 -->
    <div v-if="!noteDetail" class="loading-container">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 游记内容 -->
    <div v-else class="note-content">
      <!-- 标题区域 -->
      <div class="note-header">
        <h1 class="note-title">{{ noteDetail.title }}</h1>
        <div class="note-meta">
            <span class="publish-date">{{ formatDate(noteDetail.createdAt) }}</span>
            <span class="user-id">作者: 
              <span v-for="cat in userList" :key="cat.userId">
                <span v-if="cat.userId === noteDetail.userId">{{ cat.nickName }}</span>
              </span>
            </span>
            <span class="view-count">👁️ {{ noteDetail.viewCount }} 浏览</span>
        </div>
      </div>

      <!-- 封面图轮播 -->
      <div class="carousel-container">
        <div class="carousel" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
          <img 
            v-for="(img, index) in coverImages" 
            :key="index" 
            :src="img" 
            :alt="`${noteDetail.title} - 图片${index + 1}`"
            class="carousel-img"
          >
        </div>
        
        <!-- 轮播控制 -->
        <button class="carousel-btn prev" @click="prevSlide">←</button>
        <button class="carousel-btn next" @click="nextSlide">→</button>
        
        <!-- 指示器 -->
        <div class="carousel-indicators">
          <span 
            v-for="(img, index) in coverImages" 
            :key="index" 
            :class="{ active: currentSlide === index }"
            @click="goToSlide(index)"
          ></span>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="note-body">
        <div class="content-wrapper" >
          <div v-html="noteDetail.content"></div>
        </div>
      </div>

      <!-- 互动区域 -->
      <div class="note-actions">
        <button 
          class="like-btn" 
          :class="{ liked: noteDetail.isLiked === 1 }"
          @click="handleLike"
        >
          <i class="like-icon">❤️</i>
          <span class="like-count">{{ noteDetail.likeCount }}</span>
        </button>
        
        <button class="share-btn">
          <i class="share-icon">📤</i>
          <span>分享</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getTravelNotesUser , likeTravelNotesUser } from '@/api/user/travelNotesUser';
import {listUserManage} from '@/api/manage/userManage';
import { getCurrentInstance } from 'vue';
import useUserStore from '@/store/modules/user';

const userStore = useUserStore()
const userId = userStore.id

const { proxy } = getCurrentInstance();

// 接收路由参数
const route = useRoute()
const noteId = route.params.noteId

// 游记详情数据
const noteDetail = ref(null)
const userList = ref([])

// 轮播相关
const currentSlide = ref(0)
const coverImages = computed(() => {
  return noteDetail.value?.coverImage ? noteDetail.value.coverImage.split(',') : []
})

// 页面初始化
onMounted(() => {
  // 加载游记详情数据
  loadNoteDetail(noteId, userId)
  loadUserList();
  // 自动轮播
  startAutoSlide()
})

function loadNoteDetail(_noteId, _userId) {
  getTravelNotesUser(_noteId, _userId).then(res => {
    noteDetail.value = res.data
  })
}

//获取用户列表
function loadUserList() {
  listUserManage({
    pageNum: 1,
    pageSize:10000
  }).then(res => {
    userList.value = res.rows
  })
}

// 日期格式化
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 内容格式化（将换行转为p标签）
function formatContent(content) {
  if (!content) return ''
  return content
    .split('\n\n')
    .map(paragraph => `<p class="content-paragraph">${paragraph}</p>`)
    .join('')
}

// 轮播控制
function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % coverImages.value.length
}

function prevSlide() {
  currentSlide.value = (currentSlide.value - 1 + coverImages.value.length) % coverImages.value.length
}

function goToSlide(index) {
  currentSlide.value = index
}

// 自动轮播
let slideInterval = null
function startAutoSlide() {
  slideInterval = setInterval(() => {
    if (coverImages.value.length > 1) {
      nextSlide()
    }
  }, 5000)
}

// 点赞处理
function handleLike() {
    likeTravelNotesUser({
        noteId: noteId,
        userId: userId,
        likeCount: noteDetail.value.likeCount
    }).then(response => {
    if (response.code === 200) {
      // 显示成功提示
      if (noteDetail.value.isLiked === 1) {
            proxy.$message.success('取消点赞成功');
            noteDetail.value.likeCount--
            noteDetail.value.isLiked = 0
        } else {
            proxy.$message.success('点赞成功');
            noteDetail.value.likeCount++
            noteDetail.value.isLiked = 1
        }
    }
    }).catch(error => {
      proxy.$message.error('点赞失败，请重试');
      console.error('点赞失败:', error);
    });
}
</script>

<style scoped>

.ql-size-huge {
  font-size: 32px;
}

.ql-size-large {
  font-size: 18px;
}

.ql-size-normal {
  font-size: 14px;
}

.ql-size-small {
  font-size: 10px;
}


.note-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* 加载状态 */
.loading-container {
  text-align: center;
  padding: 50px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 标题区域 */
.note-header {
  margin-bottom: 30px;
}

.note-title {
  font-size: 28px;
  color: #333;
  margin-bottom: 15px;
  line-height: 1.3;
}

.note-meta {
  display: flex;
  color: #888;
  font-size: 14px;
  gap: 20px;
  justify-content: space-between; /* 使内容两端对齐 */
  align-items: center;
}

/* 轮播图 */
.carousel-container {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 40px;
}

.carousel {
  display: flex;
  height: 100%;
  transition: transform 0.5s ease-in-out;
}

.carousel-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  flex-shrink: 0;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s;
  z-index: 10;
}

.carousel-btn:hover {
  background-color: rgba(0, 0, 0, 0.5);
}

.prev {
  left: 15px;
}

.next {
  right: 15px;
}

.carousel-indicators {
  position: absolute;
  bottom: 15px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  z-index: 10;
}

.carousel-indicators span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: background-color 0.3s;
}

.carousel-indicators span.active {
  background-color: white;
  width: 30px;
  border-radius: 5px;
}

/* 内容区域 */
.note-body {
  margin-bottom: 40px;
}

.content-wrapper {
  color: #333;
  line-height: 1.8;
}

.content-paragraph {
  margin-bottom: 20px;
  text-align: justify;
}

/* 互动区域 */
.note-actions {
  display: flex;
  gap: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.like-btn, .share-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.like-btn {
  background-color: #f5f5f5;
  color: #666;
}

.like-btn.liked {
  background-color: #ff4d6d;
  color: white;
}

.share-btn {
  background-color: #f5f5f5;
  color: #666;
}

.like-btn:hover, .share-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .carousel-container {
    height: 250px;
  }
  
  .note-title {
    font-size: 24px;
  }
  
}

.view-count {
  margin-left: auto; /* 将浏览量推到右侧 */
  white-space: nowrap;
}
</style>