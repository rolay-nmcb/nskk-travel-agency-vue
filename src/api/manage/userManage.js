import request from '@/utils/request'

// 查询用户信息管理列表
export function listUserManage(query) {
  return request({
    url: '/system/user/list',
    method: 'get',
    params: query
  })
}

// 查询用户信息管理详细
export function getUserManage(userId) {
  return request({
    url: '/system/user/' + userId,
    method: 'get'
  })
}

// 新增用户信息管理
export function addUserManage(data) {
  return request({
    url: '/system/user/',
    method: 'post',
    data: data
  })
}

// 修改用户信息管理
export function updateUserManage(data) {
  return request({
    url: '/system/user/',
    method: 'put',
    data: data
  })
}

// 删除用户信息管理
export function delUserManage(userId) {
  return request({
    url: '/system/user/' + userId,
    method: 'delete'
  })
}
