<template>
<div class="page-background">
  <div class="travel-notes-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>我的游记</h1>
      <p>记录每一段难忘的旅程</p>
    </div>

    <!-- 状态筛选器 -->
    <div class="status-filter">
      <button 
        v-for="(status, key) in statusMap" 
        :key="key"
        @click="currentStatus = key"
        :class="{ active: currentStatus === key }"
      >
        {{ status.label }}
        <span class="count-badge">{{ getStatusCount(key) }}</span>
      </button>
    </div>

    <!-- 游记列表 -->
    <div class="notes-list">
      <!-- 空状态 -->
      <div class="empty-state" v-if="filteredNotes.length === 0">
        <img src="https://picsum.photos/seed/empty/200/200" alt="暂无数据" class="empty-img">
        <p>暂无{{ statusMap[currentStatus].label }}的游记</p>
        <button class="create-btn" @click="handleCreate">+ 创建新游记</button>
      </div>

      <!-- 游记卡片 -->
      <div class="note-card" v-for="note in filteredNotes" :key="note.noteId">
        <!-- 封面图 -->
        <div class="note-cover">
          <img 
            :src="getFirstCover(note.coverImage)" 
            :alt="note.title"
            class="cover-img"
          >
          <span class="status-tag">{{ statusMap[note.status].label }}</span>
        </div>

        <!-- 内容区域 -->
        <div class="note-content">
          <h3 class="note-title">{{ note.title }}</h3>
          
          <div class="note-meta">
            <span class="meta-item">
              <i class="icon-view"></i> {{ note.viewCount }} 浏览
            </span>
            <span class="meta-item">
              <i class="icon-like"></i> {{ note.likeCount }} 点赞
            </span>
            <span class="meta-item">
              <i class="icon-time"></i> {{ formatDate(note.createdAt) }}
            </span>
          </div>

          <p class="note-desc">{{ truncateContent(note.content) }}</p>
        </div>

        <!-- 操作按钮 -->
        <div class="note-actions">
          <button class="action-btn view-btn" @click="handleView(note.noteId)">
            查看详情
          </button>
          
          <button 
            class="action-btn edit-btn" 
            @click="handleEdit(note.noteId, note.status)"
          >
            {{ getEditButtonText(note.status) }}
          </button>
          
          <button 
            class="action-btn下架-btn" 
            @click="handleTakeDown(note.noteId)"
            v-if="note.status === 2"
          >
            下架文章
          </button>
        </div>
      </div>
    </div>

    <!-- 创建新游记按钮 -->
    <button class="float-create-btn" @click="handleCreate">
      <i class="icon-plus"></i>
    </button>
  </div>
</div>
</template>

<script setup name="myTravelNote">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { listTravelNotesUser , updateTravelNotesUser} from '@/api/user/travelNotesUser';
import { getCurrentInstance } from 'vue';
import useUserStore from '@/store/modules/user';

const { proxy } = getCurrentInstance();
const router = useRouter();
const userStore = useUserStore();
const userId = userStore.id;

// 状态管理
const travelnotesList = ref([]);
const currentStatus = ref('all'); // all表示全部状态

// 状态映射表
const statusMap = {
  all: { label: '全部', color: '#666' },
  0: { label: '草稿', color: '#999' },
  1: { label: '待审核', color: '#ff9800' },
  2: { label: '审核通过', color: '#4caf50' },
  3: { label: '驳回', color: '#f44336' }
};

// 获取游记列表
function getTravelNotesUserList() {
  listTravelNotesUser({
    pageNum: 1,
    pageSize: 10000,
    userId: userId
  }).then(res => {
    travelnotesList.value = res.rows;
  });
}

// 过滤当前状态的游记
const filteredNotes = computed(() => {
  if (currentStatus.value === 'all') {
    return travelnotesList.value;
  }
  return travelnotesList.value.filter(note => note.status === Number(currentStatus.value));
});

// 获取状态对应的数量
function getStatusCount(status) {
  if (status === 'all') {
    return travelnotesList.value.length;
  }
  return travelnotesList.value.filter(note => note.status === Number(status)).length;
}

