<script>
  import '../app.css';
  import { onMount } from 'svelte';
  let { children } = $props();

  import { page } from '$app/state'

  let currentUrl = $derived(page.url.href);
</script>

{#if currentUrl.includes("home")}
  <div class="flex justify-center w-screen">
    <div class="text-lg mt-20 w-38 text-center text-cyan-600 bg-zinc-100 subpixel-antialiased rounded-xl">📍기흥고등학교</div>
  </div>
  <div class="text-3xl pt-1 pb-10 text-center font-bold">생활정보 모아보기</div>
{:else}
  <div class="text-xs text-center ml-5 mt-4 w-32 text-cyan-700 bg-zinc-100 subpixel-antialiased rounded-xl">📍기흥고등학교</div>
  <div class="text-xl pl-5 pb-7 text-zinc-700 ont-bold">생활정보 모아보기</div>
{/if}

{@render children()}

<div class="dock dock-xl rounded-xl">
  <a href="/school" class:dock-active={currentUrl.includes("school")}>
    <span class="icon size-[1.55em]">
      <div class="text-2xl">🏫</div>
    </span>
    <span class="dock-label">
      <div class="text-sm">학교</div>
    </span>
  </a>

  <a href="/route" class:dock-active={currentUrl.includes("route")}>
    <span class="icon size-[1.55em]">
      <div class="text-2xl">🚇</div>
    </span>
    <span class="dock-label">
      <div class="text-sm">등하교</div>
    </span>
  </a>

  <a href="/home" class:dock-active={currentUrl.includes("home")}>
    <span class="icon size-[1.55em]">
      <div class="text-2xl">⭐</div>
    </span>
    <span class="dock-label">
      <div class="text-sm">즐겨찾기</div>
    </span>
  </a>

  <a href="/life" class:dock-active={currentUrl.includes("life")}>
    <span class="icon size-[1.55em]">
      <div class="text-2xl">🖋️</div>
    </span>
    <span class="dock-label">
      <div class="text-sm">생활정보</div>
    </span>
  </a>

  <a href="/list" class:dock-active={currentUrl.includes("list")}>
    <span class="icon size-[1.55em]">
      <div class="text-2xl">📑</div>
    </span>
    <span class="dock-label">
      <div class="text-sm">전체</div>
    </span>
  </a>
</div>
