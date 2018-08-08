<template>
  <div>
    <div class="wrapper" :class="{'modal-closed': !isCloseModal}">
      <div class="title-wrapper is-clearfix">
        <h1 class="title">인테리어 <span class="is-bold">상세견적서</span></h1>
        <a class="button is-rounded is-pulled-right is-medium print-btn" id="printBtn" @click="printPage()">인쇄하기</a>
      </div>
      <!-- Main container -->
      <nav class="level user-info">
        <!-- Left side -->
        <div class="level-left">
          <div class="level-item user-name">
            <p class="subtitle is-5">
              <strong>{{userInfo.pc_name}}</strong> 고객
            </p>
            <hr />
          </div>
          <div class="level-item">
            <p>
              <strong>연락처</strong>
              <span class="is-block">{{userInfo.pc_phone}}</span>
            </p>
          </div>
          <div class="level-item">
            <p>
              <strong>이사일</strong>
              <span class="is-block">{{getComputedDate(userInfo.pc_move_date)}}</span>
            </p>
          </div>
          <div class="level-item">
            <p>
              <strong>평수</strong>
              <span class="is-block">{{userInfo.pc_size}}</span>
            </p>
          </div>
          <div class="level-item">
            <p>
              <strong>주소</strong>
              <span class="is-block">{{getFullAddress(userInfo.pc_address_brief, userInfo.pc_address_detail)}}</span>
            </p>
          </div>
        </div>
      </nav>

      <div class="contents">
        <section class="space-base-info">
          <h2 class="title has-text-centered">공간별 견적</h2>
          <table class="table position-base-table">
            <colgroup>
              <col width="8%" />
              <col class="is-hidden-mobile" width="5%" />
              <col class="is-hidden-mobile" width="10%" />
              <col width="10%" />
              <col width="10%" />
              <col class="is-hidden-mobile" width="auto" />
              <col class="is-hidden-mobile" width="10%" />
              <col width="10%" />
              <col width="10%" />
            </colgroup>
            <thead>
            <tr>
              <th>위치</th>
              <th class="is-hidden-mobile">공사</th>
              <th class="is-hidden-mobile">공정</th>
              <th>상세공정</th>
              <th class="is-hidden-mobile">상세위치</th>
              <th class="is-hidden-mobile">자재</th>
              <th class="has-text-right">인건비</th>
              <th class="has-text-right">자재비</th>
            </tr>
            </thead>
            <tbody>
              <tr :class="{'is-summary': generalData.is_summary}" v-for="(generalData, index) in viewerData.general" v-if="rowHideCondition(generalData, index)" @click="openSubResource(generalData)">
                <td v-if="generalData.hasOwnProperty('place_count')" :rowspan="generalData.hasOwnProperty('sub_key') ?  isOpenSubResource[generalData.sub_key] === true ? generalData.place_count : 1 : generalData.place_count">{{generalData.place_name}}</td>
                <td class="is-hidden-mobile"v-if="generalData.hasOwnProperty('construction_count')" :rowspan="generalData.hasOwnProperty('sub_key') ?  isOpenSubResource[generalData.sub_key] === true ? generalData.construction_count : 1 : generalData.construction_count">{{generalData.ct_name}}</td>
                <td class="is-hidden-mobile" v-if="generalData.hasOwnProperty('construction_process_count')" :rowspan="generalData.hasOwnProperty('sub_key') ?  isOpenSubResource[generalData.sub_key] === true ? generalData.construction_process_count : 1 : generalData.construction_process_count">{{generalData.cp_name}}</td>
                <td>{{generalData.cpd_name}}</td>
                <td class="is-hidden-mobile">{{generalData.detail_place}}</td>
                <td class="is-hidden-mobile">{{generalData.rs_name}}<span v-if="generalData.rs_code !== ''">({{generalData.ed_alias || generalData.rs_code}})</span></td>
                <td class="has-text-right">{{addCommas(generalData.labor_costs)}}</td>
                <td class="has-text-right">{{addCommas(generalData.resource_costs)}}</td>
              </tr>
            </tbody>
          </table>
          <div class="more-data" @click="toggleMoreData('general')">
            <i class="fa" :class="{'fa-angle-down': !isMoreBtnStatus['general'], 'fa-angle-up': isMoreBtnStatus['general']}"></i><span>더보기</span>
          </div>
        </section>
        <section  class="detail-info columns is-desktop">
          <div class="column is-6">
            <article>
              <h2 class="title has-text-centered">자재비</h2>
              <div class="content">
                <table class="table">
                  <colgroup>
                    <col class="is-hidden-mobile" width="15%"/>
                    <col class="is-hidden-desktop" width="30%"/>
                    <col width="auto"/>
                    <col class="is-hidden-mobile" width="auto"/>
                    <col class="is-hidden-mobile" width="auto"/>
                    <col width="auto"/>
                  </colgroup>
                  <thead>
                  <tr>
                    <th>자재분류</th>
                    <th>자재</th>
                    <th class="is-hidden-mobile">물량</th>
                    <th class="is-hidden-mobile has-text-right">단가</th>
                    <th class="has-text-right">금액</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr :class="{'is-summary': resource.is_summary}" v-for="(resource, index) in viewerData.resource" v-if="resource.resource_costs !== 0 && (index <= 5 || isMoreBtnStatus.resource)">
                    <td v-if="resource.hasOwnProperty('resource_category_count')" :rowspan="resource.resource_category_count || 1">{{resource.rc_name}}</td>
                    <td>{{resource.rs_name}}<span class="resource-code" v-if="resource.rs_code !== ''">({{resource.ed_alias || resource.rs_code}})</span></td>
                    <td class="is-hidden-mobile">{{resource.resource_amount}} {{resource.ru_name}}</td>
                    <td class="is-hidden-mobile has-text-right">{{resource.is_summary ? '' : addCommas(resource.rs_price)}}</td>
                    <td class="has-text-right">{{addCommas(resource.resource_costs)}}</td>
                  </tr>
                  </tbody>
                </table>
                <div class="more-data" @click="toggleMoreData('resource')">
                  <i class="fa" :class="{'fa-angle-down': !isMoreBtnStatus['resource'], 'fa-angle-up': isMoreBtnStatus['resource']}"></i><span>더보기</span>
                </div>
              </div>
            </article>
          </div>
          <div class="column is-6">
            <article>
              <h2 class="title has-text-centered">인건비</h2>
              <div class="content">
                <table class="table">
                  <colgroup>
                    <col width="auto"/>
                  </colgroup>
                  <thead>
                  <tr>
                    <th>공사</th>
                    <th class="is-hidden-mobile">공정</th>
                    <th>상세공정</th>
                    <th>자재군</th>
                    <th class="has-text-right">인건비</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr :class="{'is-summary': labor.is_summary}" v-for="(labor, index) in viewerData.labor" v-if="labor.labor_costs !== 0 && (index <= 5 || isMoreBtnStatus.labor)">
                    <td v-if="labor.hasOwnProperty('construction_count')" :rowspan="labor.construction_count || 1">{{labor.ct_name}}</td>
                    <td class="is-hidden-mobile" v-if="labor.hasOwnProperty('construction_process_count')" :rowspan="labor.construction_process_count || 1">{{labor.cp_name}}</td>
                    <td v-if="labor.hasOwnProperty('construction_process_detail_count')" :rowspan="labor.construction_process_detail_count || 1">{{labor.cpd_name}}</td>
                    <td>{{labor.rt_name}}</td>
                    <td class="has-text-right">{{addCommas(labor.labor_costs)}}</td>
                  </tr>
                  </tbody>
                </table>
                <div class="more-data" @click="toggleMoreData('labor')">
                  <i class="fa" :class="{'fa-angle-down': !isMoreBtnStatus['labor'], 'fa-angle-up': isMoreBtnStatus['labor']}"></i><span>더보기</span>
                </div>
              </div>
            </article>
          </div>
        </section>
        <section class="summary-info">
          <nav class="level">
            <!-- Left side -->
            <div class="level-left">
              <h3 class="subtitle">총 견적금액</h3>
            </div>
            <div class="level-right">
              <div class="level-item mr-15">
                <p>자재비</p>
                <p>인건비</p>
                <p>설계비 및 감리비</p>
                <p>공과잡비</p>
                <p v-if="viewerData.total.discount_amount">할인금액</p>
              </div>
              <div class="level-item flex-item-right">
                <p>{{addCommas(viewerData.total.resource_costs)}}원</p>
                <p>{{addCommas(viewerData.total.labor_costs)}}원</p>
                <p>{{addCommas(viewerData.total.design_costs + viewerData.total.supervision_costs)}}원</p>
                <p>{{addCommas(viewerData.total.etc_costs)}}원</p>
                <p class="discount-amount" v-if="viewerData.total.discount_amount">-{{addCommas(viewerData.total.discount_amount)}}원</p>
              </div>
            </div>
          </nav>
          <nav class="level">
            <!-- Left side -->
            <div class="level-left flex-center-text">
              <h3 class="subtitle">합계(VAT 별도)</h3>
            </div>
            <div class="level-right flex-center-text">
              <div class="level-item summary">
                <p>{{addCommas(viewerData.total.total_costs - viewerData.total.discount_amount)}}원</p>
              </div>
            </div>
          </nav>
        </section>
      </div>
      <div class="footer">

      </div>
    </div>
    <estimate-auth-view
      :beforeClose="loadEstimateView"
      :isCloseModal.sync="isCloseModal"
      v-on:changeCloseModalStatus="changeCloseModalStatus"/>
  </div>
