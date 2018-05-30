<template>
  <select>
    <slot></slot>
  </select>
</template>
<script>
  /* global $ */

  // select2 loading
  import '../../../node_modules/select2/dist/js/select2.min'

  export default {
    name: 'select2',
    props: ['options', 'value'],
    data () {
      return {

      }
    },
    mounted: function () {
      var vm = this
      $(this.$el)
      // init select2
        .select2({ data: this.options })
        .val(this.value)
        .trigger('change')
        // emit event on change.
        .on('change', function () {
          vm.$emit('input', this.value)
        })
    },
    watch: {
      value: function (value) {
        // update value
        $(this.$el)
          .val(value)
      },
      options: function (options) {
        // update options
        $(this.$el).empty().select2({ data: options })
      }
    },
    destroyed: function () {
      $(this.$el).off().select2('destroy')
    }
  }
</script>

<style>
  @import '../../../node_modules/select2/dist/css/select2.min.css';
  .select2-container {
    width: 100% !important;
  }
</style>
