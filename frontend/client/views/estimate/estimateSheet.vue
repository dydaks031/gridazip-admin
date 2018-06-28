<template>
  <div>
    <div class="title-wrapper">
      <span class="title">공간별 견적</span>
      <a class="button is-primary is-pulled-right is-medium" id="addBtn" @click="moveToRegister" v-if="deleteRegisterBtn !== true">등록/수정</a>
      <a class="button is-info is-pulled-right is-medium print-btn" id="printBtn" @click="printPage()">인쇄</a>
    </div>
    <table class="table position-base-table">
      <colgroup>
      </colgroup>
      <thead>
        <tr>
          <th>위치</th>
          <th>공사</th>
          <th>공정</th>
          <th>자재</th>
          <th>물량</th>
          <th>자재단위</th>
          <th>금액</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="generalData in viewerData.general" v-if="generalData.rt_sub === 0 || (generalData.hasOwnProperty('sub_key') && isOpenSubResource[generalData.sub_key] === true)" @click="openSubResource(generalData)">
          <td v-if="generalData.hasOwnProperty('place_count')" :rowspan="generalData.hasOwnProperty('sub_key') ?  isOpenSubResource[generalData.sub_key] === true ? generalData.place_count : 1 : generalData.place_count">{{generalData.place_name}}</td>
          <td v-if="generalData.hasOwnProperty('construction_count')" :rowspan="generalData.hasOwnProperty('sub_key') ?  isOpenSubResource[generalData.sub_key] === true ? generalData.construction_count : 1 : generalData.construction_count">{{generalData.ct_name}}</td>
          <td v-if="generalData.hasOwnProperty('construction_process_count')" :rowspan="generalData.hasOwnProperty('sub_key') ?  isOpenSubResource[generalData.sub_key] === true ? generalData.construction_process_count : 1 : generalData.construction_process_count">{{generalData.cp_name}}</td>
          <td>{{generalData.rs_name}}<span v-if="generalData.rs_code !== ''">({{generalData.ed_alias || generalData.rs_code}})</span></td>
          <td>{{generalData.resource_amount}}</td>
          <td>{{generalData.ru_name}}</td>
          <td>{{addCommas(generalData.resource_costs)}}</td>
        </tr>
      </tbody>
    </table>
    <div class="tile is-ancestor">
      <div class="tile is-parent is-6">
        <article class="tile is-child box">
          <h4 class="title">자재비</h4>
          <h4 class="title">금액: {{addCommas(viewerData.total.resource_costs)}}</h4>
          <div class="content">
            <table class="table">
              <colgroup>
                <col width="auto"/>
              </colgroup>
              <thead>
              <tr>
                <th>자재분류</th>
                <th>자재</th>
                <th>물량</th>
                <th>자재단위</th>
                <th>단가</th>
                <th>금액</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="resource in viewerData.resource" v-show="resource.rs_price !== 0">

                <td>{{resource.rc_name}}</td>
                <td>{{resource.rs_name}}<span v-if="resource.rs_code !== ''">({{resource.ed_alias || resource.rs_code}})</span></td>
                <td>{{resource.resource_amount}}</td>
                <td>{{resource.ru_name}}</td>
                <td>{{addCommas(resource.rs_price)}}</td>
                <td>{{addCommas(resource.resource_costs)}}</td>
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
            <table class="table">
              <colgroup>
                <col width="auto"/>
              </colgroup>
              <thead>
              <tr>
                <th>공사</th>
                <th>공정</th>
                <th>상세공정</th>
                <th>자재군</th>
                <th>인건비</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="labor in viewerData.labor" v-show="labor.labor_costs !== 0">
                <td>{{labor.ct_name}}</td>
                <td>{{labor.cp_name}}</td>
                <td>{{labor.rt_name}}</td>
                <td>{{labor.cpd_name}}</td>
                <td>{{addCommas(labor.labor_costs)}}</td>
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
              <p>
                <span>자재비: {{addCommas(viewerData.total.resource_costs)}}원</span>
              </p>
              <p>
                <span>인건비: {{addCommas(viewerData.total.labor_costs)}}원</span>
              </p>
              <p>
                <span>공과잡비: {{addCommas(viewerData.total.etc_costs)}}원</span>
              </p>
              <p>
                <span>합: {{addCommas(viewerData.total.resource_costs + viewerData.total.labor_costs + viewerData.total.etc_costs)}}원</span>
              </p>
            </div>
          </div>
        </article>
      </div>
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

  export default {
    name: 'estimate-sheet',
    mixins: [mixin],
    props: {
      estimateData: {
        type: Object,
        default: {
          general: [],
          labor: [],
          resource: [],
          total: {}
        }
      },
      deleteRegisterBtn: {
        type: Boolean,
        default: false
      }
    },
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

        }
      }
    },
    methods: {
      moveToRegister () {
        router.push({
          path: `/estimate/${this.param.id}/register`
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
      openSubResource (item) {
        if (!item.hasOwnProperty('sub_key')) {
          return false
        }
        this.isOpenSubResource[item.sub_key] = !this.isOpenSubResource[item.sub_key]
        this.$forceUpdate()
      }
    },
    mounted () {
      this.param = this.$route.params
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
          this.mergeSubResource(newValue.general)
        },
        deep: true
      }
    }
  }
</script>

<style scoped lang="scss">
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
</style>
