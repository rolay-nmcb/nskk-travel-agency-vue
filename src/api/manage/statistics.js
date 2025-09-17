import request from '@/utils/request'


//查询top5热门产品
export function listTop5Products() {
  return request({
    url: '/common/statistics/top5Products',
    method: 'get'
  })
}

//查询top5热门目的地
export function listTop5Destinations() {
  return request({
    url: '/common/statistics/top5Destinations',
    method: 'get'
  })
}

//获取订单统计数据
export function getSalesDatas() {
  return request({
    url: '/common/statistics//salesDatas',
    method: 'get'
  })
}

//获取近七日订单统计数据
export function getSevenDaysSalesDatas() {
  return request({
    url: '/common/statistics/salesDatas/last7Days',
    method: 'get'
  })
}

//获取近12个月订单统计数据
export function getTwelveMonthSalesDatas() {
  return request({
    url: '/common/statistics/salesDatas/last12Months',
    method: 'get'
  })
}

//获取销量前五的产品数据
export function getSalesTop5Products() {
  return request({
    url: '/common/statistics/salesDatas/top5Products',
    method: 'get'
  })
}

//获取低评分的产品数据
export function getLowScoreProducts() {
  return request({
    url: '/common/statistics/salesDatas/lowRatingProducts',
    method: 'get'
  })
}