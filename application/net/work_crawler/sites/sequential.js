/**
 * @name CeL module for downloading sequential comics.
 * 
 * @fileoverview 本檔案包含了處理、批量下載 可預測圖片網址序列的漫畫 的工具。
 * 
 * <code>

 CeL.work_crawler.sequential(configuration).start(work_id);

 </code>
 * 
 * 本檔案為僅僅利用可預測的圖片網址序列去下載漫畫作品，不 fetch 作品與章節頁面的範例。
 * 
 * @since 2019/6/17 21:5:52 模組化。
 */

// More examples:
// @see
// https://github.com/kanasimi/work_crawler/blob/master/comic.en-US/mrblue.js
// https://github.com/kanasimi/work_crawler/blob/master/comic.en-US/bookcube.js
'use strict';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.work_crawler.sites.sequential',

	require : 'application.net.work_crawler.',

	// 設定不匯出的子函式。
	no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring

	// --------------------------------------------------------------------------------------------

	var default_configuration = {

		one_by_one : true,
		// 這類型網站必須靠偵測到錯誤時，轉到下一個章節來運作；因此當圖片下載錯誤時不能直接中斷跳出。
		skip_error : true,
		// 但是不保留損壞的檔案。
		preserve_bad_image : false,
		MAX_ERROR_RETRY : 2,

		// base_URL : '',

		// 規範 work id 的正規模式；提取出引數中的作品id 以回傳。
		extract_work_id : function(work_information) {
			// e.g., "wt_HQ0005"
			if (/^[a-z_\-\d]+$/i.test(work_information))
				return work_information;
		},

		// 取得作品的章節資料。 get_work_data()
		work_URL : function(work_id) {
			// 必須是圖片網址的起始部分。
			return '' + work_id + '/';
		},
		skip_get_work_page : true,
		// 解析出作品資料/作品詳情。
		parse_work_data : function(html, get_label) {
			// 先給一個空的初始化作品資料以便後續作業。
			return Object.create(null);
		},
		// 解析出章節列表。
		get_chapter_list : function(work_data, html, get_label) {
			if (!Object.hasOwn(this, 'start_chapter_NO')
					&& work_data.last_download.chapter > this.start_chapter_NO) {
				// 未設定 .start_chapter_NO 且之前下載過，則接續上一次的下載。
				this.start_chapter_NO = work_data.last_download.chapter;
			}

			if (!Array.isArray(work_data.chapter_list)) {
				// 先給一個空的章節列表以便後續作業。
				work_data.chapter_list = [];
			}

			// reuse work_data.chapter_list
			while (work_data.chapter_list.length < this.start_chapter_NO) {
				// 隨便墊入作品資料網址 給本次下載開始下載章節前所有未設定的章節資料，
				// 這樣才能準確從 .start_chapter_NO 開始下載。後續章節網址會動態增加。
				work_data.chapter_list.push(this.work_URL(work_data.id));
			}
			// console.log(work_data);
		},

		// 依照給定序列取得圖片網址。
		get_image_url : function(work_data, chapter_NO, image_index) {
			return this.work_URL(work_data.id) + chapter_NO + '/'
					+ (image_index + 1) + '.jpg';
		},

		skip_get_chapter_page : true,
		// 解析出章節資料。
		parse_chapter_data : function(html, work_data, get_label, chapter_NO) {
			// 設定必要的屬性。
			var chapter_data = {
				// 先給好本章節第一張圖片的網址。後續圖片網址會動態增加。
				image_list : [ this.get_image_url(work_data, chapter_NO, 0) ]
			};

			// console.log(chapter_data);
			return chapter_data;
		},

		// 設定動態改變章節中的圖片數量。
		dynamical_count_images : true,

		// 每個圖片下載結束都會執行一次。
		after_get_image : function(image_list, work_data, chapter_NO) {
			// console.log(image_list);
			var latest_image_data = image_list[image_list.index];
			// console.log(latest_image_data);
			if (!latest_image_data.has_error) {
				library_namespace.debug([ work_data.id + ': ', {
					// gettext_config:{"id":"the-previous-image-in-this-chapter-was-successfully-downloaded.-download-the-next-image-in-this-chapter"}
					T : '本章節上一張圖片下載成功。下載本章節下一幅圖片。'
				} ], 3);
				image_list.push(this.get_image_url(work_data, chapter_NO,
						image_list.length));
				return;
			}

			if (image_list.length === 1) {
				library_namespace.debug([ work_data.id + ': ', {
					// gettext_config:{"id":"the-first-image-failed-to-download.-ending-download-for-this-work"}
					T : '第一張圖就下載失敗了。結束下載本作品。'
				} ], 3);
				return;
			}

			// CeL.debug(work_data.id + ': 本章節上一張圖片下載失敗。下載下一個章節的圖片。');
			work_data.chapter_list.push(this.work_URL(work_data.id));
			// 動態增加章節，必須手動增加章節數量。
			work_data.chapter_count++;
		}

	};

	// --------------------------------------------------------------------------------------------

	function new_sequential_comics_crawler(configuration, callback, initializer) {
		configuration = configuration ? Object.assign(Object.create(null),
				default_configuration, configuration) : default_configuration;

		// 每次呼叫皆創建一個新的實體。
		return new library_namespace.work_crawler(configuration);
	}

	return new_sequential_comics_crawler;
}
