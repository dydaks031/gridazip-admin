<template>
  <modal name="addPartnersModal" @before-open="beforeOpen" @before-close="beforeClose" height="auto" width="60%">
    <div class="add-partners-modal">
      <div class="modal-card-head">
        <h1 class="modal-card-title">{{this.title}}</h1>
        <button class="delete is-pulled-right" @click="$modal.hide('addPartnersModal')"></button>
      </div>
      <div class="modal-card-body">
        <div class="block">
          <div class="control has-addons">
            <div class="select">
              <select v-model="searchOptions.searchConstruction">
                <option value="">전체</option>
                <option v-for="construction in constructionList" :value="construction.ct_pk">{{construction.ct_name}}</option>
              </select>
            </div>
            <input class="input" type="text" placeholder="이름 입력" v-model="searchOptions.name" @keypress.enter.stop="loadPartners">
            <a class="button is-info" @click="loadPartners">검색</a>
          </div>
        </div>
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
          <tr v-for="item in listData.constructor" v-if="listData.constructor.length !== 0">
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
              <button class="button is-primary" @click="addPartner(item)">선택</button>
            </td>
          </tr>
          <tr>
            <td colspan="7" v-if="listData.constructor.length === 0">검색 결과가 없습니다.</td>
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
          <tr v-for="item in listData.correspondent" v-if="listData.correspondent.length !== 0">
            <td>{{item.ct_name}}</td>
            <td>{{item.co_name}}</td>
            <td>{{item.co_contact}}</td>
            <td>{{item.co_manager_name}}</td>
            <td>{{item.ci_brand}}</td>
            <td>
              <button class="button is-primary" @click="addPartner(item)">선택</button>
            </td>
          </tr>
          <tr>
            <td colspan="6" v-if="listData.correspondent.length === 0">검색 결과가 없습니다.</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </modal>
</template>

<script>
  import StarRating from 'vue-star-rating'
  import Vue from 'vue'
  import Notification from 'vue-bulma-notification'

  const NotificationComponent = Vue.extend(Notification)

  const openNotification = (propsData = {
    title: '',
    message: '',
    type: '',
    direction: '',
    duration: 4500,
    container: '.notifications'
  }) => {
    return new NotificationComponent({
      el: document.createElement('div'),
      propsData
    })
  }

  const queryApi = '/api'
  const contractQueryApi = '/api/contract'
  export default {
    name: 'add-partners-modal',
    components: {
      StarRating
    },
    props: {
      title: String,
      type: String,
      id: String,
      constructionList: Array,
      beforeClose: Function
    },
    data () {
      return {
        listData: {
          constructor: [],
          correspondent: []
        },
        searchOptions: {
          searchConstruction: '',
          name: ''
        }
      }
    },
    methods: {
      beforeOpen (event) {
        this.$nextTick(() => {
          this.loadPartners()
        })
      },
      loadPartners () {
        let url = `${queryApi}/${this.type}?pc_pk=${this.id}&ct_pk=${this.searchOptions.searchConstruction}`
        switch (this.type) {
          case 'constructor':
            url = `${url}&cr_name=${this.searchOptions.name}`
            break
          case 'correspondent':
            url = `${url}&co_name=${this.searchOptions.name}`
            break
        }
        this.$http.get(url)
          .then((response) => {
            console.log(response.data.data)
            if (response.data.code !== 200) {
              return false
            }
            this.listData[this.type] = response.data.data[`${this.type}List`]
          })
      },
      addPartner (constructor) {
        console.log(`${contractQueryApi}/${this.id}/${this.type}`)
        this.$http.post(`${contractQueryApi}/${this.id}/${this.type}`, constructor)
          .then((response) => {
            console.log(response.data.data)
            if (response.data.code !== 200) {
              return false
            }
            openNotification({
              message: '등록 되었습니다.',
              type: 'success',
              duration: 1500
            })
            this.$modal.hide('addPartnersModal')
          })
      }
    },
    mounted () {

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
