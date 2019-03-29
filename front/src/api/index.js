/**
 * @authors remy
 * @creatTime 2019-03-11 19:39:53
 * @description 
 * @version 0.0.1
 */

import Vue from 'vue';
import axios from 'axios';

// 空实例，用于api中统一处理时的消息提示
export const msgVue = new Vue();
export const isDev = process.env.NODE_ENV === 'development';

const token_type = 'bearer';

export const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': token_type + ' ' + sessionStorage.token
};

export const apiContextPath = '/apiPath/'; // http://10.30.0.99:8099/'; // 'http://10.10.254.49:8099/'; // 
const webSocketPath = 'ws://10.30.0.99:8099/'; // 'ws://10.10.254.49:8099/'; // 

export function apiRequest(result){
  return new Promise((success, reject) => {
    setTimeout(() => {
      if(result.code === 0){
        success(result.data);
        result.message && msgVue.$Message.success(result.message);
      }else{
        result.message && msgVue.$Message.error(result.message);
      }
    }, 600)
  });
}

// 异常统一处理函数
export function exceptionHandler(code, message){
  if(code === 401){
    vue.$Message.warning({
      content: '未登录或登录失效，请重新登录',
      onClose: () => {
        sessionStorage.prevUrl = location.href;
        location.href = location.protocol + '//' + location.host + '/login.html';
      }
    });
  }else{
    message && vue.$Message.error(message);
  }
}

// 将params参数拼接成field=value&field=value
export function formatParams(params){
  let str = '';
  Object.keys(params).forEach(field => {
    str += '&' + field + '=' + params[field];
  });
  return '?' + str.substr(1);
}