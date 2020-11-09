/**
 * @authors remy
 * @creatTime 2019-04-15 11:35:35
 * @description 
 * @version 0.0.1
 */

import { imageryIcons } from './icon.js';

export const coordinateSystemMap = {};

// 获取影像providers、providerViewModels
export function getImagerys(array, customUrl, customCoordinateSystem) {
  const imageryProviders = {},
    imageryProviderViewModels = {};
  array.forEach(item => {
    switch (item) {
      case 'gaode':
        // 高德地图
        const gaodeImagery = new Cesium.UrlTemplateImageryProvider({
          url: 'http://webst{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}',
          // proxy: new Cesium.DefaultProxy('/proxy/'),
          subdomains: ['01', '02', '03', '04'],
          credit: new Cesium.Credit('高德地图')
        });
        const gaodeViewModel = new Cesium.ProviderViewModel({
          name: '高德地图',
          tooltip: '',
          iconUrl: imageryIcons.gaode,
          creationFunction() {
            return [gaodeImagery];
          }
        });
        imageryProviders.gaode = gaodeImagery;
        imageryProviderViewModels.gaode = gaodeViewModel;
        coordinateSystemMap.gaode = 'wgs84';
        break;
      case 'google':
        // 谷歌地图
        const googleImagery = new Cesium.UrlTemplateImageryProvider({
          url: 'http://www.google.cn/maps/vt/pb=!1m4!1m3!1i{z}!2i{x}!3i{y}!2m3!1e0!2sm!3i345013117!3m8!2szh-CN!3scn!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0',
          credit: new Cesium.Credit('谷歌地图')
        });
        const googleViewModel = new Cesium.ProviderViewModel({
          name: '谷歌地图',
          tooltip: '',
          iconUrl: imageryIcons.google,
          creationFunction() {
            return [googleImagery];
          }
        });
        imageryProviders.google = googleImagery;
        imageryProviderViewModels.google = googleViewModel;
        coordinateSystemMap.google = 'wgs84';
        break;
      case 'arcGis':
        // arcGis卫星图
        const arcGisImagery = new Cesium.ArcGisMapServerImageryProvider({
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
        });
        imageryProviders.arcGis = arcGisImagery;
        coordinateSystemMap.arcGis = 'wgs84';
        break;
      case 'tianditu':
        // 天地图卫星图
        const tiandituImagery = new Cesium.WebMapTileServiceImageryProvider({
          // url: 'http://t0.tianditu.com/img_w/wmts?',
          url: 'http://{s}.tianditu.com/img_w/wmts?service=WMTS&version=1.0.0&request=GetTile&tilematrix={TileMatrix}&layer=img&style=default&tilerow={TileRow}&tilecol={TileCol}&tilematrixset=w&format=tiles',
          layer: 'img',
          style: 'default',
          format: 'tiles',
          tileMatrixSetID: 'w',
          subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
          credit: new Cesium.Credit('天地图全球影像服务'),
          maximumLevel: 18
        });
        imageryProviders.tianditu = tiandituImagery;
        coordinateSystemMap.tianditu = 'wgs84';
        break;
      case 'googleSatellite':
        // 谷歌卫星图
        // lyrs: 图层类型；hl: 标签的字体；gl=cn国内（未加偏）；m: 路线图；t: 地形图；p: 带标签的地形图；s: 卫星图；y: 带标签的卫星图；h: 标签层（路名、地名等）
        const googleSatelliteImagery = new Cesium.UrlTemplateImageryProvider({
          url: 'http://www.google.cn/maps/vt/lyrs=y&hl=en-US&gl=US&x={x}&y={y}&z={z}&s=G',
          // url: 'http://www.google.cn/maps/vt?lyrs=y@740&gl=cn&x={x}&y={y}&z={z}',
          credit: new Cesium.Credit('卫星地图')
        });
        const googleSatelliteViewModel = new Cesium.ProviderViewModel({
          name: '谷歌卫星地图',
          tooltip: '',
          iconUrl: imageryIcons.googleSatellite,
          creationFunction() {
            return [googleSatelliteImagery];
          }
        });
        imageryProviders.googleSatellite = googleSatelliteImagery;
        imageryProviderViewModels.googleSatellite = googleSatelliteViewModel;
        coordinateSystemMap.googleSatellite = 'wgs84';
        break;
      case 'custom':
        if (customUrl) {
          // 自定义发布的影像
          const customImagery = new Cesium.UrlTemplateImageryProvider({
            url: customUrl,
            credit: new Cesium.Credit('地图')
          });
          const customViewModel = new Cesium.ProviderViewModel({
            name: '地图',
            tooltip: '',
            iconUrl: imageryIcons.custom,
            creationFunction() {
              return [customImagery];
            }
          });
          imageryProviders.custom = customImagery;
          imageryProviderViewModels.custom = customViewModel;
          coordinateSystemMap.custom = customCoordinateSystem || 'wgs84';
        }
        break;
    }
  });
  return { imageryProviders, imageryProviderViewModels };
}
