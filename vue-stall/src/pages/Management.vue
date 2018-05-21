<template>
  <div class="content-body">
    <Modal
      v-model="logoutModal"
      title="退出登录"
      @on-ok="logout">
      <p>是否退出登录</p>
    </Modal>
    <div class="static-bar" :style="'height:' + staticBarHeight + 'px'">
      <div class="static-title">
        <div class="static-prompt">
          <img :src="images[0]" class="image">
          今日营业统计
        </div>
        <router-link class="static-btn" :to="statistics">点击查看详情</router-link>
      </div>
      <div class="static-info">
        <div class="static-info-single">
          <div class="text">
            <span>销售额</span>
            <Poptip title="提示" content="销售额扣除微信手续费">
              <Icon type="help-circled"></Icon>
            </Poptip>
          </div>
          <div class="count">{{sellMoney}}</div>
        </div>
        <div class="static-info-single">
          <div class="text">订单数</div>
          <div class="count">{{sellCount}}</div>
        </div>
      </div>
    </div>
    <div class="stall-type-bar">
      <div class="image-text">
        <template v-if="isOpen">
          已开始接单
        </template>
        <template v-else>
          已停止接单
        </template>
      </div>
      <i-switch size="large" @on-change="toggleIsOpen" v-model="isOpen">
        <span slot="open">开启</span>
        <span slot="close">关闭</span>
      </i-switch>
    </div>
    <div class="options-body">
      <template v-for="(item, index) in options">
        <router-link class="option" :key="item.name" :to="item.url" v-if="!(index === 2 || index === 5)">
          <img :src="item.image" alt=""/>
          <div>{{item.name}}</div>
        </router-link>
        <div v-if="index === 2" :key="index" class="option" @click="changeAutoAccept()">
          <template v-if="autoAcceptAndPrint">
            <img :src="item.imageOn" alt="">
            <div class="text">
              <div>开启自动接单</div>
            </div>
          </template>
          <template v-else>
            <img :src="item.imageOff" alt="">
            <div class="text">
              <div>关闭自动接单</div>
            </div>
          </template>
        </div>
        <div v-if="index === 5" :key="index" class="option" @click="logoutModal = true">
          <img :src="item.image" alt=""/>
          <div>{{item.name}}</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import bus from '../assets/eventBus'

