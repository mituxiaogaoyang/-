/**
 * @authors remy
 * @creatTime 2019-05-06 20:19:07
 * @description 32位UUID生成器(8-4-4-4-12)
 * @version 0.0.1
 */

const letters = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a' ,'b', 'c', 'd', 'e', 'f', 'g', 'h',
 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

function getOne(){
  return letters[Math.floor(Math.random() * letters.length)];
}

export default function createUUID(){
  const result = [], timestamp = '' + Date.now();
  result.push(getOne(), getOne(), getOne());
  result.push(timestamp.substr(5, 2));
  result.push(getOne(), getOne(), getOne());
  result.push('-');
  result.push(getOne());
  result.push(timestamp.substr(7, 1));
  result.push(getOne(), getOne());
  result.push('-');
  result.push(getOne());
  result.push(timestamp.substr(8, 1));
  result.push(getOne(), getOne());
  result.push('-');
  result.push(getOne());
  result.push(timestamp.substr(9, 1));
  result.push(getOne(), getOne());
  result.push('-');
  result.push(getOne(), getOne(), getOne(), getOne());
  result.push(timestamp.substr(10, 3));
  result.push(getOne(), getOne(), getOne(), getOne(), getOne());
  return result.join('');
}