/**
 * @name CeL module for downloading YOUNG ACE UP, TYPE-MOON comics.
 * 
 * @fileoverview 本檔案包含了解析並處理、批量下載 KADOKAWA CORPORATION webエース ヤングエースUP（アップ）
 *               Webコミック、TYPE-MOONコミックエース 漫画 的工具。
 * 
 * <code>

CeL.ace({
	// configuration
	site : '' || CeL.get_script_name()
}).start(work_id);

 </code>
 * 
 * @since 2020/4/26 5:58:57 模組化。
 */

// More examples:
// @see
// https://github.com/kanasimi/work_crawler/blob/master/comic.ja-JP/youngaceup.js
'use strict';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.work_crawler.sites.ace',

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
		// 日本的網路漫畫網站習慣刪掉舊章節，因此每一次都必須從頭檢查。
		// e.g., ヱデンズボゥイ
		recheck : true,

		// one_by_one : true,
		base_URL : 'https://web-ace.jp/',

		// 取得作品的章節資料。 get_work_data()
		work_URL : function(work_id) {
			return 'contents/' + work_id + '/';
		},
		parse_work_data : function(html, get_label, extract_work_data) {
			var work_data = JSON.parse(html.between(
					'<script type="application/ld+json">', '</script>'));

			extract_work_data(work_data, html);

			// 放在這裡以預防被extract_work_data()覆蓋。
			Object.assign(work_data, {
				// 必要屬性：須配合網站平台更改。
				title : get_label(html.between('<h1>', '</h1>')),
				authors : html.all_between('<p class="author">', '</p>').map(
						get_label),

				// 選擇性屬性：須配合網站平台更改。
				subtitle : get_label(html.between('<p class="subtitle">',
						'</p>')),
				description : get_label(html.between(
						'<div class="description">', '</div>')),
				status : html.between('<p class="genre">', '</p>').replace(
						'ジャンル：', '').split(' / ').map(get_label),
				last_update : get_label(html.between(
						'<span class="updated-date">', '</span>'))
						|| (new Date).toISOString(),
				next_update : html.all_between(
						'<span class="label_day-of-the-week">', '</span>').map(
						get_label)
				// 隔週火曜日更新 次回更新予定日：2018年11月27日
				.map(function(token) {
					return token.replace('次回更新予定日：', '');
				})
			});

			work_data.author = work_data.authors.map(function(name) {
				// 原作： 漫画： キャラクター原案：
				return name.replace(/^[^：]+：/, '').trim();
			});

			// console.log(work_data);
			return work_data;
		},
		chapter_list_URL : function(work_id, work_data) {
			return this.work_URL(work_id) + 'episode/';
		},
		get_chapter_list : function(work_data, html, get_label) {
			// <div class="container" id="read">
			html = html.between(' id="read">', '</section>')
			// <ul class="table-view">
			.between('<ul', '</ul>');

			work_data.chapter_list = [];
			var some_skipped;
			html.each_between('<li', '</li>', function(token) {
				var matched = token.between('<p class="yudo_wa">', '</div>');
				if (matched) {
					library_namespace.info(work_data.title + ': '
							+ get_label(matched).replace(/\s{2,}/g, ' '));
					some_skipped = true;
					return;
				}
				matched = token
						.match(/<a [^<>]*?href=["']([^"'<>]+)["'][^<>]*>/);
				var chapter_data = {
					title : get_label(token
					//
					.between('<p class="text-bold">', '</p>')),
					date : token.between('<span class="updated-date">',
							'</span>'),
					// 直接取得圖片網址資訊。
					url : matched[1] + 'json/'
				};
				work_data.chapter_list.push(chapter_data);
			});
			work_data.chapter_list.reverse();

			if (some_skipped) {
				// 因為中間的章節可能已經被下架，因此依章節標題來定章節編號。
				this.set_chapter_NO_via_title(work_data);
			}
		},

		parse_chapter_data : function(html, work_data, get_label, chapter_NO) {
			// console.log(html);
			var chapter_data = work_data.chapter_list[chapter_NO - 1];
			Object.assign(chapter_data, {
				// 設定必要的屬性。
				image_list : JSON.parse(html)
			});

			return chapter_data;
		}
	};

	// --------------------------------------------------------------------------------------------

	function new_ace_comics_crawler(configuration, callback, initializer) {
		// library_namespace.set_debug(9);
		configuration = configuration ? Object.assign(Object.create(null),
				default_configuration, configuration) : default_configuration;

		configuration.base_URL += (configuration.site
		// || library_namespace.get_script_name()
		) + '/';

		// 每次呼叫皆創建一個新的實體。
		var crawler = new library_namespace.work_crawler(configuration);

		return crawler;
	}

	return new_ace_comics_crawler;
}
