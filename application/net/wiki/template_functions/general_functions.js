/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科):
 *       常用模板特設功能。本工具檔放置的是幾乎所有wiki計畫通用的模板，或者少數wiki計畫特有、且大量使用的著名模板。
 * 
 * 注意: 本程式庫必須應各 wiki project 模板內容改動而改寫。
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * <code>

TODO:
[[w:en:Wikipedia:Database reports/Templates transcluded on the most pages]]
[[w:en:Wikipedia:High-risk templates]]

</code>
 * 
 * @see [[Special:MostTranscludedPages]], [[Template:High-use]]
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
		// var template_token = this;
		return '';
	}

	function trim_param(param) {
		return param && param.toString().trim();
	}

	// --------------------------------------------------------------------------------------------
	// template_token.expand() 可將模板轉換成一般 wiki 語法。
	// https://www.mediawiki.org/w/api.php?action=help&modules=expandtemplates
	// 用於 function preprocess_section_link_token()。

	// --------------------------------------------------------------------------------------------

	/**
	 * 忽略其他 parameters，直接拓展成第一個 parameter。<br />
	 * {{t|p|...}} → p
	 * 
	 * for preprocess_section_link_token()
	 */
	function expand_template_get_parameter_1(options) {
		var parameters = this.parameters;
		return parameters[1] ? parameters[1].toString() : '';
	}

	// --------------------------------------------------------------------------------------------

	function expand_template_Void(options) {
		return '';
	}

	// --------------------------------------------------------------------------------------------

	function expand_template_At(options) {
		var parameters = this.parameters;
		return '[[File:At_sign.svg|' + (parameters[1] || 15) + 'px|link=]]';
	}

	// --------------------------------------------------------------------------------------------

	function expand_template_User_link(options) {
		var parameters = this.parameters;
		return '[[User:' + (parameters[1]) + '|'
				+ (parameters[2] || parameters[1]) + ']]';
	}

	// --------------------------------------------------------------------------------------------

	function expand_module_If_empty(options) {
		/* const */var token = options && options.template_token_called
				|| this;
		/* const */var parameters = token.parameters;
		// Error.stackTraceLimit = Infinity;
		// console.trace([ this, parameters, options ]);
		// console.trace(options && options.template_token_called);
		for (/* let */var index = 0; index < token.length; index++) {
			var value = parameters[index];
			if (value)
				return value;
		}
		return '';
	}

	// --------------------------------------------------------------------------------------------

	// {{color|英文顏色名稱或是RGB 16進制編碼|文字}}
	function expand_template_Color(options) {
		var parameters = this.parameters;
		return '<span style="color:' + (parameters[1] || '') + '">'
				+ (parameters[2] || parameters[1] || '') + '</span>';
	}

	// --------------------------------------------------------------------------------------------

	function expand_template_Colored_link(options) {
		var parameters = this.parameters;
		// {{Colored link|顏色|頁面名稱鏈接|顯示名稱}}]
		return '[[:' + parameters[2] + '|<span style="color:' + parameters[1]
				+ '">' + (parameters[3] || parameters[2]) + '</span>]]';
	}

	expand_template_Colored_link.incomplete = 'Only for get_all_anchors() @ zh.moegirl [[ARGONAVIS from BanG Dream! 翻唱曲列表]]';

	// --------------------------------------------------------------------------------------------
	// 一些會產生網頁錨點 anchors 的模板或模組。
	// Templates or modules that generate web anchors

	// @inner
	// var wikitext = tag_with_id.call(this, parameter_name, '__id__', 'div');
	function tag_with_id(parameter_name, pattern, tag_name) {
		var parameters = this.parameters;
		var id = wiki_API.wikitext_to_plain_text(
				parameters[parameter_name] || '').replace(/"/g, '');
		if (!id)
			return '';

		if (pattern) {
			if (typeof pattern === 'function')
				id = pattern(id);
			else if (typeof pattern === 'string')
				id = pattern.replace('__id__', id);
			else
				library_namespace.error('tag_with_id: Invalid pattern! '
						+ pattern);
		}

		if (!tag_name)
			tag_name = 'span';
		var wikitext = '<' + tag_name + ' id="' + rfcid.replace(/"/g, '')
				+ '">' + '</' + tag_name + '>';
		// console.trace(wikitext);
		return wikitext;
	}

	// {{Anchor|anchor|別名1|別名2}}
	function expand_template_Anchor(options) {
		var parameters = this.parameters;
		var wikitext = [];
		for (/* let */var index = 1; index < this.length; index++) {
			var anchor = parameters[index];
			if (!anchor) {
				continue;
			}

			if (typeof anchor !== 'string') {
				// e.g., `{{Anchor|{{u|Emojibot}}}}` @ zhwiki

				library_namespace.warn('expand_template_Anchor: 特殊 anchor: #'
						+ anchor);
				// console.trace(anchor);

				// old jawiki {{Anchor}}
				// e.g., [[終着駅シリーズ]]: {{Anchor|[[牛尾正直]]}}
				// {{Anchor|A[[B|C]]}} → "AC"
				anchor = wiki_API.wikitext_to_plain_text(anchor.toString());
			}

			// 多空格、斷行會被轉成單一 " "。
			anchor = anchor.replace(/[\s\n]{2,}/g, ' ');

			// class="anchor"
			wikitext.push('<span id="' + anchor + '"></span>');
		}
		return wikitext.join('');
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
		// console.trace(wikitext);
		return wikitext;
	}

	// --------------------------------------------------------------------------------------------

	function expand_template_Rfc(options) {
		var parameters = this.parameters;
		var wikitext = '<span id="rfctag"></span>';
		var rfcid = parameters.rfcid || '';
		if (rfcid) {
			rfcid = 'rfc_' + rfcid;
			wikitext = '<span id="' + rfcid + '">' + '</span>' + wikitext;
		}
		// console.trace(wikitext);
		return wikitext;
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

	// --------------------------------------------------------------------------------------------

	// @see createEpisodeNumberCellSecondary() @ [[Module:Episode list]]
	var EpisodeNumbers = [ 'EpisodeNumber', 'EpisodeNumber2', 'EpisodeNumber3' ];

	function expand_template_Episode_list(options) {
		// console.trace(this);
		var parameters = this.parameters;
		var anchor_prefix = this.anchor_prefix || '';
		var wikitext = [];
		for (var index = 0; index < EpisodeNumbers.length; index++) {
			var anchor = trim_param(parameters[EpisodeNumbers[index]]);
			// console.trace([ EpisodeNumbers[index], anchor ]);
			// @see getEpisodeText() @ [[Module:Episode list]]
			var matched = anchor && anchor.match(/^\w+/);
			if (matched) {
				anchor = matched[0];
				// 極度簡化版。
				wikitext.push('<th id="' + anchor_prefix + 'ep' + anchor
						+ '"></th>');
			}
		}

		// @see createProductionCodeCell() @ [[Module:Episode list]]
		var anchor = trim_param(parameters.ProdCode);
		if (anchor) {
			wikitext.push('<td id="' + 'pc' + wiki_API.plain_text(anchor)
					+ '"></td>');
		}

		// console.trace(wikitext);
		return wikitext.join('');
	}

	function expand_template_Episode_table(options) {
	}

	function parse_template_Episode_table(template_token, index, parent,
			options) {
		// template_token.expand = expand_template_Episode_table;

		var parameters = template_token.parameters;
		var episodes = parameters.episodes;
		var anchor_prefix = trim_param(parameters.anchor);
		// console.trace(anchor_prefix);
		if (anchor_prefix && episodes) {
			var session = wiki_API.session_of_options(options) || wiki_API;
			wiki_API.parser.parser_prototype.each.call(episodes,
			//
			'transclusion', function(template_token) {
				if (session.is_template(template_token, [ 'Episode list',
						'Episode list/sublist' ])) {
					template_token.anchor_prefix = anchor_prefix;
				}
			}, options);
		}
	}

	function expand_template_Episode_table__part(options) {
		var parameters = this.parameters;
		// console.trace(parameters);

		// [[Module:Episode table]]
		var id = trim_param(parameters.id);

		if (!id) {
			// partTypes
			[ 'Act', 'Chapter', 'Part', 'Volume', 'Week' ].forEach(function(
					prefix) {
				var value = parameters[prefix.toLowerCase()];
				if (value)
					id = prefix + ' ' + value;
			});

			if (parameters.subtitle) {
				id = (id ? id + ': ' : '') + parameters.subtitle;
			}
			// console.trace(id);
		}

		if (id) {
			return '<td id="' + wiki_API.plain_text(id) + '"></td>';
		}
	}

	// --------------------------------------------------------------------------------------------

	function expand_template_Track_listing(options) {
		// console.trace(this);
		var parameters = this.parameters;
		// `track_id = 'track%d',` @ [[Module:Track listing/configuration]]
		var anchor_prefix = 'track';
		var wikitext = [];
		// function p._main(args) @ [[Module:Track listing]]
		for ( var parameter_name in parameters) {
			var matched = parameter_name.match(/^(\D.*?)(\d+)$/);
			if (!matched)
				continue;
			var track_number = +matched[2];
			if (isNaN(track_number) || wikitext[track_number]
			// Allow numbers like 0, 1, 2 ..., but not 00, 01, 02...,
			|| track_number === 0 && matched[2] !== '0') {
				continue;
			}

			// `track_id = 'track%d',` @ [[Module:Track listing/configuration]]
			var anchor = anchor_prefix + track_number;
			// 極度簡化版。
			wikitext[track_number] = '<th id="' + anchor + '"></th>';
		}

		// console.trace(wikitext.join(''));
		return wikitext.join('');
	}

	// --------------------------------------------------------------------------------------------

	function expand_template_Football_box(options) {
		var parameters = this.parameters;
		// [[Module:Football box]]
		return '<div id="' + (parameters.id || '') + '">'
		// TODO: The content is skipped.
		+ '</div>';
	}

	expand_template_Football_box.incomplete = 'Only for get_all_anchors()';

	// --------------------------------------------------------------------------------------------

	function parse_template_Pin_message(template_token, index, parent, options) {
		var parameters = template_token.parameters, message_expire_date;
		if (parameters[1]) {
			options = library_namespace.new_options(options);
			options.get_timevalue = true;
			message_expire_date = wiki_API.parse.date(parameters[1], {
				get_timevalue : true,
			});
		}
		// console.trace([ message_expire_date, parameters ]);
		template_token.message_expire_date = message_expire_date || Infinity;
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
		for (var index = 1; index < token.length; index++) {
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

	function expand_module_IPAddress(options) {
		// console.trace(this);
		var parameters = this.parameters;
		// console.trace(parameters);
		if (this.function_name === 'isIp') {
			// [ , 'IPAddress', 'isIp', '...' ]
			var is_IP = library_namespace.is_IP(parameters[1]);
			return is_IP ? String(is_IP) : '';
		}
		// TODO:
	}

	// --------------------------------------------------------------------------------------------

	function expand_template_Template_link(options) {
		var parameters = this.parameters;
		return '&#123;&#123;[[Template:' + parameters[1] + '|' + parameters[1]
				+ ']]&#125;&#125;';
	}

	// --------------------------------------------------------------------------------------------

	// export 導出.

	// general_functions 必須在個別 wiki profiles 之前載入。
	// 如 CeL.application.net.wiki.template_functions.jawiki 依賴於
	// general_functions！
	wiki_API.template_functions.functions_of_all_sites = {
		Void : {
			properties : {
				expand : expand_template_Void
			}
		},
		Center : {
			properties : {
				expand : expand_template_get_parameter_1
			}
		},

		// 一些會用於章節標題的特殊模板。 for preprocess_section_link_token()
		Color : {
			properties : {
				expand : expand_template_Color
			}
		},
		'Colored link' : {
			properties : {
				expand : expand_template_Colored_link
			}
		},
		// Not completed! Only for get_all_anchors()
		// @ zh.moegirl [[ARGONAVIS from BanG Dream! 翻唱曲列表]]
		Font : {
			properties : {
				expand : expand_template_get_parameter_1
			}
		},

		'@' : {
			properties : {
				expand : expand_template_At
			}
		},
		'User link' : {
			properties : {
				expand : expand_template_User_link
			}
		},

		'Module:If empty' : {
			properties : {
				expand : expand_module_If_empty
			}
		},

		// 一些會產生網頁錨點 anchors 的模板或模組。
		// Templates or modules that generate web anchors
		Anchor : {
			properties : {
				expand : expand_template_Anchor
			}
		},
		'Module:Anchor' : {
			properties : {
				expand : expand_template_Anchor
			}
		},
		'Visible anchor' : {
			properties : {
				expand : expand_template_Visible_anchor
			}
		},
		Term : {
			properties : {
				expand : expand_template_Term
			}
		},
		Rfc : {
			properties : {
				expand : expand_template_Rfc
			}
		},
		Wikicite : {
			properties : {
				expand : expand_template_Wikicite
			}
		},
		// Citation : @see application/net/wiki/parser/section.js
		// Sfn : { properties : { expand : expand_template_Sfn } },
		SfnRef : {
			properties : {
				expand : expand_template_SfnRef
			}
		},
		/**
		 * <code>

		由於現在機器人還不能解析lua模組，在模板與模組的說明文件中應標示清楚其行為，就像像{{tl|Episode table}}一樣。這樣未來若有其他編輯者改變模板與模組的行為，就必須顧慮到受影響的機器人，並且會通知機器人操作者。
		Since robots are not yet able to parse lua modules, the behaviour of templates and modules should be clearly marked in their documentation, as in {{tl|Episode table}}. In this way, if another editor changes the behaviour of a template or module in the future, the affected robot will have to be taken into account and the robot operator will be notified.

		</code>
		 */
		'Episode table' : parse_template_Episode_table,
		'Module:Episode list' : {
			properties : {
				// e.g., [[w:en:Law & Order: Special Victims Unit (season 1)]]
				expand : expand_template_Episode_list
			}
		},
		'Episode table/part' : {
			properties : {
				expand : expand_template_Episode_table__part
			}
		},
		'Episode list' : {
			properties : {
				expand : expand_template_Episode_list
			}
		},
		'Episode list/sublist' : {
			properties : {
				expand : expand_template_Episode_list
			}
		},
		'Track listing' : {
			properties : {
				expand : expand_template_Track_listing
			}
		},

		'Football box' : {
			properties : {
				expand : expand_template_Football_box
			}
		},

		'Module:IPAddress' : {
			properties : {
				expand : expand_module_IPAddress
			}
		},

		// TODO
		// 'Module:Unsubst' : parse_module_Unsubst,

		// 'Template link'
		Tl : {
			properties : {
				expand : expand_template_Template_link
			}
		},

		// wiki/routine/20210429.Auto-archiver.js: avoid being archived
		'Pin message' : parse_template_Pin_message,

		'Module:Check for unknown parameters' : parse_module_Check_for_unknown_parameters
	};

	// --------------------------------------------------------------------------------------------

	// 不設定(hook)本 module 之 namespace，僅執行 module code。
	return library_namespace.env.not_to_extend_keyword;
}
