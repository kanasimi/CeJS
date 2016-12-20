/**
 * @name CeL function for downloading comics.
 * 
 * @fileoverview 本檔案包含了批量下載漫畫的函式庫。
 * 
 * TODO:<code>

流程:

// 取得伺服器列表。 start_operation()
// 解析設定檔，判別所要下載的作品列表。 parse_work_id(), get_work_list()
// 解析 作品名稱 → 作品id get_work()
// 取得作品的章節資料。 get_work_data()
// 取得每一個章節的各個影像內容資料。 get_chapter_data()
// 取得各個章節的每一個影像內容。 get_images()

</code>
 * 
 * @see https://github.com/abcfy2/getComic
 * 
 * @since 2016/10/30 21:40:6
 * @since 2016/11/1 23:15:16 正式運用：批量下載腾讯漫画 qq。
 * @since 2016/11/5 22:44:17 正式運用：批量下載漫画台 manhuatai。
 * @since 2016/11/27 19:7:2 模組化。
 */

// More examples: see 各漫畫網站工具檔.js
'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.comic',

	// .includes() @ CeL.data.code.compatibility
	// .between() @ CeL.data.native
	// .append() @ CeL.data.native
	require : 'data.code.compatibility.|data.native.'
	// for CeL.to_file_name()
	+ '|application.net.'
	//
	+ '|application.net.Ajax.get_URL'
	// for CeL.env.arg_hash, CeL.fs_mkdir()
	+ '|application.platform.nodejs.'
	// for HTML_to_Unicode()
	+ '|interact.DOM.',

	// 設定不匯出的子函式。
	no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var get_URL = this.r('get_URL'),
	/** node.js file system module */
	node_fs = library_namespace.platform.nodejs && require('fs'),
	// @see CeL.application.net.wiki
	PATTERN_non_CJK = /^[\u0000-\u2E7F]*$/i;

	/**
	 * null module constructor
	 * 
	 * @class web Ajax 的 functions
	 */
	var _// JSDT:_module_
	= function() {
		// null module constructor
	};

	/**
	 * for JSDT: 有 prototype 才會將之當作 Class
	 */
	_// JSDT:_module_
	.prototype = {};

	// --------------------------------------------------------------------------------------------

	function Comic_site(configurations) {
		Object.assign(this, configurations);
		if (!this.id) {
			this.id = this.main_directory.replace(/[\\\/]+$/, '');
		}
		if (!configurations.MESSAGE_RE_DOWNLOAD) {
			this.MESSAGE_RE_DOWNLOAD = this.id + ': '
					+ this.MESSAGE_RE_DOWNLOAD;
		}

		// 初始化 agent。
		// create and keep a new agent. 維持一個獨立的 agent。
		// 以不同 agent 應對不同 host。
		var agent = library_namespace.application.net
		//
		.Ajax.setup_node_net(this.base_URL);
		agent.keepAlive = true;
		this.get_URL_options = {
			// start_time : Date.now(),
			agent : agent,
			timeout : Comic_site.timeout,
			headers : Object.assign({
				'User-Agent' : this.user_agent,
				Referer : this.base_URL
			}, this.headers)
		};
	}

	_.site = Comic_site;

	/** {Natural}同一檔案錯誤超過此數量則跳出。 */
	Comic_site.MAX_ERROR = 4;
	/** {Natural}timeout in ms for get_URL() */
	Comic_site.timeout = 30 * 1000;

	Comic_site.prototype = {
		main_directory : library_namespace.platform.nodejs
				&& process.mainModule ? process.mainModule.filename
				.match(/[^\\\/]+$/)[0].replace(/\.js$/i, '')
				+ '/' : './',
		// base_URL : '',
		// 腾讯TT浏览器
		user_agent : 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; TencentTraveler 4.0)',
		MAX_ERROR : Comic_site.MAX_ERROR,
		MAX_EOI_ERROR : Math.min(3, Comic_site.MAX_ERROR),
		// 應改成最小容許圖案檔案大小 (bytes)。
		MIN_LENGTH : 6e3,
		MESSAGE_RE_DOWNLOAD : '下載出錯了，例如服務器暫時斷線、檔案闕失(404)。請確認排除錯誤或錯誤不再持續後，重新執行以接續下載。',
		// allow .jpg without EOI mark. default:false
		// allow_EOI_error : true,
		//
		// 當圖像檔案過小，或是被偵測出非圖像(如不具有EOI)時，依舊強制儲存檔案。default:false
		// skip_error : true,
		//
		// 若已經存在壞掉的圖片，就不再嘗試下載圖片。default:false
		// skip_existed_bad_file : true,
		//
		// e.g., '2-1.jpg' → '2-1 bad.jpg'
		EOI_error_postfix : ' bad',
		// 加上有錯誤檔案之註記。
		EOI_error_path : EOI_error_path,

		// recheck:從頭檢測所有作品之所有章節與所有圖片。default:false
		// recheck : true,
		image_path_to_url : image_path_to_url,
		is_work_id : function(work_id) {
			return work_id > 0;
		},
		is_finished : function(work_data) {
			return work_data.status === '已完结';
		},
		pre_get_chapter_data : pre_get_chapter_data,

		start : start_operation,
		parse_work_id : parse_work_id,
		get_work_list : get_work_list,
		get_work : get_work,
		get_work_data : get_work_data,
		get_chapter_data : get_chapter_data,
		get_images : get_images
	};

	// --------------------------------------------------------------------------------------------

	function start_operation(work_id) {
		if (!work_id) {
			library_namespace.log(this.id + ': 沒有輸入 work_id!');
			return;
		}
		library_namespace.log(this.id + ': Strating ' + work_id);
		// prepare work directory.
		library_namespace.fs_mkdir(this.main_directory);

		if (!this.server_URL) {
			this.parse_work_id(work_id);
			return;
		}

		var _this = this,
		// host_file
		server_file = this.main_directory + 'servers.json';

		if (this.use_server_cache
		// host_list
		&& (this.server_list = library_namespace.get_JSON(server_file))) {
			// use cache of host list
			this.parse_work_id(work_id);
			return;
		}

		// 取得伺服器列表。
		get_URL(typeof this.server_URL === 'function' ? this.server_URL()
				: this.server_URL, function(XMLHttp) {
			var html = XMLHttp.responseText;
			_this.server_list = _this.parse_server_list(html)
			// 確保有東西。
			.filter(function(server) {
				return !!server;
			}).unique();
			library_namespace.log('Get ' + _this.server_list.length
					+ ' servers: ' + _this.server_list);
			library_namespace.fs_write(server_file, JSON
					.stringify(_this.server_list));
			_this.parse_work_id(work_id);
		}, null, null, this.get_URL_options);
	}

	// ----------------------------------------------------------------------------

	function parse_work_id(work_id) {
		work_id = String(work_id);

		if (work_id.startsWith('l=') || node_fs.existsSync(work_id)) {
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
			.trim().replace(/(?:^|\n)#[^\n]*/g, '').trim().split(/[\r\n]+/);
			this.get_work_list(work_list);

		} else if (work_id) {
			// e.g.,
			// node 各漫畫網站工具檔.js 12345
			// node 各漫畫網站工具檔.js ABC
			this.get_work(work_id);
		}
	}

	function get_work_list(work_list) {
		// console.log(work_list);
		var _this = this, next_index = 0,
		// 真正處理的作品數。
		work_count = 0;

		function insert_id(id_list) {
			if (Array.isArray(id_list)) {
				// 插入list。
				id_list.forEach(function(id, index) {
					work_list.splice(next_index + index, 0, id);
				});
			}
			get_next_work();
		}

		function get_next_work() {
			if (next_index === work_list.length) {
				library_namespace.log(_this.id + 'All ' + work_list.length
						+ ' works done.');
				return;
			}

			var work_title = work_list[next_index++].trim();
			if (!work_title) {
				// 直接進入下一個work_title。
				get_next_work();

			} else if (_this.convert_id
			// convert special work id: function(callback, type)
			// 警告: 需要自行呼叫 callback(id_list);
			&& typeof _this.convert_id[work_title] === 'function') {
				_this.convert_id[work_title].call(_this, insert_id, work_title);

			} else {
				work_count++;
				library_namespace.log('Download ' + work_count
						+ (work_count === next_index ? '' : '/' + next_index)
						+ '/' + work_list.length + ': ' + work_title);
				_this.get_work(work_title, get_next_work);
			}
		}

		get_next_work();
	}

	// ----------------------------------------------------------------------------

	function get_work(work_title, callback) {
		// 先取得 work id
		if (this.is_work_id(work_title)) {
			// is work id
			this.get_work_data(work_title, callback);
			return;
		}

		var _this = this, search_result_file = this.main_directory
				+ 'search.json',
		// search cache
		// 檢查看看之前是否有取得過。
		search_result = library_namespace.get_JSON(search_result_file)
				|| library_namespace.null_Object();

		function finish(no_cache) {
			if (!no_cache) {
				// write cache
				library_namespace.fs_write(search_result_file, search_result);
			}
			search_result = search_result[work_title];
			var p = _this.id_of_search_result;
			if (p) {
				search_result = typeof p === 'function' ? p(search_result)
						: search_result ? search_result[p] : search_result;
			}
			_this.get_work_data(search_result, callback);
		}

		if (search_result[work_title = work_title.trim()]) {
			library_namespace.log('Find cache: ' + work_title + ' → '
					+ JSON.stringify(search_result[work_title]));
			finish(true);
			return;
		}

		var url = this.search_URL;
		if (!url || typeof this.parse_search_result !== 'function') {
			throw '請手動設定/輸入 [' + work_title + '] 之 id 於 ' + search_result_file;
		}
		if (typeof url === 'function') {
			// url = url.call(this, work_title);
			url = this.search_URL(work_title);
		} else {
			// assert: typeof url==='string'
			if (!url.includes('://')) {
				url = this.base_URL + url;
			}
			url = url + encodeURIComponent(
			// e.g., 找不到"隔离带 2"，須找"隔离带"。
			work_title.replace(/\s+\d+$/, ''));
		}
		get_URL(url, function(XMLHttp) {
			// this.parse_search_result() returns:
			// [ id_list, 與id_list相對應之{Array}或{Object} ]
			// e.g., [ [id,id,...], [title,title,...] ]
			// e.g., [ [id,id,...], [data,data,...] ]
			// e.g., [ [id,id,...], {id:data,id:data,...} ]
			var id_data = _this.parse_search_result(XMLHttp.responseText),
			// {Array}id_list = [id,id,...]
			id_list = id_data[0] || [];
			// console.log(id_data);
			id_data = id_data[1];
			if (id_list.length !== 1) {
				library_namespace.warn('[' + work_title + ']: Get '
				//
				+ id_list.length + ' works: ' + JSON.stringify(id_data));
			}

			if (id_list.every(function(id, index) {
				var title = library_namespace.is_Object(id) ? id
				//
				: id_data[Array.isArray(id_data) && isNaN(id) ? index : id],
				//
				p = _this.title_of_search_result;
				if (p) {
					title = typeof p === 'function' ? p(title)
							: title ? title[p] : title;
				}
				// 找看看是否有完全相同的title。
				if (title !== work_title) {
					return true;
				}
				id_list = id;
			})) {
				// failed
				library_namespace.err('未找到與[' + work_title + ']相符者。');
				callback && callback();
				return;
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

		}, null, null, this.get_URL_options);
	}

	function get_label(html) {
		return library_namespace.HTML_to_Unicode(html.replace(/<[^<>]+>/g, ''))
				.trim();
	}

	function exact_work_data(work_data, html, PATTERN_work_data) {
		var matched;
		// [ all, key, value ]
		while (matched = PATTERN_work_data.exec(html)) {
			matched[1] = get_label(matched[1]).replace(/[:：\s]+$/, '');
			work_data[matched[1]] = get_label(matched[2]);
		}
	}

	function get_work_data(work_id, callback, error_count) {
		var _this = this, work_URL = typeof this.work_URL === 'function' ? this
				.work_URL(work_id) : this.work_URL
				+ encodeURIComponent(work_id);
		get_URL(work_URL, function(XMLHttp) {
			// console.log(XMLHttp);
			var html = XMLHttp.responseText;
			if (!html) {
				library_namespace.err('Failed to get work data of ' + work_id);
				if (error_count > 4) {
					throw _this.MESSAGE_RE_DOWNLOAD;
				}
				error_count = (error_count | 0) + 1;
				library_namespace.log('Retry ' + error_count + '...');
				_this.get_work_data(work_id, callback, error_count);
				return;
			}

			var work_data = _this.parse_work_data(html, get_label,
					exact_work_data);
			// 基本檢測。
			// .title: 必要屬性：須配合網站平台更改。
			if (PATTERN_non_CJK.test(work_data.title)
					&& PATTERN_non_CJK.test(work_id)) {
				library_namespace.err('Did not set work title: ' + work_id);
			}

			// 自動添加之作業用屬性：
			work_data.id = work_id;
			work_data.last_download = {
				date : (new Date).toISOString(),
				chapter : 1
			};

			process.title = '下載' + work_data.title;
			work_data.directory_name = library_namespace
					.to_file_name(work_data.id + ' ' + work_data.title);
			work_data.directory = _this.main_directory
					+ work_data.directory_name + '/';
			work_data.data_file = work_data.directory
					+ work_data.directory_name + '.json';

			var matched = _this.main_directory + 'cache/';
			library_namespace.fs_mkdir(matched);
			library_namespace.fs_write(matched + work_data.directory_name
					+ '.htm', html);

			// .status 選擇性屬性：須配合網站平台更改。
			if (_this.is_finished(work_data)) {
				library_namespace.fs_write(work_data.directory
				//
				+ 'finished.txt', work_data.status);
			}

			matched = library_namespace.get_JSON(work_data.data_file);
			if (matched) {
				// 基本上以新資料為準，除非無法取得新資料，才改用舊資料。
				for ( var key in matched) {
					if (!work_data[key]) {
						work_data[key] = matched[key];
					} else if (typeof work_data[key] !== 'object'
							&& work_data[key] !== matched[key]) {
						library_namespace.log(key + ': ' + matched[key]
						// 對比兩者。
						+ '\n→ ' + work_data[key]);
					}
				}
				matched = matched.last_download.chapter;
				if (matched > 1 && !_this.recheck) {
					// 起始下載的start_chapter章节
					work_data.last_download.chapter = matched;
				}
			}

			// reset chapter_count. 此處 chapter (章節)
			// 指的為平台所給的id編號，並非"回"、"話"！且可能會跳號！
			work_data.chapter_count = 0;
			_this.get_chapter_count(work_data, html);
			if (work_data.chapter_count >= 1) {
				var message = [ work_data.id, ' ', work_data.title,
				//
				': ', typeof _this.pre_chapter_URL === 'function'
				//
				? 'Unknown' : work_data.chapter_count, ' chapters.',
				//
				work_data.status ? ' ' + work_data.status : '',
				//
				work_data.last_download.chapter > 1 ? ' 自章節編號第 '
				//
				+ work_data.last_download.chapter + ' 接續下載。' : '' ].join('');
				if (_this.is_finished(work_data)) {
					// 針對特殊狀況提醒。
					library_namespace.info(message);
				} else {
					library_namespace.log(message);
				}
				library_namespace.fs_mkdir(work_data.directory);
				library_namespace.fs_write(work_data.data_file, work_data);
				_this.get_URL_options.headers.Referer = work_URL;
				// 開始下載chapter。
				_this.pre_get_chapter_data(work_data,
						work_data.last_download.chapter, callback);
				return;
			}
			library_namespace.err((work_data.title || work_id)
					+ ': Can not get chapter count!');
			callback && callback();
		}, null, null, this.get_URL_options);
	}

	// ----------------------------------------------------------------------------

	function pre_get_chapter_data(work_data, chapter, callback) {
		var _this = this;
		function next() {
			_this.get_chapter_data(work_data, chapter, callback);
		}
		if (typeof this.pre_chapter_URL === 'function') {
			// 在this.chapter_URL()之前執行this.pre_chapter_URL()，主要用途在取得chapter_URL之資料。
			this.pre_chapter_URL(work_data, chapter, next);
		} else {
			next();
		}
	}

	function get_chapter_data(work_data, chapter, callback) {
		var _this = this, left, image_list, waiting, chapter_label,
		//
		chapter_URL = this.chapter_URL(work_data, chapter);
		library_namespace.debug(work_data.id + ' ' + work_data.title + ' #'
				+ chapter + '/' + work_data.chapter_count + ': ' + chapter_URL);
		process.title = chapter + ' @ ' + work_data.title;

		function get_data() {
			process.stdout.write('Get data of chapter ' + chapter + '...\r');
			get_URL(chapter_URL, function(XMLHttp) {
				var html = XMLHttp.responseText;
				if (!html) {
					library_namespace.err('Failed to get chapter data of '
							+ work_data.directory + chapter);
					if (get_data.error_count > _this.MAX_ERROR) {
						throw _this.MESSAGE_RE_DOWNLOAD;
					}
					get_data.error_count = (get_data.error_count | 0) + 1;
					library_namespace.log('Retry ' + get_data.error_count
							+ '...');
					get_data();
					return;
				}

				var chapter_data = _this.parse_chapter_data(html, work_data,
						get_label);
				// console.log(JSON.stringify(chapter_data));
				if (!chapter_data || !(image_list = chapter_data.image_list)
				//
				|| !((left = chapter_data.image_count) >= 1)
				//
				&& !((left = image_list.length) >= 1)) {
					library_namespace.debug(work_data.directory_name + ' #'
							+ chapter + '/' + work_data.chapter_count
							+ ': No image get.');
					// 模擬已經下載完最後一張圖。
					left = 1;
					check_if_done();
					return;
				}
				// console.log(chapter_data);
				if (left !== image_list.length) {
					library_namespace.err('所登記的圖形數量' + left + '與有資料的圖形數量'
							+ image_list.length + '不同!');
					if (left > image_list.length) {
						left = image_list.length;
					}
				}

				chapter_label = chapter_data.title;
				chapter_label = chapter.pad(4) + (chapter_label ? ' '
				//
				+ library_namespace.to_file_name(
				//
				library_namespace.HTML_to_Unicode(chapter_label)) : '');
				var chapter_directory = work_data.directory + chapter_label
						+ '/';
				library_namespace.fs_mkdir(chapter_directory);
				library_namespace.fs_write(chapter_directory
						+ work_data.directory_name + '-' + chapter_label
						+ '.htm', html);
				var message = [ chapter,
				//
				typeof _this.pre_chapter_URL === 'function' ? ''
				//
				: '/' + work_data.chapter_count,
				//
				' [', chapter_label, '] ', left, ' images.',
				// 例如需要收費的章節。
				chapter_data.limited ? ' (limited)' : '' ].join('');
				if (chapter_data.limited) {
					// 針對特殊狀況提醒。
					library_namespace.info(message);
				} else {
					library_namespace.log(message);
				}

				// console.log(image_list);
				// TODO: 當某 chapter 檔案過多，將一次 request 過多 connects 而造成問題。
				image_list.forEach(function(image_data, index) {
					// http://stackoverflow.com/questions/245840/rename-files-in-sub-directories
					// for /r %x in (*.jfif) do ren "%x" *.jpg

					// file_path
					image_data.file = chapter_directory + work_data.id + '-'
							+ chapter + '-' + (index + 1).pad(3) + '.jpg';
					// default: 同時下載本章節中所有圖像。
					// .one_by_one: 循序逐個一個個下載。 download one by one
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
				var next_1 = function(first) {
					if (!first) {
						++image_list.index;
						check_if_done();
					}
					process.stdout.write(image_list.index + '/'
							+ image_list.length + '...\r');
					if (image_list.index < image_list.length) {
						_this.get_images(image_list[image_list.index], next_1);
					}
				};
				next_1(true);
			}, null, null, _this.get_URL_options);
		}
		get_data();

		function check_if_done() {
			--left;
			process.stdout.write(left + ' left...\r');
			library_namespace.debug(chapter_label + ': ' + left + ' left', 3,
					'check_if_done');
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

			// 已下載完本chapter
			work_data.last_download.chapter = chapter;
			// 紀錄已下載完之chapter
			library_namespace.fs_write(work_data.data_file, work_data);
			if (++chapter > work_data.chapter_count) {
				library_namespace.log(work_data.directory_name + ' done.');
				if (typeof callback === 'function') {
					callback(work_data);
				}
				return;
			}
			_this.pre_get_chapter_data(work_data, chapter, callback);
		}
	}

	function image_path_to_url(path, server) {
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
		if (node_fs.existsSync(image_data.file) || !this.skip_existed_bad_file
		// 檢查是否已具有server上本身就已經出錯的檔案。
		&& node_fs.existsSync(this.EOI_error_path(image_data.file))) {
			image_data.done = true;
			callback && callback();
			return;
		}

		var _this = this, url = image_data.url, server = this.server_list;
		if (server) {
			server = server[server.length * Math.random() | 0];
			url = this.image_path_to_url(url, server, image_data);
		} else if (url.startsWith('/')) {
			url = this.base_URL + url.slice(1);
		}

		if (!image_data.file_length) {
			image_data.file_length = [];
		}

		if (!PATTERN_non_CJK.test(url)) {
			library_namespace.warn('Need encodeURI: ' + url);
			// url = encodeURI(url);
		}
		get_URL(url, function(XMLHttp) {
			var contents = XMLHttp.responseText,
			//
			has_error = !contents || !(contents.length > _this.MIN_LENGTH)
					|| (XMLHttp.status / 100 | 0) !== 2, has_EOI;
			if (!has_error) {
				// check End Of Image of .jpeg
				// http://stackoverflow.com/questions/4585527/detect-eof-for-jpg-images
				has_EOI = contents[contents.length - 2] === 255
				// When you get to FFD9 you're at the end of the stream.
				&& contents[contents.length - 1] === 217;
			}
			// console.log(_this.skip_error + ',' + _this.MAX_ERROR);
			// console.log('error count: '  + image_data.error_count);
			if (!has_error || _this.skip_error
					&& image_data.error_count === _this.MAX_ERROR) {
				if (!has_error) {
					image_data.file_length
					//
					.push(contents ? contents.length : 0);
				}
				// console.log(image_data.file_length);
				if (has_EOI || _this.skip_error
				// skip error 的話，就算沒有取得過檔案，依然 pass。
				&& image_data.file_length.length === 0
				//
				|| image_data.file_length.cardinal_1()
				// ↑ 若是每次都得到相同的檔案長度，那就當作來源檔案本來就有問題。
				&& (_this.skip_error || _this.allow_EOI_error
				//
				&& image_data.file_length.length > _this.MAX_EOI_ERROR)) {
					// 過了。
					if (has_error || has_EOI === false) {
						image_data.file = _this.EOI_error_path(image_data.file,
								XMLHttp);
						library_namespace.warn(
						//
						(has_error ? 'Force saving bad image'
						//
						+ (XMLHttp.status ? ' (' + XMLHttp.status + ')' : '')
						//
						+ ': ' : 'Do not has EOI: ')
						//
						+ image_data.file + '\n← ' + url);
						if (!contents
						// 404之類，就算有內容，也不過是錯誤訊息頁面。
						|| (XMLHttp.status / 100 | 0) === 4) {
							contents = '';
						}
					}

					var need_write;
					try {
						need_write = contents.length
						// 得到更大的檔案，寫入更大的檔案。
						> node_fs.statSync(image_data.file).size;
					} catch (e) {
						// bad file not exist
						need_write = true;
					}
					if (need_write) {
						library_namespace.fs_write(image_data.file, contents);
					}
					image_data.done = true;
					callback && callback();
					return;
				}
			}

			// 有錯誤。
			library_namespace.err((has_EOI === false ? 'Do not has EOI: '
			//
			: (XMLHttp.status ? XMLHttp.status + ' ' : '')
			//
			+ '(' + (contents ? contents.length : 0) + ' B): Failed to get ')
					+ url + '\n→ ' + image_data.file);
			library_namespace.err('Failed to get ' + url + '\n→ '
					+ image_data.file);
			if (image_data.error_count === _this.MAX_ERROR) {
				// throw new Error(_this.MESSAGE_RE_DOWNLOAD);
				library_namespace.log(_this.MESSAGE_RE_DOWNLOAD);
				// console.log('error count: '  + image_data.error_count);
				process.exit(1);
			}

			image_data.error_count = (image_data.error_count | 0) + 1;
			library_namespace.log('Retry ' + image_data.error_count + '...');
			_this.get_images(image_data, callback);

		}, 'binary', null, this.get_URL_options);
	}

	// --------------------------------------------------------------------------------------------

	// export 導出.

	return (_// JSDT:_module_
	);
}
