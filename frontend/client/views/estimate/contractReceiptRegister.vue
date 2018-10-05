<template>
  <div>
    <div class="tile is-ancestor">
      <table class="table is-bordered contract-receipt is-hidden-desktop">
        <tbody>
        <tr>
          <th>긴급여부</th>
          <td>
            <input class="checkbox" type="checkbox" v-model="receipt.rc_is_emergency" />
          </td>
        </tr>
        <tr>
          <th>공사</th>
          <td>
            <div class="select" :class="{'is-danger': $v.receipt.rc_ctpk.$invalid }">
              <select v-model="receipt.rc_ctpk" >
                <option value="" disabled class="disabled">선택</option>
                <option v-for="construction in constructionList" :value="construction.ct_pk">{{construction.ct_name}}</option>
              </select>
            </div>
            <div>
              <p class="help is-danger" v-if="!$v.receipt.rc_ctpk.required">공사를 선택해 주십시오.</p>
            </div>
          </td>
        </tr>
        <tr>
          <th>구분</th>
          <td>
            <label>인건비</label><input class="radio" type="radio" v-model="receipt.rc_type" value="0" name="rc_type" :class="{'is-danger': $v.receipt.rc_type.$invalid }"/>
            <label>자재비</label><input class="radio" type="radio" v-model="receipt.rc_type" value="1" name="rc_type" :class="{'is-danger': $v.receipt.rc_type.$invalid }"/>
            <div>
              <p class="help is-danger" v-if="!$v.receipt.rc_type.required">공사를 입력 해 주십시오.</p>
            </div>
          </td>
        </tr>
        <tr>
          <th>내용</th>
          <td><input class="input" type="text" v-model="receipt.rc_contents" /></td>
        </tr>
        <tr>
          <th>금액</th>
          <td>
            <input class="input" type="text" v-model="receipt.rc_price" :class="{'is-danger': $v.receipt.rc_price.$invalid }"/>
            <div>
              <p class="help is-danger" v-if="!$v.receipt.rc_price.required">금액을 입력 해 주십시오.</p>
            </div>
          </td>
        </tr>
        <tr>
          <th>부가세</th>
          <td>
            <input class="checkbox" name="rc_is_vat_included" type="checkbox" v-model="receipt.rc_is_vat_included"/>
          </td>
        </tr>
        <tr>
          <th>은행명</th>
          <td>
            <input class="input" type="text" v-model="receipt.rc_account_bank" :class="{'is-danger': $v.receipt.rc_account_bank.$invalid }"/>
            <div>
              <p class="help is-danger" v-if="!$v.receipt.rc_account_bank.required">은행을 입력 해 주십시오.</p>
            </div>
          </td>
        </tr>
        <tr>
          <th>예금주</th>
          <td>
            <input class="input" type="text" v-model="receipt.rc_account_holder" :class="{'is-danger': $v.receipt.rc_account_holder.$invalid }"/>
            <div>
              <p class="help is-danger" v-if="!$v.receipt.rc_account_holder.required">예금주를 입력 해 주십시오.</p>
            </div>
          </td>
        </tr>
        <tr>
          <th>계좌번호</th>
          <td>
            <input class="input" type="text" v-model="receipt.rc_account_number" :class="{'is-danger': $v.receipt.rc_account_number.$invalid }"/>
            <div>
              <p class="help is-danger" v-if="!$v.receipt.rc_account_number.required">계좌번호를 입력 해 주십시오.</p>
            </div>
          </td>
        </tr>
        <tr>
          <th>첨부서류</th>
          <td>
            <button class="button">업로드</button>
          </td>
        </tr>
        <tr>
          <th>메모</th>
          <td><input class="input" type="text" v-model="receipt.rc_memo" /></td>
        </tr>
        <tr>
          <td style="text-align: center; vertical-align: middle;" colspan="2">
            <button class="button is-primary is-medium" @click="registerReceipt">등록</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
  import { required } from 'vuelidate/lib/validators'
  import Notification from 'vue-bulma-notification'
  import Vue from 'vue'

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
    name: 'contract-receipt-register',
    data () {
      return {
        receipt: {},
        id: '',
        constructionList: []
      }
    },
    validations: {
      receipt: {
        rc_type: {
          required
        },
        rc_ctpk: {
          required
        },
        rc_date: {
          required
        },
        rc_price: {
          required
        },
        rc_account_bank: {
          required
        },
        rc_account_holder: {
          required
        },
        rc_account_number: {
          required
        },
        rc_is_vat_included: {
          required
        }
      }
    },
    methods: {
      registerReceipt () {
        this.$http.post(`${queryApi}/${this.id}/receipt`, this.receipt)
          .then((response) => {
            if (response.data.code !== 200) {
              openNotification({
                message: '결재 등록 중 오류가 발생했습니다.',
                type: 'danger',
                duration: 1500
              })
              return
            }

            openNotification({
              message: '결재가 등록되었습니다.',
              type: 'success',
              duration: 1500
            })
            this.$router.back()
          })
          .catch((error) => {
            console.error(error)
          })
      }
    },
    mounted () {
      this.id = this.$route.params.id
      this.$http.get(`${queryApi}/${this.id}/construction`)
        .then((response) => {
          this.constructionList = response.data.data.constructionList
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }
</script>

<style scoped>

</style>
