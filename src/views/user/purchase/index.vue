<template>
  <div class="order-container">
    <!-- 页面标题 -->
    <div class="page-title">创建订单</div>

    <!-- 日期选择区域 -->
    <div class="order-section">
      <h3 class="section-title">选择出行日期</h3>
      <div class="date-selector">
        <div 
          v-for="item in inventoryList" 
          :key="item.inventoryId"
          class="date-item"
          :class="{ active: selectedInventoryId === item.inventoryId }"
          @click="selectInventory(item)"
        >
          <div class="date-info">
            <div class="departure-date">{{ item.departureDate }}</div>
            <div class="price-info">
              成人价: ¥{{ item.adultPrice.toFixed(2) }} | 
              儿童价: ¥{{ item.childPrice.toFixed(2) }}
            </div>
            <div class="stock-info">
              剩余库存: {{ item.availableStock }}
            </div>
          </div>
        </div>
        <div v-if="inventoryList.length === 0" class="empty-tip">暂无可用日期</div>
      </div>
    </div>

    <!-- 出行人信息区域 -->
    <div class="order-section">
      <div class="section-header">
        <h3 class="section-title">出行人信息</h3>
        <div class="add-traveler">
          <button @click="addTraveler(1)" :disabled="totalTravelers >= selectedInventory?.availableStock">
            添加成人
          </button>
          <button @click="addTraveler(0)" :disabled="totalTravelers >= selectedInventory?.availableStock">
            添加儿童
          </button>
        </div>
      </div>
      
      <div v-if="travelers.length === 0" class="empty-tip">请至少添加一名出行人</div>
      
      <div v-for="(traveler, index) in travelers" :key="index" class="traveler-form">
        <div class="form-row">
          <div class="form-item">
            <label>姓名 <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="traveler.realName" 
              placeholder="请输入真实姓名"
              required
            >
          </div>
          <div class="form-item">
            <label>性别 <span class="required">*</span></label>
            <select v-model="traveler.gender">
              <option value="1">男</option>
              <option value="2">女</option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-item">
            <label>出生日期 <span class="required">*</span></label>
            <input 
              type="date" 
              v-model="traveler.birthdate" 
              required
            >
          </div>
          <div class="form-item">
            <label>护照号码 <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="traveler.passportNumber" 
              placeholder="请输入护照号码"
              required
            >
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-item">
            <label>护照有效期 <span class="required">*</span></label>
            <input 
              type="date" 
              v-model="traveler.passportExpiry" 
              required
            >
          </div>
          <div class="form-actions">
            <button 
              type="button" 
              class="delete-btn" 
              @click="removeTraveler(index)"
              :disabled="travelers.length <= 1"
            >
              删除
            </button>
          </div>
        </div>
        <hr>
      </div>
      
      <div v-if="selectedInventory && totalTravelers > selectedInventory.availableStock" class="error-tip">
        出行人总数不能超过剩余库存 ({{ selectedInventory.availableStock }})
      </div>
    </div>

    <!-- 优惠券选择区域 -->
    <div class="order-section">
      <h3 class="section-title">选择优惠券</h3>
      <div class="coupon-list">
        <div 
          v-for="couponUser in availableCoupons" 
          :key="couponUser.id"
          class="coupon-item"
          :class="{ selected: selectedCouponId === couponUser.id }"
          @click="selectCoupon(couponUser)"
        >
          <div class="coupon-info">
            <div class="coupon-code">{{ couponUser.code }}</div>
            <div class="coupon-desc">
              <span v-if="getCouponDetail(couponUser.couponId)?.type === 0">
                满{{ getCouponDetail(couponUser.couponId)?.minPurchase }}减{{ getCouponDetail(couponUser.couponId)?.value }}
              </span>
              <span v-else>
                {{ (getCouponDetail(couponUser.couponId)?.value * 10).toFixed(1) }}折 (满{{ getCouponDetail(couponUser.couponId)?.minPurchase }}可用)
              </span>
            </div>
            <div class="coupon-validity">有效期至: {{ couponUser.expirationTime }}</div>
          </div>
          <div class="coupon-selector">
            <input 
              type="radio" 
              name="coupon" 
              :checked="selectedCouponId === couponUser.id"
              :disabled="!isCouponUsable(couponUser)"
            >
          </div>
        </div>
        <div 
          class="coupon-item no-coupon"
          :class="{ selected: selectedCouponId === null }"
          @click="selectCoupon(null)"
        >
          不使用优惠券
        </div>
        <div v-if="availableCoupons.length === 0 && selectedCouponId !== null" class="empty-tip">
          暂无可用优惠券
        </div>
      </div>
    </div>

    <!-- 联系人信息 -->
    <div class="order-section">
      <h3 class="section-title">联系人信息</h3>
      <div class="contact-form">
        <div class="form-row">
          <div class="form-item">
            <label>联系人姓名 <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="orderInfo.contactName" 
              placeholder="请输入联系人姓名"
              required
            >
          </div>
          <div class="form-item">
            <label>联系电话 <span class="required">*</span></label>
            <input 
              type="tel" 
              v-model="orderInfo.contactPhone" 
              placeholder="请输入联系电话"
              required
            >
          </div>
        </div>
        <div class="form-row">
          <div class="form-item full-width">
            <label>联系邮箱</label>
            <input 
              type="email" 
              v-model="orderInfo.contactEmail" 
              placeholder="请输入联系邮箱"
            >
          </div>
        </div>
        <div class="form-row">
          <div class="form-item full-width">
            <label>订单备注</label>
            <textarea 
              v-model="orderInfo.note" 
              placeholder="请输入订单备注信息"
              rows="3"
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- 订单金额信息 -->
    <div class="order-summary">
      <div class="summary-item">
        <span>成人数量:</span>
        <span>{{ adultCount }}人</span>
      </div>
      <div class="summary-item">
        <span>儿童数量:</span>
        <span>{{ childCount }}人</span>
      </div>
      <div class="summary-item">
        <span>总价:</span>
        <span>¥{{ totalAmount.toFixed(2) }}</span>
      </div>
      <div class="summary-item discount">
        <span>优惠金额:</span>
        <span>-¥{{ discountAmount.toFixed(2) }}</span>
      </div>
      <div class="summary-item total">
        <span>实付金额:</span>
        <span>¥{{ paymentAmount.toFixed(2) }}</span>
      </div>
      
      <button 
        class="pay-button"
        @click="submitOrder"
        :disabled="!canSubmitOrder"
      >
        去支付
      </button>
    </div>
  </div>
