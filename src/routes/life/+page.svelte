<script lang="ts">
	import { onMount } from 'svelte';
	import axios from 'axios'; // axios 설치 필요: npm install axios

	// 웹 환경이므로 path 모듈은 더 이상 필요 없습니다.
	// import * as path from 'path';

	let weather: string = 'Now loading...';
	let temp: string = '위치 정보 필요';
	let icon: string = '⏳';
	let wind: string = '';
	let precipProb: string = '';
	let precipAmount: string = '';
	let radarImageUrl: string | null = null; // 레이더 이미지 URL 상태 추가
	let radarImageLoading: boolean = true; // 레이더 이미지 로딩 상태

	const KOR_WEEKDAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

	let today = new Date();
	let weekday = KOR_WEEKDAYS[today.getDay()];
	let dateStr = `${today.getFullYear()}년 ${String(today.getMonth() + 1).padStart(2, '0')}월 ${String(today.getDate()).padStart(2, '0')}일`;

	// 온도에서 숫자만 추출
	$: tempNum = parseInt(temp);

	// 온도에 따라 배경색 클래스 결정
	$: tempBgClass = isNaN(tempNum)
		? 'bg-primary'
		: tempNum <= 0
			? 'bg-blue-700'
			: tempNum <= 12
				? 'bg-cyan-700'
				: tempNum <= 20
					? 'bg-green-700'
					: tempNum <= 27
						? 'bg-yellow-700'
						: tempNum <= 30
							? 'bg-orange-700'
							: 'bg-red-600';

	/**
	 * Date 객체를 YYYYMMDDHHmm 형식의 문자열로 포맷합니다.
	 * @param date 포맷할 Date 객체
	 * @returns 포맷된 날짜/시간 문자열
	 */
	function formatDateTime(date: Date): string {
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');
		return `${year}${month}${day}${hours}${minutes}`;
	}

	/**
	 * 현재 레이더 이미지를 가져와 표시합니다.
	 * 웹 환경에서는 파일을 직접 저장할 수 없으므로, 이미지 URL을 직접 반환합니다.
	 * @returns 레이더 이미지 URL 또는 실패 시 null
	 */
	async function getCurrentRadarImageUrl(): Promise<string | null> {
		const now = new Date();
		// 5분 단위로 시간을 조정
		const minutes = Math.floor(now.getMinutes() / 5) * 5;
		now.setMinutes(minutes);
		now.setSeconds(0);
		now.setMilliseconds(0);

		const tmStr = formatDateTime(now);
		// 이미지를 직접 다운로드하는 대신 URL을 사용하여 <img> 태그에 표시합니다.
		const url = `https://www.weather.go.kr/w/cgi-bin/rdr_new/nph-rdr_sat_lgt_img_v3?tm=${tmStr}&sat=ir1&rdr=lng&map=HC&size=640&zoom_level=0&zoom_x=0000000&zoom_y=0000000&fog=0`;

		const maxRetries = 3;
		for (let i = 0; i < maxRetries; i++) {
			try {
				console.log(
					`Attempting to get radar image URL for ${tmStr} (Attempt ${i + 1}/${maxRetries})...`
				);
				// HEAD 요청으로 URL 유효성만 확인
				const response = await axios.head(url);
				if (response.status === 200) {
					console.log(`Successfully obtained radar image URL: ${url}`);
					return url;
				} else {
					throw new Error(`Invalid response status: ${response.status}`);
				}
			} catch (error) {
				console.error(`Error getting radar image URL for ${tmStr}:`, error);
				if (i < maxRetries - 1) {
					console.log('Retrying in 5 seconds...');
					await new Promise((resolve) => setTimeout(resolve, 5000)); // 5초 대기 후 재시도
				}
			}
		}
		console.error(`Failed to get radar image URL after ${maxRetries} attempts.`);
		return null;
	}

	onMount(async () => {
		// 날씨 정보 가져오기
		try {
			if (!navigator.geolocation) {
				weather = '위치 정보를 사용할 수 없음';
				temp = '';
				icon = '❓';
				return;
			}
			navigator.geolocation.getCurrentPosition(
				async (pos) => {
					const lat = pos.coords.latitude;
					const lon = pos.coords.longitude;
					const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=precipitation_probability,precipitation&timezone=Asia%2FSeoul`;
					const res = await fetch(url);
					const data = await res.json();
					const w = data.current_weather;
					temp = Math.round(w.temperature) + '°C';
					wind = w.windspeed !== undefined ? `${w.windspeed} m/s` : '';
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

					// Find the current hour index
					const now = new Date();
					// `getTimezoneOffset()`는 UTC와 로컬 시간의 차이(분 단위)를 반환하므로,
					// 이를 사용하여 UTC 시간을 계산하는 대신, ISO 문자열에서 시간 부분만 추출하여 정확히 비교합니다.
					const hourStr = now.toISOString().slice(0, 13) + ':00'; // 현재 시간을 UTC 기준으로 YYYY-MM-DDTHH:00 형식으로 추출
					const idx = data.hourly?.time?.findIndex((t: string) => t === hourStr);

					if (
						idx !== undefined &&
						idx !== -1 &&
						Array.isArray(data.hourly.precipitation_probability) &&
						Array.isArray(data.hourly.precipitation)
					) {
						precipProb =
							data.hourly.precipitation_probability[idx] !== undefined
								? `${data.hourly.precipitation_probability[idx]}%`
								: '정보 없음';
						precipAmount =
							data.hourly.precipitation[idx] !== undefined
								? `${data.hourly.precipitation[idx]} mm`
								: '정보 없음';
					} else {
						precipProb = '정보 없음';
						precipAmount = '정보 없음';
					}
				},
				() => {
					weather = '위치 권한 거부됨';
					temp = '';
					icon = '❓';
					wind = '';
					precipProb = '';
					precipAmount = '';
				}
			);
		} catch (e) {
			weather = '날씨 정보를 불러올 수 없음';
			temp = '';
			icon = '❓';
			wind = '';
			precipProb = '';
			precipAmount = '';
		}

		// 레이더 이미지 정보 가져오기
		try {
			radarImageLoading = true;
			radarImageUrl = await getCurrentRadarImageUrl();
		} catch (e) {
			alert(e);
			radarImageUrl = null;
		} finally {
			radarImageLoading = false;
		}
	});
</script>

<div class="flex w-full items-center justify-center px-5 py-2">
	<div class="bg-base-200 rounded-box mx-auto w-full max-w-4xl space-y-4 p-6 text-lg">
		<div
			class={`flex h-40 w-full items-center justify-center rounded-2xl text-6xl font-bold text-white ${tempBgClass}`}
		>
			{icon}
		</div>
		<div class="flex-1 text-lg font-medium">
			<span class="text-sm text-gray-500">{dateStr} {weekday}의 날씨</span>
			<br />
			<span class="text-xl">{weather}, {temp}</span>
			<br />
			<span class="text-sm"
				>풍속: {wind} <br /> 강수확률: {precipProb} <br /> 강수량: {precipAmount}</span
			>
		</div>

		<!-- --- -->

		<div>
			<h3 class="mb-2 text-lg font-bold">현재 레이더 영상</h3>
			api키 안넣어서 레이더 이미지 뜰일 없음 api키 라이브서버에서 올리면 이미지랑 특보현황 잘뜨는거 확인
			완료(7/27)
			{#if radarImageLoading}
				<div class="flex h-48 items-center justify-center rounded-lg bg-gray-300">
					<p class="text-gray-600">레이더 이미지 로딩 중...</p>
					API 키 안넣어서 레이더 안뜸
				</div>
			{:else if radarImageUrl}
				<img src={radarImageUrl} alt="Current Radar" class="h-auto w-full rounded-lg shadow-md" />
				<p class="mt-2 text-sm text-gray-500">출처: 기상청</p>
			{:else}
				<div class="flex h-48 items-center justify-center rounded-lg bg-gray-300">
					<p class="text-red-600">
						기상청측의 오류로 이미지를 불러올 수 없습니다.<br />
						기상청 사이트에 접속 가능한 환경인지, 시간대가 대한민국 혹은 일본(GMT+0900)이 맞는지 확인하여
						주십시오.<br />
						이 오류는 본 사이트측 오류가 아닙니다. 오류가 지속될시 기상청(국번없이 131)에 문의하여 주십시오.
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>
