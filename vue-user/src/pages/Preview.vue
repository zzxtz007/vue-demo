<template>
  <div class="content">
    <transition name="fade">
      <div class="column food-detail" v-if="visiable" @click="isShow">
        <div style="height: 70%">
          <img :src="imagePathFood + foodMessage.imageUrl"  alt="" style="height: 100%;width: 100%" v-if="foodMessage.imageUrl.length > 0">
          <img src="../../static/images/no-pic.png" alt="" style="height: 100%;width: 100%" v-else>
          <div class="introduction">
            <pre>{{foodMessage.introduction}}</pre>
          </div>
        </div>
        <div class="column food-detail-info">
          <h3 style="font-size: 18px;color: #4d4d4d;">{{foodMessage.name}}</h3>
          <div class="row" style="font-size: 13px;margin-top: 5%;margin-bottom: 5%">
            <span>已售{{foodMessage.saleCount}}份</span>
            <span style="margin-left: 10%">同学推荐{{foodMessage.positiveRate}}%</span>
          </div>
            <div class="row" style="font-size: 14px;position: relative">
              <span style="color: coral;overflow: auto">￥{{foodMessage.standardPrice}}</span>
              <span style="color: red;overflow: auto;margin-left: 5%" v-if="foodMessage.memberPrice >= 0">会员价  ￥{{foodMessage.memberPrice}}</span>
              <button class="btn">直接购买</button>
          </div>
        </div>
      </div>
    </transition>
    <transition name="fade">
      <div class="single-food-background" @click="isShow" v-if="visiable"></div>
    </transition>
    <div class="stall">
        <img :src="stallInfo.imageUrl ? imagePath + stallInfo.imageUrl : ''" class="stall-img">
        <div class="stall-info">
          <h3 class="stall-name">{{stallInfo.name}}</h3>
          <div>{{stallInfo.introduction}}</div>
          <div style="position: relative">
            <div>商家电话:{{stallInfo.phone}}</div>
          </div>
        </div>
    </div>
    <div class="category-list">
      <template v-for="foodCategory of foodCategoryArr">
        <div class="single-category" :key="foodCategory.id" @click="getCategoryIndex(foodCategory.id)">
          {{foodCategory.name}}
        </div>
      </template>
    </div>
    <div class="food-content-list">
      <template v-for="foodCategory of foodCategoryArr">
        <div :key="foodCategory.id">
          <div class="food-category-name" :id="foodCategory.id">{{foodCategory.name}}</div>
          <template v-for="(singleFood) in foodArr" v-if="singleFood.categoryId === foodCategory.id && singleFood.isOnSale === true">
            <div class="food-info" :key="singleFood.id" @click="foodDetail(singleFood)">
              <img :src="imagePathFood + singleFood.imageUrl" class="food-img">
              <div class="food-info-detail">
                <div class="food-name">{{singleFood.name}}</div>
                <div v-if="singleFood.memberPriceRemaining >= 0">优惠剩余{{singleFood.memberPriceRemaining}}份</div>
                <div class="grade">
                  <template v-if="singleFood.positiveRate === 0">
                    <div>暂无评分</div>
                  </template>
                  <template v-else>
                    <div v-if="singleFood.positiveRate >= 0" >同学推荐:{{singleFood.positiveRate | recommendFilter}}</div>
                  </template>
                </div>
                <div class="price-row">
                  <div class="standard-price">￥{{singleFood.standardPrice}}</div>
                  <div v-if="singleFood.memberPrice" class="standard-price">/</div>
                  <div v-if="singleFood.memberPrice" class="member-price">￥{{singleFood.memberPrice}}会员价</div>
                  <img  src="../../static/images/insert.png" class="add-img">
                </div>
              </div>
            </div>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'preview',
  data () {
    return {
      stallId: '',
      stallInfo: {},
      foodCategoryArr: [],
      foodArr: [],
      visiable: false,
      foodMessage: {},
      imagePath: this.const.imagePath.stall,
      imagePathFood: this.const.imagePath.food
    }
  },
  created () {
    this.checkSession()
  },
  filters: {
    recommendFilter: function (positiveRate) {
      return positiveRate * 100 + '%'
    }
  },
  methods: {
    /**
     * 检查登录状态
     * */
    checkSession: function () {
      const that = this
      this.utils.http.get('/api/session')
        .then(response => {
          if (response.role !== 2) {
            this.utils.timeOutLogin()
          }
          const ret = parseInt(response.status)
          switch (ret) {
            case 0:
              that.stallId = response.uid
              this.getStallInfo()
              this.getFoodCategory()
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
      const stallId = this.stallId
      this.utils.http.get('/api/stalls/' + stallId)
        .then(response => {
          const ret = parseInt(response.status)
          switch (ret) {
            case 0:
              this.stallInfo = response.info
              break
            case 2:
              this.utils.timeOutLogin(this)
              break
            default:
              this.utils.systemError(this)
              break
          }
        })
        .catch(error => {
          this.utils.systemError(error)
        })
    },
    /**
     * 获取菜品分类
     */
    getFoodCategory: function () {
      let that = this
      that.utils.http.get('/api/stalls/' + this.stallId + '/food-categories')
        .then(response => {
          switch (response.status) {
            case 0:
              that.foodCategoryArr = response.info
              that.getFood()
              break
            case 2:
              that.utils.timeOutLogin(that)
              break
            default:
              that.utils.systemError(that)
              break
          }
        })
    },

    /**
     * 获取菜品
     */
    getFood: function () {
      let that = this
      let idList = []
      let foodCategoryArr = that.foodCategoryArr
      for (let foodCategory of foodCategoryArr) {
        idList.push(foodCategory.id)
      }
      that.utils.http.get('/api/food-categories/food', {idList: JSON.stringify(idList)})
        .then(response => {
          switch (response.status) {
            case 0:
              that.foodArr = that.sort(response.info)
              break
            case 2:
              that.utils.timeOutLogin(that)
              break
            default:
              that.utils.systemError(that)
              break
          }
        })
    },

    /**
     * 根据权重和id排序
     */
    sort: function (foodArr) {
      foodArr.sort(function (o1, o2) {
        return o1.categoryId - o2.categoryId
      })
      foodArr.sort(function (o1, o2) {
        if (o1.categoryId === o2.categoryId) {
          return o2.weight - o1.weight
        }
      })
      return foodArr
    },
    /**
     * 获取点击菜品分类的下标
     * @param id
     */
    getCategoryIndex: function (id) {
      let anchor = document.getElementById(id)
      anchor.scrollIntoView()
    },
    foodDetail: function (food) {
      this.visiable = !this.visiable
      this.foodMessage = food
    },
    isShow: function () {
      this.visiable = !this.visiable
    }
  }
}
</script>

<style scoped>
  /*子页面*/
  .column{
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flex;
    display: flex;
    flex-direction: column;
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
  .introduction{
    position: absolute;
    left: 5%;
    bottom: 30%;
    z-index: 12;
    color: white;
    width: 90%;
    height: auto;
    overflow: hidden;
  }
  .food-detail-info{
    background: white;
    height: 30%;
    padding: 15px;
  }
  .row{
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flex;
    display: flex;
    flex-direction: row;
  }
  .btn{
    position: absolute;
    right: 0;
    bottom: 0;
    color: white;
    background: #5ac83a;
    border-radius: 100px;
    width: 90px;
    height: 35px;
    outline: none;
    border: none;
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
  /*主页面*/
  .add-img {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    position: absolute;
    float: right;
    right: 15px;
  }
  .member-price {
    color: red;
  }
  .standard-price{
    display: flex;
  }
  .price-row{
    align-items: center;
    flex-direction: row;
    display: flex;
  }
  .food-name{
    font-weight: bold;
    font-size: 16px;
    color: #8f8f94;
  }
  .food-info-detail{
    float: right;
    flex-direction: column;
    justify-content: space-between;
    padding: 10px;
    width: 72%;
    /*height: 100%;*/
    position: relative;
  }
  .food-info {
    display: flex;
    border-bottom: 1px solid #e4e4e4;
  }
  .food-img{
    border-radius: 50%;
    width: 60px;
    height: 60px;
    margin: 2%;
  }
  .food-category-name{
    width: 100%;
    padding: 2px;
    font-size: 16px;
    font-weight: bold;
    border-bottom: 1px solid #e4e4e4;
    border-top: 1px solid #e4e4e4;
  }
  .food-content-list {
    position: relative;
    scroll-behavior: smooth;
    padding-left: 5px;
    width: 80%;
    height: calc(100% - 120px);
    background: #fff;
    overflow: auto;
  }
  .single-category{
    /*margin: 0 auto;*/
    box-sizing: border-box;
    border-bottom: 1px solid #e4e4e4;
    padding: 20%;
    text-align: center;
    display: flex;
    height: auto;
  }
  .category-list{
    border-right: 1px solid #e4e4e4;
    color: #8a8a8a;
    width: 20%;
    scroll-behavior: smooth;
    height: calc(100% - 120px);
    display: flex;
    flex-direction: column;
    background-color: #f2f2f2;
    float: left;
    text-align: center;
  }
  .stall-info {
    height: 100px;
    width: 65%;
    font-size: 14px;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-weight: 700;
  }
  .stall {
    box-sizing: border-box;
    padding: 2%;
    display: flex;
    height: 120px;
    justify-content: space-around;
    align-items: center;
    background: #89D4CA;
  }
  .stall-img {
    float: left;
    width: 100px;
    height: 100px;
  }
  .content{
    width: 100%;
    height: calc(100% - 72px);
    overflow: auto;
    background: white;
  }
</style>
