<template>
  <div class="content-box">
    <div class="toolbar">
			<RadioGroup v-model="btnDeal" type="button" @on-change='getData(1)'>
				<Radio label="未读消息"></Radio>
				<Radio label="已读消息"></Radio>	
			</RadioGroup>
    </div>
    <ori-table :columns= "columns" :dataSource="dataSource" :loading="loading" :adaptCount="adaptCount"
      :currentPage="currentPage" :totalPage="totalPage" :getData="getData"></ori-table>
  </div>
</template>
<script>
import * as api from '@/api/msg';
import OriTable from '@/components/OriTable';
export default {
  components: {
    OriTable
  },
  data(){
    return {
      columns: [
        {
          title: '序号',
          type: 'index',
          width: 80
        },
        {
          title: '消息类型',
          key: 'ntType',
          width: 120,
					render:(h,param)=>{
						return h('div',param.row.ntType==1?'预警消息':'设备离线')
					}
        },
				{
				  title: '状态',
				  key: 'isRead',
				  width: 120,
					render:(h,param)=>{
						return h('div',param.row.isRead?'已读':'未读')
					}
				},
        {
          title: '消息内容',
          key: 'ntMsg'
        },
        {
          title: '消息时间',
          key: 'createTime',
          width: 180
        }
      ],
      dataSource: [],
      loading: true,
      adaptCount: 0,
      currentPage: 1,
      totalPage: 1,
      pageSize: 10,
			btnDeal:'未读消息'
    };
  },
  created(){
    this.getData();
  },
  mounted(){
  },
  destroyed(){
  },
  methods: {
    getData(pageNum){
      this.loading = true
      api.getData({pageNum: pageNum || 1, pageSize: this.pageSize,isRead:this.btnDeal==='未读消息'?false:true})
      .then(result => {
          this.dataSource = result.dataList;
          this.currentPage = result.pageNum;
          this.totalPage = result.totalNum;
          this.loading = false;
          this.adaptCount++;
      });
    }
  }
}
</script>
<style scoped lang="less">
</style>