<template>
  <modal name="addPartnersModal" @before-open="beforeOpen" height="auto" width="60%">
    <div class="add-partners-modal">
      <div class="modal-card-head">
        <h1 class="modal-card-title">{{this.title}}</h1>
        <button class="delete is-pulled-right"></button>
      </div>
      <div class="modal-card-body">
        <table class="table is-bordered" v-if="type === 'constructor'">
          <colgroup>
            <col width="7%"/>
            <col width="8%"/>
            <col width="15%"/>
            <col width="10%"/>
            <col width="10%"/>
            <col width="30%"/>
            <col width="10%"/>
          </colgroup>
          <thead>
          <tr>
            <th>공사</th>
            <th>이름</th>
            <th>전화번호</th>
            <th>소통</th>
            <th>실력</th>
            <th>비고</th>
            <th></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in listData.constructor">
            <td>{{item.ct_name}}</td>
            <td>{{item.cr_name}}</td>
            <td>{{item.cr_contact}}</td>
            <td>
              <star-rating v-model="item.cr_communication_score" :show-rating="false" :star-size="15" :read-only="true" />
            </td>
            <td>
              <star-rating v-model="item.cs_skill_score" :show-rating="false" :star-size="15" :read-only="true" />
            </td>
            <td>{{item.cs_memo}}</td>
            <td>
              <button class="button is-primary">선택</button>
            </td>
          </tr>
          </tbody>
        </table>
        <table class="table is-bordered" v-if="type === 'correspondent'">
          <colgroup>
            <col width="10%"/>
            <col width="20%"/>
            <col width="15%"/>
            <col width="15%"/>
            <col width="30%"/>
            <col width="10%"/>
          </colgroup>
          <thead>
          <tr>
            <th>공사</th>
            <th>상호명</th>
            <th>전화번호</th>
            <th>담당자</th>
            <th>브랜드</th>
            <th></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in listData.correspondent">
            <td>{{item.ct_name}}</td>
            <td>{{item.co_name}}</td>
            <td>{{item.co_contact}}</td>
            <td>{{item.co_manager_name}}</td>
            <td>{{item.ci_brand}}</td>
            <td>
              <button class="button is-primary">선택</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </modal>
</template>

<script>
  import StarRating from 'vue-star-rating'

  const queryApi = '/api'
  export default {
    name: 'add-partners-modal',
    components: {
      StarRating
    },
    props: {
      visible: Boolean,
      title: String,
      type: String,
      message: String
    },
    data () {
      return {
        listData: {
          constructor: [],
          correspondent: []
        }
      }
    },
    methods: {
      beforeOpen (event) {
        // switch (type) {
        //
        // }
        this.$nextTick(() => {
          this.$http.get(`${queryApi}/${this.type}`)
            .then((response) => {
              console.log(response.data.data)
              if (response.data.code !== 200) {
                return false
              }
              this.listData[this.type] = response.data.data[`${this.type}List`]
            })
        })
      }
    },
    mounted () {
      console.log(this)
    }
  }
</script>
<style lang="scss" scoped>
  .add-partners-modal {
    border-radius: 1rem;
    .table {
      padding: 1rem;
    }
  }
  .v--modal-overlay {
    margin-left: -90px;
    width: calc(100% + 90px);
  }
</style>
