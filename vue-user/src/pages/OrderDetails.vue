<template>
  <div id="content">
    <div style="width: 100%;text-align: center; padding-top: 50px" v-if="orderInfo.status === 0">
      <img src="../../static/images/refund-t.png"/>
      <h4 style="color:#81ced9 ;">未支付</h4>
    </div>
    <div style="width: 100%;text-align: center; padding-top: 50px" v-if="orderInfo.status === 1">
      <img src="../../static/images/refund-t.png"/>
      <h4 style="color:#81ced9 ;">待接单</h4>
    </div>
    <div style="width: 100%;text-align: center; padding-top: 50px" v-if="orderInfo.status === 2">
      <img src="../../static/images/dh-logo-finish.png"/>
      <h4 style="color:#81ced9 ;">已完成</h4>
    </div>
    <div style="width: 100%;text-align: center; padding-top: 50px" v-if="orderInfo.status === 3">
      <img src="../../static/images/cancel.png"/>
      <h4 style="color:#81ced9 ;">已拒单</h4>
    </div>
    <div style="width: 100%;text-align: center; padding-top: 50px" v-if="orderInfo.status === 5">
      <img src="../../static/images/refund-f.png"/>
      <h4 style="color:#81ced9 ;">退款完成</h4>
    </div>
    <div style="width: 100%;text-align: center; padding-top: 50px" v-if="orderInfo.status === 4">
      <img src="../../static/images/refund-t.png"/>
      <h4 style="color:#81ced9 ;">退款中</h4>
    </div>
    <ul style="margin-top: 10px;">
      <div class="order">
        <span class="txt">订单详情</span>
      </div>
      <div class="nr-list-all" v-for="food in orderFoodList" v-bind:key="food.id">
        <div class="nr-list1">{{food.name}} </div>
        <div class="nr-list2">x{{food.count}}</div>
        <div class="nr-list3">{{food | singleFoodFilter}}</div>
      </div>
      <div class="nr-list-all" v-if="orderInfo.isPack" style="color: #6F6F6F">
        <div class="nr-list1" >打包费</div>
        <div class="nr-list4">{{orderInfo | packFeeFilter}}</div>
      </div>
      <div class="nr-list-all total-list">
        <div class="nr-list1 total" >合计(元)</div>
        <div class="nr-list4 total">{{orderInfo | priceFilter}}</div>
      </div>
      <div class="order">
        <span class="txt">订单信息</span>
      </div>
      <div class="nr-list-all">
        <div class="nr-list1">取餐时间</div>
        <div class="nr-list4">{{orderInfo.appointmentTime | dateFilter}}</div>
      </div>
      <div class="nr-list-all">
        <div class="nr-list1">取餐号</div>
        <div class="nr-list4">{{orderInfo.appointmentId}}</div>
      </div>
      <div class="nr-list-all">
        <div class="nr-list1">手机号</div>
        <div class="nr-list4 phone" @click="callToConsumer">{{orderInfo.phone}}</div>
      </div>
      <div class="nr-list-all">
        <div style="width:15%;float: left;">订单号</div>
        <div style="float: right;">{{orderInfo.id | cutFilter}}</div>
      </div>

      <div style="text-align: center;margin: 0 auto">

        <!--<Button type="primary" class="btn-danger" @click="modal2 = true">打印</Button>-->
        <!--<Modal  v-model="modal2" title="请您确认"  @on-ok="getStallInfo">-->
          <!--<p>是否打印订单</p>-->
        <!--</Modal>-->
        <i-button type="primary" class="btn"  v-if="orderInfo.status === 0"
                  @click="modal2 = true; pay(orderInfo)">去支付</i-button>
        <Modal  v-model="modal2" title="请您确认"  @on-ok="agreePay">
          <p>是否同意支付{{orderInfo | priceFilter}}元</p>
        </Modal>
        <i-button type="primary" class="btn"  v-if="orderInfo.status === 1"
                  @click="modal1 = true; refund(orderInfo)">退款</i-button>
        <Modal  v-model="modal1" title="请您确认"  @on-ok="agree">
          <p>是否申请退款</p>
        </Modal>
      </div>
    </ul>
  </div>

</template>

<script>

