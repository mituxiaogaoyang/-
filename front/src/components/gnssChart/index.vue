<template>
  <div class="chart gnss-chart"></div>
</template>
<script>
import echarts from '@/common/echarts.custom';
import { getDomSize } from '@/lib/util/dom';
import binary16ToRgba from '@/lib/util/binary16ToRgba';
import { xAxisData, xData, yData, zData, _2dData, _3dData } from './demoData';
export default {
  name: 'gnss-chart',
  props: {
    options: {
      type: Object,
      default: () => {}
    },
    dataSource: {
      type: Object,
      default: () => {}
    }
  },
  data(){
    return {
      opts: {}
    };
  },
  watch: {
    dataSource(newVal, oldVal){
      if(newVal && newVal.dateArr && newVal.dateArr.length){
        this.update(dateArr, xshift, yshift, zshift, shift2d, shift3d);
      }
    }
  },
  created(){
    this.opts = Object.assign({}, this.options || {});
  },
  mounted(){
    this.init();
    
    window.addEventListener('resize', () => {
      const { width, height } = getDomSize(this.$el);
      this.chart && this.chart.resize(width, height);
    });
  },
  methods: {
    init(){
      this.chart = echarts.init(this.$el);
      const [ xColor, yColor, zColor, _2dColor, _3dColor ] = [ '#00ff18', '#ff8a00', '#ae00ff', '#009cff', '#fffc00' ];
      const option = {
        color: [ xColor, yColor, zColor, _2dColor, _3dColor ],
        grid: {
          top: 20,
          bottom: 28,
          left: 30,
          right: 24
        },
        legend: {
          right: 10,
          top: -5,
          itemWidth: 3,
          itemHeight: 4,
          itemGap: 5,
          textStyle: {
            color: 'rgba(255, 255, 255, 0.5)'
          },
          data:[
            { name: 'x', icon: 'circle' },
            { name: 'y', icon: 'circle' },
            { name: 'z', icon: 'circle' },
            { name: '2d', icon: 'circle' },
            { name: '3d', icon: 'circle' }
          ]
        },
        tooltip : {
          trigger: 'axis',
          confine: true,
          axisPointer: {
            type: this.opts.hasAxisPointer === true ? 'cross' : 'none',
            animation: false,
            label: {
              color: 'rgba(255, 255, 255, 0.5)',
              backgroundColor: '#505765'
            }
          },
          textStyle: {
            color: 'rgba(255, 255, 255, 0.5)',
          }
        },
        dataZoom: [
          {
            show: true,
            realtime: true,
            height: 8,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'transparent',
            dataBackground: {
              lineStyle: {
                opacity: 0
              },
              areaStyle: {
                opacity: 0
              }
            },
            fillerColor: 'rgba(255, 255, 255, 0.2)',
            handleStyle: {
              color: 'rgba(255, 255, 255, 0.2)'
            },
            textStyle: {
              color: 'rgba(255, 255, 255, 0)'
            },
            start: 65,
            end: 85
          },
          {
            type: 'inside',
            realtime: true,
            start: 65,
            end: 85
          }
        ],
        xAxis : [
          {
            type : 'category',
            boundaryGap : false,
            axisLine: {
              onZero: false,
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.5)'
              }
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              fontSize: 8,
              margin: 5
            },
            data : []
          }
        ],
        yAxis: [
          {
            name: '位移(mm)',
            type: 'value',
            nameGap: 8,
            nameTextStyle: {
              color: 'rgba(255, 255, 255, 0.5)',
              padding: [ 0, 0, 0, 20 ]
            },
            axisLine: {
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.5)'
              }
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              fontSize: 8,
              margin: 5
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.05)'
              }
            }
          }
        ],
        series: [
          {
            name:'x',
            type:'line',
            animation: false,
            symbol: 'none',
            areaStyle: {
            color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:binary16ToRgba(xColor)},{offset:1,color:binary16ToRgba(xColor,0)}])
            },
            lineStyle: {
              color: xColor,
              width: 1
            },
              data: []
          },
          {
            name:'y',
            type:'line',
            animation: false,
            symbol: 'none',
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:binary16ToRgba(yColor)},{offset:1,color:binary16ToRgba(yColor,0)}])
            },
            lineStyle: {
              color: yColor,
              width: 1
            },
              data: []
          },
          {
            name:'z',
            type:'line',
            animation: false,
            symbol: 'none',
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:binary16ToRgba(zColor)},{offset:1,color:binary16ToRgba(zColor,0)}])
            },
            lineStyle: {
              color: zColor,
              width: 1
            },
              data: []
          },
          {
            name:'2d',
            type:'line',
            animation: false,
            symbol: 'none',
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:binary16ToRgba(_2dColor)},{offset:1,color:binary16ToRgba(_2dColor,0)}])
            },
            lineStyle: {
              color: _2dColor,
              width: 1
            },
            data: []
          },
          {
            name:'3d',
            type:'line',
            animation: false,
            symbol: 'none',
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:binary16ToRgba(_3dColor)},{offset:1,color:binary16ToRgba(_3dColor,0)}])
            },
            lineStyle: {
              color: _3dColor,
              width: 1
            },
            data: []
          }
        ]
      };
      this.chart.setOption(option);
    },
    update(xAxisData, xData, yData, zData, _2dData, _3dData){
      this.chart.setOption({
        xAxis: [
          {
            data : xAxisData
          }
        ],
        series: [
          {
            data: xData
          },
          {
            data: yData
          },
          {
            data: zData
          },
          {
            data: _2dData
          },
          {
            data: _3dData
          }
        ]
      });
    }
  }
}
</script>
<style scoped lang="less">
.gnss-chart{
}
</style>