</template>

<script setup name="purchase">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getCurrentInstance } from 'vue';
import { listProductInventory } from "@/api/manage/productInventory";
import { listCouponsUserManage } from "@/api/manage/couponsUserManage";
import { listCouponsManage } from "@/api/manage/couponsManage";
import { addUserOrders, updateUserOrders, delUserOrders, listUserOrders, getUserOrders } from "@/api/user/userOrders";

const { proxy } = getCurrentInstance();
const route = useRoute();

// 基础数据
const userId = ref(null);
const productId = ref(null);
const inventoryList = ref([]);
const couponsUserList = ref([]);
const couponsList = ref([]);

// 订单相关数据
const selectedInventoryId = ref(null);
const selectedCouponId = ref(null);
const travelers = ref([]);
const orderInfo = ref({
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  note: ''
});

// 获取库存列表
function getinventoryList(_productId) {
  listProductInventory({
    pageNum: 1,
    pageSize: 1000,
    productId: _productId,
    isActive: 1
  }).then(response => {
    inventoryList.value = response.rows;
  });
}

// 获取用户优惠券
function getCouponsUserList(_userId) {
  listCouponsUserManage({
    pageNum: 1,
    pageSize: 1000,
    userId: _userId
  }).then(response => {
    couponsUserList.value = response.rows;
  });
}

// 获取优惠券详情
function getCouponsList() {
  listCouponsManage({
    pageNum: 1,
    pageSize: 1000
  }).then(response => {
    couponsList.value = response.rows;
  });
}

// 选择库存（日期）
function selectInventory(inventory) {
  selectedInventoryId.value = inventory.inventoryId;
  // 重置优惠券选择
  selectedCouponId.value = null;
}

// 添加出行人
function addTraveler(isAdult) {
  travelers.value.push({
    isAdult,
    realName: '',
    gender: 1,
    birthdate: '',
    passportNumber: '',
    passportExpiry: ''
  });
}

// 移除出行人
function removeTraveler(index) {
  travelers.value.splice(index, 1);
}

// 选择优惠券
function selectCoupon(couponUser) {
  if (!couponUser) {
    selectedCouponId.value = null;
    return;
  }
  
  // 检查优惠券是否可用
  if (isCouponUsable(couponUser)) {
    selectedCouponId.value = couponUser.id;
  }
}

