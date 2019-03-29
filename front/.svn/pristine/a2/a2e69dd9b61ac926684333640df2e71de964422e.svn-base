/**
 * @authors remy
 * @creatTime 2019-03-12 14:42:01
 * @description 预警数据相关接口
 * @version 0.0.1
 */

import { apiRequest } from './common';

export function getData(query){
  return apiRequest({
    url: '/jcca20a/findByPage',
    options: {
      method: 'post',
      data: JSON.stringify(query)
    }
  });
}
export function dealWarn(id,word){
  return apiRequest({
    url: '/jcca20a/update',
    options: {
      method: 'post',
      data: JSON.stringify({id:id,jcca20A902:true,jcca20A904:word})
    }
  });
}