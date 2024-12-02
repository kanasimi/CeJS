/**
 * @name CeL module for downloading dm5 comics.
 * 
 * @fileoverview 本檔案包含了解析並處理、批量下載 动漫屋网/漫画人 平臺 的工具。
 * 
 * 由於 动漫屋网/漫画人 系列網站下載機制較複雜，下載圖片功能為獨立撰寫出來，不支援 achive_images 功能。
 * 
 * <code>

CeL.dm5(configuration).start(work_id);

 </code>
 * 
 * @see http://www.dm5.com/about/
 *      动漫屋网(dm5.com)是瑞安市我喜欢网络有限公司下的提供所有动漫爱好者聚集阅读漫画的平台。
 *      自建成并发布以来，逐步完善系统功能和改善用户体验，...
 * 
 * @since 2019/7/7 9:52:2 模組化。
 */

// More examples:
// @see
// https://github.com/kanasimi/work_crawler/blob/master/comic.cmn-Hans-CN/dm5.js
// https://github.com/kanasimi/work_crawler/blob/master/comic.cmn-Hans-CN/tohomh.js
// https://github.com/kanasimi/work_crawler/blob/master/comic.cmn-Hans-CN/ikmhw.js
'use strict';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.work_crawler.sites.dm5',

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
		// 所有的子檔案要修訂註解說明時，應該都要順便更改在CeL.application.net.comic中Comic_site.prototype內的母comments，並以其為主體。

		// recheck:從頭檢測所有作品之所有章節與所有圖片。不會重新擷取圖片。對漫畫應該僅在偶爾需要從頭檢查時開啟此選項。
		// 有些漫畫作品分區分單行本、章節與外傳，當章節數量改變、添加新章節時就需要重新檢查。
		// 當有多個分部的時候才重新檢查。
		recheck : 'multi_parts_changed',
		// 當無法取得chapter資料時，直接嘗試下一章節。在手動+監視下recheck時可併用此項。
		// skip_chapter_data_error : true,

		// 當圖像檔案過小，或是被偵測出非圖像(如不具有EOI)時，依舊強制儲存檔案。
		// skip_error : true,

		// one_by_one : true,
		// base_URL : 'https://www.dm5.com/',

		preserve_chapter_page : false,
		// 提取出引數（如 URL）中的作品ID 以回傳。
		extract_work_id : function(work_information) {
			// /^manhua-[a-z\-\d]+$/;
			// e.g., http://www.dm5.com/manhua-1122/
			// http://www.dm5.com/manhua--c-94-okazu/
			return /^[a-z\-\d]+$/.test(work_information) && work_information;
		},

		// 解析 作品名稱 → 作品id get_work()
		search_URL : function(work_title) {
			return 'search.ashx?d=' + new Date().getTime()
			//
			+ '&t=' + encodeURIComponent(work_title) + '&language=1';
			// @see 搜索框文本改变 function SearchInputChange() @
			// http://css122us.cdndm5.com/v201801302028/dm5/js/search.js
			return [ 'search.ashx?d=' + new Date().getTime(), {
				t : work_title,
				language : 1
			} ];
		},
		parse_search_result : function(html, get_label) {
			// console.log(html);
			var id_list = [], id_data = [];

			if (html.includes('<div class="mh-item">')) {
				html.each_between(
				// for tohomh.js, ikmhw.js; should setup search_URL
				'<div class="mh-item">', '</li>',
				/**
				 * e.g., <code>
				<li>
				<div class="mh-item">
				<a href="/title/" title="title">
				<p class="mh-cover" style="background-image: url(https://img.r2hm.com/static/upload/book/23/cover.jpg)"></p>
				</a>
				<div class="mh-item-detali">
				</code>
				 */
				function(text) {
					var matched = text
					// r2hm.js: <a href="/book/23" title="波塔与海">
					// tohomh.js: <a href="/fangkainagenvwu/" title="放开那个女巫">
					.match(/<a href="([^<>"]+)" title="([^<>"]+)">/);
					id_data.push(get_label(matched[2]));
					matched = matched[1].match(/([^\/]+)\/?$/);
					id_list.push(matched[1]);
				});
			} else if (html.includes('<li onclick="window.location.href=')) {
				html.each_between(
				// for dm5.js 2019/9, 1kkk.js
				'<li onclick="window.location.href=', '</li>',
				/**
				 * e.g., <code>
				<li onclick="window.location.href='/manhua-shanhainizhan1/';" style="cursor: pointer;"><a href="javascript:void(0);" class="type_1" style="display: block;"><span class="left"><span class="red">山海逆战</span></span><span class="right">第184回</span></a></li>
				</code>
				 */
				function(text) {
					id_list.push(text.between("'/", "/'"));
					id_data.push(get_label(text.between(
					// 不能用 "</span>"：可能是 "<span class="red">" 的結尾。
					'<span class="left">', '<span class="right">')));
				});
			} else if (html.includes(' class="new-search-list-item"')) {
				html.each_between(
				// for dm5.js 2019/10 搜尋改版
				'<a href="/', '</a>',
				/**
				 * e.g., <code>
				<a href="/manhua-zhizunshenjixitong/" class="new-search-list-item" target="search"><p class="new-search-list-content"><span class="left"><span class="red">至尊神级系统</span></span><span class="new-search-list-right">更新至 第143回</span></p></a>
				</code>
				 */
				function(text) {
					id_list.push(text.between(null, '/"'));
					id_data.push(get_label(text.between('<span class="left">',
					// 不能用 "</span>"：可能是 "<span class="red">" 的結尾。
					'<span class="new-search-list-right">')));
				});
			} else if (html.includes(' class="classList"')) {
				html.each_between(
				// for https://www.tohomh123.com/action/Search?keyword= 2019/11前
				// 搜尋改版
				'<li class="am-thumbnail">', '</a>',
				/**
				 * e.g., <code>

				<div class="classList" id="classList_1">
				<ul class="am-avg-sm-3 am-thumbnails list">
				
				<li class="am-thumbnail"><a href="/xiuzhenliaotianqun/" title="修真聊天群">
				...
				</p>
				</li>
				
				</ul>
				</div>

				</code>
				 */
				function(text) {
					id_list.push(text.between('<a href="/', '/"'));
					id_data.push(get_label(text.between(' title="', '"')));
				});
			} else if (html.includes('<ul class="book-list">')) {
				html.between('<ul class="book-list">', '</ul>').each_between(
				// for https://www.mumumh.com/search?keyword=
				'<li>', '</li>',
				/**
				 * e.g., <code>

				<ul class="book-list">
				<li>
				<div class="book-list-cover">
				<a href="/book/523" title="美丽新世界">
				                <img class="book-list-cover-img lazy" data-original="https://pic.mumumh.com/static/upload/book/523/cover.jpg" src="https://s1.ax1x.com/2018/12/13/FN8WLQ.jpg" alt="美丽新世界">
				            </a>
				</div>
				<div class="book-list-info">
				<a href="/book/523">
				<p class="book-list-info-title">美丽新世界</p>
				<p class="book-list-info-desc">走后门进全国最大企业上班的豪承，因为同事的轻视和冷落，长期笼罩在屈辱的阴影之下。因为一道突如其来的人...</p>
				</a>
				<p class="book-list-info-bottom">
				<a href="#" style="color:#666;">
				    <span class="book-list-info-bottom-item">作者：高孙志</span>
				</a>
				                <span class='book-list-info-bottom-right-font'>连载中</span>
				            </p>
				</div>
				</li>
				
				</ul>

				</code>
				 */
				function(text) {
					id_list.push(+text.between('<a href="/book/', '"'));
					id_data.push(get_label(text.between(' title="', '"')));
				});
			} else if (html) {
				throw new Error(this.id + ': 網站改版？無法解析搜尋結果！');
			}

			return [ id_list, id_data ];
		},

		// --------------------------------------------------------------------

		// 取得作品的章節資料。 get_work_data()
		parse_work_data_mobile : function(html, get_label, extract_work_data) {
			// console.log(html);
			html = html.between('<div class="detail-main">',
					'<div id="chapter_indexes"');
			var work_data = {
				// 必要屬性：須配合網站平台更改。
				title : get_label(html.between(
						'<p class="detail-main-info-title">', '</p>')),

				// 選擇性屬性：須配合網站平台更改。
				tags : html.between('<p class="detail-main-info-class">',
						'</p>').split('</span>').map(get_label).filter(
						function(tag) {
							return !!tag;
						}),
				description : get_label(html.between('<p class="detail-desc">',
						'</p>'))
			};

			html.each_between('<p class="detail-main-info-author">', null,
			//
			function(text) {
				text = text.between(null, '<p class="')
						|| text.between(null, '</p>');
				// console.log(text);
				var matched = text.match(/^([^：]+)：([\s\S]+)$/);
				// console.log(matched);
				if (matched) {
					work_data[matched[1]] = get_label(matched[2]);
				}
			});

			var matched = work_data.人气
					&& work_data.人气.match(/^(\d+)\s*\|(.+)$/);
			if (matched) {
				work_data.人气 = +matched[1];
				work_data.status = matched[2];
			}

			// console.log(work_data);
			return work_data;
		},
		parse_work_data : function(html, get_label, extract_work_data) {
			// console.log(html);
			var part_list = [], matched,
			// e.g., https://www.mymhh.com/book/459
			text = html.between('<div class="detail-list-title"', '</div>'),
			//
			PATTERN = /['"]detail-list-select-(\d)['"][^<>]+>([^<>]+)/g;
			while (matched = PATTERN.exec(text)) {
				part_list[matched[1]] = get_label(matched[2]);
			}

			matched = html.between('<div class="banner_detail_form">',
					'<div class="bottom"');
			if (matched) {
				html = matched;
			} else if (matched = html.between('<div class="detail-main">',
					'<div id="chapter_indexes"')) {
				return this.parse_work_data_mobile(html, get_label,
						extract_work_data);
			} else {
				throw new Error(this.id + ': 網站改版？無法解析作品資訊！');
			}

			var work_data = {
				// 必要屬性：須配合網站平台更改。
				title : get_label(html.between('<p class="title">',
						'<span class="right">')
						// 土豪漫画 tohomh.js
						|| html.between('<h1>', '</h1>')),

				// 選擇性屬性：須配合網站平台更改。
				// e.g., "<p class="subtitle">作者：...图：.../文：...</p>"
				author : get_label(html.between('<p class="subtitle">', '</p>')),
				description : get_label(html.between('<p class="content"',
						'</p>').between('>').replace(
						/<a href="#[^<>]+>.+?<\/a>/g, '')),
				image : html.between('<img src="', '"'),
				score : html.between('<span class="score">', '</span>'),
				// tohomh.js: <em class="remind">每周六更</em>
				next_update : html.between(' class="remind">', '<'),
				part_list : part_list
			};

			if (!/[:：][^:：]+?[:：]/.test(work_data.author)) {
				work_data.author = work_data.author.replace(/^.*?[:：]/, '');
			}

			matched = text.between('最新').match(
			/**
			 * <code>
			<span class="s">最新<span>&nbsp;<a href="/m779600/" title="妖神记 第212回" style="color:#ff3f60;" target="_blank">第212回 龙煞（上）</a>&nbsp;02月27号 </span></span>
			<span class="s">最新<span>&nbsp;<a href="/m853381/" title="山海逆战 第405回" style="color:#ff3f60;" target="_blank">第405回 神封不動（下）</a>&nbsp;前天 09:05</span></span>
			 </code>
			 */
			/<a [^<>]*?title="([^<>"]+)"[^<>]*>.+?<\/a>(?:(.+?)<\/span>)?/);
			if (matched) {
				// dm5.js: 2019/3/1前 改版 v3。
				Object.assign(work_data, {
					latest_chapter : get_label(matched[1]),
					last_update : get_label(matched[2])
				});
			}
			// 原先給tohomh.js用的。但是2019/7/7發現，無論哪個作品都沒有這個標示了。
			if (false) {
				matched = text.between('最新').match(
						/<a [^<>]*?title="([^<>"]+)"/);
				if (matched) {
					work_data.latest_chapter = matched[1];
				}
			}

			html.between('<p class="tip">', '<p class="content"')
			// <span class="block ticai">题材：...
			.split('<span class="block').forEach(function(text) {
				var matched = text.match(/^[^<>]+>([^<>:：]+)([\s\S]+)$/);
				if (matched && (matched[2] = get_label(matched[2])
				//
				.replace(/^[\s:：]+/, '').trim().replace(/\s+/g, ' '))) {
					work_data[matched[1]] = matched[2];
				}
			});

			Object.assign(work_data, {
				status : work_data.状态,
				last_update : work_data.更新时间 || work_data.last_update
			});

			// console.log(work_data);
			return work_data;
		},
		get_chapter_list : function(work_data, html, get_label) {
			// console.log(html);
			var is_dm5 = html.includes('DM5_COMIC_SORT');
			// 1: 正序 由舊至新, 2: 倒序 由新至舊
			work_data.inverted_order = typeof this.inverted_order === 'boolean' ? this.inverted_order
					: !/ DM5_COMIC_SORT\s*=\s*1/.test(html);

			/**
			 * <code>
			dm5.js: <a href="javascript:void(0);" onclick="sortBtnClick(this);" class="order ">正序</a>
			dm5.js: <a href="javascript:void(0);" onclick="sortBtnClick(this);" class="order desc inverted">倒序</a>
			tohomh.js: <a href="javascript:void(0);" onclick="sortBtnClick();" mode="0" class="order desc inverted">倒序</a>
			ikmhw.js: <a href="javascript:void(0);" onClick="sortBtnClick(this);" class="order desc inverted">倒序</a>
			r2hm.js: <a href="javascript:void(0);" onClick="sortBtnClick(this);" class="order desc inverted">倒序</a>
			hanmanwo.js: <a href="javascript:void(0);" onclick="sortBtnClick();" mode="0" class="order desc inverted">倒序</a>

			tohomh.js, ikmhw.js: work_data.inverted_order === true
			r2hm.js: work_data.inverted_order === false
			dm5.js: 皆有可能:
				DM5_COMIC_SORT=2: http://www.dm5.com/manhua-haizeiwang-onepiece/
				DM5_COMIC_SORT=1: http://www.dm5.com/manhua-shishangzuiqiang/
			</code>
			 */

			// console.log(html);
			// mymhh.js:
			// <ul class="detail-list-1 detail-list-select"
			// id="detail-list-select">
			html = html.between('detail-list-select',
					'<div class="index-title">')
					// mymhh.js:
					// <a class="detail-list-more" id="detail-list-more"
					// href="javascript:void(0);"
					// onclick="charpterMore(this);">展开全部章节</a>
					|| html.between('detail-list-select',
							' id="detail-list-more"');
			// console.log(html);

			// 2019/7/7 dm5.js:
			// html.includes(' id="detail-list-select-2') === false
			if (!is_dm5 && html.includes(' id="detail-list-select-2')) {
				// tohomh.js, ikmhw.js: 新→舊 ' id="detail-list-select-2' 舊→新
				html = html.between(null, ' id="detail-list-select-2');
				// </ul>
				// <ul class="view-win-list detail-list-select"
				// id="detail-list-select-2" style="display:none;">
			}
			// console.log(html);

			// reset work_data.chapter_list
			work_data.chapter_list = [];

			var PATTERN_chapter = /<li>([\s\S]+?)<\/li>|<ul ([^<>]+)>/g, matched;
			while (matched = PATTERN_chapter.exec(html)) {
				if (matched[2]) {
					// <ul class="view-detail-list detail-list-select"
					// id="detail-list-select-1">
					matched[2] = matched[2]
							.match(/ id="detail-list-select-(\d)"/);
					if (matched[2]
							&& (matched[2] = work_data.part_list[matched[2][1]])) {
						this.set_part(work_data, matched[2]);
					} else if (!matched[0].includes(' class="chapteritem">')
					// <ul style="display:none" class="chapteritem">
					&& work_data.part_list.length > 0 && is_dm5) {
						library_namespace
								.error('get_chapter_list: Invalid NO: '
										+ matched[0]);
					}
					continue;
				}

				matched = matched[1];
				// console.log(matched);
				var chapter_data = {
					title : get_label(matched.between(' class="title', '</p>')
					//
					.between('>'))
					// e.g., 古惑仔
					|| get_label(matched
					// for 七原罪 第168话 <十戒>歼灭计划
					.replace(/ title="[^"]+"/, '')).replace(/\s+/g, ' ')
					// tohomh.js
					|| get_label(matched
					// <a href="/title/1.html" ...>title<span>（1P）</span>
					// </a>
					.match(/<a [^<>]+>([\s\S]+?)<\/span>/)[1]),

					url : matched.between(' href="', '"')
				};
				matched = get_label(matched.between('<p class="tip">', '</p>'));
				if (matched) {
					chapter_data[Date.parse(matched) ? 'date' : 'tip'] = matched;
				}
				// console.log(chapter_data);
				this.add_chapter(work_data, chapter_data);
			}
			// console.log(work_data);
		},

		// --------------------------------------------------------------------

		parallel_limit : 200,

		pre_parse_chapter_data_API
		// 執行在解析章節資料 process_chapter_data() 之前的作業 (async)。
		// 必須自行保證執行 callback()，不丟出異常、中斷。
		: function(XMLHttp, work_data, callback, chapter_NO) {
			/**
			 * 之前已經取得過圖片資訊。但需要處理下載目錄改變的情況。
			 * 
			 * TODO: fix https://github.com/eight04/ComicCrawler/issues/208
			 * <code>
			https://www.tohomh123.com/wocaibushiedunvpei/182.html

			解析到的第一張圖片網址: https://mh3.zhengdongwuye.cn/upload/wocaibushiedunvpei/2606792/0000.jpg
			正確的的第一張圖片網址: https://m-tohomh123-com.mipcdn.com/i/mh3.zhengdongwuye.cn/upload/wocaibushiedunvpei/2606792/0000.jpg
			</code>
			 */
			function fix_image_path(image_data, index) {
				if (!image_data || !image_data.file) {
					return;
				}
				if (image_data.file.includes(this.EOI_error_postfix
				// reget bad files "* bad.*"
				+ '.')) {
					delete image_data.file;
					return;
				}

				if (!work_data.old_directory
				// 圖片並未包含當前的章節目錄。
				&& !image_data.file.startsWith(chapter_directory)
				// 當包含目錄名稱時就猜測看看可能的原始目錄名稱。
				&& image_data.file.includes(work_data.directory_name)) {
					var index = image_data.file
							.indexOf(work_data.directory_name);
					// assert: index > 0
					var path = this.main_directory
							+ image_data.file.slice(index);
					if (path.startsWith(chapter_directory)) {
						work_data.old_directory = image_data.file.slice(0,
								index)
								+ work_data.directory.slice(index);
						image_data.file = path;
					}
				}

				if (work_data.old_directory && image_data.file
				//
				.startsWith(work_data.old_directory)) {
					image_data.file = image_data.file.replace(
							work_data.old_directory, work_data.directory);
				}

				var path_OK = image_data.file
				// 假如不是以 `chapter_data.directory` 開頭，可能是因為連章節名稱都改變了。
				// 這時就需要重新抓取圖片網址。
				.startsWith(chapter_directory);

				return path_OK;
			}

			// console.log(XMLHttp);
			// console.log(work_data);
			var chapter_data = work_data.chapter_list[chapter_NO - 1];
			// console.log(chapter_data);

			// @see function process_images(chapter_data, XMLHttp)
			// @ CeL.work_crawler
			var chapter_label = this.get_chapter_directory_name(work_data,
					chapter_NO, chapter_data, false);
			var chapter_directory = work_data.directory + chapter_label;

			if (!work_data.image_list) {
				// image_list[chapter_NO] = [url, url, ...]
				work_data.image_list = [];

			} else if ((chapter_data.image_list = work_data.image_list[chapter_NO - 1])
					&& chapter_data.image_list.every(fix_image_path, this)) {
				// console.log(chapter_data.image_list);
				callback();
				return;
			}

			var html = XMLHttp.responseText;
			// console.log(html);
			if (!html) {
				// e.g., 雏蜂 https://www.tohomh.com/chufeng/259.html
				// node tohomh.js 雏蜂 skip_error
				// e.g., https://www.tohomh123.com/wuliandianfeng/295.html
				delete chapter_data.image_list;
				callback();
				return;
			}

			// @see CeL.application.net.wiki
			var PATTERN_non_CJK = /^[\u0000-\u2E7F]*$/i;

			function normalize_URL(image_url) {
				if (!image_url) {
					return image_url;
				}

				// console.log(image_url);
				// 13 === ('http://n.'+'http').length
				var index = image_url.indexOf('http://', 13)
						|| image_url.indexOf('https://', 13);
				if (index > 0) {
					if (false) {
						console.log(image_url + '\n→ '
						// e.g., http://ikmhw.com/669/155853.html
						+ image_url.slice(index));
					}
					image_url = image_url.slice(index);
				}

				if (!PATTERN_non_CJK.test(image_url)
						&& !image_url.includes('%')) {
					// e.g., http://ikmhw.com/669/155853.html
					image_url = encodeURI(image_url);
				}
				return image_url;
			}

			var image_list = work_data.image_list[chapter_NO - 1]
			// new Array(image_count)
			= chapter_data.image_list = [
			// 第一張圖片的網址在網頁中。
			// <div class="comiclist">\n <div class="comicpage">\n <img
			// src="..."
			// e.g., https://www.tohomh.com/shijie/276.html
			normalize_URL(html.between(' class="comiclist"', '</div>').between(
					' src="', '"')) ];

			html = html.match(
			//
			/<script[^<>]*>[\n\s]*var\s+([\s\S]+?)<\/script>/)[1];
			// console.log(html);
			var config = Object.create(null), matched, PATTERN =
			//
			/[\s\n;]var\s+([a-z]+)\s*=\s*(\d+|[a-z]+|'[^']*'|"[^"]*")/ig;
			while (matched = PATTERN.exec(html)) {
				config[matched[1]] = eval(matched[2]);
			}
			// console.log(config);
			var _this = this, image_count = config.pcount;
			// http://ikmhw.com/muban/mh/js/p.js?20181207
			var base_URL = this.image_API + config.did + '&sid=' + config.sid
					+ '&iid=';
			if (!image_list[0].includes('://')) {
				// tohomh.js 2019/2/5 13:-17: 間改版。
				// assert: image_list[0].startsWith('data:image/')
				image_list[0] = config.pl;
			}

			if (!(image_count >= 1)) {
				// e.g., https://www.tohomh.com/shijie/276.html
				this.onwarning(this.id + ': Failed to get chapter page of §'
						+ chapter_NO, work_data);
				image_list.truncate();
				callback();
				return;
			}

			// library_namespace.run_serial 在 ikmhw.js 太慢了。但一次呼叫太多行程，會造成無回應。
			var iterator = image_count < this.parallel_limit ? library_namespace.run_parallel
					: library_namespace.run_serial;
			if (false) {
				library_namespace.log(
				//
				iterator === library_namespace.run_parallel
				//
				? 'run_parallel' : 'run_serial');
			}
			if (iterator === library_namespace.run_parallel) {
				// actually image_count - 1
				library_namespace.log_temporary('Get ' + image_count
						+ ' image data pages. '
						+ _this.estimated_message(work_data, chapter_NO));
			}
			iterator(function(run_next, image_NO) {
				// @see https://manhua.wzlzs.com/muban/mh/js/p.js?20181207
				function add_image_data(XMLHttp) {
					// console.log(XMLHttp.responseText);
					var image_url;
					try {
						image_url
						// {"IsError":false,"MessageStr":null,"Code":"https://mh2.ahjsny.com/upload/id/0001/0001.jpg"}
						= encodeURI(JSON.parse(XMLHttp.responseText).Code);

					} catch (e) {
						// e.g., status 500
						library_namespace.warn([
						//
						'pre_parse_chapter_data_API: ', {
							T : [ 'Error code: %1', XMLHttp.responseText ]
						} ]);

						if (_this.skip_error) {
							_this.onwarning(e);
						} else {
							_this.onerror(e);
						}
					}

					image_url = normalize_URL(image_url);
					if (iterator === library_namespace.run_serial) {
						// 兩者皆可。
						// image_list.push(image_url);
						image_list[image_NO - 1] = image_url;
					} else {
						// 警告: 採用非同步的方法，獲得網址的順序不一定。因此不能採用 .push()，而應採用 [index]
						// 的方法來記錄。
						// image_NO = index + 1, image_NO: 2–
						image_list[image_NO - 1] = image_url;
					}
					run_next();
				}

				if (iterator === library_namespace.run_serial) {
					library_namespace.log_temporary('Get image data page of §'
							+ chapter_NO + ': ' + image_NO + '/' + image_count
							+ '. '
							+ _this.estimated_message(work_data, chapter_NO));
				}

				// Should use POST?
				_this.get_URL(base_URL + image_NO + '&tmp=' + Math.random(),
						add_image_data);
			}, image_count, config.iid, callback);
		},

		pre_parse_chapter_data
		// 執行在解析章節資料 process_chapter_data() 之前的作業 (async)。
		// 必須自行保證執行 callback()，不丟出異常、中斷。
		: function(XMLHttp, work_data, callback, chapter_NO) {
			if (this.archive_old_works) {
				// 本工具檔不會壓縮檔案。
				library_namespace.warn([ this.id + ': ', {
					// gettext_config:{"id":"this-website-does-not-support-the-function-of-archiving-old-works-(.archive_old_works)"}
					T : '本網站不支援封存舊作品功能 (.archive_old_works)！'
				} ]);
				this.archive_old_works = false;
			}

			// console.log(XMLHttp);
			// console.log(work_data);
			if (!work_data.image_list) {
				// image_list[chapter_NO] = [url, url, ...]
				work_data.image_list = [];
			}

			// 參照下方原理說明，沒有辦法使用 cache。
			if (false && !this.recheck
					&& Array.isArray(work_data.image_list[chapter_NO])) {
				callback();
				return;
			}

			var html = XMLHttp.responseText,
			//
			text = html.between('var isVip', '</script>'),
			//
			DM5 = work_data.DM5 = Object.create(null), matched,
			// ("): for "...'..." e.g., https://www.dm5.com/m816581/
			// 尚未發現有 '..."...' 的情況。
			PATTERN_assignment =
			// [ expression, variable name, value, quote ]
			/\sDM5_([a-zA-Z\d_]+)\s*=\s*(\d+|true|false|(")(?:\\[\s\S]|[^\\"]+)*")/g
			// @see sfacg.js
			;
			// console.log(text);
			while (matched = PATTERN_assignment.exec(text)) {
				// console.log(matched);
				var value = matched[2];
				if (matched[3] === "'") {
					value = value.replace(/^'([\s\S]*?)'$/g, function(all,
							inner) {
						return '"' + inner.replace(/"/g, '\\"') + '"';
					});
				}
				// for \t. e.g., '"03部65话\t"' https://www.dm5.com/m712588/
				value = value.replace(/\t/g, '\\t');
				// console.log(value);
				// console.log(matched[1]);
				// console.log(JSON.parse(value));
				DM5[matched[1]] = JSON.parse(value);
			}
			// console.log(DM5);
			if (!(DM5.IMAGE_COUNT > 0)) {
				if (html.includes('<p class="subtitle">此章节为付费章节</p>')) {
					library_namespace.info(work_data.title + ': 第' + chapter_NO
							+ '章為需要付費的章節');
				}
				callback();
				return;
			}

			// e.g., 某科学的超电磁炮
			matched = html
					.match(
					// <input type="hidden" id="dm5_key" value="" />
					/ id="dm5_key"[\s\S]{1,50}?<script[^<>]*>\s*eval([\s\S]+?)<\/script>/);
			if (matched) {
				text = eval(matched[1]).replace(
				// 有時var123會以數字開頭，屬於網站bug。 e.g., 风云全集
				/\$\("#dm5_key"\)\.val\(([a-z_\d]*)\)/, 'DM5.mkey=_$1')
				// e.g., "var 161dfgdfg=''+" ...
				// ";$("#dm5_key").val(161dfgdfg);"
				.replace(/var ([a-z_\d]*)/g, 'var _$1');
				eval(text);
			}

			// @see ShowNext() , ajaxloadimage() @
			// http://css122us.cdndm5.com/v201801302028/dm5/js/chapternew_v22.js
			// e.g.,
			// http://www.dm5.com/m521971/chapterfun.ashx?cid=521971&page=6&key=&language=1&gtk=6&_cid=521971&_mid=33991&_dt=2018-02-06+12%3A12%3A25&_sign=a50d71d1c768e731d2e8dcaeae12feb3
			var parameters = {
				cid : DM5.CID,
				// page : DM5.PAGE,
				page : 1,
				key : DM5.mkey || '',
				language : 1,
				gtk : 6,
				_cid : DM5.CID,
				_mid : DM5.MID,
				_dt : DM5.VIEWSIGN_DT,
				_sign : DM5.VIEWSIGN
			}, history_parameters = {
				cid : DM5.CID,
				mid : DM5.MID,
				page : 1,
				uid : 0,
				language : 1
			};

			var _this = this, this_image_list = [];

			// --------------------------------------

			var chapter_data = work_data.chapter_list[chapter_NO - 1];

			// 這段程式碼模仿 work_crawler 模組的行為。
			// @see process_images(chapter_data, XMLHttp) @
			// CeL.application.net.work_crawler
			library_namespace.log(chapter_NO + '/'
					+ work_data.chapter_list.length + ' ['
					+ this.get_chapter_directory_name(work_data, chapter_NO)
					+ '] ' + DM5.IMAGE_COUNT + ' images.');

			function image_file_path_of(image_NO) {
				// @see get_data() @ CeL.application.net.work_crawler
				var chapter_label = _this.get_chapter_directory_name(work_data,
						chapter_NO);
				var chapter_directory = work_data.directory + chapter_label
						+ library_namespace.env.path_separator;

				library_namespace.create_directory(chapter_directory);

				// 這段程式碼模仿 work_crawler 模組的行為。
				// @see image_data.file @ CeL.application.net.work_crawler
				function path_of(chapter_NO) {
					return chapter_directory
					//
					+ work_data.id + '-' + chapter_NO + '_'
					// 一開始就該定一個不太需要改變的位數。
					+ image_NO.pad(3) + '.' + _this.default_image_extension;
				}

				var image_file_path = path_of(chapter_data.NO_in_part >= 1
				// 若有分部，則以部編號為主。
				? chapter_data.NO_in_part : chapter_NO);

				if (!library_namespace.file_exists(image_file_path)) {
					function move_old_file(chapter_NO) {
						var old_image_file_path = path_of(chapter_NO);
						if (old_image_file_path !== image_file_path
								&& library_namespace
										.file_exists(old_image_file_path)) {
							library_namespace.move_file(old_image_file_path,
									image_file_path);
							return true;
						}
					}
					move_old_file(chapter_NO)
					// || move_old_file(chapter_data.NO_in_part + 1)
					;
				}

				return image_file_path;
			}

			// --------------------------------------

			// 這個網站似乎每個章節在呼叫 chapterfun.ashx 之後才能下載圖片。
			// 並且當呼叫另一次 chapterfun.ashx 之後就不能下載上一次的圖片了。
			// 由於圖片不能並行下載，下載速度較慢。
			// 但是可以多開幾支程式，每一支下載一個作品。

			library_namespace.run_serial(function(run_next, image_NO) {
				if (library_namespace.read_file(image_file_path_of(image_NO))) {
					run_next();
					return;
				}
				library_namespace.log_temporary('圖 ' + image_NO + '/'
						+ DM5.IMAGE_COUNT);

				get_token(image_NO, run_next);
				return;

				// Skip codes below: 可以不用取得 history.ashx。
				history_parameters.page = image_NO;
				library_namespace.get_URL(_this.full_URL(_this.chapter_URL(
						work_data, chapter_NO)
						+ 'history.ashx'), function(XMLHttp) {

					get_token(image_NO, run_next);

				}, null, history_parameters, Object.assign({
					error_retry : _this.MAX_ERROR_RETRY,
					no_warning : true
				}, _this.get_URL_options));

			}, DM5.IMAGE_COUNT, 1, function() {
				// .unique() 應該會過得相同的結果
				// this_image_list = this_image_list.unique();

				work_data.image_list[chapter_NO] = this_image_list;
				// _this.save_work_data(work_data);
				// console.log(this_image_list);

				callback();
			});

			// --------------------------------------

			// 從 dm5 網站獲得 token 通行碼。
			function get_token(image_NO, run_next) {
				parameters.page = image_NO;
				// library_namespace.set_debug(6);
				// console.log(new URLSearchParams(parameters).toString());
				_this.get_URL(_this.chapter_URL(work_data, chapter_NO)
						+ 'chapterfun.ashx', function(XMLHttp, error) {
					if (error) {
						if (_this.skip_error) {
							try {
								_this.onerror(error, work_data);
							} catch (e) {
								// TODO: handle exception
							}
						} else {
							_this.onerror(error, work_data);
						}
						run_next();
						return;
					}

					var html = XMLHttp.responseText;
					// console.log(html);
					if (html === '错误的请求') {
						var warning = work_data.title + ' #' + chapter_NO + '-'
								+ image_NO + ': ' + html;
						_this.onerror(warning, work_data);
						library_namespace.warn(warning);
						run_next();
						return;
					}
					try {
						// https://github.com/kanasimi/work_crawler/issues/81
						html = eval(html.replace(/^eval/, ''));
					} catch (e) {
						var message = work_data.title + ' #' + chapter_NO + '-'
								+ image_NO + ': 無法從 dm5 網站獲得 token: ' + e;
						library_namespace.error(message);
						_this.onwarning(message, work_data);
						console.trace(e);
						// console.log(html);
						run_next();
						return;
					}
					// console.log(html);
					var image_list = eval(html);
					if (false) {
						console.log(work_data.title + ' #' + chapter_NO + '-'
								+ image_NO + ':');
						console.log(image_list);
					}
					// image_list = [ 本圖url, 下一張圖url ]
					image_list.forEach(function(url, index) {
						var previous_url
						//
						= this_image_list[index += image_NO - 1];
						if (previous_url && previous_url !== url) {
							var warning = work_data.title + ' #' + chapter_NO
									+ '-' + image_NO + ': url:\n	  '
									+ previous_url + '	→' + url;
							_this.onerror(warning, work_data);
						}
						this_image_list[index] = url;
					});
					get_image_file(image_NO, image_list, run_next);

				}, parameters, true);
			}

			// --------------------------------------

			function get_image_file(image_NO, image_list, run_next) {
				// console.trace(encodeURI(image_list[0]));
				library_namespace.get_URL_cache(encodeURI(image_list[0]),
				//
				function(data, error, XMLHttp) {
					// console.trace([ XMLHttp, error ]);
					if (error) {
						if (_this.skip_error) {
							try {
								_this.onerror(error, image_list[0]);
							} catch (e) {
								// TODO: handle exception
							}
						} else {
							_this.onerror(error, image_list[0]);
						}
					}
					run_next();
				}, {
					file_name : image_file_path_of(image_NO),
					no_write_info : true,
					encoding : undefined,
					charset : _this.charset,
					get_URL_options : Object.assign({
						error_retry : _this.MAX_ERROR_RETRY
					}, _this.get_URL_options)
				});
			}

		},

		parse_chapter_data : function(html, work_data, get_label, chapter_NO) {
			// console.log(html);
			return {
				// 圖片已經先在前面 get_image_file() 下載完了。
				images_downloaded : true
			};

			// console.log(work_data.image_list[chapter_NO]);
			var chapter_data = {
				image_list : work_data.image_list[chapter_NO]
				//
				.map(function(url) {
					url = library_namespace.HTML_to_Unicode(url);
					// https://github.com/kanasimi/work_crawler/issues/536
					if (url.includes('/images/war.jpg'))
						return {};
					return {
						url : encodeURI(url)
					}
				})
			};

			// console.log(chapter_data);
			return chapter_data;
		},

		// 要用下面的函數必須指定 pre_parse_chapter_data : null
		parse_chapter_data_plain_link : function(html, work_data, get_label,
				chapter_NO) {
			// console.log(html);
			var chapter_data = work_data.chapter_list[chapter_NO - 1];
			// console.log(chapter_data);
			chapter_data.image_list = [];

			/**
			 * <code>

			<div class="comiclist">
			<div class="comicpage">
			<div>
			<img class="lazy" data-original="https://img.r2hm.com/static/upload/book/383/22256/519403.jpg" src="http://ws3.sinaimg.cn/large/006WnUdgly1g1m4frs9fyg30b40tnqf7.jpg">
			</div>
			</div>
			</div>
			<div class="fanye">
			<a href="/chapter/1541" class="block" title="第2话">下一章</a>
			</div>
			</code>
			 * 
			 */
			html = html.between('<div class="comicpage">',
			//
			'<div class="fanye">')
			/**
			 * mymhh.js: <code>

			<div class="view-main-1 readForm" id="cp_img">
			<!--<img class="lazy" data-original="https://pic.mumumh.com/static/upload/book/250/9062/438.jpg"
			src="https://pic.mumumh.com/static/upload/book/loading.gif">-->

			<img width="100%" data-original="https://pic.mumumh.com/static/upload/book/523/20704/901893.jpg" class="comic_img lazy" style="display: inline;" id="美丽新世界-第8话 - 我们是同一条船上的人了" src="https://pic.mumumh.com/static/upload/loading.gif">
			<!--<img class="lazy" data-original="https://pic.mumumh.com/static/upload/book/250/9062/438.jpg"
			src="https://pic.mumumh.com/static/upload/book/loading.gif">-->


			</div>

			</code>
			 */
			|| html.between(' id="cp_img">', '</div>')
			//
			.replace(/<\!--[\s\S]*?-->/g, '');

			// console.log(html);

			html.each_between('data-original="', '"', function(url) {
				chapter_data.image_list.push(url);
			});

			return chapter_data;
		}

	};

	// --------------------------------------------------------------------------------------------

	function new_dm5_comics_crawler(configuration, callback, initializer) {
		// library_namespace.set_debug(9);
		configuration = configuration ? Object.assign(Object.create(null),
				default_configuration, configuration) : default_configuration;

		if (configuration.image_API) {
			Object.assign(configuration, {
				pre_parse_chapter_data
				// tohomh.js, ikmhw.js
				: configuration.pre_parse_chapter_data_API,
				parse_chapter_data : null
			});
		} else if (!configuration.pre_parse_chapter_data) {
			configuration.parse_chapter_data =
			// r2hm.js, hanmanwo.js
			configuration.parse_chapter_data_plain_link;
		}

		// 每次呼叫皆創建一個新的實體。
		var crawler = new library_namespace.work_crawler(configuration);

		// dm5.js: for <b>漫画</b>
		// 已被列为限制漫画，其中有部份章节可能含有暴力、血腥、色情或不当的语言等内容，不适合未成年观众，为保护未成年人，我们将对
		// <b>漫画</b> 进行屏蔽。如果你法定年龄已超过18岁。 请点击此处继续阅读！
		crawler.setup_value('cookie', 'isAdult=1');

		return crawler;
	}

	return new_dm5_comics_crawler;
}
