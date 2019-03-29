<template>
  <div class="content-box">
    <div class="toolbar">
			<Button type="primary" @click="add" class="btn_add" icon="md-add">新增预警</Button>
			<div class="rightBar">
				<Input search  @search="search"/>
			</div>
    </div>
    <ori-table :columns= "columns" :dataSource="dataSource" :loading="loading" :adaptCount="adaptCount"
      :currentPage="currentPage" :totalPage="totalPage" :getData="getData"></ori-table>
		<edit-modal :title="methodDeal+'预警设置'" :submiting="isSubmit"  @sure='submitData' @cancel='close'>
			<div class="form_main">
				<div class="title">基本信息</div>
				<ul class="input_box">
					<li>
						<label for="name">预警名称</label>
						<Input v-model="form.name" placeholder="" element-id="name" size="small"/>
					</li>
					<li v-for='obj in form.inputLists' :key='obj.idFor'>
						<span class="label">{{obj.label}}</span>
						<Select v-model="obj.v" style="width:68%" size="small">
							<Option v-for="item in obj.lists" :value="item.value" :key="item.value">{{ item.label }}</Option>
						</Select>
					</li>
					<li>
						<label for="range">预警阈值</label>
						<Input v-model="form.range" placeholder="" element-id="range" size="small"/>
					</li>
					<li>
						<label for="phones" title="接收对象(短信)">接收对象(短信)</label>
						<Input v-model="form.phones" placeholder="" element-id="phones" size="small" placeholder="请输入手机号码,多个号码用逗号隔开"/>
					</li>
				</ul>
			</div>
		</edit-modal>
		<Modal
			v-model="detailShow"
			width='900'
			title="预警设置详情">
			<div class="form_main">
				<div class="title">基本信息</div>
				<ul class="input_box">
					<li>
						<label>预警名称</label>
						<div class="answer">{{form.name}}</div>
					</li>
					<li>
						<label>预警等级</label>
						<div class="answer">{{NumbertoWord(form.inputLists[0].v)}}</div>
					</li>
					<li>
						<label>隐患点</label>
						<div class="answer">{{form.inputLists[1].v}}</div>
					</li>
					<li>
						<label>监测点</label>
						<div class="answer">{{form.inputLists[2].v}}</div>
					</li>
					<li>
						<label>预警条件</label>
						<div class="answer">{{form.conditionAll}}</div>
					</li>
					<li>
						<label for="phones" title="接收对象(短信)">接收对象(短信)</label>
						<div class="answer">{{form.phones}}</div>
					</li>
				</ul>
			</div>
		</Modal>
  </div>
