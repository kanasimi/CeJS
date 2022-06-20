/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): wikitext parser 維基語法解析器
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * TODO:<code>

parser 所有子頁面加入白名單 white-list
parser for_each_token() 所有node當前之level層級
parser for_each_token() 提供 .previousSibling, .nextSibling, .parentNode 將文件結構串起來。

</code>
 * 
 * @since 2019/10/10 拆分自 CeL.application.net.wiki
 * @since 2021/12/14 18:53:43 拆分至 CeL.application.net.wiki.parser.wikitext,
 *        CeL.application.net.wiki.parser.section,
 *        CeL.application.net.wiki.parser.misc
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
	var wiki_API = library_namespace.application.net.wiki;

	var
	/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
	NOT_FOUND = ''.indexOf('_');

	// --------------------------------------------------------------------------------------------
	// page parser setup.

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
		if (typeof wikitext === 'string' || wikitext === 0) {
			wikitext = [ String(wikitext) ];
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
			if (!wiki_API.is_valid_parameters_value(wikitext)) {
				library_namespace.warn('page_parser: ' + 'Null wikitext: '
						+ wikitext);
				// console.trace(wikitext);
			}
			wikitext = [];
		} else if (Array.isArray(wikitext) && wikitext.type === 'plain') {
			// assert: already parsed
			if (wikitext.options)
				return wikitext;
		} else {
			// console.trace(wikitext);
			throw new Error('page_parser: ' + 'Invalid wikitext type: {'
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
		wiki_API.parse.set_wiki_type(wikitext, 'plain');
		var session = wiki_API.session_of_options(options);
		if (session) {
			wiki_API.add_session_to_options(session, wikitext);
		}
		// console.trace(wikitext);
		return wikitext;
	}

	// CeL.wiki.parser.parser_prototype, wiki_API.parser.parser_prototype
	/** {Object}prototype of {wiki page parser} */
	page_parser.parser_prototype = {
		// traversal_tokens()
		// CeL.wiki.parser.parser_prototype.each.call(token_list,...)
		// 在執行 .each() 之前，應該先執行 .parse()。
		each : for_each_token,
		parse : parse_page,
		parse_references : parse_references,

		get_categories : get_categories,
		append_category : register_and_append_category,

		analysis_layout_indices : analysis_layout_indices,
		insert_layout_token : insert_layout_token,

		insert_before : insert_before,
		// has_template
		find_template : find_template
	};

	/**
	 * {Object}alias name of type. The target MUST be one of
	 * wiki_API.parse.wiki_token_toString
	 */
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

	// ------------------------------------------

	// CeL.wiki.parser.remove_heading_spaces(parent, index, max_length)
	// remove heading spaces from parent_token[index]
	function remove_heading_spaces(parent_token, index, max_length,
			do_not_preserve_tail_spaces) {
		if (index >= parent_token.length)
			return;

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
		// 直接改成空字串而非 `parent_token.splice(index, 1)`，避免index跑掉。
		parent_token[index] = '';

		var next_index = remove_heading_spaces(parent_token, index + 1,
				max_length, do_not_preserve_tail_spaces);

		if (index > 0 && /\n$/.test(parent_token[index - 1])
				&& /^\n/.test(parent_token[next_index])) {
			// e.g., "\n{{t}}\n==t==\n" → "\n\n==t==\n"
			// → "\n==t==\n"
			parent_token[next_index] = parent_token[next_index].replace(/^\n/,
					'');

		} else if ((index === 0 || /\n$/.test(parent_token[index - 1]))
				&& /^\s/.test(parent_token[next_index])) {
			// e.g., "\n{{t}} [[L]]" → "[[L]]"
			if (index > 0) {
				parent_token[index - 1] = parent_token[index - 1].replace(
						/\n$/, '');
			}
			parent_token[next_index] = parent_token[next_index].replace(/^\s+/,
					'');
		}
		// free
		// next_index = undefined;

		var list_token = parent_token.parent;
		// assert: list_token.type === 'list'
		if (parent_token.type === 'list_item' && list_token
		// remove all empty / blank list_item
		&& parent_token.every(function(token) {
			// token maybe undefined
			if (!token)
				return token !== 0;
			if (typeof token === 'string')
				return /^[\s\n]*$/.test(token);
			if (token.type === 'transclusion') {
				// e.g., {{zh-tw}}
				return /^Zh(-[a-z]+)?$/.test(token.name);
			}
			return token.type === 'comment';
		})) {
			// TODO: fix removing "*{{T|1}}\n*{{T|2}}\n" in one operation,
			// see [[w:zh:Special:Diff/65133690/65133727|香港巴士迷文化]]
			parent_token.index = list_token.indexOf(parent_token);
			if (parent_token.index + 1 < list_token.length) {
				var next_list_item = list_token[parent_token.index + 1];
				// assert: next_list_item.type === 'list_item'
				var new_lines = parent_token.list_prefix.match(/^\n*/)[0];
				// shift new_lines
				next_list_item.list_prefix = next_list_item.list_prefix
						.replace(/^\n*/, new_lines);
			}
			list_token.splice(parent_token.index, 1);
		} else if (parent_token.type === 'list_item') {
			// console.trace(parent_token);
			// console.trace(list_token);
			// throw new Error();
			// e.g., "，見{{evchk}}。"
			library_namespace
					.debug(
							'清除 token (如模板)時，還遺留具意涵的元素，未能完全清除掉此 token 所在的列表項目。可能需要手動修飾語句。',
							1, 'remove_token_from_parent');

		}

		// console.log(parent_token.slice(index - 2, i + 2));
		return token;
	}

	page_parser.remove_token = remove_token_from_parent;

	// ------------------------------------------------------------------------

	(function() {
		wikitext = 'a\n[[File:f.jpg|thumb|d]]\nb';
		parsed = CeL.wiki.parser(wikitext).parse();

		parsed.each('namespaced_title', function(token, index, parent) {
			console.log([ index, token, parent ]);
		}, true);

		// @see 20210414.翻訳用出典テンプレートのsubst展開.js
		parsed.each('template:cite', function(token, index, parent) {
			if (CeL.wiki.parse.token_is_children_of(token, function(parent) {
				return parent.tag === 'ref' || parent.tag === 'gallery'
				// e.g., @ [[w:ja:Template:Round corners]]
				|| parent.tag === 'includeonly';
			})) {
				console.log([ index, token, parent ]);
			}
		}, {
			add_index : 'all'
		});

		parsed.toString();
	});

	// 注意: 必須配合 `parsed.each(, {add_index : 'all'})` 使用
	function token_is_children_of(token, parent_filter) {
		var parent;
		while (token && (parent = token.parent)) {
			if (parent_filter(parent))
				return true;
			token = parent;
		}
	}

	// CeL.wiki.parser.token_is_children_of()
	page_parser.token_is_children_of = token_is_children_of;

	/**
	 * 對所有指定類型 type，皆執行特定作業 processor。
	 * 
	 * TODO: 可中途跳出。
	 * 
	 * @param {String}[type]
	 *            欲搜尋之類型。 e.g., 'template'. see
	 *            ((wiki_API.parse.wiki_token_toString)).<br />
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
	 * @returns {Promise|Undefine}
	 * 
	 * @see page_parser.type_alias
	 */
	function for_each_token(type, processor, modify_by_return, max_depth) {
		if (!this) {
			return;
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
		if (!session
				&& (session = wiki_API.session_of_options(this)
						|| wiki_API.session_of_options(this.options))) {
			// for wiki_API.template_functions.adapt_function()
			wiki_API.add_session_to_options(session, options);
		}

		var token_name;
		if (type || type === '') {
			if (typeof type !== 'string') {
				library_namespace.warn('for_each_token: Invalid type [' + type
						+ ']');
				return;
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
			if (!(type in wiki_API.parse.wiki_token_toString)) {
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

		if (!Array.isArray(this)) {
			return;
		}

		// ----------------------------------------------------------

		var ref_list_to_remove = [], promise;
		function set_promise(operator) {
			promise = promise.then(operator);
			// promise.operator = operator;
		}
		function check_if_result_is_thenable(result) {
			if (library_namespace.is_thenable(result)) {
				promise = promise ? promise.then(function() {
					return result;
				}) : result;
				// promise._result = result;
				return true;
			}
		}

		// 遍歷 tokens。
		function traversal_tokens(parent_token, depth, resolve) {
			// depth: depth of parent_token
			var index, length;
			if (slice && depth === 0) {
				// 若有 slice，則以更快的方法遍歷 tokens。
				// TODO: 可以設定多個範圍，而不是只有一個 range。
				index = slice[0] | 0;
				length = slice[1] >= 0 ? Math.min(slice[1] | 0,
						parent_token.length) : parent_token.length;
			} else {
				// console.log(parent_token);
				index = 0;
				length = parent_token.length;
				// parent_token.some(for_token);
			}

			function traversal_next_sibling() {
				if (promise) {
					// console.trace([ index + '/' + length, depth, exit ]);
				}
				if (exit || index === length) {
					// 已遍歷所有本階層節點，或已設定 exit 跳出。
					if (promise) {
						set_promise(resolve);
						// console.trace([ promise, resolve ]);
					}
					return;
				}

				var token = parent_token[index];
				if (false) {
					console.log('token depth ' + depth
							+ (max_depth ? '/' + max_depth : '')
							+ (exit ? ' (exit)' : '') + ':');
					console.trace([ type, token ]);
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
						token.parent = parent_token;
					}

					if (wiki_API.template_functions) {
						// console.trace(options);
						wiki_API.template_functions.adapt_function(token,
								index, parent_token, options);
					}

					// get result. 須注意: 此 token 可能為 Array, string, undefined！
					// for_each_token(token, token_index, parent_of_token,
					// depth)
					var result = processor(token, index, parent_token, depth);
					// console.log(modify_by_return);
					// console.trace(result);
					if (false && token.toString().includes('Internetquelle'))
						console.trace([ index + '/' + length + ' ' + token,
								result, promise ]);
					if (check_if_result_is_thenable(result) || promise) {
						set_promise(function _check_result(
								result_after_promise_resolved) {
							if (false && token.toString().includes(
									'Internetquelle'))
								console.trace([
								//
								index + '/' + length + ' ' + token,
								//
								parent_token.toString(),
								//
								result_after_promise_resolved,
								//
								promise, depth, exit ]);
							check_result(token, result_after_promise_resolved);
						});
					} else {
						// assert: !promise || (promise is resolved)
						// if (promise) console.trace(promise);
						check_result(token, result);
					}
					return;
				}

				if (options.add_index === 'all' && typeof token === 'object') {
					token.index = index;
					token.parent = parent_token;
				}

				if (promise) {
					// NG:
					// set_promise(traversal_children(null, token, null));
				}
				return traversal_children(token);
			}

			function check_result(token, result) {
				// assert: !promise || (promise is resolved)
				if (result === for_each_token.exit) {
					library_namespace.debug('Abort the operation', 3,
							'for_each_token');
					// exit: 直接跳出。
					exit = true;
					return traversal_children();
				}

				// `return parsed.each.remove_token;`
				if (result === for_each_token.remove_token) {
					if (parent_token.type === 'list') {
						// for <ol>, <ul>: 直接消掉整個 item token。
						// index--: 刪除完後，本 index 必須再遍歷一次。
						parent_token.splice(index--, 1);
						length--;

					} else {
						if (token.type === 'tag' && token.tag === 'ref'
								&& token.attributes && token.attributes.name) {
							// @see wikibot/20190913.move_link.js
							library_namespace.debug(
									'將刪除可能被引用的 <ref>，並嘗試自動刪除所有引用。您仍須自行刪除非{{r|name}}型態的模板參考引用: '
											+ token.toString(), 1,
									'for_each_token');
							ref_list_to_remove.push(token.attributes.name);
						}

						remove_token_from_parent(parent_token, index, length);
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
						result = wiki_API.parse(result, options, []);
					}
					if (typeof result === 'string'
					//
					|| Array.isArray(result)) {
						// 將指定類型節點替換作此回傳值。
						parent_token[index] = token = result;
					}
				}

				return traversal_children(token, result);
			}

			function traversal_children(token, result) {
				// assert: !promise || (promise is resolved)

				// depth-first search (DFS) 向下層巡覽，再進一步處理。
				// 這樣最符合token在文本中的出現順序。
				// Skip inner tokens, skip children.
				if (result !== for_each_token.skip_inner
				// is_atom: 不包含可 parse 之要素，不包含 text。
				&& Array.isArray(token) && !token.is_atom
				// 最起碼必須執行一次 `traversal_next_sibling()`。
				&& token.length > 0 && !exit
				// comment 可以放在任何地方，因此能滲透至任一層。
				// 但這可能性已經在 wiki_API.parse() 中偵測並去除。
				// && type !== 'comment'
				&& (!max_depth || depth + 1 < max_depth)) {
					traversal_tokens(token, depth + 1, _traversal_next_sibling);
				} else if (promise) {
					_traversal_next_sibling();
				}

				if (false && promise) {
					console.trace([ index + '/' + length, depth, promise,
							modify_by_return ]);
					promise.then(function(r) {
						console
								.trace([ r, index + '/' + length, depth,
										promise ]);
					});
				}
			}

			function _traversal_next_sibling() {
				index++;
				if (false)
					console.trace([ index + '/' + length, depth, promise,
							modify_by_return ]);

				if (true) {
					traversal_next_sibling();
				} else {
					// also work:
					set_promise(traversal_next_sibling);
				}
			}

			// 一旦 processor() 回傳 is_thenable，那麼就直接跳出迴圈，自此由 promise 接手。
			// 否則就可以持續迴圈，以降低呼叫層數。
			while (index < length && !exit) {
				// console.trace([index, length, depth]);
				// 最起碼必須執行一次 `traversal_next_sibling()`
				traversal_next_sibling();
				if (promise)
					break;
				index++;
			}
		}

		// ----------------------------------------------------------

		function check_ref_list_to_remove() {
			// if (promise) console.trace(promise);
			if (ref_list_to_remove.length === 0) {
				return;
			}

			var result;
			result = for_each_token.call(this, 'tag_single', function(token,
					index, parent) {
				if (token.tag === 'ref' && token.attributes
				// 嘗試自動刪除所有引用。
				&& ref_list_to_remove.includes(token.attributes.name)) {
					library_namespace.debug('Also remove: ' + token.toString(),
							3, 'for_each_token');
					return for_each_token.remove_token;
				}
			});
			check_if_result_is_thenable(result);

			result = for_each_token.call(this, 'transclusion',
			// also remove {{r|name}}
			function(token, index, parent) {
				if (for_each_token.ref_name_templates.includes(token.name)
				// 嘗試自動刪除所有引用。
				&& ref_list_to_remove.includes(token.parameters['1'])) {
					if (token.parameters['2']) {
						library_namespace
								.warn('for_each_token: Cannot remove: '
										+ token.toString());
					} else {
						library_namespace.debug('Also remove: '
								+ token.toString(), 3, 'for_each_token');
						return for_each_token.remove_token;
					}
				}
			});
			check_if_result_is_thenable(result);
		}

		var overall_resolve, overall_reject;
		function finish_up() {
			// console.trace([ 'finish_up()', promise ]);
			promise = promise.then(check_ref_list_to_remove).then(
					overall_resolve, overall_reject);
			if (false)
				promise.then(function() {
					console.trace([ '** finish_up()', promise ]);
				});
		}

		if (options.use_global_index) {
			if (!slice && this[wiki_API.KEY_page_data].parsed) {
				slice = [ this.range[0], this.range[1] ];
				if (slice[0] > 0) {
					// 加入 .section_title。
					slice[0]--;
				}
			} else {
				delete options.use_global_index;
			}
		}

		// console.trace([ this, type ]);
		// var parsed = this;
		traversal_tokens(
				options.use_global_index ? this[wiki_API.KEY_page_data].parsed
						: this, 0, finish_up);

		if (!promise) {
			return check_ref_list_to_remove();
		}
		// console.trace(promise);

		return new Promise(function(resolve, reject) {
			overall_resolve = resolve;
			overall_reject = reject;
		});
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
	 * 設定好，並執行解析頁面的作業。
	 * 
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {wiki page parser}
	 * 
	 * @see wiki_API.parse()
	 */
	function parse_page(options) {
		if (!this.parsed
		// re-parse
		|| options && (options.reparse || options.wikitext)) {
			// assert: this = [ {String} ]
			// @see function page_parser(wikitext, options)
			var parsed = options && options.wikitext || this[0];
			parsed = wiki_API.parse(parsed, Object.assign({
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

	// TODO: templates
	function find_template(template_name, options) {
		var template_token;

		// TODO: using session.remove_namespace()
		template_name = template_name.replace(/^Template:/i, '');

		this.each('Template:' + template_name, function(token) {
			template_token = token;
			return for_each_token.exit;
		}, options);

		return template_token;
	}

	// ------------------------------------------------------------------------

	// @inner
	function do_append_category(category_token) {
		// this: parser
		if (!/\n$/.test(this.at(-1))) {
			this.push('\n');
		}
		this.push(category_token, '\n');
	}

	// parsed.append_category()
	function register_and_append_category(category_token, options) {
		// console.trace(category_token.name);
		// console.trace(category_token);

		options = library_namespace.setup_options(options);

		if (typeof category_token === 'string') {
			category_token = category_token.trim();
			if (!category_token.startsWith('[[')) {
				// `Category:name` or `Category:name|sort_key`
				var matched = category_token.match(/^([^|]+)(\|.*)$/);
				var _options = library_namespace.new_options(options);
				_options.namespace = 'category';
				if (matched) {
					matched[1] = wiki_API.to_namespace(matched[1], _options);
					category_token = matched[1] + matched[2];
					// Release memory. 釋放被占用的記憶體。
					matched = null;
				} else {
					category_token = wiki_API.to_namespace(category_token,
							_options);
				}
				// console.trace(category_token);
				category_token = '[[' + category_token + ']]';
			}
			category_token = wiki_API.parse(category_token, options);
		}
		// console.assert(category_token.type === 'category');

		// const 例如可設定成繁簡轉換後的 key
		// @see 20211119.維基詞典展開語言標題模板.js
		var category_name = options.category_name
				|| typeof options.get_key === 'function'
				&& options.get_key(category_token, options)
				|| category_token.name;

		// this: parser
		if (!this.category_Map) {
			this.get_categories(options);
		}

		if (!this.category_Map.has(category_name)) {
			this.category_Map.set(category_name, category_token);
			if (!options.is_existed)
				do_append_category.call(this, category_token);
			return;
		}

		// console.trace(category_token);

		if (!category_token.sort_key) {
			// 保留 old_category_token，跳過沒有新資訊的。
			return;
		}

		// const
		var old_category_token = this.category_Map.get(category_name);
		// console.trace(old_category_token);
		if (old_category_token.sort_key) {
			library_namespace.warn('register_and_append_category: '
					+ library_namespace.wiki.title_link_of(this.page)
					+ ': Multiple sort key: ' + old_category_token + ', '
					+ category_token);
			if (options.do_not_overwrite_sort_key) {
				if (!options.is_existed) {
					// Will overwrite the sort key
					do_append_category.call(this, category_token);
				}
				return;
			}
			// default: Will overwrite the sort key.
		}

		if (false && !old_category_token.set_sort_key) {
			console.trace(old_category_token);
		}
		// reuse old category_token
		old_category_token.set_sort_key(category_token.sort_key);
		if (options.is_existed) {
			// 移除重複的/同時存在繁體簡體的 category_token。
			return this.each.remove_token;
		}
	}

	// parsed.get_categories()
	function get_categories(options) {
		if (!this.category_Map) {
			this.category_Map = new Map;

			options = library_namespace.new_options(options);
			options.is_existed = true;
			delete options.category_name;
			var parsed = this;

			// 先從頭登記一次現有的 Category。
			this.each('Category', function(category_token, index, parent) {
				// for remove
				// category_token.index = index;
				// category_token.parent = parent;
				return parsed.append_category(category_token, options);
			}, {
				modify : options.remove_existed_duplicated
			});
		}

		// 警告: 重複的 category 只會取得首個出現的。
		return Array.from(this.category_Map.values());
	}

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
	// {ℕ⁰:Natural+0}: nodes listed in order_list
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

	function insert_before(before_node, to_insert, options) {
		var order_needed = wiki_API.parse(before_node, options, []), order_list = this.order_list;
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

	// ------------------------------------------------------------------------

	var default_layout_order = [
	// header
	'page_begin', 'short_description', 'hatnote_templates',
			'deletion_templates', 'protection_templates', 'dispute_templates',
			'maintenance_templates', 'infobox_templates',
			//
			'lead_templates_end', 'content', 'content_end',
			//
			'footer', 'succession_templates', 'navigation_templates',
			'authority_control_templates', 'coord_templates',
			'featured_template', 'DEFAULTSORT', 'categories', 'stub_templates',
			//
			'page_end' ];

	// 整個頁面只能有單一個這種元素。
	var single_layout_types = [ 'short_description',
			'authority_control_templates', 'featured_template', 'DEFAULTSORT' ];

	// TODO: analysis wiki page layout 定位版面布局元素
	// search anchor tokens of elements @ [[WP:LAY]],
	// [[w:en:Wikipedia:Manual of Style/Layout#Order of article elements]],
	// [[w:en:Wikipedia:Manual of Style/Lead section]]
	// [[w:zh:Wikipedia:格式手冊/版面佈局#導言]]
	// [[w:en:Wikipedia:Talk page layout]]
	// location: 'hatnote', 'maintenance tag', 'navigation template'
	function analysis_layout_indices(options) {
		var parsed = this;
		if (parsed.layout_indices)
			return parsed.layout_indices;

		// The start index of layout elements
		var layout_indices = Object.create(null);

		var index = 0, BACKTRACKING_SPACES = Object.create(null);
		function set_index(layout_type, _index, force) {
			if (_index === BACKTRACKING_SPACES) {
				// 回溯上一個非空白的 token。
				_index = index;
				while (--_index >= 0 && typeof parsed[_index] === 'string'
				// 回溯上一個非空白的 token。
				&& !parsed[_index].trim())
					;
				if (false && /\n{2}$/.test(parsed[_index])) {
					// TODO: 避免多個換行。
					// 這問題似乎不會發生，因為換行都被移到新 token 了。
				}
				// 向後移一位，落點在第一個空白 token 上。
				_index++;
			}
			if (force || !(layout_indices[layout_type] >= 0)) {
				layout_indices[layout_type] = _index >= 0 ? _index : index;
				return true;
			}
			if (single_layout_types.includes(layout_type)) {
				library_namespace.error([ 'analysis_layout_indices: ', {
					// gettext_config:{"id":"there-are-more-than-one-$1-in-$2"}
					T : [ 'There are more than one %1 in %2',
					//
					layout_type, wiki_API.title_link_of(parsed.page) ]
				} ]);
			}
		}

		// as index = 0
		set_index('page_begin');

		// Only detects level 1 tokens
		for (; index < parsed.length; index++) {
			var token = parsed[index];
			if (!token)
				continue;
			if (typeof token === 'string') {
				if (!token.trim()) {
					continue;
				}
				// treat as 正文 Article content, Lead section
				// e.g., 首段即有內容。
				set_index('content');
				continue;
			}

			switch (token.type) {
			case 'transclusion':
				if (token.name === 'Short description') {
					set_index('short_description');
				} else if (/^(?:(?:About|For|Further|Main|Other|Redirect|See)(?:\w+|([\s\-]?\w+)+)?|Distinguish|Qnote)$/
				// [[Category:Hatnote templates]]
				.test(token.name)) {
					set_index('hatnote_templates');
				} else if (/^(?:Db-\w+)$|^(?:Proposed deletion|Article for deletion)/
						.test(token.name)) {
					set_index('deletion_templates');
					delete layout_indices.content;
				} else if (/^Pp/.test(token.name)) {
					set_index('protection_templates');
				} else if (/^Dispute/.test(token.name)) {
					set_index('dispute_templates');
				} else if (/^Infobox/.test(token.name)) {
					set_index('infobox_templates');
				} else if (/^Coord/.test(token.name)) {
					// Geographical coordinates
					set_index('coord_templates');
				} else if (/^(?:\w[ _])?Talk:/.test(token.name)) {
					// 嵌入包含了其他頁面。
					// e.g., [[w:en:Talk:Cuvier's dwarf caiman]]
					set_index('content');
					set_index('lead_section_end', BACKTRACKING_SPACES);
				} else if (set_index('maintenance_templates')) {
					// maintenance tag
				} else if (layout_indices.content_end >= 0) {
					set_index('footer');
					if (/^(?:Succession|S-)$/.test(token.name)) {
						set_index('succession_templates');
					} else if (token.name === 'Authority control') {
						set_index('authority_control_templates');
					} else if (set_index('navigation_templates')) {
						;
					} else if (/^(?:Featured list|Featured article|Good article)$/
							.test(token.name)) {
						set_index('featured_template');
					} else if (/^Stub/.test(token.name)
							|| layout_indices.categories >= 0
							|| layout_indices.DEFAULTSORT >= 0) {
						set_index('stub_templates');
					}
				}
				break;

			case 'section_title':
				// 第一個有標題的段落亦可算作 content。
				set_index('content');
				set_index('lead_section_end', BACKTRACKING_SPACES);
				break;

			case 'magic_word_function':
				if (token.name === 'DEFAULTSORT')
					set_index('DEFAULTSORT');
				set_index('footer', BACKTRACKING_SPACES);
				break;

			case 'category':
				// categories
				set_index('footer', BACKTRACKING_SPACES);
				set_index('categories');
				break;

			case 'comment':
				// Skip comments
				break;

			default:
				// e.g. '''title''' is ...
				set_index('content');
				layout_indices.content_end = index + 1;
				delete layout_indices.navigation_templates;
				delete layout_indices.footer;
			}
		}
		// 到這邊依然未設定 'content'，可能是像僅有 hatnote_templates 的 talk page。
		set_index('content');

		// 設置所有必要的 footer index 為頁面結尾。
		// assert: index === parsed.length
		set_index('content_end');
		set_index('footer');
		set_index('page_end');

		if (!('lead_section_end' in layout_indices)) {
			set_index('lead_section_end', BACKTRACKING_SPACES);
		}

		index = layout_indices['content'];
		// 添加在首段文字或首個 section_title 前，最後一個 hatnote template 後。
		set_index('lead_templates_end', BACKTRACKING_SPACES);

		// console.trace(layout_indices);
		return parsed.layout_indices = layout_indices;
	}

	if (false) {
		parsed = page_data.parse();
		parsed.insert_layout_token('{{maintenance_template}}',
				'maintenance_templates');
		parsed.insert_layout_token('[[Category:category name]]');
		parsed.insert_layout_token('{{DEFAULTSORT:sort key}}', 'DEFAULTSORT');
		// TODO:
		parsed.insert_layout_token('{{DEFAULTSORT:sort key}}');
		return parsed.toString();
	}

	// insert_navigate_template
	function insert_layout_token(token, options) {
		/** {String}layout_type */
		var location;
		if (typeof options === 'string') {
			location = options;
			options = Object.create(null);
			// options.location = location;
		} else {
			options = library_namespace.setup_options(options);
			location = options.location;
		}

		if (!location) {
			if (typeof token === 'string')
				token = wiki_API.parse(token, options);
			if (token.type === 'category') {
				location = 'categories';
			}
		}

		var parsed = this;
		var layout_indices = parsed.analysis_layout_indices(options);

		var parsed_index = layout_indices[location],
		// Only set when no exactly index of location got.
		// 僅有當無法取得準確的 layout token 時，才會尋覽應插入之點，
		// 並設定插入於 default_layout_order[layout_index] 之前。
		layout_index;
		if (!(parsed_index >= 0)) {
			layout_index = default_layout_order.indexOf(location);
			if (layout_index >= 0) {
				// insert before next layout element 尋覽應插入之點
				while (++layout_index < default_layout_order.length) {
					parsed_index = layout_indices[default_layout_order[layout_index]];
					if (parsed_index >= 0)
						break;
				}
			}
			if (!(parsed_index >= 0)) {
				if (options.force_insert) {
					// Nothing matched: Insert as the latest element
					// 添加在頁面最後面。
					parsed_index = parsed.length;
				} else {
					throw new Error(
							'insert_layout_token: Cannot insert token as '
									+ location);
				}
			}
		}

		// ----------------------------

		// 當 location 不完全相符 (layout_index >= 0)
		var append_original_layout_token = layout_index >= 0
		// 或可有多個 layout_token，則將 original_layout_token === parsed[parsed_index]
		// 添附於 token 後，並且不傳入原先的 original_layout_token。
		|| !single_layout_types.includes(location);

		if (typeof token === 'function') {
			token = token.call(this, !append_original_layout_token
			// 傳入 original_layout_token，用於直接 replace。
			&& /* original_layout_token */parsed[parsed_index], parsed_index,
					parsed);
		}

		if (!wiki_API.is_valid_parameters_value(token)) {
			// e.g., token === undefined
			return;
			throw new Error('insert_layout_token: Invalid token ' + token);
		}

		// ----------------------------

		if (!/^\n/.test(token)) {
			// 檢查前一個有東西的 token 是否以 "\n" 作結。
			for (var index = parsed_index; index > 0;) {
				var previous_token = parsed[--index];
				if (previous_token) {
					if (!/\n$/.test(previous_token)) {
						// layout_token 應該都獨立成行，因此加個換行前綴。
						token = '\n' + token;
					}
					break;
				}
			}
		}

		if (append_original_layout_token
		// `parsed_index` maybe parsed.length
		&& parsed[parsed_index]) {
			// insert before the original token,
			// instead of replace the original token.
			if (!/\n$/.test(token) && !/^\n/.test(parsed[parsed_index]))
				token += '\n';
			token += parsed[parsed_index];
		} else if (!/\n$/.test(token) && !/^\n/.test(parsed[parsed_index + 1])) {
			token += '\n';
		}

		parsed[parsed_index] = token;

		// return changed
		return true;
	}

	// ------------------------------------------------------------------------

	/**
	 * 把表格型列表頁面轉為原生陣列。 wikitext table to array table, to table
	 * 
	 * CeL.wiki.parse.table()
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
					if (row.type === 'table_attributes')
						return;

					var cells = [];
					row.forEach(function(cell) {
						if (cell.type === 'table_attributes') {
							// 不計入 row style。
							return;
						}
						// return cell.toString().replace(/^[\n\|]+/, '');

						var append_cells;
						if (cell[0].type === 'table_attributes') {
							append_cells = cell[0].toString()
							// 檢測要橫向增加的 null cells。
							.match(/(?:^|\W)colspan=(?:"\s*)?(\d{1,2})/i);
							if (append_cells) {
								// -1: 不算入自身。
								append_cells = append_cells[1] - 1;
							}

							var matched = cell[0].toString()
							// 垂直向增加的 null cells。
							.match(/(?:^|\W)rowspan=(?:"\s*)?(\d{1,2})/i);

							if (matched && matched[1] > 1) {
								library_namespace.error(
								// TODO
								'We cannot deal with rowspan yet.');
							}

							// 去掉style
							// 注意: 本函式操作時不可更動到原資料。
							if (false) {
								var toString = cell.toString;
								cell = cell.clone();
								cell.shift();
								cell.toString = toString;
							}
							// remove table_attributes without lose information
							// @see toString of table_cell
							cell = cell.slice(1);
						}
						// .join(''): no delimiter
						cells.push(cell && cell.join('')
						//
						.replace(/^[\|\s]+/, '').trim() || '');
						if (append_cells > 0) {
							cells.append(new Array(append_cells).fill(''));
						}
					});
					if (cells.length > 0) {
						if (options && options.add_section_header) {
							// 將以本列 .header_count 判定本列是否算作標題列。
							if (row.header_count > 0) {
								// 對於 table header，不加入 section title 資訊。
								cells.unshift('', '');
							} else {
								cells.unshift(heads[2] || '', heads[3] || '');
							}
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

	// TODO: array_to_JSON()
	// https://commons.wikimedia.org/wiki/Data:Sandbox/Smalyshev/test.tab
	function array_to_table(array, options) {
		options = library_namespace.setup_options(options);
		if (!array.length && options.is_header === false)
			return '';

		var table = [ '{|' + ' class="'
		// { class: 'wikitable sortable' }
		+ (array['class'] || options['class'] || 'wikitable') + '"' ];
		if (array.style || options.style) {
			table[0] += ' style="' + (array.style || options.style) + '"';
		}
		if (options.caption) {
			table[0] += '\n|+ ' + options.caption;
		}

		array.forEach(function(row, index) {
			var separator = options.is_header === true
					|| options.is_header === undefined
					&& (index === 0 || row['class'] === 'sortbottom') ? '!'
					: '|';
			if (Array.isArray(row))
				row = row.join(' ' + separator + separator + ' ');

			var _style = row['class'] ? ' class="' + row['class'] + '"' : '';
			if (row.style) {
				_style += ' style="' + row.style + '"';
			}

			table.push(_style + '\n' + separator + ' ' + row);
		});

		return table.join('\n|-') + '\n|}';
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
		parsed.each('magic_word_function', function(function_token, index,
				parent) {
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
		KEY_page_data : typeof Symbol === 'function' ? Symbol('page data')
				: 'page data',

		switch_token : switch_token,

		// parse_table(), parse_wikitable()
		table_to_array : table_to_array,
		array_to_table : array_to_table,

		// parser : page_parser,

		setup_layout_elements : setup_layout_elements
	});

	return page_parser;
}
