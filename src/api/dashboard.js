import request from '@/utils/request'

export function info(query) {
  return request({
    url: '/stat/dashboard',
    method: 'get',
    params: query
  })
}
