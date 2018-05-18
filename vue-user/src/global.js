import utils from './utils'

export default {

  /**
   * @Param orderId 订单号 stallId 商户id
   * 接单
   * */
  agree: (orderId, stallId) => {
    return utils.http.post('/api/orders/' + orderId + '/deal', {
      'stallId': stallId
    })
  },
  /**
   * @Param stallId 商户id
   * 获取商户信息
   * */
  getStallInfo: function (stallId, orderId) {
    utils.http.get('/api/stalls/' + stallId)
      .then(response => {
        let hallId = response.info.diningHallId
        const ret = parseInt(response.status)
        switch (ret) {
          case 0:
            this.getHallInfo(hallId, orderId)
            break
          case 2:
            utils.timeOutLogin(this)
            break
          default:
            utils.systemError(this)
            break
        }
      })
      .catch(() => {
        utils.systemError(this)
      })
  },
  /**
   * @Param hallId 食堂id
   * 获取食堂信息
   * */
  getHallInfo: function (hallId, orderId) {
    utils.http.get('/api/dining-halls/' + hallId)
      .then(response => {
        const ret = parseInt(response.status)
        switch (ret) {
          case 0:
            this.hallName =
            this.getOrderById(response.diningHall.name, orderId)
            break
          case 2:
            utils.timeOutLogin(this)
            break
          default:
            utils.systemError(this)
            break
        }
      })
      .catch(() => {
        utils.systemError(this)
      })
  },
  /**
   * @Param orderId 订单号
   * 获取指定id的订单
   * */
  getOrderById: function (diningHallName, orderId) {
    utils.http.get('/api/orders/' + orderId)
      .then(response => {
        const info = response.info
        const ret = parseInt(response.status)
        switch (ret) {
          case 0:
            let foodInfo = utils.getPrintFoodInfo(info.orderFood.food, info.isPack)
            let appointmentTime = '立即制作'
            if (info.appointmentTime) {
              appointmentTime = utils.moment(info.appointmentTime).format('MM-DD HH:mm')
            }
            let phone = '无'
            // 假设有号码 则显示号码
            if (info.phone) {
              phone = info.phone
            }
            let message = {
              appointmentTime: appointmentTime,
              appointmentId: info.appointmentId, // 取餐号
              isPack: info.isPack, // 是否打包
              food: foodInfo.food,
              remark: info.remark, // 订单备注
              orderTime: info.orderTime, // 下单时间，UNIX时间戳
              diningHallName: diningHallName, // 食堂名称
              stallName: info.stall.name, // 商户名称
              orderId: info.id, // 订单号,
              totalPrice: foodInfo.totalPrice,
              phone: phone
            }

            if (foodInfo.totalPackFee) {
              message.totalPackFee = foodInfo.totalPackFee
            }
            message = JSON.stringify(message)

            window.AndroidJS.print(message)
            break
          case 2:
            utils.timeOutLogin(this)
            break
          default:
            utils.systemError(this)
            break
        }
      })
      .catch(() => {
        utils.systemError(this)
      })
  },
  timeOut: function () {
    this.$Message.info('已超时')
  }
}
