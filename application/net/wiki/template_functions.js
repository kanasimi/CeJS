/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科):
 *       常用模板特設功能。本工具檔放置的是幾乎所有wiki計畫通用的模板，或者少數wiki計畫特有、且大量使用的著名模板。對各wiki有不同用途的模板，應放置於個別namespace下。
 * 
 * 注意: 本程式庫必須應各 wiki project 模板內容改動而改寫。
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * TODO:<code>

template_functions/zhwiki.js

合併 `special page configuration.js`

</code>
 * 
 * @since 2019/12/4 7:16:34
 */

// More examples: see /_test suite/test.js
// Wikipedia bots demo: https://github.com/kanasimi/wikibot
'use strict';
// 'use asm';

// @examples
(function() {
	CeL.run([/* ..., */'application.net.wiki.template_functions' ]);

	// will auto-load functions @ template_functions/site_name.js
	// e.g., template_functions/zhwiki.js
	var wiki = new CeL.wiki({});

	wiki.page('title').parse(function for_parsed(parsed) {
		// var page_data = parsed.page;
		parsed.each('template:Al', function(token) {
			// ...
		}, {
			// auto-loading functions @ template_functions
			bind_template_functions : true
		});
	});

	// alternative method:

	wiki.page('title', function for_page(page_data) {
		/** {Array} parsed page content 頁面解析後的結構。 */
		var parsed = wiki.parse(page_data);
		parsed.each('template:Al', function(token) {
			// ...
		}, {
			// [KEY_SESSION]
			session : wiki,
			// auto-loading functions @ template_functions
			bind_template_functions : true
		});
	});
});

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.wiki.template_functions',

	require : 'data.native.' + '|application.net.wiki.'
	// load MediaWiki module basic functions
	+ '|application.net.wiki.namespace.'
	//
	+ '|application.net.wiki.parser.',

	// 設定不匯出的子函式。
	no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var wiki_API = library_namespace.application.net.wiki, KEY_SESSION = wiki_API.KEY_SESSION;
	// @inner
	// var is_api_and_title = wiki_API.is_api_and_title,
	// normalize_title_parameter = wiki_API.normalize_title_parameter;

	var to_exit = wiki_API.parser.parser_prototype.each.exit;

	// --------------------------------------------------------------------------------------------

	function template_functions() {
	}

	function get_parsed(page_data) {
		if (!page_data)
			return;

		var parsed = typeof page_data.each === 'function'
		// `page_data` is parsed data
		? page_data : wiki_API.parser(page_data);

		return parsed;
	}

	// ------------------------------------------------------------------------
	// template names: The first one is the main template name. 首個名稱為正式名稱。

	var Hat_names = 'TalkendH|Talkendh|Delh|Closereq|Hat|Hidden archive top'
			.split('|').to_hash();

	var Multidel_names = 'Multidel'.split('|').to_hash();

	var Old_vfd_multi__names = 'Old vfd multi|Oldafdfull|Vfd-kept|存廢討論被保留|頁面存廢討論被保留'
			.split('|');
	var Old_vfd_multi__main_name = Old_vfd_multi__names[0];
	Old_vfd_multi__names = Old_vfd_multi__names.to_hash();
	// var Old_vfd_multi__main_name = Object.keys(Old_vfd_multi__names)[0];

	var Article_history__names = 'Article history|ArticleHistory|Article milestones|AH'
			.split('|');
	var Article_history__main_name = Article_history__names[0];
	Article_history__names = Article_history__names.to_hash();

	// ------------------------------------------------------------------------

	// const
	// var NS_MediaWiki = wiki_API.namespace('MediaWiki');
	var NS_Module = wiki_API.namespace('Module');
	// var NS_Template = wiki_API.namespace('Template');

	var PATTERN_Item_function = /(\W)Item\s*\(arg,arg(?:,arg)?\)/g;
	PATTERN_Item_function = new RegExp(PATTERN_Item_function.source.replace(
			/arg/g, /\s*(nil|"(?:\\"|[^"]+)*"|'(?:\\'|[^']+)*')\s*/.source),
			'g');

	// 汲取 page_data 中所有全局轉換（全頁面語言轉換），並交給 processor 處理。
	// processor({type: 'item', rule: '', original: ''})
	// Warning: Will modify `page_data.parsed`
	function parse_conversion_item(page_data, options) {
		var conversion_item_list = [];
		if (!page_data)
			return conversion_item_list;

		if (page_data.ns === NS_Module) {
			if (false) {
				library_namespace.info('parse_conversion_item: '
						+ page_data.title);
			}
			var object = wiki_API.content_of(page_data);
			if (/function Item\s*\(/.test(object)) {
				// remove local function Item(o, r)
				object = object.replace(
						/(?:\w* )*function Item\s*\([\s\S]+?[\n ]end *\n/, '');
				// convert `Item('Alec', 'zh-cn:亚历克; zh-tw:亞歷;')`
				object = object.replace(PATTERN_Item_function, function(item,
						prefix, original, rule, desc) {
					return prefix + "{type='item',original=" + original
							+ ",rule=" + rule + (desc ? ",desc=" + desc : '')
							+ "}";
				});
			}
			object = wiki_API.parse.lua_object(object);

			object = object && object.content;
			if (!Array.isArray(object)) {
				library_namespace
						.error('parse_conversion_item: Invalid conversion group: '
								+ wiki_API.title_link_of(page_data));
				return conversion_item_list;
			}
			// console.log(object);
			return object;
		}

		// console.log(page_data);

		var parsed;
		if (page_data.title
				&& page_data.title.startsWith('MediaWiki:Conversiontable/')) {
			// assert: page_data.ns === NS_MediaWiki
			parsed = wiki_API.content_of(page_data);
			parsed = wiki_API.parser(parsed.replace(
			//
			/-{([\s\S]+?)}-/g, function(all, inner) {
				return '-{H|' + inner
				// trim any trailling comments starting with '//'
				.replace(/\/\/[^\n]+/g, '')
				// 每條轉換須用如下格式書寫：* abc => xyz //blah blah ;
				.replace(/["'*#\n]/g, '').replace(/=>/g, '=>'
				// language code
				+ page_data.title.match(/\/([^\/]+)/)[1] + ':') + '}-';
			}));

		} else {
			// e.g., page_data.ns === NS_Template
			parsed = get_parsed(page_data);
		}

		var need_reparse;
		// Convert -{}- to more infomational template
		parsed.each('convert', function(token, index, parent) {
			if (parent.type === 'convert' || !(token.flag in {
				// add rule for convert code (but no display in placed code)
				H : true,
				// add rule for convert code (all text convert)
				A : true
			})) {
				return;
			}

			token = token.join(';');
			if (!token)
				return;

			need_reparse = true;
			// Warning: Will modify `page_data.parsed`
			return '{{CItem|' + token.replace(/=/g, '{{=}}') + '}}';
		}, true);
		if (need_reparse) {
			// console.log(parsed.toString());

			// re-parse page
			parsed = wiki_API.parser(parsed.toString());
		}
		// console.log(parsed.toString());

		function for_each_template(token) {
			if (token.convertion_list) {
				// assert: is {{NoteTA}}
				// conversion_item_list.push(item);
				return;
			}

			// console.log(token);
			var item = {
				type : 'item'
			};
			switch (token.name) {
			case 'CItemLan/R':
				// {{CItemLan/R|原文|轉換語法}}
				item.rule = token.parameters[2];
				if (token.parameters[1])
					item.original = token.parameters[1];
				break;

			case 'CItemLan':
				// {{CItemLan|轉換語法|原文}}
				item.rule = token.parameters[1];
				if (token.parameters[2])
					item.original = token.parameters[2];
				break;

			case 'CItemHidden':
			case 'CI':
			case 'CItem':
			case 'CNoteA':
				// {{CItemHidden|轉換規則|original=原文}}
				if (token.parameters.display) {
					if (String(token.parameters.display).toLowerCase() === 'yes') {
						return;
					}
					item.display = token.parameters.display;
				}
				item.rule = token.parameters[1];
				if (token.parameters.original)
					item.original = token.parameters.original;
				break;
			}

			if (!item.rule)
				return;

			if (Array.isArray(item.rule)) {
				item.rule.forEach(function(token, index) {
					/**
					 * e.g.,<code>

					parsed = CeL.wiki.parse("{{CItem|宿命之子誕生{{=}}>zh-cn:新生|desc=|original=The Hatchling}}");

					</code>
					 */
					if (token.type === 'transclusion' && token.name === '=')
						item.rule[index] = '=';
				});
			}

			// item = {type: 'item', rule: '', original: ''}
			conversion_item_list.push(item);
		}

		parsed.each('template', for_each_template);

		return conversion_item_list;
	}

	// ------------------------------------------

	// https://zh.wikipedia.org/wiki/Template:TalkendH
	// [0]: 正式名稱。
	var result_flags__Hat = {
		// 快捷碼：關閉存廢討論

		// 請求無效
		rep : '重複提出，無效',
		commons : '應在維基共享資源提請',
		ne : 'notexist|目標頁面或檔案不存在',
		nq : 'notqualified|提刪者未取得提刪資格',
		// 保留
		dan : '刪後重建',
		// 刪除
		ic : '圖像因侵權被刪|ifd',
		// 快速刪除
		lssd : '無來源或版權資訊，快速刪除',
		svg : '已改用SVG圖形，快速刪除',
		nowcommons : '維基共享資源已提供，快速刪除',
		drep : '多次被刪除，條目被白紙保護，禁止創建',
		// 轉移至其他維基計畫
		twc : '轉移至維基共享資源',
		tws : '轉移至維基文庫',
		twb : '轉移至維基教科書',
		twq : '轉移至維基語錄',
		twt : '轉移至維基詞典',
		twvoy : '轉移至維基導遊',
		two : '轉移至其他維基計畫',
		// 其他處理方法
		c : '轉交侵權|copyvio',
		// m2pfd : '轉送頁面存廢討論',
		// m2ifd : '轉送檔案存廢討論',
		cr : '分類重定向',
		ma : '允許併入|mergeapproved',

		// 快捷碼：破壞
		del : '已刪除|相關頁面已刪除'
	};

	// https://zh.wikipedia.org/wiki/Template:Old_vfd_multi
	// [0]: 正式名稱。
	var result_flags__Old_vfd_multi = {
		k : 'keep|kept|保留',
		nc : 'no consensus|nc|無共識|无共识',
		m : 'moved|move|renamed|移動|移动',
		r : 'redirect|redirected|重定向',
		// incubated : 'incubated',
		// 包含提刪者撤回
		sk : 'speedy keep|speedily kept|快速保留|速留',
		ir : 'invalid request|無效|无效|請求無效',
		// '''請求理由已消失'''，页面'''保留''' reason disappeared
		rr : '請求理由消失',
		merge : 'merge|merged|併入|合併',
		d : 'delete|deleted|snowd|刪除',
		sd : 'speedy delete|speedily deleted|快速刪除',
		tk : 'temporarily keep|暫時保留|暂时保留'
	};

	// default flag: k|保留
	var default_result_of__Old_vfd_multi = 'k';

	var result_flags__Article_history = {
		renamed : 'rename|renamed'
	};

	function normalize_result_flag_sets(flag_sets) {
		for ( var flag in flag_sets)
			flag_sets[flag] = flag_sets[flag].split('|');
		// return flag_sets;
	}

	normalize_result_flag_sets(result_flags__Old_vfd_multi);
	normalize_result_flag_sets(result_flags__Hat);

	function normalize_result_flag(flag_sets, result, valid_flag_only) {
		result = result && result.toString().trim();
		var normalized_result = result && result.toLowerCase();
		if (normalized_result in flag_sets)
			return normalized_result;

		for ( var flag in flag_sets) {
			var flags = flag_sets[flag];
			if (flags.includes(normalized_result)) {
				return flag;
				// result = flag;
				// break;
			}
		}

		if (!valid_flag_only)
			return result;

		if (false) {
			library_namespace.warn('normalize_result_flag: Invalid result: '
					+ result);
		}
	}

	function parse_Hat(token, options) {
		options = library_namespace.setup_options(options);

		if (!token)
			return;

		var flags;

		if (token.type === 'section') {
			// console.log(token);
			token.each('template', function(_token) {
				// console.log(_token);
				var _flags = parse_Hat(_token);
				// console.log(_flags);
				if (_flags) {
					flags = _flags;
					// 僅以第一個有結論的為主。 e.g., [[Wikipedia:頁面存廢討論/記錄/2010/09/26#158]]
					return flags.result && token.each.exit;
				}
			});
			return flags;
		}

		if (!(token.name in Hat_names))
			return;

		flags = Object.create(null);

		// {{Talkendh|result 處理結果|target}}
		// 早期{{delh}}沒有 result 處理結果。
		if (token.parameters[1] !== undefined) {
			flags.result = token.parameters[1];
		}
		if (token.parameters[2] !== undefined) {
			flags.target = token.parameters[2];
		}
		// console.log(token);
		// console.log(flags);

		return flags;
	}

	function text_of_Hat_flag(flag, allow__Old_vfd_multi__flags) {
		if (flag && flag.result) {
			// is item
			flag = flag.result;
		}

		var result = normalize_result_flag(result_flags__Old_vfd_multi, flag,
				true);
		if (result) {
			return allow__Old_vfd_multi__flags ? result
					: result_flags__Old_vfd_multi[result][0];
		}

		result = normalize_result_flag(result_flags__Hat, flag, true);
		if (result) {
			return result_flags__Hat[result][0];
		}

		library_namespace.debug('Not normal Hat flag: ' + flag, 1,
				'text_of_Hat_flag');
		return flag;
	}

	// test if flag includes new_flag:
	// CeL.wiki.template_functions.Hat.result_includes('快速刪除', 'd') === true
	// '快速刪除' → 'speedy delete'
	// 'd' → 'delete'
	// 'speedy delete'.includes('delete');
	function Hat_flag_result_includes(flag, new_flag) {
		// .toLowerCase(): e.g., [[Talk:以色列]]
		flag = text_of_Hat_flag(flag, true);
		if (!flag)
			return;
		flag = String(flag).trim().toLowerCase();

		new_flag = text_of_Hat_flag(new_flag, true);
		if (!new_flag)
			return;
		new_flag = String(new_flag).trim().toLowerCase();

		return flag.includes(new_flag);
	}

	function parse_Old_vfd_multi_page(page_data, options) {
		options = library_namespace.setup_options(options);

		var item_list = [], Article_history_items = [], parsed = get_parsed(page_data);

		var check_parameters = 'date|result|page|target'.split('|');
		if (Array.isArray(options.additional_parameters)) {
			// 讀取 .hat_result , .bot_checked 之類。
			check_parameters.append(options.additional_parameters);
		}

		parsed.each('template', function(token) {
			var _item_list = parse_Article_history_token(token);
			if (_item_list) {
				_item_list.forEach(function(item) {
					Article_history_items.push(item);
					var action = item.action
					// allow `action=afd`
					&& item.action.toString().toUpperCase();
					if (action !== 'AFD' && action !== 'CSD')
						return;

					item.date = item.date.to_Date().format('%Y/%2m/%2d');
					// item.page = item.link;
					item_list.push(item);
				});
				return;
			}

			// TODO: {{Drv-kept}}
			if (!(token.name in Old_vfd_multi__names))
				return;

			// console.log(token.toString());

			// {{Old vfd multi|提刪日期|處理結果|page=頁面名稱}}
			var result = token.parameters[2];
			result = normalize_result_flag(result_flags__Old_vfd_multi, result)
					|| default_result_of__Old_vfd_multi;
			var item = {
				// 注意: 其他 parameters 會被捨棄掉!
				date : token.parameters[1],
				result : result,
				page : token.parameters.page,
				// move to, merge to, redirect to
				target : token.parameters[3]
			};
			if (Array.isArray(options.additional_parameters)) {
				options.additional_parameters.forEach(function(parameter) {
					if (parameter in token.parameters)
						item[parameter] = token.parameters[parameter];
				});
			}
			item = wiki_API.parse.set_template_object_parameters(
			//
			null, item);
			item_list.push(item);

			// if (token.parameters.multi) item = [ item ];
			for (var index = 2; index < 9
			//
			&& token.parameters['date' + index]; index++) {
				item = Object.create(null);
				check_parameters.forEach(function(parameter) {
					var name = parameter + index;
					if (name in token.parameters)
						item[parameter] = token.parameters[name];
				});
				if (!item.result) {
					item.result = default_result_of__Old_vfd_multi;
				}
				item = wiki_API.parse
						.set_template_object_parameters(null, item);
				item_list.push(item);
				if (index > 5) {
					library_namespace.warn('parse_Old_vfd_multi: '
							+ wiki_API.title_link_of(page_data)
							+ ' Invalid NO ' + index);
				}
			}

			// return to_exit;
		});

		// if (page_data.title.includes('')) console.log(item_list);

		if (options.unique) {
			// remove duplicate records
			item_list = Old_vfd_multi__unique_item_list(item_list);
		}

		if (options.using_data) {
			item_list.page_data = page_data;
		} else if (page_data.title) {
			// normalized page title
			item_list.page_title = page_data.title;
		}
		if (Article_history_items.length > 0)
			item_list.Article_history_items = Article_history_items;

		return item_list;
	}

	function Old_vfd_multi__unique_item_list(item_list) {
		var key_hash = Object.create(null);

		function key_filter(item) {
			if (!item)
				return;
			var key = [ item.date && CeL.Julian_day(item.date.to_Date()),
					text_of_Hat_flag(item.result, true),
					wiki_API.title_of(item.page), item.target ].join('|');
			// if (item.date === '') console.log(key);
			if (!(key in key_hash)) {
				key_hash[key] = item;
				return true;
			}
		}

		return item_list.filter(key_filter);
	}

	function Old_vfd_multi__item_list_to_template_object(item_list, options,
			page_data) {
		options = library_namespace.setup_options(options);
		var force_set_page = 'force_set_page' in options ? options.force_set_page
				// 為了預防頁面被移動時出現問題，預設強制加上 `page` 設定。
				: true;
		var additional_parameters = options.additional_parameters;
		if (!Array.isArray(additional_parameters)) {
			if (additional_parameters) {
				library_namespace
						.error('Old_vfd_multi__item_list_to_template_object: Invalid additional_parameters: '
								+ additional_parameters);
			}
			additional_parameters = [];
		}
		var template_object = Object.create(null);

		if (item_list.length > 5) {
			library_namespace
					.warn('Old_vfd_multi__item_list_to_template_object: {{'
							+ Old_vfd_multi__main_name
							+ '}} only support 5 records!');
			console.log(item_list);
		}

		var page_title = wiki_API.title_of(page_data);

		var set_parameters = wiki_API.parse.set_template_object_parameters;
		item_list.forEach(function(item, index) {
			if (index === 0) {
				var parameters = {
					'1' : item.date,
					'2' : item.result,
					page : (force_set_page || item.page !== page_title)
							&& item.page,
					// move to, merge to, redirect to
					'3' : item.target
				};
				additional_parameters.forEach(function(parameter_name) {
					parameters[parameter_name] = item[parameter_name];
				});
				set_parameters(template_object, parameters);
				return;
			}

			if (++index === 2) {
				template_object.multi = 1;
			}

			var mapper = {
				date : 'date' + index,
				result : 'result' + index,
				page : 'page' + index,
				target : 'target' + index
			};
			additional_parameters.forEach(function(parameter_name) {
				mapper[parameter_name] = parameter_name + index;
			});
			mapper = Object.reverse_key_value(mapper);
			if (!force_set_page && item.page === page_title) {
				delete mapper.page;
			}
			set_parameters(template_object, mapper, item);
		});

		return template_object;
	}

	function Old_vfd_multi__item_list_to_wikitext(item_list, options, page_data) {
		// console.log(item_list);
		var wikitext = Array.isArray(item_list) ?
		// normalize wikitext
		Old_vfd_multi__item_list_to_template_object(item_list, options,
				page_data) : item_list;

		/**
		 * <code>

		+ new line
		{{Old vfd multi|2008/11/22|k|page=124}}
		->
		{{Old vfd multi|2008/11/22|k|page=124
		|multi=1
		|...
		}}

		</code>
		 */
		var line_separator = '\n';
		var latest_index;
		function add_line_separator(string_list) {
			var multi;
			string_list.forEach(function(parameter, index) {
				if (index === 0)
					return;
				if (/^multi=/.test(parameter)) {
					multi = true;
					string_list[index - 1] += line_separator;
					// string_list[index] += line_separator;
					return;
				}
				var matched = parameter.match(/^[^=\d]+(\d+)=/);
				if (matched && latest_index !== +matched[1]) {
					latest_index = +matched[1];
					string_list[index - 1] += line_separator;
				}
			});
			if (multi) {
				// 將 '}}' 前一個加上 line_separator。
				string_list[string_list.length - 1] += line_separator;
			}
			return string_list;
		}

		if (typeof wikitext === 'object') {
			wikitext = wiki_API.parse.template_object_to_wikitext(
					Old_vfd_multi__main_name, wikitext, add_line_separator);
		}

		return wikitext;
	}

	/**
	 * 將 page_data 中的 {{Old vfd multi}} 替換成 replace_to。
	 * 
	 * @param {Object|String}page_data
	 * @param {Array|Object|String}replace_to
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 */
	function replace_Old_vfd_multi(page_data, replace_to, options) {
		replace_to = Old_vfd_multi__item_list_to_wikitext(replace_to, options,
				page_data);
		if (typeof replace_to !== 'string' || !replace_to.startsWith('{{')) {
			throw new Error('replace_Old_vfd_multi: Invalid replace_to: '
					+ replace_to);
		}

		var replaced;
		var parsed = get_parsed(page_data);
		parsed.each('template', function(token) {
			if (token.name in Old_vfd_multi__names) {
				if (replaced)
					return parsed.each.remove_token;
				replaced = true;
				return replace_to;
			}

			var item_list = parse_Article_history_token(token);
			if (item_list) {
				var NO_to_delete = [], last_need_preserve;
				item_list.forEach(function(item, index) {
					++index;
					var action = item.action
					// allow `action=afd`
					&& item.action.toString().toUpperCase();
					if (action === 'AFD')
						NO_to_delete.push(index);
					else
						last_need_preserve = index;
				});

				if (!last_need_preserve) {
					// Only action=AFD
					return parsed.each.remove_token;
				}

				if (NO_to_delete.length === 0) {
					if (!replaced) {
						library_namespace.warn('replace_Old_vfd_multi: '
								+ 'Should find {{' + Article_history__main_name
								+ '}} action=AFD, but no {{'
								+ Article_history__main_name
								+ '}} action=AFD found:');
						console.warn(token);
					}
					return;
				}

				if (last_need_preserve > NO_to_delete[0]) {
					if (typeof options.modify_Article_history_warning) {
						options.modify_Article_history_warning(
						//
						token, page_data);
					} else {
						library_namespace.warn('replace_Old_vfd_multi: '
						//
						+ 'Should modify {{' + Article_history__main_name
								+ '}} manually:');
						library_namespace.log(token.toString());
					}
					return;
				}

				// assert: last_need_preserve < NO_to_delete[0]

				var PATTERN = new RegExp('^\\s*action(?:'
						+ NO_to_delete.join('|') + ')'), index = 1;
				while (index < token.length) {
					if (PATTERN.test(token[index]))
						token.splice(index, 1);
					else
						index++;
				}

				// assert: token.length > 1
				if (false && token.length === 1) {
					// Nothing left
					return parsed.each.remove_token;
				}
			}

			if (token.name in Multidel_names) {
				library_namespace.warn('replace_Old_vfd_multi: '
				//
				+ 'Should modify {{Multidel}} manually:');
				library_namespace.log(token.toString());
				return;
			}

		}, true);

		if (!replaced) {
			var line_separator = '\n';
			// TODO: 將模板放在專題模板之後。
			if (!replace_to.endsWith(line_separator)) {
				// 前面的 replaced 是替代，無需加入換行。
				// 這邊將會把 `replace_to` 直接添加在頁面頂端，因此需要格式化一下。
				parsed.unshift(line_separator);
			}
			parsed.unshift(replace_to);
		}

		return parsed.toString();
	}

	// @see
	// https://en.wikipedia.org/wiki/Wikipedia:Wikipedia_Signpost/2008-03-24/Dispatches
	function parse_Article_history_token(token, item_list) {
		if (!(token.name in Article_history__names))
			return;

		if (!item_list)
			item_list = [];

		// TODO: dykdate, itndate [[Module:Article history/config]]
		for ( var key in token.parameters) {
			var value = token.parameters[key];
			var matched = key.match(/^action([1-9]\d?)(.*)?$/);
			if (!matched) {
				if (library_namespace.is_digits(key)) {
					// invalid numeral parameters
					// e.g., [[Talk:香港國際機場]]
					library_namespace.debug('Skip [' + key + ']: ' + value, 3,
							'parse_Article_history_token');
				} else {
					item_list[key] = value;
				}
				continue;
			}
			var index = matched[1] - 1;
			if (!item_list[index])
				item_list[index] = Object.create(null);
			item_list[index][matched[2] || 'action'] = value;
		}

		return item_list;
	}

	// parse {{Article history}}
	function parse_Article_history_page(page_data, options) {
		options = library_namespace.setup_options(options);

		var item_list = [];
		if (options.using_data) {
			item_list.page_data = page_data;
		} else if (page_data.title) {
			// normalized page title
			item_list.page_title = page_data.title;
		}

		var parsed = get_parsed(page_data);

		parsed.each('template', function(token) {
			parse_Article_history_token(token, item_list);

			// return to_exit;
		});

		return item_list;
	}

	// --------------------------------------------------------------------------------------------

	function get_function_of(template, options) {
		options = library_namespace.setup_options(options);
		var session = wiki_API.session_of_options(options);
		var site_name = options.site_name || wiki_API.site_name(session);
		var functions_of_site = template_functions.functions_of_site[site_name];

		var template_name = typeof template === 'string' ? template : template
				&& template.name;

		var template_parser;
		function get_template_parser() {
			return template_parser = functions_of_site
					&& functions_of_site[template_name]
					|| template_functions.functions_of_all_sites[template_name];
		}

		if (get_template_parser())
			return template_parser;

		if (!session || options.no_normalize) {
			return;
		}

		// normalize_template_name()
		template_name = session.remove_namespace(session.redirect_target_of(
				session.to_namespace(template_name, 'Template'), options),
				options);
		return get_template_parser();
	}

	function initialize_session() {
		var session = this;
		var site_name = wiki_API.site_name(session);
		var function_name_list = Object
				.keys(template_functions.functions_of_all_sites);
		var functions_of_site = template_functions.functions_of_site[site_name];
		if (functions_of_site) {
			function_name_list.append(Object.keys(functions_of_site));
		}
		if (function_name_list.length > 0) {
			session.register_redirects(function_name_list, {
				namespace : 'Template'
			});
		}
	}

	var module_name = this.id;

	function load_template_functions(session) {
		session = session || this;
		var site_name = typeof session === 'string' ? session : wiki_API
				.site_name(session);
		if (!site_name)
			throw new Error('Can not get site_name!');

		// 注意: 若已設定 `CeL.application.net.wiki.template_functions.zhwiki`，
		// 則不能採用匯添加 prefix `library_namespace.Class` 的
		// library_namespace.to_module_name()，否則會被忽略，不載入！
		library_namespace.run(library_namespace.to_module_name(module_name
				+ library_namespace.env.module_name_separator + site_name),
				initialize_session.bind(session));
	}

	// --------------------------------------------------------------------------------------------

	// TODO:?
	// template_functions[KEY_subdomain_for_project][site_name]
	// var KEY_subdomain_for_project;
	// template_functions[KEY_common_templates].template_name
	// var KEY_common_templates;

	// export 導出.

	library_namespace.set_method(wiki_API.prototype, {
		load_template_functions : load_template_functions
	});

	Object.assign(template_functions, {
		// functions_of_site[site_name] = { template_name:
		// parse_template_token(template_token, index, parsent, depth){} }
		functions_of_site : Object.create(null),
		functions_of_all_sites : Object.create(null),
		get_function_of : get_function_of,

		// ----------------------------

		parse_conversion_item : parse_conversion_item,

		// ----------------------------

		Hat : {
			names : Hat_names,
			text_of : text_of_Hat_flag,
			result_includes : Hat_flag_result_includes,
			parse : parse_Hat
		},
		Old_vfd_multi : {
			names : Old_vfd_multi__names,
			main_name : Old_vfd_multi__main_name,
			/**
			 * @example<code>
			const item_list = CeL.wiki.template_functions.Old_vfd_multi.parse_page(page_data, {
				unique: true,
				additional_parameters
			});
			</code>
			 */
			parse_page : parse_Old_vfd_multi_page,
			unique_item_list : Old_vfd_multi__unique_item_list,

			item_list_to_object : Old_vfd_multi__item_list_to_template_object,
			item_list_to_wikitext : Old_vfd_multi__item_list_to_wikitext,
			replace_by : replace_Old_vfd_multi,
			text_of : text_of_Hat_flag
		},
		Article_history : {
			names : Article_history__names,
			parse_page : parse_Article_history_page
		},
		Multidel : {
			names : Multidel_names
		}

	});

	return template_functions;
}
