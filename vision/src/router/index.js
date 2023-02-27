import Vue from 'vue'
import VueRouter from 'vue-router'

import ScreenPage from '../views/ScreenPage'

Vue.use(VueRouter)

const routes = [
    {
      path:'/',
      redirect: '/screen'
    },
    {
      path:'/screen',
      component: ScreenPage
    }
]

// 创建路由
const router = new VueRouter({
  mode: 'history', // history模式
  base: process.env.BASE_URL,
  routes
})

export default router
