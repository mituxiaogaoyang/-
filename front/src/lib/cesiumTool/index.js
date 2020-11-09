/**
 * @authors remy
 * @creatTime 2019-04-27 13:06:22 v2.0.0
 * @description 依赖于Cesium1.55重构cesiumTool库，引入Symbol属性名以为了避免开发者误操作属性，引入get方法获取属性避免误操作篡改属性，仅存储entity、datasource、tileset等Cesium实例的id
 * @version 2.1.0
 * @updateTime 2019-08-07 10:00:00 v2.1.0 问题：point位置正常贴地，但infoWindow信息浮框位置不正确。解决方案：近似贴地+精确贴地。①通过设置Cesium.HeightReference.CLAMP_TO_GROUND属性近似贴地,此方法官方即将废弃;②通过Cesium.sampleTerrainMostDetailed方法设置高度精确贴地
 */
import { isObject, isString, isFunction, isDom, isEmpty, isArray, isNumber } from './util/type.js';
import { wgs84togcj02, gcj02towgs84 } from './util/coordTransform.js';
import {
  getCoordinate,
  getModelCoordinate,
  getDistance,
  checkCoordinate,
  checkCoordinates,
  getHeightfromCartesian3,
  getCoordinateFromCartesian3,
  getDomSize
} from './common.js';
import { coordinateSystemMap, getImagerys } from './imagery.js';
import getTerrains from './terrain.js';

import Measure from './measure.js';
import Point from './point.js';
import Marker from './marker.js';
import Polyline from './polyline.js';
import Polygon from './polygon.js';
import Insar from './insar.js';
import Model from './model.js';
import Tileset from './tileset.js';
import Label from './label.js'

const _options = Symbol('options'),
  _viewer = Symbol('viewer'),
  _measure = Symbol('measure'),
  _label = Symbol('label'),
  _labels = Symbol('labels'),
  _points = Symbol('points'),
  _markers = Symbol('markers'),
  _polylines = Symbol('polylines'),
  _polygons = Symbol('polygons'),
  _insars = Symbol('insars'),
  _models = Symbol('models'),
  _tilesets = Symbol('tilesets'),
  _infoWindowTarget = Symbol('infoWindowTarget');

function loop() {}

const defaultOptions = {
  // Cesium.Viewer()参数
  animation: false, // 时钟
  baseLayerPicker: true,
  fullScreenButton: true,
  fullscreenElement: document.body, // Element | id
  vrButton: false,
  geocoder: false,
  homeButton: false,
  infoBox: false,
  sceneModePicker: false,
  selectionIndicator: false,
  timeline: false, // 时间轴
  navigationHelpButton: false,
  navigationInstructionsInitiallyVisible: true,
  scene3DOnly: false,
  useDefaultRenderLoop: true,
  showRenderLoopErrors: false,
  automaticallyTrackDataSourceClocks: true,
  orderIndependentTranslucency: true,
  shadows: false,
  projectionPicker: false,
  // 自定义参数
  defaultHome: null, // Object 默认相机home位置，包括经纬度高程旋转角度即camera.flyTo的参数
  coordinateSystem: 'wgs84', // 由影像imagery决定
  imagerys: ['googleSatellite'],
  customImageryUrl: null, // String 自定义发布的影像地址
  customImageryCoordinateSystem: null, // String 自定义发布的影像的坐标系
  terrains: ['readymap'],
  customTerrainUrl: null, // String 自定义发布的地形地址
  activedImagery: 'googleSatellite',
  activedTerrain: 'readymap',
  additionalImagerys: null, // Array 附加的在activedImagery图层之上的图层
  hasPointAnimation: false, // 预警动效
  infoWindows: null, // Object{top:0,left:0,element} 各种feature的信息浮框，feature的类型作为key(point,polyline等)
  selectedCallback: loop,
  moveCallback: loop,
  cameraChangedCallback: loop
};

export default class CesiumTool {
  [_options] = null;
  [_viewer] = null;
  [_measure] = null; // 测量类的实例
  [_label] = null; // 标注类的实例
  [_points] = {};
  [_markers] = {};
  [_polylines] = {};
  [_polygons] = {};
  [_insars] = {};
  [_models] = {}; // gltf单体模型
  [_tilesets] = {}; // 3dTiles模型
  [_infoWindowTarget] = null; // Array point,marker,polyline,polygon等的实例
  [_labels] = {} 

