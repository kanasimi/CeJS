/**
 * @name CeL function for Electronic Publication (EPUB)
 * @fileoverview 本檔案包含了解析與創建 EPUB file 的 functions。
 * 
 * @example<code>

 var ebook = new CeL.EPUB(directory);
 // initialize

 // append chapter
 ebook.add({title:,file:,media:},{String}text);
 // {Array}ebook.chapters
 ebook.chapters.splice(0,1,{title:,file:,media:[]});
 ebook.flush(): write TOC, contents
 ebook.check(): 確認檔案都在

 {String}ebook.directory.book
 {String}ebook.directory.text / .xhtml
 {String}ebook.directory.style / .css
 {String}ebook.directory.media / .jpg, .png, .mp3


依照檢核結果修改以符合標準:
java -jar epubcheck.jar *.epub

 </code>
 * 
 * @since 2017/1/24 11:55:51
 * @see [[en:file format]], [[document]], [[e-book]], [[EPUB]], [[Open eBook]]
 *      http://www.idpf.org/epub/31/spec/epub-packages.html
 *      http://epubzone.org/news/epub-3-validation http://validator.idpf.org/
 */

'use strict';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	// application.storage.format.EPUB
	name : 'application.storage.EPUB',

	require :
	// Object.entries()
	'data.code.compatibility.'
	// JSON.to_XML()
	+ '|data.XML.'
	// write_file(), read_file()
	+ '|application.storage.',

	// 設定不匯出的子函式。
	no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	/** {String}path separator. e.g., '/', '\' */
	var path_separator = library_namespace.env.path_separator,
	// Open eBook Publication Structure (OEBPS)
	// @see [[Open eBook]]
	boot_directory_name = 'EPUB',
	// 前置碼
	metadata_prefix = 'dc:',
	// [[manifest file]] container.xml
	default_container_xml = JSON.to_XML({
		container : {
			rootfiles : {
				rootfile : null,
				'full-path' : boot_directory_name + '/' + 'content.opf',
				'media-type' : "application/oebps-package+xml"
			}
		},
		version : "1.0",
		xmlns : "urn:oasis:names:tc:opendocument:xmlns:container"
	}, true);

	function Ebook(base_directory, options) {
		options = library_namespace.setup_options(options);
		if (!/[\\\/]$/.test(base_directory)) {
			base_directory += path_separator;
		}
		var boot_directory = base_directory + boot_directory_name
				+ path_separator;
		this.path = {
			// container
			root : base_directory,
			book : boot_directory,
			text : boot_directory// + 'text' + path_separator
			,
			style : boot_directory + 'style' + path_separator,
			media : boot_directory + 'media' + path_separator
		};

		this.metadata = library_namespace.null_Object();

		var raw_data = library_namespace
		// book data
		.read_file(this.path.book + 'content.opf');
		this.set_raw_data(raw_data && JSON.from_XML(raw_data.toString()),
				options);
	}

	// 先準備好目錄結構。
	function initialize() {
		// create structure
		var directory = this.path.root;
		library_namespace.create_directory(directory);
		library_namespace.write_file(directory + 'mimetype',
		/**
		 * The mimetype file must be an ASCII file that contains the string
		 * application/epub+zip. It must be unencrypted, and the first file in
		 * the ZIP archive.
		 */
		'application/epub+zip');

		// http://www.idpf.org/epub/31/spec/epub-ocf.html#sec-container-metainf
		// All OCF Abstract Containers must include a directory called META-INF
		// in their Root Directory.
		directory = this.path.root + 'META-INF' + path_separator;
		library_namespace.create_directory(directory);
		library_namespace.write_file(directory + 'container.xml',
				default_container_xml);

		directory = this.path.book;
		library_namespace.create_directory(directory);
		'text,style,media'.split(',').forEach(function(type) {
			var _d = this.path[type];
			if (_d && _d !== directory) {
				library_namespace.create_directory(_d);
			}
		}, this);

		this.initializated = true;
	}

	function date_to_String(date) {
		return (library_namespace.is_Date(date) ? date : new Date(date
		// .to_Date({zone:9})
		|| Date.now()))
		// CCYY-MM-DDThh:mm:ssZ
		.toISOString().replace(/\.\d{3}Z$/, 'Z');
	}

	Ebook.date_to_String = date_to_String;

	/**
	 * 必須先確認沒有衝突
	 * 
	 * @inner
	 */
	function add_manifest_item(item) {
		this.chapter_index_of_id[item.id] = this.chapters.length;
		this.chapters.push(item);
	}

	// {JSON}raw_data
	function set_raw_data(raw_data, options) {
		// console.log(JSON.stringify(raw_data));
		this.raw_data = raw_data = raw_data || {
			package : [ {
				// http://www.idpf.org/epub/31/spec/epub-packages.html#sec-opf-dcmes-required
				metadata : [ {
					'dc:identifier' : options.identifier
					//
					|| options.id || new Date().toISOString(),
					id : options.id_type || 'workid'
				}, {
					'dc:title' : options.title || ''
				}, {
					'dc:language' : options.language || 'en'
				}, {
					// 最後更動。 出版時間應用dc:date。
					meta : date_to_String(),
					property : "dcterms:modified"
				} ],
				'xmlns:dc' : 'http://purl.org/dc/elements/1.1/'
			}, {
				manifest : [ {
					item : null,
					id : 'style',
					href : '.css',
					// https://idpf.github.io/epub-cmt/v3/
					// e.g., 'image/jpeg'
					'media-type' : "text/css"
				}, {
					item : null,
					id : 'c1',
					href : '.xhtml',
					'media-type' : "application/xhtml+xml"
				} ] && []
			}, {
				// represent the default reading order of the given
				// Rendition.
				spine : [ {
					itemref : null,
					idref : 'id'
				} ] && []
			} ],
			// determine version.
			// http://www.idpf.org/epub/31/spec/
			version : "3.0",
			xmlns : "http://www.idpf.org/2007/opf",
			// http://www.idpf.org/epub/31/spec/epub-packages.html#sec-package-metadata-identifiers
			'unique-identifier' : options.id_type || 'workid'
		};

		// {Array}raw_data.package[0].metadata
		// {Array}raw_data.package[1].manifest
		// {Array}raw_data.package[2].spine

		raw_data.package[0].metadata.forEach(function(data) {
			if (!library_namespace.is_Object(data)) {
				return;
			}
			for ( var key in data) {
				break;
			}
			// TODO: 將其他屬性納入<meta property="..."></meta>。
			// console.log(key.replace(metadata_prefix, '') + '=' + data);
			this.metadata[key.replace(metadata_prefix, '')] = data;
		}, this);

		var resources = raw_data.package[1].manifest, chapters = raw_data.package[2].spine,
		// id to resources index
		index_of_id = library_namespace.null_Object();

		resources.forEach(function(resource, index) {
			var id = resource.id;
			if (id) {
				if (id in index_of_id) {
					;
				} else {
					index_of_id[id] = index;
				}
			}
		});

		// reset
		// 這兩者必須同時維護
		this.chapters = [];
		// id to resources index, index_of_id
		// this.chapter_index_of_id[id]
		// = {ℕ⁰:Natural+0}index (of item) of this.chapters
		this.chapter_index_of_id = library_namespace.null_Object();

		// rebuild by the order of <spine>
		chapters.forEach(function(chapter) {
			var index = index_of_id[chapter.idref];
			if (!(index >= 0)) {
				throw new Error('id of <spine> not found in <manifest>: ['
						+ chapter.idref + ']');
			}
			if (!(index in resources)) {
				library_namespace
						.warn('spine之中包含了重複的id，將跳過之: ' + chapter.idref);
				return;
			}
			chapter = resources[index];
			if (chapter.properties === 'nav') {
				// Exactly one item must be declared as the EPUB Navigation
				// Document using the nav property.
				// 濾掉 toc nav。
				this.TOC = chapter;
			} else {
				this.chapters.push(chapter);
			}
			// 已處理完。
			delete resources[index];
		}, this);

		// e.g., .css, images. 不包含 xhtml chapters
		this.resources = resources.filter(function(resource) {
			return !!resource;
		}, this);

		library_namespace.debug('重建 this.chapter_index_of_id...');
		this.chapters.forEach(function(chapter, index) {
			if (chapter.id) {
				this.chapter_index_of_id[chapter.id] = index;
			}
		}, this);
	}

	function to_meta_information_key(key) {
		return key === 'meta' || key === 'link' ? key : metadata_prefix + key;
	}

	function set_meta_information(key, value) {
		if (library_namespace.is_Object(key) && value === undefined) {
			Object.entries(key).forEach(function(pair) {
				set_meta_information.call(this, pair[0], pair[1]);
			}, this);
			return;
		}

		key = key.replace(metadata_prefix, '');
		var data = this.metadata[key]
		// 若已經有此key則直接設定。
		|| (this.metadata[key] = library_namespace.null_Object());

		key = to_meta_information_key(key);
		if (value === undefined) {
			return data[key];
		}
		data[key] = value;
	}

	// 應該用[A-Za-z]起始，但光單一字母不容易辨識。
	var id_prefix = 'i';

	/**
	 * encode to XML identifier.
	 * 
	 * 因為這可能用來作為檔名，因此結果也必須為valid檔名。
	 * 
	 * @see http://stackoverflow.com/questions/1077084/what-characters-are-allowed-in-dom-ids
	 * 
	 * @see https://www.w3.org/TR/html401/types.html#type-name
	 * 
	 * ID and NAME tokens must begin with a letter ([A-Za-z]) and may be
	 * followed by any number of letters, digits ([0-9]), hyphens ("-"),
	 * underscores ("_"), colons (":"), and periods (".").
	 * 
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
	 * 
	 * encodeURIComponent escapes all characters except the following:
	 * alphabetic, decimal digits, - _ . ! ~ * ' ( )
	 */
	function encode_identifier(string) {
		// 皆加上id_prefix，之後的便以接續字元看待，不必多作處理。
		return id_prefix + encodeURIComponent(string)
		// escape other invalid characters
		// 把"_"用來做hex辨識符。
		.replace(/[_!~*'()]/g, function($0) {
			var hex = $0.charCodeAt(0).toString(0x10).toUpperCase();
			if (hex.length % 2 === 1) {
				hex = '0' + hex;
			}
			// return hex.replace(/([\s\S]{2})/g, '_$1');
			return '_%' + hex;
		}).replace(/%/g, '_');
	}

	function decode_identifier(identifier) {
		identifier = identifier.slice(id_prefix.length).replace(/_/g, '%');
		try {
			return decodeURIComponent(identifier);
		} catch (e) {
			library_namespace.err('Can not decode: [' + identifier + ']');
			throw e;
		}
	}

	function is_manifest_item(value) {
		if (!library_namespace.is_Object(value)) {
			return false;
		}

		for ( var key in value) {
			return key === 'item' && value.item === null
			// && value.id && value.href
			;
		}
		return false;
	}

	function normalize_item(data) {
		if (is_manifest_item(data)) {
			return data;
		}

		var item;
		if (typeof data === 'string') {
			var title = data;
			if (/\.x?html?$/i.test(title)) {
				title = title.replace(/\.x?html?$/i, '');
			} else {
				data += '.xhtml';
			}
			item = {
				item : null,
				id : title,
				href : data,
				'media-type' : "application/xhtml+xml"
			};

		} else if (library_namespace.is_Object(data)) {
			item = {
				item : null,
				id : data.id || data.title,
				href : data.file
						|| (data.href || data.url || '').match(/[^\\\/]*$/)[0]
						|| data.title && (data.title + '.xhtml'),
				'media-type' : "application/xhtml+xml"
			};
		} else {
			throw new Error('Invalid data to: ' + data);
		}

		// 採用能從id復原成title之演算法。
		// 未失真的title = decode_identifier(item.id)
		item.id = encode_identifier(item.id);

		// escape: 不可使用中文日文名稱。
		item.href = encode_identifier(item.href)
		// 截斷trim主檔名，限制在 80字元。
		// WARNING: assert: 截斷後的主檔名不會重複，否則會被覆蓋!
		.replace(/^(.*)(\.[^.]+)$/, function(all, main, extension) {
			return main.slice(0, 80 - extension.length) + extension;
		});

		return item;
	}

	var
	/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
	NOT_FOUND = ''.indexOf('_');

	function index_of_chapter(title) {
		// console.log(this.chapters);
		if (title in this.chapter_index_of_id) {
			// title 為 id
			return this.chapter_index_of_id[title];
		}
		var encoded = encode_identifier(title);
		if (encoded in this.chapter_index_of_id) {
			// title 為 title
			return this.chapter_index_of_id[encoded];
		}

		// 剩下的可能為 href
		if (!/\.x?html?$/i.test(title)) {
			return NOT_FOUND;
		}

		for (var chapters = this.chapters, index = 0, length = chapters.length; index < length; index++) {
			var item = chapters[index];
			// console.log('> ' + title);
			// console.log(item);
			if (
			// title === item.id || title === decode_identifier(item.id) ||
			title === item.href) {
				return index;
			}
		}

		return NOT_FOUND;
	}

	function is_the_same_item(item1, item2) {
		return item1 && item2 && item1.id === item2.id
				&& item1.href === item2.href;
	}

	function add_chapter(data, contents) {
		if (!data) {
			return;
		}

		var item = normalize_item(data);

		if (is_the_same_item(item, this.TOC)
				// 若是已存在相同資源(.id + .href)則直接跳過。
				|| (item.id in this.chapter_index_of_id)
				//
				&& is_the_same_item(item,
						this.chapters[this.chapter_index_of_id[item.id]])) {
			library_namespace.log('已經有相同的篇章，將不覆寫: '
					+ decode_identifier(item.id));
			return;
		}

		// 若是已存在此chapter則先移除。
		remove_chapter.call(this, item.id);
		// TODO: 檢測是否存在相同資源(.href)並做警告。

		if (contents) {
			// 需要先準備好目錄結構。
			if (!this.initializated) {
				this.initialize();
			}

			library_namespace.debug('Write ' + contents.length + ' chars to ['
					+ this.path.text + item.href + ']');
			library_namespace.write_file(this.path.text + item.href, contents);
		}

		if (data.TOC) {
			// EPUB Navigation Document
			item.properties = 'nav';
			this.TOC = item;
		} else {
			add_manifest_item.call(this, item);
		}
	}

	function remove_chapter_by_index(index) {
		if (!(index >= 0)) {
			return;
		}
		var item = this.chapters.splice(index, 1);
		library_namespace.remove_file(this.path.text + item.href);
		return item;
	}

	function remove_chapter(title) {
		if (!title) {
			return;
		}

		if (library_namespace.is_Object(title)) {
			if (title.id in this.chapter_index_of_id) {
				return remove_chapter_by_index.call(this,
						this.chapter_index_of_id[title.id]);
			}
			if (title.title && (title = encode_identifier(title.title))
			//
			&& (title in this.chapter_index_of_id)) {
				return remove_chapter_by_index.call(this,
						this.chapter_index_of_id[title]);
			}
			// Nothing found.

		} else if (title in this.chapter_index_of_id
		//
		|| (title = encode_identifier(title)) in this.chapter_index_of_id) {
			return remove_chapter_by_index.call(this,
					this.chapter_index_of_id[title]);
		}
	}

	function write_chapters() {
		if (!this.initializated) {
			this.initialize();
		}

		// {Array}raw_data.package[0].metadata
		// {Array}raw_data.package[1].manifest
		// {Array}raw_data.package[2].spine

		this.raw_data.package[0].metadata = Object.values(this.metadata);

		var chapters = this.chapters.clone();
		if (!this.TOC) {
			// 自動生成目錄。

			var TOC_html = [ '<?xml version="1.0" encoding="UTF-8"?>',
					'<!DOCTYPE html>',
					'<html xmlns="http://www.w3.org/1999/xhtml"',
					' xmlns:epub="http://www.idpf.org/2007/ops">',
					'<head></head><body>',
					//
					'<h1>', this.metadata.title[metadata_prefix + 'title'],
					'</h1>',
					//
					'<h2>Work information</h2>', '<div id="work_data">',
					Object.entries(this.metadata).map(function(data) {
						var key = data[0];
						return '<dl><dt>' + key + '</dt><dd>'
						//
						+ data[1][to_meta_information_key(key)] + '</dd></dl>';
					}).join(''), '</div>',
					// The toc nav element must occur exactly once in an
					// EPUB
					// Navigation Document.
					'<nav epub:type="toc" id="toc">',
					//
					'<h2>Table of contents</h2>', '<ol>',
					chapters.map(function(chapter) {
						return '<li><a href="' + chapter.href + '">'
						// 未失真的title = decode_identifier(item.id)
						+ decode_identifier(chapter.id) + '</a></li>';
					}).join(''), '</ol>', '</nav>', '</body></html>' ].join('');

			this.add({
				title : 'TOC',
				TOC : true
			}, TOC_html);
		}
		chapters.unshift(this.TOC);
		// console.log(this.resources.concat(chapters));
		this.raw_data.package[1].manifest = this.resources.concat(chapters)
		// 再做一次檢查，預防被外部touch過。
		.map(normalize_item);
		this.raw_data.package[2].spine = chapters.filter(function(chapter) {
			return !!chapter.id;
		}).map(function(chapter) {
			return {
				itemref : null,
				idref : chapter.id
			};
		});

		library_namespace.write_file(this.path.book + 'content.opf', JSON
				.to_XML(this.raw_data, true));
	}

	// package
	function archive_to_ZIP() {
		this.flush();

		// TODO
		TODO;

		// archive mimetype
		// archive others
		// .zip → .epub

		// remove empty directories
	}

	Ebook.prototype = {
		initialize : initialize,
		set_raw_data : set_raw_data,
		set : set_meta_information,
		add : add_chapter,
		remove : remove_chapter,
		flush : write_chapters,
		archive : archive_to_ZIP
	};

	return Ebook;
}
