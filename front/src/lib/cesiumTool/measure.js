/**
 * @authors remy
 * @creatTime 2019-05-08 13:43:10
 * @description Measure测量类
 * @version 0.0.1
 */

import { isFunction, isObject } from './util/type.js';
import { getCoordinate, getModelCoordinate, getDistance } from './common';
const label_color = 'rgba(243, 152, 0, 0.5)'
const _options = Symbol('options'),
  _viewer = Symbol('viewer'),
  _mode = Symbol('mode'),
  _drawing = Symbol('drawing'),
  _coordinates = Symbol('coordinates'),
  _mouseCoord = Symbol('mouseCoord'),
  _tipLabelId = Symbol('tipLabelId'),
  _coordForMouse = Symbol('coordForMouse'),
  _editingMeasureId = Symbol('editingMeasureId'),
  _measures = Symbol('measures'),
  _handler = Symbol('handler');

function loop() {}

function getDefaultOptions() {
  return {
    showTip: true, // 显示tipLabel
    showMeasureValue: false, // 显示测量值
    isOnce: true, // 开启测量是否仅可测量一次
    // 测距线的材质
    //rf label
    polylineMaterial: new Cesium.PolylineOutlineMaterialProperty({
      color: Cesium.Color.fromCssColorString(label_color)
    }),
    polylineMaterial_actived: new Cesium.PolylineDashMaterialProperty({
      color: Cesium.Color.fromCssColorString(label_color)
    }),
    // polylineMaterial: new Cesium.PolylineOutlineMaterialProperty({
    //   color: Cesium.Color.fromCssColorString('rgba(18,28,227,1)')
    // }),
    // polylineMaterial_actived: new Cesium.PolylineDashMaterialProperty({
    //   color: Cesium.Color.fromCssColorString('rgba(18,28,227,1)')
    // }),
    // 测面边颜色
    polygonOutlineColor: Cesium.Color.fromCssColorString(label_color), //rf label
   // polygonOutlineColor: Cesium.Color.fromCssColorString('rgba(18,28,227,1)'),
    polygonOutlineColor_actived: Cesium.Color.fromCssColorString('rgba(225,115,115,1)'),
    // 测面面的材质
    polygonMaterial: Cesium.Color.fromCssColorString(label_color),
    polygonMaterial_actived: Cesium.Color.fromCssColorString(label_color),
    // polygonMaterial: Cesium.Color.fromCssColorString('rgba(18,28,227,0.2)'),
    // polygonMaterial_actived: Cesium.Color.fromCssColorString('rgba(225,115,115,0.2)'),
    // 点的材质
    pointColor: Cesium.Color.fromCssColorString(label_color),
    //pointColor: Cesium.Color.fromCssColorString('rgba(18,28,227,1)'),
    pointColor_actived: Cesium.Color.fromCssColorString('rgba(225,115,115,1)'),
    // 用于在模型上鼠标取点
    pickTranslucentDepth: true,
    finishedCallback: loop
  };
};

export default class Measure {
  [_options] = null;
  [_viewer] = null;
  [_mode] = null; // distance、highness、area
  [_drawing] = false;
  [_coordinates] = []; // 共用，当前编辑图形的点的集[[lng, lat, height]]
  [_mouseCoord] = null; // 共用，鼠标当前的位置
  [_tipLabelId] = null; // 共用，鼠标跟随提示
  [_coordForMouse] = null; // 共用，鼠标跟随提示的坐标
  [_editingMeasureId] = 0; // 正在编辑的测量的id即索引
  // 集合{'0': {type: 'distance', actived: false, entityId: polylineEntity/areaEntity,
  // pointEntityIds: [pointEntity...], labelEntityIds: [labelEntity...], 
  // otherEntityIds: [entity...], coordinates: []}}（备注：字段名从0开始递增）
  [_measures] = {};
  [_handler] = null; // 定义当前场景的画布元素的事件处理

  constructor(viewer, options) {
    const opts = Object.assign({}, getDefaultOptions(), isObject(options) ? options : {});
    this[_options] = opts;
    this[_viewer] = viewer;
    this[_viewer].scene.pickTranslucentDepth = true;
    this[_handler] = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    this[_options].showTip && initTipLabel.call(this);
  }

  get viewer() {
    return this[_viewer];
  }
  get drawing() {
    return this[_drawing];
  }
  get mode() {
    return this[_mode];
  }
  get measures() {
    return this[_measures];
  }

