<template>
  <div>
    <div class="title-wrapper">
      <span class="title">공간별 견적</span>
      <a class="button is-info is-pulled-right is-medium print-btn" @click="excelxport('xlsx')">엑셀</a>
      <a class="button is-info is-pulled-right is-medium print-btn" @click="duplicateTab" v-if="estimateIsPre">복제</a>
      <a class="button is-primary is-pulled-right is-medium print-btn" @click="selectionTab" v-if="estimateIsPre">채택</a>
      <a class="button is-warning is-pulled-right is-medium print-btn" id="addBtn" @click="moveToRegister" v-if="deleteRegisterBtn !== true && (estimateIsPre || estimateCurrentTabs.length !== 0) && selectedTab !== ''">
        <span v-if="estimateCurrentTabs.length === 0 && estimateIsPre === true">
          등록
        </span>
        <span v-else>
          수정
        </span>
      </a>
      <a class="button is-danger is-pulled-right is-medium print-btn" @click="sendToSmS" v-if="deleteRegisterBtn !== true ">SMS 발송</a>
      <a class="button is-info is-pulled-right is-medium print-btn" id="printBtn" @click="printPage()">인쇄</a>
    </div>
    <div class="tabs is-boxed is-medium">
      <ul>
        <li v-if="!estimateIsPre" :class="{'is-active': selectedTab === ''}">
          <a @click="moveTab">
            <span>총계</span>
          </a>
        </li>
        <li v-for="(tab, index) in estimateCurrentTabs" :class="{'is-active': selectedTab === tab.es_pk}">
          <a @click="moveTab(tab)">
            <span class="icon is-small"><i class="fa fa-image" aria-hidden="true"></i></span>
            <span>v.{{tab.es_version}}</span>
          </a>
        </li>
        <li v-if="!estimateIsPre">
          <a @click="createNewTab">
            <span class="icon is-small"><i class="fa fa-plus" aria-hidden="true"></i></span>
          </a>
        </li>
      </ul>
    </div>
    <div v-if="estimateCurrentTabs.length !== 0">
      <table class="table position-base-table" id="general-table">
        <colgroup>
          <col width="8%" />
          <col width="5%" />
          <col width="10%" />
          <col width="10%" />
          <col width="10%" />
          <col width="auto" />
          <col width="10%" />
          <col width="10%" />
          <col width="10%" />
        </colgroup>
        <thead>
        <tr>
          <th>위치</th>
          <th>공사</th>
          <th>공정</th>
          <th>상세공정</th>
          <th>상세위치</th>
          <th>자재</th>
          <th class="has-text-right">인건비</th>
          <th class="has-text-right">자재비</th>
        </tr>
        </thead>
        <tbody>
        <tr :class="{'is-summary': generalData.is_summary}" v-for="generalData in viewerData.general" v-if="generalData.rt_sub === 0 || (generalData.hasOwnProperty('sub_key') && isOpenSubResource[generalData.sub_key] === true)" @click="openSubResource(generalData)">
          <td v-if="generalData.hasOwnProperty('place_count')" :rowspan="generalData.hasOwnProperty('sub_key') ?  isOpenSubResource[generalData.sub_key] === true ? generalData.place_count : 1 : generalData.place_count">{{generalData.place_name}}</td>
          <td v-if="generalData.hasOwnProperty('construction_count')" :rowspan="generalData.hasOwnProperty('sub_key') ?  isOpenSubResource[generalData.sub_key] === true ? generalData.construction_count : 1 : generalData.construction_count">{{generalData.ct_name}}</td>
          <td v-if="generalData.hasOwnProperty('construction_process_count')" :rowspan="generalData.hasOwnProperty('sub_key') ?  isOpenSubResource[generalData.sub_key] === true ? generalData.construction_process_count : 1 : generalData.construction_process_count">{{generalData.cp_name}}</td>
          <td>{{generalData.cpd_name}}</td>
          <td>{{generalData.detail_place}}</td>
          <td>{{generalData.rs_name}}<span v-if="generalData.rs_code !== ''">({{generalData.ed_alias || generalData.rs_code}})</span></td>
          <td class="has-text-right">{{addCommas(generalData.labor_costs)}}</td>
          <td class="has-text-right">{{addCommas(generalData.resource_costs)}}</td>
        </tr>
        </tbody>
      </table>
      <div class="tile is-ancestor">
        <div class="tile is-parent is-6">
          <article class="tile is-child box">
            <h4 class="title">자재비</h4>
            <h4 class="title">금액: {{addCommas(viewerData.total.resource_costs)}}</h4>
            <div class="content">
              <table class="table" id="resource-table">
                <colgroup>
                  <col width="auto"/>
                </colgroup>
                <thead>
                <tr>
                  <th>자재분류</th>
                  <th>자재</th>
                  <th>물량</th>
                  <th>자재단위</th>
                  <th class="has-text-right">단가</th>
                  <th class="has-text-right">금액</th>
                </tr>
                </thead>
                <tbody>
                <tr :class="{'is-summary': resource.is_summary}" v-for="resource in viewerData.resource" v-if="resource.resource_costs !== 0">
                  <td v-if="resource.hasOwnProperty('resource_category_count')" :rowspan="resource.resource_category_count || 1">{{resource.rc_name}}</td>
                  <td>{{resource.rs_name}}<span v-if="resource.rs_code !== ''">({{resource.ed_alias || resource.rs_code}})</span></td>
                  <td>{{resource.resource_amount}}</td>
                  <td>{{resource.ru_name}}</td>
                  <td class="has-text-right">{{addCommas(resource.rs_price)}}</td>
                  <td class="has-text-right">{{addCommas(resource.resource_costs)}}</td>
                </tr>
                </tbody>
              </table>
            </div>
          </article>
        </div>

        <div class="tile is-parent is-6">
          <article class="tile is-child box">
            <h4 class="title">인건비</h4>
            <h4 class="title">금액: {{addCommas(viewerData.total.labor_costs)}}</h4>
            <div class="content">
              <table class="table" id="labor-table">
                <colgroup>
                  <col width="auto"/>
                </colgroup>
                <thead>
                <tr>
                  <th>공사</th>
                  <th>공정</th>
                  <th>상세공정</th>
                  <th>자재군</th>
                  <th class="has-text-right">인건비</th>
                </tr>
                </thead>
                <tbody>
                <tr :class="{'is-summary': labor.is_summary}" v-for="(labor) in viewerData.labor" v-if="labor.labor_costs !== 0">
                  <td v-if="labor.hasOwnProperty('construction_count')" :rowspan="labor.construction_count || 1">{{labor.ct_name}}</td>
                  <td v-if="labor.hasOwnProperty('construction_process_count')" :rowspan="labor.construction_process_count || 1">{{labor.cp_name}}</td>
                  <td v-if="labor.hasOwnProperty('construction_process_detail_count')" :rowspan="labor.construction_process_detail_count || 1">{{labor.cpd_name}}</td>
                  <td>{{labor.rt_name}}</td>
                  <td class="has-text-right">{{addCommas(labor.labor_costs)}}</td>
                </tr>
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </div>
      <div class="tile is-ancestor summary">
        <div class="tile is-parent">
          <article class="tile is-child box">
            <div class="is-clearfix">
              <div class="is-pulled-right">
                <p class="has-text-right">
                  <span>자재비: {{addCommas(viewerData.total.resource_costs)}}원</span>
                </p>
                <p class="has-text-right">
                  <span>인건비: {{addCommas(viewerData.total.labor_costs)}}원</span>
                </p>
                <p class="has-text-right">
                  <span>공과잡비: {{addCommas(viewerData.total.etc_costs)}}원</span>
                </p>
                <p class="has-text-right">
                  <span>설계비 및 감리비: {{addCommas(viewerData.total.design_costs + viewerData.total.supervision_costs)}}원</span>
                </p>
                <p class="has-text-right" v-if="viewerData.total.discount_amount">
                  <span>할인금액: </span><span class="discount-amount">-{{addCommas(viewerData.total.discount_amount)}}원</span>
                </p>
                <p class="has-text-right">
                  <span>합계(VAT 별도, 천단위 절삭): {{addCommas(viewerData.total.total_costs - (!viewerData.total.discount_amount ? 0 : viewerData.total.discount_amount))}}원</span>
                </p>
              </div>
            </div>
            <div class="signature">

            </div>
          </article>
        </div>
      </div>
    </div>
    <div v-else>
      <h3 class="has-text-centered">등록된 견적서가 없습니다. <br />등록 버튼을 선택하여 견적서를 등록 해 주세요.</h3>
    </div>
  </div>
