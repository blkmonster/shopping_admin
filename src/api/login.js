import request from '@/utils/request'

export function loginByUsername(username, password, code) {
  const data = {
    username,
    password,
    code
  }
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}

export function getUserInfo(token) {
  return request({
    url: '/info',
    method: 'get',
    params: { token }
  })
}

export function getKaptcha() {
  return request({
    url: '/kaptcha',
    method: 'get'
  })
}
