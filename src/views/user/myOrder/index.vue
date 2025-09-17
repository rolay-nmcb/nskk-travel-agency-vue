<template>
  <div class="order-container">
    <!-- 页面标题 -->
    <div class="page-title">我的订单</div>

    <!-- 状态筛选栏 -->
    <div class="status-filter">
      <button 
        v-for="status in statusOptions" 
        :key="status.value"
        @click="handleStatusChange(status.value)"
        :class="{ active: currentStatus === status.value }"
      >
        {{ status.label }}
      </button>
    </div>

    <!-- 订单列表 -->
    <div class="order-list">
      <div v-if="filteredOrders.length === 0" class="empty-state">
        <img src="@/assets/images/empty.png" alt="暂无订单" class="empty-img">
        <p class="empty-text">暂无符合条件的订单</p>
      </div>

      <div v-for="order in filteredOrders" :key="order.orderId" class="order-card">
        <!-- 订单头部信息 -->
        <div class="order-header">
          <div class="order-id">订单号: {{ order.orderId }}</div>
          <div class="order-status" :class="getStatusClass(order.orderStatus)">
            {{ getStatusText(order.orderStatus) }}
          </div>
        </div>

        <!-- 订单基本信息 -->
        <div class="order-info">
          <div class="product-info">
            <div class="product-name">产品名称: 
               <span v-for="cat in productsList" :key="cat.productId">
                  <span v-if="cat.productId === order.productId">{{ cat.title }}</span>
                </span>
            </div>
            <div class="travel-date">出发日期: {{ order.departureDate }}</div>
            <div class="travelers">
              出行人: {{ order.adultCount }}成人 {{ order.childCount }}儿童
            </div>
          </div>
          
          <div class="contact-info">
            <div class="contact-name">联系人: {{ order.contactName }}</div>
            <div class="contact-phone">电话: {{ order.contactPhone }}</div>
          </div>
        </div>

        <!-- 订单金额信息 -->
        <div class="order-amount">
          <div class="amount-item">
            <span>总价</span>
            <span>¥{{ order.totalAmount }}</span>
          </div>
          <div class="amount-item">
            <span>优惠</span>
            <span>-¥{{ order.discountAmount }}</span>
          </div>
          <div class="amount-item total">
            <span>实付</span>
            <span>¥{{ order.paymentAmount }}</span>
          </div>
        </div>

        <!-- 订单操作按钮 -->
        <div class="order-actions">
          <button class="action-btn detail-btn" @click="showDetail(order)">
            查看详情
          </button>
          
          <!-- 动态生成操作按钮 -->
          <template v-if="order.orderStatus === 0">
            <button class="action-btn pay-btn" @click="goToPay(order)">去支付</button>
            <button class="action-btn cancel-btn" @click="showCancelReason(order)">取消订单</button>
          </template>
          
          <template v-if="order.orderStatus === 1">
            <button class="action-btn confirm-btn" @click="confirmOrder(order)">确认订单</button>
          </template>
          
          <template v-if="order.orderStatus === 2">
            <button class="action-btn change-btn" @click="showRescheduleModal(order)">改签</button>
            <button class="action-btn cancel-btn" @click="showCancelReason(order)">取消订单</button>
            <button class="action-btn complete-btn" @click="completeOrder(order)">订单完成</button>
          </template>
          
          <template v-if="order.orderStatus === 3">
            <button class="action-btn comment-btn" @click="goToComment(order)">去评价</button>
          </template>
          
          <template v-if="order.orderStatus === 5">
            <button class="action-btn cancel-btn" @click="cancelRefund(order)">取消退款</button>
          </template>
          
          <template v-if="order.orderStatus === 6">
            <button class="action-btn cancel-btn" @click="cancelReschedule(order)">取消改签</button>
          </template>
        </div>
      </div>
    </div>

    <!-- 取消原因弹窗 -->
    <el-dialog 
      title="取消原因" 
      v-model="cancelVisible" 
      width="40%"
    >
      <el-input
        type="textarea"
        v-model="cancelReason"
        placeholder="请输入取消原因"
        rows="4"
      ></el-input>
      <template #footer>
        <el-button @click="cancelVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCancel">确认取消</el-button>
      </template>
    </el-dialog>

    <!-- 改签弹窗 -->
    <el-dialog 
      title="改签日期选择" 
      v-model="rescheduleVisible" 
      width="40%"
    >
        <div class="detail-section" v-if="departureDateList && departureDateList.length > 0">
        <h3>可选出发日期</h3>
        <div class="departure-date-list">
            <el-tag 
            v-for="(date, index) in departureDateList" 
            :key="index"
            type="success" 
            class="departure-date-tag"
            >
            {{ date }}
            </el-tag>
        </div>
        </div>
      <el-input
        type="textarea"
        v-model="rescheduleReason"
        placeholder="请输入想要改签的日期以及改签原因"
        rows="4"
        style="margin-top: 15px;"
      ></el-input>
      <template #footer>
        <el-button @click="rescheduleVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReschedule">确认改签</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情弹窗 -->
    <el-dialog  
        :title="detailTitle" 
        v-model="detailVisible" 
        width="800px"
        class="order-detail-dialog"
        >
        <div class="order-detail-content" v-if="detailForm">
            <!-- 基本信息 -->
            <div class="detail-section">
            <h3>基本信息</h3>
            <div class="detail-grid">
                <div class="detail-item">
                <span class="label">订单号:</span>
                <span class="value">{{ detailForm.orderId }}</span>
                </div>
                <div class="detail-item">
                <span class="label">下单时间:</span>
                <span class="value">{{ detailForm.createdAt }}</span>
                </div>
                <div class="detail-item">
                <span class="label">订单状态:</span>
                <span class="value" :class="getStatusClass(detailForm.orderStatus)">
                    {{ getStatusText(detailForm.orderStatus) }}
                </span>
                </div>
                <div class="detail-item">
                <span class="label">出发日期:</span>
                <span class="value">{{ detailForm.departureDate }}</span>
                </div>
            </div>
            </div>

            <!-- 产品信息 -->
            <div class="detail-section">
            <h3>产品信息</h3>
            <div class="detail-grid">
                <div class="detail-item full-width">
                <span class="label">产品名称:</span>
                <span class="value">
                    <span v-for="cat in productsList" :key="cat.productId">
                    <span v-if="cat.productId === detailForm.productId">{{ cat.title }}</span>
                    </span>
                </span>
                </div>
                <div class="detail-item">
                <span class="label">成人数量:</span>
                <span class="value">{{ detailForm.adultCount }}</span>
                </div>
                <div class="detail-item">
                <span class="label">儿童数量:</span>
                <span class="value">{{ detailForm.childCount }}</span>
                </div>
            </div>
            </div>

            <!-- 联系人信息 -->
            <div class="detail-section">
            <h3>联系人信息</h3>
            <div class="detail-grid">
                <div class="detail-item">
                <span class="label">联系人:</span>
                <span class="value">{{ detailForm.contactName }}</span>
                </div>
                <div class="detail-item">
                <span class="label">联系电话:</span>
                <span class="value">{{ detailForm.contactPhone }}</span>
                </div>
                <div class="detail-item full-width">
                <span class="label">联系邮箱:</span>
                <span class="value">{{ detailForm.contactEmail }}</span>
                </div>
            </div>
            </div>

            <!-- 出行人信息 -->
            <div class="detail-section" v-if="detailForm.orderTravelers && detailForm.orderTravelers.length > 0">
            <h3>出行人信息</h3>
            <div class="traveler-list">
                <div 
                class="traveler-item" 
                v-for="(traveler, index) in detailForm.orderTravelers" 
                :key="traveler.id"
                >
                <div class="traveler-header">
                    出行人 {{ index + 1 }} ({{ traveler.isAdult === 1 ? '成人' : '儿童' }})
                </div>
                <div class="detail-grid">
                    <div class="detail-item">
                    <span class="label">姓名:</span>
                    <span class="value">{{ traveler.realName }}</span>
                    </div>
                    <div class="detail-item">
                    <span class="label">性别:</span>
                    <span class="value">{{ traveler.gender === 1 ? '男' : '女' }}</span>
                    </div>
                    <div class="detail-item">
                    <span class="label">生日:</span>
                    <span class="value">{{ traveler.birthdate }}</span>
                    </div>
                    <div class="detail-item">
                    <span class="label">护照号:</span>
                    <span class="value">{{ traveler.passportNumber }}</span>
                    </div>
                    <div class="detail-item full-width">
                    <span class="label">护照有效期:</span>
                    <span class="value">{{ traveler.passportExpiry }}</span>
                    </div>
                </div>
                </div>
            </div>
            </div>

            <!-- 支付信息 -->
            <div class="detail-section" v-if="detailForm.payments">
            <h3>支付信息</h3>
            <div class="detail-grid">
                <div class="detail-item">
                <span class="label">支付方式:</span>
                <span class="value">{{ getPaymentMethodText(detailForm.payments.paymentMethod) }}</span>
                </div>
                <div class="detail-item">
                <span class="label">支付状态:</span>
                <span class="value">{{ detailForm.payments.paymentStatus === 1 ? '已支付' : '未支付' }}</span>
                </div>
                <div class="detail-item">
                <span class="label">支付时间:</span>
                <span class="value">{{ detailForm.payments.paidAt }}</span>
                </div>
                <div class="detail-item full-width amount-info">
                <div class="amount-row">
                    <span>总金额:</span>
                    <span>¥{{ detailForm.totalAmount }}</span>
                </div>
                <div class="amount-row">
                    <span>优惠金额:</span>
                    <span>-¥{{ detailForm.discountAmount }}</span>
                </div>
                <div class="amount-row total-amount">
                    <span>实付金额:</span>
                    <span>¥{{ detailForm.paymentAmount }}</span>
                </div>
                </div>
            </div>
            </div>

            <!-- 备注信息 -->
            <div class="detail-section" v-if="detailForm.note">
            <h3>备注信息</h3>
            <div class="note-content">
                {{ detailForm.note }}
            </div>
            </div>
        </div>

        <template #footer>
            <el-button @click="detailVisible = false">关闭</el-button>
        </template>
    </el-dialog>

  </div>
