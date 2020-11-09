/**
 * @authors remy
 * @creatTime 2019-04-27 11:11:32
 * @description 基类
 * @version 0.0.1
 */

import { isObject, isEmpty } from './util/type.js';

const _id = Symbol('id'),
  _viewer = Symbol('viewer'),
  _entityId = Symbol('entityId'),
  _data = Symbol('data');
export default class Base {
  [_id] = '';
  [_viewer] = null;
  [_entityId] = ''; // Cesium的Entity的实例的id
  [_data] = null; // 数据源

  constructor(viewer, entityId, data) {
    this[_viewer] = viewer;
    this[_entityId] = entityId;
    this[_data] = data;
    this[_id] = data.id || entityId;
  }

  get id() {
    return this[_id];
  }
  get data() {
    return this[_data];
  }
  set data(data) {
    if (isObject(data) && !isEmpty(data)) {
      this[_id] = data.id;
      this[_data] = data;
    }
  }
  get viewer() {
    return this[_viewer];
  }
  get entityId() {
    return this[_entityId];
  }
  get entity() {
    return this[_viewer] ? this[_viewer].entities.getById(this.entityId) : null;
  }
  get showStatus() {
    return this.entity.show;
  }

  show() {
    this.entity.show = true;
  }
  hide() {
    this.entity.show = false;
  }
  destroyBase() {
    this.viewer.entities.removeById(this.entityId);
    this[_id] = null;
    this[_viewer] = null;
    this[_entityId] = null;
    this[_data] = null;
  }
}
