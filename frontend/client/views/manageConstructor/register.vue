<template>
  <div>
    <div class="tile is-ancestor">
      <div class="tile is-parent">
        <article class="tile is-child box" v-if="isConstructorPage === true">
          <h1 class="title">기본 정보</h1>
          <div class="block">
            <label class="label">이름</label>
            <div class="control">
              <input class="input" type="text" v-model="newData.cr_name" :class="{'is-danger': $v.newData.cr_name.$invalid }"/>
              <p class="help is-danger" v-if="!$v.newData.cr_name.required">이름을 입력해 주십시오.</p>
            </div>
            <label class="label">전화번호</label>
            <div class="control">
              <input class="input" type="text" v-model="newData.cr_contact" :class="{'is-danger': $v.newData.cr_contact.$invalid }"/>
              <p class="help is-danger" v-if="!$v.newData.cr_contact.required">전화번호를 입력해 주십시오.</p>
            </div>
            <label class="label">평점(소통)</label>
            <div class="control">
              <star-rating v-model="newData.cr_communication_score" :show-rating="false" :star-size="35" />
              <p class="help is-danger" v-if="!$v.newData.cr_communication_score.required">평점을 입력해 주십시오.</p>
            </div>
          </div>
          <h1 class="title">보유기술 정보</h1>
          <table class="table">
            <colgroup>
              <col width="5%" />
              <col width="8%" />
              <col width="75%" />
              <col width="15%" />
            </colgroup>
            <thead>
            <tr>
              <th>공사</th>
              <th>평점</th>
              <th>비고</th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(skill, index) in newData.constructorSkillList">
              <td>
                <div class="select">
                  <select v-model="skill.cs_ctpk">
                    <option value="" disabled class="disabled">선택</option>
                    <option v-for="construction in constructionList" :value="construction.ct_pk">{{construction.ct_name}}</option>
                  </select>
                </div>
              </td>
              <td>
                <star-rating v-model="skill.cs_skill_score" :show-rating="false" :star-size="25" />
              <td>
                <textarea class="textarea" v-model="skill.cs_memo"></textarea>
              </td>
              <td>
                <button class="button is-primary" @click="addSkillList">추가</button>
                <button class="button" @click="removeSkillList(item)" v-show="index !== 0">삭제</button>
              </td>
            </tr>
            </tbody>
          </table>
          <p class="control">
            <button class="button is-primary" @click="createData($v.constructor)">등록</button>
            <button class="button is-link" @click="router.back()">취소</button>
          </p>
        </article>
        <article class="tile is-child box" v-else>
          <h1 class="title">기본 정보</h1>
          <div class="block">
            <label class="label">가게명</label>
            <p class="control">
              <input class="input" type="text" v-model="newData.co_name" />
            </p>
            <label class="label">연락처</label>
            <p class="control">
              <input class="input" type="text" v-model="newData.co_contact" />
            </p>
            <label class="label">담당자</label>
            <p class="control">
              <input class="input" type="text" v-model="newData.co_manager_name" />
            </p>
            <label class="label">위치</label>
            <p class="control">
              <input class="input" type="text" v-model="newData.co_location"/>
            </p>
            <label class="label">비고</label>
            <p class="control">
              <textarea class="textarea" v-model="newData.co_memo"></textarea>
            </p>
            <h1 class="title">취급 브랜드</h1>
            <div class="control">
              <table class="table">
                <colgroup>
                  <col width="5%" />
                  <col width="75%" />
                  <col width="15%" />
                </colgroup>
                <thead>
                <tr>
                  <th>자재분류</th>
                  <th>취급 브랜드</th>
                  <th></th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(item, index) in newData.correspondentItemList">
                  <td>
                    <div class="select">
                      <select v-model="item.ci_rcpk">
                        <option value="" disabled class="disabled">선택</option>
                        <option v-for="resourceCategory in resourceCategoryList" :value="resourceCategory.rc_pk">{{resourceCategory.rc_name}}</option>
                      </select>
                    </div>
                  </td>
                  <td>
                    <input class="input" v-model="item.ci_brand"/>
                  </td>
                  <td>
                    <button class="button is-primary" @click="addCorrespondentList">추가</button>
                    <button class="button" @click="removeCorrespondentList(item)" v-show="index !== 0">삭제</button>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p class="control">
            <button class="button is-primary" @click="createData($v.correspondent)">등록</button>
            <button class="button is-link" @click="router.back()">취소</button>
          </p>
        </article>
      </div>
    </div>
  </div>
