<template>
  <div class="travel-note-container">
    <!-- 顶部导航栏 -->
    <nav class="navbar">
      <div class="navbar-content">
        <button class="back-btn" @click="$router.back()">
          <i class="icon-arrow-left"></i> 返回
        </button>
        <h1>写游记</h1>
        <div class="action-buttons">
          <button class="btn draft-btn" @click="saveDraft">保存草稿</button>
          <button class="btn publish-btn" @click="submitNote">发布</button>
        </div>
      </div>
    </nav>

    <!-- 主要内容区 -->
    <main class="main-content">
      <!-- 标题输入 -->
      <div class="form-group title-input">
        <input 
          type="text" 
          v-model="note.title" 
          placeholder="给你的游记起个吸引人的标题吧~"
          class="title-text"
        >
      </div>

      <!-- 目的地选择 -->
      <div class="form-group">
        <label class="form-label">目的地</label>
              <el-cascader
                v-model="note.destinationIds"
                placeholder="请选择目的地"
                clearable
                :options="destinationTree"
                :show-all-levels="false"
                :props="{
                  label: 'name',
                  value: 'destinationId',
                  children: 'children',
                  checkStrictly: true,
                }"
              />
      </div>

      <!-- 封面图上传 -->
      <div class="form-group">
        <label class="form-label">封面图</label>
        <div class="upload-container">
          <image-upload 
            v-model="note.coverImage" 
            multiple 
            class="image-uploader"
          />
          <p class="upload-hint">上传多张图片，第一张将作为封面图（最多5张）</p>
        </div>
      </div>

      <!-- 内容编辑器 -->
      <div class="form-group content-editor">
        <label class="form-label">游记内容</label>
        <editor 
          v-model="note.content" 
          placeholder="分享你的旅行故事吧...可以写下行程安排、美食推荐、心得体会等"
          rows="15"
        />
        <div class="word-count">
          {{ note.content.length }} 字
        </div>
      </div>

      <!-- 图片预览区 -->
      <div v-if="note.coverImage && note.coverImage.length" class="preview-section">
        <h3>图片预览</h3>
        <div class="image-preview">
          <div 
            v-for="(img, index) in note.coverImage.split(',')" 
            :key="index"
            class="preview-item"
          >
            <img :src="img" :alt="'图片' + (index + 1)">
            <button class="delete-img" @click="removeImage(index)">
              <i class="icon-delete"></i>
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部提示 -->
    <footer class="footer-hint">
      <p>发布后将进入审核流程，审核通过后将公开发布</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCurrentInstance } from 'vue';
import {addTravelNotesUser,updateTravelNotesUser,getTravelNotesUser} from '@/api/user/travelNotesUser';
import {listDestinations} from '@/api/manage/destinations';
import { de } from 'element-plus/es/locales.mjs';

const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();

// 游记数据
const note = ref({
  noteId: null,
  userId: null,
  title: '',
  content: '',
  coverImage: '',
  destinationId: '',
  destinationIds: null,
  status: 0, // 默认草稿状态
  viewCount: 0,
  likeCount: 0,
  isFeatured: 0
});

const destinationsList = ref([]);
function buildTree(list, parentId = null) {
  return list
    .filter(item => item.parentId === parentId)
    .map(item => ({
      ...item,
      children: buildTree(list, item.destinationId)
    }));
}

const destinationTree = ref([]);
function getDestinationsList() {
  listDestinations({
    pageNum: 1,
    pageSize: 10000
  }).then(response => {
    destinationsList.value = response.data;
    destinationTree.value = buildTree(response.data);
    console.log(destinationTree.value);
  });
}

// 接收路由参数
onMounted(() => {
  getDestinationsList();
  if (route.query.userId) {
    note.value.userId = route.query.userId;
  }
  // 如果是编辑已有的游记，获取游记详情
  if (route.query.noteId) {
    fetchNoteDetail(route.query.noteId,route.query.userId);
  }
});

// 监听路由变化
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.userId && newQuery.userId !== note.value.userId) {
      note.value.userId = newQuery.userId;
    }
  }
);

// 获取游记详情（示例方法）
const fetchNoteDetail = (noteId,userId) => {
  // 实际项目中替换为真实接口调用
  getTravelNotesUser(noteId,userId).then(res => {
    if (res.code==200) {
      note.value = res.data;
      note.value.destinationIds = res.data.destinationId;
    }
  }).catch(err => {
    console.error('获取游记详情失败', err);
    proxy.$message.error('加载游记失败，请重试');
  });
};

// 保存草稿
const saveDraft = () => {
  if (!validateContent()) return;
  
  note.value.status = 0;
  saveNote();
};

// 提交发布
const submitNote = () => {
  if (!validateContent(true)) return;
  
  note.value.status = 1; // 待审核状态
  saveNote(true);
};

