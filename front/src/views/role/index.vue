<template>
  <div class="content-box">
    <div class="toolbar">
      <Button type="primary" class="btn_add" icon="md-add" @click="add">新建角色</Button>
    </div>
    <ori-table :columns= "columns" :dataSource="dataSource" :loading="loading" :adaptCount="adaptCount"
      :currentPage="currentPage" :totalPage="totalPage" :getData="getData"></ori-table>
    <Edit :title="editTitle" :refreshTable="getData" :id="editId"></Edit>
  </div>
</template>
<script>
import * as api from '@/api/role';
import OriTable from '@/components/OriTable';
import Edit from './edit';
export default {
  components: {
    OriTable,
    Edit
  },
  data(){
    return {
      columns: [
        {
          title: '权限名称',
          key: 'roleName'
        },
        {
          title: '权限描述',
          key: 'roleDes'
        },
        {
          title: '操作',
          key: 'id',
          render: (h, param) => {
            return [
              h('Button', {
                props: {
                  size: 'small',
                  type:'text'
                },
                on: {
                  click: () => {
                    this.modify(param.row);
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
                    this.del(param.row);
                  }
                }
              }, '删除')
            ];
          }
        }
      ],
      dataSource: [],
      loading: true,
      adaptCount: 0,
      currentPage: 1,
      totalPage: 1,
      pageSize: 10,
      editTitle: '',
      editId: ''
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
    getData(pageNum){
      this.loading = true
      api.getData({pageNum: pageNum || 1, pageSize: this.pageSize})
      .then(result => {
          this.dataSource = result;
          this.currentPage = 1;
          this.totalPage = 1;
          this.loading = false;
          this.adaptCount++;
      });
    },
    openEdit(){
      this.$store.commit('modal/openEdit');
    },
    add(){
      this.editTitle = '新建角色';
      this.editId = '';
      this.openEdit();
    },
    modify(rowData){
      this.editTitle = '编辑角色';
      this.editId = rowData.id;
      this.openEdit();
    },
    del(rowData){
      this.$Modal.confirm({
        title: '',
        content: '确认删除角色 “'+ rowData.roleName +'” 吗？',
        onOk: () => {
          api.del(rowData.id).then(result => {
            this.$Message.success('角色删除成功！');
            this.getData();
          });
        }
      });
    }
  }
}
</script>
<style scoped lang="less">
.role-mg{}
</style>