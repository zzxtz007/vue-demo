<template>
  <div style="width: 100%;height: 100%;" class="body">
    <keep-alive v-if="$route.meta.keepAlive">
      <router-view/>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"/>
    <keep-alive>
      <tab-bar/>
    </keep-alive>
  </div>
</template>

<script>
import TabBar from '../components/TabBar'

export default {
  name: 'Index',
  components: {TabBar},
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
              that.$router.push({
                name: 'management'
              })
              break
            case 2:
              this.$router.push({name: 'Login'})
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
  .body {
    display: -webkit-flex;
    display: -moz-flex;
    display: -ms-flex;
    display: flex;
    -webkit-flex-direction: column;
    flex-direction: column;
    -webkit-justify-content: space-between;
    justify-content: space-between;
  }
</style>
