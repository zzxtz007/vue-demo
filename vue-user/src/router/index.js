import Vue from 'vue'
import Router from 'vue-router'
import index from '../pages/Index'
import NotFound from '../pages/NotFound'
import login from '../pages/Login'
import untreated from '../pages/Untreated'
import management from '../pages/Management'
import refund from '../pages/refund'
import processedOrder from '../pages/ProcessedOrder'
import orderDetails from '../pages/orderDetails'
import statistics from '../pages/StatisticsDetails'
import stallUpdate from '../pages/StallUpdate'
import foodCategoryManagement from '../pages/foodCategoryManagement'
import foodManagement from '../pages/foodManagement'
import preview from '../pages/Preview'
import StallPreview from '../pages/StallPreview'
import Register from '../pages/register'
import bayCar from '../pages/PayCar'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '*',
      name: 'NotFound',
      component: NotFound
    },
    {
      path: '/',
      redirect: {name: 'Login'}
    },
    {
      path: '/login',
      name: 'Login',
      component: login
    },
    {
      path: '/register',
      name: 'Register',
      component: Register
    },
    {
      path: '/pages',
      component: index,
      children: [
        {
          path: 'untreated',
          name: 'untreated',
          component: untreated,
          meta: {
            keepAlive: true // 需要被缓存
          }
        },
        {
          path: 'management',
          name: 'management',
          component: management,
          meta: {
            keepAlive: true // 需要被缓存
          }
        },
        {
          path: 'refund',
          name: 'refund',
          component: refund,
          meta: {
            keepAlive: true // 需要被缓存
          }
        },
        {
          path: 'processedOrder',
          name: 'processedOrder',
          component: processedOrder,
          meta: {
            keepAlive: true // 需要被缓存
          }
        },
        {
          path: 'orderDetails/:id',
          name: 'orderDetails',
          component: orderDetails
        },
        {
          path: 'statistics',
          name: 'statistics',
          component: statistics
        },
        {
          path: 'stallUpdate',
          name: 'stallUpdate',
          component: stallUpdate
        },
        {
          path: 'foodCategoryManagement',
          name: 'foodCategoryManagement',
          component: foodCategoryManagement
        },
        {
          path: 'StallPreview',
          name: 'StallPreview',
          component: StallPreview
        },
        {
          path: 'Preview',
          name: 'Preview',
          component: preview
        },
        {
          path: 'foodManagement',
          name: 'foodManagement',
          component: foodManagement
        },
        {
          path: 'bayCar',
          name: 'bayCar',
          component: bayCar
        }
      ]
    }]
})
