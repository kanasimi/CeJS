/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): parse misc 歸屬於
 *       wiki_API.parse === CeL.application.net.wiki.parser.wikitext
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * TODO:<code>

</code>
 * 
 * @since 2021/12/14 18:53:43 拆分自 CeL.application.net.wiki.parser
 */

// More examples: see /_test suite/test.js
// Wikipedia bots demo: https://github.com/kanasimi/wikibot
'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.wiki.parser.misc',

	require : 'application.net.wiki.parser.wikitext.'
	// to_JS_value()
	+ '|data.code.',

	// 設定不匯出的子函式。
	no_extend : 'this,*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var wiki_API = library_namespace.application.net.wiki;
	// @inner
	var PATTERN_URL_prefix = wiki_API.PATTERN_URL_prefix;

	// --------------------------------------------------------------------------------------------

	// @see Nullish coalescing operator (??)
	// exclude NaN, null, undefined
	function is_valid_parameters_value(value) {
		return value
		// e.g., .text === ''
		// String(value) === ''
		|| value === '' || value === 0;
	}

	wiki_API.is_valid_parameters_value = is_valid_parameters_value;

	// 僅添加有效的 parameters。基本上等同於 Object.assign()，只是不添加無效值。
	function set_template_object_parameters(template_object, parameters,
			value_mapping) {
		if (!template_object)
			template_object = Object.create(null);

		for ( var key in parameters) {
			var value = parameters[key];
			if (value_mapping)
				value = value_mapping[value];
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

		if (!template_object)
			template_object = Object.create(null);

		// 先置放數字 parameters。
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
			if (key in text_array) {
				// 已處理過。
				continue;
			}
			var value = template_object[key];
			if (is_valid_parameters_value(value)) {
				value = String(value);
				if (value.includes('\n') && !text_array.at(-1).endsWith('\n')) {
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

	var KEY_remove_parameter = replace_parameter.KEY_remove_parameter = {
		remove_parameter : true
	},
	// 必須為可列舉的、不可能為模板名稱的數值 Must be an enumerable value
	KEY_template_name = replace_parameter.KEY_template_name = '|template name';

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

	// @inner
	function set_original_parameter_index(template_token, index) {
		if (template_token[index].original_parameter_index >= 0)
			return;

		var parameter_token = template_token[index] = [ [],
				template_token[index], [] ];
		parameter_token.original_parameter_index = 1;
		template_token.need_reparse = true;
		wiki_API.parse.set_wiki_type(parameter_token[0], 'plain');
		wiki_API.parse.set_wiki_type(parameter_token[2], 'plain');
		wiki_API.parse.set_wiki_type(parameter_token, 'plain');
	}

	// @inner
	function mode_space_of_parameters(template_token, index) {
		if (false) {
			template_token.forEach(function(parameter, index) {
				if (index === 0)
					return;
				// TODO: 分析模板參數的空白模式典型。
				// return |$0parameter$1=$2value$3|
			});
		}

		if (typeof index !== 'number' || !(index >= 0)) {
			// treat index as parameter_name
			index = template_token.index_of[index];
		}
		if (!(index >= 0)) {
			// 不存在此 parameter name 可 replace。
			return;
		}

		var this_parameter = template_token[index];
		if (this_parameter.original_parameter_index >= 0)
			this_parameter = this_parameter[this_parameter.original_parameter_index];
		// this_parameter = [ key, " = ", value ] || [ "", "", value ]

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
		spaces = [ spaces,/* " = " */this_parameter[1],
		/* tail spaces */
		this_parameter[3] || '' ];

		return spaces;
	}

	function trim_parameter(parameter) {
		parameter = parameter.toString();
		return parameter.trim().replace(/^([^={}]+)\s+=\s+/, '$1=');
	}

	// 可以省略數字參數名 numbered parameter / numeric parameter name。
	// TODO: template 本身假如會產出 "a=b" 這樣的字串，恐怕會造成問題。
	// https://www.mediawiki.org/wiki/Help:Templates#Numbered_parameters
	function may_omit_numbered_parameter(parameter_value, options) {
		if (!Array.isArray(parameter_value)) {
			if (typeof parameter_value !== 'string')
				return true;
			parameter_value = wiki_API.parse(parameter_value);
		}
		if (!parameter_value)
			return true;

		// 包含模板、註解外的 "="，或前面的空白很重要，就不能省略數字指定 prefix。
		if (Array.isArray(parameter_value)) {
			if (parameter_value.type !== 'plain')
				parameter_value = [ parameter_value ];
			parameter_value = parameter_value.filter(function(token) {
				// if (options.omit_numbered_parameters === 'lenient')
				// 採用比較寬鬆的標準。
				return !(token.type in {
					parameter : true,
					// e.g., {{!}} {{=}}
					magic_word_function : true,
					transclusion : true,
					comment : true
				});
			}).join('');
		} else {
			// assert: typeof parameter_value === 'string'
		}

		// console.trace(parameter_value);
		return !parameter_value.includes('=');
	}

	/**
	 * 將 wiki_API.parse === parse_wikitext() 獲得之 template_token 中的指定 parameter
	 * 換成 replace_to。 replace_template_parameter(), set_parameter(),
	 * modify_template()
	 * 
	 * WARNING: 本函數只保證 template_token.toString() 這個正確。若之後還要利用
	 * template_token，應先執行 `CeL.wiki.inplace_reparse_element(template_token)`。
	 * 
	 * WARNING: 若不改變 parameter name，只變更 value，<br />
	 * 則應該使用 { value_only: true }，<br />
	 * 或使用 'parameter name = value' 而非僅 'value'。
	 * 
	 * @example<code>

	// remove parameter
	CeL.wiki.parse.replace_parameter(template_token, parameter_name, CeL.wiki.parse.replace_parameter.KEY_remove_parameter);

	// replace value only
	token = CeL.wiki.parse('{{t|parameter_name=12|parameter_name_2=32}}');
	changed_count = CeL.wiki.parse.replace_parameter(token, {
		parameter_name : 'replace to value',
		parameter_name_2 : 'replace to value_2',
	}, 'value_only');
	token.toString();

	// replace value and parameter name
	token = CeL.wiki.parse('{{t|parameter_name=12|parameter_name_2=32}}');
	changed_count = CeL.wiki.parse.replace_parameter(token, {
		parameter_name : 'parameter name 3=replace to value',
		parameter_name_2 : 'parameter name 4=replace to value_2',
	});
	token.toString();

	// force_add
	token = CeL.wiki.parse('{{t}}');
	CeL.wiki.parse.replace_parameter(token, {
		parameter_name : 'replace_to_value',
		parameter_name_2 : 'replace_to_value_2',
	}, { value_only : true, force_add : true, append_key_value : true });
	token.toString();

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
	 *            由 wiki_API.parse === parse_wikitext() 獲得之 template_token
	 * @param {String}parameter_name
	 *            指定屬性名稱 parameter name
	 * @param {String|Number|Array|Object|Function}replace_to
	 *            要換成的屬性名稱加上賦值。 e.g., "parameter name = value" ||<br />
	 *            {parameter_1 = value, parameter_2 = value} ||<br />
	 *            function replace_to(value, parameter_name, template_token)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {ℕ⁰:Natural+0} count of templates successful replaced
	 */
	function replace_parameter(template_token, parameter_name, replace_to,
			options) {
		function convert_replace_to(parameter_name) {
			if (typeof replace_to === 'function') {
				// function replace_to(value, parameter_name, template_token) {
				// return 'replace to value'; }
				replace_to = replace_to(
						template_token.parameters[parameter_name],
						parameter_name, template_token);
			}
			return replace_to;
		}

		if (library_namespace.is_Object(parameter_name)) {
			if (options) {
				library_namespace.error('replace_parameter: Invalid usage!');
			}
			// treat `replace_to` as options
			options = library_namespace.setup_options(replace_to);
			// Replace parameter name only, preserve value.
			if (options.parameter_name_only) {
				parameter_name = to_parameter_name_only(parameter_name);
			}

			var operated_template_count = 0, latest_OK_key, key_of_spaces, spaces, next_insert_index;
			for ( var replace_from in parameter_name) {
				replace_to = parameter_name[replace_from];
				if (typeof replace_from === 'string')
					replace_from = replace_from.trim();
				if (convert_replace_to(replace_from) === undefined) {
					continue;
				}
				var index = replace_from === KEY_template_name ? 0
						: template_token.index_of[replace_from];
				if (!(index >= 0)) {
					// 不存在此 parameter name 可 replace。
					if (replace_to !== KEY_remove_parameter
							&& options.value_only && options.force_add) {
						// options.preserve_spacing
						if (!options.no_value_space
						//
						&& (!key_of_spaces || key_of_spaces !== latest_OK_key)
						//
						&& (key_of_spaces = options.append_key_value
						//
						&& latest_OK_key
						// mode_parameter
						|| Object.keys(template_token.parameters).pop())) {
							spaces = mode_space_of_parameters(template_token,
							// assert: typeof key_of_spaces === 'string'
							key_of_spaces);
							// console.log(spaces);
						}
						// console.trace([ replace_from, replace_to ]);
						if (spaces && spaces[1]) {
							replace_to = spaces[0] + replace_from + spaces[1]
									+ replace_to + spaces[2];
						} else if (library_namespace.is_digits(replace_from)
								&& may_omit_numbered_parameter(replace_to,
										options)) {
							library_namespace.debug(
									'Auto remove numbered parameter: '
											+ replace_from, 1,
									'replace_parameter');
						} else {
							replace_to = replace_from + '=' + replace_to;
						}
						if (options.before_parameter
								&& template_token.index_of[options.before_parameter]) {
							// insert before parameter
							next_insert_index = template_token.index_of[options.before_parameter];
							set_original_parameter_index(template_token,
									next_insert_index);
							// assert:
							// template_token[next_insert_index].type ===
							// 'plain'
							template_token[next_insert_index][0].push(
									replace_to, '|');
						} else if (options.append_key_value
								&& next_insert_index >= 1) {
							// 警告: 這會使 template_token[next_insert_index]
							// 不合正規格式！但能插入在最接近前一個插入點之後，
							// 並維持 template_token.index_of 的可用性。
							set_original_parameter_index(template_token,
									next_insert_index);
							template_token[next_insert_index][2].push('|'
									+ replace_to);
						} else {
							template_token.index_of[replace_from] = template_token.length;
							if (false) {
								console.trace('index_of[' + replace_from + ']='
										+ template_token.length, replace_to
										.trim());
								template_token.parameters[replace_from] = replace_to
										.trim();
							}
							template_token.push(replace_to);
						}
						operated_template_count++;
					}
					continue;
				}

				var skip_replacement = undefined;
				if (options.value_only
						// 預防有 KEY_remove_parameter 之類。
						&& (typeof replace_to === 'string'
								|| typeof replace_to === 'number'
						// 允許輸入 token。
						|| wiki_API.is_parsed_element(replace_to))) {
					var this_parameter = template_token[index];
					if (index === 0) {
						// console.trace([ this_parameter, replace_to ]);
						if (options.override_same_value ? this_parameter
								.toString() !== replace_to.toString()
								: this_parameter.toString().trim() !== replace_to
										.toString().trim()) {
							template_token[index] = replace_to;
							operated_template_count++;
						}
						continue;
					}

					if (!Array.isArray(this_parameter)
							|| this_parameter.length < 2) {
						// 可能是變造過的 parameter。
						library_namespace.warn('replace_parameter: '
								+ 'Skip replace [' + replace_from
								+ ']→[replace_to]');
						console.trace(this_parameter);
						console.trace([ index, template_token ]);
						continue;
					}

					var parameters = template_token.parameters;

					// using this_parameter[2] to keep spaces and parameter
					// name.
					// e.g., "| key<!---->=1 |" → "| key<!---->=2 |"
					// NOT: "| key<!---->=1 |" → "| key=2 |"
					if (parameters && parameters[replace_from]) {
						this_parameter[2] = this_parameter[2].toString()
						// 留下註解之類。
						.replace(parameters[replace_from], function(all) {
							if (options.override_same_value
							//
							? all !== replace_to.toString()
							//
							: all.trim() !== replace_to.toString().trim()) {
								// console.trace([ all, replace_to ]);
								skip_replacement = 1;
								return replace_to;
							}

							// console.trace([ all, replace_to ]);
							skip_replacement = 0;
							return all;
						});
					}
					if (!(skip_replacement >= 0)) {
						this_parameter[2] = replace_to;
						skip_replacement = 1;
					}

					if (!may_omit_numbered_parameter(replace_to, options)
							&& !this_parameter[1]) {
						this_parameter[0] = replace_from;
						this_parameter[1] = '=';
					}

					if (parameters) {
						// Also update parameters
						parameters[replace_from] = replace_to;
					}

					if (skip_replacement > 0 && options.no_value_space) {
						if (this_parameter[3]) {
							this_parameter[3] = this_parameter[3].toString()
									.trimStart();
							if (!this_parameter[3])
								this_parameter.splice(3, 1);
						}
						this_parameter[1] = this_parameter[1].toString()
								.trimEnd();
						// 避免
						// https://en.wikipedia.org/w/index.php?title=Talk:Sasha_Allen_(The_Voice_21)&diff=prev&oldid=1198449816
						if (!this_parameter.toString().includes('\n')) {
							this_parameter.forEach(function(piece, index) {
								if (typeof piece === 'string') {
									this_parameter[index] = piece.replace(
											/^\s{2,}/, ' ').replace(/\s{2,}$/,
											' ');
								}
							});
						}
					}

					// @deprecated:
					// replace_to = { [_replace_from] : replace_to };
					// replace_to = Object.create(null);
					// replace_to[replace_from] = replace_to;
				}

				latest_OK_key = replace_from;
				next_insert_index = index;
				// console.trace([ replace_from, replace_to ]);
				if (skip_replacement >= 0) {
					operated_template_count += skip_replacement;
					continue;
				}
				operated_template_count += replace_parameter(template_token,
						replace_from, replace_to);
			}
			return operated_template_count;
		}

		// --------------------------------------

		options = library_namespace.setup_options(options);

		var index = parameter_name === KEY_template_name ? 0
				: template_token.index_of[parameter_name];
		if (!(index >= 0)) {
			// 不存在此 parameter name 可 replace。
			return 0;
		}

		if (convert_replace_to(parameter_name) === undefined) {
			return 0;
		}
		// console.trace(index, replace_to);

		if (replace_to === KEY_remove_parameter) {
			if (library_namespace.is_digits(parameter_name)) {
				// For numeral parameter_name, just replace to empty value.
				template_token[index] = '';
				// Warning: this will NOT change .index_of , .parameters !
				while (!template_token.at(-1))
					template_token.pop();
			} else {
				// remove the parameter
				template_token.splice(index, 1);
				replace_to = wiki_API.parse(template_token.toString());
				if (!replace_to || replace_to.type !== 'transclusion') {
					throw new Error('replace_parameter: Parse error for '
							+ template_token);
				}
				Object.clone(replace_to, false, template_token);
			}
			return 1;
		}

		// --------------------------------------
		// 判斷上下文使用的 spaces。

		var spaces = mode_space_of_parameters(template_token, index);
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
					// TODO: allow {{|=...}}, e.g., [[w:zh:Template:Policy]]
					+ JSON.stringify(replace_to));
					key = parameter_name;
				}
				// TODO: using is_valid_parameters_value(value)
				return spaces[1] ? spaces[0] + key + spaces[1] + value
				//
				+ spaces[2] : key + '=' + value;
			});
		}
		if (Array.isArray(replace_to) && !replace_to.type) {
			replace_to = replace_to.join('|');
		} else {
			replace_to = replace_to.toString();
		}

		// assert: {String}replace_to
		// console.trace(replace_to);

		// 注意: 假如 numbered parameter 本來就沒有添上 1= 之類，那麼就算 .includes('=')
		// 也不會再主動添加。
		if (!spaces[1] && library_namespace.is_digits(parameter_name)) {
			var matched = replace_to.match(/^\s*(\d+)\s*=\s*([\s\S]*)$/);
			if (matched && matched[1] == parameter_name
					&& may_omit_numbered_parameter(matched[2], options)) {
				// e.g., replace [2] to non-named 'value' in {{t|1|2}}
				library_namespace.debug('Auto remove numbered parameter: '
						+ parameter_name, 1, 'replace_parameter');
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

		if (!options.override_same_value
				&& template_token[index]
				&& trim_parameter(template_token[index]) === trim_parameter(replace_to)) {
			// 不處理僅添加空白字元的情況。
			return 0;
		}

		// --------------------------------------
		// a little check: parameter 的數字順序不應受影響。

		var PATERN_parameter_name = /(?:^|\|)[\s\n]*([^={}\s\n][\s\S]*?)=/;
		if (index === 0 || index + 1 < template_token.length) {
			// index === 0: template name 無影響。
			// index + 1 < template_token.length: 最末尾沒有 parameter 了，影響較小。
		} else if (!library_namespace.is_digits(parameter_name)) {
			// TODO: NG: {{t|a=a|1}} → {{t|a|1}}
			if (!PATERN_parameter_name.test(replace_to)) {
				library_namespace.warn('replace_parameter: '
						+ 'Insert named parameter [' + index + '] '
						+ JSON.stringify(parameter_name) + ' '
						+ JSON.stringify(replace_to)
						+ ' and disrupt the order of parameters? '
						+ template_token);
			}
		} else {
			// NG: {{t|a|b}} → {{t|a=1|b}}
			var matched = replace_to.match(PATERN_parameter_name);
			if (!matched) {
				if (parameter_name !== KEY_template_name
						&& index != parameter_name) {
					library_namespace.warn('replace_parameter: '
							+ 'Insert non-named parameter to ['
							+ parameter_name
							+ '] and disrupt the order of parameters? '
							+ template_token);
				}
			} else if (matched[1].trim() != parameter_name) {
				library_namespace
						.warn('replace_parameter: '
								+ 'Insert numbered parameter and disrupt the order of parameters? '
								+ template_token);
			}
		}

		// --------------------------------------

		library_namespace.debug(parameter_name + ': "' + template_token[index]
				+ '"→"' + replace_to + '"', 2, 'replace_parameter');
		template_token[index] = replace_to;

		return 1;
	}

	// ------------------------------------------------------------------------

	// Merge the parameters of from_template_token to to_template_token.
	// target_template_token, source_template_token
	function merge_template_parameters(to_template_token, from_template_token,
			options) {
		if (!Array.isArray(to_template_token)
				|| to_template_token.type !== 'transclusion'
				|| !Array.isArray(from_template_token)
				|| from_template_token.type !== 'transclusion') {
			throw new Error(
					'merge_template_parameters: Invalid template token!');
			return;
		}

		// assert: 不動到 from_template_token。
		var normalize_parameter = options && options.normalize_parameter;

		// 紀錄有衝突的 parameter_name
		var conflict_parameters = [], parameters_to_copy = [];
		for ( var parameter_name in from_template_token.index_of) {
			if (!(parameter_name in to_template_token.parameters)
			// 複製 to_template_token 為空的 parameter 值。
			|| !to_template_token.parameters[parameter_name]
					&& (from_template_token.parameters[parameter_name]
					// 警告: 對於數字 parameter 尚有bug。
					|| library_namespace.is_digits(parameter_name))) {
				parameters_to_copy.push(parameter_name);
				continue;
			}

			var from_value = from_template_token.parameters[parameter_name];
			var to_value = to_template_token.parameters[parameter_name];
			if (normalize_parameter) {
				from_value = normalize_parameter(from_value, parameter_name);
				to_value = normalize_parameter(to_value, parameter_name);
			}
			if (from_value.toString() === to_value.toString()) {
				// Skip the same values.
				continue;
			}

			conflict_parameters.push(parameter_name);
		}

		// console.trace(conflict_parameters, parameters_to_copy);
		if (conflict_parameters.length > 0)
			return conflict_parameters;

		// assert: 在這之前都不動到 to_template_token。

		parameters_to_copy.forEach(function(parameter_name) {
			var from_index = from_template_token.index_of[parameter_name];
			var to_index = to_template_token.index_of[parameter_name];
			if (!to_index) {
				to_template_token.index_of[parameter_name]
				// append. TODO: 依照兩個模板排出最適合的插入點
				= to_index = to_template_token.length;
			}
			// else: 假如原先存在就採用原先的位置。

			// 警告: 對於 object，這種複製方法，改變其一，兩者會一同改變。
			to_template_token[to_index] = from_template_token[from_index];

			to_template_token.parameters[parameter_name]
			// 警告: 對於 object，這種複製方法，改變其一，兩者會一同改變。
			= from_template_token.parameters[parameter_name];
		});
		// console.trace(to_template_token, to_template_token.length);
	}

	// ------------------------------------------------------------------------

	// 模板名#後的內容會忽略。
	// matched: [ , Template name ]
	var TEMPLATE_NAME_PATTERN = /{{[\s\n]*([^\s\n#\|{}<>\[\]][^#\|{}<>\[\]]*)[|}]/,
	//
	TEMPLATE_START_PATTERN = new RegExp(TEMPLATE_NAME_PATTERN.source.replace(
			/\[[^\[]+$/, ''), 'g');
	/** {RegExp}內部連結 PATTERN */
	// var LINK_NAME_PATTERN =
	// /\[\[[\s\n]*([^\s\n\|{}<>\[\]�][^\|{}<>\[\]]*)(\||\]\])/;
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

	// [[w:ks:وِکیٖپیٖڈیا:وَقٕت تہٕ تأریٖخ]]
	var ks_month_name = ',جَنؤری,فَرؤری,مارٕچ,اَپریل,مٔیی,جوٗن,جُلَے,اَگَست,سَتَمبَر,اَکتوٗبَر,نَوَمبَر,دَسَمبَر'
			.split(',');

	// 因應不同的 mediawiki projects 來處理日期。機器人只識別標準時間格式，預防誤判。
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
	//
	// @see
	// https://www.mediawiki.org/wiki/Manual:$wgDefaultUserOptions#Available_preferences
	// $wgDefaultUserOptions['date']
	var date_parser_config = {
		en : [
				// e.g., "01:20, 9 September 2017 (UTC)"
				// [, time(hh:mm), d, m, Y, timezone ]
				/([0-2]?\d:[0-6]?\d)[, ]+([0-3]?\d) ([a-z]{3,9}) ([12]\d{3})(?: \(([A-Z]{3})\))?/ig,
				function(matched, options) {
					return matched[2] + ' ' + matched[3] + ' ' + matched[4]
							+ ' ' + matched[1] + ' ' + (matched[6] || 'UTC');
				}, {
					format : '%2H:%2M, %d %B %Y (UTC)',
					// use UTC
					zone : 0,
					locale : 'en-US'
				} ],

		ks : [
				// [, time(hh:mm), d, m, Y, timezone ]
				/([0-2]?\d:[0-6]?\d)[, ]+([0-3]?\d) ([\u0624-\u06d2]{4,9}) ([12]\d{3})(?: \(([A-Z]{3})\))?/ig,
				function(matched, options) {
					matched[3] = ks_month_name.indexOf(matched[3]);
					return matched[3] > 0 && matched[4] + '-'
							+ matched[3].pad(2) + '-' + +matched[2].pad(2)
							+ ' ' + matched[1] + ' ' + (matched[6] || 'UTC');
				}, {
					format : '%2H:%2M, %d %B %Y (UTC)',
					// use UTC
					zone : 0,
					locale : 'ks-IN'
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
	// all wikimedia using English in default.
	// e.g., wikidata, commons
	date_parser_config.multilingual = date_parser_config.en;

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
				language = wiki_API.site_name(session, {
					get_all_properties : true
				});
				language = language && language.language;
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

		options.date_parser_config = date_parser_config[language];
		if (!options.date_parser_config) {
			if (language) {
				library_namespace.error(
				//
				'normalize_parse_date_options: Invalid language: ' + language);
			}
			// console.log(session);
			// console.trace([ language, wiki_API.language ]);
			options.date_parser_config = date_parser_config[wiki_API.language];
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
		get_date_list : true
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
		if (options.get_date_list) {
			// get all dates. 若設定 options.get_date_list，須保證回傳 {Array}。
			date_list = [];
		}
		if (!wikitext) {
			return date_list;
		}

		// <del>去掉</del>skip年分前之雜項。
		// <del>去掉</del>skip星期與其後之雜項。
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
			if (!options.get_date_list) {
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

	// 由使用者名稱來檢測匿名使用者/未註冊用戶 [[WP:IP]] / 匿名IP用戶 is_anonymous_user
	// [[m:Special:MyLanguage/Tech/News/2021/05]]
	// 在diffs中，IPv6位址被寫成了小寫字母。這導致了死連結，因為Special:使用者貢獻只接受大寫的IP。這個問題已經被修正。
	// https://www.mediawiki.org/wiki/Trust_and_Safety_Product/Temporary_Accounts/FAQ#What_does_a_temporary_username_look_like?
	function parse_temporary_username(username) {
		// 從 testwiki 可發現 "~2024-2133" 也是正規臨時帳戶名稱。
		var matched = username.trim().match(/^~(\d{4})-(\d+)/);
		if (!matched)
			return;

		return {
			// 臨時編號
			temporary_NO : +matched[1],
			year : +matched[1]
		};
	}

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
	/\[\[ *:?(?:[a-z\d\-]{1,14}:?)?(?:user(?:[ _]talk)?|使用者(?:討論)?|用戶(?:討論|對話)?|用户(?:讨论|对话)?|利用者(?:‐会話)?|사용자(?:토론)?|UT?) *: *((?:&#(?:\d{1,8}|x[\da-fA-F]{1,8});|[^{}\[\]\|<>\t\n#�\/])+)/i,
	// [[特殊:功績]]: zh-classical, [[特別:投稿記録]]: ja
	// matched: [ all, " user name " ]
	PATTERN_user_contributions_link = /\[\[(?:Special|特別|特殊|特別) *: *(?:Contributions|Contribs|使用者貢獻|用戶貢獻|(?:用户)?贡献|投稿記録|功績)\/((?:&#(?:\d{1,8}|x[\da-fA-F]{1,8});|[^{}\[\]\|<>\t\n#�\/])+)/i,
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

	// CeL.wiki.parse.user.all === wiki_API.parse.user.all
	parse_user.all = parse_all_user_links;
	// CeL.wiki.parse.user.parse_temporary_username()
	parse_user.parse_temporary_username = parse_temporary_username;

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
	var PATTERN_redirect_general = /^[\s\n]*#(?:REDIRECT|重定向|重新導向|転送|リダイレクト|넘겨주기)\s*(?::\s*)?\[\[([^{}\[\]\|<>\t\n�]+)(?:\|[^\[\]{}]+?)?\]\]/i;

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
		var is_protected = CeL.wiki.is_protected(page_data);
		// `true` or `undefined`
		console.log(is_protected);
	}, {
		prop : 'info'
	});

	 </code>
	 * 
	 * @param {String}page_data
	 *            page data or wikitext to parse
	 * @param {Object}options
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {String}title#section
	 * @returns {Undefined}Not a redirect page.
	 * 
	 * @see all_revision_SQL: page_is_redirect
	 */
	function parse_redirect(page_data, options) {
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

		var session = wiki_API.session_of_options(options);
		var PATTERN_redirect;
		if (session && !(PATTERN_redirect = session.PATTERN_redirect)
				&& session.latest_site_configurations) {
			session.latest_site_configurations.magicwords
					.some(function(magicword) {
						if (magicword.name !== 'redirect')
							return;
						PATTERN_redirect = new RegExp(
								// PATTERN_redirect_template
								/^[\s\n]*(?:redirect_word)\s*(?::\s*)?\[\[([^{}\[\]\|<>\t\n�]+)(?:\|[^\[\]{}]+?)?\]\]/i.source
										.replace('redirect_word',
												magicword.aliases.join('|')),
								'case-sensitive' in magicword ? '' : 'i');
						return true;
					});
		}

		// console.trace(PATTERN_redirect);
		var matched = wikitext
				&& wikitext.match(PATTERN_redirect || PATTERN_redirect_general);
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

	// ------------------------------------------------------------------------

	// const
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
	function parse_configuration(wikitext, options) {
		// 忽略 <span> 之類。
		function filter_tags(token) {
			// console.log(token);
			if (token.type === 'tag' /* || token.type === 'tag_single' */) {
				// console.log(token);
				if (token.tag in {
					nowiki : true,
					code : true,
					syntaxhighlight : true
				}) {
					// console.trace(token);
					// console.trace(token[1].toString());
					// assert: token[1].type === 'tag_inner'
					// do not show type: 'tag_attributes' when .join('')
					token[0][0] = '';
					// token = token[1];
					// token.is_nowiki = true;
					return token;
				}
				// `<b>value</b>` -> `value`
				return filter_tags(token[1]);
			}
			if (Array.isArray(token)) {
				var value = token.map(filter_tags);
				if (false) {
					// 去掉前後的空白字元。
					while (typeof value[0] === 'string' && !value[0].trim())
						value.shift();
					while (typeof value.at(-1) === 'string'
							&& !value.at(-1).trim())
						value.pop();
					// console.trace(value);
					if (value.length === 1
							&& value[0].tag === 'syntaxhighlight'
							// https://www.mediawiki.org/wiki/Extension:SyntaxHighlight#Other_markup
							&& /^JSON/i.test(value[0].attributes.lang)) {
						return value[0];
					}
				}
				value = token.toString.call(value);
				if (token.type === 'list') {
					token.value = value;
				} else {
					return value;
				}
			}
			return token;
		}

		function normalize_value(value) {
			// console.trace(value);
			// console.trace(JSON.stringify(value));
			// console.trace(JSON.stringify(filter_tags(value)));
			value = filter_tags(value);
			// console.trace(value);
			var JS_value = value.toString().trim();

			if (false) {
				var token = wiki_API.parse(JS_value, options);
				if (token.type === 'tag' && token.tag === 'syntaxhighlight'
						&& /^JSON/i.test(token.attributes.lang)) {
					console.trace(token[1].toString());
					return eval_JavaScript_object_code(token[1].toString(),
							true);
				}
			}

			// console.log(JSON.stringify(JS_value));
			JS_value = JS_value
			// TODO: <syntaxhighlight lang="JavaScript" line start="55">
			// https://www.mediawiki.org/wiki/Extension:SyntaxHighlight
			// <source lang="cpp">
			.replace(/<\/?(?:nowiki|code|syntaxhighlight)>/g, '')
			// wikilink → page title
			.replace(/^\[\[ *:?([^{}\[\]\|<>\t\n�]+)(?:\|[^\[\]{}]+?)?\]\]$/,
					'$1')
			// 去除註解。 Remove comments. "<!-- comment -->"
			.replace(/<\!--[\s\S]*?-->/g, '');

			// console.trace([ JS_value, wiki_API.parse(JS_value), value ]);

			value = wiki_API.parse(JS_value);
			if (typeof value !== 'string'
			// 去掉應為 parsed elements，絕對不會是 JS native value。如此可以避免 throw。
			&& (value.type !== 'plain' || typeof value[0] !== 'string')) {
				return JS_value;
			}

			return library_namespace.to_JS_value(JS_value);
		}

		/** {Object}設定頁面/文字所獲得之個人化設定/手動設定 manual settings。 */
		var configuration = Object.create(null),
		/** {String}當前使用之變數名稱 */
		variable_name,
		// using wiki_API.parser()
		parsed, configuration_page_title;

		if (wiki_API.is_page_data(wikitext)) {
			variable_name = wikitext.title;
			configuration_page_title = variable_name;
			parsed = wiki_API.parser(wikitext, options).parse();
			// console.trace(parsed);
			// wikitext = wiki_API.content_of(wikitext);
		} else {
			// assert: typeof wikitext === 'string'
			parsed = wiki_API.parse(wikitext, options);
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
					// console.trace(line);
					line.some(function(cell, index) {
						if (cell.type !== 'table_cell') {
							// e.g., cell.type !== 'table_attributes'
							return;
						}

						// TODO: data-sort-type in table head

						function parse_list_value(token) {
							if (has_list) {
								// append value
								has_list.append(token.map(normalize_value));
								has_list.plain_list_count++;
							} else {
								has_list = token.map(normalize_value);
								has_list.plain_list_count = 1;
							}

							if (token.list_type === wiki_API.DEFINITION_LIST) {
								has_list.plain_list_count--;
								if (!has_list.hash)
									has_list.hash = Object.create(null);
								var key = null;
								// console.trace(token);
								token.forEach(function(item) {
									var item_value = normalize_value(item);
									if (item.is_term) {
										if (key && !has_list.hash[key]) {
											library_namespace.warn(
											//
											'parse_configuration: '
											//
											+ 'Skip key without value: ' + key
													+ '\n→ next key: '
													+ item_value);
										}
										key = item_value;
									} else if (key) {
										// assert: item.is_term === true
										if (has_list.hash[key]) {
											has_list.hash[key]
											//
											.push(item_value);
										} else {
											has_list.hash[key]
											//
											= [ item_value ];
										}
									} else {
										// assert: item.is_term === true
										library_namespace.debug(
												'Ignore value without key: '
														+ item_value, 1,
												'parse_configuration');
										// console.trace(item);
									}
								});
							}
						}

						var data_type, has_list, has_non_empty_token;
						// console.trace(cell);
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
						// console.trace(cell, has_list, has_non_empty_token);

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
									parse_list_value(token);
								}
								// 只取 list 中的值。
							});

							if (!has_list.hash
									|| library_namespace
											.is_empty_object(has_list.hash)) {
								cell = has_list;
							} else if (has_list.plain_list_count === 0) {
								cell = has_list.hash;
							} else {
								library_namespace.warn('parse_configuration: '
								// 包含多種不同類型的列表：
								+ 'Contains different types of lists: '
								//
								+ cell);
								cell = has_list;
							}
						}

						// console.trace([ data_type, cell ]);
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

						// console.trace(cell);
						row.push(cell);

						if (row.length === 2) {
							// ! 變數名 (不可更改) !! 變數值 !! 注解說明
							var name = row[0];
							if (name && typeof name === 'string') {
								// TODO: "false" → false
								value_hash[name] = row[1];
							}
							// Skip comments
							return true;
						}
					});

				});
				// console.trace(value_hash);
				value_hash[KEY_ORIGINAL_ARRAY] = token;
				configuration[token.caption || variable_name] = value_hash;
				// 僅採用第一個列表。
				if (!token.caption)
					variable_name = null;
			}

			if (token.type !== 'list')
				return;

			if (token.list_type !== wiki_API.DEFINITION_LIST) {
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
			library_namespace.debug('Cannot parse URL: [' + URL
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
			// [[w:en:Help:Pipe trick#Where it doesn't work]]
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
	// e.g., 'true' / 'false' / number
	// @inner Only for parse_lua_object_code()
	function eval_JavaScript_object_code(code) {
		if (false) {
			library_namespace.log('eval_JavaScript_object_code: eval(' + code
					+ ')');
			console.log(code);
			code = eval(code);
		}

		code = code.trim();

		// Only for parse_lua_object_code()
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
			// TODO: 應避免安全問題。
			return JSON.parse(code);
		} catch (e) {
			console.trace('eval_JavaScript_object_code: '
					+ 'Failed to parse code.');
			console.log(JSON.stringify(code));
			throw e;

			// TODO: handle exception
		}

		// return code;
	}

	/**
	 * 簡易、很可能出錯的 lua object parser。
	 * 
	 * @example<code>

	object = CeL.wiki.parse.lua_object(page_data.wikitext);

	</code>
	 * 
	 * TODO: secutity check
	 * 
	 * @param {String}lua_code
	 *            lua object code to parse.
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns parsed lua object
	 * 
	 * @see https://www.lua.org/manual/5.3/manual.html#3.1
	 */
	function parse_lua_object_code(lua_code, options) {
		options = library_namespace.setup_options(options);
		lua_code = wiki_API.content_of(lua_code);
		// e.g., `require('Module:Module wikitext')._addText('{{vfd|...}}')`
		// @ [[w:zh:Module:CGroup/足球俱乐部]]
		lua_code = lua_code.replace(/(?:\n|^)\s*require\([^)]+\)[^\n]*/g, '');
		if (!options.force_parse
				&& !/^[;\s\n]*return[\s\n]*{/.test(lua_code.replace(
						/(?:\n|^)[;\s]*--[^\n]*/g, ''))) {
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

		library_namespace.debug(
				"Convert `\"string\"`, `'string'` to \"string\"", 6,
				'parse_lua_object_code');
		// console.trace(lua_code);
		lua_code = lua_code
				.replace(
						/("(?:\\[\s\S]|[^\\\n"])*"|'(?:\\[\s\S]|[^\\\n'])*')(?:\\t|[\s\n]|--[^\n]*\n)*(?:(\.\.)(?:\\t|[\s\n]|--[^\n]*\n)*)?/g,
						function(all, string, concatenation) {
							string = eval_JavaScript_object_code(string);
							return JSON.stringify(string)
									+ (concatenation || '');
						});
		// console.trace(lua_code);
		if (false) {
			library_namespace
					.debug(
							"remove comments after / between strings: `''..\\n--\\n''` , ``''--`",
							6, 'parse_lua_object_code');
			// console.trace(lua_code);
			lua_code = lua_code
					.replace_till_stable(
							/"((?:\\[\s\S]|[^\\"])*)"(?:\\t|[\s\n])*(\.\.(?:\\t|[\s\n])*)?--[^\n]*/g,
							'$1$2');
		}

		// --------------------------------------

		// prevent patch fieldsep ::= ‘,’ | ‘;’ below
		// 必須是在富源乾不會被更動的代碼!
		var MARK_as_object = '\0as_object';
		// console.trace(library_namespace.string_digest(lua_code, 800));

		// e.g., parse
		// https://raw.githubusercontent.com/wikimedia/mediawiki/master/includes/languages/data/ZhConversion.php
		lua_code = lua_code.replace(
		// e.g., ["A"=>"B","C"=>"D",]
		/\[\s*((?:"[^"]*"\s*=>\s*"[^"]*"\s*(?:,\s*)?)+)\]/g,
		// → {"A":"B","C":"D",}
		function(all, inner) {
			if (false) {
				console.trace(library_namespace.string_digest(inner, 800));
			}
			inner = inner.replace(/("[^"]*")\s*=>\s*("[^"]*")/g, function(all,
					from, to) {
				return from + ':' + to;
			});
			return MARK_as_object + inner.replace(/,\s*$/, '') + '}';
		});

		// --------------------------------------

		library_namespace.debug('concat `"string".."string"`', 6,
				'parse_lua_object_code');
		// Lua denotes the string concatenation operator by " .. " (two dots).
		lua_code = lua_code.replace_till_stable(
				/("(?:\\[\s\S]|[^\\"])+)"(?:\\t|[\s\n])*\.\.(?:\\t|[\s\n])*"/g,
				'$1');

		// --------------------------------------

		library_namespace.debug('轉存 `"string"`', 6, 'parse_lua_object_code');
		// console.trace(lua_code);
		lua_code = lua_code.replace(/"(?:\\[\s\S]|[^\\\n"])*"/g, function(all) {
			// library_namespace.log(all);
			__strings.push(JSON.parse(all));
			return "__strings[" + (__strings.length - 1) + "]";
		});

		// --------------------------------------

		// 必須先處理完字串才能消掉 comments，預防有 "--a--"。

		// fix `-- comments` → `// comments`
		// lua_code = lua_code.replace(/([\n\s]|^)\s*--/g, '$1//');
		// fix `-- comments` → 直接消掉
		// lua_code = lua_code.replace(/([\n\s]|^)\s*--[^\n]*/g, '$1');
		library_namespace.debug('remove all -- comments', 6,
				'parse_lua_object_code');
		// console.trace(lua_code);
		lua_code = lua_code.replace(/--[^\n]*/g, '');

		// --------------------------------------
		var __table_values = [];
		library_namespace.debug('patch fieldsep ::= ‘,’ | ‘;’', 6,
				'parse_lua_object_code');
		// console.trace(lua_code);
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
					matched[1] = eval_JavaScript_object_code(matched[1]);
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

		// --------------------------------------

		// Recover MARK_as_object
		// console.trace(library_namespace.string_digest(lua_code, 800)));
		lua_code = lua_code.replace(new RegExp(MARK_as_object, 'g'), '{');
		// console.trace(library_namespace.string_digest(lua_code, 800)));

		// --------------------------------------

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
		// console.trace(lua_code);
		lua_code = recovery_code(lua_code);

		// --------------------------------------

		// console.trace(lua_code);
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

		lua_code = lua_code.replace(/^[;\s\n]*return[\s\n]*{/, '{');

		// 遇到 async function check_system_conversions() @
		// wiki/routine/20191129.check_language_conversion.js
		// 會導致 `""` 外的 \t 被轉為 \\t。
		// lua_code = lua_code.replace(/\t/g, '\\t');

		// console.log(JSON.stringify(lua_code));
		try {
			lua_code = JSON.parse(lua_code);
		} catch (e) {
			library_namespace.error('parse_lua_object_code: '
			//
			+ 'Cannot parse code as JSON: ' + JSON.stringify(lua_code
			// .slice(0)
			));
			// console.trace(lua_code);
			// console.trace(e);
			// TODO: handle exception
			return;
		}
		// console.trace(lua_code);

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
				parser = wiki_API.parse[matched = pattern[0]];
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

	// ------------------------------------------------------------------------

	// export 導出.

	// CeL.wiki.parse.*
	// CeL.wiki.parser(wikitext) 傳回 parser，可作 parser.parse()。
	// CeL.wiki.parse.*(wikitext) 僅處理單一 token，傳回 parse 過的 data。
	// TODO: 統合於 CeL.wiki.parser 之中。
	Object.assign(wiki_API.parse, {
		template : parse_template,
		set_template_object_parameters : set_template_object_parameters,
		template_object_to_wikitext : template_object_to_wikitext,
		// CeL.wiki.parse.replace_parameter()
		replace_parameter : replace_parameter,
		merge_template_parameters : merge_template_parameters,

		// wiki_API.parse.date()
		date : parse_date,
		// timestamp : parse_timestamp,
		user : parse_user,
		// CeL.wiki.parse.redirect , wiki_API.parse.redirect
		redirect : parse_redirect,

		// anchor : get_all_anchors,

		configuration : parse_configuration,

		wiki_URL : URL_to_wiki_link,

		lua_object : parse_lua_object_code,

		every : parse_every
	});

	// --------------------------------------------------------------------------------------------

	// 不設定(hook)本 module 之 namespace，僅執行 module code。
	return library_namespace.env.not_to_extend_keyword;
}