</template>

<script setup name="myOrder">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCurrentInstance } from 'vue';
import { listUserOrders,changeUserOrders , cancelChangeUserOrders , cancelUserOrders ,cancelRefundUserOrders , confirmUserOrders ,completeUserOrders} from '@/api/user/userOrders';
import { getManageOrders} from "@/api/manage/manageOrders";
import {listProducts} from '@/api/manage/products';
import {getProductInventoryDate} from '@/api/manage/productInventory';
import useUserStore from '@/store/modules/user';
import { ElMessage } from 'element-plus';

const { proxy } = getCurrentInstance();
const router = useRouter();

// 状态管理
const userStore = useUserStore();
const userId = userStore.id;
const myOrderList = ref([]);
const currentStatus = ref(-1); // -1表示全部状态

// 弹窗控制
const detailVisible = ref(false);
const cancelVisible = ref(false);
const rescheduleVisible = ref(false);
const currentOrder = ref(null);
const detailTitle = ref(null);
const detailForm = ref(null);

// 表单数据
const cancelReason = ref('');
const rescheduleReason = ref('');

// 订单状态选项
const statusOptions = [
  { label: '全部订单', value: -1 },
  { label: '待支付', value: 0 },
  { label: '待确认', value: 1 },
  { label: '已确认', value: 2 },
  { label: '已完成', value: 3 },
  { label: '已取消', value: 4 },
  { label: '退款中', value: 5 },
  { label: '改签中', value: 6 },
];


