<template>
  <div>
    <Menu :active-name="activeName"  width="245px" :open-names="openNames">
      <div v-for="(item, i) in dataSource" :key="i">
        <MenuItem v-if="!item.children && item.menuPath"
          :to="item.menuPath" :name="item.menuPath">
            <i :class="item.iconClass"></i>
            <span>{{item.menuName}}</span>
          </MenuItem>
        <Submenu v-else :name="'' + i">
          <template slot="title">
            <i :class="item.iconClass"></i>
            <span>{{item.menuName}}</span>
          </template>
          <MenuItem v-for="(child, j) in item.children" :key="j"
            :to="child.menuPath" :name="child.menuPath">{{child.menuName}}</MenuItem>
        </Submenu>
      </div>
    </Menu>
  </div>
</template>
<script>
export default {
  name: 'ori-menu',
  data(){
    return {
      activeName: '',
      openNames: [] // 该属性生效前提：①Menu树中数据已加载完成；②需在Menu组件mounted事件触发之前赋值；
    };
  },
  mounted(){
	  this.activeName = this.$route.path;
  },
  computed: {
    dataSource(){
      return this.$store.state.menuData;
    }
  },
  watch: {
    dataSource(newVal, oldVal){
      if(newVal && newVal.length){
        this.$nextTick(() => {
          // 需在menu树dom加载完后初始化默认选中
          this.initSelected(newVal);
        });
      }
    },
    '$route'(to, from){ //不跳转 直接进入页面无法检测到route变化
      this.activeName = to.path;
    }
  },
  created(){
  },
  methods: {
    initSelected(data){
      const path = document.URL.replace(location.protocol + '//' + location.host + '/#', '');
      this.activeName = path;
      this.$router.push(path);

      // 默认展开Submenu
      // var i = data.findIndex(item => {
      //   return item.children && item.children.findIndex(child => path === child.menuPath) > -1;
      // });
      // i > -1 && this.openNames.push('' + i);
    }
  }
}
</script>
<style lang="less">
  .menu {
    .ivu-menu{
      color:rgba(0, 255, 255, .6);
    }
	  .ivu-menu-light{background: #021111}
	  .ivu-menu-vertical.ivu-menu-light:after{display: none}
	  // .ivu-menu-submenu.ivu-menu-item-active .ivu-menu-item-active:hover{background:none!important}
    // .ivu-menu-light.ivu-menu-vertical .ivu-menu-item-active:not(.ivu-menu-submenu){background:none}
	  .ivu-menu-light.ivu-menu-vertical .ivu-menu-item-active:not(.ivu-menu-submenu):after{display: none}
	  .ivu-menu-vertical .ivu-menu-item, .ivu-menu-vertical .ivu-menu-submenu-title{padding:14px ;}
	  .ivu-menu-vertical .ivu-menu-submenu-title span{vertical-align: middle}
		.ivu-menu-vertical .ivu-menu-submenu .ivu-menu-item{text-indent: 28px;}
    .ivu-menu-item, .ivu-menu-submenu{
      &.ivu-menu-item-active{
        .ivu-menu-submenu-title{
          color: #0ff;
        }
        a.ivu-menu-item-active{
          position: relative;
          &:before{
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            width: 2px;
            height: 100%;
            background-color: #FF9000;
          }
        }
      }
    }
    i[class$=Icon]{
      display: inline-block;
      width: 26px;
      height: 26px;
      margin-right: 15px;
			margin-left:12px;
      vertical-align: middle;
      background-size: contain;
		  background-repeat: no-repeat;
		  background-position: center;
    }
    .warningIcon{
      background-image: url(../assets/menu/menu3.png);
    }
    .analysisIcon{
      background-image: url(../assets/menu/menu2.png);
    }
    .baseIcon{
      background-image: url(../assets/menu/menu1.png);
    }    
    .userIcon{
      background-image: url(../assets/menu/menu4.png);
    }
	  .commandIcon{
		  background-image: url(../assets/menu/menu5.png);
	  }
  }
</style>