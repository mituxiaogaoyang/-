<template>
  <div class="content-box">
    <div class="toolbar">
      <div class="select_list">
        <span class="label">选择隐患点：</span>
        <Select v-model="search.yhdNo" @on-change="changeYhd" clearable>
          <Option v-for="item in pointsHide" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
      </div>
      <div class="select_list">
        <span class="label">选择监测点：</span>
        <Select v-model="search.jcdNo" clearable>
          <Option v-for="item in pointsMonitor" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
      </div>
      <div class="select_list">
        <span class="label">选择时间：</span>
        <DatePicker type="daterange" format="yyyy-MM-dd" :value='dateRange' :options="datePickerOpts" placement="bottom-end" :clearable="false" :editable="false"></DatePicker>
      </div>
       <Button type="primary" class="btn_select" @click="preview">报表预览</Button>
       <a><Button type="primary" class="btn_select" @click="preview">报表下载</Button></a>
    </div>
    <div class="report-preview">
      <div id="flashContent"></div>
    </div>
    <remote-js src="./flexPaper/flexpaper_flash.js"></remote-js>
    <remote-js src="./flexPaper/swfobject.js"></remote-js>
  </div>
</template>

<script>
  import { limitDateStr } from '@/common/other';
  import * as yhdApi from '@/api/hideDangerPoint';
  import * as jcdApi from '@/api/monitorPoint';
  export default {
    components:{
      'remote-js': {
        render(createElement){
          return createElement('script', {attrs: {type: 'text/javascript', src: this.src}})
        },
        props: {
          src: {type: String, required: true}
        }
      },
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
        pointsMonitor:[]
      }
    },
    created(){
      this.getAllYhd();
      this.getJcdByYhd('select');
    },
    mounted(){
      this.previewContainer = this.$el.querySelector('.report-preview');
    },
    methods:{
      initFlexpaper(url){
        setTimeout(() => {
          if(swfobject){
            // 移除旧的
            swfobject.removeSWF('FlexPaperViewer');
            // 创建新的
            const elem = document.createElement('div');
            elem.id = 'flashContent';
            this.previewContainer.appendChild(elem);
            const swfVersionStr = "10.0.0", 
              xiSwfUrlStr = "flexPaper/playerProductInstall.swf",
              flashvars = {
                // 部分参数无效
                SwfFile : escape(url), // 需要使用FlexPaper打开的文档
                Scale : 0.6, // 初始化缩放比例，参数值应该是大于零的整数（1=100%）
                // FlexPaper中缩放样式，它使用和Tweener一样的样式，默认参数值为easeOut，其他可选值包括：easenone，easeout，linear，easeoutquad
                ZoomTransition : "easeOut",
                ZoomTime : 0.5, // 从一个缩放比例变为另外一个缩放比例需要花费的时间，该参数值应该为0或更大
                ZoomInterval : 0.1, // 缩放比例之间间隔，默认值为0.1，该值应该为正数
                FitPageOnLoad : true, // 初始化时自适应页面，与使用工具栏上的适应页面按钮同样的效果
                FitWidthOnLoad : true, // 初始化时自适应页面宽度，与工具栏上的适应宽度按钮同样的效果
                // 当设置为true时，展示文档时不会加载完整个文档，而是逐步加载，但是需要将文档中转化为9以上的版本（使用pdf2swf的时候使用-T 9标签）
                ProgressiveLoading : false,
                MinZoomSize : 0.2, // 设置最小的缩放比例
                MaxZoomSize : 5, // 设置最大的缩放比例
                SearchMatchAll : true, // 设置为true时，单击搜索所有符合条件的地方高亮显示
                InitViewMode : 'Portrait', // 设置启动模式如“Portrait”或“TowPage”
                PrintEnabled : false,
                PrintToolsVisible : false, // 工具栏上时候显示打印工具
                PrintPaperAsBitmap : false,
                ViewModeToolsVisible : true, // 工具栏上是否显示样式选择框
                // 当设置为true时，单击全拼按钮会打开一个FlexPaper最大化的新窗口而不是全屏，当由于flash播放器因为安全而禁止全屏，而使用flexpaper作为独立的flash播放器的时候设置为true是个优先选择
                FullScreenAsMaxWindow : false,
                FullScreenVisible : true, // 工具栏上时候显示全屏工具
                ZoomToolsVisible : true, // 工具栏上时候显示缩放工具
                NavToolsVisible : true, // 工具栏上是否显示导航工具
                CursorToolsVisible : true, //工具栏上是否显示光标工具
                SearchToolsVisible : true, // 工具栏上是否显示搜索工具
                localeChain: "zh_CN" // 设置地区（语言）
              },
              params = {
                quality: "high",
                bgcolor: "#fff",
                allowscriptaccess: "sameDomain",
                allowfullscreen: "true"
              },
              attributes = {
                id: "FlexPaperViewer",
                name: "FlexPaperViewer"
              };
            swfobject.embedSWF(  
              "flexPaper/FlexPaperViewer.swf", "flashContent",
              "100%", "100%",
              swfVersionStr, xiSwfUrlStr,
              flashvars, params, attributes);
            swfobject.createCSS("#flashContent", "display:block;text-align:left;");
            this.previewContainer.className = 'report-preview inited';
          }else{
            this.initFlexpaper();
          }
        }, 1000);
      },
      changeYhd(){
        this.search.jcdNo = '';
        this.pointsMonitor = [];
        this.getJcdByYhd();
      },
      preview(){
        // this.initFlexpaper('/apiPath/swffile/hanyunxi.swf');
        this.initFlexpaper('aa.swf');
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
      getJcdByYhd(){
        jcdApi.getAllData(this.search.yhdNo).then(result => {
          this.pointsMonitor = result.map(item => {
            return {
              label: item.jcca03A011,
              value: item.jcca03A010
            };
          });
        });
      }
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
  .report-preview{
    height: 100%;
    position: relative;
    &.inited:before{
      content: '';
      position: absolute;
      top: 1px;
      left: 1px;
      width: 25px;
      height: 24px;
      background: linear-gradient(0deg, rgb(230, 230, 230), rgb(251, 251, 251));
    }
  }
</style>