export default {
  name: 'management',
  data () {
    return {
      staticBarHeight: window.screen.height * 0.2,
      statistics: 'statistics',
      sellCount: 0,
      sellMoney: 0,
      stallId: '',
      logoutModal: false,
      options: [
        {name: '菜品管理', image: require('../../static/images/food.png'), url: 'foodManagement'},
        {name: '分类管理', image: require('../../static/images/food-category.png'), url: 'foodCategoryManagement'},
        {name: '自动打印接单',
          imageOff: require('../../static/images/open-stall.png'),
          imageOn: require('../../static/images/open-stall-on.png')},
        {name: '商铺预览', image: require('../../static/images/show-stall.png'), url: 'preview'},
        {name: '商铺修改', image: require('../../static/images/modify.png'), url: 'stallUpdate'},
        {name: '退出登录', image: require('../../static/images/logout.png')}
      ],
      images: [
        require('../../static/images/Statistics.png')
      ],
      isOpen: false,
      autoAcceptAndPrint: false
    }
  },
  created () {
    // this.autoAcceptAndPrint = window.AndroidJS.getAutoAcceptOrderFlag()
    this.checkSession()
  },
  mounted () {
    /**
     * 默认接受订单
     */
    bus.$on('acceptOrder', orderId => {
      this.checkSession(
        () => orderId
      )
    })

    /**
     * 退款成功事件
     */
    bus.$on('refundSuccess', this.getTotalPrice)

    /**
     * 接单成功事件
     */
    bus.$on('untreatedOrderAccept', this.getTotalPrice)

    /**
     * 接单成功事件
     */
    bus.$on('printerConnected', this.printerConnected)

    /**
     * 接单成功事件
     */
    bus.$on('printerDisconnected', this.printerDisconnected)
  },
  beforeDestroy () {
    // 在页面销毁前，删除所有响应事件
    bus.$off('acceptOrder')
    bus.$off('refundSuccess')
    bus.$off('untreatedOrderAccept')
    bus.$off('printerConnected')
    bus.$off('printerDisconnected')
  },
  methods: {
    checkSession: function (callback) {
      const that = this
      this.utils.http.get('/api/session')
        .then(response => {
          const ret = parseInt(response.status)
          switch (ret) {
            case 0:
              that.stallId = response.uid
              // 登录成功后调用安卓端添加别名方法
              // window.AndroidJS.addAlias(response.uid)
              if (callback) {
                let orderId = callback()
                this.autoAcceptOrder(orderId)
                return
              }
              that.getTotalPrice()
              that.getStallInfo()
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
    },

    /**
     * 自动接单方法
     *
     * @param orderId 订单 id
     */
    autoAcceptOrder (orderId) {
      this.global.agree(orderId, this.stallId)
        .then(response => {
          switch (response.status) {
            case 0:
              this.$Message.success('自动接单成功')
              window.AndroidJS.playSound(this.const.soundType.autoAcceptOrderSuccess)
              this.global.getStallInfo(this.stallId, orderId)
              this.getTotalPrice()
              this.getStallInfo()
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
    },

    /**
     * 获取商户信息
     */
    getStallInfo: function () {
      this.utils.http.get('/api/stalls/' + this.stallId)
        .then(response => {
          switch (response.status) {
            case 0:
              this.isOpen = response.info.isOpen
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
        .catch(() => this.utils.systemError(this))
    },

    /**
     * 切换是否自动接单
     */
    changeAutoAccept: function () {
      let that = this
      that.autoAcceptAndPrint = !that.autoAcceptAndPrint
      // sessionStorage.setItem('autoAcceptAndPrint', that.autoAcceptAndPrint)
      // 将自动接单标记存入本地
      // window.AndroidJS.setAutoAcceptOrderFlag(that.autoAcceptAndPrint)
    },
    /**
     * 获取今日销售额和订单数
     */
    getTotalPrice: function () {
      let that = this
      let now = new Date()
      let startDate = '' + now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate()
      let endDate = '' + now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + (now.getDate() + 1)
      this.utils.http.get('/api/stalls/' + that.stallId + '/statistics/revenue', {startDate: startDate,
        endDate: endDate})
        .then(response => {
          switch (response.status) {
            case 0:
              that.sellCount = response.message.sellCount
              that.sellMoney = response.message.sellMoney
              break
            case 2:
              that.utils.timeOutLogin(that)
              break
            case 3:
              this.$Message.error('参数异常')
              break
            default:
              that.utils.systemError(that)
              break
          }
        })
        .catch(() => that.utils.systemError(that))
    },

    /**
     * 切换开关店状态
     */
    toggleIsOpen: function () {
      let that = this
      if (that.isOpen) {
        that.utils.http.post('/api/stalls/' + that.stallId + '/opening')
          .then(response => {
            switch (response.status) {
              case 0:
                sessionStorage.setItem('isOpen', that.isOpen)
                break
              case 2:
                that.isOpen = !that.isOpen
                sessionStorage.setItem('isOpen', that.isOpen)
                that.utils.timeOutLogin(that)
                break
              case 3:
                this.$Message.error('参数异常')
                break
              default:
                that.changeIsOpenError()
                that.isOpen = !that.isOpen
                break
            }
          })
          .catch(() => {
            that.isOpen = !that.isOpen
            that.utils.systemError(that)
          })
      } else {
        that.utils.http.delete('/api/stalls/' + that.stallId + '/opening')
          .then(response => {
            switch (response.status) {
              case 0:
                sessionStorage.setItem('isOpen', that.isOpen)
                break
              case 2:
                that.isOpen = !that.isOpen
                that.utils.timeOutLogin(that)
                break
              case 3:
                this.$Message.error('参数异常')
                break
              default:
                that.changeIsOpenError()
                that.isOpen = !that.isOpen
                break
            }
          })
          .catch(() => {
            that.isOpen = !that.isOpen
            that.utils.systemError(that)
          })
      }
    },

    /**
     * 开关店面失败提示
     */
    changeIsOpenError: function () {
      this.$Notice.error({
        title: '开关店失败，请重试',
        duration: 2
      })
    },

    /**
     * 登出
     */
    logout: function () {
      this.utils.http.delete('/api/session')
        .then(response => {
          switch (response.status) {
            case 0: {
              this.$Message.success('成功退出登录')
              this.$router.push({name: 'Login'})
              break
            }
            case 2: {
              this.$Message.warning('您尚未登录')
              this.$router.push({name: 'Login'})
              break
            }
            default: {
              this.utils.message.unknownError()
              break
            }
          }
        })
        .catch(() => {
          this.utils.message.unknownError()
        })
    },

    /**
     * 显示打印机连已经连接
     */
    printerConnected: function () {
      alert('打印机已连接')
    },

    /**
     * 显示打印机连已断开
     */
    printerDisconnected: function () {
      alert('打印机已断开')
    }

  }
}
</script>

<style scoped>

  .static-bar {
    position: relative;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    padding: 10px;
    width: 100%;
    height: 20%;
    background: #fff;
  }

  .static-bar::after {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background: #DADADA;
    content: '';
  }

  .static-bar > .static-title {
    width: 100%;
    height: 40%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 18px;
    border-bottom: 1px solid #DADADA;
  }

  .static-title > .static-prompt {
    width: 50%;
    height: 100%;
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flex;
    display: flex;
    align-items: center;
  }

  .static-prompt > .image {
    width: 20%;
    height: 80%;
  }

  .static-title > .static-btn {
    color: #fff;
    padding: 3px 6px;
    font-size: 12px;
    background: #81D8D8;
    border-radius: 5px;
  }

  .static-bar .static-info {
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flex;
    display: flex;
    box-sizing: border-box;
    padding: 10px 5px 0;
    width: 100%;
    height: 60%;
  }

  .static-info .static-info-single {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    width: 50%;
    height: 100%;
  }

  .static-info-single:first-child {
    border-right: 1px solid #DADADA;
  }

  .static-info-single > .text {
    width: 100%;
    height: 40%;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    padding-left: 10%;
    color: #8f8f94;
  }

  .static-info-single > .count {
    width: 100%;
    height: 60%;
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flex;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
    color: #81d8cf;
  }

  .stall-type-bar {
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flex;
    display: flex;
    -webkit-align-items: center;
    align-items: center;
    -webkit-justify-content: space-between;
    justify-content: space-between;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    border: 1px solid #DADADA;
    border-right: none;
    border-left: none;
    margin-top: 20px;
    font-size: 18px;
    width: 100%;
    padding: 8px 24px;
    background: #fff;
  }

  .stall-type-bar > .image-text {
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flex;
    display: flex;
    align-items: center;
    width: 70%;
    height: 100%;
  }

  .image-text > .image {
    margin-right: 10px;
    width: 20%;
    height: 60%;
  }

  .options-body {
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flex;
    display: flex;
    -webkit-flex-wrap: wrap;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
    margin-top: 20px;
    width: 100%;
    height: 50%;
    background: #fff;
  }

  .options-body > .option {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flex;
    display: flex;
    align-items: center;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
    color: #8a8a8a;
    width: calc(100% / 3);
    padding: 24px 0;
  }

  .option:nth-child(-n+3) {
    border-bottom: 1px solid #DADADA;
  }

  .option:nth-child(-n+2) {
    border-right: 1px solid #DADADA;
  }

  .option:nth-child(n+4) {
    border-right: 1px solid #DADADA;
  }

  .option > .text {
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flex;
    display: flex;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>