// 获取优惠券详情
function getCouponDetail(couponId) {
  return couponsList.value.find(coupon => coupon.couponId === couponId);
}

// 计算成人数量
const adultCount = computed(() => {
  return travelers.value.filter(t => t.isAdult === 1).length;
});

// 计算儿童数量
const childCount = computed(() => {
  return travelers.value.filter(t => t.isAdult === 0).length;
});

// 计算总出行人数
const totalTravelers = computed(() => {
  return travelers.value.length;
});

// 获取选中的库存信息
const selectedInventory = computed(() => {
  return inventoryList.value.find(item => item.inventoryId === selectedInventoryId.value);
});

// 获取选中的优惠券用户信息
const selectedCouponUser = computed(() => {
  return couponsUserList.value.find(item => item.id === selectedCouponId.value);
});

// 计算总金额
const totalAmount = computed(() => {
  if (!selectedInventory.value) return 0;
  
  return (adultCount.value * selectedInventory.value.adultPrice) + 
         (childCount.value * selectedInventory.value.childPrice);
});

// 计算优惠金额
const discountAmount = computed(() => {
  if (!selectedCouponUser.value) return 0;
  
  const couponDetail = getCouponDetail(selectedCouponUser.value.couponId);
  if (!couponDetail || totalAmount.value < couponDetail.minPurchase) return 0;
  
  if (couponDetail.type === 0) {
    // 满减类型
    return couponDetail.value;
  } else {
    // 折扣类型
    return Math.floor(totalAmount.value * (1 - couponDetail.value));
  }
});

// 计算支付金额
const paymentAmount = computed(() => {
  const amount = totalAmount.value - discountAmount.value;
  return amount < 0 ? 0 : amount;
});

// 过滤可用优惠券
const availableCoupons = computed(() => {
  return couponsUserList.value.filter(couponUser => {
    const couponDetail = getCouponDetail(couponUser.couponId);
    return couponUser.status === 0 &&  // 未使用
           couponDetail?.isActive === 1;  // 优惠券生效
  });
});

// 检查优惠券是否可用
function isCouponUsable(couponUser) {
  const couponDetail = getCouponDetail(couponUser.couponId);
  if (!couponDetail) return false;
  
  return totalAmount.value >= couponDetail.minPurchase;
}

// 检查是否可以提交订单
const canSubmitOrder = computed(() => {
  // 检查是否选择了日期
  if (!selectedInventoryId.value) return false;
  
  // 检查是否至少有一个出行人
  if (travelers.value.length === 0) return false;
  
  // 检查出行人信息是否完整
  for (const traveler of travelers.value) {
    if (!traveler.realName || !traveler.birthdate || !traveler.passportNumber || !traveler.passportExpiry) {
      return false;
    }
  }
  
  // 检查联系人信息是否完整
  if (!orderInfo.value.contactName || !orderInfo.value.contactPhone) return false;
  
  // 检查是否超过库存
  if (totalTravelers.value > selectedInventory.value.availableStock) return false;
  
  return true;
});

// 提交订单
function submitOrder() {
  if (!canSubmitOrder.value) return;
  
  // 构建订单数据
  const orderData = {
    userId: userId.value,
    productId: productId.value,
    inventoryId: selectedInventoryId.value,
    departureDate: selectedInventory.value.departureDate,
    adultCount: adultCount.value,
    childCount: childCount.value,
    totalAmount: totalAmount.value,
    discountAmount: discountAmount.value,
    paymentAmount: paymentAmount.value,
    contactName: orderInfo.value.contactName,
    contactPhone: orderInfo.value.contactPhone,
    contactEmail: orderInfo.value.contactEmail,
    note: orderInfo.value.note,
    couponUserId: selectedCouponId.value,
    travelers: travelers.value.map(traveler => ({
      isAdult: traveler.isAdult,
      realName: traveler.realName,
      gender: traveler.gender,
      birthdate: traveler.birthdate,
      passportNumber: traveler.passportNumber,
      passportExpiry: traveler.passportExpiry
    }))
  };
  

  const orderResult = ref();

  // proxy.$message.success('订单创建成功，即将前往支付');
  // 调用创建订单接口
  addUserOrders(orderData).then(response => {
    if (response.code === 200) {
      proxy.$message.success('订单创建成功，即将前往支付');
      orderResult.value = response.data;
      // 清空所有表单数据
      resetForm();
      // 可以在这里跳转到支付页面
      proxy.$router.push({ path: '/payment', query: { orderId: orderResult.value.orderId , paymentAmount: orderResult.value.paymentAmount } });
      console.log('订单创建成功', orderResult.value);
    } else {
      proxy.$message.error('订单创建失败：' + (response.msg || '未知错误'));
    }
  }).catch(error => {
    proxy.$message.error('提交订单出错：' + error.message);
  });
}

