<template xmlns="http://www.w3.org/1999/html">
  <div class="tile is-ancestor">
    <div class="tile is-parent">
      <article class="tile is-child box">
        <div class="is-clearfix">
          <h4 class="title">상담신청내역 상세</h4>
          <a class="button is-primary is-pulled-right is-medium" id="addBtn" @click="moveToContract">진행계약으로 이동</a>
        </div>
        <div class="block">
          <label class="label">상담 진행상태</label>
          <div class="select is-fullwidth">
            <select v-model="data.rq_process_status" v-on:change="changeProcessStatus">
              <option v-for="status in requestStatusConfig.statusList">{{status.label}}</option>
            </select>
          </div>
          <label class="label" v-if="hasStatusChildren">상담 실패사유</label>
          <div class="select is-fullwidth" v-if="hasStatusChildren">
            <select v-model="data.rq_fail_reason">
              <option value="" selected="selected">선택</option>
              <option v-for="failStatus in failStatusList" :value="failStatus.label">{{failStatus.label}}</option>
            </select>
          </div>
          <p class="control" v-if="data.rq_fail_reason === '기타'">
            <textarea class="textarea" v-model="data.rq_fail_reason_text" placeholder="실패사유를 입력해주세요."></textarea>
          </p>
          <label class="label">신청일자</label>
          <p class="control">
            {{ (data.rq_reg_dt === '0000-00-00' || !data.rq_reg_dt) ? '' : moment(data.rq_reg_dt, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD') }}
          </p>
          <label class="label">이름</label>
          <p class="control">
            {{ data.rq_name }}
          </p>
          <label class="label">연락처</label>
          <p class="control">
            <cleave class="input" type="tel" placeholder="Enter phone number" :options="{ phone: true, phoneRegionCode: 'kr'}" v-model="data.rq_phone" v-on:change="updateValue">

            </cleave>
          </p>
          <label class="label">담당자</label>
          <p class="control">
            <input class="input" type="text" v-model="data.rq_manager" />
          </p>
          <label class="label">별칭</label>
          <p class="control">
            <input type="text" class="input" v-model="data.rq_nickname" />
          </p>
          <label class="label">현장 구분</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select v-model="data.rq_site_type">
                <option value="">선택</option>
                <option v-for="siteType in requestStatusConfig.siteTypeList" :value="siteType.label">{{siteType.label}}</option>
              </select>
            </div>
          </div>
          <label class="label">평수</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select v-model="data.rq_size">
                <option value="">평수 선택</option>
                <option value="lt20">20평대 미만</option>
                <option value="eq20">20평대</option>
                <option value="eq30">30평대</option>
                <option value="eq40">40평대</option>
                <option value="eq50">50평대</option>
                <option value="eq60">60평대</option>
                <option value="gte70">70평대 이상</option>
              </select>
            </div>
          </div>
          <label class="label">예산</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select v-model="data.rq_budget">
                <option value=''>예산 선택안함</option>
                <option value='1500~2000'>1500~2000만원</option>
                <option value='2000~2500'>2000~2500만원</option>
                <option value='2500~3000'>2500~3000만원</option>
                <option value='3000~3500'>3000~3500만원</option>
                <option value='3500~4000'>3500~4000만원</option>
                <option value='4000~4500'>4000~4500만원</option>
                <option value='4500~5000'>4500~5000만원</option>
                <option value='5000~5500'>5000~5500만원</option>
                <option value='5500~6000'>5500~6000만원</option>
                <option value='6000~6500'>6000~6500만원</option>
                <option value='6500~7000'>6500~7000만원</option>
                <option value='lt1500'>1500만원 미만</option>
                <option value='lt2000'>2000만원 미만</option>
                <option value='lt2500'>2500만원 미만</option>
                <option value='lt3000'>3000만원 미만</option>
                <option value='lt3500'>3500만원 미만</option>
                <option value='lt4000'>4000만원 미만</option>
                <option value='lt4500'>4500만원 미만</option>
                <option value='lt5000'>5000만원 미만</option>
                <option value='gte2500'>2500만원 이상</option>
                <option value='gte3000'>3000만원 이상</option>
                <option value='gte3500'>3500만원 이상</option>
                <option value='gte4000'>4000만원 이상</option>
                <option value='gte4500'>4500만원 이상</option>
                <option value='gte5000'>5000만원 이상</option>
                <option value='gte6000'>6000만원 이상</option>
                <option value='gte7000'>7000만원 이상</option>
                <option value='contact'>협의로 결정</option>
              </select>
            </div>
          </div>
          <label class="label">주소</label>
          <p class="control">
            <label>기본주소</label>
            <input class="input" type="text" v-model="data.rq_address_brief" />
            <label>상세주소</label>
            <input class="input" type="text" v-model="data.rq_address_detail" />
          </p>
          <label class="label">원하시는 입주날짜</label>
          <p class="control">
            <datepicker v-model="data.rq_move_date" />
          </p>
          <label class="label">방문 상담일</label>
          <p class="control">
            <datepicker v-model="data.rq_date" />
          </p>
          <label class="label">방문 시간</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select v-model="data.rq_time">
                <option value="">없음</option>
                <option value="09:00 - 11:00">09:00 - 11:00</option>
                <option value="11:00 - 13:00">11:00 - 13:00</option>
                <option value="13:00 - 15:00">13:00 - 15:00</option>
                <option value="15:00 - 17:00">15:00 - 17:00</option>
                <option value="17:00 - 19:00">17:00 - 19:00</option>
              </select>
            </div>
          </div>
          <label class="label">공사종류</label>
          <div class="control">
            <div class="is-fullwidth">
              <textarea class="textarea" name="rq_construction_type" v-model="data.rq_construction_type"></textarea>
            </div>
          </div>
          <label class="label">상담결과</label>
          <div class="control">
            <div class="is-fullwidth">
              <textarea class="textarea" name="rq_consulting_result" v-model="data.rq_consulting_result"></textarea>
            </div>
          </div>
          <label class="label">공사내용</label>
          <div class="control">
            <div class="is-fullwidth">
              <textarea class="textarea" name="rq_memo" v-model="data.rq_memo"></textarea>
            </div>
          </div>
          <p class="control">
            <button class="button is-primary" v-on:click="submitData">수정</button>
          </p>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
  import Datepicker from 'vue-bulma-datepicker'
  import moment from 'moment'
  import Cleave from 'vue-cleave'
  import 'cleave.js/dist/addons/cleave-phone.kr.js'
  import requestStatusConfig from '../../config/request-status-config'
  import _ from 'underscore'
  import Vue from 'vue'
  import Notification from 'vue-bulma-notification'

  const NotificationComponent = Vue.extend(Notification)
  // @TODO require Cleave library bug fixed
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

  const queryApi = '/api/request'

  export default {
    name: 'detail',
    components: {
      Datepicker,
      Cleave
    },
    data () {
      return {
        data: {
          rq_phone: '',
          rq_fail_reason: '',
          rq_site_type: '',
          rq_fail_reason_text: ''
        },
        id: '',
        hasStatusChildren: false,
        failStatusList: [],
        requestStatusConfig,
        moment
      }
    },
    mounted () {
      console.log(this.$route)
      this.id = this.$route.params.id
      if (!this.id) {
        this.$router.back()
      }
      this.loadDetail(this.id)
    },
    methods: {
      loadDetail (id) {
        console.log('loadDetail')
        console.log(`${queryApi}/${id}`)
        this.$http.get(`${queryApi}/${id}`)
        .then((response) => {
          console.log(response)
          if (response.data.code !== 200) {
            return
          }
          this.data = response.data.data.data
          if (this.data.rq_fail_reason) {
            this.failStatusList = _.find(this.requestStatusConfig.statusList, (item) => {
              return item.label === this.data.rq_process_status
            }).children
            this.hasStatusChildren = true
            this.$forceUpdate()
          }
          Vue.set(this.data, 'rq_phone', this.data.rq_phone)
        }).catch((error) => {
          console.log(error)
        })
      },
      updateValue (newValue, oldValue) {
        console.log(`newValue: ${newValue}`)
        console.log(`oldValue: ${oldValue}`)
      },
      validate () {
        if (this.data.rq_name === '') {
          openNotification({
            message: '이름을 입력해 주십시오.',
            type: 'danger',
            duration: 2500
          })
          return false
        } else if (this.data.rq_phone === '') {
          openNotification({
            message: '전화번호를 입력해 주십시오.',
            type: 'danger',
            duration: 2500
          })
          return false
        }

        return true
      },
      submitData () {
        if (this.validate()) {
          this.data.rq_phone = this.data.rq_phone.replace(/\s/gi, '')
          this.$http.put(`${queryApi}/${this.id}`, this.data)
            .then((response) => {
              console.log(response)
              if (response.data.code !== 200) {
                return false
              }
              openNotification({
                message: '상담신청 수정이 완료되었습니다.',
                type: 'success',
                duration: 2500
              })
              this.$router.back()
            }).catch((error) => {
              console.log(error)
            })
        }
      },
      changeProcessStatus () {
        const selectedData = _.find(this.requestStatusConfig.statusList, (item) => {
          return item.label === this.data.rq_process_status
        })
        this.data.rq_fail_reason = ''
        if (selectedData.hasOwnProperty('children')) {
          this.failStatusList = selectedData.children
          this.hasStatusChildren = true
        } else {
          this.failStatusList = []
          this.hasStatusChildren = false
        }
        this.$forceUpdate()
      },
      moveToContract () {
        this.$http.post(`${queryApi}/contract/${this.id}`)
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            openNotification({
              message: '해당 고객이 진행계약 목록에 등록되었습니다.',
              type: 'success',
              duration: 2500
            })
          }).catch((error) => {
            console.log(error)
          })
      }
    }
  }
</script>

<style scoped>

</style>
