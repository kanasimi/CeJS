'use strict';

/**
 * @memo <code>

 TODO:
 視覺化互動式史地資訊平台:整合 GIS

 圖層 layer:
 +重大地震
 地震列表	https://zh.wikipedia.org/wiki/%E5%9C%B0%E9%9C%87%E5%88%97%E8%A1%A8
 +著名事件/歷史大事紀年表/大事記
 與歷史事件結合，能夠直觀的藉點取時間軸，即獲得當時世界上所有已知發生之事件以及出處依據（參考文獻來源、出典考據）、註解。
 台灣地方志寶鑑 http://140.112.30.230/Fangjr/
 戰後臺灣歷史年表 http://twstudy.iis.sinica.edu.tw/twht/
 +著名人物/歷史名人生辰,生卒,出生逝世年份月日@線圖
 +君主

 </code>
 */

/**
 * @note <code>

 </code>
 */
if (false) {

	var g = CeL.SVG.createNode('g'), l = CeL.SVG.createNode('line', {
		x1 : 0,
		y1 : 0,
		x2 : 10,
		y2 : 30,
		stroke : '#a76',
		'stroke-width' : 1
	});
	g.appendChild(l);
	SVG_object.svg.appendChild(g);

	g.style.setProperty('display', 'none');
	g.style.setProperty('display', '');

	// http://www.w3.org/TR/SVG11/coords.html#TransformAttribute
	g.setAttribute('transform', 'translate(20,30)');

	//

	CeL.era.periods()[0].forEach(function(row) {
		row.forEach(function(country) {
			var dynasties = [];
			for ( var name in country.sub)
				dynasties.push(country.sub[name]);
			dynasties.sort(CeL.era.compare_start);
			dynasties.forEach(function(dynasty) {
				CeL.log(dynasty.toString('period'));
			});
		});
	});

	//

	'' + CeL.era.periods([ '中國', '燕國' ])[0];
}

// ---------------------------------------------------------------------//

// define gettext() user domain resource location.
// gettext() will auto load (CeL.env.domain_location + language + '.js').
// e.g., resource/cmn-Hant-TW.js, resource/ja-JP.js
CeL.env.domain_location = 'resource/';
// declaration for gettext()
var _;

// google.load('visualization', '1', {packages: ['corechart']});
function initializer() {
	var queue = [
			[ 'interact.DOM', 'application.debug.log',
					'interact.form.select_input', 'interact.integrate.SVG',
					'data.date.era', 'application.astronomical' ],
			'data.date.calendar', function() {
				// alias for CeL.gettext, then we can use _('message').
				_ = CeL.gettext;

				CeL.Log.set_board('panel_for_log');
				// CeL.set_debug();

				// Set a callback to run when the Google Visualization API is
				// loaded.
				// google.setOnLoadCallback(affairs);

			} ];

	if (location.protocol === 'file:')
		// 當 include 程式碼，執行時不 catch error 以作防範。
		CeL.env.no_catch = true;
	else
		queue.push('http://apis.google.com/js/plusone.js');

	// console.info('Start loading..');
	// 因為載入時間較長，使用此功能可降低反應倦怠感，改善體驗。
	CeL.env.era_data_load = function(country, queue) {
		function set_done(index) {
			CeL.set_class('loading_progress' + index, {
				loading : false,
				loaded : true,
			});
		}

		if (CeL.is_Object(country)) {
			// console.info('Starting ' + queue);
			var nodes = [ {
				T : 'Loading...'
			} ], length = queue.length;
			if (!length)
				throw new Error('No era data got!');

			queue.forEach(function(country) {
				nodes.push({
					T : country,
					id : 'loading_progress' + --length,
					C : 'onprogress'
				});
			});
			nodes[1].C += ' loading';

			CeL.remove_all_child('loading_progress');
			CeL.new_node(nodes, 'loading_progress');

		} else if (!queue) {
			// console.info('all loaded.');
			set_done(0);
			setTimeout(affairs, 0);

		} else {
			// console.info(queue);
			set_done(queue.length);
			if (0 <= (queue = queue.length - 1))
				CeL.set_class('loading_progress' + queue, 'loading');
		}
	};

	CeL.run(queue);
}

// ---------------------------------------------------------------------//

// 年差距/位移
function Year_numbering(year_shift, year_only, has_year_0, reverse) {
	year_shift |= 0;
	if (year_only)
		return function(date) {
			var year = date.format({
				parser : 'CE',
				format : '%Y',
				no_year_0 : false
			});
			if (reverse)
				// 反向記數, reverse counting.
				year = year_shift - year;
			else
				year = year_shift + (year | 0);
			if (!has_year_0 && year <= 0)
				// 本紀元前。
				year--;
			return {
				T : [ '約%1年', year ]
			};
		};

	return function(date, year_only) {
		if (date.精 === '年')
			year_only = true;
		date = date.format({
			parser : 'CE',
			format : '%Y/%m/%d',
			no_year_0 : false
		}).split('/');
		var year = date[0];
		if (reverse)
			// 反向記數, reverse counting.
			year = year_shift - year;
		else
			year = year_shift + (year | 0);
		if (!has_year_0 && year <= 0)
			// 本紀元前。
			year--;
		return year + (year_only ? '年' : '/' + date[1] + '/' + date[2]);
	};

	// Gregorian calendar only.
	return function(date) {
		var year = date.getFullYear() + year_shift | 0;
		if (year <= 0)
			// 紀元前。
			year--;
		return year
				+ (date.精 === '年' ? '年' : '/' + (date.getMonth() + 1) + '/'
						+ date.getDate());
	}
}

