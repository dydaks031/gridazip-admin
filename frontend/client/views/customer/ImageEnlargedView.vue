<template>
  <modal name="imageEnlargedView" :classes="['image-enlarged-view']" :width="modalWidth" :height="'auto'" :clickToClose="true" @before-open="beforeOpen">
    <div class="modal-card-head" @click="$modal.hide('imageEnlargedView')">
      <span class="close"></span>
    </div>
    <div class="modal-card-body">
      <span class="helper"></span>
      <img :src="image.si_url" />
    </div>
  </modal>
</template>

<script>
  import mixin from '../../services/mixin'

  export default {
    name: 'imageEnlargedView',
    mixins: [mixin],
    components: {
    },
    props: {
      image: Object,
      imageGroup: Array,
      index: Number
    },
    data () {
      return {
        modalWidth: 650
      }
    },
    methods: {
      beforeOpen () {
        console.log(this.$modal)
        if (this.isMobile()) {
          this.modalWidth = '90%'
        } else {
          this.modalWidth = 650
        }
      }
    }
  }
</script>

<style lang="scss">
  .image-enlarged-view {
    max-width: 90%;
    margin: 0 auto;
    left: 0 !important;
  }
</style>

<style scoped lang="scss">
  .modal-card-head {
    justify-content: flex-end;
    background: transparent;
    border-bottom: 0;
  }
  .modal-card-body {
    padding: 0;
    background:transparent;
    text-align: center;
    height: 70vh;
    overflow: hidden;

    > img {
      max-height: 100%;
    }
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
