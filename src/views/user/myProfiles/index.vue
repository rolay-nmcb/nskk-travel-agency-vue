<template>
  <div class="profile-container">
    <!-- 顶部导航栏 -->
    <nav class="top-nav">
      <div class="nav-title">我的信息</div>
      <button class="edit-btn" @click="handleEditToggle">
        {{ isEditing ? '保存' : '编辑' }}
      </button>
    </nav>

    <!-- 个人资料卡片 -->
    <div class="profile-card">

      <div class="profile-details">
        <div class="detail-item">
          <span class="label">真实姓名</span>
          <input 
            v-if="isEditing" 
            v-model="currentProfile.realName" 
            class="edit-input"
            type="text"
          >
          <span v-else>{{ currentProfile.realName || '未设置' }}</span>
        </div>
        
        <div class="detail-item">
          <span class="label">出生日期</span>
          <input 
            v-if="isEditing" 
            v-model="currentProfile.birthdate" 
            class="edit-input"
            type="date"
          >
          <span v-else>{{ currentProfile.birthdate || '未设置' }}</span>
        </div>
        
        <div class="detail-item">
          <span class="label">护照号码</span>
          <input 
            v-if="isEditing" 
            v-model="currentProfile.passportNumber" 
            class="edit-input"
            type="text"
          >
          <span v-else>{{ currentProfile.passportNumber || '未设置' }}</span>
        </div>
        
        <div class="detail-item">
          <span class="label">护照有效期</span>
          <input 
            v-if="isEditing" 
            v-model="currentProfile.passportExpiry" 
            class="edit-input"
            type="date"
          >
          <span v-else>{{ currentProfile.passportExpiry || '未设置' }}</span>
        </div>
        
        <div class="detail-item">
          <span class="label">紧急联系人</span>
          <input 
            v-if="isEditing" 
            v-model="currentProfile.emergencyContact" 
            class="edit-input"
            type="text"
          >
          <span v-else>{{ currentProfile.emergencyContact || '未设置' }}</span>
        </div>
        
        <div class="detail-item">
          <span class="label">紧急联系电话</span>
          <input 
            v-if="isEditing" 
            v-model="currentProfile.emergencyPhone" 
            class="edit-input"
            type="tel"
          >
          <span v-else>{{ currentProfile.emergencyPhone || '未设置' }}</span>
        </div>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="function-menu">
      <div class="menu-item" @click="navigateTo('travels')">
        <i class="icon">✈️</i>
        <span>我的游记</span>
        <i class="arrow">→</i>
      </div>
      
      <div class="menu-item" @click="navigateTo('reviews')">
        <i class="icon">⭐</i>
        <span>我的评价</span>
        <i class="arrow">→</i>
      </div>
      
      <div class="menu-item" @click="showCoupons = true">
        <i class="icon">🎫</i>
        <span>我的优惠券</span>
        <i class="arrow">→</i>
      </div>

       <div class="menu-item"  @click="navigateTo('orders')">
        <i class="icon">🛰️</i>
        <span>我的订单</span>
        <i class="arrow">→</i>
      </div>

      <div class="menu-item" @click="navigateTo('basic-info')">
        <i class="icon">ℹ️</i>
        <span>基础资料</span>
        <i class="arrow">→</i>
      </div>
    </div>

     <!-- 优惠券弹窗 -->
  <div v-if="showCoupons" class="coupon-modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>我的优惠券</h3>
        <button class="close-btn" @click="showCoupons = false">×</button>
      </div>
      
      <div class="coupon-list">
        <div v-if="coupons.length === 0" class="empty-coupon">
          暂无优惠券
        </div>
        
        <div v-for="coupon in coupons" :key="coupon.id" class="coupon-card">
          <div class="coupon-info">
            <div class="coupon-id">券码: {{ coupon.code }}</div>
            <div class="coupon-status">
              <span :class="getStatusClass(coupon.status)">
                {{ getStatusText(coupon.status) }}
              </span>
            </div>
            <!-- 优惠券日期信息根据状态显示不同内容 -->
            <div class="coupon-date">
              <template v-if="coupon.status === 0">
                <span>领取日期: {{ coupon.acquiredAt }}</span>
                <span>过期日期: {{ coupon.expirationTime }}</span>
              </template>
              <template v-if="coupon.status === 1">
                <span>订单号: {{ coupon.orderId || '未知' }}</span>
                <span>使用日期: {{ coupon.usedAt }}</span>
              </template>
              <template v-if="coupon.status === 2">
                <span>过期时间: {{ coupon.expirationTime }}</span>
              </template>
            </div>
          </div>
          
          <button 
            v-if="coupon.status === 0" 
            class="use-btn"
            @click="useCoupon(coupon)"
          >
            去使用
          </button>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup name="myProfiles">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCurrentInstance } from 'vue';
import { getProfilesManageByUserId, updateProfilesManage ,addProfilesManage } from '@/api/manage/profilesManage';
import { listCouponsUserManage } from '@/api/manage/couponsUserManage';
import useUserStore from '@/store/modules/user';

const { proxy } = getCurrentInstance();
const router = useRouter();
const userStore = useUserStore();
const userId = userStore.id;
// 将myProfiles从数组改为对象
const myProfile = ref({});
const coupons = ref([]);
const isEditing = ref(false);
const showCoupons = ref(false);
const originalProfile = ref({});

