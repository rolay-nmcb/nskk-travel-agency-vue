import request from '@/utils/request'

// 查询游记管理列表
export function listTravelNotesManage(query) {
  return request({
    url: '/manage/travelNotesManage/list',
    method: 'get',
    params: query
  })
}

// 查询游记管理详细
export function getTravelNotesManage(noteId) {
  return request({
    url: '/manage/travelNotesManage/' + noteId,
    method: 'get'
  })
}

// 新增游记管理
export function addTravelNotesManage(data) {
  return request({
    url: '/manage/travelNotesManage',
    method: 'post',
    data: data
  })
}

// 修改游记管理
export function updateTravelNotesManage(data) {
  return request({
    url: '/manage/travelNotesManage',
    method: 'put',
    data: data
  })
}

// 删除游记管理
export function delTravelNotesManage(noteId) {
  return request({
    url: '/manage/travelNotesManage/' + noteId,
    method: 'delete'
  })
}
