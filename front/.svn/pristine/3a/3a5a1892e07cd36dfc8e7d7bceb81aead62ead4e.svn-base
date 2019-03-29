/**
 * @filename rge.js
 * @authors remy
 * @creatTime 2017-07-25 16:33:28
 * @description 正则表达式集
 * @version 0.0.1
 */

export default {
	//手机号格式错误
	mobile: /^(13[0-9]|14[5|7]|15[0-35-9]|17[06-8]|18[0-9]|19[0-9])\d{8}$/,
	//电话号码格式错误
	telephone: /^0[1-9]\d{1,2}-?\d{7,8}$/,
	//邮箱格式错误
	email: /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
	//网址格式错误
	// website: /^[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_%&\?\/.=]+$/, // 不带端口号
	website: /^[A-Za-z]+:\/\/[A-Za-z0-9-_.]+[:0-9]{0,6}[A-Za-z0-9-_%&\?\/.=]+$/, // 带端口号
	//图片地址格式错误，只能是jpg、png图片
	imgURL: /^[A-Za-z]+:\/\/[A-Za-z0-9-_.]+[:0-9]{0,6}[A-Za-z0-9-_%&\?\/.=]+\.(jpeg|jpg|png)$/,
	//图片格式后缀
	image: /(jpeg|jpg|png)$/,
	//视频地址格式错误
	vedioURL: /^[A-Za-z]+:\/\/[A-Za-z0-9-_.]+[:0-9][A-Za-z0-9-_%&\?\/.=]+\.(avi|navi|dvavi|mpeg|divx|mov|asf|wmv|rm|revb|mtv|3gp|mp4|flv)$/,
	//视频格式后缀
	vedio: /(avi|navi|dvavi|mpeg|divx|mov|asf|wmv|rm|revb|mtv|3gp|mp4|flv)$/,
	//输入内容只能包含中文
	chinese: /^[\u4E00-\u9FA5\uF900-\uFA2D]{1,}$/,
	// 全局匹配双字节字符
	doubleByte: /[^\x00-\xff]/g,
	//输入内容必须是字母、数字，且以字母开头
	loginName: /^[a-zA-Z][0-9a-zA-Z]{1,}$/,
	//密码由6-20个字母、数字、符号组成，且至少包含两种
	pwd: /^[a-z0-9A-Z\u0020-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E]{6,20}$/,
	//包含数字
	hasNumber: /.*\d+.*/,
	//包含字母
	hasLetter: /.*[a-zA-Z]+.*/,
	//包含标点符号
	hasSymbol: /.*[\u0020-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E]+.*/,
	//密码由6-20个字母、数字组成
	easyPwd: /^[0-9a-zA-Z]{6,20}$/,
	//验证码由4个字母、数字组成
	code: /^[0-9a-zA-Z]{6}$/,
	//全局匹配标签
	tag: /(\<[a-zA-Z]{1,}\>|\<\/[a-zA-Z0-9]{1,}\>)/g,
	//全局匹配含属性的标签
	tagAll: /(\<[a-zA-Z]{1,}[a-zA-z0-9\s\=\'\"\:\/\/\.\-\_\%\&\?]{0,}\>|\<\/[a-zA-Z0-9]{1,}\>)/g,
  equipNumber:/^[0-9a-zA-Z]{1,32}$/
}
