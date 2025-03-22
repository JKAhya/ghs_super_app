<script>
	import '../app.css';
	let { children } = $props();
</script>

{@render children()}

<div class="dock dock-xl">
    <button>
      <span class="icon size-[1.2em]">🏫</span>
      <span class="dock-label">학교</span>
    </button>
    <button>
      <span class="icon size-[1.2em]">🚇</span>
      <span class="dock-label">등교</span>
    </button>
    <!--<button class="dock-active">-->
    <button>
      <span class="icon size-[1.2em]">🏠</span>
      <span class="dock-label">홈</span>
    </button>
    <button>
      <span class="icon size-[1.2em]">🤩</span>
      <span class="dock-label">일상</span>
    </button>
    <button>
      <span class="icon size-[1.2em]">📑</span>
      <span class="dock-label">전체</span>
    </button>
</div>