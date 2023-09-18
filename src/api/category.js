import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/category/query',
    method: 'get',
    params: query
  })
}
export function queryL1() {
  return request({
    url: '/category/queryL1',
    method: 'get'
  })
}
export function queryL2() {
  return request({
    url: '/category/queryL2',
    method: 'get'
  })
}
export function updateStoreImport(data) {
  return request({
    url: '/category/update',
    method: 'post',
    data
  })
}
export function deleteDraw(data) {
  return request({
    url: '/category/delete',
    method: 'post',
    data
  })
}
export function createDraw(data) {
  return request({
    url: '/category/insert',
    method: 'post',
    data
  })
}
