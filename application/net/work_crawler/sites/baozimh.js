/**
 * @name CeL module for downloading baozimh comics.
 * 
 * @fileoverview 本檔案包含了解析並處理、批量下載 🌈️包子漫畫 的工具。
 * 
 * <code>

CeL.baozimh({
	// configuration
	site : '' || CeL.get_script_name()
}).start(work_id);

 </code>
 * 
 * @since 2022/11/3 5:55:24
 * @since 2022/11/3 5:55:24 模組化。
 */

// More examples:
// @see
// https://github.com/kanasimi/work_crawler/blob/master/comic.cmn-Hant-TW/baozimh.js
'use strict';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.work_crawler.sites.baozimh',

	require : 'application.net.work_crawler.',

	// 設定不匯出的子函式。
	no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

// ----------------------------------------------------------------------------

function module_code(library_namespace) {

	// requiring

	/**
	 * <code>
	 <a href="/user/page_direct?comic_id=yuanlaiwoshixiuxiandalao-luanshijiaren&amp;section_slot=0&amp;chapter_slot=0" rel="noopener" class="comics-chapters__item" data-v-0c0802bc><div style="flex: 1;" data-v-0c0802bc><span data-v-0c0802bc>預告</span></div></a>
	 <code>
	 */
	var PATTERN_chapter_link = /<a [^<>]*?href="([^<>"]+?)" [^<>]* class="comics-chapters__item"[^<>]*>([\s\S]+?)<\/a>/g;

	// --------------------------------------------------------------------------------------------

	var default_configuration = {

		base_URL : 'https://www.baozimh.com/',

		// 最小容許圖案檔案大小 (bytes)。
		// 對於極少出現錯誤的網站，可以設定一個比較小的數值，並且設定.allow_EOI_error=false。因為這類型的網站要不是無法取得檔案，要不就是能夠取得完整的檔案；要取得破損檔案，並且已通過EOI測試的機會比較少。
		// 對於有些圖片只有一條細橫桿的情況。
		MIN_LENGTH : 50,
		// e.g., 都是黑丝惹的祸2 0409 第二季 第409话 因为我喜欢他

		// allow .jpg without EOI mark.
		// allow_EOI_error : true,
		// 當圖像檔案過小，或是被偵測出非圖像(如不具有EOI)時，依舊強制儲存檔案。
		skip_error : true,
		// e.g., woshenshangyoutiaolong-pikapi 我身上有条龙/
		// 0590 第590话 父母过往/woshenshangyoutiaolong-pikapi-590-017.jpg

		// 2023/7/22 7:15:15 不停滯下載一百多章後會自動封鎖IP
		one_by_one : '1s',
		chapter_time_interval : '30s',

		acceptable_types : 'jpg|webp',

		// 解析 作品名稱 → 作品id get_work()
		search_URL : 'search?q=',
		parse_search_result : function(html, get_label) {
			html = html.between('<div class="pure-g classify-items">');
			// console.log(html);
			var id_list = [], id_data = [];
			html.each_between('<a href="/comic/', '</a>', function(text) {
				id_list.push(text.between(null, '"'));
				id_data.push(get_label(text.between('title="', '"')));
			});
			// console.log([ id_list, id_data ]);
			return [ id_list, id_data ];
		},

		// 取得作品的章節資料。 get_work_data()
		work_URL : function(work_id) {
			return 'comic/' + work_id;
		},
		parse_work_data : function(html, get_label, extract_work_data) {
			// console.log(html);
			var work_data = {
				// 必要屬性：須配合網站平台更改。
				title : get_label(html.between(
				// <h1 class="comics-detail__title"
				// data-v-6f225890>原來我是修仙大佬</h1>
				'<h1 class="comics-detail__title"', '</h1>').between('>')),
				author : get_label(html.between(
				// <h2 class="comics-detail__author" data-v-6f225890>亂室佳人</h2>
				'<h2 class="comics-detail__author"', '</h2>').between('>')),

				// 選擇性屬性：須配合網站平台更改。
				tags : html.all_between('<span class="tag"', '</span>')
				//
				.map(function(tag) {
					return get_label(tag.between('>'));
				}),
				last_update : get_label(html.between('最新：').between('<em',
						'</em>').between('>').replace(/\((.+) 更新\)/, '$1')),
				latest_chapter : get_label(html.between('最新：', '</a>')),
				description : get_label(html.between('<p class="comics-detail',
						'</p>').between('>')),
				/**
				 * cover image<code>
				<amp-img alt="原來我是修仙大佬" width="180" height="240" layout="responsive" src="https://static-tw.baozimh.com/cover/yuanlaiwoshixiuxiandalao-luanshijiaren.jpg" data-v-6f225890>
				<code>
				 */
				cover_image : html.between('layout="responsive" src="', '"')
			};

			// 由 meta data 取得作品資訊。
			extract_work_data(work_data, html);

			// console.log(work_data);
			return work_data;
		},
		get_chapter_list : function(work_data, html, get_label) {
			// console.log(html);
			var _this = this;
			// reset chapter list
			work_data.chapter_list = [];
			var part_count = html.all_between('<div class="section-title"',
					'</div>').length;
			var skip_latest_chapters = true;
			html.each_between('<div class="section-title"', null,
			//
			function(text) {
				/**
				 * <code>
				<div class="section-title" data-v-6f225890>章節目錄</div>
				<code>
				 */
				var part_title = text.between('>', '</div>').trim();
				// 最新章節 最新章节
				if (/^最新章[節节]$/.test(part_title)
				// 假如只有一個 part，那就必須留下最新章節。 e.g., 妖精种植手册黑白轮回篇
				&& (skip_latest_chapters = part_count > 1)) {
					return;
				}
				// console.trace(part_title);
				_this.set_part(work_data, part_title);
				// console.log(text);
				var matched;
				while (matched = PATTERN_chapter_link.exec(text)) {
					var chapter_data = {
						// reset sub_chapter_list
						sub_chapter_list : null,
						title : get_label(matched[2]),
						// TODO: fix "&amp;"
						url : matched[1].replace(/&amp;/g, '&')
					};
					_this.add_chapter(work_data, chapter_data);
				}
			});

			// console.trace([ part_count, skip_latest_chapters ]);
			if (!skip_latest_chapters) {
				// 最新章節 為倒序。
				// e.g., 妖精种植手册黑白轮回篇
				// https://cn.baozimh.com/comic/yaojingchongzhishouceheibailunhuipian-dazui
				// 我独自升级
				// https://www.baozimh.com/comic/woduzishengji-duburedicestudio_n6ip31
				work_data.inverted_order = true;
			}

			// console.log(work_data.chapter_list);
		},

		pre_parse_chapter_data
		// 執行在解析章節資料 process_chapter_data() 之前的作業 (async)。
		// 必須自行保證執行 callback()，不丟出異常、中斷。
		: function(XMLHttp, work_data, callback, chapter_NO) {
			// console.log(XMLHttp);
			// console.log(work_data);

			// 模擬歸一化
			// https://www.webmota.com/comic/chapter/wangyouzhijinzhanfashi-samanhua/0_188.html
			// https://cn.webmota.com/comic/chapter/wangyouzhijinzhanfashi-samanhua/0_188.html
			function simulated_normalized_url(url) {
				return url.replace(/\/\/[a-z]+\./, '//www.');
			}

			var chapter_data = work_data.chapter_list[chapter_NO - 1];
			// console.trace(chapter_data);
			if (!chapter_data.sub_chapter_list) {
				// get_chapter_list() 獲得的是動態的 url，會轉成靜態的。
				chapter_data.sub_chapter_list = [ XMLHttp.responseURL ];
			}
			if (chapter_data.static_url) {
				if (simulated_normalized_url(chapter_data.static_url) !== simulated_normalized_url(chapter_data.sub_chapter_list[0])) {
					// console.log(chapter_data);
					library_namespace.warn('§' + chapter_NO + '《'
							+ chapter_data.title
							+ '》: 從上一章的章節內容頁面獲得的 URL 不同於從章節列表獲得的 URL：\n	'
							+ chapter_data.static_url + '\n	'
							+ chapter_data.sub_chapter_list[0]);
				}
				// free
				delete chapter_data.static_url;
			}

			var html = XMLHttp.responseText, matched, next_chapter_url = html;
			// console.log(html);

			/**
			 * <code>

			// 可能有上下兩個 `<div class="next_chapter">`，取後一個。
			<div class="chapter-main scroll-mode"><div class="next_chapter"><a href="https://cn.webmota.com/comic/chapter/dubuxiaoyao-zhangyuewenhua/0_35.html#bottom">
			点击进入上一页
			</a></div>

			<div class="next_chapter"><a href="https://www.webmota.com/comic/chapter/shenzhita-siu/0_738_2.html">
			點擊進入下一頁
			<span class="iconfont icon-xiangxia"></span></a></div>

			<div class="next_chapter"><a href="https://cn.webmota.com/comic/chapter/shenzhita-siu/0_738.html">
			点击进入下一话
			<span class="iconfont icon-xiayibu"></span></a></div>
			<code>
			 */
			while (matched = next_chapter_url.between(' class="next_chapter">'))
				next_chapter_url = matched;
			next_chapter_url = next_chapter_url
			// 去掉網頁錨點。
			&& next_chapter_url.between(' href="', '"').replace(/#.*$/, '');
			if (!next_chapter_url
			//
			|| !/^_\d/.test(simulated_normalized_url(next_chapter_url)
			// 確定 url 以本章節 url 開頭。
			.between(simulated_normalized_url(
			//
			chapter_data.sub_chapter_list[0]).replace(/\.html$/, '')))) {
				// console.trace('下一話');
				// assert: next_chapter_url 為下一話的靜態 url。
				var next_chapter_data = work_data.chapter_list[chapter_NO];
				if (next_chapter_url && next_chapter_data) {
					// 做個記錄。
					if (false) {
						console.trace([ chapter_NO, next_chapter_url,
								next_chapter_data ]);
					}
					next_chapter_data.static_url = next_chapter_url;
					// 直接從靜態網頁獲取章節內容，避免採用 CGI。
					if (!next_chapter_data.sub_chapter_list)
						next_chapter_data.sub_chapter_list = [ next_chapter_url ];
				}

				// console.trace(chapter_data);
				callback();
				return;
			}
			// assert: next_chapter_url 為下一頁的靜態 url。
			// console.trace('下一頁');

			// 做個記錄。
			chapter_data.sub_chapter_list.push(next_chapter_url);

			// console.trace(next_chapter_url);
			this.get_URL(next_chapter_url, function(XMLHttp, error) {
				if (!XMLHttp.responseText && !error)
					error = 'No content get';
				if (error) {
					callback(XMLHttp, error);
					return;
				}
				if (!chapter_data.next_chapter_HTMLs)
					chapter_data.next_chapter_HTMLs = [];
				chapter_data.next_chapter_HTMLs.push(XMLHttp.responseText);
				this.pre_parse_chapter_data(XMLHttp, work_data, callback,
						chapter_NO);
			}.bind(this));
		},
		// 取得每一個章節的各個影像內容資料。 get_chapter_data()
		parse_chapter_data : function(html, work_data, get_label, chapter_NO) {
			var chapter_data = work_data.chapter_list[chapter_NO - 1];

			var image_list = chapter_data.image_list = [], url_Set = new Set;

			function handle_html(html) {
				html = html
				// <div class="chapter-main scroll-mode">
				.between('<div class="chapter-main scroll-mode">');
				// console.trace(html);

				/**
				 * <code>
				<img src="https://s1.baozimh.com/scomic/yuanlaiwoshixiuxiandalao-luanshijiaren/0/0-vmac/1.jpg" alt="原來我是修仙大佬 - 預告 - 1" width="1200" height="3484" data-v-25d25a4e>
				<code>
				 */
				html.each_between('<img src="', '>', function(text) {
					var url = encodeURI(text.between(null, '"'));
					if (url_Set.has(url)) {
						// 前面的部分會重複3張圖片。
						return;
					}
					url_Set.add(url);
					image_list.push({
						title : get_label(text.between('alt="', '"')),
						url : url
					});
				});
			}

			handle_html(html);

			if (chapter_data.next_chapter_HTMLs) {
				chapter_data.next_chapter_HTMLs.forEach(handle_html);
				// free
				delete chapter_data.next_chapter_HTMLs;
			}
			// console.log(image_list);

			return chapter_data;
		},

		is_limited_image_url : function(image_url, image_data) {
			// e.g.,
			// https://cn.webmota.com/comic/chapter/zunshang-mankewenhua_d/0_220.html
			if (typeof image_url === 'string'
			// https://static-tw.baozimh.com/cover/404.jpg
			&& image_url.endsWith('/cover/404.jpg')) {
				return '404 Not Found';
			}
		}
	};

	// --------------------------------------------------------------------------------------------

	function new_baozimh_comics_crawler(configuration, callback, initializer) {
		// library_namespace.set_debug(9);
		configuration = configuration ? Object.assign(Object.create(null),
				default_configuration, configuration) : default_configuration;

		// 每次呼叫皆創建一個新的實體。
		var crawler = new library_namespace.work_crawler(configuration);

		return crawler;
	}

	return new_baozimh_comics_crawler;
}
