import { error } from '@sveltejs/kit';

export function load() {
	error(418, '찻주전자로는 커피를 끓일 수 없습니다.');
}