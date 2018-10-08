<template>
  <div class="estimate-detail">
    <div class="tabs is-boxed">
      <ul>
        <li @click="activeView(tabType.info)" :class="{'is-active': currentTab === tabType.info}"><a>정보</a></li>
        <li @click="activeView(tabType.preEstimateView)" :class="{'is-active': currentTab === tabType.preEstimateView}"><a>가견적서</a></li>
        <li @click="activeView(tabType.estimateView)" :class="{'is-active': currentTab === tabType.estimateView}"><a>상세견적서</a></li>
        <li @click="activeView(tabType.managerAndShop)" :class="{'is-active': currentTab === tabType.managerAndShop}"><a>기술자 및 거래처</a></li>
        <li @click="activeView(tabType.siteImage)" :class="{'is-active': currentTab === tabType.siteImage}"><a>현장사진</a></li>
        <li @click="activeView(tabType.checkList)" :class="{'is-active': currentTab === tabType.checkList}"><a>체크리스트</a></li>
        <li @click="activeView(tabType.contractReceipt)" :class="{'is-active': currentTab === tabType.contractReceipt}"><a>결재 요청내역</a></li>
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
            <label class="label">계약상태</label>
            <p class="control">
                {{requestStatusConfig.contractStatusList[detailData.pc_status]}}
                <button class="button" @click="changeContractStatus(-1)" v-if="detailData.pc_status === 0">계약 실패</button>
                <button class="button" @click="changeContractStatus(9)" v-if="detailData.pc_status === 5">공사 마감</button>
            </p>
            <label class="label" v-if="detailData.pc_status === -1">계약 실패사유</label>
            <div class="select" v-if="detailData.pc_status === -1">
              <select v-model="detailData.pc_fail_reason">
                <option value="" selected="selected">선택</option>
                <option v-for="status in requestStatusConfig.contractFailReasonList" :value="status.label">{{status.label}}</option>
              </select>
            </div>
            <p class="control" v-if="detailData.pc_fail_reason === '기타'">
              <textarea class="textarea" v-model="detailData.pc_fail_reason_text"></textarea>
            </p>
            <label class="label">접속코드</label>
            <p class="control" v-text="detailData.pc_password"></p>
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
            <label class="label">공사 시작일</label>
            <p class="control">
              <datepicker placeholder="공사 시작일 입력" :config="{ dateFormat: 'Y-m-d', static: true }" v-model="detailData.pc_construction_start_date"></datepicker>
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
        <article class="tile is-child box" v-show="currentTab === tabType.checkList">
          <p class="subtitle is-3 is-pulled-left">체크리스트</p>
          <a class="button is-primary is-pulled-right is-medium" @click="moveToDate">이동</a>
          <span class="is-pulled-right" style="height:2.885rem">
            <datepicker ref="moveToDate" style="width:100px; vertical-align: middle" v-model="wantMoveDate"/> <b style="vertical-align: middle;">으로</b>
          </span>
          <div>
            <table class="table is-bordered check-list">
            <colgroup>
              <col width="5%"/>
              <col width="16%"/>
              <col width="16%"/>
              <col width="5%"/>
              <col width="5%"/>
              <col width="auto"/>
              <col width="16%"/>
            </colgroup>
            <thead>
              <tr>
                <th></th>
                <th>날짜</th>
                <th>공사</th>
                <th>자재</th>
                <th>인력</th>
                <th>메모</th>
                <th></th>
              </tr>
            </thead>
            <tbody v-for="(checkListByDate, index) in checkList">
              <tr @click="toggleCheckDate(index)" class="date-header">
                <th colspan="7">{{index}}</th>
              </tr>
              <tr v-for="checkListItem in checkListByDate">
                <td class="has-text-centered">
                  <input type="checkbox" class="checkbox" v-model="checkListItem.isChecked">
                </td>
                <td>
                  <span v-if="!checkListItem.isModify">{{checkListItem.date}}</span>
                  <datepicker v-if="checkListItem.isModify" v-model="checkListItem.date" />
                </td>
                <td>
                  <span v-if="!checkListItem.isModify">{{checkListItem.ct_name}}</span>
                  <div class="select" v-if="checkListItem.isModify">
                    <select v-model="checkListItem.cl_ctpk">
                      <option value="">선택</option>
                      <option v-for="construction in currentConstructionList" :value="construction.ct_pk">
                        {{construction.ct_name}}
                      </option>
                    </select>
                  </div>
                </td>
                <td>
                  <input type="checkbox" class="checkbox" v-model="checkListItem.cl_resource" @change="updateCheckListStatus(checkListItem)" />
                </td>
                <td>
                  <input type="checkbox" class="checkbox" v-model="checkListItem.cl_constructor" @change="updateCheckListStatus(checkListItem)" />
                </td>
                <td>

                  <span v-if="!checkListItem.isModify">{{checkListItem.cl_memo}}</span>
                  <textarea class="textarea cl-memo" v-model="checkListItem.cl_memo" v-if="checkListItem.isModify"></textarea>
                </td>
                <td>
                  <button class="button" v-if="!checkListItem.isModify" @click="checkListItem.isModify = true">수정</button>
                  <button class="button is-danger" v-if="!checkListItem.isModify" @click="deleteCheckList(checkListItem)">삭제</button>
                  <button class="button" v-if="checkListItem.isModify" @click="checkListItem.isModify = false">취소</button>
                  <button class="button is-info" v-if="checkListItem.isModify" @click="updateCheckListStatus(checkListItem)">확인</button>
                </td>
              </tr>
            </tbody>
            <tbody>
              <tr v-show="!isAddCheckList">
                <td colspan="7" class="has-text-centered" @click="isAddCheckList = true;">+</td>
              </tr>
              <tr v-show="isAddCheckList">
                <td>
                  <!--<input type="checkbox" class="checkbox">-->
                </td>
                <td>
                  <datepicker v-model="newCheckList.date"/>
                </td>
                <td>
                  <div class="select">
                    <select v-model="newCheckList.ct_pk">
                      <option value="">선택</option>
                      <option v-for="construction in currentConstructionList" :value="construction.ct_pk">
                        {{construction.ct_name}}
                      </option>
                    </select>
                  </div>
                </td>
                <td>
                  <input type="checkbox" class="checkbox" v-model="newCheckList.cl_resource"/>
                </td>
                <td>
                  <input type="checkbox" class="checkbox" v-model="newCheckList.cl_constructor"/>
                </td>
                <td>
                  <textarea class="textarea cl-memo" v-model="newCheckList.cl_memo"></textarea>
                </td>
                <td>
                  <button class="button" @click="registerCheckList">등록</button>
                  <button class="button is-danger" @click="isAddCheckList = false;">취소</button>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </article>
        <article class="tile is-child box contract-receipt-wrapper" v-show="currentTab === tabType.contractReceipt">
          <div class="is-clearfix">
            <p class="subtitle is-3 is-pulled-left">결재 요청내역</p>
            <a class="button is-primary is-pulled-right is-medium" @click="moveToRegisterReceipt">등록</a>
          </div>
          <div>
            <table class="table is-bordered contract-receipt is-hidden-touch" v-if="contractReceiptList.length !== 0">
              <colgroup>
              </colgroup>
              <tbody v-for="receipt in contractReceiptList" v-if="receipt.status !== -1" >
              <tr>
                <th>날짜</th>
                <td>{{moment(receipt.date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('YYYY-MM-DD')}}</td>
                <th>공사</th>
                <td>{{receipt.ctName}}</td>
                <th>구분</th>
                <td colspan="2">{{receipt.type === 1 ? '자재비' : '인건비'}}</td>
                <th>내용</th>
                <td>{{receipt.contents}}</td>
                <th>금액</th>
                <td>{{addCommas(receipt.price)}}</td>
                <th>부가세</th>
                <td>{{receipt.isVatIncluded === 0 ? '미포함' : '포함'}}</td>
                <td rowspan="2" style="text-align: center; vertical-align: middle;">
                  <button class="button is-danger is-medium" @click="changeReceiptStatus()">반려</button>
                  <button class="button is-primary is-medium" @click="changeReceiptStatus()">승인</button>
                </td>
              </tr>
              <tr>
                <th>은행명</th>
                <td>{{receipt.accountBank}}</td>
                <th>예금주</th>
                <td>{{receipt.accountHolder}}</td>
                <th>계좌번호</th>
                <td colspan="2">{{receipt.accountNumber}}</td>
                <th>첨부서류</th>
                <td><a href="#">링크</a></td>
                <th>진행상태</th>
                <td>{{receipt.statusName}}</td>
                <th>메모</th>
                <td colspan="1">{{receipt.memo}}</td>
              </tr>
              </tbody>
            </table>
            <table class="table is-bordered contract-receipt is-hidden-desktop" v-if="contractReceiptList.length !== 0">
              <tbody v-for="receipt in contractReceiptList" v-if="receipt.status !== -1">
              <tr>
                <th>날짜</th>
                <td>{{moment(receipt.date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('YYYY-MM-DD')}}</td>
              </tr>
              <tr>
                <th>공사</th>
                <td>{{receipt.ctName}}</td>
              </tr>
              <tr>
                <th>구분</th>
                <td>{{receipt.type === 1 ? '자재비' : '인건비'}}</td>
              </tr>
              <tr>
                <th>내용</th>
                <td>{{receipt.contents}}</td>
              </tr>
              <tr>
                <th>금액</th>
                <td>{{addCommas(receipt.price)}}</td>
              </tr>
              <tr>
                <th>부가세</th>
                <td>{{receipt.isVatIncluded === 0 ? '미포함' : '포함'}}</td>
              </tr>
              <tr>
                <th>은행명</th>
                <td>{{receipt.accountBank}}</td>
              </tr>
              <tr>
                <th>예금주</th>
                <td>{{receipt.accountHolder}}</td>
              </tr>
              <tr>
                <th>계좌번호</th>
                <td>{{receipt.accountNumber}}</td>
              </tr>
              <tr>
                <th>첨부서류</th>
                <td><a href="#">링크</a></td>
              </tr>
              <tr>
                <th>진행상태</th>
                <td>{{receipt.statusName}}</td>
              </tr>
              <tr>
                <th>메모</th>
                <td>{{receipt.memo}}</td>
              </tr>
              <tr v-if="receipt.rejectReason">
                <th>반려사유</th>
                <td>{{receipt.rejectReason}}</td>
              </tr>
              <tr>
                <td style="text-align: center; vertical-align: middle;" colspan="2">
                  <button class="button is-danger is-medium" v-if="userPermit !== 'A' "@click="changeReceiptStatus(receipt, 0)">반려</button>
                  <button class="button is-danger is-medium" v-if="receipt.status === 0" @click="changeReceiptStatus(receipt, -1)">삭제</button>
                  <button class="button is-primary is-medium" v-if="userPermit === 'B'" @click="changeReceiptStatus(receipt, 2)">승인</button>
                  <button class="button is-primary is-medium" v-if="userPermit === 'C'" @click="changeReceiptStatus(receipt, 3)">입금완료</button>
                </td>
              </tr>
              </tbody>
            </table>
            <div v-if="contractReceiptList.length === 0">
              <span class="no-results">결재 요청이 없습니다.</span>
            </div>
          </div>
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
  import moment from 'moment'
  import requestStatusConfig from '../../config/request-status-config'

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
        requestStatusConfig,
        router,
        moment,
        tabType: {
          info: 'info',
          estimateView: 'estimateView',
          managerAndShop: 'managerAndShop',
          preEstimateView: 'preEstimateView',
          siteImage: 'siteImage',
          checkList: 'checkList',
          contractReceipt: 'contractReceipt'
        },
        currentTab: '',
        param: {},
        detailData: {
          pc_move_date: ''
        },
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
        siteImageList: [],
        checkList: [],
        isAddCheckList: false,
        currentConstructionList: [],
        isDatepickerOpen: false,
        newCheckList: {
          ct_pk: ''
        },
        wantMoveDate: '',
        /* 결재 요청내역 */
        contractReceiptList: [],
        userPermit: ''
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
      this.checkPermission()
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
          case this.tabType.checkList:
            this.loadCheckList()
            break
          case this.tabType.contractReceipt:
            this.loadContractReceipt()
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
            this.detailData.pc_move_date = (this.detailData.pc_move_date === '0000-00-00 00:00:00' || !this.detailData.pc_move_date) ? '' : moment(this.detailData.pc_move_date, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD')
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
            this.detailData.pc_status = response.data.data.data.pc_status
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
      },
      loadCheckList () {
        const id = this.param.id
        this.$http.get(`${queryApi}/${id}/checklist`)
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            const checkList = response.data.data.checklist
            for (let i = 0; i < checkList.length; i++) {
              checkList[i].date = moment(checkList[i].cl_date, 'X').format('YYYY-MM-DD')
              checkList[i].isModify = false
              checkList[i].isChecked = false
            }
            this.checkList = _.groupBy(checkList, 'date')

            return this.$http.get(`${queryApi}/${id}/construction`)
          })
          .then((response) => {
            if (response.data.code !== 200) {
              return
            }
            this.currentConstructionList = response.data.data.constructionList
          })
          .catch((e) => {
            console.error(e)
          })
      },
      moveToDate () {
        const isCheckedCheckList = _.chain(this.checkList)
          .values()
          .flatten()
          .filter((item) => {
            return item.isChecked === true
          })
          .map((item) => {
            return item.cl_pk
          })
          .value()

        const data = {
          checklist: isCheckedCheckList,
          cl_date: moment(this.wantMoveDate, 'YYYY-MM-DD').format('X')
        }

        const id = this.param.id
        this.$http.put(`${queryApi}/${id}/checklist`, data)
          .then((response) => {
            if (response.data.code !== 200) {
              openNotification({
                message: '체크리스트 날짜 이동 중 오류가 발생하였습니다.',
                type: 'danger',
                duration: 1500
              })
              return
            }

            openNotification({
              message: '체크리스트가 정상적으로 이동하였습니다.',
              type: 'success',
              duration: 1500
            })
            this.loadCheckList()
          })
          .catch((e) => {
            console.error(e)
          })
      },
      toggleCheckDate (date) {
        const alreadyCheckedList = _.filter(this.checkList[date], (item) => {
          return item.isChecked
        })
        let checkedType = true
        if (alreadyCheckedList.length === this.checkList[date].length) {
          checkedType = false
        }
        _.map(this.checkList[date], (item) => {
          item.isChecked = checkedType
        })
      },
      registerCheckList () {
        this.newCheckList.cl_date = moment(this.newCheckList.date, 'YYYY-MM-DD').format('X')
        console.log(this.newCheckList)
        if (!this.newCheckList.date) {
          window.alert('날짜를 입력해 주십시오.')
          return
        } else if (!this.newCheckList.ct_pk) {
          window.alert('공사를 입력해 주십시오.')
          return
        }
        const id = this.param.id
        this.$http.post(`${queryApi}/${id}/checklist`, this.newCheckList)
          .then((response) => {
            if (response.data.code !== 200) {
              openNotification({
                message: '체크리스트가 등록 중 오류가 발생하였습니다.',
                type: 'danger',
                duration: 1500
              })
              return
            }
            openNotification({
              message: '체크리스트가 정상적으로 등록되었습니다.',
              type: 'success',
              duration: 1500
            })
            this.newCheckList.ct_pk = ''
            this.newCheckList.date = ''
            this.newCheckList.cl_constructor = ''
            this.newCheckList.cl_resource = ''
            this.newCheckList.cl_date = ''
            this.isAddCheckList = false
            this.loadCheckList()
          })
          .catch((e) => {
            console.error(e)
          })
      },
      deleteCheckList (item) {
        const id = this.param.id
        this.$http.delete(`${queryApi}/${id}/checklist/${item.cl_pk}`)
          .then((response) => {
            console.log(response)
            if (response.data.code !== 200) {
              openNotification({
                message: '체크리스트가 삭제 중 오류가 발생하였습니다.',
                type: 'success',
                duration: 1500
              })
              return
            }
            openNotification({
              message: '체크리스트가 정상적으로 삭제되었습니다.',
              type: 'success',
              duration: 1500
            })
            this.loadCheckList()
          })
      },
      updateCheckListStatus (item) {
        const id = this.param.id
        item.cl_date = moment(item.date, 'YYYY-MM-DD').format('X')
        this.$http.put(`${queryApi}/${id}/checklist/${item.cl_pk}`, item)
          .then((response) => {
            console.log(response)
            if (response.data.code !== 200) {
              openNotification({
                message: '체크리스트가 수정 중 이상이 발생하였습니다.',
                type: 'danger',
                duration: 1500
              })
              return
            }
            openNotification({
              message: '체크리스트가 정상적으로 수정되었습니다.',
              type: 'success',
              duration: 1500
            })
            this.loadCheckList()
          })
          .catch((e) => {
            console.error(e)
          })
      },
      changeContractStatus (status) {
        this.detailData.pc_status = status
      },
      /* 결재 영수 조회 */
      loadContractReceipt () {
        const id = this.param.id
        this.checkPermission()
        this.$http.get(`${queryApi}/${id}/receipt`)
          .then((response) => {
            this.contractReceiptList = response.data.data.receipts

            this.contractReceiptList.map((item) => {
              let statusName = ''
              switch (item.status) {
                case -1:
                  statusName = '삭제'
                  break
                case 0:
                  statusName = '반려'
                  break
                case 1:
                  statusName = '대기'
                  break
                case 2:
                  statusName = '승인'
                  break
                case 3:
                  statusName = '입금완료'
                  break
              }
              item.statusName = statusName
            })
          })
      },
      changeReceiptStatus (item, status) {
        this.checkPermission()
        const id = this.param.id
        this.$http.put(`${queryApi}/${id}/receipt/${item.pk}`, {
          status: status
        })
        .then((response) => {
          this.loadContractReceipt()
        })
      },
      moveToRegisterReceipt () {
        router.push({
          path: `/private/estimate/${this.param.id}/receipt/register`
        })
      },
      checkPermission () {
        this.userPermit = this.$auth.user().user_permit
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
  .check-list {
    .date-header {
      cursor: pointer;
    }
  }

  .contract-receipt{

    tbody {
      &.is-emergency {
        background: #FF6F5F;
      }

      &:before {
        content: '';
        display: block;
        height: 20px;
      }

      th {
        background: #dfdfdf;
        color: black;
        border: 1px solid #bbbbbb;
      }
      td {
        border: 1px solid #bbbbbb;

        button.is-primary {
          background: #4285F4;
        }
      }
    }
  }
</style>

<style scoped lang="scss">
  @media screen and (max-width: 768px) {
    /*.app-content {*/
      /*padding: 20px 0;*/
    /*}*/
    .estimate-detail {
      .tile {
        padding: 0.5rem;
        > div {
          padding: 0.5rem;
        }
      }
    }
    .contract-receipt-wrapper {
      > div {
        overflow-x: auto;
      } }
  }

  .cl-memo {
    min-height: 50px;
  }
</style>
