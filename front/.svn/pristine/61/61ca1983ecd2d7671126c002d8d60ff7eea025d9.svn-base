/**
 * @authors remy
 * @creatTime 2019-03-12 14:42:01
 * @description 预警数据相关接口
 * @version 0.0.1
 */

import { apiRequest } from './common';

export function getData(query){
  return apiRequest({
    url: '/baseWarnTrigger/findByPage',
    options: {
      method: 'post',
      data: JSON.stringify(query)
    }
  });
}
export function addWarningSet(type,obj){ //添加预警设置
  return apiRequest({
    url: `/baseWarnTrigger/${type}`,
    options: {
      method: 'post',
			data: JSON.stringify(obj)
    }
  });
}
export function dealWarn(id,bool){ //启用停用设置
  return apiRequest({
    url: '/baseWarnTrigger/update',
    options: {
      method: 'post',
      data: JSON.stringify({id:id,isEnabled:bool})
    }
  });
}
export function deleteWarn(id){ //删除设置
  return apiRequest({
    url: '/baseWarnTrigger/delete?id='+id,
    options: {
      method: 'get'
    }
  });
}

export function addWarning(obj){ //添加手动预警
  return apiRequest({
    url: '/jcca20a/save',
    options: {
      method: 'post',
			data: JSON.stringify(Object.assign(obj,{jcca20A901:1}))
    }
  });
}