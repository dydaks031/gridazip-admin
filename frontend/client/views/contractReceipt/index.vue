<template>
  <div>
    <div class="search box">
      <div class="block">
        <div class="is-clearfix">
          <div class="is-pulled-left is-horizontal searchbox">
            <!--<div class="control is-inline-block">-->
              <!--<label class="label">날짜</label>-->
              <!--<p class="control">-->
                <!--<datepicker />-->
                <!--<button class="button">초기화</button>-->
              <!--</p>-->
            <!--</div>-->
            <div class="control is-inline-block">
              <label class="label">진행상태</label>
              <div class="select">
                <select v-model="searchOptions.status">
                  <option value="" selected="selected">선택</option>
                  <!--<option value="-1">삭제</option>-->
                  <option value="0">반려</option>
                  <option value="1">기안</option>
                  <option value="2">승인</option>
                  <option value="3">입금완료</option>
                </select>
              </div>
            </div>
          </div>
          <div class="is-pulled-right search-btn">
            <a class="button is-info" @click="loadContractReceipt">검색</a>
          </div>
        </div>
      </div>
    </div>
    <div class="tile is-ancestor">
      <div class="tile is-parent">
        <article class="tile is-child box contract-receipt-wrapper">
          <div class="is-clearfix">
            <p class="subtitle is-3 is-pulled-left">결재 요청내역</p>
            <a class="button is-primary is-pulled-right is-medium" @click="moveToRegisterReceipt">등록</a>
            <button class="button is-info is-pulled-right is-medium" style="margin-right:1rem;" @click="excelExport('xlsx')">엑셀 다운로드</button>
          </div>
          <div>
            <!--<table class="table is-bordered contract-receipt is-hidden-touch" v-if="contractReceiptList.length !== 0">-->
              <!--<colgroup>-->
              <!--</colgroup>-->
              <!--<tbody v-for="receipt in contractReceiptList" v-if="receipt.status !== -1" >-->
              <!--<tr>-->
                <!--<th>날짜</th>-->
                <!--<td>{{moment(receipt.date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('YYYY-MM-DD')}}</td>-->
                <!--<th>현장</th>-->
                <!--<td>{{receipt.contractName}}</td>-->
                <!--<th>공사</th>-->
                <!--<td>{{receipt.constructionName}}</td>-->
                <!--<th>구분</th>-->
                <!--<td>{{receipt.type === 1 ? '자재비' : '인건비'}}</td>-->
                <!--<th>내용</th>-->
                <!--<td>{{receipt.contents}}</td>-->
                <!--<th>금액</th>-->
                <!--<td>{{addCommas(receipt.price)}}</td>-->
                <!--<th>부가세</th>-->
                <!--<td>{{receipt.isVatIncluded === 0 ? '미포함' : '포함'}}</td>-->
                <!--<td rowspan="2" class="receipt-button-wrapper">-->
                  <!--<button class="button is-danger is-medium" v-if="userPermit === 'C' || (userPermit === 'B' && receipt.status !== 2)" @click="changeReceiptStatus(receipt, 0)">반려</button>-->
                  <!--<button class="button is-danger is-medium" v-if="receipt.status === 0" @click="changeReceiptStatus(receipt, -1)">삭제</button>-->
                  <!--<button class="button is-primary is-medium" v-if="userPermit === 'B' && receipt.status !== 2" @click="changeReceiptStatus(receipt, 2)">승인</button>-->
                  <!--<button class="button is-primary is-medium" v-if="userPermit === 'C'" @click="changeReceiptStatus(receipt, 3)">입금완료</button>-->
                <!--</td>-->
              <!--</tr>-->
              <!--<tr>-->
                <!--<th>은행명</th>-->
                <!--<td>{{receipt.accountBank}}</td>-->
                <!--<th>예금주</th>-->
                <!--<td>{{receipt.accountHolder}}</td>-->
                <!--<th>계좌번호</th>-->
                <!--<td>{{receipt.accountNumber}}</td>-->
                <!--<th>첨부서류</th>-->
                <!--<td><a href="#" @click="openImageEnlargedView(receipt)">링크</a></td>-->
                <!--<th>진행상태</th>-->
                <!--<td>{{receipt.statusName}}</td>-->
                <!--<th v-if="!receipt.rejectReason">메모</th>-->
                <!--<td v-if="!receipt.rejectReason" colspan="3">{{receipt.memo}}</td>-->
                <!--<th v-if="receipt.rejectReason">반려사유</th>-->
                <!--<td v-if="receipt.rejectReason" colspan="3">{{receipt.rejectReason}}</td>-->
              <!--</tr>-->
              <!--</tbody>-->
            <!--</table>-->
            <!--<table class="table is-bordered contract-receipt is-hidden-desktop" v-if="contractReceiptList.length !== 0">-->
              <!--<tbody v-for="receipt in contractReceiptList" v-if="receipt.status !== -1">-->
              <!--<tr>-->
                <!--<th>날짜</th>-->
                <!--<td>{{moment(receipt.date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('YYYY-MM-DD')}}</td>-->
              <!--</tr>-->
              <!--<tr>-->
                <!--<th>현장</th>-->
                <!--<td>{{receipt.contractName}}</td>-->
              <!--</tr>-->
              <!--<tr>-->
                <!--<th>공사</th>-->
                <!--<td>{{receipt.constructionName}}</td>-->
              <!--</tr>-->
              <!--<tr>-->
                <!--<th>구분</th>-->
                <!--<td>{{receipt.type === 1 ? '자재비' : '인건비'}}</td>-->
              <!--</tr>-->
              <!--<tr>-->
                <!--<th>내용</th>-->
                <!--<td>{{receipt.contents}}</td>-->
              <!--</tr>-->
              <!--<tr>-->
                <!--<th>금액</th>-->
                <!--<td>{{addCommas(receipt.price)}}</td>-->
              <!--</tr>-->
              <!--<tr>-->
                <!--<th>부가세</th>-->
                <!--<td>{{receipt.isVatIncluded === 0 ? '미포함' : '포함'}}</td>-->
              <!--</tr>-->
              <!--<tr>-->
                <!--<th>은행명</th>-->
                <!--<td>{{receipt.accountBank}}</td>-->
              <!--</tr>-->
              <!--<tr>-->
                <!--<th>예금주</th>-->
                <!--<td>{{receipt.accountHolder}}</td>-->
              <!--</tr>-->
              <!--<tr>-->
                <!--<th>계좌번호</th>-->
                <!--<td>{{receipt.accountNumber}}</td>-->
              <!--</tr>-->
              <!--<tr>-->
                <!--<th>첨부서류</th>-->
                <!--<td><a href="#" @click="openImageEnlargedView(receipt)">링크</a></td>-->
              <!--</tr>-->
              <!--<tr>-->
                <!--<th>진행상태</th>-->
                <!--<td>{{receipt.statusName}}</td>-->
              <!--</tr>-->
              <!--<tr v-if="!receipt.rejectReason">-->
                <!--<th>메모</th>-->
                <!--<td>{{receipt.memo}}</td>-->
              <!--</tr>-->
              <!--<tr v-if="receipt.rejectReason">-->
                <!--<th>반려사유</th>-->
                <!--<td>{{receipt.rejectReason}}</td>-->
              <!--</tr>-->
              <!--<tr>-->
                <!--<td colspan="2" class="receipt-button-wrapper">-->
                  <!--<button class="button is-danger is-medium" v-if="userPermit === 'C' || (userPermit === 'B' && receipt.status !== 2)" @click="changeReceiptStatus(receipt, 0)">반려</button>-->
                  <!--<button class="button is-danger is-medium" v-if="receipt.status === 0" @click="changeReceiptStatus(receipt, -1)">삭제</button>-->
                  <!--<button class="button is-primary is-medium" v-if="userPermit === 'B' && receipt.status !== 2" @click="changeReceiptStatus(receipt, 2)">승인</button>-->
                  <!--<button class="button is-primary is-medium" v-if="userPermit === 'C'" @click="changeReceiptStatus(receipt, 3)">입금완료</button>-->
                <!--</td>-->
              <!--</tr>-->
              <!--</tbody>-->
            <!--</table>-->
            <!--<table class="table is-bordered contract-receipt" v-show="false" id="receiptTable">-->
              <!--<colgroup>-->
              <!--</colgroup>-->
              <!--<thead>-->
                <!--<tr>-->
                  <!--<th>날짜</th>-->
                  <!--<th>현장</th>-->
                  <!--<th>공사</th>-->
                  <!--<th>구분</th>-->
                  <!--<th>내용</th>-->
                  <!--<th>금액</th>-->
                  <!--<th>부가세</th>-->
                  <!--<th>은행명</th>-->
                  <!--<th>예금주</th>-->
                  <!--<th>계좌번호</th>-->
                  <!--&lt;!&ndash;<th>첨부서류</th>&ndash;&gt;-->
                  <!--<th>진행상태</th>-->
                  <!--<th>메모</th>-->
                  <!--<th>반려사유</th>-->
                <!--</tr>-->
              <!--</thead>-->
              <!--<tbody v-for="receipt in contractReceiptList" v-if="receipt.status !== -1" >-->
              <!--<tr>-->
                <!--<td t="d">{{moment(receipt.date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('YYYY-MM-DD')}}</td>-->
                <!--<td>{{receipt.contractName}}</td>-->
                <!--<td>{{receipt.constructionName}}</td>-->
                <!--<td>{{receipt.type === 1 ? '자재비' : '인건비'}}</td>-->
                <!--<td>{{receipt.contents}}</td>-->
                <!--<td>{{addCommas(receipt.price)}}</td>-->
                <!--<td>{{receipt.isVatIncluded === 0 ? '미포함' : '포함'}}</td>-->
                <!--<td>{{receipt.accountBank}}</td>-->
                <!--<td>{{receipt.accountHolder}}</td>-->
                <!--<td t="s">{{receipt.accountNumber}}</td>-->
                <!--&lt;!&ndash;<td><img v-for="image in getAttachmentUrl(receipt)" :src="image" /></td>&ndash;&gt;-->
                <!--<td>{{receipt.statusName}}</td>-->
                <!--<td>{{receipt.memo}}</td>-->
                <!--<td>{{receipt.rejectReason}}</td>-->
              <!--</tr>-->
              <!--</tbody>-->
            <!--</table>-->
            <ul class="proceeding-contract-list">
              <li class="contractItem tile is-child box">
                <div class="title-view is-clearfix">
                  <h1 class="subtitle is-pulled-left">송파카페 현장 비용현황</h1>
                  <div class="summary-info is-pulled-right is-flex">
                    <span>당 현장 견적금액: 00,000,000원</span>
                    <span>현 집행금액: 0,000,000원</span>
                    <span>집행률: 00%</span>
                  </div>
                </div>
                <table class="table is-bordered contract-summary">
                  <thead>
                  <tr>
                    <th>공사</th>
                    <th>인건비</th>
                    <th>자재비</th>
                    <th>기타잡비</th>
                    <th class="contract-column-summary">계</th>
                  </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>목공사</td>
                      <td>5,000</td>
                      <td>5,000</td>
                      <td>5,000</td>
                      <td class="contract-column-summary">15,000</td>
                    </tr>
                    <tr>
                      <td>가구</td>
                      <td>500,000</td>
                      <td>5,000</td>
                      <td>5,000</td>
                      <td class="contract-column-summary">520,000</td>
                    </tr>
                    <tr>
                      <td>전기</td>
                      <td>5,000</td>
                      <td>5,000</td>
                      <td>5,000</td>
                      <td class="contract-column-summary">15,000</td>
                    </tr>
                    <tr>
                      <td>필름</td>
                      <td>5,000</td>
                      <td>5,000</td>
                      <td>5,000</td>
                      <td class="contract-column-summary">15,000</td>
                    </tr>
                    <tr>
                      <td>기타</td>
                      <td>5,000</td>
                      <td>5,000</td>
                      <td>5,000</td>
                      <td class="contract-column-summary">15,000</td>
                    </tr>
                    <tr class="contract-row-summary">
                      <td>계</td>
                      <td>5,000</td>
                      <td>5,000</td>
                      <td>5,000</td>
                      <td>15,000</td>
                    </tr>
                  </tbody>
                </table>

                <div class="title-view">
                  <h1 class="subtitle">송파카페 현장 입금 요청내역</h1>
                </div>
                <table class="table is-bordered contract-receipt-list">
                  <thead>
                    <tr>
                      <th>기안자</th>
                      <th>비용청구일자</th>
                      <th>공사</th>
                      <th>비용구분</th>
                      <th>비용상세내역</th>
                      <th>청구금액</th>
                      <th>부가세</th>
                      <th>입금정보</th>
                      <th>첨부서류</th>
                      <th>결재상태</th>
                      <th>메모</th>
                      <th>결재</th>
                    </tr>
                  </thead>
                  <tbody v-for="receipt in contractReceiptList" v-if="receipt.status !== -1" >
                  <tr>
                    <td>강형원</td>
                    <td t="d">{{moment(receipt.date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('YY-MM-DD')}}</td>
                    <td>{{receipt.constructionName}}</td>
                    <td>{{receipt.type === 1 ? '자재비' : '인건비'}}</td>
                    <td>{{receipt.contents}}</td>
                    <td>{{addCommas(receipt.price)}}</td>
                    <td>{{receipt.isVatIncluded === 0 ? '미포함' : '포함'}}</td>
                    <td t="s">
                      {{receipt.accountNumber}}<br />
                      {{receipt.accountBank}}<br />
                      {{receipt.accountHolder}}
                    </td>
                    <td>링크</td>
                    <td>{{receipt.statusName}}</td>
                    <td>{{receipt.memo}}</td>
                    <td class="receipt-button-wrapper">
                      <button class="button is-danger is-medium" v-if="userPermit === 'C' || (userPermit === 'B' && receipt.status !== 2)" @click="changeReceiptStatus(receipt, 0)">반려</button>
                      <button class="button is-danger is-medium" v-if="receipt.status === 0" @click="changeReceiptStatus(receipt, -1)">삭제</button>
                      <button class="button is-primary is-medium" v-if="userPermit === 'B' && receipt.status !== 2" @click="changeReceiptStatus(receipt, 2)">승인</button>
                      <button class="button is-primary is-medium" v-if="userPermit === 'C'" @click="changeReceiptStatus(receipt, 3)">입금완료</button>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </li>
            </ul>
          </div>
        </article>
      </div>
    </div>
    <div>
      <!--<pagination-vue :options="page" :page-click="moveToPagination" />-->
    </div>
    <ImageEnlargedView
      :image="enlargedImage.image"
      :imageGroup="enlargedImage.imageGroup"
      :index="enlargedImage.index"
      :isReceipt="true"
    />
  </div>
</template>

<script>
  import Pagenation from '../../services/pagination'
  import Filter from '../../services/filter'
  import PaginationVue from '../components/pagination'
  import mixin from '../../services/mixin'
  import PrivateWrapper from '../components/PrivateWrapper'
  import Datepicker from 'vue-bulma-datepicker'
  import router from '../../router'
  import moment from 'moment'
  import ImageEnlargedView from '../customer/ImageEnlargedView'
  import _ from 'underscore'
  import Notification from 'vue-bulma-notification'
  import Vue from 'vue'
  import XLSX from '../../thirdparty/js-xlsx/xlsx.full.min'

  const queryApi = '/api/contract'

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

  export default {
    name: 'contractReceiptIndex',
    components: {
      PrivateWrapper,
      PaginationVue,
      Notification,
      Datepicker,
      ImageEnlargedView
    },
    mixins: [mixin],
    data () {
      return {
        moment,
        page: new Pagenation(),
        filter: new Filter(),
        /* 결재 요청내역 */
        contractReceiptList: [],
        userPermit: '',
        searchOptions: {
          status: ''
        },
        enlargedImage: {
          image: {},
          imageGroup: [],
          index: 0
        }
      }
    },
    methods: {
      /* 결재 영수 조회 */
      loadContractReceipt () {
        this.checkPermission()
        this.$http.get(`${queryApi}/receipt?status=${this.searchOptions.status}`)
          .then((response) => {
            if (response.data.code !== 200) {
              this.contractReceiptList = []
              openNotification({
                message: response.data.data.msg,
                type: 'danger',
                duration: 1500
              })
              return
            }

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
        const id = item.pcPk
        let rejectReason
        if (status === 0) {
          rejectReason = window.prompt('반려사유를 입력해 주십시오.')
          if (!rejectReason) {
            return
          }
        }

        this.$http.put(`${queryApi}/${id}/receipt/${item.pk}`, {
          status: status,
          rejectReason
        })
          .then((response) => {
            this.loadContractReceipt()
          })
      },
      moveToRegisterReceipt () {
        router.push({
          path: `/private/receipt/register`
        })
      },
      checkPermission () {
        this.userPermit = this.$auth.user().user_permit
      },
      openImageEnlargedView (receipt) {
        const imageGroup = []
        _.forEach(receipt.attachment, (item) => {
          imageGroup.push({
            si_url: item.url
          })
        })

        if (imageGroup.length > 0) {
          this.enlargedImage.image = imageGroup[0]
          this.enlargedImage.index = 0
          this.enlargedImage.imageGroup = imageGroup

          this.$modal.show('imageEnlargedView')
        }
      },
      excelExport (type, fn) {
        const receiptTable = document.getElementById('receiptTable')
        const exportWb = XLSX.utils.book_new()
        const receiptTableWs = XLSX.utils.table_to_sheet(receiptTable)
        receiptTableWs['!cols'] = [
          {wch: 10},
          {wch: 20},
          {wch: 10},
          {wch: 10},
          {wch: 25},
          {wch: 15},
          {wch: 10},
          {wch: 10},
          {wch: 20},
          {wch: 10},
          {wch: 10},
          {wch: 10},
          {wch: 10},
          {wch: 10}
        ]
        XLSX.utils.book_append_sheet(exportWb, receiptTableWs, '결재목록')
        return XLSX.writeFile(exportWb, fn || `결재내역-${this.moment().format('YYYY-MM-DD HH:mm:ss')}.xlsx`)
      },
      getAttachmentUrl (receipt) {
        const attachment = receipt.attachment
        const attachmentList = []
        _.forEach(attachment, (item) => {
          attachmentList.push(item.url)
        })

        return attachmentList
      }
    },
    mounted () {
      this.loadContractReceipt()
    }
  }
</script>

<style scoped lang="scss">
  article {
    overflow: auto;
  }
  #addBtn {
    margin: 1rem 0;
  }
  .search {
    input {
      width: auto;
    }

    select {
      width: auto;
    }
  }
  .search-btn {
    line-height: 60px;
    a {
      vertical-align: bottom;
    }
  }
  .searchbox {
    div.control {
      margin-right: 3rem;
    }
  }

  @media screen and (max-width: 768px) {
    .contract-receipt-wrapper {
      > div {
        overflow-x: auto;
      }

      > p {
        float: none;
        padding: 0.5rem;
      }
    }
  }

  .contract-receipt {
    tbody {
      &:before {
        content: '';
        display: block;
        height: 20px;
      }

      font-size: 0.9rem;

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

        &.receipt-button-wrapper {
          text-align: center;
          vertical-align: middle;
        }
      }
    }
  }
</style>
<style scoped lang="scss">
  $table-header-color: #999999;
  .proceeding-contract-list {
    .title-view {
      margin-bottom: 1rem;
      .subtitle {
        font-weight: bold;
      }
      .summary-info {
        span {
          margin: 0 0.5rem;
        }
      }
    }
    .contract-column-summary {
      background-color: $table-header-color;
      color: #ffffff;
    }
    .contract-row-summary {
      background-color: $table-header-color;
      color: #ffffff;
    }
    .contract-receipt-list {
      thead {
        background-color: $table-header-color;
        tr {
          &:hover {
            background-color: $table-header-color;
          }
          th{
            color: #ffffff;
          }
        }
      }
    }
  }
</style>
