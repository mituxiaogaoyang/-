/**
 * @authors remy
 * @creatTime 2019-03-18 15:17:31
 * @description 
 * @version 0.0.1
 */

import Vue from 'vue'
import Login from '@/views/login'

import iView from 'iview'
import 'iview/dist/styles/iview.css'

Vue.use(iView)

Vue.config.productionTip = false
Vue.config.silent = true

/* eslint-disable no-new */
new Vue({
  render: h => h(Login)
}).$mount('#app')