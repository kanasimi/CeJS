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

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.wiki.template_functions.zhmoegirl',

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

	// for get_all_anchors()
	function expand_template_A(options) {
		var parameters = this.parameters;
		// {{a|显示文字|锚点名称}}
		return '<span id="' + (parameters[2] || parameters[1])
				+ '">' + parameters[1] + '</span>';
	}

	function parse_template_A(token) {
		token.expand = expand_template_A;
	}

	// --------------------------------------------------------------------------------------------

	// for get_all_anchors() @ [[ARGONAVIS from BanG Dream! 翻唱曲列表]]
	function expand_template_ARGONAVIS_Icon(options) {
		return '';
	}

	function parse_template_ARGONAVIS_Icon(token) {
		token.expand = expand_template_ARGONAVIS_Icon;
	}

	// --------------------------------------------------------------------------------------------

	// for get_all_anchors() @ [[ARGONAVIS from BanG Dream! 翻唱曲列表]]
	function expand_template_Coloredlink(options) {
		var parameters = this.parameters;
		return '[[:' + parameters[2] + '|<span style="color:' + parameters[1] + '">' + (parameters[3] || parameters[2])
		+ '</span>]]';
	}

	function parse_template_Coloredlink(token) {
		token.expand = expand_template_Coloredlink;
	}

	// --------------------------------------------------------------------------------------------

	// export 導出.

	wiki_API.template_functions.functions_of_site[module_site_name] = {
		A : parse_template_A,
		'ARGONAVIS/Icon' : parse_template_ARGONAVIS_Icon,
		Coloredlink:parse_template_Coloredlink
	};

	// library_namespace.info(module_site_name + ': 採用 zhwiki 的模板特設功能設定。');
	wiki_API.template_functions.functions_of_site[module_site_name][wiki_API.template_functions.KEY_dependent_on] = [ 'zhwiki' ];

	// --------------------------------------------------------------------------------------------

	// 不設定(hook)本 module 之 namespace，僅執行 module code。
	return library_namespace.env.not_to_extend_keyword;
}
