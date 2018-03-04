/**
 * @name CeL function for downloading online works (novels, comics).
 * 
 * @fileoverview 本檔案包含了批量下載線上作品（小說、漫畫）的函式庫。 WWW work crawler.
 * 
 * <code>

下載作業流程:

# 取得伺服器列表。 start_downloading()
# 解析設定檔，判別所要下載的作品列表。 parse_work_id(), get_work_list()
# 解析 作品名稱 → 作品id get_work()
# 取得作品資訊與各章節資料。 get_work_data()
# 對於章節列表與作品資訊分列不同頁面(URL)的情況，應該另外指定 .chapter_list_URL。 get_work_data()
# 取得每一個章節的內容與各個影像資料。 get_chapter_data()
# 取得各個章節的每一個影像內容。 get_images()
# finish_up()

TODO:
對於漫畫，下載完畢後以章節為單位自動產生壓縮檔並自動刪除下載目錄原始圖檔/清除暫存檔。每次下載前自動讀取壓縮檔資料。
	"C:\Program Files\7-Zip\7z.exe" a -tzip -mx -slt -ssc -sccUTF-8 -scsUTF-8 "chapter.zip" "chapter"
	"C:\Program Files\7-Zip\7z.exe" l -slt -ssc -sccUTF-8 -scsUTF-8 "chapter.zip"
預設介面語言繁體中文+...
下載完畢後作繁簡轉換。
在單一/全部任務完成後執行的外部檔+等待單一任務腳本執行的時間（秒數）
parse 圖像
自動搜尋不同的網站並選擇下載作品。
從其他的資料來源網站尋找取得作品以及章節的資訊。
檢核章節內容。
proxy
Runs untrusted code securely https://github.com/patriksimek/vm2

</code>
 * 
 * @see https://github.com/abc9070410/JComicDownloader
 *      https://github.com/eight04/ComicCrawler
 *      https://github.com/wellwind/8ComicDownloaderElectron
 *      https://github.com/Arachnid-27/Cimoc
 * 
 * @since 2016/10/30 21:40:6
 * @since 2016/11/1 23:15:16 正式運用：批量下載腾讯漫画 qq。
 * @since 2016/11/5 22:44:17 正式運用：批量下載漫画台 manhuatai。
 * @since 2016/11/27 19:7:2 模組化。
 */

// More examples: see 各網站工具檔.js: https://github.com/kanasimi/work_crawler
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
		//
		+ '|application.net.Ajax.get_URL'
		// for CeL.env.arg_hash, CeL.fs_read()
		+ '|application.platform.nodejs.|application.storage.'
		// for CeL.storage.file.file_type()
		+ '|application.storage.file.'
		// for HTML_to_Unicode()
		+ '|interact.DOM.'
		// for Date.prototype.format()
		+ '|data.date.'
		// CeL.character.load(), 僅在有需要設定this.charset時才需要載入。
		+ '|data.character.'
		// for .detect_HTML_language(), .time_zone_of_language()
		+ '|application.locale.'
		// guess_text_language()
		+ '|application.locale.encoding.',

		// 設定不匯出的子函式。
		no_extend : '*',

		// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
		code : module_code
	});
}

