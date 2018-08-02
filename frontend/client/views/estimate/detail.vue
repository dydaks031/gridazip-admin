<template>
  <div>
    <div class="tabs is-boxed">
      <ul>
        <li @click="activeView(tabType.info)" :class="{'is-active': currentTab === tabType.info}"><a>정보</a></li>
        <li @click="activeView(tabType.preEstimateView)" :class="{'is-active': currentTab === tabType.preEstimateView}"><a>가견적서</a></li>
        <li @click="activeView(tabType.estimateView)" :class="{'is-active': currentTab === tabType.estimateView}"><a>상세견적서</a></li>
        <li @click="activeView(tabType.managerAndShop)" :class="{'is-active': currentTab === tabType.managerAndShop}"><a>기술자 및 거래처</a></li>
        <li @click="activeView(tabType.siteImage)" :class="{'is-active': currentTab === tabType.siteImage}"><a>현장사진</a></li>
      </ul>
    </div>
    <div class="tile is-ancestor">
      <div class="tile is-parent">
        <article class="tile is-child box" v-show="currentTab === tabType.info">
          <div class="block">
            <label class="label">고객명</label>
            <div class="control">
              <input class="input" type="text" v-model="detailData.pc_name" :class="{'is-danger': $v.detailData.pc_name.$invalid }" />
              <p class="help is-danger" v-if="!$v.detailData.pc_name.required">고객명을 입력해 주십시오.</p>
            </div>
            <label class="label">연락처</label>
            <div class="control">
              <input class="input" type="text" v-model="detailData.pc_phone" :class="{'is-danger': $v.detailData.pc_phone.$invalid }" />
              <p class="help is-danger" v-if="!$v.detailData.pc_phone.required">전화번호를 입력해 주십시오.</p>
            </div>
            <label class="label">접속코드</label>
            <p class="control" v-text="detailData.pc_password">
            </p>
            <label class="label">평수</label>
            <p class="control">
              <input class="input" type="text" v-model="detailData.pc_size" />
            </p>
            <label class="label">주소</label>
            <p class="control">
              <input class="input" type="text" v-model="detailData.pc_address_brief" />
            </p>
            <label class="label">상세 주소</label>
            <p class="control">
              <input class="input" type="text" v-model="detailData.pc_address_detail" />
            </p>
            <label class="label">이사일</label>
            <p class="control">
              <datepicker placeholder="이사일 입력" :config="{ dateFormat: 'Y-m-d', static: true }" v-model="detailData.pc_move_date"></datepicker>
            </p>
            <label class="label">예산</label>
            <p class="control">
              <input class="input" type="text" v-model="detailData.pc_budget"/>
            </p>
            <label class="label">메모</label>
            <p class="control">
              <textarea class="textarea" v-model="detailData.pc_memo"></textarea>
            </p>
            <label class="label">공과잡비(%)</label>
            <p class="control">
              <input class="input" v-model="detailData.pc_etc_costs_ratio" />
            </p>
            <label class="label">디자인 및 설계비(%)</label>
            <p class="control">
              <input class="input" v-model="detailData.pc_design_costs_ratio" />
            </p>
            <label class="label">감리비(%)</label>
            <p class="control">
              <input class="input" v-model="detailData.pc_supervision_costs_ratio" />
            </p>
            <label class="label">할인금액</label>
            <p class="control">
              <input class="input" v-model="detailData.pc_discount_amount" />
            </p>
            <p class="control">
              <button class="button is-primary" @click="updateContract">등록</button>
              <button class="button is-link" @click="router.back()">Cancel</button>
              <button class="button is-danger is-pulled-right" @click="deleteContract">삭제</button>
            </p>
          </div>
        </article>
        <article class="tile is-child box" v-show = "currentTab === tabType.preEstimateView">
          <estimate-sheet :estimateIsPre="true"/>
        </article>
        <article class="tile is-child box estimate" v-show = "currentTab === tabType.estimateView">
          <estimate-sheet :estimateIsPre="false"/>
        </article>
        <article class="tile is-child box" v-show="currentTab === tabType.managerAndShop">
          <p class="subtitle is-3 is-pulled-left">기술자</p>
          <a class="button is-primary is-pulled-right is-medium" id="addConstructorBtn" @click="openAddPartnerModal('constructor')">등록</a>
          <table class="table is-bordered">
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
            <tr v-for="item in partners.constructor">
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
                <button class="button is-danger" @click="deletePartners(item, 'constructor')">삭제</button>
              </td>
            </tr>
            </tbody>
          </table>
          <p class="subtitle is-3 is-pulled-left">거래처</p>
          <a class="button is-primary is-pulled-right is-medium" id="addCorrespondentBtn" @click="openAddPartnerModal('correspondent')">등록</a>
          <table class="table is-bordered">
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
              <th>자재분류</th>
              <th>상호명</th>
              <th>전화번호</th>
              <th>담당자</th>
              <th>브랜드</th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="item in partners.correspondent">
              <td>{{item.rc_name}}</td>
              <td>{{item.co_name}}</td>
              <td>{{item.co_contact}}</td>
              <td>{{item.co_manager_name}}</td>
              <td>{{item.ci_brand}}</td>
              <td>
                <button class="button is-danger" @click="deletePartners(item, 'correspondent')">삭제</button>
              </td>
            </tr>
            </tbody>
          </table>
        </article>
        <article class="tile is-child box" v-show="currentTab === tabType.siteImage">
          <p class="subtitle is-3 is-pulled-left">현장사진</p>
          <a class="button is-primary is-pulled-right is-medium" id="addSiteImageBtn" @click="openAddSiteImageModal()">등록</a>
          <table class="table">
            <colgroup>
              <col width="50%;"/>
              <col width="auto;"/>
              <col width="10%;"/>
              <col width="10%;" />
            </colgroup>
            <thead>
            <tr>
              <th>이미지</th>
              <th>설명</th>
              <th>등록일</th>
              <th>설정</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item) in siteImageList">
              <td>
                <a :href="item.si_url">
                  <img :src="item.si_url" />
                </a>
              </td>
              <td>{{item.si_description}}</td>
              <td>{{getComputedDate(item.si_reg_dt)}}</td>
              <td><button class="button" v-on:click.stop="deleteImageRow(item)">삭제</button></td>
            </tr>
            <tr v-if="siteImageList.length === 0">
              <td colspan="5" class="has-text-centered">검색 결과가 없습니다.</td>
            </tr>
            </tbody>
          </table>
        </article>
      </div>
    </div>
    <add-partners-modal
      :title="addPartnersModalData.title"
      :type="addPartnersModalData.type"
      :id="param.id"
      :constructionList="partners.construction"
      :resourceCategoryList="partners.resourceCategory"
      :beforeClose="loadPartner" />

    <add-site-image-modal
      :id="param.id"
      :beforeClose="loadSiteImage" />
  </div>
