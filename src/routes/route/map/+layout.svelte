<script lang="ts">
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

<main class="w-full h-screen flex flex-col items-center justify-center p-4 bg-base-100 font-bold">
  <ul class="menu menu-horizontal bg-base-200 mt-25 mb-5 px-10 rounded-2xl shadow-lg p-4 font-normal">
    <li><a href="./1f/">1층</a></li>
    <li><a href="./2f/">2층</a></li>
    <li><a href="./3f/">3층</a></li>
    <li><a href="./4f/">4층</a></li>
    <li><a href="./5f/">5층</a></li>
  </ul>
  <section
    class="w-full h-screen min-h-9/12 max-w-5xl border-2 border-primary rounded-lg shadow-lg overflow-hidden focus:outline-none focus:ring-4 focus:ring-blue-500/50"
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
      class="w-full h-full cursor-grab bg-stone-50"
      role="img"
      aria-label="층별 약도 상세"
    >
      <slot />
    </svg>
  </section>

  <div class="mt-4 flex flex-wrap justify-center items-center gap-2 text-base-content">
    <div class="flex items-center border border-base-300 rounded-lg">
      <button on:click={() => pan('left')} class="p-2 btn btn-ghost rounded-l-md" aria-label="왼쪽으로 이동">←</button>
      <div class="flex flex-col">
        <button on:click={() => pan('up')} class="p-2 btn btn-ghost" aria-label="위로 이동">↑</button>
        <button on:click={() => pan('down')} class="p-2 btn btn-ghost" aria-label="아래로 이동">↓</button>
      </div>
      <button on:click={() => pan('right')} class="p-2 btn btn-ghost rounded-r-md" aria-label="오른쪽으로 이동">→</button>
    </div>
    <div class="flex items-center border border-base-300 rounded-lg">
      <button on:click={() => zoom('in')} class="p-2 btn btn-ghost font-bold rounded-l-md" aria-label="확대">+</button>
      <button on:click={() => zoom('out')} class="p-2 btn btn-ghost font-bold" aria-label="축소">-</button>
      <button on:click={resetZoom} class="p-2 btn btn-ghost rounded-r-md" aria-label="기본 보기">⟲</button>
    </div>
  </div>
  <br><br><br>

  <div class="mb-25 text-center">Powered by map.hya35.com<br>
  <div class="font-normal">이 기능은 Slat 시간에 기흥고등학교 김정현에 의해 CC0 1.0 Universal(퍼블릭 도메인) 라이선스로 제작 및 배포된 <wbr> 기흥고등학교 약도 SVG 파일과 이것을 열람하기 위한 지도형 뷰어 전체를 별도의 수정 없이 탑제한것입니다.</div></div>
</main>