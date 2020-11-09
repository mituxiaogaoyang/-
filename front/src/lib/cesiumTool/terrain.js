/**
 * @authors remy
 * @creatTime 2019-04-15 11:36:07
 * @description 
 * @version 0.0.1
 */

import { terrainIcons } from './icon.js';

const isProd = process.env.NODE_ENV === 'production';

// 获取地貌providers、providerViewModels
export default function getTerrains(array, customUrl) {
  const terrainProviders = {},
    terrainProviderViewModels = {};
  array.forEach(item => {
    switch (item) {
      case 'default':
        // 默认球体，无地形
        const defaultTerrain = new Cesium.EllipsoidTerrainProvider();
        const defaultViewModel = new Cesium.ProviderViewModel({
          name: 'default',
          tooltip: '',
          iconUrl: terrainIcons.default,
          creationFunction() {
            return defaultTerrain;
          }
        });
        terrainProviders.default = defaultTerrain;
        terrainProviderViewModels.default = defaultViewModel;
        break;
      case 'readymap':
        // readymap地形
        const readymapTerrain = new Cesium.VRTheWorldTerrainProvider({
          url: 'http://readymap.org/readymap/tiles/1.0.0/9/'
        });
        const readymapViewModel = new Cesium.ProviderViewModel({
          name: 'readymap',
          tooltip: '',
          iconUrl: terrainIcons.readymap,
          creationFunction() {
            return readymapTerrain;
          }
        });
        terrainProviders.readymap = readymapTerrain;
        terrainProviderViewModels.readymap = readymapViewModel;
        break;
      case 'cesium':
        // cesium地形
        Cesium.Ion.defaultAccessToken = '';
        const cesiumTerrain = Cesium.createWorldTerrain({
          requestWaterMask: true,
          requestVertexNormals: true
        });
        const cesiumViewModel = new Cesium.ProviderViewModel({
          name: 'cesium',
          tooltip: '',
          iconUrl: terrainIcons.cesium,
          creationFunction() {
            return cesiumTerrain;
          }
        });
        terrainProviders.cesium = cesiumTerrain;
        terrainProviderViewModels.cesium = cesiumViewModel;
        break;
      case 'custom':
        // 自定义发布的地形
        if (customUrl) {
          const customTerrain = new Cesium.CesiumTerrainProvider({
            url: customUrl
          });
          const customViewModel = new Cesium.ProviderViewModel({
            name: 'custom',
            tooltip: '',
            iconUrl: terrainIcons.custom,
            creationFunction() {
              return customTerrain;
            }
          });
          terrainProviders.custom = customTerrain;
          terrainProviderViewModels.custom = customViewModel;
        }
        break;
    }
  });
  return { terrainProviders, terrainProviderViewModels };
  // stk地形官方已弃用
  // const stkWorldTerrain = new Cesium.CesiumTerrainProvider({
  //   url: 'https://assets.agi.com/stk-terrain/v1/tilesets/world/tiles',
  //   requestWaterMask: true,
  //   requestVertexNormals: true
  // });
}
