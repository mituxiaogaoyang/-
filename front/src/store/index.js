/**
 * @authors remy
 * @creatTime 2019-03-13 14:28:59
 * @description 
 * @version 0.0.1
 */

import Vue from 'vue'
import Vuex from 'vuex'

import modalStore from './modal'

import * as menuApi from '@/api/menu'
import * as msgApi from '@/api/msg'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    menuData: [],
    hasUnreadMsg: false
  },
  getters: {},
  mutations: {
    initMenu(state, data){
      state.menuData = data;
    },
    unreadToggle(state, has){
      state.hasUnreadMsg = has;
    }
  },
  actions: {
    getMenu({commit}){
      menuApi.getData().then(result => {
        commit('initMenu', result);
      });
    },
    unreadToggleAsync({commit}){
      msgApi.getUnreadNum().then(result => {
        commit('unreadToggle', !!result);
      });
    }
  },
  modules: {
    modal: modalStore
  }
})