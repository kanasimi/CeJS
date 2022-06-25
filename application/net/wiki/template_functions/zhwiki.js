/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): 常用模板特設功能。本工具檔放置的是指定 wiki
 *       計畫特有的模板。
 * 
 * 注意: 本程式庫必須應各 wiki project 模板內容改動而改寫。
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * TODO:<code>

</code>
 * 
 * @since 2021/1/24 16:6:50
 */

// More examples: see /_test suite/test.js
// Wikipedia bots demo: https://github.com/kanasimi/wikibot
'use strict';
// 'use asm';

// @examples
(function() {
	require('./wiki loader.js');
	CeL.run('application.net.wiki.template_functions');
	var wiki = Wiki(true, 'zh');
	wiki.page('簡繁轉換一對多列表').parse(function(parsed) {
		// var page_data = parsed.page;
		parsed.each('Template:簡繁轉換', function(token) {
			console.log(token.简 + '⇄' + token.繁);
		});
	});
});

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.wiki.template_functions.zhwiki',

	require : 'data.native.'
	// Should also load essential MediaWiki modules
	+ '|application.net.wiki.',

	// 設定不匯出的子函式。
	no_extend : 'this,*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var wiki_API = library_namespace.application.net.wiki;
	// @inner
	// var is_api_and_title = wiki_API.is_api_and_title,
	// normalize_title_parameter = wiki_API.normalize_title_parameter;

	var to_exit = wiki_API.parser.parser_prototype.each.exit;

	// e.g., 'zhwiki'
	var module_site_name = this.id.match(/[^.]+$/)[0];

	function empty_string(/* options */) {
		// var token = this;
		return '';
	}

	// --------------------------------------------------------------------------------------------
	// token.expand() 可將模板轉換成一般 wiki 語法。
	// https://www.mediawiki.org/w/api.php?action=help&modules=expandtemplates
	// 用於 function preprocess_section_link_token()。

	// --------------------------------------------------------------------------------------------

	function expand_template_A(options) {
		var parameters = this.parameters;
		return '[[' + parameters[1]
		//
		+ (parameters.name ? '#' + parameters.name : '')
		//
		+ (parameters[2] ? '|' + parameters[2] : '') + ']]';
	}

	function parse_template_A(token, index, parent, options) {
		token.expand = expand_template_A;
	}

	// --------------------------------------------------------------------------------------------

	// [[w:zh:Template:Al]]
	function expand_template_Al(options) {
		var token = this;
		return token.page_title_list.map(function(title) {
			return wiki_API.title_link_of(title);
		}).join('、');
	}

	function parse_template_Al(token, index, parent, options) {
		var index = 0, page_title_list = [];
		while (index < token.length) {
			var page_title = token.parameters[++index];
			// allow `{{al||title}}`
			if (page_title)
				page_title_list.push(page_title);
		}

		Object.assign(token, {
			page_title_list : page_title_list,
			expand : expand_template_Al
		});
		return page_title_list;
	}

	// --------------------------------------------------------------------------------------------

	function parse_template_不存檔(token, index, parent, options) {
		token.message_expire_date = Infinity;
	}

	// --------------------------------------------------------------------------------------------

	// {{Lang|ja|參數值}} → -{參數值}-
	function expand_template_Lang(options) {
		var parameters = this.parameters;
		return /^(?:zh|gan)/.test(parameters[1]) ? parameters[2] : '-{'
				+ parameters[2] + '}-';
	}

	function parse_template_Lang(token, index, parent, options) {
		Object.assign(token, {
			expand : expand_template_Lang
		});
	}

	// --------------------------------------------------------------------------------------------

	// [[w:zh:Template:NoteTA]]
	function parse_template_NoteTA(token, options) {
		var conversion_list = Object.assign([], {
			// 固定轉換規則
			// fixed : [],

			// 公共轉換組
			groups : []
		});

		var index, value = token.parameters.T;
		if (value) {
			// 標題轉換
			conversion_list.title = value;
		}

		// TODO: {{NoteTA}} 使用「1=」可以同時轉換標題和正文？
		for (index = 1; index < token.length; index++) {
			value = token.parameters[index];
			if (!value)
				continue;
			// [[w:zh:模組:NoteTA]]
			// @see function item_to_conversion(item)
			value = wiki_API.parse('-{A|' + value + '}-', {
				normalize : true,
				with_properties : true
			});
			if (typeof value === 'string') {
				// 遇到無法轉換的值別 throw。 e.g., "a\nb"
				continue;
			}
			// value.parameter_name = index;
			value.index = token.index_of[index];
			// console.log(value);
			conversion_list.push(value);
		}

		// [[w:zh:Module:NoteTA]]
		for (index = 1; index < token.length; index++) {
			value = token.parameters['G' + index];
			if (!value)
				continue;
			conversion_list.groups.push(value);
			// TODO
		}

		Object.assign(token, {
			conversion_list : conversion_list,
			expand : empty_string
		});
		return conversion_list;
	}

	// --------------------------------------------------------------------------------------------

	function template_簡繁轉換_to_string(template_token, parameter) {
		var words = template_token.parameters[parameter];
		if (Array.isArray(words)) {
			words = words.map(function(token) {
				if (typeof token === 'string')
					return token;
				if (token.tag === 'sup') {
					// e.g., "<sup>台/陸繁</sup>"
					return '';
				}
				if (token.type === 'transclusion') {
					if (token.name === 'Lang'
					//
					&& typeof token.parameters[2] === 'string')
						return token.parameters[2];
					if (token.name === '僻字') {
						// console.log(token.toString());
					}
					if (token.name === '僻字'
					//
					&& typeof token.parameters[1] === 'string')
						return token.parameters[1];
				}
				throw new Error('包含無法處理的字元: ' + token);
			}).join('');
		}
		words = library_namespace.HTML_to_Unicode(words);
		// [[w:zh:Unicode字符平面映射]]
		// http://ubuntu-rubyonrails.blogspot.com/2009/06/unicode.html

		words = words.replace(
		// 發音用 Pinyin diacritic-vowel combinations:
		// \u00E0-\u00FC [[w:en:Latin-1 Supplement (Unicode block)]]
		// \u0100-\u017F [[w:en:Latin Extended-A]]
		// \u01CD-\u01DC [[w:en:Latin Extended-B]]
		/[（），、a-z\u00E0-\u00FC\u0100-\u017F\u01CD-\u01DC\uD800-\uDFFF]/g, '');
		if (false && /[^\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\u2E80-\u2EFF]/
				.test(words)) {
			// words.charCodeAt(0).toString(16)
			console.log([ words, words.replace(
			// 匹配中文字符的正則表達式
			/[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\u2E80-\u2EFF]/g,
			//
			'') ]);
			// throw words;
		}
		return words;
	}

	// for {{簡繁轉換}} @ [[w:zh:簡繁轉換一對多列表]]
	// @see wiki_API.convert_Chinese()
	function parse_template_簡繁轉換(token) {
		Object.assign(token, {
			简 : template_簡繁轉換_to_string(token, 's'),
			繁 : template_簡繁轉換_to_string(token, 't')
		});
	}

	// --------------------------------------------------------------------------------------------

	// export 導出.

	wiki_API.template_functions.functions_of_site[module_site_name] = {
		// 一些會用於章節標題的特殊模板。 for preprocess_section_link_token()
		A : parse_template_A,
		Al : parse_template_Al,

		// {{Do not archive}}
		// wiki/routine/20210429.Auto-archiver.js: avoid being archived
		不存檔 : parse_template_不存檔,

		Lang : parse_template_Lang,
		NoteTA : parse_template_NoteTA,
		簡繁轉換 : parse_template_簡繁轉換
	};

	// --------------------------------------------------------------------------------------------

	// 不設定(hook)本 module 之 namespace，僅執行 module code。
	return library_namespace.env.not_to_extend_keyword;
}
