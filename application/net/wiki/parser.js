/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): wikitext parser 維基語法解析器
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * TODO:<code>

parser 所有子頁面加入白名單 white-list
parser for_each_subelement() 所有node當前之level層級
parser for_each_subelement() 提供 .previousSibling, .nextSibling, .parentNode 將文件結構串起來。

</code>
 * 
 * @since 2019/10/10 拆分自 CeL.application.net.wiki
 * @since 2021/12/14 18:53:43 拆分至 CeL.application.net.wiki.parser.wikitext,
 *        CeL.application.net.wiki.parser.section,
 *        CeL.application.net.wiki.parser.misc
 * 
 * @see https://github.com/earwig/mwparserfromhell
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
		options = library_namespace.setup_options(options);
		// console.log(wikitext);
		// console.log(wiki_API.is_page_data(wikitext));
		if (typeof wikitext === 'string' || wikitext === 0) {
			wikitext = [ String(wikitext) ];
		} else if (wiki_API.is_page_data(wikitext)) {
			// 可以用 "CeL.wiki.parser(page_data).parse();" 來設置 parser。
			var page_data = wikitext;
			if (!page_data.parsed || options.wikitext
					|| typeof options.revision_index === 'number'
					// re-parse
					|| options.reparse) {
				wikitext = options
						&& options.wikitext
						|| wiki_API.content_of(page_data,
								options.revision_index || 0);
				// prevent wikitext === undefined (missing: '')
				wikitext = wikitext
				// usinf this[0] @ parse_page(options)
				? [ wikitext ] : [];
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
		// traversal_tokens(), parsed.each()
		// CeL.wiki.parser.parser_prototype.each.call(token_list,'Template:',(token,index,parent)=>{});
		// 在執行 .each() 之前，應該先執行 .parse()。
		each : for_each_subelement,
		parse : parse_page,
		parse_references : parse_references,

		get_categories : get_categories,
		append_category : register_and_append_category,

		analysis_layout_indices : analysis_layout_indices,
		insert_layout_element : insert_layout_element,

		insert_before : insert_before,
		// has_template
		find_template : find_template
	};

	/**
	 * {Object}alias name of type. The target MUST be one of
	 * wiki_API.parse.wiki_element_toString
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

		// 在全是 "" 的 element 中刪除 children，
		// 此時 index 可能等於 parent_token.length，combined_tail === undefined。
		if (combined_tail !== undefined) {
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
		}

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
			// e.g., "\n{{to del}}\n==t==\n" → "\n\n==t==\n"
			// → "\n==t==\n"
			parent_token[next_index] = parent_token[next_index].replace(/^\n/,
					'');

		} else if (index > 0 && index + 1 === parent_token.length
				&& typeof parent_token[index - 1] === 'string'
				&& /\n$/.test(parent_token[index - 1])) {
			// e.g., "{{t|TTT\n{{to del}}}}" → "{{t|TTT\n}}"
			// → "{{t|TTT}}"
			parent_token[index - 1] = parent_token[index - 1]
					.replace(/\n$/, '');

		} else if ((index === 0 || /\n$/.test(parent_token[index - 1]))
				&& /^\s/.test(parent_token[next_index])) {
			// e.g., "\n{{to del}} [[L]]" → "[[L]]"
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
				// [[w:en:Help:Pipe trick#Where it doesn't work]]
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

	// 注意: 必須配合 `parsed.each(, {add_index : 'all'})` 使用。
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
	 * 對所有指定類型 type 的元素(tokens)，皆執行特定作業 processor。
	 * 
	 * TODO: 可中途跳出。
	 * 
	 * @param {String}[type]
	 *            欲搜尋之類型。 e.g., 'template'. see
	 *            ((wiki_API.parse.wiki_element_toString)).<br />
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
	function for_each_subelement(type, processor, modify_by_return, max_depth) {
		if (!Array.isArray(this)) {
			// console.trace(this);
			return this;
		}

		if (typeof type === 'function' && max_depth === undefined) {
			// for_each_subelement(processor, modify_by_return, max_depth)
			// shift arguments.
			max_depth = modify_by_return;
			modify_by_return = processor;
			processor = type;
			type = undefined;
		}

		var options;
		// for_each_subelement(type, processor, options)
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
			// for_each_subelement(type, processor, max_depth)
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
				library_namespace.warn('for_each_subelement: Invalid type ['
						+ type + ']');
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
			if (!(type in wiki_API.parse.wiki_element_toString)) {
				library_namespace.warn('for_each_subelement: Unknown type ['
						+ type + ']');
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
			library_namespace.warn('for_each_subelement: Invalid slice: '
					+ JSON.stringify(slice));
			slice = undefined;
		}

		if (!this.parsed && typeof this.parse === 'function') {
			// 因為本函數為 CeL.wiki.parser(content) 最常使用者，
			// 因此放在這少一道 .parse() 工序。
			this.parse();
		}

		// ----------------------------------------------------------

		var ref_list_to_remove = [], promise;
		function set_promise(operator) {
			promise = promise.then(operator);
			// promise.operator = operator;
		}
		function check_if_result_is_thenable(result) {
			if (library_namespace.is_thenable(result)) {
				// console.trace(result);
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
			var use_parent_token_length = length === parent_token.length;

			function traversal_next_sibling() {
				if (promise) {
					// console.trace([ index + '/' + length, depth, exit ]);
				}
				if (exit || !(index < length)) {
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
						&& (!token_name || (session ? token.type === 'transclusion'
								&& session.is_template(token_name, token)
								: token.name === token_name))) {
					// options.set_index
					if (options.add_index && token && typeof token === 'object') {
						// 假如需要自動設定 .parent, .index 則必須特別指定。
						// token.parent[token.index] === token
						// .index_of_parent
						token.index = index;
						token.parent = parent_token;
					}

					// 警告: 應該在 processor()) 中使用
					// token = repeatedly_expand_template_token(token, options);
					if (wiki_API.template_functions) {
						// console.trace(options);
						wiki_API.template_functions.adapt_function(token,
								index, parent_token, options);
					}

					// get result. 須注意: 此 token 可能為 Array, string, undefined！
					// for_each_subelement(token, token_index, parent_of_token,
					// depth)
					var result = processor(token, index, parent_token, depth);
					if (use_parent_token_length
							&& length !== parent_token.length) {
						library_namespace.debug('parent_token 長度改變: ' + length
								+ '→' + parent_token.length + '。', 1,
								'for_each_subelement');
						length = parent_token.length;
					}
					// console.log(modify_by_return);
					// console.trace(result);
					if (false && token.toString().includes('Internetquelle')) {
						console.trace([ index + '/' + length + ' ' + token,
								result, promise ]);
					}
					if (check_if_result_is_thenable(result) || promise) {
						set_promise(function _check_result(
								result_after_promise_resolved) {
							// console.trace(result_after_promise_resolved);
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
							check_result(
									token,
									library_namespace.is_thenable(result) ? result_after_promise_resolved
											: result);
						});
					} else {
						// console.trace(result);
						// assert: !promise || (promise is resolved)
						// if (promise) console.trace(promise);
						check_result(token, result);
					}
					return;
				}

				if (options.add_index === 'all' && token
						&& typeof token === 'object') {
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
				if (result === for_each_subelement.exit) {
					library_namespace.debug('Abort the operation', 3,
							'for_each_subelement');
					// exit: 直接跳出。
					exit = true;
					return traversal_children();
				}

				// `return parsed.each.remove_token;`
				if (result === for_each_subelement.remove_token) {
					// 重新確認 index，預防中途做過了插入或者刪除操作。
					var _index;
					if (parent_token[index] !== token) {
						_index = scan_token_index(token, index, parent_token);
						if (_index !== NOT_FOUND)
							index = _index;
					}
					if (_index === NOT_FOUND) {
						library_namespace
								.warn('token 已不存在 parent_token 中，無法刪除！ '
										+ token);
					} else if (parent_token.type === 'list') {
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
									'for_each_subelement');
							ref_list_to_remove.push(token.attributes.name);
						}

						remove_token_from_parent(parent_token, index, length);
						token = '';
					}

				} else if (modify_by_return) {
					// console.trace([ index, result, parent_token ]);

					// 換掉整個 parent[index] token 的情況。
					// `return undefined;` 不會替換，應該 return
					// .each.remove_token; 以清空。
					// 小技巧: 可以用 return [ inner ].is_atom = true 來避免進一步的
					// parse 或者處理。
					if (typeof result === 'string') {
						// {String}wikitext to ( {Object}element or '' )
						result = wiki_API.parse(result, options, []);
					}
					// console.trace([ result && result.toString(), index,
					// parent_token.toString() ]);
					if (typeof result === 'string'
					//
					|| typeof result === 'number'
					//
					|| Array.isArray(result)) {
						// 將指定類型節點替換作此回傳值。
						parent_token[index] = token = result;
						// console.trace([ result.toString(),
						// parent_token.toString() ]);
					} else if (result) {
						library_namespace.debug('Invalid result to replace: '
								+ result, 1, 'for_each_subelement');
					}
				}

				return traversal_children(token, result);
			}

			function traversal_children(token, result) {
				// assert: !promise || (promise is resolved)

				// depth-first search (DFS) 向下層巡覽，再進一步處理。
				// 這樣最符合token在文本中的出現順序。
				// Skip inner tokens, skip children.
				if (result !== for_each_subelement.skip_inner
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
				if (promise) {
					// Waiting for promise resolved.
					break;
				}
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
			result = for_each_subelement.call(this, 'tag_single', function(
					token, index, parent) {
				if (token.tag === 'ref' && token.attributes
				// 嘗試自動刪除所有引用。
				&& ref_list_to_remove.includes(token.attributes.name)) {
					library_namespace.debug('Also remove: ' + token.toString(),
							3, 'for_each_subelement');
					return for_each_subelement.remove_token;
				}
			});
			check_if_result_is_thenable(result);

			result = for_each_subelement.call(this, 'transclusion',
			// also remove {{r|name}}
			function(token, index, parent) {
				if (for_each_subelement.ref_name_templates.includes(token.name)
				// 嘗試自動刪除所有引用。
				&& ref_list_to_remove.includes(token.parameters['1'])) {
					if (token.parameters['2']) {
						library_namespace
								.warn('for_each_subelement: Cannot remove: '
										+ token.toString());
					} else {
						library_namespace.debug('Also remove: '
								+ token.toString(), 3, 'for_each_subelement');
						return for_each_subelement.remove_token;
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
			if (false) {
				promise.then(function() {
					console.trace([ '** finish_up()', promise ]);
				});
			}
		}

		if (options.use_global_index) {
			if (!slice && this[wiki_API.KEY_page_data]
					&& this[wiki_API.KEY_page_data].parsed) {
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
				options.use_global_index ? this[wiki_API.KEY_page_data]
						&& this[wiki_API.KEY_page_data].parsed : this, 0,
				finish_up);

		if (!promise) {
			return check_ref_list_to_remove();
		}
		// console.trace(promise);

		return new Promise(function(resolve, reject) {
			overall_resolve = resolve;
			overall_reject = reject;
		});
	}

	Object.assign(for_each_subelement, {
		// CeL.wiki.parser.parser_prototype.each.exit
		// for_each_subelement.exit: 直接跳出。
		exit : typeof Symbol === 'function'
		//
		? Symbol('EXIT_for_each_subelement')
				: [ 'for_each_subelement.exit: abort the operation' ],
		// CeL.wiki.parser.parser_prototype.each.skip_inner
		// for_each_subelement.skip_inner: Skip inner tokens, skip children.
		skip_inner : typeof Symbol === 'function' ? Symbol('SKIP_CHILDREN')
				: [ 'for_each_subelement.skip_inner: skip children' ],
		// CeL.wiki.parser.parser_prototype.each.remove_token
		// for_each_subelement.remove_token: remove current children token
		remove_token : typeof Symbol === 'function' ? Symbol('REMOVE_TOKEN')
				: [ 'for_each_subelement.skip_inner: remove current token' ],
		ref_name_templates : [ 'R' ]
	});

	// 在 parent_token 中搜索 token 的 index。
	// 注意: 必須配合 `parsed.each(, {add_index : 'all'})` 使用。
	function scan_token_index(token, index, parent_token) {
		if (!parent_token) {
			if (Array.isArray(index)) {
				parent_token = index;
				index = undefined;
			} else
				parent_token = token.parent;
			if (!parent_token) {
				library_namespace.error('scan_token_index: '
						+ 'No parent_token specified!');
				return NOT_FOUND;
			}
		}

		if (typeof index !== 'number')
			index = token.index;
		if (typeof index !== 'number' || !(index >= 0))
			index = 0;

		if (parent_token[index] !== token) {
			for (index = 0; index < parent_token.length; index++) {
				if (parent_token[index] === token) {
					break;
				}
			}
			if (index === parent_token.length)
				return NOT_FOUND;
		}

		token.index = index;
		token.parent = parent_token;
		return index;
	}

	if (false) {
		// re-generate token:
		// Set token.index, token.parent first, and then
		new_token = CeL.wiki.replace_element(token, token.toString(), options);
	}

	// 注意: 必須配合 `parsed.each(, {add_index : 'all'})` 使用。
	function replace_element(replace_from_token, replace_to, options) {
		var index = replace_from_token.index;
		var parent_token = replace_from_token.parent;

		index = scan_token_index(replace_from_token, index, parent_token);
		if (index === NOT_FOUND) {
			library_namespace.error('replace_element: ' + 'Skip replace: '
					+ replace_from_token + '→' + replace_to);
			return;
		}

		if (!Array.isArray(replace_to)) {
			replace_to = wiki_API.parse(replace_to, options);
			// Create properties of token.
			wiki_API.template_functions.adapt_function(replace_to, index,
					parent_token, options);
		}

		replace_to.index = index;
		replace_to.parent = parent_token;
		parent_token[index] = replace_to;
		return replace_to;
	}

	// 注意: 必須配合 `parsed.each(, {add_index : 'all'})` 使用。
	// 兩 token 都必須先有 .index, .parent!
	// token.parent[token.index] === token
	// @see options.add_index @ function for_each_subelement()
	// 注意: 這個交換純粹只操作於 page_data.parsed 上面，
	// 不會改變其他參照，例如 page_data.parsed.reference_list!
	// 通常一個頁面只能夠交換一次，交換兩次以上可能就會出現問題!
	function swap_elements(token_1, token_2) {
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

	function next_meaningful_element(parent_element, start_index, options) {
		var options;
		if (library_namespace.is_Object(start_index)) {
			options = start_index;
			start_index = options.start_index;
		} else {
			options = Object.create(null);
		}

		if (!(start_index >= 1)) {
			start_index = 0;
		}

		for (; start_index < parent_element.length; start_index++) {
			var this_element = parent_element[start_index];
			if (!this_element)
				continue;

			if (typeof this_element === 'string') {
				if (this_element.trim()) {
					return options.get_index ? start_index : this_element;
				}
				continue;
			}

			if (this_element.type === 'comment')
				continue;

			return options.get_index ? start_index : this_element;
		}

		// 向上追溯。
		if (options.trace_upwards && parent_element.parent
				&& parent_element.index >= 0) {
			return next_meaningful_element(parent_element.parent,
					parent_element.index + 1, options);
		}
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
		options = library_namespace.setup_options(options);

		if (!this.parsed || options.wikitext
				|| typeof options.revision_index === 'number'
				// re-parse, force: true
				|| options.reparse) {

			// cf. CeL.wiki.inplace_reparse_element(template_token)
			if (options.reparse
					&& (typeof this[0] !== 'string' || this.length > 1)) {
				this[0] = this.toString();
				this.truncate(1);
			}

			// assert: this = [ {String} ]
			// @see function page_parser(wikitext, options)
			var parsed = options.wikitext
			// 指定要採用的版本。
			|| typeof options.revision_index === 'number'
					&& wiki_API.content_of(this.page, options) || this[0];
			parsed = wiki_API.parse(parsed, Object.assign({
				target_array : this
			}, this.options, options));
			// library_namespace.log(parsed);
			// console.trace(parsed);
			if (parsed
			// for parsed === undefined (missing: '')
			&& (!Array.isArray(parsed) || parsed.type !== 'plain')) {
				// this.truncate();
				this[0] = parsed;
			}
			this.parsed = true;
		}
		return this;
	}

	// ------------------------------------------------------------------------

	// search_template
	// TODO: templates
	function find_template(template_name, options) {
		var template_token;

		// console.trace(this);
		var session = wiki_API.session_of_options(options)
				|| wiki_API.session_of_options(this);
		// console.trace(session);
		if (session) {
			template_name = session.remove_namespace(template_name);
		} else {
			template_name = template_name.replace(/^Template:/i, '');
		}
		template_name = 'Template:' + template_name;
		// console.trace(template_name);

		this.each(template_name, function(token, index, parent) {
			// console.trace(template_token);
			template_token = token;
			template_token.index = index;
			template_token.parent = parent;
			// Find the first matched.
			return for_each_subelement.exit;
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

	// ------------------------------------------------------------------------

	// {{*Navigation templates}} (footer navboxes)
	// {{Coord}} or {{Coord missing}}
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
	// @deprecates: use parsed.insert_layout_element() instead
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

	// @deprecates: use parsed.insert_layout_element() instead
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
	// TODO: Not yet tested
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

	};

	// ------------------------------------------------------------------------

	var default_layout_order = [
	// header
	'page_begin',

	'deletion_templates',

	'redirect', 'redirect_end',

	// lead_section_locations
	'article_lead_section', 'talk_page_lead', 'hatnote_templates',
	// [[Category:Wikipedia maintenance templates]]
	'maintenance_templates', 'wikiproject_banners', 'infobox_templates',

	'lead_templates_end', 'lead_section_end',

	'content', 'content_end',

	'appendices',
	//
	'end_matter', 'navigation_templates', 'DEFAULTSORT', 'categories',

	// 小作品模板 stub_templates, zhwiki:featured_template
	'page_footer',
	//
	'page_end' ];

	// 整個頁面只能有單一個這種 location。
	var single_layout_location_types = [ 'redirect', 'DEFAULTSORT' ];

	var KEY_map_template_to_location = typeof Symbol === 'function' ? Symbol('template_to_location')
			: '\0template_to_location';

	var lead_section_locations = [ 'article_lead_section', 'hatnote_templates',
			'talk_page_lead' ];

	// template_order_of_layout[site name][layout type] = [ template name ]
	// assert: default_layout_order.includes(layout type)
	setup_layout_elements.template_order_of_layout = {
		enwiki : {
			// Deletion / protection tags
			// @see [[Category:Deletion templates]]
			deletion_templates : [ 'Category:Deletion tags',
					'Category:Speedy deletion templates' ],

			// [[Wikipedia:Manual of Style/Lead section]]
			// [[Wikipedia:Manual of Style/Layout#Order of article elements]]
			article_lead_section : [ 'Soft redirect', 'Short description',
			//
			'DISPLAYTITLE', 'Lowercase title', 'Italic title',

			// Hatnotes / hatnote templates
			'Category:Hatnote templates',

			'Featured list', 'Featured article', 'Good article',

			// deletion templates [[Category:刪除模板]]
			'Proposed deletion', 'Category:Protection templates',
			// 'Category:Proposed deletion-related templates',
			'Article for deletion', 'Copy edit',

			// Maintenance / dispute tags
			'Category:Cleanup templates', 'Category:Dispute templates',

			// English variety and date format
			'Category:Use English templates',
			// @see [[Category:Time and date maintenance templates]]
			'Use mdy dates', 'Use dmy dates',

			// Infoboxes / infobox templates
			'Infobox',

			// e.g., {{Contains special characters}}
			'Category:Language maintenance templates',

			// zhwiki: foreign character warning box
			// 'Category:Foreign character warning boxes'

			// Images

			// Navigation header templates (sidebar templates)
			// / Navigational boxes (header navboxes)

			// introduction
			],

			// [[Wikipedia:Talk page layout#Lead (bannerspace)]]
			// @ [[w:en:Wikipedia:Talk page layout#Talk page layout]]
			// @see
			// "Other talk page template redirect fixes; Cleanup redirects"
			// @ https://en.wikipedia.org/wiki/User:Magioladitis/WikiProjects
			talk_page_lead : [
			// Active nominations, when applicable
			'GA nominee', 'Featured article candidates', 'Peer review',

			// Skip templates
			'Skip to talk', 'Skip to bottom', 'Skip to section',
			//
			'Skip to top and bottom',

			// On redirect talk pages
			'Talk page of redirect', 'Soft redirect',

			// should only be used where it is needed
			'Talk header',

			// High-importance attention templates
			'Notice', 'Contentious topics/talk notice', 'Gs/talk notice',
			//
			'BLP others',

			// TalkWarningTemplates @
			// https://sourceforge.net/p/autowikibrowser/code/HEAD/tree/AWB/WikiFunctions/TalkPageFixes.cs#l237
			// @see [[Category:Notice and warning templates]]
			"COI editnotice", "Warning", "Austrian economics sanctions",

			// Specific talk page guideline banners
			'Calm', 'Censor', 'Controversial', 'Not a forum', 'FAQ',
			//
			'Round in circles',

			// Language-related talk page guideline banners
			'Category:Varieties of English templates',

			// Any "article history"
			// @see [[Category:Talk message boxes]]
			'GA', 'FailedGA', 'Old XfD multi', 'Old prod', 'Old peer review',
			// TalkHistoryBTemplates @
			// https://sourceforge.net/p/autowikibrowser/code/HEAD/tree/AWB/WikiFunctions/TalkPageFixes.cs#l237
			"Afd-merged-from", "Old CfD", "Old RfD",

			// "article milestone"
			'Article history', 'DYK talk', 'On this day', 'ITN talk',
			// {{WPBS}}
			'WikiProject banner shell',
			// wikiproject_banners
			'Category:WikiProject banners with quality assessment',

			// banners indicating a known issue with the page
			'Image requested', 'Photo requested', 'Infobox requested',
			// if applicable
			'Connected contributor', 'Press',
			// when used as a banner
			'To do', 'Consensus',
			//
			'Reliable sources for medical articles',
			// Attribution history templates
			'Copied', 'Split article', 'Merged-from', 'Merged-to',
			// Page metadata
			'Annual readership', 'Section sizes',
			// Smaller right-aligned banners
			'Translated page',
			// dedicated archive templates
			'Archives' ],

			appendices : [ 'Reflist', 'Refbegin', 'Refend' ],

			// footer
			end_matter : [
			// succession templates
			'S-start', 'Succession box', 'S-end',
			// navigation templates
			'Navbox', 'Navboxes', 'Portal bar', 'Taxonbar',
			// authority control template
			'Authority control',
			// Geographical coordinates
			'Coord', 'Coord missing', 'DEFAULTSORT' ]

		// page_footer : [ 'Category:Stub message templates' ]
		},

		zhwiki : {
			// [[Wikipedia:格式手冊/版面佈局#導言]]
			// [[Wikipedia:格式手冊/序言章節]]
			article_lead_section : [ '討論頁重定向', 'Soft redirect',
			// deletion templates
			'Category:刪除模板',
			// [[Wikipedia:模板消息/消歧义模板]]
			// [[Category:消歧义与重定向模板]]
			'Category:顶注模板',

			'Featured list', 'Featured article', 'Good article',
			// [[Wikipedia:模板消息/维护|維護模板]]
			'Multiple issues', 'Category:清理模板', 'Category:引用與查證維護模板',
			//
			'Category:維基百科維護模板',

			// 字詞轉換模板
			'NoteTA', '全局僻字',
			// 導讀提示模板
			'Category:頁面訊息模板', 'Category:时间模板',
			// 資訊框模板
			'Infobox' ],

			appendices : [ 'Reflist', 'Refbegin', 'Refend' ],

			end_matter : [
			// succession templates
			'S-start', 'Start box', 'Succession box',
			//
			'S-end', 'End box', 'End',
			// navigation templates
			// TODO: other navigation templates
			'Navbox', 'Navboxes', 'Portal bar', 'Taxonbar',
			// authority control template
			'Authority control', 'Coord', 'Coord missing', 'DEFAULTSORT' ]

		// page_footer : [ 'Category:小作品訊息模板' ]
		}
	};

	// 暫時代用。
	setup_layout_elements.template_order_of_layout.zhwiki.talk_page_lead = setup_layout_elements.template_order_of_layout.enwiki.talk_page_lead;

	// TODO: analysis wiki page layout 定位版面布局元素
	// search anchor tokens of elements @ [[WP:LAY]],
	// TODO: 處理/警告只能包含一個的 tempalte 分組。
	function analysis_layout_indices(options) {
		var parsed = this;
		if (parsed.layout_indices)
			return parsed.layout_indices;

		// The start index of layout elements
		var layout_indices = Object.create(null);

		var index = 0, BACKTRACKING_SPACES = Object.create(null);
		// return 新設定
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
			// 未 force 強制則以第一個出現的為準。
			if (force || !(layout_indices[layout_type] >= 0)) {
				layout_indices[layout_type] = _index >= 0 ? _index : index;
				return true;
			}

			if (single_layout_location_types.includes(layout_type)
					&& index !== layout_indices[layout_type]
					&& index < parsed.length
			// && layout_type !== 'content'
			) {
				library_namespace.warn([ 'analysis_layout_indices: ', {
					T : [
					// gettext_config:{"id":"there-are-more-than-one-$1-in-$2"}
					'There are more than one %1 in %2', layout_type,
					//
					wiki_API.title_link_of(parsed.page || 'null page') ]
				} ]);
				if (library_namespace.is_debug()) {
					console.trace([
							layout_indices[layout_type],
							parsed[layout_indices[layout_type]]
									&& parsed[layout_indices[layout_type]]
											.toString(), index,
							parsed[index] && parsed[index].toString() ]);
				}
			}
		}

		var session = wiki_API.session_of_options(parsed || options);

		function check_template_order_of_layout(token) {
			var template_order_of_layout = setup_layout_elements.template_order_of_layout[wiki_API
					.site_name(session)];

			for ( var location in template_order_of_layout) {
				if ((session || wiki_API).is_template(
						template_order_of_layout[location], token)) {
					set_index(location);
					if (location === 'deletion_templates')
						delete layout_indices.content;
					return location;
				}
			}
		}

		// e.g., for talk page "\n\n==t==\n...",
		// 插入hatnote應為 "{{h}}\n\n==t==\n..."
		// 而非 "\n\n{{h}}\n==t==\n..."
		set_index('page_begin');

		// assert: index === 0
		if (parsed.length > 0) {
			if (typeof parsed[0] === 'string' && !parsed[0].trim())
				index++;
			if (parsed[index]
					&& wiki_API.parse.redirect(parsed[index].toString(),
							options)) {
				set_index('redirect');
				if (typeof parsed[++index] === 'string'
						&& !parsed[index].trim()
						&& parsed[index].includes('\n')) {
					++index;
				}
				set_index('redirect_end');
			} else {
				index = 0;
			}
		}

		function set_content_token_index() {
			set_index('content');
			// 本 token 屬於 content，因此 content_end 起碼為下一個開始。
			var content_end_index = index + 1;
			if (!(layout_indices.content_end >= content_end_index))
				layout_indices.content_end = content_end_index;
			delete layout_indices.navigation_templates;
			delete layout_indices.end_matter;
		}

		// Only detects level 1 tokens
		for (; index < parsed.length; index++) {
			var token = parsed[index];
			if (!token)
				continue;

			if (token.type in {
				// e.g., ----
				hr : true,
				// e.g., __TOC__
				'switch' : true,
				comment : true
			}) {
				// Skip comments, etc.
				continue;
			}

			if (typeof token === 'string') {
				if (!token.trim()) {
					continue;
				}

				// assert: `page_begin` has been set.
				// set_index('page_begin');

				// treat as 正文 Article content, Lead section
				// e.g., 首段即有內容。
				set_content_token_index();
				continue;
			}

			// assert: `page_begin` has been set.
			// set_index('page_begin');

			switch (token.type) {
			case 'transclusion':
				if (check_template_order_of_layout(token)) {
					// 屬於有登記的模板。

				} else if (!(layout_indices.lead_section_end >= 0)) {
					if (token.name.startsWith('Infobox ')) {
						set_index('infobox_templates');
					} else if (token.name.startsWith('WikiProject ')) {
						set_index('wikiproject_banners');
					} else if ((session || wiki_API)
					// [[w:zh:Template:DYKEntry/archive]]
					// 這種自包含章節標題的模板放在首段，插入時會出錯。
					.is_template('DYKEntry/archive', token)
					// 嵌入包含了其他頁面。
					// e.g., [[w:en:Talk:Cuvier's dwarf caiman]],
					// [[w:en:Talk:Siege of Viborg (1710)]]
					|| /^(?:\w[ _])?Talk:/.test(token.name)) {
						// 模板本身包含標題。
						// e.g., [[w:zh:Template:DYKEntry/archive]]
						set_index('lead_section_end', BACKTRACKING_SPACES);
						set_index('lead_templates_end', BACKTRACKING_SPACES);
						set_content_token_index();

					} else {
						// maintenance tag
						set_index('maintenance_templates');
					}

				} else {
					// console.trace(token);
					if (/(?:Stub|小作品)$/i.test(token.name)
					// ↑ e.g., {{Africa-stub}}
					|| layout_indices.categories >= 0
							|| layout_indices.DEFAULTSORT >= 0) {
						set_index('content_end', BACKTRACKING_SPACES);
						set_index('end_matter');
						set_index('page_footer');

					} else if (layout_indices.content_end >= 0) {
						set_index('navigation_templates');
					}
				}
				break;

			case 'section_title':
				// 機器人是看標題與起始 hatnote templates 來判斷。若這個模板之前還有其他章節標題的話，就不會出錯了。
				set_index('lead_section_end', BACKTRACKING_SPACES);
				set_index('lead_templates_end', BACKTRACKING_SPACES);
				// 第一個有標題的段落亦可算作 content。
				set_content_token_index();
				break;

			case 'category':
				// categories
				set_index('end_matter');
				set_index('categories');
				break;

			case 'magic_word_function':
				if (layout_indices.content >= 0 && token.name in {
					デフォルトソート : true,
					DEFAULTSORT : true
				}) {
					set_index('end_matter');
					set_index('DEFAULTSORT');
					break;
				}
				set_content_token_index();
				break;

			case 'tag_single':
			case 'tag':
				if (token.tag === 'references') {
					set_content_token_index();
					set_index('appendices');
				}
				set_content_token_index();
				break;

			case 'file':
				if (!(layout_indices.content >= 0)) {
					// Images
					// set_index('image');
				}
				break;

			default:
				// e.g. '''title''' is ...
				set_content_token_index();
				break;
			}
		}

		// console.trace(layout_indices);

		// set_index('page_begin');

		if (!(layout_indices.lead_section_end >= 0)) {
			set_index('lead_section_end', BACKTRACKING_SPACES);
		}

		// 到這邊依然未設定 'content'，可能是像僅有 hatnote_templates 的 talk page。
		set_index('content');

		// 設置所有必要的 end_matter index 為頁面結尾。
		// assert: index === parsed.length
		set_index('content_end');
		set_index('end_matter');
		// set_index('page_footer');
		set_index('page_end');

		index = layout_indices.content;
		// 添加在首段文字或首個 section_title 前，最後一個 hatnote template 後。
		set_index('lead_templates_end', BACKTRACKING_SPACES);

		index = layout_indices.redirect_end >= 0 ? layout_indices.redirect_end
				: layout_indices.page_begin;

		// assert: layout_indices.lead_section_end >=0
		// && layout_indices.content >=0
		var hatnote_templates_index = Math.min(layout_indices.lead_section_end,
				layout_indices.content);
		// 保證這些 lead section 的 elements 全都在 lead_section_end 前。
		lead_section_locations.forEach(function(layout) {
			if (!(layout_indices[layout] <= hatnote_templates_index))
				set_index(layout, index, true);
		});

		// console.trace(layout_indices);
		return parsed.layout_indices = layout_indices;
	}

	if (false) {
		parsed = page_data.parse();
		parsed.insert_layout_element('{{WPBS}}');
		parsed.insert_layout_element('[[Category:category name]]');
		parsed.insert_layout_element('{{DEFAULTSORT:sort key}}');
		return parsed.toString();
	}

	/** @inner */
	function get_template_order_of_layout(session, location) {
		// console.trace(wiki_API.site_name(session));
		var template_order_of_layout = setup_layout_elements.template_order_of_layout[wiki_API
				.site_name(session)];
		// assert: !(wiki_API.site_name(session) in
		// setup_layout_elements.template_order_of_layout)
		// || Array.isArray(template_order_of_layout)
		if (template_order_of_layout && location) {
			// template_order_of_layout_of_location
			return template_order_of_layout[location];
		}
		return template_order_of_layout;
	}

	function get_location_of_template_element(token, options) {
		if (typeof token === 'string')
			token = wiki_API.parse(token, options);

		if (!token || token.type !== 'transclusion')
			return;

		var session = wiki_API.session_of_options(options);
		if (false && !session) {
			library_namespace.warn('get_location_of_template_element: '
					+ 'No session specified!');
		}
		var template_order_of_layout = get_template_order_of_layout(session);
		// console.trace(template_order_of_layout);
		if (!template_order_of_layout)
			return;

		options = Object.assign({
			namespace : 'Template'
		}, options);

		var template_to_location_hash = template_order_of_layout[KEY_map_template_to_location];
		if (!template_to_location_hash) {
			template_to_location_hash = template_order_of_layout[KEY_map_template_to_location]
			// Or new Map
			= Object.create(null);
			for ( var location in template_order_of_layout) {
				if (location === KEY_map_template_to_location)
					continue;
				var template_Array = session ? session.redirect_target_of(
						template_order_of_layout[location], options) : wiki_API
						.to_namespace(template_order_of_layout[location],
								options);
				template_Array.forEach(function(template_name) {
					if (template_to_location_hash[template_name]) {
						template_to_location_hash[template_name] = [
								template_to_location_hash[template_name],
								location ];
					} else {
						template_to_location_hash[template_name] = location;
					}
				});
			}
			// console.trace(template_to_location_hash);
		}

		var template_name = session ? session
				.redirect_target_of(token, options) : wiki_API.to_namespace(
				token, options);
		if (false) {
			console.trace([ !!session, token, template_name,
					template_to_location_hash[template_name], options ]);
		}
		return template_to_location_hash[template_name];
	}

	/** @inner */
	function get_index_of_location(location, options) {
		;
	}

	/** @inner */
	function get_index_of_template(location, options) {
		;
	}

	// prepare for using parsed.insert_layout_element()
	function setup_layout_element_to_insert(token, callback, options) {
		var session = this;
		options = wiki_API.add_session_to_options(session, Object.assign({
			namespace : 'Template',
			no_message : true
		}, options));

		var location, template_name_list, category_name_list = [], template_name_Set;
		function do_register_redirects() {
			if (false) {
				console.trace(wiki_API.site_name(session), location,
						template_name_list);
			}
			session.register_redirects(template_name_list, function(
					root_page_data, error) {
				callback(location, error);
			}, options);
		}

		function get_next_categorymembers() {
			if (category_name_list.length === 0) {
				// free
				template_name_Set = null;
				do_register_redirects();
				return;
			}

			var category_name = category_name_list.shift();
			// assert: session.is_namespace(category_name, 'category')

			wiki_API.list(category_name,
			//
			function(list/* , target, options */) {
				var index = template_name_list.indexOf(category_name);
				// assert: index >= 0
				// console.trace([ category_name, index, list ]);

				// assert: Array.isArray(list)
				if (list.error) {
					library_namespace
							.error('setup_layout_element_to_insert: '
									+ 'Cannot get ' + category_name + ': '
									+ list.error);
					template_name_list.split(index, 1);
					get_next_categorymembers();
					return;
				}

				if (!template_name_Set)
					template_name_Set = new Set(template_name_list);

				var filtered_list = [], page_data;
				list.forEach(function(page_data) {
					if (!session.is_namespace(page_data, 'template'))
						return;
					var page_name = session.remove_namespace(page_data);
					if (!template_name_Set.has(page_name))
						filtered_list.push(page_name);
				});

				// Keep order.
				filtered_list.unshift(index, 1);
				Array.prototype.splice
				//
				.apply(template_name_list, filtered_list);
				get_next_categorymembers();

			}, Object.assign({
				type : 'categorymembers'
			}, options));
		}

		function check_template_list() {
			if (!location && token) {
				location = get_location_of_template_element(token, options);
			}
			if (!location) {
				if (!token || token.type !== 'transclusion') {
					if (callback)
						callback(location, 'No location');
					return;
				}

				library_namespace.debug('先解析 layout element 模板的重定向: ' + token,
						1, 'setup_layout_element_to_insert');
				session.register_redirects(token.name, function(root_page_data,
						error) {
					// console.trace(root_page_data);
					token = wiki_API.parse(token.toString(), options);
					token[0] = session.remove_namespace(root_page_data.title);
					token = wiki_API.parse(token.toString(), options);
					// console.trace(token);
					check_template_list();
				}, options);
				return;
			}

			var template_order_of_layout = setup_layout_elements.template_order_of_layout[wiki_API
					.site_name(session)];

			if (!template_order_of_layout) {
				if (callback)
					callback(location, 'No template_order_of_layout');
				return;
			}

			template_name_list = template_order_of_layout[location];
			if (!Array.isArray(template_name_list)) {
				if (callback) {
					callback(location
					// , 'Nothing to run session.register_redirects()'
					);
				}
				return;
			}

			template_name_list = template_order_of_layout[location]
			//
			= template_name_list.filter(function(page_name) {
				page_name = page_name.trim();
				if (!page_name)
					return;
				if (session.is_namespace(page_name, 'main')) {
					// normal
					return true;
				}
				if (session.is_namespace(page_name, 'template')) {
					template_name_list[index] = session
							.remove_namespace(page_name);
					return true;
				}
				if (session.is_namespace(page_name, 'category')) {
					category_name_list.push(page_name);
					return true;
				}
				library_namespace.warn('setup_layout_element_to_insert: '
						+ 'Invalid namespace in location [' + location + ']: '
						+ page_name);
			});

			get_next_categorymembers();
		}

		if (typeof token === 'string') {
			// treat token as location
			location = get_template_order_of_layout(session, token);
			if (!location) {
				token = wiki_API.parse(token, options);
			}
		}

		check_template_list();
	}

	/**
	 * <code>

	// 警告: 使用這個功能必須先:
	session.setup_layout_element_to_insert(layout_element, callback);
	session.setup_layout_element_to_insert(location, callback);
	// e.g.,
	session.setup_layout_element_to_insert('{{WPBS}}', callback);
	session.setup_layout_element_to_insert('deletion_templates', callback);


	// or:
	session.setup_layout_elements(callback, options);

	</code>
	 * 
	 * @see wikibot/routine/20200122.update_vital_articles.js
	 */
	// insert_navigate_template
	// TODO: resort token
	function insert_layout_element(token, options) {
		/**
		 * {String}layout_type. e.g., 'hatnote', 'maintenance tag', 'navigation
		 * template'
		 */
		var location;
		if (typeof options === 'string') {
			location = options;
			options = Object.create(null);
			// options.location = location;
		} else {
			options = library_namespace.new_options(options);
			location = options.location;
		}

		var parsed = this;
		var session = wiki_API.session_of_options(parsed || options);
		if (session)
			wiki_API.add_session_to_options(session, options);

		// Guess location
		if (!location) {
			if (typeof token === 'string')
				token = wiki_API.parse(token, options);
			location = get_location_of_template_element(token, options);
			// console.trace(token, location);
			if (location) {
				if (Array.isArray(location)) {
					// 由 parsed 具有哪種 type 之模板最多，來判別該用哪種 type 的 page layout。

					if (location.length > 1 && parsed.page && parsed.page.title) {
						// 由 page title 來判別該用哪種 type 的 page layout。
						location = location.filter(function(_location) {
							return !/talk/.test(_location)
									^ (session || wiki_API)
											.is_talk_page(parsed.page);
						});
					}
					location = location[0];
				}
				// assert: typeof location === 'string'
			} else if (token.type === 'category') {
				location = 'categories';
			} else if (token.type === 'magic_word_function'
					&& token.name === 'DEFAULTSORT') {
				location = 'DEFAULTSORT';
			}
		}

		var layout_indices = parsed.analysis_layout_indices(options);

		var parsed_index = layout_indices[location],
		// Only set when no exactly index of location got.
		// 僅有當無法取得準確的 layout token 時，才會尋覽應插入之點，
		// 並設定插入於 default_layout_order[layout_index] 之前。
		layout_index;
		// console.trace(location, layout_indices, parsed_index);

		if (!(parsed_index >= 0)) {
			// 未解析出此 location。
			layout_index = default_layout_order.indexOf(location);
			if (layout_index >= 0) {
				// insert before next layout element 向後尋覽應插入之點。
				while (++layout_index < default_layout_order.length) {
					parsed_index = layout_indices[default_layout_order[layout_index]];
					if (parsed_index >= 0)
						break;
				}
				if (!(parsed_index >= 0)) {
					// TODO: 向前尋覽應插入之點。
				}
				if (false) {
					console.trace([ layout_index,
							default_layout_order.indexOf('lead_section_end'),
							parsed_index, layout_indices.lead_section_end ]);
				}
				// assert: default_layout_order.indexOf('lead_section_end') >= 0
				if (layout_index < default_layout_order
						.indexOf('lead_section_end')
						&& parsed_index > layout_indices.lead_section_end) {
					// 預防如欲求 hatnote_templates 但 maintenance_templates
					// 出現在頁面中段的情況。
					parsed_index = layout_indices.lead_section_end;
				}
			} else {
				library_namespace.error('insert_layout_element: '
						+ wiki_API.site_name(session)
						+ ' 之 default_layout_order 未包含 ' + location + ' ('
						+ token + ')');
			}
			// console.trace(parsed_index);
			if (!(parsed_index >= 0)) {
				if (options.force_insert) {
					// Nothing matched: Insert as the latest element
					// 添加在頁面最後面。
					parsed_index = parsed.length;
				} else {
					throw new Error('insert_layout_element: '
							+ 'Cannot insert token as location: ' + location
							+ ' (' + token + ')');
				}
			}
		}

		var insert_after_templates = options.insert_after_templates;
		// Guess insert_after_templates
		if (!insert_after_templates && token.type === 'transclusion') {
			var template_order_of_layout_of_location = get_template_order_of_layout(
					session, location);
			if (template_order_of_layout_of_location) {
				for (var _index = 0;; _index++) {
					if ((session || wiki_API)
							.is_template(
									template_order_of_layout_of_location[_index],
									token)) {
						insert_after_templates = template_order_of_layout_of_location
								.slice(0, _index);
						break;
					}
					if (_index === template_order_of_layout_of_location.length) {
						insert_after_templates = null;
						break;
					}
				}
				// console.trace(insert_after_templates);
				// console.trace(template_order_of_layout_of_location);
			}
		}
		if (insert_after_templates) {
			// console.trace(!!session, location, parsed_index, parsed.length);
			// 讓 parsed_index 排在所有應該排在前面的模板之後。
			for (var _index = parsed_index; _index < parsed.length; _index++) {
				var template_to_test = parsed[_index];
				if (!template_to_test)
					continue;
				// 搜尋整個 lead section。這些 layout templates 通常是根節點且不會跨越章節。
				if (template_to_test.type === 'section_title') {
					// console.trace( template_to_test.toString() );
					break;
				}
				if (false && template_to_test.type === 'transclusion') {
					console.trace((session || wiki_API).is_template(
							insert_after_templates, template_to_test),
							template_to_test, options);
				}
				if (template_to_test.type === 'transclusion'
						&& (session || wiki_API).is_template(
								insert_after_templates, template_to_test,
								options)) {
					// console.trace([ template_to_test.toString() ]);
					parsed_index = _index + 1;
				}
				// console.trace(parsed_index);
			}
			if (false) {
				console.trace([ parsed_index,
						parsed.slice(parsed_index - 1, parsed_index + 1) ]);
			}
		}

		// ----------------------------

		// 當 location 不完全相符 (layout_index >= 0)
		var append_original_layout_token = layout_index >= 0
		// 或可有多個 layout_token，則將 original_layout_token === parsed[parsed_index]
		// 添附於 token 後，並且不傳入原先的 original_layout_token。
		|| !single_layout_location_types.includes(location);

		if (typeof token === 'function') {
			token = token.call(this, !append_original_layout_token
			// 傳入 original_layout_token，用於直接 replace。
			&& /* original_layout_token */parsed[parsed_index], parsed_index,
					parsed);
		}

		if (!wiki_API.is_valid_parameters_value(token)) {
			// e.g., token === undefined
			return;
			throw new Error('insert_layout_element: Invalid token ' + token);
		}

		// ----------------------------

		// 避免重複插入。
		// dafsult: 整個頁面只能有單一個這種元素。
		if (token.type === 'transclusion') {
			var layout_element_list = [];
			// 一個 layout template 只加一次。
			parsed.each(token.page_title, function(template_token) {
				// TODO: merge parameters
				layout_element_list.push(template_token);
			});
			if (false) {
				console.trace(session);
				console.trace(token, layout_element_list.length,
						layout_element_list, options.remove_duplicated);
			}

			if (layout_element_list.length > 1 && options.remove_duplicated) {
				var main_token = undefined;
				if (layout_element_list.some(function(template_token) {
					if (template_token.name === token.name) {
						main_token = template_token;
						return true;
					}
				}) || layout_element_list.some(function(template_token) {
					// 盡量不取 {{規范控製}} 這種。
					if (/^[\w\s]+$/.test(template_token.name)) {
						main_token = template_token;
						return true;
					}
				})) {
					var token_changed;
					var old_wikitext = main_token.toString();
					var conflict_parameters = wiki_API.parse
							.merge_template_parameters(main_token, token);

					if (!conflict_parameters
							&& old_wikitext !== main_token.toString()) {
						library_namespace.warn('insert_layout_element: '
								+ wiki_API.title_link_of(parsed.page
										|| 'null page') + ': 合併 ' + token
								+ ' 入 main element ' + main_token);
						token_changed = true;
					}

					parsed.each(token.page_title, function(template_token) {
						if (template_token === main_token) {
							return;
						}

						var conflict_parameters = wiki_API.parse
								.merge_template_parameters(main_token,
										template_token);
						// console.trace(conflict_parameters);
						if (!conflict_parameters) {
							library_namespace.warn('insert_layout_element: '
									+ wiki_API.title_link_of(parsed.page
											|| 'null page') + ': Remove '
									+ template_token);
							token_changed = true;
							return parsed.each.remove_token;
						}
					});

					if (options.main_template_processor) {
						options.main_template_processor(main_token);
					}

					return (token_changed || old_wikitext !== main_token
							.toString())
							&& main_token;
				}

				library_namespace.warn('insert_layout_element: '
						+ wiki_API.title_link_of(parsed.page || 'null page')
						+ ' 有多個 ' + token + '，無法判別該取捨哪一個: '
						+ layout_element_list);
			}

			if (layout_element_list.length > 0) {
				var main_token = layout_element_list[0];
				var old_wikitext = main_token.toString();
				var conflict_parameters = wiki_API.parse
						.merge_template_parameters(main_token, token);

				if (options.main_template_processor) {
					options.main_template_processor(main_token);
				}

				if (!conflict_parameters
						&& old_wikitext !== main_token.toString()) {
					library_namespace.warn('insert_layout_element: '
							+ wiki_API
									.title_link_of(parsed.page || 'null page')
							+ ': 合併 ' + token + ' 入 ' + main_token);
					return main_token;
				}

				library_namespace.warn('insert_layout_element: '
						+ wiki_API.title_link_of(parsed.page || 'null page')
						+ ' 已有 ' + main_token + '，不再插入 ' + token);
				return;
			}

		} else if (token.type === 'category') {
			var layout_element_list = [];
			// 一個 category 只加一次。
			parsed.each('Category', function(category_token) {
				if (token.name !== category_token.name) {
					return;
				}
				if (token.sort_key && !category_token.sort_key) {
					// merge sort_key: 除非本來就有設定 sort key，否則設定成新的 sort key。
					category_token[2] = token.sort_key;
					layout_element_list.changed = true;
				} else {
					// TODO: options.remove_duplicated
					layout_element_list.push(category_token);
				}
				return parsed.each.exit;
			});
			// console.trace(token, layout_element_list);
			if (layout_element_list.changed)
				return true;
			if (layout_element_list.length > 0) {
				library_namespace.warn('insert_layout_element: '
						+ wiki_API.title_link_of(parsed.page || 'null page')
						+ ' 已有 ' + layout_element_list[0] + '，不再插入 ' + token);
				return;
			}

		} else if (parsed.toString().includes(token)) {
			return;
		}

		// ----------------------------

		if (false && options.fine_tuning_layout) {
			// 插入前最後替換。
			token = options.fine_tuning_layout(token, parsed_index, parsed);
			if (!token) {
				library_namespace.warn('insert_layout_element: '
						+ 'options.fine_tuning_layout() returns null value ['
						+ token + ']');
				return;
			}
		}

		// 準備將 insert_token 插入到 parsed[parsed_index]。

		var insert_token;

		// 採用 .type === 'plain' 使之後再改變 token 亦可反映變化。
		if (token.type === 'transclusion'
				&& (session || wiki_API).is_namespace(parsed.page, 'template')) {
			// layout element 如刪除模板，通常不該被 include。
			insert_token = wiki_API.parse('<noinclude></noinclude>');
			// assert: insert_token[1][0] === ''
			insert_token[1][0] = token;
			insert_token = wiki_API.parse.set_wiki_type([ insert_token ],
					'plain');
		} else {
			insert_token = wiki_API.parse.set_wiki_type(token, 'plain');
		}

		if (!/^\n/.test(insert_token)) {
			// 檢查前一個有東西的 token 是否以 "\n" 作結。
			for (var index = parsed_index; index > 0;) {
				var previous_token = parsed[--index];
				if (previous_token) {
					if (!/\n$/.test(previous_token)) {
						// layout_token 應該都獨立成行，因此加個換行前綴。
						insert_token.unshift('\n');
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
			if (!/\n$/.test(insert_token) && !/^\n/.test(parsed[parsed_index]))
				insert_token.push('\n');
			insert_token.push(parsed[parsed_index]);
		} else if (!/\n$/.test(insert_token)
				&& !/^\n/.test(parsed[parsed_index + 1])) {
			insert_token.push('\n');
		}

		// insert_token.inserted = true;
		parsed[parsed_index] = insert_token;

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
		if (!page_data
				|| (page_data.type !== 'table' && !wiki_API
						.is_page_data(page_data))) {
			library_namespace.warn('table_to_array: Not page data!');
			if (!page_data)
				return [];
		}
		if (typeof options === 'string') {
			options = {
				file : options
			};
		} else {
			options = library_namespace.setup_options(options);
		}

		var heads = [], array = [],
		// row handler
		row_processor = options.row_processor, cell_processor = options.cell_processor;

		(page_data.type === 'table' ? [ page_data ] : page_parser(page_data)
				.parse())
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

						if (cell_processor) {
							cell = cell_processor(cell, options);
						} else if (cell
						// || cell === 0
						) {
							cell = cell
							// .join(''): no delimiter
							.join('').replace(/^[\|\s]+/, '').trim();
						}
						cells.push(cell || '');
						if (append_cells > 0) {
							cells.append(new Array(append_cells).fill(''));
						}
					});
					if (cells.length > 0) {
						if (options.add_section_header) {
							// 將以本列 .header_count 判定本列是否算作標題列。
							if (row.header_count > 0) {
								// 對於 table header，不加入 section title 資訊。
								cells.unshift('', '');
							} else {
								cells.unshift(heads[2] || '', heads[3] || '');
							}
						}
						if (row_processor) {
							cells = row_processor(cells, options);
						}
						array.push(cells);
					}
				});
			}
		});

		// output file. e.g., page_data.title + '.csv.txt'
		if (options.file) {
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
				for_each_subelement.call(token, 'parameter', render_parameter,
						true);
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

	// @instance 實例相關函數。
	Object.assign(wiki_API.prototype, {
		setup_layout_elements : setup_layout_elements,
		setup_layout_element_to_insert : setup_layout_element_to_insert
	});

	// CeL.wiki.*
	Object.assign(wiki_API, {
		KEY_page_data : typeof Symbol === 'function' ? Symbol('page data')
				: 'page data',

		scan_token_index : scan_token_index,
		replace_element : replace_element,
		swap_elements : swap_elements,

		next_meaningful_element : next_meaningful_element,

		// parse_table(), parse_wikitable()
		table_to_array : table_to_array,
		array_to_table : array_to_table,

		// parser : page_parser,

		get_location_of_template_element : get_location_of_template_element
	});

	return page_parser;
}
