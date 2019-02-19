<template>
  <modal name="imageEnlargedView" :classes="['image-enlarged-view']" :width="modalWidth" :height="'auto'" :clickToClose="true" @before-open="beforeOpen" @before-close="beforeClose">
    <div class="modal-card-head" @click="$modal.hide('imageEnlargedView')">
      <span class="close"></span>
    </div>
    <div class="modal-card-body">
      <span class="helper">{{parseInt(currentIndex, 10) + 1}}/{{imageGroup.length}}</span>
      <div class="image-viewer" :class="{'is-receipt' : isReceipt}">
        <span v-if="isReceipt" class="fa fa-angle-left" @click="imageMoveLeft"></span>
        <img :src="currentImage.si_url" />
        <span v-if="isReceipt" class="fa fa-angle-right" @click="imageMoveRight"></span>
      </div>
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
      index: Number,
      isReceipt: Boolean
    },
    data () {
      return {
        modalWidth: 750,
        currentIndex: 0,
        currentImage: {},
        isOpen: false
      }
    },
    methods: {
      beforeOpen () {
        // Anti Pattern
        window.document.querySelector('html').classList.add('scroll-block')
        if (this.isMobile()) {
          this.modalWidth = '90%'
        } else {
          this.modalWidth = 750
        }

        this.currentIndex = this.index
      },
      imageMoveLeft () {
        if (this.currentIndex === 0) {
          this.currentIndex = this.imageGroup.length - 1
        } else {
          this.currentIndex = this.currentIndex - 1
        }
        this.currentImage = this.imageGroup[this.currentIndex]
      },
      imageMoveRight () {
        if (this.currentIndex === this.imageGroup.length - 1) {
          this.currentIndex = 0
        } else {
          this.currentIndex = this.currentIndex + 1
        }
        this.currentImage = this.imageGroup[this.currentIndex]
      },
      beforeClose () {
        this.isOpen = false
        // Anti Pattern
        window.document.querySelector('html').classList.remove('scroll-block')
      }
    },
    watch: {
      image: {
        handler (newValue) {
          if (newValue.si_url) {
            this.currentImage = newValue
          }
        },
        deep: true
      },
      index: {
        handler (newValue) {
          if (newValue) {
            this.currentIndex = newValue
          }
        },
        deep: true
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
    .helper {
      font-size: 1.5rem;
    }
    padding: 0;
    background:transparent;
    text-align: center;
    height: 70vh;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    img {
      max-height: 100%;
    }

    .image-viewer {
      &.is-receipt {
        display: flex;
        > img {
          max-height: 100%;
          max-width: 90%;
          align-self: center;
        }
        span {
          align-self: baseline;
          font-size: 4.0rem;
          padding: 0.5rem;
          color: white;
        }
      }
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

  @media screen and (max-width: 768px) {
    .modal-card-body {
      .image-viewer {
        &.is-receipt {
          > img {
            max-height: 100%;
            max-width: 85%;
          }
        }
      }
    }
  }
</style>
