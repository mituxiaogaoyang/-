/**
 * @authors remy
 * @creatTime 2019-03-12 10:41:36
 * @description 
 * @version 0.0.1
 */

export function formatLevel(value){
  switch(value){
    case 0:
      return 'I';
    case 1:
      return 'II';
    case 2:
      return 'III';
    case 3:
      return 'IV';
  }
}

export function formatSex(value){
  switch(value){
    case 0:
      return '女';
    case 1:
      return '男';
  }
}

export function formatEnabled(value){
  switch(value){
    case false:
      return '停用';
    case true:
      return '启用';
  }
}