<template>
  <div class="app-container">
    <!-- 搜索表单保持不变 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="产品ID" prop="productId">
        <el-input
          v-model="queryParams.productId"
          placeholder="请输入产品ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单ID" prop="orderId">
        <el-input
          v-model="queryParams.orderId"
          placeholder="请输入订单ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in review_status"
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
      <!-- <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['manage:reviewsManage:add']"
        >新增</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['manage:reviewsManage:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 美化后的评价列表 -->
    <div v-loading="loading" class="reviews-grid">
      <div 
        v-for="review in reviewsManageList" 
        :key="review.reviewId" 
        class="review-card"
      >
        <div class="review-header">
          <div class="review-basic-info">
            <div class="review-id">评价编号: {{ review.reviewId }}</div>
            <div class="user-product-info">
              <span>订单: {{ review.orderId }}</span>
              <span>用户: {{ review.userId }}</span>
              <span>产品名称: 
                <span v-for="product in productList" :key="product.productId">
                    <span v-if="product.productId === review.productId">{{ product.title }}</span>
                </span>
              </span>
            </div>
          </div>
          <div class="review-actions">
            <el-button 
              link 
              type="primary" 
              icon="Edit" 
              @click="handleView(review)" 
              v-hasPermi="['manage:reviewsManage:query']"
            >查看评价详细</el-button>
          </div>
        </div>
        
        <div class="review-content">
          <div class="review-title">{{ review.title }}</div>
          
          <div class="review-rating">
            <div class="rating-item">
              <span class="rating-label">总体评分:</span>
              <el-rate
                :model-value="review.overallRating"
                disabled
                :max="5"
              />
              <span class="rating-value">{{ review.overallRating }}分</span>
            </div>
          </div>
          
          <div class="review-meta">
            <div class="meta-item status">
              <span class="meta-label">状态:</span>
              <dict-tag :options="review_status" :value="review.status"/>
            </div>
            <div class="meta-item">
              <span class="meta-label">有用数:</span>
              <span>{{ review.likeCount }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">创建时间:</span>
              <span>{{ parseTime(review.createdAt, '{y}-{m}-{d}') }}</span>
            </div>
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


      <!-- 查看产品评价详情对话框 -->
      <el-dialog :title="title" v-model="open" width="800px" append-to-body>
        <el-form ref="reviewsManageRef" :model="form" label-width="100px" class="view-form enhanced-dialog">
          <!-- 核心评价信息区域 -->
          <div class="core-review-section">
            <div class="review-title-section">
              <div class="section-label">评价标题</div>
              <div class="review-title">{{ form.title || '无标题' }}</div>
            </div>
            
            <div class="review-content-section">
              <div class="section-label">评价内容</div>
              <div class="form-text content-view" v-html="form.content || '无内容'"></div>
            </div>
            
            <div class="review-ratings-section">
              <div class="section-label">各项评分</div>
              <div class="ratings-grid">
                <!-- <div class="rating-item">
                  <span class="rating-label">总体评分</span>
                  <div class="rating-display">
                    <el-rate
                      v-model="form.overallRating"
                      disabled
                      :max="5"
                    />
                    <span class="rating-value">{{ form.overallRating }}分</span>
                  </div>
                </div> -->
                
                <div class="rating-item">
                  <span class="rating-label">服务评分</span>
                  <div class="rating-display">
                    <el-rate
                      v-model="form.serviceRating"
                      disabled
                      :max="5"
                    />
                    <span class="rating-value">{{ form.serviceRating }}分</span>
                  </div>
                </div>
                
                <div class="rating-item">
                  <span class="rating-label">行程安排</span>
                  <div class="rating-display">
                    <el-rate
                      v-model="form.itineraryRating"
                      disabled
                      :max="5"
                    />
                    <span class="rating-value">{{ form.itineraryRating }}分</span>
                  </div>
                </div>
                
                <div class="rating-item">
                  <span class="rating-label">住宿评分</span>
                  <div class="rating-display">
                    <el-rate
                      v-model="form.accommodationRating"
                      disabled
                      :max="5"
                    />
                    <span class="rating-value">{{ form.accommodationRating }}分</span>
                  </div>
                </div>
                
                <div class="rating-item">
                  <span class="rating-label">餐饮评分</span>
                  <div class="rating-display">
                    <el-rate
                      v-model="form.foodRating"
                      disabled
                      :max="5"
                    />
                    <span class="rating-value">{{ form.foodRating }}分</span>
                  </div>
                </div>
                
                <div class="rating-item">
                  <span class="rating-label">交通评分</span>
                  <div class="rating-display">
                    <el-rate
                      v-model="form.transportationRating"
                      disabled
                      :max="5"
                    />
                    <span class="rating-value">{{ form.transportationRating }}分</span>
                  </div>
                </div>
                
                <div class="rating-item">
                  <span class="rating-label">导游评分</span>
                  <div class="rating-display">
                    <el-rate
                      v-model="form.guideRating"
                      disabled
                      :max="5"
                    />
                    <span class="rating-value">{{ form.guideRating }}分</span>
                  </div>
                </div>
                
                <div class="rating-item">
                  <span class="rating-label">性价比评分</span>
                  <div class="rating-display">
                    <el-rate
                      v-model="form.valueForMoneyRating"
                      disabled
                      :max="5"
                    />
                    <span class="rating-value">{{ form.valueForMoneyRating }}分</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="review-images-section">
              <div class="section-label">评价图片</div>
              <div v-if="form.imageUrls" class="image-preview">
                <el-image
                  v-for="(url, index) in form.imageUrls.split(',')"
                  :key="index"
                  :src="url"
                  class="preview-image"
                  :preview-src-list="form.imageUrls.split(',')"
                  fit="cover"
                  :preview-teleported="true"
                />
              </div>
              <div v-else class="no-images">暂无图片</div>
            </div>
          </div>
          
          <!-- 基本信息区域 -->
          <div class="basic-info-section">
            <div class="section-title">基本信息</div>
            
            <el-row>
              <el-col :span="12">
                <el-form-item label="评价ID:">
                  <span class="form-text">{{ form.reviewId }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="用户ID:">
                  <span class="form-text">{{ form.userId }}</span>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row>
              <el-col :span="12">
                <el-form-item label="产品名称:">
                  <span class="form-text">
                    <span v-for="product in productList" :key="product.productId">
                      <span v-if="product.productId === form.productId">{{ product.title }}</span>
                    </span>
                  </span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="订单ID:">
                  <span class="form-text">{{ form.orderId }}</span>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row>
              <el-col :span="12">
                <el-form-item label="有用数:">
                  <span class="form-text">{{ form.likeCount }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否匿名:">
                  <span class="form-text">{{ form.isAnonymous ? '是' : '否' }}</span>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="状态:">
              <dict-tag :options="review_status" :value="form.status"/>
            </el-form-item>
            
            <el-form-item label="创建时间:">
              <span class="form-text">{{ parseTime(form.createdAt) }}</span>
            </el-form-item>
          </div>
          
          <!-- 商家回复区域 -->
          <div class="reply-section">
            <div class="section-title">商家回复</div>
            <el-form-item label-width="0">
              <div v-if="form.replyContent" class="reply-content" v-html="form.replyContent"></div>
              <div v-else class="no-reply">暂无回复</div>
              <div v-if="form.repliedAt" class="reply-time">回复时间: {{ parseTime(form.repliedAt) }}</div>
            </el-form-item>
          </div>
        </el-form>
        
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="cancel">取 消</el-button>
            <el-button type="primary" @click="handleReply">回复顾客</el-button>
            <el-button 
              v-if="form.status === 0 || form.status === 2"
              type="success" 
              @click="handleApprove"
            >审核通过</el-button>
            <el-button 
              v-if="form.status === 0" 
              type="warning" 
              @click="handleRemove"
            >审核驳回</el-button>
            <el-button 
              v-if="form.status === 1" 
              type="success" 
              @click="handleRemove"
            >下架评论</el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 商家回复对话框 -->
      <el-dialog title="商家回复" v-model="replyOpen" width="500px" append-to-body>
        <el-form ref="replyFormRef" :model="replyForm" label-width="80px">
          <el-form-item label="回复内容" prop="replyContent">
            <el-input
              v-model="replyForm.replyContent"
              type="textarea"
              :rows="4"
              placeholder="请输入回复内容"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="cancelReply">取 消</el-button>
            <el-button type="primary" @click="submitReply">回 复</el-button>
          </div>
        </template>
      </el-dialog>


  </div>
</template>

<script setup name="ReviewsManage">
import { listReviewsManage, getReviewsManage, delReviewsManage, addReviewsManage, updateReviewsManage } from "@/api/manage/reviewsManage";
import {listProducts} from "@/api/manage/products";
import {loadAllParams} from "@/api/page"
import { useRoute } from 'vue-router'

const { proxy } = getCurrentInstance();
const { review_status } = proxy.useDict('review_status');

const reviewsManageList = ref([]);
const open = ref(false);
const replyOpen = ref(false); // 控制回复对话框显示
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  replyForm: {
    reviewId: null,
    replyContent: '',
    replyAt:null
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userId: null,
    productId: null,
    orderId: null,
    overallRating: null,
    serviceRating: null,
    itineraryRating: null,
    accommodationRating: null,
    foodRating: null,
    transportationRating: null,
    guideRating: null,
    valueForMoneyRating: null,
    isAnonymous: null,
    status: null,
  },
  rules: {
    userId: [
      { required: true, message: "用户ID不能为空", trigger: "blur" }
    ],
    productId: [
      { required: true, message: "产品ID不能为空", trigger: "blur" }
    ],
    orderId: [
      { required: true, message: "订单ID不能为空", trigger: "blur" }
    ],
    overallRating: [
      { required: true, message: "总体评分不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, replyForm, rules } = toRefs(data);


// 获取路由实例
const route = useRoute()

// 监听路由变化并在组件加载时检查查询参数
onMounted(() => {
  // 检查路由中是否有 orderId 查询参数
  if (route.query.orderId) {
    // 设置查询参数并执行查询
    queryParams.value.orderId = route.query.orderId
    handleQuery()
  }
  if(route.query.userId){
    queryParams.value.userId = route.query.userId
    handleQuery()
  }
})

// 加强路由监听
watch(
  () => route.query,
  (newQuery) => {
    // 检查 orderId 变化
    if (newQuery.orderId) {
      queryParams.value.orderId = newQuery.orderId;
      handleQuery();
    }
    
    // 检查 userId 变化
    if (newQuery.userId) {
      queryParams.value.userId = newQuery.userId;
      handleQuery();
    }
    
    // 处理参数被移除的情况
    if (newQuery.orderId === undefined && queryParams.value.orderId) {
      queryParams.value.orderId = null;
      handleQuery();
    }
    
    if (newQuery.userId === undefined && queryParams.value.userId) {
      queryParams.value.userId = null;
      handleQuery();
    }
  },
  { immediate: true, deep: true }
)

/** 查询产品评价列表 */
function getList() {
  loading.value = true;
  listReviewsManage(queryParams.value).then(response => {
    reviewsManageList.value = response.rows;
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
    reviewId: null,
    userId: null,
    productId: null,
    orderId: null,
    title: null,
    content: null,
    overallRating: null,
    serviceRating: null,
    itineraryRating: null,
    accommodationRating: null,
    foodRating: null,
    transportationRating: null,
    guideRating: null,
    valueForMoneyRating: null,
    imageUrls: null,
    isAnonymous: null,
    status: null,
    likeCount: null,
    replyContent: null,
    repliedAt: null,
    createdAt: null,
    updatedAt: null
  };
  proxy.resetForm("reviewsManageRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.reviewId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加产品评价";
}

/** 修改按钮操作 */
function handleView(row) {
  reset();
  const _reviewId = row.reviewId || ids.value
  getReviewsManage(_reviewId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "查看详情";
  });
}

// 新增处理回复按钮的方法
function handleReply() {
  // 打开回复对话框
  replyForm.value.reviewId = form.value.reviewId;
  replyForm.value.replyContent = form.value.replyContent || '';
  replyOpen.value = true;
}

// 取消回复
function cancelReply() {
  replyOpen.value = false;
  proxy.resetForm("replyFormRef");
}

// 通用的日期格式化函数
function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 提交回复
function submitReply() {
  if (!replyForm.value.replyContent) {
    proxy.$modal.msgError("回复内容不能为空");
    return;
  }
  
  const now = new Date();
  const formattedTime = formatDateTime(now);
  
  const updateData = {
    reviewId: replyForm.value.reviewId,
    replyContent: replyForm.value.replyContent,
    repliedAt: formattedTime,
  };
  
  updateReviewsManage(updateData).then(response => {
    proxy.$modal.msgSuccess("回复成功");
    replyOpen.value = false;
    // 更新主表单中的回复内容
    form.value.replyContent = replyForm.value.replyContent;
    form.value.repliedAt = formattedTime; // 更新回复时间
    getList(); // 重新加载列表数据
  }).catch(() => {
    proxy.$modal.msgError("回复失败");
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["reviewsManageRef"].validate(valid => {
    if (valid) {
      if (form.value.reviewId != null) {
        updateReviewsManage(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addReviewsManage(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

// 新增处理审核通过的方法
function handleApprove() {
  proxy.$modal.confirm('确认审核通过该评价？').then(() => {
    // 创建更新数据对象，只更新状态为已审核(假设1为已审核状态)
    const updateData = {
      reviewId: form.value.reviewId,
      status: 1  // 假设1代表已审核状态
    };
    
    return updateReviewsManage(updateData);
  }).then(() => {
    proxy.$modal.msgSuccess("审核通过成功");
    open.value = false;
    getList(); // 重新加载列表数据
  }).catch(() => {});
}

// 新增处理审核驳回（下架）的方法
function handleRemove() {
  proxy.$modal.confirm('确认驳回评价（下架）该评价？').then(() => {
    // 创建更新数据对象，只更新状态为审核未通过
    const updateData = {
      reviewId: form.value.reviewId,
      status: 2  // 假设2代表审核未通过状态
    };
    
    return updateReviewsManage(updateData);
  }).then(() => {
    proxy.$modal.msgSuccess("审核通过成功");
    open.value = false;
    getList(); // 重新加载列表数据
  }).catch(() => {});
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _reviewIds = row.reviewId || ids.value;
  proxy.$modal.confirm('是否确认删除产品评价编号为"' + _reviewIds + '"的数据项？').then(function() {
    return delReviewsManage(_reviewIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/reviewsManage/export', {
    ...queryParams.value
  }, `reviewsManage_${new Date().getTime()}.xlsx`)
}

const productList = ref([])
//获取产品列表
function getProductList() {
  listProducts(loadAllParams).then(response => {
    productList.value = response.rows;
  })
}

getList();
getProductList();
</script>

<style scoped>
.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.review-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  background-color: #fff;
}

.review-card:hover {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.review-basic-info {
  flex: 1;
}

.review-id {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.user-product-info {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 13px;
  color: #606266;
}

.user-product-info span {
  background-color: #f5f7fa;
  padding: 2px 8px;
  border-radius: 10px;
}

.review-actions {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.review-content {
  padding: 15px;
}

.review-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 15px;
  line-height: 1.4;
}

.review-rating {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.rating-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.rating-value {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.review-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 13px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.meta-label {
  color: #606266;
  font-weight: 500;
}

.meta-item.status :deep(.el-tag) {
  margin-left: 0;
}

@media (max-width: 768px) {
  .reviews-grid {
    grid-template-columns: 1fr;
  }
  
  .review-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .review-actions {
    flex-direction: row;
    justify-content: flex-end;
    width: 100%;
  }
  
  .review-meta {
    flex-direction: column;
    gap: 8px;
  }
}

.view-form {
  padding: 20px;
}

.view-form .el-form-item {
  margin-bottom: 18px;
}

.form-text {
  color: #606266;
  font-size: 14px;
}

.content-view {
  min-height: 60px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating-value {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.image-preview {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.preview-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  cursor: pointer;
}

.reply-section :deep(.el-form-item__content) {
  flex-direction: column;
  align-items: flex-start;
}

.reply-content {
  width: 100%;
  min-height: 60px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  margin-bottom: 10px;
}

.no-reply {
  color: #909399;
  font-style: italic;
}

.reply-time {
  color: #909399;
  font-size: 13px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 20px 20px;
}

/* 新增的美化样式 */
.enhanced-dialog {
  padding: 0;
}

.core-review-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.section-label {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 4px solid #409EFF;
}

.review-title-enhanced {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  padding: 15px;
  background: #fff;
  border-radius: 6px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.content-view-enhanced {
  min-height: 100px;
  padding: 15px;
  background: #fff;
  border-radius: 6px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.review-ratings-section {
  margin-bottom: 20px;
}

.ratings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.rating-item-enhanced {
  background: #fff;
  padding: 12px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.rating-label-enhanced {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.rating-display-enhanced {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-value-enhanced {
  font-size: 14px;
  font-weight: 600;
  color: #409EFF;
}

.review-images-section {
  margin-bottom: 20px;
}

.image-preview-enhanced {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.preview-image-enhanced {
  width: 100%;
  height: 100px;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s;
}

.preview-image-enhanced:hover {
  transform: scale(1.05);
}

.no-images {
  color: #999;
  font-style: italic;
  padding: 15px;
  background: #fff;
  border-radius: 6px;
}

.basic-info-section,
.reply-section-enhanced {
  padding: 15px 0;
  border-top: 1px solid #eee;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  padding-left: 8px;
  border-left: 4px solid #409EFF;
}

.reply-content-enhanced {
  width: 100%;
  min-height: 80px;
  padding: 15px;
  background-color: #fff;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.no-reply-enhanced {
  color: #909399;
  font-style: italic;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 6px;
}

.reply-time-enhanced {
  color: #909399;
  font-size: 13px;
}

.dialog-footer-enhanced {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px 0 0;
}
</style>