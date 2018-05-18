<template>
  <div class="content-body">
    <transition name="fade">
      <div class="column food-detail" v-if="visiable" @click="isShow">
        <div style="height: 70%">
          <img :src="imagePathFood + foodMessage.imageUrl" alt="" style="height: 100%;width: 100%" v-if="foodMessage.imageUrl.length > 0">
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
          <div class="row" style="font-size: 14px;align-items: flex-end">
            <span style="color: coral">￥{{foodMessage.standardPrice}}</span>
            <span style="color: red;margin-left: 5%" v-if="foodMessage.memberPrice >= 0">会员价  ￥{{foodMessage.memberPrice}}</span>
            <button class="btn">直接购买</button>
          </div>
        </div>
      </div>
    </transition>
    <transition name="fade">
      <div class="single-food-background" @click="isShow" v-if="visiable"></div>
    </transition>
    <div class="column" style="background: #81d8cf;position: relative;height: 170px">
      <div class="row" style="width: 100%;height: 100%;padding: 4%">
        <div style="width: 113px;">
          <img :src="imagePath + imgUrl" alt="" style="width: 100%;height: 100%">
        </div>
        <div class="column stall-info" >
          <h3 style="height: 20%;width: 100%;position: absolute;top: 0;">{{name}}</h3>
          <span style="height: auto;width: 100%;overflow: auto;position: absolute;font-size: 12px;">{{introduction}}</span>
          <span style="height: 20%;width: 100%;position: absolute;bottom: 0">商家电话： {{phone}}</span>
        </div>
      </div>
    </div>
    <div class="content-body" style="height: 100%;overflow: scroll;flex-direction: row">
      <div class="food-category-body">
        <template v-for="foodCategory in foodCategoryArr">
          <div class="single-food-category" :key="foodCategory.name" @click="getCategoryIndex(foodCategory.id)">
            {{foodCategory.name}}
          </div>
        </template>
      </div>
      <div class="food-body">
        <template v-for="foodCategory in foodCategoryArr">
          <div :key="foodCategory.id" class="food-card" >
            <div class="food-card-title" :id="foodCategory.id">{{foodCategory.name}}</div>
            <template v-for="(food) in foodArr" v-if="food.categoryId === foodCategory.id" @click="foodDetail(food)">
              <div :key="food.id" class="food-card-body" @click="foodDetail(food)">
                <div class="food-image">
                  <img :src="imagePathFood + food.imageUrl" alt="">
                </div>
                <div class="food-card-body-info">
                  <div class="food-name">{{food.name}}</div>
                  <div class="other-food-info">
                    <div class="other-food-info-left">
                      <div v-if="food.memberPriceRemaining >= 0">优惠剩余{{food.memberPriceRemaining}}份</div>
                      <template v-if="food.positiveRate === 0">
                        <div>暂无评分</div>
                      </template>
                      <template v-else>
                        <div v-if="food.positiveRate >= 0" >同学推荐:{{food.positiveRate}}</div>
                      </template>
                    </div>
                  </div>
                  <div class="row" style="align-items: center;position: relative">
                    <div style="color: #8f8f94">￥{{food.standardPrice}}</div>
                    <div style="color: #8f8f94" v-if="food.memberPrice >= 0">/</div>
                    <div style="color: red" v-if="food.memberPrice >= 0">￥{{food.memberPrice}} 会员价</div>
                    <img src="../../static/images/insert.png" alt="" style="width: 15%;height: 130%;position: absolute;right: 0">
                  </div>
                </div>
              </div>
            </template>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import FoodDetail from '../components/FoodDetail'

export default {
  name: 'foodManagement',
  data () {
    return {
      category: [],
      list: [],
      categoryName: '',
      name: '',
      phone: '',
      imgUrl: '',
      introduction: '',
      stallId: this.stallId,
      commentFlag: false,
      type: '',
      foodIndex: 0,
      modal1: false,
      modal2: false,
      foodCategoryArr: [],
      foodArr: [],
      imagePath: this.const.imagePath.stall,
      imagePathFood: this.const.imagePath.food,
      foodMap: {},
      foodMessage: {},
      visiable: false,
      screenHeight: document.body.clientHeight * 0.9 - 170
    }
  },
  created () {
    this.checkSession()
  },
  components: {FoodDetail},
  methods: {
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
              this.imgUrl = response.info.imageUrl
              this.name = response.info.name
              this.phone = response.info.phone
              this.introduction = response.info.introduction
              this.route = this.const.imagePath + response.info.imageUrl
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
    -webkit-transition: all linear 0.5s;
    -moz-transition: all linear 0.5s;
    -ms-transition: all linear 0.5s;
    -o-transition: all linear 0.5s;
    transition: all linear 0.5s;
  }
  .btn{
    color: white;
    background: #5ac83a;
    border-radius: 100px;
    width: 90px;
    height: 35px;
    outline: none;
    border: none;
    position: absolute;
    right: 5%;
  }
  .content-body {
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flex;
    display: flex;
    width: 100%;
    height: 90%;
    color: #8a8a8a;
    flex-direction: column;
  }

  .food-category-body {
    width: 20%;
    height: 100%;
    border-right: 1px solid #e4e4e4;
    overflow: scroll;
    display: inline-block;
    box-sizing: border-box;
  }

  .single-food-category {
    padding: 20px;
    border-bottom: 1px solid #e4e4e4;
  }

  .food-body {
    scroll-behavior: smooth;
    padding-left: 5px;
    width: 80%;
    height: 100%;
    background: #fff;
    overflow: auto;
  }

  .food-card {
    width: 100%;
  }

  .food-card-title {
    width: 100%;
    padding: 2px;
    font-size: 16px;
    font-weight: bold;
    border-bottom: 1px solid #e4e4e4;
    border-top: 1px solid #e4e4e4;
  }

  .food-card-body {
    overflow: auto;
    width: 100%;
    border-bottom: 1px solid #e4e4e4;
  }

  .food-card-body:last-child {
    border: none;
  }

  .food-image {
    display: inline-block;
    margin-left: 5px;
    margin-top: 10px;
    width: 60px;
    height: 60px;
  }

  .food-image > img{
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }

  .food-card-body-info {
    float: right;
    flex-direction: column;
    justify-content: space-between;
    padding: 10px;
    width: 72%;
    height: 100%;
    position: relative;
  }

  .food-name {
    padding-bottom: 5px;
    font-size: 16px;
    font-weight: bold;
  }

  .other-food-info {
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flex;
    display: flex;
    width: 100%;
    height: 40%;
  }

  .other-food-info-left {
    padding-bottom: 5px;
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flex;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    width: 55%;
    height: 100%;
  }

  .other-food-info-left > div:first-child {
    padding-bottom: 5px;
  }
  .column{
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flex;
    display: flex;
    flex-direction: column;
  }
  .row{
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flex;
    display: flex;
    flex-direction: row;
  }
  .stall-info{
    color: white;
    overflow: hidden;
    width: 70%;
    padding-left: 3%;
    position: relative;
    align-items: flex-start;
    justify-content: center;
    word-spacing: 2px;
    letter-spacing: 1px
  }
  .food-detail-info{
    background: white;
    height: 30%;
    padding: 15px;
  }
  .single-food-background {
    -webkit-transition: all linear 0.5s;
    -moz-transition: all linear 0.5s;
    -ms-transition: all linear 0.5s;
    -o-transition: all linear 0.5s;
    transition: all linear 0.5s;
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 8;
    background: rgba(0, 0, 0, 0.5);
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
</style>
