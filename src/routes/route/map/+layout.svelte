<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';

  const initialViewBox = { x: 0, y: 0, width: 1800, height: 1100 };
  let viewBox = { ...initialViewBox };
  let svgElement: SVGSVGElement | null = null;
  let isPanning = false;
  let startPoint = { x: 0, y: 0 };
  let lastTouchDistance = 0;  

  function getSVGPoint(screenX: number, screenY: number): { x: number; y: number } {
    if (!svgElement) return { x: 0, y: 0 };
    const pt = svgElement.createSVGPoint();
    pt.x = screenX;
    pt.y = screenY;
    const ctm = svgElement.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    return pt.matrixTransform(ctm.inverse());
  }

  function getDistance(p1: Touch, p2: Touch): number {
    return Math.sqrt(Math.pow(p2.clientX - p1.clientX, 2) + Math.pow(p2.clientY - p1.clientY, 2));
  }

  function zoom(direction: 'in' | 'out') {
    const zoomFactor = 1.4;
    const center = { x: viewBox.x + viewBox.width / 2, y: viewBox.y + viewBox.height / 2 };
    let newWidth = direction === 'in' ? viewBox.width / zoomFactor : viewBox.width * zoomFactor;
    let newHeight = newWidth * (initialViewBox.height / initialViewBox.width);
    viewBox = {
      x: center.x - newWidth / 2,
      y: center.y - newHeight / 2,
      width: newWidth,
      height: newHeight,
    };
  }

  function pan(direction: 'left' | 'right' | 'up' | 'down') {
    const panStep = viewBox.width / 10;
    switch(direction) {
      case 'left': viewBox.x -= panStep; break;
      case 'right': viewBox.x += panStep; break;
      case 'up': viewBox.y -= panStep; break;
      case 'down': viewBox.y += panStep; break;
    }
  }

  function resetZoom() {
    viewBox = { ...initialViewBox };
  }

  function handleWheel(event: WheelEvent) {
    event.preventDefault();
    const zoomFactor = 1.1;
    const mousePoint = getSVGPoint(event.clientX, event.clientY);
    let newWidth = event.deltaY < 0 ? viewBox.width / zoomFactor : viewBox.width * zoomFactor;
    let newHeight = newWidth * (initialViewBox.height / initialViewBox.width);
    viewBox = {
      x: mousePoint.x - (mousePoint.x - viewBox.x) * (newWidth / viewBox.width),
      y: mousePoint.y - (mousePoint.y - viewBox.y) * (newHeight / viewBox.height),
      width: newWidth,
      height: newHeight,
    };
  }

  function handleMouseDown(event: MouseEvent) {
    if (event.button !== 0) return;
    isPanning = true;
    startPoint = getSVGPoint(event.clientX, event.clientY);
  }

  function handleMouseUp() {
    isPanning = false;
  }

  function handleMouseMove(event: MouseEvent) {
    if (!isPanning) return;
    const endPoint = getSVGPoint(event.clientX, event.clientY);
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    viewBox = { ...viewBox, x: viewBox.x - dx, y: viewBox.y - dy };
  }

  function handleKeyDown(event: KeyboardEvent) {
    event.preventDefault();
    switch (event.key) {
      case 'ArrowUp': pan('up'); break;
      case 'ArrowDown': pan('down'); break;
      case 'ArrowLeft': pan('left'); break;
      case 'ArrowRight': pan('right'); break;
      case '+': case '=': zoom('in'); break;
      case '-': case '_': zoom('out'); break;
    }
  }

  function handleTouchStart(event: TouchEvent) {
    event.preventDefault();
    if (event.touches.length === 1) {
      isPanning = true;
      startPoint = getSVGPoint(event.touches[0].clientX, event.touches[0].clientY);
    } else if (event.touches.length === 2) {
      isPanning = false;
      lastTouchDistance = getDistance(event.touches[0], event.touches[1]);
    }
  }

  function handleTouchMove(event: TouchEvent) {
    event.preventDefault();
    if (event.touches.length === 1 && isPanning) {
      const endPoint = getSVGPoint(event.touches[0].clientX, event.touches[0].clientY);
      const dx = endPoint.x - startPoint.x;
      const dy = endPoint.y - startPoint.y;
      viewBox = { ...viewBox, x: viewBox.x - dx, y: viewBox.y - dy };
    } else if (event.touches.length === 2) {
      const newTouchDistance = getDistance(event.touches[0], event.touches[1]);
      if (lastTouchDistance === 0) { lastTouchDistance = newTouchDistance; return; }
      const zoomRatio = newTouchDistance / lastTouchDistance;
      const newWidth = viewBox.width / zoomRatio;
      const newHeight = newWidth * (initialViewBox.height / initialViewBox.width);
      const midpointX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
      const midpointY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
      const centerPoint = getSVGPoint(midpointX, midpointY);
      viewBox = {
        x: centerPoint.x - (centerPoint.x - viewBox.x) * (newWidth / viewBox.width),
        y: centerPoint.y - (centerPoint.y - viewBox.y) * (newHeight / viewBox.height),
        width: newWidth,
        height: newHeight,
      };
      lastTouchDistance = newTouchDistance;
    }
  }

  function handleTouchEnd(event: TouchEvent) {
    if (event.touches.length < 2) lastTouchDistance = 0;
    isPanning = event.touches.length === 1;
    if (isPanning) {
      startPoint = getSVGPoint(event.touches[0].clientX, event.touches[0].clientY);
    }
  }
