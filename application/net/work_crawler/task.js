/**
 * @name WWW work crawler sub-functions
 * 
 * @fileoverview WWW work crawler functions: part of task / control flow
 * 
 * @since 2019/10/13 拆分自 CeL.application.net.work_crawler
 */

'use strict';

// --------------------------------------------------------------------------------------------

if (typeof CeL === 'function') {
	// 忽略沒有 Windows Component Object Model 的錯誤。
	CeL.env.ignore_COM_error = true;

	CeL.run({
		// module name
		name : 'application.net.work_crawler.task',

		require : 'application.net.work_crawler.'
		//
		+ '|data.date.|application.net.Ajax.get_URL',

		// 設定不匯出的子函式。
		no_extend : 'this,*',

		// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
		code : module_code
	});
}

function module_code(library_namespace) {

	// requiring
	var Work_crawler = library_namespace.net.work_crawler, crawler_namespace = Work_crawler.crawler_namespace;

	var get_URL = this.r('get_URL'),
	//
	gettext = library_namespace.locale.gettext,
	/** node.js file system module */
	node_fs = library_namespace.platform.nodejs && require('fs');

	// --------------------------------------------------------------------------------------------

	// 初始化 agent。
	// create and keep a new agent. 維持一個獨立的 agent。
	// 以不同 agent 應對不同 host。
	function setup_agent(URL, reset_cookie) {
		var agent;
		if (Array.isArray(URL)) {
			// [ url, post_data, options ]
			URL = URL[0];
		}

		if (URL
		// restore
		|| !(agent = this.default_agent)) {
			agent = library_namespace.application.net.Ajax.setup_node_net(URL
					|| this.base_URL);
			agent.keepAlive = true;
		}

		var this_agent = this.get_URL_options.agent;
		// 處理 cookie。
		if (this_agent && this_agent.last_cookie) {
			if (reset_cookie) {
				delete this_agent.last_cookie;

			} else if (this_agent === agent) {
				// return agent;

			} else {
				// assert: !!this_agent.last_cookie === true

				// copy cookie @ mid.js

				// {Array}.last_cookie
				if (agent.last_cookie) {
					library_namespace.debug([ 'setup_agent: ', {
						T : '原先的 agent 已存在 .last_cookie，將覆蓋設定！請回報這個錯誤！'
					} ]);
					// console.log(this_agent.last_cookie);
					// console.trace(agent.last_cookie);

					// TODO: 合併 cookie。
				}

				// copy cookies
				agent.last_cookie = this_agent.last_cookie;
			}
		}

		return this.get_URL_options.agent = agent;
	}

	// --------------------------------

	// set download directory
	function set_main_directory(main_directory) {
		main_directory = library_namespace
		// main_directory 必須以 path separator 作結。
		.append_path_separator(main_directory);
		if (main_directory) {
			Work_crawler.prototype.main_directory = main_directory;
		}
		return Work_crawler.prototype.main_directory;
	}

	Work_crawler.set_main_directory = set_main_directory;

	// --------------------------------

	// fatal error throwed
	Work_crawler.THROWED = typeof Symbol === 'function' ? Symbol('THROWED') : {
		throwed : true
	};

	Work_crawler.SKIP_THIS_CHAPTER = typeof Symbol === 'function' ? Symbol('SKIP_THIS_CHAPTER')
			: {
				skip_this_chapter : true
			};

	function onwarning(warning, work_data) {
		library_namespace.error(warning);
	}

	// for uncaught error. work_data 可能為 undefined/image_data
	function onerror(error, work_data) {
		process.title = this.id + ': '
		// gettext_config:{"id":"error-$1"}
		+ gettext('Error: %1', String(error));

		// 直接丟出異常錯誤。
		throw typeof error === 'object' ? error : new Error(this.id + ': '
		// 先包裝成 new Error()，就不必 console.trace() 了。
		+ (new Date).format('%Y/%m/%d %H:%M:%S') + ' ' + error);

		// old method
		if (typeof error === 'object') {
			// 直接丟出異常錯誤。
			throw error;
		} else {
			if (false) {
				// 會直接 throw new Error()，就不必 console.trace() 了。
				console.trace(
				// typeof error === 'object' ? JSON.stringify(error) :
				error);
			}
			throw new Error(this.id + ': '
					+ (new Date).format('%Y/%m/%d %H:%M:%S') + ' ' + error);
		}
		// return CeL.work_crawler.THROWED;
		return Work_crawler.THROWED;
	}

	// --------------------------------------------------------------------------------------------

	/**
	 * 抽取出圖片伺服器列表。
	 * 
	 * @param {Array|Function}server_URL
	 *            Server URL(s) where images are stored
	 * @param {Function}[callback]
	 * @param {String}[server_file]
	 *            catch file
	 */
	function set_server_list(server_URL, callback, server_file) {
		if (Array.isArray(server_URL)) {
			// 直接設定。
			this.server_list = server_URL;
			typeof callback === 'function' && callback();
			return;
		}

		if (typeof server_URL === 'function') {
			server_URL = server_URL.call(this);
		}
		server_URL = this.full_URL(server_URL);

		var _this = this;

		// 獲取圖庫伺服器列表。
		this.get_URL(server_URL, function(XMLHttp, error) {
			if (error) {
				_this.onerror(error);
				typeof callback === 'function' && callback(error);
				return Work_crawler.THROWED;
			}

			var html = XMLHttp.responseText;
			try {
				_this.server_list = _this.parse_server_list(html)
				// 確保有東西。
				.filter(function(server) {
					return !!server;
				}).unique();
			} catch (e) {
				_this.onerror(e);
				typeof callback === 'function' && callback(e);
				return Work_crawler.THROWED;
			}

			if (_this.server_list.length > 0) {
				library_namespace.log({
					// gettext_config:{"id":"get-$2-servers-from-$1-$3"}
					T : [ '從[%1]取得 %2 個圖片伺服器：%3', server_URL,
							_this.server_list.length,
							_this.server_list.join(', ') ]
				});
				if (server_file) {
					node_fs.writeFileSync(server_file, JSON
							.stringify(_this.server_list));
				}
			} else {
				library_namespace.error([ 'set_server_list: ', {
					// No server get from [%1]!
					// gettext_config:{"id":"unable-to-extract-the-image-server-list-from-$1"}
					T : [ '無法從[%1]抽取出圖片伺服器列表！', server_URL ]
				} ]);
			}

			typeof callback === 'function' && callback();
		}, null, true);
	}

	// front end #1: start downloading operation
	// callback(work_data)
	function start_downloading(work_id, callback) {
		if (!work_id) {
			library_namespace.log({
				// gettext_config:{"id":"$1-work_id-not-given"}
				T : [ '%1: 沒有輸入 work_id！', this.id ]
			});
			return;
		}

		if (this.charset
				&& !library_namespace.character.is_loaded(this.charset)) {
			// 載入需要的字元編碼。
			library_namespace.character.load(this.charset, start_downloading
					.bind(this, work_id, callback));
			return;
		}

		if (this.convert_to_language) {
			// CeL.CN_to_TW('简体')
			library_namespace.run('extension.zh_conversion', function() {
				library_namespace.zh_conversion.CN_to_TW
				//
				= library_namespace.CN_to_TW = library_namespace.zh_conversion
				// 小說不需要轉換資訊科技相關字詞。
				.generate_converter('CN_to_TW', {
					file_filter : function(file) {
						return !file.includes('TWPhrasesIT');
					}
				}
				// 2022/2/12 修改字典之後可用 TWPhrasesIT。
				&& null);
			});
		}

		library_namespace.log([ this.id, ': ',
		//
		(new Date).format('%Y/%m/%d %H:%M:%S'), ' ', {
			// 開始下載/處理
			// gettext_config:{"id":"starting-«$1»-save-to-$2"}
			T : [ '開始處理《%1》，儲存至 %2', work_id, this.main_directory ]
		} ]);
		// prepare work directory.
		library_namespace.create_directory(this.main_directory);
		// check if this.main_directory exists.
		// e.g., set "E:\directory\" but "E:\" do not exists.
		if (!library_namespace.directory_exists(this.main_directory)) {
			library_namespace.error({
				T : [
				// gettext_config:{"id":"cannot-create-base-directory-$1"}
				'Cannot create the base directory for downloading files: %1',
						this.main_directory ]
			});
			return;
		}

		this.setup_value('Referer', this.base_URL);

		if (!this.server_URL) {
			this.parse_work_id(work_id, callback);
			return;
		}

		var _this = this,
		// host_file
		server_file = this.main_directory + 'servers.json';

		if (this.use_server_cache
		// host_list
		&& (this.server_list = library_namespace.get_JSON(server_file))) {
			// use cache of host list. 不每一次重新獲取伺服器列表。
			this.parse_work_id(work_id, callback);
			return;
		}

		this.set_server_list(this.server_URL, function(error) {
			if (error)
				callback();
			else
				_this.parse_work_id(work_id, callback);
		}, server_file);
	}

	/**
	 * front end #2: start get work information operation. e.g., search only, no
	 * download.
	 * 
	 * @param {String}work_id
	 *            作品標題/作品名稱
	 * @param {Function}callback
	 *            callback function(work_data).
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項
	 * 
	 * @examples <code>

	var work_crawler = new CeL.work_crawler(configurations);
	work_crawler.data_of(work_id, function(work_data) {
		console.log(work_data);
	});

	 * </code>
	 */
	function start_get_data_of(work_id, callback, options) {
		function start_get_data_of_callback(work_data) {
			typeof callback === 'function' && callback.call(this, work_data);
		}
		start_get_data_of_callback.options = Object.assign({
			// get_information_only
			get_data_only : true
		}, options);

		// TODO: full test
		this.start(work_id, start_get_data_of_callback);
	}

	// --------------------------------------------------------------------------------------------

	// this.get_URL(url, callback, post_data, get_URL_options, charset)
	function this_get_URL(url, callback, post_data, get_URL_options, charset) {
		if (Array.isArray(url) && !post_data && !get_URL_options) {
			// this.get_URL([ url, post_data, get_URL_options ])
			post_data = url[1];
			get_URL_options = url[2];
			url = url[0];
		}

		// console.trace(url);
		url = this.full_URL(url);
		// console.trace(url);

		// console.trace(this.get_URL_options);
		if (get_URL_options === true) {
			// this.get_URL(url, callback, post_data, true)
			get_URL_options = Object.assign({
				error_retry : this.MAX_ERROR_RETRY
			}, this.get_URL_options);
		} else if (library_namespace.is_Object(get_URL_options)) {
			// this.get_URL(url, callback, post_data, get_URL_options)
			var headers = Object.assign(Object.create(null),
					this.get_URL_options.headers, get_URL_options.headers);
			get_URL_options = Object.assign(Object.create(null),
					this.get_URL_options, get_URL_options);
			get_URL_options.headers = headers;
		} else {
			// assert: !get_URL_options === true
			get_URL_options = this.get_URL_options;
		}

		var fetch_type = get_URL_options.fetch_type;
		if (!fetch_type && this.image_types && (new RegExp('\.(?:'
		// e.g., /(?:jpg|png)(?:$|\?)/i
		+ Object.keys(this.image_types).join('|') + ')(?:$|\\?)', 'i'))
		//
		.test(url)) {
			// treat as image
			get_URL_options.fetch_type = 'image';
			// Will set headers @ function get_URL_node()
		} else if (fetch_type && fetch_type !== 'document'
				&& fetch_type !== 'image') {
			library_namespace.error('this_get_URL: Invalid fetch_type: '
					+ fetch_type);
		}

		// console.trace(get_URL_options);
		// console.trace(url);

		// callback(result_Object, error)
		get_URL(url, callback && callback.bind(this)
				|| library_namespace.null_function, charset || this.charset,
				post_data, get_URL_options);
	}

	// --------------------------------------------------------------------------------------------

	// /./ doesn't include "\r", can't preserv line separator.
	var PATTERN_favorite_list_token = /(?:\r?\n|^)(\s*\/\*[\s\S]*?\*\/([^\r\n]*)|[^\r\n]*)/g;
	// 解析及操作列表檔案的功能。 最愛清單 / 圖書館 / 書籤 / 書庫
	function parse_favorite_list(work_list_text, options) {
		if (options === true) {
			options = {
				rearrange_list : true
			};
		} else {
			options = library_namespace.setup_options(options);
		}

		var remove_list = options.remove, rearrange_list = options.rearrange_list
				|| remove_list;
		if (remove_list && !Array.isArray(remove_list)) {
			remove_list = [ remove_list ];
		}
		/** {Boolean} get parsed data */
		var get_parsed = options.get_parsed || rearrange_list;

		var matched, work_list = [], work_hash = Object.create(null), parsed;
		work_list.blank = work_list.comments = work_list.duplicated = 0;
		work_list.work_indexes = [];
		if (get_parsed) {
			parsed = work_list.parsed = [];
			parsed.duplicated = [];
			parsed.line_separator = library_namespace
					.determine_line_separator(work_list_text);
			parsed.toString = function() {
				return this.join(this.line_separator);
			};
			// /(?:^|\n).../ 會無限次 match '\n...'，
			// 故改 /(?:\n|^)
			// 但這遇到 '\n...' 會少一個 ''。
			if (/^\r?\n/.test(work_list_text)) {
				parsed.push('');
			}
		}

		if (!work_list_text) {
			// PATTERN_favorite_list_token 會無限次 match ''。
			return work_list;
		}

		while (matched = PATTERN_favorite_list_token.exec(work_list_text)) {
			// or work id
			var work_title = matched[1], remove_it = false;
			if (parsed) {
				// `work_title` includes "\r"
				parsed.push(work_title);
			}

			// .trim() 會去掉 "\r", BOM (byte order mark)
			work_title = work_title.trim();

			// 定義列表檔案的規範，可以統合設定檔案的規範。
			if (!work_title) {
				// Skip blank line
				work_list.blank++;
			} else if (work_title.startsWith('#')
					|| work_title.startsWith('//')) {
				// Skip comments
				work_list.comments++;
			} else if (work_title.startsWith('/*')) {
				work_list.comments++;
				if (matched[2] && (matched[2] = matched[2].trim())) {
					// gettext_config:{"id":"$1-at-the-back-of-listed-work-with-*-will-be-ignored"}
					library_namespace.warn(gettext('作品列表區塊注解 "*/" 後面的"%1"會被忽略',
							matched[2]));
				}
			} else if ((work_title in work_hash)
					|| (remove_it = remove_list
							&& remove_list.includes(work_title))) {
				if (!remove_it)
					work_list.duplicated++;
				if (parsed) {
					// 改變原先的 list data。
					if (!remove_it)
						parsed.duplicated.push(work_title);
					if (rearrange_list) {
						if (typeof rearrange_list === 'function') {
							rearrange_list(parsed);
						} else {
							// comment out this work title / work id
							parsed[parsed.length - 1] = '#' + parsed.at(-1);
						}
					}
				}
			} else {
				// verify work titles: .unique(), 避免同一次作業中重複下載相同的作品。
				work_hash[work_title] = null;
				work_list.push(work_title);
			}
		}

		// need `delete work_list.parsed` yourself
		return work_list;
	}

	Work_crawler.parse_favorite_list = parse_favorite_list;

	// parse and rearrange favorite list file
	function parse_favorite_list_file(favorite_list_file_path,
			rearrange_list_file) {
		var work_list = library_namespace.fs_read(favorite_list_file_path);
		if (!work_list) {
			// 若是檔案不存在，.fs_read() 可能會回傳 undefined。
			library_namespace.warn(this.id + ': '
			// gettext_config:{"id":"cannot-read-series-titles-$1"}
			+ gettext('無法讀取作品清單檔案：%1', favorite_list_file_path));
			return [];
		}

		if (rearrange_list_file === undefined) {
			rearrange_list_file = this.rearrange_list_file;
		}
		if (rearrange_list_file) {
			library_namespace.debug(this.id + ': '
			// gettext_config:{"id":"rearrange-series-titles-$1"}
			+ gettext('重新整理作品清單檔案：%1', favorite_list_file_path));
		}
		work_list = parse_favorite_list(work_list.toString(), {
			rearrange_list : rearrange_list_file
		});
		work_list.path = favorite_list_file_path;

		if (rearrange_list_file) {
			if (work_list.duplicated > 0) {
				// console.log(work_list.parsed);
				work_list.parsed = work_list.parsed.toString();
				library_namespace.info(this.id
						+ ': '
						+ gettext(typeof rearrange_list_file === 'function'
						// rearrange_list_file 整合報告
						// gettext_config:{"id":"processed-$2-series-titles-$1"}
						? '重新整理作品清單檔案 [%1]，處理了 %2 個作品{{PLURAL:%2|標題}}。'
						// gettext_config:{"id":"commented-out-$2-series-titles-$1"}
						: '重新整理列表檔案 [%1]，注解/排除了%2個{{PLURAL:%2|作品}}。',
								favorite_list_file_path, work_list.duplicated));
				library_namespace.write_file(favorite_list_file_path,
						work_list.parsed);
			} else {
				library_namespace.debug(this.id + ': '
				// gettext_config:{"id":"no-change-to-series-titles-$1"}
				+ gettext('作品清單檔案未作改變：[%1]' + favorite_list_file_path));
			}
			// Release memory. 釋放被占用的記憶體。
			delete work_list.parsed;
		}

		return work_list;
	}

	function write_favorite_list(work_list_text, favorite_list_file_path) {
		if (!favorite_list_file_path)
			favorite_list_file_path = this.work_list_now.path;
		if (false) {
			console.log([ favorite_list_file_path,
					favorite_list_file_path + '.' + this.backup_file_extension,
					new_work_list.toString() ]);
			console.log(new_work_list);
		}
		// 先創目錄。
		library_namespace.create_directory(favorite_list_file_path.replace(
				/[^\\\/]+$/g, ''));
		// backup old favorite list file 備份最後一次修改前的書籤，預防一不小心操作錯誤時還可以補救。
		if (library_namespace.storage.file_exists(favorite_list_file_path)) {
			library_namespace.move_file(favorite_list_file_path,
			// e.g., 'favorite.txt.bak'
			favorite_list_file_path + '.' + this.backup_file_extension);
		}
		library_namespace.write_file(favorite_list_file_path, work_list_text
				.toString());
	}

	// --------------------------------------------------------------------------------------------

	function parse_work_id(work_id, callback) {
		work_id = String(work_id);

		if (this.convert_id && this.convert_id[work_id]) {
			// 因為 convert_id[work_id]() 可能回傳 list，因此需要以 get_work_list() 特別處理。
			this.get_work_list([ work_id ], callback);
			return;
		}

		if (work_id
		// list=filename
		.startsWith('l=') || node_fs.existsSync(work_id)) {
			// e.g.,
			// node 各漫畫網站工具檔.js l=各漫畫網站工具檔.txt
			// node 各漫畫網站工具檔.js 各漫畫網站工具檔.txt
			// @see http://ac.qq.com/Rank/comicRank/type/pgv
			if (work_id.startsWith('l=')) {
				work_id = work_id.slice('l='.length);
			}
			if (/\.js$/i.test(work_id)) {
				library_namespace.warn(this.id + ': '
				// gettext_config:{"id":"you-might-have-mistaken-the-download-tools-as-series-titles"}
				+ gettext('您可能錯把下載工具檔當作了列表檔案：%1', work_id));
				[ '.lst', '.txt' ].some(function(extension) {
					var work_list_file = work_id.replace(/\.js$/i, extension);
					if (library_namespace.storage.file_exists(work_list_file)) {
						library_namespace.info(this.id + ': '
						// gettext_config:{"id":"using-series-titles-$1"}
						+ gettext('改為採用作品清單檔案：%1', work_list_file));
						work_id = work_list_file;
						return true;
					}
				}, this);
			}
			var work_list = this.parse_favorite_list_file(work_id);

			this.get_work_list(work_list, callback);
			return;
		}

		if (work_id
		// 跳過來自命令列參數的手動設定。
		&& !(work_id.match(/^[^=]*/)[0] in this.import_arg_hash)) {
			if (false && this.need_create_ebook) {
				this.get_work_list([ work_id ], callback);
			} else {
				// e.g.,
				// node 各漫畫網站工具檔.js 12345
				// node 各漫畫網站工具檔.js ABC
				this.get_work(work_id, callback);
			}
			return;
		}

		library_namespace.error([ 'parse_work_id: ', {
			// Invalid work id: %1
			// gettext_config:{"id":"invalid-work-id-$1"}
			T : [ '作品 id 無效：%1', work_id ]
		} ]);
		typeof callback === 'function' && callback();
	}

	// --------------------------------------------------------------------------------------------

	// archive old work
	// @since 2019/10/19 20:33:29
	function check_and_archive_old_work(work_data, work_list) {
		if (false) {
			console.log([ this.is_finished(work_data),
					work_data.last_file_modified_date, Date.now()
					//
					- Date.parse(work_data.last_file_modified_date) ]);
		}

		/**
		 * Warning:
		 * 本封存舊作品功能僅適用於會訪問到最新的章節檔案的工具檔。若工具檔不會遍歷所有章節檔案、訪問到最新的章節檔案，則得到的是錯誤的
		 * `work_data.last_file_modified_date`。此時必須避免執行本函數
		 * check_and_archive_old_work()。
		 * 
		 * e.g., work_crawler/sites/comico.js work_crawler/sites/dm5.js
		 */

		if (false) {
			console.trace([ this.archive_old_works,
					this.use_finished_date_to_archive_old_works ]);
		}
		if (!this.archive_old_works) {
			return;
		}

		var interval = typeof this.archive_old_works === 'string'
				&& library_namespace
						.to_millisecond(typeof this.archive_old_works);
		if (!(interval >= library_namespace.to_millisecond('1D'))) {
			// using default interval
			interval = library_namespace.to_millisecond(
			// test: 作品已完結 or 逾半年未下載新章節
			// 有些作品的已完結標記不確實，因此不能設太短。
			this.is_finished(work_data) ? '5 month' : '.5Y');
		}

		var latest_update = this.use_finished_date_to_archive_old_works
		// 以作品完結時間為分界來封存舊作品。預設為最後一次下載時間。
		&& crawler_namespace.set_last_update_Date(work_data)
		// .use_finished_date_to_archive_old_works 可以用來封存剛剛下載，但已完結許久、久未更新的作品。
		|| Date.parse(work_data.last_file_modified_date);
		if (false) {
			console.trace([ this.use_finished_date_to_archive_old_works,
					latest_update, Date.now() - latest_update > interval ]);
		}
		if (!(Date.now() - latest_update > interval)) {
			return;
		}

		// --------------------------------------

		// console.log(work_data);
		// console.log(work_list.path);

		if (this.modify_work_list_when_archive_old_works
		//
		&& work_list && work_list.path) {
			// Also remove work title + work id from work list
			library_namespace.info([ this.id + ': ', {
				// gettext_config:{"id":"remove-the-archived-work-from-the-list-of-works-«$1»"}
				T : [ '自作品列表中刪除將封存之作品：《%1》', work_data.title || work_data.id ]
			} ]);

			var work_list_text = library_namespace.read_file(work_list.path);
			work_list_text = work_list_text && work_list_text.toString();
			var new_work_list = parse_favorite_list(work_list_text, {
				get_parsed : true
			// remove : [ work_data.title, work_data.id ]
			}).parsed;

			var last_marked_index, archived_prefix = '# '
			// gettext_config:{"id":"archived"}
			+ gettext.append_message_tail_space('已封存：'),
			//
			prefix = '# ' + gettext(
			// '封存日期：%1，作品完結時間：%2',
			// gettext_config:{"id":"archived-date-$1-last-download-date-$2"}
			'封存日期：%1，最後一次於 %2 下載', (new Date).toISOString(),
			//
			library_namespace.is_Date(work_data.last_file_modified_date)
			//
			? work_data.last_file_modified_date.toISOString()
			//
			: work_data.last_file_modified_date) + new_work_list.line_separator
					+ archived_prefix;
			new_work_list.forEach(function(line, index) {
				var work = line.trim();
				if (work === work_data.input_title || work === work_data.title
						|| work == work_data.id) {
					new_work_list[index]
					// 接連被標示的，就不一個一個標示。
					= (last_marked_index + 1 === index ? archived_prefix
							: prefix)
							+ line;
					last_marked_index = index;
				}
			});

			this.write_favorite_list(new_work_list, work_list.path);
		}

		library_namespace.info([ this.id + ': ', {
			// gettext_config:{"id":"archive-the-old-work-«$1»"}
			T : [ '封存舊作品：《%1》', work_data.title || work_data.id ]
		} ]);

		// 登記作品已被封存
		crawler_namespace.set_work_status(work_data, 'archived at '
				+ (new Date).format());
		work_data.archived = new Date;
		// backup
		this.save_work_data(work_data, 'check_and_archive_old_work');

		// 將舊的作品搬移到 .archive_directory_name 資料夾內
		// @see function remove_old_ebooks(only_id) @ work_crawler/ebook.js
		var archive_directory = this.main_directory
				+ this.archive_directory_name;
		if (!library_namespace.directory_exists(archive_directory)) {
			library_namespace.create_directory(
			// 先創建封存用目錄。
			archive_directory);
		}

		if (false) {
			console.log(work_data);
			console.log([ work_data.directory,
					archive_directory + work_data.directory_name ]);
		}
		library_namespace.move_directory(work_data.directory, archive_directory
				+ work_data.directory_name);

		// assert: 在這之後不可再作任何 work_data.directory 下之 FSO 操作。
		return true;
	}

	function get_work_list(work_list, callback) {
		// console.log(work_list);
		// 真正處理的作品數。
		var work_count = 0, all_work_status = Object.create(null),
		//
		start_list_serial = this.start_list_serial;

		// console.log(start_list_serial);
		if (start_list_serial && !(start_list_serial >= 1)) {
			// start_list_serial=work_title
			start_list_serial = work_list.indexOf(start_list_serial);
			if (start_list_serial >= 0) {
				// start_list_serial starts from 1
				start_list_serial++;
			}
		}

		if (Array.isArray(this.work_list_now)
				&& this.work_list_now !== work_list) {
			library_namespace.error(gettext(
			// gettext_config:{"id":"warning-downloading-a-list-of-works-starting-with-$2-and-length-$1.-repeating-the-download-of-the-work-list-may-cause-an-error"}
			'警告：正下載以"%2"開始、長度 %1 的作品列表中。重複下載作品列表可能造成錯誤！',
					this.work_list_now.length, this.work_list_now[0]));
		}

		this.work_list_now = work_list;

		// assert: Array.isArray(work_list)
		work_list.run_serial(function for_each_title(get_next_work, work_title,
				this_index) {
			// 解開/插入作品。
			function insert_id_list(id_list) {
				if (Array.isArray(id_list) && id_list.length > 0) {
					library_namespace.info('get_work_list: ' + work_title
					// 插入list。
					+ ' → ' + id_list.join(', '));
					id_list.unshift(this_index, 0);
					Array.prototype.splice.apply(work_list, id_list);
				}
				get_next_work();
			}

			// work_list.list_serial: this.work_list_now.list_serial
			// this_index: convert to serial, and is next index
			work_list.list_serial = ++this_index;
			work_title = work_title.trim();
			if (!work_title
			// 指定了要開始下載的列表序號。將會跳過這個訊號之前的作品。
			|| /* start_list_serial > 0 && */this_index < start_list_serial) {
				// 直接進入下一個作品 work_title。
				get_next_work();
				return;
			}

			// 特別處理特定id。
			var id_converter = this.convert_id && this.convert_id[work_title];

			if (typeof id_converter === 'function') {
				// gettext_config:{"id":"using-convert_id-$1"}
				library_namespace.debug(gettext('Using convert_id[%1]',
						work_title), 3, 'get_work_list');
				// convert special work id:
				// convert_id:{id_type:function(insert_id_list,get_label){;insert_id_list(id_list);}}
				// insert_id_list: 提供異序(asynchronously,不同時)使用。
				// 警告: 需要自行呼叫 insert_id_list(id_list);
				id_converter.call(this, insert_id_list,
						crawler_namespace.get_label);
				return;
			}

			if (library_namespace.is_Object(id_converter) && id_converter.url
					&& typeof id_converter.parser === 'function') {
				library_namespace.debug(
				// 從指定網址 id_converter.url 得到網頁內容後，
				// 丟給解析器 id_converter.parser 解析出作品列表。
				// gettext_config:{"id":"using-convert_id-$1-via-url-$2"}
				gettext('Using convert_id[%1] via url: %2', work_title,
						id_converter.url), 3, 'get_work_list');
				// convert_id:{id_type:{url:'',parser:function(html,get_label){...}}}
				this.get_URL(id_converter.url,
				//
				function(XMLHttp) {
					var id_list = id_converter.parser.call(this,
							XMLHttp.responseText, crawler_namespace.get_label);
					insert_id_list(id_list);
				}, null, true);
				return;
			}

			if (id_converter) {
				this.onerror('get_work_list: '
				// gettext_config:{"id":"invalid-id-converter-for-$1"}
				+ gettext('Invalid id converter for %1', work_title),
						work_title);
				typeof callback === 'function' && callback(all_work_status);
				return Work_crawler.THROWED;
			}

			work_count++;
			library_namespace.log([ this.id, ': ', {
				// gettext_config:{"id":"downloading-$1-$2"}
				T : [ 'Downloading %1: %2', work_count
				// 下載作品列表 %1：%2。
				+ (work_count === this_index ? '' : '/' + this_index)
				//
				+ '/' + work_list.length, work_title ],
				S : {
					color : 'magenta',
					backgroundColor : 'cyan'
				}
			} ]);

			this.get_work(work_title, function(work_data) {
				check_and_archive_old_work.call(this, work_data, work_list);

				var work_status = crawler_namespace.set_work_status(work_data);
				if (work_status) {
					// 把需要報告的狀態export到{Array}work_status。
					// assert: {Array}work_status
					if (work_data.id) {
						work_status.id = work_data.id;
						work_status.url = this.full_URL(this.work_URL,
								work_data.id);
					}
					work_status.title = work_data.title || work_title;
					var last_update = [];
					this.last_update_status_keys.forEach(function(key) {
						if (work_data[key])
							last_update.push(key + ': ' + work_data[key]);
					});
					work_status.last_update = last_update.unique().join(', ');
					// console.log(work_status);
					all_work_status[work_status.title] = work_status;
				}
				// console.trace('' + get_next_work);
				get_next_work();
			});

		}, function all_works_done() {
			delete this.work_list_now;
			library_namespace.log([ this.id + ': ', {
				// gettext_config:{"id":"a-total-of-$1-works-have-been-downloaded"}
				T : [ '共%1個作品下載完畢。', work_list.length ]
			}, (new Date).format() ]);
			var work_status_titles = Object.keys(all_work_status);
			if (work_status_titles.length > 0) {
				library_namespace.create_directory(
				// 先創建記錄用目錄。
				this.main_directory + this.log_directory_name);
				try {
					node_fs.writeFileSync(this.main_directory
					//
					+ this.log_directory_name + this.report_file_JSON,
					//
					JSON.stringify({
						date : (new Date).toISOString(),
						status : all_work_status
					}));
				} catch (e) {
					// TODO: handle exception
				}

				var report_file = this.main_directory + this.log_directory_name
						+ this.report_file,
				// 產生網頁形式的報告檔。
				reports = [ '<html>', '<head>',
				// http://mdn.beonex.com/en/Web_development/Historical_artifacts_to_avoid.html
				// https://developer.mozilla.org/zh-TW/docs/Web_%E9%96%8B%E7%99%BC/Historical_artifacts_to_avoid
				'<meta charset="UTF-8" />', '<style>',
						'table{border-collapse:collapse}',
						'table,th,td{border:1px solid #55f;padding:.2em}',
						'</style>', '</head>', '<body>', '<h2>',
						'<a href="' + this.base_URL + '">',
						this.site_name || this.id, '</a>', '</h2>', '<table>',
						'<tr><th>#</th><th>id</th>',
						'<th>title</th><th>status</th>',
						'<th>last update</th></tr>' ];
				library_namespace.info([
						this.id + ': ',
						{
							// gettext_config:{"id":"$1-works-produced-special-conditions-recorded-in-$2"}
							T : [ '共%1個作品出現特殊狀況，記錄於[%2]。',
									work_status_titles.length, report_file ]
						} ]);
				work_status_titles.forEach(function(work_title, index) {
					var work_status = all_work_status[work_title];
					// assert: {Array}work_status
					library_namespace.info(work_title + ': '
							+ work_status.join(', '));
					var work_status_report = work_status.map(function(status) {
						var color;
						switch (status) {
						case 'not found':
							color = '#f44';
							break;

						case 'limited':
							color = '#bb0';
							break;

						case 'finished':
							color = '#88f';
							break;

						default:
							break;
						}

						if (color) {
							status = '<b style="color:' + color + ';">'
							//
							+ gettext('work_status-' + status) + '</b>';
						}
						return status;
					});
					reports.push('<tr><td>'
							+ (index + 1)
							+ '</td><td>'
							+ (work_status.id || '')
							+ '</td><td>'
							+ (work_status.url ? '<a href="' + work_status.url
									+ '">' + work_status.title + '</a>'
									: work_status.title) + '</td><td>'
							+ work_status_report.join('<br />') + '</td><td>'
							+ work_status.last_update + '</td></tr>');
				});
				reports.push('</table>', '</body></html>');
				try {
					node_fs.writeFileSync(report_file, reports
							.join(library_namespace.env.line_separator));
				} catch (e) {
					// TODO: handle exception
				}

			} else {
				all_work_status = undefined;
			}
			typeof callback === 'function' && callback(all_work_status);
		}, this);
	}

	// ----------------------------------------------------------------------------

	// const
	var STOP_TASK = typeof Symbol === 'function' ? Symbol('STOP_TASK') : {
		stop : true
	},
	// const: cancel task
	QUIT_TASK = typeof Symbol === 'function' ? Symbol('QUIT_TASK') : {
		quit : true
	};

	// this.continue_arguments =
	// undefined : 沒有設定特殊控制作業，正常執行或沒有作業執行中。
	// [ STOP_TASK, callback_after_stopped ] : 等待作業暫停中。
	// [ QUIT_TASK, callback_after_quitted ] : 等待作業取消中。
	// [ work_data, chapter_NO, callback ] : 作業已經暫停，等待重啟中。

	// 🛑 Stop Sign
	function is_stopping_now(quit) {
		return Array.isArray(this.continue_arguments)
				&& this.continue_arguments[0] === (quit ? QUIT_TASK : STOP_TASK);
	}

	// callback: 暫停/取消作業之後執行
	function stop_task(quit, callback) {
		if (!this.running) {
			return;
		}

		if (!this.continue_arguments) {
			// set flag to pause / cancel task
			library_namespace.info([ this.id + ': ', {
				// gettext_config:{"id":"ready-to-cancel-the-download-job.-it-will-take-effect-after-downloading-this-chapter"}
				T : quit ? '準備取消下載作業中，將會在下載完本章節後生效。'
				// gettext_config:{"id":"prepare-to-pause-the-download.-it-will-take-effect-after-downloading-this-chapter"}
				: '準備暫停下載作業中，將會在下載完本章節後生效。'
			} ]);
			this.continue_arguments = [ quit ? QUIT_TASK : STOP_TASK ];
			if (callback) {
				this.continue_arguments.push(callback);
			}
			// return this.continue_arguments[0];
		}

		if (this.is_stopping_now() || this.is_stopping_now(true)) {
			// 等待作業暫停/取消中，改變作業流程控制設定。
			var _arguments = this.continue_arguments;
			_arguments[0] = quit ? QUIT_TASK : STOP_TASK;
			if (callback) {
				_arguments.push(callback);
			}
			// return _arguments[0];
			return;
		}

		// assert: 作業暫停中， is stopped now
		// assert: this.continue_arguments
		// === [ work_data, chapter_NO, callback ]

		if (!quit) {
			callback && callback();
			// return STOP_TASK;
			return;
		}

		// 作業暫停中，取消作業。必須重啟作業。
		var _arguments = this.continue_arguments;
		this.continue_arguments = [ QUIT_TASK, callback ];
		crawler_namespace.pre_get_chapter_data.apply(this, _arguments);
		// return QUIT_TASK;
	}

	// resume
	function continue_task(callback) {
		if (!this.continue_arguments) {
			callback && callback(this.running);
			return;
		}

		if (this.is_stopping_now() || this.is_stopping_now(true)) {
			// 等待作業暫停/取消中，改變作業流程控制設定。改成繼續下載作業。
			callback && callback(null, this.continue_arguments);
			this.continue_arguments.forEach(function(callback, index) {
				index > 0 && callback && callback('continue');
			});
			// reset flow control flag
			delete this.continue_arguments;
			return;
		}

		// assert: 作業暫停中， is stopped now
		// assert: this.continue_arguments
		// === [ work_data, chapter_NO, callback ]

		// 作業暫停中，重啟作業。繼續下載作業。
		var _arguments = this.continue_arguments, work_data = _arguments[0];
		// reset flow control flag
		delete this.continue_arguments;
		callback && callback(work_data);
		library_namespace.info([ this.id + ': ', {
			// gettext_config:{"id":"continue-downloading-«$1»"}
			T : [ '繼續下載《%1》。', work_data.title || work_data.id ]
		} ]);
		crawler_namespace.pre_get_chapter_data.apply(this, _arguments);
	}

	// estimated time of completion 估計時間 預計剩下時間 預估剩餘時間 預計完成時間還要多久
	function estimated_message(work_data, chapter_NO) {
		if (!(work_data.chapter_count > chapter_NO))
			return;

		// 到現在使用時間 (ms)
		var time_used = Date.now() - work_data.start_downloading_time,
		// chapter_NO starts from 1
		chapters_to_download = work_data.chapter_count - (chapter_NO - 1),
		// this.start_downloading_chapter starts from 1
		chapters_downloaded = chapter_NO - work_data.start_downloading_chapter,
		// 預估剩餘時間 estimated time remaining (ms)
		estimated_time = chapters_to_download *
		// 到現在平均每個章節使用時間。
		time_used / chapters_downloaded;

		// 限制顯示訊息的上下限：僅此範圍內顯示訊息。
		if (!(1e3 < estimated_time && estimated_time < 1e15/* Infinity */)) {
			return '';
		}
		// gettext_config:{"id":"estimated-$1-to-download"}
		return gettext('預估還需 %1 下載完本作品。', library_namespace.age_of(0,
				estimated_time, {
					digits : 1
				}));
	}

	// --------------------------------------------------------------------------------------------

	// export 導出.

	// @instance
	Object.assign(Work_crawler.prototype, {
		onwarning : onwarning,
		onerror : onerror,

		setup_agent : setup_agent,
		data_of : start_get_data_of,

		is_stopping_now : is_stopping_now,
		stop_task : stop_task,
		continue_task : continue_task,

		estimated_message : estimated_message,
		// this.get_URL(url, function callback(XMLHttp) {})
		get_URL : this_get_URL,

		// 需要重新讀取頁面的時候使用。
		REGET_PAGE : typeof Symbol === 'function' ? Symbol('REGET_PAGE') : {
			REGET_PAGE : true
		},

		work_URL : function work_URL(work_id) {
			// default work_URL: this.base_URL + work_id + '/'
			return work_id + '/';
			// or you may use:
			return work_id + '/' + work_id + '.html';
			return work_id + '.html';
		},
		/**
		 * 對於章節列表與作品資訊分列不同頁面(URL)的情況，應該另外指定 .chapter_list_URL。 e.g., <code>
		chapter_list_URL : '',
		chapter_list_URL : function(work_id) { return this.work_URL(work_id) + 'chapter/'; },
		chapter_list_URL : function(work_id, work_data) { return [ 'url', { post_data } ]; },
		 </code>
		 */
		// 當有設定work_data.chapter_list的時候的預設函數，由 this.get_chapter_data() 呼叫。
		chapter_URL : function chapter_URL(work_data, chapter_NO) {
			// chapter_NO starts from 1
			var chapter_data = Array.isArray(work_data.chapter_list)
					&& work_data.chapter_list[chapter_NO - 1];
			// console.log(work_data.chapter_list);
			// console.log(chapter_data);
			// console.trace(chapter_NO + '/' + work_data.chapter_list.length);

			if (chapter_data && chapter_data.skip_this_chapter)
				return Work_crawler.SKIP_THIS_CHAPTER;

			if (typeof chapter_data === 'string') {
				// treat chapter_data as chapter url
				return chapter_data;
			}

			// e.g., work_data.chapter_list = [ chapter_data,
			// chapter_data={url:'',title:'',date:new Date}, ... ]
			return chapter_data && chapter_data.url;

			return this.full_URL(this.work_URL, work_data.id)
					+ chapter_data.url;
		},

		start : start_downloading,
		set_server_list : set_server_list,
		parse_work_id : parse_work_id,
		get_work_list : get_work_list,

		// 封存舊作品。
		archive_old_works : false,
		// 同時自作品列表中刪除將封存之作品。
		modify_work_list_when_archive_old_works : true,

		parse_favorite_list_file : parse_favorite_list_file,
		write_favorite_list : write_favorite_list
	});

	// 不設定(hook)本 module 之 namespace，僅執行 module code。
	return library_namespace.env.not_to_extend_keyword;
}
