/**
 * @authors remy
 * @creatTime 2019-03-15 14:20:50
 * @description 
 * @version 0.0.1
 */

import { apiRequest } from './common';

export function getData(query){
  return apiRequest({
    url: '/notice/findByPage',
    options: {
      method: 'post',
      data: JSON.stringify(query)
    }
  });
}

export function getUnreadNum(){
  return apiRequest({
    code: 0,
    data: 2
  });
}