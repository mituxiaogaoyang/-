/**
 * @authors remy
 * @creatTime 2019-04-27 13:59:52
 * @description 
 * @version 0.0.1
 */

// imagery icon
import _gaodeIcon from './image/preview_gaode.png'
import _googleIcon from './image/preview_google.png'
import _satelliteIcon from './image/preview_google_satellite.png'

export const imageryIcons = {
  gaode: _gaodeIcon,
  google: _googleIcon,
  googleSatellite: _satelliteIcon,
  arcGis: '', // _satelliteIcon,
  tiandi: '', // _satelliteIcon
};

// terrain icon
import _cesiumTerrainIcon from './image/preview_cesium.png'
import _defaultTerrainIcon from './image/preview_cesium.png'
import _customTerrainIcon from './image/preview_stk.png'
import _readymapTerrainIcon from './image/preview_cesium.png'

export const terrainIcons = {
  default: _defaultTerrainIcon,
  readymap: _readymapTerrainIcon,
  cesium: _cesiumTerrainIcon,
  custom: _customTerrainIcon
};

// marker icon
import _markerIcon from './image/map_point.png';
import _markerIcon_active from './image/map_point_01.png';

export const markerIcon = _markerIcon;
export const markerIcon_active = _markerIcon_active;

// point icon
import _pointIcon from './image/map_point.png';
import _gnssIcon from './image/point_gnss.png';
import _spIcon from './image/point_sp.png';
import _ylIcon from './image/point_yl.png';
import _gnssIcon_offline from './image/point_gnss_offline.png';
import _spIcon_offline from './image/point_sp_offline.png';
import _ylIcon_offline from './image/point_yl_offline.png';
import _gnssIcon_warning from './image/point_gnss_warning.png';
import _spIcon_warning from './image/point_sp_warning.png';
import _ylIcon_warning from './image/point_yl_warning.png';
import _warning_animation_icon from './image/warning_animation.png';
//rf
import _yhd from './image/yhd1.png';
import _yhd2 from './image/yhd2.png';
import _yhd3 from './image/yhd3.png';
import _camera from './image/camera.png';
import _camera2 from './image/camera2.png';
import _camera3 from './image/camera3.png';
import _gnss from './image/gnss.png';
import _gnss2 from './image/gnss2.png';
import _gnss3 from './image/gnss3.png';
import _yl from './image/yl.png';
import _yl2 from './image/yl2.png';
import _yl3 from './image/yl3.png';
import _lx from './image/lx.png';
import _lx2 from './image/lx2.png';
import _lx3 from './image/lx3.png';
import _broadcast from './image/broadcast.png';
import _broadcast2 from './image/broadcast2.png';
import _broadcast3 from './image/broadcast3.png';
import _monitor from './image/monitor.png';

export const warning_animation_icon = _warning_animation_icon;

export function getPointIcon(type, status) {//type 0-yhd 1-空监测点 2-yl 3-lx 4-gnss 98-广播 99-摄像头
    switch (Number(type)) {
        case 0:
            return status === 'offline' ? _yhd3 : status === 'warning' ? _yhd2 : _yhd;
        case 1:
            return _monitor;
        case 2:
            return status === 'offline' ? _yl3 : status === 'warning' ? _yl2 : _yl;
        case 3:
            return status === 'offline' ? _lx3 : status === 'warning' ? _lx2 : _lx;
        case 4:
            return status === 'offline' ? _gnss3 : status === 'warning' ? _gnss2 : _gnss;
        case 5:
            return status === 'offline' ? _gnss3 : status === 'warning' ? _gnss2 : _gnss;
        case 98:
            return status === 'offline' ? _camera3 : status === 'warning' ? _broadcast2 : _broadcast;  
        case 99:
            return status === 'offline' ? _camera3 : status === 'warning' ? _camera2 : _camera;  
    }
}