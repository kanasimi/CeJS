/**
 * @name CeL function for Electronic Publication (EPUB)
 * @fileoverview 本檔案包含了解析與創建 EPUB file 的 functions。
 * 
 * @example<code>


 var ebook = new CeL.EPUB(package_base_directory);
 // initialize

 // append chapter
 ebook.add({title:,file:,media:},{String}text);
 // {Array}ebook.chapters. 每次手動改變.chapters，最後必須執行.arrange()整理。
 ebook.chapters.splice(0,1,{title:,file:,media:[]});ebook.arrange();
 ebook.flush(): write TOC, contents
 ebook.check(): 確認檔案都在

 {String}ebook.directory.book
 {String}ebook.directory.text + .xhtml
 {String}ebook.directory.style + .css
 {String}ebook.directory.media + .jpg, .png, .mp3


依照檢核結果修改以符合標準: EpubCheck
https://github.com/IDPF/epubcheck
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
	// .MIME_of()
	+ '|application.net.MIME.'
	// .count_word()
	+ '|data.'
	// JSON.to_XML()
	+ '|data.XML.'
	// get_URL_cache()
	// + '|application.net.Ajax.'
	// write_file(), read_file()
	+ '|application.storage.',

	// 設定不匯出的子函式。
	no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	var
	// http://www.idpf.org/epub/31/spec/epub-ocf.html#sec-container-metainf
	// All OCF Abstract Containers must include a directory called META-INF
	// in their Root Directory.
	// e.g., META-INF/container.xml
	container_directory_name = 'META-INF', container_file_name = 'container.xml',
	// 前置碼
	metadata_prefix = 'dc:',
	// key for additional information / configuration data
	KEY_DATA = 'item data',

	/** {String}path separator. e.g., '/', '\' */
	path_separator = library_namespace.env.path_separator;

	function setup_container(base_directory) {
		// read container file: [[manifest file]] container.xml
		this.container = library_namespace
				.read_file((base_directory || this.path.root)
						+ container_directory_name + path_separator
						+ container_file_name);

		var rootfile_path = (this.root_directory_name
		//
		? this.root_directory_name + '/' : '') + this.package_document_name;
		if (this.container
				&& (this.container = JSON.from_XML(this.container.toString()))) {
			// parse container
			var rootfile = this.container.container.rootfiles;
			if (Array.isArray(rootfile)) {
				library_namespace.err('本函式庫尚不支援多 rootfile (.opf)!');
				rootfile = rootfile.filter(function(root_file) {
					return /\.opf$/i.test(root_file['full-path']);
				})[0] || rootfile[0];
			}

			if (false) {
				var matched = rootfile['full-path']
						.match(/^(?:(.*)[\\\/])?([^\\\/]+)$/);
				if (matched) {
					// console.log(matched);
					if (this.root_directory_name !== matched[1]) {
						library_namespace.info('root_directory_name: '
								+ matched[1] + '→' + this.root_directory_name);
					}
					this.root_directory_name = matched[1] || '';
					if (this.package_document_name !== matched[2]) {
						library_namespace
								.info('package_document_name: ' + matched[2]
										+ '→' + this.package_document_name);
					}
					this.package_document_name = matched[2];
				} else {
					library_namespace.info('rootfile path: '
							+ rootfile['full-path'] + '→' + rootfile_path);
				}
			}

			if (rootfile['full-path'] !== rootfile_path) {
				library_namespace.info('rootfile path: '
						+ rootfile['full-path'] + '→' + rootfile_path);
				// TODO: remove directories+files
				;
				rootfile['full-path'] = rootfile_path;
			}

		} else {
			// default container
			this.container = {
				container : {
					rootfiles : {
						rootfile : null,
						'full-path' : rootfile_path,
						'media-type' : "application/oebps-package+xml"
					}
				},
				version : "1.0",
				xmlns : "urn:oasis:names:tc:opendocument:xmlns:container"
			};
		}
	}

	function Ebook(base_directory, options) {
		options = library_namespace.setup_options(options);
		if (!/[\\\/]$/.test(base_directory)) {
			base_directory += path_separator;
		}

		if ('root_directory_name' in options) {
			this.root_directory_name = options.root_directory_name || '';
		}
		if (options.package_document_name) {
			this.package_document_name = options.package_document_name;
		}

		this.setup_container(base_directory);

		if (options.id_prefix) {
			if (/^[a-z][a-z\d]*$/i.test(options.id_prefix)) {
				this.id_prefix = options.id_prefix;
			} else {
				throw new Error('Invalid id prefix: ' + options.id_prefix);
			}
		}

		if (!this.root_directory_name) {
			library_namespace
					.warn('The root directory is directly under the base directory!');
		}

		var root_directory = base_directory
				+ (this.root_directory_name ? this.root_directory_name
						+ path_separator : '');
		this.directory = Object.assign({
			// 'text'
			text : '',
			style : 'style',
			media : 'media'
		}, options.directory);
		// 注意: 為了方便使用，這邊的 this.directory 都必須添加 url 用的 path separator: '/'。
		for ( var d in this.directory) {
			var _d = this.directory[d];
			if (_d)
				this.directory[d] = (PATTERN_NEED_ENCODE_FILE_NAME.test(_d) ? encode_identifier(
						_d, this)
						: _d).replace(/[\\\/]*$/, path_separator);
		}
		// absolute directory path
		this.path = {
			// container
			root : base_directory,
			book : root_directory,
			text : root_directory + this.directory.text,
			style : root_directory + this.directory.style,
			media : root_directory + this.directory.media,
		};
		// 注意: 為了方便使用，這邊的 this.directory 都必須添加 url 用的 path separator: '/'。
		for ( var d in this.directory) {
			this.directory[d] = './'
					+ this.directory[d].replace(/[\\\/]+$/, '/');
		}

		this.metadata = library_namespace.null_Object();

		var raw_data;
		if (options.start_over) {
			// start over: 重新創建, 不使用舊的.opf資料
			// TODO: remove directories+files
			;
		} else {
			raw_data = !options.start_over && library_namespace
			// book data
			.read_file(this.path.book + this.package_document_name);
		}
		this.set_raw_data(raw_data && JSON.from_XML(raw_data.toString()),
				options);
	}

	// 先準備好目錄結構。
	function initialize(force) {
		if (this.initializated && !force) {
			return;
		}

		library_namespace.create_directory(Object.values(this.path)
		// 從root排到sub-directory，預防create_directory時parent-directory尚未創建。
		.sort());

		// create structure
		library_namespace.write_file(this.path.root + 'mimetype',
		/**
		 * The mimetype file must be an ASCII file that contains the string
		 * application/epub+zip. It must be unencrypted, and the first file in
		 * the ZIP archive.
		 */
		'application/epub+zip');

		var directory = this.path.root + container_directory_name
				+ path_separator;
		library_namespace.create_directory(directory);
		library_namespace.write_file(directory + container_file_name,
		//
		JSON.to_XML(this.container, this.to_XML_options));

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
	function add_manifest_item(item, is_resource) {
		if (is_resource || detect_file_type(item.href) !== 'text') {
			this.resource_index_of_id[item.id] = this.resources.length;
			this.resources.push(item);
		} else {
			this.chapter_index_of_id[item.id] = this.chapters.length;
			this.chapters.push(item);
		}
	}

	function rebuild_index_of_id(rebuild_resources, force) {
		var list = rebuild_resources ? this.resources : this.chapters, index_of_id = rebuild_resources ? this.resource_index_of_id
				: this.chapter_index_of_id;

		if (!force
		// TODO: detect change
		&& list.old_length === list.length) {
			return;
		}

		library_namespace.debug('重建 index_of_id...');
		list.forEach(function(item, index) {
			if (item.id) {
				index_of_id[item.id] = index;
			}
		});
		list.old_length = list.length;
	}

	// {JSON}raw_data
	function set_raw_data(raw_data, options) {
		options = library_namespace.setup_options(options);
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
			// EpubCheck 尚不支援 3.1
			version : "3.0",
			xmlns : "http://www.idpf.org/2007/opf",
			// http://www.idpf.org/epub/31/spec/epub-packages.html#sec-package-metadata-identifiers
			'unique-identifier' : options.id_type || 'workid'
		};

		if (false && options.language) {
			// http://epubzone.org/news/epub-3-and-global-language-support
			this.raw_data['xml:lang'] = options.language;
		}

		// console.log(JSON.stringify(raw_data));

		this.raw_data_ptr = library_namespace.null_Object();
		var resources = [];
		raw_data.package.forEach(function(node) {
			if (typeof node === 'string' && !node.trim()) {
				return;
			}
			resources.push(node);
			if (!library_namespace.is_Object(node)) {
				return;
			}
			// {Array}raw_data.package[0].metadata
			// {Array}raw_data.package[1].manifest
			// {Array}raw_data.package[2].spine
			if (Array.isArray(node.metadata)) {
				this.raw_data_ptr.metadata = node.metadata;
			} else if (Array.isArray(node.manifest)) {
				this.raw_data_ptr.manifest = node.manifest;
			} else if (Array.isArray(node.spine)) {
				this.raw_data_ptr.spine = node.spine;
			}
		}, this);

		// 整理，去掉冗餘。
		raw_data.package.clear();
		Array.prototype.push.apply(raw_data.package, resources);

		this.raw_data_ptr.metadata.forEach(function(data) {
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

		resources = this.raw_data_ptr.manifest;
		var chapters = this.raw_data_ptr.spine,
		// id to resources index
		index_of_id = library_namespace.null_Object();

		resources.forEach(function(resource, index) {
			if (typeof resource === 'string') {
				var matched = resource.match(/<!--\s*({.+})\s*-->/);
				if (matched
				//
				&& library_namespace.is_Object(resources[--index])) {
					try {
						// 以非正規方法存取資訊。
						resources[index][KEY_DATA] = JSON.parse(matched[1]);
					} catch (e) {
						// TODO: handle exception
					}
				}
				return;
			}

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
		this.resource_index_of_id = library_namespace.null_Object();

		// rebuild by the order of <spine>
		// console.log(chapters);
		chapters.forEach(function(chapter) {
			if (!library_namespace.is_Object(chapter)) {
				return;
			}
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
			return library_namespace.is_Object(resource);
		}, this);

		// rebuild_index_of_id.call(this);
		// rebuild_index_of_id.call(this, true);
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

		if (typeof value === 'string') {
			if (value.includes('://')) {
				// 處理/escape URL。
				// && → &amp;&
				value = value.replace_till_stable(/&&/g, '&amp;&')
				// &xxx= → &amp;xxx=
				.replace(/&(.*?)([^a-z\d]|$)/g, function(all, mid, end) {
					if (end === ';') {
						return all;
					}
					return '&amp;' + mid + end;
				});
			}
		}
		data[key] = value;
	}

	// http://idpf.org/forum/topic-715
	// https://wiki.mobileread.com/wiki/Ebook_Covers#OPF_entries
	// http://www.idpf.org/epub/301/spec/epub-publications.html#sec-item-property-values
	// TODO:
	// <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml" />
	function set_cover_image(item_data, contents) {
		if (!item_data) {
			return;
		}
		if (typeof item_data === 'string' && item_data.includes('://')) {
			var matched;
			item_data = {
				url : item_data,
				file : library_namespace.main_MIME_type_of(item_data)
				//
				&& item_data.match(/[^\\\/]+$/i)[0]
				//
				|| 'cover.' + (item_data.type && (matched = item_data.type
				//
				.match(/^image\/([a-z\d]+)$/)) ? matched[1] : 'jpg')
			};
		}
		var item = normalize_item(item_data, this);
		// <item id="cover-image" href="cover.jpg" media-type="image/jpeg" />
		item.id = 'cover-image';
		item.properties = "cover-image";

		// TODO: <meta name="cover" content="cover-image" />
		return this.add(item, contents);
	}

	var PATTERN_NEED_ENCODE_ID = /^[^a-z]|[^a-z\d\-]/i, PATTERN_NEED_ENCODE_FILE_NAME = /[^a-z\d\-.]/i;

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
	function encode_identifier(string, _this) {
		if (typeof string !== 'string') {
			throw new Error('Invalid id to encode: ' + JSON.stringify(string));
		}

		if (!string) {
			return '';
		}

		// 皆加上id_prefix，之後的便以接續字元看待，不必多作處理。
		return _this.id_prefix + encodeURIComponent(string)
		// escape other invalid characters
		// 把"_"用來做hex辨識符。
		.replace(/[_!~*'()]/g, function($0) {
			var hex = $0.charCodeAt(0).toString(0x10).toUpperCase();
			if (hex.length % 2 === 1) {
				hex = '0' + hex;
			}
			// return hex.replace(/([\s\S]{2})/g, '_$1');
			return '%' + hex;
		}).replace(/%/g, '_');
	}

	function decode_identifier(identifier, _this) {
		identifier = identifier.slice(_this.id_prefix.length)
				.replace(/_/g, '%');
		try {
			return decodeURIComponent(identifier);
		} catch (e) {
			library_namespace.err('decode_identifier: Can not decode: ['
					+ identifier + ']');
			throw e;
		}
	}

	// assert: "_!~*'()" ===
	// decode_identifier(encode_identifier("_!~*'()", this), this)

	function is_manifest_item(value) {
		if (!library_namespace.is_Object(value)) {
			return false;
		}

		for ( var key in value) {
			return key === 'item' && value.item === null
			// http://www.idpf.org/epub/31/spec/epub-packages.html#sec-item-elem
			&& value.id && value.href && value['media-type'];
		}
		return false;
	}

	// file path → file name
	function get_file_name_of_url(url) {
		return (url && String(url) || '').match(/[^\\\/]*$/)[0];
	}

	// file name or url
	// return value must in this.path and this.directory
	function detect_file_type(file_name) {
		if (/\.x?html?$/i.test(file_name)) {
			return 'text';
		}
		if (/\.css$/i.test(file_name)) {
			return 'style';
		}

		var main_type = library_namespace.main_MIME_type_of(file_name);
		if (main_type === 'text') {
			return 'text';
		}
		if (main_type === 'image' || main_type === 'audio'
				|| main_type === 'video') {
			return 'media';
		}

		throw new Error('Can not determine the type of [' + file_name + ']');
	}

	function normalize_item(item_data, _this, strict) {
		if (is_manifest_item(item_data)) {
			if (strict && ([ KEY_DATA ] in item_data)) {
				item_data = Object.clone(item_data);
				// item[KEY_DATA] 必須在 write_chapters() 時去除掉。
				delete item_data[KEY_DATA];
			}
			return item_data;
		}

		if (typeof item_data === 'string') {
			// 為URL做箝制處理。
			if (item_data.includes('://')) {
				item_data = {
					url : item_data
				};
			} else if (library_namespace.MIME_of(item_data)) {
				if (/[\\\/]/.test(item_data)) {
					item_data = {
						href : item_data
					};
				} else {
					item_data = {
						file : item_data
					};
				}
			} else {
				item_data = {
					title : item_data
				};
			}
		}

		var id, href;
		if (library_namespace.is_Object(item_data)) {
			id = item_data.id || item_data.title;
			href = item_data.href;
			if (!href
					&& (href = get_file_name_of_url(item_data.file
							|| item_data.url))) {
				// 自行決定合適的path+檔名。 e.g., "media/1.png"
				href = _this.directory[detect_file_type(href)] + href;
			}
		}

		if (!id) {
			if (!href) {
				library_namespace.err('Invalid item data: '
						+ JSON.stringify(item_data));
				return;
			}

			// 對檔案，以href(path+檔名)作為id。
			// 去掉 file name extension 當作id。
			id = href.replace(/\.[a-z\d\-]+$/i, '').replace(
					_this.directory[detect_file_type(href)], '');

		} else if (!href) {
			// default: xhtml file
			href = _this.directory.text + id + '.xhtml';
		}

		href = href.replace(/[^\\\/]+$/, function(file_name) {
			// EpubCheck 不可使用/不接受中文日文檔名。
			if (PATTERN_NEED_ENCODE_FILE_NAME.test(file_name)) {
				// need encode
				file_name = encode_identifier(file_name, _this);
			}

			// 截斷trim主檔名，限制在 80字元。
			// WARNING: assert: 截斷後的主檔名不會重複，否則會被覆蓋!
			return file_name.replace(/^(.*)(\.[^.]+)$/, function(all, main,
					extension) {
				return main.slice(0, 80 - extension.length) + extension;
			})
		});

		var item = {
			item : null,
			// escape: 不可使用中文日文名稱。
			// 採用能從id復原成title之演算法。
			// 未失真的title = decode_identifier(item.id, _this)
			id : PATTERN_NEED_ENCODE_ID.test(id) ? encode_identifier(id, _this)
					: id,
			// e.g., "media/1.png"
			href : href,
			'media-type' : item_data['media-type'] || item_data.type
					|| library_namespace.MIME_of(href)
		};

		if (!strict) {
			if (!item_data.url && href.includes('://')) {
				item_data.url = href;
			}
			item[KEY_DATA] = item_data;
		}

		return item;
	}

	var
	/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
	NOT_FOUND = ''.indexOf('_');

	function index_of_chapter(title) {
		rebuild_index_of_id.call(this);

		// console.log(this.chapters);
		if (title in this.chapter_index_of_id) {
			// title 為 id
			return this.chapter_index_of_id[title];
		}
		var encoded = encode_identifier(title, this);
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
			// title === item.id || title === decode_identifier(item.id, this)
			// ||
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

	// 正規化XHTML書籍章節內容。
	function normailize_contents(contents) {
		library_namespace.debug('正規化XHTML書籍章節內容: ' + contents, 6);
		contents = contents.replace(/\r/g, '')
		// .replace(/<br \/>\n/g, '\n')
		// .replace(/\n/g, '\r\n')

		//
		.replace(/<hr *>/ig, '<hr />')
		// <BR> → <br />
		.replace(/<br *>/ig, '<br />')
		// .trim(), remove head/tail <BR>
		.replace(/^(?:<br *\/>|[\s\n])+/ig, '')
		// 這會卡住:
		// .replace(/(?:<br *\/>|[\s\n]+)+$/ig, '')
		.replace(/(?:<br *\/>|[\s\n])+$/ig, '')
		//
		.replace(/(<img ([^>]+)>)(\s*<\/img>)?/g,
		// 改正明顯錯誤。
		function(all, opening_tag, inner) {
			inner = inner.trim();
			if (inner.endsWith(' \/')) {
				return opening_tag;
			}
			return '<img ' + inner + ' \/>';
		})

		// 2017/2/2 15:1:26
		// 標準可以沒 <rb>。若有<rb>，反而無法通過 EpubCheck 檢測。
		// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ruby
		.replace(/<\/?rb\s*>/g, '')

		// e.g., id="text" → id="text"
		// .replace(/ ([a-z]+)=([a-z]+)/g, ' $1="$2"')

		// [[non-breaking space]]
		// EpubCheck 不認識 HTML character entity，
		// 但卻又不允許 <!DOCTYPE html> 加入其他宣告。
		.replace(/&nbsp;/g, '&#160;')
		// '\f': 無效的 XML字元
		// e.g., http://www.alphapolis.co.jp/content/sentence/213451/
		.replace(/\x0c/g, '')
		//
		.replace(/&([^#a-z])/ig, '&amp;$1');

		library_namespace.debug('正規化後: ' + contents, 6);
		return contents;
	}

	// item data / config
	function add_chapter(item_data, contents) {
		if (!item_data) {
			return;
		}

		if (Array.isArray(item_data)) {
			if (contents) {
				throw new Error('設定多個檔案為相同的內容：' + item_data);
			}
			return item_data.map(function(_item_data) {
				return add_chapter.call(this, _item_data);
			}, this);
		}

		var item = normalize_item(item_data, this);
		item_data = item[KEY_DATA] || library_namespace.null_Object();
		// assert: library_namespace.is_Object(item_data)
		// console.log(item_data);
		// console.log(item);

		rebuild_index_of_id.call(this);
		rebuild_index_of_id.call(this, true);

		// 有contents的話，採用contents做為內容。並從item.href擷取出檔名。
		if (!contents && item_data.url) {
			// 沒contents的一律當作resource。
			var resource_href_hash = library_namespace.null_Object();
			if (this.resources.some(function(resource) {
				if (resource[KEY_DATA]
						&& resource[KEY_DATA].url === item_data.url) {
					var message = '已經有相同的資源檔 ' + resource[KEY_DATA].url;
					if (item_data.href
					// 有手動設定.href
					&& item_data.href !== resource.href) {
						library_namespace.err(message
								+ '\n但 .href 不同，您必須手動修正: ' + resource.href
								+ '→' + item_data.href);
					} else {
						library_namespace.log(message);
					}
					// 回傳重複的resource。
					item = resource;
					return true;
				}
				resource_href_hash[resource.href] = resource;
			})) {
				return item;
			}

			// 避免衝突，檢測是不是有不同URL，相同檔名存在。
			while (item.href in resource_href_hash) {
				item.href = item.href.replace(
				// 必須是encode_identifier()之後不會變化的檔名。
				/(?:-(\d+))?(\.[a-z\d\-]+)?$/, function(all, NO, ext_part) {
					return '-' + ((NO | 0) + 1) + (ext_part || '');
				});
			}

			if (item_data.href && item_data.href !== item.href) {
				// 有手動設定.href
				library_namespace.err('add_chapter: 儲存檔名改變，您需要自行修正原參照文件中之檔名:\n'
						+ item_data.href + ' →\n' + item.href);
			}

			// 避免衝突，檢測是不是有不同id，相同id存在。
			while ((item.id in this.resource_index_of_id)
					|| (item.id in this.chapter_index_of_id)) {
				item.id = item.id.replace(
				// 必須是encode_identifier()之後不會變化的檔名。
				/(?:-(\d+))?(\.[a-z\d\-]+)?$/, function(all, NO, ext_part) {
					return '-' + ((NO | 0) + 1) + (ext_part || '');
				});
			}

			if (item_data.id && item_data.id !== item.id) {
				// 有手動設定.href
				library_namespace.err('add_chapter: id改變，您需要自行修正原參照文件中之檔名:\n'
						+ item_data.id + ' →\n' + item.id);
			}

			// 先登記預防重複登記 (placeholder)。
			add_manifest_item.call(this, item, true);

			// 需要先準備好目錄結構。
			this.initialize();

			// 自網路取得url。
			library_namespace.log('add_chapter: get URL: ' + item_data.url);

			// assert: CeL.application.net.Ajax included
			library_namespace.get_URL_cache(item_data.url, function(contents,
					error, XMLHttp) {
				// save MIME type
				if (XMLHttp && XMLHttp.type) {
					item_data.type = XMLHttp.type;
				}

				library_namespace.log('add_chapter: URL got: ['
						+ item_data.type + '] ' + item_data.url + '\n→ '
						+ item.href);

				// item_data.write_file = false;
				// this.add(item_data, contents);
			}.bind(this), {
				file_name : this.path[detect_file_type(item.href)]
						+ get_file_name_of_url(item.href),
				encoding : undefined,
				charset : (detect_file_type(item_data.file
				//
				|| item.href) || detect_file_type(item_data.url)) === 'text'
						&& item_data.charset || 'binary',
				get_URL_options : item_data.get_URL_options
			});
			return item;
		}

		// 有contents時除非指定.use_cache，否則不會用cache。
		// 無contents時除非指定.force，否會保留cache。
		if ((contents ? item_data.use_cache : !item_data.force)
		// 若是已存在相同資源(.id + .href)則直接跳過。
		&& (is_the_same_item(item, this.TOC)
		//
		|| (item.id in this.chapter_index_of_id) && is_the_same_item(item,
		//
		this.chapters[this.chapter_index_of_id[item.id]])
		//
		|| (item.id in this.resource_index_of_id) && is_the_same_item(item,
		//
		this.resources[this.resource_index_of_id[item.id]]))) {
			library_namespace.debug('已經有相同的篇章或資源檔，將不覆寫: '
			//
			+ (item[KEY_DATA] && item[KEY_DATA].file
			//
			|| decode_identifier(item.id, this)), 2);
			return;
		}

		library_namespace.debug('若是已存在此chapter則先移除: ' + item.id, 3);
		remove_chapter.call(this, item.id);
		// TODO: 檢測是否存在相同資源(.href)並做警告。

		if (contents) {
			if (detect_file_type(item.href) !== 'text') {
				// assert: item, contents 為 resource。

			} else if (library_namespace.is_Object(contents)) {
				library_namespace.debug(contents, 6);
				var html = [ '<?xml version="1.0" encoding="UTF-8"?>',
				// https://www.w3.org/QA/2002/04/valid-dtd-list.html
				// https://cweiske.de/tagebuch/xhtml-entities.htm
				// '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"',
				// ' "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
				'<!DOCTYPE html>',
				//
				'<html xmlns="http://www.w3.org/1999/xhtml">', '<head>',
				// https://developer.mozilla.org/zh-TW/docs/Web_%E9%96%8B%E7%99%BC/Historical_artifacts_to_avoid
				// <meta http-equiv="Content-Type"
				// content="text/html; charset=UTF-8" />
				'<meta charset="UTF-8" />' ];

				html.push('<title>', [ contents.title, contents.sub_title ]
				//
				.filter(function(title) {
					return !!title;
				}).join(' - '), '</title>', '</head><body>');

				if (contents.title) {
					html.push('<h2>', contents.title, '</h2>');
				}
				if (contents.sub_title) {
					html.push('<h3>', contents.sub_title, '</h3>');
				}

				if (item_data.date) {
					var date_list = item_data.date;
					date_list = (Array.isArray(date_list) ? date_list
							: [ date_list ]).map(function(date) {
						return library_namespace.is_Date(date)
						//
						? date.format('%Y-%2m-%2d') : date;
					}).filter(function(date) {
						return !!date;
					}).join(', ');
					if (date_list) {
						html.push('<div class="date">', date_list, '</div>');
					}
				}

				if (false) {
					html.push('<div style="float:right">', contents.chapter,
							'</div>');
				}

				html.push('<div class="text">',
						normailize_contents(contents.text), '</div>',
						'</body>', '</html>');

				contents = html.join(this.to_XML_options.separator);

			} else {
				contents = normailize_contents(contents);
			}

			if (!item_data.word_count) {
				item_data.word_count = library_namespace.count_word(contents, 1 + 2);
			}

			// 需要先準備好目錄結構。
			this.initialize();

			library_namespace.debug('Write ' + contents.length + ' chars to ['
					+ this.path.text + item.href + ']');
			if (item_data.write_file !== false) {
				library_namespace.write_file(this.path.text + item.href,
						contents);
			} else {
				library_namespace.debug('僅設定 item data，未自動寫入 file，您需要自己完成這動作。');
			}
		}

		if (item_data.TOC) {
			// EPUB Navigation Document
			item.properties = 'nav';
			this.TOC = item;
		} else {
			// chapter or resource
			add_manifest_item.call(this, item);
		}
		return item;
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

		rebuild_index_of_id.call(this);

		if (library_namespace.is_Object(title)) {
			if (title.id in this.chapter_index_of_id) {
				return remove_chapter_by_index.call(this,
						this.chapter_index_of_id[title.id]);
			}
			if (title.title && (title = encode_identifier(title.title, this))
			//
			&& (title in this.chapter_index_of_id)) {
				return remove_chapter_by_index.call(this,
						this.chapter_index_of_id[title]);
			}
			// Nothing found.

		} else if (title in this.chapter_index_of_id
		//
		|| (title = encode_identifier(title, this)) in this.chapter_index_of_id) {
			return remove_chapter_by_index.call(this,
					this.chapter_index_of_id[title]);
		}
	}

	// 自動生成目錄。
	function generate_TOC() {
		var TOC_html = [ '<?xml version="1.0" encoding="UTF-8"?>',
		// https://www.w3.org/QA/2002/04/valid-dtd-list.html
		// https://cweiske.de/tagebuch/xhtml-entities.htm
		// '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"',
		// ' "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
		'<!DOCTYPE html>',
		//
		'<html xmlns="http://www.w3.org/1999/xhtml"',
		//
		' xmlns:epub="http://www.idpf.org/2007/ops">', '<head></head>',
		//
		'<body>',
		//
		'<h1>', this.metadata.title[metadata_prefix + 'title'], '</h1>' ];

		this.resources.some(function(resource) {
			if (resource.properties = "cover-image") {
				TOC_html.push(JSON.to_XML({
					img : null,
					alt : "cover-image",
					title : resource.data && resource.data.url
					//
					|| resource.href,
					src : resource.href
				}));
				return true;
			}
		});

		TOC_html.push(
		// 作品資訊
		'<h2>', 'Work information', '</h2>', '<div id="work_data">', '<dl>');
		Object.entries(this.metadata).forEach(function(data) {
			var key = data[0];
			TOC_html.push('<dt>', key, '</dt>', '<dd>',
			//
			data[1][to_meta_information_key(key)], '</dd>');
		});
		// 字數計算
		var total_word_count = 0;
		this.chapters.forEach(function(chapter) {
			var this_word_count = chapter[KEY_DATA] && chapter[KEY_DATA].word_count;
			if (this_word_count > 0) {
				total_word_count += this_word_count;
			}
		});
		if (total_word_count > 0) {
			TOC_html.push('<dt>', 'word count', '</dt>', '<dd>',
					total_word_count, '</dd>');
		}
		TOC_html.push('</dl>', '</div>');

		// The toc nav element must occur exactly once in an EPUB
		// Navigation Document.
		TOC_html.push('<nav epub:type="toc" id="toc">',
		// 作品目錄 目次
		'<h2>', 'Table of contents', '</h2>', '<ol>');

		this.chapters.map(function(chapter) {
			var data = chapter[KEY_DATA]
			//
			|| library_namespace.null_Object(),
			//
			date = Array.isArray(data.date) ? data.date[0] : data.date;

			date = library_namespace.is_Date(date)
			//
			? date.format(' <small>(%Y-%2m-%2d)</small>') : date || '';

			TOC_html.push([ '<li>', '<a href="' + chapter.href + '">',
			//
			data.title
			// 未失真的title = decode_identifier(item.id, this)
			|| decode_identifier(chapter.id, this),
			//
			date, '</a>', '</li>' ].join(''));
		}, this);

		TOC_html.push('</ol>', '</nav>', '</body>', '</html>');

		return TOC_html.join(this.to_XML_options.separator);
	}

	function write_chapters() {
		this.initialize();

		this.raw_data_ptr.metadata.clear();
		this.raw_data_ptr.metadata.push(Object.values(this.metadata));

		// console.log(chapters);
		if (!this.TOC) {
			this.add({
				title : 'TOC',
				TOC : true
			}, this.generate_TOC());
		}

		var chapters = this.chapters.clone();
		// add TOC as the first chapter.
		chapters.unshift(this.TOC);
		// console.log(this.resources.concat(chapters));

		// {Array}raw_data.package[0].metadata
		// {Array}raw_data.package[1].manifest
		// {Array}raw_data.package[2].spine

		// rebuild package. 但不能動到定義，因此不直接 =[]，採用.push()。
		this.raw_data_ptr.manifest.clear();
		this.resources.concat(chapters).forEach(function(resource) {
			this.raw_data_ptr.manifest.push(
			// 再做一次檢查，預防被外部touch過。
			normalize_item(resource, this, true));
			if (resource[KEY_DATA]) {
				var info = library_namespace.null_Object(), setted;
				// preserve additional properties
				'url,file,type,date,word_count'.split(',')
				//
				.forEach(function(name) {
					if (resource[KEY_DATA][name]) {
						setted = true;
						info[name] = resource[KEY_DATA][name];
					}
				});
				if (setted) {
					this.raw_data_ptr.manifest.push('<!-- '
					//
					+ JSON.stringify(info) + ' -->');
				}
			}
		}, this);

		this.raw_data_ptr.spine.clear();
		this.raw_data_ptr.spine.push(chapters.filter(function(chapter) {
			return !!chapter.id;
		}).map(function(chapter) {
			return {
				itemref : null,
				idref : chapter.id
			};
		}))

		library_namespace.write_file(this.path.book
				+ this.package_document_name,
		//
		JSON.to_XML(this.raw_data, this.to_XML_options));
	}

	// package 打包 bale packing
	function archive_to_ZIP(target_directory, target_file_name, remove) {
		this.flush();

		// remove empty directories
		Object.keys(this.path).sort()
		// 刪除目錄時，應該從深層目錄開始。
		.reverse().forEach(function(name) {
			var directory = this.path[name],
			//
			fso_list = library_namespace.read_directory(directory);
			if (!fso_list || fso_list.length === 0) {
				library_namespace.debug(
				//
				'remove empty directory: ' + directory);
				library_namespace.remove_directory(directory);
			}
		}, this);

		library_namespace.debug('bale packing: Not Yet Implemented.');

		// TODO: use application.OS.execute instead
		/** node.js: run OS command */
		var execSync = require('child_process').execSync;

		// 注意: 這需要先安裝7z.exe程式
		library_namespace.write_file(this.path.root + 'create.bat', [
		// @see create_ebook.bat
		'SET P7Z="C:\\Program Files\\7-Zip\\7z.exe"',
				'SET BOOKNAME=' + 'book.epub',
				// store mimetype
				'%P7Z% a -tzip -mx=0 %BOOKNAME% mimetype',
				'%P7Z% rn %BOOKNAME% mimetype !imetype',
				// archive others
				'%P7Z% a -tzip -mx=9 -r %BOOKNAME% META-INF EPUB',
				'%P7Z% rn %BOOKNAME% !imetype mimetype' ].join('\r\n'));
		var command = 'cd /d "' + this.path.root + '" && ' + 'create.bat';
		try {
			execSync(command);
		} catch (e) {
			library_namespace.err(e);
			return;
		}

		if (!/[\\\/]$/.test(target_directory)) {
			target_directory += path_separator;
		}

		if (!target_file_name) {
			target_file_name = this.path.root.match(/([^\\\/]+)[\\\/]$/)[1];
		}

		if (!target_file_name.includes('.')) {
			target_file_name += '.epub';
		}

		// book.epub → *.epub
		library_namespace.move_file(this.path.root + 'book.epub',
				target_directory + target_file_name);

		if (remove) {
			// the operatoin failed
			library_namespace.remove_directory(this.path.root);
		}
	}

	Ebook.prototype = {
		// default root directory name
		// Open eBook Publication Structure (OEBPS)
		// @see [[Open eBook]]
		// http://www.idpf.org/epub/31/spec/epub-ocf.html#gloss-ocf-root-directory
		root_directory_name : 'EPUB',
		// http://www.idpf.org/epub/31/spec/epub-spec.html#gloss-package-document
		// e.g., EPUB/content.opf
		package_document_name : 'content.opf',

		to_XML_options : {
			declaration : true,
			separator : '\n'
		},

		// 應該用[A-Za-z]起始，但光單一字母不容易辨識。
		id_prefix : 'i',

		setup_container : setup_container,
		initialize : initialize,
		set_raw_data : set_raw_data,
		set : set_meta_information,
		// book.set_cover(url)
		// book.set_cover({url:'url',file:'file_name'})
		// book.set_cover(file_name, contents)
		set_cover : set_cover_image,
		arrange : function() {
			rebuild_index_of_id.call(this, false, true);
			rebuild_index_of_id.call(this, true, true);
		},
		add : add_chapter,
		remove : remove_chapter,

		generate_TOC : generate_TOC,
		flush : write_chapters,
		pack : archive_to_ZIP
	};

	return Ebook;
}
