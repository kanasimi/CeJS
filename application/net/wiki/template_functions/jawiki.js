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
	name : 'application.net.wiki.template_functions.jawiki',

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

	function expand_template_Enlink(options) {
		var parameters = this.parameters;
		var lang = parameters[3] || 'en';
		var wikitext;
		if (parameters.a === 'on') {
			wikitext = lang;
		} else {
			wikitext = (parameters[3] ? parameters[3] + ':' : '')
					+ (parameters[2] || parameters[1]);
			if (parameters.i === 'on')
				wikitext = "''" + wikitext + "''";
		}

		wikitext = '[[:' + lang + ':' + parameters[1]
		//
		+ '|' + wikitext + ']]';

		if (!parameters.p || parameters.p === 'on')
			wikitext = '&nbsp;(' + wikitext + '&nbsp;';
		if (!parameters.s || parameters.s === 'on')
			wikitext = '<small>' + wikitext + '</small>';
		return ' (' + parameters[1] + ')';
	}

	// --------------------------------------------------------------------------------------------

	function expand_template_to_display_language(options) {
		// console.trace(this.toString());
		var parameters = this.parameters;
		return parameters[1];
	}

	// --------------------------------------------------------------------------------------------

	function expand_template_拡張漢字(options) {
		var parameters = this.parameters;
		return parameters[2] || parameters[1];
	}

	// --------------------------------------------------------------------------------------------

	// 転送先のアンカーはTemplate:RFDの中に納まっている
	// e.g., {{RFD notice
	// |'''対象リダイレクト:'''[[Wikipedia:リダイレクトの削除依頼/受付#RFD長崎市電|長崎市電（受付依頼）]]|...}}
	function expand_template_RFD(options) {
		var parameters = this.parameters;
		// {{RFD|リダイレクト元ページ名|リダイレクト先ページ名}}
		return '<span id="RFD' + parameters[1] + '"></span>'
		// TODO: + ...
		;
	}

	expand_template_RFD.incomplete = 'Only for get_all_anchors()';

	// --------------------------------------------------------------------------------------------

	// export 導出.

	wiki_API.template_functions.functions_of_site[module_site_name] = {
		// 一些會產生網頁錨點 anchors 的模板或模組。
		// Templates or modules that generate web anchors
		Anchors : wiki_API.template_functions.functions_of_all_sites.Anchor,

		Enlink : {
			properties : {
				expand : expand_template_Enlink
			}
		},

		ARIB外字フォント : {
			properties : {
				expand : expand_template_to_display_language
			}
		},
		CP932フォント : {
			properties : {
				expand : expand_template_to_display_language
			}
		},
		JIS90フォント : {
			properties : {
				expand : expand_template_to_display_language
			}
		},
		JIS2004フォント : {
			properties : {
				expand : expand_template_to_display_language
			}
		},
		MacJapanese : {
			properties : {
				expand : expand_template_to_display_language
			}
		},
		変体仮名フォント : {
			properties : {
				expand : expand_template_to_display_language
			}
		},
		絵文字フォント : {
			properties : {
				expand : expand_template_to_display_language
			}
		},
		補助漢字フォント : {
			properties : {
				expand : expand_template_to_display_language
			}
		},
		通貨フォント : {
			properties : {
				expand : expand_template_to_display_language
			}
		},
		拡張漢字 : {
			properties : {
				expand : expand_template_拡張漢字
			}
		},

		RFD : {
			properties : {
				expand : expand_template_RFD
			}
		}
	};

	// --------------------------------------------------------------------------------------------

	// 不設定(hook)本 module 之 namespace，僅執行 module code。
	return library_namespace.env.not_to_extend_keyword;
}
