/**
 * @name CeL function for checking MIME type
 * 
 * @fileoverview 本檔案包含了 checking MIME type 用的程式庫。
 * 
 * TODO:<code>

</code>
 * 
 * @since 2017/1/27 7:55:6
 * @see https://en.wikipedia.org/wiki/Media_type
 *      https://www.iana.org/assignments/media-types/media-types.xhtml
 *      https://github.com/jshttp/mime-types
 */

'use strict';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name.
	name : 'application.net.MIME',

	// 可以參考 CeL.application.storage.file
	require : '',

	// 設定不匯出的子函式。
	// no_extend : '*',

	// requiring
	// require : '',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	/**
	 * null module constructor
	 * 
	 * @class XML 操作相關之 function。
	 */
	var _// JSDT:_module_
	= function() {
		// null module constructor
	};

	/**
	 * for JSDT: 有 prototype 才會將之當作 Class
	 */
	_// JSDT:_module_
	.prototype = {};

	// --------------------------------------------------------------------------------------------

	/**
	 * @see 用 CeL.application.storage.file verify_file_type() 可以驗證檔案格式。
	 */
	function extension_of(url) {
		if (!url) {
			return;
		}

		url = String(url);
		if (url.includes('://')) {
			url = url.replace(/[#?].*$/, '');
		}
		var matched = url.match(/\.([^.]+)$/i);
		if (matched) {
			if (/[a-z\d\-]+/i.test(matched[1])) {
				return matched[1];
			}
		} else if (/^[a-z\d\-]+$/i.test(url)) {
			return url;
		}
	}

	_.file_name_extension_of = extension_of;

	// 由 file name extension or url 簡易判別，可能出錯。
	function MIME_type_of_extension(url, options) {
		var extension = extension_of(url);
		if (!extension) {
			return;
		}

		// no .trim()
		extension = extension.toLowerCase();

		// common MIME types
		// 常用 MIME types
		switch (extension) {

		// https://en.wikipedia.org/wiki/Image_file_formats
		case 'jpg':
			extension = 'jpeg';
		case 'jpeg':
		case 'png':
		case 'gif':
		case 'webp': // https://en.wikipedia.org/wiki/WebP
		case 'bmp':
			// png → image/png
			return 'image/' + extension;

		case 'ico':
		case 'icon':
			// favicon: image/vnd.microsoft.icon
			return 'image/x-icon';

			// ---------------------------------------------

		case 'mp3':
			return 'audio/mpeg';

		case '3gpp':
		case 'ac3':
		case 'ogg':
		case 'wav':
			return 'audio/' + extension;

			// ---------------------------------------------

		case 'avi':
		case 'mp4':
		case 'mpeg':
			return 'video/' + extension;

			// ---------------------------------------------

		case 'txt':
			return 'text/plain';

		case 'htm':
			extension = 'html';
		case 'html':
			//
		case 'css':
		case 'csv':
			return 'text/' + extension;

		case 'svg':
			return 'image/svg+xml';

		case 'xhtml':
			return 'application/xhtml+xml';

		case 'rtf':
		case 'pdf':
		case 'xml':
			return 'application/' + extension;

			// ---------------------------------------------

		case 'otf':
		case 'ttf':
		case 'woff':
		case 'woff2':
			return 'font/' + extension;

		}

	}

	_.MIME_of = MIME_type_of_extension;

	// top-level type name
	function main_MIME_type_of_extension(url) {
		var type = MIME_type_of_extension(url);
		if (!type) {
			return;
		}
		var matched = type.match(/^([a-z]+)\//);
		if (matched) {
			return matched[1];
		}
	}

	_.main_MIME_type_of = main_MIME_type_of_extension;

	// --------------------------------------------------------------------------------------------

	// export 導出.

	return (_// JSDT:_module_
	);
}
