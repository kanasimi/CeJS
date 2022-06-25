/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科):
 *       常用模板特設功能。本工具檔放置的是幾乎所有wiki計畫通用的模板，或者少數wiki計畫特有、且大量使用的著名模板。
 * 
 * 注意: 本程式庫必須應各 wiki project 模板內容改動而改寫。
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * <code>

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

	function expand_template_get_parameter_1(options) {
		var parameters = this.parameters;
		return parameters[1] ? parameters[1].toString() : '';
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

	// Not completed! Only for get_all_anchors()
	// @ zh.moegirl [[FLOWERS(Innocent Grey)]]
	function parse_template_Center(token) {
		token.expand = expand_template_get_parameter_1;
	}

	// --------------------------------------------------------------------------------------------

	// Not completed! Only for get_all_anchors()
	// @ zh.moegirl [[ARGONAVIS from BanG Dream! 翻唱曲列表]]
	function parse_template_Font(token) {
		token.expand = expand_template_get_parameter_1;
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

	// Not completed! Only for get_all_anchors()
	// @ zh.moegirl [[ARGONAVIS from BanG Dream! 翻唱曲列表]]
	function expand_template_Colored_link(options) {
		var parameters = this.parameters;
		// {{Colored link|顏色|頁面名稱鏈接|顯示名稱}}]
		return '[[:' + parameters[2] + '|<span style="color:' + parameters[1]
				+ '">' + (parameters[3] || parameters[2]) + '</span>]]';
	}

	function parse_template_Colored_link(token) {
		token.expand = expand_template_Colored_link;
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

	function parse_template_Pin_message(token, index, parent, options) {
		var parameters = token.parameters;
		var expire_date = parameters[1]
				&& wiki_API.parse.date(parameters[1], options);
		// console.trace([ expire_date, parameters ]);
		token.message_expire_date = expire_date || Infinity;
	}

	// --------------------------------------------------------------------------------------------

	// 有缺陷的簡易型 Lua patterns to JavaScript RegExp
	function Lua_pattern_to_RegExp_pattern(pattern) {
		return String(pattern).replace(/%l/g, 'a-z').replace(/%u/g, 'A-Z')
		// e.g., %d, %s, %S, %w, %W
		.replace(/%/g, '\\');
	}

	// https://en.wikipedia.org/wiki/Module:Check_for_unknown_parameters
	function check_template_for_unknown_parameters(template_token, options) {
		var valid_parameters = this.valid_parameters, valid_RegExp_parameters = this.valid_RegExp_parameters;
		var invalid_parameters = Object.keys(template_token.parameters)
		//
		.filter(function() {
			if (valid_parameters.has(parameter))
				return;
			return !valid_RegExp_parameters.some(function(pattern) {
				return pattern.test(parameter);
			});
		}, this);

		if (invalid_parameters.length === 0) {
			return;
		}

		var return_value = {
			invalid_parameters : invalid_parameters
		};
		var unknown_text = this.parameters.unknown || 'Found _VALUE_, ';
		var preview_text = this.parameters.preview;
		unknown_text = invalid_parameters.map(function(parameter) {
			return unknown_text.replace(/_VALUE_/g, parameter);
		}).join('').replace(/[,\s]+$/, '');
		if (preview_text) {
			preview_text = invalid_parameters.map(function(parameter) {
				return preview_text.replace(/_VALUE_/g, parameter);
			}).join('').replace(/[,\s]+$/, '');
		}
		return {
			invalid_parameters : invalid_parameters,
			preview_text : preview_text || unknown_text,
			unknown_text : unknown_text
		};
	}

	function parse_module_Check_for_unknown_parameters(token, index, parent,
			options) {
		var parameters = token.parameters, valid_parameters = token.valid_parameters = new Set, valid_RegExp_parameters = token.valid_RegExp_parameters = [];
		// { 1: "check for unknown parameters", 2: "check" }
		for (var index = 3; index < token.length; index++) {
			var value = parameters[index];
			if (value)
				valid_parameters.add(String(value));
			if (value = parameters['regexp' + index]) {
				try {
					value = new RegExp('^'
							+ Lua_pattern_to_RegExp_pattern(value) + '$');
					valid_RegExp_parameters.push(value);
				} catch (e) {
					library_namespace.error([
					//
					'parse_module_Check_for_unknown_parameters: ', {
						T : [
						// gettext_config:{"id":"cannot-convert-lua-pattern-to-regexp-pattern-$1"}
						'Cannot convert Lua pattern to RegExp pattern: %1',
						//
						value ]
					} ]);
				}
			}
		}
		token.check_template = check_template_for_unknown_parameters
				.bind(token);
	}

	// --------------------------------------------------------------------------------------------

	// export 導出.

	// general_functions 必須在個別 wiki profiles 之前載入。
	// 如 CeL.application.net.wiki.template_functions.jawiki 依賴於
	// general_functions！
	wiki_API.template_functions.functions_of_all_sites = {
		Void : parse_template_Void,
		Center : parse_template_Center,

		// 一些會用於章節標題的特殊模板。 for preprocess_section_link_token()
		Font : parse_template_Font,
		Color : parse_template_Color,
		'Colored link' : parse_template_Colored_link,

		// 一些會添加 anchors 的特殊模板。
		Anchor : parse_template_Anchor,
		'Visible anchor' : parse_template_Visible_anchor,
		Term : parse_template_Term,
		Wikicite : parse_template_Wikicite,
		// Sfn : parse_template_Sfn,
		SfnRef : parse_template_SfnRef,

		// wiki/routine/20210429.Auto-archiver.js: avoid being archived
		'Pin message' : parse_template_Pin_message,

		'Module:Check for unknown parameters' : parse_module_Check_for_unknown_parameters
	};

	// --------------------------------------------------------------------------------------------

	// 不設定(hook)本 module 之 namespace，僅執行 module code。
	return library_namespace.env.not_to_extend_keyword;
}
