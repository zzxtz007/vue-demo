<template>
  <keep-alive>

    <div class="content" id="orderInfo">
    <pull-to :top-load-method="refresh" class="scroll" >
      <!--订单列表为空时-->
      <ul v-if="orderArr.length === 0"
          style="width: 100%;height: 100%;display: flex;flex-direction: column;align-items: center;overflow: auto">
        <img src="../../static/images/no-refund-order.png" style="width: 300px;height: 250px;">
      </ul>
      <!--退款订单列表-->
      <div dis-hover class="table-view" style="margin-bottom: 10px;" v-for="(order,index) in orderArr" v-else
           v-bind:key="order.appointmentId">
        <a href="javascript:void(0)" @click="getOrderDetail(order.id)">
          <li class="table-view-cell">
            <div class='appointmentId'>
              <div><p>取餐号：<span style="color: #b3b3b3;">{{order.appointmentId}}</span></p></div>
              <div><p>取餐时间：<span style="color: #b3b3b3;">{{order.appointmentTime | dateFilter}}</span></p></div>
            </div>
            <span style="background-color:#81d8cf ;" class="badge">退款</span>
          </li>
          <li class="table-view-cell">
            <div class="nr-list-all">
              <div class="nr-list1">申请时间:{{order.refundApplicationTime | dateFilter}}</div>
            </div>
            <div class="nr-list-all">
              <div class="nr-list1">下单时间:{{order.orderTime | dateFilter}}</div>
            </div>
            <div class="nr-list-all">
              <div class="nr-list1">用户电话:{{order.phone}}</div>
            </div>
            <div class="nr-list-all">
              <div style="float:left;">订单号:
                <div style="float: right;text-align: right">{{order.id | cutFilter}}</div>
              </div>
              <div class="nr-list2" style="color: #ff0000;">￥{{order | priceFilter}}</div>
            </div>
          </li>
        </a>
        <div class="table-view-cell">
          <!--拒绝退款-->
          <Button type="primary" style="width: 35%;" class="btn" @click="modal1 = true; refund(order,index)">拒绝退款
          </Button>
          <Modal v-model="modal1" title="请您确认" @on-ok="refuse">
            <p>是否拒绝退款</p>
          </Modal>
          <!--拒绝退款-->
          <Button type="primary" style="width: 60%;" class="btn btn-danger" @click="modal2 = true; refund(order,index)">
            同意退款
          </Button>
          <Modal v-model="modal2" title="请您确认" @on-ok="agree">
            <p>是否同意退款</p>
          </Modal>
        </div>
      </div>
    </pull-to>
    </div>
  </keep-alive>
</template>

<script>
/* eslint-disable no-unused-vars,handle-callback-err */
import bus from '../assets/eventBus'
import PullTo from 'vue-pull-to'

