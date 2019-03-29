<template>
  <div class="table-box">
    <Table  ref="table" :height="height" :columns="columns"
      :data="dataSource" :loading="loading"></Table>
    <Page :current="currentPage" :total="totalPage" 
       @on-change="getData"></Page>
  </div>
</template>
<script>
function tableResize(){
  const thead_h = 56,
    MAX_H = this.$el.parentNode.clientHeight - 56 -80, // table的最大高度
    table = this.$refs.table;
  const tbody = table.$refs.tbody;
  const tbody_h = tbody.$el.clientHeight; // tbody的实际高度
  // table的高度大于时MAX_H将table的高度设置为MAX_H
  this.height = tbody_h + thead_h > MAX_H ? MAX_H : '';
}
export default {
  name: 'ori-table',
  props: {
    columns: {
      type: Array,
      default: () => []
    },
    dataSource: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: true
    },
    currentPage: {
      type: Number,
      default: 1
    },
    totalPage: {
      type: Number,
      default: 1
    },
    getData: {
      type: Function,
      default: () => (function(){})
    },
    adaptCount: {
      type: Number,
      default: 0
    }
  },
  data(){
    return {
      height: 0
    };
  },
  created(){
    this.resizeHandler = tableResize.bind(this);
  },
  mounted(){
    tableResize.call(this);
    window.addEventListener('resize', this.resizeHandler);
  },
  destroyed(){
    this.$Message.destroy();
    window.removeEventListener('resize', this.resizeHandler);
  },
  watch: {
    adaptCount(newVal, oldVal){
      newVal === oldVal + 1 && this.$nextTick(this.resizeHandler);
    }
  }
}
</script>