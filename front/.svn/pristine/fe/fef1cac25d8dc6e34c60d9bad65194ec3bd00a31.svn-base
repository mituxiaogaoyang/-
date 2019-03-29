<template>
  <detail-modal title="标注点详情" @cancel="close">
    <div class="mark-detail">
      <Form :label-width="80">
        <FormItem label="标注名称">
          <span>{{flagName}}</span>
        </FormItem>
        <FormItem label="描述">
          <span>{{flagDes}}</span>
        </FormItem>
      </Form>
      <div class="map">
        <div class="map-container"></div>
      </div>
    </div>
  </detail-modal>
</template>
<script>
import DetailModal from '@/components/DetailModal';
import * as api from '@/api/mapIcon';
import MapTool from '@/lib/ol/mapTool';
export default {
  components: {
    DetailModal
  },
  props: ['id'],
  data(){
    return {
      flagName: '',
      flagDes: ''
    };
  },
  computed: {
    visible(){
      return this.$store.state.modal.detailVisible;
    }
  },
  watch: {
    visible(newVal, oldVal){
      newVal && this.init(this.id);
    }
  },
  created(){
    
  },
  mounted(){
  },
  methods: {
    init(id){
      !this.mapTool && this.$nextTick(this.initMap);
      if(id){
        api.findById(id).then(result => {
          this.flagName = result.flagName;
          this.flagDes = result.flagDes;
          result.fencePointData = result.flagPositions;
          result.enabled = true;
          result.posCoordinateSystem = 1;
          this.mapTool.addFence(result);
        });
      }
    },
    initMap(){
      this.mapTool = new MapTool({
        defaultZoom: 10,
        goHome: false,
        isFitToAllGeos: false,
        mousePosition: false,
        measure: false,
        polygon: false,
        showFenceArea: false,
        isShowBoundary: true
      });
      this.mapTool.init(this.$el.querySelector('.map-container'), 'googleSatellite');
    },
    close(){
      this.$store.commit('modal/closeDetail');
      this.mapTool.removeFences(Object.keys(this.mapTool.fences));
    }
  }
}
</script>
<style lang="less">
.mark-detail{
  .ivu-form-item{
    margin-bottom: 0;
  }
  .map{
    height: 300px;
    position: relative;
    .map-container{
      width: 100%;
      height: 100%;
    }
  }
}
</style>