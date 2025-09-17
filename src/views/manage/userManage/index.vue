<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户账号" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户账号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户性别" prop="sex">
        <el-select v-model="queryParams.sex" placeholder="请选择用户性别" clearable>
          <el-option
            v-for="dict in sys_user_sex"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="帐号状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择帐号状态" clearable>
          <el-option
            v-for="dict in user_status"
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
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:user:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="userManageList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="用户账号" align="center" prop="userName" />
      <el-table-column label="用户昵称" align="center" prop="nickName" />
      <el-table-column label="用户性别" align="center" prop="sex">
        <template #default="scope">
          <dict-tag :options="sys_user_sex" :value="scope.row.sex"/>
        </template>
      </el-table-column>
      <el-table-column label="头像" align="center" prop="avatar" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.avatar" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="帐号状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="user_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="最后登录IP" align="center" prop="loginIp" />
      <el-table-column label="最后登录时间" align="center" prop="loginDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.loginDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" >
        <template #default="scope">
          <span>{{ scope.row.remark ? scope.row.remark : '用户' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleView(scope.row)" v-hasPermi="['system:user:query']">查看用户信息</el-button>
          <!-- 根据用户状态动态展示停用或启用按钮 -->
          <!-- <el-button 
            v-if="scope.row.status == '0'" 
            link 
            type="danger" 
            icon="CircleClose" 
            @click="handleDisable(scope.row)" 
            v-hasPermi="['system:user:edit']"
          >
            停用
          </el-button>
          <el-button 
            v-else 
            link 
            type="success" 
            icon="Check" 
            @click="handleEnable(scope.row)" 
            v-hasPermi="['system:user:edit']"
          >
            启用
          </el-button> -->
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

    <!-- 添加或修改用户信息管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="userManageRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户账号" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入用户账号" />
        </el-form-item>
        <el-form-item label="用户密码" prop="password">
          <el-input v-model="form.password" placeholder="请输入用户密码" />
        </el-form-item>
        <el-form-item label="用户昵称" prop="nickName">
          <el-input v-model="form.nickName" placeholder="请输入用户昵称" />
        </el-form-item>
        <el-form-item label="用户邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入用户邮箱" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phonenumber">
          <el-input v-model="form.phonenumber" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="用户性别" prop="sex">
          <el-radio-group v-model="form.sex">
            <el-radio
              v-for="dict in sys_user_sex"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="头像地址" prop="avatar">
          <image-upload v-model="form.avatar"/>
        </el-form-item>
        <el-form-item label="帐号状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in user_status"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="最后登录IP" prop="loginIp">
          <el-input v-model="form.loginIp" placeholder="请输入最后登录IP" />
        </el-form-item>
        <el-form-item label="最后登录时间" prop="loginDate">
          <el-date-picker clearable
            v-model="form.loginDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择最后登录时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看用户详细信息对话框 -->
    <el-dialog :title="title" v-model="viewOpen" width="500px" append-to-body>
      <el-empty v-if="!hasProfileInfo" description="该用户暂无个人信息" />
      
      <div v-else class="profile-details">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="真实姓名">{{ viewForm.realName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="出生日期">{{ viewForm.birthdate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="护照号码">{{ viewForm.passportNumber || '-' }}</el-descriptions-item>
          <el-descriptions-item label="护照有效期">{{ viewForm.passportExpiry || '-' }}</el-descriptions-item>
          <el-descriptions-item label="紧急联系人">{{ viewForm.emergencyContact || '-' }}</el-descriptions-item>
          <el-descriptions-item label="紧急联系电话">{{ viewForm.emergencyPhone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ viewForm.createdAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ viewForm.updatedAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注">
            <div class="remark-content">{{ viewForm.remark || '无' }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="viewReviews(viewForm.userId)">查看评价</el-button>
          <el-button @click="viewTravelNotes(viewForm.userId)">查看游记</el-button>
          <el-button @click="viewCoupons(viewForm.userId)">查看优惠券</el-button>
          <el-button type="primary" @click="cancel">关闭</el-button>
        </div>
      </template>
    </el-dialog>

     <!-- 在现有对话框之后添加新的优惠券对话框 -->
    <el-dialog title="用户优惠券" v-model="couponsOpen" width="800px" append-to-body>
        <el-table :data="couponsList" style="width: 100%">
          <el-table-column prop="code" label="优惠券码" width="150" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag v-if="scope.row.status === 0" type="success">未使用</el-tag>
              <el-tag v-else-if="scope.row.status === 1" type="warning">已使用</el-tag>
              <el-tag v-else type="info">已过期</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="acquiredAt" label="获取时间" width="120" />
          <el-table-column prop="expirationTime" label="过期时间" width="180">
            <template #default="scope">
              {{ parseTime(scope.row.expirationTime, '{y}-{m}-{d}') }}
            </template>
          </el-table-column>
          <el-table-column label="订单编号" width="120" show-overflow-tooltip>
            <template #default="scope">
              <span v-if="scope.row.status === 1 && scope.row.orderId">
                {{ scope.row.orderId }}
              </span>
              <span v-else>无使用订单</span>
            </template>
          </el-table-column>
        </el-table>
        
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="couponsOpen = false">取消</el-button>
          </div>
        </template>
      </el-dialog>

  </div>
</template>

<script setup name="UserManage">
import { listUserManage, getUserManage, delUserManage, addUserManage, updateUserManage } from "@/api/manage/userManage";
import {getProfilesManage, listProfilesManage,getProfilesManageByUserId} from "@/api/manage/profilesManage";
import {listCouponsUserManage} from "@/api/manage/couponsUserManage"
import { ref, reactive, toRefs, getCurrentInstance, computed } from 'vue';
import {loadAllParams} from "@/api/page"

const { proxy } = getCurrentInstance();
const { user_status, sys_user_sex } = proxy.useDict('user_status', 'sys_user_sex');

const userManageList = ref([]);
const open = ref(false);
const viewOpen=ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const couponsOpen = ref(false);

const data = reactive({
  form: {},
  viewForm: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userId: null,
    userName: null,
    sex: null,
    status: null,
  },
  rules: {
    userName: [
      { required: true, message: "用户账号不能为空", trigger: "blur" }
    ],
    nickName: [
      { required: true, message: "用户昵称不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules, viewForm } = toRefs(data);

/** 查询用户信息管理列表 */
function getList() {
  loading.value = true;
  listUserManage(queryParams.value).then(response => {
    userManageList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  viewOpen.value=false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    userId: null,
    deptId: null,
    userName: null,
    nickName: null,
    userType: null,
    email: null,
    phonenumber: null,
    sex: null,
    avatar: null,
    password: null,
    status: null,
    delFlag: null,
    loginIp: null,
    loginDate: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  };
  viewForm.value = {
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    profileId: null,
    userId: null,
    realName: null,
    birthdate: null,
    passportNumber: null,
    passportExpiry: null,
    emergencyContact: null,
    emergencyPhone: null,
    createdAt: null,
    updatedAt: null
  }
  proxy.resetForm("userManageRef");
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
  ids.value = selection.map(item => item.userId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加用户信息管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _userId = row.userId || ids.value
  getUserManage(_userId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改用户信息管理";
  });
}
/** 停用按钮操作 */
function handleDisable(row) {
  const _userId = row.userId;
  proxy.$modal.confirm('是否确认停用用户"' + row.userName + '"？').then(function() {
    // 创建用户对象，只更新状态字段
    const updateUser = {
      userId: _userId,
      userName: row.userName,
      status: "1"
    };
    return updateUserManage(updateUser);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("用户已停用");
  }).catch(() => {});
}

/** 启用按钮操作 */
function handleEnable(row) {
  const _userId = row.userId;
  proxy.$modal.confirm('是否确认启用用户"' + row.userName + '"？').then(function() {
    // 创建用户对象，只更新状态字段
    const updateUser = {
      userId: _userId,
      userName: row.userName,
      status: "0"
    };
    return updateUserManage(updateUser);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("用户已启用");
  }).catch(() => {});
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["userManageRef"].validate(valid => {
    if (valid) {
      if (form.value.userId != null) {
        updateUserManage(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addUserManage(form.value).then(response => {
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
  const _userIds = row.userId || ids.value;
  proxy.$modal.confirm('是否确认删除用户信息管理编号为"' + _userIds + '"的数据项？').then(function() {
    return delUserManage(_userIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

// 添加计算属性来判断是否有用户详细信息
const hasProfileInfo = computed(() => {
  return viewForm.value && (
    viewForm.value.realName ||
    viewForm.value.birthdate ||
    viewForm.value.passportNumber ||
    viewForm.value.passportExpiry ||
    viewForm.value.emergencyContact ||
    viewForm.value.emergencyPhone ||
    viewForm.value.remark
  );
});

// 修改 handleView 方法，添加错误处理
function handleView(row) {
  const _userId = row.userId;
  getProfilesManageByUserId(_userId).then(response => {
    if (response.data) {
      viewForm.value = response.data;
    } else {
      // 如果没有返回数据，初始化为空对象
      viewForm.value = {
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null,
        profileId: null,
        userId: _userId,
        realName: null,
        birthdate: null,
        passportNumber: null,
        passportExpiry: null,
        emergencyContact: null,
        emergencyPhone: null,
        createdAt: null,
        updatedAt: null
      };
    }
    viewOpen.value = true;
    title.value = "查看用户信息";
  }).catch(error => {
    // 如果请求失败，也显示空的表单
    viewForm.value = {
      createBy: null,
      createTime: null,
      updateBy: null,
      updateTime: null,
      remark: null,
      profileId: null,
      userId: _userId,
      realName: null,
      birthdate: null,
      passportNumber: null,
      passportExpiry: null,
      emergencyContact: null,
      emergencyPhone: null,
      createdAt: null,
      updatedAt: null
    };
    viewOpen.value = true;
    title.value = "查看用户信息";
    proxy.$modal.msgError("获取用户详细信息失败");
  });
}

// 查看评价
function viewReviews(_userId) {
  // proxy.$modal.msgInfo("查看该用户所有评价功能待实现");
  cancel();
  proxy.$router.push({ path: '/feedback/reviewsManage', query: { userId: _userId } });
}

// 查看游记
function viewTravelNotes(_userId) {
  // proxy.$modal.msgInfo("查看该用户所有游记功能待实现");
  cancel();
  proxy.$router.push({ path: '/feedback/travelNotesManage', query: { userId: _userId } });
}

// 查看优惠券
// 修改 viewCoupons 函数
function viewCoupons(_userId) {
  getCouponsList(_userId).then(() => {
    couponsOpen.value = true;
  });
}

const couponsList=ref([])
// 修改 getCouponsList 函数，使其返回Promise
function getCouponsList(_userId) {
  loadAllParams.userId = _userId;
  return listCouponsUserManage(loadAllParams).then(response => {
    couponsList.value = response.rows;
  });
}



/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/user/export', {
    ...queryParams.value
  }, `userManage_${new Date().getTime()}.xlsx`)
}

getList();
</script>

<style scoped>
.profile-details {
  padding: 20px 0;
}

.remark-content {
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.5;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  text-align: right;
  padding: 20px 0 0;
}

.dialog-footer .el-button {
  flex: 1;
  margin: 0 5px;
}

.dialog-footer .el-button:first-child {
  margin-right: 10px;
}

.dialog-footer .el-button:last-child {
  margin-right: 0;
}

:deep(.el-descriptions__label) {
  width: 120px;
  font-weight: bold;
}

:deep(.el-descriptions__content) {
  word-break: break-all;
}

:deep(.el-dialog__body) {
  padding: 10px 20px;
}

:deep(.el-dialog__header) {
  padding: 20px 20px 10px;
}

:deep(.el-dialog__footer) {
  padding: 10px 20px 20px;
  border-top: 1px solid #eee;
}

:deep(.el-empty) {
  padding: 40px 0;
}
</style>
