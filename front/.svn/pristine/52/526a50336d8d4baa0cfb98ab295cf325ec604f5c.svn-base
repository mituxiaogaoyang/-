<template>
  <div class="content-box">
    <div class="toolbar">
		<Button type="primary" @click="add" class="btn_add" icon="md-add">新增人员</Button>
		<!-- <Button type="primary" @click="leadIn" class="btn_white">导入</Button>
		<Button type="primary" @click="leadOut" class="btn_white">导出</Button> -->
		<div class="select_list">
			<span class="label">选择隐患点：</span>
			<Select v-model="pointHide" style="width:150px" clearable @on-change="getData(1)">
				<Option v-for="item in pointsHide" :value="item.jcca02A010" :key="item.id">{{ item.jcca02A011}}</Option>
			</Select>
		</div>
		<div class="rightBar">
			<Input search  @search="searchRelative" v-model="textSearch" style='width:200px' @on-search="getData(1)"/>
		</div>		
    </div>
    <ori-table :columns= "columns" :dataSource="dataSource" :loading="loading" :adaptCount="adaptCount"
      :currentPage="currentPage" :totalPage="totalPage" :getData="getData"></ori-table>
	<edit-modal :title="methodDeal+'人员'" :submiting="isSubmit"  @sure='submitData' @cancel="close">
		<div class="form_main">
			<div class="title">基本信息</div>
			<ul class="input_box">
				<li v-for='obj in form.inputLists' :key='obj.idFor'>
					<label :for="obj.idFor">{{obj.label}}</label>
					<Input v-model="obj.v" placeholder="" :element-id="obj.idFor" size="small"/>
				</li>
				<li>
					<span class="label">隐患点</span>
					<Select v-model="form.point" style="width:68%" size="small">
						<Option v-for="item in pointsHide" :value="item.jcca02A010" :key="item.id">{{ item.jcca02A011}}</Option>
					</Select>
				</li>
				<li class="full">
					<div class="label">性别</div>
					<RadioGroup v-model="form.sex">
						  <Radio label="0"  >男</Radio>
						  <Radio label="1"  >女</Radio>
					</RadioGroup>
				</li>
			</ul>
			<div class="title">备注</div>
			<Input v-model="form.remark" type="textarea" :rows="2" placeholder="Enter something..." />
		</div>
	</edit-modal>
  </div>
</template>
<script>
import * as api from '@/api/hero';
import OriTable from '@/components/OriTable';
import EditModal from '@/components/EditModal';
import * as yhdApi from '@/api/hideDangerPoint';
export default {
  components: {
    OriTable, EditModal
  },
  data(){
    return {
      columns: [
		  {
			title:'序号',
			type:'index',
			minWidth:70
		  },
		{
			title:'姓名',
			key:'pname',
			minWidth:120
		},
		{
			title:'区县',
			key:'jcca20A901',
			minWidth:120
		},
		{
			title:'性别',
			key:'sex',
			minWidth:100,
			render: (h,param)=>{
				return h('div',param.row.sex==='1'?'女':'男')
			}
		},
		{
			title:'隐患点',
			key:'yhdCode',
			minWidth:180
		},
		{
			title:'手机',
			key:'phone',
			minWidth:130
		},
		{
			title:'备注',
			key:'remark',
			minWidth:130
		},
		{
			title:'操作',
			key:'operate',
			minWidth:100,
			render: (h,param)=>{
				return h('div',[
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
								  this.form.sex = dataT.sex 
								  this.form.remark = dataT.remark
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
							      		content: '<p>确认删除该人员？</p>',
							      		center:true,
							      		onOk: () => {
							      				api.del(param.row.id).then(res=>{
							      					this.$Message.info('人员已删除')
							      					this.getData(this.currentPage)
							      				});
							      		}
							      });
							    }
							  }
							}, '删除')
						])
			}
		}
      ],
      dataSource: [],
      loading: true,
      adaptCount: 0,
      currentPage: 1,
      totalPage: 1,
      pageSize: 10,
	  pointHide:'',
	  methodDeal:'新增',
	  isSubmit:false,
	  pointsHide:[],
	  textSearch:'',
	  form:{
		  inputLists:[
			  {label:'姓名',v:'',idFor:'pname'},
			  // {label:'区县',v:'',idFor:'s'},
			  {label:'手机',v:'',idFor:'phone'},
		  ],
		  point:'',
		  sex:'0',
		  remark:'',
		  id:''
	  }
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
      api.getData({pageNum: pageNum || 1, pageSize: this.pageSize,yhdCode:this.pointHide,key:this.textSearch})
      .then(result => {
          this.dataSource = result.dataList;
          this.currentPage = result.pageNum;
          this.totalPage = result.totalNum;
          this.loading = false;
          this.adaptCount++;
      });
    },
	getPointsHide(){
		yhdApi.getAllData().then(res=>{
			this.pointsHide = res;
			console.log(this.pointsHide)
		})
	},
	searchRelative(){
		
	},
	close(){
		this.isSubmit = false 
		this.form.inputLists.forEach(obj=>{
			obj.v = ''
		})
		this.form.sex ='0'
		this.form.remark = ''
		this.$store.commit('modal/closeEdit');
	},
	add(){
		this.methodDeal = '新增'
		this.$store.commit('modal/openEdit');
	},
	leadIn(){},
	leadOut(){},
	submitData(){
		this.isSubmit = true
		let type = (this.methodDeal === '新增')?'save':'update'
		let dataObj = {}
		this.form.inputLists.forEach(obj=>{
			 dataObj[obj.idFor] = obj.v
		})
		 dataObj.sex = this.form.sex
		 dataObj.remark =this.form.remark
		 dataObj.yhdCode = this.form.point
		 if(this.methodDeal !== '新增'){
			 dataObj.id =this.form.id
		 }
		api.addPerson(type,dataObj).then(result=>{
			this.isSubmit = false 
			this.$Message.info({content:this.methodDeal+'成功',duration:10});
			this.close()
			this.getData(this.currentPage)
		}).catch(err=>{
			this.isSubmit = false
		})
	}
  }
}
</script>
<style scoped lang="less">
	.select_list{
		display: inline-block;
		margin-left:24px;
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
		.ivu-radio-wrapper{margin-right: 12px}
		.ivu-checkbox-wrapper{margin-right: 12px}
		.ivu-radio-inner{
			border-color:#f39800!important;
		}
		.ivu-radio-inner:after{background-color: #f39800}
		.label{
			margin-top:5px;
			font-size: 13px;
			display: inline-block;
			width:70px;
		}
	}
</style>