<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="游记标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入游记标题"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="游记状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in travel_notes_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否推荐" prop="isFeatured">
        <el-select v-model="queryParams.isFeatured" placeholder="请选择是否推荐" clearable>
          <el-option
            v-for="dict in yes_no"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['manage:travelNotesManage:add']"
        >添加官方游记</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['manage:travelNotesManage:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 游记卡片列表 -->
    <div v-loading="loading" class="travel-notes-grid">
      <div 
        v-for="note in travelNotesManageList" 
        :key="note.noteId" 
        class="travel-note-card"
      >
        <div class="note-header">
          <div class="note-id">游记ID: {{ note.noteId }}</div>
          <div class="note-actions">
            <el-button 
              link 
              type="primary" 
              icon="View" 
              @click="handleView(note)" 
              v-hasPermi="['manage:travelNotesManage:query']"
            >查看</el-button>
            <el-button 
              link 
              :type="note.isFeatured === 1 ? 'danger' : 'success'"
              :icon="note.isFeatured === 1 ? 'Star' : 'Star'"
              @click="handleFeature(note)"
              v-hasPermi="['manage:travelNotesManage:edit']"
            >
              {{ note.isFeatured === 1 ? '取消推荐' : '推荐' }}
            </el-button>
          </div>
        </div>
        
        <div class="note-content">
          <div class="cover-image">
            <!-- 使用第一张图片作为封面图 -->
            <image-preview 
              v-if="getFirstImage(note.coverImage)" 
              :src="getFirstImage(note.coverImage)" 
              :width="120" 
              :height="120"
            />
            <div v-else class="no-cover">暂无封面</div>
          </div>
          
          <div class="note-info">
            <div class="note-title">{{ note.title }}</div>
            
            <div class="user-info">
              <span class="label">作者:</span>
              <span class="value">
                {{ userList.find(item => item.userId === note.userId)?.nickName || note.userId }}
              </span>
            </div>
            
            <div class="destination-info">
              <span class="label">地点:</span>
              <span class="value">
                {{ destinationsList.find(item => item.destinationId === note.destinationId)?.name || note.destinationId }}
              </span>
            </div>
            
            <div class="note-stats">
              <div class="stat-item">
                <i class="el-icon-view"></i>
                <span>{{ note.viewCount || 0 }} 浏览</span>
              </div>
              <div class="stat-item">
                <i class="el-icon-thumb"></i>
                <span>{{ note.likeCount || 0 }} 点赞</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="note-footer">
          <div class="note-status">
            <span class="label">状态:</span>
            <dict-tag :options="travel_notes_status" :value="note.status"/>
          </div>
          
          <div class="note-featured">
            <span class="label">推荐:</span>
            <dict-tag :options="yes_no" :value="note.isFeatured"/>
          </div>
        </div>
      </div>
    </div>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

   <!-- 添加或修改游记管理对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body class="travel-note-dialog">
      <el-form ref="travelNotesManageRef" :model="form" :rules="rules" label-width="80px">
        <div class="dialog-content">
          <!-- 游记标题区域 -->
          <div class="section">
            <div class="section-title">
              <i class="el-icon-edit"></i>
              <span>游记标题</span>
            </div>
            <el-form-item prop="title">
              <el-input 
                v-model="form.title" 
                placeholder="请输入游记标题" 
                class="title-input"
                size="large"
              />
            </el-form-item>
          </div>

          <!-- 图片上传区域 -->
          <div class="section">
            <div class="section-title">
              <i class="el-icon-picture"></i>
              <span>游记图片</span>
            </div>
            <el-form-item prop="coverImage">
              <image-upload 
                v-model="form.coverImage" 
                :limit="10" 
                class="image-uploader"
              />
              <div class="upload-tip">最多可上传10张图片，第一张将作为封面图</div>
            </el-form-item>
          </div>

          <!-- 游记内容区域 -->
          <div class="section">
            <div class="section-title">
              <i class="el-icon-document"></i>
              <span>游记内容</span>
            </div>
            <el-form-item prop="content">
              <editor 
                v-model="form.content" 
                :min-height="300" 
                class="content-editor"
              />
            </el-form-item>
          </div>

          <!-- 基本信息区域 -->
          <div class="section">
            <div class="section-title">
              <i class="el-icon-info"></i>
              <span>基本信息</span>
            </div>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="用户ID" prop="userId">
                  <el-input 
                    v-model="form.userId" 
                    disabled 
                    placeholder="系统默认为1"
                  />
                  <div class="form-tip">系统默认用户ID为1（官方账号）</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="目的地ID" prop="destinationId">
                  <el-input 
                    v-model="form.destinationId" 
                    placeholder="请输入目的地ID"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="浏览数" prop="viewCount">
                  <el-input 
                    v-model="form.viewCount" 
                    placeholder="请输入浏览数"
                    type="number"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="点赞数" prop="likeCount">
                  <el-input 
                    v-model="form.likeCount" 
                    placeholder="请输入点赞数"
                    type="number"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="是否推荐" prop="isFeatured">
                  <el-radio-group v-model="form.isFeatured">
                    <el-radio
                      v-for="dict in yes_no"
                      :key="dict.value"
                      :label="parseInt(dict.value)"
                    >{{dict.label}}</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="状态" prop="status">
                  <el-input 
                    v-model="form.status" 
                    disabled 
                    placeholder="系统默认为审核通过"
                  />
                  <div class="form-tip">系统默认状态为审核通过</div>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" @click="submitForm">发 布</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看文章内容对话框 -->
    <el-dialog 
      title="游记详情" 
      v-model="viewOpen" 
      width="800px" 
      append-to-body
      class="article-view-dialog"
    >
      <div class="article-content">
        <!-- 文章标题 -->
        <h1 class="article-title">{{ viewForm.title }}</h1>
        
        <!-- 文章元信息 -->
        <div class="article-meta">
          <div class="meta-item">
            <i class="el-icon-user"></i>
            <span>作者: {{ userList.find(item => item.userId === viewForm.userId)?.nickName || viewForm.userId }}</span>
          </div>
          <div class="meta-item">
            <i class="el-icon-location"></i>
            <span>地点: {{ destinationsList.find(item => item.destinationId === viewForm.destinationId)?.name || viewForm.destinationId }}</span>
          </div>
          <div class="meta-item">
            <i class="el-icon-time"></i>
            <span>创建时间: {{ parseTime(viewForm.createdAt) }}</span>
          </div>
          <div class="meta-item">
            <i class="el-icon-view"></i>
            <span>浏览: {{ viewForm.viewCount || 0 }}</span>
          </div>
          <div class="meta-item">
            <i class="el-icon-thumb"></i>
            <span>点赞: {{ viewForm.likeCount || 0 }}</span>
          </div>
        </div>
        
        <!-- 图片走马灯 -->
        <div class="article-images" v-if="getImageList(viewForm.coverImage) && getImageList(viewForm.coverImage).length > 0">
          <el-carousel 
            height="400px" 
            indicator-position="outside"
            arrow="always"
          >
            <el-carousel-item 
              v-for="(image, index) in getImageList(viewForm.coverImage)" 
              :key="index"
            >
              <div class="carousel-image-container">
                <el-image
                  :src="image"
                  fit="cover"
                  class="carousel-image"
                  :preview-src-list="getImageList(viewForm.coverImage)"
                  :initial-index="index"
                  :preview-teleported="true"
                />
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>
        
        <!-- 文章内容 -->
        <div class="article-body" v-html="viewForm.content"></div>
        
        <!-- 文章状态 -->
        <div class="article-status">
          <span class="label">状态:</span>
          <dict-tag :options="travel_notes_status" :value="viewForm.status"/>
          <span class="label ml-20">推荐:</span>
          <dict-tag :options="yes_no" :value="viewForm.isFeatured"/>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelView">取 消</el-button>
          <el-button 
            v-if="viewForm.status === 1 || viewForm.status === 3" 
            type="success" 
            @click="handleApprove"
          >审核通过</el-button>
          <el-button 
            v-if="viewForm.status === 1 || viewForm.status === 3" 
            type="warning" 
            @click="handleRemove"
          >审核不通过</el-button>
          <el-button 
            v-if="viewForm.status === 2" 
            type="warning" 
            @click="handleRemove"
          >文章下架</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="TravelNotesManage">
import { listTravelNotesManage, getTravelNotesManage, delTravelNotesManage, addTravelNotesManage, updateTravelNotesManage } from "@/api/manage/travelNotesManage";
import {listDestinations} from "@/api/manage/destinations";
import {listUserManage} from "@/api/manage/userManage"
import {loadAllParams} from "@/api/page";
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'

const { proxy } = getCurrentInstance();
const { travel_notes_status, yes_no } = proxy.useDict('travel_notes_status', 'yes_no');

const travelNotesManageList = ref([]);
const open = ref(false);
const viewOpen = ref(false); // 控制查看对话框显示
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  viewForm: {}, // 查看表单数据
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userId: null,
    title: null,
    destinationId: null,
    status: null,
    isFeatured: null,
  },
  rules: {
    title: [
      { required: true, message: "游记标题不能为空", trigger: "blur" }
    ],
    coverImage: [
      { required: true, message: "图片不能为空", trigger: "blur" }
    ],
    content: [
      { required: true, message: "游记内容不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, viewForm, rules } = toRefs(data);


// 获取路由实例
const route = useRoute()
const router = useRouter()

// 监听路由变化并在组件加载时检查查询参数
onMounted(() => {
  // 检查路由中是否有 orderId 查询参数
  if (route.query.userId) {
    // 设置查询参数并执行查询
    queryParams.value.userId = route.query.userId
    handleQuery()
    
  }
})

// 使用 immediate 和 deep 选项增强监听
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery && newQuery.userId) {
      queryParams.value.userId = newQuery.userId
      handleQuery()
    } else if (newQuery && newQuery.userId === undefined) {
      // 当 userId 被移除时，重置查询
      queryParams.value.userId = null
      handleQuery()
    }
  },
  { immediate: true, deep: true }
)

