<template>
  <div class="content-body">
    <single-food-detail :foodArr="foodArr" :foodIndex="foodIndex" :type="type" :commentFlag="commentFlag"
                        :foodCategoryArr="foodCategoryArr" :foodMap="foodMap" v-if="commentFlag"
                        v-on:controlFood="closeSingleFood(foodArr)" v-on:changeCategoryId="sort(foodArr)"
                        v-on:insertFood="getFood"></single-food-detail>
    <transition name="fade">
    <div class="single-food-background" :style="'height:' + screenHeight + 'px'" @click="closeSingleFood"
           v-if="commentFlag"></div>
    </transition>
    <div class="food-category-body">
      <template v-for="foodCategory in foodCategoryArr">
        <div class="single-food-category" :key="foodCategory.name" @click="getCategoryIndex(foodCategory.id)">
          {{foodCategory.name}}
        </div>
      </template>
    </div>
    <div class="food-body">
      <Modal
        v-model="modal1"
        title="下架菜品"
        @on-ok="dropOffFood">
        <p>是否确认下架菜品</p>
      </Modal>
      <Modal
        v-model="modal2"
        title="上架菜品"
        @on-ok="resellFood">
        <p>是否确认上架菜品</p>
      </Modal>
      <template v-for="foodCategory in foodCategoryArr">
        <div :key="foodCategory.id" class="food-card">
          <div class="food-card-title" :id="foodCategory.id">{{foodCategory.name}}</div>
          <template v-for="(food, index) in foodArr" v-if="food.categoryId === foodCategory.id">
            <div :key="food.id" class="food-card-body">
              <div class="food-image">
                <img :src="imagePath + food.imageUrl" alt="">
              </div>
              <div class="food-card-body-info">
                <div class="food-name">{{food.name}}</div>
                <div class="other-food-info">
                  <div class="other-food-info-left">
                    <div>已售{{food.saleCount}}</div>
                    <template v-if="food.positiveRate === 0">
                      <div>暂无评分</div>
                    </template>
                    <template v-else>
                      <div>综合评分{{food.positiveRate * 100}}%</div>
                    </template>
                  </div>
                  <div class="other-food-info-right">
                    <img :src="upWeightBtnImg" alt="" class="change-weight-btn"
                         @click="changeWeight('up', index)">
                    <img :src="downWeightBtnImg" alt="" class="change-weight-btn"
                         @click="changeWeight('down', index)">
                  </div>
                </div>
                <div class="price">
                  <div>基本价</div>
                  <div>￥{{food.standardPrice.toFixed(2)}}</div>
                </div>
                <template v-if="food.memberPriceCost">
                  <div class="isMember price">
                    <div>会员成本价</div>
                    <div>￥{{food.memberPriceCost.toFixed(2)}}</div>
                  </div>
                </template>
                <div class="btn-group">
                  <template v-if="food.isOnSale === true">
                    <Button class="cancel-sales btn" @click="showNotice(food.isOnSale, index)">下架</Button>
                  </template>
                  <template v-else>
                    <Button class="restart btn" @click="showNotice(food.isOnSale, index)">上架</Button>
                  </template>
                  <Button class="change btn" @click="changeFood(index)">修改</Button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </template>
      <div class="insert-btn" @click="insertFood()"></div>
    </div>
  </div>
</template>

<script>
import singleFoodDetail from '../components/SingleFoodDetail'

