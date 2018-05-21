<template>
  <ul class="content">
    <pull-to :top-load-method="refresh" @top-state-change="stateChange" style="color: #81d8cf">
      <div v-if="info.length === 0" style="width: 100%;height: 100%;display: -webkit-flex;display: -moz-flex;
      display: -ms-flex;display: flex;flex-direction: column;align-items: center">
        <img src="../../static/images/no-order.png" alt="" style="width: 300px;height: 250px">
      </div>
      <div v-else>
          <li class="container" style="display: block" v-for="(order,index) in info" v-bind:key="order.id">
            <div class="head-info" style="justify-content: space-between">
              <span class="info" style="padding-top: 10px">取餐号:
                <span class="get-info">{{order.appointmentId}}</span></span>
              <span class="info">取餐时间:<span class="get-info">{{order.appointmentTime | dateFilter}}</span></span>
              <span style="background-color:#81d8cf;" class="badge" v-if="order.isPack === true">打包</span>
              <span style="background-color:#81d8cf;opacity: 0" class="badge" v-if="order.isPack === false"></span>
            </div>
            <div class="line"></div>
            <div class="remark" style="justify-content:flex-start;">
              <span class="icon" style="background: #dd524d;margin-right: 5px;">备注</span>
              <span class="remark-icon">&nbsp;{{order.remark}}&nbsp;</span>
            </div>
            <div class="line"></div>
            <ul>
              <li class="main-info" v-if="info !== null" v-for="singoleFood in order.orderFood.food"
                  v-bind:key="singoleFood.id">
                <span class="get-info" style="width: 60%;height: 25px">{{singoleFood.name}}</span>
                <span class="get-info" style="width: 10%;height: 25px">x{{singoleFood.count}}</span>
                <span class="get-info" style="width: 25%;height: 25px;text-align: right">￥{{singoleFood | singleFoodFilter}}</span>
              </li>
              <li class="main-info" v-if="order.isPack === true">
                <span class="get-info" style="width: 80%;float:left;height: 25px">打包费</span>
                <span class="get-info" style="width: 15%;float:left;height: 25px;text-align: right">￥{{order | packFeeFilter}}</span>
              </li>
            </ul>

            <div class="line"></div>
            <div class="total">
              <div class="row">
                <span class="msg" style="margin-bottom: 0">订单时间</span>
                <span class="msg-info" style="margin-bottom: 0">{{order.orderTime | dateFilter}}</span>
              </div>
              <div class="row">
                <span class="msg" style="">手机号码</span>
                <span class="msg-info" style="">{{order.phone}}</span>
              </div>
              <div class="row">
                <span class="msg" style="margin-top: 0">收入</span>
                <span class="msg-info" style="color:#FF0000;margin-top: 0">￥{{order | priceFilter}}</span>
              </div>
            </div>
            <div class="line" style="margin-bottom: 10px"></div>
            <div class="btn-container">
              <Button type="primary"
                      style="width: 35%;font-size: 15px;color: #09A9A5;background: #fff;border-color: gainsboro"
                      class="btn" @click="modal1 = true; treated(order,index)">拒单
              </Button>
              <Modal v-model="modal1" title="请您确认" @on-ok="refuse">
                <p>是否拒绝此单？</p>
              </Modal>

              <Button type="primary" style="width: 60%;font-size: 15px" class="btn btn-danger"
                      @click="modal2 = true;treated(order,index)">接单
              </Button>
              <Modal
                v-model="modal2"
                title="请您确认"
                @on-ok="agree">
                <p>是否同意接受此单？</p>
              </Modal>
            </div>
            <div style="width: 100%;height: 10px;margin-top: 5px"></div>
          </li>
      </div>
    </pull-to>
  </ul>
</template>

<script>
/* eslint-disable no-unused-vars */
import bus from '../assets/eventBus'
import PullTo from 'vue-pull-to'

