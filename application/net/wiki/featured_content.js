/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): 特色內容特設功能。
 * 
 * 注意: 本程式庫必須應各wiki特色內容改動而改寫。
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * TODO:<code>



</code>
 * 
 * @since 2020/1/22 6:48:51
 */

// More examples: see /_test suite/test.js
// Wikipedia bots demo: https://github.com/kanasimi/wikibot
'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.wiki.featured_content',

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

	function featured_content() {
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

	// --------------------------------------------------------------------------------------------

	// export 導出.
	Object.assign(featured_content, {

	});

	set_expand_template('Al', 'zhwiki');
	set_expand_template('A', 'zhwiki');

	return featured_content;
}