export default {
  name: 'foodManagement',
  data () {
    return {
      screenHeight: document.documentElement.clientHeight,
      stallId: sessionStorage.getItem('stallId'),
      commentFlag: false,
      type: '',
      foodIndex: 0,
      modal1: false,
      modal2: false,
      upWeightBtnImg: require('../../static/images/up-img.png'),
      downWeightBtnImg: require('../../static/images/down-img.png'),
      foodCategoryArr: [],
      foodArr: [],
      imagePath: this.const.imagePath.food,
      foodMap: {}
    }
  },
  created () {
    this.checkSession()
  },
  components: {singleFoodDetail},
  methods: {

    /**
     * 检查session
     */
    checkSession: function () {
      const that = this
      this.utils.http.get('/api/session')
        .then(response => {
          const ret = parseInt(response.status)
          switch (ret) {
            case 0:
              that.stallId = response.uid
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
        if (o1.weight !== o2.weight) {
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

    /**
       * 下架指定菜品
       */
    dropOffFood: function () {
      let that = this
      let index = that.foodIndex
      let food = that.foodArr[index]
      food.isOnSale = false
      that.utils.http.delete('/api/food/' + that.foodArr[index].id + '/on-sale')
        .then(response => {
          switch (response) {
            case 0:
              this.$set(that.foodArr, index, food)
              break
            case 2:
              that.utils.timeOutLogin(that)
              break
          }
        })
        .catch(() => that.utils.systemError(that))
    },

    /**
       * 上架指定菜品
       */
    resellFood: function () {
      let that = this
      let index = that.foodIndex
      let food = that.foodArr[index]
      food.isOnSale = true
      that.utils.http.post('/api/food/' + that.foodArr[index].id + '/on-sale')
        .then(response => {
          switch (response) {
            case 0:
              this.$set(that.foodArr, index, food)
              break
            case 2:
              that.utils.timeOutLogin(that)
              break
          }
        })
        .catch(() => that.utils.systemError(that))
    },

    /**
       * 添加食物
       */
    insertFood: function () {
      let that = this
      that.foodMap = {'standardPrice': 0, 'packFee': 0}
      that.type = 'insert'
      that.commentFlag = !that.commentFlag
    },

    /**
       * 修改菜品
       * @param index 菜品数组下标
       */
    changeFood: function (index) {
      let that = this
      let foodMap = that.foodArr[index]
      let keys = Object.keys(foodMap)

      for (let key of keys) {
        that.foodMap[key] = foodMap[key]
      }
      that.foodIndex = index
      that.type = 'change'
      that.commentFlag = !that.commentFlag
    },

    closeSingleFood: function (foodArr) {
      this.commentFlag = false
      if (foodArr.length) {
        this.sort(foodArr)
      }
    },

    /**
       * 修改权重
       * @param type 类型上或下
       * @param index 菜品数组下标
       */
    changeWeight: function (type, index) {
      let foodArr = this.foodArr
      let changeFood = foodArr[index]
      let sameCategoryIdFood = []
      let foodLength
      let idList = []
      for (let food of foodArr) {
        if (food.categoryId === changeFood.categoryId) {
          sameCategoryIdFood.push(food)
        }
      }
      let weight = sameCategoryIdFood.length
      foodLength = sameCategoryIdFood.length

      for (let newArrIndex = 0; newArrIndex < foodLength; newArrIndex++) {
        if (sameCategoryIdFood[newArrIndex].id === changeFood.id) {
          index = newArrIndex
        }
      }

      /**
       * 当往上移动时
       */
      if (type === 'up' && index === 0) {
        this.$Message.warning('无法继续提升权重')
      }

      if (type === 'up' && index !== 0) {
        weight = weight - index + 1
        for (let foodIndex = foodLength; foodIndex > 0; foodIndex--) {
          let number = foodLength - foodIndex

          if (foodIndex === weight - 1) {
            sameCategoryIdFood[number].weight = weight
            continue
          }
          if (foodIndex === weight) {
            sameCategoryIdFood[number].weight = weight - 1
            continue
          }
          sameCategoryIdFood[number].weight = foodIndex
        }
      }

      /**
       * 当往下移动时
       */

      if (type === 'down' && index === foodLength - 1) {
        this.$Message.warning('无法继续降低权重')
      }
      if (type === 'down' && index !== foodLength - 1) {
        weight = weight - index - 1
        for (let foodIndex = foodLength; foodIndex > 0; foodIndex--) {
          let number = foodLength - foodIndex

          if (foodIndex === weight + 1) {
            sameCategoryIdFood[number].weight = weight
            continue
          }
          if (foodIndex === weight) {
            sameCategoryIdFood[number].weight = weight + 1
            continue
          }
          sameCategoryIdFood[number].weight = foodIndex
        }
      }

      /**
         * 假使是第一个往上移，或者最后一个向下移动则结束方法
         */
      if ((type === 'up' && index === 0) || (type === 'down' && index === foodLength - 1)) {
        return
      }

      sameCategoryIdFood = this.sort(sameCategoryIdFood)
      for (let food of sameCategoryIdFood) {
        idList.push(food.id)
      }

      this.utils.http.put('/api/food-categories/' + sameCategoryIdFood[0].categoryId + '/food/weight',
        {idList: JSON.stringify(idList)})
        .then(response => {
          switch (response.status) {
            case 0:
              this.$Message.success('成功')
              for (let oldFood of foodArr) {
                for (let newFood of sameCategoryIdFood) {
                  if (oldFood.id === newFood.id) {
                    oldFood = newFood
                  }
                }
              }
              foodArr = this.sort(foodArr)
              break
            case 2:
              this.utils.timeOutLogin(this)
              break
          }
        })
        .catch(() => this.utils.systemError(this))
    },

    /**
       * 显示通知消息
       * @param flag 判断是否在销售
       * @param index 下标
       */
    showNotice: function (flag, index) {
      if (flag) {
        this.modal1 = true
        this.foodIndex = index
      } else {
        this.modal2 = true
        this.foodIndex = index
      }
    }

  }

}
</script>

<style scoped>

  .content-body {
    display: flex;
    position: relative;
    width: 100%;
    height: calc(100% - 72px);
    color: #8a8a8a;
  }

  .food-category-body {
    display: inline-block;
    box-sizing: border-box;
    width: 20%;
    height: 100%;
    border-right: 1px solid #e4e4e4;
    overflow: auto;
  }

  .single-food-category {
    padding: 20px;
    border-bottom: 1px solid #e4e4e4;
  }

  .food-body {
    box-sizing: border-box;
    float: right;
    scroll-behavior: smooth;
    padding-left: 5px;
    position: relative;
    width: 80%;
    height: 100%;
    background: #fff;
    overflow: auto;
  }

  .insert-btn {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    position: fixed;
    right: 10px;
    bottom: 15%;
    background: url("../../static/images/insert.png");
    -webkit-background-size: cover;
    -moz-background-size: cover;
    -o-background-size: cover;
    background-size: cover;
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
    float: left;
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

  .price {
    padding-bottom: 5px;
    width: 80%;
    display: flex;
    justify-content: space-between;
  }

  .isMember {
    color: #f00;
  }

  .food-card-body-info {
    display: inline-block;
    padding: 10px;
    width: 72%;
    height: 100%;
  }

  .food-name {
    padding-bottom: 5px;
    font-size: 16px;
    font-weight: bold;
  }

  .other-food-info {
    display: flex;
    width: 100%;
    height: 40%;
  }

  .other-food-info-left {
    padding-bottom: 5px;
    display: inline-block;
    width: 55%;
    height: 100%;
  }

  .other-food-info-left > div:first-child {
    padding-bottom: 5px;
  }

  .other-food-info-right {
    float: right;
    width: 45%;
    height: 100%;
  }

  .change-weight-btn {
    width: 32px;
    max-height: 32px;
  }

  .btn-group {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 20%;
  }

  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    width: 48%;
    height: 100%;
  }

  .cancel-sales {
    color: #f00;
    border: 1px solid #f00;
  }

  .restart {
    color: #5ac83c;
    border: 1px solid #5ac83c;
  }

  .change {
    text-align: center;
    color: #09A9A5;
    border: 1px solid #09A9A5;
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
</style>
