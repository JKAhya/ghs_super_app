// src/lib/allergyMap.ts
//By gpt 나도 코드 해석이 안됨
export const ALLERGY_MAP: { [key: string]: string } = {
	'1': '1. 난류',
	'2': '2. 우유',
	'3': '3. 메밀',
	'4': '4. 땅콩',
	'5': '5. 대두',
	'6': '6. 밀',
	'7': '7. 고등어',
	'8': '8. 게',
	'9': '9. 새우',
	'10': '10. 돼지고기',
	'11': '11. 복숭아',
	'12': '12. 토마토',
	'13': '13. 아황산류',
	'14': '14. 호두',
	'15': '15. 닭고기',
	'16': '16. 쇠고기',
	'17': '17. 오징어',
	'18': '18. 조개류(굴,전복,홍합 포함)',
	'19': '19. 잣'
};

// 숫자 배열을 받아서 알레르기 이름 배열로 변환하는 유틸리티 함수
export function getAllergyNames(codes: string[]): string[] {
	return codes.map((code) => ALLERGY_MAP[code]).filter((name) => name); // 유효한 이름만 반환
}
