<template>
  <div id="login">
	  <img src="../../assets/login/bg2.png" alt="bg">
  	<div class="login_box">
  		<img src="../../assets/login/login_box.png" alt="">
  		<div class="core">
  			<div class="title">登录</div>
  			<Form ref="form" :model="form" :rules="rules" :label-width="0">
  			  <FormItem label="" prop="username" :show-message="validMsgVisble">
  				<Input v-model="form.username" placeholder="请输入账号" @on-blur="fillPwd" icon="ios-person">
  				</Input>
  			  </FormItem>
  			  <FormItem label="" prop="password" :show-message="validMsgVisble">
  				<Input type="password" v-model="form.password" @on-enter="login" placeholder="请输入密码" icon="ios-lock">
  				</Input>
  			  </FormItem>
  			</Form>
        <Checkbox v-model="isRemember">记住密码</Checkbox>
  			<div class="submitBtn">
  			  <Button @click="login" :long="true">
  				<span class="spacing">登</span>
  				<span>录</span>
  			  </Button>
  			</div>
  		</div>
  	</div>
  </div>
</template>

<script>
import { encode, decode } from '@/lib/util/base64';
import { getClientSize } from '@/lib/util/dom';
import { apiContextPath } from '@/api/index';
import * as api from '@/api/user';
// 用于rem技术，以20px为基准，最小值为16px
export function adaptFontSize() {
  var elem = document.getElementsByTagName('html')[0],
    { width, height } = getClientSize();
  elem.style.fontSize = Math.max(Math.min(width / 1920, height / 1080) * 20, 16) + 'px';
}
export default {
  name: 'Login',
  data(){
    return {
      form: {
        username: '',
        password: '',
        // validateCode: ''
      },
      validMsgVisble: false,
      rules: {
        username: [
          { required: true, message: '账号不能为空', trigger: 'blur' },
          { validator: (rule, value, callback) => {
            if(value.length > 20){
              callback(new Error('账号不超过20个字符'));
            }else{
              callback();
            }
          }, trigger: 'blur' }
        ],
        password: [
          { required: true, validator: (rule, value, callback) => {
            if(value === ''){
              callback(new Error('密码不能为空'));
            }else if(!(/^[a-zA-Z0-9]{6,16}$/.test(value))){
              callback(new Error('密码由6到16位字母或字母组成'));
            }else{
              callback();
            }
          }, trigger: 'blur' }
        ],
        validateCode: []
      },
      imgSrc: '',
      prevUrl: sessionStorage.prevUrl,
      isRemember: false
    }
  },
  created(){
    sessionStorage.removeItem('prevUrl');
    this.refreshImg();
  },
  mounted(){
    adaptFontSize();
    window.addEventListener('resize', adaptFontSize);
  },
  destroyed(){
    window.removeEventListener('resize', adaptFontSize);
  },
  computed: {},
  watch: {},
  methods: {
    refreshImg(){
      this.imgSrc = apiContextPath + '/validate/getVerify?username=' + this.form.username + '&' + Date.now();
    },
    fillPwd(){
      const field = encode(this.form.username);
      const pwd = localStorage[field];
      if(localStorage['remember' + field] === 'yes' && pwd){
        this.isRemember = true;
        this.form.password = decode(pwd);
      }
    },
    login(){
      this.validMsgVisble = true;
      this.$refs.form.validate(result => {
        if(result){
          api.login({...this.form})
          .then(result => {
            const field = encode(this.form.username);
            if(this.isRemember){
              localStorage['remember' + field] = 'yes';
              localStorage[field] = encode(this.form.password);
            }else{
              localStorage.removeItem('remember' + field);
              localStorage.removeItem(field);
            }
            sessionStorage.refreshToken = result.refreshToken;
            sessionStorage.token = result.token;
            sessionStorage.userId = result.userId;
            sessionStorage.username = this.form.username;
            location.href = this.prevUrl || (location.protocol + '//' + location.host + '/');
          });
        }
      });
    }
  }
}
</script>

<style lang="less">
html, body, #login{
  width: 100%;
  height: 100%;
}
#login{
  position: relative;
	overflow: hidden;
	img{
		width:100%;
		display: block;
	}
	.login_box{
		position: absolute;
		top:24%;
		width:40%;
		left:30%;
	}
	.core{
		width:48%;
		height:300px;
		position: absolute;
		top:20%;
		right:2%;
		padding:0 2.4rem;
		.title{
			font-size: 1.2rem;
			text-align: center;
			font-weight: bold;
			margin-bottom: .8rem;
			color:#333;
		}
		.ivu-input{
			border-top:0;
			border-left:0;
			border-right:0;
			background: transparent;
			box-shadow: none;
			border-radius: 0;
		}
		.ivu-btn{
			background-color: rgba(0, 198, 200, .6);
			border-radius: 3px;
			color:#fff;
			letter-spacing: 5px;
			padding:.3rem 15px .35rem;
			font-size: .9rem;
			margin-top:.8rem;
			&:hover{
				border-color:rgba(0, 198, 200, .6);
			}
		}
    .ivu-checkbox-focus {
      box-shadow: none;
    }
    .ivu-checkbox-inner{
      border-color: #8F9291;
      background-color: #8F9291;
      &:after{
        content: ' ';
        display: table;
        width: 4px;
        height: 8px;
        position: absolute;
        top: 1px;
        left: 4px;
        border: 2px solid #fff;
        border-top: 0;
        border-left: 0;
        transform: rotate(45deg) scale(1);
        transition: all .2s ease-in-out;
      }
    }
    .ivu-checkbox-checked{
      .ivu-checkbox-inner{
        border-color: #FF8A00;
        background-color: #FF8A00;
      }
    }
	}
}
</style>