/**
 * @authors remy
 * @creatTime 2019-04-15 11:31:56
 * @description 
 * @version 0.0.1
 */

/**
 * @filename type.js
 * @authors remy
 * @creatTime 2018-04-03 13:49:17
 * @description 类型判断工具类
 * @version 0.0.1
 */

const BUILTIN_OBJECT = {
    '[object Function]': 1,
    '[object RegExp]': 1,
    '[object Date]': 1,
    '[object Error]': 1,
    '[object CanvasGradient]': 1,
    '[object CanvasPattern]': 1,
    // For node-canvas
    '[object Image]': 1,
    '[object Canvas]': 1
  },
  TYPED_ARRAY = {
    '[object Int8Array]': 1,
    '[object Uint8Array]': 1,
    '[object Uint8ClampedArray]': 1,
    '[object Int16Array]': 1,
    '[object Uint16Array]': 1,
    '[object Int32Array]': 1,
    '[object Uint32Array]': 1,
    '[object Float32Array]': 1,
    '[object Float64Array]': 1
  },
  objToString = Object.prototype.toString;

/**
 * 判读是否是Array
 * @param param
 * @return boolean
 */
export function isArray(param) {
  return objToString.call(param) == '[object Array]';
}
/**
 * 判读是否是String
 * @param param
 * @return boolean
 */
export function isString(param) {
  return objToString.call(param) == '[object String]';
}
export function isFunction(param) {
  return objToString.call(param) == '[object Function]';
}
export function isNumber(param) {
  return objToString.call(param) == '[object Number]';
}
export function isBoolean(param) {
  return objToString.call(param) == '[object Boolean]';
}
export function isDate(param) {
  return objToString.call(param) == '[object Date]';
}
/**
 * 判读是否是Object
 * @param param, isPure(是否需要判断是否是纯净的object,如dom不是纯净的object,默认ture)
 * @return boolean
 */
export function isObject(param, isPure) {
  if (undefined === param) return false; //undefined正常情况下返回'[object Undefined]',但在ie8中返回'[object Object]'
  !isBoolean(isPure) && (isPure = true);
  if (isPure) {
    return objToString.call(param) == '[object Object]';
  } else {
    return isArray(param) ? false : typeof param === 'object';
  }
}
/**
 * 判读是否是undifined/null/''/[]/{}
 * @param param
 * @return boolean
 */
export function isEmpty(param) {
  if (!param) {
    return true;
  } else if (isArray(param) && !param.length) {
    return true;
  } else if (isObject(param)) {
    for (const key in param) {
      return false;
    }
    return true;
  }
  return false;
}
export function isDom(value) {
  return typeof value === 'object' && typeof value.nodeType === 'number' && typeof value.ownerDocument === 'object';
}
export function isBuiltInObject(value) {
  return !!BUILTIN_OBJECT[objToString.call(value)];
}
export function isTypedArray(value) {
  return !!TYPED_ARRAY[objToString.call(value)];
}
