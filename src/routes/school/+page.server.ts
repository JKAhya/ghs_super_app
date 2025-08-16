// +page.server.js
import { parse } from 'node-html-parser';

export async function load({ fetch }) {
	const url = 'https://giheung-h.goeyi.kr/giheung-h/main.do';
	console.log('Fetching data from a server-side load function...');

	try {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`HTTP 요청 실패! 상태: ${response.status}`);
		}

		const htmlText = await response.text();
		const root = parse(htmlText);

		// 급식 메뉴가 담긴 dd 요소를 직접 선택
		const mealContentElement = root.querySelector(
			'#container > div.MC_wrap2 > div > div.MC_box4.widgEdit > div > div > ul > li > dl > dd'
		);

		if (!mealContentElement) {
			console.warn('급식 정보 요소를 찾을 수 없습니다.');
			return { boardContent: [], error: '급식 정보를 불러올 수 없습니다.' };
		}

		// dd 태그 내부의 모든 텍스트를 가져와 줄바꿈으로 분리
		// 빈 줄은 제거하고 각 줄을 처리합니다.
		const rawLines = mealContentElement.textContent
			.trim()
			.split('\n')
			.filter((line) => line.trim() !== '');

		const parsedContent = [];
		let lastMenuIndex = -1; // 마지막으로 파싱된 메뉴의 인덱스

		for (const line of rawLines) {
			const trimmedLine = line.trim();

			// 1. (숫자.숫자...) 형태의 알레르기 코드만 있는 줄인지 확인
			const allergyOnlyMatch = trimmedLine.match(/^\(([\d.,\s]+)\)$/);

			if (allergyOnlyMatch) {
				// 이 줄은 알레르기 코드만 있는 줄입니다.
				if (lastMenuIndex !== -1) {
					// 이전에 파싱된 메뉴가 있다면 해당 메뉴에 알레르기 코드 연결
					const codes = allergyOnlyMatch[1]
						.split('.')
						.map((code) => code.trim())
						.filter((code) => code !== '');
					parsedContent[lastMenuIndex].allergyCodes.push(...codes);
					// 중복 제거
					parsedContent[lastMenuIndex].allergyCodes = [
						...new Set(parsedContent[lastMenuIndex].allergyCodes)
					];
				}
			} else {
				// 알레르기 코드만 있는 줄이 아님 (메뉴 이름이 있거나, 괄호는 있지만 알레르기 코드는 아닌 경우)
				let foodName = trimmedLine;
				let allergyCodes: string[] = [];

				// 2. 메뉴 이름과 함께 (숫자.숫자...) 형태의 알레르기 코드가 한 줄에 있는 경우
				// 예: 열무김치비빔밥(5.6.9.13.16)
				const directAllergyMatch = trimmedLine.match(/^(.*?)\(([\d.,\s]+)\)$/);
				if (directAllergyMatch) {
					foodName = directAllergyMatch[1].trim();
					allergyCodes = directAllergyMatch[2]
						.split('.')
						.map((code) => code.trim())
						.filter((code) => code !== '');
				}
				// 3. (케첩/머스터드) 처럼 알레르기 코드가 아닌 괄호가 포함된 경우 (메뉴 이름으로 유지)
				// 이 경우는 foodName과 allergyCodes가 위에서 이미 처리되었거나 초기값으로 남게 됨

				// 새로운 메뉴 항목 추가
				parsedContent.push({
					name: foodName,
					allergyCodes: allergyCodes
				});
				lastMenuIndex = parsedContent.length - 1; // 마지막 메뉴 인덱스 업데이트
			}
		}

		console.log('Parsed content:', parsedContent); // 디버깅을 위해 추가

		return {
			boardContent: parsedContent
		};
	} catch (error) {
		console.error('데이터를 가져오는 중 오류 발생:', error);
		return {
			boardContent: [],
			error: '데이터를 불러올 수 없습니다.'
		};
	}
}
