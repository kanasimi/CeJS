/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科):
 *       常用模板特設功能。本工具檔放置的是幾乎所有wiki計畫通用的模板，或者少數wiki計畫特有、且大量使用的著名模板。對各wiki有不同用途的模板，應放置於個別namespace下。
 * 
 * 注意: 本程式庫必須應各 wiki project 模板內容改動而改寫。
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * TODO:<code>

Read https://www.mediawiki.org/wiki/Extension:TemplateData https://www.mediawiki.org/wiki/Help:TemplateData

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
	CeL.run([ 'application.net.wiki',
	//
	'application.net.wiki.template_functions' ]);

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

	// --------------------------------------------------------------------------------------------

	// usage:
	if (false) {
		// ...
		var parsed = page_data.parse();
		if (parsed.is_biography()) {
			// ...
		}
	}

	template_functions.biographical_templates = [
	//
	'birth date', 'birth date and age', 'birth year and age',
	//
	'death date', 'death date and age', 'death year and age'
	//
	].map(function(template_name) {
		return wiki_API.normalize_title('Template:' + template_name);
	});

	template_functions.biographical_categories = [ 'Living people',
			'Year of birth missing', 'Year of death missing' ];

	/**
	 * Test if `page_data` is biography of a person. 頁面為人物傳記。
	 * 
	 * @param {Object}page_data
	 *            page data
	 * 
	 * @returns {Boolean} `page_data` is biography of a person.
	 * 
	 * @see {{WikiProject Biography}}
	 */
	function page_is_biography() {
		// var page_data = this;
		// console.log(page_data);
		// var parsed = CeL.wiki.parser(page_data).parse();

		var parsed = this;
		var session = wiki_API.session_of_options(parsed)
		// needed in 20210422.Sorting_category_and_sort_key_of_Thai_names.js
		|| wiki_API.session_of_options(parsed.options);
		var is_biography;
		parsed.each('template', function(token) {
			if (session.is_template(template_functions.biographical_templates,
					token)) {
				is_biography = true;
				return parsed.each.exit;
			}
		});
		if (is_biography)
			return true;

		parsed.each('category', function(token) {
			if (template_functions.biographical_categories.includes(token.name)
			// e.g., en: [[Category:2000 births]] [[Category:2000 deaths]]
			// zh: [[Category:2000年出生]] [[Category:2000年逝世]]
			// ja: [[Category:2000年生]] [[Category:2000年没]]
			|| /^\d+(?: births| deaths|年出生|年逝世|年生|年没)$/.test(token.name)) {
				is_biography = true;
				return parsed.each.exit;
			}
		});
		if (is_biography)
			return true;

		library_namespace.debug(wiki_API.title_link_of(parsed.page)
				+ ' is ot biography?', 3, 'page_is_biography');
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
	var NS_Template = wiki_API.namespace('Template');

	var PATTERN_Item_function = /(\W)Item\s*\(arg,arg(?:,arg)?\)/g;
	PATTERN_Item_function = new RegExp(PATTERN_Item_function.source.replace(
			/arg/g, /\s*(nil|"(?:\\"|[^"]+)*"|'(?:\\'|[^']+)*')\s*/.source),
			'g');

	function item_to_conversion(item) {
		// assert: item = {type: 'item', rule: '', original: ''}
		var conversion = wiki_API.parse('-{A|' + item.rule + '}-', {
			normalize : true,
			with_properties : true
		});
		conversion.item = item;
		return conversion;
	}

	// 汲取 page_data 中所有全局轉換（全頁面語言轉換），並交給 processor 處理。
	// processor({type: 'item', rule: '', original: ''})
	// Warning: Will modify `page_data.parsed`
	// @see routine/20191129.check_language_conversion.js
	function parse_conversions(page_data, options) {
		var conversion_list = [];
		if (!page_data)
			return conversion_list;

		if (page_data.ns === NS_Module) {
			var matched = page_data.title
			// [[w:zh:Wikipedia:字詞轉換處理/公共轉換組#Lua版建立]]
			// core: [[Module:CGroup/core]]
			.match(/\/(list|doc|temp|sandbox|preload|editintro|core)$/i);
			if (matched) {
				library_namespace.info('parse_conversions: '
				// document / temporary / list
				+ 'Skip special page: ' + wiki_API.title_link_of(page_data));
				conversion_list.skipped = matched[1];
				return conversion_list;
			}

			if (false) {
				library_namespace.info('parse_conversions: ' + page_data.title);
			}
			var object = wiki_API.content_of(page_data, options);
			// local function Item
			if (/function\s+Item\s*\(/.test(object)
			// `local Item = require('Module:CGroup/core').Item;`
			|| /local\s+Item\s*=/.test(object)) {
				// remove local function Item(o, r)
				object = object.replace(
						/(?:\w* )*function Item\s*\([\s\S]+?[\n ]end *\n/, '')
						.replace(/local\s+Item\s*=[^\n;]+/, '');
				// convert `Item('Alec', 'zh-cn:亚历克; zh-tw:亞歷;')`
				object = object.replace(PATTERN_Item_function, function(item,
						prefix, original, rule, additional) {
					if (additional) {
						library_namespace.warn(
						// 含有未知參數 [[:Category:Unknown parameters]]
						'There is additional parameter: ' + item.trim());
					}
					return prefix + "{type='item',original=" + original
							+ ",rule=" + rule + "}";
				});
			} else if ((matched = object
					// e.g., [[Module:CGroup/C]], [[Module:CGroup/HalfLife]]
					.match(/^(?:--.*\n)*[\s\n]*return\s+(require)\s*\(\s*(['"])([^\n]+?)\2\s*\)\s*;?/))
					|| (matched = object.match(
					// e.g., [[Module:CGroup/mw]], [[Module:CGroup/資訊科技]]
					/^(?:--.*\n)*[\s\n]*return\s+(require)\s*(\[\[)\s*([^\n]+?)\s*\]\]\s*;?/
					//
					)) || (matched = object.match(
					// e.g., [[Module:CGroup/Mythology]]
					/^(?:--.*\n)*[\s\n]*return\s+{\s*(name)\s*=\s*(['"])([^\n]+?)\2\s*}\s*;?/
					//
					))) {
				matched = (matched[1] === 'name' ? 'Module:CGroup/' : '')
						+ matched[3];
				library_namespace.info('parse_conversions: 公共轉換組模塊 '
						+ wiki_API.title_link_of(page_data)
						// 重定向
						+ ' 重新導向至: ' + wiki_API.title_link_of(matched));
				conversion_list.skipped = 'redirected';
				conversion_list.redirect_to = matched;
				return conversion_list;
			}
			object = wiki_API.parse.lua_object(object);

			object = object && object.content;
			if (!Array.isArray(object)) {
				library_namespace
						.error('parse_conversions: Invalid conversion group: '
								+ wiki_API.title_link_of(page_data));
				conversion_list.error = 'invalid';
				return conversion_list;
			}
			// console.log(object);
			conversion_list = object.filter(function(item) {
				return item && item.rule;
			}).map(item_to_conversion);
			return conversion_list;
		}

		// ----------------------------------------------------------
		// console.log(page_data);

		var parsed = wiki_API.content_of(page_data), redirect_to = wiki_API.parse
				.redirect(parsed);
		if (redirect_to) {
			library_namespace.info('parse_conversions: 公共轉換組模塊 '
					+ wiki_API.title_link_of(page_data)
					// 重定向
					+ ' 重新導向至: ' + wiki_API.title_link_of(redirect_to));
			conversion_list.skipped = 'redirected';
			conversion_list.redirect_to = redirect_to;
			return conversion_list;
		}

		if (page_data.title
				&& page_data.title.startsWith('MediaWiki:Conversiontable/')) {
			// assert: page_data.ns === NS_MediaWiki
			parsed = wiki_API.parser(parsed.replace(
			// @see PATTERN_language_conversion @
			// CeL.application.net.wiki.parser.wikitext
			// MediaWiki:Conversiontable/* 可接受 "\n"
			/-{([\s\S]+?)}-/g, function(all, inner) {
				return '-{H|' + inner
				// trim any trailling comments starting with '//'
				// `//blah blah`是可省的注釋，其目的是解釋該轉換規則；
				.replace(/\/\/[^\n]+/g, function(all) {
					// 如果使用//作注釋的話，;要放在注釋的後面。
					var matched = all.match(/;\s*$/);
					return matched ? matched[0] : '';
				})
				// 每條轉換須用如下格式書寫：* abc => xyz //blah blah ;
				.replace(/["'*#\n]/g, '').replace(/=>/g, '=>'
				// language code
				+ page_data.title.match(/\/([^\/]+)/)[1] + ':') + '}-';
			}));

		} else {
			// e.g., page_data.ns === NS_Template
			parsed = get_parsed(page_data);
		}

		parsed.each('convert', function(token, index, parent) {
			if (parent.type === 'convert' || !(token.flag in {
				// add rule for convert code (but no display in placed code)
				H : true,
				// add rule for convert code (all text convert)
				A : true
			})) {
				return;
			}

			// get conversion rule only
			var rule = token.toString('rule');
			if (rule) {
				conversion_list.push(item_to_conversion({
					type : 'item',
					rule : rule
				}));
			}
		});

		function for_each_template_token(token) {
			if (token.conversion_list) {
				// assert: is {{NoteTA}}
				// conversion_list.push({item:item});
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

			if (!item.rule) {
				var matched = token.name.match(/^CGroup\/([^\/]+)/);
				if (matched) {
					if (!conversion_list.transclusions)
						conversion_list.transclusions = [];
					conversion_list.transclusions.push(matched[1]);
				}
				return;
			}

			if (Array.isArray(item.rule)) {
				item.rule.forEach(function(token, index) {
					/**
					 * e.g.,<code>

					parsed = CeL.wiki.parse("{{CItem|宿命之子誕生{{=}}>zh-cn:新生|desc=|original=The Hatchling}}");

					</code>
					 */
					if (token.is_magic_word && token.name === '=')
						item.rule[index] = '=';
				});
			}

			conversion_list.push(item_to_conversion(item));
		}

		parsed.each('template', for_each_template_token);

		if (conversion_list.transclusions) {
			library_namespace.info('parse_conversions: '
			//
			+ (page_data.ns === NS_Module
			//
			|| page_data.ns === NS_Template ? '公共轉換組模塊' : '頁面 ')
					+ wiki_API.title_link_of(page_data) + ' 內嵌轉換組: '
					+ conversion_list.transclusions.join(', '));
			conversion_list.categories = parsed.get_categories();
		}

		return conversion_list;
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
				// move to, merge to, redirects to
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
					// move to, merge to, redirects to
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

			var mapping = {
				date : 'date' + index,
				result : 'result' + index,
				page : 'page' + index,
				target : 'target' + index
			};
			additional_parameters.forEach(function(parameter_name) {
				mapping[parameter_name] = parameter_name + index;
			});
			mapping = Object.reverse_key_value(mapping);
			if (!force_set_page && item.page === page_title) {
				delete mapping.page;
			}
			set_parameters(template_object, mapping, item);
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
	// 模板處理功能。尤其是採用Lua的。

	function template_functions_site_name(session, options) {
		return options && options.site_name || wiki_API.site_name(session);
	}

	function token_is_invoke(token) {
		return token.type === 'magic_word_function' && token.name === '#invoke'
		// {{#invoke:Template:Delete2|CSD_reason|parent=yes}}
		// using [[Module:Template:Delete2]]
		&& token.module_name;
	}

	function get_function_config_of(template, options) {
		if (!template)
			return;

		options = library_namespace.setup_options(options);
		var session = wiki_API.session_of_options(options);
		var site_name = template_functions_site_name(session, options);
		var functions_of_site = template_functions.functions_of_site[site_name];
		// console.trace([site_name, functions_of_site, options]);

		var is_invoke, template_name;
		if (typeof template === 'string') {
			is_invoke = session ? session.is_namespace(template, 'Module')
					: /^Module:/i.test(template);
			template_name = template;
		} else {
			is_invoke = token_is_invoke(template);
			template_name = is_invoke ? 'Module:' + template.module_name
					: template.name;
		}

		function get_function_config() {
			return functions_of_site && functions_of_site[template_name]
					|| template_functions.functions_of_all_sites[template_name];
		}

		// template_processor
		var function_config = get_function_config();
		if (function_config)
			return function_config;

		if (!session || options.no_normalize) {
			return;
		}

		// normalize_template_name() to redirect target
		if (!is_invoke)
			template_name = session.to_namespace(template_name, 'Template');
		var redirect_target = session
				.redirect_target_of(template_name, options);
		if (false && template_name === 'Template:T') {
			console.trace([ redirect_target, template_name, function_config,
					site_name, functions_of_site,
					template_functions.functions_of_all_sitesoptions ]);
		}
		if (redirect_target !== template_name && template.type) {
			// template.redirect_target = redirect_target;
		}
		template_name = is_invoke ? redirect_target : session.remove_namespace(
				redirect_target, options);
		// console.trace([ template_name, get_function_config() ]);
		return get_function_config();
	}

	// TODO: use adopter, adopt_function
	function adapt_function(template_token, index, parent, options) {
		if (!parent && !options && typeof index === 'object') {
			// CeL.wiki.template_functions.adapt_function(token, options);
			options = index;
			index = template_token.index;
			parent = template_token.parent;
		}

		if (!template_token || template_token.type !== 'transclusion'
				&& !token_is_invoke(template_token)) {
			return;
		}

		// template_processor()
		var function_config = get_function_config_of(template_token, options);
		// console.trace(function_config);
		if (false && template_token.name === 'T') {
			console.trace([ template_token, function_config ]);
		}
		if (!function_config) {
			return;
		}

		if (function_config.properties) {
			// 為 template_token 加上 template_functions 的屬性。
			// 一些僅設定 token.expand() 的 parse 函數可採此法，設定成：
			// Template_name:{properties:{expand:expand_template_Template_name}},
			Object.assign(template_token, function_config.properties);
		}

		if (function_config.adapter) {
			function_config = function_config.adapter;
		}
		if (typeof function_config === 'function')
			return function_config(template_token, index, parent, options);
	}

	function set_proto_properties(template_name, template_properties, options) {
		options = library_namespace.setup_options(options);
		var session = wiki_API.session_of_options(options);
		var site_name = template_functions_site_name(session, options);
		var functions_of_site = template_functions.functions_of_site[site_name];
		if (!functions_of_site)
			template_functions.functions_of_site[site_name] = functions_of_site = Object
					.create(null);

		var function_config = functions_of_site[template_name];
		if (!function_config) {
			functions_of_site[template_name] = function_config = Object
					.create(null);
		} else if (typeof function_config === 'function') {
			functions_of_site[template_name] = function_config = {
				adapter : function_config
			};
		}

		// assert: library_namespace.is_Object(function_config)
		if (!function_config.properties) {
			function_config.properties = Object.create(null);
		}
		Object.assign(function_config.properties, template_properties);
		// console.trace(function_config.properties);
	}

	// ------------------------------------------

	var KEY_dependent_on = typeof Symbol === 'function' ? Symbol('KEY_dependent_on')
			: '\0dependent on';
	// dependency_hash[site_name] = [ sites dependent on site_name ]
	var dependency_hash = Object.create(null);
	// loaded_sites = { 已經處理過的 site_name }
	var loaded_sites = Object.create(null);

	// 檢查所有依賴於 site_name_loaded 的。
	function initialize_functions_of_site(site_name_loaded) {
		// console.trace(dependency_hash);
		var dependency_list = dependency_hash[site_name_loaded];
		if (!dependency_list) {
			return;
		}

		// free
		delete dependency_hash[site_name_loaded];

		dependency_list.forEach(function(_site_name) {
			// _site_name 依賴於 site_name_loaded。
			var functions_of_site
			//
			= template_functions.functions_of_site[_site_name];
			// console.trace(functions_of_site);
			var dependent_on = functions_of_site
					&& functions_of_site[KEY_dependent_on];
			if (!dependent_on || dependent_on.some(function(__site_name) {
				if (!(__site_name in loaded_sites)) {
					// __site_name 所依賴的 __site_name 尚未 loaded。
					// assert: __site_name is loading now
					return true;
				}
			})) {
				return;
			}

			// console.trace('All dependency loaded.');
			dependent_on.forEach(function(__site_name) {
				var _dependent_on
				//
				= template_functions.functions_of_site[__site_name];
				if (!_dependent_on)
					return;

				var function_name_list = Object.keys(_dependent_on);
				function_name_list.forEach(function(function_name) {
					if (!(function_name in functions_of_site)) {
						library_namespace.debug('設定 ' + _site_name + '.'
								+ function_name + '=' + __site_name + '.'
								+ function_name, 2,
								'initialize_functions_of_site');
						functions_of_site[function_name]
						// 不覆蓋已經存在的 function。
						= _dependent_on[function_name];
					}
				})
			});
		});
	}

	function to_full_template_name(template_name, options) {
		var session = wiki_API.session_of_options(options);
		return session.is_namespace(template_name, 'Module') ? template_name
				: session.to_namespace(template_name, 'Template');
	}

	// 糾正 functions_of_site 之模板名稱至重定向標的。
	function correct_template_name(functions_of_site, options) {
		var session = wiki_API.session_of_options(options);
		// console.trace(functions_of_site);
		for (var template_name_list = Object.keys(functions_of_site), index = 0; index < template_name_list.length; index++) {
			var template_name = template_name_list[index];
			var full_name = to_full_template_name(template_name, options);
			var target_full_name = session.redirect_target_of(full_name);
			if (target_full_name === full_name)
				continue;
			if (session.is_namespace(full_name, 'Template')) {
				target_full_name = session.remove_namespace(target_full_name,
						options);
			}
			if (functions_of_site[target_full_name]) {
				if (functions_of_site[target_full_name] !== functions_of_site[template_name]) {
					library_namespace.warn('correct_template_name: '
							+ 'Copy configuration from ['
							+ to_full_template_name(template_name, options)
							+ '] to ['
							+ to_full_template_name(target_full_name, options)
							+ '] failed: Target exists.');
					if (false) {
						console
								.trace([
										to_full_template_name(template_name,
												options),
										functions_of_site[template_name],
										to_full_template_name(target_full_name,
												options),
										functions_of_site[target_full_name] ]);
					}
				}
				continue;
			}
			library_namespace.info('correct_template_name: '
					+ 'Copy configuration from ['
					+ to_full_template_name(template_name, options) + '] to ['
					+ to_full_template_name(target_full_name, options) + ']');
			functions_of_site[target_full_name] = functions_of_site[template_name];
		}
	}

	// @inner
	function initialize_session_template_functions(site_name, callback) {
		var session = this;
		var this_site_name = template_functions_site_name(session);
		site_name = site_name || template_functions_site_name(session);
		if (Array.isArray(site_name)) {
			site_name.forEach(function(_site_name) {
				initialize_session_template_functions
				//
				.call(session, _site_name);
			});
			callback && callback.call(session);
			return;
		}

		// assert: typeof site_name === 'string'

		// --------------------------------------

		// 登記好 site_name 以供 initialize_functions_of_site() 使用
		loaded_sites[site_name] = true;

		// --------------------------------------

		if (library_namespace.is_debug()) {
			library_namespace.info('initialize_session_template_functions: '
					+ 'register redirects of ' + site_name);
		}
		var function_name_list = Object
				.keys(template_functions.functions_of_all_sites);
		var functions_of_site = template_functions.functions_of_site[site_name];
		if (functions_of_site) {
			function_name_list.append(Object.keys(functions_of_site));
		}
		function_name_list.append(template_functions.biographical_templates);
		// console.trace(function_name_list);
		function_name_list.forEach(function(template_name) {
			var normalized_name = session.normalize_title(template_name);
			if (session.is_namespace(template_name, 'Template')
			//
			? template_name !== normalized_name : session
					.remove_namespace(template_name) !== session
					.remove_namespace(normalized_name)) {
				library_namespace.error([
						'initialize_session_template_functions: ',
						{
							// gettext_config:{"id":"must-rename-$1-to-$2-to-work"}
							T : [ '%1 必須更名為 %2 才能起作用！',
									JSON.stringify(template_name),
									JSON.stringify(normalized_name) ]
						} ]);
			}
		});
		// assert: (function_name_list.length > 0),
		// because template_functions.biographical_templates.length > 0
		function_name_list = function_name_list.map(function(name) {
			return to_full_template_name(name, session);
		});
		// console.trace([ site_name, function_name_list, functions_of_site ]);
		session.register_redirects(function_name_list, function() {
			// console.trace(site_name);
			correct_template_name(template_functions.functions_of_all_sites,
					session);
			if (functions_of_site)
				correct_template_name(functions_of_site, session);
			session.biographical_templates
			//
			= session.redirect_target_of(
			//
			template_functions.biographical_templates);
			// console.trace(session.biographical_templates);
		}, {
			// namespace : 'Template',
			no_message : true
		});

		// --------------------------------------

		initialize_functions_of_site(site_name);

		// --------------------------------------

		var dependent_on = functions_of_site
				&& functions_of_site[KEY_dependent_on];
		if (!dependent_on) {
			callback && callback.call(session);
			return;
		}

		if (library_namespace.is_debug()) {
			library_namespace.info('initialize_session_template_functions: 設定 '
					+ site_name + ' 採用 ' + dependent_on + ' 的模板特設功能。');
		}
		(Array.isArray(dependent_on) ? dependent_on : [ dependent_on ])
		//
		.forEach(function(_site_name) {
			if (!dependency_hash[_site_name])
				dependency_hash[_site_name] = [];
			dependency_hash[_site_name].push(site_name);
		});
		// console.trace(dependency_hash);
		session.load_template_functions(dependent_on, callback, true);
	}

	var module_name = this.id;

	function load_template_functions(site_name, callback) {
		var session = this;
		site_name = site_name || wiki_API.site_name(session);

		if (!site_name
		//
		&& (site_name = session && session.latest_site_configurations
		//
		&& session.latest_site_configurations.general.lang)) {
			site_name += 'wiki';

		} else if (!site_name) {
			throw new Error('load_template_functions: Cannot get site_name!');
		}

		var submodules = Array.isArray(site_name) ? site_name : [ site_name ];
		submodules = submodules.map(function(_site_name) {
			if (!_site_name
			// have been loaded
			|| template_functions.functions_of_site[_site_name]) {
				return;
			}

			return library_namespace.to_module_name(module_name
			//
			+ library_namespace.env.module_name_separator + _site_name);
		});
		// console.trace([ site_name, submodules ]);

		// 注意: 若已設定 `CeL.application.net.wiki.template_functions.zhwiki`，
		// 則不能採用匯添加 prefix `library_namespace.Class` 的
		// library_namespace.to_module_name()，否則會被忽略，不載入！
		library_namespace.run(submodules, initialize_session_template_functions
				.bind(session, site_name, callback));
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

	// wiki_API.parser.parser_prototype 會被複製到 instance 上。
	// 採用 library_namespace.set_method() 會無法列舉與複製，會出問題。
	Object.assign(wiki_API.parser.parser_prototype, {
		is_biography : page_is_biography
	});
	// console.trace(wiki_API.parser.parser_prototype.is_biography);

	Object.assign(template_functions, {
		/**
		 * functions configuration of site <code>
		functions_of_site[site_name] = {
			template_name : __template_configuration__
		}

		__template_configuration__ = function adapter() {};
		// 將會轉成:
		__template_configuration__ = { adapter : function adapter() {} };

		// 一般性:
		__template_configuration__ = {
			// TODO: 切分 adapter,m parser
			// adapter 兼 parser
			adapter : function parse_template_token(template_token, index, parsent, options) {
				// parse and create corresponding attributes
				token.property = ...
				// https://www.mediawiki.org/w/api.php?action=help&modules=expandtemplates
				token.expand = expandtemplates
			},
			// @see adapt_function
			properties : {
				expand : function expand(options) {}
			}
		};

		<code>
		 */
		functions_of_site : Object.create(null),
		functions_of_all_sites : Object.create(null),
		// wiki_API.template_functions.KEY_dependent_on
		// e.g., zhmoegirl 設定 dependent on [ 'zhwiki' ]
		// 必須是模板名稱不可能使用到的 key 值。
		KEY_dependent_on : KEY_dependent_on,
		adapt_function : adapt_function,

		set_proto_properties : set_proto_properties,

		// ----------------------------

		parse_conversions : parse_conversions,

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

	// 等執行再包含入必須的模組。
	this.finish = function(name_space, waiting, sub_modules_to_full_module_path) {
		// general_functions 必須在個別 wiki profiles 之前載入。
		// 如 CeL.application.net.wiki.template_functions.jawiki 依賴於
		// general_functions！
		library_namespace.run(
				sub_modules_to_full_module_path('general_functions'), waiting);
		return waiting;
	};

	return template_functions;
}
