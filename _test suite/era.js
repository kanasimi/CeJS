'use strict';

/**
 * 
 * @note <code>

 var g=CeL.SVG.createNode('g'),
 l=CeL.SVG.createNode('line',{
 x1 : 0,
 y1 : 0,
 x2 : 10,
 y2 : 30,
 stroke : '#a76',
 'stroke-width' : 1
 });
 g.appendChild(l);
 SVG_object.svg.appendChild(g);

 g.style.setProperty('display','none');
 g.style.setProperty('display','');

 //http://www.w3.org/TR/SVG11/coords.html#TransformAttribute
 g.setAttribute('transform','translate(20,30)');


 </code>
 */

// define gettext() user domain resource location.
// gettext() will auto load (CeL.env.domain_location + language + '.js').
// e.g., resource/cmn-Hant-TW.js, resource/ja-JP.js
CeL.env.domain_location = 'resource/';
// declaration for gettext()
var _;

// google.load('visualization', '1', {packages: ['corechart']});
function initializer() {
	var queue = [
			[ 'interact.DOM', 'application.debug.log', 'data.date.era',
					'interact.form.select_input', 'interact.integrate.SVG' ],
			function() {
				// alias for CeL.gettext, then we can use _('message').
				_ = CeL.gettext;

				CeL.Log.set_board('panel_for_log');
				// CeL.set_debug();

				// Set a callback to run when the Google Visualization API is
				// loaded.
				// google.setOnLoadCallback(affairs);

			}, affairs ];

	if (location.protocol === 'file:')
		// 當 include 程式碼，執行時不 catch error 以作防範。
		CeL.env.no_catch = true;
	else
		queue.push('http://apis.google.com/js/plusone.js');

	CeL.run(queue);
}

// ---------------------------------------------------------------------//

