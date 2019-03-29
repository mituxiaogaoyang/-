<template>
  <div class="list-roll">
    <div class="slider">
      <div class="item" v-for="(item, index) in dataSource" :key="index" :class="'level'+item.level+'-color'">{{item.content}}</div>
    </div>
  </div>
</template>
<script>
import Roll from '@/lib/roll';
export default {
  name: 'list-roll',
  props: {
    dataSource: {
      type: Array,
      default: () => []
    }
  },
  data(){
    return {};
  },
  watch: {
    dataSource(newVal, oldVal){
      newVal && newVal.length && this.$nextTick(this.startup);
    }
  },
  created(){
  },
  mounted(){
  },
  methods: {
    startup(){
      if(this.roll){
        this.roll.update({totalRowNum: this.dataSource.length});
      }else{
        this.roll = new Roll(this.$el.querySelector('.slider'), {
          totalRowNum: this.dataSource.length,
          // type: 'page',
          rowHeight: 1.9,
          unit: 'rem'
        });
        this.roll.start();
      }
    }
  }
}
</script>
<style scoped lang="less">
.list-roll{
  overflow: hidden;
  .item{
    height: 1.9rem;
    font-size: 0.7rem;
    line-height: 1.9rem;
    margin-left: 1rem;
    margin-right: 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
}
</style>