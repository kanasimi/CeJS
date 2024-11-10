/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): query
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * TODO:<code>


</code>
 * 
 * @since 2019/10/11 拆分自 CeL.application.net.wiki
 */

// More examples: see /_test suite/test.js
// Wikipedia bots demo: https://github.com/kanasimi/wikibot
'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.wiki.query',

	require : 'application.net.Ajax.get_URL'
	// URLSearchParams()
	+ '|application.net.'
	// library_namespace.age_of()
	+ '|data.date.' + '|application.net.wiki.'
	// load MediaWiki module basic functions
	+ '|application.net.wiki.namespace.'
	// for BLANK_TOKEN
	+ '|application.net.wiki.task.',

	// 設定不匯出的子函式。
	no_extend : 'this,*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var get_URL = this.r('get_URL');

	var wiki_API = library_namespace.application.net.wiki, KEY_SESSION = wiki_API.KEY_SESSION;
	// @inner
	var setup_API_URL = wiki_API.setup_API_URL, BLANK_TOKEN = wiki_API.BLANK_TOKEN;

	var gettext = library_namespace.cache_gettext(function(_) {
		gettext = _;
	});

	// --------------------------------------------------------------------------------------------
	// 以下皆泛用，無須 wiki_API instance。

	// badtoken 超過這個次數則直接跳出。
	var max_badtoken_count = 2;

	function check_session_badtoken(result, callback, options) {
		var session = wiki_API.session_of_options(options);
		if (!session) {
			// run next action
			callback(result);
			return;
		}

		// console.trace(result);
		if (result ? result.error
		// 當運行過多次，就可能出現 token 不能用的情況。需要重新 get token。
		? result.error.code === 'badtoken'
		// The "token" parameter must be set.
		|| result.error.code === 'notoken'
		//
		: options.rollback_action && !options.get_page_before_undo
		// 有時 result 可能會是 ""，或者無 result.edit。這通常代表 token lost。
		&& (
		// e.g., {edit:{result:'Success',...}}
		!result.edit
		// e.g., {changecontentmodel:{result:'Success',...}}
		&& !result.changecontentmodel
		// flow:
		// {status:'ok',workflow:'...',committed:{topiclist:{...}}}
		&& result.status !== 'ok'
		// e.g., success:1 @ wikidata
		&& !result.success) : result === '') {
			// Invalid token
			if (session.badtoken_count > 0)
				session.badtoken_count++;
			else
				session.badtoken_count = 1;
			library_namespace.warn([ 'check_session_badtoken: ',
			//
			(new Date).format(), ' ', wiki_API.site_name(session), ': ', {
				// gettext_config:{"id":"it-seems-that-the-token-is-lost"}
				T : '似乎丟失了令牌。'
			}, '(' + session.badtoken_count + '/' + max_badtoken_count + ')' ]);
			// console.trace(options);
			// console.trace(result);

			if (session.badtoken_count >= (isNaN(session.max_badtoken_count) ? max_badtoken_count
					// 設定 `session.max_badtoken_count = 0` ，那麼只要登入一出問題就直接跳出。
					: session.max_badtoken_count)) {
				throw new Error('check_session_badtoken: ' + gettext(
				// gettext_config:{"id":"too-many-badtoken-errors!-please-re-execute-the-program"}
				'Too many badtoken errors! Please re-execute the program!'));
				// delete session.badtoken_count;
			}

			if (!library_namespace.platform.nodejs) {
				// throw new Error();
				library_namespace.warn([ 'check_session_badtoken: ', {
					// gettext_config:{"id":"not-using-node.js"}
					T : 'Not using node.js!'
				} ]);
				callback(result);
				return;
			}

			// 下面的 workaround 僅適用於 node.js。

			// 不應該利用 `session[wiki_API.KEY_HOST_SESSION].token.lgpassword`，
			// 而是該設定 `session.preserve_password`。
			if (!session.token.lgpassword) {
				// console.log(result);
				// console.trace(session);
				// 死馬當活馬醫，仍然嘗試重新取得 token... 沒有密碼無效。
				throw new Error('check_session_badtoken: ' + gettext(
				// gettext_config:{"id":"no-password-preserved"}
				'未保存密碼！'));
			}

			// console.log(result);
			// console.log(options.action);
			// console.trace(session);
			// library_namespace.set_debug(3);
			if (typeof options.rollback_action === 'function') {
				// rollback action
				options.rollback_action();
			} else if (options.requery) {
				// hack: 登入後重新執行
				session.actions.unshift([ 'run', options.requery ]);
			} else {
				var message = 'check_session_badtoken: ' + gettext(
				// gettext_config:{"id":"did-not-set-$1"}
				'Did not set %1!', 'options.rollback_action()');
				throw new Error(message);
				library_namespace.error(message);
				console.trace(options);
			}

			// reset node agent.
			// 應付 2016/1 MediaWiki 系統更新，
			// 需要連 HTTP handler 都重換一個，重起 cookie。
			// 發現大多是因為一次處理數十頁面，可能遇上 HTTP status 413 的問題。
			setup_API_URL(session, true);
			if (false && result === '') {
				// force to login again: see wiki_API.login
				delete session.token.csrftoken;
				delete session.token.lgtoken;
				// library_namespace.set_debug(6);
			}
			// TODO: 在這即使 rollback 了 action，
			// 還是可能出現丟失 next[2].page_to_edit 的現象。
			// e.g., @ 20160517.interlanguage_link_to_wikilinks.js

			// 直到 .edit 動作才會出現 badtoken，
			// 因此在 wiki_API.login 尚無法偵測是否 badtoken。
			if ('retry_login' in session) {
				if (++session.retry_login > ('max_retry_login' in session ? session.max_retry_login
						: 2)) {
					// 當錯誤 login 太多次時，直接跳出。
					throw new Error('check_session_badtoken: '
					// gettext_config:{"id":"too-many-failed-login-attempts-$1"}
					+ gettext('Too many failed login attempts: %1',
					//
					'[' + session.token.lgname + ']'));
				}
				library_namespace.info('check_session_badtoken: Retry '
						+ session.retry_login);
			} else {
				session.retry_login = 0;
			}

			library_namespace.info([ 'check_session_badtoken: ', {
				// gettext_config:{"id":"try-to-get-the-token-again"}
				T : '嘗試重新取得令牌。'
			} ]);
			wiki_API.login(session.token.lgname,
			//
			session.token.lgpassword, {
				force : true,
				// [KEY_SESSION]
				session : session,
				// 將 'login' 置於最前頭。
				login_mark : true
			});

		} else {
			if (result && result.edit) {
				if ('retry_login' in session) {
					console.trace('已成功 edit，去除 retry flag。');
					delete session.retry_login;
				}
				if ('badtoken_count' in session) {
					console.trace('已成功 edit，去除 badtoken_count flag。');
					delete session.badtoken_count;
				}
			}
			// run next action
			callback(result);
			// 注意: callback() 必須採用 handle_error() 來測試是否出問題!
		}
	}

	var need_to_wait_error_code = new Set([ 'maxlag', 'ratelimited' ]);

	/**
	 * 實際執行 query 操作，直接 call API 之核心函數。 wiki_API.query()
	 * 
	 * 所有會利用到 wiki_API.prototype.work ← wiki_API.prototype.next ← <br />
	 * wiki_API.page, wiki_API.edit, ... ← wiki_API_query ← get_URL ← <br />
	 * need standalone http agent 的功能，都需要添附 session 參數。
	 * 
	 * -----------------------------------------
	 * 
	 * accept action: {URL}
	 * 
	 * action: {Search_parameters|URLSearchParams}parameters:<br />
	 * will get API_URL from options for undefined API
	 * 
	 * action: [ {String|Undefined}API,
	 * {Object|Search_parameters|URLSearchParams|String}parameters ]:<br />
	 * will get API_URL from options for undefined API
	 * 
	 * -----------------------------------------
	 * 
	 * @param {String|Array}action
	 *            {String}action or [ {String}api URL, {String}action,
	 *            {Object}other parameters ]
	 * @param {Function}callback
	 *            回調函數。 callback(response data, error)
	 * @param {Object}[POST_data]
	 *            data when need using POST method
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項<br />
	 *            wiki_API.edit 可能輸入 session 當作 options。
	 * 
	 * @see api source:
	 *      https://phabricator.wikimedia.org/diffusion/MW/browse/master/includes/api
	 * 
	 * @since 2021/2/27 6:13:20 remove wiki_API.use_Varnish: 這方式已被 blocked。
	 */
	function wiki_API_query(action, callback, POST_data, options) {
		// 前置處理。
		options = library_namespace.setup_options(options);

		if (typeof callback !== 'function') {
			throw new Error('wiki_API_query: No {Function}callback!');
		}
		// console.trace(POST_data);

		// 處理 action
		// console.trace([action, POST_data]);
		library_namespace.debug('action: ' + action, 2, 'wiki_API_query');
		// new URLSearchParams() 會將數值轉成字串。 想二次利用 {Object}, {Array}，得採用
		// new CeL.URI() 而非 new URL()。
		if ((action instanceof URL) || library_namespace.is_URI(action)) {
			// Skip normalized URL
		} else if (typeof action === 'string' && /^https?:\/\//.test(action)) {
			action = new library_namespace.URI(action);
		} else if (typeof action === 'string'
		// TODO: {Map}, {Set}
		|| (action instanceof URLSearchParams)
				|| library_namespace.is_Search_parameters(action)
				// check if `action` is plain {Object}
				|| library_namespace.is_Object(action)) {
			action = [ , action ];
		} else if (!Array.isArray(action)) {
			// Invalid URL?
			library_namespace.warn([ 'wiki_API_query: ', {
				// gettext_config:{"id":"invalid-url-$1"}
				T : [ '網址無效：%1', '[' + typeof action + '] ' + action ]
			} ]);
			console.trace(action);
		}
		if (Array.isArray(action)) {
			// [ {String}api URL, {String}action, {Object}other parameters ]
			// → {URI}URL
			if (!library_namespace.is_Search_parameters(action[1])) {
				if (typeof action[1] === 'string'
				// https://www.mediawiki.org/w/api.php?action=help&modules=query
				&& !/^[a-z]+=/.test(action[1]) && !options.post_data_only) {
					// 未明確指定
					library_namespace.warn([ 'wiki_API_query: ', {
						// gettext_config:{"id":"did-not-set-$1"}
						T : [ 'Did not set %1!', 'action' ]
					}, {
						// gettext_config:{"id":"will-set-$1-automatically"}
						T : [ '將自動設定 %1。', JSON.stringify('action=') ]
					} ]);
					console.trace(action);
					action[1] = 'action=' + action[1];
				}
				action[1] = library_namespace.Search_parameters(action[1]);
			}
			library_namespace.debug('api URL: ('
					+ (typeof action[0])
					+ ') ['
					+ action[0]
					+ ']'
					+ (action[0] === wiki_API.api_URL(action[0]) ? '' : ' → ['
							+ wiki_API.api_URL(action[0]) + ']'), 3,
					'wiki_API_query');
			action[0] = wiki_API.api_URL(action[0], options);
			action[0] = library_namespace.URI(action[0]);
			action[0].search_params.set_parameters(action[1]);
			if (action[2]) {
				// additional parameters
				action[0].search_params.set_parameters(action[2]);
			}
			action = action[0];
		} else {
			// {URL|CeL.URI}action
			action = library_namespace.URI(action);
		}
		// assert: library_namespace.is_URI(action)
		// console.trace(action);

		// additional parameters
		if (options.additional_query) {
			action.search_params.set_parameters(options.additional_query);
			delete options.additional_query;
		}
		// console.trace([ action, options ]);

		var session = wiki_API.session_of_options(options);
		if (!/^-?\d+$/.test(action.search_params.maxlag)) {
			if (action.search_params.maxlag) {
				library_namespace
						.warn('wiki_API_query: Invalid maxlag, use default: '
								+ action.search_params.maxlag);
			}
			// respect maxlag
			var maxlag = !isNaN(options.maxlag) ? options.maxlag : session
					&& !isNaN(session.maxlag) ? session.maxlag
					: wiki_API_query.default_maxlag;
			if (/^-?\d+$/.test(maxlag))
				action.search_params.maxlag = maxlag;
		}

		// respect edit time interval. 若為 query，非 edit (modify)，則不延遲等待。
		var need_check_edit_time_interval
		// method 2: edit 時皆必須設定 token。
		= POST_data && POST_data.token,
		// 檢測是否間隔過短。支援最大延遲功能。
		to_wait,
		// edit time interval in ms
		edit_time_interval = options.edit_time_interval >= 0
		//
		? options.edit_time_interval :
		// ↑ wiki_API.edit 可能輸入 session 當作 options。
		// options[KEY_SESSION] && options[KEY_SESSION].edit_time_interval ||
		wiki_API_query.default_edit_time_interval;

		if (need_check_edit_time_interval) {
			to_wait = edit_time_interval
					- (Date.now() - wiki_API_query.last_operation_time[action.origin]);
		}

		// TODO: 伺服器負載過重的時候，使用 exponential backoff 進行延遲。
		if (to_wait > 0) {
			library_namespace.debug({
				// gettext_config:{"id":"waiting-$1"}
				T : [ 'Waiting %1...', library_namespace.age_of(0, to_wait, {
					digits : 1
				}) ]
			}, 2, 'wiki_API_query');
			setTimeout(function() {
				wiki_API_query(action, callback, POST_data, options);
			}, to_wait);
			return;
		}
		if (need_check_edit_time_interval) {
			// reset timer
			wiki_API_query.last_operation_time[action.origin] = Date.now();
		} else {
			library_namespace.debug('非 edit (modify)，不延遲等待。', 3,
					'wiki_API_query');
		}

		var original_action = action.toString();

		// [[mw:API:Data_formats]]
		// 因不在 white-list 中，無法使用 CORS。
		if (session && session.general_parameters) {
			action.search_params.set_parameters(session.general_parameters);
		} else if (!action.search_params.format
				&& wiki_API.general_parameters.format) {
			action.search_params.set_parameters(wiki_API.general_parameters);
		}
		// console.trace(action, POST_data);

		// 開始處理 query request。
		if (!POST_data && wiki_API_query.allow_JSONP) {
			library_namespace.debug(
					'採用 JSONP callback 的方法。須注意：若有 error，將不會執行 callback！', 2,
					'wiki_API_query');
			library_namespace.debug('callback : (' + (typeof callback) + ') ['
					+ callback + ']', 3, 'wiki_API_query');
			get_URL(action, {
				callback : callback
			});
			return;
		}

		// console.log('-'.repeat(79));
		// console.log(options);
		var get_URL_options = Object.assign(
		// 防止汙染，重新造一個 options。不汙染 wiki_API_query.get_URL_options
		Object.clone(wiki_API_query.get_URL_options), options.get_URL_options);

		if (session) {
			// assert: {String|Undefined}action.search_params.action
			if (action.search_params.action === 'edit' && POST_data
			//
			&& (!POST_data.token || POST_data.token === BLANK_TOKEN)
			// 防止未登錄編輯
			&& session.token
			//
			&& (session.token.lgpassword || session.preserve_password)) {
				// console.log([ action, POST_data ]);
				library_namespace.error('wiki_API_query: 未登錄編輯？');
				throw new Error('wiki_API_query: 未登錄編輯？');
			}

			// assert: get_URL_options 為 session。
			if (!session.get_URL_options) {
				library_namespace.debug(
						'為 wiki_API instance，但無 agent，需要造出 agent。', 2,
						'wiki_API_query');
				setup_API_URL(session, true);
			}
			Object.assign(get_URL_options, session.get_URL_options);
			// console.trace([ get_URL_options, session.get_URL_options ]);
		}

		if (options.form_data) {
			// @see wiki_API.upload()
			library_namespace.debug('Set form_data', 6);
			// throw 'Set form_data';
			// options.form_data 會被當作傳入 to_form_data() 之 options。
			// to_form_data() will get file using get_URL()
			get_URL_options.form_data = options.form_data;
		}

		var agent = get_URL_options.agent;
		if (agent && agent.last_cookie && (agent.last_cookie.length > 80
		// cookie_cache: 若是用同一個 agent 來 access 過多 Wikipedia 網站，
		// 可能因載入 wikiSession 過多，如 last_cookie.length >= 86，
		// 而造成 413 (請求實體太大)。
		|| agent.cookie_cache)) {
			if (agent.last_cookie.length > 80) {
				library_namespace.debug('重整 cookie[' + agent.last_cookie.length
						+ ']。', 1, 'wiki_API_query');
				if (!agent.cookie_cache)
					agent.cookie_cache
					// {zh:['','',...],en:['','',...]}
					= Object.create(null);
				var last_cookie = agent.last_cookie;
				agent.last_cookie = [];
				while (last_cookie.length > 0) {
					var cookie_item = last_cookie.pop();
					if (!cookie_item) {
						// 不知為何，也可能出現這種 cookie_item === undefined 的情況。
						continue;
					}
					var matched = cookie_item.match(/^([a-z_\d]{2,20})wiki/);
					if (matched) {
						var language = matched[1];
						if (language in agent.cookie_cache)
							agent.cookie_cache[language].push(cookie_item);
						else
							agent.cookie_cache[language] = [ cookie_item ];
					} else {
						agent.last_cookie.push(cookie_item);
					}
				}
				library_namespace.debug('重整 cookie: → ['
						+ agent.last_cookie.length + ']。', 1, 'wiki_API_query');
			}

			var language = wiki_API.get_first_domain_name_of_session(session);
			if (!language) {
				library_namespace.debug('未設定 session，自 API_URL 擷取 language: ['
						+ action[0] + ']。', 1, 'wiki_API_query');
				// TODO: 似乎不能真的擷取到所需 language。
				language = wiki_API.site_name(action.origin, {
					get_all_properties : true
				});
				language = language && language.language || wiki_API.language;
				// e.g., wiki_API_query: Get "ja" from
				// ["https://ja.wikipedia.org/w/api.php?action=edit&format=json&utf8",{}]
				library_namespace.debug(
						'Get "' + language + '" from ' + action, 1,
						'wiki_API_query');
			}
			language = language.replace(/-/g, '_');
			if (language in agent.cookie_cache) {
				agent.last_cookie.append(agent.cookie_cache[language]);
				delete agent.cookie_cache[language];
			}
		}

		// console.trace(action);
		// console.log(POST_data);

		// merge `options.cached_response` to `response`
		// 以 cached_response 為基礎，後設定者為準。
		function merge_cached_response(response) {
			// console.trace([ this.cached_response, response ]);
			this.cached_response = library_namespace.deep_merge_object(
					this.cached_response, response);
			if (false) {
				// console.trace(JSON.stringify(this.cached_response));
				console.trace([ this.cached_response.query.pages[75032],
						response.query.pages[75032] ]);
			}
			return this.cached_response;
		}

		// 2021/5/4 17:32:39 看來 intitle: 最多只能取得 10000 pages，再多必須多加排除條件，例如
		// -incategory:""。
		// 編輯頁面後重新執行，或許可以取得不同的頁面清單。
		if (options.handle_continue_response === 'merge_response') {
			options.handle_continue_response = merge_cached_response;
		} else if (options.handle_continue_response === true) {
			options.handle_continue_response = function default_handle_continue_response(
					response, action, POST_data) {
				// console.trace([ action, POST_data ]);
				// console.trace([ response, JSON.stringify(response) ]);
				// console.log(response);

				if (!action.search_params.action === 'query') {
					return;
				}

				var list = response.query[
				// e.g., prop: 'revisions'
				action.search_params.prop
				//
				|| action.search_params.list || action.search_params.meta];
				if (Array.isArray(list)) {
					// console.log(list);
					if (this.cached_list) {
						// assert: Array.isArray(this.cached_list)
						this.cached_list.append(list);
					} else {
						this.cached_list = list;
					}
				}
			};
		}

		function XMLHttp_handler(XMLHttp, error) {
			var status_code, response;
			if (error) {
				// assert: !!XMLHttp === false
				status_code = error;
			} else {
				status_code = XMLHttp.status;
				response = XMLHttp.responseText;
			}

			if (error || /^[45]/.test(status_code)) {
				// e.g., 503, 413
				if (typeof get_URL_options.onfail === 'function') {
					get_URL_options.onfail(error || status_code);
				} else if (typeof callback === 'function') {
					// console.trace(get_URL_options);
					library_namespace.warn(
					// Get error:
					// status_code maybe 'Error' for connect ETIMEDOUT
					'wiki_API_query: ' + status_code + ': '
					// 避免 TypeError:
					// Cannot convert object to primitive value
					+ action);
					callback(response, error || status_code);
				}
				return;
			}

			// response = XMLHttp.responseXML;
			library_namespace.debug('response ('
					+ response.length
					+ ' characters): '
					+ (library_namespace.platform.nodejs ? '\n' + response
							: response.replace(/</g, '&lt;')), 3,
					'wiki_API_query');

			// "<\": for Eclipse JSDoc.
			if (/<\html[\s>]/.test(response.slice(0, 40))) {
				response = response.between('source-javascript', '</pre>')
						.between('>')
						// 去掉所有 HTML tag。
						.replace(/<[^>]+>/g, '');

				// '&#123;' : (")
				// 可能會導致把某些 link 中 URL 編碼也給 unescape 的情況?
				if (response.includes('&#'))
					response = library_namespace.HTML_to_Unicode(response);
			}

			// console.trace(response);
			// library_namespace.log(response);
			// library_namespace.log(library_namespace.HTML_to_Unicode(response));
			if (response) {
				try {
					response = JSON.parse(response);
				} catch (e) {
					// <title>414 Request-URI Too Long</title>
					// <title>414 Request-URI Too Large</title>
					if (response.includes('>414 Request-URI Too ')) {
						library_namespace.debug(
						//
						action.toString(), 1, 'wiki_API_query');
					} else {
						// TODO: 處理 API 傳回結尾亂編碼的情況。
						// https://phabricator.wikimedia.org/T134094
						// 不一定總是有效。

						library_namespace.error(
						//
						'wiki_API_query: Invalid content: ['
								+ String(response).slice(0, 40000) + ']');
						library_namespace.error(e);
					}

					// error handling
					if (get_URL_options.onfail) {
						get_URL_options.onfail(e);
					} else if (typeof callback === 'function') {
						callback(response, e);
					}

					// exit!
					return;
				}
			}

			if (response && response.error
			// [[mw:Manual:Maxlag parameter]]
			&& (need_to_wait_error_code.has(response.error.code)
			//
			|| Array.isArray(response.error.messages)
			//
			&& response.error.messages.some(function(message) {
				return message.name === 'actionthrottledtext';
			}))) {
				// new API version
				var waiting = response.error.lag;
				if (typeof waiting !== 'number') {
					// old API version & new API version
					waiting = response.error.info
					// /Waiting for [^ ]*: [0-9.-]+ seconds? lagged/
					.match(/([0-9.-]+) seconds? lagged/);
					waiting = waiting && +waiting[1] * 1000
							|| edit_time_interval;
				}
				// assert: waiting > 0
				// console.trace(response);
				library_namespace.debug('The ' + response.error.code
				// 請注意，由於上游服務器逾時，緩存層（Varnish 或 squid）也可能會生成帶有503狀態代碼的錯誤消息。
				+ (response.error.code === 'maxlag' ? ' ' + maxlag + ' s' : '')
				// waiting + ' ms'
				+ ' hitted. Waiting ' + library_namespace.age_of(0, waiting, {
					digits : 1
				}) + ' to re-execute wiki_API.query().', 1, 'wiki_API_query');
				// console.log([ original_action, POST_data ]);
				setTimeout(wiki_API_query.bind(null, original_action, callback,
						POST_data, options), waiting);
				return;
			}

			// console.trace(response);
			if (options.handle_continue_response && !response.error
					&& ('continue' in response)) {
				// 2021/4/20 6:55:23 不曉得為什麼，在
				// 20210416.Sorting_category_and_sort_key_of_Thai_names.js 嘗試
				// wbentityusage 的時候似乎會一直跑一直跑跑不完，基本上一次平移一篇文章，只好放棄了。

				// console.trace([ action, POST_data ]);
				// console.trace([ response, JSON.stringify(response) ]);

				// e.g., merge response to cached data
				options.handle_continue_response(response, action, POST_data);

				if (false) {
					// Do not touch original action and POST_data.
					action = new library_namespace.URI(action);
					POST_data = library_namespace.is_Object(POST_data)
							&& Object.clone(POST_data) || POST_data;
				}
				// response['continue'].rawcontinue = 1;
				for ( var continue_key in response['continue']) {
					var value = response['continue'][continue_key];
					if (action.search_params[continue_key] === value) {
						continue;
					}
					library_namespace.debug(continue_key + ': '
							+ action.search_params[continue_key] + '→' + value,
							1, 'wiki_API_query');
					action.search_params[continue_key] = value;
					if (POST_data && POST_data[continue_key])
						delete POST_data[continue_key];
					if (action.href.length > 2000) {
						// 太長時搬到 POST_data。
						delete action.search_params[continue_key];
						if (!POST_data)
							POST_data = Object.create(null);
						POST_data[continue_key] = value;
					}
				}
				// console.trace(response);

				// reget next data
				get_URL(action, XMLHttp_handler, null, POST_data,
						get_URL_options);
				return;
			}

			if (options.handle_continue_response === merge_cached_response) {
				response = options.handle_continue_response(response);
				delete response['continue'];
				// console.trace(response.query.pages[75032]);
			}

			// ----------------------------------

			if (typeof options.rollback_action !== 'function') {
				if (need_check_edit_time_interval
						&& (!POST_data || !POST_data.token)) {
					throw new Error(
					//
					'wiki_API_query: Edit without options.rollback_action!');
				}
				// Re-run wiki_API.query() after get new token.
				options.requery = wiki_API_query.bind(null, original_action,
						callback, POST_data, options);
			}

			// console.trace(action);
			// callback(response);
			// options.action = action;
			check_session_badtoken(response, callback, options);
			// console.trace(session && session.running);
		}

		// console.trace(POST_data);
		get_URL(action, XMLHttp_handler, null, POST_data, get_URL_options);
	}

	wiki_API_query.get_URL_options = {
		headers : {
			// for mw_web_session use
			'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8',

			/**
			 * By default, using the user agent get_URL_node.default_user_agent
			 * set in Ajax.js. To set another user agent:<code>

			CeL.wiki.query.get_URL_options.headers['User-Agent']='testbot/1.0'
			
			</code>
			 * 
			 * @see https://meta.wikimedia.org/wiki/User-Agent_policy
			 */
			'User-Agent' : CeL.net.Ajax.get_URL.default_user_agent
		},
		// default error retry 連線逾期/失敗時再重新取得頁面之重試次數。
		error_retry : 4,
		// default timeout: 1 minute
		timeout : library_namespace.to_millisecond('1 min')
	};

	/**
	 * edit (modify / create) 時之最大延遲參數。<br />
	 * default: 使用5秒的最大延遲參數。較高的值表示更具攻擊性的行為，較低的值則更好。
	 * 
	 * 在 Wikimedia Toolforge 上 edit wikidata，單線程均速最快約 1584 ms/edits。
	 * 
	 * @type {ℕ⁰:Natural+0}
	 * 
	 * @see [[mw:Manual:Maxlag parameter]], [[mw:API:Etiquette#The maxlag
	 *      parameter]] 禮儀
	 *      https://grafana.wikimedia.org/d/000000170/wikidata-edits
	 */
	wiki_API_query.default_maxlag = 5;

	// 用戶相關功能，避免延遲回應以使用戶等待。 The user is waiting online.
	// for manually testing only
	// delete CeL.wiki.query.default_maxlag;

	/**
	 * edit (modify / create) 時之編輯時間間隔。<br />
	 * default: 使用5秒 (5000 ms) 的編輯時間間隔。
	 * 
	 * @type {ℕ⁰:Natural+0}
	 * 
	 * @see pywikibot.config.minthrottle @ https://doc.wikimedia.org/pywikibot/stable/api_ref/pywikibot.config.html#settings-to-avoid-server-overload
	 */
	wiki_API_query.default_edit_time_interval = 5000;

	// 用戶相關功能，避免延遲回應以使用戶等待。 The user is waiting online.
	// Only respect maxlag. 因為數量太多，只好增快速度。
	// @see [[w:ja:Wikipedia:Bot#大量の件数を処置する場合の手続き]]
	// CeL.wiki.query.default_edit_time_interval = 0;
	// wiki_session.edit_time_interval = 0;

	// Only for test.
	// delete CeL.wiki.query.default_maxlag;

	// local rule
	// @see function setup_API_language()
	wiki_API_query.edit_time_interval = {
	// [[:ja:WP:bot]]
	// Botの速度は、おおよそ毎分 6 編集を限度としてください。
	// e.g., @ User contributions,
	// Due to high database server lag, changes newer than 30 seconds may
	// not be shown in this list.
	// 由於資料庫回應延遲，此清單可能不會顯示最近 30 秒內的變更。
	// Changes newer than 25 seconds may not be shown in this list.
	// 此清單可能不會顯示最近 25 秒內的變更。

	// [[w:ja:Wikipedia‐ノート:Bot#フラグ付きボットの速度制限変更提案]]
	// 「おおよそ毎分 6 編集」から「おおよそ毎分 12 編集」に緩和する
	// jawiki : 10000
	};

	/**
	 * 對於可以不用 XMLHttp 的，直接採 JSONP callback 法。
	 * 
	 * @type {Boolean}
	 */
	wiki_API_query.allow_JSONP = library_namespace.is_WWW(true) && false;

	/**
	 * URL last queried.<br />
	 * wiki_API_query.last_operation_time[API_URL] = {Date}last queried date
	 * 
	 * @type {Object}
	 */
	wiki_API_query.last_operation_time = Object.create(null);

	// @inner
	function join_pages() {
		return this.join('|');
	}

	/**
	 * 取得 page_data 之 title parameter。<br />
	 * e.g., page_data({pageid:8,title:'abc'}) → is_id?{pageid:8}:{title:'abc'}<br />
	 * page_data({title:'abc'}) → {title:'abc'}<br />
	 * 'abc' → {title:'abc'}<br />
	 * ['abc','def] → {title:['abc','def]}<br />
	 * 
	 * @param {Object}page_data
	 *            page data got from wiki API.
	 * @param {Boolean}[multi_param]
	 *            page_data is {Array}multi-page_data
	 * @param {Boolean}[is_id]
	 *            page_data is page_id instead of page_data
	 * @param {String}[param_name]
	 *            param name. default: 'title' or 'titles'.
	 */
	wiki_API_query.title_param = function(page_data, multi_param, is_id,
			param_name) {
		var pageid;

		if (Array.isArray(page_data)) {
			// auto detect multiple pages
			if (multi_param === undefined) {
				multi_param = pageid && pageid.length > 1;
			}

			pageid = [];
			// 確認所有 page_data 皆有 pageid 屬性。
			if (page_data.every(function(page) {
				// {ℕ⁰:Natural+0}page.pageid
				if (page && page.pageid >= 0 && page.pageid < Infinity) {
					pageid.push(page.pageid);
					return true;
				}
			})) {
				// pageid = pageid.join('|');
				pageid.toString = join_pages;

			} else {
				if (wiki_API.is_page_data(page_data)) {
					library_namespace.warn('wiki_API_query.title_param: '
							+ '看似有些非正規之頁面資料。');
					library_namespace.info('wiki_API_query.title_param: '
							+ '將採用 title 為主要查詢方法。');
				}
				// reset
				pageid = page_data.map(function(page) {
					// {String}title or {title:'title'}
					return (typeof page === 'object' ? page.title
					// assert: page && typeof page === 'string'
					: page) || '';
				});
				pageid.toString = join_pages;
				if (is_id) {
					// Warning: using .title
				} else {
					page_data = pageid;
					pageid = undefined;
				}
				library_namespace.debug('[' + (pageid || page_data).length
						+ '] ' + (pageid || page_data).toString(), 2,
						'wiki_API_query.title_param');
			}

		} else if (wiki_API.is_page_data(page_data)) {
			if (page_data.pageid > 0)
				// 有正規之 pageid 則使用之，以加速 search。
				pageid = page_data.pageid;
			else
				page_data = page_data.title;

		} else if (is_id !== false && typeof page_data === 'number'
		// {ℕ⁰:Natural+0}pageid should > 0.
		// pageid 0 回傳格式不同於 > 0 時。
		// https://www.mediawiki.org/w/api.php?action=query&prop=revisions&pageids=0
		&& page_data > 0 && page_data === (page_data | 0)) {
			pageid = page_data;

		} else if (!page_data) {
			library_namespace.error([ 'wiki_API_query.title_param: ', {
				// gettext_config:{"id":"invalid-title-$1"}
				T : [ 'Invalid title: %1', wiki_API.title_link_of(page_data) ]
			} ]);
			// console.warn(page_data);
		}

		var parameters = new library_namespace.Search_parameters();
		if (pageid !== undefined) {
			parameters[multi_param ? 'pageids' : 'pageid'] = pageid;
		} else if (page_data) {
			parameters[param_name || (multi_param ? 'titles' : 'title')] = page_data;
		}

		return parameters;
	};

	/**
	 * get id of page
	 * 
	 * @param {Object}page_data
	 *            page data got from wiki API.
	 * @param {Boolean}[title_only]
	 *            get title only
	 * 
	 * @see get_page_title === wiki_API.title_of
	 */
	wiki_API_query.id_of_page = function(page_data, title_only) {
		if (Array.isArray(page_data)) {
			return page_data.map(function(page) {
				wiki_API_query.id_of_page(page, title_only);
			});
		}
		if (wiki_API.is_page_data(page_data)) {
			// 有 pageid 則使用之，以加速。
			return !title_only && page_data.pageid || page_data.title;
		}

		if (!page_data) {
			library_namespace.error([ 'wiki_API_query.id_of_page: ', {
				// gettext_config:{"id":"invalid-title-$1"}
				T : [ 'Invalid title: %1', wiki_API.title_link_of(page_data) ]
			} ]);
		}
		return page_data;
	};

	// ------------------------------------------------------------------------

	if (false) {
		// 1.
		// 注意: callback 僅有在出錯時才會被執行!
		// callback() 必須採用下列方法來測試是否出問題!
		if (wiki_API.query.handle_error(data, error, callback)) {
			return;
		}
		// ...
		callback(data);

		// 2.
		error = wiki_API.query.handle_error(data, error);
		if (error) {
			// ...
			callback(data, error);
			return;
		}
		// ...
		callback(data);

		// TODO: 3.
		wiki_API.query(action, wiki_API.query.handle_error.bind({
			// on_error, on_OK 可省略。
			on_error : function(error) {
				library_namespace.error('function_name: ' + '...' + error);
			},
			on_OK : function(data) {
				// ...
			},
			callback : callback
		}));
	}

	function error_toString() {
		// TODO: 從 translatewiki 獲取翻譯。
		// e.g., for (this.code==='protectedpage'),
		// (this.info || this.message) ===
		// https://translatewiki.net/wiki/MediaWiki:Protectedpagetext/en
		return '[' + this.code + '] ' + (this.info || this.message);
	}

	wiki_API_query.error_toString = error_toString;

	/**
	 * 泛用先期處理程式。 response_handler(response)
	 * 
	 * wiki_API.query.handle_error(data, error)
	 */
	function handle_error(/* result of wiki_API.query() */data, error,
			callback_only_on_error) {
		// console.trace(arguments);
		// console.log(JSON.stringify(data));
		if (library_namespace.is_debug(3)
		// .show_value() @ interact.DOM, application.debug
		&& library_namespace.show_value)
			library_namespace.show_value(data, 'wiki_API_query.handle_error');

		if (!error && !data) {
			error = new Error('No data get!');
		}

		if (error) {
			if (typeof callback_only_on_error === 'function') {
				callback_only_on_error(data, error);
			}
			return error;
		}

		// assert: data && !error

		if (data.warnings) {
			for ( var action in data.warnings) {
				if (data.warnings[action]['*']) {
					library_namespace.warn('handle_error: '
							+ data.warnings[action]['*']);

				} else if (Array.isArray(data.warnings[action].messages)) {
					library_namespace.warn('handle_error: '
					/**
					 * <code>

					{"wbeditentity":{"messages":[{"name":"wikibase-conflict-patched","parameters":[],"html":{"*":"Your edit was patched into the latest version."},"type":"warning"}]}}
					// https://github.com/wikimedia/mediawiki-extensions-Wikibase/blob/master/repo/i18n/zh-hant.json

					</code>
					 */
					+ data.warnings[action].messages.map(function(line) {
						var message = '[' + line.name + ']';
						var text = line.html && line.html['*'];
						if (text)
							message += ' ' + text;
						return message;
					}).join('\n'));
				}

			}
			console.trace(JSON.stringify(data.warnings));
		}

		// 檢查 MediaWiki 伺服器是否回應錯誤資訊。
		error = data.error;
		if (!error) {
			// No error, do not call callback_only_on_error()
			return;
		}

		error.toString = error_toString;

		if (// library_namespace.is_Object(error) &&
		// e.g., {code:'',info:'','*':''}
		error.code) {
			if (false) {
				library_namespace.error('wiki_API_query: ['
				//
				+ error.code + '] ' + error.info);
			}

			var message = error.toString();
			/**
			 * <code>

			{"error":{"code":"failed-save","info":"The save has failed.","messages":[{"name":"wikibase-api-failed-save","parameters":[],"html":{"*":"The save has failed."}},{"name":"abusefilter-warning","parameters":["Adding non-latin script language description in latin script","48"],"html":{"*":"..."}}],"*":"See https://www.wikidata.org/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/postorius/lists/mediawiki-api-announce.lists.wikimedia.org/&gt; for notice of API deprecations and breaking changes."},"servedby":"mw1377"}

			</code>
			 */
			if (Array.isArray(error.messages)) {
				error.messages.forEach(function(_message) {
					if (!_message)
						return;
					message += ' [' + _message.name + ']';
					if (_message.html && typeof _message.html['*'] === 'string'
							&& _message.html['*'].length < 200) {
						message += ' ' + _message.html['*'];
					}
					if (Array.isArray(_message.parameters)
							&& _message.parameters.length > 0) {
						message += ' ' + JSON.stringify(_message.parameters);
					}
				});
			}

			error = new Error(message);
			error.message = message;
			error.code = data.error.code;
			// error.info = data.error.info;
			error.data = data.error;

		} else if (typeof error === 'string') {
			error = new Error(error);
		} else {
			// error = new Error(JSON.stringify(error));
		}

		if (typeof callback_only_on_error === 'function') {
			callback_only_on_error(data, error);
		}
		return error;
	}

	wiki_API_query.handle_error = handle_error;

	// ------------------------------------------------------------------------

	// export 導出.

	return wiki_API_query;
}
