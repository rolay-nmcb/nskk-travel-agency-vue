<template>
  <div>
    <el-dialog v-model="dialogVisible" @open="onOpen" @close="onClose" title="Dialog Titile">
      <el-form ref="formRef" :model="formData" :rules="rules" size="default" label-width="100px">
        <el-row gutter="15">
          <el-col :span="11">
            <el-form-item label="出发日期" prop="departureDate">
              <el-date-picker v-model="formData.departureDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                :style="{width: '100%'}" placeholder="请选择出发日期" clearable></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="最大库存量" prop="initialStock">
              <el-input-number v-model="formData.initialStock" placeholder="最大库存量"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row gutter="15">
          <el-col :span="10">
            <el-form-item label="成人价格" prop="adultPrice">
              <el-input-number v-model="formData.adultPrice" placeholder="成人价格"
                :precision='2'></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="小孩价格" prop="childPrice">
              <el-input-number v-model="formData.childPrice" placeholder="小孩价格"
                :precision='2'></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="handelConfirm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
import {
  ElMessage
}
from 'element-plus'
const formRef = ref()
const data = reactive({
  formData: {
    departureDate: null,
    initialStock: undefined,
    adultPrice: null,
    childPrice: null,
  },
  rules: {
    departureDate: [{
      required: true,
      message: '请选择出发日期',
      trigger: 'change'
    }],
    initialStock: [{
      required: true,
      message: '最大库存量',
      trigger: 'blur'
    }],
    adultPrice: [{
      required: true,
      message: '成人价格',
      trigger: 'blur'
    }],
    childPrice: [{
      required: true,
      message: '小孩价格',
      trigger: 'blur'
    }],
  }
})
const {
  formData,
  rules
} = toRefs(data)
// 弹窗设置
const dialogVisible = defineModel()
// 弹窗确认回调
const emit = defineEmits(['confirm'])
/**
 * @name: 弹窗打开后执行
 * @description: 弹窗打开后执行方法
 * @return {*}
 */
function onOpen() {}
/**
 * @name: 弹窗关闭时执行
 * @description: 弹窗关闭方法，重置表单
 * @return {*}
 */
function onClose() {
  formRef.value.resetFields()
}
/**
 * @name: 弹窗取消
 * @description: 弹窗取消方法
 * @return {*}
 */
function close() {
  dialogVisible.value = false
}
/**
 * @name: 弹窗表单提交
 * @description: 弹窗表单提交方法
 * @return {*}
 */
function handelConfirm() {
  formRef.value.validate((valid) => {
    if (!valid) return
    // TODO 提交表单
    close()
    // 回调父级组件
    emit('confirm')
  })
}

function handleNewTrip(item) {
  dialogVisible.value = true
  formData.value = {
    departureDate: null,
    initialStock: undefined,
    adultPrice: 1,
    childPrice: 2,
    productId: item.productId
  }
}

</script>
<style>
</style>
