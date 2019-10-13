﻿/**
 * @name WWW work crawler sub-functions
 * 
 * @fileoverview WWW work crawler functions: part of image
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
		name : 'application.net.work_crawler.image',

		require : 'application.net.work_crawler.',

		// 設定不匯出的子函式。
		no_extend : '*',

		// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
		code : module_code
	});
}

function module_code(library_namespace) {

	// requiring
	var Work_crawler = library_namespace.net.work_crawler, code_namespace = Work_crawler.code_namespace;

	var gettext = library_namespace.locale.gettext,
	/** node.js file system module */
	node_fs = library_namespace.platform.nodejs && require('fs');

	// --------------------------------------------------------------------------------------------

	function image_path_to_url(path, server) {
		if (path.includes('://')) {
			return path;
		}

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

	// 下載單一個圖片。
	// callback(image_data, status)
	function get_image(image_data, callback, images_archive) {
		// console.log(image_data);
		if (!image_data || !image_data.file || !image_data.url) {
			if (image_data) {
				image_data.has_error = true;
				image_data.done = true;
			}
			// 注意: 此時 image_data 可能是 undefined
			if (this.skip_error) {
				this.onwarning(gettext('未指定圖片資料'), image_data);
			} else {
				this.onerror(gettext('未指定圖片資料'), image_data);
			}
			if (typeof callback === 'function')
				callback(image_data, 'invalid_data');
			return;
		}

		/**
		 * 每張圖片都要檢查實際存在的圖片檔案。當之前已存在完整的圖片時，就不再嘗試下載圖片。<br />
		 * 工作機制：<br />
		 * 檢核預設的圖片延伸檔名/副檔名(.default_image_extension)。若是不存在預設的圖片延伸檔名/副檔名，將會檢查所有可以接受的圖片類別(.acceptable_types)。
		 * 每張圖片都要檢核所有可接受的圖片類別，會加大硬碟讀取負擔。
		 * 會用到.overwrite_old_file這個選項的，應該都是需要提報issue的，因此這個選項不會列出來。麻煩請在個別網站遇到此情況時提報issue，列出作品名稱以及圖片類別，以供這邊確認圖片類別。
		 * 只要存在完整無損害的預設圖片類別或是可接受的圖片類別，就直接跳出，不再嘗試下載這張圖片。否則會重新下載圖片。
		 * 當下載的圖片以之前的圖片更大時，就會覆蓋原先的圖片。
		 * 若下載的圖片類別並非預設的圖片類別(.default_image_extension)，例如預設JPG但得到PNG檔案時，會將副檔名改為實際得到的圖像格式。因此下一次下載時，需要設定.acceptable_types才能找得到圖片。
		 */
		var image_downloaded = node_fs.existsSync(image_data.file)
				|| this.skip_existed_bad_file
				// 檢查是否已有上次下載失敗，例如 server 上本身就已經出錯的檔案。
				&& node_fs.existsSync(this.EOI_error_path(image_data.file)), acceptable_types;

		if (!image_downloaded) {
			// 正規化 acceptable_types
			acceptable_types = image_data.acceptable_types
					|| this.acceptable_types;
			if (!acceptable_types) {
			} else if (typeof acceptable_types === 'string') {
				if (acceptable_types === 'images') {
					// 將會測試是否已經下載過一切可接受的檔案類別。
					acceptable_types = Object.keys(this.image_types);
				} else {
					acceptable_types = [ acceptable_types ];
				}
			} else if (!Array.isArray(acceptable_types)) {
				library_namespace.warn({
					T : [ 'Invalid acceptable_types: %1', acceptable_types ]
				});
				acceptable_types = null;
			}

			if (acceptable_types) {
				image_downloaded = acceptable_types.some(function(extension) {
					var alternative_filename = image_data.file.replace(
							/\.[a-z\d]+$/, '.' + extension);
					if (node_fs.existsSync(alternative_filename)) {
						image_data.file = alternative_filename;
						return true;
					}
				});
			}
		}

		// 檢查壓縮檔裡面的圖片檔案。
		var image_archived, bad_image_archived;
		if (images_archive && images_archive.fso_path_hash
		// 檢查壓縮檔，看是否已經存在圖像檔案。
		&& image_data.file.startsWith(images_archive.work_directory)) {
			image_archived = image_data.file
					.slice(images_archive.work_directory.length);
			bad_image_archived = images_archive.fso_path_hash[this
					.EOI_error_path(image_archived)];
			if (image_archived && bad_image_archived) {
				images_archive.to_remove.push(bad_image_archived);
			}

			if (false) {
				console.log([ images_archive.fso_path_hash, acceptable_types,
						image_archived,
						images_archive.fso_path_hash[image_archived] ]);
			}
			image_downloaded = image_downloaded
					|| images_archive.fso_path_hash[image_archived]
					|| this.skip_existed_bad_file
					// 檢查是否已有上次下載失敗，例如 server 上本身就已經出錯的檔案。
					&& bad_image_archived;

			if (!image_downloaded
			// 可以接受的圖片類別/圖片延伸檔名/副檔名/檔案類別 acceptable file extensions
			&& acceptable_types) {
				image_downloaded = acceptable_types.some(function(extension) {
					var alternative_filename = image_archived.replace(
							/\.[a-z\d]+$/, '.' + extension);
					return images_archive.fso_path_hash[alternative_filename];
				});
			}
		}

		if (image_downloaded) {
			// console.log('get_image: Skip ' + image_data.file);
			image_data.done = true;
			if (typeof callback === 'function')
				callback(image_data, 'image_downloaded');
			return;
		}

		// --------------------------------------

		var _this = this,
		// 漫畫圖片的 URL。
		image_url = image_data.url, server = this.server_list;
		if (server) {
			server = server[server.length * Math.random() | 0];
			image_url = this.image_path_to_url(image_url, server, image_data);
		} else {
			image_url = this.full_URL(image_url);
		}
		image_data.parsed_url = image_url;
		if (!code_namespace.PATTERN_non_CJK.test(image_url)) {
			library_namespace.warn({
				T : [ '必須先將URL編碼：%1', image_url ]
			});
			if (!image_url.includes('%'))
				image_url = encodeURI(image_url);
		}

		if (!image_data.file_length) {
			image_data.file_length = [];
		}

		this.get_URL(image_url, function(XMLHttp) {
			// console.log(XMLHttp);
			// console.log(image_data);
			if (image_data.url !== XMLHttp.responseURL) {
				// 紀錄最後實際下載的圖片網址。
				image_data.responseURL = XMLHttp.responseURL;
			}

			/** {Buffer}圖片數據的內容。 */
			var contents = XMLHttp.buffer;
			if (_this.image_preprocessor) {
				// 圖片前處理程序 預處理器 image pre-processing
				// 例如修正圖片結尾非正規格式之情況。
				// 必須自行確保不會 throw，需檢查 contents 是否非 {Buffer}。
				contents = _this.image_preprocessor(contents, image_data);
				if (contents === undefined)
					contents = XMLHttp.buffer;
			}

			var has_error = !contents || !(contents.length >= _this.MIN_LENGTH)
					|| (XMLHttp.status / 100 | 0) !== 2, verified_image;
			if (!has_error) {
				image_data.file_length.push(contents.length);
				library_namespace.debug({
					T : [ '測試圖片是否完整：%1', image_data.file ]
				}, 2, 'get_image');
				var file_type = library_namespace.file_type(contents);
				verified_image = file_type && !file_type.damaged;
				if (verified_image) {
					if (!(file_type.type in _this.image_types)) {
						library_namespace.warn({
							T : [
									file_type.type ? '無法處理類型為%2之圖片檔：%1'
											: '無法判別圖片檔之類型：%1', image_data.file,
									file_type.type ]
						});
					}
					if (!image_data.file.endsWith('.' + file_type.extension)
					//
					&& (!file_type.extensions || !file_type.extensions
					// accept '.jpeg' as alias of '.jpg'
					.includes(image_data.file.match(/[^.]*$/)[0]))) {
						// 依照所驗證的檔案格式改變副檔名。
						image_data.file = image_data.file.replace(/[^.]+$/,
						// e.g. .png
						file_type.extension
						// 若是沒有辦法判別延伸檔名，那麼就採用預設的圖片延伸檔名。
						|| _this.default_image_extension);
					}
				}
			}
			// verified_image===true 則必然(!!has_error===false)
			// has_error表示下載過程發生錯誤，光是檔案損毀，不會被當作has_error!
			// has_error則必然(!!verified_image===false)

			if (false) {
				console.log([ _this.skip_error, _this.MAX_ERROR_RETRY,
				//
				has_error, _this.skip_error
				//
				&& image_data.error_count === _this.MAX_ERROR_RETRY ]);
				library_namespace.log({
					T : [ '出錯次數：%1', image_data.error_count ]
				});
			}
			if (verified_image || image_data.is_bad || _this.skip_error
			// 有出問題的話，最起碼都需retry足夠次數。
			&& image_data.error_count === _this.MAX_ERROR_RETRY
			//
			|| _this.allow_EOI_error
			//
			&& image_data.file_length.length > _this.MAX_EOI_ERROR) {
				// console.log(image_data.file_length);
				if (verified_image || image_data.is_bad || _this.skip_error
				// skip error 的話，不管有沒有下載/獲取過檔案(包括404圖像不存在)，依然 pass。
				// && image_data.file_length.length === 0
				//
				|| image_data.file_length.cardinal_1()
				// ↑ 若是每次都得到相同的檔案長度，那就當作來源檔案本來就有問題。
				&& (_this.skip_error || _this.allow_EOI_error
				//
				&& image_data.file_length.length > _this.MAX_EOI_ERROR)) {
					// 圖片下載過程結束，不再嘗試下載圖片:要不是過關，要不就是錯誤太多次了。
					var bad_file_path = _this.EOI_error_path(image_data.file,
							XMLHttp);
					if (has_error || image_data.is_bad
							|| verified_image === false) {
						image_data.file = bad_file_path;
						image_data.has_error = true;
						if (_this.preserve_bad_image) {
							library_namespace.warn([ {
								T : has_error ? contents
								//
								? '強制將非圖片檔儲存為圖片' : '強制將空內容儲存為圖片'
								// assert: (!!verified_image===false)
								// 圖檔損壞: e.g., Do not has EOI
								: '強制儲存損壞的圖片'
							}, XMLHttp.status
							// 狀態碼正常就不顯示。
							&& (XMLHttp.status / 100 | 0) !== 2 ? {
								T : [ ' (status %1)', XMLHttp.status ]
							} : '',
							// 顯示 crawler 程式指定的錯誤。
							image_data.is_bad ? {
								T : [ ' (error: %1)', image_data.is_bad ]
							} : '', contents ? {
								T : [ ' %1 bytes', contents.length ]
							} : '',
							//
							': ' + image_data.file + '\n← ' + image_url ]);
						}
						if (!contents
						// 404之類，就算有內容，也不過是錯誤訊息頁面。
						|| (XMLHttp.status / 100 | 0) === 4) {
							contents = '';
						}
					} else {
						// pass, 過關了。
						if (node_fs.existsSync(bad_file_path)) {
							library_namespace.info({
								T : [ '刪除損壞的舊圖片檔：%1', bad_file_path ]
							});
							library_namespace.fs_remove(bad_file_path);
						}
						if (bad_image_archived) {
							// 登記壓縮檔內可以刪除的損壞圖檔。
							images_archive.to_remove.push(bad_image_archived);
						}
					}

					var old_file_status, old_archived_file =
					// image_data.has_error?bad_image_archived:image_archived
					image_archived || bad_image_archived;
					try {
						old_file_status = node_fs.statSync(image_data.file);
					} catch (e) {
						// old/bad file not exist
					}

					if (old_archived_file && (!old_file_status
					//
					|| old_archived_file.size > old_file_status.size)) {
						// 壓縮檔內的圖像質量更好的情況，那就採用壓縮檔的。
						if (old_file_status
								&& old_archived_file.size < contents.length) {
							library_namespace.warn({
								T : [ _this.archive_images
								//
								? '壓縮檔內的圖片品質比目錄中的更好，但在下載完後將可能在壓縮時被覆蓋：%1'
								//
								: '壓縮檔內的圖片品質比目錄中的更好：%1',
								//
								old_archived_file.path ]
							});
						}

						old_file_status = old_archived_file;
					}

					if (!old_file_status || _this.overwrite_old_file
					// 得到更大的檔案，寫入更大的檔案。
					&& !(old_file_status.size >= contents.length)) {
						if (_this.image_post_processor) {
							// 圖片後處理程序 image post-processing
							contents = _this.image_post_processor(contents,
									image_data
							// , images_archive
							)
									|| contents;
						}

						if (!image_data.has_error || _this.preserve_bad_image) {
							library_namespace.debug({
								T : [ '保存圖片數據到硬碟上：%1', image_data.file ]
							}, 1, 'get_image');
							// TODO: 檢查舊的檔案是不是文字檔。例如有沒有包含 HTML 標籤。
							try {
								node_fs
										.writeFileSync(image_data.file,
												contents);
							} catch (e) {
								library_namespace.error(e);
								var message = [ gettext('無法寫入圖片檔案 [%1]。',
										image_data.file) ];
								if (e.code === 'ENOENT') {
									message.push(gettext(
									// TODO: show chapter_directory 當前作品章節目錄：
									'可能因為作品下載目錄改變了，而 cache 資料指向不存在的舊位置。'));
								} else {
									message.push(gettext(
									//
									'可能因為作品資訊 cache 與當前網站上之作品章節結構不同。'));
								}
								message.push(gettext(
								//
								'若您之前曾經下載過本作品的話，請封存原有作品目錄，'
								// https://github.com/kanasimi/work_crawler/issues/278
								+ '或將作品資訊 cache 檔（作品目錄下的 作品id.json）'
								//
								+ '改名之後嘗試全新下載。'));
								_this.onerror(message.join('\n'), image_data);
								if (typeof callback === 'function') {
									callback(image_data,
											'image_file_write_error');
								}
								return Work_crawler.THROWED;
							}
						}
					} else if (old_file_status
							&& old_file_status.size > contents.length) {
						library_namespace.log({
							T : [
									'存在較大的舊檔 (%2)，將不覆蓋：%1',
									image_data.file,
									old_file_status.size + '>'
											+ contents.length ]
						});
					}
					image_data.done = true;
					if (typeof callback === 'function')
						callback(image_data/* , 'OK' */);
					return;
				}
			}

			// 有錯誤。下載圖像錯誤時報錯。
			var message;
			if (verified_image === false) {
				// 圖檔損壞: e.g., Do not has EOI
				message = [ {
					T : '圖檔損壞：'
				} ];
			} else {
				// 圖檔沒資格驗證。
				message = [ {
					T : '無法成功取得圖片。'
				}, XMLHttp.status ? {
					T : [ 'HTTP 狀態碼 %1，', XMLHttp.status ]
				} : '', {
					T : !contents ? '圖片無內容：' : [
					//
					contents.length < _this.MIN_LENGTH ? '檔案過小，僅 %1 bytes：'
					//
					: '檔案僅 %1 bytes：', contents.length ]
				} ];
			}
			message.push(image_url + '\n→ ' + image_data.file);
			library_namespace.warn(message);
			// Release memory. 釋放被占用的記憶體。
			message = null;

			if (image_data.error_count === _this.MAX_ERROR_RETRY) {
				image_data.has_error = true;
				// throw new Error(_this.id + ': ' +
				// gettext('MESSAGE_NEED_RE_DOWNLOAD'));
				library_namespace.log(_this.id + ': '
						+ gettext('MESSAGE_NEED_RE_DOWNLOAD'));
				// console.log('error count: ' + image_data.error_count);
				if (contents && contents.length > 10
				//
				&& contents.length < _this.MIN_LENGTH
				// 檔案有驗證過，只是太小時，應該不是 false。
				&& verified_image !== false
				// 就算圖像是完整的，只是比較小，HTTP status code 也應該是 2xx。
				&& (XMLHttp.status / 100 | 0) === 2) {
					library_namespace.warn([ {
						T : '或許圖片是完整的，只是過小而未達標，例如幾乎為空白之圖片。'
					}, {
						T : [ '您可設定 MIN_LENGTH，如 MIN_LENGTH=%1 '
						//
						+ '表示允許最小為 %1 bytes 的圖片；'
						//
						+ '或者先設定 skip_error=true 來忽略圖片錯誤，待取得檔案後，自行更改檔名，'
						//
						+ '去掉錯誤檔名後綴%2以跳過此錯誤。', contents.length,
						//
						JSON.stringify(_this.EOI_error_postfix) ]
					} ]);

				} else if (image_data.file_length.length > 1
						&& !image_data.file_length.cardinal_1()) {
					library_namespace.warn([ {
						T : [ '下載所得的圖片大小不同：%1。', image_data.file_length ]
					}, {
						T : '若非因網站提早截斷連線，那麼您或許需要增長時限來提供足夠的時間下載圖片？'
					} ]);
					// TODO: 提供續傳功能。
					// e.g., for 9mdm.js→dagu.js 魔剑王 第59话 4392-59-011.jpg

				} else if (!_this.skip_error) {
					library_namespace.info([ {
						T : '若錯誤持續發生，您可以設定 skip_error=true 來忽略圖片錯誤。'
					}, {
						T : '您必須設定 skip_error 或 allow_EOI_error 選項，才會儲存損壞的檔案。'
					}, {
						T : '若您需要重新下載之前下載失敗的章節，請開啟 recheck 選項。'
					} ]);
				}

				_this.onerror(gettext('圖片下載錯誤'), image_data);
				// image_data.done = false;
				if (typeof callback === 'function')
					callback(image_data, 'image_download_error');
				return Work_crawler.THROWED;
				// 網頁介面不可使用process.exit()，會造成白屏
				// process.exit(1);
			}

			image_data.error_count = (image_data.error_count | 0) + 1;
			library_namespace.log([ 'get_image: ', {
				T : [ 'Retry %1/%2',
				//
				image_data.error_count, _this.MAX_ERROR_RETRY ]
			}, '...' ]);
			var get_image_again = function() {
				_this.get_image(image_data, callback, images_archive);
			}
			if (image_data.time_interval > 0) {
				process.stdout.write('get_image: '
						+ gettext('等待 %2 之後再重新取得圖片：%1', image_data.url,
								library_namespace.age_of(0,
										image_data.time_interval, {
											digits : 1
										})) + '...\r');
				setTimeout(get_image_again, image_data.time_interval);
			} else
				get_image_again();

		}, null, Object.assign({
			/**
			 * 最多平行下載/獲取檔案(圖片)的數量。
			 * 
			 * <code>
			incase "MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 connect listeners added. Use emitter.setMaxListeners() to increase limit"
			</code>
			 */
			max_listeners : 300
		}, image_data.reset_get_URL_options ? null : this.get_URL_options,
				image_data.get_URL_options), 'buffer');
	}

	// --------------------------------------------------------------------------------------------

	// export 導出.

	// @instance
	Object.assign(Work_crawler.prototype, {
		// {Array|String}可以接受的圖片類別/圖片延伸檔名/副檔名/檔案類別 acceptable file extensions。
		// acceptable_types : 'images',
		// acceptable_types : 'png',
		// acceptable_types : ['webp', 'png'],

		// 當圖片不存在 EOI (end of image) 標記，或是被偵測出非圖片時，依舊強制儲存檔案。
		// allow image without EOI (end of image) mark. default:false
		// allow_EOI_error : true,
		// 圖片檔案下載失敗處理方式：忽略/跳過圖片錯誤。當404圖片不存在、檔案過小，或是被偵測出非圖片(如不具有EOI)時，依舊強制儲存檔案。default:false
		// skip_error : true,
		//
		// 若已經存在壞掉的圖片，就不再嘗試下載圖片。default:false
		// skip_existed_bad_file : true,
		//
		// 循序逐個、一個個下載圖片。僅對漫畫有用，對小說無用。小說章節皆為逐個下載。 Download images one by one.
		// default: 同時下載本章節中所有圖片。 Download ALL images at the same time.
		// 若設成{Natural}大於零的數字(ms)或{String}時間長度，那會當成下載每張圖片之時間間隔 time_interval。
		// cf. .chapter_time_interval
		// one_by_one : true,
		//
		// e.g., '2-1.jpg' → '2-1 bad.jpg'
		EOI_error_postfix : ' bad',
		// 加上有錯誤檔案之註記。
		EOI_error_path : EOI_error_path,

		image_path_to_url : image_path_to_url,

		get_image : get_image
	});

	// 不設定(hook)本 module 之 namespace，僅執行 module code。
	return library_namespace.env.not_to_extend_keyword;
}
