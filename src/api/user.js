import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/user/list',
    method: 'get',
    params: query
  })
}

export function userDetail(id) {
  return request({
    url: '/user/detail',
    method: 'get',
    params: id
  })
}

export function updateUser(data) {
  return request({
    url: '/user/update',
    method: 'post',
    data
  })
}

export function listCollect(query) {
  return request({
    url: '/user/collectList',
    method: 'get',
    params: query
  })
}

export function listHistory(query) {
  return request({
    url: '/user/historyList',
    method: 'get',
    params: query
  })
}
