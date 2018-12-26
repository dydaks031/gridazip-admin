<template>
  <div class="estimate-detail">
    <div class="tabs is-boxed">
      <ul>
        <li @click="activeView(tabType.info)" :class="{'is-active': currentTab === tabType.info}"><a>정보</a></li>
        <li @click="activeView(tabType.preEstimateView)" :class="{'is-active': currentTab === tabType.preEstimateView}"><a>가견적서</a></li>
        <li @click="activeView(tabType.estimateView)" :class="{'is-active': currentTab === tabType.estimateView}"><a>상세견적서</a></li>
        <li @click="activeView(tabType.managerAndShop)" :class="{'is-active': currentTab === tabType.managerAndShop}"><a>기술자 및 거래처</a></li>
        <li @click="activeView(tabType.siteImage)" :class="{'is-active': currentTab === tabType.siteImage}"><a>현장사진</a></li>
        <li @click="activeView(tabType.checkList)" :class="{'is-active': currentTab === tabType.checkList}"><a>시공일정</a></li>
        <li @click="activeView(tabType.contractReceipt)" :class="{'is-active': currentTab === tabType.contractReceipt}"><a>비용 수금현황</a></li>
        <li @click="activeView(tabType.collectBills)" :class="{'is-active': currentTab === tabType.collectBills}"><a>수금 입력</a></li>
      </ul>
    </div>
    <div class="tile is-ancestor">
      <div class="tile is-parent">
        <!-- 계약정보 탭 -->
        <article class="tile is-child box" v-show="currentTab === tabType.info">
          <div class="block">
            <label class="label">고객명</label>
            <div class="control">
              <input class="input" type="text" v-model="detailData.pc_name" :class="{'is-danger': $v.detailData.pc_name.$invalid }" />
              <p class="help is-danger" v-if="!$v.detailData.pc_name.required">고객명을 입력해 주십시오.</p>
            </div>
            <label class="label">별칭</label>
            <div class="control">
              <input class="input" type="text" v-model="detailData.pc_nickname" />
            </div>
            <label class="label">연락처</label>
            <div class="control">
              <input class="input" type="text" v-model="detailData.pc_phone" :class="{'is-danger': $v.detailData.pc_phone.$invalid }" />
              <p class="help is-danger" v-if="!$v.detailData.pc_phone.required">전화번호를 입력해 주십시오.</p>
            </div>
            <label class="label">현장감독</label>
            <div class="select is-fullwidth">
              <select v-model="detailData.pc_supervisor" id="pcSupervisor">
                <option value="" selected="selected">선택</option>
                <option v-for="supervisor in detailData.supervisorList" :value="supervisor.user_pk">{{supervisor.user_name}}</option>
              </select>
            </div>
            <label class="label">계약상태</label>
            <p class="control">
                {{requestStatusConfig.contractStatusList[detailData.pc_status]}}
                <button class="button" @click="changeContractStatus(-1)" v-if="[0, 1, 2].indexOf(detailData.pc_status) > 0">계약 실패</button>
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
        <!-- 가견적서 탭 -->
        <article class="tile is-child box" v-show = "currentTab === tabType.preEstimateView">
          <estimate-sheet :estimateIsPre="true"/>
        </article>
        <!-- 상세견적서 탭 -->
        <article class="tile is-child box estimate" v-show = "currentTab === tabType.estimateView">
          <estimate-sheet :estimateIsPre="false"/>
        </article>
        <!-- 기술자/거래처 탭 -->
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
        <!-- 현장사진 탭 -->
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
        <!-- 시공일정 탭 -->
        <article class="tile is-child box" v-show="currentTab === tabType.checkList">
          <p class="subtitle is-3 is-pulled-left">시공일정</p>
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
                <td colspan="7" class="has-text-centered" @click="isAddCheckList = true">+</td>
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
                  <button class="button is-danger" @click="isAddCheckList = false">취소</button>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </article>
        <!-- 현장별 결재내역 탭 -->
        <article class="tile is-child box contract-receipt-wrapper" v-show="currentTab === tabType.contractReceipt">

          <div class="is-clearfix">
            <p class="subtitle is-3 is-pulled-left">비용 수금현황</p>
          </div>
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
          <div class="title-view is-clearfix">
            <h1 class="subtitle">{{detailData.pc_name}} 고객({{detailData.pc_nickname}}) 현장 비용현황</h1>
            <div class="summary-info is-flex">
              <span>당 현장 견적금액: {{addCommas(contractTotalCosts)}}원</span>
              <span>현 집행금액: {{addCommas(receiptTotalCosts)}}원</span>
              <span>집행률: {{(receiptTotalCosts/contractTotalCosts * 100)?(receiptTotalCosts/contractTotalCosts * 100).toFixed(2):0}}%</span>
            </div>
          </div>
          <div>
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
              <tr v-for="price in contractPriceList">
                <td>{{addCommas(price.ct_name)}}</td>
                <td class="is-hidden-mobile">{{addCommas(price.labor_price)}}</td>
                <td class="is-hidden-mobile">{{addCommas(price.resource_price)}}</td>
                <td class="is-hidden-mobile">{{addCommas(price.etc_price)}}</td>
                <td class="contract-column-summary">{{addCommas(price.total_price)}}</td>
              </tr>
              <tr class="contract-row-summary">
                <td>계</td>
                <td class="is-hidden-mobile">{{addCommas(contractPrice.laborPrice)}}</td>
                <td class="is-hidden-mobile">{{addCommas(contractPrice.resourcePrice)}}</td>
                <td class="is-hidden-mobile">{{addCommas(contractPrice.etcPrice)}}</td>
                <td>{{addCommas(contractPrice.totalPrice)}}</td>
              </tr>
              </tbody>
            </table>
            <!--<div v-if="contractReceiptList.length === 0">-->
              <!--<span class="no-results">결재 요청이 없습니다.</span>-->
            <!--</div>-->
          </div>

          <div class="level title-view">
            <div class="level-left">
              <h1 class="subtitle" v-if="contractCollectSchedule.length !== 0">수금예정현황</h1>
            </div>
            <div class="level-right">
              <h1 class="subtitle" v-if="contractCollectBills.length !== 0">실제수금현황 / 수금률: {{getCollectBillsPercent(contractCollectBills, contractCollectSchedule)}}%</h1>

            </div>
          </div>
          <div class="level title-view collect-bills">
            <div class="level-left" v-if="contractCollectSchedule.length !== 0">
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
                <tr v-for="(schedule, i) in contractCollectSchedule">
                  <td class="has-text-centered">{{i+1}}</td>
                  <td>{{schedule.cb_type}}</td>
                  <td>{{schedule.cb_date===null?'':moment(schedule.cb_date).format('YYYY-MM-DD')}}</td>
                  <td class="has-text-right">{{addCommas(schedule.cb_amount)}}</td>
                </tr>
                <tr>
                  <td>합계</td>
                  <td colspan="2"></td>
                  <td class="has-text-right">{{addCommas(getTotalAmount(contractCollectSchedule))}}</td>
                </tr>
                </tbody>
              </table>
            </div>
            <div class="level-right" v-if="contractCollectBills.length !== 0">
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
                <tr v-for="(bills, i) in contractCollectBills">
                  <td class="has-text-centered">{{i+1}}</td>
                  <td>{{bills.cb_date===null?'':moment(bills.cb_date).format('YYYY-MM-DD')}}</td>
                  <td>{{bills.cb_sender}}</td>
                  <td class="has-text-right">{{addCommas(bills.cb_amount)}}</td>
                </tr>
                <tr>
                  <td>합계</td>
                  <td colspan="2"></td>
                  <td class="has-text-right">{{addCommas(getTotalAmount(contractCollectBills))}}</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="is-clearfix">
            <a class="button is-primary is-pulled-right is-medium" @click="moveToRegisterReceipt">등록</a>
          </div>
          <div class="title-view">
            <h1 class="subtitle">{{detailData.pc_name}} 고객({{detailData.pc_nickname}}) 현장 입금 요청내역</h1>
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
            <tbody>
            <tr v-for="receipt in contractReceiptList" v-if="receipt.status !== -1">
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
                <button class="button is-danger is-medium" v-if="userPermit === 'C' || (userPermit === 'B' && receipt.status !== 2 && receipt.status !== 3)" @click="changeReceiptStatus(detailData.pc_pk, receipt, 0)">반려</button>
                <button class="button is-danger is-medium" v-if="receipt.status === 0" @click="changeReceiptStatus(detailData.pc_pk, receipt, -1)">삭제</button>
                <button class="button is-primary is-medium" v-if="userPermit === 'B' && receipt.status !== 2 && receipt.status !== 3" @click="changeReceiptStatus(detailData.pc_pk, receipt, 2)">승인</button>
                <button class="button is-primary is-medium" v-if="userPermit === 'C'" @click="changeReceiptStatus(detailData.pc_pk, receipt, 3)">입금완료</button>
              </td>
            </tr>
            <tr v-if="contractReceiptList.length === 0">
              <td colspan="12" class="has-text-centered">입금 요청내역이 없습니다.</td>
            </tr>
            </tbody>
          </table>
          <table class="table is-bordered contract-receipt-list is-hidden-desktop" v-if="contractReceiptList.length !== 0">
            <tbody v-for="receipt in contractReceiptList" v-if="receipt.status !== -1" >
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

        </article>
        <!-- 수금 내역-->
        <article class="tile is-child box collect-bills-wrapper" v-show="currentTab === tabType.collectBills">
          <div class="is-clearfix">
            <p class="subtitle is-3 is-pulled-left">수금 내역</p>
          </div>
          <div class="block">
            <div class="control has-addons">
              <div class="control is-inline-block">
                <label class="label">수금일자</label>
                <p class="control">
                  <datepicker v-model="collectBillsData.cb_date" class="datepicker" :config="{dateFormat:'Y-m-d'}" />
                </p>
              </div>
              <div class="control is-inline-block">
                <label class="label">송금인</label>
                <p class="control">
                  <input class="input" type="input" v-model="collectBillsData.cb_sender" />
                </p>
              </div>
              <div class="control is-inline-block">
                <label class="label">금액</label>
                <input class="input" type="number" placeholder="금액 입력" v-model="collectBillsData.cb_amount" @keypress.enter.stop="addCollectBills">
                <a class="button is-primary" @click="addCollectBills">추가</a>
              </div>
            </div>
            <table class="table is-bordered">
              <colgroup>
                <col width="8%"/>
                <col width="17%"/>
                <col width="40%"/>
                <col width="30%"/>
                <col width="5%"/>
              </colgroup>
              <thead>
              <tr>
                <th class="has-text-centered">No.</th>
                <th>수금일</th>
                <th>송금인</th>
                <th class="has-text-right">금액</th>
                <th></th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(item, i) in collectBillsList" v-if="collectBillsList.length !== 0">
                <td class="has-text-centered">{{i+1}}</td>
                <td>{{item.cb_date===null?'':moment(item.cb_date).format('YYYY-MM-DD')}}</td>
                <td>{{item.cb_sender}}</td>
                <td class="has-text-right">{{addCommas(item.cb_amount)}}</td>
                <td class="has-text-centered">
                  <button class="button is-default is-small" @click="deleteCollectBills(item)">삭제</button>
                </td>
              </tr>
              <tr>
                <td class="has-text-centered">합계</td>
                <td colspan="3" class="has-text-right">{{addCommas(totalAmount)}}</td>
                <td></td>
              </tr>
              </tbody>
            </table>
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
    <add-bills-schedule-modal
      :id="param.id" />
    <add-site-image-modal
      :id="param.id"
      :beforeClose="loadSiteImage" />

    <ImageEnlargedView
      :image="enlargedImage.image"
      :imageGroup="enlargedImage.imageGroup"
      :index="enlargedImage.index"
      :isReceipt="true"
    />

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
  import AddBillsScheduleModal from './addBillsScheduleModal'
  import StarRating from 'vue-star-rating'
  import _ from 'underscore'
  import Datepicker from 'vue-bulma-datepicker'
  import mixin from '../../services/mixin'
  import EventBus from '../../services/eventBus'
  import moment from 'moment'
  import requestStatusConfig from '../../config/request-status-config'
  import ImageEnlargedView from '../customer/ImageEnlargedView'

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
  const userQueryApi = '/api/user'

  export default {
    name: 'estimateDetail',
    mixins: [mixin],
    components: {
      AddBillsScheduleModal,
      estimateSheet,
      addPartnersModal,
      addSiteImageModal,
      StarRating,
      Datepicker,
      ImageEnlargedView
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
          contractReceipt: 'contractReceipt',
          collectBills: 'collectBills'
        },
        currentTab: '',
        param: {},
        detailData: {
          pc_move_date: '',
          supervisorList: []
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
        /* 비용 수금 현황 */
        contractReceiptList: [],
        contractPriceList: [],
        contractCollectBills: [],
        contractCollectSchedule: [],
        contractTotalCosts: 0,
        receiptTotalCosts: 0,
        contractPrice: {
          laborPrice: 0,
          resourcePrice: 0,
          etcPrice: 0,
          totalPrice: 0
        },
        searchOptions: {
          status: ''
        },
        userPermit: '',

        /* 수금 내역 */
        collectBillsData: {
          cb_date: '',
          cb_amount: '',
          cb_sender: ''
        },
        collectBillsList: [],

        /* 이미지 팝업 */
        enlargedImage: {
          image: {},
          imageGroup: [],
          index: 0
        }
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
      EventBus.$on('openAddBillsScheduleModal', this.openAddBillsScheduleModal)
    },
    computed: {
      getFullAddress () {
        return `${this.detailData.pc_address_brief} ${this.detailData.pc_address_detail}`
      },
      totalAmount () {
        return this.collectBillsList.reduce((sum, o) => { return sum + parseInt(o.cb_amount) }, 0)
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
            // 하위 컴포넌트에 이벤트 전달
            EventBus.$emit('loadPreEstimateView')
            break
          case this.tabType.estimateView:
            // 하위 컴포넌트에 이벤트 전달
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
          case this.tabType.collectBills:
            this.loadCollectBills()
            break
        }
      },
      /* 진행계약 조회 */
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
            if (!this.detailData.pc_supervisor) this.detailData.pc_supervisor = ''
            this.detailData.pc_move_date = (this.detailData.pc_move_date === '0000-00-00 00:00:00' || !this.detailData.pc_move_date) ? '' : moment(this.detailData.pc_move_date, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD')
            return this.$http.get(userQueryApi)
          }).then(response => {
            if (response.data.code !== 200) {
              return false
            }
            this.detailData.supervisorList = response.data.data.users
            this.$forceUpdate()
          })
          .catch(error => {
            console.error(error)
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
        if (window.confirm('진행 계약을 삭제하시겠습니까?')) {
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
      /* 기술자&거래처 */
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
      openAddBillsScheduleModal () {
        this.$modal.show('addBillsScheduleModal')
      },
      /* 현장사진 */
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
      /* 시공일정 */
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
        // 체크된 시공일정의 cl_pk를 가져오기 위한 로직
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
                message: '시공일정 날짜 이동 중 오류가 발생하였습니다.',
                type: 'danger',
                duration: 1500
              })
              return
            }

            openNotification({
              message: '시공일정이 정상적으로 이동하였습니다.',
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
                message: '시공일정 등록 중 오류가 발생하였습니다.',
                type: 'danger',
                duration: 1500
              })
              return
            }
            openNotification({
              message: '시공일정이 정상적으로 등록되었습니다.',
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
            if (response.data.code !== 200) {
              openNotification({
                message: '시공일정이 삭제 중 오류가 발생하였습니다.',
                type: 'success',
                duration: 1500
              })
              return
            }
            openNotification({
              message: '시공일정이 정상적으로 삭제되었습니다.',
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
            if (response.data.code !== 200) {
              openNotification({
                message: '시공일정이 수정 중 이상이 발생하였습니다.',
                type: 'danger',
                duration: 1500
              })
              return
            }
            openNotification({
              message: '시공일정이 정상적으로 수정되었습니다.',
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
      /* 비용 수금 현황 */
      loadContractReceipt () {
        const id = this.param.id
        this.checkPermission()
        this.$http.get(`${queryApi}/${id}/receipt?status=${this.searchOptions.status}`)
          .then((response) => {
            if (response.data.code !== 200) {
              this.contractReceiptList = []
              return
            }
            this.contractReceiptList = response.data.data.receipts
            this.contractPriceList = response.data.data.priceList
            this.contractCollectBills = response.data.data.collectBills
            this.contractCollectSchedule = response.data.data.collectSchedule
            this.contractTotalCosts = response.data.data.contractTotalCosts
            this.receiptTotalCosts = response.data.data.receiptTotalCosts

            const reducer = (memo, num) => {
              return memo + num
            }

            this.contractPrice = {
              laborPrice: _.reduce(_.pluck(response.data.data.priceList, 'labor_price'), reducer, 0),
              resourcePrice: _.reduce(_.pluck(response.data.data.priceList, 'resource_price'), reducer, 0),
              etcPrice: _.reduce(_.pluck(response.data.data.priceList, 'etc_price'), reducer, 0),
              totalPrice: _.reduce(_.pluck(response.data.data.priceList, 'total_price'), reducer, 0)
            }

            this.contractReceiptList.map(item => {
              switch (item.type) {
                case 0:
                  item.typeToString = '인건비'
                  break
                case 1:
                  item.typeToString = '자재비'
                  break
                case 2:
                  item.typeToString = '기타잡비'
                  break
              }
              return item
            })

            this.contractReceiptList.map(item => {
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
            this.$forceUpdate()
          })
      },
      getTotalAmount (bills) {
        return bills.reduce((sum, bill) => { return sum + parseInt(bill.cb_amount) }, 0)
      },
      getCollectBillsPercent (bills, schedules) {
        const collectBillsTotal = bills.reduce((sum, bill) => { return sum + parseInt(bill.cb_amount) }, 0)
        const collectScheduleTotal = schedules.reduce((sum, schdule) => { return sum + parseInt(schdule.cb_amount) }, 0)
        return (collectBillsTotal / collectScheduleTotal * 100).toFixed(1)
      },
      /* 수금 내역 조회 */
      loadCollectBills () {
        const id = this.param.id
        this.checkPermission()
        this.$http.get(`${queryApi}/${id}/schedule?isSchedule=0`)
          .then((response) => {
            if (response.data.code !== 200) {
              this.collectBillsList = []
              return
            }
            this.collectBillsList = response.data.data.collectBillsList
          })
      },
      addCollectBills () {
        // validataion
        if (this.collectBillsData.cb_sender === '') {
          openNotification({
            message: '송금을 선택해주세요.',
            type: 'danger'
          })
          return false
        } else if (this.collectBillsData.cb_date === '') {
          openNotification({
            message: '수금일을 선택해주세요.',
            type: 'danger'
          })
          return false
        } else if (this.collectBillsData.cb_amount === '') {
          openNotification({
            message: '금액을 입력해주세요.',
            type: 'danger'
          })
          return false
        } else {
          this.$http.post(`${queryApi}/${this.param.id}/schedule`, this.collectBillsData)
            .then((response) => {
              if (response.data.code !== 200) {
                openNotification({
                  message: `수금 현황 등록에 실패하였습니다.`,
                  type: 'danger'
                })
                return false
              }
              this.collectBillsData.cb_sender = ''
              this.collectBillsData.cb_amount = ''

              openNotification({
                message: '등록 되었습니다.',
                type: 'success',
                duration: 1500
              })
              this.loadCollectBills()
            })
          this.$forceUpdate()
        }
      },
      deleteCollectBills (item) {
        const id = this.param.id
        this.$http.delete(`${queryApi}/${id}/schedule/${item.cb_pk}`)
          .then((response) => {
            if (response.data.code !== 200) {
              openNotification({
                message: '수금내역을 삭제하는 중 오류가 발생하였습니다.',
                type: 'success',
                duration: 1500
              })
              return
            }
            openNotification({
              message: '수금내역이 정상적으로 삭제되었습니다.',
              type: 'success',
              duration: 1500
            })
            this.loadCollectBills()
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
      checkPermission () {
        this.userPermit = this.$auth.user().user_permit
      }
    },
    beforeDestroy () {
      EventBus.$off('openAddBillsScheduleModal')
    }
  }
</script>

<style scoped lang="scss">
  $table-header-color: #dfdfdf;
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
  .search {
    margin-top: 2rem;
  }
  .search-btn {
    line-height: 60px;
    a {
      vertical-align: bottom;
    }
  }
  .contract-row-summary {
    background-color: $table-header-color;
    color: black;
    td {
      border: 1px solid #cccccc;
    }
  }
  .contract-column-summary {
    background-color: $table-header-color;
    border: 1px solid #cccccc;
    color: black;
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

  .contract-receipt-wrapper {
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
  }

  .collect-bills-wrapper {
    div.control {
      margin-right: 2rem;
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
