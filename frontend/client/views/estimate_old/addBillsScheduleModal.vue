<template>
  <modal name="addBillsScheduleModal" height="auto" width="45%">
    <div class="add-bills-schedule-modal">
      <div class="modal-card-head">
        <h1 class="modal-card-title">수금 예정표</h1>
        <button class="delete is-pulled-right" @click="$modal.hide('addBillsScheduleModal')"></button>
      </div>
      <div class="modal-card-body inputbox">
        <div class="block ">
          <div class="control has-addons">
            <div class="control is-inline-block">
              <label class="label">구분</label>
              <div class="select">
                <select v-model="billsScheduleData.cb_type">
                  <option value="">선택</option>
                  <option v-for="type in billsTypeList" :value="type">{{type}}</option>
                </select>
              </div>
            </div>
            <div class="control is-inline-block">
              <label class="label">수금 예정일</label>
              <p class="control">
                <datepicker v-model="billsScheduleData.cb_date" class="datepicker" :config="{dateFormat:'Y-m-d'}" />
              </p>
            </div>
            <div class="control is-inline-block">
              <label class="label">금액</label>
              <input class="input" type="number" placeholder="금액 입력" v-model="billsScheduleData.cb_amount" @keypress.enter.stop="addSchedule">
              <a class="button is-primary" @click="addSchedule">추가</a>
            </div>
          </div>
        </div>
        <div class="schedule-wrapper">
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
                <th class="has-text-centered">no</th>
                <th>구분</th>
                <th>수금예정일</th>
                <th class="has-text-right">금액</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in billsScheduleList" v-if="billsScheduleList.length !== 0">
                <td class="has-text-centered">{{i+1}}</td>
                <td>{{item.cb_type}}</td>
                <td>{{item.cb_date===null?'':moment(item.cb_date).format('YYYY-MM-DD')}}</td>
                <td class="has-text-right">{{addCommas(item.cb_amount)}}</td>
                <td class="has-text-centered">
                  <button class="button is-default" @click="deleteSchedule(item)">삭제</button>
                </td>
              </tr>
              <tr>
                <td colspan="4" class="has-text-right">{{addCommas(totalAmount)}}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="control">
          <button class="button is-info" @click="insertBillsSchedule()">등록</button>
          <button class="button is-danger" @click="$modal.hide('addBillsScheduleModal')">취소</button>
        </p>
      </div>
    </div>
  </modal>
</template>

<script>
  import Vue from 'vue'
  import Notification from 'vue-bulma-notification'
  import Datepicker from 'vue-bulma-datepicker'
  import moment from 'moment'
  import deepClone from '../../services/deepClone'
  import mixin from '../../services/mixin'
  import _ from 'underscore'
  import EventBus from '../../services/eventBus'

  const NotificationComponent = Vue.extend(Notification)

  const openNotification = (propsData = {
    title: '',
    message: '',
    type: '',
    direction: '',
    duration: 2500,
    container: '.notifications'
  }) => {
    return new NotificationComponent({
      el: document.createElement('div'),
      propsData
    })
  }

  const contractQueryApi = '/api/contract'
  export default {
    name: 'add-bills-schedule-modal',
    components: {
      Datepicker,
      Notification
    },
    mixins: [mixin],
    props: {
      id: String
    },
    mounted () {
      EventBus.$on('calculateEstimateTotalAmount', total => {
        this.estimateTotalAmount = total.total_costs - total.discount_amount
      })
    },
    data () {
      return {
        moment,
        billsTypeList: ['계약금', '착수금', '중도금', '잔금'],
        billsScheduleData: {
          cb_is_schedule: 1,
          cb_type: '',
          cb_date: '',
          cb_amount: ''
        },
        billsScheduleList: [],
        estimateTotalAmount: -1
      }
    },
    computed: {
      totalAmount () {
        return this.billsScheduleList.reduce((sum, o) => { return sum + parseInt(o.cb_amount) }, 0)
      }
    },
    methods: {
      addSchedule () {
        console.log(this.billsScheduleData)
        // validataion
        if (this.billsScheduleData.cb_type === '') {
          openNotification({
            message: '구분을 선택해주세요.',
            type: 'danger'
          })
          return false
        } else if (this.billsScheduleData.cb_date === '') {
          openNotification({
            message: '수금 예정일을 선택해주세요.',
            type: 'danger'
          })
          return false
        } else if (this.billsScheduleData.cb_amount === '') {
          openNotification({
            message: '금액을 입력해주세요.',
            type: 'danger'
          })
          return false
        } else {
          this.billsScheduleList.push(deepClone(this.billsScheduleData))
          this.billsScheduleData.cb_type = ''
          this.billsScheduleData.cb_amount = ''

          console.log(this.billsScheduleList)
          openNotification({
            message: '수금 예정이 등록 되었습니다.',
            type: 'success'
          })
          this.$forceUpdate()
        }
      },
      deleteSchedule (item) {
        this.billsScheduleList = _.without(this.billsScheduleList, item)
        this.$forceUpdate()
      },
      insertBillsSchedule () {
        console.log(this.billsScheduleList)
        console.log(`${contractQueryApi}/${this.id}/schedule/list`)
        if (this.totalAmount !== this.estimateTotalAmount) {
          openNotification({
            message: `채택하실 견적서 금액[${this.addCommas(this.estimateTotalAmount)}]과 일치하지 않습니다.`,
            type: 'danger'
          })
          return false
        }
        this.$http.post(`${contractQueryApi}/${this.id}/schedule/list`, {billsScheduleList: this.billsScheduleList})
          .then((response) => {
            console.log(response.data.data)
            if (response.data.code !== 200) {
              openNotification({
                message: `수금예정표 등록에 실패하였습니다.`,
                type: 'danger'
              })
              return false
            }
            EventBus.$emit('selectionCurrentTab')
            openNotification({
              message: '등록 되었습니다.',
              type: 'success',
              duration: 1500
            })
            this.$modal.hide('addBillsScheduleModal')
          })
      }
    },
    beforeDestroy () {
      EventBus.$off('calculateEstimateTotalAmount')
    }
  }
</script>
<style lang="scss" scoped>
  .add-bills-schedule-modal {
    border-radius: 1rem;
    .table {
      padding: 1rem;
    }
  }
  .v--modal-overlay {
    margin-left: -90px;
    width: calc(100% + 90px);
  }
  .schedule-wrapper {
    overflow: auto;
    max-height: 350px;
  }

  .inputbox {
    div.control {
      margin-right: 2rem;
    }
  }

  .schedule-wrapper td {
    vertical-align: middle;
  }
</style>