  isRepeatPoint(coordinate) {
    var isRepeat = false;
    this[_coordinates].find(coord => {
      if (coord[0] === coordinate[0] && coord[1] === coordinate[1] && coord[2] === coordinate[2]) {
        isRepeat = true;
        return true;
      }
    });
    return isRepeat;
  }
  getEntityByEntityId(entityId) {
    return this.viewer.entities.getById(entityId);
  }
  showTip() {
    const tipLabel = this.getEntityByEntityId(this[_tipLabelId]);
    tipLabel && (tipLabel.label.show = true);
  }
  hideTip() {
    const tipLabel = this.getEntityByEntityId(this[_tipLabelId]);
    tipLabel && (tipLabel.label.show = false);
  }
  open(mode,callback) {
    close.call(this)
    this.drawing && this.finish();
    if (mode === 'distance' || mode === 'highness' || mode === 'area') {
      this[_mode] = mode;
    } else {
      throw new Error('不支持的测量类型：' + mode);
    }
    onMouseMove.call(this);
    this.showTip();
    // 监听鼠标右击，开启测量
    this[_handler].setInputAction((clickment => {
      this[_drawing] = true;
      if (this.mode !== 'highness' || (this.mode === 'highness' && this[_coordinates].length === 0)) {
        var coordinate = getModelCoordinate(this.viewer, clickment.position);
        coordinate && !this.isRepeatPoint(coordinate) && this[_coordinates].push(coordinate);
      }
    }).bind(this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // 双击结束
    this[_handler].setInputAction((doubleclickment => {
      this[_drawing] = false;
      var coordinate = getModelCoordinate(this.viewer, doubleclickment.position);
      coordinate && this.finish(coordinate);
      this[_options].isOnce && close.call(this);
      typeof callback === 'function'&&callback(this[_editingMeasureId]-1)
    }).bind(this), Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    // 右击结束
    this[_handler].setInputAction((clickment => {
      this[_drawing] = false;
      var coordinate = getModelCoordinate(this.viewer, clickment.position);
      coordinate && this.finish(coordinate);
      this[_options].isOnce && close.call(this); //this.measures[this[_editingMeasureId]].entityId
      typeof callback === 'function'&&callback(this[_editingMeasureId]-1)
    }).bind(this), Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }
  close(){
    close.call(this)
  }

  cancel() {
    this[_coordinates] = [];
    this.removeById(this[_editingMeasureId]);
  }
  finish(coordinate) {
    if (this[_options].isOnce) {
      close.call(this);
    } else {
      this[_handler].removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    var len = this[_coordinates].length;
    if ((this.mode === 'highness' && (!len || !coordinate)) ||
      (this.mode === 'distance' && ((coordinate && !len) || (!coordinate && len < 2))) ||
      (this.mode === 'area' && ((coordinate && len < 2) || (!coordinate && len < 3)))) {
      this.cancel();
      isFunction(this[_options].finishedCallback) && this[_options].finishedCallback('cancel');
    } else {
      updateGraph.call(this, true, coordinate);
    }
  }
  flyToMeasure(id) {
    const measure = this.measures[id];
    measure && this.viewer.flyTo(this.getEntityByEntityId(measure.entityId));
  }
  removeById(id) {
    const measure = this.measures[id],
      entities = this.viewer.entities;
    if (measure) {
      entities.removeById(measure.entityId);
      measure.pointEntityIds.forEach(entityId => {
        entities.removeById(entityId);
      });
      measure.labelEntityIds.forEach(entityId => {
        entities.removeById(entityId);
      });
      measure.otherEntityIds && measure.otherEntityIds.forEach(entityId => {
        entities.removeById(entityId);
      });
      measure.entityId = null;
      measure.pointEntityIds = null;
      measure.labelEntityIds = null;
      measure.otherEntityIds = null;
      measure.coordinates = null;
      delete this.measures[id];
    }
  }
  removeAll() {
    Object.keys(this.measures).forEach(id => {
      this.removeById(id);
    });
  }
}

function initTipLabel() {
  const tipLabel = this.viewer.entities.add({
    position: new Cesium.CallbackProperty(((time, result) => {
      if (this[_coordForMouse]) {
        return Cesium.Cartesian3.fromDegreesArrayHeights(this[_coordForMouse])[0];
      }
    }).bind(this)),
    label: {
      show: false,
      font: '400 13px sans-serif',
      style: Cesium.LabelStyle.FILL,
      showBackground: true,
      backgroundColor: Cesium.Color.WHITE,
      backgroundPadding: new Cesium.Cartesian2(6, 5),
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      pixelOffset: new Cesium.Cartesian2(12, -22),
      fillColor: Cesium.Color.fromCssColorString('#2a3045'),
      text: new Cesium.CallbackProperty(((time, result) => {
        var str = '左键单击开始标注';
        //var str = '左键单击开始测量，';
        if (this[_coordinates].length >= 1) {
          str = this.mode === 'highness' ? '' : '左键单击确定点，';
        }
        return str + '右键单击结束测量';
        //return str + '左键双击或右键单击结束测量';
      }).bind(this))
    }
  });
  this[_tipLabelId] = tipLabel.id;
}

// 关闭监听
function close() {
  this[_drawing] = false;
  this.hideTip();
  this[_handler].removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  this[_handler].removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
  this[_handler].removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  this[_handler].removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
}

//设置鼠标右击事件的处理函数，这里负责监听x,y坐标值变化
function onMouseMove() {
  this[_handler].setInputAction((movement => {
    var coordinate = getModelCoordinate(this.viewer, movement.endPosition);
    if (coordinate) {
      this[_coordForMouse] = coordinate;
      if (this[_coordinates].length >= 1) {
        this[_mouseCoord] = coordinate;
        updateGraph.call(this);
      }
    }
  }).bind(this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

function addPolyline(id) {
  const item = this.measures[id];
  const polyline = this.viewer.entities.add(new Cesium.Entity({
    show: true,
    position: Cesium.Cartesian3.fromDegrees(...item.coordinates[0]),
    polyline: new Cesium.PolylineGraphics({
      positions: new Cesium.CallbackProperty(((time, result) => {
        const arr = item.coordinates.reduce((a, b) => {
          return a.concat(b);
        });
        return Cesium.Cartesian3.fromDegreesArrayHeights(arr);
      }).bind(this)),
      width: 2,
      material: this[_options].polylineMaterial_actived
    })
  }));
  polyline.__type = 'measure_' + this.mode;
  polyline.__measureId = this[_editingMeasureId];
  return polyline.id;
}

function addPolygon(id) {
  const item = this.measures[id];
  const polygon = this.viewer.entities.add(new Cesium.Entity({
    show: true,
    position: Cesium.Cartesian3.fromDegrees(...item.coordinates[0]),
    polygon: new Cesium.PolygonGraphics({
      hierarchy: new Cesium.CallbackProperty(((time, result) => {
        var arr = item.coordinates.reduce((a, b) => {
          return a.concat(b);
        });
        return Cesium.Cartesian3.fromDegreesArrayHeights(arr);
      }).bind(this)),
      outline: false,
      outlineColor: this[_options].polygonOutlineColor_actived,
      outlineWidth: 2,
      material: this[_options].polygonMaterial_actived,
      // 多边形的空间高度（从0到height）
      // height: 0,
      // 多边形的挤压高度（如果和height一样则多边形的空间高度为0，呈一个二维平面）
      // extrudedHeight: 0,
      // 是否使用hierarchy中坐标的高程（不能和height同时启用）
      // perPositionHeight: true
    })
  }));
  polygon.__type = 'measure_' + this.mode;
  polygon.__measureId = this[_editingMeasureId];
  return polygon.id;
}

function addPoint(coordinate) {
  var isPolygon = this.mode === 'area';
  var color = isPolygon ? this[_options].pointColor_actived : this[_options].pointColor,
    heightReference = isPolygon ? Cesium.HeightReference.CLAMP_TO_GROUND : Cesium.HeightReference.NONE;
  const point = this.viewer.entities.add({
    position: Cesium.Cartesian3.fromDegreesArrayHeights(coordinate)[0],
    point: {
      color: color,
      pixelSize: 8,
      heightReference: heightReference
    }
  });
  point.__type = 'measure_' + this.mode;
  point.__measureId = this[_editingMeasureId];
  return point.id;
}

function getPolylineText(endCoord, coordinates) {
  let total = 0;
  coordinates.findIndex((coordinate, i, arr) => {
    if (i > 0) {
      total += Math.round(getDistance(arr[i - 1], arr[i]));
      if (endCoord === coordinate) return true;
    }
  });
  return total === 0 ? '起点' : total < 1000 ? total.toFixed(1) + 'm' : (total / 1000).toFixed(1) + 'km';
}

function getArea(id) {
  var RADIUS = 6378137;

  function r(e) {
    var t, r, o, s, l, d, u = 0,
      c = e.length;
    if (c > 2) {
      for (var i = 0; i < c; i++) {
        i === c - 2 ? (s = c - 2, l = c - 1, d = 0) :
          i === c - 1 ? (s = c - 1, l = 0, d = 1) : (s = i, l = i + 1, d = i + 2),
          t = e[s], r = e[l], o = e[d],
          u += (n(o[0]) - n(t[0])) * Math.sin(n(r[1]))
      }
      u = u * RADIUS * RADIUS / 2
    }
    return u
  }

  function n(e) {
    return e * Math.PI / 180
  }
  var area = Math.abs(r(this.measures[id].coordinates));
  return area < 1000 * 1000 ? area.toFixed(1) + '㎡' : (area / 1000 / 1000).toFixed(1) + 'k㎡';
}

function getPolygonCenter(id) {
  let lng = 0,
    lat = 0,
    height = 0,
    coordinates = this.measures[id].coordinates.slice();
  const len = coordinates.length;
  coordinates.reduce((a, b) => {
    a = a || [0, 0, 0];
    b = b || [0, 0, 0];
    lng += a[0] + b[0];
    lat += a[1] + b[1];
    height += a[2] + b[2];
  });
  return [lng / len, lat / len, height / len];
}

function addLabel(coordinate, coordinates, isMoved, id) {
  let label = {
    // showBackground: true,
    // backgroundColor: this._mode === 'area' ? this._pointColor_red : this._pointColor_blue,
    font: '400 16px sans-serif',
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    outlineWidth: 1,
    outlineColor: Cesium.Color.WHITE,
    pixelOffset: new Cesium.Cartesian2(0.0, -20),
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
  };
  const opts = this[_options],
    item = this.measures[id];
  if (this.mode === 'area') {
    label = Object.assign(label, {
      fillColor: opts.pointColor_actived,
      text: new Cesium.CallbackProperty(((time, result) => {
        return getArea.call(this, id);
      }).bind(this))
    });
    const entity = this.viewer.entities.add({
      position: new Cesium.CallbackProperty(((time, result) => {
        return Cesium.Cartesian3.fromDegreesArrayHeights(getPolygonCenter.call(this, id))[0];
      }).bind(this)),
      label: label
    });
    return entity.id;
  } else if (this.mode === 'distance') {
    label.fillColor = opts.pointColor;
    if (isMoved) {
      label.text = new Cesium.CallbackProperty(((time, result) => {
        return getPolylineText.call(this, item.coordinates[item.coordinates.length - 1], item.coordinates);
      }).bind(this));
      const entity = this.viewer.entities.add({
        position: new Cesium.CallbackProperty(((time, result) => {
          return Cesium.Cartesian3.fromDegreesArrayHeights(item.coordinates[item.coordinates.length - 1])[0];
        }).bind(this)),
        label: label
      });
      return entity.id;
    } else {
      label.text = getPolylineText.call(this, coordinate, coordinates);
      const entity = this.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegreesArrayHeights(coordinate)[0],
        label: label
      });
      return entity.id;
    }
  } else if (this.mode === 'highness') {
    label.fillColor = opts.pointColor;
    const labelEntityIds = []; // 斜边、高、水平距离
    for (let i = 3; i > 0; i--) {
      label.text = (j => {
        return new Cesium.CallbackProperty(((time, result) => {
          const coords = getHighCoords.call(this, id);
          let distance = 0,
            str = '';
          if (j === 3) {
            str = '直线距离';
            distance = getDistance(coords[0], coords[2]);
          } else if (j === 2) {
            str = '高';
            distance = getDistance(coords[0], coords[1]);
          } else if (j === 1) {
            str = '水平距离';
            distance = getDistance(coords[1], coords[2]);
          }
          return str + (distance < 1000 ? distance.toFixed(1) + 'm' : (distance / 1000).toFixed(1) + 'km');
        }).bind(this));
      })(i);
      const entity = this.viewer.entities.add({
        position: (j => {
          return new Cesium.CallbackProperty(((time, result) => {
            const coords = getHighCoords.call(this, id);
            let coord1 = 0,
              coord2 = 0;
            if (j === 3) {
              coord1 = coords[0];
              coord2 = coords[2];
            } else if (j === 2) {
              coord1 = coords[0];
              coord2 = coords[1];
            } else if (j === 1) {
              coord1 = coords[1];
              coord2 = coords[2];
            }
            const coord = [(coord1[0] + coord2[0]) / 2, (coord1[1] + coord2[1]) / 2, (coord1[2] + coord2[2]) / 2];
            return Cesium.Cartesian3.fromDegreesArrayHeights(coord)[0];
          }).bind(this));
        })(i),
        label: label
      })
      labelEntityIds.push(entity.id);
    }
    return labelEntityIds;
  }
}

function getHighCoords(id) {
  const coordinates = this.measures[id].coordinates.slice(0);
  const highCoord = coordinates[0].slice(0, 2);
  highCoord.push(coordinates[1][2]);
  coordinates.splice(1, 0, highCoord);
  coordinates.push(coordinates[0]);
  return coordinates;
}

function createHighMeasure(id) {
  const result = [],
    opts = this[_options];
  for (let i = 0, len = 3; i < len; i++) {
    const entity = this.viewer.entities.add({
      polyline: {
        positions: ((j) => {
          return new Cesium.CallbackProperty(((time, result) => {
            const coords = getHighCoords.call(this, id);
            const coordinates = coords.slice(j, j + 2).reduce((a, b) => { return a.concat(b) });
            return Cesium.Cartesian3.fromDegreesArrayHeights(coordinates);
          }).bind(this))
        })(i),
        width: 2,
        material: i === 0 ? opts.polylineMaterial : opts.polylineMaterial_actived
      }
    });
    result.push(entity.id);
  }
  return result;
}
// 更新图形
function updateGraph(finished, endCoord) {
  let item = null;
  const opts = this[_options],
    isArea = this.mode === 'area',
    isDistance = this.mode === 'distance';
  const showMeasureValue = opts.showMeasureValue;
  if (!this.measures[this[_editingMeasureId]]) {
    // 新建
    item = this.measures[this[_editingMeasureId]] = {
      type: this.mode,
      actived: true,
      isSubmit:false,
      coordinates: this[_coordinates].concat([this[_mouseCoord]]),
      entityId: null,
      pointEntityIds: [addPoint.call(this, this[_coordinates][0])],
      labelEntityIds: [],
      otherEntityIds: null
    };
    if (isArea) {
      item.entityId = addPolygon.call(this, this[_editingMeasureId]);
      showMeasureValue && item.labelEntityIds.push(addLabel.call(this, '', '', '', this[_editingMeasureId]));
    } else if (isDistance) {
      item.entityId = addPolyline.call(this, this[_editingMeasureId]);
      showMeasureValue && item.labelEntityIds.push(addLabel.call(this, item.coordinates[0], item.coordinates.slice(0, 1)),
        addLabel.call(this, item.coordinates[1], item.coordinates, true, this[_editingMeasureId]));
    } else {
      const temp = createHighMeasure.call(this, this[_editingMeasureId]);
      item.entityId = temp[0];
      item.otherEntityIds = temp.slice(1);
      showMeasureValue && (item.labelEntityIds = addLabel.call(this, '', '', '', this[_editingMeasureId]));
    }
  } else {
    item = this.measures[this[_editingMeasureId]];
    if (finished) {
      // 完成
      if (endCoord) {
        item.pointEntityIds.push(addPoint.call(this, endCoord));
        !this.isRepeatPoint(endCoord) && (item.coordinates = this[_coordinates].concat([endCoord]));
      } else {
        item.coordinates = this[_coordinates].slice();
      }
      // 补齐点（如先左击然后立即右击）
      this[_coordinates].slice(item.pointEntityIds.length).forEach(coordinate => {
        item.pointEntityIds.push(addPoint.call(this, coordinate));
        showMeasureValue && !isArea && item.labelEntityIds.push(addLabel.call(this, coordinate, this[_coordinates]));
      });
      const entity = this.getEntityByEntityId(item.entityId);
      if (isArea) {
        entity.polygon.outlineColor = opts.polygonOutlineColor;
        entity.polygon.material = opts.polygonMaterial;
        item.pointEntityIds.forEach(pointEntityId => {
          this.getEntityByEntityId(pointEntityId).point.color = opts.pointColor;
        });
        const labelEntity = this.getEntityByEntityId(item.labelEntityIds[0]);
        labelEntity && (labelEntity.label.fillColor = opts.pointColor);
      } else {
        entity.polyline.material = opts.polylineMaterial;
      }
      item.actived = false;
      this[_coordinates] = [];
      this[_editingMeasureId]++;
      isFunction(opts.finishedCallback) && opts.finishedCallback(this[_editingMeasureId], this.mode);
    } else {
      // 增加点
      this[_coordinates].slice(Math.min(this[_coordinates].length, item.pointEntityIds.length)).forEach(coordinate => {
        item.pointEntityIds.push(addPoint.call(this, coordinate));
        showMeasureValue && !isArea && item.labelEntityIds.splice(item.labelEntityIds.length - 2, 0, addLabel.call(this, coordinate, this[_coordinates]));
      });
      item.coordinates = this[_coordinates].concat([this[_mouseCoord]]);
    }
  }
}