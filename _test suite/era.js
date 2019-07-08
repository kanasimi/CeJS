'use strict';

/**
 * @memo <code>

 TODO:
 視覺化互動式史地資訊平台:整合 GIS + 視覺化年表 (e.g., HuTime)
 當年年度/每月資訊
 殘曆定年：允許前後一、二日誤差

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

// for i18n: define gettext() user domain resource location.
// gettext() will auto load (CeL.env.domain_location + language + '.js').
// e.g., resource/cmn-Hant-TW.js, resource/ja-JP.js
CeL.env.domain_location = CeL.env.resource_directory_name + '/';
// declaration for gettext()
var _;

// google.load('visualization', '1', {packages: ['corechart']});
function initializer() {
	var queue = [
			[ 'interact.DOM', 'application.debug.log',
					'interact.form.select_input', 'interact.integrate.SVG',
					'data.date.era', 'application.astronomy' ],
			[ 'data.date.calendar', function() {
				// for 太陽視黃經
				CeL.VSOP87.load_terms('Earth');
				var type = CeL.get_cookie('LEA406_type');
				if (type)
					if (type === 'a' || type === 'b') {
						CeL.LEA406.default_type = type;
						CeL.info('改採 LEA-406' + type);
					} else
						CeL.warn('Invalid type: [' + type + ']');
				// for 月亮視黃經
				CeL.LEA406.load_terms('V');
				CeL.LEA406.load_terms('U');
				// for 月出月落
				CeL.LEA406.load_terms('R');

			} ], function() {
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
		queue.push('https://apis.google.com/js/plusone.js');

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

// const, include [[en:Thai (Unicode block)]]
var PATTERN_NOT_ALL_ALPHABET = /[^a-z\s\d\-,'"\u0E00-\u0E7F]/i,
//
CE_name = '公元', CE_PATTERN = new RegExp('^' + CE_name + '[前-]?\\d'), pin_column,
// 可選用的文字式年曆欄位。
selected_columns = {
	// JDN : true,
	adjacent_contemporary : true
},
// 依特定國家自動增加這些欄。
auto_add_column = {
	中國 : [ 'Year naming/歲次', '曆注/月干支', '曆注/日干支' ],
	'မြန်မာ' : [ 'Gregorian reform/Great Britain', 'calendar/Myanmar' ],
	'ไทย' : [ 'Year numbering/Thai_Buddhist', 'calendar/Dai' ],
	India : [ 'calendar/Hindu' ],
	Mesopotamian : [ 'calendar/Hebrew' ],
	Egypt : [ 'calendar/Egyptian'
	// , 'calendar/Coptic'
	],
	Maya : [ 'calendar/Long_Count', 'calendar/Tzolkin', 'calendar/Haab' ]
},
// 可選用的文字式年曆 title = { id : [th, function (date) {} ] }
calendar_columns, calendar_column_alias,
//
default_column = [
		{
			T : '朝代紀年日期',
			R : 'date of calendar era: Y/m/d\nYear of ruler / month of the year / day of the month.'
		}, {
			a : {
				T : CE_name
			},
			R : 'Common Era: Y/m/d\nReform after 1582/10/4. -1: 1 BCE',
			href : 'https://en.wikipedia.org/wiki/Common_Era'
		} ];

// 承襲中曆。
auto_add_column.日本 = auto_add_column.한국 = auto_add_column['Việt Nam'] = auto_add_column.中國;

function pin_text(gettext) {
	// unfold / fold
	var text = pin_column ? 'Unpin' : 'Pin';
	if (gettext)
		text = _(text);
	return text;
}

/**
 * 增加此欄。
 * 
 * @param {String|Array|Undefined}name
 *            可選用的文字式年曆欄位名稱。
 * @param {Boolean}no_jump
 *            是否重繪文字式年曆。
 * @param {Boolean}to_remove
 *            是否為刪除，而非添加。
 * @param {Boolean}no_warning
 *            無此欄位時不警告。例如當設定"採用曆法"屬性，若是無此曆法則忽略之。
 * 
 * @returns {Boolean}false
 */
function add_calendar_column(name, no_jump, to_remove, no_warning) {
	if (Array.isArray(name)) {
		if (name.length > 1) {
			name.forEach(function(column) {
				add_calendar_column(column, true, to_remove, no_warning);
			});
			// 此時未判斷是否有更動。
			if (!no_jump)
				translate_era();
			return false;
		}
		if (name.length !== 1)
			// name.length === 0
			return;
		name = name[0];
	}

	if ((typeof name !== 'string' || !name) && !(name = this && this.title))
		return;
	// assert: typeof name === 'string' && name !== ''

	// e.g., title="除去此欄: 東亞陰陽曆/玄始曆"
	if (to_remove && (name = name.match(/:\s+(.+)$/)))
		name = name[1];

	var column = name.trim();
	if (typeof to_remove !== 'boolean' && column.charAt(0) === '-')
		column = column.slice(1).trim(), to_remove = true;

	if ((column in calendar_columns)
	// get full column name
	|| (column = calendar_column_alias[column]) && (column in calendar_columns)) {
		if (to_remove)
			// 直接除掉不留。
			delete selected_columns[column];
		else
			selected_columns[column] = true;
		if (!no_jump)
			translate_era();
	} else if (!no_warning) {
		CeL.warn('add_calendar_column: Unkonwn column: [' + name + ']');
	}

	return false;
}

function remove_calendar_column(name, no_jump) {
	return add_calendar_column.call(this, name, no_jump, true);
}