function module_code(library_namespace) {

	// requiring
	var get_URL = this.r('get_URL'),
	/** node.js file system module */
	node_fs = library_namespace.platform.nodejs && require('fs'),
	// @see CeL.application.net.wiki
	PATTERN_non_CJK = /^[\u0000-\u2E7F]*$/i,
	//
	path_separator = library_namespace.env.path_separator;

	// --------------------------------------------------------------------------------------------

	function Work_crawler(configurations) {
		Object.assign(this, configurations);
		// 從命令列引數來的設定，優先等級比起作品預設設定更高。
		if (library_namespace.env.arg_hash) {
			for ( var key in this.import_arg_hash) {
				if (key in library_namespace.env.arg_hash) {
					var value = library_namespace.env.arg_hash[key];
					library_namespace.log(library_namespace.display_align([
					//
					[ key + ': ', this[key] ],
					//
					[ '由命令列 → ', value ] ]));
					if (this.import_arg_hash[key] === 'number') {
						try {
							// this[key] = +value;
							// 這樣可以處理如"1e3"
							this[key] = JSON.parse(value);
						} catch (e) {
							library_namespace.error('Can not parse ' + key
									+ '=' + value);
						}
					} else {
						this[key] = value;
					}
				}
			}
		}

		// 在crawler=new CeL.work_crawler({})的情況下可能沒辦法得到準確的檔案路徑，因此這個路徑僅供參考。
		if (typeof module === 'object') {
			var _module = module;
			while (_module = _module.parent) {
				// console.log('Work_crawler: ' + _module.filename);
				// 在 electron 中可能會是 index.html 之類的。
				if (/\.js/i.test(_module.filename)) {
					this.main_script = _module.filename;
				}
			}
		}

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
				library_namespace.error('Can not detect .id from '
						+ this.base_URL);
			}
		}
		process.title = 'Starting ' + this.id;

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
			if (parse_search_result_set[this.parse_search_result]) {
				this.parse_search_result = parse_search_result_set[this.parse_search_result];
			} else {
				throw 'Work_crawler: No this parse_search_result: '
						+ this.parse_search_result;
			}
		}

		if (!(this.MIN_LENGTH >= 0)) {
			// 設定預設可容許的最小圖像大小。
			this.MIN_LENGTH = this.allow_EOI_error ? 4e3 : 1e3;
		}

		this.get_URL_options = {
			// start_time : Date.now(),
			no_protocol_warn : true,
			timeout : Work_crawler.timeout,
			headers : Object.assign({
				'User-Agent' : this.user_agent,
				Referer : this.base_URL
			}, this.headers)
		};
		this.default_agent = this.set_agent();
	}

	// 初始化 agent。
	// create and keep a new agent. 維持一個獨立的 agent。
	// 以不同 agent 應對不同 host。
	function set_agent(URL) {
		var agent;
		if (URL
		// restore
		|| !(agent = this.default_agent)) {
			agent = library_namespace.application.net.Ajax.setup_node_net(URL
					|| this.base_URL);
			agent.keepAlive = true;
		}
		return this.get_URL_options.agent = agent;
	}

	/** {Natural}下載失敗時最多重新嘗試下載的次數。同一檔案錯誤超過此數量則跳出。 */
	Work_crawler.MAX_ERROR_RETRY = 4;
	/** {Natural}timeout in ms for get_URL() 下載圖片的逾時ms數。若逾時時間太小（如10秒），下載大檔案容易失敗。 */
	Work_crawler.timeout = 30 * 1000;

	Work_crawler.HTML_extension = 'htm';

	Work_crawler.prototype = {
		// 所有的子檔案要修訂註解說明時，應該都要順便更改在CeL.application.net.work_crawler中Work_crawler.prototype內的母comments，並以其為主體。

		// 下載檔案儲存目錄路徑。圖片檔+紀錄檔下載位置。
		main_directory : (library_namespace.platform.nodejs
				&& process.mainModule ? process.mainModule.filename
				.match(/[^\\\/]+$/)[0].replace(/\.js$/i, '') : '.')
				// main_directory 必須以 path separator 作結。
				+ path_separator,

		// id : '',
		// site_id : '',
		// base_URL : '',
		// charset : 'GBK',

		// 腾讯TT浏览器
		user_agent : 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; TencentTraveler 4.0)',
		// 可容許的錯誤次數。
		MAX_ERROR_RETRY : Work_crawler.MAX_ERROR_RETRY,
		// 可容許的 EOI (end of image) 錯誤次數。
		MAX_EOI_ERROR : Math.min(3, Work_crawler.MAX_ERROR_RETRY),
		// 最小容許圖案檔案大小 (bytes)。
		// 對於極少出現錯誤的網站，可以設定一個比較小的數值，並且設定.allow_EOI_error=false。因為這類型的網站要不是無法取得檔案，要不就是能夠取得完整的檔案；要取得破損檔案，並且已通過EOI測試的機會比較少。
		// MIN_LENGTH : 4e3,
		// 對於有些圖片只有一條細橫桿的情況。
		// MIN_LENGTH : 150,

		// 預設所容許的章節最短內容字數。最少應該要容許一句話的長度。
		MIN_CHAPTER_SIZE : 200,

		// 預設的圖片延伸檔名/副檔名/filename extension。
		default_image_extension : 'jpg',

		// 仙人拍鼓有時錯，跤步踏差啥人無？ 客語 神仙打鼓有時錯，腳步踏差麼人無
		MESSAGE_RE_DOWNLOAD : '神仙打鼓有時錯，腳步踏差誰人無。下載出錯了，例如服務器暫時斷線、檔案闕失(404)。請確認排除錯誤或錯誤不再持續後，重新執行以接續下載。',
		// 當圖像不存在 EOI (end of image) 標記，或是被偵測出非圖像時，依舊強制儲存檔案。
		// allow image without EOI (end of image) mark. default:false
		// allow_EOI_error : true,
		// 圖像檔案下載失敗處理方式：忽略/跳過圖像錯誤。當404圖像不存在、檔案過小，或是被偵測出非圖像(如不具有EOI)時，依舊強制儲存檔案。default:false
		// skip_error : true,
		//
		// 若已經存在壞掉的圖片，就不再嘗試下載圖片。default:false
		// skip_existed_bad_file : true,
		//
		// 循序逐個、一個個下載圖像。僅對漫畫有用，對小說無用。 Download images one by one.
		// default: 同時下載本章節中所有圖像。 Download ALL images at the same time.
		// one_by_one : true,
		//
		// e.g., '2-1.jpg' → '2-1 bad.jpg'
		EOI_error_postfix : ' bad',
		// 加上有錯誤檔案之註記。
		EOI_error_path : EOI_error_path,
		// cache directory below this.main_directory.
		// MUST append path_separator!
		cache_directory_name : 'cache' + path_separator,
		// archive directory below this.main_directory for ebook. 封存舊電子書用的目錄。
		// MUST append path_separator!
		archive_directory_name : 'archive' + path_separator,
		// log directory below this.main_directory
		log_directory_name : 'log' + path_separator,
		// 錯誤記錄檔案: 記錄無法下載的圖檔。
		error_log_file : 'error_files.txt',
		// 當從頭開始檢查時，會重新設定錯誤記錄檔案。此時會把舊的記錄檔改名成為這個檔案。
		// 移動完之後這個值會被設定為空，以防被覆寫。
		error_log_file_backup : 'error_files.'
				+ (new Date).format('%Y%2m%2dT%2H%2M%2S') + '.txt',
		// 這些值會被複製到記錄報告中。
		last_update_status_keys : 'last_update_chapter,latest_chapter,latest_chapter_name,latest_chapter_url,last_update'
				.split(','),
		// 記錄報告檔案/日誌的路徑。
		report_file : 'report.' + (new Date).format('%Y%2m%2dT%2H%2M%2S') + '.'
				+ Work_crawler.HTML_extension,
		report_file_JSON : 'report.json',

		// default start chapter index.
		start_chapter : 1,
		// 是否重新取得每個所檢測的章節內容 chapter_page。
		// 警告: reget_chapter=false 僅適用於小說之類不取得圖片的情形，
		// 因為若有圖片（parse_chapter_data()會回傳chapter_data.image_list），將把chapter_page寫入僅能從chapter_URL取得名稱的於目錄中。
		reget_chapter : true,
		// 是否保留chapter page
		// 注意: 若是沒有reget_chapter，則preserve_chapter_page不應發生效用。
		preserve_chapter_page : true,
		// 是否保留 cache
		// preserve_cache : true,

		// 在取得小說章節內容的時候，若發現有章節被目錄漏掉，則將之補上。
		check_next_chapter : check_next_chapter,

		// for CeL.application.storage.EPUB
		// auto_create_ebook, automatic create ebook
		// MUST includes CeL.application.locale!
		// need_create_ebook : true,
		KEY_EBOOK : 'ebook',
		milestone_extension : true,
		add_ebook_chapter : add_ebook_chapter,
		pack_ebook : pack_ebook,
		/** 若需要留下/重複利用media如images，請勿remove。 */
		// remove_ebook_directory : true,
		/** 章節數量無變化時依舊利用 cache 重建資料(如ebook)。 */
		// regenerate : true,
		/** 進一步處理書籍之章節內容。例如繁簡轉換、錯別字修正、裁剪廣告。 */
		contents_post_processor : function(contents, work_data) {
			return contents;
		} && null,
		// 話: 日文
		// 「卷」為漫畫單行本，「話」為雜誌上的連載，「卷」包含了以往雜誌上所有發行的「話」
		chapter_unit : '話',
		parse_ebook_name : parse_ebook_name,

		full_URL : full_URL_of_path,
		// recheck:從頭檢測所有作品之所有章節與所有圖片。不會重新擷取圖片。對漫畫應該僅在偶爾需要從頭檢查時開啟此選項。default:false
		// recheck='changed': 若是已變更，例如有新的章節，則重新下載/檢查所有章節內容。否則只會自上次下載過的章節接續下載。
		// recheck : true,
		// 明確指定自上次下載過的章節接續下載。
		// recheck : false,
		//
		// 當無法取得 chapter 資料時，直接嘗試下一章節。在手動+監視下 recheck 時可併用此項。 default:false
		// skip_chapter_data_error : true,

		// 重新搜尋。default:false
		// research : false,

		image_types : {
			jpg : true,
			jpeg : true,
			// 抓取到非JPG圖片
			png : true,
			gif : true,
			webp : true,
			bmp : true
		},

		image_path_to_url : image_path_to_url,
		// 提取出引數（如 URL）中的作品ID 以回傳。
		extract_work_id : function(work_information) {
			// default: accept numerals only
			return library_namespace.is_digits(work_information)
					&& work_information;
			return /^[a-z_\-\d]+$/.test(work_information) && work_information;
		},
		// 取得用在作品完結的措辭。
		finished_words : function finished_words(status) {
			status = String(status);

			// e.g., https://syosetu.org/?mode=ss_detail&nid=33378
			if (/^\(?完[結结成]?\)?$/.test(status))
				return status;

			// e.g., 连载中, 連載中, 已完结, 已完成
			var matched = status.match(/(?:^|已)完[結结成]/);
			if (matched)
				return matched[0];

			if (status.includes(matched = '完結済')
			// http://book.qidian.com/
			|| status.includes(matched = '完本')
			// ck101
			|| status.includes(matched = '全文完')) {
				return matched;
			}
		},
		is_finished : function(work_data) {
			var status_list = library_namespace.is_Object(work_data) ? work_data.status
					// treat work_data as status
					: work_data;
			if (!status_list) {
				return status_list;
			}
			// {String|Array}status_list

			if (!Array.isArray(status_list)) {
				return this.finished_words(status_list);
			}

			var finished, _this = this;
			if (status_list.some(function(status) {
				return finished = _this.finished_words(status);
			})) {
				return finished;
			}
		},
		work_URL : function(work_id) {
			// default work_URL: this.base_URL + work_id + '/'
			return work_id + '/';
			// or you may use:
			return work_id + '/' + work_id + '.html';
			return work_id + '.html';
		},
		// 對於章節列表與作品資訊分列不同頁面(URL)的情況，應該另外指定 .chapter_list_URL。
		// chapter_list_URL : '',
		// 當有設定work_data.chapter_list的時候的預設函數，由 this.get_chapter_data() 呼叫。
		chapter_URL : function(work_data, chapter_NO) {
			// chapter_NO starts from 1
			// console.log(work_data.chapter_list);

			// e.g., work_data.chapter_list = [ chapter_data,
			// chapter_data={url:'',title:'',date:new Date}, ... ]
			return work_data.chapter_list[chapter_NO - 1].url;

			return this.work_URL(work_data.id)
					+ work_data.chapter_list[chapter_NO - 1].url;
		},
		set_part : set_part_title,
		add_chapter : add_chapter_data,
		reverse_chapter_list_order : reverse_chapter_list_order,
		get_chapter_directory_name : get_chapter_directory_name,

		// 命令列可以設定的選項。通常僅做測試微調用。
		// 以純量為主，例如邏輯真假、數字、字串。無法處理函數！
		import_arg_hash : {
			main_directory : 'string',
			user_agent : 'string',
			one_by_one : 'boolean',
			// 篩選想要下載的章節標題。
			chapter_filter : 'string',
			// 將開始/接續下載的章節編號。必須要配合 .recheck。
			start_chapter : 'number',
			MIN_LENGTH : 'number',
			// 容許錯誤用的相關操作設定。
			MAX_ERROR_RETRY : 'number',
			allow_EOI_error : 'boolean',
			skip_error : 'boolean',
			skip_chapter_data_error : 'boolean',
			// 重新擷取用的相關操作設定。
			regenerate : 'boolean',
			reget_chapter : 'boolean',
			recheck : 'boolean|string',
			research : 'boolean'
		},

		set_agent : set_agent,
		data_of : start_get_data_of,

		stop_task : stop_task,
		continue_task : continue_task,

		start : start_downloading,
		set_server_list : set_server_list,
		parse_work_id : parse_work_id,
		get_work_list : get_work_list,
		get_work : get_work,
		get_work_data : get_work_data,
		save_work_data : save_work_data_file,
		get_images : get_images
	};

	// --------------------------------------------------------------------------------------------

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

		// 取得圖庫伺服器列表。
		get_URL(server_URL, function(XMLHttp) {
			var html = XMLHttp.responseText;
			_this.server_list = _this.parse_server_list(html)
			// 確保有東西。
			.filter(function(server) {
				return !!server;
			}).unique();
			if (_this.server_list.length > 0) {
				library_namespace.log('Get ' + _this.server_list.length
						+ ' servers from [' + server_URL + ']: '
						+ _this.server_list.join(', '));
				if (server_file) {
					node_fs.writeFileSync(server_file, JSON
							.stringify(_this.server_list));
				}
			} else {
				library_namespace.error('set_server_list: No server get from ['
						+ server_URL + ']!');
			}

			typeof callback === 'function' && callback();
		}, this.charset, null, Object.assign({
			error_retry : this.MAX_ERROR_RETRY
		}, this.get_URL_options));
	}

	// front end #1: start downloading operation
	function start_downloading(work_id, callback) {
		if (!work_id) {
			library_namespace.log(this.id + ': 沒有輸入 work_id！');
			return;
		}

		if (this.charset
				&& !library_namespace.character.is_loaded(this.charset)) {
			// 載入需要的字元編碼。
			library_namespace.character.load(this.charset, start_downloading
					.bind(this, work_id, callback));
			return;
		}

		library_namespace.log(this.id + ': Starting ' + work_id + ', 儲存至 '
				+ this.main_directory);
		// prepare work directory.
		library_namespace.create_directory(this.main_directory);

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
			// use cache of host list
			this.parse_work_id(work_id, callback);
			return;
		}

		this.set_server_list(this.server_URL, function() {
			_this.parse_work_id(work_id, callback);
		}, server_file);
	}

	/**
	 * front end #2: start get work information operation. e.g., search only, no
	 * download.
	 * 
	 * @param {String}work_title
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
	function start_get_data_of(work_title, callback, options) {
		function start_get_data_of_callback(work_data) {
			typeof callback === 'function' && callback.call(this, work_data);
		}
		start_get_data_of_callback.options = Object.assign({
			get_data_only : true
		}, options);

		// TODO: test
		this.start(work_id, start_get_data_of_callback);
	}

	// ----------------------------------------------------------------------------

	// modify from CeL.application.net.Ajax
	// 本函式將使用之 encodeURIComponent()，包含對 charset 之處理。
	// @see function_placeholder() @ module.js
	var encode_URI_component = function(string, encoding) {
		if (library_namespace.character) {
			library_namespace.debug('採用 ' + library_namespace.Class
			// 有則用之。 use CeL.data.character.encode_URI_component()
			+ '.character.encode_URI_component', 1, library_namespace.Class
			// module name
			+ 'application.net.work_crawler');
			encode_URI_component = library_namespace.character.encode_URI_component;
			return encode_URI_component(string, encoding);
		}
		return encodeURIComponent(string);
	};

	function full_URL_of_path(url, data) {
		if (typeof url === 'function') {
			url = url.call(this, data);
		} else if (data) {
			data = encode_URI_component(data, url.charset || this.charset);
			if (url.URL) {
				url.URL += data
			} else {
				url += data;
			}
		}
		if (typeof url === 'string' && !url.includes('://')) {
			if (url.startsWith('/')) {
				if (url.startsWith('//')) {
					return this.base_URL.match(/^(https?:)\/\//)[1] + url;
				}
				url = url.replace(/^[\\\/]+/g, '');
			} else {
				// 去掉開頭的 "./"
				url = url.replace(/^\.\//, '');
			}
			if (url.startsWith('.')) {
				library_namespace.warn('full_URL_of_path: Invalid url: ' + url);
			}
			url = this.base_URL + url;
		}
		return url;
	}

	function parse_work_id(work_id, callback) {
		work_id = String(work_id);

		if (this.convert_id && this.convert_id[work_id]) {
			// 因為 convert_id[work_id]() 可能回傳 list，因此需要以 get_work_list() 特別處理。
			this.get_work_list([ work_id ], callback);

		} else if (work_id.startsWith('l=') || node_fs.existsSync(work_id)) {
			// e.g.,
			// node 各漫畫網站工具檔.js l=各漫畫網站工具檔.txt
			// node 各漫畫網站工具檔.js 各漫畫網站工具檔.txt
			// @see http://ac.qq.com/Rank/comicRank/type/pgv
			if (work_id.startsWith('l=')) {
				work_id = work_id.slice('l='.length);
			}
			var work_list = (library_namespace.fs_read(work_id).toString() || '')
			//
			.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
			// 去掉BOM (byte order mark)
			.trim()
			// TODO: 處理title中包含"#"的作品
			.replace(/(?:^|\n)#[^\n]*/g, '').trim().split(/[\r\n]+/).unique();
			this.get_work_list(work_list, callback);

		} else if (work_id
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
		} else {
			library_namespace.error('parse_work_id: Invalid work id: '
					+ work_id);
			typeof callback === 'function' && callback();
		}
	}

	function get_work_list(work_list, callback) {
		// console.log(work_list);
		// 真正處理的作品數。
		var work_count = 0, all_work_status = library_namespace.null_Object();

		// assert: Array.isArray(work_list)
		work_list.run_async(function for_each_title(get_next_work, work_title,
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

			// convert to next index
			this_index++;
			work_title = work_title.trim();
			if (!work_title) {
				// 直接進入下一個 work_title。
				get_next_work();
				return;
			}

			var id_converter = this.convert_id && this.convert_id[work_title];

			if (typeof id_converter === 'function') {
				library_namespace.debug('Using convert_id[' + work_title + ']',
						3, 'get_work_list');
				// convert special work id:
				// convert_id:{id_type:function(insert_id_list, get_label){...}}
				// insert_id_list: 提供異序(asynchronously,不同時)使用。
				// 警告: 需要自行呼叫 insert_id_list(id_list);
				id_converter.call(this, insert_id_list, get_label);
				return;
			}

			if (library_namespace.is_Object(id_converter) && id_converter.url
					&& typeof id_converter.parser === 'function') {
				library_namespace.debug(
				// 從指定網址 id_converter.url 得到網頁內容後，
				// 丟給解析器 id_converter.parser 解析出作品列表。
				'Using convert_id[' + work_title + '] via url: '
						+ id_converter.url, 3, 'get_work_list');
				// convert_id:{id_type:{url:'',parser:function(html,get_label){...}}}
				get_URL(this.full_URL(id_converter.url), function(XMLHttp) {
					var id_list = id_converter.parser.call(this,
							XMLHttp.responseText, get_label);
					insert_id_list(id_list);
				}, this.charset, null, Object.assign({
					error_retry : this.MAX_ERROR_RETRY
				}, this.get_URL_options));
				return;
			}

			if (id_converter) {
				throw 'get_work_list: Invalid id converter for ' + work_title;
			}

			work_count++;
			library_namespace.log('Download ' + work_count
					+ (work_count === this_index ? '' : '/' + this_index) + '/'
					+ work_list.length + ': ' + work_title);
			this.get_work(work_title, function(work_data) {
				var work_status = set_work_status(work_data);
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
				get_next_work();
			});

		}, function all_work_done() {
			library_namespace.log(this.id + ': All ' + work_list.length
					+ ' works done. 所有作品下載作業結束.');
			var work_status_titles = Object.keys(all_work_status);
			if (work_status_titles.length > 0) {
				library_namespace.create_directory(
				// 先創建記錄用目錄。
				this.main_directory + this.log_directory_name);
				try {
					node_fs.writeFileSync(this.main_directory
							+ this.log_directory_name + this.report_file_JSON,
							JSON.stringify({
								date : (new Date).toISOString(),
								status : all_work_status
							}));
				} catch (e) {
					// TODO: handle exception
				}

				var _this = this, report_file = this.main_directory
						+ this.log_directory_name + this.report_file,
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
				library_namespace.info(this.id + ': '
				//
				+ work_status_titles.length + ' notes: ' + report_file);
				work_status_titles.forEach(function(work_title, index) {
					var work_status = all_work_status[work_title];
					// assert: {Array}work_status
					library_namespace.info(work_title + ': '
							+ work_status.join(', '));
					var work_status_report = work_status.map(function(status) {
						switch (status) {
						case 'not found':
							status = '<b style="color:#f44;">' + status
									+ '</b>';
							break;

						case 'limited':
							status = '<b style="color:#bb0;">' + status
									+ '</b>';
							break;

						case 'finished':
							status = '<b style="color:#88f;">' + status
									+ '</b>';
							break;

						default:
							break;
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
					node_fs.writeFileSync(report_file, reports.join('\r\n'));
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

	var PATTERN_url_for_baidu = /([\d_]+)(?:\.html|\/(?:index\.html)?)?$/;
	if (library_namespace.is_debug()) {
		[ 'http://www.host/0/123/', 'http://www.host/123/index.html',
				'http://www.host/123.html' ].forEach(function(url) {
			console.assert('123' === 'http://www.host/123/'
					.match(PATTERN_url_for_baidu)[1]);
		});
	}

	var parse_search_result_set = {
		// baidu cse
		baidu : function(html, get_label) {
			// console.log(html);
			var id_data = [],
			// {Array}id_list = [id,id,...]
			id_list = [], get_next_between = html.find_between(
					' cpos="title" href="', '</a>'), text;

			while ((text = get_next_between()) !== undefined) {
				// console.log(text);
				// 從URL網址中解析出作品id。
				var matched = text.between(null, '"').match(
						PATTERN_url_for_baidu);
				// console.log(matched);
				if (!matched)
					continue;
				id_list.push(matched[1]);
				// 從URL網址中解析出作品title。
				matched = text.match(/ title="([^"]+)"/);
				if (matched) {
					matched = matched[1];
				} else {
					// e.g., omanhua.js: <em>择</em><em>天</em><em>记</em>
					matched = text.between('<em>', {
						tail : '</em>'
					});
				}
				// console.log(matched);
				if (matched && (matched = get_label(matched))
				// 只取第一個符合的。
				// 避免如 http://host/123/, http://host/123/456.htm
				&& !id_data.includes(matched)) {
					id_data.push(matched);
				} else {
					id_list.pop();
				}
			}

			// console.log([ id_list, id_data ]);
			return [ id_list, id_data ];
		}
	};

	// ----------------------------------------------------------------------------

	function set_work_status(work_data, status) {
		if (status) {
			if (!work_data.process_status)
				work_data.process_status = [];
			work_data.process_status.push(status);
		}
		return work_data.process_status;
	}

	// 儲存本次作業到現在的作品資訊到檔案。 cache / save work data file
	function save_work_data_file(work_data) {
		if (!work_data.data_file)
			return;

		// 預防(work_data.directory)不存在。
		library_namespace.create_directory(work_data.directory);

		var ebook = work_data[this.KEY_EBOOK];
		// 為了預防 TypeError: Converting circular structure to JSON
		// ebook 結構中可能會有 circular。
		delete work_data[this.KEY_EBOOK];
		try {
			node_fs.writeFileSync(work_data.data_file, JSON
					.stringify(work_data));
		} catch (e) {
			library_namespace
					.error('save_work_data_file: Can not save work data of '
							+ (work_data.title || work_data.id) + '!');
			library_namespace.error(e);
		}
		// recover
		if (ebook)
			work_data[this.KEY_EBOOK] = ebook;
	}

	function get_work(work_title, callback) {
		this.running = true;
		var _this = this;

		// 執行順序: finish() → finish_up()
		function finish_up(work_data) {
			if (work_data && work_data.title) {
				// 最後紀錄。
				_this.save_work_data(work_data);
				if (_this.need_create_ebook
				// 未找到時沒有 work_data。
				&& work_data.chapter_count >= 1) {
					_this.pack_ebook(work_data);
				}
				if (false && _this.need_create_ebook && !_this.preserve_cache) {
					// 注意: 若是刪除ebook目錄，也會把media資源檔刪掉。
					// 因此只能刪除造出來的HTML網頁檔案。
					library_namespace.fs_remove(
					// @see CeL.application.storage.EPUB
					work_data[this.KEY_EBOOK].path.root, true);
				}
			} else if (work_data && work_data.titles) {
				// @see ((approximate_title))
				set_work_status(work_data, 'found search result: '
						+ work_data.titles.length + ' titles: '
						+ work_data.titles.map(function(item) {
							return item[0] + ':' + item[1];
						}).join('; '));
			} else {
				var status = work_data;
				work_data = library_namespace.null_Object();
				set_work_status(work_data,
						status && typeof status === 'string' ? status
								: 'not found');
			}

			if (typeof _this.finish_up === 'function') {
				_this.finish_up(work_data);
			}
			typeof callback === 'function' && callback.call(_this, work_data);
			_this.running = false;
		}
		if (callback && callback.options) {
			// e.g., for .get_data_only
			finish_up.options = callback.options;
		}

		// --------------------------------------

		// 先試試看能否取得 work id。
		var work_id = this.extract_work_id(work_title);
		if (work_id) {
			this.get_work_data(work_id, finish_up);
			return;
		}

		// --------------------------------------

		function finish(no_cache) {
			if (!no_cache) {
				// write cache
				node_fs.writeFileSync(search_result_file, JSON
						.stringify(search_result));
			}
			search_result = search_result[work_title];
			var p = _this.id_of_search_result;
			if (p) {
				search_result = typeof p === 'function' ? p(search_result)
						: search_result ? search_result[p] : search_result;
			}
			_this.get_work_data({
				id : search_result,
				title : work_title
			}, finish_up);
		}

		var search_result_file = this.main_directory + 'search.json',
		// search cache
		// 檢查看看之前是否有取得過。
		search_result = library_namespace.get_JSON(search_result_file)
				|| library_namespace.null_Object();
		library_namespace.debug('search result file: ' + search_result_file, 2,
				'get_work');
		// console.log(search_result);

		// assert: work_title前後不應包含space
		work_title = work_title.trim();
		if (this.research) {
			library_namespace.log(this.id + ': Re-search title: [' + work_title
					+ ']');
		} else if (search_result[work_title]) {
			library_namespace.log(this.id + ': Find cache: ' + work_title + '→'
					+ JSON.stringify(search_result[work_title]));
			finish(true);
			return;
		}

		var url = this.search_URL, URL, post_data;
		if (!url || typeof this.parse_search_result !== 'function') {
			url = library_namespace.null_Object();
			url[work_title] = '';
			throw '本線上作品網站 ' + this.id + ' 的模組未提供搜尋功能。請手動設定/輸入 [' + work_title
					+ '] 之 id 於 ' + search_result_file + '\n (e.g., '
					+ JSON.stringify(url) + ')';
		}
		if (typeof url === 'function') {
			// 通過關鍵詞搜索作品。 解析 作品名稱 → 作品id
			// url = url.call(this, work_title, get_label);
			// return [ url, POST data ]
			url = this.search_URL(work_title, get_label);
			if (Array.isArray(url)) {
				// use POST method
				post_data = url[1];
				url = url[0];
			}
			url = this.full_URL(url);
			URL = url.URL || url;
		} else {
			// default:
			// assert: typeof url==='string' || url==={URL:'',charset:''}
			// TODO: .replace(/%t/g, work_title)
			url = this.full_URL(url);
			// 對 {Object}url，不可動到 url。
			URL = (url.URL || url) + encode_URI_component(
			// e.g., 找不到"隔离带 2"，須找"隔离带"。
			work_title.replace(/\s+\d{1,2}$/, '')
			// e.g., "Knight's & Magic" @ 小説を読もう！ || 小説検索
			.replace(/&/g, ''), url.charset || this.charset);
		}

		// console.log(url);
		this.set_agent(URL);
		// console.log(this.get_URL_options);
		get_URL(URL, function(XMLHttp) {
			_this.set_agent();
			if (!XMLHttp.responseText) {
				library_namespace.error(
				// 沒有搜索結果。
				'get_work: Nothing got for searching [' + work_title + ']');
				finish_up('Nothing got for searching');
				return;
			}
			// this.parse_search_result() returns:
			// [ {Array}id_list, 與id_list相對應之{Array}或{Object} ]
			// e.g., [ [id,id,...], [title,title,...] ]
			// e.g., [ [id,id,...], [data,data,...] ]
			// e.g., [ [id,id,...], {id:data,id:data,...} ]
			var id_data;
			try {
				// console.log(XMLHttp.responseText);
				id_data = _this.parse_search_result(XMLHttp.responseText,
						get_label, work_title);
				if (id_data === undefined) {
					throw undefined;
				}
				if (!id_data) {
					throw 'get_work.parse_search_result:'
							+ ' 作品網址解析函數 parse_search_result 未回傳正規結果！';
				}
			} catch (e) {
				if (e)
					console.trace(e);
				library_namespace
						.error('get_work.parse_search_result: 無法解析搜尋作品['
								+ work_title + ']之結果！');
				finish_up('無法解析搜尋作品之結果');
				return;
			}
			// e.g., {id:data,id:data,...}
			if (library_namespace.is_Object(id_data)) {
				id_data = [ Object.keys(id_data), id_data ];
			}
			// {Array}id_list = [id,id,...]
			var id_list = id_data[0] || [];
			// console.log(id_data);
			id_data = id_data[1];
			if (id_list.length !== 1) {
				library_namespace.warn('[' + work_title + ']: Get '
				//
				+ id_list.length + ' works: ' + JSON.stringify(id_data));
			}

			// 近似的標題。
			var approximate_title = [];
			if (id_list.every(function(id, index) {
				// console.log(id);
				var title;
				if (library_namespace.is_Object(id)) {
					title = id;
				} else if (Array.isArray(id_data)
						&& (id_list.length === id_data.length || isNaN(id))) {
					title = id_data[index];
				} else {
					title = id_data[id] || id_data[index];
				}

				var p = _this.title_of_search_result;
				if (p) {
					title = typeof p === 'function' ? p(title)
							: title ? title[p] : title;
				}
				title = title.trim();
				// console.log([ 'compare', title, work_title ]);
				// 找看看是否有完全相同的title。
				if (title !== work_title) {
					if (title.includes(work_title) || title.replace(/\s/g, '')
					//
					=== work_title.replace(/\s/g, '')) {
						approximate_title.push([ id, title ]);
					}
					return true;
				}
				id_list = id;
			})) {
				if (approximate_title.length !== 1) {
					library_namespace.error(
					// failed: not only one
					(approximate_title.length === 0 ? '未找到' : '找到'
							+ approximate_title.length + '個')
							+ '與[' + work_title + ']相符者。');
					finish_up(approximate_title.length > 0 && {
						titles : approximate_title
					});
					return;
				}
				approximate_title = approximate_title[0];
				library_namespace.warn(library_namespace.display_align({
					'Use title:' : work_title,
					'→' : approximate_title[1]
				}));
				work_title = approximate_title[1];
				id_list = approximate_title[0];
			}

			// 已確認僅找到唯一id。
			id_data = id_data[id_list];
			search_result[work_title] = typeof id_data === 'object'
			// {Array}或{Object}
			? id_data : id_list;
			if (typeof _this.post_get_work_id === 'function') {
				// post_get_work_id :
				// function(callback, work_title, search_result) {}
				_this.post_get_work_id(finish, work_title, search_result);
			} else {
				finish();
			}

		}, url.charset || this.charset, post_data, Object.assign({
			error_retry : this.MAX_ERROR_RETRY
		}, this.get_URL_options));
	}

	function get_label(html) {
		if (html) {
			return library_namespace.HTML_to_Unicode(
					html.replace(/\s*<br(?:\/| [^<>]*)?>/ig, '\n').replace(
							/<[^<>]+>/g, '')
					// 起点中文网 以"\r"為主。
					.replace(/\r\n?/g, '\n')).trim()
			// .replace(/\s+/g, ' ').replace(/\s?\n+/g, '\n')
			;
		}
	}

	function exact_work_data(work_data, html, PATTERN_work_data, overwrite) {
		if (!PATTERN_work_data) {
			PATTERN_work_data =
			// 由 meta data 取得作品資訊。 e.g.,
			// <meta property="og:title" content="《作品》" />
			// <meta property="og:novel:author" content="作者" />
			// <meta name="Keywords" content="~" />
			// <meta property="og:site_name" name="application-name"
			// content="卡提諾論壇"/>
			/<meta\s+(?:property|name)=["'](?:[^<>"']+:)?([^<>"':]+)["']\s[^<>]*?content=["']([^<>"']+)/g;
			html = html.between(null, '</head>') || html;
		}

		var matched;
		// matched: [ all, key, value ]
		while (matched = PATTERN_work_data.exec(html)) {
			var key = get_label(matched[1]).replace(/[:：︰\s]+$/, ''), value;
			// default: do not overwrite
			if (key && (overwrite || !work_data[key])
			//
			&& (value = get_label(matched[2]).replace(/^[:：︰\s]+/, '').trim())) {
				work_data[key] = value;
			}
		}
	}

	function get_work_data(work_id, callback, error_count) {
		var work_title;
		if (library_namespace.is_Object(work_id)) {
			work_title = work_id.title;
			work_id = work_id.id;
		}
		process.title = '下載' + work_title + ' - 資訊 @ ' + this.id;

		var _this = this, work_URL = this.full_URL(this.work_URL, work_id), work_data;
		library_namespace.debug('work_URL: ' + work_URL, 2, 'get_work_data');

		get_URL(work_URL, process_work_data, this.charset, null,
				this.get_URL_options);

		function process_work_data(XMLHttp) {
			// console.log(XMLHttp);
			var html = XMLHttp.responseText;
			if (!html) {
				library_namespace
						.error('Failed to get work data of '
								+ work_id
								+ (XMLHttp.buffer
										&& XMLHttp.buffer.length === 0 ? ': Nothing get'
										: ''));
				if (error_count === _this.MAX_ERROR_RETRY) {
					throw _this.id + ': ' + _this.MESSAGE_RE_DOWNLOAD;
				}
				error_count = (error_count | 0) + 1;
				library_namespace.log('process_work_data: Retry ' + error_count
						+ '/' + _this.MAX_ERROR_RETRY + '...');
				_this.get_work_data({
					// 书号
					id : work_id,
					title : work_title
				}, callback, error_count);
				return;
			}

			try {
				// 作品詳情。
				work_data = _this.parse_work_data(html, get_label,
						exact_work_data);
			} catch (e) {
				library_namespace.error(work_title + ': ' + e);
				typeof callback === 'function' && callback({
					title : work_title
				});
				return;
			}

			if (!work_data.title) {
				work_data.title = work_title;
			}
			// 從已設定的網站名稱挑選一個可用的。
			if (work_data.site_name) {
				_this.site_name = work_data.site_name;
			} else if (_this.site_name) {
				work_data.site_name = _this.site_name;
			}
			// 基本檢測。
			if (PATTERN_non_CJK.test(work_data.title)
			// e.g., "THE NEW GATE", "Knight's & Magic"
			&& !/[a-z]+ [a-z\d&]/i.test(work_data.title)
			// e.g., "Eje(c)t"
			&& !/[()]/.test(work_data.title)
			// e.g., "H-Mate"
			&& !/[a-z\-][A-Z]/.test(work_data.title)
			// .title: 必要屬性：須配合網站平台更改。
			&& PATTERN_non_CJK.test(work_id)) {
				library_namespace
						.error('process_work_data: Did not set work title: '
								+ work_id + ' (' + work_data.title + ')');
			}

			// 自動添加之作業用屬性：
			work_data.id = work_id;
			work_data.last_download = {
				date : (new Date).toISOString(),
				chapter : _this.start_chapter
			};
			// source URL of work
			work_data.url = work_URL;

			process.title = '下載' + work_data.title + ' - 目次 @ ' + _this.id;
			work_data.directory_name = library_namespace.to_file_name(
			// 允許自訂作品目錄名/命名資料夾。
			work_data.directory_name || work_data.id + ' ' + work_data.title
			// e.g., '.' + (new Date).format('%Y%2m%2d')
			+ (work_data.directory_name_extension || ''));
			// full directory path of the work.
			if (!work_data.directory) {
				var work_base_directory = _this.main_directory;
				if (work_data.base_directory_name) {
					// 允許自訂作品目錄，將作品移至特殊目錄下。
					// @see qq.js, qidian.js
					// set base directory name below this.main_directory
					work_base_directory += work_data.base_directory_name
							+ path_separator;
					// 特殊目錄可能還不存在。
					library_namespace.create_directory(work_base_directory);
					if (_this.need_create_ebook)
						work_data.ebook_directory = work_base_directory;
				}
				work_data.directory = work_base_directory
						+ work_data.directory_name + path_separator;
			}
			work_data.data_file = work_data.directory
					+ work_data.directory_name + '.json';

			// 先寫入作品資料cache。
			var directory = _this.main_directory + _this.cache_directory_name;
			library_namespace.create_directory(directory);
			// .data.htm
			node_fs.writeFileSync(directory + work_data.directory_name + '.'
					+ Work_crawler.HTML_extension, html);

			// .status 選擇性屬性：須配合網站平台更改。
			// ja:種別,状態
			if (Array.isArray(work_data.status)) {
				// e.g., ジャンル
				work_data.status = work_data.status.filter(function(item) {
					return !!item;
				})
				// .sort()
				.join(', ');
			}
			// assert: typeof work_data.status === 'string'

			// 主要提供給 this.get_chapter_count() 使用。
			// e.g., 'ja-JP'
			if (!('language' in work_data)) {
				work_data.language
				// CeL.application.locale.detect_HTML_language()
				= library_namespace.detect_HTML_language(html)
				// CeL.application.locale.encoding.guess_text_language()
				|| library_namespace.guess_text_language(html);
			}
			// normalize work_data.language
			if (work_data.language && work_data.language.startsWith('cmn')) {
				// calibre 不認得/讀不懂 "cmn-Hant-TW" 這樣子的語言代碼，
				// 但是讀得懂 "zh-cmn-Hant-TW"。
				work_data.language = 'zh-' + work_data.language;
				if (!work_data.chapter_unit)
					work_data.chapter_unit = '章';
			}

			if (false && _this.is_finished(work_data)) {
				// 注意: 這時可能尚未建立 work_data.directory。
				// TODO: skip finished + no update works
			}

			var matched = library_namespace.get_JSON(work_data.data_file);
			if (matched) {
				// properties to reset
				var skip_cache = {
					last_download : true,
					process_status : _this.recheck,
					ebook_directory : _this.need_create_ebook,
					words_so_far : _this.need_create_ebook,
					book_chapter_count : _this.need_create_ebook,
					error_images : true,
					chapter_count : true,
					image_count : true
				};
				// recall old work_data
				// 基本上以新資料為準，除非無法取得新資料，才改用舊資料。
				for ( var key in matched) {
					if (skip_cache[key]) {
						// Skip this cache data.
						continue;
					}

					if (!(key in work_data)) {
						// 填入舊的資料。
						work_data[key] = matched[key];

					} else if (typeof work_data[key] !== 'object'
							&& work_data[key] !== matched[key]) {
						library_namespace.info(library_namespace
								.display_align([ [ key + ':', matched[key] ],
										[ '→', work_data[key] ] ]));
					}
				}
				matched = matched.last_download.chapter;
				if (matched > _this.start_chapter) {
					// 將開始/接續下載的章節編號。必須要配合 .recheck。
					work_data.last_download.chapter = matched;
				}
			}

			if (_this.chapter_list_URL) {
				work_data.chapter_list_URL
				// this.chapter_list_URL(work_id, work_data);
				= work_URL = _this.full_URL(_this.chapter_list_URL, work_id);
				get_URL(work_URL, process_chapter_list_data, _this.charset,
						null, Object.assign({
							error_retry : _this.MAX_ERROR_RETRY
						}, _this.get_URL_options));
			} else {
				process_chapter_list_data(XMLHttp);
			}
		}

		// get 目次/完整目錄列表/章節列表
		function process_chapter_list_data(XMLHttp) {
			var html = XMLHttp.responseText;
			if (!html) {
				var message = _this.id + ': Can not get chapter list page!';
				library_namespace.error(message);
				throw message;
			}

			if (false) {
				// reset chapter_count. 此處 chapter (章節)
				// 指的為平台所給的id編號，可能是page，並非"回"、"話"！且可能會跳號！
				/** {ℕ⁰:Natural+0}章節數量 */
				work_data.chapter_count = 0;
				// work_data.chapter_count這個數值在前面skip_cache已經設定為不會更新，因此在這邊不需要重新設定。
			}

			// 注意: 這時可能尚未建立 work_data.directory。
			// 但this.get_chapter_count()若用到work_data[this.KEY_EBOOK].set_cover()，則會造成沒有建立基礎目錄的錯誤。
			library_namespace.debug('Create work_data.directory: '
					+ work_data.directory);
			// 預防(work_data.directory)不存在。
			library_namespace.create_directory(work_data.directory);

			if (_this.is_finished(work_data)) {
				if (false) {
					node_fs.writeFileSync(work_data.directory
					// 已經改成產生報告檔。
					+ 'finished.txt', work_data.status);
				}
				if (work_data.process_status) {
					work_data.process_status = work_data.process_status
							.unique();
					var has_last_saved_date;
					work_data.process_status = work_data.process_status
					// 之前每次都會添加新的資訊...
					.filter(function(status) {
						if (!String(status).startsWith('last saved date: ')) {
							return true;
						}
						if (has_last_saved_date)
							return false;
						has_last_saved_date = true;
						return true;
					});
				}
				if (!work_data.process_status
						|| !work_data.process_status.includes('finished'))
					set_work_status(work_data, 'finished');
				// cf. work_data.latest_chapter 最新章節,
				// work_data.latest_chapter_url
				if (work_data.last_update) {
					set_work_status(work_data, 'last updated date: '
							+ work_data.last_update);
				}
				if (work_data.last_saved
				// 已完結的時間報告只記錄一次就夠了。
				&& work_data.process_status.every(function(status) {
					return !String(status).startsWith('last saved date: ');
				})) {
					set_work_status(
							work_data,
							'last saved date: '
									+ (library_namespace
											.is_Date(work_data.last_saved) ? work_data.last_saved
											.format('%Y/%m/%d')
											: work_data.last_saved));
				}
				// TODO: skip finished + no update works
			}

			if (true || _this.need_create_ebook) {
				// 提供給 this.get_chapter_count() 使用。
				if (!('time_zone' in work_data)) {
					// e.g., 9
					work_data.time_zone
					// CeL.application.locale.time_zone_of_language
					= library_namespace
							.time_zone_of_language(work_data.language);
				}
			}

			// TODO: rename to get_chapter_list
			if (typeof _this.get_chapter_count === 'function') {
				try {
					_this.get_chapter_count(work_data, html, get_label);
				} catch (e) {
					library_namespace.error(_this.id
							+ ': .get_chapter_count() throw error');
					throw e;
					typeof callback === 'function' && callback(work_data);
					return;
				}
				if (work_data.inverted_order) {
					_this.reverse_chapter_list_order(work_data);
					delete work_data.inverted_order;
				}
			}
			// 之前已設定 work_data.chapter_count=0
			if (!work_data.chapter_count
			// work_data.chapter_list 為非正規之 chapter data list。
			// e.g., work_data.chapter_list = [ chapter_data,
			// chapter_data={url:'',title:'',date:new Date}, ... ]
			&& Array.isArray(work_data.chapter_list)) {
				// 自 work_data.chapter_list 計算章節數量。
				work_data.chapter_count = work_data.chapter_list.length;
			}

			if (!(work_data.chapter_count >= 1)) {
				// console.log(work_data);
				library_namespace.error(work_id
						+ (work_data.title ? ' ' + work_data.title : '')
						// (Did not set work_data.chapter_count)
						+ ': Can not get chapter count!');

				// 無任何章節可供下載。刪掉前面預建的目錄。
				// 注意：僅能刪除本次操作所添加/改變的檔案。因此必須先確認裡面是空的。不能使用{library_namespace.fs_remove(work_data.directory,,true);}。
				library_namespace.fs_remove(work_data.directory);

				typeof callback === 'function' && callback(work_data);
				return;
			}

			if (_this.chapter_list_URL) {
				node_fs.writeFileSync(_this.main_directory
				//
				+ _this.cache_directory_name + work_data.directory_name
				// .TOC.htm
				+ '.list.' + Work_crawler.HTML_extension, html);
			}

			// 章節的增加數量: 新-舊, 當前-上一次的
			var chapter_added = work_data.chapter_count
					- work_data.last_download.chapter;

			if (_this.recheck
			// _this.get_chapter_count() 中
			// 可能重新設定過 work_data.last_download.chapter。
			&& work_data.last_download.chapter !== _this.start_chapter) {
				library_namespace.debug('已設定 this.recheck + 作品曾有內容 / 並非空作品');

				if (_this.recheck !== 'changed'
						&& typeof _this.recheck !== 'number') {
					// 強制重新更新文件。
					// _this.recheck should be true
					if (typeof _this.recheck !== 'boolean') {
						library_namespace.warn('Unknown .recheck: '
								+ _this.recheck);
					}
					if (!_this.reget_chapter) {
						if (_this.hasOwnProperty('reget_chapter')) {
							library_namespace
									.warn('既然設定了 .recheck，則把 .reget_chapter 設定為 ['
											+ _this.reget_chapter
											+ '] 將無作用！將自動把 .reget_chapter 轉為 true，明確指定 reget_chapter 以重新取得章節內容。。');
						}
						_this.reget_chapter = true;
					}
					// 無論是哪一種，既然是recheck則都得要從頭check並生成資料。
					work_data.reget_chapter = _this.reget_chapter;
					work_data.last_download.chapter = _this.start_chapter;

				} else if ( // 依變更判定是否重新更新文件。
				// for: {Natural}_this.recheck
				_this.recheck > 0 ? chapter_added < 0
				// .recheck 採用一個較大的數字可避免太過經常更新。
				|| chapter_added >= _this.recheck
				// assert: _this.recheck === 'changed'
				: chapter_added !== 0
				// TODO: check .last_update
				) {
					library_namespace.debug('作品變更過 / midified，且符合需要更新的條件。');
					library_namespace
							.info('因章節數量有變化，將重新下載/檢查所有章節內容: '
									+ work_data.last_download.chapter
									+ '→'
									+ work_data.chapter_count
									+ ' ('
									+ (work_data.chapter_count > work_data.last_download.chapter ? '+'
											: '')
									+ (work_data.chapter_count - work_data.last_download.chapter)
									+ ')');
					// 重新下載。
					work_data.reget_chapter = true;
					// work_data.regenerate = true;
					work_data.last_download.chapter = _this.start_chapter;

				} else {
					// 不可用 ('reget_chapter' in _this)，會取得 .prototype 的屬性。
					if (!_this.hasOwnProperty('reget_chapter')) {
						work_data.reget_chapter = false;
					}
					library_namespace
							.log(_this.id
									+ ': 章節數量'
									+ (chapter_added === 0 ? '無變化，皆為 '
											+ work_data.chapter_count
											+ ' '
											+ (work_data.chapter_unit || _this.chapter_unit)
											: '變化過小('
													+ chapter_added
													+ ' '
													+ (work_data.chapter_unit || _this.chapter_unit)
													+ ')因此不重新下載')
									+ '，'
									+ (work_data.reget_chapter ? '但已設定下載所有章節內容。'
											: _this.regenerate ? '僅利用 cache 重建資料(如ebook)，不重新下載所有章節內容。'
													: '跳過本作品不處理。'));

					// 採用依變更判定時，預設不重新擷取。
					if (!('reget_chapter' in _this)) {
						work_data.reget_chapter = false;
					}
					if (work_data.reget_chapter || _this.regenerate) {
						// 即使是這一種，還是得要從頭 check cache 並生成資料(如.epub)。
						work_data.last_download.chapter = _this.start_chapter;
					}

				}
			}

			if (!('reget_chapter' in work_data)) {
				// .reget_chapter 為每個作品可能不同之屬性，非全站點共用屬性。
				work_data.reget_chapter = typeof _this.reget_chapter === 'function' ? _this
						.reget_chapter(work_data)
						: _this.reget_chapter;
			}

			if (work_data.last_download.chapter > work_data.chapter_count) {
				library_namespace.warn('章節數量 ' + work_data.chapter_count
						+ ' 比將開始/接續之下載章節編號 ' + work_data.last_download.chapter
						+ ' 還少，或許因為章節有經過重整。');
				if (_this.move_when_chapter_count_error) {
					var move_to = work_data.directory
					// 先搬移原目錄。
					.replace(/[\\\/]+$/, '.' + (new Date).format('%4Y%2m%2d'));
					// 常出現在 manhuatai, 2manhua。
					library_namespace.warn('將先備分舊內容、移動目錄，而後重新下載！\n'
							+ work_data.directory + '\n→\n' + move_to);
					// TODO: 成壓縮檔。
					library_namespace.fs_move(work_data.directory, move_to);
					// re-create work_data.directory
					library_namespace.create_directory(work_data.directory);
				} else {
					library_namespace.info('將從頭檢查、重新下載。');
				}
				work_data.reget_chapter = true;
				work_data.last_download.chapter = _this.start_chapter;
			}

			work_data.error_images = 0;
			if (work_data.last_download.chapter === _this.start_chapter) {
				work_data.image_count = 0;
			} else {
				delete work_data.image_count;
			}

			_this.save_work_data(work_data);

			if (typeof callback === 'function' && callback.options
					&& callback.options.get_data_only) {
				// 最終廢棄動作，防止執行 work_data[this.KEY_EBOOK].pack()。
				delete work_data[_this.KEY_EBOOK];
				callback(work_data);
				return;
			}

			if (!work_data.reget_chapter && !_this.regenerate
			// 還必須已經下載到最新章節。
			&& work_data.last_download.chapter === work_data.chapter_count) {
				// 跳過本作品不處理。
				library_namespace.log('Skip '
						+ work_data.id
						+ (work_data.author ? ' [' + work_data.author + ']'
								: '') + ' ' + work_data.title);
				// 最終廢棄動作，防止執行 work_data[this.KEY_EBOOK].pack()。
				delete work_data[_this.KEY_EBOOK];
				if (typeof callback === 'function') {
					callback(work_data);
				}
				return;
			}

			if (_this.need_create_ebook) {
				// console.log(work_data);
				// console.log(JSON.stringify(work_data));
				create_ebook.call(_this, work_data);
			}

			var message = [
					work_data.id,
					work_data.author ? ' [' + work_data.author + ']' : '',
					' ',
					work_data.title,
					': ',
					work_data.chapter_count >= 0
					// assert: if chapter count unknown, typeof
					// _this.pre_chapter_URL === 'function'
					? work_data.chapter_count : 'Unknown',
					' ',
					work_data.chapter_unit || _this.chapter_unit,
					'.',
					work_data.status ? ' ' + work_data.status : '',
					work_data.last_download.chapter > _this.start_chapter
					//
					? ' 自章節編號第 ' + work_data.last_download.chapter + ' 接續下載。'
							: '' ].join('');
			if (_this.is_finished(work_data)) {
				// 針對特殊狀況提醒。
				library_namespace.info(message);
			} else {
				library_namespace.log(message);
			}

			_this.get_URL_options.headers.Referer = work_URL;
			// 開始下載chapter。
			pre_get_chapter_data.call(_this, work_data,
					work_data.last_download.chapter, callback);
		}

	}

	// ----------------------------------------------------------------------------

	var QUIT_TASK = {
		quit : true
	};

	function stop_task(quit) {
		if (!this.running) {
			return;
		}

		if (!this.continue_arguments) {
			library_namespace.info(this.id + ': 準備設定' + (quit ? '取消' : '暫停')
					+ '下載作業');
			return this.continue_arguments = quit ? QUIT_TASK : true;
		}

		// 暫停中取消作業
		if (quit && this.continue_arguments !== QUIT_TASK) {
			var _arguments = this.continue_arguments;
			this.continue_arguments = QUIT_TASK;
			pre_get_chapter_data.apply(this, _arguments);
			return QUIT_TASK;
		}
	}

	function continue_task() {
		if (!Array.isArray(this.continue_arguments)) {
			return;
		}

		var _arguments = this.continue_arguments, work_data = _arguments[0];
		delete this.continue_arguments;
		// 繼續下載作業
		library_namespace.info(this.id + ': 繼續下載 ['
				+ (work_data.title || work_data.id) + ']');
		pre_get_chapter_data.apply(this, _arguments);
	}

	// @inner
	function pre_get_chapter_data(work_data, chapter_NO, callback) {
		if (this.continue_arguments) {
			library_namespace.warn(this.id + ': '
			// 暫停下載作業, 取消下載作業機制
			+ (this.continue_arguments === QUIT_TASK ? '取消' : '暫停') + '下載 ['
					+ (work_data.title || work_data.id) + ']');
			if (this.continue_arguments === QUIT_TASK) {
				// reset flag
				delete this.continue_arguments;
				if (typeof callback === 'function') {
					callback(work_data);
				}
				return;
			}

			if (this.continue_arguments === true) {
				this.continue_arguments
				// = arguments
				= [ work_data, chapter_NO, callback ];
				this.running = 'stopped';
			}
			// waiting for this.continue_task()
			return;
		}

		var _this = this,
		//
		next = get_chapter_data.bind(_this, work_data, chapter_NO, callback);

		if (this.chapter_filter) {
			var chapter_data = work_data.chapter_list
					&& work_data.chapter_list[chapter_NO - 1];

			// console.log(chapter_data);

			if (chapter_data && chapter_data.title
			// 篩選想要下載的章節標題。
			&& !chapter_data.title.includes(this.chapter_filter)) {
				library_namespace.debug('pre_get_chapter_data: Skip ['
						+ chapter_data.title + ']: 不在 chapter_filter 所篩範圍內。');

				// 執行一些最後結尾的動作。
				continue_next_chapter.call(this, work_data, chapter_NO,
						callback);
				return;
			}
		}

		if (typeof this.pre_chapter_URL === 'function') {
			// 在 this.chapter_URL() 之前執行 this.pre_chapter_URL()，
			// 主要用途在取得 chapter_URL 之資料。
			try {
				this.pre_chapter_URL(work_data, chapter_NO, next);
			} catch (e) {
				library_namespace.error(this.id + ': ' + work_data.title
						+ ': Error on chapter ' + chapter_NO);
				throw e;
			}
		} else {
			next();
		}
	}

	// @see dm5.js for sample of this.get_chapter_count()
	// e.g., work_data.chapter_list = [ chapter_data,
	// chapter_data={url:'',title:'',date:new Date}, ... ]
	function setup_chapter_list(work_data) {
		var chapter_list = work_data.chapter_list;
		if (!chapter_list) {
			work_data.chapter_list = chapter_list = [];
		}
		return chapter_list;
	}
	// should called by this.get_chapter_count()
	// this.set_part(work_data, 'part_title');
	function set_part_title(work_data, part_title, part_NO) {
		var chapter_list = setup_chapter_list(work_data);

		// reset last NO in part
		delete chapter_list.NO_in_part;

		if (part_title) {
			chapter_list.part_title = get_label(part_title);
			// last part NO. part_NO starts from 1
			chapter_list.part_NO = part_NO || (chapter_list.part_NO | 0) + 1;
		} else {
			// reset
			// delete chapter_list.part_NO;
			delete chapter_list.part_title;
		}
	}
	// should called by this.get_chapter_count()
	// this.add_chapter(work_data, chapter_data);
	function add_chapter_data(work_data, chapter_data) {
		var chapter_list = setup_chapter_list(work_data);
		if (typeof chapter_data === 'string') {
			// treat as chapter_URL
			chapter_data = {
				url : chapter_data
			};
		}
		if (chapter_list.part_title) {
			chapter_data.part_NO = chapter_list.part_NO;
			chapter_data.part_title = chapter_list.part_title;
			chapter_list.NO_in_part |= 0;
			// NO_in_part, NO in part starts from 1
			chapter_data.NO_in_part = ++chapter_list.NO_in_part;
		}
		if (false) {
			console.log(chapter_list.length + ': '
					+ JSON.stringify(chapter_data));
		}
		chapter_list.push(chapter_data);
	}
	// this.reverse_chapter_list_order(work_data);
	function reverse_chapter_list_order(work_data) {
		var chapter_list = work_data.chapter_list;
		if (!Array.isArray(chapter_list) || chapter_list.length === 0) {
			return;
		}

		// 轉成由舊至新之順序。
		chapter_list.reverse();

		if (work_data.chapter_list.part_NO >= 1) {
			// 調整 NO
			var part_title_now, parts_count_plus_1 = work_data.chapter_list.part_NO + 1, chapter_count_plus_1;
			work_data.chapter_list.forEach(function(chapter_data, index) {
				if (!(chapter_data.NO_in_part >= 1)) {
					throw 'reverse_chapter_list_order: '
					//
					+ 'Invalid NO_in_part: chapter_list[' + index + ']: '
							+ JSON.stringify(chapter_data);
				}

				if (part_title_now !== chapter_data.part_title
						|| !chapter_count_plus_1) {
					part_title_now = chapter_data.part_title;
					chapter_count_plus_1 = chapter_data.NO_in_part + 1;
				}

				chapter_data.NO_in_part = chapter_count_plus_1
						- chapter_data.NO_in_part;

				if (chapter_data.part_NO >= 1) {
					chapter_data.part_NO = parts_count_plus_1
							- chapter_data.part_NO;
				}
				// console.log(JSON.stringify(chapter_data));
			});
		}
	}
	// should called by get_data() or this.pre_parse_chapter_data()
	// this.get_chapter_directory_name(work_data, chapter_NO);
	// this.get_chapter_directory_name(chapter_data, chapter_NO);
	// this.get_chapter_directory_name(chapter_title, chapter_NO);
	function get_chapter_directory_name(work_data, chapter_NO, no_part) {
		var part, chapter_title;

		if (typeof work_data === 'string') {
			// treat chapter_data as chapter_title.
			chapter_title = work_data;

		} else if (library_namespace.is_Object(work_data)) {
			var chapter_data = work_data.chapter_list ? work_data.chapter_list[chapter_NO - 1]
					: work_data;
			if (!chapter_data) {
				throw 'get_chapter_directory_name: Invalid chapter_data: '
						+ work_data;
			}
			if (!no_part && chapter_data.part_title && (work_data.chapter_list
			// 當只有一個 part 的時候，預設不會添上 part 標題。
			&& work_data.chapter_list.part_NO > 1 || this.add_part)) {
				part = chapter_data.NO_in_part | 0;
				if (part >= 1) {
					chapter_NO = part;
				}

				part = (chapter_data.part_NO >= 1
				//
				? chapter_data.part_NO.pad(2) + ' ' : '')
				//
				+ chapter_data.part_title + ' ';
			}
			chapter_title = chapter_data.chapter_title || chapter_data.title;

		} else {
			throw 'get_chapter_directory_name: Invalid work_data: ' + work_data;
		}

		var chapter_directory_name = (part || '')
		// 檔名 NO 的基本長度（不足補零）。
		+ chapter_NO.pad(4) + (chapter_title ? ' '
		// 把網頁編碼還原成看得懂的文字。 get_label()
		+ library_namespace.HTML_to_Unicode(chapter_title) : '');

		chapter_directory_name = library_namespace
				.to_file_name(chapter_directory_name);
		return chapter_directory_name;
	}

	// @inner
	function get_chapter_data(work_data, chapter_NO, callback) {
		var _this = this,
		// remaining
		left, image_list, waiting, chapter_label,
		//
		chapter_URL = this.chapter_URL(work_data, chapter_NO);
		chapter_URL = this.full_URL(chapter_URL);
		library_namespace.debug(work_data.id + ' ' + work_data.title + ' #'
				+ chapter_NO + '/' + work_data.chapter_count + ': '
				+ chapter_URL);
		process.title = chapter_NO + ' @ ' + work_data.title + ' @ ' + this.id;

		// --------------------------------------

		// 若是已經有下載好的舊目錄風格檔案，就把它轉成新的目錄風格，避免需要重複下載。
		// 過渡時期的措施: 當所有目錄都改成新風格就應該關掉。
		if (false && Array.isArray(work_data.chapter_list)
				&& work_data.chapter_list.part_NO > 1 && !this.add_part) {
			var old_style_directory_path = work_data.directory
					+ this.get_chapter_directory_name(work_data, chapter_NO,
							true);
			if (library_namespace.directory_exists(old_style_directory_path)) {
				library_namespace.move_fso(old_style_directory_path,
						work_data.directory
								+ this.get_chapter_directory_name(work_data,
										chapter_NO));
			}
		}

		// --------------------------------------

		function get_data() {
			process.stdout.write('Get data of chapter ' + chapter_NO
			//
			+ (typeof _this.pre_chapter_URL === 'function' ? ''
			//
			: '/' + work_data.chapter_count) + '...\r');

			// default: 置於 work_data.directory 下。
			var chapter_file_name = work_data.directory
					+ work_data.directory_name + ' ' + chapter_NO.pad(3) + '.'
					+ Work_crawler.HTML_extension;

			function process_images(chapter_data, XMLHttp) {
				// get chapter label, will used as chapter directory name.
				chapter_label = _this.get_chapter_directory_name(chapter_data,
						chapter_NO);
				var chapter_directory = work_data.directory + chapter_label
						+ path_separator;
				library_namespace.create_directory(chapter_directory);

				// 注意: 若是沒有reget_chapter，則preserve_chapter_page不應發生效用。
				if (work_data.reget_chapter && _this.preserve_chapter_page) {
					node_fs.writeFileSync(chapter_directory
					//
					+ work_data.directory_name + '-' + chapter_label + '.'
							+ Work_crawler.HTML_extension, XMLHttp.buffer);
				}
				var message = [ chapter_NO,
				//
				typeof _this.pre_chapter_URL === 'function' ? ''
				//
				: '/' + work_data.chapter_count,
				//
				' [', chapter_label, '] ', left, ' images.',
				// 例如需要收費的章節。
				chapter_data.limited ? ' (limited: 本章為需要付費的章節)' : '' ].join('');
				if (chapter_data.limited) {
					// 針對特殊狀況提醒。
					library_namespace.info(message);
					if (!work_data.some_limited) {
						work_data.some_limited = true;
						set_work_status(work_data, 'limited');
					}
				} else {
					library_namespace.log(message);
				}

				// console.log(image_list);
				// TODO: 當某 chapter 檔案過多(如1000)，將一次 request 過多 connects 而造成問題。
				image_list.forEach(function(image_data, index) {
					// http://stackoverflow.com/questions/245840/rename-files-in-sub-directories
					// for /r %x in (*.jfif) do ren "%x" *.jpg

					if (image_data.file) {
						// image_data.file: 指定圖片要儲存檔的檔名與路徑 file_path。

					} else {
						if (typeof image_data.file_name === 'function') {
							// return {String}file name
							image_data.file_name = image_data.file_name(
									work_data, chapter_NO, index);
						}
						if (image_data.file_name) {
							image_data.file = chapter_directory
									+ image_data.file_name;
						} else {
							var file_extension = image_data.file_extension
									|| work_data.image_extension;
							if (!file_extension && image_data.url) {
								// 由圖片的網址來判別可能的延伸檔名。
								var matched = image_data.url.replace(/[?#].*$/,
										'');
								matched = matched.match(/\.([a-z]+)$/);
								if (matched) {
									matched = matched[1].toLowerCase();
									if (matched in _this.image_types) {
										// e.g., manhuagui.js
										library_namespace.debug(
												'file extension: .' + matched
														+ ' ← '
														+ image_data.url, 3,
												'get_data');
										file_extension = matched;
									}
								}
							}
							if (!file_extension) {
								// 採用預設的圖片延伸檔名。
								file_extension = _this.default_image_extension;
							}
							// set image file path
							image_data.file = chapter_directory + work_data.id
							//
							+ '-' + chapter_NO + '-' + (index + 1).pad(3) + '.'
									+ file_extension;
						}
					}

					if (!_this.one_by_one) {
						_this.get_images(image_data, check_if_done);
					}
				});
				library_namespace.debug(chapter_label + ': 已派發完工作，開始等待。', 3,
						'get_data');
				waiting = true;
				if (!_this.one_by_one) {
					return;
				}

				_this.get_URL_options.headers.Referer = chapter_URL;
				image_list.index = 0;
				var get_next_image = function(first) {
					if (!first) {
						++image_list.index;
						check_if_done();
					}
					process.stdout.write(image_list.index + '/'
							+ image_list.length + '...\r');
					if (image_list.index < image_list.length) {
						_this.get_images(image_list[image_list.index],
								get_next_image);
					}
				};
				get_next_image(true);
			}

			function process_chapter_data(XMLHttp) {
				XMLHttp = XMLHttp || this;
				var html = XMLHttp.responseText;
				if (!html) {
					library_namespace.error(work_data.title
							+ ': Failed to get data of chapter ' + chapter_NO);
					if (get_data.error_count === _this.MAX_ERROR_RETRY) {
						if (_this.skip_chapter_data_error) {
							library_namespace
							// Skip this chapter if do not throw
							.warn('process_chapter_data: Skip '
									+ work_data.title + ' #' + chapter_NO
									+ ' and continue next.');
							check_if_done();
							return;
						}
						throw _this.id + ': ' + _this.MESSAGE_RE_DOWNLOAD;
					}
					get_data.error_count = (get_data.error_count | 0) + 1;
					library_namespace.log('process_chapter_data: Retry '
							+ get_data.error_count + '/'
							+ _this.MAX_ERROR_RETRY + '...');
					if (!work_data.reget_chapter) {
						library_namespace
								.warn('因 cache file 壞了(例如為空)，將重新取得 chapter_URL，設定 .reget_chapter。');
						work_data.reget_chapter = true;
					}
					get_data();
					return;
				}

				var chapter_data;
				if (_this.check_chapter_NO) {
					chapter_data = Array.isArray(_this.check_chapter_NO)
					// 檢測所取得內容的章節編號是否相符。
					? html.between(_this.check_chapter_NO[0],
							_this.check_chapter_NO[1])
					// {Function}return chapter NO is OK
					: _this.check_chapter_NO(html);
					var chapter_NO_text = null;
					if (typeof chapter_data !== 'boolean') {
						chapter_NO_text = get_label(chapter_data);
						chapter_data = chapter_NO_text == chapter_NO
								// for yomou only
								|| (chapter_NO_text === '' || chapter_NO_text === undefined)
								&& work_data.status
								&& work_data.status.includes('短編')
					}
					if (!chapter_data) {
						// library_namespace.warn(html);
						library_namespace.warn(work_data.status);
						throw new Error(_this.id
								+ ': Bad chapter NO: Should be '
								+ chapter_NO
								+ (chapter_NO_text === null ? '' : ', but get '
										+ JSON.stringify(chapter_NO_text))
								+ ' inside contents.');
					}
				}

				try {
					// image_data.url 的正確設定方法:
					// = base_URL + encodeURI(CeL.HTML_to_Unicode(url))
					chapter_data = _this.parse_chapter_data(html, work_data,
							get_label, chapter_NO);
				} catch (e) {
					library_namespace.error(_this.id
							+ ': Error on chapter url: ' + chapter_URL);
					throw e;
				}
				// console.log(JSON.stringify(chapter_data));
				if (!chapter_data || !(image_list = chapter_data.image_list)
				//
				|| !((left = chapter_data.image_count) >= 1)
				//
				&& !((left = image_list.length) >= 1)) {
					if (!_this.need_create_ebook
					// 雖然是漫畫，但是本章節沒有獲取到任何圖片。
					&& (!chapter_data || !chapter_data.limited
					// 圖片檔案會用其他方式手動下載。
					&& !chapter_data.images_downloaded)) {
						library_namespace.debug(work_data.directory_name + ' #'
								+ chapter_NO + '/' + work_data.chapter_count
								+ ': No image get.');
						set_work_status(work_data, '#' + chapter_NO
								+ ': no image get.');
					}
					// 注意: 若是沒有reget_chapter，則preserve_chapter_page不應發生效用。
					if (work_data.reget_chapter && _this.preserve_chapter_page) {
						node_fs.writeFileSync(
						// 依然儲存cache。例如小說網站，只有章節文字內容，沒有圖檔。
						chapter_file_name, XMLHttp.buffer);
					}

					// 模擬已經下載完最後一張圖。
					left = 1;
					check_if_done();
					return;
				}

				// console.log(chapter_data);
				if (left !== image_list.length) {
					library_namespace.error('所登記的圖形數量' + left + '與有資料的圖形數量'
							+ image_list.length + '不同！');
					if (left > image_list.length) {
						left = image_list.length;
					}
				}
				if (work_data.image_count >= 0) {
					work_data.image_count += left;
				}

				// 自動填補章節名稱。
				if (!chapter_data.title
						&& Array.isArray(work_data.chapter_list)
						&& library_namespace
								.is_Object(work_data.chapter_list[chapter_NO - 1])) {
					chapter_data.title = work_data.chapter_list[chapter_NO - 1].title;
				}
				// TODO: 自動填補 chapter_data.url。

				if (typeof _this.pre_get_images === 'function') {
					_this.pre_get_images(XMLHttp, work_data, chapter_data,
					// pre_get_images:function(XMLHttp,work_data,chapter_data,callback){;callback();},
					function() {
						process_images(chapter_data, XMLHttp);
					});
				} else {
					process_images(chapter_data, XMLHttp);
				}
			}

			function pre_parse_chapter_data(XMLHttp) {
				// 對於每一張圖片都得要從載入的頁面獲得資訊的情況，可以參考 hhcool.js, dm5.js。

				if (typeof _this.pre_parse_chapter_data === 'function') {
					// 執行在解析章節資料 process_chapter_data() 之前的作業 (async)。
					_this.pre_parse_chapter_data(XMLHttp, work_data,
					// pre_parse_chapter_data:function(XMLHttp,work_data,callback,chapter_NO){;callback();},
					process_chapter_data.bind(XMLHttp), chapter_NO);
				} else {
					process_chapter_data(XMLHttp);
				}
			}

			if (work_data.reget_chapter) {
				get_URL(chapter_URL, pre_parse_chapter_data, _this.charset,
						null, Object.assign({
							error_retry : _this.MAX_ERROR_RETRY
						}, _this.get_URL_options));

			} else {
				// 警告: reget_chapter=false 僅適用於小說之類不取得圖片的情形，
				// 因為若有圖片（parse_chapter_data()會回傳chapter_data.image_list），將把chapter_page寫入僅能從chapter_URL取得名稱的於目錄中。
				library_namespace.get_URL_cache(chapter_URL, function(data) {
					pre_parse_chapter_data({
						buffer : data,
						responseText : data && data.toString(_this.charset)
					});
				}, {
					file_name : chapter_file_name,
					encoding : undefined,
					charset : _this.charset,
					get_URL_options : _this.get_URL_options
				});
			}
		}
		get_data();

		function check_if_done() {
			--left;
			// console.log('check_if_done: left: ' + left);
			if (Array.isArray(image_list) && image_list.length > 1) {
				process.stdout.write(left + ' left...\r');
				library_namespace.debug(chapter_label + ': ' + left + ' left',
						3, 'check_if_done');
			}
			// 須注意若是最後一張圖get_images()直接 return 了，
			// 此時尚未設定 waiting，因此此處不可以 waiting 判斷！
			if (left > 0) {
				// 還有尚未取得的檔案。
				if (waiting && left < 2) {
					library_namespace.debug('Waiting for:\n'
					//
					+ image_list.filter(function(image_data) {
						return !image_data.done;
					}).map(function(image_data) {
						return image_data.url + '\n→ ' + image_data.file;
					}));
				}
				return;
			}
			// assert: left===0

			// 已下載完本 chapter。

			// 記錄下載錯誤的檔案。
			// TODO: add timestamp, work/chapter/NO, {Array}error code
			// TODO: 若錯誤次數少於限度，則從頭擷取work。
			if (_this.error_log_file && Array.isArray(image_list)) {
				var error_file_logs = [],
				// timestamp_prefix
				log_prefix = (new Date).format('%4Y%2m%2d') + '	';
				image_list.forEach(function(image_data, index) {
					if (image_data.has_error) {
						// 記錄下載錯誤的檔案數量。
						work_data.error_images++;
						error_file_logs.push(log_prefix + image_data.file + '	'
								+ image_data.parsed_url);
					}
				});

				if (error_file_logs.length > 0) {
					error_file_logs.push('');
					var log_directory = _this.main_directory
							+ _this.log_directory_name,
					//
					error_log_file = log_directory + _this.error_log_file,
					//
					error_log_file_backup = _this.error_log_file_backup
							&& log_directory + _this.error_log_file_backup;
					library_namespace.create_directory(
					// 先創建記錄用目錄。
					log_directory);
					if (_this.recheck && error_log_file_backup) {
						// 當從頭開始檢查時，重新設定錯誤記錄檔案。
						library_namespace.move_file(error_log_file,
								error_log_file_backup);
						// 移動完之後註銷檔案名稱以防被覆寫。
						_this.error_log_file_backup = null;
					}
					node_fs.appendFileSync(error_log_file,
					// 產生錯誤紀錄檔。
					error_file_logs.join(library_namespace.env.line_separator));
					set_work_status(work_data, chapter_label + ': '
							+ error_file_logs.length + ' images download error');
				}
			}

			// 紀錄最後下載的章節計數。
			work_data.last_download.chapter = chapter_NO;

			continue_next_chapter.call(_this, work_data, chapter_NO, callback);
		}
	}

	// @inner
	function continue_next_chapter(work_data, chapter_NO, callback) {
		// 這邊不紀錄最後下載的章節數 work_data.last_download.chapter。
		// 因為可能是 pre_get_chapter_data() 篩選排除之後直接被呼叫的。
		// 假如是因篩選排除的，可能有些章節沒有下載到，因此下一次下載的時候應該重新檢查。

		// 紀錄最後成功下載章節或者圖片日期。
		work_data.last_saved = (new Date).toISOString();
		// 紀錄已下載完之 chapter。
		this.save_work_data(work_data);

		// 增加章節計數，準備下載下一個章節。
		if (++chapter_NO > work_data.chapter_count) {
			library_namespace.log(work_data.directory_name
			// 增加章節數量的訊息。
			+ ': ' + work_data.chapter_count
			//
			+ ' ' + (work_data.chapter_unit || this.chapter_unit)
			// 增加字數統計的訊息。
			+ (work_data.words_so_far > 0 ?
			//
			' (' + work_data.words_so_far + ' words)' : '')
			// 增加漫畫圖片數量的統計訊息。
			+ (work_data.image_count > 0 ?
			//
			', ' + work_data.image_count + ' images' : '')
			//
			+ ' done. 本作品下載作業結束.');
			if (work_data.error_images > 0) {
				library_namespace.error(work_data.directory_name + ': '
						+ work_data.error_images
						+ ' images download error this time.');
			}
			if (typeof callback === 'function') {
				callback(work_data);
			}

		} else {
			// 為了預防太多堆疊，因此使用 setImmediate()。
			setImmediate(pre_get_chapter_data.bind(this, work_data, chapter_NO,
					callback));
		}
	}

	function image_path_to_url(path, server) {
		if (path.includes('://')) {
			return path;
		}

		if (!server.includes('://')) {
			// this.get_URL_options.headers.Host = server;
			server = 'http://' + server;
		}
		return server + path;
	}

	function EOI_error_path(path, XMLHttp) {
		return path.replace(/(\.[^.]*)$/, this.EOI_error_postfix
		// + (XMLHttp && XMLHttp.status ? ' ' + XMLHttp.status : '')
		+ '$1');
	}

	function get_images(image_data, callback) {
		// console.log(image_data);
		if (node_fs.existsSync(image_data.file) || this.skip_existed_bad_file
		// 檢查是否已具有server上本身就已經出錯的檔案。
		&& node_fs.existsSync(this.EOI_error_path(image_data.file))) {
			image_data.done = true;
			typeof callback === 'function' && callback();
			return;
		}

		var _this = this,
		// 漫畫圖片的 URL。
		url = image_data.url, server = this.server_list;
		if (server) {
			server = server[server.length * Math.random() | 0];
			url = this.image_path_to_url(url, server, image_data);
		} else {
			url = this.full_URL(url);
		}
		image_data.parsed_url = url;
		if (!PATTERN_non_CJK.test(url)) {
			library_namespace.warn('Need encodeURI: ' + url);
			// url = encodeURI(url);
		}

		if (!image_data.file_length) {
			image_data.file_length = [];
		}

		get_URL(url, function(XMLHttp) {
			// console.log(XMLHttp);
			// 圖片數據的內容。
			var contents = XMLHttp.responseText,
			// 因為當前尚未能 parse 圖像，而 jpeg 檔案可能在檔案中間出現 End Of Image mark；
			// 因此當圖像檔案過小，即使偵測到以 End Of Image mark 作結，依然有壞檔疑慮。
			has_error = !contents || !(contents.length >= _this.MIN_LENGTH)
					|| (XMLHttp.status / 100 | 0) !== 2, verified_image;
			if (!has_error) {
				image_data.file_length.push(contents.length);
				var file_type = library_namespace.file_type(contents);
				verified_image = file_type && !file_type.damaged;
				if (verified_image) {
					if (!(file_type.type in _this.image_types)) {
						library_namespace.warn('The file type ['
								+ file_type.type
								+ '] is not image types accepted!\n'
								+ image_data.file);
					}
					if (!image_data.file.endsWith('.' + file_type.extension)) {
						// 依照所驗證的檔案格式改變副檔名。
						image_data.file = image_data.file.replace(/[^.]+$/,
						// e.g. .png
						file_type.extension
						// 若是沒有辦法判別延伸檔名，那麼就採用預設的圖片延伸檔名。
						|| _this.default_image_extension);
					}
				}
			}
			// verified_image===true 則必然(!!has_error===false)
			// has_error表示下載過程發生錯誤，光是檔案損毀，不會被當作has_error!
			// has_error則必然(!!verified_image===false)

			if (false) {
				console.log(_this.skip_error + ',' + _this.MAX_ERROR_RETRY
						+ ',' + has_error);
				console.log('error count: ' + image_data.error_count);
			}
			if (verified_image || _this.skip_error
			// 有出問題的話，最起碼都需retry足夠次數。
			&& image_data.error_count === _this.MAX_ERROR_RETRY
			//
			|| _this.allow_EOI_error
			//
			&& image_data.file_length.length > _this.MAX_EOI_ERROR) {
				// console.log(image_data.file_length);
				if (verified_image || _this.skip_error
				// skip error 的話，就算沒有取得過檔案(如404圖像不存在)，依然 pass。
				&& image_data.file_length.length === 0
				//
				|| image_data.file_length.cardinal_1()
				// ↑ 若是每次都得到相同的檔案長度，那就當作來源檔案本來就有問題。
				&& (_this.skip_error || _this.allow_EOI_error
				//
				&& image_data.file_length.length > _this.MAX_EOI_ERROR)) {
					// pass, 過關了。
					var bad_file_path = _this.EOI_error_path(image_data.file,
							XMLHttp);
					if (has_error || verified_image === false) {
						image_data.file = bad_file_path;
						image_data.has_error = true;
						library_namespace.warn('Force saving '
								+ (has_error ? (contents ? 'bad' : 'empty')
										+ ' file (as image)'
								// assert: (!!verified_image===false)
								// 圖檔損壞: e.g., Do not has EOI
								: 'bad image')
								+ (XMLHttp.status ? ' (status '
										+ XMLHttp.status + ')' : '')
								+ (contents ? ' ' + contents.length + ' bytes'
										: '') + ': ' + image_data.file + '\n← '
								+ url);
						if (!contents
						// 404之類，就算有內容，也不過是錯誤訊息頁面。
						|| (XMLHttp.status / 100 | 0) === 4) {
							contents = '';
						}
					} else if (node_fs.existsSync(bad_file_path)) {
						library_namespace.info('刪除損壞的舊檔：' + bad_file_path);
						library_namespace.fs_remove(bad_file_path);
					}

					var old_file_status;
					try {
						old_file_status = node_fs.statSync(image_data.file);
					} catch (e) {
						// old/bad file not exist
					}
					if (!old_file_status
					// 得到更大的檔案，寫入更大的檔案。
					|| old_file_status.size < contents.length) {
						// 保存圖片數據到HDD上。
						// TODO: 檢查舊的檔案是不是文字檔。例如有沒有包含HTML標籤。
						node_fs.writeFileSync(image_data.file, contents);
					} else if (old_file_status
							&& old_file_status.size > contents.length) {
						library_namespace.log('存在較大的舊檔 ('
								+ old_file_status.size + '>' + contents.length
								+ ')，將不覆蓋：' + image_data.file);
					}
					image_data.done = true;
					typeof callback === 'function' && callback();
					return;
				}
			}

			// 有錯誤。下載錯誤時報錯。
			library_namespace.error(
			// 圖檔損壞: e.g., Do not has EOI
			(verified_image === false ? 'Image damaged: '
			//
			: (XMLHttp.status ? XMLHttp.status + ' ' : '')
			//
			+ '(' + (!contents ? 'No contents' : contents.length + ' B'
			//
			+ (contents.length >= _this.MIN_LENGTH ? '' : ', too small'))
			//
			+ '): Failed to get ') + url + '\n→ ' + image_data.file);
			if (image_data.error_count === _this.MAX_ERROR_RETRY) {
				image_data.has_error = true;
				// throw new Error(_this.id + ': ' + _this.MESSAGE_RE_DOWNLOAD);
				library_namespace.log(_this.id + ': '
						+ _this.MESSAGE_RE_DOWNLOAD);
				// console.log('error count: ' + image_data.error_count);
				if (!_this.skip_error) {
					library_namespace
							.info('若錯誤持續發生，您可以設定 skip_error=true 來忽略圖像錯誤。');
				}
				if (contents && contents.length < _this.MIN_LENGTH
				// 檔案有驗證過，只是太小時，應該不是 false。
				&& verified_image !== false) {
					library_namespace.warn('或許圖像是完整的，只是過小而未達標，例如幾乎為空白之圖像。'
							+ '您可設定 MIN_LENGTH 如 MIN_LENGTH=2000；'
							+ '或者先設定 skip_error=true 來忽略圖像錯誤，'
							+ '待取得檔案後，自行更改檔名，去掉錯誤檔名後綴'
							+ JSON.stringify(_this.EOI_error_postfix)
							+ '以跳過此錯誤。');
				}
				process.exit(1);
			}

			image_data.error_count = (image_data.error_count | 0) + 1;
			library_namespace.log('get_images: Retry ' + image_data.error_count
					+ '/' + _this.MAX_ERROR_RETRY + '...');
			_this.get_images(image_data, callback);

		}, 'binary', null, Object.assign({
			/**
			 * 最多平行取得檔案(圖片)的數量。
			 * 
			 * 最多平行取得檔案的數量。 <code>
			incase "MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 connect listeners added. Use emitter.setMaxListeners() to increase limit"
			</code>
			 */
			max_listeners : 300
		}, this.get_URL_options));
	}

	// --------------------------------------------------------------------------------------------
	// 在取得小說章節內容的時候，若發現有章節被目錄漏掉，則將之補上。

	// 通常應該會被 parse_chapter_data() 呼叫。
	function check_next_chapter(work_data, chapter_NO, html,
			PATTERN_next_chapter) {
		var next_chapter = work_data.chapter_list[chapter_NO],
		// chapter_data.url
		next_chapter_url = next_chapter && next_chapter.url,
		// /下一[章页][：: →]*<a [^<>]*?href="([^"]+.html)"[^<>]*>/
		next_url = html.match(PATTERN_next_chapter ||
		// PTCMS default. e.g., "下一章 →"
		// PATTERN_next_chapter: [ all, next chapter url ]
		// e.g., <a href="//read.qidian.com/chapter/abc123">下一章</a>
		/ href="([^<>"]+)"[^<>]*>下一[章页]/);
		// console.log(chapter_NO + ': ' + next_url[1]);

		if (next_chapter && next_url

		// 去掉開頭的 "./"。
		&& (next_url = next_url[1].replace(/^(\.\/)+/,
		//
		this.chapter_URL(work_data, chapter_NO).replace(/[^\/]+$/, '')))

		// 有些在目錄上面的章節連結到了錯誤的頁面，只能靠下一頁來取得正確頁面。
		&& next_url !== next_chapter_url
		// 許多網站會把最新章節的下一頁設成章節列表，因此必須排除章節列表的網址。
		&& next_url !== work_data.url
		// && next_url !== './'
		&& next_url !== 'index.html'

		// 符合這些條件的，依然是相同的網址。
		// 照理來說.startsWith()本陳述應該皆為真。
		&& !(next_url.startsWith(work_data.base_url)
		// 檢查正規化規範連結之後是否與本章節相同。
		? (next_url.length < next_chapter_url.length
		//
		? next_url === next_chapter_url.slice(work_data.base_url.length)
		//
		: next_chapter_url === next_url.slice(work_data.base_url.length))
		//
		: (next_url.length < next_chapter_url.length
		//
		? next_chapter_url.endsWith(next_url)
		// 
		: next_url.endsWith(next_chapter_url)))

		) {

			if (false) {
				// 不採用插入的方法，直接改掉下一個章節。
				library_namespace.info(library_namespace.display_align([
						[ 'chapter ' + chapter_NO + ': ', next_chapter_url ],
						[ '→ ', next_url ] ]));
				next_chapter.url = next_url;
			}

			var message = 'check_next_chapter: Insert a chapter url after chapter '
					+ chapter_NO + ': ' + next_url
					// 原先下一個章節的URL被往後移一個。
					+ (next_chapter_url ? '→' + next_chapter_url : '');
			if (next_chapter_url) {
				// Insert a chapter url
				library_namespace.log(message);
			} else {
				// Append a chapter url at last
				library_namespace.debug(message);
			}

			work_data.chapter_list.splice(chapter_NO, 0, {
				// title : '',
				url : next_url
			});
		}
	}

	// --------------------------------------------------------------------------------------------
	// 本段功能須配合 CeL.application.storage.EPUB 並且做好事前設定。
	// 可參照 https://github.com/kanasimi/work_crawler

	function create_ebook(work_data) {
		if (!this.site_id) {
			this.site_id = this.id;
		}

		if (!library_namespace.is_Date(work_data.last_update_Date)
				&& work_data.last_update) {
			var last_update_Date = work_data.last_update;
			// assert: typeof last_update_Date === 'string'
			last_update_Date = last_update_Date.to_Date({
				zone : work_data.time_zone
			});
			// 注意：不使用 cache。
			work_data.last_update_Date = last_update_Date;
		}

		// CeL.application.storage.EPUB
		var ebook = new library_namespace.EPUB(work_data.directory
				+ work_data.directory_name, {
			rebuild : this.hasOwnProperty('rebuild_ebook')
			// rebuild: 重新創建, 不使用舊的.opf資料. start over, re-create
			? work_data.rebuild_ebook : work_data.reget_chapter
					|| work_data.regenerate,
			id_type : this.site_id,
			// 以下為 epub <metadata> 必備之元素。
			// 小説ID
			identifier : work_data.id,
			title : work_data.title,
			language : work_data.language || this.language,
			// 作品內容最後編輯時間。
			modified : work_data.last_update_Date
		});

		ebook.time_zone = work_data.time_zone || this.time_zone;

		// http://www.idpf.org/epub/31/spec/epub-packages.html#sec-opf-dcmes-optional
		ebook.set({
			// 作者名
			creator : work_data.author,
			// 🏷標籤, ジャンル, タグ, キーワード
			subject : work_data.genre || work_data.status,
			// あらすじ, 簡介
			description : get_label(work_data.description
			// .description 中不可存在 tag。
			.replace(/\n*<br[^<>]+>\n*/ig, '\n')),
			publisher : work_data.site_name + ' (' + this.base_URL + ')',
			// source URL
			source : work_data.url
		});

		if (work_data.image) {
			ebook.set_cover(work_data.image);
		}

		return work_data[this.KEY_EBOOK] = ebook;
	}

	// 找出段落開頭。
	// '&nbsp;' 已經被 normailize_contents() @CeL.EPUB 轉換為 '&#160;'
	var PATTERN_PARAGRAPH_START_CMN = /(^|\n|<\/?(?:br|p)(?:[^a-z][^<>]*)?>)(?:&#160;|\s){4,}([^\s\n&])/ig,
	//
	PATTERN_PARAGRAPH_START_JP = new RegExp(PATTERN_PARAGRAPH_START_CMN.source
			.replace('{4,}', '{2,}'), PATTERN_PARAGRAPH_START_CMN.flags);

	// 通常應該會被 parse_chapter_data() 呼叫。
	function add_ebook_chapter(work_data, chapter_NO, data) {
		var ebook = work_data && work_data[this.KEY_EBOOK];
		if (!ebook) {
			return;
		}

		if (!data.sub_title) {
			if ('title' in data) {
				// throw '請將 parse_chapter_data() 中章節名稱設定在 sub_title 而非 title!';
				// 當僅設定title時，將之當做章節名稱而非part名稱。
				data.sub_title = data.title;
				delete data.title;
			} else if (work_data.chapter_list
					&& work_data.chapter_list[chapter_NO - 1].title) {
				data.sub_title = work_data.chapter_list[chapter_NO - 1].title;
			}
		}

		if (Array.isArray(data.title)) {
			data.title = data.title.join(' - ');
		}
		// assert: !data.title || typeof data.title === 'string'

		var language = work_data.language
		// e.g., 'cmn-Hans-CN'
		&& work_data.language.match(/^(ja|cmn)(?:$|[^a-z])/);
		if (language) {
			language = language[1];
		}

		var _this = this,
		//
		chapter_data = work_data.chapter_list
				&& work_data.chapter_list[chapter_NO - 1],
		// 卷/集/幕/部/volume/part/book
		part_title = data.title || chapter_data && chapter_data.part_title,
		// 章節名稱 / 章節节回折篇話话頁页/chapter
		chapter_title = data.sub_title || chapter_data
				&& (chapter_data.chapter_title || chapter_data.title),
		//
		file_title = chapter_NO.pad(3) + ' '
				+ (part_title ? part_title + ' - ' : '')
				+ (chapter_title || ''),
		//
		item_data = {
			title : file_title,
			// include images / 自動載入內含資源, 將外部media內部化
			internalize_media : true,
			file : library_namespace.to_file_name(file_title + '.xhtml'),
			// 一般說來必須設定 work_data.chapter_list。
			date : data.date || chapter_data && chapter_data.date,
			// 設定item_data.url可以在閱讀電子書時，直接點選標題就跳到網路上的來源。
			url : data.url
					|| this.full_URL(this.chapter_URL(work_data, chapter_NO)),
			// pass Referer, User-Agent
			get_URL_options : Object.assign({
				error_retry : this.MAX_ERROR_RETRY
			}, this.get_URL_options),
			words_so_far : work_data.words_so_far
		},
		//
		item = {
			title : get_label(part_title || ''),
			sub_title : get_label(chapter_title || ''),
			text : data.text,
			post_processor : function(contents) {
				// 正規化小說章節文字。
				if (language === 'ja') {
					contents = contents.replace(PATTERN_PARAGRAPH_START_JP,
					// 日本語では行頭から一文字の字下げをする。
					'$1　$2');
				} else if (language) {
					// assert: language: 中文
					// TODO: 作繁簡轉換。
					contents = contents.replace(PATTERN_PARAGRAPH_START_CMN,
					// 中文每段落開頭空兩個字。
					'$1　　$2');
				}

				// TODO: 可去除一開始重複的章節標題。

				if (typeof _this.contents_post_processor === 'function') {
					contents = _this.contents_post_processor(contents,
							work_data);
				}

				if (contents.length < _this.MIN_CHAPTER_SIZE) {
					set_work_status(work_data, '#'
							+ chapter_NO
							+ ': '
							+ (contents.length ? '字數過少 (' + contents.length
									+ ')' : '無內容'));
				}
				return contents;
			}
		};

		item = ebook.add(item_data, item);

		// 登記本作品到本章節總計的字數。
		if (item && !item.error && item_data.word_count > 0) {
			work_data.words_so_far = (work_data.words_so_far || 0)
					+ item_data.word_count;
		}

		return item;
	}

	// 一般小説, 長篇小說
	// @see .chapter_unit
	// [ all, author, title, site name, date, chapter count, work id ]
	var PATTERN_ebook_file = /^\((?:一般|長篇|短篇|言情|日系)?小[說説]\) \[([^\[\]]+)\] ([^\[\]]+) \[(.*?) (\d{8})(?: (\d{1,4})[章節节回折篇話话頁页])?\]\.(.+)\.epub$/i;
	function parse_ebook_name(file_name) {
		library_namespace.debug(file_name, 3, 'parse_ebook_name');
		var matched = typeof file_name === 'string'
				&& file_name.match(PATTERN_ebook_file);
		if (matched) {
			return {
				file_name : file_name,
				author : matched[1],
				title : matched[2],
				// titles : matched[2].trim().split(' - '),
				site_name : matched[3],
				// e.g., "20170101"
				date : matched[4],
				chapter_count : matched[5],
				// book id in this site
				id : matched[6]
			};
		}
	}

	function get_file_status(file_name, directory) {
		var status = node_fs.lstatSync((directory || '') + file_name);
		status.name = file_name;
		return status;
	}

	// @inner
	// remove duplicate title ebooks.
	// 封存舊的ebooks，移除較小的舊檔案。
	function remove_old_ebooks(only_id) {
		if (only_id !== undefined) {
			// assert: {String|Number}only_id
			only_id = only_id.toString();
			var _only_id = this.parse_ebook_name(only_id);
			if (_only_id)
				only_id = _only_id.id;
		}

		var _this = this;

		if (!this.ebook_archive_directory) {
			this.ebook_archive_directory = this.main_directory
					+ this.archive_directory_name;
			if (!library_namespace
					.directory_exists(this.ebook_archive_directory)) {
				library_namespace.create_directory(
				// 先創建封存用目錄。
				this.ebook_archive_directory);
			}
		}

		function for_each_old_ebook(directory, for_old_smaller, for_else_old) {
			var last_id, last_file,
			//
			ebooks = library_namespace.read_directory(directory);

			if (!ebooks) {
				// 照理來說應該在之前已經創建出來了。
				library_namespace.warn('不存在封存檔案用的目錄: '
						+ _this.ebook_archive_directory);
				return;
			}

			ebooks
			// assert: 依 id 舊至新排列
			.sort().map(_this.parse_ebook_name.bind(_this))
			//
			.forEach(function(data) {
				if (!data
				// 僅針對 only_id。
				|| only_id && data.id !== only_id) {
					return;
				}
				// console.log('-'.repeat(60));
				// console.log(data);
				if (!last_id || last_id !== data.id) {
					last_id = data.id;
					last_file = data.file_name;
					return;
				}

				var this_file = get_file_status(
				//
				data.file_name, directory);
				// console.log(this_file);
				if (typeof last_file === 'string') {
					last_file = get_file_status(
					//
					last_file, directory);
				}
				// console.log(last_file);
				// assert: this_file, last_file are all {Object}(file status)

				if (this_file.size >= last_file.size) {
					for_old_smaller(last_file, this_file);
				} else if (for_else_old) {
					for_else_old(last_file, this_file);
				}

				last_file = this_file;
			});
		}

		// 封存較小的ebooks舊檔案。
		for_each_old_ebook(this.main_directory, function(last_file) {
			last_file = last_file.name;
			library_namespace.log(_this.main_directory + last_file
			// 新檔比較大。刪舊檔或將之移至archive。
			+ '\n→ ' + _this.ebook_archive_directory + last_file);
			library_namespace.move_file(
			//
			_this.main_directory + last_file,
			//
			_this.ebook_archive_directory + last_file);

		}, this.milestone_extension && function(last_file) {
			last_file = _this.main_directory + last_file.name;
			var extension = (typeof _this.milestone_extension === 'string'
			// allow .milestone_extension = true
			? _this.milestone_extension : '.milestone') + '$1',
			// 舊檔比較大!!將之標註成里程碑紀念/紀錄。
			rename_to = last_file.replace(/(.[a-z\d\-]+)$/i, extension);
			// assert: PATTERN_ebook_file.test(rename_to) === false
			// 不應再被納入檢測。
			library_namespace.log(last_file + '\n→ ' + rename_to);
			library_namespace.move_file(last_file, rename_to);
		});

		// ✘ 移除.ebook_archive_directory中，較小的ebooks舊檔案。
		// 僅留存最新的一個ebooks舊檔案。
		for_each_old_ebook(this.ebook_archive_directory, function(last_file,
				this_file) {
			library_namespace.info('remove_old_ebooks: '
			// 新檔比較大。刪舊檔。
			+ _this.ebook_archive_directory + last_file.name + ' ('
			// https://en.wikipedia.org/wiki/Religious_and_political_symbols_in_Unicode
			+ this_file.size + ' = ' + last_file.size + '+'
			// ✞ Memorial cross, Celtic cross
			+ (this_file.size - last_file.size) + ')');
			library_namespace.remove_file(
			//
			_this.ebook_archive_directory + last_file.name);
		});
	}

	function pack_ebook(work_data, file_name) {
		// remove_old_ebooks.call(this);

		var ebook = work_data && work_data[this.KEY_EBOOK];
		if (!ebook) {
			return;
		}

		process.title = '打包 epub: ' + work_data.title + ' @ ' + this.id;
		if (!file_name) {
			file_name =
			// e.g., "(一般小説) [author] title [site 20170101 1話].id.epub"
			[ '(一般小説) [', work_data.author, '] ', work_data.title, ' [',
					work_data.site_name, ' ',
					work_data.last_update_Date.format('%Y%2m%2d'),
					work_data.chapter_count >= 1
					//
					? ' ' + work_data.chapter_count
					//
					+ (work_data.chapter_unit || this.chapter_unit) : '', '].',
					work_data.id, '.epub' ].join('');
		}
		file_name = library_namespace.to_file_name(file_name);
		// assert: PATTERN_ebook_file.test(file_name) === true

		// https://github.com/ObjSal/p7zip/blob/master/GUI/Lang/ja.txt
		library_namespace.debug('打包 epub: ' + file_name);

		// this: this_site
		ebook.pack([ work_data.ebook_directory || this.main_directory,
				file_name ], this.remove_ebook_directory);

		remove_old_ebooks.call(this, work_data.id);
	}

	// --------------------------------------------------------------------------------------------

	// export 導出.

	return Work_crawler;
}
