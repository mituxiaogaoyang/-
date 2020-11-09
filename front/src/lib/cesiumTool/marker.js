/**
 * @authors remy
 * @creatTime 2019-05-05 15:07:09
 * @description Marker类
 * @version 0.0.1
 */

import { checkCoordinate, getHeightfromCartesian3, updateCoordinatesByTerrainForHeight } from './common.js';
import { markerIcon, markerIcon_active } from './icon.js';
import { isObject, isBoolean, isEmpty, isNumber } from './util/type.js';
import Base from './base.js';

const _options = Symbol('options'),
  _actived = Symbol('actived');

const defaultOptions = {};

export default class Marker extends Base {
  [_options] = null;
  [_actived] = false;

  constructor(viewer, data, options) {
    const opts = Object.assign({}, defaultOptions, isObject(options) ? options : {});
    const entity = createEntity(viewer, data, opts);
    super(viewer, entity.id, data); // 必须先调super，待创建实例后才能使用this

    entity.__markerId = this.id;

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
      this.entity.billboard.image = actived ? markerIcon_active : markerIcon;
    }
  }

  getCoordinate(type) {
    const coordinate = this.data.coordinate;
    return type === 'cartesian3' ? Cesium.Cartesian3.fromDegreesArrayHeights(coordinate)[0] : coordinate;
  }
  setCoordinate(coordinate, clampToGround = true) {
    if (checkCoordinate(coordinate)) {
      const heightReference = clampToGround === false ? Cesium.HeightReference.NONE : Cesium.HeightReference.CLAMP_TO_GROUND;
      this.entity.billboard.heightReference = heightReference;
      this.entity.label.heightReference = heightReference;
      this.data.coordinate = coordinate;
      this.entity.position = Cesium.Cartesian3.fromDegreesArrayHeights(coordinate)[0];
    }
  }
  setHeight(height) {
    if (isNumber(height)) {
      this.data.coordinate[2] = height;
      this.entity.position = Cesium.Cartesian3.fromDegreesArrayHeights(this.data.coordinate)[0];
    }
  }
  clampToGround() {
    // 近似贴地
    const heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
    this.entity.billboard.heightReference = heightReference;
    this.entity.label.heightReference = heightReference;
    // 精确贴地
    updateCoordinatesByTerrainForHeight(this.viewer, this.data.coordinate).then(coords => this.setCoordinate(coords));
  }
  update(data) {
    if (isObject(data) && !isEmpty(data)) {
      this.data = data;
      this.actived = data.actived;
      this.entity.label.text = data.labelContent;

      //rf
      const position = Cesium.Cartesian3.fromDegreesArrayHeights(data.coordinate)[0];
      this.entity.position = position;
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
  const heading = Cesium.Math.toRadians(135),
    pitch = 0,
    roll = 0;
  const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll),
    labelColor = Cesium.Color.fromCssColorString('#2a3045'),
    labelOffset = new Cesium.Cartesian2(18, -22),
    labelPadding = new Cesium.Cartesian2(6, 5);
  const heightReference = options.clampToGround === false ? Cesium.HeightReference.NONE : Cesium.HeightReference.CLAMP_TO_GROUND;

  const position = Cesium.Cartesian3.fromDegreesArrayHeights(data.coordinate)[0];
  const entity = viewer.entities.add({
    show: isBoolean(options.show) ? options.show : true,
    position: position,
    orientation: Cesium.Transforms.headingPitchRollQuaternion(position, hpr),
    billboard: {
      image: data.actived === true ? markerIcon_active : markerIcon,
      pixelOffset: new Cesium.Cartesian2(0, 0),
      heightReference: heightReference
    },
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
  });
  entity.__type = 'marker';
  return entity;
}
