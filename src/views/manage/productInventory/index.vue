<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="产品编号" prop="productId">
        <el-input
          v-model="queryParams.productId"
          placeholder="请输入产品编号"
          clearable
          @keyup.enter="handleQuery"
        />
        <!-- <el-select v-model="queryParams.productId" placeholder="请选择产品" clearable filterable>
          <el-option
            v-for="item in productsList"
            :key="item.productId"
            :label="item.title"
            :value="item.productId"
          />
        </el-select> -->
      </el-form-item>
      <el-form-item label="出发日期" prop="departureDate">
        <el-date-picker clearable
          v-model="queryParams.departureDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择出发日期">
        </el-date-picker>
      </el-form-item>
      <!-- <el-form-item label="可用库存" prop="availableStock">
        <el-input
          v-model="queryParams.availableStock"
          placeholder="请输入可用库存"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="是否可售" prop="isActive">
        <el-select v-model="queryParams.isActive" placeholder="请选择是否可售" clearable>
          <el-option
            v-for="dict in sale_status"
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
          v-hasPermi="['manage:productInventory:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['manage:productInventory:edit']"
        >修改</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['manage:productInventory:remove']"
        >删除</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['manage:productInventory:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="productInventoryList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="inventoryId" type="index" width="50" />
      <el-table-column label="产品名称" align="center" prop="productId" >
        <template #default="scope">
          <span v-for="item in productsList" :key="item.productId" >
            <span v-if="item.productId === scope.row.productId">{{ item.title }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="出发日期" align="center" prop="departureDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.departureDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="成人价格" align="center" prop="adultPrice" >
        <template #default="scope">
          <el-tag>¥{{ scope.row.adultPrice }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="儿童价格" align="center" prop="childPrice" >
        <template #default="scope">
          <el-tag>¥{{ scope.row.childPrice }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="库存数量" align="center" prop="availableStock" />
      <el-table-column label="是否可售" align="center" prop="isActive">
        <template #default="scope">
          <dict-tag :options="sale_status" :value="scope.row.isActive"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['manage:productInventory:edit']">修改</el-button>
          <!-- <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['manage:productInventory:remove']">删除</el-button> -->
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

    <!-- 添加或修改产品库存价格对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="productInventoryRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="产品编号" prop="productId">
          <!-- <el-input 
            v-model="form.productId" 
            placeholder="请输入产品编号" 
            type="number"
            @input="form.productId = String(form.productId).replace(/[^\d]/g, '')"
            :disabled="form.inventoryId != null" 
          /> -->
          <el-select v-model="form.productId" placeholder="请选择产品" clearable filterable>
          <el-option
            v-for="item in productsList"
            :key="item.productId"
            :label="item.title"
            :value="item.productId"
          />
        </el-select>
        </el-form-item>
        <el-form-item label="产品名称">
          <template #default="scope">
            <span v-for="item in productsList" :key="item.productId" >
              <span v-if="form.productId === item.productId">{{ item.title }}</span>
            </span>
        </template>
        </el-form-item>
        <el-form-item label="出发日期" prop="departureDate">
          <el-date-picker clearable
            v-model="form.departureDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择出发日期">
          </el-date-picker>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="成人价格" prop="adultPrice">
              <el-input 
                v-model="form.adultPrice" 
                type="number"
                placeholder="请输入成人价格" 
                @input="form.adultPrice = String(form.adultPrice).replace(/[^\d]/g, '')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="儿童价格" prop="childPrice">
              <el-input 
                v-model="form.childPrice" 
                type="number"
                placeholder="请输入儿童价格" 
                @input="form.childPrice = String(form.childPrice).replace(/[^\d]/g, '')"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="初始库存" prop="initialStock">
              <el-input 
                v-model="form.initialStock" 
                type="number"
                placeholder="请输入初始库存" 
                :disabled="form.inventoryId != null" 
                @input="form.initialStock = String(form.initialStock).replace(/[^\d]/g, '')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="可用库存" prop="availableStock">
              <el-input 
                v-model="form.availableStock" 
                type="number"
                placeholder="请输入可用库存" 
                @input="form.availableStock = String(form.availableStock).replace(/[^\d]/g, '')"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="是否可售" prop="isActive">
          <el-radio-group v-model="form.isActive">
            <el-radio
              v-for="dict in sale_status"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ProductInventory">
import { listProductInventory, getProductInventory, delProductInventory, addProductInventory, updateProductInventory } from "@/api/manage/productInventory";
import {loadAllParams} from "@/api/page";
import {listProducts} from "@/api/manage/products";

const { proxy } = getCurrentInstance();
const { sale_status } = proxy.useDict('sale_status');

const productInventoryList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    productId: null,
    departureDate: null,
    availableStock: null,
    isActive: null,
  },
  rules: {
    productId: [
      { required: true, message: "产品ID不能为空", trigger: "blur" }
    ],
    departureDate: [
      { required: true, message: "出发日期不能为空", trigger: "blur" }
    ],
    adultPrice: [
      { required: true, message: "成人价格不能为空", trigger: "blur" }
    ],
    childPrice: [
      { required: true, message: "儿童价格不能为空", trigger: "blur" }
    ],
    initialStock: [
      { required: true, message: "初始库存不能为空", trigger: "blur" }
    ],
    availableStock: [
      { required: true, message: "可用库存不能为空", trigger: "blur" },
      {
        validator(rule, value, callback) {
          const initial = Number(data.form.initialStock);
          const available = Number(value);
          if (available > initial) {
            callback(new Error("可用库存不能大于初始库存"));
          } else {
            callback();
          }
        },
        trigger: "blur"
      }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询产品库存价格列表 */
function getList() {
  loading.value = true;
  listProductInventory(queryParams.value).then(response => {
    productInventoryList.value = response.rows;
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
    inventoryId: null,
    productId: null,
    productName: '',
    departureDate: null,
    adultPrice: null,
    childPrice: null,
    initialStock: null,
    availableStock: null,
    isActive: null,
    createdAt: null,
    updatedAt: null
  };
  proxy.resetForm("productInventoryRef");
}

// 在 <script setup> 内添加获取产品名称的方法
function getProductName(productId) {
  const product = productsList.value.find(item => item.productId === productId);
  return product ? product.title : '';
}

function updateProductName() {
  const product = productsList.value.find(item => item.productId === form.value.productId);
  form.value.productName = product ? product.title : '';
}

// 初始化时也同步一次
watch(() => form.value.productId, () => {
  updateProductName();
});

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
  ids.value = selection.map(item => item.inventoryId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加产品库存价格";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _inventoryId = row.inventoryId || ids.value
  getProductInventory(_inventoryId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改产品库存价格";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["productInventoryRef"].validate(valid => {
    if (valid) {
      if (form.value.inventoryId != null) {
        updateProductInventory(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addProductInventory(form.value).then(response => {
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
  const _inventoryIds = row.inventoryId || ids.value;
  proxy.$modal.confirm('是否确认删除产品库存价格编号为"' + _inventoryIds + '"的数据项？').then(function() {
    return delProductInventory(_inventoryIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/productInventory/export', {
    ...queryParams.value
  }, `productInventory_${new Date().getTime()}.xlsx`)
}

const productsList = ref([]);
// 获取所有产品
function getAllProducts() {
  loadAllParams.status = "1";
  listProducts(loadAllParams).then(response => {
    productsList.value = response.rows;
  });
}

getList();
getAllProducts();
</script>