</template>

<script>
  /* eslint-disable no-unused-vars */
  import router from '../../router'
  import mixin from '../../services/mixin'
  import EventBus from '../../services/eventBus'
  import deepClone from '../../services/deepClone'
  import EstimateAuthView from './EstimateAuthView'
  import _ from 'underscore'

  const queryApi = '/api/contract'

  export default {
    components: {EstimateAuthView},
    name: 'estimate-sheet',
    mixins: [mixin],
    data () {
      return {
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
        userInfo: {},
        estimateData: {
          general: [],
          labor: [],
          resource: [],
          total: {}
        },
        isMoreBtnStatus: {
          general: false,
          labor: false,
          resource: false
        },
        isCloseModal: false
      }
    },
    methods: {
      moveToRegister () {
        router.push({
          path: `/private/estimate/${this.param.id}/register`
        })
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
            rs_name: '',
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
        this.viewerData.labor = resultData
      },
      openSubResource (item) {
        if (!item.hasOwnProperty('sub_key')) {
          return false
        }
        this.isOpenSubResource[item.sub_key] = !this.isOpenSubResource[item.sub_key]
        this.$forceUpdate()
      },
      loadEstimateView () {
        const id = this.pc_pk
        let userInfo
        let general
        let labor
        let resource
        let total
        if (!id) {
          return false
        }
        this.$http.get(`${queryApi}/${id}`)
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            userInfo = response.data.data.contract
            return this.$http.get(`${queryApi}/${id}/estimate/general?es_is_pre=false`)
          })

          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            general = response.data.data.estimateList
            return this.$http.get(`${queryApi}/${id}/estimate/labor?es_is_pre=false`)
          })
          .then((response) => {
            if (response.data.code !== 200) {
              return
            }
            labor = response.data.data.estimateList
            return this.$http.get(`${queryApi}/${id}/estimate/resource?es_is_pre=false`)
          })
          .then((response) => {
            if (response.data.code !== 200) {
              return
            }
            resource = response.data.data.estimateList
            return this.$http.get(`${queryApi}/${id}/estimate/total?es_is_pre=false`)
          })
          .then((response) => {
            if (response.data.code !== 200) {
              return
            }
            total = response.data.data.totalCosts
            this.userInfo = userInfo
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
      changeCloseModalStatus (result) {
        if (window.hasOwnProperty('sessionStorage')) {
          window.sessionStorage.setItem('pc_pk', result.pc_pk)
        }
        this.isCloseModal = result.closeStatus
        this.pc_pk = result.pc_pk
        if (this.isCloseModal) {
          this.loadEstimateView()
        }
      },
      rowHideCondition (item, index) {
        return (item.rt_sub === 0 || (item.hasOwnProperty('sub_key') && this.isOpenSubResource[item.sub_key] === true)) && (index <= 5 || this.isMoreBtnStatus.general)
      },
      toggleMoreData (type) {
        this.isMoreBtnStatus[type] = !this.isMoreBtnStatus[type]
      },
      getFullAddress (brief, detail) {
        if (!(brief || detail)) {
          return '-'
        } else {
          return `${brief} ${detail}`
        }
      }
    },
    mounted () {
      if (window.hasOwnProperty('sessionStorage')) {
        const pcPk = window.sessionStorage.getItem('pc_pk')
        if (pcPk) {
          this.changeCloseModalStatus({
            closeStatus: true,
            pc_pk: pcPk
          })
        } else {
          this.$modal.show('estimateAuthView')
        }
      }
    },
    created () {
    },
    watch: {
      estimateData: {
        handler (newValue, oldValue) {
          if (!newValue) {
            return false
          }
          this.viewerData.general = newValue.general || []
          this.viewerData.labor = newValue.labor || []
          this.viewerData.resource = newValue.resource || []
          this.viewerData.total = newValue.total || {}
          this.mergeSubResource(this.viewerData.general)
          this.mergeResourceTable(this.viewerData.resource)
          this.mergeLaborTable(this.viewerData.labor)
        },
        deep: true
      }
    }
  }
</script>

<style scoped lang="scss" src="./estimate.scss"></style>
<style scoped lang="scss" src="./estimate-mediaquery.scss"></style>
