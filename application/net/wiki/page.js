/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): page, revisions
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
	name : 'application.net.wiki.page',

	require : 'data.native.'
	// CeL.data.fit_filter()
	+ '|data.'
	// CeL.date.String_to_Date(), Julian_day(), .to_millisecond(): CeL.data.date
	+ '|data.date.'
	// for library_namespace.directory_exists
	+ '|application.storage.'
	// for library_namespace.get_URL
	+ '|application.net.Ajax.' + '|application.net.wiki.'
	// load MediaWiki module basic functions
	+ '|application.net.wiki.namespace.'
	// for wiki_API.estimated_message()
	// + '|application.net.wiki.task.'
	//
	+ '|application.net.wiki.query.|application.net.wiki.Flow.',

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

	var
	/** node.js file system module */
	node_fs = library_namespace.platform.nodejs && require('fs');

	var
	/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
	NOT_FOUND = ''.indexOf('_');

	var gettext = library_namespace.cache_gettext(function(_) {
		gettext = _;
	});

	// ------------------------------------------------------------------------

	// wiki.page() 範例。
	if (false) {
		CeL.wiki.page('史記', function(page_data) {
			CeL.show_value(page_data);
		});

		wiki.page('巴黎協議 (消歧義)', {
			query_props : 'pageprops'
		});
		// wiki.last_page

		// for "Date of page creation" 頁面建立日期 @ Edit history 編輯歷史 @ 頁面資訊
		// &action=info
		wiki.page('巴黎協議', function(page_data) {
			// e.g., '2015-12-17T12:10:18.000Z'
			console.log(CeL.wiki.content_of.edit_time(page_data));
		}, {
			rvdir : 'newer',
			rvprop : 'timestamp',
			rvlimit : 1
		});

		wiki.page('巴黎協議', function(page_data) {
			// {Date}page_data.creation_Date
			console.log(page_data);
		}, {
			get_creation_Date : true
		});

		// for many pages, e.g., more than 200, please use:
		wiki.work({
			// redirects : 1,
			each : for_each_page_data,
			last : last_operation,
			no_edit : true,
			page_options : {
				// multi : 'keep index',
				// converttitles : 1,
				redirects : 1
			}
		}, page_list);

		// 組合以取得資訊。
		wiki.page(title, function(page_data) {
			console.log(page_data);
		}, {
			prop : 'revisions|info',
			// rvprop : 'ids|timestamp',
			// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Binfo
			// https://www.mediawiki.org/wiki/API:Info
			additional_query : 'inprop=talkid|subjectid'
					+ '|preload|displaytitle|varianttitles'
		});

		// 組合以取得資訊。
		wiki.page(title, function(page_data) {
			console.log(page_data);
			if ('read' in page_data.actions)
				console.log('readable');
		}, {
			prop : 'info',
			// https://www.mediawiki.org/wiki/API:Info
			additional_query : 'inprop=intestactions&intestactions=read'
		// + '&intestactionsdetail=full'
		});

		// Get all summaries <del>and diffs</del>
		wiki.page('Heed (cat)', function(page_data) {
			console.log(page_data);
		}, {
			rvprop : 'ids|timestamp|comment',
			rvlimit : 'max'
		});
	}

	// assert: !!KEY_KEEP_INDEX === true
	var KEY_KEEP_INDEX = 'keep index',
	// assert: !!KEY_KEEP_ORDER === true
	KEY_KEEP_ORDER = 'keep order';

	// https://www.mediawiki.org/wiki/API:Query#Query_modules
	function setup_query_modules(title, callback, options) {
		var session = wiki_API.session_of_options(options);
		// console.trace(session.API_parameters.query);
		wiki_API_page.query_modules = [];
		session.API_parameters.query.parameter_Map
		// Should be [ 'prop', 'list', 'meta', ... ]
		.forEach(function(parameters, key) {
			if (parameters.limit && parameters.submodules)
				wiki_API_page.query_modules.push(key);
		});
		library_namespace.info([
		//
		'setup_query_modules: ' + wiki_API.site_name(session) + ': ', {
			T : [
			// gettext_config:{"id":"found-$2-query-modules-$1"}
			'Found %2 query {{PLURAL:%2|module|modules}}: %1',
			// gettext_config:{"id":"Comma-separator"}
			wiki_API_page.query_modules.join(gettext('Comma-separator')),
			//
			wiki_API_page.query_modules.length ]
		} ]);

		wiki_API_page.apply(this, arguments);
	}

	// ----------------------------------------------------

	function set_invalid_page(query_result_buffer, query_result, value) {
		if (!(query_result_buffer.next_invalid_page < 0)) {
			// invalid page id starts from -1
			query_result_buffer.next_invalid_page = -1;
		}

		while (query_result_buffer.next_invalid_page in query_result.pages)
			query_result_buffer.next_invalid_page--;
		// assert: 之前已經有無效頁面存在，因此 .next_invalid_page < -1

		// console.trace(query_result_buffer.next_invalid_page, value);
		query_result.pages[query_result_buffer.next_invalid_page--] = value;
	}

	// merge_query_results()
	function combine_query_results(query_result_buffer) {
		var query_result;
		// assert: Array.isArray(query_result_buffer)
		while (query_result_buffer.length > 0) {
			var this_query_result = query_result_buffer.shift();
			if (!query_result) {
				query_result = this_query_result;
				continue;
			}

			// assert: {Object}query_result
			for ( var property_name in this_query_result) {
				var value = this_query_result[property_name];
				if (!(property_name in query_result)) {
					query_result[property_name] = value;
					continue;
				}

				if (typeof value !== 'object') {
					query_result.error = new Error(
							'combine_query_results: 獲得了 {' + typeof value
									+ '}，非 {Object} 的資料!');
					return query_result;
				}

				if (Array.isArray(value)) {
					if (!query_result[property_name]) {
						query_result.error = new Error(
								'combine_query_results: 資料型態從' + typeof value
										+ '}轉成了 Array!');
						return query_result;
					}
					query_result[property_name].append(value);
					continue;
				}

				for ( var key in value) {
					// Object.assign(query_result[property_name], value);
					if (key in query_result[property_name]) {
						// console.trace(query_result);
						// console.trace(this_query_result);
						if (property_name === 'pages' && key < 0) {
							// 無效的頁面可以直接換個id填入。
							set_invalid_page(query_result_buffer, query_result,
									value[key]);
							continue;
						}

						if (JSON.stringify(query_result[property_name][key]) !== JSON
								.stringify(value[key])) {
							library_namespace.warn('combine_query_results: '
									+ '以新的資料覆蓋舊的 query.' + property_name + '['
									+ key + ']');
							console.trace(query_result[property_name][key],
									'→', value[key]);
						}
					}
					query_result[property_name][key] = value[key];
				}
			}
		}

		return query_result;
	}

	// ----------------------------------------------------

	/**
	 * 讀取頁面內容，取得頁面源碼。可一次處理多個標題。
	 * 
	 * 前文有 wiki.page() 範例。
	 * 
	 * 注意: 用太多 CeL.wiki.page() 並行處理，會造成 error.code "EMFILE"。
	 * 
	 * TODO:
	 * https://www.mediawiki.org/w/api.php?action=help&modules=expandtemplates
	 * or https://www.mediawiki.org/w/api.php?action=help&modules=parse
	 * 
	 * @example <code>

	// 前文有 wiki.page() 範例。

	</code>
	 * 
	 * @param {String|Array}title
	 *            title or [ {String}API_URL, {String}title or {Object}page_data ]
	 * @param {Function}[callback]
	 *            回調函數。 callback(page_data, error) { page_data.title; var
	 *            content = CeL.wiki.content_of(page_data); }
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @see https://www.mediawiki.org/w/api.php?action=help&modules=query%2Brevisions
	 */
	function wiki_API_page(title, callback, options) {
		if (wiki_API.need_get_API_parameters('query+revisions', options,
				wiki_API_page, arguments)) {
			return;
		}
		var action = {
			action : 'query'
		};
		if (wiki_API.need_get_API_parameters(action, options,
				setup_query_modules, arguments)) {
			return;
		}

		if (typeof callback === 'object' && options === undefined) {
			// shift arguments
			options = callback;
			callback = undefined;
		}

		// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
		options = library_namespace.new_options(options);

		if (false && library_namespace.is_Set(title)) {
			title = Array.from(title);
		}

		// console.log('title: ' + JSON.stringify(title));
		if (options.get_creation_Date) {
			// 警告:僅適用於單一頁面。
			wiki_API_page(title, function(page_data, error) {
				if (error || !wiki_API.content_of.page_exists(page_data)) {
					// console.trace('error? 此頁面不存在/已刪除。');
					callback(page_data, error);
					return;
				}

				// e.g., '2015-12-17T12:10:18.000Z'
				// page_data.revisions[0].timestamp;

				page_data.creation_Date
				// CeL.wiki.content_of.edit_time(page_data)
				= wiki_API.content_of.edit_time(page_data);
				if (typeof options.get_creation_Date === 'function') {
					options.get_creation_Date(page_data.creation_Date,
							page_data);
				}
				if (false) {
					console.log(page_data.creation_Date.format('%Y/%m/%d'));
				}

				delete options.get_creation_Date;
				// 去掉僅有timestamp，由舊至新的.revisions。
				delete page_data.revisions;
				// 若有需要順便取得頁面內容，需要手動設定如:
				// {get_creation_Date:true,prop:'revisions'}
				if (('query_props' in options) || ('prop' in options)) {
					wiki_API_page(title, function(_page_data, error) {
						// console.trace(title);
						callback(Object.assign(page_data, _page_data), error);
					}, options);
				} else {
					// console.trace(title);
					callback(page_data);
				}

			}, {
				rvdir : 'newer',
				rvprop : 'timestamp',
				rvlimit : 1
			});
			return;
		}

		if (options.query_props) {
			var query_props = options.query_props, page_data,
			//
			get_properties = function(page) {
				if (page) {
					if (page_data)
						Object.assign(page_data, page);
					else
						page_data = page;
				}
				var prop;
				while (query_props.length > 0
				//
				&& !(prop = query_props.shift()))
					;

				if (!prop || page_data
				//
				&& (('missing' in page_data) || ('invalid' in page_data))) {
					// 此頁面不存在/已刪除。
					callback(page_data);
				} else {
					library_namespace.debug('Get property: [' + prop + ']', 1,
							'wiki_API_page');
					options.prop = prop;
					wiki_API_page(title, get_properties, options);
				}
			};

			delete options.query_props;
			if (typeof query_props === 'string') {
				query_props = query_props.split('|');
			}
			if (Array.isArray(query_props)) {
				if (!options.no_content)
					query_props.push('revisions');
				get_properties();
			} else {
				library_namespace.error([ 'wiki_API_page: ', {
					// gettext_config:{"id":"invalid-parameter-$1"}
					T : [ 'Invalid parameter: %1', '.query_props' ]
				} ]);
				throw new Error('wiki_API_page: '
				// gettext_config:{"id":"invalid-parameter-$1"}
				+ gettext('Invalid parameter: %1', '.query_props'));
			}
			return;
		}

		// console.trace(title, arguments);

		// modules=query&titles= overwrite multi=false
		options.multi_param = true;
		action = normalize_title_parameter(title, options);
		// console.trace(action);
		if (!action) {
			library_namespace.error([ 'wiki_API_page: ', {
				// gettext_config:{"id":"invalid-title-$1"}
				T : [ 'Invalid title: %1', wiki_API.title_link_of(title) ]
			} ]);
			// console.trace(title);
			callback(undefined, new Error(gettext(
			// gettext_config:{"id":"invalid-title-$1"}
			'Invalid title: %1', wiki_API.title_link_of(title))));
			return;
			throw new Error('wiki_API_page: '
			// gettext_config:{"id":"invalid-title-$1"}
			+ gettext('Invalid title: %1', wiki_API.title_link_of(title)));
		}

		// console.trace(action);
		// console.trace(options);

		if (!wiki_API_page.query_modules
		//
		|| !wiki_API_page.query_modules.some(function(module) {
			return module in options;
		})) {
			options.prop = 'revisions';
		}

		var get_content = options.prop
		// {String|Array}
		&& options.prop.includes('revisions');
		if (get_content) {
			var session = wiki_API.session_of_options(options);
			// 2019 API:
			// https://www.mediawiki.org/wiki/Manual:Slot
			// https://www.mediawiki.org/wiki/API:Revisions
			// 檢測有沒有此項參數。
			if (!session || session.API_parameters['query+revisions'].slots) {
				action[1].rvslots = options.rvslots || 'main';
			}

			// 處理數目限制 limit。單一頁面才能取得多 revisions。多頁面(≤50)只能取得單一 revision。
			// https://www.mediawiki.org/w/api.php?action=help&modules=query
			// titles/pageids: Maximum number of values is 50 (500 for bots).
			if ('rvlimit' in options) {
				if (options.rvlimit > 0 || options.rvlimit === 'max')
					action[1].rvlimit = options.rvlimit;
			} else if (!action[1].titles && !action[1].pageids) {
				// assert: action[1].title || action[1].pageid
				// || action[1].pageid === 0
				// default: 僅取得單一 revision。
				action[1].rvlimit = 1;
			}

			// Which properties to get for each revision
			get_content = Array.isArray(options.rvprop)
			//
			&& options.rvprop.join('|')
			//
			|| options.rvprop || wiki_API_page.default_rvprop;

			action[1].rvprop = get_content;

			get_content = get_content.includes('content');
		}

		// 自動搜尋/轉換繁簡標題。
		if (!('converttitles' in options)) {
			options.converttitles = wiki_API.site_name(options, {
				get_all_properties : true
			}).language;
			if (!wiki_API_page.auto_converttitles
					.includes(options.converttitles)) {
				delete options.converttitles;
			} else {
				options.converttitles = 1;
			}
		}

		if (typeof options.prop === 'string')
			options.prop = options.prop.split(/[,;|]/);

		// Which properties to get for the queried pages
		// 輸入 prop:'' 或再加上 redirects:1 可以僅僅確認頁面是否存在，以及頁面的正規標題。
		if (Array.isArray(options.prop)) {
			options.prop = options.prop.map(function(submodule) {
				return submodule && String(submodule).trim();
			}).filter(function(submodule) {
				return !!submodule;
			});
			var _arguments = arguments;
			if (options.prop.some(function(submodule) {
				return wiki_API.need_get_API_parameters('query+' + submodule,
						options, wiki_API_page, _arguments);
			})) {
				return;
			}

			options.prop = options.prop.join('|');
		}

		for ( var parameter in {
			// e.g., rvdir=newer
			// Get first revisions
			rvdir : true,

			rvcontinue : true,

			converttitles : true,
			// e.g., prop=info|revisions
			// e.g., prop=pageprops|revisions
			// 沒 .pageprops 的似乎大多是沒有 Wikidata entity 的？
			prop : true
		}) {
			if (parameter in options) {
				action[1][parameter] = options[parameter];
			}
		}

		// options.handle_continue_response = true;
		if (false && library_namespace.is_Object(options.page_options_continue)) {
			Object.assign(action[1], options.page_options_continue);
		}

		// console.trace(action);
		set_parameters(action, options);
		// console.trace(action);

		action[1].action = 'query';
		action[1] = wiki_API.extract_parameters(options, action[1], true);
		// console.trace([ options, action ]);

		// TODO:
		// wiki_API.extract_parameters(options, action, true);

		library_namespace.debug('get url token: ' + action, 5, 'wiki_API_page');
		// console.trace([ action, options ]);

		var post_data = library_namespace.Search_parameters();
		// 將<s>過長的</s>標題列表改至 POST，預防 "414 Request-URI Too Long"。
		// https://github.com/kanasimi/wikibot/issues/32
		// 不同 server 可能有不同 GET 請求長度限制。不如直接改成 POST。
		if (Array.isArray(action[1].pageids)) {
			post_data.pageids = action[1].pageids;
			delete action[1].pageids;
		}
		if (Array.isArray(action[1].titles)) {
			post_data.titles = action[1].titles;
			delete action[1].titles;
		}

		// console.trace(wiki_API.session_of_options(options));
		// console.trace(action);
		wiki_API.query(action, typeof callback === 'function'
		//
		&& function process_page(data) {
			// console.trace('Get page: ' + title);
			if (library_namespace.is_debug(2)
			// .show_value() @ interact.DOM, application.debug
			&& library_namespace.show_value) {
				library_namespace.show_value(data, 'wiki_API_page: data');
			}

			var error = data && data.error;
			// 檢查 MediaWiki 伺服器是否回應錯誤資訊。
			if (error) {
				library_namespace.error('wiki_API_page: ['
				//
				+ error.code + '] ' + error.info);
				/**
				 * e.g., Too many values supplied for parameter 'pageids': the
				 * limit is 50
				 */
				if (data.warnings && data.warnings.query
				//
				&& data.warnings.query['*']) {
					library_namespace.warn(
					//
					'wiki_API_page: ' + data.warnings.query['*']);
				}
				if (error.code === 'toomanyvalues' && error.limit > 0
				// 嘗試自動將所要求的 query 切成小片。
				// TODO: 此功能應放置於 wiki_API.query() 中。
				// TODO: 將 title 切成 slice，重新 request。
				&& options.try_cut_slice && Array.isArray(title)
				// 2: 避免 is_api_and_title(title)
				&& title.length > 2) {
					var session = wiki_API.session_of_options(options);
					if (session && !(session.slow_query_limit < error.limit)) {
						library_namespace.warn([ 'wiki_API_page: ', {
							// gettext_config:{"id":"reduce-the-maximum-number-of-pages-per-fetch-to-a-maximum-of-$1-pages"}
							T : [ '調降取得頁面的上限，改成每次最多 %1 個頁面。', error.limit ]
						} ]);
						// https://www.mediawiki.org/w/api.php
						// slow queries: 500; fast queries: 5000
						// The limits for slow queries also apply to multivalue
						// parameters.
						session.slow_query_limit = error.limit;
					}

					options.multi = true;
					options.slice_size = error.limit;
					// console.trace(title);
					wiki_API_page(title, callback, options);
					return;
				}
				callback(data, error);
				return;
			}

			if (false && data.warnings && data.warnings.result
			/**
			 * <code>
			// e.g., 2021/5/23:
			{
			  continue: { rvcontinue: '74756|83604874', continue: '||' },
			  warnings: {
			    result: {
			      '*': 'This result was truncated because it would otherwise be larger than the limit of 12,582,912 bytes.'
			    }
			  },
			  query: {
			    pages: {
			      '509': [Object],
			      ...
			    }
			  }
			}
			</code>
			 * limit: 12 MB. 此時應該有 .continue。
			 */
			&& data.warnings.result['*']) {
				if (false && data.warnings.result['*'].includes('truncated'))
					data.truncated = true;
				library_namespace.warn(
				//
				'wiki_API_page: ' + data.warnings.result['*']);
			}

			if (!data || !data.query
			// assert: data.cached_response && data.query.pages
			|| !data.query.pages && data.query.redirects
			/**
			 * <code>
			// e.g.,
			{
			  batchcomplete: '',
			  warnings: { info: { '*': 'Unrecognized value for parameter "inprop": info' } },
			  query: { interwiki: [ [Object], [Object], [Object] ] }
			}
			</code>
			 */
			&& !data.query.interwiki) {
				// e.g., 'wiki_API_page: Unknown response:
				// [{"batchcomplete":""}]'
				library_namespace.warn([ 'wiki_API_page: ', {
					// gettext_config:{"id":"unknown-api-response-$1"}
					T : [ 'Unknown API response: %1', (typeof data === 'object'
					//
					&& typeof JSON !== 'undefined'
					//
					? JSON.stringify(data) : data) ]
				} ]);
				// console.trace(data);
				// library_namespace.set_debug(6);
				if (library_namespace.is_debug()
				// .show_value() @ interact.DOM, application.debug
				&& library_namespace.show_value)
					library_namespace.show_value(data);
				callback(undefined, 'Unknown response');
				return;
			}

			if (options.titles_left) {
				// console.trace(data);

				// e.g., Template:Eulipotyphla @
				// 20230418.Fix_redirected_wikilinks_of_templates.js

				if (!options.query_result_buffer)
					options.query_result_buffer = [];
				options.query_result_buffer.push(data.query);
				if (false) {
					console.trace('get next page slices ('
					//
					+ options.slice_size + '): ' + options.titles_left);
				}
				wiki_API_page(null, callback, options);
				return;
			}

			if (Array.isArray(options.query_result_buffer)) {
				options.query_result_buffer.push(data.query);
				data.query
				//
				= combine_query_results(options.query_result_buffer);
				if (data.query.error) {
					callback(undefined, data.query.error);
					return;
				}
			}

			// --------------------------------------------

			var page_list = [],
			// index_of_title[title] = index in page_list
			index_of_title = page_list.index_of_title = Object.create(null),
			// 標題→頁面資訊映射。 title_data_map[title] = page_data
			title_data_map = page_list.title_data_map = Object.create(null),
			// library_namespace.storage.write_file()
			page_cache_prefix = library_namespace.write_file
			//
			&& options.page_cache_prefix;

			var continue_id;
			if ('continue' in data) {
				// console.trace(data['continue']);
				// page_list['continue'] = data['continue'];
				if (data['continue']
				//
				&& typeof data['continue'].rvcontinue === 'string'
				//
				&& (continue_id = data['continue'].rvcontinue
				// assert: page_list['continue'].rvcontinue = 'date|oldid'。
				.match(/\|([1-9]\d*)$/))) {
					continue_id = Math.floor(continue_id[1]);
				}
				if (false && data.truncated)
					page_list.truncated = true;
			}

			// ------------------------

			// https://zh.wikipedia.org/w/api.php?action=query&prop=info&converttitles=zh&titles=A&redirects=&maxlag=5&format=json&utf8=1
			// 2020/10/9: for [[A]]￫[[B]]￫[[A]], we will get
			// {"batchcomplete":"","query":{"redirects":[{"from":"A","to":"B"},{"from":"B","to":"A"}]}}

			// 找尋順序應為：
			// query.normalized[原標題]=正規化後的標題/頁面名稱
			// data.query.converted[正規化後的標題||原標題]=繁簡轉換後的標題
			// data.query.redirects[繁簡轉換後的標題||正規化後的標題||原標題]=重定向後的標題=必然存在的正規標題

			var redirect_from;
			if (data.query.redirects) {
				page_list.redirects = data.query.redirects;
				if (Array.isArray(data.query.redirects)) {
					page_list.redirect_from
					// 記錄經過重導向的標題。
					= redirect_from = Object.create(null);
					page_list.redirects.map = Object.create(null);
					data.query.redirects.forEach(function(item) {
						redirect_from[item.to] = item.from;
						page_list.redirects.map[item.from] = item;
					});

					if (!data.query.pages) {
						data.query.pages = {
							title : data.query.redirects[0].from
						};
						if (data.query.pages.title ===
						//
						redirect_from[data.query.redirects[0].to]) {
							library_namespace.warn([ 'wiki_API_page: ', {
								// gettext_config:{"id":"circular-redirect-$1↔$2"}
								T : [ 'Circular redirect: %1↔%2',
								//
								wiki_API.title_link_of(
								//
								data.query.pages.title),
								//
								wiki_API.title_link_of(
								//
								data.query.redirects[0].to) ]
							} ]);
							data.query.pages.redirect_loop = true;
						}
						data.query.pages = {
							// [wiki_API.run_SQL.KEY_additional_row_conditions]
							'' : data.query.pages
						};
					}
				}
			}

			var convert_from;
			if (data.query.converted) {
				page_list.converted = data.query.converted;
				if (Array.isArray(data.query.converted)) {
					page_list.convert_from = convert_from
					// 記錄經過轉換的標題。
					= Object.create(null);
					page_list.converted.map = Object.create(null);
					data.query.converted.forEach(function(item) {
						convert_from[item.to] = item.from;
						page_list.converted.map[item.from] = item;
						if (page_list.redirects
						//
						&& page_list.redirects.map[item.to]) {
							page_list.redirects.map[item.from]
							//
							= page_list.redirects.map[item.to];
						}
					});
				}
			}

			if (data.query.normalized) {
				page_list.normalized = data.query.normalized;
				// console.log(data.query.normalized);
				page_list.convert_from = convert_from
				// 記錄經過轉換的標題。
				|| (convert_from = Object.create(null));
				page_list.normalized.map = Object.create(null);
				data.query.normalized.forEach(function(item) {
					convert_from[item.to] = item.from;
					page_list.normalized.map[item.from] = item;
					if (page_list.redirects
					//
					&& page_list.redirects.map[item.to]) {
						page_list.redirects.map[item.from]
						//
						= page_list.redirects.map[item.to];
					}
				});
			}

			if (data.query.interwiki) {
				page_list.interwiki = data.query.interwiki;
				if (!data.query.pages)
					data.query.pages = Object.create(null);
			}

			// ------------------------

			var pages = data.query.pages;
			// console.log(options);
			var need_warn = /* !options.no_warning && */!options.allow_missing
			// 其他 .prop 本來就不會有內容。
			&& get_content;

			for ( var pageid in pages) {
				// 對於 invalid title，pageid 會從 -1 開始排，-2, -3, ...。
				var page_data = pages[pageid];
				if (!wiki_API.content_of.has_content(page_data)) {

					if (continue_id && continue_id === page_data.pageid) {
						// 找到了 page_list.continue 所指之 index。
						// effect length
						page_list.OK_length = page_list.length;
						// 當過了 continue_id 之後，表示已經被截斷，則不再警告。
						need_warn = false;
					}

					if (need_warn) {
						/**
						 * <code>
						{"title":"","invalidreason":"The requested page title is empty or contains only the name of a namespace.","invalid":""}
						</code>
						 */
						// console.trace(page_data);
						library_namespace.warn([ 'wiki_API_page: ', {
							T : [ 'invalid' in page_data
							// gettext_config:{"id":"invalid-title-$1"}
							? 'Invalid title: %1'
							// 此頁面不存在/已刪除。Page does not exist. Deleted?
							: 'missing' in page_data
							// gettext_config:{"id":"does-not-exist"}
							? 'Does not exist: %1'
							// gettext_config:{"id":"no-content"}
							: 'No content: %1',
							//
							(page_data.title
							//
							? wiki_API.title_link_of(page_data)
							//
							: 'id ' + page_data.pageid)
							//
							+ (page_data.invalidreason
							//
							? '. ' + page_data.invalidreason : '') ]
						} ]);
					}

				} else if (page_cache_prefix) {
					library_namespace.write_file(page_cache_prefix
					//
					+ page_data.title + '.json',
					/**
					 * 寫入cache。
					 * 
					 * 2016/10/28 21:44:8 Node.js v7.0.0 <code>
					DeprecationWarning: Calling an asynchronous function without callback is deprecated.
					</code>
					 */
					JSON.stringify(pages), wiki_API.encoding, function() {
						// 因為此動作一般說來不會影響到後續操作，因此採用同時執行。
						library_namespace.debug(
						// gettext_config:{"id":"the-cache-file-is-saved"}
						'The cache file is saved.', 1, 'wiki_API_page');
					});
				}

				title_data_map[page_data.title] = page_data;

				if (redirect_from && redirect_from[page_data.title]
				//
				&& !page_data.redirect_loop) {
					page_data.original_title = page_data.redirect_from
					// .from_title, .redirect_from_title
					= redirect_from[page_data.title];
					// e.g., "研究生教育" redirects to → "學士後"
					// redirects to → "深造文憑"
					while (redirect_from[page_data.original_title]) {
						page_data.original_title
						//
						= redirect_from[page_data.original_title];
					}
				}
				// 可以利用 page_data.convert_from
				// 來判別標題是否已經過繁簡轉換與 "_" → " " 轉換。
				if (convert_from) {
					if (convert_from[page_data.title]) {
						page_data.convert_from
						// .from_title, .convert_from_title
						= convert_from[page_data.title];
						// 注意: 這邊 page_data.original_title
						// 可能已設定為 redirect_from[page_data.title]
						if (!page_data.original_title
						// 通常 wiki 中，redirect_from 會比 convert_from 晚處理，
						// 照理來說不應該會到 !convert_from[page_data.original_title] 這邊，
						// 致使重設 `page_data.original_title`？
						|| !convert_from[page_data.original_title]) {
							page_data.original_title = page_data.convert_from;
						}
					}
					// e.g., "人民法院_(消歧义)" converted → "人民法院 (消歧义)"
					// converted → "人民法院 (消歧義)" redirects → "人民法院"
					while (convert_from[page_data.original_title]) {
						page_data.original_title
						// .from_title, .convert_from_title
						= convert_from[page_data.original_title];
					}
				}
				index_of_title[page_data.title] = page_list.length;
				// 注意: 這可能註冊多種不同的標題。
				if (page_data.original_title) {
					// 對於 invalid title，.original_title 可能是 undefined。
					title_data_map[page_data.original_title] = page_data;
				}
				page_list.push(page_data);
			}

			if (page_list.redirects) {
				page_list.redirects.forEach(function(data) {
					var to = data.to;
					while (to in page_list.redirects.map) {
						// e.g., 美國法典第10卷: [美國法典第十編]→[美國法典第10編] @ [[Template:US
						// military navbox']] @
						// 20230418.Fix_redirected_wikilinks_of_templates.js
						library_namespace.log('wiki_API_page: '
						//
						+ data.from + ': [' + to + ']→['
						//
						+ page_list.redirects.map[to].to + ']');
						var next__to = page_list.redirects.map[to].to;
						if (to === next__to) {
							// e.g., [[愛愛內含光]] 2024/2/12 自己連到自己
							break;
						}
						to = next__to;
					}
					if (!title_data_map[to]) {
						// console.trace(page_list);
						error = error
						//
						|| new Error('No redirects title data: ['
						//
						+ to + ']←[' + data.from + ']');
						return;
					}
					// 注意: 這可能註冊多種不同的標題。
					title_data_map[data.from] = title_data_map[to];
				});
			}
			if (page_list.converted) {
				page_list.converted.forEach(function(data) {
					if (!title_data_map[data.to]) {
						error = error
						//
						|| new Error('No converted title data: ['
						//
						+ data.to + ']←[' + data.from + ']');
						return;
					}
					// 注意: 這可能註冊多種不同的標題。
					title_data_map[data.from] = title_data_map[data.to];
				});
			}
			if (page_list.normalized) {
				page_list.normalized.forEach(function(data) {
					if (!title_data_map[data.to]) {
						// e.g., '#...' → ''
						if (!data.to || /^[^:]+:/.test(data.to)) {
							// e.g. [[commons:title]]
							return;
						}
						console.trace(pages);
						// console.trace(page_list);
						error = error
						//
						|| new Error('No normalized title data: ['
						//
						+ data.to + ']←[' + data.from + ']');
						return;
					}
					// 注意: 這可能註冊多種不同的標題。
					title_data_map[data.from] = title_data_map[data.to];
				});
			}

			if (data.warnings && data.warnings.query
			//
			&& typeof data.warnings.query['*'] === 'string') {
				if (need_warn) {
					library_namespace.warn(
					//
					'wiki_API_page: ' + data.warnings.query['*']);
					// console.log(data);
				}
				/**
				 * 2016/6/27 22:23:25 修正: 處理當非 bot 索求過多頁面時之回傳。<br />
				 * e.g., <code>
				 * { batchcomplete: '', warnings: { query: { '*': 'Too many values supplied for parameter \'pageids\': the limit is 50' } },
				 * query: { pages: { '0000': [Object],... '0000': [Object] } } }
				 * </code>
				 */
				if (data.warnings.query['*'].includes('the limit is ')) {
					// TODO: 注記此時真正取得之頁面數。
					// page_list.OK_length = page_list.length;
					page_list.truncated = true;
				}
			}

			// options.multi: 明確指定即使只取得單頁面，依舊回傳 Array。
			if (!options.multi) {
				if (page_list.length <= 1) {
					// e.g., pages: { '1850031': [Object] }
					library_namespace.debug('只取得單頁面 '
					//
					+ wiki_API.title_link_of(page_list)
					//
					+ '，將回傳此頁面內容，而非 Array。', 2, 'wiki_API_page');
					page_list = page_list[0];
					// 警告: `page_list`可能是 undefined。
					if (is_api_and_title(title, true)) {
						title = title[1];
					}
					if (!options.do_not_import_original_page_data
					//
					&& wiki_API.is_page_data(title)) {
						// 去除掉可能造成誤判的錯誤標記 'missing'。
						// 即使真有錯誤，也由page_list提供即可。
						if ('missing' in title) {
							delete title.missing;
							// 去掉該由page_list提供的資料。因為下次呼叫時可能會被利用到。例如之前找不到頁面，.pageid被設成-1，下次呼叫被利用到就會出問題。
							// ** 照理說這兩者都必定會出現在page_list。
							// delete title.pageid;
							// delete title.title;
						}
						// import data to original page_data. 盡可能多保留資訊。
						page_list = Object.assign(title, page_list);
					}
					if (page_list && get_content
					//
					&& (page_list.is_Flow = wiki_API.Flow.is_Flow(page_list))
					// e.g., { flow_view : 'header' }
					&& options.flow_view) {
						// Flow_page()
						wiki_API.Flow.page(page_list, callback, options);
						return;
					}

				} else {
					library_namespace.debug('Get ' + page_list.length
					//
					+ ' page(s)! The pages will all '
					//
					+ 'passed to the callback as Array!', 2, 'wiki_API_page');
				}

			} else if ((options.multi === KEY_KEEP_INDEX
			// options.keep_order
			|| options.multi === KEY_KEEP_ORDER)
			//
			&& is_api_and_title(title, true)
			//
			&& Array.isArray(title[1]) && title[1].length >= 2) {
				var order_hash = title[1].map(function(page_data) {
					return options.is_id ? page_data.pageid
					//
					|| page_data : wiki_API.title_of(page_data);
				}).to_hash(), ordered_list = [];
				// console.log(title[1].join('|'));
				// console.log(order_hash);

				if (false) {
					// another method
					// re-sort page list
					page_list.sort(function(page_data_1, page_data_2) {
						return order_hash[page_data_1.original_title
						//
						|| page_data_1.title]
						//
						- order_hash[page_data_2.original_title
						//
						|| page_data_2.title];
					});
					console.log(page_list.map(function(page_data) {
						return page_data.original_title
						//
						|| page_data.title;
					}).join('|'));
					throw new Error('Reorder the list of pages');
				}

				// 維持頁面的順序與輸入的相同。
				page_list.forEach(function(page_data) {
					var original_title = page_data.original_title
					//
					|| page_data.title;
					if (original_title in order_hash) {
						ordered_list[order_hash[original_title]] = page_data;
					} else {
						console.log(order_hash);
						console.log(original_title);
						console.log('-'.repeat(70));
						console.log('Page list:');
						console.log(title[1].map(function(page_data) {
							return wiki_API.title_of(page_data);
						}).join('\n'));
						console.log(page_data);
						throw new Error('wiki_API_page: 取得了未指定的頁面: '
						//
						+ wiki_API.title_link_of(original_title));
					}
				});
				// 緊湊化，去掉沒有設定到的頁面。
				if (options.multi === KEY_KEEP_ORDER) {
					ordered_list = ordered_list.filter(function(page_data) {
						return !!page_data;
					});
				}

				// copy attributes form original page_list
				[ 'OK_length', 'truncated', 'normalized',
				//
				'index_of_title', 'title_data_map',
				//
				'redirects', 'redirect_from', 'converted', 'convert_from' ]
				// 需要注意page_list可能帶有一些已經設定的屬性值，因此不能夠簡單的直接指派到另外一個值。
				.forEach(function(attribute_name) {
					if (attribute_name in page_list) {
						ordered_list[attribute_name]
						//
						= page_list[attribute_name];
					}
				});
				page_list = ordered_list;
			}

			// 警告: `page_list`可能是 undefined。

			if (page_list && options.save_response) {
				// 附帶原始回傳查詢資料。
				// save_data, query_data
				// assert: !('response' in page_list)
				page_list.response = data;
			}

			if (options.expandtemplates) {
				if (options.titles_left) {
					error = error
					//
					|| new Error('There are options.titles_left!');
				}

				// 需要expandtemplates的情況。
				if (!Array.isArray(page_list)) {
					// TODO: test
					var revision = wiki_API.content_of.revision(page_list);
					// 出錯時 revision 可能等於 undefined。
					if (!revision) {
						callback(page_list, error);
						return;
					}
					wiki_API_expandtemplates(
					//
					wiki_API.revision_content(revision), function() {
						callback(page_list, error);
					}, Object.assign({
						page : page_list,
						title : page_data.title,
						revid : revision.revid,
						includecomments : options.includecomments,

						session : options[KEY_SESSION]
					}, options.expandtemplates));
					return;
				}

				// TODO: test
				page_list.run_serial(function(run_next, page_data, index) {
					var revision = wiki_API.content_of.revision(page_data);
					wiki_API_expandtemplates(
					//
					wiki_API.revision_content(revision),
					//
					run_next, Object.assign({
						page : page_data,
						title : page_data.title,
						revid : revision && revision.revid,
						includecomments : options.includecomments,

						session : options[KEY_SESSION]
					}, options.expandtemplates));
				}, function() {
					callback(page_list, error);
				});
				return;
			}

			// 一般正常回傳。

			if (page_list) {
				if (false && page_list.title) {
					console.trace('Get page and callback: ' + page_list.title);
				}

				page_list.revisions_parameters = action[1];
			}

			if (library_namespace.is_debug(9)) {
				// console.trace(page_list);
				// console.trace(options);
			}

			// page 之 structure 將按照 wiki API 本身之 return！
			// page_data = {pageid,ns,title,revisions:[{timestamp,'*'}]}
			callback(page_list, error);

		}, post_data, options);
	}

	// default properties of revisions
	// ids, timestamp 是為了 wiki_API_edit.set_stamp 檢查編輯衝突用。
	wiki_API_page.default_rvprop = 'ids|timestamp|content';

	// @see https://www.mediawiki.org/w/api.php?action=help&modules=query
	wiki_API_page.auto_converttitles = 'zh,gan,iu,kk,ku,shi,sr,tg,uz'
			.split(',');

	// ------------------------------------------------------------------------

	/**
	 * 回溯看看是哪個 revision 增加/刪除了標的文字。
	 * 
	 * @param {String}title
	 *            page title
	 * @param to_search
	 *            filter / text to search.<br />
	 *            to_search(diff, revision, old_revision):<br />
	 *            `diff` 為從舊的版本 `old_revision` 改成 `revision` 時的差異。
	 * @param {Function}callback
	 *            回調函數。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 */
	function tracking_revisions(title, to_search, callback, options) {
		options = Object.assign({
			rvlimit : 20
		}, options, {
			save_response : true
		});

		if (options.search_diff && typeof to_search !== 'function') {
			throw new TypeError(
					'Only {Function}filter to search for .search_diff=true!');
		}

		function do_search(revision, old_revision) {
			var value = revision.revid ? wiki_API.revision_content(revision)
					: revision;

			if (!value)
				return;

			if (typeof to_search === 'string')
				return value.includes(to_search);

			if (options.search_diff)
				return to_search([ , value ], revision, old_revision);

			// return found;
			return library_namespace.fit_filter(to_search, value);
		}

		var session = wiki_API.session_of_options(options);
		var run_next_status = session && session.set_up_if_needed_run_next();
		var newer_revision, revision_count = 0;
		function search_revisions(page_data, error) {
			// console.trace(page_data, error);
			if (error) {
				callback(null, page_data, error);
				return;
			}

			var revision_index = 0, revisions = page_data.revisions;
			if (!newer_revision && revisions.length > 0) {
				newer_revision = revisions[revision_index++];
				newer_revision.lines = wiki_API
						.revision_content(newer_revision).split('\n');
				// console.trace([do_search(newer_revision),options]);
				if (!options.search_diff && !options.search_deleted) {
					var result = do_search(newer_revision);
					if (!result) {
						// 最新版本就已經不符合需求。
						callback(null, page_data);
						return;
					}
					if (library_namespace.is_thenable(result)) {
						result = result.then(function(result) {
							if (!result) {
								// 最新版本就已經不符合需求。
								callback(null, page_data);
								return;
							}
							search_next_revision();
						});
						if (session)
							session.check_and_run_next(run_next_status, result);
						// 直接跳出。之後會等 promise 出結果才繼續執行。
						return;
					}
				}
			}

			// console.log(revisions.length);
			search_next_revision();

			function search_next_revision() {
				// console.trace(revision_index + '/' + revisions.length);
				if (revision_index === revisions.length) {
					finish_search();
					return;
				}

				var this_revision = revisions[revision_index++];
				// MediaWiki using line-diff
				this_revision.lines = wiki_API.revision_content(this_revision)
						.split('\n');
				var diff_list;
				try {
					diff_list = newer_revision.diff_list
					//
					= library_namespace.LCS(this_revision.lines,
					//
					newer_revision.lines, {
						diff : true,
						// MediaWiki using line-diff
						line : true,
						treat_as_String : true
					});
				} catch (e) {
					// e.g., RangeError: Maximum call stack size exceeded @
					// backtrack()
					callback(null, page_data, e);
					return;
				}

				// console.trace(diff_list);

				var found, diff_index = 0;

				search_next_diff();

				function check_result(result) {
					if (library_namespace.is_thenable(result)) {
						result = result.then(check_result);
						if (session)
							session.check_and_run_next(run_next_status, result);
						// 直接跳出。之後會等 promise 出結果才繼續執行。
					} else {
						found = result;
						if (found)
							finish_search_revision();
						else
							search_next_diff();
					}
				}

				function search_next_diff() {
					// console.trace(diff_index + '/' + diff_list.length);
					var result = undefined;
					if (diff_index === diff_list.length) {
						if (options.revision_post_processor) {
							result = options
									.revision_post_processor(newer_revision);
						}
						if (library_namespace.is_thenable(result)) {
							result = result.then(finish_search_revision);
							if (session)
								session.check_and_run_next(run_next_status,
										result);
							// 直接跳出。之後會等 promise 出結果才繼續執行。
						} else {
							finish_search_revision();
						}
						// console.trace(result);
						// var session = wiki_API.session_of_options(options);
						// console.trace(session);
						// console.trace(session && session.actions);

						return;
					}

					var diff = diff_list[diff_index++];
					// console.trace(revision_index, diff_index, diff);
					if (options.search_diff) {
						result = to_search(diff, newer_revision, this_revision);
					} else {
						// var removed_text = diff[0], added_text = diff[1];
						result =
						// 警告：在 line_mode，"A \n"→"A\n" 的情況下，
						// "A" 會同時出現在增加與刪除的項目中，此時必須自行檢測排除。
						do_search(diff[options.search_deleted ? 0 : 1])
						//
						&& !do_search(diff[options.search_deleted ? 1 : 0]);
					}

					// console.trace(result);
					check_result(result);
				}

				function finish_search_revision(page_data, error) {
					delete newer_revision.lines;
					// console.trace([this_revision.revid,found,do_search(this_revision)])
					if (found) {
						delete this_revision.lines;
						// console.log(diff_list);
						callback(newer_revision, page_data);
						return;
					}
					newer_revision = this_revision;

					if (revision_index === revisions.length) {
						delete this_revision.lines;
					}
					search_next_revision();
				}
			}

			function finish_search() {
				revision_count += page_data.revisions;
				if (revision_count > options.limit) {
					// not found
					callback(null, page_data);
					return;
				}

				if (false) {
					// console.trace(page_data.response);
					var page_options_continue = page_data.response['continue'];
					// console.trace(page_options_continue);
					if (page_options_continue) {
						options.page_options_continue = page_options_continue;

						// console.trace(options);
						library_namespace.debug(
								'tracking_revisions: search next '
										+ options.rvlimit
										+ (options.limit > 0 ? '/'
												+ options.limit : '')
										+ ' revisions...', 2);
						get_pages();
						return;
					}
				} else {
					var rvcontinue = page_data.response['continue'];
					if (rvcontinue) {
						options.rvcontinue = rvcontinue.rvcontinue;

						// console.trace(options);
						library_namespace.debug(
								'tracking_revisions: search next '
										+ options.rvlimit
										+ (options.limit > 0 ? '/'
												+ options.limit : '')
										+ ' revisions...', 2);
						get_pages();
						return;
					}
				}

				// assert: 'batchcomplete' in page_data.response

				// if no response['continue'], append a null revision,
				// and do not search continued revisions.
				var result = !options.search_deleted
						&& do_search(newer_revision);
				if (library_namespace.is_thenable(result)) {
					result = result.then(do_callback);
					if (session)
						session.check_and_run_next(run_next_status, result);
					// 直接跳出。之後會等 promise 出結果才繼續執行。
				} else {
					do_callback(result);
				}

				function do_callback(result) {
					if (result) {
						callback(newer_revision, page_data);
					} else {
						// not found
						callback(null, page_data);
					}
				}
			}

		}

		function get_pages() {
			wiki_API.page(title, search_revisions, options);
		}

		get_pages();
	}

	wiki_API.tracking_revisions = tracking_revisions;

	// ------------------------------------------------------------------------

	// 強制更新快取/清除緩存並重新載入/重新整理/刷新頁面。
	// @see https://www.mediawiki.org/w/api.php?action=help&modules=purge
	// 極端做法：[[WP:NULL|Null edit]], re-edit the same contents
	wiki_API.purge = function(title, callback, options) {
		var action = normalize_title_parameter(title, options);
		if (!action) {
			throw new Error('wiki_API.purge: '
			// gettext_config:{"id":"invalid-title-$1"}
			+ gettext('Invalid title: %1', wiki_API.title_link_of(title)));
		}

		// POST_parameters
		var post_data = action[1];
		action[1] = {
			// forcelinkupdate : 1,
			// forcerecursivelinkupdate : 1,
			action : 'purge'
		};

		wiki_API.query(action, typeof callback === 'function'
		//
		&& function(data, error) {
			// copy from wiki_API.redirects_here()

			if (wiki_API.query.handle_error(data, error, callback)) {
				return;
			}

			// data:
			// {"batchcomplete":"","purge":[{"ns":0,"title":"Title","purged":""}]}

			if (!data || !data.purge) {
				library_namespace.warn([ 'wiki_API_purge: ', {
					// gettext_config:{"id":"unknown-api-response-$1"}
					T : [ 'Unknown API response: %1', (typeof data === 'object'
					//
					&& typeof JSON !== 'undefined'
					//
					? JSON.stringify(data) : data) ]
				} ]);
				if (library_namespace.is_debug()
				// .show_value() @ interact.DOM, application.debug
				&& library_namespace.show_value)
					library_namespace.show_value(data);
				callback(undefined, data);
				return;
			}

			var page_data_list = data.purge;
			// page_data_list: e.g., [{ns:4,title:'Meta:Sandbox',purged:''}]
			if (page_data_list.length < 2 && (!options || !options.multi)) {
				// 沒有特別設定的時候，回傳與輸入的形式相同。輸入單頁則回傳單頁。
				page_data_list = page_data_list[0];
			}

			// callback(page_data) or callback({Array}page_data_list)
			callback(page_data_list);
		}, post_data, options);
	};

	// ------------------------------------------------------------------------

	/**
	 * 取得頁面之重定向資料（重新導向至哪一頁）。
	 * 
	 * 注意: 重定向僅代表一種強烈的關聯性，而不表示從屬關係(對於定向到章節的情況)或者等價關係。
	 * 例如我們可能將[[有罪推定]]定向至[[無罪推定]]，然而雙方是完全相反的關係。
	 * 只因為[[無罪推定]]是一種比較值得關注的特性，而[[有罪推定]]沒有特殊的性質(common)。因此我們只談[[無罪推定]]，不會特別拿[[有罪推定]]出來談。
	 * 
	 * TODO:
	 * https://www.mediawiki.org/w/api.php?action=help&modules=searchtranslations
	 * 
	 * https://www.mediawiki.org/wiki/Extension:Scribunto/Lua_reference_manual#Renaming_or_moving_modules
	 * 
	 * @example <code>

	CeL.wiki.redirect_to('史記', function(redirect_data, page_data) {
		CeL.show_value(redirect_data);
	});

	 </code>
	 * 
	 * @param {String|Array}title
	 *            title or [ {String}API_URL, {String}title or {Object}page_data ]
	 * @param {Function}[callback]
	 *            回調函數。 callback({String}title that redirects to or {Object}with
	 *            redirects to what section, {Object}page_data, error)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @see https://www.mediawiki.org/w/api.php?action=help&modules=query%2Brevisions
	 */
	wiki_API.redirect_to = function(title, callback, options) {
		wiki_API.page(title, function(page_data, error) {
			if (error || !wiki_API.content_of.page_exists(page_data)) {
				// error? 此頁面不存在/已刪除。
				callback(undefined, page_data, error);
				return;
			}

			// e.g., [ { from: 'AA', to: 'A', tofragment: 'aa' } ]
			// e.g., [ { from: 'AA', to: 'A', tofragment: '.AA.BB.CC' } ]
			var redirect_data = page_data.response.query.redirects;
			if (redirect_data) {
				if (redirect_data.length !== 1) {
					// 可能是多重重定向？
					// e.g., A→B→C
					library_namespace.warn('wiki_API.redirect_to: ' + 'Get '
							+ redirect_data.length + ' redirects for ['
							// title.join(':')
							+ title + ']!');
					library_namespace.warn(redirect_data);
				}
				// 僅取用並回傳第一筆資料。
				redirect_data = redirect_data[0];
				// assert: redirect_data && redirect_data.to === page_data.title

				// test if is #REDIRECT [[title#section]]
				if (redirect_data.tofragment) {
					try {
						redirect_data.to_link = redirect_data.to + '#'
						// 須注意: 對某些 section 可能 throw！
						+ decodeURIComponent(redirect_data.tofragment
						//
						.replace(/\./g, '%'));
					} catch (e) {
						redirect_data.to_link = redirect_data.to + '#'
						//
						+ redirect_data.tofragment;
					}
					library_namespace.debug(wiki_API.title_link_of(title)
					// →
					+ ' redirected to section [[' + redirect_data.to + '#'
							+ redirect_data.tofragment + ']]!', 1,
							'wiki_API.redirect_to');
					callback(redirect_data, page_data);
					return;
				}

			}

			// page_data.title is normalized title.
			callback(page_data.title, page_data);

		}, Object.assign({
			// 輸入 prop:'' 或再加上 redirects:1 可以僅僅確認頁面是否存在，以及頁面的正規化標題。
			prop : '',
			redirects : 1,
			// 處理繁簡轉換的情況: 有可能目標頁面存在，只是繁簡不一樣。
			// TODO: 地區詞處理。
			converttitles : 1,
			// Only works if the wiki's content language supports variant
			// conversion. en, crh, gan, iu, kk, ku, shi, sr, tg, uz and zh.
			// converttitles : 1,
			save_response : true
		}, options));
	};

	// ------------------------------------------------------------------------

	// TODO: html to wikitext
	// https://zh.wikipedia.org/w/api.php?action=help&modules=flow-parsoid-utils

	/**
	 * 展開 template 內容
	 * 
	 * 這種方法不能展開 module
	 * 
	 * @example <code>

	wiki.page(title, function(page_data) {
		console.log(CeL.wiki.content_of(page_data, 'expandtemplates'));
	}, {
		expandtemplates : true
	});

	 </code>
	 * 
	 * @see wiki_API.protect
	 */
	function wiki_API_expandtemplates(wikitext, callback, options) {
		var post_data = {
			text : wikitext,
			prop : 'wikitext'
		};

		options = library_namespace.new_options(options);

		for ( var parameter in wiki_API_expandtemplates.parameters) {
			if (parameter in options) {
				if (options[parameter] || options[parameter] === 0)
					post_data[parameter] = options[parameter];
			}
		}

		wiki_API.query({
			action : 'expandtemplates'
		}, function(data, error) {
			if (wiki_API.query.handle_error(data, error, callback)) {
				return;
			}

			if (options.page) {
				// use page_data.expandtemplates.wikitext
				Object.assign(options.page, data);
			}

			typeof callback === 'function'
			//
			&& callback(data.expandtemplates);

		}, post_data, options);
	}

	wiki_API_expandtemplates.parameters = {
		title : undefined,
		// text : wikitext,
		revid : undefined,
		prop : undefined,
		includecomments : undefined,

		templatesandboxprefix : undefined,
		templatesandboxtitle : undefined,
		templatesandboxtext : undefined,
		templatesandboxcontentmodel : undefined,
		templatesandboxcontentformat : undefined
	};

	wiki_API.expandtemplates = wiki_API_expandtemplates;

	// ------------------------------------------------------------------------

	// wiki_session.convert_languages()
	function get_language_variants(text, uselang, callback, options) {
		if (!text) {
			// String(test)
			callback(text === 0 ? '0' : '');
			return;
		}

		if (!uselang) {
			callback(text, new Error('get_language_variants: '
					+ 'No uselang specified!'));
			return;
		}

		if (wiki_API.need_get_API_parameters('parse', options,
				get_language_variants, arguments)) {
			return;
		}

		options = library_namespace.setup_options(options);

		var is_JSON;
		if (typeof text === 'object') {
			is_JSON = text;
			text = JSON.stringify(text);
		}

		// 作基本的 escape。不能用 encodeURIComponent()，這樣會把中文也一同 escape 掉。
		// 多一層 encoding，避免 MediaWiki parser 解析 HTML。
		text = escape(text)
		// recover special characters (e.g., Chinese words) by unescape()
		.replace(/%u[\dA-F]{4}/g, unescape);
		// assert: 此時 text 不應包含任何可被 MediaWiki parser 解析的語法。

		// + {{int:Conversionname}}
		// assert: '!' === encodeURIComponent('!')
		text = '!' + text + '!';

		var post_data = {
			// https://zh.wikipedia.org/w/api.php?action=query&meta=siteinfo&siprop=languages&utf8=1
			contentmodel : 'wikitext',
			// 'zh-hans'
			uselang : uselang,
			// prop=text|links
			prop : 'text',
			text : text
		};

		var session = wiki_API.session_of_options(options);

		// 由於用 [[link]] 也不會自動 redirect，因此直接轉換即可。
		wiki_API.query([
				session && session.API_URL
						|| wiki_API.api_URL(uselang.replace(/\-.*$/, '')),
				// https://www.mediawiki.org/w/api.php?action=help&modules=parse
				{
					action : 'parse'
				} ], function(data, error) {
			error = wiki_API.query.handle_error(data, error);
			if (error) {
				callback(undefined, error);
				return;
			}
			// console.trace(data);
			data = data.parse;
			try {
				// 罕見情況下，有可能 data === undefined
				data = data.text['*']
				// 去掉 MediaWiki parser 解析器所自行添加的 token 與註解。
				.replace(/<\!--[\s\S]*?-->/g, '')
				// 去掉前後包覆。 e.g., <p> or <pre>
				.replace(/![^!]*$/, '').replace(/^[^!]*!/, '');

				// recover special characters
				data = unescape(data);
				if (is_JSON) {
					data = JSON.parse(data);
					if (Array.isArray(is_JSON)) {
						if (is_JSON.length !== data.length) {
							throw new Error(
							//
							'get_language_variants: fault on {Array}: '
									+ is_JSON.length + ' !== ' + data.length);
						}
						data.uselang = uselang;
					}
				}
			} catch (e) {
				callback(text, e);
				return;
			}
			callback(data);
		}, post_data, options);
	}

	if (false) {
		CeL.wiki.convert_Chinese('中国', function(converted_text) {
			converted_text === "中國";
		});

		CeL.wiki.convert_Chinese([ '繁體', '簡體' ], function(converted_hans) {
			converted_hans[0] === "繁体";
		}, {
			uselang : 'zh-hans'
		});
	}

	// wiki API 繁簡轉換
	wiki_API.convert_Chinese = function convert_Chinese(text, callback, options) {
		var uselang = typeof options === 'string' ? options : options
				&& options.uselang;

		get_language_variants(text, uselang || 'zh-hant', callback, options);
	};

	// ------------------------------------------------------------------------

	/**
	 * 檢查頁面是否被保護。
	 * 
	 * 採用如:
	 * 
	 * @example <code>

	wiki.page(title, function(page_data) {
		console.log(CeL.wiki.is_protected(page_data));
	}, {
		prop : 'revisions|info',
		// rvprop : 'ids|timestamp',
		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Binfo
		// https://www.mediawiki.org/wiki/API:Info#inprop.3Dprotection
		additional_query : 'inprop=protection'
	});

	 </code>
	 * 
	 * @see wiki_API.protect
	 */
	wiki_API.is_protected = function has_protection(page_data) {
		var protection_list = page_data.protection || page_data;
		if (!Array.isArray(protection_list)) {
			return;
		}

		// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Binfo
		// https://www.mediawiki.org/wiki/API:Info#inprop.3Dprotection
		return protection_list.some(function(protection) {
			return protection.type === 'edit' && protection.level === 'sysop';
		});
	};

	// ================================================================================================================
	// 監視最近更改的頁面。

	function get_recent_via_API(callback, options) {
		var session = wiki_API.session_of_options(options);
		if (!session) {
			// 先設定一個以方便操作。
			session = new wiki_API(null, null, options.language
					|| wiki_API.language);
		}
		// use get_list()
		// 注意: arguments 與 get_list() 之 callback 連動。
		session.recentchanges(callback, options);
	}

	// 一定會提供的功能。
	wiki_API.recent_via_API = get_recent_via_API;
	// 預防已經被設定成 `get_recent_via_databases` @ CeL.application.net.wiki.Toolforge。
	if (!wiki_API.recent) {
		// 可能會因環境而不同的功能。讓 wiki_API.recent 採用較有效率的實現方式。
		wiki_API.recent =
		// wiki_API.SQL.config ? get_recent_via_databases :
		get_recent_via_API;
	}

	// ----------------------------------------------------

	// Listen to page modification. 監視最近更改的頁面。
	// 注意: 會改變 options！
	// 注意: options之屬性名不可與 wiki_API.recent 衝突！
	// 警告: 同時間只能有一隻程式在跑，否則可能會造成混亂！
	function add_listener(listener, options) {
		if (!options) {
			options = Object.create(null);
		} else if (typeof options === 'number' && options > 0) {
			// typeof options === 'number': 避免
			// TypeError: Cannot convert object to primitive value
			// TypeError: Cannot convert a Symbol value to a number
			options = {
				interval : options
			};
		} else if (typeof options === 'string'
		//
		|| library_namespace.is_RegExp(options)) {
			options = {
				// language : '',
				// title_filter
				title : options
			};
		}

		if (isNaN(options.max_page) || options.max_page >= 1) {
			// normal
		} else {
			throw new Error(
					'add_listener: '
							+ 'assert: isNaN(options.max_page) || options.max_page >= 1');
		}

		if (!(options.limit > 0)) {
			// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Brevisions
			options.rvlimit = 'max';
		}

		var session = wiki_API.session_of_options(options),
		// @see .SQL_config
		SQL_where = options.SQL_options
		//
		|| (options.SQL_options = Object.create(null));
		SQL_where = SQL_where.where || (SQL_where.where = Object.create(null));
		// console.log(session);

		if (!session
		//
		&& (options.with_diff || options.with_content)) {
			// 先設定一個以方便操作。
			session = new wiki_API(null, null, options.language
					|| wiki_API.language);
		}

		// console.log(options);
		// console.log(session);
		var recent_options, use_SQL = 'use_SQL' in session ? session.use_SQL
				: wiki_API.SQL && wiki_API.SQL.config;
		if (!use_SQL) {
			;
		} else if ('use_SQL' in options) {
			// options.use_SQL: Try to use SQL. Use SQL as possibile.
			use_SQL = options.use_SQL;
		} else if (typeof options.parameters === 'object') {
			// auto-detect
			use_SQL = Object.keys(options.parameters).filter(function(item) {
				// 只設定了 rcprop: SQL 將會取得所有資訊，僅設定此條件時採用 SQL 不會影響效果。
				return item && item !== 'rcprop';
			}).length === 0;
		}

		var get_recent = use_SQL ? wiki_API.recent : wiki_API.recent_via_API,
		// 僅取得最新文件版本。注意: 這可能跳過中間編輯的版本，造成有些修訂被忽略。
		latest_only = 'latest' in options ? options.latest : true;
		if (use_SQL) {
			// console.log(options);
			recent_options = Object.clone(options.SQL_options);
			if (options[KEY_SESSION]) {
				// pass API config to get_recent()
				recent_options[KEY_SESSION] = options[KEY_SESSION];
			}
		} else {
			recent_options = Object.clone(options);
			if (!recent_options.parameters)
				recent_options.parameters = Object.create(null);
			if (recent_options.rcprop) {
				if (!recent_options.parameters.rcprop)
					recent_options.parameters.rcprop = recent_options.rcprop;
				delete recent_options.rcprop;
			}
			// console.log(recent_options);
			// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Brecentchanges
			recent_options.parameters = Object.assign({
				// 盡可能多取一點以減少查詢次數。
				rclimit : 'max'
			}, recent_options.parameters, {
				// 這些必須強制設定，否則演算法會出問題。

				// List newest first (default).
				// Note: rcstart has to be later than rcend.
				// rcdir : 'older',
				rcdir : 'newer',

				// new Date().toISOString()
				// rcstart : 'now',
				rctype : 'edit|new'
			});
			if (latest_only) {
				recent_options.parameters.rctoponly = 1;
			}
			if (recent_options.parameters.rcprop
			// 為了之後設定 last_query_time，因此必須要加上 timestamp 這一項 information。
			&& !recent_options.parameters.rcprop.includes('timestamp')) {
				if (Array.isArray(recent_options.parameters.rcprop)) {
					recent_options.parameters.rcprop.push('timestamp');
				} else if (typeof recent_options.parameters.rcprop === 'string') {
					recent_options.parameters.rcprop += '|timestamp';
				} else {
					throw new Error('Unkonwn rcprop: '
							+ recent_options.parameters.rcprop);
				}
			}
		}

		var namespace = (session || wiki_API).namespace(options.namespace);
		if (namespace !== undefined) {
			// 不指定 namespace，或者指定 namespace 為 ((undefined)): 取得所有的 namespace。
			if (use_SQL) {
				recent_options.namespace = namespace;
			} else {
				recent_options.parameters.rcnamespace = namespace;
			}
		}

		if (options.type) {
			if (use_SQL) {
				recent_options.type = options.type;
			} else {
				recent_options.parameters.rctype = options.type;
			}
			// TODO: other options
		}

		if (options.with_diff && !options.with_diff.diff
				&& !options.with_diff.with_diff) {
			// options to LCS() diff
			if (options.with_diff === true) {
				options.with_diff = {
					LCS : true,

					// line : false,
					// index : 2,
					// with_list : true

					// MediaWiki using line-diff
					line : true
				};
			}
			options.with_diff.diff = true;
		}

		// 注意:
		// {String|Natural}options.start, options.delay:
		// 將會用 CeL.date.to_millisecond() 來解析。
		// 推薦用像是 "2days", "3min", "2d", "3m" 這樣子的方法來表現。
		//
		// {Date}options.start: 從這個時間點開始回溯。
		// {Natural}options.start: 回溯 millisecond 數。
		// {Natural}options.delay > 0: 檢查的延遲時間。等待 millisecond 數。

		var delay_ms = library_namespace.to_millisecond(options.delay),
		//
		interval = library_namespace.to_millisecond(options.interval) || 500,
		// assert: {Date}last_query_time start time
		last_query_time,
		// TODO: 僅僅採用 last_query_revid 做控制，不需要偵測是否有重複。 latest_revid
		last_query_revid = options.revid | 0;

		// @see function adapt_task_configurations() @ wiki.js
		if (!options.configuration_adapter) {
			// 採用預設的 configuration_adapter。
			options.configuration_adapter = session.task_configuration
					&& session.task_configuration.configuration_adapter;
		}
		// {String}設定頁面。 注意: 必須是已經轉換過、正規化後的最終頁面標題。
		var configuration_page_title = typeof options.configuration_adapter === 'function'
				&& wiki_API.normalize_title(options.configuration_page)
				|| session.task_configuration
				&& session.task_configuration.configuration_page_title;
		/** {Number}延遲 adapt 設定的時間: 預設為過5分鐘才 adapt configuration */
		var delay_time_to_adapt_task_configurations = 'delay_time_to_adapt_task_configurations' in options ? options.delay_time_to_adapt_task_configurations
				: session.delay_time_to_adapt_task_configurations;

		if (!(delay_ms > 0))
			delay_ms = 0;

		if (options.delay && !('start' in options)) {
			// e.g., 指定延遲兩分鐘時，就直接檢查兩分鐘前開始的資料。
			options.start = options.delay;
		}

		if (library_namespace.is_Date(options.start)) {
			last_query_time = isNaN(options.start.getTime()) ? new Date
					: options.start;
		} else if (options.start
				&& !isNaN(last_query_time = Date.parse(options.start))) {
			last_query_time = new Date(last_query_time);
		} else if ((last_query_time = library_namespace
				.to_millisecond(options.start)) > 0) {
			// treat as time back to 回溯這麼多時間。
			if (last_query_time >= library_namespace.to_millisecond('31d')) {
				library_namespace.info([ 'add_listener: ', {
					// gettext_config:{"id":"wikimedia-wikis-can-be-backtracked-up-to-about-$1"}
					T : [ 'Wikimedia wikis 最多可回溯約 %1。',
					// @see https://www.mediawiki.org/wiki/Manual:$wgRCMaxAge
					library_namespace.age_of(
					// 在 2017 CE 最多可回溯約 30天。
					library_namespace.to_millisecond('30D'), {
						max_unit : 'day'
					}) ]
				}, {
					// gettext_config:{"id":"the-period-you-specified-$1-($2)-may-be-too-long"}
					T : [ '您所指定的時間 [%1]（%2）恐怕過長。', options.start,
					//
					library_namespace.age_of(last_query_time, {
						max_unit : 'day'
					}) ]
				} ]);
			}
			last_query_time = new Date(Date.now() - last_query_time);
		} else {
			// default: search from NOW
			last_query_time = new Date;
		}
		// console.trace(last_query_time);

		library_namespace.info([ 'add_listener: ', {
			T : [ Date.now() - last_query_time > 100
			// gettext_config:{"id":"start-monitoring-and-scanning-$2-pages-changed-since-$3-using-$1"}
			? '開始以 %1 監視、掃描 %2 自 %3 起更改的頁面。'
			// gettext_config:{"id":"start-monitoring-and-scanning-the-recently-changed-pages-of-$2-using-$1"}
			: '開始以 %1 監視、掃描 %2 最近更改的頁面。', use_SQL ? 'SQL' : 'API',
			//
			session ? wiki_API.site_name(session) : wiki_API.language,
			//
			library_namespace.indicate_date_time(last_query_time, {
				base_date : Date.now()
			}) ]
		} ]);

		if (configuration_page_title) {
			library_namespace.info([ 'add_listener: ', {
				// gettext_config:{"id":"configuration-page-$1"}
				T : [ 'Configuration page: %1',
				//
				wiki_API.title_link_of(configuration_page_title) ]
			} ]);
		}

		if (false) {
			library_namespace.debug('recent_options: '
			// TypeError: Converting circular structure to JSON
			+ JSON.stringify(recent_options), 1, 'add_listener');
		}
		// console.trace(recent_options);

		var run_next_status = session && session.set_up_if_needed_run_next();

		// 取得頁面資料。
		function receive() {
			var next_task_id = undefined;
			/** {Number}上一次執行 receive() 的時間 timevalue。 */
			var receive_time = Date.now();

			function receive_next() {
				// 預防上一個任務還在執行的情況。
				// https://zh.moegirl.org.cn/index.php?limit=500&title=Special%3A%E7%94%A8%E6%88%B7%E8%B4%A1%E7%8C%AE&contribs=user&target=Cewbot&namespace=&tagfilter=&start=2019-08-12&end=2019-08-13
				if (next_task_id) {
					library_namespace
							.info('已經設定過下次任務。可能是上一個任務還在查詢中，或者應該會 timeout？將會清除之前的任務，重新設定任務。');
					// for debug:
					console.log(next_task_id);
					clearTimeout(next_task_id);
				}

				var real_interval_ms = Date.now() - receive_time;
				library_namespace
						.debug('interval from latest receive() starts: '
								+ real_interval_ms + ' ms (' + Date.now()
								+ ' - ' + receive_time + ')', 3, 'receive_next');
				next_task_id = setTimeout(receive,
				// 減去已消耗時間，達到更準確的時間間隔控制。
				Math.max(interval - real_interval_ms, 0));
			}

			library_namespace.debug('Get recent change from '
					+ (library_namespace.is_Date(last_query_time)
							&& last_query_time.getTime() ? last_query_time
							.toISOString() : last_query_time)
					+ ', last_query_revid=' + last_query_revid, 1,
					'add_listener.receive');

			// 根據不同的實現方法採用不一樣的因應方式。
			if (use_SQL) {
				if (!library_namespace.is_Date(last_query_time)) {
					// assert: !!(last_query_time)
					// 可能來自"設定成已經取得的最新一個編輯rev。"
					last_query_time = new Date(last_query_time);
				}
				SQL_where.timestamp = '>=' + last_query_time
				// MediaWiki format
				.format('%4Y%2m%2d%2H%2M%2S');
				SQL_where.this_oldid = '>' + last_query_revid;
				if (delay_ms > 0) {
					SQL_where[wiki_API.run_SQL.KEY_additional_row_conditions]
					// 截止期限。
					= 'rc_timestamp<=' + new Date(receive_time - delay_ms)
					// MediaWiki format
					.format('%4Y%2m%2d%2H%2M%2S');
				}
				// console.trace(options.SQL_options);
			} else {
				// rcend
				recent_options.parameters.rcstart = library_namespace
						.is_Date(last_query_time) ? last_query_time
						.toISOString() : last_query_time;
				if (false) {
					console.log('set rcstart: '
							+ recent_options.parameters.rcstart);
				}
				if (delay_ms > 0) {
					recent_options.parameters.rcend
					// 截止期限。
					= new Date(receive_time - delay_ms).toISOString();
				}

				if (session
				// https://meta.wikimedia.org/wiki/Flagged_Revisions
				// enwiki 也有 flagged revisions 但似乎不會 pending changes
				&& session.language === 'de'
				// [[w:en:Wikipedia:Pending changes]]
				&& !('has_flagged_revision' in session)
						&& session.API_parameters['query+revisions']) {
					// console.trace(session.API_parameters['query+revisions']);
					session.has_flagged_revision = session.API_parameters['query+revisions'].parameter_Map
							.get('prop').type.includes('flagged');
				}
			}

			get_recent(function process_rows(rows) {
				if (false) {
					console.trace(rows, recent_options.parameters,
							last_query_revid, last_query_time, delay_ms);
				}
				if (!rows) {
					library_namespace.warn((new Date).toISOString()
							+ ': No rows get.');
					return;
				}

				if (false) {
					library_namespace.log(recent_options.parameters
							|| recent_options.SQL_options);
					console.log(rows);
				}

				// 去除之前已經處理過的頁面。
				if (rows.length > 0) {
					// 判別新舊順序。
					var has_new_revid_to_old = rows.length > 1
					// 2019/9/12: 雖然 rcid 依小排到大，但 revid 可能有亂序交錯。
					&& rows.some(function(row, index) {
						return index > 0 && rows[index - 1].revid > row.revid;
					});
					if (has_new_revid_to_old) {
						// console.trace(rows);
						// e.g., use SQL
						library_namespace.debug('判別新舊順序: 有新到舊或亂序: Get '
								+ rows.length + ' recent pages:\n'
								+ rows.map(function(row) {
									return row.revid;
								}), 2, 'add_listener');
						library_namespace.debug('把從新的排列到舊的或亂序轉成從舊的排列到新的: '
								+ rows.map(function(row) {
									return row.revid;
								}), 1, 'add_listener');
						// 因可能有亂序，不能光以 .reverse() 轉成 old to new。
						rows.sort(function(row_1, row_2) {
							if (Date.parse(row_1.timestamp) >
							//
							Date.parse(recent_options.parameters.rcend)) {
								console.trace([ row_1,
										recent_options.parameters ]);
								throw new Error(row_1.timestamp + '>'
										+ recent_options.parameters.rcend);
							}
							return row_1.revid - row_2.revid;
						});
					}

					library_namespace.debug(
							'準備去除掉重複的紀錄。之前已處理到 last_query_revid='
									+ last_query_revid + ', 本次取得 '
									+ rows.length + ' record(s). revid: '
									+ rows.map(function(row) {
										return row.revid;
									}), 3);
					// console.trace(rows);
					// e.g., use API 常常會回傳和上次有重疊的資料
					while (rows.length > 0
					// 去除掉重複的紀錄。因為是從舊的排列到新的，因此從起頭開始去除。
					&& rows[0].revid <= last_query_revid) {
						rows.shift();
					}
					// console.trace(rows);

					rows.previous_query_time = last_query_time;
					if (rows.length > 0) {
						// assert: options.max_page >= 1
						if (rows.length > options.max_page) {
							// 直接截斷，僅處理到 .max_page。
							rows.truncate(options.max_page);
						}

						// cache the lastest record
						last_query_time = rows.at(-1);
						// 紀錄/標記本次處理到哪。
						// 注意：type=edit會增加revid，其他type似乎會沿用上一個revid。
						last_query_revid = last_query_time.revid;
						last_query_time = last_query_time.timestamp;
						// 確保 {Date}last_query_time
						// last_query_time = new Date(last_query_time);
						library_namespace.debug('The lastest record: '
								+ JSON.stringify(last_query_time), 4);
					} else if (recent_options.parameters.rcend) {
						library_namespace
								.debug('last_query_time 直接採用本次查詢的結束時刻: '
										+ last_query_time + '→'
										+ recent_options.parameters.rcend);
						last_query_time = recent_options.parameters.rcend;
					} else {
						last_query_time = new Date(receive_time);
					}

					// 預設全部都處理完，因此先登記。假如僅處理其中的一部分，屆時再特別登記。
				}
				library_namespace.debug('去除掉重複的紀錄之後 last_query_revid='
				//
				+ last_query_revid + ', ' + rows.length + ' record(s) left.'
				//
				+ (rows.length > 0 ? ' revid: ' + rows.map(function(row) {
					return row.revid;
				}).join(', ') + '. title: ' + rows.map(function(row) {
					return row.title;
				}).join(', ') : ''), 1, 'add_listener');
				library_namespace.log_temporary('add_listener: '
						+ last_query_time + ' ('
						+ library_namespace.indicate_date_time(
						//
						last_query_time) + ')');

				// 使 wiki.listen() 可隨時監視設定頁面與緊急停止頁面的變更。
				// 警告: 對於設定頁面的監聽，僅限於設定頁面也在監聽範圍中時方起作用。
				// 例如設定了 namespace，可能就監聽不到設定頁面的變更。
				var configuration_row, configuration_adapter,
				//
				configuration_adapter__run;
				if (configuration_page_title) {
					// 檢測看看是否有 configuration_page_title
					rows.forEach(function(row, index) {
						if (row.title === configuration_page_title) {
							configuration_row = row;
						}
					});
				}
				if (configuration_row) {
					configuration_adapter__run = function() {
						// clearTimeout(session.adapt_task_configurations_timer);
						delete session.adapt_task_configurations_timer;
						library_namespace.info([ 'add_listener: ', {
							// gettext_config:{"id":"the-configuration-page-$1-has-been-modified.-re-parse"}
							T : [ '設定頁面 %1 已變更。重新解析……',
							//
							wiki_API.title_link_of(configuration_page_title) ]
						} ]);
						session.adapt_task_configurations(configuration_row,
								options.configuration_adapter, 'once');
					};
					if (delay_time_to_adapt_task_configurations >= 0) {
						configuration_adapter = function() {
							if (session.adapt_task_configurations_timer) {
								clearTimeout(
								//
								session.adapt_task_configurations_timer);
							}
							library_namespace.info([ 'add_listener: ', {
								// gettext_config:{"id":"wait-$1-to-apply-the-settings"}
								T : [ '等待 %1 以應用設定。',
								//
								library_namespace.age_of(0,
								//
								delay_time_to_adapt_task_configurations) ]
							} ]);
							session.adapt_task_configurations_timer =
							//
							setTimeout(configuration_adapter__run,
							//
							delay_time_to_adapt_task_configurations);
						};
					} else {
						configuration_adapter = configuration_adapter__run;
					}
				}

				rows.query_delay = Date.now() - Date.parse(last_query_time);
				rows.forEach(function(row) {
					// row.last_query_time = last_query_time;
					row.query_delay = rows.query_delay;
				});
				if (options.filter && rows.length > 0) {
					// @see CeL.data.fit_filter()
					// TODO: 把篩選功能放到 get_recent()，減少資料處理的成本。
					rows = rows.filter(
					// 篩選函數。rcprop必須加上篩選函數需要的資料，例如編輯摘要。
					typeof options.filter === 'function' ? options.filter
					// 篩選標題。警告: 從API取得的標題不包括 "/" 之後的文字，因此最好還是等到之後 listener
					// 處理的時候，才來對標題篩選。
					: library_namespace.is_RegExp(options.filter)
					// 篩選PATTERN
					? function(row) {
						return row.title && options.filter.test(row.title);
					} : Array.isArray(options.filter) ? function(row) {
						return row.title && options.filter.includes(row.title);
					} : function(row) {
						if (false)
							library_namespace.log([ row.title, options.filter,
							//
							wiki_API.normalize_title(options.filter) ]);
						// assert: typeof options.filter === 'string'
						return row.title
						// treat options.filter as page title
						&& (row.title.includes(options.filter)
						// 區分大小寫
						|| row.title.startsWith(
						//
						wiki_API.normalize_title(options.filter)));
					});
					library_namespace.debug('Get ' + rows.length
							+ ' recent pages after filter:\n'
							+ rows.map(function(row) {
								return row.revid;
							}), 2, 'add_listener');
					// console.trace([ rows, options.filter ]);
				}

				// TODO: configuration_row 應該按照 rows 的順序，
				// 並且假如特別 filter 到設定頁面的時候，那麼設定頁面還是應該要被 listener 檢查。
				if (configuration_row && !rows.includes(configuration_row)) {
					if (library_namespace.is_debug()) {
						library_namespace.debug(
								'unshift configuration_row revid='
										+ configuration_row.revid + ':', 1,
								'add_listener');
						console.log(configuration_row);
					}
					// 保證 configuration_page_title 的變更一定會被檢查到。
					rows.unshift(configuration_row);
				}

				var quit_listening, waiting_queue = [];
				var check_result = function check_result(result, run_next) {
					if (library_namespace.is_thenable(result)) {
						if (run_next) {
							// 先執行完本頁面再執行下一個頁面。
							result = result.then(run_next, function(error) {
								library_namespace.error(error);
								run_next();
							});
							if (session)
								session.check_and_run_next(run_next_status,
										result);
							// 直接跳出。之後會等 promise 出結果才繼續執行。
						} else {
							waiting_queue.push(result);
						}

					} else {
						if (result) {
							last_query_time = new Date;
							return quit_listening = result;
						}
						run_next && run_next();
					}

				}, check_and_receive_next = function check_and_receive_next(
						result) {
					// if listener() return true, the operation will be stopped.
					if (quit_listening) {
						library_namespace.debug(
						//
						'The listener() returns non-null, quit listening.', 0,
								'add_listener.check_and_receive_next');

					} else if (waiting_queue.length > 0) {
						library_namespace.debug('Waiting '
								+ waiting_queue.length
								+ ' work(s) and then get next recent pages', 2,
								'add_listener.check_and_receive_next');
						Promise.allSettled(waiting_queue).then(receive_next);

					} else {
						library_namespace.debug('Get next recent pages', 2,
								'add_listener.check_and_receive_next');
						receive_next();
					}
				};

				if (rows.length > 0) {
					// console.trace(rows);
					library_namespace.log_temporary('add_listener: '
							+ 'Fetching ' + rows.length
							+ ' page(s) starting from page '
							+ wiki_API.title_link_of(rows[0]));

					library_namespace.debug('Fetching ' + rows.length
							+ ' recent page(s):\n' + rows.map(function(row) {
								return row.revid;
							}), 2, 'add_listener');

					// 比較頁面修訂差異。
					if (options.with_diff || options.with_content >= 2) {
						// console.trace([ rows[0].query_delay, rows.length ]);
						// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Brevisions
						// rvdiffto=prev 已經 parsed，因此仍須自行解析。
						// TODO: test
						// 因為採用.run_serial(.page())，因此約一秒會跑一頁面。
						// TODO: 改 .shift()
						rows.run_serial(function(run_next, row, index, list) {
							// console.trace(row);
							if (false) {
								console.trace([ index + '/' + rows.length,
										row.title ]);
							}
							// 應該不會出現這種狀況。
							if (false && !row.pageid) {
								run_next();
								return;
							}

							library_namespace.debug('Get page: ' + (index + 1)
									+ '/' + rows.length + ' '
									+ wiki_API.title_link_of(row) + ' revid='
									+ row.revid, 2, 'add_listener.with_diff');

							var page_options = {
								// 這裡的rvstartid指的是新→舊。
								// 偶爾有可能出現: [badid_rvstartid] No revision was
								// found for parameter "rvstartid".
								rvstartid : row.revid
							};
							// or: row.old_revid >= 0
							if (row.old_revid > 0) {
								page_options.rvendid = row.old_revid;
							}

							page_options = {
								is_id : true,
								rvlimit : options.with_content >= 3
								// default: 僅取最近的兩個版本作 diff
								? options.with_content : 2,
								// https://www.mediawiki.org/w/api.php?action=help&modules=query%2Brevisions
								parameters : page_options,
								rvprop
								// e.g.,
								// minor:'',anon:''/* e.g., IP user 匿名用戶 */,
								// bot flag: ('bot' in row)
								: 'ids|timestamp|content|user|flags|size'
							};
							if (session.has_flagged_revision) {
								// 在有審核機制的 wiki project 中，獲取版本的審核資訊。
								page_options.rvprop += '|flagged';
							}
							if (false) {
								Object.assign(page_options, options.with_diff);
							}

							// console.trace([ row, page_options ]);
							library_namespace.log_temporary(
							//
							'add_listener.with_diff: ' + 'Fetching '
									+ (index + 1) + '/' + rows.length + ': '
									+ wiki_API.title_link_of(row) + ' ('
									+ library_namespace.indicate_date_time(
									//
									last_query_time) + ')');
							// console.trace(row);
							session.page(row, function(page_data, error) {
								// console.trace([ row, page_data ]);
								library_namespace.log_temporary(
								// 'Get ' +
								(index + 1)
										+ '/'
										+ rows.length
										+ ' ('
										+ (100 * (index + 1) / rows.length)
												.to_fixed(1) + '%) '
										+ wiki_API.title_link_of(row) + ' ('
										+ library_namespace.indicate_date_time(
										// Date.parse(wiki_API.content_of.revision(page_data).timestamp)
										last_query_time) + ')');
								if (quit_listening || !page_data || error) {
									if (error)
										console.error(error);
									run_next();
									return;
								}

								// console.log(wiki_API.title_link_of(page_data));
								var revisions = page_data.revisions;
								if (false) {
									console.trace([ page_options, revisions,
											last_query_time,
											Date.parse(revisions[0].timestamp),
											Date.parse(last_query_time),
											delay_ms ]);
								}
								if (!revisions || !revisions[0] ||
								// 設定 .rctoponly 的話，舊版本會被直接篩選掉。
								!latest_only && (
								// 以 revisions[0] 確定 row 是最新版本。
								revisions[0].revid !== row.revid
								//
								|| Date.parse(revisions[0].timestamp) >
								//
								Date.parse(last_query_time) + delay_ms)) {
									library_namespace.log(
									//
									'add_listener.with_diff: '
									//
									+ wiki_API.title_link_of(row)
									//
									+ ': 從 recentchanges table 取得的版本 '
									//
									+ row.revid + ' 不同於從頁面內容取得的最新版本 '
									//
									+ (revisions && revisions[0]
									//
									&& revisions[0].revid)
											+ '，可能之後又有更新的編輯，跳過這一項。');
									run_next();
									return;
								}
								// assert: revisions[0].revid === row.revid

								// merge page data
								Object.assign(row, page_data);

								// console.log(revisions);
								if (revisions && revisions.length >= 1
								//
								&& revisions[0] && revisions[0].timestamp) {
									// 設定成已經取得的最新一個編輯rev。
									last_query_time
									// 確保 {Date}last_query_time
									// = new Date(revisions[0].timestamp);
									= revisions[0].timestamp;
									// last_query_revid = revisions[0].revid;
								}

								if (options.reviewed_only
								//
								&& session.has_flagged_revision
								//
								&& revisions && revisions[0]
										&& !revisions[0].flagged) {
									library_namespace.log(
									// 在有審核機制的 wiki project 中，沒經過審核的版本。
									'add_listener: ' + '跳過頁面未經審核的版本: '
									// 未經審核的版本對於未登入者來說是不可見的。
									+ wiki_API.title_link_of(page_data));
									run_next();
									return;
								}

								// assert: (row.is_new || revisions.length > 1)
								if (revisions && revisions.length >= 1
										&& options.with_diff) {

									// wiki_API.content_of(row, -1);
									var from = revisions.length >= 2
											&& wiki_API.revision_content(
											// select the oldest revision.
											revisions.at(-1)) || '',
									// 解析頁面結構。
									to = wiki_API.revision_content(
									//
									revisions[0]);

									if (!options.with_diff.line) {
										from = wiki_API.parser(from).parse();
										row.from_parsed = from;
										// console.log(from);
										from = from.map(function(token) {
											if (!token && (token !== ''
											// 有時會出意外。
											|| from.length !== 1)) {
												console.log(row);
												throw new Error(row.title);
											}
											return token.toString();
										});

										to = wiki_API.parser(row).parse();
										to = to.map(function(token) {
											if (!token && (token !== ''
											//
											|| to.length !== 1)) {
												console.log(row);
												throw new Error(row.title);
											}
											return token.toString();
										});

										// verify parser

										if (wiki_API.revision_content(
										//
										revisions[0])
										//
										!== to.join('')) {
											console.log(
											//
											wiki_API.revision_content(
											//
											revisions[0]));
											console.log(to);
											to
											//
											= wiki_API.revision_content(
											//
											revisions[0]);
											console.log(library_namespace.LCS(
											//
											to, parse_wikitext(to).toString(),
													'diff'));
											throw new Error(
											//
											'Parser error (to): ' +
											// debug 用. check parser, test
											// if parser working properly.
											wiki_API.title_link_of(page_data));
										}

										if (revisions.length > 1 &&
										//
										wiki_API.revision_content(
										//
										revisions.at(-1))
										//
										!== from.join('')) {
											console.log(library_namespace.LCS(
											//
											wiki_API.revision_content(
											//
											revisions.at(-1)),
											//
											from.join(''), 'diff'));
											throw new Error(
											//
											'Parser error (from): ' +
											// debug 用. check parser, test
											// if parser working properly.
											wiki_API.title_link_of(page_data));
										}
									}

									if (options.with_diff.LCS) {
										// console.trace([ from, to ]);
										row.diff = library_namespace.LCS(from,
												to, options.with_diff);

									} else {
										row.diff = from.diff_with(to,
												options.with_diff);
									}
								}

								if (configuration_row === row) {
									configuration_adapter();
									run_next();
									return;
								}

								check_result(listener.call(options, row, index,
										rows), run_next);
							}, page_options);

						}, check_and_receive_next);
						return;
					}

					// use options.with_content as the options of wiki.page()
					if (options.with_content || configuration_row) {
						// TODO: 考慮所傳回之內容過大，i.e. 回傳超過 limit (12 MB)，被截斷之情形。
						session.page(rows, function(page_list, error) {
							if (error || !Array.isArray(page_list)) {
								// e.g., 還原編輯
								// wiki_API.page: Unknown response:
								// [{"batchcomplete":""}]
								if (error !== 'Unknown response') {
									library_namespace.error(error
											|| 'add_listener: No page got!');
									// console.trace(page_list, options);
								}
								receive_next();
								return;
							}

							// 配對。
							var page_id_hash = Object.create(null);
							page_list.forEach(function(page_data, index) {
								page_id_hash[page_data.pageid] = page_data;
							});
							rows.some(function(row, index) {
								if (false) {
									console.log('-'.repeat(40));
									console.log(JSON.stringify(row));
									console.log(JSON.stringify(
									//
									page_id_hash[row.pageid]));
								}
								Object.assign(row, page_id_hash[row.pageid]);
								if (configuration_row === row) {
									configuration_adapter();
									return;
								}

								return check_result(listener.call(options, row,
										index, rows));
							});
							// Release memory. 釋放被占用的記憶體。
							page_id_hash = page_list = null;
							check_and_receive_next();

						}, Object.assign(Object.create(null),
						//
						options.with_content, {
							// Deprecated: rvdiffto, rvcontentformat
							// rvdiffto : 'prev',
							// rvcontentformat : 'text/javascript',
							// is_id : true,
							multi : true
						}));
						return;
					}

					// 除非設定 options.input_Array，否則單筆單筆輸入。
					if (options.input_Array) {
						check_result(listener.call(options, rows));
					} else {
						rows.some(function(row, index, rows) {
							return check_result(listener.call(options, row,
									index, rows));
						}, options);
					}

				} else if (options.even_empty) {
					// default: skip empty, 除非設定 options.even_empty.
					check_result(listener.call(options,
					//
					options.input_Array ? rows : {
						// 模擬rows單筆之結構。
						row : Object.create(null)
					}));
				}

				check_and_receive_next();

			}, recent_options);
		}

		receive();
	}

	// wiki.listen()
	wiki_API.listen = add_listener;

	// ================================================================================================================
	// Wikimedia dump

	/**
	 * 取得最新之 Wikimedia dump。
	 * 
	 * assert: library_namespace.platform.nodejs === true
	 * 
	 * TODO: using
	 * /public/dumps/public/zhwiki/latest/zhwiki-latest-pages-articles.xml.bz2
	 * 
	 * @param {String}[wiki_site_name]
	 *            project code name. e.g., 'enwiki'
	 * @param {Function}callback
	 *            回調函數。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @see https://en.wikipedia.org/wiki/Wikipedia:Database_download#Where_do_I_get_it.3F
	 * 
	 * @inner
	 */
	function get_latest_dump(wiki_site_name, callback, options) {
		if (false && !wiki_API.wmflabs) {
			// 最起碼須有 bzip2, wget 特定版本輸出訊息 @ /bin/sh
			// Wikimedia Toolforge (2017/8 之前舊稱 Tool Labs)
			// https://wikitech.wikimedia.org/wiki/Labs_labs_labs#Toolforge
			throw new Error('Only for Wikimedia Toolforge!');
		}

		if (typeof wiki_site_name === 'function'
				&& typeof callback !== 'function' && !options) {
			// shift arguments
			options = callback;
			callback = wiki_site_name;
			wiki_site_name = null;
		}

		// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
		options = library_namespace.new_options(options);

		if (!wiki_site_name) {
			// console.log(options);
			// console.log(options[KEY_SESSION]);
			// throw new Error(options[KEY_SESSION].language);
			wiki_site_name = wiki_API.site_name(options || options.project
					|| options.family);
		}

		// dump host: http "301 Moved Permanently" to https
		var host = options.host || 'https://dumps.wikimedia.org/',
		// e.g., '20160305'.
		latest = options.latest;
		if (!latest) {
			library_namespace.get_URL(
			// Get the latest version.
			host + wiki_site_name + '/', function(XMLHttp) {
				var response = XMLHttp.responseText;
				var latest = 0, previous, matched,
				//
				PATTERN = / href="(\d{8,})/g;
				while (matched = PATTERN.exec(response)) {
					matched = Math.floor(matched[1]);
					if (latest < matched)
						previous = latest, latest = matched;
				}
				// 不動到原來的 options。
				options = Object.clone(options);
				// default: 'latest'
				options.latest = latest || 'latest';
				if (previous)
					options.previous = previous;
				get_latest_dump(wiki_site_name, callback, options);
			});
			return;
		}

		var directory = options.directory || './',
		//
		filepath = options.filepath || options.filename || wiki_site_name + '-'
				+ latest + '-pages-articles.xml';

		/**
		 * <code>
		head -n 80 zhwiki-20160305-pages-meta-current1.xml
		less zhwiki-20160305-pages-meta-current1.xml
		tail -n 80 zhwiki-20160305-pages-meta-current1.xml
		</code>
		 */

		/**
		 * e.g., <code>
		callback = function(data) { console.log(data); };
		latest = '20160305';
		wiki_site_name = 'enwiki';
		// directory to restore dump files.
		// 指定 dump file 放置的 directory。
		// e.g., '/shared/cache/', '/shared/dumps/', '~/dumps/'
		// https://wikitech.wikimedia.org/wiki/Help:Toolforge/Developing#Using_the_shared_Pywikibot_files_.28recommended_setup.29
		// /shared/: shared files
		dump_directory = '/shared/cache/'
		filepath = wiki_site_name + '-' + latest + '-pages-articles-multistream-index.txt';
		</code>
		 */

		// 若是目標目錄不存在/已刪除則嘗試創建之。
		try {
			node_fs.statSync(directory);
		} catch (e) {
			library_namespace.info('get_latest_dump: ' + '存放 dump file 的目錄['
					+ directory + ']不存在/已刪除，嘗試創建之。');
			node_fs.mkdirSync(directory, parseInt('777', 8));
			node_fs.writeFileSync(directory
					+ '_FEEL_FREE_TO_REMOVE_THIS_DIRECTORY_ANYTIME', '');
			// 若是沒有辦法創建目錄，那就直接throw。
		}

		var data_file_OK;
		try {
			// check if data file exists and big enough
			data_file_OK = node_fs.statSync(directory + filepath).size > 1e7;
		} catch (e) {
		}

		if (data_file_OK) {
			library_namespace.log('get_latest_dump: Using data file (.xml): ['
					+ directory + filepath + ']');
			callback(directory + filepath);
			return;
		}

		// ----------------------------------------------------

		function extract() {
			library_namespace.log('get_latest_dump.extract: ' + 'Extracting ['
					+ source_directory + archive + '] to [' + directory
					+ filepath + ']...');
			// share the xml dump file. 應由 caller 自行設定。
			// process.umask(parseInt('0022', 8));
			require('child_process').exec(
			//
			'/bin/bzip2 -cd "' + source_directory + archive + '" > "'
			//
			+ directory + filepath + '"', function(error, stdout, stderr) {
				if (error) {
					library_namespace.error(error);
				} else {
					library_namespace.log('get_latest_dump.extract: '
					//
					+ 'Done. Running callback...');
				}
				callback(directory + filepath);
			});
		}

		var public_dumps_directory = '/public/dumps/public/',
		// search the latest file in the local directory.
		// https://wikitech.wikimedia.org/wiki/Help:Tool_Labs#Dumps
		// 可在 /public/dumps/public/zhwiki/ 找到舊 dumps。 (using `df -BT`)
		// e.g.,
		// /public/dumps/public/zhwiki/20160203/zhwiki-20160203-pages-articles.xml.bz2
		source_directory, archive = options.archive || filepath + '.bz2';

		if (wiki_API.wmflabs) {
			source_directory = public_dumps_directory + wiki_site_name + '/'
					+ latest + '/';
			library_namespace.debug('Check if public dump archive exists: ['
					+ source_directory + archive + ']', 1, 'get_latest_dump');
			try {
				// 1e7: Only using the cache when it exists and big enough.
				// So we do not using node_fs.accessSync() only.
				if (node_fs.statSync(source_directory + archive).size > 1e7) {
					library_namespace
							.log('get_latest_dump: Using public dump archive file ['
									+ source_directory + archive + '].');
					extract();
					return;
				}
			} catch (e) {
			}
		}

		// ----------------------------------------------------

		source_directory = directory;

		library_namespace.debug('Check if file exists: [' + source_directory
				+ archive + ']', 1, 'get_latest_dump');
		try {
			if (node_fs.statSync(source_directory + archive).size > 1e7) {
				library_namespace.log('get_latest_dump: ' + 'Archive ['
						+ source_directory + archive + '] exists.');
				extract();
				return;
			}
		} catch (e) {
		}

		// ----------------------------------------------------

		library_namespace.log('get_latest_dump: Try to save archive to ['
				+ source_directory + archive + ']...');
		// https://nodejs.org/api/child_process.html
		var child = require('child_process').spawn('/usr/bin/wget',
		// -O=""
		[ '--output-document=' + source_directory + archive,
		// 經測試，採用 .spawn() 此種方法毋須考慮 '"' 之類 quote 的問題。
		host + wiki_site_name + '/' + latest + '/' + archive ]);

		child.stdout.setEncoding('utf8');
		child.stderr.setEncoding('utf8');

		/**
		 * http://stackoverflow.com/questions/6157497/node-js-printing-to-console-without-a-trailing-newline
		 * 
		 * In Windows console (Linux, too), you should replace '\r' with its
		 * equivalent code \033[0G:
		 */
		child.stdout.on('data', function(data) {
			library_namespace.log_temporary(data);
		});

		child.stderr.on('data', function(data) {
			data = data.toString('utf8');
			/**
			 * <code>
			 e.g.,
			259000K .......... .......... .......... .......... .......... 21%  282M 8m26s
			999950K .......... .......... .......... .......... .......... 82% 94.2M 1m46s
			1000000K .......... .......... .......... .......... .......... 82%  103M 1m46s
			</code>
			 */
			// [ all, downloaded, percentage, speed, remaining 剩下時間 ]
			var matched = data.match(/([^\n\.]+)[.\s]+(\d+%)\s+(\S+)\s+(\S+)/);
			if (matched) {
				data = matched[2] + '  ' + matched[1] + '  ' + matched[4]
						+ '                    \r';
			} else if (data.includes('....') || /\d+[ms]/.test(data)
					|| /\.\.\s*\d+%/.test(data))
				return;
			process.stderr.write(data);
		});

		child.on('close', function(error_code) {
			if (error_code) {
				library_namespace.error('get_latest_dump: ' + 'Error code '
						+ error_code);
				// 有時最新版本可能 dump 到一半，正等待中。
				if (options.previous) {
					library_namespace.info(
					// options.previous: latest 的前一個版本。
					'get_latest_dump: Use previous version: ['
							+ options.previous + '].');
					options.latest = options.previous;
					delete options.previous;
					get_latest_dump(wiki_site_name, callback, options);
				} else {
					callback();
				}
				return;
			}

			library_namespace.log('get_latest_dump: ' + 'Got archive file ['
					+ source_directory + archive + '].');
			extract();
		});
	}

	/**
	 * 還原 XML text 成原先之文本。
	 * 
	 * @param {String}xml
	 *            XML text
	 * 
	 * @returns {String}還原成原先之文本。
	 * 
	 * @inner
	 */
	function unescape_xml(xml) {
		return xml.replace(/&quot;/g, '"')
		// 2016/3/11: Wikimedia dumps do NOT include '&apos;'.
		.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
		// MUST be the last one.
		.replace(/&amp;/g, '&');
	}

	/**
	 * Parse Wikimedia dump xml text.
	 * 
	 * @param {String}xml
	 *            xml text
	 * @param {ℕ⁰:Natural+0}[start_index]
	 *            start index to parse.
	 * @param {Function}[filter]
	 *            filter :<br />
	 *            function(pageid, revid) { return {Boolean}need_process; }
	 * 
	 * @returns {Object}page_data =
	 *          {pageid,ns,title,revisions:[{revid,timestamp,'*'}]}
	 */
	function parse_dump_xml(xml, start_index, filter) {
		if (!(start_index >= 0))
			start_index = 0;

		// 主要頁面內容所在。
		var revision_index = xml.indexOf('<revision>', start_index);
		if (revision_index === NOT_FOUND
		// check '<model>wikitext</model>'
		// || xml.indexOf('<model>wikitext</model>') === NOT_FOUND
		) {
			// 有 end_mark '</page>' 卻沒有 '<revision>'
			library_namespace.error('parse_dump_xml: ' + 'Bad data:\n'
					+ xml.slice(0, index));
			return;
		}

		var pageid = xml.between('<id>', '</id>', start_index) | 0,
		// ((revid|0)) 可能出問題。
		revid = Math.floor(xml.between('<id>', '</id>', revision_index));

		if (filter && !filter(pageid, revid)) {
			if (false)
				library_namespace.debug('Skip id ' + pageid, 4,
						'parse_dump_xml');
			return;
		}

		// 模擬 revisions
		// 注意: 這必須依照 revisions model 變更!
		var revision = {
			// rev_id
			revid : revid,
			parentid : Math.floor(xml.between('<parentid>', '</parentid>',
					revision_index)),
			minor : xml.slice(revision_index).includes('<minor />'),
			user : unescape_xml(xml.between('<username>', '</username>',
					revision_index)),
			// e.g., '2000-01-01T00:00:00Z'
			timestamp : xml.between('<timestamp>', '</timestamp>',
					revision_index),
			slots : {
				main : {
					contentmodel : xml.between('<model>', '</model>',
							revision_index),
					contentformat : xml.between('<format>', '</format>',
							revision_index),
					// old: e.g., '<text xml:space="preserve" bytes="80">'??
					// 2016/3/11: e.g., '<text xml:space="preserve">'
					// 2020/5/16: <text bytes="41058" xml:space="preserve">
					'*' : unescape_xml(xml.between('<text ', '</text>',
							revision_index).between('>'))
				}
			},
			comment : unescape_xml(xml.between('<comment>', '</comment>',
					revision_index))
		};

		if (revision.minor)
			revision.minor = '';
		else
			delete revision.minor;

		// page_data 之 structure 按照 wiki API 本身之 return
		// page_data = {pageid,ns,title,revisions:[{revid,timestamp,'*'}]}
		// includes redirection 包含重新導向頁面.
		// includes non-ns0.
		var page_data = {
			pageid : pageid,
			ns : xml.between('<ns>', '</ns>', start_index) | 0,
			title : unescape_xml(xml
					.between('<title>', '</title>', start_index)),
			revisions : [ revision ]
		};

		return page_data;
	}

	// @inner
	function almost_latest_revid_of_dump(filepath, callback, options) {
		// 65536 === Math.pow(2, 16); as a block
		var buffer = Buffer.alloc(65536);
		var position = Math.max(0, node_fs.statSync(filepath).size
				- buffer.length);
		// file descriptor
		var fd = node_fs.openSync(filepath, 'r');
		var latest_revid_of_dump;

		while (true) {
			node_fs.readSync(fd, buffer, 0, buffer.length, position);
			var contents = buffer.toString('utf8');
			var matched, PATTERN = /<revision>[\s\n]*<id>(\d{1,16})<\/id>[\s\S]*?$/g;
			// Warning: almost_latest_revid_of_dump() 只能快速取得最新創建幾篇文章的最新
			// revid，而非最後的 revid。
			while (matched = PATTERN.exec(contents)) {
				matched = +matched[1];
				if (!(latest_revid_of_dump > matched))
					latest_revid_of_dump = matched;
			}
			if (latest_revid_of_dump > 0) {
				callback(latest_revid_of_dump);
				return;
			}

			if (position > 0) {
				position = Math.max(0, position - buffer.length
				// +256: 預防跳過 /<id>(\d{1,16})<\/id>/。
				// assert: buffer.length > 256
				+ 256);
			} else {
				// No data get.
				callback();
				return;
			}
		}
	}

	/**
	 * 讀取/parse Wikimedia dumps 之 xml 檔案。
	 * 
	 * assert: library_namespace.platform.nodejs === true
	 * 
	 * 注意: 必須自行 include 'application.platform.nodejs'。 <code>
	   CeL.run('application.platform.nodejs');
	 * </code><br />
	 * 
	 * @param {String}[filepath]
	 *            欲讀取的 .xml 檔案路徑。
	 * @param {Function}for_each_page
	 *            Calling for each page. for_each_page({Object}page_data)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {String}file path
	 * 
	 * @see <a href="http://dumps.wikimedia.org/backup-index.html">Wikimedia
	 *      database backup dumps</a>
	 * @see https://www.mediawiki.org/wiki/Help:Export
	 * 
	 * @since 2016/3/11
	 */
	function read_dump(filepath, for_each_page, options) {
		if (typeof filepath === 'function'
				&& typeof for_each_page !== 'function' && !options) {
			// shift arguments
			options = for_each_page;
			for_each_page = filepath;
			filepath = null;
		}

		if (typeof filepath !== 'string' || !filepath.endsWith('.xml')) {
			if (filepath) {
				library_namespace.log('read_dump: ' + 'Invalid file path: ['
						+ filepath + '], try to get the latest dump file...');
			}
			get_latest_dump(filepath, function(filepath) {
				read_dump(filepath, for_each_page, options);
			}, options);
			// 警告: 無法馬上取得檔案時，將不會回傳任何資訊！
			return;
		}

		options = library_namespace.setup_options(options);

		if (options.get_latest_revid) {
			almost_latest_revid_of_dump(filepath, for_each_page, options);
			return;
		}

		if (typeof options.first === 'function') {
			options.first(filepath);
		}

		var run_last = function(quit_operation) {
			library_namespace.debug('Finish work.', 1, 'read_dump');
			if (run_last && typeof options.last === 'function') {
				options.last.call(file_stream, anchor, quit_operation);
			}
			// run once only.
			run_last = null;
		},
		/** {String}file encoding for dump file. */
		encoding = options.encoding || wiki_API.encoding,
		/** {String}處理中之資料。 */
		buffer = '',
		/** end mark */
		end_mark = '</page>',
		/**
		 * 錨/定位點.<br />
		 * anchor[pageid] = [ position of the xml dump file, page length in
		 * bytes ]
		 * 
		 * @type {Array}
		 */
		anchor = options.anchor && [],
		//
		filter = options.filter,
		/**
		 * dump file stream.
		 * 
		 * filepath: XML file path.<br />
		 * e.g., 'enwiki-20160305-pages-meta-current1.xml'
		 * 
		 * @type {String}
		 */
		file_stream = new node_fs.ReadStream(filepath, {
			// 加大 buffer。據測試，改到 1 MiB 反而慢。
			highWaterMark : 128 * 1024
		}),
		/**
		 * 掌握進度用。 (100 * file_status.pos / file_status.size | 0) + '%'<br />
		 * 此時 stream 可能尚未初始化，(file_stream.fd===null)，<br />
		 * 因此不能使用 fs.fstatSync()。
		 * 
		 * @type {Object}
		 */
		// file_status = node_fs.fstatSync(file_stream.fd);
		// file_status = node_fs.statSync(filepath),
		/** {Natural}檔案長度。掌握進度用。 */
		// file_size = node_fs.statSync(filepath).size,
		/**
		 * byte counter. 已經處理過的資料長度，為 bytes，非 characters。指向 buffer 起頭在 file
		 * 中的位置。
		 * 
		 * @type {ℕ⁰:Natural+0}
		 */
		bytes = 0;
		// 若是預設 encoding，會造成 chunk.length 無法獲得正確的值。
		// 若是為了能掌握進度，則不預設 encoding。
		// 2016/3/26: 但這會造成破碎/錯誤的編碼，只好放棄。
		file_stream.setEncoding(encoding);

		file_stream.on('error', options.onerror || function(error) {
			library_namespace.error('read_dump: '
			//
			+ 'Error occurred: ' + error);
		});

		/**
		 * 工作流程: 循序讀取檔案內容。每次讀到一個區塊/段落 (chunk)，檢查是不是有結束標記。若是沒有，則得繼續讀下去。<br />
		 * 有結束標記，則取出開始標記至結束標記中間之頁面文字資料，紀錄起始與結尾檔案位置，放置於 anchor[pageid]，並開始解析頁面。<br />
		 * 此時 bytes 指向檔案中 start position of buffer，可用來設定錨/定位點。
		 */

		library_namespace.info('read_dump: ' + 'Starting read dump file...');

		/**
		 * Parse Wikimedia dump xml file slice.
		 * 
		 * TODO: 把工具函數寫到 application.platform.nodejs 裡面去。
		 */
		function parse_buffer(index) {
			index = buffer.indexOf(end_mark, index);
			if (index === NOT_FOUND)
				// 資料尚未完整，繼續讀取。
				return;

			// 回頭找 start mark '<page>'
			var start_index = buffer.lastIndexOf('<page>', index);
			if (start_index === NOT_FOUND) {
				throw new Error('parse_buffer: '
						+ 'We have end mark without start mark!');
			}

			var page_data = parse_dump_xml(buffer, start_index, filter);
			if (!page_data) {
				if (false)
					library_namespace.debug(
					//
					'跳過此筆紀錄。 index: ' + index + ', buffer: ' + buffer.length,
							3, 'parse_dump_xml');
				bytes += Buffer.byteLength(buffer.slice(0, index
						+ end_mark.length), encoding);
				// 截斷。
				buffer = buffer.slice(index + end_mark.length);
				// 雖然跳過此筆紀錄，但既然還能處理，便需要繼續處理。
				return true;
			}

			var pageid = page_data.pageid,
			//
			start_pos = Buffer.byteLength(buffer.slice(0, start_index),
					encoding),
			// 犧牲效能以確保採用無須依賴 encoding 特性之實作法。
			page_bytes = Buffer.byteLength(buffer.slice(start_index, index
					+ end_mark.length), encoding),
			// [ start position of file, length in bytes ]
			page_anchor = [ bytes + start_pos, page_bytes ];
			if (false && anchor && (pageid in anchor))
				library_namespace.error('parse_buffer: '
						+ 'Duplicated page id: ' + pageid);
			if (anchor)
				anchor[pageid] = page_anchor;
			// 跳到下一筆紀錄。
			bytes += start_pos + page_bytes;
			// 截斷。
			buffer = buffer.slice(index + end_mark.length);

			if (wiki_API.quit_operation ===
			/**
			 * function({Object}page_data, {Natural}position: 到本page結束時之檔案位置,
			 * {Array}page_anchor)
			 */
			for_each_page(page_data, bytes, page_anchor/* , file_status */)) {
				// console.log(file_stream);
				library_namespace.info('read_dump: '
						+ 'Quit operation, 中途跳出作業...');
				file_stream.end();
				// Release memory. 釋放被占用的記憶體。
				buffer = null;
				run_last(true);
				return;
			}

			return true;
		}

		file_stream.on('data', function(chunk) {

			// 之前的 buffer 已經搜尋過，不包含 end_mark。
			var index = buffer.length;

			/**
			 * 當未採用 .setEncoding(encoding)，之後才 += chunk.toString(encoding)；
			 * 則一個字元可能被切分成兩邊，這會造成破碎/錯誤的編碼。
			 * 
			 * This properly handles multi-byte characters that would otherwise
			 * be potentially mangled if you simply pulled the Buffers directly
			 * and called buf.toString(encoding) on them. If you want to read
			 * the data as strings, always use this method.
			 * 
			 * @see https://nodejs.org/api/stream.html#stream_class_stream_readable
			 */
			buffer += chunk;
			// buffer += chunk.toString(encoding);

			// --------------------------------------------

			/**
			 * 以下方法廢棄 deprecated。 an alternative method: 另一個方法是不設定
			 * file_stream.setEncoding(encoding)，而直接搜尋 buffer 有無 end_mark '</page>'。直到確認不會打斷
			 * character，才解 Buffer。若有才分割、執行 .toString(encoding)。但這需要依賴最終
			 * encoding 之特性，並且若要採 Buffer.concat() 也不見得更高效， and
			 * Buffer.prototype.indexOf() needs newer node.js. 或許需要自己寫更底層的功能，直接
			 * call fs.read()。此外由於測試後，發現瓶頸在網路傳輸而不在程式碼執行，因此不如犧牲點效能，確保採用無須依賴
			 * encoding 特性之實作法。
			 */

			;

			// --------------------------------------------
			while (parse_buffer(index))
				// 因為 buffer 已經改變，reset index.
				index = 0;

			// 頁面大小系統上限 2,048 KB = 2 MB。
			if (buffer.length > 3e6) {
				library_namespace.error('read_dump: ' + 'buffer too long ('
						+ buffer.length
						+ ' characters)! Paused! 有太多無法處理的 buffer，可能是格式錯誤？');
				console.log(buffer.slice(0, 1e3) + '...');
				file_stream.pause();
				// file_stream.resume();
				// throw buffer.slice(0,1e3);
			}
		});

		file_stream.on('end', run_last);

		// * @returns {String}file path
		// * @returns {node_fs.ReadStream}file handler
		// return file_stream;
	}

	wiki_API.read_dump = read_dump;

	// ================================================================================================================

	/**
	 * 由 Wikimedia Toolforge 上的 database replication 讀取所有 ns0，且未被刪除頁面最新修訂版本之版本編號
	 * rev_id (包含重定向)。<br />
	 * 從 `page` 之 page id 確認 page 之 namespace，以及未被刪除。然後選擇其中最大的 revision id。
	 * 
	 * should get: { i: page id, r: latest revision id }
	 * 
	 * AND `page`.`page_is_redirect` = 0
	 * 
	 * https://stackoverflow.com/questions/14726789/how-can-i-change-the-default-mysql-connection-timeout-when-connecting-through-py
	 * 
	 * @type {String}
	 * 
	 * @see https://www.mediawiki.org/wiki/Manual:Page_table#Sample_MySQL_code
	 *      https://phabricator.wikimedia.org/diffusion/MW/browse/master/maintenance/tables.sql
	 *      https://www.mediawiki.org/wiki/API:Database_field_and_API_property_associations
	 */
	var all_revision_SQL = 'SELECT `page`.`page_id` AS `i`, `page`.`page_latest` AS `r` FROM `page` INNER JOIN `revision` ON `page`.`page_latest` = `revision`.`rev_id` WHERE `revision`.`rev_id` > 0 AND `revision`.`rev_deleted` = 0 AND `page`.`page_namespace` = 0';

	if (false) {
		/**
		 * 採用此 SQL 之極大問題: page.page_latest 並非最新 revision id.<br />
		 * the page.page_latest is not the latest revision id of a page in
		 * Wikimedia Toolforge database replication.
		 */
		all_revision_SQL = 'SELECT `page_id` AS `i`, `page_latest` AS `l` FROM `page` p INNER JOIN `revision` r ON p.page_latest = r.rev_id WHERE `page_namespace` = 0 AND r.rev_deleted = 0';
		/**
		 * 2019/7 deprecated: too late
		 */
		all_revision_SQL = 'SELECT `rev_page` AS `i`, MAX(`rev_id`) AS `r` FROM `revision` INNER JOIN `page` ON `page`.`page_id` = `revision`.`rev_page` WHERE `page`.`page_namespace` = 0 AND `revision`.`rev_deleted` = 0 GROUP BY `rev_page`';
	}
	if (false) {
		// for debug.
		all_revision_SQL += ' LIMIT 8';
	}

	/**
	 * 應用功能: 遍歷所有頁面。 CeL.wiki.traversal()
	 * 
	 * TODO: 配合 revision_cacher，進一步加快速度？
	 * 
	 * @param {Object}[config]
	 *            configuration
	 * @param {Function}for_each_page
	 *            Calling for each page. for_each_page({Object}page_data)
	 */
	function traversal_pages(config, for_each_page) {
		if (typeof config === 'function' && for_each_page === undefined) {
			// shift arguments.
			for_each_page = config;
			config = Object.create(null);
		} else {
			// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
			config = library_namespace.new_options(config);
		}

		if (config.use_dump_only) {
			library_namespace.debug('use dump only: '
					+ '僅僅使用 dump，不採用 API 取得最新頁面內容。', 1, 'traversal_pages');
			// @see process_dump.js
			if (config.use_dump_only === true) {
				// 這邊的 ((true)) 僅表示要使用，並採用預設值；不代表設定 dump file path。
				config.use_dump_only = null;
			}
			read_dump(config.use_dump_only, for_each_page, {
				// 一般來說只會用到 config.last，將在本函數中稍後執行，
				// 因此先不開放 config.first, config.last。

				// options.first(filepath) of read_dump()
				// first : config.first,

				// options.last.call(file_stream, anchor, quit_operation)
				// of read_dump()
				// last : config.last,

				// directory to restore dump files.
				// 指定 dump file 放置的 directory。
				// e.g., '/shared/cache/', '/shared/dumps/', '~/dumps/'
				// https://wikitech.wikimedia.org/wiki/Help:Tool_Labs/Developing#Using_the_shared_Pywikibot_files_.28recommended_setup.29
				// /shared/: shared files
				directory : config.dump_directory
			});
			return;
		}

		// 若不想使用 dump，可不設定 .filter。
		// 經測試，全部使用 API，最快可入50分鐘內，一般在 1-2 hours 左右。
		var dump_file;
		// 若 config.filter 非 function，表示要先比對 dump，若修訂版本號相同則使用之，否則自 API 擷取。
		// 並以 try_dump() 當作 filter()。
		// 設定 config.filter 為 ((true)) 表示要使用預設為最新的 dump，
		// 否則將之當作 dump file path。
		if (config.filter && (typeof config.filter !== 'function')) {
			dump_file = config.filter;
			if (dump_file === true) {
				// 這邊的 ((true)) 僅表示要使用，並不代表設定 dump file path。
				dump_file = null;
			}
		}

		var latest_revid_of_dump = config.latest_revid_of_dump;
		if (!(latest_revid_of_dump > 0)) {
			read_dump(dump_file, function(latest_revid_of_dump) {
				config.latest_revid_of_dump = latest_revid_of_dump;
				traversal_pages(config, for_each_page);
			}, {
				get_latest_revid : true,
				directory : config.dump_directory
			});
			return;
		}

		/** {Array}id/title list */
		var id_list, rev_list,
		//
		use_language = wiki_API.site_name(config, {
			get_all_properties : true
		}).language,
		/** {Object}用在 wiki_API.cache 之 configuration。 */
		cache_config = {
			// all title/id list
			file_name : config.file_name
			// all_newer_pages.*.json 存有當前語言維基百科所有較新頁面的id以及最新版本 (*:當前語言)
			|| traversal_pages.list_file + '.' + use_language + '.json',
			operator : function(list) {
				if (!Array.isArray(list)) {
					throw new Error('traversal_pages: No list get!');
				}
				if (list.length === 3
						&& JSON.stringify(list[0]) === JSON
								.stringify(traversal_pages.id_mark)) {
					library_namespace.info('traversal_pages: '
					// cache file 內容來自 The production replicas (database)，
					// 為經過下方 generate_revision_list() 整理過之資料。
					+ '此資料似乎為 page id，來自 production replicas: ['
							+ this.file_name + ']');
					// Skip list[0] = traversal_pages.id_mark
					rev_list = list[2];
					list = list[1];
					// 讀取 production replicas 時，儲存的是 pageid。
					list.is_id = true;
				} else {
					library_namespace.error('traversal_pages: '
					//
					+ 'cache 檔案未設定 rev_list：可能是未知格式？ ' + this.file_name);
				}
				id_list = list;
			}
		};

		// default: 採用 page_id 而非 page_title 來 query。
		var is_id = 'is_id' in config ? config.is_id : true;
		// node.js v0.11.16: In strict mode code, functions can only be declared
		// at top level or immediately within another function.
		function run_SQL_callback(error, rows, fields) {
			if (error) {
				library_namespace.error('traversal_pages: '
				//
				+ 'Error reading database replication!');
				library_namespace.error(error);
				config.no_database = error;
				delete config.list;
			} else {
				library_namespace.log('traversal_pages: ' + 'All '
						+ rows.length + ' pages. 轉換中...');
				// console.log(rows.slice(0, 2));
				var id_list = [], rev_list = [];
				rows.forEach(function(row) {
					// .i, .r: @see all_revision_SQL
					id_list.push(is_id ? row.i | 0 : row.i.toString('utf8'));
					rev_list.push(row.r);
				});
				config.list = [ traversal_pages.id_mark, id_list, rev_list ];
				// config.is_id = is_id;
			}
			// 因為已經取得所有列表，重新呼叫traversal_pages()。
			traversal_pages(config, for_each_page);
		}
		function generate_revision_list() {
			library_namespace.info('traversal_pages: '
			// Wikimedia Toolforge database replicas.
			+ '嘗試讀取 Wikimedia Toolforge 上之 database replication 資料，'
					+ '一次讀取完版本號 ' + latest_revid_of_dump
					+ ' 之後，所有頁面最新修訂版本之版本號 rev_id...');
			var SQL = is_id ? all_revision_SQL : all_revision_SQL.replace(
					/page_id/g, 'page_title');
			SQL = SQL.replace(/(`rev_id` > )0 /, '$1' + latest_revid_of_dump
					+ ' ');
			// assert: 當有比 dump_fire 裡面的更新的版本時，會被篩選出。
			var SQL_config = config && config.SQL_config
			//
			|| wiki_API.new_SQL_config
			// 光從 use_language 無法獲得如 wikinews 之資訊。
			&& wiki_API.new_SQL_config(config[KEY_SESSION] || use_language);
			wiki_API.run_SQL(SQL, run_SQL_callback, SQL_config);
			return wiki_API.cache.abort;
		}

		if (Array.isArray(config.list)) {
			library_namespace.debug('採用輸入之 list，列表長度 ' + config.list.length
					+ '。', 1, 'traversal_pages');
			cache_config.list = config.list;

		} else if (wiki_API.wmflabs && !config.no_database) {
			library_namespace.debug('若沒有 cache，則嘗試讀取 database 之資料。', 1,
					'traversal_pages');

			cache_config.list = generate_revision_list;

		} else {
			library_namespace.debug('採用 API type = allpages。', 1,
					'traversal_pages');
			cache_config.type = 'allpages';
		}

		function cache__for_each_page() {
			// 有設定 config[KEY_SESSION] 才能獲得如 bot 之類，一次讀取/操作更多頁面的好處。
			var session = wiki_API.session_of_options(config)
			//
			|| new wiki_API(config.user, config.password, config.language);
			// includes redirection 包含重新導向頁面.
			library_namespace.log('traversal_pages: ' + '開始遍歷所有 dump 頁面...');

			/**
			 * 工作原理:<code>

			 * 經測試，讀取 file 會比讀取 MariaDB 快，且又更勝於經 API 取得資料。
			 * 經測試，遍歷 xml dump file 約 3分鐘(see process_dump.js)，會比隨機存取快得多。
			 * database replicas @ Wikimedia Toolforge 無 `text` table，因此實際頁面內容不僅能經過 replicas 存取。

			# 先將最新的 xml dump file 下載到本地(實為 network drive)並解開: read_dump()
			# 由 Wikimedia Toolforge database replication 讀取所有 ns0 且未被刪除頁面最新修訂版本之版本號 rev_id (包含重定向): traversal_pages() + all_revision_SQL
			# 遍歷 xml dump file，若 dump 中為最新修訂版本，則先用之 (約 95%)；純粹篩選約需近 3 minutes: try_dump()
			# 經 API 讀取餘下 dump 後近 5% 更動過的頁面內容: traversal_pages() + wiki_API.prototype.work
			# 於 Wikimedia Toolforge，解開 xml 後；自重新抓最新修訂版本之版本號起，網路連線順暢時整個作業時間約 12分鐘。

			</code>
			 */

			function try_dump() {
				var start_read_time = Date.now(),
				// max_length = 0,
				count = 0, limit = config.limit,
				//
				file_size, rev_of_id = [], is_id = id_list.is_id;

				id_list.forEach(function(id, index) {
					if (id in rev_of_id)
						library_namespace.warn('traversal_pages: '
								+ '存在重複之id: ' + id);
					rev_of_id[id] = rev_list[index];
				});

				// Release memory. 釋放被占用的記憶體。
				id_list = null;
				rev_list = null;

				read_dump(dump_file,
				// e.g., /shared/cache/zhwiki-20200401-pages-articles.xml
				function(page_data, position, page_anchor) {
					// filter

					// TODO
					if (false && limit > 0 && count > limit) {
						library_namespace.log(count + '筆資料，已到 limit，跳出。');
					}

					if (++count % 1e4 === 0) {
						library_namespace.log(
						// 'traversal_pages: ' +
						wiki_API.estimated_message(
						//
						position, file_size, start_read_time,
						// e.g.,
						// "2730000 (99%): 21.326 page/ms [[Category:大洋洲火山岛]]"
						count) + '. ' + wiki_API.title_link_of(page_data));
					}

					// ----------------------------
					// Check data.

					if (false) {
						if (!CeL.wiki.content_of.page_exists(page_data)) {
							// error? 此頁面不存在/已刪除。
							return [ CeL.wiki.edit.cancel, '條目不存在或已被刪除' ];
						}
						if (page_data.ns !== 0
								&& page_data.title !== 'Wikipedia:サンドボックス') {
							return [ CeL.wiki.edit.cancel,
							// 本作業は記事だけを編集する
							'本作業僅處理條目命名空間或模板或 Category' ];
							throw new Error('非條目: '
							//
							+ wiki_API.title_link_of(page_data)
							//
							+ '! 照理來說不應該出現非條目的情況。');
						}

						/** {Object}revision data. 修訂版本資料。 */
						var revision = page_data && page_data.revisions
						// @see function parse_dump_xml()
						&& page_data.revisions[0],
						/** {Natural}所取得之版本編號。 */
						revid = revision && revision.revid;

						/** {String}page title = page_data.title */
						var title = CeL.wiki.title_of(page_data),
						/**
						 * {String}page content, maybe undefined. 條目/頁面內容 =
						 * CeL.wiki.revision_content(revision)
						 */
						content = CeL.wiki.content_of(page_data);

						// 當取得了多個版本，欲取得最新的一個版本：
						// content = CeL.wiki.content_of(page_data, 0);

						// 似乎沒 !page_data.title 這種問題。
						if (false && !page_data.title)
							library_namespace.warn('* No title: [['
									+ page_data.pageid + ']]!');

						// typeof content !== 'string'
						if (!content) {
							content =
							// e.g., 沒有頁面內容 or: 此頁面不存在/已刪除。
							// gettext_config:{"id":"no-content"}
							gettext('No content: ')
									+ CeL.wiki.title_link_of(page_data);
							// CeL.log(content);
							return [ CeL.wiki.edit.cancel, content ];
						}

						var last_edit_Date = CeL.wiki.content_of
								.edit_time(page_data);

						// [[Wikipedia:快速删除方针]]
						if (CeL.wiki.revision_content(revision)) {
							// max_length = Math.max(max_length,
							// CeL.wiki.revision_content(revision).length);

							// filter patterns

						} else {
							library_namespace.warn('* '
							// gettext_config:{"id":"no-content"}
							+ CeL.gettext('No content: ')
									+ CeL.wiki.title_link_of(page_data));
						}

						/** {Array} parsed page content 頁面解析後的結構。 */
						var parsed = CeL.wiki.parser(page_data).parse();
						// debug 用.
						// check parser, test if parser working properly.
						CeL.assert([ content, parsed.toString() ],
						// gettext_config:{"id":"wikitext-parser-checking-$1"}
						CeL.gettext('wikitext parser checking: %1', CeL.wiki
								.title_link_of(page_data)));
						if (CeL.wiki.content_of(page_data) !== parsed
								.toString()) {
							console.log(CeL.LCS(CeL.wiki.content_of(page_data),
									parsed.toString(), 'diff'));
							throw new Error('Parser error: '
									+ CeL.wiki.title_link_of(page_data));
						}

						// using for_each_subelement()
						parsed.each('link', function(token, index) {
							console.log(token);
						});
					}

					// 註記為 dump。可以 ((messages)) 判斷是在 .work() 中執行或取用 dump 資料。
					// page_data.dump = true;
					// page_data.dump = dump_file;

					// ------------------------------------
					// 有必要中途跳出時則須在 for_each_page() 中設定：
					// @ for_each_page(page_data, messages):
					if (false && need_quit) {
						if (messages) {
							// 當在 .work() 中執行時。
							messages.quit_operation = true;
							// 在 .edit() 時不設定內容。但照理應該會在 .page() 中。
							return;
						}
						// 當在本函數，下方執行時，不包含 messages。
						return CeL.wiki.quit_operation;
					}
					// ------------------------------------

					return for_each_page(page_data);

				}, {
					session : config[KEY_SESSION],
					// directory to restore dump files.
					directory : config.dump_directory,
					// options.first(filepath) of read_dump()
					first : function(xml_filepath) {
						dump_file = xml_filepath;
						try {
							file_size = node_fs.statSync(xml_filepath).size;
						} catch (e) {
							// 若不存在 dump_directory，則會在此出錯。
							if (e.code === 'ENOENT') {
								library_namespace.error('traversal_pages: '
										+ 'You need to create '
										+ 'the dump directory manually!');
							}
							throw e;
						}
					},
					// @see function parse_dump_xml(xml, start_index, filter)
					filter : function(pageid, revid) {
						if (!(pageid in rev_of_id)) {
							// 開始執行時，dump_file 裡面的是最新的頁面。
							// 注意: 若執行中有新的變更，不會 traversal 到本頁面最新版本！
							return true;
						}

						// Warning: almost_latest_revid_of_dump()
						// 只能快速取得最新創建幾篇文章的最新 revid，而非最後的 revid。
						if (latest_revid_of_dump < revid) {
							// assert: latest_revid_of_dump < revid
							latest_revid_of_dump = revid;
							// assert: revid <= rev_of_id[pageid]
							if (revid === rev_of_id[pageid]) {
								// 開始執行時，dump_file 裡面的是最新的頁面。
								// 注意: 若執行中有新的變更，不會 traversal 到本頁面最新版本！
								delete rev_of_id[pageid];
								return true;
							}
						}
					},
					// options.last.call(file_stream, anchor, quit_operation)
					// of read_dump()
					last : function(anchor, quit_operation) {
						var need_API = Object.keys(rev_of_id);
						need_API.is_id = is_id;

						// Release memory. 釋放被占用的記憶體。
						rev_of_id = null;

						// 警告: 這個數字可能不準確
						var all_articles = count + need_API.length;
						var percent = (1000 * count / all_articles | 0);
						percent = percent / 10;
						// e.g.,
						// "All 1491092 pages in dump xml file, 198.165 s."
						// includes redirection 包含重新導向頁面.
						library_namespace.log('traversal_pages: ' + 'All '
								+ count + '/' + all_articles
								+ ' pages using dump xml file (' + percent
								+ '%), '
								+ ((Date.now() - start_read_time) / 1000 | 0)
								+ ' s elapsed.');
						config.latest_revid_of_dump = latest_revid_of_dump;
						// library_namespace.set_debug(3);
						// 一般可以達到 95% 以上採用 dump file 的程度，10分鐘內跑完。
						run_work(need_API, quit_operation);
					}
				});
			}

			function run_work(id_list, quit_operation) {
				if (quit_operation) {
					library_namespace.info(
					// 直接結束作業
					'traversal_pages: 已中途跳出作業，不再讀取 production database。');
					// 模擬 wiki_API.prototype.work(config) 之config.last()，與之連動。
					// 此處僅能傳入 .work() 在執行 .last() 時提供的 arguments。
					// 但因為 .work() 在執行 .last() 時也沒傳入 arguments，
					// 因此此處亦不傳入 arguments。
					if (typeof config.last === 'function') {
						config.last();
					}
					return;
				}

				if (typeof config.filter === 'function')
					library_namespace.log('traversal_pages: '
							+ '開始讀取 production，執行 .work(): '
							+ (id_list && id_list.length) + ' pages...');
				session.work({
					is_id : id_list.is_id,
					no_message : true,
					no_edit : 'no_edit' in config ? config.no_edit : true,
					each : for_each_page,
					// 取得多個頁面內容所用之 options。
					// e.g., { rvprop : 'ids|timestamp|content' }
					// Warning: 這對經由 dump 取得之 page 無效！
					page_options : config.page_options,
					// run this at last.
					// 在wiki_API.prototype.work()工作最後執行此config.last()。
					// config.last(/* no meaningful arguments */)
					// 沒傳入 arguments的原因見前 "config.last();"。
					last : config.last
				}, id_list);
			}

			// 工作流程: config.filter() → run_work()

			if (config.filter && (typeof config.filter !== 'function')) {
				config.filter = try_dump;
			}

			if (typeof config.filter === 'function') {
				// preprocessor before running .work()
				// 可用於額外功能。
				// e.g., 若 revision 相同，從 dump 而不從 API 讀取。
				// id_list, rev_list 採用相同的 index。
				config.filter(run_work, for_each_page, id_list, rev_list);
			} else {
				run_work(id_list);
			}

		}

		wiki_API.cache(cache_config, cache__for_each_page, {
			// cache path prefix
			// e.g., task name
			prefix : config.directory
		});
	}

	/**
	 * ((traversal_pages.id_mark)) indicate it's page id instead of page title.
	 * 表示此 cache list 為 page id，而非 page title。 須採用絕不可能用來當作標題之 value。<br />
	 * 勿用過於複雜、無法 JSON.stringify() 或過於簡單的結構。
	 */
	traversal_pages.id_mark = {
		id_mark : 'id_mark'
	};

	/** {String}default list file name (will append .json by wiki_API.cache) */
	traversal_pages.list_file = 'all_newer_pages';

	// --------------------------------------------------------------------------------------------

	if (false) {
		(function() {
			/**
			 * usage of revision_cacher()
			 */

			var
			/** {revision_cacher}記錄處理過的文章。 */
			processed_data = new CeL.wiki.revision_cacher(base_directory
					+ 'processed.' + use_language + '.json');

			function for_each_page(page_data) {
				// Check if page_data had processed useing revid.
				if (processed_data.had(page_data)) {
					// skipped_count++;
					return [ CeL.wiki.edit.cancel, 'skip' ];
				}

				// 在耗費資源的操作後，登記已處理之 title/revid。其他為節省空間，不做登記。
				// 初始化本頁之 processed data: 只要處理過，無論成功失敗都作登記。
				var data_to_cache = processed_data.data_of(page_data);
				// or:
				// 注意: 只有經過 .data_of() 的才造出新實體。
				// 因此即使沒有要取得資料，也需要呼叫一次 .data_of() 以造出新實體、登記 page_data 之 revid。
				processed_data.data_of(page_data);
				processed_data.data_of(title, revid);

				// page_data is new than processed data

				// main task...

				// 成功才登記。失敗則下次重試。
				processed_data.remove(title);

				// 可能中途 killed, crashed，因此尚不能 write_processed()，
				// 否則會把 throw 的當作已處理過。
			}

			function finish_work() {
				// 由於造出 data 的時間過長，可能丟失 token，
				// 因此將 processed_data 放在 finish_work() 階段。
				processed_data.renew();
			}

			function onfail() {
				// 確保沒有因特殊錯誤產生的漏網之魚。
				titles.unique().forEach(processed_data.remove, processed_data);
			}

			// Finally: Write to cache file.
			processed_data.write();
		})();
	}

	/**
	 * 記錄處理過的文章。
	 * 
	 * @param {String}cache_file_path
	 *            記錄處理過的文章。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @constructor
	 */
	function revision_cacher(cache_file_path, options) {
		this.read(cache_file_path, options);
	}

	revision_cacher.prototype = {
		KEY_DATA : 'data',
		// id or 'revid'
		KEY_ID : 'id',
		encoding : wiki_API.encoding,
		// 連續跳過超過此頁面數 .show_skip 則會顯示訊息。
		show_skip : 9,

		// renew cache data
		renew : function() {
			// Object.create(null)
			this[this.KEY_DATA] = {};
		},
		read : function(cache_file_path, options) {
			if (typeof cache_file_path === 'object' && !options) {
				options = cache_file_path;
				cache_file_path = options.file;
			}
			if (cache_file_path) {
				this.file = cache_file_path;
			}

			var setup_new;
			if (options === true) {
				setup_new = false;
				options = {
					// Do NOT discard old data, use the old one.
					// 保存舊資料不廢棄。
					// 為了預防 this[this.KEY_DATA] 肥大，一般應將舊資料放在 this.cached，
					// 本次新處理的才放在 this[this.KEY_DATA]。
					preserve : true
				};
			} else {
				options = library_namespace.setup_options(options);
				setup_new = !options.preserve;
			}

			// this.options = options;

			// for .id_only, .KEY_ID, .encoding, .show_skip
			Object.assign(this, options);

			// reset skipped_count
			// this.skipped = 0;
			// 連續跳過計數。
			if (this.show_skip > 0) {
				this.continuous_skip = 0;
			}

			/**
			 * {Object}舊資料/舊結果報告。
			 * 
			 * cached_data[local page title] = { this.KEY_ID : 0,
			 * user_defined_data }
			 * 
			 * if set .id_only, then:<br />
			 * cached_data[local page title] = {Natural}revid<br />
			 * 這可進一步減少空間消耗。cached_data cache 已經處理完成操作的 data，但其本身可能也會占用一些以至大量RAM。
			 */
			var cached_data;
			try {
				cached_data = node_fs.readFileSync(cache_file_path,
						this.encoding);
			} catch (e) {
				// nothing get.
			}
			cached_data = cached_data && JSON.parse(cached_data) || {};
			this.cached = cached_data;

			if (setup_new) {
				Object.seal(cached_data);
				this.renew();
			} else {
				// this[this.KEY_DATA]: processed data
				this[this.KEY_DATA] = cached_data;
			}
		},
		write : function(cache_file_path, callback) {
			node_fs.writeFile(cache_file_path || this.file, JSON
					.stringify(this[this.KEY_DATA]), this.encoding, function(
					error) {
				// 因為此動作一般說來不會影響到後續操作，因此採用同時執行。
				library_namespace.debug('Write to cache file: done.', 1,
						'revision_cacher.write');
				if (typeof callback === 'function')
					callback(error);
			});
			return;

			node_fs.writeFileSync(cache_file_path || this.file, JSON
					.stringify(this[this.KEY_DATA]), this.encoding);
			library_namespace.debug('Write to cache file: done.', 1,
					'revision_cacher.write');
			if (typeof callback === 'function')
				callback(error);
		},

		// 注意: 若未 return true，則表示 page_data 為正規且 cache 中沒有，或較 cache 新的頁面資料。
		had : function(page_data) {
			// page_data 為正規?
			if (!wiki_API.content_of.page_exists(page_data)) {
				// error? 此頁面不存在/已刪除。
				return 'not exists';
			}

			var
			/** {String}page title = page_data.title */
			title = wiki_API.title_of(page_data),
			/** {Natural}所取得之版本編號。 */
			revid = wiki_API.content_of.revision(page_data);
			if (revid) {
				revid = revid.revid;
			}

			// console.log(CeL.wiki.content_of(page_data));

			library_namespace.debug(wiki_API.title_link_of(title) + ' revid '
					+ revid, 4, 'revision_cacher.had');
			if (title in this.cached) {
				var this_data = this[this.KEY_DATA], setup_new = this_data !== this.cached,
				//
				cached = this.cached[title], cached_revid = this.id_only ? cached
						: cached[this.KEY_ID];
				library_namespace.debug(wiki_API.title_link_of(title)
						+ ' cached revid ' + cached_revid, 4,
						'revision_cacher.had');
				if (cached_revid === revid) {
					if (setup_new) {
						// copy old data.
						// assert: this_data[title] is modifiable.
						this_data[title] = cached;
					}
					// this.skipped++;
					this.continuous_skip++;
					library_namespace.debug('Skip ' + this.continuous_skip
							+ ': ' + wiki_API.title_link_of(title) + ' revid '
							+ revid, 2, 'revision_cacher.had');
					return true;
				}
				// assert: cached_revid < revid
				// rebuild data
				if (setup_new) {
					delete this_data[title];
				}
				// 因為要顯示連續跳過計數資訊，因此不先跳出。
				// return false;
			}

			if (this.continuous_skip > 0) {
				if (this.continuous_skip > this.show_skip) {
					library_namespace.debug(
					// 實際運用時，很少會到這邊。
					'Skip ' + this.continuous_skip + ' pages.', 1,
							'revision_cacher.had');
				}
				this.continuous_skip = 0;
			}
		},
		// 注意: 只有經過 .data_of() 的才造出新實體。
		// 因此即使沒有要取得資料，也需要呼叫一次 .data_of() 以造出新實體、登記 page_data 之 revid。
		data_of : function(page_data, revid) {
			var this_data = this[this.KEY_DATA],
			/** {String}page title = page_data.title */
			title = typeof page_data === 'string' ? page_data : wiki_API
					.title_of(page_data);

			if (title in this_data) {
				return this_data[title];
			}

			// 登記 page_data 之 revid。
			if (!revid && (!(revid = wiki_API.content_of.revision(page_data))
			/** {Natural}所取得之版本編號。 */
			|| !(revid = revid.revid))) {
				library_namespace.error('revision_cacher.data_of: '
				// 照理來說，會來到這裡的都應該是經過 .had() 確認，因此不該出現此情況。
				+ 'No revision id (.revid): (' + (typeof page_data) + ') '
						+ JSON.stringify(page_data).slice(0, 800));
				return;
			}

			if (this.id_only) {
				// 注意: 這個時候回傳的不是 {Object}
				return this_data[title] = revid;
			}

			/** {Object}本頁之 processed data。 */
			var data = this_data[title] = {};
			data[this.KEY_ID] = revid;
			return data;
		},
		remove : function(page_data) {
			var this_data = this[this.KEY_DATA],
			/** {String}page title = page_data.title */
			title = typeof page_data === 'string' ? page_data : wiki_API
					.title_of(page_data);

			if (title in this_data) {
				delete this_data[title];
			}
		}
	};

	// ------------------------------------------------------------------------

	function get_path_of_category(file_name, options) {
		options = library_namespace.setup_options(options);
		var category = this;
		var session = wiki_API.session_of_options(options);

		var path = [ session.remove_namespace(category.title) ];
		while (category.parent_categories) {
			var _category = category.parent_categories[0];
			category.parent_categories.forEach(function(__category) {
				if (__category.depth < _category.depth)
					_category = __category;
			});
			category = _category;
			path.unshift(session.remove_namespace(category.title));
		}

		var directory = path.join(library_namespace.env.path_separator);
		if (options.directory) {
			directory = library_namespace.append_path_separator(
					options.directory, directory);
		}
		if (options.create_directory !== false
				&& !library_namespace.directory_exists(directory)) {
			library_namespace.create_directory(directory,
					options.create_directory || {
						recursive : true
					});
		}

		if (file_name)
			path.push(session.remove_namespace(file_name));
		path = path.join(library_namespace.env.path_separator);
		// console.trace([ directory, path ]);
		return path;
	}

	if (false) {
		/**
		 * <code>
		When executing `session.download('Category:name', ...)`,
		wiki_API_download() will:
		# Get category tree without files, using session.category_tree(). session.category_tree() will use categoryinfo and categorymembers (category only) to increase speed.
		# Back to wiki_API_download(). For each category, get file_info (imageinfo with URL, latest date) with generator:categorymembers to get files in category.
		# For each file, check the file name and timestamp (get from generator:categorymembers), only download new file. (function download_next_file with options.max_threads)
		</code>
		 */
		wiki_session.download('Category:name', {
			directory : './',
			max_threads : 4,
			// depth of categories
			depth : 4,
			// Only download files with these formats.
			// download_derivatives : ['wav', 'mp3', 'ogg'],
			// Warning: Will skip downloading if there is no new file!
			download_derivatives : 'mp3',
			// A function to filter result pages. Return `true` if you want to
			// keep the element.
			page_filter : function(page_data) {
				return page_data.title.includes('word');
			}
		}, function(file_data_list, error) {
		});
		wiki_session.download('File:name', {
			directory : './'
		}, function(file_data, error) {
		});
	}

	// Download files to local path.

	// TODO:
	// 鏡像: 從本地目錄中刪除遠端不存在的文件
	// https://commons.wikimedia.org/w/api.php?action=help&modules=query%2Bvideoinfo
	// https://commons.wikimedia.org/w/api.php?action=help&modules=query%2Btranscodestatus
	// https://commons.wikimedia.org/w/api.php?action=help&modules=query%2Bstashimageinfo

	// wiki_API.download()
	// wiki_session.download(file_title, local_path || options, callback);
	function wiki_API_download(titles, options, callback) {
		// Download non-vector version of .svg
		// @see https://phabricator.wikimedia.org/T60663
		// wiki_session.download('File:Example.svg',{width:100});

		// assert: this: session
		var session = this;

		// console.trace(next);
		if (typeof titles === 'string' || wiki_API.is_page_data(titles)) {
			if (session.is_namespace(titles, 'Category')) {
				// Get category tree without files, using
				// session.category_tree().
				session.category_tree(titles, function(list, error) {
					if (error) {
						callback(undefined, error);
					} else {
						// assert: list.list_type === 'category_tree'
						wiki_API_download
								.call(session, list, options, callback);
					}
				},
				// pass options.depth: depth of categories
				Object.assign({
					namespace : 'Category',
					set_attributes : true
				}, options));
				return;
			}

			titles = [ titles ];
		} else if (!Array.isArray(titles)
				&& !(library_namespace.is_Object(titles) && titles[wiki_API.KEY_generator_title])) {
			session.next(callback, titles, new Error('Invalid file_title!'));
			return;
		}

		if (titles.list_type === 'category_tree' && !options.no_category_tree
		// && session.is_namespace(titles.namespace, 'Category')
		) {
			// Back to wiki_API_download(). For each category, get file_info
			// (imageinfo with URL, latest date) with generator:categorymembers
			// to get files in category.
			if (!titles.categories_to_process) {
				titles.categories_to_process = Object
						.values(titles.flat_subcategories);
				titles.categories_to_process.total_length = titles.categories_to_process.length;
				// options = library_namespace.new_options(options);
				wiki_API.add_session_to_options(session, options);
				options.download_file_to
				// Will create directory structure for download files.
				= function(file_url, page_data, index, pages, options) {
					// console.trace(pages);
					// console.trace(titles.flat_subcategories);
					// console.trace(pages.title);
					// console.trace(session.remove_namespace(pages.title[wiki_API.KEY_generator_title]));
					var category = titles.flat_subcategories[session
							.remove_namespace(pages.title[wiki_API.KEY_generator_title])];
					// console.trace([page_data, category]);
					var file_path = decodeURIComponent(file_url
							.match(/[^\\\/]+$/)[0]);
					file_path = get_path_of_category.call(category, file_path,
							options);
					// console.trace(file_path);
					return file_path;
				};
			}
			if (titles.categories_to_process.length === 0) {
				session.next(callback, titles);
				return;
			}
			var categories_to_process = titles.categories_to_process.pop();
			library_namespace
					.info('wiki_API_download: '
							+ (titles.categories_to_process.total_length - titles.categories_to_process.length)
							+ '/'
							+ titles.categories_to_process.total_length
							+ ' '
							+ wiki_API
									.title_link_of(categories_to_process.title)
							+ '	of ' + wiki_API.title_link_of(titles.title));
			wiki_API_download.call(session, wiki_API.generator_parameters(
					'categorymembers', {
						title : categories_to_process.title,
						namespace : 'File'
					}), options, wiki_API_download.bind(session, titles,
					options, callback));
			return;
		}

		if (false && titles.length < 5000) {
			// 不處理這個部分以節省資源。
			titles = titles.map(function(page) {
				// assert: page title starts with "File:"
				return session.normalize_title(page.title || page);
			}).filter(function(page_title) {
				return !!page_title;
			}).unique();
		}

		if (titles.length === 0) {
			library_namespace.debug('No file to download.', 1,
					'wiki_API_download');
			session.next(callback, titles);
			return;
		}

		if (typeof options === 'string') {
			options = titles.length > 1 ? {
				directory : options
			} : {
				file_name : options
			};
		} else {
			options = library_namespace.new_options(options);
		}

		// ----------------------------------------------------------

		var file_info_type = options.file_info_type
				|| (options.download_derivatives ? 'videoinfo' : 'imageinfo');
		if (options.download_derivatives && file_info_type !== 'videoinfo') {
			library_namespace
					.warn('wiki_API_download: '
							+ 'You should set options.file_info_type = "videoinfo" for downloading derivatives!');
		}

		var threads_now = 0;
		// For each file, check the file name and timestamp (get from
		// generator:categorymembers), only download new file.
		function download_next_file(data, error, XMLHttp) {
			var page_data;
			if (options.index > 0 && (page_data = titles[options.index - 1])) {
				// cache file name really writed to
				// @see function get_URL_cache_node()
				if (XMLHttp && XMLHttp.cached_file_path) {
					page_data.cached_file_path = XMLHttp.cached_file_path;
				}
				if (error === library_namespace.get_URL_cache.NO_NEWS) {
					page_data.no_new_data = true;
				} else if (error) {
					page_data.error = error;
					titles.error_titles.push([ page_data.title, error ]);
					library_namespace.error('Cannot download '
							+ page_data.title + ': ' + error);
				}
			}

			// console.trace([ threads_now, options.index, titles.length ]);
			if (options.index >= titles.length) {
				if (threads_now === 0) {
					// All titles downloaded.
					session.next(callback, titles,
							titles.error_titles.length > 0
									&& titles.error_titles);
				}
				return;
			}

			// ----------------------------------
			// prepare to download

			page_data = titles[options.index++];
			// console.trace(titles);
			// console.trace([ options.index, page_data ]);
			// assert: !!page_data === true
			var file_info = page_data && page_data[0];
			if (!file_info) {
				if (page_data) {
					titles.error_titles.push([ page_data && page_data.title,
							'No file_info get' ]);
					library_namespace.error('Cannot download '
							+ page_data.title + (error ? ': ' + error : ''));
				}
				download_next_file();
				return;
			}

			// download newer only
			// console.trace(file_info);
			options.web_resource_date = file_info.timestamp;

			// console.trace(page_data);
			// console.trace(file_info);

			// @see
			// [[Commons:FAQ#What_are_the_strangely_named_components_in_file_paths?]]
			// to get the URL directly.
			var file_url = file_info.thumburl || file_info.url;
			var file_url_list = options.download_derivatives;

			if (!file_url_list || !Array.isArray(file_info.derivatives)) {
				download_file(file_url, true);
				return;
			}

			// --------------------------------------------

			// console.trace([ file_url_list, file_info ]);
			if (typeof file_url_list === 'function')
				file_url_list = file_url_list(page_data);

			file_url = Array.isArray(file_url_list) ? file_url_list
					: [ file_url_list ];
			file_url_list = [];
			file_url.forEach(function(file_url) {
				if (typeof file_url !== 'string')
					return;

				if (file_url.startsWith('https://')) {
					file_url_list.push(file_url);
					return;
				}

				file_url = file_url.toLowerCase();
				file_info.derivatives.forEach(function(media_info) {
					// e.g., type: 'audio/ogg; codecs="vorbis"'
					if (media_info.type.toLowerCase().startsWith(file_url)
					// e.g., shorttitle: 'WAV source'
					|| media_info.shorttitle.toLowerCase()
					// e.g., shorttitle: 'Ogg Vorbis'
					.startsWith(file_url) || media_info.transcodekey
					// e.g., transcodekey: 'mp3'
					&& media_info.transcodekey.toLowerCase() === file_url) {
						file_url_list.push(media_info.src);
					}
				});
			});
			// console.trace(file_url_list);

			if (file_url_list.length === 0) {
				// 放棄下載本檔案。
				download_next_file();
				return;
			}

			// Release memory. 釋放被占用的記憶體。
			file_url = null;

			// 警告: 這邊會自動產生多線程下載!
			file_url_list.forEach(function(file_url, index) {
				download_file(file_url,
				//
				index === file_url_list.length);
			});
		}

		function download_file(file_url, multi_threads) {
			// console.trace([ file_url, options ]);

			var error;
			// !see options.file_name_processor @ function get_URL_cache_node()
			if (typeof options.download_file_to === 'function') {
				var index = options.index - 1;
				try {
					options.file_name = options.download_file_to(file_url,
							titles[index], index, titles, options);
				} catch (e) {
					error = e;
					console.error(e);
					titles.error_titles.push([ page_data.title, e ]);
				}
			}

			if (!error) {
				threads_now++;
				library_namespace.get_URL_cache(file_url, function() {
					threads_now--;
					download_next_file.apply(null, arguments);
				}, options);
			}

			if (multi_threads
					&& (options.index < titles.length ? threads_now < options.max_threads
							: threads_now === 0)) {
				download_next_file();
			}
		}

		// https://commons.wikimedia.org/w/api.php?action=help&modules=query%2Bimageinfo
		var file_info_options = Object.assign({
			type : file_info_type,
			// 'url|size|mime|timestamp'
			iiprop : 'url|timestamp',
			viprop : 'url|timestamp|derivatives',
			page_filter : options.page_filter,
			multi : true
		}, options.file_info_options);
		if (options.width > 0)
			file_info_options.iiurlwidth = options.width;
		if (options.height > 0)
			file_info_options.iiurlheight = options.height;

		// console.trace(file_info_options);
		// page title to raw data URL
		wiki_API.list(titles, function(pages, target) {
			// console.trace([pages, target, options]);
			if (pages.error) {
				session.next(callback, titles, pages.error);
				return;
			}
			// console.trace([ pages, file_info_options ]);
			titles = pages;
			options.index = 0;
			titles.error_titles = [];
			// console.trace(titles);
			download_next_file();
		}, wiki_API.add_session_to_options(session, file_info_options));
	}

	// ------------------------------------------------------------------------

	// export 導出.

	// @static
	Object.assign(wiki_API, {
		download : wiki_API_download,

		parse_dump_xml : parse_dump_xml,
		traversal : traversal_pages,

		revision_cacher : revision_cacher
	});

	return wiki_API_page;
}
