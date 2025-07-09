<div class="flex flex-col md:flex-row h-screen">
  <!-- 왼쪽 영역: 로그인 텍스트 -->
  <div class="md:w-1/2 flex items-center justify-center p-8">
    <div>
      <h1 class="text-4xl font-bold">로그인</h1>
    </div>
  </div>

  <!-- 오른쪽 영역: 로그인 폼 -->
  <div class="md:w-1/2 flex items-center justify-center p-8">
    <fieldset class="fieldset w-full max-w-sm bg-base-200 border border-base-300 p-4 rounded-box items-center justify-center">
      <label class="fieldset-label mt-3 items-center justify-center">학번</label>
      <input type="number" class="input" placeholder="00000" />

      <label class="fieldset-label mt-3 items-center justify-center">이름</label>
      <input type="text" class="input" placeholder="기흥고" />

      <label class="fieldset-label mt-3 items-center justify-center">비밀번호</label>
      <input type="password" class="input" placeholder="개발자도 비밀번호를 볼 수 없어요." />

      <button class="btn btn-neutral mt-4">로그인</button>
    </fieldset>
  </div>
</div>
