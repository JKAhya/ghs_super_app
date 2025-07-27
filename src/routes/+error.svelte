<script>
	import { page } from '$app/stores';
</script>
<div class="flex justify-center items-center pt-10 gap-6">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-[80px]">
    <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
  </svg>
  <div class="text-8xl font-black text-center">
    {$page.status}
  </div>
</div>
<div class="text-3xl font-bold text-center pt-5">{$page.error.message}</div>
<div class="divider px-15"></div>
<div class="text-base text-center">사이트에서 오류가 발생했습니다.<br>
의도된 동작일 수도 있으나, 예기치 못한 오류일 가능성도 있습니다.<br>
오류가 발생한 사실은 자동으로 기록 및 통보되오니, 
이전 페이지로 돌아가셔도 좋습니다. <br> 또는, <a class="link" href="https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status/{$page.status}">여기서</a>
자세한 설명을 읽어보실 수 있습니다.<br></div>

<div class="text-error mt-10 text-center">계속 오류가 발생하거나, 500번대 오류가 발생하는 경우, 혹은 Unexpected Error가 발생하는 경우, <br>
서버에 장애가 발생했을 가능성이 높습니다. 이 경우, 시스템 관리자에게 문의해 주시기 바랍니다.</div>

<div class="flex justify-center w-full">
  <a class="btn btn-primary btn-wide mt-10 font-normal" href="javascript:history.back()">이전 페이지로</a></div>


<div class="flex justify-center items-center w-full mt-8">
  <img
    src="https://http.cat/{$page.status}.jpg"
    alt="HTTP Cat {$page.status}"
    class="rounded-4xl"
  />
</div>