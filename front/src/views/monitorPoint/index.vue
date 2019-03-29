<template>
  <div class="content_hide_points">
  	<div class="bar_tree">
  		<menu-tree></menu-tree>
  	</div>
  	<div class="content-box">
			<div class="toolbar">
					<Button type="primary" @click="add" class="btn_add" icon="md-add">新建点位</Button>
					<!-- <Button type="primary" @click="leadIn" class="btn_white">导入</Button>
					<Button type="primary" @click="leadOut" class="btn_white">导出</Button> -->
					<div class="select_list">
						<span class="label">选择隐患点：</span>
						<Select v-model="pointSelect" style="width:160px"  clearable @on-change="getData(1)">
							<Option v-for="item in pointsHide" :value="item.jcca02A010" :key="item.id">{{ item.jcca02A011}}</Option>
						</Select>
					</div>
					<div class="rightBar">
						<Input search  @search="search" placeholder="请输入搜索内容"/>
					</div>
			</div>
			<ori-table :columns= "columns" :dataSource="dataSource" :loading="loading" :adaptCount="adaptCount"
				:currentPage="currentPage" :totalPage="totalPage" :getData="getData"></ori-table>
		</div>
		<edit-modal :title="methodDeal+'监测点'" :submiting="isSubmit" @sure='submitModal' @cancel="close">
			<div class="form_main">
				<div class="title">基本信息</div>
				<ul class="input_box">
					<li>
						<span class="label">隐患点</span>
						<Select v-model="form.point" style="width:68%" size="small">
							<Option v-for="item in pointsHide" :value="item.jcca02A010" :key="item.id">{{ item.jcca02A011}}</Option>
						</Select>
					</li>
					<li v-for='obj in form.inputLists' :key='obj.idFor'>
						<label :for="obj.idFor">{{obj.label}}</label>
						<Input v-model="obj.v" placeholder="" :element-id="obj.idFor" size="small"/>
					</li>
					<li class="full">
						<div class="label">监测级别</div>
						<RadioGroup v-model="form.type">
							  <Radio :label="list.id" v-for='list in form.levels' :key='list.id'>{{list.value}}</Radio>
						</RadioGroup>
					</li>
				</ul>
			</div>
		</edit-modal>
		<Modal
        v-model="detailShow"
				width='900'
				
        title="监测点详情">
      <div class="form_main">
       	<div class="title">基本信息</div>
       	<ul class="input_box">
			<li>
				<label>隐患点</label>
				<div class="answer">{{form.point}}</div>
			</li>
       		<li v-for='obj in form.inputLists' :key='obj.idFor'>
       			<label>{{obj.label}}</label>
       			<div class="answer">{{obj.v}}</div>
       		</li>
       	</ul>
      </div>
      <div slot="footer">
        <Button type="primary" @click="detailShow=false">关闭</Button>
      </div>
    </Modal>
    <map-location :coordinateStr="coordinateStr" type="geoPoint_monitor"></map-location>
	</div>
