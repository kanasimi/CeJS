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

// google.load('visualization', '1', {packages: ['corechart']});
function initialization() {
	CeL.run([ 'interact.DOM', 'application.debug.log', 'data.date.era',
			'interact.form.select_input', 'interact.integrate.SVG' ],
	//
	function() {
		CeL.Log.set_board('panel_for_log');
		// CeL.set_debug();

		// Set a callback to run when the Google Visualization API is
		// loaded.
		// google.setOnLoadCallback(affairs);

	}, affairs);
}

// ---------------------------------------------------------------------//

// 文字式年曆。
function show_calendar(era_name) {
	var era_caption, title = [
			{
				th : '朝代紀年日期'
			},
			{
				th : '公元(星期)',
				R : '0: 周日/星期日/禮拜天, 1: 周一, 餘類推'
			},
			{
				th : '歲次'
			},
			{
				th : '月建',
				R : '月建/大小月'
			},
			{
				th : era_name.indexOf('月') === -1 ? '朔日' : {
					span : '日干支',
					S : 'font-size:.7em;'
				}
			},
			{
				th : {
					a : 'JDN',
					R : 'Julian Day Number.\n以 UTC 相同日期當天正午為準。\n因此 2000/1/1 轉為 2451545。',
					href : 'http://en.wikipedia.org/wiki/Julian_day'
				}
			},
			{
				th : {
					a : '伊斯蘭曆',
					R : 'Tabular Islamic calendar',
					href : 'http://en.wikipedia.org/wiki/Tabular_Islamic_calendar',
					S : 'font-size:.8em;'
				}
			}, {
				th : '本日共存紀年',
				title : '對未有詳實資料者，僅約略準確至年！'
			} ], output = [ {
		tr : title
	} ], 前年名, 前月名, 前紀年名, 後紀年名,
	//
	main_date_value = CeL.era(era_name),
	//
	dates = CeL.era.dates(era_name, {
		含參照用 : /明治|大正|昭和|明仁/.test(era_name)
	});

	if (!dates)
		return;

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

	dates
			.forEach(function(date) {
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
				}

				tmp = date
						.format(
								{
									parser : 'CE',
									format : date.準確 === '年' ? '%紀年名%年年|%Y年|%年干支|||'
											: '%紀年名%年年%月月%日日|%Y/%m/%d(%w)|%年干支|%月干支%大小月|%日干支|%JDN',
									locale : 'cmn-Hant-TW',
									as_UTC_time : true
								}).split('|');

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

				list = [];
				tmp.forEach(function(data, index) {
					list.push({
						td : data
					});
				});

				list.push({
					td : date.準確 === '年' ? date.to_Tabular()[0] + '年' : date
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
	}, '曆譜（共有 ' + dates.length + ' 個' + (dates.type ? '時' : '年') + '段紀錄）' ]
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

// ---------------------------------------------------------------------//
// 開發人員使用 function。

function 壓縮曆數() {
	CeL.get_element('pack_result').value = CeL.era.pack(CeL
			.get_element('pack_source').value
	// 為方便所作的權益措施。
	.replace(/\\t/g, '\t'));
	return false;
}

function 解壓縮曆數() {
	var data = CeL.get_element('pack_source').value.replace(/\\t/g, '\t')
			.split('|');

	if (data.length > 1) {
		data[2] = CeL.era.extract(data[2]);
		data = data.join('|');

	} else
		data = CeL.era.extract(data[0]);

	CeL.get_element('pack_result').value = data;

	return false;
}

function 解析曆數() {
	var calendar = CeL.era.set(CeL.get_element('pack_source').value.replace(
			/\\t/g, '\t'), {
		extract_only : true
	});

	if (calendar && Array.isArray(calendar = calendar.calendar)) {
		calendar.forEach(function(year_data, index) {
			if (year_data.leap)
				year_data[year_data.leap] = '閏' + year_data[year_data.leap];
			calendar[index] = year_data.join('\t');
		});
		CeL.get_element('pack_result').value = calendar.join('\n');
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

var support_vertical_text = !/Firefox/i.test(navigator.userAgent);

function recover_SVG_text_properties() {
	set_SVG_text_properties.call(this, true);
}

/**
 * 畫個簡單的時間軸線圖。<br />
 * TODO: 加上年代。
 * 
 * @param hierarchy
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

	if (Array.isArray(periods) && periods.length > 0) {

		var start_time = periods.start,
		// draw era width / (時間跨度 time span)。
		ratio = draw_era.width / (periods.end - start_time);

		periods.forEach(function(region) {
			var layer_count = region.length, layer_from_y = draw_era.top,
			//
			layer_height = draw_era.height / layer_count;

			region.forEach(function(period_list) {

				period_list.forEach(function(period) {
					var style,
					// Era.name 為 Array。
					is_Era = Array.isArray(period.name),
					//
					name = is_Era ? period.name[0] : period.name,
					//
					from_x = draw_era.left + (period.start - start_time)
							* ratio,
					//
					width = (period.end - period.start) * ratio,
					// 對紀年時間過短，太窄時，線圖之處理:採垂直排列。
					vertical_text = support_vertical_text
							&& width < layer_height,
					//
					font_size = vertical_text
					//
					? Math.min(width * .8, layer_height / name.length)
					//
					: Math.min(layer_height * .8, width / name.length);

					if (font_size < MIN_FONT_SIZE)
						font_size = MIN_FONT_SIZE;

					if (!(name in draw_era.date_cache) && !isNaN(period.end)) {
						var end_time = new Date(period.end);
						// 警告: .setDate(-1) 此為權宜之計。
						end_time.setDate(end_time.getDate() - 1);
						draw_era.date_cache[name] = {
							start : new Date(period.start)
									.format(draw_era.date_options),
							end : end_time.format(draw_era.date_options)
						};
					}

					SVG_object.addRect(width, layer_height, from_x,
							layer_from_y, null, 1, period.準確 === '年' ? '#ddd'
									: '#eef');

					style = {
						color : period.準確 === '年' ? '#444'
								: layer_count === 1 ? '#15a' : '#a2e',
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
						// 經驗法則，don't
						// know why.
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
						SVG_object.lastAdd.dataset = {};
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
	}

	draw_era.draw_navigation(hierarchy);
}

draw_era.draw_navigation = function(hierarchy, last_is_Era) {
	var period_hierarchy = '',
	// 
	navigation_list = [ '導覽列：', {
		a : '所有國家',
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
		format : era.準確 === '年' ? '%紀年名%年年' : '%紀年名%年年%月月%日日',
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
// 尺規高度。
draw_era.rule_height = 50;

draw_era.date_options = {
	parser : 'CE',
	format : '%Y/%m/%d'
};

draw_era.date_cache = {};

// ---------------------------------------------------------------------//

var last_selected, select_panels = {
	example : '測試範例',
	// 之前輸入資料
	input_history : '輸入紀錄',
	FAQ : '使用說明',
	era_graph : '紀年線圖',
	// 年表
	calendar : '曆譜',
	pack_data : '曆數處理'
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

var original_input, era_input_object, last_input, output_numeral, SVG_object, output_format_object, output_format_types = {
	'公元%Y年%m月%d日' : '公元日期',
	'%紀年名%年年%月月%日日' : '朝代紀年日期',
	'共存紀年' : '共存紀年',
	'%年干支年%月干支月%日干支日' : '年月日干支',
	'%年干支年%月干支月%日干支日%時干支時' : '年月日時干支',
	'%年干支%月干支%日干支%時干支' : '四柱八字',
	'%JDN' : 'Julian Day Number',
	'%JD' : 'Julian Day'
};

function input_era(key) {
	CeL.log(key + ',' + list + ',' + force);
	original_input.apply(this, arguments);
}

function translate_era(era) {
	if (!era)
		era = era_input_object.setValue();
	var output, date = CeL.era(era, {
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
			'公元%Y年' + (date.準確 === '年' ? '' : '%m月%d日'));

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
			output = date.format({
				parser : 'CE',
				format : format,
				locale : 'cmn-Hant-TW',
				numeral : output_numeral,
				as_UTC_time : true
			});

			if (date.曆法)
				output = [ output, {
					br : null
				}, '採用曆法: ', date.曆法 ];

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

			if (date.準確 === '年') {
				if (!Array.isArray(output))
					output = [ output ];
				output.unshift({
					em : '此輸出值僅約略準確至年：'
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
	var era = this.title;
	era_input_object.setValue(era);
	translate_era(era);
	return false;
}

function affairs() {

	CeL.log('初始化完畢。您可開始進行操作。', true);

	// google.visualization.CandlestickChart
	// Org Chart 組織圖
	// Geo Chart 地理圖

	// onInput(key,list,force)

	era_input_object = new CeL.select_input('era_input', CeL.era
			.get_candidate(), 'includeKeyWC');

	CeL.get_element('era_input').onkeypress = CeL.get_element('output_format').onkeypress = function(
			e) {
		if (!e)
			e = window.event;
		// press [Enter]
		if (13 === (e.keyCode || e.which || e.charCode))
			translate_era();
	};

	CeL.get_element('output_format').onchange = CeL.get_element('translate').onclick = function() {
		translate_era();
		return false;
	};

	var i, list = [];
	for (i in output_format_types)
		list.push({
			span : output_format_types[i],
			R : output_format_types[i],
			D : {
				format : i
			},
			C : 'format_button',
			onclick : function() {
				output_format_object.setValue(this.dataset.format);
				translate_era();
				return false;
			}
		}, ' ');
	CeL.new_node(list, 'format_type_bar');

	output_format_object = new CeL.select_input('output_format',
			output_format_types, 'includeKeyWC');
	// original_input = era_input_object.onInput;
	// era_input_object.onInput = input_era;
	// era_input_object.setSearch(set_search_list);

	// CeL.Log.toggle(false);

	list = [];
	[ '546/3/1', '1546-3-1', '一八八〇年四月二十一日七時', '一八八〇年庚辰月庚辰日7時',
			'一八八〇年庚辰月庚辰日庚辰時', '初始元年11月1日', '明思宗崇禎1年1月26日', '天聰二年甲寅月戊子日',
			'天聰2年寅月戊子日', '清德宗光緒六年三月十三日', '清德宗光緒庚辰年三月十三日', '清德宗光緒庚辰年庚辰月庚辰日',
			'清德宗光緒六年三月十三日辰正一刻', '魏少帝嘉平4年5月1日', '魏少帝嘉平4年閏5月1日', '魏少帝嘉平4年閏月1日',
			'景元元年', '景元元年7月', '元文宗天曆2年8月8日', '元文宗天曆3/1/2' ].forEach(function(
			era) {
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

	SVG_object = CeL.get_element('era_graph');
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

	// 為取得 offsetHeight
	CeL.toggle_display(SVG_object, true);
	era_name_classifier = CeL.era.pack.era_name_classifier;
	draw_era.width = SVG_object.offsetWidth - 2 * draw_era.left;
	// 須扣掉 era_graph_navigation 高度。
	draw_era.height = SVG_object.offsetHeight - draw_era.top
			- draw_era.rule_height
			- CeL.get_element('era_graph_navigation').offsetHeight;

	SVG_object = new CeL.SVG(SVG_object.offsetWidth, SVG_object.offsetHeight);
	if (SVG_object.status_OK()) {
		SVG_object.attach('era_graph');
		draw_era();
	} else {
		CeL.get_element('era_graph').style.display = 'none';
		SVG_object = null;
		delete select_panels['era_graph'];
		CeL.warn('您的瀏覽器不支援 SVG，或是 SVG 動態繪圖功能已被關閉，無法繪製紀年時間軸線圖。');
	}

	// -----------------------------

	list = [];
	for (i in select_panels) {
		CeL.toggle_display(i, false);
		if (select_panels[i])
			list.push({
				a : select_panels[i],
				id : i + click_panel.postfix,
				href : "#",
				C : 'note_botton',
				onclick : click_panel
			}, ' | ');
		else
			delete select_panels[i];
	}
	list.pop();
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

}

CeL.run(initialization);
