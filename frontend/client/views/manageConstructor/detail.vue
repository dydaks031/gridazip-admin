<template>
  <div>
    <div class="tile is-ancestor">
      <div class="tile is-parent">
        <article class="tile is-child box" v-if="isConstructorPage === true">
          <h1 class="title">기본 정보</h1>
          <div class="block">
            <label class="label">이름</label>
            <div class="control">
              <input class="input" type="text" v-model="data.constructor.cr_name" :class="{'is-danger': $v.data.constructor.cr_name.$invalid }"/>
              <p class="help is-danger" v-if="!$v.data.constructor.cr_name.required">이름을 입력해 주십시오.</p>
            </div>
            <label class="label">연락처</label>
            <div class="control">
              <input class="input" type="text" v-model="data.constructor.cr_contact" :class="{'is-danger': $v.data.constructor.cr_contact.$invalid }"/>
              <p class="help is-danger" v-if="!$v.data.constructor.cr_contact.required">연락처를 입력해 주십시오.</p>
            </div>
            <label class="label">평점</label>
            <div class="control">
              <star-rating v-model="data.constructor.cr_communication_score" :show-rating="false" :star-size="35"></star-rating>
            </div>
            <p class="control">
              <button class="button is-primary" @click="updateConstructor($v.constructor)">수정</button>
              <button class="button is-link" @click="router.back()">취소</button>
              <button class="button is-danger is-pulled-right" @click="deleteItem">삭제</button>
            </p>
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
              <tr v-for="item in data.constructorSkillList">
                <td>
                  <span v-if="!item.isModify">{{item.ct_name}}</span>
                  <div class="select" v-if="item.isModify">
                    <select v-model="item.ct_pk">
                      <option value="" disabled class="disabled">선택</option>
                      <option v-for="construction in constructionList" :value="construction.ct_pk">{{construction.ct_name}}</option>
                    </select>
                  </div>
                </td>
                <td>
                  <star-rating v-model="item.cs_skill_score" :show-rating="false" :star-size="25" :read-only="!item.isModify" />
                </td>
                <td>
                  <span v-if="!item.isModify">{{item.cs_memo}}</span>
                  <textarea class="textarea" v-model="item.cs_memo" v-if="item.isModify"></textarea>
                </td>
                <td class="has-text-centered is-vertical-middle">
                  <button class="button" @click="toggleRow(item)" v-if="!item.isModify">수정</button>
                  <button class="button" @click="deleteSkillRow(item)" v-if="!item.isModify">삭제</button>
                  <button class="button" @click="sendSkillUpdateRow(item)" v-if="item.isModify">확인</button>
                  <button class="button" @click="toggleRow(item)" v-if="item.isModify">취소</button>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="select">
                    <select v-model="newData.ct_pk">
                      <option value="" disabled class="disabled">선택</option>
                      <option v-for="construction in constructionList" :value="construction.ct_pk">{{construction.ct_name}}</option>
                    </select>
                  </div>
                </td>
                <td>
                  <star-rating v-model="newData.cs_skill_score" :show-rating="false" :star-size="25" />
                <td>
                  <textarea class="textarea" v-model="newData.cs_memo"></textarea>
                </td>
                <td class="has-text-centered is-vertical-middle">
                  <button class="button" @click="createSkillRow">등록</button>
                  <button class="button" @click="newData = {}">취소</button>
                </td>
              </tr>
            </tbody>
          </table>
        </article>
        <article class="tile is-child box" v-else>
          <h1 class="title">기본 정보</h1>
          <div class="block">
            <label class="label">상호명</label>
            <div class="control">
              <input class="input" type="text" v-model="data.correspondent.co_name" :class="{'is-danger': $v.data.correspondent.co_name.$invalid }"/>
              <p class="help is-danger" v-if="!$v.data.correspondent.co_name.required">상호명을 입력해 주십시오.</p>
            </div>
            <label class="label">연락처</label>
            <div class="control">
              <input class="input" type="text" v-model="data.correspondent.co_contact" :class="{'is-danger': $v.data.correspondent.co_contact.$invalid }"/>
              <p class="help is-danger" v-if="!$v.data.correspondent.co_contact.required">연락처를 입력해 주십시오.</p>
            </div>
            <label class="label">담당자</label>
            <div class="control">
              <input class="input" type="text" v-model="data.correspondent.co_manager_name" :class="{'is-danger': $v.data.correspondent.co_manager_name.$invalid }"/>
              <p class="help is-danger" v-if="!$v.data.correspondent.co_manager_name.required">담당자를 입력해 주십시오.</p>
            </div>
            <label class="label">위치</label>
            <div class="control">
              <input class="input" type="text" v-model="data.correspondent.co_location" :class="{'is-danger': $v.data.correspondent.co_location.$invalid }"/>
              <p class="help is-danger" v-if="!$v.data.correspondent.co_location.required">위치를 입력해 주십시오.</p>
            </div>
            <label class="label">비고</label>
            <div class="control">
              <textarea class="textarea" v-model="data.correspondent.co_memo"></textarea>
            </div>
            <p class="control">
              <button class="button is-primary" @click="updateCorrespondent($v.correspondent)">수정</button>
              <button class="button is-link">취소</button>
              <button class="button is-danger is-pulled-right" @click="deleteItem">삭제</button>
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
                <tr v-for="item in data.correspondentItemList">
                  <td>
                    <span v-if="!item.isModify">{{item.rc_name}}</span>
                    <div class="select" v-if="item.isModify">
                      <select v-model="item.rc_pk">
                        <option value="" disabled class="disabled">선택</option>
                        <option v-for="resourceCategory in resourceCategoryList" :value="resourceCategory.rc_pk">{{resourceCategory.rc_name}}</option>
                      </select>
                    </div>
                  </td>
                  <td>
                    <span v-if="!item.isModify">{{item.ci_brand}}</span>
                    <input class="input" v-model="item.ci_brand" v-if="item.isModify"/>
                  </td>

                  <td class="has-text-centered is-vertical-middle">
                    <button class="button" @click="toggleRow(item)" v-if="!item.isModify">수정</button>
                    <button class="button" @click="deleteBrandRow(item)" v-if="!item.isModify">삭제</button>
                    <button class="button" @click="sendBrandUpdateRow(item)" v-if="item.isModify">확인</button>
                    <button class="button" @click="toggleRow(item)" v-if="item.isModify">취소</button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="select">
                      <select v-model="newData.rc_pk">
                        <option value="" disabled class="disabled">선택</option>
                        <option v-for="resourceCategory in resourceCategoryList" :value="resourceCategory.rc_pk">{{resourceCategory.rc_name}}</option>
                      </select>
                    </div>
                  </td>
                  <td>
                    <input class="input" v-model="newData.ci_brand"/>
                  </td>
                  <td class="has-text-centered is-vertical-middle">
                    <button class="button" @click="createBrandRow">등록</button>
                    <button class="button" @click="newData = {}">취소</button>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script>
  import router from '../../router'
  import _ from 'underscore'
  import deepClone from '../../services/deepClone'
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
    name: 'manageConstructorIdDetail',
    components: {
      StarRating
    },
    data () {
      return {
        isConstructorPage: false,
        id: '',
        type: '',
        data: {
          constructor: {},
          correspondent: {}
        },
        constructionList: [],
        resourceCategoryList: [],
        newData: {
          ct_pk: '',
          cs_skill_score: 0,
          cs_memo: '',
          rc_pk: ''
        },
        router
      }
    },
    validations: {
      data: {
        constructor: {
          cr_name: {
            required
          },
          cr_contact: {
            required
          }
        },
        correspondent: {
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
          }
        }
      },
      constructor: ['data.constructor.cr_name', 'data.constructor.cr_contact'],
      correspondent: ['data.correspondent.co_name', 'data.correspondent.co_contact', 'data.correspondent.co_manager_name', 'data.correspondent.co_location']
    },
    methods: {
      loadData () {
        this.$http.get(`${queryApi}/${this.type}/${this.id}`)
        .then((response) => {
          if (response.data.code !== 200) {
            router.back()
          }
          this.$nextTick(() => {
            this.data = response.data.data
          })
          this.$forceUpdate()
        }).catch((error) => {
          console.log(error)
        })
      },
      toggleRow (item) {
        item.isModify = !item.isModify
        this.$forceUpdate()
      },
      updateConstructor (validator) {
        if (validator.$invalid) {
          return false
        }
        this.$http.put(`${queryApi}/${this.type}/${this.id}`, this.data.constructor)
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }

            openNotification({
              message: '기술자 정보가 수정되었습니다.',
              type: 'success',
              duration: 1500
            })
          })
          .catch((error) => {
            console.log(error)
          })
      },
      createSkillRow () {
        this.$http.post(`${queryApi}/${this.type}/${this.id}/skill`, this.newData)
          .then((response) => {
            console.log(response)
            if (response.data.code !== 200) {
              return false
            }
            const data = response.data.data.data
            const insertData = deepClone(this.newData)
            const constructionName = _.find(this.constructionList, (item) => {
              return item.ct_pk === data.cs_ctpk
            })

            insertData.cs_pk = data.cs_pk
            insertData.ct_name = constructionName.ct_name
            console.log(insertData)
            this.data.constructorSkillList.push(insertData)
            this.newData = {}

            openNotification({
              message: '기술 정보가 추가되었습니다.',
              type: 'success',
              duration: 1500
            })
          })
          .catch((error) => {
            console.error(error)
          })
      },
      sendSkillUpdateRow (item) {
        this.$http.put(`${queryApi}/${this.type}/${this.id}/skill/${item.cs_pk}`, item)
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            const construction = _.find(this.constructionList, (_construction) => {
              return _construction.ct_pk === item.ct_pk
            })

            item.isModify = false
            item.ct_name = construction.ct_name
            openNotification({
              message: '기술 정보가 수정되었습니다.',
              type: 'success',
              duration: 1500
            })
            this.$forceUpdate()
          })
          .catch((error) => {
            console.error(error)
          })
      },
      deleteSkillRow (item) {
        this.$http.delete(`${queryApi}/${this.type}/${this.id}/skill/${item.cs_pk}`)
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            this.data.constructorSkillList = _.without(this.data.constructorSkillList, item)
            openNotification({
              message: '기술 정보가 삭제되었습니다.',
              type: 'success',
              duration: 1500
            })
            this.$forceUpdate()
          })
          .catch((error) => {
            console.error(error)
          })
      },
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
      updateCorrespondent (validator) {
        if (validator.$invalid) {
          return false
        }
        this.$http.put(`${queryApi}/${this.type}/${this.id}`, this.data.correspondent)
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }

            openNotification({
              message: '거래처 정보가 수정되었습니다.',
              type: 'success',
              duration: 1500
            })
          })
          .catch((error) => {
            console.log(error)
          })
      },
      createBrandRow () {
        this.$http.post(`${queryApi}/${this.type}/${this.id}/item`, this.newData)
          .then((response) => {
            console.log(response)
            if (response.data.code !== 200) {
              return false
            }
            const data = response.data.data.data
            const insertData = deepClone(this.newData)
            const resourceCategoryName = _.find(this.resourceCategoryList, (item) => {
              return item.rc_pk === data.ci_rcpk
            })
            insertData.ci_pk = data.ci_pk
            insertData.rc_name = resourceCategoryName.rc_name
            console.log(insertData)
            this.data.correspondentItemList.push(insertData)
            openNotification({
              message: '취급 브랜드 정보가 추가되었습니다.',
              type: 'success',
              duration: 1500
            })
          })
          .catch((error) => {
            console.error(error)
          })
      },
      sendBrandUpdateRow (item) {
        this.$http.put(`${queryApi}/${this.type}/${this.id}/item/${item.ci_pk}`, item)
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            const resourceCategory = _.find(this.resourceCategoryList, (_resourceCategory) => {
              return _resourceCategory.rc_pk === item.rc_pk
            })
            item.isModify = false
            item.rc_name = resourceCategory.rc_name
            openNotification({
              message: '취급 브랜드 정보가 변경되었습니다.',
              type: 'success',
              duration: 1500
            })
            this.$forceUpdate()
          })
          .catch((error) => {
            console.error(error)
          })
      },
      deleteBrandRow (item) {
        this.$http.delete(`${queryApi}/${this.type}/${this.id}/item/${item.ci_pk}`)
          .then((response) => {
            if (response.data.code !== 200) {
              return false
            }
            this.data.correspondentItemList = _.without(this.data.correspondentItemList, item)
            this.$forceUpdate()
            openNotification({
              message: '취급 브랜드 정보가 삭제되었습니다.',
              type: 'success',
              duration: 1500
            })
          })
          .catch((error) => {
            console.error(error)
          })
      },
      deleteItem () {
        if (window.confirm('정말 삭제하시겠습니까?')) {
          let message = ''
          switch (this.type) {
            case 'constructor':
              message = '기술자'
              break
            case 'correspondent':
              message = '거래처'
              break
          }

          this.$http.delete(`${queryApi}/${this.type}/${this.id}`)
            .then((response) => {
              if (response.data.code !== 200) {
                return false
              }
              openNotification({
                message: `${message} 정보가 삭제되었습니다.`,
                type: 'success',
                duration: 1500
              })

              router.back()
            })
            .catch((error) => {
              console.error(error)
            })
        }
      }
    },
    mounted () {
      this.id = this.$route.params.id
      if (!this.id) {
        router.back()
      }
      this.loadData()
      this.getSelectList()
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
    }
  }
</script>

<style scoped>
  .is-vertical-middle {
    vertical-align: middle;
  }
</style>
