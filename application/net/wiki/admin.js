/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): 管理員相關的 adminship
 *       functions
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * TODO:<code>


</code>
 * 
 * @since 2019/10/12 拆分自 CeL.application.net.wiki
 */

// More examples: see /_test suite/test.js
// Wikipedia bots demo: https://github.com/kanasimi/wikibot
'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.wiki.admin',

	require : 'application.net.wiki.'
	// load MediaWiki module basic functions
	+ '|application.net.wiki.namespace.'
	//
	+ '|application.net.wiki.query.|application.net.wiki.page.',

	// 設定不匯出的子函式。
	no_extend : 'this,*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var wiki_API = library_namespace.application.net.wiki, KEY_SESSION = wiki_API.KEY_SESSION;

	// ------------------------------------------------------------------------
	// administrator functions. 管理員相關函數。

	// callback(response, error);
	function wiki_operator(parameters, options, callback) {
		var action = parameters.action;
		var session = wiki_API.session_of_options(options);

		// ----------------------------
		// 處理 target page。
		var default_KEY_ID = 'pageid', default_KEY_TITLE = 'title', KEY_ID = default_KEY_ID, KEY_TITLE = default_KEY_TITLE;
		if (parameters.to) {
			// move_to
			KEY_ID = 'fromid';
			KEY_TITLE = 'from';
		}

		// 都先從 options 取值，再從 session 取值。
		if (options[KEY_ID] >= 0 || options[default_KEY_ID] >= 0) {
			parameters[KEY_ID] = options[KEY_ID] >= 0 ? options[KEY_ID]
					: options[default_KEY_ID];
		} else if (options[KEY_TITLE] || options[default_KEY_TITLE]) {
			parameters[KEY_TITLE] = wiki_API.title_of(options[KEY_TITLE]
			// options.from_title
			|| options[default_KEY_TITLE]);
		} else if (wiki_API.is_page_data(session && session.last_page)) {
			// options.page_data
			if (session.last_page.pageid >= 0)
				parameters[KEY_ID] = session.last_page.pageid;
			else
				parameters[KEY_TITLE] = session.last_page.title;
		} else {
			// 可能沒有 page_data
			var error = 'No page specified: ' + JSON.stringify(options);
			library_namespace.error('wiki_operator: ' + error);
			callback(undefined, new Error(error));
			return;
		}

		// ----------------------------

		// console.trace(action, parameters);

		// TODO: 若是頁面不存在/已刪除，那就直接跳出。

		if (action === 'move') {
			library_namespace.is_debug((parameters.fromid || parameters.from)
			// .move_to_title
			+ ' → ' + parameters.to, 1, 'wiki_operator.move');
		}

		wiki_API.query({
			action : action
		}, function(response, error) {
			// console.log(JSON.stringify(response));
			error = wiki_API.query.handle_error(response, error);
			if (error) {
				callback(response, error);
			} else {
				callback(response[action]);
			}
		}, parameters, options);
	}

	// ================================================================================================================

	/**
	 * remove / delete a page.
	 * 
	 * @example<code>

	wiki.page('title')['delete']({
		reason: 'reason'
	}, function(response, error) {
		// handle response or error

		// response:

		{"title":"Title","reason":"reason","logid":000}

		{"delete":{"title":"Title","reason":"content was: \"...\", and the only contributor was \"[[Special:Contributions/Cewbot|Cewbot]]\" ([[User talk:Cewbot|talk]])","logid":0000}}
		{"error":{"code":"nosuchpageid","info":"There is no page with ID 0.","*":"See https://test.wikipedia.org/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes."},"servedby":"mw1232"}

	});


	CeL.wiki['delete'](CeL.wiki.add_session_to_options({
		title: 'title',
		reason: 'reason'
	}), function(response, error) {
		// handle response or error
	});

	</code>
	 * 
	 * @param {Object}options
	 *            附加參數/設定選擇性/特殊功能與選項。
	 * @param {Function}callback
	 *            回調函數，function(response, error){...} response: API response
	 *            data. error: error message.
	 * 
	 * @returns
	 * 
	 * @see https://www.mediawiki.org/w/api.php?action=help&modules=delete
	 */
	function wiki_API_delete(options, callback) {
		var action = 'delete';
		if (wiki_API.need_get_API_parameters(action, options, wiki_API_delete,
				arguments)) {
			return;
		}

		var parameters = wiki_API.extract_parameters(options, {
			action : action
		}, true);

		wiki_operator(parameters, options, callback);
	}

	wiki_API['delete'] = wiki_API_delete;

	// ----------------------------------------------------

	/**
	 * move a page from `from` to target `to`.
	 * 
	 * @example<code>

	wiki.page('title').move_to({
		reason: 'reason'
	}, function(response, error) {
		// handle response or error

		// response:

		{"error":{"code":"nosuchpageid","info":"There is no page with ID 0.","*":"See https://zh.wikipedia.org/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes."},"servedby":"mw1277"}

		{"code":"articleexists","info":"A page of that name already exists, or the name you have chosen is not valid. Please choose another name.","*":"See https://zh.wikipedia.org/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes."}
		{"code":"selfmove","info":"The title is the same; cannot move a page over itself.","*":"See https://zh.wikipedia.org/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes."}

		{ from: 'From', to: 'To', reason: 'reason', redirectcreated: '', moveoverredirect: '' }
		{ error: { code: 'articleexists', info: 'A page already exists at [[:To]], or the page name you have chosen is not valid. Please choose another name.', '*': 'See https://test.wikipedia.org/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes.' } }

	});


	CeL.wiki.move_to(CeL.wiki.add_session_to_options({
		title: 'title',
		reason: 'reason'
	}), function(response, error) {
		// handle response or error
	});

	</code>
	 * 
	 * @param {Object}options
	 *            附加參數/設定選擇性/特殊功能與選項。
	 * @param {Function}callback
	 *            回調函數，function(response, error){...} response: API response
	 *            data. error: error message.
	 * 
	 * @returns
	 * 
	 * @see https://www.mediawiki.org/w/api.php?action=help&modules=move
	 */
	function wiki_API_move_to(options, callback) {
		var action = 'move';
		if (wiki_API.need_get_API_parameters(action, options, wiki_API_move_to,
				arguments)) {
			return;
		}

		if (!options || !options.reason) {
			library_namespace
					.warn('wiki_API_move_to: Should set reason when moving page!');
		}

		var parameters = wiki_API.extract_parameters(options, {
			action : action
		}, true);

		// console.log(options);
		wiki_operator(parameters, options, callback);
	}

	wiki_API.move_to = wiki_API_move_to;

	// ----------------------------------------------------

	wiki_API_protect.default_protect_level = 'edit=sysop|move=sysop';

	/**
	 * Change the protection level of a page. 變更保護層級。
	 * 
	 * @example<code>

	wiki.page('title').protect({
		// 在正式場合，最好給個好的理由。
		// @see [[MediaWiki:Protect-dropdown]]
		//reason : '',

		// 期限，預設為 infinite。
		//expiry : 'infinite',

		// 保護選項，一般說來 edit 應與 move 同步。
		//protections: 'edit=sysop|move=sysop'
	}, function(response, error) {
		// handle response or error

		// response:

		{"protect":{"title":"title","reason":"reason","protections":[{"edit":"sysop","expiry":"infinite"},{"move":"sysop","expiry":"infinite"}]}}
		{"servedby":"mw1203","error":{"code":"nosuchpageid","info":"There is no page with ID 2006","*":"See https://zh.wikinews.org/w/api.php for API usage"}}
	});


	CeL.wiki.protect(CeL.wiki.add_session_to_options({
		title: 'title',
		reason: 'reason',
		//protections: 'edit=sysop|move=sysop'
	}), function(response, error) {
		// handle response or error
	});

	</code>
	 * 
	 * @param {Object}options
	 *            附加參數/設定選擇性/特殊功能與選項。
	 * @param {Function}callback
	 *            回調函數，function(response, error){...} response: API response
	 *            data. error: error message.
	 * 
	 * @returns
	 * 
	 * @see wiki_API.is_protected
	 * @see https://www.mediawiki.org/w/api.php?action=help&modules=protect
	 */
	function wiki_API_protect(options, callback) {
		var action = 'protect';
		if (wiki_API.need_get_API_parameters(action, options, wiki_API_protect,
				arguments)) {
			return;
		}

		var parameters = wiki_API.extract_parameters(options, {
			action : action,
			protections : wiki_API_protect.default_protect_level
		}, true);

		wiki_operator(parameters, options, callback);
	}

	wiki_API.protect = wiki_API_protect;

	// ----------------------------------------------------

	// rollback 僅能快速撤銷/回退/還原某一頁面最新版本之作者(最後一位使用者)一系列所有編輯至另一作者的編輯
	// The rollback revision will be marked as minor.
	/**
	 * Change the protection level of a page.
	 * 
	 * @example<code>

	wiki.page('title').rollback({
		reason: 'reason'
	}, function(response, error) {
		// handle response or error

		// response:

		// revid 回滾的版本ID。
		// old_revid 被回滾的第一個（最新）修訂的修訂ID。
		// last_revid 被回滾最後一個（最舊）版本的修訂ID。
		// 如果回滾不會改變的頁面，沒有新修訂而成。在這種情況下，revid將等於old_revid。
		{"rollback":{"title":"title","pageid":1,"summary":"","revid":9,"old_revid":7,"last_revid":1,"messageHtml":"<p></p>"}}
		{"servedby":"mw1190","error":{"code":"badtoken","info":"Invalid token","*":"See https://zh.wikinews.org/w/api.php for API usage"}}
	});


	CeL.wiki.rollback(CeL.wiki.add_session_to_options({
		title: 'title',
		reason: 'reason'
	}), function(response, error) {
		// handle response or error
	});

	</code>
	 * 
	 * @param {Object}options
	 *            附加參數/設定選擇性/特殊功能與選項。
	 * @param {Function}callback
	 *            回調函數，function(response, error){...} response: API response
	 *            data. error: error message.
	 * 
	 * @returns
	 * 
	 * @see https://www.mediawiki.org/w/api.php?action=help&modules=rollback
	 */
	function wiki_API_rollback(options, callback) {
		var action = 'rollback';
		if (wiki_API.need_get_API_parameters(action, options,
				wiki_API_rollback, arguments)) {
			return;
		}

		var session = wiki_API.session_of_options(options);

		if (session && !session.token.rollbacktoken) {
			library_namespace.debug('Get rollback token.', 1,
					'wiki_API_rollback');
			session.get_token(wiki_API_rollback.bind(null, options, callback),
					'rollback');
			return;
		}

		var parameters = {
			action : action,
			token_type : 'rollback'
		};

		// ----------------------------
		// 處理 user。

		// assert: 有 parameters, e.g., {Object}parameters
		// 可能沒有 session, page_data
		var page_data = session && session.last_page;

		if (!options.user && wiki_API.content_of.revision(page_data)) {
			if (options.pageid && options.pageid !== page_data.pageid
			// 要用 pageid / title 的話，得保證 page_data 與 options 兩者相同。
			|| options.title && options.title !== page_data.title) {
				library_namespace.debug(
						'options 指定的頁面資料不同於 session 最後取得的頁面資料，捨棄 cache。', 1,
						'wiki_API_rollback');
				delete session.last_page;
				page_data = null;
			} else {
				// 將最後一個版本的編輯者當作回退對象。
				parameters.user = wiki_API.content_of.revision(page_data).user;
			}
		}

		// 都先從 options 取值，再從 session 取值。

		// If the last user who edited the page made multiple edits in a row,
		// they will all be rolled back.
		if (!options.user && !parameters.user) {
			library_namespace.debug('抓取頁面最後的編輯者試試...', 1, 'wiki_API_rollback');

			wiki_API.page(page_data || options.pageid || options.title,
			//
			function(page_data, error) {
				if (error || !wiki_API.content_of.revision(page_data)
				// 保證不會再持續執行。
				|| !wiki_API.content_of.revision(page_data).user) {
					if (false) {
						library_namespace.error(
						//
						'wiki_API_rollback: No user name specified!');
					}

					callback(undefined, new Error(
							'No user name specified and I cannot guess it!'));
					return;
				}

				wiki_API_rollback(options, callback);
			}, Object.assign({
				rvprop : 'ids|timestamp|user'
			}, options));
			return;
		}

		// ----------------------------

		parameters = wiki_API.extract_parameters(options, parameters);

		if (!('markbot' in parameters) && options.bot) {
			parameters.markbot = options.bot;
		}

		wiki_operator(parameters, options, callback);
	}

	wiki_API.rollback = wiki_API_rollback;

	// ----------------------------------------------------

	// 目前的修訂，不可隱藏。
	// This is the current revision. It cannot be hidden.
	// https://www.mediawiki.org/w/api.php?action=help&modules=revisiondelete
	function wiki_API_hide_revision(options, callback) {
		TODO;
	}

	// wiki_API.hide_revision = wiki_API_hide_revision;

	// ------------------------------------------------------------------------

	// export 導出.

	// 不設定(hook)本 module 之 namespace，僅執行 module code。
	return library_namespace.env.not_to_extend_keyword;
}
