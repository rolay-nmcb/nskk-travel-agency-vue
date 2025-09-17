import request from '@/utils/request'

// 查询订单用户列表
export function listUserOrders(query) {
  return request({
    url: '/user/userOrders/list',
    method: 'get',
    params: query
  })
}

// 查询订单用户详细
export function getUserOrders(orderId) {
  return request({
    url: '/user/userOrders/' + orderId,
    method: 'get'
  })
}

// 新增订单用户
export function addUserOrders(data) {
  return request({
    url: '/user/userOrders',
    method: 'post',
    data: data
  })
}

//支付订单
export function payUserOrder(data) {
  return request({
    url: '/user/userOrders/payOrder',
    method: 'put',
    data: data
  })
}

// 修改订单用户
export function updateUserOrders(data) {
  return request({
    url: '/user/userOrders',
    method: 'put',
    data: data
  })
}

// 删除订单用户
export function delUserOrders(orderId) {
  return request({
    url: '/user/userOrders/' + orderId,
    method: 'delete'
  })
}

//改签订单
export function changeUserOrders(data) {
  return request({
    url: '/user/userOrders/changeOrder',
    method: 'put',
    data: data
  })
}

//取消改签订单
export function cancelChangeUserOrders(data) {
  return request({
    url: '/user/userOrders/cancelChangeOrder',
    method: 'put',
    data: data
  })
}

//取消订单
export function cancelUserOrders(data) {
  return request({
    url: '/user/userOrders/cancelOrder',
    method: 'put',
    data: data
  })
}

//取消退款
export function cancelRefundUserOrders(data) {
  return request({
    url: '/user/userOrders/cancelRefundOrder',
    method: 'put',
    data: data
  })
}

//确认订单
export function confirmUserOrders(data) {
  return request({
    url: '/user/userOrders/confirmOrder',
    method: 'put',
    data: data
  })
}

//完成订单
export function completeUserOrders(data) {
  return request({
    url: '/user/userOrders/completeOrder',
    method: 'put',
    data: data
  })
}
