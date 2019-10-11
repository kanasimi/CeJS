/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): edit
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
	name : 'application.net.wiki.edit',

	require : 'application.net.wiki.page.',

	// 設定不匯出的子函式。
	no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var wiki_API = library_namespace.net.wiki, KEY_SESSION = wiki_API.KEY_SESSION;
	// @inner
	// var ;

	// ------------------------------------------------------------------------

	/**
	 * check if need to stop / 檢查是否需要緊急停止作業 (Emergency shutoff-compliant).
	 * 
	 * 此功能之工作機制/原理：<br />
	 * 在 .edit() 編輯（機器人執行作業）之前，先檢查是否有人在緊急停止頁面留言要求停止作業。<br />
	 * 只要在緊急停止頁面有指定的章節標題、或任何章節，就當作有人留言要停止作業，並放棄編輯。
	 * 
	 * TODO:<br />
	 * https://www.mediawiki.org/w/api.php?action=query&meta=userinfo&uiprop=hasmsg
	 * 
	 * @param {Function}callback
	 *            回調函數。 callback({Boolean}need stop)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @see https://www.mediawiki.org/wiki/Manual:Parameters_to_index.php#Edit_and_submit
	 *      https://www.mediawiki.org/wiki/Help:Magic_words#URL_encoded_page_names
	 *      https://www.mediawiki.org/wiki/Help:Links
	 *      https://zh.wikipedia.org/wiki/User:Cewbot/Stop
	 */
	wiki_API.check_stop = function(callback, options) {
		// 前置處理。
		if (!library_namespace.is_Object(options))
			if (typeof options === 'string') {
				options = {
					title : options
				};
			} else {
				options = Object.create(null);
			}

		/**
		 * 緊急停止作業將檢測之頁面標題。 check title:<br />
		 * 只檢查此緊急停止頁面。
		 * 
		 * @type {String}
		 */
		var title = options.title;
		if (typeof title === 'function') {
			title = title(options.token);
		}
		if (!title) {
			title = wiki_API.check_stop.title(options.token);
		}

		library_namespace.debug('檢查緊急停止頁面 ' + wiki_API.title_link_of(title), 1,
				'wiki_API.check_stop');

		var session = options[KEY_SESSION] || this;
		wiki_API.page([ session.API_URL, title ], function(page_data) {
			var content = wiki_API.content_of(page_data),
			// default: NOT stopped
			stopped = false, PATTERN;

			if (typeof options.checker === 'function') {
				// 以 options.checker 的回傳來設定是否stopped。
				stopped = options.checker(content);
				if (stopped) {
					library_namespace.warn(
					//
					'wiki_API.check_stop: 已設定停止編輯作業！');
				}
				content = null;

			} else {
				// 指定 pattern
				PATTERN = options.pattern
				// options.section: 指定的緊急停止章節標題, section title to check.
				/** {String}緊急停止作業將檢測之章節標題。 */
				|| options.section
				/**
				 * for == 停止作業: 20150503 機器人作業 == <code>
				 * (new RegExp('\n==(.*?)' + '20150503' + '\\s*==\n')).test('\n== 停止作業:20150503 ==\n') === true
				 * </code>
				 */
				&& new RegExp('\n==(.*?)' + options.section + '(.*?)==\n');
			}

			if (content) {
				if (!library_namespace.is_RegExp(PATTERN)) {
					// use default pattern
					PATTERN = wiki_API.check_stop.pattern;
				}
				library_namespace.debug(
				//
				'wiki_API.check_stop: 採用 pattern: ' + PATTERN);
				stopped = PATTERN.test(content, page_data);
				if (stopped) {
					library_namespace.warn('緊急停止頁面 '
							+ wiki_API.title_link_of(title) + ' 有留言要停止編輯作業！');
				}
			}

			callback(stopped);
		}, options);
	};

	/**
	 * default page title to check:<br />
	 * [[{{TALKSPACE}}:{{ROOTPAGENAME}}/Stop]]
	 * 
	 * @param {Object}token
	 *            login 資訊，包含“csrf”令牌/密鑰。
	 * 
	 * @returns {String}
	 */
	wiki_API.check_stop.title = function(token) {
		return 'User_talk:' + token.lgname + '/Stop';
	};

	/**
	 * default check pattern: 任何章節/段落 section<br />
	 * default: 只要在緊急停止頁面有任何章節，就當作有人留言要求 stop。
	 * 
	 * @type {RegExp}
	 */
	wiki_API.check_stop.pattern = /\n=([^\n]+)=\n/;

	// ------------------------------------------------------------------------

	/**
	 * 編輯頁面。一次處理一個標題。<br />
	 * 警告:除非 text 輸入 {Function}，否則此函數不會檢查頁面是否允許機器人帳戶訪問！此時需要另外含入檢查機制！
	 * 
	 * 2016/7/17 18:55:24<br />
	 * 當採用 section=new 時，minor=1 似乎無效？
	 * 
	 * @param {String|Array}title
	 *            page title 頁面標題。 {String}title or [ {String}API_URL,
	 *            {String}title or {Object}page_data ]
	 * @param {String|Function}text
	 *            page contents 頁面內容。 {String}text or {Function}text(page_data)
	 * @param {Object}token
	 *            login 資訊，包含“csrf”令牌/密鑰。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * @param {Function}callback
	 *            回調函數。 callback(page_data, error, result)
	 * @param {String}timestamp
	 *            頁面時間戳記。 e.g., '2015-01-02T02:52:29Z'
	 */
	function wiki_API_edit(title, text, token, options, callback, timestamp) {
		var is_undo = options && options.undo;
		if (is_undo) {
			// 一般 undo_count 超過1也不一定能成功？因此設定輸入 {undo:1} 時改 {undo:true} 亦可。
			if (is_undo === true) {
				options.undo = is_undo = 1;
			} else if (!(is_undo >= 1)) {
				delete options.undo;
			}
		}

		var undo_count = options
				&& (options.undo_count || is_undo
						&& (is_undo < wiki_API_edit.undo_count_limit && is_undo));

		if (undo_count || typeof text === 'function') {
			library_namespace.debug('先取得內容再 edit '
					+ wiki_API.title_link_of(title) + '。', 1, 'wiki_API_edit');
			// console.log(title);
			if (undo_count) {
				var _options = Object.clone(options);
				if (!_options.rvlimit) {
					_options.rvlimit = undo_count;
				}
				if (!_options.rvprop) {
					_options.rvprop =
					// user: 提供 user name 給 text() 用。
					typeof text === 'function' ? 'ids|timestamp|user'
					// 無須 content，盡量減少索求的資料量。
					: 'ids|timestamp';
				}
			}

			wiki_API.page(title, function(page_data) {
				if (options && (!options.ignore_denial && wiki_API_edit
				// TODO: 每經過固定時間，或者編輯特定次數之後，就再檢查一次。
				.denied(page_data, options.bot_id, options.notification))) {
					library_namespace.warn(
					// Permission denied
					'wiki_API_edit: Denied to edit '
							+ wiki_API.title_link_of(page_data));
					callback(page_data, 'denied');

				} else {
					if (undo_count) {
						delete options.undo_count;
						// page_data =
						// {pageid:0,ns:0,title:'',revisions:[{revid:0,parentid:0,user:'',timestamp:''},...]}
						var revision = wiki_API.content_of.revision(page_data);
						if (revision) {
							timestamp = revision.timestamp;
							// 指定 rev_id 版本編號。
							options.undo = revision.revid;
						}
						options.undoafter = page_data.revisions
						// get the oldest revision
						[page_data.revisions.length - 1].parentid;
					}
					// 需要同時改變 wiki_API.prototype.next！
					wiki_API_edit(title,
					// 這裡不直接指定 text，是為了讓使(回傳要編輯資料的)設定值函數能即時依page_data變更 options。
					// undo_count ? '' :
					typeof text === 'function' &&
					// or: text(wiki_API.content_of(page_data),
					// page_data.title, page_data)
					// .call(options,): 使(回傳要編輯資料的)設定值函數能以this即時變更 options。
					// 注意: 更改此介面需同時修改 wiki_API.prototype.work 中 'edit' 之介面。
					text.call(options, page_data), token, options, callback,
							timestamp);
				}
			}, _options);
			return;
		}

		var action = !is_undo
				&& wiki_API_edit.check_data(text, title, options,
						'wiki_API_edit');
		if (action) {
			library_namespace.debug('直接執行 callback。', 2, 'wiki_API_edit');
			callback(title, action);
			return;
		}

		action = 'edit';
		// 處理 [ {String}API_URL, {String}title or {Object}page_data ]
		if (Array.isArray(title))
			action = [ title[0], action ], title = title[1];
		if (options && options.write_to) {
			// 設定寫入目標。一般為 debug、test 測試期間用。
			// e.g., write_to:'Wikipedia:沙盒',
			title = options.write_to;
			library_namespace.debug('依 options.write_to 寫入至 '
					+ wiki_API.title_link_of(title), 1, 'wiki_API_edit');
		}

		// 造出可 modify 的 options。
		if (options)
			library_namespace.debug('#1: ' + Object.keys(options).join(','), 4,
					'wiki_API_edit');
		if (is_undo) {
			options = library_namespace.setup_options(options);
		} else {
			options = Object.assign({
				text : text
			}, options);
		}
		if (library_namespace.is_Object(title)) {
			// 將 {Object}page_data 最新版本的 timestamp 標記註記到 options 去。
			wiki_API_edit.set_stamp(options, title);
			if (title.pageid)
				options.pageid = title.pageid;
			else
				options.title = title.title;
		} else {
			options.title = title;
		}
		if (timestamp) {
			// 若是 timestamp 並非最新版，則會放棄編輯。
			wiki_API_edit.set_stamp(options, timestamp);
		}
		// the token should be sent as the last parameter.
		library_namespace.debug('options.token = ' + JSON.stringify(token), 6,
				'wiki_API_edit');
		options.token = (library_namespace.is_Object(token)
		//
		? token.csrftoken : token) || BLANK_TOKEN;
		library_namespace.debug('#2: ' + Object.keys(options).join(','), 4,
				'wiki_API_edit');

		var session;
		if ('session' in options) {
			session = options[KEY_SESSION];
			delete options[KEY_SESSION];
		}

		wiki_API.query(action, function(data, error) {
			// console.log(data);
			if (!error) {
				error = data.error
				// 檢查伺服器回應是否有錯誤資訊。
				? '[' + data.error.code + '] ' + data.error.info : data.edit
						&& data.edit.result !== 'Success'
						&& ('[' + data.edit.result + '] '
						/**
						 * 新用戶要輸入過多或特定內容如 URL，可能遇到:<br />
						 * [Failure] 必需輸入驗證碼
						 */
						+ (data.edit.info || data.edit.captcha && '必需輸入驗證碼'
						/**
						 * 垃圾連結 [[MediaWiki:Abusefilter-warning-link-spam]]
						 * e.g., youtu.be, bit.ly
						 * 
						 * @see 20170708.import_VOA.js
						 */
						|| data.edit.spamblacklist
								&& 'Contains spam link 包含被列入黑名單的連結: '
								+ data.edit.spamblacklist
						// || JSON.stringify(data.edit)
						));
			}
			if (error || !data) {
				/**
				 * <code>
				wiki_API_edit: Error to edit [User talk:Flow]: [no-direct-editing] Direct editing via API is not supported for content model flow-board used by User_talk:Flow
				wiki_API_edit: Error to edit [[Wikiversity:互助客栈/topic list]]: [tags-apply-not-allowed-one] The tag "Bot" is not allowed to be manually applied.
				[[Wikipedia:首页/明天]]是連鎖保護
				wiki_API_edit: Error to edit [[Wikipedia:典範條目/2019年1月9日]]: [cascadeprotected] This page has been protected from editing because it is transcluded in the following page, which is protected with the "cascading" option turned on: * [[:Wikipedia:首页/明天]]
				 * </code>
				 * 
				 * @see https://doc.wikimedia.org/mediawiki-core/master/php/ApiEditPage_8php_source.html
				 */
				if (!data || !data.error) {
				} else if (data.error.code === 'no-direct-editing'
				// .section: 章節編號。 0 代表最上層章節，new 代表新章節。
				&& options.section === 'new') {
					library_namespace.debug('無法以正常方式編輯，嘗試當作 Flow 討論頁面。', 1,
							'wiki_API_edit');
					// console.log(options);
					options[KEY_SESSION] = session;
					edit_topic(title, options.sectiontitle,
					// [[mw:Flow]] 會自動簽名，因此去掉簽名部分。
					text.replace(/[\s\n\-]*~~~~[\s\n\-]*$/, ''), options.token,
							options, callback);
					return;
				} else if (data.error.code === 'missingtitle') {
					// "The page you specified doesn't exist."
					// console.log(options);
				}
				/**
				 * <s>遇到過長/超過限度的頁面 (e.g., 過多 transclusion。)，可能產生錯誤：<br />
				 * [editconflict] Edit conflict detected</s>
				 * 
				 * when edit:<br />
				 * [contenttoobig] The content you supplied exceeds the article
				 * size limit of 2048 kilobytes
				 * 
				 * 頁面大小系統上限 2,048 KB = 2 MB。
				 * 
				 * 須注意是否有其他競相編輯的 bots。
				 */
				library_namespace.warn('wiki_API_edit: Error to edit '
						+ wiki_API.title_link_of(title) + ': ' + error);
			} else if (data.edit && ('nochange' in data.edit)) {
				// 在極少的情況下，data.edit === undefined。
				library_namespace.info('wiki_API_edit: '
						+ wiki_API.title_link_of(title) + ': no change');
			}
			if (typeof callback === 'function') {
				// title.title === wiki_API.title_of(title)
				callback(title, error, data);
			}
		}, options, session);
	}
	;

	/**
	 * 放棄編輯頁面用。<br />
	 * assert: true === !!wiki_API_edit.cancel
	 * 
	 * @type any
	 */
	wiki_API_edit.cancel = {
		cancel : '放棄編輯頁面用'
	};

	/** {Natural}小於此數則代表當作 undo 幾個版本。 */
	wiki_API_edit.undo_count_limit = 100;

	/**
	 * 對要編輯的資料作基本檢測。
	 * 
	 * @param data
	 *            要編輯的資料。
	 * @param title
	 *            title or id.
	 * @param {String}caller
	 *            caller to show.
	 * 
	 * @returns error: 非undefined表示((data))為有問題的資料。
	 */
	wiki_API_edit.check_data = function(data, title, options, caller) {
		var action;
		// return CeL.wiki.edit.cancel as a symbol to skip this edit,
		// do not generate warning message.
		// 可以利用 ((return [ CeL.wiki.edit.cancel, 'reason' ];)) 來回傳 reason。
		// ((return [ CeL.wiki.edit.cancel, 'skip' ];)) 來跳過 (skip)
		// 本次編輯動作，不特別顯示或處理。
		// 被 skip/pass 的話，連警告都不顯現，當作正常狀況。
		if (data === wiki_API_edit.cancel) {
			// 統一規範放棄編輯頁面訊息。
			data = [ wiki_API_edit.cancel ];
		}

		if (!data && (!options || !options.allow_empty)) {
			action = [ 'empty', gettext(typeof data === 'string'
			// 內容被清空
			? 'Content is empty' : 'Content is not settled') ];

		} else if (Array.isArray(data) && data[0] === wiki_API_edit.cancel) {
			action = data.slice(1);
			if (action.length === 1) {
				// error messages
				action[1] = action[0] || gettext('Abandon change');
			}
			if (!action[0]) {
				// error code
				action[0] = 'cancel';
			}

			library_namespace.debug('採用個別特殊訊息: ' + action, 2, caller
					|| 'wiki_API_edit.check_data');
		}

		if (action) {
			if (action[1] !== 'skip') {
				// 被 skip/pass 的話，連警告都不顯現，當作正常狀況。
				library_namespace.warn((caller || 'wiki_API_edit.check_data')
						+ ': ' + wiki_API.title_link_of(title) + ': '
						+ (action[1] || gettext('No reason provided')));
			} else {
				library_namespace.debug(
						'Skip ' + wiki_API.title_link_of(title), 2, caller
								|| 'wiki_API_edit.check_data');
			}
			return action[0];
		}
	};

	/**
	 * 處理編輯衝突用。 to detect edit conflicts.
	 * 
	 * 注意: 會改變 options! Warning: will modify options！
	 * 
	 * 此功能之工作機制/原理：<br />
	 * 在 .page() 會取得每個頁面之 page_data.revisions[0].timestamp（各頁面不同）。於 .edit()
	 * 時將會以從 page_data 取得之 timestamp 作為時間戳記傳入呼叫，當 MediaWiki 系統 (API)
	 * 發現有新的時間戳記，會回傳編輯衝突，並放棄編輯此頁面。<br />
	 * 詳見 [https://github.com/kanasimi/CeJS/blob/master/application/net/wiki.js
	 * wiki_API_edit.set_stamp]。
	 * 
	 * @param {Object}options
	 *            附加參數/設定選擇性/特殊功能與選項
	 * @param {String}timestamp
	 *            頁面時間戳記。 e.g., '2015-01-02T02:52:29Z'
	 * 
	 * @returns {Object}options
	 * 
	 * @see https://www.mediawiki.org/wiki/API:Edit
	 */
	wiki_API_edit.set_stamp = function(options, timestamp) {
		if (wiki_API.is_page_data(timestamp)
		// 在 .page() 會取得 page_data.revisions[0].timestamp
		&& (timestamp = wiki_API.content_of.revision(timestamp)))
			// 自 page_data 取得 timestamp.
			timestamp = timestamp.timestamp;
		// timestamp = '2000-01-01T00:00:00Z';
		if (timestamp) {
			library_namespace.debug(timestamp, 3, 'wiki_API_edit.set_stamp');
			options.basetimestamp = options.starttimestamp = timestamp;
		}
		return options;
	};

	/**
	 * Get the contents of [[Template:Bots]].
	 * 
	 * @param {String}content
	 *            page contents 頁面內容。
	 * 
	 * @returns {Array}contents of [[Template:Bots]].
	 * 
	 * @see https://zh.wikipedia.org/wiki/Template:Bots
	 */
	wiki_API_edit.get_bot = function(content) {
		// TODO: use parse_template(content, 'bots')
		var bots = [], matched, PATTERN = /{{[\s\n]*bots[\s\n]*([\S][\s\S]*?)}}/ig;
		while (matched = PATTERN.exec(content)) {
			library_namespace.debug(matched.join('<br />'), 1,
					'wiki_API_edit.get_bot');
			if (matched = matched[1].trim().replace(/(^\|\s*|\s*\|$)/g, '')
			// .split('|')
			)
				bots.push(matched);
		}
		if (0 < bots.length) {
			library_namespace.debug(bots.join('<br />'), 1,
					'wiki_API_edit.get_bot');
			return bots;
		}
	};

	/**
	 * 測試頁面是否允許機器人帳戶訪問，遵守[[Template:Bots]]。機器人另須考慮{{Personal announcement}}的情況。
	 * 
	 * @param {String}content
	 *            page contents 頁面內容。
	 * @param {String}bot_id
	 *            機器人帳戶名稱。
	 * @param {String}notification
	 *            message notifications of action. 按通知種類而過濾(optout)。
	 * 
	 * @returns {Boolean|String}封鎖機器人帳戶訪問。
	 */
	wiki_API_edit.denied = function(content, bot_id, notification) {
		if (!content)
			return;
		var page_data;
		if (wiki_API.is_page_data(content)) {
			if (!(content = wiki_API.content_of(content)))
				return;
			page_data = content;
		}

		library_namespace.debug('contents to test: [' + content + ']', 3,
				'wiki_API_edit.denied');

		var bots = wiki_API_edit.get_bot(content),
		/** {String}denied messages */
		denied, allow_bot;

		if (bots) {
			library_namespace.debug('test ' + bot_id + '/' + notification, 3,
					'wiki_API_edit.denied');
			// botlist 以半形逗號作間隔。
			bot_id = (bot_id = bot_id && bot_id.toLowerCase()) ? new RegExp(
					'(?:^|[\\s,])(?:all|' + bot_id + ')(?:$|[\\s,])', 'i')
					: wiki_API_edit.denied.all;

			if (notification) {
				if (typeof notification === 'string'
				// optout 以半形逗號作間隔。
				&& notification.includes(','))
					notification = notification.split(',');
				if (Array.isArray(notification))
					notification = notification.join('|');
				if (typeof notification === 'string')
					// 預設必須包含 optout=all
					notification = new RegExp('(?:^|[\\s,])(?:all|'
							+ notification.toLowerCase() + ')(?:$|[\\s,])');
				else if (!library_namespace.is_RegExp(notification)) {
					library_namespace.warn(
					//
					'wiki_API_edit.denied: Invalid notification: ['
							+ notification + ']');
					notification = null;
				}
				// 自訂 {RegExp}notification 可能頗危險。
			}

			bots.some(function(data) {
				library_namespace.debug('test [' + data + ']', 1,
						'wiki_API_edit.denied');
				data = data.toLowerCase();

				var matched,
				/** {RegExp}封鎖機器人訪問之 pattern。 */
				PATTERN;

				// 過濾機器人所發出的通知/提醒
				// 頁面/用戶以bots模板封鎖通知
				if (notification) {
					PATTERN = /(?:^|\|)[\s\n]*optout[\s\n]*=[\s\n]*([^|]+)/ig;
					while (matched = PATTERN.exec(data)) {
						if (notification.test(matched[1])) {
							// 一被拒絕即跳出。
							return denied = 'Opt out of ' + matched[1];
						}
					}
				}

				// 檢查被拒絕之機器人帳戶名稱列表（以半形逗號作間隔）
				PATTERN = /(?:^|\|)[\s\n]*deny[\s\n]*=[\s\n]*([^|]+)/ig;
				while (matched = PATTERN.exec(data)) {
					if (bot_id.test(matched[1])) {
						// 一被拒絕即跳出。
						return denied = 'Banned: ' + matched[1];
					}
				}

				// 檢查被允許之機器人帳戶名稱列表（以半形逗號作間隔）
				PATTERN = /(?:^|\|)[\s\n]*allow[\s\n]*=[\s\n]*([^|]+)/ig;
				while (matched = PATTERN.exec(data)) {
					if (!bot_id.test(matched[1])) {
						// 一被拒絕即跳出。
						return denied = 'Not in allowed bots list: ['
								+ matched[1] + ']';
					}

					if (page_data)
						allow_bot = matched[1];
				}

			});
		}

		// {{Nobots}}判定
		if (!denied && /{{[\s\n]*nobots[\s\n]*}}/i.test(content))
			denied = 'Ban all compliant bots.';

		if (denied) {
			library_namespace.warn('wiki_API_edit.denied: ' + denied);
			return denied;
		}

		if (allow_bot) {
			// 特別標記本 bot 為被允許之 bot。
			page_data.allow_bot = allow_bot;
		}
	};

	/**
	 * pattern that will be denied.<br />
	 * i.e. "deny=all", !("allow=all")
	 * 
	 * @type {RegExp}
	 */
	wiki_API_edit.denied.all = /(?:^|[\s,])all(?:$|[\s,])/;

	// ------------------------------------------------------------------------

	// 不用 copy_to 的原因是 copy_to(wiki) 得遠端操作 wiki，不能保證同步性。
	// this_wiki.copy_from(wiki) 則呼叫時多半已經設定好 wiki，直接在本this_wiki中操作比較不會有同步性問題。
	// 因為直接採wiki_API.prototype.copy_from()會造成.page().copy_from()時.page()尚未執行完，
	// 這會使執行.copy_from()時尚未取得.last_page，因此只好另開function。
	// @see [[Template:Copied]], [[Special:Log/import]]
	// TODO: 添加 wikidata sitelinks 語言連結。處理分類。處理模板。
	function wiki_API_prototype_copy_from(title, options, callback) {
		if (typeof options === 'function') {
			// shift arguments
			callback = options;
			options = undefined;
		}

		options = Object.assign({
			// [KEY_SESSION]
			session : this
		}, options);

		var _this = this, copy_from_wiki;
		function edit() {
			// assert: wiki_API.is_page_data(title)
			var content_to_copy = wiki_API.content_of(title);
			if (typeof options.processor === 'function') {
				// options.processor(from content_to_copy, to content)
				content_to_copy = options.processor(title, wiki_API
						.content_of(_this.last_page));
			}
			if (!content_to_copy) {
				library_namespace
						.warn('wiki_API_prototype_copy_from: Nothing to copy!');
				_this.next();
			}

			var content;
			if (options.append && (content
			//
			= wiki_API.content_of(_this.last_page).trimEnd())) {
				content_to_copy = content + '\n' + content_to_copy;
				options.summary = 'Append from '
						+ wiki_API.title_link_of(title, copy_from_wiki) + '.';
			}
			if (!options.summary) {
				options.summary = 'Copy from '
				// TODO: 複製到非維基項目外的私人維基，例如moegirl時，可能需要用到[[zhwiki:]]這樣的prefix。
				+ wiki_API.title_link_of(title, copy_from_wiki) + '.';
			}
			_this.actions.unshift(
			// wiki.edit(page, options, callback)
			[ 'edit', content_to_copy, options, callback ]);
			_this.next();
		}

		if (wiki_API.is_wiki_API(title)) {
			// from page 為另一 wiki_API
			copy_from_wiki = title;
			// wiki.page('title').copy_from(wiki)
			title = copy_from_wiki.last_page;
			if (!title) {
				// wiki.page('title').copy_from(wiki);
				library_namespace.debug('先擷取同名title: '
						+ wiki_API
								.title_link_of(this.last_page, copy_from_wiki));
				// TODO: create interwiki link
				copy_from_wiki.page(wiki_API.title_of(this.last_page),
				//
				function(page_data) {
					library_namespace.debug('Continue coping page');
					// console.log(copy_from_wiki.last_page);
					wiki_API_prototype_copy_from.call(_this, copy_from_wiki,
							options, callback);
				});
				return;
			}
		}

		if (wiki_API.is_page_data(title)) {
			// wiki.page().copy_from(page_data)
			edit();

		} else {
			// treat title as {String}page title in this wiki
			// wiki.page().copy_from(title)
			var to_page_data = this.last_page;
			// 即時性，不用 async。
			// wiki_API.page(title, callback, options)
			wiki_API.page(title, function(from_page_data) {
				// recover this.last_page
				_this.last_page = to_page_data;
				title = from_page_data;
				edit();
			}, options);
		}

		return this;
	}
	;

	wiki_API_edit.copy_from = wiki_API_prototype_copy_from;

	// ------------------------------------------------------------------------

	/**
	 * 上傳檔案/媒體。
	 * 
	 * arguments: Similar to wiki_API_edit<br />
	 * wiki_API.upload(file_path, token, options, callback);
	 * 
	 * TODO: https://commons.wikimedia.org/wiki/Commons:Structured_data<br />
	 * 檔案資訊 添加/編輯 說明 (Must be plain text. Can not use wikitext!)
	 * https://commons.wikimedia.org/w/api.php?action=help&modules=wbsetlabel
	 * wikitext_to_plain_text(wikitext)
	 * 
	 * @param {String}file_path
	 *            file path/url
	 * @param {Object}token
	 *            login 資訊，包含“csrf”令牌/密鑰。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * @param {Function}[callback]
	 *            回調函數。 callback(page_data, error, result)
	 */
	wiki_API.upload = function upload(file_path, token, options, callback) {
		// https://commons.wikimedia.org/w/api.php?action=help&modules=upload
		// https://www.mediawiki.org/wiki/API:Upload
		var action, post_data = {
			// upload_text: media description
			text : undefined,
			// 備註 comment won't accept templates and external links
			comment : undefined,
			// must be set to reupload
			ignorewarnings : undefined,
			// 無此標籤的話可能會造成 [tags-apply-not-allowed-one]
			// The tag "..." is not allowed to be manually applied.
			tags : undefined,
			// 如果設置，服務器將臨時藏匿文件而不是加入存儲庫。
			stash : undefined,
			// 在可能的情況下讓潛在的大型檔案非同步處理。
			async : undefined,
			checkstatus : undefined,

			// Upload the file in pieces
			filesize : undefined,
			// leavemessage : undefined,
			// 只檢索指定文件密鑰的上傳狀態。
			chunk : undefined,
			offset : undefined,
			// Complete an earlier upload
			filekey : undefined,

			url : undefined,
			asyncdownload : undefined,
			// statuskey : undefined,

			filename : undefined
		};

		options = library_namespace.new_options(options);
		if (options.summary) {
			// 錯置?
			// options.comment = options.summary;
		}

		if (!options.text) {
			// 從 options / file_data / media_data 自動抽取出文件資訊。
			options.text = {
				description : options.description,
				date : library_namespace.is_Date(options.date) ? options.date
						.toISOString().replace(/\.\d+Z$/, 'Z') : options.date,
				source : options.source_url || options.media_url
						|| options.file_url,
				author : /^Q\d+/.test(options.author) ? '{{label|'
						+ options.author + '}}' : options.author,
				permission : options.permission,
				other_versions : options.other_versions
						|| options['other versions'],
				other_fields : options.other_fields || options['other fields']
			};
			options.text = [ '== {{int:filedesc}} ==',
			//
			to_template_wikitext(options.text, {
				name : 'Information',
				separator : '\n|'
			}) ];

			if (options.license) {
				options.text.push('', '== {{int:license-header}} ==',
				//
				to_template_wikitext_join_array(options.license));
			}

			// add categories
			if (options.categories) {
				options.text.push('',
				//
				to_template_wikitext_join_array(options.categories
				//
				.map(function(category_name) {
					if (!category_name.includes('[[')) {
						if (!PATTERN_category_prefix.test(category_name))
							category_name = 'Category:' + category_name;
						// NG: CeL.wiki.title_link_of()
						category_name = '[[' + category_name + ']]';
					}
					return category_name;
				})));
			}

			options.text = options.text.join('\n');

		} else if (library_namespace.is_Object(options.text)) {
			options.text = '== {{int:filedesc}} ==\n'
			// 將 .text 當作文件資訊。
			+ to_template_wikitext(options.text, {
				name : 'Information',
				separator : '\n|'
			});
		}

		// TODO: check {{Information|permission=license}}
		for (action in post_data) {
			if (action in options) {
				post_data[action] = options[action];
			} else {
				delete post_data[action];
			}
		}
		post_data.token = token;

		var session;
		if ('session' in options) {
			session = options[KEY_SESSION];
			// delete options[KEY_SESSION];
		}

		// One of the parameters "filekey", "file" and "url" is required.
		if (false && file_path.includes('://')) {
			post_data.url = file_path;
			// The "filename" parameter must be set.
			if (!post_data.filename) {
				post_data.filename = file_path.match(/[\\\/]*$/)[0];
			}
			// Uploads by URL are not allowed from this domain.
		} else {
			// 自動先下載 fetch 再上傳。
			// file: 必須使用 multipart/form-data 以檔案上傳的方式傳送。
			if (!options.form_data) {
				// options.form_data 會被當作傳入 to_form_data() 之 options。
				options.form_data = true;
			}
			post_data.file = file_path.includes('://') ? {
				// to_form_data() will get file using get_URL()
				url : file_path
			} : {
				file : file_path
			};
		}

		if (!post_data.filename) {
			// file path → file name
			post_data.filename = file_path.match(/[^\\\/]*$/)[0]
			// {result:'Warning',warnings:{badfilename:''}}
			.replace(/#/g, '-');
			// https://www.mediawiki.org/wiki/Manual:$wgFileExtensions
		}
		if (options.show_message && post_data.file.url) {
			library_namespace.log(file_path + '\nUpload to → '
					+ wiki_API.title_link_of('File:' + post_data.filename));
		}

		if (session && session.API_URL && options.check_media) {
			// TODO: Skip exists file
			// @see 20181016.import_earthquake_shakemap.js
		}

		action = 'upload';
		if (session && session.API_URL) {
			action = [ session.API_URL, action ];
		}

		if (options.test_only) {
			delete options.session;
			delete options.text;
			action = post_data.text;
			delete post_data.text;

			console.log('-'.repeat(80));
			console.log(options);
			console.log(post_data);
			library_namespace.info('wiki_API.upload: text:\n' + action);
			return;
		}

		wiki_API.query(action, upload_callback.bind(null, callback,
				options.show_message), post_data, options);
	};

	function upload_callback(callback, show_message, data, error) {
		if (error || !data || (error = data.error)
		/**
		 * <code>
		{upload:{result:'Warning',warnings:{exists:'file_name',nochange:{}},filekey:'',sessionkey:''}}
		{upload:{result:'Warning',warnings:{"duplicate":["file_name"]}}
		{upload:{result:'Warning',warnings:{"was-deleted":"file_name","duplicate-archive":"file_name"}}
		{upload:{result:'Success',filename:'',imageinfo:{}}}

		{"error":{"code":"fileexists-no-change","info":"The upload is an exact duplicate of the current version of [[:File:name.jpg]].","stasherrors":[{"message":"uploadstash-exception","params":["UploadStashBadPathException","Path doesn't exist."],"code":"uploadstash-exception","type":"error"}],"*":"See https://test.wikipedia.org/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes."},"servedby":"mw1279"}
		</code>
		 */
		|| !(data = data.upload) || data.result !== 'Success') {
			// console.error(error);
			error = error || data && data.result || 'Error on uploading';
			if (show_message) {
				console.log(data);
				library_namespace.error(typeof error === 'object' ? JSON
						.stringify(error) : error);
				if (data && data.warnings) {
					library_namespace.warn(JSON.stringify(data.warnings));
				} else {
					// library_namespace.warn(JSON.stringify(data));
				}
			}
			typeof callback === 'function' && callback(data, error);
			return;
		}

		if (show_message) {
			console.log(data);
		}
		typeof callback === 'function' && callback(data);
	}

	// ------------------------------------------------------------------------

	// export 導出.

	return wiki_API_edit;
}
