<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <!-- <el-form-item label="父级目的地ID" prop="parentId">
        <el-input
          v-model="queryParams.parentId"
          placeholder="请输入父级目的地ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="目的地" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入目的地"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择类型" clearable>
          <el-option
            v-for="dict in destination_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否热门" prop="isPopular">
        <el-radio-group v-model="queryParams.isPopular">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
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
          v-hasPermi="['manage:destinations:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="Sort"
          @click="toggleExpandAll"
        >展开/折叠</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="destinationsList"
      row-key="destinationId"
      :default-expand-all="isExpandAll"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column label="目的地名称" align="center" prop="name" />
      <el-table-column label="目的地ID" align="center" prop="destinationId" width="100"> 
      </el-table-column>
      <el-table-column label="类型" align="center" prop="type">
        <template #default="scope">
          <dict-tag :options="destination_type" :value="scope.row.type"/>
        </template>
      </el-table-column>
      <el-table-column label="标签" align="center" prop="tag" />
      <el-table-column label="封面图" align="center" prop="coverImage" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.coverImage" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createdAt, '{y}-{m}-{d} {h}:{m}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['manage:destinations:edit']">修改</el-button>
          <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['manage:destinations:add']">新增</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['manage:destinations:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改目的地管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="destinationsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="父级目的地ID" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="destinationsOptions"
            :props="{ value: 'destinationId', label: 'name', children: 'children' }"
            value-key="destinationId"
            placeholder="请选择父级目的地ID"
            check-strictly
            :disabled="form.destinationId != null"  
          />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型">
            <el-option
              v-for="dict in destination_type"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
         <el-form-item label="标签" prop="tag">
          <el-input v-model="form.tag" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="封面图" prop="coverImage">
          <image-upload v-model="form.coverImage"/>
        </el-form-item>
        <el-form-item label="是否热门" prop="isPopular">
          <el-radio-group v-model="form.isPopular">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
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

<script setup name="Destinations">
import { listDestinations, getDestinations, delDestinations, addDestinations, updateDestinations } from "@/api/manage/destinations";

const { proxy } = getCurrentInstance();
const { destination_type } = proxy.useDict('destination_type');

const destinationsList = ref([]);
const destinationsOptions = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const title = ref("");
const isExpandAll = ref(true);
const refreshTable = ref(true);

const data = reactive({
  form: {},
  queryParams: {
    parentId: null,
    name: null,
    type: null,
    isPopular: null,
  },
  rules: {
    name: [
      { required: true, message: "目的地名称不能为空", trigger: "blur" }
    ],
    type: [
      { required: true, message: "类型(0:大洲,1:国家,2:省州,3:城市,4:景点)不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询目的地管理列表 */
function getList() {
  loading.value = true;
  listDestinations(queryParams.value).then(response => {
    destinationsList.value = proxy.handleTree(response.data, "destinationId", "parentId");
    loading.value = false;
  });
}

/** 查询目的地管理下拉树结构 */
function getTreeselect() {
  listDestinations().then(response => {
    destinationsOptions.value = [];
    const data = { destinationId: 0, name: '顶级节点', children: [] };
    data.children = proxy.handleTree(response.data, "destinationId", "parentId");
    destinationsOptions.value.push(data);
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
    destinationId: null,
    parentId: null,
    name: null,
    type: null,
    tag: null,
    description: null,
    coverImage: null,
    isPopular: null,
    createdAt: null,
    updatedAt: null
  };
  proxy.resetForm("destinationsRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 新增按钮操作 */
function handleAdd(row) {
  reset();
  getTreeselect();
  if (row != null && row.destinationId) {
    form.value.parentId = row.destinationId;
  } else {
    form.value.parentId = 0;
  }
  open.value = true;
  title.value = "添加目的地管理";
}

/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  nextTick(() => {
    refreshTable.value = true;
  });
}

/** 修改按钮操作 */
async function handleUpdate(row) {
  reset();
  await getTreeselect();
  if (row != null) {
    form.value.parentId = row.parentId;
  }
  getDestinations(row.destinationId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改目的地管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["destinationsRef"].validate(valid => {
    if (valid) {
      if (form.value.destinationId != null) {
        updateDestinations(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addDestinations(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除目的地管理编号为"' + row.destinationId + '"的数据项？').then(function() {
    return delDestinations(row.destinationId);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

getList();
</script>
