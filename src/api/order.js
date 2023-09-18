import request from '@/utils/request'

export function listOrder(query) {
  return request({
    url: '/order/list',
    method: 'get',
    params: query,
  })
}

export function detailOrder(id) {
  return request({
    url: '/order/detail',
    method: 'get',
    params: { id }
  })
}

export function shipOrder(data) {
  return request({
    url: '/order/ship',
    method: 'post',
    data
  })
}

export function confirmOrder(data) {
  return request({
    url: '/order/confirm',
    method: 'post',
    data
  })
}

export function deleteOrder(data) {
  return request({
    url: '/order/delete',
    method: 'post',
    data
  })
}

export function listOrderGoods(query) {
  return request({
    url: '/order/orderGoodsList',
    method: 'get',
    params: query,
  })
}

export function rejectOrderGoods(data) {
  return request({
    url: '/order/reject',
    method: 'post',
    data
  })
}
export function drawbackOrderGoods(data) {
  return request({
    url: '/order/drawback',
    method: 'post',
    data
  })
}
