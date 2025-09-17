import request from '@/utils/request'

// 查询目的地管理列表
export function listDestinations(query) {
  return request({
    url: '/manage/destinations/list',
    method: 'get',
    params: query
  })
}

// 查询目的地管理详细
export function getDestinations(destinationId) {
  return request({
    url: '/manage/destinations/' + destinationId,
    method: 'get'
  })
}

// 新增目的地管理
export function addDestinations(data) {
  return request({
    url: '/manage/destinations',
    method: 'post',
    data: data
  })
}

// 修改目的地管理
export function updateDestinations(data) {
  return request({
    url: '/manage/destinations',
    method: 'put',
    data: data
  })
}

// 删除目的地管理
export function delDestinations(destinationId) {
  return request({
    url: '/manage/destinations/' + destinationId,
    method: 'delete'
  })
}