// 获取筛选后的订单
const filteredOrders = computed(() => {
  if (currentStatus.value === -1) return myOrderList.value;
  return myOrderList.value.filter(order => order.orderStatus === currentStatus.value);
});

// 获取订单列表
function getMyOrderList() {
  listUserOrders({
    pageNum:1,
    pageSize: 10000,
    userId : userId
  }).then(response => {
    myOrderList.value = response.rows;
  }).catch(err => {
    ElMessage.error('获取订单列表失败');
    console.error(err);
  });
}

// 状态文本映射
function getStatusText(status) {
  const statusMap = {
    0: '待支付',
    1: '待确认',
    2: '已确认',
    3: '已完成',
    4: '已取消',
    5: '退款中',
    6: '改签中'
  };
  return statusMap[status] || '未知状态';
}

// 状态样式映射
function getStatusClass(status) {
  const classMap = {
    0: 'status-pending',
    1: 'status-paid',
    2: 'status-confirmed',
    3: 'status-completed',
    4: 'status-cancelled',
    5: 'status-refunding',
    6: 'status-rescheduling'
  };
  return classMap[status] || 'status-unknown';
}

// 添加获取支付方式文本的函数
function getPaymentMethodText(method) {
  const methodMap = {
    'wechat': '微信支付',
    'alipay': '支付宝',
    'bank': '银行转账',
    'credit': '信用卡'
  };
  return methodMap[method] || method;
}

