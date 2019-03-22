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
                <select v-model="searchOptions.status" @change="changeStatusOption">
                  <option value="" selected="selected">선택</option>
                  <!--<option value="-1">삭제</option>-->
                  <option value="0">반려</option>
                  <option value="1">기안</option>
                  <option value="2">승인</option>
                  <option value="3">입금완료</option>
                </select>
              </div>
            </div>
            <div class="control is-inline-block">
              <label class="label">현장 검색</label>
              <div class="select">
                <select v-model="selectedContract">
                  <option value="" selected="selected">전체</option>
                  <!--<option value="-1">삭제</option>-->
                  <option v-for="(contract,index) in contractReceiptList" :value="index">{{contract.name}} {{contract.nickname?'('+contract.nickname+')':''}}</option>
                </select>
              </div>
            </div>
          </div>
          <!--<div class="is-pulled-right search-btn">-->
            <!--<a class="button is-info" @click="loadContractReceipt">검색</a>-->
          <!--</div>-->
        </div>
      </div>
    </div>
    <div class="tile is-ancestor">
      <div class="tile is-parent">
        <article class="tile is-child box contract-receipt-wrapper">
          <div class="is-clearfix">
            <p class="subtitle is-3 is-pulled-left">비용 수금현황</p>
            <a class="button is-primary is-pulled-right is-medium" @click="moveToRegisterReceipt">등록</a>
            <button class="button is-info is-pulled-right is-medium excel-btn" @click="excelExport('xlsx')">엑셀 다운로드</button>
          </div>
          <div class="receiptAccount" v-if="userPermit === 'C'">
            <h1 class="subtitle">입금 요청 내역 집계</h1>
            <table class="table is-bordered">
              <thead>
              <tr>
                <th>은행명</th>
                <th>계좌번호</th>
                <th>예금주</th>
                <th>금액</th>
              </tr>
              </thead>
              <tbody>
                <tr v-for="account in receiptAccount">
                  <td>{{account.accountBank}}</td>
                  <td>{{account.accountNumber}}</td>
                  <td>{{account.accountHolder}}</td>
                  <td>{{addCommas(account.price)}}</td>
                </tr>
                <tr v-if="receiptAccount.length > 0" class="price-summary-by-account">
                  <td colspan="4">합게: {{addCommas(priceSummaryByAccount)}}</td>
                </tr>
                <tr v-if="receiptAccount.length === 0">
                  <td colspan="4" class="no-data">입금할 내역이 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <ul class="proceeding-contract-list" v-if="selectedContract === ''">
              <li class="contractItem box" v-for="contract in contractReceiptList">
                <div class="title-view is-clearfix">
                  <h1 class="subtitle">{{contract.name}} {{contract.nickname?'('+contract.nickname+')':''}} 현장 비용현황</h1>
                  <div class="summary-info is-flex">
                    <span>당 현장 견적금액: {{addCommas(contract.contractTotalCosts)}}원</span>
                    <span>현 집행금액: {{addCommas(contract.receiptTotalCosts)}}원</span>
                    <span>집행률: {{(contract.receiptTotalCosts/contract.contractTotalCosts * 100).toFixed(2)}}%</span>
                  </div>
                </div>
                <table class="table is-bordered contract-summary">
                  <thead>
                  <tr>
                    <th>공사</th>
                    <th class="is-hidden-mobile">인건비</th>
                    <th class="is-hidden-mobile">자재비</th>
                    <th class="is-hidden-mobile">기타잡비</th>
                    <th class="contract-column-summary">계</th>
                  </tr>
                  </thead>
                  <tbody>
                    <tr v-for="price in contract.priceList">
                      <td>{{addCommas(price.ct_name)}}</td>
                      <td class="is-hidden-mobile">{{addCommas(price.labor_price)}}</td>
                      <td class="is-hidden-mobile">{{addCommas(price.resource_price)}}</td>
                      <td class="is-hidden-mobile">{{addCommas(price.etc_price)}}</td>
                      <td class="contract-column-summary">{{addCommas(price.total_price)}}</td>
                    </tr>
                    <tr class="contract-row-summary">
                      <td>계</td>
                      <td class="is-hidden-mobile">{{addCommas(contract.priceSummary.laborPrice)}}</td>
                      <td class="is-hidden-mobile">{{addCommas(contract.priceSummary.resourcePrice)}}</td>
                      <td class="is-hidden-mobile">{{addCommas(contract.priceSummary.etcPrice)}}</td>
                      <td>{{addCommas(contract.priceSummary.totalPrice)}}</td>
                    </tr>
                  </tbody>
                </table>

                <div class="level title-view">
                  <div class="level-left">
                    <h1 class="subtitle" v-if="contract.collectSchedule.length !== 0">수금예정현황</h1>
                  </div>
                  <div class="level-right">
                    <h1 class="subtitle" v-if="contract.collectBills.length !== 0">실제수금현황 / 수금률: {{getCollectBillsPercent(contract)}}%</h1>

                  </div>
                </div>
                <div class="level title-view collect-bills">
                  <div class="level-left" v-if="contract.collectSchedule.length !== 0">
                    <table class="table is-bordered contract-receipt-list is-hidden-touch">
                      <thead>
                        <tr>
                          <th>No.</th>
                          <th>구분</th>
                          <th>수금예정일</th>
                          <th>금액</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(schedule, i) in contract.collectSchedule">
                          <td class="has-text-centered">{{i+1}}</td>
                          <td>{{schedule.cb_type}}</td>
                          <td>{{schedule.cb_date===null?'':moment(schedule.cb_date).format('YYYY-MM-DD')}}</td>
                          <td class="has-text-right">{{addCommas(schedule.cb_amount)}}</td>
                        </tr>
                        <tr>
                          <td>합계</td>
                          <td colspan="2"></td>
                          <td class="has-text-right">{{addCommas(getTotalAmount(contract.collectSchedule))}}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div class="level-right" v-if="contract.collectBills.length !== 0">
                    <table class="table is-bordered contract-receipt-list is-hidden-touch">
                      <thead>
                      <tr>
                        <th>No.</th>
                        <th>실제수금일</th>
                        <th>예금주</th>
                        <th>금액</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr v-for="(bills, i) in contract.collectBills">
                        <td class="has-text-centered">{{i+1}}</td>
                        <td>{{bills.cb_date===null?'':moment(bills.cb_date).format('YYYY-MM-DD')}}</td>
                        <td>{{bills.cb_sender}}</td>
                        <td class="has-text-right">{{addCommas(bills.cb_amount)}}</td>
                      </tr>
                      <tr>
                        <td>합계</td>
                        <td colspan="2"></td>
                        <td class="has-text-right">{{addCommas(getTotalAmount(contract.collectBills))}}</td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div class="title-view">
                  <h1 class="subtitle">{{contract.name}} {{contract.nickname?'('+contract.nickname+')':''}} 현장 입금 요청내역</h1>
                </div>
                <table class="table is-bordered contract-receipt-list is-hidden-touch">
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
                  <tbody v-for="receipt in contract.receipt" v-if="receipt.status !== -1" >
                  <tr>
                    <td>{{receipt.drafter}}</td>
                    <td t="d">{{moment(receipt.date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('YY-MM-DD')}}</td>
                    <td>{{receipt.ctName}}</td>
                    <td>{{receipt.typeToString}}</td>
                    <td>{{receipt.contents}}</td>
                    <td>{{addCommas(receipt.price)}}</td>
                    <td>{{receipt.isVatIncluded === 0 ? '미포함' : '포함'}}</td>
                    <td t="s">
                      {{receipt.accountNumber}}<br />
                      {{receipt.accountBank}}<br />
                      {{receipt.accountHolder}}
                    </td>
                    <td><a href="#" @click="openImageEnlargedView(receipt)" v-if="receipt.attachment.length > 0">링크</a></td>
                    <td>{{receipt.statusName}}</td>
                    <td>{{receipt.memo}}</td>
                    <td class="receipt-button-wrapper">
                      <button class="button is-danger is-medium" v-if="(userPermit === 'C' && receipt.status !== 3) || (userPermit === 'B' && receipt.status !== 2 && receipt.status !== 3)" @click="changeReceiptStatus(contract.pk, receipt, 0)">반려</button>
                      <button class="button is-danger is-medium" v-if="receipt.status === 0" @click="changeReceiptStatus(contract.pk, receipt, -1)">삭제</button>
                      <button class="button is-primary is-medium" v-if="userPermit === 'B' && receipt.status !== 2 && receipt.status !== 3" @click="changeReceiptStatus(contract.pk, receipt, 2)">승인</button>
                      <button class="button is-primary is-medium" v-if="(userPermit === 'C' && receipt.status !== 3)" @click="changeReceiptStatus(contract.pk, receipt, 3)">입금완료</button>
                    </td>
                  </tr>
                  </tbody>
                </table>
                <table class="table is-bordered contract-receipt-list is-hidden-desktop" v-if="contractReceiptList.length !== 0">
                  <tbody v-for="receipt in contract.receipt" v-if="receipt.status !== -1" >
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
                      <td>{{receipt.typeToString}}</td>
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
                      <td><a href="#" @click="openImageEnlargedView(receipt)">링크</a></td>
                    </tr>
                    <tr>
                      <th>진행상태</th>
                      <td>{{receipt.statusName}}</td>
                    </tr>
                    <tr v-if="!receipt.rejectReason">
                      <th>메모</th>
                      <td>{{receipt.memo}}</td>
                    </tr>
                    <tr v-if="receipt.rejectReason">
                      <th>반려사유</th>
                      <td>{{receipt.rejectReason}}</td>
                    </tr>
                    <tr>
                      <td colspan="2" class="receipt-button-wrapper">
                      <button class="button is-danger is-medium" v-if="userPermit === 'C' || (userPermit === 'B' && receipt.status !== 2)" @click="changeReceiptStatus(contract.pk, receipt, 0)">반려</button>
                      <button class="button is-danger is-medium" v-if="receipt.status === 0" @click="changeReceiptStatus(contract.pk, receipt, -1)">삭제</button>
                      <button class="button is-primary is-medium" v-if="userPermit === 'B' && receipt.status !== 2" @click="changeReceiptStatus(contract.pk, receipt, 2)">승인</button>
                      <button class="button is-primary is-medium" v-if="userPermit === 'C'" @click="changeReceiptStatus(contract.pk, receipt, 3)">입금완료</button>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </li>
            </ul>
            <ul class="proceeding-contract-list" v-else>
              <li class="contractItem box">
                <div class="title-view is-clearfix">
                  <h1 class="subtitle">{{contractReceiptList[selectedContract].name}} {{contractReceiptList[selectedContract].nickname?'('+contractReceiptList[selectedContract].nickname+')':''}} 현장 비용현황</h1>
                  <div class="summary-info is-flex">
                    <span>당 현장 견적금액: {{addCommas(contractReceiptList[selectedContract].contractTotalCosts)}}원</span>
                    <span>현 집행금액: {{addCommas(contractReceiptList[selectedContract].receiptTotalCosts)}}원</span>
                    <span>집행률: {{(contractReceiptList[selectedContract].receiptTotalCosts/contractReceiptList[selectedContract].contractTotalCosts * 100).toFixed(2)}}%</span>
                  </div>
                </div>
                <table class="table is-bordered contract-summary">
                  <thead>
                  <tr>
                    <th>공사</th>
                    <th class="is-hidden-mobile">인건비</th>
                    <th class="is-hidden-mobile">자재비</th>
                    <th class="is-hidden-mobile">기타잡비</th>
                    <th class="contract-column-summary">계</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="price in contractReceiptList[selectedContract].priceList">
                    <td>{{addCommas(price.ct_name)}}</td>
                    <td class="is-hidden-mobile">{{addCommas(price.labor_price)}}</td>
                    <td class="is-hidden-mobile">{{addCommas(price.resource_price)}}</td>
                    <td class="is-hidden-mobile">{{addCommas(price.etc_price)}}</td>
                    <td class="contract-column-summary">{{addCommas(price.total_price)}}</td>
                  </tr>
                  <tr class="contract-row-summary">
                    <td>계</td>
                    <td class="is-hidden-mobile">{{addCommas(contractReceiptList[selectedContract].priceSummary.laborPrice)}}</td>
                    <td class="is-hidden-mobile">{{addCommas(contractReceiptList[selectedContract].priceSummary.resourcePrice)}}</td>
                    <td class="is-hidden-mobile">{{addCommas(contractReceiptList[selectedContract].priceSummary.etcPrice)}}</td>
                    <td>{{addCommas(contractReceiptList[selectedContract].priceSummary.totalPrice)}}</td>
                  </tr>
                  </tbody>
                </table>

                <div class="level title-view">
                  <div class="level-left">
                    <h1 class="subtitle" v-if="contractReceiptList[selectedContract].collectSchedule.length !== 0">수금예정현황</h1>
                  </div>
                  <div class="level-right">
                    <h1 class="subtitle" v-if="contractReceiptList[selectedContract].collectBills.length !== 0">실제수금현황 / 수금률: {{getCollectBillsPercent(contractReceiptList[selectedContract])}}%</h1>

                  </div>
                </div>
                <div class="level title-view collect-bills">
                  <div class="level-left" v-if="contractReceiptList[selectedContract].collectSchedule.length !== 0">
                    <table class="table is-bordered contract-receipt-list is-hidden-touch">
                      <thead>
                      <tr>
                        <th>No.</th>
                        <th>구분</th>
                        <th>수금예정일</th>
                        <th>금액</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr v-for="(schedule, i) in contractReceiptList[selectedContract].collectSchedule">
                        <td class="has-text-centered">{{i+1}}</td>
                        <td>{{schedule.cb_type}}</td>
                        <td>{{schedule.cb_date===null?'':moment(schedule.cb_date).format('YYYY-MM-DD')}}</td>
                        <td class="has-text-right">{{addCommas(schedule.cb_amount)}}</td>
                      </tr>
                      <tr>
                        <td>합계</td>
                        <td colspan="2"></td>
                        <td class="has-text-right">{{addCommas(getTotalAmount(contractReceiptList[selectedContract].collectSchedule))}}</td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                  <div class="level-right" v-if="contractReceiptList[selectedContract].collectBills.length !== 0">
                    <table class="table is-bordered contract-receipt-list is-hidden-touch">
                      <thead>
                      <tr>
                        <th>No.</th>
                        <th>실제수금일</th>
                        <th>예금주</th>
                        <th>금액</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr v-for="(bills, i) in contractReceiptList[selectedContract].collectBills">
                        <td class="has-text-centered">{{i+1}}</td>
                        <td>{{bills.cb_date===null?'':moment(bills.cb_date).format('YYYY-MM-DD')}}</td>
                        <td>{{bills.cb_sender}}</td>
                        <td class="has-text-right">{{addCommas(bills.cb_amount)}}</td>
                      </tr>
                      <tr>
                        <td>합계</td>
                        <td colspan="2"></td>
                        <td class="has-text-right">{{addCommas(getTotalAmount(contractReceiptList[selectedContract].collectBills))}}</td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div class="title-view">
                  <h1 class="subtitle">{{contractReceiptList[selectedContract].name}} {{contractReceiptList[selectedContract].nickname?'('+contractReceiptList[selectedContract].nickname+')':''}} 현장 입금 요청내역</h1>
                </div>
                <table class="table is-bordered contract-receipt-list is-hidden-touch">
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
                  <tbody v-for="receipt in contractReceiptList[selectedContract].receipt" v-if="receipt.status !== -1" >
                  <tr>
                    <td>{{receipt.drafter}}</td>
                    <td t="d">{{moment(receipt.date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('YY-MM-DD')}}</td>
                    <td>{{receipt.ctName}}</td>
                    <td>{{receipt.typeToString}}</td>
                    <td>{{receipt.contents}}</td>
                    <td>{{addCommas(receipt.price)}}</td>
                    <td>{{receipt.isVatIncluded === 0 ? '미포함' : '포함'}}</td>
                    <td t="s">
                      {{receipt.accountNumber}}<br />
                      {{receipt.accountBank}}<br />
                      {{receipt.accountHolder}}
                    </td>
                    <td><a href="#" @click="openImageEnlargedView(receipt)" v-if="receipt.attachment.length > 0">링크</a></td>
                    <td>{{receipt.statusName}}</td>
                    <td>{{receipt.memo}}</td>
                    <td class="receipt-button-wrapper">
                      <button class="button is-danger is-medium" v-if="(userPermit === 'C' && receipt.status !== 3) || (userPermit === 'B' && receipt.status !== 2 && receipt.status !== 3)" @click="changeReceiptStatus(contractReceiptList[selectedContract].pk, receipt, 0)">반려</button>
                      <button class="button is-danger is-medium" v-if="receipt.status === 0" @click="changeReceiptStatus(contractReceiptList[selectedContract].pk, receipt, -1)">삭제</button>
                      <button class="button is-primary is-medium" v-if="userPermit === 'B' && receipt.status !== 2 && receipt.status !== 3" @click="changeReceiptStatus(contractReceiptList[selectedContract].pk, receipt, 2)">승인</button>
                      <button class="button is-primary is-medium" v-if="(userPermit === 'C' && receipt.status !== 3)" @click="changeReceiptStatus(contractReceiptList[selectedContract].pk, receipt, 3)">입금완료</button>
                    </td>
                  </tr>
                  </tbody>
                </table>
                <table class="table is-bordered contract-receipt-list is-hidden-desktop" v-if="contractReceiptList.length !== 0">
                  <tbody v-for="receipt in contractReceiptList[selectedContract].receipt" v-if="receipt.status !== -1" >
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
                    <td>{{receipt.typeToString}}</td>
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
                    <td><a href="#" @click="openImageEnlargedView(receipt)">링크</a></td>
                  </tr>
                  <tr>
                    <th>진행상태</th>
                    <td>{{receipt.statusName}}</td>
                  </tr>
                  <tr v-if="!receipt.rejectReason">
                    <th>메모</th>
                    <td>{{receipt.memo}}</td>
                  </tr>
                  <tr v-if="receipt.rejectReason">
                    <th>반려사유</th>
                    <td>{{receipt.rejectReason}}</td>
                  </tr>
                  <tr>
                    <td colspan="2" class="receipt-button-wrapper">
                      <button class="button is-danger is-medium" v-if="userPermit === 'C' || (userPermit === 'B' && receipt.status !== 2)" @click="changeReceiptStatus(contractReceiptList[selectedContract].pk, receipt, 0)">반려</button>
                      <button class="button is-danger is-medium" v-if="receipt.status === 0" @click="changeReceiptStatus(contractReceiptList[selectedContract].pk, receipt, -1)">삭제</button>
                      <button class="button is-primary is-medium" v-if="userPermit === 'B' && receipt.status !== 2" @click="changeReceiptStatus(contractReceiptList[selectedContract].pk, receipt, 2)">승인</button>
                      <button class="button is-primary is-medium" v-if="userPermit === 'C'" @click="changeReceiptStatus(contractReceiptList[selectedContract].pk, receipt, 3)">입금완료</button>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </li>
            </ul>
            <table class="table is-bordered contract-receipt" v-show="false" id="receiptTable">
              <thead>
              <tr>
                <th>날짜</th>
                <th>현장</th>
                <th>공사</th>
                <th>구분</th>
                <th>내용</th>
                <th>금액</th>
                <th>부가세</th>
                <th>은행명</th>
                <th>예금주</th>
                <th>계좌번호</th>
                <!--<th>첨부서류</th>-->
                <th>진행상태</th>
                <th>메모</th>
                <th>반려사유</th>
              </tr>
              </thead>
              <tbody v-for="receipt in receiptList" v-if="receipt.status !== -1" >
              <tr>
                <td t="d">{{moment(receipt.date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('YYYY-MM-DD')}}</td>
                <td>{{receipt.contractName}}</td>
                <td>{{receipt.ctName}}</td>
                <td>{{receipt.type === 1 ? '자재비' : '인건비'}}</td>
                <td>{{receipt.contents}}</td>
                <td>{{addCommas(receipt.price)}}</td>
                <td>{{receipt.isVatIncluded === 0 ? '미포함' : '포함'}}</td>
                <td>{{receipt.accountBank}}</td>
                <td>{{receipt.accountHolder}}</td>
                <td t="s">{{receipt.accountNumber}}</td>
                <!--<td><img v-for="image in getAttachmentUrl(receipt)" :src="image" /></td>-->
                <td>{{receipt.statusName}}</td>
                <td>{{receipt.memo}}</td>
                <td>{{receipt.rejectReason}}</td>
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
      PaginationVue,
      Notification,
      Datepicker,
      ImageEnlargedView
    },
    mixins: [mixin],
    data () {
      return {
        moment,
        priceSummaryByAccount: 0,
        page: new Pagenation(),
        filter: new Filter(),
        /* 결재 요청내역 */
        contractReceiptList: [],
        receiptAccount: [],
        receiptList: [],
        userPermit: '',
        searchOptions: {
          status: ''
        },
        enlargedImage: {
          image: {},
          imageGroup: [],
          index: 0
        },
        selectedContract: ''
      }
    },
    methods: {
      changeStatusOption () {
        this.selectedContract = ''
        this.loadContractReceipt()
      },
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

            this.contractReceiptList = response.data.data.contract
            this.receiptAccount = response.data.data.receiptAccount || []
            this.receiptList = []

            if (this.receiptAccount.length > 0) {
              const reducer = (memo, num) => {
                return memo + num
              }
              this.priceSummaryByAccount = _.reduce(_.pluck(this.receiptAccount, 'price'), reducer, 0)
            }

            this.contractReceiptList.forEach(contract => {
              const reducer = (memo, num) => {
                return memo + num
              }

              contract.receipt.forEach(receipt => {
                receipt.contractName = contract.name

                this.receiptList.push(receipt)
              })

              contract.priceSummary = {
                laborPrice: _.reduce(_.pluck(contract.priceList, 'labor_price'), reducer, 0),
                resourcePrice: _.reduce(_.pluck(contract.priceList, 'resource_price'), reducer, 0),
                etcPrice: _.reduce(_.pluck(contract.priceList, 'etc_price'), reducer, 0),
                totalPrice: _.reduce(_.pluck(contract.priceList, 'total_price'), reducer, 0)
              }

              contract.receipt.forEach(receipt => {
                switch (receipt.type) {
                  case 0:
                    receipt.typeToString = '인건비'
                    break
                  case 1:
                    receipt.typeToString = '자재비'
                    break
                  case 2:
                    receipt.typeToString = '기타잡비'
                    break
                }

                switch (receipt.status) {
                  case -1:
                    receipt.statusName = '삭제'
                    break
                  case 0:
                    receipt.statusName = '반려'
                    break
                  case 1:
                    receipt.statusName = '대기'
                    break
                  case 2:
                    receipt.statusName = '승인'
                    break
                  case 3:
                    receipt.statusName = '입금완료'
                    break
                }
              })
            })
          })
      },
      changeReceiptStatus (id, item, status) {
        this.checkPermission()
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
            if (response.data.code !== 200) {
              openNotification({
                message: '결재 진행 중 오류가 발생하였습니다.',
                type: 'danger',
                duration: 1500
              })
              return
            }
            openNotification({
              message: '결재가 정상적으로 처리되었습니다.',
              type: 'success',
              duration: 1500
            })
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
      },

      getTotalAmount (bills) {
        return bills.reduce((sum, bill) => { return sum + parseInt(bill.cb_amount) }, 0)
      },
      getCollectBillsPercent (contract) {
        const collectBillsTotal = contract.collectBills.reduce((sum, bill) => { return sum + parseInt(bill.cb_amount) }, 0)
        const collectScheduleTotal = contract.collectSchedule.reduce((sum, schdule) => { return sum + parseInt(schdule.cb_amount) }, 0)
        return (collectBillsTotal / collectScheduleTotal * 100).toFixed(1)
      }
    },
    mounted () {
      this.loadContractReceipt()
    }
  }
