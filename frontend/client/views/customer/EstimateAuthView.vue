<template>
  <modal name="estimateAuthView" :classes="['estimate-auth-view']" :width="450" :height="'auto'" :clickToClose="false" @before-close="beforeCloseEvent">
    <div class="modal-card-head">
      <h1 class="modal-card-title">비밀번호 입력</h1>
    </div>
    <div class="modal-card-body">
      <p class="info">상세 견적서 확인을 위해<br />휴대전화 번호와 비밀번호를 입력해 주세요.</p>
      <div class="input-wrapper">
        <div class="control has-icon">
          <input class="input" type="tel" placeholder="휴대전화 번호" v-model="userData.phone">
          <span class="icon is-small is-left">
            <i class="fa fa-mobile"></i>
          </span>
        </div>
        <div class="control has-icon">
          <input class="input" type="password" placeholder="비밀번호" v-model="userData.password">
          <span class="icon is-small is-left">
            <i class="fa fa-key"></i>
          </span>
        </div>
      </div>
      <div class="button-wrapper">
        <button class="button" @click="userAuth">확인</button>
      </div>
    </div>
  </modal>
</template>

<script>
  const api = '/api/contract/pk'

  export default {
    name: 'estimate-auth-view',
    components: {
    },
    props: {
      beforeClose: Function,
      isCloseModal: Boolean
    },
    data () {
      return {
        userData: {
          phone: '',
          password: ''
        },
        pc_pk: ''
      }
    },
    methods: {
      beforeCloseEvent () {
        this.$emit('changeCloseModalStatus', {
          closeStatus: true,
          pc_pk: this.pc_pk
        })
      },
      userAuth () {
        this.userData.phone = this.userData.phone.replace(/-/gi, '')
        this.$http.post(`${api}`, this.userData)
          .then((response) => {
            if (response.data.code !== 200) {
              window.alert('일치하는 계약이 존재하지 않습니다.')
              return false
            }
            this.pc_pk = response.data.data.pc_pk
            this.$modal.hide('estimateAuthView')
          })
      }
    }
  }
</script>
<style lang="scss">
  @media screen and (max-width: 768px) {
    .modal-card-body {
      .input-wrapper {
        padding: 0 2rem !important;
      }
    }
    .estimate-auth-view {
      width:300px !important;
      left: calc(50% - (150px)) !important;
    }
  }
</style>

<style lang="scss" scoped>
  .modal-card-head {
    background-image: linear-gradient(330deg, #9daeff, #82befd);
    h1 {
      color: white;
      text-align: center;
    }
  }
  .modal-card-body {
    p {
      text-align: center;
      font-size: 15px;
      font-weight: bold;
    }

    .input-wrapper {
      padding: 0 4.5rem;
      margin: 2rem 0 2rem 0;
    }

    .button-wrapper {
      text-align: center;
      button {
        border-radius: 19px;
        background-image: linear-gradient(330deg, #9daeff, #82befd);
        height: 38px;
        width: 92px;
        color: white;
        font-size:1.15rem;
      }
    }
  }
  .v--modal-overlay {
    width: calc(100%);
  }
</style>