  constructor(container, options) {
    if (!window.Cesium) {
      throw new Error('缺少Cesium库');
    }
    this[_options] = Object.assign({}, defaultOptions, isObject(options) ? options : {});
    const { imagerys, customImageryUrl, customImageryCoordinateSystem, terrains, customTerrainUrl } = this[_options];
    const { imageryProviders, imageryProviderViewModels } = getImagerys(imagerys, customImageryUrl, customImageryCoordinateSystem);
    const { terrainProviders, terrainProviderViewModels } = getTerrains(terrains, customTerrainUrl);
    this[_options].imageryProviders = imageryProviders;
    this[_options].imageryProviderViewModels = imageryProviderViewModels;
    this[_options].terrainProviders = terrainProviders;
    this[_options].terrainProviderViewModels = terrainProviderViewModels;
    this[_options].coordinateSystem = coordinateSystemMap[this[_options].activedImagery];
    this[_viewer] = initGlobal.call(this, container, this[_options]);
    this[_measure] = new Measure(this[_viewer], isObject(this[_options].measureOpts) ? this[_options].measureOpts : {});
    this[_label] = new Label(this[_viewer], {})
  }

  get coordinateSystem() {
    return this[_options].coordinateSystem;
  }
  get viewer() {
    return this[_viewer];
  }
  get measure() {
    return this[_measure];
  }
  get label() {
    return this[_label];
  }
  get points() {
    return this[_points];
  }
  get markers() {
    return this[_markers];
  }
  get labels() {
    return this[_labels];
  }
  get polylines() {
    return this[_polylines];
  }
  get polygons() {
    return this[_polygons];
  }
  get insars() {
    return this[_insars];
  }
  get models() {
    return this[_models];
  }
  get tilesets() {
    return this[_tilesets];
  }
  set infoWindowTarget(target) {
    this[_infoWindowTarget] = target;
  }

