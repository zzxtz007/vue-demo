<template>
  <transition name="fade">
    <div class="single-food-body" :style="'height:' + screenHeight + 'px'">
      <Form ref="form" :model="foodMap" :rules="ruleInline">
        <FormItem prop="imageUrl" label="菜品图片">
          <div style="width: 100%; text-align: right">
            <div style="width: 70%;" class="ivu-input-wrapper ivu-input-type">
              <div class="insert-input-background" :style="'height:' + insertImgBackgroundHeight + 'px'">
                <template v-if="foodMap.id">
                  <img :src="showImage" alt="" class="image"/>
                  <input type="file" v-on:change="choiceImage($event)" class="insert-input" accept="image/jpeg,image/png"
                         :style="'height:' + insertImgBackgroundHeight + 'px'"/>
                </template>
                <template v-else>
                  <img :src="showImage" alt="" class="image"/>
                  <input type="file" v-on:change="insertImage($event)" class="insert-input" accept="image/jpeg,image/png"
                         :style="'height:' + insertImgBackgroundHeight + 'px'"/>
                </template>
              </div>
            </div>
          </div>
        </FormItem>
        <FormItem prop="name" label="菜品名称">
          <div style="text-align: right">
            <Input v-model="foodMap.name" placeholder="32字以内" style="width: 70%" :maxlength=32 @on-focus="focus"/>
          </div>
        </FormItem>
        <FormItem prop="introduction" label="菜品描述" >
            <div style="text-align: right">
              <Input v-model="foodMap.introduction" type="textarea" :autosize="{minRows: 2,maxRows: 5}"
                     placeholder="选填,100字以内" :maxlength=100  style="width: 70%" @on-focus="focus"></Input>
            </div>
        </FormItem>
        <FormItem prop="categoryId" label="菜品分类">
          <div style="text-align: right">
            <Select v-model="foodMap.categoryId" size="small" style="width: 70%;text-align: left">
              <Option v-for="item in foodCategoryArr" :value="item.id" :key="item.id">{{ item.name }}</Option>
            </Select>
          </div>
        </FormItem>
        <FormItem prop="standardPrice" label="菜品价格">
          <div class="input-body" style="text-align: right">
            <Input type="text" v-model="foodMap.standardPrice" placeholder="请填写" style="width: 70%;" @on-focus="focus"/>
          </div>
        </FormItem>
        <FormItem prop="packFee" label="打包费">
          <div class="input-body" style="text-align: right">
            <Input type="text" v-model="foodMap.packFee" placeholder="请填写" style="width: 70%" @on-focus="focus"/>
          </div>
        </FormItem>
        <template v-if="type === 'change'">
          <div class="btn-group">
            <Button class="warn-control button" @click="deleteModal = true">删除</Button>
            <Button class="normal-control button" @click="changeModal = true">修改</Button>
          </div>
        </template>
        <template v-if="type === 'insert'">
          <div class="btn-group">
            <Button class="button" @click="restart()">重置</Button>
            <Button class="normal-control button" @click="insertModal = true">添加</Button>
          </div>
        </template>
        <Modal
          v-model="deleteModal"
          title="删除菜品"
          @on-ok="deleteFood">
          <p>是否删除菜品</p>
        </Modal>
        <Modal
          v-model="changeModal"
          title="修改菜品"
          @on-ok="changeFood">
          <p>是否修改菜品</p>
        </Modal>
        <Modal
          v-model="insertModal"
          title="添加菜品"
          @on-ok="insert">
          <p>是否添加菜品</p>
        </Modal>
      </Form>

    </div>
  </transition>
</template>

