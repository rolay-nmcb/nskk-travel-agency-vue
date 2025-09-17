<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="88px">
      <!-- <el-form-item label="产品ID" prop="productId">
        <el-input
          v-model="queryParams.productId"
          placeholder="请输入产品ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="产品标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入产品标题"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="产品分类" prop="categoryId">
        <!-- <el-input
          v-model="queryParams.categoryId"
          placeholder="请输入分类ID"
          clearable
          @keyup.enter="handleQuery"
        /> -->
        <el-select v-model="queryParams.categoryId" placeholder="请选择产品分类" clearable>
          <el-option
            v-for="item in productCategoriesList"
            :key="item.categoryId"
            :label="item.name"
            :value="item.categoryId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="目的地" prop="destinationIds">
        <el-cascader
          v-model="queryParams.destinationIds"
          placeholder="请选择目的地"
          clearable
          :options="destinationTree"
          :show-all-levels="false"
          :props="{
            label: 'name',
            value: 'destinationId',
            children: 'children',
            checkStrictly: true,
            checkOnClickNode: true,
          }"
        />
      </el-form-item>
      <!-- <el-form-item label="行程天数" prop="durationDays">
        <el-input
          v-model="queryParams.durationDays"
          placeholder="请输入行程天数"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="行程晚数" prop="durationNights">
        <el-input
          v-model="queryParams.durationNights"
          placeholder="请输入行程晚数"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in product_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="最小成团人数" prop="minTravelers">
        <el-input
          v-model="queryParams.minTravelers"
          placeholder="请输入最小成团人数"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="最大参团人数" prop="maxTravelers">
        <el-input
          v-model="queryParams.maxTravelers"
          placeholder="请输入最大参团人数"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item> -->
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
          v-hasPermi="['manage:products:add']"
        >新增</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['manage:products:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['manage:products:remove']"
        >删除</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['manage:products:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>


    <div class="products-grid">
      <div
        class="product-card"
        v-for="item in productsList"
        :key="item.productId"
      >
        <div class="card-image">
          <image-preview :src="item.coverImage" :width="140" :height="140" />
        </div>
        <div class="card-content">
          <div class="card-title">{{ item.title }}</div>
          <div class="card-subtitle">{{ item.subtitle }}</div>
          <div class="card-category">产品编号: {{ item.productId }}</div>
          <div class="card-category">
            分类：
            <span v-for="cat in productCategoriesList" :key="cat.categoryId">
              <span v-if="cat.categoryId === item.categoryId">{{ cat.name }}</span>
            </span>
          </div>
          <div class="card-destination">
            目的地：
            <span v-for="dest in destinationsList" :key="dest.destinationId">
              <span v-if="dest.destinationId === item.destinationId">{{ dest.name }}</span>
            </span>
          </div>
          <div class="card-days">
            {{ item.durationDays }}天{{ item.durationNights }}晚
          </div>
          <div class="card-travelers">
            观光团人数：{{ item.minTravelers }} ~ {{ item.maxTravelers }} 人
          </div>
          <div class="card-time">
            创建时间：{{ parseTime(item.createdAt, '{y}-{m}-{d}') }}
          </div>
          <div class="card-actions">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(item)" v-hasPermi="['manage:products:edit']">修改</el-button>
            <el-button link type="primary" icon="Edit" @click="getDetail(item)" v-hasPermi="['manage:productInventory:query']">查看在售库存</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(item)" v-hasPermi="['manage:products:remove']">删除</el-button>
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

  <el-dialog 
    :title="title" 
    v-model="open" 
    width="900px" 
    append-to-body 
    class="product-dialog"
    :close-on-click-modal="false"
  >
    <el-form 
      ref="productsRef" 
      :model="form" 
      :rules="rules" 
      label-width="110px" 
      class="product-form"
    >
      <!-- 基础信息卡片 -->
      <el-card class="form-card mb-4" shadow="hover">
        <div slot="header" class="card-header">
          <i class="el-icon-info-circle mr-2"></i>基础信息
        </div>
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="产品标题" prop="title">
              <el-input 
                v-model="form.title" 
                placeholder="请输入产品标题" 
                class="form-input"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="副标题" prop="subtitle">
              <el-input 
                v-model="form.subtitle" 
                placeholder="请输入副标题" 
                class="form-input"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="分类" prop="categoryId">
              <el-select 
                v-model="form.categoryId" 
                placeholder="请选择分类" 
                clearable
                class="form-select"
              >
                <el-option
                  v-for="item in productCategoriesList"
                  :key="item.categoryId"
                  :label="item.name"
                  :value="item.categoryId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="目的地" prop="destinationIds">
              <el-cascader
                v-model="form.destinationIds"
                placeholder="请选择目的地"
                clearable
                :options="destinationTree"
                :show-all-levels="false"
                :props="{
                  label: 'name',
                  value: 'destinationId',
                  children: 'children',
                  checkStrictly: true,
                }"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-select 
                v-model="form.status" 
                placeholder="请选择状态"
                class="form-select"
              >
                <el-option
                  v-for="dict in product_status"
                  :key="dict.value"
                  :label="dict.label"
                  :value="parseInt(dict.value)"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 行程信息卡片 -->
      <el-card class="form-card mb-4" shadow="hover">
        <div slot="header" class="card-header">
          <i class="el-icon-calendar mr-2"></i>行程信息
        </div>
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="天数/晚数">
              <el-input 
                v-model="form.durationDays" 
                type="number"
                placeholder="天数" 
                style="width: 90px; margin-right: 8px;" 
                class="form-input"
                @input="form.durationDays = form.durationDays.replace(/[^\d]/g, '')"
              />
              天
              <el-input 
                v-model="form.durationNights" 
                type="number"
                placeholder="晚数" 
                style="width: 90px;" 
                class="form-input"
                @input="form.durationNights = form.durationNights.replace(/[^\d]/g, '')"
              />
              &nbsp;&nbsp;晚
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="团人数">
              <el-input 
                v-model="form.minTravelers" 
                type="number"
                placeholder="最小人数" 
                style="width: 90px; margin-right: 8px;" 
                class="form-input"
                @input="form.minTravelers = form.minTravelers.replace(/[^\d]/g, '')"
              />
              <el-input 
                v-model="form.maxTravelers" 
                type="number"
                placeholder="最大人数" 
                style="width: 90px;" 
                class="form-input"
                @input="form.maxTravelers = form.maxTravelers.replace(/[^\d]/g, '')"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 详情信息卡片 -->
      <el-card class="form-card mb-4" shadow="hover">
        <div slot="header" class="card-header">
          <i class="el-icon-document mr-2"></i>详情信息
        </div>
        <el-form-item label="概述" prop="overview">
          <el-input 
            v-model="form.overview" 
            type="textarea" 
            placeholder="请输入产品概述" 
            rows="3"
            class="form-textarea"
          />
        </el-form-item>
        <el-form-item label="行程" prop="itinerary">
          <el-input 
            v-model="form.itinerary" 
            type="textarea" 
            placeholder="请输入行程安排" 
            rows="4"
            class="form-textarea"
          />
        </el-form-item>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="费用包含" prop="inclusions">
              <el-input 
                v-model="form.inclusions" 
                type="textarea" 
                placeholder="请输入费用包含内容" 
                rows="4"
                class="form-textarea"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="费用不含" prop="exclusions">
              <el-input 
                v-model="form.exclusions" 
                type="textarea" 
                placeholder="请输入费用不包含内容" 
                rows="4"
                class="form-textarea"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="须知" prop="notes">
          <el-input 
            v-model="form.notes" 
            type="textarea" 
            placeholder="请输入预订须知" 
            rows="3"
            class="form-textarea"
          />
        </el-form-item>
      </el-card>

      <!-- 图片信息卡片 -->
      <el-card class="form-card mb-4" shadow="hover">
        <div slot="header" class="card-header">
          <i class="el-icon-picture mr-2"></i>图片信息
        </div>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="封面图" prop="coverImage">
              <image-upload v-model="form.coverImage" class="image-uploader"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品相册" prop="images">
              <image-upload v-model="form.images" class="image-uploader" multiple/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <div class="dialog-footer">
        <el-button @click="cancel" class="cancel-btn">取 消</el-button>
        <el-button type="primary" @click="submitForm" class="confirm-btn">确 定</el-button>
      </div>
    </el-form>
  </el-dialog>

  <el-dialog 
    title="在售行程列表" 
    v-model="detailOpen" 
    width="900px" 
    append-to-body 
    class="product-dialog"
    :close-on-click-modal="false"
  >
  <el-table v-loading="loading" :data="inventoryList" @selection-change="handleSelectionChange">
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
    </el-table>
  </el-dialog>

  </div>
</template>

<script setup name="Products">
import { listProducts, getProducts, delProducts, addProducts, updateProducts } from "@/api/manage/products";
import {listProductCategories} from "@/api/manage/productCategories";
import {listDestinations} from "@/api/manage/destinations";
import {listProductInventory, getProductInventory} from "@/api/manage/productInventory";
import {loadAllParams} from "@/api/page";
import { useRoute } from 'vue-router'
// import {InventoryAdd} from "./components/inventoryAdd.vue"

const { proxy } = getCurrentInstance();
const { product_status } = proxy.useDict('product_status');

const productsList = ref([]);
const open = ref(false);
const detailOpen = ref(false);
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
    title: null,
    categoryId: null,
    destinationId: null,
    destinationIds: null,
    durationDays: null,
    durationNights: null,
    status: null,
    minTravelers: null,
    maxTravelers: null,
  },
  rules: {
    title: [
      { required: true, message: "产品标题不能为空", trigger: "blur" }
    ],
    categoryId: [
      { required: true, message: "分类ID不能为空", trigger: "blur" }
    ],
    destinationId: [
      { required: true, message: "目的地ID不能为空", trigger: "blur" }
    ],
    durationDays: [
      { required: true, message: "行程天数不能为空", trigger: "blur" }
    ],
    durationNights: [
      { required: true, message: "行程晚数不能为空", trigger: "blur" }
    ],
    minTravelers: [
      { required: true, message: "最小成团人数不能为空", trigger: "blur" }
    ],
    maxTravelers: [
      { required: true, message: "最大参团人数不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

// 获取路由实例
const route = useRoute()

// 监听路由变化并在组件加载时检查查询参数
onMounted(() => {
  // 检查路由中是否有 destination 查询参数
  if (route.query.destinationId) {
    // 设置查询参数并执行查询
    queryParams.value.destinationId = route.query.destinationId
    queryParams.value.destinationIds = [route.query.destinationId]
    handleQuery()
  }
})

// 如果需要在路由参数变化时也响应，可以使用 watch
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.destinationId) {
      queryParams.value.destinationId = newQuery.destinationId
      queryParams.value.destinationIds = [route.query.destinationId]
      handleQuery()
    }
  }
)

