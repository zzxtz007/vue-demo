// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import 'normalize.css'
import iView from 'iview'
import PullTo from 'vue-pull-to'
import 'iview/dist/styles/iview.css'
import constants from './constants'
import utils from './utils'

import bridge from './nativeJSBridge'
import global from './global'

// 阻止 Vue 在启动时生成生产提示
Vue.config.productionTip = false

Vue.use(iView)

Vue.use(PullTo)

// 全局常量
Vue.prototype.const = constants
// 工具方法
Vue.prototype.utils = utils
// 全局方法
Vue.prototype.global = global

/* eslint-disable no-new */
window.vm = new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
  bridge
})
