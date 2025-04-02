<script>
	import '../app.css';
	let { children } = $props();
</script>

<script>
  
</script>

{@render children()}

<div class="dock dock-xl rounded-xl">
    <a href="/school">
      <span class="icon size-[1.8em]"><div class="text-2xl">🏫</div></span>
      <span class="dock-label"><div class="text-sm">학교</div></span>
    </a>
    <a href="">
      <span class="icon size-[1.8em]"><div class="text-2xl">🚇</div></span>
      <span class="dock-label"><div class="text-sm">등하교</div></span>
    </a>
    <!--<button class="dock-active">-->
    <a href="/home">
      <span class="icon size-[1.8em]"><div class="text-2xl">⭐</div></span>
      <span class="dock-label"><div class="text-sm">즐겨찾기</div></span>
    </a>
    <a href="">
      <span class="icon size-[1.8em]"><div class="text-2xl">🖋️</div></span>
      <span class="dock-label"><div class="text-sm">생활정보</div></span>
    </a>
    <a href="/list">
      <span class="icon size-[1.8em]"><div class="text-2xl">📑</div></span>
      <span class="dock-label"><div class="text-sm">전체</div></span>
    </a>
</div>