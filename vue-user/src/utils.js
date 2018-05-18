// 全局工具方法

import constants from './constants'
import Axios from 'axios'
import Qs from 'qs'
import Moment from 'moment'
import BigNumber from 'bignumber.js'

export default {
  /**
   * HTTP 请求工具
   */
  http: {
    /**
     * 提交 POST 请求
     *
     * @param {string} url 请求的 URL
     * @param {object} [parameters] 请求的参数
     * @return {Promise} Promise 对象，请求成功时传出服务器响应值，失败时抛出异常
     */
    post: function (url, parameters) {
      return ajax(url, 'POST', parameters)
    },

    /**
     * 提交 GET 请求
     *
     * @param {string} url 请求的 URL
     * @param {object} [parameters] 请求的参数
     * @return {Promise} Promise 对象，请求成功时传出服务器响应值，失败时抛出异常
     */
    get: function (url, parameters) {
      return ajax(url, 'GET', parameters)
    },

    /**
     * 提交 PUT 请求

     * @param {string} url 请求的 URL
     * @param {object} [parameters] 请求的参数
     * @return {Promise} Promise 对象，请求成功时传出服务器响应值，失败时抛出异常
     */
    put: function (url, parameters) {
      return ajax(url, 'PUT', parameters)
    },

    /**
     * 提交 DELETE 请求
     *
     * @param {string} url 请求的 URL
     * @param {object} [parameters] 请求的参数
     * @return {Promise} Promise 对象，请求成功时传出服务器响应值，失败时抛出异常
     */
    delete: function (url, parameters) {
      return ajax(url, 'DELETE', parameters)
    }
  },

  /**
   * 系统异常
   *
   * @param that 当前作用域
   */
  systemError: function (that) {
    that.$Notice.error({
      title: '系统异常，请重试',
      duration: 2
    })
  },

  /**
   * 登录超时
   *
   * @param that 当前作用域
   */
  timeOutLogin: function (that) {
    that.$Notice.warning({
      title: '登录超时',
      duration: 1,
      onClose: function () {
        that.$router.push({name: 'Login'})
      }
    })
  },

  /**
   * 获取打印所需的数据
   *
   */
  getPrintFoodInfo: function (foodArr, isPack) {
    let foodInfo = {}
    let foodList = []
    let totalPrice = new BigNumber(0)
    let totalPackFee = new BigNumber(0)
    for (let food of foodArr) {
      let newFood = {}
      newFood.name = food.name
      newFood.count = food.count
      totalPackFee = totalPackFee.plus((new BigNumber(food.count)).multipliedBy(new BigNumber(food.packFee)))
      if (isPack) {
        totalPrice = totalPrice.plus((new BigNumber(food.count)).multipliedBy(new BigNumber(food.packFee)))
      }
      if (food.isMember) {
        newFood.price = (new BigNumber(food.count)).multipliedBy(new BigNumber(food.memberPrice)).toString()
        totalPrice = totalPrice.plus((new BigNumber(food.count)).multipliedBy(new BigNumber(food.memberPrice)))
      } else {
        newFood.price = (new BigNumber(food.count)).multipliedBy(new BigNumber(food.standardPrice)).toString()
        totalPrice = totalPrice.plus((new BigNumber(food.count)).multipliedBy(new BigNumber(food.standardPrice)))
      }
      foodList.push(newFood)
    }
    if (isPack) {
      foodInfo.totalPackFee = totalPackFee.toString()
    }
    foodInfo.totalPrice = totalPrice.toString()
    foodInfo.food = foodList
    return foodInfo
  },

  // Moment.js
  moment: Moment
}

/**
 * 提交请求
 *
 * @param {string} url 请求的 URL
 * @param {string} method 请求的方法
 * @param {object} [parameters = {}] 请求的参数
 * @return {Promise} Promise 对象，请求成功时传出服务器响应值，失败时抛出异常
 */
function ajax (url, method, parameters = {}) {
  // URL 以斜线开头时，自动补全上下文路径
  url = url.startsWith('/') ? constants.contextPath + url.substring(1) : url

  // 提交 PUT、DELETE 请求时，实际转为 POST 请求，添加 _method 参数，以便传递请求体
  let actualMethod = method
  if (method === 'PUT' || method === 'DELETE') {
    actualMethod = 'POST'
    parameters._method = method
  }

  // 检查参数中是否包含文件对象
  let hasFile = false
  for (let key in parameters) {
    if (parameters[key] instanceof File) {
      hasFile = true
      break
    }
  }

  // 如果包含文件，使用 FormData
  let contentType
  if (hasFile) {
    contentType = 'multipart/form-data'
    let formData = new FormData()
    for (let key in parameters) {
      formData.append(key, parameters[key])
    }
    parameters = formData
  } else {
    contentType = 'application/x-www-form-urlencoded'
  }

  return new Promise((resolve, reject) => {
    // 提交请求
    Axios.request({
      url: url,
      method: actualMethod,
      headers: {
        'Content-Type': contentType
      },
      data: method === 'GET' ? undefined : parameters,
      params: method === 'GET' ? parameters : undefined,
      transformRequest: [function (data) {
        return hasFile ? data : Qs.stringify(data)
      }],
      timeout: 10000
    })
      .then(function (result) {
        resolve(result.data)
      })
      .catch(function (error) {
        error.cause = 'request'
        reject(error)
      })
  })
}