export default {
  name: 'untreated',
  props: [],
  data: function () {
    return {
      list: [1],
      info: [],
      time: [],
      isPack: [],
      modal1: false,
      modal2: false,
      orderId: '',
      stallId: '',
      index: '',
      hallId: '',
      hallName: '',
      isRefresh: false
    }
  },
  components: {
    PullTo
  },
  created: function () {
    this.checkSession()
  },
  mounted () {
    let that = this
    /**
       * 公共事件的调用
       */
    bus.$on('addOrder', function (orderId) {
      that.addOrder(orderId)
    })
  },
  beforeDestroy () {
    bus.$off('addOrder')
  },
  filters: {
    singleFoodFilter: function (foodInfo) {
      let totalPrice = 0
      // 判断是否是会员
      // 会员 ture：会员价格总价
      // 非会员 false：非会员价格总价
      if (foodInfo.isMember === false) {
        totalPrice = foodInfo.standardPrice * foodInfo.count
      } else {
        if (foodInfo.memberPrice) {
          totalPrice = foodInfo.memberPrice * foodInfo.count
        } else {
          totalPrice = foodInfo.standardPrice * foodInfo.count
        }
      }
      return totalPrice.toFixed(2)
    },
    /**
       * 是否打包
       * */
    packFeeFilter: function (order) {
      let foodList = order.orderFood.food
      let totalPrice = 0
      for (var i = 0; i < foodList.length; i++) {
        totalPrice = totalPrice + foodList[i].packFee * foodList[i].count
      }
      return totalPrice.toFixed(2)
    },
    /**
       * 价格过滤
       * */
    priceFilter: function (order) {
      let totalPrice = 0
      let isPack = order.isPack
      let orderInfo = order.orderFood
      let foodList = orderInfo.food
      if (isPack === false) {
        for (var i = 0; i < foodList.length; i++) {
          if (foodList[i].isMemeber === false) {
            totalPrice = totalPrice + foodList[i].standardPrice * foodList[i].count
          } else {
            if (foodList[i].memberPrice) {
              totalPrice = totalPrice + foodList[i].memberPrice * foodList[i].count
            } else {
              totalPrice = totalPrice + foodList[i].standardPrice * foodList[i].count
            }
          }
        }
      } else if (isPack === true) {
        for (i = 0; i < foodList.length; i++) {
          if (foodList[i].isMember === false) {
            totalPrice = totalPrice + (foodList[i].standardPrice + foodList[i].packFee) * foodList[i].count
          } else {
            if (foodList[i].memberPrice) {
              totalPrice = totalPrice + (foodList[i].memberPrice + foodList[i].packFee) * foodList[i].count
            } else {
              totalPrice = totalPrice + (foodList[i].standardPrice + foodList[i].packFee) * foodList[i].count
            }
          }
        }
      }
      return totalPrice.toFixed(2)
    },
    dateFilter: function (timestamp) {
      if (!timestamp) {
        return '立即制作'
      }
      const date = new Date(timestamp)// 时间戳为10位需*1000，时间戳为13位的话不需乘1000
      const Y = date.getFullYear() + '-'
      const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
      const D = date.getDate() + ' '
      const h = date.getHours() < 10 ? '0' + (date.getHours()) + ':' : (date.getHours()) + ':'
      const m = date.getMinutes() < 10 ? '0' + (date.getMinutes()) : (date.getMinutes())
      return Y + M + D + h + m
    }
  },
  methods: {
    /**
       * 下拉刷新
       * */
    refresh (loaded) {
      this.checkSession(loaded)
      this.isRefresh = true
    },
    stateChange (state) {
      if (state === 'pull' || state === 'trigger') {
        this.iconLink = '#icon-arrow-bottom'
      } else if (state === 'loading') {
        this.iconLink = '#icon-loading'
      } else if (state === 'loaded-done') {
        this.iconLink = '#icon-finish'
      }
    },
    timeOut: function () {
      this.$Message.info('已超时')
    },
    success: function () {
      this.$Message.info('密码不可为空')
    },
    accept: function () {
      this.$Message.info('接单成功')
    },
    refuseOrder: function () {
      this.$Message.info('拒单成功')
    },
    /**
     * 自动添加订单
     */
    addOrder: function (orderId) {
      this.utils.http.get('/api/orders/' + orderId)
        .then(response => {
          const ret = parseInt(response.status)
          switch (ret) {
            case 0:
              const info = response.info
              // 订单状态为 1 时候，添加订单
              if (info.status === 1) {
                this.info.push(info)
              }
              break
            case 2:
              this.utils.timeOutLogin(this)
              break
            default:
              this.utils.systemError(this)
              break
          }
        })
        .catch(() => this.utils.systemError(this))
    },
    treated: function (order, index) {
      this.orderId = order.id
      this.stallId = order.stallId
      this.index = index
    },
    /**
       * session检测
       * */
    checkSession: function (loaded) {
      const that = this
      this.utils.http.get('/api/session')
        .then(response => {
          const ret = parseInt(response.status)
          if (response.role !== 2) {
            this.utils.timeOutLogin()
          }
          switch (ret) {
            case 0:
              that.stallId = response.uid
              that.getUntreatedOrder()
              if (this.isRefresh) {
                loaded('done')
              }
              break
            case 2:
              this.utils.timeOutLogin(this)
              break
            default:
              this.utils.systemError(this)
              break
          }
        })
        .catch(() => {
          this.utils.systemError(this)
        })
    },
    /**
       * 获取未处理订单信息
       * */
    getUntreatedOrder: function () {
      const that = this
      this.utils.http.get('/api/stalls/' + this.stallId + '/orders',
        {'statusList': JSON.stringify(this.list)})
        .then(response => {
          const ret = parseInt(response.status)
          switch (ret) {
            case 0:
              let count = 0
              if (response.info === '[]') {
                this.info = []
              } else {
                that.info = response.info
                this.sort(that.info)
                count = response.info.length
              }
              bus.$emit('changeUntreatedBadge', count)
              break
            case 2:
              this.utils.timeOutLogin(this)
              break
            default:
              this.utils.systemError(this)
              break
          }
        })
        .catch(() => {
          this.utils.systemError(this)
        })
    },
    /**
       * 拒绝订单
       * */
    refuse: function () {
      this.utils.http.delete('/api/orders/' + this.orderId + '/deal', {
        'orderId': this.orderId,
        'stallId': this.stallId
      })
        .then(response => {
          switch (response.status) {
            case 0:
              bus.$emit('orderControl')
              this.info.splice(this.index, 1)
              this.refuseOrder()
              this.index = ''
              break
            case 2:
              this.utils.timeOutLogin(this)
              break
            case 3:
              this.$Message.error('参数异常')
              break
            case 4:
              this.$Message.error('订单超时默认拒绝')
              this.deleteThisOrder()
              break
            case 5:
              this.$Message.error('订单已转为申请退款订单')
              this.deleteThisOrder()
              break
            default:
              this.utils.systemError(this)
              break
          }
        })
        .catch(() => {
          this.utils.systemError(this)
        })
    },
    /**
       * 接单
       * */
    agree: function () {
      this.global.agree(this.orderId, this.stallId)
        .then(response => {
          let ret = parseInt(response.status)
          switch (ret) {
            case 0:
              this.global.getStallInfo(this.stallId, this.orderId)
              this.accept()
              this.info.splice(this.index, 1)
              this.index = ''
              window.AndroidJS.playSound(this.const.soundType.acceptOrderSuccess)
              bus.$emit('untreatedOrderAccept')
              bus.$emit('orderControl')
              break
            case 2:
              this.utils.timeOutLogin(this)
              break
            case 3:
              this.$Message.error('参数异常')
              break
            case 4:
              this.$Message.error('订单超时默认拒绝')
              this.deleteThisOrder()
              break
            case 5:
              this.$Message.error('订单已转为申请退款订单')
              this.deleteThisOrder()
              break
            default:
              this.utils.systemError(this)
              break
          }
        })
        .catch(() => {
          this.utils.systemError(this)
        })
    },
    /**
       根据订单时间排序
       */
    sort: function (foodArr) {
      foodArr.sort(function (o1, o2) {
        if (!o2.appointmentTime) {
          return -1
        }
        return o2.orderTime - o1.orderTime
      })
      return foodArr
    },

    /**
     * 清楚指定订单
     *
     */
    deleteThisOrder: function () {
      this.info.splice(this.index, 1)
      bus.$emit('changeUntreatedBadge', this.info.length)
    }
  }
}
</script>

