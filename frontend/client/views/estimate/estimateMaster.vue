<template>
  <div>
    <div class="tile is-ancestor">
      <estimate-select v-on:registerData="updateModifyView"/>
    </div>
    <div class="tile is-ancestor">
      <table class="table">
        <colgroup>
          <col width="5%"/>
          <col width="7%"/>
          <col width="4%" />
          <col width="7%" />
          <col width="8%" />
          <col width="5%" />
          <col width="7%" />
          <col width="auto" />
          <col width="auto" />
          <col width="5%" />
          <col width="5%" />
          <col />
          <col />
        </colgroup>
        <thead>
        <tr>
          <th>위치</th>
          <th>상세위치</th>
          <th>공사</th>
          <th>공정</th>
          <th>상세공정</th>
          <th>자재분류</th>
          <th>자재군</th>
          <th>자재명</th>
          <th>자재별칭</th>
          <th>입력값</th>
          <th>물량</th>
          <th>인건비</th>
          <th>자재비</th>
          <th></th>
        </tr>
        </thead>
        <estimate-modify :rowData="{}"/>
      </table>
    </div>
    <div class="tile is-ancestor">
      <h1 class="title">입력된 견적 목록</h1>
      <table class="table">
        <colgroup>
          <col width="5%"/>
          <col width="7%"/>
          <col width="4%" />
          <col width="7%" />
          <col width="8%" />
          <col width="5%" />
          <col width="7%" />
          <col width="auto" />
          <col width="auto" />
          <col width="5%" />
          <col width="5%" />
          <col />
          <col />
        </colgroup>
        <thead>
        <tr>
          <th>위치</th>
          <th>상세위치</th>
          <th>공사</th>
          <th>공정</th>
          <th>상세공정</th>
          <th>자재분류</th>
          <th>자재군</th>
          <th>자재명</th>
          <th>자재별칭</th>
          <th>입력값</th>
          <th>물량</th>
          <th>인건비</th>
          <th>자재비</th>
          <th></th>
        </tr>
        </thead>
        <estimate-modify :rowData="{}"/>
      </table>
    </div>
  </div>
</template>

<script>
  import EstimateSelect from './estimateSelect'
  import EstimateModify from './estimateModify'
  import EventBus from '../../services/eventBus'

  const queryApi = '/api/contract/'

  export default {
    components: {
      EstimateModify,
      EstimateSelect
    },
    name: 'estimateMaster',
    data () {
      return {
        newInsertData: []
      }
    },
    methods: {
      updateModifyView () {
      },
      loadData () {
        const id = this.$route.params.id

        this.$http.get(`${queryApi}/${id}/estimate`)
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            var data = response.data.data
            EventBus.$emit('updateModifyView', data.estimateList)
          }).catch((error) => {
            console.log(error)
          })
      }
    },
    mounted () {
      this.loadData()
    }

  }
</script>

<style scoped>

</style>
