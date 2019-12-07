/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): 常用模板特設功能
 * 
 * 注意:本程式庫必須應各wiki模板內容改動而改寫。
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * TODO:<code>


</code>
 * 
 * @since 2019/12/4 7:16:34
 */

// More examples: see /_test suite/test.js
// Wikipedia bots demo: https://github.com/kanasimi/wikibot
'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.wiki.template_functions',

	require : 'data.native.'
	//
	+ '|application.net.wiki.parser.',

	// 設定不匯出的子函式。
	no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var wiki_API = library_namespace.net.wiki, KEY_SESSION = wiki_API.KEY_SESSION;
	// @inner
	// var is_api_and_title = wiki_API.is_api_and_title,
	// normalize_title_parameter = wiki_API.normalize_title_parameter;

	var to_exit = wiki_API.parser.parser_prototype.each.exit;

	// --------------------------------------------------------------------------------------------

	function get_parsed(page_data) {
		var parsed = typeof page_data.each === 'function'
		// `page_data` is parsed data
		? page_data : wiki_API.parser(page_data);

		return parsed;
	}

	function template_functions() {
	}

	// ------------------------------------------------------------------------

	// const
	// var NS_MediaWiki = CeL.wiki.namespace('MediaWiki');
	var NS_Module = CeL.wiki.namespace('Module');
	// var NS_Template = CeL.wiki.namespace('Template');

	// 汲取 page_data 中所有全局轉換（全頁面語言轉換），並交給 processor 處理。
	// processor({type: 'item', rule: '', original: ''})
	function parse_convention_item(page_data, processor) {
		if (!page_data)
			return 0;

		if (page_data.ns === NS_Module) {
			var object = wiki_API.parse.lua_object(page_data);
			var content = object && object.content;
			if (!Array.isArray(content)) {
				library_namespace
						.error('parse_convention_item: Invalid convention group: '
								+ wiki_API.title_link_of(page_data));
				return 0;
			}
			// console.log(content);
			content.forEach(function(item) {
				// console.log(item);
				// console.log(page_data);
				processor(item);
			});
			return content.length;
		}

		// console.log(page_data);

		var parsed;
		if (page_data.title
				&& page_data.title.startsWith('MediaWiki:Conversiontable/')) {
			// assert: page_data.ns === NS_MediaWiki
			parsed = wiki_API.parser(page_data.wikitext.replace(
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

		var count = 0;
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

			count++;
			return '{{CItem|' + token.replace(/=/g, '{{=}}') + '}}';
		}, true);
		if (count) {
			count = 0;
			// console.log(parsed.toString());

			// re-parse
			parsed = wiki_API.parser(parsed.toString());
		}
		// console.log(parsed.toString());

		function for_each_template(token) {
			// console.log(token);
			const item = {
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

			count++;
			// item = {type: 'item', rule: '', original: ''}
			processor(item);
		}

		parsed.each('template', for_each_template);

		return count;
	}

	// ------------------------------------------------------------------------

	var Hat_names = {
		TalkendH : true,
		Talkendh : true,
		Delh : true,
		Closereq : true,
		Hat : true,
		'Hidden archive top' : true
	};

	// https://zh.wikipedia.org/wiki/Template:TalkendH
	// [0]: 正式名稱。
	var result_flags__Hat = {
		// 快捷碼：關閉存廢討論

		// 請求無效
		rep : '重複提出，無效',
		ne : 'notexist|目標頁面或檔案不存在',
		nq : 'notqualified|提刪者未取得提刪資格',
		// 保留
		dan : '刪後重建',
		ic : '圖像因侵權被刪|ifd',
		// 快速刪除
		sd : '快速刪除',
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
		cr : '分類重定向',

		// 快捷碼：破壞
		del : '已刪除|相關頁面已刪除'
	};

	// https://zh.wikipedia.org/wiki/Template:Old_vfd_multi
	// [0]: 正式名稱。
	var result_flags__Old_vfd_multi = {
		k : 'keep|kept|保留',
		nc : 'no consensus|nc|無共識|无共识',
		m : 'moved|move|移動|移动',
		r : 'redirect|重定向',
		sk : 'speedy keep|快速保留|速留',
		ir : 'invalid request|無效|无效|請求無效',
		// '''請求理由已消失'''，页面'''保留''' reason disappeared
		rr : '請求理由消失',
		merge : 'merge|merged|併入|合併',
		d : 'delete|deleted|刪除',
		tk : 'temporarily keep|暫時保留|暂时保留'
	};

	function normalize_result_flag_sets(flag_sets) {
		for ( var flag in flag_sets)
			flag_sets[flag] = flag_sets[flag].split('|');
		// return flag_sets;
	}

	normalize_result_flag_sets(result_flags__Old_vfd_multi);
	normalize_result_flag_sets(result_flags__Hat);

	var Old_vfd_multi_names = {
		Oldafdfull : true,
		'Vfd-kept' : true,
		存廢討論被保留 : true,
		頁面存廢討論被保留 : true,
		'Old vfd multi' : true
	};

	function normalize_result_flag(flag_sets, result, valid_flag_only) {
		result = result && result.toString().trim().toLowerCase();
		if (result in flag_sets)
			return result;

		for ( var flag in flag_sets) {
			var flags = flag_sets[flag];
			if (flags.includes(result)) {
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

	function text_of_Hat_flag(flag, allow__Old_vfd_multi__flags) {
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

	function parse_Old_vfd_multi(page_data, processor, options) {
		options = library_namespace.setup_options(options);
		var parsed = get_parsed(page_data);

		parsed.each('template', function(token) {
			if (!(token.name in Old_vfd_multi_names))
				return;
			// {{Old vfd multi|提刪日期|處理結果|page=頁面名稱}}
			var result = token.parameters[2];
			result = normalize_result_flag(result_flags__Old_vfd_multi, result)
			// default flag: k|保留
			|| 'k';
			var item = {
				date : token.parameters[1],
				result : result,
				page : token.parameters.page,
				// move to, merge to, redirect to
				target : token.parameters[3]
			};

			if (token.parameters.multi) {
				item = [ item ];
				for (var i = 2; i < 9 && token.parameters['date' + i]; i++) {
					item.push({
						date : token.parameters['date' + i],
						result : token.parameters['result' + i] || '保留',
						page : token.parameters['page' + i],
						target : token.parameters['target' + i]
					});
					if (i > 5) {
						library_namespace.warn(
						//
						'parse_Old_vfd_multi: Invalid NO: ' + index);
					}
				}
			}

			if (options.using_data)
				item.page_data = page_data;
			else {
				// normalized page title
				item.page_title = page_data.title;
			}

			processor(item, page_data);
			processor = null;
			return to_exit;
		});

		if (processor) {
			// No Hat template found.
			processor(null, page_data);
		}
	}

	function replace_Old_vfd_multi(page_data, replace_to) {
		var parsed = get_parsed(page_data);

		parsed.each('template', function(token) {
			if (token.name in Old_vfd_multi_names)
				return replace_to;
		}, true);

		return parsed.toString();
	}

	// --------------------------------------------------------------------------------------------

	// export 導出.
	Object.assign(template_functions, {
		parse_convention_item : parse_convention_item,
		Hat : {
			names : Hat_names,
			text_of : text_of_Hat_flag
		},
		Old_vfd_multi : {
			parse : parse_Old_vfd_multi,
			replace_by : replace_Old_vfd_multi,
			text_of : text_of_Hat_flag
		}
	});

	return template_functions;
}