<style scoped>
  .badge {
    display: block;
    font-size: 12px;
    line-height: 1;
    padding: 3px 6px;
    border-radius: 100px;
    color: #fff;
    text-align: center;
    margin-left: 20px;
  }
  div {
    background: white;
  }

  ul {
    background: white;
  }

  .content {
    width: 100%;
    height: calc(100% - 72px);
    overflow: auto;
  }

  .container {
    font-size: 15px;
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flex;
    display: flex;
    flex-direction: column;
    padding-left: 2%;
    border-bottom: 10px solid #d6d6d6;
  }

  .info {
    color: #81d8cf;
    display: flex;
    align-items: center;
    font-size: 17px;
  }

  .get-info {
    color: #8f8f94;
    display: block;
    line-height: 25px;
  }

  .head-info {
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flex;
    display: flex;
    flex-direction: column;
    justify-items: center;
    width: 95%;
  }

  .remark {
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flex;
    display: flex;
    flex-direction: row;
    justify-items: center;
    align-items: center;
    width: 100%;
    height: 43px;
  }

  .main-info {
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flex;
    display: flex;
    flex-direction: row;
    justify-items: center;
    align-items: center;
    width: 100%;
    height: 43px;
  }

  .icon {
    background: #81d8cf;
    border-radius: 20px;
    width: 36px;
    height: 18px;
    font-size: 14px;
    color: #fff;
    display: block;
    text-align: center;
    line-height: 18px;
  }

  .remark-icon {
    margin-right: 5px;
    font-size: 14px;
    color: black;
    text-align: center;
    line-height: 18px;
    display: block;
  }

  .row {
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flex;
    display: flex;
    flex-direction: row;
  }

  .msg {
    width: 40%;
    height: 25px;
    display: block;
    color: #333;
    margin-top: 10px;
    margin-bottom: 10px;
    line-height: 25px;
  }

  .msg-info {
    width: 55%;
    height: 25px;
    display: block;
    text-align: right;
    color: #333;
    margin-top: 10px;
    margin-bottom: 10px;
    line-height: 25px;
  }

  .btn-container {
    /*display: flex;*/
    width: 100%;
    flex-direction: row;
    align-content: center;
    justify-content: center;
  }

  .line {
    border-bottom: 1px solid gainsboro;
  }
</style>