  setImagery(name) {
    const options = this[_options],
      viewer = this.viewer;
    if (options.imagerys.includes(name)) {
      viewer.imageryLayers.removeAll();
      viewer.imageryLayers.addImageryProvider(options.imageryProviders[name]);
      options.activedImagery = name;
      // add附加图层
      addAdditionalImagerys(viewer, options);
    }
  }
  setTerrain(name) {
    const options = this[_options],
      viewer = this.viewer;
    if (options.terrains.includes(name)) {
      viewer.terrainProvider = options.terrainProviders[name];
      options.activedTerrain = name;
    }
  }
  openShadows() {
    this.viewer.shadows = true;
  }
  closeShadows() {
    this.viewer.shadows = false;
  }
  // 设置大气的属性brightnessShift亮度偏移，hueShift色调偏移，saturationShift饱和度偏移
  setSkyAtmospere(field, value) {
    this.viewer.scene.skyAtmosphere.show = true;
    if (field == 'brightnessShift' || field == 'hueShift' || field == 'saturationShift') {
      if (!isNumber(value)) value = 0;
      if (value < -1) value = -1;
      if (value > 1) value = 1;
      this.viewer.scene.skyAtmosphere[field] = value;
    }
  }
  closeSkyAtmospere() {
    this.viewer.scene.skyAtmosphere.show = false;
  }
  // 通过屏幕像素位置获取坐标 position: { x, y }
  getCoordinateFromPixel(position) {
    return getCoordinate(this.viewer, position);
  }
  // 通过屏幕像素位置获取模型上的坐标 position: { x, y }
  getModelCoordinateFromPixel(position) {
    return getModelCoordinate(this.viewer, position);
  }
  // 将wgs84坐标转换成cartesian3坐标
  getCoordinateFromCartesian3(cartesian3, type){
    return getCoordinateFromCartesian3(this.viewer, cartesian3, type);
  }
  // 将cartesian3坐标转换成wgs84坐标
  fromCartesian3ToWGS84(cartesian3) {
    if (cartesian3 instanceof Cesium.Cartesian3) {
      const ellipsoid = this.viewer.scene.globe.ellipsoid;
      const cartographic = ellipsoid.cartesianToCartographic(cartesian3);

      const lat = Cesium.Math.toDegrees(cartographic.latitude),
        lng = Cesium.Math.toDegrees(cartographic.longitude),
        alt = cartographic.height;
      return [lng, lat, alt];
    } else {
      throw new Error('fromCartesian3ToWGS84()入参必须是Cesium.Cartesian3的实例');
    }
  }
  // 相机视角：相机水平旋转角度headingAngle、相机垂直旋转角度pitchAngle
  setCameraView({ headingAngle, pitchAngle }) {
    let { heading, pitch } = this.viewer.camera;
    if (isNumber(headingAngle)) {
      heading = Cesium.Math.toRadians(headingAngle);
    }
    if (isNumber(pitchAngle) && pitchAngle >= -90 && pitchAngle <= 0) {
      pitch = Cesium.Math.toRadians(pitchAngle);
    }
    this.viewer.camera.setView({
      destination: this.viewer.camera.position,
      orientation: {
        heading: heading, // 相机水平旋转角度
        pitch: pitch, // 相机垂直旋转角度
        roll: 0
      }
    });
  }  
  // arg coordinate{Array} / obj{Object}
  cameraFlyTo(arg) {
    let opts = {};
    if (isArray(arg)) {
      opts.destination = Cesium.Cartesian3.fromDegrees(arg[0], arg[1], arg[2] || 0);
    } else if (isObject(arg) && arg.lng && arg.lat) {
      opts.destination = Cesium.Cartesian3.fromDegrees(arg.lng, arg.lat, arg.height || 0);
      if (!arg.orientation) {
        arg.orientation = {
          heading: Cesium.Math.toRadians(arg.headingDeg || 35), // 水平旋转
          pitch: Cesium.Math.toRadians(arg.pitchDeg || -30), // 上下旋转
          roll: 0
        };
      }
      opts.orientation = arg.orientation;
      if (isNumber(arg.duration)) opts.duration = arg.duration;
      if (isFunction(arg.complete)) opts.complete = arg.complete.bind(this);
      if (isFunction(arg.cancel)) opts.cancel = arg.cancel.bind(this);
    } else if (arg === 'home' && this[_options].defaultHome) {
      opts = this[_options].defaultHome;
    }
    opts && this.viewer.camera.flyTo(opts);
  }
  setHome(arg) {
    if (isObject(arg) && arg.lng && arg.lat) {
      const opts = {};
      opts.destination = Cesium.Cartesian3.fromDegrees(arg.lng, arg.lat, arg.height || 0);
      if (!arg.orientation && arg.headingDeg && arg.pitchDeg) {
        arg.orientation = {
          heading: Cesium.Math.toRadians(arg.headingDeg || 35), // 水平旋转
          pitch: Cesium.Math.toRadians(arg.pitchDeg || -30), // 上下旋转
          roll: 0
        };
      }
      opts.orientation = arg.orientation;
      if (isNumber(arg.duration)) opts.duration = arg.duration;
      this[_options].defaultHome = opts;
      this.cameraFlyTo('home');
    }
  }
  goHome() {
    this.cameraFlyTo('home');
  }
  // point 默认贴地
  // data: { id, coordinate: [lng, lat, alt], type, status, labelContent }
  addPoint(data, opts) {
    if (isObject(data)) {
      !isObject(opts) && (opts = {});
      let point = this.points[data.id];
      if (!point) {
        // 新建的点
        point = new Point(this.viewer, data, Object.assign({}, opts, {
          hasAnimation: this[_options].hasPointAnimation
        }, {
          hasAnimation: data.hasAnimation
        }));
        this.points[point.id] = point;
      } else {
        // 更新点
        point.update(data);
      }
    }
  }
  loadPoints(array, opts) {
    if (isArray(array)) {
      !isObject(opts) && (opts = {});
      const ids = Object.keys(this.points); // 已存在的点
      array.forEach(itemData => {
        this.addPoint(itemData, Object.assign({}, opts));
        // 已存在则将其从ids中移除
        ids.splice(ids.findIndex(id => id === itemData.id), 1);
      });
      // 删除array中已不在的点----需根据具体义务决定是否删除
      ids.forEach(id => this.removePointById(id));
    }
  }
  removePointById(id) {
    const point = this.points[id];
    if (point) {
      point.destroy();
      delete this.points[id];
    }
  }
  removeAllPoints() {
    Object.keys(this.points).forEach(id => this.removePointById(id));
  }
  // marker 默认贴地
  // data: { id, coordinate: [lng, lat, alt], actived, labelContent }
  addMarker(data, opts) {
    if (isObject(data)) {
      !isObject(opts) && (opts = {});
      let marker = this.markers[data.id];
      if (!marker) {
        // 新建的标注
        marker = new Marker(this.viewer, data, Object.assign({}, opts));
        this.markers[marker.id] = marker;
      } else {
        // 更新标注
        marker.update(data);
      }
    }
  }
  loadMarkers(array, opts) {
    if (isArray(array)) {
      !isObject(opts) && (opts = {});
      const ids = Object.keys(this.markers); // 已存在的标注
      array.forEach(itemData => {
        this.addMarker(itemData, Object.assign({}, opts));
        // 已存在则将其从ids中移除
        ids.splice(ids.findIndex(id => id === itemData.id), 1);
      });
      // 删除array中已不在的标注----需根据具体义务决定是否删除
      ids.forEach(id => this.removeMarkerById(id));
    }
  }
  removeMarkerById(id) {
    const marker = this.markers[id];
    if (marker) {
      marker.destroy();
      delete this.markers[id];
    }
  }
  removeAllMarkers() {
    Object.keys(this.markers).forEach(id => this.removeMarkerById(id));
  }
  //labels  rf
  addLabel(data,opts){
    if (isObject(data)){
      !isObject(opts) && (opts = {color:'rgba(243, 152, 0, 0.5)'})
      let label = this.labels[data.id]
      if (!label) {
        if(data.type==='marker'){
          label = new Marker(this.viewer, data, Object.assign({}, opts))
          label.entity.__type = 'label_marker'
          label.entity.__labelId = data.id
        }else if(data.type==='polyline'){
          label = new Polyline(this.viewer, {...data,coordinates:data.coordinates.flat()}, Object.assign({}, opts))
          label.entity.__type = 'label_polyline'
          label.entity.__labelId = data.id
        }else if(data.type==='polygon'){
          label = new Polygon(this.viewer, {...data,coordinates:data.coordinates.flat()}, Object.assign({}, opts))
          label.entity.__type = 'label_polygon';
          label.entity.__labelId = data.id
        }
        this.labels[label.id] = label
      }
    }
  }
  removeLabelById(id) {
    const label = this.labels[id]
    if (label) {
      label.destroy()
      delete this.labels[id];
    }
  }
  // polyline 默认贴地
  // data: { id, coordinates: [lng, lat, alt, lng, lat, alt, ...], actived, labelContent }
  addPolyline(data, opts) {
    if (isObject(data)) {
      !isObject(opts) && (opts = {});
      let polyline = this.polylines[data.id];
      if (!polyline) {
        // 新建的线
        polyline = new Polyline(this.viewer, data, Object.assign({}, opts));
        this.polylines[polyline.id] = polyline;
      } else {
        // 更新线
        polyline.update(data);
      }
    }
  }
  loadPolylines(array, opts) {
    if (isArray(array)) {
      !isObject(opts) && (opts = {});
      const ids = Object.keys(this.polylines); // 已存在的线
      array.forEach(itemData => {
        this.addPolyline(itemData, Object.assign({}, opts));
        // 已存在则将其从ids中移除
        ids.splice(ids.findIndex(id => id === itemData.id), 1);
      });
      // 删除array中已不在的线----需根据具体义务决定是否删除
      ids.forEach(id => this.removePolylineById(id));
    }
  }
  removePolylineById(id) {
    const polyline = this.polylines[id];
    if (polyline) {
      polyline.destroy();
      delete this.polylines[id];
    }
  }
  removeAllPolylines() {
    Object.keys(this.polylines).forEach(id => this.removePolylineById(id));
  }
  // polygon 默认贴地
  // data: { id, coordinate: [lng, lat, alt, lng, lat, alt, ...], actived, labelContent }
  addPolygon(data, opts) {
    if (isObject(data)) {
      !isObject(opts) && (opts = {});
      let polygon = this.polygons[data.id];
      if (!polygon) {
        // 新建的面
        polygon = new Polygon(this.viewer, data, Object.assign({}, opts));
        this.polygons[polygon.id] = polygon;
      } else {
        // 更新面
        polygon.update(data);
      }
    }
  }
  loadPolygons(array, opts) {
    if (isArray(array)) {
      !isObject(opts) && (opts = {});
      const ids = Object.keys(this.polygons); // 已存在的面
      array.forEach(itemData => {
        this.addPolygon(itemData, Object.assign({}, opts));
        // 已存在则将其从ids中移除
        ids.splice(ids.findIndex(id => id === itemData.id), 1);
      });
      // 删除array中已不在的面----需根据具体义务决定是否删除
      ids.forEach(id => this.removePolygonById(id));
    }
  }
  removePolygonById(id) {
    const polygon = this.polygons[id];
    if (polygon) {
      polygon.destroy();
      delete this.polygons[id];
    }
  }
  removeAllPolygons() {
    Object.keys(this.polygons).forEach(id => this.removePolygonById(id));
  }
  // insar
  // data: { url }
  addInsar(data, opts) {
    if (isObject(data)) {
      !isObject(opts) && (opts = {});
      let insar = this.insars[data.url];
      if (!insar) {
        // 新建的insar
        insar = new Insar(this.viewer, data, Object.assign({}, opts));
        this.insars[insar.id] = insar;
      }
    }
  }
  loadInsars(array, opts) {
    if (isArray(array)) {
      !isObject(opts) && (opts = {});
      const ids = Object.keys(this.insars); // 已存在的insar
      array.forEach(itemData => {
        this.addInsar(itemData, Object.assign({}, opts));
        // 已存在则将其从ids中移除
        ids.splice(ids.findIndex(id => id === itemData.url), 1);
      });
      // 删除array中已不在的insar----需根据具体义务决定是否删除
      ids.forEach(id => this.removeInsarById(id));
    }
  }
  removeInsarById(id) {
    const insar = this.insars[id];
    if (insar) {
      insar.destroy();
      delete this.insars[id];
    }
  }
  removeAllInsars() {
    Object.keys(this.insars).forEach(id => this.removeInsarById(id));
  }
  // model
  // data: { id, url, coordinate, labelContent }
  addModel(data, opts) {
    if (isObject(data)) {
      !isObject(opts) && (opts = {});
      let model = this.models[data.id];
      if (!model) {
        // 新建的model
        model = new Model(this.viewer, data, Object.assign({}, opts));
        this.models[model.id] = model;
      }
    }
  }
  loadModels(array, opts) {
    if (isArray(array)) {
      !isObject(opts) && (opts = {});
      const ids = Object.keys(this.models); // 已存在的model
      array.forEach(itemData => {
        this.addModel(itemData, Object.assign({}, opts));
        // 已存在则将其从ids中移除
        ids.splice(ids.findIndex(id => id === itemData.id), 1);
      });
      // 删除array中已不在的model----需根据具体义务决定是否删除
      ids.forEach(id => this.removeModelById(id));
    }
  }
  removeModelById(id) {
    const model = this.models[id];
    if (model) {
      model.destroy();
      delete this.models[id];
    }
  }
  removeAllModels() {
    Object.keys(this.models).forEach(id => this.removeModelById(id));
  }
  // tileset
  // data: { url }
  addTileset(data, opts) {
    if (isObject(data)) {
      !isObject(opts) && (opts = {});
      let tileset = this.tilesets[data.url];
      if (!tileset) {
        // 新建的tileset
        tileset = new Tileset(this.viewer, data, Object.assign({}, opts));
        this.tilesets[tileset.id] = tileset;
      }
    }
  }
  loadTilesets(array, opts) {
    if (isArray(array)) {
      !isObject(opts) && (opts = {});
      const ids = Object.keys(this.tilesets); // 已存在的tileset
      array.forEach(itemData => {
        this.addTileset(itemData, Object.assign({}, opts));
        // 已存在则将其从ids中移除
        ids.splice(ids.findIndex(id => id === itemData.url), 1);
      });
      // 删除array中已不在的tileset----需根据具体义务决定是否删除
      ids.forEach(id => this.removeTilesetById(id));
    }
  }
  removeTilesetById(id) {
    const tileset = this.tilesets[id];
    if (tileset) {
      tileset.destroy();
      delete this.tilesets[id];
    }
  }
  removeAllTilesets() {
    Object.keys(this.tilesets).forEach(id => this.removeTilesetById(id));
  }
  // 清空所有
  clearAll() {
    this.removeAllPoints();
    this.removeAllMarkers();
    this.removeAllPolylines();
    this.removeAllPolygons();
    this.removeAllInsars();
    this.removeAllModels();
    this.removeAllTilesets();
  }
  // 所有（point,marker,polyline,polygon）贴地
  clampToGround() {
    Object.values(this.points).forEach(point => point.clampToGround());
    Object.values(this.markers).forEach(marker => marker.clampToGround());
    Object.values(this.polylines).forEach(polyline => polyline.clampToGround());
    Object.values(this.polygons).forEach(polygon => polygon.clampToGround());
  }

