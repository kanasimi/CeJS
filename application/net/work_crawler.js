/**
 * @name CeL function for downloading online works (novels, comics).
 * 
 * @fileoverview 本檔案包含了批量下載網路作品（小說、漫畫）的函式庫。 WWW work crawler library.
 * 
 * <code>


TODO:

將設定儲存在系統預設的設定目錄
Windows: %APPDATA%\work_crawler\
UNIX: $HOME/.work_crawler/

搜尋已下載作品

save cookie @ CLI

建造可以自動生成index/說明的工具。
	自動判別網址所需要使用的下載工具，輸入網址自動揀選所需的工具檔案。
	從其他的資料來源網站尋找，以獲取作品以及章節的資訊。
	自動記得某個作品要從哪些網站下載。

GUI開啟錯誤紀錄

增加版本上報

漫畫下載流程教學

CLI progress bar
下載完畢後作繁簡轉換。
在單一/全部任務完成後執行的外部檔+等待單一任務腳本執行的時間（秒數）
用安全一點的 eval()
	Runs untrusted code securely https://github.com/patriksimek/vm2
parse 圖像。
拼接長圖之後重新分割：以整個橫切全部都是同一顏色白色為界，並且可以省略掉相同顏色的區塊。 using .epub
	處理每張圖片被分割成多個小圖的情況 add .image_indexes[] ?
檢核章節內容。
考慮 search_URL 搜尋的頁數，當搜索獲得太多結果時也要包含所有結果

detect encoded data:
https://gchq.github.io/CyberChef/

</code>
 */

// More examples: See 各網站工具檔.js: https://github.com/kanasimi/work_crawler
'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

if (typeof CeL === 'function') {
	// 忽略沒有 Windows Component Object Model 的錯誤。
	CeL.env.ignore_COM_error = true;

	CeL.run({
		// module name
		name : 'application.net.work_crawler',

		// .includes() @ CeL.data.code.compatibility
		require : 'data.code.compatibility.'
		// .between() @ CeL.data.native
		// .append() @ CeL.data.native
		// .pad() @ CeL.data.native
		// display_align() @ CeL.data.native
		+ '|data.native.'
		// for CeL.to_file_name()
		+ '|application.net.'
		// for CeL.env.arg_hash, CeL.fs_read()
		+ '|application.platform.nodejs.|application.storage.'
		// for CeL.storage.file.file_type()
		+ '|application.storage.file.'
		// for HTML_to_Unicode()
		+ '|interact.DOM.'
		// for Date.prototype.format(), String.prototype.to_Date(),
		// .to_millisecond()
		+ '|data.date.'
		// CeL.character.load(), 僅在要設定 this.charset 時才需要載入。
		+ '|data.character.'
		// gettext(), and for .detect_HTML_language(), .time_zone_of_language()
		+ '|application.locale.gettext'
		// guess_text_language()
		+ '|application.locale.encoding.'
		// storage.archive()
		+ '|application.storage.archive.',

		// 設定不匯出的子函式。
		no_extend : '*',

		// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
		code : module_code
	});
}

