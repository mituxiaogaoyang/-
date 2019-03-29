<template>
  <edit-modal :title="title || '新增'" :submiting="submiting" @cancel="close" @sure="sure">
    <div class="mark-edit">
      <Form ref="form" :model="form" :rules="rules" :label-width="80">
        <FormItem label="标注名称" prop="flagName">
          <Input type="text" v-model="form.flagName"></Input>
        </FormItem>
        <FormItem label="描述" prop="flagDes">
          <Input type="text" v-model="form.flagDes"></Input>
        </FormItem>
      </Form>
      <div class="map">
        <div class="map-container"></div>
        <div class="right-bottom-con">
          <div class="go-home" id="goHomeBtn">
            <Icon type="md-locate" title="回到初始化位置" />
          </div>
          <div class="measure" id="measureBtn" title="测距离"></div>
          <div class="polygon" id="polygonBtn" title="测面积"></div>
        </div>
      </div>
    </div>
  </edit-modal>
</template>
<script>
import EditModal from '@/components/EditModal';
import * as api from '@/api/mapIcon';
import MapTool from '@/lib/ol/mapTool';
export default {
  components: {
    EditModal
  },
  props: ['title', 'id', 'refreshTable'],
  data(){
    return {
      submiting: false,
      form: {
        flagName: '',
        flagDes: ''
      },
      rules: {}
    };
  },
  computed: {
    visible(){
      return this.$store.state.modal.editVisible;
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
        this.form.id = id;
        api.findById(id).then(result => {
          this.form.flagName = result.flagName;
          this.form.flagDes = result.flagDes;
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
        isFitToAllGeos: false,
        mousePosition: false,
        measure: true,
        polygon: true,
        showFenceArea: false,
        isShowBoundary: true
      });
      // 重写mapTool.addControl
      this.mapTool.addControl = ({className, onclick}) => {
        const btn = document.getElementById(className + 'Btn');
        btn.addEventListener('click', onclick.bind(this.mapTool), false);
      }
      this.mapTool.init(this.$el.querySelector('.map-container'), 'googleSatellite');
    },
    close(){
      this.$store.commit('modal/closeEdit');
      this.$refs.form.resetFields();
      delete this.form.id;
      this.mapTool.removeFences(Object.keys(this.mapTool.fences));
      this.submiting = false;
    },
    sure(){
      this.$refs.form.validate(result => {
        if(result && !this.submiting){
          this.submiting = true;
          const fenceIds = Object.keys(this.mapTool.fences);
          if(fenceIds.length === 1){
            const fence = this.mapTool.fences[fenceIds[0]];
            this.form.flagPositions = fence.getPointData();
          }else{
            this.$Message.info('一个标注有且仅有一个标注图形');
          }
          api.save({
            ...this.form
          }).then(() => {
            this.$Message.success('标注'+ (!this.id ? '新建' : '更新') +'成功！');
            this.close();
            this.refreshTable();
          }).catch(() => this.submiting = false);
        }
      });
    }
  }
}
</script>
<style lang="less">
.mark-edit{
  .map{
    height: 300px;
    position: relative;
    .map-container{
      width: 100%;
      height: 100%;
      .tooltip{
        background-color: rgba(2, 17, 17, 0.5);
        padding: 8px 20px;
        border-radius: 32px;
        line-height: 16px;
        color: #0ff;
        position: relative;
        &.hidden{
          display: none;
        }
        i{
          position: absolute;
          left: 50%;
          bottom: 0;
          &:after{
            content: ' ';
            position: absolute;
            left: -10px;
            bottom: -20px;
            border: 10px solid transparent;
            border-top-color: #fff;
          }
        }
      }
    }
    .right-bottom-con{
      position: absolute;
      right: 1rem;
      bottom: 0;
      width: 1.3rem;
      height: 6.3rem;
      z-index: 999999;
      >div{
        display: inline-block;
        width: 1.3rem;
        height: 1.3rem;
        line-height: 1.3rem;
        background-color: rgba(255, 255, 255, 1);
        vertical-align: bottom;
        margin-top: 0.35rem;
        text-align: center;
        >.ivu-icon{
          font-size: 1rem;
          color: #8D9798;
          cursor: pointer;
        }
        &.go-home:hover{
          background-color: #FF9000;
          .ivu-icon{
            color: #fff;
          }
        }
        &.measure{
          cursor: pointer;
          position: relative;
          &:hover{
            background-color: #FF9000;
          }
          &:after{
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-image: url(../../assets/map/measure.png);
            background-size: 0.75rem 0.75rem;
            background-repeat: no-repeat;
            background-position: center;
          }
        }
        &.polygon{
          cursor: pointer;
          position: relative;
          &:hover{
            background-color: #FF9000;
          }
          &:after{
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-image: url(../../assets/map/polygon.png);
            background-size: 0.75rem 0.75rem;
            background-repeat: no-repeat;
            background-position: center;
          }
        }
      }
    }
  }
}
</style>