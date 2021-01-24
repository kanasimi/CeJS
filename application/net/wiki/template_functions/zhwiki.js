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

	function for_template_簡繁轉換(template_token) {
		template_token.简 = template_token.parameters.s;
		template_token.繁 = template_token.parameters.t;
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

	// register initializer
	wiki_API.template_functions.initialization_queue[module_site_name] = [ initializer ];

	// 不設定(hook)本 module 之 namespace，僅執行 module code。
	return library_namespace.env.not_to_extend_keyword;
}
