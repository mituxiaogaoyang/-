/**
 * @authors remy
 * @creatTime 2019-03-12 16:39:57
 * @description 系统角色相关接口
 * @version 0.0.1
 */

import { apiRequest, formatParams } from './common';

export function getData(){
  return apiRequest({
    url: '/role/findAll',
    options: {
      method: 'get'
    }
  });
}

export function save(data){
  return apiRequest({
    url: '/role/' + (!data.id ? 'save' : 'update'),
    options: {
      method: 'post',
      data: JSON.stringify(data)
    }
  });
}

export function getInfo(roleId){
  return apiRequest({
    url: '/role/findById?roleId=' + roleId,
    options: {
      method: 'get'
    }
  });
}

export function del(roleId){
  return apiRequest({
    url: '/role/delete?roleId=' + roleId,
    options: {
      method: 'get'
    }
  });
}