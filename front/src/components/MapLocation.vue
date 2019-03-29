<template>
  <Modal v-model="visible"
    class-name="map-location-detail-modal"
    width="920"
    :closable="false"
    :mask-closable="false">
    <div slot="header">
      <span>定位</span>
      <Icon type="ios-close" @click="close"></Icon>
    </div>
    <div class="map-container"></div>
    <div slot="footer">
    </div>
  </Modal>
</template>
<script>
import MapTool from '@/lib/ol/mapTool';
export default {
  name: 'map-location',
  props: ['coordinateStr', 'type'],
  data(){
    return {};
  },
  computed: {
    visible(){
      return this.$store.state.modal.mapDetailVisible;
    }
  },
  watch: {
    visible(newVal, oldVal){
      newVal && this.$nextTick(this.init);
    }
  },
  created(){},
  mounted(){
  },
  methods: {
    init(){
      if(!this.mapTool){
        this.mapTool = new MapTool({
          isOnlyFirstFitToAllGeos: false,
          goHome: false,
          mousePosition: false,
          measure: false,
          polygon: false,
          showFenceArea: false,
          isShowBoundary: true
        });
        this.mapTool.init(this.$el.querySelector('.map-container'), 'googleSatellite');
      }
      if(this.coordinateStr){
        const [ dataType, iconType ] = this.type.split('_');
        const obj = {id: '1'};
        if(dataType === 'fence'){
          obj.fencePointData = this.coordinateStr;
          obj.enabled = true;
          obj.posCoordinateSystem = 1;
          this.mapTool.addFence(obj);
          this.mapTool.fitToCoords(this.mapTool.fences['1'].getCoordinates('EPSG:3857')[0], 'EPSG:3857');
        }else if(dataType === 'geoPoint'){
          const [ lng, lat ] = this.coordinateStr.split(',');
          obj.lng = lng;
          obj.lat = lat;
          switch(iconType){
            case 'monitor':
              obj.typeCode = 0;
              break;
            case 'danger1':
              obj.typeCode = 1;
              break;
            case 'danger2':
              obj.typeCode = 2;
              break;
            case 'store':
              obj.typeCode = 3;
              break;
            default:
              obj.typeCode = 1;
              break;
          }
          this.mapTool.loadGeos([obj]);
        }
      }
    },
    close(){
      this.$store.commit('modal/closeMapDetail');
      const dataType = this.type.split('_')[0];
      if(dataType === 'fence'){
        const fences = this.mapTool.fences;
        Object.keys(fences).forEach(id => {
          const fence = fences[id];
          fence.destroy();
        });
        this.mapTool.fences = {};
      }else if(dataType === 'geoPoint'){
        const geoPoints = this.mapTool.geoPoints;
        Object.keys(geoPoints).forEach(id => {
          const geoPoint = geoPoints[id];
          geoPoint.destroy();
        });
        this.mapTool.geoPoints = {};
      }
    }
  }
}
</script>
<style lang="less">
.map-location-detail-modal {
  .ivu-modal-header {
    font-size: 16px;
    border-top-left-radius: 18px;
    border-top-right-radius: 18px;
    .ivu-icon-ios-close {
      float: right;
      font-size: 24px;
      margin-top: -4px;
      cursor: pointer;
    }
  }
  .ivu-modal-content .ivu-modal-body{
    margin: 0;
  }
  .ivu-modal-content .ivu-modal-footer{
    padding: 0;
  }
  .map-container{
    height: 500px;
  }
}
</style>