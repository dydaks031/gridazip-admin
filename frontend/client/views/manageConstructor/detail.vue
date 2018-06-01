<template>
  <div>
    <div class="tile is-ancestor">
      <div class="tile is-parent">
        <article class="tile is-child box" v-if="isConstructorPage === true">
          <div class="block">
            <label class="label">이름</label>
            <p class="control">
              <input class="input" type="text" />
            </p>
            <label class="label">전화번호</label>
            <p class="control">
              <input class="input" type="text" />
            </p>
            <label class="label">비고</label>
            <p class="control">
              <input class="input" type="text" />
            </p>
            <table class="table">
              <thead>
                <tr>
                  <th>공사</th>
                  <th>실력</th>
                  <th>소통</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>가스</td>
                  <td>4.5</td>
                  <td>4.5</td>
                </tr>
              </tbody>
            </table>
            <p class="control">
              <button class="button is-primary">등록</button>
              <button class="button is-link">Cancel</button>
            </p>
          </div>
        </article>
        <article class="tile is-child box" v-else>
          <div class="block">
            <label class="label">가게명</label>
            <p class="control">
              <input class="input" type="text" />
            </p>
            <label class="label">유선번호</label>
            <p class="control">
              <input class="input" type="text" />
            </p>
            <label class="label">담당자</label>
            <p class="control">
              <input class="input" type="text" />
            </p>
            <label class="label">담당자 휴대폰</label>
            <p class="control">
              <input class="input" type="text" />
            </p>
            <label class="label">취급브랜드</label>
            <p class="control">
              <textarea class="textarea">
              </textarea>
            </p>
            <label class="label">위치</label>
            <p class="control">
              <input class="input" type="text" />
            </p>
            <label class="label">비고</label>
            <p class="control">
              <textarea class="textarea" ></textarea>
            </p>
            <p class="control">
              <button class="button is-primary">등록</button>
              <button class="button is-link">Cancel</button>
            </p>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'manageConstructorIdDetail',
    data () {
      return {
        isConstructorPage: false
      }
    },
    created () {
      const url = this.$route.path
      const regexpConstructorPages = /\/manage-constructor\/constructor\//
      if (regexpConstructorPages.test(url)) {
        this.isConstructorPage = true
        // this.$route.name = '거래처 상세'
      }
      console.log(this.isConstructorPage)
    }
  }
</script>

<style scoped>

</style>
