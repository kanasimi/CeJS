/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): cache
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
	name : 'application.net.wiki.cache',

	require : 'data.native.'
	// for library_namespace.get_URL
	+ '|application.net.Ajax.' + '|application.net.wiki.'
	// load MediaWiki module basic functions
	+ '|application.net.wiki.namespace.',

	// 設定不匯出的子函式。
	no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var wiki_API = library_namespace.application.net.wiki, KEY_SESSION = wiki_API.KEY_SESSION;

	// --------------------------------------------------------------------------------------------

	/** {Object|Function}fs in node.js */
	var node_fs;
	try {
		if (library_namespace.platform.nodejs)
			// @see https://nodejs.org/api/fs.html
			node_fs = require('fs');
		if (typeof node_fs.readFile !== 'function')
			throw true;
	} catch (e) {
		// enumerate for wiki_API.cache
		// 模擬 node.js 之 fs，以達成最起碼的效果（即無 cache 功能的情況）。
		library_namespace.warn(this.id
				+ ': 無 node.js 之 fs，因此不具備 cache 或 SQL 功能。');
		node_fs = {
			// library_namespace.storage.read_file()
			readFile : function(file_path, options, callback) {
				library_namespace.error('Cannot read file ' + file_path);
				if (typeof callback === 'function')
					callback(true);
			},
			// library_namespace.storage.write_file()
			writeFile : function(file_path, data, options, callback) {
				library_namespace.error('Cannot write to file ' + file_path);
				if (typeof options === 'function' && !callback)
					callback = options;
				if (typeof callback === 'function')
					callback(true);
			}
		};
	}

	// --------------------------------------------------------------------------------------------

	/**
	 * cache 相關函數:
	 * 
	 * @see application.storage.file.get_cache_file
	 *      application.OS.Windows.file.cacher
	 *      application.net.Ajax.get_URL_cache<br />
	 *      application.net.wiki<br />
	 *      wiki_API.cache() CeL.wiki.cache()
	 */

	if (false) {
		// examples

		CeL.wiki.cache({
			type : 'page',
			file_name : 'file_name',
			list : 'Wikipedia:Sandbox',
			operator : function(data) {
				console.log(data);
			}
		}, function callback(data) {
			console.log(data);
		}, {
			// default options === this
			// namespace : '0|1',
			// [KEY_SESSION]
			// session : wiki,
			// title_prefix : 'Template:',
			// cache path prefix
			prefix : 'base_directory/'
		});

		CeL.set_debug(6);
		CeL.wiki.cache({
			type : 'callback',
			file_name : 'file_name',
			list : function(callback) {
				callback([ 1, 2, 3 ]);
			},
			operator : function(data) {
				console.log(data);
			}
		}, function callback(data) {
			console.log(data);
		}, {
			// default options === this
			// namespace : '0|1',
			// [KEY_SESSION]
			// session : wiki,
			// title_prefix : 'Template:',
			// cache path prefix
			prefix : './'
		});

		CeL.set_debug(6);
		var wiki = Wiki(true);
		CeL.wiki.cache({
			type : 'wdq',
			file_name : 'countries',
			list : 'claim[31:6256]',
			operator : function(list) {
				// console.log(list);
				result = list;
			}
		}, function callback(list) {
			// console.log(list);
		}, {
			// default options === this
			// namespace : '0|1',
			// [KEY_SESSION]
			session : wiki,
			// title_prefix : 'Template:',
			// cache path prefix
			prefix : './'
		});
	}

	/**
	 * cache 作業操作之輔助套裝函數。
	 * 
	 * 注意: only for node.js. 必須自行 include 'application.platform.nodejs'。 <code>
	   CeL.run('application.platform.nodejs');
	 * </code><br />
	 * 注意: 需要自行先創建各 type 之次目錄，如 page, redirects, embeddedin, ...<br />
	 * 注意: 會改變 operation, _this！ Warning: will modify operation, _this!
	 * 
	 * 連續作業: 依照 _this 設定 {Object}default options，即傳遞於各 operator 間的 ((this))。<br />
	 * 依照 operation 順序個別執行單一項作業。
	 * 
	 * 單一項作業流程:<br />
	 * 設定檔名。<br />
	 * 若不存在此檔，則:<br />
	 * >>> 依照 operation.type 與 operation.list 取得資料。<br />
	 * >>> 若 Array.isArray(operation.list) 則處理多項列表作業:<br />
	 * >>>>>> 個別處理單一項作業，每次執行 operation.each() || operation.each_retrieve()。<br />
	 * >>> 執行 data = operation.retrieve(data)，以其回傳作為將要 cache 之 data。<br />
	 * >>> 寫入cache。<br />
	 * 執行 operation.operator(data)
	 * 
	 * TODO: file_stream<br />
	 * TODO: do not write file
	 * 
	 * @param {Object|Array}operation
	 *            作業設定。
	 * @param {Function}[callback]
	 *            所有作業(operation)執行完後之回調函數。 callback(response data)
	 * @param {Object}[_this]
	 *            傳遞於各 operator 間的 ((this))。注意: 會被本函數更動！
	 */
	function wiki_API_cache(operation, callback, _this) {
		if (library_namespace.is_Object(callback) && !_this) {
			// 未設定/不設定 callback
			// shift arguments.
			_this = callback;
			callback = undefined;
		}

		var index = 0;
		/**
		 * 連續作業時，轉到下一作業。
		 * 
		 * node.js v0.11.16: In strict mode code, functions can only be declared
		 * at top level or immediately within another function.
		 */
		function next_operator(data) {
			library_namespace.debug('處理連續作業序列，轉到下一作業: ' + (index + 1) + '/'
					+ operation.length, 2, 'wiki_API_cache.next_operator');
			// [ {Object}operation, {Object}operation, ... ]
			// operation = { type:'embeddedin', operator:function(data) }
			if (index < operation.length) {
				var this_operation = operation[index++];
				// console.log(this_operation);
				if (!this_operation) {
					// Allow null operation.
					library_namespace.debug('未設定 operation[' + (index - 1)
							+ ']。Skip this operation.', 1,
							'wiki_API_cache.next_operator');
					next_operator(data);

				} else {
					if (!('list' in this_operation)) {
						// use previous data as list.
						library_namespace.debug(
								'未特別指定 list，以前一次之回傳 data 作為 list。', 3,
								'wiki_API_cache.next_operator');
						library_namespace.debug('前一次之回傳 data: '
								+ (data && JSON.stringify(data).slice(0, 180))
								+ '...', 3, 'wiki_API_cache.next_operator');
						this_operation.list = data;
					}
					if (data) {
						library_namespace.debug('設定 .last_data_got: '
								+ (data && JSON.stringify(data).slice(0, 180))
								+ '...', 3, 'wiki_API_cache.next_operator');
						this_operation.last_data_got = data;
					}
					// default options === _this: 傳遞於各 operator 間的 ((this))。
					wiki_API_cache(this_operation, next_operator, _this);
				}

			} else if (typeof callback === 'function') {
				if (false && Array.isArray(data)) {
					// TODO: adapt to {Object}operation
					library_namespace.log('wiki_API_cache: Get ' + data.length
							+ ' page(s).');
					// 自訂list
					// data = [ '' ];
					if (_this.limit >= 0) {
						// 設定此初始值，可跳過之前已經處理過的。
						data = data.slice(0 * _this.limit, 1 * _this.limit);
					}
					library_namespace.debug(data.slice(0, 8).map(
							wiki_API.title_of).join('\n')
							+ '\n...');
				}

				// last 收尾
				callback.call(_this, data);
			}
		}

		if (Array.isArray(operation)) {
			next_operator();
			return;
		}

		// ----------------------------------------------------
		/**
		 * 以下為處理單一次作業。
		 */
		library_namespace.debug('處理單一次作業。', 2, 'wiki_API_cache');
		library_namespace.debug(
				'using operation: ' + JSON.stringify(operation), 6,
				'wiki_API_cache');

		if (typeof _this !== 'object') {
			// _this: 傳遞於各 operator 間的 ((this))。
			_this = Object.create(null);
		}

		var file_name = operation.file_name,
		/** 前一次之回傳 data。每次產出的 data。 */
		last_data_got = operation.last_data_got;

		if (typeof file_name === 'function') {
			// @see wiki_API_cache.title_only
			file_name = file_name.call(_this, last_data_got, operation);
		}

		var
		/** {String}method to get data */
		type = operation.type,
		/** {Boolean}是否自動嘗試建立目錄。 */
		try_mkdir = typeof library_namespace.fs_mkdir === 'function'
				&& operation.mkdir,
		//
		operator = typeof operation.operator === 'function'
				&& operation.operator,
		//
		list = operation.list;

		if (!file_name) {
			// 若自行設定了檔名，則慢點執行 list()，先讀讀 cache。因為 list() 可能會頗耗時間。
			// 基本上，設定 this.* 應該在 operation.operator() 中，而不是在 operation.list() 中。
			if (typeof list === 'function') {
				// TODO: 允許非同步方法。
				list = list.call(_this, last_data_got, operation);
			}

			if (!operation.postfix) {
				if (type === 'file')
					operation.postfix = '.txt';
				else if (type === 'URL')
					operation.postfix = '.htm';
			}

			// 自行設定之檔名 operation.file_name 優先度較 type/title 高。
			// 需要自行創建目錄！
			file_name = _this[type + '_prefix'] || type;
			file_name = [ file_name
			// treat file_name as directory
			? /[\\\/]/.test(file_name) ? file_name : file_name + '/' : '',
			//
			wiki_API.is_page_data(list) ? list.title
			// 若 Array.isArray(list)，則 ((file_name = ''))。
			: typeof list === 'string' && wiki_API.normalize_title(list, true) ];
			if (file_name[1]) {
				file_name = file_name[0]
				// 正規化檔名。
				+ file_name[1].replace(/\//g, '_');
			} else {
				// assert: node_fs.readFile('') 將執行 callback(error)
				file_name = '';
			}
		}

		if (file_name) {
			if (!('postfix' in operation) && !('postfix' in _this)
					&& /\.[a-z\d\-]+$/i.test(file_name)) {
				// 若已設定 filename extension，則不自動添加。
				operation.postfix = '';
			}

			file_name = [ 'prefix' in operation ? operation.prefix
			// _this.prefix: cache path prefix
			: 'prefix' in _this
			//
			? _this.prefix : wiki_API_cache.prefix, file_name,
			// auto detect filename extension
			'postfix' in operation ? operation.postfix
			//
			: 'postfix' in _this ? _this.postfix : wiki_API_cache.postfix ];
			library_namespace.debug('Pre-normalized cache file name: ['
					+ file_name + ']', 5, 'wiki_API_cache');
			if (false)
				library_namespace.debug('file name param:'
						+ [ operation.file_name, _this[type + '_prefix'], type,
								JSON.stringify(list) ].join(';'), 6,
						'wiki_API_cache');
			// 正規化檔名。
			file_name = file_name.join('').replace(/[:*?<>]/g, '_');
		}
		library_namespace.debug('Try to read cache file: [' + file_name + ']',
				3, 'wiki_API_cache');

		var
		/**
		 * 採用 JSON<br />
		 * TODO: parse & stringify 機制
		 * 
		 * @type {Boolean}
		 */
		using_JSON = 'json' in operation ? operation.json : /\.json$/i
				.test(file_name),
		/** {String}file encoding for fs of node.js. */
		encoding = _this.encoding || wiki_API.encoding;
		// list file path
		_this.file_name = file_name;

		// console.log('Read file: ' + file_name);
		node_fs.readFile(file_name, encoding, function(error, data) {
			/**
			 * 結束作業。
			 */
			function finish_work(data) {
				library_namespace.debug('finish work', 3,
						'wiki_API_cache.finish_work');
				last_data_got = data;
				if (operator)
					operator.call(_this, data, operation);
				library_namespace.debug('loading callback', 3,
						'wiki_API_cache.finish_work');
				if (typeof callback === 'function')
					callback.call(_this, data);
			}

			if (!operation.reget && !error && (data ||
			// 當資料 Invalid，例如採用 JSON 卻獲得空資料時；則視為 error，不接受此資料。
			('accept_empty_data' in _this
			//
			? _this.accept_empty_data : !using_JSON))) {
				// gettext_config:{"id":"using-cached-data"}
				library_namespace.debug('Using cached data.', 3,
						'wiki_API_cache');
				library_namespace.debug('Cached data: ['
						+ (data && data.slice(0, 200)) + ']...', 5,
						'wiki_API_cache');
				if (using_JSON && data) {
					try {
						data = JSON.parse(data);
					} catch (e) {
						library_namespace.error(
						// error. e.g., "undefined"
						'wiki_API_cache: Cannot parse as JSON: ' + data);
						// 注意: 若中途 abort，此時可能需要手動刪除大小為 0 的 cache file！
						data = undefined;
					}
				}
				finish_work(data);
				return;
			}

			library_namespace.debug(
					operation.reget ? 'Dispose cache. Reget again.'
					// ↑ operation.reget: 放棄 cache，重新取得資料。
					: 'No valid cached data. Try to get data...', 3,
					'wiki_API_cache');

			/**
			 * 寫入 cache 至檔案系統。
			 */
			function write_cache(data) {
				if (operation.cache === false) {
					// 當設定 operation.cache: false 時，不寫入 cache。
					library_namespace.debug(
							'設定 operation.cache === false，不寫入 cache。', 3,
							'wiki_API_cache.write_cache');

				} else if (/[^\\\/]$/.test(file_name)) {
					library_namespace.info('wiki_API_cache: '
							+ 'Write cache data to [' + file_name + '].'
							+ (using_JSON ? ' (using JSON)' : ''));
					library_namespace.debug('Cache data: '
							+ (data && JSON.stringify(data).slice(0, 190))
							+ '...', 3, 'wiki_API_cache.write_cache');
					var write = function() {
						// 為了預防需要建立目錄，影響到後面的作業，
						// 因此採用 fs.writeFileSync() 而非 fs.writeFile()。
						node_fs.writeFileSync(file_name, using_JSON ? JSON
								.stringify(data) : data, encoding);
					};
					try {
						write();
					} catch (error) {
						// assert: 此 error.code 表示上層目錄不存在。
						var matched = error.code === 'ENOENT'
						// 未設定 operation.mkdir 的話，預設會自動嘗試建立目錄。
						&& try_mkdir !== false
						//
						&& file_name.match(/[\\\/][^\\\/]+$/);
						if (matched) {
							// 僅測試一次。設定 "已嘗試過" flag。
							try_mkdir = false;
							// create parent directory
							library_namespace.fs_mkdir(file_name.slice(0,
									matched.index));
							// re-write file again.
							try {
								write();
							} catch (e) {
								library_namespace.error(
								//
								'wiki_API_cache: Error to write cache data!');
								library_namespace.error(e);
							}
						}
					}
				}

				finish_work(data);
			}

			// node.js v0.11.16: In strict mode code, functions can only be
			// declared
			// at top level or immediately within another function.
			/**
			 * 取得並處理下一項 data。
			 */
			function get_next_item(data) {
				if (index < list.length) {
					// 利用基本相同的參數以取得 cache。
					_operation.list = list[index++];
					var message = '處理多項列表作業: ' + type + ' ' + index + '/'
							+ list.length;
					if (list.length > 8) {
						library_namespace.info('wiki_API_cache.get_next_item: '
								+ message);
					} else {
						library_namespace.debug(message, 1,
								'wiki_API_cache.get_next_item');
					}
					wiki_API_cache(_operation, get_next_item, _this);
				} else {
					// last 收尾
					// All got. retrieve data.
					if (_operation.data_list)
						data = _operation.data_list;
					if (typeof operation.retrieve === 'function')
						data = operation.retrieve.call(_this, data);
					write_cache(data);
				}
			}

			if (typeof list === 'function' && type !== 'callback') {
				library_namespace.debug('Call .list()', 3, 'wiki_API_cache');
				list = list.call(_this, last_data_got, operation);
				// 對於 .list() 為 asynchronous 函數的處理。
				if (list === wiki_API_cache.abort) {
					library_namespace.debug('It seems the .list()'
							+ ' is an asynchronous function.' + ' I will exit'
							+ ' and wait for the .list() finished.', 3,
							'wiki_API_cache');
					return;
				}
			}
			if (list === wiki_API_cache.abort) {
				library_namespace
						.debug('Abort operation.', 1, 'wiki_API_cache');
				finish_work();
				return;
			}

			if (Array.isArray(list)) {
				if (!type) {
					library_namespace.debug('採用 list (length ' + list.length
							+ ') 作為 data。', 1, 'wiki_API_cache');
					write_cache(list);
					return;
				}
				if (list.length > 1e6) {
					library_namespace.warn(
					//
					'wiki_API_cache: 警告: list 過長/超過限度 (length ' + list.length
							+ ')，將過於耗時而不實際！');
				}

				/**
				 * 處理多項列表作業。
				 */
				var index = 0, _operation = Object.clone(operation);
				// 個別頁面不設定 .file_name, .end。
				delete _operation.end;
				if (_operation.each_file_name) {
					_operation.file_name = _operation.each_file_name;
					delete _operation.each_file_name;
				} else {
					delete _operation.file_name;
				}
				if (typeof _operation.each === 'function') {
					// 每一項 list 之項目執行一次 .each()。
					_operation.operator = _operation.each;
					delete _operation.each;
				} else {
					if (typeof _operation.each_retrieve === 'function')
						_operation.each_retrieve = _operation.each_retrieve
								.bind(_this);
					else
						delete _operation.each_retrieve;
					/**
					 * 預設處理列表的函數。
					 */
					_operation.operator = function(data) {
						if ('each_retrieve' in operation)
							// 資料事後處理程序 (post-processor):
							// 將以 .each_retrieve() 的回傳作為要處理的資料。
							data = operation.each_retrieve.call(_this, data);
						if (_operation.data_list) {
							if (Array.isArray(data))
								Array.prototype.push.apply(
										_operation.data_list, data);
							else if (data)
								_operation.data_list.push(data);
						} else {
							if (Array.isArray(data))
								_operation.data_list = data;
							else if (data)
								_operation.data_list = [ data ];
						}
					};
				}
				library_namespace.debug('處理多項列表作業, using operation: '
						+ JSON.stringify(_operation), 5, 'wiki_API_cache');

				get_next_item();
				return;
			}

			// ------------------------------------------------
			/**
			 * 以下為處理單一項作業。
			 */

			var to_get_data, list_type;
			if (// type in get_list.type
			wiki_API.list.type_list.includes(type)) {
				list_type = type;
				type = 'list';
			}

			switch (type) {
			case 'callback':
				if (typeof list !== 'function') {
					library_namespace
							.warn('wiki_API_cache: list is not function!');
					callback.call(_this, last_data_got);
					break;
				}
				// 手動取得資料。使用 list=function(callback){callback(list);}
				to_get_data = function(list, callback) {
					library_namespace.log('wiki_API_cache: '
							+ 'manually get data and then callback(list).');
					if (typeof list === 'function') {
						// assert: (typeof list === 'function') 必須自己回 call！
						list.call(_this, callback, last_data_got, operation);
					}
				};
				break;

			case 'file':
				// 一般不應用到。
				// get file 內容。
				to_get_data = function(file_path, callback) {
					library_namespace.log('wiki_API_cache: Get file ['
							+ file_path + '].');
					node_fs.readFile(file_path, operation.encoding, function(
							error, data) {
						if (error)
							library_namespace.error(
							//
							'wiki_API_cache: Error get file [' + file_path
									+ ']: ' + error);
						callback.call(_this, data);
					});
				};
				break;

			case 'URL':
				// get URL 頁面內容。
				to_get_data = function(URL, callback) {
					library_namespace.log('wiki_API_cache: Get URL of [' + URL
							+ '].');
					library_namespace.get_URL(URL, callback);
				};
				break;

			case 'wdq':
				to_get_data = function(query, callback) {
					if (_this[KEY_SESSION]) {
						if (!_this[KEY_SESSION].data_session) {
							_this[KEY_SESSION].set_data();
							_this[KEY_SESSION].run(function() {
								// retry again
								to_get_data(query, callback);
							});
							return;
						}
						operation[KEY_SESSION]
						//
						= _this[KEY_SESSION].data_session;
					}

					library_namespace.log('wiki_API_cache: Wikidata Query ['
							+ query + '].');
					// wikidata_query(query, callback, options)
					wiki_API.wdq(query, callback, operation);
				};
				break;

			case 'page':
				// get page contents 頁面內容。
				// title=(operation.title_prefix||_this.title_prefix)+operation.list
				to_get_data = function(title, callback) {
					library_namespace.log('wiki_API_cache: Get content of '
							+ wiki_API.title_link_of(title));
					// 防止汙染。
					var _options = library_namespace.new_options(_this,
							operation);
					// 包含 .list 時，wiki_API.page() 不會自動添加 .prop。
					delete _options.list;
					wiki_API.page(title, function(page_data) {
						callback(page_data);
					}, _options);
				};
				break;

			case 'redirects_here':
				// 取得所有重定向到(title重定向標的)之頁面列表，(title重定向標的)將會排在[0]。
				// 注意: 無法避免雙重重定向問題!
				to_get_data = function(title, callback) {
					// wiki_API.redirects_here(title, callback, options)
					wiki_API.redirects_here(title, function(root_page_data,
							redirect_list) {
						if (!operation.keep_redirects && redirect_list
								&& redirect_list[0]) {
							if (false) {
								console.assert(redirect_list[0].redirects
								//
								.join() === redirect_list.slice(1).join());
							}
							// cache 中不需要此累贅之資料。
							delete redirect_list[0].redirects;
							delete redirect_list[0].redirect_list;
						}
						callback(redirect_list);
					}, Object.assign({
						// Making .redirect_list[0] the redirect target.
						include_root : true
					}, _this, operation));
				};
				break;

			case 'list':
				to_get_data = function(title, callback) {
					var options = Object.assign({
						type : list_type
					}, _this, operation);
					wiki_API.list(title, function(pages) {
						if (!options.for_each_page || options.get_list) {
							library_namespace.log(list_type
							// allpages 不具有 title。
							+ (title ? ' '
							//
							+ wiki_API.title_link_of(title) : '') + ': '
									+ pages.length + ' page(s).');
						}
						pages.query_title = title;
						// page list, title page_data
						callback(pages);
					}, options);
				};
				break;

			default:
				if (typeof type === 'function')
					to_get_data = type.bind(Object.assign(Object.create(null),
							_this, operation));
				else if (type)
					throw new Error('wiki_API_cache: Bad type: ' + type);
				else {
					library_namespace.debug('直接採用 list 作為 data。', 1,
							'wiki_API_cache');
					write_cache(list);
					return;
				}
			}

			// 回復 recover type
			// if (list_type) type = list_type;

			var title = list;

			if (typeof title === 'string') {
				// 可以用 operation.title_prefix 覆蓋 _this.title_prefix
				if ('title_prefix' in operation) {
					if (operation.title_prefix)
						title = operation.title_prefix + title;
				} else if (_this.title_prefix)
					title = _this.title_prefix + title;
			}
			library_namespace.debug('處理單一項作業: ' + wiki_API.title_link_of(title)
					+ '。', 3, 'wiki_API_cache');
			to_get_data(title, write_cache);
		});
	}

	/** {String}預設 file encoding for fs of node.js。 */
	wiki_API.encoding = 'utf8';
	/** {String}檔名預設前綴。 */
	wiki_API_cache.prefix = '';
	/** {String}檔名預設後綴。 */
	wiki_API_cache.postfix = '.json';
	/**
	 * 若 operation.list() return wiki_API_cache.abort，<br />
	 * 則將直接中斷離開 operation，不執行 callback。<br />
	 * 此時須由 operation.list() 自行處理 callback。
	 */
	wiki_API_cache.abort = typeof Symbol === 'function' ? Symbol('ABORT_CACHE')
	//
	: {
		cache : 'abort'
	};
	/**
	 * 只取檔名，僅用在 operation.each_file_name。<br />
	 * <code>{
	 * each_file_name : CeL.wiki.cache.title_only,
	 * }</code>
	 * 
	 * @type {Function}
	 */
	wiki_API_cache.title_only = function(last_data_got, operation) {
		var list = operation.list;
		if (typeof list === 'function') {
			operation.list = list = list.call(this, last_data_got, operation);
		}
		return operation.type + '/' + remove_page_title_namespace(list);
	};

	// ------------------------------------------------------------------------

	// export 導出.

	// wiki_API.cache = wiki_API_cache;
	return wiki_API_cache;
}
