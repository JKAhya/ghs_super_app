<script lang="ts">
	import { onMount } from 'svelte';
	import { ALLERGY_MAP, getAllergyNames } from '$lib/allergyMap'; // 새로 만든 파일 임포트

	let activeTab = '음료';

	let weather: string = '날씨 정보 로딩 중...';
	let temp: string = '';
	let icon: string = '⏳';
	let loadingWeather = true;

	export let data; // +page.server.js에서 넘어온 데이터

	const KOR_WEEKDAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

	let today = new Date();
	let weekday = KOR_WEEKDAYS[today.getDay()];
	let dateStr = `${today.getFullYear()}년 ${String(today.getMonth() + 1).padStart(2, '0')}월 ${String(today.getDate()).padStart(2, '0')}일`;

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
			navigator.geolocation.getCurrentPosition(
				async (pos) => {
					const lat = pos.coords.latitude;
					const lon = pos.coords.longitude;
					const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=Asia%2FSeoul`;
					const res = await fetch(url);
					const weatherData = await res.json(); // 변수명 충돌 피하기 위해 weatherData로 변경
					const w = weatherData.current_weather;
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
					loadingWeather = false;
				},
				(error) => {
					console.error('Geolocation Error:', error.message);
					if (error.code === error.PERMISSION_DENIED) {
						weather = '위치 권한 거부됨';
					} else {
						weather = '위치 정보 오류';
					}
					icon = '❓';
					loadingWeather = false;
				}
			);
		} catch (e) {
			console.error('날씨 정보를 불러오는 중 오류 발생:', e);
			weather = '날씨 정보를 불러올 수 없음';
			icon = '❓';
			loadingWeather = false;
		}
	});
</script>

<div class="flex w-full items-center justify-center px-5 py-2">
	<div class="bg-base-200 rounded-box mx-auto w-full max-w-4xl space-y-2 p-6 text-lg">
		<div
			class="bg-primary flex h-12 w-12 items-center justify-center rounded-full text-3xl font-bold text-white"
		>
			{icon}
		</div>
		<div class="flex-1 text-lg font-medium">
			<span class="text-sm text-gray-500">오늘은 {dateStr} {weekday}</span>
			<br />
			{#if loadingWeather}
				<span class="">날씨 정보 로딩 중...</span>
			{:else}
				<span class="">{weather} {temp ? `| ${temp}` : ''}</span>
			{/if}
		</div>
	</div>
</div>

<div class="flex w-full items-center justify-center px-5 py-2">
	<div class="bg-base-200 rounded-box mx-auto w-full max-w-4xl space-y-8 p-6 text-lg">
		<!-- 시간표 -->
		<section>
			<h3 class="mb-4 border-b border-gray-300 pb-2 text-xl font-semibold">시간표</h3>
			<div class="overflow-x-auto">
				<iframe title="시간표" src="/timetable" class="bg-base-200 h-screen w-full border-0"
				></iframe>
			</div>
		</section>

		<!-- 급식 -->
		<section>
			<h3 class="mb-4 border-b border-gray-300 pb-2 text-xl font-semibold">급식</h3>
			<div class="overflow-x-auto">
				<table class="table-zebra table w-full text-lg">
					<thead>
						<tr class="bg-base-300">
							<th class="border border-gray-400 px-4 py-2 text-center">구분</th>
							<th class="border border-gray-400 px-4 py-2">메뉴</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td class="border border-gray-400 px-4 py-2 text-center align-top font-semibold"
								>중식</td
							>
							<td class="border border-gray-400 px-4 py-2">
								{#if data.error}
									<p class="error">급식 정보를 불러오는 데 문제가 발생했습니다.</p>
								{:else if data.boardContent?.length > 0}
									<ul>
										{#each data.boardContent as item}
											<li class="flex items-center justify-between py-1">
												<span>{item.name}</span>
												{#if item.allergyCodes.length > 0}
													<button
														class="btn btn-xs btn-outline btn-primary ml-2"
														on:click={() => openAllergyModal(item)}
													>
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
					</tbody>
				</table>
			</div>
		</section>

		<!-- 매점 (탭 전환) -->
		<section>
			<h3 class="mb-4 border-b border-gray-300 pb-2 text-xl font-semibold">매점 메뉴</h3>

			<!-- Tabs -->
			<div role="tablist" class="tabs tabs-boxed mb-4">
				<a
					role="tab"
					class="tab"
					class:tab-active={activeTab === '음료'}
					on:click={() => (activeTab = '음료')}>음료</a
				>
				<a
					role="tab"
					class="tab"
					class:tab-active={activeTab === '제과'}
					on:click={() => (activeTab = '제과')}>제과</a
				>
				<a
					role="tab"
					class="tab"
					class:tab-active={activeTab === '분식'}
					on:click={() => (activeTab = '분식')}>분식</a
				>
			</div>

			<!-- Tabs content -->
			<div class="overflow-x-auto">
				<table class="table-zebra table w-full text-lg">
					<thead>
						<tr class="bg-base-300">
							<th class="px-4 py-2">메뉴</th>
							<th class="px-4 py-2">가격</th>
						</tr>
					</thead>
					<tbody>
						{#if activeTab === '음료'}
							<tr><td>생수/과수(사과/복숭아)</td><td>500</td></tr>
							<tr><td>제티</td><td>700</td></tr>
							<tr><td>초코/딸기/바나나 우유</td><td>800</td></tr>
							<tr><td>나랑드 사이다(오리지널/애플)</td><td>800</td></tr>
							<tr><td>오란씨(오렌지/파인애플)</td><td>800</td></tr>
							<tr><td>오라떼(피치/애플)</td><td>800</td></tr>
							<tr><td>복숭아 녹차/레몬 녹차</td><td>1000</td></tr>
							<tr><td>애플망고/블루하와이/자몽소다</td><td>1100</td></tr>
							<tr><td>파워에이드/포카리스웨트/데미소다(복숭아/애플)</td><td>1100</td></tr>
							<tr><td>포카리스웨트</td><td>1500</td></tr>
						{:else if activeTab === '제과'}
							<tr><td>하리보, 멘토스</td><td>200</td></tr>
							<tr><td>사우어젤리, 아이스바</td><td>300</td></tr>
							<tr><td>새콤짱, 감자알칩, 새콤달콤, 포도사탕, 에낙, 카스타드</td><td>500</td></tr>
							<tr><td>마들렌</td><td>600</td></tr>
							<tr><td>뻥이오, 미쯔</td><td>700</td></tr>
							<tr
								><td
									>고래밥, 예감, 난나나콘, 돼지바/옥동자/요맘때/플레인깔기바, 탱크보이/젤루좋아/뽕따</td
								><td>800</td></tr
							>
							<tr><td>칸쵸, 구운감자, 뿌셔뿌셔</td><td>1000</td></tr>
							<tr><td>치킨팝닭강정, 치즈뿌린팝</td><td>1100</td></tr>
							<tr><td>쫄병스낵</td><td>1200</td></tr>
							<tr><td>크룽지, 설레임/윌드콘/부라보초코/슈퍼콘민초/구구콘</td><td>1300</td></tr>
							<tr><td>콘초, 추러스, 홈런볼, 브라우니</td><td>1500</td></tr>
						{:else if activeTab === '분식'}
							<tr><td>쌀떡볶이</td><td>600</td></tr>
							<tr><td>핫바</td><td>1200</td></tr>
							<tr><td>핫도그, 구운주먹밥</td><td>1500</td></tr>
							<tr><td>만두(고기/김치)</td><td>2000</td></tr>
							<tr><td>포켓양념치킨, 어니언크림치킨</td><td>3500</td></tr>
						{/if}
					</tbody>
				</table>
			</div>
		</section>
	</div>
</div>

{#if showAllergyModal}
	<dialog id="allergy_modal" class="modal" open>
		<div class="modal-box">
			<h3 class="text-lg font-bold">{currentAllergyInfo?.name}의 알러지 정보</h3>
			<div class="py-4">
				{#if currentAllergyInfo && currentAllergyInfo.allergies.length > 0}
					<ul class="mt-2 list-inside">
						{#each currentAllergyInfo.allergies as allergy}
							<li>{allergy}</li>
						{/each}
					</ul>
				{:else}
					이 음식에는 특별히 표시된 알레르기 유발 물질이 없습니다.
				{/if}

				<h4 class="mt-8 text-sm">[알레르기 정보 범례]</h4>
				<p class="text-xs">
					1.난류 2.우유 3.메밀 4.땅콩 5.대두 6.밀 7.고등어 8.게 9.새우 10.돼지고기 11.복숭아
					12.토마토 13.아황산류 14.호두 15.닭고기 16.쇠고기 17.오징어 18.조개류(굴,전복,홍합 포함)
					19.잣
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