</script>

<svelte:window
  on:mouseup={handleMouseUp}
  on:mouseleave={handleMouseUp}
  on:mousemove={handleMouseMove}
/>

<main class="w-full h-screen flex flex-col items-center justify-center p-4 bg-gray-100 font-bold">
  <div class="text-center mb-4">
    <div class="text-4xl text-black">기흥고 약도</div>
  </div>

  <section
    class="w-full h-screen max-w-5xl border-2 border-blue-400 rounded-lg shadow-lg overflow-hidden focus:outline-none focus:ring-4 focus:ring-blue-500/50"
    class:grabbing={isPanning}
    style="touch-action: none;"
    tabindex="0"
    role="application"
    aria-label="지도 영역"
    on:wheel={handleWheel}
    on:mousedown={handleMouseDown}
    on:keydown={handleKeyDown}
    on:touchstart={handleTouchStart}
    on:touchmove={handleTouchMove}
    on:touchend={handleTouchEnd}
  >
    <svg
      bind:this={svgElement}
      viewBox="{viewBox.x} {viewBox.y} {viewBox.width} {viewBox.height}"
      class="w-full h-full cursor-grab"
      role="img"
      aria-label="층별 약도 상세"
    >
      <slot />
    </svg>
  </section>

  <div class="mt-4 flex flex-wrap justify-center items-center gap-2 text-black">
    <div class="flex items-center border border-gray-300 rounded-lg">
      <button on:click={() => pan('left')} class="p-2 hover:bg-gray-200 rounded-l-md" aria-label="왼쪽으로 이동">←</button>
      <div class="flex flex-col">
        <button on:click={() => pan('up')} class="p-2 border-l border-r border-gray-300 hover:bg-gray-200" aria-label="위로 이동">↑</button>
        <button on:click={() => pan('down')} class="p-2 border-t border-l border-r border-gray-300 hover:bg-gray-200" aria-label="아래로 이동">↓</button>
      </div>
      <button on:click={() => pan('right')} class="p-2 hover:bg-gray-200 rounded-r-md" aria-label="오른쪽으로 이동">→</button>
    </div>
    <div class="flex items-center border border-gray-300 rounded-lg">
      <button on:click={() => zoom('in')} class="p-2 font-bold hover:bg-gray-200 rounded-l-md" aria-label="확대">+</button>
      <button on:click={() => zoom('out')} class="p-2 font-bold border-l border-r border-gray-300 hover:bg-gray-200" aria-label="축소">-</button>
      <button on:click={resetZoom} class="p-2 hover:bg-gray-200 rounded-r-md" aria-label="기본 보기">⟲</button>
    </div>
  </div>
  <br><br><br>
</main>

<div class="dock dock-lg">
  
  <!-- 1층 링크 -->
  {#if $page.url.pathname.startsWith('/1f')}
    <!-- 현재 경로가 /1f로 시작하면 'dock-active' 클래스를 추가합니다. -->
    <a href="/1f" class="dock-active">
      <div class="size-[1.2em]">🚪</div>
      <span class="dock-label">1층</span>
    </a>
  {:else}
    <!-- 그렇지 않으면 일반 링크를 표시합니다. -->
    <a href="/1f">
      <div class="size-[1.2em]">🚪</div>
      <span class="dock-label">1층</span>
    </a>
  {/if}

  <!-- 2층 링크 -->
  {#if $page.url.pathname.startsWith('/2f')}
    <a href="/2f" class="dock-active">
      <div class="size-[1.2em]">🎒</div>
      <span class="dock-label">2층</span>
    </a>
  {:else}
    <a href="/2f">
      <div class="size-[1.2em]">🎒</div>
      <span class="dock-label">2층</span>
    </a>
  {/if}

  <!-- 3층 링크 -->
  {#if $page.url.pathname.startsWith('/3f')}
    <a href="/3f" class="dock-active">
      <div class="size-[1.2em]">📒</div>
      <span class="dock-label">3층</span>
    </a>
  {:else}
    <a href="/3f">
      <div class="size-[1.2em]">📒</div>
      <span class="dock-label">3층</span>
    </a>
  {/if}

  <!-- 4층 링크 -->
  {#if $page.url.pathname.startsWith('/4f')}
    <a href="/4f" class="dock-active">
      <div class="size-[1.2em]">✏️</div>
      <span class="dock-label">4층</span>
    </a>
  {:else}
    <a href="/4f">
      <div class="size-[1.2em]">✏️</div>
      <span class="dock-label">4층</span>
    </a>
  {/if}

  <!-- 5층 링크 -->
  {#if $page.url.pathname.startsWith('/5f')}
    <a href="/5f" class="dock-active">
      <div class="size-[1.2em]">📔</div>
      <span class="dock-label">5층</span>
    </a>
  {:else}
    <a href="/5f">
      <div class="size-[1.2em]">📔</div>
      <span class="dock-label">5층</span>
    </a>
  {/if}

</div>