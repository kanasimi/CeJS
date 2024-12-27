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

	require : 'application.net.wiki.'
	// load MediaWiki module basic functions
	+ '|application.net.wiki.namespace.'
	// for BLANK_TOKEN
	+ '|application.net.wiki.task.'
	//
	+ '|application.net.wiki.page.',

	// 設定不匯出的子函式。
	no_extend : 'this,*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var wiki_API = library_namespace.application.net.wiki, KEY_SESSION = wiki_API.KEY_SESSION;

	// @inner
	var PATTERN_category_prefix = wiki_API.PATTERN_category_prefix, BLANK_TOKEN = wiki_API.BLANK_TOKEN;

	var gettext = library_namespace.cache_gettext(function(_) {
		gettext = _;
	});

	// ------------------------------------------------------------------------

	wiki_API.get_task_id = function get_task_id(options) {
		if (options.check_section) {
			return options.check_section;
		}

		var session = wiki_API.session_of_options(options);

		var check_task_id = session.latest_task_configuration;

		if (check_task_id
				&& (check_task_id = check_task_id.configuration_page_title)
				// e.g., 'User:Cewbot/log/20200122/configuration'
				&& (check_task_id = check_task_id.match(/\/(\d{8})\//))) {
			check_task_id = check_task_id[1];

		} else if (/* !check_task_id && */session.check_options) {
			check_task_id = session.check_options.check_section;
		}

		return check_task_id;
	};

	var KEY_any_task = '*';

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
	wiki_API.check_stop = function check_stop(callback, options) {
		// 前置處理。
		if (!library_namespace.is_Object(options)) {
			if (typeof options === 'string') {
				options = {
					title : options
				};
			} else {
				options = Object.create(null);
			}
		}

		var session = wiki_API.session_of_options(options) || this;

		/**
		 * 緊急停止作業將檢測之頁面標題。 check title:<br />
		 * 只檢查此緊急停止頁面。
		 * 
		 * @type {String}
		 */
		var title = options.title;
		if (typeof title === 'function') {
			title = title(options.token || session.token);
		}

		var check_task_id = wiki_API.get_task_id(options)
				|| wiki_API.check_stop.KEY_any_task;

		if (!title
				&& !(title = wiki_API.check_stop.title(options.token
						|| session.token))) {
			session.task_control_status[check_task_id] = {
				latest_checked : Date.now(),
				no_stop_page : true,
				stopped : false
			};

			// task_status
			callback(session.task_control_status[check_task_id]);
			return;
		}

		library_namespace.debug({
			// gettext_config:{"id":"check-the-emergency-stop-page-$1"}
			T : [ '檢查緊急停止頁面 %1', wiki_API.title_link_of(title) ]
		}, 1, 'wiki_API.check_stop');

		// console.trace([ session.API_URL, title ]);
		wiki_API.page([ session.API_URL, title ], function(page_data, error) {
			if (error)
				callback(page_data, error);

			var content = wiki_API.content_of(page_data),
			// default: NOT stopped
			stopped = false, PATTERN;

			if (!content) {
				library_namespace.info([ 'wiki_API.check_stop: ', {
					// page_data maybe undefined when the network is down.
					T : [ !page_data || 'missing' in page_data
					// gettext_config:{"id":"the-emergency-stop-page-was-not-found-($1)"}
					? 'The emergency stop page was not found (%1).'
					// gettext_config:{"id":"the-emergency-stop-page-is-empty-($1)"}
					: 'The emergency stop page is empty (%1).',
					//
					wiki_API.title_link_of(title) ]
				}, {
					// gettext_config:{"id":"the-operation-will-proceed-as-usual"}
					T : 'The operation will proceed as usual.'
				} ]);

			} else if (typeof options.checker === 'function') {
				// 以 options.checker 的回傳來設定是否 stopped。
				stopped = options.checker(content);
				if (stopped) {
					library_namespace.warn([ 'wiki_API.check_stop: ', {
						// gettext_config:{"id":"emergency-stop-edit-has-been-set"}
						T : '已設定緊急停止編輯作業！'
					} ]);
				}
				content = null;

			} else {
				// 指定 pattern
				PATTERN = options.pattern
				// options.check_section: 指定的緊急停止章節標題, section title to check.
				/** {String}緊急停止作業將檢測之章節標題。 */
				|| options.check_section
				/**
				 * for == 停止作業: 20150503 機器人作業 == <code>
				 * (new RegExp('\n==(.*?)' + '20150503' + '\\s*==\n')).test('\n== 停止作業:20150503 ==\n') === true
				 * </code>
				 */
				&& new RegExp('(?:^|\n)==(.*?)'
				//
				+ options.check_section + '(.*?)==\n');
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
					library_namespace.warn([ 'wiki_API.check_stop: ', {
						// gettext_config:{"id":"there-is-a-messages-on-the-emergency-stop-page-$1-to-stop-the-editing-operation"}
						T : [ '緊急停止頁面 %1 有留言要停止編輯作業！',
						//
						wiki_API.title_link_of(title) ]
					} ]);
				}
			}

			session.task_control_status[check_task_id] = {
				latest_checked : Date.now(),
				// stop editing
				// editing stopped
				stopped : stopped
			};

			// task_status
			callback(session.task_control_status[check_task_id]);
		}, options);
	};

	wiki_API.check_stop.KEY_any_task = KEY_any_task;

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
		return token.login_user_name ? 'User talk:' + token.login_user_name
				+ '/Stop' : '';
	};

	/**
	 * default check pattern: 任何章節/段落 section<br />
	 * default: 只要在緊急停止頁面有任何章節，就當作有人留言要求 stop。
	 * 
	 * @type {RegExp}
	 */
	wiki_API.check_stop.pattern = /\n=(.+?)=\n/;

	// ------------------------------------------------------------------------

	// [[Help:Edit summary]] actual limit is 500 [[Unicode codepoint]]s.
	function add_section_to_summary(summary, section_title) {
		if (!section_title)
			return summary || '';
		// 所有"/*錨點*/"註解都會 .trim() 後轉成網頁錨點連結。且 "/*...*/" 之前亦可加入文字。
		return '/* ' + section_title + ' */ ' + (summary || '');
	}

	/**
	 * 編輯頁面。一次處理一個標題。<br />
	 * 警告:除非 text 輸入 {Function}，否則此函數不會檢查頁面是否允許機器人帳戶訪問！此時需要另外含入檢查機制！
	 * 
	 * 2016/7/17 18:55:24<br />
	 * 當採用 section=new 時，minor=1 似乎無效？
	 * 
	 * @example <code>

	// 2021/10/7 13:29:12

	// Create new page with template.
	const variable_Map = new CeL.wiki.Variable_Map({ FC_list: '* 1\n* 2' });
	variable_Map.template = function (page_data) {
		// Will run at the page created.
		// assert: !wiki_API.content_of(page_data) === true;
		return 'FC_list:\n' + this.format('FC_list');
	};
	await wiki.edit_page(new_page_title, variable_Map, { summary: 'test' });


	// Update page only (must setup manually first)
	const variable_Map = new CeL.wiki.Variable_Map({ FC_list: '* 1\n* 2' });
	// setup manually
	await wiki.edit_page('Wikipedia:沙盒', p => p.wikitext + '\nFC_list:\n' + variable_Map.format('FC_list'), { summary: 'test' });
	variable_Map.set('FC_list', '*2\n*3');
	await wiki.edit_page('Wikipedia:沙盒', variable_Map, { summary: 'test' });

	</code>
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
	 *            回調函數。 callback(page_data, {String|any}error, result)
	 * @param {String}timestamp
	 *            頁面時間戳記。 e.g., '2015-01-02T02:52:29Z'
	 * 
	 * @see https://www.mediawiki.org/w/api.php?action=help&modules=edit
	 */
	function wiki_API_edit(title, text, token, options, callback, timestamp) {
		var action = {
			action : 'edit'
		};
		if (wiki_API.need_get_API_parameters(action, options,
				wiki_API[action.action], arguments)) {
			// console.trace('Waiting for get API parameters');
			return;
		}

		// console.trace(title);
		// console.log(text);
		if (library_namespace.is_thenable(text)) {
			if (library_namespace.is_debug(3))
				console.trace(text);
			text = text.then(function(text) {
				// console.trace(text);
				// console.trace('' + callback);
				wiki_API_edit(title, text, token, options, callback,
				//
				timestamp);
			}, function(error) {
				callback(title, error);
			});
			var session = wiki_API.session_of_options(options);
			if (session && session.running) {
				if (false) {
					console.trace(session.actions);
					console.trace(session.actions[0]);
					console.trace('wiki_API_edit: '
							+ 'Calling wiki_API.prototype.next() '
							+ [ session.running, session.actions.length ]);
					text.then(function(text) {
						console.trace(text);
					});
				}
				session.next(/* promise */text);
			}
			return;
		}

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

		if (wiki_API.Variable_Map.is_Variable_Map(text)) {
			// 對於新創或空白頁面，應已設定 {String}text.template。
			text = text.to_page_text_updater();
		}

		if (undo_count || typeof text === 'function') {
			library_namespace.debug('先取得內容再 edit / undo '
					+ wiki_API.title_link_of(title) + '。', 1, 'wiki_API_edit');
			// console.log(title);
			var _options;
			if (undo_count) {
				_options = Object.clone(options);
				_options.get_page_before_undo = true;
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
			} else {
				_options = Object.clone(options);
				delete _options.rollback_action;
			}

			wiki_API.page(title, function(page_data, error) {
				if (options && (!options.ignore_denial
				// TODO: 每經過固定時間，或者編輯特定次數之後，就再檢查一次。
				&& wiki_API_edit.denied(page_data, options.bot_id,
				// 若您不想接受機器人的通知、提醒或警告，請使用{{bots|optout=notification_name}}模板。
				// Please using {{bots|optout=notification_name}},
				// the bot will skip this page.
				options.notification_name))) {
					library_namespace.warn([ 'wiki_API_edit: ', {
						// gettext_config:{"id":"editing-of-$1-has-been-rejected-$2"}
						T : [ 'Editing of %1 has been rejected: %2',
						//
						wiki_API.title_link_of(page_data),
						//
						options.notification_name ]
					} ]);
					callback(page_data, 'denied');

				} else {
					// @see wiki_API.prototype.next()
					if (false) {
						console.trace('Set .page_to_edit: '
								+ wiki_API.title_link_of(page_data) + ' ('
								+ title + ')' + ' ('
								+ wiki_API.title_link_of(options.page_to_edit)
								+ ')');
						console.trace(options);
					}
					if (options) {
						if (!page_data && !error) {
							console.trace('No page_data or error set!');
							throw new Error('wiki_API_edit: '
							//
							+ 'No page_data or error set!');
						}
						options.page_to_edit = page_data;
						options.last_page_error = error;
						if (undo_count) {
							delete options.undo_count;
							// page_data =
							// {pageid:0,ns:0,title:'',revisions:[{revid:0,parentid:0,user:'',timestamp:''},...]}
							var revision = wiki_API.content_of
									.revision(page_data);
							if (revision) {
								timestamp = revision.timestamp;
								// 指定 rev_id 版本編號。
								options.undo = revision.revid;
							}
							options.undoafter = page_data.revisions
							// get the oldest revision
							.at(-1).parentid;
						}
					}

					// 這裡不直接指定 text，是為了使(回傳要編輯資料的)設定值函數能即時依page_data變更 options。
					if (undo_count) {
						// text = '';
					}
					if (typeof text === 'function') {
						// or: text(wiki_API.content_of(page_data),
						// page_data.title, page_data)
						// .call(options,): 使(回傳要編輯資料的)設定值函數能以this即時變更 options。
						// 注意: 更改此介面需同時修改 wiki_API.prototype.work 中 'edit' 之介面。
						text = text.call(options, page_data);
					}
					// 需要同時改變 wiki_API.prototype.next！
					wiki_API_edit(title, text, token, options, callback,
							timestamp);
				}
			}, _options);
			return;
		}

		var not_passed = !is_undo
				&& wiki_API_edit.check_data(text, title, options,
						'wiki_API_edit');

		if (options.discard_changes) {
			// console.trace('手動放棄修改。');
			if (!not_passed) {
				text = [ wiki_API_edit.cancel, text || options.discard_changes ];
				not_passed = true;
			}
		}

		if (not_passed) {
			library_namespace.debug('直接執行 callback。', 2, 'wiki_API_edit');
			// console.trace([not_passed, text]);
			callback(title, options.error_with_symbol ? text : not_passed);
			return;
		}

		// 處理 [ {String}API_URL, {String}title or {Object}page_data ]
		if (Array.isArray(title)) {
			action = [ title[0], action ];
			title = title[1];
		}
		if (options && options.write_to) {
			// 設定寫入目標。一般為 debug、test 測試期間用。
			// e.g., write_to:'Wikipedia:沙盒',
			title = options.write_to;
			library_namespace.debug('依 options.write_to 寫入至 '
					+ wiki_API.title_link_of(title), 1, 'wiki_API_edit');
		}

		// 造出可 modify 的 options。
		if (options) {
			library_namespace.debug('#1: ' + Object.keys(options).join(','), 4,
					'wiki_API_edit');
		}

		var change_to_contentmodel;
		if (typeof text === 'object'
				&& /\.json$/i.test(wiki_API.title_of(title))) {
			text = JSON.stringify(text);
			change_to_contentmodel = wiki_API.content_of.revision(title);
			change_to_contentmodel = change_to_contentmodel
					&& change_to_contentmodel.contentmodel;
			change_to_contentmodel = change_to_contentmodel === 'json' ? null
					: 'json';
			// console.trace(change_to_contentmodel);
		}

		// assert: typeof text === 'string'

		if (options && options.skip_nochange && options.page_to_edit) {
			var original_content = wiki_API.content_of(options.page_to_edit);
			if (original_content && /\.json$/i.test(wiki_API.title_of(title))) {
				try {
					// text = JSON.stringify(JSON.parse(text));
					original_content = JSON.stringify(JSON
							.parse(original_content));
				} catch (e) {
					// TODO: handle exception
				}
			}
			if (text === original_content) {
				// free
				original_content = null;
				library_namespace.debug('Skip '
				//
				+ wiki_API.title_link_of(options.page_to_edit)
				// 'nochange', no change
				+ ': The same content.', 1, 'wiki_API_edit');
				callback(title, 'nochange');
				return;
			}
			// free
			original_content = null;
		}

		// 前置處理。
		if (is_undo) {
			options = library_namespace.setup_options(options);
		} else {
			options = Object.assign({
				text : text
			}, options);
		}
		if (wiki_API.is_page_data(title)) {
			// 將 {Object}page_data 最新版本的 timestamp 標記註記到 options 去。
			wiki_API_edit.set_stamp(options, title);
			if (title.pageid)
				options.pageid = title.pageid;
			else
				options.title = title.title;
		} else {
			options.title = title;
		}
		if (timestamp || options.page_to_edit) {
			// 若是 timestamp 並非最新版，則會放棄編輯。
			wiki_API_edit.set_stamp(options, timestamp);
		}
		if (options.sectiontitle && options.section !== 'new') {
			options.summary = add_section_to_summary(options.summary,
					options.sectiontitle);
			delete options.sectiontitle;
		}

		// the token should be sent as the last parameter.
		library_namespace.debug('options.token = ' + JSON.stringify(token), 6,
				'wiki_API_edit');
		options.token = (library_namespace.is_Object(token)
		//
		? token.csrftoken : token) || BLANK_TOKEN;
		library_namespace.debug('#2: ' + Object.keys(options).join(','), 4,
				'wiki_API_edit');

		var post_data = wiki_API.extract_parameters(options, action);

		wiki_API.query(action, function(data, error) {
			// console.log(data);
			if (error) {
			} else if (data.error) {
				// 檢查 MediaWiki 伺服器是否回應錯誤資訊。
				error = data.error;
				error.toString = wiki_API.query.error_toString;
			} else if (data.edit && data.edit.result !== 'Success') {
				error = {
					code : data.edit.result,
					info : data.edit.info
					/**
					 * 新用戶要輸入過多或特定內容如 URL，可能遇到:<br />
					 * [Failure] 必需輸入驗證碼
					 */
					|| (data.edit.captcha ? '必需輸入驗證碼'

					/**
					 * 垃圾連結 [[MediaWiki:Abusefilter-warning-link-spam]] e.g.,
					 * youtu.be, bit.ly
					 * 
					 * @see 20170708.import_VOA.js
					 */
					: data.edit.spamblacklist
					//
					? 'Contains spam link 包含被列入黑名單的連結: '
					//
					+ data.edit.spamblacklist
					//
					: JSON.stringify(data.edit)),
					toString : wiki_API.query.error_toString
				};
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
					library_namespace.debug({
						// gettext_config:{"id":"unable-to-edit-in-the-normal-way-so-try-it-as-a-flow-discussion-page"}
						T : '無法以正常方式編輯，嘗試當作 Flow 討論頁面。'
					}, 1, 'wiki_API_edit');
					// console.log(options);
					// edit_topic()
					wiki_API.Flow.edit(title,
					// 新章節/新話題的標題文字。輸入空字串""的話，會用 summary 當章節標題。
					options.sectiontitle,
					// [[mw:Flow]] 會自動簽名，因此去掉簽名部分。
					text.replace(/[\s\n\-]*~~~~[\s\n\-]*$/, ''), options.token,
							options, callback);
					return;
				} else if (data.error.code === 'missingtitle') {
					// "The page you specified doesn't exist."
					// console.log(options);
				}
				/**
				 * <del>遇到過長/超過限度的頁面 (e.g., 過多 transclusion。)，可能產生錯誤：<br />
				 * [editconflict] Edit conflict detected</del>
				 * 
				 * when edit:<br />
				 * [contenttoobig] The content you supplied exceeds the article
				 * size limit of 2048 kilobytes
				 * 
				 * 頁面大小系統上限 2,048 KB = 2 MB。
				 * 
				 * 須注意是否有其他競相編輯的 bots。
				 */
				library_namespace.warn([ 'wiki_API_edit: ', {
					// gettext_config:{"id":"failed-to-edit-the-page-$1-$2"}
					T : [ 'Failed to edit the page %1: %2',
					//
					wiki_API.title_link_of(title), String(error) ]
				} ]);
			} else if (data.edit && ('nochange' in data.edit)) {
				// 在極少的情況下，data.edit === undefined。
				library_namespace.info([ 'wiki_API_edit: ', {
					// gettext_config:{"id":"no-changes-to-page-content-$1"}
					T : [ 'No changes to page content: %1',
					//
					wiki_API.title_link_of(title) ]
				} ]);
			}

			if (!error && data && data.edit && change_to_contentmodel) {
				library_namespace.info('wiki_API_edit: 自動變更頁面的內容模型: '
						+ wiki_API.title_link_of(title) + '→'
						+ change_to_contentmodel);
				// console.trace(session, title, change_to_contentmodel);
				wiki_API.changecontentmodel(title,
				//
				change_to_contentmodel, function(_data, _error) {
					// console.trace(_error);
					if (_error && _error.code === 'nochanges')
						_error = null;
					// Copy the result of .changecontentmodel()
					data.changecontentmodel_data = _data;
					if (typeof callback === 'function') {
						callback(title, _error, data);
					}
				}, options);
				return;
			}

			if (typeof callback === 'function') {
				// assert: wiki_API.is_page_data(title)
				// BUT title IS NOT latest page data!
				// It contains only basic page information,
				// e.g., .pageid, .ns, .title
				// title.title === wiki_API.title_of(title)
				callback(title, error, data);
				// console.trace(title);
			}
		}, post_data, options);
	}

	/**
	 * 放棄編輯頁面用。 CeL.wiki.edit.cancel<br />
	 * assert: true === !!wiki_API_edit.cancel
	 * 
	 * @type any
	 */
	wiki_API_edit.cancel = typeof Symbol === 'function' ? Symbol('CANCEL_EDIT')
	//
	: {
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
	wiki_API_edit.check_data = function check_data(data, title, options, caller) {
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

		// data.trim()
		if (!data) {
			if (options && options.allow_blanking) {
				library_namespace.debug('Blanking page '
				// 清空頁面 [[w:en:Wikipedia:Page blanking]]
				+ wiki_API.title_link_of(title), 1, caller
						|| 'wiki_API_edit.check_data');
			} else {
				action = [ 'Blanking page', gettext(typeof data === 'string'
				// 內容被清空。白紙化。
				// gettext_config:{"id":"content-is-empty"}
				? 'Content is empty'
				// gettext_config:{"id":"content-is-not-settled"}
				: 'Content is not settled') ];
				// console.trace(action);
			}

		} else if (Array.isArray(data) && data[0] === wiki_API_edit.cancel) {
			action = data.slice(1);
			if (action.length === 1) {
				// error messages
				// gettext_config:{"id":"abandon-change"}
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
						// gettext_config:{"id":"no-reason-provided"}
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
		if (false && options.page_to_edit) {
			console.trace(options.page_to_edit);
			if (wiki_API.is_page_data(timestamp)) {
				console.trace(options.page_to_edit === timestamp);
			}
			// options.baserevid =
		}

		if (wiki_API.is_page_data(timestamp)
		// 在 .page() 會取得 page_data.revisions[0].timestamp
		&& (timestamp = wiki_API.content_of.revision(timestamp))) {
			// console.trace(timestamp);
			if (timestamp.revid) {
				// 添加編輯之基準版本號以偵測/避免編輯衝突。
				options.baserevid = timestamp.revid;
			}
			// 自 page_data 取得 timestamp.
			timestamp = timestamp.timestamp;
		}

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
		var bots = [], matched, PATTERN = /{{[\s\n]*bots[\s\n]*(\S[\s\S]*?)}}/ig;
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
	 * [[Special:Log/massmessage]] Delivery of "message" to [[User talk:user]]<br />
	 * was skipped because the target has opted-out of message delivery<br />
	 * failed with an error code of protectedpage / contenttoobig
	 * 
	 * @param {String}content
	 *            page contents 頁面內容。
	 * @param {String}bot_id
	 *            機器人帳戶名稱。
	 * @param {String}notification_name
	 *            message notifications of action. 按通知種類而過濾(optout)。
	 *            ignore_opted_out allows /[a-z\d\-\_]+/ that will not affects
	 *            RegExp. ignore_opted_out will splits with /[,|]/.
	 * 
	 * @returns {Boolean|String}封鎖機器人帳戶訪問。
	 */
	wiki_API_edit.denied = function(content, bot_id, notification_name) {
		if (!content)
			return;
		var page_data;
		if (wiki_API.is_page_data(content)) {
			page_data = content;
			content = wiki_API.content_of(content);
		}
		// assert: !content || typeof content === 'string'

		if (typeof content === 'string') {
			// 去掉絕對不會影響 deny code 的內容。
			content = content.replace(/<\!--[\s\S]*?-->/g, '').replace(
					/<nowiki\s*>[\s\S]*<\/nowiki>/g, '');
		}
		if (!content)
			return;

		library_namespace.debug('contents to test: [' + content + ']', 3,
				'wiki_API_edit.denied');

		var bots = wiki_API_edit.get_bot(content),
		/** {String}denied messages */
		denied, allow_bot;

		if (bots) {
			library_namespace.debug('test ' + bot_id + '/' + notification_name,
					3, 'wiki_API_edit.denied');
			// botlist 以半形逗號作間隔。
			bot_id = (bot_id = bot_id && bot_id.toLowerCase()) ? new RegExp(
					'(?:^|[\\s,])(?:all|' + bot_id + ')(?:$|[\\s,])', 'i')
					: wiki_API_edit.denied.all;

			if (notification_name) {
				if (typeof notification_name === 'string'
				// 以 "|" 或半形逗號 "," 隔開 optout。
				&& notification_name.includes(',')) {
					notification_name = notification_name.split(',');
				}
				if (Array.isArray(notification_name)) {
					notification_name = notification_name.map(function(name) {
						return name.trim();
					}).join('|');
				}
				if (typeof notification_name === 'string') {
					// 預設必須包含 optout=all
					notification_name = new RegExp('(?:^|[\\s,])(?:all|'
							+ notification_name.trim() + ')(?:$|[\\s,])');
				} else if (!library_namespace.is_RegExp(notification_name)) {
					library_namespace.warn(
					//
					'wiki_API_edit.denied: Invalid notification_name: ['
							+ notification_name + ']');
					notification_name = null;
				}
				// 警告: 自訂 {RegExp}notification_name 可能頗危險。
			}

			bots.some(function(data) {
				// data = data.toLowerCase();
				library_namespace.debug('test [' + data + ']', 1,
						'wiki_API_edit.denied');

				var matched,
				/** {RegExp}封鎖機器人訪問之 pattern。 */
				PATTERN;

				// 過濾機器人所發出的通知/提醒
				// 頁面/用戶以bots模板封鎖通知
				if (notification_name) {
					PATTERN =
					//
					/(?:^|\|)[\s\n]*optout[\s\n]*=[\s\n]*([^{}|]+)/ig;
					while (matched = PATTERN.exec(data)) {
						if (notification_name.test(matched[1])) {
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
			// console.trace(content);
			library_namespace.warn('wiki_API_edit.denied: '
			//
			+ (page_data ? wiki_API.title_link_of(page_data) + ' ' : '')
					+ denied);
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

		options = wiki_API.add_session_to_options(this, options);

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

	wiki_API_edit.copy_from = wiki_API_prototype_copy_from;

	// ================================================================================================================

	// https://www.mediawiki.org/w/api.php?action=help&modules=changecontentmodel
	function changecontentmodel(title, model, callback, options) {
		if (wiki_API.need_get_API_parameters('changecontentmodel', options,
				changecontentmodel, arguments)) {
			return;
		}

		var action = wiki_API.normalize_title_parameter(title, Object.assign({
			multi : false
		}, options));
		// console.trace(title, action);
		var session = wiki_API.session_of_options(options);
		Object.assign(action[1], {
			action : 'changecontentmodel',
			model : model
		});
		// console.trace(action, options);

		// console.trace(action, options, arguments);
		var post_data = Object.assign({
			token : session.token.csrftoken
		}, wiki_API.extract_parameters(options, action));
		// console.trace(action, options);

		wiki_API.query(action, function(data, error) {
			// console.trace(data, error);
			if (!error && data && data.error
			// && data.error.code !== 'nochanges'
			) {
				error = data.error;
				error.toString = wiki_API.query.error_toString;
			}
			callback && callback(data, error);
		}, post_data, options);
	}

	wiki_API.changecontentmodel = changecontentmodel;

	// ================================================================================================================

	/**
	 * 上傳檔案/媒體。
	 * 
	 * arguments: Similar to wiki_API_edit<br />
	 * wiki_API.upload(file_path, token, options, callback);
	 * 
	 * TODO: https://commons.wikimedia.org/wiki/Commons:Structured_data<br />
	 * 檔案資訊 添加/編輯 說明 (Must be plain text. Cannot use wikitext!)
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
	 * 
	 * @see https://commons.wikimedia.org/w/api.php?action=help&modules=upload
	 *      https://www.mediawiki.org/wiki/API:Upload
	 */
	wiki_API.upload = function upload(file_path, token, options, callback) {
		var action = {
			action : 'upload'
		};
		if (wiki_API.need_get_API_parameters(action, options,
				wiki_API[action.action], arguments)) {
			return;
		}

		// must set options.ignorewarnings to reupload

		// 前置處理。
		options = library_namespace.new_options(options);

		// When set .variable_Map, after successful update, the content of file
		// page will be auto-updated too.
		if (!('page_text_updater' in options) && options.variable_Map) {
			// auto set options.page_text_updater
			options.page_text_updater = options.variable_Map;
		}
		if (options.page_text_updater) {
			// https://www.mediawiki.org/w/api.php?action=help&modules=upload
			// A "csrf" token retrieved from action=query&meta=tokens
			options.token = token;
		}

		// 備註 comment won't accept templates and external links
		if (!options.comment && options.summary) {
			library_namespace.warn(
			// 錯置?
			'wiki_API.upload: Please use .comment instead of .summary!');
			options.comment = options.summary;
		}

		var structured_data = Object.assign(Object.create(null),
				options.structured_data);

		// upload_text: media description
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
						|| options['other versions'] || '',
				other_fields : options.other_fields || options['other fields']
						|| ''
			};
			// inception (P571) 成立或建立時間
			if (!structured_data.date)
				structured_data.date = options.text.date;
		} else {
			[ "description", "date", "source", "author", "permission",
					"other_versions", "other_fields" ]
					.forEach(function(parameter) {
						if (parameter in options) {
							library_namespace
									.error('wiki_API.upload: Cannot assign both options.text and options.'
											+ parameter
											+ '! Maybe you want to change options.text to options.additional_text?');
						}
					});
		}

		// options.location: [latitude, longitude, altitude / height / -depth ]
		if (options.location) {
			if (isNaN(options.location[0]) || isNaN(options.location[1])) {
				delete options.location;
			} else if (!structured_data.location) {
				structured_data.location = options.location;
			}
		}
		if (options.location && options.variable_Map) {
			if (options.location[0] && !options.variable_Map.has('latitude'))
				options.variable_Map.set('latitude', options.location[0]);
			if (options.location[1] && !options.variable_Map.has('longitude'))
				options.variable_Map.set('longitude', options.location[1]);
			if (options.location[2] && !options.variable_Map.has('altitude'))
				options.variable_Map.set('altitude', options.location[2]);
		}

		if (library_namespace.is_Object(options.text)) {
			var variable_Map = options.variable_Map;
			if (variable_Map) {
				for ( var property in options.text) {
					var value = options.text[property];
					if (!variable_Map.has(property)
					//
					&& wiki_API.is_valid_parameters_value(value)
					//
					&& !Variable_Map__PATTERN_mark.test(value)
					// 自動將每次更新可能會改變的值轉成可更新標記。
					&& [ 'date', 'source' ].includes(property)) {
						variable_Map.set(property, value);
					}
					if (variable_Map.has(property)) {
						options.text[property] = variable_Map.format(property);
					}
				}
			}

			options.text = [ '== {{int:filedesc}} ==',
			// 將 .text 當作文件資訊。
			wiki_API.template_text(options.text, {
				name : 'Information',
				separator : '\n| '
			}) ];

			// https://commons.wikimedia.org/wiki/Commons:Geocoding#Adding_a_location_template
			// If the image page has an {{Information}} template, or similar,
			// the {{Location}} template should come immediately after it.
			if (options.location) {
				options.text.push(wiki_API.template_text([
						options.location_template_name || 'Location',
						variable_Map ? variable_Map.format('latitude')
								: options.location[0],
						variable_Map ? variable_Map.format('longitude')
								: options.location[1] ]));
			}

			options.text = options.text.join('\n');
		}

		if (options.license) {
			options.text += '\n== {{int:license-header}} ==\n'
					+ wiki_API.template_text.join_array(options.license);
		}

		// Additional wikitext to place before categories.
		if (options.additional_text) {
			options.text += '\n' + options.additional_text.trim();
		}

		// append categories
		if (options.categories) {
			options.text += '\n'
			//
			+ wiki_API.template_text.join_array(options.categories
			//
			.map(function(category_name) {
				if (category_name && !category_name.includes('[[')) {
					if (!PATTERN_category_prefix.test(category_name))
						category_name = 'Category:' + category_name;
					// NG: CeL.wiki.title_link_of()
					category_name = '[[' + category_name + ']]';
				}
				return category_name;
			}));
		}

		// assert: typeof options.text === 'string'

		// TODO: check {{Information|permission=license}}
		var post_data = wiki_API.extract_parameters(options, action);

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

		post_data.token = token;

		if (!structured_data['media type']) {
			var matched;
			if (library_namespace.MIME_of) {
				matched = library_namespace.MIME_of(post_data.filename);
			} else if (matched = post_data.filename
					.match(/\.(png|jpeg|gif|webp|bmp)$/i)) {
				matched = 'image/' + matched[1].toLowerCase();
			}
			if (matched) {
				structured_data['media type'] = matched;
			}
		}

		var session = wiki_API.session_of_options(options);
		// console.trace(session);
		if (options.show_message && post_data.file.url) {
			library_namespace.log(file_path + '\nUpload to → '
					+ wiki_API.title_link_of(session.to_namespace(
					// 'File:' +
					post_data.filename, 'File')));
		}

		if (session) {
			// console.trace(session.token, post_data);
		}
		if (session && session.API_URL && options.check_media) {
			// TODO: Skip exists file
			// @see 20181016.import_earthquake_shakemap.js
		}

		// no really update
		if (options.test_only) {
			if (options.test_only !== 'no message') {
				delete options[KEY_SESSION];
				delete options.text;
				action = post_data.text;
				delete post_data.text;

				console.log('-'.repeat(80));
				console.log(options);
				console.log(post_data);
				library_namespace.info('wiki_API.upload: test edit text:\n'
						+ action);
			}
			callback(null, 'Test edit');
			return;
		}

		// console.trace(post_data);
		wiki_API.query(action, upload_callback.bind(null,
		//
		function check_structured_data(data, error) {
			// console.trace([ data, error ]);
			error = wiki_API.query.handle_error(data, error);
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.error('wiki_API.upload: ' + error);
				callback(data, error);
				return;
			}

			if (!structured_data.date) {
				// inception (P571) 成立或建立時間
				structured_data.date = options.date;
			}
			if (structured_data.location
			// assert: Array.isArray(structured_data.location)
			&& !structured_data.location.precision) {
				structured_data.location.precision = .1;
			}
			// normalize structured_data
			Object.keys(structured_data).forEach(function(name) {
				if (structured_data[name] === undefined) {
					delete structured_data[name];
					return;
				}
				var property_id = structured_data_mapping[name];
				if (property_id && !(property_id in structured_data)) {
					structured_data[property_id] = structured_data[name];
					delete structured_data[name];
				}
			});
			// console.trace([ post_data.filename, structured_data ]);
			if (library_namespace.is_empty_object(structured_data)) {
				callback(data, error);
				return;
			}

			// --------------------------------------------

			// 確保不會直接執行 session.edit_structured_data()，而是將之推入 session.actions。
			session.running = true;

			session.edit_structured_data(session.to_namespace(
			// 'File:' + data.filename
			post_data.filename, 'File'),
			//
			function fill_structured_data(entity) {
				var summary_list = [], data = Object.create(null);
				for ( var property_id in structured_data) {
					if (entity.claims
					//
					&& wiki_API.data.value_of(entity.claims[property_id])) {
						if (false) {
							console.log([ property_id, wiki_API.data.value_of(
							//
							entity.claims[property_id]) ]);
						}
						continue;
					}

					var value = structured_data[property_id];
					data[property_id] = value;
					var config = structured_data_config[property_id];
					var summary_name = config && config[KEY_summary_name]
							|| property_id;
					summary_name = wiki_API.title_link_of('d:Property:'
							+ property_id, summary_name);
					summary_list.push(summary_name + '=' + value);
				}

				// console.log(entity.claims);
				// console.trace([ summary_list, data ]);

				if (summary_list.length === 0)
					return [ wiki_API.edit.cancel, 'skip' ];

				// gettext_config:{"id":"Comma-separator"}
				this.summary += summary_list.join(gettext('Comma-separator'));
				return data;

			}, {
				// 標記此編輯為機器人編輯。
				bot : options.bot,
				summary : 'Modify structured data: '
			}, function structured_data_callback(_data, _error) {
				// console.trace([ _data, error, _error ]);
				if (error) {
					if (data && data.error
							&& data.error.code === 'fileexists-no-change')
						;
				}
				callback(data, error || _error);
			});

			// 本執行序擁有執行權，因此必須手動執行 session.next()，否則會中途跳出。
			session.next();

		}, options), post_data, options);

	};

	var KEY_summary_name = 'summary_name',
	// {inner} alias
	structured_data_mapping = {
		// [[Commons:Structured data/Modeling/Location]]
		// coordinates of depicted place (P9149) 描述地坐標
		location : 'P9149',
		// [[Commons:Structured data/Modeling/Depiction]]
		// depicts (P180) 描繪內容
		depicts : 'P180',

		// [[Commons:Structured data/Modeling/Properties table]]
		// TODO: file format (P2701) 文件格式
		'file format' : 'P2701',
		// TODO: data size (P3575) 資料大小
		'data size' : 'P3575',

		'media type' : 'P1163',

		// [[Commons:Structured data/Modeling/Date]]
		// inception (P571) 成立或建立時間
		'created datetime' : 'P571',
		date : 'P571',
		inception : 'P571'
	}, structured_data_config = Object.create(null);
	Object.keys(structured_data_mapping).forEach(function(name) {
		var property_id = structured_data_mapping[name];
		var property_config = structured_data_config[property_id];
		if (!property_config) {
			structured_data_config[property_id]
			//
			= property_config = Object.create(null);
		}
		if (!property_config[KEY_summary_name])
			property_config[KEY_summary_name] = name;
	});

	function upload_callback(callback, options, data, error) {
		if (error || !data || (error = data.error)
		/**
		 * <code>
		{upload:{result:'Warning',warnings:{exists:'file_name',nochange:{}},filekey:'',sessionkey:''}}
		{upload:{result:'Warning',warnings:{"duplicate":["file_name"]}}
		{upload:{result:'Warning',warnings:{"was-deleted":"file_name","duplicate-archive":"file_name"}}
		{upload:{result:'Success',filename:'',imageinfo:{}}}
		{upload:{result:'Success',filename:'',warnings:{duplicate:['.jpg','.jpg']},imageinfo:{}}}

		{"error":{"code":"fileexists-no-change","info":"The upload is an exact duplicate of the current version of [[:File:name.jpg]].","stasherrors":[{"message":"uploadstash-exception","params":["UploadStashBadPathException","Path doesn't exist."],"code":"uploadstash-exception","type":"error"}],"*":"See https://test.wikipedia.org/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes."},"servedby":"mw1279"}
		{"error":{"code":"verification-error","info":"File extension \".gif\" does not match the detected MIME type of the file (image/jpeg).","details":["filetype-mime-mismatch","gif","image/jpeg"],"*":"See https://commons.wikimedia.org/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/postorius/lists/mediawiki-api-announce.lists.wikimedia.org/&gt; for notice of API deprecations and breaking changes."},"servedby":"mw1450"}
		</code>
		 */
		|| !(data = data.upload) || data.result !== 'Success') {
			// console.error(error);
			if (!error) {
				if (data && data.result) {
					error = data.result;
					if (data.warnings) {
						error += ': ' + JSON.stringify(data.warnings);
					}
				} else {
					error = 'Error on uploading';
				}
			}
			if (options.show_message) {
				console.log(data);
				library_namespace.error(typeof error === 'object' ? JSON
						.stringify(error) : error);
				if (data && data.warnings) {
					library_namespace.warn(JSON.stringify(data.warnings));
				} else {
					// library_namespace.warn(JSON.stringify(data));
				}
			}
			// @see function wiki_operator()
			if (typeof error === 'string') {
				error = new Error(error);
			} else if (library_namespace.is_Object(error)) {
				error = new Error(JSON.stringify(error));
			}

			typeof callback === 'function' && callback(data, error);
			return;
		}

		if (options.show_message) {
			console.log(data);
		}

		if (!options.page_text_updater
		// uploaded a new version
		// {result:'Success',filename:'file_name',warnings:{exists:'file_name'},imageinfo:{...}}
		|| !data.warnings || !data.warnings.exists) {
			typeof callback === 'function' && callback(data);
			return;
		}

		// update description text for a existed file
		if (!options.summary && options.comment) {
			options.summary = options.comment;
		}
		delete options.text;
		delete options.form_data;
		if (wiki_API.Variable_Map.is_Variable_Map(options.page_text_updater)) {
			options.page_text_updater = options.page_text_updater
					.to_page_text_updater();
		}
		var session = wiki_API.session_of_options(options);
		// 'File:' +
		var file_path = session.to_namespace(data.filename, 'File');
		// library_namespace.info('upload_callback: options.page_text_updater');
		// console.log(JSON.stringify(data));
		// console.log(file_path);
		// console.trace(options);
		wiki_API.edit(file_path, options.page_text_updater, options.token,
				options, callback);
	}

	// ------------------------------------------
	// 使用於需要多次更新頁面內容的情況。

	if (false) {
		(function() {
			// TODO:
			var update_Variable_Map = new CeL.wiki.Variable_Map;
			update_Variable_Map.set('variable_name', wikitext_value);
			update_Variable_Map.set('timestamp', {
				// .may_not_update: 可以不更新。 e.g., timestamp
				may_not_update : true,
				wikitext : '<onlyinclude>~~~~~</onlyinclude>'
			});
			update_Variable_Map.template = '...\n' + '*date: '
					+ update_Variable_Map.format('timestamp') + '\n'
					+ update_Variable_Map.format('variable_name') + '...';
			wiki.edit(page, update_Variable_Map, options);
		})();
	}

	/**
	 * <code>CeL.wiki.Variable_Map</code> is used to update content when
	 * update pages or files. It will insert comments around the value, prevent
	 * others from accidentally editing the text that will be overwritten.
	 * 
	 * @param {Array}iterable
	 *            initial values
	 */
	function Variable_Map(iterable) {
		if (library_namespace.is_Object(iterable))
			iterable = Object.entries(iterable);

		if (typeof Symbol !== 'function') {
			// New environment do not allow this.
			try {
				Map.call(this, iterable);
				// Object.assign(iterable, Map.prototype);
				return;
			} catch (e) {
				// node.js 0.11: Constructor Map requires 'new'
			}
		}

		iterable = new Map(iterable);
		// Copy all methods
		Object.assign(iterable, Variable_Map.prototype);

		return iterable;
	}

	// class Variable_Map extends Map{ ... }
	Variable_Map.prototype = {
		format : Variable_Map_format,
		update : Variable_Map_update,
		to_page_text_updater : Variable_Map_to_page_text_updater,
		// 採用 Object.assign() 無法設定 constructor。
		constructor : Variable_Map
	};
	// console.trace(Variable_Map.prototype);

	Variable_Map.is_Variable_Map = function is_Variable_Map(value) {
		return value && value.constructor === Variable_Map;
	};

	// @see https://en.wikipedia.org/wiki/User:DrTrigonBot/Subster
	function Variable_Map_format(variable_name, default_value) {
		var start_mark = '<!-- update '
				+ variable_name
				+ ': '
				// gettext_config:{"id":"the-text-between-update-comments-will-be-automatically-overwritten-by-the-bot"}
				+ gettext('The text between update comments will be automatically overwritten by the bot.')
				+ ' -->';
		var end_mark = '<!-- update end: ' + variable_name + ' -->';
		var value;
		if (this.has(variable_name)) {
			value = this.get(variable_name);
			if (library_namespace.is_Object(value)) {
				// TODO: value.wikitext === undefined
				value = value.wikitext;
			}
		} else {
			value = default_value === undefined ? '' : default_value;
		}
		return start_mark + value + end_mark;
	}

	// [ all_mark, start_mark, variable_name, original_value, end_mark, tail ]
	var Variable_Map__PATTERN_mark = /(<!--\s*update ([^():]+)[\s\S]*?-->)([\s\S]*?)(<!--\s*update end:\s*\2(?:\W[\s\S]*?)?-->)(\n)?/g;
	var Variable_Map__PATTERN_template_mark = /({{Auto-generated\s*\|([^{}|]+)}})([\s\S]*?)({{Auto-generated\s*\|\2\|end}})/;

	// Get all mark list
	Variable_Map.get_all_marks = {
		get_all_marks : true
	};
	Variable_Map.text_has_mark = function text_has_mark(wikitext,
			mark_variable_name) {
		var matched, mark_list = mark_variable_name === Variable_Map.get_all_marks
				&& [];
		while (matched = Variable_Map__PATTERN_mark.exec(wikitext)) {
			if (mark_list) {
				mark_list.push(matched[2]);
			}
			if (matched[2] === mark_variable_name)
				break;
		}
		Variable_Map__PATTERN_mark.lastIndex = 0;
		return mark_list || !!matched;
	};

	function Variable_Map_update(wikitext, options) {
		// 前置處理。
		options = library_namespace.new_options(options);

		// options.force_change 可強制回傳 {String}
		var changed = options.force_change, variable_Map = this, counter = new Map, remove_duplicates = options.remove_duplicates
				&& (typeof options.remove_duplicates === 'string' ? [ options.remove_duplicates ]
						: Array.isArray(options.remove_duplicates)
								&& options.remove_duplicates);
		// console.trace(variable_Map);

		function replacer(all_mark, start_mark, variable_name, original_value,
				end_mark, tail) {
			if (false) {
				console.trace([ all_mark, variable_name,
						variable_Map.has(variable_name) ]);
			}

			// 保留第一個標記。 options.preserve_the_first_mark
			if (remove_duplicates && remove_duplicates.includes(variable_name)
					&& counter.get(variable_name) > 0) {
				return '';
			}

			counter.set(variable_name, (counter.get(variable_name) || 0) + 1);

			// console.trace(variable_Map);
			if (variable_Map.has(variable_name)) {
				var value = variable_Map.get(variable_name), may_not_update;
				if (library_namespace.is_Object(value)) {
					// console.trace([ variable_name, value.may_not_update ]);
					// .may_not_update: 可以不更新。 e.g., timestamp
					may_not_update = value.may_not_update;
					value = value.wikitext;
				}
				if (value !== original_value) {
					if (!may_not_update)
						changed = variable_name;
					// preserve start_mark, end_mark
					return start_mark + value + end_mark + (tail || '');
				}
			}
			return all_mark;
		}

		// TODO:
		if (false) {
			wikitext = wikitext.replace(Variable_Map__PATTERN_template_mark,
					replacer);
		}
		wikitext = wikitext.replace(Variable_Map__PATTERN_mark, replacer);
		// console.trace(changed);
		if (!changed) {
			return [ wiki_API.edit.cancel,
					'Variable_Map_update: ' + 'Nothing to update' ];
		}
		// console.trace(wikitext);
		return wikitext;
	}

	// @inner
	function Variable_Map__page_text_updater(page_data) {
		// console.trace(page_data);
		/**
		 * {String}page content, maybe undefined. 條目/頁面內容 =
		 * CeL.wiki.revision_content(revision)
		 */
		var content = wiki_API.content_of(page_data);
		// console.trace(content);

		var force_change;
		if (!content || !content.trim()) {
			content = this.template;
			if (typeof content === 'function')
				content = this.template(page_data);
			force_change = !!content;
		}

		if (content) {
			// console.trace(content);
			// console.trace(this.update(content));

			// using function Variable_Map_update(wikitext)
			return this.update(content, {
				force_change : force_change
			});
		}

		if (false) {
			// or: 此頁面不存在/已刪除。
			// gettext_config:{"id":"no-content"}
			content = gettext('No content: ')
					+ wiki_API.title_link_of(page_data);
		}
		content = 'Variable_Map__page_text_updater: '
				+ wiki_API.title_link_of(page_data)
				+ ': No .template specified.';
		// library_namespace.log(content);
		return [ wiki_API_edit.cancel, content ];
	}
	function Variable_Map_to_page_text_updater() {
		return Variable_Map__page_text_updater.bind(this);
	}

	Variable_Map.plain_text = function plain_text(wikitext) {
		return wiki_link.replace(/<\!--[\s\S]*?-->/g, '');
	};

	wiki_API.Variable_Map = Variable_Map;

	// ------------------------------------------------------------------------

	// export 導出.

	return wiki_API_edit;
}
