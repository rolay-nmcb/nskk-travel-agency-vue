import request from '@/utils/request'

// 查询产品分类列表
export function listProductCategories(query) {
  return request({
    url: '/manage/productCategories/list',
    method: 'get',
    params: query
  })
}

// 查询产品分类详细
export function getProductCategories(categoryId) {
  return request({
    url: '/manage/productCategories/' + categoryId,
    method: 'get'
  })
}

// 新增产品分类
export function addProductCategories(data) {
  return request({
    url: '/manage/productCategories',
    method: 'post',
    data: data
  })
}

// 修改产品分类
export function updateProductCategories(data) {
  return request({
    url: '/manage/productCategories',
    method: 'put',
    data: data
  })
}

// 删除产品分类
export function delProductCategories(categoryId) {
  return request({
    url: '/manage/productCategories/' + categoryId,
    method: 'delete'
  })
}
