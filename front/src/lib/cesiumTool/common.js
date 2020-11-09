/**
 * @authors remy
 * @creatTime 2019-04-15 11:37:38
 * @description 
 * @version 0.0.1
 */

import { isArray, isNumber } from './util/type.js';

// 检测coordinate有效性
export function checkCoordinate(coordinate) {
  return isArray(coordinate) && coordinate.length <= 3 &&
    isNumber(coordinate[0]) && 0 <= coordinate[0] && coordinate[0] <= 180 &&
    isNumber(coordinate[1]) && 0 <= coordinate[1] && coordinate[1] <= 90 &&
    (isNumber(coordinate[2]) || coordinate[2] === undefined);
}

export function getHeightfromCartesian3(viewer, cartesian3) {
  const cartographic = Cesium.Cartographic.fromCartesian(cartesian3);
  return viewer.scene.globe.getHeight(cartographic);
}

// 检测coordinates有效性
export function checkCoordinates(coordinates) {
  return isArray(coordinates) && coordinates.length >= 4 &&
    (coordinates.length % 2 === 0 || coordinates.length % 3 === 0) &&
    coordinates.findIndex(item => !isNumber(item)) === -1;
}

export function getCoordinateFromCartesian3(viewer, cartesian3, type = 'globe') {
  if (Cesium.defined(cartesian3)) {
    //将笛卡尔坐标转换为地理坐标
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian3);
    // 将弧度转为度的十进制度表示
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    // 获取高度
    let height = 0;
    if (type === 'globe') {
      // 球体/地形高度
      height = viewer.scene.globe.getHeight(cartographic);
    } else if (type === 'model') {
      // 模型高度
      height = cartographic.height;
    }
    return [longitude, latitude, height];
  }
}

export function getCoordinate(viewer, position) {
  // 通过指定的椭球或者地图对应的坐标系，将鼠标的二维坐标转换为对应椭球体三维坐标
  // 无地形高程
  // var ellipsoid = viewer.scene.globe.ellipsoid; // 得到当前三维场景的椭球体
  // var cartesian = viewer.camera.pickEllipsoid(position, ellipsoid);
  // 有地形高程
  const ray = viewer.camera.getPickRay(position);
  const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
  return getCoordinateFromCartesian3(viewer, cartesian, 'globe');
}

// 获取单体模型的经纬度高程坐标
export function getModelCoordinate(viewer, position) {
  const scene = viewer.scene;
  const pickedObject = scene.pick(position);
  if (scene.pickPositionSupported && Cesium.defined(pickedObject)) {
    const cartesian = scene.pickPosition(position);
    return getCoordinateFromCartesian3(viewer, cartesian, 'model');
  }
  return getCoordinate(viewer, position);
}

// 获取两点间的距离
export function getDistance(startCoord, endCoord) {
  const startCartesian3 = Cesium.Cartesian3.fromDegreesArrayHeights(startCoord)[0],
    endCartesian3 = Cesium.Cartesian3.fromDegreesArrayHeights(endCoord)[0];
  return Cesium.Cartesian3.distance(startCartesian3, endCartesian3);
}

// 批量：根据当前地形更新coordinate的高程
// @param [lng, lat, height, lng, lat, height, ...]
// @return [[lng, lat, height], [lng, lat, height], ...]
export function updateCoordinatesByTerrainForHeight(viewer, coordinates) {
  return new Promise((resolve, reject) => {
    const positions = [];
    if (checkCoordinate(coordinates)) {
      const [ lng, lat ] = coordinates;
      positions.push(Cesium.Cartographic.fromDegrees(lng, lat));
    } else if (checkCoordinates(coordinates) && coordinates.length % 3 === 0) {
      let i = 0, len = coordinates.length / 3;
      while (i++ < len) {
        const [ lng, lat ] = coordinates.slice(i * 3, (i + 1) * 3);
        positions.push(Cesium.Cartographic.fromDegrees(lng, lat));
      }
    } else {
      throw new Error(`updateCoordinatesByTerrainForHeight入参coordinates异常，应是[lng, lat, h, lng, lat, h, ...]`);
    }
    const promise = Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, positions);
    Cesium.when(promise, function(updatedPositions) {
      updatedPositions.forEach((position, i) => {
        coordinates[i * 3 + 2] = position.height;
      });
      resolve(coordinates);
    }, function() {
      // 如果没有地形则高程置为0
      coordinates[2] = 0;
      resolve(coordinates);
    });
  });
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
