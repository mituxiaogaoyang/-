/**
 * @filename dom.js
 * @authors remy
 * @creatTime 2018-04-03 13:47:35
 * @description dom相关工具类
 * @version 0.0.1
 */


/**
 * @description 获取浏览器滚动条的宽度
 * @author remy
 * @createTime 2016年5月6日 下午3:23:00
 */
export function getScrollWidth() {
    var noScroll, scroll, oDiv = document.createElement("DIV");
    oDiv.style.cssText = "position:absolute; top:-1000px; width:100px; height:100px; overflow:hidden;";
    noScroll = document.body.appendChild(oDiv).clientWidth;
    oDiv.style.overflowY = "scroll";
    scroll = oDiv.clientWidth;
    document.body.removeChild(oDiv);
    return noScroll - scroll;
}
    /* 获取设备浏览器显示区域宽度 */
export function getClientWidth() {
    return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
}
/* 获取设备浏览器显示区域高度 */
export function getClientHeight() {
    return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
}
export function getClientSize() {
    return { width: getClientWidth(), height: getClientHeight() };
}
export function getDomWidth(dom) {
    return dom.clientWidth || dom.offsetWidth;
}
export function getDomHeight(dom) {
    return dom.clientHeight || dom.offsetHeight;
}
export function getDomSize(dom) {
    return { width: getDomWidth(dom), height: getDomHeight(dom) };
}
export function getDomChilds(parenNode, className) {
    var result = [],
        childs = parenNode.children || parenNode.childNodes || [];
    for (var i = 0, len = childs.length; i < len; i++) {
        var child = childs[i];
        if (child.nodeType === 1 &&
            (!className || (className && child.indexOf(className) > -1))) {
            result.push(child);
        }
    }
    return result;
}
export function setStyle(target, style) {
    for (var key in style) {
        target.style[key] = style[key];
    }
}