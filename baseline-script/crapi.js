import config from './config.js'
import axios from 'axios'
import { downloadFile } from './helpers.js'
import { createReadStream } from 'fs'
import FormData from 'form-data'
import temp from 'temp'

export async function crapiRequest(url, method, data, headers, params) {
  return new Promise((resolve, reject) => {
    axios({
      method,
      url,
      data,
      params,
      headers: { ...headers, 'Content-Type': 'application/json' },
      baseURL: `http://${config.crapi}`,
    })
      .then(resp => resolve(resp))
      .catch(err => reject(err))
  })
}

export async function register(user) {
  const result = await crapiRequest('/identity/api/auth/signup', 'POST', {
    email: user.email,
    password: user.password,
    name: user.name,
    number: user.number,
  })
  return result
}

export async function login(user) {
  const result = await crapiRequest('/identity/api/auth/login', 'POST', {
    email: user.email,
    password: user.password,
  })
  return result
}

export async function dashboard(user) {
  const result = await crapiRequest('/identity/api/v2/user/dashboard', 'GET', undefined, { Authorization: `Bearer ${user.token}` })
  return result
}

export async function getVehicles(user) {
  const result = await crapiRequest('/identity/api/v2/vehicle/vehicles', 'GET', undefined, { Authorization: `Bearer ${user.token}` })
  return result
}

export async function addVehicle(user, vin, pincode) {
  const result = await crapiRequest('/identity/api/v2/vehicle/add_vehicle', 'POST', { vin, pincode }, { Authorization: `Bearer ${user.token}` })
  return result
}

export async function getVehicleLocation(user, id) {
  const result = await crapiRequest(`/identity/api/v2/vehicle/${id}/location`, 'GET', undefined, { Authorization: `Bearer ${user.token}` })
  return result
}

export async function getMechanics(user) {
  const result = await crapiRequest('/workshop/api/mechanic', 'GET', undefined, { Authorization: `Bearer ${user.token}` })
  return result
}

export async function getProducts(user) {
  const result = await crapiRequest('/workshop/api/shop/products', 'GET', undefined, { Authorization: `Bearer ${user.token}` })
  return result
}

export async function placeOrder(user, product_id, quantity) {
  const result = await crapiRequest('/workshop/api/shop/orders', 'POST', { product_id, quantity }, { Authorization: `Bearer ${user.token}` })
  return result
}

export async function getPastOrders(user) {
  const result = await crapiRequest('/workshop/api/shop/orders/all', 'GET', undefined, { Authorization: `Bearer ${user.token}` })
  return result
}

export async function returnOrder(user, orderId) {
  const result = await crapiRequest('/workshop/api/shop/orders/return_order', 'POST', undefined, { Authorization: `Bearer ${user.token}` }, { order_id: orderId })
  return result
}

export async function getRecentPosts(user) {
  const result = await crapiRequest('/community/api/v2/community/posts/recent', 'GET', undefined, { Authorization: `Bearer ${user.token}` })
  return result
}

export async function getPost(user, postId) {
  if (!user.token) return
  const result = await crapiRequest(`/community/api/v2/community/posts/${postId}`, 'GET', undefined, { Authorization: `Bearer ${user.token}` })
  return result
}

export async function addComment(user, postId, content) {
  const result = await crapiRequest(`/community/api/v2/community/posts/${postId}/comment`, 'POST', { content }, { Authorization: `Bearer ${user.token}` })
  return result
}

export async function makePost(user, title, content) {
  const result = await crapiRequest('/community/api/v2/community/posts', 'POST', { title, content }, { Authorization: `Bearer ${user.token}` })
  return result
}

export async function makeMechanicReport(user, vin, mechanic_code, problem_details) {
  const result = await crapiRequest(
    '/workshop/api/merchant/contact_mechanic',
    'POST',
    {
      vin,
      mechanic_code,
      problem_details,
      mechanic_api: `https://${config.crapi}/workshop/api/mechanic/receive_report`,
      repeat_request_if_failed: false,
      number_of_repeats: 1,
    },
    { Authorization: `Bearer ${user.token}` }
  )
  return result
}

export async function getMechanicReport(user, report_id) {
  const result = await crapiRequest('/workshop/api/mechanic/mechanic_report', 'GET', null, { Authorization: `Bearer ${user.token}` }, { report_id })
  return result
}

export async function setAvatar(user) {
  const file = temp.path({ suffix: '.jpg' })
  await downloadFile(user.avatar, file)

  const formData = new FormData()
  formData.append('file', createReadStream(file))

  const result = await crapiRequest('/identity/api/v2/user/pictures', 'POST', formData, { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` })
  return result
}