/** 查询产品管理列表 */
function getList() {
  loading.value = true;
  queryParams.value.destinationId = queryParams.value.destinationIds ? queryParams.value.destinationIds.slice(-1)[0] : null;
  listProducts(queryParams.value).then(response => {
    productsList.value = response.rows;
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
    productId: null,
    title: null,
    subtitle: null,
    categoryId: null,
    destinationId: null,
    destinationIds: null,
    coverImage: null,
    images: null,
    durationDays: null,
    durationNights: null,
    overview: null,
    itinerary: null,
    inclusions: null,
    exclusions: null,
    notes: null,
    status: null,
    minTravelers: null,
    maxTravelers: null,
    createdAt: null,
    updatedAt: null
  };
  proxy.resetForm("productsRef");
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
  ids.value = selection.map(item => item.productId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加产品管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _productId = row.productId || ids.value
  getProducts(_productId).then(response => {
    form.value = response.data;
    form.value.destinationIds = response.data.destinationId;
    open.value = true;
    title.value = "修改产品管理";
  });
}

// 处理表单提交时的 destinationIds
function submitForm() {
  proxy.$refs["productsRef"].validate(valid => {
    if (valid) {
      // 处理 destinationIds，确保传给后端的是正确的格式
      if (form.value.destinationIds) {
        if (Array.isArray(form.value.destinationIds)) {
          // 如果是数组，取最后一个元素（最深层级的目的地）
          form.value.destinationId = form.value.destinationIds.slice(-1)[0];
        } else if (typeof form.value.destinationIds === 'number' || typeof form.value.destinationIds === 'string') {
          // 如果是数字或字符串，直接赋值
          form.value.destinationId = form.value.destinationIds;
        }
        // 清空 destinationIds，避免传给后端造成混淆
        form.value.destinationIds = null;
      }
      
      // 提交表单逻辑...
      if (form.value.productId != null) {
        updateProducts(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addProducts(form.value).then(response => {
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
  const _productIds = row.productId || ids.value;
  proxy.$modal.confirm('是否确认删除产品管理编号为"' + _productIds + '"的数据项？').then(function() {
    return delProducts(_productIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/products/export', {
    ...queryParams.value
  }, `products_${new Date().getTime()}.xlsx`)
}

const productCategoriesList = ref([]);
//获取产品分类表
function getProductCategoriesList() {
  listProductCategories({
    pageNum: 1,
    pageSize: 10000
  }).then(response => {
    productCategoriesList.value = response.rows;
  });
}

const destinationsList = ref([]);
function buildTree(list, parentId = null) {
  return list
    .filter(item => item.parentId === parentId)
    .map(item => ({
      ...item,
      children: buildTree(list, item.destinationId)
    }));
}

const destinationTree = ref([]);
function getDestinationsList() {
  listDestinations({
    pageNum: 1,
    pageSize: 10000
  }).then(response => {
    destinationsList.value = response.data;
    destinationTree.value = buildTree(response.data);
  });
}

const inventoryList = ref([]);
//查看库存详细
function getDetail(row) {
  const _productId = row.productId 
  loadAllParams.productId = _productId
  loadAllParams.isActive = 1
  listProductInventory(loadAllParams).then(response => {
    inventoryList.value = response.rows;
    detailOpen.value = true;
  });
 
}

getList();
getProductCategoriesList();
getDestinationsList();
</script>

<style scoped lang="scss">
.products-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 48px;
  justify-content: flex-start;
  margin-top: 32px;
}
.product-card {
  width: 400px;
  height: 400px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 6px 32px rgba(58,123,213,0.10);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  transition: box-shadow 0.2s;
  overflow: hidden;
  position: relative;
  margin-bottom: 24px;
}
.card-image {
  width: 100%;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #e3f0ff 0%, #f8fbff 100%);
  border-bottom: 1px solid #f0f0f0;
}
.card-content {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 18px 24px 12px 24px;
}
.card-title {
  font-size: 22px;
  font-weight: 600;
  color: #3a7bd5;
  margin-bottom: 8px;
  text-align: left;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-subtitle {
  font-size: 15px;
  color: #666;
  margin-bottom: 8px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-category,
.card-destination,
.card-days,
.card-travelers,
.card-time {
  font-size: 14px;
  color: #888;
  margin-bottom: 6px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-actions {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}
@media (max-width: 900px) {
  .product-card {
    width: 100%;
    height: auto;
  }
  .products-grid {
    gap: 24px;
  }
}

.product-dialog {
  --primary-color: #1890ff;
  --border-radius: 6px;
  --card-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

/* 卡片样式 */
.form-card {
  border-radius: var(--border-radius);
  transition: all 0.3s ease;
}

.form-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.card-header {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
}

.mb-4 {
  margin-bottom: 16px !important;
}

/* 表单元素样式 */
.form-input,
.form-select,
.form-textarea {
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-textarea {
  resize: vertical;
}

/* 图片上传样式 */
.image-uploader {
  width: 100%;
}

/* 按钮样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  border-top: 1px solid #f2f2f2;
  margin-top: 16px;
}

.cancel-btn {
  margin-right: 8px;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background-color: #f5f5f5;
}

.confirm-btn {
  transition: all 0.2s ease;
}

.confirm-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .el-col {
    --el-col-span: 24 !important;
  }
}
</style>
