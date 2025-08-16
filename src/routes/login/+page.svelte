<div class="flex h-screen flex-col md:flex-row">
	<!-- 왼쪽 영역: 로그인 텍스트 -->
	<div class="flex items-center justify-center p-8 md:w-1/2">
		<div>
			<h1 class="text-4xl font-bold">로그인</h1>
		</div>
	</div>

	<!-- 오른쪽 영역: 로그인 폼 -->
	<div class="flex items-center justify-center p-8 md:w-1/2">
		<fieldset
			class="fieldset bg-base-200 border-base-300 rounded-box w-full max-w-sm items-center justify-center border p-4"
		>
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
