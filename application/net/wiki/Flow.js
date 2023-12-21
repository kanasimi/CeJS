/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): Flow, Structured
 *       Discussions
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * TODO:<code>


</code>
 * 
 * @since 2019/10/11 拆分自 CeL.application.net.wiki
 * 
 * @see https://www.mediawiki.org/wiki/Structured_Discussions/Deprecation
 */

// More examples: see /_test suite/test.js
// Wikipedia bots demo: https://github.com/kanasimi/wikibot
'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.wiki.Flow',

	require : 'data.native.' + '|application.net.wiki.'
	// load MediaWiki module basic functions
	+ '|application.net.wiki.namespace.'
	//
	+ '|application.net.wiki.query.',

	// 設定不匯出的子函式。
	no_extend : 'this,*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var wiki_API = library_namespace.application.net.wiki, KEY_SESSION = wiki_API.KEY_SESSION;
	// @inner
	var is_api_and_title = wiki_API.is_api_and_title, normalize_title_parameter = wiki_API.normalize_title_parameter;

	// --------------------------------------------------------------------------------------------
	// Flow page support. Flow 功能支援。
	// [[mediawikiwiki:Extension:Flow/API]]
	// https://www.mediawiki.org/w/api.php?action=help&modules=flow

	// https://zh.wikipedia.org/w/api.php?action=query&prop=flowinfo&titles=Wikipedia_talk:Flow_tests
	// https://zh.wikipedia.org/w/api.php?action=query&prop=info&titles=Wikipedia_talk:Flow_tests
	// https://zh.wikipedia.org/w/api.php?action=flow&submodule=view-topiclist&page=Wikipedia_talk:Flow_tests&vtlformat=wikitext&utf8=1
	// .roots[0]
	// https://zh.wikipedia.org/w/api.php?action=flow&submodule=view-topic&page=Topic:sqs6skdav48d3xzn&vtformat=wikitext&utf8=1

	// https://www.mediawiki.org/w/api.php?action=flow&submodule=view-header&page=Talk:Sandbox&vhformat=wikitext&utf8=1
	// https://www.mediawiki.org/w/api.php?action=flow&submodule=view-topiclist&utf8=1&page=Talk:Sandbox

	/**
	 * get the infomation of Flow.
	 * 
	 * @param {String|Array}title
	 *            page title 頁面標題。可為話題id/頁面標題+話題標題。<br />
	 *            {String}title or [ {String}API_URL, {String}title or
	 *            {Object}page_data ]
	 * @param {Function}callback
	 *            回調函數。 callback({Object}page_data)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 */
	function Flow_info(title, callback, options) {
		// options.multi = true;
		var action = normalize_title_parameter(title, options);
		if (!action) {
			throw 'Flow_info: Invalid title: ' + wiki_API.title_link_of(title);
		}

		// [[mw:Extension:StructuredDiscussions/API#Detection]]
		// 'prop=flowinfo' is deprecated. use 'action=query&prop=info'.
		// The content model will be 'flow-board' if it's enabled.
		action[1] = 'action=query&prop=info&' + action[1];

		wiki_API.query(action, typeof callback === 'function'
		//
		&& function(data) {
			if (library_namespace.is_debug(2)
			// .show_value() @ interact.DOM, application.debug
			&& library_namespace.show_value)
				library_namespace.show_value(data, 'Flow_info: data');

			var error = data && data.error;
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.error('Flow_info: ['
				//
				+ error.code + '] ' + error.info);
				/**
				 * e.g., Too many values supplied for parameter 'pageids': the
				 * limit is 50
				 */
				if (data.warnings
				//
				&& data.warnings.query && data.warnings.query['*'])
					library_namespace.warn(data.warnings.query['*']);
				callback(data, error);
				return;
			}

			if (!data || !data.query || !data.query.pages) {
				library_namespace.warn('Flow_info: Unknown response: ['
				//
				+ (typeof data === 'object'
				//
				&& typeof JSON !== 'undefined'
				//
				? JSON.stringify(data) : data) + ']');
				if (library_namespace.is_debug()
				// .show_value() @ interact.DOM, application.debug
				&& library_namespace.show_value)
					library_namespace.show_value(data);
				callback(null, data);
				return;
			}

			// TODO: data.query.normalized=[{from:'',to:''},...]

			data = data.query.pages;
			var pages = [];
			for ( var pageid in data) {
				var page = data[pageid];
				pages.push(page);
			}

			// options.multi: 即使只取得單頁面，依舊回傳 Array。
			if (!options || !options.multi)
				if (pages.length <= 1) {
					if (pages = pages[0])
						pages.is_Flow = is_Flow(pages);
					library_namespace.debug('只取得單頁面 [[' + pages.title
					//
					+ ']]，將回傳此頁面資料，而非 Array。', 2, 'Flow_info');
				} else {
					library_namespace.debug('Get ' + pages.length
					//
					+ ' page(s)! The pages'
					//
					+ ' will all passed to callback as Array!'
					//
					, 2, 'Flow_info');
				}

			/**
			 * page 之 structure 將按照 wiki API 本身之 return！<br />
			 * <code>
			page_data = {ns,title,missing:'']}
			page_data = {pageid,ns,title,flowinfo:{flow:[]}}
			page_data = {pageid,ns,title,flowinfo:{flow:{enabled:''}}}
			 * </code>
			 */
			callback(pages);
		}, null, options);
	}

	/**
	 * 檢測 page_data 是否為 Flow 討論頁面系統。
	 * 
	 * other contentmodel: "MassMessageListContent"
	 * 
	 * @param {Object}page_data
	 *            page data got from wiki API.
	 * 
	 * @returns {Boolean}是否為 Flow 討論頁面。
	 */
	function is_Flow(page_data) {
		if ('contentmodel' in page_data) {
			// used in prop=info
			return page_data.contentmodel === 'flow-board';
		}

		var flowinfo = page_data &&
		// wiki_API.is_page_data(page_data) &&
		page_data.flowinfo;
		if (flowinfo) {
			// used in prop=flowinfo (deprecated)
			// flowinfo:{flow:{enabled:''}}
			return flowinfo.flow && ('enabled' in flowinfo.flow);
		}

		// e.g., 從 wiki_API.page 得到的 page_data
		if (page_data = wiki_API.content_of.revision(page_data))
			return (page_data.contentmodel || page_data.slots
					&& page_data.slots.main
					&& page_data.slots.main.contentmodel) === 'flow-board';
	}

	/** {Object}abbreviation 縮寫 */
	var Flow_abbreviation = {
		// https://www.mediawiki.org/w/api.php?action=help&modules=flow%2Bview-header
		// 關於討論板的描述。使用 .revision
		header : 'h',
		// https://www.mediawiki.org/w/api.php?action=help&modules=flow%2Bview-topiclist
		// 討論板話題列表。使用 .revisions
		topiclist : 'tl'
	};

	/**
	 * get topics of the page.
	 * 
	 * @param {String|Array}title
	 *            page title 頁面標題。可為話題id/頁面標題+話題標題。 {String}title or [
	 *            {String}API_URL, {String}title or {Object}page_data ]
	 * @param {Function}callback
	 *            回調函數。 callback({Object}topiclist)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 */
	function Flow_page(title, callback, options) {
		// 處理 [ {String}API_URL, {String}title or {Object}page_data ]
		if (!is_api_and_title(title)) {
			title = [ options[KEY_SESSION] && options[KEY_SESSION].API_URL,
					title ];
		}

		var page_data;
		if (wiki_API.is_page_data(title[1]))
			page_data = title[1];

		title[1] = 'page=' + encodeURIComponent(wiki_API.title_of(title[1]));

		if (options && options.redirects) {
			// 舊版毋須 '&redirects=1'，'&redirects' 即可。
			title[1] += '&redirects=1';
		}

		// e.g., { flow_view : 'header' }
		var view = options && options.flow_view
		//
		|| Flow_page.default_flow_view;
		title[1] = 'action=flow&submodule=view-' + view + '&v'
				+ (Flow_abbreviation[view] || view.charAt(0).toLowerCase())
				+ 'format=' + (options && options.format || 'wikitext') + '&'
				+ title[1];

		if (!title[0])
			title = title[1];

		wiki_API.query(title, typeof callback === 'function'
		//
		&& function(data) {
			if (library_namespace.is_debug(2)
			// .show_value() @ interact.DOM, application.debug
			&& library_namespace.show_value)
				library_namespace.show_value(data, 'Flow_page: data');

			var error = data && data.error;
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.error(
				//
				'Flow_page: [' + error.code + '] ' + error.info);
				callback(page_data);
				return;
			}

			// data =
			// { flow: { 'view-topiclist': { result: {}, status: 'ok' } } }
			if (!(data = data.flow)
			//
			|| !(data = data['view-' + view]) || data.status !== 'ok') {
				library_namespace.error(
				//
				'Flow_page: Error status [' + (data && data.status) + ']');
				callback(page_data);
				return;
			}

			if (page_data)
				// assert: data.result = { ((view)) : {} }
				Object.assign(page_data, data.result);
			else
				page_data = data.result[view];
			callback(page_data);
		}, null, options);
	}

	/** {String}default view to flow page */
	Flow_page.default_flow_view = 'topiclist';

	/**
	 * Create a new topic. 發新話題。 Reply to an existing topic.
	 * 
	 * @param {String|Array}title
	 *            page title 頁面標題。 {String}title or [ {String}API_URL,
	 *            {String}title or {Object}page_data ]
	 * @param {String}topic
	 *            新話題的標題文字。 {String}topic
	 * @param {String|Function}text
	 *            page contents 頁面內容。 {String}text or {Function}text(page_data)
	 * @param {Object}token
	 *            login 資訊，包含“csrf”令牌/密鑰。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * @param {Function}[callback]
	 *            回調函數。 callback(title, error, result)
	 * 
	 * @see https://www.mediawiki.org/w/api.php?action=help&modules=flow%2Bnew-topic
	 *      https://www.mediawiki.org/w/api.php?action=help&modules=flow%2Breply
	 */
	function edit_topic(title, topic, text, token, options, callback) {
		// console.log(text);
		if (library_namespace.is_thenable(text)) {
			text.then(function(text) {
				edit_topic(title, topic, text, token, options, callback);
			}, function(error) {
				callback(title, error);
			});
			return;
		}

		var action = 'action=flow';
		// 處理 [ {String}API_URL, {String}title or {Object}page_data ]
		if (Array.isArray(title)) {
			action = [ title[0], action ];
			title = title[1];
		} else if (options[KEY_SESSION]) {
			action = [ options[KEY_SESSION].API_URL, action ];
		}

		if (wiki_API.is_page_data(title))
			title = title.title;
		// assert: typeof title === 'string' or title is invalid.
		if (title.length > 260) {
			// [nttopic] 話題標題已限制在 260 位元組內。
			// 自動評論與摘要的長度限制是260個字符。需要小心任何超出上述限定的東西將被裁剪掉。
			// 260 characters
			// https://github.com/wikimedia/mediawiki-extensions-Flow/blob/master/includes/Model/PostRevision.php
			// const MAX_TOPIC_LENGTH = 260;
			// https://github.com/wikimedia/mediawiki-extensions-Flow/blob/master/i18n/zh-hant.json
			library_namespace
					.warn('edit_topic: Title is too long and will be truncated: ['
							+ error.code + ']');
			title = title.slice(0, 260);
		}

		// default parameters
		var _options = {
			// notification_name : 'flow',
			submodule : 'new-topic',
			page : title,
			nttopic : topic,
			ntcontent : text,
			ntformat : 'wikitext'
		};

		edit_topic.copy_keys.forEach(function(key) {
			if (options[key])
				_options[key] = options[key];
		});

		// the token should be sent as the last parameter.
		_options.token = library_namespace.is_Object(token) ? token.csrftoken
				: token;

		wiki_API.query(action, typeof callback === 'function'
		//
		&& function(data) {
			if (library_namespace.is_debug(2)
			// .show_value() @ interact.DOM, application.debug
			&& library_namespace.show_value)
				library_namespace.show_value(data, 'edit_topic: data');

			var error = data && data.error;
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.error('edit_topic: ['
				//
				+ error.code + '] ' + error.info);
			} else if (!(data = data.flow)
			//
			|| !(data = data['new-topic']) || data.status !== 'ok') {
				// data = { flow: { 'new-topic': { status: 'ok',
				// workflow: '', committed: {} } } }
				error = 'edit_topic: Bad status ['
				//
				+ (data && data.status) + ']';
				library_namespace.error(error);
			}

			if (typeof callback === 'function') {
				// title.title === wiki_API.title_of(title)
				callback(title.title, error, data);
			}
		}, _options, options);
	}

	/** {Array}欲 copy 至 Flow edit parameters 之 keys。 */
	edit_topic.copy_keys = 'summary|bot|redirect|nocreate'.split(',');

	// ------------------------------------------------------------------------

	// export 導出.

	// CeL.wiki.Flow.*
	Object.assign(Flow_info, {
		is_Flow : is_Flow,
		page : Flow_page,
		edit : edit_topic
	});

	return Flow_info;
}
