/**
 * @filename time.js
 * @authors remy
 * @creatTime 2018-04-03 13:36:39
 * @description 时间工具类
 * @version 0.0.1
 */

/**
 * @param date { Date }
 * @param itemStr { String } yyyy/MM/dd/HH/hh/mm/ss
 * @result { Object }
 */
export function getItemValue(date, itemStr) {
  var str = '',
    mode = ''; // 12小时制时有意义am、pm
  function fillZeroToFirst(num) {
    return (num < 10 ? '0' : '') + num;
  }
  switch (itemStr) {
    case 'yyyy':
      str = date.getFullYear();
      break;
    case 'MM':
      str = fillZeroToFirst(date.getMonth() + 1);
      break;
    case 'dd':
      str = fillZeroToFirst(date.getDate());
      break;
    case 'HH':
      str = fillZeroToFirst(date.getHours());
      break;
    case 'hh':
      var hour = date.getHours();
      hour == 24 && (hour = 0);
      if (hour > 12) {
        hour -= 12;
        mode = 'pm';
      } else {
        mode = 'am';
      }
      str = fillZeroToFirst(hour);
      break;
    case 'mm':
      str = fillZeroToFirst(date.getMinutes());
      break;
    case 'ss':
      str = fillZeroToFirst(date.getSeconds());
      break;
    case 'ii':
      var ms = date.getMilliseconds();
      str = (ms < 100 ? '0' : '') + ms;
      break;
    default:
      str = '';
  }
  return { text: str, mode: mode };
}

/**
 * @param str { String } 'yyyy-MM-dd HH:mm:ss:ii' -- HH: 24小时制, hh: 12小时制, ii: 毫秒
 * @param arg { Number/String/Date } 时间戳/时间
 * @result { String }
 */
export function format(str, arg) {
  var date = null;
  if (this instanceof Date) {
    date = this;
  } else if (/^1[0-9]{12}/g.test(arg)) {
    date = new Date(Number(arg));
  }else if(arg instanceof Date){
    date = arg;
  }
  if (!date) {
    throw Error('timeUtil.parseStr参数异常');
  }
  !str && (str = 'yyyy-MM-dd');
  var resultArr = str.match(/([a-zA-Z]{1,}|[^a-zA-Z]{1,})/g),
    reg = /^[a-zA-Z]/g,
    resultStr = '',
    mode = '';
  resultArr && resultArr.forEach((item) => {
    if (reg.test(item)) {
      var obj = getItemValue(date, item);
      obj.mode && (mode = obj.mode);
      resultStr += obj.text;
    } else {
      resultStr += item;
    }
  });
  return resultStr + mode;
}

// typeof Date.prototype.format !== 'function' && (Date.prototype.format = format);