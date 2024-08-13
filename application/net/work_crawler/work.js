/**
 * @name WWW work crawler sub-functions
 * 
 * @fileoverview WWW work crawler functions: part of work
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
		name : 'application.net.work_crawler.work',

		require : 'application.net.work_crawler.'
		// library_namespace.extract_literals()
		+ '|data.code.' + '|data.Number_range_set.',

		// 設定不匯出的子函式。
		no_extend : 'this,*',

		// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
		code : module_code
	});
}

function module_code(library_namespace) {

	// requiring
	var Work_crawler = library_namespace.net.work_crawler, crawler_namespace = Work_crawler.crawler_namespace;

	var gettext = library_namespace.locale.gettext,
	/** node.js file system module */
	node_fs = library_namespace.platform.nodejs && require('fs');

	// --------------------------------------------------------------------------------------------

	// latest_chapter
	var work_data_display_fields
	// gettext_config:{"id":"work_data.title","mark_type":"combination_message_id"}
	// gettext_config:{"id":"work_data.id","mark_type":"combination_message_id"}
	// gettext_config:{"id":"work_data.author","mark_type":"combination_message_id"}
	// gettext_config:{"id":"work_data.status","mark_type":"combination_message_id"}
	// gettext_config:{"id":"work_data.chapter_count","mark_type":"combination_message_id"}
	// gettext_config:{"id":"work_data.last_update","mark_type":"combination_message_id"}
	// gettext_config:{"id":"work_data.last_download.date","mark_type":"combination_message_id"}
	// gettext_config:{"id":"work_data.last_download.chapter","mark_type":"combination_message_id"}
	// gettext_config:{"id":"work_data.url","mark_type":"combination_message_id"}
	// gettext_config:{"id":"work_data.directory","mark_type":"combination_message_id"}
	// gettext_config:{"id":"work_data.description","mark_type":"combination_message_id"}
	// gettext_config:{"id":"work_data.chapter_list","mark_type":"combination_message_id"}
	// gettext_config:{"id":"work_status-not-found","mark_type":"combination_message_id"}
	// gettext_config:{"id":"work_status-limited","mark_type":"combination_message_id"}
	// gettext_config:{"id":"work_status-finished","mark_type":"combination_message_id"}
	= 'title,id,author,status,chapter_count,last_update,last_download.date,last_download.chapter,tags,url,directory'
			.split(',');
	show_work_data.prefix = 'work_data.';

	// 在 CLI 命令列介面顯示作品資訊。
	function show_work_data(work_data, options) {
		// console.log(work_data);
		var display_fields = options && options.display_fields
				|| work_data_display_fields;
		var display_list = [];
		display_fields.forEach(function(field_name) {
			var value = library_namespace
			//
			.value_of(field_name, null, work_data);
			if (value || value === 0)
				display_list.push([
						gettext(show_work_data.prefix + field_name) + '  ',
						value ]);
		});

		library_namespace.log('-'.repeat(70) + '\n');
		library_namespace.info({
			// gettext_config:{"id":"work-information"}
			T : 'Work information:'
		});

		library_namespace.log(library_namespace.display_align(display_list, {
			from_start : true
		}) + '\n');

		library_namespace.info({
			T : show_work_data.prefix + 'description'
		});
		// 概要 synopsis
		library_namespace.log(library_namespace.value_of('description', null,
				work_data)
				+ '\n');

		var chapter_list = Array.isArray(work_data.chapter_list)
				&& work_data.chapter_list;
		if (chapter_list) {
			library_namespace.info(gettext(show_work_data.prefix
					+ 'chapter_list'));
			// gettext_config:{"id":"work_data.chapter_no"}
			display_list = [ [ gettext('work_data.chapter_NO') + '  ',
			// gettext_config:{"id":"work_data.chapter_title"}
			gettext('work_data.chapter_title') ] ];
			// console.log(chapter_list[0]);
			chapter_list.forEach(function(chapter_data, index) {
				var data;
				if (library_namespace.is_Object(chapter_data)) {
					data = chapter_data.title || chapter_data.url;
					if (chapter_data.limited)
						data += ' (' + gettext('limited') + ')';
				} else {
					data = JSON.stringify(chapter_data);
				}
				// +1: chapter_NO starts from 1
				display_list.push([ '    ' + (index + 1) + '  ', data ]);
			});
			library_namespace.log(library_namespace.display_align(display_list)
					+ '\n');
		}

		library_namespace
				.info({
					// gettext_config:{"id":"you-may-set-start_chapter_no=chapter-number-or-start_chapter_title=chapter-title-to-decide-where-to-start-downloading"}
					T : '您可指定 "start_chapter_NO=章節編號數字" 或 "start_chapter_title=章節標題" 來選擇要開始下載的章節。'
				});
		library_namespace.info({
			// gettext_config:{"id":"or-set-chapter_filter=chapter-title-to-download-specific-chapter"}
			T : '或指定 "chapter_filter=章節標題" 僅下載某個章節。'
		});
	}

	// --------------------------------------------------------------------------------------------

	function set_work_status(work_data, status) {
		if (status) {
			if (!work_data.process_status)
				work_data.process_status = [];
			work_data.process_status.push(status);
		}
		return work_data.process_status;
	}

	// 儲存本次作業到現在的作品資訊到檔案。 cache / save work data file
	function save_work_data_file(work_data, save_event) {
		if (!work_data.data_file)
			return;

		// 預防(work_data.directory)不存在。
		library_namespace.create_directory(work_data.directory);

		var ebook = work_data[this.KEY_EBOOK];
		// 為了預防 TypeError: Converting circular structure to JSON
		// ebook 結構中可能會有 circular。
		delete work_data[this.KEY_EBOOK];

		if (this.on_save_work_data_file)
			this.on_save_work_data_file(work_data, save_event);

		// 避免當 work_data 過大而出現崩潰的情況，造成資料檔案被清空。因此先試試 JSON.stringify()。
		var data_to_write = Buffer.from(JSON.stringify(work_data));
		if (this.backup_work_data) {
			var backup_file = work_data.data_file + '.'
					+ this.backup_file_extension;
			library_namespace.remove_file(backup_file);
			library_namespace.move_fso(work_data.data_file, backup_file);
		}
		try {
			node_fs.writeFileSync(work_data.data_file, data_to_write);
		} catch (e) {
			library_namespace.error([ 'save_work_data_file: ', {
				// Cannot save work data of %1!
				// gettext_config:{"id":"cannot-save-work-data-of-«$1»"}
				T : [ '無法儲存作品《%1》之資訊至檔案！', work_data.title || work_data.id ]
			} ]);
			library_namespace.error(e);
		}

		// revert
		if (ebook)
			work_data[this.KEY_EBOOK] = ebook;
	}

	function extract_work_id(work_information) {
		// default: accept numerals only
		if (library_namespace.is_digits(work_information)
		// || /^[a-z_\-\d]+$/.test(work_information)
		)
			return work_information;
	}

	function extract_work_id_from_URL(work_information) {
		if (typeof work_information !== 'string'
				|| !/^https?:\/\//.test(work_information)) {
			// 非網址，直接跳出。
			return;
		}

		var PATTERN_work_id_of_url = this.PATTERN_work_id_of_url;
		if (!PATTERN_work_id_of_url) {
			// 自動依照. work_URL 創建作品的網址模式。
			PATTERN_work_id_of_url = this.full_URL(this.work_URL, 'work_id')
					.replace(/^.+?\/\//, '');
			if (PATTERN_work_id_of_url.endsWith('work_id/')) {
				// 允許不用"/"結尾。
				PATTERN_work_id_of_url = PATTERN_work_id_of_url.slice(0, -1);
			}
			PATTERN_work_id_of_url = this.PATTERN_work_id_of_url
			// assert:
			// 'work_id'===library_namespace.to_RegExp_pattern('work_id')
			= new RegExp(library_namespace.to_RegExp_pattern(
					PATTERN_work_id_of_url).replace('work_id', '([^\/]+)'));
			library_namespace.info([ 'extract_work_id_from_URL: ', {
				// gettext_config:{"id":"create-and-use-the-work-url-regexp-$1"}
				T : [ '創建並使用作品網址 RegExp：%1', String(PATTERN_work_id_of_url) ]
			} ]);
		}

		var matched = work_information.match(PATTERN_work_id_of_url);
		if (matched) {
			matched = matched[1];
			library_namespace.info([ 'extract_work_id_from_URL: ', {
				// gettext_config:{"id":"extract-work-id-from-the-work-url-$1"}
				T : [ '自作品網址提取出作品ID：%1', matched ]
			} ]);
			return /* this.extract_work_id(matched) && */matched;
		}

		library_namespace.warn([ 'extract_work_id_from_URL: ', {
			// gettext_config:{"id":"unable-to-extract-work-id-from-the-work-url!-work-information-$1"}
			T : [ '無法自作品網址提取出作品編號！作品資訊：%1', work_information ]
		} ]);
	}

	function get_work(work_title, callback) {
		this.running = true;
		var _this = this;

		if (this.must_browse_first && !this.had_browsed
		// && this.reget_chapter
		) {
			// e.g., novel.cmn-Hans-CN/biqugse.js 用以設定 cookie。
			this.get_URL(this.base_URL, function(XMLHttp, error) {
				this.had_browsed = Date.now();
				if (typeof this.must_browse_first === 'number'
						&& this.must_browse_first >= 0) {
					setTimeout(get_work.bind(_this, work_title, callback),
							this.must_browse_first);
				} else {
					get_work.call(_this, work_title, callback);
				}
			});
			return;
		}

		// 執行順序: finish() → finish_up()
		// 若在this.finish_up()中處理work_data，則必須執行`this.save_work_data(work_data)`才能保存變更過的work_data。
		function finish_up(work_data) {
			if (work_data && work_data.title) {
				// 最後紀錄。
				_this.save_work_data(work_data, 'finish_up');
				if (_this.need_create_ebook
				// 未找到時沒有 work_data。
				&& work_data.chapter_count >= 1) {
					_this.pack_ebook(work_data);
				}
				if (false && _this.need_create_ebook && !_this.preserve_cache) {
					// 注意: 若是刪除 ebook 目錄，也會把 media 資源檔刪掉。
					// 因此只能刪除造出來的 HTML 網頁檔案。
					library_namespace.fs_remove(
					// @see CeL.application.storage.EPUB
					work_data[this.KEY_EBOOK].path.root, true);
				}

			} else if (work_data && work_data.titles) {
				crawler_namespace.set_work_status(work_data,
				// @see `approximate_title`
				// gettext_config:{"id":"found-$1-works-$2"}
				gettext('找到%1個作品：%2', work_data.titles.length, work_data.titles
						.map(function(item) {
							return item[0] + ':' + item[1];
						}).join('; ')));
			} else {
				var status = work_data;
				work_data = Object.create(null);
				crawler_namespace.set_work_status(work_data, status
						&& typeof status === 'string' ? status : 'not found');
			}

			if (typeof _this.finish_up === 'function') {
				try {
					_this.finish_up(work_data);
				} catch (e) {
					// TODO: handle exception
				}
				// _this.save_work_data(work_data);
			}
			// console.log('' + callback);
			typeof callback === 'function' && callback.call(_this, work_data);
			_this.running = false;
		}
		if (callback && callback.options) {
			// e.g., for .get_data_only
			finish_up.options = callback.options;
		}

		// --------------------------------------

		var work_id = work_title.match(/^(title|id):(.+)$/);
		if (work_id) {
			// 明確指定為作品ID或作品標題。
			if (work_id[1] === 'id') {
				// work_title = '';
				work_id = work_id[2];
			} else {
				work_title = work_id[2];
				work_id = null;
			}

		} else {
			// 未明確指定輸入的類別。先試試看能否判斷出 work id。
			work_id = this.extract_work_id(work_title);

			if (!work_id
					&& (work_id = this.extract_work_id_from_URL(work_title))) {
				work_id = {
					input_url : work_title,
					id : work_id
				};
			}
		}

		if (work_id) {
			if (work_id === true) {
				library_namespace.warn([ 'get_work: ', {
					// gettext_config:{"id":"crawler.extract_work_id()-should-not-return-true!-please-modify-the-program-code"}
					T : 'crawler.extract_work_id() 不應回傳 true！請修改工具檔程式碼！'
				} ]);
			}
			this.get_work_data(work_id, finish_up);
			return;
		}

		// --------------------------------------

		var original_work_title;
		function finish(no_cache) {
			if (!no_cache) {
				// write cache
				library_namespace.write_file(search_result_file, search_result);
			}
			search_result = search_result[work_title];
			var search_result_id = _this.id_of_search_result;
			if (search_result_id) {
				// console.log([ search_result_id, search_result ]);
				search_result = typeof search_result_id === 'function' ? _this
						.id_of_search_result(search_result)
						: search_result ? search_result[search_result_id]
								: search_result;
			}
			_this.get_work_data({
				id : search_result,
				title : work_title,
				original_work_title : original_work_title
			}, finish_up);
		}

		/** {String}記錄先前搜尋作品所獲得結果的快取檔案。 */
		var search_result_file = this.get_search_result_file(),
		// search cache
		// 檢查看看之前是否有獲取過。
		search_result = this.get_search_result() || Object.create(null);
		library_namespace.debug({
			// gettext_config:{"id":"cache-file-of-previous-search-for-works-$1"}
			T : [ 'Cache file of previous search for works: %1',
					search_result_file ]
		}, 2, 'get_work');
		// console.log(search_result);

		// assert: work_title前後不應包含space
		work_title = work_title.trim();
		// 重新搜尋 re-search, to search again, search once more, repeat a search
		if (this.search_again) {
			library_namespace.log([ this.id + ': ', {
				// gettext_config:{"id":"re-searching-title-$1"}
				T : [ '重新搜尋作品《%1》', work_title ]
			} ]);
		} else if (search_result[work_title]) {
			// 已經搜尋過此作品標題。
			library_namespace.log([ this.id + ': ', {
				// gettext_config:{"id":"cached-work-id-will-no-longer-search-again-$1"}
				T : [ '已快取作品 id，不再重新搜尋：%1',
				//
				work_title + '→' + JSON.stringify(search_result[work_title]) ]
			} ]);
			finish(true);
			return;
		}

		var search_url_data = this.search_URL, search_URL_string, post_data, get_URL_options;
		return handle_search_url_data();

		function handle_search_url_data() {
			if (!search_url_data
					|| typeof _this.parse_search_result !== 'function') {
				if (callback && callback.options) {
					// e.g., for .get_data_only
					// gettext_config:{"id":"the-search-function-is-not-available-for-$1-web-site"}
					finish_up(gettext('本網路作品網站 %1 的模組未提供搜尋功能。', _this.id));
					return;
				}

				search_url_data = Object.create(null);
				search_url_data[work_title] = '';
				// gettext_config:{"id":"the-search-function-is-not-available-for-$1-web-site"}
				_this.onerror(gettext('本網路作品網站 %1 的模組未提供搜尋功能。', _this.id)
				// gettext_config:{"id":"please-enter-the-work-id-first.-after-downloading-once-the-tool-will-automatically-record-the-title-and-id-conversion"}
				+ gettext('請先輸入作品 id，下載過一次後工具會自動記錄作品標題與 id 的轉換。')
				// gettext_config:{"id":"can-also-be-set-manually-by-editing-the-id-of-«$1»-to-$2"}
				+ gettext('亦可手動設定，編輯《%1》之 id 於 %2', work_title,
				//
				search_result_file) + '\n (e.g., '
						+ JSON.stringify(search_url_data) + ')', work_title);
				finish(true);
				return Work_crawler.THROWED;
			}

			if (typeof search_url_data === 'function') {
				// 通過關鍵詞搜索作品。 解析 作品名稱 → 作品id
				// search_url_data = search_url_data.call(_this, work_title,
				// crawler_namespace.get_label);
				// return [ search_url_data, POST data ]
				search_url_data = search_url_data.call(_this, work_title,
						crawler_namespace.get_label);
				if (library_namespace.is_thenable(search_url_data)) {
					search_url_data.then(function(_search_url_data) {
						search_url_data = _search_url_data;
						handle_search_url_data();
					}, function(error) {
						finish_up(error || true);
					});
					return;
				}

				if (Array.isArray(search_url_data)) {
					// use POST method, also see _this.get_URL()
					// [ url, post_data, options ]
					post_data = search_url_data[1];
					get_URL_options = search_url_data[2];
					search_url_data = search_url_data[0];
				}
				search_url_data = _this.full_URL(search_url_data);
				search_URL_string = search_url_data.URL || search_url_data;

			} else {
				if (Array.isArray(search_url_data)) {
					// use POST method, also see _this.get_URL()
					// [ url, post_data, options ]
					post_data = search_url_data[1];
					get_URL_options = search_url_data[2];
					search_url_data = search_url_data[0];
				}

				// default:
				// assert: typeof search_url_data==='string'
				// || search_url_data==={URL:'',charset:''}
				// TODO: .replace(/%t/g, work_title)
				search_url_data = _this.full_URL(search_url_data);
				search_URL_string = crawler_namespace.encode_URI_component(
				// e.g., 找不到"隔离带 2"，須找"隔离带"。
				work_title.replace(/\s+\d{1,2}$/, '')
				// e.g., "Knight's & Magic" @ 小説を読もう！ || 小説検索
				.replace(/&/g, ''), search_url_data.charset || _this.charset);
				// console.trace(search_URL_string);
				// 對 {Object}search_url_data，不可動到 search_url_data。
				search_URL_string = (search_url_data.URL || search_url_data)
						+ search_URL_string;
			}

			// console.log(search_url_data);
			var regenerate_user_agent = _this.regenerate_user_agent === true
					|| _this.regenerate_user_agent === 'work';
			_this.setup_agent(search_URL_string, regenerate_user_agent);
			if (regenerate_user_agent) {
				crawler_namespace.regenerate_user_agent(_this);
			}

			// delay time
			var time_to_waiting = _this.search_work_interval;
			if (time_to_waiting) {
				time_to_waiting
				//
				= library_namespace.to_millisecond(time_to_waiting)
						- (Date.now() - _this.latest_search_time);
				if (false) {
					console
							.trace([ _this.search_work_interval,
									time_to_waiting ]);
				}
			}

			if (time_to_waiting > 0) {
				library_namespace.log_temporary({
					// gettext_config:{"id":"waiting-$1"}
					T : [ 'Waiting %1...',
							library_namespace.age_of(0, time_to_waiting, {
								digits : 1
							}) ]
				});
				setTimeout(get_search_result, time_to_waiting);
			} else {
				get_search_result();
			}
		}

		function get_search_result() {
			// console.trace([ search_URL_string, search_url_data, post_data ]);
			_this.get_URL(search_URL_string, handle_search_response,
			//
			post_data, Object.assign({
				error_retry : _this.MAX_ERROR_RETRY
			}, get_URL_options), search_url_data.charset
			// e.g., @ xsw.tw.js
			|| get_URL_options && get_URL_options.charset || _this.charset);
		}

		function handle_search_response(XMLHttp, error) {
			if (_this.search_work_interval)
				_this.latest_search_time = Date.now();

			_this.setup_agent();
			if (!XMLHttp.responseText) {
				library_namespace.error([ 'get_work: ', {
					// gettext_config:{"id":"no-results-for-«$1»-(the-site-is-temporarily-unavailable-or-redesigned?)"}
					T : [ '沒有《%1》的搜索結果（網站暫時不可用或改版？）', work_title ]
				} ]);
				// gettext_config:{"id":"no-search-results.-is-the-site-temporarily-unavailable-or-redesigned"}
				finish_up('沒有搜索結果。網站暫時不可用或改版？');
				return;
			}
			// _this.parse_search_result() returns 關鍵字搜尋結果:
			// [ {Array}id_list, 與id_list相對應之{Array}或{Object} ]
			// e.g., [ [id,id,...], [title,title,...] ]
			// e.g., [ [id,id,...], [data,data,...] ]
			// e.g., [ [id,id,...], {id:data,id:data,...} ]
			var id_data;
			try {
				// console.log(XMLHttp.responseText);
				// console.log(XMLHttp.buffer.toString(_this.charset));
				id_data = _this.parse_search_result(XMLHttp.responseText,
						crawler_namespace.get_label, work_title);
				if (id_data === undefined) {
					_this.onerror('get_work.parse_search_result: '
					// gettext_config:{"id":"the-work-url-resolution-function-parse_search_result-has-not-returned-the-result"}
					+ gettext('作品網址解析函數 parse_search_result 未回傳結果！'),
							work_title);
					// gettext_config:{"id":"the-work-url-resolution-function-parse_search_result-has-not-returned-the-result"}
					finish_up(gettext('作品網址解析函數 parse_search_result 未回傳結果！'));
					return Work_crawler.THROWED;
				}
				if (!id_data) {
					_this.onerror('get_work.parse_search_result: '
					// gettext_config:{"id":"the-work-url-resolution-function-parse_search_result-did-not-return-the-regular-result"}
					+ gettext('作品網址解析函數 parse_search_result 未回傳正規結果！'),
							work_title);
					finish_up(gettext(
					//		
					// gettext_config:{"id":"the-work-url-resolution-function-parse_search_result-did-not-return-the-regular-result"}
					'作品網址解析函數 parse_search_result 未回傳正規結果！'));
					return Work_crawler.THROWED;
				}
			} catch (e) {
				if (e)
					console.trace(e);
				library_namespace.error([ 'get_work.parse_search_result: ', {
					// gettext_config:{"id":"unable-to-parse-the-result-of-searching-for-«$1»"}
					T : [ '無法解析搜尋作品《%1》之結果！', work_title ]
				} ]);
				// gettext_config:{"id":"unable-to-parse-the-results-of-the-search-for-works"}
				finish_up('無法解析搜尋作品之結果！');
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
				library_namespace.warn({
					// gettext_config:{"id":"searching-«$1»-and-found-$2-work(s)-$3"}
					T : [ '搜尋《%1》找到 %2個{{PLURAL:%2|作品}}：%3', work_title,
							id_list.length, JSON.stringify(id_data) ]
				});
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

				var search_result_id = _this.title_of_search_result;
				if (search_result_id) {
					title = typeof search_result_id === 'function' ? _this
							.title_of_search_result(title)
							: title ? title[search_result_id] : title;
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
					var message = [ approximate_title.length === 0
					// failed: not only one
					// gettext_config:{"id":"no-matches-were-found-for-«$1»"}
					? '未搜尋到與《%1》相符者。'
					// gettext_config:{"id":"found-$2-matches-with-«$1»"}
					: '找到%2個與《%1》相符者。', work_title, approximate_title.length ];
					library_namespace.error([ _this.id + ': ', {
						T : message
					}, approximate_title.length === 0
					// is_latin
					&& /^[\x20-\x7e]+$/.test(work_title) ? {
						T :
						// gettext_config:{"id":"if-you-entered-the-work-id-please-infrom-the-tool-by-setting-extract_work_id()-to-avoid-misidentifying-of-work-id-as-work-title"}
						'若您輸入的是 work id，請回報議題讓下載工具設定 extract_work_id()，以免將 work id 誤判為 work title。'
					} : '' ]);
					message = gettext.apply(null, message);
					_this.onwarning(message, work_title);
					finish_up(approximate_title.length > 0 && {
						titles : approximate_title
					});
					return;
				}
				approximate_title = approximate_title[0];
				library_namespace.warn(library_namespace.display_align([
				// gettext_config:{"id":"using-title"}
				[ gettext('Using title:'), work_title ],
						[ '→', approximate_title[1] ] ]));
				original_work_title = work_title;
				work_title = approximate_title[1];
				id_list = approximate_title[0];
			}

			// 已確認僅找到唯一id。
			id_data = id_data[id_list];
			search_result[work_title] = typeof id_data === 'object'
			// {Array}或{Object}
			? id_data : id_list;
			if (original_work_title) {
				// 一同紀錄進 cache，避免每次執行重複查詢。
				search_result[original_work_title] = search_result[work_title];
			}
			if (typeof _this.post_get_work_id === 'function') {
				// post_get_work_id :
				// function(callback, work_title, search_result) {}
				_this.post_get_work_id(finish, work_title, search_result);
			} else {
				finish();
			}

		}

	}

	function extract_work_data(work_data, html, PATTERN_work_data, overwrite) {
		if (!PATTERN_work_data) {
			PATTERN_work_data =
			// 由 meta data 解析出作品資訊。 e.g.,
			// <meta property="og:title" content="《作品》" />
			// <meta property="og:novel:author" content="作者" />
			// <meta name="Keywords" content="~" />
			// <meta property="og:site_name" name="application-name"
			// content="卡提諾論壇"/>

			// qiman5.js: <meta itemprop="actor" property="og:author"
			// content="阅文漫画" />

			// matched: [ all tag, key, value ]
			/<meta\s+[^<>]*?(?:property|name)=["'](?:[^<>"']+:)?([^<>"':]+)["']\s[^<>]*?content=["']([^<>"']+)/g;
			html = html.between(null, '</head>') || html;
		}

		var matched;
		// matched: [ all, key, value ]
		while (matched = PATTERN_work_data.exec(html)) {
			// delete matched.input;
			// console.log(matched);

			var key = crawler_namespace.get_label(matched[1]).replace(
					/[:：︰\s]+$/, '').trim().replace(/[\t\n]/g, ' ').replace(
					/ {3,}/g, '  ');
			// default: do not overwrite
			if (!key || !overwrite && work_data[key])
				continue;

			var value = matched[2], link = value.match(
			// 從連結的 title 獲取更完整的資訊。
			/^[:：︰\s]*<a [^<>]*?title=["']([^<>"']+)["'][^<>]*>([\s\S]*?)<\/a>\s*$/
			//
			);
			if (link) {
				link[1] = crawler_namespace.get_label(link[1]);
				link[2] = crawler_namespace.get_label(link[2]);
				if (link[1].length > link[2].length) {
					value = link[1];
				}
			}
			value = crawler_namespace.get_label(value).replace(/^[:：︰\s]+/, '')
					.trim();
			if (value) {
				work_data[key] = value.replace(/[\t\n]/g, ' ').replace(
						/ {3,}/g, '  ');
			}
		}
	}

	// --------------------------------------------------------------------------------------------

	// 去掉每次可能有變化、應該即時更新的屬性。
	var ignore_old_chapter_data = new Set([ 'limited', 'skip_this_chapter',
	// 'image_length', 'image_count',
	// 'images_downloaded',
	// 'part_NO', 'NO_in_part', 'chapter_NO',
	'chapter_title', 'part_title', 'image_list' ]);

	/**
	 * 增添別名至作品別名列表。
	 * 
	 * @param {Object}work_data
	 *            作品資訊。
	 * @param {String}original_work_title
	 *            要添加的作品別名。
	 * 
	 * @inner
	 */
	function add_work_aliases(work_data, original_work_title) {
		if (!original_work_title || original_work_title === work_data.title)
			return;
		if (!work_data.original_work_title) {
			work_data.original_work_title = original_work_title;
		}
		if (!Array.isArray(work_data.work_aliases))
			work_data.work_aliases = [];
		work_data.work_aliases.push(original_work_title);
	}

	function get_work_data(work_id, callback, error_count) {
		var work_title, input_url, original_work_title;
		// 預防並列執行的時候出現交叉干擾。
		this.running = true;
		if (library_namespace.is_Object(work_id)) {
			input_url = work_id.input_url;
			work_title = work_id.title;
			original_work_title = work_id.original_work_title;
			work_id = work_id.id;
		}
		// console.trace([ work_id, work_title, original_work_title ]);
		// gettext_config:{"id":"download-$1-info-@-$2"}
		process.title = gettext('下載%1 - 資訊 @ %2', work_title || work_id,
				this.id);

		var _this = this,
		// this.work_URL 中不應對 work_id 採取額外處理，例如 `work_id | 0`，
		// 否則會造成 extract_work_id_from_URL 出錯。
		/** {String}作品資訊頁面之URL */
		work_URL = this.full_URL(this.work_URL, work_id), work_data;
		library_namespace.debug('work_URL: ' + work_URL, 2, 'get_work_data');
		// console.log(work_URL);

		if (this.chapter_NO_range) {
			// Reset start_chapter_NO to test all chapters
			this.start_chapter_NO = 1;
			if (!library_namespace.Number_range_set
					.is_Number_range_set(this.chapter_NO_range)) {
				this.chapter_NO_range = new library_namespace.Number_range_set(
				//
				this.chapter_NO_range, {
					max_split_size : 1e4
				});
			}
		}

		if (this.start_chapter) {
			if (library_namespace.is_digits(this.start_chapter)
			// 為正整數章節才作設定。預設第1章節。
			&& this.start_chapter >= 1
					&& this.start_chapter == (this.start_chapter | 0)) {
				// {Natural}chapter_NO
				this.start_chapter_NO = this.start_chapter | 0;
			} else {
				// 將 this.start_chapter 當作指定開始下載的章節標題。
				this.start_chapter_title = this.start_chapter.toString()
						.toLowerCase();
			}
			delete this.start_chapter;
		}

		// ----------------------------------------------------------

		var work_cache_directory = _this.main_directory
				+ _this.cache_directory_name;
		// work_data.directory_name 會在
		// function process_work_data() 設定。
		// 從 get_work_page() 呼叫時 work_data === undefined。
		function get_work_directory_name(work_data) {
			var work_directory_name = work_data ? work_data.directory_name
					: work_id + (work_title ? ' ' + work_title : '');
			return work_directory_name;
		}
		function get_work_page_path(work_data) {
			// TODO: using work_data.directory
			var work_directory_name = get_work_directory_name(work_data);
			var work_page_path = work_cache_directory + work_directory_name
					+ '.'
					// .data.htm
					+ Work_crawler.HTML_extension;
			// console.trace(work_page_path);
			return work_page_path;
		}
		function get_chapter_list_path(work_data) {
			var index_text = work_data.next_chapter_list_URL
			// assert: work_data.next_chapter_list_URL &&
			// work_data.next_chapter_list_NO >= 2
			? '-' + work_data.next_chapter_list_NO : '';

			var work_directory_name = get_work_directory_name(work_data);
			var chapter_list_path = work_cache_directory + work_directory_name
			// .TOC.htm
			+ '.list' + index_text + '.' + Work_crawler.HTML_extension;
			return chapter_list_path;
		}

		// ----------------------------------------------------------

		function get_work_page() {
			if (_this.skip_get_work_page) {
				process_work_data(crawler_namespace.null_XMLHttp);
				return;
			}

			function do_get_work_URL() {
				// console.trace(_this.work_URL_charset);
				_this.get_URL(work_URL, process_work_data, null, null,
						_this.work_URL_charset);
			}

			// TODO: work_time_interval
			var chapter_time_interval = _this.get_chapter_time_interval(
					work_URL, work_data);

			if (chapter_time_interval > 0) {
				library_namespace.log_temporary([ 'get_work_page: ', {
					// gettext_config:{"id":"wait-for-$2-and-then-acquiring-the-work-information-page-$1"}
					T : [ '等待 %2 之後取得作品資訊頁面：%1', work_URL,
					//
					library_namespace.age_of(0, chapter_time_interval, {
						digits : 1
					}) ]
				} ]);
				setTimeout(do_get_work_URL, chapter_time_interval);
				return;
			}

			// this.reget_chapter 要在 function process_chapter_list_data(html)
			// 才設定好，這邊的是預設值。因此必須處理特殊情況，例如 _this.regenerate。
			if (_this.regenerate || !_this.reget_chapter) {
				// @see function get_data() @
				// CeL.application.net.work_crawler.chapter
				library_namespace.get_URL_cache(work_URL, function(data, error,
						XMLHttp) {
					// console.trace(XMLHttp, error);
					process_work_data(XMLHttp, error);
				}, {
					no_write_info : true,
					file_name : get_work_page_path(work_data),
					encoding : undefined,
					charset : _this.charset,
					get_URL_options : _this.get_URL_options,
					simulate_XMLHttpRequest_response : true
				});
				return;
			}

			do_get_work_URL();
		}

		get_work_page();

		// ----------------------------------------------------------

		function process_work_data(XMLHttp, error) {
			// console.log(XMLHttp);
			_this.set_chapter_time_interval(XMLHttp);

			var html = XMLHttp.responseText;
			if (!html && !_this.skip_get_work_page) {
				library_namespace.error({
					T : [
					// Failed to get work data of %1: %2
					// gettext_config:{"id":"unable-to-get-information-for-$1-s-$2"}
					'無法取得 %1 的作品資訊：%2', work_id,
							XMLHttp.buffer && XMLHttp.buffer.length === 0
							//
							// gettext_config:{"id":"no-content-found"}
							? gettext('取得空的內容') : String(error) ]
				});
				if (error_count === _this.MAX_ERROR_RETRY) {
					_this
					// gettext_config:{"id":"message_need_re_download"}
					.onerror(gettext('MESSAGE_NEED_RE_DOWNLOAD'), _this.id);
					typeof callback === 'function' && callback({
						title : work_title
					});
					return Work_crawler.THROWED;
				}
				error_count = (error_count | 0) + 1;
				library_namespace.log([ 'process_work_data: ', {
					// gettext_config:{"id":"retry-$1-$2"}
					T : [ 'Retry %1/%2', error_count, _this.MAX_ERROR_RETRY ]
				}, '...' ]);
				_this.get_work_data({
					// 书号
					id : work_id,
					title : work_title
				}, callback, error_count);
				return;
			}

			try {
				// 解析出作品資料/作品詳情。
				work_data = _this.parse_work_data(html,
				//
				crawler_namespace.get_label,
				// parse_work_data:function(html,get_label,extract_work_data,options){}
				extract_work_data, {
					id : work_id,
					title : work_title,
					url : work_URL
				});
				// console.log(work_data);
				if (work_data === _this.REGET_PAGE) {
					// 需要重新讀取頁面。e.g., 502
					var chapter_time_interval = _this
							.get_chapter_time_interval(work_URL, work_data);
					library_namespace.log_temporary([ 'process_work_data: ', {
						T : [ chapter_time_interval > 0
						// gettext_config:{"id":"wait-for-$2-and-re-acquiring-the-work-information-page-$1"}
						? '等待 %2 之後再重新取得作品資訊頁面：%1'
						// gettext_config:{"id":"re-acquiring-the-work-information-page-$1"}
						: '重新取得作品資訊頁面：%1', work_URL,
						//
						library_namespace.age_of(0, chapter_time_interval, {
							digits : 1
						}) ]
					} ]);
					if (chapter_time_interval > 0) {
						setTimeout(get_work_page, chapter_time_interval);
					} else {
						get_work_page();
					}
					return;
				}

			} catch (e) {
				// throw e;
				var warning = 'process_work_data: ' + (work_title || work_id)
						+ ': ' + e;
				_this.onwarning(warning);
				typeof callback === 'function' && callback({
					title : work_title
				});
				return;
			}

			// work_title: search key
			work_data.input_title = work_title;
			add_work_aliases(work_data, original_work_title);
			if (!work_data.title) {
				work_data.title = work_title;
			} else {
				// assert: {String}work_data.title
				work_data.title
				// '&amp;' → '&' for `node webtoon.js challenge_18878`
				// https://github.com/kanasimi/work_crawler/issues/409
				= library_namespace.HTML_to_Unicode(work_data.title);

				if (_this.cache_title_to_id && !work_title
				// default: `{title:id}`
				&& (!_this.id_of_search_result && !_this.title_of_search_result
				// 應對有些作品存在卻因為網站本身的問題而搜尋不到的情況，例如 buka。
				// 這時 this.parse_search_result() 函數本身必須能夠解析 `{title:id}`。
				|| typeof _this.parse_search_result !== 'function')) {
					// cache work title: 方便下次從 search cache 反查。

					// search cache
					var search_result_file = _this.get_search_result_file(),
					//
					search_result = _this.get_search_result()
							|| Object.create(null);
					if (!(work_data.title in search_result)) {
						search_result[work_data.title] = work_id;
						// 補上已知的轉換。這樣未來輸入作品標題的時候就能自動轉換。
						library_namespace.write_file(search_result_file,
								search_result);
					}
				}

				if (work_title !== work_data.title) {
					library_namespace.warn(library_namespace.display_align([
					// gettext_config:{"id":"using-title"}
					[ gettext('Using title:'), work_title ],
							[ '→', work_data.title ] ]));
					add_work_aliases(work_data, work_title);
				}
			}

			// 從已設定的網站名稱挑選一個可用的。
			if (work_data.site_name) {
				_this.site_name = work_data.site_name;
			} else if (_this.site_name) {
				work_data.site_name = _this.site_name;
			}
			// 基本檢測。 e.g., "NOT FOUND", undefined
			if (crawler_namespace.PATTERN_non_CJK.test(work_data.title)
			// e.g., "THE NEW GATE", "Knight's & Magic"
			&& !/[a-z]+ [a-z\d&]/i.test(work_data.title)
			// e.g., "Eje(c)t"
			&& !/[()]/.test(work_data.title)
			// e.g., "H-Mate"
			&& !/[a-z\-][A-Z]/.test(work_data.title)
			// .title: 必要屬性：須配合網站平台更改。
			&& crawler_namespace.PATTERN_non_CJK.test(work_id)) {
				if (!_this.skip_get_work_page || work_data.title)
					library_namespace.warn([ 'process_work_data: ', {
						// gettext_config:{"id":"$1-(id-$2)-is-not-a-chinese-japanese-or-korean-title"}
						T : [ work_data.title ? '《%1》（id：%2）非中日韓文作品標題。'
						// gettext_config:{"id":"the-title-of-the-work-$1-(id-$2)-could-not-be-obtained-or-set"}
						: '無法取得或未設定作品標題《%1》（id：%2）。',
						//
						work_data.title, work_id ]
					} ]);
			}

			// 自動添加之作業用屬性：
			work_data.id = work_id;
			work_data.last_download = {
				// {Date}
				date : (new Date).toISOString(),
				chapter : _this.start_chapter_NO
			};
			// source URL of work
			work_data.url = work_URL;

			// gettext_config:{"id":"downloading-$1-table-of-contents-@-$2"}
			process.title = gettext('下載%1 - 目次 @ %2', work_data.title, _this.id);
			// console.log(work_data);
			var variable_set = {
				id : typeof work_data.directory_id === 'function'
				// 自行指定作品放置目錄與 ebook 用的 work id。
				&& work_data.directory_id() || work_data.id,
				// this.skip_get_work_page 時， work_data.title === undefined
				title : work_data.title || '',
				// e.g., '.' + (new Date).format('%Y%2m%2d')
				// e.g., 騰訊動漫和起點中文限免作品的日期後綴。
				directory_name_extension : work_data.directory_name_extension
						|| ''
			};
			variable_set.id_title = variable_set.id
			//
			+ (variable_set.title ? ' ' + variable_set.title : '');
			if (_this.directory_name_pattern
			//
			&& library_namespace.extract_literals(
			//
			_this.directory_name_pattern, {
				id : 'i1',
				title : 't1',
				id_title : 'it1'
			}) === library_namespace.extract_literals(
			//
			_this.directory_name_pattern, {
				id : 'i2',
				title : 't2',
				id_title : 'it2'
			})) {
				library_namespace.error({
					// gettext_config:{"id":"the-custom-directory_name_pattern-$1-gives-the-same-name-to-different-works-so-the-default-directory_name_pattern-is-used-instead"}
					T : [ '自訂作品目錄名稱模式 %1 令不同作品產生相同名稱，改採預設作品目錄模式！',
							JSON.stringify(_this.directory_name_pattern) ]
				});
				// using `Work_crawler.prototype.directory_name_pattern`
				delete _this.directory_name_pattern;
			}
			work_data.directory_name = library_namespace.to_file_name(
			// 允許自訂作品目錄名/命名資料夾。
			work_data.directory_name
			// default 作品目錄名/命名資料夾。
			|| library_namespace.extract_literals(
			// 自定義 自訂作品目錄名稱模式。e.g., '${title}' 將只以作品標題為作品目錄，'${id}'
			// 將只以作品id為作品目錄。
			_this.directory_name_pattern
			// default directory_name_pattern 預設作品目錄名稱模式。
			|| Work_crawler.prototype.directory_name_pattern,
			//
			variable_set));
			// console.log(work_data.directory_name);
			// full directory path of the work.
			if (!work_data.directory) {
				var work_base_directory = _this.main_directory;
				if (work_data.base_directory_name) {
					// 允許自訂作品目錄，將作品移至特殊目錄下。
					// @see qq.js, qidian.js
					// set base directory name below _this.main_directory
					work_base_directory += library_namespace
							.append_path_separator(work_data.base_directory_name);
					// 特殊目錄可能還不存在。
					library_namespace.create_directory(work_base_directory);
					if (_this.need_create_ebook)
						work_data.ebook_directory = work_base_directory;
				}
				work_data.directory = library_namespace
						.append_path_separator(work_base_directory
								+ work_data.directory_name);
			}
			work_data.data_file = work_data.directory
					+ work_data.directory_name + '.json';

			var work_page_path = get_work_page_path(work_data), html;
			if (_this.preserve_work_page) {
				if (!_this.regenerate) {
					// 先寫入作品資料 cache。
					library_namespace.create_directory(work_cache_directory);
					// .regenerate 表示採用舊資料，無須重新儲存一次。
					node_fs.writeFileSync(work_page_path, XMLHttp.buffer);
				}
			} else if (_this.preserve_work_page === false) {
				// 明確指定不保留，將刪除已存在的作品資料 cache。
				library_namespace.debug({
					// gettext_config:{"id":"delete-existing-work-data-cache-$1"}
					T : [ '刪除已存在的作品資料快取：%1', work_page_path ]
				}, 1, 'process_work_data');
				library_namespace.remove_file(work_page_path);
			}

			// .status 選擇性屬性：須配合網站平台更改。
			// ja:種別,状態
			if (Array.isArray(work_data.status)) {
				// e.g., ジャンル
				work_data.status = work_data.status.filter(function(item) {
					return !!item;
				})
				// .sort()
				// .join(', ')
				;
			}
			// assert: typeof work_data.status === 'string'
			// || Array.isArray(work_data.status)

			// 主要提供給 this.get_chapter_list() 使用。
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
				delete matched.old_data;
				// cache old data
				work_data.old_data = matched;

				// work_data properties to reset. do not inherit
				// 設定不繼承哪些作品資訊。
				var skip_cache = Object.assign({
					reget_chapter : true,
					process_status : _this.recheck,

					ebook_directory : _this.need_create_ebook,
					words_so_far : _this.need_create_ebook,
					book_chapter_count : _this.need_create_ebook
				}, _this.reset_work_data_properties);
				// work_data.old_data = Object.create(null);

				// recall old work_data
				// 基本上以新資料為準，除非無法獲取新資料，才改用舊資料。
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
						// work_data.old_data[key] = matched[key];

						// 記錄舊下載目錄的資料以供調整目錄時使用。
						// work_data.old_directory
						if (key === 'directory') {
							work_data.old_directory = matched[key];
						}

						var _message = String(matched[key])
								+ String(work_data[key]);
						var multi_lines = _message.length > 60
						// 採用比較簡潔並醒目多色彩的顯示方式。
						|| _message.includes('\n');
						// gettext_config:{"id":"new-information-→"}
						_message = multi_lines ? gettext('新資料→') : '→';
						_message = [ [ key + ':', matched[key] ],
								[ _message, work_data[key] ] ];
						_message = library_namespace.display_align(_message, {
							value_style : {
								color : 'green'
							},
							line_separator : multi_lines ? '\n' : ''
						});
						// console.log(_message);
						library_namespace.info(_message);
					}
				}
				if (matched.last_download) {
					// 紀錄一下上一次下載的資訊。
					work_data.latest_download = matched.last_download;
					matched = matched.last_download.chapter;
					if (matched > _this.start_chapter_NO) {
						// 將開始/接續下載的章節編號。對已下載過的章節，必須配合 .recheck。
						work_data.last_download.chapter = matched | 0;
					}
				}
			}

			// reset
			delete work_data.next_chapter_list_URL;
			delete work_data.next_chapter_list_NO;
			fetch_chapter_list_data(XMLHttp);
		}

		// ----------------------------------------------------------

		/**
		 * 獲取章節列表資訊的頁面資料。
		 * 
		 * @param {Object}[XMLHttp]
		 *            本作品首次執行時，這裡的 XMLHttp 應該是作品資訊的頁面資料。
		 * @returns
		 */
		function fetch_chapter_list_data(XMLHttp) {

			if (!_this.chapter_list_URL && !work_data.next_chapter_list_URL) {
				pre_process_chapter_list_data(XMLHttp);
				return;
			}

			var chapter_list_URL = work_data.chapter_list_URL
			/**
			 * 對於章節列表與作品資訊分列不同頁面(URL)的情況，應該另外指定 .chapter_list_URL。 e.g., <code>
			chapter_list_URL : '',
			chapter_list_URL : function(work_id) { return this.work_URL(work_id) + 'chapter/'; },
			chapter_list_URL : function(work_id, work_data) { return [ 'url', { post_data } ]; },
			 </code>
			 */
			= work_data.next_chapter_list_URL ? _this
					.full_URL(work_data.next_chapter_list_URL) : _this
					.full_URL(_this.chapter_list_URL, work_id, work_data);
			// console.trace(chapter_list_URL);
			var post_data = null;
			if (Array.isArray(chapter_list_URL)) {
				post_data = chapter_list_URL[1];
				chapter_list_URL = _this.full_URL(chapter_list_URL[0]);
			}

			// this.reget_chapter 要在 function process_chapter_list_data(html)
			// 才設定好，這邊的是預設值。因此必須處理特殊情況，例如 _this.regenerate。
			if (_this.regenerate || !_this.reget_chapter) {
				// @see function get_data() @
				// CeL.application.net.work_crawler.chapter
				library_namespace.get_URL_cache(chapter_list_URL, function(
						data, error, XMLHttp) {
					// console.trace(XMLHttp, error);
					pre_process_chapter_list_data(XMLHttp, error);
				}, {
					no_write_info : true,
					file_name : get_chapter_list_path(work_data),
					encoding : undefined,
					charset : _this.charset,
					get_URL_options : _this.get_URL_options,
					simulate_XMLHttpRequest_response : true
				});
				return;
			}

			_this.get_URL(chapter_list_URL, pre_process_chapter_list_data,
					post_data, true);
		}

		// ----------------------------------------------------------

		function pre_process_chapter_list_data(XMLHttp, error) {
			_this.set_chapter_time_interval(XMLHttp);

			// 因為隱私問題？有些瀏覽器似乎會隱藏網址，只要輸入host即可？
			if (/(?:\.html?|\/)$/.test(XMLHttp.responseURL))
				_this.setup_value('Referer', XMLHttp.responseURL);
			var html = XMLHttp.responseText;
			if (!html && !_this.skip_get_work_page) {
				var message = _this.id + ': '
				// gettext_config:{"id":"cannot-get-chapter-list-page"}
				+ gettext('Cannot get chapter list page!');
				library_namespace.error(message);
				_this.onerror(message, work_data);
				typeof callback === 'function' && callback(work_data);
				return Work_crawler.THROWED;
			}

			// console.trace(XMLHttp);
			var chapter_list_path = get_chapter_list_path(work_data);
			if (_this.preserve_work_page && _this.chapter_list_URL) {
				// 所在目錄應該已經在上一個 _this.preserve_work_page 那個時候建造完畢。
				if (!_this.regenerate) {
					// .regenerate 表示採用舊資料，無須重新儲存一次。
					node_fs.writeFileSync(chapter_list_path, XMLHttp.buffer);
				}
			} else if (_this.preserve_work_page === false) {
				// 明確指定不保留，將刪除已存在的章節列表頁面(網頁)。
				library_namespace.debug({
					// gettext_config:{"id":"remove-chapter-list-page-$1"}
					T : [ 'Remove chapter list page: %1', chapter_list_path ]
				}, 1, 'pre_process_chapter_list_data');
				library_namespace.remove_file(chapter_list_path);
				if (false) {
					// 假如沒有檔案，是空的目錄就會被移除。
					library_namespace.fs_remove(work_cache_directory);
				}
			}

			if (false) {
				// reset chapter_count. 此處 chapter (章節)
				// 指的為平台所給的id編號，可能是page，並非"回"、"話"！且可能會跳號！
				/** {ℕ⁰:Natural+0}章節數量 */
				work_data.chapter_count = 0;
				// work_data.chapter_count這個數值在前面skip_cache已經設定為不會更新，因此在這邊不需要重新設定。
			}

			// 注意: 這時可能尚未建立 work_data.directory。
			// 但this.get_chapter_list()若用到work_data[this.KEY_EBOOK].set_cover()，則會造成沒有建立基礎目錄的錯誤。
			library_namespace.debug({
				// gettext_config:{"id":"create-work_data.directory-$1"}
				T : [ 'Create work_data.directory: %1', work_data.directory ]
			});
			// 預防(work_data.directory)不存在。
			library_namespace.create_directory(work_data.directory);

			if (_this.is_finished(work_data)
			// 第二次獲取 chapter list 時無須再處理。
			&& !work_data.next_chapter_list_URL) {
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
						// gettext_config:{"id":"last-saved-date","mark_type":"part_of_string"}
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
				// gettext_config:{"id":"finished"}
				|| !work_data.process_status.includes('finished')) {
					// gettext_config:{"id":"finished"}
					crawler_namespace.set_work_status(work_data, 'finished');
				}
				// cf. work_data.latest_chapter 最新章節,
				// work_data.latest_chapter_url 最新更新章節URL,
				// work_data.last_update 最新更新時間,
				// work_data.some_limited 部份章節需要付費/被鎖住/被限制
				if (work_data.last_update) {
					crawler_namespace.set_work_status(work_data,
					// gettext_config:{"id":"last-updated-date","mark_type":"part_of_string"}
					'last updated date: ' + work_data.last_update);
				}
				if (work_data.last_saved
				// 已完結的時間報告只記錄一次就夠了。
				&& work_data.process_status.every(function(status) {
					// gettext_config:{"id":"last-saved-date","mark_type":"part_of_string"}
					return !String(status).startsWith('last saved date: ');
				})) {
					if (Date.parse(work_data.last_saved) > 0) {
						work_data.last_saved = new Date(work_data.last_saved);
					}
					crawler_namespace.set_work_status(work_data,
					// gettext_config:{"id":"last-saved-date","mark_type":"part_of_string"}
					'last saved date: '
					//
					+ (library_namespace.is_Date(work_data.last_saved)
					//
					? work_data.last_saved.format('%Y/%m/%d %H:%M:%S')
					//
					: work_data.last_saved));
				}
				// TODO: skip finished + no update works
			}

			if (!work_data.next_chapter_list_URL
			// || _this.need_create_ebook
			) {
				// 提供給 this.get_chapter_list() 使用。
				if (!('time_zone' in work_data)) {
					// e.g., 9
					work_data.time_zone
					// CeL.application.locale.time_zone_of_language
					= library_namespace
							.time_zone_of_language(work_data.language);
				}
			}

			if (typeof _this.pre_get_chapter_list === 'function') {
				// 處理章節列表分散在多個檔案時的情況。
				// e.g., dajiaochong.js

				// @deprecated 現在應該在 crawler.get_chapter_list() 中設定
				// `work_data.next_chapter_list_URL`，
				// 這樣可以處理 preserve_chapter_page。
				_this.pre_get_chapter_list(
				// function(callback, work_data, html, get_label)
				check_get_chapter_list.bind(_this, html), work_data, html,
						crawler_namespace.get_label);
			} else {
				check_get_chapter_list(html);
			}
		}

		// ----------------------------------------------------------

		function check_get_chapter_list(html) {
			function onerror(error) {
				library_namespace.error([ _this.id + ': ', {
					// gettext_config:{"id":"«$2»-a-serious-error-occurred-during-execution-of-$1-which-was-aborted"}
					T : [ '《%2》：執行 %1 時發生嚴重錯誤，異常中斷。',
					//
					'.get_chapter_list()', work_data.title ]
				} ]);
				_this.onerror(error, work_data);
				typeof callback === 'function' && callback(work_data);
				return Work_crawler.THROWED;
			}

			// old name: this.get_chapter_count()
			if (typeof _this.get_chapter_list === 'function') {
				// reset
				delete work_data.next_chapter_list_URL;
				try {
					// 解析出章節列表。
					var chapter_list = work_data.chapter_list;
					// auto reset
					if (false && !work_data.next_chapter_list_NO) {
						(work_data.chapter_list = []).old_chapter_list = chapter_list;
					}

					// 在 this.get_chapter_list() 中要檢測是否為多次獲取 chapter list，必須用
					// `work_data.next_chapter_list_NO`。
					chapter_list = _this.get_chapter_list(work_data, html,
							crawler_namespace.get_label);
					if (library_namespace.is_thenable(chapter_list)) {
						// 得要從章節內容獲取必要資訊例如更新時間的情況。
						// e.g., for 51shucheng.js
						chapter_list.then(process_chapter_list_data.bind(this,
								html), onerror);
						return;
					}
				} catch (e) {
					return onerror(e);
				}

				if (work_data.inverted_order) {
					_this.reverse_chapter_list_order(work_data);
					delete work_data.inverted_order;
				}
			}

			process_chapter_list_data(html);
		}

		// 解析出 章節列表/目次/完整目錄列表
		function process_chapter_list_data(html) {
			if (work_data.next_chapter_list_URL) {
				if (!work_data.next_chapter_list_NO) {
					// 現在正處理 chapter list 第一頁。
					work_data.next_chapter_list_NO = 1;
				}
				work_data.next_chapter_list_NO++;
				library_namespace.log_temporary('get_work_data: '
						+ 'Fetch next chapter list page #'
						+ work_data.next_chapter_list_NO + '...');
				fetch_chapter_list_data();
				return;
			}

			// work_data.chapter_list 為非正規之 chapter data list。
			// e.g., work_data.chapter_list = [ chapter_data,
			// chapter_data={url:'',title:'',date:new Date}, ... ]
			var chapter_list = Array.isArray(work_data.chapter_list)
					&& work_data.chapter_list;

			if (chapter_list) {
				// fill required data from chapter_list

				// 之前已設定 work_data.chapter_count=0
				if (!work_data.chapter_count) {
					// 自 work_data.chapter_list 計算章節數量。
					work_data.chapter_count = chapter_list.length;
				}
				if (false) {
					// https://github.com/kanasimi/work_crawler/issues/551
					work_data.chapter_NO_pad_digits = Math.max(
					// 設定位數的最小值：小說4位數，漫畫3位數，預防常常因為更新而變動。
					_this.need_create_ebook ? 4 : 3,
					//
					1 + Math.floor(Math.log10(work_data.chapter_count)));
				}

				var last_chapter_data = chapter_list.at(-1),
				//
				set_attribute = function(attribute, value) {
					if (!value)
						return;
					if (!work_data[attribute] || work_data[attribute] !== value
							&& String(value).includes(work_data[attribute])) {
						if (work_data[attribute]) {
							library_namespace.info(
							//
							library_namespace.display_align([
							//
							[ attribute + ':', work_data[attribute] ],
							// via chapter data
							// gettext_config:{"id":"from-chapter-data-→"}
							[ gettext('自章節資料→'), value ] ]));
						}
						work_data[attribute] = value;
						// 有些資訊來自章節清單。
						work_data.fill_from_chapter_list = true;
					}
				};

				if (typeof last_chapter_data === 'string') {
					set_attribute('latest_chapter_url', last_chapter_data);
				} else if (library_namespace.is_Object(last_chapter_data)) {
					set_attribute(
							'latest_chapter_url',
							Array.isArray(last_chapter_data.url) ? last_chapter_data.url[0]
									: last_chapter_data.url);
					set_attribute('latest_chapter', last_chapter_data.title);
					set_attribute('last_update', last_chapter_data.date);
				} else if (!work_data.removed) {
					// assert: work_data.removed 的情況，會在之後另外補上錯誤訊息。
					library_namespace.error({
						// gettext_config:{"id":"invalid-chapter_data-$1"}
						T : [ 'Invalid chapter_data: %1',
								JSON.stringify(last_chapter_data) ]
					});
				}

				// Release memory. 釋放被占用的記憶體。
				last_chapter_data = set_attribute = null;
			}

			if (chapter_list && input_url) {
				// 檢查是否輸入特定章節的網址。注意：此方法僅在輸入的章節網址包含作品網址的情況下才有作用。
				chapter_list.some(function(chapter_data, index) {
					var chapter_url;
					if (typeof chapter_data === 'string') {
						chapter_url = chapter_data;
					} else if (library_namespace.is_Object(chapter_data)) {
						chapter_url = chapter_data.url
					} else {
						library_namespace.error({
							// gettext_config:{"id":"invalid-chapter_data-$1"}
							T : [ 'Invalid chapter_data: %1',
									JSON.stringify(chapter_data) ]
						});
					}
					if (chapter_url && input_url.includes(chapter_url)) {
						work_data.download_chapter_NO_list = [ ++index ];
						library_namespace.info({
							// gettext_config:{"id":"enter-the-url-for-§$1-and-download-only-this-section"}
							T : [ '輸入 §%1 的網址，僅下載此一章節。', index ]
						});
						return true;
					}
				});
			}

			if (work_data.chapter_count >= 1) {
				// 標記曾經成功獲取的章節數量，代表這個部分的代碼運作機制沒有問題。
				_this.got_chapter_count = true;

			} else {
				// console.log(work_data);
				var warning = _this.id + ': ' + work_id
						+ (work_data.title ? ' ' + work_data.title : '') + ': ';
				if (work_data.removed) {
					// cf. work_data.filtered
					warning += typeof work_data.removed === 'string' ? work_data.removed
							// gettext_config:{"id":"the-work-does-not-exist-or-has-been-deleted"}
							: '作品不存在或已被刪除。';
				} else {
					warning += gettext
					// gettext_config:{"id":"cannot-get-chapter-count"}
					.append_message_tail_space('Cannot get chapter count!')
					// (Did not set work_data.chapter_count)
					// gettext_config:{"id":"perhaps-the-work-has-been-deleted-or-blocked"}
					+ gettext(_this.got_chapter_count ? '或許作品已被刪除或屏蔽？'
					// No chapter got! 若是作品不存在就不會跑到這邊了
					// 或者是特殊作品？
					// gettext_config:{"id":"perhaps-the-work-has-been-deleted-or-blocked-or-has-the-website-been-revised"}
					: '或許作品已被刪除或屏蔽，或者網站改版了？');
				}
				_this.onwarning(warning, work_data);

				// 無任何章節可供下載。刪掉前面預建的目錄。
				// 注意：僅能刪除本次操作所添加/改變的檔案。因此必須先確認裡面是空的。不能使用{library_namespace.fs_remove(work_data.directory,,true);}。
				library_namespace.fs_remove(work_data.directory);

				typeof callback === 'function' && callback(work_data);
				return;
			}

			var recheck_flag = 'recheck' in work_data ? work_data.recheck
			// work_data.recheck 可能是程式自行判別的。
			: _this.recheck,
			/** {Integer}章節的增加數量: 新-舊, 當前-上一次的 */
			chapter_added = work_data.chapter_count
					- work_data.last_download.chapter;

			// 指定僅下載某些特殊的章節。
			if (Array.isArray(work_data.download_chapter_NO_list)) {
				recheck_flag = true;
				// 正規化 work_data.download_chapter_NO_list
				work_data.download_chapter_NO_list = work_data.download_chapter_NO_list
				// must be number
				.map(function(index) {
					return +index;
				}).filter(function(index) {
					return 0 <= index && index < chapter_list.length
					//
					&& index === Math.floor(index);
				})
				// 在 .one_by_one 的情況下允許不依照順序下載。
				/* .sort() */.unique();

				work_data.download_chapter_NO_list.index = 0;

				library_namespace.info({
					T : [ work_data.download_chapter_NO_list.length === 0
					// gettext_config:{"id":"manually-specified-not-to-download-any-chapters"}
					? '手動指定了不下載任何章節！'
					// gettext_config:{"id":"download-only-chapter-number-$1"}
					: '僅下載章節編號：%1',
							work_data.download_chapter_NO_list.join(', ') ]
				});
			}

			if (typeof recheck_flag === 'function') {
				recheck_flag = recheck_flag.call(this, work_data);
			}

			if (recheck_flag === 'multi_parts_changed') {
				recheck_flag = chapter_list
				// 當有多個分部的時候才重新檢查。
				&& chapter_list.part_NO > 1 && 'changed';
			}

			if (chapter_list && work_data.old_data
			// copy old chapter data. e.g., chapter_data.image_list
			&& Array.isArray(work_data.old_data.chapter_list)) {
				chapter_list.some(function(chapter_data, index) {
					var old_chapter_data
					//
					= work_data.old_data.chapter_list[index];
					if (!library_namespace.is_Object(old_chapter_data)
					// 檢核是否有資料比較的基本條件。
					|| !chapter_data.url || !chapter_data.title) {
						return true;
					}
					if (chapter_data.url !== old_chapter_data.url
					// 檢核基本資料是否相同。
					|| chapter_data.title !== old_chapter_data.title) {
						// recheck_flag = true;
						return true;
					}
					// assert: chapter_list[index] === chapter_data
					for ( var property in old_chapter_data) {
						if (!(property in chapter_data)
								&& !ignore_old_chapter_data.has(property)) {
							chapter_data[property]
							// 最後要把資料再 copy 回 chapter_data，預防程式碼參照 chapter_data。
							= old_chapter_data[property];
						}
					}
				});
			}

			if (_this.regenerate
					&& !Object.hasOwn(_this, 'preserve_chapter_page')) {
				// regenerate 的情況下，預設為 .preserve_chapter_page = true;
				_this.preserve_chapter_page = true;
				_this.preserve_work_page = true;
			}

			// console.trace(_this);
			// console.trace(work_data);
			if (recheck_flag
			// _this.get_chapter_list() 中
			// 可能重新設定過 work_data.last_download.chapter。
			&& work_data.last_download.chapter !== _this.start_chapter_NO) {
				library_namespace.debug({
					// gettext_config:{"id":"the-.recheck-option-has-been-set-the-work-has-been-downloaded-before-and-the-catalogue-has-content"}
					T : '已設定 .recheck 選項，且之前曾下載過本作品，作品目錄有內容。'
				});

				if (recheck_flag !== 'changed'
						&& typeof recheck_flag !== 'number') {
					// 強制重新更新文件。
					// recheck_flag should be true
					if (typeof recheck_flag !== 'boolean') {
						library_namespace.warn('Unknown .recheck: '
								+ recheck_flag);
					}
					if (!_this.reget_chapter) {
						if (Object.hasOwn(_this, 'reget_chapter')) {
							library_namespace.warn([ {
								T : [
								// gettext_config:{"id":"with-the-.recheck-option-set-setting-the-.reget_chapter-option-to-$1-will-have-no-effect"}
								'既已設定 .recheck 選項，則將 .reget_chapter 選項設定為 %1 將無作用！'
								//
								, JSON.stringify(_this.reget_chapter) ]
							}, {
								T :
								// gettext_config:{"id":"it-will-automatically-turn-.reget_chapter-to-true-and-explicitly-specify-reget_chapter-to-re-acquire-the-chapter-content"}
								'將自動把 .reget_chapter 轉為 true，明確指定 reget_chapter 以重新取得章節內容。'
							} ]);
						}
						_this.reget_chapter = true;
					}
					// 無論是哪一種，既然是 recheck 則都得要從頭 check 並生成資料。
					work_data.reget_chapter = _this.reget_chapter;
					work_data.last_download.chapter = _this.start_chapter_NO;

				} else if ( // 依變更判定是否重新更新文件。
				// for: {Natural}recheck_flag
				recheck_flag > 0 ? chapter_added < 0
				// .recheck 採用一個較大的數字可避免太過經常更新。
				|| chapter_added >= recheck_flag
				// assert: recheck_flag === 'changed'
				: chapter_added !== 0
				// TODO: check .last_update , .latest_chapter
				// 檢查上一次下載的章節名稱而不只是章節數量。
				) {
					// midified
					library_namespace.debug({
						// gettext_config:{"id":"the-work-has-been-changed-and-is-subject-to-the-conditions-that-need-to-be-updated"}
						T : '作品變更過，且符合需要更新的條件。'
					});
					library_namespace.info([ {
						// gettext_config:{"id":"as-the-number-of-chapters-changes-all-chapters-will-be-re-downloaded-and-checked"}
						T : '因章節數量有變化，將重新下載並檢查所有章節內容：'
					}, work_data.last_download.chapter
					//
					+ '→' + work_data.chapter_count
					//
					+ ' (' + (work_data.chapter_count
					//
					> work_data.last_download.chapter ? '+' : '')
					//
					+ (work_data.chapter_count
					//
					- work_data.last_download.chapter) + ')' ]);
					// 重新下載。
					work_data.reget_chapter = true;
					// work_data.regenerate = true;
					work_data.last_download.chapter = _this.start_chapter_NO;

				} else {
					// 不可用 ('reget_chapter' in _this)，會得到 .prototype 的屬性。
					if (!Object.hasOwn(_this, 'reget_chapter')) {
						work_data.reget_chapter = false;
					}
					// 如果章節刪除與增加，重整結果數量相同，則檢查不到，必須採用 .recheck。
					library_namespace.log([ _this.id + ': ',
					//
					chapter_added === 0 ? {
						T : [
						// gettext_config:{"id":"the-number-of-chapters-has-not-changed-total-$1-$2"}
						'章節數量無變化，共 %1 %2；', work_data.chapter_count,
						//
						work_data.chapter_unit || _this.chapter_unit ]
					} : {
						T : [
						// gettext_config:{"id":"the-number-of-chapters-with-small-changes-(only-$1-$2)-but-it-will-not-be-re-downloaded"}
						'章節數量變化過小（僅差 %1 %2），因此不重新下載；', chapter_added,
						//
						work_data.chapter_unit || _this.chapter_unit ]
					// gettext_config:{"id":"however-all-chapter-content-has-been-set-to-download"}
					}, work_data.reget_chapter ? '但已設定下載所有章節內容。'
					//
					: _this.regenerate
					// gettext_config:{"id":"rebuild-data-only-with-cache-(such-as-novels-e-books)-and-not-re-download-all-chapter-content"}
					? '僅利用快取重建資料（如小說、電子書），不重新下載所有章節內容。'
					// ↑ （警告：必須先以 preserve_work_page preserve_chapter_page 執行過！）
					// gettext_config:{"id":"skip-this-work-without-processing"}
					: '跳過本作品不處理。' ]);

					// 採用依變更判定時，預設不重新擷取。
					if (!('reget_chapter' in _this)) {
						work_data.reget_chapter = false;
					}
					if (work_data.reget_chapter || _this.regenerate) {
						// 即使是這一種，還是得要從頭 check cache 並生成資料(如.epub)。
						work_data.last_download.chapter = _this.start_chapter_NO;
					}

				}

			} else if (_this.start_chapter_title) {
				library_namespace.info({
					T : [
					// 而重新檢查下載。
					// gettext_config:{"id":"previously-downloaded-to-the-newer-$2-$3-backtracked-by-specifying-start_chapter_title=$1"}
					'之前已下載到較新的第 %2 %3，因指定 start_chapter_title=%1 而回溯。',
							_this.start_chapter_title,
							work_data.last_download.chapter,
							work_data.chapter_unit || _this.chapter_unit ]
				});
				// 從頭檢查章節標題。
				work_data.last_download.chapter = Work_crawler.prototype.start_chapter_NO;

			} else if (_this.start_chapter_NO > Work_crawler.prototype.start_chapter_NO
					&& work_data.last_download.chapter > _this.start_chapter_NO) {
				library_namespace.info({
					// gettext_config:{"id":"previously-downloaded-to-the-newer-$2-$3-backtracked-by-specifying-start_chapter_no=$1"}
					T : [ '之前已下載到較新的第 %2 %3，因指定 start_chapter_NO=%1 而回溯。',
							_this.start_chapter_NO,
							work_data.last_download.chapter,
							work_data.chapter_unit || _this.chapter_unit ]
				});
				work_data.last_download.chapter = _this.start_chapter_NO;
			} else if (_this.regenerate) {
				// 從頭生成電子書。
				work_data.last_download.chapter = Work_crawler.prototype.start_chapter_NO;
			}
			// console.trace(_this);
			// console.trace(work_data);

			if (!('reget_chapter' in work_data)) {
				// .reget_chapter 為每個作品可能不同之屬性，非全站點共用屬性。
				work_data.reget_chapter = typeof _this.reget_chapter === 'function' ? _this
						.reget_chapter(work_data)
						: !_this.regenerate && _this.reget_chapter;
			}
			// console.trace(work_data);

			if (work_data.last_download.chapter > work_data.chapter_count) {
				library_namespace.warn({
					T : [
					// or: 對於被屏蔽的作品，將會每次都從頭檢查。
					// gettext_config:{"id":"the-number-of-chapters-$1-is-less-than-the-start-continued-download-chapter-number-$2-perhaps-because-the-chapter-has-been-reorganized-or-the-chapter-has-been-added-or-deleted-midway-during-the-last"}
					'章節數量 %1 比將開始/接續之下載章節編號 %2 還少，或許因為章節有經過重整，或者上次下載時中途增刪過章節。',
							work_data.chapter_count,
							work_data.last_download.chapter ]
				});
				if (_this.move_when_chapter_count_error) {
					var move_to = work_data.directory
					// 先搬移原目錄。
					.replace(/[\\\/]+$/, '.' + (new Date).format('%4Y%2m%2d'));
					// 常出現在 manhuatai, 2manhua。
					library_namespace.warn([ {
						T : [
						// 另存
						// gettext_config:{"id":"the-old-content-will-be-backed-up-the-directory-will-be-moved-and-then-re-downloaded-from-$1-$2"}
						'將先備份舊內容、移動目錄，而後重新自第 %1 %2下載！', _this.start_chapter_NO,
						//
						work_data.chapter_unit || _this.chapter_unit ]
					}, '\n', work_data.directory, '\n→\n', move_to ]);
					// TODO: 成壓縮檔。
					library_namespace.fs_move(work_data.directory, move_to);
					// re-create work_data.directory
					library_namespace.create_directory(work_data.directory);
				} else {
					library_namespace.info({
						// gettext_config:{"id":"it-will-be-re-downloaded-from-$1-$2"}
						T : [ '將從頭檢查、自第 %1 %2重新下載。', _this.start_chapter_NO,
								work_data.chapter_unit || _this.chapter_unit ]
					});
				}
				work_data.reget_chapter = true;
				work_data.last_download.chapter = _this.start_chapter_NO;
			}

			work_data.error_images = 0;
			if (work_data.last_download.chapter === _this.start_chapter_NO) {
				work_data.image_count = 0;
			} else {
				delete work_data.image_count;
			}

			if (_this.need_create_ebook && !work_data.reget_chapter
			// 最起碼應該要重新生成電子書。否則會只記錄到最後幾個檢查過的章節。
			&& work_data.last_download.chapter !== work_data.chapter_count) {
				library_namespace.info({
					// gettext_config:{"id":"the-e-book-will-be-regenerated-from-$1$2"}
					T : [ '將從頭檢查、自第 %1 %2重新生成電子書。', _this.start_chapter_NO,
							work_data.chapter_unit || _this.chapter_unit ]
				});
				work_data.regenerate = true;
				work_data.last_download.chapter = _this.start_chapter_NO;
			}

			// remove cache of old work_data
			delete work_data.old_data;

			if (typeof callback === 'function' && callback.options
					&& callback.options.get_data_only) {
				// 最終廢棄動作，防止執行 work_data[this.KEY_EBOOK].pack()。
				delete work_data[_this.KEY_EBOOK];
				if (work_data.latest_download) {
					// recover latest download data
					work_data.last_download = work_data.latest_download;
				} else {
					delete work_data.last_download;
				}

				// backup
				_this.save_work_data(work_data, 'process_chapter_list_data');

				callback(work_data);
				return;
			}

			// backup
			_this.save_work_data(work_data, 'process_chapter_list_data');

			if (!work_data.reget_chapter
			//
			&& !_this.regenerate && !work_data.regenerate
			// 還必須已經下載到最新章節。
			&& work_data.last_download.chapter === work_data.chapter_count) {
				// 跳過本作品不處理。
				library_namespace.log([ 'process_chapter_list_data: ', {
					// gettext_config:{"id":"skip-$1-without-processing"}
					T : [ '跳過 %1 不處理。', work_data.id
					//
					+ (work_data.author ? ' [' + work_data.author + ']' : '')
					//
					+ ' ' + work_data.title ]
				} ]);
				// 最終廢棄動作，防止執行 work_data[this.KEY_EBOOK].pack()。
				delete work_data[_this.KEY_EBOOK];
				if (typeof callback === 'function') {
					// console.log(callback + '');
					callback(work_data);
				}
				return;
			}

			var ebook_promise;
			if (_this.need_create_ebook) {
				// console.log(work_data);
				// console.trace(JSON.stringify(work_data));
				ebook_promise = crawler_namespace.create_ebook.call(_this,
						work_data);
			}

			var message = [
					work_data.id,
					// TODO: {Object}work_data.author
					work_data.author ? ' [' + work_data.author + ']' : '',
					' ',
					work_data.title,
					': ',
					work_data.chapter_count >= 0
					// assert: if chapter count unknown, typeof
					// _this.pre_chapter_URL === 'function'
					// gettext_config:{"id":"unknown"}
					? work_data.chapter_count : 'Unknown',
					' ',
					work_data.chapter_unit || _this.chapter_unit,
					'.',
					work_data.status ? ' '
							+ (library_namespace.is_Object(work_data.status) ? JSON
									.stringify(work_data.status)
									: work_data.status)
							: '',
					work_data.last_download.chapter > _this.start_chapter_NO ? ' '
							// §: 章節編號
							// gettext_config:{"id":"download-from-§$1"}
							+ gettext('自 §%1 接續下載。',
									work_data.last_download.chapter)
							: '' ].join('');
			if (_this.is_finished(work_data)) {
				// 針對特殊狀況提醒。
				library_namespace.info(message);
			} else {
				library_namespace.log(message);
			}

			work_data.start_downloading_time = Date.now();
			work_data.start_downloading_chapter = work_data.last_download.chapter || 1;
			if (typeof _this.after_download_chapter === 'function') {
				_this.after_download_chapter(work_data, 0);
			}

			// function create_ebook(work_data)
			// 中的 this.convert_to_language() 可能是 async 形式，需要待其完成之後，再進行下個階段。
			function waiting_for_create_ebook() {
				library_namespace
						.log_temporary({
							T : 'Waiting for connecting to language-converting server...'
						});
				// Will wait for the get_URL() @ function get_LTP_data(options)
				// @ Chinese_converter/Chinese_converter.js
				Promise.resolve(ebook_promise).then(
						start_to_process_chapter_data);
			}
			function start_to_process_chapter_data() {
				// console.trace(_this);
				// console.trace(work_data);

				// 開始下載 chapter。
				crawler_namespace.pre_get_chapter_data.call(_this, work_data,
				// work_data.start_downloading_chapter
				crawler_namespace.get_next_chapter_NO_item(work_data,
						work_data.last_download.chapter), callback);
			}
			if (typeof _this.after_get_work_data === 'function') {
				// 必須自行保證執行 callback()，不丟出異常、中斷。
				_this.after_get_work_data(waiting_for_create_ebook, work_data);
			} else {
				waiting_for_create_ebook();
			}
		}

	}

	// --------------------------------------------------------------------------------------------

	// export 導出.

	// @inner
	Object.assign(crawler_namespace, {
		set_work_status : set_work_status
	});

	// @instance
	Object.assign(Work_crawler.prototype, {
		// 規範 work id 的正規模式；提取出引數中的作品id 以回傳。
		extract_work_id : extract_work_id,
		// 自作品網址 URL 提取出 work id。 via URL
		extract_work_id_from_URL : extract_work_id_from_URL,

		show_work_data : show_work_data,

		get_work : get_work,
		get_work_data : get_work_data,
		save_work_data : save_work_data_file
	});

	// 不設定(hook)本 module 之 namespace，僅執行 module code。
	return library_namespace.env.not_to_extend_keyword;
}
