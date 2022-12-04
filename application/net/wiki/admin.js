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

	// 自 options 汲取出 parameters。
	// TODO: 整合進 normalize_parameters。
	// default_parameters[parameter name] = required
	function draw_parameters(options, default_parameters, token_type) {
		if (!options) {
			// Invalid options/parameters
			return 'No options specified';
		}

		// 汲取出 parameters。
		var parameters = Object.create(null);
		if (default_parameters) {
			for ( var parameter_name in default_parameters) {
				if (parameter_name in options) {
					// in case options[parameter_name] === false
					if (options[parameter_name])
						parameters[parameter_name] = options[parameter_name];
				} else if (default_parameters[parameter_name]) {
					// 表示此屬性為必須存在/指定的屬性。
					// This parameter is required.
					return 'No property ' + parameter_name + ' specified';
				}

			}
		}

		var session = options[KEY_SESSION];

		// assert: 有parameters, e.g., {Object}parameters
		// 可能沒有 session

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
			if (library_namespace.is_debug()) {
				library_namespace.error('draw_parameters: No page specified: '
						+ JSON.stringify(options));
			}
			return 'No page id/title specified';
		}

		// ----------------------------
		// 處理 token。
		if (!token_type) {
			token_type = 'csrf';
		}
		var token = options.token || session && session.token;
		if (token && typeof token === 'object') {
			// session.token.csrftoken
			token = token[token_type + 'token'];
		}
		if (!token) {
			// TODO: use session
			if (false) {
				library_namespace.error('draw_parameters: No token specified: '
						+ options);
			}
			return 'No ' + token_type + 'token specified';
		}
		parameters.token = token;

		return parameters;
	}

	// use "csrf" token retrieved from action=query&meta=tokens
	// callback(response, error);
	function wiki_operator(action, default_parameters, options, callback) {
		// default_parameters
		// Warning: 除 pageid/title/token 之外，這邊只要是能指定給 API 的，皆必須列入！
		var parameters = draw_parameters(options, default_parameters);
		// console.log(parameters);
		if (!library_namespace.is_Object(parameters)) {
			// error occurred.
			if (typeof callback === 'function')
				callback(undefined, parameters);
			return;
		}

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
			if (wiki_API.query.handle_error(response, error, callback)) {
				return;
			}
			callback(response[action]);
		}, parameters, options);
	}

	// ================================================================================================================

	// wiki_API.delete(): remove / delete a page.
	wiki_API['delete'] = function(options, callback) {
		// https://www.mediawiki.org/w/api.php?action=help&modules=delete

		/**
		 * response: <code>
		{"delete":{"title":"Title","reason":"content was: \"...\", and the only contributor was \"[[Special:Contributions/Cewbot|Cewbot]]\" ([[User talk:Cewbot|talk]])","logid":0000}}
		{"error":{"code":"nosuchpageid","info":"There is no page with ID 0.","*":"See https://test.wikipedia.org/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes."},"servedby":"mw1232"}
		 * </code>
		 */

		wiki_operator('delete', {
			reason : false,
			tags : false,
			watchlist : false,
			watchlistexpiry : false,
			oldimage : false
		}, options, callback);
	};

	// ----------------------------------------------------

	// wiki_API.move_to(): move a page from `from` to target `to`.
	wiki_API.move_to = function(options, callback) {
		// https://www.mediawiki.org/w/api.php?action=help&modules=move
		var default_parameters = {
			to : true,
			reason : false,
			movetalk : false,
			movesubpages : false,
			noredirect : false,
			watchlist : false,
			ignorewarnings : false,
			tags : false
		};

		if (!options || !options.reason) {
			library_namespace
					.warn('wiki_API.move_to: Should set reason when moving page!');
		}

		/**
		 * response: <code>
		{"error":{"code":"nosuchpageid","info":"There is no page with ID 0.","*":"See https://zh.wikipedia.org/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes."},"servedby":"mw1277"}
		error:
		{"code":"articleexists","info":"A page of that name already exists, or the name you have chosen is not valid. Please choose another name.","*":"See https://zh.wikipedia.org/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes."}
		{"code":"selfmove","info":"The title is the same; cannot move a page over itself.","*":"See https://zh.wikipedia.org/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes."}

		{ from: 'from', to: 'to', reason: '', redirectcreated: '', moveoverredirect: '' }
		{ error: { code: 'articleexists', info: 'A page already exists at [[:To]], or the page name you have chosen is not valid. Please choose another name.', '*': 'See https://test.wikipedia.org/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes.' } }

		</code>
		 */

		// console.log(options);
		wiki_operator('move', default_parameters, options, callback);
	};

	// ----------------------------------------------------

	// @see wiki_API.is_protected
	// Change the protection level of a page.
	wiki_API.protect = function(options, callback) {
		// https://www.mediawiki.org/w/api.php?action=help&modules=protect

		/**
		 * response: <code>
		{"protect":{"title":"title","reason":"存檔保護作業","protections":[{"edit":"sysop","expiry":"infinite"},{"move":"sysop","expiry":"infinite"}]}}
		{"servedby":"mw1203","error":{"code":"nosuchpageid","info":"There is no page with ID 2006","*":"See https://zh.wikinews.org/w/api.php for API usage"}}
		 * </code>
		 */

		wiki_operator('protect', {
			// protections: e.g., 'edit=sysop|move=sysop', 一般說來edit應與move同步。
			protections : true,
			// 在正式場合，最好給個好的理由。
			// reason: @see [[MediaWiki:Protect-dropdown]]
			reason : false,
			// expiry : 'infinite',
			expiry : false,
			tags : false,
			cascade : false,
			watchlist : false
		}, Object.assign({
			protections : 'edit=sysop|move=sysop'
		}, options), callback);
	};

	// ----------------------------------------------------

	// rollback 僅能快速撤銷/回退/還原某一頁面最新版本之作者(最後一位使用者)一系列所有編輯至另一作者的編輯
	// The rollback revision will be marked as minor.
	wiki_API.rollback = function(options, callback) {
		var session = wiki_API.session_of_options(options);

		if (session && !session.token.rollbacktoken) {
			session.get_token(function() {
				wiki_API.rollback(options, callback);
			}, 'rollback');
		}

		var parameters = draw_parameters(options, {
			// default_parameters
			// Warning: 除外pageid/title/token這邊只要是能指定給 API 的，皆必須列入！
			user : false,
			summary : false,
			markbot : false,
			tags : false
		}, 'rollback');
		if (!library_namespace.is_Object(parameters)) {
			// error occurred.
			if (typeof callback === 'function')
				callback(undefined, parameters);
			return;
		}

		// 都先從 options 取值，再從 session 取值。
		var page_data =
		// options.page_data ||
		options.pageid && options || session && session.last_page;

		// assert: 有parameters, e.g., {Object}parameters
		// 可能沒有 session, page_data

		if (!parameters.user && wiki_API.content_of.revision(page_data)) {
			// 將最後一個版本的編輯者當作回退對象。
			parameters.user = wiki_API.content_of.revision(page_data).user;
		}

		// https://www.mediawiki.org/w/api.php?action=help&modules=rollback
		// If the last user who edited the page made multiple edits in a row,
		// they will all be rolled back.
		if (!parameters.user) {
			// 抓最後的編輯者試試。
			// 要用pageid的話，得採page_data，就必須保證兩者相同。
			if (!parameters.title && page_data
					&& parameters.pageid !== page_data.pageid) {
				callback(undefined, 'parameters.pageid !== page_data.pageid');
				return;
			}
			wiki_API.page(page_data || parameters.title, function(page_data,
					error) {
				if (error || !wiki_API.content_of.revision(page_data)
				// 保證不會再持續執行。
				|| !wiki_API.content_of.revision(page_data).user) {
					if (false) {
						library_namespace.error(
						//
						'wiki_API.rollback: No user name specified!');
					}

					callback(undefined,
					//
					'No user name specified and I cannot guess it!');
					return;
				}
				wiki_API.rollback(options, callback);
			}, Object.assign({
				rvprop : 'ids|timestamp|user'
			}, options));
			return;
		}

		if (!('markbot' in parameters) && options.bot) {
			parameters.markbot = options.bot;
		}

		/**
		 * response: <code>
		{"rollback":{"title":"title","pageid":1,"summary":"","revid":9,"old_revid":7,"last_revid":1,"messageHtml":"<p></p>"}}
		{"servedby":"mw1190","error":{"code":"badtoken","info":"Invalid token","*":"See https://zh.wikinews.org/w/api.php for API usage"}}
		 * </code>
		 */
		wiki_API.query({
			action : 'rollback'
		}, function(response) {
			var error = response && response.error;
			if (error) {
				callback(response, error);
			} else {
				// revid 回滾的版本ID。
				// old_revid 被回滾的第一個（最新）修訂的修訂ID。
				// last_revid 被回滾最後一個（最舊）版本的修訂ID。
				// 如果回滾不會改變的頁面，沒有新修訂而成。在這種情況下，revid將等於old_revid。
				callback(response.rollback);
			}
		}, parameters, options);
	};

	// ----------------------------------------------------

	// 目前的修訂，不可隱藏。
	// This is the current revision. It cannot be hidden.
	wiki_API.hide = function(options, callback) {
		TODO;
	};

	// ------------------------------------------------------------------------

	// export 導出.

	// 不設定(hook)本 module 之 namespace，僅執行 module code。
	return library_namespace.env.not_to_extend_keyword;
}
