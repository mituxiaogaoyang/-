/**
 * @authors remy
 * @creatTime 2019-05-07 13:36:41
 * @description Model类（单体模型）
 * @version 0.0.1
 */

import { checkCoordinates } from './common.js';
import { isObject, isBoolean, isEmpty, isNumber } from './util/type.js';
import Base from './base.js';

const _options = Symbol('options');

const defaultOptions = {};

export default class Model extends Base {
  [_options] = null;

  constructor(viewer, data, options) {
    const opts = Object.assign({}, defaultOptions, isObject(options) ? options : {});
    const entity = createEntity(viewer, data, opts);
    super(viewer, entity.id, data); // 必须先调super，待创建实例后才能使用this

    entity.__modelId = this.id;

    this[_options] = opts;
  }

  getCoordinate(type) {
    const coordinate = this.data.coordinate;
    return type === 'cartesian3' ? Cesium.Cartesian3.fromDegreesArrayHeights(coordinate)[0] : coordinate;
  }
  setCoordinate(coordinate) {
    if (checkCoordinates(coordinate)) {
      const position = Cesium.Cartesian3.fromDegreesArrayHeights(coordinate)[0];
      this.entity.position = position;
    }
  }
  update(data) {
    if (isObject(data) && !isEmpty(data)) {
      this.data = data;
      this.entity.label.text = data.labelContent;
      this.setCoordinate(data.coordinate);
    }
  }
  destroy() {
    this[_options] = null;
    // 销毁基类的属性
    this.destroyBase();
  }
}

function createEntity(viewer, data, options) {
  const labelColor = Cesium.Color.fromCssColorString('#2a3045'),
    labelOffset = new Cesium.Cartesian2(18, -22),
    labelPadding = new Cesium.Cartesian2(6, 5),
    heightReference = options.clampToGround === false ? Cesium.HeightReference.NONE : Cesium.HeightReference.CLAMP_TO_GROUND;
  const heading = Cesium.Math.toRadians(135),
    pitch = 0,
    roll = 0,
    hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll),
    position = Cesium.Cartesian3.fromDegreesArrayHeights(data.coordinate)[0];

  const entity = viewer.entities.add(new Cesium.Entity({
    show: isBoolean(options.show) ? options.show : true,
    position: position,
    orientation: Cesium.Transforms.headingPitchRollQuaternion(position, hpr),
    model: {
      uri: data.url,
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
  }));
  entity.__type = 'model';

  return entity;
}
