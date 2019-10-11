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

	require : 'application.net.wiki.'
	//
	+ '|application.net.Ajax.get_URL',

	// 設定不匯出的子函式。
	no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var get_URL = this.r('get_URL'), wiki_API = library_namespace.net.wiki, KEY_SESSION = wiki_API.KEY_SESSION;
	// @inner
	// var ;

	// --------------------------------------------------------------------------------------------
	// 以下皆泛用，無須 wiki_API instance。

	/**
	 * 實際執行 query 操作，直接 call API 之核心函數。
	 * 
	 * 所有會利用到 wiki_API.prototype.work ← wiki_API.prototype.next ← <br />
	 * wiki_API.page, wiki_API.edit, ... ← wiki_API.query ← get_URL ← <br />
	 * need standalone http agent 的功能，都需要添附 session 參數。
	 * 
	 * @param {String|Array}action
	 *            {String}action or [ {String}api URL, {String}action,
	 *            {Object}other parameters ]
	 * @param {Function}callback
	 *            回調函數。 callback(response data, error)
	 * @param {Object}[post_data]
	 *            data when need using POST method
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項<br />
	 *            wiki_API.edit 可能輸入 session 當作 options。
	 * 
	 * @see api source:
	 *      https://phabricator.wikimedia.org/diffusion/MW/browse/master/includes/api
	 */
	wiki_API.query = function(action, callback, post_data, options) {
		// 處理 action
		library_namespace.debug('action: ' + action, 2, 'wiki_API.query');
		if (typeof action === 'string')
			action = [ , action ];
		else if (!Array.isArray(action))
			library_namespace.error('wiki_API.query: Invalid action: ['
					+ action + ']');
		library_namespace.debug('api URL: ('
				+ (typeof action[0])
				+ ') ['
				+ action[0]
				+ ']'
				+ (action[0] === wiki_API.api_URL(action[0]) ? '' : ' → ['
						+ wiki_API.api_URL(action[0]) + ']'), 3,
				'wiki_API.query');
		action[0] = wiki_API.api_URL(action[0]);

		// https://www.mediawiki.org/w/api.php?action=help&modules=query
		if (!/^[a-z]+=/.test(action[1]))
			action[1] = 'action=' + action[1];
		var method = action[1].match(/(?:^|&)action=([a-z]+)/);
		method = method && method[1];

		// respect maxlag. 若為 query，非 edit (modify)，則不延遲等待。
		var need_check_lag
		// method 2: edit 時皆必須設定 token。
		= post_data && post_data.token,
		// 檢測是否間隔過短。支援最大延遲功能。
		to_wait,
		// interval.
		lag_interval = options && options.lag >= 0 ? options.lag :
		// ↑ wiki_API.edit 可能輸入 session 當作 options。
		// options[KEY_SESSION] && options[KEY_SESSION].lag ||
		wiki_API.query.default_lag;

		if (false) {
			// method 1:
			// assert: typeof action[1] === 'string'
			need_check_lag = action[1]
					.match(/(?:action|assert)=([a-z]+)(?:&|$)/);
			if (!need_check_lag) {
				library_namespace.warn('wiki_API.query: Unknown action: '
						+ action[1]);
			} else if (need_check_lag = /edit|create/i.test(need_check_lag[1])) {
				to_wait = lag_interval
						- (Date.now() - wiki_API.query.last[action[0]]);
			}
		}
		if (need_check_lag) {
			to_wait = lag_interval
					- (Date.now() - wiki_API.query.last[action[0]]);
		}

		// TODO: 伺服器負載過重的時候，使用 exponential backoff 進行延遲。
		if (to_wait > 0) {
			library_namespace.debug('Waiting ' + to_wait + ' ms..', 2,
					'wiki_API.query');
			setTimeout(function() {
				wiki_API.query(action, callback, post_data, options);
			}, to_wait);
			return;
		}
		if (need_check_lag) {
			// reset timer
			wiki_API.query.last[action[0]] = Date.now();
		} else {
			library_namespace.debug('非 edit (modify)，不延遲等待。', 3,
					'wiki_API.query');
		}

		// additional parameters
		if (!action[2] && options && options.additional) {
			action[2] = options.additional;
		}

		// https://www.mediawiki.org/wiki/API:Data_formats
		// 因不在 white-list 中，無法使用 CORS。
		action[0] += '?' + action[1];
		// [ {String}api URL, {String}action, {Object}other parameters ]
		// →
		// [ {String}URL, {Object}other parameters ]
		action = library_namespace.is_Object(action[2]) ? [ action[0],
				action[2] ] : [
		// assert: action[2] && {String}action[2]
		action[2] ? action[0] + (action[2].startsWith('&') ? '' : '&')
		//
		+ action[2] : action[0], Object.create(null) ];
		if (!action[1].format) {
			// 加上 "&utf8", "&utf8=1" 可能會導致把某些 link 中 URL 編碼也給 unescape 的情況！
			action[0] = get_URL.add_parameter(action[0], 'format=json&utf8');
		}

		// 一般情況下會重新導向至 https。
		// 若在 Wikimedia Toolforge 中，則視為在同一機房內，不採加密。如此亦可加快傳輸速度。
		if (wiki_API.wmflabs && wiki_API.use_Varnish) {
			// UA → nginx → Varnish:80 → Varnish:3128 → Apache → HHVM → database
			// https://wikitech.wikimedia.org/wiki/LVS_and_Varnish
			library_namespace.debug('connect to Varnish:3128 directly.', 3,
					'wiki_API.query');
			// [[User:Antigng/https expected]]
			var HOST;
			action[0] = action[0].replace(
			// @see PATTERN_PROJECT_CODE
			/^https?:\/\/([a-z][a-z\d\-]{0,14}\.wikipedia\.org)\//,
			//
			function(all, host) {
				HOST = host;
				// Warning: 這方式已被 blocked。
				// @see https://phabricator.wikimedia.org/T137707
				return 'http://cp1008.wikimedia.org:3128/';
			});
			if (HOST) {
				action = {
					URL : action,
					headers : {
						HOST : HOST,
						'X-Forwarded-For' : '127.0.0.1',
						'X-Forwarded-Proto' : 'https'
					}
				};
			}
		}

		/**
		 * TODO: 簡易的泛用先期處理程式。
		 * 
		 * @inner
		 */
		function response_handler(response) {
			if (library_namespace.is_debug(3)
			// .show_value() @ interact.DOM, application.debug
			&& library_namespace.show_value)
				library_namespace.show_value(data, 'wiki_API.query: data');

			var error = data && data.error;
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.error('wiki_API.query: ['
				//
				+ error.code + '] ' + error.info);
			}

			if (typeof callback === 'function') {
				callback(response);
			}
		}

		// 開始處理 query request。
		if (!post_data && wiki_API.query.allow_JSONP) {
			library_namespace.debug(
					'採用 JSONP callback 的方法。須注意：若有 error，將不會執行 callback！', 2,
					'wiki_API.query');
			library_namespace.debug('callback : (' + (typeof callback) + ') ['
					+ callback + ']', 3, 'wiki_API.query');
			get_URL(action, {
				callback : callback
			});
			return;
		}

		// console.log('-'.repeat(79));
		// console.log(options);
		var get_URL_options = Object.assign(Object.create(null),
				wiki_API.query.get_URL_options, options
						&& options.get_URL_options);

		// @see function setup_API_URL(session, API_URL)
		var session = options && (options[KEY_SESSION]
		// 檢查若 options 本身即為 session。
		|| wiki_API.is_wiki_API(options) && options);
		if (session) {
			if (method === 'edit' && post_data
			//
			&& (!post_data.token || post_data.token === BLANK_TOKEN)
			// 防止未登錄編輯
			&& session.token
			//
			&& (session.token.lgpassword || session.preserve_password)) {
				// console.log([ action, post_data ]);
				library_namespace.error('wiki_API.query: 未登錄編輯？');
				throw new Error('未登錄編輯？');
			}

			// assert: get_URL_options 為 session。
			if (!session.get_URL_options) {
				library_namespace.debug(
						'為 wiki_API instance，但無 agent，需要造出 agent。', 2,
						'wiki_API.query');
				setup_API_URL(session, true);
			}
			get_URL_options = session.get_URL_options;
		}

		if (options && options.form_data) {
			// @see wiki_API.upload()
			library_namespace.debug('Set form_data', 6);
			// throw 'Set form_data';
			// options.form_data 會被當作傳入 to_form_data() 之 options。
			// to_form_data() will get file using get_URL()
			get_URL_options.form_data = options.form_data;
		}

		if (false) {
			// test options.get_URL_options
			if (get_URL_options) {
				if (false)
					console.log('wiki_API.query: Using get_URL_options: '
							+ get_URL_options.agent);
				// console.log(options);
				// console.log(action);
			} else {
				// console.trace('wiki_API.query: Without get_URL_options');
				// console.log(action);
				throw 'wiki_API.query: Without get_URL_options';
			}
		}

		if (false && typeof callback === 'function'
		// use options.get_URL_options:{onfail:function(error){}} instead.
		&& (!get_URL_options || !get_URL_options.onfail)) {
			get_URL_options = Object.assign({
				onfail : function(error) {
					if (false) {
						if (error.code === 'ENOTFOUND'
						// CeL.wiki.wmflabs
						&& wiki_API.wmflabs) {
							// 若在 Wikimedia Toolforge 取得 wikipedia 的資料，
							// 卻遇上 domain name not found，
							// 通常表示 language (API_URL) 設定錯誤。
						}

						/**
						 * do next action. 警告: 若是自行設定 .onfail，則需要自行善後。
						 * 例如可能得在最後自行執行(手動呼叫) wiki.next()， 使
						 * wiki_API.prototype.next() 知道應當重新啟動以處理 queue。
						 */
						wiki.next();

						var session = options && (options[KEY_SESSION]
						// 檢查若 options 本身即為 session。
						|| wiki_API.is_wiki_API(options) && options);
						if (session) {
							session.running = false;
						}
					}
					if (typeof callback === 'function') {
						callback(undefined, error);
					}
				}
			}, get_URL_options);
		}

		var agent = get_URL_options.agent;
		if (agent && agent.last_cookie && (agent.last_cookie.length > 80
		// cache cache: 若是用同一個 agent 來 access 過多 Wikipedia 網站，
		// 可能因 wikiSession 過多(如.length === 86)而造成 413 (請求實體太大)。
		|| agent.cookie_cache)) {
			if (agent.last_cookie.length > 80) {
				library_namespace.debug('重整 cookie[' + agent.last_cookie.length
						+ ']。', 1, 'wiki_API.query');
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
						+ agent.last_cookie.length + ']。', 1, 'wiki_API.query');
			}

			var language = session && session.language;
			if (!language) {
				library_namespace.debug('未設定 session，自 API_URL 擷取 language: ['
						+ action[0] + ']。', 1, 'wiki_API.query');
				language = typeof action[0] === 'string'
				// TODO: 似乎不能真的擷取到所需 language。
				&& action[0].match(PATTERN_wiki_project_URL);
				language = language && language[3] || default_language;
				// e.g., wiki_API.query: Get "ja" from
				// ["https://ja.wikipedia.org/w/api.php?action=edit&format=json&utf8",{}]
				library_namespace.debug('Get "' + language + '" from '
						+ JSON.stringify(action), 1, 'wiki_API.query');
			}
			language = language.replace(/-/g, '_');
			if (language in agent.cookie_cache) {
				agent.last_cookie.append(agent.cookie_cache[language]);
				delete agent.cookie_cache[language];
			}
		}

		get_URL(action, function(XMLHttp, error) {
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
					library_namespace.warn(
					//
					'wiki_API.query: Get error ' + status_code + ': '
					// 避免 TypeError:
					// Cannot convert object to primitive value
					+ JSON.stringify(action));
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
					'wiki_API.query');

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

			// library_namespace.log(response);
			// library_namespace.log(library_namespace.HTML_to_Unicode(response));
			if (response) {
				try {
					response = library_namespace.parse_JSON(response);
				} catch (e) {
					// <title>414 Request-URI Too Long</title>
					// <title>414 Request-URI Too Large</title>
					if (response.includes('>414 Request-URI Too ')) {
						library_namespace.debug(
						//
						action[0], 1, 'wiki_API.query');
					} else {
						// TODO: 處理 API 傳回結尾亂編碼的情況。
						// https://phabricator.wikimedia.org/T134094
						// 不一定總是有效。

						library_namespace.error(
						//
						'wiki_API.query: Invalid content: ['
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

			if (typeof callback === 'function') {
				callback(response);
			} else {
				library_namespace
						.error('wiki_API.query: No {Function}callback!');
			}

		}, null, post_data, get_URL_options);
	};

	wiki_API.query.get_URL_options = {
		// default timeout: 1 minute
		timeout : library_namespace.to_millisecond('1 min')
	};

	/**
	 * edit (modify) 時之最大延遲參數。<br />
	 * default: 使用5秒 (5000 ms) 的最大延遲參數。
	 * 
	 * 在 Wikimedia Toolforge 上 edit wikidata，單線程均速最快約 1584 ms/edits。
	 * 
	 * @type {Object} of {ℕ⁰:Natural+0}
	 * 
	 * @see https://www.mediawiki.org/wiki/Manual:Maxlag_parameter
	 *      https://www.mediawiki.org/wiki/API:Etiquette 禮儀
	 *      https://phabricator.wikimedia.org/T135240
	 */
	wiki_API.query.default_lag = 5000;

	// local rule
	wiki_API.query.lag = {
		// [[:ja:WP:bot]]
		// Botの速度は、おおよそ毎分 6 編集を限度としてください。
		// e.g., @ User contributions,
		// Due to high database server lag, changes newer than 30 seconds may
		// not be shown in this list.
		// 由於資料庫回應延遲，此清單可能不會顯示最近 30 秒內的變更。
		// Changes newer than 25 seconds may not be shown in this list.
		// 此清單可能不會顯示最近 25 秒內的變更。
		ja : 10000
	};

	/**
	 * 對於可以不用 XMLHttp 的，直接採 JSONP callback 法。
	 * 
	 * @type {Boolean}
	 */
	wiki_API.query.allow_JSONP = library_namespace.is_WWW(true) && false;

	/**
	 * URL last queried.<br />
	 * wiki_API.query.last[URL] = {Date}last queried date
	 * 
	 * @type {Object}
	 */
	wiki_API.query.last = Object.create(null);

	/**
	 * 取得 page_data 之 title parameter。<br />
	 * e.g., {pageid:8,title:'abc'} → 'pageid=8'<br />
	 * e.g., {title:'abc'} → 'title=abc'<br />
	 * e.g., 'abc' → 'title=abc'<br />
	 * 
	 * @param {Object}page_data
	 *            page data got from wiki API.
	 * @param {Boolean}[multi]
	 *            page_data is {Array}multi-page_data
	 * @param {Boolean}[is_id]
	 *            page_data is page_id instead of page_data
	 * @param {String}[param_name]
	 *            param name. default: 'title' or 'titles'.
	 */
	wiki_API.query.title_param = function(page_data, multi, is_id, param_name) {
		var pageid;

		if (Array.isArray(page_data)) {
			// auto detect multi
			if (multi === undefined) {
				multi = pageid && pageid.length > 1;
			}

			pageid = [];
			// 確認所有 page_data 皆有 pageid 屬性。
			if (page_data.every(function(page) {
				// {ℕ⁰:Natural+0}page.pageid
				if (page = page && page.pageid)
					pageid.push(page);
				return page;
			})) {
				pageid = pageid.join('|');

			} else {
				if (library_namespace.is_Object(page_data)) {
					library_namespace
							.warn('wiki_API.query.title_param: 看似有些非正規之頁面資料。');
					library_namespace
							.info('wiki_API.query.title_param: 將採用 title 為主要查詢方法。');
				}
				// reset
				pageid = page_data.map(function(page) {
					// {String}title or {title:'title'}
					return (typeof page === 'object' ? page.title
					// assert: page && typeof page === 'string'
					: page) || '';
				});
				if (is_id) {
					pageid = pageid.join('|');
				} else {
					page_data = pageid.join('|');
					pageid = undefined;
				}
				library_namespace.debug(pageid || page_data, 2,
						'wiki_API.query.title_param');
			}

		} else if (library_namespace.is_Object(page_data)) {
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
			library_namespace
					.error('wiki_API.query.title_param: Invalid title: ['
							+ page_data + ']');
			// console.warn(page_data);
		}

		multi = multi ? 's=' : '=';

		return pageid === undefined
		//
		? (param_name || 'title' + multi) + encodeURIComponent(page_data)
		//
		: 'pageid' + multi + pageid;
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
	wiki_API.query.id_of_page = function(page_data, title_only) {
		if (Array.isArray(page_data))
			return page_data.map(function(page) {
				wiki_API.query.id_of_page(page, title_only);
			});
		if (library_namespace.is_Object(page_data))
			// 有 pageid 則使用之，以加速。
			return !title_only && page_data.pageid || page_data.title;

		if (!page_data)
			library_namespace
					.error('wiki_API.query.id_of_page: Invalid title: ['
							+ page_data + ']');
		return page_data;
	};

	// ------------------------------------------------------------------------

	// export 導出.

	return wiki_API.query;
}
