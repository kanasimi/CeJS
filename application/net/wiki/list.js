/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): page revisions
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

	require : 'application.net.wiki.',

	// 設定不匯出的子函式。
	no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var wiki_API = library_namespace.net.wiki, KEY_SESSION = wiki_API.KEY_SESSION;
	// @inner
	var is_api_and_title = wiki_API.is_api_and_title, add_parameters = wiki_API.add_parameters;

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
					data = Object.assign(data,
					//
					library_namespace.parse_JSON(matched[1]));
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

	// allow async functions
	// https://github.com/tc39/ecmascript-asyncawait/issues/78
	var get_list_async_code = '(async function() {'
			+ ' try { if (wiki_API_list.exit === await options.for_each(item)) options.abort_operation = true; }'
			+ ' catch(e) { library_namespace.error(e); }' + ' })();';

	/**
	 * get list. 檢索/提取列表<br />
	 * 注意: 可能會改變 options！
	 * 
	 * TODO: options.get_sub options.ns
	 * 
	 * @param {String}type
	 *            one of get_list.type
	 * @param {String}[title]
	 *            page title 頁面標題。
	 * @param {Function}callback
	 *            回調函數。 callback(pages, error)<br />
	 *            注意: arguments 與 get_list() 之 callback 連動。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 */
	function get_list(type, title, callback, options) {
		// console.trace(title);
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
			parameter = prefix[1] || get_list.default_parameter;
			title_preprocessor = prefix[2];
			prefix = prefix[0];
		} else {
			parameter = get_list.default_parameter;
		}

		if (typeof options === 'string' || !isNaN(options)) {
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
			// 檢查 options.namespace。
			options.namespace = wiki_API.namespace(options.namespace);
			if (options.namespace === undefined) {
				library_namespace
						.warn('get_list: options.namespace 並非為正規 namespace！將被忽略！');
				delete options.namespace;
			}
		}

		// 處理 [ {String}API_URL, {String}title or {Object}page_data ]
		var action = is_api_and_title(title, true) ? title.clone()
		// assert: {String}title
		: [ , title ];

		var continue_from = prefix + 'continue',
		// {wiki_API}options.continue_session: 藉以取得後續檢索用索引值之 {wiki_API}。
		// 若未設定 .next_mark，才會自 options.get_continue 取得後續檢索用索引值。
		continue_session = options.continue_session;
		if (continue_session) {
			if (continue_session.constructor === wiki_API) {
				library_namespace.debug(
						'直接傳入了 {wiki_API}；可延續使用上次的後續檢索用索引值，避免重複 loading page。',
						4, 'get_list');
				// usage:
				// options: { continue_session : wiki_API instance ,
				// get_continue : log_to }
				// 注意: 這裡會改變 options！
				// assert: {Object}continue_session.next_mark
				if (continue_from in continue_session.next_mark) {
					// {String}continue_session.next_mark[continue_from]:
					// 後續檢索用索引值。
					options[continue_from] = continue_session.next_mark[continue_from];
					// 經由,經過,通過來源
					library_namespace.info('get_list: continue from ['
							+ options[continue_from] + '] via {wiki_API}');
					// 刪掉標記，避免無窮迴圈。
					delete options.get_continue;
				} else {
					// 設定好 options.get_continue，以進一步從 page 取得後續檢索用索引值。
					if (typeof options.get_continue === 'string')
						// 採用 continue_session 之 domain。
						options.get_continue = [ continue_session.API_URL,
								options.get_continue ];
				}
			} else {
				library_namespace.debug('傳入的不是 {wiki_API}。 ', 4, 'get_list');
				continue_session = undefined;
			}
		}

		// options.get_continue: 用以取用後續檢索用索引值之 title。
		// {String}title || {Array}[ API_URL, title ]
		if (options.get_continue) {
			// 在多人共同編輯的情況下，才需要每次重新 load page。
			get_continue(Array.isArray(options.get_continue)
			//
			? options.get_continue : [ action[0], options.get_continue ], {
				type : type,
				// [KEY_SESSION]
				session : continue_session || options[KEY_SESSION],
				continue_key : (continue_session || options[KEY_SESSION])
				//
				.continue_key,
				callback : function(continuation_data) {
					if (continuation_data = continuation_data[continue_from]) {
						library_namespace.info('get_list: continue from ['
								+ continuation_data + '] via page');
						// 注意: 這裡會改變 options！
						// 刪掉標記，避免無窮迴圈。
						delete options.get_continue;
						// 設定/紀錄後續檢索用索引值，避免無窮迴圈。
						if (continue_session) {
							continue_session.next_mark
							//
							[continue_from] = continuation_data;
						} else {
							options[continue_from] = continuation_data;
						}
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

		if (continue_from = options[continue_from]) {
			library_namespace.debug(type
					+ (title ? ' ' + wiki_API.title_link_of(title) : '')
					+ ': start from ' + continue_from, 2, 'get_list');
		}

		action[1] = action[1] ? '&'
		// allpages 不具有 title。
		+ (parameter === get_list.default_parameter ? prefix : '')
		// 不能設定 wiki_API.query.title_param(action, true)，有些用 title 而不用 titles。
		// e.g., 20150916.Multiple_issues.v2.js
		+ wiki_API.query.title_param(action[1]/* , true, options.is_id */)
				: '';

		if (typeof title_preprocessor === 'function') {
			// title_preprocessor(title_parameter)
			library_namespace.debug('title_parameter: [' + action[1] + ']', 3,
					'get_list');
			action[1] = title_preprocessor(action[1], options);
			library_namespace.debug('→ [' + action[1] + ']', 3, 'get_list');
		}
		// console.trace(action);

		action[1] = 'query&' + parameter + '=' + type + action[1]
		// 處理數目限制 limit。
		// No more than 500 (5,000 for bots) allowed.
		+ (options.limit > 0 || options.limit === 'max'
		// @type integer or 'max'
		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Brevisions
		? '&' + prefix + 'limit=' + options.limit : '')
		// next start from here.
		+ (continue_from ?
		// allpages 的 apcontinue 為 title，需要 encodeURIComponent()。
		'&' + prefix + 'continue='
		// 未處理allpages 的 escape 可能造成 HTTP status 400。
		+ encodeURIComponent(continue_from) : '')
		//
		+ ('namespace' in options
		//
		? '&' + prefix + 'namespace=' + options.namespace : '');

		for ( var parameter in options) {
			if (parameter.startsWith(prefix)) {
				action[1] += '&' + parameter + '='
						+ encodeURIComponent(options[parameter]);
			}
		}

		add_parameters(action, options);

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
		wiki_API.query(action,
		// treat as {Function}callback or {Object}wiki_API.work config.
		function(data, error) {
			// console.log(JSON.stringify(data));
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
			if (!continue_session) {
				continue_session = options[KEY_SESSION];
				// assert: continue_session &&
				// library_namespace.is_Object(continue_session.next_mark)
			}
			if (library_namespace.is_Object(next_index)) {
				pages.next_index = next_index;
				library_namespace.debug(
				//
				'因為 continue_session 可能與作業中之 wiki_API instance 不同，'
				//
				+ '因此需要在本函數 function get_list() 中設定好。', 4, 'get_list');
				// console.log(continue_session);
				if (continue_session) {
					// console.log(continue_session.next_mark);
					// console.log(next_index);
					// console.log(continue_session);
					if ('query-continue' in data) {
						// style of 2014 CE. 例如:
						// {backlinks:{blcontinue:'[0|12]'}}
						for ( var type_index in next_index)
							Object.assign(continue_session.next_mark,
									next_index[type_index]);
					} else {
						// nowadays. e.g.,
						// {continue: { blcontinue: '0|123', continue: '-||' }}
						Object.assign(continue_session.next_mark, next_index);
					}
					library_namespace.debug('next index of ' + type + ': '
							+ continue_session.show_next());
				}
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
			&& ('batchcomplete' in data) && continue_session) {
				// ↑ check "batchcomplete"
				var keyword_continue = get_list.type[type];
				if (keyword_continue) {
					if (Array.isArray(keyword_continue)) {
						keyword_continue = keyword_continue[0];
					}
					// e.g., "cmcontinue"
					keyword_continue += 'continue';
					if (keyword_continue in continue_session.next_mark) {
						library_namespace.debug('去除已經不需要的檢索用索引值。', 3,
								'get_list');
						// needless.
						delete continue_session.next_mark[keyword_continue];
					}
				}
			}

			// 紀錄清單類型。
			// assert: overwrite 之屬性不應該是原先已經存在之屬性。
			pages.list_type = type;
			if (is_api_and_title(title, true)) {
				title = title[1];
			}
			if (wiki_API.is_page_data(title)) {
				title = title.title;
			}
			// 紀錄 title。
			pages.title = title;

			if (!data || !data.query) {
				library_namespace.error('get_list: Unknown response: ['
						+ (typeof data === 'object'
								&& typeof JSON !== 'undefined' ? JSON
								.stringify(data) : data) + ']');
				callback(pages, data);
				return;
			}

			function run_for_each() {
				if (options.abort_operation
						|| typeof options.for_each !== 'function') {
					return;
				}

				// run for each item
				pages.some(function(item) {
					try {
						if (options.for_each.constructor.name
						//
						=== 'AsyncFunction') {
							eval(get_list_async_code);
							// console.log(options);
							return options.abort_operation;
						} else if (wiki_API_list.exit === options
								.for_each(item)) {
							options.abort_operation = true;
							return true;
						}

					} catch (e) {
						library_namespace.error(e);
					}
				});
			}

			/**
			 * for redirects: e.g., <code>

			{"batchcomplete":"","query":{"redirects":[{"from":"Category:言語別分類","to":"Category:言語別"}],"pages":{"1664588":{"pageid":1664588,"ns":14,"title":"Category:言語別","redirects":[{"pageid":4005079,"ns":14,"title":"Category:言語別分類"}]}}},"limits":{"redirects":5000}}

			</code>
			 */
			if (type !== 'redirects' && data.query[type]) {
				// 一般情況。
				if (Array.isArray(data = data.query[type])) {
					pages = Object.assign(data, pages);
				}

				library_namespace.debug(wiki_API.title_link_of(title) + ': '
						+ pages.length + ' page(s)', 2, 'get_list');

				run_for_each();

				// 注意: arguments 與 get_list() 之 callback 連動。
				// 2016/6/22 change API 應用程式介面變更 of callback():
				// (title, titles, pages) → (pages, titles, title)
				// 2019/8/7 change API 應用程式介面變更 of callback():
				// (pages, titles, title) → (pages, error)
				// 按照需求程度編配/編排 arguments。
				// 因為 callback 所欲知最重要的資訊是 pages，因此將 pages 置於第一 argument。
				callback(pages);
				return;
			}

			// console.log(data.query);
			data = data.query.pages;
			for ( var pageid in data) {
				if (pages.length > 0) {
					library_namespace.warn('get_list: More than 1 page got!');
					run_for_each();
					callback(pages, new Error('More than 1 page got!'));
				} else {
					var page = data[pageid];
					if (Array.isArray(page[type])) {
						pages = Object.assign(page[type], pages);
					}

					library_namespace.debug('[' + page.title + ']: '
							+ pages.length + ' page(s)', 1, 'get_list');
					pages.title = page.title;
					run_for_each();
					// 注意: arguments 與 get_list() 之 callback 連動。
					callback(pages);
				}
				return;
			}

			library_namespace.error('get_list: No page got!');
			callback(pages/* , new Error('No page got!') */);

		}, null, options);
	}

	// const: 基本上與程式碼設計合一，僅表示名義，不可更改。
	get_list.default_parameter = 'list';

	/**
	 * All list types MediaWiki supported.
	 * 
	 * @type {Object}
	 * 
	 * @see https://www.mediawiki.org/wiki/API:Lists/All
	 */
	get_list.type = {

		// 'type name' : 'abbreviation 縮寫 / prefix' (parameter :
		// get_list.default_parameter)

		// 按標題排序列出指定的名字空間的頁面 title。
		// 可用來遍歷所有頁面。
		// includes redirection 包含重定向頁面.
		// @see traversal_pages()
		// https://www.mediawiki.org/wiki/API:Allpages
		// 警告: 不在 Wikimedia Toolforge 上執行 allpages 速度太慢。但若在
		// Wikimedia Toolforge，當改用 database。
		allpages : 'ap',

		// https://www.mediawiki.org/wiki/API:Alllinks
		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Balllinks
		alllinks : 'al',

		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Ballusers
		allusers : 'au',

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

		// 取得所有[[w:zh:Wikipedia:嵌入包含]] title 的頁面。 (transclusion, inclusion)
		// 参照読み込み
		// e.g., {{Template name}}, {{/title}}.
		// 設定 title 'Template:tl' 可取得使用指定 Template 的頁面。
		// https://en.wikipedia.org/wiki/Wikipedia:Transclusion
		// https://www.mediawiki.org/wiki/API:Embeddedin
		embeddedin : 'ei',

		// 回傳連結至指定頁面的所有重新導向。 Returns all redirects to the given pages.
		// 転送ページ
		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Bredirects
		// @since 2019/9/11
		redirects : [ 'rd', 'prop', function(title_parameter) {
			return title_parameter.replace(/^&title=/, '&titles=');
		} ],

		// 取得所有使用 file 的頁面。
		// title 必須包括File:前綴。
		// e.g., [[File:title.jpg]].
		// https://www.mediawiki.org/wiki/API:Imageusage
		imageusage : 'iu',

		// 列出在指定分類中的所有頁面。
		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Bcategorymembers
		// @see [[mw:Help:Tracking categories|追蹤分類]]
		categorymembers : [ 'cm', , function(title_parameter) {
			// 要列舉的分類（必需）。必須包括Category:前綴。不能與cmpageid一起使用。
			if (/^&cmtitle=[Cc]ategory%3A/.test(title_parameter))
				return title_parameter;
			return title_parameter.replace(/^&cmtitle=/, '&cmtitle=Category:');
		} ],

		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Brecentchanges
		recentchanges : 'rc',

		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Busercontribs
		// wiki.usercontribs(user_name,function(list){console.log(list);},{limit:80});
		// get new → old
		usercontribs : [ 'uc', , function(title_parameter) {
			return title_parameter.replace(/^&uctitle=/, '&ucuser=');
		} ],

		// 'type name' : [ 'abbreviation 縮寫 / prefix', 'parameter' ]
		// ** 可一次處理多個標題，但可能較耗資源、較慢。

		// TODO
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
		linkshere : [ 'lh', 'prop' ],

		// 取得所有使用 title (e.g., [[File:title.jpg]]) 的頁面。
		// 基本上同 imageusage。
		fileusage : [ 'fu', 'prop' ],

		// TODO: 列舉包含指定 URL 的頁面。 [[Special:LinkSearch]]
		// https://www.mediawiki.org/wiki/API:Exturlusage
		// exturlusage : 'eu',

		// 回傳指定頁面的所有連結。
		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Blinks
		links : [ 'pl', 'prop', function(title_parameter) {
			return title_parameter.replace(/^&title=/, '&titles=');
		} ]
	};

	// ------------------------------------------------------------------------

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

		if (!options.initialized) {
			// console.trace(options);
			if (!options[KEY_SESSION]) {
				options[KEY_SESSION] = new wiki_API;
			}
			if (!options.type) {
				options.type = wiki_API_list.default_type;
			}
			options.initialized = true;
		}

		if (!options.limit)
			options.limit = 'max';

		options.continue_session = options[KEY_SESSION];

		// 注意: arguments 與 get_list() 之 callback 連動。
		options[KEY_SESSION][options.type](target, function(pages, error) {
			library_namespace.debug('Get ' + pages.length + ' ' + options.type
					+ ' pages of ' + pages.title, 2, 'wiki_API_list');
			if (error) {
				console.trace(error);
				pages.error = error;
			}
			if (typeof options.callback === 'function') {
				// options.callback() 為取得每一階段清單時所會被執行的函數。
				// 注意: arguments 與 get_list() 之 callback 連動。
				options.callback(pages, target, options);
			}
			// 設定了 options.for_each 時，callback() 不會傳入 list！
			// 用意在省記憶體。options.for_each() 執行過就不用再記錄了。
			if (Array.isArray(options.pages)) {
				if (!options.for_each || options.get_list) {
					// Array.prototype.push.apply(options.pages, pages);
					options.pages.append(pages);
				} else {
					// Only preserve length property.
					options.pages.length += pages.length;
				}
			} else if (!options.pages) {
				if (!options.for_each || options.get_list) {
				} else {
					// Only preserve length property.
					var length = pages.length;
					pages.truncate();
					pages.length = length;
				}
				options.pages = pages;
			} else if (!pages.error) {
				pages.error = new Error('options.pages has been set up!');
			}

			if (pages.next_index && !options.abort_operation) {
				library_namespace.debug('尚未取得所有清單，因此繼續取得下一階段清單。', 2,
						'wiki_API_list');
				setImmediate(wiki_API_list, target, callback, options);
			} else {
				library_namespace.debug(
						'run callback after all list got or abort operation.',
						2, 'wiki_API_list');
				// console.trace(options.for_each);
				if (!options.for_each) {
					callback(options.pages, target, options);
				} else {
					// `options.for_each` 可能還在執行中，例如正在取得頁面內容；
					// 等到 `options.for_each` 完成之後才執行 callback。
					options[KEY_SESSION].run(callback, options.pages, target,
							options);
				}
			}
		},
		// 引入 options，避免 get_list() 不能確實僅取指定 namespace。
		options);
	}

	// `options.for_each` 設定直接跳出。 `CeL.wiki.list.exit`
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
			wiki_API.prototype[method] = function() {
				// assert: 不可改動 method @ IE！
				var args = [ method ];
				Array.prototype.push.apply(args, arguments);
				try {
					library_namespace.debug('add action: '
							+ args.map(JSON.stringify).join('<br />\n'), 3,
							'wiki_API.prototype.' + method);
				} catch (e) {
					// TODO: handle exception
				}
				this.actions.push(args);
				// TODO: 不應該僅以this.running判定，
				// 因為可能在.next()中呼叫本函數，這時雖然this.running===true，但已經不會再執行。
				if (!this.running
				// 當只剩下剛剛.push()進的operation時，表示已經不會再執行，則還是實行this.next()。
				// TODO: 若是其他執行序會操作this.actions、主動執行this.next()，
				// 或.next()正執行之其他操作會執行this.next()，可能造成重複執行的結果！
				// 2016/11/16 14:45:19 但這方法似乎會提早執行...
				// || this.actions.length === 1
				) {
					this.next();
				} else {
					library_namespace.debug('正在執行中，直接跳出。', 6,
							'wiki_API.prototype.' + method);
				}
				return this;
			};
		});
	})();

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
		if (is_api_and_title(title, 'language', true)) {
			from_lang = title[0];
			title = title[1];
		}
		title = 'query&prop=langlinks&'
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

	// export 導出.

	// wiki_API.list = wiki_API_list;
	// `CeL.wiki.list`
	return wiki_API_list;
}
