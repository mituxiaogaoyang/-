/**
 * @authors remy
 * @creatTime 2019-03-27 15:38:39
 * @description 监测数据相关接口
 * @version 0.0.1
 */

import { apiRequest } from './common';

// gnss数据
export function getGnssData(query){
  return apiRequest({
    url: '/gnssData/findByPage',
    options: {
      method: 'post',
      data: JSON.stringify(query)
    }
  });
}

export function getAllGnssData(query){
  return apiRequest({
    url: '/gnssData/findAll',
    options: {
      method: 'post',
      data: JSON.stringify(query)
    }
  });
}

// 拉线位移数据
export function getLxwyData(query){
  return apiRequest({
    url: '/lxwyData/findByPage',
    options: {
      method: 'post',
      data: JSON.stringify(query)
    }
  });
}

export function getAllLxwyData(query){
  return apiRequest({
    url: '/lxwyData/findAll',
    options: {
      method: 'post',
      data: JSON.stringify(query)
    }
  });
}

// 雨量数据
export function getYlData(query){
  return apiRequest({
    url: '/ylData/findByPage',
    options: {
      method: 'post',
      data: JSON.stringify(query)
    }
  });
}

export function getAllYlData(query){
  return apiRequest({
    url: '/ylData/findAll',
    options: {
      method: 'post',
      data: JSON.stringify(query)
    }
  });
}