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

	// {{#invoke:Number}} [[Module:Number]]
	function expand_template_數字性質列表(options) {
		var parameters = this.parameters;

		// function p.numberDivisorInformation(frame) @ [[Module:Number]]
		var white_index;
		var number_step = parameters.white_list || parameters['white list'];
		if (number_step) {
			white_index = Object.create(null);
			number_step.split(',').forEach(function(number) {
				white_index[+number] = true;
			});
		}

		var num_start = +parameters.start || 0;
		var num_end = +parameters.end || 0;

		if (wiki_API.Yesno(parameters['sort invert'] || parameters.sort_invert)) {
			// Swap start, end
			number_step = num_start;
			num_start = num_end;
			num_end = number_step;
			number_step = -1;
		} else {
			number_step = 1;
		}

		if (parameters.type === '少量列舉' || parameters.type === '複雜') {
			// function p.manyNumberInformation(frame) @ [[Module:Number]]
			white_index = null;
			num_start = +parameters[1];
			num_end = num_start + (parameters.count || 1) + 1;
			number_step = 1;
		}

		var wikitext = [];
		for (; number_step > 0 ? num_start <= num_end : num_start >= num_end; num_start += number_step) {
			if (white_index && !(num_start in white_index))
				continue;
			wikitext.push(';' + num_start + '<span id="' + num_start
					+ '"></span>');
		}

		return wikitext.join('\n');
	}

	expand_template_數字性質列表.incomplete = 'Only for get_all_anchors()';

	// --------------------------------------------------------------------------------------------

	function expand_template_A(options) {
		var parameters = this.parameters;
		return (parameters.name ? '<span id="' + parameters.name
		//
		+ '"></span>' : '') + '[[' + parameters[1]
		//
		+ (parameters[2] ? '|' + parameters[2] : '') + ']]';
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

	function expand_template_楷體(options) {
		var parameters = this.parameters;
		return '<span class="template-kai">' + (parameters[1] || '楷体')
				+ '</span>';
	}

	function parse_template_楷體(token, index, parent, options) {
		token.expand = expand_template_楷體;
	}

	// --------------------------------------------------------------------------------------------

	/**
	 * [[Template:Interlanguage link]] 跨語言模板 多語言模板。會為 token 增加下列屬性: <code>

	</code>
	 */
	var interlanguage_link_template_attributes = {
		// local_title: local title 中文條目名
		"local_page_title" : '',
		// 只會提供第一個。
		"foreign_language_code" : '',
		// 只會提供第一個。
		"foreign_page_title" : '',
		"foreign_page_mapper" : {
			// foreign_language: foreign language code 外文語言代號
			// foreign_title: foreign title 外文條目名
			foreign_language_code : 'foreign_page_title'
		},

		// label: label text displayed 顯示名
		"display_text" : '',
		// Keep foreign language links when displayed
		"preserve_foreign_links" : true,
		"wikidata_entity_id" : '' || 1,

		// 屬性的index，改變屬性值時使用。
		"attribute_index" : {
			"local_page_title" : 1,
			// 只會提供第一個。
			"foreign_language_code" : 1,
			// 只會提供第一個。
			"foreign_page_title" : 1,
			"display_text" : 1,
			"preserve_foreign_links" : 1,
			"wikidata_entity_id" : 1
		}
	};

	function setup_interlanguage_link_template_parameters(template_pattern) {
		var parsed_token = wiki_API.parse(template_pattern);
		var attribute_index = Object.create(null);
		var configuration = {
			attribute_index : attribute_index
		};
		var parameters = parsed_token.parameters;

		for ( var parameter in parameters) {
			var attribute_name = parameters[parameter];
			if (attribute_name in interlanguage_link_template_attributes)
				attribute_index[attribute_name] = parameter;
		}

		var functions_of_site = wiki_API.template_functions.functions_of_site[module_site_name];
		if (functions_of_site[parsed_token.name]) {
			library_namespace
					.error('setup_interlanguage_link_template_parameters: '
							+ '已設定' + parsed_token.name
							+ '之模板特設功能，無法設定跨語言模板功能。');
			return;
		}
		functions_of_site[parsed_token.name] = parse_interlanguage_link_template
				.bind(configuration);
	}

	function parse_interlanguage_link_template(token, index, parent, options) {
		var configuration = this;
		var attribute_index = configuration.attribute_index;
		var foreign_page_mapper = Object.create(null);

		for ( var attribute_name in attribute_index) {
			if (attribute_index[attribute_name] in token.parameters)
				token[attribute_name] = token.parameters[attribute_index[attribute_name]];
		}

		if ('foreign_language_code' in token)
			foreign_page_mapper[token.foreign_language_code] = token.foreign_page_title;

		token.attribute_index = attribute_index;
		token.foreign_page_mapper = foreign_page_mapper;
	}

	// --------------------------------------------------------------------------------------------
	// {{Lang|ja|參數值}} → -{參數值}-
	function expand_template_Lang(options) {
		var parameters = this.parameters;
		return /^(?:zh|gan)/.test(parameters[1]) ? parameters[2] : '-{'
				+ parameters[2] + '}-';
	}

	// --------------------------------------------------------------------------------------------

	// [[w:zh:Template:NoteTA]]
	function parse_template_NoteTA(token, options) {
		var conversion_list = Object.assign([], {
			// 固定轉換規則
			// fixed : [],

			// 公共轉換組
			group_data : [],
			groups : []
		});

		var index, value = token.parameters.T;
		if (value) {
			// 標題轉換
			conversion_list.title = value;
		}

		// TODO: {{NoteTA}} 使用「1=」可以同時轉換標題和正文(T=)？
		for (index = 1; index < token.length; index++) {
			value = token.parameters[index];
			if (!value)
				continue;
			// [[w:zh:模組:NoteTA]]
			// @see function item_to_conversion(item) @
			// CeL.application.net.wiki
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
			var parameter_name = 'G' + index;
			value = token.parameters[parameter_name];
			if (!value)
				continue;
			value = wiki_API.parse.wiki_element_to_key(value);
			var group_name_String;
			if (typeof value === 'string') {
				group_name_String = value = value.replace(/_/g, ' ').trim()
				// '\u200E\u200F'.trim().length === 2
				.replace(/^[\u200E\u200F\s]+/, '').replace(
						/[\u200E\u200F\s]+$/, '');
			} else {
				library_namespace.warn('parse_template_NoteTA: 非字串之公共轉換組名稱: ['
						+ value + '] @ ' + token);
				console.trace(value);
				group_name_String = value.toString().trim().replace(
						/^[\u200E\u200F\s]+/, '').replace(/[\u200E\u200F\s]+$/,
						'');
			}
			// console.trace([ value, group_name_String ]);
			conversion_list.groups.push(group_name_String);
			conversion_list.group_data[group_name_String] = {
				parameter_name : parameter_name,
				// Maybe {Ayyay} and includes "\n"、不可見字符
				group_name : value,
				group_name_String : group_name_String,
				index : token.index_of[parameter_name]
			};
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
		// 一些會產生網頁錨點 anchors 的模板或模組。
		// Templates or modules that generate web anchors
		'Invisible anchor' : {
			properties : {
				expand : wiki_API.template_functions.functions_of_all_sites.Anchor.properties.expand
			}
		},
		// {{#invoke:Number}} [[Module:Number]]
		數字性質列表 : {
			properties : {
				expand : expand_template_數字性質列表
			}
		},

		// 一些會用於章節標題的特殊模板。 for preprocess_section_link_token()
		A : {
			properties : {
				expand : expand_template_A
			}
		},
		Al : parse_template_Al,

		// {{Do not archive}}
		// wiki/routine/20210429.Auto-archiver.js: avoid being archived
		不存檔 : parse_template_不存檔,

		// [[Template:Interlanguage link]] 跨語言模板 多語言模板。

		Lang : {
			properties : {
				expand : expand_template_Lang
			}
		},
		NoteTA : parse_template_NoteTA,
		簡繁轉換 : parse_template_簡繁轉換
	};

	[ '{{Interlanguage link multi|local_page_title|foreign_language_code|foreign_page_title|lt=display_text|WD=wikidata_entity_id}}' ]
			.forEach(setup_interlanguage_link_template_parameters);

	// --------------------------------------------------------------------------------------------

	// 不設定(hook)本 module 之 namespace，僅執行 module code。
	return library_namespace.env.not_to_extend_keyword;
}
