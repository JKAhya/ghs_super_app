//CORS 제한 안걸리고 기흥고 사이트랑 컴시간 긁어오기 위함

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
    const root = parse(htmlText); // HTML 텍스트를 파싱합니다.

    // CSS 선택자로 원하는 요소를 찾습니다.
    const listItems = root.querySelectorAll('#container > div.MC_wrap2 > div > div.MC_box4.widgEdit > div > div > ul > li > dl > dd');

    // 각 요소의 텍스트 내용을 추출하여 배열로 만듭니다.
    const content = listItems.map(item => item.textContent.trim());

    // 이 객체가 페이지 컴포넌트로 전달됩니다.
    return {
      boardContent: content
    };
  } catch (error) {
    console.error('데이터를 가져오는 중 오류 발생:', error);
    // 오류가 발생해도 페이지가 멈추지 않도록 처리합니다.
    return {
      boardContent: [],
      error: '데이터를 불러올 수 없습니다.'
    };
  }
}