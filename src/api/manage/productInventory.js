import request from '@/utils/request'

// 查询产品库存价格列表
export function listProductInventory(query) {
  return request({
    url: '/manage/productInventory/list',
    method: 'get',
    params: query
  })
}

// 查询产品库存价格详细
export function getProductInventory(inventoryId) {
  return request({
    url: '/manage/productInventory/' + inventoryId,
    method: 'get'
  })
}

//获取产品可用的出发日期列表
export function getProductInventoryDate(productId) {
  return request({
    url: '/manage/productInventory/' + productId +'/departure-dates',
    method: 'get'
  })
}

// 新增产品库存价格
export function addProductInventory(data) {
  return request({
    url: '/manage/productInventory',
    method: 'post',
    data: data
  })
}

// 修改产品库存价格
export function updateProductInventory(data) {
  return request({
    url: '/manage/productInventory',
    method: 'put',
    data: data
  })
}

// 删除产品库存价格
export function delProductInventory(inventoryId) {
  return request({
    url: '/manage/productInventory/' + inventoryId,
    method: 'delete'
  })
}
