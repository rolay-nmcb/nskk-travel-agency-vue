<template>
  <div class="travel-notes-plaza">
    <!-- 顶部导航栏 -->
    <header class="plaza-header">
      <div class="container">
        <h1 class="plaza-title">旅行游记广场</h1>
        <div class="search-container">
          <input 
            type="text" 
            v-model="searchKeyword" 
            placeholder="搜索游记标题..." 
            class="search-input"
            @keyup.enter="handleSearch"
          >
          <button class="search-btn" @click="handleSearch">
            <i class="icon-search"></i> 搜索
          </button>
        </div>
        <button class="create-btn" @click="goToCreateNote">
          <i class="icon-pencil"></i> 我也要写游记
        </button>
      </div>
    </header>

    <!-- 推荐标签 -->
    <div class="featured-tag" v-if="hasFeaturedNotes">
      <span>推荐游记</span>
    </div>

    <!-- 游记列表 -->
    <main class="notes-container container">
      <div class="notes-grid">
        <!-- 游记卡片 -->
        <div 
          class="note-card" 
          v-for="note in filteredNotes" 
          :key="note.noteId"
          :class="{ 'featured-note': note.isFeatured === 1 }"
        >
          <!-- 封面图 -->
          <div class="note-cover">
            <img 
              :src="getFirstCoverImage(note.coverImage)" 
              :alt="note.title"
              class="cover-img"
              loading="lazy"
            >
            <span class="featured-badge" v-if="note.isFeatured === 1">
              <i class="icon-star"></i> 推荐
            </span>
          </div>
          
          <!-- 内容信息 -->
          <div class="note-info">
            <h3 class="note-title">{{ note.title }}</h3>
            
            <div class="note-meta">
              <span class="meta-item">
                <i class="icon-eye"></i> {{ note.viewCount }}
              </span>
              <span class="meta-item">
                <i class="icon-heart"></i> {{ note.likeCount }}
              </span>
              <span class="meta-item">
                <i class="icon-calendar"></i> {{ formatDate(note.createdAt) }}
              </span>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="note-actions">
            <button class="read-more" @click="viewNoteDetail(note.noteId)">
              去看看 <i class="icon-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div class="empty-state" v-if="filteredNotes.length === 0">
        <i class="icon-empty"></i>
        <p>没有找到相关游记</p>
      </div>
    </main>
  </div>
</template>

<script setup name="travelNotes">
import { ref, computed, watch, onMounted } from 'vue';
import { getCurrentInstance } from 'vue';
import { listTravelNotesUser , addViewCountNotes } from '@/api/user/travelNotesUser';
import useUserStore from '@/store/modules/user';

const { proxy } = getCurrentInstance();
const travelNotesList = ref([]);
const searchKeyword = ref('');

const userStore = useUserStore()
const userId = userStore.id

