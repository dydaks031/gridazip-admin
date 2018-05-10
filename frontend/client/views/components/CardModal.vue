<template>
  <card-modal :visible="visible" @close="close" v-on:ok=click :title="title" transition="zoom">
    <div class="content has-text-centered">
      {{message}}
    </div>
  </card-modal>
</template>

<script>
  import { CardModal } from 'vue-bulma-modal'

  export default {
    components: {
      CardModal
    },

    props: {
      visible: Boolean,
      title: String,
      url: String,
      message: String,
      click: Function
    },

    data () {
      return {
        src: require('assets/logo.svg')
      }
    },

    methods: {
      open (url) {
        window.open(url)
      },

      close () {
        this.$emit('close')
      }
    }
  }
</script>