// 切换订单状态
function handleStatusChange(status) {
  currentStatus.value = status;
}

// 查看详情
function showDetail(order) {
  const _orderId =order.orderId
  getManageOrders(_orderId).then(response => {
    detailForm.value = response.data;
    console.log(detailForm.value);
    detailVisible.value = true;
    detailTitle.value = "订单详情";
  });
}

// 显示取消原因弹窗
function showCancelReason(order) {
  currentOrder.value = order;
  cancelReason.value = '';
  cancelVisible.value = true;
}

// 确认取消订单
function confirmCancel() {
  if (!cancelReason.value.trim()) {
    ElMessage.warning('请输入取消原因');
    return;
  }
  
  cancelUserOrders({
    orderId: currentOrder.value.orderId,
    note: cancelReason.value
  }).then(() => {
    if(currentOrder.value.orderStatus === 0)
    {
        ElMessage.success('取消成功');
    }
    if(currentOrder.value.orderStatus === 2)
    {
        ElMessage.success('订单已付款,现已为您发送退款请求。可在我的订单-退款中查看详细');
    }
    cancelVisible.value = false;
    getMyOrderList(); // 重新获取订单列表
  }).catch(err => {
    ElMessage.error('取消失败,请联系客服处理');
    console.error(err);
  });
}

//可改签日期列表
const departureDateList = ref([]);

// 显示改签弹窗
function showRescheduleModal(order) {
  currentOrder.value = order;
  rescheduleReason.value = '';
  getProductInventoryDate(order.productId).then(res => {
      // 将获取到的出发日期数据存储到变量中
      departureDateList.value = res.data;
   });
  rescheduleVisible.value = true;
}


// 确认改签
function confirmReschedule() {
  
  if (!rescheduleReason.value.trim()) {
    ElMessage.warning('请输入改签日期及其原因');
    return;
  }
  
  changeUserOrders({
    orderId: currentOrder.value.orderId,
    note: rescheduleReason.value
  }).then(() => {
    ElMessage.success('改签申请已提交,可在我的订单-改签中查看');
    rescheduleVisible.value = false;
    getMyOrderList();
  }).catch(err => {
    ElMessage.error('改签申请失败');
    console.error(err);
  });
}

// 去支付
function goToPay(order) {
  router.push({
    path: '/payment',
    query: { orderId: order.orderId, paymentAmount: order.paymentAmount }
  });
}

// 确认订单
function confirmOrder(order) {
  confirmUserOrders({ orderId: order.orderId })
    .then(() => {
      ElMessage.success('订单已确认');
      getMyOrderList();
    })
    .catch(err => {
      ElMessage.error('确认失败');
      console.error(err);
    });
}

// 订单完成
function completeOrder(order) {
  completeUserOrders({ orderId: order.orderId })
    .then(() => {
      ElMessage.success('订单已标记为完成');
      getMyOrderList();
    })
    .catch(err => {
      ElMessage.error('操作失败');
      console.error(err);
    });
}

// 去评价
function goToComment(order) {
  router.push({
    path: '/comment',
    query: { userId: userId , productId: order.productId , orderId: order.orderId }
  });
}

