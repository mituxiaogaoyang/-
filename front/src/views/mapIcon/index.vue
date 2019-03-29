<template>
  <div class="content-box">
		<div class="toolbar">
			<Button type="primary" @click="add" class="btn_add" icon="md-add">新添标注</Button>
			<div class="rightBar">
				<Input search v-model="searchText" @on-search="getData" placeholder="按标注名称搜索" />
			</div>
		</div>
		<ori-table :columns= "columns" :dataSource="dataSource" :loading="loading" :adaptCount="adaptCount"
		  :currentPage="currentPage" :totalPage="totalPage" :getData="getData"></ori-table>
    <Edit :title="editTitle" :refreshTable="getData" :id="editId"></Edit>
    <Detail :id="detailId"></Detail>
    <map-location :coordinateStr="coordinateStr" type="fence"></map-location>
	</div>
</template>
<script>
import * as api from '@/api/mapIcon';
import OriTable from '@/components/OriTable';
import Edit from './edit';
import Detail from './detail';
import MapLocation from '@/components/MapLocation';
export default {
  components: {
    OriTable,
    Edit,
    Detail,
    MapLocation
  },
  data(){
    return {
      columns: [
				{
					title:'序号',
					type:'index',
					width:70
				},
        {
          title: '标注名称',
          key: 'flagName',
          minWidth: 120,
        },
        {
          title: '标注描述',
          key: 'flagDes',
          minWidth: 180,
        },
        {
          title: '记录人',
          key: 'modifyUser',
          minWidth: 120,
        },
        {
          title: '记录时间',
          key: 'modifyTime',
          minWidth: 150,
        },
        {
          title: '操作',
          key: 'operate',
          minWidth: 210,
          render: (h, param) => {
            return h('div',[
        			h('Button', {
        			  props: {
        			    size: 'small',
        					type:'text'
        			  },
        			  on: {
        			    click: () => {
        			      this.lookDetail(param.row.id);
        			    }
        			  }
        			}, '详情'),
        			h('Button', {
        			  props: {
        			    size: 'small',
        					type:'text'
        			  },
        			  on: {
        			    click: () => {
        			      this.lookMapLocation(param.row);
        			    }
        			  }
        			}, '定位'),
        			h('Button', {
        			  props: {
        			    size: 'small',
        					type:'text'
        			  },
        			  on: {
        			    click: () => {
                    this.modify(param.row);
        			    }
        			  }
        			}, '编辑'),
        			h('Button', {
        			  props: {
        			    size: 'small',
        					type:'text'
        			  },
        			  on: {
        			    click: () => {
                    this.del(param.row.id);
        			    }
        			  }
        			}, '删除'),
        		]);
          }
        }
      ],
      dataSource: [],
      loading: true,
      adaptCount: 0,
      currentPage: 1,
      totalPage: 1,
      pageSize: 10,
      searchText: '',
      editTitle: '',
      editId: '',
      detailId: '',
      coordinateStr: ''
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
      api.getData({con: this.searchText, pageNum: pageNum || 1, pageSize: this.pageSize})
      .then(result => {
          this.dataSource = result.dataList;
          this.currentPage = result.pageNum;
          this.totalPage = result.totalNum;
          this.loading = false;
          this.adaptCount++;
      }).catch(err => this.loading = false);
    },
		add(){
			this.editTitle = '新建标注';
      this.editId = '';
      this.$store.commit('modal/openEdit');
		},
    modify(rowData){
      this.editTitle = '编辑标注';
      this.editId = rowData.id;
      this.$store.commit('modal/openEdit');
    },
    lookMapLocation(rowData){
      this.coordinateStr = rowData.flagPositions;
      this.$store.commit('modal/openMapDetail');
    },
    lookDetail(id){
      this.detailId = id;
      this.$store.commit('modal/openDetail');
    },
    del(id){
      this.$Modal.confirm({
        title: '',
        content: '确认删除该隐患点？',
        center:true,
        onOk: () => {
          api.del(id).then(result => {
            this.$Message.success('删除成功');
            this.getData();
          }).catch(err => {
            this.$Message.error('删除失败');
            this.getData();
          });
        }
      });
    }
  }
}
</script>
<style scoped lang="less">
</style>