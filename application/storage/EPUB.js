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


TODO:
the NCX
http://www.idpf.org/epub/20/spec/OPF_2.0.1_draft.htm

スタイル設定


 </code>
 * 
 * @since 2017/1/24 11:55:51
 * @see [[en:file format]], [[document]], [[e-book]], [[EPUB]], [[Open eBook]]
 *      http://www.idpf.org/epub/31/spec/epub-packages.html
 *      https://www.w3.org/Submission/2017/SUBM-epub-packages-20170125/
 *      http://epubzone.org/news/epub-3-validation http://validator.idpf.org/
 *      http://imagedrive.github.io/spec/epub30-publications.xhtml
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
	+ '|application.storage.'
	// for .to_file_name()
	// + '|application.net.'
	// for .gettext
	// + '|application.locale.'
	,

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
	// Dublin Core Metadata Element Set 前置碼, 前綴
	// http://dublincore.org/documents/dces/
	metadata_prefix = 'dc:',
	// key for additional information / configuration data
	KEY_DATA = 'item data',

	/** {String}path separator. e.g., '/', '\' */
	path_separator = library_namespace.env.path_separator;

	// -------------------------------------------------------------------------
	// setup相關函式。

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
				library_namespace.error('本函式庫尚不支援多 rootfile (.opf)!');
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

		// The resources downloading now.
		// @see add_chapter()
		this.downloading = library_namespace.null_Object();

		/**
		 * <code>
		 * this.metadata = {
		 * 	'dc:tagname' : [ {Object} ],
		 * 	meta : { [property] : [ {Object} ] },
		 * 	link : { href : {Object} }
		 * }
		 * </code>
		 * 
		 * @see set_meta_information()
		 */
		this.metadata = library_namespace.null_Object();

		var raw_data;
		if (options.rebuild) {
			// rebuild: 重新創建, 不使用舊的.opf資料. start over, re-create
			// TODO: remove directories+files
			// this.use_cache = false;
			this.rebuild = true;
		} else {
			raw_data = library_namespace
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
		if (!raw_data) {
			if (!options.id_type) {
				options.id_type = 'workid';
			}
			// assert: typeof options.id_type === 'string'

			// 這邊必須符合 JSON.from_XML() 獲得的格式。
			raw_data = {
				package : [ {
					// http://www.idpf.org/epub/31/spec/epub-packages.html#sec-opf-dcmes-required
					metadata : [ {
						'dc:identifier' : options.identifier
						//
						|| options.id || new Date().toISOString(),
						id : options.id_type,
					// ** 以下非必要，例如供calibre使用。
					// http://www.idpf.org/epub/31/spec/epub-packages.html#attrdef-identifier-scheme
					// 'opf:scheme' : options.id_type
					}, {
						'dc:title' : options.title || ''
					}, {
						// TODO: calibre 不認得 "cmn-Hant-TW"
						'dc:language' : options.language || 'en'
					}, {
						// epub發行時間應用dc:date。
						// the publication date of the EPUB Publication.
						'dc:date' : date_to_String()
					}, {
						// 作品內容最後編輯時間。應該在new Ebook()後自行變更此值至稍早作品最後更動的時間。
						meta : date_to_String(options.modified),
						// Date on which the resource was changed.
						// http://dublincore.org/documents/dcmi-terms/#terms-modified
						property : "dcterms:modified"
					} ],
					'xmlns:dc' : "http://purl.org/dc/elements/1.1/",
					// ** 以下非必要，例如供calibre使用。
					'xmlns:opf' : "http://www.idpf.org/2007/opf",
					'xmlns:dcterms' : "http://purl.org/dc/terms/",
					'xmlns:xsi' : "http://www.w3.org/2001/XMLSchema-instance",
					// ** 以下非必要，僅供calibre使用。
					'xmlns:calibre' :
					// raw_data.package[0]['xmlns:calibre']
					"http://calibre.kovidgoyal.net/2009/metadata"
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
					// represent the default reading order
					// of the given Rendition.
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
				// e.g., "AMAZON_JP", "MOBI-ASIN"
				'unique-identifier' : options.id_type
			};
		}
		this.raw_data = raw_data;

		// http://epubzone.org/news/epub-3-and-global-language-support
		if (options.language) {
			if (library_namespace.gettext) {
				library_namespace.debug('Load language ' + options.language);
				library_namespace.gettext.load_domain(options.language);
			}
			// 似乎不用加也沒問題。
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

		set_meta_information.call(this, this.raw_data_ptr.metadata);
		// console.log(JSON.stringify(this.metadata));
		// console.log(this.metadata);

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

	// -------------------------------------------------------------------------
	// 設定 information 相關函式。

	// to_meta_information_key
	function to_meta_information_tag_name(tag_name) {
		return tag_name === 'meta' || tag_name === 'link'
				|| tag_name.startsWith(metadata_prefix) ? tag_name
				: metadata_prefix + tag_name;
	}

	/**
	 * Setup the meta information of the ebook.
	 * 
	 * @param {String}tag_name
	 *            tag name (key) to setup.
	 * @param {Object|String}value
	 *            Set to the value.
	 * 
	 * @returns the value of the tag
	 */
	function set_meta_information(tag_name, value) {
		if (library_namespace.is_Object(tag_name) && value === undefined) {
			/**
			 * @example <code>

			ebook.set({
				// 作者名
				creator : 'author',
				// 作品內容最後編輯時間。
				meta : {
					meta : last_update_Date,
					property : "dcterms:modified"
				},
				subject : [ genre ].concat(keywords)
			});

			 * </code>
			 */
			Object.entries(tag_name).forEach(function(pair) {
				// 以能在一次設定中多次設定不同的<meta>
				if (pair[0].startsWith('meta:')) {
					pair[0] = 'meta';
				}
				set_meta_information.call(this, pair[0], pair[1]);
			}, this);
			return;
		}

		if (Array.isArray(tag_name) && value === undefined) {
			/**
			 * @example <code>

			ebook.set([
				{'dc:identifier':'~',id:'~'},
				{'dc:title':'~'},
				{'dc:language':'ja'},
			]);

			 * </code>
			 */
			tag_name.forEach(function(element) {
				if (!library_namespace.is_Object(element)) {
					return;
				}
				for ( var tag_name in element) {
					set_meta_information.call(this, tag_name, element);
					break;
				}
			}, this);
			return;
		}

		/**
		 * @example <code>

		ebook.set('title', '~');
		ebook.set('date', new Date);
		ebook.set('subject', ['~','~']);

		ebook.set('dc:title', {'dc:title':'~'});

		 * </code>
		 */

		// normalize tag name
		tag_name = to_meta_information_tag_name(tag_name);

		// normalize value
		if (typeof value === 'string') {
			if (value.includes('://')) {
				// 正規化 URL。處理/escape URL。
				// e.g., <dc:source>
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
		if (value !== undefined) {
			if (!library_namespace.is_Object(value)) {
				var element = library_namespace.null_Object();
				// 將value當作childNode
				element[tag_name] = value;
				value = element;
			}
			library_namespace.debug(tag_name + '=' + JSON.stringify(value), 6);
		}

		var container = this.metadata,
		// required attribute
		required;
		if (tag_name === 'meta') {
			// 無.property時以.name作為key
			// e.g., <meta name="calibre:series" content="~" />
			required = value && value.property ? 'property' : 'name';
		} else if (tag_name === 'link') {
			required = 'href';
		}

		function set_value() {
			if (!container.some(function(element, index) {
				if (element[tag_name] === value[tag_name]) {
					library_namespace.debug('Duplicate element: '
							+ JSON.stringify(element), 3);
					// 以新的取代舊的。
					container[index] = value;
					return true;
				}
			})) {
				container.push(value);
			}
		}

		/**
		 * <code>
		 * this.metadata = {
		 * 	'dc:tagname' : [ {Object} ],
		 * 	meta : { [property] : [ {Object} ] },
		 * 	link : { href : {Object} }
		 * }
		 * </code>
		 */
		if (required) {
			// 若已經有此key則沿用舊container直接設定。
			container = container[tag_name]
					|| (container[tag_name] = library_namespace.null_Object());
			if (value === undefined) {
				// get container object
				return container.map(function(element) {
					return element[tag_name] || element.content;
				});
			}
			// set object
			if (!value[required]) {
				throw new Error('Invalid metadata value: '
				//
				+ JSON.stringify(value));
			}
			if (tag_name === 'link') {
				// required === 'href'
				// 相同 href 應當僅 includes 一次
				container[value[required]] = value;
			} else {
				// 將其他屬性納入<meta property="..."></meta>。
				// assert: tag_name === 'meta'
				container = container[value[required]]
						|| (container[value[required]] = []);
				set_value();
			}

		} else {
			// assert: tag_name.startsWith(metadata_prefix)
			container = container[tag_name] || (container[tag_name] = []);
			if (value === undefined) {
				// get container object
				return container.map(function(element) {
					return element[tag_name];
				});
			}
			// set object
			set_value();
		}

		return value;
	}

	// -------------------------------------------------------------------------
	// 編輯chapter相關函式。

	/**
	 * 必須先確認沒有衝突
	 * 
	 * @inner
	 */
	function add_manifest_item(item, is_resource) {
		if (typeof is_resource === 'boolean' ? is_resource
				: detect_file_type(item.href) !== 'text') {
			// 檢測是否存在相同資源(.href)並做警告。
			if (item.id in this.resource_index_of_id) {
				var index = this.resource_index_of_id[item.id];
				// 留著resource
				// remove_chapter.call(this, index, true, true);
				this.resources[index] = item;
			} else {
				this.resource_index_of_id[item.id] = this.resources.length;
				this.resources.push(item);
			}

		} else {
			// 檢測是否存在相同資源(.href)並做警告。
			if (item.id in this.chapter_index_of_id) {
				var index = this.chapter_index_of_id[item.id];
				// remove_chapter.call(this, index, true);
				this.chapters[index] = item;
			} else {
				this.chapter_index_of_id[item.id] = this.chapters.length;
				this.chapters.push(item);
			}
		}
	}

	// 表紙設定
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
				file : library_namespace.MIME_of(item_data)
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
			library_namespace.error('decode_identifier: Can not decode: ['
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

		// 可能僅是在測試是否可以偵測得出 type
		library_namespace.debug('Can not determine the type of [' + file_name
				+ ']');
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
					// タイトル
					title : item_data
				};
			}
		}

		// item_data.file = library_namespace.to_file_name(item_data.file);

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
				library_namespace.error('Invalid item data: '
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
		if (library_namespace.is_debug()
		// ↑ 可能是placeholder，因此僅作debug。
		&& !/^[a-z]+\/[a-z\d+]+$/.test(item['media-type'])) {
			library_namespace.warn('Invalid or did not set media-type: '
					+ JSON.stringify(item));
		}

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

		var chapter_index_of_id = this.chapter_index_of_id;
		if (library_namespace.is_Object(title)) {
			if (title.id === this.TOC.id) {
				return 'TOC';
			}

			if (title.id in chapter_index_of_id) {
				return chapter_index_of_id[title];
			}
			title = title.title;
		} else if (title in chapter_index_of_id) {
			// title 為 id
			return chapter_index_of_id[title];
		}

		var encoded = encode_identifier(title, this);

		if (encoded in chapter_index_of_id) {
			// title 為 title
			return chapter_index_of_id[encoded];
		}

		// 剩下的可能為 href, url
		if (false && !/\.x?html?$/i.test(title)) {
			return NOT_FOUND;
		}

		for (var chapters = this.chapters, index = 0, length = chapters.length; index < length; index++) {
			var item = chapters[index];
			// console.log('> ' + title);
			// console.log(item);
			if (
			// title === item.id || title === decode_identifier(item.id, this)
			// ||
			title === item.href || item[KEY_DATA]
					&& title === item[KEY_DATA].url) {
				return index;
			}
		}

		// Nothing found.
		return NOT_FOUND;
	}

	function is_the_same_item(item1, item2) {
		return item1 && item2 && item1.id === item2.id
				&& item1.href === item2.href;
	}

	// 正規化XHTML書籍章節內容。
	function normailize_contents(contents) {
		library_namespace.debug('正規化XHTML書籍章節內容: ' + contents, 6);
		contents = contents.replace(/\r\n?/g, '\n')
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
		// for ALL <img>
		.replace(/(<img ([^<>]+)>)(\s*<\/img>)?/ig,
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

		// contents = contents.replace(/<script[^<>]*>[^<>]*<\/script>/, '');

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

		var _this = this, item = normalize_item(item_data, this);
		item_data = item[KEY_DATA] || library_namespace.null_Object();
		// assert: library_namespace.is_Object(item_data)
		// console.log(item_data);
		// console.log(item);

		rebuild_index_of_id.call(this);
		rebuild_index_of_id.call(this, true);

		// 有contents的話，採用contents做為內容。並從item.href擷取出檔名。
		if (!contents && item_data.url) {
			// 沒contents的一律當作resource。
			var resource_href_hash = library_namespace.null_Object(),
			//
			file_type = detect_file_type(item_data.file || item.href)
					|| detect_file_type(item_data.url),
			//
			file_path = this.path[file_type || 'media']
					+ get_file_name_of_url(item.href);
			// item_data.reget_resource: 強制重新取得資源檔。
			if (!item_data.reget_resource
			// 必須存在資源檔。
			&& library_namespace.file_exists(file_path)
			// 假如 media-type 不同，就重新再取得一次檔案。
			&& item['media-type'] === library_namespace.MIME_of(item_data.url)
			//
			&& this.resources.some(function(resource) {
				if (resource[KEY_DATA]
				//
				&& resource[KEY_DATA].url === item_data.url
				// TODO: reget resource
				// && item['media-type'] && item['media-type'] !== 'undefined'
				) {
					var message = '已經有相同的資源檔 ['
					//
					+ item['media-type'] + '] ' + resource[KEY_DATA].url;
					if (item_data.href
					// 有手動設定.href
					&& item_data.href !== resource.href) {
						library_namespace.error(message
						//
						+ '\n但 .href 不同，您必須手動修正: '
						//
						+ resource.href + '→' + item_data.href);
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
				library_namespace
						.error('add_chapter: 儲存檔名改變，您需要自行修正原參照文件中之檔名:\n'
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
				library_namespace.error('add_chapter: id改變，您需要自行修正原參照文件中之檔名:\n'
						+ item_data.id + ' →\n' + item.id);
			}

			if (!item_data.type) {
				// 先猜一個，等待會取得資源後再用XMLHttp.type設定。
				// item_data.type = library_namespace.MIME_of('jpg');
			}
			// 先登記預防重複登記 (placeholder)。
			add_manifest_item.call(this, item, true);

			// 先給個預設的media-type。
			item['media-type'] = library_namespace.MIME_of(item_data.url);

			item_data.file_path = file_path;
			// 自動添加.downloading登記。
			this.downloading[item_data.file_path] = item_data;

			// 需要先準備好目錄結構以存入media file。
			this.initialize();

			// 自網路取得url。
			library_namespace.log('add_chapter: fetch URL: ' + item_data.url);

			// assert: CeL.application.net.Ajax included
			library_namespace.get_URL_cache(item_data.url, function(contents,
					error, XMLHttp) {
				// save MIME type
				if (XMLHttp && XMLHttp.type) {
					if (item['media-type']
					// 需要連接網站的重要原因之一是為了取得 media-type。
					&& item['media-type'] !== XMLHttp.type) {
						library_namespace
								.error('add_chapter: 從網路得到的 media-type ['
										+ XMLHttp.type
										+ '] 與從副檔名所得到的 media-type ['
										+ item['media-type'] + '] 不同!');
					}
					// 這邊已經不能用 item_data.type。
					item['media-type'] = XMLHttp.type;

				} else if (!item['media-type']) {
					library_namespace
							.error('Did not got media-type of media: ['
									+ item_data.url + ']');
				}

				// 基本檢測。
				if (/text/i.test(item_data.type)) {
					library_namespace.error('Not media type: ['
							+ item_data.type + '] ' + item_data.url);
				}

				library_namespace.log('add_chapter: got resource: ['
						+ item['media-type'] + '] ' + item_data.url + '\n→ '
						+ item.href);

				// item_data.write_file = false;

				// 註銷.downloading登記。
				delete _this.downloading[item_data.file_path];
				if (_this.on_all_downloaded
				// 在事後檢查.on_all_downloaded，看是不是有callback。
				&& library_namespace.is_empty_object(_this.downloading)) {
					_this.on_all_downloaded();
					// 註銷登記。
					delete _this.on_all_downloaded;
				}
			}, {
				file_name : item_data.file_path,
				// rebuild時不會讀取content.opf，因此若無法判別media-type時則需要reget。
				// 須注意有沒有同名但不同內容之檔案。
				reget : this.rebuild && !item['media-type'],
				encoding : undefined,
				charset : file_type === 'text' && item_data.charset
				//
				|| 'binary',
				get_URL_options : item_data.get_URL_options
			});
			return item;
		}

		// 有contents時除非指定.use_cache，否則不會用cache。
		// 無contents時除非指定.force(這通常發生於呼叫端會自行寫入檔案的情況)，否會保留cache。
		if ((contents ? item_data.use_cache : !item_data.force)
		// 若是已存在相同資源(.id + .href)則直接跳過。 need unique links
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
					+ (item_data.file || decode_identifier(item.id, this)), 2);
			return;
		}

		function check_text(contents) {
			contents = normailize_contents(contents);

			if (item_data.internalize_media) {
				// include images / 自動載入內含資源, 將外部media內部化
				var links = [];
				contents = contents.replace(/ (src|href)="([^"]+)"/g, function(
						all, attribute_name, url) {
					// [ url, path, file_name, is_directory ]
					var matched = url.match(/^([\s\S]*\/)([^\/]+)(\/)?$/);
					if (!matched || matched[3] && attribute_name !== 'src') {
						library_namespace.log('Skip resource: ' + url
								+ '\n of ' + item_data.file);
						return all;
					}
					var href = _this.directory.media + matched[2];
					links.push({
						url : url,
						href : href,
						get_URL_options : item_data.get_URL_options
					});
					return matched ? ' title="' + url + '" ' + attribute_name
							+ '="' + href + '"' : all;
				});

				contents = contents.replace(/<a ([^<>]+)>([^<>]+)<\/a>/ig,
				// <a href="*.png">挿絵</a> → <img alt="挿絵" src="*.png" />
				function(all, attributes, innerHTML) {
					var href = attributes
							.match(/(?:^|\s)href=(["'])([^"'])\1/i)
							|| attributes.match(/(?:^|\s)href=()([^"'\s])/i);
					if (!href || /\.html?$/i.test(href[2])) {
						return all;
					}
					return '<img '
							+ (attributes.includes('alt="') ? '' : 'alt="'
									+ innerHTML + '" ')
							+ attributes.replace(/(?:^|\s)href=(["'])/ig,
									' src=$1').trim() + ' />';
				});

				contents = contents.replace(/<img ([^<>]+)>/ig, function(tag,
						attributes) {
					return '<img ' + attributes.replace(
					// <img> 中不能使用 name="" 之類
					/(?:^|\s)(?:name|border|onmouse[a-z]+|onload)=[^\s]+/ig,
					//
					'').trim() + '>';
				});

				if (links.length > 0) {
					links = links.unique();
					// console.log(links);
					// TODO: 這個過程可能使資源檔還沒下載完，整本書的章節就已經下載完了。
					// 應該多加上對資源檔是否已完全下載完畢的檢查。
					_this.add(links);
				}
			}

			return contents;
		}

		if (contents) {
			if (detect_file_type(item.href) !== 'text') {
				// assert: item, contents 為 resource。

			} else if (library_namespace.is_Object(contents)) {
				// 預設自動生成。
				library_namespace.debug(contents, 6);
				var _ = setup_gettext.call(this),
				//
				html = [ '<?xml version="1.0" encoding="UTF-8"?>',
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

				// ------------------------------

				// 設定item_data.url可以在閱讀電子書時，直接點選標題就跳到網路上的來源。
				var url_header = item_data.url
						&& ('<a href="' + item_data.url + '">'), title_layer = [];
				// 卷標題
				if (contents.title) {
					title_layer
							.push('<h2>', url_header ? url_header
									+ contents.title + '</a>' : contents.title,
									'</h2>');
				}
				// 章標題
				if (contents.sub_title) {
					title_layer.push('<h3>', url_header ? url_header
							+ contents.sub_title + '</a>' : contents.sub_title,
							'</h3>');
				} else if (!contents.title) {
					library_namespace.warn('add_chapter: 未設定標題: '
							+ String(contents.text).slice(0, 200) + '...');
				}

				// ------------------------------

				// 將作品資訊欄位置右。
				html.push('<div id="chapter_information" style="float:right">');

				if (item_data.date) {
					// 掲載日/掲載開始日, 最新投稿/最終投稿日
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
						// 加入本章節之最後修訂日期標示。
						html.push('<p class="date">', date_list, '</p>');
					}
				}

				if (false) {
					html.push('<div>', contents.chapter, '</div>');
				}

				var post_processor = contents.post_processor;
				contents = check_text(contents.text);
				if (typeof post_processor === 'function') {
					// 進一步處理書籍之章節內容。例如繁簡轉換、錯別字修正、裁剪廣告。
					// 因為這個函數可能有記錄功能，因此就算是空內容，也必須執行。
					contents = post_processor(contents);
				}
				if (contents.length > 5e5) {
					// 這長度到這邊往往已經耗費數十秒。
					library_namespace.debug('contents length: '
							+ contents.length + '...');
				}
				if (!(item_data.word_count > 0)) {
					item_data.word_count = library_namespace.count_word(
							contents, 1 + 2);
				}
				html.push('<p class="word_count">',
				// 加入本章節之字數統計標示。
				_('%1 words', item_data.word_count)
				// 從第一章到本章的文字總數。
				+ (item_data.words_so_far > 0 ? ', ' + _('%1 words',
				// item_data.words_so_far: 本作品到前一個章節總計的字數。
				item_data.words_so_far + item_data.word_count) : ''), '</p>');

				html.push('</div>');

				// ------------------------------

				html.append(title_layer);

				// 加入本章節之內容。
				html.push('<div class="text">', contents, '</div>', '</body>',
						'</html>');

				contents = contents.length > this.MIN_CONTENTS_LENGTH ? html
						.join(this.to_XML_options.separator) : '';

			} else {
				contents = check_text(contents);
			}
		}

		var text;
		if ((!contents || !(contents.length >= this.MIN_CONTENTS_LENGTH))
		// 先嘗試讀入舊的資料。
		&& (text = library_namespace.read_file(this.path.text + item.href))) {
			contents = text;
			// 取得純內容部分。
			if (false) {
				contents = text.between('<div class="text">', {
					tail : '</div>'
				});
			}
		}

		if (contents && contents.length >= this.MIN_CONTENTS_LENGTH) {
			// 應允許文字敘述式 word count。
			if (!item_data.word_count && item_data.word_count !== 0) {
				item_data.word_count = library_namespace.count_word(contents,
						1 + 2);
			}

			if (text) {
				library_namespace.warn(
				//
				'add_chapter: 因為欲設定的內容長度過短或者無內容，因此從cache檔案中取得舊的內容('
						+ contents.length + ' 字元):\n'
						+ (item_data.file || decode_identifier(item.id, this))
						+ (item_data.url ? ' (' + item_data.url + ')' : ''));
			} else if (item_data.write_file !== false) {
				library_namespace.debug('Write ' + contents.length
						+ ' chars to [' + this.path.text + item.href + ']');
				// 需要先準備好目錄結構。
				this.initialize();
				// 寫入檔案。
				library_namespace.write_file(this.path.text + item.href,
						contents);
			} else if (text) {
				library_namespace.debug('僅設定 item data，未自動寫入 file ['
						+ this.path.text + item.href + ']，您需要自己完成這動作。');
			}

		} else if (!item_data.force) {
			library_namespace.info('add_chapter: 跳過'
					+ (contents ? '長度過短的內容 (' + contents.length + ' chars)'
							: '無內容/空章節') + ': '
					+ (item_data.file || decode_identifier(item.id, this))
					+ (item_data.url ? ' (' + item_data.url + ')' : ''));
			item.error = 'too short';
			return item;
		}

		if (item_data.TOC) {
			library_namespace.debug('若是已存在此chapter則先移除: ' + item.id, 3);
			remove_chapter.call(this, item.id);

			// EPUB Navigation Document
			item.properties = 'nav';
			this.TOC = item;

		} else {
			if (this.TOC && this.TOC.id === item.id) {
				// @see remove_chapter()
				library_namespace.remove_file(this.path.text + this.TOC.href);
				delete this.TOC;
			} else {
				// remove_chapter.call(this, item, true);
			}

			// chapter or resource
			add_manifest_item.call(this, item, false);
		}
		return item;
	}

	function remove_chapter(title, preserve_data, is_resource) {
		// TODO: is_resource

		var index;
		if (title >= 0) {
			index = title;
		} else {
			index = index_of_chapter.call(this, title);
			if (!(index >= 0)) {
				return;
			}
		}

		var item = preserve_data ? this.chapters[index] : this.chapters.splice(
				index, 1);
		library_namespace.remove_file(this.path.text + item.href);
		return [ index, item ];
	}

	// -------------------------------------------------------------------------
	// 打包相關函式。

	function setup_gettext() {
		var language = set_meta_information.call(this, 'language');
		if (language && (language = language[0])) {
			library_namespace.debug('Use language ' + language);
		}

		var _ = library_namespace.gettext
		// @see application/locale/resource/locale.txt
		? library_namespace.gettext.in_domain.bind(null, language) : function(
				text_id, _1) {
			return text_id.replace(/%1/g, _1);
		};

		return _;
	}

	// 自動生成目錄。
	function generate_TOC() {
		var _ = setup_gettext.call(this),
		//
		TOC_html = [ '<?xml version="1.0" encoding="UTF-8"?>',
		// https://www.w3.org/QA/2002/04/valid-dtd-list.html
		// https://cweiske.de/tagebuch/xhtml-entities.htm
		// '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"',
		// ' "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
		'<!DOCTYPE html>',
		//
		'<html xmlns="http://www.w3.org/1999/xhtml"',
		//
		' xmlns:epub="http://www.idpf.org/2007/ops">',
		//
		'<head><meta charset="UTF-8" /></head>',
		//
		'<body>',
		// 一般說來，title應該只有一個。
		'<h1>', set_meta_information.call(this, 'title').join(', '), '</h1>' ];

		this.resources.some(function(resource) {
			if (resource.properties = "cover-image") {
				TOC_html.push(JSON.to_XML({
					img : null,
					alt : "cover-image",
					title : resource[KEY_DATA] && resource[KEY_DATA].url
					//
					|| resource.href,
					src : resource.href
				}));
				return true;
			}
		});

		TOC_html.push(
		// 作品資訊, 小説情報, 電子書籍紹介, 作品情報, book information
		'<h2>', _('Work information'), '</h2>', '<div id="work_data">', '<dl>');

		/**
		 * <code>
		 * this.metadata = {
		 * 	'dc:tagname' : [ {Object} ],
		 * 	meta : { [property] : [ {Object} ] },
		 * 	link : { href : {Object} }
		 * }
		 * </code>
		 */
		function add_information(data) {
			var key = data[0].replace(metadata_prefix, ''),
			// data = [ tag_name or property, element list ]
			values = data[1].map(function(element) {
				var value = element[data[0]]
				// for <meta>, data[0] is property
				|| element.meta || element.content;
				if (library_namespace.is_Date(value)) {
					// e.g., dcterms:modified, <dc:date>
					// value = date_to_String(value);
					value = value.toLocaleTimeString();
				}
				return value;
			});

			if (key === 'language') {
				if (library_namespace.gettext) {
					values = values.map(function(value) {
						return library_namespace.gettext.get_alias(value);
					});
				}
			} else if (key === 'source') {
				if (library_namespace.gettext) {
					values = values.map(function(value) {
						if (/^https?:\/\/[^\s]+$/.test(value)) {
							value = '<a href="' + value + '">'
							//
							+ value + '</a>';
						}
						return value;
					});
				}
			}

			TOC_html.push('<dt>', _(key), '</dt>',
			//
			'<dd>', values.join(', '), '</dd>');
		}

		Object.entries(this.metadata).forEach(function(data) {
			if (data[0] === 'meta' || data[0] === 'link') {
				// 待會處理。
				return;
			}

			// data = [ tag_name, element list ]
			add_information(data);
		});

		if (library_namespace.is_Object(this.metadata.meta)) {
			Object.entries(this.metadata.meta).forEach(add_information);
		}

		// Skip this.metadata.link

		var _ = setup_gettext.call(this),
		// 字數計算, 合計文字数
		total_word_count = 0;
		this.chapters.forEach(function(chapter) {
			var this_word_count = chapter[KEY_DATA]
					&& chapter[KEY_DATA].word_count;
			if (this_word_count > 0) {
				total_word_count += this_word_count;
			}
		});
		if (total_word_count > 0) {
			TOC_html.push('<dt>', _('word count'), '</dt>', '<dd>',
			//
			_('%1 words', total_word_count) + ' / '
			//
			+ _('%1 chapters', this.chapters.length) + ' ≈ '
			// 平均文字数
			+ Math.round(total_word_count / this.chapters.length), '</dd>');
		}
		TOC_html.push('</dl>', '</div>');

		// The toc nav element must occur exactly once in an EPUB
		// Navigation Document.
		TOC_html.push('<nav epub:type="toc" id="toc">',
		// 作品目錄 目次 Table of contents
		'<h2>', _('Contents'), '</h2>', '<ol>');

		this.chapters.map(function(chapter) {
			var data = chapter[KEY_DATA]
			//
			|| library_namespace.null_Object(),
			//
			date = Array.isArray(data.date) ? data.date[0] : data.date;
			// console.log(data);

			date = date ? ' <small>(' + (library_namespace.is_Date(date)
			//
			? date.format('%Y-%2m-%2d') : date) + ')</small>' : '';
			// console.log(date);

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

	function write_chapters(callback) {
		// 對media過多者，可能到此尚未下載完。
		if (!library_namespace.is_empty_object(this.downloading)) {
			if (this.on_all_downloaded) {
				library_namespace.warn(
				// 棄置
				'There is already callback .on_all_downloaded exists! I will discard it: '
						+ this.on_all_downloaded);
			}
			// 註冊callback
			this.on_all_downloaded = write_chapters.bind(this, callback);
			library_namespace.debug('Waiting for all resources loaded...');
			return;
		}

		'identifier,title,language,dcterms:modified'.split(',')
		// little check
		.forEach(function(item) {
			var is_meta = item.includes(':'),
			//
			container = this.metadata[
			//
			is_meta ? 'meta' : to_meta_information_tag_name(item)];
			if (is_meta) {
				container = container[item];
			}
			if (!container || !(container.length >= 1)) {
				library_namespace.warn('Lost ' + item);
			}
		}, this);

		this.initialize();

		var meta = this.metadata.meta, link = this.metadata.link;
		// sort: 將meta,link至於末尾。
		delete this.metadata.meta;
		delete this.metadata.link;
		this.metadata.meta = meta;
		this.metadata.link = link;
		/**
		 * <code>
		 * this.metadata = {
		 * 	'dc:tagname' : [ {Object} ],
		 * 	meta : { [property] : [ {Object} ] },
		 * 	link : { href : {Object} }
		 * }
		 * </code>
		 */
		this.raw_data_ptr.metadata.clear();
		Object.entries(this.metadata).forEach(function(data) {
			if (data[0] === 'meta' || data[0] === 'link') {
				// 待會處理。
				return;
			}

			// TODO: 正規化{Object}data[1]，如值中有 {Date}。
			this.raw_data_ptr.metadata.append(data[1]);
		}, this);

		if (library_namespace.is_Object(this.metadata.meta)) {
			Object.values(this.metadata.meta).forEach(function(list) {
				// element list
				// TODO: 正規化{Object}data[1]，如值中有 {Date}。
				this.raw_data_ptr.metadata.append(list);
			}, this);
		}

		if (library_namespace.is_Object(this.metadata.link)) {
			this.raw_data_ptr.metadata.push(Object.values(this.metadata.link));
		}

		// console.log(chapters);
		if (!this.TOC
		// TODO: check the TOC file exists.
		) {
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
				this.preserve_attributes.forEach(function(name) {
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

		typeof callback === 'function' && callback();
	}

	// cache the path of p7z executable file
	var p7zip_path = library_namespace.executable_file_path('7z')
			|| '%ProgramFiles%\\7-Zip\\7z.exe';

	// package, bale packing 打包 epub
	function archive_to_ZIP(target_file, remove) {
		// check arguments
		if (Array.isArray(target_file) && target_file.length === 2) {
			// [ target_directory, target_file_name ]
			var target_directory = target_file[0];
			target_file = target_file[1];

			if (!target_directory) {
				target_directory = this.path.root;
			} else if (!/[\\\/]$/.test(target_directory)) {
				target_directory += path_separator;
			}

			if (!target_file) {
				target_file = this.path.root.match(/([^\\\/]+)[\\\/]$/)[1];
			}

			// target_file = library_namespace.to_file_name(target_file);

			target_file = target_directory + target_file;
		}
		// assert: typeof target_file === 'string'

		if (!/\.[^\\\/.]+$/.test(target_file)) {
			// add file extension
			target_file += '.epub';
		}

		// this.flush();

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

		// TODO: use application.OS.Windows.archive,
		// application.OS.execute instead
		/** node.js: run OS command */
		var execSync = require('child_process').execSync;

		var command_file_name = 'create.bat', ebook_file_name = 'book.epub';
		library_namespace.remove_file(this.path.root + ebook_file_name);
		// 生成 .bat，作業完畢之後就會自動刪除 .bat。
		// 注意: 這需要先安裝 7z.exe 程式。
		library_namespace.write_file(this.path.root + command_file_name, [
		// @see create_ebook.bat
		'SET P7Z="' + p7zip_path + '"',
				'SET BOOKNAME="' + ebook_file_name + '"',
				// store mimetype first
				'%P7Z% a -tzip -mx=0 -- %BOOKNAME% mimetype',
				'%P7Z% rn -- %BOOKNAME% mimetype !imetype',
				// archive others
				'%P7Z% a -tzip -mx=9 -r -- %BOOKNAME% META-INF EPUB',
				'%P7Z% rn -- %BOOKNAME% !imetype mimetype' ].join('\r\n'));
		var command = 'cd /d "' + this.path.root + '" && ' + command_file_name;
		// https://github.com/ObjSal/p7zip/blob/master/GUI/Lang/ja.txt
		library_namespace.debug('create ebook by 7z: ' + ebook_file_name);
		try {
			execSync(command);
		} catch (e) {
			library_namespace.error(e);
			return;
		}
		library_namespace.debug('create ebook by 7z: ' + ebook_file_name
				+ ': Done.');

		// book.epub → *.epub
		var error = library_namespace.move_file(this.path.root
				+ ebook_file_name, target_file);
		if (error) {
			// the operatoin failed
			library_namespace.error(error);
		}

		// 若需要留下/重複利用media如images，請勿remove。
		if (remove) {
			// rd /s /q this.path.root
			// 這會刪除整個目錄，包括未被index的檔案。
			var error = library_namespace.remove_directory(this.path.root);
			if (error) {
				// the operatoin failed
				library_namespace.error(error);
			}
		} else {
			// 最起碼 command_file_name 已經不需要存在。
			library_namespace.remove_file(this.path.root + command_file_name);
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

		// 預設所容許的章節最短內容字數。最少應該要容許一句話的長度。
		MIN_CONTENTS_LENGTH : 4,

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
		archive : archive_to_ZIP,
		// preserve additional properties
		preserve_attributes : 'meta,url,file,type,date,word_count'.split(','),
		pack : function(target_file, remove, callback) {
			this.flush(function() {
				this.archive(target_file, remove);
				typeof callback === 'function' && callback();
			}.bind(this));
		}
	};

	return Ebook;
}
