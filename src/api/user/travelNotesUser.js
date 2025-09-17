import request from '@/utils/request'

// 查询用户游记列表
export function listTravelNotesUser(query) {
  return request({
    url: '/user/travelNotesUser/list',
    method: 'get',
    params: query
  })
}

// 查询用户游记详细
export function getTravelNotesUser(noteId,userId) {
  return request({
    url: '/user/travelNotesUser/' + noteId + '/'+userId,
    method: 'get'
  })
}

// 新增用户游记
export function addTravelNotesUser(data) {
  return request({
    url: '/user/travelNotesUser',
    method: 'post',
    data: data
  })
}

// 修改用户游记
export function updateTravelNotesUser(data) {
  return request({
    url: '/user/travelNotesUser',
    method: 'put',
    data: data
  })
}

// 增加浏览量
export function addViewCountNotes(noteId) {
  return request({
    url: '/user/travelNotesUser/addViewCount/'+noteId,
    method: 'put',
  })
}

// 点赞用户游记
export function likeTravelNotesUser(data) {
  return request({
    url: '/user/travelNotesUser/like',
    method: 'put',
    data: data
  })
}

// 删除用户游记
export function delTravelNotesUser(noteId) {
  return request({
    url: '/user/travelNotesUser/' + noteId,
    method: 'delete'
  })
}