// 获取游记列表
function getTravelNotesList() {
  listTravelNotesUser(
    {
      pageNum: 1,
      pageSize: 100,
      status: 2,
    }
  ).then(res => {
    // 按是否推荐排序，推荐的在前，相同推荐状态下按创建时间倒序排列
    travelNotesList.value = res.rows.sort((a, b) => {
      // 首先按是否推荐排序（推荐的在前）
      if (b.isFeatured !== a.isFeatured) {
        return b.isFeatured - a.isFeatured;
      }
      // 如果推荐状态相同，则按创建时间倒序排列（最近发布的在前）
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  });
}

// 页面初始化
onMounted(() => {
  getTravelNotesList();
});

// 过滤搜索结果
const filteredNotes = computed(() => {
  if (!searchKeyword.value) return travelNotesList.value;
  
  const keyword = searchKeyword.value.trim().toLowerCase();
  return travelNotesList.value.filter(note => 
    note.title.toLowerCase().includes(keyword)
  );
});

// 是否有推荐游记
const hasFeaturedNotes = computed(() => 
  travelNotesList.value.some(note => note.isFeatured === 1)
);

// 获取第一张封面图
function getFirstCoverImage(coverImages) {
  if (!coverImages) return 'https://picsum.photos/400/300?grayscale&blur=2';
  return coverImages.split(',')[0];
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// 搜索处理
function handleSearch() {
  // 可以添加防抖处理
  console.log('搜索关键词:', searchKeyword.value);
}

// 查看详情
function viewNoteDetail(noteId) {
  addViewCountNotes(noteId).then(res => {
    if(res.code === 200)
    {
     console.log('添加浏览次数成功');
     proxy.$router.push(`/travel-note/${noteId}`);
    }
  }).catch(err => {
    proxy.$message.error('新增浏览量时出错：' + err.message);
    console.log('添加浏览次数失败');
  });
  // 实际项目中跳转到详情页
  console.log('查看游记详情:', noteId);
  
}

// 去写游记
function goToCreateNote() {
  // 实际项目中跳转到创建页
  console.log('前往创建游记页面');
  proxy.$router.push({ path: '/travel-note/create', query: { userId : userId } });
}
</script>

<style scoped>
/* 基础样式 */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.travel-notes-plaza {
  font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  color: #333;
  background-color: #f9fafb;
  line-height: 1.6;
}

/* 头部样式 - 修改这部分 */
.plaza-header {
  background:  url('/src/assets/images/travelNoteBG.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 2rem 0;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.plaza-title {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 700;
}

.search-container {
  display: flex;
  max-width: 600px;
  margin: 0 auto 1.5rem;
  gap: 8px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: box-shadow 0.3s;
}

.search-input:focus {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
}

.search-btn {
  padding: 0 20px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.search-btn:hover {
  background-color: #c0392b;
}

.create-btn {
  display: block;
  margin: 0 auto;
  padding: 10px 24px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.create-btn:hover {
  background-color: #27ae60;
  transform: translateY(-2px);
}

/* 推荐标签 */
.featured-tag {
  background: linear-gradient(rgba(7, 75, 233, 0.8), rgba(6, 193, 245, 0.8));
  color: #333;
  padding: 8px 0;
  margin: 2rem 0 1rem;
}

.featured-tag span {
  display: inline-block;
  margin-left: 20px;
  font-weight: 600;
  font-size: 1.1rem;
}

/* 游记列表 */
.notes-container {
  padding: 2rem 0 4rem;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

/* 游记卡片 */
.note-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.note-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
}

.note-card.featured-note {
  border: 2px solid #f1c40f;
}

/* 封面图 */
.note-cover {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.note-card:hover .cover-img {
  transform: scale(1.05);
}

.featured-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: #f1c40f;
  color: #333;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 内容信息 */
.note-info {
  padding: 1.2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.note-title {
  font-size: 1.2rem;
  margin: 0 0 1rem;
  color: #2c3e50;
  font-weight: 600;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2; /* 添加标准属性 */
  overflow: hidden;
  height: 2.4em;
}

.note-meta {
  display: flex;
  gap: 1rem;
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-top: auto;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 操作按钮 */
.note-actions {
  padding: 0 1.2rem 1.2rem;
}

.read-more {
  width: 100%;
  padding: 10px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.read-more:hover {
  background-color: #2980b9;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 4rem 0;
  color: #7f8c8d;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

/* 图标样式 (可替换为实际图标库) */
.icon-search::before { content: "🔍"; }
.icon-pencil::before { content: "✏️"; }
.icon-star::before { content: "⭐"; }
.icon-eye::before { content: "👁️"; }
.icon-heart::before { content: "❤️"; }
.icon-calendar::before { content: "📅"; }
.icon-arrow-right::before { content: "→"; }
.icon-empty::before { content: "📭"; }

/* 响应式调整 */
@media (max-width: 768px) {
  .plaza-title {
    font-size: 1.5rem;
  }
  
  .notes-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
  
  .note-cover {
    height: 180px;
  }
}

</style>