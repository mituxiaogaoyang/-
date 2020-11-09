/**
 * @authors remy
 * @creatTime 2019-05-06 09:46:34
 * @description Polygon类
 * @version 0.0.1
 */

import { checkCoordinates, getHeightfromCartesian3, updateCoordinatesByTerrainForHeight } from './common.js';
import { isObject, isBoolean, isEmpty, isNumber } from './util/type.js';
import Base from './base.js';

const _options = Symbol('options'),
  _actived = Symbol('actived');

const defaultOptions = {};

export default class Polygon extends Base {
  [_options] = null;
  [_actived] = false;

  constructor(viewer, data, options) {
    const opts = Object.assign({}, defaultOptions, isObject(options) ? options : {});
    const entity = createEntity(viewer, data, opts);
    super(viewer, entity.id, data); // 必须先调super，待创建实例后才能使用this

    entity.__polygonId = this.id;

    this[_options] = opts;
    data.actived === true && (this[_actived] = data.actived);
    this[_options].clampToGround !== false && this.clampToGround(); // 默认贴地
  }

  get actived() {
    return this[_actived];
  }
  set actived(actived) {
    if (isBoolean(actived)) {
      this[_actived] = actived;
      this.entity.polygon.material = options.activedColor ? Cesium.Color.fromCssColorString(options.activedColor) : Cesium.Color.RED;
    }
  }

  getCoordinates(type) {
    const coordinates = this.data.coordinates;
    return type === 'cartesian3' ? Cesium.Cartesian3.fromDegreesArrayHeights(coordinates) : coordinates;
  }
  setCoordinates(coordinates, clampToGround = true) {
    if (checkCoordinates(coordinates)) {
      const heightReference = clampToGround === false ? Cesium.HeightReference.NONE : Cesium.HeightReference.CLAMP_TO_GROUND;
      this.entity.polygon.heightReference = heightReference;
      this.entity.label.heightReference = heightReference;
      
      this.data.coordinates = coordinates;
      const positions = Cesium.Cartesian3.fromDegreesArrayHeights(coordinates);
      this.entity.polygon.hierarchy = positions;
      this.entity.position = getLabelPosition(positions);
    }
  }
  clampToGround() {
    // 近似贴地
    this.entity.polygon.clampToGround = true;
    this.entity.label.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
    // 精确贴地
    const coordinates = this.data.coordinates;
    // old方案
    // this.entity.polygon.hierarchy.getValue().forEach((position, i) => {
    //   const height = getHeightfromCartesian3(this.viewer, position);
    //   coordinates[(i + 1) * 3 - 1] = height;
    // });
    // new方案
    updateCoordinatesByTerrainForHeight(this.viewer, coordinates).then(coords => this.setCoordinates(coords));
  }
  update(data) {
    if (isObject(data) && !isEmpty(data)) {
      this.data = data;
      this.actived = data.actived;
      this.entity.label.text = data.labelContent;
      this.setCoordinates(data.coordinates);
      this[_options].clampToGround !== false && this.clampToGround(); // 默认贴地
    }
  }
  destroy() {
    this[_options] = null;
    this[_actived] = null;
    // 销毁基类的属性
    this.destroyBase();
  }
}

function createEntity(viewer, data, options) {
  const labelColor = Cesium.Color.fromCssColorString('#2a3045'),
    labelOffset = new Cesium.Cartesian2(18, -22),
    labelPadding = new Cesium.Cartesian2(6, 5);
  const material = options.color ? Cesium.Color.fromCssColorString(options.color) : Cesium.Color.RED,
    heightReference = options.clampToGround === false ? Cesium.HeightReference.NONE : Cesium.HeightReference.CLAMP_TO_GROUND;

  const positions = Cesium.Cartesian3.fromDegreesArrayHeights(data.coordinates);
  const entity = viewer.entities.add(new Cesium.Entity({
    show: isBoolean(options.show) ? options.show : true,
    polygon: new Cesium.PolygonGraphics({
      hierarchy: positions,
      heightReference: heightReference,
      fill: true,
      material: material
    }),
    position: getLabelPosition(positions),
    label: {
      font: '400 13px sans-serif',
      style: Cesium.LabelStyle.FILL,
      showBackground: true,
      backgroundColor: Cesium.Color.fromAlpha(Cesium.Color.fromCssColorString('#fff'), 0.5),
      backgroundPadding: labelPadding,
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      pixelOffset: labelOffset,
      fillColor: labelColor,
      text: data.labelContent,
      heightReference: heightReference
    }
  }));
  entity.__type = 'polygon';

  return entity;
}

function getLabelPosition(positions) {
  const total = positions.reduce((a, b) => {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
      z: a.z + b.z
    };
  });
  const len = positions.length;
  return {
    x: total.x / len,
    y: total.y / len,
    z: total.z / len
  };
}
