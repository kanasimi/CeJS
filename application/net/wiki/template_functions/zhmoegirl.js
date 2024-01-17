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

	/**
	 * 忽略其他 parameters，直接拓展成第一個 parameter。<br />
	 * {{t|p|...}} → p
	 * 
	 * for preprocess_section_link_token()
	 * 
	 * Copy from CeL.application.net.wiki.template_functions.general_functions
	 */
	function expand_template_get_parameter_1(options) {
		var parameters = this.parameters;
		return parameters[1] ? parameters[1].toString() : '';
	}

	// --------------------------------------------------------------------------------------------

	// for get_all_anchors()
	function expand_template_A(options) {
		var parameters = this.parameters;
		// {{a|锚点名称|显示文字}}
		return '<span id="{{anchorencode:' + parameters[1] + '}}">'
				+ (parameters[2] || parameters[1]) + '</span>';
	}

	// --------------------------------------------------------------------------------------------

	// for get_all_anchors()
	function expand_template_MultiAnchor(options) {
		var parameters = this.parameters;
		// {{MultiAnchor|标记内容1|标记内容2|标记内容3|……}}
		var anchor_node_list = [];
		for (var index = 1; index < this.length; index++) {
			var anchor = parameters[index] && parameters[index].toString();
			if (anchor) {
				// @see [[Module:MultiAnchor]]
				anchor_node_list.push('<span id="' + anchor + '"></span>');
			}
		}
		// console.trace(anchor_node_list);
		return anchor_node_list.join('');
	}

	// --------------------------------------------------------------------------------------------

	// [[Module:Ruby]]
	function expand_module_Ruby(parameters) {
		// converted wikitext
		var wikitext = [];
		wikitext.push('<ruby'
				+ (parameters.id ? ' id="' + parameters.id + '"' : '') + '>');
		wikitext.push('<rb'
				+ (parameters.rbid ? ' id="' + parameters.rbid + '"' : '')
				+ '>' + (parameters[1] || '') + '</rb>');
		wikitext.push('（');
		wikitext.push('<rt'
				+ (parameters.rtid ? ' id="' + parameters.rtid + '"' : '')
				+ '>' + (parameters[2] || '') + '</rt>');
		wikitext.push('）');
		wikitext.push('</ruby>');
		return wikitext.join('');
	}

	// for get_all_anchors()
	function expand_template_Ruby(options) {
		var parameters = this.parameters;
		// {{Ruby|文字|注音|文字的語言标签|注音的語言标签}}
		return expand_module_Ruby(parameters);
	}

	// --------------------------------------------------------------------------------------------

	// for preprocess_section_link_token()
	// {{Lj|...}} 是日語{{lang|ja|...}}的縮寫 @ zh.moegirl
	function expand_template_Lj(options) {
		var parameters = this.parameters;
		return '-{' + parameters[1] + '}-';
	}

	// --------------------------------------------------------------------------------------------

	function expand_template_铁路车站名(options) {
		var parameters = this.parameters;
		return '<span id="' + (parameters.name || parameters[1]) + '">'
		// TODO: The content is skipped.
		+ '</span>';
	}

	expand_template_铁路车站名.incomplete = 'Only for get_all_anchors() @ [[ACGN作品中出場的鐵路車站列表]]';

	// --------------------------------------------------------------------------------------------

	function expand_template_ARGONAVIS_Icon(options) {
		// TODO: The content is skipped.
		return '';
	}

	expand_template_ARGONAVIS_Icon.incomplete = 'Only for get_all_anchors() as section title @ [[ARGONAVIS from BanG Dream! 翻唱曲列表]]';

	// --------------------------------------------------------------------------------------------

	function expand_template_Gradient_Text(options) {
		var parameters = this.parameters;
		// {{Gradient_Text|漸變色代碼|文字內容|title=鼠標懸停在文字上顯示的注釋}}
		return parameters[2] || '';
	}

	expand_template_Gradient_Text.incomplete = 'Only for get_all_anchors() @ [[FLOWERS(Innocent Grey)]]';

	// --------------------------------------------------------------------------------------------

	// export 導出.

	wiki_API.template_functions.functions_of_site[module_site_name] = {
		// 一些會產生網頁錨點 anchors 的模板或模組。
		// Templates or modules that generate web anchors
		A : {
			properties : {
				expand : expand_template_A
			}
		},
		MultiAnchor : {
			properties : {
				expand : expand_template_MultiAnchor
			}
		},
		Ruby : {
			properties : {
				expand : expand_template_Ruby
			}
		},
		铁路车站名 : {
			properties : {
				expand : expand_template_铁路车站名
			}
		},

		// 一些會用於章節標題的特殊模板。 for preprocess_section_link_token()
		Dead : {
			properties : {
				expand : expand_template_get_parameter_1
			}
		},
		黑幕 : {
			properties : {
				expand : expand_template_get_parameter_1
			}
		},
		Lj : {
			properties : {
				expand : expand_template_Lj
			}
		},
		'ARGONAVIS/Icon' : {
			properties : {
				expand : expand_template_ARGONAVIS_Icon
			}
		},
		'Gradient Text' : {
			properties : {
				expand : expand_template_Gradient_Text
			}
		}
	};

	// library_namespace.info(module_site_name + ': 採用 zhwiki 的模板特設功能設定。');
	wiki_API.template_functions.functions_of_site[module_site_name][wiki_API.template_functions.KEY_dependent_on] = [ 'zhwiki' ];

	// --------------------------------------------------------------------------------------------

	// 不設定(hook)本 module 之 namespace，僅執行 module code。
	return library_namespace.env.not_to_extend_keyword;
}
