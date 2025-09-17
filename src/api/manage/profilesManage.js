import request from '@/utils/request'

// 查询用户信息列表
export function listProfilesManage(query) {
  return request({
    url: '/manage/profilesManage/list',
    method: 'get',
    params: query
  })
}

// 查询用户信息详细
export function getProfilesManage(profileId) {
  return request({
    url: '/manage/profilesManage/' + profileId,
    method: 'get'
  })
}

// 查询用户信息详细
export function getProfilesManageByUserId(userId) {
  return request({
    url: '/manage/profilesManage/userId/' + userId,
    method: 'get'
  })
}

// 新增用户信息
export function addProfilesManage(data) {
  return request({
    url: '/manage/profilesManage',
    method: 'post',
    data: data
  })
}

// 修改用户信息
export function updateProfilesManage(data) {
  return request({
    url: '/manage/profilesManage',
    method: 'put',
    data: data
  })
}

// 删除用户信息
export function delProfilesManage(profileId) {
  return request({
    url: '/manage/profilesManage/' + profileId,
    method: 'delete'
  })
}
