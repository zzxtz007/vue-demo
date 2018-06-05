<template>
  <div>
    <transition name="fade">
      <div class="column food-detail" style="display: flex;justify-content: space-around  ;flex-direction:column;font-size: 18px " v-if="visiable" >
        <div>
          <span style="display: flex;justify-content: center;flex-direction:row;">是否购买 价格为{{totalPrice}}</span>
        </div>
        <div style="display: flex;justify-content: center;flex-direction:row;">
          <div @click="buy" class="check-buy-btn">确认购买</div>
          <div @click="isShow" class="check-del-btn">取消</div>
        </div>
      </div>
    </transition>
    <transition name="fade">
      <div class="single-food-background" @click="isShow" v-if="visiable"></div>
    </transition>
    <header>
      <span class="header-title">购物清单</span>
      <span class="header-edit" @click="toggleDelBtn">
                <span v-show="!delFlag">编辑</span>
                <span v-show="delFlag">完成</span>
            </span>
    </header>
    <div class="page">
      <div class="empty-states" v-if="cart.length === 0">
        <span>这里是空的，快去逛逛吧</span>
      </div>
      <ul class="goods-list cart-list" v-else>
          <li class="goods-item" :key="item.id" v-for="item of cart">
          <div class="item-selector">
            <div class="icon-selector" v-bind:class="{'selector-active': item.checked}"
                 @click="selectGoods(item)">
              <svg t="1504061791962" class="icon" style="" viewBox="0 0 1024 1024" version="1.1"
                   xmlns="http://www.w3.org/2000/svg" p-id="2922"
                   xmlns:xlink="http://www.w3.org/1999/xlink" width="12" height="12">
                <path
                  d="M908.288 127.488l-537.6 537.6-254.976-254.976L0 525.824l254.976 254.976 115.712 115.712L486.4 780.8l537.6-537.6z"
                  fill="#ffffff" p-id="2923"></path>
              </svg>
            </div>
          </div>
          <div class="goods-img">
            <img v-bind:src="imagePathFood + item.imageUrl" v-bind:alt="item.name">
          </div>
          <div class="goods-info">
            <p class="goods-title">{{ item.name }}</p>
            <div class="goods-price">
              <span>¥<b>{{ item.standardPrice }}</b></span>
            </div>
            <div class="goods-num">
              <div class="num-btn" @click="changeQty(true, item)">+</div>
              <div class="show-num">{{ item.quantity }}</div>
              <div class="num-btn" @click="changeQty(false, item)">-</div>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <div class="action-bar" v-bind:class="{ 'del-box': delFlag }">
      <!-- del-box -->
      <div class="g-selector" @click="checkAll">
        <div class="item-selector">
          <div class="icon-selector" v-bind:class="{'selector-active': checkAllFlag}">
            <svg t="1504061791962" class="icon" style="" viewBox="0 0 1024 1024" version="1.1"
                 xmlns="http://www.w3.org/2000/svg" p-id="2922"
                 xmlns:xlink="http://www.w3.org/1999/xlink" width="12" height="12">
              <path
                d="M908.288 127.488l-537.6 537.6-254.976-254.976L0 525.824l254.976 254.976 115.712 115.712L486.4 780.8l537.6-537.6z"
                fill="#ffffff" p-id="2923"></path>
            </svg>
          </div>
        </div>
        <span>全选</span>
      </div>
      <div class="action-btn buy-btn" @click="isShow">去结算({{ selectedNum }})</div>
      <div class="action-btn del-btn" @click="delGoods">删除({{ selectedNum }})</div>
      <div class="total">合计：<span>¥<b>{{totalPrice}}</b></span></div>
    </div>
  </div>
</template>

