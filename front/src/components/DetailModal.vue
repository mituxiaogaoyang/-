<template>
  <Modal v-model="visible"
    class-name="detail-modal"
    :width="width || 920"
    :closable="false"
    :mask-closable="false">
    <div slot="header">
      <span>{{title || '标题'}}</span>
      <Icon type="ios-close" @click="cancel"></Icon>
    </div>
    <slot></slot>
    <div slot="footer">
      <Button type="primary" @click="cancel">关闭</Button>
    </div>
  </Modal>
</template>
<script>
// import { mapState } from 'vuex';
export default {
  name: 'detail-modal',
  props: ['width', 'title'],
  data(){
    return {
    };
  },
  computed: {
    // ...mapState('modal', {
    //   visible: state => state.detailVisible
    // })
    visible(){
      return this.$store.state.modal.detailVisible;
    }
  },
  methods: {
    cancel(){
      this.$emit('cancel');
    }
  }
}
</script>
<style lang="less">
.detail-modal {
  .ivu-modal-header {
    font-size: 16px;
    border-top-left-radius: 18px;
    border-top-right-radius: 18px;
    .ivu-icon-ios-close {
      float: right;
      font-size: 24px;
      margin-top: -4px;
      cursor: pointer;
    }
  }
}
</style>