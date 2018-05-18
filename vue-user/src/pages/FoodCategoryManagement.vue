<template>
  <div id="content">
    <ul class="table-view" v-for="(message,index) in categoryArr " v-bind:key="message.id">
      <li class="table-view-cell">
        <div class="in-cell" style="width: 45%;">
          <span>{{message.name}}</span>
        </div>
        <div style="width: 55%;float: right;">
          <template>
            <Button class="modify-btn in-cell" type="primary" @click="modifyModel = true;getSingleCategory(message,
            index)">
              修改
            </Button>
            <Modal v-model="modifyModel" title="修改菜品分类名称" @on-ok="save">
              <input type="text" v-model="singleFoodDetail.name" ref="input">
            </Modal>
          </template>
          <template>
            <Button class="delete-btn in-cell" type="primary" @click="deleteModal = true;deleteCategory(message,index)">
              删除
            </Button>
            <Modal v-model="deleteModal" title="请您确认" @on-ok="remove">
              <p>是否删除此产品分类</p>
            </Modal>
          </template>
          <div class="in-cell" @click="changeWeight('up',index)" style="padding-left: 10%">
            <img src="../../static/images/up-img.png"/>
          </div>
          <div class="in-cell" @click="changeWeight('down',index)" style="padding-left: 10%">
            <img src="../../static/images/down-img.png"/>
          </div>
        </div>
      </li>
    </ul>
    <template>
      <div class="table-view-cell" @click="model1 = true" style="background: white">
        <img src="../../static/images/add.png" class="add-img"/><span class="add-btn">添加</span>
        <Modal v-model="model1" title="添加分类" @on-ok="addFoodCategory">
          <input type="text" maxlength="12" placeholder="12字以内" v-model="newName"/>
        </Modal>
      </div>
    </template>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */

export default {
  name: 'food-category-management',
  data: function () {
    return {
      deleteModal: false,
      model1: false,
      modifyModel: false,
      uid: '',
      singleFoodDetail: {},
      categoryArr: [],
      index: '',
      categoryIdArr: [],
      newName: ''
    }
  },
  created: function () {
    this.checkSession()
  },
  methods: {
    /*
      * 获取单个分类信息
      */
    getSingleCategory: function (message, index) {
      this.singleFoodDetail = this.getSingleCategoryMap(message)
      this.index = index
    },
    deleteCategory: function (message, index) {
      this.singleFoodDetail = this.getSingleCategoryMap(message)
      this.index = index
    },

    getSingleCategoryMap: function (obj) {
      let keys = Object.keys(obj)
      let newMap = {}
      for (let key of keys) {
        newMap[key] = obj[key]
      }
      return newMap
    },

    /**
       * 检查登录状态
       */
    checkSession: function () {
      let that = this
      this.utils.http.get('/api/session')
        .then(response => {
          let ret = parseInt(response.status)
          switch (ret) {
            case 2:
              that.utils.timeOutLogin(that)
              that.$router.push({name: 'login'})
              break
            case 0:
              that.uid = response.uid
              that.getFoodCategory()
          }
        })
        .catch(() => {
          that.utils.systemError(this)
        })
    },
    /**
       * 获取菜品分类
       */
    getFoodCategory: function () {
      let that = this
      this.utils.http.get('/api/stalls/' + this.uid + '/food-categories')
        .then(response => {
          let ret = parseInt(response.status)
          switch (ret) {
            case 2:
              that.utils.timeOutLogin(that)
              break
            case 0:
              let categoryInfo = []
              categoryInfo = response.info
              for (let i = 0; i < categoryInfo.length - 1; i++) {
                for (let j = i + 1; j < categoryInfo.length; j++) {
                  if (categoryInfo[i]['weight'] < categoryInfo[j]['weight']) {
                    let temp = categoryInfo[i]
                    categoryInfo[i] = categoryInfo[j]
                    categoryInfo[j] = temp
                  }
                }
              }
              that.categoryArr = categoryInfo
              for (let k = 0; k < categoryInfo.length; k++) {
                let categoryId = categoryInfo[k]['id']
                that.categoryIdArr.push(categoryId)
              }
          }
        })
        .catch(() => {
          that.utils.systemError(this)
        })
    },
    /**
       * 删除分类
       */
    remove: function () {
      let that = this
      this.utils.http.delete('/api/food-categories/' + this.singleFoodDetail.id)
        .then(response => {
          let ret = response.status
          switch (ret) {
            case 0:
              this.categoryArr.splice(this.index, 1)
              this.saveSuccess()
              break
            case 2:
              this.utils.timeOutLogin(this)
              break
          }
        })
        .catch(() => {
          that.utils.systemError(this)
        })
    },
    /**
       * 修改权重
       */
    changeWeight: function (type, index) {
      let that = this
      let idList = []
      let categoryArr = this.categoryArr
      let weight = categoryArr.length
      let categoryLength = categoryArr.length

      if (type === 'up' && index !== 0) {
        weight = weight - index + 1
        for (let categoryIndex = categoryLength; categoryIndex > 0; categoryIndex--) {
          let number = categoryLength - categoryIndex
          if (categoryIndex === weight - 1) {
            categoryArr[number].weight = weight
            continue
          }
          if (categoryIndex === weight) {
            categoryArr[number].weight = weight - 1
            continue
          }
          categoryArr[number].weight = categoryIndex
        }
      }

      if (type === 'down' && index !== categoryArr.length - 1) {
        weight = weight - index - 1
        for (let categoryIndex = categoryLength; categoryIndex > 0; categoryIndex--) {
          let number = categoryLength - categoryIndex
          if (categoryIndex === weight + 1) {
            categoryArr[number].weight = weight
            continue
          }
          if (categoryIndex === weight) {
            categoryArr[number].weight = weight + 1
            continue
          }
          categoryArr[number].weight = categoryIndex
        }
      }

      /**
         * 假使是第一个往上移，或者最后一个向下移动则结束方法
         */
      if (type === 'up' && index === 0) {
        that.onTop()
      }
      if (type === 'down' && index === categoryLength - 1) {
        that.onBottom()
      }
      categoryArr = this.sort(categoryArr)
      for (let food of categoryArr) {
        idList.push(food.id)
      }

      this.utils.http.put('/api/stalls/' + this.uid + '/food-categories/weight',
        {'idList': JSON.stringify(idList), 'uid': this.uid})
        .then(response => {
          switch (response.status) {
            case 0:
              if ((type === 'up' && index === 0) || (type === 'down' && index === categoryLength - 1)) {
              } else {
                this.saveSuccess()
              }
              break
            default:
              this.saveErr()
              break
          }
        })
        .catch(() => {
          that.utils.systemError(this)
        })
    },
    /**
       * 根据权重和id排序
       */
    sort: function (categoryArr) {
      categoryArr.sort(function (o1, o2) {
        return o2.weight - o1.weight
      })
      return categoryArr
    },
    /*
       * 提示信息
       */
    saveSuccess: function () {
      this.$Message.success('成功')
    },
    saveErr: function () {
      this.$Message.error('失败')
    },
    onTop: function () {
      this.$Message.warning('已经在顶部了')
    },
    onBottom: function () {
      this.$Message.warning('已经在底部了')
    },
    sameNameTips: function () {
      this.$Message.error('已有此分类')
    },
    /**
       * 保存修改分类名称
       */
    save: function () {
      if (this.singleFoodDetail.name === '') {
        this.$Message.error('分类名称不能为空')
        return
      }
      for (let category of this.categoryArr) {
        if (category.name === this.singleFoodDetail.name) {
          this.sameNameTips()
          this.singleFoodDetail.name = category.name
          return
        }
      }

      this.utils.http.put('/api/food-categories/' + this.singleFoodDetail.id, {
        'name': this.singleFoodDetail.name
      })
        .then(response => {
          switch (response.status) {
            case 0:
              this.categoryArr[this.index].name = this.singleFoodDetail.name
              this.saveSuccess()
              break
            default:
              this.saveErr()
              break
          }
        })
        .catch(() => {
          this.utils.systemError(this)
        })
    },
    /**
       * 添加菜品分类
       */
    addFoodCategory: function () {
      if (this.newName === '') {
        this.$Message.error('分类名称不能为空')
        return
      }
      for (let category of this.categoryArr) {
        if (category.name === this.newName) {
          this.sameNameTips()
          return
        }
      }
      this.utils.http.post('/api/stalls/' + this.uid + '/food-categories', {'name': this.newName})
        .then(response => {
          switch (response.status) {
            case 0:
              this.saveSuccess()
              this.getFoodCategory()
              this.newName = ''
              break
            default:
              this.saveErr()
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
  #content {
    height: calc(100% - 72px);
    width: 100%;
    overflow: auto;
    font-size: 14px;
  }

  .table-view {
    position: relative;
    margin-top: 0;
    margin-bottom: 0;
    padding-left: 0;
    list-style: none;
    background-color: #fff;
    overflow: auto;
  }

  .table-view-cell {
    position: relative;
    overflow: hidden;
    padding: 11px 15px;
    border-bottom: lightgrey solid 1px;
  }

  .table-view-cell p {
    margin-bottom: 0;
  }

  p {
    font-size: 14px;
    margin-top: 0;
    margin-bottom: 10px;
    color: #8f8f94;
  }

  .delete-btn {
    width: 26%;
    color: orangered;
    border: none;
    font-size: 14px;
    background-color: #fff;
    float: left;
    padding: 0;
  }

  .modify-btn {
    width: 26%;
    color: #81d8cf;
    border: none;
    font-size: 14px;
    background-color: #fff;
    float: left;
    padding: 0;
  }

  .in-cell {
    padding-top: 6px;
    float: left;
  }

  img {
    width: 22px;
    height: 22px;
  }

  .add-img {
    position: relative;
    left: 40%;
    top: 6px;
  }

  .add-btn {
    color: #8f8f94;
    position: relative;
    left: 42%;
    border: none;
    font-size: 14px;
  }
</style>