export default {
  name: 'orderDetails',
  data () {
    return {
      orderId: this.$route.params.id,
      orderInfo: [],
      orderFoodList: [],
      modal1: false,
      modal2: false,
      uid: '',
      hallId: '',
      hallName: '',
      stallName: ''
    }
  },
  created: function () {
    this.checkSession()
  },
  filters: {
    /*
    * 截取订单号
    * */
    cutFilter: function (appointmentId) {
      if (appointmentId && appointmentId.length === 32) {
        return appointmentId.substring(0, 4) + '***' + appointmentId.substring(28, 32)
      }
      return ''
    },
    /**
       * 单个菜品的价格过滤
       */
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
       * 打包费的过滤
       */
    packFeeFilter: function (order) {
      let foodList = order.orderFood.food
      let totalPrice = 0
      for (let i = 0; i < foodList.length; i++) {
        totalPrice = totalPrice + foodList[i].packFee * foodList[i].count
      }
      return totalPrice.toFixed(2)
    },
    /**
       * 总价过滤
       */
    priceFilter: function (order) {
      if (order.length !== 0) {
        let totalPrice = 0
        let isPack = order.isPack
        let foodList = order.orderFood.food
        if (isPack === false) {
          for (let i = 0; i < foodList.length; i++) {
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
          for (let i = 0; i < foodList.length; i++) {
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
      }
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
       *检查登录
       */
    checkSession: function () {
      let that = this
      this.utils.http.get('/api/session')
        .then(response => {
          console.log(response)
          if (response.role !== 1) {
            that.utils.timeOutLogin(that)
          }
          let ret = parseInt(response.status)
          switch (ret) {
            case 2:
              that.utils.timeOutLogin(that)
              that.$router.push({name: 'login'})
              break
            case 0:
              that.stallId = response.uid
              that.getOrderDetail(this.orderId)
          }
        })
        .catch(() => {
          that.utils.systemError(this)
        })
    },
    /**
       * 获取订单详情
       */
    getOrderDetail (orderId) {
      this.utils.http.get('/api/orders/' + orderId)
        .then(response => {
          let ret = response.status
          switch (ret) {
            case 0:
              if (response.info.length !== 0) {
                this.orderInfo = response.info
                this.orderFoodList = response.info.orderFood.food
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
    refund: function (order) {
      let that = this
      that.stallId = order.stallId
    },
    pay: function (order) {
      let that = this
      that.orderId = order.id
    },
    refundSuccess: function () {
      this.$Message.info('订单退款成功')
    },
    /**
     * 同意付款
     */
    agreePay: function () {
      this.utils.http.post('/api/orders/' + this.orderId + '/payment')
        .then(response => {
          let ret = parseInt(response.status)
          switch (ret) {
            case 0:
              this.utils.appInfo(this, '付款完成，等待商户接单！')
              this.getOrderDetail(this.orderId)
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
              this.utils.systemError(this)
          }
        })
        .catch(() => {
          this.utils.systemError(this)
        })
    },
    /**
       * 同意退款
       */
    agree: function () {
      let that = this
      this.utils.http.put('/api/orders/' + this.orderId + '/refund', {'orderId': this.orderId, 'stallId': this.stallId, 'uid': this.uid})
        .then(response => {
          let ret = parseInt(response.status)
          switch (ret) {
            case 0:
              this.refundSuccess()
              that.$router.push({name: 'refund'})
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
    /*
      * 打印订单
      * */
    printOrder: function () {
      this.global.getOrderById(this.hallName, this.orderInfo.id)
    },
    /* 获取商户信息 */
    getStallInfo: function () {
      const stallId = 's_1'
      this.utils.http.get('/api/stalls/' + stallId)
        .then(response => {
          const ret = parseInt(response.status)
          switch (ret) {
            case 0:
              this.stallName = response.info.name
              this.hallId = response.info.diningHallId
              this.getHallInfo()
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
    getHallInfo: function () {
      this.utils.http.get('/api/dining-halls/' + this.hallId)
        .then(response => {
          const ret = parseInt(response.status)
          switch (ret) {
            case 0:
              this.hallName = response.diningHall.name
              this.printOrder()
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
     * 拨打电话给用户
     */
    callToConsumer: function () {
      window.location.href = 'tel:' + this.orderInfo.phone
    }
  }
}
</script>

<style scoped>
  #content {
    width: 100%;
    height: calc(100% - 72px);
    overflow: auto;
    background: white;
  }

  .nr-list1 {
    width: 40%;
    float: left;
  }

  .nr-list2 {
    width: 25%;
    float: left;
    text-align: right;
  }

  .nr-list3 {
    width: 30%;
    float: right;
    text-align: right;
  }

  .nr-list4 {
    width: 60%;
    float: right;
    text-align: right;
  }

  .nr-list-all {
    font-size: 16px;
    color: #999;
    height: 25px;
    line-height: 25px;
    padding: 0 20px;
  }

  .total-list {
    padding-top: 6px;
    font-weight: bold;
    font-size: 18px;
    color: black
  }

  .total {
    border-top: 1px solid #ccc;
    padding-top: 8px
  }

  .btn-danger {
    margin: 10px 0;
    color: #fff;
    border: 1px solid #81d8cf;
    background-color: #81d8cf;
    height: 35px;
    border-radius: 5px;
    font-size: 16px;
    width: 90%;
  }

  .btn {
    height: 35px;
    color: #81d8cf;
    border: 1px solid #81d8cf;
    border-radius: 5px;
    background-color: white;
    font-size: 16px;
    width: 90%;
  }

  .order {
    width: 100%;
    padding: 10px;
    text-align: center;
  }

  .txt {
    display: table;
    width: 100%;
    font-size: 18px;
    font-weight: bold;
    line-height: 32px;
    background-color: #fff;
    white-space: nowrap;
    border-spacing: 10px 0;
  }

  .txt:before,
  .txt:after {
    display: table-cell;
    content: '';
    width: 50%;
    background: -webkit-linear-gradient(black, black) repeat-x left center;
    background-size: 1px;
  }

  .phone {
    color: #2baee9;
  }

  .phone:hover {
    color: #9ae0e0;
  }
</style>
