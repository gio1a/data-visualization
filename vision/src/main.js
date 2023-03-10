import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

// 引入全局css
import './assets/css/global.less'
import './assets/font/iconfont.css'
import SocketService from './utils/socket_service'

Vue.config.productionTip = false

SocketService.Instance.connect() //连接server
Vue.prototype.$socket = SocketService.Instance

// 请求基准路径的配置
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/'
Vue.prototype.$http = axios

// 将全局echarts对象挂载到Vue原型对象上
Vue.prototype.$echarts = window.echarts

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
