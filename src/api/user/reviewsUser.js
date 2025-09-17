import request from '@/utils/request'

// 查询用户产品评价列表
export function listReviewsUser(query) {
  return request({
    url: '/user/reviewsUser/list',
    method: 'get',
    params: query
  })
}

// 查询用户产品评价详细
export function getReviewsUser(reviewId) {
  return request({
    url: '/user/reviewsUser/' + reviewId,
    method: 'get'
  })
}

// 新增用户产品评价
export function addReviewsUser(data) {
  return request({
    url: '/user/reviewsUser',
    method: 'post',
    data: data
  })
}

// 修改用户产品评价
export function updateReviewsUser(data) {
  return request({
    url: '/user/reviewsUser',
    method: 'put',
    data: data
  })
}

// 修改用户产品评价点赞
export function updateReviewsUserLike(data) {
  return request({
    url: '/user/reviewsUser/like',
    method: 'put',
    data: data
  })
}

// 删除用户产品评价
export function delReviewsUser(reviewId) {
  return request({
    url: '/user/reviewsUser/' + reviewId,
    method: 'delete'
  })
}
