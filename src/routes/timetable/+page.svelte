<script>
	import { enhance } from '$app/forms'; // 폼 제출을 위한 enhance 함수 임포트

	// +page.server.js의 load 함수와 action에서 전달받은 데이터
	// @ts-ignore
	export let data;
	// @ts-ignore
	export let form; // action에서 반환된 데이터 (폼 제출 후 업데이트)

	// 현재 표시할 시간표 데이터와 시정표 데이터
	// 초기에는 load 함수에서 가져온 데이터를 사용하고, 폼 제출 후에는 form 데이터로 업데이트
	// @ts-ignore
	$: currentTimetable = form?.specificTimetable || data.specificTimetable;
	// @ts-ignore
	$: currentClassTime = form?.classTime || data.classTime;
	// @ts-ignore
	$: currentGrade = form?.currentGrade || data.currentGrade;
	// @ts-ignore
	$: currentClass = form?.currentClass || data.currentClass;
	// @ts-ignore
	$: error = form?.error || data.error;

	// 요일 배열 (시간표 헤더에 사용)
	const weekdays = ['월', '화', '수', '목', '금'];

	// 시정표 (시간 정보)를 표시하기 위한 헬퍼 함수
	// API에서 받은 classTime 데이터 구조에 따라 조정될 수 있습니다.
	// 예: classTime = [[1, "09:00", "09:50"], [2, "10:00", "10:50"], ...]
	// @ts-ignore
	function formatClassTime(period) {
		if (!currentClassTime || !currentClassTime[period - 1]) {
			return `교시 ${period}`; // 데이터가 없으면 기본값
		}
		const [p, startTime, endTime] = currentClassTime[period - 1];
		return `${p}교시 (${startTime}~${endTime})`;
	}

	// 시간표 셀의 내용을 포맷하는 함수
	// @ts-ignore
	function formatSubject(subject, teacher) {
		if (!subject && !teacher) return ''; // 수업이 없는 경우
		return `${subject || ''}${teacher ? `\n${teacher}` : ''}`;
	}
</script>

<div class="flex h-full w-full flex-col items-center justify-center">
	<div class="card rounded-box w-full max-w-4xl p-1">
		<!-- 학년/반 입력 폼 -->
		<form method="POST" action="?/getTimetable" use:enhance class="form-control mb-8 p-4">
			<div class="flex flex-col items-end justify-center gap-4 md:flex-row">
				<!-- 학년 입력 -->
				<div class="w-full flex-1">
					<label class="label" for="grade">
						<span class="label-text">학년</span>
					</label>
					<input
						type="number"
						id="grade"
						name="grade"
						placeholder="학년 (예: 1)"
						class="input input-bordered w-full"
						min="1"
						max="3"
						value={currentGrade}
						required
					/>
				</div>

				<!-- 반 입력 -->
				<div class="w-full flex-1">
					<label class="label" for="class">
						<span class="label-text">반</span>
					</label>
					<input
						type="number"
						id="class"
						name="class"
						placeholder="반 (예: 4)"
						class="input input-bordered w-full"
						min="1"
						value={currentClass}
						required
					/>
				</div>

				<!-- 조회 버튼 -->
				<div class="w-full md:w-auto">
					<button type="submit" class="btn btn-primary w-full">시간표 조회</button>
				</div>
			</div>
		</form>

		<!-- 오류 메시지 표시 -->
		{#if error}
			<div role="alert" class="alert alert-error mb-4">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/></svg
				>
				<span>오류: {error}</span>
			</div>
		{/if}

		<!-- 시간표 및 시정표 표시 -->
		{#if currentTimetable && currentClassTime}
			<h2 class="mb-4 text-center text-2xl">
				[ {currentGrade}학년 {currentClass}반 시간표 ]
			</h2>

			<!-- 시간표 테이블 -->
			<div class="bg-base-100 overflow-x-auto">
				<table class="table-zebra border-base-300 rounded-box table w-full border-collapse border">
					<thead>
						<tr class="bg-base-200">
							<th class="border-base-300 border p-3 text-center">교시</th>
							{#each weekdays as day}
								<th class="border-base-300 border p-3 text-center">{day}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						<!-- 최대 교시를 찾아서 행을 생성 -->
						{#each Array(currentClassTime.length - 1).fill(0) as _, periodIndex}
							<tr class="hover:bg-base-300">
								<td class="border-base-300 border p-3 text-center font-bold">
									{periodIndex + 1}교시
								</td>
								{#each weekdays as _, dayIndex}
									<td class="border-base-300 border p-3 text-center">
										{#if currentTimetable[dayIndex] && currentTimetable[dayIndex][periodIndex]}
											{formatSubject(
												currentTimetable[dayIndex][periodIndex].subject,
												currentTimetable[dayIndex][periodIndex].teacher
											)}
										{:else}
											<br />
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else if !error}
			학년, 반을 입력해주세요.
		{/if}
	</div>
</div>

<style>
	:global(html) {
		background-color: var(--base-200);
		white-space: pre-line;
		/* 필요에 따라 텍스트 정렬 */
		text-align: center;
	}
</style>