// 文字式年曆。
function show_calendar(era_name) {
	var era_caption, title = [
			{
				th : {
					T : '朝代紀年日期'
				}
			},
			{
				th : [ {
					T : '公元'
				}, '(', {
					T : '星期'
				}, ')' ]
			// , R : '0: 周日/星期日/禮拜天, 1: 周一, 餘類推'
			},
			{
				th : {
					T : '歲次'
				}
			},
			{
				th : {
					span : {
						T : '月干支'
					},
					S : 'font-size:.7em;'
				},
				R : '月干支/大小月'
			},
			{
				th : era_name.indexOf('月') === -1 ? {
					T : '朔日'
				} : {
					span : {
						T : '日干支'
					},
					S : 'font-size:.7em;'
				}
			},
			{
				th : {
					a : 'JDN',
					R : _('Julian Day Number')
							+ '\n以 UTC 相同日期當天正午為準。\n因此 2000/1/1 轉為 2451545。',
					href : 'http://en.wikipedia.org/wiki/Julian_day'
				}
			},
			{
				th : {
					a : {
						T : '伊斯蘭曆'
					},
					R : 'Tabular Islamic calendar',
					href : 'http://en.wikipedia.org/wiki/Tabular_Islamic_calendar',
					S : 'font-size:.8em;'
				}
			}, {
				th : {
					T : '共存紀年'
				},
				title : '本日/本年共存紀年。對未有詳實資料者，僅約略準確至所列日期！'
			} ], output = [ {
		tr : title
	} ], 前年名, 前月名, 前紀年名, 後紀年名,
	//
	main_date_value = CeL.era(era_name),
	//
	dates = CeL.era.dates(era_name, {
		含參照用 : /明治|大正|昭和|明仁/.test(era_name)
	}), is_年譜;

	if (!dates)
		return;

	if (dates.length > show_calendar.LIMIT) {
		CeL.warn('show_calendar: 輸出年段/時段紀錄過長（' + dates.length
				+ ' 筆），已超過輸出總筆數限制！將截取前 ' + show_calendar.LIMIT + ' 筆。');
		dates.length = show_calendar.LIMIT;
	}

	if (main_date_value)
		if (main_date_value.日 == 1 && era_name.indexOf('日') === -1)
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
			era_caption = era_name.indexOf(date.紀年名) !== -1 ? date.紀年名
			//
			: /[\/年]/.test(era_name) ? date.紀年 : era_name;

		var tmp, matched, list = [];
		if (date.共存紀年) {
			date.共存紀年.forEach(function(era, index) {
				if (output_numeral === 'Chinese')
					era = CeL.to_Chinese_numeral(era);
				list.push('[' + (index + 1) + ']', {
					a : era,
					title : era,
					href : '#',
					onclick : click_title_as_era,
					C : '共存紀年'
				});
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
					format : tmp ? '%紀年名%年年|%Y年|%年干支|||'
					//
					: '%紀年名%年年%月月%日日|%Y/%m/%d('
							+ (_.is_domain_name('ja') ? '%曜日' : '%w')
							+ ')|%年干支|%月干支%大小月|%日干支|%JDN',
					locale : 'cmn-Hant-TW',
					as_UTC_time : true
				}).replace(/星期/, '').split('|');

		if (matched = tmp[0]
		// 後處理。
		// 月名: 正/臘/閏12/後12
		.match(/^(.*[^\d]\d+年)(.{1,3}月)(\d+日)$/))
			tmp[0] = [ matched[1] === 前年名 ? 前年名 : {
				a : 前年名 = matched[1],
				title : matched[1],
				href : '#',
				C : 'to_select',
				onclick : click_title_as_era
			}, matched[2] === 前月名 ? 前月名 : {
				a : 前月名 = matched[2],
				title : matched[1] + matched[2],
				href : '#',
				C : 'to_select',
				onclick : click_title_as_era
			}, matched[3] ];

		tmp.forEach(function(data, index) {
			list.push({
				td : data
			});
		});

		list.push({
			td : date.精 === '年' ? date.to_Tabular()[0] + '年' : date
					.to_Tabular().slice(0, 3).join('/')
		}, {
			td : date.共存紀年 || ''
		});

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
		C : 'to_select',
		onclick : click_title_as_era
	}, {
		T : is_年譜 ? '年譜' : '曆譜'
	}, '（共有 ' + dates.length + ' 個' + (dates.type ? '時' : '年') + '段紀錄）' ]
			: '無可供列出之曆譜！';

	CeL.remove_all_child('calendar');
	CeL.new_node({
		table : [ {
			caption : era_caption
		}, {
			tbody : output
		} ]
	}, 'calendar');
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

	calendar = calendar.indexOf('|') === -1
	// 當作紀年名
	? CeL.era(calendar, {
		get_era : true
	})
	// 當作曆數資料
	: CeL.era.set(calendar, {
		extract_only : true
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

var era_name_classifier, MIN_FONT_SIZE = 10;

function draw_title_era() {
	var hierarchy = this.title;
	if (hierarchy)
		hierarchy = hierarchy.split(era_name_classifier);
	draw_era(hierarchy);
	return false;
}

function set_SVG_text_properties(recover) {
	var parent, style, def_style,
	//
	def = document.getElementById(String(this.getAttribute('xlink:href'))
			.replace(/^#/, ''));

	if (def) {
		// bring to top
		// http://raphaeljs.com/reference.html#Element.toFront
		// this.parentNode.appendChild(this);

		style = this.style;
		def_style = def.style;
		recover = typeof recover === 'boolean' && recover;

		if (!recover) {
			def.base_font_size = def_style['font-size'];
			def.base_color = def_style.color;
		}

		style['font-size'] = def_style['font-size']
		//
		= recover ? def.base_font_size : (3 * MIN_FONT_SIZE) + 'px';

		def_style.color = style.color = recover ? def.base_color : '#f00';
	}
}

// Firefox/30.0 尚未支援 writing-mode。IE, Chrome 支援。
// https://bugzilla.mozilla.org/show_bug.cgi?id=145503
// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/writing-mode
var support_vertical_text = !/Firefox/i.test(navigator.userAgent);

function recover_SVG_text_properties() {
	set_SVG_text_properties.call(this, true);
}

// TODO
// area width, height.
// return [top, left, width, height]
function get_area(width, height, periods) {
	;
}

/**
 * 畫個簡單的時間軸線圖。<br />
 * TODO: 加上年代。
 * 
 * @param {Array}hierarchy
 *            指定之紀年層次。
 * @returns
 */
function draw_era(hierarchy) {

	// 清理場地。
	SVG_object.clean();

	var periods = CeL.era.periods(hierarchy),
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

		var start_time = periods.start,
		// draw era width / (時間跨度 time span)。
		ratio = draw_era.width / (periods.end - start_time),
		// 前一個尺規刻度。
		previous_ruler_scale = -Infinity,
		// 取得 period 之起始 x 座標。
		get_from_x = function(period) {
			return draw_era.left
			//
			+ (period ? (period.start - start_time) * ratio : draw_era.width);
		}, short_period = [];

		periods.forEach(function(region) {
			var layer_count = region.length, layer_from_y = draw_era.top,
			//
			layer_height = draw_era.height / layer_count;

			region.forEach(function(period_list) {

				period_list.forEach(function(period, index) {
					var style, unobvious,
					//
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
					from_x = get_from_x(period),
					//
					width = (period.end - period.start) * ratio,
					// 對紀年時間過短，太窄時，線圖之處理：採垂直排列。
					vertical_text = support_vertical_text
							&& width < layer_height,
					//
					font_size = vertical_text
					//
					? Math.min(width * .8, layer_height / name.length)
					//
					: Math.min(layer_height * .8, width / name.length);

					if (font_size < MIN_FONT_SIZE) {
						font_size = MIN_FONT_SIZE;
						// 難辨識、不清楚、不顯著、隱晦不明顯時段。
						unobvious = true;
						var duration = [ '(',
						//
						period_start.format(date_options), ];
						if (!isNaN(period.end))
							duration.push('－', (new Date(period.end - 0))
									.format(date_options));
						duration.push(') ');
						short_period.push({
							a : name,
							href : '#',
							title : period_hierarchy + name,
							onclick : is_Era ? click_title_as_era
									: draw_title_era
						}, {
							span : duration,
							C : 'duration'
						});
					}

					if (!(name in draw_era.date_cache) && !isNaN(period.end)) {
						var end_time = new Date(period.end - 0);
						// 警告: .setDate(-1) 此為權宜之計。
						end_time.setDate(end_time.getDate() - 1);
						draw_era.date_cache[name] = {
							start : period_start.format(date_options),
							end : end_time.format(date_options)
						};
					}

					SVG_object.addRect(width, layer_height, from_x,
							layer_from_y, null, 1, 存疑資料 ? '#ddd' : unobvious ?
							// 此處需要與 #era_graph_unobvious 之
							// background-color 一致。
							'#ffa' : '#ddf');

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
										+ SVG_object.addText.defaultCharWidthPx
										* 2, {
									color : '#f42'
								});

					style = {
						color : 存疑資料 ? '#444' : layer_count === 1 ? '#15a'
								: '#a2e',
						cursor : 'pointer',
						// 清晰的小字體
						'font-family' : '標楷體,DFKai-SB',
						'font-size' : font_size + 'px'
					};
					if (vertical_text) {
						// top to bottom
						style['writing-mode'] = 'tb';
						// no rotation
						style['glyph-orientation-vertical'] = 0;

						// 置中: x軸設在中線。
						SVG_object.addText(name, from_x + width / 2,
								layer_from_y
										+ (layer_height - name.length
												* font_size) / 2, style);
					} else
						// 置中
						SVG_object.addText(name, from_x
								+ (width - name.length * font_size) / 2,
						// .7:
						// 經驗法則，don't know why.
						layer_from_y + (layer_height + font_size * .7) / 2,
								style);

					if (font_size === MIN_FONT_SIZE) {
						SVG_object.lastAdd.onmouseover
						//
						= set_SVG_text_properties;
						SVG_object.lastAdd.onmouseout
						//
						= recover_SVG_text_properties;
					}

					// TODO: SVG <title> tag
					if (!SVG_object.lastAdd.dataset)
						// 目前僅 Chrome 支援。
						SVG_object.lastAdd.dataset = CeL.null_Object();
					SVG_object.lastAdd.dataset.hierarchy
					//
					= period_hierarchy + name;
					SVG_object.lastAdd.onclick
					//
					= is_Era ? draw_era.click_Era : draw_era.click_Period;
				});

				layer_from_y += layer_height;
			});
		});

		draw_era.last_hierarchy = hierarchy;

		if (short_period.length) {
			short_period.unshift({
				// 過短紀年
				T : '難辨識時段：'
			});
			CeL.remove_all_child('era_graph_unobvious');
			CeL.new_node(short_period, 'era_graph_unobvious');
		}
	}

	draw_era.draw_navigation(hierarchy);
}

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
		onclick : draw_title_era
	} ];

	if (Array.isArray(hierarchy))
		hierarchy.forEach(function(name, index) {
			period_hierarchy += (period_hierarchy ? era_name_classifier : '')
					+ name;
			navigation_list.push(' » ', last_is_Era
					&& index === hierarchy.length - 1 ? {
				span : name,
				title : period_hierarchy
			} : {
				a : name,
				href : '#',
				title : period_hierarchy,
				onclick : draw_title_era
			});
			if (name in draw_era.date_cache) {
				name = draw_era.date_cache[name];
				navigation_list.push(' (', {
					a : name.start,
					href : '#',
					title : name.start,
					onclick : draw_era.click_navigation_date
				}, '－', {
					a : name.end,
					href : '#',
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
	example : '測試範例',
	// 之前輸入資料
	input_history : '輸入紀錄',

	// concept:'工具說明',
	// 使用技巧
	FAQ : '使用說明',

	era_graph : '紀年線圖',
	// 年表
	calendar : '曆譜',
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
	'公元日期' : '公元%Y年%m月%d日',
	'朝代紀年日期' : '%紀年名%年年%月月%日日',
	'共存紀年' : '共存紀年',
	'年月日干支' : '%年干支年%月干支月%日干支日',
	'年月日時干支' : '%年干支年%月干支月%日干支日%時干支時',
	'四柱八字' : '%年干支%月干支%日干支%時干支',
	// 'Julian Day' : 'JD%JD',
	'Julian Day Number' : 'JDN%JDN'
};

function input_era(key) {
	CeL.log(key + ',' + list + ',' + force);
	original_input.apply(this, arguments);
}

var 準_MSG = {
	疑 : '尚存疑',
	傳說 : '為傳說時代之資料'
};

function translate_era(era) {
	if (!era)
		era = era_input_object.setValue();
	var output, date = CeL.era(era, {
		// 尋精準 : 4,
		numeral : output_numeral
	});
	if (date) {
		if (date.紀年名)
			// 因為紀年可能橫跨不同時代(朝代)，因此只要確定找得到，那就以原先的名稱為主。
			show_calendar(era);

		var format = output_format_object.setValue();
		if (!format)
			format = output_format_object.setValue(
			//
			'公元%Y年' + (date.精 === '年' ? '' : '%m月%d日'));

		if (format === '共存紀年')
			if (Array.isArray(output = date.共存紀年))
				output.forEach(function(era, index) {
					output[index] = [
							' [' + (index + 1) + '] ',
							{
								a : output_numeral === 'Chinese' ? CeL
										.to_Chinese_numeral(era) : era,
								title : era,
								href : '#',
								onclick : click_title_as_era,
								C : '共存紀年'
							} ];
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
					title : output,
					href : '#',
					onclick : click_title_as_era
				};

			if (date.曆法)
				output = [ output, {
					br : null
				}, '採用曆法: ', date.曆法 ];

			if (date.據) {
				if (!Array.isArray(output))
					output = [ output ];
				output.push({
					br : null
				}, '出典：', {
					span : date.據,
					C : 'note'
				});
			}

			if (date.注) {
				if (!Array.isArray(output))
					output = [ output ];
				date.注.forEach(function(note, index) {
					output.push({
						br : null
					}, '注 ' + (index + 1) + '：', {
						span : note,
						C : 'note'
					});
				});
			}

			if (date.準 || date.精) {
				if (!Array.isArray(output))
					output = [ output ];
				output
						.unshift({
							em : [
									'此輸出值',
									準_MSG[date.準]
											|| '僅約略準確至'
											+ (date.準 || date.精)
											+ (/^\d+[年月日]$/.test(date.準
													|| date.精) ? '前後' : ''),
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

var SVG_min_width = 600, SVG_min_height = 500, SVG_padding = 30;
function affairs() {
	CeL.log({
		T : 'Initializing..'
	}, true);

	_.create_menu('language', [ 'TW', 'ja', 'en' ]);

	// translate all nodes to show in default domain.
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
	[ '共存紀年:546/3/1', '共存紀年:1546-3-1', '年月日時干支:一八八〇年四月二十一日七時',
			'年月日時干支:一八八〇年庚辰月庚辰日7時', '公元日期:一八八〇年庚辰月庚辰日庚辰時', '初始元年11月1日',
			'明思宗崇禎1年1月26日', '公元日期:天聰二年甲寅月戊子日', '公元日期:天聰2年寅月戊子日',
			'清德宗光緒六年三月十三日', '清德宗光緒庚辰年三月十三日', '清德宗光緒庚辰年庚辰月庚辰日',
			'清德宗光緒六年三月十三日辰正一刻', '魏少帝嘉平4年5月1日', '魏少帝嘉平4年閏5月1日', '魏少帝嘉平4年閏月1日',
			'景元元年', '景元元年7月', '元文宗天曆2年8月8日', '元文宗天曆3/1/2', '共存紀年:JD2032189' ]
			.forEach(function(era) {
				list.push({
					div : {
						a : era,
						title : era,
						href : '#',
						onclick : click_title_as_era
					}
				});
			});
	CeL.new_node(list, 'example');

	// -----------------------------

	SVG_object = CeL.get_element('era_graph_SVG');
	// 紀年線圖按滑鼠右鍵可回上一層。
	SVG_object.onclick =
	// Chrome use this.
	SVG_object.onmousedown = function(e) {
		if (!e)
			e = window.event;
		// http://stackoverflow.com/questions/2405771/is-right-click-a-javascript-event
		if (
		// Gecko (Firefox), WebKit (Safari/Chrome) & Opera
		'which' in e ? e.which === 3
		// IE, Opera
		: 'button' in e && e.button === 2) {
			var hierarchy = draw_era.last_hierarchy;
			if (Array.isArray(hierarchy) && hierarchy.length > 0) {
				hierarchy.pop();
				draw_era(hierarchy);
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
		if (is_IE11)
			CeL.err('IE 11 尚無法使用線圖。請考慮使用 Chrome 或 Firefox 等網頁瀏覽器。');
		CeL.warn('您的瀏覽器不支援 SVG，或是 SVG 動態繪圖功能已被關閉，無法繪製紀年時間軸線圖。');
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

	// 直接 search。
	// e.g., "era.htm?era=%E5%A4%A7%E6%B0%B82%E5%B9%B4"
	if ((i = location.hash.slice(1))
			|| (i = location.search.match(/[?&]era=([^&]+)/))
			&& (i = decodeURIComponent(i[1])))
		click_title_as_era.call({
			title : i
		});

	CeL.log('初始化完畢。您可開始進行操作。');
}

CeL.run(initializer);