// 保存游记
const saveNote = (isPublish = false) => {

   // 处理 destinationIds，确保传给后端的是正确的格式
      if (note.value.destinationIds) {
        if (Array.isArray(note.value.destinationIds)) {
          // 如果是数组，取最后一个元素（最深层级的目的地）
          note.value.destinationId = note.value.destinationIds.slice(-1)[0];
        } else if (typeof note.value.destinationIds === 'number' || typeof note.value.destinationIds === 'string') {
          // 如果是数字或字符串，直接赋值
          note.value.destinationId = note.value.destinationIds;
        }
        // 清空 destinationIds，避免传给后端造成混淆
        note.value.destinationIds = null;
      }

  if(note.value.noteId)
  {
    updateTravelNotesUser(note.value).then(res => {
    if (res.code===200) {
      proxy.$message.success(isPublish ? '更新成功，等待审核' : '草稿保存成功');
      router.back();
    }
  }).catch(err => {
    console.error('更新游记失败', err);
    proxy.$message.error('更新失败，请重试');
  });
  }else{
    addTravelNotesUser(note.value).then(res => {
    if (res.code===200) {
      proxy.$message.success(isPublish ? '发布成功，等待审核' : '草稿保存成功');
      router.back();
    }
  }).catch(err => {
    console.error('保存游记失败', err);
    proxy.$message.error('保存失败，请重试');
  });
  }
};

// 内容验证
const validateContent = (isPublish = false) => {
  if (!note.value.title.trim()) {
    proxy.$message.warning('请输入游记标题');
    return false;
  }
  
  if (isPublish && !note.value.destinationIds) {
    proxy.$message.warning('请选择目的地');
    return false;
  }
  
  if (isPublish && !note.value.coverImage) {
    proxy.$message.warning('请上传至少一张封面图');
    return false;
  }
  
  if (!note.value.content.trim()) {
    proxy.$message.warning('请填写游记内容');
    return false;
  }
  
  return true;
};

// 移除图片
const removeImage = (index) => {
  const images = note.value.coverImage.split(',');
  images.splice(index, 1);
  note.value.coverImage = images.join(',');
};
</script>

<style scoped>
.travel-note-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.navbar {
  background-color: #fff;
  border-bottom: 1px solid #eee;
  padding: 12px 16px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.back-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #333;
  font-size: 16px;
  cursor: pointer;
}

.icon-arrow-left {
  display: inline-block;
  width: 20px;
  height: 20px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='15 18 9 12 15 6'%3E%3C/polyline%3E%3C/svg%3E");
}

.navbar h1 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.draft-btn {
  background-color: #f1f3f5;
  color: #495057;
}

.draft-btn:hover {
  background-color: #e9ecef;
}

.publish-btn {
  background-color: #2196f3;
  color: white;
}

.publish-btn:hover {
  background-color: #1976d2;
}

.main-content {
  flex: 1;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 20px 16px;
  box-sizing: border-box;
}

.form-group {
  margin-bottom: 24px;
  background-color: #fff;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
  font-size: 15px;
}

.title-input .title-text {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.title-input .title-text::placeholder {
  color: #adb5bd;
  font-weight: 400;
}

.title-input .title-text:focus {
  outline: none;
  border-color: #2196f3;
}

.select-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  color: #333;
  box-sizing: border-box;
  background-color: #fff;
  transition: border-color 0.2s;
}

.select-input:focus {
  outline: none;
  border-color: #2196f3;
}

.upload-container {
  margin-top: 8px;
}

.image-uploader {
  border: 2px dashed #e9ecef;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  transition: all 0.2s;
}

.image-uploader:hover {
  border-color: #2196f3;
  background-color: rgba(33, 150, 243, 0.03);
}

.upload-hint {
  margin-top: 8px;
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 0;
}

.content-editor textarea {
  width: 100%;
  padding: 16px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  box-sizing: border-box;
  resize: vertical;
  transition: border-color 0.2s;
}

.content-editor textarea:focus {
  outline: none;
  border-color: #2196f3;
}

.content-editor textarea::placeholder {
  color: #adb5bd;
}

.word-count {
  text-align: right;
  margin-top: 8px;
  font-size: 14px;
  color: #6c757d;
}

.preview-section {
  margin-top: 16px;
  background-color: #fff;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.preview-section h3 {
  margin-top: 0;
  font-size: 16px;
  color: #495057;
}

.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
}

.preview-item {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-img {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.preview-item:hover .delete-img {
  opacity: 1;
}

.icon-delete {
  display: inline-block;
  width: 16px;
  height: 16px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='3 6 5 6 21 6'%3E%3C/polyline%3E%3Cpath d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'%3E%3C/path%3E%3C/svg%3E");
}

.footer-hint {
  padding: 16px;
  text-align: center;
  font-size: 14px;
  color: #6c757d;
  border-top: 1px solid #eee;
  background-color: #fff;
}
</style>