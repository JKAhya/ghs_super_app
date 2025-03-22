<script>
	import '../app.css';
	let { children } = $props();
</script>

{@render children()}

<div class="dock dock-xl">
    <a href="">
      <span class="icon size-[1.2em]">🏫</span>
      <span class="dock-label">학교</span>
    </a>
    <a href="">
      <span class="icon size-[1.2em]">🚇</span>
      <span class="dock-label">등교</span>
    </a>
    <!--<button class="dock-active">-->
    <a href="/home">
      <span class="icon size-[1.2em]">🏠</span>
      <span class="dock-label">홈</span>
    </a>
    <a href="">
      <span class="icon size-[1.2em]">🤩</span>
      <span class="dock-label">일상</span>
    </a>
    <a href="/list">
      <span class="icon size-[1.2em]">📑</span>
      <span class="dock-label">전체</span>
    </a>
</div>