<script>
import global from '../global'
export default {
  name: 'pay-car',
  data: function () {
    return {
      checkAllFlag: false,
      selectedNum: 0,
      delFlag: false,
      visiable: false,
      imagePathFood: this.const.imagePath.food,
      cart: []
    }
  },
  created () {
    this.cart = global.car
  },

  mounted () {
    // bus.$on('getBuyCar', c => {
    //   console.log(c)
    //   console.log(alllllllll)
    //   // this.$set(this.cart, c)
    //   this.cart = c
    // })
    // console.log(this.cart)
  },
  beforeDestroy () {
    // 在页面销毁前，删除所有响应事件
    // bus.$off('getBuyCar')
  },
  methods: {
    /**
     * @method 增减单品数量
     * @param {Boolean} isAdd 是否增加
     * @param {Number} index 商品下标
     */
    changeQty: function (isAdd, item) {
      let num = item.quantity
      //   stock = item.stock
      //
      if (isAdd) {
        num = num + 1
        this.$set(item, 'quantity', num)
      } else {
        num = num - 1
        this.$set(item, 'quantity', num)
      }
    },

    /**
     * @method 选择商品
     * @param {Object} item 商品对象
     */
    selectGoods: function (item) {
      // 状态值取反，并根据状态值对selectedNum进行加减
      item.checked = !item.checked
      item.checked ? ++this.selectedNum : --this.selectedNum
      // 设置全选
      this.selectedNum === this.cart.length
        ? this.checkAllFlag = true
        : this.checkAllFlag = false
    },

    /**
     * @method 全选
     */
    checkAll: function () {
      console.log(this.cart)
      var self = this
      this.checkAllFlag = !this.checkAllFlag

      this.cart.forEach(function (item) {
        if (self.checkAllFlag) {
          // 全选
          item.checked = true
          self.selectedNum = self.cart.length
        } else {
          // 取消全选
          item.checked = false
          self.selectedNum = 0
        }
      })
    },

    /**
     * @method 切换删除按钮
     */
    toggleDelBtn: function () {
      this.delFlag = !this.delFlag
      console.log(this.cart)
    },

    /**
     * @method 删除商品
     */
    delGoods: function () {
      /**
       * !提示：
       * 每次遍历删除数组元素时，会减少数组长度，所以不能缓存length
       * 也不能用forEach方法，因为它会自动缓存数组的长度
       * 这里还可以用filter
       */
      var cart = this.cart
      this.cart = cart.filter(function (item) {
        return !item.checked
      })
      // for (var i = 0; i < cart.length; i++) {
      //     cart[i].checked && cart.splice(i--, 1);
      // };

      // 重置 被选商品数量、全选状态、删除状态
      this.selectedNum = 0
      this.checkAllFlag = false
      this.delFlag = !this.delFlag
    },
    isShow: function () {
      this.visiable = !this.visiable
    },
    buy: function () {
      const that = this
      that.isShow()
      var foodCountMap = {}
      that.cart.forEach(e => {
        if (e.checked) {
          foodCountMap[e.id] = e.quantity
        }
      })
      console.log(foodCountMap)
      that.utils.http.get('/api/orders', {
        foodCountMap: JSON.stringify(foodCountMap),
        stallId: 's_1',
        phone: '13998441126',
        appointmentTime: new Date(),
        remark: '暂无',
        isPack: false
      }).then(response => {
        const ret = parseInt(response.status)
        switch (ret) {
          case 0:
            this.utils.appInfo(that, '下单成功!')
            break
          case 2:
            this.utils.timeOutLogin(this)
            break
          default:
            this.utils.systemError(this)
            break
        }
      })
    }
  },
  computed: {
    /**
     * @method 已选商品的总额
     */
    totalPrice: function () {
      var num = 0
      this.cart.forEach(function (item) {
        item.checked && (num += parseFloat(item.standardPrice * item.quantity))
      })
      return num
    }
  }
}
</script>

