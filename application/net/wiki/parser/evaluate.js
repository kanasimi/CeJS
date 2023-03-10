/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): parse wikitext 解析維基語法
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * TODO:<code>

parser [[WP:維基化]] [[w:en:Wikipedia:AutoWikiBrowser/General fixes]] [[w:en:Wikipedia:WikiProject Check Wikipedia]]
https://www.mediawiki.org/wiki/API:Edit_-_Set_user_preferences

</code>
 * 
 * @since 2022/10/28 13:28:55 拆分自 CeL.application.net.wiki.wikitext
 */

// More examples: see /_test suite/test.js
// Wikipedia bots demo: https://github.com/kanasimi/wikibot
'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.wiki.parser.evaluate',
	// for_each_token
	require : 'application.net.wiki.parser.',

	// 設定不匯出的子函式。
	no_extend : 'this,*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var wiki_API = library_namespace.application.net.wiki, for_each_token = wiki_API.parser.parser_prototype.each;
	// @inner
	var PATTERN_invalid_page_name_characters = wiki_API.PATTERN_invalid_page_name_characters;

	// --------------------------------------------------------------------------------------------

	// 演算/轉換 wikitext 中的所有 {{{parameter}}}。
	function convert_parameter(wikitext, parameters, options) {
		if (!parameters)
			parameters = Object.create(null);

		var parsed = wikitext;
		if (typeof wikitext === 'string') {
			parsed = wiki_API.parse(wikitext, options);
		}
		// console.trace([ wikitext, options ]);
		// console.trace(parsed);

		var have_template_parameters, has_complex_parameter_name;
		for_each_token.call(parsed, 'parameter', function(token) {
			have_template_parameters = true;
			var value = token[0];
			if (typeof value !== 'string') {
				// e.g., `{{{{{{foo}}}}}}`, `{{{ {{{parameter_name}}} | ... }}}`
				has_complex_parameter_name = true;
				// Skip this parameter token
				return;
			}
			// 取決於參數的定義性
			// https://en.wikipedia.org/wiki/Help:Conditional_expressions
			if (value in parameters) {
				// 先將 parsed 充作 parent 使用。
				var parsed = token;
				// 預防循環參照。
				// e.g., parameters[1] = `{{{1}}}`
				while (parsed = parsed.parent) {
					// console.trace(parsed);
					if (parsed.parameter_NO === value)
						return;
				}

				// 避免污染原 parameter。
				parsed = wiki_API.parse(parameters[value].toString(), options);
				if (Array.isArray(parsed)) {
					// 預防循環參照。
					parsed.parameter_NO = value;
					for_each_token.call(parsed,
					//
					library_namespace.null_function, {
						add_index : true
					});
				}
				// console.trace(parsed);
				return parsed;
			}

			if (token.length < 2) {
				// e.g., `{{{1}}}` without parameter 1, return `{{{1}}}` itself.
				return;
			}

			token = [ token[1] ];
			convert_parameter(token, parameters, options);
			return token[0];
		}, true);

		if (has_complex_parameter_name) {
			has_complex_parameter_name = parsed.toString();
			if (!wikitext || wikitext !== has_complex_parameter_name) {
				// Re-parse again
				parsed = convert_parameter(has_complex_parameter_name,
						parameters, options);
			} else if (wikitext) {
				// assert: wikitext === has_complex_parameter_name
				parsed.has_complex_parameter_name = true;
			}
		}

		if (have_template_parameters)
			parsed.have_template_parameters = true;
		return parsed;
	}

	// 演算 wikitext 中的所有 magic word。
	function evaluate_parsed(parsed, options) {
		if (!parsed)
			return parsed === undefined ? '' : /* 0 || '' */parsed;

		if (parsed.evaluate) {
			return parsed.evaluate(options);
		}

		// Error.stackTraceLimit = Infinity;
		// console.trace([ parsed.toString(), parsed ]);
		// Error.stackTraceLimit = 10;
		var promise;
		if (parsed.type === 'magic_word_function') {
			promise = evaluate_parser_function_token.call(parsed, options);
		} else {
			promise = for_each_token.call(parsed, 'magic_word_function',
			//
			function(token) {
				// console.trace(token);
				return evaluate_parser_function_token.call(token, options);
			}, true);

		}

		// Error.stackTraceLimit = Infinity;
		// console.trace([ parsed.toString(), parsed, promise ]);
		// Error.stackTraceLimit = 10;
		return library_namespace.is_thenable(promise)
		//
		? promise.then(function return_parsed() {
			return parsed;
		}) : parsed;
	}

	function template_preprocessor(wikitext, options) {
		if (!wikitext.match) {
			console.trace(wikitext);
		}

		var matched = wikitext
		// 優先權高低: <onlyinclude> → <nowiki> → <noinclude>, <includeonly>
		// [[mw:Transclusion#Partial transclusion markup]]
		.match(/<onlyinclude(\s[^<>]*)?>[\s\S]*?<\/onlyinclude>/g);
		if (matched) {
			wikitext = matched.join('').replace(/<onlyinclude(\/|\s[^<>]*)?>/g,
					'').replace(/<\/onlyinclude>/g, '');
		}

		var parsed = wiki_API.parser(wikitext, options).parse();
		parsed.each('tag_single', function(token) {
			if (token.tag === 'noinclude') {
				// Allow `<noinclude />`
				return '';
			}
		}, true);
		parsed.each('tag', function(token) {
			if (token.tag === 'noinclude')
				return '';
			if (token.tag === 'includeonly')
				return token.join('');
		}, true);
		wikitext = parsed.toString();
		// console.trace(wikitext);

		return wikitext;
	}

	function generate_expand_template_function(transclusion_config) {
		// 利用語境 context。
		return function general_expand_template(options) {
			// console.trace(transclusion_config);
			transclusion_config.usage_times++;
			var wikitext = transclusion_config.simplified_template_wikitext;
			return transclusion_config.need_evaluate ? simplify_transclusion(
					wikitext, this, options) : wikitext;
		};
	}

	/**
	 * 演算/簡化要 transclusion 的模板 wikitext。
	 * 
	 * @param {String}wikitext
	 *            模板 wikitext。
	 * @param {Array}template_token_called
	 *            正呼叫此模板的 template token。 The template token being called.
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項。
	 * @param {Number}[level]
	 *            迭代呼叫層數。
	 * 
	 * @returns {Promise|Array} 簡化過且解析過的 wiki syntax。
	 */
	function simplify_transclusion(wikitext, template_token_called, options,
			level) {
		// console.trace(template_token_called);
		var parameters = template_token_called.parameters;
		var page_data, transclusion_config;
		if (wiki_API.is_page_data(wikitext)) {
			page_data = wikitext;
			wikitext = wiki_API.content_of(page_data);
		}
		wikitext = template_preprocessor(wikitext, options);
		if (!wikitext)
			return wikitext;

		var parsed = convert_parameter(wikitext, parameters, options);
		if (page_data) {
			// cache
			var session = wiki_API.session_of_options(options);
			// 只在第一次執行時(!!page_data=true)顯示訊息。
			options = Object.assign({
				show_NYI_message : true,
				transclusion_from_page : page_data
			}, options);
			if (session) {
				var template_name = session
						.remove_namespace(page_data, options);
				// delete page_data.revisions;
				// console.trace(page_data);
				transclusion_config = {
					title : page_data.title,
					// page_data : page_data,
					need_evaluate : parsed.have_template_parameters,
					simplified_template_wikitext : wikitext,
					// 引用次數
					usage_times : 1,
					fetch_date : Date.now()
				};
				if (wiki_API.template_functions) {
					wiki_API.template_functions.set_proto_properties(
					//
					template_name, {
						expand :
						//
						generate_expand_template_function(transclusion_config)
					}, options);
				}
				if (transclusion_config.need_evaluate)
					transclusion_config = null;
			}
		}
		wikitext = parsed.toString();
		// console.trace([ wikitext, page_data ]);

		if (!level)
			level = 1;
		else
			level++;

		// 避免不解析模板。
		// e.g., "=={{USA}} USA=="
		delete options.target_array;

		parsed = wiki_API.parser(wikitext, options).parse();
		if (parsed.length === 1 && typeof parsed[0] === 'string'
				&& parsed[0].includes('{{')) {
			library_namespace.warn('simplify_transclusion: Cannot parse '
					+ JSON.stringify(wikitext));
			// console.trace(wikitext);
			// console.trace(options);
			console.trace(Object.keys(options));
			// console.trace(parsed);
			// console.trace(wiki_API.parse(wikitext));
		}

		if (options.template_token_called !== template_token_called) {
			options = Object.clone(options);
			// 紀錄正呼叫的 template token。
			options.template_token_called = template_token_called;
		}

		/**
		 * TODO:<code>

		parse 嵌入section內文 [[mw:Extension:Labeled_Section_Transclusion]]:
		{{#lsth:page_title|section begin in wikitext|section end in wikitext}}, {{#section-h:page_title}} 語意上相當於 {{page_title#section}}。如果有多個相同名稱的section，僅轉換第一個。The matching is case insensitive
		TODO: parse <section begin=chapter1 />, {{#lst:page_title|section begin|section end}}, {{#lstx:page_title|section|replacement_text}}

		</code>
		 */
		// [[mw:Help:Substitution]]
		// {{subst:FULLPAGENAME}} {{safesubst:FULLPAGENAME}}
		var promise = parsed.each('magic_word_function', function(token) {
			if (token.name !== 'SAFESUBST' && token.name !== 'SUBST') {
				if (transclusion_config && !transclusion_config.need_evaluate) {
					transclusion_config.need_evaluate = true;
					transclusion_config = null;
				}
				return;
			}

			// token = evaluate_parsed(token, options);
			var wikitext = token.toString().replace(/^({{)[^:]+:/, '$1');
			var parsed = wiki_API.parse(wikitext, options);
			if (level > 3 || !parsed || parsed.type !== 'transclusion') {
				// `page_data ?`: 為了維持cache與第一次執行的輸出相同。
				// 例如在 `await CeL.wiki.expand_transclusion(
				// '{{Namespace detect|main=Article text}}')`
				return page_data ? token : parsed;
			}
			// expand template
			parsed = expand_transclusion(parsed, options, level);
			return parsed;
		}, true);

		function resolve_magic_word_function() {
			var wikitext = parsed.toString();
			// console.trace([ wikitext, page_data ]);
			parsed = wiki_API.parser(wikitext, options).parse();
			if (/{{/.test(parsed)) {
				// console.trace(page_data && page_data.title || wikitext);
			}
			var promise = evaluate_parsed(parsed, options);
			// console.trace([ promise ]);
			return promise || parsed;
		}

		if (promise)
			return promise.then(resolve_magic_word_function);

		return resolve_magic_word_function();
	}

	// 循環展開模板節點。
	// 可考慮是否採用 CeL.wiki.wikitext_to_plain_text()
	function repeatedly_expand_template_token(token, options) {
		while (token && token.type === 'transclusion') {
			if (typeof token.expand !== 'function') {
				if (wiki_API.template_functions) {
					// console.trace(options);
					wiki_API.template_functions.adapt_function(token, null,
							null, options);
					// console.trace([ token, token.expand, options ]);
				} else {
					library_namespace
							.debug(
									'建議 include application.net.wiki.template_functions',
									1, 'repeatedly_expand_template_token');
				}
				if (typeof token.expand !== 'function') {
					break;
				}
			}

			// console.trace(token);
			// console.trace(options);
			// expand template, .expand_template(), .to_wikitext()
			// https://www.mediawiki.org/w/api.php?action=help&modules=expandtemplates
			var promise = token.expand(options);
			if (library_namespace.is_thenable(promise)) {
				// e.g., general_expand_template()
				if (options && options.allow_promise) {
					return promise.then(function(token) {
						// console.log([ token, options ]);
						// console.trace(token.toString());
						return repeatedly_expand_template_token(
						//
						token, options);
					});
				}
				library_namespace
						.error('repeatedly_expand_template_token: Using async function + options.allow_promise to expand: '
								+ token);
				// Error.stackTraceLimit = Infinity;
				// console.trace(token);
				// delete token.expand;
				break;
			}
			token = wiki_API.parse(promise, options);
		}

		return token;
	}

	// 類似 wiki_API_expandtemplates()
	// ** 僅能提供簡單的演算功能，但提供 cache，不必每次傳輸資料回伺服器。
	// [[Special:ExpandTemplates]]
	// 使用上注意: 應設定 options[KEY_on_page_title_option]
	// 可考慮是否採用 CeL.wiki.wikitext_to_plain_text()
	function expand_transclusion(wikitext, options, level) {
		if (!wikitext)
			return wikitext;

		if (library_namespace.is_thenable(wikitext)) {
			return wikitext.then(function(wikitext) {
				return expand_transclusion(wikitext, options, level);
			});
		}

		var parsed;
		if (typeof options === 'string') {
			// temp
			parsed = options;
			options = {
				allow_promise : true,
				set_not_evaluated : true
			};
			options[KEY_on_page_title_option] = parsed;
		} else {
			// .new_options(): 會設定 options.something_not_evaluated，避免污染。
			options = Object.assign({
				allow_promise : true,
				set_not_evaluated : true
			}, options);
		}

		if (Array.isArray(wikitext)) {
			parsed = wikitext;
			if (parsed.type !== 'plain') {
				parsed = [ parsed ];
				parsed.has_shell = true;
			}
		} else {
			parsed = wiki_API.parser(wikitext, options).parse();
		}

		if (options.template_token_called)
			parsed = convert_parameter(parsed,
					options.template_token_called.parameters, options);

		var session = wiki_API.session_of_options(options);
		// console.trace(parsed);
		// Error.stackTraceLimit = Infinity;
		// console.trace(parsed.toString());
		// Error.stackTraceLimit = 10;
		var promise = for_each_token.call(parsed, 'transclusion', function(
				token) {
			// Error.stackTraceLimit = Infinity;
			// console.trace(token);
			token = repeatedly_expand_template_token(token, options);
			// console.trace(token);
			// Error.stackTraceLimit = 10;
			if (!token || token.type !== 'transclusion')
				return token;

			token = expand_template_name(token);
			if (library_namespace.is_thenable(token)) {
				return token.then(fetch_and_resolve_template);
			}

			// console.trace(token);
			return fetch_and_resolve_template(token);
		}, true);

		function expand_template_name(token) {
			// console.trace(token[0]);
			var template_name = token[0].toString();
			var promise = expand_transclusion(token[0], options, level);
			if (!library_namespace.is_thenable(promise)) {
				if (false) {
					Error.stackTraceLimit = Infinity;
					console.trace([ token, token[0], token[0].toString(),
							template_name, promise ]);
					Error.stackTraceLimit = 10;
				}
				if (template_name !== token[0].toString()) {
					token[0] = promise;
					// console.trace('re-parse ' + token[0]);
					token = wiki_API.parse(token.toString(), options);
					token = repeatedly_expand_template_token(token, options);
					if (token.type === 'plain' && token.length === 1)
						token = token[0];
					// console.trace(token);
				}
				return token;
			}

			// e.g., `{{ {{t|a|b}}|b|d}}`
			return promise.then(function(template_name) {
				var _token = wiki_API.parse('{{' + template_name + '}}',
						options);
				// console.trace(_token);
				token[0] = _token[0];
				token.page_title = _token.page_title;
				return expand_template_name(token);
			});
		}

		function fetch_and_resolve_template(token) {
			if (!token || token.type !== 'transclusion') {
				// Error.stackTraceLimit = Infinity;
				// console.trace(token);
				// Error.stackTraceLimit = 10;
				return token;
			}
			if (false) {
				console.trace(token);
				var some_sub_token_not_evaluated;
				for_each_token.call(token, 'magic_word_function', function(
						magic_word_function) {
					if (magic_word_function.not_evaluated) {
						some_sub_token_not_evaluated = true;
						return for_each_token.exit;
					}
				});
				console.trace(some_sub_token_not_evaluated);
			}
			var page_title = token.page_title.toString();
			// @see PATTERN_page_name @ CeL.application.net.wiki.namespace
			if (PATTERN_invalid_page_name_characters.test(page_title)) {
				library_namespace.warn('expand_transclusion: Cannot expand '
						+ token);
				// Error.stackTraceLimit = Infinity;
				// console.trace(token);
				// Error.stackTraceLimit = 10;
				return token;
			}

			return new Promise(function(resolve, reject) {
				function evaluate(page_data, error) {
					if (error) {
						// e.g. 頁面不存在，不做更改。
						library_namespace.error('expand_transclusion: '
								+ wiki_API.title_link_of(page_title) + ': '
								+ error);
						// reject(error);
						resolve();
						return;
					}
					resolve(simplify_transclusion(page_data, token, options,
							level));
				}

				// var session = wiki_API.session_of_options(options);
				var page_options = Object.assign({
					redirects : 1
				}, options);

				if (!session) {
					page_title = wiki_API.to_namespace(page_title, 'Template');
					wiki_API.page(page_title, evaluate, page_options);
					return;
				}

				page_title = session.to_namespace(page_title, 'Template');

				// 盡量避免網路操作。
				if (!session.templates_now_fetching)
					session.templates_now_fetching = Object.create(null);
				if (page_title in session.templates_now_fetching) {
					session.templates_now_fetching[page_title].push(evaluate);
					if (false) {
						console.trace([ session.templates_now_fetching
						//
						[page_title].length, page_title ]);
					}
					return;
				}
				session.templates_now_fetching[page_title] = [ evaluate ];

				if (false) {
					console.trace(page_title);
					Error.stackTraceLimit = Infinity;
					console.trace([ session.running, session.actions.length,
					//
					session.actions[
					//
					wiki_API.KEY_waiting_callback_result_relying_on_this] ]);
					Error.stackTraceLimit = 10;
				}
				library_namespace.log_temporary('fetch_and_resolve_template: '
						+ wiki_API.title_link_of(page_title));
				Error.stackTraceLimit = Infinity;
				session.register_redirects(page_title,
				//
				function(page_data, error) {
					// console.trace([ page_data, page_title, error ]);
					session.page(page_data || page_title, function(page_data,
							error) {
						var evaluate_list
						//
						= session.templates_now_fetching[page_title];
						delete session.templates_now_fetching[page_title];
						evaluate_list.forEach(function(evaluate) {
							evaluate(page_data, error);
						});
					}, page_options);
				}, {
					// namespace : 'Template',
					no_message : true
				});
				Error.stackTraceLimit = 10;
			});
		}

		function return_evaluated() {
			// console.trace(parsed.toString());
			if (parsed.has_shell)
				parsed = parsed[0];
			parsed = evaluate_parsed(parsed, options);
			// console.trace(parsed.toString());
			return parsed;
		}

		// Error.stackTraceLimit = Infinity;
		// console.trace(promise);
		// Error.stackTraceLimit = 10;
		if (!library_namespace.is_thenable(promise))
			return return_evaluated();

		promise = promise.then(return_evaluated);
		return promise;
	}

	// --------------------------------------------------------------------------------------------

	var PATTERN_expr_number = /([+\-]?(?:[\d.]+)(?:e[+\-]\d+)?|\.|(?:pi|e|NAN)(?!\s*[+\-\d\w]|$))/i;
	function generate_PATTERN_expr_operations(operations, operand_count) {
		return new RegExp((operand_count === 1 ? /(operations)\s*number/
		// assert: operand_count === 2
		: /number\s*(operations)\s*number/).source.replace('operations',
				operations).replace(/number/g, PATTERN_expr_number.source),
				'ig');
	}

	var PATTERN_expr_e_notation = generate_PATTERN_expr_operations('[eE]', 2);
	var PATTERN_expr_floor = generate_PATTERN_expr_operations('floor', 1);
	var PATTERN_expr_power = generate_PATTERN_expr_operations(/\^/.source, 2);
	// 乘 除 模除/餘數
	var PATTERN_expr_乘除 = generate_PATTERN_expr_operations('[*/]|div|mod|fmod',
			2);
	var PATTERN_expr_加減 = generate_PATTERN_expr_operations('[+\-]', 2);
	var PATTERN_expr_round = generate_PATTERN_expr_operations('round', 2);

	var
	// 其他的一元運算
	PATTERN_expr_unary_operations = generate_PATTERN_expr_operations(
	// [+\-]+|exp|ln|abs|sqrt|trunc|floor|ceil|sin|cos|tan|asin|acos|atan|not
	/[+\-]+|exp|ln|abs|sqrt|trunc|ceil|sin|cos|tan|asin|acos|atan|not/.source,
			1),
	// 其他的二元運算
	PATTERN_expr_binary_operations = generate_PATTERN_expr_operations(
	// [+\-*/^<>=eE]|[<>!]=|<>|and|or|div|mod|fmod|round
	/[<>=]|[<>!]=|<>/.source, 2),
	// 用括號框起來起來的數字。
	PATTERN_expr_bracketed_number = new RegExp(/\(\s*number\s*\)/.source
			.replace(/number/g, PATTERN_expr_number.source), 'g');

	var PATTERN_expr_and = generate_PATTERN_expr_operations('and', 2);
	var PATTERN_expr_or = generate_PATTERN_expr_operations('or', 2);

	// [[mw:Help:Extension:ParserFunctions##expr]], [[mw:Help:Help:Calculation]]
	function eval_expr(expression) {
		// console.trace(expression);
		var TRUE = 1, FALSE = 0;
		function to_Number(number) {
			if (number === '.')
				return 0;
			number = number.toLowerCase();
			if (number === 'pi')
				return Math.PI;
			if (number === 'e')
				return Math.E;
			if (number === 'nan')
				return 'NAN';
			// '123.456.789e33' → '123.456e33'
			number = number.replace(/^([^.]*\.[^.]*)\.[\d.]*/, '$1');
			return +number;
		}

		function _handle_binary_operations(all, _1, op, _2) {
			op = op.toLowerCase();
			if (op === 'e') {
				var number = +all;
				// console.trace([ all, number, _1, op, _2 ]);
				if (!isNaN(number))
					return number;
				// e.g., '{{#expr:6e(5-2)e-2}}'
				number = _2.match(/^([\d+\-.]+)(e[\d+\-]+)$/);
				if (number)
					return _1 * Math.pow(10, number[1]) + number[2];
				return _1 * Math.pow(10, _2);
			}
			_1 = to_Number(_1);
			_2 = to_Number(_2);
			// console.trace([ _1, op, _2 ]);
			switch (op) {
			case '+':
				return _1 + _2;
			case '-':
				return _1 - _2;
			case '*':
				return _1 * _2;
			case '/':
			case 'div':
				return _1 / _2;
			case 'mod':
				// 將兩數截斷為整數後的除法餘數。
				return Math.floor(_1) % Math.floor(_2);
			case 'fmod':
				return (_1 % _2).to_fixed();
			case '^':
				var power = Math.pow(_1, _2);
				return isNaN(power) ? 'NAN' : power;

			case 'round':
				var power = Math.pow(10, Math.trunc(_2));
				var is_negative = _1 < 0;
				if (is_negative)
					_1 = -_1;
				// https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Math/round
				// giving a different result in the case of negative numbers
				// with a fractional part of exactly 0.5.
				_1 = Math.round((_1 * power).to_fixed()) / power;
				if (is_negative)
					_1 = -_1;
				return _1;

			case '>':
				return _1 > _2 ? TRUE : FALSE;
			case '<':
				return _1 < _2 ? TRUE : FALSE;
			case '>=':
				return _1 >= _2 ? TRUE : FALSE;
			case '<=':
				return _1 <= _2 ? TRUE : FALSE;
			case '=':
				return _1 === _2 ? TRUE : FALSE;
			case '<>':
			case '!=':
				return _1 !== _2 ? TRUE : FALSE;
			case 'and':
				return _1 && _2 ? TRUE : FALSE;
			case 'or':
				return _1 || _2 ? TRUE : FALSE;
			}

			throw new Error('二元運算符未定義，這不該發生，請聯絡函式庫作者: '
					+ [ all, _1, op, _2, expression ]);
		}

		function handle_binary_operations(all, _1, op, _2) {
			var result = _handle_binary_operations(all, _1, op, _2);
			// preserve plus sign
			// e.g., '{{#expr:2+3*4}}'
			return /^\s*\+/.test(_1)
					&& (typeof result === 'number' ? result >= 0 : !/^\s*\+/
							.test(result)) ? '+' + result : result;
		}

		function handle_unary_operations(all, op, number) {
			op = op.toLowerCase();
			number = to_Number(number);
			// console.trace([ op, number ]);
			if (/^[+\-]+$/.test(op)) {
				return (op.length - op.replace(/-/g, '').length) % 2 === 0
				// preserve plus sign
				// e.g., '{{#expr:(abs-2)+3}}'
				? '+' + number
				// e.g., "{{#expr:+-+-++-5}}"
				: -number;
			}

			switch (op) {
			case 'exp':
				return Math.exp(number);
			case 'ln':
				return Math.log(number);
			case 'abs':
				return Math.abs(number);
			case 'sqrt':
				return Math.sqrt(number);
			case 'trunc':
				return Math.trunc(number);
			case 'floor':
				return Math.floor(number);
			case 'ceil':
				return Math.ceil(number);
			case 'sin':
				return Math.sin(number);
			case 'cos':
				return Math.cos(number);
			case 'tan':
				return Math.tan(number);
			case 'asin':
				return Math.asin(number);
			case 'acos':
				return Math.acos(number);
			case 'atan':
				return Math.atan(number);
			case 'not':
				return number ? FALSE : TRUE;
			}

			throw new Error('一元運算符未定義，這不該發生，請聯絡函式庫作者: '
					+ [ all, op, number, expression ]);
		}

		while (true) {
			var new_expression = expression;
			new_expression = new_expression.replace(
					PATTERN_expr_bracketed_number, '$1');

			new_expression = new_expression.replace(PATTERN_expr_e_notation,
					handle_binary_operations);

			new_expression = new_expression.replace(PATTERN_expr_floor,
					handle_unary_operations);

			// @see https://en.wikipedia.org/wiki/Order_of_operations
			new_expression = new_expression.replace(PATTERN_expr_power,
					handle_binary_operations);

			new_expression = new_expression.replace(PATTERN_expr_乘除,
					handle_binary_operations);

			new_expression = new_expression.replace(PATTERN_expr_加減,
					handle_binary_operations);

			new_expression = new_expression.replace(PATTERN_expr_round,
					handle_binary_operations);

			new_expression = new_expression.replace(
					PATTERN_expr_binary_operations, handle_binary_operations);

			new_expression = new_expression.replace(PATTERN_expr_and,
					handle_binary_operations);

			new_expression = new_expression.replace(PATTERN_expr_or,
					handle_binary_operations);

			new_expression = new_expression.replace(
					PATTERN_expr_unary_operations, handle_unary_operations);

			if (new_expression === expression)
				break;

			// console.trace([ expression, new_expression ]);
			expression = new_expression;
		}

		expression = expression.trim();
		// console.trace([ expression, !isNaN(expression) ]);
		if (!isNaN(expression))
			return expression ? String(+expression) : '';

		// e.g., for {{#expr:pi}}
		var number = to_Number(expression);
		return isNaN(number) ? expression : String(number);
	}

	// --------------------------------------------------------------------------------------------

	var KEY_on_page_title_option = 'on_page_title';

	// https://en.wikipedia.org/wiki/Help:Conditional_expressions
	function evaluate_parser_function_token(options) {
		var token = this, allow_promise = options && options.allow_promise;

		function NYI() {
			// delete token.expand;
			token.not_evaluated = true;
			if (!options) {
				return token;
			}

			// 標記並直接回傳，避免 evaluate_parsed() 重複呼叫。
			if (options.set_not_evaluated && !options.something_not_evaluated) {
				options.something_not_evaluated = true;
			}

			if (options.show_NYI_message) {
				var message_name = token.name;
				if (message_name === '#invoke') {
					message_name += ':' + token.module_name + '|'
							+ token.function_name;
				}
				var transclusion_message = '';
				var transclusion_from_page = options.transclusion_from_page;
				if (wiki_API.is_page_data(transclusion_from_page)) {
					transclusion_message = '（自 '
							+ wiki_API.title_link_of(transclusion_from_page)
							+ ' 嵌入）';
					// 已顯示的訊息。
					var showed_evaluate_messages = transclusion_from_page.showed_evaluate_messages;
					if (!showed_evaluate_messages) {
						showed_evaluate_messages = transclusion_from_page.showed_evaluate_messages = Object
								.create(null);
					}
					// 避免重複顯示訊息。
					if (showed_evaluate_messages[message_name]) {
						message_name = null;
					} else {
						showed_evaluate_messages[message_name] = true;
					}
				}
				if (message_name) {
					library_namespace.warn('evaluate_parser_function_token: '
							+ '尚未加入演算 {{' + message_name + '}} 的功能'
							+ transclusion_message + ': ' + token);
				}
				// Error.stackTraceLimit = Infinity;
				// console.trace(options);
				// console.trace(token);
				// Error.stackTraceLimit = 10;
			}

			return token;
		}

		function get_parameter(NO) {
			// var is_parser_function = token.name.startsWith('#');
			var parameter =
			// is_parser_function ? token.parameters[NO] :
			// token.parameters[NO] === token[NO + 1]
			token[NO];
			// console.trace([ parameter, '' + token, token ]);

			// if (parameter === 0) return '0';
			return parameter || '';
		}

		function value_to_String(value, allow_thenable, as_key) {
			function return_parameter(value) {
				if (Array.isArray(value)) {
					for_each_token.call(value, 'comment', function() {
						return for_each_token.remove_token;
					});
					if (as_key) {
						var session = wiki_API.session_of_options(options);
						var extensiontag_hash = session
								&& session.configurations.extensiontag_hash
								|| wiki_API.wiki_extensiontags;
						for_each_token.call(value, function(token) {
							if ((token.type === 'tag'
							//
							|| token.type === 'tag_single')
							//
							&& (token.tag.toLowerCase() in extensiontag_hash)) {
								value.has_extensiontag = true;
								return for_each_token.exit;
							}
						});
						if (value.has_extensiontag)
							return value;
					}
				}
				value = String(value || '');
				// console.trace([ '' + token, token ]);
				// var is_parser_function = token.name.startsWith('#');
				// if (!is_parser_function)
				value = value.trim();
				return value;
			}

			// console.trace(value);
			var _value =
			// /[{}]/.test(value) &&
			expand_transclusion(value, options);
			if (!library_namespace.is_thenable(_value)) {
				value = return_parameter(_value);
			} else if (allow_thenable) {
				value = _value.then(return_parameter);
			} else {
				value = return_parameter(value);
			}
			return value;
		}

		function get_parameter_String(NO, allow_thenable, as_key) {
			return value_to_String(get_parameter(NO), allow_thenable, as_key);
		}

		function get_page_title(remove_namespace) {
			var title = options
			// [[mw:Help:Magic words#Page names]]
			&& wiki_API.normalize_title(get_parameter_String(1)
			//
			|| options[KEY_on_page_title_option], options) || '';
			return remove_namespace ? wiki_API.remove_namespace(title, options)
					: title;
		}

		function get_interface_message(message_id) {
			if (!message_id || !(message_id = String(message_id).trim()))
				return message_id;
			var session = wiki_API.session_of_options(options);
			if (!session.interface_messages)
				session.interface_messages = new Map;
			if (session.interface_messages.has(message_id))
				return session.interface_messages.get(message_id);

			return new Promise(function(resolve, reject) {
				session.page('MediaWiki:' + message_id, function(page_data,
						error) {
					if (false && error) {
						reject(error);
						return;
					}
					var content = library_namespace.HTML_to_Unicode(!error
							&& wiki_API.content_of(page_data)
							|| ('⧼' + page_data.title + '⧽'));
					library_namespace.info(
					//
					'get_interface_message: Cache interface message: ['
							+ message_id + '] = ' + JSON.stringify(content));
					session.interface_messages.set(message_id, content);
					resolve(content);
				});
			});
		}

		function reparse_token_name(name) {
			// 避免汙染。
			// console.trace(token.toString());
			token = wiki_API.parse(token.toString(), options);
			token[0] = name + ':';
			// console.trace(token.toString());
			token = wiki_API.parse(token.toString(), options);
			if (Array.isArray(token.name)) {
				token.name.evaluated = true;
			}
			// console.trace(token);
			return evaluate_parser_function_token.call(token, options);
		}

		function check_token_key(attribute_name, setter) {
			var token_key = token[attribute_name];
			if (!Array.isArray(token_key) || token_key.evaluated) {
				return;
			}

			function set_attribute(key) {
				if (Array.isArray(key)) {
					// 避免循環設定。
					key.evaluated = true;
				}
				token[attribute_name] = key;
			}

			var promise = wiki_API.parse.wiki_token_to_key(expand_transclusion(
					token_key, options));
			if (library_namespace.is_thenable(promise)) {
				if (setter)
					return promise.then(setter);
				return promise.then(set_attribute).then(
						evaluate_parser_function_token.bind(token, options));
			}
			// console.trace(promise);
			if (setter) {
				return setter(promise);
			}
			set_attribute(promise);
		}

		function fullurl(is_localurl) {
			var session = wiki_API.session_of_options(options);
			var query = get_parameter_String(2);
			var url = encodeURI(get_parameter_String(1));
			url = query ? (session ? session.latest_site_configurations.general.script
					: '/w/index.php')
					+ '?title=' + url + '&' + query
					: (session ? session.latest_site_configurations.general.articlepath
							: '/wiki/$1').replace('$1', url);
			if (!is_localurl) {
				if (!session)
					return NYI();
				url = session.latest_site_configurations.general.server + url;
			}
			return url;
		}

		// TODO: https://www.mediawiki.org/wiki/Manual:PAGENAMEE_encoding
		function PAGENAMEE_encoding(page_title) {
			if (!token.name.endsWith('EE'))
				return page_title;
			return encodeURI(page_title.replace(/ /g, '_'));
		}

		// --------------------------------------------------------------------

		if (Array.isArray(token.name) && !token.name.evaluated) {
			return check_token_key('name', reparse_token_name);
		}

		// All (token.name)s MUST in default_magic_words_hash
		// @ CeL.application.net.wiki.parser.wikitext
		switch (token.name) {

		case '!':
			return '|';

		case '=':
			return '=';

			// ----------------------------------------------------------------

		case '#len':
			// {{#len:string}}

			// TODO: ags such as <nowiki> and other tag extensions will always
			// have a length of zero, since their content is hidden from the
			// parser.
			return get_parameter_String(1).length;

		case '#sub':
			// {{#sub:string|start|length}}
			return get_parameter_String(3) ? get_parameter_String(1).substring(
					get_parameter_String(2), get_parameter_String(3))
					: get_parameter_String(1).slice(get_parameter_String(2));

		case 'LC':
			return get_parameter_String(1).toLowerCase();

		case 'UC':
			return get_parameter_String(1).toUpperCase();

		case 'LCFIRST':
			return get_parameter_String(1).replace(/^./, function(fc) {
				return fc.toLowerCase();
			});

		case 'UCFIRST':
			return get_parameter_String(1).replace(/^./, function(fc) {
				return fc.toUpperCase();
			});

		case 'PADLEFT':
			return get_parameter_String(1).padStart(get_parameter_String(2),
					get_parameter_String(3) || '0');
		case 'PADRIGHT':
			return get_parameter_String(1).padEnd(get_parameter_String(2),
					get_parameter_String(3) || '0');

			// ----------------------------------------------------------------

		case 'FORMATNUM':
			var number = get_parameter_String(1);
			var type = get_parameter_String(2);
			// TODO: 此為有缺陷的極精簡版。
			if (type === 'R' || type === 'NOSEP')
				return number.replace(/,/g, '');
			number = number.match(/^([\s\S]+?)(\..+)?$/);
			return (+number[1]).toLocaleString('en') + (number[2] || '');

			// ----------------------------------------------------------------

			// [[mw:Help:Magic words#Date and time]]

		case 'CURRENTYEAR':
			return (new Date).getUTCFullYear();

		case 'CURRENTMONTH':
			return ((new Date).getUTCMonth() + 1).toString().padStart(2, 0);

		case 'CURRENTMONTH1':
			return (new Date).getUTCMonth() + 1;

		case 'CURRENTDAY':
			return (new Date).getUTCDate();

		case 'CURRENTDAY2':
			return (new Date).getUTCDate().toString().padStart(2, 0);

		case 'CURRENTDAY':
			return (new Date).getUTCDate();

		case 'CURRENTDOW':
			return (new Date).getUTCDay();

		case 'CURRENTHOUR':
			return (new Date).getUTCHours().toString().padStart(2, 0);

		case 'CURRENTTIME':
			return (new Date).getUTCHours().toString().padStart(2, 0) + ':'
					+ (new Date).getUTCMinutes().toString().padStart(2, 0);

		case 'CURRENTTIMESTAMP':
			return (new Date).toISOString().replace(/[\-:TZ]/g, '').replace(
					/\.\d+$/, '');

		case '#dateformat':
		case '#formatdate':
			var date = new Date(get_parameter_String(1));
			var type = get_parameter_String(2);
			// console.trace([ date, type ]);

			// TODO: 此為有缺陷的極精簡版。
			switch (type) {
			case 'ISO 8601':
				return date.format('%Y-%2m-%2d');

			case 'ymd':
				type = '%Y %B %d';
				break;

			case 'dmy':
				type = '%d %B %Y';
				break;

			case 'mdy':
				type = '%B %d, %Y';
				break;

			default:
				// TODO: 未指定日期格式時，會自動判別，並且輸出格式化過的完整日期。
				return get_parameter_String(1);
			}
			return date.format({
				format : type,
				locale : 'en'
			});

		case '#time':
			// https://www.mediawiki.org/wiki/Help:Extension:ParserFunctions##time
			// {{#time: format string | date/time object | language code | local
			// }}
			var argument_2 = get_parameter_String(2);
			if (!argument_2 || argument_2 === 'now') {
				argument_2 = new Date;
				return get_parameter_String(1).replace(/Y/g,
						argument_2.getUTCFullYear())
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
			return NYI();

			// ----------------------------------------------------------------

		case '#if':
			// console.trace([ '#if%', token, get_parameter_String(1)
			// ]);
			token = token.parameters[get_parameter_String(1) ? 2 : 3] || '';
			// console.trace(token);
			break;

		case '#ifeq':
			token = token.parameters[get_parameter_String(1) === get_parameter_String(2)
					|| +get_parameter_String(1) === +get_parameter_String(2) ? 3
					: 4]
					|| '';
			// console.trace(token);
			break;

		case '#ifexist':
			var page_title = get_parameter_String(1, true);
			if (!library_namespace.is_thenable(page_title)
					&& PATTERN_invalid_page_name_characters.test(page_title)
					&& !library_namespace.is_thenable(get_parameter_String(3,
							true))) {
				// e.g., `a|b {{#ifexist: a{{!}}b | exists | doesn't exist }}`
				// return get_parameter_String(3, true);
				return token.parameters[3] || '';
			}
			if (!allow_promise) {
				return NYI();
			}
			var session = wiki_API.session_of_options(options);
			if (!session) {
				return NYI();
			}
			return Promise.resolve(page_title).then(function(page_title) {
				if (PATTERN_invalid_page_name_characters.test(page_title)) {
					return token.parameters[3] || '';
				}
				return new Promise(function(resolve, reject) {
					// console.trace([ page_title, token.toString() ]);
					session.page(page_title, function(page_data, error) {
						if (error) {
							return token.parameters[3] || '';
							// console.trace(error);
							reject(error);
							return;
						}

						// console.trace(page_data);
						if (!page_data) {
							console.error(token.toString());
						}
						resolve(token.parameters[!page_data
						//
						|| ('missing' in page_data)
						//
						|| ('invalid' in page_data) ? 3 : 2] || '');
					}, /* ifexist_page_options */{
						prop : ''
					});
				});
			});

			// ----------------------------------------------------------------

		case '#switch':
			var key = get_parameter_String(1, true, true), default_value = '';
			if (library_namespace.is_thenable(key)) {
				return NYI();
			}
			for (var index = 2, found; index < token.length; index++) {
				// var parameter = get_parameter_String(index);
				var parameter = token[index];
				if ('value' in parameter) {
					// assert: 'key=value'
					if (typeof parameter.key !== 'number') {
						parameter.key = value_to_String(parameter.key, true,
								true);
					}
					parameter.value = value_to_String(parameter.value, true);
					if (library_namespace.is_thenable(parameter.key)
							|| library_namespace.is_thenable(parameter.value)) {
						return NYI();
					}
					if (found || key === parameter.key)
						return parameter.value;
					if (parameter.key === '#default')
						default_value = parameter.value;
				} else {
					// assert: 'value'
					default_value = index;
					parameter = get_parameter_String(index, true);
					if (library_namespace.is_thenable(parameter)) {
						return NYI();
					}
					if (key === parameter) {
						found = true;
					}
				}
			}
			return typeof default_value === 'number' ? get_parameter_String(
					default_value, true) : default_value;

			// ----------------------------------------------------------------

			// https://www.mediawiki.org/wiki/Help:Magic_words#URL_data

		case 'URLENCODE':
			// TODO: https://www.mediawiki.org/wiki/Manual:PAGENAMEE_encoding
			return encodeURI(get_parameter_String(1));

		case 'ANCHORENCODE':
			return encodeURI(wiki_API.wikitext_to_plain_text(
			// {{anchorencode:A[[B]]C/D}} === encodeURI('ABC/D')
			// {{anchorencode:A[B]C/D}} === encodeURI('A[B]C/D')
			get_parameter_String(1))
			// 多空格、斷行會被轉成單一 " "。
			.replace(/[\s\n]{2,}/g, ' '));

		case 'LOCALURL':
			return fullurl(true);

		case 'FULLURL':
			return fullurl();

			// TODO:
			// case 'CANONICALURL':
			// case 'FILEPATH':

			// ----------------------------------------------------------------

		case 'FULLPAGENAME':
		case 'FULLPAGENAMEE':
			return PAGENAMEE_encoding(get_page_title());

		case 'PAGENAME':
		case 'PAGENAMEE':
			return PAGENAMEE_encoding(get_page_title(true));

		case 'BASEPAGENAME':
		case 'BASEPAGENAMEE':
			return PAGENAMEE_encoding(get_page_title(true).replace(/\/[^\/]+$/,
					''));

		case 'ROOTPAGENAME':
		case 'ROOTPAGENAMEE':
			return PAGENAMEE_encoding(get_page_title(true).replace(/\/.*$/, ''));

		case 'SUBPAGENAME':
		case 'SUBPAGENAMEE':
			return PAGENAMEE_encoding(get_page_title(true)
					.match(/([^\/]*)\/?$/)[1]);

		case 'SUBJECTPAGENAME':
		case 'SUBJECTPAGENAMEE':
		case 'ARTICLEPAGENAME':
		case 'ARTICLEPAGENAMEE':
			return PAGENAMEE_encoding(wiki_API.talk_page_to_main(
					get_page_title(), options));

		case 'TALKPAGENAME':
		case 'TALKPAGENAMEE':
			return PAGENAMEE_encoding(wiki_API.to_talk_page(get_page_title(),
					options));

		case '#titleparts':
			var title = get_parameter_String(1).split('/');
			var start = +get_parameter_String(3);
			start = start ? start > 0 ? start - 1 : start : 0;
			var end = +get_parameter_String(2);
			end = end ? end > 0 ? start + end : end : 0;
			return (end ? title.slice(start, end) : title.slice(start))
					.join('/');

			// ----------------------------------------------------------------

		case 'NS':
			return wiki_API.namespace(get_parameter_String(1), Object.assign({
				get_name : true
			}, options))
			// e.g., '{{ns:talk2}}'
			|| '[[:Template:Ns:' + get_parameter_String(1) + ']]';

			// [[mw:Help:Magic words#Namespaces]]

		case 'NAMESPACENUMBER':
			return wiki_API.namespace(get_page_title(), options);

		case 'NAMESPACE':
		case 'NAMESPACEE':
			return PAGENAMEE_encoding(wiki_API.namespace(get_page_title(),
					Object.assign(Object.clone(options), {
						get_name : true
					})));

		case 'SUBJECTSPACE':
		case 'SUBJECTSPACEE':
		case 'ARTICLESPACE':
		case 'ARTICLESPACEE':
			return PAGENAMEE_encoding(wiki_API.namespace(wiki_API
					.talk_page_to_main(get_page_title(), options), Object
					.assign(Object.clone(options), {
						get_name : true
					})));

		case 'TALKSPACE':
		case 'TALKSPACEE':
			return PAGENAMEE_encoding(wiki_API.namespace(wiki_API.to_talk_page(
					get_page_title(), options), Object.assign(Object
					.clone(options), {
				get_name : true
			})));

			// ----------------------------------------------------------------

		case 'SUBST':
		case 'SAFESUBST':
			if (!allow_promise) {
				return NYI();
			}
			var session = wiki_API.session_of_options(options);
			if (!session) {
				return NYI();
			}
			var wikitext = token.toString().replace(/^({{)[^:]+:/, '$1');
			var parsed = wiki_API.parse(wikitext, options);
			// expand template
			return expand_transclusion(parsed, options);

			// ----------------------------------------------------------------

		case '#invoke':
			// console.trace(token);
			// normalize .module_name, .function_name
			/**
			 * e.g., <code>

			{{<!-- -->#<!-- -->in<!-- -->{{#if:1|voke}}<!-- -->:IP<!-- -->Address|is<!-- -->{{#if:1|Ip}}|8.8.8.8}}

			</code>
			 */
			var promise = check_token_key('module_name')
					|| check_token_key('function_name');
			if (promise)
				return promise;

			if (!token.expand && wiki_API.template_functions) {
				wiki_API.template_functions.adapt_function(token, null, null,
						options);
			}

			// console.trace(token);
			if (typeof token.expand === 'function') {
				var promise = token.expand(options);
				if (promise === undefined || promise === token) {
					return NYI();
				}
				if (library_namespace.is_thenable(promise)) {
					library_namespace
							.error('evaluate_parser_function_token: Using async function to evaluate: '
									+ token);
					token.not_evaluated = true;
					return token;
				}
				token = wiki_API.parse(promise, options);
				break;
			}
			return NYI();

			// ----------------------------------------------------------------

		case 'INT':
			var session = wiki_API.session_of_options(options);
			if (!session) {
				return NYI();
			}
			var page_title = get_parameter_String(1, true);
			page_title = library_namespace.is_thenable(page_title) ? page_title
					.then(get_interface_message)
					: get_interface_message(page_title);
			if (library_namespace.is_thenable(page_title) && !allow_promise) {
				return NYI();
			}
			return page_title;

			// ----------------------------------------------------------------

		case '#expr':
			var expression = get_parameter_String(1, true);
			if (library_namespace.is_thenable(expression)) {
				return NYI();
				return expression.then(eval_expr);
			}
			return eval_expr(expression);

			// case '#ifexpr':

			// ----------------------------------------------------------------

		default:
			return NYI();
		}

		// console.trace(token.toString());
		return expand_transclusion(token, options);
	}

	Object.assign(wiki_API, {
		repeatedly_expand_template_token : repeatedly_expand_template_token,

		expand_transclusion : expand_transclusion,

		evaluate_parser_function_token : evaluate_parser_function_token
	});

	// --------------------------------------------------------------------------------------------

	// 不設定(hook)本 module 之 namespace，僅執行 module code。
	return library_namespace.env.not_to_extend_keyword;
}
