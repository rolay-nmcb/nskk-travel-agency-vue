import request from '@/utils/request'

// 查询优惠券列表
export function listCouponsManage(query) {
  return request({
    url: '/manage/couponsManage/list',
    method: 'get',
    params: query
  })
}

// 查询优惠券详细
export function getCouponsManage(couponId) {
  return request({
    url: '/manage/couponsManage/' + couponId,
    method: 'get'
  })
}

// 发放优惠券
export function issueCoupons(couponId, data) {
  return request({
    url: '/manage/couponsManage/issue/' + couponId,
    method: 'post',
    data: data
  })
}

// 新增优惠券
export function addCouponsManage(data) {
  return request({
    url: '/manage/couponsManage',
    method: 'post',
    data: data
  })
}

// 修改优惠券
export function updateCouponsManage(data) {
  return request({
    url: '/manage/couponsManage',
    method: 'put',
    data: data
  })
}

// 删除优惠券
export function delCouponsManage(couponId) {
  return request({
    url: '/manage/couponsManage/' + couponId,
    method: 'delete'
  })
}
