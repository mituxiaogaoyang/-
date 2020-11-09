/**
 * @authors remy
 * @creatTime 2019-04-27 11:37:04
 * @description Point类
 * @version 0.0.1
 */

import { checkCoordinate, getHeightfromCartesian3, updateCoordinatesByTerrainForHeight } from './common.js';
import { warning_animation_icon, getPointIcon } from './icon.js';
import { isObject, isBoolean, isNumber } from './util/type.js';
import Base from './base.js';

const _options = Symbol('options'),
  _animation_entityId = Symbol('animation_entityId'),
  _type = Symbol('type'),
  _status = Symbol('status'),
  _animationId = Symbol('animationId'),
  _animation_scale_change = Symbol('animation_scale_change');

const defaultOptions = {};

export default class Point extends Base {
  [_options] = null;
  [_animation_entityId] = '';
  [_type] = '';
  [_status] = '';
  [_animationId] = null;
  [_animation_scale_change] = -0.02; // scale的变化量，先缩小再放大

  constructor(viewer, data, options) {
    const opts = Object.assign({}, defaultOptions, isObject(options) ? options : {});
    const entity = createEntity(viewer, data, opts);
    super(viewer, entity.id, data); // 必须先调super，待创建实例后才能使用this

    entity.__pointId = this.id;

    this[_options] = opts;
    this[_type] = data.type;
    this[_status] = data.status;
    // 动效动画的entity
    if (this[_options].hasAnimation === true) {
      const animation_entity = createAnimation(viewer, data, this[_options]);
      animation_entity.__pointId = this.id;
      this[_animation_entityId] = animation_entity.id;
      this[_status] === 'warning' && this.startupAnimation();
    }
    this[_options].clampToGround !== false && this.clampToGround(); // 默认贴地
  }

  get status() {
    return this[_status];
  }
  set status(status) {
    if (['normal', 'warning', 'offline'].includes(status)) {
      this[_status] !== 'warning' && status === 'warning' && this.startupAnimation();
      this[_status] === 'warning' && status !== 'warning' && this.endAnimation();
      this[_status] = status;
      this.entity.billboard.image = getPointIcon(this[_type], this[_status]);
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
      const animation_entity = this.getAnimationEntity();
      animation_entity && (animation_entity.billboard.heightReference = heightReference);

      this.data.coordinate = coordinate;
      const position = Cesium.Cartesian3.fromDegreesArrayHeights(coordinate)[0];
      this.entity.position = position;
      animation_entity && (animation_entity.position = position);
    }
  }
  setHeight(height) {
    if (isNumber(height)) {
      this.data.coordinate[2] = height;
      this.setCoordinate(this.data.coordinate, false);
    }
  }
  clampToGround() {
    // 近似贴地
    const heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
    this.entity.billboard.heightReference = heightReference;
    this.entity.label.heightReference = heightReference;
    const animation_entity = this.getAnimationEntity();
    animation_entity && (animation_entity.billboard.heightReference = heightReference);
    // 精确贴地
    updateCoordinatesByTerrainForHeight(this.viewer, this.data.coordinate).then(coord => this.setCoordinate(coord));
  }
  update(data) {
    if (isObject(data) && data.id === this.id) {
      this.data = data;
      this.status = data.status;
      this.entity.label.text = data.labelContent;
      this.setCoordinate(data.coordinate, this[_options].clampToGround);
      this[_options].clampToGround !== false && this.clampToGround(); // 默认贴地
    }
  }
  getAnimationEntity() {
    return this.viewer ? this.viewer.entities.getById(this[_animation_entityId]) : null;
  }
  startupAnimation() {
    const animation_entity = this.getAnimationEntity();
    if (animation_entity) {
      if (!animation_entity.show) {
        animation_entity.show = true;
        animation_entity.billboard.scale = 1;
      }
      const billboard = animation_entity.billboard;
      billboard.scale >= 1.2 && (this[_animation_scale_change] = Math.abs(this[_animation_scale_change]) * -1);
      billboard.scale <= 0.8 && (this[_animation_scale_change] = Math.abs(this[_animation_scale_change]));
      billboard.scale += this[_animation_scale_change];
      this[_animationId] = requestAnimationFrame(this.startupAnimation.bind(this));
    }
  }
  endAnimation() {
    const animation_entity = this.getAnimationEntity();
    if (animation_entity) {
      animation_entity.show = false;
      cancelAnimationFrame(this[_animationId]);
    }
  }
  destroy() {
    this.viewer.entities.removeById(this[_animation_entityId]);
    this[_options] = null;
    this[_animation_entityId] = null;
    this[_type] = null;
    this[_status] = null;
    this[_animationId] = null;
    this[_animation_scale_change] = null;
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
      image: getPointIcon(data.type, data.status),
      pixelOffset: new Cesium.Cartesian2(0, -18), // 原始位置(0,0)在图标中心点
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
  entity.__type = 'point';

  return entity;
}

function createAnimation(viewer, data, options) {
  const heading = Cesium.Math.toRadians(135);
  const pitch = 0;
  const roll = 0;
  const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
  const heightReference = options.clampToGround === false ? Cesium.HeightReference.NONE : Cesium.HeightReference.CLAMP_TO_GROUND;

  const position = Cesium.Cartesian3.fromDegreesArrayHeights(data.coordinate)[0];
  const entity_animation = viewer.entities.add({
    show: false,
    scale: 1,
    position: position,
    orientation: Cesium.Transforms.headingPitchRollQuaternion(position, hpr),
    billboard: {
      image: warning_animation_icon,
      pixelOffset: new Cesium.Cartesian2(0, -22),
      heightReference: heightReference
    }
  });
  entity_animation.__type = 'point';

  return entity_animation;
}