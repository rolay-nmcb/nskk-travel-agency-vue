import request from '@/utils/request'

// 查询产品评价列表
export function listReviewsManage(query) {
  return request({
    url: '/manage/reviewsManage/list',
    method: 'get',
    params: query
  })
}

// 查询产品评价详细
export function getReviewsManage(reviewId) {
  return request({
    url: '/manage/reviewsManage/' + reviewId,
    method: 'get'
  })
}

// 新增产品评价
export function addReviewsManage(data) {
  return request({
    url: '/manage/reviewsManage',
    method: 'post',
    data: data
  })
}

// 修改产品评价
export function updateReviewsManage(data) {
  return request({
    url: '/manage/reviewsManage',
    method: 'put',
    data: data
  })
}

// 删除产品评价
export function delReviewsManage(reviewId) {
  return request({
    url: '/manage/reviewsManage/' + reviewId,
    method: 'delete'
  })
}
