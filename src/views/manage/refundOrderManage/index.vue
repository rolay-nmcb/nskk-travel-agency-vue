<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <!-- <el-form-item label="用户ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item> -->
      <!-- <el-form-item label="产品ID" prop="productId">
        <el-input
          v-model="queryParams.productId"
          placeholder="请输入产品ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item> -->
       <el-form-item label="订单号" prop="orderId">
        <el-input
          v-model="queryParams.orderId"
          placeholder="请输入订单号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="出发日期" prop="departureDate">
        <el-tooltip content="若非旅行服务出发日期代表但不限于使用日期，签发日期等" placement="top">
          <el-icon style="margin-right: 5px; color: #409EFF; cursor: pointer;"><QuestionFilled /></el-icon>
        </el-tooltip>
        <el-date-picker clearable
          v-model="queryParams.departureDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择出发日期">
        </el-date-picker>
      </el-form-item> -->

      <!-- <el-form-item label="订单状态" prop="orderStatus">
        <el-select v-model="queryParams.orderStatus" placeholder="请选择订单状态" clearable>
          <el-option
            v-for="dict in order_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item> -->
      <el-form-item label="联系人" prop="contactName">
        <el-input
          v-model="queryParams.contactName"
          placeholder="请输入联系人"
          clearable
          @keyup.enter="handleQuery"
        />
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
          v-hasPermi="['manage:manageOrders:add']"
        >新增</el-button>
      </el-col> -->
      <!-- <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['manage:manageOrders:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['manage:manageOrders:remove']"
        >删除</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['manage:manageOrders:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="manageOrdersList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="订单号" align="center" prop="orderId" />
      <el-table-column label="用户编号" align="center" prop="userId" />
      <el-table-column label="产品名称" align="center" prop="productId" >
        <template #default="scope">
          <span>{{ productsList.find(item => item.productId === scope.row.productId)?.title || scope.row.productId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="出发日期" align="center" prop="departureDate" width="180">
        <template #header>
          <span>出发日期</span>
          <el-tooltip content="若非旅行服务出发日期代表但不限于使用日期，签发日期等" placement="top">
            <el-icon style="margin-left: 5px; color: #409EFF; cursor: pointer;"><QuestionFilled /></el-icon>
          </el-tooltip>
        </template>
        <template #default="scope">
          <span>{{ parseTime(scope.row.departureDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="订单状态" align="center" prop="orderStatus">
        <template #default="scope">
          <dict-tag :options="order_status" :value="scope.row.orderStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createdAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="退款原因" align="center" prop="note" show-overflow-tooltip/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <!-- <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['manage:manageOrders:edit']">修改</el-button> -->
          <el-button link type="primary" icon="View" @click="handleView(scope.row)" v-hasPermi="['manage:manageOrders:query']">查看订单详细</el-button>
          <el-button link type="primary" icon="Wallet" @click="handleRefund(scope.row)" v-hasPermi="['manage:manageOrders:edit']">处理退款</el-button>
          <!-- <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['manage:manageOrders:remove']">删除</el-button> -->
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改订单管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="manageOrdersRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="订单号" prop="orderId">
          <el-input v-model="form.orderId" readonly />
        </el-form-item>
        <el-form-item label="支付金额" prop="paymentAmount">
          <el-input v-model="form.paymentAmount" readonly />
        </el-form-item>
        <el-form-item label="支付方式" prop="paymentMethod">
          <el-input v-model="form.payments.paymentMethod" readonly />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleRejectRefund">驳回退款请求</el-button>
          <el-button type="primary" @click="handleApproveRefund">同意退款请求</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>


    <!-- 查看详情对话框 -->
    <el-dialog :title="detailTitle" v-model="detailOpen" width="600px" append-to-body>
      <el-card :class="['order-detail-card', getOrderStatusClass(detailForm.orderStatus)]">
        <div class="order-header">
          <div class="order-title">
            <h3>订单详情 #{{ detailForm.orderId }}</h3>
            <dict-tag :options="order_status" :value="detailForm.orderStatus" style="margin-left: 15px;" />
          </div>
          <div class="order-meta">
            <span>创建时间: {{ parseTime(detailForm.createdAt, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          </div>
        </div>
        
        <el-divider></el-divider>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">用户ID:</span>
              <span class="info-value">{{ detailForm.userId }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">产品名称:</span>
              <span class="info-value">
                  {{ productsList.find(item => item.productId === detailForm.productId)?.title || detailForm.productId }}
              </span>
            </div>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">出发日期:</span>
              <span class="info-value">{{ parseTime(detailForm.departureDate, '{y}-{m}-{d}') }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">联系人:</span>
              <span class="info-value">{{ detailForm.contactName }}</span>
            </div>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">联系电话:</span>
              <span class="info-value">{{ detailForm.contactPhone }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">联系邮箱:</span>
              <span class="info-value">{{ detailForm.contactEmail || '-' }}</span>
            </div>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">成人数:</span>
              <span class="info-value">{{ detailForm.adultCount || 0 }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">儿童数:</span>
              <span class="info-value">{{ detailForm.childCount || 0 }}</span>
            </div>
          </el-col>
        </el-row>
        
        <el-divider></el-divider>
        <div class="price-section">
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <span class="info-label">订单总额:</span>
                <span class="info-value price">¥{{ detailForm.totalAmount }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <span class="info-label">优惠金额:</span>
                <span class="info-value price discount">-¥{{ detailForm.discountAmount || 0 }}</span>
              </div>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <span class="info-label">支付金额:</span>
                <span class="info-value price final">¥{{ detailForm.paymentAmount }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <span class="info-label">支付方式:</span>
                <span class="info-value">{{ detailForm.payments?.paymentMethod || '-' }}</span>
              </div>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <span class="info-label">支付时间:</span>
                <span class="info-value">{{ detailForm.payments?.paidAt ? parseTime(detailForm.payments.paidAt, '{y}-{m}-{d} {h}:{i}:{s}') : '-' }}</span>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 在价格部分和备注部分之间添加出行人信息 -->
        <el-divider></el-divider>

        <div class="travelers-section">
          <h4>出行人信息</h4>
          <el-table :data="detailForm.orderTravelers" style="width: 100%; margin-top: 15px;" border>
            <el-table-column label="姓名" prop="realName" align="center"></el-table-column>
            <el-table-column label="类型" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.isAdult === 1 ? 'primary' : 'success'">
                  {{ scope.row.isAdult === 1 ? '成人' : '儿童' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="性别" align="center">
              <template #default="scope">
                <span>{{ scope.row.gender === 1 ? '男' : '女' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="出生日期" prop="birthdate" align="center">
              <template #default="scope">
                <span>{{ scope.row.birthdate || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="护照号" prop="passportNumber" align="center">
              <template #default="scope">
                <span>{{ scope.row.passportNumber || '-' }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <el-divider></el-divider>
        
        <div class="note-section">
          <div class="info-item">
            <span class="info-label">退款原因:</span>
            <span class="info-value">{{ detailForm.note || '无备注' }}</span>
          </div>
        </div>
      </el-card>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup name="ManageOrders">
import { listManageOrders, getManageOrders, delManageOrders, addManageOrders, updateManageOrders , refundOrder} from "@/api/manage/manageOrders";
import { QuestionFilled } from '@element-plus/icons-vue'
import {loadAllParams} from '@/api/page'
import {listProducts} from '@/api/manage/products'

const { proxy } = getCurrentInstance();
const { order_status } = proxy.useDict('order_status');

const manageOrdersList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
// 在现有的 ref 和 reactive 声明区域添加
const detailOpen = ref(false);
const detailTitle = ref("");
const detailForm = ref({});



const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userId: null,
    productId: null,
    orderId: null,
    departureDate: null,
    orderStatus: null,
    contactName: null,
  },
  rules: {
    userId: [
      { required: true, message: "用户ID不能为空", trigger: "blur" }
    ],
    productId: [
      { required: true, message: "产品ID不能为空", trigger: "blur" }
    ],
    departureDate: [
      { required: true, message: "出发日期不能为空", trigger: "blur" }
    ],
    totalAmount: [
      { required: true, message: "订单总额不能为空", trigger: "blur" }
    ],
    paymentAmount: [
      { required: true, message: "支付金额不能为空", trigger: "blur" }
    ],
    contactName: [
      { required: true, message: "联系人姓名不能为空", trigger: "blur" }
    ],
    contactPhone: [
      { required: true, message: "联系人电话不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询订单管理列表 */
function getList() {
  loading.value = true;
  queryParams.value.orderStatus = '5'
  listManageOrders(queryParams.value).then(response => {
    manageOrdersList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 查看详情按钮操作 */
function handleView(row) {
  const _orderId = row.orderId || ids.value;
  getManageOrders(_orderId).then(response => {
    detailForm.value = response.data;
    detailOpen.value = true;
    detailTitle.value = "订单详情";
  });
}

/**
 * 根据订单状态返回对应的样式类
 * @param status 订单状态
 * @returns 对应的样式类名
 */
function getOrderStatusClass(status) {
  switch (status) {
    case '0': // 假设 0 为待支付
      return 'pending';
    case '1': // 假设 1 为已支付
      return 'paid';
    case '2': // 假设 2 为已完成
      return 'completed';
    case '3': // 假设 3 为已取消
      return 'cancelled';
    default:
      return '';
  }
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    orderId: null,
    paymentAmount: null,
    payments: {
      paymentMethod: null
    }
  };
  proxy.resetForm("manageOrdersRef");
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
  ids.value = selection.map(item => item.orderId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加订单管理";
}

/** 退款按钮操作 */
function handleRefund(row) {
  reset();
  const _orderId = row.orderId || ids.value
  getManageOrders(_orderId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "订单退款";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["manageOrdersRef"].validate(valid => {
    if (valid) {
      if (form.value.orderId != null) {
        updateManageOrders(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addManageOrders(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

// 驳回退款请求
function handleRejectRefund() {
  proxy.$modal.confirm('是否确认驳回该退款请求？').then(function() {
    // 更新订单状态为已支付(1)，表示驳回退款请求
    const updateData = {
      orderId: form.value.orderId,
      orderStatus: '1'
    };
    return updateManageOrders(updateData);
  }).then(() => {
    proxy.$modal.msgSuccess("退款请求已驳回");
    open.value = false;
    getList();
  }).catch(() => {});
}

// 同意退款请求
function handleApproveRefund() {
  proxy.$modal.confirm('是否确认同意该退款请求？').then(function() {
    const orderId = form.value.orderId;
    return refundOrder(orderId);
  }).then(() => {
    proxy.$modal.msgSuccess("退款请求已同意");
    open.value = false;
    getList();
  }).catch(() => {});
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _orderIds = row.orderId || ids.value;
  proxy.$modal.confirm('是否确认删除订单管理编号为"' + _orderIds + '"的数据项？').then(function() {
    return delManageOrders(_orderIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/manageOrders/export', {
    ...queryParams.value
  }, `manageOrders_${new Date().getTime()}.xlsx`)
}

//获取所有产品详细
const productsList = ref([]);
function getProductsList() {
  listProducts(loadAllParams).then(response => {
    productsList.value = response.rows;
  });
}

//获取订单评价
function handleGetComment(row) {
  const _orderId = row.orderId || ids.value;
  //todo 到时候跳转到评价页面
  proxy.$router.push({ path: '/product/products', query: { destinationId: "13" } });
}

getList();
getProductsList();
</script>

<style scoped>
.order-detail-card {
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.order-detail-card.paid {
  border-left: 4px solid #67C23A;
}

.order-detail-card.pending {
  border-left: 4px solid #E6A23C;
}

.order-detail-card.cancelled {
  border-left: 4px solid #F56C6C;
}

.order-detail-card.completed {
  border-left: 4px solid #409EFF;
}

.order-header {
  margin-bottom: 15px;
}

.order-title {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.order-meta {
  font-size: 14px;
  color: #909399;
}

.info-item {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.info-value {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.price {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.price.discount {
  color: #F56C6C;
}

.price.final {
  color: #67C23A;
}

.price-section {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin: 15px 0;
}

.note-section .info-value {
  white-space: pre-wrap;
  line-height: 1.6;
}
</style>
