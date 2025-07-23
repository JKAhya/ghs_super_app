<style>
  @keyframes noticeScroll {
    0% { transform: translateY(100%); opacity: 0; }
    10% { transform: translateY(0); opacity: 1; }
    30% { transform: translateY(0); opacity: 1; }
    40% { transform: translateY(-100%); opacity: 0; }
    100% { transform: translateY(-100%); opacity: 0; }
  }

  .notice-wrapper {
    height: 1.5rem; /* 공지 높이 고정 */
    overflow: hidden;
    position: relative;
  }

  .notice-item {
    position: absolute;
    width: 100%;
    animation: noticeScroll 9s linear infinite;
    animation-fill-mode: both; /* ← 추가 */
  }

  .notice-item:nth-child(1) {
    animation-delay: 0s; /* ← 명시 */
  }

  .notice-item:nth-child(2) {
    animation-delay: 3s;
  }

  .notice-item:nth-child(3) {
    animation-delay: 6s;
  }
</style>

<!-- 로그인 상단 -->
<div class="flex justify-center items-center w-screen px-5 py-2">
  <div class="w-full max-w-4xl mx-auto bg-base-200 rounded-box px-5 py-5 flex flex-col items-start gap-4">
    <div class="flex items-center gap-4 w-full">
      <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">U</div>
      <div class="flex-1 text-lg font-medium">
        환영합니다, <span class="text-primary font-semibold">홍길동</span>님!  
        <br><span class="text-sm text-gray-500">0000학년도 0학년 00반 00번</span>
      </div>
    </div>
    <div class="flex flex-row gap-2 w-full">
      <button class="btn btn-sm btn-outline btn-primary flex-1">계정관리</button>
      <button class="btn btn-sm btn-outline btn-primary flex-1">로그아웃</button>
    </div>
  </div>
</div>

<!-- ✅ 공지사항 슬라이드 (애니메이션 개선 적용됨) -->
<div class="notice-wrapper max-w-4xl mx-auto mt-2 px-4 text-sm text-gray-600 font-medium">
  <div class="notice-item">[공지] 곧 여름방학입니다. 2학기에 다시 만나요!</div>
  <div class="notice-item">[공지] 기흥고 생활정보 보아보기 이용 안내</div>
  <div class="notice-item">[공지] 역대급 연휴인 이번 추석, 기말고사 직전이다?</div>
</div>

<!-- 즐겨찾기 제목 중앙 정렬 -->
<div class=" mt-5 text-center text-xl font-semibold">즐겨찾기</div>

<!-- 이하 기존 코드 유지 -->
<div class="flex justify-center items-center w-screen px-5 py-1">
  <div class="w-full max-w-4xl bg-base-200 rounded-box text-lg p-4">
    <div class="grid grid-cols-3 gap-4">
      <a href="/timetable" class="bg-base-300 rounded-xl text-center py-6 text-xl hover:bg-base-100 transition">시간표</a>
      <a href="/meals" class="bg-base-300 rounded-xl text-center py-6 text-xl hover:bg-base-100 transition">급식</a>
      <a href="/menu" class="bg-base-300 rounded-xl text-center py-6 text-xl hover:bg-base-100 transition">메뉴판</a>
      <a href="/calendar" class="bg-base-300 rounded-xl text-center py-6 text-xl hover:bg-base-100 transition">학사일정</a>
      <a href="/grades" class="bg-base-300 rounded-xl text-center py-6 text-xl hover:bg-base-100 transition">성적조회</a>
      <a href="/notice" class="bg-base-300 rounded-xl text-center py-6 text-xl hover:bg-base-100 transition">공지사항</a>
    </div>
  </div>
</div>

<!-- 아래에 동일한 즐겨찾기 박스 한 줄 더 추가 -->
<div class="text-base mt-10 text-center text-xl font-semibold">최근 열람</div>

<div class="flex justify-center items-center w-screen px-5 py-1">
  <div class="w-full max-w-4xl bg-base-200 rounded-box text-lg p-4">
    <div class="grid grid-cols-3 gap-4">
      <a class="bg-base-300 rounded-xl text-center py-6 text-xl hover:bg-base-100 transition">교내 지도</a>
      <a href="/clubs" class="bg-base-300 rounded-xl text-center py-6 text-xl hover:bg-base-100 transition">계정관리</a>
      <a href="/library" class="bg-base-300 rounded-xl text-center py-6 text-xl hover:bg-base-100 transition">기상정보</a>
    </div>
  </div>
</div>