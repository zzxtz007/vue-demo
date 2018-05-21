<template>
  <div style="width: 100%;height: 100%;background: white">
    <div class="container">
      <img class="bg" src="../../static/images/login-bg.png" alt="">
      <form action="" @submit.prevent="login">
        <div class="form-container">
          <div class="info">
            <span class="content">账户：</span>
            <input type="text" placeholder="输入账户" class="input" id="account">
          </div>
          <div class="info">
            <span class="content">密码：</span>
            <input type="password" placeholder="输入密码" class="input" id="password">
            <div  v-on:click.capture="seePsd">
              <Icon type="eye" class="eye" v-if="!seen"></Icon>
            </div>
            <div  v-on:click.capture="seePsd">
              <Icon type="eye-disabled" class="eye" v-if="seen"></Icon>
            </div>
          </div>
          <div style="height: 45px; "></div>
          <input type="submit" class="btn" value="登录">
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import bus from '../assets/eventBus'

export default {
  name: 'login',
  data: function () {
    return {
      seen: true,
      id: ''
    }
  },
  mounted () {
    this.checkSession()
    let that = this
    // 自动登录
    bus.$on('autoLogin', (username, password) => that.login(username, password))
  },
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
              that.$router.push({
                name: 'management'
              })
              break
          }
        })
        .catch(() => {
          this.utils.systemError(this)
        })
    },

    accountInfo: function () {
      this.$Message.info('账户不可为空')
    },
    psdInfo: function () {
      this.$Message.info('密码不可为空')
    },
    errInfo: function () {
      this.$Message.info('账户密码错误')
    },
    mistakeInfo: function () {
      this.$Message.info('系统错误')
    },
    login: function (username, password) {
      const that = this
      if (!(username && password)) {
        username = document.querySelector('#account').value
        password = document.getElementById('password').value
      }

      if (username.length === 0) {
        this.accountInfo()
        return false
      } else if (password.length === 0) {
        this.psdInfo()
        return false
      }
      this.utils.http.post('/api/session', {role: 'stall', username: username, password: password})
        .then(response => {
          const ret = parseInt(response.status)
          switch (ret) {
            case 0:
              // 登录成功后调用安卓端存储用户名密码方法
              // window.AndroidJS.saveSessionInfo(username, password)
              that.$router.push({
                name: 'management'
              })
              break
            case 2:
              this.utils.timeOutLogin(this)
              break
            case 4:
              this.errInfo()
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
    // 设置密码是否可见
    seePsd: function () {
      this.seen = !this.seen
      const password = document.getElementById('password')
      if (this.seen === true) {
        password.type = 'password'
      } else if (this.seen === false) {
        password.type = 'text'
      }
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