</template>

<script>
  import _ from 'underscore'
  import router from '../../router'
  import Vue from 'vue'
  import Notification from 'vue-bulma-notification'
  import StarRating from 'vue-star-rating'
  import { required } from 'vuelidate/lib/validators'

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

  const queryApi = '/api'
  const constructionQueryApi = '/api/construction'
  const resourceCategoryQueryApi = '/api/resource/category'

  export default {
    name: 'manageConstructorRegister',
    components: {
      StarRating
    },
    mounted () {
      this.getSelectList()
    },
    data () {
      return {
        router,
        isConstructorPage: false,
        type: '',
        constructionList: [],
        resourceCategoryList: [],
        newData: {
          cr_name: '',
          cr_contact: '',
          co_name: '',
          co_manager_name: '',
          co_location: '',
          co_memo: '',
          cr_communication_score: 0,
          constructorSkillList: [{
            cs_ctpk: '',
            cs_memo: '',
            cs_skill_score: 0
          }],
          correspondentItemList: [{
            ci_rcpk: '',
            ci_brand: ''
          }]
        }
      }
    },
    validations: {
      newData: {
        cr_name: {
          required
        },
        cr_contact: {
          required
        },
        cr_communication_score: {
          required
        },
        co_name: {
          required
        },
        co_contact: {
          required
        },
        co_manager_name: {
          required
        },
        co_location: {
          required
        },
        co_memo: {
          required
        }
      },
      constructor: ['newData.cr_name', 'newData.cr_contact', 'newData.cr_communication_score'],
      correspondent: ['newData.co_name', 'newData.co_contact', 'newData.co_manager_name', 'newData.co_location', 'newData.co_memo']
    },
    created () {
      const url = this.$route.path
      const regexpConstructorPages = /\/manage-constructor\/constructor\//
      if (regexpConstructorPages.test(url)) {
        this.isConstructorPage = true
        this.type = 'constructor'
      } else {
        this.type = 'correspondent'
      }
    },
    methods: {
      getSelectList () {
        this.$http.get(`${constructionQueryApi}`)
          .then((response) => {
            if (response.data.code !== 200) {
              return
            }
            this.constructionList = response.data.data.constructionList
            return this.$http.get(`${resourceCategoryQueryApi}`)
          })
          .then((response) => {
            if (response.data.code !== 200) {
              return
            }
            this.resourceCategoryList = response.data.data.resourceCategoryList
          })
          .catch((error) => {
            console.error(error)
          })
      },
      createData (validator) {
        if (validator.$invalid) {
          return false
        }
        switch (this.type) {
          case 'constructor':
            if (this.newData.constructorSkillList.length === 0) {
              openNotification({
                message: `최소 1개 이상의 보유기술을 등록해 주십시오.`,
                type: 'danger',
                duration: 1500
              })
              return false
            }
            break
          case 'correspondent':
            if (this.newData.correspondentItemList.length === 0) {
              openNotification({
                message: `최소 1개 이상의 취급품목을 등록해 주십시오.`,
                type: 'danger',
                duration: 1500
              })
              return false
            }
            break
        }
        this.$http.post(`${queryApi}/${this.type}`, this.newData)
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            const message = this.isConstructorPage ? '기술자' : '거래처'
            openNotification({
              message: `${message} 정보가 등록되었습니다.`,
              type: 'success',
              duration: 1500
            })
            router.back()
          })
          .catch((error) => {
            console.log(error)
          })
      },
      addSkillList () {
        this.newData.constructorSkillList.push({
          cs_ctpk: '',
          cs_memo: '',
          cs_skill_score: ''
        })
      },
      removeSkillList (item) {
        this.newData.constructorSkillList = _.without(this.newData.constructorSkillList, item)
        this.$forceUpdate()
      },
      addCorrespondentList () {
        this.newData.correspondentItemList.push({
          cs_ctpk: '',
          ci_brand: ''
        })
      },
      removeCorrespondentList (item) {
        this.newData.correspondentItemList = _.without(this.newData.correspondentItemList, item)
        this.$forceUpdate()
      }
    }
  }
</script>

<style scoped>

</style>