</template>
<script>
  /* eslint-disable no-unused-vars */
  import router from '../../router'
  import mixin from '../../services/mixin'
  import EventBus from '../../services/eventBus'
  import deepClone from '../../services/deepClone'
  import _ from 'underscore'
  import XLSX from '../../thirdparty/js-xlsx/xlsx.full.min'
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

  const queryApi = '/api/contract'

  export default {
    name: 'estimate-sheet',
    mixins: [mixin],
    props: {
      estimateIsPre: {
        type: Boolean,
        default: false
      },
      deleteRegisterBtn: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        router,
        param: {},
        mergeRestTime: false,
        viewerData: {
          general: [],
          labor: [],
          resource: [],
          total: {}
        },
        isOpenSubResource: {

        },
        estimateData: {
          general: [],
          labor: [],
          resource: [],
          total: {}
        },
        estimateCurrentTabs: [],
        selectedTab: ''
      }
    },
    methods: {
      excelxport (type, fn) {
        const generalEl = document.getElementById('general-table')
        const resourceEl = document.getElementById('resource-table')
        const laborEl = document.getElementById('labor-table')
        const exportWb = XLSX.utils.book_new()
        const generalWs = XLSX.utils.table_to_sheet(generalEl)
        const resourceWs = XLSX.utils.table_to_sheet(resourceEl)
        const laborWs = XLSX.utils.table_to_sheet(laborEl)

        generalWs['!cols'] = [
          {wch: 10},
          {wch: 6},
          {wch: 14},
          {wch: 14},
          {wch: 16},
          {wch: 40},
          {wch: 10},
          {wch: 10}
        ]
        resourceWs['!cols'] = [
          {wch: 14},
          {wch: 40},
          {wch: 4},
          {wch: 20},
          {wch: 10},
          {wch: 10}
        ]
        laborWs['!cols'] = [
          {wch: 8},
          {wch: 14},
          {wch: 14},
          {wch: 14},
          {wch: 10}
        ]
        XLSX.utils.book_append_sheet(exportWb, generalWs, '공간별 견적')
        XLSX.utils.book_append_sheet(exportWb, resourceWs, '자재비')
        XLSX.utils.book_append_sheet(exportWb, laborWs, '인건비')
        return XLSX.writeFile(exportWb, fn || '상세견적서.xlsx')
      },
      createNewTab () {
        router.push({
          path: `/private/estimate/${this.param.id}/register/tabs`
        })
      },
      duplicateTab () {
        this.$http.post(`${queryApi}/${this.param.id}/estimate/tabs`, {
          es_is_pre: true,
          es_pk: this.selectedTab
        })
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            this.estimateCurrentTabs.push(response.data.data.tab)
          })
      },
      moveTab (tab = {}) {
        this.selectedTab = tab.es_pk || ''
        this.loadEstimateView()
      },
      selectionTab () {
        this.$http.post(`${queryApi}/${this.param.id}/estimate/tabs`, {
          es_is_pre: false,
          es_pk: this.selectedTab
        })
        .then((response) => {
          if (response.data.code !== 200) {
            return false
          }
        })
      },
      moveToRegister () {
        if (this.estimateCurrentTabs.length === 0) {
          this.$http.post(`${queryApi}/${this.param.id}/estimate/tabs`, {
            es_is_pre: true
          })
            .then((response) => {
              if (response.data.code !== 200) {
                return false
              }
              this.estimateCurrentTabs.push(response.data.data.tab)

              const tab = this.estimateCurrentTabs[this.estimateCurrentTabs.length - 1]
              router.push({
                path: `/private/estimate/${this.param.id}/register/${tab.es_pk}?es_is_pre=${this.estimateIsPre}`
              })
            })
        } else {
          const tab = this.estimateCurrentTabs[this.estimateCurrentTabs.length - 1]
          router.push({
            path: `/private/estimate/${this.param.id}/register/${tab.es_pk}?es_is_pre=${this.estimateIsPre}`
          })
        }
      },
      printPage () {
        EventBus.$emit('togglePrintMode')
        window.setTimeout(() => {
          window.print()
          EventBus.$emit('togglePrintMode')
        }, 300)
      },
      mergeSubResource (placeData) {
        const cloneData = deepClone(placeData)
        const constructionKeyData = _.uniq(_.pluck(cloneData, 'ct_pk'))
        const generalData = {}
        let subResourceData = []
        for (let i = 0; i < constructionKeyData.length; i++) {
          generalData[constructionKeyData[i]] = _.filter(cloneData, (item) => {
            return item.ct_pk === constructionKeyData[i]
          })
          // 공사에 해당하는 자재 중 부자재만 추출함
          const subResource = _.filter(generalData[constructionKeyData[i]], (item) => {
            return item.rt_sub === 1
          })
          // 부자재들을 묶기위해 특정 key를 임의의 key로 변경
          _.map(subResource, (item) => {
            item.place_pk = `sub_${generalData[constructionKeyData[i]][0].ct_pk}`
            item.sub_key = `sub_${generalData[constructionKeyData[i]][0].ct_pk}`
          })
          if (subResource.length !== 0) {
            // 부자재를 묶어주는 row 한줄을 추가한다
            subResourceData.push({
              cp_name: '부자재',
              cpd_min_amount: '',
              cpd_name: '',
              ct_name: generalData[constructionKeyData[i]][0].ct_name,
              ed_alias: '',
              ed_input_value: '',
              labor_costs: '',
              place_name: '-',
              place_pk: `sub_${generalData[constructionKeyData[i]][0].ct_pk}`,
              ct_pk: subResource[0].ct_pk,
              cp_pk: subResource[0].cp_pk,
              resource_amount: '-',
              resource_costs: _.reduce(subResource, (memo, obj) => {
                return memo + obj.resource_costs
              }, 0),
              rs_code: '',
              rs_name: `${generalData[constructionKeyData[i]][0].ct_name} 부자재`,
              rs_price: '',
              rt_name: '',
              rt_sub: 0,
              ru_name: '-',
              is_expand_row: true,
              sub_key: `sub_${generalData[constructionKeyData[i]][0].ct_pk}`
            })
            this.isOpenSubResource[`sub_${generalData[constructionKeyData[i]][0].ct_pk}`] = false
            // 부자재를 따로 저장하고 전체데이터에서 부자재를 지워 위치를 변경한다.
            subResourceData = subResourceData.concat(subResource)
            subResource.forEach((item) => {
              generalData[constructionKeyData[i]] = _.without(generalData[constructionKeyData[i]], item)
            })
          }
        }

        let resultData = [].concat.apply([], Object.values(generalData))
        // Categorize & Rowspan
        // place_pk, ct_pk, cp_pk 순 정렬
        const placeBySumData = _.groupBy(resultData, 'place_pk')
        for (let i in placeBySumData) {
          const placeItem = placeBySumData[i]
          const placePk = placeItem[0].place_pk
          placeBySumData[i].push({
            cp_name: '',
            cp_pk: '999',
            cpd_min_amount: '',
            cpd_name: '',
            ct_name: '소계',
            ct_pk: '999',
            ed_alias: '',
            ed_input_value: '',
            labor_costs: _.reduce(placeItem, (memo, obj) => {
              return memo + obj.labor_costs
            }, 0),
            place_name: '',
            place_pk: placePk,
            resource_amount: '',
            resource_costs: _.reduce(placeItem, (memo, obj) => {
              return memo + obj.resource_costs
            }, 0),
            rs_code: '',
            rs_name: '',
            rs_pk: '',
            rs_price: '',
            rt_name: '',
            rt_sub: 0,
            ru_name: '',
            is_summary: true
          })
        }
        resultData = [].concat.apply([], Object.values(placeBySumData))

        // Categorize & Rowspan
        // place_pk, ct_pk, cp_pk 순 정렬
        resultData = _(resultData).chain()
          .sortBy((data) => {
            return data.cp_pk
          })
          .sortBy((data) => {
            return data.ct_pk
          })
          .sortBy((data) => {
            return data.place_pk
          })
          .value()
          .concat(subResourceData)
        const placeByData = _.groupBy(resultData, 'place_pk')
        const mergeCount = {}
        // 위치순으로 동일한 위치의 데이터가 몇건인지 확인한다.
        for (let i in placeByData) {
          const placeItem = placeByData[i]
          const placePk = placeItem[0].place_pk
          mergeCount[placePk] = {
            count: placeItem.length,
            construction: {
            }
          }
          // 위의 위치의 해당하는 데이터 중 동일한 공사의 데이터가 몇건인지 확인한다.
          const constructionByData = _.groupBy(placeByData[i], 'ct_pk')
          for (let j in constructionByData) {
            const constructionItem = constructionByData[j]
            const constructionPk = constructionItem[0].ct_pk
            mergeCount[placePk].construction[constructionPk] = {
              count: constructionItem.length,
              constructionProcess: {
              }
            }
            // 위의 공사에 해당하는 데이터 중 동일한 공정의 데이터가 몇건인지 확인한다.
            const constructionProcessByData = _.groupBy(constructionItem, 'cp_pk')
            for (let k in constructionProcessByData) {
              const constructionProcessItem = constructionProcessByData[k]
              const constructionProcessPk = constructionProcessItem[0].cp_pk
              mergeCount[placePk].construction[constructionPk].constructionProcess[constructionProcessPk] = {
                count: constructionProcessItem.length
              }
            }
          }
        }

        const firstMeetPk = {
          place: {

          }
        }

        let item
        const resultCount = resultData.length
        for (let i = 0; i < resultCount; i++) {
          item = resultData[i]
          // 이미 위에서 place_pk, ct_pk, cp_pk 로 정렬해놓은 데이터이기 떄문에 해당 코드가 성립할 수 있음
          if (!firstMeetPk.place.hasOwnProperty(item.place_pk)) {
            item.place_count = mergeCount[item.place_pk].count
            firstMeetPk.place[item.place_pk] = {
              construction: {}
            }
          }
          if (!firstMeetPk.place[item.place_pk].construction.hasOwnProperty(item.ct_pk)) {
            item.construction_count = mergeCount[item.place_pk].construction[item.ct_pk].count
            firstMeetPk.place[item.place_pk].construction[item.ct_pk] = {
              constructionProcess: {}
            }
          }
          if (!firstMeetPk.place[item.place_pk].construction[item.ct_pk].constructionProcess.hasOwnProperty(item.cp_pk)) {
            item.construction_process_count = mergeCount[item.place_pk].construction[item.ct_pk].constructionProcess[item.cp_pk].count
            firstMeetPk.place[item.place_pk].construction[item.ct_pk].constructionProcess[item.cp_pk] = true
          }
        }
        this.viewerData.general = resultData
      },
      mergeResourceTable (resource) {
        let resultData = deepClone(resource)
        // Categorize & Rowspan
        // place_pk, ct_pk, cp_pk 순 정렬
        const resourceCategoryByData = _.groupBy(resultData, 'rc_pk')
        for (let i in resourceCategoryByData) {
          const resourceCategoryItem = resourceCategoryByData[i]
          resourceCategoryByData[i].push({
            ed_alias: '',
            rc_name: '소계',
            resource_amount: '',
            rc_pk: resourceCategoryItem[0].rc_pk,
            resource_costs: _.reduce(resourceCategoryItem, (memo, obj) => {
              return memo + obj.resource_costs
            }, 0),
            rs_code: '',
            rs_name: '소계',
            rs_price: '',
            ru_name: '',
            is_summary: true
          })
        }
        resultData = [].concat.apply([], Object.values(resourceCategoryByData))
        resultData = _(resultData).chain()
          .sortBy((data) => {
            return data.rc_pk
          })
          .value()

        const mergeCount = {}
        // 위치순으로 동일한 위치의 데이터가 몇건인지 확인한다.
        for (let i in resourceCategoryByData) {
          const resourceCategoryItem = _.filter(resourceCategoryByData[i], (item) => {
            return item.rs_price.toString() !== '0'
          })
          if (resourceCategoryItem.length === 0) {
            continue
          }
          const resourceCategoryPk = resourceCategoryItem[0].rc_pk
          mergeCount[resourceCategoryPk] = {
            count: resourceCategoryItem.length
          }
        }
        const firstMeetPk = {
          resourceCategory: {

          }
        }
        let item
        const resultCount = resultData.length
        for (let i = 0; i < resultCount; i++) {
          item = resultData[i]
          // 이미 위에서 place_pk, ct_pk, cp_pk 로 정렬해놓은 데이터이기 떄문에 해당 코드가 성립할 수 있음
          if (item.rs_price.toString() === '0') {
            continue
          }
          if (!firstMeetPk.resourceCategory.hasOwnProperty(item.rc_pk)) {
            item.resource_category_count = mergeCount[item.rc_pk].count
            firstMeetPk.resourceCategory[item.rc_pk] = {}
          }
        }

        this.viewerData.resource = resultData
      },
      mergeLaborTable (labor) {
        let resultData = [].concat.apply([], Object.values(labor))
        // Categorize & Rowspan
        // place_pk, ct_pk, cp_pk 순 정렬
        const constructionByData = _.groupBy(resultData, 'ct_pk')
        for (let i in constructionByData) {
          const constructionItem = constructionByData[i]
          const constructionPk = constructionItem[0].ct_pk
          constructionByData[i].push({
            ct_pk: constructionByData[i][0].ct_pk,
            cp_pk: '999',
            cpd_pk: '999',
            cp_name: '소계',
            cpd_min_amount: '',
            cpd_name: '',
            ct_name: '',
            input_value: 0,
            labor_costs: _.reduce(constructionItem, (memo, obj) => {
              return memo + obj.labor_costs
            }, 0),
            labor_price: 0,
            rt_name: '',
            rt_sub: 0,
            is_summary: true
          })
        }
        resultData = [].concat.apply([], Object.values(constructionByData))
        resultData = _(resultData).chain()
          .sortBy((data) => {
            return data.cpd_pk
          })
          .sortBy((data) => {
            return data.cp_pk
          })
          .sortBy((data) => {
            return data.ct_pk
          })
          .value()

        const mergeCount = {}
        // 위치순으로 동일한 위치의 데이터가 몇건인지 확인한다.
        for (let i in constructionByData) {
          const constructionItem = _.filter(constructionByData[i], (item) => {
            return item.labor_costs.toString() !== '0'
          })
          if (constructionItem.length === 0) {
            continue
          }
          const constructionPk = constructionItem[0].ct_pk
          mergeCount[constructionPk] = {
            count: constructionItem.length,
            constructionProcess: {
            }
          }
          // 위의 위치의 해당하는 데이터 중 동일한 공사의 데이터가 몇건인지 확인한다.
          const constructionProcessByData = _.groupBy(constructionItem, 'cp_pk')
          for (let j in constructionProcessByData) {
            const constructionProcessItem = constructionProcessByData[j]
            const constructionProcessPk = constructionProcessItem[0].cp_pk
            mergeCount[constructionPk].constructionProcess[constructionProcessPk] = {
              count: constructionProcessItem.length,
              constructionProcessDetail: {
              }
            }
            // 위의 공사에 해당하는 데이터 중 동일한 공정의 데이터가 몇건인지 확인한다.
            const constructionProcessDetailByData = _.groupBy(constructionProcessItem, 'cpd_pk')
            for (let k in constructionProcessDetailByData) {
              const constructionProcessDetailItem = constructionProcessDetailByData[k]
              const constructionProcessDetailPk = constructionProcessDetailItem[0].cpd_pk
              mergeCount[constructionPk].constructionProcess[constructionProcessPk].constructionProcessDetail[constructionProcessDetailPk] = {
                count: constructionProcessDetailItem.length
              }
            }
          }
        }

        const firstMeetPk = {
          construction: {

          }
        }
        console.log(mergeCount)
        let item
        const resultCount = resultData.length
        for (let i = 0; i < resultCount; i++) {
          item = resultData[i]
          // 이미 위에서 labor_pk, ct_pk, cp_pk 로 정렬해놓은 데이터이기 떄문에 해당 코드가 성립할 수 있음
          if (item.labor_costs.toString() === '0') {
            continue
          }
          if (!firstMeetPk.construction.hasOwnProperty(item.ct_pk)) {
            item.construction_count = mergeCount[item.ct_pk].count
            firstMeetPk.construction[item.ct_pk] = {
              constructionProcess: {}
            }
          }
          if (!firstMeetPk.construction[item.ct_pk].constructionProcess.hasOwnProperty(item.cp_pk)) {
            item.construction_process_count = mergeCount[item.ct_pk].constructionProcess[item.cp_pk].count
            firstMeetPk.construction[item.ct_pk].constructionProcess[item.cp_pk] = {
              constructionProcessDetail: {}
            }
          }
          if (!firstMeetPk.construction[item.ct_pk].constructionProcess[item.cp_pk].constructionProcessDetail.hasOwnProperty(item.cpd_pk)) {
            item.construction_process_detail_count = mergeCount[item.ct_pk].constructionProcess[item.cp_pk].constructionProcessDetail[item.cpd_pk].count
            firstMeetPk.construction[item.ct_pk].constructionProcess[item.cp_pk].constructionProcessDetail[item.cpd_pk] = true
          }
        }
        console.log(resultData)
        this.viewerData.labor = resultData
      },
      openSubResource (item) {
        if (!item.hasOwnProperty('sub_key')) {
          return false
        }
        this.isOpenSubResource[item.sub_key] = !this.isOpenSubResource[item.sub_key]
        this.$forceUpdate()
      },
      sendToSmS () {
        if (window.confirm('고객에게 상세견적서 안내 문자를 발송하시겠습니까?\n(실제 휴대폰 번호로 전송되므로 유의해 주십시오.)')) {
          this.$http.post(`${queryApi}/${this.param.id}/sms`)
            .then((response) => {
              if (response.data.code !== 200) {
                return false
              }
              openNotification({
                message: '고객님 휴대폰으로 메세지가 발송 되었습니다.',
                type: 'success',
                duration: 1500
              })
            })
        }
      },
      loadEstimateView () {
        const id = this.$route.params.id
        const isPre = this.estimateIsPre
        const esPk = this.selectedTab
        let general
        let labor
        let resource
        let total
        if (!id) {
          return false
        }

        this.$http.get(`${queryApi}/${id}/estimate/${esPk}/general?es_is_pre=${isPre}`)
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            general = response.data.data.estimateList
            return this.$http.get(`${queryApi}/${id}/estimate/${esPk}/labor?es_is_pre=${isPre}`)
          })
          .then((response) => {
            if (response.data.code !== 200) {
              return
            }
            labor = response.data.data.estimateList
            return this.$http.get(`${queryApi}/${id}/estimate/${esPk}/resource?es_is_pre=${isPre}`)
          })
          .then((response) => {
            if (response.data.code !== 200) {
              return
            }
            resource = response.data.data.estimateList
            return this.$http.get(`${queryApi}/${id}/estimate/${esPk}/total?es_is_pre=${isPre}`)
          })
          .then((response) => {
            if (response.data.code !== 200) {
              return
            }
            total = response.data.data.totalCosts

            this.estimateData = {
              general,
              labor,
              resource,
              total
            }
          })
          .catch((error) => {
            this.estimateData = {
              general: [],
              labor: [],
              resource: [],
              total: {}
            }
            console.log(error)
          })
      },
      getTabList () {
        const id = this.$route.params.id
        return this.$http.get(`${queryApi}/${id}/estimate/tabs?es_is_pre=${this.estimateIsPre}`)
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            this.estimateCurrentTabs = response.data.data.tabs
            if (this.estimateCurrentTabs.length > 0) {
              if (this.estimateIsPre) {
                this.selectedTab = this.estimateCurrentTabs[0].es_pk
              } else {
                this.selectedTab = ''
              }
            }
          })
      }
    },
    mounted () {
      this.param = this.$route.params
      EventBus.$on('loadEstimateView', () => {
        if (!this.estimateIsPre) {
          this.getTabList()
            .then(() => {
              this.loadEstimateView()
            })
        }
      })

      EventBus.$on('loadPreEstimateView', () => {
        if (this.estimateIsPre) {
          this.getTabList()
            .then(() => {
              this.loadEstimateView()
            })
        }
      })
    },
    created () {
    },
    watch: {
      estimateData: {
        handler (newValue, oldValue) {
          this.viewerData.general = newValue.general
          this.viewerData.labor = newValue.labor
          this.viewerData.resource = newValue.resource
          this.viewerData.total = newValue.total
          this.mergeSubResource(this.viewerData.general)
          this.mergeResourceTable(this.viewerData.resource)
          this.mergeLaborTable(this.viewerData.labor)
        },
        deep: true
      },
      estimateCurrentTabs: {
        handler (newValue, oldValue) {
          console.log(newValue)
        },
        deep: true
      }
    }
  }
</script>
<style scoped lang="scss">
  .discount-amount {
    color: red;
  }
  .title-wrapper {
    padding: 1rem;
    margin: 1rem 0 0.5rem 0;
  }
  .position-base-table {
    margin: 1rem 0 3rem 0
  }

  .print-btn {
    margin-right: 1rem
  }
  .is-summary {
    td {
      font-weight: bold;
    }
  }
  .summary {
    p:last-child {
      span {
        font-size: 1.3rem;
        font-weight: bold;
      }
    }
  }
  .table th {
    &.has-text-right {
      text-align: right;
    }
  }
</style>
