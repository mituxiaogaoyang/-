<template>
  <div class="content_hide_points">
  	<div class="bar_tree">
  		<menu-tree></menu-tree>
  	</div>
  	<div class="content-box">
			<div class="toolbar">
					<Button type="primary" @click="add" class="btn_add" icon="md-add">新增设备</Button>
					<!-- <Button type="primary" @click="leadIn" class="btn_white">导入</Button>
					<Button type="primary" @click="leadOut" class="btn_white">导出</Button> -->
					<div class="select_list">
						<span class="label">选择隐患点：</span>
						<Select v-model="pointSelect" style="width:150px">
							<Option v-for="item in pointsHide" :value="item.value" :key="item.value">{{ item.label }}</Option>
						</Select>
					</div>
					<!-- <div class="select_list">
						<span class="label">选择监测点：</span>
						<Select v-model="pointSelect2" style="width:150px">
							<Option v-for="item in pointsMonitor" :value="item.value" :key="item.value">{{ item.label }}</Option>
						</Select>
					</div> -->
					<div class="rightBar">
						<Input search  @search="search" placeholder="请输入搜索内容..."/>
					</div>
			  </div>
			  <ori-table :columns= "columns" :dataSource="dataSource" :loading="loading" :adaptCount="adaptCount"
			    :currentPage="currentPage" :totalPage="totalPage" :getData="getData"></ori-table>
  	</div>
		<edit-modal :title="methodDeal+'设备'" :submiting="isSubmit"  @sure='submitData' @cancel="close">
			<div class="form_main">
				<div class="title">基本信息</div>
				<ul class="input_box">
					<li v-for='obj in form.inputLists' :key='obj.idFor'>
						<label :for="obj.idFor" :title="obj.label">{{obj.label}}</label>
						<Input v-model="obj.v" placeholder="" :element-id="obj.idFor" size="small"/>
					</li>
					<li class="full">
						<div class="label">设备类型</div>
						<RadioGroup v-model="form.type">
							  <Radio :label="list.id" v-for='list in form.typeAll' :key='list.id'>{{list.value}}</Radio>
						</RadioGroup>
					</li>
				</ul>
				<div class="title">其他</div>
				<Input v-model="form.text" type="textarea" :rows="2" placeholder="Enter something..." />
			</div>
		</edit-modal>
		<Modal
		    v-model="detailShow"
				width='900'
		    title="设备详情">
		  <div class="form_main">
		   	<div class="title">基本信息</div>
		   	<ul class="input_box">
		   		<li v-for='obj in form.inputLists' :key='obj.idFor'>
		   			<label :title="obj.label">{{obj.label}}</label>
		   			<div class="answer">{{obj.v}}</div>
		   		</li>
					<li v-for='obj in form.itemsDetail' :key='obj.idFor'>
						<label>{{obj.label}}</label>
						<div class="answer">{{obj.v}}</div>
					</li>
		   	</ul>
		  </div>
      <div slot="footer">
        <Button type="primary" @click="detailShow=false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import * as api from '@/api/device';
