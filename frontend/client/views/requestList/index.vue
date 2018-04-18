<template>
  <div class="tile is-ancestor">
    <div class="tile is-parent">
      <article class="tile is-child box">
        <h4 class="title">상담신청내역</h4>
        <table class="table">
          <thead>
          <tr>
            <th>이름</th>
            <th>평수</th>
            <th>예산</th>
            <th>전화번호</th>
            <th>방문상담일</th>
            <th>신청일자</th>
            <th>유효여부</th>
            <th>방문상담여부</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>강형원</td>
            <td>20평</td>
            <td>3,000만원</td>
            <td>01041238201</td>
            <td>2018-04-15 03:00</td>
            <td>2018-04-14</td>
            <td>
              <input type="radio" id="main1"/><label for="main1">Y</label>
              <input type="radio" id="main2"/><label for="main2">Y</label>
            </td>
            <td>
              <input type="radio" id="main1"/><label for="main1">Y</label>
              <input type="radio" id="main2"/><label for="main2">Y</label>
            </td>
          </tr>
          <tr>
            <td>강형원</td>
            <td>20평</td>
            <td>3,000만원</td>
            <td>01041238201</td>
            <td>2018-04-15 03:00</td>
            <td>2018-04-14</td>
            <td>
              <input type="radio" id="main1"/><label for="main1">Y</label>
              <input type="radio" id="main2"/><label for="main2">Y</label>
            </td>
            <td>
              <input type="radio" id="main1"/><label for="main1">Y</label>
              <input type="radio" id="main2"/><label for="main2">Y</label>
            </td>
          </tr>
          <tr>
            <td>강형원</td>
            <td>20평</td>
            <td>3,000만원</td>
            <td>01041238201</td>
            <td>2018-04-15 03:00</td>
            <td>2018-04-14</td>
            <td>
              <input type="radio" id="main1"/><label for="main1">Y</label>
              <input type="radio" id="main2"/><label for="main2">Y</label>
            </td>
            <td>
              <input type="radio" id="main1"/><label for="main1">Y</label>
              <input type="radio" id="main2"/><label for="main2">Y</label>
            </td>
          </tr>
          <tr>
            <td>강형원</td>
            <td>20평</td>
            <td>3,000만원</td>
            <td>01041238201</td>
            <td>2018-04-15 03:00</td>
            <td>2018-04-14</td>
            <td>
              <input type="radio" id="main1"/><label for="main1">Y</label>
              <input type="radio" id="main2"/><label for="main2">Y</label>
            </td>
            <td>
              <input type="radio" id="main1"/><label for="main1">Y</label>
              <input type="radio" id="main2"/><label for="main2">Y</label>
            </td>
          </tr>
          </tbody>
        </table>
      </article>
    </div>
  </div>
</template>

<script>
  const api = '/api'
  export default {
    name: 'index.vue',
    methods: {
      loadData () {
        this.isloading = true
        this.labels.length = 0
        this.data.length = 0
        this.$http({
          url: api,
          transformResponse: [(data) => {
            return JSON.parse(data.replace(/T00:00:00/g, ''))
          }],
          params: {
            parameters: {
              Normalized: false,
              NumberOfDays: parseInt(this.params.numberOfDays),
              DataPeriod: this.params.dataPeriod,
              Elements: [{'Symbol': this.params.symbol, 'Type': 'price', 'Params': ['c']}]
            }
          }
        }).then((response) => {
          let dates = response.data.Dates
          let price = response.data.Elements[0].DataSeries.close.values
          this.data.push(...price)
          this.labels.push(...dates)
          this.isloading = false
        }).catch((error) => {
          console.log(error)
        })
      }
    }
  }
</script>

<style scoped>

</style>
