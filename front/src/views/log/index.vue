<template>
  <div class="content-box">
    <div class="toolbar">
			<div class="rightBar">
				<Input search  @search="search"/>
			</div>
    </div>
    <ori-table :columns= "columns" :dataSource="dataSource" :loading="loading" :adaptCount="adaptCount"
      :currentPage="currentPage" :totalPage="totalPage" :getData="getData"></ori-table>
  </div>
</template>
<script>
import * as api from '@/api/log';
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
          width: 90
        },
        {
          title: '操作人',
          key: 'userName',
          minWidth: 120
        },
        {
          title: '操作内容',
          key: 'content',
          minWidth: 210
        },
        {
          title: '操作时间',
          key: 'createTime',
					minWidth: 160
        }
      ],
      dataSource: [],
      loading: true,
      adaptCount: 0,
      currentPage: 1,
      totalPage: 1,
      pageSize: 10
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
      api.getData({pageNum: pageNum || 1, pageSize: this.pageSize})
      .then(result => {
          this.dataSource = result.dataList;
          this.currentPage = result.pageNum;
          this.totalPage = result.totalNum;
          this.loading = false;
          this.adaptCount++;
      });
    },
		search(){
			
		}
  }
}
</script>
<style scoped lang="less">
</style>