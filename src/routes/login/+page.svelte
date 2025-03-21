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
      <label class="fieldset-label items-center justify-center">Email</label>
      <input type="email" class="input" placeholder="Email" />

      <label class="fieldset-label mt-4 items-center justify-center">Password</label>
      <input type="password" class="input" placeholder="Password" />

      <button class="btn btn-neutral mt-4">Login</button>
    </fieldset>
  </div>
</div>
