import request from '@/utils/request'

// 查询用户优惠券列表
export function listCouponsUserManage(query) {
  return request({
    url: '/manage/couponsUserManage/list',
    method: 'get',
    params: query
  })
}

// 查询用户优惠券详细
export function getCouponsUserManage(id) {
  return request({
    url: '/manage/couponsUserManage/' + id,
    method: 'get'
  })
}

// 新增用户优惠券
export function addCouponsUserManage(data) {
  return request({
    url: '/manage/couponsUserManage',
    method: 'post',
    data: data
  })
}

// 修改用户优惠券
export function updateCouponsUserManage(data) {
  return request({
    url: '/manage/couponsUserManage',
    method: 'put',
    data: data
  })
}

// 删除用户优惠券
export function delCouponsUserManage(id) {
  return request({
    url: '/manage/couponsUserManage/' + id,
    method: 'delete'
  })
}
