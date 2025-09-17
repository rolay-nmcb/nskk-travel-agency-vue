<template>
  <div class="payment-container">
    <!-- 头部导航 -->
    <div class="payment-header">
      <button class="back-btn" @click="handleCancel">
        <i class="icon-back">←</i> 返回
      </button>
      <h1>订单支付</h1>
    </div>

    <!-- 订单信息卡片 -->
    <div class="order-info-card">
      <div class="order-item">
        <span class="label">订单编号</span>
        <span class="value">{{ orderId }}</span>
      </div>
      <div class="order-item">
        <span class="label">支付金额</span>
        <span class="value amount">{{ formatAmount(paymentAmount) }}</span>
      </div>
    </div>

    <!-- 支付方式选择 -->
    <div class="payment-method-section">
      <h2>选择支付方式</h2>
      <div class="method-options">
        <div 
          class="method-item" 
          :class="{ active: selectedMethod === 'wechat' }"
          @click="selectedMethod = 'wechat'"
        >
          <img src="@/assets/images/WechatPay.png" alt="微信支付" class="method-icon">
          <span class="method-name">微信支付</span>
          <i class="check-icon" v-if="selectedMethod === 'wechat'">✓</i>
        </div>
        
        <div 
          class="method-item" 
          :class="{ active: selectedMethod === 'alipay' }"
          @click="selectedMethod = 'alipay'"
        >
          <img src="@/assets/images/AliPay.png" alt="支付宝支付" class="method-icon">
          <span class="method-name">支付宝支付</span>
          <i class="check-icon" v-if="selectedMethod === 'alipay'">✓</i>
        </div>
      </div>
    </div>

    <!-- 收款码显示区域 -->
    <div class="qr-code-section" v-if="selectedMethod">
      <h2>请使用{{ selectedMethod === 'wechat' ? '微信' : '支付宝' }}扫描二维码支付</h2>
      <div class="qr-code-container">
        <img 
          :src="selectedMethod === 'wechat' ? '/src/assets/images/WechatPay.png' : '/src/assets/images/AliPay.png'" 
          :alt="selectedMethod === 'wechat' ? '微信支付二维码' : '支付宝支付二维码'"
          class="qr-code-img"
        >
      </div>
      <p class="amount-reminder">支付金额：{{ formatAmount(paymentAmount) }}</p>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <button class="cancel-btn" @click="handleCancel">取消支付</button>
      <button 
        class="confirm-btn" 
        @click="handlePaymentConfirm"
        :disabled="!selectedMethod"
      >
        我已完成支付
      </button>
    </div>
  </div>
</template>

<script setup name="payment">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCurrentInstance } from 'vue';
import { payUserOrder } from '@/api/user/userOrders';


const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();

// 订单相关数据
const orderId = ref(null);
const paymentAmount = ref(null);
const selectedMethod = ref(''); // 选中的支付方式 wechat/alipay

// 页面初始化
onMounted(() => {
  if (route.query.orderId) {
    orderId.value = route.query.orderId;
  }
  
  if (route.query.paymentAmount) {
    paymentAmount.value = route.query.paymentAmount;
  }
});

// 监听路由变化
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.orderId && newQuery.orderId !== orderId.value) {
      orderId.value = newQuery.orderId;
    }
    
    if (newQuery.paymentAmount && newQuery.paymentAmount !== paymentAmount.value) {
      paymentAmount.value = newQuery.paymentAmount;
    }
  }
);

// 格式化金额显示
const formatAmount = (amount) => {
  if (!amount) return '¥0.00';
  return `¥${Number(amount).toFixed(2)}`;
};

// 处理支付确认
const handlePaymentConfirm = async () => {
  if (!selectedMethod.value) return;
    const paymentData = {
      orderId: orderId.value,
      amount: paymentAmount.value,
      paymentMethod: selectedMethod.value,
    };
    payUserOrder(paymentData).then(response => {
    if (response.code === 200) {
      // 显示成功提示
      proxy.$message.success('支付成功！');
      // 清空所有表单数据
      resetPaymentData();
      proxy.$router.push({ path: '/userProduct/userProducts' });
    } else {
      proxy.$message.error('支付失败，请重试');
      console.error('支付失败:', error);
    }
    }).catch(error => {
      proxy.$message.error('支付失败，请重试');
      console.error('支付失败:', error);
    });
};

// 处理取消支付
const handleCancel = () => {
  resetPaymentData();
  router.back();
};

// 重置支付数据
const resetPaymentData = () => {
  orderId.value = null;
  paymentAmount.value = null;
  selectedMethod.value = '';
};
</script>

<style scoped>
.payment-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 头部样式 */
.payment-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.back-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #333;
  cursor: pointer;
  padding: 5px 10px;
}

.icon-back {
  margin-right: 5px;
}

.payment-header h1 {
  flex: 1;
  text-align: center;
  margin: 0;
  font-size: 20px;
  color: #333;
}

/* 订单信息卡片 */
.order-info-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.order-item:last-child {
  border-bottom: none;
}

.label {
  color: #666;
  font-size: 15px;
}

.value {
  color: #333;
  font-size: 15px;
}

.amount {
  color: #e53e3e;
  font-weight: bold;
  font-size: 16px;
}

/* 支付方式选择 */
.payment-method-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.payment-method-section h2 {
  margin: 0 0 15px 0;
  font-size: 17px;
  color: #333;
}

.method-options {
  display: flex;
  gap: 15px;
}

.method-item {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.method-item.active {
  border-color: #1677ff;
  background-color: rgba(22, 119, 255, 0.05);
}

.method-icon {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.method-name {
  font-size: 16px;
  color: #333;
}

.check-icon {
  color: #1677ff;
  font-weight: bold;
}

/* 收款码区域 */
.qr-code-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.qr-code-section h2 {
  margin: 0 0 20px 0;
  font-size: 17px;
  color: #333;
}

.qr-code-container {
  width: 240px;
  height: 240px;
  margin: 0 auto 15px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.qr-code-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.amount-reminder {
  color: #e53e3e;
  font-size: 16px;
  margin: 0;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 40px;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  padding: 14px 0;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn {
  background: white;
  border: 1px solid #ddd;
  color: #666;
}

.cancel-btn:hover {
  background-color: #f9f9f9;
}

.confirm-btn {
  background: #1677ff;
  border: none;
  color: white;
}

.confirm-btn:disabled {
  background: #96bff9;
  cursor: not-allowed;
}

.confirm-btn:not(:disabled):hover {
  background: #0f62d9;
}
</style>