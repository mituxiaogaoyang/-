<template>
  <div class="gnss-box">
    <div class="shift-chart">
      <gnss-chart :dataSource="shiftData"></gnss-chart>
    </div>
    <div class="item">
      <div class="speed-chart"></div>
      <div class="acceleration-chart"></div>
    </div>
    <div class="item">
      <div class="scatter-chart"></div>
      <div class="vector-chart"></div>
    </div>
  </div>
</template>
<script>
import echarts from '@/common/echarts.custom';
import GnssChart from '@/components/gnssChart';
import { isFunction, isNumber, isBoolean } from '@/lib/util/type';
import { format } from '@/lib/util/time';
import { getDomSize } from '@/lib/util/dom';
import * as api from '@/api/monitorData';
const _option = {
  tooltip: {
    confine: true,
    trigger: 'axis',
    backgroundColor: 'rgba(50, 50, 50, .3)',
    axisPointer: {
      lineStyle: {
        color: '#eee'
      }
    }
  },
  legend: {
    top: 35,
    left: 200,
    itemGap: 30,
    textStyle: {
      color: '#666'
    },
    selectedMode: true,
    data:[]
  },
  grid: {
    top: 100,
    left: 90,
    right: 100,
    bottom: 90,
    containLabel: true
  },
  toolbox: {
    top: 30,
    right: 120,
    feature: {
      saveAsImage: {}
    }
  },
  xAxis: {
    name: '',
    nameGap: 60,
    nameLocation: 'middle',
    type: 'category',
    boundaryGap: false,
    axisLabel: {
      color: '#666',
      margin: 20
    },
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    splitLine: {
      show: false
    }
  },
  yAxis: {
    name: '',
    nameRotate: null,
    nameGap: 60,
    nameLocation: 'middle',
    type: 'value',
    axisLabel: {
      color: '#666',
      margin: 10
    },
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    splitLine: {
      lineStyle: {
        color: ['#eee']
      }
    }
  },
  color: ['#8fc220', '#92adcc', '#e57575', '#3ed0ae', '#f39902'],
  series: []
};
// origin箭头的中心点
function getArrowPoints(echartsApi, origin){
  // 箭头初始位置顶点垂直向上
  const points = [], distance = [10, 15]; // 底边，高的长度
  points.push([origin[0], origin[1] - distance[1] * 2 / 3]); // 顶点
  points.push([origin[0] - distance[0] / 2, origin[1] + distance[1] / 3]);
  points.push([origin[0] + distance[0] / 2, origin[1] + distance[1] / 3]);
  return points;
}
function getArrowAngle(point1, point2){
  const x = point2[0] - point1[0], y = point2[1] - point1[1];
  if(x === 0){
    // y>0时箭头垂直向下，y<0时箭头垂直向上
    return y > 0 ? Math.PI : 0;
  }else if(y === 0){
    // x>0时箭头水平向右，x<0时箭头水平向左
    return x > 0 ? Math.PI * 3 / 2 : Math.PI / 2;
  }else{
    const tan = Math.abs(y / x);
    if(x > 0 && y < 0){
      // 箭头指向右上方向
      return Math.atan(tan) - Math.PI / 2;
    }else if(x < 0 && y < 0){
      // 箭头指向左上方向
      return Math.PI / 2 - Math.atan(tan);
    }else if(x < 0 && y > 0){
      // 箭头指向左下方向
      return Math.PI / 2 + Math.atan(tan);
    }else {
      // 箭头指向右下方向
      return Math.PI * 3 / 2 - Math.atan(tan);
    }
  }
}
// 根据点的x、y轴的值获取该点在坐标系中的坐标
function getCoordFromValue(echartsApi, value1, value2){
  if(!value1 || !value2) return [];
  const point1 = echartsApi.coord([value1[0], value1[1]]),
    point2 = echartsApi.coord([value2[0], value2[1]]);
  return [{
    type: 'line',
    shape: {
      x1: point1[0],
      y1: point1[1],
      x2: point2[0],
      y2: point2[1]
    },
    style: echartsApi.style({
      stroke: echartsApi.visual('color')
    })
  }, {
    type: 'polyline',
    origin: point2,
    rotation: getArrowAngle(point1, point2),
    shape: {
      points: getArrowPoints(echartsApi, point2)
    },
    style: echartsApi.style({
      fill: echartsApi.visual('color')
    })
  }];
}
// 散点、矢量图tooltip格式化函数
function tooltipFormatter(chart, params, hasHistory){
  const legend = chart.getOption().legend;
  const isSelectedHistory = legend[0].selected['历史点'] === false ? false : true;
  return (hasHistory && isSelectedHistory ? ('历史点</br>' + params.marker.replace('#8fc220', '#92adcc').replace('#e57575', '#92adcc') + params.value.toString()) + '</br>' : '')
      + (params.seriesName + '</br>' + params.marker + params.value.toString());
}
// 判断起始点上是否存在历史点
function getHasHistory(coords){
  let startHasHistory = false,
    endHasHistory = false,
    len = coords.length;
  if(len > 1){
    const startCoord = coords[0];
    startHasHistory = !!coords.slice(1).find(item => startCoord[0] === item[0] && startCoord[1] === item[1]);
    const endCoord = coords[len - 1];
    endHasHistory = !!coords.slice(0, len - 1).find(item => endCoord[0] === item[0] && endCoord[1] === item[1]);
  }
  return {startHasHistory, endHasHistory};
}
// resize事件图表高宽适配
function resizeHandler(){
  const { width, height } = getDomSize(this.$el);
  const w = width * 0.48;
  this.speedChart.resize(w, height);
  this.accelerationChart.resize(w, height);
  this.scatterChart.resize(w, height);
  this.vectorChart.resize(w, height);
}
export default {
  components: {
    GnssChart
  },
  props: ['jcdNo', 'dateRange'],
  data(){
    return {
      shiftData: {}
    }
  },
  computed: {},
  watch: {},
  created(){
  },
  mounted(){
    // 不需要监听
    this.speedChart = echarts.init(this.$el.querySelector('.speed-chart'));
    this.speedChart.setOption(_option);
    this.accelerationChart = echarts.init(this.$el.querySelector('.acceleration-chart'));
    this.accelerationChart.setOption(_option);
    this.scatterChart = echarts.init(this.$el.querySelector('.scatter-chart'));
    this.scatterChart.setOption(_option);
    this.vectorChart = echarts.init(this.$el.querySelector('.vector-chart'));
    this.vectorChart.setOption(_option);
    this.resizeHandler = resizeHandler.bind(this);
    window.addEventListener('resize', this.resizeHandler);

    this.getData();
  },
  destroyed(){
    window.removeEventListener('resize', this.resizeHandler);
  },
  methods: {
    getData(){
      api.getAllGnssData({
        beginDate: format('yyyy-MM-dd HH:mm:ss', this.dateRange[0]),
        endDate: format('yyyy-MM-dd HH:mm:ss', this.dateRange[1]),
        jcdNo: this.jcdNo
      }).then(result => {
        // !result.length && this.$Message.info('站点在该时间段内无数据');
        // 位移图数据
        const xshift = result.map(item => item.xshift),
          yshift = result.map(item => item.yshift),
          zshift = result.map(item => item.zshift),
          shift2d = result.map(item => item.shift2D),
          shift3d = result.map(item => item.shift3D),
          dateArr = result.map(item => format('yyyy-MM-dd HH:mm:ss', item.collectionTime));
        this.shiftData = { dateArr, xshift, yshift, zshift, shift2d, shift3d };
        // 加速度图数据
        const xspeed = result.map(item => item.xspeed),
          yspeed = result.map(item => item.yspeed),
          zspeed = result.map(item => item.zspeed);
        this.getSpeedData(['X轴速度', 'Y轴速度', 'H轴速度'], { xspeed, yspeed, zspeed });
        // 加速度图数据
        const xacceleration = result.map(item => item.xacce),
          yacceleration = result.map(item => item.yacce),
          zacceleration = result.map(item => item.zacce);
        this.getAccelerationData(['X轴加速度', 'Y轴加速度', 'H轴加速度'], { xacceleration, yacceleration, zacceleration });
        // 散点图数据
        this.getScatterData(['起始点', '历史点', '结束点'], { xshift, yshift });
        // 矢量图数据
        this.getVectorData(['起始点', {
            name: '历史点',
            icon: 'triangle'
        }, '结束点'], { xshift, yshift });
      });
    },
    getShiftData(legendData, result){
      const series = [{
        name: 'X轴位移',
        type: 'line',
        data: (result.xshift || [])
      },{
        name: 'Y轴位移',
        type: 'line',
        data: (result.yshift || [])
      },{
        name: 'H轴位移',
        type: 'line',
        data: (result.zshift || [])
      },{
        name: '2D位移',
        type: 'line',
        data: (result.shift2d || [])
      },{
        name: '3D位移',
        type: 'line',
        data: (result.shift3d || [])
      }];
      this.refresh('shift', legendData, series, 'category', 'axis', result.dateArr || []);
    },
    getSpeedData(legendData, result){
      const series = [{
        name: 'X轴速度',
        type: 'line',
        data: (result.xspeed || [])
      },{
        name: 'Y轴速度',
        type: 'line',
        data: (result.yspeed || [])
      },{
        name: 'H轴速度',
        type: 'line',
        data: (result.zspeed || [])
      }];
      this.refresh('speed', legendData, series, 'category', 'axis', result.dateArr || []);
    },
    getAccelerationData(legendData, result){
      const series = [{
        name: 'X轴加速度',
        type: 'line',
        data: (result.xacceleration || [])
      },{
        name: 'Y轴加速度',
        type: 'line',
        data: (result.yacceleration || [])
      },{
        name: 'H轴加速度',
        type: 'line',
        data: (result.zacceleration || [])
      }];
      this.refresh('acceleration', legendData, series, 'category', 'axis', result.dateArr || []);
    },
    getScatterData(legendData, result){
      const xData = (result.xshift || []).filter(x => isNumber(x)),
        yData = (result.yshift || []).filter(y => isNumber(y));
      const coords = xData.map((x, i, array) => {
        return [x, yData[i]];
      });
      const series = [], len = coords.length;
      // 判断起始点上是否存在历史点
      const { startHasHistory, endHasHistory } = getHasHistory(coords);
      series.push({
        name: '起始点',
        type: 'scatter',
        symbolSize: 20,
        data: len === 0 ? [] : [coords[0]],
        encode: {
            tooltip: [0, 1]
        },
        tooltip: {
          formatter: (params) => {
            return tooltipFormatter(this.myChart, params, startHasHistory);
          }
        }
      }, {
        name: '历史点',
        type: 'scatter',
        symbolSize: 10,
        data: len > 2 ? coords.slice(1, -1) : [],
        encode: {
          tooltip: [0, 1]
        }
      }, {
        name: '结束点',
        type: 'scatter',
        symbolSize: 20,
        data: len > 1 ? [coords[len - 1]] : [],
        encode: {
            tooltip: [0, 1]
        },
        tooltip: {
          formatter: (params) => {
            return tooltipFormatter(this.myChart, params, endHasHistory);
          }
        }
      });
      this.refresh('scatter', legendData, series, 'value', 'item');
    },
    getVectorData(legendData, result){
      const xData = (result.xshift || []).filter(x => isNumber(x)),
        yData = (result.yshift || []).filter(y => isNumber(y));
      const coords = xData.map((x, i, array) => {
        return [x, yData[i]];
      });
      const series = [], len = coords.length;
      function renderItem(params, echartsApi){
        let children = [];
        const value1 = coords[params.dataIndexInside],
          value2 = coords[params.dataIndexInside + 1];
        // 根据点的x、y轴的值获取该点在坐标系中的坐标
        children = children.concat(getCoordFromValue(echartsApi, value1, value2));
        if(coords.length > 2 && params.dataIndexInside === params.dataInsideLength - 1){
          const value3 = coords[params.dataIndexInside + 1],
            value4 = coords[params.dataIndexInside + 2];
          children = children.concat(getCoordFromValue(echartsApi, value3, value4));
        }
        return {
          type: 'group',
          children: children
        };
      }
      // 判断起始点上是否存在历史点
      const { startHasHistory, endHasHistory } = getHasHistory(coords);
      series.push({
        name: '起始点',
        type: 'scatter',
        symbolSize: 20,
        data: len === 0 ? [] : [coords[0]],
        encode: {
          tooltip: [0, 1]
        },
        tooltip: {
          formatter: (params) => {
            return tooltipFormatter(this.myChart, params, startHasHistory);
          }
        }
      },{
        name: '历史点',
        type: 'custom',
        renderItem: renderItem,
        symbolSize: 6,
        data: len === 2 ? [coords[0]] : coords.slice(1, -1),
        encode: {
          tooltip: [0, 1]
        },
        tooltip: {
          formatter(params){
            return len === 2 ? '' : (params.seriesName + '</br>' + params.marker + params.value.toString());
          }
        }
      },{
        name: '结束点',
        type: 'scatter',
        symbolSize: 20,
        data: len > 1 ? [coords[len - 1]] : [],
        encode: {
          tooltip: [0, 1]
        },
        tooltip: {
          formatter: (params) => {
            return tooltipFormatter(this.myChart, params, endHasHistory);
          }
        }
      });
      this.refresh('vector', legendData, series, 'value', 'item');
    },
    refresh(target, legendData, series, xAxisType, tipTriggerType, xAxisData){
      const hasData = !!series[0].data.filter(value => value !== null).length;
      let xAxisName = '', yAxisName = '';
      switch(this.type){
        case 'shift':
          xAxisName = '时间';
          yAxisName = '位移(mm)';
          break;
        case 'speed':
          xAxisName = '时间';
          yAxisName = '速度(mm/h)';
          break;
        case 'acceleration':
          xAxisName = '时间';
          yAxisName = '加速度(mm/h²)';
          break;
        case 'scatter':
          xAxisName = 'x(mm)';
          yAxisName = 'y(mm)';
          break;
        case 'vector':
          xAxisName = 'x(mm)';
          yAxisName = 'y(mm)';
          break;
      }
      const opts = {
        tooltip: {
          trigger: tipTriggerType
        },
        legend: {
          data: legendData,
          selectedMode: this.type === 'vector' ? false : true
        },
        series: series
      };
      opts.xAxis = {
        name: xAxisName,
        nameRotate: null,
        // nameGap: hasData || legendData[0].indexOf('X轴') === 0 ? 60 : 35,
        nameGap: hasData ? 60 : 35,
        nameLocation: 'middle',
        type: xAxisType,
        boundaryGap: false,
        axisLabel: {
          color: '#666',
          margin: 20
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        }
      }
      xAxisData && (opts.xAxis.data = xAxisData);
      opts.yAxis = {
        name: yAxisName,
        nameGap: hasData ? 60 : 36
      };
      this[target + 'Chart'].setOption(opts);
    }
  }
}
</script>
<style scoped lang="less">
.gnss-box{
  width: 100%;
  height: 100%;
  .shift-chart{
    height: 420px;
    >div{
      width: 100%;
      height: 100%;
    }
  }
  .item{
    height: 420px;
    margin-top: 30px;
    >div{
      float: left;
      width: 48%;
      height: 100%;
      &:first-child{
        margin-right: 4%;
      }
    }
  }
}
</style>