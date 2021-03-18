/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): wikitext parser
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * TODO:<code>

parser 所有子頁面加入白名單 white-list
parser 所有node當前之level層級
parser 提供 .previousSibling, .nextSibling, .parentNode 將文件結構串起來。
parser [[WP:維基化]] [[w:en:Wikipedia:AutoWikiBrowser/General fixes]] [[w:en:Wikipedia:WikiProject Check Wikipedia]]
https://www.mediawiki.org/wiki/API:Edit_-_Set_user_preferences

</code>
 * 
 * @since 2019/10/10 拆分自 CeL.application.net.wiki
 */

// More examples: see /_test suite/test.js
// Wikipedia bots demo: https://github.com/kanasimi/wikibot
'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.wiki.parser',

	require : 'application.net.wiki.'
	// load MediaWiki module basic functions
	+ '|application.net.wiki.namespace.'
	// for PATTERN_BOT_NAME
	+ '|application.net.wiki.task.'
	// CeL.DOM.HTML_to_Unicode(), CeL.DOM.Unicode_to_HTML()
	+ '|interact.DOM.',

	// 設定不匯出的子函式。
	no_extend : 'this,*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var wiki_API = library_namespace.application.net.wiki, KEY_SESSION = wiki_API.KEY_SESSION;
	// @inner
	var PATTERN_wikilink = wiki_API.PATTERN_wikilink, PATTERN_wikilink_global = wiki_API.PATTERN_wikilink_global, PATTERN_URL_prefix = wiki_API.PATTERN_URL_prefix, PATTERN_file_prefix = wiki_API.PATTERN_file_prefix, PATTERN_URL_WITH_PROTOCOL_GLOBAL = wiki_API.PATTERN_URL_WITH_PROTOCOL_GLOBAL, PATTERN_category_prefix = wiki_API.PATTERN_category_prefix, PATTERN_BOT_NAME = wiki_API.PATTERN_BOT_NAME;

	var
	/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
	NOT_FOUND = ''.indexOf('_');

	// --------------------------------------------------------------------------------------------
	// parse wikitext.

	/**
	 * 不包含可 parse 之要素，不包含 text 之 type。<br />
	 * 不應包含 section title，因可能有 "==[[]]==" 的情況。
	 * 
	 * @type {Object}
	 */
	var atom_type = {
		namespace : true,
		// https://phabricator.wikimedia.org/T173889
		page_title : true,
		// external_link : true,
		url : true,
		style : true,
		tag_single : true,
		comment : true
	};

	// tree level
	var KEY_DEPTH = 'depth';

	/**
	 * 設定 token 為指定 type。將 token 轉為指定 type。
	 * 
	 * @param {Array}token
	 *            parse_wikitext() 解析 wikitext 所得之，以 {Array} 組成之結構。
	 * @param {String}type
	 *            欲指定之類型。 e.g., 'transclusion'.
	 * 
	 * @returns {Array}token
	 * 
	 * @see wiki_toString
	 */
	function set_wiki_type(token, type, parent) {
		// console.trace(token);
		if (typeof token === 'string') {
			token = [ token ];
		} else if (!Array.isArray(token)) {
			library_namespace.warn('set_wiki_type: The token is not Array!');
		} else if (token.type && token.type !== 'plain') {
			// 就算 token.type !== type，可能是 <span> 中嵌套 <span> 的形式，
			// 不該直接 `return token` 。

			// 預防token本來就已經有設定類型。
			token = [ token ];
		}
		// assert: Array.isArray(token)
		token.type = type;
		if (type in atom_type) {
			token.is_atom = true;
		}
		// check
		if (false && !wiki_toString[type]) {
			throw new Error('.toString() not exists for type [' + type + ']!');
		}

		token.toString = wiki_toString[type];
		// Object.defineProperty(token, 'toString', wiki_toString[type]);

		if (false) {
			var depth;
			if (parent >= 0) {
				// 當作直接輸入 parent depth。
				depth = parent + 1;
			} else if (parent && parent[KEY_DEPTH] >= 0) {
				depth = parent[KEY_DEPTH] + 1;
			}
			// root 的 depth 為 (undefined|0)===0
			token[KEY_DEPTH] = depth | 0;
		}

		return token;
	}

	/*
	 * should use: class Wiki_page extends Array { }
	 * http://www.2ality.com/2015/02/es6-classes-final.html
	 */

	/**
	 * constructor (建構子) of {wiki page parser}. wikitext 語法分析程式, wikitext 語法分析器.
	 * 
	 * TODO:<code>

	should use:
	parsetree of https://www.mediawiki.org/w/api.php?action=help&modules=expandtemplates
	or
	https://www.mediawiki.org/w/api.php?action=help&modules=parse

	class Wiki_page extends Array { }
	http://www.2ality.com/2015/02/es6-classes-final.html

	</code>
	 * 
	 * @param {String|Object}wikitext
	 *            wikitext / page data to parse
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {wiki page parser}
	 */
	function page_parser(wikitext, options) {
		// console.log(wikitext);
		// console.log(wiki_API.is_page_data(wikitext));
		if (typeof wikitext === 'string') {
			wikitext = [ wikitext ];
		} else if (wiki_API.is_page_data(wikitext)) {
			// 可以用 "CeL.wiki.parser(page_data).parse();" 來設置 parser。
			var page_data = wikitext;
			if (!page_data.parsed
			// re-parse
			|| options && (options.reparse || options.wikitext)) {
				wikitext = options && options.wikitext
						|| wiki_API.content_of(page_data, options || 0);
				// prevent wikitext === undefined (missing: '')
				wikitext = wikitext ? [ wikitext ] : [];
				page_data.parsed = wikitext;
				wikitext.page = page_data;
			} else {
				return page_data.parsed;
			}
		} else if (!wikitext) {
			library_namespace.warn('page_parser: No wikitext specified.');
			wikitext = [];
		} else if (!Array.isArray(wikitext)) {
			throw new Error('page_parser: Unknown wikitext: {'
					+ typeof wikitext + '} ' + JSON.stringify(wikitext) + '.');
		}

		if (typeof options === 'string') {
			options = library_namespace.setup_options(options);
		}

		if (library_namespace.is_Object(options)) {
			wikitext.options = options;
		}
		// copy prototype methods
		Object.assign(wikitext, page_parser.parser_prototype);
		set_wiki_type(wikitext, 'plain');
		var session = wiki_API.session_of_options(options);
		if (session) {
			wiki_API.add_session_to_options(session, wikitext);
		}
		// console.trace(wikitext);
		return wikitext;
	}

	/** {Object}prototype of {wiki page parser}, CeL.wiki.parser.parser_prototype */
	page_parser.parser_prototype = {
		each_section : for_each_section,

		// traversal_tokens()
		// CeL.wiki.parser.parser_prototype.each.call(token_list,...)
		// 在執行 .each() 之前，應該先執行 .parse()。
		each : for_each_token,
		parse : parse_page,
		parse_references : parse_references,
		insert_before : insert_before
	};

	/** {Object}alias name of type */
	page_parser.type_alias = {
		wikilink : 'link',
		weblink : 'external_link',
		table_caption : 'caption',
		row : 'table_row',
		tr : 'table_row',
		// 注意: table_cell 包含 th + td，須自行判別！
		th : 'table_cell',
		td : 'table_cell',
		template : 'transclusion',
		// wikitext, 'text': plain text
		text : 'plain',
		'' : 'plain'
	};

	// CeL.wiki.parser.footer_order()
	page_parser.footer_order = footer_order;

	// ------------------------------------------------------------------------

	function is_valid_parameters_value(value) {
		return value
		// e.g., .text === ''
		// String(value) === ''
		|| value === '' || value === 0;
	}

	wiki_API.is_valid_parameters_value = is_valid_parameters_value;

	// 僅添加有效的 parameters。基本上等同於 Object.assign()，只是不添加無效值。
	function set_template_object_parameters(template_object, parameters,
			value_mapper) {
		if (!template_object)
			template_object = Object.create(null);

		for ( var key in parameters) {
			var value = parameters[key];
			if (value_mapper)
				value = value_mapper[value];
			// 不添加無效值。
			if (is_valid_parameters_value(value)) {
				template_object[key] = value;
			}
		}

		return template_object;
	}

	/**
	 * 將 parameters 形式的 object 轉成 wikitext。
	 * 
	 * @example<code>

	CeL.wiki.parse.template_object_to_wikitext('t', {
		1 : 'v1',
		2 : 'v2',
		p1 : 'vp1',
		p2 : 'vp2'
	}) === '{{t|v1|v2|p1=vp1|p2=vp2}}';

	CeL.wiki.parse.template_object_to_wikitext('t', {
		1 : 'v1',
		2 : 'v2',
		4 : 'v4',
		p1 : 'vp1'
	}) === '{{t|v1|v2|4=v4|p1=vp1}}';

	CeL.wiki.parse.template_object_to_wikitext('t', {
		1 : 'v1',
		2 : 'v2',
		p1 : 'vp1',
		q2 : 'vq2'
	}, function(text_array) {
		return text_array.filter(function(text, index) {
			return !/^q/.test(text);
		});
	}) === '{{t|v1|v2|p1=vp1}}';

	 </code>
	 * 
	 * @param {String}template_name
	 *            template name
	 * @param {Object}template_object
	 *            parameters 形式的 object。<br />
	 *            e.g., { '1': value, '2': value, parameter1 : value1 }
	 * @param {Object}[post_processor]
	 *            post-processor for text_array
	 */
	function template_object_to_wikitext(template_name, template_object,
			post_processor) {
		var text_array = [ '{{' + template_name ], index = 1;

		while (true) {
			var value = template_object[index];
			if (!is_valid_parameters_value(value)) {
				break;
			}

			if (false && typeof value !== 'string') {
				value = typeof value.toString === 'function' ? value.toString()
						: String(value);
			}
			value = String(value);

			if (value.includes('='))
				value = index + '=' + value;

			// text_array.push(value); index++;
			text_array[index++] = value;
		}

		for ( var key in template_object) {
			if (key in text_array)
				continue;
			var value = template_object[key];
			if (is_valid_parameters_value(value)) {
				value = String(value);
				if (value.includes('\n')
						&& !text_array[text_array.length - 1].endsWith('\n')) {
					text_array[text_array.length - 1] += '\n';
				}
				text_array.push(key + '=' + value);
			}
		}

		if (post_processor) {
			// text_array = [ '{{template_name', 'parameters', ... ]
			// 不包含 '}}' !
			text_array = post_processor(text_array);
		}

		return text_array.join('|') + '}}';
	}

	// ------------------------------------------

	var KEY_remove_parameter = {
		remove_parameter : true
	};
	replace_parameter.KEY_remove_parameter = KEY_remove_parameter;

	function to_parameter_name_only(parameter_name_pairs) {
		var config = Object.create(null);
		Object.keys(parameter_name_pairs)
		//
		.forEach(function(from_parameter_name) {
			var to_parameter_name = parameter_name_pairs[from_parameter_name];
			if (typeof to_parameter_name === 'string'
			//
			|| typeof to_parameter_name === 'number') {
				config[from_parameter_name] = function(value) {
					var config = Object.create(null);
					config[to_parameter_name] = value;
					return config;
				};
			} else if (to_parameter_name === KEY_remove_parameter) {
				config[from_parameter_name] = to_parameter_name;
			} else {
				library_namespace.error(
				//
				'to_parameter_name_only: Replace to invalid parameter name: '
				//
				+ to_parameter_name);
			}
		});
		return config;
	}

	function mode_space_of_parameters(template_token, parameter_name) {
		if (false) {
			template_token.forEach(function(parameter, index) {
				if (index === 0)
					return;
				// TODO: 分析模板參數的空白模式典型。
				// return |$0parameter$1=$2value$3|
			});
		}

		var index = template_token.index_of[parameter_name];
		if (!(index >= 0)) {
			// 不存在此 parameter name 可 replace。
			return;
		}

		var this_parameter = template_token[index];
		// 判斷上下文使用的 spaces。
		var spaces = this_parameter[0];
		if (Array.isArray(spaces)) {
			spaces = spaces[0];
		}
		spaces = typeof spaces === 'string' ? spaces.match(/^\s*/)[0] : '';

		/**
		 * 保留屬性質結尾的排版:多行保留行先頭的空白，但不包括末尾的空白。單行的則留最後一個空白。 preserve spaces for:
		 * <code>

		{{T
		 | 1 = 1
		 | 2 = 2
		 | 3 = 3
		}}

		</code>
		 */
		// var spaces = template_token[index].toString().match(/(\n *| ?)$/);
		//
		// parameter: spaces[0] + key + spaces[1] + value + spaces[2]
		spaces = [ spaces,/* " = " */this_parameter[1], /* spaces[1] */
		this_parameter[3] || '' ];

		return spaces;
	}

	/**
	 * 將 parse_wikitext() 獲得之 template_token 中的指定 parameter 換成 replace_to。
	 * replace_template_parameter(), set_parameter()
	 * 
	 * WARNING: 若不改變 parameter name，只變更 value，<br />
	 * 則應該使用 { value_only: true }，<br />
	 * 或使用 'parameter name = value' 而非僅 'value'。
	 * 
	 * @example<code>

	// replace value only
	CeL.wiki.parse.replace_parameter(token, {
		parameter_name : 'parameter name 3=replace to value',
		parameter_name_2 : 'parameter name 4=replace to value_2',
	}, 'value_only');

	CeL.wiki.parse.replace_parameter(token, {
		parameter_name : 'replace_to_value',
		parameter_name_2 : 'replace_to_value_2',
	}, { value_only : true, force_add : true, append_key_value : true });

	// replace value only: old style 舊格式
	CeL.wiki.parse.replace_parameter(token, parameter_name,
		{ parameter_name : replace_to_value }
	);

	// {{T|p=v|n=v}} → {{T|V|n=v}}
	CeL.wiki.parse.replace_parameter(token, 'p', 'V');
	// replace `replace_from_parameter_name = *` to "replace to wikitext"
	CeL.wiki.parse.replace_parameter(token, replace_from_parameter_name,
		"replace to wikitext"
	);

	// replace parameter name only
	CeL.wiki.parse.replace_parameter(token, replace_from_parameter_name,
		value => {
			return { replace_to_parameter_name : value };
		}
	);
	CeL.wiki.parse.replace_parameter(token, {
		parameter_1 : replace_to_parameter_1,
		parameter_2 : replace_to_parameter_2,
	}, 'parameter_name_only');

	// replace parameter name: 不在乎 spaces 的版本。
	CeL.wiki.parse.replace_parameter(token, replace_from_parameter_name,
		value => replace_from_parameter_name + '=' + value
	);

	// replace 1 parameter to 2 parameters
	CeL.wiki.parse.replace_parameter(token, replace_from_parameter_name,
		original_value => {
			parameter_1 : value_1,
			parameter_2 : original_value,
		}
	);

	// multi-replacement
	CeL.wiki.parse.replace_parameter(token, {
		replace_from_1 : replace_to_config_1,
		replace_from_2 : replace_to_config_2,
	});

	 </code>
	 * 
	 * @see 20190912.fix_Infobox_company.js, 20190913.move_link.js
	 * 
	 * @param {Array}template_token
	 *            由 parse_wikitext() 獲得之 template_token
	 * @param {String}parameter_name
	 *            指定屬性名稱 parameter name
	 * @param {String|Number|Array|Object|Function}replace_to
	 *            要換成的屬性名稱加上賦值。 e.g., "parameter name = value" ||<br />
	 *            {parameter_1 = value, parameter_2 = value} ||<br />
	 *            function replace_to(value, parameter_name, template_token)
	 * 
	 * @returns {ℕ⁰:Natural+0} count of successful replacement
	 */
	function replace_parameter(template_token, parameter_name, replace_to) {
		if (library_namespace.is_Object(parameter_name)) {
			// treat `replace_to` as options
			var options = library_namespace.setup_options(replace_to);
			// Replace parameter name only, preserve value.
			if (options.parameter_name_only) {
				parameter_name = to_parameter_name_only(parameter_name);
			}

			var count = 0, latest_OK_key, key_of_spaces, spaces, next_insert_index;
			for ( var replace_from in parameter_name) {
				replace_to = parameter_name[replace_from];
				var index = template_token.index_of[replace_from];
				if (!(index >= 0)) {
					// 不存在此 parameter name 可 replace。
					if (options.value_only && options.force_add) {
						if ((!key_of_spaces || key_of_spaces !== latest_OK_key)
						//
						&& (key_of_spaces = options.append_key_value
						//
						&& latest_OK_key
						// mode_parameter
						|| Object.keys(template_token.parameters).pop())) {
							spaces = mode_space_of_parameters(template_token,
									key_of_spaces);
							// console.log(spaces);
						}
						replace_to = spaces && spaces[1] ? spaces[0]
								+ replace_from + spaces[1] + replace_to
								+ spaces[2] : replace_from + '=' + replace_to;
						if (options.append_key_value && next_insert_index >= 0) {
							// 警告: 這會使 template_token[next_insert_index]
							// 不合正規格式！但能插入在最接近前一個插入點之後。
							template_token[next_insert_index] += '|'
									+ replace_to;
						} else {
							template_token.push(replace_to);
						}
					}
					continue;
				}

				var skip_replacement;
				if (options.value_only
						&& (typeof replace_to === 'string' || typeof replace_to === 'number')) {
					var this_parameter = template_token[template_token.index_of[replace_from]];
					// keep spaces and parameter name.
					// e.g., "| key<!---->=1 |" → "| key<!---->=2 |"
					// NOT: "| key<!---->=1 |" → "| key=2 |"
					this_parameter[2] = replace_to;
					skip_replacement = 1;

					// @deprecated:
					// replace_to = { [_replace_from] : replace_to };
					// replace_to = Object.create(null);
					// replace_to[replace_from] = replace_to;
				}

				latest_OK_key = replace_from;
				next_insert_index = index;
				// console.trace([ replace_from, replace_to ]);
				if (skip_replacement) {
					count += skip_replacement;
					continue;
				}
				count += replace_parameter(template_token, replace_from,
						replace_to);
			}
			return count;
		}

		// --------------------------------------

		var index = template_token.index_of[parameter_name];
		if (!(index >= 0)) {
			// 不存在此 parameter name 可 replace。
			return 0;
		}

		if (typeof replace_to === 'function') {
			// function replace_to(value, parameter_name, template_token)
			replace_to = replace_to(template_token.parameters[parameter_name],
					parameter_name, template_token);
		}

		if (replace_to === undefined) {
			return 0;
		}

		if (replace_to === KEY_remove_parameter) {
			if (isNaN(parameter_name)) {
				// remove the parameter
				template_token.splice(index, 1);
				replace_to = parse_wikitext(template_token.toString());
				Object.clone(replace_to, false, template_token);
			} else {
				// For numeral parameter_name, just replace to empty value.
				template_token[index] = '';
				// Warning: this will NOT change .index_of , .parameters !
				while (!template_token[template_token.length - 1])
					template_token.pop();
			}
			return 1;
		}

		// --------------------------------------
		// 判斷上下文使用的 spaces。

		var spaces = mode_space_of_parameters(template_token, parameter_name);
		// console.trace(spaces);
		// console.trace(replace_to);

		// --------------------------------------
		// 正規化 replace_to。

		if (library_namespace.is_Object(replace_to)) {
			// console.trace(replace_to);
			replace_to = Object.keys(replace_to).map(function(key) {
				var value = replace_to[key];
				if (!key) {
					library_namespace.warn('Including empty key: '
					//
					+ JSON.stringify(replace_to));
					key = parameter_name;
				}
				// TODO: using is_valid_parameters_value(value)
				return spaces[1] ? spaces[0] + key + spaces[1] + value
				//
				+ spaces[2] : key + '=' + value;
			});
		}
		if (Array.isArray(replace_to)) {
			replace_to = replace_to.join('|');
		} else {
			replace_to = replace_to.toString();
		}

		// assert: {String}replace_to
		// console.trace(replace_to);

		if (!spaces[1] && !isNaN(parameter_name)) {
			var matched = replace_to.match(/^\s*(\d+)\s*=\s*([\s\S]*)$/);
			if (matched && matched[1] == parameter_name) {
				// e.g., replace [2] to non-named 'value' in {{t|1|2}}
				library_namespace.debug('auto remove numbered parameter: '
				// https://www.mediawiki.org/wiki/Help:Templates#Numbered_parameters
				+ parameter_name, 3, 'replace_parameter');
				// console.trace([ replace_to, matched ]);
				replace_to = matched[2];
			}
		}

		if (spaces[2].includes('\n') && !/\n\s*?$/.test(replace_to)) {
			// Append new-line without tail "|"
			replace_to += spaces[2];
		}

		if (template_token[index]
				&& template_token[index].toString() === replace_to) {
			// 不處理沒有變更的情況。
			return 0;
		}

		// TODO: 不處理僅添加空白字元的情況。

		// --------------------------------------
		// a little check: parameter 的數字順序不應受影響。

		var PATERN_parameter_name = /(?:^|\|)[\s\n]*([^=\s\n][\s\S]*?)=/;
		if (index + 1 < template_token.length) {
			// 後面沒有 parameter 了，影響較小。
		} else if (isNaN(parameter_name)) {
			// TODO: NG: {{t|a=a|1}} → {{t|a|1}}
			if (!PATERN_parameter_name.test(replace_to)) {
				library_namespace
						.warn('replace_parameter: Insert named parameter and disrupt the order of parameters? '
								+ template_token);
			}
		} else {
			// NG: {{t|a|b}} → {{t|a=1|b}}
			var matched = replace_to.match(PATERN_parameter_name);
			if (!matched) {
				if (index != parameter_name) {
					library_namespace
							.warn('replace_parameter: Insert non-named parameter to ['
									+ parameter_name
									+ '] and disrupt the order of parameters? '
									+ template_token);
				}
			} else if (matched[1].trim() != parameter_name) {
				library_namespace
						.warn('replace_parameter: Insert numerical parameter name and disrupt the order of parameters? '
								+ template_token);
			}
		}

		// --------------------------------------

		library_namespace.debug(parameter_name + ': "' + template_token[index]
				+ '"→"' + replace_to + '"', 2, 'replace_parameter');
		template_token[index] = replace_to;

		return 1;
	}

	// ------------------------------------------

	// CeL.wiki.parser.remove_heading_spaces(parent, index, max_length)
	// remove heading spaces from parent_token[index]
	function remove_heading_spaces(parent_token, index, max_length,
			do_not_preserve_tail_spaces) {
		max_length = typeof max_length === 'number' && max_length >= 0 ? Math
				.min(max_length, parent_token.length) : parent_token.length;

		var _i = index;

		var combined_tail;
		for (; index < max_length; index++) {
			var token = parent_token[index];
			// assert: 以 "\n" 開頭的，都應該 `typeof token === 'string'`。
			if (typeof token !== 'string') {
				if (!combined_tail)
					return;

				index--;
				break;
			}

			if (!token) {
				continue;
			}

			if (combined_tail)
				combined_tail += token;
			else
				combined_tail = token;
			if (/[^\s\n]/.test(token)) {
				break;
			}
			parent_token[index] = '';
		}

		// console.trace(JSON.stringify(combined_tail));
		if (!/^\s/.test(combined_tail)) {
			// No need to change

			// 注意: /\s/.test('\n') === true
		} else if (/^\s*?\n/.test(combined_tail)) {
			var preserve_heading_new_line;
			while (_i > 0) {
				var token = parent_token[--_i];
				if (token) {
					// 前文以 new line 作結，或者要 trim 的 token 是第一個 token，
					// 則不保留末尾的 preserve_heading_new_line。
					preserve_heading_new_line =
					// typeof token !== 'string' ||
					!/\n\s*?$/.test(token);
					break;
				}
				// assert: token === ''
			}

			combined_tail = combined_tail
			// 去除後方的空白 + 僅一個換行。 去除前方的空白或許較不合適？
			// e.g., "* list\n\n{{t1}}\n{{t2}}",
			// remove "{{t1}}\n" → "* list\n\n{{t2}}"
			.replace(/^\s*?\n/, preserve_heading_new_line ? '\n' : '');
		} else {
			combined_tail = combined_tail
			// 去除後方太多空白，僅留下最後一個空白。
			.replace(/^(\s)*/, do_not_preserve_tail_spaces ? '' : '$1');
		}

		parent_token[index] = combined_tail;
		return index;
	}

	page_parser.remove_heading_spaces = remove_heading_spaces;

	// CeL.wiki.parser.remove_token(parent, index, max_length)
	function remove_token_from_parent(parent_token, index, max_length,
			do_not_preserve_tail_spaces) {
		if (index === undefined && parent_token.parent
				&& parent_token.index >= 0) {
			// remove parent_token itself
			// CeL.wiki.parser.remove_token(token)
			index = parent_token.index;
			parent_token = parent_token.parent;
		}

		var token = parent_token[index];
		parent_token[index] = '';

		var next_index = remove_heading_spaces(parent_token, index + 1,
				max_length, do_not_preserve_tail_spaces);

		if (index > 0 && /\n$/.test(parent_token[index - 1])
				&& /^\n/.test(parent_token[next_index])) {
			// e.g., "\n{{t}}\n==t==\n" → "\n\n==t==\n"
			// → "\n==t==\n"
			parent_token[next_index] = parent_token[next_index].replace(/^\n/,
					'');
		}

		// console.log(parent_token.slice(index - 2, i + 2));
		return token;
	}

	page_parser.remove_token = remove_token_from_parent;

	if (false) {
		wikitext = 'a\n[[File:f.jpg|thumb|d]]\nb';
		CeL.wiki.parser(wikitext).parse().each('namespaced_title',
				function(token, index, parent) {
					console.log([ index, token, parent ]);
				}, true).toString();
	}

	/**
	 * 對所有指定類型 type，皆執行特定作業 processor。
	 * 
	 * TODO: 可中途跳出。
	 * 
	 * @param {String}[type]
	 *            欲搜尋之類型。 e.g., 'template'. see ((wiki_toString)).<br />
	 *            未指定: 處理所有節點。
	 * @param {Function}processor
	 *            執行特定作業: processor({Array|String|undefined}inside token list,
	 *            {ℕ⁰:Natural+0}index of token, {Array}parent of token,
	 *            {ℕ⁰:Natural+0}depth) {<br />
	 *            return {String}wikitext or {Object}element;}
	 * @param {Boolean}[modify_by_return]
	 *            若 processor 的回傳值為{String}wikitext，則將指定類型節點替換/replace作此回傳值。
	 *            注意：即使設定為 false，回傳 .remove_token 依然會刪除當前 token！
	 * @param {Natural}[max_depth]
	 *            最大深度。1: 僅到第1層(底層)。2: 僅到第2層(開始遍歷子節點)。 0||NaN: 遍歷所有子節點。
	 * 
	 * @returns {wiki page parser}
	 * 
	 * @see page_parser.type_alias
	 */
	function for_each_token(type, processor, modify_by_return, max_depth) {
		if (!this) {
			return this;
		}

		if (typeof type === 'function' && max_depth === undefined) {
			// for_each_token(processor, modify_by_return, max_depth)
			// shift arguments.
			max_depth = modify_by_return;
			modify_by_return = processor;
			processor = type;
			type = undefined;
		}

		var options;
		// for_each_token(type, processor, options)
		if (max_depth === undefined && typeof modify_by_return === 'object') {
			options = modify_by_return;
			modify_by_return = options.modify;
			max_depth = options.max_depth;
		} else {
			options = Object.create(null);
		}

		// console.log(options);

		if (typeof modify_by_return === 'number' && modify_by_return > 0
				&& max_depth === undefined) {
			// for_each_token(type, processor, max_depth)
			// shift arguments.
			max_depth = modify_by_return;
			modify_by_return = undefined;
		}

		// console.log('max_depth: ' + max_depth);

		var session = wiki_API.session_of_options(options);
		if (!session && (session = wiki_API.session_of_options(this))) {
			// for wiki_API.template_functions.adapt_function()
			wiki_API.add_session_to_options(session, options);
		}

		var token_name;
		if (type || type === '') {
			if (typeof type !== 'string') {
				library_namespace.warn('for_each_token: Invalid type [' + type
						+ ']');
				return this;
			}

			token_name = type.match(/^(Template):(.+)$/i);
			if (token_name) {
				if (session) {
					token_name = session.redirect_target_of(type);
					token_name = session.remove_namespace(token_name);
				} else {
					// type = token_name[0];
					token_name = wiki_API.normalize_title(token_name[2]);
				}
				type = 'transclusion';
			}

			// normalize type
			// assert: typeof type === 'string'
			type = type.toLowerCase().replace(/\s/g, '_');
			if (type in page_parser.type_alias) {
				type = page_parser.type_alias[type];
			}
			if (!(type in wiki_toString)) {
				library_namespace.warn('for_each_token: Unknown type [' + type
						+ ']');
			}
		}

		// options.slice: range index: {Number}start index
		// || {Array}[ {Number}start index, {Number}end index ]
		var slice = options.slice, exit;
		// console.log(slice);
		if (slice >= 0) {
			// 第一層 start from ((slice))
			slice = [ slice ];
		} else if (slice && (!Array.isArray(slice) || slice.length > 2)) {
			library_namespace.warn('for_each_token: Invalid slice: '
					+ JSON.stringify(slice));
			slice = undefined;
		}

		if (!this.parsed && typeof this.parse === 'function') {
			// 因為本函數為 CeL.wiki.parser(content) 最常使用者，
			// 因此放在這少一道 .parse() 工序。
			this.parse();
		}

		var ref_list_to_remove = [];

		// ----------------------------------------------------------

		// 遍歷 tokens。
		function traversal_tokens(_this, depth) {
			var index, length;
			if (slice && depth === 0) {
				// 若有 slice，則以更快的方法遍歷 tokens。
				// TODO: 可以設定多個範圍，而不是只有一個 range。
				index = slice[0] | 0;
				length = slice[1] >= 0 ? Math.min(slice[1] | 0, _this.length)
						: _this.length;
				// for (; index < length; index++) { ... }
			} else {
				// console.log(_this);
				index = 0;
				length = _this.length;
				// _this.some(for_token);
			}

			for (; index < length && !exit; index++) {
				var token = _this[index];
				if (false) {
					console.log('token depth ' + depth + '/' + max_depth
							+ (exit ? ' (exit)' : '') + ':');
					console.log(token);
				}

				if ((!type
				// 'plain': 對所有 plain text 或尚未 parse 的 wikitext.，皆執行特定作業。
				|| type === (Array.isArray(token) ? token.type : 'plain'))
						&& (!token_name || (session ? session.is_template(
								token_name, token) : token.name === token_name))) {
					// options.set_index
					if (options.add_index && typeof token !== 'string') {
						// 假如需要自動設定 .parent, .index 則必須特別指定。
						// token.parent[token.index] === token
						// .index_of_parent
						token.index = index;
						token.parent = _this;
					}

					if (wiki_API.template_functions) {
						wiki_API.template_functions.adapt_function(token,
								index, _this, options);
					}

					// get result. 須注意: 此 token 可能為 Array, string, undefined！
					// for_each_token(
					// token, token_index, parent_of_token, depth)
					var result = processor(token, index, _this, depth);
					// console.log(modify_by_return);
					// console.log(result);
					if (result === for_each_token.exit) {
						library_namespace.debug('Abort the operation', 3,
								'for_each_token');
						// exit: 直接跳出。
						exit = true;
						break;
					}

					// `return parsed.each.remove_token;`
					if (result === for_each_token.remove_token) {
						if (_this.type === 'list') {
							// for <ol>, <ul>: 直接消掉整個 item token。
							// index--: 刪除完後，本 index 必須再遍歷一次。
							_this.splice(index--, 1);
							length--;

						} else {
							if (token.type === 'tag' && token.tag === 'ref'
									&& token.attributes
									&& token.attributes.name) {
								// @see wikibot/20190913.move_link.js
								library_namespace.debug(
										'將刪除可能被引用的 <ref>，並嘗試自動刪除所有引用。您仍須自行刪除非{{r|name}}型態的模板參考引用: '
												+ token.toString(), 1,
										'for_each_token');
								ref_list_to_remove.push(token.attributes.name);
							}

							remove_token_from_parent(_this, index, length);
							token = '';
						}

					} else if (modify_by_return) {
						// 換掉整個 parent[index] token 的情況。
						// `return undefined;` 不會替換，應該 return
						// .each.remove_token; 以清空。
						// 小技巧: 可以用 return [ inner ].is_atom = true 來避免進一步的
						// parse 或者處理。
						if (typeof result === 'string') {
							// {String}wikitext to ( {Object}element or '' )
							result = parse_wikitext(result, null, []);
						}
						if (typeof result === 'string'
						//
						|| Array.isArray(result)) {
							// 將指定類型節點替換作此回傳值。
							_this[index] = token = result;
						}
					}

				} else if (options.add_index === 'all'
						&& typeof token === 'object') {
					token.index = index;
					token.parent = _this;
				}

				// depth-first search (DFS) 向下層巡覽，再進一步處理。
				// Skip inner tokens, skip children.
				if (result !== for_each_token.skip_inner
				// is_atom: 不包含可 parse 之要素，不包含 text。
				&& Array.isArray(token) && !token.is_atom
				// comment 可以放在任何地方，因此能滲透至任一層。
				// 但這可能性已經在 parse_wikitext() 中偵測並去除。
				// && type !== 'comment'
				&& (!max_depth || depth + 1 < max_depth)) {
					traversal_tokens(token, depth + 1);
				}
			}

		}

		// ----------------------------------------------------------

		if (Array.isArray(this)) {
			traversal_tokens(this, 0);

			if (ref_list_to_remove.length > 0) {
				for_each_token.call(this, 'tag_single', function(token, index,
						parent) {
					if (token.tag === 'ref' && token.attributes
					// 嘗試自動刪除所有引用。
					&& ref_list_to_remove.includes(token.attributes.name)) {
						library_namespace.debug('Also remove: '
								+ token.toString(), 3, 'for_each_token');
						return for_each_token.remove_token;
					}
				});
				for_each_token.call(this, 'transclusion',
				// also remove {{r|name}}
				function(token, index, parent) {
					if (for_each_token.ref_name_templates.includes(token.name)
					// 嘗試自動刪除所有引用。
					&& ref_list_to_remove.includes(token.parameters['1'])) {
						if (token.parameters['2']) {
							library_namespace
									.warn('for_each_token: Can not remove: '
											+ token.toString());
						} else {
							library_namespace.debug('Also remove: '
									+ token.toString(), 3, 'for_each_token');
							return for_each_token.remove_token;
						}
					}
				});
			}
		}

		return this;
	}

	Object.assign(for_each_token, {
		// CeL.wiki.parser.parser_prototype.each.exit
		// for_each_token.exit: 直接跳出。
		exit : typeof Symbol === 'function' ? Symbol('EXIT_for_each_token')
				: [ 'for_each_token.exit: abort the operation' ],
		// for_each_token.skip_inner: Skip inner tokens, skip children.
		skip_inner : typeof Symbol === 'function' ? Symbol('SKIP_CHILDREN')
				: [ 'for_each_token.skip_inner: skip children' ],
		// CeL.wiki.parser.parser_prototype.each.remove_token
		// for_each_token.remove_token: remove current children token
		remove_token : typeof Symbol === 'function' ? Symbol('REMOVE_TOKEN')
				: [ 'for_each_token.skip_inner: remove current token' ],
		ref_name_templates : [ 'R' ]
	});

	// 兩 token 都必須先有 .index, .parent!
	// token.parent[token.index] === token
	// @see options.add_index @ function for_each_token()
	// 注意: 這個交換純粹只操作於 page_data.parsed 上面，
	// 不會改變其他參照，例如 page_data.parsed.reference_list!
	// 通常一個頁面只能夠交換一次，交換兩次以上可能就會出現問題!
	function switch_token(token_1, token_2) {
		// console.log([ token_1, token_2 ]);
		token_1.parent[token_1.index] = token_2;
		token_2.parent[token_2.index] = token_1;

		var index_1 = token_1.index;
		token_1.index = token_2.index;
		token_2.index = index_1;

		var parent_1 = token_1.parent;
		token_1.parent = token_2.parent;
		token_2.parent = parent_1;
	}

	// ------------------------------------------------------------------------

	/**
	 * 快速取得第一個標題 lead section / first section / introduction 序言 導入文 文字用。
	 * 
	 * @example <code>

	CeL.wiki.lead_text(content);

	</code>
	 * 
	 * @param {String}wikitext
	 *            wikitext to parse
	 * 
	 * @returns {String}lead section wikitext 文字
	 * 
	 * @see [[mw:Extension:Labeled_Section_Transclusion#Transclude_the_introduction]]
	 *      {{subst:#lsth:page title}}
	 * 
	 * @see 文章的開頭部分[[WP:LEAD|導言章節]] (lead section, introduction),
	 *      [[en:Wikipedia:Hatnote]] 頂註
	 */
	function lead_text(wikitext) {
		var page_data;
		if (wiki_API.is_page_data(wikitext)) {
			page_data = wikitext;
			wikitext = wiki_API.content_of(page_data);
		}
		if (!wikitext || typeof wikitext !== 'string') {
			return wikitext;
		}

		var matched = wikitext.indexOf('\n=');
		if (matched >= 0) {
			wikitext = wikitext.slice(0, matched);
		}

		// match/去除一開始的維護模板/通知模板。
		// <s>[[File:file|[[link]]...]] 因為不容易除盡，放棄處理。</s>
		while (matched = wikitext.match(/^[\s\n]*({{|\[\[)/)) {
			// 注意: 此處的 {{ / [[ 可能為中間的 token，而非最前面的一個。但若是沒有中間的 token，則一定是第一個。
			matched = matched[1];
			// may use wiki_API.title_link_of()
			var index_end = wikitext.indexOf(matched === '{{' ? '}}' : ']]');
			if (index_end === NOT_FOUND) {
				library_namespace.debug('有問題的 wikitext，例如有首 "' + matched
						+ '" 無尾？ [' + wikitext + ']', 2, 'lead_text');
				break;
			}
			// 須預防 -{}- 之類 language conversion。
			var index_start = wikitext.lastIndexOf(matched, index_end);
			wikitext = wikitext.slice(0, index_start)
			// +2: '}}'.length, ']]'.length
			+ wikitext.slice(index_end + 2);
		}

		if (page_data) {
			page_data.lead_text = lead_text;
		}

		return wikitext.trim();
	}

	// ------------------------------------------

	/**
	 * 擷取出頁面簡介。例如使用在首頁優良條目簡介。
	 * 
	 * @example <code>

	CeL.wiki.extract_introduction(page_data).toString();

	</code>
	 * 
	 * @param {Array|Object}first_section
	 *            first section or page data
	 * @param {String}[title]
	 *            page title.
	 * 
	 * @returns {Undefined|Array} introduction object
	 * 
	 * @since 2019/4/10
	 */
	function extract_introduction(first_section, title) {
		var parsed;
		if (wiki_API.is_page_data(first_section)) {
			if (!title)
				title = wiki_API.title_of(first_section);
			parsed = page_parser(first_section).parse();
			parsed.each_section(function(section, index) {
				if (index === 0) {
					first_section = section;
				}
			});
		}
		if (!first_section)
			return;

		// --------------------------------------

		var introduction_section = [], representative_image;
		if (parsed) {
			introduction_section.page = parsed.page;
			introduction_section.title = title;
			// free
			parsed = null;
		}
		introduction_section.toString = first_section.toString;

		// --------------------------------------

		var index = 0;
		for (; index < first_section.length; index++) {
			var token = first_section[index];
			// console.log(token);
			if (token.type === 'file') {
				// {String}代表圖像。
				if (!representative_image) {
					representative_image = token;
				}
				continue;
			}

			if (token.type === 'transclusion') {
				if (token.name === 'NoteTA') {
					// preserve 轉換用詞
					// introduction_section.push(token);
					continue;
				}

				if (token.name in {
					Cfn : true,
					NoteTag : true,
					R : true
				}) {
					// Skip references
					continue;
				}

				// 抽取出代表圖像。
				if (!representative_image) {
					representative_image = token.parameters.image
							|| token.parameters.file
					// ||token.parameters['Image location']
					;
				}
				if (!representative_image) {
					token = token.toString();
					// console.log(token);
					var matched = token
							.match(/\|[^=]+=([^\|{}]+\.(?:jpg|png|svg|gif|bmp))[\s\n]*[\|}]/i);
					if (matched) {
						representative_image = matched[1];
					}
				}

				continue;
			}

			if ((token.type === 'tag' || token.type === 'tag_single')
					&& token.tag === 'ref') {
				// 去掉所有參考資料。
				continue;
			}

			if (!token.toString().trim()) {
				continue;
			}

			if (token.type === 'bold' || token.type === 'plain'
					&& token.toString().includes(title)) {
				// title_piece
				introduction_section.title_token = token;
			}
			// console.log('Add token:');
			// console.log(token);
			introduction_section.push(token);
			if (introduction_section.title_token)
				break;
		}

		// ------------------

		// 已經跳過導航模板。把首段餘下的其他內容全部納入簡介中。
		while (++index < first_section.length) {
			token = first_section[index];
			// remove {{Notetag}}, <ref>
			if ((token.type === 'tag' || token.type === 'tag_single')
					&& token.tag === 'ref' || token.type === 'transclusion'
					&& token.name === 'Notetag')
				continue;
			introduction_section.push(token);
		}
		index = introduction_section.length;
		// trimEnd() 去頭去尾
		while (--index > 0) {
			if (introduction_section[index].toString().trim())
				break;
			introduction_section.pop();
		}

		// --------------------------------------

		// 首個段落不包含代表圖像。檢查其他段落以抽取出代表圖像。
		if (!representative_image) {
			parsed.each('file', function(token) {
				representative_image = token;
				return for_each_token.exit;
			});
		}

		// --------------------------------------

		if (typeof representative_image === 'string') {
			// assert: {String}representative_image

			// remove [[File:...]]
			representative_image = representative_image.replace(/^\[\[[^:]+:/i,
					'').replace(/\|[\s\S]*/, '').replace(/\]\]$/, '');
			representative_image = parse_wikitext('[[File:'
					+ wiki_API.title_of(representative_image) + ']]');
		}
		introduction_section.representative_image = representative_image;

		return introduction_section;
	}

	// ------------------------------------------

	// 這些都不能簡單解析出來。
	var untextify_tags = {
		ref : true,
		// e.g., <references group="gg"/>
		references : true,
		math : true
	};

	// @inner
	function preprocess_section_link_token(token, options) {
		// console.trace(token);

		// 前置作業: 處理模板之類特殊節點。
		if (typeof options.preprocess_section_link_token === 'function') {
			token = options.preprocess_section_link_token(token, options);
		}
		// console.log(token);

		if (token.type === 'transclusion' && typeof token.expand === 'function') {
			// console.log(options);
			// expand template, .expand_template(), .to_wikitext()
			// https://www.mediawiki.org/w/api.php?action=help&modules=expandtemplates
			token = parse_wikitext(token.expand(options));
		}

		// ------------------------

		if (token.type === 'comment') {
			return '';
		}

		// console.log(token);
		if (token.type === 'tag'/* || token.type === 'tag_single' */) {
			// token: [ tag_attributes, tag_inner ]
			if (token.tag === 'nowiki') {
				// escape characters inside <nowiki>
				return preprocess_section_link_token(token[1] ? token[1]
						.toString() : '', options);
			}

			// 容許一些特定標籤能夠顯示格式。以繼承原標題的粗體斜體和顏色等等格式。
			// @see markup_tags
			if (token.tag in {
				// style
				b : true,
				i : true,
				q : true,
				s : true,
				u : true,
				big : true,
				small : true,
				sub : true,
				sup : true,
				em : true,
				ins : true,
				del : true,
				strike : true,
				strong : true,
				font : true,
				code : true,
				// container
				span : true,
				div : true,

				// nowiki : true,
				langconvert : true
			}) {
				// reduce HTML tags. e.g., <b>, <sub>, <sup>, <span>
				token.tag_attributes = token.shift();
				token.original_type = token.type;
				token.type = 'plain';
				token.toString = wiki_toString[token.type];
				return token;
			}

			// console.log(token);

			// 其他 HTML tag 大多無法精確轉換。
			options.root_token_list.imprecise_tokens.push(token);

			if (token.tag in untextify_tags) {
				// trick: 不再遍歷子節點。避免被進一步的處理。
				token.is_atom = true;
				token.unconvertible = true;
				return token;
			}

			// TODO: <a>

			// token that may be handlable 請檢查是否可處理此標題。
			options.root_token_list.tokens_maybe_handlable.push(token);
			// reduce HTML tags. e.g., <ref>
			var new_token = preprocess_section_link_tokens(token[1] || '',
					options);
			new_token.tag = token.tag;
			return new_token;
		}

		if (token.type === 'tag_single') {
			if (token.tag in {
				// hr : true,
				// e.g., <br />
				br : true,
				nowiki : true
			}) {
				return '';
			}

			options.root_token_list.imprecise_tokens.push(token);

			// 從上方 `token.type === 'tag'` 複製過來的。
			if (token.tag in untextify_tags) {
				// trick: 不再遍歷子節點。避免被進一步的處理。
				token.is_atom = true;
				token.unconvertible = true;
				return token;
			}

			// token that may be handlable 請檢查是否可處理此標題。
			options.root_token_list.tokens_maybe_handlable.push(token);
			return token;
		}

		if (false && token.type === 'convert') {
			// TODO: e.g., '==-{[[:三宝颜共和国]]}-=='
			token = token.converted;
			// 接下來交給 `token.type === 'link'` 處理。
		}

		if ((token.type === 'file' || token.type === 'category')
				&& !token.is_link) {
			// 顯示時，TOC 中的圖片、分類會被消掉，圖片在內文中才會顯現。
			return '';
		}

		// TODO: interlanguage links will be treated as normal link!
		if (token.type === 'link' || token.type === 'category'
		// e.g., [[:File:file name.jpg]]
		|| token.type === 'file') {
			// escape wikilink
			// return display_text
			if (token.length > 2) {
				token = token.slice(2);
				token.type = 'plain';
				// @see wiki_toString.file, for token.length > 2
				token.toString = function() {
					return this.join('|')
				};
				token = preprocess_section_link_tokens(token, options);
			} else {
				// 去掉最前頭的 ":"。 @see wiki_toString
				token = token[0].toString().replace(/^ *:?/, '') + token[1];
			}
			// console.log(token);
			return token;
		}

		// 這邊僅處理常用模板。需要先保證這些模板存在，並且具有預期的功能。
		// 其他常用 template 可加在 wiki.template_functions[site_name] 中。
		//
		// 模板這個部分除了解析模板之外沒有好的方法。
		// 正式應該採用 parse 或 expandtemplates 解析出實際的 title，之後 callback。
		// https://www.mediawiki.org/w/api.php?action=help&modules=parse
		if (token.type === 'transclusion') {
			// 各語言 wiki 常用 template-linking templates:
			// {{Tl}}, {{Tlg}}, {{Tlx}}, {{Tls}}, {{T1}}, ...
			if (/^(?:T[l1n][a-z]{0,3}[23]?)$/.test(token.name)) {
				token.shift();
				return token;
			}

			if (token.name === 'Anchor') {
				return '';
			}

			if (token.name === 'Lang') {
				return preprocess_section_link_token(token.parameters[2],
						options);
			}

			// TODO: {{Visible anchor}} === {{vanchor}}

			// TODO: [[Template:User link]], [[Template:U]]

			// TODO: [[Template:疑問]], [[Template:Block]]

			// 警告: 在遇到標題包含模板時，因為不能解析連模板最後產出的結果，會產生錯誤結果。
			options.root_token_list.imprecise_tokens.push(token);
			// trick: 不再遍歷子節點。避免被進一步的處理。
			token.is_atom = true;
			token.unconvertible = true;
			return token;
		}

		if (token.type === 'external_link') {
			// escape external link
			// console.log('>> ' + token);
			// console.log(token[2]);
			// console.log(preprocess_section_link_tokens(token[2], options));
			if (token[2]) {
				return preprocess_section_link_tokens(token[2], options);
			}
			// TODO: error: 用在[URL]無標題連結會失效。需要計算外部連結的序號。
			options.root_token_list.imprecise_tokens.push(token);
			// trick: 不再遍歷子節點。避免被進一步的處理。
			token.is_atom = true;
			token.unconvertible = true;
			return token;
		}

		if (token.type === 'switch') {
			options.root_token_list.imprecise_tokens.push(token);
			return '';
		}

		if (token.type === 'bold' || token.type === 'italic') {
			// 去除粗體與斜體。
			token.original_type = token.type;
			token.type = 'plain';
			token.toString = wiki_toString[token.type];
			return token;
		}

		if (typeof token === 'string') {
			// console.log('>> ' + token);
			// console.log('>> [' + index + '] ' + token);
			// console.log(parent);

			token = library_namespace.HTML_to_Unicode(token);
			if (/\S/.test(token)) {
				// trick: 不再遍歷子節點。避免被進一步的處理，例如"&amp;amp;"。
				token = [ token ];
				token.is_atom = true;
				token.unconvertible = true;
				token.is_plain = true;
			}
			return token;
		}

		if (token.type in {
			convert : true,
			url : true,
			tag_inner : true,
			plain : true
		}) {
			// 其他可處理的節點。
			return token;
		}

		// console.trace(token);
		if (token.type in {
			'function' : true,
			parameter : true
		}) {
			token.unconvertible = true;
		}

		// token that may be handlable 請檢查是否可處理此標題。
		if (!token.unconvertible)
			options.root_token_list.tokens_maybe_handlable.push(token);
		options.root_token_list.imprecise_tokens.push(token);
		return token;
	}

	// @inner
	function preprocess_section_link_tokens(tokens, options) {
		if (tokens.type !== 'plain') {
			tokens = set_wiki_type([ tokens ], 'plain');
		}

		if (false) {
			library_namespace.info('preprocess_section_link_tokens: tokens:');
			console.log(tokens);
		}
		// console.trace(tokens);

		if (!tokens.imprecise_tokens) {
			// options.root_token_list.imprecise_tokens
			tokens.imprecise_tokens = [];
			tokens.tokens_maybe_handlable = [];
		}

		if (!options.root_token_list)
			options.root_token_list = tokens;

		for_each_token.call(tokens, function(token, index, parent) {
			return preprocess_section_link_token(token, options);
		}, options);
		return tokens;
	}

	function extract_plain_text_of_wikitext(wikitext, options) {
		;
	}

	// --------------------------------

	function section_link_escape(text, is_uri) {
		// escape wikitext control characters,
		// including language conversion -{}-
		if (true) {
			text = text.replace(
			// 盡可能減少字元的使用量，因此僅處理開頭，不處理結尾。
			// @see [[w:en:Help:Wikitext#External links]]
			is_uri ? /[\|{}\[\]<]/g
			// 為了容許一些特定標籤能夠顯示格式，"<>"已經在preprocess_section_link_token(),section_link()裡面處理過了。
			// display_text 在 "[[", "]]" 中，不可允許 "[]"
			: /[\|{}<>]/g && /[\|{\[\]]/g,
			// 經測試 anchor 亦不可包含[{}\[\]\n�]。
			function(character) {
				if (is_uri) {
					return '%' + character.charCodeAt(0).toString(16);
				}
				return '&#' + character.charCodeAt(0) + ';';
			}).replace(/[ \n]{2,}/g, ' ');
		} else {
			// 只處理特殊字元而不是採用encodeURIComponent()，這樣能夠保存中文字，使其不被編碼。
			text = encodeURIComponent(text);
		}

		return text;
	}

	// @inner
	// return [[維基連結]]
	// TODO: using external link to display "�"
	function section_link_toString(page_title, style) {
		var anchor = (this[1] || '').replace(/�/g, '?'),
		// 目前 MediaWiki 之 link anchor, display_text 尚無法接受
		// REPLACEMENT CHARACTER U+FFFD "�" 這個字元。
		display_text = (this[2] || '').replace(/�/g, '?');

		display_text = display_text ?
		//
		style ? '<span style="' + style + '">' + display_text + '</span>'
				: display_text : '';

		return wiki_API.title_link_of((page_title || this[0] || '') + '#'
				+ anchor, null, display_text);
		return '[[' + (page_title || this[0] || '') + '#' + anchor + '|'
				+ display_text + ']]';
	}

	// 用來保留 display_text 中的 language conversion -{}-，
	// 必須是標題裡面不會存在的字串，並且也不會被section_link_escape()轉換。
	var section_link_START_CONVERT = '\0\x01', section_link_END_CONVERT = '\0\x02',
	//
	section_link_START_CONVERT_reg = new RegExp(library_namespace
			.to_RegExp_pattern(section_link_START_CONVERT), 'g'),
	//
	section_link_END_CONVERT_reg = new RegExp(library_namespace
			.to_RegExp_pattern(section_link_END_CONVERT), 'g');

	function pre_parse_section_title(parameters, options, queue) {
		parameters = parameters.toString()
		// 先把前頭的空白字元提取出來，避免被當作 <pre>。
		// 先把前頭的列表字元提取出來，避免被當作 list。
		// 這些會被當作普通文字。
		.match(/^([*#;:=\s]*)([\s\S]*)$/);
		// console.trace(parameters);
		var prefix = parameters[1];
		// 經過改變，需再進一步處理。
		parameters = parse_wikitext(parameters[2], options, queue);
		// console.trace(parameters);
		if (parameters.type !== 'plain') {
			parameters = set_wiki_type([ parameters ], 'plain');
		}
		if (prefix) {
			if (typeof parameters[0] === 'string')
				parameters[0] = prefix + parameters[0];
			else
				parameters.unshift(prefix);
		}
		return parameters;
	}

	/**
	 * 從話題/議題/章節標題產生連結到章節標題的wikilink。
	 * 
	 * @example <code>

	CeL.wiki.section_link(section_title)

	</code>
	 * 
	 * @param {String}section_title
	 *            section title in wikitext. 章節標題。 節のタイトル。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {Array}link object (see below)
	 * 
	 * @see [[phabricator:T18691]] 未來章節標題可能會有分享連結，這將更容易連結到此章節。
	 * @see [[H:MW]], {{anchorencode:章節標題}}, [[Template:井戸端から誘導の使用]], escapeId()
	 * @see https://phabricator.wikimedia.org/T152540
	 *      https://lists.wikimedia.org/pipermail/wikitech-l/2017-August/088559.html
	 */
	function section_link(section_title, options) {
		if (typeof options === 'string') {
			options = {
				page_title : options
			};
		} else if (typeof options === 'function') {
			options = {
				// TODO
				callback : options
			};
		} else {
			options = library_namespace.setup_options(options);
		}

		// for for_each_token @ preprocess_section_link_tokens()
		options.modify = true;

		// console.trace(parse_wikitext(section_title, null, []));
		// TODO: "==''==text==''==\n"
		var parsed_title = pre_parse_section_title(section_title, options);
		parsed_title = preprocess_section_link_tokens(parsed_title, options);

		// 注意: 當這空白字字出現在功能性token中時，可能會出錯。
		var id = parsed_title.toString().trim().replace(/[ \n]{2,}/g, ' '),
		// anchor 網頁錨點: 可以直接拿來做 wikilink anchor 的章節標題。
		// 有多個完全相同的 anchor 時，後面的會加上"_2", "_3",...。
		// 這個部分的處理請見 function for_each_section()
		anchor = section_link_escape(id
		// 處理連續多個空白字元。長度相同的情況下，盡可能保留原貌。
		.replace(/([ _]){2,}/g, '$1').replace(/&/g, '&amp;'), true);

		var session = wiki_API.session_of_options(options);
		// TODO: for zhwiki, the anchor should NOT includes "-{", "}-"

		// console.log(parsed_title);
		for_each_token.call(parsed_title, function(token, index, parent) {
			if (token.type === 'convert') {
				// @see wiki_toString.convert
				// return token.join(';');
				token.toString = function() {
					var converted = this.converted;
					if (Array.isArray(converted)) {
						converted = section_link(
						// e.g., '==-{[[:三宝颜共和国]]}-=='
						converted.toString(), options)[2];
					}
					return section_link_START_CONVERT
					// + this.join(';')
					+ converted + section_link_END_CONVERT;
				};
			} else if (token.original_type) {
				// revert type
				token.type = token.original_type;
				token.toString = wiki_toString[token.type];
				// 保留 display_text 中的 ''', '', <b>, <i>, <span> 屬性。
				if (token.type === 'tag') {
					// 容許一些特定標籤能夠顯示格式: 會到這裡的應該都是一些被允許顯示格式的特定標籤。
					token.unshift(token.tag_attributes);
				}
			} else if (token.type === 'tag' || token.type === 'tag_single') {
				parent[index] = token.toString().replace(/</g, '&lt;');

			} else if (token.is_plain) {
				if (false) {
					// @see use library_namespace.DOM.Unicode_to_HTML()
					token[0] = library_namespace.Unicode_to_HTML(token[0])
					// reduce size
					.replace(/&gt;/g, '>');
				}
				// 僅作必要的轉換
				token[0] = token[0].replace(/&/g, '&amp;')
				// 這邊也必須 escape "<>"
				.replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/'/g,
						"&apos;");
			}
		}, true);
		// console.log(parsed_title);
		// console.log(parsed_title.toString().trim());

		// display_text 應該是對已經正規化的 section_title 再作的變化。
		var display_text = section_link_escape(parsed_title.toString().trim())
		// recover language conversion -{}-
		.replace(section_link_START_CONVERT_reg, '-{').replace(
				section_link_END_CONVERT_reg, '}-');

		// link = [ page title 頁面標題, anchor 網頁錨點 / section title 章節標題,
		// display_text / label 要顯示的連結文字 default: section_title ]
		var link = [ options && options.page_title,
		// Warning: anchor, display_text are with "&amp;",
		// id is not with "&amp;".
		anchor, display_text ];
		// console.log(link);
		if (parsed_title.imprecise_tokens
		// section_title_token.link.imprecise_tokens
		&& parsed_title.imprecise_tokens.length > 0) {
			link.imprecise_tokens = parsed_title.imprecise_tokens;
			// section_title_token.link.tokens_maybe_handlable
			if (parsed_title.tokens_maybe_handlable
					&& parsed_title.tokens_maybe_handlable.length > 0)
				link.tokens_maybe_handlable = parsed_title.tokens_maybe_handlable;
		}
		Object.assign(link, {
			// link.id = {String}id
			// section title, NOT including "<!-- -->" and "&amp;"
			id : id,
			// original section title, including "<!-- -->",
			// not including "&amp;".
			title : section_title,
			// only for debug
			// parsed_title : parsed_title,

			// anchor : anchor.toString().trimEnd(),
			// display_text : display_text,

			// section.section_title.link.toString()
			toString : section_link_toString
		});
		// 用以獲得實際有效的 anchor 網頁錨點。 effect anchor: parsed.each_section()
		// and then section_title_token.link.id
		return link;
	}

	// ------------------------------------------

	/**
	 * <code>

	CeL.wiki.sections(page_data);
	page_data.sections.forEach(for_sections, page_data.sections);

	CeL.wiki.sections(page_data)
	//
	.forEach(for_sections, page_data.sections);

	</code>
	 */

	// 將 wikitext 拆解為各 section list
	// get {Array}section list
	//
	// @deprecated: 無法處理 '<pre class="c">\n==t==\nw\n</pre>'
	// use for_each_section() instead.
	function deprecated_get_sections(wikitext) {
		var page_data;
		if (wiki_API.is_page_data(wikitext)) {
			page_data = wikitext;
			wikitext = wiki_API.content_of(page_data);
		}
		if (!wikitext || typeof wikitext !== 'string') {
			return;
		}

		var section_list = [], index = 0, last_index = 0,
		// 章節標題。
		section_title,
		// [ all title, "=", section title ]
		PATTERN_section = /\n(={1,2})([^=\n]+)\1\s*?\n/g;

		section_list.toString = function() {
			return this.join('');
		};
		// 章節標題list。
		section_list.title = [];
		// index hash
		section_list.index = Object.create(null);

		while (true) {
			var matched = PATTERN_section.exec(wikitext),
			// +1 === '\n'.length: skip '\n'
			// 使每個 section_text 以 "=" 開頭。
			next_index = matched && matched.index + 1,
			//
			section_text = matched ? wikitext.slice(last_index, next_index)
					: wikitext.slice(last_index);

			if (false) {
				// 去掉章節標題。
				section_text.replace(/^==[^=\n]+==\n+/, '');
			}

			library_namespace.debug('next_index: ' + next_index + '/'
					+ wikitext.length, 3, 'get_sections');
			// console.log(matched);
			// console.log(PATTERN_section);

			if (section_title) {
				// section_list.title[{Number}index] = {String}section title
				section_list.title[index] = section_title;
				if (section_title in section_list) {
					library_namespace.debug('重複 section title ['
							+ section_title + '] 將僅取首個 section text。', 2,
							'get_sections');

				} else {
					if (!(section_title >= 0)) {
						// section_list[{String}section title] =
						// {String}wikitext
						section_list[section_title] = section_text;
					}

					// 不採用 section_list.length，預防 section_title 可能是 number。
					// section_list.index[{String}section title] = {Number}index
					section_list.index[section_title] = index;
				}
			}

			// 不採用 section_list.push(section_text);，預防 section_title 可能是 number。
			// section_list[{Number}index] = {String}wikitext
			section_list[index++] = section_text;

			if (matched) {
				// 紀錄下一段會用到的資料。

				last_index = next_index;

				section_title = matched[2].trim();
				// section_title = section_link(section_title).id;
			} else {
				break;
			}
		}

		if (page_data) {
			page_data.sections = section_list;
			// page_data.lead_text = lead_text(section_list[0]);
		}

		// 檢核。
		if (false && wikitext !== section_list.toString()) {
			// debug 用. check parser, test if parser working properly.
			throw new Error('get_sections: Parser error'
			//
			+ (page_data ? ': ' + wiki_API.title_link_of(page_data) : ''));
		}
		return section_list;
	}

	/**
	 * 為每一個章節(討論串)執行特定作業 for_section(section)
	 * 
	 * CeL.wiki.parser.parser_prototype.each_section
	 * 
	 * TODO: 這會漏算沒有日期標示的簽名
	 * 
	 * @example <code>

	parsed = CeL.wiki.parser(page_data);
	parsed.each_section(function(section, section_index) {
		if (section_index === 0) {
			// first_section = section;
			// Skip lead section / first section / introduction.
			return;
		}
		console.log('#' + section.section_title);
		console.log([ section.users, section.dates ]);
	}, {
		level_filter : [ 2, 3 ],
		get_users : true,
		// set options[KEY_SESSION] for parse_date()
		session : wiki
	});

	</code>
	 */
	function for_each_section(for_section, options) {
		options = library_namespace.setup_options(options);

		// this: parsed
		var _this = this, page_title = this.page && this.page.title,
		// parsed.sections[0]: 常常是設定與公告區，或者放置維護模板/通知模板。
		all_root_section_list = this.sections = [],
		/**
		 * If you want to get **every** sections, please using
		 * `parsed..each('section_title', ...)` or traversals
		 * `parsed.section_hierarchy` instead of enumerating `parsed.sections`.
		 * `parsed.sections` will not including title like this:
		 * {{Columns-list|\n==title==\n...}}
		 */
		section_hierarchy = [ this.subsections = [] ],
		// `section link anchor` in section_title_hash: had this title
		section_title_hash = Object.create(null);
		// this.section_title_hash = section_title_hash;

		// to test: 沒有章節標題的文章, 以章節標題開頭的文章, 以章節標題結尾的文章, 章節標題+章節標題。

		// 加入 **上一個** section, "this_section"
		function add_root_section(next_section_title_index) {
			// assert: _this.type === 'plain'
			// section_title === parser[section.range[0] - 1]
			var this_section_title_index = all_root_section_list.length > 0 ? all_root_section_list[all_root_section_list.length - 1].range[1]
					: undefined,
			// range: 本 section inner 在 root parsed 中的 index.
			// parsed[range[0]] to parsed[range[1]] - 1
			range = [ this_section_title_index >= 0
			// +1: 這個範圍不包括 section_title。
			? this_section_title_index + 1 : 0, next_section_title_index ],
			//
			section = _this.slice(range[0], range[1]);
			if (this_section_title_index >= 0) {
				// section.section_title === parsed[section.range[0] - 1]
				section.section_title = _this[this_section_title_index];
			}
			// 添加常用屬性與方法。
			// TODO: using Object.defineProperties(section, {})
			Object.assign(section, {
				type : 'section',
				// section = parsed.slice(range[0], range[1]);
				range : range,
				each : for_each_token,
				toString : _this.toString
			});
			all_root_section_list.push(section);
		}

		// get topics / section title / stanza title using for_each_token()
		// 讀取每一個章節的資料: 標題,內容
		// TODO: 不必然是章節，也可以有其它不同的分割方法。
		// TODO: 可以讀取含入的子頁面
		this.each('section_title', function(section_title_token,
		// section 的 index of parser。
		section_title_index, parent_token) {
			var section_title_link = section_title_token.link;
			if (page_title) {
				// [0]: page title
				section_title_link[0] = page_title;
			}
			var id = section_title_link.id;
			if (id in section_title_hash) {
				// The index of 2nd title starts from 2
				var duplicate_NO = 2, base_anchor = id;
				// 有多個完全相同的 anchor 時，後面的會加上 "_2", "_3", ...。
				// [[w:en:Help:Section#Section linking]]
				while ((id = base_anchor + ' ' + duplicate_NO)
				// 測試是否有重複的標題 duplicated section title。
				in section_title_hash) {
					duplicate_NO++;
				}
				if (!section_title_link.duplicate_NO) {
					section_title_link.duplicate_NO = duplicate_NO;
					// hack for [[w:en:WP:DUPSECTNAME|Duplicate section names]]
					if (Array.isArray(section_title_link[1]))
						section_title_link[1].push('_' + duplicate_NO);
					else
						section_title_link[1] += '_' + duplicate_NO;
					// 用以獲得實際有效的 anchor 網頁錨點。 effect anchor
					section_title_link.id = id;
				}
			}
			// 登記已有之 anchor。
			section_title_hash[id] = null;

			var level = section_title_token.level;
			// console.log([ level, options.level_filter ]);
			if (parent_token === _this
			// ↑ root sections only. Do not include
			// {{Columns-list|\n==title==\n...}}
			&& (Array.isArray(options.level_filter)
			// 要篩選的章節標題層級 e.g., {level_filter:[1,2]}
			? options.level_filter.includes(level)
			// e.g., {level_filter:3}
			: 1 <= options.level_filter ? level === options.level_filter
			// default: level 2. 僅處理階級2的章節標題。
			: level === 2)) {
				// console.log(section_title_token);
				add_root_section(section_title_index);
			} else {
				// library_namespace.warn('Ignore ' + section_title_token);
				// console.log([ parent_token === _this, level ]);
			}

			// ----------------------------------

			if (section_hierarchy.length > level) {
				// 去尾。
				section_hierarchy.length = level;
			}
			section_hierarchy[level] = section_title_token;
			// console.log(section_hierarchy);
			while (--level >= 0) {
				// 注意: level 1 的 subsections 可能包含 level 3!
				var parent_section = section_hierarchy[level];
				if (parent_section) {
					if (parent_section.subsections) {
						if (false) {
							library_namespace.log(parent_section + ' → '
									+ section_title_token);
						}
						parent_section.subsections.push(section_title_token);
						section_title_token.parent_section = parent_section;
					} else {
						// assert: is root section list, parent_section ===
						// this.subsections === section_hierarchy[0]
						parent_section.push(section_title_token);
					}
					break;
				}
			}
			section_title_token.subsections = [];

		}, Object.assign({
			// 不可只檢查第一層之章節標題。就算在 template 中的 section title 也會被記入 TOC。
			// e.g.,
			// [[w:en:Wikipedia:Vital_articles/Level/5/Everyday_life/Sports,_games_and_recreation]]
			// max_depth : 1,

			modify : false
		},
		// options.for_each_token_options
		options));
		// add the last section
		add_root_section(this.length);
		if (all_root_section_list[0].range[1] === 0) {
			// 第一個章節為空。 e.g., 以章節標題開頭的文章。
			all_root_section_list.shift();
		}

		// ----------------------------

		// 讀取每一個章節的資料: 參與討論者,討論發言的時間
		// 統計各討論串中簽名的次數和發言時間。
		// TODO: 無法判別先日期，再使用者名稱的情況。 e.g., [[w:zh:Special:Diff/54030530]]
		if (options.get_users) {
			all_root_section_list.forEach(function(section) {
				// console.log(section);
				// console.log('section: ' + section.toString());

				// [[WP:TALK]] conversations, dialogues, discussions, messages
				// section.discussions = [];
				// 發言用戶名順序
				section.users = [];
				// 發言時間日期
				section.dates = [];
				for (var section_index = 0,
				// list buffer
				buffer = [], this_user, token;
				// Only check the first level. 只檢查第一層。
				// TODO: parse [[Wikipedia:削除依頼/暫定2車線]]: <div>...</div>
				// check <b>[[User:|]]</b>
				section_index < section.length || buffer.length > 0;) {
					token = buffer.length > 0 ? buffer.shift()
							: section[section_index++];
					while (/* token && */token.type === 'list') {
						var _buffer = [];
						token.forEach(function(list_item) {
							// 因為使用習慣問題，每個列表必須各別計算使用者留言次數。
							_buffer.append(list_item);
						});
						token = _buffer.shift();
						Array.prototype.unshift.apply(buffer, _buffer);
					}

					if (typeof token === 'string') {
						// assert: {String}token
						if (!token.trim() && token.includes('\n\n')) {
							// 預設簽名必須與日期在同一行。不可分段。
							this_user = null;
							continue;
						}

					} else {
						// assert: {Array}token
						token = token.toString();
						// assert: wikiprojects 計畫的簽名("~~~~~")必須要先從名稱再有日期。
						// 因此等到出現日期的時候再來處理。
						// 取得依照順序出現的使用者序列。
						var user_list = parse_all_user_links(token, true);
						if (false && section.section_title
								&& section.section_title.title.includes('')) {
							console.log('token: ' + token);
							console.log('user_list: ' + user_list);
						}

						// 判別一行內有多個使用者名稱的情況。
						// 當一行內有多個使用者名稱的情況，會取最後一個簽名。
						if (user_list.length > 0) {
							this_user = user_list[user_list.length - 1];
							// ↑ 這個使用者名稱可能為 bot。
							if (options.ignore_bot
									&& PATTERN_BOT_NAME.test(this_user)) {
								this_user = null;
							}
						}

						// --------------------------------
						if (false) {
							// 以下為取得多個使用者名稱的情況下，欲判別出簽名的程式碼。由於現在僅簡單取用最後一個簽名，已經被廢棄。

							if (user_list.length > 1
							// assert: 前面的都只是指向機器人頁面的連結。
							&& /^1+0$/.test(user_list.map(function(user) {
								return PATTERN_BOT_NAME.test(user) ? 1 : 0;
							}).join(''))) {
								user_list = user_list.slice(-1);
							}

							// 因為現在有個性化簽名，需要因應之。應該包含像[[w:zh:Special:Diff/48714597]]的簽名。
							if (user_list.length === 1) {
								this_user = user_list[0];
							} else {
								// 同一個token卻沒有找到，或找到兩個以上簽名，因此沒有辦法準確判別到底哪一個才是真正的留言者。
								// console.log(token);
								// console.log(token.length);
								// console.log(this_user);
								if (user_list.length >= 2
								// 若是有其他非字串的token介於名稱與日期中間，代表這個名稱可能並不是發言者，那麼就重設名稱。
								// 簽名長度不應超過255位元組。
								|| token.length > 255 - '[[U:n]]'.length) {
									// 一行內有多個使用者名稱的情況，取最後一個？
									// 例如簽名中插入自己的舊名稱或者其他人的情況
									this_user = null;
								}
								if (!this_user) {
									continue;
								}
							}
						}

						// 繼續解析日期，預防有類似 "<b>[[User:]] date</b>" 的情況。
					}

					var date = parse_date(token, options);
					// console.log([ this_user, date ]);
					if (!date || !this_user) {
						continue;
					}
					// 同時添加使用者與日期。
					section.dates.push(date);
					section.users.push(this_user);
					// reset
					this_user = null;
				}

				var min_timevalue, max_timevalue;
				section.dates.forEach(function(date) {
					if (!date || isNaN(date = +date)) {
						return;
					}
					if (!(min_timevalue <= date))
						min_timevalue = date;
					else if (!(max_timevalue >= date))
						max_timevalue = date;
				});
				if (min_timevalue) {
					section.dates.min_timevalue = min_timevalue;
					section.dates.max_timevalue = max_timevalue
							|| min_timevalue;
				}
				section.dates.max_timevalue = Math.max.apply(null,
						section.dates.map(function(date) {
							return date.getTime();
						}));

				if (false) {
					parser.each_section();
					// scan / traversal section templates:
					parser.each.call(parser.sections[section_index],
							'template', function(token) {
								;
							});
				}

				if (false) {
					// 首位發言者, 發起人 index
					section.initiator_index = parser.each_section.index_filter(
							section, true, 'first');
				}

				// 最後發言日期 index
				var last_update_index = for_each_section.index_filter(section,
						true, 'last');
				// section.users[section.last_update_index] = {String}最後更新發言者
				// section.dates[section.last_update_index] = {Date}最後更新日期
				if (last_update_index >= 0) {
					section.last_update_index = last_update_index;
				}
				// 回應數量
				section.replies
				// 要先有不同的人發言，才能算作有回應。
				= section.users.unique().length >= 2 ? section.users.length - 1
						: 0;
				// console.log('users: ' + section.users);
				// console.log('replies: ' + section.replies);
			});
		}

		// console.trace(for_section);
		if (typeof for_section === 'function') {
			// TODO: return (result === for_each_token.remove_token)
			// TODO: move section to another page
			if (library_namespace.is_async_function(for_section)) {
				// console.log(all_root_section_list);
				return Promise.allSettled(all_root_section_list
						.map(for_section));

				// @deprecated
				all_root_section_list
						.forEach(function(section, section_index) {
							if (false) {
								console.log('Process: ' + section.section_title
								// section_title.toString(true): get inner
								&& section.section_title.toString(true));
							}
							return eval('(async function() {'
									+ ' try { return await for_section(section, section_index); }'
									+ ' catch(e) { library_namespace.error(e); }'
									+ ' })();');
						});
			} else {
				// for_section(section, section_index)
				all_root_section_list.some(for_section);
			}
		}
		return this;
	}

	// var section_index_filter =
	// CeL.wiki.parser.parser_prototype.each_section.index_filter;
	for_each_section.index_filter = function filter_users_of_section(section,
			filter, type) {
		// filter: user_name_filter
		var _filter;
		if (typeof filter === 'function') {
			_filter = filter;
		} else if (Array.isArray(filter)) {
			_filter = function(user_name) {
				// TODO: filter.some()
				return filter.includes(user_name);
			};
		} else if (library_namespace.is_Object(filter)) {
			_filter = function(user_name) {
				return user_name in filter;
			};
		} else if (library_namespace.is_RegExp(filter)) {
			_filter = function(user_name) {
				return filter.test(user_name);
			};
		} else if (typeof filter === 'string') {
			_filter = function(user_name) {
				return filter === user_name;
			};
		} else if (filter === true) {
			_filter = function() {
				return true;
			};
		} else {
			throw 'for_each_section.index_filter: Invalid filter: ' + filter;
		}

		// ----------------------------

		if (!type) {
			var user_and_date_indexs = [];
			section.users.forEach(function(user_name, index) {
				if (_filter(user_name)) {
					user_and_date_indexs.push(index);
				}
			});

			return user_and_date_indexs;
		}

		// ----------------------------

		var index_specified, date_specified;

		section.dates.forEach(function(date, index) {
			// assert: {Date}date is valid
			date = date.getTime();
			if (type === 'first' ? date_specified <= date : type === 'last'
					&& date < date_specified) {
				return;
			}

			var user_name = section.users[index];
			if (_filter(user_name)) {
				date_specified = date;
				index_specified = index;
			}
		});

		return index_specified;
	};

	/**
	 * 設定好，並執行解析頁面的作業。
	 * 
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {wiki page parser}
	 * 
	 * @see parse_wikitext()
	 */
	function parse_page(options) {
		if (!this.parsed
		// re-parse
		|| options && (options.reparse || options.wikitext)) {
			// assert: this = [ {String} ]
			// @see function page_parser(wikitext, options)
			var parsed = options && options.wikitext || this[0];
			parsed = parse_wikitext(parsed, Object.assign({
				target_array : this
			}, this.options, options));
			// library_namespace.log(parsed);
			// console.trace(parsed);
			if (parsed
			// for parsed === undefined (missing: '')
			&& (!Array.isArray(parsed) || parsed.type !== 'plain')) {
				this[0] = parsed;
			}
			this.parsed = true;
		}
		return this;
	}

	// ------------------------------------------------------------------------

	// CeL.wiki.parse.anchor.normalize_anchor()
	function normalize_anchor(anchor) {
		return anchor.toString().replace(/_/g, ' ');
	}
	get_all_anchor.normalize_anchor = normalize_anchor;

	if (false) {
		wiki_session.register_redirects(
				CeL.wiki.parse.anchor.essential_templates, {
					namespace : 'Template'
				});

		// ...

		var anchor_list = CeL.wiki.parse.anchor(wikitext, CeL.wiki
				.add_session_to_options(wiki_session));

		// ------------------

		// bad method: work without session
		var anchor_list = CeL.wiki.parse.anchor(wikitext);
	}

	// CeL.wiki.parse.anchor()
	function get_all_anchor(wikitext, options) {
		if (!wikitext) {
			return [];
		}

		// const
		var anchor_hash = Object.create(null);
		function register_anchor(anchor, token) {
			if (!anchor)
				return;
			anchor = normalize_anchor(anchor);
			anchor_hash[anchor] = token;
		}

		// const
		/** {Array} parsed page content 頁面解析後的結構。 */
		var parsed = page_parser(wikitext).parse();
		if (false) {
			library_namespace.assert([ wikitext, parsed.toString() ],
					'wikitext parser check for wikitext');
			console.log(parsed);
		}

		var session = wiki_API.session_of_options(options);
		// console.log(wiki_API.site_name(session));

		parsed.each_section();
		parsed.each('section_title', function(section_title_token) {
			// console.log(section_title_token);
			// const
			var section_title_link = section_title_token.link;
			// TODO: 忽略包含不合理元素的編輯，例如 url。
			if (!section_title_link.imprecise_tokens) {
				// `section_title_token.title` will not transfer "[", "]"
				register_anchor(section_title_link.id, section_title_token);

			} else if (section_title_link.tokens_maybe_handlable) {
				// exclude "=={{T}}=="
				library_namespace.warn('Title maybe handlable 請檢查是否可處理此標題: '
						+ section_title_token.title);
				console.log(section_title_link.tokens_maybe_handlable);
				console.trace(section_title_token);
			}
		});

		// 處理包含於 template 中之 anchor 網頁錨點 (section title / id="" / name="")
		parsed.each('transclusion', function(template_token) {
			// {{Anchor|anchor|別名1|別名2}}
			if (wiki_API.is_template('Anchor', template_token, options)
					|| wiki_API.is_template('Anchors', template_token, options)
					|| wiki_API.is_template('Visible anchor', template_token,
							options)) {
				for (/* let */var index = 1;
				//
				index < template_token.length; index++) {
					// const
					var anchor = template_token.parameters[index];
					register_anchor(anchor, template_token);
				}
				return;
			}

			// e.g., {{Cite book|...|ref=anchor}} @ [[日本の原子爆弾開発]]
			// {{Cite journal|...|ref=anchor}}
			if (/^Cite \w+/.test(template_token.name)
			// {{Citation|...|ref=anchor}}
			|| wiki_API.is_template('Citation', template_token, options)) {
				// console.trace(JSON.stringify(template_token.name));
				// const
				var anchor = template_token.parameters.ref;
				// console.trace(JSON.stringify(anchor));
				if (typeof anchor === 'string')
					register_anchor(anchor, template_token);
				return;
			}

			if (wiki_API.is_template('Wikicite', template_token, options)) {
				// const
				var anchor = template_token.parameters.ref
						|| template_token.parameters.id
						&& ('Reference-' + template_token.parameters.id);
				register_anchor(anchor, template_token);
				return;
			}

			if (wiki_API.is_template('SfnRef', template_token, options)) {
				var anchor = 'CITEREF';
				// console.trace(template_token);
				for (var index = 1; index <= 5; index++)
					if (template_token.parameters[index])
						anchor += template_token.parameters[index];
				register_anchor(anchor, template_token);
				return;
			}

			// 転送先のアンカーはTemplate:RFDの中に納まっている
			// e.g., {{RFD notice
			// |'''対象リダイレクト:'''[[Wikipedia:リダイレクトの削除依頼/受付#RFD長崎市電|長崎市電（受付依頼）]]|...}}
			if (wiki_API.site_name(session) === 'jawiki'
					&& wiki_API.is_template('RFD', template_token, options)) {
				// const
				var anchor = 'RFD' + template_token.parameters[1];
				register_anchor(anchor, template_token);
				return;
			}
		});

		// 處理 <span class="anchor" id="anchor"></span>, <ref name="anchor">,
		// id in table cell attribute
		parsed.each('tag_attributes', function(attribute_token) {
			// console.log(attribute_token.attributes);
			// const
			var anchor = attribute_token.attributes.id
					|| attribute_token.attributes.name;
			register_anchor(anchor, attribute_token);
		});

		var anchor_list = Object.keys(anchor_hash);
		if (options && options.print_anchors) {
			console.log('anchors:');
			console.trace(anchor_list.length > 100 ? JSON
					.stringify(anchor_list) : anchor_list);
		}
		return anchor_list;
	}

	// CeL.wiki.parse.anchor.essential_templates
	// required, indispensable
	get_all_anchor.essential_templates = [ 'Anchor', 'Anchors',
			'Visible anchor', 'Citation', 'RFD', 'Wikicite', 'SfnRef', 'Sfn' ];

	// ------------------------------------------------------------------------

	// parse <ref> of page
	// TODO: <ref group="">
	// TODO: <ref> in template
	function parse_references(options) {
		if (this.reference_list)
			return this.reference_list;

		if (typeof options === 'function') {
			options = {
				processor : options
			};
		}

		/** {Array}參考文獻列表, starts from No. 1 */
		var reference_list = new Array(1);

		this.each(function(token) {
			if (!token.tag || token.tag.toLowerCase() !== 'ref')
				return;

			if (typeof options.processor === 'function') {
				options.processor.apply(null, arguments);
			}

			if (token.attributes && ('name' in token.attributes)) {
				var attribute_name = token.attributes.name,
				// <ref>: name 屬性不能使用數字，請使用可描述內容的標題
				list = reference_list[attribute_name];
				if (list) {
					// index with the same name
					token.reference_index = list.length;
					list.push(token);
					// 已存在相同的名稱，不添加到 reference_list 以增加 NO。
				} else {
					token.reference_index = 0;
					list = [ token ];
					reference_list[attribute_name] = list;
					reference_list.push(list);
				}
				if (!list.main && token.type === 'tag'
				// 會採用第一個有內容的。
				&& token[1].toString().trim()) {
					list.main = token;
				}

			} else {
				reference_list.push(token);
			}

		}, false, Infinity);

		this.reference_list = reference_list;
		return reference_list;
	}

	// {{*Navigation templates}} (footer navboxes)
	// {{Coord}} or {{coord missing}}
	// {{Authority control}}
	// {{featured list}}, {{featured article}}, {{good article}}
	// {{Persondata}}
	// {{DEFAULTSORT:}}
	// [[Category:]]
	// {{Stub}}
	/** {Array}default footer order */
	var default_footer_order = 'transclusion|Coord,Coord Missing|Authority Control|Featured List,Featured Article,Good Article|Persondata|DEFAULTSORT,デフォルトソート|category|Stub'
	//
	.split('|').map(function(name) {
		if (name.includes(','))
			return name.split(',');
		return name;
	});

	// return
	// {Natural+0}: nodes listed in order_list
	// undefined: comments / <nowiki> or text may ignored ('\n') or other texts
	// NOT_FOUND < 0: unknown node
	function footer_order(node_to_test, order_list) {
		if (false && typeof node_to_test === 'string') {
			// skip text. e.g., '\n\n'
			return;
		}

		var type = node_to_test.type;
		if (!order_list) {
			order_list = default_footer_order;
		}
		if (type === 'category') {
			var order = order_list.lastIndexOf('category');
			if (order >= 0) {
				return order;
			}
		}

		if (type === 'transclusion') {
			var order = order_list.length, name = node_to_test.name;
			while (--order > 0) {
				var transclusion_name = order_list[order];
				if (Array.isArray(transclusion_name) ? transclusion_name
						.includes(name) : transclusion_name === name) {
					return order;
				}
			}
			if (order_list[0] === 'transclusion') {
				// skip [0]
				return 0;
			}

			if (false) {
				// other methods 1
				// assert: NOT_FOUND + 1 === 0
				return order_list.indexOf(node_to_test.name) + 1;

				// other methods 2
				if (order === NOT_FOUND) {
					// 當作 Navigation templates。
					return 0;
					library_namespace.debug('skip error/unknown transclusion: '
							+ node_to_test);
				}
				return order;
			}

		}

		if (type === 'comment' || node_to_test.tag === 'nowiki') {
			// skip comment. e.g., <!-- -->, <nowiki />
			return;
		}

		if (type) {
			library_namespace.debug('skip error/unknown node: ' + node_to_test);
			return NOT_FOUND;
		}

		// 其他都不管了。
	}

	function insert_before(before_node, to_insert) {
		var order_needed = parse_wikitext(before_node, null, []), order_list = this.order_list;
		if (order_needed) {
			order_needed = footer_order(order_needed, order_list);
		}
		if (!(order_needed >= 0)) {
			library_namespace.warn('insert_before: skip error/unknown node: '
					+ node_to_test);
			return this;
		}

		var index = this.length;
		// 從後面開始搜尋。
		while (index-- > 0) {
			// find the node/place to insert before
			if (typeof this[index] === 'string') {
				// skip text. e.g., '\n\n'
				continue;
			}
			var order = footer_order(this[index], order_list);
			if (order >= 0) {
				if (order === order_needed) {
					// insert before node_to_test
					this.splice(index, 0, to_insert);
					break;
				}

				if (order < order_needed) {
					// 已經過頭。
					// insert AFTER node_to_test
					this.splice(index + 1, 0, to_insert);
					break;
				}
			}
		}

		return this;
	}

	// ------------------------------------------------------------------------

	// @inner
	// get_layout_templates('short description', 'Template:Short description',
	// callback, session)
	function get_layout_templates(layout, layout_to_fetch, callback, options) {
		wiki_API.redirects_here(layout_to_fetch, function(root_page_data,
				redirect_list, error) {
			var session = wiki_API.session_of_options(options);
			var layout_index = session.configuration.layout_index;
			if (!layout_index[layout])
				layout_index[layout] = Object.create(null);
			if (false) {
				console.assert(!redirect_list
						|| redirect_list === root_page_data.redirect_list);
				console.log([ root_page_data, redirect_list ]);
			}
			redirect_list.forEach(function(page_data) {
				layout_index[layout][page_data.title] = null;
			});
			callback();
		}, Object.assign({
			// Making .redirect_list[0] the redirect target.
			include_root : true
		}, options));
	}

	// @inner
	function get_layout_categories(layout, layout_to_fetch, callback, options) {
		wiki_API.redirects_root(layout_to_fetch, function(title, page_data) {
			wiki_API.list(title, function(list/* , target, options */) {
				// assert: Array.isArray(list)
				if (list.error) {
					library_namespace.error(list.error);
					callback();
					return;
				}

				var session = wiki_API.session_of_options(options);
				var layout_index = session.configuration.layout_index;
				if (!layout_index[layout])
					layout_index[layout] = Object.create(null);
				list.forEach(function(page_data) {
					layout_index[layout][page_data.title] = layout_to_fetch;
				});
				callback();
			}, Object.assign({
				type : 'categorymembers'
			}, options));
		}, options);
	}

	// @inner
	function get_layout_elements(callback, options) {
		var layout_list = options.layout_list;
		var layout = layout_list.shift();
		if (!layout) {
			callback();
			return;
		}

		var layout_to_fetch = layout[1];
		if (Array.isArray(layout_to_fetch)) {
			if (layout_to_fetch.length === 0) {
				// Skip null layout_to_fetch
				get_layout_elements(callback, options);
				return;
			}
			layout_to_fetch = layout_to_fetch.shift();
			layout_list.unshift(layout);
		}
		layout = layout[0];

		if (/^Template:/i.test(layout_to_fetch)) {
			get_layout_templates(layout, layout_to_fetch, function() {
				get_layout_elements(callback, options);
			}, options);
			return;
		}

		if (/^Category:/i.test(layout_to_fetch)) {
			get_layout_categories(layout, layout_to_fetch, function() {
				get_layout_elements(callback, options);
			}, options);
			return;
		}

		throw new TypeError('Invalid layout to fetch: [' + layout + '] '
				+ layout_to_fetch);
	}

	// 取得定位各布局項目所需元素。
	function setup_layout_elements(callback, options) {
		var session = wiki_API.session_of_options(options);
		if (!session.configuration)
			session.configuration = Object.create(null);
		var layout_index = session.configuration.layout_index;
		if (layout_index) {
			callback();
			return;
		}
		layout_index = session.configuration.layout_index = Object.create(null);

		var layout_list = [];

		for ( var layout in layout_configuration) {
			var layout_to_fetch = layout_configuration[layout];
			layout_list.push([ layout, layout_to_fetch ]);
		}
		// console.log(layout_list);

		options.layout_list = layout_list;
		library_namespace.info('setup_layout_elements: Get all elements...');
		get_layout_elements(callback, options);
	}

	var layout_configuration = {
		// {{Short description}}
		'short description' : 'Template:Short description',

		// [[Category:Hatnote templates]]
		'hatnote' : 'Category:Hatnote templates',

		// Deletion / protection tags
		// [[Category:Speedy deletion templates]],
		// [[Category:Proposed deletion-related templates]],
		// [[Category:Protection templates]]
		'deletion tag' : [ 'Category:Speedy deletion templates',
				'Category:Proposed deletion-related templates',
				'Category:Protection templates' ],

		// Maintenance / dispute tags

		// {{Use British English}}, {{Use mdy dates}}
		'date style' : [ 'Template:Use mdy dates', 'Template:Use dmy dates' ],

		// {{Info...}}

		// [[Category:Foreign character warning boxes]]
		'foreign character warning box' : 'Category:Foreign character warning boxes'

	// Images
	// Navigational boxes (header navboxes)
	// introduction
	};

	// @inner
	function insert_maintenance_tag(token, options) {
		// this;
	}

	// TODO: 定位版面布局元素 search anchor tokens of elements @ [[WP:LAY]],
	// [[w:en:Wikipedia:Manual of Style/Layout#Order of article elements]],
	// [[w:en:Wikipedia:Manual of Style/Lead section]]
	// [[w:zh:Wikipedia:格式手冊/版面佈局#導言]]
	// [[w:en:Wikipedia:Talk page layout]]
	// location: 'hatnote', 'maintenance tag', 'navigation template'
	function insert_token(token, options) {
		var location;
		if (typeof options === 'string') {
			location = options;
			options = Object.create(null);
		} else {
			options = library_namespace.setup_options(options);
			location = options.location;
		}

		if (location === 'maintenance tag') {
			return insert_maintenance_tag.call(this, token, options);
		}

		throw new Error('Can not insert as ' + location);
	}

	// --------------------------------------------------------------------------------------------

	var font_templates = 'JIS90フォント|JIS2004フォント|CP932フォント|MacJapanese|ARIB外字フォント|絵文字フォント|補助漢字フォント|変体仮名フォント|通貨フォント|拡張漢字';
	var PATTERN_font_templates = new RegExp('{{ *(?:' + font_templates
			+ ') *\\|(.+?)}}', 'g');
	font_templates = font_templates.split('|').to_hash();

	// CeL.wiki.get_plain_display_text(link_token[2]).trim()
	function get_plain_display_text(display_text, options) {
		if (Array.isArray(display_text)) {
			for_each_token.call(display_text, 'template', function(token,
					index, parent) {
				if (token.name === 'Lang') {
					parent[index] = token.parameters[2];
					return;
				}

				// for jawiki
				if (token.name in font_templates) {
					parent[index] = token.parameters[1];
					return;
				}

			});
		}

		display_text = display_text.toString()
		// jawiki
		.replace(/{{ *[lL]ang *\|[a-z ]{2,}\|(.+?)}}/g, '$1')
		// jawiki
		.replace(PATTERN_font_templates, '$1')
		// <span lang="zh" xml:lang="zh">埕</span>
		.replace(/<span(?: +(?:xml:)?lang="[a-z]*")*>([^<>]*)<\/span>/g, '$1');

		display_text = library_namespace.HTML_to_Unicode(display_text);
		if (options && options.normalize_title)
			display_text = wiki_API.normalize_title(display_text);
		return display_text;
	}

	/**
	 * 將特殊標記解譯/還原成 {Array} 組成之結構。
	 * 
	 * @param {Array}queue
	 *            temporary queue.
	 * @param {String}include_mark
	 *            解析用之起始特殊標記。
	 * @param {String}end_mark
	 *            結束之特殊標記。
	 * 
	 * @see parse_wikitext()
	 */
	function resolve_escaped(queue, include_mark, end_mark) {
		if (false) {
			library_namespace.debug('queue: ' + queue.join('\n--- '), 4,
					'resolve_escaped');
			console.log('resolve_escaped: ' + JSON.stringify(queue));
		}

		var length = queue.length;
		for (var index = queue.last_resolved_length | 0; index < length; index++) {
			var item = queue[index];
			if (false)
				library_namespace.debug([ 'item', index, item ], 4,
						'resolve_escaped');
			if (typeof item !== 'string') {
				// already resolved
				// assert: Array.isArray(item)
				continue;
			}

			// result queue
			var result = [];

			item.split(include_mark).forEach(function(token, index) {
				if (index === 0) {
					if (token) {
						result.push(token);
					}
					return;
				}
				index = token.indexOf(end_mark);
				if (index === 0) {
					result.push(include_mark);
					return;
				}
				result.push(queue[+token.slice(0, index)]);
				if (token = token.slice(index + end_mark.length))
					result.push(token);
			});

			if (result.length > 1) {
				// console.log(result);
				set_wiki_type(result, 'plain');
			} else {
				result = result[0];
			}
			if (result.includes(include_mark)) {
				throw new Error('resolve_escaped: 仍有 include mark 殘留！');
			}
			queue[index] = result;
		}
		queue.last_resolved_length = length;
		// console.log('resolve_escaped end: '+JSON.stringify(queue));
	}

	// 經測試發現 {{...}} 名稱中不可有 [{}<>\[\]]
	// while(/{{{[^{}\[\]]+}}}/g.exec(wikitext));
	// 但允許 "{{\n name}}"
	// 模板名#後的內容會忽略。
	/** {RegExp}模板的匹配模式。 */
	var PATTERN_transclusion = /{{[\s\n]*([^\s\n#\|{}<>\[\]][^#\|{}<>\[\]]*)(?:#[^\|{}]*)?((?:\|[^<>\[\]]*)*?)}}/g,
	/**
	 * {RegExp}wikilink內部連結的匹配模式。
	 * 
	 * @see PATTERN_wikilink
	 */
	PATTERN_link = /\[\[[\s\n]*([^\s\n\|{}<>\[\]�][^\|{}<>\[\]�]*)((?:\|[^\|{}<>\[\]]*)*)\]\]/g,
	/**
	 * Wikimedia projects 的 external link 匹配模式。
	 * 
	 * matched: [ all external link wikitext, URL, delimiter, link name ]
	 * 
	 * 2016/2/23: 經測試，若為結尾 /$/ 不會 parse 成 external link。<br />
	 * 2016/2/23: "[ http...]" 中間有空白不會被判別成 external link。
	 * 
	 * @type {RegExp}
	 * 
	 * @see PATTERN_URL_GLOBAL, PATTERN_URL_WITH_PROTOCOL_GLOBAL,
	 *      PATTERN_URL_prefix, PATTERN_WIKI_URL, PATTERN_wiki_project_URL,
	 *      PATTERN_external_link_global
	 * 
	 * @see https://zh.wikipedia.org/w/api.php?action=query&meta=siteinfo&siprop=protocols&utf8&format=json
	 */
	PATTERN_external_link_global = /\[((?:https?:|ftps?:)?\/\/[^\s\|<>\[\]{}\/][^\s\|<>\[\]{}]*)(?:([^\S\r\n]+)([^\]]*))?\]/ig,
	/** {String}以"|"分開之 wiki tag name。 [[Help:Wiki markup]], HTML tags. 不包含 <a>！ */
	markup_tags = 'br|hr|bdi|b|del|ins|i|u|font|big|small|sub|sup|h[1-6]|cite|code|em|strike|strong|s|tt|var|div|center|blockquote|[oud]l|table|caption|pre|ruby|r[tbp]|p|span|abbr|dfn|kbd|samp|data|time|mark'
			// [[Help:Parser tag]], [[Help:Extension tag]]
			+ '|includeonly|noinclude|onlyinclude'
			// https://phabricator.wikimedia.org/T263082
			// 會讀取目標語言的 MediaWiki 轉換表
			// [[w:zh:Wikipedia:互助客栈/技术#新的语言转换语法已经启用]]
			// 使用 <langconvert> 的頁面，優先級順序大概是：-{}- 頁面語言切換 > <langconvert> > 轉換組？
			+ '|langconvert'
			// [[Special:Version#mw-version-parser-extensiontags]]
			// <ce> is deprecated, using <chem>
			// Replace all usages of <ce> with <chem> on wiki
			// https://phabricator.wikimedia.org/T155125
			+ '|categorytree|ce|chem|charinsert|gallery|graph|hiero|imagemap|indicator|inputbox|nowiki|mapframe|maplink|math|poem|quiz|ref|references|score|section|source|syntaxhighlight|templatedata|templatestyles|timeline',
	// MediaWiki 可接受的 HTML void elements 標籤.
	// NO b|span|sub|sup|li|dt|dd|center|small
	// 包含可使用，亦可不使用 self-closing 的 tags。
	// self-closing: void elements + foreign elements
	// https://www.w3.org/TR/html5/syntax.html#void-elements
	// @see [[phab:T134423]]
	// https://www.mediawiki.org/wiki/Manual:OutputPage.php
	//
	// templatestyles: https://www.mediawiki.org/wiki/Extension:TemplateStyles
	self_close_tags = 'nowiki|references|ref|area|base|br|col|embed|hr|img|input|keygen|link|meta|param|source|track|wbr|templatestyles',
	/** {RegExp}HTML tags 的匹配模式。 */
	PATTERN_WIKI_TAG = new RegExp('<(' + markup_tags
			+ ')(\\s(?:[^<>]*[^<>/])?)?>([\\s\\S]*?)<\\/(\\1)>', 'ig'),
	/** {RegExp}HTML tags 的匹配模式 of <nowiki>。 */
	PATTERN_WIKI_TAG_of_nowiki = new RegExp('<('
	// 這些 tag 就算中間置入 "<!--" 也沒作用，必須在 "<!--" 之前解析。
	+ 'nowiki|source|syntaxhighlight'
			+ ')(\\s(?:[^<>]*[^<>/])?)?>([\\s\\S]*?)<\\/(\\1)>', 'ig'),
	/** {RegExp}HTML tags 的匹配模式 without <nowiki>。 */
	PATTERN_WIKI_TAG_without_nowiki = new RegExp('<('
			+ markup_tags.replace('nowiki|', '')
			+ ')(\\s(?:[^<>]*[^<>/])?)?>([\\s\\S]*?)<\\/(\\1)>', 'ig'),
	/** {RegExp}HTML self closed tags 的匹配模式。 */
	PATTERN_WIKI_TAG_VOID = new RegExp('<(\/)?(' + self_close_tags
	// allow "<br/>"
	+ ')(\/|\\s[^<>]*)?>', 'ig'),
	// 在其內部的 wikitext 不會被parse。允許內部採用 table 語法的 tags。例如 [[mw:Manual:Extensions]]
	no_parse_tags = 'pre|nowiki|source|syntaxhighlight'.split('|').to_hash();

	function evaluate_parser_function(options) {
		var argument_1 = this.parameters[1] && this.parameters[1].toString();
		var argument_2 = this.parameters[2] && this.parameters[2].toString();
		var argument_3 = this.parameters[3] && this.parameters[3].toString();

		switch (this.name) {
		case 'len':
			// {{#len:string}}

			// TODO: ags such as <nowiki> and other tag extensions will always
			// have a length of zero, since their content is hidden from the
			// parser.
			return argument_1.length;

		case 'sub':
			// {{#sub:string|start|length}}
			return argument_3 ? argument_1.substring(argument_2, argument_3)
					: argument_1.slice(argument_2);

		case 'time':
			// https://www.mediawiki.org/wiki/Help:Extension:ParserFunctions##time
			// {{#time: format string | date/time object | language code | local
			// }}
			if (!argument_2 || argument_2 === 'now') {
				argument_2 = new Date;
				return argument_1.replace(/Y/g, argument_2.getUTCFullYear())
				//
				.replace(/n/g, argument_2.getUTCMonth() + 1)
				//
				.replace(/m/g, (argument_2.getUTCMonth() + 1).pad(2))
				//
				.replace(/j/g, argument_2.getUTCDate())
				//
				.replace(/d/g, argument_2.getUTCDate().pad(2));
				// TODO
			}

			// TODO
		}

		return this;
	}

	/**
	 * .toString() of wiki elements: wiki_toString[token.type]<br />
	 * parse_wikitext() 將把 wikitext 解析為各 {Array} 組成之結構。當以 .toString() 結合時，將呼叫
	 * .join() 組合各次元素。此處即為各 .toString() 之定義。<br />
	 * 所有的 key (type) 皆為小寫。
	 * 
	 * @type {Object}
	 * 
	 * @see parse_wikitext()
	 */
	var wiki_toString = {
		// internal/interwiki link : language links : category links, file,
		// subst 替換引用, ... : title
		// e.g., [[m:en:Help:Parser function]], [[m:Help:Interwiki linking]],
		// [[:File:image.png]], [[wikt:en:Wiktionary:A]],
		// [[:en:Template:Editnotices/Group/Wikipedia:Miscellany for deletion]]
		// [[:en:Marvel vs. Capcom 3: Fate of Two Worlds]]
		// [[w:en:Help:Link#Http: and https:]]
		//
		// 應當使用 [[w:zh:維基百科:編輯提示|編輯提示]] 而非 [[:zh:w:維基百科:編輯提示|編輯提示]]，
		// 見 [[User:Cewbot/Stop]]。
		//
		// @see [[Wikipedia:Namespace]]
		// https://www.mediawiki.org/wiki/Markup_spec#Namespaces
		// [[ m : abc ]] is OK, as "m : abc".
		// [[: en : abc ]] is OK, as "en : abc".
		// [[ :en:abc]] is NOT OK.
		namespaced_title : function() {
			return this.join(this.oddly ? '' : ':');
		},
		// page title, template name
		page_title : function() {
			return this.join(':');
		},
		// link 的變體。但可採用 .name 取得 file name。
		file : function() {
			return '[[' + this[0]
			// anchor 網頁錨點
			+ this[1]
			//
			+ (this.length > 2 ? '|' + this.slice(2).join('|') : '') + ']]';
		},
		// link 的變體。但可採用 .name 取得 category name。
		category : function() {
			return '[[' + this[0]
			// anchor 網頁錨點
			+ this[1]
			//
			+ (this.length > 2 ? '|' + this.slice(2).join('|') : '') + ']]';
		},
		// 內部連結 (wikilink / internal link) + interwiki link
		link : function() {
			return '[[' + this[0]
			// + (this[1] || '')
			+ this[1] + (this.length > 2
			// && this[2] !== undefined && this[2] !== null
			? '|'
			// + (this[2] || '')
			+ this[2] : '') + ']]';
		},
		// 外部連結 external link, external web link
		external_link : function() {
			// assert: this.length === 1 or 3
			// assert: this.length === 3
			// && this[1].trim() === '' && this[2] === this[2].trimStart()
			return '[' + this.join('') + ']';
		},
		url : function() {
			return this.join('');
		},
		// template parameter
		parameter : function() {
			return '{{{' + this.join('|') + '}}}';
		},
		// e.g., template
		transclusion : function() {
			return '{{' + this.join('|') + '}}';
		},
		'function' : function() {
			return '{{' + this[0] + this.slice(1).join('|') + '}}';
		},

		// [[Help:Table]]
		table : function() {
			// this: [ table style, row, row, ... ]
			return '{|' + this.join('') + '\n|}';
		},
		// table attributes / styles, old name before 2021/1/24: table_style
		table_attributes : function() {
			return this.join('');
		},
		// table caption
		caption : function() {
			// this: [ main caption, invalid caption, ... ]
			return (this.delimiter || '') + this.join('');
		},
		table_row : function() {
			// this: [ row style, cell, cell, ... ]
			return (this.delimiter || '') + this.join('');
		},
		table_cell : function() {
			// this: [ contents ]
			// this.delimiter:
			// /\n[!|]|!!|\|\|/ or undefined (在 style/第一區間就已當作 cell)
			return (this.delimiter || '') + this.join('');
		},

		// 手工字詞轉換 language conversion -{}-
		convert : function(language, lang_fallbacks, force_show) {
			if (!language) {
				return '-{' + ('_flag' in this ? this._flag + '|' : '')
				//
				+ this.join(';') + '}-';
			}

			if (language === 'rule') {
				// gets the rule of conversion only
				return this.join(';');
			}

			var flag = this.flag;
			if (!force_show && (flag in {
				// add rule for convert code (but no display in placed code)
				H : true,
				T : true,
				'-' : true
			})) {
				return '';
			}

			if (flag in {
				// raw content
				R : true,
				// description
				D : true
			}) {
				return this.join(';');
			}

			language = language.trim().toLowerCase();
			if (Array.isArray(flag)) {
				if (!flag.includes(language)) {
					// 單純顯示不繁簡轉換的文字
					return this.join(';');
				}
				// TODO: 顯示繁簡轉換後的文字
				return this.join(';');
			}

			// TODO: 後援語種 fallback language variant

			// https://zh.wikipedia.org/w/api.php?action=query&meta=siteinfo&siprop=general%7Cnamespaces%7Cnamespacealiases%7Cstatistics
			// language fallbacks: [[mw:Localisation statistics]]
			// (zh-tw, zh-hk, zh-mo) → zh-hant (→ zh?)
			// (zh-cn, zh-sg, zh-my) → zh-hans (→ zh?)
			// [[Wikipedia_talk:地区词处理#zh-my|馬來西亞簡體華語]]
			// [[MediaWiki:Variantname-zh-tw]]
			if (!this.conversion[language]) {
				if (/^zh-(?:tw|hk|mo)/.test(language)) {
					language = 'zh-hant';
				} else if (/^zh/.test(language)) {
					language = 'zh-hans';
				}
			}

			var convert_to = this.conversion[language];
			if (Array.isArray(convert_to)) {
				// e.g., -{H|zh-tw:a-{b}-c}-
				var not_all_string;
				convert_to = convert_to.map(function(token) {
					if (typeof token === 'string')
						return token;
					if (token.type === 'convert'
							&& typeof token.converted === 'string')
						return token.converted;
					not_all_string = true;
				});
				if (!not_all_string)
					convert_to = convert_to.join('');
				else
					convert_to = this.conversion[language];
			}

			return convert_to
			//
			|| typeof this.converted === 'string' && this.converted
			// [[MediaWiki:Converter-manual-rule-error]]: 在手动语言转换规则中检测到错误
			|| 'converter-manual-rule-error';
		},

		// Behavior switches
		'switch' : function() {
			// assert: this.length === 1
			return '__' + this[0] + '__';
		},
		// italic type
		italic : function() {
			return "''" + this.join('') + (this.no_end ? '' : "''");
		},
		// emphasis
		bold : function() {
			return "'''" + this.join('') + (this.no_end ? '' : "'''");
		},

		// section title / section name
		// show all section titles:
		// parser=CeL.wiki.parser(page_data);parser.each('section_title',function(token,index){console.log('['+index+']'+token.title);},false,1);
		// @see for_each_token()
		// parser.each('plain',function(token){},{slice:[1,2]});
		section_title : function(get_inner) {
			// this.join(''): 必須與 wikitext 相同。見 parse_wikitext.title。
			var inner = this.join('');
			if (get_inner) {
				// section_title.toString(true): get inner
				// Must .trim() yourself.
				return inner;
			}

			var level = '='.repeat(this.level);
			return level + inner + level
			// this.postfix maybe undefined, string, {Array}
			+ (this.postfix || '');
		},

		// [[Help:Wiki markup]], HTML tags
		tag : function() {
			// this: [ {String}attributes, {Array}inner nodes ].tag
			// 欲取得 .tagName，請用 this.tag.toLowerCase();
			// 欲取得 .inner nodes，請用 this[1];
			// 欲取得 .innerHTML，請用 this[1].toString();
			return '<' + this.tag + (this[0] || '') + '>' + this[1] + '</'
					+ (this.end_tag || this.tag) + '>';
		},
		tag_attributes : function() {
			return this.join('');
		},
		tag_inner : function() {
			return this.join('');
		},
		tag_single : function() {
			// this: [ {String}attributes ].tag
			// 欲取得 .tagName，請用 this.tag.toLowerCase();
			return '<' + (this.slash || '') + this.tag + this.join('') + '>';
		},

		// comments: <!-- ... -->
		comment : function() {
			// "<\": for Eclipse JSDoc.
			return '<\!--' + this.join('') + (this.no_end ? '' : '-->');
		},
		line : function() {
			// https://www.mediawiki.org/wiki/Markup_spec/BNF/Article
			// NewLine = ? carriage return and line feed ? ;
			return this.join('\n');
		},
		list : function() {
			return this.join('');
		},
		list_item : function() {
			return (this.list_prefix || '') + this.join('');
		},
		pre : function() {
			return ' ' + this.join('\n ');
		},
		hr : function() {
			return this[0];
		},
		paragraph : function() {
			return this.join('\n') + (this.separator || '');
		},
		// plain text 或尚未 parse 的 wikitext.
		plain : function() {
			return this.join('');
		}
	};

	// const , for <dl>
	var DEFINITION_LIST = 'd';

	var Magic_words_hash = Object.create(null);
	// https://zh.wikipedia.org/w/api.php?action=query&meta=siteinfo&siprop=functionhooks&utf8&format=json
	'DISPLAYTITLE|DEFAULTSORT|デフォルトソート|NAMESPACE|LOCALURL|FULLURL|FILEPATH|URLENCODE|NS|LC|UC|UCFIRST'
	// 這些需要指定數值. e.g., {{DEFAULTSORT:1}}: OK, {{DEFAULTSORT}}: NG
	.split('|').forEach(function name(Magic_words) {
		Magic_words_hash[Magic_words] = false;
	});
	// https://zh.wikipedia.org/w/api.php?action=query&meta=siteinfo&siprop=variables&utf8&format=json
	'CURRENTYEAR|CURRENTMONTH|CURRENTDAY|CURRENTTIME|CURRENTHOUR|CURRENTWEEK|CURRENTTIMESTAMP|FULLPAGENAME|PAGENAME|BASEPAGENAME|SUBPAGENAME|SUBJECTPAGENAME|TALKPAGENAME'
	// 這些不用指定數值.
	.split('|').forEach(function name(Magic_words) {
		Magic_words_hash[Magic_words] = true;
	});

	// parse 手動轉換語法的轉換標籤的語法
	// 經測試，":"前面與後面不可皆有空白。
	// (\s{2,}): 最後的單一/\s/會被轉換為"&#160;"
	// matched: [ all, 指定轉換字串, 指定轉換詞, spaces,
	// this language code, colon, this language token, last spaces ]
	var PATTERN_conversion = /^(([\s\S]+?)=>)?(\s*)(zh(?:-(?:cn|tw|hk|mo|sg|my|hant|hans))?)(\s*:|:\s*)(\S.*?)(\s{2,})?$/;

	// 狀態開關: [[mw:Help:Magic words#Behavior switches]]
	var PATTERN_BEHAVIOR_SWITCH = /__([A-Z]+(?:_[A-Z]+)*)__/g;
	PATTERN_BEHAVIOR_SWITCH = /__(NOTOC|FORCETOC|TOC|NOEDITSECTION|NEWSECTIONLINK|NONEWSECTIONLINK|NOGALLERY|HIDDENCAT|NOCONTENTCONVERT|NOCC|NOTITLECONVERT|NOTC|INDEX|NOINDEX|STATICREDIRECT|NOGLOBAL)__/g;

	// [[w:en:Wikipedia:Extended image syntax]]
	// [[mw:Help:Images]]
	var file_options = {
		// Type, display format, 表示形式
		thumb : 'format',
		thumbnail : 'format',
		frame : 'format',
		framed : 'format',
		frameless : 'format',

		// Border, 外枠, 縁取る, 境界
		border : 'border',

		// Location, Horizontal alignment option, 配置位置
		right : 'location',
		left : 'location',
		// 居中, 不浮動
		center : 'location',
		// 不浮動
		none : 'location',

		// Vertical alignment option, 垂直方向の位置
		baseline : 'alignment',
		middle : 'alignment',
		sub : 'alignment',
		'super' : 'alignment',
		'text-top' : 'alignment',
		'text-bottom' : 'alignment',
		top : 'alignment',
		bottom : 'alignment',

		// Link option
		// link : 'link',

		// alt : 'alt',
		// lang : 'language',

		// https://en.wikipedia.org/wiki/Wikipedia:Creation_and_usage_of_media_files#Setting_a_video_thumbnail_image
		// thumbtime : 'video_thumbtime',
		// start : 'video_start',
		// end : 'video_end',

		// page : 'book_page',
		// 'class' : 'CSS_class',

		// Size, Resizing option
		// 放大倍數
		upright : 'size'
	};

	function join_string_of_array(array) {
		for (var index = 1; index < array.length;) {
			if (typeof array[index] !== 'string') {
				index++;
				continue;
			}

			if (array[index] === '') {
				array.splice(index, 1);
				continue;
			}

			if (typeof array[index - 1] === 'string') {
				array[index - 1] += array[index];
				array.splice(index, 1);
			} else {
				index++;
			}
		}

		return array;
	}

	function is_parsed_element(value) {
		return Array.isArray(value) && value.type;
	}

	/**
	 * parse The MediaWiki markup language (wikitext). 解析維基語法。
	 * 
	 * TODO:<code>

	parse error: [[File:]] 可以允許換行
	[[俄羅斯公民簽證要求]]: [[File:Visa requirements for Russian citizens.png|Visa requirements for Russian citizens|thumb|800px|center|俄罗斯护照持有人可免签证或落地签证前往的国家或地区 
	{{legend|#042E9B|[[俄罗斯]]}}{{legend|#2196f3|[[克里米亚]]}}{{legend|#ffc726|[[:en:Internal_passport_of_Russia|内部护照]]|]]}}{{legend|#22b14c|免签证}}{{legend|#B5E61D|落地签证}}{{legend|#61c09a|电子签证}}{{legend|#79D343|需电子签证或预先在互联网注册}}{{legend|#A8ACAB|需要申请签证}}]]

	parse 嵌入section內文 [[mw:Extension:Labeled_Section_Transclusion]]:
	{{#lsth:page_title|section begin in wikitext|section end in wikitext}}, {{#section-h:page_title}} 語意上相當於 {{page_title#section}}。如果有多個相同名稱的section，僅轉換第一個。The matching is case insensitive
	TODO: parse <section begin=chapter1 />, {{#lst:page_title|section begin|section end}}, {{#lstx:page_title|section|replacement_text}}

	提高效率。e.g., [[三国杀武将列表]], [[世界大桥列表]], [[三国杀武将列表]]<br />
	可能為模板參數特殊設計？有些 template 內含不完整的起始或結尾，使 parameter 亦未首尾對應。

	{{L<!-- -->L}} .valueOf() === '{{LL}}'
	<p<!-- -->re>...</pre>
	CeL.wiki.page('上海外国语大学',function(page_data){CeL.wiki.parser(page_data).parse();})
	[https://a.b <a>a</a><!-- -->]
	[[<a>a</a>]]
	CeL.wiki.parser('a[[未來日記-ANOTHER:WORLD-]]b').parse()[1]
	<nowiki>...<!-- -->...</nowiki> 中的註解不應被削掉!

	parse {{Template:Single chart}}

	</code>
	 * 
	 * 此功能之工作機制/原理：<br />
	 * 找出完整的最小單元，並將之 push 入 queue，並把原 string 中之單元 token 替換成:<br />
	 * {String}include_mark + ({ℕ⁰:Natural+0}index of queue) + end_mark<br />
	 * e.g.,<br />
	 * "a[[p]]b{{t}}" →<br />
	 * "a[[p]]b\00;", queue = [ ["t"].type='transclusion' ] →<br />
	 * "a\01;b\00;", queue = [ ["t"].type='transclusion', ["p"].type='link' ]<br />
	 * 最後再依 queue 與剩下的 wikitext，以 resolve_escaped() 作 resolve。
	 * 
	 * @param {String}wikitext
	 *            wikitext to parse
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * @param {Array}[queue]
	 *            temporary queue. 基本上僅供內部使用。
	 * 
	 * @returns {Array}parsed data
	 * 
	 * @see https://blog.wikimedia.org/2013/03/04/parsoid-how-wikipedia-catches-up-with-the-web/
	 *      https://phabricator.wikimedia.org/diffusion/GPAR/
	 * 
	 * @see [[w:en:Help:Wikitext]], [[Wiki標記式語言]]
	 *      https://www.mediawiki.org/wiki/Markup_spec/BNF/Article
	 *      https://www.mediawiki.org/wiki/Markup_spec/BNF/Inline_text
	 *      https://www.mediawiki.org/wiki/Markup_spec
	 *      https://www.mediawiki.org/wiki/Wikitext
	 *      https://doc.wikimedia.org/mediawiki-core/master/php/html/Parser_8php.html
	 *      Parser.php: PHP parser that converts wiki markup to HTML.
	 *      https://mwparserfromhell.readthedocs.io/
	 */
	function parse_wikitext(wikitext, options, queue) {
		if (!wikitext) {
			return wikitext;
		}

		function _set_wiki_type(token, type) {
			// 這可能性已經在下面個別處理程序中偵測並去除。
			if (false && typeof token === 'string'
					&& token.includes(include_mark)) {
				queue.push(token);
				resolve_escaped(queue, include_mark, end_mark);
				token = [ queue.pop() ];
			}

			return set_wiki_type(token, type, wikitext);

			// 因為parse_wikitext()採用的是從leaf到root的解析法，因此無法在解析leaf時就知道depth。
			// 故以下廢棄。
			var node = set_wiki_type(token, type);
			library_namespace.debug('set depth ' + depth_of_children
					+ ' to children [' + node + ']', 3, '_set_wiki_type');
			node[KEY_DEPTH] = depth_of_children;
			return node;
		}

		// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
		// 每個parse_wikitext()都需要新的options，需要全新的。
		// options = Object.assign({}, options);
		options = library_namespace.setup_options(options);

		if (false) {
			// assert: false>=0, (undefined>=0)
			// assert: (NaN | 0) === 0
			var depth_of_children = ((options[KEY_DEPTH]) | 0) + 1;
			// assert: depth_of_children >= 1
			library_namespace.debug('[' + wikitext + ']: depth_of_children: '
					+ depth_of_children, 3, 'parse_wikitext');
			options[KEY_DEPTH] = depth_of_children;
		}

		var
		/**
		 * 解析用之起始特殊標記。<br />
		 * 需找出一個文件中不可包含，亦不會被解析的字串，作為解析用之起始特殊標記。<br />
		 * e.g., '\u0000'.<br />
		 * include_mark + ({ℕ⁰:Natural+0}index of queue) + end_mark
		 * 
		 * assert: /\s/.test(include_mark) === false
		 * 
		 * @type {String}
		 */
		include_mark = options.include_mark || '\u0000',
		/**
		 * {String}結束之特殊標記。 end of include_mark. 不可為數字 (\d) 或
		 * include_mark，不包含會被解析的字元如 /;/。應為 wikitext 所不容許之字元。
		 */
		end_mark = options.end_mark || '\u0001',
		/** {Boolean}是否順便作正規化。預設不會規範頁面內容。 */
		normalize = options.normalize,
		/** {Array}是否需要初始化。 [ {String}prefix added, {String}postfix added ] */
		initialized_fix = !queue && [ '', '' ],
		// 這項設定不應被繼承。
		no_resolve = options.no_resolve;
		if (no_resolve) {
			delete options.no_resolve;
		}

		if (/\d/.test(end_mark) || include_mark.includes(end_mark))
			throw new Error('Error end of include_mark!');

		if (initialized_fix) {
			// 初始化。
			// console.log(wikitext);
			wikitext = wikitext
			// 注意: 2004年5月早期的中文維基百科換行採用 "\r\n"，因此必須保留 "\r"。
			// .replace(/\r\n/g, '\n')
			.replace(
			// 先 escape 掉會造成問題之 characters。
			new RegExp(include_mark.replace(/([\s\S])/g, '\\$1'), 'g'),
					include_mark + end_mark);
			if (!wikitext.startsWith('\n') &&
			// /\n([*#:;]+|[= ]|{\|)/:
			// https://www.mediawiki.org/wiki/Markup_spec/BNF/Article#Wiki-page
			// https://www.mediawiki.org/wiki/Markup_spec#Start_of_line_only
			/^(?:[*#;:=\s]|{\|)/.test(wikitext))
				wikitext = (initialized_fix[0] = '\n') + wikitext;
			if (!wikitext.endsWith('\n'))
				wikitext += (initialized_fix[1] = '\n');
			// temporary queue
			queue = [];
		}

		if (!options.conversion_table) {
			// [[MediaWiki:Conversiontable/zh-hant]]
			options.conversion_table = Object.create(null);
		}

		if (typeof options.prefix === 'function') {
			wikitext = options.prefix(wikitext, queue, include_mark, end_mark)
					|| wikitext;
		}

		// 預防有特殊 elements 置入其中。此時將之當作普通 element 看待。
		// cf. deep resolve_escaped()
		function shallow_resolve_escaped(text) {
			if (text.includes(include_mark)) {
				// 經過改變，需再進一步處理。
				text = parse_wikitext(text, options, queue);
			}
			return text;
		}

		// console.trace(wikitext);

		// ------------------------------------------------------------------------
		// parse functions

		function parse_language_conversion(all, parameters) {
			// -{...}- 自 end_mark 向前回溯。
			var index = parameters.lastIndexOf('-{'), previous;
			if (index > 0) {
				previous = '-{' + parameters.slice(0, index);
				parameters = parameters.slice(index + '}-'.length);
			} else {
				previous = '';
			}
			library_namespace.debug(previous + ' + ' + parameters, 4,
					'parse_wikitext.convert');

			// console.log(parameters);

			var conversion = Object.create(null),
			//
			conversion_list = [], latest_language;

			var _flag = parameters.match(/^([a-zA-Z\-;\s]*)\|(.*)$/), flag;
			if (_flag) {
				parameters = _flag[2];
				var flag_hash = Object.create(null);
				_flag = _flag[1];
				flag = _flag.split(';').map(function(f) {
					f = f.trim();
					if (f)
						flag_hash[f] = true;
					return f;
				}).filter(function(f) {
					return !!f;
				});
				if (flag.length === 0) {
					flag = null;
				} else {
					// https://doc.wikimedia.org/mediawiki-core/master/php/ConverterRule_8php_source.html
					// 僅取首先符合者。
					[ 'R', 'N', '-', 'T', 'H', 'A', 'D' ].some(function(f) {
						if (flag_hash[f]) {
							flag = f;
							return true;
						}
					});
				}
			}

			var conversion_table = flag && (flag in {
				// '+' add rules for alltext
				// '+' : true,

				// these flags above are reserved for program

				// remove convert (not implement)
				// '-' : true,

				// add rule for convert code (but no display in placed code)
				H : true,
				// add rule for convert code (all text convert)
				A : true
			}) && options.conversion_table;

			// console.log('parameters: ' + JSON.stringify(parameters));
			parameters = parameters.split(';');
			parameters.forEach(function(converted, index) {
				if (normalize) {
					// remove spaces
					converted = converted.trim();
				}
				if (PATTERN_conversion.test(converted)
				// e.g., "-{ a; zh-tw: tw }-" 之 " a"
				|| conversion_list.length === 0
				// 最後一個是空白。
				|| !converted.trim() && index + 1 === parameters.length) {
					conversion_list.push(converted);
				} else {
					conversion_list[conversion_list.length - 1]
					// e.g., "-{zh-tw: tw ; tw : tw2}-"
					+= ';' + converted;
				}
			});
			// console.log(conversion_list);
			var convert_from_hash = conversion_table && Object.create(null);
			/**
			 * <code>

			-{zh-cn:cn; zh-tw:tw;}-
			→
			conversion_table['cn'] = conversion_table['tw'] =
			{'zh-cn':'cn','zh-tw':'tw'}


			-{txt=>zh-cn:cn; txt=>zh-tw:tw;}-
			→
			conversion_table['txt'] =
			{'zh-cn':'cn','zh-tw':'tw'}


			-{txt=>zh-cn:cn; zh-cn:cn; zh-tw:tw;}-
			→
			conversion_table['txt'] =
			{'zh-cn':'cn'}
			∪
			conversion_table['cn'] = conversion_table['tw'] =
			{'zh-cn':'cn','zh-tw':'tw'}

			</code>
			 */
			// TODO: 剖析不出任何對應規則的話，則為 R 旗標轉換，即是停用字詞轉換，顯示原文（R stands for raw）。
			conversion_list = conversion_list.map(function(token) {
				var matched = token.match(PATTERN_conversion);
				// console.log(matched);
				if (!matched
				// e.g., -{A|=>zh-tw:tw}-
				|| matched[1] && !(matched[2] = matched[2].trim())) {
					// 經過改變，需再進一步處理。
					return parse_wikitext(token, options, queue);
				}

				// matched.shift();
				matched = matched.slice(1);

				// matched: [ 指定轉換字串, 指定轉換詞, spaces,
				// this language code, colon, this language token, last spaces ]
				if (!matched[6])
					matched.pop();

				// 語言代碼 language variant 用字模式
				var language_code = matched[3].trim(), convert_to
				// 經過改變，需再進一步處理。
				= matched[5] = parse_wikitext(matched[5], options, queue);
				if (!convert_to) {
					// 'converter-manual-rule-error'
					return parse_wikitext(token, options, queue);
				}
				conversion[language_code] = convert_to;
				if (!matched[2]) {
					matched.splice(2, 1);
				}
				var specified_from;
				if (matched[0]) {
					specified_from = matched[1];
					matched.splice(1, 1);
				} else {
					matched.splice(0, 2);
				}
				token = _set_wiki_type(matched, 'plain');
				token.is_conversion = true;

				if (!conversion_table) {
					;
				} else if (specified_from) {
					if (!conversion_table[specified_from]) {
						conversion_table[specified_from]
						// Initialization
						= Object.create(null);
					} else if (conversion_table[specified_from].conversion) {
						conversion_table[specified_from] = Object.clone(
						// assert:
						// conversion_table[specified_from].type==='convert'
						conversion_table[specified_from].conversion);
					}

					if (false && options.conflict_conversion
					// overwrite
					&& conversion_table[specified_from][language_code]) {
						options.conflict_conversion.call(conversion_table,
								specified_from, language_code,
								conversion_table[specified_from]
								//
								[language_code], convert_to);
					}

					conversion_table[specified_from][language_code]
					// settle
					= convert_to;

				} else if (typeof convert_to === 'string') {
					// 後面的設定會覆蓋先前的設定。
					convert_from_hash[language_code] = convert_to;
				} else if (convert_to && convert_to.type === 'plain') {
					// -{H|zh-cn:俄-{匊}-斯;zh-tw:俄-{匊}-斯;zh-hk:俄-{匊}-斯;}-
					// 當作 "俄匊斯"
					var not_all_string;
					convert_to = convert_to.map(function(token) {
						if (typeof token === 'string')
							return token;
						if (token.type === 'convert'
								&& typeof token.converted === 'string')
							return token.converted;
						not_all_string = true;
					});
					if (!not_all_string) {
						// 後面的設定會覆蓋先前的設定。
						convert_from_hash[language_code] = convert_to.join('');
					}
				}

				// console.log(JSON.stringify(token));
				return token;
			});
			if (options.normalize) {
				// 正規化後可以不保留 -{...;}- 最後的 ';'
				conversion_list = conversion_list.filter(function(token) {
					return !!token;
				});
				conversion_list.sort(function(_1, _2) {
					// assert: {Array} _1, _2
					return _1[0] < _2[0] ? -1 : _1[0] > _2[0] ? 1 : 0;
				});
			}
			// console.log(conversion_list);
			parameters = _set_wiki_type(conversion_list, 'convert');
			parameters.conversion = conversion;
			if (typeof _flag === 'string') {
				parameters._flag = _flag;
				parameters.flag = flag;
				if (flag === 'T')
					options.conversion_title = parameters;
			}
			// console.log(convert_from_hash);
			convert_from_hash && Object.values(convert_from_hash)
			//
			.forEach(function(convert_from_string) {
				// console.log(convert_from_string);
				conversion_table[convert_from_string] = parameters;
			});
			// console.log(JSON.stringify(wikitext));
			// console.log(conversion_table);

			if (queue.switches && (queue.switches.__NOCC__
			// 使用魔術字 __NOCC__ 或 __NOCONTENTCONVERT__ 可避免轉換。
			|| queue.switches.__NOCONTENTCONVERT__)) {
				parameters.no_convert = true;
			} else if (Object.keys(conversion).length === 0) {
				// assert: parameters.length === 1
				// e.g., "-{ t {{T}} }-"
				// NOT "-{ zh-tw: tw {{T}} }-"
				parameters.converted = parameters[0];
			} else if (options.language) {
				// TODO: 先檢測當前使用的語言，然後轉成在當前環境下轉換過、會顯示出的結果。
				parameters.converted = parameters.toString(options.language);
			}

			queue.push(parameters);
			return previous + include_mark + (queue.length - 1) + end_mark;
		}

		// TODO: 緊接在連結後面的 /[a-zA-Z\x80-\x10ffff]+/ 會顯示為連結的一部分
		// https://phabricator.wikimedia.org/T263266
		function parse_wikilink(all_link, page_and_section, page_name,
				section_title, display_text) {
			// 自 end_mark 向前回溯。
			var previous;
			if (display_text && display_text.includes('[[')) {
				var index = all_link.lastIndexOf('[[');
				previous = all_link.slice(0, index);
				all_link = all_link.slice(index);
				if (index = all_link.match(PATTERN_wikilink)) {
					page_and_section = index[1];
					page_name = index[2];
					section_title = index[3];
					display_text = index[4];
				} else {
					// revert
					all_link = previous + all_link;
					previous = '';
				}
			} else {
				previous = '';
			}
			library_namespace.debug(previous + ' + ' + all_link, 4,
					'parse_wikitext.link');

			var file_matched, category_matched;
			if (!page_name) {
				// assert: [[#section_title]]
				page_name = '';
				section_title = page_and_section;
			} else {
				if (!section_title) {
					section_title = '';
				}
				if (normalize) {
					page_name = page_name.trim();
				}
				// test [[file:name|...|...]]
				file_matched = page_name.match(PATTERN_file_prefix);
				if (!file_matched) {
					category_matched = page_name
					// test [[Category:name|order]]
					.match(PATTERN_category_prefix);
					// console.log([ page_name, category_matched ]);
				} else if (file_matched[1]) {
					// console.trace(file_matched);
					file_matched = null;
				}
				if (page_name.includes(include_mark)) {
					// console.trace(page_name);
					// 預防有特殊 elements 置入link其中。
					page_name = parse_wikitext(page_name, options, queue);
					if (false) {
						console.log([ all_link, page_and_section, page_name,
								section_title, display_text ]);
					}
					if (page_name.some(function(token) {
						return token.is_link;
					})) {
						// e.g., [[:[[Portal:中國大陸新聞動態|中国大陆新闻]] 3月16日新闻]]
						// [[[[t|l]], t|l]]
						// console.trace(page_name);
						page_name.oddly = 'link_inside_link';
					} else {
						page_name.oddly = true;
					}
				} else {
					// TODO: normalize 對 [[文章名稱 : 次名稱]] 可能出現問題。
					page_name = page_name.split(normalize ? /\s*:\s*/ : ':');
				}
				page_name = _set_wiki_type(page_name, 'namespaced_title');
			}
			if (normalize) {
				// assert: section_title && section_title.startsWith('#')
				section_title = section_title.trimEnd();
			}
			if (section_title) {
				// 經過改變，需再進一步處理。
				// e.g., '[[t#-{c}-]]'
				section_title = parse_wikitext(section_title, options, queue);
			}

			// [ page_name, section_title / #anchor 網頁錨點, display_text ]
			var parameters = [ page_name, section_title ];

			// assert: 'a'.match(/(b)?/)[1]===undefined
			if (typeof display_text === 'string') {
				if (file_matched) {
					// caption 可以放在中間，但即使是空白也會被認作是 caption:
					// ;;; [[File:a.svg|caption|thumb]]
					// === [[File:a.svg|thumb|caption]]
					// !== [[File:a.svg|NG caption|thumb|]]
					// === [[File:a.svg|thumb|NG caption|]]

					// 先處理掉裏面的功能性代碼。 e.g.,
					// [[File:a.svg|alt=alt_of_{{tl|t}}|NG_caption|gykvg=56789{{tl|t}}|{{#ifexist:abc|alt|link}}=abc|{{#ifexist:abc|left|456}}|{{#expr:100+300}}px|thumb]]
					// e.g., [[File:a.svg|''a''|caption]]
					display_text = parse_wikitext(display_text, {
						no_resolve : true
					}, queue);

					parameters.index_of = Object.create(null);

					// [ file namespace, section_title,
					// parameters 1, parameters 2, parameters..., caption ]
					var token, file_option,
					// parameters 有分大小寫，並且各種類會以首先符合的為主。
					PATTERN = /([^\|]*?)(\||$)/ig;
					// assert: 這會將剩下來的全部分完。
					while (token = PATTERN.exec(display_text)) {
						var matched = token[1].match(
						// [ all, head space, option name or value, undefined,
						// undefined, tail space ]
						// or
						// [ all, head space, option name, "="+space, value,
						// tail space ]
						/^([\s\n]*)([^={}\[\]<>\s\n][^={}\[\]<>]*?)(?:(=[\s\n]*)([\s\S]*?))?([\s\n]*)$/
						// TODO: 經測試，link等號前方不可有空格，alt等號前方可有空格。必須用小寫的"alt"。
						// 現在的處理方法只允許等號前面不可有空格。
						// 檔案選項名稱可以在地化，不一定都是 [a-z]。
						);
						if (!matched) {
							// e.g., " a<br/>b "
							matched = token[1]
									.match(/^([\s\n]*)([\s\S]*?)([\s\n]*)$/);
							if (matched[1] || matched[3]) {
								// image_description
								parameters.caption
								// 相當於 .trim()
								= matched[2] = parse_wikitext(matched[2],
										options, queue);
								if (!matched[3])
									matched.pop();
								matched.shift();
								if (!matched[0])
									matched.shift();
								_set_wiki_type(matched, 'plain');
							} else {
								parameters.caption
								// assert: 前後都沒有空白。
								= matched = parse_wikitext(token[1], options,
										queue);
							}
							parameters.push(matched);
							if (!token[2]) {
								break;
							}
							continue;
						}

						// 除了 alt, caption 外，這些 option tokens 不應包含功能性代碼。

						matched[2]
						//
						= parse_wikitext(matched[2], options, queue);

						// has equal sign "="
						var has_equal = typeof matched[4] === 'string';
						if (has_equal) {
							// e.g., |alt=text|
							matched[4] = parse_wikitext(matched[4], options,
									queue);
							// [ head space, option name, "="+space, value,
							// tail space ]
							file_option = matched.slice(1);
						} else {
							// e.g., |right|
							// [ head space, option name or value, tail space ]
							file_option = [ matched[1],
							//
							matched[2], matched[5] ];
						}
						file_option = _set_wiki_type(file_option, 'plain');

						// 'right' of |right|, 'alt' of |alt=foo|
						var option_name = file_option[1],
						//
						option_value = has_equal && file_option[3];

						// reduce
						while (!file_option[0]) {
							file_option.shift();
						}
						while (!file_option[file_option.length - 1]) {
							file_option.pop();
						}
						if (file_option.length === 1) {
							file_option = file_option[0];
						}

						// console.log('-'.repeat(80)+64545646);
						// console.log(has_equal);
						// console.log(file_option);
						parameters.push(file_option);

						// 各參數設定。
						if (!has_equal && (option_name in file_options)) {
							if (!parameters[file_options[option_name]]
							// 'location' 等先到先得。
							|| file_options[option_name] !== 'location'
							// Type, display format
							&& file_options[option_name] !== 'format') {
								parameters[file_options[option_name]]
								//
								= option_name;
							}

						} else if (!has_equal
						//
						&& /^(?:(?:\d+)?x)?\d+ *px$/.test(option_name)) {
							// 以後到的為準。
							parameters.size = option_name;

						} else if (has_equal
								// 這些選項必須有 "="。無 "=" 的話，會被當作 caption。
								&&
								// page: DjVuファイルの場合、 page="ページ番号"で開始ページを指定できます。
								/^(?:link|alt|lang|page|thumbtime|start|end|class)$/
										.test(option_name)) {
							// 以後到的為準。
							if (option_name === 'link') {
								// pass .session
								option_value = wiki_API.normalize_title(
										option_value, options);
							}
							parameters[option_name] = option_value;
							parameters.index_of[option_name] = parameters.length - 1;

						} else if (has_equal
								&& /^(?:thumb|thumbnail|upright)$/
										.test(option_name)) {
							// 以後到的為準。
							// upright=1 →
							// parameters.size='upright'
							// parameters.upright='1'
							parameters[file_options
							//
							[option_name]] = option_name;
							parameters[option_name] = option_value;

						} else if (has_equal) {
							// 即使是空白也會被認作是 caption。
							// 相當於 .trim()
							if (typeof option_name === 'string'
									&& typeof option_value === 'string') {
								parameters.caption = option_name + '='
										+ option_value;
							} else {
								parameters.caption = [ option_name, '=',
										option_value ];
								parameters.caption
								//
								.toString = file_option.toString;
							}

						} else {
							// 相當於 .trim()
							parameters.caption = option_name;
						}

						if (!token[2]) {
							break;
						}
					}

				} else {
					var parsed_display_text = parse_wikitext(display_text,
							options, queue);
					// 需再進一步處理 {{}}, -{}- 之類。
					// [[w:en:Wikipedia:Categorization#Sort keys]]
					parameters[category_matched ? 'sort_key'
					// [[w:en:Wikipedia:Piped link]] the displayed text
					: 'display_text'] = parsed_display_text
					if (false && !category_matched) {
						parameters.plain_display_text = get_plain_display_text(
								display_text, options);
					}
					parameters.push(parsed_display_text);
				}
			}

			if (page_name.oddly === 'link_inside_link') {
				// console.trace(parameters);
				// parameters.is_link = false;

				for (var index = 2; index < parameters.length; index++) {
					// recover missed '|' before display_text
					if (typeof parameters[index] === 'string') {
						parameters[index] = '|' + parameters[index];
					} else if (parameters[index].type === 'plain') {
						parameters[index].unshift('|');
					} else {
						parameters[index] = [ '|', parameters[index] ];
					}
				}

				parameters = parameters.flat();
				parameters.unshift('[[');
				parameters.push(']]');
				join_string_of_array(parameters);
				_set_wiki_type(parameters, 'plain');
			} else {
				if (file_matched || category_matched) {
					// shown by link, is a linking to a file
					// e.g., token[0][0].trim() === "File"; token[0]: namespace
					parameters.is_link = page_name[0].trim() === '';

					if (file_matched) {
						parameters.name
						// set file name without "File:"
						= wiki_API.normalize_title(file_matched[2]);
					} else if (category_matched) {
						parameters.name
						// set category name without "Category:"
						= wiki_API.normalize_title(category_matched[1]);
					}
				} else {
					parameters.is_link = true;
				}
				section_title = section_title.toString()
				// remove prefix: '#'
				.slice(1).trimEnd();
				if (/\.[\dA-F]{2}/.test(section_title)
				// [[w:en:Help:Link#Section linking (anchors)]]
				// e.g.,
				// [[臺灣話#.E5.8F.97.E6.97.A5.E6.9C.AC.E8.AA.9E.E5.BD.B1.E9.9F.BF.E8.80.85|(其他參考資料)]]
				&& /^(\.[\dA-F]{2}|[\w\-])+$/.test(section_title)) {
					section_title = section_title.replace(/\.([\dA-F]{2})/g,
							'%$1');
				}
				try {
					section_title = decodeURIComponent(section_title);
				} catch (e) {
					// TODO: handle exception
				}
				// wikilink_token.anchor 網頁錨點
				parameters.anchor = normalize_anchor(section_title);
				// TODO: [[Special:]]
				// TODO: [[Media:]]: 連結到圖片但不顯示圖片
				_set_wiki_type(parameters, file_matched ? 'file'
						: category_matched ? 'category' : 'link');
			}

			// [ page_name, section_title, display_text without '|' ]
			// section_title && section_title.startsWith('#')
			queue.push(parameters);
			return previous + include_mark + (queue.length - 1) + end_mark;
		}

		function parse_external_link(all, URL, delimiter, parameters) {
			// assert: all === URL + (delimiter || '') + (parameters || '')
			// including "'''". e.g., [http://a.b/''t'']
			var matched = URL.match(/^(.+?)(''.*)$/);
			if (matched) {
				URL = matched[1];
				if (delimiter) {
					parameters = matched[2] + delimiter + parameters;
				} else {
					// assert: parameters === undefined
					parameters = matched[2];
				}
				delimiter = '';
			}
			URL = [ URL.includes(include_mark)
			// 預防有特殊 elements 置入其中。此時將之當作普通 element 看待。
			? parse_wikitext(URL, options, queue)
			// 以 token[0].toString() 取得 URL。
			: _set_wiki_type(URL, 'url') ];
			if (delimiter || parameters) {
				// assert: /^\s*$/.test(delimiter)
				// && typeof delimiter === 'string'
				// && typeof parameters === 'string'
				// assert: parameters 已去除最前面的 delimiter (space)。
				if (normalize) {
					parameters = parameters.trimEnd();
					if (delimiter)
						delimiter = ' ';
				}
				// 紀錄 delimiter as {String}token[1]，
				// 否則 .toString() 時 .join() 後會與原先不同。
				URL.push(delimiter,
				// 經過改變，需再進一步處理。
				parse_wikitext(parameters, options, queue));
			}
			_set_wiki_type(URL, 'external_link');
			queue.push(URL);
			return include_mark + (queue.length - 1) + end_mark;
		}

		function parse_template_parameter(all, parameters) {
			// 自 end_mark 向前回溯。
			var index = parameters.lastIndexOf('{{{'), previous;
			if (index > 0) {
				previous = '{{{' + parameters.slice(0, index);
				parameters = parameters.slice(index + '}}}'.length);
			} else {
				previous = '';
			}
			library_namespace.debug(previous + ' + ' + parameters, 4,
					'parse_wikitext.parameter');

			parameters = parameters.split('|');
			parameters = parameters.map(function(token, index) {
				return index === 0
				// 預防有特殊 elements 置入其中。此時將之當作普通 element 看待。
				&& !token.includes(include_mark)
				//
				? _set_wiki_type(
				//
				token.split(normalize ? /\s*:\s*/ : ':'), 'page_title')
				// 經過改變，需再進一步處理。
				: parse_wikitext(token, options, queue);
			});
			_set_wiki_type(parameters, 'parameter');
			queue.push(parameters);
			return previous + include_mark + (queue.length - 1) + end_mark;
		}

		// or use ((PATTERN_transclusion))
		// PATTERN_template
		var PATTERN_for_transclusion = /{{([^{}][\s\S]*?)}}/g;
		function parse_transclusion(all, parameters) {
			// 自 end_mark 向前回溯。
			var index = parameters.lastIndexOf('{{'),
			// 在先的，在前的，前面的； preceding
			// (previous 反義詞 following, preceding 反義詞 exceeds)
			previous,
			// 因為可能有 "length=1.1" 之類的設定，因此不能採用 Array。
			// token.parameters[{String}key] = {String}value
			_parameters = Object.create(null),
			// token.index_of[{String}key] = {Integer}index
			parameter_index_of = Object.create(null);
			if (index > 0) {
				previous = '{{' + parameters.slice(0, index);
				parameters = parameters.slice(index + '}}'.length);
			} else {
				previous = '';
			}
			library_namespace.debug(
					'[' + previous + '] + [' + parameters + ']', 4,
					'parse_wikitext.transclusion');

			// TODO: 像是 <b>|p=</b> 會被分割成不同 parameters，
			// 但 <nowiki>|p=</nowiki>, <math>|p=</math> 不會被分割！
			parameters = parameters.split('|');

			// matched: [ all, functionname token, functionname, argument 1 ]
			var matched = parameters[0].match(/^([\s\n]*#([a-z]+):)([\s\S]*)$/);

			// if not [[mw:Help:Extension:ParserFunctions]]
			if (!matched) {
				parameters[0].each_between(include_mark, end_mark, function(
						index) {
					if (index && queue[index = +index]
					//
					&& !(queue[index].type in {
						// incase:
						// {{Wikipedia:削除依頼/ログ/{{今日}}}}
						transclusion : true,
						// incase:
						// {{Wikipedia:削除依頼/ログ/{{#time:Y年Fj日
						// |-7 days +9 hours}}}}
						'function' : true,
						// {{tl{{{1|}}}|p}}
						'parameter' : true,

						// allow {{tl<!-- t= -->}}
						comment : true
					})) {
						// console.log(queue[index]);
						matched = true;
					}
				});

				if (matched
				// {{t<!-- -->{|p}}
				|| /[{}]/.test(parameters[0])) {
					// console.log(parameters);

					// e.g., `{{ {{tl|t}} | p }}` is incalid:
					// → `{{ {{t}} | p }}`
					return all;
				}

				// console.log(JSON.stringify(parameters[0]));

				// e.g., token.name ===
				// 'Wikipedia:削除依頼/ログ/{{#time:Y年Fj日|-7 days +9 hours}}'

			} else {
				// console.log(matched);

				// 有特殊 elements 置入其中。
				// e.g., {{ #expr: {{CURRENTHOUR}}+8}}}}

				// [[mw:Help:Extension:ParserFunctions]]
				// [[mw:Extension:StringFunctions]]
				// [[mw:Help:Magic words#Parser_functions]]
				// [[w:en:Help:Conditional expressions]]

				// will set latter
				parameters[0] = '';
				parameters.splice(1, 0, matched[3]);
			}

			index = 1;
			parameters = parameters.map(function(token, _index) {
				// 預防經過改變，需再進一步處理。
				token = parse_wikitext(token, Object.assign({
					inside_transclusion : true
				}, options), queue);

				if (_index === 0) {
					// console.log(token);

					if (false && typeof token === 'string') {
						return _set_wiki_type(token.split(normalize ? /\s*:\s*/
								: ':'), 'page_title');
					}
					// 有特殊 elements 置入其中。
					// e.g., {{ {{t|n}} | a }}
					return token;
				}

				// 規格書 parse parameters to:
				// numeral parameter: ['', '', value]
				// [name, '=', value]: [1, '=', value], ['', '=', value],
				// [[' name'], ' = ', [value], ' '].key = name

				// {Number}parameter_index =
				// template_token.index_of[parameter_name];
				//
				// parameter_token = template_token[parameter_index];
				// {String}parameter_name = parameter_token.key;
				// if (typeof parameter_name !== 'string') throw new
				// Error('Invalid parameter_token');
				//
				// trimmed parameter_value = parameter_token[2].toString();

				// https://test.wikipedia.org/wiki/L

				if (token.type !== 'plain') {
					// e.g., "{{#time:n月j日|2020-09-15|{{PAGELANGUAGE}}}}"
					token = _set_wiki_type([ token ], 'plain');
				}

				// assert: Array.isArray(token) && token.type === 'plain'

				var matched = undefined;
				// scan
				token.some(function(t, index) {
					if (typeof t !== 'string') {
						return t.type !== 'comment';
					}
					if (t.includes('=')) {
						// index of "=", index_of_assignment
						matched = index;
						return true;
					}
				});

				if (matched === undefined) {
					if (token.length === 1) {
						// assert: {String}token[0]
						// console.trace(token);
						token.unshift('', '');
					} else {
						// assert: token.length > 1
						token = _set_wiki_type([ '', '', token ], 'plain');
					}

					var value = token[2];
					if (Array.isArray(value) && value.some(function(t) {
						// e.g., {{t|p<nowiki></nowiki>=v}}
						return typeof t === 'string' && t.includes('=');
					})) {
						// has_invalid_key_element
						token.invalid = true;
						// token.key = undefined;
						if (library_namespace.is_debug(3)) {
							library_namespace.error(
							//
							'parse_wikitext.transclusion: Invalid parameter ['
							//
							+ token + ']');
						}
					} else {
						token.key = index;
						parameter_index_of[index] = _index;
						if (typeof value === 'string')
							value = value.trim();
						_parameters[index++] = value;
					}
					return token;
				}

				// extract parameter name
				// https://www.mediawiki.org/wiki/Help:Templates#Named_parameters
				// assert: parameter name should these characters
				// https://test.wikipedia.org/wiki/Test_n
				// OK in parameter name: ":\\\/#\"'\n"
				// NG in parameter name: "=" /\s$/

				// 要是有合規的 `parameter_name`，
				// 則應該是 [ {String} parameter_name + " = ", ... ]。
				// prevent {{| ...{{...|...=...}}... = ... }}

				matched = token.splice(0, matched + 1);
				token = _set_wiki_type([ matched,
				//
				matched.pop(), token ], 'plain');

				// matched: [ key, value ]
				// matched = token[1].match(/^([^=]*)=([\s\S]*)$/);

				// trimEnd() of key, trimStart() of value
				matched = token[1].match(/\s*=\s*/);

				// assert: matched >= 0
				if (matched.index > 0) {
					// 將 "=" 前的非空白字元補到 key 去。
					token[0].push(token[1].slice(0, matched.index));
				}
				// key token must accept '\n'. e.g., "key_ \n _key = value"
				token.key = token[0].filter(function(t) {
					// 去除 comments
					// e.g., '{{L|p<!-- -->=v}}'
					// assert: token[0].type === 'plain'
					return typeof t === 'string';
				});
				matched.k = token.key.join('');
				if (token.key.length === token[0].length) {
					// token[0]: all {String}
					token[0] = matched.k;
				} else {
					_set_wiki_type(token[0], 'plain');
				}
				token.key = matched.k.trim();
				matched.i = matched.index + matched[0].length;
				if (matched.i < token[1].length) {
					// 將 "=" 後的非空白字元補到 value 去。
					token[2].unshift(token[1].slice(matched.i));
				}
				token[1] = matched[0];

				var value = token[2];
				// assert: Array.isArray(value) && value.type === 'plain'
				parameter_index_of[token.key] = _index;
				_index = value.length - 1;
				matched = _index >= 0 && typeof value[_index] === 'string'
				// trimEnd() of value, push spaces in token[3]
				&& value[_index].match(/\s+$/);
				if (matched) {
					token.push(matched[0]);
					value[_index] = value[_index].slice(0, matched.index);
				}
				if (value.length < 2) {
					token[2] = value = value.length === 0 ? '' : value[0];
					// 處理某些特殊屬性的值。
					if (false && /url$/i.test(key)) {
						try {
							// 有些參數值會迴避"="，此時使用decodeURIComponent可能會更好。
							value = decodeURI(value);
						} catch (e) {
							// TODO: handle exception
						}
					}
				}

				// 若參數名重複: @see [[Category:調用重複模板參數的頁面]]
				// 如果一個模板中的一個參數使用了多於一個值，則只有最後一個值會在顯示對應模板時顯示。
				// parser 調用超過一個Template中參數的值，只會使用最後指定的值。

				// parameter_index_of[token.key] = _index;
				_parameters[token.key] = value;
				return token;
			});

			// add properties

			// console.trace(matched);
			if (matched) {
				parameters[0] = matched[1];
				parameters.name = matched[2];
				// 若指定 .valueOf = function()，
				// 會造成 '' + token 執行 .valueOf()。
				parameters.evaluate = evaluate_parser_function;

			} else {
				// console.trace(parameters[0]);
				if (typeof parameters[0] === 'string') {
					parameters.name = parameters[0];
				} else {
					// assert: Array.isArray(parameters[0]) &&
					// (parameters[0].type === 'page_title'
					// || parameters[0].type = 'plain')
					parameters.name = parameters[0].filter(function(t) {
						return t.type !== 'comment';
					}).join('');
				}
				// console.trace(parameters.name);
				// 後面不允許空白。 must / *DEFAULTSORT:/
				parameters.name = parameters.name.trimStart();
				var namespace = parameters.name.match(/^([^:]+):([\s\S]*)$/);
				// console.trace([ parameters.name, namespace ]);
				if (!namespace)
					namespace = [ , parameters.name ];
				// incase "{{ DEFAULTSORT : }}"
				namespace[1] = namespace[1].trim()
				// 'Defaultsort' → 'DEFAULTSORT'
				.toUpperCase();

				if ((namespace[1] in Magic_words_hash)
				// test if token is [[Help:Magic words]]
				&& (Magic_words_hash[namespace[1]]
				// 這些需要指定數值. has ":"
				|| namespace[0])) {
					// TODO: {{ {{UCFIRST:T}} }}
					// TODO: {{ :{{UCFIRST:T}} }}
					// console.log(parameters);

					parameters.name = namespace[1];
					// 此時以 parameters[0].slice(1) 可獲得首 parameter。
					parameters.is_magic_word = true;

					if (parameters.length === 1
							&& typeof parameters[0] === 'string') {
						var matched = parameters[0].match(/^(\w+:)([\s\S]*)$/);
						if (matched) {
							parameters[0] = matched[1];
							parameters.push(matched[2]);
						}
					}

				} else {
					if (namespace[0]) {
						parameters.name = namespace[2];
						namespace = namespace[1];
					} else {
						namespace = null;
					}
					// 正規化 template name。
					// 'ab/cd' → 'Ab/cd'
					parameters.name = wiki_API.normalize_title(parameters.name);
					// console.log(parameters.name);

					// parameters.name: template without "Template:" prefix.
					// parameters.page_title: page title with "Template:"
					// prefix.

					var PATTERN_template_namespaces = /^(?:Template|模板|テンプレート|Plantilla|틀)/i;
					var not_template_name = namespace
					// 預防 {{Template:name|...}}
					&& !PATTERN_template_namespaces.test(namespace)
					// wiki_API.namespace.hash using lower case
					&& (namespace.toLowerCase() in wiki_API.namespace.hash);

					// {{T}}嵌入[[Template:T]]
					// {{Template:T}}嵌入[[Template:T]]
					// {{:T}}嵌入[[T]]
					// {{Wikipedia:T}}嵌入[[Wikipedia:T]]
					parameters.page_title
					// .page_name
					= wiki_API.normalize_title((not_template_name ? namespace
							: 'Template')
							+ ':' + parameters.name);

					if (not_template_name) {
						parameters.name = parameters.page_title;
					}

					if (true) {
						;
					} else if (typeof parameters[0] === 'string') {
						var index = parameters[0]
								.indexOf(parameters.page_title);
						if (index !== NOT_FOUND) {
							parameters.page_title = _set_wiki_type(
									parameters.page_title
											.split(normalize ? /\s*:\s*/ : ':'),
									'page_title');
							parameters[0] = [
									parameters[0].slice(0, index),
									parameters.page_title,
									parameters[0].slice(0, index
											+ parameters.page_title.length) ];
						} else if (false) {
							parameters[0] = _set_wiki_type(token
									.split(normalize ? /\s*:\s*/ : ':'),
									'page_title');
						}
					} else {
						parameters.page_title = _set_wiki_type(
								parameters.page_title
										.split(normalize ? /\s*:\s*/ : ':'),
								'page_title');
					}
				}
			}
			parameters.parameters = _parameters;
			parameters.index_of = parameter_index_of;

			_set_wiki_type(parameters, matched ? 'function' : 'transclusion');
			queue.push(parameters);
			// TODO: parameters.parameters = []
			return previous + include_mark + (queue.length - 1) + end_mark;
		}

		// parse attributes of HTML tags
		// Warning: `{|\n|-\n!id="h style=color:red|h\n|}`
		// will get id==="h_style=color:red", NOT id==="h"!
		function parse_tag_attributes(attributes) {
			var attribute_hash = Object.create(null);
			if (typeof attributes === 'string') {
				var attributes_list = [], matched,
				// parser 標籤中的空屬性現根據HTML5規格進行解析。
				// <pages from= to= section=1>
				// 將解析為 <pages from="to=" section="1">
				// 而不是像以前那樣的 <pages from="" to="" section="1">。
				// 請改用 <pages from="" to="" section=1> or <pages section=1>。

				// [ all attributes, name, value, unquoted value,
				// text without "=" ]
				PATTERN_attribute = /\s*(\S[^=]*?)\s*=\s*("[^"]*"|'[^']*'|(\S*))|\s*(\S*)/g;
				while ((matched = PATTERN_attribute.exec(attributes))
						&& matched[0]) {
					// console.log(matched);
					attributes_list.push(shallow_resolve_escaped(matched[0]));
					var name = matched[1];
					if (!name) {
						// console.assert(!!matched[4]);
						if (matched[4]) {
							name = shallow_resolve_escaped(matched[4]);
							attribute_hash[name] = name;
						}
						continue;
					}

					// parse attributes
					name = shallow_resolve_escaped(name);
					var value = matched[3]
					// 去掉 "", ''
					|| matched[2].slice(1, -1);
					if (library_namespace.HTML_to_wikitext)
						value = library_namespace.HTML_to_wikitext(value);
					value = shallow_resolve_escaped(value);
					attribute_hash[name] = value;
				}
				if (false) {
					console
							.assert(PATTERN_attribute.lastIndex === attributes.length);
				}
				// reset PATTERN index
				// PATTERN_attribute.lastIndex = 0;
				attributes = attributes_list;
			}
			attributes = _set_wiki_type(attributes || '', 'tag_attributes');
			attributes.attributes = attribute_hash;
			return attributes;
		}

		// ------------------------------------------------

		function parse_HTML_tag(all, tag, attributes, inner, end_tag) {
			// console.log('queue start:');
			// console.log(queue);
			// console.trace(arguments);

			// 自 end_mark (tag 結尾) 向前回溯，檢查是否有同名的 tag。
			var matched = tag !== 'nowiki' && inner.match(new RegExp(
			// 但這種回溯搜尋不包含 <nowiki>
			// @see console.log(parser[418]);
			// https://zh.moegirl.org.cn/index.php?title=Talk:%E6%8F%90%E9%97%AE%E6%B1%82%E5%8A%A9%E5%8C%BA&oldid=3704938
			// <nowiki>{{subst:unwiki|<nowiki>{{黑幕|黑幕内容}}</nowiki&gt;}}</nowiki>
			'([\\s\\S]*)<(' + tag
			//
			+ ')(\\s(?:[^<>]*[^<>/])?)?>([\\s\\S]*?)$', 'i')), previous;
			if (matched) {
				previous = all.slice(0, matched[1].length - matched[0].length
				// length of </end_tag>
				- end_tag.length - 3);
				tag = matched[2];
				attributes = matched[3];
				inner = matched[4];
			} else {
				previous = '';
			}
			library_namespace.debug(previous + ' + <' + tag + '>', 4,
					'parse_wikitext.tag');

			var is_no_parse_tag = tag.toLowerCase() in no_parse_tags;
			// 在章節標題、表格 td/th 或 template parameter 結束時，
			// e.g., "| t || <s>... || </s> ||", "{{t|p=v<s>...|p2=v}}</s>"
			// 部分 HTML font style tag 似乎會被截斷，自動重設屬性，不會延續下去。
			// 因為已經先處理 {{Template}}，因此不需要用 /\n(?:[=|!]|\|})|[|!}]{2}/。
			// 此時同階的 table 尚未處理。
			if (!is_no_parse_tag && /\n[|!]|[|!]{2}/.test(inner.replace(
			// no_parse_tags: not a good idea
			/<(pre|nowiki|source|syntaxhighlight)(?:\s(?:[^<>]*[^<>/])?)?>[\s\S]*?<\/\1>/g
			//
			, ''))) {
				// TODO: 應確認此時真在表格中。
				if (library_namespace.is_debug(3)) {
					library_namespace.warn('parse_wikitext.tag: <' + tag + '>'
					//
					+ ' 在表格 td/th 或 template parameter 中，'
					//
					+ '此時視為一般 text，當作未匹配 match HTML tag 成功。\n' + previous);
					library_namespace.info(attributes);
					library_namespace.log(inner);
					console.trace(new RegExp('^([\\s\\S]*)<(' + tag
							+ ')(\\s(?:[^<>]*[^<>/])?)?>([\\s\\S]*?)$', 'i'));
				}
				return all;
			}

			if (library_namespace.is_debug(3)) {
				library_namespace.info('parse_wikitext.tag: <' + tag
						+ '> passed:\n' + previous);
				library_namespace.debug(attributes, 0);
				library_namespace.log(inner);
			}

			// 2016/9/28 9:7:7
			// 因為 no_parse_tags 內部可能已解析成其他的單元，因此還是必須parse_wikitext()。
			// e.g., '<nowiki>-{}-</nowiki>'
			// 經過改變，需再進一步處理。
			library_namespace.debug('<' + tag + '> 內部需再進一步處理。', 4,
					'parse_wikitext.tag');
			attributes = parse_tag_attributes(
			// 預防有特殊 elements 置入其中。此時將之當作普通 element 看待。
			// e.g., '{{tl|<b a{{=}}"A">i</b>}}'
			parse_wikitext(attributes, options, queue));
			inner = parse_wikitext(inner, options, queue);

			// 處理特殊 tags。
			if (tag === 'nowiki' && Array.isArray(inner)) {
				library_namespace.debug('-'.repeat(70)
						+ '\n<nowiki> 中僅留 -{}- 有效用。', 3,
						'parse_wikitext.transclusion');
				// console.log(inner);
				if (inner.type && inner.type !== 'plain') {
					// 當 inner 本身就是特殊 token 時，先把它包裝起來。
					inner = _set_wiki_type([ inner ], 'plain');
				}
				// TODO: <nowiki><b>-{...}-</b></nowiki>
				inner.forEach(function(token, index) {
					// 處理每個子 token。 經測試，<nowiki>中 -{}- 也無效。
					if (token.type /* && token.type !== 'convert' */)
						inner[index] = inner[index].toString();
				});
				if (inner.length <= 1) {
					inner = inner[0];
				}
				// console.log(inner);
			}
			// 若為 <pre> 之內，則不再變換。
			// 但 MediaWiki 的 parser 有問題，若在 <pre> 內有 <pre>，
			// 則會顯示出內部<pre>，並取內部</pre>為外部<pre>之結尾。
			// 因此應避免 <pre> 內有 <pre>。
			if (false && !is_no_parse_tag) {
				inner = inner.toString();
			}

			// [ ... ]: 在 inner 為 Template 之類時，
			// 不應直接在上面設定 type=tag_inner，以免破壞應有之格式！
			// 但仍需要設定 type=tag_inner 以應 for_each_token 之需，因此多層[]包覆。
			inner = _set_wiki_type([ inner || '' ], 'tag_inner');
			all = [ attributes, inner ];

			if (normalize) {
				tag = tag.toLowerCase();
			} else if (tag !== end_tag) {
				all.end_tag = end_tag;
			}
			all.tag = tag;
			// {String}Element.tagName
			// all.tagName = tag.toLowerCase();

			all = _set_wiki_type(all, 'tag');
			// 在遍歷 tag inner 的子 node 時，真正需要的 .parent 是 all tag 而非 inner。
			// e.g., `special page configuration.js`
			// if (parent.type === 'tag_inner' && parent.parent.type === 'tag'
			// && parent.parent.tag === 's') { ... }
			inner.parent = all;
			// attributes.parent = all;
			if (attributes && attributes.attributes) {
				all.attributes = attributes.attributes;
				// delete attributes.attributes;
			}
			queue.push(all);
			// console.log('queue end:');
			// console.log(queue);
			return previous + include_mark + (queue.length - 1) + end_mark;
		}

		function parse_single_tag(all, slash, tag, attributes) {
			if (attributes) {
				if (normalize) {
					attributes = attributes.replace(/[\s\/]*$/, ' /');
				}
				attributes = parse_tag_attributes(
				// 預防有特殊 elements 置入其中。此時將之當作普通 element 看待。
				// e.g., '{{tl|<b a{{=}}"A">i</b>}}'
				parse_wikitext(attributes, options, queue));
				if (false && attributes.type === 'plain') {
					// assert: 經過 parse_tag_attributes(), 應該不會到這邊。
					all = attributes;
				} else
					all = [ attributes ];
			} else {
				// use '' as attributes in case
				// the .join() in .toString() doesn't work.
				all = [ '' ];
			}

			if (normalize) {
				tag = tag.toLowerCase();
			}
			// prefix slash
			all.slash = slash;
			all.tag = tag;
			// {String}Element.tagName
			// all.tagName = tag.toLowerCase();

			_set_wiki_type(all, 'tag_single');
			if (attributes && attributes.attributes) {
				all.attributes = attributes.attributes;
				delete attributes.attributes;
			}
			queue.push(all);
			return include_mark + (queue.length - 1) + end_mark;
		}

		// ------------------------------------------------

		function parse_table(all, parameters) {
			// 經測試，table 不會向前回溯。

			function append_table_cell(table_cell, delimiter, table_row_token) {
				if (!table_cell && !delimiter) {
					// e.g., '' after 'style=""' in `{|\n|-style=""\n|t\n|}`
					return;
				}

				if (false && typeof delimiter !== 'string') {
					// e.g., 'ss' and 'ee' in
					// `{|class="wikitable"\n|-\nss||f\n|-\nee\n|}`
					table_row_token.push(shallow_resolve_escaped(table_cell));
					return;
				}

				var PATTERN_table_cell_content = /^([^|]+)\|([\s\S]*)$/;
				// cell attributes /
				// cell style / format modifier (not displayed)
				var table_cell_attributes = table_cell
						.match(PATTERN_table_cell_content);
				var data_type, value;
				if (table_cell_attributes) {
					// parse cell attributes
					table_cell = table_cell_attributes[2];
					table_cell_attributes = _set_wiki_type(
							parse_tag_attributes(table_cell_attributes[1]),
							'table_attributes');
					data_type = table_cell_attributes.attributes
					// @see
					// [[w:en:Help:Sorting#Specifying_a_sort_key_for_a_cell]]
					&& table_cell_attributes.attributes['data-sort-type'];
				}

				var table_cell_token = _set_wiki_type(
						shallow_resolve_escaped(table_cell), 'table_cell');
				if (table_row_token.type === 'caption') {
					table_cell_token.caption = table_cell_token.toString()
							.trim();
					// 表格標題以首次出現的為主。
					if (!table_row_token.caption) {
						table_row_token.caption = table_cell_token.caption;
					}
				}
				if (table_cell_attributes) {
					table_cell_token.unshift(table_cell_attributes,
					// '|': from PATTERN_table_cell_content
					'|');
				}
				if (delimiter)
					table_cell_token.delimiter = delimiter;

				data_type = data_type && data_type.trim();
				if (data_type === 'number') {
					if (library_namespace.is_digits(table_cell)) {
						value = +table_cell;
					}
				} else if (data_type === 'isoDate') {
					value = Date.parse(table_cell);
				}
				if (value || value === 0)
					table_cell_token.value = value;

				if (table_cell_token.is_header = table_row_token.cell_is_header_now) {
					// TODO: data-sort-type in table header
					// @see
					// [[w:en:Help:Sorting#Configuring the sorting]]

					table_row_token.header_count++;
				} else {
					table_row_token.data_count++;
				}
				if (false) {
					// is cell <th> or <td> ?
					table_cell_token.table_cell_type = table_cell_token.is_header ? 'th'
							: 'td';
				}

				table_row_token.push(table_cell_token);
			}

			// 分隔 <td>, <th>
			// 必須有實體才能如預期作 .exec()。
			// matched: [ all, inner, delimiter ]
			var PATTERN_table_cell;
			// invalid:
			// | cell !! cell
			// valid:
			// ! header !! header
			// ! header || header
			// | cell || cell
			var PATTERN_table_cell_th = /([\s\S]*?)(\n[|!]|[|!]{2}|$)/g;
			// default pattern for normal row.
			var PATTERN_table_cell_td = /([\s\S]*?)(\n[|!]|\|\||$)/g;
			function append_table_row(table_row, delimiter, table_token) {
				if (!table_row && !delimiter) {
					// e.g., '' after 'style=""' in `{|\nstyle=""\n|-\n|}`
					return;
				}

				if (typeof JSON === 'object') {
					library_namespace.debug('parse table_row / row style: '
					//
					+ JSON.stringify(table_row), 5, 'parse_wikitext.table');
				}

				// 注意: caption 不被當作 table_row 看待。
				var type = delimiter === '\n|+' ?
				// 'table_caption'
				'caption' : 'table_row';
				var table_row_token = _set_wiki_type([], type);
				table_row_token.delimiter = delimiter;
				// Warning:
				// only using table_row_token.header_count may lost some td
				// <th> counter
				table_row_token.header_count = 0;
				// <td> counter
				table_row_token.data_count = 0;

				PATTERN_table_cell = PATTERN_table_cell_td;
				table_row_token.cell_is_header_now = false;

				var last_delimiter;
				// caption allow `{|\n|+style|caption 1||caption 2\n|}`
				var matched = type !== 'caption' && table_row.match(/^.+/);
				if (matched) {
					// "\n|-" 後面緊接著，換行前的 string 為
					// table row style / format modifier (not displayed)
					table_row_token.push(_set_wiki_type(
							parse_tag_attributes(matched[0]),
							'table_attributes'));
					PATTERN_table_cell.lastIndex = matched[0].length;
				} else {
					// reset PATTERN index
					PATTERN_table_cell.lastIndex = 0;
				}

				while (matched = PATTERN_table_cell.exec(table_row)) {
					// console.log(matched);
					append_table_cell(matched[1], last_delimiter,
							table_row_token);
					if (!matched[2]) {
						// assert: /$/, no separator, ended.
						if (false) {
							console
									.assert(PATTERN_table_cell.lastIndex === table_row.length);
						}
						// reset PATTERN index
						// PATTERN_table_cell.lastIndex = 0;
						break;
					}
					// matched[2] 屬於下一 cell。
					last_delimiter = matched[2];
					if (/^\n/.test(last_delimiter)
					//
					&& table_row_token.cell_is_header_now !==
					// !!matched: convert to header
					(matched = last_delimiter === '\n!')) {
						// switch pattern
						var lastIndex = PATTERN_table_cell.lastIndex;
						table_row_token.cell_is_header_now = matched;
						PATTERN_table_cell = matched ? PATTERN_table_cell_th
								: PATTERN_table_cell_td;
						PATTERN_table_cell.lastIndex = lastIndex;
					}
				}

				// 處理表格標題。
				if (table_row_token.caption
				// 表格標題以首次出現的為主。
				&& !table_token.caption) {
					table_token.caption = table_row_token.caption;
				}
				delete table_row_token.cell_is_header_now;
				table_token.push(table_row_token);
			}

			var table_token = _set_wiki_type([], 'table');
			// 添加新行由一個豎線和連字符 "|-" 組成。
			var PATTERN_table_row = /([\s\S]*?)(\n\|[\-+]|$)/g;
			// default: table_row. try `{|\n||1||2\n|-\n|3\n|}`
			var last_delimiter;
			var matched = parameters.match(/^.+/);
			if (matched) {
				// the style of whole <table>
				table_token.push(_set_wiki_type(
						parse_tag_attributes(matched[0]), 'table_attributes'));
				PATTERN_table_row.lastIndex = matched[0].length;
			}
			while (matched = PATTERN_table_row.exec(parameters)) {
				// console.log(matched);
				append_table_row(matched[1], last_delimiter, table_token);
				if (!matched[2]) {
					// assert: /$/, no separator, ended.
					if (false) {
						console
								.assert(PATTERN_table_row.lastIndex === parameters.length);
					}
					// reset PATTERN index
					// PATTERN_table_row.lastIndex = 0;
					break;
				}
				// matched[2] 屬於下一 row。
				last_delimiter = matched[2];
			}

			if (false) {
				console.assert(table_token.every(function(table_row_token) {
					return table_row_token.type === 'table_attributes'
							|| table_row_token.type === 'caption'
							|| table_row_token.type === 'table_row';
				}));
			}

			queue.push(table_token);
			// 因為 "\n" 在 wikitext 中為重要標記，因此 restore 之。
			return '\n' + include_mark + (queue.length - 1) + end_mark;
		}

		function parse_behavior_switch(all, switch_word) {
			var parameters = _set_wiki_type(switch_word, 'switch');
			if (!queue.switches) {
				queue.switches = Object.create(null);
			}
			if (!queue.switches[switch_word]) {
				queue.switches[switch_word] = [ parameters ];
			} else {
				// 照理來說通常不應該要有多個 switches...
				queue.switches[switch_word].push(parameters);
			}
			queue.push(parameters);
			return include_mark + (queue.length - 1) + end_mark;
		}

		function parse_apostrophe_type(all, apostrophes, parameters, postfix) {
			// console.log([ all, apostrophes, parameters, postfix ]);
			var index = parameters.lastIndexOf(apostrophes), previous = '';
			if (index !== NOT_FOUND) {
				previous = apostrophes + parameters.slice(0, index);
				parameters = parameters.slice(index + apostrophes.length);
			}
			// 預防有特殊 elements 置入其中。此時將之當作普通 element 看待。
			parameters = parse_wikitext(parameters, options, queue);
			// console.log(parameters);
			// 注意: parameters.length 可能大於1
			var type;
			if (apostrophes === "'''''") {
				// e.g., "''''''t''''''"
				parameters = [ _set_wiki_type(parameters, 'bold') ];
				type = 'italic';
			} else {
				type = apostrophes === "''" ? 'italic' : 'bold';
			}
			parameters = _set_wiki_type(parameters, type);
			if (apostrophes === postfix) {
				postfix = '';
			} else {
				parameters.no_end = true;
			}
			queue.push(parameters);
			return previous + include_mark + (queue.length - 1) + end_mark
					+ postfix;
		}

		function parse_section(all, previous, section_level, parameters,
				postfix, last) {
			function not_only_comments(token) {
				return typeof token === 'string' ? !/^[ \t]+$/.test(token)
				//
				: token.type !== 'comment';
			}
			if (postfix && postfix.includes(include_mark)) {
				if (false) {
					console.assert(postfix.includes(include_mark)
							&& postfix.includes(end_mark))
					console.log(JSON.stringify(postfix));
				}
				var tail = parse_wikitext(postfix, options, queue);
				// console.log(tail);
				if (not_only_comments(tail) && (!is_parsed_element(tail)
				//
				|| tail.type === 'plain' && tail.some(not_only_comments))) {
					// console.log(all);
					return all;
				}
				// tail = "<!-- ... -->", "\s+" or ["<!-- ... -->", "\s+", ...]
				postfix = tail;
			}

			// console.log('==> ' + JSON.stringify(all));
			if (normalize) {
				parameters = parameters.trim();
			}

			parameters = pre_parse_section_title(parameters, options, queue);
			parameters = _set_wiki_type(parameters, 'section_title');

			// Use plain section_title instead of title with wikitext.
			// 因為尚未resolve_escaped()，直接使用未parse_wikitext()者會包含未解碼之code!
			// parameters.title = parameters.toString().trim();

			// section_link() 會更動 parse_wikitext() 之結果，
			// 因此不直接傳入 parsed，而是 .toString() 另外再傳一次。
			parameters.link = section_link(parameters.toString(),
			// for options.language
			Object.assign(Object.clone(options), {
				// 重新造一個 options 以避免污染。
				target_array : null
			}));
			/** {String}section title in wikitext */
			parameters.title = parameters.link.id;

			if (postfix && !normalize)
				parameters.postfix = postfix;
			var level = section_level.length;
			// assert: level >= 1
			parameters.level = level;
			// parse_wiki 處理時不一定按照先後順序，因此這邊還不能設定 section_hierarchy。
			// 請改用 parsed.each_section()。
			queue.push(parameters);
			// 因為 "\n" 在 wikitext 中為重要標記，因此 restore 之。
			return previous + include_mark + (queue.length - 1) + end_mark
					+ last;
		}

		function parse_list_line(line) {
			function push_list_item(item, list_prefix, no_parse) {
				if (!no_parse) {
					// 經過改變，需再進一步處理。
					item = parse_wikitext(item, options, queue);
				}
				// console.trace(item);
				item = _set_wiki_type(item, 'list_item');
				// 將 .list_prefix 結合在 list_item 之上。
				// (list_item_token.list_prefix)。
				item.list_prefix = list_prefix;
				if (latest_list)
					latest_list.push(item);
				return item;
			}

			var index = 0, position = 0;
			while (index < list_prefixes_now.length
			// 確認本行與上一行有多少相同的列表層級。
			&& list_prefixes_now[index] ===
			//
			(list_conversion[line.charAt(position)] || line.charAt(position))) {
				// position += list_prefixes_now[index++].length;
				index++;
				position++;
			}

			// console.log(list_now);
			list_prefixes_now.truncate(position);
			list_now.truncate(position);

			var list_prefix,
			// is <dt>
			is_dt,
			// latest_list === list_now[list_now.length - 1]
			latest_list = list_now[position - 1],
			// 尋找從本行開始的新列表。
			matched = line.slice(position).match(/^([*#;:]+)(\s*)(.*)$/);
			if (!matched) {
				if (position > 0) {
					// console.log([ position, line ]);
					// '\n': from `wikitext.split('\n')`
					list_prefix = '\n' + line.slice(0, position);
					is_dt = list_prefix.endsWith(';');
					line = line.slice(position);
					matched = line.match(/^\s+/);
					if (matched) {
						// 將空白字元放在 .list_prefix 可以減少很多麻煩。
						list_prefix += matched[0];
						line = line.slice(matched[0].length);
					}

					if (is_dt) {
						// line is not push_list_item() still,
						// when the `line` push_list_item(), its index will be
						// latest_list.length.
						latest_list.dt_index.push(latest_list.length);

						// search "; title : definition"
						if (matched = line.match(/^(.*)(:\s*)(.*)$/)) {
							push_list_item(matched[1], list_prefix);
							list_prefix = matched[2];
							line = matched[3];
						}
					}

					push_list_item(line, list_prefix);
				} else {
					// 非列表。
					// assert: position === -1
					lines_without_style.push(line.slice(position));
				}
				return;
			}

			if (position > 0) {
				// '\n': from `wikitext.split('\n')`
				list_prefix = '\n' + line.slice(0, position);
				if (list_prefix.endsWith(';')) {
					// line is not push_list_item() still,
					// when the `line` push_list_item(), its index will be
					// latest_list.length.
					latest_list.dt_index.push(latest_list.length);
				}
			} else {
				list_prefix = '';
			}

			var list_symbols = matched[1].split('');
			line = matched[3];
			list_symbols.forEach(function handle_list_item(list_type) {
				// 處理直接上多層選單的情況。
				// e.g., ";#a\n:#b"
				var list = _set_wiki_type([], 'list');
				// 注意: 在以 API 取得頁面列表時，也會設定 pages.list_type。
				list.list_type = list_conversion[list_type] || list_type;
				if (list.list_type === DEFINITION_LIST) {
					// list[list.dt_index[NO]] 為 ";"。
					list.dt_index = [];
				}

				if (latest_list) {
					var list_item = push_list_item([ list ],
					//
					list_prefix, true);
					list_item.index = latest_list.length - 1;
					list_item.parent = latest_list;
					list_prefix = list_type;
				} else {
					list_prefix += list_type;
					queue.push(list);
					lines_without_style.push(
					//
					include_mark + (queue.length - 1) + end_mark);
				}

				latest_list = list;
				list_now.push(list);
				list_prefixes_now.push(list.list_type);
			});

			// console.trace(latest_list);
			is_dt = list_prefix.endsWith(';');

			// matched[2]: 將空白字元放在 .list_prefix 可以減少很多麻煩。
			list_prefix += matched[2];

			// is <dt>, should use: ';' ===
			// latest_list.list_prefix[latest_list.list_prefix.length - 1]
			// assert: latest_list.length === latest_list.list_prefix.length - 1
			if (is_dt) {
				// assert: latest_list.length === 0
				// latest_list.dt_index.push(latest_list.length);
				latest_list.dt_index.push(0);

				// search "; title : definition"
				if (matched = line.match(/^(.*)(:\s*)(.*)$/)) {
					push_list_item(matched[1], list_prefix);
					list_prefix = matched[2];
					line = matched[3];
				}
			}

			push_list_item(line, list_prefix);
		}

		function parse_hr_tag(line, index) {
			var matched = line.match(/^(-{4,})(.*)$/);
			if (!matched
			// 例如在模板、link 中，一開始就符合的情況。
			|| index === 0 && !initialized_fix) {
				lines_without_style.push(line);
				return;
			}

			var hr = _set_wiki_type(matched[1], 'hr');

			queue.push(hr);
			lines_without_style.push(include_mark + (queue.length - 1)
					+ end_mark + matched[2]);
		}

		function parse_preformatted(line, index) {
			if (!line.startsWith(' ')
			// 例如在模板、link 中，一開始就符合的情況。
			|| index === 0 && !initialized_fix) {
				if (list_now) {
					// reset
					list_now = null;
				}
				lines_without_style.push(line);
				return;
			}

			// 經過改變，需再進一步處理。
			// 1: ' '.length
			line = parse_wikitext(line.slice(1), options, queue);

			if (list_now) {
				list_now.push(line);
				return;
			}

			list_now = _set_wiki_type([ line ], 'pre');

			queue.push(list_now);
			lines_without_style.push(include_mark + (queue.length - 1)
					+ end_mark);
		}

		// ------------------------------------------------------------------------
		// parse sequence start / start parse

		// parse 範圍基本上由小到大。
		// e.g., transclusion 不能包括 table，因此在 table 前。

		// 得先處理完有開闔的標示法，之後才是單一標示。
		// e.g., "<pre>\n==t==\nw\n</pre>" 不應解析出 section_title。

		// 可順便作正規化/維護清理/修正明顯破壞/修正維基語法/維基化，
		// 例如修復章節標題 (section title, 節タイトル) 前後 level 不一，
		// table "|-" 未起新行等。

		// ----------------------------------------------------
		// 因為<nowiki>可以打斷其他的語法，包括"<!--"，因此必須要首先處理。

		wikitext = wikitext.replace_till_stable(PATTERN_WIKI_TAG_of_nowiki,
				parse_HTML_tag);

		// ----------------------------------------------------
		// comments: <!-- ... -->

		// TODO: <nowiki> 之優先度更高！置於 <nowiki> 中，
		// 如 "<nowiki><!-- --></nowiki>" 則雖無功用，但會當作一般文字顯示，而非註解。

		// "<\": for Eclipse JSDoc.
		if (initialized_fix) {
			wikitext = wikitext.replace(/<\!--([\s\S]*?)-->/g,
			// 因為前後標記間所有內容無作用、能置於任何地方（除了 <nowiki> 中，"<no<!-- -->wiki>"
			// 之類），又無需向前回溯；只需在第一次檢測，不會有遺珠之憾。
			function(all, parameters) {
				// 預防有特殊 elements 置入其中。此時將之當作普通 element 看待。
				// e.g., "<!-- <nowiki>...</nowiki> ... -->"
				parameters = parse_wikitext(parameters, options, queue);
				// 不再作 parse。
				parameters = parameters.toString();
				queue.push(_set_wiki_type(parameters, 'comment'));
				return include_mark + (queue.length - 1) + end_mark;
			})
			// 缺 end mark: "...<!--..."
			.replace(/<\!--([\s\S]*)$/, function(all, parameters) {
				if (initialized_fix[1]) {
					parameters = parameters.slice(0,
					//
					-initialized_fix[1].length);
					initialized_fix[1] = '';
				}
				// 預防有特殊 elements 置入其中。此時將之當作普通 element 看待。
				// e.g., "<!-- <nowiki>...</nowiki> ... -->"
				parameters = parse_wikitext(parameters, options, queue);
				// 不再作 parse。
				parameters = parameters.toString();
				parameters = _set_wiki_type(parameters, 'comment');
				if (!normalize)
					parameters.no_end = true;
				queue.push(parameters);
				return include_mark + (queue.length - 1) + end_mark;
			});
		}

		// ----------------------------------------------------

		// 為了 "{{Tl|a<ref>[http://a.a.a b|c {{!}} {{CURRENTHOUR}}]</ref>}}"，
		// 將 -{}-, [], [[]] 等，所有中間可穿插 "|" 的置於 {{{}}}, {{}} 前。

		// ----------------------------------------------------
		// language conversion -{}- 以後來使用的為主。
		// TODO: -{R|里}-
		// TODO: -{zh-hans:<nowiki>...</nowiki>;zh-hant:<nowiki>...</nowiki>;}-
		// TODO: 特別注意語法中帶有=>的單向轉換規則 [[w:zh:模組:CGroup/IT]]
		// 注意: 有些 wiki，例如 jawiki，並沒有開啟 language conversion。
		// https://zh.wikipedia.org/wiki/Help:中文维基百科的繁简、地区词处理#常用的轉換工具語法
		// [[w:zh:H:Convert]], [[w:zh:H:AC]]
		// [[mw:Help:Magic words]], [[mw:Writing systems/LanguageConverter]]
		// https://doc.wikimedia.org/mediawiki-core/master/php/LanguageConverter_8php_source.html
		// https://doc.wikimedia.org/mediawiki-core/master/php/ConverterRule_8php_source.html
		// https://doc.wikimedia.org/mediawiki-core/master/php/ZhConversion_8php_source.html
		// https://github.com/wikimedia/mediawiki/blob/master/languages/data/ZhConversion.php
		// {{Cite web}}漢字不被轉換: 可以使用script-title=ja:。
		// TODO: 使用魔術字 __NOTC__ 或 __NOTITLECONVERT__ 可避免標題轉換。
		// TODO: <source></source>內之-{}-無效。
		// TODO:
		// 自動轉換程序會自動規避「程式碼」類的標籤，包括<pre>...</pre>、<code>...</code>兩種。如果要將前兩種用於條目內的程式範例，可以使用空轉換標籤-{}-強制啟用轉換。

		wikitext = wikitext.replace_till_stable(/-{(|[^{].*?)}-/g,
				parse_language_conversion);

		// ----------------------------------------------------
		// wikilink
		// [[~:~|~]], [[~:~:~|~]]

		// 須注意: [[p|\nt]] 可，但 [[p\n|t]] 不可！

		// 注意: [[p|{{tl|t}}]] 不會被解析成 wikilink，因此 wikilink 應該要擺在 transclusion
		// 前面檢查，或是使 display_text 不包含 {{}}。

		// 但注意: "[[File:title.jpg|thumb|a{{tl|t}}|param\n=123|{{tl|t}}]]"
		// 可以解析成圖片, Caption: "{{tl|t}}"

		// TODO: bug: 正常情況下 "[[ ]]" 不會被 parse，但是本函數還是會 parse 成 link。
		// TODO: [[::zh:title]] would be rendered as plaintext

		wikitext = wikitext.replace_till_stable(
		// or use ((PATTERN_link))
		PATTERN_wikilink_global, parse_wikilink);

		// ----------------------------------------------------
		// external link
		// [http://... ...]
		// TODO: [{{}} ...]
		wikitext = wikitext.replace_till_stable(PATTERN_external_link_global,
				parse_external_link);

		// ----------------------------------------------------
		// {{{...}}} 需在 {{...}} 之前解析。
		// [[w:zh:Help:模板]]
		// 在模板頁面中，用三個大括弧可以讀取參數。
		// MediaWiki 會把{{{{{{XYZ}}}}}}解析為{{{ {{{XYZ}}} }}}而不是{{ {{ {{XYZ}} }} }}
		wikitext = wikitext.replace_till_stable(/{{{([^{}][\s\S]*?)}}}/g,
				parse_template_parameter);

		// ----------------------------------------------------
		// 模板（英語：Template，又譯作「樣板」、「範本」）
		// {{Template name|}}
		wikitext = wikitext.replace_till_stable(
		//
		PATTERN_for_transclusion, parse_transclusion);

		// ----------------------------------------------------

		// 由於 <tag>... 可能被 {{Template}} 截斷，因此先處理 {{Template}} 再處理 <t></t>。
		// 先處理 <t></t> 再處理 <t/>，預防單獨的 <t> 被先處理了。

		// ----------------------------------------------------
		// [[Help:HTML in wikitext]]

		// <s>不採用 global variable，預防 multitasking 並行處理。</s>
		// reset PATTERN index
		// PATTERN_WIKI_TAG.lastIndex = 0;

		// console.log(PATTERN_TAG);
		// console.trace(PATTERN_WIKI_TAG_without_nowiki);
		// console.trace(wikitext);

		// HTML tags that must be closed.
		// <pre>...</pre>, <code>int f()</code>
		wikitext = wikitext.replace_till_stable(
				PATTERN_WIKI_TAG_without_nowiki, parse_HTML_tag);

		// ----------------------------------------------------
		// single tags. e.g., <hr />
		// TODO: <nowiki /> 能斷開如 [[L<nowiki />L]]

		// reset PATTERN index
		// PATTERN_WIKI_TAG_VOID.lastIndex = 0;

		// assert: 有 end tag 的皆已處理完畢，到這邊的是已經沒有 end tag 的。
		wikitext = wikitext.replace_till_stable(PATTERN_WIKI_TAG_VOID,
				parse_single_tag);
		// 處理有明確標示為 simgle tag 的。
		// 但 MediaWiki 現在會將 <b /> 轉成 <b>，因此不再處理這部分。
		if (false) {
			wikitext = wikitext.replace_till_stable(
					/<(\/)?([a-z]+)(\s[^<>]*\/)?>/ig, parse_single_tag);
		}

		// ----------------------------------------------------
		// table: \n{| ... \n|}
		// TODO: 在遇到過長過大的表格時，耗時甚久。 [[w:en:List of Leigh Centurions players]]
		// 因為 table 中較可能包含 {{Template}}，但 {{Template}} 少包含 table，
		// 因此先處理 {{Template}} 再處理 table。
		// {|表示表格開始，|}表示表格結束。

		wikitext = wikitext.replace_till_stable(
		// [[Help:Table]]
		/\n{\|([\s\S]*?)\n\|}/g, parse_table);

		// ----------------------------------------------------

		wikitext = wikitext.replace(PATTERN_BEHAVIOR_SWITCH,
				parse_behavior_switch);

		// 若是要處理<b>, <i>這兩項，也必須調整 section_link()。

		// ''''b''''' → <i><b>b</b></i>
		// 因此先從<b>開始找。

		// '''~''' 不能跨行！ 注意: '''{{font color}}''', '''{{tsl}}'''
		// ''~'' 不能跨行！
		wikitext = wikitext.replace_till_stable(
				/('''''|'''?)([^'\n].*?'*)(\1)/g, parse_apostrophe_type);
		if (false) {
			// \n, $ 都會截斷 italic, bold
			// <tag> 不會截斷 italic, bold
			wikitext = wikitext.replace_till_stable(
					/('''''|'''?)([^'\n].*?)($|\n)/g, parse_apostrophe_type);
		}
		// '', ''' 似乎會經過微調: [[n:zh:Special:Permalink/120676]]

		// ~~~, ~~~~, ~~~~~: 不應該出現

		// ----------------------------------------------------
		// parse_wikitext.section_title

		// TODO: 經測試，"\n== <code>code<code> =="會被當作title，但採用本函數將會解析錯誤。
		// [[w:zh:Special:Diff/46814116]]

		// postfix 沒用 \s，是因為 node 中， /\s/.test('\n')，且全形空白之類的確實不能用在這。

		var PATTERN_section = new RegExp(
		// @see PATTERN_section
		/(^|\n)(={1,6})(.+)\2((?:[ \t]|mark)*)(\n|$)/g.source.replace('mark',
				CeL.to_RegExp_pattern(include_mark) + '\\d+'
						+ CeL.to_RegExp_pattern(end_mark)), 'g');
		// console.log(PATTERN_section);
		// console.log(JSON.stringify(wikitext));

		wikitext = wikitext.replace_till_stable(PATTERN_section, parse_section);

		// console.log('10: ' + JSON.stringify(wikitext));

		if (false) {
			// another method to parse.
			wikitext = '{{temp|{{temp2|p{a}r{}}}}}';
			pattern = /{{[\s\n]*([^\s\n#\|{}<>\[\]][^#\|{}<>\[\]]*)/g;
			matched = pattern.exec(wikitext);
			end_index = wikitext.indexOf('}}', pattern.lastIndex);

			PATTERN_wikilink;
		}

		// ----------------------------------------------------
		// 處理 / parse bare / plain URLs in wikitext: https:// @ wikitext
		// @see [[w:en:Help:Link#Http: and https:]]

		// console.log('11: ' + JSON.stringify(wikitext));

		// 在 transclusion 中不會被當作 bare / plain URL。
		if (!options.inside_transclusion) {
			wikitext = wikitext.replace(PATTERN_URL_WITH_PROTOCOL_GLOBAL,
			//
			function(all, previous, URL) {
				all = _set_wiki_type(URL, 'url');
				// 須注意:此裸露 URL 之 type 與 external link 內之type相同！
				// 因此需要測試 token.is_bare 以確定是否在 external link 內。
				all.is_bare = true;
				queue.push(all);
				return previous + include_mark + (queue.length - 1) + end_mark;
			});
		}

		// ----------------------------------------------------
		// 處理 / parse list @ wikitext
		// @see [[w:en:MOS:LIST]], [[w:en:Help:Wikitext#Lists]]
		// 注意: 這裡僅處理在原wikitext中明確指示列表的情況，無法處理以模板型式表現的列表。

		// 列表層級。 e.g., ['#','*','#',':']
		var list_prefixes_now = [], list_now = [],
		//
		lines_without_style = [],
		//
		list_conversion = {
			';' : DEFINITION_LIST,
			':' : DEFINITION_LIST
		};

		// console.log('12: ' + JSON.stringify(wikitext));
		// console.log(queue);

		wikitext = wikitext.split('\n');
		// e.g., for "<b>#ccc</b>"
		var first_line = !initialized_fix && wikitext.shift();

		wikitext.forEach(parse_list_line);
		wikitext = lines_without_style;

		// ----------------------------------------------------
		// parse horizontal rule, line, HTML <hr /> element: ----, -{4,}
		// @see [[w:en:Help:Wikitext#Horizontal rule]]
		// Their use in Wikipedia articles is deprecated.
		// They should never appear in regular article prose.

		// reset
		lines_without_style = [];

		wikitext.forEach(parse_hr_tag);
		wikitext = lines_without_style;

		// ----------------------------------------------------
		// parse preformatted text, HTML <pre> element: \n + space
		// @seealso [[w:en:Help:Wikitext#Pre]]

		// reset
		lines_without_style = [];
		// pre_list
		list_now = null;

		wikitext.forEach(parse_preformatted);
		wikitext = lines_without_style;

		// free
		lines_without_style = null;

		if (!initialized_fix) {
			// recover
			wikitext.unshift(first_line);
		}
		wikitext = wikitext.join('\n');

		// ↑ parse sequence finished *EXCEPT FOR* paragraph
		// ------------------------------------------------------------------------

		// console.log('13: ' + JSON.stringify(wikitext));
		if (typeof options.postfix === 'function')
			wikitext = options.postfix(wikitext, queue, include_mark, end_mark)
					|| wikitext;

		// console.log('14: ' + JSON.stringify(wikitext));
		if (initialized_fix) {
			// 去掉初始化時添加的 fix。
			// 須預防有些為完結的標記，把所添加的部分吃掉了。此時不能直接 .slice()，
			// 而應該先檢查是不是有被吃掉的狀況。
			if (initialized_fix[0] || initialized_fix[1])
				wikitext = wikitext.slice(initialized_fix[0].length,
				// assert: '123'.slice(1, undefined) === '23'
				// if use length as initialized_fix[1]:
				// assert: '1'.slice(0, [ 1 ][1]) === '1'
				initialized_fix[1] ? -initialized_fix[1].length : undefined);
		}

		// ----------------------------------------------------
		// MUST be last: 處理段落 / parse paragraph @ wikitext

		// console.log('15: ' + JSON.stringify(wikitext));
		// [ all, text, separator ]
		var PATTERN_paragraph = /([\s\S]*?)((?:\s*?\n){2,}|$)/g;
		if (initialized_fix && options.parse_paragraph
				&& /\n\s*?\n/.test(wikitext)) {
			// 警告: 解析段落的動作可能破壞文件的第一層結構，會使文件的第一層結構以段落為主。
			wikitext = wikitext.replace(PATTERN_paragraph,
			// assert: 這個 pattern 應該能夠完全分割 wikitext。
			function(all, text, separator) {
				if (!all) {
					return '';
				}
				all = text.split('\n');
				// console.log(all);
				// 經過改變，需再進一步處理。
				all = all.map(function(t) {
					return parse_wikitext(t, options, queue);
				});
				// console.log(all);
				all = _set_wiki_type(all, 'paragraph');
				if (separator)
					all.separator = separator;
				// console.log('queue index: ' + queue.length);
				queue.push(all);
				return include_mark + (queue.length - 1) + end_mark;
			});
		}

		// console.log(wikitext);
		if (no_resolve) {
			return wikitext;
		}

		// console.log('16: ' + JSON.stringify(wikitext));
		queue.push(wikitext);
		if (false) {
			console.log('='.repeat(80));
			console.log(queue);
			console.log(JSON.stringify(wikitext));
		}
		resolve_escaped(queue, include_mark, end_mark);

		wikitext = queue[queue.length - 1];
		// console.log(wikitext);
		if (initialized_fix
		// 若是解析模板，那麼添加任何的元素，都可能破壞轉換成字串後的結果。
		// plain: 表示 wikitext 可能是一個頁面。最起碼是以 .join('') 轉換成字串的。
		&& (wikitext.type === 'plain'
		// options.no_reduce, options.is_page
		|| options.with_properties)) {
			if (Array.isArray(options.target_array) && Array.isArray(wikitext)) {
				// 可藉以複製必要的屬性。
				// @see function parse_page(options)
				options.target_array.truncate();
				// copy parsed data to .target_array
				Array.prototype.push.apply(options.target_array, wikitext);
				wikitext = options.target_array;
			}

			if (queue.switches)
				wikitext.switches = queue.switches;

			if (!library_namespace.is_empty_object(options.conversion_table))
				wikitext.conversion_table = options.conversion_table;
			if (options.conversion_title)
				wikitext.conversion_title = options.conversion_title;
		}

		// Release memory. 釋放被占用的記憶體。
		queue = null;

		if (initialized_fix
		// 若是解析模板，那麼添加任何的元素，都可能破壞轉換成字串後的結果。
		// plain: 表示 wikitext 可能是一個頁面。最起碼是以 .join('') 轉換成字串的。
		&& wikitext.type === 'plain' && !options.parse_paragraph) {
			// console.log(wikitext);
			// 純文字分段。僅切割第一層結構。
			for (var index = 0; index < wikitext.length; index++) {
				var token = wikitext[index], matched;
				// console.log('---> [' + index + '] ' + token);
				if (typeof token === 'string') {
					if (!/\n\s*?\n/.test(token)) {
						continue;
					}
					// 刪掉原先的文字 token = wikitext[index]。
					wikitext.splice(index, 1);
					// 從這裡開始，index 指的是要插入字串的位置。
					while ((matched = PATTERN_paragraph.exec(token))
							&& matched[0]) {
						// console.log('#1 ' + token);
						// console.log(matched);
						// text, separator 分開，在做 diff 的時候會更容易處理。
						if (matched[1] && matched[2]) {
							wikitext.splice(index, 0, matched[1], matched[2]);
							index += 2;
						} else {
							// assert:
							// case 1: matched[2] === '',
							// matched[0] === matched[1]
							// case 2: matched[1] === '',
							// matched[0] === matched[2]
							wikitext.splice(index++, 0, matched[0]);
						}
					}
					// 回復 index 的位置。
					index--;
					// reset PATTERN index
					PATTERN_paragraph.lastIndex = 0;

				} else {
					// assert: typeof wikitext[index] === 'object'
					if (index > 0
							&& typeof (token = wikitext[index - 1]) === 'string'
							&& (matched = token
									.match(/^([\s\S]*[^\s\n])([\s\n]*\n)$/))) {
						// e.g., ["abc \n","{{t}}"] → ["abc"," \n","{{t}}"]
						// console.log('#2 ' + token);
						// console.log(matched);
						// text, space 分開，在做 diff 的時候會更容易處理。
						wikitext.splice(index - 1, 1, matched[1], matched[2]);
						index++;
					}
					token = wikitext[index + 1];
					// console.log('>>> ' + token);
					if (typeof token === 'string'
							&& (matched = token.match(/^(\n+)([^\n][\s\S]*?)$/))) {
						// e.g., ["{{t}}","\nabc"] → ["{{t}}","\n","abc"]
						// console.log('#3 ' + token);
						// console.log(matched);
						// text, space 分開，在做 diff 的時候會更容易處理。
						wikitext.splice(index + 1, 1, matched[1], matched[2]);
					}
				}
			}
		}

		if (false) {
			library_namespace.debug('set depth ' + (depth_of_children - 1)
					+ ' to node [' + wikitext + ']', 3, 'parse_wikitext');
			wikitext[KEY_DEPTH] = depth_of_children - 1;
		}

		return wikitext;
	}

	// ------------------------------------------------------------------------

	// 模板名#後的內容會忽略。
	// matched: [ , Template name ]
	var TEMPLATE_NAME_PATTERN = /{{[\s\n]*([^\s\n#\|{}<>\[\]][^#\|{}<>\[\]]*)[|}]/,
	//
	TEMPLATE_START_PATTERN = new RegExp(TEMPLATE_NAME_PATTERN.source.replace(
			/\[[^\[]+$/, ''), 'g'),
	/** {RegExp}內部連結 PATTERN */
	LINK_NAME_PATTERN = /\[\[[\s\n]*([^\s\n\|{}<>\[\]�][^\|{}<>\[\]]*)(\||\]\])/;

	/**
	 * parse template token. 取得完整的模板 token。<br />
	 * CeL.wiki.parse.template();
	 * 
	 * TODO:<br />
	 * {{link-en|{{convert|198|cuin|L|abbr=on}} ''斜置-6'' 198|Chrysler Slant 6
	 * engine#198}}
	 * 
	 * @param {String}wikitext
	 *            模板前後之 content。<br />
	 *            assert: wikitext 為良好結構 (well-constructed)。
	 * @param {String|Array}[template_name]
	 *            擷取模板名 template name。
	 * @param {Number}[parse_type]
	 *            1: [ {String}模板名, parameters ]<br />
	 *            true: 不解析 parameters。<br />
	 *            false: 解析 parameters。
	 * 
	 * @returns {Undefine}wikitext 不包含此模板。
	 * @returns {Array}token = [ {String}完整的模板 wikitext token, {String}模板名,
	 *          {Array}parameters ];<br />
	 *          token.count = count('{{') - count('}}')，正常情況下應為 0。<br />
	 *          token.index, token.lastIndex: index.<br />
	 *          parameters[0] is {{{1}}}, parameters[1] is {{{2}}}, ...<br />
	 *          parameters[p] is {{{p}}}
	 */
	function parse_template(wikitext, template_name, parse_type) {
		template_name = wiki_API.normalize_title_pattern(template_name, true,
				true);
		var matched = template_name
		// 模板起始。
		? new RegExp(/{{[\s\n]*/.source + template_name + '\\s*[|}]', 'ig')
				: new RegExp(TEMPLATE_NAME_PATTERN.source, 'g');
		library_namespace.debug('Use pattern: ' + matched, 3, 'parse_template');
		// template_name : start token
		template_name = matched.exec(wikitext);

		if (!template_name) {
			// not found.
			return;
		}

		var pattern = new RegExp('}}|'
		// 不用 TEMPLATE_NAME_PATTERN，預防把模板結尾一起吃掉了。
		+ TEMPLATE_START_PATTERN.source, 'g'), count = 1;
		// lastIndex - 1 : the last char is [|}]
		template_name.lastIndex = pattern.lastIndex = matched.lastIndex - 1;

		while (count > 0 && (matched = pattern.exec(wikitext))) {
			// 遇到模板結尾 '}}' 則減1，否則增1。
			if (matched[0] === '}}')
				count--;
			else
				count++;
		}

		wikitext = pattern.lastIndex > 0 ? wikitext.slice(template_name.index,
				pattern.lastIndex) : wikitext.slice(template_name.index);
		var result = [
		// [0]: {String}完整的模板token
		wikitext,
		// [1]: {String}模板名
		template_name[1].trim(),
		// [2] {String}parameters
		// 接下來要作用在已經裁切擷取過的 wikitext 上，需要設定好 index。
		// assert: 其他餘下 parameters 的部分以 [|}] 起始。
		// -2: 模板結尾 '}}'.length
		wikitext.slice(template_name.lastIndex - template_name.index, -2) ];
		Object.assign(result, {
			count : count,
			index : template_name.index,
			lastIndex : pattern.lastIndex
		});

		if (!parse_type || parse_type === 1) {
			// {{t|p=p|1|q=q|2}} → [ , 1, 2; p:'p', q:'q' ]
			var index = 1,
			/** {Array}parameters */
			parameters = [];
			// 警告: 這邊只是單純的以 '|' 分割，但照理來說應該再 call parser 來處理。
			// 最起碼應該除掉所有可能包含 '|' 的語法，例如內部連結 [[~|~]], 模板 {{~|~}}。
			result[2].split(/[\s\n]*\|[\s\n]*/)
			// 不處理 template name。
			.slice(1)
			//
			.forEach(function(token) {
				var matched = token.match(/^([^=]+)=(.*)$/);
				if (matched) {
					var key = matched[1].trim(),
					//
					value = matched[2].trim();
					if (false) {
						if (key in parameters) {
							// 參數名重複: @see [[Category:調用重複模板參數的頁面]]
							// 如果一個模板中的一個參數使用了多於一個值，則只有最後一個值會在顯示對應模板時顯示。
							// parser 調用超過一個Template中參數的值，只有最後提供的值會被使用。
							if (Array.isArray(parameters[key]))
								parameters[key].push(value);
							else
								parameters[key] = [ parameters[key], value ];
						} else {
							parameters[key] = value;
						}
					}
					parameters[key] = value;
				} else {
					parameters[index++] = token;
				}
			});

			if (parse_type === 1) {
				parameters[0] = result[1];
				result = parameters;
				// result[0] is template name.
				// result[p] is {{{p}}}
				// result[1] is {{{1}}}
				// result[2] is {{{2}}}
			} else {
				// .shift(): parameters 以 '|' 起始，因此需去掉最前面一個。
				// 2016/5/14 18:1:51 採用 [index] 的方法加入，因此無須此動作。
				// parameters.shift();
				result[2] = parameters;
			}
		}

		return result;
	}

	// ----------------------------------------------------

	// 因應不同的 mediawiki projects 來處理日期。
	// date_parser_config[language]
	// = [ {RegExp}PATTERN, {Function}parser({Array}matched) : return {String},
	// {Function}to_String({Date}date) : return {String} ]
	//
	// 可使用 parse API 來做測試。
	// https://www.mediawiki.org/w/api.php?action=help&modules=parse
	//
	// 須注意當使用者特別設定時，在各維基計劃上可能採用不同語系的日期格式。
	//
	// to_String: 日期的模式, should match "~~~~~".
	var date_parser_config = {
		en : [
				// e.g., "01:20, 9 September 2017 (UTC)"
				// [, time(hh:mm), d, m, Y, timezone ]
				/([0-2]?\d:[0-6]?\d)[, ]+([0-3]?\d) ([a-z]{3,9}) ([12]\d{3})(?: \(([A-Z]{3})\))?/ig,
				function(matched, options) {
					return matched[2] + ' ' + matched[3] + ' ' + +matched[4]
							+ ' ' + matched[1] + ' ' + (matched[6] || 'UTC');
				}, {
					format : '%2H:%2M, %d %B %Y (UTC)',
					// use UTC
					zone : 0,
					locale : 'en-US'
				} ],
		ja : [
				// e.g., "2017年9月5日 (火) 09:29 (UTC)"
				// [, Y, m, d, week, time(hh:mm), timezone ]
				/([12]\d{3})年([[01]?\d)月([0-3]?\d)日 \(([日月火水木金土])\)( [0-2]?\d:[0-6]?\d)(?: \(([A-Z]{3})\))?/g,
				function(matched) {
					return matched[1] + '/' + matched[2] + '/' + matched[3]
							+ matched[5] + ' ' + (matched[6] || 'UTC+9');
				}, {
					format : '%Y年%m月%d日 (%a) %2H:%2M (UTC)',
					// use UTC
					zone : 0,
					locale : 'ja-JP'
				} ],
		'zh-classical' : [
				// Warning: need CeL.data.numeral
				/([一二][〇一二三四五六七八九]{3})年([[〇一]?[〇一二三四五六七八九])月([〇一二三]?[〇一二三四五六七八九])日 （([日一二三四五六])）( [〇一二三四五六七八九]{1,2}時[〇一二三四五六七八九]{1,2})分(?: \(([A-Z]{3})\))?/g,
				function(matched, options) {
					return library_namespace
							.from_positional_Chinese_numeral(matched[1] + '/'
									+ matched[2] + '/' + matched[3]
									+ matched[5].replace('時', ':'))
							+ ' ' + (matched[6] || 'UTC+8');
				},
				function(date, options) {
					return library_namespace.to_positional_Chinese_numeral(date
							.format({
								format : '%Y年%m月%d日 （%a） %2H時%2M分 (UTC)',
								// use UTC
								zone : 0,
								locale : 'cmn-Hant-TW'
							}));
				} ],
		zh : [
				// $dateFormats, 'Y年n月j日 (D) H:i'
				// https://github.com/wikimedia/mediawiki/blob/master/languages/messages/MessagesZh_hans.php
				// e.g., "2016年8月1日 (一) 00:00 (UTC)",
				// "2016年8月1日 (一) 00:00 (CST)"
				// [, Y, m, d, week, time(hh:mm), timezone ]
				/([12]\d{3})年([[01]?\d)月([0-3]?\d)日 \(([日一二三四五六])\)( [0-2]?\d:[0-6]?\d)(?: \(([A-Z]{3})\))?/g,
				function(matched, options) {
					return matched[1] + '/' + matched[2] + '/' + matched[3]
					//
					+ matched[5] + ' '
					// 'CST' in zh should be China Standard Time.
					// But `new Date('2017/12/1 0:0 CST')` using
					// Central Standard Time (North America)
					// === new Date('2017/12/1 0:0 UTC-6')
					// !== new Date('2017/12/1 0:0 UTC+8')
					+ (!matched[6] || matched[6] === 'CST' ? 'UTC+8'
					//
					: matched[6]);
				}, {
					format : '%Y年%m月%d日 (%a) %2H:%2M (UTC)',
					// use UTC
					zone : 0,
					locale : 'cmn-Hant-TW'
				} ]
	};

	// warning: number_to_signed(-0) === "+0"
	function number_to_signed(number) {
		return number < 0 ? number : '+' + number;
	}

	// @inner
	function normalize_parse_date_options(options) {
		var session = wiki_API.session_of_options(options);
		if (options === true) {
			options = {
				get_timevalue : true
			};
		} else if (typeof options === 'string'
				&& (options in date_parser_config)) {
			options = {
				language : options
			};
		} else {
			options = library_namespace.new_options(options);
		}

		var language = wiki_API.get_first_domain_name_of_session(options);
		if (session) {
			if (!language) {
				language = wiki_API.get_first_domain_name_of_session(session);
			}
			if (!date_parser_config[language]) {
				// e.g., https://simple.wikipedia.org/ →
				// wiki_API.get_first_domain_name_of_session(session) ===
				// 'simple' && session.language === 'en'
				language = session.language;
			}
			if (!isNaN(options.timeoffset)) {
				options.zone = options.timeoffset / 60;
			} else if (!('timeoffset' in options)) {
				// e.g., 480 : UTC+8
				options.zone = session.configurations.timeoffset / 60;
			} else {
				library_namespace
						.warn('normalize_parse_date_options: Invalid timeoffset: '
								+ options.timeoffset);
			}
		}
		options.zone |= 0;

		if (!language) {
			language = wiki_API.language;
			options.date_parser_config = date_parser_config[wiki_API.language];
		} else if (language in wiki_API.api_URL.wikimedia) {
			// all wikimedia using English in default.
			options.date_parser_config = date_parser_config.en;
		} else {
			options.date_parser_config = date_parser_config[language]
			// e.g., 'commons'
			|| date_parser_config[wiki_API.language];
		}
		if (!options.date_parser_config) {
			// console.log(session);
			console.trace([ language, wiki_API.language ]);
		}

		return options;
	}

	/**
	 * parse date string / 時間戳記 to {Date}
	 * 
	 * @example <code>

	date_list = CeL.wiki.parse.date(CeL.wiki.content_of(page_data), {
		//language : 'en',
		session : session,
		get_timevalue : true,
		get_all_list : true
	});

	</code>
	 * 
	 * 技術細節警告：不同語系wiki有相異的日期辨識模式，採用和當前wiki不同語言的日期格式，可能無法辨識。
	 * 
	 * 經查本對話串中沒有一般型式的一般格式的日期，造成無法辨識。下次遇到這樣的問題，可以在最後由任何一個人加上本討論串已終結、準備存檔的字樣，簽名並且'''加上一般日期格式'''即可。
	 * 
	 * @param {String}wikitext
	 *            date text to parse.
	 * @param {Object}options
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {Date|Array}date of the date string
	 * 
	 * @see [[en:Wikipedia:Signatures]], "~~~~~",
	 *      [[en:Help:Sorting#Specifying_a_sort_key_for_a_cell]]
	 */
	function parse_date(wikitext, options) {
		options = normalize_parse_date_options(options);

		var date_list;
		if (options.get_all_list) {
			// 若設定 options.get_all_list，須保證回傳 {Array}。
			date_list = [];
		}
		if (!wikitext) {
			return date_list;
		}

		// <s>去掉</s>skip年分前之雜項。
		// <s>去掉</s>skip星期與其後之雜項。
		var date_parser = options.date_parser_config[1];
		var PATTERN_date = options.date_parser_config[0], matched;
		// console.log('Using PATTERN_date: ' + PATTERN_date);

		var min_timevalue, max_timevalue;
		// reset PATTERN index
		PATTERN_date.lastIndex = 0;
		while (matched = PATTERN_date.exec(wikitext)) {
			// console.log(matched);
			// Warning:
			// String_to_Date()只在有載入CeL.data.date時才能用。但String_to_Date()比parse_date()功能大多了。
			var date = date_parser(matched, options);
			// console.log(date);

			// Date.parse('2019/11/6 16:11 JST') === NaN
			date = date.replace(/ (JST)/, function(all, zone) {
				zone = library_namespace.String_to_Date
				// Warning:
				// String_to_Date()只在有載入CeL.data.date時才能用。但String_to_Date()功能大多了。
				&& (zone in library_namespace.String_to_Date.zone)
				//
				? library_namespace.String_to_Date.zone[zone] : 9;
				return ' UTC' + number_to_signed(zone);
			});

			date = Date.parse(date);
			if (isNaN(date)) {
				continue;
			}

			if (!(min_timevalue < date)) {
				min_timevalue = date;
			} else if (!(date < max_timevalue)) {
				max_timevalue = date;
			}

			if (!options.get_timevalue) {
				date = new Date(date);
			}
			if (!options.get_all_list) {
				return date;
			}
			date_list.push(date);
		}

		// Warning: 不一定總有 date_list.min_timevalue, date_list.max_timevalue
		if (min_timevalue) {
			date_list.min_timevalue = min_timevalue;
			date_list.max_timevalue = max_timevalue || min_timevalue;
		}

		return date_list;
	}

	/**
	 * 產生時間戳記。日期格式跟標準簽名一樣，讓時間轉換的小工具起效用。
	 * 
	 * assert: the same as "~~~~~".
	 * 
	 * @example <code>

	CeL.wiki.parse.date.to_String(new Date, session);

	</code>
	 */
	function to_wiki_date(date, options) {
		options = normalize_parse_date_options(options);

		// console.log(language || wiki_API.language);
		var to_String = options.date_parser_config[2];

		if (typeof to_String === 'function') {
			date = to_String(date, options);
		} else {
			// treat `to_String` as date format
			// assert: library_namespace.is_Object(to_String)
			var zone = options.zone;
			if (!isNaN(zone) && to_String.zone !== zone) {
				// 不污染原型。
				to_String = Object.clone(to_String);
				to_String.zone = zone;
				to_String.format = to_String.format
				// 顯示的時間跟隨 session.configurations.timeoffset。
				.replace(/\(UTC(?:[+\-]\d)?\)/, '(UTC'
						+ (zone < 0 ? zone : zone ? '+' + zone : '') + ')');
			}
			// console.trace([ date, date.format(to_String), to_String ]);
			date = date.format(to_String);
		}
		return date;
	}

	parse_date.to_String = to_wiki_date;

	// ------------------------------------------

	/**
	 * 使用者/用戶對話頁面所符合的匹配模式。
	 * 
	 * matched: [ all, " user name " ]
	 * 
	 * user_name = matched[1].trim()
	 * 
	 * match: [[:language_code:user_talk:user_name]]
	 * 
	 * TODO: using PATTERN_page_name
	 * 
	 * @type {RegExp}
	 * 
	 * @see 使用者簽名將不能再有Lint錯誤和包含一些無效的HTML，嵌套替換引用也不允許，必須包含到使用者頁面、使用者討論頁或使用者貢獻頁之一的連結。
	 *      https://www.mediawiki.org/wiki/New_requirements_for_user_signatures#Outcome
	 * @see https://zh.wikipedia.org/w/api.php?action=query&meta=siteinfo&siprop=general|namespaces|namespacealiases|statistics&utf8
	 *      https://github.com/wikimedia/mediawiki/blob/master/languages/messages/MessagesZh_hant.php
	 */
	var PATTERN_user_link =
	// user name do not allow "\/": e.g., [[user talk:user_name/Flow]]
	// 大小寫無差，但NG: "\n\t"
	//
	// https://zh.wikipedia.org/wiki/Wikipedia:互助客栈/其他#增设空间“U：”、“UT：”作为“User：”、“User_talk：”的Alias
	// https://phabricator.wikimedia.org/T183711
	// Doesn't conflict with any language code or other interwiki link.
	// https://gerrit.wikimedia.org/r/#/c/400267/4/wmf-config/InitialiseSettings.php
	/\[\[ *:?(?:[a-z\d\-]{1,14}:?)?(?:user(?:[ _]talk)?|使用者(?:討論)?|用戶(?:討論|對話)?|用户(?:讨论|对话)?|利用者(?:‐会話)?|사용자(?:토론)?|UT?) *: *((?:&#(?:\d{1,8}|x[\da-fA-F]{1,8});|[^\[\]\|{}\n#�\/])+)/i,
	// [[特殊:功績]]: zh-classical, [[特別:投稿記録]]: ja
	// matched: [ all, " user name " ]
	PATTERN_user_contributions_link = /\[\[(?:Special|特別|特殊|特別) *: *(?:Contributions|Contribs|使用者貢獻|用戶貢獻|(?:用户)?贡献|投稿記録|功績)\/((?:&#(?:\d{1,8}|x[\da-fA-F]{1,8});|[^\[\]\|{}\n#�\/])+)/i,
	//
	PATTERN_user_link_all = new RegExp(PATTERN_user_link.source, 'ig'), PATTERN_user_contributions_link_all = new RegExp(
			PATTERN_user_contributions_link.source, 'ig');

	/**
	 * parse user name. 解析使用者/用戶對話頁面資訊。找出用戶頁、用戶討論頁、用戶貢獻頁的連結。
	 * 
	 * @example <code>

	if (CeL.wiki.parse.user(CeL.wiki.title_link_of(title), user)) {}

	</code>
	 * 
	 * 採用模板來顯示簽名連結的方法，會影響到許多判斷簽名的程式，不只是簽名偵測。您可使用
	 * <code><nowiki>[[User:Example|<span style="color: #007FFF;">'''我的簽名'''</span>]]</nowiki></code>
	 * 的方法來添加顏色，或者參考[[zhwiki:Wikipedia:簽名]]的其他範例。
	 * 
	 * TODO: 應該按照不同的維基項目來做篩選。
	 * 
	 * @param {String}wikitext
	 *            wikitext to parse
	 * @param {String}[user_name]
	 *            測試是否為此 user name。 注意:這只會檢查第一個符合的連結。若一行中有多個連結，應該採用
	 *            CeL.wiki.parse.user.all() !
	 * @param {Boolean}[to_full_link]
	 *            get a full link
	 * 
	 * @returns {String}user name / full link
	 * @returns {Boolean}has the user name
	 * @returns {Undefined}Not a user link.
	 */
	function parse_user(wikitext, user_name, to_full_link) {
		if (!wikitext) {
			return;
		}

		var matched = wikitext.match(PATTERN_user_link), via_contributions;
		if (!matched) {
			matched = wikitext.match(PATTERN_user_contributions_link);
			if (!matched) {
				return;
			}
			via_contributions = true;
		}

		if (typeof user_name === 'boolean') {
			to_full_link = user_name;
			user_name = undefined;
		}
		// 正規化連結中的使用者名稱。
		var name_from_link = wiki_API.normalize_title(matched[1]);
		if (user_name) {
			// 用戶名正規化。
			user_name = wiki_API.normalize_title(user_name);
			if (user_name !== name_from_link) {
				return false;
			}
			if (!to_full_link) {
				return true;
			}
		}

		// may use wiki_API.title_link_of()
		return to_full_link ? via_contributions ? '[[User:' + name_from_link
				+ ']]' : matched[0].trimEnd() + ']]' : name_from_link;
	}

	/**
	 * parse all user name. 解析所有使用者/用戶對話頁面資訊。 CeL.wiki.parse.user.all()
	 * 
	 * @example <code>

	// 取得各使用者的簽名數量hash。
	var user_hash = CeL.wiki.parse.user.all(wikitext), user_list = Object.keys(user_hash);
	// 取得依照第一次出現處排序、不重複的使用者序列。
	var user_list = Object.keys(CeL.wiki.parse.user.all(wikitext));
	// 取得依照順序出現的使用者序列。
	var user_serial_list = CeL.wiki.parse.user.all(wikitext, true);

	</code>
	 * 
	 * @param {String}wikitext
	 *            wikitext to parse/check
	 * @param {String}[user_name]
	 *            測試是否有此 user name，return {Integer}此 user name 之連結數量。
	 *            若輸入true表示取得依照順序出現的使用者序列。
	 * 
	 * @returns {Integer}link count of the user name
	 * @returns {Object}normalized user name hash: hash[name] = {Integer}count
	 */
	function parse_all_user_links(wikitext, user_name) {
		function check_pattern(PATTERN_all) {
			// reset PATTERN index
			PATTERN_all.lastIndex = 0;
			var matched;
			library_namespace.debug(PATTERN_all, 3, 'parse_all_user_links');
			while (matched = PATTERN_all.exec(wikitext)) {
				// 用戶名正規化。
				var name = wiki_API.normalize_title(matched[1]);
				if (!user_name || user_name === name) {
					// console.log(name);
					if (user_list) {
						user_list.push(name);
					} else if (name in user_hash) {
						user_hash[name]++;
					} else {
						user_hash[name] = 1;
					}
				}
			}
		}

		var user_hash, user_list;
		if (user_name === true) {
			user_list = [];
			user_name = null;
		} else if (user_name) {
			// user_name should be {String}user name
			user_name = wiki_API.normalize_title(user_name);
		} else {
			user_hash = Object.create(null);
		}

		if (!wikitext) {
			return user_name ? 0 : user_list || user_hash;
		}

		library_namespace.debug(wikitext, 3, 'parse_all_user_links');
		library_namespace.debug('user name: ' + user_name, 3,
				'parse_all_user_links');

		check_pattern(PATTERN_user_link_all);
		check_pattern(PATTERN_user_contributions_link_all);

		if (user_list) {
			return user_list;
		}

		if (user_name) {
			return user_name in user_hash[user_name] ? user_hash[user_name] : 0;
		}

		return user_hash;
	}

	// CeL.wiki.parse.user.all()
	parse_user.all = parse_all_user_links;

	// 由使用者名稱來檢測匿名使用者/未註冊用戶 [[WP:IP]]
	// [[m:Special:MyLanguage/Tech/News/2021/05]]
	// 在diffs中，IPv6位址被寫成了小寫字母。這導致了死連結，因為Special:使用者貢獻只接受大寫的IP。這個問題已經被修正。
	function is_IP_user(user_name, IPv6_only) {
		return !IPv6_only
		// for IPv4 addresses
		&& /^[12]?\d{1,2}(?:\.[12]?\d{1,2}){3}$/.test(user_name)
		// for IPv6 addresses
		|| /^[\da-f]{1,4}(?::[\da-f]{1,4}){7}$/i.test(user_name);
	}

	// CeL.wiki.parse.user.is_IP()
	parse_user.is_IP = is_IP_user;

	//
	/**
	 * redirect/重定向頁所符合的匹配模式。 Note that the redirect link must be explicit – it
	 * cannot contain magic words, templates, etc.
	 * 
	 * matched: [ all, "title#section" ]
	 * 
	 * zh-classical: 重新導向
	 * 
	 * @type {RegExp}
	 * 
	 * @see function p.getTargetFromText(text) @ https://en.wikipedia.org/wiki/Module:Redirect
	 *      https://zh.wikipedia.org/w/api.php?action=query&meta=siteinfo&siprop=general|namespaces|namespacealiases|statistics&utf8
	 *      https://github.com/wikimedia/mediawiki/blob/master/languages/messages/MessagesZh_hant.php
	 *      https://en.wikipedia.org/wiki/Help:Redirect
	 *      https://phabricator.wikimedia.org/T68974
	 */
	var PATTERN_redirect = /^[\s\n]*#(?:REDIRECT|重定向|重新導向|転送|リダイレクト|넘겨주기)\s*(?::\s*)?\[\[([^\[\]\|{}\n�]+)(?:\|[^\[\]{}]+?)?\]\]/i;

	/**
	 * parse redirect page. 解析重定向資訊，或判斷頁面是否為重定向頁面。<br />
	 * 若 wikitext 重定向到其他頁面，則回傳其{String}頁面名: "title#section"。
	 * 
	 * 應採用如下方法，可以取得 `('redirect' in page_data) && page_data.redirect === ''` 。
	 * 
	 * @example <code>

	wiki.page(title, function(page_data) {
		var redirect_to = CeL.wiki.parse.redirect(page_data);
		// `true` or {String}redirect_to or `undefined`
		console.log(redirect_to);
	});

	wiki.page(title, function(page_data) {
		var is_redirect = CeL.wiki.is_protected(page_data);
		// `true` or `undefined`
		console.log(is_redirect);
	}, {
		prop : 'info'
	});

	 </code>
	 * 
	 * @param {String}page_data
	 *            page data or wikitext to parse
	 * 
	 * @returns {String}title#section
	 * @returns {Undefined}Not a redirect page.
	 */
	function parse_redirect(page_data) {
		var wikitext, is_page_data = wiki_API.is_page_data(page_data);
		if (is_page_data) {
			wikitext = wiki_API.content_of(page_data);
		} else {
			// treat page_data as wikitext.
			wikitext = page_data;
		}

		if (false) {
			if (Array.isArray(wikitext)) {
				throw '您可能取得了多個版本';
				// 應該用:
				// content = CeL.wiki.content_of(page_data, 0);
				// 但是卻用成了:
				// content = CeL.wiki.content_of(page_data);
			}
			if (!wikitext || typeof wikitext !== 'string') {
				throw typeof wikitext;
				return;
			}
		}

		var matched = wikitext && wikitext.match(PATTERN_redirect);
		if (matched) {
			return matched[1].trim();
		}

		if (is_page_data && ('redirect' in page_data)) {
			// assert: page_data.redirect === ''
			return true;
		}

		if (false && wikitext.includes('__STATICREDIRECT__')) {
			library_namespace.debug('雖然特別指定了重定向頁面的 Magic word，但是並沒有發現重定向資訊。',
					3, 'parse_redirect');
		}
	}

	// ----------------------------------------------------

	// const
	// ! 變數名 (不可更改) !! 變數值 !! 注解說明
	var NAME_INDEX = 0, VALUE_INDEX = 1;
	var KEY_ORIGINAL_ARRAY = typeof Symbol === 'function' ? Symbol('KEY_ORIGINAL_ARRAY')
			: '|ORIGINAL_ARRAY';

	/**
	 * 解析設定參數 wikitext configuration → JSON
	 * 
	 * 當解析發生錯誤的時候，應該要在設定頁面的討論頁顯示錯誤訊息。
	 * 
	 * @example <code>

	var configuration = CeL.wiki.parse.configuration(page_data);

	value = configuration[variable_name];

	</code>
	 * 
	 * 允許使用的設定格式: <code>

	(頁面開頭)
	註解說明(可省略)
	本頁面為 [[User:bot|]] ~~~作業的設定。每次執行作業前，機器人都會從本頁面讀入設定。您可以更改特定數值，但請盡量不要改變本頁的格式。自動生成的報表請參見：[[報告]]
	 * 請注意：變更本頁面後，必須重新執行機器人程式才有效果。

	; 單一值變數名1: 變數值
	; 單一值變數名2: 變數值

	; 列表變數名1
	: 變數值1
	: 變數值2

	 == 列表變數名2 ==
	 註解說明(可省略)
	 * 變數值1
	 * <nowiki>變數值2</nowiki>

	== 列表變數名3 ==
	註解說明(可省略)
	# 變數值1
	# <nowiki>變數值2</nowiki>

	</code>
	 * 
	 * @see [[w:zh:User:Cewbot/規範多個問題模板設定]], [[w:zh:User:Cewbot/討論頁面主題列表設定]]
	 * @see 存檔 舊議 [[w:zh:Template:Easy_Archive]],
	 *      [[w:en:Template:Auto_archiving_notice]],
	 *      [[w:en:Template:Setup_auto_archiving]]
	 */
	function parse_configuration(wikitext) {
		// 忽略 <span> 之類。
		function filter_tags(token) {
			// console.log(token);
			if (token.type === 'tag' /* || token.type === 'tag_single' */) {
				// console.log(token);
				if (token.tag == 'nowiki') {
					// assert: token[1].type === 'tag_inner'
					// do not show type: 'tag_attributes' when .join('')
					token[0][0] = '';
					// token = token[1];
					// token.is_nowiki = true;
					// console.log(token);
					return token;
				}
				// `<b>value</b>` -> `value`
				return filter_tags(token[1]);
			}
			if (Array.isArray(token)) {
				var value = token.toString.call(token.map(filter_tags));
				if (token.type === 'list')
					token.value = value;
				else
					return value;
			}
			return token;
		}

		function normalize_value(value) {
			// console.trace(JSON.stringify(value));
			// console.trace(JSON.stringify(filter_tags(value)));
			value = filter_tags(value).toString().trim();
			// console.log(JSON.stringify(value));
			return value
			// TODO: <syntaxhighlight lang="JavaScript" line start="55">
			// https://www.mediawiki.org/wiki/Extension:SyntaxHighlight
			// <source lang="cpp">
			.replace(/<\/?(?:nowiki|code)>/g, '')
			// link → page title
			.replace(/^\[\[([^\[\]\|{}\n�]+)(?:\|[^\[\]{}]+?)?\]\]$/, '$1')
			// Remove comments
			.replace(/<!--[\s\S]*?-->/g, '');
		}

		/** {Object}設定頁面/文字所獲得之個人化設定/手動設定 manual settings。 */
		var configuration = Object.create(null),
		/** {String}當前使用之變數名稱 */
		variable_name,
		// using parser
		parsed, configuration_page_title;

		if (wiki_API.is_page_data(wikitext)) {
			variable_name = wikitext.title;
			configuration_page_title = variable_name;
			parsed = page_parser(wikitext).parse();
			// console.trace(parsed);
			// wikitext = wiki_API.content_of(wikitext);
		} else {
			// assert: typeof wikitext === 'string'
			parsed = parse_wikitext(wikitext);
		}

		if (!Array.isArray(parsed)) {
			return configuration;

			return;
			throw 'Invalid configuration wikitext';
		}

		// 僅處理第一階層。
		parsed.forEach(function(token/* , index, parent */) {
			if (token.type === 'section_title') {
				variable_name = normalize_value(token.title);
				return;
			}

			// parse table
			// @see wiki_API.table_to_array
			if (token.type === 'table' && (token.caption || variable_name)) {
				var value_hash = Object.create(null);
				token.forEach(function(line) {
					if (line.type !== 'table_row') {
						return;
					}
					if (line.header_count > 0) {
						// TODO: using the heaser data
						return;
					}
					var row = [];
					line.forEach(function(cell) {
						if (cell.type !== 'table_cell') {
							// e.g., cell.type !== 'table_attributes'
							return;
						}

						// TODO: data-sort-type in table head

						var data_type, has_list, has_non_empty_token;
						// console.log(cell);
						cell = cell.filter(function(token) {
							if (token.type !== 'table_attributes') {
								if (token.type === 'list') {
									has_list = true;
								} else {
									has_non_empty_token
									//
									= !!token.toString().trim();
								}
								return true;
							}

							// console.log(token);
							data_type = token.toString()
							// @see
							// [[w:en:Help:Sorting#Configuring the sorting]]
							// [[w:en:Help:Sorting#Specifying_a_sort_key_for_a_cell]]
							.match(
							//
							/data-sort-type\s*=\s*(["']([^"']+)["']|\S+)/);
							if (data_type) {
								data_type = data_type[2] || data_type[1];
							}
						}).map(filter_tags);
						if (!has_list) {
							// console.log(cell);
							cell.toString = function() {
								return this.join('');
							};
							cell = normalize_value(cell);
						} else if (has_non_empty_token) {
							// 有些不合格之 token。
							cell.forEach(function(token, index) {
								if (token.type === 'list')
									cell[index] = token.value;
							});
							cell = normalize_value(cell.join(''));
						} else {
							has_list = null;
							// console.trace(cell);
							cell.forEach(function(token) {
								if (token.type === 'list') {
									if (has_list) {
										has_list.append(token
												.map(normalize_value));
									} else {
										has_list = token.map(normalize_value);
									}
								}
								// 只取 list 中的值。
							});
							cell = has_list;
						}

						// console.log([ data_type, cell ]);
						if (data_type === 'number') {
							// console.log(cell);
							if (!isNaN(data_type = +cell))
								cell = data_type;
						} else if (data_type === 'isoDate') {
							data_type = Date.parse(cell
									.replace(/<[^<>]+>/g, ''));
							if (!isNaN(data_type))
								cell = new Date(data_type);
						} else if (data_type) {
							library_namespace.warn('Invalid type: ['
									+ data_type + '] ' + cell);
						}

						// console.log(cell);
						row.push(cell);
					});
					// console.log(line);
					if (row.length >= 2) {
						// ! 變數名 (不可更改) !! 變數值 !! 注解說明
						var name = row[NAME_INDEX];
						if (name && typeof name === 'string') {
							// TODO: "false" → false
							value_hash[name] = row[VALUE_INDEX];
						}
					}
				});
				value_hash[KEY_ORIGINAL_ARRAY] = token;
				configuration[token.caption || variable_name] = value_hash;
				// 僅採用第一個列表。
				if (!token.caption)
					variable_name = null;
			}

			if (token.type !== 'list')
				return;

			if (token.list_type !== DEFINITION_LIST) {
				if (variable_name) {
					configuration[variable_name] = token.map(normalize_value);
					// 僅採用一個列表。
					variable_name = null;
				}
				return;
			}

			token.dt_index.forEach(function(dt_index, index) {
				variable_name = normalize_value(token[dt_index]);
				if (!variable_name)
					return;
				var next_dt_index = token.dt_index[index + 1] || token.length;
				configuration[variable_name]
				// 變數的值
				= dt_index + 2 === next_dt_index
				// 僅僅提供單一數值。
				? normalize_value(token[dt_index + 1])
				// 提供了一個列表。
				: token.slice(dt_index + 1, next_dt_index)
				//
				.map(normalize_value);
			});
			variable_name = null;
		});

		// 避免被覆蓋。保證用 configuration.configuration_page_title 可以檢查是否由頁面取得了設定。
		// 注意: 當設定頁面為空的時候，無法獲得這個值。
		if (configuration_page_title) {
			configuration.configuration_page_title = configuration_page_title;
		} else {
			delete configuration.configuration_page_title;
		}

		return configuration;
	}

	// CeL.wiki.parse.configuration.KEY_ORIGINAL_ARRAY
	parse_configuration.KEY_ORIGINAL_ARRAY = KEY_ORIGINAL_ARRAY;

	// ----------------------------------------------------

	// https://zh.wikipedia.org/wiki/條目#hash 說明
	// https://zh.wikipedia.org/zh-tw/條目#hash 說明
	// https://zh.wikipedia.org/zh-hans/條目#hash 說明
	// https://zh.wikipedia.org/w/index.php?title=條目
	// https://zh.wikipedia.org/w/index.php?uselang=zh-tw&title=條目
	// https://zh.m.wikipedia.org/wiki/條目#hash
	/**
	 * Wikipedia:Wikimedia sister projects 之 URL 匹配模式。
	 * 
	 * matched: [ all, 第一 domain name (e.g., language code / family / project),
	 * title 條目名稱, section 章節, link說明 ]
	 * 
	 * TODO: /wiki/條目#hash 說明
	 * 
	 * TODO: https://zh.wikipedia.org/zh-tw/標題 →
	 * https://zh.wikipedia.org/w/index.php?title=標題&variant=zh-tw
	 * 
	 * @type {RegExp}
	 * 
	 * @see PATTERN_PROJECT_CODE
	 * @see PATTERN_URL_GLOBAL, PATTERN_URL_WITH_PROTOCOL_GLOBAL,
	 *      PATTERN_URL_prefix, PATTERN_WIKI_URL, PATTERN_wiki_project_URL,
	 *      PATTERN_external_link_global
	 * @see https://en.wikipedia.org/wiki/Wikipedia:Wikimedia_sister_projects
	 */
	var PATTERN_WIKI_URL = /^(?:https?:)?\/\/([a-z][a-z\d\-]{0,14})\.(?:m\.)?wikipedia\.org\/(?:(?:wiki|zh-[a-z]{2,4})\/|w\/index\.php\?(?:uselang=zh-[a-z]{2}&)?title=)([^ #]+)(#[^ ]*)?( .+)?$/i;

	/**
	 * Convert URL to wiki link.
	 * 
	 * TODO: 在 default language 非 zh 時，使用 uselang, /zh-tw/條目 會有問題。 TODO: [[en
	 * link]] → [[:en:en link]] TODO: use {{tsl}} or {{link-en}},
	 * {{en:Template:Interlanguage link multi}}.
	 * 
	 * TODO: 與 wiki_API.title_link_of() 整合。
	 * 
	 * @param {String}URL
	 *            URL text
	 * @param {Boolean}[need_add_quote]
	 *            是否添加 [[]] 或 []。
	 * @param {Function}[callback]
	 *            回調函數。 callback({String}wiki link)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {String}wiki link
	 * 
	 * @see [[WP:LINK#跨语言链接]]
	 */
	function URL_to_wiki_link(URL, need_add_quote, callback, options) {
		URL = URL.trim();
		// URL = URL.replace(/[\s\n]+/g, ' ');

		var matched = URL.match(PATTERN_WIKI_URL);
		if (!matched) {
			library_namespace.debug('Can not parse URL: [' + URL
					+ ']. Not a wikipedia link?', 3, 'URL_to_wiki_link');
			if (need_add_quote) {
				if (PATTERN_URL_prefix.test(URL)) {
					// 當作正常外部連結 external link。
					// e.g., 'http://a.b.c ABC'

					// TODO: parse.
					// @see function fix_86() @ 20151002.WPCHECK.js
					// matched = URL.match(/^([^\|]+)\|(.*)$/);

					URL = '[' + URL + ']';
				} else {
					// 當作正常內部連結 wikilink / internal link。
					// e.g., 'ABC (disambiguation)|ABC'
					URL = wiki_API.title_link_of(URL);
				}
			}
			if (callback) {
				callback(URL);
			}
			return URL;
		}

		/** {String}章節 = URL hash */
		var section = matched[3] || '';
		// for [[:mw:Multimedia/Media Viewer]],
		// [[:mw:Extension:MultimediaViewer|媒體檢視器]]
		if (section) {
			if (section.startsWith('#/media/File:')) {
				// 8 === '#/media/'.length
				return section.slice(8);
			}

			// 須注意: 對某些 section 可能 throw！
			try {
				section = decodeURIComponent(section.replace(/\./g, '%'));
			} catch (e) {
				// TODO: handle exception
			}
		}

		/** {String}URL之語言 */
		var language = matched[1].toLowerCase(),
		/** {String}條目名稱 */
		title = decodeURIComponent(matched[2]);

		function compose_link() {
			var link = (language === wiki_API.language ? ''
			//
			: ':' + language + ':') + title + section
			// link 說明
			+ (matched[4] && (matched[4] = matched[4].trim())
			//
			!== title ? '|' + matched[4]
			// [[Help:編輯頁面#链接]]
			// 若"|"後直接以"]]"結束，則儲存時會自動添加連結頁面名。
			: !section && /\([^()]+\)$/.test(title)
			// e.g., [[title (type)]] → [[title (type)|title]]
			// 在 <gallery> 中，"[[title (type)|]]" 無效，因此需要明確指定。
			? '|' + title.replace(/\s*\([^()]+\)$/, '') : '');

			if (need_add_quote) {
				link = wiki_API.title_link_of(link);
			}

			return link;
		}

		// 無 callback，直接回傳 link。
		if (!callback) {
			return compose_link();
		}

		// 若非外 project 或不同 language，則直接 callback(link)。
		if (section || language === wiki_API.language) {
			callback(compose_link());
			return;
		}

		// 嘗試取得本 project 之對應連結。
		wiki_API.langlinks([ language, title ], function(to_title) {
			if (to_title) {
				language = wiki_API.language;
				title = to_title;
				// assert: section === ''
			}
			callback(compose_link());
		}, wiki_API.language, options);
	}

	// ----------------------------------------------------

	// Using JSON.parse() instead of eval()
	function eval_object(code) {
		// library_namespace.log('eval_object: eval(' + code + ')');
		// console.log(code);
		// code = eval(code);

		code = code.trim();
		if (code.startsWith("'") && code.endsWith("'")) {
			// '' to ""
			code = code.replace(
					/\\(.)|(.)/g,
					function(all, escaped_character, character) {
						if (character)
							return character === '"' ? '\\"' : all;
						return /^["\\\/bfnrtu]$/.test(escaped_character) ? all
								: escaped_character;
					}).replace(/^'|'$/g, '"');
			code = code.replace(/\t/g, '\\t');
		} else if (code.startsWith('"') && code.endsWith('"')) {
			code = code.replace(/\\(.)/g, function(all, escaped_character) {
				return /^["\\\/bfnrtu]$/.test(escaped_character) ? all
						: escaped_character;
			});
			code = code.replace(/\t/g, '\\t');
		}
		try {
			return JSON.parse(code);
		} catch (e) {
			console.trace('eval_object: Failed to parse code.');
			console.log(JSON.stringify(code));
			throw e;
		}
	}

	// 簡易但很有可能出錯的 converter。
	// object = CeL.wiki.parse.lua_object(page_data.wikitext);
	// @see https://www.lua.org/manual/5.3/manual.html#3.1
	// TODO: secutity check
	function parse_lua_object_code(lua_code) {
		lua_code = wiki_API.content_of(lua_code);
		if (!/^[\s\n]*return[\s\n]*{/.test(lua_code.replace(
				/(\n|^)\s*--[^\n]*/g, ''))) {
			library_namespace.warn('parse_lua_object_code: Invalid lua code? '
			//
			+ (typeof lua_code === 'string' && lua_code.length > 200
			//
			? lua_code.slice(0, 200) + '...' : lua_code));
			return;
		}

		// --------------------------------------
		// 將所有 String 轉存至 __strings，方便判別 Array, Object。

		var __strings = [];
		library_namespace.debug("轉存 `[=[ string ]=]`", 7,
				'parse_lua_object_code');
		// an opening long bracket of level 1 is written as [=[, and so on.
		lua_code = lua_code.replace(/\[(=*)\[([\s\S]*?)\](?:\1)\]/g, function(
				all, equal_signs, string) {
			// 另外儲存起來以避免干擾。
			// e.g., [[w:zh:Module:CGroup/Physics]]
			__strings.push(string);
			return "__strings[" + (__strings.length - 1) + "]";
		});

		// console.log(lua_code);
		library_namespace.debug(
				"Convert `\"string\"`, `'string'` to \"string\"", 6,
				'parse_lua_object_code');
		lua_code = lua_code
				.replace(
						/("(?:\\.|[^\\\n"])*"|'(?:\\.|[^\\\n'])*')(?:\\t|[\s\n]|--[^\n]*\n)*(?:(\.\.)(?:\\t|[\s\n]|--[^\n]*\n)*)?/g,
						function(all, string, concatenation) {
							string = eval_object(string);
							return JSON.stringify(string)
									+ (concatenation || '');
						});
		// console.log(lua_code);
		if (false) {
			library_namespace
					.debug(
							"remove comments after / between strings: `''..\\n--\\n''` , ``''--`",
							6, 'parse_lua_object_code');
			lua_code = lua_code
					.replace_till_stable(
							/"((?:\\.|[^\\"])*)"(?:\\t|[\s\n])*(\.\.(?:\\t|[\s\n])*)?--[^\n]*/g,
							'$1$2');
			// console.log(lua_code);
		}

		library_namespace.debug('concat `"string".."`', 6,
				'parse_lua_object_code');
		// Lua denotes the string concatenation operator by " .. " (two dots).
		lua_code = lua_code
				.replace_till_stable(
						/("(?:\\.|[^\\"])+)"(?:\\t|[\s\n])*\.\.(?:\\t|[\s\n])*"/g,
						'$1');

		// console.log(lua_code);

		library_namespace.debug('轉存 `"string"`', 6, 'parse_lua_object_code');
		lua_code = lua_code.replace(/"(?:\\.|[^\\\n"])*"/g, function(all) {
			// library_namespace.log(all);
			__strings.push(JSON.parse(all));
			return "__strings[" + (__strings.length - 1) + "]";
		});
		// console.log(lua_code);

		// fix `-- comments` → `// comments`
		// lua_code = lua_code.replace(/([\n\s]|^)\s*--/g, '$1//');
		// fix `-- comments` → 直接消掉
		// lua_code = lua_code.replace(/([\n\s]|^)\s*--[^\n]*/g, '$1');
		library_namespace.debug('remove all -- comments', 6,
				'parse_lua_object_code');
		lua_code = lua_code.replace(/--[^\n]*/g, '');

		// console.log(lua_code);

		// --------------------------------------
		var __table_values = [];
		library_namespace.debug('patch fieldsep ::= ‘,’ | ‘;’', 6,
				'parse_lua_object_code');
		lua_code = lua_code.replace_till_stable(/{([^{}]+)}/g, function(all,
				fieldlist) {
			// console.log(fieldlist);
			var object_value = {},
			// patch {Array}table: `{ field, field, ... }`
			// field ::= ‘[’ exp ‘]’ ‘=’ exp | Name ‘=’ exp | exp
			// fields of the form exp are equivalent to [i] = exp, where i are
			// consecutive integers starting with 1.
			// [,]
			array_value = new Array(1);

			fieldlist = fieldlist.split(/[,;]/);
			fieldlist = fieldlist.forEach(function(field) {
				field = field.trim();
				if (!field) {
					// assert: the last field
					return;
				}
				var matched = field.match(
				//
				/^\[([\s\n]*__strings\[\d+\][\s\n]*)\][\s\n]*=([\s\S]+)$/
				//
				) || field.match(/^\[([\s\S]+)\][\s\n]*=([\s\S]+)$/);
				if (matched) {
					matched[1] = eval_object(matched[1]);
					object_value[matched[1]] = matched[2].trim();
					return;
				}

				// patch {Object}table: `{ name = exp }` → `{ name : exp }`
				matched = field.match(/^([\w]+)[\s\n]*=([\s\S]+)$/);
				if (matched) {
					object_value[matched[1]] = matched[2].trim();
					return;
				}

				array_value.push(field);
			});

			if (array_value.length > 1) {
				if (library_namespace.is_empty_object(object_value)) {
					__table_values.push(array_value);
				} else {
					// mixed array, object
					array_value.forEach(function(item, index) {
						if (index > 0)
							object_value[index] = item;
					});

					__table_values.push(object_value);
				}
			} else {
				__table_values.push(object_value);
			}

			return '__table_values[' + (__table_values.length - 1) + ']';
		});
		// console.log(lua_code);

		function recovery_code(code) {
			if (!code) {
				return code;
			}
			return code.replace(/__table_values\[(\d+)\]/g,
			//
			function(all, index) {
				var table_value = __table_values[+index];
				// console.log(table_value);
				if (Array.isArray(table_value)) {
					table_value = table_value.map(recovery_code);
					if (table_value[0] === undefined)
						table_value[0] = JSON.stringify(null);
					// console.log('[' + table_value + ']');
					// console.log(table_value);
					return '[' + table_value + ']';
				}

				var value_list = [];
				for ( var name in table_value)
					value_list.push(JSON.stringify(name) + ':'
							+ recovery_code(table_value[name]));
				return '{' + value_list + '}';
			});
		}

		library_namespace.debug('recovery_code...', 6, 'parse_lua_object_code');
		lua_code = recovery_code(lua_code);
		// console.log(lua_code);

		// --------------------------------------

		lua_code = lua_code.replace_till_stable(/([\W])nil([\W])/g, '$1null$2');

		// TODO: or, and

		if (false) {
			library_namespace.log(lua_code);
			lua_code = lua_code.replace(/([{,])\s*([a-z_][a-z_\d]*)\s*:/g,
					'$1"$2":');
			console.log(lua_code.replace_till_stable(
			//
			/\{(\s*[a-z_][a-z_\d]*\s*:\s*[a-z_][a-z_\d]*(\[\d+\])?\s*\,?)*\}/i,
					'_'));
		}
		lua_code = lua_code.replace(/__strings\[(\d+)\]/g, function(all, id) {
			return JSON.stringify(__strings[id]);
		});
		// lua_code = eval('(function(){' + lua_code + '})()');

		lua_code = lua_code.replace(/^\s*return([\s\n{])/, '$1');
		lua_code = lua_code.replace(/\t/g, '\\t');

		// console.log(JSON.stringify(lua_code));
		try {
			lua_code = JSON.parse(lua_code);
		} catch (e) {
			library_namespace.error('parse_lua_object_code: Can not parse: '
			//
			+ JSON.stringify(lua_code
			// .slice(0)
			));
			// TODO: handle exception
			return;
		}
		// console.log(lua_code);

		return lua_code;
	}

	// 簡易快速但很有可能出錯的 parser。
	// e.g.,
	// CeL.wiki.parse.every('{{lang}}','~~{{lang|en|ers}}ff{{ee|vf}}__{{lang|fr|fff}}@@{{lang}}',function(token){console.log(token);})
	// CeL.wiki.parse.every('{{lang|ee}}','~~{{lang|en|ers}}ff{{ee|vf}}__{{lang|fr|fff}}@@{{lang}}',function(token){console.log(token);})
	// CeL.wiki.parse.every(['template','lang'],'~~{{lang|en|ers}}ff{{ee|vf}}__{{lang|fr|fff}}@@{{lang}}',function(token){console.log(token);})
	// CeL.wiki.parse.every(/{{[Ll]ang\b[^{}]*}}/g,'~~{{lang|en|ers}}ff{{ee|vf}}__{{lang|fr|fff}}@@{{lang}}',function(token){console.log(token);},CeL.wiki.parse.template)
	function parse_every(pattern, wikitext, callback, parser) {
		// assert: pattern.global === true
		var matched, count = 0;

		if (!parser) {
			if (typeof pattern === 'string'
					&& (matched = pattern.match(/{{([^{}]+)}}/)))
				pattern = [ 'template', matched[1] ];

			if (Array.isArray(pattern)) {
				parser = parse_wikitext[matched = pattern[0]];
				pattern = pattern[1];
				if (typeof pattern === 'string') {
					if (matched === 'template')
						pattern = new RegExp('{{ *(?:' + pattern
								+ ')(?:}}|[^a-z].*?}})', 'ig');
				}
			}
		}

		while (matched = pattern.exec(wikitext)) {
			if (parser) {
				var data = matched;
				matched = parser(matched[0]);
				if (!matched)
					// nothing got.
					continue;

				// 回復 recover index
				matched.index = data.index;
			}

			matched.lastIndex = pattern.lastIndex;
			matched.count = count++;
			callback(matched);
		}
	}

	function parse_timestamp(timestamp) {
		// return Date.parse(timestamp);
		return new Date(timestamp);
	}

	// CeL.wiki.parser(wikitext) 傳回 parser，可作 parser.parse()。
	// CeL.wiki.parse.*(wikitext) 僅處理單一 token，傳回 parse 過的 data。
	// TODO: 統合於 CeL.wiki.parser 之中。
	Object.assign(parse_wikitext, {
		template : parse_template,
		set_template_object_parameters : set_template_object_parameters,
		template_object_to_wikitext : template_object_to_wikitext,
		// CeL.wiki.parse.replace_parameter()
		replace_parameter : replace_parameter,

		date : parse_date,
		// timestamp : parse_timestamp,
		user : parse_user,
		// CeL.wiki.parse.redirect , wiki_API.parse.redirect
		redirect : parse_redirect,

		anchor : get_all_anchor,

		configuration : parse_configuration,

		wiki_URL : URL_to_wiki_link,

		lua_object : parse_lua_object_code,

		every : parse_every
	});

	// ------------------------------------------------------------------------

	// CeL.wiki.HTML_to_wikitext(HTML)
	// TODO: 應該 parse HTML。
	// @see
	// https://www.mediawiki.org/w/api.php?action=help&modules=flow-parsoid-utils
	// https://www.mediawiki.org/w/api.php?action=help&modules=parse
	// https://www.mediawiki.org/w/api.php?action=help&modules=expandtemplates
	function HTML_to_wikitext(HTML, options) {
		return HTML
		//
		.replace(/<\/i><i>/g, '').replace(/<\/b><b>/g, '').replace(
				/<\/strong><strong>/g, '')
		//
		.replace(/<i>([\s\S]+?)<\/i>/g, "''$1''").replace(
				/<b>([\s\S]+?)<\/b>/g, "'''$1'''").replace(
				/<strong>([\s\S]+?)<\/strong>/g, "'''$1'''")
		//
		.replace_till_stable(/<span(?: [^<>]*)?>([^<>]*?)<\/span>/g, "$1")
		//
		.replace(/<a ([^<>]+)>([\s\S]+?)<\/a>/g,
		//
		function(all, attributes, innerHTML) {
			var href = attributes.match(/href="([^"]+)"/);
			return '[' + (href ? href[1] : '#') + ' ' + innerHTML + ']';
		})
		//
		.replace(/<br(?: [^<>]*)?>\n*/ig, '\n').replace(/<p ?\/>\n*/ig, '\n\n')
		// ignore style, remove <p style="...">...</p>
		// .replace(/<p[^<>]*>([^<>]*)<\/p>[\s\n]*/g, '$1\n\n')
		.replace(/<p>([\s\S]+?)<\/p>\n*/g, '$1\n\n')
		//
		.replace(/\r?\n/g, '\n').replace(/\n{3,}/g, '\n\n');
	}

	// ------------------------------------------------------------------------

	/**
	 * 把表格型列表頁面轉為原生陣列。 wikitext table to array table, to table
	 * 
	 * TODO: 按標題統合內容。
	 * 
	 * @param {Object}page_data
	 *            page data got from wiki API.
	 * @param {Object}options
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {Array}陣列資料。
	 * 
	 * @example<code>

	CeL.run(['application.platform.nodejs', 'data.CSV']);
	wiki.page('List of monarchs of Thailand', function(page_data) {
		CeL.wiki.table_to_array(page_data, 'monarchs of Thailand.txt');
	});

	</code>
	 */
	function table_to_array(page_data, options) {
		if (!wiki_API.is_page_data(page_data)) {
			library_namespace.error('Invalid page data!');
			return;
		}
		if (typeof options === 'string') {
			options = {
				file : options
			};
		}

		var heads = [], array = [],
		// handler
		processor = options && options.row_processor;

		page_parser(page_data).parse()
		// 僅處理第一階層。
		.forEach(function(node) {
			if (node.type === 'section_title') {
				if (false) {
					library_namespace.debug(node.length + ','
					//
					+ node.index + ',' + node.level, 3);
					return;
				}
				// 從 section title 紀錄標題。
				var title = node[0];
				if (title.type === 'link') {
					title = title[0][0];
				}
				// console.log(title.toString());
				heads.truncate(node.level);
				heads[node.level] = title.toString().trim();

			} else if (node.type === 'table') {
				library_namespace.debug(node.length + ','
				//
				+ node.index + ',' + node.type, 3);
				node.forEach(function(row) {
					var cells = [];
					row.forEach(function(cell) {
						if (cell.type === 'table_attributes') {
							// 不計入style
							return;
						}
						// return cell.toString().replace(/^[\n\|]+/, '');

						var append_cells;
						if (cell[0].type === 'table_attributes') {
							append_cells = cell[0].toString()
							// 檢測要增加的null cells
							.match(/[^a-z\d_]colspan=(?:"\s*)?(\d{1,2})/i);
							if (append_cells) {
								// -1: 不算入自身。
								append_cells = append_cells[1] - 1;
							}

							var matched = cell[0].toString()
							//
							.match(/[^a-z\d_]rowspan=(?:"\s*)?(\d{1,2})/i);

							if (matched && matched[1] > 1) {
								library_namespace.error(
								// TODO
								'We can not deal with rowspan yet.');
							}

							// 去掉style
							// 注意: 本函式操作時不可更動到原資料。
							var toString = cell.toString;
							cell = cell.clone();
							cell.shift();
							cell.toString = toString;
						}
						cells.push(cell && cell.toString()
						//
						.replace(/^[\|\s]+/, '').trim() || '');
						if (append_cells > 0) {
							cells.append(new Array(append_cells).fill(''));
						}
					});
					if (cells.length > 0) {
						// 將以本列 .header_count 判定本列是否算作標題列。
						if (row.header_count > 0) {
							// 對於 table header，不加入 section title 資訊。
							cells.unshift('', '');
						} else {
							cells.unshift(heads[2] || '', heads[3] || '');
						}
						if (processor) {
							cells = processor(cells);
						}
						array.push(cells);
					}
				});
			}
		});

		// output file. e.g., page_data.title + '.csv.txt'
		if (options && options.file) {
			if (library_namespace.write_file && library_namespace.to_CSV_String) {
				library_namespace.write_file(options.file,
				// 存成 .txt，並用 "\t" 分隔，可方便 Excel 匯入。
				library_namespace.to_CSV_String(array, {
					field_delimiter : '\t'
				}));
			} else {
				library_namespace.error("Must includes frrst: "
						+ library_namespace.Class
						+ ".run(['application.platform.nodejs', 'data.CSV']);");
			}
		}

		return array;
	}

	function array_to_table(array, options) {
		options = library_namespace.setup_options(options);

		var table = [ '{|' + ' class="' + (options['class'] || 'wikitable')
				+ '"' ];
		if (options.caption)
			table[0] += '\n|+ ' + options.caption;

		array.forEach(function(line, index) {
			if (!options.no_header && index === 0) {
				if (Array.isArray(line))
					line = line.join(' !! ');
				table.push('! ' + line);
				return;
			}

			if (Array.isArray(line))
				line = line.join(' || ');
			table.push('| ' + line);
		});

		return table.join('\n|-\n') + '\n|}';
	}

	// ------------------------------------------------------------------------

	// render_template('{{{1|}}} {{{2|}}}', '{{t|a|b}}');
	function render_template(template_code, template_arguments, options) {
		var caller_template_token = wiki_API.parse(template_arguments
				.toString());
		if (!caller_template_token
				|| caller_template_token.type !== 'transclusion') {
			return template_arguments;
		}

		var parsed = wiki_API.parse(template_code.toString());
		parsed.each('tag', function(tag_token) {
			if (tag_token.tag === 'noinclude') {
				return '';
			}
		}, true);

		function render_parameter(parameter_token) {
			var name = parameter_token[0].toString().trim();
			if (name in caller_template_token.parameters) {
				return caller_template_token.parameters[name];
			}

			name = parameter_token[1];
			if (!name) {
				// e.g., {{{class|}}}
				return name.length === 1 ? this.toString() : name;
			}

			;
		}
		function render_all_parameters(token) {
			if (Array.isArray(token))
				for_each_token.call(token, 'parameter', render_parameter, true);
		}
		function render_result_of_parameter(name) {
			name = function_token[function_token.index_of[name]];
			render_all_parameters(name);
			return name.toString().trim();
		}

		// [[mw:Help:Magic words § Parser functions]],
		// [[mw:Help:Extension:ParserFunctions]], [[Help:Magic words]]
		parsed.each('function', function(function_token, index, parent) {
			switch (function_token.name) {
			case 'if':
				var name = render_result_of_parameter(1);
				return function_token[name ? 2 : 3]
				// e.g., {{#if:|v}}
				|| '';

			case 'switch':
				var name = render_result_of_parameter(1);
				if (name in function_token.parameters)
					return function_token.parameters[name];

				// TODO: {{#switch:v|{{#expr:2*3}}=six}}
				for (var index = 2; index < function_token.length; index++) {
					if (name !== render_result_of_parameter(index))
						continue;
					// found
					var index_of = function_token.index_of[index];
					while ((++index in function_token.parameters)
							&& index === ++index_of)
						;
					return function_token[function_token.index_of[index]];
				}

				return function_token.parameters['#default'] || '';

			case 'UCFIRST':
				// {{ucfirst:value}}
				return wiki_API.upper_case_initial(function_token[1] || '');

			}
		}, true);

		// 解碼剩下的 parameters。
		render_all_parameters(parsed);
	}

	// ------------------------------------------------------------------------

	// export 導出.
	// @static
	Object.assign(wiki_API, {
		switch_token : switch_token,

		lead_text : lead_text,
		extract_introduction : extract_introduction,
		// sections : get_sections,

		// {Object} file option hash
		file_options : file_options,

		HTML_to_wikitext : HTML_to_wikitext,

		DEFINITION_LIST : DEFINITION_LIST,

		section_link : section_link,

		// parse_table(), parse_wikitable()
		table_to_array : table_to_array,
		array_to_table : array_to_table,

		get_plain_display_text : get_plain_display_text,

		parse : parse_wikitext,
		// parser : page_parser,

		setup_layout_elements : setup_layout_elements,
		insert_token : insert_token
	});

	return page_parser;
}
