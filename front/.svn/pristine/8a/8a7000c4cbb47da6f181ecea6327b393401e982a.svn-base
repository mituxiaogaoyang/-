/**
 * @authors remy
 * @creatTime 2019-03-22 13:35:16
 * @description 滚动/轮播，让一个确定的容器滚动起来从而实现轮播
 * @TODO 按页向上滚动待完善
 * @version 0.0.1
 */

const defaultOptions = {
  direction: 'top', // 滚动的方向(向上top,向左left)，默认向上
  type: 'row', // 按行row、页page轮播，当向左滚动时，type='page'
  totalPageNum: 1, // 总页数
  pageWidth: 100, // 每页的宽度
  pageHeight: 100, // 每页的高度
  totalRowNum: 8, // 总行数
  pageRowNum: 6, // 每页的行数
  rowHeight: 30, // 每行的行高
  unit: 'px', // 行高或页宽的单位
  rate: 3, // 轮播频率，单位s
  duration: 1 // 动画时间，单位s
}

/**
 * @param elem { HTMLElement }
 * @param options { Object }
 * @description 轮播类
 */
export default function Roll(elem, options){
  if(!elem || ( elem && elem.nodeType !== 1)){
    throw new Error('构造函数Roll(elem, options)的elem必须是dom元素');
  }
  this.elem = elem;
  this.opts = Object.assign({}, defaultOptions, options || {});
  this.timer = null; // step的定时器
  this.timerA = null; // animationA的定时器
  this.timerB = null; // animationB的定时器
  this.execOpts = getExecOptions.call(this); // 轮播时执行动画的参数
}

/**
 * @param startIndex { Number } 下一个动画的起点
 * @description 启动动画
 */
Roll.prototype.start = function(startIndex){
  const execOpts = this.execOpts;

  // 监测是否能启动
  if(!execOpts.canStart) return;

  let elem_clone = this.opts.cloneElem || clone(execOpts.elem);
  this.execOpts.elem_clone = elem_clone;
  if(execOpts.direction === 'left'){
    // 横向向左滚动时
    const { pageWidth, pageHeight, unit } = execOpts;
    elem_clone.style.transform = `translate3d(${pageWidth}${unit}, ${pageHeight * -1}${unit}, 0)`;
  }

  // 滑槽A（elem）+ 滑槽B（elem_clone）
  // count标记当前处于两个动画阶段的某一个（两个动画阶段为一个循环）
  // 横向，changeX==pageWidth，其中1等于一个changeX*num，num等于totalPageNum
  // 注意横向时的起始位置0的坐标在[pageWidth, -1 * pageHeight]
  // count === 1时：滑槽A：0 => -1 => 1/num(瞬间完成-1到1/num)  滑槽B：0 => -1/num
  // count === 2时：滑槽A：1/num => 0  滑槽B：-1/num => (-1 + -1/num) => 0(瞬间完成(-1 + -1/num)到0)
  // 纵向，其中1等于一个changeY*num，num等于totalRowNum或totalRowNum/pageRowNum
  // count === 1时：滑槽A：0 => -1 => 1(瞬间完成-1到1)  滑槽B：0 => -1
  // count === 2时：滑槽A：1 => 0  滑槽B：1 => -2 => 0(瞬间完成-2到0)
  execOpts.count = 1;
  execOpts.i = startIndex || 1; // 下一个动画处于1~num的某个位置

  step.call(this);
}

/**
 * @param { Object }
 * @description 更新：暂停动画=>更新动画参数=>恢复动画，仅用于更新数据后num发生变化的情况
 */
Roll.prototype.update = function({ totalRowNum }){
  const { elem, elem_clone, direction, type, i } = this.execOpts,
    { pageRowNum } = this.opts;
  if(typeof totalRowNum === 'number'){
    this.stop(0, -1 * (i - 1)); // 将elem固定在当前的动画处于的位置
    // 更新
    this.execOpts.totalRowNum = totalRowNum;
    let num = 1;
    // 向上滚动
    if(type === 'page'){
      // 按页滚动
      num = Math.ceil(totalRowNum / pageRowNum);
      num > 1 && (this.execOpts.canStart = true);
    }else{
      // 按行滚动
      num = totalRowNum;
      num > pageRowNum && (this.execOpts.canStart = true);
    }
    this.execOpts.num = num;
    this.start(i);
  }
}

/**
 * @param i { Number } 横向上当前的索引
 * @param j { Number } 纵向上当前的索引
 * @description 结束轮播，移除cloneElem，固定elem至当前位置
 */
Roll.prototype.stop = function(i = 0, j =0){
  const { elem, elem_clone, changeX, changeY, unit } = this.execOpts;
  clearTimeout(this.timer);
  clearTimeout(this.timerA);
  clearTimeout(this.timerB);
  elem.parentNode.removeChild(elem_clone);
  exceAnimation.call(this, elem, changeX * i, changeY * j, 0, unit);
}

/**
 * @description 结束轮播，然后重新启动
 */
Roll.prototype.restart = function(){
  this.stop();
  this.start();
}

// 每次动画
function step(){
  const { elem, elem_clone, direction, num, rate, count, i } = this.execOpts;
  this.timer = setTimeout(() => {
    if(direction === 'left'){
      animationA_X.call(this, elem);
      animationB_X.call(this, elem_clone);
    }else{
      animationA_Y.call(this, elem);
      animationB_Y.call(this, elem_clone);
    }
    if(i === num){
      this.execOpts.i = 1;
      if(count === 2){
        this.execOpts.count = 1;
      }else{
        this.execOpts.count++
      }
    }else{
      this.execOpts.i++;
    }
    step.call(this);
  }, rate * 1000);
}

