<template>
	<div class="chart_rain">
		<div class="chart_box">
			<div class="top">
				<div class="name">雨量统计</div>
				<div class="btns">
					<RadioGroup v-model="xSet" type="button" @on-change="changeX">
						<Radio label="按小时"></Radio>
						<Radio label="按天"></Radio>
					</RadioGroup>
				</div>
			</div>
			<div :id="idName" class="echart_self"></div>
		</div>
		<div class="data_lists">
			<div class="all">
				<div class="label">总降雨量</div>
				<div class="val"><span>233</span>mm</div>
			</div>
			<div class="others">
				<div class="list">
					<div class="label">日均降雨量</div>
					<div class="val"><span>233</span>mm</div>
				</div>
				<div class="list">
					<div class="label">时均降雨量</div>
					<div class="val"><span>233</span>mm</div>
				</div>
				<div class="list">
					<div class="label">日最大降雨量</div>
					<div class="val"><span>233</span>mm</div>
				</div>
				<div class="list">
					<div class="label">时最大降雨量</div>
					<div class="val"><span>233</span>mm</div>
				</div>
				<div class="list">
					<div class="label">日最小雨强</div>
					<div class="val"><span>233</span>mm</div>
				</div>
				<div class="list">
					<div class="label">时最小雨强</div>
					<div class="val"><span>233</span>mm</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	var echarts = require('echarts');
	export default{
		data(){
			return{
				xSet:'按小时'
			}
		},
		props:['idName'],
		created(){
			this.dataX = ['0时','1时','2时','3时','4时','5时','6时','7时','8时','9时','10时','11时','12时','13时','14时','15时','16时','17时','18时','19时',]
			this.dataY = [200,34,45,667,88,123,457,888,245,657,800,232,345,878,999,23,345,577,881,433]
		},
		mounted(){
			this.drawChart()
		},
		methods:{
			changeX(a){
				if(a==='按天'){
					this.dataX = ['3日','4日','5日','6日','7日','8日','9日','10日','11日','12日','13日','14日','15日','16日','17日','18日','19日','20日','21日','22日']
				}else{
					this.dataX=['0时','1时','2时','3时','4时','5时','6时','7时','8时','9时','10时','11时','12时','13时','14时','15时','16时','17时','18时','19时',]
				}
				this.drawChart()
			},
			drawChart(){
				let myChart = echarts.init(document.getElementById(this.idName));
				let option = {
					 xAxis: {
						type: 'category',
						data:this.dataX
					},
					yAxis: {
						type: 'value'
					},
					dataZoom:[
						{
							type: 'inside',
							start: 30,
							end: 70,
							xAxisIndex: [0]
						}
					],
					series: [{
						data: this.dataY,
						type: 'bar'
					}]
				}
				myChart.setOption(option)
			}
		}
	}
</script>

<style lang="less">
	.chart_rain{
		.chart_box{
			width:800px;
			float:left;
			.top{
				.name{
					float:left;
					font-size: 16px;
					font-weight: bold
				}
				.btns{
					float:right
				}
				&:after{
					content:'';
					display: block;
					clear: both
				}
			}
			.echart_self{
				height:500px;
			}
		}
		.data_lists{
			margin-top:70px;
			margin-left:30px;
			float:left;
			width:300px;
			line-height: 1.6;
			.label{
				color:#999;
			}
			.val{
				
				span{
					font-size: 18px;
				}
			}
			.all{
				font-size: 16px;
				span{
					font-size: 20px;
				}
			}
			.others{
				margin-top:15px;
				display: flex;
				flex-wrap: wrap;
				justify-content: space-between;
				.list{
					width:40%;
					margin:8px 0;
				}
			}
		}
	}
	
</style>
