const APP_PATH = require.resolve('./app.js');

describe('app.js basic behaviors', () => {
	beforeEach(() => {
		// reset DOM and window state expected by app.js
		document.body.innerHTML = '';
		window.FEEDBACKS = [];
		window.HEAT = { update: jest.fn() };
		window.ASPECTS = ["Communication","Scheduling","Clarity","Respect","Conduct","Feedback"];
		// clear any helpers/UI/storage used by app
		window.__HELPERS = {};
		window.__UI = {};
		window.__STORAGE = {};
		window.__RETRY = {};
		jest.useRealTimers();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	test('initAspects creates a button chip for each aspect', () => {
		document.body.innerHTML = '<div id="aspects"></div>';
		// require app file to attach globals (safe to require multiple times in jest with module cache)
		delete require.cache[require.resolve(APP_PATH)];
		require(APP_PATH);

		// call the exported initAspects
		expect(typeof window.initAspects).toBe('function');
		window.initAspects();

		const wrap = document.getElementById('aspects');
		expect(wrap).toBeTruthy();
		const chips = wrap.querySelectorAll('.chip');
		expect(chips.length).toBe(window.ASPECTS.length);
		expect(chips[0].textContent).toBe(window.ASPECTS[0]);
	});

	test('exportFeedbacksCSV creates a blob URL and clicks download anchor', () => {
		// prepare a feedback so export runs
		window.FEEDBACKS = [{
			time: "now", stage: "s", role: "r", nss: 0, idx: 0, aspects: ["A"],
			headline: "h", well: "w", better: "b", overall: 3, fairness: 3,
			conflict: "", resched: "", consent: false, savedToServer: false, savedError: ""
		}];

		// mocks
		// Mock URL.createObjectURL if it doesn't exist
		if (!global.URL) global.URL = {};
		if (!global.URL.createObjectURL) global.URL.createObjectURL = jest.fn(() => 'blob:fake');
		if (!global.URL.revokeObjectURL) global.URL.revokeObjectURL = jest.fn();
		
		const createObjectURLMock = jest.spyOn(global.URL, 'createObjectURL').mockImplementation(() => 'blob:fake');
		const appendSpy = jest.spyOn(document.body, 'appendChild');
		// spy on click on anchor element
		const clickMock = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

		delete require.cache[require.resolve(APP_PATH)];
		require(APP_PATH);

		// call export
		window.exportFeedbacksCSV();

		expect(createObjectURLMock).toHaveBeenCalled();
		// appended an anchor with download attribute set
		const appended = appendSpy.mock.calls.find(call => call[0].tagName === 'A');
		expect(appended).toBeTruthy();
		const anchor = appended[0];
		expect(anchor.download).toBe('cxi_feedbacks.csv');
		expect(clickMock).toHaveBeenCalled();

		// flush timeout for cleanup path if any
		jest.useFakeTimers();
		jest.runAllTimers();
		jest.useRealTimers();
	});

	test('score validation blocks when well or better are < 15 words', () => {
		// create required inputs
		document.body.innerHTML = `
			<input id="overall" value="5" />
			<input id="fairness" value="4" />
			<textarea id="well">one two three</textarea>
			<textarea id="better">one two three</textarea>
			<input id="headline" value="headline" />
			<div id="aspects"></div>
		`;

		// load app and call score
		delete require.cache[require.resolve(APP_PATH)];
		require(APP_PATH);

		const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

		const before = window.FEEDBACKS.length;
		window.score();
		expect(alertMock).toHaveBeenCalled();
		expect(window.FEEDBACKS.length).toBe(before);
	});

	test('score computes KPIs, pushes feedback and calls HEAT.update on success', () => {
		// create required inputs with >=15 words for well and better
		const longText = Array(20).fill('word').join(' ');
		document.body.innerHTML = `
			<input id="overall" value="5" />
			<input id="fairness" value="4" />
			<textarea id="well">${longText}</textarea>
			<textarea id="better">${longText}</textarea>
			<input id="headline" value="a headline" />
			<div id="aspects"><button class="chip active" type="button">Communication</button></div>
			<input id="stage" value="stage1" />
			<input id="role" value="role1" />
			<input id="consent" type="checkbox" checked />
			<input id="conflict" value="" />
			<input id="resched" value="" />
			<div id="kpi-nss"></div>
			<div id="kpi-index"></div>
			<div id="explain"></div>
		`;

		// provide storage and retry mocks used by score
		window.__STORAGE = { saveFeedbacks: jest.fn() };
		window.__RETRY = { sendToServer: jest.fn() };
		window.HEAT = { update: jest.fn() };

		delete require.cache[require.resolve(APP_PATH)];
		require(APP_PATH);

		const before = window.FEEDBACKS.length;
		window.score();
		expect(window.FEEDBACKS.length).toBe(before + 1);
		expect(window.HEAT.update).toHaveBeenCalled();
		// KPIs should be set
		expect(document.getElementById('kpi-nss').textContent).not.toBe('');
		expect(document.getElementById('kpi-index').textContent).not.toBe('');
		// explain should contain aspect tags text
		expect(document.getElementById('explain').innerHTML).toMatch(/Aspect tags/);
	});
});