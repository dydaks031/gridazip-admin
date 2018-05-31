<template>
  <div>
    <div class="tile is-ancestor">
      <div class="tile is-parent">
        <article class="tile is-child box">
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
    name: 'manageConstructorIdDetail'
  }
</script>

<style scoped>

</style>
