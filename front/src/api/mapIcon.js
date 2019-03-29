/**
 * @authors remy
 * @creatTime 2019-03-12 11:30:15
 * @description 监测点相关接口
 * @version 0.0.1
 */

import { apiRequest } from './common';

export function getData(query){
  return apiRequest({
    url: '/mapflag/findByPage',
    options: {
      method: 'post',
      data: JSON.stringify(query)
    }
  });
}

export function getAllData(){
  return apiRequest({
    url: '/mapflag/findAll',
    options: {
      method: 'get'
    }
  });
}

export function save(data){
  return apiRequest({
    url: '/mapflag/' + (data.id ? 'update' : 'save'),
    options: {
      method: 'post',
      data: JSON.stringify(data)
    }
  });
}

export function findById(id){
  return apiRequest({
    url: '/mapflag/findById?id=' + id,
    options: {
      method: 'get'
    }
  });
}

export function del(id){
  return apiRequest({
    url: '/mapflag/delete?id=' + id,
    options: {
      method: 'get'
    }
  });
}