// 清空表单数据
function resetForm() {
  // 重置库存选择
  selectedInventoryId.value = null;
  
  // 重置优惠券选择
  selectedCouponId.value = null;
  
  // 清空出行人信息
  travelers.value = [];
  
  // 重置联系人信息
  orderInfo.value = {
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    note: ''
  };
}

// 页面初始化
onMounted(() => {
  getCouponsList();
  
  if (route.query.productId) {
    productId.value = route.query.productId;
    getinventoryList(route.query.productId);
  }
  
  if (route.query.userId) {
    userId.value = route.query.userId;
    getCouponsUserList(route.query.userId);
  }
});

// 监听路由变化
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.productId && newQuery.productId !== productId.value) {
      productId.value = newQuery.productId;
      getinventoryList(newQuery.productId);
      selectedInventoryId.value = null;
    }
    
    if (newQuery.userId && newQuery.userId !== userId.value) {
      userId.value = newQuery.userId;
      getCouponsUserList(newQuery.userId);
      selectedCouponId.value = null;
    }
  }
);

// 监听库存变化重置优惠券
watch(selectedInventoryId, () => {
  selectedCouponId.value = null;
});

// 监听出行人变化可能需要重新检查优惠券可用性
watch(travelers, () => {
  if (selectedCouponId.value && !isCouponUsable(selectedCouponUser.value)) {
    selectedCouponId.value = null;
  }
}, { deep: true });
</script>

<style scoped>
.order-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #333;
  text-align: center;
}

.order-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
  display: inline-block;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.add-traveler button {
  margin-left: 10px;
  padding: 6px 12px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-traveler button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

/* 日期选择样式 */
.date-selector {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.date-item {
  min-width: 200px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.date-item.active {
  border-color: #42b983;
  background-color: #f5fcf8;
}

.departure-date {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.price-info {
  color: #666;
  margin-bottom: 8px;
}

.stock-info {
  color: #ff4d4f;
  font-size: 14px;
}

/* 表单样式 */
.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.form-item {
  flex: 1;
  min-width: 250px;
}

.form-item.full-width {
  flex: 100%;
}

.form-item label {
  display: block;
  margin-bottom: 6px;
  color: #333;
  font-size: 14px;
}

.form-item input,
.form-item select,
.form-item textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 14px;
}

.form-item textarea {
  resize: vertical;
}

.required {
  color: #ff4d4f;
}

.traveler-form {
  padding: 15px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  margin-bottom: 15px;
}

.delete-btn {
  background: #fff;
  color: #ff4d4f;
  border: 1px solid #ff4d4f;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn:disabled {
  color: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}

/* 优惠券样式 */
.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.coupon-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.coupon-item.selected {
  border-color: #42b983;
  background-color: #f5fcf8;
}

.coupon-item.no-coupon {
  justify-content: center;
  background-color: #f9f9f9;
}

.coupon-code {
  font-weight: 600;
  margin-bottom: 4px;
}

.coupon-desc {
  color: #666;
  font-size: 14px;
  margin-bottom: 4px;
}

.coupon-validity {
  font-size: 12px;
  color: #999;
}

/* 订单摘要样式 */
.order-summary {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-top: 30px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed #e0e0e0;
  font-size: 16px;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item.discount {
  color: #ff4d4f;
}

.summary-item.total {
  font-weight: bold;
  font-size: 18px;
  color: #ff4d4f;
  margin-top: 10px;
}

.pay-button {
  width: 100%;
  padding: 12px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
}

.pay-button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

/* 提示信息 */
.empty-tip {
  color: #999;
  text-align: center;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 6px;
}

.error-tip {
  color: #ff4d4f;
  font-size: 14px;
  margin-top: 10px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .date-selector {
    flex-direction: column;
  }
  
  .date-item {
    min-width: auto;
  }
}
</style>