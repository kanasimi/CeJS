/**
 * @name CeL function for downloading webtoon comics.
 * 
 * @fileoverview 本檔案包含了解析並處理、批量下載 WEBTOON 韓國漫畫 的工具。
 * 
 * <code>

 CeL.webtoon(configuration).start(work_id);

 </code>
 * 
 * @see https://www.webtoons.com/
 * 
 * @since 2018/7/27 18:16:19 模組化。
 */

// More examples:
// @see
// https://github.com/kanasimi/work_crawler/blob/master/comic.cmn-Hans-CN/dongman.js
'use strict';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.work_crawler.webtoon',

	require : 'application.net.work_crawler.'
	// for CeL.to_file_name()
	+ '|application.net.'
	// for .detect_HTML_language(), .time_zone_of_language()
	+ '|application.locale.',

	// 設定不匯出的子函式。
	no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring

	// --------------------------------------------------------------------------------------------

	var default_configuration = {

		// one_by_one : true,
		base_URL : 'https://www.webtoons.com/',

		// 最小容許圖案檔案大小 (bytes)。
		// 對於有些圖片只有一條細橫桿的情況。
		MIN_LENGTH : 140,

		// 解析 作品名稱 → 作品id get_work()
		search_URL : function(work_title) {
			return 'https://ac.webtoons.com/ac?q='
					+ (this.language_code ? this.language_code + '%11' : '')
					+ encodeURIComponent(work_title)
					+ '&q_enc=UTF-8&st=1&r_lt=0&r_format=json&r_enc=UTF-8&_callback=jQuery'
					+ String(Math.floor(Math.random() * 1e10))
					+ String(Math.floor(Math.random() * 1e10)) + '_'
					+ Date.now() + '&_=' + Date.now();
		},
		parse_search_result : function(html) {
			var id_list = [], id_data = [];
			if (html.startsWith('{')) {
				html = JSON.parse(html);
			} else {
				// for callback
				html = eval('(' + html.between('(', {
					tail : ')'
				}) + ')');
			}

			html.items[0].forEach(function(work_data) {
				// console.log(work_data);
				if (work_data[1][0] === 'TITLE') {
					id_list.push(+work_data[3][0]);
					id_data.push(work_data[0][0]);
				}
			});

			return [ id_list, id_data ];
		},

		// 取得作品的章節資料。 get_work_data()
		work_URL : 'episodeList?titleNo=',
		parse_work_data : function(html, get_label, extract_work_data) {
			var matched = html
					.match(/<a href="([^<>"]+)"[^<>]+id="_btnEpisode">/),
			//
			text = html.between('<div class="info">', '</div>'),
			//
			work_data = {
				// 必要屬性：須配合網站平台更改。
				title : get_label(text.between('<h1 class="subj">', '</h1>')),
				author : get_label(html.between(
				// <meta property="com-linewebtoon:webtoon:author"
				// content="A / B" />
				':webtoon:author" content="', '"')),

				// 選擇性屬性：須配合網站平台更改。
				// 看第一集, 阅读第一话
				chapter_1_url : matched[1],
				status : [
						get_label(text.between('<h2 class="genre ', '</h2>')
								.between('>')),
						// 更新頻率 update_frequency
						get_label(html.between('<p class="day_info">', '</p>')) ],
				description : get_label(html.between(
				// ('<p class="summary">', '</p>')
				'<meta name="twitter:description" content="', '"')),
				last_update : get_label(html.between('<span class="date">',
						'</span>'))
			};
			// console.log(work_data);
			return work_data;
		},
		chapter_list_URL : function(work_id, work_data) {
			return work_data.chapter_1_url;
		},
		get_chapter_list : function(work_data, html) {
			var data = html.between('<div class="episode_lst">', '</ul>'), matched,
			//
			PATTERN_chapter = /<li[^<>]*>[\s\S]*?<a href="([^"<>]+)"[^<>]*>[\s\S]*?<span class="subj">([^<>]*)<\/span>[\s\S]*?<\/li>/g;

			work_data.chapter_list = [];
			while (matched = PATTERN_chapter.exec(data)) {
				var chapter_data = {
					url : matched[1],
					title : matched[2]
				};
				work_data.chapter_list.push(chapter_data);
			}
		},

		parse_chapter_data : function(html, work_data, get_label, chapter_NO) {
			var chapter_data = {
				// 設定必要的屬性。
				title : get_label(html.between(
						'<h1 class="subj_episode" title="', '"')),
				image_list : []
			}, PATTERN_image = /<img [^<>]+?data-url="([^<>"]+)"/g, matched;

			html = html.between('<div class="viewer_lst">',
					'<div class="episode_area"');

			while (matched = PATTERN_image.exec(html)) {
				chapter_data.image_list.push({
					url : matched[1]
				});
			}

			return chapter_data;
		}

	};

	// --------------------------------------------------------------------------------------------

	function new_webtoon_comics_crawler(configuration) {
		configuration = configuration ? Object.assign(library_namespace
				.null_Object(), default_configuration, configuration)
				: default_configuration;

		// 每次呼叫皆創建一個新的實體。
		return new library_namespace.work_crawler(configuration);
	}

	return new_webtoon_comics_crawler;
}
