/**
 * @authors remy
 * @creatTime 2019-05-07 09:55:02
 * @description TileModel类（3DTiles模型）
 * @version 0.0.1
 */

import { checkCoordinate } from './common.js';
import { isObject, isBoolean, isEmpty, isNumber, isFunction } from './util/type.js';

const _options = Symbol('options'),
  _id = Symbol('id'),
  _viewer = Symbol('viewer'),
  _data = Symbol('data');

const defaultOptions = {};

export default class Tileset {
  [_options] = null;
  [_id] = ''; // data.url作为id
  [_viewer] = null;
  [_data] = null; // 数据源

  constructor(viewer, data, options) {
    const opts = Object.assign({}, defaultOptions, isObject(options) ? options : {});

    this[_options] = opts;
    this[_viewer] = viewer;
    this[_data] = data;
    this[_id] = data.url;

    createTileset.call(this);
  }

  get id() {
    return this[_id];
  }
  get data() {
    return this[_data];
  }
  set data(data) {
    if (isObject(data) && data.url === this.id) {
      this[_data] = data;
    }
  }
  get viewer() {
    return this[_viewer];
  }
  get tileset() {
    return this.viewer.scene.primitives._primitives.find(item => {
      return item.__type === 'tileset' && item.__tilesetId === this.id;
    });
  }
  get showStatus() {
    return this.tileset.show;
  }

  show() {
    this.tileset.show = true;
  }
  hide() {
    this.tileset.show = false;
  }
  // 设置tileset整体位置角度
  setPosition({ lng, lat, height, headingAngle }) {
    if (checkCoordinate([lng, lat, height]) && isNumber(headingAngle)) {
      const position = Cesium.Cartesian3.fromDegrees(lng, lat, height || 0);
      const mat = Cesium.Transforms.eastNorthUpToFixedFrame(position);
      const rotationX = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(headingAngle)));
      Cesium.Matrix4.multiply(mat, rotationX, mat);
      this.tileset._root.transform = mat;
    }
  }
  destroy() {
    this.viewer.scene.primitives.remove(this.tileset);
    this[_options] = null;
    this[_id] = null;
    this[_viewer] = null;
    this[_data] = null;
  }
}

function createTileset() {
  const _this = this,
    viewer = this[_viewer],
    data = this[_data],
    id = this[_id],
    options = this[_options];
  const tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
    url: data.url,
    show: options.show === false ? false : true
  }));
  tileset.readyPromise.then(() => {
    //如果tileset自带世界矩阵矩阵，那么计算放置的经纬度和heading

    const mat = Cesium.Matrix4.fromArray(tileset._root.transform);

    //原来的矩阵的逆
    self.orginMatrixInverse = Cesium.Matrix4.inverse(mat, new Cesium.Matrix4());

    const pos = Cesium.Matrix4.getTranslation(mat, new Cesium.Cartesian3());
    const wpos = Cesium.Cartographic.fromCartesian(pos);
    if (wpos) {
      const lng = Cesium.Math.toDegrees(wpos.longitude);
      const lat = Cesium.Math.toDegrees(wpos.latitude);
      const height = wpos.height;

      //取旋转矩阵
      const rotmat = Cesium.Matrix4.getRotation(mat, new Cesium.Matrix3());
      //默认的旋转矩阵
      const defrotmat = Cesium.Matrix4.getRotation(Cesium.Transforms.eastNorthUpToFixedFrame(pos), new Cesium.Matrix3());

      //计算rotmat 的x轴，在defrotmat 上 旋转
      const xaxis = Cesium.Matrix3.getColumn(defrotmat, 0, new Cesium.Cartesian3());
      const yaxis = Cesium.Matrix3.getColumn(defrotmat, 1, new Cesium.Cartesian3());
      const zaxis = Cesium.Matrix3.getColumn(defrotmat, 2, new Cesium.Cartesian3());

      let dir = Cesium.Matrix3.getColumn(rotmat, 0, new Cesium.Cartesian3());

      dir = Cesium.Cartesian3.cross(dir, zaxis, dir);
      dir = Cesium.Cartesian3.cross(zaxis, dir, dir);
      dir = Cesium.Cartesian3.normalize(dir, dir);

      let heading = Cesium.Cartesian3.angleBetween(xaxis, dir);

      const ay = Cesium.Cartesian3.angleBetween(yaxis, dir);

      if (ay > Math.PI * 0.5) {
        heading = 2 * Math.PI - heading;
      }

      const headingAngle = Cesium.Math.toDegrees(heading);
      isFunction(options.readyCallback) && options.readyCallback(_this, { lng, lat, height, headingAngle });
    }
  });
  tileset.__type = 'tileset';
  tileset.__tilesetId = id;
}
