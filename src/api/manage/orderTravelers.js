import request from '@/utils/request'

// 查询订单旅客详细列表
export function listOrderTravelers(query) {
  return request({
    url: '/manage/orderTravelers/list',
    method: 'get',
    params: query
  })
}

// 查询订单旅客详细详细
export function getOrderTravelers(id) {
  return request({
    url: '/manage/orderTravelers/' + id,
    method: 'get'
  })
}

// 新增订单旅客详细
export function addOrderTravelers(data) {
  return request({
    url: '/manage/orderTravelers',
    method: 'post',
    data: data
  })
}

// 修改订单旅客详细
export function updateOrderTravelers(data) {
  return request({
    url: '/manage/orderTravelers',
    method: 'put',
    data: data
  })
}

// 删除订单旅客详细
export function delOrderTravelers(id) {
  return request({
    url: '/manage/orderTravelers/' + id,
    method: 'delete'
  })
}