<script>
export default {
  name: 'single-food-detail',
  props: ['foodArr', 'foodIndex', 'type', 'foodCategoryArr', 'foodMap', 'commentFlag'],
  created () {
  },
  mounted () {
    let width = document.getElementsByClassName('insert-input-background')[0].clientWidth
    this.insertImgBackgroundHeight = width
    let foodMap = this.foodMap
    this.showImage = foodMap.imageUrl ? this.const.imagePath.food + foodMap.imageUrl
      : require('../../static/images/add.png')
  },
  data () {
    return {
      screenHeight: window.screen.height * 0.80,
      deleteModal: false,
      changeModal: false,
      insertModal: false,
      insertImgBackgroundHeight: 0,
      showImage: '',
      file: '',
      ruleInline: {
        imageUrl: [
          {required: true, message: '请填入照片'}
        ],
        name: [
          {type: 'string', required: true, message: '请填写名称'},
          {max: 32, message: '内容过长'}
        ],
        introduction: [
          // {type: 'string', required: true, message: '请填写名称'},
          {type: 'string', max: 100, message: '内容过长'}
        ],
        categoryId: [
          {required: true, message: '请选择菜品分类'}
        ],
        standardPrice: [
          {required: true, message: '请输入'},
          {
            message: '请正确输入',
            trigger: 'blur',
            pattern: /^\d{1,6}(\.\d{1,2}){0,1}$/
          }
        ],
        packFee: [
          {required: true, message: '请输入'},
          {
            message: '请正确输入',
            trigger: 'blur',
            pattern: /^\d{1,6}(\.\d{1,2}){0,1}$/
          }
        ]
      }
    }
  },
  methods: {

    /**
       * 删除菜品
       */
    deleteFood: function () {
      let that = this
      let index = that.foodIndex
      let foodArr = this.foodArr
      that.utils.http.delete('/api/food/' + this.foodMap.id)
        .then(response => {
          switch (response.status) {
            case 0:
              foodArr.splice(index, 1)
              this.success()
              this.$emit('controlFood')
              break
            case 2:
              that.utils.timeOutLogin(that)
              break
          }
        })
        .catch(() => that.utils.systemError(that))
    },

    /**
       * 修改菜品
       */
    changeFood: function () {
      let that = this
      that.checkIsValid()
        .then(isValid => {
          if (!isValid) {
            return
          }
          let index = that.foodIndex
          let foodArr = that.foodArr
          let foodMap = that.foodMap

          // 当菜品的菜品分类修改时 将权重设置为-1
          if (foodMap.categoryId !== foodArr[index].categoryId) {
            foodMap.weight = -1
          }
          that.utils.http.put('/api/food/' + this.foodMap.id, foodMap)
            .then(response => {
              switch (response.status) {
                case 0:
                  that.newToOld(foodMap, foodArr[index])
                  that.success()
                  that.$emit('changeCategoryId')
                  break
                case 2:
                  that.utils.timeOutLogin(that)
                  break
              }
            })
            .catch(() => that.utils.systemError(that))
        })
    },

    /**
       * 重置
       */
    restart: function () {
      let that = this
      let foodMap = that.foodMap
      let keys = Object.keys(this.foodMap)
      for (let key of keys) {
        if (key === 'standardPrice' || key === 'packFee') {
          foodMap[key] = 0
          continue
        }
        foodMap[key] = ''
      }
      this.showImage = require('../../static/images/add.png')
    },

    /**
       * 添加菜品
       */
    insert: function () {
      let that = this
      that.checkIsValid()
        .then(isValid => {
          if (!isValid) {
            return
          }
          let foodMap = that.foodMap
          if (!foodMap.introduction || foodMap.introduction === '') {
            foodMap.introduction = '无菜品描述'
          }
          foodMap['file'] = that.file
          that.utils.http.post('/api/food-categories/' + that.foodMap.categoryId + '/food', that.foodMap)
            .then(response => {
              switch (response.status) {
                case 0:
                  that.success()
                  that.restart()
                  that.$emit('insertFood')
                  break
                case 2:
                  that.utils.timeOutLogin(that)
                  break
              }
            })
            .catch(() => that.utils.systemError(that))
        })
    },

    /**
       * 添加菜品图片后回显
       */
    insertImage: function (e) {
      let that = this
      let file = e.target.files[0]

      if (!that.checkImage(file)) {
        return
      }

      let reader = new window.FileReader()
      reader.readAsDataURL(file)
      reader.onload = e => {
        that.showImage = e.target.result
      }
      that.file = file
      this.foodMap.imageUrl = file
    },

    /**
       * 选择图片
       */
    choiceImage: function (e) {
      let that = this
      let file = e.target.files[0]
      let index = that.foodIndex
      let imagePath = that.const.imagePath.food
      let foodMap = that.foodMap

      if (!that.checkImage(file)) {
        return
      }
      that.utils.http.post('/api/food/' + that.foodMap.id + '/image', {file: file})
        .then(response => {
          switch (response.status) {
            case 0:
              that.showImage = imagePath + response.info
              that.foodArr[index].imageUrl = response.info
              foodMap['imageUrl'] = response.info
              that.success()
              break
            case 2:
              that.utils.timeOutLogin(that)
              break
          }
        })
        .catch(() => that.utils.systemError(that))
    },

    /**
     * 检查图片
     */
    checkImage (file) {
      if (!(file.type === 'image/png' || file.type === 'image/jpeg')) {
        this.$Message.error('上传图片格式不正确')
        return false
      }

      if (file.size > this.const.upload.image.maxSize) {
        this.$Message.error('上传图片大小超过限制')
        return false
      }
      return true
    },

    /**
       * 操作成功通知
       */
    success: function () {
      this.$Notice.success({
        title: '操作成功',
        duration: 1
      })
    },

    /**
       * 错误操作提醒
       */
    warn: function (title) {
      this.$Notice.error({
        title: title,
        duration: 1
      })
    },

    /**
       * foodMap 传入 foodArr的指定对象内
       *
       */
    newToOld: function (newObj, oldObj) {
      let keys = Object.keys(newObj)
      for (let key of keys) {
        oldObj[key] = newObj[key]
      }
    },

    checkIsValid: function () {
      return this.$refs.form.validate()
    },

    /**
     * 手机聚焦后事件
     */
    focus: function () {
      document.body.scrollTop = document.body.clientHeight
    }

  }

}
</script>

