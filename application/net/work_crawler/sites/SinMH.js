/**
 * @name CeL module for downloading SinMH CMS comics.
 * 
 * @fileoverview 本檔案包含了解析並處理、批量下載中國大陸常見漫畫管理系統: 圣樱漫画管理系统 (圣樱CMS) MHD模板 PC端 的工具。
 * 
 * <code>

 CeL.SinMH(configuration).start(work_id);

 </code>
 * 
 * TODO: ONE漫画 https://www.onemanhua.com/ 可能是比 930mh.js 更舊的版本?
 * 
 * @see https://cms.shenl.com/sinmh/
 * @see https://www.manhuadui.com/js/common.js "Created by Shen.L on 2016/1/28."
 * 
 * @since 2018/7/26 11:9:53 模組化 MHD模板。<br />
 *        2019/2/4 add 930mh.js 使用 CryptoJS，採用 DMZJ模板。<br />
 *        2019/7/2 50mh.js 使用 CryptoJS，採用 DMZJ模板。
 */

// More examples:
// @see
// https://github.com/kanasimi/work_crawler/blob/master/comic.cmn-Hans-CN/36mh.js
// https://github.com/kanasimi/work_crawler/blob/master/comic.cmn-Hans-CN/gufengmh.js
// https://github.com/kanasimi/work_crawler/blob/master/comic.cmn-Hans-CN/930mh.js
'use strict';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.work_crawler.sites.SinMH',

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

		// 嘗試取得被屏蔽的作品。
		// 對於被屏蔽的作品，將會每次都從頭檢查。
		try_to_get_blocked_work : true,

		// 當有多個分部的時候才重新檢查。
		recheck : 'multi_parts_changed',

		// allow .jpg without EOI mark.
		// allow_EOI_error : true,
		// 當圖像檔案過小，或是被偵測出非圖像(如不具有EOI)時，依舊強制儲存檔案。
		// skip_error : true,

		// 提取出引數（如 URL）中的作品ID 以回傳。
		extract_work_id : function(work_information) {
			// e.g,
			// https://www.36mh.com/manhua/IDOLiSH7ouxiangxingyuanxiangliuxingxuyuan/
			return /^[a-z\d]+$/i.test(work_information) && work_information;
		},

		// 取得伺服器列表。
		// use_server_cache : true,
		server_URL : 'js/config.js',
		parse_server_list : function(html) {
			var server_list = [], SinConf;
			// console.trace(html);
			if (/^\s*var cars/.test(html)) {
				// for manhuaniu.js 2021/1/19 改版
				html = html.replace('var SinConf', 'SinConf').replace(
						/\n}\(\);[\s\S]*/, '}();SinConf.cars=cars;');
			} else {
				html = html.replace('var ', '').replace(/(}\(\))[\s\S]*/, '$1');
			}
			// console.trace(html);
			eval(html);

			function append_path(host) {
				return host.endsWith('/') ? host : host + '/';
			}
			SinConf.resHost.map(function(data) {
				server_list.append(data.domain.map(append_path));
			});
			if (SinConf.cars) {
				server_list.append(SinConf.cars.map(append_path));
			}
			server_list = server_list.unique();
			// for manhuaniu.js 2021/1/19 改版
			server_list = server_list.filter(function(server) {
				return !server.includes('restp.dongqiniqin');
			});
			server_list.conf = SinConf;
			// console.log(SinConf);
			// console.log(server_list);
			return server_list;
		},

		// 解析 作品名稱 → 作品id get_work()
		// 1. 使用 PC端 網頁取得搜尋所得的作品資料。 (default)
		search_URL : 'search/?keywords=',
		// 2. 使用API取得搜尋所得的作品資料。 (set search_URL:'API')
		search_URL_API : function(work_title) {
			// SinConf.apiHost
			var apiHost = this.api_base_URL
					|| this.base_URL.replace(/\/\/[a-z]+/, '//api');
			return [ apiHost + 'comic/search', {
				keywords : work_title
			} ];
		},
		parse_search_result : function(html, get_label) {
			// console.log(html);
			if (html.startsWith('{')) {
				// 2. 使用API取得搜尋所得的作品資料。
				/**
				 * e.g.,<code>
				{"items":[{"id":3542,"status":1,"commend":0,"is_original":0,"is_vip":0,"name":"军阀霸宠：纯情妖女火辣辣","title":"民国妖闻录","alias":"","original_name":"","letter":"j","slug":"junfabachongchunqingyaonuhuolala","coverUrl":"http://res.gufengmh.com/images/cover/201711/1509877682Xreq-5mrrSsDm82P.jpg","uri":"/manhua/junfabachongchunqingyaonuhuolala/","last_chapter_name":"040：纯良少年的堕落","last_chapter_id":235075,"author":"逐浪动漫","author_id":3901,"serialise":1}],"_links":{"self":{"href":"http://api.gufengmh.com/comic/search?page=1"}},"_meta":{"totalCount":1,"pageCount":1,"currentPage":1,"perPage":20},"status":0}
				 </code>
				 */
				var id_data = html ? JSON.parse(html).items : [];
				// console.log(id_data);
				return [ id_data, id_data ];
			}

			// 1. 使用 PC端 網頁取得搜尋所得的作品資料。
			// e.g., 36mh.js
			var id_list = [], id_data = [], matched,
			// matched: [ all, url, inner (title) ]
			PATTERN_search = /<p class="ell"><a href="([^<>"]+)">([^<>]+)/g;

			if (matched = html.between('<h4 class="fl">')) {
				html = matched;
				// matched: [ all, url, inner (title) ]
				// PATTERN_search = /<p class="ell"><a
				// href="([^<>"]+)">([^<>]+)/g;

			} else if (matched = html.between('<div id="update_list">')) {
				// 行動版 mobile version
				// e.g., <div id="update_list"><div class='UpdateList'><div
				// class="itemBox" data-key="10992">
				html = matched;
				// e.g., <a class="title"
				// href="https://m.36mh.com/manhua/dushizhixiuzhenguilai/"
				// target="_blank">都市之修真归来</a>
				// matched: [ all, url, inner (title) ]
				PATTERN_search = /<a class="title" href="([^<>"]+)"[^<>]*>([^<>]+)/g;

			} else {
				// throw new Error('Unknown site!');
			}

			while (matched = PATTERN_search.exec(html)) {
				// .html: mh1234.js
				matched[1] = matched[1].match(/([^\/]+)(?:\/|\.html)$/);
				id_list.push(matched[1][1]);
				id_data.push(get_label(matched[2]));
			}

			return [ id_list, id_data ];
		},
		// e.g., 50mh.js
		// id_of_search_result : 'slug',

		// 取得作品的章節資料。 get_work_data()
		work_URL : function(work_id) {
			// console.log(work_id);
			return 'manhua/' + work_id + '/';
		},
		parse_work_data : function(html, get_label, extract_work_data) {
			// console.log(html);
			var work_data = {
				// 必要屬性：須配合網站平台更改。
				title : get_label(html.between('<h1>', '</h1>')),

				// 選擇性屬性：須配合網站平台更改。
				description : get_label(html.between('intro-all', '</div>')
						.between('>')
						// 930mh.js
						|| html.between('<p class="comic_deCon_d">', '</p>')
						// copy from 733mh.js: for mh1234.js
						|| html.between(
								'<div class="introduction" id="intro1">',
								'</div>'))
			};

			// <div class="book-detail pr fr">
			// <ul class="detail-list cf">
			// ...
			// </ul>
			// <a class="intro-act" id="intro-act" href="javascript:;">展開詳情</a>
			extract_work_data(work_data, html.between('detail-list', '</ul>'),
			// e.g., "<strong>漫画别名：</strong>暂无</span>"
			// gufengmh.js:<li><span><strong>漫画类型：</strong>...</span><span><strong>漫画作者：</strong>...</span></li>
			/<strong[^<>]*>([^<>]+)<\/strong>([\s\S]+?)<\/(?:li|span)>/g);
			// console.log(html.between('detail-list', '</ul>'));
			// console.log(work_data);

			// 930mh.js
			extract_work_data(work_data, html
					.between('<ul class="comic_deCon_liT">',
							'<p class="comic_deCon_d">')
					// <li>时间：2019-02-04 <li>最新：<a
					// href="/manhua/17884/668443.html">第6话</a></li>
					.replace(/<li>/g, '</li><li>'),
			// e.g., "<li>类别：<a href="/list/shaonian/">少年</a></li>"
			/<li>([^：]+)：([\s\S]+?)<\/li>/g);

			// copy from 733mh.js: for mh1234.js
			extract_work_data(work_data, html.between('<div class="info">',
					'<div class="info_cover">'),
					/<em>([^<>]+?)<\/em>([\s\S]*?)<\/p>/g);

			// 由 meta data 取得作品資訊。
			extract_work_data(work_data, html);

			Object.assign(work_data, {
				author : work_data.漫画作者 || work_data.漫畫作者 || work_data.作者
						|| work_data.原著作者,
				status : work_data.漫画状态 || work_data.漫畫狀態 || work_data.状态,
				last_update : work_data.更新时间 || work_data.时间,
				latest_chapter : work_data.最新 || work_data.更新至
						|| get_label(html.between('<span class="text">更新至',
						// for 36mh.js: "更新至：", 999comics.js: "更新至:"
						'</span>').replace(/^[：:]/, '')),
				latest_chapter_url : html.between('最新：<a href="', '"')
				// for 36mh.js
				|| html.between('更新至 [ <a href="', '"')
				// gufengmh.js
				|| html.between('更新至：</strong><a href="', '"')
			});

			// console.log(work_data);
			if (!work_data.last_update && work_data.status) {
				// for 36mh.js
				var matched = work_data.status
						.match(/^([\s\S]+?)最近[于於]([\s\S]+?)$/);
				if (matched) {
					Object.assign(work_data, {
						status : matched[1],
						last_update : matched[2].replace(
								/^[\s\n]*\[|\][\s\n]*$/g, '').trim()
					});
				}
			}
			if (!work_data.last_update) {
				// for 999comics.js
				var matched = html.match(/最近[于於]([\s\S]+?)<\//);
				// console.log(matched);
				if (matched) {
					work_data.last_update = get_label(matched[1].replace(
							/^[\s\n]*\[|\][\s\n]*$/g, ''));
				}
			}

			// console.log(work_data);
			return work_data;
		},
		get_chapter_list : function(work_data, html, get_label) {
			// console.log(work_data);

			var chapter_block, PATTERN_chapter_block = html
					.includes('class="chapter-body')
			// <div class="chapter-category clearfix">
			// <div class="chapter-body clearfix">
			? /class="chapter-(body|category)[^<>]+>([\s\S]+?)<\/div>/g
			// 930mh.js
			// <div class="zj_list_head">...<h2>章节<em class="c_3">列表</em></h2>
			// <div class="zj_list_head_px" data-key="6"><span>排序 :...</div>
			// <div class="zj_list_con autoHeight">...</div>
			: /class="zj_list_(con|head)[^<>]+>([\s\S]+?)<\/div>/g,
			//
			latest_chapter_list = work_data.chapter_list;
			// reset work_data.chapter_list
			work_data.chapter_list = [];
			// 漫畫目錄名稱不須包含分部號碼。使章節目錄名稱不包含 part_NO。
			// 將會在 function get_chapter_directory_name() 自動設定。
			// work_data.chapter_list.add_part_NO = false;

			while (chapter_block = PATTERN_chapter_block.exec(html)) {
				// delete chapter_block.input;
				// console.log(chapter_block);
				if (chapter_block[1] === 'category') {
					// console.log(chapter_block[2]);
					// e.g., 决断地 @ gufengmh
					chapter_block = chapter_block[2]
					// <div class="caption pull-left"><span>章节</span></div>
					// <div class="caption pull-left"><span>单话</span></div>
					.match(/class="caption[^<>]+>([\s\S]+)/);
					// console.log(chapter_block);
					if (chapter_block) {
						this.set_part(work_data, chapter_block[1]);
					}
					continue;
				}

				if (chapter_block[1] === 'head') {
					// console.log(chapter_block[2]);
					// 930mh.js
					// e.g., http://www.duzhez.com/manhua/269/
					chapter_block = chapter_block[2]
					// <h2>章节<em class="c_3">列表</em></h2>
					// <h2>番外篇<em class="c_3">列表</em></h2>
					.between('<h2>', '<em class="c_3">列表</em>');
					// console.log(chapter_block);
					if (chapter_block) {
						this.set_part(work_data, chapter_block);
					}
					continue;
				}

				chapter_block = chapter_block[2];
				var link, PATTERN_chapter_link =
				//
				/<a href="([^<>"]+)"[^<>]*>([\s\S]+?)<\/a>/g;
				while (link = PATTERN_chapter_link.exec(chapter_block)) {
					if (link[1].startsWith('javascript:')) {
						// 本站应《 》版权方要求现已屏蔽删除本漫画所有章节链接，只保留作品文字信息简介以及章节目录
						continue;
					}
					var chapter_data = {
						url : link[1],
						title : get_label(link[2])
					};
					this.add_chapter(work_data, chapter_data);
					// console.log(work_data.chapter_list);
					// console.log(chapter_data);
				}
			}

			this.check_filtered(work_data, html, get_label,
			//
			latest_chapter_list);
			work_data.inverted_order = this.chapter_inverted_order;
			// console.log(work_data.chapter_list);
			// throw work_data.chapter_list.length;
		},
		// 注意：在呼叫本函數之前，不可改變 html！
		check_filtered : function(work_data, html, get_label,
				latest_chapter_list) {
			// console.log(work_data);
			// console.log(work_data.chapter_list);
			var text = work_data.chapter_list.length === 0 && get_label(
			/**
			 * 已屏蔽删除本漫画所有章节链接 e.g., <code>

			// 930mh.js 一人之下
			<div class="zj_list_con autoHeight">
			<p class="ip-notice" style="padding:10px;color: red;background:snow;font-size:14px;width:875px;">
			尊敬的各位喜爱一人之下漫画的用户，本站应《一人之下》版权方要求现已屏蔽删除本漫画所有章节链接，只保留作品文字信息简介以及章节目录，请喜欢一人之下的漫友购买杂志或到官网付费欣赏。为此给各位漫友带来的不便，敬请谅解！
			</p>
			</div>

			// mh1234.js
			<div class="ip-body">
			<p class="ip-notice">
			    尊敬的各位喜爱妖精种植手册漫画的用户，本站应《妖精种植手册                》版权方要求现已屏蔽删除本漫画所有章节链接，只保留作品文字信息简介以及章节目录，请喜欢妖精种植手册                的漫友购买杂志或到官网付费欣赏。为此给各位漫友带来的不便，敬请谅解！
			</p>
			<p>
			    版权方在线阅读地址: <span><a href="http://www.mh1234.com" rel="nofollow">http://www.mh1234.com</a></span>
			</p>
			</div>

			</code>
			 */
			html.between('<p class="ip-notice"', '</p>').between('>')
			//
			|| html.between('class="ip-body">', '</div>'));

			// console.log(text);
			if (!text) {
				return;
			}

			work_data.removed = text;

			var chapter_id = html.between('href="/comic/read/?id=', '"')
					|| html.between('SinMH.initComic(', ')')
					|| html.between('SinTheme.initComic(', ')')
					|| html.between('var pageId = "comic.', '"');

			if (this.try_to_get_blocked_work && chapter_id) {
				library_namespace.info([ work_data.title || work_data.id, ': ',
						{
							// gettext_config:{"id":"trying-to-get-the-blocked-work"}
							T : '嘗試取得被屏蔽的作品。'
						} ]);
				if (Array.isArray(latest_chapter_list)
				// e.g., 全职法师, 一人之下 http://www.duzhez.com/manhua/1532/
				&& latest_chapter_list.length > 1
				//
				&& (!this.recheck || this.recheck in {
					changed : true,
					multi_parts_changed : true
				})) {
					library_namespace.info({
						// gettext_config:{"id":"using-the-previous-cache-to-download-§$1"}
						T : [ '使用之前的快取，自 §%1 接續下載。',
						//
						latest_chapter_list.length ]
					});
					// 這可以保留 work_data.chapter_list 先前的屬性。
					work_data.chapter_list = Object.assign(latest_chapter_list,
							work_data.chapter_list);
					work_data.last_download.chapter = latest_chapter_list.length;

				} else {
					this.add_chapter(work_data,
					//
					'/comic/read/?id=' + chapter_id);
				}

			} else {
				library_namespace.warn(text);
			}
		},

		pre_parse_chapter_data
		// 執行在解析章節資料 process_chapter_data() 之前的作業 (async)。
		// 必須自行保證執行 callback()，不丟出異常、中斷。
		: function(XMLHttp, work_data, callback, chapter_NO) {
			var html = XMLHttp.responseText;
			if (work_data.removed && chapter_NO === 1) {
				var first_chapter_id = html.between('SinMH.initChapter(', ',')
						|| html.between('SinTheme.initChapter(', ',');
				// console.log(html);
				if (first_chapter_id) {
					library_namespace.debug('add first chapter: '
							+ first_chapter_id);
					var url = this.work_URL(work_data.id) + first_chapter_id
							+ '.html';
					work_data.chapter_list[chapter_NO - 1].url = url;
					this.get_URL(url, callback, null, {
						error_retry : this.MAX_ERROR_RETRY,
						no_warning : true
					});
					return;
				}
			}

			var crypto_url = html
			// 930mh.js: Error on http://www.duzhez.com/manhua/449/245193.html
			&& html
			// https://www.manhuadui.com/manhua/haizeiwang/296660.html :
			// <script
			// src="https://cdn.staticfile.org/crypto-js/3.1.9-1/crypto-js.js"></script>
			.match(/<script src="([^"]+\/crypto(?:-js)?\.js)"><\/script>/);
			// console.log(crypto_url);
			if (crypto_url) {
				var file_name = this.main_directory + 'crypto.js';
				// TODO: this is a workaround to pass to require()
				if (!library_namespace.is_absolute_path(file_name)) {
					file_name = process.cwd()
							+ library_namespace.env.path_separator + file_name;
				}
				// console.log(file_name);

				library_namespace.get_URL_cache(this.full_URL(crypto_url[1]),
				// @see function cops201921() @
				// http://www.duzhez.com/js/cops201921.js
				function(data, error, XMLHttp) {
					// data = data.toString();

					// @see https://code.google.com/archive/p/crypto-js/
					// 懶得自己寫，直接 including。
					global.CryptoJS = require(file_name);

					callback();
				}, {
					file_name : file_name,
					get_URL_options : this.get_URL_options
				});
				return;
			}

			callback();
		},

		// 取得每一個章節的各個影像內容資料。 get_chapter_data()
		parse_chapter_data : function(html, work_data, get_label, chapter_NO) {
			// console.log(html);
			if (work_data.removed && !work_data.chapter_filtered) {
				var next_chapter_data = html.between('nextChapterData =', ';');
				// console.log(next_chapter_data || html);
				if (next_chapter_data
				// next_chapter_data==='' @
				// https://www.mh1234.com/comic/9384.html
				&& (next_chapter_data = JSON.parse(next_chapter_data))
						&& next_chapter_data.id > 0) {
					library_namespace.debug('add chapter: '
							+ next_chapter_data.id);
					next_chapter_data.url = this.work_URL(work_data.id)
							+ next_chapter_data.id + '.html';
					// 動態增加章節。
					work_data.chapter_count++;
					work_data.chapter_list.push(next_chapter_data);
				} else {
					// console.log(html);
				}
			}

			// console.log(work_data.chapter_list);
			var chapter_data = work_data.chapter_list[chapter_NO - 1],
			// <!--全站头部导航 结束-->\n<script>
			chapter_data_code = html
			// 930mh.js: Error on http://www.duzhez.com/manhua/449/245193.html
			&& (html.match(/<script>(;var [\s\S]+?)<\/script>/)
			// for manhuaniu.js 2021/1/19 改版
			|| html.match(/<script>(var siteName = "";[\s\S]+?)<\/script>/));
			// console.trace(chapter_data_code);
			if (!chapter_data_code) {
				library_namespace.warn({
					// gettext_config:{"id":"unable-to-parse-chapter-data-for-«$1»-§$2"}
					T : [ '無法解析《%1》§%2 之章節資料！', work_data.title, chapter_NO ]
				});
				return;
			}

			// console.trace(chapter_data_code[1]);
			// eval(chapter_data_code[1].replace(/;var /g, ';chapter_data.'));
			chapter_data_code[1].split(';var ').forEach(function(token) {
				if (!token.includes('='))
					return;

				token = token.replace(/^\s*var\s/, '');
				// console.trace(token);
				try {
					eval('chapter_data.' + token);
				} catch (e) {
					console.error(new SyntaxError(
					// Ignore SyntaxError. e.g.,
					// https://www.gufengmh8.com/manhua/wodeshashounanyou/742494.html
					// ;var pageTitle = "我的杀手男友第65、66话 "肉偿在线观看";
					'parse_chapter_data: ' + token));
				}
			});
			// console.log(chapter_data);

			// 設定必要的屬性。
			chapter_data.title = get_label(html.between('<h2>', '</h2>'))
			// e.g., mh1234.js has no <h2>...</h2>'
			|| chapter_data.title;
			// e.g., 'images/comic/4/7592/'
			var path = encodeURI(chapter_data.chapterPath);
			// console.log(chapter_data.chapterImages);
			if (global.CryptoJS
					&& typeof chapter_data.chapterImages === 'string') {
				// console.log(chapter_data.chapterImages);
				// console.log(this.crypto);

				/**
				 * <code>
				JSON.parse(CryptoJS.AES.decrypt(chapterImages,CryptoJS.enc.Utf8.parse("6133AFVvxas55841"),{iv:CryptoJS.enc.Utf8.parse("A25vcxQQrpmbV51t"),mode:CryptoJS.mode.CBC,padding:CryptoJS.pad.Pkcs7}).toString(CryptoJS.enc.Utf8))
				</code>
				 * 
				 * @see https://segmentfault.com/q/1010000011225051
				 */
				chapter_data.chapterImages =
				// 使用 CryptoJS https://code.google.com/archive/p/crypto-js/
				// https://github.com/brix/crypto-js
				JSON.parse(CryptoJS.AES.decrypt(chapter_data.chapterImages,
				// 930mh.js key 密鑰 "十六位字符作为密钥"
				CryptoJS.enc.Utf8.parse(this.crypto.key), {
					iv : CryptoJS.enc.Utf8.parse(this.crypto.iv),
					mode : CryptoJS.mode.CBC,
					padding : CryptoJS.pad.Pkcs7
				}).toString(CryptoJS.enc.Utf8));
			}

			// console.trace(chapter_data);
			if (!chapter_data.chapterImages.map
					&& chapter_data.chapterImages[0]) {
				// e.g., https://www.ymh1234.com/comic/20693/1223511.html
				// 万古最强宗 88 我踢球的
				// {'0':'....jpg','2':...}
				chapter_data.chapterImages = Object
						.values(chapter_data.chapterImages);
			}

			// assert: Array.isArray(chapter_data.chapterImages)
			chapter_data.image_list = chapter_data.chapterImages.map(function(
					url) {
				return {
					// e.g., 外挂仙尊 184 第76话
					// 但是這還是沒辦法取得圖片...
					url : encodeURI(/^https?:\/\//.test(url) ? url
					//
					: path + url)
				}
			});

			if (chapter_data.image_list.length === 0
					&& (html = html.between('class="ip-notice">', '<'))) {
				// 避免若連內容被屏蔽，會從頭檢查到尾都沒有成果。
				work_data.chapter_filtered = true;
				if (work_data.removed) {
					library_namespace.info({
						// gettext_config:{"id":"§$1-has-been-blocked-and-no-longer-attempts-to-resolve-other-chapters"}
						T : [ '§%1 已被屏蔽，不再嘗試解析其他章節。', chapter_NO ]
					});
				} else {
					library_namespace.warn(get_label(html));
				}
			}

			// console.log(chapter_data);

			return chapter_data;
		}

	};

	// --------------------------------------------------------------------------------------------

	function new_SinMH_comics_crawler(configuration) {
		configuration = configuration ? Object.assign(Object.create(null),
				default_configuration, configuration) : default_configuration;

		if (configuration.search_URL === 'API') {
			configuration.search_URL = default_configuration.search_URL_API;
			// 因為不見得會執行到 parse_search_result()，不可放在 parse_search_result() 裡面。
			if (!configuration.id_of_search_result) {
				// gufengmh.js: using 'slug'
				configuration.id_of_search_result = 'id';
			}
			configuration.title_of_search_result = 'title';
		}

		// 每次呼叫皆創建一個新的實體。
		return new library_namespace.work_crawler(configuration);
	}

	// for CeL.application.net.work_crawler.sites.SinMH2013
	new_SinMH_comics_crawler.default_configuration = default_configuration;

	return new_SinMH_comics_crawler;
}
