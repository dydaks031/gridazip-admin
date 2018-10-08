<template>
  <div>
    <div class="search box">
      <div class="block">
        <div class="is-clearfix">
          <div class="is-pulled-left is-horizontal searchbox">
            <div class="control is-inline-block">
              <label class="label">날짜</label>
              <p class="control">
                <datepicker />
                <button class="button">초기화</button>
              </p>
            </div>
            <div class="control is-inline-block">
              <label class="label">진행상태</label>
              <div class="select">
                <select>
                  <option value="" selected="selected">선택</option>
                  <option value="" selected="selected">기안</option>
                  <option value="" selected="selected">승인</option>
                  <option value="" selected="selected">입금완료</option>
                </select>
              </div>
            </div>
            <div class="control is-inline-block">
              <label class="label">입금 완료 내역 표시</label>
              <input type="checkbox" class="checkbox" />
            </div>
          </div>
          <div class="is-pulled-right search-btn">
            <a class="button is-info">검색</a>
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
    <div>
      <!--<pagination-vue :options="page" :page-click="moveToPagination" />-->
    </div>
  </div>
</template>

<script>
  import Pagenation from '../../services/pagination'
  import Filter from '../../services/filter'
  import PaginationVue from '../components/pagination'
  import Notification from 'vue-bulma-notification'
  import mixin from '../../services/mixin'
  import PrivateWrapper from '../components/PrivateWrapper'
  import Datepicker from 'vue-bulma-datepicker'
  import router from 'vue-router'
  import moment from 'moment'

  const queryApi = '/api/contract'

  export default {
    name: 'contractReceiptIndex',
    components: {
      PrivateWrapper,
      PaginationVue,
      Notification,
      Datepicker
    },
    mixins: [mixin],
    data () {
      return {
        moment,
        page: new Pagenation(),
        filter: new Filter(),
        /* 결재 요청내역 */
        contractReceiptList: [],
        userPermit: ''
      }
    },
    methods: {
      /* 결재 영수 조회 */
      loadContractReceipt () {
        this.checkPermission()
        this.$http.get(`${queryApi}/receipt`)
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
        const id = item.pcPk
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

        .contract-receipt {
          min-width: 1280px;
        }
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
      }
    }
  }
</style>
