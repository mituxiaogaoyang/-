<template>
	<!-- <Menu active-name="喜德县" :open-names="['凉山州']" width="200"   @on-select="selectRegion">
		<Submenu :name="region.name" v-for="region in regions">
			<template slot="title">
					{{region.name}}
			</template>
			<MenuItem  v-for="(data,i) in region.childs" :name="data.name" :key='i'>{{data.name}}</MenuItem>
		</Submenu>
	</Menu> -->
	<div id="menu_tree">
		<ul class="city_list">
			<li v-for="city in regions" :key="city.name">
				<div class="name">{{city.name}}</div>
				<ul class="county_list">
					<li v-for="county in city.childs" :key="county.name" :class="{active:county.active}">{{county.name}}</li>
				</ul>
			</li>
		</ul>
	</div>
</template>

<script>
	export default{
		data(){
			return{
				regions:[
					{
						name:'凉山州',
						childs:[
							{name:'冕宁县'},
							{name:'喜德县',active:true},
							{name:'越西县'},
							{name:'甘洛县'},
						]
					},
					{
						name:'成都市',
						childs:[
							{name:'郫县'},
						]
					},
					{
						name:'绵阳市',
					},
				],
			}
		},
		methods:{
			selectRegion(a){
				console.log(a)
			}
		}
	}
</script>

<style lang="less">
	#menu_tree{
		color:rgba(0, 255, 255, 0.6);
		margin-left:52px;
		.city_list{
			position: relative;
			&>li{
				position: relative;
				margin-top:28px;
				&:first-child{margin-top:0}
				.name{
					font-size: 16px
				}
				&:before{
					content:"";
					display: block;
					position: absolute;
					top:10px;
					left:-22px;
					width:18px;
					height: 0px;
					border-bottom:2px dotted rgba(0, 255, 255, 0.3)
				}
				.county_list{
					position: relative;
					&:before{
						content:"";
						display: block;
						position: absolute;
						top:-20px;
						left:5px;
						width:1px;
						bottom: 16px;
						border-left:2px dotted rgba(0, 255, 255, 0.3)
					}
					&>li{
						margin:18px 24px;
						height: 32px;
						cursor: pointer;
						line-height: 30px;
						width:74px;
						border:1px solid #00ffff;
						border-radius: 16px;
						text-align: center;
						position: relative;
						&.active{
							background-color: rgba(233, 132, 0);
							border-color: rgba(233, 132, 0, 0.6);
							color:rgba(255,255,255,.7)
						}
						&:before{
							content:"";
							display: block;
							position: absolute;
							top:13px;
							left:-16px;
							width:12px;
							height: 0px;
							border-bottom:2px dotted rgba(0, 255, 255, 0.3)
						}
					}
				}
			}
			&:before{
				content:"";
				display: block;
				position: absolute;
				top:10px;
				left:-22px;
				width:1px;
				bottom: 14px;
				border-left:2px dotted rgba(0, 255, 255, 0.3)
			}
		}
	}
</style>