// 计算并返回执行动画时的参数
function getExecOptions(){
  const { 
    direction,
    type,
    totalPageNum,
    pageWidth,
    pageHeight,
    totalRowNum,
    pageRowNum,
    rowHeight,
    unit,
    rate,
    duration
  } = this.opts;
  let canStart = false, // 是否达到启动的要求
    num = 1, // 一个周期滚动的次数
    changeX = 0, // 横向每步的移动量
    changeY = 0; // 纵向每步的移动量
  if(direction === 'left'){
    // 向左滚动
    num = totalPageNum;
    changeX = pageWidth;
    num > 1 && (canStart = true);
  }else{
    // 向上滚动
    if(type === 'page'){
      // 按页滚动
      num = Math.ceil(totalRowNum / pageRowNum);
      changeY = pageRowNum * rowHeight;
      num > 1 && (canStart = true);
    }else{
      // 按行滚动
      num = totalRowNum;
      changeY = rowHeight;
      num > pageRowNum && (canStart = true);
    }
  }
  return {
    elem: this.elem,
    canStart,
    pageWidth,
    pageHeight,
    direction,
    num: Number(num),
    changeX,
    changeY,
    unit,
    rate,
    duration
  };
}

// 深度克隆节点
function clone(sourceElem){
  const clone = sourceElem.cloneNode(true);
  sourceElem.parentNode.appendChild(clone);
  return clone;
}

// 执行动画
function exceAnimation(dom, changeX, changeY, d, unit = 'px'){
  dom.style.visibility = 'visible';
  dom.style.transform = `translate3d(${changeX}${unit}, ${changeY}${unit}, 0)`;
  dom.style.transition = `transform ${d}s ease 0s`;
}
// 隐藏元素，避免移动时和当前可视滑槽重叠
function hide(dom){
  dom.style.visibility = 'hidden';
}

// 横向，滑槽A动画：0 => -1 => 1/num => 0 => ...{ 0、-1、1/num为一个动画周期 }
function animationA_X(dom){
  const { num, changeX, unit, duration, count, i } = this.execOpts;
  if(count === 1){
    // 0 => -1
    exceAnimation(dom, i * changeX * -1, 0, duration, unit);
    if(i === num){
      // 等待上个动画完成
      this.timerA = setTimeout(() => {
        // 瞬间完成-1 => 1/num
        hide(dom);
        exceAnimation(dom, changeX, 0, 0, unit);
      }, duration * 1000);
    }
  }else if(count === 2){
    // 1/num => 0
    exceAnimation(dom, Math.min(num - i, 1) * changeX, 0, duration, unit);
  }
}

// 横向，滑槽B动画：0 => -1/num => (-1 + -1)/num => 0 => ...{ 0、-1/num、(-1 + -1)/num为一个动画周期 }
// 注意这里的起始位置0的坐标在[pageWidth, -1 * pageHeight]
function animationB_X(dom){
  const { pageHeight, num, changeX, unit, duration, count, i } = this.execOpts;
  if(count === 1){
    // 0 => -1/num
    exceAnimation(dom, (num === i ? 0 : 1) * changeX, -1 * pageHeight, duration, unit);
  }else if(count === 2){
    // -1/num => (-1 + -1)/num
    exceAnimation(dom, changeX + (1 + i) * changeX * -1, -1 * pageHeight, duration, unit);
    if(i === num){
      // 等待上个动画完成
      this.timerB = setTimeout(() => {
        // 瞬间完成(-1 + -1)/num => 0
        hide(dom);
        exceAnimation(dom, changeX, -1 * pageHeight, 0, unit);
      }, duration * 1000);
    }
  }
}

// 纵向，滑槽A动画：0 => -1 => 1 => 0 => ...{ 0、-1、1为一个动画周期 }
function animationA_Y(dom){
  const { num, changeY, unit, duration, count, i } = this.execOpts;
  if(count === 1){
    // 0 => -1
    exceAnimation(dom, 0, i * changeY * -1, duration, unit);
    if(i === num){
      // 等待上个动画完成
      this.timerA = setTimeout(() => {
        // 瞬间完成-1 => 1
        hide(dom);
        exceAnimation(dom, 0, num * changeY, 0, unit);
      }, duration * 1000);
    }
  }else if(count === 2){
    // 1 => 0
    exceAnimation(dom, 0, (num - i) * changeY, duration, unit);
  }
}

// 纵向，滑槽B动画：0 => -1 => -2 => 0 => ...{ 0、-1、-2为一个动画周期 }
function animationB_Y(dom){
  const { num, changeY, unit, duration, count, i } = this.execOpts;
  if(count === 1){
    // 0 => -1
    exceAnimation(dom, 0, i * changeY * -1, duration, unit);
  }else if(count === 2){
    // -1 => -2
    exceAnimation(dom, 0, (num + i) * changeY * -1, duration, unit);
    if(i === num){
      // 等待上个动画完成
      this.timerB = setTimeout(() => {
        // 瞬间完成-2 => 0
        hide(dom);
        exceAnimation(dom, 0, 0, 0, unit);
      }, duration * 1000);
    }
  }
}