/** 查询游记管理列表 */
function getList() {
  loading.value = true;
  listTravelNotesManage(queryParams.value).then(response => {
    travelNotesManageList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    noteId: null,
    userId: 1, // 默认用户ID为1
    title: null,
    content: null,
    coverImage: null,
    destinationId: null,
    status: 2, // 默认状态为审核通过
    viewCount: 0,
    likeCount: 0,
    isFeatured: 0,
    createdAt: null,
    updatedAt: null
  };
  proxy.resetForm("travelNotesManageRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    userId: null,
    title: null,
    destinationId: null,
    status: null,
    isFeatured: null
  };
  
  // 清除路由参数
  if (route.query.userId) {
    router.replace({ query: {} });
  }
  
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.noteId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加官方游记";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _noteId = row.noteId || ids.value
  getTravelNotesManage(_noteId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改游记管理";
  });
}

/** 查看文章内容 */
function handleView(row) {
  getTravelNotesManage(row.noteId).then(response => {
    viewForm.value = response.data;
    viewOpen.value = true;
  });
}

/** 取消查看 */
function cancelView() {
  viewOpen.value = false;
}

/** 推荐/取消推荐操作 */
function handleFeature(row) {
  const action = row.isFeatured === 1 ? '取消推荐' : '推荐';
  proxy.$modal.confirm(`确认${action}该游记？`).then(() => {
    const updateData = {
      noteId: row.noteId,
      isFeatured: row.isFeatured === 1 ? 0 : 1  // 切换推荐状态
    };
    
    return updateTravelNotesManage(updateData);
  }).then(() => {
    proxy.$modal.msgSuccess(`${action}成功`);
    getList(); // 重新加载列表数据
  }).catch(() => {});
}

