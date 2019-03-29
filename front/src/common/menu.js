/**
 * @authors remy
 * @creatTime 2019-03-19 12:27:30
 * @description 将菜单数组转化成树结构数据
 * @version 0.0.1
 */

export default function arrayToTree(data){
  if(data instanceof Array) {
    const tree = [], childNodes = [];
    data.forEach(item => {
      !item.parentCode ? tree.push(item) : childNodes.push(item);
    });
    tree.forEach(item => {
      !item.children && (item.children = []);
      childNodes.forEach(node => {
        node.parentCode === item.menuCode && item.children.push(node);
      });
    });
    return tree;
  }
}