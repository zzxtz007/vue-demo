<template>
  <div class="content-body" :style="'height:' + contentHeight + 'px'">
    <ButtonGroup class="title">
      <template v-for="(button, index) in buttons">
        <Button :key="buttons[index]" type="primary" v-if="index === choiceIndex" @click="changeIndex(index)">{{button}}
        </Button>
        <Button :key="buttons[index]" type="ghost" v-else @click="changeIndex(index)" class="un-choice">
          {{button}}</Button>
      </template>
    </ButtonGroup>
    <div class="choice-time">
      <div>统计时间:</div>
      <div v-if="choiceIndex === 3" style="width: 80%">
        <DatePicker placement="bottom-start" placeholder="开始日期" style="width: 45%" @on-change="start"
                    :options="startDateOptions" :editable="false"></DatePicker> 至
        <DatePicker placement="bottom-end" placeholder="结束日期" style="width: 45%" :options="endDateOptions"
                    @on-change="end" :editable="false"></DatePicker>
      </div>
      <div v-else>{{showDate}}</div>
    </div>
    <div class="show-card">
      <div class="show-title">
        <img :src="titleImage" alt="" class="show-title-image">
        <template v-if="choiceIndex !== 3">{{buttons[choiceIndex]}}</template>营业统计
      </div>
      <div class="show-info-body">
        <div class="show-info">
          <div class="show-info-title">营业额</div>
          <div class="show-info-main">￥{{sellMoney}}</div>
        </div>
        <div class="show-info">
          <div class="show-info-title">订单数</div>
          <div class="show-info-main">{{sellCount}}</div>
        </div>
      </div>
    </div>
    <div class="show-card">
      <div class="show-title">
        <img :src="titleImage" alt="" class="show-title-image">退款统计
      </div>
      <div class="show-info-body">
        <div class="show-info">
          <div class="show-info-title">退款金额</div>
          <div class="show-info-main">￥{{refundMoney}}</div>
        </div>
        <div class="show-info">
          <div class="show-info-title">订单数</div>
          <div class="show-info-main">{{refundCount}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'statistics-details',
  data: function () {
    const that = this
    return {
      titleImage: require('../../static/images/Statistics.png'),
      choiceStartDateFlag: false,
      choiceEndDateFlag: false,
      contentHeight: document.body.clientHeight - 72,
      buttons: ['今日', '昨日', '近七日', '自定义'],
      stallId: '',
      showDate: 0,
      startDate: 0,
      endDate: 0,
      choiceIndex: 0,
      sellCount: 0,
      sellMoney: 0.00,
      refundMoney: 0.00,
      refundCount: 0,
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
  created () {
    this.checkSession()
  },
  methods: {
    changeIndex: function (index) {
      let that = this
      that.choiceIndex = index
      if (index === 0) {
        that.now()
      }
      if (index === 1) {
        that.yesterday()
      }
      if (index === 2) {
        that.oneWeek()
      }

      if (index !== 3) {
        // 获取商户各个数据
        that.getInfo()
      }
    },

    /**
     * 获取今天的开始结束时间
     */
    now: function () {
      let that = this
      let now = new Date()
      let ONE_DAY = 1000 * 60 * 60 * 24
      let nextDay = new Date(new Date().getTime() + ONE_DAY)
      let today = that.getTime(now)
      nextDay = that.getTime(nextDay)
      that.startDate = today
      that.endDate = nextDay
      that.showDate = that.getShowDate(now)
    },

    /**
     * 获取昨天的开始结束时间
     */
    yesterday: function () {
      let that = this
      let ONE_DAY = 1000 * 60 * 60 * 24
      let yesterdayEnd = new Date(new Date().getTime() - ONE_DAY)
      let yesterdayStart = new Date(new Date().getTime() - ONE_DAY * 2)
      let startTime = that.getTime(yesterdayStart)
      let endTime = that.getTime(yesterdayEnd)
      that.startDate = startTime
      that.endDate = endTime
      that.showDate = that.getShowDate(yesterdayStart)
    },

    /**
     * 获取获取一周的时间
     */
    oneWeek: function () {
      let that = this
      let ONE_WEEK = 1000 * 60 * 60 * 24 * 7
      let yesterday = new Date(new Date().getTime())
      let oneWeekAgo = new Date(new Date().getTime() - ONE_WEEK)
      let startTime = that.getTime(oneWeekAgo)
      let endTime = that.getTime(yesterday)
      that.startDate = startTime
      that.endDate = endTime
      that.showDate = that.getShowDate(oneWeekAgo) + ' 到 ' + that.getShowDate(yesterday)
    },

    /**
     * 获取展示的时间
     * @param date 时间日期
     * @returns {string} 展示的时间
     */
    getShowDate: function (date) {
      return '' + date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日'
    },

    /**
     * 获取查询用的时间
     * @param date
     * @returns {string}
     */
    getTime: function (date) {
      return '' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
    },

    /**
     * 日期选择的开始日期
     */
    start: function (date) {
      this.startDate = date + ' 00:00:00'
      this.choiceStartDateFlag = true
      this.selectCustomDate()
    },

    /**
     * 日期选择的结束日期
     */
    end: function (date) {
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
        this.getInfo()
      }
    },

    /**
     * 封装复用的 GET 请求
     */
    getInfo: function () {
      let that = this
      that.utils.http.get('/api/stalls/' + this.stallId + '/statistics/revenue', {startDate: that.startDate,
        endDate: that.endDate})
        .then(
          function (response) {
            switch (response.status) {
              case 0:
                that.sellCount = response.message.sellCount
                that.sellMoney = response.message.sellMoney
                break
              case 2:
                this.$Notice.warning({
                  title: '登录超时',
                  duration: 1,
                  onClose: function () {
                    that.$router.push({name: 'login'})
                  }
                })
                break
            }
          }
        )

      that.utils.http.get('/api/stalls/' + this.stallId + '/statistics/refund', {startDate: that.startDate, endDate: that.endDate})
        .then(
          function (response) {
            switch (response.status) {
              case 0:
                that.refundCount = response.message.refundCount
                that.refundMoney = response.message.refundMoney
                break
              case 2:
                this.$Notice.warning({
                  title: '登录超时',
                  duration: 1,
                  onClose: function () {
                    that.$router.push({name: 'login'})
                  }
                })
                break
            }
          })
    },

    checkSession: function () {
      const that = this
      this.utils.http.get('/api/session')
        .then(response => {
          const ret = parseInt(response.status)
          switch (ret) {
            case 0:
              this.stallId = response.uid
              that.now()
              that.getInfo()
              break
            case 2:
              this.utils.timeOutLogin(this)
              break
            case 3:
              this.$Message.error('参数异常')
              break
            default:
              this.utils.systemError(this)
              break
          }
        })
        .catch(() => {
          this.utils.systemError(this)
        })
    }
  }
}
</script>

<style scoped>
  .content-body {
    width: 100%;
    height: calc(100% - 72px);
    padding: 5%;
    color: #8a8a8a;
  }

  .title {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .title > button {
    width: 25%;
    height: 80%;
  }

  .un-choice {
    background: #fff;
    color: #8a8a8a;
  }

  .choice-time{
    padding: 0 10px 0;
    display: flex;
    align-items: center;
    margin-top: 20px;
    width: 100%;
    height: 8%;
    background: #fff;
    border: 1px solid #e4e4e4;
    border-left: none;
    border-right: none;
  }

  .show-card{
    padding: 10px;
    margin-top: 20px;
    width: 100%;
    height: 25%;
    background: #fff;
  }

  .show-title{
    display: flex;
    align-items: center;
    font-size: 16px;
    width: 100%;
    height: 25%;
    border-bottom: 1px solid #e4e4e4;
  }

  .show-title-image{
    width: 8%;
    height: 100%;
  }

  .show-info-body{
    display: flex;
    padding-top: 10px;
    width: 100%;
    height: 75%;
  }

  .show-info{
    padding-left: 10px;
    width: 50%;
    height: 100%;
  }

  .show-info:first-child{
    border-right: 1px solid #e4e4e4;
  }

  .show-info-title{
    width: 100%;
    height: 30%;
  }

  .show-info-main{
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 70%;
    color: #81D8D8;
    font-size: 18px;
    font-weight: bold;
  }
</style>
