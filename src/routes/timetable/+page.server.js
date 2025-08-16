// src/routes/timetable/+page.server.js
import { redirect } from '@sveltejs/kit';

/**
 * 페이지가 처음 로드될 때 또는 URL 파라미터가 변경될 때 실행됩니다.
 * 기본값으로 1학년 1반의 시간표를 가져옵니다.
 * @param {Object} event - SvelteKit에서 제공하는 로드 함수의 이벤트 객체
 * @param {Function} event.fetch - 데이터를 가져오기 위한 fetch 함수
 * @param {URL} event.url - 현재 요청의 URL 객체
 * @returns {Promise<Object>} 시간표 데이터 또는 오류 정보
 */
export async function load({ fetch, url }) {
	// URL 쿼리 파라미터에서 학년과 반을 가져오고, 없으면 기본값으로 1학년 1반 설정
	const grade = url.searchParams.get('grade') || '1';
	const classNum = url.searchParams.get('class') || '1';

	try {
		// API 엔드포인트를 호출하여 특정 학년/반의 시간표를 가져옵니다.
		const response = await fetch(`/api/timetable?grade=${grade}&class=${classNum}`);
		const data = await response.json();

		if (response.ok) {
			// 성공적으로 데이터를 가져온 경우 반환
			return {
				specificTimetable: data.timetable, // 특정 학년/반 시간표
				classTime: data.classTime, // 수업 시간 정보
				currentGrade: grade, // 현재 조회된 학년
				currentClass: classNum // 현재 조회된 반
			};
		} else {
			// API에서 오류 응답을 보낸 경우
			console.error('API에서 오류 응답:', data.error);
			return {
				specificTimetable: null,
				classTime: null,
				error: data.error || '알 수 없는 API 오류 발생.',
				currentGrade: grade,
				currentClass: classNum
			};
		}
	} catch (error) {
		// fetch 요청 자체에서 오류가 발생한 경우 (예: 네트워크 문제)
		console.error('시간표 API 호출 중 오류:', error);
		return {
			specificTimetable: null,
			classTime: null,
			error: '시간표를 불러오는 데 실패했습니다. 네트워크 연결을 확인하세요.',
			currentGrade: grade,
			currentClass: classNum
		};
	}
}

/**
 * 폼 제출 시 실행되는 서버 액션입니다.
 * 클라이언트에서 받은 학년/반 정보를 바탕으로 URL을 변경하여 load 함수를 재실행합니다.
 * @param {Object} event - SvelteKit에서 제공하는 액션 이벤트 객체
 * @param {Request} event.request - 클라이언트로부터의 요청 객체
 * @param {Function} event.fetch - 데이터를 가져오기 위한 fetch 함수
 */
export const actions = {
	getTimetable: async ({ request, fetch }) => {
		const formData = await request.formData();
		const grade = formData.get('grade');
		const classNum = formData.get('class');

		// 입력된 학년과 반을 사용하여 URL을 변경하고 페이지를 리디렉션합니다.
		// 이는 load 함수를 다시 실행시켜 새로운 시간표 데이터를 가져오게 합니다.
		// 303 상태 코드는 POST 요청 후 GET 요청으로 리디렉션함을 의미합니다.
		throw redirect(303, `/timetable?grade=${grade}&class=${classNum}`);
	}
};