</template>
<script>
import * as api from '@/api/warningSet';
import OriTable from '@/components/OriTable';
import EditModal from '@/components/EditModal';
export default {
  components: {
    OriTable,EditModal
  },
  data(){
    return {
      columns: [        
				{
					title:'预警名称',
					key:'yjName',
					minWidth:120
				},
				{
					title:'关联隐患点',
					key:'yhdNo',
					minWidth:120
				},
				{
					title:'关联监测点',
					key:'jcdNo',
					minWidth:100
				},
				{
					title:'监测类型',
					key:'jcType',
					minWidth:100,
					render: (h,param)=>{
						return h('div',(()=>{
							let val = ''
							switch(param.row.yjType){
								case '1':val = '雨量';break
								case '2':val = '拉线位移';break
								case '3':val = 'GNSS表面位移';break
							}
							return val
						})())
					}
				},
				{
					title:'预警等级',
					key:'yjLevel',
					minWidth:100,
					render: (h,param)=>{
						return h('div',(()=>{
							let val = ''
							switch(param.row.yjLevel){
								case '1':val = '注意级';break
								case '2':val = '警示级';break
								case '3':val = '警戒级';break
								case '4':val = '警报级';break
							}
							return val
						})())
					}
				},
				{
					title:'预警条件',
					key:'condition',
					minWidth:120,
					
				},
				{
					title:'通知号码',
					key:'noticePhones',
					minWidth:110
				},
				{
					title:'状态',
					key:'isEnabled',
					minWidth:90,
					render:(h,param)=>{
						return h('div',param.row.isEnabled?'启用':'停用')
					}
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
										let dataT = param.row
										this.detailShow = true;
										this.form.inputLists.forEach(obj=>{
											obj.v = dataT[obj.idFor]
										})
										this.form.name = dataT.yjName 
										this.form.range = dataT.yjShreshold 
										this.form.conditionAll = dataT.condition 
										this.form.phones = dataT.noticePhones
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
										this.form.name = dataT.yjName 
										this.form.id = dataT.id
										this.form.range = dataT.yjShreshold 
										this.form.phones = dataT.noticePhones
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
										console.log()
										this.changeStateWarning(param.row.id,!(param.row.isEnabled))
									}
								}
							}, param.row.isEnabled?'停用':'启用'),
							h('Button', {
								props: {
									size: 'small',
									type:'text'
								},
								on: {
									click: () => {
										this.$Modal.confirm({
												title: '',
												content: '<p>确认删除该预警设置？</p>',
												center:true,
												onOk: () => {
														api.deleteWarn(param.row.id).then(res=>{
															this.$Message.info('预警设置已删除')
															this.getData(this.currentPage)
														});
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
			form:{
				name:'',
				id:'',
				range:0,
				phones:'',
				conditionAll:'',
				inputLists:[
					{label:'预警等级',v:'',idFor:'yjLevel',
						lists:[
							{label:'注意级',value:'1'},
							{label:'警示级',value:'2'},
							{label:'警戒级',value:'3'},
							{label:'警报级',value:'4'},
						]
					},
					{label:'隐患点',v:'',idFor:'yhdNo',
						lists:[
							{label:'注意级',value:'C1'},
						]
					},
					{label:'监测点',v:'',idFor:'jcdNo',
						lists:[
							{label:'注意级',value:'C1'},
						]
					},
					{label:'预警类型',v:'',idFor:'yjType',
						lists:[
							{label:'小时雨量(mm)',value:'1'},
							{label:'24h雨量(mm)',value:'2'},
							{label:'GNSS表面位移(mm)',value:'3'},
							{label:'GNSS表面位移加速度(mm/d)',value:'4'},
							{label:'拉线位移累计变化(cm)',value:'5'},
							{label:'拉线位移变化速率(cm/d)',value:'6'},
							{label:'拉线位移计当前值(cm)',value:'7'},
						]
					},
					{label:'触发条件',v:'',idFor:'yjCondition',
						lists:[
							{label:'大于阈值',value:'1'},
							{label:'小于阈值',value:'2'},
							{label:'等于阈值',value:'3'},
						]
					},
				],
			},
			isSubmit:false,
			methodDeal:'新增',
			detailShow:false
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
		NumbertoWord(v){
		  let val = ''
			switch(v){
				case '1':val ='注意级';break
				case '2':val ='警示级';break
				case '3':val ='警戒级';break
				case '4':val ='警报级';break
			}
			return val
		},
    getData(pageNum){
      this.loading = true
      api.getData({pageNum: pageNum || 1, pageSize: this.pageSize})
      .then(result => {	
					let arrResult =  result.dataList;
					arrResult.forEach(v=>{
						let v1 = (()=>{
								let value=''
								switch(v.yjType){
									case '1':value='小时雨量';break
									case '2':value='24h雨量';break
									case '3':value='GNSS表面位移';break
									case '4':value='GNSS表面位移加速度';break
									case '5':value='拉线位移累计变化';break
									case '6':value='拉线位移变化速率';break
									case '7':value='拉线位移计当前值';break
								}
								return  value
								})() 
						let v2 = v.yjCondition=='1'?'大于':(v.yjCondition=='2'?'小于':'等于')
						let v3 = v.yjShreshold
						v.condition = v1+v2+v3
					})
					this.dataSource = arrResult
          this.currentPage = result.pageNum;
          this.totalPage = result.totalNum;
          this.loading = false;
          this.adaptCount++;
      });
    },
		search(){
			
		},
		close(){
			this.form.name = ''
			this.form.range=''
			this.form.phones =''
			this.form.inputLists.forEach(obj=>{
				obj.v = ''
			})
			this.$store.commit('modal/closeEdit')
		},
		add(){
			this.methodDeal = '新增'
			this.isSubmit = false 
			this.form.name = ''
			this.form.range=''
			this.form.phones =''
			this.form.inputLists.forEach(obj=>{
				obj.v = ''
			})
			this.$store.commit('modal/openEdit');
		},
		submitData(){
			this.isSubmit = true
			let type = (this.methodDeal === '新增')?'save':'update'
			let dataObj = {}
			this.form.inputLists.forEach(obj=>{
				 dataObj[obj.idFor] = obj.v
			})
			 dataObj.yjName = this.form.name
			 dataObj.yjShreshold = this.form.range
			 dataObj.noticePhones =this.form.phones
			 if(this.methodDeal !== '新增'){
				 dataObj.id = this.form.id
			 }
			api.addWarningSet(type,dataObj).then(result=>{
				this.isSubmit = false 
				this.$Message.info({content:this.methodDeal+'成功',duration:10});
				this.close()
				this.getData(this.currentPage)
			}).catch(err=>{
				this.isSubmit = false
			})
		},
		changeStateWarning(id,bool){
			api.dealWarn(id,bool)
			.then(result => {
			    this.getData(this.currentPage)
			});
		}
  }
}
</script>
<style scoped lang="less">
	.select_list{
		display: inline-block
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
				
				  display: inline-block;
				  font-size: 13px;
				  width:75px; 
				}
				.label{width:75px;}
				&.full{
					width:100%;
					label{width:auto;}
				}
			}
			.ivu-input-wrapper{
				width:68%;
			}
			.answer{width:68%;display: inline-block}
		}
	}
</style>