</template>

<script>
  import estimateSheet from './estimateSheet'
  import router from '../../router'
  import { required } from 'vuelidate/lib/validators'
  import Notification from 'vue-bulma-notification'
  import Vue from 'vue'
  import addPartnersModal from './addPartnersModal'
  import addSiteImageModal from './addSiteImageModal'
  import StarRating from 'vue-star-rating'
  import _ from 'underscore'
  import Datepicker from 'vue-bulma-datepicker'
  import mixin from '../../services/mixin'
  import EventBus from '../../services/eventBus'

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

  const queryApi = '/api/contract'

  export default {
    name: 'estimateDetail',
    mixins: [mixin],
    components: {
      estimateSheet,
      addPartnersModal,
      addSiteImageModal,
      StarRating,
      Datepicker
    },
    data () {
      return {
        router,
        tabType: {
          info: 'info',
          estimateView: 'estimateView',
          managerAndShop: 'managerAndShop',
          preEstimateView: 'preEstimateView',
          siteImage: 'siteImage'
        },
        currentTab: '',
        param: {},
        detailData: {},
        estimateData: {
          general: [],
          labor: [],
          resource: [],
          total: {}
        },
        addPartnersModalData: {
          type: '',
          title: ''
        },
        partners: {
          constructor: [],
          correspondent: [],
          construction: [],
          resourceCategory: []
        },
        estimateTabList: [],
        siteImageList: []
      }
    },
    validations: {
      detailData: {
        pc_name: {
          required
        },
        pc_phone: {
          required
        }
      }
    },
    mounted () {
      this.currentTab = this.tabType.info
      this.param = this.$route.params
      this.loadDetail()
    },
    computed: {
      getFullAddress () {
        return `${this.detailData.pc_address_brief} ${this.detailData.pc_address_detail}`
      }
    },
    methods: {
      activeView (type) {
        this.currentTab = type
        switch (type) {
          case this.tabType.info:
            this.loadDetail()
            break
          case this.tabType.preEstimateView:
            EventBus.$emit('loadPreEstimateView')
            break
          case this.tabType.estimateView:
            EventBus.$emit('loadEstimateView')
            break
          case this.tabType.managerAndShop:
            this.loadPartner()
            break
          case this.tabType.siteImage:
            this.loadSiteImage()
            break
        }
      },
      loadDetail () {
        const id = this.param.id
        if (!id) {
          return false
        }
        this.$http.get(`${queryApi}/${id}`)
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            this.detailData = response.data.data.contract
          }).catch((error) => {
            console.log(error)
          })
      },
      updateContract () {
        const id = this.param.id

        this.$http.put(`${queryApi}/${id}`, this.detailData)
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            openNotification({
              message: '계약 정보가 정상적으로 변경되었습니다.',
              type: 'success',
              duration: 1500
            })
          })
          .catch((error) => {
            console.error(error)
          })
      },
      deleteContract () {
        if (window.confirm('정말정말 삭제할꼬얌?')) {
          const id = this.param.id

          this.$http.delete(`${queryApi}/${id}`)
            .then((response) => {
              if (response.data.code !== 200) {
                return false
              }
              openNotification({
                message: '계약 정보가 정상적으로 삭제되었습니다.',
                type: 'success',
                duration: 1500
              })
              router.back()
            })
            .catch((error) => {
              console.error(error)
            })
        }
      },
      loadPartner () {
        const id = this.param.id

        this.$http.get(`${queryApi}/${id}/constructor`)
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            this.partners.constructor = response.data.data.constructorList
            return this.$http.get(`${queryApi}/${id}/correspondent`)
          })
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            this.partners.correspondent = response.data.data.correspondentList
            return this.$http.get(`${queryApi}/${id}/construction`)
          })
          .then((response) => {
            this.partners.construction = response.data.data.constructionList
            // return this.$http.get(`${queryApi}/resource/category`)
            return this.$http.get(`${queryApi}/${id}/resource`)
          })
          .then((response) => {
            this.partners.resourceCategory = response.data.data.coresspondentList
          })
          .catch((error) => {
            console.error(error)
          })
      },
      deletePartners (item, type) {
        const id = this.param.id
        const itemPk = item.hasOwnProperty('cc_pk') ? item.cc_pk : item.cco_pk
        this.$http.delete(`${queryApi}/${id}/${type}/${itemPk}`)
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }

            openNotification({
              message: '정상적으로 삭제되었습니다.',
              type: 'success',
              duration: 1500
            })
            this.partners[type] = _.without(this.partners[type], item)
          })
      },
      openAddPartnerModal (type) {
        let message = ''
        switch (type) {
          case 'constructor':
            message = '기술자'
            break
          case 'correspondent':
            message = '거래처'
            break
        }
        this.addPartnersModalData.title = `${message} 할당`
        this.addPartnersModalData.type = type

        this.$modal.show('addPartnersModal')
      },
      openAddSiteImageModal () {
        this.$modal.show('addSiteImageModal')
      },
      loadSiteImage () {
        const id = this.param.id
        this.$http.get(`${queryApi}/${id}/image`)
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            console.log(response.data.data)
            this.siteImageList = response.data.data.siteImageList
          })
          .catch((e) => {
            console.error(e)
          })
      },
      deleteImageRow (item) {
        const id = this.param.id
        this.$http.delete(`${queryApi}/${id}/image/${item.si_pk}`)
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            openNotification({
              message: '삭제되었습니다.',
              type: 'success',
              duration: 1500
            })
            this.loadSiteImage()
          })
          .catch((e) => {
            console.error(e)
          })
      }
    }
  }
</script>

<style scoped lang="scss">
  .tile.is-parent {
    width: 100%;
    .is-child {
      width: 100%;
    }
  }
</style>