// 文字式年曆。 text_calendar
function show_calendar(era_name) {
	var start = new Date, era_caption,
	// 為了不更動到原先的 default_column。作 deep clone.
	title = CeL.clone(default_column, true), output = [ {
		tr : title
	} ], 前年名, 前月名, 前紀年名, 後紀年名,
	//
	main_date = CeL.era(era_name), main_date_value,
	// 取得指定紀年之文字式曆譜:年曆,朔閏表,曆日譜。
	dates = CeL.era.dates(era_name, {
		含參照用 : PATTERN_J_translate.test(era_name),
		add_country : true,
		numeral : output_numeral
	}), is_年譜, i, j, matched, hidden_column = [], group;

	if (!dates)
		return;

	if (dates.length > show_calendar.LIMIT) {
		CeL.warn('show_calendar: 輸出年段/時段紀錄過長（' + dates.length
				+ ' 筆），已超過輸出總筆數限制！將截取前 ' + show_calendar.LIMIT + ' 筆。');
		dates.length = show_calendar.LIMIT;
	}

	// 添加各個欄位標頭。
	// 這樣會依照添加進 selected_columns 的順序顯示欄位。
	for (i in selected_columns) {
		if (j = calendar_columns[i]) {
			if (typeof (j = j[0]) === 'function')
				j = j(era_name, dates);
			title.push({
				th : [ j, ' ', {
					span : '×',
					title : _('除去此欄') + ': ' + i,
					C : 'remove_mark',
					onclick : remove_calendar_column
				} ]
			});
		} else
			// invalid one.
			delete selected_columns[i];
	}

	for (i in calendar_columns) {
		if (!(i in selected_columns)
		// 可能有些先行佔位的，因此須做檢測。
		&& Array.isArray(calendar_columns[i])
		// "增加此欄"區
		&& typeof calendar_columns[i][1] === 'function') {
			j = calendar_columns[i][0];
			if (typeof j === 'function')
				j = j(era_name, dates);

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
					R : calendar_columns[group][0]
				}, calendar_columns[group][1] ? [ {
					span : calendar_columns[group][1],
					C : 'calendar_column_notice'
				}, {
					br : null
				} ] : ' ' ]);
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

	if (main_date) {
		main_date_value = new Date(main_date.getTime());
		// 轉換成本地子夜時間值。
		main_date_value.setHours(0, 0, 0, 0);
		main_date_value = main_date_value.getTime();
		if (false && main_date.日 === 1 && !era_name.includes('日'))
			// 僅輸入紀元名稱時，不特別標示符合之欄位。
			// 但為了提醒實際轉換出的結果為何者，還是強制標示。
			main_date_value = null;
	}

	// 遍歷
	function add_traversal(name, is_next) {
		if (name)
			output.push({
				tr : {
					td : [
					// setup icon ⏫⏬
					is_next ? is_next === true ? {
						span : '🔽',
						R : '↓next'
					} : is_next : {
						span : '🔼',
						R : '↑previous'
					}, ' ', {
						a : name.toString(),
						title : name.toString(),
						href : '#',
						target : '_self',
						onclick : click_title_as_era
					} ],
					colspan : title.length
				}
			});
	}

	// 添加前一紀年之日期捷徑。
	if (dates.previous)
		add_traversal(dates.previous);
	// 添加同一朝代共存紀年之日期捷徑。
	if (main_date.共存紀年 && (i = main_date.朝代)) {
		if (Array.isArray(i))
			i = i[0];
		main_date.共存紀年.forEach(function(era_name) {
			if (era_name.toString().startsWith(i))
				add_traversal(era_name, {
					span : '↔',
					R : 'contemporary'
				});
		});
	}

	dates.forEach(function(date) {
		if (!era_caption)
			era_caption = era_name.includes(date.紀年名) ? date.紀年名
			//
			: /[\/年]/.test(era_name) ? date.紀年 : era_name;

		var tmp, matched, list = [], list_同國 = [];
		if (date.共存紀年) {
			tmp = date.國家;
			date.共存紀年.forEach(function(era, index) {
				list.push('[' + (index + 1) + ']', add_contemporary(era,
						output_numeral));
				if (tmp === era[0])
					list_同國.push('[' + ((list_同國.length / 2 | 0) + 1) + ']',
							add_contemporary(era, output_numeral));
			});
			date.共存紀年 = list;
			date.同國共存紀年 = list_同國;
			// reset
			list = [];
			list_同國 = [];
		}

		if (tmp = date.精 === '年')
			is_年譜 = true;

		var fields = CeL.era.reduce_name(date.format({
			parser : 'CE',
			format : tmp ? '%紀年名/%年|%Y'
			//
			: '%紀年名/%年/%月/%日|%Y/%m/%d',
			locale : 'cmn-Hant-TW',
			as_UTC_time : true
		})).split('|');

		var conversion = fields[0].split('/'),
		//
		紀年名_pattern = '%1 %2年',
		//
		轉換用紀年名 = CeL.era.concat_name([ conversion[0], conversion[1] + '年' ]);
		if (!CeL.era.NEED_SPLIT_POSTFIX.test(conversion[0]))
			紀年名_pattern = 紀年名_pattern.replace(' ', '');

		// 後處理: 進一步添加紀年/月名之日期捷徑。
		if (前年名 !== 轉換用紀年名) {
			conversion[0] = {
				a : conversion[0],
				title : 前年名 = 轉換用紀年名,
				href : '#',
				target : '_self',
				C : 'to_select',
				onclick : click_title_as_era
			};
			conversion[1] = Object.assign({}, conversion[0], {
				a : conversion[1]
			});
		}

		if (conversion.length > 2) {
			紀年名_pattern += '%3月%4日';
			// 月名可能會是: 正/臘/閏12/後12/Nīsannu月
			轉換用紀年名 += conversion[2] + '月';
			if (前月名 !== 轉換用紀年名) {
				conversion[2] = {
					a : conversion[2],
					title : 前月名 = 轉換用紀年名,
					href : '#',
					target : '_self',
					C : 'to_select',
					onclick : click_title_as_era
				};
			}
		}

		conversion.unshift(_(紀年名_pattern));
		fields[0] = show_calendar.convert_field
		// 太耗資源。
		? {
			T : conversion
		} : _.apply(null, conversion);

		conversion = fields[1].split('/');
		if (conversion.length > 1) {
			紀年名_pattern = '%1/%2/%3';
		} else if (conversion[0] < 0) {
			// 轉正。
			conversion[0] = -conversion[0];
			紀年名_pattern = '%1 BCE';
		} else {
			紀年名_pattern = '%1 CE';
		}
		conversion.unshift(_(紀年名_pattern));
		if (show_calendar.convert_field) {
			// 太耗資源。
			fields[1] = {
				T : conversion
			};
			// 後處理: 標註公曆換月。
			if (conversion[3] === '1')
				fields[1].S = 'color:#f80;';

		} else {
			fields[1] = _.apply(null, conversion);
			// 後處理: 標註公曆換月。
			if (conversion[3] === '1')
				fields[1] = {
					span : fields[1],
					S : 'color:#f80;'
				};
		}

		fields.forEach(function(data, index) {
			list.push({
				td : data
			});
		});

		// 增加此欄: 添加各個欄位。
		for (tmp in selected_columns) {
			if (conversion = calendar_columns[tmp]) {
				tmp = conversion[1](date) || '';
				if (tmp && tmp.S) {
					// 將 style 如 background-color 轉到 td 上。
					conversion = {
						td : tmp,
						S : tmp.S
					};
					delete tmp.S;
				} else {
					conversion = {
						td : tmp
					};
				}
				list.push(conversion);
			}
		}
		// console.log(list);

		// 處理改朝換代巡覽。
		var 未延續前紀年 = (後紀年名 !== date.紀年名);
		if (date.前紀年 !== 前紀年名) {
			if (未延續前紀年)
				add_traversal(date.前紀年);
			前紀年名 = date.前紀年;
		}

		tmp = [];
		if (main_date_value) {
			// 把`date`作和`main_date_value`相同的操作。
			date.setHours(0, 0, 0, 0);
			// 假如主要的日期正是這一天，那麼就著上特別的顏色。
			if (main_date_value === date.getTime()) {
				tmp.push('selected');
				main_date_value = null;
			}
		}
		if (date.準 || date.精) {
			// 不確定之數值
			tmp.push('uncertain');
		}

		output.push({
			tr : list,
			C : tmp.join(' ')
		});

		if (date.後紀年 !== 後紀年名) {
			if (未延續前紀年)
				add_traversal(後紀年名, true);
			後紀年名 = date.後紀年;
		}
	});

	if (後紀年名)
		add_traversal(後紀年名, true);

	// 添加後一紀年之日期捷徑。
	if (dates.next)
		add_traversal(dates.next, true);

	era_caption = era_caption ? [ '📅', {
		a : era_caption,
		title : era_caption,
		href : '#',
		target : '_self',
		C : 'to_select',
		onclick : click_title_as_era
	}, CeL.era.NEED_SPLIT_POSTFIX.test(era_caption) ? ' ' : '', {
		T : is_年譜 ? '年譜' : '曆譜'
	}, ' (', {
		T : [ _('共有 %1 個' + (dates.type ? '時' : '年') + '段紀錄'), dates.length ]
	}, ')' ] : [ {
		T : '無可供列出之曆譜！',
		S : 'color:#f00;background-color:#ff3;'
	}, /[\/年]/.test(era_name) ? '' : [ {
		br : null
	}, '→', {
		a : {
			T : '嘗試加注年分'
		},
		href : '#',
		title : CeL.era.concat_name([ era_name, '1年' ]),
		onclick : click_title_as_era
	} ] ];

	title = {
		table : [ {
			caption : era_caption
		}, {
			tbody : output
		} ]
	// , id : 'text_calendar'
	};
	if (hidden_column.length > 0) {
		hidden_column.unshift(': ');
		title = [ {
			div : [ {
				T : '全不選',
				R : 'Remove all columns. 除去所有欄',
				onclick : function() {
					for ( var column in selected_columns)
						delete selected_columns[column];
					translate_era();
				},
				C : 'column_select_option_button',
				S : 'font-size:.7em;'
			}, {
				T : pin_text(),
				R : 'Click to pin / unpin',
				onclick : function() {
					pin_column = !pin_column;
					CeL.set_text('pin_icon', pin_column ? '🔒' : '🔓');
					this.innerHTML = pin_text(true);
				},
				C : 'column_select_option_button'
			}, {
				span : [ {
					span : '🔓',
					id : 'pin_icon'
				}, {
					T : '增加此欄'
				} ],
				C : 'column_select_button',
				onclick : function() {
					if (CeL.toggle_display('column_to_select') === 'none') {
						CeL.set_class(this, 'shrink', {
							remove : true
						});
						pin_column = false;
					} else {
						CeL.set_class(this, 'shrink');
					}
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
	if (pin_column)
		CeL.toggle_display('column_to_select', true);
	// text_calendar
	select_panel('calendar', true);

	CeL.debug('本次執行 [' + era_name + '] 使用時間: ' + start.age() + '。 LEA-406'
			+ CeL.LEA406.default_type);
}

show_calendar.convert_field = false;
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
			name_showed = name_showed ? '[' + _(name_showed[1]) + ']'
					: _(this.title);

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
/**
 * <code>
 show_range(CeL.era('清德宗光緒六年三月十三日'), 80, '清德宗光緒六年三月十三日');
 </code>
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
	date = draw_era
			.get_date(Array.isArray(arg_passed) ? arg_passed[0] : period);

	if (!date) {
		// Cannot parse
		CeL.warn('add_tag: 無法解析 [' + period + ']!');
		return;
	}

	if (Array.isArray(arg_passed)) {
		// to date
		arg_passed = draw_era.get_date(arg_passed[1], true);
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
	title = date.format(draw_era.date_options) + title;

	// 處理 title: [group] data.title \n period (date) \n data.description
	title = [ (group ? '[' + group + '] ' : '')
	//
	+ (data && (typeof data === 'string' ? data : data.title) || ''),
	//
	period === title ? period : period + ' (' + title + ')' ];
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
		draw_era.tags[target] = Object.create(null), 'hide', {
			writable : true
		});
	}
	target = draw_era.tags[target];
	if (target[period])
		if (options && options.rename_duplicate) {
			for (var i = 0, n;;)
				if (!target[n = period + '#' + ++i]) {
					period = n;
					break;
				}
		} else if (options && typeof options.for_duplicate === 'function')
			arg_passed = options.for_duplicate(target[period], arg_passed);
		else if (CeL.is_debug()) {
			CeL.warn('add_tag: 已經有此時段存在！將跳過之，不會以新的覆蓋舊的。 '
					+ (group ? '[' + group + ']' : '') + '[' + period + ']');
			return;
		}

	CeL.debug('登錄 ' + (group ? '[' + group + ']' : '') + '[' + period + ']', 2,
			'add_tag');
	target[period] = arg_passed;

	if (register_only) {
		// 因為不跑 add_tag.show()，因此得登錄數量。
		add_tag.group_count[group] = (add_tag.group_count[group] | 0) + 1;
	} else {
		add_tag.show(arg_passed, options);
		select_panel('era_graph', true);
	}
}

// add_tag.group_count[group] = {Integer}count
add_tag.group_count = Object.create(null);

add_tag.show = function(array_data, options) {
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
	lastAdd.onclick = options && options.onclick || add_tag.remove_self;

	// settle search id
	lastAdd.period = array_data.period;
	// lastAdd.data = array_data;
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

add_tag.show_calendar = function() {
	/**
	 * <code>
	 * lastAdd.period = array_data.period;
	 * </code>
	 * 
	 * @see add_tag.show
	 */
	translate_era(this.period);
};

// add_tag.load('臺灣地震');
/*
 * if(add_tag.load('臺灣地震',true)) return;
 */
add_tag.load = function(id, callback) {
	var data = add_tag.data_file[id];

	if (!data) {
		CeL.error('未設定之資料圖層: [' + id + ']');
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

// 將由 資源檔.js 呼叫。
// 會改變 options!
add_tag.parse = function(group, data, line_separator, date_index, title_index,
		description_index, field_separator, options) {
	// 前置處理。
	if (!options)
		if (CeL.is_Object(field_separator)) {
			field_separator = (options = field_separator).field_separator;
		} else if (!field_separator && CeL.is_Object(description_index)) {
			field_separator = (options = description_index).field_separator;
			description_index = options.description_index;
		}
	if (!field_separator)
		field_separator = '\t';
	if (date_index === undefined)
		date_index = 0;
	if (title_index === undefined)
		title_index = 1;
	if (!CeL.is_Object(options))
		options = Object.create(null);
	if (!('onclick' in options))
		options.onclick = add_tag.show_calendar;

	data = data.split(line_separator || '|');
	var register_only = data.length > add_tag.parse.draw_limit;
	data.forEach(function(line) {
		if (!line)
			return;
		line = line.split(field_separator);
		var title = typeof title_index === 'function' ? title_index(line)
				: line[title_index];
		if (title)
			line.title = title;

		if (description_index !== undefined) {
			var description
			//
			= typeof description_index === 'function' ? description_index(line)
					: line[description_index];
			if (description)
				line.description = description;
		}
		add_tag(line[date_index], line, group, register_only, options);
	});
	if (register_only) {
		CeL.info('資料過多，總共' + data.length + '筆，因此將不自動顯示於線圖上。若手動開啟顯示，速度可能極慢！');
		draw_era.tags[group].hide = true;
	}

	if (calendar_columns[title_index = '資料圖層/' + group]) {
		CeL.warn('已初始化過 calendar_columns。以現行配置，不應有此情形。');
		return;
	}

	var
	// copy from data.date.
	/** {Number}一整天的 time 值。should be 24 * 60 * 60 * 1000 = 86400000. */
	ONE_DAY_LENGTH_VALUE = new Date(0, 0, 2) - new Date(0, 0, 1);
	var
	// period to search
	periods = CeL.sort_periods(draw_era.tags[group], function(period) {
		return Array.isArray(period = period[0]) ? +period[0] : +period;
	}, function(period) {
		return Array.isArray(period = period[0]) ? +period[1] : +period
				+ ONE_DAY_LENGTH_VALUE;
	});
	selected_columns[title_index] = true;
	data = add_tag.data_file[group];
	calendar_columns[title_index] = [ data[2] ? {
		a : {
			T : group
		},
		href : data[2],
		R : '資料來源: ' + data[1] + (data = data[3] ? '\n' + data[3] : '')
	} : {
		T : group,
		R : '資料來源: ' + data[1] + (data = data[3] ? '\n' + data[3] : '')
	}, function(date) {
		if (/* date.準 || */date.精)
			return;

		var contemporary = periods.get_contemporary(date);
		if (!contemporary)
			return;
		var list = [];
		contemporary.forEach(function(period) {
			period = period[2].split('\n');
			// group (欄位標題, e.g., "[古籍異象] ") 已附於頂端標頭，因此刪除之。
			var data = period[0].replace(/^\[[^\[\]]+\]\s*/, ''),
			//
			style = period[0].length > 9 ? 'font-size:.9em;' : '';
			if (period[2]) {
				data = [ data, {
					br : null
				}, {
					span : period[2],
					C : 'description'
				} ];
			}
			list.push({
				div : data,
				C : 'data_layer_column',
				S : style
			});
		})
		return list;
	} ];
};

// 資料過多，將不自動顯示於線圖上。
add_tag.parse.draw_limit = 400;

// 登錄預設可 include 之資料圖層
add_tag.data_file = {
	'中國皇帝生卒' : [ CeL.env.domain_location + 'emperor.js',
	// 資料來源 title, URL, memo
	'中國皇帝壽命列表', 'https://zh.wikipedia.org/wiki/中国皇帝寿命列表', '僅列到年份，尚不夠精確。' ],

	// 臺灣歷史地震時間軸視覺化（英文：Visulation）
	'臺灣地震' : [ CeL.env.domain_location + 'quake.js', '臺灣地震年表',
			'http://921kb.sinica.edu.tw/history/quake_history.html' ],

	'古籍異象' : [
			CeL.env.domain_location + 'abnormal.js',
			'中國古籍異象',
			'http://sciencehistory.twbbs.org/?p=982',
			'因資料數量龐大，載入與處理速度緩慢，請稍作等待。\n'
					+ '本資料檔源於徐勝一教授 國科會1996年計畫成果(重整中國歷史時期之氣候資料之「歷史氣候編年檔」)' ]
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
	add_tag.group_count = Object.create(null);

	SVG_object.hierarchy = hierarchy;
	var periods = CeL.era.periods(hierarchy, draw_era.options),
	// [ eras, blocks, 歷史時期 periods ]
	count_layers = [ 0, 0, 0 ],
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

		if (periods.生 || periods.卒) {
			if (draw_era.options.adapt_lifetime) {
				// 若君主在世時段於本 period 之外，則擴張範圍。
				// 最起碼紀年的部分都得要顯現，其他只要有生或卒紀錄，就嘗試擴張。
				if (periods.生)
					start_time = Math.min(start_time - 0, draw_era
							.get_date(periods.生[0]) - 0);
				if (periods.卒)
					ratio = Math.max(ratio - 0,
							draw_era.get_date(periods.卒[0]) - 0);
			}
			// 以 tag 顯示君主生卒標記。
			if (!periods.added && periods.生 && periods.卒) {
				periods.added = true;
				add_tag(periods.生[0] + '－' + periods.卒[0], period_hierarchy,
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
		// 當is_Era時，代表現在正在處理的是君主的所有紀年。這時只要第一個標示為女性，則所有的紀年都應該要為女性。
		is_女性, period_list,
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

			if (is_Era) {
				is_女性 = is_女性 || period.君主性別 && period.君主性別.includes('女');
			} else if (is_女性 = period.attributes.君主性別) {
				is_女性 = is_女性.includes('女');
			}

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
					'#ffa' : is_歷史時期 ? '#afa' : is_女性 ? '#fce' : '#ddf')
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

			// TODO:
			// https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/SVG_Image_Tag

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
				lastAdd.dataset = Object.create(null);
			lastAdd.dataset.hierarchy
			//
			= period_hierarchy + name;
			lastAdd.onclick
			//
			= is_Era ? draw_era.click_Era : draw_era.click_Period;
			count_layers[is_Era ? 0 : is_歷史時期 ? 2 : 1]++;
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

	draw_era.draw_navigation(hierarchy, undefined, count_layers);

	// -----------------------------

	// 繪製額外圖資。
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
				}, ')' ] : {
					T : group
				}, {
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
				title : '點擊以設定資料圖層',
				onclick : function() {
					select_panel('configuration', true);
					return false;
				},
				S : 'cursor: pointer;'
			}, ' :');
			// 清理場地。
			CeL.remove_all_child('data_layer_menu');
			CeL.new_node(periods, 'data_layer_menu');
		}
		CeL.toggle_display('data_layer_menu', period_hierarchy);
	} else {
		CeL.debug('No group found.', 2);
	}
}

draw_era.options = {
	merge_periods : true
};

draw_era.redraw = function() {
	draw_era(SVG_object.hierarchy);
};

draw_era.get_date = function(date, period_end) {
	var matched = date.match(CeL.String_to_Date.parser_PATTERN),
	//
	options = {
		date_only : true,
		period_end : period_end
	};
	if (matched && (matched[1] in CeL.String_to_Date.parser))
		return CeL.String_to_Date.parser[matched[1]](matched[2], 0, options);
	return CeL.era(date, options);
};

// click and change the option of this.title
draw_era.change_option = function() {
	var option = this.title.replace(/\s[\s\S]*/, ''), configured = draw_era.options[option];
	// reset option status
	CeL.set_class(this, 'configured', {
		remove : configured
	});
	draw_era.options[option] = !configured;
	draw_era.redraw();
	return false;
};

draw_era.default_group = '\n';
// draw_era.tags[group][period] = [ date_range, height_range, title, style ];
draw_era.tags = Object.create(null);

draw_era.draw_navigation = function(hierarchy, last_is_Era, count_layers) {
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
			name_showed = name_showed ? '[' + _(name_showed[1]) + ']'
			//
			: _(name);

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
					// e.g., 國祚
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

	if (count_layers && count_layers.sum() > 2)
		// 在導覽列記上紀年/國家/君主/歷史時期數量。
		Array.prototype.push.apply(navigation_list, count_layers.map(function(
				count, index) {
			return count > 0 ? {
				T : [ draw_era.draw_navigation.count_title[index], count ],
				C : 'era_graph_count'
			} : '';
		}));

	// 清理場地。
	CeL.remove_all_child('era_graph_navigation');
	CeL.new_node(navigation_list, 'era_graph_navigation');
};
// [ 紀年 eras, blocks (國家/君主), 歷史時期 periods ]
draw_era.draw_navigation.count_title = [ '%1 eras', '%1 blocks', '%1 periods' ];

draw_era.click_navigation_date = function() {
	era_input_object.setValue(this.title);
	output_format_object.setValue('共存紀年');
	translate_era();
	return false;
};

draw_era.click_Era = function() {
	var hierarchy = this.dataset.hierarchy.split(era_name_classifier)
	// 去除"時期"如 "period:~"
	// e.g., 處理太平天囯時，因為其屬大清時期，惟另有大清政權，因此若未去除時期，將無法解析"大清太平天囯"。
	.filter(function(name) {
		// 若有 '' 將導致空的索引。不如直接去除。
		return name && !CeL.era.PERIOD_PATTERN.test(name);
	});
	var era = CeL.era(hierarchy.join('' /* or use ' ' */));
	draw_era.draw_navigation(hierarchy, true);

	era_input_object.setValue(CeL.era.reduce_name(era.format({
		format : era.精 === '年' ? '%紀年名 %年年' : '%紀年名 %年年%月月%日日',
		locale : 'cmn-Hant-TW'
	})));
	translate_era();
	return false;
};

draw_era.click_Period = function() {
	draw_era(this.dataset.hierarchy.split(era_name_classifier));
	select_panel('era_graph', true);
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

draw_era.date_cache = Object.create(null);

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
	// 年表
	calendar : '曆譜',
	configuration : '設定',
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
	傳說 : '為傳說時代之資料'
},
// Japan convert
J_translate = {
	R : '令和',
	H : '平成',
	S : '昭和',
	T : '大正',
	M : '明治'
}, PATTERN_J_translate = new RegExp(Object.values(J_translate).join('|')),
// http://maechan.net/kanreki/index.php
// 和暦入力時の元号は、『明治』『大正』『昭和』『平成』に限り、各々『M』『T』『S』『H』の頭文字でも入力できます。
// e.g., "H30.4.30"
// [ all, イニシャル/略号, year, left ]
PATTERN_J_prefix = new RegExp('^([' + Object.keys(J_translate).join('')
		+ '])\\s*(\\d{1,2})(\\D.*)?$', 'i'),
//
country_color = {
	中國 : '#dd0',

	日本 : '#9cf',
	// 天皇 : '#9cf',

	한국 : '#ccf',
	// 朝鮮 : '#ccf',
	// 新羅 : '#ccf',
	// 百濟 : '#ccf',
	// 高句麗 : '#ccf',
	// 高麗 : '#ccf',
	// 대한민국 : '#ccf',
	// '일제 강점기' : '#ccf',
	// 조선주체연호 : '#ccf',

	'Việt Nam' : '#9f9',
// 越南 : '#9f9',
// 黎 : '#9f9',
// 阮 : '#9f9',
// 莫 : '#9f9'
}, had_inputted = Object.create(null), country_PATTERN;

(function() {
	country_PATTERN = [];
	for ( var n in country_color)
		country_PATTERN.push(n);
	country_PATTERN = new RegExp('(' + country_PATTERN.join('|') + ')', 'i');
})();

// 添加共存紀年。
function add_contemporary(era, output_numeral) {
	if (!Array.isArray(era))
		era = [ , era ];
	var matched, node = output_numeral === 'Chinese' ? CeL
			.to_Chinese_numeral(era[1].toString()) : era[1].toString();
	node = {
		a : era[1].疑 || era[1].傳說 ? {
			span : node + '<sub>('
			// 特別標示存在疑問、不準確的紀年。
			+ (era[1].疑 ? '疑' : '傳說') + ')</sub>',
			R : '存在疑問、不準確的紀年',
			S : 'color: #777;'
		} : node,
		title : era[1].toString(),
		href : '#',
		target : '_self',
		onclick : click_title_as_era,
		C : '共存紀年',
	};
	if (era[0] in country_color)
		matched = era[0];
	else if (false && (matched = era[1].match(country_PATTERN)))
		matched = matched[1];
	if (matched) {
		node.S = 'background-color: ' + country_color[matched] + ';';
	}
	return node;
}

// 國旗
var national_flags = {},
// country codes
國家_code = {
	中國 : 'zh',
	English : 'en',
	日本 : 'ja',
	ไทย : 'th',
// 不列其他國家，如越南尚應以中文 Wikipedia 為主，因其過去紀年原名採用漢字。
// 直到當地 Wikipedia 全面加入紀年使用當時之原名，且資料較中文 Wikipedia 周全時，再行轉換。
};

/** {Boolean}標記當下正在處理的紀年。 */
translate_era.draw_recent_era = true;

function translate_era(era) {

	// add 文字式年曆注解
	function add_注(key, name, add_node) {
		function add_item(note, index) {
			output.push({
				br : null
			}, typeof name === 'object' && name || {
				T : name || key
			});
			if (0 < index)
				output.push(' ' + (index + 1));
			if (note) {
				note = note
						.replace(/\n/g, '<br />')
						.replace(
								// @see PATTERN_URL_WITH_PROTOCOL_GLOBAL
								// @ CeL.application.net.wiki
								/\[((?:https?|ftp):\/\/(?:[^\0\s\|<>\[\]{}\/][^\0\s\|<>\[\]{}]*)) ([^\[\]]+)\]/ig,
								function(all, URL, text) {
									return '<a href="' + URL
											+ '" target="_blank">'
											+ text.trim() + '</a>';
								});
				if (add_node) {
					note = add_node(note);
				}
				output.push(':', {
					span : ' ',
					C : 'note'
				}, {
					span : CeL.era.to_HTML(note),
					C : 'note'
				});
			}
		}

		if (date[key] || add_node === true) {
			if (!Array.isArray(output))
				output = [ output ];
			if (Array.isArray(date[key]))
				date[key].forEach(add_item);
			else
				add_item(date[key]);
		}
	}

	function add_注_link(note) {
		return {
			a : note,
			href : 'https://'
					+ (國家_code[date.國家] || (PATTERN_NOT_ALL_ALPHABET.test(note)
					// 預設： 中文 Wikipedia
					? 'zh' : 'en')) + '.wikipedia.org/wiki/'
					+ encodeURIComponent(note),
			C : 'note'
		};
	}

	if (!era && !(era = era_input_object.setValue())) {
		era = (new Date).format('%Y/%m/%d');
		// CeL.era('') 解析出來包含時間，可能造成日期不一致的問題。
		// 例如在中午打開本網頁、直接按下"共存紀年"的情況。
	}

	era = era.trim();

	var output, date;
	if (('era_graph' in select_panels) && CeL.parse_period.PATTERN.test(era))
		return add_tag(era);

	if (translate_era.draw_recent_era)
		add_tag(era);

	// 前置處理。

	if (date = era.match(PATTERN_J_prefix))
		era = J_translate[date[1]] + date[2] + (date[3] || '年');

	date = CeL.era(era, {
		// 尋精準 : 4,
		numeral : output_numeral,
		add_country : true
	});
	if (date) {
		set_era_by_url_data(era);

		output = date.曆法;
		if (output && !(output in had_inputted)) {
			add_calendar_column(output.includes(';') ? output.split(';')
					: output, true, false, true);
			had_inputted[output] = true;
		}

		output = date.國家;
		if (!(output in had_inputted)) {
			// 依特定國家自動增加這些欄。
			if (auto_add_column[output])
				add_calendar_column(auto_add_column[output], true);
			had_inputted[output] = true;
		}

		if (date.紀年名)
			// 因為紀年可能橫跨不同時代(朝代)，因此只要確定找得到，那就以原先的名稱為主。
			show_calendar(era);

		var format = output_format_object.setValue();
		if (!format) {
			format = output_format_object.setValue(
			// '%Y年'.replace(/-(\d+年)/, '前$1')
			CE_name + '%Y年'.replace(/^-/, '前')
					+ (date.精 === '年' ? '' : '%m月%d日'));
		}

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
			output = output.replace(/-(\d+年)/, '前$1');
			if (output !== era) {
				output = {
					a : output,
					title : (CE_PATTERN.test(output) ? '共存紀年:' : '') + output,
					href : '#',
					target : '_self',
					onclick : click_title_as_era
				};
			}
		}

		// -----------------------------
		// 顯示其他與本紀年相關的註解與屬性。

		// 還需要更改 ((sign_note.copy_attributes))!
		// 📅
		add_注('曆法', '📅採用曆法', function(曆法) {
			return {
				a : 曆法,
				href : '#',
				title : 曆法,
				onclick : add_calendar_column
			};
		});
		// 📚
		add_注('據', [ '📜', {
			T : '出典'
		} ]);

		var is_女性 = date.君主性別 && date.君主性別.includes('女'),
		// 君主名號 👸 🤴 👸🏻 🤴🏻 👸🏼 🤴🏼 👸🏽 🤴🏽 👸🏾 🤴🏾 👸🏿 🤴🏿
		// 👨 👩
		// 名字徽章 📛 🏷 🆔
		君主姓名_label = [ is_女性 ? '👸🏻' : '🤴🏻', {
			T : '君主名'
		} ];
		add_注('君主名', 君主姓名_label, add_注_link);
		if (date.ruler) {
			add_注('君主', 君主姓名_label, add_注_link);
			add_注('ruler', 君主姓名_label, add_注_link);
		}
		add_注('表字');
		add_注('君主號', null, add_注_link);
		add_注('諱', [ is_女性 ? '👸🏻' : '🤴🏻', {
			a : {
				T : '諱'
			},
			href : 'https://zh.wikipedia.org/wiki/名諱'
		} ], add_注_link);
		if (Array.isArray(date.name) && date.name[1]
				&& date.name[1].includes('天皇'))
			// append name.
			if (Array.isArray(date.諡))
				// 不動到原 data。
				(date.諡 = date.諡.slice()).unshift(date.name[1]);
			else
				date.諡 = date.諡 ? [ date.name[1], date.諡 ] : [ date.name[1] ];
		add_注('諡', [ is_女性 ? '👼🏻' : '👼🏻', {
			a : {
				// 諡號
				T : '諡'
			},
			href : 'https://zh.wikipedia.org/wiki/谥号'
		} ], add_注_link);
		add_注('廟號', [ is_女性 ? '👸🏻' : '🤴🏻', {
			a : {
				T : '廟號'
			},
			href : 'https://zh.wikipedia.org/wiki/庙号'
		} ]);
		// for 琉球國
		add_注('童名');
		add_注('神號');
		// 君主資料
		add_注('生', [ '🎂', {
			T : '出生'
		} ], function(note) {
			return {
				a : note,
				title : '共存紀年:' + note,
				href : '#',
				onclick : click_title_as_era,
				C : 'note'
			};
		});
		add_注('卒', [ '⚰️', {
			T : '逝世'
		} ], function(note) {
			return {
				a : note,
				title : '共存紀年:' + note,
				href : '#',
				onclick : click_title_as_era,
				C : 'note'
			};
		});
		// TODO: 終年/享年/享壽/壽命/年齡

		add_注('在位', [ '👑', {
			T : '在位'
		} ], function(note) {
			return {
				a : note,
				href : '#',
				title : note,
				onclick : click_title_as_era
			};
		});

		// 📓
		add_注('注', [ '📝', {
			T : '注'
		} ]);

		if (Array.isArray(date.name)) {
			add_注('紀年線圖', {
				a : [ '📊', {
					T : '展示線圖'
				} ],
				D : {
					hierarchy : date.name.slice(0, 4).reverse().slice(0, -1)
							.join('/')
				},
				href : '#',
				onclick : draw_era.click_Period,
				S : 'cursor:pointer;background-color:#ffa;color:#a26;'
			}, true);
		}

		if (date.準 || date.精 || date.傳說) {
			if (!Array.isArray(output))
				output = [ output ];
			output.unshift({
				em : [ '此輸出值', date.疑 ? '尚存有爭議或疑點，' : '',
				//
				date.傳說 ? 準確程度_MESSAGE['傳說'] + '，'
				// @see 這裡會設定如 era.準 = "疑"
				: date.準 === '疑' || date.準 === '傳說' ? ''
				//
				: '僅約略準確至' + (date.準 || date.精)
				//
				+ (/^\d+[年月日]$/.test(date.準 || date.精) ? '前後，' : '，'),
						'僅供參考非已確認之實曆： ' ]
			});
		}

		// -----------------------------

		CeL.remove_all_child('era_output');
		CeL.new_node(output, 'era_output');
		CeL.era.setup_nodes(null, {
			add_date : true,
			onclick : parse_text.onclick
		});

	}

	if (era && era !== last_input) {
		CeL.new_node({
			div : [ date ? '✔️' : '❌', {
				a : last_input = era,
				title : era,
				href : '#',
				target : '_self',
				onclick : click_title_as_era
			} ]
		}, 'input_history');
	}
}

// ---------------------------------------------------------------------//

/**
 * 當點擊網頁元素(this)時，將此元素的標題(this.title)當作紀年名稱來處理。
 */
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
		output_format_object.setValue(matched).replace(/-(\d+年)/, '前$1');
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

function parse_text(text, node) {
	if (!CeL.era)
		return false;

	if (text)
		CeL.set_text('original_text', text);
	else
		text = CeL.set_text('original_text');

	// 標注文本 點擊(點選解析)功能。
	CeL.era.to_HTML(text, node || 'parsed_text', {
		add_date : parse_text.add_date,
		onclick : parse_text.onclick
	});

	return false;
}

// parse_text.add_date = true;

parse_text.onclick = function() {
	var era = CeL.era.node_era(this, 'String');
	if (era) {
		era = CeL.era.reduce_name(era.to_Date('era').format({
			parser : 'CE',
			format : '%紀年名 %年年%月月%日日',
			locale : 'cmn-Hant-TW'
		}));
		era_input_object.setValue(era);
		translate_era(era);
	} else
		CeL.warn('解析結果為 [' + era + ']');

	return false;
};

function parsed_text_set_date(add_date) {
	CeL.get_element('parsed_text_add_date').innerHTML
	//
	= (parse_text.add_date = typeof add_date === 'boolean' ? add_date
			: !parse_text.add_date) ? '<em>添加</em>' : '不添加';
	return false;
}

// ---------------------------------------------------------------------//

var set_era_by_url_data_running;
function set_era_by_url_data(era) {
	if (set_era_by_url_data_running)
		return;
	set_era_by_url_data_running = true;

	if (typeof era === 'string') {
		location.hash = '#era=' + era;
		document.title = _('紀年 %1', era);

	} else {

		var column, items,
		// 直接處理 hash / search。
		// e.g., "era.htm#era=%E5%A4%A7%E6%B0%B82%E5%B9%B4&column="
		// #era=景元元年&column=-contemporary&layer=臺灣地震
		// #hierarchy=中國/東漢/安帝
		// #hierarchy=中國/清&layer=臺灣地震
		data = CeL.parse_URI.parse_search(location.search.slice(1),
		//
		CeL.parse_URI.parse_search(location.hash.slice(1)));

		// column=增加此欄,增加此欄
		if (column = data.column)
			add_calendar_column(column.split(','), true);

		// era=紀年名稱
		if (!(era = data.era)
				&& !/[&=]/.test(items = location.search.slice(1)
						|| location.hash.slice(1)))
			era = items;

		// layer=增加資料圖層,增加資料圖層
		if (items = data.layer) {
			if (!Array.isArray(items))
				items = items.split(',')
			items.forEach(function(item) {
				add_tag.load(item);
			});
		}

		if (era) {
			document.title = _('紀年 %1', era);
			click_title_as_era.call({
				title : decodeURIComponent(era)
			});
		} else if (column && era_input_object.setValue())
			translate_era();
		else if (items = data.hierarchy)
			draw_era(Array.isArray(items) ? items : items.split(/[,\/]/));
	}

	set_era_by_url_data_running = false;
}

// ---------------------------------------------------------------------//

var thdl_solar_term,
// 明清實曆節氣
initialize_thdl_solar_term = function() {
	var
	// copy from data.date.
	/** {Number}一整天的 time 值。should be 24 * 60 * 60 * 1000 = 86400000. */
	ONE_DAY_LENGTH_VALUE = new Date(0, 0, 2) - new Date(0, 0, 1);
	var
	// STARTS_FROM: 節氣間間隔以 STARTS_FROM 日起跳。
	STARTS_FROM = 14, DIGITS = 4, MAX_DIGITS = 10 + 26,
	//
	last_date = null, start_year, result = [],
	// 採用 "1516-01-10" 會被當作 UTC+0 解析。
	data = ',,,,,,,,,,,,,,,,,,,,1516/1/10,15,15,15;xohayhfyt;yx7pjq7ut;13mepi9aok;1mmes224b9;xohayhfyt;dhgfgfgggfgfgfffffeffeff;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9yt;gegffgffffgfffgffffgfdff;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xt;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq8g5;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq8g5;13m8seg9xw;1mmes226ol;xohayhfyt;yx7pjq8g5;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq8g5;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq8g5;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohayhfyt;yx7pjq7ut;13m8seg9xw;1mmes224b9;yukmozl05;yx7pjq7ut;13m8seg9xw;1mmes224b9;xr4dt80et;yxve4kklh;13m8seg9xx;xohayh6c5;xr4dt80et;yx7pjq7ut;13m8seg9xw;1mmes224b9;xohb0cv85;yx7pjq7ut;13m8seg9xt;1mmer82a8l;xohb0cv85;yx7pjq7ut;ffgfggfgggfgdhffffefffef;1mmer7lff9;xohb0cv85;yx7pjq7ut;yxvhgfp75;13wxjfez4l;xohayhfyt;yx7pjq5hh;yxvhgfp75;13wxjfez4l;xohayh6hh;yx7pjq5hh;yxvhgfp75;13mephsfv9;xohaqzhg5;xr4dt80ht;f2aum04lt;13mephsfwl;xohayh6hh;xr4dt80et;yx7pr7ww5;13m8seg9xx;xohayh6hh;xr40hri1h;yx7pr7ww5;13m8seg9xw;1mmes226ol;xohb0cv85;yx7pjq7ut;13m8seg9xt;1mmer7lff9;xohb0cv85;yx7pjq7ut;yxvhgfp75;13wxjfj6tx;xohb0cv85;yx7pjq7ut;yxvhgfp75;13wxjfj6tx;xohayhfyt;yul02bio5;yv8rz2dsh;13mephsfv9;xohayh6hh;xr4dt80g5;yxve4kklt;13mephsfv9;xohayh6hh;xr4dt80g5;yx7pr7wwh;13m8t916q8;13m8sega39;xr40hri1h;yx7pr7ww5;13mephsfvl;xofton505;xohb0cv85;yx7pjq7ut;13m8seg9xw;1mmer83c5x;xohb0cv85;yx7pjq7ut;yxvhgfpsk;1mmer7i9n9;xohb0cv85;yx7pjq7ut;yxvhgfpsh;13wxjfj6tx;xohayhfyt;yx7pjq7ut;13m8seg9ch;13wxjfez4l;xohayhfyt;yx7pjq7ut;yxve4kklt;13mephsfv9;xohayh6hh;xr4dt80g5;yxdmuk2tt;13m8seg9xx;fffgfgggfggffdifefffefff;xr40hri2t;ffgfgfgggfggffffffefdhef;13m8seg9xx;xoftoixat;xohb0cv9h;yx7pjq7ut;13m8seg9xx;xofsuocut;xohb0cv85;yx7pjq7ut;13m8seg9xw;1mmer83cb9;xohb0cv8h;yx7pjq7ut;yxvhgfpsl;xofsu28et;xohayhfyt;yx7pjq7v5;13m8p2l5cl;xofsu289h;xohayhfyt;yx7pjq7ut;13m8p2l5cl;xofsu289h;xohayh6hh;yx7c89phh;13m8ov3fpw;1mmer7h7px;xofsuocut;yx7c89n45;yxvdx2vkk;1mm8u451sl;xofsuocut;ymoian3ut;yx7pjq7v5;1mm8u451sl;xofsu7i1h;yx7c89n45;yx7pjq7v5;13m8seg9xx;xofsu7i1h;xr40fw2th;yx7pjq7v5;13m8seg9xx;xofsu6g45;xr40fw2th;yx7pjq7v5;13m8p2l5cl;xoffilq1h;xohayhg05;yx7pjq7v5;13m8p2l5cl;xp3h7ew45;xohayhfyt;yx7pjq7ut;13m8p2l5cl;xofsu289h;xoha4inth;yx7c89phh;13m8ov3gb8;1mm8u451sl;xofsuocut;yx7c89phh;yxvdx2vkk;1mm8u451sl;fffgfgdiggfgfgffefffefff;yx7c89n45;yx7pjq7v5;1mbq06iij9;xofsu7i1h;yx7c6e7ut;yx7pjq7v5;13m8seg9xx;xofsu7i1h;xr40fw2th;yy1b0f1ht;13m8p2l5cl;xofsu6g4h;xohayhg05;yx7pjq7v5;13m8p2l5cl;xofsu28et;xohayhg05;yx7pjq7v5;13m8p2l5cl;xofsu28et;xohayhfyt;yx7c89phh;13m8ov3gb9;xofsu289h;xofsuomc5;yx7c89phh;14sc0lllck;1mm8u451sl;xofsuocut;yx7c89phh;yx7pjq7v8;1mm8u451sl;xofsuocut;yx7c89n45;yx7pjq7v5;1mbq06iij9;xofsu7i1h;yx7c6e7ut;yx7pjq7v5;13m8seg9xx;xofsu7i1h;xohayhg05;yx7pjq7v5;13m8p2l5cl;xofsu7i1h;xohayhg05;yx7pjq7v5;13m8p2mgr9;xofsu28et;xohayhg05;yx7c89pht;13ll0p8hn9;xofsu28et;xofsuomdh;yx7c89pht;13melyfm8l;xo9vqq2hh;xofsuomc5;yx7c89phh;13m8ov3gb9;xo9vqq2c5;xofsuomc5;yx7c89phh;yx7pjq8gk;1mbvx9uogl;xofsuocut;yx7c89phh;yx7pjq7v8;1mbq06iij9;xofsu7i1h;xr40fw2th;yx7pjq7v5;13m8p2l5cl;xofsu7i1h;xohayhg05;yx7pjq7v5;13m8p2l5cl;xofsu7i1h;xohayhg05;yx7pjq7v5;13m8p2l5cl;xofsu6g45;xohayhg05;yx7c89pht;13wrispzkl;xo9if9k45;xofsuomdh;yx7c89pht;13m8ov3gb9;xo9vr6xat;xofsuomc5;yx7c89phh;13lkn6aa8l;xo9vqq2hh;xofsuomc5;yx7c89phh;yx7pjq8gk;1mbq06iij9;xofsuocut;yx7beaxc5;yx7pjq7v8;1mbq06iij9;xofsu7i1h;xohayhg05;yx7pjq7v5;13m8p2l5cl;xofsu7i1h;xohayhg05;yx7pjq7v5;13m8p2l5cl;xofsu7i1h;xohayhg05;yx7c89pht;13m8p2l5cl;xofsu6g45;xofsuomdh;yx7c89pht;13m8ov3gb9;xo9vqq2hg;13wxjg1d8l;yx7c89pht;13ll0hqslx;xo9vqq2hh;xofsuomdh;yx7c89pht;13ll0hqslx;xo9vqq2hi;8qguh9mvp;yx7c89phh;yx7pjpwlw;1mbq06iij9;xofsuocut;yx7c89phh;yx7pjq8gk;1mbpwundxx;fffgfggfggfgffgfdfgfefff;xohayhidh;yx7pjq7v8;13m8p2l5cl;xofsu7hud;xohaymqf9;yx7c89pht;13m8p2l5cl;xofsu7i1h;xoftoneit;yx7c89pht;13m8p2l5cl;xo9vqvc45;xofsuomdh;yx7c89pht;13m8ov3dxx;xo9vqq2hh;xofsuomdh;yx7c89pht;13ll0hqslx;xo9vqq2hh;fffgfggfggfgfgfffef00000'
			.split(';');

	data.forEach(function(year_data, index) {
		if (year_data.includes(',')) {
			// 無簡化方法。
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
			// 次簡化方法。
			year_data = year_data.split('');

			year_data.forEach(function(solar_term, index) {
				last_date += parseInt(solar_term, MAX_DIGITS)
						* ONE_DAY_LENGTH_VALUE;
				year_data[index] = last_date;
			});

		} else {
			// 最簡化方法。
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
	thdl_solar_term.準 = 1645;

	initialize_thdl_solar_term = null;
}

// ---------------------------------------------------------------------//

/**
 * 地理座標（經緯度）<br />
 * the observer's geographic location [ latitude (°), longitude (°), time zone
 * (e.g., UTC+8: 8), elevation or geometric height (m) ]<br />
 * 觀測者 [ 緯度（北半球為正,南半球為負）, 經度（從Greenwich向東為正，西為負）, 時區, 海拔標高(觀測者距海平面的高度) ]
 * 
 * @type {Array}
 */
var local_coordinates;

// ---------------------------------------------------------------------//

/**
 * 
 * @param date
 * @param JD
 * @param 節氣序
 * @param 起算干支序
 * @param [LIST]
 * 
 * @returns {Array}[干支輪序,干支起算之序]
 */
function 節氣後第幾輪干支(date, JD, 節氣序, 起算干支序, LIST) {
	if (typeof 節氣序 === 'string') {
		節氣序 = CeL.astronomy.SOLAR_TERMS.indexOf(節氣序);
	}
	if (!(節氣序 >= 0)) {
		return;
	}

	if (!JD) {
		JD = CeL.Date_to_JD(date.offseted_value());
	}

	// -Math.floor(d) === Math.ceil(-d)
	var 節氣後經過日數 = date.getFullYear();
	// 冬至(18)之後節氣，應算前一年之節氣。
	if (節氣序 >= 18) {
		--節氣後經過日數;
	}
	節氣後經過日數 = Math.ceil(JD - CeL.solar_term_JD(節氣後經過日數, 節氣序));
	if (節氣後經過日數 < 0) {
		return;
	}

	if (typeof 起算干支序 === 'string') {
		if (!LIST) {
			LIST = CeL.date.STEM_LIST.includes(起算干支序) ? CeL.date.STEM_LIST
					: CeL.date.BRANCH_LIST;
		}
		起算干支序 = LIST.indexOf(起算干支序);
	}
	if (!(起算干支序 >= 0)) {
		return;
	}

	var 干支起算之序 = (CeL.date.stem_branch_index(date) - 起算干支序).mod(LIST.length),
	//
	干支輪序 = 節氣後經過日數 - 干支起算之序;
	if (false && 干支輪序 < 0) {
		return;
	}

	干支輪序 = Math.floor(干支輪序 / LIST.length);

	return [ 干支輪序, 干支起算之序, 節氣後經過日數 ];
}

// ---------------------------------------------------------------------//

/**
 * 若非在行用/適用期間，則淡化顯示之。
 * 
 * @param {Date}date
 *            date to detect
 * @param {String}show
 *            text to show
 * @param {Date}start
 *            start date of adaptation
 * @param {Date}end
 *            end date of adaptation. 指結束行用之<b>隔日</b>!
 * 
 * @returns formated style
 */
function adapt_by(date, show, start, end) {
	if (Array.isArray(start) && !end) {
		end = start[1], start = start[0];
	}
	return start && date - start < 0 || end && end - date <= 0 ? {
		span : show || date,
		S : 'color:#aaa;'
	} : show || date;
}

/**
 * 利用 cookie 記錄前次所選欄位。
 */
function column_by_cookie(to_set) {
	if (to_set) {
		// 將所選欄位存於 cookie。
		if (JSON.stringify)
			CeL
					.set_cookie('selected_columns', JSON
							.stringify(selected_columns));
	} else
		// 取得並設定存於 cookie 之欄位。
		try {
			var data = CeL.get_cookie('selected_columns');
			if (data && CeL.is_Object(data = JSON.parse(data)))
				selected_columns = data;
		} catch (e) {
			// TODO: handle exception
		}
}

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

	_.create_menu('language_menu', [ 'TW', 'CN', 'ja', 'en' ], function() {
		draw_era.redraw();
	});

	// translate all nodes to show in specified language (or default domain).
	_.translate_nodes();

	// -----------------------------

	// google.visualization.CandlestickChart
	// Org Chart 組織圖
	// Geo Chart 地理圖

	// onInput(key,list,force)

	era_input_object = new CeL.select_input('era_input', CeL.era
			.get_candidate(), 'includeKeyWC');
	era_input_object.focus();

	CeL.get_element('era_input').onkeypress
	//
	= CeL.get_element('output_format').onkeypress = function(e) {
		if (!e)
			e = window.event;
		// press <kbd>Enter</kbd>
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
	output_format_types_reversed = Object.create(null);
	// reset output_format_types to local language expression.
	output_format_types = Object.create(null);
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
			'年月日時干支:一八八〇年庚辰月庚辰日7時', CE_name + '日期:一八八〇年庚辰月庚辰日庚辰時', '初始元年11月1日',
			'明思宗崇禎1年1月26日', CE_name + '日期:天聰二年甲寅月戊子日',
			CE_name + '日期:天聰2年寅月戊子日', '清德宗光緒六年三月十三日', '清德宗光緒庚辰年三月十三日',
			'清德宗光緒庚辰年庚辰月庚辰日', '清德宗光緒六年三月十三日辰正一刻', '魏少帝嘉平4年5月1日',
			'魏少帝嘉平4年閏5月1日', '魏少帝嘉平4年閏月1日', '景元元年', '景元元年7月', '元文宗天曆2年8月8日',
			'元文宗天曆3/1/2', '旧暦2016年', '共存紀年:JD2032189', '平成26年6月8日', 'H26.6.8',
			'漢和帝劉肇（79年–106年2月13日）' ];
	i.forEach(function(era) {
		list.push({
			div : [ '✔️', {
				a : era,
				title : era,
				href : '#',
				target : '_self',
				onclick : click_title_as_era
			} ]
		});
		o.push(era.replace(/^[^:]+:/, ''));
	});
	CeL.new_node(list, 'example');
	CeL.set_text('batch_source', o.join('\n'));

	// 添加公元日期於紀年後
	(CeL.get_element('parsed_text_add_date').onclick = parsed_text_set_date)
			(true);

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
		CeL.error('當前視窗過小。將採用螢幕之大小，請將視窗放到最大。');
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
		// delete select_panels['data_layer'];
		CeL.toggle_display('data_layer', false);
		if (is_IE11)
			// 多按幾次就會 hang 住。
			CeL.error('IE 11 尚無法使用線圖。請考慮使用 Chrome 或 Firefox 等網頁瀏覽器。');
		CeL.warn(no_SVG_message);
	}

	// -----------------------------

	if (SVG_object) {

		// 設置選項
		CeL.new_node([
				{
					T : '紀年線圖選項：'
				},
				{
					T : '標記正處理的紀年',
					R : 'Markup current era. 標記當下正在處理的紀年。',
					onclick : function() {
						var configured = translate_era.draw_recent_era;
						// reset option status
						CeL.set_class(this, 'configured', {
							remove : configured
						});
						translate_era.draw_recent_era = !configured;
						draw_era.redraw();
						return false;
					},
					C : 'option'
							+ (translate_era.draw_recent_era ? ' configured'
									: '')
				},
				{
					T : '合併歷史時期',
					R : 'merge_periods\ne.g., 三國兩晉南北朝, 五代十國',
					onclick : draw_era.change_option,
					C : 'option'
							+ (draw_era.options.merge_periods ? ' configured'
									: '')
				},
				{
					T : '擴張範圍至君主在世時段',
					R : 'adapt_lifetime',
					onclick : draw_era.change_option,
					C : 'option'
							+ (draw_era.options.adapt_lifetime ? ' configured'
									: '')
				} ], 'era_graph_options');

		// 資料圖層
		list = [ {
			h3 : {
				T : '資料圖層'
			}
		}, {
			T : '請選擇所欲載入之資料圖層。'
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
					var group = this.title,
					//
					status = add_tag.load(group, true);
					if (status)
						CeL.info('data layer [' + group + ']: ' + status);
					else
						add_tag.load(group, function() {
							CeL.new_node({
								span : '✓',
								C : 'loaded_mark'
							}, [ this.parentNode, 1 ]);
							this.className += ' loaded';
							CeL.new_node([ ' ... ', {
								T : [ '已載入 %1 筆資料。',
								//
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
				o.push({
					span : i[3],
					C : 'description'
				});
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

	select_panel('era_graph' in select_panels ? 'era_graph' : 'FAQ', true);

	// -----------------------------

	var data_load_message = {
		T : 'Data will be presented at next calculation.',
		R : 'Data is not yet loaded.',
		S : 'color:#888;font-size:.8em;'
	},
	// copy from data.date.
	/** {Number}一整天的 time 值。should be 24 * 60 * 60 * 1000 = 86400000. */
	ONE_DAY_LENGTH_VALUE = new Date(0, 0, 2) - new Date(0, 0, 1),
	// 添加文字版本圖像 in Unicode
	LUNAR_PHASE_SYMBOL = {
		朔 : '🌑',
		上弦 : '🌓',
		望 : '🌕',
		下弦 : '🌗',
		晦日 : '🌘'
	},
	// "Apple Color Emoji","Segoe UI Emoji","NotoColorEmoji","Segoe UI
	// Symbol","Android Emoji","EmojiSymbols"
	sunrise_sunset_icons = [ '🌃', '🌅'/* 🌄 */, '☀️', '🌇' ],
	//
	建除_LIST = '建除滿平定執破危成收開閉'.split(''),
	// https://github.com/zealotrush/ben_rime/blob/master/symbols.yaml
	ZODIAC_SYMBOLS = '♈♉♊♋♌♍♎♏♐♑♒♓'.split(''),
	// 白羊宮,金牛宮,雙子宮,巨蟹宮,獅子宮,室女宮,天秤宮,天蠍宮,人馬宮,摩羯宮,寶瓶宮,雙魚宮
	ZODIAC_SIGNS = ('Aries,Taurus,Gemini,Cancer,Leo,Virgo,Libra,'
			+ 'Scorpio,Sagittarius,Capricorn,Aquarius,Pisces').split(','),
	// for 皇紀.
	kyuureki, Koki_year_offset = 660, Koki_year = Year_numbering(Koki_year_offset),
	// for 泰國佛曆
	// THAI_Year_numbering = Year_numbering(543),
	//
	Gregorian_reform = new Date(1582, 10 - 1, 15), Revised_Julian_reform = new Date(
			1923, 10 - 1, 14);

	var method_nodes = [ {
		a : '採用 LEA-406'
		//
		+ (CeL.LEA406.default_type === 'a' ? 'b' : 'a'),
		href : '#',
		S : 'cursor:pointer',
		onclick : function() {
			CeL.set_cookie('LEA406_type',
			//
			CeL.LEA406.default_type === 'a' ? 'b' : 'a');
			history.go(0);
			return false;
		}
	}, '（a 較精準，b 較快。點選後將', {
		em : '隨即重新整理'
	}, '，以更改設定！）' ];
	CeL.new_node(method_nodes, 'method_layer');
	method_nodes = [ '🌌 Because using complete LEA-406'
	//
	+ CeL.LEA406.default_type, ' to calculate the position of moon,'
	//
	+ ' it often takes seconds to minutes to display.', {
		br : null
	}, '因為採用了完整的 LEA-406'
	//
	+ CeL.LEA406.default_type + ' 來計算月亮位置，關於月亮位置之項目，例如「', {
		T : '月相'
	}, '」欄每次執行常需耗費數秒至一兩分鐘，敬請見諒。您尚可' ].concat(method_nodes);

	// add 東亞陰陽曆法
	function add_曆法(曆名, 說明, link) {
		if (!說明)
			說明 = '';
		else if (Array.isArray(說明))
			說明 = 說明.join('\n');
		var 行用 = CeL[曆名 + '_Date'].行用;
		if (行用) {
			行用 = [ new Date(行用[0]), new Date(行用[1]) ];
			說明 += '\n行用期間: ' + 行用[0].format(draw_era.date_options) + '–'
					+ 行用[1].format(draw_era.date_options) + ' ('
					+ 行用[0].age(行用[1]) + ')';
		}
		if (CeL[曆名 + '_Date'].閏法)
			說明 += '\n閏法: ' + CeL[曆名 + '_Date'].閏法;
		return [ {
			a : {
				T : 曆名
			},
			R : 說明.trim() + '\n* 以平氣平朔無中置閏規則計算得出，非實曆。',
			href : 'https://' + (曆名.includes('暦') ? 'ja' : 'zh')
			//
			+ '.wikipedia.org/wiki/' + encodeURIComponent(link || 曆名)
		}, function(date) {
			if (date.精 !== '年') {
				var 曆日 = date['to_' + 曆名]({
					小餘 : true,
					節氣 : true
				}), show = 曆日.join('/'),
				//
				matchhed = show.match(/^([^閏]+)(閏)([^閏]+)$/);
				if (matchhed) {
					// 特別標註閏月
					(show = matchhed).shift();
					show[1] = {
						T : '閏',
						S : 'color:#52f;'
					};
				}
				return adapt_by(date, /^1 /.test(曆日[2]) ? {
					span : show,
					S : 'color:#f94;'
				} : show, CeL[曆名 + '_Date'].行用);
			}
		} ];
	}

	function add_陰陽暦(歲首) {
		if (歲首)
			歲首 = {
				歲首 : 歲首
			};
		return function(date) {
			if (/* date.準 || */date.精)
				return;
			// [ 年, 月, 日 ]
			var 曆 = CeL.夏曆(date, 歲首);
			date = '月' + 曆[2] + '日';
			if (typeof 曆[1] === 'string' && 曆[1].charAt(0) === '閏')
				date = [ {
					T : '閏',
					S : 'color:#52f;'
				}, 曆[1].slice(1) + date ];
			else
				date = 曆[1] + date;
			return 曆[2] === 1 ? {
				span : date,
				S : 'color:#f94;'
			} : date;
		}
	}

	function degree_layer(degree) {
		return isNaN(degree) ? data_load_message : {
			div : {
				span : CeL.format_degrees(degree, 0)
				// &nbsp;
				.replace(/ /g, CeL.DOM.NBSP),
				// degree % TURN_TO_DEGREES
				R : degree % 360
			},
			C : 'monospaced',
			S : 'text-align:right;'
		};
	}

	// calendar_columns
	list = {
		week : [ {
			a : {
				T : '星期'
			},
			// 0: 周日/星期日/禮拜天, 1: 周一, 餘類推
			R : '星期/週/禮拜',
			href : 'https://en.wikipedia.org/wiki/Week',
			S : 'font-size:.7em;'
		}, function(date) {
			if (/* !date.準 && */!date.精)
				return {
					span : date.format({
						format : '%A',
						locale : _.get_domain_name()
					}),
					S : date.getDay() === 0 ? 'color:#f34'
					//
					: date.getDay() === 6 ? 'color:#2b3' : ''
				};
		} ],

		JDN : [ {
			a : {
				T : 'JDN'
			},
			R : _('Julian Day Number')

			+ '\n以 UTC 相同日期當天正午12時為準。\n因此 2000/1/1 轉為 2451545。',
			href : 'https://en.wikipedia.org/wiki/Julian_Day_Number'
		}, function(date) {
			var date_String = CeL.Date_to_JDN(date.offseted_value(0))
			//
			+ (date.精 === '年' ? '–' : '');
			return date_String;
		} ],

		JD : [ {
			a : {
				T : 'JD'
			},
			R : _('Julian Date') + '\n以「紀元使用地真正之時間」相同日期當天凌晨零時為準。\n'
			//
			+ '因此對中國之朝代、紀年，2000/1/1 將轉為 2451544.1666... (2000/1/1 0:0 UTC+8)',
			href : 'http://en.wikipedia.org/wiki/Julian_day'
		}, function(date) {
			var date_String = CeL.Date_to_JD(date.offseted_value()).to_fixed(4)
			//
			+ (date.精 === '年' ? '–' : '');
			return date_String;
		} ],

		ISO : [ {
			a : {
				T : 'ISO 8601'
			},
			R : '日期格式 YYYY-MM-DD'
			//
			+ '\nThe standard uses the proleptic Gregorian calendar.',
			href : 'https://en.wikipedia.org/wiki/ISO_8601',
			S : 'font-size:.8em;'
		}, function(date) {
			var year = date.getFullYear() | 0;
			return date.精 === '年' ? _('%1年', year)
			//
			: year.pad(year < 0 ? 5 : 4) + date.format('-%2m-%2d');
		} ],

		ordinal_date : [ {
			a : {
				T : '年日期'
			},
			R : '表示年內的天數。日期格式 YYYY-DDD',
			href : 'https://en.wikipedia.org/wiki/Ordinal_date'
		}, function(date) {
			var year = date.getFullYear() | 0;
			return date.精 === '年' ? _('%1年', year)
			// TODO: use "%j"
			: year.pad(4) + '-' + CeL.ordinal_date(date).pad(3);
		} ],

		week_date : [ {
			a : {
				T : '週日期'
			},
			R : '表示年內的星期數天數，再加上星期內第幾天。',
			href : 'https://en.wikipedia.org/wiki/ISO_week_date'
		}, function(date) {
			return date.精 === '年' ? _('%1年', date.getFullYear())
			// TODO: use "%W"
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
			return (date = date.to_Excel())
			//
			&& (date | 0) || CeL.Excel_Date.error_value;
		} ],

		Excel_Mac : [ {
			a : {
				T : 'Excel Mac'
			},
			R : 'Microsoft Excel for Mac 使用 1904 日期系統。',
			href : 'http://support.microsoft.com/kb/214094',
			S : 'font-size:.8em;'
		}, function(date) {
			return (date = date.to_Excel(true))
			//
			&& (date | 0) || CeL.Excel_Date.error_value;
		} ],

		君主年歲 : [ {
			a : {
				T : '君主實歲'
			},
			R : '統治者年紀歲數，採周歲（又稱實歲、足歲）。未設定出生時間則無資料。\n'
			//
			+ '由於出生時間常常不夠準確，因此計算所得僅供估計參考用！',
			href : 'https://zh.wikipedia.org/wiki/%E5%91%A8%E5%B2%81',
			S : 'font-size:.8em;'
		}, function(date) {
			var 出生 = date.生;
			if (Array.isArray(出生)) {
				出生 = 出生[0];
			}
			if (!出生 || !(出生 = CeL.era(出生, {
				date_only : true
			}))) {
				return;
			}
			return 出生.age(date, {
				歲 : true
			});
		} ],

		contemporary : [ {
			T : '共存紀年',
			R : '本日/本年同時期存在之其他紀年。對未有詳實資料者，僅約略準確至所列日期！'
		}, function(date) {
			return date.共存紀年;
		} ],

		adjacent_contemporary : [ {
			T : '同國共存紀年',
			R : '本日/本年同時期相同國家存在之其他紀年。對未有詳實資料者，僅約略準確至所列日期！'
		}, function(date) {
			return date.同國共存紀年;
		} ],

		// --------------------------------------------------------------------
		// data layer
		資料圖層 : null,

		// --------------------------------------------------------------------
		// 天文計算 astronomical calculations
		astronomy : [ '天文計算 astronomical calculations', method_nodes ],

		precession : [ {
			a : {
				T : 'general precession'
			},
			R : '紀元使用當地、當日零時綜合歲差，指赤道歲差加上黃道歲差 (Table B.1) 的綜合效果。'
			//
			+ '\nKai Tang (2015).'
			//
			+ ' A long time span relativistic precession model of the Earth.'
			//
			+ '\n在J2000.0的时候与P03岁差差大概几个角秒，主要由于周期拟合的时候，很难保证长期与短期同时精度很高。',
			href : 'https://en.wikipedia.org/wiki/Axial_precession'
		}, function(date) {
			if (/* date.準 || */date.精)
				return;

			var precession = CeL.precession(
			//
			CeL.TT(new Date(date.offseted_value())));
			return [ CeL.format_degrees(precession[0], 2), {
				b : ', ',
				S : 'color:#e60;'
			}, CeL.format_degrees(precession[1], 2) ];
		} ],

		solarterms : [ {
			a : {
				T : '天文節氣'
			},
			R : '節氣 + 交節時刻(@當地時間)或七十二候。計算得出，非實曆。於 2015 CE 之誤差約前後一分鐘。\n'
			//
			+ '節氣之後每五日一候，非採用 360/72 = 5° 一候。\n'
			// 合稱四立的立春、立夏、立秋、立冬，四立與二分二至稱為 「分至啟閉」，亦稱為八節
			+ '二十四節氣 / 二分點 (春分秋分) 和二至點 (夏至冬至) / 七十二候 (物候)',
			href : 'https://zh.wikipedia.org/wiki/节气'
		}, function(date) {
			if (/* date.準 || */date.精)
				return;

			var JD = CeL.Date_to_JD(date.offseted_value());
			date = CeL.solar_term_of_JD(JD, {
				pentads : true,
				time : 2
			});
			return !date || date.includes('候') ? date : {
				a : {
					b : date
				},
				href : 'https://zh.wikipedia.org/wiki/' + date.slice(0, 2)
			};
		} ],

		solarterm_days : [ {
			a : {
				T : '節氣經過日數'
			},
			R : '天文節氣 經過日數',
			href : 'https://zh.wikipedia.org/wiki/节气',
			S : 'font-size:.8em;'
		}, function(date) {
			if (/* date.準 || */date.精)
				return;

			var JD = CeL.Date_to_JD(date.offseted_value());

			date = CeL.solar_term_of_JD(JD, {
				days : true
			});
			return CeL.SOLAR_TERMS[date[1]] + ' ' + date[2];
		} ],

		sun_apparent : [ {
			a : {
				// Sun's apparent position
				// apparent longitude of the Sun
				T : "Sun's apparent longitude"
			},
			R : '紀元使用當地、當日零時，太陽的視黃經。\n'
			//
			+ 'the apparent geocentric celestial longitude of the Sun.'
			//
			+ '\nUsing VSOP87D.ear.',
			href : 'https://en.wikipedia.org/wiki/Apparent_longitude'
		}, function(date) {
			if (/* date.準 || */date.精)
				return;

			var JD = CeL.TT(new Date(date.offseted_value()));
			return degree_layer(CeL.solar_coordinates(JD).apparent);
		} ],

		moon_longitude : [ {
			a : {
				T : 'Moon longitude'
			},
			R : '紀元使用當地、當日零時，月亮的黃經。\n'
			//
			+ 'the ecliptic longitude of the Moon.'
			//
			+ '\nUsing LEA-406.',
			href : 'https://en.wikipedia.org/wiki/Apparent_longitude'
		}, function(date) {
			if (/* date.準 || */date.精)
				return;

			var JD = CeL.TT(new Date(date.offseted_value()));

			return degree_layer(CeL.lunar_coordinates(JD, {
				degrees : true
			}).V);
		} ],

		moon_latitude : [ {
			a : {
				T : 'Moon latitude'
			},
			R : '紀元使用當地、當日零時，月亮的黃緯。\n'
			//
			+ 'the ecliptic latitude of the Moon.\n'
			//
			+ 'Using LEA-406.',
			href : 'https://en.wikipedia.org/wiki/Ecliptic_coordinate_system'
		}, function(date) {
			if (/* date.準 || */date.精)
				return;

			var JD = CeL.TT(new Date(date.offseted_value()));

			return degree_layer(CeL.lunar_coordinates(JD, {
				degrees : true
			}).U);
		} ],

		moon_sun : [ {
			a : {
				// 月日視黃經差角
				T : '月日視黃經差'
			},
			R : '紀元使用當地、當日零時，月亮的視黃經-太陽的視黃經\n'
			//
			+ 'the apparent geocentric celestial longitude: Moon - Sun.'
			//
			+ '\nUsing VSOP87D.ear and LEA-406.',
			href : 'https://zh.wikipedia.org/wiki/衝_(天體位置)'
		}, function(date) {
			if (/* date.準 || */date.精)
				return;

			var JD = CeL.TT(new Date(date.offseted_value()));

			return degree_layer(CeL.lunar_phase_angle_of_JD(JD));
		} ],

		lunar_phase : [ {
			a : {
				T : '月相'
			},
			R : 'lunar phase, 天文月相附加可能的日月食資訊。計算得出之紀元使用當地、當日零時月相，非實曆。'
			//
			+ '\nUsing VSOP87D.ear and LEA-406.',
			href : 'https://zh.wikipedia.org/wiki/月相'
		}, function(date) {
			if (/* date.準 || */date.精)
				return;

			var JD = CeL.Date_to_JD(new Date(date.offseted_value())),
			//
			phase = CeL.lunar_phase_of_JD(JD, {
				eclipse : true,
				晦 : '晦日'
			});
			if (Array.isArray(phase)) {
				var is_solar = phase[0] === '朔',
				//
				eclipse_info = phase[2];
				phase = [ {
					span : LUNAR_PHASE_SYMBOL[phase[0]]
				}, {
					b : {
						T : phase[0]
					}
				}, ' ', (JD = CeL.JD_to_Date(phase[1])).format({
					parser : 'CE',
					// format : '%Y/%m/%d %H:%M:%S'
					format : '%H:%M:%S',
					offset : date['minute offset']
				}), eclipse_info ? [ ' ', {
					a : {
						T : eclipse_info.name
					},
					R : _('Moon latitude') + ': '
					//
					+ CeL.format_degrees(eclipse_info.Δlongitude, 2),
					href : 'https://zh.wikipedia.org/wiki/'
					//
					+ encodeURIComponent(
					//
					CeL.JD_to_Date(eclipse_info.TT).format({
						parser : 'CE',
						format : '%Y年%m月%d日',
						offset : 0
					}).replace(/^-/, '前') + (is_solar ? '日' : '月') + '食')
				}, '?', eclipse_info.saros ? [ {
					br : null
				}, {
					// 沙羅週期標示。
					a : {
						T : [ 'saros %1',
						//
						eclipse_info.saros[1] + '#' + eclipse_info.saros[2] ]
					},
					href : 'https://en.wikipedia.org/wiki/'
					//
					+ (is_solar ? 'Solar' : 'Lunar')
					//
					+ '_Saros_' + eclipse_info.saros[1]
				}, {
					a : '@NASA',
					R : 'NASA CATALOG OF ECLIPSE SAROS SERIES',
					href : 'http://eclipse.gsfc.nasa.gov/'
					//
					+ (is_solar ? 'SEsaros/SEsaros' : 'LEsaros/LEsaros')
					//
					+ eclipse_info.saros[1].pad(3) + '.html'
				},
				// 2016/8/10 17:37:17
				// NASA未提供日偏食或月食之map。但是本工具之判斷尚不準確。此時得靠前面之"@NASA"連結取得進一部資訊。
				is_solar && eclipse_info.type !== 'partial' ? [ ' (', {
					a : {
						T : 'path'
					},
					R : 'Eclipse Path by NASA',
					href : 'http://eclipse.gsfc.nasa.gov/SEsearch/'
					//
					+ 'SEsearchmap.php?Ecl='
					//
					+ CeL.JD_to_Date(eclipse_info.TT).format({
						parser : 'CE',
						format : '%5Y%2m%2d',
						offset : 0
					}) + '#map'
				}, ')' ] : '' ] : '', ' ', isNaN(eclipse_info.TT) ? '' : {
					span : CeL.JD_to_Date(CeL.UT(eclipse_info.TT)).format({
						parser : 'CE',
						format : '%H:%M:%S',
						offset : date['minute offset']
					}),
					R : 'maximum eclipse, 本地食甚時間.' + (eclipse_info.magnitude
					//
					? ' 食甚食分: ' + eclipse_info.magnitude.to_fixed(3) : '')
				}, '?' ] : '' ];
			} else if (phase)
				phase = [ {
					span : LUNAR_PHASE_SYMBOL[phase]
				}, {
					b : {
						T : phase
					}
				} ];
			return phase;
		} ],

		sunrise_sunset : [ {
			a : {
				// 日出日沒
				T : '日出日落'
			},
			R : '所設定之地理座標當地當日之日出日落時刻。約有兩三分的精確度。',
			href : 'https://en.wikipedia.org/wiki/Sunrise'
		}, function(date) {
			if (/* date.準 || */date.精)
				return;

			var JDN = CeL.Date_to_JDN(date.offseted_value(0)),
			//
			data = [];

			CeL.rise_set(local_coordinates, JDN)
			//
			.forEach(function(JD, index) {
				if (JD)
					data.push(CeL.JD_to_Date(JD).format({
						parser : 'CE',
						format : '%Y/%m/%d %H:%M:%S',
						offset : local_coordinates[2] * 60
					}), ' ' + sunrise_sunset_icons[index], {
						T : (index % 2 === 0 ? '' : 'sun')
						//
						+ CeL.rise_set.type_name[index]
					}, {
						br : null
					});
			});

			return data;
		} ],

		twilight : [ {
			a : {
				T : '曙暮光'
			},
			R : '所設定之地理座標當地當日之曙光暮光時刻。約有兩三分的精確度。',
			href : 'https://en.wikipedia.org/wiki/Twilight'
		}, function(date) {
			if (/* date.準 || */date.精)
				return;

			var JDN = CeL.Date_to_JDN(date.offseted_value(0)),
			//
			data = [];

			CeL.rise_set(local_coordinates, JDN, '456789'.split(''))
			//
			.forEach(function(JD, index) {
				if (JD)
					data.push(CeL.JD_to_Date(JD).format({
						parser : 'CE',
						format : '%Y/%m/%d %H:%M:%S',
						offset : local_coordinates[2] * 60
					}), ' ', {
						T : CeL.rise_set.type_name[index + 4]
					}, index === 2 ? {
						hr : null,
						S : 'margin:.1em;'
					} : {
						br : null
					});
			});

			return data;
		} ],

		moon_rise_set : [ {
			a : {
				T : '月出月落'
			},
			R : '所設定之地理座標當地當日之月出月落時刻。約有兩三分的精確度。',
			href : 'http://www.cwb.gov.tw/V7/astronomy/moonrise.htm'
		}, function(date) {
			if (/* date.準 || */date.精)
				return;

			var JDN = CeL.Date_to_JDN(date.offseted_value(0)),
			//
			data = [];

			CeL.rise_set(local_coordinates, JDN, null, 'moon')
			//
			.forEach(function(JD, index) {
				if (JD)
					data.push(CeL.JD_to_Date(JD).format({
						parser : 'CE',
						format : '%Y/%m/%d %H:%M:%S',
						offset : local_coordinates[2] * 60
					}), ' ', {
						T : (index % 2 === 0 ? '' : 'moon')
						//
						+ CeL.rise_set.type_name[index]
					}, {
						br : null
					});
			});

			return data;
		} ],

		ΔT : [ {
			a : {
				T : 'ΔT'
			},
			R : 'Universal Time = Terrestrial Time - ΔT\n'
			//
			+ '簡略的說，日常生活時間 UT = 天文計算用時間 TT - ΔT',
			href : 'http://eclipse.gsfc.nasa.gov/SEcat5/deltatpoly.html'
		}, function(date) {
			if (/* date.準 || */date.精)
				return;

			var JD = CeL.Date_to_JD(date.offseted_value()),
			//
			ΔT = CeL.deltaT.JD(JD);
			return CeL.age_of(0, ΔT * 1000)
			//
			+ ' (' + ΔT.to_fixed(Math.abs(ΔT) < 60 ? 4 : 2) + ' s)';
		} ],

		JD_of_TT : [ {
			a : {
				T : 'JD of TT'
			},
			R : '紀元使用當地、當日零時之天文計算用時間 TT, apply ΔT to UT.',
			href : 'https://en.wikipedia.org/wiki/Terrestrial_Time'
		}, function(date) {
			if (/* date.準 || */date.精)
				return;

			return CeL.TT(new Date(date.offseted_value()));
		} ],

		// --------------------------------------------------------------------
		// 各國曆法 Historical calendar
		calendar : '計算日期的方法。計算得出，不一定是實暦。',

		Gregorian : [ {
			a : {
				T : 'Gregorian calendar'
			},
			R : 'proleptic Gregorian calendar WITH year 0.'
			//
			+ ' Adopted in 1582/10/15 CE.\n包含0年的外推格里曆',
			href : 'https://en.wikipedia.org/wiki/'
			//
			+ 'Proleptic_Gregorian_calendar',
			S : 'font-size:.8em;'
		}, function(date) {
			return adapt_by(date, date.format('%Y/%m/%d'), Gregorian_reform);
		} ],

		Julian : [ {
			a : {
				T : 'Julian calendar'
			},
			R : 'proleptic Julian calendar WITHOUT year 0,'
			//
			+ ' used before 1582/10/15 CE.\n不包含0年的外推儒略曆',
			href : 'https://en.wikipedia.org/wiki/Proleptic_Julian_calendar',
			S : 'font-size:.8em;'
		}, function(date) {
			return adapt_by(date, date.format({
				parser : 'Julian',
				format : date.精 === '年' ? '%Y年' : '%Y/%m/%d'
			}), null, Gregorian_reform);
		} ],

		Revised_Julian : [ {
			a : {
				T : 'Revised Julian calendar'
			},
			R : 'proleptic Revised Julian calendar WITHOUT year 0.'
			//
			+ ' Adopted in 1923/10/14 CE.\n不包含0年的外推儒略改革曆',
			href : 'https://en.wikipedia.org/wiki/Revised_Julian_calendar',
			S : 'font-size:.8em;'
		}, function(date) {
			return adapt_by(date, date.精 === '年' ? date.to_Revised_Julian({
				format : 'serial'
			})[0] : date.to_Revised_Julian().join('/'), Revised_Julian_reform);
		} ],

		Tabular : [ {
			a : {
				T : '伊斯蘭曆'
			},
			R : 'Tabular Islamic calendar\n日落後為伊斯蘭曆隔日。',
			href : 'http://en.wikipedia.org/wiki/Tabular_Islamic_calendar'
		}, function(date) {
			return date.精 === '年' ? date.to_Tabular({
				format : 'serial'
			})[0] + ' AH' : [ date.to_Tabular({
				format : 'serial'
			}).slice(0, 3).join('/') + ' AH; ', {
				span : date.to_Tabular(),
				dir : 'rtl',
				S : 'unicode-bidi: -moz-isolate;'
			} ];
		} ],

		Solar_Hijri : [ {
			a : {
				T : 'گاه‌شماری هجری خورشیدی'
			},
			R : 'Solar Hijri calendar / 現代伊朗曆/阿富汗曆(陽曆) / ヒジュラ太陽暦/アフガン暦/ジャラリ暦',
			href : 'https://fa.wikipedia.org/wiki/گاه‌شماری_هجری_خورشیدی'
		}, function(date) {
			return date.精 === '年' ? date.to_Solar_Hijri({
				format : 'serial'
			})[0] + ' SH' : [ date.to_Solar_Hijri({
				format : 'serial'
			}).slice(0, 3).join('/') + ' SH; ', {
				span : date.to_Solar_Hijri(),
				dir : 'rtl',
				S : 'unicode-bidi: -moz-isolate;'
			} ];
		} ],

		Bangla : [ {
			a : {
				T : 'Bangla calendar'
			},
			R : 'revised Bengali Calendar or Bangla Calendar. 現行孟加拉曆.'
			//
			+ '\n自日出起算。日出 (6:0) 為孟加拉曆當日起始。Day begins at sunrise.',
			href : 'https://en.wikipedia.org/wiki/Bengali_calendar'
		}, function(date) {
			return date.精 === '年' ? date.to_Bangla({
				format : 'serial'
			})[0] + ' BS' : date.to_Bangla({
				format : 'serial'
			}).slice(0, 3).join('/') + ' BS; ' + date.to_Bangla();
		} ],

		Hebrew : [ {
			a : {
				T : '希伯來曆'
			},
			R : 'Hebrew calendar, 猶太曆\n日落後為隔日。'
			//
			+ '\na Jewish "day" begins and ends at shkiah (sunset)',
			href : 'https://he.wikipedia.org/wiki/הלוח_העברי'
		}, function(date) {
			return date.精 === '年' ? date.to_Hebrew({
				format : 'serial'
			})[0] + '年' : date.to_Hebrew({
				format : 'serial'
			}).slice(0, 3).join('/') + '; ' + date.to_Hebrew();
		} ],

		Long_Count : [ {
			a : {
				T : '長紀曆'
			},
			R : 'Mesoamerican Long Count calendar / 中美洲馬雅長紀曆',
			href : 'https://en.wikipedia.org/wiki/'
			//
			+ 'Mesoamerican_Long_Count_calendar'
		}, function(date) {
			return CeL.Maya_Date.to_Long_Count(date)
			//
			+ (date.精 === '年' ? '–' : '');
		} ],

		// TODO: 馬雅 Short Count
		// https://en.wikipedia.org/wiki/Maya_calendar#Short_Count

		Tzolkin : [ {
			a : {
				T : "Maya Tzolk'in"
			},
			R : "中美洲馬雅 Tzolk'in 曆",
			href : "https://en.wikipedia.org/wiki/Tzolk'in",
			S : 'font-size:.8em;'
		}, function(date) {
			return CeL.Maya_Date.to_Tzolkin(date)
			//
			+ (date.精 === '年' ? '–' : '');
		} ],

		Haab : [ {
			a : {
				T : "Maya Haab'"
			},
			R : "中美洲馬雅 Haab' 曆",
			href : "https://en.wikipedia.org/wiki/Haab'",
			S : 'font-size:.8em;'
		}, function(date) {
			return CeL.Maya_Date.to_Haab(date) + (date.精 === '年' ? '–' : '');
		} ],

		Dai : [ {
			a : {
				T : '傣曆',
			},
			R : '西雙版納傣曆紀元始於公元638年3月22日，可轉換之範圍於傣曆714年（1352/3/28–）至3190年期間內。\n'
			//
			+ '傣曆有0年。非精確時，可能有最多前後2年的誤差。',
			href : 'https://zh.wikipedia.org/wiki/傣曆'
		}, function(date) {
			var dai;
			return date - CeL.Dai_Date.epoch < 0
			// 超出可轉換之範圍。
			|| isNaN((dai = date.to_Dai({
			// format : 'serial'
			}))[0]) ? {
				T : [ '約%1年', date.to_Dai({
					ignore_year_limit : true
				})[0] ]
			} : date.精 === '年' ? dai[0] + '年' : dai.slice(0, 3).join('/')
			//
			+ '(周' + (date.getDay() + 1) + ')' + (dai[3] ? ' ' + dai[3] : '');
		} ],

		Myanmar : [ {
			a : {
				T : 'မြန်မာ ပြက္ခဒိန်',
			},
			R : '緬甸曆法. Myanmar calendar, Burmese calendar.\n'
			//
			+ '緬曆有0年。非精確時，可能有最多前後2日的誤差。\n'
			//
			+ '本工具所使用之演算法僅適用於緬曆0年至1500年。',
			href : 'https://en.wikipedia.org/wiki/Burmese_calendar'
		}, function(date) {
			if (date.精 === '年')
				return 'ME' + date.to_Myanmar({
					format : 'serial'
				})[0];

			var Myanmar_date = date.to_Myanmar({
				notes : true,
				format : 'serial'
			});

			var result = [ Myanmar_date.slice(0, 3).join('/'), '; ',
			//
			date.to_Myanmar().slice(0, 3).join(' '), {
				br : null
			}, {
				span : date.to_Myanmar({
					locale : 'my'
				}).join(' '),
				C : 'Myanmar'
			} ], notes;

			// calendar notes. Myanmar Astrological Calendar Days.
			if (Myanmar_date.notes) {
				result.push({
					br : null
				}, {
					span : notes = [],
					C : 'notes Myanmar'
				});
				Myanmar_date.notes.forEach(function(note) {
					if (note.includes('Thingyan') || note.includes('New year'))
						note = {
							b : note,
							S : 'color:#853;'
						};
					notes.push(note, {
						b : ', ',
						S : 'color:#15e;'
					});
				});
				notes.pop();
			}

			// only for Myanmar year 2 to 1500
			// https://github.com/yan9a/mcal/blob/master/mc_main_m.js
			// BY:2,EY:1500
			if (!(Myanmar_date[0] >= 2) || !(Myanmar_date[0] <= 1500)) {
				result = {
					span : result,
					S : 'color:#888 !important'
				};
			}

			return result;
		} ],

		Yi : [ {
			a : {
				T : '彝曆',
			},
			R : '彝族十月太陽曆。採歲末過年日以冬至起頭之法，而非採四年一閏法！\n'
			//
			+ '彝曆一日分12時段，自當天拂曉前雞鳴起。\n'
			//
			+ '若公元12月27日對彝曆1月1日，則自公元12月27日約凌晨3點起跨入彝曆1月1日。\n' +
			//
			'過年日於曆算法中，古稱「歲餘日」。',
			href : 'https://zh.wikipedia.org/wiki/彝曆'
		}, function(date) {
			var yi;
			// 超出可轉換之範圍。
			return isNaN((yi = date.to_Yi({
			// format : 'serial'
			}))[0]) ? {
				T : [ '約%1年', date.to_Yi({
					ignore_year_limit : true
				})[0] ]
			} : date.精 === '年' ? yi[0] + '年' : yi.slice(0, 3).join('/')
			//
			+ '; ' + date.to_Yi({
				format : 'name'
			});
		} ],

		Hindu : [ {
			a : {
				T : 'हिन्दू पंचांग',
			},
			R : 'Hindu calendar, 印度曆, 自日出起算。'
			//
			+ '\n日出 (6:0) 為印度曆當日起始。Day begins at sunrise.',
			href : 'https://en.wikipedia.org/wiki/Hindu_calendar'
		}, function(date) {
			if (date.精 === '年')
				return 'Saka ' + date.to_Hindu({
					era : 'Saka',
					format : 'serial'
				})[0] + '年';

			var Hindu_date = date.to_Hindu({
				era : 'Saka',
				// epithet : [ '閏', '', '缺' ],
				note : true,
				format : 'serial'
			}), named_date = date.to_Hindu({
				era : 'Saka'
			});
			return [ 'Saka ' + Hindu_date.slice(0, 3).join('/'), {
				br : null
			}, {
				span : named_date[0],
				R : 'year'
			}, ' ', {
				span : named_date[1],
				R : 'month',
				S : 'color:#4a2;'
			}, ' ', {
				span : named_date[2],
				R : 'date',
				S : 'color:#633;'
			}, {
				br : null
			}, ' Nakṣatra: ' + Hindu_date.Nakṣatra, {
				br : null
			}, 'Vāsara: ' + Hindu_date.Vāsara ];
		} ],

		Indian_national : [ {
			a : {
				T : 'भारतीय राष्ट्रीय पंचांग'
			},
			R : '印度國定曆, Indian national calendar',
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

		// Chinese Buddhist calendar
		Buddhist : [ {
			a : {
				T : '佛曆'
			},
			R : '佛紀，1911–。佛曆年 = 公曆年 + 543，若過佛誕日（印度曆二月初八，農曆四月初八。）再加1年。\n'
			//
			+ '有採用0年。非精確時，可能有最多前後一年的誤差。',
			href : 'https://zh.wikipedia.org/wiki/佛曆'
		}, function(date) {
			var year = date.getFullYear() | 0;
			if (year < 1911) {
				year += 543;
				if (date.getMonth() >= 4)
					year++;
				return {
					T : [ '約%1年', year ]
				};
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
			return (year + 543) + (date.精 === '年' ? '年' : '/'
			//
			+ (date.getMonth() + 1) + '/' + date.getDate());
		} ],

		Nanakshahi : [ {
			a : {
				T : 'ਨਾਨਕਸ਼ਾਹੀ'
			},
			R : 'Nanakshahi calendar, 印度錫克教日曆, ナーナク暦. ਨਾਨਕਸ਼ਾਹੀ ਕੈਲੰਡਰ'
			//
			+ '\nAdopted in 2003/3/14 CE (535/1/1 NS). 自 2003 行用。',
			href : "https://en.wikipedia.org/wiki/Nanakshahi_calendar"
		}, function(date) {
			return date.精 === '年' ? date.to_Nanakshahi({
				format : 'serial'
			})[0] + ' NS' : date.to_Nanakshahi({
				format : 'serial'
			}).slice(0, 3).join('/') + ' NS; ' + date.to_Nanakshahi();
		} ],

		Bahai : [ {
			a : {
				T : 'گاه‌شماری بهائی'
			},
			R : "Bahá'í / Badí‘ calendar, 巴哈伊曆",
			// https://fa.wikipedia.org/wiki/گاه‌شماری_بهائی
			href : "https://en.wikipedia.org/wiki/Bahá'í_calendar"
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
			R : 'Coptic calendar,'
			//
			+ ' 紀年紀月紀日與 Diocletian era (Era of the Martyrs) 相同。',
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

		Armenian : [ {
			a : {
				T : '教會亞美尼亞曆'
			},
			R : 'year / month / date, weekday\n'
			//
			+ 'Armenian calendar, 教會亞美尼亞曆法, Հայկական եկեղեցական տոմար',
			href : 'https://hy.wikipedia.org/wiki/Հայկական_եկեղեցական_տոմար'
		}, function(date) {
			return date.精 === '年' ? date.to_Armenian({
				format : 'serial'
			})[0] + '年' : date.to_Armenian({
				format : 'serial'
			}).slice(0, 3).join('/') + '; ' + date.to_Armenian({
				format : 'name'
			});
		} ],

		Byzantine : [ {
			a : {
				T : 'Byzantine calendar'
			},
			R : 'Byzantine Creation Era',
			href : 'https://en.wikipedia.org/wiki/Byzantine_calendar',
			S : 'font-size:.8em;'
		}, function(date) {
			return date.精 === '年' ? date.to_Byzantine({
				format : 'serial'
			})[0] + '年' : date.to_Byzantine({
				format : 'serial'
			}).slice(0, 3).join('/') + '; ' + date.to_Byzantine();
		} ],

		Egyptian : [ {
			a : {
				T : '古埃及曆'
			},
			R : 'Ancient civil Egyptian calendar. 每年皆為準確的365日。'
			//
			+ '\nThe first 6th epagomenal day is 22/8/29 BCE.'
			//
			+ '\nThe year is meaningless,'
			//
			+ ' it is just slightly synchronize with the common era.',
			href : 'https://en.wikipedia.org/wiki/Egyptian_calendar'
		}, function(date) {
			if (date.精 === '年')
				return {
					T : [ '約%1年', date.to_Egyptian({
						format : 'serial'
					})[0] ]
				};

			var tmp = date.to_Egyptian({
				format : 'serial'
			}).slice(0, 3),
			//
			season_month = CeL.Egyptian_Date
			//
			.season_month(tmp[1]);

			date = tmp.join('/') + '; ' + tmp[0] + ' '
			//
			+ CeL.Egyptian_Date.month_name(tmp[1]);
			tmp = ' ' + tmp[2];
			if (season_month)
				date = [ date, {
					sub : ' (' + season_month + ')',
					S : 'color:#291;'
				}, tmp ];
			else
				date += tmp;

			return date;
		} ],

		Republican : [ {
			a : {
				T : 'Calendrier républicain'
			},
			R : 'Le calendrier républicain,'
			//
			+ ' ou calendrier révolutionnaire français.\n'
			//
			+ '每年第一天都從法國秋分日開始。法國共和曆行用期間 1792/9/22–1805/12/31，'
			//
			+ '後來巴黎公社 1871/5/6–23 曾一度短暫恢復使用。',
			href : 'https://fr.wikipedia.org/wiki/Calendrier_républicain'
		}, function(date) {
			return date.精 === '年' ? date.to_Republican({
				format : 'serial'
			})[0] + '年' : date.to_Republican({
				format : 'serial'
			}).slice(0, 3).join('/') + '; ' + date.to_Republican();
		} ],

		// --------------------------------------------------------------------
		// 中國傳統曆法 Chinese calendar, 太陰太陽暦
		// https://zh.wikipedia.org/wiki/阴阳历
		東亞陰陽曆 : [ 'East Asian lunisolar calendar. '
		//
		+ '中國、日本、朝鮮歷代計算日期的方法。計算得出，不一定是實暦。',
		//
		[ '夏、商、西周觀象授時，本工具於這些曆法採用天文演算，較耗時間。', {
			b : [ '實際天象可選用上方「', {
				T : '天文節氣'
			}, '」、「', {
				T : '月相'
			}, '」欄。' ]
		}, '「', {
			T : '月相'
		}, '」欄並附注可能之日月食。' ] ],

		夏曆 : [ {
			a : {
				T : '夏曆'
			},
			R : 'traditional Chinese lunisolar calendar.'
			//
			+ '\n當前使用之農曆/陰曆/夏曆/黃曆曆法. 計算速度較慢！'
			//
			+ '\n以定氣定朔無中置閏規則計算得出之紀元使用當地、當日零時之傳統定朔曆法（陰陽曆），非實曆。預設歲首為建寅。',
			href : 'https://zh.wikipedia.org/wiki/農曆'
		}, add_陰陽暦() ],

		殷曆 : [ {
			a : {
				T : '殷曆'
			},
			R : '以定氣定朔無中置閏規則計算得出，非實曆。殷曆預設歲首為建丑。計算速度較慢！',
			href : 'https://zh.wikipedia.org/wiki/古六歷'
		}, add_陰陽暦('丑') ],

		周曆 : [ {
			a : {
				T : '周曆'
			},
			R : '以定氣定朔無中置閏規則計算得出，非實曆。周曆預設歲首為建子。計算速度較慢！',
			href : 'https://zh.wikipedia.org/wiki/古六歷'
		}, add_陰陽暦('子') ],

		// 黃帝曆 : add_曆法('黃帝曆', '非黃帝紀元'),
		太初曆 : add_曆法('太初曆', '從漢武帝太初元年夏五月（前104年）至後漢章帝元和二年二月甲寅（85年），太初曆共實行了188年。'),
		後漢四分曆 : add_曆法('後漢四分曆', '東漢章帝元和二年二月四日甲寅至曹魏青龍五年二月末（東吳用至黃武二年）施用《四分曆》。'),
		乾象曆 : add_曆法('乾象曆', '三國東吳孫權黃武二年正月（223年）施行，直到天紀三年（280年）東吳滅亡。'),
		景初曆 : add_曆法('景初曆',
				'魏明帝景初元年（237年）施行。南北朝劉宋用到444年，被《元嘉曆》取代。北魏用到451年，被《玄始曆》取代。'),
		三紀曆 : add_曆法('三紀曆', '姜岌在十六國後秦白雀元年（384年）編制。同年起施行三十多年。'),
		玄始曆 : add_曆法('玄始曆', '北涼、北魏於452年用玄始曆、元始曆至正光三年（522年）施行《正光曆》。'),
		元嘉曆 : add_曆法('元嘉曆', [ '劉宋二十二年，普用元嘉曆。梁武帝天監九年（510年）被《大明曆》取代。',
				'文武天皇元年（697年）からは元嘉暦を廃して儀鳳暦を正式に採用することとなった。' ]),
		大明曆 : add_曆法('大明曆', [ '大明曆，亦稱「甲子元曆」。梁天監九年（510年）施行至陳後主禎明三年（589年）。',
				'惟實曆陳永定3年閏4月，太建7年閏9月；與之不甚合。' ], '大明曆_(祖沖之)'),
		正光曆 : add_曆法('正光曆', '魏孝明帝改元正光，於正光三年（522年）施行。興和二年被《興和曆》取代。'),
		興和曆 : add_曆法('興和曆', '正光三年（522年）施行到東魏滅亡。'),
		天保曆 : add_曆法('天保曆', '天保元年施用至齊幼主承光元年（577年）', '天保曆_(中國)'),
		天和曆 : add_曆法('天和曆', '北周天和元年（566年）採用甄鸞《天和曆》。施用至宣政元年（578年）'),
		大象曆 : add_曆法('大象曆',
				'北周大象元年（579年）太史上士馬顯等撰寫了新曆《丙寅元歷》取代《天和曆》，頒用至隋文帝開皇四年（584年）'),
		開皇曆 : add_曆法('開皇曆', '隋開皇四年（584年）張賓修訂，頒用至開皇十六年（596年）。'),
		大業曆 : add_曆法('大業曆', '隋開皇十七年（597年）張胄玄撰，頒用至大業四年（608年）'),
		平朔戊寅元曆 : add_曆法('平朔戊寅元曆',
				'採用定朔法，貞觀十九年（645年）之後採用平朔法。麟德元年（664年），被《麟德曆》取代。', '戊寅元曆'),
		平朔儀鳳暦 : add_曆法(
				'平朔儀鳳暦',
				'文武天皇元年（697年）から儀鳳暦が単独で用いられるようになった（ただし、前年の持統天皇10年説・翌年の文武天皇2年説もある）。ただし、新暦の特徴の1つであった進朔は行われなかったとされている。その後67年間使用されて、天平宝字8年（764年）に大衍暦に改暦された。',
				'儀鳳暦'),

		// --------------------------------------------------------------------
		// 列具曆注, 具注曆譜, calendar notes
		曆注 : '具注曆日/曆書之補充注釋，常與風水運勢、吉凶宜忌相關。',
		// TODO: 農民曆, 暦注計算 http://koyomi8.com/sub/rekicyuu.htm
		// TODO: http://www.bsm.org.cn/show_article.php?id=543
		// 李賢注：“曆法，春三月己巳、丁丑，夏三月甲申、壬辰，秋三月己亥、丁未，冬三月甲寅、壬戌，為八魁。”
		// TODO: 天李、入官忌、日忌和歸忌
		// TODO: [[數九]]: 從冬至開始每過九天記為一九，共記九九
		// 後漢書註 蘇竟楊厚列傳 「八魁」注稱:「春三月己巳、丁丑,夏三月甲申、壬辰,秋三月己亥、丁未,冬三月甲寅、壬戌,爲八魁。」
		// see 欽定協紀辨方書
		// http://www.cfarmcale2100.com.tw/
		// http://www.asahi-net.or.jp/~ax2s-kmtn/ref/calendar_j.html#zassetsu
		// http://www.asahi-net.or.jp/~ax2s-kmtn/ref/astrology_j.html
		// 值年太歲星君: https://zh.wikipedia.org/wiki/%E5%A4%AA%E6%AD%B2

		// 没滅日 大小歳/凶会 下段 雑注 日遊 節月
		// http://www.wagoyomi.info/guchu.cgi

		月干支 : [ {
			a : {
				T : '月干支'
			},
			R : '月干支/大小月。此為推算所得，於部分非寅正起始之年分可能有誤！'
			//
			+ '\n警告：僅適用於中曆、日本之旧暦與紀年！對其他紀年，此處之值可能是錯誤的！',
			href : 'https://zh.wikipedia.org/wiki/干支',
			S : 'font-size:.7em;'
		}, function(date) {
			return (date.月干支 || '') + (date.大小月 || '');
		} ],

		日干支 : [ function(era_name) {
			return era_name && era_name.includes('月') ? {
				a : {
					T : '日干支'
				},
				R : '警告：僅適用於中曆、日本之旧暦與紀年！對其他紀年，此處之值可能是錯誤的！',
				href : 'https://zh.wikipedia.org/wiki/干支',
				S : 'font-size:.7em;'
			} : {
				T : '朔日',
				R : '實曆每月初一之朔日。若欲求天文朔日，請採「' + _('月相') + '」欄。'
			};
		}, function(date) {
			return /* !date.準 && */!date.精 && date.format({
				format : '%日干支',
				locale : CeL.gettext.to_standard('Chinese')
			});
		} ],

		Chinese_solar_terms : [ {
			a : {
				T : '明清節氣'
			},
			R : '明朝、清朝 (1516–1941 CE) 之中國傳統曆法實曆節氣 from 時間規範資料庫.\n'
			//
			+ '以清朝為主。有些嚴重問題須注意，見使用說明。',
			href : 'http://140.112.30.230/datemap/reference.php'
		}, function(date) {
			if (/* date.準 || */date.精)
				return;

			initialize_thdl_solar_term && initialize_thdl_solar_term();

			var year = date.getFullYear();
			if (year < thdl_solar_term.start)
				return;

			var time, year_data = thdl_solar_term[year];
			if (!year_data
			//
			|| (time = date.getTime()) < year_data[0])
				// 試試看前一年。
				year_data = thdl_solar_term[--year];

			year_data = year_data && CeL.SOLAR_TERMS[year_data.indexOf(time)];
			if (year_data)
				return date.getFullYear() < thdl_solar_term.準 ? {
					span : year_data,
					R : '推算所得，非實曆。',
					S : 'color:#888;'
				} : year_data;
		} ],

		// 日柱的五行 日の五行 : 以六十甲子納音代
		日納音 : [ {
			a : {
				T : '日納音'
			},
			R : '六十甲子納音、納音五行。中曆曆注、日本の暦注の一つ。\n'
			//
			+ '日納音較月納音、年納音常用。司马雄 民俗宝典·万年历 稱日納音為五行',
			href : 'https://zh.wikipedia.org/wiki/納音'
		}, function(date) {
			return /* !date.準 && */!date.精 && CeL.era.納音(date);
		} ],

		月納音 : [ {
			a : {
				T : '月納音'
			},
			R : '中曆曆注。納音五行',
			href : 'https://zh.wikipedia.org/wiki/納音'
		}, function(date) {
			return /* !date.準 && */!date.精 && CeL.era.納音(date, '月');
		} ],

		// e.g., 毛耀顺主编《中华五千年长历》 "納音屬水"
		年納音 : [ {
			a : {
				T : '年納音'
			},
			R : '中曆曆注。納音五行',
			href : 'https://zh.wikipedia.org/wiki/納音'
		}, function(date) {
			return /* !date.準 && */!date.精 && CeL.era.納音(date, '年');
		} ],

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
		建除 : [ {
			a : {
				T : '建除'
			},
			R : '中曆曆注、日本の暦注の一つ。(中段十二直)'
			//
			+ '\n建除十二神(十二值位/十二值星/通勝十二建)、血忌等，都被歸入神煞體系。'
			//
			+ '\n交節採天文節氣，非實曆。',
			href : 'https://zh.wikipedia.org/wiki/建除十二神',
			S : 'font-size:.8em;'
		}, function(date) {
			if (/* date.準 || */date.精)
				return;

			var JD = CeL.Date_to_JD(date.offseted_value());

			var 建除 = CeL.stem_branch_index(date)
			// .5: 清明、立夏之類方為"節"，因此配合節氣序，需添加之 offset。
			// 添上初始 offset (9) 並保證 index >= 0。
			// -1e-8: 交節當日即開始疊。因此此處之 offset 實際上算到了當日晚 24時，屬明日，需再回調至當日晚。
			+ 建除_LIST.length + 9 + .5 - 1e-8
			// 交節則疊兩值日。採天文節氣，非實曆。
			// 30 = TURN_TO_DEGREES / (SOLAR_TERMS_NAME / 2)
			// = 360 / (24 / 2)
			- CeL.solar_coordinates(JD + 1).apparent / 30 | 0;
			建除 = 建除_LIST[建除 % 建除_LIST.length]
			return 建除 === '建' ? {
				span : 建除,
				S : 'color:#f24;font-weight:bold;'
			} : 建除;
		} ],

		伏臘 : [ {
			a : {
				T : '伏臘'
			},
			R : '中曆曆注。伏臘日: 三伏日+臘日+起源自佛教之臘八節\n'
			//
			+ '尹灣漢墓簡牘論考: 秦漢之前無伏臘。秦漢時伏臘尚無固定規則，此處所列僅供參考。或在漢成帝鴻嘉年間已成曆例。'
			//
			+ '\n交節採天文節氣，非實曆。',
			href : 'https://zh.wikipedia.org/wiki/三伏'
		}, function(date) {
			if (/* date.準 || */date.精)
				return;

			var JD = CeL.Date_to_JD(date.offseted_value()),
			//
			solar_term = CeL.solar_term_of_JD(JD, {
				days : true
			}), 干支輪序;

			if (7 <= solar_term[1] && solar_term[1] <= 10) {
				// 三伏天: solar_term[1] @ 小暑(7)~處暑(10)
				// 入伏=初伏第一天 @ 小暑(7)
				// 中伏第一天 @ 小暑(7)~大暑(8)
				// 末伏第一天 @ 立秋(9)
				// 出伏

				if (9 <= solar_term[1]
				//
				&& (干支輪序 = 節氣後第幾輪干支(date, JD, 9, '庚'))) {
					if (干支輪序[0] === 0) {
						return '末伏';
					}
					if (干支輪序[0] === 1 && 干支輪序[1] === 0) {
						// 出伏，即伏天結束。
						return '出伏';
					}
					if (!(干支輪序[0] < 0)) {
						return;
					}
				}
				// 夏至(6)
				干支輪序 = 節氣後第幾輪干支(date, JD, 6, '庚');
				if (!干支輪序 || !(2 <= 干支輪序[0])) {
					return;
				}
				if (干支輪序[0] === 2) {
					return 干支輪序[1] === 0 ? '入伏' : '初伏';
				}
				// 中伏可能為10天或20天。
				return '中伏';
			}

			if (solar_term[1] === 19 || solar_term[1] === 20) {
				// 臘日: solar_term[1] @ 小寒(19) or 大寒(20)
				// 冬至(18)後第三個戌日爲臘日
				干支輪序 = 節氣後第幾輪干支(date, JD, 18, '戌');
				// return 干支輪序 && 干支輪序.join(', ')
				if (干支輪序 && 干支輪序[0] === 2 && 干支輪序[1] === 0) {
					return {
						T : '臘日',
						R : '《說文‧肉部》：「臘，冬至後三戌臘祭百神。」非起源自佛教之臘八節！'
					};
				}
			}

			if (date.國家 === '中國' && date.月 === 12 && date.日 === 8) {
				return {
					T : '臘八節',
					R : '起源自佛教之臘八節'
				};
			}
		} ],

		反支 : [ {
			a : {
				T : '反支'
			},
			R : '中曆曆注。反枳（反支）依睡虎地《日書》（12日一反支）和孔家坡《日書》（6日一反支，獨屬孔家坡者以淡色標示。）'
			//
			+ '\n警告：僅適用於中曆、日本之旧暦與紀年！對其他紀年，此處之值可能是錯誤的！',
			href : 'http://www.bsm.org.cn/show_article.php?id=867',
			S : 'font-size:.8em;'
		}, function(date) {
			return /* !date.準 && */!date.精 && CeL.era.反支(date, {
				span : '反支',
				S : 'color:#888;'
			});
		} ],

		血忌 : [ {
			a : {
				T : '血忌'
			},
			R : '中曆曆注。血忌在唐宋曆書中仍為典型歷注項目，後世因之，直至清末，其推求之法及吉凶宜忌都無改變。血忌被歸入神煞體系。',
			href : 'http://shc2000.sjtu.edu.cn/030901/lishu.htm',
			S : 'font-size:.8em;'
		}, function(date) {
			return /* !date.準 && */!date.精 && CeL.era.血忌(date);
		} ],

		孟仲季 : [ {
			a : {
				// 十二月律
				T : '孟仲季月'
			},
			R : '孟仲季之月名別稱, 孟仲季+春夏秋冬',
			href : 'https://zh.wikipedia.org/wiki/十二律#音律與曆法的配合',
			S : 'font-size:.8em;'
		}, function(date) {
			var 孟仲季 = /* !date.準 && */!date.精 && CeL.era.孟仲季(date);
			if (孟仲季) {
				return CeL.era.季(date, {
					icon : true
				}) + 孟仲季;
			}
		} ],

		月律 : [ {
			a : {
				T : '十二月律'
			},
			R : '十二月律',
			href : 'https://zh.wikipedia.org/wiki/十二律',
			S : 'font-size:.8em;'
		}, function(date) {
			return /* !date.準 && */!date.精 && CeL.era.月律(date);
		} ],

		月の別名 : [ {
			a : {
				T : '月の別名'
			},
			R : '各月の別名',
			href : 'https://ja.wikipedia.org/wiki/日本の暦'
			// #各月の別名
			+ '#.E5.90.84.E6.9C.88.E3.81.AE.E5.88.A5.E5.90.8D',
			S : 'font-size:.8em;'
		}, function(date) {
			return /* !date.準 && */!date.精 && CeL.era.月の別名(date);
		} ],

		六曜 : [ {
			a : {
				T : '六曜'
			},
			R : '日本の暦注の一つ。\n警告：僅適用於日本之旧暦與紀年！對其他國家之紀年，此處之六曜值可能是錯誤的！'
			//
			+ '\n六輝（ろっき）や宿曜（すくよう）ともいうが、これは七曜との混同を避けるために、明治以後に作られた名称である。',
			href : 'https://ja.wikipedia.org/wiki/六曜',
			S : 'font-size:.8em;'
		}, function(date) {
			return /* !date.準 && */!date.精 && CeL.era.六曜(date);
		} ],

		七曜 : [ {
			a : {
				T : '七曜'
			},
			R : '中曆曆注、日本の暦注の一つ。',
			href : 'https://ja.wikipedia.org/wiki/曜日',
			S : 'font-size:.8em;'
		}, function(date) {
			return /* !date.準 && */!date.精 && CeL.era.七曜(date);
		} ],

		// 暦注上段
		曜日 : [ {
			a : {
				T : '曜日'
			},
			R : '日本の暦注の一つ, Japanese names of week day',
			href : 'https://ja.wikipedia.org/wiki/曜日'
		}, function(date) {
			var 七曜 = /* !date.準 && */!date.精 && CeL.era.七曜(date);
			return 七曜 && {
				span : 七曜 + '曜日',
				S : 七曜 === '日' ? 'color:#f34'
				//
				: 七曜 === '土' ? 'color:#2b3' : ''
			};
		} ],

		年禽 : [ {
			a : {
				T : '年禽'
			},
			R : '中曆曆注。二十八宿年禽。見演禽訣。',
			href : 'http://blog.sina.com.cn/s/blog_4aacc33b0100b8eh.html'
		}, function(date) {
			return /* !date.準 && */!date.精 && CeL.era.二十八宿(date, '年');
		} ],

		月禽 : [ {
			a : {
				T : '月禽'
			},
			R : '中曆曆注。二十八宿年禽。見演禽訣。',
			href : 'http://blog.sina.com.cn/s/blog_4aacc33b0100b8eh.html'
		}, function(date) {
			return /* !date.準 && */!date.精 && CeL.era.二十八宿(date, '月');
		} ],

		/**
		 * 廿八宿禽 日禽
		 * 
		 * @see <a
		 *      href="https://ja.wikipedia.org/wiki/%E6%9A%A6%E6%B3%A8%E4%B8%8B%E6%AE%B5"
		 *      accessdate="2015/3/7 13:52">暦注下段</a>
		 *      https://zh.wikisource.org/wiki/演禽通纂_(四庫全書本)/全覽
		 */
		二十八宿 : [ {
			a : {
				T : '二十八宿'
			},
			R : '中曆曆注、日本の暦注の一つ。又稱二十八舍、二十八星、禽星或日禽。見演禽訣。'
			//
			+ '28 Mansions, 28 asterisms.',
			href : 'https://zh.wikipedia.org/wiki/二十八宿',
			S : 'font-size:.8em;'
		}, function(date) {
			return /* !date.準 && */!date.精 && CeL.era.二十八宿(date);
		} ],

		// 27宿
		二十七宿 : [ {
			a : {
				T : '二十七宿'
			},
			R : '日本の暦注の一つ\n警告：僅適用於日本之旧暦與紀年！對其他國家之紀年，此處之值可能是錯誤的！'
			//
			+ '27 Mansions, 27 asterisms.',
			href : 'https://ja.wikipedia.org/wiki/二十七宿',
			S : 'font-size:.8em;'
		}, function(date) {
			return /* !date.準 && */!date.精 && CeL.era.二十七宿(date);
		} ],

		日家九星 : [ {
			a : {
				T : '日家九星'
			},
			R : '日本の暦注の一つ。此處採日本算法配合天文節氣。',
			href : 'http://koyomi8.com/sub/9sei.htm'
		}, function(date) {
			if (/* date.準 || */date.精)
				return;

			var 九星 = CeL.era.日家九星(date),
			//
			S = 九星.days === 0 ? '#faa' : 九星.閏 ? '#afa'
			//
			: 九星.type === '陰遁' ? '#efa' : '';

			九星 = 九星.九星 + ' ' + 九星.days
			// ↘:陰遁, ↗:陽遁
			+ (九星.type === '陰遁' ? '↘' : '↗');

			return S ? {
				span : 九星,
				S : 'background-color:' + S
			} : 九星;
		} ],

		// http://ctext.org/wiki.pl?if=en&chapter=457831
		// 欽定協紀辨方書·卷八 三元九星
		// https://archive.org/details/06056509.cn
		月九星 : [ {
			a : {
				T : '月九星'
			},
			R : '三元月九星，每年以立春交節時刻為界，每月以十二節交節時刻為界。此處算法配合天文節氣。',
			href : 'https://archive.org/details/06056509.cn'
		}, function(date) {
			// 入中宫
			return CeL.era.月九星(date);
		} ],

		年九星 : [ {
			a : {
				T : '年九星'
			},
			R : '三元年九星，每年以立春交節時刻為界。此處算法配合天文節氣。年月之五代紫白飛星尚無固定規則，至宋方有定制。',
			href : 'https://archive.org/details/06056509.cn'
		}, function(date) {
			// 入中宫
			return CeL.era.年九星(date);
		} ],

		三元九運 : [ {
			a : {
				T : '三元九運'
			},
			R : '二十年一運，每年以立春交節時刻為界，立春後才改「運」。玄空飛星一派風水三元九運，又名「洛書運」。',
			// http://www.hokming.com/fengshui-edit-threeyuennineyun.htm
			href : 'http://www.twwiki.com/wiki/三元九運',
			S : 'font-size:.8em;'
		}, function(date) {
			return CeL.era.三元九運(date);
		} ],

		// e.g., 毛耀顺主编《中华五千年长历》 "干木支火"
		年五行 : [ {
			a : {
				T : '年五行'
			},
			R : '陰陽五行紀年',
			href : 'https://zh.wikipedia.org/wiki/五行'
			// #五行與干支表
			+ '#.E4.BA.94.E8.A1.8C.E4.B8.8E.E5.B9.B2.E6.94.AF.E8.A1.A8'
		}, function(date) {
			return [ '干', {
				T : CeL.era.五行(date),
				S : 'color:#2a6;'
			}, '支', {
				T : CeL.era.五行(date, true),
				S : 'color:#2a6;'
			} ];
		} ],

		astrological : [ {
			a : {
				T : 'zodiac sign'
			},
			R : 'Astrological signs, Western zodiac signs',
			href : 'https://en.wikipedia.org/wiki/'
			//
			+ 'Astrological_sign#Western_zodiac_signs',
			S : 'font-size:.8em;'
		}, function(date) {
			if (/* date.準 || */date.精)
				return;

			var JD = CeL.Date_to_JD(date.offseted_value());

			// +1: 只要當天達到此角度，即算做此宮。
			var index = CeL.solar_coordinates(JD + 1).apparent / 30 | 0;
			return [ ZODIAC_SYMBOLS[index], CeL.DOM.NBSP, {
				T : ZODIAC_SIGNS[index]
			} ];
		} ],

		// --------------------------------------------------------------------
		// 紀年法/紀年方法。 Cyclic year, year recording/representation method
		'Year naming' : '區別與紀錄年份的方法，例如循環紀年。',

		歲次 : [ {
			a : {
				T : '歲次'
			},
			R : '年干支/干支紀年'
			//
			+ '\n警告：僅適用於中曆、日本之旧暦與紀年！對其他紀年，此處之值可能是錯誤的！',
			href : 'https://zh.wikipedia.org/wiki/干支'
		}, function(date) {
			return date.歲次;
		} ],

		生肖 : [ {
			a : {
				T : '生肖'
			},
			R : '十二生肖紀年，屬相',
			href : 'https://zh.wikipedia.org/wiki/生肖'
		}, function(date) {
			return CeL.era.生肖(date, true) + CeL.era.生肖(date);
		} ],

		繞迥 : [ {
			a : {
				T : '繞迥'
			},
			R : '藏曆(時輪曆)紀年法，繞迥（藏文：རབ་བྱུང༌།，藏語拼音：rabqung，威利：rab-byung）\n'
			//
			+ '又稱勝生周。第一繞迥自公元1027年開始。\n此處採公曆改年而非藏曆，可能有最多前後一年的誤差。',
			href : 'https://zh.wikipedia.org/wiki/绕迥'
		}, function(date) {
			return CeL.era.繞迥(date);
		} ],

		// --------------------------------------------------------------------
		// 編年法/編年方法。
		'Year numbering' : '以不重複數字計算年份的方法',

		Minguo : [ {
			a : {
				T : '民國'
			},
			R : '民國紀年',
			href : 'https://zh.wikipedia.org/wiki/民國紀年'
		}, Year_numbering(-1911) ],

		Dangi : [ {
			a : {
				T : '단군기원'
			},
			R : '단군기원(檀君紀元) 또는 단기(檀紀)',
			href : 'https://ko.wikipedia.org/wiki/단군기원'
		}, Year_numbering(2333) ],

		// TODO: 黃帝紀元應以農曆為主!
		// 1912年1月1日，中華民國臨時政府成立，臨時大總統孫中山當日就通電：「中華民國改用陽曆，以黃帝紀元四千六百零九年十一月十三日為中華民國元年元旦。」
		Huangdi : [
				{
					a : {
						T : '黃帝紀元'
					},
					R : '依據中華民國建國時官方認定的黃帝紀元，清末辛亥年（孔子紀元2462年，西元1911年）為黃帝紀元4609年，民國元年為黃帝紀元4610年。黃帝紀元比孔子紀元早2147年，比西元早2698年。',
					href : 'https://zh.wikipedia.org/wiki/黄帝纪元',
					S : 'font-size:.8em;'
				}, Year_numbering(2698) ],

		Koki : [
				{
					a : {
						T : '皇紀'
					},
					R : '神武天皇即位紀元（じんむてんのうそくいきげん）。略称は皇紀（こうき）という。外にも、皇暦（すめらこよみ、こうれき）、神武暦（じんむれき）、神武紀元（じんむきげん）、日紀（にっき）などともいう。\n神武天皇即位紀元の元年は、キリスト紀元（西暦）前660年である。日本では明治6年（1873年）を紀元2533年と定め公式に使用した。',
					href : 'https://ja.wikipedia.org/wiki/神武天皇即位紀元'
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

		Thai_Buddhist : [ {
			a : {
				T : '泰國佛曆'
			},
			R : '以佛曆紀年(佛滅紀元)之泰國曆',
			href : 'https://th.wikipedia.org/wiki/ปฏิทินไทย'
		}, function(date) {
			if (date.精 || date.準) {
				var year = date.getFullYear() + 543;
				return 'พ.ศ. ' + (year - 1) + '–' + year;
			}
			var numeral = CeL.Date_to_Thai(date, {
				format : 'serial'
			}), 生肖 = numeral.生肖 ? ' ' + numeral.生肖 + '年' : '';
			return numeral.準 ? {
				T : 'พ.ศ. ' + numeral[0] + 生肖,
				S : 'color:#888'
			} : {
				T : numeral.join('/') + '; ' + CeL.Date_to_Thai(date) + 生肖
				//
				+ (numeral.holidays ? '; ' + numeral.holidays.join(', ') : ''),
				S : 'color:#000;background-color:'
				//
				+ CeL.Date_to_Thai.weekday_bgcolor[date.getDay()]
			};

			// @deprecated
			var numeral = THAI_Year_numbering(date), tmp = numeral.split('/');
			if (!date.精 && !date.準 && tmp.length === 3)
				numeral = CeL.Date_to_Thai(tmp[2], tmp[1], tmp[0], {
					weekday : date.getDay()
				});
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
				T : 'Seleucid era'
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

		HE : [ {
			a : {
				T : 'Holocene calendar'
			},
			R : 'Holocene calendar, 全新世紀年或人類紀年。'
			//
			+ '在公曆年數上多加 10000。有採用0年。 1 BCE = 10000 HE',
			href : 'https://en.wikipedia.org/wiki/Holocene_calendar'
		}, Year_numbering(10000) ]

	};

	calendar_columns = Object.create(null);
	calendar_column_alias = Object.create(null);
	o = null;
	for (i in list) {
		if (Array.isArray(list[i])
		//
		&& typeof list[i][1] === 'function')
			calendar_columns[calendar_column_alias[i] = o ? o + '/' + i : i] = list[i];
		else
			calendar_columns[o = i] = Array.isArray(list[i]) ? list[i]
					: [ list[i] ];
		if (i === '資料圖層') {
			// 先行佔位
			for (i in add_tag.data_file)
				calendar_columns[calendar_column_alias[i] = '資料圖層/' + i] = null;
		}
	}

	v = 'Gregorian reform';
	calendar_columns[v] = [
			'各地啓用公曆之日期對照',
			'各地啓用公曆(格里曆)之日期不同。 See <a href="https://en.wikipedia.org/wiki/Adoption_of_the_Gregorian_calendar" accessdate="2017/7/24 14:40" title="Adoption of the Gregorian calendar">adoption of the Gregorian Calendar</a>.' ];
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
		calendar_columns[calendar_column_alias[i] = v + '/' + i] = [ {
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

	CeL.add_listener('unload', function() {
		column_by_cookie(true);
	});

	column_by_cookie();

	// -----------------------------
	// configuration

	function change_coordinates(coordinates) {
		var name;
		if (typeof coordinates === 'string') {
			if (coordinates.includes(':')) {
				coordinates = coordinates.split(/:/);
				name = coordinates[0];
				coordinates = coordinates[1];
				document.getElementById('coordinates').value = coordinates;
			}
		} else
			coordinates = this.value;
		// [ latitude, longitude ]
		coordinates = CeL.parse_coordinates(coordinates);
		if (coordinates && typeof coordinates[0] === 'number'
				&& typeof coordinates[1] === 'number') {
			// 自動判別時區。
			coordinates[2] = Math.round(coordinates[1] / 360 * 24);
			if (name) {
				coordinates.place = name;
				document.getElementById('place_name').value = name;
			}
			document.getElementById('latitude').value = coordinates[0];
			document.getElementById('longitude').value = coordinates[1];
			document.getElementById('time_zone').value = coordinates[2];
			CeL.log('設定地理座標（經緯度）：' + (name ? name + '，' : '')
					+ coordinates.slice(0, 2).map(function(c) {
						return c.to_fixed(4);
					}).join(', ') + '，時區：UTC' + (coordinates[2] < 0 ? '' : '+')
					+ coordinates[2]);
			local_coordinates = coordinates;
		}
		return false;
	}
	document.getElementById('coordinates').onchange = change_coordinates;
	document.getElementById('time_zone').onchange = function() {
		local_coordinates[2] = this.value;
	};

	// 首都、國都或京（京師／城／都）
	// https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%9B%BD%E9%A6%96%E9%83%BD
	var place_nodes = [ '🗺️', {
		// 常用地點
		T : '著名地點：'
	} ], place_list = {
		中國 : {
			北京市 : '39°54′57″N 116°23′26″E',
			// 長安
			西安市 : '34°16′N 108°54′E',
			洛陽 : '34°37′53.45″N 112°27′16.85″E',
			南京市 : '32°02′38″N 118°46′43″E',
			殷墟 : '36°07′17″N 114°19′01″E'
		},
		日本 : {
			// 旧東京天文台1 (東京都港区麻布台。世界測地系で東経 139°44′28.8869″、北緯 35°39′29.1572″)
			// http://eco.mtk.nao.ac.jp/koyomi/yoko/
			東京都 : '35° 41′ 22.4″ N, 139° 41′ 30.2″ E',
			京都市 : '35° 0′ 41.8″ N, 135° 46′ 5.2″ E'
		},
		한국 : {
			// 首爾
			서울 : '37° 34′ 0″ N, 126° 58′ 41″ E'
		},
		'Việt Nam' : {
			// 河內市
			'Hà Nội' : '21°01′42.5″N 105°51′15.0″E'
		},
		others : {
			臺北市 : '25°2′N 121°38′E'
		}
	};
	for ( var country in place_list) {
		var country_places = place_list[country];
		place_nodes.push({
			br : null
		}, {
			T : country,
			C : 'country'
		}, ': ');
		for ( var place in country_places) {
			i = place + ':' + country_places[place];
			place_nodes.push({
				a : {
					T : place
				},
				href : '#',
				title : i,
				onclick : function() {
					return change_coordinates(this.title);
				}
			}, ' ');
		}
	}
	change_coordinates(i);
	CeL.new_node(place_nodes, 'place_list');

	// -----------------------------

	CeL.get_element('公元年_中曆月日').onkeypress = function(e) {
		if (!e)
			e = window.event;
		// press <kbd>Enter</kbd>
		if (13 === (e.keyCode || e.which || e.charCode)) {
			var date = CeL.set_text('公元年_中曆月日'), 公元日期 = CeL.era.中曆(date);
			if (公元日期) {
				CeL.set_text('中曆月日轉公元日期', 公元日期.format({
					parser : 'CE',
					format : '%Y/%m/%d'
				}));
				CeL.get_element('中曆月日轉公元日期').select();
				CeL.set_text('中曆月日轉紀年日期', 公元日期.era);
				CeL.get_element('中曆月日轉紀年日期').title = 公元日期.era;
				return false;
			} else if (date) {
				CeL.warn('Can not convert: [' + date + ']!');
			}
		}
	};

	CeL.get_element('中曆月日轉紀年日期').onclick = click_title_as_era;

	// -----------------------------

	var batch_prefix_span = new CeL.select_input(0, Object
			.keys(auto_add_column));
	batch_prefix_span.attach('batch_prefix');
	batch_prefix_span.setSearch('includeKeyWC');

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
