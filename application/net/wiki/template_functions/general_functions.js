/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科):
 *       常用模板特設功能。本工具檔放置的是幾乎所有wiki計畫通用的模板，或者少數wiki計畫特有、且大量使用的著名模板。
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
	name : 'application.net.wiki.template_functions.general_functions',

	require : 'data.native.'
	// Should also load essential MediaWiki modules
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

	function empty_string(/* options */) {
		// var token = this;
		return '';
	}

	function trim_param(param) {
		return param.toString().trim();
	}

	// --------------------------------------------------------------------------------------------
	// token.expand() 可將模板轉換成一般 wiki 語法。
	// https://www.mediawiki.org/w/api.php?action=help&modules=expandtemplates
	// 用於 function preprocess_section_link_token()。

	// --------------------------------------------------------------------------------------------

	function expand_template_Void(options) {
		return '';
	}

	function parse_template_Void(token, index, parent, options) {
		token.expand = expand_template_Void;
	}

	// --------------------------------------------------------------------------------------------

	// {{color|英文顏色名稱或是RGB 16進制編碼|文字}}
	function expand_template_Color(options) {
		var parameters = this.parameters;
		return '<span style="color:' + (parameters[1] || '') + '">'
				+ (parameters[2] || parameters[1] || '') + '</span>';
	}

	function parse_template_Color(token) {
		token.expand = expand_template_Color;
	}

	// --------------------------------------------------------------------------------------------
	// 一些會添加 anchors 的特殊模板。

	// {{Anchor|anchor|別名1|別名2}}
	function expand_template_Anchor(options) {
		var parameters = this.parameters;
		var wikitext = [];
		for (/* let */var index = 1; index < this.length; index++) {
			var anchor = parameters[index];
			if (typeof anchor !== 'string') {
				// old jawiki {{Anchor}}
				// e.g., [[終着駅シリーズ]]: {{Anchor|[[牛尾正直]]}}
				// {{Anchor|A[[B]]}} → "AB"
				// anchor = wiki_API.wikitext_to_plain_text(anchor);
			}
			if (anchor) {
				// 多空格、斷行會被轉成單一 " "。
				anchor = anchor.replace(/[\s\n]{2,}/g, ' ');
				if (library_namespace.HTML_to_wikitext)
					anchor = library_namespace.HTML_to_wikitext(anchor);
				// class="anchor"
				wikitext.push('<span id="' + anchor + '"></span>');
			}
		}
		return wikitext.join('');
	}

	function parse_template_Anchor(token, index, parent, options) {
		token.expand = expand_template_Anchor;
	}

	// --------------------------------------------------------------------------------------------

	function expand_template_Visible_anchor(options) {
		var parameters = this.parameters;
		// {{Visible anchor}}（別名{{Vanc}}）は似たテンプレートですが、1個目のリンク先が表示されます。
		return expand_template_Anchor.call(this, options)
		// + '<span class="vanchor-text">'
		+ (parameters.text || parameters[1] || '')
		// + '</span>'
		;
	}

	function parse_template_Visible_anchor(token, index, parent, options) {
		token.expand = expand_template_Visible_anchor;
	}

	// --------------------------------------------------------------------------------------------

	function expand_template_Term(options) {
		var parameters = this.parameters;
		var wikitext = '<dt id="'
				+ wiki_API.wikitext_to_plain_text(
				//
				parameters.id || parameters.term || parameters[1] || '')
						.replace(/"/g, '').toLowerCase()
				+ '">'
				+ (parameters.content || parameters[2] || parameters.term
						|| parameters[1] || '') + '</dt>';
		// console.log(wikitext);
		return wikitext;
	}

	function parse_template_Term(token, index, parent, options) {
		token.expand = expand_template_Term;
	}

	// --------------------------------------------------------------------------------------------

	function expand_template_Wikicite(options) {
		var parameters = this.parameters;
		// class="citation wikicite"
		var wikitext = '<cite id='
				+ (parameters.ref || parameters.id
						&& ('"Reference-' + parameters.id + '"')) + '>'
				+ parameters.reference + '</cite>';
		// console.log(wikitext);
		return wikitext;
	}

	function parse_template_Wikicite(token, index, parent, options) {
		token.expand = expand_template_Wikicite;
	}

	// --------------------------------------------------------------------------------------------

	function expand_template_SfnRef(options) {
		var parameters = this.parameters;
		var anchor = 'CITEREF';
		for (var index = 1; index <= 5 && parameters[index]; index++) {
			anchor += trim_param(parameters[index]);
		}
		// TODO: test year

		// anchor = anchor.replace(/\s+/g, ' ');

		return anchor;
	}

	function parse_template_SfnRef(token, index, parent, options) {
		token.expand = expand_template_SfnRef;
	}

	// --------------------------------------------------------------------------------------------

	// @see local function sfn (frame) @
	// https://en.wikipedia.org/wiki/Module:Footnotes
	function expand_template_Sfn(options) {
		var parameters = this.parameters;
		var anchor = 'cite_ref-FOOTNOTE';
		for (var index = 1; index <= 5 && parameters[index]; index++) {
			anchor += trim_param(parameters[index]);
		}

		if (parameters.p)
			anchor += trim_param(parameters.p);
		if (parameters.pp)
			anchor += trim_param(parameters.pp);
		if (parameters.loc)
			anchor += trim_param(parameters.loc);

		anchor = anchor.replace(/\s+/g, ' ');

		var wikitext = [];
		var reference_index = 1;
		var pointer_index = 0;
		// TODO: 這個數值必須按照 reference_index 遞增。
		var ref_anchor = anchor + '-' + reference_index;
		wikitext.push('<ref name="' + ref_anchor + '">'
		// TODO: + content
		+ '</ref>',

		//
		'<a id="' + anchor + '_' + reference_index + '-'
		// TODO: 這個數值必須按照 pointer_index 遞增。
		+ pointer_index + '" href="#' + ref_anchor + '">'
		// TODO: 這個數值必須按照 reference_index 遞增。
		+ '[' + reference_index + ']' + '</a>');

		return wikitext.join('');
	}

	function parse_template_Sfn(token, index, parent, options) {
		token.expand = expand_template_Sfn;
	}

	// --------------------------------------------------------------------------------------------

	// export 導出.

	// general_functions 必須在個別 wiki profiles 之前載入。
	// 如 CeL.application.net.wiki.template_functions.jawiki 依賴於
	// general_functions！
	wiki_API.template_functions.functions_of_all_sites = {
		// 一些會添加 anchors 的特殊模板。
		Anchor : parse_template_Anchor,
		'Visible anchor' : parse_template_Visible_anchor,
		Term : parse_template_Term,
		Wikicite : parse_template_Wikicite,
		SfnRef : parse_template_SfnRef,
		// Sfn : parse_template_Sfn,

		Void : parse_template_Void,
		Color : parse_template_Color
	};

	// --------------------------------------------------------------------------------------------

	// 不設定(hook)本 module 之 namespace，僅執行 module code。
	return library_namespace.env.not_to_extend_keyword;
}