// 获取封面图第一张
function getFirstCover(coverImages) {
  if (!coverImages) return 'https://picsum.photos/seed/default/400/300';
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

// 截断内容并转换为纯文本
function truncateContent(content) {
  if (!content) return '无内容';
  
  // 转换富文本为纯文本
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  const plainText = tempDiv.textContent || tempDiv.innerText || '';
  
  // 截断文本
  return plainText.length > 100 ? plainText.slice(0, 100) + '...' : plainText;
}

// 获取编辑按钮文本
function getEditButtonText(status) {
  switch (status) {
    case 0: return '去发布';
    case 1:
    case 2: return '去修改';
    case 3: return '重新编辑';
    default: return '编辑';
  }
}

// 操作处理函数
function handleView(noteId) {
  router.push(`/travel-note/${noteId}`);
}

function handleEdit(noteId, status) {
  proxy.$router.push({ path: '/travel-note/create', query: { userId : userId , noteId: noteId } });
}

function handleTakeDown(noteId) {
  if (confirm('确定要下架这篇游记吗？')) {
    updateTravelNotesUser({ noteId: noteId, status: 3 })
    .then((res) => {
      if(res.code === 200){
      alert('游记已下架');
      getTravelNotesUserList();
      }else{
        alert('操作失败');
      }
    })
    .catch(() => {
      alert('操作失败');
    });
  }
}

function handleCreate() {
    proxy.$router.push({ path: '/travel-note/create', query: { userId : userId } });
}

// 页面初始化
onMounted(() => {
  getTravelNotesUserList();
});
</script>

<style scoped>
.page-background {
background-image: url('/src/assets/images/myTravelNoteBG.jpg');
background-size: cover;
background-position: center;
background-attachment: fixed;
background-repeat: no-repeat;
min-height: 100vh;
padding: 20px;
}

.travel-notes-container {
max-width: 1200px;
margin: 0 auto;
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.page-header {
  text-align: center;
  margin: 30px 0 40px;
  background-color: rgba(255, 255, 255, 0.65);
  padding: 20px;
  border-radius: 12px;
  backdrop-filter: blur(5px);
}

.status-filter,
.notes-list {
 background-color: rgba(255, 255, 255, 0.65);
 padding: 20px;
 border-radius: 12px;
 backdrop-filter: blur(5px);
}

.page-header h1 {
  font-size: 2.2rem;
  color: #333;
  margin-bottom: 10px;
}

.page-header p {
  color: #666;
  font-size: 1.1rem;
}

.status-filter {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.status-filter button {
  padding: 8px 18px;
  border: none;
  border-radius: 20px;
  background: rgba(245, 245, 245, 0.8);
  color: #666;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.status-filter button.active {
  background: #2c3e50;
  color: white;
}

.count-badge {
  margin-left: 5px;
  background: rgba(255, 255, 255, 0.3);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
}

.notes-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
}

.note-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.note-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

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

.status-tag {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 4px 10px;
  border-radius: 4px;
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-tag[data-status="0"] { background: v-bind('statusMap[0].color'); }
.status-tag[data-status="1"] { background: v-bind('statusMap[1].color'); }
.status-tag[data-status="2"] { background: v-bind('statusMap[2].color'); }
.status-tag[data-status="3"] { background: v-bind('statusMap[3].color'); }

.note-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.note-title {
  margin: 0 0 15px;
  font-size: 1.3rem;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.note-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  color: #888;
  font-size: 0.9rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.icon-view::before { content: '👁️'; }
.icon-like::before { content: '❤️'; }
.icon-time::before { content: '📅'; }

.note-desc {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
  flex: 1;
}

.note-actions {
  display: flex;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  flex: 1;
  padding: 10px 0;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.view-btn {
  background: #f0f5ff;
  color: #165dff;
}

.view-btn:hover {
  background: #e6f7ff;
}

.edit-btn {
  background: #fff0f0;
  color: #ff4d4f;
}

.edit-btn:hover {
  background: #fff1f0;
}

.下架-btn {
  background: #fffbe6;
  color: #faad14;
}

.下架-btn:hover {
  background: #fff8e6;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: #888;
}

.empty-img {
  width: 150px;
  height: 150px;
  object-fit: contain;
  margin-bottom: 20px;
  opacity: 0.6;
}

.create-btn {
  margin-top: 20px;
  padding: 12px 24px;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.create-btn:hover {
  background: #34495e;
}

.float-create-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #2c3e50;
  color: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.float-create-btn:hover {
  transform: scale(1.1);
}

.icon-plus::before { content: '+'; }

@media (max-width: 768px) {
  .notes-list {
    grid-template-columns: 1fr;
  }
  
  .note-actions {
    flex-direction: column;
  }
}
</style>