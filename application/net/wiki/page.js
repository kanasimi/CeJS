/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): page revisions
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * TODO:<code>


</code>
 * 
 * @since 2019/10/10 拆分 application.net.wiki
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

	require : 'application.net.wiki.',

	// 設定不匯出的子函式。
	no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var wiki_API = library_namespace.net.wiki;
	// @inner
	var is_api_and_title = wiki_API.is_api_and_title, normalize_title_parameter = wiki_API.normalize_title_parameter, wikidata_get_site = wiki_API.wikidata_get_site, add_parameters = wiki_API.add_parameters, node_fs = wiki_API.node_fs;

	// ------------------------------------------------------------------------

	if (false) {
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
	}

	// assert: !!KEY_KEEP_INDEX === true
	var KEY_KEEP_INDEX = 'keep index',
	// assert: !!KEY_KEEP_ORDER === true
	KEY_KEEP_ORDER = 'keep order';

	/**
	 * 讀取頁面內容，取得頁面源碼。可一次處理多個標題。
	 * 
	 * 注意: 用太多 CeL.wiki.page() 並列處理，會造成 error.code "EMFILE"。
	 * 
	 * TODO:
	 * https://www.mediawiki.org/w/api.php?action=help&modules=expandtemplates
	 * or https://www.mediawiki.org/w/api.php?action=help&modules=parse
	 * 
	 * @example <code>

	CeL.wiki.page('史記', function(page_data) {
		CeL.show_value(page_data);
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
		if (typeof callback === 'object' && options === undefined) {
			// shift arguments
			options = callback;
			callback = undefined;
		}

		// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
		options = library_namespace.new_options(options);

		// console.log('title: ' + JSON.stringify(title));
		if (options.get_creation_Date) {
			// 警告:僅適用於單一頁面。
			wiki_API_page(title, function(page_data, error) {
				if (error || !page_data || ('missing' in page_data)) {
					// error? 此頁面不存在/已刪除。
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
				if (options.query_props || options.prop) {
					wiki_API_page(title, callback, options);
				} else {
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

				if (!prop || page_data && ('missing' in page_data)) {
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
				library_namespace.error('wiki_API_page: Invalid .query_props!');
				throw 'wiki_API_page: Invalid .query_props';
			}
			return;
		}

		var action = normalize_title_parameter(title, options);
		if (!action) {
			library_namespace.error('wiki_API_page: Invalid title: '
					+ JSON.stringify(title));
			callback(undefined, 'Invalid title: '
					+ wiki_API.title_link_of(title));
			return;
			throw 'wiki_API_page: Invalid title: '
					+ wiki_API.title_link_of(title);
		}

		var get_content;
		if ('prop' in options) {
			get_content = options.prop &&
			// {String|Array}
			options.prop.includes('revisions');
		} else {
			options.prop = 'revisions';
			get_content = true;
		}

		// 2019 API:
		// https://www.mediawiki.org/wiki/Manual:Slot
		// https://www.mediawiki.org/wiki/API:Revisions
		action[1] = 'rvslots=' + (options.rvslots || 'main') + '&' + action[1];
		if (get_content) {
			// 處理數目限制 limit。單一頁面才能取得多 revisions。多頁面(≤50)只能取得單一 revision。
			// https://www.mediawiki.org/w/api.php?action=help&modules=query
			// titles/pageids: Maximum number of values is 50 (500 for bots).
			if ('rvlimit' in options) {
				if (options.rvlimit > 0 || options.rvlimit === 'max')
					action[1] += '&rvlimit=' + options.rvlimit;
			} else if (!action[1].includes('|')
			//
			&& !action[1].includes(encodeURIComponent('|')))
				// default: 僅取得單一 revision。
				action[1] += '&rvlimit=1';

			// Which properties to get for each revision
			get_content = (Array.isArray(options.rvprop)
			//
			&& options.rvprop.join('|') || options.rvprop)
			//
			|| wiki_API_page.rvprop;

			action[1] = 'rvprop=' + get_content + '&' + action[1];

			get_content = get_content.includes('content');
		}

		if (options.rvdir) {
			// e.g., rvdir=newer
			// Get first revisions
			action[1] = 'rvdir=' + options.rvdir + '&' + action[1];
		}

		// 自動搜尋/轉換繁簡標題。
		if (!('converttitles' in options)) {
			options.converttitles = wikidata_get_site(options, true)
					|| wiki_API.set_language();
			if (!wiki_API_page.auto_converttitles
					.includes(options.converttitles)) {
				delete options.converttitles;
			}
		}
		if (options.converttitles) {
			action[1] = 'converttitles=' + options.converttitles + '&'
					+ action[1];
		}

		// Which properties to get for the queried pages
		// 輸入 prop:'' 或再加上 redirects:1 可以僅僅確認頁面是否存在，以及頁面的正規標題。
		if (options.prop) {
			if (Array.isArray(options.prop)) {
				options.prop = options.prop.join('|');
			}

			// e.g., prop=info|revisions
			// e.g., prop=pageprops|revisions
			// 沒 .pageprops 的似乎大多是沒有 Wikidata entity 的？
			action[1] = 'prop=' + options.prop + '&' + action[1];
		}

		add_parameters(action, options);

		action[1] = 'query&' + action[1];

		if (!action[0]) {
			action = action[1];
		}

		library_namespace.debug('get url token: ' + action, 5, 'wiki_API_page');

		wiki_API.query(action, typeof callback === 'function'
		//
		&& function(data) {
			if (library_namespace.is_debug(2)
			// .show_value() @ interact.DOM, application.debug
			&& library_namespace.show_value) {
				library_namespace.show_value(data, 'wiki_API_page: data');
			}

			var error = data && data.error;
			// 檢查伺服器回應是否有錯誤資訊。
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
				&& data.warnings.query['*'])
					library_namespace.warn(
					//
					'wiki_API_page: ' + data.warnings.query['*']);
				callback(undefined, error);
				return;
			}

			if (false && data.warnings && data.warnings.result
			/**
			 * e.g., <code>
			 * { continue: { rvcontinue: '2421|39477047', continue: '||' },
			 *   warnings: { result: { '*': 'This result was truncated because it would otherwise  be larger than the limit of 12,582,912 bytes' } },
			 *   query:
			 *    { pages:
			 *       { '13': [Object],
			 *       ...
			 * </code>
			 * limit: 12 MB. 此時應該有 .continue。
			 */
			&& data.warnings.result['*']) {
				if (false && data.warnings.result['*'].includes('truncated'))
					data.truncated = true;
				library_namespace.warn(
				//
				'wiki_API_page: ' + data.warnings.result['*']);
			}

			if (!data || !data.query || !data.query.pages) {
				library_namespace.warn('wiki_API_page: Unknown response: ['
				// e.g., 'wiki_API_page: Unknown response:
				// [{"batchcomplete":""}]'
				+ (typeof data === 'object' && typeof JSON !== 'undefined'
				//
				? JSON.stringify(data) : data) + ']');
				// library_namespace.set_debug(6);
				if (library_namespace.is_debug()
				// .show_value() @ interact.DOM, application.debug
				&& library_namespace.show_value)
					library_namespace.show_value(data);
				callback(undefined, 'Unknown response');
				return;
			}

			var page_list = [],
			//
			page_cache_prefix = library_namespace.platform.nodejs && node_fs
			//
			&& options.page_cache_prefix;

			var continue_id;
			if ('continue' in data) {
				// page_list['continue'] = data['continue'];
				if (data['continue']
				//
				&& typeof data['continue'].rvcontinue === 'string'
				//
				&& (continue_id = data['continue'].rvcontinue
				// assert: page_list['continue'].rvcontinue = 'id|...'。
				.match(/^[1-9]\d*/))) {
					continue_id = Math.floor(continue_id[0]);
				}
				if (false && data.truncated)
					page_list.truncated = true;

			}

			var redirect_from;
			if (data.query.redirects) {
				page_list.redirects = data.query.redirects;
				if (Array.isArray(data.query.redirects)) {
					page_list.redirect_from
					// 記錄經過重導向的標題。
					= redirect_from = Object.create(null);
					data.query.redirects.forEach(function(item) {
						redirect_from[item.to] = item.from;
					});
				}
			}
			var convert_from;
			if (data.query.converted) {
				page_list.converted = data.query.converted;
				if (Array.isArray(data.query.converted)) {
					page_list.convert_from
					// 記錄經過轉換的標題。
					= convert_from = Object.create(null);
					data.query.converted.forEach(function(item) {
						convert_from[item.to] = item.from;
					});
				}
			}

			var pages = data.query.pages;
			// 其他 .prop 本來就不會有內容。
			var need_warn = get_content;

			for ( var pageid in pages) {
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
						library_namespace.warn('wiki_API_page: '
						// 此頁面不存在/已刪除。Page does not exist. Deleted?
						+ ('missing' in page_data
						// e.g., 'wiki_API_page: Not exists: [[title]]'
						? 'Not exists' : 'No contents')
						//
						+ ': ' + (page_data.title
						//
						? wiki_API.title_link_of(page_data)
						//
						: 'id ' + page_data.pageid));
					}

				} else if (page_cache_prefix) {
					node_fs.writeFile(page_cache_prefix
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
						library_namespace.debug(
						// 因為此動作一般說來不會影響到後續操作，因此採用同時執行。
						'Write to cache file: done.', 1, 'wiki_API_page');
					});
				}

				if (redirect_from && redirect_from[page_data.title]) {
					page_data.original_title
					// .from_title, .redirect_from_title
					= page_data.redirect_from = redirect_from[page_data.title];
				}
				// 可以利用 page_data.convert_from 來判別標題是否已經過繁簡轉換。
				if (convert_from && convert_from[page_data.title]) {
					page_data.original_title
					// .from_title, .convert_from_title
					= page_data.convert_from = convert_from[page_data.title];
				}
				page_list.push(page_data);
			}

			if (data.warnings && data.warnings.query
			//
			&& typeof data.warnings.query['*'] === 'string') {
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

			// options.multi: 即使只取得單頁面，依舊回傳 Array。
			if (!options.multi) {
				if (page_list.length <= 1) {
					// e.g., pages: { '1850031': [Object] }
					library_namespace.debug('只取得單頁面 '
					//
					+ wiki_API.title_link_of(page_list)
					//
					+ '，將回傳此頁面內容，而非 Array。', 2, 'wiki_API_page');
					page_list = page_list[0];
					if (is_api_and_title(title, true)) {
						title = title[1];
					}
					if (wiki_API.content_of.is_page_data(title)) {
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
					&& (page_list.is_Flow = is_Flow(page_list))
					// e.g., { flow_view : 'header' }
					&& options.flow_view) {
						Flow_page(page_list, callback, options);
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
				var order_hash = title[1].to_hash(), ordered_list = [];
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
					throw 're-sort page list';
				}

				// 維持頁面的順序與輸入的相同。
				page_list.forEach(function(page_data) {
					var original_title = page_data.original_title
					//
					|| page_data.title;
					if (original_title in order_hash) {
						ordered_list[order_hash[original_title]] = page_data;
					} else {
						console.log(page_data);
						console.log('-'.repeat(70)
						//
						+ '\nPage list:\n' + title[1].join('\n'));
						throw 'wiki_API_page: 取得了未指定的頁面: '
						//
						+ wiki_API.title_link_of(original_title);
					}
				});
				// 緊湊化，去掉沒有設定到的頁面。
				if (options.multi === KEY_KEEP_ORDER) {
					ordered_list = ordered_list.filter(function(page_data) {
						return !!page_data;
					});
				}

				// copy attributes form original page_list
				[ 'OK_length', 'truncated',
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

			if (options.save_response) {
				// 附帶原始回傳查詢資料。
				// save_data, query_data
				// assert: !('response' in page_list)
				page_list.response = data;
			}

			if (options.expandtemplates) {
				// 需要expandtemplates的情況。
				if (!Array.isArray(page_list)) {
					// TODO: test
					var revision = wiki_API.content_of.revision(page_list);
					// 出錯時 revision 可能等於 undefined。
					if (!revision) {
						callback(page_list);
						return;
					}
					wiki_API_expandtemplates(
					//
					revision_content(revision), function() {
						callback(page_list);
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
					revision_content(revision), run_next, Object.assign({
						page : page_data,
						title : page_data.title,
						revid : revision && revision.revid,
						includecomments : options.includecomments,

						session : options[KEY_SESSION]
					}, options.expandtemplates));
				}, function() {
					callback(page_list);
				});
				return;
			}

			// 一般正常回傳。

			// page 之 structure 將按照 wiki API 本身之 return！
			// page_data = {pageid,ns,title,revisions:[{timestamp,'*'}]}
			callback(page_list);

		}, null, options);
	}

	// default properties of revisions
	// timestamp 是為了 wiki_API.edit 檢查用。
	wiki_API_page.rvprop = 'content|timestamp';

	// @see https://www.mediawiki.org/w/api.php?action=help&modules=query
	wiki_API_page.auto_converttitles = 'zh,gan,iu,kk,ku,shi,sr,tg,uz'
			.split(',');

	// ------------------------------------------------------------------------

	// export 導出.

	return wiki_API_page;
}
