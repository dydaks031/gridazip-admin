<template>
  <div>
    <div class="tile is-ancestor">
      <table class="table is-bordered contract-receipt">
        <tbody>
        <tr>
          <th>긴급여부</th>
          <td>
            <input class="checkbox" type="checkbox" v-model="receipt.isEmergency" />
          </td>
        </tr>
        <tr>
          <th>현장</th>
          <td>
            <div class="select" :class="{'is-danger': $v.receipt.pcPk.$invalid }">
              <select v-model="receipt.pcPk" @change="loadContractConstruction">
                <option value="" disabled class="disabled">선택</option>
                <option v-for="contract in contractList" :value="contract.pc_pk">{{contract.pc_name}}{{contract.pc_nickname?' - ' + contract.pc_nickname:''}}</option>
              </select>
            </div>
            <div>
              <p class="help is-danger" v-if="!$v.receipt.pcPk.required">현장을 선택해 주십시오.</p>
            </div>
          </td>
        </tr>
        <tr>
          <th>공사</th>
          <td>
            <div class="select" :class="{'is-danger': $v.receipt.ctPk.$invalid }">
              <select v-model="receipt.ctPk" >
                <option value="" disabled class="disabled">선택</option>
                <option v-for="construction in constructionList" :value="construction.ct_pk">{{construction.ct_name}}</option>
              </select>
            </div>
            <div>
              <p class="help is-danger" v-if="!$v.receipt.ctPk.required">공사를 선택해 주십시오.</p>
            </div>
          </td>
        </tr>
        <tr>
          <th>구분</th>
          <td>
            <label>인건비</label><input class="radio" type="radio" v-model="receipt.type" value="0" name="type" :class="{'is-danger': $v.receipt.type.$invalid }"/>
            <label>자재비</label><input class="radio" type="radio" v-model="receipt.type" value="1" name="type" :class="{'is-danger': $v.receipt.type.$invalid }"/>
            <label>기타잡비</label><input class="radio" type="radio" v-model="receipt.type" value="2" name="type" :class="{'is-danger': $v.receipt.type.$invalid }"/>
            <div>
              <p class="help is-danger" v-if="!$v.receipt.type.required">구분을 입력해 주십시오.</p>
            </div>
          </td>
        </tr>
        <tr>
          <th>내용</th>
          <td><input class="input" type="text" v-model="receipt.contents" /></td>
        </tr>
        <tr>
          <th>금액</th>
          <td>
            <input class="input" type="number" v-model="receipt.price" :class="{'is-danger': $v.receipt.price.$invalid }"/>
            <div>
              <p class="help is-danger" v-if="!$v.receipt.price.required">금액을 입력해 주십시오.</p>
            </div>
          </td>
        </tr>
        <tr>
          <th>부가세</th>
          <td>
            <input class="checkbox" name="isVatIncluded" type="checkbox" v-model="receipt.isVatIncluded" />
          </td>
        </tr>
        <tr>
          <th>은행명</th>
          <td>
            <select2 :options="bankCodeList" v-model="receipt.accountBank">
              <option value="" disabled>선택</option>
            </select2>
            <div>
              <p class="help is-danger" v-if="!$v.receipt.accountBank.required">은행을 입력해 주십시오.</p>
            </div>
          </td>
        </tr>
        <tr>
          <th>예금주</th>
          <td>
            <input class="input" type="text" v-model="receipt.accountHolder" :class="{'is-danger': $v.receipt.accountHolder.$invalid }"/>
            <div>
              <p class="help is-danger" v-if="!$v.receipt.accountHolder.required">예금주를 입력해 주십시오.</p>
            </div>
          </td>
        </tr>
        <tr>
          <th>계좌번호</th>
          <td>
            <input class="input" type="text" v-model="receipt.accountNumber" :class="{'is-danger': $v.receipt.accountNumber.$invalid }"/>
            <div>
              <p class="help is-danger" v-if="!$v.receipt.accountNumber.required">계좌번호를 입력해 주십시오.</p>
            </div>
          </td>
        </tr>
        <tr>
          <th>메모</th>
          <td><input class="input" type="text" v-model="receipt.memo" /></td>
        </tr>
        <tr>
          <th>첨부서류</th>
          <td>
            <span class="input-group">
              <button class="button" v-on:click="callFileUpload('file_upload_new')">업로드</button>
              <input type="file" name="new_file" placeholder="new File" style="display:none;" :ref='"file_upload_new"' v-on:change="onFileChanged($event, 'new')" accept="image/*" multiple/>
            </span>
            <div class="upload-image-wrapper" v-for="(image, index) in imageList" >
              <img :src="image.url" style="max-width:50%;"/>
              <input type="file" :name='"receipt_upload[" + index + "]"' style="display:none;" :ref='"receipt_upload_" + index' v-on:change="onFileChanged($event, index)" />
              <button class="button is-danger" @click="deleteFiles(image)">삭제</button>
              <button class="button is-info" @click="callFileUpload('receipt_upload_' + index)">수정</button>
            </div>
          </td>
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
  import select2 from '../components/select2Component'
  import { required } from 'vuelidate/lib/validators'
  import Notification from 'vue-bulma-notification'
  import Vue from 'vue'
  import FormData from 'form-data'
  import _ from 'underscore'
  import BankCode from '../../config/bank-code'

  // const constructionQueryApi = '/api/construction'
  const contractQueryApi = '/api/contract'
  const fileUploadApi = '/api/file/upload'

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
    components: {
      select2
    },
    data () {
      return {
        receipt: {},
        id: '',
        constructionList: [],
        contractList: [],
        imageList: [],
        bankCodeList: BankCode.bankCodeList
      }
    },
    validations: {
      receipt: {
        type: {
          required
        },
        pcPk: {
          required
        },
        ctPk: {
          required
        },
        price: {
          required
        },
        accountBank: {
          required
        },
        accountHolder: {
          required
        },
        accountNumber: {
          required
        },
        isVatIncluded: {
          required
        }
      }
    },
    methods: {
      loadProceedingContract () {
        this.$http.get(`${contractQueryApi}?isPage=false&isAdopted=true`)
          .then((response) => {
            if (response.data.code !== 200) {
              return
            }
            const dataList = response.data.data
            this.contractList = dataList.contractList
          }).catch((error) => {
            console.error(error)
          })
      },
      loadContractConstruction () {
        this.receipt.ctPk = ''
        this.constructionList.length = 0
        this.constructionList = []

        this.$http.get(`${contractQueryApi}/${this.receipt.pcPk}/construction`)
          .then((response) => {
            this.constructionList = response.data.data.constructionList
          })
          .catch((error) => {
            console.error(error)
          })
      },
      registerReceipt () {
        this.receipt.attachedList = this.imageList
        if (!this.receipt.isVatIncluded) {
          this.receipt.isVatIncluded = false
        }

        if (this.receipt.attachedList.length === 0) {
          window.alert('첨부파일은 필수로 등록해주셔야 합니다.')
          return
        }

        this.receipt.accountNumber = this.receipt.accountNumber.toString().replace(/-/gi, '')
        this.receipt.price = this.receipt.price.toString().replace('/,/gi', '')

        this.$http.get(`${contractQueryApi}/${this.receipt.pcPk}/receipt/isExist?price=${this.receipt.price}&accountNumber=${this.receipt.accountNumber}`)
          .then(response => {
            console.log(response)
            const isExist = response.data.data.isExist === 'true' || response.data.data.isExist === true
            if (isExist) {
              if (window.confirm('동일한 내용의 결재 건이 존재합니다.\n그래도 올리시겠습니까?')) {
                return this.$http.post(`${contractQueryApi}/${this.receipt.pcPk}/receipt`, this.receipt)
              } else {
                return null
              }
            } else {
              return this.$http.post(`${contractQueryApi}/${this.receipt.pcPk}/receipt`, this.receipt)
            }
          })
          .then((response) => {
            if (!response) {
              return
            }
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
      },
      callFileUpload (index) {
        const currentTarget = this.$refs[index]
        if (currentTarget.length > 0) {
          currentTarget[0].click()
        } else {
          currentTarget.click()
        }
      },
      onFileChanged (event, index) {
        const files = event.target.files
        console.log(files)
        for (let i = 0; i < files.length; i++) {
          const formData = new FormData()
          formData.append('file_upload_path', 'receipt')
          formData.append('filedata', files[i])

          this.$http.post(fileUploadApi, formData)
            .then((response) => {
              var responseData = response.data

              if (responseData.code === 200) {
                const imageData = responseData.data
                if (index === 'new') {
                  this.imageList.push({
                    url: imageData.value,
                    memo: ''
                  })
                } else {
                  this.imageList[index] = {
                    url: imageData.value,
                    memo: ''
                  }
                }

                this.$forceUpdate()
              }
            })
            .catch((error) => {
              console.error(error)
            })
        }
      },
      deleteFiles (image) {
        this.imageList = _.without(this.imageList, image)
      }
    },
    mounted () {
      this.loadProceedingContract()
    }
  }
</script>

<style scoped lang="scss">

  table {
    tbody {
      th {
        width:20%;
      }
      img {
        max-width:60%;
      }
    }
  }

  @media screen and (max-width: 768px) {
    table {
      tbody {
        th {
          width:20%;
        }
        img {
          max-width:100%;
        }
      }
    }
  }
</style>
