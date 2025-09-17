<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="优惠码" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入优惠码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择类型" clearable>
          <el-option
            v-for="dict in coupons_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="是否生效" prop="isActive">
        <el-select v-model="queryParams.isActive" placeholder="请选择是否生效" clearable>
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
          v-hasPermi="['manage:couponsManage:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['manage:couponsManage:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['manage:couponsManage:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['manage:couponsManage:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="couponsManageList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" type="index" width="50" />
      <el-table-column label="优惠码" align="center" prop="code" />
      <el-table-column label="类型" align="center" prop="type">
        <template #default="scope">
          <dict-tag :options="coupons_type" :value="scope.row.type"/>
        </template>
      </el-table-column>
      <el-table-column label="剩余优惠卷" align="center" >
        <template #default="scope">
          {{ scope.row.totalQuantity - scope.row.usedQuantity }}
        </template>
      </el-table-column>
      <el-table-column label="是否生效" align="center" prop="isActive">
        <template #default="scope">
          <dict-tag :options="yes_no" :value="scope.row.isActive"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="500" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)" v-hasPermi="['manage:couponsManage:query']">查看详情</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['manage:couponsManage:edit']">修改</el-button>
          <el-button link type="waring" icon="Promotion" @click="handleIssue(scope.row)" v-hasPermi="['manage:couponsManage:edit']">发放优惠卷</el-button>
          <!-- 根据优惠券状态动态展示停用或启用按钮 -->
          <el-button 
            v-if="scope.row.isActive == 1" 
            link 
            type="danger" 
            icon="CircleClose" 
            @click="handleDisable(scope.row)" 
            v-hasPermi="['manage:couponsManage:edit']"
          >
            停用
          </el-button>
          <el-button 
            v-else 
            link 
            type="success" 
            icon="Check" 
            @click="handleEnable(scope.row)" 
            v-hasPermi="['manage:couponsManage:edit']"
          >
            启用
          </el-button>
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

    <!-- 添加或修改优惠券对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body class="coupon-form-dialog">
      <el-form ref="couponsManageRef" :model="form" :rules="rules" label-width="100px">
        <!-- 新增优惠券表单 -->
        <div v-if="isAddMode">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="优惠码" prop="code">
                <el-input v-model="form.code" placeholder="请输入优惠码" />
              </el-form-item>
              <el-form-item label="类型" prop="type">
                <el-radio-group v-model="form.type" @change="handleTypeChange">
                  <el-radio
                    v-for="dict in coupons_type"
                    :key="dict.value"
                    :label="parseInt(dict.value)"
                  >{{dict.label}}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="面值" prop="value">
                <el-input 
                  v-model.number="form.value" 
                  :placeholder="getValuePlaceholder(form.type)" 
                  type="number" 
                  :step="form.type === 1 ? '0.01' : '1'"
                  :min="form.type === 1 ? '0.01' : '1'"
                  :max="form.type === 0 ? form.minPurchase || undefined : '0.99'"
                />
                <div class="form-tip">{{ getValueTip(form.type) }}</div>
              </el-form-item>
              <el-form-item label="最低消费" prop="minPurchase">
                <el-input v-model.number="form.minPurchase" placeholder="请输入最低消费" type="number" min="0" />
              </el-form-item>
              <el-form-item label="每人限领" prop="usageLimit">
                <el-input v-model.number="form.usageLimit" placeholder="请输入每人限领" type="number" min="1" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="发行总量" prop="totalQuantity">
                <el-input v-model.number="form.totalQuantity" placeholder="请输入发行总量" type="number" min="1" />
              </el-form-item>
              <el-form-item label="开始日期" prop="startDate">
                <el-date-picker clearable
                  v-model="form.startDate"
                  type="date"
                  value-format="YYYY-MM-DD"
                  placeholder="请选择开始日期"
                  style="width: 100%">
                </el-date-picker>
              </el-form-item>
              <el-form-item label="结束日期" prop="endDate">
                <el-date-picker clearable
                  v-model="form.endDate"
                  type="date"
                  value-format="YYYY-MM-DD"
                  placeholder="请选择结束日期"
                  style="width: 100%">
                </el-date-picker>
              </el-form-item>
              <el-form-item label="是否生效" prop="isActive">
                <el-radio-group v-model="form.isActive">
                  <el-radio
                    v-for="dict in yes_no"
                    :key="dict.value"
                    :label="parseInt(dict.value)"
                  >{{dict.label}}</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <!-- 修改优惠券表单（仅允许修改部分字段） -->
        <div v-else>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="优惠码">
                <el-input v-model="form.code" disabled />
              </el-form-item>
              <el-form-item label="类型">
                <el-radio-group v-model="form.type" disabled>
                  <el-radio
                    v-for="dict in coupons_type"
                    :key="dict.value"
                    :label="parseInt(dict.value)"
                  >{{dict.label}}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="面值" prop="value">
                <el-input 
                  v-model.number="form.value" 
                  :placeholder="getValuePlaceholder(form.type)" 
                  type="number" 
                  :step="form.type === 1 ? '0.01' : '1'"
                  :min="form.type === 1 ? '0.01' : '1'"
                  :max="form.type === 0 ? form.minPurchase || undefined : '0.99'"
                />
                <div class="form-tip">{{ getValueTip(form.type) }}</div>
              </el-form-item>
              <el-form-item label="最低消费" prop="minPurchase">
                <el-input v-model.number="form.minPurchase" placeholder="请输入最低消费" type="number" min="0" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="每人限领">
                <el-input v-model.number="form.usageLimit" disabled type="number" />
              </el-form-item>
              <el-form-item label="发行总量">
                <el-input v-model.number="form.totalQuantity" disabled type="number" />
              </el-form-item>
              <el-form-item label="开始日期" prop="startDate">
                <el-date-picker clearable
                  v-model="form.startDate"
                  type="date"
                  value-format="YYYY-MM-DD"
                  placeholder="请选择开始日期"
                  style="width: 100%">
                </el-date-picker>
              </el-form-item>
              <el-form-item label="结束日期" prop="endDate">
                <el-date-picker clearable
                  v-model="form.endDate"
                  type="date"
                  value-format="YYYY-MM-DD"
                  placeholder="请选择结束日期"
                  style="width: 100%">
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>

     <!-- 美化后的查看详情对话框 -->
      <el-dialog :title="title" v-model="viewOpen" width="650px" append-to-body class="coupon-detail-dialog">
        <div class="coupon-header">
          <div class="coupon-code">{{ viewForm.code }}</div>
          <div class="coupon-status">
            <el-tag :type="viewForm.isActive == 1 ? 'success' : 'danger'">
              {{ viewForm.isActive == 1 ? '有效' : '无效' }}
            </el-tag>
          </div>
        </div>
        
        <el-divider></el-divider>
        
        <el-row :gutter="20" class="coupon-info">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">优惠券ID:</span>
              <span class="info-value">{{ viewForm.couponId }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">类型:</span>
              <span class="info-value">
                <dict-tag :options="coupons_type" :value="viewForm.type"/>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">面值:</span>
              <span class="info-value">{{ viewForm.value }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">最低消费:</span>
              <span class="info-value">{{ viewForm.minPurchase }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">每人限领:</span>
              <span class="info-value">{{ viewForm.usageLimit }}</span>
            </div>
          </el-col>
          
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">发行总量:</span>
              <span class="info-value">{{ viewForm.totalQuantity }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">已分配量:</span>
              <span class="info-value">{{ viewForm.usedQuantity }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">开始日期:</span>
              <span class="info-value">{{ parseTime(viewForm.startDate, '{y}-{m}-{d}') }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">结束日期:</span>
              <span class="info-value">{{ parseTime(viewForm.endDate, '{y}-{m}-{d}') }}</span>
            </div>
          </el-col>
        </el-row>
        
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="viewOpen = false">关闭</el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 发放优惠券对话框 -->
      <el-dialog :title="issueTitle" v-model="issueOpen" width="800px" append-to-body>
        <el-form :model="issueForm" ref="issueRef" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="优惠券">
                <el-input v-model="issueForm.couponCode" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="剩余数量">
                <el-input v-model="issueForm.remainingQuantity" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="选择用户">
            <el-table 
              ref="userTableRef" 
              :data="UserList" 
              @selection-change="handleUserSelectionChange"
              max-height="400"
              border
            >
              <el-table-column type="selection" width="55" align="center" />
              <el-table-column label="用户ID" prop="userId" width="80" />
              <el-table-column label="用户名" prop="userName" />
              <el-table-column label="昵称" prop="nickName" />
              <el-table-column label="手机号" prop="phonenumber" />
              <el-table-column label="状态" prop="status" width="80">
                <template #default="scope">
                  <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'">
                    {{ scope.row.status === '0' ? '正常' : '停用' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
        </el-form>
        
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="cancelIssue">取 消</el-button>
            <el-button type="primary" @click="submitIssue" :loading="issueLoading">发 放</el-button>
          </div>
        </template>
      </el-dialog>

  </div>
</template>

<script setup name="CouponsManage">
import { listCouponsManage, getCouponsManage, delCouponsManage, addCouponsManage, updateCouponsManage, issueCoupons } from "@/api/manage/couponsManage";
import {listUserManage} from "@/api/manage/userManage";
import {loadAllParams} from "@/api/page";

const { proxy } = getCurrentInstance();
const { coupons_type, yes_no } = proxy.useDict('coupons_type', 'yes_no');

const couponsManageList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const viewOpen = ref(false);
const viewForm = ref({});
const isAddMode = ref(true); // 标识是否为新增模式

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    code: null,
    type: null,
    value: null,
    minPurchase: null,
    usageLimit: null,
    totalQuantity: null,
    usedQuantity: null,
    startDate: null,
    endDate: null,
    isActive: null,
  },
  rules: {
    code: [
      { required: true, message: "优惠码不能为空", trigger: "blur" }
    ],
    type: [
      { required: true, message: "类型(0:满减,1:折扣)不能为空", trigger: "change" }
    ],
    value: [
      { required: true, message: "面值不能为空", trigger: "blur" },
      { validator: validateValue, trigger: "blur" }
    ],
    totalQuantity: [
      { required: true, message: "发行总量不能为空", trigger: "blur" },
      { type: 'number', message: "发行总量必须为数字值", trigger: "blur" },
      { type: 'number', min: 1, message: "发行总量必须大于0", trigger: "blur" }
    ],
    minPurchase: [
      { required: true, message: "最低消费不能为空", trigger: "blur" },
      { type: 'number', message: "最低消费必须为数字值", trigger: "blur" },
      { type: 'number', min: 0, message: "最低消费不能小于0", trigger: "blur" }
    ],
    usageLimit: [
      { required: true, message: "每人限领不能为空", trigger: "blur" },
      { type: 'number', message: "每人限领必须为数字值", trigger: "blur" },
      { type: 'number', min: 1, message: "每人限领必须大于0", trigger: "blur" }
    ],
    startDate: [
      { required: true, message: "开始日期不能为空", trigger: "blur" }
    ],
    endDate: [
      { required: true, message: "结束日期不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询优惠券列表 */
function getList() {
  loading.value = true;
  listCouponsManage(queryParams.value).then(response => {
    couponsManageList.value = response.rows;
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
    couponId: null,
    code: null,
    type: null,
    value: null,
    minPurchase: null,
    usageLimit: null,
    totalQuantity: null,
    usedQuantity: null,
    startDate: null,
    endDate: null,
    isActive: null,
    createdAt: null,
    updatedAt: null
  };
  proxy.resetForm("couponsManageRef");
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

// 添加停用按钮操作
function handleDisable(row) {
  const _couponId = row.couponId;
  proxy.$modal.confirm('是否确认停用优惠券"' + row.code + '"？').then(function() {
    // 创建优惠券对象，只更新状态字段
    const updateCoupon = {
      couponId: _couponId,
      code: row.code,
      isActive: 0  // 设置为停用状态
    };
    return updateCouponsManage(updateCoupon);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("优惠券已停用");
  }).catch(() => {});
}

// 添加启用按钮操作
function handleEnable(row) {
  const _couponId = row.couponId;
  proxy.$modal.confirm('是否确认启用优惠券"' + row.code + '"？').then(function() {
    // 创建优惠券对象，只更新状态字段
    const updateCoupon = {
      couponId: _couponId,
      code: row.code,
      isActive: 1  // 设置为启用状态
    };
    return updateCouponsManage(updateCoupon);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("优惠券已启用");
  }).catch(() => {});
}

// 添加查看详细按钮操作
function handleView(row) {
  getCouponsManage(row.couponId).then(response => {
    viewForm.value = response.data;
    viewOpen.value = true;
    title.value = "优惠券详情";
  });
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.couponId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  isAddMode.value = true;
  open.value = true;
  title.value = "添加优惠券";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _couponId = row.couponId || ids.value
  getCouponsManage(_couponId).then(response => {
    form.value = response.data;
    isAddMode.value = false;
    open.value = true;
    title.value = "修改优惠券";
  });
}

// 类型变化时的处理函数
function handleTypeChange(value) {
  // 重置面值
  form.value.value = null;
  // 清除面值验证错误
  proxy.$refs.couponsManageRef.clearValidate('value');
}

// 获取面值输入框的提示文字
function getValuePlaceholder(type) {
  if (type === 1) {
    return "请输入0.01-0.99之间的小数";
  } else if (type === 0) {
    return "请输入整数";
  }
  return "请输入面值";
}

// 获取面值输入框的提示信息
function getValueTip(type) {
  if (type === 1) {
    return "折扣类型：请输入0.01-0.99之间的小数，如0.85表示8.5折";
  } else if (type === 0) {
    return "满减类型：请输入整数，不能大于最低消费";
  }
  return "";
}

// 面值验证规则
function validateValue(rule, value, callback) {
  if (!value && value !== 0) {
    return callback(new Error('面值不能为空'));
  }

  const type = form.value.type;
  
  // 折扣类型验证
  if (type === 1) {
    if (value <= 0 || value >= 1) {
      callback(new Error('折扣类型面值必须在0.01-0.99之间'));
    } else if (!/^\d+(\.\d{1,2})?$/.test(value)) {
      callback(new Error('折扣类型面值最多只能有两位小数'));
    } else {
      callback();
    }
  } 
  // 满减类型验证
  else if (type === 0) {
    if (!Number.isInteger(value)) {
      callback(new Error('满减类型面值必须为整数'));
    } else if (value <= 0) {
      callback(new Error('满减类型面值必须大于0'));
    } else if (form.value.minPurchase && value > form.value.minPurchase) {
      callback(new Error('满减类型面值不能大于最低消费'));
    } else {
      callback();
    }
  } else {
    callback(new Error('请选择优惠券类型'));
  }
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["couponsManageRef"].validate(valid => {
    if (valid) {
      if (form.value.couponId != null) {
        updateCouponsManage(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCouponsManage(form.value).then(response => {
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
  const _couponIds = row.couponId || ids.value;
  proxy.$modal.confirm('是否确认删除优惠券编号为"' + _couponIds + '"的数据项？').then(function() {
    return delCouponsManage(_couponIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/couponsManage/export', {
    ...queryParams.value
  }, `couponsManage_${new Date().getTime()}.xlsx`)
}


//发放优惠卷逻辑实现

//获取可用用户列表
const UserList=ref([])
// 发放优惠券相关变量
const issueOpen = ref(false);
const issueTitle = ref("");
const issueLoading = ref(false);
const selectedUserIds = ref([]);
const issueForm = ref({
  couponId: null,
  couponCode: ""
});
const userTableRef = ref();

// 发放优惠券按钮操作
function handleIssue(row) {
  issueForm.value.couponId = row.couponId;
  issueForm.value.couponCode = row.code;
  issueForm.value.remainingQuantity = row.totalQuantity - row.usedQuantity;
  issueTitle.value = "发放优惠券";
  
  loadAllParams.userId = null;
  loadAllParams.status = '0';
  listUserManage(loadAllParams).then(res => {
    UserList.value = res.rows;
    issueOpen.value = true;
    
    // 清空之前的选择
    nextTick(() => {
      if (userTableRef.value) {
        userTableRef.value.clearSelection();
      }
    });
  });
}

// 用户选择变化
function handleUserSelectionChange(selection) {
  selectedUserIds.value = selection.map(item => item.userId);
}

// 取消发放
function cancelIssue() {
  issueOpen.value = false;
  selectedUserIds.value = [];
}

// 提交发放请求
function submitIssue() {
  if (selectedUserIds.value.length === 0) {
    proxy.$modal.msgWarning("请至少选择一个用户");
    return;
  }
  
  issueLoading.value = true;
  
  // 调用发放优惠券接口
  issueCoupons(issueForm.value.couponId, selectedUserIds.value).then(response => {
    proxy.$modal.msgSuccess("发放成功");
    issueOpen.value = false;
    getList(); // 重新加载列表以更新已分配量
  }).catch(error => {
    proxy.$modal.msgError("发放失败");
  }).finally(() => {
    issueLoading.value = false;
  });
  
  // // 模拟API调用（你需要替换为真实的API调用）
  // setTimeout(() => {
  //   console.log("发放优惠券:", issueForm.value.couponId, "给用户:", selectedUserIds.value);
  //   proxy.$modal.msgSuccess("发放成功");
  //   issueOpen.value = false;
  //   issueLoading.value = false;
  // }, 1000);
}


getList();
</script>

<style scoped>
/* 优惠券详情对话框样式 */
.coupon-detail-dialog {
  border-radius: 8px;
  overflow: hidden;
}

.coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.coupon-code {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.coupon-status {
  font-size: 16px;
}

:deep(.el-divider) {
  margin: 15px 0;
}

.coupon-info {
  padding: 0 10px;
}

.info-item {
  display: flex;
  margin-bottom: 15px;
  align-items: center;
}

.info-label {
  width: 100px;
  color: #606266;
  font-weight: 500;
  font-size: 14px;
}

.info-value {
  flex: 1;
  color: #303133;
  font-size: 14px;
}

:deep(.el-dialog__body) {
  padding: 25px 30px;
}

:deep(.el-dialog__header) {
  padding: 20px 30px 10px;
  border-bottom: 1px solid #eee;
}

:deep(.el-dialog__footer) {
  padding: 15px 30px 20px;
  border-top: 1px solid #eee;
}

.dialog-footer {
  text-align: right;
}

/* 优惠券表单对话框样式 */
.coupon-form-dialog {
  border-radius: 8px;
}

:deep(.coupon-form-dialog .el-dialog__body) {
  padding: 20px 30px;
}

:deep(.coupon-form-dialog .el-dialog__header) {
  padding: 20px 30px 10px;
  border-bottom: 1px solid #eee;
}

:deep(.coupon-form-dialog .el-dialog__footer) {
  padding: 15px 30px 20px;
  border-top: 1px solid #eee;
}

:deep(.coupon-form-dialog .el-form-item__label) {
  font-weight: 500;
}

:deep(.coupon-form-dialog .el-input.is-disabled .el-input__inner) {
  background-color: #f5f7fa;
  color: #909399;
}

:deep(.coupon-form-dialog .el-radio.is-disabled) {
  color: #909399;
}

:deep(.coupon-form-dialog .el-input__inner[type="number"]) {
  appearance: textfield;
}

:deep(.coupon-form-dialog .el-input__inner[type="number"]::-webkit-outer-spin-button),
:deep(.coupon-form-dialog .el-input__inner[type="number"]::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

/* 发放优惠券对话框样式 */
:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-table) {
  margin-top: 10px;
}
</style>