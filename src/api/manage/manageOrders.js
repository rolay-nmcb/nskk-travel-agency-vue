import request from '@/utils/request'

// 查询订单管理列表
export function listManageOrders(query) {
  return request({
    url: '/manage/manageOrders/list',
    method: 'get',
    params: query
  })
}

// 查询订单管理详细
export function getManageOrders(orderId) {
  return request({
    url: '/manage/manageOrders/' + orderId,
    method: 'get'
  })
}

// 新增订单管理
export function addManageOrders(data) {
  return request({
    url: '/manage/manageOrders',
    method: 'post',
    data: data
  })
}

// 修改订单管理
export function updateManageOrders(data) {
  return request({
    url: '/manage/manageOrders',
    method: 'put',
    data: data
  })
}

export function refundOrder(orderId) {
  return request({
    url: '/manage/manageOrders/refund/'+orderId,
    method: 'put'
  })
}

// 删除订单管理
export function delManageOrders(orderId) {
  return request({
    url: '/manage/manageOrders/' + orderId,
    method: 'delete'
  })
}