// 取消改签
function cancelReschedule(order) {
  cancelChangeUserOrders({ orderId: order.orderId })
    .then(() => {
      ElMessage.success('已取消改签');
      getMyOrderList();
    })
    .catch(err => {
      ElMessage.error('取消失败');
      console.error(err);
    });
}

// 取消退款
function cancelRefund(order) {
  cancelRefundUserOrders({ orderId: order.orderId })
    .then(() => {
      ElMessage.success('已取消退款');
      getMyOrderList();
    })
    .catch(err => {
      ElMessage.error('取消失败');
      console.error(err);
    });
}

// 页面初始化
onMounted(() => {
  getMyOrderList();
  getProductsList();
});

// 监听状态变化重新获取数据
watch(currentStatus, () => {
  getMyOrderList();
});


//获取所有产品详细
const productsList = ref([]);
function getProductsList() {
  listProducts({
    pageNum: 1,
    pageSize: 10000
  }).then(response => {
    productsList.value = response.rows;
  });
}

</script>

<style scoped>
.order-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.status-filter {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.status-filter button {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.status-filter button.active {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #e0e0e0;
}

.order-id {
  color: #666;
  font-size: 14px;
}

.order-status {
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-paid {
  background: #d1ecf1;
  color: #0c5460;
}

.status-confirmed {
  background: #c3e6cb;
  color: #155724;
}

.status-completed {
  background: #d6d8db;
  color: #383d41;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.status-refunding {
  background: #f5d7cb;
  color: #854b2a;
}

.status-rescheduling {
  background: #d1e7dd;
  color: #0a58ca;
}

.order-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  gap: 20px;
}

.product-info, .contact-info {
  flex: 1;
}

.product-name, .travel-date, .travelers, .contact-name, .contact-phone {
  margin-bottom: 8px;
  color: #333;
}

.order-amount {
  margin-bottom: 15px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
}

.amount-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.amount-item.total {
  margin-top: 10px;
  font-weight: bold;
  color: #ff4d4f;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px dashed #e0e0e0;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-size: 14px;
  transition: all 0.2s;
}

.detail-btn {
  background: #f0f2f5;
  color: #333;
}

.pay-btn {
  background: #52c41a;
  color: white;
}

.cancel-btn {
  background: #ff4d4f;
  color: white;
}

.confirm-btn, .complete-btn {
  background: #1890ff;
  color: white;
}

.change-btn {
  background: #faad14;
  color: white;
}

.comment-btn {
  background: #722ed1;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 50px 0;
  color: #999;
}

.empty-img {
  width: 120px;
  margin-bottom: 20px;
  opacity: 0.6;
}

/* 订单详情对话框样式 */
.order-detail-dialog :deep(.el-dialog__body) {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item.full-width {
  grid-column: span 2;
}

.detail-item .label {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.detail-item .value {
  font-size: 14px;
  color: #333;
}

.detail-item .value.status-pending,
.detail-item .value.status-paid,
.detail-item .value.status-confirmed,
.detail-item .value.status-completed,
.detail-item .value.status-cancelled,
.detail-item .value.status-refunding,
.detail-item .value.status-rescheduling {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
}

.traveler-list {
  border: 1px solid #eee;
  border-radius: 6px;
  overflow: hidden;
}

.traveler-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.traveler-item:last-child {
  border-bottom: none;
}

.traveler-header {
  font-weight: 500;
  margin-bottom: 10px;
  color: #333;
  padding-bottom: 8px;
  border-bottom: 1px dashed #eee;
}

.amount-info {
  background: #f9f9f9;
  padding: 12px;
  border-radius: 4px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.amount-row.total-amount {
  font-weight: 600;
  color: #ff4d4f;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #eee;
}

.note-content {
  background: #f9f9f9;
  padding: 12px;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-item.full-width {
    grid-column: span 1;
  }
  
  .order-detail-dialog :deep(.el-dialog) {
    width: 90% !important;
  }
}
/* 出发日期列表样式 */
.departure-date-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.departure-date-tag {
  margin: 0 !important;
  font-size: 13px;
  padding: 6px 10px;
}

.departure-date-tag:first-child {
  background-color: #1890ff !important;
  border-color: #1890ff !important;
  color: white !important;
}


</style>