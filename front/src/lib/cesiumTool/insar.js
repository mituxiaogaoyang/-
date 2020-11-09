/**
 * @authors remy
 * @creatTime 2019-05-06 19:32:28
 * @description Insar类（雷达扫描分析数据）
 * @version 0.0.1
 */

import { checkCoordinates } from './common.js';
import { isObject, isBoolean, isEmpty, isNumber } from './util/type.js';

const _options = Symbol('options'),
  _id = Symbol('id'),
  _viewer = Symbol('viewer'),
  _data = Symbol('data');

const defaultOptions = {};

export default class Insar {
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

    createDataSource.call(this);
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
  get dataSource() {
    return this.viewer.dataSources._dataSources.find(item => {
      return item.__type === 'insar' && item.__insarId === this.id;
    });
  }
  get showStatus() {
    return this.dataSource.show;
  }

  show() {
    this.dataSource.show = true;
  }
  hide() {
    this.dataSource.show = false;
  }
  destroy() {
    this.viewer.dataSources.remove(this.dataSource);
    this[_options] = null;
    this[_id] = null;
    this[_viewer] = null;
    this[_data] = null;
  }
}

function createDataSource() {
  const _this = this,
    viewer = this[_viewer],
    data = this[_data],
    id = this[_id],
    options = this[_options];
  const opts = {
    camera: viewer.scene.camera,
    canvas: viewer.scene.canvas,
    clampToGround: options.clampToGround === false ? false : true
  };
  viewer.dataSources.add(Cesium.KmlDataSource.load(data.url, opts))
    .then(dataSource => {
      dataSource.entities.values.forEach(entity => {
        if (entity.position) {
          // 将wgs84转换成和谷歌瓦片匹配的gcjo2
          // const coordinate_wgs84 = this.fromCartesian3ToWGS84(entity.position.getValue(Cesium.JulianDate.now()));
          // const coordinate_gcj02 = coordTransform.wgs84togcj02.apply(this, coordinate_wgs84.slice(0, 2));
          // entity.position.setValue(Cesium.Cartesian3.fromDegrees(coordinate_gcj02[0], coordinate_gcj02[1], coordinate_wgs84[2]));
        }
        // if(entity.billboard){
        //   entity.billboard.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND
        // }
      });
      dataSource.__type = 'insar';
      dataSource.__insarId = id;
      dataSource.show = options.show === false ? false : true;
    });
}
