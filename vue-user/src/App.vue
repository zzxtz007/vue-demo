<template>
  <div id="app" :style="'height:' + height + 'px'">
    <router-view/>
  </div>
</template>

<script>
import bus from './assets/eventBus'

export default {
  name: 'App',
  data () {
    return {
      height: document.documentElement.clientHeight
    }
  },
  methods: {
    /**
     * 唤醒添加订单的方法
     *
     * @param orderId 订单 id
     */
    addOrder: function (orderId) {
      window.AndroidJS.playSound(this.const.soundType.newOrder)
      bus.$emit('addOrder', orderId)
      bus.$emit('addUntreatedNotViewedCount')
    },
    // /**
    //  * 唤醒添加购物车
    //  *
    //  * @param cart 商品实体
    //  */
    //   getBuyCar: function (cart) {
    //   bus.$emit('getBuyCar',cart)
    // },

    /**
     * 唤醒添加退款订单的方法
     *
     * @param orderId
     */
    addRefundOrder: function (orderId) {
      window.AndroidJS.playSound(this.const.soundType.newRefund)
      bus.$emit('addRefundOrder', orderId)
      bus.$emit('addRefundNotViewedCount')
    },

    /**
     * 唤醒接单的方法
     *
     * @param orderId
     */
    acceptOrder: function (orderId) {
      bus.$emit('acceptOrder', orderId)
    },

    /**
     * 唤醒自动登录的方法
     *
     * @param username
     * @param password
     */
    autoLogin: function (username, password) {
      bus.$emit('autoLogin', username, password)
    },

    /**
     * 唤醒打印机连接上
     */
    printerConnected: function () {
      bus.$emit('printerConnected')
    },

    /**
     * 唤醒打印机断开
     */
    printerDisconnected: function () {
      bus.$emit('printerDisconnected')
    }
  }
}
</script>

<style>
  a {
    text-decoration: none;
  }

  a:link{
    color: #09A9A5;
  }

  a:visited{
    color: #09A9A5;
  }

  #app {
    font-family: -apple-system, "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC",
    "Hiragino Sans GB", "Source Han Sans CN", "Source Han Sans SC", "Microsoft YaHei", "Wenquanyi Micro Hei",
    "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-size: 14px;
    width: 100%;
    height: 100%;
  }

  .tab-bar-body {
    width: 100%;
    position: fixed;
    bottom: 0;
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flex;
    display: flex;
    -webkit-align-items: center;
    align-items: center ;
    font-size: 14px;
    background: #81D8CF;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    border-top: 2px solid #09A9A5;
  }

  .btn-combination {
    width: 25%;
    color: #09A9A5;
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flex;
    display: flex;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-justify-content: flex-end;
    justify-content: flex-end;
    align-items: center;
  }

  .bar-img {
    width: 100%;
    font-size: 0;
    margin-bottom: 5px;
  }

  .body {
    background: #f5f5f5;
    width: 100%;
  }
</style>
