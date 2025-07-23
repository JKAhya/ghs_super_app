<script>
  import '../app.css';
  import { onMount } from 'svelte';
  let { children } = $props();

  import { page } from '$app/state'

  let currentUrl = $derived(page.url.href);
</script>

{#if currentUrl.includes("home")}
  <div class="flex justify-center w-screen">
    <div class="text-lg mt-20 w-38 text-center text-primary bg-base-200 subpixel-antialiased rounded-xl">📍기흥고등학교</div>
    <div class="text-lg mt-20 w-38 text-center text-primary bg-base-200 subpixel-antialiased rounded-xl">📍기흥고등학교</div>
  </div>
  <div class="text-3xl pt-1 pb-10 text-center font-bold">생활정보 모아보기</div>
{:else}
  <div class="text-xs text-center ml-5 mt-4 w-32 text-primary bg-base-200 subpixel-antialiased rounded-xl">📍기흥고등학교</div>
  <div class="text-xl pl-5 pb-7 text-primary-content ont-bold">생활정보 모아보기</div>
  <div class="text-xs text-center ml-5 mt-4 w-32 text-primary bg-base-200 subpixel-antialiased rounded-xl">📍기흥고등학교</div>
  <div class="text-xl pl-5 pb-7 text-primary-content ont-bold">생활정보 모아보기</div>
{/if}

{@render children()}

<br><br><br><br><br>

<div class="dock dock-xl py-10 px-10 rounded-xl">
  <a href="/school" class:dock-active={currentUrl.includes("school")}>
    <span class="icon size-[1.55em]">
      <div class="text-2xl">🏫</div>
    </span>
    <span class="dock-label">
      <div class="text-sm">학교</div>
    </span>
  </a>

  <a href="https://ghsmap.hya35.com/1f/" class:dock-active={currentUrl.includes("route")}>
    <span class="icon size-[1.55em]">
      <div class="text-2xl">🧭</div>
    </span>
    <span class="dock-label">
      <div class="text-sm">약도</div>
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
