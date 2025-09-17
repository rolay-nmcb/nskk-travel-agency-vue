import request from '@/utils/request'

// 查询支付记录列表
export function listManagePayments(query) {
  return request({
    url: '/manage/managePayments/list',
    method: 'get',
    params: query
  })
}

// 查询支付记录详细
export function getManagePayments(paymentId) {
  return request({
    url: '/manage/managePayments/' + paymentId,
    method: 'get'
  })
}

// 新增支付记录
export function addManagePayments(data) {
  return request({
    url: '/manage/managePayments',
    method: 'post',
    data: data
  })
}

// 修改支付记录
export function updateManagePayments(data) {
  return request({
    url: '/manage/managePayments',
    method: 'put',
    data: data
  })
}

// 删除支付记录
export function delManagePayments(paymentId) {
  return request({
    url: '/manage/managePayments/' + paymentId,
    method: 'delete'
  })
}