</script>

<style scoped lang="scss">
  $table-header-color: #dfdfdf;
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
  .excel-btn {
    margin-right:1rem;
  }
  .no-data {
    text-align: center;
  }
  .searchbox {
    div.control {
      margin-right: 3rem;
    }
  }
  .receiptAccount {
    .subtitle {
      font-weight: bold;
    }
    table {
      thead {
        background-color: $table-header-color;
        tr {
          &:hover {
            background-color: $table-header-color;
          }
          th {
            color: black;
            border: 1px solid #cccccc;
          }
        }
      }
      tbody {
        .price-summary-by-account {
          td {
            text-align: right;
          }
        }
      }
    }
  }
  .proceeding-contract-list {
    .title-view {
      margin-bottom: 1rem;
      .subtitle {
        float: left;
        font-weight: bold;
        margin: 0.5rem 0;
      }
      .summary-info {
        float: right;
        span {
          margin: 0 0.5rem;
        }
      }
    }
    .contract-column-summary {
      background-color: $table-header-color;
      border: 1px solid #cccccc;
      color: black;
    }
    .contract-row-summary {
      background-color: $table-header-color;
      color: black;
      td {
        border: 1px solid #cccccc;
      }
    }
    .contract-receipt-list {
      padding: 0.5rem 0;
      thead {
        background-color: $table-header-color;
        tr {
          &:hover {
            background-color: $table-header-color;
          }
          th{
            color: black;
            border: 1px solid #cccccc;
            text-align: center;
          }
        }
      }

      tbody {
        font-size: 0.9rem;

        th {
          background: $table-header-color;
          color: black;
          border: 1px solid #cccccc;
        }
        td {
          border: 1px solid #cccccc;

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

    .collect-bills {
      > div {
        align-self : baseline;
      }
    }
  }

  @media screen and (max-width: 768px) {
    .excel-btn {
      margin: 0.5rem 0;
    }

    .contract-receipt-wrapper {
      background: transparent;
      box-shadow: none;
      padding: 0;

      > div {
        overflow-x: auto;
      }

      > p {
        float: none;
        padding: 0.5rem;
      }

      .proceeding-contract-list {
        margin: 0.5rem 0;
        .title-view {
          .subtitle {
            float: inherit;
          }
          .summary-info {
            float: inherit;
            display: block;
            span {
              display: block;
              margin: 0.25rem 0;
            }
          }
        }
        .contract-receipt-list {
          tbody {
            &:before {
              content: '';
              display: block;
              height: 2rem;
            }
          }
        }
      }
    }
  }
</style>