export default {
  name: 'refund',
  data: function () {
    return {
      modal1: false,
      modal2: false,
      uid: '',
      list: [4],
      orderArr: [],
      orderFoodArr: [],
      orderId: '',
      stallId: '',
      index: '',
      isRefresh: false
      // ,newAppointmentId: this.$route.params.id
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
    bus.$on('addRefundOrder', function (orderId) {
      that.addRefundOrder(orderId)
    })
  },
  beforeDestroy () {
    bus.$off('addRefundOrder')
  },
  filters: {
    /*
      * 截取订单号
      * */
    cutFilter: function (appointmentId) {
      if (appointmentId !== undefined) {
        return appointmentId.substring(0, 4) + '***' + appointmentId.substring(28, 32)
      }
    },
    priceFilter: function (order) {
      var totalPrice = 0
      var isPack = order.isPack
      var foodList = order.orderFood.food
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
     *下拉刷新
     */
    refresh (loaded) {
      this.checkSession(loaded)
      this.isRefresh = true
    },
    /**
       * 获得当前退款订单号，商户号
       * @param order 当前订单
       * @param index 订单下标
       */
    refund: function (order, index) {
      var that = this
      that.orderId = order.id
      that.stallId = order.stallId
      that.index = index
    },
    /**
       * 检查登录状态
       */
    checkSession: function (loaded) {
      var that = this
      this.utils.http.get('/api/session')
        .then(response => {
          if (response.role !== 1) {
            that.utils.timeOutLogin(that)
          }
          var ret = parseInt(response.status)
          switch (ret) {
            case 2:
              that.utils.timeOutLogin(that)
              break
            case 0:
              if (this.isRefresh) {
                loaded('done')
              }
              that.uid = response.uid
              that.listByStatus()
          }
        })
        .catch(error => {
          that.utils.systemError(that)
        })
    },
    /**
       * 获取所有退款订单
       */
    listByStatus: function () {
      this.utils.http.get('/api/stalls/' + this.uid + '/orders',
        {'statusList': JSON.stringify(this.list), 'pageNum': 1, 'pageSize': 5000})
        .then(response => {
          var ret = parseInt(response.status)
          switch (ret) {
            case 2:
              this.utils.timeOutLogin(this)
              break
            case 0:
              let count = 0
              if (response.info === '[]') {
                this.orderArr = []
              } else {
                this.orderArr = response.info
                count = response.info.length
              }
              bus.$emit('changeRefundBadge', count)
              break
          }
        })
        .catch(() => {
          this.utils.systemError(this)
        })
    },
    /**
       * 获取最新退款订单
       */
    addRefundOrder: function (orderId) {
      this.utils.http.get('/api/orders/' + orderId)
        .then(response => {
          switch (response.status) {
            case 0:
              var info = response.info
              if (info.status === 4) {
                this.orderArr.push(info)
              }
              break
            case 2:
              this.utils.timeOutLogin(this)
              break
          }
        })
        .catch(() => {
          this.utils.systemError(this)
        })
    },
    /**
       * 拒绝退款
       */
    refuse: function () {
      var that = this
      this.utils.http.delete('/api/orders/' + this.orderId + '/refund', {
        'orderId': this.orderId,
        'stallId': this.stallId
      })
        .then(response => {
          var ret = parseInt(response.status)
          switch (ret) {
            case 0:
              bus.$emit('refundControl')
              this.orderArr.splice(this.index, 1)
              break
            case 2:
              this.utils.timeOutLogin(this)
              break
          }
        })
        .catch(() => {
          that.utils.systemError(that)
        })
    },
    /**
       * 同意退款
       */
    agree: function () {
      var that = this
      this.utils.http.put('/api/orders/' + this.orderId + '/refund', {
        'orderId': this.orderId,
        'stallId': this.stallId
      })
        .then(response => {
          let ret = parseInt(response.status)
          switch (ret) {
            case 0:
              this.$Message.info('订单退款成功')
              // window.AndroidJS.playSound(this.const.soundType.refundSuccess)
              this.orderArr.splice(this.index, 1)
              bus.$emit('refundSuccess')
              bus.$emit('refundControl')
              break
            case 2:
              this.utils.timeOutLogin(this)
              break
            case 4:
              this.$Notice.warning({
                title: '退款失败',
                desc: '余额不足，退款失败',
                duration: 0
              })
              break
            default:
              that.utils.systemError(that)
          }
        })
        .catch(() => {
          that.utils.systemError(that)
        })
    },
    /**
       * 获取订单详情
       * @param id
       */
    getOrderDetail (id) {
      this.$router.push({
        name: 'orderDetails',
        params: {
          id: id
        }
      })
    }
  }
}
</script>

<style scoped>
  .nr-list1 {
    width: 90%;
    float: left;
  }

  .nr-list2 {
    float: right;
    text-align: right;
    font-size: 22px;
  }

  .nr-list-all {
    font-size: 14px;
    color: #999;
    line-height: 25px;
  }

  .content {
    width: 100%;
    height: calc(100% - 72px);
    overflow: auto;
    background: white;
  }

  .table-view {
    position: relative;
    margin-top: 0;
    margin-bottom: 0;
    padding-left: 0;
    list-style: none;
    background-color: #fff;
    overflow: auto;
  }

  .table-view-cell {
    position: relative;
    overflow: hidden;
    padding: 11px 15px;
    border-bottom: lightgrey solid 1px;
  }

  .table-view-cell p {
    margin-bottom: 0;
  }

  p {
    font-size: 14px;
    margin-top: 0;
    margin-bottom: 10px;
    color: #8f8f94;
  }

  .badge {
    font-size: 12px;
    line-height: 22px;
    display: inline-block;
    padding: 0 7px;
    border-radius: 100px;
    color: #fff;
    position: absolute;
    top: 50%;
    right: 15px;
    transform: translateY(-50%);
  }

  .btn, button {
    font-size: 14px;
    font-weight: 400;
    line-height: 1.42;
    position: relative;
    display: inline-block;
    margin-bottom: 0;
    padding: 6px 12px;
    cursor: pointer;
    transition: all;
    transition-timing-function: linear;
    transition-duration: .2s;
    text-align: center;
    vertical-align: top;
    white-space: nowrap;
    color: #333;
    border: 1px solid #ccc;
    border-radius: 3px;
    background-color: #fff;
    background-clip: padding-box;
  }

  .btn-danger {
    color: #fff;
    background-color: #81d8cf;
    border: 1px solid #81d8cf;
  }

  .scroll {
    color:  #81d8cf;
  }

  .appointmentId {
    width: 75%;
    line-height: 25px;
    font-size: 14px;
    overflow: auto;
  }

  .appointmentId p {
    color: #81d8cf;
    font-size: 17px;
  }
</style>
