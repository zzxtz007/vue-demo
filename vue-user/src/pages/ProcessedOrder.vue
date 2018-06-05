<template>
  <div class="main" style="font-size: 18px">
    <!--<div class="date-pick-bar">-->
      <!--<DatePicker placement="bottom-start" placeholder="开始日期" style="width: 45%" @on-change="start" :value="startDate"-->
                  <!--:options="startDateOptions" :editable="false"></DatePicker> 至-->
      <!--<DatePicker placement="bottom-end" placeholder="结束日期" style="width: 45%" :options="endDateOptions"-->
                  <!--:value="endDate" @on-change="end" :editable="false"></DatePicker>-->
    <!--</div>-->
    <div style="height: 90%">
      <pull-to @top-state-change="stateChange" :bottom-load-method="handleReachBottom" :top-load-method="handleReachTop"
               style="color: #81d8cf; font-size: 15px" slot="content" :height="scrollHeight">
        <div v-if="orderArray.length === 0" style="width: 100%;height: 100%;display: -webkit-flex;display: -moz-flex;
      display: -ms-flex;display: flex;flex-direction: column;align-items: center">
          <img src="../../static/images/no-order.png" alt="" style="width: 300px;height: 250px">
        </div>
        <ul v-for="(order) in orderArray" v-bind:key="order.id">
          <li class="detail" @click="toOrderDetail(order.id)">
            <div class='p1'>
              <div class='appointmentId'>
                <div><p>取餐号：<span style="color: #b3b3b3;">{{order.appointmentId}}</span></p></div>
                <div><p>取餐时间：<span style="color: #b3b3b3;">{{order.appointmentTime | dateFilter}}</span></p></div>
              </div>
              <div class='status'>
                <p>
                  <span class='sta' v-if="order.status === 2">已完成</span>
                  <span class='sta' v-if="order.status === 3">已拒单</span>
                  <span class='sta' v-if="order.status === 5">已退款</span>
                  <span class='sta' v-if="order.status === 6">已完成</span>
                  <span class='sta' v-if="order.status === 8">未退款</span>
                </p>
              </div>
            </div>
            <div class="row">
              <div class="no">订单时间：{{order.orderTime | dateFilter}}</div>
              <div class="no">用户电话：{{order.phone}}</div>
              <div class="num"></div>
            </div>
            <div class="row">
              <span class="no">订单编号：{{order.id | cutFilter}}</span>
              <span class="num" style="color: #FF0000;"><p>￥{{order | priceFilter}}</p></span>
            </div>
          </li>
        </ul>
      </pull-to>
    </div>
  </div>
</template>

<script>
import PullTo from 'vue-pull-to'

