<template>
  <div style="width: 100%;height: 100%;background: white">
    <div class="container">
      <img class="bg" src="../../static/images/login-bg.png" alt="">
      <form action="" @submit.prevent="register">
        <div class="form-container">
          <div class="info">
            <span class="content">账户：</span>
            <input type="text" v-model.trim="username" placeholder="输入账户" class="input" id="account">
          </div>
          <div class="info">
            <span class="content">密码：</span>
            <input  type="password" v-model.trim="pwd" placeholder="输入密码" class="input" id="password">
            <div  v-on:click.capture="seePsd">
              <Icon type="eye" class="eye" v-if="!seen"></Icon>
            </div>
            <div  v-on:click.capture="seePsd">
              <Icon type="eye-disabled" class="eye" v-if="seen"></Icon>
            </div>
          </div>
          <div class="info">
            <span class="content">再次输入密码：</span>
            <input type="password" v-model.trim="pwdAgain" placeholder="再次输入密码" class="input" id="passwordAgain"
              @blur="checkPsd">
            <div  v-on:click.capture="seePsd">
              <Icon type="eye" class="eye" v-if="!seen"></Icon>
            </div>
            <div  v-on:click.capture="seePsd">
              <Icon type="eye-disabled" class="eye" v-if="seen"></Icon>
            </div>
          </div>
          <div class="info">
            <span class="content">姓名：</span>
            <input type="text" v-model.trim="name" placeholder="输入姓名" class="input">
          </div>
          <div class="info">
            <span class="content">手机号：</span>
            <input type="text" v-model.trim.number="phone" placeholder="输入手机号" class="input" @blur="checkPhone">
          </div>
          <div class="info">
            <span class="content">生日：</span>
            <DatePicker type="date" v-model="inputTime" placeholder="Select date" style="width: 218px"></DatePicker>
          </div>
          <div style="height: 45px; "></div>
          <div style="display: flex;justify-content:center;">
            <input type="submit" class="btn" style="width: 120px;" value="注册">
            <button class="btn" style="width: 120px;background-color: #fdbcaa" @click="back" >返回</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'register',
  data: function () {
    return {
      seen: true,
      id: ''
    }
  },
  methods: {
    // 设置密码是否可见
    seePsd: function () {
      this.seen = !this.seen
      const password = document.getElementById('password')
      const passwordAgain = document.getElementById('passwordAgain')
      if (this.seen === true) {
        password.type = 'password'
        passwordAgain.type = 'password'
      } else if (this.seen === false) {
        password.type = 'text'
        passwordAgain.type = 'text'
      }
    },
    checkPsd: function () {
      if (this.pwd !== this.pwdAgain) {
        this.utils.appInfo(this, '两次输入密码不一致！')
        return false
      }
      return true
    },
    checkDate: function () {
      return this.inputTime !== ''
    },
    /*
    检测手机号
    */
    checkPhone: function () {
      const phone = this.phone
      if (!/^1(3|4|5|7|8)\d{9}$/.test(phone)) {
        this.utils.appInfo(this, '手机号格式不正确！')
        return false
      }
      return true
    },
    register: function () {
      const that = this
      // 判断输入是否合法
      // 判断用户名
      if (this.username === '') {
        this.utils.appInfo(this, '用户名不能为空！')
        return
      }
      // 判断密码
      if (!this.checkPsd()) {
        return
      }
      // 判断手机号
      if (!this.checkPhone(this.phone)) {
        return
      }
      // 判断姓名
      if (this.name === '') {
        this.utils.appInfo(this, '名字不能为空！')
        return
      }
      // 判断日期
      if (!this.checkDate) {
        this.utils.appInfo(this, '日期不能为空！')
        return
      }
      this.utils.http.post('/api/consumers/membership', {studentId: this.username, name: this.name, phone: this.phone})
        .then(response => {
          const ret = parseInt(response.status)
          switch (ret) {
            case 0: {
              this.utils.appInfo(this, '注册成功！返回登录页面')
              that.$router.push({
                name: 'Login'
              })
              break
            }
            default: {
              that.utils.systemError(this)
            }
          }
        })
    },
    back: function () {
      this.$router.push({
        name: 'Login'
      })
    }
  }
}
</script>

<style scoped>
  .container{
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }
  .bg{
    width: 100%;
    height: 230px;
  }
  .form-container{
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
  .info{
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    border-bottom: 1px solid #81d8cf;
    height: 42px;
    margin-bottom: 1px;
  }
  .content{
    height: 36px;
    width: 103px;
    font-size: 13px;
    line-height: 36px;
    text-align: center;
    color: gray;
  }
  .input{
    width: 200px;
    height: 40px;
    border: none;
    font-size: 17px;
    outline: none;
    background: white;
  }
  .btn{
    margin:0 auto;
    background: #81d8cf;
    color: white;
    width: 247px;
    height: 33px;
    border: none;
    outline: none;
    border-radius: 3px;
  }
  .eye{
    font-size: 20px;
    line-height: 41px;
  }
</style>