// const
var PATTERN_NOT_ALL_ALPHABET = /[^a-z\s\d\-,'"]/i,
//
CE_name = '公元', CE_PATTERN = new RegExp('^' + CE_name + '-?\\d'),
// 可選用的文字式年曆欄位。
selected_column = {
	JDN : true,
	contemporary : true
},
// 可選用的文字式年曆 title = { id : [th, function (date) {} ] }
calendar_column,
//
default_column = [ {
	T : '朝代紀年日期'
}, [ {
	T : CE_name
}, '(', {
	T : '星期'
}, ')' ]
// , R : '0: 周日/星期日/禮拜天, 1: 周一, 餘類推'
, {
	T : '歲次',
	R : '年干支'
}, {
	T : '月干支',
	R : '月干支/大小月',
	S : 'font-size:.7em;'
}, {
	T : '日干支',
	S : 'font-size:.7em;'
} ];

function remove_calendar_column() {
	var n = this.title.match(/: (.+)$/);
	if (n)
		delete selected_column[n[1]];
	translate_era();
	return false;
}

function add_calendar_column() {
	selected_column[this.title] = true;
	translate_era();
	return false;
}

// 文字式年曆。
function show_calendar(era_name) {
	var era_caption,
	// 為了不更動到原先的 default_column。作 deep clone.
	title = CeL.clone(default_column, true), output = [ {
		tr : title
	} ], 前年名, 前月名, 前紀年名, 後紀年名,
	//
	main_date_value = CeL.era(era_name),
	//
	dates = CeL.era.dates(era_name, {
		含參照用 : /明治|大正|昭和|明仁/.test(era_name)
	}), is_年譜, i, j, matched, hidden_column = [], group;

	if (!dates)
		return;

	if (dates.length > show_calendar.LIMIT) {
		CeL.warn('show_calendar: 輸出年段/時段紀錄過長（' + dates.length
				+ ' 筆），已超過輸出總筆數限制！將截取前 ' + show_calendar.LIMIT + ' 筆。');
		dates.length = show_calendar.LIMIT;
	}

	if (!era_name.includes('月'))
		title.splice(-1, 1, {
			th : {
				T : '朔日',
				R : '實曆每月初一之朔日，非天文朔日！'
			}
		});

	for (i in calendar_column) {
		if (selected_column[i])
			title.push({
				th : [ calendar_column[i][0], ' ', {
					span : '×',
					title : _('除去此欄') + ': ' + i,
					C : 'remove_mark',
					onclick : remove_calendar_column
				} ]
			});
		else if (Array.isArray(calendar_column[i])) {
			// 增加此欄
			j = calendar_column[i][0];
			if (!j.T && j.a)
				j = j.a;
			if ((matched = i.match(/^([^\/]+)\//)) && matched[1] !== group) {
				group = matched[1];
				hidden_column.pop();
				hidden_column.push([ {
					hr : null
				}, {
					T : '分類'
				}, ': ', {
					T : group,
					R : calendar_column[group] || ''
				}, ' ' ]);
			}
			hidden_column.push({
				span : j.T ? {
					T : j.T
				} : i,
				title : i,
				C : 'add_mark',
				onclick : add_calendar_column
			}, ' | ');
		}
	}
	hidden_column.pop();

	if (main_date_value)
		if (main_date_value.日 == 1 && !era_name.includes('日'))
			main_date_value = null;
		else {
			main_date_value.setHours(0, 0, 0, 0);
			main_date_value = main_date_value.getTime();
		}

	function add_traveler(name, is_next) {
		if (name)
			output.push({
				tr : {
					td : [
					// icon
					is_next ? '↓' : '↑', {
						a : name,
						title : name,
						href : '#',
						target : '_self',
						onclick : click_title_as_era
					} ],
					colspan : title.length
				}
			});
	}

	if (dates.previous)
		add_traveler(dates.previous);

	dates.forEach(function(date) {
		if (!era_caption)
			era_caption = era_name.includes(date.紀年名) ? date.紀年名
			//
			: /[\/年]/.test(era_name) ? date.紀年 : era_name;

		var tmp, matched, list = [];
		if (date.共存紀年) {
			date.共存紀年.forEach(function(era, index) {
				if (output_numeral === 'Chinese')
					era = CeL.to_Chinese_numeral(era);
				list.push('[' + (index + 1) + ']', add_contemporary(era,
						output_numeral));
			});
			date.共存紀年 = list;
			// reset
			list = [];
		}

		if (tmp = date.精 === '年')
			is_年譜 = true;
		tmp = date.format(
				{
					parser : 'CE',
					format : tmp ? '%紀年名%年年|%Y年|%年干支||'
					//
					: '%紀年名%年年%月月%日日|%Y/%m/%d('
							+ (_.is_domain_name('ja') ? '%七曜' : '%w')
							+ ')|%年干支|%月干支%大小月|%日干支',
					locale : 'cmn-Hant-TW',
					as_UTC_time : true
				}).replace(/星期/, '').split('|');

		if (matched = tmp[0]
		// 後處理。
		// 月名: 正/臘/閏12/後12
		.match(/^(.*\D\d+年)(.{1,3}月)(\d+日)$/))
			tmp[0] = [ matched[1] === 前年名 ? 前年名 : {
				a : 前年名 = matched[1],
				title : matched[1],
				href : '#',
				target : '_self',
				C : 'to_select',
				onclick : click_title_as_era
			}, matched[2] === 前月名 ? 前月名 : {
				a : 前月名 = matched[2],
				title : matched[1] + matched[2],
				href : '#',
				target : '_self',
				C : 'to_select',
				onclick : click_title_as_era
			}, matched[3] ];

		// 後處理。
		// 公曆換月。
		if (tmp[1].includes('\/1('))
			tmp[1] = {
				span : tmp[1],
				S : 'color:#f80'
			};

		tmp.forEach(function(data, index) {
			list.push({
				td : data
			});
		});

		for (tmp in calendar_column) {
			if (selected_column[tmp])
				list.push({
					td : calendar_column[tmp][1](date)
				});
		}

		// 處理改朝換代巡覽。
		var 未延續前紀年 = (後紀年名 !== date.紀年名);
		if (date.前紀年 !== 前紀年名) {
			if (未延續前紀年)
				add_traveler(date.前紀年);
			前紀年名 = date.前紀年;
		}

		if (main_date_value
		//
		&& main_date_value === date.getTime())
			tmp = 'selected', main_date_value = null;
		else
			tmp = '';

		output.push({
			tr : list,
			C : tmp
		});

		if (date.後紀年 !== 後紀年名) {
			if (未延續前紀年)
				add_traveler(後紀年名, true);
			後紀年名 = date.後紀年;
		}
	});

	if (後紀年名)
		add_traveler(後紀年名, true);

	if (dates.next)
		add_traveler(dates.next, true);

	era_caption = era_caption ? [ {
		a : era_caption,
		title : era_caption,
		href : '#',
		target : '_self',
		C : 'to_select',
		onclick : click_title_as_era
	}, {
		T : is_年譜 ? '年譜' : '曆譜'
	}, '（共有 ' + dates.length + ' 個' + (dates.type ? '時' : '年') + '段紀錄）' ]
			: '無可供列出之曆譜！';

	title = {
		table : [ {
			caption : era_caption
		}, {
			tbody : output
		} ]
	};
	if (hidden_column.length > 0) {
		hidden_column.unshift(': ');
		title = [ {
			div : [ {
				T : '增加此欄',
				C : 'column_select_button',
				onclick : function() {
					CeL.toggle_display('column_to_select');
					return false;
				}
			}, {
				span : hidden_column,
				id : 'column_to_select'
			} ],
			C : 'add_mark_layer'
		}, title ];
	}
	CeL.remove_all_child('calendar');
	CeL.new_node(title, 'calendar');
	// text_calendar
	select_panel('calendar', true);
}

show_calendar.LIMIT = 200;

// ---------------------------------------------------------------------//
// 開發人員使用 function。

function 壓縮曆數() {
	CeL.set_text('pack_result', CeL.era.pack(CeL.set_text('pack_source').trim()
	// 為方便所作的權益措施。
	.replace(/\\t/g, '\t')));
	return false;
}

function 解壓縮曆數() {
	var data = CeL.set_text('pack_source').trim().replace(/\\t/g, '\t').split(
			'|');

	if (data.length > 1) {
		data[2] = CeL.era.extract(data[2]);
		data = data.join('|');

	} else
		data = CeL.era.extract(data[0]);

	CeL.set_text('pack_result', data);

	return false;
}

function 解析曆數() {
	var calendar = CeL.set_text('pack_source').trim().replace(/\\t/g, '\t');

	calendar = calendar.includes('|')
	// 當作紀年名
	? CeL.era.set(calendar, {
		extract_only : true
	})
	// 當作曆數資料
	: CeL.era(calendar, {
		get_era : true
	});

	if (calendar && Array.isArray(calendar = calendar.calendar)) {
		calendar.forEach(function(year_data, index) {
			if (year_data.leap)
				year_data[year_data.leap] = '閏' + year_data[year_data.leap];
			calendar[index] = year_data.join('\t');
		});
		CeL.set_text('pack_result', calendar.join('\n'));
	}
	return false;
}

// ---------------------------------------------------------------------//

var era_name_classifier, MIN_FONT_SIZE = 10,
// 250: 經驗值。Chrome 35 在字體太大時會化ける。
// Chrome/38 (WebKit/537.36): OK
// Chrome/40: NG @ 300.
MAX_FONT_SIZE = /WebKit/i.test(navigator.userAgent) ? 250 : Infinity;

function draw_title_era() {
	var hierarchy = this.title;
	if (hierarchy)
		hierarchy = hierarchy.split(era_name_classifier);
	draw_era(hierarchy);
	return false;
}

function set_SVG_text_properties(recover) {
	var def = document.getElementById(String(this.getAttribute('xlink:href'))
			.replace(/^#/, ''));

	if (def && this.working !==
	// 避免重複設定。
	(recover = typeof recover === 'boolean' && recover)) {
		this.working = recover;

		var def_style = def.style;
		if (recover)
			CeL.remove_all_child('era_graph_target');
		else {
			var name_showed = this.title.match(CeL.era.PERIOD_PATTERN);
			name_showed = name_showed ? '[' + name_showed[1] + ']' : this.title;

			CeL.set_text('era_graph_target', name_showed);
			// 在 Firefox/36.0 中，或許因字體改變，造成 onmouseover 會執行兩次。
			if (!def.base_font_size) {
				def.base_font_size = def_style['font-size'];
				def.base_color = def_style.color;
			}
			// bring to top. put it on top.
			// http://www.carto.net/papers/svg/manipulating_svg_with_dom_ecmascript/
			this.parentNode.appendChild(this);
		}
		CeL.debug((recover ? 'recover' : 'settle'), 1,
				'set_SVG_text_properties');

		var style = this.style;
		style['font-size'] = def_style['font-size']
		//
		= recover ? def.base_font_size : (3 * MIN_FONT_SIZE) + 'px';
		// '': default
		def_style['stroke'] = recover ? '' : '#000000';
		def_style.color = style.color = recover ? def.base_color : '#f00';

		if (recover)
			delete this.working;
	}
}

// Firefox/30.0 尚未支援 writing-mode。IE, Chrome 支援。
// https://bugzilla.mozilla.org/show_bug.cgi?id=145503
// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/writing-mode
var support_writing_mode = !/Firefox/i.test(navigator.userAgent);

function recover_SVG_text_properties() {
	set_SVG_text_properties.call(this, true);
}

function date_to_loc(date, start_date) {
	var ratio = SVG_object && SVG_object.ratio;
	if (!ratio) {
		CeL.warn('date_to_loc: '
				+ (SVG_object ? '尚未設定 ratio!' : no_SVG_message));
		return;
	}

	date = (date - (start_date || SVG_object.start)) * ratio | 0;
	if (!start_date)
		// 此時取得 left，需要加上 draw_era.left。else 取得 width。
		date += draw_era.left;
	return date;
}

// ---------------------------------------------------------------------//

// area width, height.
// TODO: return [top, left, width, height]
/*
 * show_range(CeL.era('清德宗光緒六年三月十三日'), 80, '清德宗光緒六年三月十三日');
 */
function show_range(date_range, height_range, title, style) {
	var ratio = SVG_object && SVG_object.ratio;
	if (!ratio) {
		CeL.warn('show_range: 尚未設定 ratio!');
		return;
	}

	if (Array.isArray(date_range))
		// 不改變原 arguments。
		date_range = date_range.slice();
	else
		date_range = [ date_range ];
	if (Array.isArray(height_range))
		// 不改變原 arguments。
		height_range = height_range.slice();
	else
		height_range = [ height_range ];

	// date_range: Date
	if (date_range[1] < date_range[0]) {
		// swap date_range
		var tmp = date_range[0];
		date_range[0] = date_range[1];
		date_range[1] = tmp;
	}
	date_range[1] = date_to_loc(date_range[1], date_range[0]);
	date_range[0] = date_to_loc(date_range[0]);
	// assert: date_range = [ left, width ]

	if (CeL.is_debug(2) && (
	// 於之後
	draw_era.width <= date_range[0]
	// 於之前
	|| date_range[0] + date_range[1] <= 0))
		CeL.warn('show_range: 所欲顯示之範圍不在當前圖表內！ [' + (title || date_range) + ']');
	height_range[0] |= 0;
	if (!(0 < height_range[0] && height_range[0] < draw_era.height))
		CeL.warn('show_range: 所欲顯示之範圍高度不在當前圖表內！ [' + height_range + ']');

	if (show_range.min_width <= date_range[1]) {
		// height_range: px
		height_range[1] -= height_range[0];
		if (!(show_range.min_height <= height_range[1]))
			height_range[1] = show_range.min_height;

		SVG_object.addRect(date_range[1], height_range[1], date_range[0],
				height_range[0], null, 1, style && style.color || '#e92');
	} else {
		// 去掉 [1]
		date_range.length = 1;
		SVG_object.addCircle(show_range.radius, date_range[0], height_range[0],
				style && style.color || '#0f0', 1, '#f00');
	}

	var lastAdd = SVG_object.lastAdd;
	lastAdd.range = date_range[1];
	if (title)
		SVG_object.addTitle(title);

	return lastAdd;
}
// in px
show_range.radius = 3;
show_range.min_width = 3;
show_range.min_height = 3;

/**
 * 可繪製特定時段，例如展現在世期間所占比例。
 * 
 * @example <code>
 * 
 add_tag('漢和帝劉肇（79年–106年2月13日）');
 add_tag('清德宗光緒六年三月十三日');

 </code>
 * 
 * @param {String}period
 * @param {Object}[data]
 * @param {String}[group]
 */
function add_tag(period, data, group, register_only, options) {
	if (!period || !(period = String(period).trim()))
		return;

	var title = '',
	//
	arg_passed = CeL.parse_period(period),
	// from date
	date = CeL.era(Array.isArray(arg_passed) ? arg_passed[0] : period, {
		date_only : true
	});

	if (!date) {
		// Cannot parse
		CeL.warn('add_tag: 無法解析 [' + period + ']!');
		return;
	}

	if (Array.isArray(arg_passed)) {
		// to date
		arg_passed = CeL.era(arg_passed[1], {
			date_only : true,
			period_end : true
		});
		if (!arg_passed) {
			CeL.warn('add_tag: 無法解析 [' + period + ']!');
			return;
		}
		// 因為是 period_end，因此須取前一單位。
		if (arg_passed.format(draw_era.date_options) === '1/1/1')
			// TODO: 以更好的方法考慮 no_year_0 的問題。
			arg_passed = '-1/12/31 23:59:59.999'.to_Date('CE');
		else
			arg_passed = new Date(arg_passed - 1);
		title = '–' + arg_passed.format(draw_era.date_options) + ', '
				+ date.age(arg_passed, options);
		arg_passed = [ [ date, arg_passed ], ,
		// , { color : '' }
		];
	} else {
		arg_passed = [ date, ,
		// , { color : '' }
		];
	}

	// 處理 title: [group] data.title \n period (date) \n data.description
	title = [ (group ? '[' + group + '] ' : '')
	//
	+ (data && (typeof data === 'string' ? data : data.title) || ''),
	//
	period + ' (' + date.format(draw_era.date_options) + title + ')' ];
	if (data && data.description)
		title.push(data.description);
	arg_passed[2] = title.join('\n').trim();

	arg_passed.period = period;
	// arg_passed.title = title;

	if (group && (group = String(group).trim()))
		arg_passed.group = group;
	if (data)
		arg_passed.data = data;

	var target = group || draw_era.default_group;
	CeL.debug('Using group [' + target + ']', 2);
	if (!draw_era.tags[target]) {
		if (target !== draw_era.default_group)
			CeL.log('add_tag: create new group [' + target + ']');
		Object.defineProperty(
		//
		draw_era.tags[target] = CeL.null_Object(), 'hide', {
			writable : true
		});
	}
	target = draw_era.tags[target];
	if (target[period]) {
		CeL.warn('add_tag: 已經有此時段存在！將跳過之，不會以新的覆蓋舊的。 '
				+ (group ? '[' + group + ']' : '') + '[' + period + ']');
		return;
	}

	CeL.debug('登錄 ' + (group ? '[' + group + ']' : '') + '[' + period + ']', 2,
			'add_tag');
	target[period] = arg_passed;

	if (!register_only) {
		add_tag.show(arg_passed);
		select_panel('era_graph', true);
	}
}

// add_tag.group_count[group] = {Interger}count
add_tag.group_count = CeL.null_Object();

add_tag.show = function(array_data) {
	if (!Array.isArray(array_data))
		// illegal data.
		return;

	var group = array_data.group || draw_era.default_group,
	// 決定高度。
	height = (10 + 20 * (add_tag.group_count[group] = (add_tag.group_count[group] | 0) + 1))
			% draw_era.height;
	if (height < 5)
		// 確定不會過小。
		height = 5;
	array_data[1] = height;

	var lastAdd = show_range.apply(null, array_data);
	if (!lastAdd)
		// no SVG support?
		return;

	// 點擊後消除。
	lastAdd.style.cursor = 'pointer';
	lastAdd.onclick = add_tag.remove_self;

	// settle search id
	lastAdd.period = array_data.period;
	if (array_data.group)
		lastAdd.group = array_data.group;

	return lastAdd;
};

add_tag.remove_self = function() {
	CeL.debug('去除登錄 ' + (this.group ? '[' + this.group + ']' : '') + '['
			+ this.period + ']', 2, 'add_tag.remove_self');
	var target = draw_era.tags[this.group || draw_era.default_group];
	if (target)
		delete target[this.period];
	return SVG_object.removeSelf.call(this);
};

// add_tag.load('臺灣地震');
/*
 * if(add_tag.load('臺灣地震',true)) return;
 */
add_tag.load = function(id, callback) {
	var data = add_tag.data_file[id];

	if (!data) {
		CeL.err('未設定之資料圖層: [' + id + ']');
		return 'ERROR';
	}
	if (callback && (typeof callback !== 'function'))
		return data.loaded;

	if (!data.loaded) {
		data.loaded = 'loading @ ' + new Date;
		// [0]: path
		CeL.run(data[0], function() {
			data.loaded = 'loaded @ ' + (new Date).format();
			if (typeof callback === 'function')
				callback(id, data);
		});
	}
};

add_tag.parse = function(group, data, line_separator, date_index, title_index,
		description_index, field_separator) {
	if (!field_separator)
		field_separator = '\t';
	if (isNaN(date_index))
		date_index = 0;
	if (isNaN(title_index))
		title_index = 1;
	data.split(line_separator || '|').forEach(function(line) {
		if (!line)
			return;
		line = line.split(field_separator);
		line.title = line[title_index];
		if (description_index && line[description_index])
			line.description = line[description_index];
		add_tag(line[date_index], line, group);
	});
};

add_tag.data_file = {
	'中國皇帝生卒' : [
			'resource/emperor.js',
			// 資料來源 title, URL, memo
			'中國皇帝壽命列表',
			'https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%9B%BD%E7%9A%87%E5%B8%9D%E5%AF%BF%E5%91%BD%E5%88%97%E8%A1%A8',
			'僅列到年份，尚不夠精確。' ],

	// 臺灣歷史地震時間軸視覺化（英文：Visulation）
	'臺灣地震' : [ 'resource/quake.js', '臺灣地震年表',
			'http://921kb.sinica.edu.tw/history/quake_history.html' ]
};

// ---------------------------------------------------------------------//

/**
 * @memo <code>

 var d = show_range([ new Date(1899, 0, 1), new Date(1939, 0, 1) ], 80,
 'test block', {
 color : '#e92'
 });

 </code>
 */

/**
 * 畫個簡單的時間軸線圖。<br />
 * TODO:<br />
 * 加上年代。<br />
 * 使用 or 擴展成甘特圖 Gantt chart API。<br />
 * 
 * @param {Array}hierarchy
 *            指定之紀年層次。
 * @returns
 */
function draw_era(hierarchy) {

	// 清理場地。
	SVG_object.clean();
	delete SVG_object.start;
	CeL.remove_all_child('era_graph_target');
	add_tag.group_count = CeL.null_Object();

	SVG_object.hierarchy = hierarchy;
	var periods = CeL.era.periods(hierarchy, draw_era.options),
	//
	period_hierarchy = Array.isArray(hierarchy) && hierarchy.length > 0 ? hierarchy
			.join(era_name_classifier)
			+ era_name_classifier
			: '';

	// 尺規最小刻度寬。
	if (isNaN(draw_era.ruler_min_scale_pixel))
		// 4: 經驗法則，don't know why.
		draw_era.ruler_min_scale_pixel = SVG_object.addText.defaultCharWidthPx * 4;

	if (Array.isArray(periods) && periods.length > 0) {
		var start_time = periods.start, ratio = periods.end;

		if (periods.生 && periods.卒) {
			if (draw_era.options.adapt_lifetime) {
				// 若君主在世時段於本 period 之外，則擴張範圍。
				start_time = Math.min(start_time - 0, CeL.era(periods.生[0], {
					date_only : true
				}) - 0);
				ratio = Math.max(ratio - 0, CeL.era(periods.卒[0], {
					date_only : true
				}) - 0);
			}
			// 以 tag 顯示君主生卒標記。
			if (!periods.added) {
				periods.added = true;
				add_tag(periods.生[0] + '-' + periods.卒[0], period_hierarchy,
						'君主生卒', true, {
							歲 : true
						});
			}
		}

		// 登記。
		SVG_object.start = start_time;
		SVG_object.end = ratio;
		SVG_object.ratio =
		// draw era width / (時間跨度 time span)。
		ratio = draw_era.width / (ratio - start_time);

		// 前一個尺規刻度。
		var previous_ruler_scale = -Infinity,
		// 取得 period 之起始 x 座標。
		get_from_x = function(period) {
			return draw_era.left
			//
			+ (period ? (period.start - start_time) * ratio : draw_era.width);
		}, short_period = [],
		// @ periods.forEach()
		layer_count, layer_from_y, layer_height,
		//
		period_list,
		// 真正執行繪製之 function。
		draw_period = function(period, index) {
			var style, unobvious,
			// https://en.wikipedia.org/wiki/Circa
			存疑資料 = period.準 || period.精,
			//
			date_options = period.精 === '年' ? draw_era.year_options
					: draw_era.date_options,
			// IE 中，period.start 可能為 Date 或 Number。
			period_start = new Date(period.start - 0),
			// Era.name 為 Array。
			is_Era = Array.isArray(period.name),
			//
			name = is_Era ? period.name[0] : period.name,
			//
			name_showed = name.match(CeL.era.PERIOD_PATTERN),
			// 線圖階層:歷史時期。
			is_歷史時期 = !!(name_showed = name_showed && name_showed[1]),
			//
			from_x = get_from_x(period),
			//
			width = (period.end - period.start) * ratio,
			//
			vertical_text,
			//
			font_size;

			// name_showed = is_歷史時期 ? '[' + name_showed + ']' : name;
			if (!name_showed)
				name_showed = name;
			name_showed = _(name_showed);

			// 對紀年時間過短，太窄時，線圖之處理：採垂直排列。
			vertical_text = name_showed.length > 1
					&& (support_writing_mode ? width < layer_height
					// 縮緊條件:基本上能正的看字，還是以正的為好。
					: width < layer_height / 2);

			font_size = vertical_text
			//
			? Math.min(width * .8, layer_height / name_showed.length)
			//
			: Math.min(layer_height * .8, width / name_showed.length);

			if (font_size < MIN_FONT_SIZE) {
				font_size = MIN_FONT_SIZE;
				// 難辨識、不清楚、不顯著、隱晦不明顯時段。
				unobvious = true;
				var duration = [ '(',
				//
				period_start.format(date_options), ];
				if (!isNaN(period.end))
					duration.push('–', (new Date(period.end - 0))
							.format(date_options));
				duration.push(') ');
				short_period.push({
					a : name_showed,
					href : '#',
					target : '_self',
					title : period_hierarchy + name,
					onclick : is_Era ? click_title_as_era : draw_title_era
				}, {
					span : duration,
					C : 'duration'
				});
			} else if (font_size > MAX_FONT_SIZE)
				font_size = MAX_FONT_SIZE;

			if (!(name in draw_era.date_cache) && !isNaN(period.end)) {
				var end_time = new Date(period.end - 0);
				// 警告: .setDate(-1) 此為權宜之計。
				end_time.setDate(end_time.getDate() - 1);
				draw_era.date_cache[name] = {
					start : period_start.format(date_options),
					end : end_time.format(date_options)
				};
			}

			var duration = CeL.age_of(period.start, period.end);
			SVG_object.addRect(width, layer_height, from_x, layer_from_y, null,
					1, 存疑資料 ? '#ddd' : unobvious ?
					// 此處需要與 #era_graph_unobvious 之
					// background-color 一致。
					'#ffa' : is_歷史時期 ? '#afa' : '#ddf')
			//
			.addTitle(name + ' (' + duration + ')');

			// 繪製/加上時間軸線圖年代刻度。
			if (
			// 尺規最小刻度寬。
			draw_era.ruler_min_scale_pixel
			// 測試本尺規刻度與上一尺規刻度距離是否過密。
			< from_x - previous_ruler_scale
			// 測試本尺規是否過窄。
			&& draw_era.ruler_min_scale_pixel
			//
			< get_from_x(period_list[index + 1]) - from_x)
				SVG_object.addText(period_start.format(
				//
				period.精 === '年' ? draw_era.ruler_date_year_options
						: draw_era.ruler_date_options),
						previous_ruler_scale = from_x, layer_from_y
								+ SVG_object.addText.defaultCharWidthPx * 2, {
							color : '#f42'
						});

			style = {
				color : 存疑資料 ? '#444' : layer_count === 1 ? '#15a' : '#a2e',
				cursor : 'pointer',
				// 清晰的小字體
				'font-family' : '標楷體,DFKai-SB',
				'font-size' : font_size + 'px'
			};
			if (vertical_text && support_writing_mode
			// 若全部都是英文字母，則以旋轉為主。
			&& PATTERN_NOT_ALL_ALPHABET.test(name_showed)) {
				// top to bottom
				style['writing-mode'] = 'tb';
				// no rotation
				style['glyph-orientation-vertical'] = 0;

				// 置中: x軸設在中線。
				SVG_object.addText(name_showed, from_x + width / 2,
						layer_from_y
								+ (layer_height - name_showed.length
										* font_size) / 2, style);
			} else {
				// 置中
				SVG_object.addText(name_showed, from_x
						+ (width - name_showed.length * font_size) / 2,
				// .7:
				// 經驗法則，don't know why.
				layer_from_y + (layer_height + font_size * .7) / 2, style);

				if (vertical_text)
					// 文字以方塊的中心為原點，順時針旋轉90度。
					SVG_object.lastAdd.setAttribute('transform', 'rotate(90 '
							+ (from_x + width / 2) + ' '
							+ (layer_from_y + layer_height / 2) + ')');
			}
			SVG_object.addTitle(name + ' (' + duration + ')');

			var lastAdd = SVG_object.lastAdd;
			if (font_size === MIN_FONT_SIZE) {
				lastAdd.title = name;
				lastAdd.onmouseover
				//
				= set_SVG_text_properties;
				lastAdd.onmouseout
				//
				= recover_SVG_text_properties;
			}

			if (!lastAdd.dataset)
				// 目前僅 Chrome 支援。
				lastAdd.dataset = CeL.null_Object();
			lastAdd.dataset.hierarchy
			//
			= period_hierarchy + name;
			lastAdd.onclick
			//
			= is_Era ? draw_era.click_Era : draw_era.click_Period;
		};

		periods.forEach(function(region) {
			layer_count = region.length;
			layer_from_y = draw_era.top;
			layer_height = draw_era.height / layer_count;

			region.forEach(function(pl) {

				(period_list = pl).forEach(draw_period);

				layer_from_y += layer_height;
			});
		});

		draw_era.last_hierarchy = hierarchy;

		if (period_hierarchy = short_period.length > 0) {
			short_period.unshift({
				// 過短紀年
				T : '難辨識時段：'
			});
			// 清理場地。
			CeL.remove_all_child('era_graph_unobvious');
			CeL.new_node(short_period, 'era_graph_unobvious');
		}
		CeL.toggle_display('era_graph_unobvious', period_hierarchy);
	}

	draw_era.draw_navigation(hierarchy);

	// -----------------------------

	// 額外圖資。
	if (CeL.is_Object(draw_era.tags)) {
		periods = [];
		for ( var group in draw_era.tags) {
			CeL.debug('Draw group: [' + group + ']', 2);
			var data = draw_era.tags[group];
			if (!data.hide)
				for ( var period in data)
					add_tag.show(data[period]);
			periods.push({
				b : [ group === draw_era.default_group ? [ '(', {
					T : 'general'
				}, ')' ] : group, {
					span : add_tag.group_count[group] || '',
					C : 'count'
				} ],
				R : group,
				C : data.hide ? 'hide' : '',
				onclick : function() {
					var data = draw_era.tags[this.title];
					data.hide = !data.hide;
					draw_era.redraw();
					return false;
				}
			});
		}

		if (period_hierarchy = periods.length > 0) {
			periods.unshift({
				T : '資料圖層',
				onclick : function() {
					select_panel('data_layer');
					return false;
				},
				S : 'cursor: pointer;'
			}, ' :');
			// 清理場地。
			CeL.remove_all_child('data_layer_menu');
			CeL.new_node(periods, 'data_layer_menu');
		}
		CeL.toggle_display('data_layer_menu', period_hierarchy);
	} else
		CeL.debug('No group found.', 2);

}

draw_era.options = {
	merge_periods : true
};

draw_era.redraw = function() {
	draw_era(SVG_object.hierarchy);
};

// click and change the option of this.title
draw_era.change_option = function() {
	var option = this.title.replace(/\s[\s\S]*/, ''), setted = draw_era.options[option];
	CeL.set_class(this, 'setted', {
		remove : setted
	});
	draw_era.options[option]
	//
	= !setted;
	draw_era.redraw();
	return false;
};

draw_era.default_group = '\n';
// draw_era.tags[group][period] = [ date_range, height_range, title, style ];
draw_era.tags = CeL.null_Object();

draw_era.draw_navigation = function(hierarchy, last_is_Era) {
	var period_hierarchy = '',
	// 
	navigation_list = [ {
		T : '導覽列：'
	}, {
		a : {
			T : '所有國家'
		},
		href : '#',
		target : '_self',
		onclick : draw_title_era
	} ];

	if (Array.isArray(hierarchy))
		hierarchy.forEach(function(name, index) {
			period_hierarchy += (period_hierarchy ? era_name_classifier : '')
					+ name;
			var name_showed = name.match(CeL.era.PERIOD_PATTERN);
			name_showed = name_showed ? '[' + name_showed[1] + ']' : name;

			navigation_list.push(' » ', last_is_Era
					&& index === hierarchy.length - 1 ? {
				span : name_showed,
				title : period_hierarchy
			} : {
				a : name_showed,
				href : '#',
				target : '_self',
				title : period_hierarchy,
				onclick : draw_title_era
			});
			if (name in draw_era.date_cache) {
				name = draw_era.date_cache[name];
				navigation_list.push(' (', {
					a : name.start,
					href : '#',
					target : '_self',
					title : name.start,
					onclick : draw_era.click_navigation_date
				}, {
					span : '–',
					title : name.start.to_Date({
						parser : 'CE',
						year_padding : 0
					}).age(name.end.to_Date({
						parser : 'CE',
						year_padding : 0
					}))
				}, {
					a : name.end,
					href : '#',
					target : '_self',
					title : name.end,
					onclick : draw_era.click_navigation_date
				}, ')');
			}
		});

	// 清理場地。
	CeL.remove_all_child('era_graph_navigation');
	CeL.new_node(navigation_list, 'era_graph_navigation');
};

draw_era.click_navigation_date = function() {
	era_input_object.setValue(this.title);
	output_format_object.setValue('共存紀年');
	translate_era();
	return false;
};

draw_era.click_Era = function() {
	var hierarchy = this.dataset.hierarchy.split(era_name_classifier), era = CeL
			.era(hierarchy.join(''));
	draw_era.draw_navigation(hierarchy, true);

	era_input_object.setValue(era.format({
		format : era.精 === '年' ? '%紀年名%年年' : '%紀年名%年年%月月%日日',
		locale : 'cmn-Hant-TW'
	}));
	translate_era();
	return false;
};

draw_era.click_Period = function() {
	draw_era(this.dataset.hierarchy.split(era_name_classifier));
	return false;
};

// 定義繪製範圍。
draw_era.left = 10;
draw_era.top = 0;
draw_era.width = 1000;
draw_era.height = 400;
// 底部預留高度。
draw_era.bottom_height = 0;

draw_era.date_options = {
	parser : 'CE',
	format : '%Y/%m/%d'
};
draw_era.year_options = {
	parser : 'CE',
	format : '%Y'
};

draw_era.ruler_date_options = {
	parser : 'CE',
	format : '%Y.%m'
};
draw_era.ruler_date_year_options = {
	parser : 'CE',
	format : '%Y'
};

draw_era.date_cache = CeL.null_Object();

// ---------------------------------------------------------------------//

var last_selected, select_panels = {
	// 查詢範例
	example : '測試範例',
	// 之前輸入資料
	input_history : '輸入紀錄',

	// concept:'工具說明',
	// 使用技巧
	FAQ : '使用說明',

	era_graph : '紀年線圖',
	data_layer : '資料圖層',
	// 年表
	calendar : '曆譜',
	// 整批轉換
	batch_processing : '批次轉換',
	tag_text : '標注文本',
	pack_data : '曆數處理',
	comments : '問題回報'
};

function select_panel(id, show) {
	if (!(id in select_panels))
		return;

	if (last_selected === id) {
		show = CeL.toggle_display(last_selected, show) === 'none';
		CeL.set_class(last_selected + click_panel.postfix, 'selected', {
			remove : show
		});
		if (show)
			last_selected = null;
		return;
	}

	if (last_selected) {
		CeL.toggle_display(last_selected, false);
		CeL.set_class(last_selected + click_panel.postfix, 'selected', {
			remove : true
		});
	}

	CeL.set_class(id + click_panel.postfix, 'selected');
	CeL.toggle_display(last_selected = id, true);
}

click_panel.postfix = '_panel';
click_panel.postfix_RegExp = new RegExp(click_panel.postfix + '$');
function click_panel(e) {
	select_panel(this.id.replace(click_panel.postfix_RegExp, ''));
	return false;
}

// ---------------------------------------------------------------------//

var original_input, era_input_object, last_input, output_numeral, SVG_object, output_format_object,
// 正解
output_format_types = {
	'公元日期' : CE_name + '%Y年%m月%d日',
	'朝代紀年日期' : '%紀年名%年年%月月%日日',
	'共存紀年' : '共存紀年',
	'年月日干支' : '%年干支年%月干支月%日干支日',
	'年月日時干支' : '%年干支年%月干支月%日干支日%時干支時',
	'四柱八字' : '%八字',
	// 'Julian Day' : 'JD%JD',
	'Julian Day Number' : 'JDN%JDN'
};

function input_era(key) {
	CeL.log(key + ',' + list + ',' + force);
	original_input.apply(this, arguments);
}

var 準確程度_MESSAGE = {
	疑 : '尚存疑',
	傳說 : '為傳說時代之資料'
}, J_translate = {
	H : '平成',
	S : '昭和',
	T : '大正',
	M : '明治'
}, country_color = {
	天皇 : '#9cf',

	朝鮮 : '#ccf',
	新羅 : '#ccf',
	百濟 : '#ccf',
	高句麗 : '#ccf',
	高麗 : '#ccf',
	대한민국 : '#ccf',
	'일제 강점기' : '#ccf',
	조선주체연호 : '#ccf',

	越南 : '#9f9',
	黎 : '#9f9',
	阮 : '#9f9',
	莫 : '#9f9'
}, had_inputted = CeL.null_Object(), country_PATTERN;

(function() {
	country_PATTERN = [];
	for ( var n in country_color)
		country_PATTERN.push(n);
	country_PATTERN = new RegExp('(' + country_PATTERN.join('|') + ')', 'i');
})();

function add_contemporary(era, output_numeral) {
	var o = {
		a : output_numeral === 'Chinese' ? CeL.to_Chinese_numeral(era) : era,
		title : era,
		href : '#',
		target : '_self',
		onclick : click_title_as_era,
		C : '共存紀年'
	}, matched = era.match(country_PATTERN);
	if (matched)
		o.S = 'background-color: ' + country_color[matched[1]] + ';';
	return o;
}

function translate_era(era) {

	function add_注(key, name, add_node) {
		function add_item(note, index) {
			output.push({
				br : null
			}, {
				T : name || key
			}, 0 < index ? ' ' + (index + 1) : '', '：', add_node
					&& add_node(note) || {
						span : note,
						C : 'note'
					});
		}

		if (date[key]) {
			if (!Array.isArray(output))
				output = [ output ];
			if (Array.isArray(date[key]))
				date[key].forEach(add_item);
			else
				add_item(date[key]);
		}
	}

	if (!era)
		era = era_input_object.setValue();

	era = era.trim();

	var output, date;
	if (('era_graph' in select_panels) && CeL.parse_period.PATTERN.test(era))
		return add_tag(era);

	// 前置處理。

	// http://maechan.net/kanreki/index.php
	// 和暦入力時の元号は、『明治』『大正』『昭和』『平成』に限り、各々『M』『T』『S』『H』の頭文字でも入力できます。
	if (date = era.match(/^([HSTM])\s*(\d+)(\D.*)?$/i))
		era = J_translate[date[1]] + date[2] + (date[3] || '年');

	date = CeL.era(era, {
		// 尋精準 : 4,
		numeral : output_numeral
	});
	if (date) {
		set_era_by_url_data(era);

		if (!(date.國家 in had_inputted)) {
			if (date.國家 === 'Maya')
				// 自動增加此欄。
				selected_column['calendar/Long_Count']
				//
				= selected_column['calendar/Tzolkin']
				//
				= selected_column['calendar/Haab'] = true;

			had_inputted[date.國家] = true;
		}

		if (date.紀年名)
			// 因為紀年可能橫跨不同時代(朝代)，因此只要確定找得到，那就以原先的名稱為主。
			show_calendar(era);

		var format = output_format_object.setValue();
		if (!format)
			format = output_format_object.setValue(
			//
			CE_name + '%Y年' + (date.精 === '年' ? '' : '%m月%d日'));

		if (format === '共存紀年')
			if (Array.isArray(output = date.共存紀年))
				output.forEach(function(era, index) {
					output[index] = [ ' [' + (index + 1) + '] ',
							add_contemporary(era, output_numeral) ];
				});
			else
				output = {
					span : '無共存紀年',
					C : 'fadeout'
				};

		else {
			// get the result
			output = date.format({
				parser : 'CE',
				format : format,
				locale : 'cmn-Hant-TW',
				numeral : output_numeral,
				as_UTC_time : true
			});
			if (output_numeral === 'Chinese')
				output = CeL.to_Chinese_numeral(output);
			if (output !== era)
				output = {
					a : output,
					title : (CE_PATTERN.test(output) ? '共存紀年:' : '') + output,
					href : '#',
					target : '_self',
					onclick : click_title_as_era
				};

			add_注('曆法', '採用曆法');
			add_注('據', '出典');
			add_注('君主名', '君主姓名', function(note) {
				return {
					a : note,
					href : 'https://'
							+ (PATTERN_NOT_ALL_ALPHABET.test(note) ? 'zh'
									: 'en') + '.wikipedia.org/wiki/' + note,
					C : 'note'
				};
			});
			// add_注('君主');
			add_注('君主字');
			add_注('廟號');
			add_注('諡');
			add_注('生', '君主出生日期', function(note) {
				return {
					a : note,
					title : '共存紀年:' + note,
					href : '#',
					onclick : click_title_as_era,
					C : 'note'
				};
			});
			add_注('卒', '君主逝世日期', function(note) {
				return {
					a : note,
					title : '共存紀年:' + note,
					href : '#',
					onclick : click_title_as_era,
					C : 'note'
				};
			});
			add_注('在位');

			if (date.name[1] && date.name[1].includes('天皇'))
				// append name.
				if (Array.isArray(date.天皇))
					// 不動到原 data。
					(date.天皇 = date.天皇.slice()).unshift(date.name[1]);
				else
					date.天皇 = date.天皇 ? [ date.name[1], date.天皇 ]
							: [ date.name[1] ];
			add_注('天皇', '漢風諡号・追号', function(note) {
				return {
					a : note,
					href : 'https://ja.wikipedia.org/wiki/' + note,
					C : 'note'
				};
			});
			// add_注('諱');
			add_注('據', '資料來源');

			add_注('注');

			if (date.準 || date.精) {
				if (!Array.isArray(output))
					output = [ output ];
				output.unshift({
					em : [ '此輸出值', 準確程度_MESSAGE[date.準] || '僅約略準確至'
					//
					+ (date.準 || date.精)
					//
					+ (/^\d+[年月日]$/.test(date.準 || date.精) ? '前後' : ''),
							'，僅供參考： ' ]
				});
			}
		}

		CeL.remove_all_child('era_output');
		CeL.new_node(output, 'era_output');

		if (era && era !== last_input)
			CeL.new_node({
				div : {
					a : last_input = era,
					title : era,
					href : '#',
					target : '_self',
					onclick : click_title_as_era
				}
			}, 'input_history');
	}
}

// ---------------------------------------------------------------------//

function click_title_as_era() {
	var era = String(this.title), matched = era.split(':');
	if (matched && matched.length === 2
	//
	&& (matched[0] = matched[0].trim())
	//
	&& (matched[1] = matched[1].trim())) {
		era = matched[1];
		// set output format
		matched = matched[0];
		if (matched in output_format_types)
			matched = output_format_types[matched];
		output_format_object.setValue(matched);
	}

	era_input_object.setValue(era);
	translate_era(era);
	return false;
}

// ---------------------------------------------------------------------//

function 批次轉換() {
	var date, count = 0, data = CeL.set_text('batch_source').trim().split('\n'),
	//
	prefix = CeL.set_text('batch_prefix'),
	//
	format = output_format_object.setValue(),
	//
	period_end = CeL.set_text('batch_period_end') === '結束';
	if (!format)
		format = output_format_object.setValue('%Y/%m/%d');
	if (format !== '共存紀年')
		format = {
			parser : 'CE',
			format : format,
			locale : 'cmn-Hant-TW',
			numeral : output_numeral,
			as_UTC_time : true
		};
	// 開始轉換。
	data.forEach(function(line, index) {
		if ((line = line.trim()) && (date = CeL.era(prefix + line, {
			period_end : period_end
		}))) {
			count++;
			data[index] = format === '共存紀年' ? date.共存紀年 || '' : date
					.format(format);
		}
	});
	CeL.set_text('batch_result', data.join('\n'));
	CeL.log('共轉換 ' + count + '/' + data.length + ' 筆。');
	return false;
}

// ---------------------------------------------------------------------//

function parse_text(text) {
	if (!CeL.era)
		return false;

	if (text)
		CeL.set_text('original_text', text);
	else
		text = CeL.set_text('original_text');

	// 標注文本 點擊(點選解析)功能。
	CeL.era.to_HTML(text, 'parsed_text', {
		add_date : parse_text.add_date,
		onclick : function() {
			var era = CeL.era.node_era(this, 'String');
			if (era) {
				era = era.to_Date('era').format({
					parser : 'CE',
					format : '%紀年名%年年%月月%日日',
					locale : 'cmn-Hant-TW'
				});
				era_input_object.setValue(era);
				translate_era(era);
			} else
				CeL.warn('解析結果為 [' + era + ']');
		}
	});

	return false;
}

// ---------------------------------------------------------------------//

var set_era_by_url_data_running;
function set_era_by_url_data(era) {
	if (set_era_by_url_data_running)
		return;
	set_era_by_url_data_running = true;

	if (typeof era === 'string')
		location.hash = '#era=' + era;

	else {

		// 直接處理 hash / search。
		// e.g., "era.htm#era=%E5%A4%A7%E6%B0%B82%E5%B9%B4&column="
		// #era=景元元年&column=-contemporary&layer=臺灣地震
		// #hierarchy=中國/東漢/安帝
		// #hierarchy=中國/清&layer=臺灣地震
		var column, items, data = CeL.parse_URI.parse_search(location.search
				.slice(1), CeL.parse_URI.parse_search(location.hash.slice(1)));

		if (column = data.column) {
			(Array.isArray(column) ? column : [ column ])
			//
			.forEach(function(item) {
				var to_remove;
				if (to_remove = item.charAt(0) === '-')
					item = item.slice(1);
				selected_column[item] = !to_remove;
			});
		}

		if (!(era = data.era)
				//
				&& !/[&=]/.test(items = location.search.slice(1)
						|| location.hash.slice(1)))
			era = items;

		if (items = data.layer) {
			if (!Array.isArray(items))
				items = items.split(',')
			items.forEach(function(item) {
				add_tag.load(item);
			});
		}

		if (era)
			click_title_as_era.call({
				title : decodeURIComponent(era)
			});
		else if (column && era_input_object.setValue())
			translate_era();
		else if (items = data.hierarchy)
			draw_era(Array.isArray(items) ? items : items.split(/[,\/]/));
	}

	set_era_by_url_data_running = false;
}

// ---------------------------------------------------------------------//

var thdl_solar_term,
//
initialize_thdl_solar_term = function() {
	// 一整天的 time 值。should be 24 * 60 * 60 * 1000 = 86400000.
	var ONE_DAY_LENGTH_VALUE = new Date(0, 0, 2) - new Date(0, 0, 1),
	//
	STARTS_FROM = 14, DIGITS = 4, MAX_DIGITS = 10 + 26,
	//
	last_date = null, start_year, result = [],
	//
	data = ',,,,,,,,,,,,,,,,,,,,1516-01-10,15,15,15;xohayhfyt;yx7pjq7ut;13mepi9aok;1mmes224b9;xohayhfyt;dhgfgfgggfgfgfffdheffeff;13m8lqq0r8;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;gffgfggfgggffgffgdfeffff;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xt;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq8g5;13m8seg9xw;1mmes224b9;xohayhfyt;ffgfgfgggfgidffffffefeff;13m8seg9xw;1mmes226ol;xohayhfyt;yx7pjq8g5;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq8g5;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq8g5;fgffeifgggfgfffffffefffe;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xr40fw2s5;yx7pjq7ut;13m8seg9xw;1mmes224b9;fffgfgggfggffgfcieffefff;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;yukmozl05;yx7pjq7ut;13m8seg9xw;gfidfggfgggffgffeffeffff;xr4dt80et;yxve4kklh;13m8seg9xx;xohayh6c5;xr4dt80et;yx7pjq7ut;13m8seg9xw;1mmes224b9;fffgfgggfggfgffffeffekaf;yx7pjq7ut;13m8seg9xt;1mmer82a8l;xohb0cv85;yx7pjq7ut;ffgfggfgggfgdhffffefffef;1mmer7lff9;xohb0cv85;yx7pjq7ut;yxvhgfp75;13wxjfez4l;xohayhfyt;yx7pjq5hh;yxvhgfp75;13wxjfez4l;xohayh6hh;yx7pjq5hh;yxvhgfp75;13mephsfv9;xohaqzhg5;xr4dt80ht;f2aum04lt;13mephsfwl;xohayh6hh;xr4dt80et;yx7pr7ww5;13m8seg9xx;xohayh6hh;xr40hri1h;yx7pr7ww5;13m8seg9xw;1mmes226ol;xohb0cv85;yx7pjq7ut;13m8seg9xt;1mmer7lff9;xohb0cv85;yx7pjq7ut;yxvhgfp75;13wxjfj6tx;xohb0cv85;yx7pjq7ut;yxvhgfp75;13wxjfj6tx;xohayhfyt;yul02bio5;yv8rz2dsh;13mephsfv9;fffgfgggfggffgffefffekaf;xr4dt80g5;yxve4kklt;13mephsfv9;xohayh6hh;xr4dt80g5;yx7pr7wwh;fgffggfggggffgffeff00000;,,,,,,,,,,,,,,,,,,,1690-01-05,14,15,15,15;xr40hri1h;yx7pr7ww5;13mephsfvl;xofton505;xohb0cv85;yx7pjq7ut;13m8seg9xw;1mmer83c5x;xohb0cv85;yx7pjq7ut;yxvhgfpsk;1mmer7i9n9;xohb0cv85;yx7pjq7ut;yxvhgfpsh;13wxjfj6tx;xohayhfyt;yx7pjq7ut;13m8seg9ch;13wxjfez4l;xohayhfyt;yx7pjq7ut;yxve4kklt;13mephsfv9;xohayh6hh;xr4dt80g5;yxdmuk2tt;13m8seg9xx;fffgfgggfggffdifefffefff;xr40hri2t;ffgfgfgggfggffffffefdhef;13m8seg9xx;xoftoixat;xohb0cv9h;yx7pjq7ut;13m8seg9xx;xofsuocut;xohb0cv85;yx7pjq7ut;13m8seg9xw;gffgfggfggcjfgffefffefff;xohb0cv8h;yx7pjq7ut;yxvhgfpsl;xofsu28et;xohayhfyt;yx7pjq7v5;13m8p2l5cl;xofsu289h;xohayhfyt;yx7pjq7ut;13m8p2l5cl;xofsu289h;xohayh6hh;yx7c89phh;13m8ov3fpw;1mmer7h7px;xofsuocut;yx7c89n45;yxvdx2vkk;1mm8u451sl;xofsuocut;ymoian3ut;yx7pjq7v5;1mm8u451sl;xofsu7i1h;yx7c89n45;yx7pjq7v5;13m8seg9xx;xofsu7i1h;xr40fw2th;yx7pjq7v5;13m8seg9xx;xofsu6g45;xr40fw2th;yx7pjq7v5;13m8p2l5cl;xoffilq1h;xohayhg05;yx7pjq7v5;fghdggfggfggfffffffeffff;xp3h7ew45;xohayhfyt;yx7pjq7ut;13m8p2l5cl;xofsu289h;xoha4inth;yx7c89phh;13m8ov3gb8;1mm8u451sl;xofsuocut;yx7c89phh;ffgfggfggfgfgfffffefffja;1mm8u451sl;fffgfgdiggfgfgffefffefff;yx7c89n45;yx7pjq7v5;1mbq06iij9;xofsu7i1h;yx7c6e7ut;yx7pjq7v5;13m8seg9xx;xofsu7i1h;xr40fw2th;yy1b0f1ht;13m8p2l5cl;xofsu6g4h;xohayhg05;yx7pjq7v5;13m8p2l5cl;xofsu28et;xohayhg05;yx7pjq7v5;13m8p2l5cl;xofsu28et;xohayhfyt;yx7c89phh;13m8ov3gb9;xofsu289h;xofsuomc5;yx7c89phh;14sc0lllck;1mm8u451sl;xofsuocut;yx7c89phh;yx7pjq7v8;1mm8u451sl;xofsuocut;yx7c89n45;yx7pjq7v5;1mbq06iij9;xofsu7i1h;yx7c6e7ut;yx7pjq7v5;13m8seg9xx;xofsu7i1h;xohayhg05;yx7pjq7v5;13m8p2l5cl;xofsu7i1h;xohayhg05;yx7pjq7v5;13m8p2mgr9;xofsu28et;xohayhg05;yx7c89pht;13ll0p8hn9;xofsu28et;xofsuomdh;yx7c89pht;13melyfm8l;xo9vqq2hh;xofsuomc5;yx7c89phh;13m8ov3gb9;xo9vqq2c5;xofsuomc5;yx7c89phh;yx7pjq8gk;1mbvx9uogl;xofsuocut;yx7c89phh;yx7pjq7v8;1mbq06iij9;xofstz2mt;xr40fw2th;yx7pjq7v5;13m8p2l5cl;xofsu7i1h;xohayhg05;yx7pjq7v5;13m8p2l5cl;xofsu7i1h;xohayhg05;yx7pjq7v5;13m8p2l5cl;xofsu6g45;xohayhg05;yx7c89pht;13wrispzkl;xo9if9k45;xofsuomdh;yx7c89pht;13m8ov3gb9;xo9vr6xat;xofsuomc5;yx7c89phh;13lkn6aa8l;xo9vqq2hh;xofsuomc5;yx7c89phh;yx7pjq8gk;1mbq06iij9;xofsuocut;yx7beaxc5;yx7pjq7v8;1mbq06iij9;xofsu7i1h;xohayhg05;yx7pjq7v5;13m8p2l5cl;xofsu7i1h;xohayhg05;yx7pjq7v5;13m8p2l5cl;xofsu7i1h;xohayhg05;yx7c89pht;13m8p2l5cl;xofsu6g45;xofsuomdh;yx7c89pht;13m8ov3gb9;xo9vqq2hg;13wxjg1d8l;yx7c89pht;13ll0hqslx;xo9vqq2hh;xofsuomdh;yx7c89pht;13ll0hqslx;xo9vqq2hi;8qguh9mvp;yx7c89phh;yx7pjpwlw;1mbq06iij9;xofsuocut;yx7c89phh;yx7pjq8gk;1mbpwundxx;fffgfggfggfgffgfdfgfefff;xohayhidh;yx7pjq7v8;13m8p2l5cl;xofsu7hud;xohaymqf9;yx7c89pht;13m8p2l5cl;xofsu7i1h;xoftoneit;yx7c89pht;13m8p2l5cl;xo9vqvc45;xofsuomdh;yx7c89pht;13m8ov3dxx;xo9vqq2hh;xofsuomdh;yx7c89pht;13ll0hqslx;xo9vqq2hh;fffgfggfggfgfgfffef00000'
			.split(';');

	data.forEach(function(year_data, index) {
		if (year_data.contains(',')) {
			year_data = year_data.split(',');
			year_data.forEach(function(solar_term, index) {
				if (!year_data[index])
					return;
				if (year_data[index] > 0) {
					last_date += year_data[index] * ONE_DAY_LENGTH_VALUE;
				} else {
					last_date = year_data[index].to_Date('CE');
					if (!start_year)
						result.start = start_year
						// - 1: 1516 春分前末幾個節氣，算前一年的。
						= last_date.getFullYear() - 1;
					last_date = last_date.getTime();
				}
				year_data[index] = last_date;
			});

		} else if (year_data.length === 24) {
			year_data = year_data.split('');

			year_data.forEach(function(solar_term, index) {
				last_date += parseInt(solar_term, MAX_DIGITS)
						* ONE_DAY_LENGTH_VALUE;
				year_data[index] = last_date;
			});

		} else {
			year_data = parseInt(year_data, MAX_DIGITS)
			//
			.toString(DIGITS).split('');
			while (year_data.length < 24)
				// 補 0。
				year_data.unshift(0);
			// assert: year_data.length === 24
			year_data.forEach(function(solar_term, index) {
				last_date += ((year_data[index] | 0) + STARTS_FROM)
						* ONE_DAY_LENGTH_VALUE;
				year_data[index] = last_date;
			});
		}

		// for debug
		if (false && year_data.length !== 24)
			throw index + ':' + data[index];
		result[index + start_year] = year_data;
	});

	thdl_solar_term = result;

	initialize_thdl_solar_term = null;
}

// ---------------------------------------------------------------------//

// 設定是否擋住一次 contextmenu。
var no_contextmenu;
window.oncontextmenu = function(e) {
	if (no_contextmenu) {
		no_contextmenu = false;
		return false;
	}
};

var SVG_min_width = 600, SVG_min_height = 500, SVG_padding = 30,
//
no_SVG_message = '您的瀏覽器不支援 SVG，或是 SVG 動態繪圖功能已被關閉，無法繪製紀年時間軸線圖。';
function affairs() {
	if (!_) {
		// console.warn('程式初始化作業尚未完成。');
		setTimeout(affairs, 80);
		return;
	}

	CeL.log({
		T : 'Initializing...'
	}, true);

	CeL.toggle_display('input_panel', true);

	_.create_menu('language', [ 'TW', 'CN', 'ja', 'en' ], function() {
		draw_era.redraw();
	});

	// handle with document.title in IE 8.
	if (CeL.set_text.need_check_title)
		_.document_title = document_title;

	// translate all nodes to show in specified language (or default domain).
	_.translate_nodes();

	// -----------------------------

	// google.visualization.CandlestickChart
	// Org Chart 組織圖
	// Geo Chart 地理圖

	// onInput(key,list,force)

	era_input_object = new CeL.select_input('era_input', CeL.era
			.get_candidate(), 'includeKeyWC');

	CeL.get_element('era_input').onkeypress
	//
	= CeL.get_element('output_format').onkeypress = function(e) {
		if (!e)
			e = window.event;
		// press [Enter]
		if (13 === (e.keyCode || e.which || e.charCode))
			translate_era();
	};

	CeL.get_element('output_format').onchange
	//
	= CeL.get_element('translate').onclick = function() {
		translate_era();
		return false;
	};

	var i, v, o = output_format_types, list = [],
	// output_format_types 反解: auto-generated
	output_format_types_reversed = CeL.null_Object();
	// reset output_format_types to local language expression.
	output_format_types = CeL.null_Object();
	// 在地化的輸出格式。
	if (_.is_domain_name('ja'))
		o['六曜'] = '%六曜';
	for (i in o) {
		output_format_types[_(i)] = v = o[i];
		list.push({
			span : {
				T : i
			},
			R : output_format_types_reversed[v] = i,
			D : {
				format : v
			},
			C : 'format_button',
			onclick : function() {
				output_format_object.setValue(this.dataset.format);
				translate_era();
				return false;
			}
		}, ' ');
	}
	CeL.new_node(list, 'format_type_bar');

	output_format_object = new CeL.select_input('output_format',
			output_format_types_reversed, 'includeKeyWC');
	// original_input = era_input_object.onInput;
	// era_input_object.onInput = input_era;
	// era_input_object.setSearch(set_search_list);

	// CeL.Log.toggle(false);

	list = [];
	o = [];
	i = [ '共存紀年:546/3/1', '共存紀年:1546-3-1', '年月日時干支:一八八〇年四月二十一日七時',
			'年月日時干支:一八八〇年庚辰月庚辰日7時', '公元日期:一八八〇年庚辰月庚辰日庚辰時', '初始元年11月1日',
			'明思宗崇禎1年1月26日', '公元日期:天聰二年甲寅月戊子日', '公元日期:天聰2年寅月戊子日',
			'清德宗光緒六年三月十三日', '清德宗光緒庚辰年三月十三日', '清德宗光緒庚辰年庚辰月庚辰日',
			'清德宗光緒六年三月十三日辰正一刻', '魏少帝嘉平4年5月1日', '魏少帝嘉平4年閏5月1日', '魏少帝嘉平4年閏月1日',
			'景元元年', '景元元年7月', '元文宗天曆2年8月8日', '元文宗天曆3/1/2', '共存紀年:JD2032189',
			'平成26年6月8日', 'H26.6.8', '漢和帝劉肇（79年–106年2月13日）' ];
	i.forEach(function(era) {
		list.push({
			div : {
				a : era,
				title : era,
				href : '#',
				target : '_self',
				onclick : click_title_as_era
			}
		});
		o.push(era.replace(/^[^:]+:/, ''));
	});
	CeL.new_node(list, 'example');
	CeL.set_text('batch_source', o.join('\n'));

	// -----------------------------

	SVG_object = CeL.get_element('era_graph_SVG');
	// 紀年線圖按滑鼠右鍵可回上一層。
	SVG_object.onclick =
	// Chrome use this.
	SVG_object.onmousedown = function era_graph_move_up(e) {
		if (!e)
			e = window.event;
		// http://stackoverflow.com/questions/2405771/is-right-click-a-javascript-event
		if (
		// Gecko (Firefox), WebKit (Safari/Chrome) & Opera
		'which' in e ? e.which === 3
		// IE, Opera
		: ('button' in e) && e.button === 2) {
			var hierarchy = draw_era.last_hierarchy;
			if (Array.isArray(hierarchy) && hierarchy.length > 0) {
				hierarchy.pop();
				draw_era(hierarchy);
				no_contextmenu = true;
				e.stopPropagation();
				return false;
			}
		}
	};

	// 為取得 offsetHeight，暫時先 display。
	CeL.toggle_display('era_graph', true);
	CeL.toggle_display(SVG_object, true);
	era_name_classifier = CeL.era.pack.era_name_classifier;
	var SVG_width = SVG_object.offsetWidth, SVG_height = SVG_object.offsetHeight;
	CeL.debug('SVG: ' + SVG_width + '×' + SVG_height);
	if (SVG_width < SVG_min_width || SVG_height < SVG_min_height) {
		CeL.err('當前視窗過小。將採用螢幕之大小，請將視窗放到最大。');
		if (SVG_width < SVG_min_width)
			SVG_width = Math.max((screen.availWidth || screen.width)
					- SVG_padding, SVG_min_width);
		if (SVG_height < SVG_min_height)
			SVG_height = Math.max((screen.availHeight || screen.height)
					- SVG_padding, SVG_min_height);

	}
	draw_era.width = SVG_width - 2 * draw_era.left;
	// 須扣掉 era_graph_navigation 高度。
	draw_era.height = SVG_height - draw_era.top - draw_era.bottom_height
			- CeL.get_element('era_graph_navigation').offsetHeight;

	SVG_object = new CeL.SVG(SVG_width, SVG_height);

	var is_IE11 = /Trident\/7/.test(navigator.appVersion);
	if (SVG_object.status_OK() && !is_IE11) {
		SVG_object.attach('era_graph_SVG');
		draw_era();
	} else {
		CeL.get_element('era_graph').style.display = 'none';
		SVG_object = null;
		delete select_panels['era_graph'];
		delete select_panels['data_layer'];
		if (is_IE11)
			// 多按幾次就會 hang 住。
			CeL.err('IE 11 尚無法使用線圖。請考慮使用 Chrome 或 Firefox 等網頁瀏覽器。');
		CeL.warn(no_SVG_message);
	}

	// -----------------------------

	if (SVG_object) {

		// 設置選項
		CeL.new_node([ {
			T : '紀年線圖選項：'
		}, {
			T : '合併歷史時期',
			title : 'merge_periods\ne.g., 三國兩晉南北朝, 五代十國',
			onclick : draw_era.change_option,
			C : 'option' + (draw_era.options.merge_periods ? ' setted' : '')
		}, {
			T : '擴張範圍至君主在世時段',
			title : 'adapt_lifetime',
			onclick : draw_era.change_option,
			C : 'option' + (draw_era.options.adapt_lifetime ? ' setted' : '')
		} ], 'era_graph_options');

		// 資料圖層
		list = [ {
			div : {
				T : '請選擇所欲載入之資料圖層。'
			}
		} ];

		v = add_tag.data_file;
		for (i in v) {
			o = {
				a : i,
				href : '#',
				target : '_self',
				title : i,
				C : 'data_item',
				onclick : function() {
					var group = this.title, status = add_tag.load(group, true);
					if (status)
						CeL.info('data layer [' + group + ']: ' + status);
					else
						add_tag.load(group, function() {
							CeL.new_node({
								span : '✓',
								C : 'loaded_mark'
							}, [ this.parentNode, 1 ]);
							this.className += ' loaded';
							CeL.new_node([
									' ... ',
									{
										T : [ '已載入 %1 筆資料。',
												add_tag.group_count[group] ],
										C : 'status'
									} ], this.parentNode);
						}.bind(this));
					return false;
				}
			};

			i = v[i];
			if (i[1])
				o = [ o, ' (', {
					T : '資料來源'
				}, ': ', i[2] ? {
					a : i[1],
					href : i[2],
					target : '_blank'
				} : i[1], ')' ];

			if (i[3]) {
				if (!Array.isArray(o))
					o = [ o ];
				o.push(' ', i[3]);
			}

			list.push({
				div : o,
				C : 'data_line'
			});
		}

		CeL.new_node(list, 'data_layer');
	}

	// -----------------------------

	list = [];
	for (i in select_panels) {
		CeL.toggle_display(i, false);
		if (select_panels[i])
			list.push({
				a : {
					T : select_panels[i]
				},
				id : i + click_panel.postfix,
				href : "#",
				C : 'note_botton',
				onclick : click_panel
			}, ' | ');
		else
			delete select_panels[i];
	}
	list.pop();
	CeL.remove_all_child('note_botton_layer');
	CeL.clear_class('note_botton_layer');
	CeL.new_node(list, 'note_botton_layer');

	select_panel('era_graph' in select_panels ? 'era_graph' : 'FAQ');

	// -----------------------------

	var
	// copy from data.date.
	// 一整天的 time 值。should be 24 * 60 * 60 * 1000 = 86400000.
	ONE_DAY_LENGTH_VALUE = new Date(0, 0, 2) - new Date(0, 0, 1),
	// for 皇紀.
	kyuureki, Koki_year_offset = 660, Koki_year = Year_numbering(Koki_year_offset),
	// for 泰國佛曆
	THAI_Year_numbering = Year_numbering(543);

	// calendar_column
	list = {
		// 公曆日期格式
		JDN : [
				{
					a : {
						T : 'JDN'
					},
					R : _('Julian Day Number')
							+ '\n以 UTC 相同日期當天正午12時為準。\n因此 2000/1/1 轉為 2451545。',
					href : 'https://en.wikipedia.org/wiki/Julian_Day_Number'
				},
				function(date) {
					var date_String = CeL.Date_to_JDN(date.adapt_offset(0))
							+ (date.精 === '年' ? '–' : '');
					// 還原 local 之時間。
					date.adapt_offset('');
					return date_String;
				} ],

		JD : [
				{
					a : {
						T : 'JD'
					},
					R : _('Julian Date')
							+ '\n以「紀元使用地真正之時間」相同日期當天凌晨零時為準。\n因此對中國之朝代、紀年，2000/1/1 將轉為 2451544.1666... (2000/1/1 0:0 UTC+8)',
					href : 'http://en.wikipedia.org/wiki/Julian_day'
				},
				function(date) {
					var date_String = CeL.Date_to_JD(date.adapt_offset())
							+ (date.精 === '年' ? '–' : '');
					// 還原 local 之時間。
					date.adapt_offset('');
					return date_String;
				} ],

		ISO : [
				{
					a : {
						T : 'ISO 8601'
					},
					R : 'YYYY-MM-DD\nThe standard uses the proleptic Gregorian calendar.',
					href : 'https://en.wikipedia.org/wiki/ISO_8601',
					S : 'font-size:.8em;'
				}, function(date) {
					var year = date.getFullYear() | 0;
					return date.精 === '年' ? year + '年'
					//
					: year.pad(year < 0 ? 5 : 4) + date.format('-%2m-%2d');
				} ],

		ordinal_date : [ {
			a : {
				T : '年日期'
			},
			R : '表示年內的天數',
			href : 'https://en.wikipedia.org/wiki/Ordinal_date'
		}, function(date) {
			var year = date.getFullYear() | 0;
			return date.精 === '年' ? year + '年'
			//
			: year.pad(4) + '-' + CeL.ordinal_date(date).pad(3);
		} ],

		week_date : [ {
			a : {
				T : '週日期'
			},
			R : '表示年內的星期數天數，再加上星期內第幾天。',
			href : 'https://en.wikipedia.org/wiki/ISO_week_date'
		}, function(date) {
			return date.精 === '年' ? date.getFullYear() + '年'
			//
			: CeL.week_date(date, true);
		} ],

		Unix : [ {
			a : {
				T : 'Unix time'
			},
			R : 'Unix time (a.k.a. POSIX time or Epoch time), Unix時間戳記不考慮閏秒。',
			href : 'https://en.wikipedia.org/wiki/Unix_time'
		}, CeL.date.Unix_time ],

		Excel : [ {
			a : {
				T : 'Excel'
			},
			R : 'Microsoft Excel for Windows 使用 1900 日期系統。',
			href : 'http://support.microsoft.com/kb/214094',
			S : 'font-size:.8em;'
		}, function(date) {
			return (date = CeL.date.Excel_date(date))
			//
			&& (date | 0) || CeL.Excel_date.error_value;
		} ],

		Excel_Mac : [ {
			a : {
				T : 'Excel Mac'
			},
			R : 'Microsoft Excel for Mac 使用 1904 日期系統。',
			href : 'http://support.microsoft.com/kb/214094',
			S : 'font-size:.8em;'
		}, function(date) {
			return (date = CeL.date.Excel_date.Mac(date))
			//
			&& (date | 0) || CeL.Excel_date.error_value;
		} ],

		contemporary : [ {
			T : '共存紀年',
			R : '本日/本年同時期存在之其他紀年。對未有詳實資料者，僅約略準確至所列日期！'
		}, function(date) {
			return date.共存紀年 || '';
		} ],

		// --------------------------------------------------------------------
		// 天文計算 astronomical calculations
		astronomical : '天文計算',

		solarterms : [ {
			a : {
				T : '天文節氣'
			},
			R : '節氣 + 交節時刻(@當地時間)或七十二候。計算得出，非實曆。誤差約在前後十秒鐘內。\n'
			//
			+ '節氣之後每五日一候，非採用 360/72 = 5° 一候。\n'
			//
			+ '二十四節氣 / 二分點 (春分秋分) 和二至點 (夏至冬至) / 七十二候 (物候)',
			href : 'https://zh.wikipedia.org/wiki/%E8%8A%82%E6%B0%94'
		}, function(date) {
			if (/* date.準 || */date.精)
				return '';
			var JD = CeL.Date_to_JD(date.adapt_offset());
			// 還原 local 之時間。
			date.adapt_offset('');
			date = CeL.solar_term_of_JD(JD, {
				pentads : true,
				time : true
			});
			return !date || date.contains('候') ? date : {
				b : date
			};
		} ],

		apparent : [
				{
					a : {
						T : 'apparent longitude'
					},
					R : '太陽的視黃經, the apparent geocentric celestial longitude of the Sun.',
					href : 'https://en.wikipedia.org/wiki/Apparent_longitude'
				},
				function(date) {
					if (/* date.準 || */date.精)
						return '';
					var JD = CeL.Date_to_JD(date.adapt_offset());
					// 還原 local 之時間。
					date.adapt_offset('');
					return {
						span : CeL.show_degrees(
								CeL.solar_coordinate(JD).apparent, 2)
						// &nbsp;
						.replace(/ /g, CeL.DOM.NBSP),
						C : 'monospaced'
					};
				} ],

		// --------------------------------------------------------------------
		// 曆法 Historical calendar
		calendar : '計算日期的方法',

		Julian : [
				{
					a : {
						T : 'Julian calendar'
					},
					R : 'In fact, proleptic Julian calendar WITHOUT year 0, 不包含0年的外推儒略曆',
					href : 'https://en.wikipedia.org/wiki/Proleptic_Julian_calendar',
					S : 'font-size:.8em;'
				}, function(date) {
					return date.format({
						parser : 'Julian',
						format : date.精 === '年' ? '%Y年' : '%Y/%m/%d'
					});
				} ],

		Gregorian : [
				{
					a : {
						T : 'Gregorian calendar'
					},
					R : 'In fact, proleptic Gregorian calendar INCLUDES year 0, 包含0年的外推格里曆',
					href : 'https://en.wikipedia.org/wiki/Proleptic_Gregorian_calendar',
					S : 'font-size:.8em;'
				}, function(date) {
					return date.format('%Y/%m/%d');
				} ],

		Tabular : [ {
			a : {
				T : '伊斯蘭曆'
			},
			R : 'Tabular Islamic calendar\n日落後為隔日。',
			href : 'http://en.wikipedia.org/wiki/Tabular_Islamic_calendar'
		}, function(date) {
			return date.精 === '年' ? date.to_Tabular({
				format : 'serial'
			})[0] + '年' : date.to_Tabular({
				format : 'serial'
			}).slice(0, 3).join('/') + '; ' + date.to_Tabular();
		} ],

		Hebrew : [
				{
					a : {
						T : '希伯來曆'
					},
					R : 'Hebrew calendar, 猶太曆\n日落後為隔日。\na Jewish "day" begins and ends at shkiah (sunset)',
					href : 'https://en.wikipedia.org/wiki/Hebrew_calendar'
				}, function(date) {
					return date.精 === '年' ? date.to_Hebrew({
						format : 'serial'
					})[0] + '年' : date.to_Hebrew({
						format : 'serial'
					}).slice(0, 3).join('/') + '; ' + date.to_Hebrew();
				} ],

		Long_Count : [
				{
					a : {
						T : '長紀曆'
					},
					R : 'Mesoamerican Long Count calendar / 中美洲馬雅長紀曆',
					href : 'https://en.wikipedia.org/wiki/Mesoamerican_Long_Count_calendar'
				},
				function(date) {
					return CeL.Maya_Date.to_Long_Count(date)
							+ (date.精 === '年' ? '–' : '');
				} ],

		// TODO: 馬雅 Short Count
		// https://en.wikipedia.org/wiki/Maya_calendar#Short_Count

		Tzolkin : [
				{
					a : {
						T : "Maya Tzolk'in"
					},
					R : "中美洲馬雅 Tzolk'in 曆",
					href : 'https://en.wikipedia.org/wiki/Tzolk%27in',
					S : 'font-size:.8em;'
				},
				function(date) {
					return CeL.Maya_Date.to_Tzolkin(date)
							+ (date.精 === '年' ? '–' : '');
				} ],

		Haab : [ {
			a : {
				T : "Maya Haab'"
			},
			R : "中美洲馬雅 Haab' 曆",
			href : 'https://en.wikipedia.org/wiki/Haab%27',
			S : 'font-size:.8em;'
		}, function(date) {
			return CeL.Maya_Date.to_Haab(date) + (date.精 === '年' ? '–' : '');
		} ],

		Dai : [
				{
					a : {
						T : '傣曆',
					},
					R : '西雙版納傣曆紀元始於公元638年3月22日，可轉換之範圍於傣曆714年（1352/3/28–）至3190年期間內。\n有0年。非精確時，可能有最多前後2年的誤差。',
					href : 'http://zh.wikipedia.org/wiki/%E5%82%A3%E6%9B%86'
				},
				function(date) {
					var dai;
					return date - CeL.Dai_Date.epoch < 0
					// 超出可轉換之範圍。
					|| isNaN((dai = date.to_Dai({
					// format : 'serial'
					}))[0]) ? '約' + date.to_Dai({
						ignore_year_limit : true
					})[0] + '年'
					//
					: date.精 === '年' ? dai[0] + '年' : dai.slice(0, 3).join('/')
							+ '(周' + (date.getDay() + 1) + ')'
							+ (dai[3] ? ' ' + dai[3] : '');
				} ],

		Indian_national : [ {
			a : {
				T : '印度國定曆'
			},
			R : 'भारतीय राष्ट्रीय पंचांग / Indian national calendar',
			href : 'https://en.wikipedia.org/wiki/Indian_national_calendar'
		}, function(date) {
			return date.精 === '年' ? date.to_Indian_national({
				format : 'serial'
			})[0] + '年' : date.to_Indian_national({
				format : 'serial'
			}).slice(0, 3).join('/')
			//
			+ '; ' + date.to_Indian_national();
		} ],

		Bahai : [ {
			a : {
				T : '巴哈伊曆'
			},
			R : "Bahá'í / Badí‘ calendar",
			href : "https://en.wikipedia.org/wiki/Bah%C3%A1'%C3%AD_calendar"
		}, function(date) {
			return date.精 === '年' ? date.to_Bahai({
				format : 'serial'
			}).slice(0, 2).join('-') + '年' : date.to_Bahai({
				format : 'serial'
			}).slice(0, 5).join('/') + '; ' + date.to_Bahai();
		} ],

		Coptic : [ {
			a : {
				T : '科普特曆'
			},
			R : 'Coptic calendar',
			href : 'https://en.wikipedia.org/wiki/Coptic_calendar'
		}, function(date) {
			return date.精 === '年' ? date.to_Coptic({
				format : 'serial'
			})[0] + '年' : date.to_Coptic({
				format : 'serial'
			}).slice(0, 3).join('/') + '; ' + date.to_Coptic();
		} ],

		Ethiopian : [ {
			a : {
				T : '衣索比亞曆'
			},
			R : 'Ethiopian calendar',
			href : 'https://en.wikipedia.org/wiki/Ethiopian_calendar'
		}, function(date) {
			return date.精 === '年' ? date.to_Ethiopian({
				format : 'serial'
			})[0] + '年' : date.to_Ethiopian({
				format : 'serial'
			}).slice(0, 3).join('/') + '; ' + date.to_Ethiopian();
		} ],

		// Chinese Buddhist calendar
		Buddhist : [
				{
					a : {
						T : '佛曆'
					},
					R : '佛紀，1911–。佛曆年 = 公曆年 + 543，若過佛誕日（印度曆二月初八，農曆四月初八。）再加1年。\n有採用0年。非精確時，可能有最多前後一年的誤差。',
					href : 'https://zh.wikipedia.org/wiki/%E4%BD%9B%E6%9B%86'
				},
				function(date) {
					var year = date.getFullYear() | 0;
					if (year < 1911) {
						year += 543;
						if (date.getMonth() >= 4)
							year++;
						return '約' + year + '年';
					}

					var era = CeL.era('中曆', {
						get_era : true
					});
					if (date - era.start > 0) {
						era = era.Date_to_date_index(date);
						// 過佛誕日（農曆四月初八）再加1年。
						// era: index (0~)
						if (era[1] > 3 || era[1] === 3 && era[2] >= 7)
							year++;
					}
					return (year + 543)
							+ (date.精 === '年' ? '年' : '/'
									+ (date.getMonth() + 1) + '/'
									+ date.getDate());
				} ],

		// --------------------------------------------------------------------
		// 列具曆注
		曆注 : '具注曆譜/曆書之補充注釋，常與風水運勢、吉凶宜忌相關。',
		// TODO: 農民曆, 暦注計算 http://koyomi8.com/sub/rekicyuu.htm
		// TODO: 建除十二神(十二值位/十二值星/通勝十二建)、血忌等，都被歸入神煞體系
		// TODO: 八節、二至啟閉四節、伏臘、八魁、天李、入官忌、日忌和歸忌
		// see 欽定協紀辨方書
		// http://www.asahi-net.or.jp/~ax2s-kmtn/ref/calendar_j.html
		// http://www.asahi-net.or.jp/~ax2s-kmtn/ref/astrology_j.html

		// 納音 12直 27宿 7曜 節気/72候/没滅日 大小歳/凶会 下段 雑注 日遊 節月
		// http://www.wagoyomi.info/guchu.cgi

		Chinese_solar_terms : [ {
			a : {
				T : '明清節氣'
			},
			R : '明朝、清朝、中國傳統曆法 (1516–1941 CE) 之實曆節氣 from 時間規範資料庫.\n'
			//
			+ '有些問題須注意，見使用說明。',
			href : 'http://140.112.30.230/datemap/reference.php'
		}, function(date) {
			if (/* date.準 || */date.精)
				return '';

			initialize_thdl_solar_term && initialize_thdl_solar_term();

			var year = date.getFullYear();
			if (year < thdl_solar_term.start)
				return '';
			var year_data = thdl_solar_term[year];
			if (!year_data
			//
			|| (date = date.getTime()) < year_data[0])
				// 試試看前一年。
				year_data = thdl_solar_term[--year];

			if (year_data)
				return CeL.SOLAR_TERMS[year_data.indexOf(date)] || '';
		} ],

		// 日柱的五行 日の五行 : 以六十甲子納音代
		納音 : [ {
			a : {
				T : '納音'
			},
			R : '六十甲子納音、納音五行。中曆曆注、日本の暦注の一つ。',
			href : 'https://zh.wikipedia.org/wiki/%E7%B4%8D%E9%9F%B3'
		}, function(date) {
			return /* !date.準 && */!date.精 && CeL.era.納音(date) || '';
		} ],

		反支 : [ {
			a : {
				T : '反支'
			},
			R : '反枳（反支）依睡虎地《日書》（12日一反支）和孔家坡《日書》（6日一反支，以淡色標示。）'
			//
			+ '\n警告：僅適用於中曆、日本之旧暦與紀年！對其他紀年，此處之值可能是錯誤的！',
			href : 'http://www.bsm.org.cn/show_article.php?id=867',
			S : 'font-size:.8em;'
		}, function(date) {
			return /* !date.準 && */!date.精 && CeL.era.反支(date, {
				span : '反支',
				S : 'color:#888;'
			}) || '';
		} ],

		血忌 : [ {
			a : {
				T : '血忌'
			},
			R : '血忌在唐宋曆書中仍為典型歷注項目，後世因之，直至清末，其推求之法及吉凶宜忌都無改變。血忌被歸入神煞體系。',
			href : 'http://shc2000.sjtu.edu.cn/030901/lishu.htm',
			S : 'font-size:.8em;'
		}, function(date) {
			return /* !date.準 && */!date.精 && CeL.era.血忌(date) || '';
		} ],

		月の別名 : [
				{
					a : {
						T : '月の別名'
					},
					R : '各月の別名',
					href : 'https://ja.wikipedia.org/wiki/%E6%97%A5%E6%9C%AC%E3%81%AE%E6%9A%A6#.E5.90.84.E6.9C.88.E3.81.AE.E5.88.A5.E5.90.8D',
					S : 'font-size:.8em;'
				},
				function(date) {
					return /* !date.準 && */!date.精 && CeL.era.月の別名(date) || '';
				} ],

		六曜 : [
				{
					a : {
						T : '六曜'
					},
					R : '日本の暦注の一つ。\n警告：僅適用於日本之旧暦與紀年！對其他國家之紀年，此處之六曜值可能是錯誤的！\n六輝（ろっき）や宿曜（すくよう）ともいうが、これは七曜との混同を避けるために、明治以後に作られた名称である。',
					href : 'https://ja.wikipedia.org/wiki/%E5%85%AD%E6%9B%9C',
					S : 'font-size:.8em;'
				}, function(date) {
					return /* !date.準 && */!date.精 && CeL.era.六曜(date) || '';
				} ],

		七曜 : [ {
			a : {
				T : '七曜'
			},
			R : '中曆曆注、日本の暦注の一つ。',
			href : 'https://ja.wikipedia.org/wiki/%E6%9B%9C%E6%97%A5',
			S : 'font-size:.8em;'
		}, function(date) {
			return /* !date.準 && */!date.精 && CeL.era.七曜(date) || '';
		} ],

		// 暦注上段
		曜日 : [ {
			a : {
				T : '曜日'
			},
			R : '日本の暦注の一つ, Japanese names of week day',
			href : 'https://ja.wikipedia.org/wiki/%E6%9B%9C%E6%97%A5'
		}, function(date) {
			var 七曜 = /* !date.準 && */!date.精 && CeL.era.七曜(date);
			return 七曜 ? {
				span : 七曜 + '曜日',
				S : 七曜 === '日' ? 'color:#f34'
				//
				: 七曜 === '土' ? 'color:#2b3' : ''
			} : '';
		} ],

		// 暦注中段
		// 十二直
		// http://koyomi8.com/sub/rekicyuu_doc01.htm#jyuunicyoku
		//
		// 欽定四庫全書 御定星厯考原卷五 日時總類 月建十二神
		// http://ctext.org/wiki.pl?if=en&chapter=656830
		// 厯書曰厯家以建除滿平定執破危成收開閉凡十二日周而復始觀所值以定吉凶每月交節則疊兩值日其法從月建上起建與斗杓所指相應如正月建寅則寅日起建順行十二辰是也
		//
		// 欽定協紀辨方書·卷四
		// https://archive.org/details/06056505.cn
		//
		// http://blog.sina.com.cn/s/blog_3f5d24310100gj7a.html
		// http://blog.xuite.net/if0037212000/02/snapshot-view/301956963
		// https://sites.google.com/site/chailiong/home/zgxx/huangli/huandao

		/**
		 * @see <a
		 *      href="https://ja.wikipedia.org/wiki/%E6%9A%A6%E6%B3%A8%E4%B8%8B%E6%AE%B5"
		 *      accessdate="2015/3/7 13:52">暦注下段</a>
		 */
		二十八宿 : [
				{
					a : {
						T : '二十八宿'
					},
					R : '日本の暦注の一つ',
					href : 'https://ja.wikipedia.org/wiki/%E4%BA%8C%E5%8D%81%E5%85%AB%E5%AE%BF',
					S : 'font-size:.8em;'
				},
				function(date) {
					return /* !date.準 && */!date.精 && CeL.era.二十八宿(date) || '';
				} ],

		二十七宿 : [
				{
					a : {
						T : '二十七宿'
					},
					R : '日本の暦注の一つ\n警告：僅適用於日本之旧暦與紀年！對其他國家之紀年，此處之值可能是錯誤的！',
					href : 'https://ja.wikipedia.org/wiki/%E4%BA%8C%E5%8D%81%E4%B8%83%E5%AE%BF',
					S : 'font-size:.8em;'
				},
				function(date) {
					return /* !date.準 && */!date.精 && CeL.era.二十七宿(date) || '';
				} ],

		// 九星は年、月、日、時刻それぞれに割り当てられる。
		// http://koyomi8.com/sub/rekicyuu_doc01.htm#9sei

		三元九運 : [
				{
					a : {
						T : '三元九運'
					},
					R : '玄空飛星一派風水三元九運，又名「洛書運」。\n* 公曆2月3至5日立春後才改「運」，但此處恆定為2月4日改，會因此造成誤差。',
					// http://www.hokming.com/fengshui-edit-threeyuennineyun.htm
					href : 'http://www.twwiki.com/wiki/%E4%B8%89%E5%85%83%E4%B9%9D%E9%81%8B',
					S : 'font-size:.8em;'
				}, function(date) {
					return CeL.era.三元九運(date);
				} ],

		// --------------------------------------------------------------------
		// 紀年法/紀年方法。 Cyclic year, year recording/representation method
		'Year naming' : '區別與紀錄年份的方法，例如循環紀年。',

		生肖 : [ {
			a : {
				T : '生肖'
			},
			R : '十二生肖紀年，屬相',
			href : 'https://zh.wikipedia.org/wiki/%E7%94%9F%E8%82%96'
		}, function(date) {
			return CeL.era.生肖(date);
		} ],

		五行 : [
				{
					a : {
						T : '五行'
					},
					R : '陰陽五行紀年',
					href : 'http://zh.wikipedia.org/wiki/%E4%BA%94%E8%A1%8C#.E4.BA.94.E8.A1.8C.E4.B8.8E.E5.B9.B2.E6.94.AF.E8.A1.A8'
				}, function(date) {
					return CeL.era.五行(date);
				} ],

		繞迥 : [ {
			a : {
				T : '繞迥'
			},
			R : '藏曆(時輪曆)紀年法，繞迥（藏文：རབ་བྱུང༌།，藏語拼音：rabqung，威利：rab-byung）\n'
			//
			+ '又稱勝生周。第一繞迥自公元1027年開始。\n此處採公曆改年而非藏曆，可能有最多前後一年的誤差。',
			href : 'https://zh.wikipedia.org/wiki/%E7%BB%95%E8%BF%A5'
		}, function(date) {
			return CeL.era.繞迥(date);
		} ],

		// --------------------------------------------------------------------
		// 編年法/編年方法。
		'Year numbering' : '以數字計算年份的方法',

		Minguo : [
				{
					a : {
						T : '民國'
					},
					R : '民國紀年',
					href : 'http://zh.wikipedia.org/wiki/%E6%B0%91%E5%9C%8B%E7%B4%80%E5%B9%B4'
				}, Year_numbering(-1911) ],

		Dangi : [
				{
					a : {
						T : '檀紀'
					},
					R : '단군기원(檀君紀元) 또는 단기(檀紀)',
					href : 'https://ko.wikipedia.org/wiki/%EB%8B%A8%EA%B5%B0%EA%B8%B0%EC%9B%90'
				}, Year_numbering(2333) ],

		// TODO: 黃帝紀元應以農曆為主!
		// 1912年1月1日，中華民國臨時政府成立，臨時大總統孫中山當日就通電：「中華民國改用陽曆，以黃帝紀元四千六百零九年十一月十三日為中華民國元年元旦。」
		Huangdi : [
				{
					a : {
						T : '黃帝紀元'
					},
					R : '依據中華民國建國時官方認定的黃帝紀元，清末辛亥年（孔子紀元2462年，西元1911年）為黃帝紀元4609年，民國元年為黃帝紀元4610年。黃帝紀元比孔子紀元早2147年，比西元早2698年。',
					href : 'http://zh.wikipedia.org/wiki/%E9%BB%84%E5%B8%9D%E7%BA%AA%E5%85%83',
					S : 'font-size:.8em;'
				}, Year_numbering(2698) ],

		Koki : [
				{
					a : {
						T : '皇紀'
					},
					R : '神武天皇即位紀元（じんむてんのうそくいきげん）。略称は皇紀（こうき）という。外にも、皇暦（すめらこよみ、こうれき）、神武暦（じんむれき）、神武紀元（じんむきげん）、日紀（にっき）などともいう。\n神武天皇即位紀元の元年は、キリスト紀元（西暦）前660年である。日本では明治6年（1873年）を紀元2533年と定め公式に使用した。',
					href : 'https://ja.wikipedia.org/wiki/%E7%A5%9E%E6%AD%A6%E5%A4%A9%E7%9A%87%E5%8D%B3%E4%BD%8D%E7%B4%80%E5%85%83'
				},
				function(date) {
					if (!kyuureki) {
						// IE8 中，直到執行 affairs() 時 CeL.era 可能還沒準備好，
						// 因此 kyuureki === null。
						kyuureki = CeL.era('旧暦', {
							get_era : true
						});
						Koki_year_offset += kyuureki.calendar.start;
					}
					var date_index;
					if (date.精 === '年'
							|| date - kyuureki.start < 0
							|| kyuureki.end - date < 0
							|| !(date_index = kyuureki.Date_to_date_index(date)))
						return Koki_year(date, true);

					date_index[0] += Koki_year_offset;
					date_index[1]++;
					date_index[2]++;
					return date_index.join('/');

				} ],

		Thai_Buddhist : [
				{
					a : {
						T : '泰國佛曆'
					},
					R : 'ปฏิทินสุริยคติไทย: 泰國陽曆/泰國官方之佛曆年 = 公曆年 + 543',
					href : 'https://th.wikipedia.org/wiki/%E0%B8%9B%E0%B8%8F%E0%B8%B4%E0%B8%97%E0%B8%B4%E0%B8%99%E0%B8%AA%E0%B8%B8%E0%B8%A3%E0%B8%B4%E0%B8%A2%E0%B8%84%E0%B8%95%E0%B8%B4%E0%B9%84%E0%B8%97%E0%B8%A2',
					S : 'font-size:.8em;'
				},
				function(date) {
					var numeral = THAI_Year_numbering(date), tmp = numeral
							.split('/');
					if (!date.精 && !date.準 && tmp.length === 3)
						numeral = CeL.Date_to_Thai(tmp[2], tmp[1], tmp[0], date
								.getDay());
					return numeral;
				} ],

		AUC : [ {
			a : {
				T : '羅馬建城'
			},
			R : 'AUC (Ab urbe condita), 羅馬建城紀年. 有採用0年。非精確時。',
			href : 'https://en.wikipedia.org/wiki/Ab_urbe_condita',
			S : 'font-size:.8em;'
		}, Year_numbering(754 - 1, true, false) ],

		Seleucid : [ {
			a : {
				T : '塞琉古紀元'
			},
			R : 'Seleucid era or Anno Graecorum, 塞琉古紀元。非精確時，可能有最多前後一年的誤差。',
			href : 'https://en.wikipedia.org/wiki/Seleucid_era',
			S : 'font-size:.8em;'
		}, Year_numbering(311, true) ],

		BP : [ {
			a : {
				T : 'Before Present'
			},
			R : 'Before Present (BP) years, 距今。非精確時。usage: 2950±110 BP.',
			href : 'https://en.wikipedia.org/wiki/Before_Present'
		}, Year_numbering(1950, true, true, true) ],

		HE : [
				{
					a : {
						T : 'Holocene calendar'
					},
					R : 'Holocene calendar, 全新世紀年或人類紀年。在公曆年數上多加 10000。有採用0年。 1 BCE = 10000 HE',
					href : 'https://en.wikipedia.org/wiki/Holocene_calendar'
				}, Year_numbering(10000) ]

	};

	calendar_column = CeL.null_Object();
	o = null;
	for (i in list)
		if (Array.isArray(list[i]))
			calendar_column[o ? o + '/' + i : i] = list[i];
		else
			calendar_column[o = i] = list[i];

	v = 'Gregorian reform';
	calendar_column[v] = '各地啓用格里曆之日期對照';
	for (i in CeL.Gregorian_reform_of.regions) {
		o = function(date) {
			return date.format({
				parser : 'CE',
				format : '%Y/%m/%d',
				no_year_0 : false,
				reform : this.r
			});
		}.bind({
			r : i
		});
		calendar_column[v + '/' + i] = [ {
			T : i,
			R : i + ', Gregorian reform on '
			//
			+ new Date(CeL.Gregorian_reform_of.regions[i]).format('%Y/%m/%d')
		}, o ];
	}

	default_column.forEach(function(i, index) {
		default_column[index] = {
			th : i
		};
	});

	// -----------------------------

	/**
	 * @memo <code>

	var data = google.visualization.arrayToDataTable([
			[ 'Mon', 28, 28, 38, 38 ], [ 'Tue', 31, 38, 55, 66 ]
	// Treat first row as data as well.
	], true);

	// https://developers.google.com/chart/interactive/docs/gallery/candlestickchart
	var chart = new google.visualization.CandlestickChart(document
			.getElementById('era_graph'));
	chart.draw(data, {
		legend : 'none'
	});

	 </code>
	 */

	// https://developer.mozilla.org/en-US/docs/Web/API/Window.onhashchange
	(window.onhashchange = set_era_by_url_data)();

	CeL.log('初始化完畢。您可開始進行操作。');
}

document.getElementById('loading_progress').innerHTML
// 改善體驗，降低反應倦怠感。
= 'The main page is loaded. Initializing the library...<br />已載入主網頁。正進行程式初始化作業，請稍待片刻…';

// CeL.set_debug(2);
CeL.run(initializer);
