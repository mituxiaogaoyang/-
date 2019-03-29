/**
 * @authors remy
 * @creatTime 2019-03-12 16:40:57
 * @description 系统用户相关接口
 * @version 0.0.1
 */

import { encode as base64encode } from '@/lib/util/base64';
import { apiRequest, formatParams } from './common';

export function login(data){
  data.password = base64encode(data.password);
  return apiRequest({
    url: '/auth/login',
    options: {
      method: 'post',
      data: JSON.stringify(data)
    },
    isRefreshToken: false
  });
}

export function getData(query){
  return apiRequest({
    url: '/user/findByPage',
    options: {
      method: 'post',
      data: JSON.stringify(query)
    }
  });
}

export function save(data){
  return apiRequest({
    url: '/user/' + (!data.id ? 'save' : 'update'),
    options: {
      method: 'post',
      data: JSON.stringify(data)
    }
  });
}

export function getInfo(id){
  return apiRequest({
    url: '/user/findByUserId?userId=' + id,
    options: {
      method: 'get'
    }
  });
}

export function enabled(data){
  return apiRequest({
    url: '/user/updateEnableState' + formatParams(data),
    options: {
      method: 'get'
    }
  });
}

export function changePwd(data){
  data.password = base64encode(data.password);
  data.newPassword = base64encode(data.newPassword);
  delete data.againPwd;
  return apiRequest({
    url: '/user/updatePwd',
    options: {
      method: 'post',
      data: JSON.stringify(data)
    }
  });
}

export function resetPwd(){
  //
}

export function del(id){
  return apiRequest({
    url: '/user/delete?userId=' + id,
    options: {
      method: 'get'
    }
  });
}