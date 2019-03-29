<template>
	<div class="chart_rain">
		<div class="chart_box">
			<div :id="idName" class="echart_self"></div>
		</div>
	</div>
</template>

<script>
	var echarts = require('echarts');
	export default{
		data(){
			return{
				
			}
		},
		props:['idName'],
		created(){
			this.dataX = ['2009/6/12 2:00', '2009/6/12 3:00', '2009/6/12 4:00', '2009/6/12 5:00', '2009/6/12 6:00', '2009/6/12 7:00', '2009/6/12 8:00', '2009/6/12 9:00', '2009/6/12 10:00', '2009/6/12 11:00', '2009/6/12 12:00', '2009/6/12 13:00', '2009/6/12 14:00', '2009/6/12 15:00', '2009/6/12 16:00', '2009/6/12 17:00']
			this.dataY1 = [200,34,45,667,88,123,457,888,245,657,800,232,345,878,999,23,345,577,881,433]
			this.dataY2 = [0.1,1.2,0.7,0.5,1.3,3,3.7,2.5,4.6,6,3,2,5,6.1,3,4.5]
		},
		mounted(){
			this.drawChart()
		},
		methods:{
			drawChart(){
				let myChart = echarts.init(document.getElementById(this.idName));
				let option = {
					 legend: {
						data:['位移变化','位移变化速率'],
						x: 'left'
					},
					 xAxis: {
						type: 'category',
						data:(this.dataX).map(str=>{return str.replace(' ','\n')})
					},
					yAxis: {
						type: 'value'
					},
					yAxis: [
						{
							name: '位移变化(mm)',
							type: 'value',
						},
						{
							name: '位移变化速率(mm/s)',
							nameLocation: 'start',
							type: 'value',
							inverse: true
						}
					],
					dataZoom:[
						{
							type: 'inside',
							start: 30,
							end: 70,
							xAxisIndex: [0]
						}
					],
					series: [
						{
							name:'位移变化',
							type:'line',
							animation: false,
							data:this.dataY1
						},
						{
							name:'位移变化速率',
							type:'line',
							 yAxisIndex:1,
							animation: false,
							data:this.dataY2
						}
					]
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
