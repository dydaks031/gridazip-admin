<template>
  <nav class="pagination" role="navigation" aria-label="pagination">
    <ul class="pagination-list">
      <li v-for="n in paginationArray">
        <a class="pagination-link" v-on:click="pageClick(n)">{{n}}</a>
      </li>
    </ul>
  </nav>
</template>

<script>
  export default {
    name: 'PaginationVue',
    data () {
      return {
        curPage: this.options.page,
        curLimit: this.options.limit,
        curPoint: this.options.point,
        curCount: this.options.count,
        curEnd: this.options.end,
        curMax: this.options.max,
        curIndex: this.options.index,
        startIndex: 1,
        paginationArray: []
      }
    },
    props: ['options', 'pageClick'],
    methods: {
      getCurrentPagination: function () {
        const middleCount = Math.ceil((this.curMax - 1) / 2)
        const maxCount = Math.ceil(this.curCount / this.curLimit)
        this.startIndex = 1
        if (this.curIndex > middleCount) {
          this.startIndex = Math.max(Math.min(this.curIndex - middleCount, maxCount - this.curMax + 1), 1)
        }
        const maxIndex = Math.max(Math.min(this.curMax, maxCount - this.startIndex + 1), 1)
        this.paginationArray.length = 0
        for (let index = this.startIndex; index < this.startIndex + maxIndex; index += 1) {
          this.paginationArray.push(index)
        }
      }
    },
    watch: {
      options: {
        handler (val) {
          this.curPage = val.page
          this.curLimit = val.limit
          this.curPoint = val.point
          this.curCount = val.count
          this.curEnd = val.end
          this.curMax = val.max
          this.curIndex = val.index
          this.getCurrentPagination()
        },
        deep: true
      }
    },
    mounted () {
      this.getCurrentPagination()
    }
  }
</script>

<style scoped>

</style>
