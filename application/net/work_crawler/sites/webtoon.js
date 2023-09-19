/**
 * @name CeL module for downloading webtoon comics.
 * 
 * @fileoverview 本檔案包含了解析並處理、批量下載 WEBTOON 韓國漫畫 的工具。
 * 
 * <code>

 CeL.webtoon(configuration).start(work_id);

 </code>
 * 
 * @see https://www.webtoons.com/ https://github.com/Fastcampus-WPS-9th/Webtoon
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
	name : 'application.net.work_crawler.sites.webtoon',

	require : 'application.net.work_crawler.',

	// 設定不匯出的子函式。
	no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring

	// --------------------------------------------------------------------------------------------

	// 2021/12/4 Error: unable to verify the first certificate
	//
	// https://stackoverflow.com/questions/20082893/unable-to-verify-leaf-signature
	// for Error: unable to verify the first certificate
	// code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE'
	process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

	var default_configuration = {

		// one_by_one : true,
		base_URL : 'https://www.webtoons.com/',

		// 最小容許圖案檔案大小 (bytes)。
		// 對於有些圖片只有一條細橫桿的情況。
		// e.g., webtoon\167 吸血鬼也沒關係\0003 [第2話] 健忘症\167-3-036.png
		MIN_LENGTH : 130,

		// 解析 作品名稱 → 作品id get_work()
		search_URL : function(work_title) {
			// 預設方法(callback var API)
			return 'https://ac.webtoons.com/ac?q='
					+ (this.language_code ? this.language_code + '%11' : '')
					+ encodeURIComponent(work_title)
					+ '&q_enc=UTF-8&st=1&r_lt=0&r_format=json&r_enc=UTF-8&_callback=jQuery'
					+ String(Math.floor(Math.random() * 1e10))
					+ String(Math.floor(Math.random() * 1e10)) + '_'
					+ Date.now() + '&_=' + Date.now();
		},
		parse_search_result : function(html) {
			// console.log(html);
			if (html.startsWith('{')) {
				html = JSON.parse(html);
			} else {
				// for callback
				html = eval('(' + html.between('(', {
					tail : ')'
				}) + ')');
			}

			var id_list = [], id_data = [];
			html = html.items[0];
			if (html) {
				// assert: Array.isArray(html)
				html.forEach(function(work_data) {
					// console.log(work_data);
					if (work_data[1][0] === 'TITLE') {
						id_list.push(+work_data[3][0]);
						id_data.push(work_data[0][0]);
					}
				});
			}

			return [ id_list, id_data ];
		},

		// 取得作品的章節資料。 get_work_data()
		work_URL : function(work_id) {
			var matched = typeof work_id === 'string'
					&& work_id.match(/^([a-z]+)_(\d+)$/);
			if (matched) {
				// e.g., 投稿新星專區作品
				// https://www.webtoons.com/challenge/episodeList?titleNo=
				return matched[1] + '/episodeList?titleNo=' + matched[2];
			}
			return 'episodeList?titleNo=' + work_id;
		},
		parse_work_data : function(html, get_label, extract_work_data) {
			var matched = html
			/**
			 * 咚漫 2018/10/27? 改版 <code>
			<a  data-buried-obj="1" data-sc-name="PC_detail-page_read-first-btn"  href="//www.dongmanmanhua.cn/fantasy/zhexianlu/%E7%AC%AC%E9%9B%B6%E8%AF%9D-1/viewer?title_no=1307&episode_no=1" class="btn_type7 NPI=a:gofirst,g:zh_CN_zh-hans" id="_btnEpisode">阅读第一话<span class="ico_arr21"></span></a>
			</code>
			 */
			.match(/<a [^<>]*?href="([^<>"]+)"[^<>]+id="_btnEpisode">/),
			//
			text = html.between('<div class="info">', '</div>'),
			//
			work_data = {
				// 必要屬性：須配合網站平台更改。
				title : get_label(text.between('<h1 class="subj">', '</h1>')
				// https://www.webtoons.com/zh-hant/challenge/%E5%A6%82%E4%BD%A0%E6%89%80%E9%A1%98/list?title_no=166730
				|| text.between('<h3 class="subj _challengeTitle">', '<')),
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
			extract_work_data(work_data, html);
			// console.log(work_data);
			return work_data;
		},
		chapter_list_URL : function(work_id, work_data) {
			// return url of the first chapter
			return work_data.chapter_1_url;
		},
		get_chapter_list : function(work_data, html) {
			// console.log(html);
			var data = html.between('<div class="episode_lst">', '</ul>'), matched,
			/**
			 * 咚漫 2018/10/27? 改版 <code>
			<a data-sc-event-parameter="{ title_title:'谪仙录',titleNo:'1307',genre:FANTASY,subcategory_"0":DRAMAsubcategory_"1":FANTASY,picAuthor:泼克文化,wriAuthor:泼克文化,update_day:,serial_status:SERIES,reader_gender:男,episode_name:第零话 1,episodeNo:1,change_mode:'',is_read_complete:'',change_episode_direction:''}" data-sc-event-name="TitleReadChangeEpisode" data-buried-obj="1" data-sc-name="PC_read-page_image-episode-btn"  href="//www.dongmanmanhua.cn/fantasy/zhexianlu/%E7%AC%AC%E9%9B%B6%E8%AF%9D-1/viewer?title_no=1307&episode_no=1" class="on  N=a:vtw.llist,g:zh_CN_zh-hans">

			// 穿越時空愚到你	https://www.webtoons.com/zh-hant/drama/2019foolsday/list?title_no=1562
			<span class="subj">水下那一分鐘 ft. 奇奇怪怪 <夢境與真實></span>
			</code>
			 */
			PATTERN_chapter = /<li[^<>]*>[\s\S]*?<a [^<>]*?href="([^"<>]+)"[^<>]*>[\s\S]*?<span class="subj">([\s\S]*?)<\/span>[\s\S]*?<\/li>/g;

			work_data.chapter_list = [];
			while (matched = PATTERN_chapter.exec(data)) {
				var chapter_data = {
					url : matched[1],
					title : matched[2]
				};
				work_data.chapter_list.push(chapter_data);
			}
			// console.log(work_data.chapter_list);
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
				/**
				 * <code>
				e.g., https://github.com/kanasimi/work_crawler/issues/609
				https://www.webtoons.com/en/drama/whos-mr-president/episode-30/viewer?title_no=4117&episode_no=30
				<img src="https://webtoons-static.pstatic.net/image/bg_transparency.png" width="800" height="1280.0" alt="image" class="_images" data-url="https://webtoon-phinf.pstatic.net/20220926_15/1664179088538pQVIx_JPEG/Who&amp;#39;s_Mr._President_Episode_30_(FINAL)_0006.jpg?type=q90"
				</code>
				 */
				matched = matched[1].replace(/&amp;/g, '&');
				matched = library_namespace.HTML_to_Unicode(matched);
				matched = new library_namespace.URI(matched);
				// 去掉?type=q70s的部分 畫質較好 q70是手機版 q90是電腦版
				delete matched.search_params.type;
				// 去除?x-oss-process=image/quality,q_90 可會有更高的畫質
				delete matched.search_params['x-oss-process'];
				chapter_data.image_list.push({
					url : encodeURI(matched.toString())
				});
			}

			return chapter_data;
		}

	};

	// --------------------------------------------------------------------------------------------

	function new_webtoon_comics_crawler(configuration) {
		configuration = configuration ? Object.assign(Object.create(null),
				default_configuration, configuration) : default_configuration;

		// 每次呼叫皆創建一個新的實體。
		var crawler = new library_namespace.work_crawler(configuration);

		return crawler;
	}

	return new_webtoon_comics_crawler;
}