<style scoped>
  body {
    font-size: 14px;
    color: #363636;
    background-color: #333;
  }

  h1,
  ul,
  li,
  p {
    margin: 0;
    padding: 0;
  }

  li {
    list-style: none;
  }

  .g-panel {
    margin: 0 auto;
    width: 790px;
  }

  .cate,
  .filter-opt,
  .save {
    cursor: pointer;
  }

  .device {
    position: relative;
    margin: 10px;
    float: left;
    width: 375px;
    height: 667px;
    background-color: #eee;
    border-radius: 4px;
    overflow: hidden;
  }

  header {
    padding: 0 4%;
    position: relative;
    height: 44px;
    line-height: 44px;
    background-color: #fff;
    border-bottom: 1px solid #ddd;
  }

  .header-title {
    position: absolute;
    margin-left: 21%;
    width: 50%;
    font-size: 16px;
    text-align: center;
  }

  .header-edit {
    float: right;
    padding: 0 10px;
    cursor: pointer;
  }

  .tab-wrap {
    height: 60px;
    background: red;
    overflow: hidden;
  }

  .cate-tab {
    white-space: nowrap;
    overflow-x: scroll;
    -webkit-overflow-scrolling: touch;
    background-color: #5D4285;
  }

  .cate {
    display: inline-block;
    width: 80px;
    height: 70px;
    color: #fff;
    line-height: 60px;
    text-align: center;
  }

  .tab-active {
    background-color: #9A51FF;
  }

  .filter-bar {
    display: flex;
    height: 40px;
    background-color: #fff;
    border-bottom: 1px solid #E5E5E5;
    line-height: 40px;
  }

  .filter-opt {
    position: relative;
    width: 33.3%;
    color: #5F646E;
    text-align: center;
  }

  .filter-active {
    color: #7B57C5;
  }

  .filter-price:after {
    position: absolute;
    top: 13px;
    margin-left: 4px;
    content: '';
    display: inline-block;
    width: 8px;
    height: 14px;
    background: url('http://ov52d8mm7.bkt.clouddn.com/arrow-default.png') no-repeat;
    background-size: 8px 14px;
  }

  .filter-active.price-up:after {
    background: url('http://ov52d8mm7.bkt.clouddn.com/arrow-down.png') no-repeat;
    background-size: 8px 14px;
  }

  .filter-active.price-down:after {
    background: url('http://ov52d8mm7.bkt.clouddn.com/arrow-up.png') no-repeat;
    background-size: 8px 14px;
  }

  .goods-list {
    padding-top: 8px;
    height: 513px;
    overflow-y: scroll;
  }

  .cart-list {
    height: 560px;
  }

  .goods-item {
    display: flex;
    margin-bottom: 8px;
    padding: 10px 6px;
    min-height: 62px;
    background: #fff;
  }

  .goods-img {
    position: relative;
    margin-right: 4%;
    display: block;
    width: 16%;
  }

  .goods-img img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }

  .goods-item .flag {
    position: absolute;
    top: 0;
    left: 0;
    width: 20px;
    height: 20px;
    font-size: 12px;
    color: #fff;
    text-align: center;
    line-height: 20px;
    background-color: #FC5951;
    border-radius: 50%;
  }

  .goods-info {
    position: relative;
    width: 80%;
  }

  .goods-title {
    width: 80%;
    height: 38px;
    color: #363636;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  .goods-price {
    margin-top: 6px;
    line-height: 1;
  }

  .goods-price span {
    font-size: 15px;
    color: #7a45e5;
    /*   background: linear-gradient(90deg, #03D2B3 0, #2181FB 80%, #2181FB 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent; */
  }

  .des {
    font-size: 12px;
    color: #888;
  }

  .save {
    position: absolute;
    right: 10px;
    bottom: 2px;
    width: 32px;
    height: 22px;
    background-color: #7a45e5;
    font-size: 16px;
    line-height: 19px;
    text-align: center;
    color: #fff;
    border-radius: 12px;
    overflow: hidden;
  }

  .empty-states {
    padding-top: 60px;
    font-size: 18px;
    color: #AEB0B7;
    text-align: center;
  }

  .cart-list .goods-info {
    width: 68%;
  }

  .item-selector {
    width: 12%;
  }

  .icon-selector {
    position: relative;
    margin: 16px auto 0 auto;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid #ccc;
    cursor: pointer;
  }

  .selector-active {
    background-color: #7a45e5;
    border-color: #7a45e5;
  }

  .selector-active .icon {
    position: absolute;
    top: 2px;
    left: 2px;
  }

  .goods-num {
    position: absolute;
    right: 10px;
    top: 4px;
    width: 32px;
    color: #999;
    text-align: center;
  }

  .show-num {
    line-height: 28px;
  }

  .num-btn {
    width: 100%;
    height: 24px;
    font-size: 20px;
    line-height: 20px;
    cursor: pointer;
  }
  .food-detail{
    border-radius: 8px;
    height: 70%;
    width: 80%;
    position: absolute;
    left: 10%;
    top: 5%;
    z-index: 10;
    background: white;
    overflow: hidden;
    -webkit-transition: all linear 0.2s;
    -moz-transition: all linear 0.2s;
    -ms-transition: all linear 0.2s;
    -o-transition: all linear 0.2s;
    transition: all linear 0.2s;
  }
  .column{
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flex;
    display: flex;
    flex-direction: column;
  }
  .action-bar {
    position: absolute;
    left: 0;
    bottom: 40px;
    width: 100%;
    height: 100px;
    font-size: 15px;
    background-color: #fff;
    border-top: 1px solid #ddd;
  }
  .single-food-background {
    -webkit-transition: all linear 0.2s;
    -moz-transition: all linear 0.2s;
    -ms-transition: all linear 0.2s;
    -o-transition: all linear 0.2s;
    transition: all linear 0.2s;
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 8;
    background: rgba(0, 0, 0, 0.5);
  }
  .g-selector {
    float: left;
    width: 70px;
    margin-left: 4%;
    height: 52px;
    cursor: pointer;
  }

  .g-selector .item-selector {
    position: relative;
    display: inline-block;
  }

  .g-selector span {
    position: absolute;
    margin-left: 20px;
    color: #5F646E;
    top: 15px;
  }

  .total {
    float: right;
    color: #363636;
    font-size: 14px;
    line-height: 50px;
    margin-right: 20px;
  }

  .total span {
    color: #7A45E5;
  }

  .total b {
    font-size: 17px;
    margin-left: 4px;
  }

  .action-btn {
    float: right;
    width: 120px;
    height: 100%;
    color: #fff;
    text-align: center;
    font-weight: 300;
    line-height: 52px;
    cursor: pointer;
  }

  .buy-btn {
    background-color: #7A45E5;
  }

  .del-btn {
    display: none;
    background-color: #FF4069;
  }

  .check-buy-btn {
    background-color: #7A45E5;
    width: 120px;
    height: 60px;
    color: #fff;
    text-align: center;
    font-weight: 300;
    line-height: 52px;
    cursor: pointer;
  }
  .check-del-btn {
    background-color: #FF4069;
    width: 120px;
    height: 60px;
    color: #fff;
    text-align: center;
    font-weight: 300;
    line-height: 52px;
    cursor: pointer;
  }

  .del-box .total {
    display: none;
  }

  .del-box .buy-btn {
    display: none;
  }

  .del-box .del-btn {
    display: block;
  }

</style>