  static wgs84togcj02(lng, lat) {
    return wgs84togcj02(lng, lat);
  }

  static gcj02towgs84(lng, lat) {
    return gcj02towgs84(lng, lat);
  }

  static getDistance(startCoord, endCoord) {
    return getDistance(startCoord, endCoord);
  }
}

/*
 * @param container { Element, String(dom元素id) }
 */
function initGlobal(container, options) {
  let element = null;
  if (isDom(container)) {
    element = container;
  }
  if (isString(container)) {
    element = document.getElementById(container);
  }
  if (!element) {
    throw new Error('CesiumTool.constructor(container, options)的container无效');
  }
  if (isEmpty(options.imageryProviders)) {
    throw new Error('initGlobal()无可用的影像');
  }
  if (isEmpty(options.terrainProviders)) {
    throw new Error('initGlobal()无可用的地形');
  }

  const viewer = new Cesium.Viewer(container, {
    animation: options.animation,
    baseLayerPicker: options.baseLayerPicker,
    fullScreenButton: options.fullScreenButton,
    fullscreenElement: options.fullscreenElement,
    vrButton: options.vrButton,
    geocoder: options.geocoder,
    homeButton: options.homeButton,
    infoBox: options.infoBox,
    sceneModePicker: options.sceneModePicker,
    selectionIndicator: options.selectionIndicator,
    timeline: options.timeline,
    navigationHelpButton: options.navigationHelpButton,
    navigationInstructionsInitiallyVisible: options.navigationInstructionsInitiallyVisible,
    scene3DOnly: options.scene3DOnly,
    useDefaultRenderLoop: options.useDefaultRenderLoop,
    showRenderLoopErrors: options.showRenderLoopErrors,
    automaticallyTrackDataSourceClocks: options.automaticallyTrackDataSourceClocks,
    orderIndependentTranslucency: options.orderIndependentTranslucency,
    shadows: options.shadows,
    projectionPicker: options.projectionPicker,
    // imageryProviderViewModels、terrainProviderViewModels仅当baseLayerpicker为true时有效
    imageryProviderViewModels: Object.values(options.imageryProviderViewModels),
    selectedImageryProviderViewModel: options.imageryProviderViewModels[options.activedImagery],
    terrainProviderViewModels: Object.values(options.terrainProviderViewModels),
    selectedTerrainProviderViewModel: options.terrainProviderViewModels[options.activedTerrain],
    // imageryProvider、terrainProvider仅当baseLayerpicker为false时有效
    imageryProvider: options.imageryProviders[options.activedImagery],
    terrainProvider: options.terrainProviders[options.activedTerrain]
  });

  // add附加图层
  addAdditionalImagerys(viewer, options);

  // 开启全局地形深度检测
  viewer.scene.globe.depthTestAgainstTerrain = true;

  // 删除默认的工具栏
  var defaultToolbar = document.querySelector('.cesium-viewer-toolbar');
  defaultToolbar.parentNode.removeChild(defaultToolbar);

  // 添加屏幕监听器
  addScreenListener(viewer, options);

  // 处理trackedEntityChanged事件
  viewer.trackedEntityChanged.addEventListener(() => {
    viewer.trackedEntity = null;
  });

  // 处理相机changed事件
  viewer.camera.changed.addEventListener(() => {
    const { heading, pitch } = viewer.camera;
    const cameraHeading = Cesium.Math.toDegrees(heading);
    const cameraPitch = Cesium.Math.toDegrees(pitch);
    if (isFunction(options.cameraChangedCallback)) {
      options.cameraChangedCallback(cameraHeading, cameraPitch);
    }
  });

  // 处理场景postRender事件
  viewer.scene.postRender.addEventListener(e => {
    updateInfoWindowPosition.call(this, viewer, options);
  });

  return viewer;
}

