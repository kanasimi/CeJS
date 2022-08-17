/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): task control
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * TODO:<code>


</code>
 * 
 * @since 2020/5/24 6:21:13 拆分自 CeL.application.net.wiki
 */

// More examples: see /_test suite/test.js
// Wikipedia bots demo: https://github.com/kanasimi/wikibot
'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.wiki.task',

	require : 'data.native.'
	// for library_namespace.get_URL
	+ '|application.net.Ajax.' + '|application.net.wiki.'
	// load MediaWiki module basic functions
	+ '|application.net.wiki.namespace.',

	// 設定不匯出的子函式。
	no_extend : 'this,*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var wiki_API = library_namespace.application.net.wiki, KEY_SESSION = wiki_API.KEY_SESSION, KEY_CORRESPOND_PAGE = wiki_API.KEY_CORRESPOND_PAGE;
	// @inner
	var is_api_and_title = wiki_API.is_api_and_title, add_session_to_options = wiki_API.add_session_to_options;

	var gettext = library_namespace.cache_gettext(function(_) {
		gettext = _;
	});

	var
	/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
	NOT_FOUND = ''.indexOf('_');

	// ------------------------------------------------------------------------

	// get_data_key(), get_data_page()
	function get_wikibase_key(id) {
		if (!id)
			return;
		if (id[KEY_CORRESPOND_PAGE])
			id = id[KEY_CORRESPOND_PAGE];
		return id.site && id.title && id;
	}

	// check if session.last_data is usable, 非過期資料。
	function last_data_is_usable(session) {
		// When "servers are currently under maintenance", session.last_data is
		// a string.
		if (typeof session.last_data === 'object' && !session.last_data.error
		// 若是session.last_data與session.last_page連動，必須先確認是否沒變更過session.last_page，才能當作cache、跳過重新擷取entity之作業。
		&& (!(KEY_CORRESPOND_PAGE in session.last_data)
		// assert:
		// wiki_API.is_page_data(session.last_data[KEY_CORRESPOND_PAGE])
		|| session.last_page === session.last_data[KEY_CORRESPOND_PAGE])) {
			library_namespace.debug('Use cached data: [['
			//
			+ (KEY_CORRESPOND_PAGE in session.last_data
			// may use wiki_API.title_link_of()
			? session.last_page.id : session.last_data.id) + ']]', 1,
					'last_data_is_usable');
			return true;
		}
	}

	// --------------------------------------------------------------------------------------------
	// instance 實例相關函數。

	/**
	 * Register promise relying on wiki session actions. 設定依賴於本 wiki_API action
	 * 的 promise。
	 * 
	 * @param promise
	 *            promise to set
	 * 
	 * @example session.set_promise_relying(result);
	 */
	wiki_API.prototype.set_promise_relying = function set_promise_relying(
			promise) {
		// Promise.isPromise()
		if (library_namespace.is_thenable(promise)
		// no rely on wiki_API
		// && !promise.not_relying_on_wiki_API
		) {
			// assert: promise 依賴於本 wiki_API action thread。
			library_namespace.debug('設定依賴於本 wiki_API action 的 promise。', 3,
					'set_promise_relying');
			// console.trace(promise);
			// console.trace([this.running,this.actions]);
			this.actions.promise_relying = library_namespace
					.is_thenable(this.actions.promise_relying) ? this.actions.promise_relying
					.then(promise)
					: promise;
			return true;
		}
	};

	wiki_API.prototype.test_promise_relying = function test_promise_relying() {
		// this.actions.promise_relying is relying on this action.
		// 為了偵測這些promise是否已fulfilled，必須先this.running，預防其他執行緒鑽空隙。

		this.running = true;

		var _this = this;
		function status_of_thenable(fulfilled, this_thenable) {
			if (this_thenable !== _this.actions.promise_relying) {
				library_namespace.debug(
						'有其他執行緒鑽空隙，執行了 .set_promise_relying()。需要再檢測一次。', 3,
						'test_promise_relying');
				_this.test_promise_relying();
				return;
			}

			if (fulfilled) {
				delete _this.actions.promise_relying;
				if (0 < _this.actions.length) {
					// assert: other threads added _this.actions
					// after library_namespace.status_of_thenable()
					library_namespace.debug('有其他執行緒鑽空隙，設定了 .actions。', 3,
							'test_promise_relying');
					_this.next();
				} else {
					library_namespace
							.debug(
									'依賴於本 wiki_API action 的 promise 皆已 fulfilled。本 action 結束。',
									3, 'test_promise_relying');
					_this.running = false;
				}
				return;
			}

			// incase session.next() will wait for this.actions.promise_relying
			// calling back if CeL.is_thenable(result).
			// e.g., await wiki.for_each_page(need_check_redirected_list,
			// ... @ 20200122.update_vital_articles.js
			// So we need to run `session.next()` manually.

			// await wiki.for_each_page(need_check_redirected_list,
			// ... @ 20200122.update_vital_articles.js:
			// 從 function work_page_callback() return 之後，會回到 function
			// wiki_API_edit()。
			// `this_thenable` 會等待 push 進 session.actions 的
			// this.page(this_slice, main_work, page_options)，
			// 但 return 的話，會保持 session.running === true &&
			// session.actions.length > 0
			// 並且 abort。執行不到 this_thenable.then()。

			if (0 < _this.actions.length) {
				// 有些 promise 依賴於本 wiki_API action，假如停下來的話將會導致直接 exit跳出。
				if (false) {
					console
							.trace('test_promise_relying: Calling wiki_API.prototype.next() '
									+ [ _this.running, _this.actions.length ]);
				}
				_this.next();
			} else {
				if (false) {
					console.trace('test_promise_relying: No .actions left! '
							+ [ _this.running, _this.actions.length ]);
				}
				// delete _this.actions.promise_relying;
				_this.running = false;
			}
		}

		library_namespace.status_of_thenable(this.actions.promise_relying,
				status_of_thenable);
	};

	// @inner
	wiki_API.KEY_waiting_callback_result_relying_on_this = typeof Symbol === 'function' ? Symbol('waiting callback_result_relying_on_this')
			: '\0waiting callback_result_relying_on_this';

	/**
	 * 設定工作/添加新的工作。
	 * 
	 * 注意: 每個 callback 皆應在最後執行 session.next()。
	 * 
	 * 警告: 若 callback throw，可能導致工作中斷，不會自動復原，得要以 wiki.next() 重起工作。
	 * 
	 * 工作原理: 每個實體會hold住一個queue ({Array}this.actions)。 當設定工作時，就把工作推入佇列中。
	 * 另外內部會有另一個行程負責依序執行每一個工作。
	 * 
	 * @see wiki_API_prototype_method() @ CeL.application.net.wiki.list
	 */
	wiki_API.prototype.next = function next(callback_result_relying_on_this) {
		if (this.actions[wiki_API.KEY_waiting_callback_result_relying_on_this]) {
			// assert: 此時為 session.next() 中執行 callback。

			// callback_result_relying_on_this 執行中應該只能 push 進
			// session.actions，不可執行 session.next()!

			// e.g., 'edit_structured_data' 之 callback 直接採用
			// _this.next(next[4], data, error);
			// 若 next[4] 會再次 call session.edit_structured_data()，
			// 可能造成執行 callback_result_relying_on_this 後，
			// 到 'structured_data' 跳出準備 wiki_API.data()，
			// 回到 callback_result_relying_on_this 主程序
			// 就直接跑到 'edit_structured_data' 這邊來，結果選了錯誤的 this.last_page。
			// e.g., check_structured_data() @ CeL.application.net.wiki.edit

			callback_result_relying_on_this = Array.prototype.slice
					.call(arguments);
			callback_result_relying_on_this.unshift('run');
			this.actions.push(callback_result_relying_on_this);

			library_namespace
					.debug(
							'在 callback_result_relying_on_this 中 call this.next() 並且 waiting callback 而跳出。為避免造成多執行序，將執行權交予 call callback_result_relying_on_this() 之母執行序，子執行序這邊跳出。',
							1, 'wiki_API.prototype.next');
			// console.trace(this.actions.length);
			return;
		}

		if (typeof callback_result_relying_on_this === 'function') {
			this.actions[wiki_API.KEY_waiting_callback_result_relying_on_this] = true;

			// console.trace(Array.prototype.slice.call(arguments, 1));
			try {
				callback_result_relying_on_this = callback_result_relying_on_this
				// this.next(callback, ...callback_arguments);
				.apply(this, Array.prototype.slice.call(arguments, 1));
			} catch (e) {
				if (library_namespace.env.has_console)
					console.error(e);
				else
					library_namespace.error(e);
			}

			delete this.actions[wiki_API.KEY_waiting_callback_result_relying_on_this];
		}

		if (callback_result_relying_on_this) {
			this.set_promise_relying(callback_result_relying_on_this);
			// reset
			callback_result_relying_on_this = null;
		}
		// assert: false ===
		// library_namespace.is_thenable(callback_result_relying_on_this)

		// ------------------------------------------------------------------------------

		this.running = 0 < this.actions.length;
		if (!this.running) {
			if (library_namespace.is_thenable(this.actions.promise_relying)) {
				this.test_promise_relying();
			} else {
				// this.thread_count = 0;
				// delete this.current_action;
				library_namespace.debug('The queue is empty.', 2,
						'wiki_API.prototype.next');
				// console.trace(this.actions);
			}
			return;
		}

		// 繼續執行接下來的行動。

		// ------------------------------------------------

		library_namespace.debug('剩餘 ' + this.actions.length + ' action(s)', 2,
				'wiki_API.prototype.next');
		if (library_namespace.is_debug(3)
		// .show_value() @ interact.DOM, application.debug
		&& library_namespace.show_value)
			library_namespace.show_value(this.actions.slice(0, 10));
		var next = this.actions.shift();
		// 不改動 next。
		var type = next[0], list_type;
		if (// type in get_list.type
		wiki_API.list.type_list.includes(type)) {
			list_type = type;
			type = 'list';
		}
		// this.current_action = next;

		if (library_namespace.is_debug(3)) {
			library_namespace.debug(
			//
			'處理 ' + (this.token.lgname ? this.token.lgname + ' ' : '') + '['
			//
			+ next.map(function(arg) {
				// for function
				var message;
				if (arg && arg.toString) {
					message = arg.toString();
				} else {
					try {
						message = JSON.stringify(arg);
					} catch (e) {
						// message = String(arg);
						message = library_namespace.is_type(arg);
					}
				}
				return message && message.slice(0, 80);
			}) + ']', 1, 'wiki_API.prototype.next');
		}

		// ------------------------------------------------

		var _this = this;

		// 若需改變，需同步更改 wiki_API.prototype.next.methods
		switch (type) {

		// setup options

		case 'set_URL':
			// next[1] : callback
			wiki_API.setup_API_URL(this /* session */, next[1]);
			this.next();
			break;

		case 'set_language':
			// next[1] : callback
			wiki_API.setup_API_language(this /* session */, next[1]);
			this.next();
			break;

		case 'set_data':
			// 設定 this.data_session。
			// using @inner
			// setup_data_session(session, callback, API_URL, password, force)
			wiki_API.setup_data_session(this /* session */,
			// 確保 data_session login 了才執行下一步。
			function() {
				// console.trace(_this);
				// console.trace(_this.data_session);
				// next[1] : callback of set_data
				_this.next(next[1]);
			}, next[2], next[3], next[4]);
			break;

		// ------------------------------------------------
		// account

		case 'login':
			library_namespace.debug(
					'正 log in 中，當 login 後，會自動執行 .next()，處理餘下的工作。', 2,
					'wiki_API.prototype.next');
			// rollback
			this.actions.unshift(next);
			break;

		case 'logout':
			// 結束
			// next[1] : callback
			wiki_API.logout(this /* session */, next[1]);
			// this.next();
			break;

		// ------------------------------------------------
		// page access

		case 'query':
			console.trace('use query');
			throw new Error('Please use .query_API() instead of only .query()!');
			library_namespace
					.error('Please use .query_API() instead of only .query()!');
		case 'query_API':
			// wiki_API.query(post_data, callback, options)
			if (next[4] === undefined && library_namespace.is_Object(next[3])
					&& next[3].post_data_only) {
				// shift arguments
				next[4] = next[3];
				next[3] = next[1];
				next[1] = '';
			}

			// wiki_API.query(action, callback, post_data, options)
			wiki_API.query(next[1], function query_API_callback(data, error) {
				// 再設定一次，預防有執行期中間再執行的情況。
				// e.g., wiki.query_api(action,function(){wiki.page();})
				// 注意: 這動作應該放在callback()執行完後設定。
				// next[2] : callback
				_this.next(next[2], data, error);
			}, next[3],
			// next[4] : options
			add_session_to_options(this, next[4]));
			break;

		case 'siteinfo':
			// wiki.siteinfo(options, callback)
			// wiki.siteinfo(callback)
			if (typeof next[1] === 'function' && !next[2]) {
				// next[1] : callback
				next[2] = next[1];
				next[1] = null;
			}

			wiki_API.siteinfo(add_session_to_options(this, next[1]), function(
					data, error) {
				// next[2] : callback
				// run next action
				_this.next(next[2], data, error);
			});
			break;

		case 'page':
			// console.trace(next);
			// this.page(page data, callback, options);
			if (library_namespace.is_Object(next[2]) && !next[3]) {
				// 直接輸入 options，未輸入 callback。
				next.splice(2, 0, null);
			}

			// → 此法會採用所輸入之 page data 作為 this.last_page，不再重新擷取 page。
			if (wiki_API.is_page_data(next[1])
			// 必須有頁面內容，要不可能僅有資訊。有時可能已經擷取過卻發生錯誤而沒有頁面內容，此時依然會再擷取一次。
			&& (wiki_API.content_of.has_content(next[1])
			// 除非剛剛才取得，同一個執行緒中不需要再度取得內容。
			|| next[3] && next[3].allow_missing
			// 確認真的是不存在的頁面。預防一次擷取的頁面內容太多，或者其他出錯情況，實際上沒能成功取得頁面內容，
			// next[1].revisions:[]
			&& ('missing' in next[1]))) {
				library_namespace.debug('採用所輸入之 '
						+ wiki_API.title_link_of(next[1])
						+ ' 作為 this.last_page。', 2, 'wiki_API.prototype.next');
				this.last_page = next[1];
				// console.trace(next[1]);
				// next[2] : callback
				this.next(next[2], next[1]);
				break;
			}

			// ----------------------------------

			if (typeof next[1] === 'function') {
				// this.page(callback): callback(last_page)
				// next[1] : callback
				this.next(next[1], this.last_page);
				break;
			}

			// ----------------------------------

			if (false) {
				console.trace(_this.thread_count + '/' + _this.actions.length
						+ 'actions: '
						+ _this.actions.slice(0, 9).map(function(action) {
							return action[0];
						}));
				// console.log(next);
			}

			// 準備擷取新的頁面。為了預防舊的頁面資料被誤用，因此將此將其刪除。
			// 例如在 .edit() 的callback中再呼叫 .edit():
			// wiki.page().edit(,()=>wiki.page().edit(,))
			delete this.last_page;

			// this.page(title, callback, options)
			// next[1] : title
			// next[3] : options
			// [ {String}API_URL, {String}title or {Object}page_data ]
			wiki_API.page(is_api_and_title(next[1]) ? next[1] : [ this.API_URL,
					next[1] ],
			//
			function wiki_API_next_page_callback(page_data, error) {
				if (false) {
					if (Array.isArray(page_data)) {
						console.trace(page_data.length
								+ ' pages get: '
								+ page_data.slice(0, 10).map(
										function(page_data) {
											return page_data.title;
										}));
					} else {
						console.trace([ page_data, error ]);
					}
				}
				// assert: 當錯誤發生，例如頁面不存在/已刪除，依然需要模擬出 page_data。
				// 如此才能執行 .page().edit()。
				_this.last_page
				// 正常情況。確保this.last_page為單頁面。需要使用callback以取得result。
				= Array.isArray(page_data) ? page_data[0] : page_data;
				// console.trace(next[2] + '', page_data, error);
				// console.trace(_this.actions);
				// next[2] : callback
				_this.next(next[2], page_data, error);
			},
			// next[3] : options
			add_session_to_options(this, next[3]));
			break;

		case 'tracking_revisions':
			if (typeof next[3] === 'object') {
				// shift arguments
				next[4] = next[3];
				next[3] = null;
			}
			wiki_API.tracking_revisions(next[1], next[2], function(revision,
					error) {
				_this.next(next[3], revision, error);
			},
			// next[4] : options
			add_session_to_options(this, next[4]));
			break;

		case 'parse':
			// e.g., wiki.page('title', options).parse(callback, options);
			if (library_namespace.is_Object(next[1]) && !next[2]) {
				// 直接輸入 options，未輸入 callback。
				next.splice(1, 0, null);
			}

			// next[2] : options
			var parsed = wiki_API.parser(this.last_page,
					add_session_to_options(this, next[2])).parse();
			// next[3] : callback
			this.next(next[1], parsed);
			break;

		case 'purge':
			if (typeof next[1] === 'string' || typeof next[1] === 'number') {
				// purge() 可以直接輸入頁面，不必先 .page('Title')
				// wiki.purge('Title', callback, options)
				// wiki.purge('Title', options)
				// wiki.purge(pageid, callback, options)
				// wiki.purge('pageid|pageid', options)
			} else {
				// wiki.page('Title').purge()
				// wiki.page('Title').purge(callback, options)
				// wiki.page('Title').purge(options)
				next.splice(1, 0, this.last_page);
			}

			if (library_namespace.is_Object(next[2]) && !next[3]) {
				// 直接輸入 options，未輸入 callback。
				next.splice(2, 0, null);
			}

			// next: [ 'purge', pages, callback, options ]

			if (!next[1]) {
				library_namespace
						.warn('wiki_API.prototype.next.purge: No page inputed!');
				// next[3] : callback
				this.next(next[3], undefined, 'no page');

			} else {
				wiki_API.purge([ this.API_URL, next[1] ],
				//
				function wiki_API_next_purge_callback(purge_pages, error) {
					// next[2] : callback
					_this.next(next[2], purge_pages, error);
				},
				// next[3] : options
				add_session_to_options(this, next[3]));
			}
			break;

		case 'redirect_to':
			// this.redirect_to(page data, callback, options);
			if (library_namespace.is_Object(next[2]) && !next[3]) {
				// 直接輸入 options，未輸入 callback。
				next.splice(2, 0, null);
			}

			// this.redirect_to(title, callback, options)
			// next[1] : title
			// next[3] : options
			// [ {String}API_URL, {String}title or {Object}page_data ]
			wiki_API.redirect_to(is_api_and_title(next[1]) ? next[1] : [
					this.API_URL, next[1] ],
			//
			function wiki_API_next_redirect_to_callback(redirect_data,
					page_data, error) {
				// next[2] : callback
				_this.next(next[2], redirect_data, page_data, error);
			},
			// next[3] : options
			add_session_to_options(this, next[3]));
			break;

		case 'list':
			// get_list(). e.g., 反向連結/連入頁面。

			// next[1] : 大部分是 page title,
			// 但因為有些方法不需要用到頁面標題(recentchanges,allusers)因此對於這一些方法需要特別處理。
			if (typeof next[1] === 'function' && typeof next[2] !== 'function') {
				next.splice(1, 0, '');
			}

			// 注意: arguments 與 get_list() 之 callback 連動。
			wiki_API[list_type]([ this.API_URL, next[1] ],
			//
			function wiki_API_next_list_callback(pages, error) {
				// [ page_data ]
				_this.last_pages = pages;

				if (typeof next[2] === 'function') {
					// 注意: arguments 與 get_list() 之 callback 連動。
					callback_result_relying_on_this
					// next[2] : callback(pages, error)
					= next[2].call(_this, pages, error);
				} else if (next[2] && next[2].each) {
					// next[2] : 當作 work，處理積存工作。
					if (pages) {
						_this.work(next[2]);
					} else {
						// 只有在本次有處理頁面時，才繼續下去。
						library_namespace.info('無頁面可處理（已完成？），中斷跳出。');
					}
				}

				_this.next(callback_result_relying_on_this);
			},
			// next[3] : options
			add_session_to_options(this, next[3]));
			break;

		// case 'category_tree':
		// @see wiki_API.prototype.category_tree @ application.net.wiki.list

		// register page alias. usually used for templates
		case 'register_redirects':
			// wiki.register_redirects(page_title_list, callback, options)
			// wiki.register_redirects(page_title_list, options)
			if (library_namespace.is_Object(next[2]) && !next[3]) {
				// 未設定/不設定 callback
				// shift arguments
				next.splice(2, 0, undefined);
			}

			// next[3] : options
			next[3] = Object.assign({
				// [KEY_SESSION]
				session : this,
				// Making .redirect_list[0] the redirect target.
				include_root : true,
				// converttitles: 1,
				// multiple pages
				multi : Array.isArray(next[1]) && next[1].length > 1
			}, next[3]);

			// next[1]: page_title
			if (next[3].namespace)
				next[1] = this.to_namespace(next[1], next[3].namespace);
			next[1] = this.normalize_title(next[1]);

			if (next[3].reget) {
			} else if (Array.isArray(next[1])) {
				next[1] = next[1].filter(function(page_title) {
					return !(page_title in _this.redirects_data);
				}).unique();
				if (next[1].length === 0) {
					// next[2] : callback(root_page_data, error)
					this.next(next[2]);
					break;
				}

			} else if (next[1] in this.redirects_data) {
				// 已處理過。
				// have registered
				// next[2] : callback(root_page_data, error)
				this.next(next[2]);
				break;
			}

			if (Array.isArray(next[1])) {
				// next[3] : options
				var slice_size = next[3].one_by_one ? 1
				// 50: 避免 HTTP status 414: Request-URI Too Long
				: next[3].slice_size >= 1 ? Math.min(50, next[3].slice_size)
						: 50;
				while (next[1].length > slice_size) {
					_this.actions.unshift([ next[0],
					// keep request order
					slice_size === 1 ? next[1].pop()
					//
					: next[1].splice(next[1].length - slice_size, slice_size),
							next[2], next[3] ]);
					// remove callback: only run callback at the latest
					// time.
					next[2] = undefined;
				}
			}

			// console.trace(JSON.stringify(next[1]));
			// 解析出所有 next[1] 別名
			// next[1]: page_title
			wiki_API.redirects_here(next[1], function(root_page_data,
					redirect_list, error) {
				if (error) {
					// next[2] : callback(root_page_data, error)
					_this.next(next[2], null, error);
					return;
				}

				if (false) {
					console.trace(root_page_data);
					console.trace(redirect_list);
					console.assert(!redirect_list
							|| redirect_list === root_page_data.redirect_list);
				}

				var registered_page_list = Array.isArray(next[1]) ? next[1]
						: [ next[1] ];
				// from: alias, to: 正式名稱
				function register_title(from, to) {
					if (!from
					// || (from in _this.redirects_data)
					) {
						return;
					}
					// assert: from ===
					// _this.normalize_title(from)
					// the namespace of from, to is normalized
					_this.redirects_data[from] = to;
					registered_page_list.push(from);
				}
				function register_root_alias(page_data) {
					if (page_data.original_title) {
						// console.trace(page_data);
						register_title(page_data.original_title,
						//
						page_data.title);
					}
					if (page_data.redirect_from) {
						register_title(page_data.redirect_from,
						//
						page_data.title);
					}
				}
				function register_redirect_list(redirect_list, page_title) {
					// console.trace(redirect_list);
					// 本名
					var target_page_title = redirect_list[0].title;
					var is_missing = !target_page_title
							|| ('missing' in redirect_list[0])
							|| ('invalid' in redirect_list[0]);
					if (!is_missing) {
						redirect_list.forEach(function(page_data) {
							register_title(page_data.title, target_page_title);
						});
					}

					if (next[3].no_message) {
						return;
					}

					var message = 'register_redirects: '
							+ (page_title === target_page_title ? ''
									: (wiki_API.title_link_of(page_title)
									// JSON.stringify(page_title)
									// Should not go to here
									|| page_title) + ' → ')
							+ wiki_API.title_link_of(target_page_title) + ': ';

					if (is_missing) {
						message += 'Missing';
						library_namespace.warn(message);
						return;
					}

					message += gettext(redirect_list.length === 1
					// gettext_config:{"id":"no-page-redirects-to-this-page"}
					? '無頁面重定向至本頁'
					// gettext_config:{"id":"total-$1-pages-redirected-to-this-page"}
					: '共有%1個{{PLURAL:%1|頁面}}重定向至本頁', redirect_list.length - 1);
					if (1 < redirect_list.length && redirect_list.length < 6) {
						message += ': '
						//
						+ redirect_list.slice(1).map(function(page_data) {
							// return page_data.title;
							return wiki_API.title_link_of(page_data);
						}).join(gettext('Comma-separator'));
					}
					library_namespace.info(message);
				}

				if (redirect_list) {
					// e.g., wiki_API.redirects_here({String})
					// console.trace([ next[1], root_page_data ]);
					register_redirect_list(redirect_list,
					//
					Array.isArray(next[1]) ?
					// assert: next[1].length === 1
					next[1][0] : next[1]);
					register_root_alias(root_page_data);
				} else {
					// e.g., wiki_API.redirects_here({Array})
					root_page_data.forEach(function(page_data) {
						// console.trace(page_data.redirect_list);
						// console.trace(page_data.original_title);
						register_redirect_list(page_data.redirect_list
								|| [ page_data ], page_data.original_title
								|| page_data.title);
						register_root_alias(page_data);
					});
				}

				// console.trace(_this.redirects_data);

				if (false) {
					console.trace([ next[3].no_languagevariants,
							!_this.has_languagevariants ]);
				}
				if (next[3].no_languagevariants || !_this.has_languagevariants
				// /[\u4e00-\u9fa5]/: 匹配中文。
				// https://en.wikipedia.org/wiki/CJK_Unified_Ideographs_(Unicode_block)
				// || !/[\u4e00-\u9fa5]/.test(next[1])
				) {
					// next[2] : callback(root_page_data, error)
					_this.next(next[2], root_page_data);
					return;
				}

				// 處理 converttitles。
				// console.trace('處理繁簡轉換問題: ' + registered_page_list);
				// console.trace(root_page_data);
				// console.trace(JSON.stringify(_this.redirects_data));
				function register_redirect_list_via_mapper(original_list,
						list_to_map) {
					// console.trace(next[3].uselang + ': ' + list_to_map);
					list_to_map.forEach(function(map_from, index) {
						// if (map_from in _this.redirects_data) return;
						var map_to
						//
						= _this.redirects_data[original_list[index]];
						// console.log(map_from + ' → ' + map_to);
						_this.redirects_data[map_from] = map_to;
					});
				}

				// next[3] : options
				next[3].uselang = 'zh-hant';
				wiki_API.convert_Chinese(registered_page_list, function(
						converted_hant) {
					register_redirect_list_via_mapper(registered_page_list,
							converted_hant);
					next[3].uselang = 'zh-hans';
					wiki_API.convert_Chinese(registered_page_list, function(
							converted_hans) {
						register_redirect_list_via_mapper(registered_page_list,
								converted_hans);
						_this.next(next[2], root_page_data);
					}, next[3]);
				}, next[3]);
			},
			// next[3] : options
			next[3]);
			break;

		case 'search':
			if (!next[3])
				next[3] = Object.create(null);
			if (!next[3].next_mark)
				next[3].next_mark = Object.create(null);

			wiki_API.search([ this.API_URL, next[1] ],
			//
			function wiki_API_search_callback(pages, error) {
				// undefined || [ page_data ]
				_this.last_pages = pages;
				// 設定/紀錄後續檢索用索引值。
				// 若是將錯誤的改正之後，應該重新自 offset 0 開始 search。
				// 因此這種情況下基本上不應該使用此值。
				if (pages && pages.sroffset) {
					next[3].next_mark.sroffset = pages.sroffset;
				}

				if (typeof next[2] === 'function') {
					callback_result_relying_on_this
					// next[2] : callback(...)
					= next[2].call(_this, pages || [], error);
				} else if (next[2] && next[2].each) {
					// next[2] : 當作 work，處理積存工作。
					// next[2].each(page_data, messages, config)
					_this.work(next[2]);
				}

				_this.next(callback_result_relying_on_this);
			},
			// next[3] : options
			add_session_to_options(this, next[3]));
			break;

		case 'copy_from':
			// Will soon stop after break.
			this.running = false;
			// `wiki_API_prototype_copy_from`
			wiki_API.edit.copy_from.apply(this, next.slice(1));
			// TODO: callback: this.next();
			break;

		case 'download':
			// Will soon stop after break.
			this.running = false;
			wiki_API.download.apply(this, next.slice(1));
			break;

		// ----------------------------------------------------------------------------------------

		case 'check':
			// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
			next[1] = library_namespace.new_options(this.check_options,
			// next[1]: options
			typeof next[1] === 'boolean' ? {
				force : next[1]
			} : typeof options === 'string' ? {
				title : next[1]
			} : next[1]);

			// ('stopped' in this): 已經有 cache。
			if (this.checking_now || ('stopped' in this)
			// force to check
			&& !next[1].force) {
				if (this.checking_now) {
					library_namespace.debug('checking now...', 3,
							'wiki_API.prototype.next');
				} else {
					library_namespace.debug('Skip check_stop().', 1,
							'wiki_API.prototype.next');
				}
				// 在多執行緒的情況下，避免 `RangeError: Maximum call stack size exceeded`。
				// next[2] : callback(...)
				setTimeout(this.next.bind(this, next[2], this.stopped), 0);

			} else {
				// 僅檢測一次。在多執行緒的情況下，可能遇上檢測多次的情況。
				this.checking_now = next[1].title || true;

				library_namespace.debug('以 .check_stop() 檢查與設定是否須停止編輯作業。', 1,
						'wiki_API.prototype.next');
				library_namespace
						.debug('Using options to call check_stop(): '
								+ JSON.stringify(next[1]), 2,
								'wiki_API.prototype.next');
				next[1].token = this.token;
				// 正作業中之 wiki_API instance。
				next[1][KEY_SESSION] = this;
				wiki_API.check_stop(function(stopped) {
					delete _this.checking_now;
					library_namespace.debug('check_stop: ' + stopped, 1,
							'wiki_API.prototype.next');
					_this.stopped = stopped;
					// next[2] : callback(...)
					_this.next(next[2], stopped);
				},
				// next[1] : options
				next[1]);
			}
			break;

		case 'edit':
			// wiki.edit(page contents, options, callback)
			if (typeof next[2] === 'string') {
				// wiki.edit(page contents, summary, callback)
				next[2] = {
					summary : next[2]
				};
			}

			// console.trace(next, this.last_page);

			// 在多執行緒的情況下，例如下面
			// `next[1] = next[1].call(next[2], next[2].page_to_edit)`
			// 的時候，this.last_page 可能會被改變，因此先作個 cache。
			// next[2]: options
			// console.trace(next[2]);
			next[2] = library_namespace.setup_options(next[2]);
			// `next[2].page_to_edit`: 手動指定要編輯的頁面。
			if (!next[2].page_to_edit) {
				// console.trace([ next, this.last_page ]);
				// e.g., page 本身是非法的頁面標題。當 session.page() 出錯時，將導致沒有 .last_page。
				next[2].page_to_edit = this.last_page || next[2].task_page_data;
				// console.trace(next[2]);
			}
			// console.trace(next[2]);
			// console.trace(next);

			// TODO: {String|RegExp|Array}filter

			if (false && next[2].page_to_edit !== this.last_page) {
				console.trace('session.edit: '
						+ (next[2].page_to_edit && next[2].page_to_edit.title));
				console.log('last_page: '
						+ (this.last_page && this.last_page.title));
			}

			if (!next[2].page_to_edit) {
				library_namespace
						.warn('wiki_API.prototype.next: No page in the queue. You must run .page() first! 另請注意: 您不能在 callback 中呼叫 .edit() 之類的 wiki 函數！請在 callback 執行完畢後再執行新的 wiki 函數！例如放在 setTimeout() 中。');
				// console.trace([ this.actions.length, next ]);
				// next[3] : callback
				this.next(next[3], undefined, 'no page');
				break;
			}
			// assert: wiki_API.is_page_data(next[2].page_to_edit)

			if (typeof next[1] !== 'string'
			// @see check_and_delete_revisions
			&& next[2] && next[2].section !== 'new'
			//
			&& !wiki_API.content_of.had_fetch_content(next[2].page_to_edit)) {
				console.log(next);
				throw new Error(
						'wiki_API.prototype.next: There are multiple threads competing with each other? 有多個執行緒互相競爭？');
				library_namespace
						.warn('wiki_API.prototype.next: 有多個執行緒互相競爭？本執行緒將會直接跳出，等待另一個取得頁面內容的執行緒完成後，由其處理。');
				console.trace(next);
				break;
			}

			var check_and_delete_revisions = function() {
				if (!next[2].page_to_edit)
					return;
				var next_action = _this.actions[0];
				if (next_action && next_action[0] === 'edit'
				// 明確指定內容時，只要知道標題即可，不必特地檢查是否有內容。
				&& typeof next_action[1] !== 'string'
				//
				&& next_action[2] && next_action[2].section !== 'new'
				//
				&& next[2].page_to_edit === next_action[2].page_to_edit) {
					// assert: wiki.page().edit().edit()
					// e.g., 20160906.archive_moegirl.js
					// Should reget page
					_this.actions
							.unshift([ 'page', next_action[2].page_to_edit ]);
				}
				// 因為已經更動過內容，為了預防 this.last_page 取得已修改過的錯誤資料，因此將之刪除。但留下標題資訊。
				delete next[2].page_to_edit.revisions;
				// 預防連續編輯採用相同編輯選項。 var edit_options;
				// wiki.page(A).edit(,edit_options);
				// wiki.page(B).edit(,edit_options);
				delete next[2].page_to_edit;
			};

			if (!('stopped' in this)) {
				library_namespace.debug(
						'edit: rollback, check if need stop 緊急停止.', 2,
						'wiki_API.prototype.next');
				this.actions.unshift([ 'check', null, function() {
					library_namespace.debug(
					//
					'edit: recover next[2].page_to_edit: '
					//
					+ wiki_API.title_link_of(next[2].page_to_edit) + '.',
					//
					2, 'wiki_API.prototype.next');
					// _this.last_page = next[2].page_to_edit;
				} ], next);
				this.next();
				break;
			}

			if (this.stopped && !next[2].skip_stopped) {
				library_namespace.warn('wiki_API.prototype.next: 已停止作業，放棄編輯'
						+ wiki_API.title_link_of(next[2].page_to_edit) + '！');
				// next[3] : callback
				this.next(next[3], next[2].page_to_edit.title, '已停止作業');
				break;
			}

			if (next[2].page_to_edit.is_Flow) {
				// next[2]: options to call edit_topic()=CeL.wiki.Flow.edit
				// .section: 章節編號。 0 代表最上層章節，new 代表新章節。
				if (next[2].section !== 'new') {
					library_namespace
							.warn('wiki_API.prototype.next: The page to edit is Flow. I cannot edit it directly: '
									+ wiki_API
											.title_link_of(next[2].page_to_edit));
					// next[3] : callback
					this.next(next[3],
					// 2017/9/18 Flow已被重新定義為結構化討論 / 結構式討論。
					// is [[mw:Structured Discussions]].
					next[2].page_to_edit.title, 'is Flow');
					break;
				}

				if (!next[2].page_to_edit.header) {
					// rollback
					this.actions.unshift(next);
					// 先取得關於討論板的描述。以此為依據，檢測頁面是否允許機器人帳戶訪問。
					// Flow_page()
					wiki_API.Flow.page(next[2].page_to_edit, function() {
						// next[3] : callback
						if (typeof next[3] === 'function')
							callback_result_relying_on_this = next[3].call(
									this, next[2].page_to_edit.title);
						check_and_delete_revisions();
						_this.next(callback_result_relying_on_this);
					}, {
						flow_view : 'header',
						// [KEY_SESSION]
						session : this
					});
					break;
				}

				if ((!next[2] || !next[2].ignore_denial)
						&& wiki_API.edit.denied(next[2].page_to_edit,
								this.token.login_user_name, next[2]
										&& next[2].notification_name)) {
					// {{bot}} support for flow page
					// 採用 next[2].page_to_edit 的方法，
					// 在 multithreading 下可能因其他 threading 插入而造成問題，須注意！
					library_namespace
							.warn('wiki_API.prototype.next: Denied to edit flow '
									+ wiki_API
											.title_link_of(next[2].page_to_edit));
					// next[3] : callback
					this.next(next[3], next[2].page_to_edit.title, 'denied');
					break;
				}

				library_namespace.debug('直接採用 Flow 的方式增添新話題。');
				// use/get the contents of next[2].page_to_edit
				if (typeof next[1] === 'function') {
					// next[1] =
					// next[1](wiki_API.content_of(next[2].page_to_edit),
					// next[2].page_to_edit.title, next[2].page_to_edit);
					// 需要同時改變 wiki_API.edit！
					// next[2]: options to call
					// edit_topic()=CeL.wiki.Flow.edit
					// .call(options,): 使(回傳要編輯資料的)設定值函數能以this即時變更 options。
					next[1] = next[1].call(next[2], next[2].page_to_edit);
				}

				// edit_topic()
				wiki_API.Flow.edit([ this.API_URL, next[2].page_to_edit ],
				// 新章節/新話題的標題文字。輸入空字串""的話，會用 summary 當章節標題。
				next[2].sectiontitle,
				// 新話題最初的內容。因為已有 contents，直接餵給轉換函式。
				// [[mw:Flow]] 會自動簽名，因此去掉簽名部分。
				next[1].replace(/[\s\n\-]*~~~~[\s\n\-]*$/, ''),
				//
				this.token,
				// next[2]: options to call edit_topic()=CeL.wiki.Flow.edit
				add_session_to_options(this, next[2]), function(title, error,
						result) {
					// next[3] : callback
					if (typeof next[3] === 'function')
						callback_result_relying_on_this = next[3].call(_this,
								title, error, result);
					check_and_delete_revisions();
					_this.next(callback_result_relying_on_this);
				});
				break;
			}

			if ((!next[2] || !next[2].ignore_denial)
					&& wiki_API.edit.denied(next[2].page_to_edit,
							this.token.login_user_name, next[2]
									&& next[2].notification_name)) {
				// 採用 next[2].page_to_edit 的方法，
				// 在 multithreading 下可能因其他 threading 插入而造成問題，須注意！
				library_namespace
						.warn('wiki_API.prototype.next: Denied to edit '
								+ wiki_API.title_link_of(next[2].page_to_edit));
				// next[3] : callback
				this.next(next[3], next[2].page_to_edit.title, 'denied');
				break;
			}

			// ----------------------------------------------------------------------
			// wiki_API.edit()

			var original_queue,
			// 必須在最終執行剛好一次 check_next() 以 `this.next()`。
			check_next = function check_next(callback_result, no_next) {
				if (original_queue) {
					// assert: {Array}original_queue.length > 0
					if (false) {
						console.trace('回填/回復 queue[' + original_queue.length
								+ ']');
					}
					_this.actions.append(original_queue);
					// free
					original_queue = null;
				}
				if (no_next) {
					_this.set_promise_relying(callback_result);
				} else {
					// 無論如何都再執行 this.next()，並且設定 this.running。
					// e.g., for
					// 20200209.「S.P.A.L.」関連ページの貼り換えのbot作業依頼.js

					// console.trace([ _this.running, _this.actions.length ]);
					// setTimeout(_this.next.bind(_this), 0);
					_this.next(callback_result);
				}
			};

			if (typeof next[1] === 'function') {
				// 為了避免消耗 memory，儘可能把本 sub 任務先執行完。
				// e.g., 20200206.reminded_expired_AfD.js
				// 採用 cache queue 再回填/回復 queue，在程序把 edit 動作與後面的動作連成一體、相互影響時會出錯。
				if (false && this.actions.length > 0) {
					original_queue = this.actions.clone();
					this.actions.truncate();
					// console.trace('queue[' + original_queue.length + ']');
				}
				// console.trace('next:');
				// console.log(next);

				// next[1] = next[1](wiki_API.content_of(next[2].page_to_edit),
				// next[2].page_to_edit.title, next[2].page_to_edit);
				// 需要同時改變 wiki_API.edit！
				// next[2]: options to call edit_topic()=CeL.wiki.Flow.edit
				// .call(options,): 使(回傳要編輯資料的)設定值函數能以this即時變更 options。
				next[1] = next[1].call(next[2], next[2].page_to_edit);
			}

			if (next[2] && next[2].skip_nochange
			// 採用 skip_nochange 可以跳過實際 edit 的動作。
			&& next[1] === wiki_API.content_of(next[2].page_to_edit)) {
				// console.log(next[2]);
				// console.trace(next[2].page_to_edit.title);
				library_namespace.debug('Skip [' + next[2].page_to_edit.title
				// 'nochange', no change
				+ ']: The same contents.', 1, 'wiki_API.prototype.next');
				check_next(typeof next[3] === 'function'
				// next[3] : callback
				&& next[3].call(this, next[2].page_to_edit.title, 'nochange'));
				break;
			}

			next[2].rollback_action = function rollback_action() {
				// rollback action
				_this.actions.unshift(
				// 重新登入以後，編輯頁面之前再取得一次頁面內容。
				[ 'page', next[2].page_to_edit.title ], next);
				check_next(null, true);
			};

			wiki_API.edit([ this.API_URL, next[2].page_to_edit ],
			// 因為已有 contents，直接餵給轉換函式。
			next[1], this.token,
			// next[2]: options to call wiki_API.edit()
			add_session_to_options(this, next[2]),
			//
			function wiki_API_next_edit_callback(title, error, result) {
				// next[3] : callback
				if (typeof next[3] === 'function') {
					callback_result_relying_on_this = next[3].apply(_this,
							arguments);
				}
				// console.trace('assert: 應該有 next[2].page_to_edit。');
				// console.trace(next[2].page_to_edit);
				check_and_delete_revisions();
				check_next(callback_result_relying_on_this);
				// console.trace(title);
				// console.trace(_this.actions);
			});
			break;

		// ----------------------------------------------------------------------------------------

		case 'upload':
			var tmp = next[1];
			if (typeof tmp === 'object'
			// wiki.upload({Object}file_data + options, callback)
			&& (tmp = tmp.file_path
			// Get media from URL first.
			|| tmp.media_url || tmp.file_url)) {
				// shift arguments
				next.splice(1, 0, tmp);

			} else if (typeof next[2] === 'string') {
				// wiki.upload(file_path, comment, callback)
				next[2] = {
					comment : next[2]
				};
			}

			// wiki.upload(file_path, options, callback)
			wiki_API.upload(next[1], this.token.csrftoken,
			// next[2]: options to call wiki_API.edit()
			add_session_to_options(this, next[2]), function(result, error) {
				// next[3] : callback
				_this.next(next[3], result, error);
			});
			break;

		case 'cache':
			if (library_namespace.is_Object(next[2]) && !next[3]) {
				// 未設定/不設定 callback
				// shift arguments
				next.splice(2, 0, undefined);
			}

			// 因為 wiki_API.cache(list) 會使用到 wiki_API.prototype[method]，
			// 算是 .next() 編制外功能；
			// 因此需要重新設定 this.running，否則可能中途停止。
			// 例如 this.running = true，但是實際上已經不會再執行了。
			// TODO: 這可能會有bug。
			this.running = 0 < this.actions.length;

			// wiki.cache(operation, callback, _this);
			wiki_API.cache(next[1], function() {
				// overwrite callback() to run this.next();
				// next[2] : callback
				if (typeof next[2] === 'function')
					_this.set_promise_relying(next[2].apply(this, arguments));
				// 因為 wiki_API.cache(list) 會使用到 wiki_API.prototype[method]；
				// 其最後會再 call wiki_API.next()，是以此處不再重複 call .next()。
				// _this.next();
			},
			// next[3]: options to call wiki_API.cache()
			Object.assign({
				// default options === this

				// including main, File, Template, Category
				// namespace : '0|6|10|14',

				// title_prefix : 'Template:',

				// cache path prefix
				// prefix : base_directory,

				// [KEY_SESSION]
				session : this
			}, next[3]));
			break;

		case 'listen':
			if (!wiki_API.wmflabs) {
				// 因為 wiki_API.cache(list) 會使用到 wiki_API.prototype[method]；
				// 其最後會再 call wiki_API.next()，是以此處不再重複 call .next()。

				// 因為接下來的操作會呼叫 this.next() 本身，
				// 因此必須把正在執行的標記消掉。
				this.running = false;
			}

			// wiki.listen(listener, options);
			wiki_API.listen(next[1],
			// next[2]: options to call wiki_API.listen()
			add_session_to_options(this, next[2]));

			if (wiki_API.wmflabs) {
				this.next();
			}
			break;

		// ------------------------------------------------
		// Wikidata access

		case 'data':
			if (!('data_session' in this)) {
				// rollback, 確保已設定 this.data_session。
				this.actions.unshift([ 'set_data' ], next);
				this.next();
				break;
			}

			if (typeof next[1] === 'function') {
				library_namespace.debug(
						'直接將 last_data 輸入 callback: ' + next[1], 3,
						'wiki_API.prototype.next.data');
				if (last_data_is_usable(this)) {
					this.next(next[1], this.last_data);
					break;
				}

				library_namespace.debug('last data 不能用。', 3,
						'wiki_API.prototype.next.data');
				// delete this.last_data;
				if (!wiki_API.is_page_data(this.last_page)) {
					this.next(next[1], undefined, {
						code : 'no_id',
						message : 'Did not set id! 未設定欲取得之特定實體 id。'
					});
					break;
				}
				next.splice(1, 0, this.last_page);
			}

			if (typeof next[2] === 'function') {
				// 未設定/不設定 property
				// shift arguments
				next.splice(2, 0, null);
			}

			if (wiki_API.is_entity(next[1])) {
				this.last_data = next[1];
				// next[3] : callback
				this.next(next[3], this.last_data);
				break;
			}

			// 因為前面利用cache時會檢查KEY_CORRESPOND_PAGE，且KEY_CORRESPOND_PAGE只會設定在page_data，
			// 因此這邊自屬於page_data之輸入項目設定 .last_page
			if (wiki_API.is_page_data(next[1])
			// 預防把 wikidata entity 拿來當作 input 了。
			&& !wiki_API.is_entity(next[1])) {
				this.last_page = next[1];
			}
			// wikidata_entity(key, property, callback, options)
			wiki_API.data(next[1], next[2], function(data, error) {
				// 就算發生錯誤，依然設定一個 dummy，預防 edit_data 時引用可能非所欲的 this.last_page。
				_this.last_data = data || {
					key : next[1],
					error : error
				};
				if (false) {
					// 因為在wikidata_entity()裡面設定了[KEY_SESSION]，因此JSON.stringify()會造成:
					// TypeError: Converting circular structure to JSON
					library_namespace.debug('設定 entity data: '
							+ JSON.stringify(_this.last_data), 3,
							'wiki_API.prototype.next.data');
				}
				// next[3] : callback
				_this.next(next[3], data, error);
			},
			// next[4] : options
			add_session_to_options(this.data_session, next[4]));
			break;

		case 'edit_data':
			if (!('data_session' in this)) {
				// rollback, 確保已設定 this.data_session。
				this.actions.unshift([ 'set_data' ], next);
				this.next();
				break;
			}

			// wiki.edit_data([id, ]data[, options, callback])

			if (typeof next[1] === 'function'
			//
			|| library_namespace.is_Object(next[1])
					&& !wiki_API.is_entity(next[1])) {
				library_namespace.debug('未設定/不設定 id，第一個 next[1] 即為 data。', 6,
						'wiki_API.next.edit_data');
				// next = [ 'edit_data', data[, options, callback] ]
				if (library_namespace.is_Object(next[2]) && next[2]['new']) {
					// create item/property
					next.splice(1, 0, null);

				} else {
					// 自動填補 id。
					// 直接輸入 callback。
					if (typeof next[2] === 'function' && !next[3]) {
						// 未輸入 options，但輸入 callback。
						next.splice(2, 0, null);
					}

					// next = [ 'edit_data', data, options[, callback] ]

					if (false) {
						// TypeError: Converting circular structure to JSON
						library_namespace.debug('this.last_data: '
								+ JSON.stringify(this.last_data), 6,
								'wiki_API.next.edit_data');
						library_namespace.debug('this.last_page: '
								+ JSON.stringify(this.last_page), 6,
								'wiki_API.next.edit_data');
					}
					if (last_data_is_usable(this)) {
						// shift arguments
						next.splice(1, 0, this.last_data);

					} else if (this.last_data && this.last_data.error
					// @see last_data_is_usable(session)
					&& this.last_page === this.last_data[KEY_CORRESPOND_PAGE]) {
						library_namespace.debug('前一次之wikidata實體取得失敗', 6,
								'wiki_API.next.edit_data');
						// next[3] : callback
						this.next(next[3], undefined, {
							code : 'last_data_failed',
							message : '前一次之wikidata實體取得失敗: ['
							// 例如提供的 foreign title 錯誤，
							+ (this.last_data[KEY_CORRESPOND_PAGE]
							// 或是 foreign title 為 redirected。
							|| (this.last_data.site
							// 抑或者存在 foreign title 頁面，但沒有 wikidata entity。
							+ ':' + this.last_data.title)) + ']'
						});
						break;

					} else if (this.last_page) {
						library_namespace.debug('自 .last_page '
								+ wiki_API.title_link_of(this.last_page)
								+ ' 取得特定實體。', 6, 'wiki_API.next.edit_data');
						// e.g., edit_data({Function}data)
						next.splice(1, 0, this.last_page);

					} else {
						// next[3] : callback
						this.next(next[3], undefined, {
							code : 'no_id',
							message : 'Did not set id! 未設定欲取得之特定實體 id。'
						});
						break;
					}
				}
			}

			// needless: 會從 get_data_API_URL(options) 取得 API_URL。
			if (false && !Array.isArray(next[1])) {
				// get_data_API_URL(this)
				next[1] = [ this.data_session.API_URL, next[1] ];
			}

			// next = [ 'edit_data', id, data[, options, callback] ]

			if (typeof next[3] === 'function' && !next[4]) {
				// 未輸入 options，但輸入 callback。
				next.splice(3, 0, null);
			}

			// 因為前面利用cache時會檢查KEY_CORRESPOND_PAGE，且KEY_CORRESPOND_PAGE只會設定在page_data，
			// / / 因此這邊自屬於page_data之輸入項目設定 .last_page
			if (wiki_API.is_page_data(next[1])
			// 預防把 wikidata entity 拿來當作 input 了。
			&& !wiki_API.is_entity(next[1])) {
				this.last_page = next[1];
			}
			// wikidata_edit(id, data, token, options, callback)
			wiki_API.edit_data(next[1], next[2], this.data_session.token,
			// next[3] : options
			add_session_to_options(this.data_session, next[3]),
			// callback
			function(data, error) {
				if (false && data && !wiki_API.is_entity(data)) {
					console.trace(data);
					throw 'data is NOT entity';
				}
				_this.last_data = data || {
					// 有發生錯誤:設定 error log Object。
					last_data : _this.last_data,
					key : next[1],
					error : error
				};
				// next[4] : callback
				_this.next(next[4], data, error);
			});
			break;

		case 'merge_data':
			if (!('data_session' in this)) {
				// rollback, 確保已設定 this.data_session。
				this.actions.unshift([ 'set_data' ], next);
				this.next();
				break;
			}

			// next = [ 'merge_data', to, from[, options, callback] ]
			if (typeof next[3] === 'function' && !next[4]) {
				// 未輸入 options，但輸入 callback。
				next.splice(3, 0, null);
			}

			// next = [ 'merge_data', to, from, options[, callback] ]
			// wikidata_merge(to, from, token, options, callback)
			wiki_API.merge_data(next[1], next[2], this.data_session.token,
			// next[3] : options
			add_session_to_options(this.data_session, next[3]),
			// next[4] : callback
			function(data, error) {
				// 此 wbmergeitems 之回傳 data 不包含 item 資訊。
				// next[4] : callback
				_this.next(next[4], data, error);
			});
			break;

		case 'query_data':
			// wdq, query data
			// wikidata_query(query, callback, options)
			wiki_API.wdq(next[1], function(data) {
				_this.last_list = Array.isArray(data) ? data : null;
				// next[2] : callback
				_this.next(next[2], data);
			}, next[3]);
			break;

		// ------------------------------------------------
		// [[commons:Commons:Structured data]]
		// 共享資源後端使用維基庫（Wikibase），與維基數據（Wikidate）使用的技術相同。

		case 'structured_data':
			// session.structured_data('File:media_file_name', (entity, error)
			// => {});
			// session.structured_data('File:media_file_name', property,
			// (entity, error) => {}, options);

			if (typeof next[1] === 'function') {
				library_namespace.debug('直接取得 last_page 之 data: ' + next[1], 3,
						'wiki_API.prototype.next.structured_data');
				if (!wiki_API.is_page_data(this.last_page)) {
					this.next(next[1], undefined, {
						code : 'no_id',
						message : 'Did not set id! 未設定欲取得之特定實體 id。'
					});
					break;
				}
				next.splice(1, 0, this.last_page);
			}

			if (!is_api_and_title(next[1]) && !get_wikibase_key(next[1])) {
				// e.g., wiki_API.is_page_data(next[1]) ||
				// is_api_and_title(next[1]) || get_wikibase_key(next[1])
				next[1] = [ wiki_API.site_name(this), next[1] ];
			}

			if (next[1][get_wikibase_key(next[1]) ? 'site' : 0] !== 'commonswiki') {
				library_namespace
						.warn('wiki_API.prototype.next.structured_data: Should only using on commonswiki!');
			}
			if (!this.is_namespace(next[1][get_wikibase_key(next[1]) ? 'title'
					: 1], 'File')) {
				library_namespace
						.warn('wiki_API.prototype.next.structured_data: Should only using on files! ('
								+ next[1][get_wikibase_key(next[1]) ? 'title'
										: 1] + ')');
			}

			if (typeof next[2] === 'function') {
				// 未設定/不設定 property
				// shift arguments
				next.splice(2, 0, null);
			}

			if (wiki_API.is_entity(next[1][1])
					&& wiki_API.is_page_data(next[1][1])) {
				library_namespace.debug('直接將 next[1] 輸入 callback: '
						+ next[1][1], 1,
						'wiki_API.prototype.next.edit_structured_data');
				this.last_page = next[1][1];
				// next[3] : callback
				this.next(next[3], this.last_page);
				break;
			}

			if (wiki_API.is_page_data(next[1][1])) {
				next[1][1] = wiki_API.title_of(next[1][1]);
			}

			if (wiki_API.is_entity(this.last_page)
					&& next[1][1] === this.last_page.title) {
				// next[3] : callback
				this.next(next[3], this.last_page);
				break;
			}

			// next[4] : options
			next[4] = add_session_to_options(this, next[4]);
			next[4].data_API_URL = this.API_URL;

			// delete _this.last_page;
			// console.trace(this.actions.length, next);
			// wikidata_entity(key, property, callback, options)
			wiki_API.data(next[1], next[2], function(data, error) {
				// console.trace([ data, error ]);
				if (data) {
					// e.g.,
					// {pageid:,ns:,title:,type:'mediainfo',id:'M000',labels:{},descriptions:{},statements:{}}
					// {id:'M123456',missing:''}
					if (wiki_API.is_page_data(next[1][1])) {
						_this.last_page = Object.assign(
						//
						wiki_API.is_page_data(next[1][1]), data);
						_this.last_page[KEY_CORRESPOND_PAGE]
						//
						= data[KEY_CORRESPOND_PAGE];
					} else {
						_this.last_page = data;
					}
				} else {
					_this.last_page = {
						title : wiki_API.title_of(next[1][1]),
						error : error
					};
				}
				// next[3] : callback
				_this.next(next[3], data, error);
				// console.trace(_this.actions.length, _this.actions);
			},
			// next[4] : options
			next[4]);
			break;

		case 'edit_structured_data':
			// wiki.edit_structured_data(['File:media_file_name', ]data[,
			// options, callback]);
			// wiki.structured_data('File:media_file_name').edit_structured_data(data[,
			// options, callback]);
			// wiki.page('File:media_file_name').edit_structured_data(data[,
			// options, callback]);

			if (typeof next[1] === 'string') {
				// next[1]: title
				next[1] = [ wiki_API.site_name(this), next[1] ];

			} else if (typeof next[1] === 'function'
			//
			|| library_namespace.is_Object(next[1])
					&& !wiki_API.is_entity(next[1])
					&& !get_wikibase_key(next[1])) {
				library_namespace.debug('未設定/不設定 id，第一個 next[1] 即為 data。', 6,
						'wiki_API.next.edit_structured_data');
				// console.trace(next);
				next.splice(1, 0, this.last_page);
			}

			if (wiki_API.is_entity(this.last_page)
					&& next[1]
					&& this.last_page.title === (is_api_and_title(next[1]) ? next[1][1]
							: get_wikibase_key(next[1]) ? get_wikibase_key(next[1]).title
									// wiki_API.is_page_data(next[1])
									: next[1].title)) {
				next[1] = this.last_page;
			} else if (this.last_page.id && ('missing' in this.last_page)
					&& get_wikibase_key(this.last_page)
					&& get_wikibase_key(this.last_page).title === next[1][1]) {
				// 完全還沒設定過 structured data 的檔案是長這樣子:
				// {id:'M123456',missing:''}
				next[1] = this.last_page;
			}

			// next = ['edit_structured_data', id, data[, options, callback]]

			if (typeof next[3] === 'function') {
				// shift arguments
				next.splice(3, 0, null);
			}

			// next = ['edit_structured_data', id, data, options, callback]

			if (false) {
				console.trace(this.actions.length, next, wiki_API
						.is_entity(next[1]));
			}
			if (wiki_API.is_entity(next[1])) {
				library_namespace.debug('沿用原有 entity。', 6,
						'wiki_API.next.edit_structured_data');

			} else if (get_wikibase_key(next[1])
			// 有 [KEY_CORRESPOND_PAGE] 代表已經 .structured_data() 過。
			&& next[1][KEY_CORRESPOND_PAGE]) {
				next[1] = get_wikibase_key(next[1]);

			} else {
				// console.trace(next[1]);
				if (false) {
					console.trace(this.actions.length, next, wiki_API
							.is_page_data(next[1]), is_api_and_title(next[1]),
							get_wikibase_key(next[1]));
				}
				if (wiki_API.is_page_data(next[1]) || is_api_and_title(next[1])) {
					library_namespace.debug('先取得 last_page 之 data: ' + next[1],
							3, 'wiki_API.prototype.next.edit_structured_data');
					this.actions.unshift([ 'structured_data', next[1] ], next);
					// next[1] will be replace by `this.last_page` later.
					this.next();
				} else if (get_wikibase_key(next[1])) {
					// e.g., media 沒設定過 structured data。
					// {id:'M000',missing:''}
					this.actions.unshift([ 'structured_data',
							get_wikibase_key(next[1]) ], next);
					// next[1] will be replace by `this.last_page` later.
					this.next();
				} else {
					this.next(next[4], undefined, {
						code : 'no_id',
						message : 'Did not set id! 未設定欲取得之特定實體 id。'
					});
				}
				break;
			}

			// assert: wiki_API.is_entity(next[1])

			// console.trace(next[1]);
			next[1] = Object.clone(next[1]);

			if (!next[1].claims && next[1].statements) {
				next[1].claims = next[1].statements;
				delete next[1].statements;
			}

			// next[3] : options
			next[3] = add_session_to_options(this, next[3]);
			next[3].data_API_URL = this.API_URL;

			// console.trace(next);
			// wikidata_edit(id, data, token, options, callback)
			wiki_API.edit_data(next[1], next[2], this.token,
			// next[3] : options
			next[3],
			// callback
			function(data, error) {
				// console.trace(_this.actions.length, next);
				// next[4] : callback
				_this.next(next[4], data, error);
			});
			break;

		// ------------------------------------------------

		// administrator functions

		case 'move_page':
			if (type === 'move_page') {
				// wiki.move_page(from, to, options, callback)
				// wiki.move_page(from, to, callback)
				if (typeof next[3] === 'function') {
					// shift arguments
					next.splice(3, 0, {
						from : next[1]
					});
				} else {
					next[3] = library_namespace.setup_options(next[3]);
					next[3].from = next[1];
				}
				// remove `from`
				next.splice(1, 1);
				type = 'move_to';
			}

		case 'move_to':
			// wiki_API.move_to(): move a page from `from` to target `to`.

			// wiki.page(from title)
			// .move_to(to, [from title,] options, callback)

			// wiki.move_to(to, from, options, callback)
			// wiki.move_to(to, from, options)
			// wiki.move_to(to, from, callback)
			// wiki.move_to(to, from)

			// wiki.page(from).move_to(to, options, callback)
			// wiki.page(from).move_to(to, options)
			// wiki.page(from).move_to(to, callback)
			// wiki.page(from).move_to(to)

			var move_to_title = null;
			if (type === 'move_to') {
				if (typeof next[1] === 'string') {
					move_to_title = next[1];
					// shift arguments
					next.splice(1, 1);
				}
			}

		case 'remove':
			// wiki.page(title).remove([title,] options, callback)
			if (type === 'remove') {
				// 正名。
				type = 'delete';
			}

		case 'delete':
			// wiki.page(title).delete([title,] options, callback)

		case 'protect':
			// wiki.page(title).protect([title,] options, callback)

		case 'rollback':
			// wiki.page(title).rollback([title,] options, callback)

			// --------------------------------------------

			// 這些控制用的功能，不必須取得頁面內容。
			if (typeof next[1] === 'string') {
				// 輸入的第一個參數是頁面標題。
				// e.g.,
				// wiki.remove(title, options, callback)
				this.last_page = {
					title : next[1]
				};
				// shift arguments
				next.splice(1, 1);
			}

			if (typeof next[1] === 'function') {
				// shift arguments
				// insert as options
				next.splice(1, 0, undefined);
			}
			if (!next[1]) {
				// initialize options
				next[1] = Object.create(null);
			}

			if (type === 'move_to') {
				if (move_to_title) {
					next[1].to = move_to_title;
				}
			}

			// 保護/回退
			if (this.stopped && !next[1].skip_stopped) {
				library_namespace.warn('wiki_API.prototype.next: 已停止作業，放棄 '
				//
				+ type + ' [['
				//
				+ (next[1].title || next[1].pageid || this.last_page
				//
				&& this.last_page.title) + ']]！');
				// next[2] : callback
				this.next(next[2], next[1], '已停止作業');

			} else {
				next[1][KEY_SESSION] = this;
				wiki_API[type](next[1], function(response, error) {
					// next[2] : callback
					_this.next(next[2], response, error);
				});
			}
			break;

		// ------------------------------------------------
		// 流程控制

		case 'wait':
			// rollback
			this.actions.unshift(next);
			break;

		case 'run':
			// session.run(function)
			// session.run(function, argunent_1, argunent_2, ...)
			if (typeof next[1] === 'function') {
				// next[1] : callback
				if (this.run_after_initializing
						&& !next[1].is_initializing_process) {
					library_namespace.debug(
							'It is now initializing. Push function into queue: '
									+ next[1], 1);
					this.run_after_initializing.push(next);
				} else {
					try {
						// pass arguments
						callback_result_relying_on_this = next[1].apply(this,
								next.slice(2));
					} catch (e) {
						// TODO: handle exception
						library_namespace.error(e);
					}
				}
			}
			this.next(callback_result_relying_on_this);
			break;

		case 'run_async':
			var is_function = false;
			// next[1] : callback
			if (typeof next[1] === 'function') {
				is_function = true;
				// pass arguments
				next[1] = next[1].apply(this, next.slice(2));
			}

			if (library_namespace.is_thenable(next[1])) {
				var callback = this.next.bind(this);
				next[1].then(callback, callback);
			} else if (is_function) {
				// ** MUST call `this.next();` in the callback function!
			} else {
				this.next();
			}
			break;

		// ------------------------------------------------

		default:
			// Should not go to here!
			library_namespace.error('Unknown operation: [' + next.join() + ']');
			this.next();
			break;
		}

	};

	/**
	 * wiki_API.prototype.next() 已登記之 methods。<br />
	 * 之後會再自動加入 get_list.type 之 methods。<br />
	 * NG: ,login
	 * 
	 * @type {Array}
	 * 
	 * @see function wiki_API_prototype_methods()
	 */
	wiki_API.prototype.next.methods = 'query_API|siteinfo|page|tracking_revisions|parse|redirect_to|purge|check|copy_from|download|edit|upload|cache|listen|category_tree|register_redirects|search|remove|delete|move_page|move_to|protect|rollback|logout|run|run_async|set_URL|set_language|set_data|data|edit_data|merge_data|query_data|structured_data|edit_structured_data|query'
			.split('|');

	// ------------------------------------------------------------------------

	// e.g., " (99%): 0.178 page/ms, 1.5 minutes estimated."
	function estimated_message(processed_amount, total_amount, starting_time,
			pages_processed, unit) {
		/** {Natural}ms */
		var time_elapsed = Date.now() - starting_time;
		// estimated time of completion 估計時間 預計剩下時間 預估剩餘時間 預計完成時間還要多久
		var estimated = time_elapsed / processed_amount
				* (total_amount - processed_amount);
		if (estimated > 99 && estimated < 1e15/* Infinity */) {
			estimated = library_namespace.age_of(0, estimated, {
				digits : 1
			});
			estimated = ', ' + estimated + ' estimated';
		} else {
			estimated = '';
		}

		var speed;
		if (pages_processed > 0) {
			if (!unit) {
				// page(s)
				unit = 'page';
			}
			speed = pages_processed / time_elapsed;
			speed = speed < 1 ? (1e3 * speed).toFixed(2) + ' ' + unit + '/s'
					: speed.toFixed(3) + ' ' + unit + '/ms';
			speed = ': ' + speed;
		} else {
			speed = '';
		}

		return (pages_processed > 0 ? pages_processed === total_amount ? processed_amount
				+ '/' + total_amount
				: pages_processed + ' '
				: /* Need add message yourself */'')
				+ ' ('
				+ (100 * processed_amount / total_amount | 0)
				+ '%)'
				+ speed + estimated;
	}

	// --------------------------------------------------------------------------------------------

	// 或者還可以去除 "MediaWiki message delivery" 這些系統預設的非人類發布者。
	/** {RegExp}pattern to test if is a robot name. CeL.wiki.PATTERN_BOT_NAME */
	var PATTERN_BOT_NAME = /bot(?:$|[^a-z])|[機机][器械]人|ボット(?:$|[^a-z])|봇$/i;
	// ↑ /(?:$|[^a-z])/: e.g., PxBot~testwiki, [[ko:User:2147483647 (bot)]],
	// a_bot2, "DynBot Srv2", "Kwjbot II", "Purbo T"
	// TODO: [[User:CommonsDelinker]], BotMultichill, "Flow talk page manager",
	// "Maintenance script", "MediaWiki default", "MediaWiki message delivery"

	/**
	 * default date format for work task. 預設的日期格式 '%4Y%2m%2dT%2H%2M%2S'
	 * 
	 * @type {String}
	 * @see ISO 8601
	 */
	wiki_API.prototype.work_date_format = '%H:%M:%S';
	wiki_API.prototype.work_title_date_format = '%4Y-%2m-%2d %H:%M:%S';

	/**
	 * 規範 log 之格式。(for wiki_API.prototype.work)
	 * 
	 * 若有必要跳過格式化的訊息，應該自行調用 message.push({String}message) 而非
	 * message.add({String}message)。
	 * 
	 * @param {String}message
	 *            message
	 * @param {String}[title]
	 *            message title.
	 * @param {Boolean}[use_ordered_list]
	 *            use ordered list.
	 */
	function add_message(message, title, use_ordered_list) {
		if (typeof message !== 'string') {
			message = message && String(message) || '';
		}
		message = message.trim();
		if (message) {
			if (title) {
				var namespace = wiki_API.namespace(title, this[KEY_SESSION]);
				title = wiki_API.title_link_of(title);
				if (title) {
					if (namespace !== 0) {
						// 對於非條目作特殊處理。
						title = "'''" + title + "'''";
					}
					title += ' ';
				}
			}
			message = (use_ordered_list ? '# ' : '* ') + (title || '')
					+ message;
			this.push(message);
		}
	}

	function reset_messages() {
		// 設定 time stamp。
		this.start = this.last = new Date;
		// clear
		this.clear();
	}

	/**
	 * 輸入 URI component list，得出自 [0] 至 [邊際index-1] 以 encodeURIComponent()
	 * 串聯起來，長度不超過 limit_length。
	 * 
	 * @param {Array}piece_list
	 *            URI component list: page id / title / data
	 * @param {Natural}[limit]
	 *            max count
	 * @param {Natural}[limit_length]
	 *            max length in bytes
	 * 
	 * @returns {Number}邊際index。
	 * 
	 * @inner
	 */
	function check_max_length(piece_list, limit, limit_length) {
		// 8000: 8192 - (除了 piece_list 外必要之字串長)。
		//
		// 8192: https://httpd.apache.org/docs/current/mod/core.html
		// default LimitRequestLine: 8190
		//
		// assert: 除了 piece_list 外必要之字串長 < 192
		// e.g.,
		// "https://zh.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content|timestamp&titles=...&format=json&utf8=1"
		if (!(limit_length > 0)) {
			limit_length = 8000;
		}
		if (false && !(limit > 0)) {
			limit = 5000;
		}

		var length = 0, index = piece_list.length;

		if (false)
			piece_list.slice(0, limit_length / 30).join('|').slice(0,
					limit_length).replace(/[^|]+$/, '');

		if (piece_list.some(function(piece, i) {
			if (!piece || !(piece.pageid >= 0)) {
				length = 1;
				return true;
			}
			// console.log([ piece, length ]);
			length += piece.pageid.toString().length + 3;
			if (i === index || i >= limit || length >= limit_length) {
				// console.log({ i, index, limit, limit_length, length });
				index = i;
				length = 0;
				return true;
			}
		}) && length > 0) {
			library_namespace.debug('Some pieces are not page data.', 1,
					'check_max_length');
			length = 0;
			piece_list.some(function(piece, i) {
				length += encodeURIComponent(piece && piece.title
				// +3 === encodeURIComponent('|').length: separator '|'
				|| piece).length + 3;
				if (i >= limit || length >= limit_length) {
					index = i;
					return true;
				}
			});
		}
		// console.log(piece_list);
		library_namespace.debug('1–' + index + '/' + piece_list.length
				+ ', length ' + length, 2, 'check_max_length');
		if (false && typeof piece_list[2] === 'string')
			library_namespace.log(piece_list.slice(0, index).join('|'));

		return index;
	}

	// https://www.mediawiki.org/w/api.php
	// Use higher limits in API queries (slow queries: 500; fast queries: 5000).

	// @inner
	function max_slice_size(session, config, this_slice) {
		var max_size;
		if (session.slow_query_limit > 0) {
			max_size = session.slow_query_limit;
		} else {
			if (session.login_user_info
					&& Array.isArray(session.login_user_info.rights)) {
				// session.token &&
				// PATTERN_BOT_NAME.test(session.token.login_user_name)
				max_size = session.login_user_info.rights
						.includes('apihighlimits');
			} else {
				// default: max_size = 50;
			}

			var prop = 'query+siteinfo';
			prop = session.API_parameters && session.API_parameters[prop]
			prop = prop && prop.prop;
			// console.trace([max_size, prop]);

			max_size = max_size ? prop && prop.highlimit || 500
			// https://www.mediawiki.org/w/api.php?action=help&modules=query
			// Maximum number of values is 50 (500 for clients allowed higher
			// limits).
			: prop && prop.lowlimit || 50;
		}

		if (config && (config.slice | 0) >= 1) {
			max_size = Math.min(config.slice | 0, max_size);
		}

		// 自動判別最大可用 index，預防 "414 Request-URI Too Long"。
		// 因為 8000/500-3 = 13 > 最長 page id，因此即使 500頁也不會超過。
		// 為提高效率，不作 check。
		if (this_slice && (!config || !config.is_id))
			max_size = check_max_length(this_slice, max_size);

		return max_size;
	}

	// unescaped syntaxes in summary
	function summary_to_wikitext(summary) {
		// unescaped_summary
		var wikitext = summary.toString().replace(/</g, '&lt;').replace(
		// 避免 wikitext 添加 Category。
		// 在編輯摘要中加上使用者連結，似乎還不至於驚擾到使用者。因此還不用特別處理。
		// @see PATTERN_category @ CeL.wiki
		/\[\[\s*(Category|分類|分类|カテゴリ|분류)\s*:/ig, '[[:$1:');
		if (false) {
			// 在 [[t|{{t}}]] 時無效，改採 .replace(/{{/g,)。
			wikitext = wikitext.replace(
			// replace template
			/{{([a-z\d]+)/ig, function(all, name) {
				if (/^tl\w$/i.test(name))
					return all;
				return '{{tlx|' + name;
			});
		}
		wikitext = wikitext.replace(/{{/g, '&#123;&#123;');
		return wikitext;
	}

	// wiki_API.prototype.work(config, page_list): configuration:
	({
		// 注意: 與 wiki_API.prototype.work(config)
		// 之 config.before/config.after 連動。
		before : function before(messages, pages) {
		},
		// {Function|Array} 每個 page 執行一次。
		each : function each(page_data, messages) {
			return 'text to replace';
		},
		// 注意: 與 wiki_API.prototype.work(config)
		// 之 config.before/config.after 連動。
		after : function after(messages, pages) {
		},
		// run this at last. 在 wiki_API.prototype.work() 工作最後執行此 config.last()。
		last : function last(error) {
			// this: options
		},
		// 不作編輯作業。
		no_edit : true,
		// 設定寫入目標。一般為 debug、test 測試期間用。
		write_to : '',
		/** {String}運作記錄存放頁面。 */
		log_to : 'User:Robot/log/%4Y%2m%2d',
		// 「新條目、修飾語句、修正筆誤、內容擴充、排版、內部鏈接、分類、消歧義、維基化」
		/** {String}編輯摘要。總結報告。編輯理由。 edit reason. */
		summary : ''
	});

	/**
	 * robot 作業操作之輔助套裝函數。此函數可一次取得50至300個頁面內容再批次處理。<br />
	 * 不會推入 this.actions queue，即時執行。因此需要先 get list！
	 * 
	 * 注意: arguments 與 get_list() 之 callback 連動。
	 * 
	 * @param {Object}config
	 *            configuration. { page_options: { prop: 'revisions', rvprop:
	 *            'ids|timestamp|user' } }
	 * @param {Array}pages
	 *            page data list
	 */
	wiki_API.prototype.work = function do_batch_work(config, pages) {
		// console.log(JSON.stringify(pages));
		if (typeof config === 'function')
			config = {
				each : config
			};
		if (!config || !config.each) {
			library_namespace.warn('wiki_API.work: Bad callback!');
			return;
		}
		if (!('no_edit' in config)) {
			// default: 未設定 summary 則不編輯頁面。
			config.no_edit = !config.summary;
		} else if (!config.no_edit && !config.summary) {
			library_namespace
					.warn('wiki_API.work: Did not set config.summary when edit page (config.no_edit='
							+ config.no_edit + ')!');
		}

		if (!pages)
			pages = this.last_pages;
		// config.run_empty: 即使無頁面/未取得頁面，依舊強制執行下去。
		if (!pages && !config.run_empty) {
			// 採用推入前一個 this.actions queue 的方法，
			// 在 multithreading 下可能因其他 threading 插入而造成問題，須注意！
			library_namespace
					.warn('wiki_API.work: No list. Please get list first!');
			return;
		}

		library_namespace.debug('wiki_API.work: 開始執行作業: 先作環境建構與初始設定。');
		if (config.summary) {
			// '開始處理 ' + config.summary + ' 作業'
			library_namespace.sinfo([ 'wiki_API.work: Start the operation [',
					'fg=yellow', String(config.summary), '-fg', ']' ]);
		}

		/**
		 * <code>
		 * default handler [ text replace function(title, content), {Object}options, callback(title, error, result) ]
		 * </code>
		 */
		var each,
		// options 在此暫時作為 default options。
		options = config.options || {
			// 預設會取得大量頁面。 multiple pages
			multi : true,
			// prevent creating new pages
			// Throw an error if the page doesn't exist. 若頁面不存在/已刪除，則產生錯誤。
			// 要取消這項，須注意在重定向頁之對話頁操作之可能。
			nocreate : 1,
			// 該編輯是一個小修訂 (minor edit)。
			minor : 1,
			// denotes this is a bot edit. 標記此編輯為機器人編輯。
			// [[WP:AL|機器人對其他使用者對話頁的小修改將不會觸發新訊息提示]]。
			bot : 1,
			// [[Special:tags]]
			// 指定不存在的標籤，可能會造成 [tags-apply-not-allowed-one]
			// The tag "..." is not allowed to be manually applied.
			// tags : 'bot|test|bot trial',
			tags : '',
			// 設定寫入目標。一般為 debug、test 測試期間用。
			write_to : '',
			// Allow content to be emptied. 允許內容被清空。白紙化。
			allow_empty : false,
			// 採用 skip_nochange 可以跳過實際 edit 的動作。
			// 對於大部分不會改變頁面的作業，能大幅加快速度。
			skip_nochange : true
		}, callback,
		/** {ℕ⁰:Natural+0}全無變更頁面數。 */
		nochange_count = 0;

		if (library_namespace.is_Set(pages)) {
			pages = Array.from(pages);
		}

		if (Array.isArray(pages) && pages.length === 0) {
			if (!config.no_warning) {
				library_namespace.info('wiki_API.work: 列表中沒有項目，快速完結。');
			}
			if (typeof config.last === 'function') {
				this.run(config.last.bind(options));
			}
			return;
		}

		if (typeof config.each === 'function') {
			// {Function}
			each = [ config.each ];
		} else if (Array.isArray(config.each)) {
			// assert: config.each = [ function for_each_page,
			// append to this / assign to this @ each(), callback ]
			each = config.each;
		} else {
			throw new Error('wiki_API.work: Invalid function for each page!');
		}

		if (!config.options) {
			// 直接將 config 的設定導入 options。
			// e.g., write_to
			for (callback in options) {
				if (callback in config) {
					if (!config[callback] && (callback in {
						nocreate : 1,
						minor : 1,
						bot : 1,
						tags : 1
					})) {
						// 即使設定 minor=0 似乎也會當作設定了，得完全消滅才行。
						delete options[callback];
					} else {
						options[callback] = config[callback];
					}
				}
			}
		}

		if (each[1]) {
			// library_namespace.info('wiki_API.work: Set append_to_this:');
			// console.trace(each[1]);
			Object.assign(config.no_edit ? config : options, each[1]);
		}
		callback = config.summary;
		// 採用 {{tlx|template_name}} 時，[[Special:RecentChanges]]頁面無法自動解析成 link。
		options.summary = callback
		// 是為 Robot 運作。
		? PATTERN_BOT_NAME.test(callback) ? callback
		// Robot: 若用戶名包含 'bot'，則直接引用之。
		: (this.token.login_user_name && this.token.login_user_name.length < 9
				&& PATTERN_BOT_NAME.test(this.token.login_user_name)
		//
		? this.token.login_user_name : 'Robot')
				+ ': ' + callback
		// 未設置時，一樣添附 Robot。
		: 'Robot';

		// assert: 因為要作排程，為預防衝突與不穩定的操作結果，自此以後不再 modify options。

		var done = 0, session = this, error_to_return,
		//
		log_item = Object.assign(Object.create(null),
				wiki_API.prototype.work.log_item, config.log_item), messages = [];
		messages[KEY_SESSION] = this;
		/** config.no_message: {Boolean}console 不顯示訊息，也不處理 {Array}messages。 */
		messages.add = config.no_message ? library_namespace.null_function
				: add_message;
		// config.no_message: no_log
		messages.reset = config.no_message ? library_namespace.null_function
				: reset_messages;
		messages.reset();

		callback = each[2];
		// each 現在轉作為對每一頁面執行之工作。
		each = each[0];
		if (!callback) {
			// TODO: [[ja:Special:Diff/62546431|有時最後一筆記錄可能會漏失掉]]
			callback = config.no_message ? library_namespace.null_function
			// default logger.
			: function do_batch_work_summary(title, error, result) {
				if (false)
					console.trace([ done, nochange_count,
							title && title.title || title ]);
				if (error) {
					// ((return [ CeL.wiki.edit.cancel, 'skip' ];))
					// 來跳過 (skip) 本次編輯動作，不特別顯示或處理。
					// 被 skip/pass 的話，連警告都不顯現，當作正常狀況。
					if (error === 'skip') {
						done++;
						nochange_count++;
						return;
					}

					if (error === 'nochange') {
						done++;
						// 未經過 wiki 操作，於 wiki_API.edit 發現為[[WP:NULLEDIT|無改變]]的。
						// 無更動 沒有變更 No modification made
						nochange_count++;
						// gettext_config:{"id":"no-change"}
						error = gettext('no change');
						result = 'nochange';
					} else {
						// console.trace([ error_to_return, error ]);
						error_to_return = error_to_return || error;
						// 有錯誤發生。
						// e.g., [protectedpage]
						// The "editprotected" right is required to edit this
						// page
						if (config.onerror)
							config.onerror(error);
						result = [ 'error', error ];
						// gettext_config:{"id":"finished-$1"}
						error = gettext('finished: %1',
						// {{font color}}
						'<span style="color:red; background-color:#ff0;">'
								+ error + '</span>');
					}

				} else if (!result || !result.edit) {
					// 有時 result 可能會是 ""，或者無 result.edit。這通常代表 token lost。
					library_namespace.error('wiki_API.work: 無 result.edit'
							+ (result && result.edit ? '.newrevid' : '')
							+ '！可能是 token lost！');
					if (false) {
						console.trace(Array.isArray(title) && title[1]
								&& title[1].title ? title[1].title : title);
					}
					error = 'no "result.edit'
							+ (result && result.edit ? '.newrevid".' : '.');
					result = [ 'error', 'token lost?' ];

				} else {
					// 成功完成。
					done++;
					if (result.edit.newrevid) {
						// https://en.wikipedia.org/wiki/Help:Wiki_markup#Linking_to_old_revisions_of_pages.2C_diffs.2C_and_specific_history_pages
						// https://zh.wikipedia.org/?diff=000
						// cf. [[Special:Permalink/0|title]],
						// [[Special:Diff/prev/0]]
						error = ' [[Special:Diff/' + result.edit.newrevid + '|'
						// may use wiki_API.title_link_of()
						// gettext_config:{"id":"finished"}
						+ gettext('finished') + ']]';
						result = 'succeed';
					} else if ('nochange' in result.edit) {
						// 經過 wiki 操作，發現為[[WP:NULLEDIT|無改變]]的。
						nochange_count++;
						// gettext_config:{"id":"no-change"}
						error = gettext('no change');
						result = 'nochange';
					} else {
						// 有時無 result.edit.newrevid。
						library_namespace.error('無 result.edit.newrevid');
						// gettext_config:{"id":"finished"}
						error = gettext('finished');
						result = 'succeed';
					}
				}

				// error: message, result: result type.

				if (log_item[Array.isArray(result)
				// {Array}result = [ main error code, sub ]
				? result.join('_') in log_item ? result.join('_') : result[0]
						: result]) {
					// gettext_config:{"id":"$1-elapsed-$3-at-$2"}
					error = gettext('%1 elapsed, %3 at %2',
					// 紀錄使用時間, 歷時, 費時, elapsed time
					messages.last.age(new Date), (messages.last = new Date)
					//
					.format({
						zone : session.configurations.timeoffset / 60,
						// config.work_date_format || this.work_date_format
						format : config.work_date_format
								|| session.work_date_format
					}), error);

					// 對各個條目的紀錄加入計數。
					messages.add(error, title, true);
				}
			};
		}

		if (Array.isArray(pages) && pages.slice(0, 10).every(function(item) {
			return typeof item === 'string';
		})) {
			// 傳入標題列表。
			messages.input_title_list = true;
		}

		if (false && Array.isArray(pages) && !titles) {
			library_namespace.warn('wiki_API.work: rebuild titles.');
			titles = pages.map(function(page) {
				return page.title;
			});
		}

		var session = this;
		var maybe_nested_thread = // config.is_async_each ||
		session.running && session.actions.length === 0;
		if (false) {
			console.trace([ maybe_nested_thread, session.running,
					session.actions.length ]);
			console.log(each + '');
			// console.log(session.actions);
		}
		var main_work = function(data, error) {
			if (error) {
				library_namespace.error('wiki_API.work: Get error: '
						+ (error.info || error));
				// console.log(error);
				data = [];
			} else if (!Array.isArray(data)) {
				if (!data && this_slice_size === 0) {
					library_namespace.info('wiki_API.work: ' + config.summary
					// 任務/工作
					+ ': 未取得或設定任何頁面。這個部份的任務已完成？');
					data = [];
				} else if (data) {
					// 可能是 page data 或 title。
					data = [ data ];
				} else {
					library_namespace
							.error('wiki_API.work: No valid data got!');
					data = [];
				}
			}

			// 傳入標題列表，則由程式自行控制，毋須設定後續檢索用索引值。
			if (!messages.input_title_list
			// 後續檢索用索引值存儲所在的 options.next_mark，將會以此值寫入 log。
			&& (pages = config.next_mark)
			// pages: 後續檢索用索引值之暫存值。
			&& (pages = JSON.stringify(pages))) {
				// 當有 .next_mark 時，其實用不到 log page 之 continue_key。
				if (!session
				// 忽略表示完結的紀錄，避免每個工作階段都顯示相同訊息。
				|| pages !== '{}'
				// e.g., 後続の索引: {"continue":"-||"}
				&& !/^{"[^"]+":"[\-|]{0,9}"}$/.test(pages)) {
					// console.log(config);
					// console.log(options);
					// console.log(session.continue_key + ':' +
					// JSON.stringify(pages));
					messages.add(session.continue_key + ': ' + pages);
				}
			}

			if (!config.no_message) {
				// 使用時間, 歷時, 費時, elapsed time
				pages = gettext(
				// gettext_config:{"id":"first-it-takes-$1-to-get-$2-pages"}
				'First, it takes %1 to get %2 {{PLURAL:%2|page|pages}}.',
						messages.last.age(new Date), data.length);
				// 在「首先使用」之後才設定 .last，才能正確抓到「首先使用」。
				messages.last = new Date;
				if (log_item.get_pages) {
					messages.add(pages);
				}
				library_namespace.debug(pages, 2, 'wiki_API.work');
				if (library_namespace.is_debug()
				// .show_value() @ interact.DOM, application.debug
				&& library_namespace.show_value)
					library_namespace.show_value(data, 'pages');
			}

			pages = data;

			// run before every batch task. 在處理每個批次前執行此function。
			// 注意: 一次取得大量頁面時，回傳內容不一定會按照原先輸入的次序排列！
			// 若有必要，此時得用 config.before() 自行處理！
			if (typeof config.before === 'function') {
				// titles 可能為 undefined！
				// 注意: 與 wiki_API.prototype.work(config)
				// 之 config.before/config.after 連動。
				//
				// 2016/6/22 change API 應用程式介面變更:
				// .first(messages, titles, pages) → .before(messages, pages,
				// titles)
				// 2019/8/7 change API 應用程式介面變更:
				// .before(messages, pages, titles) → .before(messages, pages)
				// 按照需求程度編排 arguments，並改變適合之函數名。
				config.before.call(session, messages, pages);
			}

			/**
			 * 處理回傳超過 limit (12 MB)，被截斷之情形。
			 */
			if ('OK_length' in pages) {
				if (setup_target) {
					// -pages.length: 先回溯到 pages 開頭之 index。
					work_continue -= pages.length - pages.OK_length;
				} else {
					library_namespace.error('wiki_API.work: 回傳內容超過限度而被截斷！僅取得 '
							+ pages.length + '/' + this_slice_size + ' 個頁面');
				}

				library_namespace.debug('一次取得大量頁面時，回傳內容超過限度而被截斷。將回退 '
						+ (pages.length - pages.OK_length)
						+ '頁'
						+ (pages[pages.OK_length] ? '，下次將自 '
								+ pages.OK_length
								+ '/'
								+ pages.length
								+ ' '
								+ wiki_API
										.title_link_of(pages[pages.OK_length])
								+ ' id ' + pages[pages.OK_length].pageid
								+ ' 開始' : '') + '。', 1, 'wiki_API.work');
				pages = pages.slice(0, pages.OK_length);

			} else if (!config.no_warning && pages.length !== this_slice_size) {
				// assert: data.length < this_slice_size
				library_namespace.warn('wiki_API.work: 取得 ' + pages.length
						+ '/' + this_slice_size + ' 個頁面，應有 '
						+ (this_slice_size - pages.length) + ' 個不存在或重複頁面。');
			}

			// --------------------------------------------

			var page_index = 0;
			// for each page: 主要機制是一頁頁處理。
			function process_next_page() {
				if (false)
					console.trace('process_next_page: ' + page_index + '/'
							+ pages.length);
				if (messages.quit_operation) {
					// 警告: 直接清空 .actions 不安全！
					// session.actions.clear();
					work_continue = target.length;
					page_index = pages.length;
				}
				if (!(page_index < pages.length)) {
					if (false) {
						console.trace(
						// gettext_config:{"id":"processed-$1-pages"}
						gettext('Processed %1 {{PLURAL:%1|page|pages}}.',
								pages.length));
					}
					// setTimeout(): 跳出exit
					// callback。避免在callback中呼叫session.next()的問題。
					setTimeout(function() {
						session.run(finish_up);
					}, 0);
					return;
				}

				// ------------------------------

				var page = pages[page_index++];
				if (library_namespace.is_debug(2)
				// .show_value() @ interact.DOM, application.debug
				&& library_namespace.show_value)
					library_namespace.show_value(page, 'page');
				if (!page) {
					// nochange_count++;
					// Skip invalid page. 預防如 .work(['']) 的情況。
					process_next_page();
					return;
				}

				function work_page_callback(page_data, error) {
					// TODO: if (error) {...}
					// console.trace([ error_to_return, error ]);
					// console.log([ page_data, config.page_options ]);
					library_namespace.log_temporary(page_index + '/'
							+ pages.length + ' '
							+ wiki_API.title_link_of(page_data));
					var result;
					try {
						result = each.call(config, page_data, messages, config);
					} catch (e) {
						// console.trace([ error_to_return, error ]);
						error_to_return = error_to_return || e;
						if (typeof e === 'object') {
							console.error(e);
						} else {
							library_namespace.error([ 'wiki_API.work: ', {
								T : [
								// gettext_config:{"id":"page-handling-function-error-$1"}
								'Page handling function error: %1', String(e) ]
							} ]);
						}
					}

					if (library_namespace.is_thenable(result)) {
						result.then(function() {
							session.run(process_next_page);
						}, function(error) {
							error_to_return = error_to_return || error;
							session.run(process_next_page);
						});
					} else {
						// console.trace('session.run(process_next_page) ');
						setTimeout(function() {
							session.run(process_next_page);
						}, 0);
					}
					return result;
				}

				// console.log(page);
				// console.trace('session.running = ' + session.running);
				// 設定頁面內容。
				session.page(page, config.no_edit && work_page_callback,
						single_page_options);

				if (config.no_edit) {
					// 不作編輯作業。
					return;
				}

				// clone() 是為了能個別改變 summary。
				// 例如: each() { options.summary += " -- ..."; }
				var work_options = Object.clone(options);
				// 預防 page 本身是非法的頁面標題。當 session.page() 出錯時，將導致沒有 .last_page。
				work_options.task_page_data = page;
				// console.trace(work_options);
				// 編輯頁面內容。
				session.edit(function(page_data) {
					if (('missing' in page_data)
					//
					|| ('invalid' in page_data)) {
						// return [ wiki_API.edit.cancel, 'skip' ];
					}

					// edit/process
					if (!config.no_message) {
						var _messages = [ 'wiki_API.work: '
						// gettext_config:{"id":"edit-$1"}
						+ gettext('Edit %1', page_index + '/' + pages.length)
								+ ' ' ];
						if ('missing' in page_data) {
							_messages.push('fg=yellow',
							// gettext_config:{"id":"missing-page"}
							'Missing page');
						} else if ('invalid' in page_data) {
							_messages.push('fg=yellow',
							// gettext_config:{"id":"invalid-page-title"}
							'Invalid page title');
						} else {
							_messages.push('', '[[', 'fg=yellow',
							//
							page_data.title, '-fg', ']]');
						}
						library_namespace.sinfo(_messages);
					} else {
						library_namespace.log_temporary(
						//
						page_index + '/' + pages.length + ' '
						//
						+ wiki_API.title_link_of(page_data));
					}
					// 以 each() 的回傳作為要改變成什麼內容。
					var content;
					try {
						content = each.call(
						// 注意: this === work_options
						// 注意: this !== work_config === `config`
						// @see wiki_API.edit()
						this, page_data, messages, config);
					} catch (e) {
						error_to_return = error_to_return || e;
						if (typeof e === 'object') {
							console.error(e);
						} else {
							library_namespace.error([ 'wiki_API.work: ', {
								T : [
								// gettext_config:{"id":"page-edit-function-error-$1"}
								'Page edit function error: %1', String(e) ]
							} ]);
						}

						// return [wiki_API.edit.cancel, 'skip'];
					}

					// check_result_and_process_next(content);
					if (library_namespace.is_thenable(content)) {
						content.then(library_namespace.null_function, function(
								error) {
							// console.trace([ error_to_return, error ]);
							// console.log([ 'session.running = ' +
							// session.running,
							// session.actions.length ]);
							// `error_to_return` will record the first error.
							error_to_return = error_to_return || error;
						});
					}

					// console.trace(content);
					return content;

				}, work_options, function work_edit_callback(title, error,
						result) {
					// Do not set `error_to_return` here: `error` maybe 'skip'.
					// console.trace([ error_to_return, error ]);

					// console.trace(arguments);
					// nomally call do_batch_work_summary()
					callback.apply(session, arguments);
					session.run(process_next_page);
				});

			}

			process_next_page();

			// 不應用 .run(finish_up)，而應在 callback 中呼叫 finish_up()。
			function finish_up() {
				if (false) {
					console.trace(
					// gettext_config:{"id":"$1-pages-processed"}
					gettext('%1 {{PLURAL:%2|page|pages}} processed',
							pages.length, pages.length));
					console.log(pages[0].title);
				}
				if (!config.no_message) {
					library_namespace.debug('收尾。', 1, 'wiki_API.work');
					var count_summary;

					// pages: this_slice, this piece
					if (config.no_edit) {
						if (pages.length === initial_target_length) {
							// 一次取得所有頁面。
							count_summary = '';
						} else
							count_summary = pages.length + '/';
					} else if (pages.length === initial_target_length) {
						if (done === pages.length) {
							// 一次取得所有頁面。
							count_summary = '';
						} else
							count_summary = done + '/';
					} else {
						if (done === pages.length)
							count_summary = done + '//';
						else
							count_summary = done + '/' + pages.length + '//';
					}

					if (work_continue && work_continue < initial_target_length) {
						count_summary += ' '
						//
						+ work_continue + '/' + initial_target_length + ' ('
						// 紀錄整體進度
						+ (100 * work_continue / initial_target_length | 0)
								+ '%)';
					} else {
						count_summary += initial_target_length;
					}

					count_summary = new gettext.Sentence_combination([
					// gettext_config:{"id":"$1-pages-processed"}
					'%1 {{PLURAL:%2|page|pages}} processed'
					//
					+ (log_item.report ? ',' : ''),
					//
					count_summary, pages.length ]);
					// console.trace(count_summary);

					if (log_item.report) {
						if (nochange_count > 0) {
							count_summary.push(done === nochange_count
							// 未改變任何條目。 No pages have been changed
							// gettext_config:{"id":"no-page-modified"}
							? 'no page modified,' : [
							// gettext_config:{"id":"$1-pages-have-not-changed"}
							'%1 {{PLURAL:%1|page|pages}} have not changed,',
									nochange_count ]);
						}
						// 使用時間, 歷時, 前後總共費時, elapsed time
						// gettext_config:{"id":"$1-elapsed"}
						count_summary.push([ '%1 elapsed.',
								messages.start.age(new Date) ]);
						messages.unshift(count_summary.toString());
						count_summary.truncate(1);
					}
					count_summary = count_summary.toString();
					if (session.stopped) {
						messages
						// gettext_config:{"id":"stopped-give-up-editing"}
						.add(gettext("'''Stopped''', give up editing."));
					}
					if (done === nochange_count && !config.no_edit) {
						// gettext_config:{"id":"no-changes"}
						messages.add(gettext('No changes.'));
					}
					if (log_item.title && config.summary) {
						messages.unshift(summary_to_wikitext(config.summary),
								'');
					}
				}

				// run after every batch task. 在處理每個批次後執行此function。
				if (typeof config.after === 'function') {
					// 對於量過大而被分割者，每次分段結束都將執行一次 config.after()。
					// 注意: 與 wiki_API.prototype.work(config)
					// 之 config.before/config.after 連動。
					//
					// 2016/6/22 change API 應用程式介面變更:
					// .last(messages, titles, pages) → .after(messages, pages,
					// titles)
					// 2019/8/7 change API 應用程式介面變更:
					// .after(messages, pages, titles) → .after(messages, pages)
					// 按照需求程度編排 arguments，並改變適合之函數名。
					config.after.call(session, messages, pages);
				}

				var log_to = 'log_to' in config ? config.log_to
				// default log_to
				: session.token.login_user_name ? 'User:'
						+ session.token.login_user_name + '/log/'
						+ (new Date).format('%4Y%2m%2d') : null,
				// e.g., 480 : UTC+8
				timezone = session.configurations.timeoffset / 60,
				// options for summary.
				options = {
					// new section. append 章節/段落 after all, at bottom.
					section : 'new',
					// 新章節的標題。章節標題盡量使用可被引用的格式。
					sectiontitle : (new Date).format({
						zone : timezone,
						format : config.work_title_date_format
						//
						|| session.work_title_date_format
					}) + ' UTC' + (timezone < 0 ? '' : '+') + timezone + ': '
					//
					+ count_summary + (config.log_section_title_postfix
					//
					? ' ' + config.log_section_title_postfix : ''),
					// Robot: 若用戶名包含 'bot'，則直接引用之。
					// 注意: session.token.login_user_name 可能為 undefined！
					summary : (session.token.login_user_name
							&& PATTERN_BOT_NAME
									.test(session.token.login_user_name) ? session.token.login_user_name
							: 'Robot')
							+ ': ' + config.summary + count_summary,
					// prevent creating new pages
					// Throw an error if the page doesn't exist.
					// 若頁面不存在/已刪除，則產生錯誤。
					nocreate : 1,
					// denotes this is a bot edit. 標記此編輯為機器人編輯。
					bot : 1,
					// 就算設定停止編輯作業，仍強制編輯。一般僅針對測試頁面或自己的頁面，例如寫入 log。
					skip_stopped : true
				};

				if (config.no_message) {
					;
				} else if (log_to && (done !== nochange_count
				// 若全無變更，則預設僅從 console 提示，不寫入 log 頁面。因此無變更者將不顯示。
				|| config.log_nochange)) {
					// console.trace(log_to);
					// CeL.set_debug(6);
					session.page(log_to)
					// 將 robot 運作記錄、log summary 報告結果寫入 log 頁面。
					// TODO: 以表格呈現。
					.edit(messages.join('\n'), options,
					// wiki_API.work() 添加網頁報告。
					function(title, error, result) {
						if (error) {
							library_namespace.warn('wiki_API.work: '
							//
							+ 'Cannot write log to '
							//
							+ wiki_API.title_link_of(log_to)
							//
							+ '! Try to write to '
							//
							+ wiki_API.title_link_of('User:'
							//
							+ session.token.login_user_name));
							library_namespace.log('\nlog:<br />\n'
							//
							+ messages.join('<br />\n'));
							// 改寫於可寫入處。e.g., 'Wikipedia:Sandbox'
							// TODO: bug: 當分批時，只會寫入最後一次。
							session.page('User:'
							//
							+ session.token.login_user_name)
							//
							.edit(messages.join('\n'), options);
						}
					});
				} else {
					library_namespace.log('\nlog:<br />\n'
							+ messages.join('<br />\n'));
				}

				// --------------------
				// 處理記憶體洩漏問題 @ 20191129.check_language_conversion.js
				// console.log(process.memoryUsage());
				// delete session.last_pages;
				// 警告: 預設處理程序會清理掉解析後的資料。這可能造成嚴重錯誤，例如頁面被清空！
				if (!options.do_not_clean_parsed && Array.isArray(pages)) {
					// console.trace('主動清理 page_data.parsed 以釋放記憶體。');
					// console.log(pages[0]);
					// free:
					// 必須要主動清理 page_data.parsed 才能釋放記憶體。
					// @ 20191129.check_language_conversion.js
					// 不曉得是哪個環節索引了 page_data。
					pages.forEach(function(page_data, index) {
						if (page_data.parsed) {
							page_data.parsed.truncate();
							delete page_data.parsed;
						}
						// 以下效果不顯著。
						// Object.clean(page_data.parsed);
						// Object.clean(page_data);
						// delete pages[index];
					});
				}
				// `node --expose-gc *.js`
				// global.gc && global.gc();
				// console.trace([ target.length, process.memoryUsage(), session
				// ]);
				// --------------------

				if (setup_target
						&& (config.untouch_page_list ? work_continue : 0) < target.length) {
					// 繼續下一批。
					// setup_target();
					setTimeout(setup_target, 0);
					return;
				}

				// run this at last.
				// 在wiki_API.prototype.work()工作最後執行此config.last()。
				// config.callback()
				// 只有在成功時，才會繼續執行。
				//
				// 2016/6/22 change API 應用程式介面變更:
				// .after() → .last()
				// 改變適合之函數名。
				if (typeof config.last === 'function') {
					// last(error)
					session.run(config.last.bind(options, error_to_return));
				}

				if (!config.no_message) {
					session.run(function() {
						library_namespace.log('wiki_API.work: '
								// 已完成作業
								+ '結束 .work() 作業'
								+ (config.summary ? ' [' + config.summary + ']'
										: '。'));
					});
				}
			}

		};

		var target = pages,
		// const
		initial_target_length = target.length,
		//
		slice_size = max_slice_size(this, config),
		/** {ℕ⁰:Natural+0}自此 index 開始繼續作業 */
		work_continue = 0, this_slice_size, setup_target;

		// 首先取得多個頁面內容所用之 options。
		// e.g., page_options:{rvprop:'ids|content|timestamp'}
		// @see
		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Brevisions
		var page_options = {
			// call_from_wiki_API__work : 1 + Math.random(),

			// 為了降低記憶體使用，不把所有屬性添附至原有的 {Object}page_data 資料結構中。
			do_not_import_original_page_data : true,
			handle_continue_response : 'merge_response',
			allow_missing : config.no_warning,
			// multiple pages
			multi : true
		};
		// console.trace(page_options);
		// https://www.mediawiki.org/w/api.php?action=help&modules=query
		Object.keys(page_options).append(
				[ 'is_id', 'redirects', 'converttitles' ])
		//
		.forEach(function(parameter) {
			if (parameter in config) {
				library_namespace.debug('Copy [' + parameter
				//
				+ '] to page_options', 2, 'wiki_API.work');
				page_options[parameter] = config[parameter];
			}
		});
		Object.assign(page_options,
		// 可以之處理數目限制 limit。單一頁面才能取得多 revisions。多頁面(≤50)只能取得單一 revision。
		config.page_options);

		// 個別頁面會採用的 page options 選項。
		var single_page_options = Object.assign({
			// 已經在多個頁面的時候取得過內容，因此不需要再確認一次。只是要過個水設定一下。
			// 若是沒有設定這個選項，那麼對於錯誤的頁面，將會再嘗試取得。
			allow_missing : true
		}, config.page_options);
		// 在個別頁面還採取 .multi 這個選項會造成錯誤。
		delete single_page_options.multi;

		if (!config.no_edit) {
			var check_options = config.check_options;
			if (!check_options && typeof config.log_to === 'string'
			// 若 log_to 以數字作結，自動將其當作 section。
			&& (check_options = config.log_to.match(/\d+$/))) {
				check_options = {
					section : check_options[0]
				};
			}

			if (check_options) {
				// wiki_API.check_stop()
				this.check(check_options);
			}
		}

		// console.log(JSON.stringify(pages));
		// console.log(pages === target);
		// console.log(JSON.stringify(target));
		if (Array.isArray(target)) {
			if (!config.untouch_page_list) {
				// 避免 read-only page list。
				target = target.slice();
			}
			// Split when length is too long. 分割過長的 page list。
			setup_target = (function() {
				var this_slice = config.untouch_page_list ? target.slice(
						work_continue, work_continue + slice_size)
				// 執行完一批就刪除一批，以減少記憶體使用。
				: target.splice(0, slice_size);
				var max_size = max_slice_size(this, config, this_slice);

				if (false) {
					console
							.log([ 'max_size:', max_size, this_slice.length,
									initial_target_length, config.is_id,
									work_continue ]);
				}
				if (max_size < slice_size) {
					if (!config.untouch_page_list) {
						// 回填本次無法處理之 pages。
						Array.prototype.unshift.apply(target, this_slice
								.slice(max_size));
					}
					this_slice = this_slice.slice(0, max_size);
				}
				if (work_continue === 0 && max_size === initial_target_length) {
					library_namespace.debug('設定一次先取得所有 ' + max_size
							+ ' 個頁面之 revisions (page contents 頁面內容)。', 2,
							'wiki_API.work');
				} else {
					done = gettext(
					// gettext_config:{"id":"processing-chunks-$1-$2"}
					'處理分塊 %1–%2', work_continue + 1, work_continue
					// start–end/all
					+ Math.min(max_size, initial_target_length)) + '/'
							+ initial_target_length;
					// Add percentage message.
					if (initial_target_length > 1e4
					// 數量太大或執行時間過長時，就顯示剩餘時間訊息。
					|| Date.now() - config.start_working_time > 2 * 60 * 1000) {
						done += estimated_message(work_continue,
								initial_target_length,
								config.start_working_time);
					}
					// done += '。';
					nochange_count = 'wiki_API.work: ';
					done = config.summary ? [ nochange_count, 'fg=green',
							String(config.summary), '-fg', ': ' + done ]
							: [ nochange_count + done ];
					library_namespace.sinfo(done);
				}

				// reset count and log.
				done = nochange_count = 0;
				messages.reset();

				this_slice_size = this_slice.length;
				work_continue += this_slice_size;

				// 假如想要全部轉換成 pageids，必須考量有些頁面可能沒有 pageid 的問題。
				if (false)
					console.trace('一次取得本 slice 所有頁面內容。'
							+ [ maybe_nested_thread, session.running,
									session.actions.length ]);
				// console.trace(page_options);
				this.page(this_slice, main_work, page_options);
			}).bind(this);

			config.start_working_time = Date.now();
			setup_target();

		} else {
			// assert: target is {String}title or {Object}page_data
			library_namespace.debug('取得單一頁面之 (page contents 頁面內容)。', 2,
					'wiki_API.work');
			this.page(target, main_work, page_options);
		}
	};

	/**
	 * 選擇要紀錄的項目。在大量編輯時，可利用此縮減 log。
	 * 
	 * @type {Object}
	 */
	wiki_API.prototype.work.log_item = {
		title : true,
		report : true,
		get_pages : true,
		// 跳過[[WP:NULLEDIT|無改變]]的。
		// nochange : false,
		error : true,
		succeed : true
	};

	// --------------------------------------------------------------------------------------------
	// 以下皆泛用，無須 wiki_API instance。

	// ------------------------------------------------------------------------

	wiki_API.assert_user_right = function(assert_type, callback, options) {
		TODO;

		// besure {Function}callback
		callback = typeof callback === 'function' && callback;

		var session = wiki_API.session_of_options(options);
		// 支援斷言編輯功能。
		var action = 'assert=' + (assert_type || 'user');
		if (session.API_URL) {
			library_namespace.debug('API URL: [' + session.API_URL + ']。', 3,
					'wiki_API.assert_user_right');
			action = [ session.API_URL, action ];
		}
		library_namespace.debug('action: [' + action + ']。', 3,
				'wiki_API.assert_user_right');

		library_namespace.debug('準備確認權限。', 1, 'wiki_API.assert_user_right');
		wiki_API.query(action, function(data) {
			// console.trace(data);
			// 確認尚未登入，才作登入動作。
			if (data === '') {
				// 您已登入。
				library_namespace.debug('You are already logged in.', 1,
						'wiki_API.assert_user_right');
				callback(data);
				return;
			}

			callback(data);
		});
	};

	// 未登錄/anonymous時的token
	var BLANK_TOKEN = '+\\';

	// get token
	// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Btokens
	wiki_API.prototype.get_token = function(callback, options) {
		// assert: this (session) 已登入成功， callback 已設定好。
		// 前置處理。
		if (typeof options === 'string') {
			options = {
				type : options
			};
		} else {
			options = library_namespace.setup_options(options);
		}
		var type = options.type
		// default_type: csrf (cross-site request forgery) token
		|| 'csrf';
		// TODO: for {Array}type
		var session = this, token = session.token;
		if (!options.force && token[type + 'token']) {
			// 已存有此 token。
			callback(token[type + 'token']);
			return this;
		}

		library_namespace.debug('Try to get the ' + type + 'token ...', 1,
				'wiki_API.prototype.get_token');
		// console.log(this);
		wiki_API.query([ session.API_URL,
		// https://www.mediawiki.org/wiki/API:Tokens
		// 'action=query&meta=tokens&type=csrf|login|watchlist'
		'action=query&meta=tokens' + (type ? '&type=' + type : '') ],
		//
		function(data) {
			if (data && data.query && data.query.tokens) {
				// 設定 tokens。
				Object.assign(session.token, data.query.tokens);
				if (!session.token[type + 'token'])
					session.token[type + 'token'] = BLANK_TOKEN;
				library_namespace.debug(
				//
				type + 'token: ' + session.token[type + 'token']
				//
				+ (session.token[type + 'token'] === BLANK_TOKEN
				//
				? ' (login as anonymous!)' : ''),
				//
				1, 'wiki_API.prototype.token');
				// console.log(this);
				callback(session.token[type + 'token'] || session.token);
				return;
			}

			library_namespace.error(
			//
			'wiki_API.prototype.token: Unknown response: ['
			//
			+ (data && data.warnings && data.warnings.tokens
			//
			&& data.warnings.tokens['*'] || data) + ']');
			if (library_namespace.is_debug()
			// .show_value() @ interact.DOM, application.debug
			&& library_namespace.show_value)
				library_namespace.show_value(data);
			callback();
		},
		// Tokens may not be obtained when using a callback
		Object.create(null), session);
		return this;
	};

	if (false) {
		login_user_name = CeL.wiki
				.extract_login_user_name(login_options.user_name);
		user_name === CeL.wiki.normalize_title(wiki.token.login_user_name);
	}
	// "owner_name@user_name" → "user_name"
	// Should use session.login_user_info.name
	wiki_API.extract_login_user_name = function(lgname) {
		// https://www.mediawiki.org/w/api.php?action=help&modules=login
		var matched = lgname.match(/@(.+)$/);
		// 機器人名稱： user name or pure bot name
		return wiki_API.normalize_title(matched
		// e.g., "alias_bot_name@main_bot_name" → "main_bot_name"
		? matched[1].trim() : lgname);

		return wiki_API.normalize_title(lgname.replace(/^[^@]+@/, '').trim());
	};

	// 登入認證用。
	// https://www.mediawiki.org/wiki/API:Login
	// https://www.mediawiki.org/wiki/API:Edit
	// 認證用 cookie:
	// {zhwikiSession,centralauth_User,centralauth_Token,centralauth_Session,wikidatawikiSession,wikidatawikiUserID,wikidatawikiUserName}
	//
	// TODO: https://www.mediawiki.org/w/api.php?action=help&modules=clientlogin
	wiki_API.login = function(user_name, password, login_options) {
		var error;
		function _next() {
			// popup 'login'.
			// assert: session.actions[0] === ['login']
			if (session.actions[0] && session.actions[0][0] === 'login')
				session.actions.shift();

			if (!error && (!session.login_user_info
			// get the user right to check 'apihighlimits'
			|| session.login_user_info.name !== session.token.login_user_name)) {
				session.running = false;
				session.userinfo('rights|blockinfo|centralids', function(
						userinfo, error) {
					// console.trace(userinfo);
					session.login_user_info = userinfo;
					_next();
				});
				return;
			}

			callback
			// 注意: new wiki_API() 後之操作，應該採 wiki_session.run()
			// 的方式，確保此時已經執行過 pre-loading functions @ function wiki_API():
			// wiki_session.siteinfo(), wiki_session.adapt_task_configurations()
			&& session.run(callback.bind(session,
			// instead of session.token.lgname
			session.token.login_user_name, error));
			library_namespace.debug('已登入 [' + session.token.lgname
					+ ']。自動執行 .next()，處理餘下的工作。', 1, 'wiki_API.login');
			session.next();
		}

		function _done(data, _error) {
			// 注意: 在 mass edit 時會 lose token (badtoken)，需要保存 password。
			if (!session.preserve_password) {
				// 捨棄 password。
				delete session.token.lgpassword;
			}

			if (session.token.lgname) {
				session.token.login_user_name
				//
				= wiki_API.extract_login_user_name(session.token.lgname);
			}

			// reset query limit for login as bot.
			delete session.slow_query_limit;

			// console.log(JSON.stringify(data));
			if (data && data.warnings) {
				// console.log(JSON.stringify(data.warnings));
			}

			if (_error) {
				error = _error;
			} else if (data && (data = data.login)) {
				if (data.result === 'Success') {
					wiki_API.login.copy_keys.forEach(function(key) {
						if (data[key]) {
							session.token[key] = data[key];
						}
					});

					delete session.login_failed_count;
					// 紀錄最後一次成功登入。
					// session.last_login = new Date;
				} else {
					// login error
					if (!(session.login_failed_count > 0)) {
						session.login_failed_count = 1;
					} else if (++session.login_failed_count > wiki_API.login.MAX_ERROR_RETRY) {
						// 連續登入失敗太多次就跳出程序。
						throw 'wiki_API.login: Login failed '
								+ session.login_failed_count + ' times! Exit!';
					}
					// delete session.last_login;

					/**
					 * 當沒有登入成功時的處理以及警訊。
					 * 
					 * e.g., data = <code>
					{"login":{"result":"Failed","reason":"Incorrect password entered.\nPlease try again."}}

					{"login":{"result":"Failed","reason":"You have made too many recent login attempts. Please wait 5 minutes before trying again."}}

					{"warnings":{"main":{"*":"Subscribe to the mediawiki-api-announce mailing list at <https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce> for notice of API deprecations and breaking changes."},"login":{"*":"Main-account login via \"action=login\" is deprecated and may stop working without warning. To continue login with \"action=login\", see [[Special:BotPasswords]]. To safely continue using main-account login, see \"action=clientlogin\"."}},"login":{"result":"Success","lguserid":263674,"lgusername":"Cewbot"}}
					 * </code>
					 */
					library_namespace.error('wiki_API.login: login ['
							+ session.token.lgname + '] failed '
							+ session.login_failed_count + '/'
							+ wiki_API.login.MAX_ERROR_RETRY + ': ['
							+ data.result + '] ' + data.reason + ' ('
							+ session.API_URL + ')');
					if (data.result !== 'Failed' || data.result !== 'NeedToken') {
						// Unknown result
					}
					error = data;
				}
			}
			session.get_token(_next);
		}

		// ------------------------------------------------

		var callback, session, API_URL;
		if (!login_options && !password
				&& library_namespace.is_Object(user_name)) {
			// .login(option); treat user_name as option

			// session = CeL.wiki.login(login_options);
			login_options = Object.clone(user_name);
			// console.log(login_options);
			user_name = login_options.user_name;
			// user_password
			password = login_options.password;
		}
		if (library_namespace.is_Object(login_options)) {
			API_URL = login_options.API_URL/* || login_options.project */;
			session = wiki_API.session_of_options(login_options);
			// besure {Function}callback
			callback = typeof login_options.callback === 'function'
					&& login_options.callback;
		} else if (typeof login_options === 'function') {
			callback = login_options;
			// 前置處理。
			login_options = Object.create(null);
		} else if (typeof login_options === 'string') {
			// treat login_options as API_URL
			API_URL = login_options;
			login_options = Object.create(null);
		} else {
			// 前置處理。
			login_options = library_namespace.new_options(login_options);
		}

		// console.trace([ user_name, password, API_URL ]);
		library_namespace.debug('API_URL: ' + API_URL + ', default language: '
				+ wiki_API.language, 3, 'wiki_API.login');

		if (session) {
			delete login_options.is_running;
		} else {
			// 初始化 session 與 agent。這裡 callback 當作 API_URL。
			if (user_name && password) {
				login_options.is_running = 'login';
			} else {
				// 後面會直接 return
			}
			session = new wiki_API(user_name, password, login_options);
		}
		if (!user_name || !password) {
			library_namespace.warn('wiki_API.login: ' +
			//
			'The user name or password is not provided. Abandon login attempt.'
			//		
			);
			// console.trace('Stop login');
			callback && session.run(callback.bind(session));
			return session;
		}

		// copy configurations
		library_namespace.import_options(login_options, copy_login_options,
				session);

		if (!('login_mark' in login_options) || login_options.login_mark) {
			// hack: 這表示正 log in 中，當 login 後，會自動執行 .next()，處理餘下的工作。
			// @see wiki_API.prototype.next
			if (login_options.is_running) {
				// assert: session.actions === [ 'login' ]
			} else if (login_options.login_mark) {
				// 將 'login' 置於工作佇列最前頭。
				session.actions.unshift([ 'login' ]);
			} else {
				// default: 依順序將 'login' 置於最末端。
				session.actions.push([ 'login' ]);
			}
		}
		// 支援斷言編輯功能。
		var action = {
			assert : 'user'
		};
		if (session.API_URL) {
			library_namespace.debug('API URL: [' + session.API_URL + ']。', 3,
					'wiki_API.login');
			action = [ session.API_URL, action ];
		}
		library_namespace.debug('action: [' + action + ']。', 3,
				'wiki_API.login');

		library_namespace.debug('準備登入 [' + user_name + ']。', 1,
				'wiki_API.login');
		wiki_API.query(action, function(data) {
			// console.trace(data);
			// 確認尚未登入，才作登入動作。
			if (data === '' && !login_options.force) {
				// 您已登入。
				library_namespace.debug('You are already logged in.', 1,
						'wiki_API.login');
				_done();
				return;
			}

			delete session.token.csrftoken;
			// Credentials type: Password-based authentication
			// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Btokens
			// wiki_API.query(action, callback, post_data, login_options)
			wiki_API.query([ session.API_URL, {
				// Fetching a token via "action=login" is deprecated.
				// Use "action=query&meta=tokens&type=login" instead.
				// https://www.mediawiki.org/wiki/MediaWiki_1.37/Deprecation_of_legacy_API_token_parameters
				action : 'query',
				meta : 'tokens',
				type : 'login'
			} ], function(data, _error) {
				// console.trace(data);
				// error && console.error(error);
				if (_error || !data || !data.query || !data.query.tokens
						|| !data.query.tokens.logintoken) {
					library_namespace.error(
					//		
					'wiki_API.login: 無法 login！ Abort! Response:');
					error = _error;
					library_namespace.error(error || data);
					callback
							&& session.run(callback.bind(session, null, error
									|| data));
					return;
				}

				Object.assign(session.token, data.query.tokens);
				// console.log(data.query.tokens);
				// https://www.mediawiki.org/w/api.php?action=help&modules=login
				var token = Object.create(null);
				for ( var parameter in wiki_API.login.parameters) {
					var key = wiki_API.login.parameters[parameter];
					if (key in session.token)
						token[parameter] = session.token[key];
				}
				// console.log(token);
				wiki_API.query([ session.API_URL, {
					action : 'login'
				} ], _done, token, session);
			}, null, session);

			return;

			// deprecated:

			// https://www.mediawiki.org/w/api.php?action=help&modules=login
			var token = Object.assign(Object.create(null), session.token);
			// console.log(token);
			// .csrftoken 是本函式為 cache 加上的，非正規 parameter。
			delete token.csrftoken;
			wiki_API.query([ session.API_URL,
			// 'action=query&meta=tokens&type=login|csrf'
			'action=login' ], function(data, error) {
				// console.trace(data);
				// error && console.error(error);
				if (data && data.login && data.login.result === 'NeedToken') {
					token.lgtoken = session.token.lgtoken = data.login.token;
					wiki_API.query([ session.API_URL, 'action=login' ], _done,
							token, session);
				} else {
					library_namespace.error(
					//		
					'wiki_API.login: 無法 login！ Abort! Response:');
					library_namespace.error(data);
					if (callback)
						session.run(callback.bind(session, null, data));
				}
			}, token, session);

		}, null, session);

		return session;
	};

	/** {Natural}登入失敗時最多重新嘗試下載的次數。 */
	wiki_API.login.MAX_ERROR_RETRY = 2;

	wiki_API.login.parameters = {
		lgname : 'lgname',
		lgpassword : 'lgpassword',
		lgtoken : 'logintoken',
		lgdomain : 'lgdomain'
	};

	var copy_login_options = {
		preserve_password : 'boolean'
	};

	/** {Array}欲 copy 至 session.token 之 keys。 */
	wiki_API.login.copy_keys = 'lguserid,lgtoken,cookieprefix,sessionid'
			.split(',');

	// ------------------------------------------------------------------------

	wiki_API.logout = function(session, callback) {
		var API_URL = typeof session === 'string' ? session : wiki_API
				.API_URL_of_options(session);
		wiki_API.query([ API_URL, 'action=logout' ], function(data) {
			// data: {}
			// console.log(data);
			delete session.token;
			if (typeof callback === 'function') {
				callback.call(session, data);
			}
		});
	};

	// --------------------------------------------------------------------------------------------

	// export 導出.

	// @inner
	library_namespace.set_method(wiki_API, {
		max_slice_size : max_slice_size,

		BLANK_TOKEN : BLANK_TOKEN
	});

	// ------------------------------------------

	// @static
	Object.assign(wiki_API, {
		estimated_message : estimated_message,

		PATTERN_BOT_NAME : PATTERN_BOT_NAME
	});

	// 不設定(hook)本 module 之 namespace，僅執行 module code。
	return library_namespace.env.not_to_extend_keyword;
}
