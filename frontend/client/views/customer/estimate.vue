<template>
  <div class="wrapper">
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
            <strong>김태리</strong> 고객
          </p>
          <hr />
        </div>
        <div class="level-item">
          <p>
            <strong>연락처</strong>
            <span class="is-block">010-4321-9876</span>
          </p>
        </div>
        <div class="level-item">
          <p>
            <strong>이사일</strong>
            <span class="is-block">2018.08.01</span>
          </p>
        </div>
        <div class="level-item">
          <p>
            <strong>평수</strong>
            <span class="is-block">18평</span>
          </p>
        </div>
        <div class="level-item">
          <p>
            <strong>주소</strong>
            <span class="is-block">서울시 강서구 양천로 551 10층 1010호</span>
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
          <col width="5%" />
          <col width="10%" />
          <col width="auto" />
          <col width="5%" />
          <col width="10%" />
          <col width="10%" />
          <col width="10%" />
        </colgroup>
        <thead>
        <tr>
          <th>위치</th>
          <th>공사</th>
          <th>공정</th>
          <th>자재</th>
          <th>물량</th>
          <th>자재단위</th>
          <th>인건비</th>
          <th>자재비</th>
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
          <td>{{addCommas(generalData.labor_costs)}}</td>
          <td>{{addCommas(generalData.resource_costs)}}</td>
        </tr>
        </tbody>
      </table>
        <div class="more-data">
          <i class="fa fa-angle-down" /><span>더보기</span>
        </div>
      </section>
      <section  class="detail-info columns">
        <div class="column is-6">
          <article>
            <h2 class="title has-text-centered">자재비</h2>
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
              <div class="more-data">
                <i class="fa fa-angle-down" /><span>더보기</span>
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
                  <td>{{labor.cpd_name}}</td>
                  <td>{{labor.rt_name}}</td>
                  <td>{{addCommas(labor.labor_costs)}}</td>
                </tr>
                </tbody>
              </table>
              <div class="more-data">
                <i class="fa fa-angle-down" /><span>더보기</span>
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
              <p>디자인 및 설계비</p>
              <p>감리비</p>
              <p>공과잡비</p>
            </div>
            <div class="level-item">
              <p>9,172,100원</p>
              <p>9,172,100원</p>
              <p>9,172,100원</p>
              <p>9,172,100원</p>
              <p>9,172,100원</p>
            </div>
          </div>
        </nav>
        <nav class="level">
          <!-- Left side -->
          <div class="level-left flex-center-text">
            <h3 class="subtitle">합계</h3>
          </div>
          <div class="level-right flex-center-text">
            <div class="level-item summary">
              <p>19,376,375원</p>
            </div>
          </div>
        </nav>
      </section>
      <!--<div class="tile is-ancestor summary">-->
        <!--<div class="tile is-parent">-->
          <!--<article class="tile is-child box">-->
            <!--<div class="is-clearfix">-->
              <!--<div class="is-pulled-right">-->
                <!--<p>-->
                  <!--<span>자재비: {{addCommas(viewerData.total.resource_costs)}}원</span>-->
                <!--</p>-->
                <!--<p>-->
                  <!--<span>인건비: {{addCommas(viewerData.total.labor_costs)}}원</span>-->
                <!--</p>-->
                <!--<p>-->
                  <!--<span>디자인 및 설계비: {{addCommas(viewerData.total.design_costs)}}원</span>-->
                <!--</p>-->
                <!--<p>-->
                  <!--<span>감리비: {{addCommas(viewerData.total.supervision_costs)}}원</span>-->
                <!--</p>-->
                <!--<p>-->
                  <!--<span>공과잡비: {{addCommas(viewerData.total.etc_costs)}}원</span>-->
                <!--</p>-->
                <!--<p>-->
                  <!--<span>합: {{addCommas(viewerData.total.resource_costs + viewerData.total.labor_costs + viewerData.total.etc_costs + viewerData.total.design_costs + viewerData.total.supervision_costs)}}원</span>-->
                <!--</p>-->
              <!--</div>-->
            <!--</div>-->
          <!--</article>-->
        <!--</div>-->
      <!--</div>-->
    </div>
    <div class="footer">

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

  const queryApi = '/api/contract'
  const estimateId = 6

  export default {
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
        estimateData: {
          general: [],
          labor: [],
          resource: [],
          total: {}
        }
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
      },
      loadEstimateView () {
        const id = estimateId
        let general
        let labor
        let resource
        let total
        if (!id) {
          return false
        }
        this.$http.get(`${queryApi}/${id}/estimate/general`)
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            general = response.data.data.estimateList
            return this.$http.get(`${queryApi}/${id}/estimate/labor`)
          })
          .then((response) => {
            if (response.data.code !== 200) {
              return
            }
            labor = response.data.data.estimateList
            return this.$http.get(`${queryApi}/${id}/estimate/resource`)
          })
          .then((response) => {
            if (response.data.code !== 200) {
              return
            }
            resource = response.data.data.estimateList
            return this.$http.get(`${queryApi}/${id}/estimate/total`)
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
      }
    },
    mounted () {
      this.loadEstimateView()
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
  $main-color: #9dadff;
  $background-grey: #f8f7fc;
  $default-font-size: 14px;

  .wrapper {
    background:#f8f7fc;
    overflow: hidden
  }
  .is-one-fifth {
    flex: none;
    width: 15%;
  }
  .mr-15 {
    margin-right: 1.5rem !important;
  }
  .flex-center-text {
    align-self: center;
  }

  .title-wrapper {
    padding: 4rem 4rem 7.5rem 4rem;
    background-color: $main-color;

    .title {
      color: white;

      .is-bold {
        font-weight: 400;
      }
    }

    .print-btn {
      width: 120px;
      height: 40px;
      box-shadow: 1px 2.8px 0 0 rgba(116, 134, 225, 0.5);
      background-color: $main-color;
      border: solid 1px #eeeeee;
      color:white;
    }
  }
  .level.user-info {
    background: white;
    margin: 0 4rem;
    position: relative;
    border-radius: 3px;
    box-shadow: 0px 1px 2.1px 0.9px rgba(0, 0, 0, 0.05);
    top: -4.5rem;
    .level-left {
      align-items: stretch;
    }

    .level-item {
      padding: 3rem;
      margin-right: 0;
      &.user-name {
        display:block;
        background: $background-grey;
        .subtitle {
          line-height:1.15;
          padding: 0 0.5rem 1.15rem 0.5rem;
        }
        hr {
          height: 4px;
          background-color: #9dadff;
          margin: 0;
        }
      }
    }
  }

  .contents {
    .title {
      font-weight: normal;
      color: #000000;
    }
    .table {
      border: solid 1px #e1e1e1;
      tr {
        &:hover {
          background-color: inherit;
        }
        border: solid 1px #e1e1e1;
      }

      td, th {
        padding: 1rem;
      }

      thead {
        background: #b5b5be;
        border: none;
        tr {
          th {
            color: white;
            border: none;
          }
          border-bottom: none;
        }
      }
      tbody {
        tr {
          &:first-child {
            border-top: none;
          }
          td {
            color: #000000;
          }
        }
      }
    }
    .space-base-info {
      padding: 0 4rem;
    }
    .detail-info {
      background: $background-grey;
      padding: 3rem 4rem 1.5rem 4rem;
      .title {
        margin-bottom: 1.8rem;
        font-size:1.7rem;
      }
      .column {
        padding-top: 0rem;
        &:first-child {
          padding-right: 1.75rem;
        }
        &:last-child {
          padding-left: 1.75rem;
        }
      }
    }
    .more-data {
      height: 50px;
      width: 100%;
      text-align: center;
      box-shadow: 0px 1px 2.1px 0.9px rgba(0, 0, 0, 0.05);
      margin: 3rem 0 0 0;
      background: white;
      display: flex;
      justify-content: center;
      align-items: center;

      i {
        font-size: 2rem;
        opacity: 0.7;
      }

      span {
        padding: 1rem;
        font-size: 20px;
      }
    }

    .summary-info {
      position:relative;
      z-index: 1;
      /*top: calc((14px * 2.2 * 1.15) + (14px * 4));*/
      margin: 0 4rem;
      padding: 2rem 0;
      background: white;
      border-radius: 3px;
      box-shadow: 0px 1px 2.1px 0.9px rgba(0, 0, 0, 0.05);

      .level {
        align-items: flex-start;
        margin: 0 2rem;
        line-height:1.15;
        &:first-child {
          border-bottom: 1px solid #000000;
          padding: 0 0 2rem 0;
        }
        &:last-child {
          padding: 2rem 0 0 0;
        }

        .level-left {
          .subtitle {
            font-size: 1.7rem;
            font-weight: normal;
            color: #000000;
          }
        }

        .level-right {
          .level-item {
            flex-direction: column;
            &:first-child {
              align-items: baseline;
            }

            &.summary {
              > p {
                font-size:2.2rem;
              }
            }
            p {
              font-size: 1.2rem;
              font-weight: normal;
              color: #000000;
              padding: 0.25rem;
              &:first-child {
                padding: 0 0.25rem 0.25rem;
              }
              &:last-child {
                padding: 0.25rem 0.25rem 0;
              }
            }
          }
        }
      }
    }
  }

  .footer {
    padding: calc((14px * 2.2 * 1.15) + (14px * 4));
    background: #666a86;
    margin-left: 0;
    z-index: 0;
    margin-top: calc(-1* ((14px * 2.2 * 1.15) + (14px * 4) + (14px * 0.25)))
  }


  .position-base-table {
    margin: 1rem 0 3rem 0
  }

  .is-rounded {
    border-radius: 20px;
  }
</style>
