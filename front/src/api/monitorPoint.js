/**
 * @authors remy
 * @creatTime 2019-03-12 11:30:15
 * @description 监测点相关接口
 * @version 0.0.1
 */

import { apiRequest } from './common';

export function getData(query){
  return apiRequest({
    url: '/jcca03a/findByPage',
    options: {
      method: 'post',
      data: JSON.stringify(query)
    }
  });
}

export function getAllData(yhdNo){
  return apiRequest({
    url: '/jcca03a/findAll?jcca03A020=' + (yhdNo || ''),
    options: {
      method: 'get'
    }
  });
}

export function deleteData(ids){
	return apiRequest({
		 url: '/jcca03a/delete?id='+ids,
		 options: {
		   method: 'get'
		 }
	});
}
export function saveData(type,data){ 
	return apiRequest({
		url: `/jcca03a/${type}`,
		options: {
		  method: 'post',
		  data: JSON.stringify(data)
		}
	})
}