export default {
  name: 'processedOrder',
  components: {
    PullTo
  },
  data () {
    const that = this
    return {
      type: 0,
      scrollHeight: Math.floor(document.documentElement.clientHeight * 0.9 * 0.9),
      startDate: this.utils.moment(new Date()).format('YYYY-MM-DD') + ' 00:00:00',
      endDate: this.utils.moment(new Date()).format('YYYY-MM-DD') + ' 23:59:59',
      pageNum: 1,
      pageSize: 7,
      list: [2, 3, 5, 6, 8],
      isLocked: false,
      id: '',
      uid: '',
      orderArray: [],
      totalCount: 0,
      choiceStartDateFlag: true,
      choiceEndDateFlag: true,
      endDateOptions: {
        // 设置时间选择器的结束时间范围
        disabledDate (date) {
          if (date.valueOf() > new Date()) {
            return true
          }
          let startDate = new Date(that.startDate)
          return date.valueOf() < startDate
        }
      },
      startDateOptions: {
        // 设置时间选择器的起始时间范围
        disabledDate (date) {
          if (date.valueOf() > new Date()) {
            return true
          }
          let endDate = new Date(that.endDate)
          return date.valueOf() > endDate
        }
      }
    }
  },
  filters: {
    /*
      * 截取订单号
      * */
    cutFilter: function (appointmentId) {
      return appointmentId.substring(0, 4) + '***' + appointmentId.substring(28, 32)
    },
    /**
       *将时间格式化
       */
    dateFilter: function (timestamp) {
      if (!timestamp) {
        return '立即制作'
      }
      const date = new Date(timestamp)// 时间戳为10位需*1000，时间戳为13位的话不需乘1000
      const Y = date.getFullYear() + '-'
      const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
      const D = date.getDate() + ' '
      const h = date.getHours() < 10 ? '0' + (date.getHours()) + ':' : (date.getHours()) + ':'
      const m = date.getMinutes() < 10 ? '0' + (date.getMinutes()) + ':' : (date.getMinutes()) + ':'
      const s = date.getSeconds() < 10 ? '0' + (date.getSeconds()) : (date.getSeconds())
      return Y + M + D + h + m + s
    },
    /**
       *计算价格
       */
    priceFilter: function (order) {
      let totalPrice = 0
      const isPack = order.isPack
      const orderInfo = order.orderFood
      const foodList = orderInfo.food
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
    }
  },
  created: function () {
    this.checkSession()
  },
  methods: {

    stateChange (state) {
      if (state === 'pull' || state === 'trigger') {
        this.iconLink = '#icon-arrow-bottom'
      } else if (state === 'loading') {
        this.iconLink = '#icon-loading'
      } else if (state === 'loaded-done') {
        this.iconLink = '#icon-finish'
      }
    },

    /**
     * 日期选择的开始日期
     */
    start: function (date) {
      if (date === '') {
        this.choiceStartDateFlag = false
        return
      }
      this.startDate = date + ' 00:00:00'
      this.choiceStartDateFlag = true
      this.selectCustomDate()
    },

    /**
     * 日期选择的结束日期
     */
    end: function (date) {
      if (date === '') {
        this.choiceEndDateFlag = false
        return
      }
      this.endDate = date + ' 23:59:59'
      this.choiceEndDateFlag = true
      this.selectCustomDate()
    },

    /**
     * 查询自定义的商家首营
     */
    selectCustomDate: function () {
      let startFlag = this.choiceStartDateFlag
      let endFlag = this.choiceEndDateFlag

      if (startFlag && endFlag) {
        this.getData()
      }
    },
    /**
       *上拉加载
       */
    handleReachBottom (loaded) {
      if (this.isLocked) {
        loaded('done')
        return
      }
      this.pageNum = this.pageNum + 1
      this.getData()
      loaded('done')
    },

    /**
     * 下拉刷新
     */
    handleReachTop (loaded) {
      this.pageNum = 1
      this.getData()
      loaded('done')
    },
    /**
       *检查登录
       */
    checkSession () {
      this.utils.http.get('/api/session')
        .then(response => {
          const ret = parseInt(response.status)
          if (response.role !== 1) {
            this.utils.timeOutLogin()
          }
          switch (ret) {
            case 0:
              this.stallId = 's_1'
              this.getData()
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
       *获取订单信息
       */
    getData: function () {
      this.array = []
      this.utils.http.get(
        '/api/consumers/orders',
        {'statusList': JSON.stringify(this.list),
          'pageNum': this.pageNum,
          'pageSize': this.pageSize,
          'startDate': this.startDate,
          'endDate': this.endDate})
        .then(response => {
          const ret = parseInt(response.status)
          this.isRefresh = true
          switch (ret) {
            case 0:
              this.totalCount = response.totalCount
              if (response.info === '[]') {
                response.info = []
              }
              if (this.pageNum === 1) {
                this.orderArray = []
              }
              this.orderArray = this.orderArray.concat(response.info)
              this.isLocked = this.orderArray.length === this.totalCount
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
       *跳转到订单详情
       */
    toOrderDetail: function (id) {
      const that = this
      that.$router.push({
        name: 'orderDetails',
        params: {
          id: id
        }
      })
    }
  }
}
</script>
<style scoped type="text/css">
  div{
    background: white;
  }
  .detail {
    width: 100%;
    background-color: white;
    border-bottom: 1px solid #efeff4;
    margin-top: 10px;
    padding: 0 10px 10px 0;
  }

  .p1 {
    width: 100%;
    margin-left: 20px;
    /*margin-right: 10px;*/
    border-bottom: 1px solid #efeff4;
    overflow: auto;
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flex;
    display: flex;
    flex-direction: row;
  }

  .no {
    width: 100%;
    overflow: hidden;
  }
  .num {
    display: block;
    text-align: right;
    margin-right: 20px;
    float: right;
    font-size: 17px;
  }

  .row {
    font-size: 14px;
    color: #b3b3b3;
    line-height: 25px;
    width: 100%;
    margin-left: 20px;
  }

  .appointmentId {
    width: 75%;
    padding-bottom: 5px;
    line-height: 25px;
    font-size: 14px;
    overflow: auto;
  }

  .appointmentId p {
    color: #81d8cf;
    font-size: 17px;
  }

  .status {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 25%;
  }

  .status p {
    padding: 0 7px;
    font-size: 12px;
    color: white;
    border-radius: 20px 20px;
    background-color: #81d8cf;
    line-height: 22px;
    text-align: center;
    align-items: right;
  }

  .ordertime p {
    padding-left: 5px;
    font-size: 14px;
    color: #b3b3b3;
    line-height: 25px;
  }

  .main{
    height: calc(100% - 72px);
    width: 100%;
  }

  .date-pick-bar{
    position: relative;
    width: 100%;
    height: 10%;
    text-align: center;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid #e3e3e3;
    background: #fff;
    z-index: 3;
  }
</style>
