/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): list
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * TODO:<code>


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
	name : 'application.net.wiki.list',

	require : 'application.net.wiki.'
	// load MediaWiki module basic functions
	+ '|application.net.wiki.namespace.'
	// for library_namespace.get_URL()
	+ '|application.net.Ajax.'
	//
	+ '|application.net.wiki.query.'
	// wiki_API.parse.redirect()
	// + '|application.net.wiki.parser.'
	,

	// 設定不匯出的子函式。
	no_extend : 'this,*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var wiki_API = library_namespace.application.net.wiki, KEY_SESSION = wiki_API.KEY_SESSION;
	// @inner
	var is_api_and_title = wiki_API.is_api_and_title, normalize_title_parameter = wiki_API.normalize_title_parameter, set_parameters = wiki_API.set_parameters;

	var gettext = library_namespace.cache_gettext(function(_) {
		gettext = _;
	});

	// ------------------------------------------------------------------------

	var KEY_generator_title = typeof Symbol === 'function' ? Symbol('generator title')
			: 'generator title';
	/**
	 * 生成用於 wiki query 的生成器參數 parameters。
	 * 
	 * <code>

	對 generator=prop模塊，須指定 "titles" / "pageids" parameter。
	https://en.wikipedia.org/wiki/Special:ApiSandbox#action=query&format=json&prop=categories&titles=ABC%7CABC's%7CABC's%20Coverage%20of%20the%20NBA%20on%20ESPN&generator=links&formatversion=2&cllimit=2&gpllimit=3

	對 generator=all*，"generator" parameter 基本上取代 "titles" / "pageids" parameter，並且優先度更高。
	https://en.wikipedia.org/wiki/Special:ApiSandbox#action=query&format=json&prop=links%7Ccategories&generator=allpages&formatversion=2&pllimit=2&cllimit=2&gapfrom=ABC&gaplimit=3
	https://en.wikipedia.org/wiki/Special:ApiSandbox#action=query&format=json&prop=links%7Ccategories&titles=ABC%7CABC's%7CABC's%20Coverage%20of%20the%20NBA%20on%20ESPN&formatversion=2&pllimit=2&cllimit=2

	對 generator=其他links模塊&prop=prop模塊，可能必須指定 generator titles / pageids。
	https://en.wikipedia.org/wiki/Special:ApiSandbox#action=query&format=json&prop=links%7Ccategories&generator=categorymembers&formatversion=2&pllimit=2&cllimit=2&gcmtitle=Category%3ACountries&gcmlimit=3

	</code>
	 * 
	 * @param {String}generator
	 *            生成器參數。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項。
	 * @return {Object}正規化後，用於 wiki query 的生成器參數。
	 * 
	 * @see https://www.mediawiki.org/wiki/API:Query#Example_6:_Generators
	 *      https://www.mediawiki.org/w/api.php?action=help&modules=query
	 */
	function generator_parameters(generator, options) {
		if (typeof options === 'string') {
			options = {
				title : options
			};
		}

		var parameters = {
			generator : generator,
			limit : 'max'
		};
		var prefix = get_list.type[generator];
		if (Array.isArray(prefix))
			prefix = prefix[0];

		var session = wiki_API.session_of_options(options);
		for ( var parameter in options) {
			var value = options[parameter];
			if (parameter === 'namespace')
				value = (session || wiki_API).namespace(value);
			if (parameter.startsWith('g' + prefix)) {
				parameters[parameter] = value;
				continue;
			}
			if (parameter.startsWith(prefix) && !(('g' + parameter) in options)) {
				parameters['g' + parameter] = value;
				continue;
			}
			parameter = 'g' + prefix + parameter;
			if (!(parameter in parameters))
				parameters[parameter] = value;
		}

		// Using (KEY_generator_title in parameters) to test if parameters is a
		// generator title.
		// Warning: The value may be undefined for generator=all*.
		parameters[KEY_generator_title] = parameters['g' + prefix + 'title'];

		return parameters;
	}

	wiki_API.generator_parameters = generator_parameters;
	wiki_API.KEY_generator_title = KEY_generator_title;

	// ------------------------------------------------------------------------

	/**
	 * 自 title 頁面取得後續檢索用索引值 (continuation data)。<br />
	 * e.g., 'continue'
	 * 
	 * @param {String|Array}title
	 *            the page title to search continue information
	 * @param {Function|Object}callback
	 *            回調函數 or options。 callback({Object} continue data);
	 * 
	 * @see https://www.mediawiki.org/wiki/API:Query#Continuing_queries
	 */
	function get_continue(title, callback) {
		var options;
		if (library_namespace.is_Object(callback)) {
			callback = (options = callback).callback;
		} else {
			// 前置處理。
			options = Object.create(null);
		}

		wiki_API.page(title, function(page_data) {
			var matched, done, content = wiki_API.content_of(page_data),
			// {RegExp}[options.pattern]:
			// content.match(pattern) === [ , '{type:"continue"}' ]
			pattern = options.pattern,
			// {Object} continue data
			data = Object.create(null);

			if (!pattern) {
				pattern = new RegExp(library_namespace.to_RegExp_pattern(
				//
				(options.continue_key || wiki_API.prototype.continue_key)
						.trim())
						+ ' *:? *({[^{}]{0,80}})', 'g');
			}
			library_namespace.debug('pattern: ' + pattern, 2, 'get_continue');

			while (matched = pattern.exec(content)) {
				library_namespace.debug('continue data: [' + matched[1] + ']',
						2, 'get_continue');
				if (!(done = /^{\s*}$/.test(matched[1])))
					data = Object.assign(data, JSON.parse(matched[1]));
			}

			// options.get_all: get all continue data.
			if (!options.get_all)
				if (done) {
					library_namespace.debug('最後一次之後續檢索用索引值為空，可能已完成？', 1,
							'get_continue');
					data = null;
				} else {
					// {String|Boolean}[options.type]: what type to search.
					matched = options.type;
					if (matched in get_list.type)
						matched = get_list.type[matched] + 'continue';

					content = data;
					data = Object.create(null);
					if (matched in content) {
						data[matched] = content[matched];
					}
				}

			// callback({Object} continue data);
			callback(data || Object.create(null));
		}, options);
	}

	// ------------------------------------------------------------------------

	if (false) {
		// 若是想一次取得所有 list，不應使用單次版:
		// 注意: arguments 與 get_list() 之 callback 連動。
		wiki.categorymembers('Category_name', function(pages, error) {
			console.log(pages.length);
		}, {
			limit : 'max'
		});

		// 而應使用循環取得資料版:
		// method 1: using wiki_API_list()
		CeL.wiki.list(title, function(list/* , target, options */) {
			// assert: Array.isArray(list)
			if (list.error) {
				;
			} else {
				CeL.log('Get ' + list.length + ' item(s).');
			}
		}, Object.assign({
			// [KEY_SESSION]
			session : wiki,
			type : list_type
		}, options));

		// method 2:
		CeL.wiki.cache({
			type : 'categorymembers',
			list : 'Category_name'
		}, function(list) {
			CeL.log('Get ' + list.length + ' item(s).');
		}, {
			// default options === this
			// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Bcategorymembers
			namespace : '0|1',
			// [KEY_SESSION]
			session : wiki,
			// title_prefix : 'Template:',
			// cache path prefix
			prefix : base_directory,
			// Do not write cache file to disk.
			cache : false
		});
	}

	function combine_by_page(pages, unique_attribute) {
		var hash = Object.create(null);
		pages.forEach(function(page_data) {
			var value = page_data[unique_attribute];
			if (page_data.title in hash) {
				hash[page_data.title][unique_attribute].push(value);
			} else {
				page_data[unique_attribute] = [ value ];
				hash[page_data.title] = page_data;
			}
		});
		return Object.values(hash);
	}

	// allow async functions
	// https://github.com/tc39/ecmascript-asyncawait/issues/78
	var get_list_async_code = '(async function() {'
			+ ' try { if (wiki_API_list.exit === await options.for_each_page(item)) options.abort_operation = true; }'
			+ ' catch(e) { library_namespace.error(e); }' + ' })();';

	/**
	 * get list. 檢索/提取列表<br />
	 * 注意: 可能會改變 options！
	 * 
	 * TODO: options.get_sub options.ns
	 * 
	 * TODO: using iterable protocol
	 * https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Iteration_protocols
	 * 
	 * @param {String}type
	 *            one of get_list.type
	 * @param {String}[title]
	 *            page title 頁面標題。
	 * @param {Function}callback
	 *            回調函數。 callback(pages, error)<br />
	 *            注意: arguments 與 get_list() 之 callback 連動。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項。 options.page_filter(): A function to
	 *            filter result pages. Return `true` if you want to keep the
	 *            element. filter result pages.
	 */
	function get_list(type, title, callback, options) {
		// console.trace(title);
		// console.trace(options.for_each_page);
		library_namespace.debug(type
				+ (title ? ' ' + wiki_API.title_link_of(title) : '')
				+ ', callback: ' + callback, 3, 'get_list');

		var parameter,
		// 預處理器
		title_preprocessor,
		/** {String} 前置字首。 */
		prefix = get_list.type[type];
		library_namespace.debug('parameters: ' + JSON.stringify(prefix), 3,
				'get_list');
		if (Array.isArray(prefix)) {
			// list_type : [ {String}prefix, {String}:query=prop|list,
			// {Function}title_preprocessor ]
			parameter = prefix[1] || get_list.default_parameter;
			title_preprocessor = prefix[2];
			prefix = prefix[0];
		} else {
			parameter = get_list.default_parameter;
		}

		var action = {
			action : 'query'
		};
		action[parameter] = type;
		if (wiki_API.need_get_API_parameters(action, options, get_list,
				arguments)) {
			return;
		}

		if (typeof options === 'string' || typeof options === 'number') {
			// 當作 namespace。
			options = {
				// {ℕ⁰:Natural+0|String|Object}namespace
				// one of wiki_API.namespace.hash.
				namespace : options
			};
		} else if (!library_namespace.is_Object(options)) {
			options = {
				// original option
				namespace : options
			};
		}
		if ('namespace' in options) {
			// console.trace('檢查 options.namespace: ' + options.namespace);
			options.namespace = wiki_API.namespace(options.namespace, options);
			// console.trace(options.namespace);
			if (options.namespace === undefined) {
				library_namespace
						.warn('get_list: options.namespace 非正規 namespace！將被忽略！');
				delete options.namespace;
			}
		}
		if (typeof options.for_each_slice === 'function'
				&& !options.for_each_page) {
			// 設定 options.for_each_page 以簡化檢測特定操作的流程。
			options.for_each_page = options.for_each_slice;
		}

		if (is_api_and_title(title, true)) {
			// 處理 [ {String}API_URL, {String}title or {Object}page_data ]
			action = title.clone();
		} else {
			// assert: {String}title
			action = [ , title ];
		}

		var continue_from = prefix + 'continue';
		var session = wiki_API.session_of_options(options);
		// 注意: 這裡會改變 options！
		if (!options.next_mark) {
			// 紀錄各種後續檢索用索引值。應以 append，而非整個換掉的方式更改。
			// 對舊版本須用到 for (in .next_mark)
			library_namespace.debug('未傳入後續檢索用索引值。', 4, 'get_list');
			// initialization
			options.next_mark = Object.create(null);
		} else if (false && Object.keys(options.next_mark).length > 0) {
			// assert: library_namespace.is_Object(options.next_mark)
			// e.g., called by function wiki_API_list()
			// console.trace([ type, title, options.next_mark ]);
			library_namespace
					.debug(
							'直接傳入了 options.next_mark；可延續使用上次的後續檢索用索引值，避免重複 loading page。',
							4, 'get_list');

			// Object.assign(options, options.next_mark);
			for ( var next_mark_key in options.next_mark) {
				if (next_mark_key !== 'continue') {
					options[next_mark_key]
					// {String}options.next_mark[next_mark_key]:
					// 後續檢索用索引值。後続の索引。
					= options.next_mark[next_mark_key];
					// 經由,經過,通過來源
					library_namespace.debug('continue from ['
							+ options[next_mark_key] + '] via options', 1,
							'get_list');
				}
				delete options.next_mark[next_mark_key];
			}
			// 刪掉標記，避免無窮迴圈。
			delete options.get_continue;
			console.trace(options);

			// usage:
			// options: { next_mark : {} , get_continue : log_to }
			if (false && (continue_from in options.next_mark)) {
				// {String}options.next_mark[continue_from]:
				// 後續檢索用索引值。後続の索引。
				options[continue_from] = options.next_mark[continue_from];
				// 經由,經過,通過來源
				library_namespace.debug('continue from ['
						+ options[continue_from] + '] via options', 1,
						'get_list');
				// 刪掉標記，避免無窮迴圈。
				delete options.get_continue;
			}
		}
		// 若未設定 .next_mark，才會自 options.get_continue 取得後續檢索用索引值。
		if (typeof options.get_continue === 'string') {
			// 設定好 options.get_continue，以進一步從 page 取得後續檢索用索引值。
			// 採用 session 之 domain。
			options.get_continue = [ session.API_URL, options.get_continue ];
		}

		// options.get_continue: 用以取用後續檢索用索引值之 title。
		// {String}title || {Array}[ API_URL, title ]
		if (options.get_continue) {
			// 在多人共同編輯的情況下，才需要每次重新 load page。
			get_continue(Array.isArray(options.get_continue)
			//
			? options.get_continue : [ action[0], options.get_continue ], {
				type : type,
				session : session,
				continue_key : session.continue_key,
				callback : function(continuation_data) {
					if (continuation_data = continuation_data[continue_from]) {
						library_namespace.info('get_list: continue from ['
								+ continuation_data + '] via page');
						// 注意: 這裡會改變 options！
						// 刪掉標記，避免無窮迴圈。
						delete options.get_continue;
						// 設定/紀錄後續檢索用索引值，避免無窮迴圈。
						options.next_mark
						//
						[continue_from] = continuation_data;
						// console.trace(options.next_mark);
						get_list(type, title, callback, options);

					} else {
						// delete options[continue_from];
						library_namespace.debug('Nothing to continue!', 1,
								'get_list');
						if (typeof callback === 'function') {
							callback(undefined, new Error(
									'Nothing to continue!'));
						}
					}
				}
			});
			return;
		}

		continue_from = options[continue_from];
		if (false) {
			library_namespace.debug(type
					+ (title ? ' ' + wiki_API.title_link_of(title) : '')
					+ ': start from ' + continue_from, 2, 'get_list');
		}

		// ------------------------------------------------

		// 處理輸入過長的列表。
		if (Array.isArray(action[1]) && (options.no_post_data
		//
		? encodeURIComponent(action[1].map(function(page_data) {
			return wiki_API.title_of(page_data);
		}).join('|')).length > get_list.slice_chars
		//
		: action[1].length >
		//
		wiki_API.max_slice_size(session, options/* , action[1] */))) {
			options.next_title_index = 0;
			// multiple pages
			options.multi = true;
			options.starting_time = Date.now();
			var get_next_batch = function(pages, error) {
				if (error) {
					callback(null, error);
					return;
				}

				if (!pages) {
					// The first time running
				} else if (options.overall_pages) {
					options.overall_pages.append(pages);
				} else {
					pages.titles = action[1];
					options.overall_pages = pages;
				}
				var latest_batch_title_index = options.next_title_index;
				if (!(latest_batch_title_index < action[1].length)) {
					pages = options.overall_pages;
					delete options.overall_pages;
					// delete options.multi;
					callback(pages);
					return;
				}

				if (options.no_post_data) {
					var slice_chars = 0;
					do {
						slice_chars += encodeURIComponent(wiki_API
								.title_of(action[1][options.next_title_index++])
								+ '|').length;
						if (slice_chars > get_list.slice_chars) {
							options.next_title_index--;
							if (latest_batch_title_index === options.next_title_index) {
								library_namespace.error('第一個元素的長度過長!');
								options.next_title_index++;
							}
							break;
						}
					} while (options.next_title_index < action[1].length);
				} else {
					options.next_title_index += wiki_API.max_slice_size(
							session, options);
					if (options.next_title_index > action[1].length)
						options.next_title_index = action[1].length;
				}

				library_namespace.log_temporary('get_list: '
						+ type
						+ ' '
						+ latest_batch_title_index
						+ '/'
						+ action[1].length
						+ wiki_API.estimated_message(latest_batch_title_index,
								action[1].length, options.starting_time));
				get_list(type, [
						action[0],
						action[1].slice(latest_batch_title_index,
								options.next_title_index) ], get_next_batch,
						options);
			};
			get_next_batch();
			return;
		}

		// ------------------------------------------------

		if (!library_namespace.is_Object(action[1])
				|| wiki_API.is_page_data(action[1])) {
			action[1] = action[1] ? '&'
			// allpages 不具有 title。
			+ (parameter === get_list.default_parameter ? prefix : '')
			// 不能設定 wiki_API.query.title_param(action, true)，有些用 title 而不用
			// titles。
			// e.g., 20150916.Multiple_issues.v2.js
			+ wiki_API.query.title_param(action[1]/* , true, options.is_id */)
					: '';

			if (typeof title_preprocessor === 'function') {
				// title_preprocessor(title_parameter)
				library_namespace.debug('title_parameter: [' + action[1] + ']',
						3, 'get_list');
				action[1] = title_preprocessor(action[1], options);
				library_namespace.debug('→ [' + action[1] + ']', 3, 'get_list');
			}
		} else if (!(KEY_generator_title in action[1])
				&& !type.startsWith('all')) {
			// Should be a generator title
			library_namespace
					.error('get_list: You should use generator_parameters() to create a generator title!');
			console.trace([ type, action ]);
		}
		action[1] = library_namespace.Search_parameters(action[1]);
		// console.trace(action);

		action[1].action = 'query';
		action[1][parameter] = type;
		// 處理數目限制 limit。
		// No more than 500 (5,000 for bots) allowed.
		if (options.limit >= 0 || options.limit === 'max') {
			// @type integer or 'max'
			// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Brevisions
			action[1][prefix + 'limit'] = options.limit;
		}

		// next start from here.
		if (false && continue_from) {
			// allpages 的 apcontinue 為 title，需要 encodeURIComponent()。
			action[1][prefix + 'continue']
			// 未處理 allpages 的 escape 可能造成 HTTP status 400。
			// = encodeURIComponent(continue_from);
			continue_from;
		}
		// console.trace(options.next_mark);
		for (continue_from in options.next_mark) {
			if (continue_from !== 'continue') {
				action[1][continue_from] = options.next_mark[continue_from];
			}
			delete options.next_mark[continue_from];
		}

		if ('namespace' in options) {
			action[1][prefix + 'namespace'] = options.namespace;
		}

		if (options.redirects) {
			// 舊版毋須 '&redirects=1'，'&redirects' 即可。
			action[1].redirects = 1;
		}
		if (options.converttitles) {
			action[1].converttitles = 1;
		}

		// console.trace(options);
		for ( var parameter in options) {
			if (parameter.startsWith(prefix)) {
				var value = options[parameter];
				if (library_namespace.is_Date(value)) {
					// https://www.mediawiki.org/w/api.php?action=help&modules=main#main/datatype/timestamp
					value = value.toISOString();
				}
				// value = encodeURIComponent(value);
				action[1][parameter] = value;
			}
		}
		// console.trace(action);

		set_parameters(action, options);
		// action = wiki_API.extract_parameters(options, action, true);
		// console.trace(action);

		// TODO: 直接以是不是 .startsWith(prefix) 來判定是不是該加入 parameters。

		if (!action[0])
			action = action[1];
		// console.log('get_list: title: ' + title);

		if (typeof callback !== 'function') {
			library_namespace.error('callback is NOT function! callback: ['
					+ callback + ']');
			library_namespace.debug('可能是想要當作 wiki instance，卻未設定好，直接呼叫了 '
			// TODO: use module_name
			+ library_namespace.Class + '.wiki？\ne.g., 想要 var wiki = '
					+ library_namespace.Class
					+ '.wiki(user, password) 卻呼叫了 var wiki = '
					+ library_namespace.Class + '.wiki？', 3);
			return;
		}

		// console.trace(action);
		var post_data;
		if (!options.no_post_data) {
			post_data = action[1];
			action[1] = undefined;
		}
		// console.trace([ action, post_data ]);
		wiki_API.query(action,
		// treat as {Function}callback or {Object}wiki_API.work config.
		function(data, error) {
			if (false) {
				console.trace(data
						&& (JSON.stringify(data).slice(0, 200) + '... ('
								+ JSON.stringify(data).length + ')'), data,
						error);
			}
			if (library_namespace.is_debug(2)
			// .show_value() @ interact.DOM, application.debug
			&& library_namespace.show_value) {
				library_namespace.show_value(data, 'get_list: ' + type);
			}

			if (error) {
				callback(undefined, error);
			}

			var
			// {Array}page_list
			pages = [],
			// 取得列表後，設定/紀錄新的後續檢索用索引值。
			// https://www.mediawiki.org/wiki/API:Query#Backwards_compatibility_of_continue
			// {Object}next_index: 後續檢索用索引值。
			next_index = data && (data['continue'] || data['query-continue']);
			if (library_namespace.is_Object(next_index)) {
				pages.next_index = next_index;

				if ('query-continue' in data) {
					// style of 2014 CE. 例如:
					// {backlinks:{blcontinue:'[0|12]'}}
					for ( var type_index in next_index) {
						Object
								.assign(options.next_mark,
										next_index[type_index]);
					}
				} else {
					// 2021 CE. e.g.,
					// {continue: { blcontinue: '0|123', continue: '-||' }}
					Object.assign(options.next_mark, next_index);
					// 因為新的 options.next_mark 無法傳遞到 caller，因此不可使用：
					// options.next_mark = next_index;
				}
				library_namespace.debug('next index of ' + type + ': '
						+ JSON.stringify(options.next_mark), 2, 'get_list');

				if (library_namespace.is_debug(2)
				// .show_value() @ interact.DOM, application.debug
				&& library_namespace.show_value) {
					library_namespace.show_value(next_index,
							'get_list: get the continue value');
				}
				if (options.limit === 'max' && type.includes('users')) {
					library_namespace.debug(
					//
					'Too many users so we do not get full list'
					//
					+ (options.augroup ? ' of [' + options.augroup + ']' : '')
							+ '!', 1, 'get_list');
					// 必須重複手動呼叫。
				}

			} else if (library_namespace.is_Object(data)
			// ↑ 在 503 的時候 data 可能是字串。
			&& ('batchcomplete' in data)) {
				// ↑ check "batchcomplete"
				var keyword_continue = get_list.type[type];
				if (keyword_continue) {
					if (Array.isArray(keyword_continue)) {
						keyword_continue = keyword_continue[0];
					}
					// e.g., "cmcontinue"
					keyword_continue += 'continue';
					if (keyword_continue in options.next_mark) {
						library_namespace.debug('去除已經不需要的檢索用索引值。', 3,
								'get_list');
						// needless.
						delete options.next_mark[keyword_continue];
					}
				}
			}

			// 紀錄清單類型。
			// assert: overwrite 之屬性不應該是原先已經存在之屬性。
			pages.list_type = type;
			if ('namespace' in options)
				pages.namespace = options.namespace;
			if (is_api_and_title(title, true)) {
				title = title[1];
			}
			if (wiki_API.is_page_data(title)) {
				title = title.title;
			}
			if (!Array.isArray(title)) {
				// 包含 {generator:'categorymembers',gcmtitle:'Category:name'}
				pages.title = title;
			}

			if (!data || !data.query) {
				if (data && ('batchcomplete' in data) && Array.isArray(title)
						&& title.length === 0) {
					library_namespace.debug('No page input for ' + type, 3,
							'get_list');
					callback(pages);
					return;
				}

				library_namespace.error('get_list: Unknown response: ['
						+ (typeof data === 'object'
								&& typeof JSON !== 'undefined' ? JSON
								.stringify(data) : data) + ']');
				callback(pages, data);
				return;
			}

			function run_for_each(error) {
				// console.trace(error);
				if (false) {
					console.trace([ options.abort_operation,
							options.for_each_page ]);
				}
				if (options.abort_operation
						|| typeof options.for_each_page !== 'function') {
					callback(pages, error);
					return;
				}

				// console.trace(pages);

				var promises = [];
				// run for each item
				function set_promises(item, operator) {
					if (typeof operator !== 'string'
							|| typeof options[operator] !== 'function') {
						operator = 'for_each_page';
					}
					// assert: typeof options[operator] === 'function'

					try {
						if (false && library_namespace
								.is_async_function(options.for_each_page)) {
							// eval(get_list_async_code);
							// console.log(options);
							return options.abort_operation;
						}

						var result = options[operator](item);
						// console.trace(result);
						if (result === wiki_API_list.exit) {
							options.abort_operation = true;
							return true;
						}
						if (library_namespace.is_thenable(result)) {
							promises.push(result);
						}

					} catch (e) {
						library_namespace.error(e);
						error = error || e;
						return true;
					}
				}

				// console.trace(options.for_each_slice);
				if (options.for_each_slice) {
					set_promises(pages, 'for_each_slice');
				}
				if (options.for_each_page !== options.for_each_slice
						&& !options.abort_operation) {
					pages.some(set_promises);
				}

				// console.trace(promises);

				// 注意: arguments 與 get_list() 之 callback 連動。
				// 2016/6/22 change API 應用程式介面變更 of callback():
				// (title, titles, pages) → (pages, titles, title)
				// 2019/8/7 change API 應用程式介面變更 of callback():
				// (pages, titles, title) → (pages, error)
				// 按照需求程度編配/編排 arguments。
				// 因為 callback 所欲知最重要的資訊是 pages，因此將 pages 置於第一 argument。
				if (promises.length === 0) {
					// console.trace(error);
					callback(pages, error);
					return;
				}

				// library_namespace.set_debug(3);
				var _promise = Promise.all(promises).then(function(results) {
					// console.trace(results);
					if (results.some(function(result) {
						return result === wiki_API_list.exit;
					})) {
						options.abort_operation = true;
					}
				}, function(e) {
					// `error` will record the first error.
					error = error || e;
				}).then(function() {
					// console.trace(promises);
					return Promise.allSettled(promises);
				}).then(function(results) {
					// console.trace(results);
					if (results.some(function(result) {
						return result.value === wiki_API_list.exit;
					})) {
						options.abort_operation = true;
					}

					// console.trace(promises);
					// console.trace(session.running);
					// console.trace(session);
					// console.trace(error);
					callback(pages, error);
				});
				session.next(_promise);

				// console.trace(session);
			}

			/**
			 * for redirects: e.g., <code>

			{"batchcomplete":"","query":{"redirects":[{"from":"Category:言語別分類","to":"Category:言語別"}],"pages":{"1664588":{"pageid":1664588,"ns":14,"title":"Category:言語別","redirects":[{"pageid":4005079,"ns":14,"title":"Category:言語別分類"}]}}},"limits":{"redirects":5000}}

			</code>
			 */
			if (type !== 'redirects' && data.query[type]) {
				data = data.query[type];
				// 一般情況。
				if (Array.isArray(data)) {
					// console.log(options);
					var page_filter = options.page_filter
					// 不採用 `options.filter`，預防誤用。
					// || options.filter
					;
					if (page_filter) {
						// console.trace(page_filter);
					}
					if (typeof page_filter === 'function') {
						// function page_filter(page_data){return passed;}
						data = data.filter(page_filter);
					}

					if (type === 'exturlusage' && options.combine_pages) {
						// 處理有同一個頁面多個網址的情況。
						data = combine_by_page(data, 'url');
					}

					pages = Object.assign(data, pages);
					// console.assert(Array.isArray(pages));
				} else if (data.results) {
					// e.g.,
					// https://en.wikipedia.org/w/api.php?action=query&list=querypage&qppage=MediaStatistics&qplimit=max&format=json&utf8
					if (typeof page_filter === 'function') {
						// function page_filter(page_data){return passed;}
						data.results = data.results.filter(page_filter);
					}
					pages = Object.assign(data.results, pages);
					pages.data = data;
					// console.assert(Array.isArray(pages));
				} else {
					// e.g., .userinfo('*')
					pages = Object.assign(data, pages);
					// console.assert(library_namespace.is_Object(pages));
				}

				if (get_list.post_processor[type]) {
					if (Array.isArray(pages))
						pages.forEach(get_list.post_processor[type]);
					else
						get_list.post_processor[type](pages);
				}

				if (Array.isArray(pages)) {
					library_namespace.debug(wiki_API.title_link_of(title)
							+ ': ' + pages.length + ' page(s)', 2, 'get_list');
				}

				run_for_each();
				return;
			}

			if (data.query.normalized)
				pages.normalized = data.query.normalized;
			// console.log(data.query);
			data = data.query.pages;
			// console.trace(data);
			// console.trace(options.page_filter);
			for ( var pageid in data) {
				var page = data[pageid];
				if (typeof options.page_filter === 'function'
						&& !options.page_filter(page)) {
					continue;
				}
				if (!(type in page)) {
					// error!
					continue;
				}

				var page_list = page[type];
				// usually Array.isArray(page_list);
				// library_namespace.is_Object(page_list) for categoryinfo
				if (Array.isArray(page_list)) {
					// page_list.title = page.title;
					Object.assign(page_list, page);
					delete page_list[type];
				} else {
					page_list = page;
				}

				pages.push(page_list);
				library_namespace.debug('[' + page.title + ']: '
						+ page_list.length + ' page(s)', 1, 'get_list');
			}
			// console.trace(pages);

			if (pages.length === 1 && !options.multi) {
				// Object.assign(pages[0], pages);
				Object.keys(pages).forEach(function(key) {
					if (key !== '0')
						pages[0][key] = pages[key];
				});
				pages = pages[0];
				run_for_each();
				return;
			}

			if (pages.length === 0) {
				library_namespace.debug('No [' + type + '] of '
						+ wiki_API.title_link_of(title), 1, 'get_list');
				// console.trace(data);
				callback(pages/* , new Error('No page got!') */);
				return;
			}

			// For multi-page-list
			library_namespace.debug(pages.length + ' ' + type + ' got!', 1,
					'get_list');
			// 紀錄 titles。 .original_title
			if (pages.title !== title)
				pages.titles = title;
			run_for_each();

		}, post_data, options);
	}

	get_list.slice_chars = 7800;

	get_list.post_processor = {
		usercontribs : function(item, index, pages) {
			var comment = item.comment;
			if (!comment)
				return;
			// https://translatewiki.net/wiki/MediaWiki:Logentry-move-move_redir/en
			// https://translatewiki.net/wiki/MediaWiki:Logentry-move-move/en
			// "User moved page [[From]] to [[To]] over redirect: summary"
			var matched = comment
					.match(/ moved page \[\[(.+?)\]\] to \[\[(.+?)\]\]( over redirect)?/);
			if (!matched)
				return;
			if (item.from || item.to) {
				library_namespace
						.warn('usercontribs: There is already item.from or item.to!');
				return;
			}
			item.from = matched[1];
			item.to = matched[2];
			if (matched[3])
				item.redirect = true;
		}
	};

	// const: 基本上與程式碼設計合一，僅表示名義，不可更改。
	get_list.default_parameter = 'list';

	// 把單數改成複數。
	function title_to_plural(title_parameter/* , options */) {
		// console.trace(title_parameter);
		return title_parameter.replace(/^&title=/, '&titles=')
		//
		.replace(/^&pageid=/, '&pageids=');
	}

	/**
	 * All MediaWiki list types supported by this library.
	 * 
	 * @type {Object}
	 * 
	 * @see https://www.mediawiki.org/wiki/API:Lists/All
	 *      https://www.mediawiki.org/w/api.php?action=help&modules=query
	 */
	get_list.type = {
		// list_type : [ {String}prefix, {String}:query=prop|list,
		// {Function}title_preprocessor ]

		// 'type name' : 'abbreviation 縮寫 / prefix' (parameter :
		// get_list.default_parameter)

		// 按標題排序列出指定的 namespace 的頁面 title。
		// 可用來遍歷所有頁面。
		// includes redirection 包含重定向頁面.
		// @see traversal_pages()
		// https://www.mediawiki.org/wiki/API:Allpages
		// 警告: 不在 Wikimedia Toolforge 上執行 allpages 速度太慢。但若在
		// Wikimedia Toolforge，當改用 database。
		allpages : 'ap',

		// https://commons.wikimedia.org/w/api.php?action=help&modules=query%2Ballimages
		// .allimages(['from','to'])
		// .allimages('from')
		// .allimages([,'to'])
		// .allimages(['2011-08-01T01:39:45Z','2011-08-01T01:45:45Z'])
		// .allimages('2011-08-01T01:39:45Z')
		// .allimages([,'2011-08-01T01:45:45Z'])
		allimages : [ 'ai', , function(title_parameter) {
			// console.trace([title_parameter]);
			// e.g., .allimages('2011-08-01T01:39:45Z'):
			// '&aititle=2011-08-01T01%3A39%3A45Z'
			// .allimages(['2011-08-01T01:39:45Z','2011-08-01T01:45:45Z']):
			// '&aititle=2011-08-01T01%3A39%3A45Z%7C2011-08-01T01%3A45%3A45Z'
			return title_parameter.replace(/^&aititle=([^&]+)/,
			//
			function(all, parameter) {
				parameter = decodeURIComponent(parameter);
				var matched = parameter.split('|');
				// console.trace(matched);
				if (matched.length !== 1 && matched.length !== 2) {
					return all;
				}
				if (matched[0] && !Date.parse(matched[0])
				//
				|| matched[1] && !Date.parse(matched[1])) {
					return (matched[0] ? '&aifrom='
					//
					+ encodeURIComponent(matched[0]) : '')
					//
					+ (matched[1] ? '&aito='
					//
					+ encodeURIComponent(matched[1]) : '');
				}
				return '&aisort=timestamp' + (matched[0] ? '&aistart='
				//
				+ new Date(matched[0]).toISOString() : '')
				//
				+ (matched[1] ? '&aiend='
				//
				+ new Date(matched[1]).toISOString() : '');
			});
		} ],

		// https://www.mediawiki.org/wiki/API:Alllinks
		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Balllinks
		alllinks : 'al',

		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Ballusers
		allusers : 'au',

		// TODO:
		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Ballcategories
		allcategories : 'ac',

		// TODO:
		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Ballredirects
		allredirects : 'ar',

		/**
		 * 為頁面標題執行前綴搜索。ページ名の先頭一致検索を行います。<br />
		 * <code>
		// 注意: arguments 與 get_list() 之 callback 連動。
		CeL.wiki.prefixsearch('User:Cewbot/log/20151002/', function(pages, error){ console.log(pages); }, {limit:'max'});
		wiki_instance.prefixsearch('User:Cewbot', function(pages, error){ console.log(pages); }, {limit:'max'});
		 * </code>
		 * 
		 * @see https://www.mediawiki.org/w/api.php?action=help&modules=query%2Bprefixsearch
		 */
		prefixsearch : [ 'ps', , function(title_parameter) {
			return title_parameter.replace(/^&pstitle=/, '&pssearch=');
		} ],

		// 取得連結到 [[title]] 的頁面。
		// リンク元
		// e.g., [[name]], [[:Template:name]].
		// https://www.mediawiki.org/wiki/API:Backlinks
		backlinks : 'bl',

		// Find all pages that embed (transclude) the given title.
		// 取得所有[[w:zh:Wikipedia:嵌入包含]] title 的頁面。 (transclusion, inclusion)
		// 参照読み込み
		// e.g., {{Template name}}, {{/title}}.
		// 設定 title 'Template:tl' 可取得使用指定 Template 的頁面。
		// https://en.wikipedia.org/wiki/Wikipedia:Transclusion
		// https://www.mediawiki.org/wiki/API:Embeddedin
		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Bembeddedin
		embeddedin : 'ei',

		// 回傳連結至指定頁面的所有重新導向。 Returns all redirects to the given pages.
		// 転送ページ
		// Warning: 採用 wiki_API.redirects_here(title) 才能追溯重新導向的標的。
		// wiki.redirects() 無法追溯重新導向的標的！
		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Bredirects
		// @since 2019/9/11
		redirects : [ 'rd', 'prop', title_to_plural ],

		// 取得所有使用 file 的頁面。
		// title 必須包括File:前綴。
		// e.g., [[File:title.jpg]].
		// https://www.mediawiki.org/wiki/API:Imageusage
		imageusage : 'iu',

		// https://commons.wikimedia.org/w/api.php?action=help&modules=query%2Bimageinfo
		imageinfo : [ 'ii', 'prop', title_to_plural ],
		// https://commons.wikimedia.org/w/api.php?action=help&modules=query%2Bstashimageinfo
		stashimageinfo : [ 'sii', 'prop', title_to_plural ],
		// https://commons.wikimedia.org/w/api.php?action=help&modules=query%2Bvideoinfo
		videoinfo : [ 'vi', 'prop', title_to_plural ],
		// https://commons.wikimedia.org/w/api.php?action=help&modules=query%2Btranscodestatus

		// 列出在指定分類中的所有頁面。
		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Bcategorymembers
		// @see [[mw:Help:Tracking categories|追蹤分類]]
		categorymembers : [ 'cm', , function(title_parameter) {
			// 要列舉的分類（必需）。必須包括Category:前綴。不能與cmpageid一起使用。
			if (/^&cmtitle=(Category|分類|分类|カテゴリ|분류)%3A/ig
			// @see PATTERN_category @ CeL.wiki
			.test(title_parameter)) {
				return title_parameter;
			}
			return title_parameter.replace(/^&cmtitle=/, '&cmtitle=Category:');
		} ],

		// Returns information about the given categories.
		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Bcategoryinfo
		categoryinfo : [ 'ci', 'prop', function(title_parameter, options) {
			// There is no cilimit.
			delete options.limit;
			return title_to_plural(title_parameter);
		} ],

		// List all categories the pages belong to.
		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Bcategories
		categories : [ 'cl', 'prop', title_to_plural ],

		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Brecentchanges
		recentchanges : 'rc',

		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Busercontribs
		// wiki.usercontribs(user_name,function(list){console.log(list);},{limit:80});
		// get new → old
		usercontribs : [ 'uc', , function(title_parameter, options) {
			if (!options.ucdir && options.ucend - options.ucstart > 0) {
				library_namespace.warn(
				//
				'usercontribs: Change ucdir to "newer", oldest first.');
				options.ucdir = 'newer';
				// console.trace(title_parameter, options);
			}
			return title_parameter.replace(/^&uctitle=/, '&ucuser=');
		} ],

		// 'type name' : [ 'abbreviation 縮寫 / prefix', 'parameter' ]
		// ** 可一次處理多個標題，但可能較耗資源、較慢。

		// TODO:
		// **暫時使用wiki_API.langlinks()，因為尚未整合，在跑舊程式時會有問題。
		NYI_langlinks : [ 'll', 'prop', function(title_parameter, options) {
			// console.trace(title_parameter);
			if (options && options.lang && typeof options.lang === 'string') {
				return title_parameter + '&lllang=' + options.lang;
			}
			return title_parameter;
		} ],

		// linkshere: 取得連結到 [[title]] 的頁面。
		// [[Special:Whatlinkshere]]
		// [[使用說明:連入頁面]]
		// https://zh.wikipedia.org/wiki/Help:%E9%93%BE%E5%85%A5%E9%A1%B5%E9%9D%A2
		linkshere : [ 'lh', 'prop', title_to_plural ],

		// 取得所有使用 title (e.g., [[File:title.jpg]]) 的頁面。
		// 基本上同 imageusage。
		fileusage : [ 'fu', 'prop', title_to_plural ],

		// 列舉包含指定 URL 的頁面。 [[Special:LinkSearch]]
		// https://www.mediawiki.org/wiki/API:Exturlusage
		// 注意: 可能會有同一個頁面多個網址的情況！可使用 options.combine_pages。
		exturlusage : [ 'eu', , function(title_parameter) {
			// console.log(decodeURIComponent(title_parameter));
			return title_parameter.replace(/^&eutitle=([^=&]*)/,
			//
			function($0, link) {
				if (link) {
					var matched = decodeURIComponent(link)
					//
					.match(/^([a-z]+):\/\/(.+)$/i);
					if (matched) {
						// `http://www.example.com/path/`
						// → http + `www.example.com`
						link = matched[2].replace(/\/.*$/, '') + '&euprotocol='
						//
						+ encodeURIComponent(matched[1]);
					}
				} else {
					link = '';
				}
				return '&euquery=' + link;
			});
		} ],

		// 回傳指定頁面的所有連結。
		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Blinks
		links : [ 'pl', 'prop', title_to_plural ],

		// 取得透過特殊頁面 QueryPage-based 所提供的清單。
		querypage : [ 'qp', , function(title_parameter) {
			return title_parameter.replace(/^&qptitle=/, '&qppage=');
		} ],

		// [[Help:Magic words]] 列出所有在 wiki 使用的頁面屬性名稱。
		pagepropnames : 'ppn',
		// 列出使用到指定頁面屬性的所有頁面。
		pageswithprop : [ 'pwp', , function(title_parameter) {
			return title_parameter.replace(/^&pwptitle=/, '&pwppropname=');
		} ],

		// 列出變更標記。
		tags : [ 'tg', , function(title_parameter) {
			if (!title_parameter)
				return '&tgprop=displayname|description'
				// all 要取得的屬性。
				+ '|hitcount|defined|source|active';
			return title_parameter.replace(/^&tgtitle=/, '&tgprop=');
		} ],

		// 取得有關使用者清單的資訊。
		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Busers
		users : [ 'us', , function(title_parameter) {
			return title_parameter.replace(/^&ustitle=/, '&ususers=');
		} ],

		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Bglobaluserinfo
		globaluserinfo : [ 'gui', 'meta', function(title_parameter) {
			// console.trace(title_parameter);
			return title_parameter.replace(/^&title=/, '&guiuser=');
		} ],

		// .userinfo(['rights'])
		// Get information about the current user.
		userinfo : [ 'ui', 'meta', function(title_parameter) {
			// console.trace(title_parameter);
			return title_parameter.replace(/^&title=/, '&uiprop=');
		} ],

		// 從日誌中獲取事件。
		// result: new → old
		logevents : 'le'
	};

	// ------------------------------------------------------------------------

	var KEY_page_list = typeof Symbol === 'function' ? Symbol('page list')
			: 'page list';

	/**
	 * 取得完整 list 後才作業。
	 * 
	 * @param {String}target
	 *            page title 頁面標題。
	 * @param {Function}callback
	 *            回調函數。 callback(pages, target, options)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 */
	function wiki_API_list(target, callback, options) {
		// 前置處理。
		options = library_namespace.new_options(options);

		var session = wiki_API.session_of_options(options);
		if (!options.initialized) {
			// console.trace(options);
			if (!session) {
				session = new wiki_API;
			}
			if (!options.type) {
				options.type = wiki_API_list.default_type;
			}
			options.initialized = true;
		}

		if (!options.limit)
			options.limit = 'max';

		if (!options.next_mark) {
			// initialization
			options.next_mark = Object.create(null);
		}

		// 對於太大的 {Array}target，會在 get_list() 中自行處理。

		// console.trace(target, options);
		session[options.type](target,
		// 注意: arguments 與 get_list() 之 callback 連動。
		function wiki_API_list_callback(pages, error) {
			// console.trace([ target, pages ]);
			if (pages) {
				library_namespace.debug('Get ' + pages.length + ' '
						+ options.type + ' pages of ' + pages.title, 2,
						'wiki_API_list');
			} else {
				// has error!
				pages = [];
			}
			if (error) {
				console.trace(error);
				pages.error = error;
			}
			if (typeof options.callback === 'function') {
				// options.callback() 為取得每一階段清單時所會被執行的函數。
				// 注意: arguments 與 get_list() 之 callback 連動。
				// page_list
				options.callback(pages, target, options);
			}
			// 設定了 options.for_each_page 時，callback() 不會傳入 list！
			// 用意在省記憶體。options.for_each_page() 執行過就不用再記錄了。
			if (Array.isArray(options[KEY_page_list])) {
				if (!options.for_each_page || options.get_list) {
					options[KEY_page_list].append(pages);
					// console.trace([ pages.title, pages[0],
					// wiki_API.title_link_of(pages[0]) ]);
					var message = '[' + options.type + '] ';
					if (!target) {
						// e.g., allcategories
					} else if (Array.isArray(target)) {
						message += target.length + ' targets:';
					} else if (target[wiki_API.KEY_generator_title]) {
						message += 'of [' + target.generator + '] '
						//
						+ wiki_API.title_link_of(
						//
						target[wiki_API.KEY_generator_title]);
					} else {
						message += wiki_API.title_link_of(target);
					}
					message += ' '
					// gettext_config:{"id":"$1-results"}
					+ gettext('%1 {{PLURAL:%1|result|results}}',
					//
					options[KEY_page_list].length)
					//
					+ (options.page_filter ? ' (filtered)' : '')
					//
					+ ': +' + pages.length;
					if (pages.title && pages.length > 0) {
						message += ' ' + wiki_API.title_link_of(
						//
						pages[0].title || pages[0]);
						if (pages.length > 1) {
							message += '–' + wiki_API.title_link_of(
							//
							pages.at(-1).title || pages.at(-1));
						}
					}
					if (pages.length === 0 && options.next_mark) {
						// 增加辨識度。
						for ( var continue_from in options.next_mark) {
							if (continue_from !== 'continue') {
								message += ' (' + continue_from + ': '
								//
								+ String(options.next_mark[continue_from])
								//
								.replace(/^(.{10})[\s\S]*?(.{8})$/, '$1...$2')
										+ ')';
								break;
							}
						}
					}
					// library_namespace.log_temporary()
					library_namespace.info(message);
				} else {
					// Only preserve length property.
					options[KEY_page_list].length += pages.length;
				}
			} else if (!options[KEY_page_list]
					|| options[KEY_page_list].length === 0) {
				if (!options.for_each_page || options.get_list) {
				} else {
					// Only preserve length property.
					var length = pages.length;
					pages.truncate();
					pages.length = length;
				}
				if (!options[KEY_page_list]) {
					options[KEY_page_list] = pages;
				} else {
					// assert: options[KEY_page_list].length === 0
					Object.assign(options[KEY_page_list], pages);
				}
			} else if (!pages.error) {
				pages.error = new Error(
						'options[KEY_page_list] has been set up!');
			}

			// console.log(pages.next_index);
			// console.log(options.next_mark);
			if (pages.next_index && !options.abort_operation
					&& !(options[KEY_page_list].length >= options.limit)) {
				library_namespace.debug(wiki_API.title_link_of(target)
				//
				+ ': 尚未取得所有清單，因此繼續取得下一階段清單。', 1, 'wiki_API_list');
				if (false) {
					console.trace([ wiki_API.title_link_of(target),
							options.next_mark ]);
				}
				setImmediate(wiki_API_list, target, callback, options);
			} else {
				library_namespace.debug(wiki_API.title_link_of(target)
				//
				+ ': run callback after all list got or abort operation.', 1,
						'wiki_API_list');
				// reset .next_mark
				// session.next_mark = Object.create(null);
				// console.trace(options.for_each_page);

				// 警告: options[KEY_page_list] 與 target 並非完全一對一對應!
				if (!options.for_each_page) {
					callback(options[KEY_page_list], target, options);
				} else {
					// `options.for_each_page` 可能還在執行中，例如正在取得頁面內容；
					// 等到 `options.for_each_page` 完成之後才執行 callback。
					session.run(callback, options[KEY_page_list], target,
							options);
				}
			}
		},
		// 引入 options，避免 get_list() 不能確實僅取指定 namespace。
		options);
	}

	// `options.for_each_page` 設定直接跳出。 `CeL.wiki.list.exit`
	wiki_API_list.exit = [ 'wiki_API_list.exit: abort the operation' ];

	wiki_API_list.default_type = 'embeddedin';
	// supported type list
	wiki_API_list.type_list = [];

	// ------------------------------------------------------------------------

	// setup wiki_API.prototype.methods
	(function wiki_API_prototype_methods() {
		// 登記 methods。
		var methods = wiki_API.prototype.next.methods;

		for ( var name in get_list.type) {
			methods.push(name);
			wiki_API_list.type_list.push(name);
			wiki_API[name] = get_list.bind(null, name);
		}

		// add method to wiki_API.prototype
		// setup other wiki_API.prototype methods.
		methods.forEach(function(method) {
			library_namespace.debug('add action to wiki_API.prototype: '
					+ method, 2);
			wiki_API.prototype[method] = function wiki_API_prototype_method() {
				// assert: 不可改動 method @ IE！
				var args = [ method ];
				Array.prototype.push.apply(args, arguments);
				if (library_namespace.is_debug() && !this.running) {
					// console.trace(method + ': ' + this.running);
				}

				if (this.run_after_initializing) {
					library_namespace.debug('It is now initializing. 添加初始程序: '
							+ args[0], 1, 'wiki_API_prototype_methods');
				}

				// ----------------------------------------

				if (library_namespace.is_debug(3)) {
					try {
						library_namespace.debug('add action: '
								+ args.map(JSON.stringify).join('<br />\n'), 3,
								'wiki_API.prototype.' + method);
					} catch (e) {
						// TODO: handle exception
					}
				}

				var previous_action = this.actions.at(-1);
				this.actions.push(args);
				// console.trace([ this.running, this.actions.length, args ]);

				// ----------------------------------------
				// 對於各種連續操作的處理。

				// 做個預先處理，以保證 previous_action[3] 是options。
				if (method === 'page'
				// @see wiki_API.prototype.next.page
				&& library_namespace.is_Object(args[2]) && !args[3]) {
					// 直接輸入 options，未輸入 callback。
					args.splice(2, 0, null);
				}

				if (method === 'edit'
						&& (!args[2] || !('page_to_edit' in args[2]))) {
					// console.trace('No options.page_to_edit set!');
					// console.log(this.actions);
					if (!args[2]) {
						args[2] = previous_action[0] === 'page'
								&& previous_action[3] || Object.create(null);
					}
					// 自動配給一個。
					// @see set_page_to_edit(options, page_data)
					args[2].page_to_edit = wiki_API.VALUE_set_page_to_edit;
				}
				if (method === 'edit' && previous_action
				// next[3] : options
				&& previous_action[0] === 'page') {
					// console.trace([ previous_action, args ]);
					if (!previous_action[3]) {
						// 自動配給一個。
						previous_action[3] = args[2];
					} else if (previous_action[3] !== args[2]) {
						// e.g., 20171025.fix_LintErrors.js
						library_namespace.warn('wiki_API_prototype_methods: '
								+ wiki_API.title_link_of(previous_action[1])
								+ ': 合併 .edit() 的選項至 .page() 的選項。');
						if (false) {
							console.trace([ previous_action[1],
									previous_action[3], args[2] ]);
						}
						args[2] = previous_action[3] = Object.assign(
						// 重建一個，避免污染。
						Object.clone(previous_action[3]), args[2]);
						// console.trace(previous_action);
					}
				}

				if (method === 'page' && typeof args[1] === 'string' && args[3]
						&& args[3].page_title_to_edit
						&& args[1] !== args[3].page_title_to_edit) {
					library_namespace.warn('wiki_API_prototype_methods: '
							+ 'Different page title: ' + args[1] + '→'
							+ args[3].page_title_to_edit);
					Error.stackTraceLimit = Infinity;
					console.trace(args);
					Error.stackTraceLimit = 10;
					console.log(args[3]);
				}

				// ----------------------------------------

				// TODO: 不應該僅以this.running判定，
				// 因為可能在.next()中呼叫本函數，這時雖然this.running===true，但已經不會再執行。
				if (!this.running
				/**
				 * (!this.running && this.actions.promise_relying) 代表
				 * promise_relying 中 call 了 wiki 的函數，這時應該執行，否則會斷掉。
				 */
				// && !this.actions.promise_relying
				/**
				 * callback_result_relying_on_this 執行中應該只能 push 進
				 * session.actions，不可執行 session.next()!
				 */
				// && !this.actions[
				// wiki_API.KEY_waiting_callback_result_relying_on_this]
				/**
				 * 當只剩下剛剛.push()進的operation時，表示已經不會再執行，則還是實行this.next()。 TODO:
				 * 若是其他執行序會操作this.actions、主動執行this.next()，
				 * 或.next()正執行之其他操作會執行this.next()，可能造成重複執行的結果！
				 * 
				 * 2016/11/16 14:45:19 但這方法似乎會提早執行...
				 */
				// || this.actions.length === 1
				) {
					// this.thread_count = (this.thread_count || 0) + 1;
					if (false) {
						console.trace(
						//
						'wiki_API_prototype_methods: Calling wiki_API.prototype.next() '
						//
						+ [ this.actions.promise_relying, method,
						//
						this.actions.length,
						//
						'\t' + this.actions.slice(0, 9).map(function(action) {
							return action.slice(0, 1);
						}) ]);
					}
					// 註冊本執行緒為主要執行緒。
					this.running = true;
					// 不直接執行以保證 .page() 之後 .edit() 時，this.actions.at(-1) 還存在，未被
					// .shift() 處理掉。
					if (true) {
						setTimeout(this.next.bind(this), 0);
					} else {
						// NG:
						// this.next();
					}

				} else {
					if (false) {
						console.trace('wiki_API_prototype_methods: 直接跳出: '
						//
						+ [ this.running,
						//
						this.actions.promise_relying, this.actions[
						//
						wiki_API.KEY_waiting_callback_result_relying_on_this],
						//
						method, this.actions.length,
						//
						'\t' + this.actions.slice(0, 9).map(function(action) {
							return action.slice(0, 1);
						}) ]);
					}
					if (this.actions.length > 1) {
						library_namespace.debug(method + ': 正在執行中 ('
						//
						+ this.thread_count + ', ' + this.actions.length
						//
						+ ', ' + this.running + ') '
						// ，直接跳出。
						+ this.actions.slice(0, 9).map(function(action) {
							return action.slice(0, 1);
						}), 3, 'wiki_API_prototype_methods');
					}
					if (library_namespace.is_debug(6)) {
						console.trace(method);
						// console.log(args);
						console.log(this.actions);
					}
				}
				return this;
			};
		});
	})();

	// ------------------------------------------------------------------------

	//
	var NS_Category = wiki_API.namespace('Category');

	// export 子分類 subcategory
	wiki_API.KEY_subcategories = 'subcategories';

	// Get category only
	function get_category_tree(options, page_name, category_path) {
		var subcategories = this && this[wiki_API.KEY_subcategories];
		if (!subcategories)
			return;

		options = library_namespace.setup_options(options);
		var category_tree = Object.create(null);

		if (page_name || this.title
		//
		&& (page_name = wiki_API.remove_namespace(this.title, options))) {
			if (category_path) {
				category_path = Object.clone(category_path);
			} else {
				category_path = Object.create(null);
			}
			category_path[page_name] = category_tree;
		} else if (!category_path) {
			category_path = Object.create(null);
		}

		for ( var category_name in subcategories) {
			if (category_name in category_path) {
				// 處理遞迴結構。預防 JSON.stringify() 出現
				// "TypeError: Converting circular structure to JSON" 用。
				// .circular_mark should give primitive value
				// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#primitive_values
				category_tree[category_name] = 'circular_mark' in options ? typeof options.circular_mark === 'function' ? options
						.circular_mark(category_name, category_path)
						: options.circular_mark
						: category_path[category_name];
			} else {
				category_tree[category_name] = get_category_tree.call(
						subcategories[category_name], options, category_name,
						category_path);
			}
		}

		return category_tree;
	}

	/**
	 * traversal root_category, get all categorymembers and subcategories in
	 * [CeL.wiki.KEY_subcategories]
	 * 
	 * @example<code>

	wiki.category_tree('Category:公共轉換組模板', function(list) { page_list = list; });

	</code>
	 * 
	 * 採用了 wiki_API.list()，將納進 wiki_API.prototype.next 的執行順序。
	 * 
	 * @param {String}root_category_list
	 *            category to traversal
	 * @param {Function}callback
	 *            callback({Array}page_data_list, error)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項 default: { depth :
	 *            category_tree.default_depth }
	 */
	function category_tree(root_category_list, callback, options) {
		if (typeof callback === 'object' && !options) {
			// shift arguments.
			options = callback;
			callback = null;
		}

		var session = this,
		/** {Object}執行 categorymembers 查詢時使用的選項。 */
		categorymembers_options = wiki_API.add_session_to_options(session, {
			type : 'categorymembers'
		}),
		/** {Object}執行 categoryinfo 查詢時使用的選項。 */
		categoryinfo_options = wiki_API.add_session_to_options(session, {
			multi : true,
			type : 'categoryinfo'
		}), cmtypes_hash;

		if (typeof options === 'function') {
			options = {
				for_each_page : options
			};
		} else if (typeof options === 'number'
		// ([1,2]|0)>=0
		&& options >= 0) {
			options = {
				depth : options
			};
		} else {
			// including options.namespace
			Object.assign(categorymembers_options, options);
			// 採用 page_filter 會與 get_list() 中之 page_filter 衝突。
			delete categorymembers_options.page_filter;
			if ('namespace' in categorymembers_options) {
				// 確保一定有 NS_Category。
				categorymembers_options.namespace = wiki_API.namespace(
						categorymembers_options.namespace, options);
				if (categorymembers_options.namespace !== '*') {
					categorymembers_options.namespace = wiki_API.namespace(
							categorymembers_options.namespace + '|'
									+ NS_Category, options)
				}
			} else {
				categorymembers_options.namespace = category_tree.default_namespace;
			}

			if (options && options.depth > 0
					&& typeof categorymembers_options.cmtype === 'string'
					&& !categorymembers_options.cmtype.includes('subcat')) {
				categorymembers_options.cmtype += '|subcat';
			}

			// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
			options = library_namespace.new_options(options);
		}

		// console.trace(options);
		// console.trace(categorymembers_options);

		if (!Array.isArray(root_category_list)) {
			root_category_list = [ root_category_list ];
			options.multi = false;
		}
		if (root_category_list.length < 1) {
			callback(root_category_list);
			return;
		}
		root_category_list = root_category_list.map(function(root_category) {
			return session.to_namespace(root_category, NS_Category);
		});

		// categoryinfo needs 's'
		if (options.cmtype) {
			if (typeof options.cmtype === 'string')
				options.cmtype = options.cmtype.split('|');
			// assert: Array.isArray(options.cmtype)
			cmtypes_hash = Object.create(null);
			options.cmtype.forEach(function(type) {
				cmtypes_hash[type + 's'] = true;
			});
			options.cmtype = options.cmtype.join('|');

		} else {
			cmtypes_hash = {
				subcats : true
			};

			if (options.namespace && options.namespace !== '*') {
				// console.trace(session.namespace(options.namespace));
				// console.trace(session.namespace('File|Category'));
				String(session.namespace(options.namespace)).split('|')
				//
				.forEach(function(_namespace) {
					_namespace = +_namespace;
					if (_namespace === session.namespace('File'))
						cmtypes_hash.files = true;
					else if (_namespace >= 0 && _namespace !== NS_Category)
						cmtypes_hash.pages = true;
				});
				// console.trace(cmtypes_hash);
			} else {
				Object.assign(cmtypes_hash, {
					pages : true,
					files : true
				});
			}
		}
		// console.trace(cmtypes_hash);

		/** {Function|Undefined}分類頁面篩選器。 */
		var category_filter = options.category_filter || options.filter,
		/** {Function|Undefined}非分類頁面之篩選器。 */
		page_filter = options.page_filter || options.filter;

		/** {Object}cache 已經取得的資料: 以避免重複獲取，以及處理遞迴結構、預防無窮執行。 */
		var tree_of_category = Object.create(null),
		// subcategory_count === Object.keys(tree_of_category).length
		subcategory_count = 0;

		// 登記準備要取得的資料。避免重複執行 categorymembers。
		/** {Array}本次要處理的分類列表。 this_category_queue = [ category, category, ... ] */
		var this_category_queue = root_category_list,
		/** {Object}下次要處理的分類。 next_category_queue = { page_name:, page_name:, ... } */
		next_category_queue;

		/** {ℕ⁰:Natural+0}當前執行階層數。depth 越大時，獲得的資訊越少。 */
		var depth = 0,
		/**
		 * {ℕ⁰:Natural+0}最大查詢階層數。 depth of categories<br />
		 * 0: 只包含 root_category 本身的檔案與子類別資訊。<br />
		 * 1: 包含 1 層子類別的檔案與子類別資訊。以此類推。
		 */
		max_depth = (options.depth >= 0 ? options.depth
				: category_tree.default_depth) | 0;

		// --------------------------------------------------------------------
		// 工具函數。

		/**
		 * Recovering list attributes.
		 * 
		 * @param {Array}from_list
		 *            Copy from list
		 * @param {Array}to_list
		 *            Copy to list
		 */
		function copy_list_attributes(from_list, to_list) {
			// Object.assign(to_list, category_page_data); to_list.trimcate();
			Object.keys(from_list).forEach(function(key) {
				if (isNaN(key))
					to_list[key] = from_list[key];
			});
			return to_list;
		}

		function add_tree_list(tree_list, page_name) {
			// console.assert(page_name in tree_of_category === false);

			tree_list.depth = depth;
			subcategory_count++;
			tree_of_category[page_name] = tree_list;

			// 警告: 一個分頁只會執行一次。
			if (options.for_each_category) {
				try {
					options.for_each_category(list);
				} catch (e) {
					library_namespace.error(e);
				}
			}
		}

		/**
		 * 分配、篩選頁面。<br />
		 * 留下非分類頁面。<br />
		 * 直接剔除掉已經查詢過的分頁頁面，即 tree_of_category 已經有的。<br />
		 * 其他 unique 之後放到 next_category_queue。
		 * 
		 * 不可動到 this_category_queue!
		 * 
		 * @param {Array}page_list
		 *            頁面列表。
		 */
		function filter_and_assign_category_pages(page_list) {
			function all_page_filter(page_data) {
				// console.log(page_data)
				if (!session.is_namespace(page_data, NS_Category)) {
					// console.log(page_data);
					// console.log(page_filter(page_data));
					try {
						if (page_filter && !page_filter(page_data)) {
							// console.log(page_data.title);
							return false;
						}
						// 警告: 只要頁面存在於多個查詢到的分類中，就會多次執行。
						if (options.for_each_page
								&& options.for_each_page !== options.for_each_slice) {
							if (options.for_each_page(page_data) === wiki_API_list.exit)
								options.abort_operation = true;
						}
					} catch (e) {
						library_namespace.error(e);
					}
					// console.trace(page_data.title);
					return true;
				}

				// All categories must return false.

				var page_name = session.remove_namespace(page_data, options);
				var cached_tree_list = tree_of_category[page_name];
				if (cached_tree_list) {
					// using cache: 已取得 tree_of_category[page_name] 的資料。
					// The shallowest category will be selected.
					return false;
				}

				// page_data maybe {String}page_title.
				// So should use (page_data.title || page_data)
				if (category_filter && !category_filter(page_data)) {
					// 直接除名。
					library_namespace.debug('Skip non-eligibled category:'
							+ page_name, 1, 'category_tree');
					return false;
				}

				// 登記 subcategory。將會在 build_category_tree() 重新指定。
				subcategories[page_name] = null;

				// 註記需要取得這個 subcategory 的資料。
				if (!next_category_queue[page_name]
				// wiki_API.is_page_data(page_data)
				|| typeof page_data === 'object') {
					next_category_queue[page_name] = page_data;
				}
				return false;
			}

			var subcategories = Object.create(null);
			var filtered_page_list = page_list.filter(all_page_filter);
			copy_list_attributes(page_list, filtered_page_list);
			// console.trace(page_list, filtered_page_list);
			if (!library_namespace.is_empty_object(subcategories))
				filtered_page_list[wiki_API.KEY_subcategories] = subcategories;

			return filtered_page_list;
		}

		// --------------------------------------------------------------------
		// phase 1: Using .categoryinfo(category_list) to filter empty category.

		/**
		 * 剔除 this_category_queue 中，空的、不符資格的 category。<br />
		 * Eliminate empty and ineligible categories.<br />
		 */
		function eliminate_empty_categories() {
			next_category_queue = Object.create(null);
			// 先去掉已經處理過的 category。
			filter_and_assign_category_pages(this_category_queue);
			// setup this_category_queue.
			this_category_queue = Object.values(next_category_queue);

			// 0, 1 個 category 執行 categoryinfo 不划算。
			if (this_category_queue.length < 2) {
				get_all_categorymembers();
				return;
			}

			// --------------------------------------------

			var message = 'Get categoryinfo of ' + this_category_queue.length
					+ ' categories.';
			if (library_namespace.is_debug()) {
				library_namespace.debug(message, 1,
						'eliminate_empty_categories');
			} else {
				library_namespace.log_temporary(message);
			}

			// console.trace(this_category_queue);
			wiki_API.list(this_category_queue, for_category_info_list,
					categoryinfo_options);
		}

		function for_category_info_list(category_info_list) {
			// console.trace(category_info_list);
			// console.assert(Array.isArray(category_info_list));
			if (category_info_list.error) {
				library_namespace.error('for_category_info_list: '
						+ category_info_list.error);
				get_all_categorymembers();
				return;
			}

			// ----------------------------------------

			next_category_queue = Object.create(null);
			category_info_list.forEach(for_category_info);

			// setup this_category_queue.
			this_category_queue = Object.values(next_category_queue);
			get_all_categorymembers();
		}

		function for_category_info(category_page_data) {
			// console.trace(category_page_data);
			var page_name = wiki_API.remove_namespace(category_page_data,
					options);
			if (page_name in tree_of_category) {
				if (false && tree_of_category[page_name]
				// 有時會有同一 category 多次 for_category_info_list()。
				&& !tree_of_category[page_name].categoryinfo) {
					console.trace(tree_of_category[page_name],
							category_info_list);
				}
				return;
			}

			var categoryinfo = category_page_data.categoryinfo;
			// categoryinfo: { size: 0, pages: 0, files: 0, subcats: 0 }
			// console.log(categoryinfo);
			// console.log(category_page_data);
			// console.log(cmtypes_hash);
			for ( var types in cmtypes_hash) {
				if (categoryinfo[types] > 0) {
					// need get, cannot skip
					next_category_queue[page_name] = category_page_data;
					return;
				}
			}

			// 記錄空的、不符資格的 category。

			// 模擬空的 category tree。
			var tree_list = copy_list_attributes(category_page_data, []);
			if (categoryinfo.subcats > 0)
				tree_list[wiki_API.KEY_subcategories] = Object.create(null);
			add_tree_list(tree_list, page_name);
		}

		// --------------------------------------------------------------------
		// phase 2: 對包含子類別的 category，一個個取得其 categorymembers。
		// 取得所有這一層的類別資料後，若還有子類別或深度(depth)未達 max_depth，則回到 phase 1。
		// 否則進入 phase 3。

		function get_all_categorymembers() {
			next_category_queue = Object.create(null);
			// console.trace([depth, max_depth, this_category_queue.length]);
			if (this_category_queue.length === 0) {
				build_category_tree();
				return;
			}

			var message = 'Get categorymembers of '
					+ this_category_queue.length + ' categories. ('
					+ subcategory_count + ' subcategories got, '
					+ (max_depth - depth) + ' levels left)';
			if (library_namespace.is_debug()) {
				library_namespace.debug(message, 1, 'get_all_categorymembers');
			} else {
				library_namespace.log_temporary(message);
			}

			this_category_queue.count = 0;
			this_category_queue.forEach(get_categorymembers);
		}

		function get_categorymembers(category_page_data) {
			// 每次只能處理單一個 category。
			// console.trace(category_page_data, categorymembers_options);
			wiki_API.list(category_page_data, for_categorymember_list,
					categorymembers_options);
		}

		function for_categorymember_list(categorymember_list
		// , target, options
		) {
			// console.trace(categorymember_list);
			// console.assert(Array.isArray(categorymember_list));
			if (categorymember_list.error) {
				library_namespace.error('for_categorymember_list: '
						+ categorymember_list.error);
				check_categorymember();
				return;
			}

			// ----------------------------------------

			var page_name = wiki_API.remove_namespace(
					categorymember_list.title, options);
			var message = 'Depth ' + (depth + 1)
			//
			+ '/' + max_depth + ': ' + (this_category_queue.count + 1) + '/'
					+ this_category_queue.length + ' ' + page_name + ': '
					+ categorymember_list.length + ' item(s).';
			if (library_namespace.is_debug()) {
				library_namespace.debug(message, 1, 'for_categorymember_list');
			} else {
				library_namespace.log_temporary(message);
			}
			// free
			message = null;

			categorymember_list = filter_and_assign_category_pages(categorymember_list);
			// console.trace(categorymember_list);
			add_tree_list(categorymember_list, page_name);
			check_categorymember();
		}

		function check_categorymember() {
			if (++this_category_queue.count < this_category_queue.length) {
				return;
			}

			// assert: got all categorymembers of this_category_queue
			if (false) {
				console
						.assert(this_category_queue.count === this_category_queue.length);
			}

			// setup this_category_queue.
			this_category_queue = Object.values(next_category_queue);
			if (depth++ === max_depth || this_category_queue.length === 0) {
				build_category_tree();
				return;
			}
			// console.assert(depth <= max_depth);

			// Start next depth loop.
			eliminate_empty_categories();
		}

		// --------------------------------------------------------------------
		// phase 3: 最後從 tree_of_category 重建起 category tree。

		function build_category_tree() {
			// assert: got all categorymembers
			if (options.no_list) {
				callback && callback(options.no_list);
				return;
			}

			Object.keys(tree_of_category).forEach(clean_up_tree_list);
			// console.trace(tree_of_category);

			root_category_list = root_category_list
			// 根節點
			.map(function(root_category) {
				var category_name = session.remove_namespace(root_category,
						options);
				var cached_tree_list = tree_of_category[category_name];
				if (!cached_tree_list) {
					library_namespace.error('category_tree: '
							+ 'Cannot get data of root ' + root_category);
					if (category_filter) {
						library_namespace.error('category_tree: '
								+ '或許必須讓 root category 篩過 category_filter？');
					}
					return;
				}
				// console.assert(cached_tree_list.depth === 0);
				cached_tree_list.list_type = 'category_tree';
				cached_tree_list.get_category_tree = get_category_tree;
				// .flated_subcategories
				cached_tree_list.flat_subcategories = tree_of_category;
				return cached_tree_list;
			});

			if (!options.multi && root_category_list.length < 2) {
				root_category_list = root_category_list[0];
			}
			callback && callback(root_category_list);
		}

		function clean_up_tree_list(category_name) {
			// page_list_of_category
			var cached_tree_list = tree_of_category[category_name];

			// 清理多餘標記。
			// delete cached_tree_list.depth;

			var subcategories = cached_tree_list[wiki_API.KEY_subcategories];
			// console.trace([ category_name, subcategories ]);
			if (!subcategories)
				return;

			for ( var subcategory_name in subcategories) {
				var subcategory_tree_list = subcategories[subcategory_name] = tree_of_category[subcategory_name];
				if (!subcategory_tree_list) {
					// assert: 已達 max_depth。
					continue;
				}

				if (!options.set_attributes) {
					continue;
				}

				if (false) {
					console
							.assert(subcategory_tree_list.depth <= cached_tree_list.depth + 1);
				}

				if (!subcategory_tree_list.parent_categories)
					subcategory_tree_list.parent_categories = [];
				subcategory_tree_list.parent_categories.push(cached_tree_list);
			}
		}

		eliminate_empty_categories();
	}

	category_tree.default_depth = 10;
	category_tree.default_namespace
	// 必須包含 'Category'
	= wiki_API.namespace('main|file|module|template|category|help');
	wiki_API.prototype.category_tree = category_tree;

	// ------------------------------------------------------------------------

	if (false) {
		CeL.wiki.langlinks('文明', function(title) {
			title === 'Civilization';
			if (title)
				CeL.show_value(title);
		}, 'en');

		CeL.wiki.langlinks([ 'en', 'Civilization' ], function(title) {
			title === '文明';
			if (title)
				CeL.show_value(title);
		}, 'zh');

		// TODO?
		// return 'title' or {langs:['',''], lang:'title'}
		CeL.wiki.langlinks('文明', function(title) {
			if (title)
				CeL.show_value(title);
		}) == CeL.wiki.langlinks('文明', function(title) {
			if (title)
				CeL.show_value(title);
		}, 10)
		// == {langs:['',''], lang:'title'}

		// 未指定 page，表示已完成。
	}

	/**
	 * 取得 title 在其他語系 (to_lang) 之標題。 Interlanguage title. 可一次處理多個標題。
	 * 
	 * @param {String|Array}title
	 *            the page title to search continue information
	 * @param {Function|Object}callback
	 *            回調函數 or options。
	 * @param {String}to_lang
	 *            所欲求語言。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @see https://www.mediawiki.org/wiki/API:Langlinks
	 *      https://www.mediawiki.org/wiki/Manual:Langlinks_table
	 */
	wiki_API.langlinks = function(title, callback, to_lang, options) {
		var from_lang;
		if (is_api_and_title(title, 'language', Object.assign({
			ignore_API_test : true
		}, options))) {
			from_lang = title[0];
			title = title[1];
		}
		title = 'action=query&prop=langlinks&'
				+ wiki_API.query.title_param(title, true, options
						&& options.is_id);
		if (to_lang) {
			title += (to_lang > 0 || to_lang === 'max' ? '&lllimit='
					: '&lllang=')
					+ to_lang;
		}
		if (options && (options.limit > 0 || options.limit === 'max'))
			title += '&lllimit=' + options.limit;
		// console.log('ll title:' + title);
		if (from_lang) {// llinlanguagecode 無效。
			title = [ from_lang, title ];
		}

		wiki_API.query(title, typeof callback === 'function'
		//
		&& function(data) {
			if (!data || !data.query || !data.query.pages) {
				/**
				 * From version 1.25 onwards, the API returns a batchcomplete
				 * element to indicate that all data for the current "batch" of
				 * pages has been returned.
				 * 
				 * @see https://www.mediawiki.org/wiki/API:Query#batchcomplete
				 */
				if (library_namespace.is_Object(data)
				// status 503 時，data 可能為 string 之類。
				&& ('batchcomplete' in data)) {
					// assert: data.batchcomplete === ''
					library_namespace.debug(wiki_API.title_link_of(title)
					//
					+ ': Done.', 1, 'wiki_API.langlinks');
				} else {
					library_namespace.warn(
					//
					'wiki_API.langlinks: Unknown response: ['
					//
					+ (typeof data === 'object' && typeof JSON !== 'undefined'
					//
					? JSON.stringify(data) : data) + ']');
					// console.log(data);
				}
				// console.warn(data);
				if (library_namespace.is_debug()
				// .show_value() @ interact.DOM, application.debug
				&& library_namespace.show_value)
					library_namespace.show_value(data);
				callback();
				return;
			}

			data = data.query.pages;
			var pages = [];
			for ( var pageid in data)
				pages.push(data[pageid]);
			if (pages.length !== 1 || (options && options.multi)) {
				if (library_namespace.is_debug()) {
					library_namespace.info(
					//
					'wiki_API.langlinks: Get ' + pages.length
					//
					+ ' page(s)! We will pass all pages to callback!');
				}
				// page 之 structure 按照 wiki API 本身之 return！
				// page = {pageid,ns,title,revisions:[{langlinks,'*'}]}
				callback(pages);
			} else {
				if (library_namespace.is_debug() && !pages[0].langlinks) {
					library_namespace.warn('wiki_API.langlinks: '
					//
					+ ('pageid' in pages[0] ? '無' + (to_lang && isNaN(to_lang)
					//
					? '所欲求語言[' + to_lang + ']之' : '其他語言')
					//
					+ '連結' : '不存在/已刪除此頁面') + ': [' + pages[0].title + ']');
					// library_namespace.show_value(pages);
				}
				pages = pages[0].langlinks;
				callback(pages ? to_lang && isNaN(to_lang) ? pages[0]['*']
				//
				: wiki_API.langlinks.parse(pages) : pages);
			}
		}, null, options);
	};

	wiki_API.langlinks.parse = function(langlinks, to_lang) {
		if (langlinks && Array.isArray(langlinks.langlinks)) {
			langlinks = langlinks.langlinks;
		}

		if (!Array.isArray(langlinks)) {
			if (library_namespace.is_debug()) {
				library_namespace.warn(
				//
				'wiki_API.langlinks.parse: No langlinks exists?'
						+ (langlinks && langlinks.title ? ' '
								+ wiki_API.title_link_of(langlinks) : ''));
				if (library_namespace.is_debug(2)
				// .show_value() @ interact.DOM, application.debug
				&& library_namespace.show_value)
					library_namespace.show_value(langlinks, 'langlinks.parse');
			}
			return;
		}

		var langs;
		if (to_lang) {
			langlinks.some(function(lang) {
				if (to_lang == lang.lang) {
					langs = lang['*'];
					return true;
				}
			});

		} else {
			langs = Object.create(null);
			langs.langs = [];
			langlinks.forEach(function(lang) {
				langs[lang.lang] = lang['*'];
				langs.langs.push(lang.lang);
			});
		}
		return langs;
	};

	// ------------------------------------------------------------------------

	/**
	 * full text search<br />
	 * search wikitext: using prefix "insource:". e.g.,
	 * https://www.mediawiki.org/w/api.php?action=query&list=search&srwhat=text&srsearch=insource:abc+def
	 * 
	 * TODO: [[:en:Template:Regex]] "hastemplate:", "incategory:", "intitle:",
	 * "linksto:", "morelike:", "prefer-recent:", "boost-templates:",
	 * "namespace:"
	 * 
	 * @example <code>

	wiki.search(search_key, {
		summary : summary,
		log_to : log_to,
		each : function(page_data, messages, config) {
			console.log(page_data.title);
		}
	});

	 * </code>
	 * 
	 * @param {String}key
	 *            search key
	 * @param {Function}[callback]
	 *            回調函數。 callback([ pages, searchinfo : {totalhits : {Integer}},
	 *            search_key : {String}key_used ], error)
	 * @param {Object}options
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @see https://www.mediawiki.org/w/api.php?action=help&modules=query%2Bsearch
	 *      https://www.mediawiki.org/wiki/API:Search_and_discovery
	 *      https://www.mediawiki.org/wiki/Help:CirrusSearch
	 */
	wiki_API.search = function wiki_API_search(key, callback, options) {
		if (typeof options !== 'object' && (options === 'max' || options > 0)) {
			options = {
				srlimit : options
			};
		}
		var API_URL;
		if (Array.isArray(key)) {
			API_URL = key[0];
			key = key[1];
		}
		if (library_namespace.is_RegExp(key)) {
			// [[w:en:Help:Searching/Regex]]
			// [[mw:Help:CirrusSearch#Insource]]
			// 有無 global flag 結果不同。
			key = ('insource:' + key).replace(/g([^\/]*)$/, '$1');
		}
		if ('namespace' in options) {
			if (options.srnamespace) {
				library_namespace.warn('Unrecognized parameter: namespace.');
			} else {
				options.srnamespace = options.namespace;
				delete options.namespace;
			}
		}
		if (options.srnamespace) {
			options.srnamespace = wiki_API.namespace(options.srnamespace,
					options);
		}

		var _options = Object.clone(options);
		// 避免 session 也被帶入 parameters。
		delete _options[KEY_SESSION];

		options.handle_continue_response = true;

		var action = library_namespace.URI(API_URL);
		Object.assign(action.search_params, {
			action : 'query',
			list : 'search',
			srsearch : key
		}, wiki_API.search.default_parameters, _options);
		// e.g., 20220303.セミコロン1つに変更する.js
		delete action.search_params.next_mark;

		wiki_API.query(action, function(data, error) {
			// console.log([ data, error ]);
			if (library_namespace.is_debug(2)
			// .show_value() @ interact.DOM, application.debug
			&& library_namespace.show_value)
				library_namespace.show_value(data, 'wiki_API.search');

			if (wiki_API.query.handle_error(data, error, callback)) {
				return;
			}

			var cached_list = options.cached_list;
			options = data && (data['continue'] || data['query-continue']);
			if (data && !options && !('batchcomplete' in data)) {
				callback(data, new Error(
						'No batchcomplete and no continue in the API result! '
								+ key));
				return;
			}
			// var totalhits;
			if (data && (data = data.query)) {
				if (cached_list) {
					data.search = cached_list.append(data.search);
				}
				if (options) {
					// data.search.sroffset = options.search.sroffset;
					Object.assign(data.search, options.search);
				}
				// totalhits = data.searchinfo.totalhits;

				data.search.searchinfo = data.searchinfo;
				// Object.assign(data.search, data.searchinfo);

				data = data.search;
				data.search_key = key;
			} else {
				callback(data, new Error('Unknown result'));
				return;
			}

			// data: [ page_data ].sroffset = next
			if (typeof callback === 'function') {
				// callback([ pages, searchinfo : {totalhits : {Integer}},
				// search_key : {String}key_used ])
				callback(data, error);
			}
		}, null, options);
	};

	wiki_API.search.default_parameters = {
		// |プロジェクト
		srnamespace : wiki_API
				.namespace('main|file|module|template|category|help|portal'),

		srprop : 'redirecttitle',
		// srlimit : 10,
		srlimit : 'max',
		// sroffset : 0,
		srinterwiki : 1
	};

	// ------------------------------------------------------------------------

	// TODO:
	// https://zh.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop&titles=Money|貨幣|數據|說明&redirects&format=json&utf8
	// https://zh.wikipedia.org/w/api.php?action=query&prop=redirects&rdprop&titles=Money|貨幣|數據|說明&redirects&format=json&utf8
	// https://zh.wikipedia.org/w/api.php?action=query&prop=redirects&rdprop=title&titles=Money|貨幣|數據|說明&redirects&format=json&utf8

	// 溯源(追尋至重定向終點) redirects_target()
	// TODO: using wiki_API.redirect_to
	wiki_API.redirects_root = function redirects_root(title, callback, options) {
		// .original_title , .convert_from
		options = Object.assign({
			// wiki_API_page: [toomanyvalues] Too many values supplied for
			// parameter "titles". The limit is 500.
			// 警告: 最好自行排除重複標題，並以
			// `CeL.wiki.PATTERN_invalid_page_name_characters.test(page_title)`
			// 篩選。
			try_cut_slice : true,

			// multi : Array.isArray(title),
			redirects : 1,
			rdprop : 'pageid|title|fragment',
			prop : 'info'
		}, options);

		// 用 .page() 可省略 .converttitles
		// .redirects() 本身不會作繁簡轉換。
		// redirect_to: 追尋至重定向終點

		// console.trace(title);
		wiki_API.page(title, function(page_data, error) {
			// console.trace(title);
			// console.trace(page_data);
			// console.trace(error);

			// 已經轉換過，毋須 wiki_API.parse.redirect()。
			// wiki_API.parse.redirect(wiki_API.content_of(page_data)) ||

			// 若是 convert 過則採用新的 title。
			if (Array.isArray(title)) {
				// aassert: Array.isArray(page_data)
				// && title.length === page_data.length

				// console.trace(page_data.redirects.map);

				// 依照原順序排列。
				title = title.map(function(_title) {
					var redirects_data = page_data.redirects
							&& page_data.redirects.map[_title];
					if (redirects_data) {
						// console.trace(redirects_data);
						// {"from":"","to":"","tofragment":""}
						return redirects_data.tofragment ? redirects_data.to
								+ '#' + redirects_data.tofragment
								: redirects_data.to;
					}

					// console.trace(page_data);
					redirects_data = page_data.title_data_map
							&& page_data.title_data_map[_title];
					if (!redirects_data) {
						// e.g., "en:ABC"
						// console.log(page_data);
						// console.trace(_title);
						if (!/^:?[^:]+:/.test(_title)) {
							// e.g., [[commons:title]]
							library_namespace.warn('redirects_root: '
									+ '沒有這個頁面的重定向資料: ' + _title);
						}
						return _title;
						// Will be thrown in the next statement.
					}
					return redirects_data.title;
				});
				// title.raw_result
				title.original_result = page_data;
			} else {
				title = page_data && page_data.title || title;
			}

			// console.error(error);
			callback(title, page_data, error);
		}, options);
	};

	/**
	 * 取得所有重定向到(title重定向標的)之頁面列表。
	 * 
	 * 注意: 無法避免雙重重定向問題!
	 * 
	 * 工作機制:<br />
	 * 1. 先溯源: 若 [[title]] redirect 到 [[base]]，則將 base(title重定向標的) 設定成 base；<br />
	 * 否則將 base(title重定向標的) 設定成 title。<br />
	 * 2. 取得所有 redirect/重定向/重新導向 到 base 之 pages。<br />
	 * 3. 若設定 options.include_root，則(title重定向標的)將會排在[0]。
	 * 
	 * 因此若 R2 → R1 → R，且 R' → R，則 wiki_API.redirects_here(R2) 會得到 [{R1},{R2}]，
	 * wiki_API.redirects_here(R1) 與 wiki_API.redirects_here(R) 與
	 * wiki_API.redirects_here(R') 皆會得到 [ {R}, {R1}, {R'} ]
	 * 
	 * 可以 [[Special:Whatlinkshere]] 確認。
	 * 
	 * @param {String}title
	 *            頁面名。
	 * @param {Function}callback
	 *            callback(root_page_data, redirect_list, error) { redirect_list = [
	 *            page_data, page_data, ... ]; }
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項。 此 options 可能會被變更！<br />
	 *            {Boolean}options.no_trace: 若頁面還重定向/重新導向到其他頁面則不溯源。溯源時 title 將以
	 *            root 替代。<br />
	 *            {Boolean}options.include_root 回傳 list 包含 title，而不只是所有 redirect
	 *            到 [[title]] 之 pages。
	 * 
	 * @see [[Special:DoubleRedirects]]
	 * 
	 * @since 2019/9/11: wiki_API.redirects → wiki_API.redirects_here,
	 *        wiki_API.redirects 改給 get_list.type .redirects 使用。
	 */
	wiki_API.redirects_here = function redirects_here(title, callback, options) {
		// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
		options = library_namespace.new_options(options);

		if (!options.no_trace) {
			// .original_title , .convert_from
			options.query_title = title;
			// 先溯源(追尋至重定向終點)
			wiki_API.redirects_root(title, function(title, page_data, error) {
				// cache
				options.page_data = page_data;
				// 已追尋至重定向終點，不再溯源。
				options.no_trace = true;
				wiki_API.redirects_here(title, callback, options);
			}, options);
			return;
		}

		// console.trace(title);

		// modules=query&titles= overwrite multi=false
		options.multi_param = true;
		var action = normalize_title_parameter(title, options);
		if (!action) {
			throw 'wiki_API.redirects_here: Invalid title: '
					+ wiki_API.title_link_of(title);
		}

		action[1] = 'action=query&prop=redirects&rdlimit=max&' + action[1];
		if (!action[0])
			action = action[1];

		// console.trace([ action, options ]);
		wiki_API.query(action, typeof callback === 'function'
		//
		&& function(data, error) {
			// copy from wiki_API.page()

			error = data && data.error;
			// 檢查 MediaWiki 伺服器是否回應錯誤資訊。
			if (error) {
				library_namespace.error('wiki_API.redirects_here: '
				//
				+ '[' + error.code + '] ' + error.info);
				/**
				 * e.g., Too many values supplied for parameter 'pageids': the
				 * limit is 50
				 */
				if (data.warnings && data.warnings.query
				//
				&& data.warnings.query['*']) {
					library_namespace.warn(data.warnings.query['*']);
				}
				// callback(root_page_data, redirect_list, error)
				callback(null, null, error);
				return;
			}

			if (!data || !data.query || !data.query.pages) {
				library_namespace.warn('wiki_API.redirects_here: '
				//
				+ 'Unknown response: ['
				//
				+ (typeof data === 'object' && typeof JSON !== 'undefined'
				//
				? JSON.stringify(data) : data) + ']');
				if (library_namespace.is_debug()
				// .show_value() @ interact.DOM, application.debug
				&& library_namespace.show_value)
					library_namespace.show_value(data);
				callback(null, null, data);
				return;
			}

			data = data.query.pages;
			var pages = [], page_data = options.page_data;
			var session = wiki_API.session_of_options(options);
			for ( var pageid in data) {
				var page = data[pageid];
				// 僅處理第一頁。
				if (!options.no_message
				//
				&& !wiki_API.content_of.page_exists(page)) {
					// 此頁面不存在/已刪除。Page does not exist. Deleted?
					library_namespace.warn([ 'wiki_API.redirects_here: ', {
						// e.g., 中文維基中無此頁面
						// gettext_config:{"id":"$1-is-not-exist-in-$2"}
						T : [ '%1 is not exist in %2.',
						//
						(page.title ? wiki_API.title_link_of(page)
						//
						: ' id ' + page.pageid), wiki_API.site_name(session) ]
					} ]);
				}

				// page 之 structure 將按照 wiki API 本身之 return！
				// page = {pageid,ns,title,redirects:[{},{}]}
				var redirect_list = page.redirects || [];
				library_namespace.debug(
				//
				wiki_API.title_of(page) + ': 有 ' + redirect_list.length
				//
				+ ' 個同名頁面(重定向至此頁面)。', 2, 'wiki_API.redirects_here');
				if (options.include_root) {
					// 避免修改或覆蓋 pages.redirects。
					redirect_list = redirect_list.slice();
					// Making .redirect_list[0] the redirect target.
					redirect_list.unshift(page);
					// page_data.redirects
					page.redirect_list = redirect_list;
				}

				var _page_data = page_data && page_data.index_of_title
				//
				&& page_data[page_data.index_of_title[page.title]] ||
				// wiki_API.is_page_data(page_data) &&
				page_data;
				if (_page_data) {
					// console.assert(wiki_API.is_page_data(_page_data));
					// console.assert(_page_data.pageid === page.pageid);
					page = Object.assign(_page_data, page);
				}
				redirect_list.query_title =
				//
				_page_data && (_page_data.original_title || _page_data.title)
				//
				|| options.query_title;

				library_namespace.debug('redirects (alias) of '
				//
				+ wiki_API.title_link_of(page) + ': (' + redirect_list.length
				//
				+ ') [' + redirect_list.slice(0, 3)
				// CeL.wiki.title_of(page_data)
				.map(wiki_API.title_of) + ']...',
				//
				1, 'wiki_API.redirects_here');
				pages.push(page);
			}

			if (pages.length > 1) {
				callback(pages);

			} else {
				pages = pages[0];
				// callback(root_page_data 本名, redirect_list 別名 alias list)
				callback(pages, pages.redirect_list || page.redirects);
			}

		}, null, options);
	};

	/**
	 * 計算實質[[w:zh:Wikipedia:嵌入包含]](transclusion)之頁面數。
	 * 
	 * 若條目(頁面)[[w:zh:Wikipedia:嵌入包含]]有模板(頁面)別名，則將同時登記 embeddedin 於別名 alias 與
	 * root。<br />
	 * e.g., 當同時包含 {{Refimprove}}, {{RefImprove}} 時會算作兩個，但實質僅一個。<br />
	 * 惟計數時，此時應僅計算一次。本函數可以去除重複名稱，避免模板尚有名稱重複者。
	 * 
	 * @param {Object}root_name_hash
	 *            模板本名 hash. 模板本名[{String}模板別名/本名] = {String}root 模板本名
	 * @param {Array}embeddedin_list
	 *            頁面[[w:zh:Wikipedia:嵌入包含]]之模板 list。
	 * 
	 * @returns {ℕ⁰:Natural+0}normalized count
	 */
	wiki_API.redirects_here.count = function(root_name_hash, embeddedin_list) {
		if (!Array.isArray(embeddedin_list)) {
			library_namespace.warn('wiki_API.redirects_here.count: '
					+ 'Invalid embeddedin list.');
			return 0;
		}
		var name_hash = Object.create(null);
		embeddedin_list.forEach(function(title) {
			title = wiki_API.title_of(title);
			library_namespace.debug('含有模板{{' + root_name_hash[title] + '}}←{{'
					+ title + '}}', 3, 'wiki_API.redirects_here.count');
			name_hash[root_name_hash[title] || title] = null;
		});
		return Object.keys(name_hash).length;
	};

	// ------------------------------------------------------------------------

	/**
	 * 用於取得分散式列表。 Get decentralized list.
	 * 
	 * 注意: 本函數不保證遍歷所有頁面！應用於消除這個的情況。
	 * 
	 * 注意: noy yet tested
	 */
	function random_categorymembers(target, for_each_page, options) {
		// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
		options = library_namespace.new_options(options);

		var pages_left = options.limit >= 1 ? options.limit : Infinity;
		// batch_size
		if (!(options.piece_size >= 1))
			options.piece_size = 500;
		options.type = 'categorymembers';

		options.for_each_page = function(page_data) {
			return for_each_page.apply(this, arguments);
		};

		var session = wiki_API.session_of_options(options);

		function get_next_piece_SQL() {
			// https://en.wikipedia.org/wiki/Wikipedia:Bots/Noticeboard#Flooding_watchlists
			// https://quarry.wmcloud.org/query/79763
			// await(await
			// fetch('https://quarry.wmcloud.org/run/820666/output/0/json')).json()
			wiki_API.SQL('SELECT page_namespace, page_title FROM categorylinks'
					+ ' JOIN page ON page_id = cl_from WHERE cl_to = "'
					+ session.remove_namespace(session.normalize_title(target))
							.replace(/\s/g, '_')
					+ '" ORDER BY page_random LIMIT '
					+ Math.min(5000, pages_left), function callback(error,
					rows, fields) {
				if (error) {
					if (options.callback) {
						options.callback(rows, error);
					}
					return;
				}
				rows.forEach(function(row) {
					row.title = wiki.to_namespace(row.page_title,
							row.page_namespace);
					for_each_page.call(this, row);
				});

				pages_left -= rows.length;
				if (pages_left > 0) {
					get_next_piece_SQL();
				} else if (options.callback) {
					options.callback();
				}

			}, wiki_API.site_name(session));
		}

		if (wiki_API.SQL) {
			get_next_piece_SQL();
			return;
		}

		// 依託於 CeL.wiki.list()
		session.running = false;
		if (session.actions.length > 0) {
			library_namespace.warn('random_categorymembers: '
					+ 'Yet tested case! session.actions.length > 0');
		}

		var A_code = 'A'.charCodeAt(0), code_diff = 'Z'.charCodeAt(0) - A_code
				+ 1;
		function random_alphabet_code() {
			return A_code + code_diff * Math.random();
		}

		var latest_size;
		function get_next_piece() {
			if (!latest_size === 0) {
				library_namespace.info('random_categorymembers: '
						+ 'Try to get full list of ' + target + '.');
				delete options.cmstartsortkeyprefix;
			} else {
				// https://phabricator.wikimedia.org/T74101
				options.cmstartsortkeyprefix = String.fromCharCode(
						random_alphabet_code(), random_alphabet_code(),
						random_alphabet_code());
			}
			options.limit = Mathy.min(options.piece_size, pages_left);

			// console.trace(target, options);
			wiki_API_list(target, function(pages, target, options) {
				latest_size = pages.length;
				if (!options.get_list)
					pages.truncate();
				console.trace(latest_size, options.cmstartsortkeyprefix);
				pages_left -= latest_size;
				if (pages_left > 0) {
					get_next_piece();
				} else if (options.callback) {
					options.callback();
				}
			}, options);
		}

		get_next_piece();
	}

	wiki_API.random_categorymembers = random_categorymembers;

	// ------------------------------------------------------------------------

	// export 導出.

	// wiki_API.list = wiki_API_list;
	// `CeL.wiki.list`
	return wiki_API_list;
}
