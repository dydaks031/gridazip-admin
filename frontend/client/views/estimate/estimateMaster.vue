<template>
  <div>
    <div class="tile is-ancestor">
      <estimate-select v-on:registerData="updateModifyView"/>
    </div>
    <div class="tile is-ancestor box" style="margin-bottom:2.5rem;">
      <div class="tile is-parent">
        <div class="tile is-child">
          <h1 class="title">신규 등록 견적</h1>
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
    </div>
    <div class="tile is-ancestor box">
      <div class="tile is-parent">
        <div class="tile is-child">
          <h1 class="title">입력된 견적 목록</h1>
          <table class="table">
            <colgroup>
              <col width="5%"/>
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
              <th></th>
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
            <estimate-master-modify :rowData="{}" />
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import EstimateSelect from './estimateSelect'
  import EstimateModify from './estimateModify'
  import EventBus from '../../services/eventBus'
  import EstimateMasterModify from './estimateMasterModify'

  const queryApi = '/api/contract/'

  export default {
    components: {
      EstimateMasterModify,
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

        this.$http.get(`${queryApi}/${id}/estimate/general?es_is_pre=false`)
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            var data = response.data.data
            EventBus.$emit('updateMasterModifyView', data.estimateList)
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