// 当前显示的个人资料，直接使用myProfile对象
const currentProfile = computed({
  get: () => {
    // 确保始终有一个基础对象，避免编辑时出现undefined
    return { userId, ...myProfile.value };
  },
  set: (value) => {
    myProfile.value = value;
  }
});

// 获取我的资料
function getMyProfile() {
  getProfilesManageByUserId(userId).then(res => {
    // 假设接口返回的是单个对象，如果实际返回数组则取第一个元素
    myProfile.value = res.data || {};
    // 初始化原始数据，新增场景下使用空对象
    originalProfile.value = JSON.parse(JSON.stringify({ userId, ...myProfile.value }));
  });
}

// 获取优惠券
function getMyCoupons() {
  listCouponsUserManage({
    pageNum:1,
    pageSize: 1000,
    userId: userId
  }).then(res => {
    coupons.value = res.rows || [];
  });
}

// 导航到其他页面
function navigateTo(path) {
  if(path === 'travels')
  {
      router.push('/myUser/myTravelNote');
  }
  if(path === 'reviews')
  {
      router.push('/myUser/myReview');
  }
  if(path === 'basic-info')
  {
      router.push('/user/profile');
  }
  if(path === 'orders')
  {
    router.push('/myUser/myOrders');
  }

}

// 获取优惠券状态文本
function getStatusText(status) {
  const statusMap = {
    0: '未使用',
    1: '已使用',
    2: '已过期'
  };
  return statusMap[status] || '未知状态';
}

// 获取优惠券状态样式
function getStatusClass(status) {
  const classMap = {
    0: 'status-unused',
    1: 'status-used',
    2: 'status-expired'
  };
  return classMap[status] || '';
}

// 使用优惠券
function useCoupon(coupon) {
  router.push('/userProduct/userProducts');
  showCoupons.value = false;
}

// 处理编辑状态切换
function handleEditToggle() {
  if (isEditing.value) {
    // 从编辑状态切换到保存状态
    saveProfile();
  } else {
    // 从查看状态切换到编辑状态
    isEditing.value = true;
  }
}

// 保存资料（新增或更新）
function saveProfile() {
  // 判断是新增还是更新（根据是否有id判断）
  const isNew = !myProfile.value.profileId;
  
  const profileData = {
    ...currentProfile.value,
    userId: userId // 确保用户ID始终存在
  };

  const request = isNew 
    ? addProfilesManage(profileData) 
    : updateProfilesManage(profileData);

  request.then(() => {
    proxy.$message.success(isNew ? '资料新增成功' : '资料更新成功');
    isEditing.value = false;
    // 重新获取数据刷新
    getMyProfile();
  }).catch(() => {
    proxy.$message.error(isNew ? '资料新增失败' : '资料更新失败');
    // 恢复原始数据
    currentProfile.value = originalProfile.value;
  });
}

// 页面初始化
onMounted(() => {
  getMyProfile();
  getMyCoupons();
});

// 监听编辑状态变化（仅用于取消编辑时恢复数据）
watch(isEditing, (newVal, oldVal) => {
  if (newVal === false && oldVal === true) {
    // 只有在非保存操作导致的编辑状态关闭时才恢复数据
    if (!isSaving.value) {
      currentProfile.value = originalProfile.value;
    }
  }
});

// 用于标记是否正在保存中
const isSaving = ref(false);
</script>

<style scoped>
/* 样式部分保持不变 */
.profile-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 顶部导航 */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.edit-btn {
  padding: 6px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.edit-btn:hover {
  background-color: #359e75;
}

/* 个人资料卡片 */
.profile-card {
  background-color: white;
  margin: 16px;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.avatar {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 12px;
  border: 2px solid #f0f0f0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-upload {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.profile-details {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.detail-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.detail-item:last-child {
  border-bottom: none;
}

.label {
  width: 100px;
  color: #666;
  font-size: 14px;
}

.edit-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.edit-input:focus {
  border-color: #42b983;
}

/* 功能菜单 */
.function-menu {
  margin: 16px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 16px 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.menu-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.icon {
  font-size: 20px;
  margin-right: 12px;
  color: #42b983;
}

.arrow {
  color: #ccc;
  font-size: 16px;
}

/* 优惠券弹窗 */
.coupon-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background-color: white;
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
}

.coupon-list {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.coupon-card {
  border: 1px dashed #42b983;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9fff8;
}

.coupon-id {
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.coupon-status {
  margin-bottom: 8px;
}

.status-unused {
  color: #42b983;
  background-color: rgba(66, 185, 131, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.status-used {
  color: #999;
  background-color: #f5f5f5;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.status-expired {
  color: #ff4d4f;
  background-color: rgba(255, 77, 79, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.coupon-date {
  font-size: 12px;
  color: #666;
  display: flex;
  gap: 12px;
}

.use-btn {
  padding: 6px 12px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.use-btn:hover {
  background-color: #359e75;
}

.empty-coupon {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 16px;
}

/* 响应式设计 */
@media (min-width: 768px) {
  .profile-details {
    grid-template-columns: 1fr 1fr;
  }
  
  .function-menu {
    grid-template-columns: 1fr 1fr;
  }
}
</style>