<style scoped>

  .fade-enter-active，.fade-leave-active {
    -webkit-animation: 0.5s;
    -o-animation: 0.5s;
    animation: 0.5s;
  }

  @-webkit-keyframes fade-in {/*针对webkit内核*/
    0% {
      opacity: 0;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes fade{
    0% {
      opacity: 0;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }

  /**
       单个菜品框
     */

  .single-food-body {
    z-index: 9;
    color: #8a8a8a;
    -webkit-transition: all linear 0.5s;
    -moz-transition: all linear 0.5s;
    -o-transition: all linear 0.5s;
    transition: all linear 0.5s;
    position: absolute;
    left: 10%;
    top: 5%;
    padding: 10px;
    width: 80%;
    background: #fff;
    overflow: auto;
  }

  .image {
    width: 100%;
    height: 100%;
  }

  .insert-input-background {
    position: relative;
    width: 40%;
    -webkit-background-size: cover;
    -moz-background-size: cover;
    -o-background-size: cover;
    background-size: cover;
  }

  .insert-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    opacity: 0;
  }

  .insert-input:after {
    content: '';
    margin-top: 100%;
  }

  .prompt-text {
    margin-right: 20px;
    display: flex;
    align-items: center;
    width: 25%;
  }

  .input-body {
    width: 100%;
  }

  .btn-group {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    height: 10%;
  }

  .btn-group > .button {
    width: 30%;
    height: 80%;
    background: #fff;
  }

  .warn-control {
    color: #f00;
    border: 1px solid #f00;
  }

  .normal-control {
    color: #09A9A5;
    border: 1px solid #09A9A5;
  }
</style>
