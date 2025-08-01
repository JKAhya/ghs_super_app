<script lang="ts">
  import { onMount } from 'svelte';
  import { ALLERGY_MAP, getAllergyNames } from '$lib/allergyMap'; // 새로 만든 파일 임포트

  let weather: string = '날씨 정보 로딩 중...';
  let temp: string = '';
  let icon: string = '⏳';
  let loadingWeather = true;

  export let data; // +page.server.js에서 넘어온 데이터

  const KOR_WEEKDAYS = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];

  let today = new Date();
  let weekday = KOR_WEEKDAYS[today.getDay()];
  let dateStr = `${today.getFullYear()}년 ${String(today.getMonth()+1).padStart(2,'0')}월 ${String(today.getDate()).padStart(2,'0')}일`;

  // 알레르기 정보 모달 관련 상태
  let showAllergyModal = false;
  let currentAllergyInfo: { name: string; allergies: string[] } | null = null;

  function openAllergyModal(item: { name: string; allergyCodes: string[] }) {
    currentAllergyInfo = {
      name: item.name,
      allergies: getAllergyNames(item.allergyCodes)
    };
    showAllergyModal = true;
  }

  function closeAllergyModal() {
    showAllergyModal = false;
    currentAllergyInfo = null;
  }
  
  onMount(async () => {
    try {
      if (!navigator.geolocation) {
        weather = '위치 정보를 사용할 수 없습니다.';
        icon = '🚫';
        loadingWeather = false;
        return;
      }
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=Asia%2FSeoul`;
        const res = await fetch(url);
        const weatherData = await res.json(); // 변수명 충돌 피하기 위해 weatherData로 변경
        const w = weatherData.current_weather;
        temp = Math.round(w.temperature) + '°C';
        const code = w.weathercode;
        if (code === 0) {
          weather = '맑음'; icon = '☀️';
        } else if (code >= 1 && code <= 3) {
          weather = '구름'; icon = '⛅';
        } else if (code === 45 || code === 48) {
          weather = '안개'; icon = '🌫️';
        } else if (code >= 51 && code <= 67) {
          weather = '비'; icon = '🌧️';
        } else if (code >= 71 && code <= 77) {
          weather = '눈'; icon = '❄️';
        } else if (code >= 80 && code <= 82) {
          weather = '소나기'; icon = '🌦️';
        } else if (code >= 95 && code <= 99) {
          weather = '뇌우'; icon = '⛈️';
        } else {
          weather = '알 수 없음'; icon = '❓';
        }
        loadingWeather = false;
      }, (error) => {
        console.error("Geolocation Error:", error.message);
        if (error.code === error.PERMISSION_DENIED) {
          weather = '위치 권한 거부됨';
        } else {
          weather = '위치 정보 오류';
        }
        icon = '❓';
        loadingWeather = false;
      });
    } catch (e) {
      console.error('날씨 정보를 불러오는 중 오류 발생:', e);
      weather = '날씨 정보를 불러올 수 없음';
      icon = '❓';
      loadingWeather = false;
    }
  });
</script>

<div class="flex justify-center items-center w-full px-5 py-2">
  <div class="w-full max-w-4xl mx-auto bg-base-200 rounded-box p-6 text-lg space-y-2">
    <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold">{icon}</div>
    <div class="flex-1 text-lg font-medium">
      <span class="text-sm text-gray-500">오늘은 {dateStr} {weekday}</span>
      <br>
      {#if loadingWeather}
        <span class="">날씨 정보 로딩 중...</span>
      {:else}
        <span class="">{weather} {temp ? `| ${temp}` : ''}</span>
      {/if}
    </div>
  </div>
</div>


<div class="flex justify-center items-center w-full px-5 py-2">
  <div class="w-full max-w-4xl mx-auto bg-base-200 rounded-box p-6 text-lg space-y-8">
    
    <section>
      <h3 class="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">시간표</h3>
      <div class="overflow-x-auto">
        <iframe title="시간표" src="/timetable" class="overflow-x-auto w-full h-screen border-0 bg-base-200"></iframe>
      </div>
    </section>


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
            <td class="overflow-x-auto border border-gray-400 px-4 py-1 whitespace-pre-line">
              {#if data.error}
                <p class="error">급식 정보를 불러오는 데 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.</p>
              {:else if data.boardContent && data.boardContent.length > 0}
                <ul class="">
                  {#each data.boardContent as item}
                    <li class="py-1 flex items-center justify-between">
                      <span>{item.name}</span>
                      {#if item.allergyCodes.length > 0}
                        <button class="btn btn-xs btn-outline btn-primary ml-2" on:click={() => openAllergyModal(item)}>
                          알러지 정보 표시
                        </button>
                      {/if}
                    </li>
                  {/each}
                </ul>
              {:else}
                <p>오늘은 중식이 없는 날입니다.</p>
              {/if}
            </td>
          </tr>
          <tr>
            <td class="border border-gray-400 px-4 py-2 align-top text-center font-semibold">
              <div style="flex"><div>매점</div><div>메뉴</div></div>
            </td>
            <td class="border border-gray-400 px-4 py-2 whitespace-pre-line">
              급식실을 애용하세요.
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</div>

{#if showAllergyModal}
  <dialog id="allergy_modal" class="modal" open>
    <div class="modal-box">
      <h3 class="font-bold text-lg">{currentAllergyInfo?.name}의 알러지 정보</h3>
      <div class="py-4">
        {#if currentAllergyInfo && currentAllergyInfo.allergies.length > 0}
          <ul class="list-inside mt-2">
            {#each currentAllergyInfo.allergies as allergy}
              <li>{allergy}</li>
            {/each}
          </ul>
        {:else}
          이 음식에는 특별히 표시된 알레르기 유발 물질이 없습니다.
        {/if}

              <h4 class="text-sm mt-8">[알레르기 정보 범례]</h4>
              <p class="text-xs">
                1.난류 2.우유 3.메밀 4.땅콩 5.대두 6.밀 7.고등어 8.게 9.새우 10.돼지고기 11.복숭아 12.토마토 13.아황산류 14.호두 15.닭고기 16.쇠고기 17.오징어 18.조개류(굴,전복,홍합 포함) 19.잣
              </p>
      </div>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn" on:click={closeAllergyModal}>닫기</button>
        </form>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button on:click={closeAllergyModal}>close</button>
    </form>
  </dialog>
{/if}
