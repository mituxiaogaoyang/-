<template>
  <EditModal :title="title || '新增'" @cancel="close" @sure="sure">
    <div class="user-edit">
      <Form ref="form" :model="form" :rules="rules" :label-width="80">
        <FormItem label="登录账户" prop="userName">
          <Input type="text" v-model="form.userName"></Input>
        </FormItem>
        <FormItem v-if="!id" label="密码" prop="password">
          <Input type="password" v-model="form.password"></Input>
        </FormItem>
        <FormItem label="用户名" prop="userNick">
          <Input type="text" v-model="form.userNick"></Input>
        </FormItem>
        <FormItem label="手机号" prop="phone">
          <Input type="text" v-model="form.phone"></Input>
        </FormItem>
        <FormItem label="角色" prop="roleIds">
          <Select multiple v-model="form.roleIds">
            <Option v-for="item in roleData" :value="item.id">{{item.roleName}}</Option>
          </Select>
        </FormItem>
      </Form>
    </div>
  </EditModal>
</template>
<script>
// import { mapMutations } from 'vuex';
import EditModal from '@/components/EditModal';
import * as api from '@/api/user';
import { getData as getAllRole } from '@/api/role';
import regExp from '@/lib/regExp';
const formData = {
  userName: '',
  password: '',
  userNick: '',
  phone: '',
  roleIds: ''
};
export default {
  components: {
    EditModal
  },
  props: ['title', 'id', 'refreshTable'],
  data(){
    return {
      submiting: false,
      roleData: [],
      form: {
        ...formData
      },
      rules: {
        userName: [
          { required: true, message: '请输入登录账户', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' }
        ],
        userNick: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请确认手机号', trigger: 'blur' },
          { validator: (rule, value, callback) => {
            if(regExp.mobile.test(value)){
              callback();
            }else{
              callback(new Error('手机号码格式错误'));
            }
          }, trigger: 'blur' }
        ],
        roleIds: [
          { required: true, validator: (rule, value, callback) => {
            if(value && value.length){
              callback();
            }else{
              callback(new Error('请选择角色'));
            }
          }, trigger: 'blur' }
        ]
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
    getAllRole().then(result => {
      this.roleData = result;
    });
  },
  methods: {
    // ...mapMutations('modal', ['closeEdit']),
    init(id){
      this.form.id = id;
      api.getInfo(id).then(result => {
        Object.keys(formData).forEach(field => {
          if(field === 'roleIds'){
            this.form.roleIds = result.roleList.map(item => item.id);
          }else{
            this.form[field] = result[field];
          }
        });
      });
    },
    close(){
      this.$store.commit('modal/closeEdit');
      this.$refs.form.resetFields();
      delete this.form.id;
      this.submiting = false;
    },
    sure(){
      this.$refs.form.validate(result => {
        if(result && !this.submiting){
          this.submiting = true;
          api.save({
            ...this.form
          }).then(() => {
            this.$Message.success('用户'+ (!this.id ? '新建' : '更新') +'成功！');
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
.user-edit {
}
</style>