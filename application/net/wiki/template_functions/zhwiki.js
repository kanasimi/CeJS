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
})

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.wiki.template_functions.zhwiki',

	require : 'data.native.' + '|application.net.wiki.'
	// load MediaWiki module basic functions
	+ '|application.net.wiki.namespace.'
	//
	+ '|application.net.wiki.parser.'
	//
	+ '|application.net.wiki.template_functions.',

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

	var module_site_name = this.id.match(/[^.]+$/)[0];

	// --------------------------------------------------------------------------------------------

	// template names: The first one is the main template name. 首個名稱為正式名稱。

	var zhwiki_Al_names = 'Al'.split('|').to_hash();

	// ------------------------------------------

	// [[w:zh:Template:Al]]
	function zhwiki_Al_toString() {
		return this.join('、');
	}

	function parse_zhwiki_Al_token(token, options) {
		if (!token || token.type !== 'transclusion'
				|| !(token.name in zhwiki_Al_names))
			return;

		var index = 0, page_title_list = [];
		// allow `{{al||title}}`
		while (index < token.length) {
			var page_title = token.parameters[++index];
			if (page_title)
				page_title_list.push(page_title);
		}
		page_title_list.toString = zhwiki_Al_toString;
		return page_title_list;
	}

	function expand_zhwiki_Al_token(token, options) {
		var page_title_list = parse_zhwiki_Al_token(token, options);
		return page_title_list.map(function(title) {
			return wiki_API.title_link_of(title);
		}).join('、');
	}

	function expand_zhwiki_A_token(token, options) {
		return '[[' + token.parameters[1]
		//
		+ (token.parameters.name ? '#' + token.parameters.name : '')
		//
		+ (token.parameters[2] ? '|' + token.parameters[2] : '') + ']]';
	}

	// --------------------------------------------------------------------------------------------

	// for {{簡繁轉換}} @ [[w:zh:簡繁轉換一對多列表]]
	function for_template_簡繁轉換(template_token) {
		function convert_to_string(parameter) {
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

			// 發音用 Pinyin diacritic-vowel combinations:
			// \u00E0-\u00FC [[w:en:Latin-1 Supplement (Unicode block)]]
			// \u0100-\u017F [[w:en:Latin Extended-A]]
			// \u01CD-\u01DC [[w:en:Latin Extended-B]]
			words = words
					.replace(
							/[（），、a-z\u00E0-\u00FC\u0100-\u017F\u01CD-\u01DC\uD800-\uDFFF]/g,
							'');
			if (false && /[^\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\u2E80-\u2EFF]/
					.test(words)) {
				// words.charCodeAt(0).toString(16)
				console.log([ words, words.replace(
				//
				/[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\u2E80-\u2EFF]/g,
				//
				'') ]);
				// throw words;
			}
			return words;
		}

		template_token.简 = convert_to_string('s');
		template_token.繁 = convert_to_string('t');
	}

	// ------------------------------------------------------------------------

	var template_functions_to_register = {
		簡繁轉換 : for_template_簡繁轉換
	};

	function initializer(session) {
		// console.assert(wiki_API.site_name(session) === module_site_name);
		session.register_redirects(Object.keys(template_functions_to_register),
		//
		register_template_functions.bind(session), {
			namespace : 'Template'
		});
	}

	// register template functions
	function register_template_functions() {
		// console.assert(wiki_API.site_name(this) === module_site_name);
		for ( var template_name in template_functions_to_register) {
			var template_processor = template_functions_to_register[template_name];
			template_name = this.remove_namespace(this
					.redirect_target_of('Template:' + template_name));
			this.template_functions_data[template_name] = template_processor;
		}
	}

	// --------------------------------------------------------------------------------------------

	// export 導出.

	wiki_API.template_functions.zhwiki = {
		Al : {
			names : zhwiki_Al_names,
			expand : expand_zhwiki_Al_token,
			parse : parse_zhwiki_Al_token
		},
		A : {
			expand : expand_zhwiki_A_token
		}
	};

	wiki_API.template_functions.set_expand_template('Al', 'zhwiki');
	wiki_API.template_functions.set_expand_template('A', 'zhwiki');

	// --------------------------------------------------------------------------------------------

	// register initializer
	wiki_API.template_functions.initialization_queue[module_site_name] = [ initializer ];

	// 不設定(hook)本 module 之 namespace，僅執行 module code。
	return library_namespace.env.not_to_extend_keyword;
}
