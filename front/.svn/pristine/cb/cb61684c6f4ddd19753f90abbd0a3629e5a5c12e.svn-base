/**
 * @authors remy
 * @creatTime 2019-03-12 10:14:34
 * @description 隐患点相关接口
 * @version 0.0.1
 */

import { apiRequest } from './common';

export function getData(query){
  return apiRequest({
    url: '/jcca02a/findByPage',
    options: {
      method: 'post',
      data: JSON.stringify(query)
    }
  });
}

export function getAllData(query){
  return apiRequest({
    url: '/jcca02a/findAll',
    options: {
      method: 'get'
    }
  });
}

export function deleteData(ids){
	return apiRequest({
		 url: '/jcca02a/delete?id='+ids,
		 options: {
		   method: 'get'
		 }
	});
}
export function saveData(type,data){ 
	return apiRequest({
		url: `/jcca02a/${type}`,
		options: {
		  method: 'post',
		  data: JSON.stringify(data)
		}
	})
}
export function getAreaList(id){  //获取省市区
	return apiRequest({
		url: '/area/findByParentIdOrderById?id='+id,
		options: {
		  method: 'get'
		}
	})
}
