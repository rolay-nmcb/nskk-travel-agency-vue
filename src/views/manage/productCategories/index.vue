<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <!-- <el-form-item label="分类ID" prop="categoryId">
        <el-input
          v-model="queryParams.categoryId"
          placeholder="请输入分类ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="分类名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入分类名称"
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
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['manage:productCategories:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['manage:productCategories:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['manage:productCategories:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['manage:productCategories:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- <el-table v-loading="loading" :data="productCategoriesList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="categoryId" type="index" width="50" />
      <el-table-column label="分类名称" align="center" prop="name" />
      <el-table-column label="图标" align="center" prop="icon" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.icon" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createdAt, '{y}-{m}-{d} {h}:{m}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['manage:productCategories:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['manage:productCategories:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table> -->

    <div class="category-grid">
      <div
        class="category-card"
        v-for="item in productCategoriesList"
        :key="item.categoryId"
      >
        <div class="card-image">
          <image-preview :src="item.icon" :width="100" :height="100" />
        </div>
        <div class="card-content">
          <div class="card-title">{{ item.name }}</div>
          <div class="card-time">{{ parseTime(item.createdAt, '{y}-{m}-{d}') }}</div>
          <div class="card-actions">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(item)" v-hasPermi="['manage:productCategories:edit']">修改</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(item)" v-hasPermi="['manage:productCategories:remove']">删除</el-button>
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

    <!-- 添加或修改产品分类对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="productCategoriesRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="图片" prop="icon">
          <image-upload v-model="form.icon"/>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input v-model="form.sortOrder" placeholder="请输入排序" />
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

<script setup name="ProductCategories">
import { listProductCategories, getProductCategories, delProductCategories, addProductCategories, updateProductCategories } from "@/api/manage/productCategories";

const { proxy } = getCurrentInstance();

const productCategoriesList = ref([]);
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
    categoryId: null,
    name: null,
  },
  rules: {
    name: [
      { required: true, message: "分类名称不能为空", trigger: "blur" }
    ],
    sortOrder: [
      { required: true, message: "排序不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询产品分类列表 */
function getList() {
  loading.value = true;
  listProductCategories(queryParams.value).then(response => {
    productCategoriesList.value = response.rows;
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
    categoryId: null,
    name: null,
    icon: null,
    sortOrder: null,
    createdAt: null,
    updatedAt: null
  };
  proxy.resetForm("productCategoriesRef");
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
  ids.value = selection.map(item => item.categoryId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加产品分类";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _categoryId = row.categoryId || ids.value
  getProductCategories(_categoryId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改产品分类";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["productCategoriesRef"].validate(valid => {
    if (valid) {
      if (form.value.categoryId != null) {
        updateProductCategories(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addProductCategories(form.value).then(response => {
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
  const _categoryIds = row.categoryId || ids.value;
  proxy.$modal.confirm('是否确认删除产品分类编号为"' + _categoryIds + '"的数据项？').then(function() {
    return delProductCategories(_categoryIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/productCategories/export', {
    ...queryParams.value
  }, `productCategories_${new Date().getTime()}.xlsx`)
}

getList();
</script>

<style scoped lang="scss">
.category-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  justify-content: flex-start;
  margin-top: 32px;
}

.category-card {
  width: 320px;
  height: 320px;
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 6px 32px rgba(58,123,213,0.10);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  transition: box-shadow 0.2s;
  overflow: hidden;
  position: relative;
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
  align-items: center;
  justify-content: space-between;
  padding: 18px 12px 12px 12px;
}

.card-title {
  font-size: 22px;
  font-weight: 600;
  color: #3a7bd5;
  margin-bottom: 12px;
  text-align: center;
}

.card-time {
  font-size: 15px;
  color: #999;
  margin-bottom: 16px;
}

.card-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
