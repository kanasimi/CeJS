/**
 * @name WWW work crawler sub-functions
 * 
 * @fileoverview WWW work crawler functions: part of chapter
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
		name : 'application.net.work_crawler.chapter',

		require : 'application.net.work_crawler.',

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

	// 檢查磁碟上面是否真的有已經下載的漫畫檔案。
	// .check_downloaded_chapters() 必須先確保已獲得最終之 chapter_data.title。
	// e.g., calling from .get_chapter_list()
	function check_downloaded_chapters(work_data) {
		var chapter_list = Array.isArray(work_data.chapter_list)
				&& work_data.chapter_list;

		if (this.need_create_ebook || !chapter_list)
			return;

		var chapter_list_to_check = [];

		chapter_list.forEach(function(chapter_data, index) {
			if (typeof chapter_data === 'string') {
				chapter_data = chapter_list[index] = {
					url : chapter_data
				};
			}

			var downloaded_file = work_data.directory
			// + 1: chapter_NO starts from 1
			+ this.get_chapter_directory_name(work_data, index + 1) + '.'
					+ this.images_archive_extension;
			// console.log('downloaded_file: ' + downloaded_file);

			if (library_namespace.storage.file_exists(downloaded_file)) {
				chapter_data.skip_this_chapter
				// gettext_config:{"id":"skip-chapters-that-have-been-downloaded-or-checked-before-and-no-longer-need-to-be-checked"}
				= gettext('跳過之前已下載或檢查過，已無需再檢查的章節。');
			} else {
				chapter_list_to_check.push('§' + (index + 1)
				// + 1: chapter_NO starts from 1
				+ (chapter_data.title ? ' ' + chapter_data.title : ''));
			}
		}, this);

		if (chapter_list_to_check.length === 0) {
			library_namespace.log([ 'check_downloaded_chapters: ', {
				// gettext_config:{"id":"skip-all-chapters"}
				T : '跳過所有章節'
			} ]);
		} else {
			library_namespace.log([
					'check_downloaded_chapters: ',
					{
						// gettext_config:{"id":"check-only-$1-chapters-$2"}
						T : [ '僅檢查 %1個{{PLURAL:%1|章節}}：%2',
								chapter_list_to_check.length,
								//
								chapter_list_to_check.join(', ') ]
					} ]);
		}

		// console.log(work_data.chapter_list);
		// console.log(new_chapter_list);
		// work_data.chapter_list = new_chapter_list;
	}
	/**
	 * 檢查磁碟上面是否真的有已經下載的檔案。
	 * 
	 * @deprecated 應該改成.check_downloaded_chapters()。
	 */
	function check_downloaded_chapter_url(work_data, new_chapter_list,
			from_chapter_NO) {
		if (// this.recheck === 'multi_parts_changed' &&
		false && Array.isArray(new_chapter_list)
		// && new_chapter_list.part_NO > 1
		&& Array.isArray(work_data.chapter_list)) {

			var old_url_hash = Object.create(null);
			work_data.chapter_list.forEach(function(chapter_data, index) {
				// assert: {Object}chapter_data
				old_url_hash[chapter_data.url] = index;
			});

			var chapter_list_to_check = [];
			if (from_chapter_NO === undefined) {
				from_chapter_NO = work_data.last_download.chapter;
			}
			// console.log('from_chapter_NO = ' + from_chapter_NO);
			new_chapter_list.forEach(function(chapter_data, index) {
				if (index + 1 <= from_chapter_NO
						|| (chapter_data.url in old_url_hash)) {
					chapter_data.skip_this_chapter =
					// gettext_config:{"id":"skip-chapters-that-have-been-downloaded-or-checked-before-and-no-longer-need-to-be-checked"}
					gettext('跳過之前已下載或檢查過，已無需再檢查的章節。');
				} else {
					chapter_list_to_check.push('§' + (index + 1)
					//
					+ (chapter_data.title ? ' ' + chapter_data.title : ''));
				}
			}, this);
			// Release memory. 釋放被占用的記憶體。
			old_url_hash = null;

			if (chapter_list_to_check.length === 0) {
				library_namespace.log([ 'check_downloaded_chapter_url: ', {
					// gettext_config:{"id":"skip-all-chapters"}
					T : '跳過所有章節'
				} ]);
			} else {
				library_namespace.log([
						'check_downloaded_chapter_url: ',
						{
							// gettext_config:{"id":"check-only-$1-chapters-$2"}
							T : [ '僅檢查 %1個{{PLURAL:%1|章節}}：%2',
									chapter_list_to_check.length,
									//
									chapter_list_to_check.join(', ') ]
						} ]);
			}

			// console.log(work_data.chapter_list);
			// console.log(new_chapter_list);
			// work_data.chapter_list = new_chapter_list;
			return;
		}
	}

	var KEY_last_fetch_timevalue = 'last_fetch_timevalue';

	function set_chapter_time_interval(XMLHttp) {
		if (false) {
			console.trace([ XMLHttp.responseURL, !XMLHttp.get_from_cache,
					this[KEY_last_fetch_timevalue] ]);
		}
		// 可能是從 library_namespace.get_URL_cache() 過來的。
		if (XMLHttp && XMLHttp.responseURL && !XMLHttp.get_from_cache) {
			this[KEY_last_fetch_timevalue] = Date.now();
		}
	}

	/**
	 * 下載/獲取下載章節資訊/章節內容前的等待時間。
	 * 
	 * @example<code>
	var chapter_time_interval = this.get_chapter_time_interval(argument_1, work_data);
	</code>
	 * 
	 * @param [argument_1]
	 *            'search': for search works.
	 * @param {Object}[work_data]
	 *            作品資訊。
	 * 
	 * @returns {Integer|Undefined}下載章節資訊/章節內容前的等待時間 (ms)。
	 */
	function get_chapter_time_interval(argument_1, work_data) {
		// 就算設定了 work_data.reget_chapter === false
		// 例如 this.regenerate === true
		// 還是可能 fetch 網頁，不能以 work_data.reget_chapter 判斷。
		if (false && work_data && work_data.reget_chapter === false) {
			// 不重新擷取。
			return;
		}

		// this.chapter_time_interval: 下載章節資訊/章節內容前的等待時間。
		var chapter_time_interval = this.chapter_time_interval;
		if (typeof chapter_time_interval === 'function') {
			// 採用函數可以提供亂數值的間隔。
			chapter_time_interval = this.chapter_time_interval(argument_1,
					work_data);
		}
		chapter_time_interval = library_namespace
				.to_millisecond(chapter_time_interval);

		if (chapter_time_interval >= 0) {
			var delta = Date.now() - (this[KEY_last_fetch_timevalue] || 0);
			if (delta > 0)
				chapter_time_interval -= delta;
			return chapter_time_interval;
		}
	}

	// --------------------------------------------------------------------------------------------

	function get_next_chapter_NO_item(work_data, chapter_NO) {
		if (Array.isArray(work_data.download_chapter_NO_list)) {
			// assert: work_data.download_chapter_NO_list 已經篩選過。
			// ">=": work_data.download_chapter_NO_list 有可能為空，造成一開始就等於了。
			if (work_data.download_chapter_NO_list.index >= work_data.download_chapter_NO_list.length)
				return work_data.chapter_count + 1;

			return work_data.download_chapter_NO_list[work_data.download_chapter_NO_list.index++];
		}

		return chapter_NO;
	}

	// --------------------------------------------------------------------------------------------

	/**
	 * 去掉章節標題的前導數字。
	 * 
	 * @param {Object}chapter_data
	 *            章節資料 chapter_data or work_data。
	 * @param {Number}[chapter_NO]
	 *            章節編號。
	 * @returns
	 */
	function trim_chapter_NO_prefix(chapter_data, chapter_NO) {
		if (!chapter_data.title)
			return;

		if (Array.isArray(chapter_data.chapter_list)) {
			// Inpus chapter_data as work_data.
			var work_data = chapter_data;

			work_data.chapter_list.forEach(function(chapter_data, index) {
				trim_chapter_NO_prefix(chapter_data, index + 1);
			});

			return;
		}

		var matched = chapter_data.title.match(/^(\d{1,4})\.(第(\d+)章?.+)$/);
		if (matched
				&& (+matched[1] === chapter_NO || +matched[1] === +matched[3])) {
			/**
			 * <code>
			// https://69shuba.cx/book/24028/	孺子帝
			// https://69shuba.cx/book/52895/	别人练级我修仙，苟到大乘再出山
			// https://www.xsw.tw/book/1613447/243600895.html	別人練級我修仙，苟到大乘再出山第1章 我綁定了修仙模擬器
			// https://klxs.tw/49/	别人练级我修仙，苟到大乘再出山
			</code>
			 */

			// 裁剪章節編號之前的標題。
			// chapter_data.title_with_NO = chapter_data.title;
			chapter_data.title = matched[2];
			return;
		}

	}

	// --------------------------------------------------------------------------------------------

	// @inner
	function pre_get_chapter_data(work_data, chapter_NO, callback) {
		if (this.continue_arguments) {
			// assert: this.is_stopping_now()
			// || this.is_stopping_now(true)

			// console.log(this.continue_arguments);
			var is_quitting = this.is_stopping_now(true);

			if (!is_quitting && !this.is_stopping_now()) {
				// 照理來說不應該會到這邊!
				retrurn;
			}

			library_namespace.warn([ this.id + ': ',
			// 暫停下載作業, 取消下載作業機制
			{
				// gettext_config:{"id":"cancel-download-«$1»"}
				T : [ is_quitting ? '取消下載《%1》。'
				// gettext_config:{"id":"suspend-downloading-«$1»"}
				: '暫停下載《%1》。', work_data.title || work_data.id ]
			} ]);

			this.continue_arguments.forEach(function(callback, index) {
				index > 0 && callback && callback(is_quitting);
			});

			// reset flow control flag
			delete this.continue_arguments;

			if (is_quitting) {
				this.running = false;
				if (typeof callback === 'function') {
					callback(work_data);
				}

			} else {
				// stop task
				this.continue_arguments
				// = arguments
				= [ work_data, chapter_NO, callback ];
				this.running = 'stopped';
				// waiting for this.continue_task()
			}
			return;
		}

		if (this.chapter_NO_range) {
			while (!this.chapter_NO_range.is_in_the_range(chapter_NO)) {
				if (++chapter_NO === work_data.chapter_list.length) {
					continue_next_chapter.call(this, work_data, chapter_NO,
							callback);
					return;
				}
			}
		}

		// 預防並列執行的時候出現交叉干擾。
		this.running = true;

		// ----------------------------

		var chapter_data = Array.isArray(work_data.chapter_list)
				&& work_data.chapter_list[chapter_NO - 1];

		if (this.start_chapter_title && chapter_data) {
			// console.log(chapter_data);
			var chapter_directory_name = this.get_chapter_directory_name(
					work_data, chapter_NO);
			// console.log(chapter_directory_name);
			if (!chapter_directory_name.toLowerCase().includes(
					this.start_chapter_title)) {
				library_namespace.debug({
					T : [ '還沒到指定開始下載的章節標題 %2，跳過[%1]不下載。', chapter_data.title,
							chapter_directory_name ]
				});
				// 執行一些最後結尾的動作。
				continue_next_chapter.call(this, work_data, chapter_NO,
						callback);
				return;
			}

			// 去除標記。
			delete this.start_chapter_title;
		}

		/** {String}skip reason */
		var skip_this_chapter = chapter_data
				// gettext_config:{"id":"skipping-this-section-without-downloading"}
				&& (chapter_data.skip_this_chapter === true ? gettext('跳過本章節不下載。')
						: chapter_data.skip_this_chapter);

		if (!skip_this_chapter && this.chapter_filter) {
			// console.log(chapter_data);

			// 不區分大小寫。
			var chapter_filter = String(this.chapter_filter).toLowerCase();

			if (chapter_data && chapter_data.title
			// 篩選想要下載的章節標題關鍵字。例如"單行本"。
			&& !chapter_data.title.toLowerCase().includes(chapter_filter)
			//
			&& (!chapter_data.part_title
			// 亦篩選部冊標題。
			|| !chapter_data.part_title.toLowerCase().includes(chapter_filter))) {
				// gettext_config:{"id":"not-in-the-range-of-chapter_filter.-skipping-this-section-without-downloading"}
				skip_this_chapter = gettext('不在 chapter_filter 所篩範圍內。跳過本章節不下載。');
			}
		}

		if (skip_this_chapter) {
			// 跳過本作品不處理。
			library_namespace.log([
					'pre_get_chapter_data: ',
					{
						T : [
								// gettext_config:{"id":"skipping-$1-not-processed-$2"}
								'跳過 %1 不處理：%2',
								(chapter_data.part_title ? '['
										+ chapter_data.part_title + '] ' : '')
										+ '[' + chapter_data.title + ']',
								skip_this_chapter ]
					} ]);

			// 執行一些最後結尾的動作。
			continue_next_chapter.call(this, work_data, chapter_NO, callback);
			return;
		}

		// ----------------------------

		var actual_operation = get_chapter_data.bind(this, work_data,
				chapter_NO, callback),
		// this.chapter_time_interval: 下載章節資訊/章節內容前的等待時間。
		chapter_time_interval = this.get_chapter_time_interval(chapter_NO,
				work_data);

		if (false) {
			console.trace([ work_data.reget_chapter, chapter_time_interval,
					this[KEY_last_fetch_timevalue] ]);
		}
		var next = chapter_time_interval > 0 ? (function() {
			var message = [ this.id, ': ', work_data.title + ': ',
			// gettext_config:{"id":"waiting-for-$3-before-downloading-$1-$2"}
			gettext('下載第 %1 %2之章節內容前先等待 %3。', chapter_NO,
			//
			work_data.chapter_unit || this.chapter_unit,
			//
			library_namespace.age_of(0, chapter_time_interval, {
				digits : 1
			})) ],
			//
			estimated_message = this.estimated_message(work_data, chapter_NO);
			if (estimated_message) {
				message.push(estimated_message);
			}
			message.push('...\r');
			library_namespace.log_temporary(message.join(''));
			setTimeout(actual_operation, chapter_time_interval);
		}).bind(this) : actual_operation;

		if (typeof this.pre_chapter_URL === 'function') {
			// 在 this.chapter_URL() 之前執行 this.pre_chapter_URL()，
			// 主要用途在獲取 chapter_URL 之資料。
			try {
				this.pre_chapter_URL(work_data, chapter_NO, next);
			} catch (e) {
				library_namespace.error([
						this.id + ': ',
						{
							// §: 章節編號
							// gettext_config:{"id":"«$2»-§$3-a-serious-error-occurred-during-execution-of-$1-process-aborted"}
							T : [ '《%2》§%3：執行 %1 時發生嚴重錯誤，異常中斷。',
									'.pre_chapter_URL()', work_data.title,
									chapter_NO ]
						} ]);
				this.onerror(e, work_data);
				typeof callback === 'function' && callback(work_data);
				return Work_crawler.THROWED;
			}
		} else {
			next();
		}
	}

	// --------------------------------------------------------------------------------------------
	// tools of this.get_chapter_list()

	// @see dm5.js for sample of this.get_chapter_list()
	// e.g., work_data.chapter_list = [ chapter_data,
	// chapter_data={url:'',title:'',date:new Date}, ... ]
	function setup_chapter_list(work_data, reset) {
		var chapter_list = work_data.chapter_list;
		// reset: reset work_data.chapter_list
		if (reset || !Array.isArray(chapter_list)) {
			chapter_list = work_data.chapter_list = [];
			// 漫畫目錄名稱不須包含分部號碼。使章節目錄名稱不包含 part_NO。
			// work_data.chapter_list.add_part_NO = false;
		}
		return chapter_list;
	}
	// part / section
	// should be called by this.get_chapter_list()
	// this.set_part(work_data, 'part_title');
	function set_part_title(work_data, part_title, part_NO) {
		var chapter_list = setup_chapter_list(work_data);

		// reset latest NO in part
		delete chapter_list.NO_in_part;

		part_title = crawler_namespace.get_label(part_title);
		if (part_title) {
			library_namespace.debug(part_title, 1, 'set_part_title');
			chapter_list.part_title = part_title;
			if (part_NO >= 1 && !('add_part_NO' in chapter_list))
				chapter_list.add_part_NO = true;
			// last part NO. part_NO starts from 1
			chapter_list.part_NO = part_NO || (chapter_list.part_NO | 0) + 1;
			// TODO: chapter_list.part_NO → chapter_list.part_count
			// TODO: do not use chapter_list.NO_in_part
		} else {
			// reset
			// delete chapter_list.part_NO;
			delete chapter_list.part_title;
		}
	}
	// should be called by this.get_chapter_list()
	// this.add_chapter(work_data, chapter_data);
	//
	// 警告: 您可能必須要重設 work_data.chapter_list
	// e.g., delete work_data.chapter_list;
	function add_chapter_data(work_data, chapter_data) {
		var chapter_list = setup_chapter_list(work_data);
		if (typeof chapter_data === 'string') {
			// treat as chapter_URL
			chapter_data = {
				url : chapter_data
			};
		}

		// assert: {Onject}chapter_data
		if (chapter_list.part_title) {
			// 如果 chapter_data 設定了值，那就用 chapter_data 原先的值。
			if (chapter_data.part_NO !== chapter_list.part_NO
					&& chapter_list.part_NO >= 1) {
				if (chapter_data.part_NO >= 1) {
					library_namespace.warn([ 'add_chapter_data: ', {
						T : [
						// gettext_config:{"id":"there-is-a-conflict-with-setting-chapter_list.$1=$2-with-chapter_data.$1=$3"}
						'原已設定 chapter_list.%1=%2，後又設定 chapter_data.%1=%3，兩者相衝突！'
						//
						, 'part_NO', chapter_list.part_NO,
						//
						chapter_data.part_NO ]
					} ]);
				} else if (chapter_list.add_part_NO !== false) {
					chapter_data.part_NO = chapter_list.part_NO;
				}
			}

			if (chapter_data.part_title !== chapter_list.part_title) {
				if (chapter_data.part_title) {
					library_namespace.warn([ 'add_chapter_data: ', {
						T : [
						// gettext_config:{"id":"there-is-a-conflict-with-setting-chapter_list.$1=$2-with-chapter_data.$1=$3"}
						'原已設定 chapter_list.%1=%2，後又設定 chapter_data.%1=%3，兩者相衝突！'
						//
						, 'part_title', chapter_list.part_title,
						//
						chapter_data.part_title ]
					} ]);
				} else {
					chapter_data.part_title = chapter_list.part_title;
				}
			}

			if (chapter_data.NO_in_part >= 1) {
				if (chapter_list.NO_in_part >= 1
						&& chapter_list.NO_in_part !== chapter_data.NO_in_part) {
					library_namespace.warn(
					//
					'add_chapter_data: chapter_list.NO_in_part: '
							+ chapter_data.NO_in_part + '→'
							+ chapter_list.NO_in_part);
				}
				chapter_list.NO_in_part = chapter_data.NO_in_part;
			} else {
				chapter_data.NO_in_part = chapter_list.NO_in_part
				// NO_in_part, NO in part starts from 1
				= (chapter_list.NO_in_part | 0) + 1;
			}
		}

		if (false) {
			console.log(chapter_list.length + ': '
					+ JSON.stringify(chapter_data));
		}
		chapter_list.push(chapter_data);
		return chapter_data;
	}
	// 轉成由舊至新之順序。 should reset work_data.chapter_list first!
	// set: work_data.inverted_order = true;
	// this.reverse_chapter_list_order(work_data);
	// @see work_crawler/hhcool.js
	function reverse_chapter_list_order(work_data, options) {
		var chapter_list = work_data.chapter_list;
		if (!Array.isArray(chapter_list) || !(chapter_list.length > 1)) {
			return;
		}
		// console.log(chapter_list);

		if (options && options.auto_detect_if_need) {
			// TODO
		}

		// 即使只有一個 part，也得處理 NO_in_part, chapter_NO 的問題。
		if (!chapter_list.part_NO)
			chapter_list.part_NO = 1;

		// reverse chapter_NO
		var chapter_NO_list = chapter_list.map(function(chapter_data, index) {
			if (!(chapter_data.NO_in_part >= 1)
					&& !chapter_list.some_chapter_without_NO_in_part) {
				chapter_list.some_chapter_without_NO_in_part = true;
				if (library_namespace.is_debug()) {
					this.onwarning('reverse_chapter_list_order: ' + gettext(
					// gettext_config:{"id":"the-serial-number-of-the-work-part-(no_in_part)-is-invalid-$1"}
					'The serial number of the work part (NO_in_part) is invalid: %1'
					//
					, 'chapter_list[' + index + ']: '
					//
					+ JSON.stringify(chapter_data)), work_data);
				}
			}
			return chapter_data.chapter_NO;
		}, this);

		library_namespace.debug({
			// gettext_config:{"id":"«$1»-sort-oldest-to-newest"}
			T : [ '《%1》：轉成由舊至新之順序。', work_data.title ]
		}, 3, 'reverse_chapter_list_order');
		chapter_list.reverse();

		if (chapter_list.some_chapter_without_NO_in_part)
			return;

		// 調整 NO_in_part
		var part_title_now, parts_count_plus_1 = chapter_list.part_NO + 1, chapter_count_plus_1;
		chapter_list.forEach(function(chapter_data, index) {
			if (chapter_NO_list[index] > 0) {
				chapter_data.chapter_NO = chapter_NO_list[index];
				// should be: chapter_data.chapter_NO === index + 1
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

	// 對於某些作品，顯示建議重新檢查的提示；以每個作品為單位。
	function confirm_recheck(work_data, prompt) {
		if (this.recheck || work_data.recheck_confirmed) {
			return;
		}
		work_data.recheck_confirmed = true;
		library_namespace.warn([ {
			// gettext_config:{"id":"«$1»"}
			T : [ '《%1》：', work_data.title || work_data.id, prompt ]
		}, {
			T : prompt
		} ]);
	}

	function set_start_chapter_NO_next_time(work_data, chapter_NO) {
		var chapter_data = work_data.chapter_list[chapter_NO - 1];
		if (/* chapter_data.limited || */work_data.start_chapter_NO_next_time) {
			return;
		}
		library_namespace.info({
			// gettext_config:{"id":"the-next-download-will-be-started-from-$1-«$2»"}
			T : [ '下次從 %1《%2》起下載。',
					chapter_NO + '/' + work_data.chapter_list.length,
					chapter_data.title ]
		});
		if (!chapter_data.limited) {
			library_namespace.warn({
				T : [ '%1《%2》未設定 chapter_data.limited',
						chapter_NO + '/' + work_data.chapter_list.length,
						chapter_data.title ]
			});
		}
		work_data.start_chapter_NO_next_time = chapter_NO;
		// work_data.chapter_list.truncate(chapter_NO);
	}

	// 分析所有數字後的非數字，猜測章節的單位。
	function guess_chapter_unit(title_list) {
		var units = Object.create(null), PATTERN = /\d+([^\d])/g, matched;
		title_list.forEach(function(title) {
			title = library_namespace.from_Chinese_numeral(title);
			while (matched = PATTERN.exec(title)) {
				if (!(matched[1] in units))
					units[matched[1]] = Object.create(null);
				units[matched[1]][matched[0]] = null;
			}
		});

		var unit, count = 0;
		Object.keys(units)
		// using array.reduce()
		.forEach(function(_unit) {
			var _count = Object.keys(units[_unit]).length;
			if (count < _count) {
				count = _count;
				unit = _unit;
			}
		});
		return unit;
	}
	/**
	 * 依章節標題來決定章節編號。 本函數將會改變 chapter_data.chapter_NO ！
	 * 
	 * @param {Object|Array}chapter_data
	 *            chapter_data or work_data
	 * @param {Natural}default_NO
	 *            default chapter NO
	 * 
	 * @returns {Natural}章節編號 chapter NO
	 * 
	 * @see parse_chapter_data() @ ck101.js
	 */
	function set_chapter_NO_via_title(chapter_data, default_NO, default_unit) {
		function get_title(chapter_data) {
			return library_namespace.is_Object(chapter_data) ? chapter_data.title
					: chapter_data;
		}

		if (Array.isArray(chapter_data.chapter_list)) {
			// assert: `chapter_data` is work data
			confirm_recheck
					.call(this, chapter_data,
					// gettext_config:{"id":"this-section-determines-the-chapter-number-according-to-the-chapter-title.-it-is-recommended-to-set-recheck=multi_parts_changed-option-to-avoid-a-missed-situation-when-downloading-multiple-times"}
					'本作依章節標題來決定章節編號；建議設置 recheck=multi_parts_changed 選項來避免多次下載時，遇上缺話的情況。');
			// input sorted work_data, use work_data.chapter_list
			// latest_chapter_NO, start NO
			default_NO |= 0;
			if (!default_unit && chapter_data.chapter_list.length > 1
			//
			&& library_namespace.from_Chinese_numeral) {
				default_unit = guess_chapter_unit(chapter_data.chapter_list
						.map(get_title));
			}
			chapter_data.chapter_list.forEach(function(chapter_data) {
				var chapter_NO = this.set_chapter_NO_via_title(chapter_data,
						++default_NO);
				// + 1: 可能有 1 → 1.5
				if (default_NO > chapter_NO + 1) {
					library_namespace.warn({
						// gettext_config:{"id":"in-the-case-of-«$1»-the-chapter-number-is-inverted-$2"}
						T : [ '《%1》出現章節編號倒置的情況：%2', chapter_data.title,
						// 逆轉 回退倒置 倒退
						default_NO + ' → ' + chapter_NO ]
					});
				}
				default_NO = chapter_NO;
			}, this);
			return;
		}

		// 處理單一章節。
		// chapter_data={title:'',chapter_NO:1}

		// console.log(chapter_data);
		var title = get_title(chapter_data);
		if (default_unit !== '季') {
			title = title.replace(/四季/g, '');
		}

		if (library_namespace.from_Chinese_numeral) {
			// for youngaceup.js, 黄昏メアレス -魔法使いと黒猫のウィズ Chronicle-
			title = library_namespace.from_Chinese_numeral(title).toString();
			// TODO: 只對所有章節皆能轉成 /^[\d+]$/ 者才如此處理。
		}

		// 因為中間的章節可能已經被下架，因此依章節標題來定章節編號。
		// \d{1,4}: e.g., http://www.moae.jp/comic/otonanosonnayatsu
		var matched = title.match(/(?:^|第 ?)(\d{1,4}(?:\.\d)?) ?話/) || title
		// #1, Episode 1, act 1
		.match(/^(?:[＃#] *|(?:Episode|act)[ .:]*)?(\d{1,3})(?:$|[ .\-])/i)
		// 章節編號有prefix，或放在末尾。 e.g., 乙ゲーにトリップした俺♂, たすけてまおうさま @ pixivコミック
		// e.g., へるぷ22, チャプター24後編
		|| title.match(/^[^\d]+(\d{1,2})(?:$|[^\d])/)
		// 1限目
		|| title.match(/^(\d{1,2}) ?限目/);
		if (matched) {
			// 可能有第0話。
			if (library_namespace.is_Object(chapter_data))
				chapter_data.chapter_NO = default_NO = matched[1] | 0;
			return default_NO;
		}

		// TODO: 神落しの鬼 @ pixivコミック: ニノ巻
		// TODO: 特別編その2

		library_namespace.warn([ {
			// gettext_config:{"id":"cannot-determine-chapter-no-from-title-«$1»"}
			T : title ? [ '無法從章節標題《%1》判斷章節序號。', title ] : [
			// gettext_config:{"id":"cannot-determine-chapter-no-from-chapter-data-$1"}
			'無法從章節資料判斷章節序號：%1。', JSON.stringify(chapter_data) ]
		}, default_NO >= 0 ? {
			// gettext_config:{"id":"set-the-chapter-no-to-$1-according-to-the-chapter-order"}
			T : [ '依序將章節序號設定為 %1。', default_NO ]
		} : '' ]);
		if (library_namespace.is_Object(chapter_data) && default_NO >= 0)
			chapter_data.chapter_NO = default_NO;
		return default_NO;
	}
	// should be called by get_data() or this.pre_parse_chapter_data()
	// this.get_chapter_directory_name(work_data, chapter_NO);
	// this.get_chapter_directory_name(work_data, chapter_NO, chapter_data);
	// this.get_chapter_directory_name(work_data, chapter_NO, chapter_title);
	function get_chapter_directory_name(work_data, chapter_NO, chapter_data,
			no_part) {
		if (typeof chapter_data === 'boolean' && no_part === undefined) {
			// this.get_chapter_directory_name(work_data, chapter_NO, no_part);
			// shift arguments
			no_part = chapter_data;
			chapter_data = null;
		}

		var part, chapter_title;

		if (typeof chapter_data === 'string') {
			// treat chapter_data as chapter_title.
			chapter_title = work_data;

		} else if (library_namespace.is_Object(chapter_data)
				|| Array.isArray(work_data.chapter_list)
				&& library_namespace
						.is_Object(chapter_data = work_data.chapter_list[chapter_NO - 1])) {
			// console.trace(chapter_data);

			if (!('add_part_NO' in work_data.chapter_list)) {
				// 自動設定是否包含分部號碼。
				// 漫畫目錄名稱不須包含分部號碼。使章節目錄名稱不包含 part_NO。
				work_data.chapter_list.add_part_NO = !!this.need_create_ebook;
			}

			if (chapter_data.part_title
					&& work_data.chapter_list.add_part_NO !== false
					&& !(work_data.chapter_list.part_NO >= 1)) {
				// console.trace(chapter_data);
				console.trace(work_data.chapter_list.add_part_NO);
				library_namespace
						.warn({
							T : [
									// gettext_config:{"id":"the-tool-file-has-set-part_title-$1-but-it-seems-that-the-`work_data.chapter_list.part_no`?-(part_no-$2)-should-be-set"}
									'工具檔設定了 part_title %1，卻似乎未設定應設定的 `work_data.chapter_list.part_NO`? (part_NO: %2)',
									JSON.stringify(chapter_data.part_title),
									JSON
											.stringify(work_data.chapter_list.part_NO) ]
						});
			}

			if (false) {
				console.log(chapter_data);
				console.log([ no_part, chapter_data.part_title,
						work_data.chapter_list.part_NO, this.add_part ]);
				throw new Error('detect parts');
			}
			if (!no_part && chapter_data.part_title
			//
			&& (Array.isArray(work_data.chapter_list)
			// 當只有一個 part (分部) 的時候，預設不會添上 part 標題，除非設定了 this.add_part。
			&& work_data.chapter_list.part_NO > 1 || this.add_part)) {
				confirm_recheck
						.call(this, work_data,
						// gettext_config:{"id":"this-work-has-a-different-part.-it-is-recommended-to-set-recheck=multi_parts_changed-option-to-avoid-a-missed-situation-when-downloading-multiple-times"}
						'本作存有不同的 part；建議設置 recheck=multi_parts_changed 選項來避免多次下載時，遇上缺話的情況。');
				part = chapter_data.NO_in_part | 0;
				if (part >= 1) {
					chapter_NO = part;
				}

				part = (work_data.chapter_list.add_part_NO !== false
				// work_data.chapter_list.add_part_NO === false:
				// 漫畫目錄名稱不須包含分部號碼。使章節目錄名稱不包含 part_NO。
				&& chapter_data.part_NO >= 1 ? chapter_data.part_NO.pad(2)
				// 小說才有第一部第二部之分，漫畫分部不會有號碼(part_NO)，因此去掉漫畫目錄名稱名稱之號碼標示。
				// "01 单话 0001 第371回" → "单话 0001 第371回"
				+ ' ' : '') + chapter_data.part_title + ' ';
				part = part.trimStart();
			}
			chapter_title = chapter_data.chapter_title || chapter_data.title;

		} else {
			this.onerror('get_chapter_directory_name: '
					// gettext_config:{"id":"invalid-chapter_data-$1"}
					+ gettext('Invalid chapter_data: %1', work_data.id + ' §'
							+ chapter_NO), work_data);
			typeof callback === 'function' && callback(work_data);
			return Work_crawler.THROWED;
		}

		// assert: !chapter_data || !!chapter_data.title === true
		chapter_title = chapter_title ? chapter_title.trim() : '';

		var chapter_directory_name = (part || '')
		// 檔名 NO 的基本長度（不足補零）。以 chapter_data.chapter_NO 可自定章節編號。
		+ (chapter_data && chapter_data.chapter_NO || chapter_NO)
		// 一開始就該定一個不太需要改變的位數。
		// 即使是小說，很少達到10000個章節。
		.pad(/* work_data.chapter_NO_pad_digits || */4)
		//
		+ (chapter_title ? ' '
		// 把網頁編碼還原成看得懂的文字。 crawler_namespace.get_label()
		+ library_namespace.HTML_to_Unicode(chapter_title) : '');

		chapter_directory_name = library_namespace
				.to_file_name(chapter_directory_name);
		return chapter_directory_name;
	}

	// @inner
	function get_chapter_data(work_data, chapter_NO, callback) {
		function get_chapter_URL() {
			var chapter_URL = _this.chapter_URL(work_data, chapter_NO);
			// console.trace(work_data);
			// console.log('chapter_URL: ' + chapter_URL);
			if (chapter_URL !== Work_crawler.SKIP_THIS_CHAPTER) {
				chapter_URL = chapter_URL && _this.full_URL(chapter_URL);
			}
			// console.log('chapter_URL: ' + chapter_URL);
			return chapter_URL;
		}

		var _this = this,
		// left: remaining chapter count
		left, image_list, waiting, chapter_label,
		//
		chapter_directory, images_archive, chapter_page_file_name,
		//
		chapter_URL;

		try {
			chapter_URL = get_chapter_URL();
			if (chapter_URL === Work_crawler.SKIP_THIS_CHAPTER) {
				typeof callback === 'function' && callback(work_data);
				return;
			}
			if (!chapter_URL && !_this.skip_get_chapter_page) {
				// gettext_config:{"id":"unable-to-receive-web-address-of-§$1"}
				throw gettext('無法取得 §%1 的網址。', chapter_NO);
			}
		} catch (e) {
			// e.g., qq.js
			_this.onerror(e, work_data);
			typeof callback === 'function' && callback(work_data);
			return Work_crawler.THROWED;
		}

		library_namespace.debug(work_data.id + ' ' + work_data.title + ' §'
				+ chapter_NO + '/' + work_data.chapter_count + ': '
				+ chapter_URL, 1, 'get_chapter_data');
		process.title = [
				chapter_NO,
				// '/', work_data.chapter_count,
				' @ ',
				work_data.title || work_data.id,
				Array.isArray(this.work_list_now)
						// 兩者皆必須為字串。
						&& typeof this.work_list_now[this.work_list_now.list_serial - 1] === 'string'
						&& typeof work_data.title === 'string'
						// .includes(): 可能經過一些變化而不完全一樣
						&& work_data.title
								.includes(this.work_list_now[this.work_list_now.list_serial - 1]
										.trim()) ? ' '
						+ this.work_list_now.list_serial + '/'
						+ this.work_list_now.length : '', ' @ ', this.id ]
				.join('');

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
			var estimated_message = _this.estimated_message(work_data,
					chapter_NO);
			library_namespace.log_temporary({
				T : [ estimated_message ?
				// gettext_config:{"id":"getting-data-of-chapter-$1-$2"}
				'Getting data of chapter %1, %2'
				// gettext_config:{"id":"getting-data-of-chapter-$1"}
				: 'Getting data of chapter %1', chapter_NO
				//
				+ (typeof _this.pre_chapter_URL === 'function' ? ''
				//
				: '/' + work_data.chapter_count), estimated_message ]
			});

			// default: 置於 work_data.directory 下。
			var chapter_file_name = work_data.directory
					+ work_data.directory_name + ' '
					+ chapter_NO.pad(work_data.chapter_NO_pad_digits || 3)
					+ '.' + Work_crawler.HTML_extension;

			function process_images(chapter_data, XMLHttp) {
				// get chapter label, will used as chapter directory name.
				chapter_label = _this.get_chapter_directory_name(work_data,
						chapter_NO, chapter_data, false);
				chapter_directory = work_data.directory + chapter_label;
				library_namespace.debug({
					// 先準備好章節目錄
					// gettext_config:{"id":"creating-a-chapter-directory-$1"}
					T : [ '先創建章節目錄：%1', chapter_directory ]
				}, 1, 'process_images');
				// console.log(chapter_directory);
				library_namespace.create_directory(chapter_directory);

				images_archive = work_data.directory + chapter_label + '.'
						+ _this.images_archive_extension;
				try {
					var images_archive_status = node_fs
							.statSync(images_archive);
					// console.log(images_archive_status);
					if (images_archive_status.mtime
							- work_data.last_file_modified_date > 0) {
						// 紀錄最後下載的圖片壓縮檔時間。
						work_data.last_file_modified_date = images_archive_status.mtime;
					}
				} catch (e) {
					// TODO: handle exception
				}
				images_archive = new library_namespace.storage.archive(
						images_archive);
				// cache
				Object.assign(images_archive, {
					base_directory : work_data.directory,
					file_name : chapter_label + '.'
							+ _this.images_archive_extension,
					work_directory : work_data.directory,
					to_remove : []
				});
				if (library_namespace
						.file_exists(images_archive.archive_file_path)) {
					if (library_namespace.platform.OS === 'darwin'
							&& images_archive.program_type === 'zip') {
						// In Max OS: 直接解開圖片壓縮檔以避免麻煩。
						// Max OS 中，壓縮檔內的檔案路徑包括了目錄名稱，行為表現與其他的應用程式不一致，因此不容易判別。
						// 另外 Max OS 中的壓縮程式缺乏了某些功能。
						library_namespace.log_temporary({
							// gettext_config:{"id":"extracting-image-files-$1"}
							T : [ '解開圖片壓縮檔：%1', images_archive.file_name ]
						});
						images_archive.extract({
							cwd : images_archive
						});
					} else {
						// detect if images archive file is existed.
						images_archive.file_existed = true;
						library_namespace.log_temporary({
							// gettext_config:{"id":"reading-image-archive-$1"}
							T : [ '讀取圖片壓縮檔：%1', images_archive.file_name ]
						});
						images_archive.info();
						if (false && typeof _this.check_images_archive === 'function')
							_this.check_images_archive(images_archive);
					}
				}
				chapter_directory = library_namespace
						.append_path_separator(chapter_directory);

				chapter_page_file_name = work_data.directory_name + '-'
						+ chapter_label + '.' + Work_crawler.HTML_extension;
				// 注意: 若是沒有 reget_chapter，則 preserve_chapter_page 不應發生效用。
				if (work_data.reget_chapter && _this.preserve_chapter_page) {
					node_fs.writeFileSync(chapter_directory
							+ chapter_page_file_name, XMLHttp.buffer);
				} else if (_this.preserve_chapter_page === false) {
					// 明確指定不保留，將刪除已存在的 chapter page。
					library_namespace.debug({
						// gettext_config:{"id":"deleting-image-from-chapter-$1"}
						T : [ '刪除章節內容頁面：%1', chapter_page_file_name ]
					}, 1, 'process_images');
					library_namespace.remove_file(chapter_directory
							+ chapter_page_file_name);
				}
				var message = [ {
					// gettext_config:{"id":"$1-$2-$3-images"}
					T : [ '%1 [%2] %3 {{PLURAL:%3|image|images}}.', chapter_NO
					//
					+ (typeof _this.pre_chapter_URL === 'function' ? ''
					//
					: '/' + work_data.chapter_count), chapter_label, left ]
				},
				// 例如需要收費/被鎖住的章節。 .locked 此章节为付费章节 本章为付费章节
				chapter_data.limited ? {
					// gettext_config:{"id":"(limited-access)"}
					T : '（本章為需要付費/被鎖住的章節）'
				} : '' ];
				if (chapter_data.limited) {
					// 針對特殊狀況提醒。
					library_namespace.info(message);
					if (!work_data.some_limited) {
						work_data.some_limited = true;
						crawler_namespace.set_work_status(work_data, 'limited');
					}
				} else {
					library_namespace.log(message);
				}

				// 正規化/初始化圖像資料
				// http://stackoverflow.com/questions/245840/rename-files-in-sub-directories
				// for /r %x in (*.jfif) do ren "%x" *.jpg
				function normalize_image_data(image_data, index) {
					// set image file path
					function image_file_path_of_chapter_NO(chapter_NO) {
						return chapter_directory
						//
						+ work_data.id + '-' + chapter_NO + '-'
						// 一開始就該定一個不太需要改變的位數。
						// 一個章節很少到1000張圖片。
						+ (index + 1).pad(3) + '.' + file_extension;
					}

					library_namespace.debug(chapter_label + ': ' + (index + 1)
							+ '/' + image_list.length, 6,
							'normalize_image_data');
					// console.log(image_data);
					if (!image_data) {
						// 若是沒有設定image_data，那麼就明確的給一個表示有錯誤的。
						return image_list[index] = {
						// 這兩個會在 function get_image() 裡面設定。
						// has_error : true,
						// done : true
						};
					}

					if (typeof image_data === 'string') {
						// image_data 會被用來記錄一些重要的資訊。
						// 若是沒回寫到原先的image_list，那麼將會失去這些資訊。
						image_list[index] = image_data = {
							url : image_data
						};

					}

					if (image_data.file) {
						// image_data.file: 指定圖片要儲存檔的檔名與路徑 file_path。
						// 已經設定過就不再設定 image_data.file。
						return image_data;
					}

					if (typeof image_data.file_name === 'function') {
						// return {String}file name
						image_data.file_name = image_data.file_name(work_data,
								chapter_NO, index);
					}
					if (image_data.file_name) {
						image_data.file = chapter_directory
								+ image_data.file_name;
						// 採用 image_data.file_name 來設定 image_data.file。
						return image_data;
					}

					var file_extension = image_data.file_extension
							|| work_data.image_extension;
					if (!file_extension && image_data.url) {
						// 由圖片的網址URL來判別可能的延伸檔名。
						var matched = image_data.url.replace(/[?#].*$/, '');
						matched = matched.match(/\.([a-z\d\-_]+)$/i);
						if (matched) {
							matched = matched[1].toLowerCase();
							if (matched in _this.image_types) {
								// e.g., manhuagui.js
								library_namespace.debug({
									T : [
											// gettext_config:{"id":"file-extension-$1"}
											'File extension: %1',
											'.' + matched + ' ← '
													+ image_data.url ]
								}, 3, 'get_data');
								file_extension = matched;
							}
						}
					}
					if (!file_extension) {
						// 猜不出的會採用預設的圖片延伸檔名/副檔名.default_image_extension。
						file_extension = _this.default_image_extension;
					}

					// 本來希望若之前沒有分部，現在卻增加了分部，那麼若資料夾中有舊的圖像檔案，可以直接改名。
					// 但由於增加分部之後，chapter_directory已經加上分部名稱，和原先沒有分部情況下資料夾名稱不同，因此抓不到原先的圖像檔案。
					// TODO: 重新命名舊的資料夾。
					var old_image_file_path = image_file_path_of_chapter_NO(chapter_NO),
					// 使圖片檔名中的章節編號等同於資料夾編號。
					// 注意：若是某個章節分成好幾部分，可能造成這些章節中的圖片檔名相同。
					using_chapter_NO = chapter_data.chapter_NO >= 1 ? chapter_data.chapter_NO
							: chapter_data.NO_in_part >= 1
									&& chapter_data.NO_in_part;
					if (using_chapter_NO && using_chapter_NO !== chapter_NO) {
						// 若有分部，則以部編號為主。
						image_data.file = image_file_path_of_chapter_NO(using_chapter_NO);

						// 假如之前已獲取過圖片檔案，就把舊圖片改名成新的名稱格式。
						// 例如之前沒有分部，現在卻增加了分部。
						if (!library_namespace.file_exists(image_data.file)
						// && old_image_file_path !==
						// image_data.file
						&& library_namespace.file_exists(old_image_file_path)) {
							library_namespace.move_file(old_image_file_path,
									image_data.file);
						}
					} else {
						image_data.file = old_image_file_path;
					}

					return image_data;
				}

				// console.log(image_list);
				// TODO: 當某 chapter 檔案過多(如1000)，將一次 request 過多 connects 而造成問題。
				if (!_this.one_by_one) {
					// 並行下載。
					image_list.forEach(function(image_data, index) {
						image_data = normalize_image_data(image_data, index);
						_this.get_image(image_data, check_if_done,
								images_archive);
					});
					library_namespace.debug({
						// gettext_config:{"id":"$1-the-work-has-been-dispatched-and-the-images-are-downloaded-in-parallel"}
						T : [ '%1：已派發完工作，開始並行下載各圖片。', chapter_label ]
					}, 3, 'get_data');
					waiting = true;
					return;
				}

				// 只有在 this.one_by_one===true 這個時候才會設定 image_list.index
				image_list.index = 0;
				var image_time_interval = _this.one_by_one !== true
						&& library_namespace.to_millisecond(_this.one_by_one),
				//
				get_next_image = function() {
					// assert: image_list.index < image_list.length
					library_namespace.log_temporary({
						T : [
						// gettext_config:{"id":"download-image-$1"}
						'下載圖 %1', (image_list.index + 1)
						//
						+ (_this.dynamical_count_images ? ''
						//
						: '/' + image_list.length) ]
					});
					var image_data = normalize_image_data(
							image_list[image_list.index], image_list.index);
					if (image_time_interval > 0)
						image_data.time_interval = image_time_interval;
					_this.get_image(image_data, function(image_data, status) {
						check_if_done(image_data, status);

						// 添加計數器
						if (!(++image_list.index < image_list.length)) {
							return;
						}

						if (!(image_time_interval > 0)
						// 沒有實際下載動作時，就不用等待了。
						|| status === 'image_downloaded'
								|| status === 'invalid_data') {
							get_next_image();
							return;
						}

						library_namespace.log_temporary([ 'process_images: ', {
							// gettext_config:{"id":"waiting-for-$1-before-downloading-the-$2-image"}
							T : [ '下载第 %2 張{{PLURAL:%2|圖片}}前先等待 %1。',
							//
							library_namespace.age_of(0, image_time_interval, {
								digits : 1
							}), image_list.index + '/' + image_list.length ]
						} ]);
						setTimeout(get_next_image, image_time_interval);
					}, images_archive);
				};
				get_next_image();
			}

			function process_chapter_data(XMLHttp, error) {
				XMLHttp = XMLHttp || Object.create(null);
				if (/(?:\.html?|\/)$/.test(XMLHttp.responseURL)) {
					_this.setup_value('Referer', XMLHttp.responseURL.replace(
					// 因為隱私問題？有些瀏覽器似乎會隱藏網址，只要輸入host即可？
					/(:\/\/[^/]+\/).+/, '$1'));
				}
				var html = XMLHttp.responseText;
				if (!html
						&& !_this.skip_get_chapter_page
						&& (!_this.skip_error || get_data.error_count < _this.MAX_ERROR_RETRY)) {
					library_namespace.error((work_data.title || work_data.id)
					//
					+ ': '
					// work_data.chapter_unit || _this.chapter_unit
					// gettext_config:{"id":"failed-to-get-data-of-chapter-$1"}
					+ gettext('無法取得第 %1 章的內容。', chapter_NO));
					if (get_data.error_count === _this.MAX_ERROR_RETRY) {
						if (_this.skip_chapter_data_error) {
							library_namespace.warn('process_chapter_data: '
							// Skip this chapter if do not need throw
							// gettext_config:{"id":"skip-$1-§$2-and-continue-next-chapter"}
							+ gettext('跳過 %1 §%2 並接著下載下一章。',
							//
							work_data.title, chapter_NO));
							check_if_done();
							return;
						}
						// gettext_config:{"id":"message_need_re_download"}
						_this.onerror(gettext('MESSAGE_NEED_RE_DOWNLOAD'),
								work_data);
						typeof callback === 'function' && callback(work_data);
						return Work_crawler.THROWED;
					}
					get_data.error_count = (get_data.error_count | 0) + 1;
					library_namespace.log([ 'process_chapter_data: ', {
						// gettext_config:{"id":"retry-$1-$2"}
						T : [ 'Retry %1/%2',
						//
						get_data.error_count, _this.MAX_ERROR_RETRY ]
					}, '...' ]);
					if (!work_data.reget_chapter) {
						library_namespace
								.warn({
									// gettext_config:{"id":"since-the-cache-file-is-broken-(for-example-an-empty-file)-chapter_url-will-be-retrieved-and-.reget_chapter-will-be-set"}
									T : '因快取檔案壞了（例如為空檔案），將重新取得 chapter_URL，設定 .reget_chapter。'
								});
						work_data.reget_chapter = true;
					}
					get_data();
					return;
				}

				var chapter_data;
				if (_this.check_chapter_NO) {
					chapter_data = Array.isArray(_this.check_chapter_NO)
					// 檢測所獲得內容的章節編號是否相符。
					? html.between(_this.check_chapter_NO[0],
							_this.check_chapter_NO[1])
					// extract chapter_data. TODO: allow return {Promise}
					// {Function}return chapter NO is OK
					: _this.check_chapter_NO(html);
					var chapter_NO_text = null;
					if (typeof chapter_data !== 'boolean') {
						chapter_NO_text
						//
						= crawler_namespace.get_label(chapter_data);
						chapter_data = chapter_NO_text == chapter_NO
								// for yomou only
								|| (chapter_NO_text === '' || chapter_NO_text === undefined)
								&& work_data.status
								&& work_data.status.includes('短編')
					}
					if (!chapter_data) {
						// library_namespace.warn(html);
						library_namespace.warn(work_data.status);
						_this.onerror(new Error(_this.id
								+ ': '
								+ gettext(chapter_NO_text === null
								// gettext_config:{"id":"the-chapter-number-should-be-$1-in-order-but-the-number-cannot-be-obtained-from-the-chapter-content"}
								? '章節編號依序應為 %1，但無法自章節內容取得編號。'
								// gettext_config:{"id":"the-chapter-numbers-are-inconsistent-the-order-should-be-$1-but-the-$2-is-taken-from-the-content"}
								: '章節編號不一致：依序應為 %1，但從內容擷取出 %2。', chapter_NO,
										JSON.stringify(chapter_NO_text))),
								work_data);
						typeof callback === 'function' && callback(work_data);
						return Work_crawler.THROWED;
					}
				}

				try {
					// image_data.url 的正確設定方法:
					// = base_URL + encodeURI(CeL.HTML_to_Unicode(url))

					// 解析出章節資料。
					chapter_data = _this.parse_chapter_data
							&& _this.parse_chapter_data(html, work_data,
									crawler_namespace.get_label, chapter_NO)
							// e.g., 已在 this.pre_parse_chapter_data() 設定完
							// {Array}chapter_data.image_list
							|| Array.isArray(work_data.chapter_list)
							// default chapter_data
							&& work_data.chapter_list[chapter_NO - 1];

					if (chapter_data === _this.REGET_PAGE) {
						// 當重新讀取章節內容的時候，可以改變網址。

						// 需要重新讀取頁面。e.g., 502
						var old_chapter_URL = chapter_URL;
						chapter_URL = get_chapter_URL();
						var chapter_time_interval = _this
								.get_chapter_time_interval(chapter_URL,
										work_data);
						var message = old_chapter_URL === chapter_URL
						// 等待幾秒鐘 以重新獲取章節內容頁面網址
						// gettext_config:{"id":"waiting-for-$2-and-re-obtaining-the-chapter-content-page-$1"}
						? chapter_time_interval > 0 ? '等待 %2 之後再重新取得章節內容頁面：%1'
						// gettext_config:{"id":"re-acquiring-chapter-content-page-$1"}
						: '重新取得章節內容頁面：%1'
						// gettext_config:{"id":"waiting-for-$2-and-then-get-the-chapter-content-page-$1"}
						: chapter_time_interval > 0 ? '等待 %2 之後再取得章節內容頁面：%1'
						// gettext_config:{"id":"get-the-chapter-content-page-$1"}
						: '取得章節內容頁面：%1';
						library_namespace.log_temporary([
						//
						'process_chapter_data: ', {
							T : [ message,
							// TODO: for Array.isArray(chapter_URL)
							chapter_URL, library_namespace.age_of(0,
							//
							chapter_time_interval, {
								digits : 1
							}) ]
						} ]);
						if (chapter_time_interval > 0) {
							setTimeout(reget_chapter_data,
									chapter_time_interval);
						} else {
							reget_chapter_data();
						}
						return;
					}

					if (!chapter_data && Array.isArray(work_data.chapter_list)) {
						// 照理來說多少應該要有資訊，因此不應用 `this.skip_error` 跳過。
						// gettext_config:{"id":"parse-out-empty-page-information"}
						throw gettext('解析出空的頁面資訊！');
					}

				} catch (e) {
					library_namespace.error([ _this.id + ': ', {
						// gettext_config:{"id":"an-error-occurred-while-parsing-the-chapter-page-it-is-interrupted-at-$1"}
						T : [ '解析章節頁面時發生錯誤，中斷跳出：%1',
						//
						(Array.isArray(chapter_URL) ? chapter_URL[0]
						//
						: chapter_URL) ]
					} ]);
					// console.trace(e);
					_this.onerror(e, work_data);
					typeof callback === 'function' && callback(work_data);
					return Work_crawler.THROWED;
				}

				var test_limited_image_url
				//
				= typeof _this.is_limited_image_url === 'function'
				//
				&& Array.isArray(chapter_data.image_list)
				// this.is_limited_image_url(image_url, image_data)
				&& function(image_data) {
					if (!image_data)
						return true;
					var image_url = image_data.url || image_data;
					return _this.is_limited_image_url(image_url, image_data);
				};
				if (test_limited_image_url
				// 處理特殊圖片: 遇到下架章節時會顯示特殊圖片。避免下載到下架圖片。
				&& chapter_data.image_list.some(test_limited_image_url)) {
					// e.g., taduo.js 因为版权或其他问题，我们将对所有章节进行屏蔽！
					chapter_data.limited = true;
					if (chapter_data.image_list.every(test_limited_image_url)) {
						// 所有圖片皆為 limited image。
						// chapter_data.image_length =
						// chapter_data.image_list.length;
						delete chapter_data.image_list;
					}
				}

				// console.log(JSON.stringify(chapter_data));
				if (!(image_list = chapter_data.image_list)
				//
				|| !((left = chapter_data.image_count) >= 1)
				//
				&& !((left = image_list.length) >= 1)) {
					if (!_this.need_create_ebook
					// 雖然是漫畫，但是本章節沒有獲取到任何圖片時的警告。
					&& (!chapter_data || !chapter_data.limited
					// 圖片檔案會用其他方式手動下載。 .allow_blanking_chapter
					&& !chapter_data.images_downloaded)) {
						if (!chapter_data.limited) {
							// console.log(chapter_data);
						}
						// gettext_config:{"id":"this-chapter-is-a-chapter-that-requires-payment-locking"}
						var message = gettext(chapter_data.limited ? '本章為需要付費/被鎖住的章節。'
								// gettext_config:{"id":"did-not-get-any-image-from-this-chapter"}
								: '本章節沒有獲取到任何圖片！');
						_this.onwarning('process_chapter_data: '
								+ work_data.directory_name + ' §' + chapter_NO
								+ '/' + work_data.chapter_count + ': '
								+ message);
						// console.log(chapter_data);
						crawler_namespace.set_work_status(work_data, '§'
								+ chapter_NO + ': ' + message);
					}
					// 注意: 若是沒有 reget_chapter，則 preserve_chapter_page 不應發生效用。
					if (work_data.reget_chapter && _this.preserve_chapter_page) {
						node_fs.writeFileSync(
						// 依然儲存cache。例如小說網站，只有章節文字內容，沒有圖檔。
						chapter_file_name, XMLHttp.buffer);
					} else if (_this.preserve_chapter_page === false) {
						// 明確指定不保留，將刪除已存在的 chapter page。
						library_namespace.debug({
							// gettext_config:{"id":"deleting-image-from-chapter-$1"}
							T : [ '刪除章節內容頁面：%1', chapter_file_name ]
						}, 1, 'process_chapter_data');
						library_namespace.remove_file(chapter_file_name);
					}

					// 模擬已經下載完最後一張圖。
					left = 1;
					check_if_done();
					return;
				}

				// console.log(chapter_data);
				if (left !== image_list.length) {
					library_namespace.error({
						// gettext_config:{"id":"the-number-of-registered-images-$1-is-different-from-the-length-of-the-images-list-$2"}
						T : [ '所登記的圖形數量%1與有圖形列表長度%2不同！', left,
								image_list.length ]
					});
					if (left > image_list.length) {
						left = image_list.length;
					}
				}
				if (false && !_this.one_by_one) {
					// 當一次下載上百張相片的時候，就改成一個個下載圖像。
					_this.one_by_one = left > 100;
				}

				if (work_data.image_count >= 0) {
					work_data.image_count += left;
				}

				if (typeof chapter_data === 'object'
						&& Array.isArray(work_data.chapter_list)
						&& library_namespace
								.is_Object(work_data.chapter_list[chapter_NO - 1])
						&& chapter_data !== work_data.chapter_list[chapter_NO - 1]) {
					if (false) {
						// 自動引用舊的章節資訊。
						chapter_data = Object.assign(
								work_data.chapter_list[chapter_NO - 1],
								chapter_data);
					} else {
						// 自動填補章節名稱。
						if (!chapter_data.title) {
							chapter_data.title = work_data.chapter_list[chapter_NO - 1].title;
						}
						if (!chapter_data.part_title
								&& (work_data.chapter_list.part_title || work_data.chapter_list[chapter_NO - 1].part_title)) {
							library_namespace
									.warn({
										// gettext_config:{"id":"the-original-chapter-data-have-sets-a-division-title-but-the-chapter-data-returned-by-.parse_chapter_data()-is-missing-the-division-title.-perhaps-you-can-use-the-original-chapter-data"}
										T : '原先的章節資料設定了分部標題，但 .parse_chapter_data() 傳回的章節資料缺少了分部標題。或許您可以沿用原先的章節資料。'
									});
							// e.g.,
							if (false) {
								chapter_data = Object.assign(
										work_data.chapter_list[chapter_NO - 1],
										chapter_data);
							}
						}
					}
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

			function pre_parse_chapter_data(XMLHttp, error) {
				_this.set_chapter_time_interval(XMLHttp);

				// 對於每一張圖片都得要從載入的頁面獲得資訊的情況，可以參考 hhcool.js, dm5.js。

				if (typeof _this.pre_parse_chapter_data === 'function') {
					// XMLHttp.error = XMLHttp.error || error;

					// 執行在解析章節資料 process_chapter_data() 之前的作業 (async)。
					// 必須自行保證執行 callback()，不丟出異常、中斷。
					_this.pre_parse_chapter_data(XMLHttp, work_data,
					// pre_parse_chapter_data:function(XMLHttp,work_data,callback,chapter_NO){;callback();},
					function(new_XMLHttp, new_error) {
						if (new_XMLHttp) {
							// XMLHttp: 經過 this.pre_parse_chapter_data() 取得了新資源。
							process_chapter_data(new_XMLHttp, new_error);
						} else {
							// 沒新資源，直接使用舊的。
							process_chapter_data(XMLHttp, error);
						}
					}, chapter_NO);
				} else {
					process_chapter_data(XMLHttp, error);
				}
			}

			function reget_chapter_data() {
				if (false && typeof chapter_URL !== 'string') {
					console.log(chapter_URL);
				}
				if (_this.skip_get_chapter_page) {
					pre_parse_chapter_data(crawler_namespace.null_XMLHttp);
					return;
				}
				// library_namespace.info('reget_chapter_data: ' + chapter_URL);
				if (Array.isArray(chapter_URL)) {
					chapter_URL[2] = Object.assign({
						error_retry : _this.MAX_ERROR_RETRY
					}, chapter_URL[2]);
				} else {
					chapter_URL = [ chapter_URL, null, true ];
				}

				_this.get_URL(chapter_URL, pre_parse_chapter_data);
			}

			// console.trace(_this);
			// console.trace(work_data);
			if (work_data.reget_chapter) {
				reget_chapter_data();

			} else {
				// @see function get_work_page() @
				// CeL.application.net.work_crawler.work

				// 警告: reget_chapter=false 僅適用於小說之類不下載/獲取圖片的情形，
				// 因為若有圖片（parse_chapter_data()會回傳chapter_data.image_list），將把chapter_page寫入僅能從chapter_URL獲取名稱的於目錄中。
				library_namespace.get_URL_cache(chapter_URL, function(data,
						error, XMLHttp) {
					// console.trace(XMLHttp, error);
					pre_parse_chapter_data(XMLHttp, error);
				}, {
					no_write_info : true,
					file_name : chapter_file_name,
					encoding : undefined,
					charset : _this.charset,
					get_URL_options : _this.get_URL_options,
					simulate_XMLHttpRequest_response : true
				});
			}
		}
		get_data();

		// image_data: latest_image_data
		function check_if_done(image_data, status) {
			if (_this.write_image_metadata
			// 將每張圖片的資訊寫入同名(添加.json延伸檔名)的JSON檔。
			&& library_namespace.file_exists(image_data.file)) {
				var chapter_data = Array.isArray(work_data.chapter_list)
						&& work_data.chapter_list[chapter_NO - 1],
				//
				metadata = Object.assign(Object.create(null), work_data,
						chapter_data, image_data);
				delete metadata.chapter_list;
				library_namespace.write_file(image_data.file + '.json',
						metadata);
			}

			--left;

			if (typeof _this.after_get_image === 'function') {
				// 每張圖片下載結束都會執行一次。圖片預處理請用 .image_preprocessor()
				// var latest_image_data = image_list[image_list.index];
				// using: image_data
				_this.after_get_image(image_list, work_data, chapter_NO);
			}

			// this.dynamical_count_images: 設定動態改變章節中的圖片數量。
			// Dynamically change the number of pictures in the chapter.
			// 只有在 this.one_by_one===true 時才會設定 image_list.index，
			// 因此只在設定了.one_by_one 的時候才有作用，否則就算改變 image_list 也已經來不及處理。
			if (_this.one_by_one && _this.dynamical_count_images) {
				left = image_list.length - image_list.index - 1;
			} else if (Array.isArray(image_list) && image_list.length > 1) {
				if (library_namespace.is_debug(3)) {
					library_namespace.debug([ chapter_label + ': ', {
						// gettext_config:{"id":"$1-image(s)-left"}
						T : [ '剩 %1 張{{PLURAL:%1|圖}}...', left ]
					} ], 3, 'check_if_done');
				} else {
					library_namespace.log_temporary({
						// gettext_config:{"id":"$1-image(s)-left"}
						T : [ '剩 %1 張{{PLURAL:%1|圖}}...', left ]
					});
				}
			}
			// console.log('check_if_done: left: ' + left);

			// 須注意若是最後一張圖 get_image()直接 return 了，
			// 此時尚未設定 waiting，因此此處不可以 waiting 判斷！
			if (left > 0) {
				// 還有/等待尚未下載/獲取的圖片檔案。
				if (waiting && left < 2) {
					library_namespace.debug([ {
						// gettext_config:{"id":"waiting-for-the-image-file-that-has-not-been-downloaded-yet"}
						T : '等待尚未下載完成的圖片檔案：'
					}, '\n' + image_list.filter(function(image_data) {
						return !image_data.done;
					}).map(function(image_data) {
						return image_data.url + '\n→ ' + image_data.file;
					}) ]);
				}
				return;
			}
			// assert: left===0

			// 已下載完本 chapter。

			// 紀錄最後下載的章節計數。
			work_data.last_download.chapter = work_data.start_chapter_NO_next_time >= 0
			// `work_data.start_chapter_NO_next_time` 為本次執行時設定的 chapter_NO。
			// cf. work_data.jump_to_chapter
			? work_data.start_chapter_NO_next_time : chapter_NO;

			// 欲限制/指定下次下載的 chapter_NO，可使用
			// work_data.chapter_list.truncate(chapter_NO);

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
					if (_this.recheck && error_log_file_backup
					//
					&& library_namespace.file_exists(error_log_file_backup)) {
						// 當從頭開始檢查時，重新設定錯誤記錄檔案。
						library_namespace.move_file(error_log_file,
								error_log_file_backup);
						// 移動完之後註銷檔案名稱以防被覆寫。
						_this.error_log_file_backup = null;
					}
					node_fs.appendFileSync(error_log_file,
					// 產生錯誤紀錄檔。
					error_file_logs.join(library_namespace.env.line_separator));
					crawler_namespace.set_work_status(work_data, gettext(
					// gettext_config:{"id":"$1-$2-image-download-error-recorded"}
					'%1：%2筆{{PLURAL:%2|圖片}}下載錯誤紀錄', chapter_label,
							error_file_logs.length));
				}
			}

			if (_this.archive_images && images_archive
			//
			&& Array.isArray(image_list)
			// 完全沒有出現錯誤才壓縮圖片檔案。
			&& (!_this.archive_all_good_images_only
			//
			|| !image_list.some(function(image_data) {
				return image_data.has_error;
			}))) {
				if (images_archive.to_remove.length > 0) {
					library_namespace.log_temporary({
						T : [
						// gettext_config:{"id":"remove-$1-damaged-images-from-the-image-compression-file-that-successfully-downloaded-this-time-$2"}
						'從圖片壓縮檔刪除%1張本次下載成功、上次下載失敗的損壞圖片：%2',
						//
						images_archive.to_remove.length,
						// images_archive.archive_file_path
						images_archive.file_name ]
					});
					images_archive.remove(images_archive.to_remove.unique());
				}

				var chapter_files = library_namespace
						.read_directory(chapter_directory);
				if (!chapter_files) {
					// e.g., 未設定 this.preserve_chapter_page
				} else if (chapter_files.length === 0
						|| chapter_files.length === 1
						&& chapter_files[0] === chapter_page_file_name) {
					// 只剩下 chapter_page 的時候不再 update，避免磁碟作無用讀取。
					if (chapter_files.length === 1) {
						library_namespace.remove_file(chapter_directory
								+ chapter_page_file_name);
					}
					library_namespace.remove_directory(chapter_directory);
				} else {
					library_namespace.log_temporary({
						// create/update image archive: 漫畫下載完畢後壓縮圖片檔案。
						T : [ images_archive.file_existed
						// gettext_config:{"id":"update-image-archive-$1"}
						? '更新圖片壓縮檔：%1'
						// gettext_config:{"id":"create-image-archive-$1"}
						: '創建圖片壓縮檔：%1',
						// images_archive.archive_file_path
						images_archive.file_name ]
					});
					images_archive.update(chapter_directory, {
						// 壓縮圖片檔案之後，刪掉原先的圖片檔案。
						remove : _this.remove_images_after_archive,
						recurse : true
					});
					// 紀錄最後下載的圖片壓縮檔時間。
					work_data.last_file_modified_date = new Date;
				}

				if (_this.write_chapter_metadata && library_namespace
				// 將每個章節壓縮檔的資訊寫入同名(添加.json延伸檔名)的JSON檔。
				.file_exists(images_archive.archive_file_path)) {
					var chapter_data = Array.isArray(work_data.chapter_list)
							&& work_data.chapter_list[chapter_NO - 1],
					//
					metadata = Object.assign(Object.create(null), work_data,
							chapter_data);
					delete metadata.chapter_list;
					library_namespace.write_file(
							images_archive.archive_file_path + '.json',
							metadata);
				}
			}

			continue_next_chapter.call(_this, work_data, chapter_NO, callback);
		}
	}

	// @inner
	function continue_next_chapter(work_data, chapter_NO, callback) {
		// 這邊不紀錄最後下載的章節數 work_data.last_download.chapter。
		// 因為可能是 crawler_namespace.pre_get_chapter_data() 篩選排除之後直接被呼叫的。
		// 假如是因篩選排除的，可能有些章節沒有下載到，因此下一次下載的時候應該重新檢查。

		// 紀錄最後成功下載章節或者圖片日期。
		work_data.last_saved = (new Date).toISOString();
		// 紀錄已下載完之 chapter。
		this.save_work_data(work_data, 'continue_next_chapter');

		if (typeof this.after_download_chapter === 'function') {
			this.after_download_chapter(work_data, chapter_NO);
		}

		// 增加章節計數，準備下載下一個章節。
		chapter_NO = crawler_namespace.get_next_chapter_NO_item(work_data,
				chapter_NO + 1);

		// 欲直接跳過本作品，可設定：
		// <code>work_data.jump_to_chapter = work_data.chapter_count + 1;</code>
		if (work_data.jump_to_chapter >= 0) {
			// cf. work_data.start_chapter_NO_next_time
			if (work_data.jump_to_chapter !== chapter_NO) {
				// work_data.jump_to_chapter 可用來手動設定下一個要獲取的章節號碼。
				// 一次性的設定跳到指定的章節。
				library_namespace.info({
					// gettext_config:{"id":"$2-jump-to-chapter-$1"}
					T : [ '%2: jump to chapter %1',
							work_data.jump_to_chapter + ' ← ' + chapter_NO,
							work_data.title ]
				});
				chapter_NO = work_data.jump_to_chapter;
			}
			delete work_data.jump_to_chapter;
		}

		if (chapter_NO > work_data.chapter_count) {
			if (Array.isArray(work_data.chapter_list)
					&& work_data.chapter_list.length === work_data.chapter_count + 1) {
				library_namespace.warn(
				// gettext_config:{"id":"if-you-want-to-dynamically-add-chapters-you-must-manually-increase-the-number-of-chapters-work_data.chapter_count++"}
				'若欲動態增加章節，必須手動增加章節數量: work_data.chapter_count++！');
			}

			library_namespace.log([ this.id + ': ' + work_data.directory_name
			// 增加章節數量的訊息。
			+ ': ' + (Array.isArray(work_data.download_chapter_NO_list)
			//
			? work_data.download_chapter_NO_list.length + '/' : '')
			//
			+ work_data.chapter_count
			//
			+ ' ' + (work_data.chapter_unit || this.chapter_unit),
			// 增加字數統計的訊息。
			work_data.words_so_far > 0 ? {
				// gettext_config:{"id":"(this-download-has-processed-a-total-of-$1-word)"}
				T : [ '（本次下載共處理 %1個{{PLURAL:%1|字}}）', work_data.words_so_far ]
			} : '',
			// 增加漫畫圖片數量的統計訊息。
			work_data.image_count > 0 ? {
				// gettext_config:{"id":"(this-download-has-processed-a-total-of-$1-image)"}
				T : [ '（本次下載共處理 %1張{{PLURAL:%1|圖}}）', work_data.image_count ]
			} : '', {
				// gettext_config:{"id":"download-completed-for-$1"}
				T : [ '於 %1 下載完畢。',
				//
				(new Date).format('%Y/%m/%d %H:%M:%S') ]
			}, work_data.some_limited ? {
				// gettext_config:{"id":"some-are-paid-restricted-chapters"}
				T : '有些為付費/受限章節。'
			} : '' ]);
			if (work_data.error_images > 0) {
				library_namespace.error([ this.id + ': ', {
					// gettext_config:{"id":"$1-this-download-has-a-total-of-$2-image-download-errors"}
					T : [ '%1：本次下載作業，本作品共 %2張{{PLURAL:%2|圖片}}下載錯誤。',
					//
					work_data.directory_name, work_data.error_images ]
				} ]);
			}
			if (typeof callback === 'function') {
				callback(work_data);
			}

		} else {
			// 為了預防太多堆疊，因此使用 setImmediate()。
			setImmediate(crawler_namespace.pre_get_chapter_data.bind(this,
					work_data, chapter_NO, callback));
		}
	}

	// --------------------------------------------------------------------------------------------

	// export 導出.

	// @inner
	Object.assign(crawler_namespace, {
		get_next_chapter_NO_item : get_next_chapter_NO_item,

		pre_get_chapter_data : pre_get_chapter_data
	});

	// @instance
	Object.assign(Work_crawler.prototype, {
		// 檢查磁碟上面是否真的有已經下載的漫畫檔案。
		// .check_downloaded_chapters() 必須先確保已獲得最終之 chapter_data.title。
		check_downloaded_chapters : check_downloaded_chapters,
		// 應該改成.check_downloaded_chapters()，檢查磁碟上面是否真的有已經下載的檔案。
		// check_downloaded_chapter_url : check_downloaded_chapter_url,

		// tools of this.get_chapter_list()
		set_part : set_part_title,
		add_chapter : add_chapter_data,
		reverse_chapter_list_order : reverse_chapter_list_order,
		set_start_chapter_NO_next_time : set_start_chapter_NO_next_time,
		set_chapter_NO_via_title : set_chapter_NO_via_title,
		get_chapter_directory_name : get_chapter_directory_name,

		// retry delay. cf. .one_by_one
		// {Natural|String|Function}當網站不允許太過頻繁的訪問讀取/access時，可以設定下載章節資訊/章節內容前的等待時間。
		// chapter_time_interval : '1s',
		set_chapter_time_interval : set_chapter_time_interval,
		get_chapter_time_interval : get_chapter_time_interval,

		trim_chapter_NO_prefix : trim_chapter_NO_prefix
	});

	// 不設定(hook)本 module 之 namespace，僅執行 module code。
	return library_namespace.env.not_to_extend_keyword;
}