</template>
<script>
import * as api from '@/api/monitorPoint';
import * as yhdApi from '@/api/hideDangerPoint';
import OriTable from '@/components/OriTable';
import { formatLevel } from '@/common/format';
import menuTree from '@/components/MenuTree';
import EditModal from '@/components/EditModal';
import MapLocation from '@/components/MapLocation';
export default {
  components: {
    OriTable,
		menuTree,
		EditModal,
    MapLocation
  },
  data(){
    return {
      columns: [
        {
          title: '监测点名称',
          key: 'jcca03A011',
					minWidth: 120
        },
		{
		  title: '监测点编号',
		  key: 'jcca03A010',
			minWidth: 120
		},
        {
          title: '所属隐患点',
          key: 'jcca03A020',
		  minWidth: 150
        },
        {
          title: '监测要素',
          key: 'jcca03A050',
          minWidth: 100
        },
        {
          title: '运行维护单位',
          key: 'jcca03A151',
          minWidth: 150,
        },
        {
          title: '联络人',
          key: 'jcca03A160',
          minWidth: 100,
        },
        {
          title: '联系电话',
          key: 'jcca03A901',
          minWidth: 120
        },
        {
          title: '操作',
          key: 'operate',
          minWidth: 220,
          render: (h, param) => {
            return h('div',[
        			h('Button', {
        			  props: {
        			    size: 'small',
        					type:'text'
        			  },
        			  on: {
        			    click: () => {
							let dataT = param.row
							this.detailShow = true;
							this.form.inputLists.forEach(obj=>{
								obj.v = dataT[obj.idFor]
							})
							this.form.point = dataT.jcca03A020
        			      this.detailShow = true
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
                    this.coordinateStr = param.row.jcca03A080 + ',' + param.row.jcca03A090;
                    this.$store.commit('modal/openMapDetail');
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
        						let dataT = param.row
        						this.methodDeal = '编辑',
        						this.isSubmit = false 
        						this.form.inputLists.forEach(obj=>{
        							obj.v = dataT[obj.idFor]
        						})
        						this.form.type = dataT.jcca03A041  
								this.form.id = dataT.id
								this.form.point = dataT.jcca03A020
								this.$store.commit('modal/openEdit');
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
        						this.$Modal.confirm({
        								title: '',
        								content: '<p>确认删除该监测点？</p>',
        								center:true,
        								onOk: () => {
        										this.deletePoint(param.row.id);
        								}
        						});
        			      
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
			methodDeal:'编辑',
			isSubmit:false,
			form:{
				inputLists:[
					{label:'监测点名称',v:'',idFor:'jcca03A011',},
					{label:'监测点编号',v:'',idFor:'jcca03A010'},
					{label:'仪器编号',v:'',idFor:'jcca03A030'},
					{label:'监测方法',v:'',idFor:'jcca03A040'}, 
					{label:'监测部位',v:'',idFor:'jcca03A050'},
					{label:'监测内容',v:'',idFor:'jcca03A060'},
					{label:'经度',v:'',idFor:'jcca03A080'},
					{label:'纬度',v:'',idFor:'jcca03A090'},
					{label:'建设单位',v:'',idFor:'jcca03A140'},
					{label:'维护单位',v:'',idFor:'jcca03A151'},
					{label:'责任人',v:'',idFor:'jcca03A160'},
					{label:'联系电话',v:'',idFor:'jcca03A901'}
				],
				type:'1',
				levels:[
					{id:'Ⅰ',value:'Ⅰ'},
					{id:'Ⅱ',value:'Ⅱ'},
					{id:'Ⅲ',value:'Ⅲ'},
					{id:'Ⅳ',value:'Ⅳ'},
				],
				id:0,
				point:''
			},
			pointsHide:[],
			pointSelect:'',
			detailShow:false,
			levelWatch:'',
      coordinateStr: ''
    }
  },
  created(){
    this.getData();
	this.getPointsHide()
  },
  mounted(){
  },
  destroyed(){
  },
  methods: {
    getData(pageNum){
      this.loading = true
      api.getData({pageNum: pageNum || 1, pageSize: this.pageSize,jcca03A020:this.pointSelect})
      .then(result => {
          this.dataSource = result.dataList;
          this.currentPage = result.pageNum;
          this.totalPage = result.totalNum;
          this.loading = false;
          this.adaptCount++;
      })
    },
		search(){},
		add(){
			this.close()
			this.methodDeal = '新增'
			this.$store.commit('modal/openEdit');
		},
		leadIn(){
			
		},
		leadOut(){
			
		},
    close(){
      this.$store.commit('modal/closeEdit');
      this.form.inputLists.forEach(obj=>{
        obj.v = ''
      })
      this.form.type = 'Ⅰ'
    },
	getPointsHide(){
		yhdApi.getAllData().then(res=>{
			this.pointsHide = res;
		})
	},
		submitModal(){
			this.isSubmit = true
			let type = (this.methodDeal === '新增')?'save':'update'
			let dataObj = {}
			this.form.inputLists.forEach(obj=>{
				 dataObj[obj.idFor] = obj.v
			})
			 dataObj.jcca03A041  = this.form.type
			 if(this.methodDeal !== '新增'){
				dataObj.id = this.form.id
			 }
			 dataObj.jcca03A020 = this.form.point
			api.saveData(type,dataObj).then(result=>{
				this.isSubmit = false
				this.$Message.info(this.methodDeal+'成功');
				this.close();
				this.getData(this.currentPage)
			}).catch(err=>{
				this.isSubmit = false
			})
		},
		deletePoint(id){
			api.deleteData(id).then(result=>{
				this.$Message.info('删除成功');
				this.getData(this.currentPage)
			})
		}
  }
}
</script>
<style scoped lang="less">
	.toolbar{
		.select_list{display: inline-block}
	}
	.form_main{
		.title{
			font-size: 15px;
			margin: 9px 0 5px;
		}
		.input_box{
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			margin-bottom: 5px;
			&>li{
				width:46%;
				margin-bottom:12px ;
				label{
				  margin-bottom: 3px;
				  display: inline-block;
				  font-size: 13px;
				  width:70px;
				  
				}
				&.full{
					width:100%;
					label{width:auto;}
				}
			}
			.ivu-input-wrapper{
				width:72%;
			}
			.answer{width:72%;display: inline-block}
		}
		.label{
			margin-top:5px;
			font-size: 13px;
			display: inline-block;
			width:70px;
		}
	}
</style>