<template>
  <div class="wrapper">
    <div class="container guide">
      <div class="title-container is-hidden-touch is-clearfix">
        <h1 class="title is-hidden-mobile is-pulled-left">
          실시간 <br> <b>인테리어 상세 견적서</b>
        </h1>
        <div class="is-pulled-right user-info-contents is-hidden-touch">
          <h3 class="user-name"><b>{{userInfo.pc_name}}</b> 님</h3>
          <div class="user-info is-clearfix">
            <div class="label-view is-pulled-right has-text-right">
              <p>연락처</p>
              <p>이사일</p>
              <p>평수</p>
              <p>주소</p>
            </div>
            <div class="contents is-pulled-right has-text-right">
              <p>{{userInfo.pc_phone}}</p>
              <p>{{(userInfo.pc_move_date === '0000-00-00 00:00:00' || !userInfo.pc_move_date ) ? '-' : moment(userInfo.pc_move_date , 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD')}}</p>
              <p>{{userInfo.pc_size}}</p>
              <p>{{userInfo.pc_address_brief}} {{userInfo.pc_address_detail}}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="tabs is-hidden-desktop">
        <ul>
          <li :class="{'is-active': selectedMobileMenu === mobileMenuList.estimate}" @click="changeMobileMenu(mobileMenuList.estimate)"><span>상세견적서</span></li>
          <li :class="{'is-active': selectedMobileMenu === mobileMenuList.photo}" @click="changeMobileMenu(mobileMenuList.photo)"><span>시공현황</span></li>
          <li :class="{'is-active': selectedMobileMenu === mobileMenuList.info}" @click="changeMobileMenu(mobileMenuList.info)"><span>고객정보</span></li>
        </ul>
      </div>
      <div class="tabs is-hidden-touch">
        <ul>
          <li :class="{'is-active' : openTabData.estimate}" @click="changeTab('estimate')"><span>견적서 보기</span></li>
          <li :class="{'is-active' : openTabData.photo}" @click="changeTab('photo')"><span>시공현황 보기</span></li>
        </ul>
      </div>
      <div class="container outer">
        <swipe
          :disabled="!isMobile()"
          :auto="0"
          :continuous="false"
          :showIndicators="false"
          ref="swipeView"
          @change="swipeChangeTabs"
        >
          <swipe-item>
            <div class="container inner" :class="{hide: !openTabData.estimate, current: openTabData.estimate}">
            <div class="btn-select-view">
              <div class="select-view">
                <label for="versionSelect">견적서 선택</label>
                <div class="select">
                  <select id="versionSelect" v-model="selectedTab" @change="loadEstimateView">
                    <option v-if="!selectionFlag" value="">현황 ({{ moment().format('YYYY-MM-DD') }})</option>
                    <option v-for="(tab, index) in estimateCurrentTabs" :value="tab.es_pk">
                      {{tab.es_version}}.0v - {{ getComputedDate(tab.es_reg_dt)}}
                    </option>
                  </select>
                </div>
              </div>
              <div class="btn-view">
                <!--<button class="button">인쇄하기</button>-->
              </div>
              <div class="money-summary is-hidden-desktop">
                <h3 class="subtitle">총 견적금액</h3>
                <p><b>{{addCommas(viewerData.total.total_costs - (!viewerData.total.discount_amount ? 0 : viewerData.total.discount_amount))}}</b> 원</p>
              </div>
            </div>

            <div class="estimate-contents">
              <div class="content general-table" :class="{fold: isFoldStatus.general}" ref="generalTable">
                <div class="title-container is-clearfix" @click="toggleTable('general')">
                  <h3 class="subtitle is-pulled-left">공간별 견적</h3>
                  <i class="fa is-pulled-right" :class="{'fa-angle-up' : !isFoldStatus.general, 'fa-angle-down': isFoldStatus.general}"></i>
                </div>
                <div class="fold-view">
                  <table class="table position-base-table" id="general-table">
                    <colgroup>
                      <col :width="isMobile() ? '30%' : '8%'" />
                      <col class="is-hidden-touch" width="5%" />
                      <col class="is-hidden-touch" width="10%" />
                      <col :width="isMobile() ? '25%' : '10%'" />
                      <col class="is-hidden-touch" width="10%" />
                      <col class="is-hidden-touch" width="auto" />
                      <col width="10%" />
                      <col width="10%"/>
                    </colgroup>
                    <thead>
                    <tr>
                      <th>위치</th>
                      <th class="is-hidden-touch">공사</th>
                      <th class="is-hidden-touch">공정</th>
                      <th>상세공정</th>
                      <th class="is-hidden-touch">상세위치</th>
                      <th class="is-hidden-touch">자재</th>
                      <th class="has-text-right">인건비</th>
                      <th class="has-text-right">자재비</th>
                    </tr>
                    </thead>
                      <transition-group name="list" mode="out-in" tag="tbody">
                        <tr class="list-item"
                            :class="{'is-summary': generalData.is_summary}"
                            v-for="(generalData, index) in viewerData.general"
                            v-if="rowHideCondition(generalData, index)"
                            @click="openSubResource(generalData)"
                            v-bind:key="index">
                          <td v-if="generalData.hasOwnProperty('place_count')" :rowspan="generalData.hasOwnProperty('sub_key') ?  isOpenSubResource[generalData.sub_key] === true ? generalData.place_count : 1 : generalData.place_count - 1">{{generalData.place_name}}</td>
                          <td class="is-hidden-touch construction" v-if="generalData.hasOwnProperty('construction_count')" :rowspan="generalData.hasOwnProperty('sub_key') ?  isOpenSubResource[generalData.sub_key] === true ? generalData.construction_count : 1 : generalData.construction_count" :colspan="generalData.is_summary ? 6 : 1">{{generalData.ct_name}}</td>
                          <td class="is-hidden-touch" v-if="!generalData.is_summary && generalData.hasOwnProperty('construction_process_count')" :rowspan="generalData.hasOwnProperty('sub_key') ?  isOpenSubResource[generalData.sub_key] === true ? generalData.construction_process_count : 1 : generalData.construction_process_count">{{generalData.cp_name}}</td>
                          <td v-if="!generalData.is_summary && !generalData.hasOwnProperty('sub_key')">{{generalData.cpd_name}}</td>

                          <!-- 소계용 -->
                          <td class="is-hidden-desktop" v-if="generalData.is_summary" colspan="2">{{generalData.ct_name}}</td>

                          <!-- 부자재 -->
                          <td class="is-hidden-desktop" v-if="generalData.hasOwnProperty('sub_key')">{{generalData.rs_name}}</td>

                          <td class="is-hidden-touch" v-if="!generalData.is_summary">{{generalData.detail_place}}</td>
                          <td class="is-hidden-touch" v-if="!generalData.is_summary">{{generalData.rs_name}}<span class="resource-code" v-if="generalData.rs_code !== '' || generalData.ed_alias !== ''">({{generalData.ed_alias || generalData.rs_code}})</span></td>
                          <td class="has-text-right">{{addCommas(generalData.labor_costs)}}</td>
                          <td class="has-text-right">{{addCommas(generalData.resource_costs)}}</td>
                        </tr>
                      </transition-group>
                  </table>
                  <div class="more-btn-container" v-if="viewerData.general.length > 10">
                    <button class="more-btn button" @click="toggleMoreData('general')">더보기</button>
                  </div>
                </div>
              </div>
              <div class="content" :class="{fold: isFoldStatus.resource}" ref="resourceTable">
                <div class="title-container is-clearfix" @click="toggleTable('resource')">
                  <h3 class="subtitle is-pulled-left">자재비</h3>
                  <i class="fa is-pulled-right" :class="{'fa-angle-up' : !isFoldStatus.resource, 'fa-angle-down': isFoldStatus.resource}"></i>
                  <span class="is-pulled-right money-summary"><b>{{addCommas(viewerData.total.resource_costs)}}</b> 원</span>
                </div>
                <div class="fold-view">
                  <table class="table" id="resource-table">
                    <colgroup>
                      <col width="28%"/>
                      <col width="auto"/>
                      <col width="auto"/>
                      <col width="auto"/>
                      <col width="auto"/>
                      <col width="auto"/>
                    </colgroup>
                    <thead>
                    <tr>
                      <th>자재분류</th>
                      <th>자재</th>
                      <th class="is-hidden-touch">물량</th>
                      <th class="is-hidden-touch">자재단위</th>
                      <th class="is-hidden-touch has-text-right">단가</th>
                      <th class="has-text-right">금액</th>
                    </tr>
                    </thead>
                      <transition-group name="list" mode="out-in" tag="tbody">
                        <tr
                          class="list-item"
                          :class="{'is-summary': resource.is_summary}"
                          v-for="(resource, index) in viewerData.resource"
                          v-if="resource.resource_costs !== 0 && (index <= 10 || isMoreBtnStatus.resource)"
                          v-bind:key="index" >
                          <td v-if="resource.hasOwnProperty('resource_category_count')" :rowspan="resource.resource_category_count || 1">{{resource.rc_name}}</td>
                          <td>{{resource.rs_name}}<span class="resource-code" v-if="resource.rs_code !== '' || resource.ed_alias !== ''">({{resource.ed_alias || resource.rs_code}})</span></td>
                          <td class="is-hidden-touch">{{resource.resource_amount}}</td>
                          <td class="is-hidden-touch">{{resource.ru_name}}</td>
                          <td class="has-text-right is-hidden-touch">{{addCommas(resource.rs_price)}}</td>
                          <td class="has-text-right">{{addCommas(resource.resource_costs)}}</td>
                        </tr>
                      </transition-group>
                  </table>
                  <div class="more-btn-container" v-if="viewerData.resource.length > 10">
                    <button class="more-btn button" @click="toggleMoreData('resource')">더보기</button>
                  </div>
                </div>
              </div>
              <div class="content" :class="{fold: isFoldStatus.labor}" ref="laborTable">
                <div class="title-container is-clearfix" @click="toggleTable('labor')">
                  <h3 class="subtitle is-pulled-left">인건비</h3>
                  <i class="fa is-pulled-right" :class="{'fa-angle-up' : !isFoldStatus.labor, 'fa-angle-down': isFoldStatus.labor}"></i>
                  <span class="is-pulled-right money-summary"><b>{{addCommas(viewerData.total.labor_costs)}}</b> 원</span>
                </div>
                <div class="fold-view">
                  <table class="table" id="labor-table">
                    <colgroup>
                      <col width="auto"/>
                    </colgroup>
                    <thead>
                    <tr>
                      <th>공사</th>
                      <th class="is-hidden-touch" >공정</th>
                      <th>상세공정</th>
                      <th>자재군</th>
                      <th class="has-text-right">인건비</th>
                    </tr>
                    </thead>
                    <transition-group name="list" mode="out-in" tag="tbody">
                      <tr
                        class="list-item"
                        :class="{'is-summary': labor.is_summary}"
                        v-for="(labor, index) in viewerData.labor"
                        v-if="labor.labor_costs !== 0 && (index <= 10 || isMoreBtnStatus.labor)"
                        v-bind:key="index" >
                        <td v-if="labor.hasOwnProperty('construction_count')" :rowspan="labor.construction_count || 1">{{labor.ct_name}}</td>
                        <td class="is-hidden-touch" v-if="labor.hasOwnProperty('construction_process_count')" :rowspan="labor.construction_process_count || 1">{{labor.cp_name}}</td>
                        <td v-if="labor.hasOwnProperty('construction_process_detail_count')" :rowspan="labor.construction_process_detail_count || 1">{{labor.cpd_name}}</td>
                        <td>{{labor.rt_name}}</td>
                        <td class="has-text-right">{{addCommas(labor.labor_costs)}}</td>
                      </tr>
                    </transition-group>
                  </table>
                  <div class="more-btn-container" v-if="viewerData.labor.length > 10">
                    <button class="more-btn button" @click="toggleMoreData('labor')">더보기</button>
                  </div>
                </div>
              </div>
              <div class="content not-opened">
                <div class="title-container is-clearfix">
                  <h3 class="subtitle is-pulled-left">공과잡비</h3>
                  <span class="is-pulled-right money-summary"><b>{{addCommas(viewerData.total.etc_costs)}}</b> 원</span>
                </div>
              </div>
              <div class="content not-opened">
                <div class="title-container is-clearfix">
                  <h3 class="subtitle is-pulled-left">설계비 및 감리비</h3>
                  <span class="is-pulled-right money-summary"><b>{{addCommas(viewerData.total.design_costs + viewerData.total.supervision_costs)}}</b> 원</span>
                </div>
              </div>
              <div class="content not-opened">
                <div class="title-container is-clearfix">
                  <h3 class="subtitle is-pulled-left discount">할인 금액</h3>
                  <span class="is-pulled-right money-summary discount"><b>- {{addCommas(viewerData.total.discount_amount)}}</b> 원</span>
                </div>
              </div>
              <div class="content result is-hidden-touch">
                <div class="title-container is-clearfix">
                  <h3 class="subtitle is-pulled-left">총 견적 금액</h3>
                  <span class="is-pulled-right money-summary"><b>{{addCommas(viewerData.total.total_costs - (!viewerData.total.discount_amount ? 0 : viewerData.total.discount_amount))}}</b> 원</span>
                </div>
              </div>
            </div>
          </div>
          </swipe-item>
          <swipe-item>
            <div class="container inner photo-view" :class="{hide: !openTabData.photo, current: openTabData.photo}">
              <div class="estimate-photo-view">
                <div v-for="date in siteImageDateList" class="photo-date-container">
                  <h1 class="subtitle">{{getDateName(date)}}</h1>
                  <div class="photo-list">
                    <div class="image-box" v-for="(image, index) in siteImageList[date]" :key="index" >
                      <img :src="image.si_url" class="slide-image"
                           @click="openImageModal({image, index, siteImageList: siteImageList[date]})"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </swipe-item>
          <swipe-item>
            <div class="container inner user-info-view is-hidden-desktop">
              <div class="user-info-container">
                <div class="user-name-view">
                  <div class="profile-image-view">
                    <img src="~assets/user-profile.png" />
                  </div>
                  <p class="user-name"><b>{{userInfo.pc_name}}</b> 님의 <br />고객정보</p>
                </div>
                <div class="user-info">
                  <div>
                    <h4 class="subtitle">연락처</h4>
                    <span>{{userInfo.pc_phone}}</span>
                  </div>
                  <div>
                    <h4 class="subtitle">이사일</h4>
                    <span><p>{{(userInfo.pc_move_date === '0000-00-00 00:00:00' || !userInfo.pc_move_date ) ? '-' : moment(userInfo.pc_move_date , 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD')}}</p></span>
                  </div>
                  <div>
                    <h4 class="subtitle">평수</h4>
                    <span>{{userInfo.pc_size}}</span>
                  </div>
                  <div>
                    <h4 class="subtitle">주소</h4>
                    <span>{{userInfo.pc_address_brief}} {{userInfo.pc_address_detail}}</span>
                  </div>
                </div>
              </div>
            </div>
          </swipe-item>
        </swipe>
      </div>
    </div>
    <estimate-auth-view
      :beforeClose="loadEstimateView"
      :isCloseModal.sync="isCloseModal"
      v-on:changeCloseModalStatus="changeCloseModalStatus"/>
    <ImageEnlargedView
      :image="enlargedImage.image"
      :imageGroup="enlargedImage.imageGroup"
      :index="enlargedImage.index"
    />
  </div>
</template>

<script>
  /* eslint-disable no-unused-vars */

  // in ES6 modules
  import { Swipe, SwipeItem } from 'vue-swipe'
  import router from '../../router'
  import mixin from '../../services/mixin'
  import EventBus from '../../services/eventBus'
  import deepClone from '../../services/deepClone'
  import EstimateAuthView from './EstimateAuthView'
  import _ from 'underscore'
  import moment from 'moment'
  import { Carousel, Slide } from 'vue-carousel'
  import ImageEnlargedView from './ImageEnlargedView'

  const queryApi = '/api/contract'

  export default {
    components: {
      EstimateAuthView,
      ImageEnlargedView,
      Carousel,
      Swipe,
      SwipeItem,
      Slide
    },
    name: 'estimate-sheet',
    mixins: [mixin],
    data () {
      return {
        moment,
        param: {},
        mergeRestTime: false,
        openTabData: {
          estimate: true,
          photo: false
        },
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
        isFoldStatus: {
          general: false,
          labor: true,
          resource: true
        },
        siteImageList: {},
        enlargedImage: {
          image: {},
          imageGroup: [],
          index: 0
        },
        siteImageDateList: [],
        isCloseModal: false,
        estimateCurrentTabs: {},
        selectionFlag: false,
        selectedTab: '',
        selectedMobileMenu: 0,
        mobileMenuList: {
          estimate: 0,
          photo: 1,
          info: 2
        }
      }
    },
    methods: {
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
            return item.resource_costs.toString() !== '0'
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
          if (item.resource_costs.toString() === '0') {
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
        const isPre = this.selectionFlag
        const esPk = this.selectedTab
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
            return this.$http.get(`${queryApi}/${id}/estimate${esPk ? ('/' + esPk) : ''}/general?es_is_pre=${isPre}`)
          })

          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            general = response.data.data.estimateList
            return this.$http.get(`${queryApi}/${id}/estimate${esPk ? ('/' + esPk) : ''}/labor?es_is_pre=${isPre}`)
          })
          .then((response) => {
            if (response.data.code !== 200) {
              return
            }
            labor = response.data.data.estimateList
            return this.$http.get(`${queryApi}/${id}/estimate${esPk ? ('/' + esPk) : ''}/resource?es_is_pre=${isPre}`)
          })
          .then((response) => {
            if (response.data.code !== 200) {
              return
            }
            resource = response.data.data.estimateList
            return this.$http.get(`${queryApi}/${id}/image`)
          })
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            this.siteImageList = {}
            this.siteImageDateList = []

            const siteImageList = response.data.data.siteImageList
            _.forEach(siteImageList, (siteImage) => {
              const dateToMoment = moment(siteImage.si_reg_dt, 'YYYY-MM-DDTTHH:mm:ss:SSSZ')
              const date = dateToMoment.isValid() ? dateToMoment.format('YYYY-MM-DD') : ''
              if (!this.siteImageList[date]) {
                this.siteImageList[date] = []
              }
              this.siteImageList[date].push(siteImage)
              this.siteImageDateList.push(date)
            })
            this.siteImageDateList = _.chain(this.siteImageDateList)
              .uniq()
              .sortBy((item) => {
                return moment(item, 'YYYY-MM-DD').format('X')
              })
              .value()
            return this.$http.get(`${queryApi}/${id}/estimate${esPk ? ('/' + esPk) : ''}/total?es_is_pre=${isPre}`)
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
      getTabList () {
        const id = this.pc_pk
        return this.$http.get(`${queryApi}/${id}/customer/estimate/tabs`)
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            const data = response.data.data
            this.estimateCurrentTabs = data.tabs
            this.selectionFlag = data.hasOwnProperty('selectionFlag') ? data.selectionFlag : this.selectionFlag
            if (this.estimateCurrentTabs.length > 0) {
              if (this.selectionFlag) {
                this.selectedTab = this.estimateCurrentTabs[0].es_pk
              } else {
                this.selectedTab = ''
              }
            }
          })
      },
      changeCloseModalStatus (result) {
        if (window.hasOwnProperty('sessionStorage')) {
          window.sessionStorage.setItem('pc_pk', result.pc_pk)
        }
        this.isCloseModal = result.closeStatus
        this.pc_pk = result.pc_pk
        if (this.isCloseModal) {
          this.getTabList()
            .then(() => {
              this.loadEstimateView()
            })
        }
      },
      rowHideCondition (item, index) {
        return (item.rt_sub === 0 || (item.hasOwnProperty('sub_key') && this.isOpenSubResource[item.sub_key] === true)) && (index <= 10 || this.isMoreBtnStatus.general)
      },
      toggleMoreData (type) {
        this.isMoreBtnStatus[type] = !this.isMoreBtnStatus[type]
        if (!this.isMoreBtnStatus[type]) {
          const target = this.$refs[`${type}Table`]
          if (this.isMobile()) {
            this.$scrollTo(target, 500, {
              container: '.container.inner.current'
            })
          } else {
            this.$scrollTo(target)
          }
        }
      },
      getFullAddress (brief, detail) {
        if (!(brief || detail)) {
          return '-'
        } else {
          return `${brief} ${detail}`
        }
      },
      toggleTable (type) {
        this.isFoldStatus[type] = !this.isFoldStatus[type]
      },
      changeTab (target) {
        for (let i in this.openTabData) {
          if (this.openTabData.hasOwnProperty(i)) {
            this.openTabData[i] = i === target
          }
        }
      },
      getDateName (date) {
        const dateToMoment = moment(date, 'YYYY-MM-DD')
        const today = moment()
        if (dateToMoment.format('YYYY') === today.format('YYYY')) {
          return dateToMoment.format('MM월 DD일')
        } else {
          return dateToMoment.format('YYYY년 MM월 DD일')
        }
      },
      openImageModal (options) {
        this.enlargedImage.image = options.image
        this.enlargedImage.index = options.index
        this.enlargedImage.imageGroup = options.siteImageList

        this.$modal.show('imageEnlargedView')
      },
      swipeChangeTabs (newIndex, oldIndex) {
        console.log(oldIndex, newIndex)
        this.selectedMobileMenu = newIndex
      },
      changeMobileMenu (index) {
        this.$refs.swipeView.goto(index)
      },
      checkScrollBlockToMobileDevice (e) {
        if (this.isMobile()) {
          document.getElementsByTagName('html')[0].classList.add('v--modal-block-scroll')
          document.body.classList.add('v--modal-block-scroll')
        } else {
          document.getElementsByTagName('html')[0].classList.remove('v--modal-block-scroll')
          document.body.classList.remove('v--modal-block-scroll')
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
      window.addEventListener('resize', this.checkScrollBlockToMobileDevice)
      this.checkScrollBlockToMobileDevice()
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
<style lang="scss">

</style>
