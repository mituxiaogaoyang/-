/**
 * @authors remy
 * @creatTime 2019-03-20 17:29:49
 * @description 
 * @version 0.0.1
 */

import { getClientSize } from '@/lib/util/dom';

// 时间范围选择器的限制时间，只能选择限制时间及之后的时间
export const limitDateStr = '2019-03-01';

// 用于rem技术，以20px为基准，最小值为16px
export function adaptFontSize() {
    var elem = document.getElementsByTagName('html')[0],
        { width, height } = getClientSize();
    elem.style.fontSize = Math.max(Math.min(width / 1920, height / 1080) * 20, 16) + 'px';
}