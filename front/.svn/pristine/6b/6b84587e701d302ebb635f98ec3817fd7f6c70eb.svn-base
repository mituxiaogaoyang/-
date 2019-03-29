<template>
  <EditModal :title="title || '新增'" :submiting="submiting" @cancel="close" @sure="sure">
    <div class="role-edit">
      <Form ref="form" :model="form" :rules="rules" :label-width="80">
        <FormItem label="权限名称" prop="roleName">
          <Input type="text" v-model="form.roleName"></Input>
        </FormItem>
        <FormItem label="权限编码" prop="roleCode">
          <Input type="text" v-model="form.roleCode"></Input>
        </FormItem>
        <FormItem label="描述" prop="roleDes">
          <Input type="text" v-model="form.roleDes"></Input>
        </FormItem>
      </Form>
      <div class="permission">
        <span>权限分配</span>
        <Tree ref="tree" :data="menuData" show-checkbox></Tree>
      </div>
    </div>
  </EditModal>
</template>
<script>
// import { mapMutations } from 'vuex';
import EditModal from '@/components/EditModal';
import * as api from '@/api/role';
import { getAllData as getAllMenu } from '@/api/menu';
import arrayToTree from '@/common/menu';
const formData = {
  roleName: '',
  roleCode: '',
  roleDes: ''
};
export default {
  components: {
    EditModal
  },
  props: ['title', 'id', 'refreshTable'],
  data(){
    return {
      submiting: false,
      menuData: [],
      form: {
        ...formData
      },
      rules: {
        roleName: [
          { required: true, message: '请输入权限名称', trigger: 'blur' },
          { type: 'string', max: 20, message: '权限名称不超过20个字符', trigger: 'blur' }
        ],
        roleCode: [
          { required: true, message: '请输入权限编码', trigger: 'blur' },
          { validator: (rule, value, callback) => {
            if(/^[a-zA-Z]*$/.test(value) && value.length <= 20){
              callback();
            }else{
              callback(new Error('权限名称不超过20个字母'));
            }
          }, trigger: 'blur' }
        ],
        roleDes: [
          { required: true, message: '请输入描述', trigger: 'blur' },
          { type: 'string', max: 100, message: '权限名称不超过100个字符', trigger: 'blur' }
        ],
      }
    };
  },
  computed: {
    visible(){
      return this.$store.state.modal.editVisible;
    }
  },
  watch: {
    visible(newVal, oldVal){
      newVal && this.id && this.init(this.id);
    }
  },
  created(){
    getAllMenu().then(result => {
      result = arrayToTree(result);
      result = result.map(item => {
        return {
          id: item.id,
          title: item.menuName,
          checked: false,
          indeterminate: false,
          children: (item.children || []).map(child => {
            return {
              id: child.id,
              checked: false,
              title: child.menuName
            };
          }),
          expand: true
        };
      });
      this.menuData = result;
    });
  },
  methods: {
    // ...mapMutations('modal', ['closeEdit']),
    init(id){
      this.form.id = id;
      api.getInfo(id).then(result => {
        Object.keys(formData).forEach(field => this.form[field] = result[field]);
        this.clearChecked();
        const treeData = this.$refs.tree.data;
        result.menuList.forEach(item => {
          treeData.forEach(node => {
            (node.children || []).forEach(child => {
              item.id === child.id && (child.checked = true);
            });
          });
        });
      });
    },
    clearChecked(){
      this.$refs.tree.data.forEach(item => {
        item.checked = false;
        item.indeterminate = false;
        (item.children || []).forEach(child => child.checked = false);
      });
    },
    close(){
      this.$store.commit('modal/closeEdit');
      this.$refs.form.resetFields();
      delete this.form.id;
      this.clearChecked();
      this.submiting = false;
    },
    sure(){
      this.$refs.form.validate(result => {
        if(result && !this.submiting){
          this.submiting = true;
          const checkedNodes = this.$refs.tree.getCheckedNodes();
          api.save({
            ...this.form,
            menuList: checkedNodes.map(item => item.id)
          }).then(() => {
            this.$Message.success('角色'+ (!this.id ? '新建' : '更新') +'成功！');
            this.close();
            this.refreshTable();
          }).catch(() => this.submiting = false);
        }
      });
    }
  }
}
</script>
<style scoped lang="less">
.role-edit {
  .permission {
    margin-left: 20px;
  }
}
</style>