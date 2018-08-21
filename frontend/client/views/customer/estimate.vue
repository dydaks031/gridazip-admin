<template>
  <div class="wrapper">
    <div class="container outer">
      <div class="container inner">
        <div class="title-container is-hidden-mobile is-clearfix">
          <h1 class="title is-hidden-mobile is-pulled-left">
            실시간 <br> <b>인테리어 상세 견적서</b>
          </h1>
          <div class="is-pulled-right user-info-contents">
            <h3 class="user-name"><b>그리다</b> 님</h3>
            <div class="user-info is-clearfix">
              <div class="contents is-pulled-left has-text-right">
                <p>010-0000-0000</p>
                <p>2018-09-01</p>
                <p>32평</p>
                <p>안양시 동안구 부림로</p>
              </div>
              <div class="label-view is-pulled-right has-text-right">
                <p>연락처</p>
                <p>이사일</p>
                <p>평수</p>
                <p>주소</p>
              </div>
            </div>
          </div>
        </div>
        <div class="tabs is-hidden-desktop">
          <ul>
            <li class="is-active">상세견적서</li>
            <li>시공현황</li>
            <li>고객정보</li>
          </ul>
        </div>
        <div class="btn-select-view">
          <div class="select-view">
            <label for="versionSelect">견적서 선택</label>
            <div class="select">
              <select id="versionSelect">
                <option>2018-08-01 (v1.0)</option>
                <option>2018-08-02 (v1.0)</option>
                <option>2018-08-03 (v1.0)</option>
              </select>
            </div>
          </div>
          <div class="btn-view">
            <button class="button white">시공현황보기</button>
            <button class="button">인쇄하기</button>
          </div>
        </div>
        <div class="estimate-contents">
          <div class="content">
            <div class="title-container is-clearfix">
              <h3 class="subtitle is-pulled-left">공간별 견적</h3>
              <i class="fa fa-angle-up is-pulled-right"></i>
            </div>
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
                <td>{{generalData.rs_name}}<span v-if="generalData.rs_code !== '' || generalData.ed_alias !== ''">({{generalData.ed_alias || generalData.rs_code}})</span></td>
                <td class="has-text-right">{{addCommas(generalData.labor_costs)}}</td>
                <td class="has-text-right">{{addCommas(generalData.resource_costs)}}</td>
              </tr>
              </tbody>
            </table>
          </div>
          <div class="content fold">
            <div class="title-container is-clearfix">
              <h3 class="subtitle is-pulled-left">자재비</h3>
              <i class="fa fa-angle-down is-pulled-right"></i>
              <span class="is-pulled-right money-summary"><b>9,944,000</b> 원</span>
            </div>
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
          <div class="content fold">
            <div class="title-container is-clearfix">
              <h3 class="subtitle is-pulled-left">인건비</h3>
              <i class="fa fa-angle-down is-pulled-right"></i>
              <span class="is-pulled-right money-summary"><b>12,905,320</b> 원</span>
            </div>
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
          <div class="content not-opened">
            <div class="title-container is-clearfix">
              <h3 class="subtitle is-pulled-left">설계비 및 감리비</h3>
              <span class="is-pulled-right money-summary"><b>3,427,398</b> 원</span>
            </div>
          </div>
          <div class="content not-opened">
            <div class="title-container is-clearfix">
              <h3 class="subtitle is-pulled-left">공과잡비</h3>
              <span class="is-pulled-right money-summary"><b>1,142,466</b> 원</span>
            </div>
          </div>
          <div class="content not-opened">
            <div class="title-container is-clearfix">
              <h3 class="subtitle is-pulled-left discount">할인 금액</h3>
              <span class="is-pulled-right money-summary discount"><b>- 0</b> 원</span>
            </div>
          </div>
          <div class="content result">
            <div class="title-container is-clearfix">
              <h3 class="subtitle is-pulled-left">총 견적 금액</h3>
              <span class="is-pulled-right money-summary"><b>27,419,000</b> 원</span>
            </div>
          </div>
        </div>
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
<style scoped lang="scss">
  .content {
    &.fold {
      table {
        display: none;
      }
    }
  }
</style>