function module_code(library_namespace) {

	// requiring
	var
	// library_namespace.locale.gettext
	gettext = this.r('gettext'),
	/** node.js file system module */
	node_fs = library_namespace.platform.nodejs && require('fs');

	// --------------------------------------------------------------------------------------------

	function Work_crawler(configurations) {
		Object.assign(this, configurations);

		// 預設自動匯入 .env.arg_hash
		if (this.auto_import_args)
			this.import_args();

		// 在crawler=new CeL.work_crawler({})的情況下可能沒辦法得到準確的檔案路徑，因此這個路徑僅供參考。
		var main_script_path = library_namespace.get_script_base_path(/\.js/i,
				module);
		if (main_script_path)
			this.main_script = main_script_path;

		// this.id 之後將提供給 this.site_id 使用。
		// 在使用gui_electron含入檔案的情況下，this.id應該稍後在設定。
		if (!this.id) {
			this.id = this.main_script
			// **1** require.main.filename: 如 require('./site_id.js')
			// **2** 如 node site_id.js work_id
			&& this.main_script
			// 去掉 path
			.replace(/^[\s\S]*[\\\/]([^\\\/]+)$/, '$1')
			// 去掉 file extension
			.replace(/\.*[^.]+$/, '')
			// NOT require('./site_id.js'). 如 node site_id.js work_id
			|| this.main_directory.replace(/\.*[\\\/]+$/, '')
			// **3** others: unnormal
			|| this.base_URL.match(/\/\/([^\/]+)/)[1].toLowerCase().split('.')
			//
			.reverse().some(function(token, index) {
				if (index === 0) {
					// 頂級域名
					return false;
				}
				if (token !== 'www') {
					this.id = token;
				}
				if (token.length > 3 || index > 1) {
					// e.g., www.[id].co.jp
					return true;
				}
			}, this);
			if (!this.id && !(this.id = this.id.match(/[^\\\/]*$/)[0])) {
				library_namespace.error({
					// gettext_config:{"id":"cannot-detect-work-id-from-url-$1"}
					T : [ '無法從網址擷取作品 id：%1', this.base_URL ]
				});
			}
		}
		// gettext_config:{"id":"starting-$1"}
		process.title = gettext('Starting %1', this.id);

		if (library_namespace.is_digits(this.baidu_cse)) {
			if (!this.parse_search_result) {
				// for 百度站内搜索工具。非百度搜索系統得要自己撰寫。
				this.parse_search_result = 'baidu';
			}
			// baidu cse id 百度站内搜索工具。
			if (!this.search_URL) {
				this.search_URL = {
					URL : 'http://zhannei.baidu.com/cse/search?s='
					// &ie=utf-8 &isNeedCheckDomain=1&jump=1 &entry=1
					+ this.baidu_cse + '&q=',
					charset : 'UTF-8'
				};
			}
		}

		if (typeof this.parse_search_result === 'string') {
			if (crawler_namespace.parse_search_result_set[this.parse_search_result]) {
				this.parse_search_result = crawler_namespace.parse_search_result_set[this.parse_search_result];
			} else {
				this.onerror('Work_crawler: No this parse_search_result: '
						+ this.parse_search_result, work_data);
				return Work_crawler.THROWED;
			}
		}

		// 設定預設可容許的最小圖像大小。
		if (!(this.MIN_LENGTH >= 0)) {
			// 先設定一個，預防到最後都沒有被設定到。
			this.setup_value('MIN_LENGTH', 'default');
		}

		// @see function this_get_URL() @ CeL.application.net.work_crawler.task
		this.get_URL_options = {
			// start_time : Date.now(),
			no_protocol_warn : true,
			headers : Object.assign({
			// Referer will set @ start_downloading()
			// Referer : this.base_URL
			}, this.headers)
		};

		this.setup_value('timeout', this.timeout);
		this.setup_value('user_agent', this.user_agent
				|| crawler_namespace.regenerate_user_agent(this));

		// console.log(this.get_URL_options);
		this.default_agent = this.setup_agent();
	}

	// @inner static functions
	var crawler_namespace = Object.create(null);
	Work_crawler.crawler_namespace = crawler_namespace;

	// ------------------------------------------

	var KEY_converted_text = 'converted_text';

	// return needing to wait language converted
	// var promise_language = this.cache_converted_text(text_list);
	// if (promise_language) { return promise_language.then(); }
	function cache_converted_text(text_list, options) {
		if (!this.convert_to_language)
			return;

		var initializated = this.convert_text_language_using
				&& this.convert_to_language_using === this.convert_to_language;
		if (initializated && !this.convert_text_language_using.is_asynchronous) {
			// 無須 cache，直接用 this.convert_text_language(text) 取得繁簡轉換過的文字即可。
			return;
		}

		if (!this.converted_text_cache) {
			this.converted_text_cache = Object.create(null);
			this.converted_text_cache_persisted = Object.create(null);
		}

		if (!Array.isArray(text_list))
			text_list = [ text_list ];

		var _this = this, promise_list = [];
		text_list = text_list.filter(function(text) {
			// @see function convert_text_language(text, options)
			if (!text || !text.trim())
				return false;

			if (text in _this.converted_text_cache) {
				_this.converted_text_cache[text].requiring_thread_count++;
				if (!_this.converted_text_cache[text][KEY_converted_text]) {
					promise_list.push(
					//
					_this.converted_text_cache[text].promise);
				}
				// 先前已要求過要轉換這段文字。不需要再要求一次。
				return false;
			} else {
				// 正常情況: 首次要求轉換這段文字。
				if (initializated) {
					_this.converted_text_cache[text] = {
						requiring_thread_count : 1
					};
				}
				// 尚未初始化的情況下，還是必須 return true 以讓 text_list.length > 0 並執行初始化。
				return true;
			}
		});
		// console.trace(initializated, text_list, promise_list);
		if (text_list.length === 0) {
			// !promise_list: Already cached all text needed.
			return promise_list.length > 0 && Promise.all(promise_list);
		}

		if (false) {
			console.trace(library_namespace.string_digest(text_list));
		}
		if (initializated) {
			// 初始化後正常的程序。
			if (false) {
				console.trace('Convert text:', library_namespace
						.string_digest(text_list));
			}
			var promise = this.convert_text_language_using(text_list, options);
			// console.trace(promise);
			// assert: .convert_text_language_using() return thenable
			promise = promise
			//
			.then(function set_text_list(converted_text_list) {
				if (false) {
					console.trace('Set converted cache:',
					//
					library_namespace.string_digest(text_list),
					//
					library_namespace.string_digest(converted_text_list));
				}
				text_list.forEach(function(text, index) {
					// free
					delete _this.converted_text_cache[text].promise;
					_this.converted_text_cache[text][KEY_converted_text]
					// assert: {Object}_this.converted_text_cache[text]
					// && !!converted_text_list[index] === true
					= converted_text_list[index];
				});
				// console.trace(_this.converted_text_cache);
				if (false) {
					return [ text_list, converted_text_list ];
				}
			});
			text_list.forEach(function(text) {
				_this.converted_text_cache[text].promise = promise;
			});
			promise_list.push(promise);
			if (false) {
				console.trace(promise_list);
			}
			return Promise.all(promise_list);
		}

		// console.trace('cache_converted_text: 初始化 initialization');

		// 僅有初始化時會執行一次。
		return Promise.resolve(library_namespace.using_CeCC({
			// e.g., @ function create_ebook()
			skip_server_test : options.skip_server_test,
			// 結巴中文分詞還太過粗糙，不適合依此做繁簡轉換。
			try_LTP_server : true
		})).then(function() {
			_this.convert_to_language_using = _this.convert_to_language;

			_this.convert_text_language_using
			// setup this.convert_text_language_using
			= _this.convert_to_language === 'TW'
			// library_namespace.extension.zh_conversion.CN_to_TW();
			? library_namespace.CN_to_TW : library_namespace.TW_to_CN;
			if (false) {
				console.trace('cache_converted_text: 初始化完畢。');
			}
		}).then(cache_converted_text.bind(this, text_list, options));
	}

	// Release memory. 釋放被占用的記憶體。
	function clear_converted_text_cache(options) {
		if (!this.convert_to_language)
			return;

		// console.trace(options);
		if (options === true) {
			options = {
				including_persistence : true
			};
		} else {
			options = library_namespace.setup_options(options);
		}

		// ('text' in options)
		if (typeof options.text === 'string') {
			if (false) {
				if (!this.converted_text_cache[options.text]) {
					console.trace(this.converted_text_cache);
					console.trace(this);
					console.trace(options);
				}
				console.trace('Free cache of '
				//
				+ library_namespace.string_digest(options.text)
				//
				+ ') requiring_thread_count='
				//
				+ (this.converted_text_cache[options.text]
				//
				&& this.converted_text_cache[options.text]
				//
				.requiring_thread_count));
			}
			// @see function cache_converted_text(text_list, options)
			if (options.text && options.text.trim()
			//
			&& --this.converted_text_cache[options.text]
			// 採用 .requiring_thread_count 以避免要求轉換相同文字，後來的取用時已被刪除。
			// 若相同操作會呼叫兩次 cache_converted_text()，例如初始化，則此法會出問題。
			.requiring_thread_count === 0) {
				if (false) {
					console.trace('clear_converted_text_cache: Delete '
							+ library_namespace.string_digest(options.text));
				}
				delete this.converted_text_cache[options.text];
			}
		} else {
			// console.trace(options);
			if (false) {
				console.trace('clear_converted_text_cache: Clear all cache');
				// 剩下的大多是章節名稱。
				var text_list = Object.keys(this.converted_text_cache);
				if (text_list.length > 0) {
					console.trace('clear_converted_text_cache: keys lift: '
							+ text_list.join(', '));
				}
			}
			delete this.converted_text_cache;
		}

		if (options.including_persistence)
			delete this.converted_text_cache_persisted;
	}

	function convert_text_language(text, options) {
		// @see function cache_converted_text(text_list, options)
		if (!text || !text.trim() || !this.convert_to_language)
			return text;

		if (!this.convert_text_language_using.is_asynchronous)
			return this.convert_text_language_using(text);

		// 當無法取得文章內容時，可能出現 this.converted_text_cache === undefined
		var converted_text_data = this.converted_text_cache[text];
		if (converted_text_data && converted_text_data[KEY_converted_text]) {
			if (false && text.length !== converted_text_data[KEY_converted_text].length) {
				throw new Error('Different length:\n' + text + '\n'
						+ converted_text_data[KEY_converted_text]);
			}
			if (options && options.persistence)
				this.converted_text_cache_persisted[text] = converted_text_data;
			return converted_text_data[KEY_converted_text];
		}

		if ((text in this.converted_text_cache_persisted)
				&& this.converted_text_cache_persisted[text][KEY_converted_text]) {
			return this.converted_text_cache_persisted[text][KEY_converted_text];
		}

		if (options && options.allow_non_cache) {
			return text;
		}

		// console.log(this.converted_text_cache);
		console.trace(library_namespace.string_digest(text, 200));
		console.trace(this);
		throw new Error(
		// 照理不該到這邊。
		'You should run `this.cache_converted_text(text_list)` first!');
	}

	// --------------------------------------------------------------------------------------------

	// 這邊放的是一些會在 Work_crawler_prototype 中被運算到的數值。

	/** {Natural}重試次數：下載失敗、出錯時重新嘗試下載的次數。同一檔案錯誤超過此數量則跳出。若值太小，在某些網站很容易出現圖片壞掉的問題。 */
	Work_crawler.MAX_ERROR_RETRY = 4;

	Work_crawler.HTML_extension = 'htm';

	// 數值規範設定於 import_arg_hash @ CeL.application.net.work_crawler.arguments
	var Work_crawler_prototype = {
		// 所有的子檔案要修訂注解說明時，應該都要順便更改在CeL.application.net.work_crawler中Work_crawler.prototype內的母comments，並以其為主體。

		// 下載檔案儲存目錄路徑。
		// 圖片檔與紀錄檔的下載位置。下載網路網站的作品檔案後，將儲存於此目錄下。
		// 這個目錄會在 work_crawler_loader.js 裡面被 setup_crawler() 之
		// global.data_directory 覆寫。
		main_directory : library_namespace.storage
		// 決定預設的主要下載目錄 default_main_directory。
		.determin_download_directory(true),

		// id : '',
		// site_id is also crower_id.
		// <meta name="generator" content="site_id" />
		// site_id : '',
		// base_URL : '',
		// charset : 'GBK',

		// 預設自動匯入 .env.arg_hash
		auto_import_args : true,

		// 本工具下載時預設的使用者代理為 Chrome，所以下載的檔案格式基本上依循用 Chrome 瀏覽時的檔案格式。
		// https://github.com/kanasimi/work_crawler/issues/548
		// 下載每個作品更換一次 user agent。
		// regenerate_user_agent : 'work',
		default_user_agent : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',

		// default directory_name_pattern 預設作品目錄名稱模式。
		directory_name_pattern : '${id_title}${directory_name_extension}',

		/**
		 * {Natural|String}timeout for get_URL()
		 * 下載網頁或圖片的逾時等待時間。若逾時時間太小（如10秒），下載大檔案容易失敗。
		 * 
		 * 注意: 因為 this.get_URL_options 在 constructor 中建構完畢，因此 timeout
		 * 會在一開始就設定。之後必須以 `this.setup_value('timeout', this.timeout);`
		 * 設定，否則沒有效果。
		 */
		timeout : '30s',
		// 本站速度頗慢，必須等待較久否則容易中斷。
		// timeout : '60s',

		/** {Natural}重試次數：下載失敗、出錯時重新嘗試下載的次數。同一檔案錯誤超過此數量則跳出。若值太小，在某些網站很容易出現圖片壞掉的問題。 */
		MAX_ERROR_RETRY : Work_crawler.MAX_ERROR_RETRY,
		/** {Natural}圖片下載未完全，出現 EOI (end of image) 錯誤時重新嘗試的次數。 */
		MAX_EOI_ERROR : Math.min(3, Work_crawler.MAX_ERROR_RETRY),
		// {Natural}MIN_LENGTH:最小容許圖片檔案大小 (bytes)。
		// 若值太小，傳輸到一半壞掉的圖片可能被當作正常圖片而不會出現錯誤。
		// 因為當前尚未能 parse 圖像，而 jpeg 檔案可能在檔案中間出現 End Of Image mark；
		// 因此當圖像檔案過小，即使偵測到以 End Of Image mark 作結，依然有壞檔疑慮。
		//
		// 對於極少出現錯誤的網站，可以設定一個比較小的數值，並且設定.allow_EOI_error=false。因為這類型的網站要不是無法獲取檔案，要不就是能夠獲取完整的檔案；要得到破損檔案，並且已通過EOI測試的機會比較少。
		// MIN_LENGTH : 4e3,
		// 對於有些圖片只有一條細橫桿的情況。
		// MIN_LENGTH : 130,

		// {Natural}預設所容許的章節最短內容字數。最少應該要容許一句話的長度。
		MIN_CHAPTER_SIZE : 200,

		// {String}預設的圖片類別/圖片延伸檔名/副檔名/檔案類別/image filename extension。
		default_image_extension : 'jpg',

		// cache directory below this.main_directory.
		// 必須以 path separator 作結。
		cache_directory_name : library_namespace.append_path_separator('cache'),
		// archive directory below this.main_directory for ebook / old comics.
		// 封存舊電子書、舊漫畫用的目錄。
		// 必須以 path separator 作結。
		archive_directory_name : library_namespace
				.append_path_separator('archive'),
		// log directory below this.main_directory 必須以 path separator 作結。
		log_directory_name : library_namespace.append_path_separator('log'),
		// 錯誤記錄檔案: 記錄無法下載的圖檔。
		error_log_file : 'error_files.txt',
		// 當從頭開始檢查時，會重新設定錯誤記錄檔案。此時會把舊的記錄檔改名成為這個檔案。
		// 移動完之後這個值會被設定為空，以防被覆寫。
		error_log_file_backup : 'error_files.'
				+ (new Date).format('%Y%2m%2dT%2H%2M%2S') + '.txt',
		// last updated date, latest update date. 最後更新日期時間。
		// latest_chapter_url → latest_chapter_url
		// latest_chapter_name, last_update_chapter → latest_chapter
		// update_time, latest_update → last_update
		// 這些值會被複製到記錄報告中，並用在 show_search_result() @ gui_electron_functions.js。
		last_update_status_keys : 'latest_chapter,last_update_chapter,latest_chapter,latest_chapter_name,latest_chapter_url,last_update,update_time'
				.split(','),
		// 記錄報告檔案/日誌的路徑。
		report_file : 'report.' + (new Date).format('%Y%2m%2dT%2H%2M%2S') + '.'
				+ Work_crawler.HTML_extension,
		report_file_JSON : 'report.json',

		backup_file_extension : 'bak',

		// default start chapter index: 1.
		// 將開始/接續下載的章節編號。對已下載過的章節，必須配合 .recheck。
		// 若是 start_chapter 在之前下載過的最後一個章節之前的話，那麼就必須要設定 recheck 才會有效。
		// 之前下載到第8章且未設定 recheck，則指定 start_chapter=9 **有**效。
		// 之前下載到第8章且未設定 recheck，則指定 start_chapter=7 **無**效。必須設定 recheck。
		// start_chapter : 1,
		start_chapter_NO : 1,
		// 是否重新獲取每個所檢測的章節內容 chapter_page。
		// 警告: reget_chapter=false 僅適用於小說之類不獲取圖片的情形，
		// 因為若有圖片（parse_chapter_data()會回傳chapter_data.image_list），將把chapter_page寫入僅能從chapter_URL獲取名稱的於目錄中。
		reget_chapter : true,
		// 是否保留 chapter page。false: 明確指定不保留，將刪除已存在的 chapter page。
		// 注意: 若是沒有設定 .reget_chapter，則 preserve_chapter_page 不應發生效用。
		preserve_chapter_page : false,
		// 是否保留作品資料 cache 於 this.cache_directory_name 下。
		preserve_work_page : false,
		// 是否保留損壞圖檔。
		preserve_bad_image : true,
		// 是否保留 cache
		// preserve_cache : true,
		// 當新獲取的檔案比較大時，覆寫舊的檔案。
		// https://github.com/kanasimi/work_crawler/issues/242
		overwrite_old_file : true,

		// recheck:從頭檢測所有作品之所有章節與所有圖片。不會重新擷取圖片。對漫畫應該僅在偶爾需要從頭檢查時開啟此選項。default:false
		// 每次預設會從上一次中斷的章節接續下載，不用特地指定 recheck。
		// 有些漫畫作品分區分單行本、章節與外傳，當章節數量改變、添加新章節時就需要重新檢查/掃描。
		// recheck='changed': 若是已變更，例如有新的章節，則重新下載/檢查所有章節內容。否則只會自上次下載過的章節接續下載。
		// recheck='multi_parts_changed': 當有多個分部的時候才重新檢查。
		// recheck : true,
		// recheck=false:明確指定自上次下載過的章節接續下載。
		// recheck : false,
		//
		// 當無法獲取 chapter 資料時，直接嘗試下一章節。在手動+監視下 recheck 時可併用此項。 default:false
		// skip_chapter_data_error : true,

		// 重新搜尋。default:false
		// search_again : false,

		// TODO: .heif
		image_types : {
			jpg : true,
			jpeg : true,
			// 抓取到非JPG圖片
			png : true,
			gif : true,
			webp : true,
			bmp : true
		},

		// 漫畫下載完畢後壓縮每個章節的圖像檔案。
		archive_images : true,
		// 完全沒有出現錯誤才壓縮圖片檔案。
		// archive_all_good_images_only : true,
		// 壓縮圖片檔案之後，刪掉原先的圖片檔案。 請注意：必須先安裝 7-Zip **18.01 以上的版本**。
		remove_images_after_archive : true,
		// or .cbz
		images_archive_extension : 'zip',

		// 由文章狀態/進程獲取用在作品完結的措辭。
		finished_words : finished_words,
		is_finished : is_finished,

		full_URL : full_URL_of_path,

		convert_text_language : convert_text_language,
		cache_converted_text : cache_converted_text,
		clear_converted_text_cache : clear_converted_text_cache,

		// work_data properties to reset. do not inherit
		// 設定不繼承哪些作品資訊。
		reset_work_data_properties : {
			limited : true,
			// work_data.recheck
			recheck : true,
			download_chapter_NO_list : true,
			// work_data.last_download
			last_download : true,
			start_chapter_NO_next_time : true,

			error_images : true,
			chapter_count : true,
			image_count : true
		}
	};

	Object.assign(Work_crawler.prototype, Work_crawler_prototype);
	// Release memory. 釋放被占用的記憶體。
	Work_crawler_prototype = null;

	// --------------------------------------------------------------------------------------------

	/**
	 * 重設瀏覽器識別 navigator.userAgent
	 * 
	 * CeL.work_crawler.regenerate_user_agent(crawler)
	 * 
	 * @return {String}瀏覽器識別
	 */
	function regenerate_user_agent(crawler) {
		// 模擬 Chrome。
		crawler.user_agent = crawler.default_user_agent
		// 並且每次更改不同的 user agent。
		.replace(/( Chrome\/\d+\.\d+\.)(\d+)/,
		//
		function(all, main_ver, sub_ver) {
			return main_ver + (Math.random() * 1e4 | 0);
		});

		return crawler.user_agent;
	}

	// --------------------------------------------------------------------------------------------

	// node.innerText
	function get_label(html) {
		return html ? library_namespace.HTML_to_Unicode(
				html.replace(/<\!--[\s\S]*?-->/g, '').replace(
						/<(script|style)[^<>]*>[\s\S]*?<\/\1>/g, '').replace(
						/\s*<br(?:[^\w<>][^<>]*)?>[\r\n]*/ig, '\n').replace(
						/<\/?[a-z][^<>]*>/g, '')
				// incase 以"\r"為主。 e.g., 起点中文网
				.replace(/\r\n?/g, '\n')).trim().replace(
		// \u2060: word joiner (WJ). /^\s$/.test('\uFEFF')
		/[\s\u200B\u200E\u200F\u2060]+$|^[\s\u200B\u200E\u200F\u2060]+/g, '')
		// .replace(/\s{2,}/g, ' ').replace(/\s?\n+/g, '\n')
		// .replace(/[\t\n]/g, ' ').replace(/ {3,}/g, ' ' + ' ')
		: '';
	}

	// modify from CeL.application.net
	// 本函式將使用之 encodeURIComponent()，包含對 charset 之處理。
	// @see function_placeholder() @ module.js
	crawler_namespace.encode_URI_component = function encode_URI_component(
			string, encoding) {
		if (library_namespace.character) {
			library_namespace.debug('採用 ' + library_namespace.Class
			// 有則用之。 use CeL.data.character.encode_URI_component()
			+ '.character.encode_URI_component', 1, module_name);
			crawler_namespace.encode_URI_component = library_namespace.character.encode_URI_component;
			return crawler_namespace.encode_URI_component(string, encoding);
		}
		return encodeURIComponent(string);
	};

	function full_URL_of_path(url, base_data, base_data_2) {
		if (typeof url === 'function') {
			url = url.call(this, base_data, base_data_2);
		} else if (base_data) {
			base_data = crawler_namespace.encode_URI_component(
					String(base_data), url.charset || this.charset);
			if (url.URL) {
				url.URL += base_data
			} else {
				// assert: typeof url === 'string'
				url += base_data;
			}
		}

		if (!url) {
			// error occurred: 未能解析出網址
			return url;
		}

		// combine urls
		if (typeof url === 'string' && !url.includes('://')) {
			if (/^https?:\/\//.test(url)) {
				return url;
			}

			if (url.startsWith('/')) {
				if (url.startsWith('//')) {
					// 借用 base_URL 之 protocol。
					return this.base_URL.match(/^(https?:)\/\//)[1] + url;
				}
				// url = url.replace(/^[\\\/]+/g, '');
				// 只留存 base_URL 之網域名稱。
				return this.base_URL.match(/^https?:\/\/[^\/]+/)[0] + url;
			} else {
				// 去掉開頭的 "./"
				url = url.replace(/^\.\//, '');
			}
			if (url.startsWith('.')) {
				library_namespace.warn([ 'full_URL_of_path: ', {
					// gettext_config:{"id":"invalid-url-$1"}
					T : [ '網址無效：%1', url ]
				} ]);
			}
			url = this.base_URL + url;
		} else if (url.URL) {
			url.URL = this.full_URL(url.URL);
		}

		return url;
	}

	// ----------------------------------------------------------------------------

	function finished_words(status) {
		status = String(status);

		// e.g., https://syosetu.org/?mode=ss_detail&nid=33378
		if (/^[(\[]?(?:完[結结成]?|Completed)[)\]]?$/i.test(status))
			return status;

		// e.g., 连载中, 連載中, 已完结, 已完成, 已完結作品, 已連載完畢, 已完/未完
		// 已載完: https://www.cartoonmad.com/comic/1029.html
		var matched = status.match(/(?:^|已)完(?:[結结成]|$)/);
		if (matched)
			return matched[0];

		// 完本: http://book.qidian.com/
		if ('完結済|完本|読み切り'.split('|').some(function(word) {
			return status.includes(word);
		})) {
			return status;
		}

		// ck101: 全文完, 全書完
		// MAGCOMI: 連載終了作品
		// comico_jp: 更新終了
		if (/全[文書]完|終了/.test(status)) {
			return status;
		}

		// 已停更
	}

	function is_finished(work_data) {
		if (!work_data)
			return;

		if ('is_finished' in work_data) {
			return work_data.is_finished;
		}

		var status_list = library_namespace.is_Object(work_data) ? work_data.status
				// treat work_data as status
				: work_data, date;
		if (!status_list) {
			if (!this.no_checking_of_long_time_no_updated
					// 檢查是否久未更新。
					&& this.recheck
					&& this.recheck !== 'force'
					&& !work_data.recheck
					&& library_namespace.is_Object(work_data)
					&& (Date.now()
					//
					- (date = crawler_namespace.set_last_update_Date(work_data)))
							// 因為沒有明確記載作品是否完結，10年沒更新就不再重新下載。
							/ library_namespace.to_millisecond('1D') > (work_data.recheck_days || 10 * 366)) {
				library_namespace.info([ 'is_finished: ', {
					// gettext_config:{"id":"«$1»-has-not-been-updated.-$2-is-no-longer-forced-to-re-download.-it-will-only-be-re-downloaded-if-the-number-of-chapters-changes"}
					T : [ '《%1》已 %2 沒有更新，時間過久不再強制重新下載，僅在章節數量有變化時才重新下載。'
					//
					, work_data.title, library_namespace.age_of(date) ]
				} ]);
				work_data.recheck = 'changed';
			}

			return status_list;
		}
		// {String|Array}status_list

		if (!Array.isArray(status_list)) {
			return this.finished_words(status_list);
		}

		var finished;
		if (status_list.some(function(status) {
			return finished = this.finished_words(status);
		}, this)) {
			return finished;
		}
	}

	// --------------------------------------------------------------------------------------------

	// export 導出.

	// includes sub-modules
	var module_name = this.id;
	this.finish = function(name_space, waiting) {
		library_namespace.run(
		// @see work_crawler/*.js
		'arguments,task,search,work,chapter,image,ebook'.split(',')
		//
		.map(function(name) {
			return module_name + '.' + name;
		}), waiting);
		return waiting;
	};

	// @inner
	Object.assign(crawler_namespace, {
		// @see CeL.application.net.wiki
		PATTERN_non_CJK : /^[\u0000-\u2E7F]*$/i,
		get_label : get_label,
		regenerate_user_agent : regenerate_user_agent,
		// Simulates an XMLHttpRequest response.
		// 模擬 XMLHttpRequest response。
		null_XMLHttp : {
			responseText : ''
		}
	});

	return Work_crawler;
}
