<template>
  <modal name="imageEnlargedView" :classes="['image-enlarged-view']" :width="650" :height="'auto'">
    <div class="modal-card-head">
      <span class="close" @click="$modal.hide('imageEnlargedView')"></span>
    </div>
    <div class="modal-card-body">
      <img :src="image.si_url" />
    </div>
  </modal>
</template>

<script>
  export default {
    name: 'imageEnlargedView',
    components: {
    },
    props: {
      image: Object,
      imageGroup: Array,
      index: Number
    },
    data () {
      return {
      }
    },
    methods: {

    }
  }
</script>

<style scoped lang="scss">
  .modal-card-head {
    justify-content: flex-end;
    background: transparent;
    border-bottom: 0;
  }
  .modal-card-body {
    padding: 0;
    background:transparent;
  }

  .close {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 50px;
    overflow: hidden;
    cursor: pointer;
    &:hover {
      &::before, &::after {
        /*background: #9dadff;*/
      }
    }

    &::before, &::after {
      content: '';
      position: absolute;
      height: 2px;
      width: 100%;
      top: 50%;
      left: 0;
      margin-top: -1px;
      background: white;
    }

    &::before {
      transform: rotate(45deg);
    }
    &::after {
      transform: rotate(-45deg);
    }
  }
</style>
