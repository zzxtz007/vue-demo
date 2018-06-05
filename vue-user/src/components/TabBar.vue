<template>
  <div class="tab-bar-body" style="height:72px" v-if="showTabBarFlag">
    <router-link class="btn-combination" v-for="(button, index) in buttons" :key="button.name"
                 v-on:click.native="show(index)" :to="button.url">
      <Badge :count="notViewedCountList[index]" class="badge">
        <img :src="button.imageUrl" class="bar-img"/>
      </Badge>
      <template v-if="isSelect === index">
        <div style="color:#fff">{{button.name}}</div>
      </template>
      <template v-else>
        <div>{{button.name}}</div>
      </template>
    </router-link>
  </div>
</template>

<script>
import bus from '../assets/eventBus'
import global from '../global'
export default {
  name: 'tab-bar',
  data () {
    return {
      realHeight: document.body.clientHeight,
      height: window.screen.height,
      isSelect: 3,
      showTabBarFlag: true,
      assets: require('assert'),
      buttons: [
        {name: '浏览菜单', imageUrl: require('../../static/images/dh-logo-finish-O.png'), url: '/pages/preview'},
        {name: '购物车', imageUrl: require('../../static/images/dh-logo-baycar.png'), url: '/pages/bayCar'},
        // todo 1 购物车页面 2 个人的订单   3 个人用户信息
        {name: '订单', imageUrl: require('../../static/images/dh-logo-refund.png'), url: '/pages/processedOrder'},
        {name: '个人信息', imageUrl: require('../../static/images/dh-logo-admin.png'), url: '/pages/stallUpdate'}
      ],
      notViewedCountList: [0, 0, 0, 0],
      stallId: '',
      refundIndex: 2,
      untreatedIndex: 0,
      refundStatus: [4],
      untreatedStatus: [1]
    }
  },
  created () {
    this.checkSession()
  },
  mounted () {
    window.addEventListener('resize', this.toggleTabBar)

    const that = this
    const untreatedIndex = this.untreatedIndex
    const refundIndex = this.refundIndex

    let isSelect = sessionStorage.getItem('isSelect')
    if (isSelect === null) {
      isSelect = 3
    }

    this.isSelect = parseInt(isSelect)

    /**
     * 拥有新订单时，未处理徽标 +1
     *
     */
    bus.$on('addUntreatedNotViewedCount', function () {
      let count = that.notViewedCountList[untreatedIndex] + 1
      that.$set(that.notViewedCountList, untreatedIndex, count)
    })

    /**
     * 购物车的添加
     *
     */
    bus.$on('changeBayCar', food => {
      const item = {}
      item['imageUrl'] = food.imageUrl
      item['name'] = food.name
      item['id'] = food.id
      item['standardPrice'] = food.standardPrice
      item['quantity'] = 1
      item['checked'] = false
      // 去重数组
      this.quchong(global.car, item)
    })

    /**
     * 处理了单个订单后，未处理徽标 -1
     *
     */
    bus.$on('orderControl', function () {
      let count = that.notViewedCountList[untreatedIndex] - 1
      that.$set(that.notViewedCountList, untreatedIndex, count)
    })

    /**
     * 拥有新退款时，退款徽标 +1
     *
     */
    bus.$on('addRefundNotViewedCount', function () {
      let count = that.notViewedCountList[refundIndex] + 1
      that.$set(that.notViewedCountList, refundIndex, count)
    })

    /**
     * 处理了单个订单后，退款徽标 -1
     *
     */
    bus.$on('refundControl', function () {
      let count = that.notViewedCountList[refundIndex] - 1
      that.$set(that.notViewedCountList, refundIndex, count)
    })

    /**
     * 处理了单个订单后，退款徽标 -1
     *
     */
    bus.$on('changeRefundBadge', function (count) {
      that.changeRefundBadge(count)
    })

    /**
     * 处理了单个订单后，退款徽标 -1
     *
     */
    bus.$on('changeUntreatedBadge', function (count) {
      that.changeUntreatedBadge(count)
    })
  },
  methods: {
    quchong: function (car, item) {
      let flag = true
      car.forEach(function (e, index) {
        if (e.id === item.id) {
          e.quantity = e.quantity + 1
          flag = false
        }
      })
      if (flag) {
        car.push(item)
      }
    },
    /**
     * 切换 TabBar 显隐问题，解决 fixed 定位和虚拟键盘问题
     */
    toggleTabBar: function (e) {
      let height = e.currentTarget.innerHeight
      if (height === this.realHeight) {
        this.showTabBarFlag = true
      }
      if (height < this.realHeight) {
        this.showTabBarFlag = false
      }
    },

    /**
     * tabBar 选中
     */
    show: function (e) {
      let that = this
      sessionStorage.setItem('isSelect', e)
      that.isSelect = e
    },

    /**
     * app 初始化后 获取未处理/退款的订单数量
     */
    checkSession: function () {
      this.utils.http.get('/api/session')
        .then(response => {
          this.stallId = response.uid
          // this.fetchAllUntreatedOrder()
          this.$set(this.notViewedCountList, this.refundIndex, 0)
          this.$set(this.notViewedCountList, this.untreatedIndex, 0)
          // this.fetchAllRefundOrder()
        })
    },

    /**
     * 拉取全部未处理订单,并且获取数量添加徽标数
     */
    fetchAllUntreatedOrder: function () {
      this.utils.http.get('/api/stalls/' + this.stallId + '/orders',
        {'statusList': JSON.stringify(this.untreatedStatus), 'pageNum': 1, 'pageSize': 5})
        .then(response => {
          const ret = parseInt(response.status)
          switch (ret) {
            case 0:
              if (response.info === '[]') {
                this.$set(this.notViewedCountList, this.untreatedIndex, 0)
              } else {
                this.$set(this.notViewedCountList, this.untreatedIndex, response.info.length)
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
     *  拉取全部退款订单,并且获取数量添加徽标数
     */
    fetchAllRefundOrder: function () {
      this.utils.http.get('/api/stalls/' + this.stallId + '/orders',
        {'statusList': JSON.stringify(this.refundStatus), 'pageNum': 1, 'pageSize': 5000})
        .then(response => {
          let ret = parseInt(response.status)
          switch (ret) {
            case 2:
              this.utils.timeOutLogin(this)
              break
            case 0:
              if (response.info === '[]') {
                this.$set(this.notViewedCountList, this.refundIndex, 0)
              } else {
                this.$set(this.notViewedCountList, this.refundIndex, response.info.length)
              }
              break
          }
        })
        .catch(() => {
          this.utils.systemError(this)
        })
    },

    /**
     * 修改退款的徽标数
     *
     * @param count 退款徽标个数
     */
    changeRefundBadge: function (count) {
      this.$set(this.notViewedCountList, this.refundIndex, count)
    },

    /**
     * 修改未处理订单的徽标数
     *
     * @param count 未处理订单徽标个数
     */
    changeUntreatedBadge: function (count) {
      this.$set(this.notViewedCountList, this.untreatedIndex, count)
    }
  }
}
</script>

<style scoped>

  .badge {
    width: 30%;
  }

  .bar-img:after {
    content: '';
    display: block;
    margin-top: 100%;
  }
</style>