/** 审核通过 */
function handleApprove() {
  proxy.$modal.confirm('确认审核通过该游记？').then(() => {
    const updateData = {
      noteId: viewForm.value.noteId,
      status: 2  // 审核通过状态
    };
    
    return updateTravelNotesManage(updateData);
  }).then(() => {
    proxy.$modal.msgSuccess("审核通过成功");
    viewOpen.value = false;
    getList(); // 重新加载列表数据
  }).catch(() => {});
}

/** 文章下架 */
function handleRemove() {
  proxy.$modal.confirm('确认下架该游记？').then(() => {
    const updateData = {
      noteId: viewForm.value.noteId,
      status: 3  // 驳回状态
    };
    
    return updateTravelNotesManage(updateData);
  }).then(() => {
    proxy.$modal.msgSuccess("下架成功");
    viewOpen.value = false;
    getList(); // 重新加载列表数据
  }).catch(() => {});
}

/** 提交按钮 */
/** 提交按钮 */
function submitForm() {
  proxy.$refs["travelNotesManageRef"].validate(valid => {
    if (valid) {
      // 确保默认值设置正确
      form.value.userId = 1;  // 改回1
      form.value.status = 2;
      
      if (form.value.noteId != null) {
        updateTravelNotesManage(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addTravelNotesManage(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _noteIds = row.noteId || ids.value;
  proxy.$modal.confirm('是否确认删除游记管理编号为"' + _noteIds + '"的数据项？').then(function() {
    return delTravelNotesManage(_noteIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/travelNotesManage/export', {
    ...queryParams.value
  }, `travelNotesManage_${new Date().getTime()}.xlsx`)
}

// 获取第一张图片作为封面图
function getFirstImage(coverImage) {
  if (!coverImage) return null;
  
  // 如果是字符串，按逗号分割并返回第一张图片
  if (typeof coverImage === 'string') {
    // 处理逗号分隔的多张图片
    if (coverImage.includes(',')) {
      const imageList = coverImage.split(',');
      return imageList.length > 0 ? imageList[0].trim() : null;
    }
    // 单张图片直接返回
    return coverImage.trim();
  }
  
  return null;
}

// 获取图片列表
function getImageList(coverImage) {
  if (!coverImage) return [];
  
  // 如果是字符串，按逗号分割
  if (typeof coverImage === 'string') {
    return coverImage.split(',').filter(url => url.trim() !== '');
  }
  
  return [];
}

const destinationsList = ref([]);
//获取目的地列表
function getDestinationsList() {
  listDestinations({loadAllParams}).then(response => {
    destinationsList.value = response.data;
  });
}

const userList = ref([]);
//获取用户列表
function getUserList() {
  listUserManage({loadAllParams}).then(response => {
    userList.value = response.rows;
  });
}

getList();
getDestinationsList();
getUserList();
</script>

<style scoped>
.travel-notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.travel-note-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  background-color: #fff;
  overflow: hidden;
}

.travel-note-card:hover {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #f8f9fa;
}

.note-id {
  font-size: 14px;
  color: #909399;
  font-weight: 500;
}

.note-actions {
  display: flex;
  gap: 10px;
}

.note-content {
  display: flex;
  padding: 20px;
  gap: 20px;
}

.cover-image {
  flex-shrink: 0;
}

.cover-image .no-cover {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #909399;
  font-size: 12px;
}

.note-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.note-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  margin-bottom: 5px;
}

.user-info,
.destination-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.label {
  color: #606266;
  font-weight: 500;
}

.value {
  color: #303133;
}

.note-stats {
  display: flex;
  gap: 20px;
  margin-top: 5px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #606266;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.note-status,
.note-featured {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.note-status .label,
.note-featured .label {
  color: #606266;
  font-weight: 500;
}

@media (max-width: 768px) {
  .travel-notes-grid {
    grid-template-columns: 1fr;
  }
  
  .note-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .note-info {
    align-items: center;
  }
  
  .user-info,
  .destination-info {
    justify-content: center;
  }
  
  .note-stats {
    justify-content: center;
  }
  
  .note-footer {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}

/* 文章查看对话框样式 */
.article-view-dialog {
  min-height: 500px;
}

.article-content {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.article-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 20px;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  padding: 15px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 走马灯样式 */
.article-images {
  margin: 20px 0;
  border-radius: 8px;
  overflow: hidden;
}

.carousel-image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-body {
  margin: 20px 0;
  line-height: 1.8;
  font-size: 16px;
  color: #333;
}

.article-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 10px 0;
}

.article-body :deep(p) {
  margin: 10px 0;
  text-align: justify;
}

.article-status {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-top: 20px;
}

.ml-20 {
  margin-left: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
}

/* 美化后的游记对话框样式 */
.travel-note-dialog {
  min-height: 500px;
}

.dialog-content {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.section {
  margin-bottom: 25px;
  padding: 15px;
  border-radius: 8px;
  background-color: #fafafa;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.title-input {
  font-size: 18px;
  font-weight: 500;
}

.image-uploader {
  width: 100%;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.content-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 3px;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>