import request from '@/utils/request'

// 查询购买产品列表
export function listUserProducts(query) {
  return request({
    url: '/user/userProducts/list',
    method: 'get',
    params: query
  })
}

// 查询购买产品详细
export function getUserProducts(productId) {
  return request({
    url: '/user/userProducts/' + productId,
    method: 'get'
  })
}

// 新增购买产品
export function addUserProducts(data) {
  return request({
    url: '/user/userProducts',
    method: 'post',
    data: data
  })
}

// 修改购买产品
export function updateUserProducts(data) {
  return request({
    url: '/user/userProducts',
    method: 'put',
    data: data
  })
}

// 删除购买产品
export function delUserProducts(productId) {
  return request({
    url: '/user/userProducts/' + productId,
    method: 'delete'
  })
}
