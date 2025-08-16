// src/routes/api/timetable/+server.js

// comcigan-parser 내부에서 사용되는 모듈들을 ES Modules 방식으로 임포트합니다.
import request from 'request';
import iconv from 'iconv-lite';
import * as cheerio from 'cheerio';
import { URL } from 'url'; // Node.js의 'url' 모듈에서 URL 클래스를 임포트합니다.

const HOST = 'http://컴시간학생.kr';

class Timetable {
	constructor() {
		this._baseUrl = null;
		this._url = null;
		this._initialized = false;
		this._pageSource = null;
		this._cache = null;
		this._cacheAt = null;
		this._schoolCode = -1;
		this._weekdayString = ['일', '월', '화', '수', '목', '금', '토'];
		this._option = {
			maxGrade: 3,
			cache: 0
		};
	}

	// @ts-ignore
	async init(option) {
		if (option) {
			this._option = Object.assign(this._option, option);
		}

		await new Promise((resolve, reject) => {
			request(HOST, (err, _res, body) => {
				if (err) {
					reject(err);
				}

				const frame = body
					.toLowerCase()
					.replace(/\'/g, '"')
					.match(/<frame [^>]*src="[^"]*"[^>]*>/gm);
				if (!frame) {
					reject(new Error('frame을 찾을 수 없습니다'));
					return;
				}

				const uri = frame[0].match(/\".*\"/gi);
				if (!uri) {
					reject(new Error('접근 주소를 찾을 수 없습니다'));
					return;
				}

				const frameHref = uri[0].replace(/\"/g, '');
				const url = new URL(frameHref);
				this._url = frameHref;
				this._baseUrl = url.origin;
				// @ts-ignore
				resolve();
			});
		});

		await new Promise((resolve, reject) => {
			request(
				{
					url: this._url,
					encoding: null
				},
				(err, _res, body) => {
					if (err) {
						reject(err);
					}

					const source = iconv.decode(body, 'EUC-KR');
					const idx = source.indexOf('school_ra(sc)');
					const idx2 = source.indexOf("sc_data('");

					if (idx === -1 || idx2 === -1) {
						reject(new Error('소스에서 식별 코드를 찾을 수 없습니다.'));
						return;
					}

					const extractSchoolRa = source.substr(idx, 50).replace(' ', '');
					const schoolRa = extractSchoolRa.match(/url:'.(.*?)'/);

					const extractScData = source.substr(idx2, 30).replace(' ', '');
					const scData = extractScData.match(/\(.*?\)/);

					if (scData) {
						this._scData = scData[0].replace(/[()]/g, '').replace(/'/g, '').split(',');
					} else {
						reject(new Error('sc_data 값을 찾을 수 없습니다.'));
						return;
					}

					if (schoolRa) {
						this._extractCode = schoolRa[1];
					} else {
						reject(new Error('school_ra 값을 찾을 수 없습니다.'));
						return;
					}

					this._pageSource = source;
					// @ts-ignore
					resolve();
				}
			);
		});
		this._initialized = true;
	}

	// @ts-ignore
	search(keyword) {
		if (!this._initialized) {
			throw new Error('초기화가 진행되지 않았습니다.');
		}

		let hexString = '';
		for (let buf of iconv.encode(keyword, 'euc-kr')) {
			hexString += '%' + buf.toString(16);
		}

		return new Promise((resolve, reject) => {
			// @ts-ignore
			request(this._baseUrl + this._extractCode + hexString, (err, _res, body) => {
				let jsonString = body.substr(0, body.lastIndexOf('}') + 1);
				let searchData = JSON.parse(jsonString)['학교검색'];

				if (err) {
					reject(err);
				}

				if (searchData.length <= 0) {
					reject(new Error('검색된 학교가 없습니다.'));
				}

				resolve(
					// @ts-ignore
					searchData.map((data) => {
						return {
							_: data[0],
							region: data[1],
							name: data[2],
							code: data[3]
						};
					})
				);
			});
		});
	}

	// @ts-ignore
	setSchool(schoolCode) {
		this._schoolCode = schoolCode;
		this._cache = null;
	}

	async getTimetable() {
		this._isReady();

		if (this._option.cache && !this._isCacheExpired()) {
			return this._cache;
		}

		const jsonString = await this._getData();
		const resultJson = JSON.parse(jsonString);
		// @ts-ignore
		const startTag = this._pageSource.match(/<script language(.*?)>/gm)[0];
		const regex = new RegExp(startTag + '(.*?)</script>', 'gi');

		let match;
		let script = '';
		// @ts-ignore
		while ((match = regex.exec(this._pageSource))) {
			script += match[1];
		}

		// @ts-ignore
		const functioName = script
			.match(/function 자료[^\(]*/gm)[0]
			.replace(/\+s/, '')
			.replace('function', '');

		const classCount = resultJson['학급수'];

		const timetableData = {};

		for (let grade = 1; grade <= this._option['maxGrade']; grade++) {
			// @ts-ignore
			if (!timetableData[grade]) {
				// @ts-ignore
				timetableData[grade] = {};
			}

			for (let classNum = 1; classNum <= classCount[grade]; classNum++) {
				// @ts-ignore
				if (!timetableData[grade][classNum]) {
					// @ts-ignore
					timetableData[grade][classNum] = {};
				}

				// @ts-ignore
				timetableData[grade][classNum] = this._getClassTimetable(
					{ data: jsonString, script, functioName },
					grade,
					classNum
				);
			}
		}

		this._cache = timetableData;
		this._cacheAt = +new Date();
		return timetableData;
	}

	async getClassTime() {
		this._isReady();
		return JSON.parse(await this._getData())['일과시간'];
	}

	async _getData() {
		const da1 = '0';
		// @ts-ignore
		const s7 = this._scData[0] + this._schoolCode;
		const sc3 =
			// @ts-ignore
			this._extractCode.split('?')[0] +
			'?' +
			// @ts-ignore
			Buffer.from(s7 + '_' + da1 + '_' + this._scData[2]).toString('base64');

		const jsonString = await new Promise((resolve, reject) => {
			request(this._baseUrl + sc3, (err, _ㄴres, body) => {
				if (err) {
					reject(err);
				}

				if (!body) {
					reject(new Error('시간표 데이터를 찾을 수 없습니다.'));
				}

				resolve(body.substr(0, body.lastIndexOf('}') + 1));
			});
		});

		return jsonString;
	}

	// @ts-ignore
	_getClassTimetable(codeConfig, grade, classNumber) {
		const args = [codeConfig.data, grade, classNumber];
		const call = codeConfig.functioName + '(' + args.join(',') + ')';
		const script = codeConfig.script + '\n\n' + call;

		const res = eval(script);

		const $ = cheerio.load(res);
		const $this = this;
		// @ts-ignore
		const timetable = [];
		$('tr').each(function (timeIdx) {
			const currentTime = timeIdx - 2;
			if (timeIdx <= 1) return;

			$(this)
				.find('td')
				.each(function (weekDayIdx) {
					const currentWeekDay = weekDayIdx - 1;
					if (weekDayIdx === 0 || weekDayIdx === 6) return;

					// @ts-ignore
					if (!timetable[currentWeekDay]) {
						timetable[currentWeekDay] = [];
					}

					const subject = $(this).contents().first().text();
					const teacher = $(this).contents().last().text();
					// @ts-ignore
					timetable[currentWeekDay][currentTime] = {
						grade,
						class: classNumber,
						weekday: weekDayIdx - 1,
						weekdayString: $this._weekdayString[weekDayIdx],
						classTime: currentTime + 1,
						teacher,
						subject
					};
				});
		});

		// @ts-ignore
		return timetable;
	}

	_isReady() {
		if (!this._initialized) {
			throw new Error('초기화가 진행되지 않았습니다.');
		}

		if (this._schoolCode === -1) {
			throw new Error('학교 설정이 진행되지 않았습니다.');
		}
	}

	_isCacheExpired() {
		// @ts-ignore
		return +new Date() - this._cacheAt >= this._option.cache;
	}
}

// --- API 엔드포인트 로직 시작 ---

/**
 * GET 요청을 처리하여 시간표 데이터를 반환합니다.
 * 쿼리 파라미터로 'grade'와 'class'를 받아 특정 학년/반의 시간표를 반환합니다.
 * 예시: /api/timetable?grade=1&class=4
 * @param {Object} event - SvelteKit에서 제공하는 요청 이벤트 객체
 * @returns {Promise<Response>} JSON 형식의 시간표 데이터 또는 오류 메시지
 */
export async function GET(event) {
	const timetable = new Timetable();

	// @ts-ignore
	const schoolFinder = (schoolName, region) => (schoolList) => {
		// @ts-ignore
		const targetSchool = schoolList.find((school) => {
			return school.region === region && school.name.includes(schoolName);
		});
		return targetSchool;
	};

	try {
		// URL 쿼리 파라미터에서 grade와 class를 가져옵니다.
		// @ts-ignore
		const url = new URL(event.request.url);
		const gradeParam = url.searchParams.get('grade');
		const classParam = url.searchParams.get('class');

		let targetGrade = null;
		let targetClass = null;

		if (gradeParam) {
			targetGrade = parseInt(gradeParam, 10);
			if (isNaN(targetGrade) || targetGrade < 1 || targetGrade > 3) {
				// 최대 학년은 3학년으로 가정
				return new Response(
					JSON.stringify({
						error: '유효하지 않은 학년(grade) 파라미터입니다. 1에서 3 사이의 숫자를 입력하세요.'
					}),
					{
						status: 400,
						headers: { 'Content-Type': 'application/json' }
					}
				);
			}
		}

		if (classParam) {
			targetClass = parseInt(classParam, 10);
			if (isNaN(targetClass) || targetClass < 1) {
				// 반은 1 이상
				return new Response(
					JSON.stringify({
						error: '유효하지 않은 반(class) 파라미터입니다. 1 이상의 숫자를 입력하세요.'
					}),
					{
						status: 400,
						headers: { 'Content-Type': 'application/json' }
					}
				);
			}
		}

		await timetable.init({ cache: 1000 * 60 });
		const schoolList = await timetable.search('기흥');
		const foundSchool = schoolFinder('기흥고등학교', '경기')(schoolList);

		if (!foundSchool) {
			console.error('API: 기흥고등학교를 찾을 수 없습니다.');
			return new Response(JSON.stringify({ error: '학교를 찾을 수 없습니다.' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		await timetable.setSchool(foundSchool.code);
		const [classTime, fullTimetableData] = await Promise.all([
			timetable.getClassTime(),
			timetable.getTimetable() // 전체 시간표 데이터를 가져옵니다.
		]);

		let responseData = {
			classTime: classTime // 수업 시간 정보는 항상 포함
		};

		// 특정 학년/반이 요청된 경우 해당 데이터만 반환합니다.
		if (targetGrade !== null && targetClass !== null) {
			// @ts-ignore
			if (fullTimetableData[targetGrade] && fullTimetableData[targetGrade][targetClass]) {
				// @ts-ignore
				responseData.timetable = fullTimetableData[targetGrade][targetClass];
			} else {
				return new Response(
					JSON.stringify({
						error: `학년 ${targetGrade}반 ${targetClass}의 시간표를 찾을 수 없습니다.`
					}),
					{
						status: 404,
						headers: { 'Content-Type': 'application/json' }
					}
				);
			}
		} else {
			// 학년/반 파라미터가 없는 경우 전체 시간표를 반환합니다.
			// @ts-ignore
			responseData.fullTimetable = fullTimetableData;
		}

		return new Response(JSON.stringify(responseData), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('API에서 시간표를 불러오는 중 오류 발생:', error);
		return new Response(JSON.stringify({ error: '시간표 데이터를 가져오는 데 실패했습니다.' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}
