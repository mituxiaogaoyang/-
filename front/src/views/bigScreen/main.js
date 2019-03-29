/**
 * @authors remy
 * @creatTime 2019-03-18 15:55:53
 * @description 
 * @version 0.0.1
 */

import Vue from 'vue'
import BigScreen from '@/views/bigScreen'

import iView from 'iview'
import 'iview/dist/styles/iview.css'

import '@/common.less'

Vue.use(iView)

Vue.config.productionTip = false
Vue.config.silent = true;

new Vue({
  render: h => h(BigScreen)
}).$mount('#app')