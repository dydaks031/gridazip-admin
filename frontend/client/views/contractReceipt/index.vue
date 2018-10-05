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
          <h4 class="title">결제 요청내역</h4>
          <div>
            <table class="table is-bordered contract-receipt">
            <tbody>
            <tr>
              <th>계약명</th>
              <td>이태원 루프탑</td>
              <th>날짜</th>
              <td>2018.09.01</td>
              <th>공사</th>
              <td>타일</td>
              <th>구분</th>
              <td>인건비</td>
              <th>내용</th>
              <td>엘리베이터 사용료</td>
              <th>금액</th>
              <td>100,000</td>
              <th>부가세</th>
              <td>미포함</td>
              <td rowspan="2" style="text-align: center; vertical-align: middle;">
                <button class="button is-danger is-medium">반려</button>
                <button class="button is-primary is-medium">승인</button>
              </td>
            </tr>
            <tr>
              <th>은행명</th>
              <td>하나은행</td>
              <th>예금주</th>
              <td>강형원</td>
              <th>계좌번호</th>
              <td>010-412382-01905</td>
              <th>첨부서류</th>
              <td><a href="#">링크</a></td>
              <th>진행상태</th>
              <td>기안</td>
              <th>메모</th>
              <td colspan="3">1111</td>
            </tr>
            </tbody>
            <tbody>
            <tr>
              <th>날짜</th>
              <td>2018.09.01</td>
              <th>공사</th>
              <td>타일</td>
              <th>구분</th>
              <td colspan="2">인건비</td>
              <th>내용</th>
              <td>엘리베이터 사용료</td>
              <th>금액</th>
              <td>100,000</td>
              <th>부가세</th>
              <td>미포함</td>
              <td rowspan="2" style="text-align: center; vertical-align: middle;">
                <button class="button is-danger is-medium">반려</button>
                <button class="button is-primary is-medium">승인</button>
              </td>
            </tr>
            <tr>
              <th>은행명</th>
              <td>하나은행</td>
              <th>예금주</th>
              <td>강형원</td>
              <th>계좌번호</th>
              <td colspan="2">010-412382-01905</td>
              <th>첨부서류</th>
              <td><a href="#">링크</a></td>
              <th>진행상태</th>
              <td>기안</td>
              <th>메모</th>
              <td colspan="1">1111</td>
            </tr>
            </tbody>
          </table>
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
        page: new Pagenation(),
        filter: new Filter(),
        data: []
      }
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