// 监听屏幕事件
function addScreenListener(viewer, options) {
  const { selectedCallback, moveCallback } = options;
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
  // 监听点击选中事件
  handler.setInputAction(event => {
    const coordinate = getModelCoordinate(viewer, event.position);
    if (Cesium.defined(coordinate)) {
      const pick = viewer.scene.pick(event.position);
      if (Cesium.defined(pick) && ((pick.id || pick.primitive).__type ||pick.primitive.appearance.material.type)) { //rf
        const selected = pick.id || pick.primitive;
        isFunction(selectedCallback) && selectedCallback(selected, coordinate);
      } else {
        isFunction(selectedCallback) && selectedCallback(null, coordinate);
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  // 监听鼠标移动事件
  handler.setInputAction(event => {
    const coordinate = getModelCoordinate(viewer, event.endPosition);
    if (Cesium.defined(coordinate)) {
      //rf
      const pick = viewer.scene.pick(event.endPosition);
      if (Cesium.defined(pick) && (pick.id || pick.primitive).__type) {
        const selected = pick.id || pick.primitive;
        isFunction(moveCallback) && moveCallback(selected, coordinate);
      } else {
        isFunction(moveCallback) && moveCallback(null, coordinate);
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

// add附加的图层
function addAdditionalImagerys(viewer, options) {
  const additionalImagerys = options.additionalImagerys;
  if (isArray(additionalImagerys)) {
    try {
      additionalImagerys.forEach(imageryProvider => {
        viewer.imageryLayers.addImageryProvider(imageryProvider);
      });
    } catch (error) {
      throw new Error('附加图层additionalImagerys异常');
    }
  }
}

// infoWindow信息浮框位置实时更新
function updateInfoWindowPosition(viewer, options) {
  const target = this[_infoWindowTarget],
    now = Cesium.JulianDate.now();
  if (target && target.id === null) {
    this[_infoWindowTarget] = null;
    return;
  }
  let cartesian3 = null,
    type = ''; 
  switch (true) {
    case target instanceof Point:
      type = 'point';
      cartesian3 = target.entity.position.getValue(now);
      type += '_' + target.data.type;
      break;
    case target instanceof Marker:
      type = 'marker';
      cartesian3 = target.entity.position.getValue(now);
      break;
    case target instanceof Polyline:
      type = 'polyline';
      cartesian3 = target.entity.position.getValue(now);
      break;
    case target instanceof Polygon:
      type = 'polygon';
      cartesian3 = target.entity.position.getValue(now);
      break;
    case target instanceof Insar:
      break;
    case target instanceof Model:
      type = 'model';
      cartesian3 = target.entity.position.getValue(now);
      break;
    case target && target.__type.indexOf('label') === 0:
      type = 'label' //target.__type;
      cartesian3 = target.position.getValue(now);
      break;
    case target && target.__type.indexOf('measure_') === 0:
        type = 'label' //target.__type;
        cartesian3 = target.position.getValue(now);
        break;
    case target instanceof Tileset:
      break;
  }
  if (cartesian3 && type) {
    const xy = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, cartesian3);
    Object.keys(options.infoWindows).map(key => {
      const obj = options.infoWindows[key];
      obj.element.style.visibility = 'hidden';
      return key;
    }).find(key => {
      const obj = options.infoWindows[key];
      obj.element.style.visibility = key === type ? 'visible' : 'hidden';
      return key === type;
    });
    const temp = options.infoWindows[type];
    const { width, height } = getDomSize(temp.element);
    temp.element.style.top = Math.round(xy.y - height - (temp.offsetY||0)) + 'px';
    temp.element.style.left = Math.round(xy.x - width/2 - (temp.offsetX||0)) + 'px';
  } else {
    isObject(options.infoWindows) && Object.keys(options.infoWindows).forEach(key => {
      const obj = options.infoWindows[key];
      isDom(obj.element) && (obj.element.style.visibility = 'hidden');
    });
  }
}
