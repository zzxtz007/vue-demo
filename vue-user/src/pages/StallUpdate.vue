<template>
    <div class="container">
      <div  class="file">
        <!--<template v-if="showFlag">-->
          <!--<img src="../../static/images/upload.jpg" alt="" style="width: 100px;height: 100px;z-index: 1;">-->
        <!--</template>-->
        <!--<template v-else>-->
          <!--<img :src="imagePath + imgUrl" alt="" style="width: 100px;height: 100px;z-index: 1;">-->
        <!--</template>-->
        <!--<input type="file" v-on:change="onFileChange($event)"  id="chosePic" style="width: 100px;height: 100px" accept="image/*">-->
      </div>
      <div class="static-msg">
        用户名称：
      </div>
      <i-input :value.sync="value" v-model="username" style="width: 80%;" id="username"></i-input>
      <div class="static-msg">
        手机号码：
      </div>
      <i-input :value.sync="value" v-model="phone" style="width: 80%;" id="phone" v-on:change="checkPhone" :maxlength="11"></i-input>
      <div class="static-msg">
        姓名：
      </div>
      <i-input :value.sync="value" v-model="name" style="width: 80%;" id="name"></i-input>
      <div class="static-msg">
        旧密码：
      </div>
      <i-input :value.sync="value" v-model="oldPwd" style="width: 80%;" id="oldPwd"></i-input>
      <div class="static-msg">
        新密码：
      </div>
      <i-input :value.sync="value" v-model="newPwd" style="width: 80%;" id="newPwd"></i-input>
      <div class="btn-container">
        <i-button type="error" style="width: 40%;margin-top: 20px;margin-left: 7.5%" @click="reset">重置</i-button>
        <i-button type="info" style="width: 40%;margin-top: 20px;margin-left: 5%" @click="save">保存</i-button>
      </div>
    </div>
</template>

<script>
export default {
  name: 'stall-update',
  data: function () {
    return {
      value: '',
      id: '',
      imgUrl: '1',
      name: '',
      phone: '',
      introduction: '',
      tempImgUrl: '',
      tempName: '',
      tempPhone: '',
      tempIntroduction: '',
      route: '',
      imagePath: this.const.imagePath.stall,
      showFlag: true,
      showImage: ''
    }
  },
  created: function () {
    this.checkSession()
  },
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

    /*
    点击更换图片
    */
    onFileChange: function (e) {
      const that = this
      const stallId = this.stallId
      const myFile = e.target.files[0]
      that.file = myFile
      const isJPG = myFile.type === 'image/jpeg'
      const isPNG = myFile.type === 'image/png'
      const isLt2M = myFile.size / 1024 / 1024 < 5

      if (!isJPG && !isPNG) {
        this.errImg()
        return
      }
      if (!isLt2M) {
        this.errImgSize()
        return
      }
      this.utils.http.put('/api/stalls/' + stallId + '/image', {file: myFile})
        .then(response => {
          const ret = parseInt(response.status)
          switch (ret) {
            case 0:
              this.getStallInfo()
              this.saveSuccess()
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
    errName: function () {
      this.$Message.info('错误的名称')
    },
    errImg: function () {
      this.$Message.info('上传头像图片只能是 JPG或者PNG 格式')
    },
    errImgSize: function () {
      this.$Message.info('上传头像图片大小不能超过 2MB')
    },
    errPhone: function () {
      this.$Message.info('错误的手机号码')
    },
    saveSuccess: function () {
      this.$Message.info('保存成功')
    },
    saveErr: function () {
      this.$Message.info('保存失败')
    },
    /*
    检测手机号
    */
    checkPhone: function () {
      const phone = document.getElementById('phone').textContent
      this.getStallInfo()
      if (phone.length !== 11) {
        this.errPhone()
      }
    },
    /*
    重置信息
    */
    reset: function () {
      const that = this
      that.name = that.tempName
      that.phone = that.tempPhone
      that.introduction = that.tempIntroduction
    },
    /*
    保存信息
    */
    save: function () {
      const that = this
      const stallId = this.stallId
      if (that.name.length === 0) {
        this.errName()
        return false
      }
      const myreg = /^[1][3,4,5,7,8][0-9]{9}$/
      if (!myreg.test(that.phone)) {
        this.errPhone()
        return false
      }
      this.utils.http.put('/api/stalls/' + stallId, {id: that.id, name: that.name, phone: that.phone, introduction: that.introduction, route: that.route})
        .then(response => {
          const ret = parseInt(response.status)
          switch (ret) {
            case 0:
              this.getStallInfo()
              this.saveSuccess()
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
    /*
    获取用户信息
    */
    getStallInfo: function () {
      const that = this
      this.utils.http.get('/api/consumers')
        .then(response => {
          const ret = parseInt(response.status)
          switch (ret) {
            case 0:
              if (response.info.imageUrl !== '') {
                this.showFlag = false
              }
              that.id = response.info.id
              that.uid = response.info.id
              that.imgUrl = response.info.imageUrl
              that.name = response.info.name
              that.phone = response.info.phone
              that.introduction = response.info.introduction
              that.tempImgUrl = response.info.imageURL
              that.tempName = response.info.name
              that.tempPhone = response.info.phone
              that.tempIntroduction = response.info.introduction
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
    }
  }
}
</script>

<style scoped>
.container{
  width: 100%;
  height: calc(100% - 72px);
  overflow: auto;
  display: -webkit-flex;
  display: -moz-flex;
  display: -ms-flex;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
.btn-container{
  display: -webkit-flex;
  display: -moz-flex;
  display: -ms-flex;
  display: flex;
  flex-direction: row;
  width: 80%;
  align-items: center;
}
  .static-msg{
    font-size: 13px;
    font-weight: bold;
    color: #333333;
    margin: 10px 0 10px 0;
    width: 80%;
  }
.file {
  z-index: 2;
  margin-top: 10%;
  position: relative;
  display: inline-block;
  overflow: hidden;
  text-decoration: none;
  text-indent: 0;
  line-height: 20px;
  width: 100px;
  height: 100px;
}
.file input {
  position: absolute;
  font-size: 100px;
  right: 0;
  top: 0;
  opacity: 0;
}
.file:hover {
  text-decoration: none;
}

</style>
