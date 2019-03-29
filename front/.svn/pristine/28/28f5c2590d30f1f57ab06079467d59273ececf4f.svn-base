<template>
	<div class="content-box">
		<div class="toolbar">
			<div class="select_list">
				<span class="label">选择隐患点：</span>
				<Select v-model="search.yhdNo">
					<Option v-for="item in pointsHide" :value="item.value" :key="item.value">{{ item.label }}</Option>
				</Select>
			</div>
			<div class="select_list">
				<span class="label">选择监测点：</span>
				<Select v-model="search.jcdNo">
					<Option v-for="item in pointsMonitor" :value="item.value" :key="item.value">{{ item.label }}</Option>
				</Select>
			</div>
			<div class="select_list">
				<span class="label">选择时间：</span>
				<DatePicker type="daterange" format="yyyy-MM-dd" :value='dateRange' :options="datePickerOpts" placement="bottom-end" :clearable="false" :editable="false"></DatePicker>
			</div>
			 <Button type="primary" class="btn_select" @click="getData">查询</Button>
		</div>
		<div class="panel_box">
			<Tabs :value="currentTab">
				<TabPane label="雨量数据" name="name0">
					<ori-table :columns= "columns1" :dataSource="dataSource1" :loading="loading" :adaptCount="adaptCount1"
					  :currentPage="currentPage1" :totalPage="totalPage1" :getData="getData1"></ori-table>
				</TabPane>
				<TabPane label="拉线位移数据" name="name1">
					<ori-table :columns= "columns2" :dataSource="dataSource2" :loading="loading" :adaptCount="adaptCount2"
					  :currentPage="currentPage2" :totalPage="totalPage2" :getData="getData2"></ori-table>
				</TabPane>
				<TabPane label="GNSS位置数据" name="name2">
					<ori-table :columns= "columns3" :dataSource="dataSource3" :loading="loading" :adaptCount="adaptCount3"
					  :currentPage="currentPage3" :totalPage="totalPage3" :getData="getData3"></ori-table>
				</TabPane>
			</Tabs>
		</div>
		
	</div>
</template>

<script>
	import * as api from '@/api/hideDangerPoint';
	import OriTable from '@/components/OriTable';
	import { limitDateStr } from '@/common/other';
	import * as yhdApi from '@/api/hideDangerPoint';
	import * as jcdApi from '@/api/monitorPoint';
	export default {
		components:{
			OriTable,
		},
		data(){
			return{
				dateRange: [new Date(), new Date()],
        datePickerOpts: {
          disabledDate(currentDate){
            // 只能选择limitDate及之后的日期
            return Date.parse(new Date(limitDateStr)) >= Date.parse(currentDate);
          }
        },
        search: {
        	yhdNo: '',
        	jcdNo: ''
        },
				pointsHide:[],
				pointsMonitor:[],
				currentTab: 'name0',
				columns1: [
					{
						title:'隐患点名称',
						key:'jcca02A011',
						minWidth:120
					},
					{
						title:'隐患点编号',
						key:'jcca02A010',
						minWidth:120
					},
					{
						title:'类型',
						key:'type',
						minWidth:80
					},
					{
						title:'地理位置',
						key:'position',
						minWidth:200
					}
				],
				columns2: [
					{
						title:'隐患点名称',
						key:'jcca02A011',
						minWidth:120
					},
					{
						title:'隐患点编号',
						key:'jcca02A010',
						minWidth:120
					},
					{
						title:'类型',
						key:'type',
						minWidth:80
					},
					{
						title:'地理位置',
						key:'position',
						minWidth:200
					}
				],
				columns3: [
					{
						title:'隐患点名称',
						key:'jcca02A011',
						minWidth:120
					},
					{
						title:'隐患点编号',
						key:'jcca02A010',
						minWidth:120
					},
					{
						title:'类型',
						key:'type',
						minWidth:80
					},
					{
						title:'地理位置',
						key:'position',
						minWidth:200
					}
				],
				dataSource1: [],dataSource2: [],dataSource3: [],
				loading: true,
				pageSize: 10,
				adaptCount1: 0,adaptCount2: 0,adaptCount3: 0,
				currentPage1: 1,currentPage2: 1,currentPage3: 1,
				totalPage1: 1,totalPage2: 1,totalPage3: 1
			}
		},
		created(){
			this.getAllYhd();
			this.getJcdByYhd();
		},
		methods:{
			changeYhd(){
				this.search.jcdNo = '';
				this.pointsMonitor = [];
				this.getJcdByYhd();
			},
			getData(){
				if(this.currentTab === 'name0'){
					this.getData1();
				}else if(this.currentTab === 'name1'){
					this.getData2();
				}else if(this.currentTab === 'name2'){
					this.getData3();
				}
			},
			getAllYhd(){
				yhdApi.getAllData().then(result => {
					this.pointsHide = result.map(item => {
						return {
							label: item.jcca02A011,
							value: item.jcca02A010
						};
					});
				});
			},
			getJcdByYhd(type){
				jcdApi.getAllData(this.search.yhdNo).then(result => {
					this.pointsMonitor = result.map(item => {
						return {
							label: item.jcca03A011,
							value: item.jcca03A010
						};
					});
				});
			},
			getData1(){},
			getData2(){},
			getData3(){},
		}
	}
</script>

<style lang="less">
	.select_list{
		margin:0 10px;
		display: inline-block
	}
	.btn_select{
		margin-left:12px;
		background-color:#f39800!important
	}
	.ivu-tabs-bar{
		border-bottom:0;
		margin-bottom:0;
	}
	.ivu-tabs-content{
		// background-color: rgba(255,255,255,.04);
		.ivu-tabs-tabpane{
			background-color: rgba(255,255,255,.04);
		}
	}
	.ivu-tabs-nav .ivu-tabs-tab{
		color:rgba(0, 255, 255, 0.6);
		&:hover{
			color:#00ffff;
		}
		&.ivu-tabs-tab-active{
			color:#00ffff;
			background-color: rgba(255,255,255,.04);
		}
	}
	.ivu-tabs-ink-bar{display: none}
	.ivu-tabs-nav-container{margin-bottom:0;}
	.panel_box{
		margin:0 16px;
		padding-top:18px;
	}
</style>