import OriTable from '@/components/OriTable';
import menuTree from '@/components/MenuTree';
import EditModal from '@/components/EditModal';
export default {
  components: {
    OriTable,
		menuTree,
		EditModal
  },
  data(){
    return {
      columns: [
        {
          title: '设备名称',
          key: 'jcca08A030',
          minWidth: 120
        },
        {
          title: '设备编号',
          key: 'jcca08A010',
          minWidth: 120
        },
        {
          title: '设备类型',
          key: 'jcca08A900Name',
          minWidth: 100,
        },
        {
          title: '所属隐患点',
          key: 'jcca02A011',
          minWidth: 150
        },
        {
          title: '所属监测点',
          key: 'jcca03A011',
          minWidth: 150
        },
        {
          title: '运行状态',
          key: 'status',
          minWidth: 100,
					render: (h,param)=>{
						return h('div',{'class':param.row.jcca08A901?'working':'stop'},param.row.jcca08A901?'正常':'停止')
					}
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
										this.form.itemsDetail.forEach(obj=>{
											obj.v = dataT[obj.idFor]
										})
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
        						let dataT = param.row
        						this.methodDeal = '编辑',
        						this.isSubmit = false 
        						this.form.inputLists.forEach(obj=>{
        							obj.v = dataT[obj.idFor]
        						})
        						this.form.type = dataT.jcca08A900   
								this.form.text = dataT.jcca08A110   
								 this.form.id = dataT.id
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
        								content: '<p>确认删除该设备？</p>',
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
			pointsHide:[
				{label:'隐患点1',value:'1'},
				{label:'隐患点2',value:'2'},
				{label:'隐患点3',value:'3'},
				{label:'隐患点4',value:'4'}
			],
			pointsMonitor:[
				{label:'监测点1',value:'1'},
				{label:'监测点2',value:'2'},
				{label:'监测点3',value:'3'},
			],
			pointSelect:'',
			pointSelect2:'',
			form:{
				inputLists:[
					{label:'设备名称',v:'',idFor:'jcca08A030',},
					{label:'设备编号',v:'',idFor:'jcca08A010'},
					{label:'设备型号',v:'',idFor:'jcca08A040'},
					{label:'生产单位',v:'',idFor:'jcca08A050'},
					{label:'厂家率定系数',v:'',idFor:'jcca08A070'},
					{label:'温度修正系数',v:'',idFor:'jcca08A080'},
				],
				type:'1',
				typeAll:[
					{id:'1',value:'雨量计'},
					{id:'2',value:'拉线位移计'},
					{id:'3',value:'GNSS位移计'},
				],
				itemsDetail:[
					{label:'所属隐患点',v:'',idFor:'jcca02A011'},
					{label:'所属监测点',v:'',idFor:'jcca03A011'},
					{label:'设备类型',v:'',idFor:'jcca08A900Name'},
				],
				text:'',
				id:0,
			},
			methodDeal:'新增',
			isSubmit:false,
			detailShow:false,
    };
  },
  created(){
    this.getData();
  },
	computed:{
		
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
		add(){
			this.close()
			this.methodDeal = '新增'
			this.$store.commit('modal/openEdit')
		},
		search(){},
		leadIn(){},
		leadOut(){},
    close(){
      this.$store.commit('modal/closeEdit');
      this.form.inputLists.forEach(obj=>{
        obj.v = ''
      })
      this.form.type = '1'
    },
		submitData(){
			this.isSubmit = true
			let type = (this.methodDeal === '新增')?'save':'update'
			let dataObj = {}
			this.form.inputLists.forEach(obj=>{
				 dataObj[obj.idFor] = obj.v
			})
			 dataObj.jcca08A900 = this.form.type
			 dataObj.jcca08A110  =this.form.text
			 if(this.methodDeal !== '新增'){
				 dataObj.id = this.form.id
			 }
			api.saveData(type,dataObj).then(result=>{
				this.isSubmit = false 
				this.$Message.info({content:this.methodDeal+'成功',duration:10});
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
<style  lang="less">
	.content{min-width: 1250px;}
	.toolbar{
		.select_list{display: inline-block;margin-right:18px;}
	}
	.table-box{
		.stop{
			padding-left:12px;
			position: relative;
			&:before{
				content:"";
				display: block;
				width:8px;
				height:8px;
				border-radius: 50%;
				background-color: #C20C0C;
				position: absolute;
				top:5px;
				left:0;
			}
		}
		.working{
			padding-left:12px;
			position: relative;
			&:before{
				content:"";
				display: block;
				width:8px;
				height:8px;
				border-radius: 50%;
				background-color: #0F8B1E;
				position: absolute;
				top:7px;
				left:0;
			}
		}
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
			li{
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