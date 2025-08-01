  <!-- 오늘의 정보 박스 -->
  <script lang="ts">
    import { onMount } from 'svelte';
    let weather: string = 'Now loading...';
    let temp: string = '위치 정보 필요';
    let icon: string = '⏳';
    let loading = true;

    export let data;

    const KOR_WEEKDAYS = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];

    let today = new Date();
    let weekday = KOR_WEEKDAYS[today.getDay()];
    let dateStr = `${today.getFullYear()}년 ${String(today.getMonth()+1).padStart(2,'0')}월 ${String(today.getDate()).padStart(2,'0')}일`;
    
    onMount(async () => {
      try {
        if (!navigator.geolocation) {
          weather = '위치 정보를 사용할 수 없음';
          temp = '';
          icon = '❓';
          loading = false;
          return;
        }
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=Asia%2FSeoul`;
          const res = await fetch(url);
          const data = await res.json();
          const w = data.current_weather;
          temp = Math.round(w.temperature) + '°C';
          const code = w.weathercode;
          if (code === 0) {
            weather = '맑음';
            icon = '☀️';
          } else if (code >= 1 && code <= 3) {
            weather = '구름';
            icon = '⛅';
          } else if (code === 45 || code === 48) {
            weather = '안개';
            icon = '🌫️';
          } else if (code >= 51 && code <= 67) {
            weather = '비';
            icon = '🌧️';
          } else if (code >= 71 && code <= 77) {
            weather = '눈';
            icon = '❄️';
          } else if (code >= 80 && code <= 82) {
            weather = '소나기';
            icon = '🌦️';
          } else if (code >= 95 && code <= 99) {
            weather = '뇌우';
            icon = '⛈️';
          } else {
            weather = '알 수 없음';
            icon = '❓';
          }
          loading = false;
        }, () => {
          weather = '위치 권한 거부됨';
          temp = '';
          icon = '❓';
          loading = false;
        });
      } catch (e) {
        weather = '날씨 정보를 불러올 수 없음';
        temp = '';
        icon = '❓';
        loading = false;
      }
    });
  </script>

<div class="flex justify-center items-center w-full px-5 py-2">
  <div class="w-full max-w-4xl mx-auto bg-base-200 rounded-box p-6 text-lg space-y-2">
  <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold">{icon}</div>
  <div class="flex-1 text-lg font-medium">
    <span class="text-sm text-gray-500">오늘은 {dateStr} {weekday}</span>
    <br><span class="">{weather} | {temp}</span>
  </div>

</div></div>

<!-- 정보 박스 -->
<div class="flex justify-center items-center w-full px-5 py-2">
  <div class="w-full max-w-4xl mx-auto bg-base-200 rounded-box p-6 text-lg space-y-8">
    
    <!-- 시간표 -->
    <section>
      <h3 class="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">시간표</h3>
      <div class="overflow-x-auto">
        <iframe title="시간표" src="/timetable" class="w-full h-159 border-0 bg-base-200"></iframe>
      </div>
    </section>

<!-- 메뉴판 -->
<section>
  <h3 class="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">메뉴판</h3>
  <table class="w-full text-left border-collapse">
    <thead>
      <tr class="bg-base-300">
        <th class="border border-gray-400 px-4 py-2">구분</th>
        <th class="border border-gray-400 px-4 py-2">메뉴</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="border border-gray-400 px-4 py-2 align-top text-center font-semibold">
          <div style="flex"><div>중식</div></div>
        </td>
        <td class="overflow-x-auto border border-gray-400 px-4 py-2 whitespace-pre-line">
          {#if data.error}
            <p class="error">critical error occured.</p>
          {:else if data.boardContent && data.boardContent.length > 0}
            <ul>
              {#each data.boardContent as item}
                <li>{item}</li>
              {/each}
            </ul>
          {:else}
            <p>오늘은 중식이 없는 날입니다.</p>
          {/if}

          알레르기 정보 :<br>
1.난류 2.우유 3.메밀 4.땅콩 5.대두 6.밀 7.고등어 8.게 9.새우 10.돼지고기 11.복숭아 12.토마토 13.아황산류 14.호두 15.닭고기16.쇠고기
17.오징어 18.조개류(굴,전복,홍합 포함) 19.잣
        </td>
        </tr>
      <tr>
        <td class="border border-gray-400 px-4 py-2 align-top text-center font-semibold">
          <div style="flex"><div>매점</div><div>메뉴</div></div>
        </td>
        <td class="border border-gray-400 px-4 py-2 whitespace-pre-line">
          녹두영양닭죽&단각 | 냉메밀소바 | 오이지무침
          배추김치 | 에그타르트 | 자두 | 천도복숭아
        </td>
      </tr>
    </tbody>
  </table>
</section>

  </div>
</div>
