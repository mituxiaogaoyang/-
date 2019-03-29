/**
 * @authors remy
 * @creatTime 2019-03-12 16:41:08
 * @description 操作日志相关接口
 * @version 0.0.1
 */

import { apiRequest } from './common';

export function getData(query){
  return apiRequest({
    url: '/rescuePerson/findByPage',
    options: {
      method: 'post',
      data: JSON.stringify(query)
    }
  });
}
export function addPerson(type,obj){ //添加/修改
  return apiRequest({
    url: `/rescuePerson/${type}`,
    options: {
      method: 'post',
			data: JSON.stringify(obj)
    }
  });
}
export function del(id){
  return apiRequest({
    url: '/rescuePerson/delete?id=' + id,
    options: {
      method: 'get'
    }
  });
}