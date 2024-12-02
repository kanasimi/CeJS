/**
 * @name CeL function for Electronic Publication (EPUB)
 * @fileoverview 本檔案包含了解析與創建 EPUB file 電子書的 functions。
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

http://www.idpf.org/epub/31/spec/epub-changes.html
The EPUB 2 NCX file for navigation is now marked for removal in EPUB 3.1.


TODO:
スタイル設定

split epubs based on groups / size

 </code>
 * 
 * @since 2017/1/24 11:55:51
 * @see [[en:file format]], [[document]], [[e-book]], [[EPUB]], [[Open eBook]]
 *      https://www.w3.org/TR/epub/
 *      http://www.idpf.org/epub/31/spec/epub-packages.html
 *      https://www.w3.org/Submission/2017/SUBM-epub-packages-20170125/
 *      http://epubzone.org/news/epub-3-validation http://validator.idpf.org/
 *      http://imagedrive.github.io/spec/epub30-publications.xhtml
 *      https://github.com/futurepress/epub.js
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
	// gettext()
	+ '|application.locale.gettext'
	// for .to_file_name()
	// + '|application.net.'
	// for .gettext
	// + '|application.locale.'
	// for .storage.archive.archive_under()
	+ '|application.storage.archive.'
	//
	,

	// 設定不匯出的子函式。
	no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var
	// library_namespace.locale.gettext
	gettext = this.r('gettext'),
	/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
	NOT_FOUND = ''.indexOf('_');

	var mimetype_filename = 'mimetype',
	// http://www.idpf.org/epub/dir/
	// https://w3c.github.io/publ-epub-revision/epub32/spec/epub-ocf.html#sec-container-metainf
	// All OCF Abstract Containers must include a directory called META-INF
	// in their Root Directory.
	// e.g., META-INF/container.xml
	container_directory_name = 'META-INF', container_file_name = 'container.xml',
	// Dublin Core Metadata Element Set 前置碼, 前綴
	// http://dublincore.org/documents/dces/
	metadata_prefix = 'dc:',
	// key for additional information / configuration data
	KEY_DATA = 'item data',
	// 將 ebook 相關作業納入 {Promise}，可保證先添加完章節資料、下載完資源再 .pack()。
	KEY_working_queue = 'working queue',

	/** {String}path separator. e.g., '/', '\' */
	path_separator = library_namespace.env.path_separator;

	// -------------------------------------------------------------------------
	// setup 相關函式。

	function setup_container(base_directory) {
		// read container file: [[manifest file]] container.xml
		this.container = library_namespace
				.read_file((base_directory || this.path.root)
						+ container_directory_name + path_separator
						+ container_file_name);

		var rootfile_path = (this.root_directory_name
		//
		? this.root_directory_name + '/' : '') + this.package_document_name;
		// console.log(this.container.toString());
		if (this.container
				&& (this.container = JSON.from_XML(this.container.toString(), {
					preserve_spaces : false
				}))) {
			// console.log(this.container);
			// parse container
			var rootfile = this.container.container.rootfiles;
			if (Array.isArray(rootfile)) {
				library_namespace.error({
					// <rootfile>
					// gettext_config:{"id":"this-library-not-yet-support-multiple-rootfiles-(.opf)"}
					T : '本函式庫尚不支援多 rootfile (.opf)！'
				});
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

			if (false && rootfile['full-path'] !== rootfile_path) {
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
				// gettext_config:{"id":"invalid-id-prefix-$1"}
				throw new Error(gettext('Invalid id prefix: %1',
						options.id_prefix));
			}
		}

		if (!this.root_directory_name) {
			library_namespace.warn({
				// gettext_config:{"id":"if-the-e-book-chapter-directory-is-not-set-all-chapter-content-will-be-placed-directly-under-the-e-book-root-directory"}
				T : '未設定電子書章節目錄，將把所有章節內容直接放在電子書根目錄底下！'
			});
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
			if (_d) {
				this.directory[d] = encode_file_name.call(this, _d).replace(
						/[\\\/]*$/, path_separator);
			}
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
		this.downloading = Object.create(null);

		/**
		 * <code>
		this.metadata = {
			'dc:tagname' : [ {Object} ],
			meta : { [property] : [ {Object} ] },
			link : { href : {Object} }
		}
		</code>
		 * 
		 * @see set_meta_information()
		 */
		this.metadata = Object.create(null);

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

		this[KEY_working_queue] = Promise.resolve();
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
		library_namespace.write_file(this.path.root + mimetype_filename,
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

		library_namespace.debug({
			// gettext_config:{"id":"rebuild-index_of_id"}
			T : '重建 index_of_id……'
		}, 1, 'rebuild_index_of_id');
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

		// console.trace(JSON.stringify(raw_data));
		// console.trace(JSON.stringify(options));
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
					// ** 以下非必要，供如 calibre 使用。
					// http://www.idpf.org/epub/31/spec/epub-packages.html#attrdef-identifier-scheme
					// 'opf:scheme' : options.id_type
					}, {
						'dc:title' : options.title || ''
					}, {
						// TODO: calibre 不認得 "cmn-Hant-TW"
						'dc:language' : options.language || 'en'
					}, {
						// epub 發行時間/電子書生成日期 應用 dc:date。
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
					// ** 以下非必要，供如 calibre 使用。
					'xmlns:opf' : "http://www.idpf.org/2007/opf",
					'xmlns:dcterms' : "http://purl.org/dc/terms/",
					'xmlns:xsi' : "http://www.w3.org/2001/XMLSchema-instance",
					// ** 以下非必要，僅供 calibre 使用。
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
			if (library_namespace.gettext.load_domain) {
				library_namespace.debug('Load language ' + options.language);
				library_namespace.gettext.load_domain(options.language);
			}
			// 似乎不用加也沒問題。
			this.raw_data['xml:lang'] = options.language;
		}

		// console.log(JSON.stringify(raw_data));

		this.raw_data_ptr = Object.create(null);
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
				this.raw_data_ptr.spine_parent = node;
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
		index_of_id = Object.create(null);

		resources.forEach(function(resource, index) {
			if (typeof resource === 'string') {
				var matched = resource.match(/<\!--\s*({.+?})\s*-->/);
				if (matched
				//
				&& library_namespace.is_Object(resources[--index])) {
					try {
						// 以非正規方法存取資訊:封入注釋的詮釋資料。
						resources[index][KEY_DATA] = JSON.parse(matched[1]
						// @see write_chapters()
						// 在 HTML 注釋中不能包含 "--"。
						.replace(/(?:%2D){2,}/g, function($0) {
							return '-'.repeat($0.length / 3);
						}));
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
		this.chapter_index_of_id = Object.create(null);
		this.resource_index_of_id = Object.create(null);

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
				library_namespace.warn({
					// gettext_config:{"id":"<spine>-contains-a-duplicate-id-will-be-skipping-$1"}
					T : [ '<spine> 中包含了重複的 id，將跳過之：%1', chapter.idref ]
				});
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
				var element = Object.create(null);
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
					library_namespace.debug(
							{
								// gettext_config:{"id":"duplicate-element-$1"}
								T : [ 'Duplicate element: %1',
										JSON.stringify(element) ]
							}, 3);
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

		this.metadata = {
			'dc:tagname' : [ {Object} ],
			meta : { [property] : [ {Object} ] },
			link : { href : {Object} }
		}

		</code>
		 */
		if (required) {
			// 若已經有此key則沿用舊container直接設定。
			container = container[tag_name]
					|| (container[tag_name] = Object.create(null));
			if (value === undefined) {
				// get container object
				return container.map(function(element) {
					return element[tag_name] || element.content;
				});
			}
			// set object
			if (!value[required]) {
				// gettext_config:{"id":"invalid-metadata-value-$1"}
				throw new Error(gettext('Invalid metadata value: %1',
				//
				JSON.stringify(value)));
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
	// 編輯 chapter 相關函式。

	/**
	 * 必須先確認沒有衝突。
	 * 
	 * @inner
	 */
	function add_manifest_item(item, is_resource) {
		if (typeof is_resource === 'boolean' ? is_resource
				: detect_file_type(item.href) !== 'text') {
			// 檢測是否存在相同資源(.href)並做警告。
			if (item.id in this.resource_index_of_id) {
				var index = this.resource_index_of_id[item.id];
				library_namespace.error([ 'add_manifest_item: ', {
					// gettext_config:{"id":"resources-with-the-same-id-already-exist-so-the-resources-that-follow-will-deleted"}
					T : '已存在相同 id 之資源，後面的資源將直接消失！'
				} ]);
				console.error(this.resources[index]);
				console.error(item);
				// 留著 resource
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
				library_namespace.error([ 'add_manifest_item: ', {
					// gettext_config:{"id":"resources-with-the-same-chapter-already-exist-so-the-resources-that-follow-will-deleted"}
					T : '已存在相同 id 之章節，後面的章節將直接消失！'
				} ]);
				console.error(this.chapters[index]);
				console.error(item);
				// remove_chapter.call(this, index, true);
				this.chapters[index] = item;
			} else {
				this.chapter_index_of_id[item.id] = this.chapters.length;
				this.chapters.push(item);
			}
		}
	}

	/** const */
	var cover_image_properties = "cover-image";

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

		if (typeof item_data === 'string') {
			if (item_data.startsWith('//')) {
				item_data = 'https:' + item_data;
			}
			if (item_data.includes('://')) {
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
		}

		var item = normalize_item.call(this, item_data);
		// <item id="cover-image" href="cover.jpg" media-type="image/jpeg" />
		item.id = 'cover-image';
		item.properties = cover_image_properties;

		// TODO: <meta name="cover" content="cover-image" />
		return this.add(item, contents);
	}

	// Must call after `ebook.set()`.
	// @see function create_ebook() @
	// CeL.application.net.work_crawler.ebook
	function set_writing_mode(vertical_writing, RTL_writing) {
		if (vertical_writing || typeof vertical_writing === 'boolean') {
			var writing_mode = typeof vertical_writing === 'string' ? /^(?:lr|rl)$/
					.test(vertical_writing) ? 'vertical-' + vertical_writing
					: vertical_writing
					// e.g., vertical_writing === true
					: 'vertical-rl';

			if (RTL_writing === undefined) {
				RTL_writing = /rl$/.test(writing_mode);
			}

			if (!this.had_set_vertical_writing) {
				// library_namespace.log('set vertical_writing');
				// another method: <html dir="rtl">
				this.add({
					// title : 'mainstyle',
					file : 'main_style.css'
				}, 'html { '
				// https://en.wikipedia.org/wiki/Horizontal_and_vertical_writing_in_East_Asian_scripts
				// 東亞文字排列方向 垂直方向自右而左的書寫方式。即 top-bottom-right-left
				+ 'writing-mode:' + writing_mode + ';'
				// https://blog.tommyku.com/blog/how-to-make-epubs-with-vertical-layout/
				+ '-epub-writing-mode:' + writing_mode + ';'
				// for Kindle Readers (kindlegen)?
				+ '-webkit-writing-mode:' + writing_mode + '; }');

				// 只能設定一次。
				this.had_set_vertical_writing = true;
			}
		}

		// https://medium.com/parenting-tw/從零開始的電子書-epub-壹-72da1aca6571
		// 設置電子書的頁面方向
		if (typeof RTL_writing === 'boolean') {
			var spine_parent = this.raw_data_ptr.spine_parent;
			spine_parent['page-progression-direction'] = RTL_writing ? "rtl"
					: "ltr";
		}
	}

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
		if (typeof string !== 'string') {
			// gettext_config:{"id":"unable-to-encode-invalid-id-$1"}
			throw new Error(gettext('無法編碼無效的 id：%1', JSON.stringify(string)));
		}

		if (!string) {
			return '';
		}

		// 皆加上id_prefix，之後的便以接續字元看待，不必多作處理。
		var id = this.id_prefix + encodeURIComponent(string)
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

		if (id.length > this.MAX_ID_LENGTH) {
			var MAX_ID_LENGTH = this.MAX_ID_LENGTH;
			id = id.replace(/^([\s\S]+)(\.[^.]+)$/, function(all, name,
					extension) {
				if (extension.length < 10) {
					return name.slice(0, MAX_ID_LENGTH - extension.length)
							+ extension;
				}
				return all.slice(0, MAX_ID_LENGTH);
			});
			if (id.length > MAX_ID_LENGTH) {
				id = id.slice(0, this.MAX_ID_LENGTH);
			}
		}
		return id;
	}

	var PATTERN_NEED_ENCODE_ID = /^[^a-z]|[^a-z\d\-]/i, PATTERN_NEED_ENCODE_FILE_NAME = /[^a-z\d\-.]/i;
	// EpubCheck 不可使用/不接受中文日文檔名。
	function encode_file_name(file_name) {
		if (PATTERN_NEED_ENCODE_FILE_NAME.test(file_name)) {
			// need encode
			// TODO: limit length
			return encode_identifier.call(this, file_name);
		}
		return file_name;
	}

	function decode_identifier(identifier) {
		if (!identifier.startsWith(this.id_prefix)) {
			return identifier;
		}

		identifier = identifier.slice(this.id_prefix.length).replace(/_/g, '%');
		try {
			return decodeURIComponent(identifier);
		} catch (e) {
			library_namespace.error([ 'decode_identifier: ', {
				// gettext_config:{"id":"unable-to-decode-$1"}
				T : [ '無法解碼：[%1]', identifier ]
			} ]);
			throw e;
		}
	}

	// assert: "_!~*'()" ===
	// decode_identifier.call(this, encode_identifier.call(this, "_!~*'()"))

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

		// 可能僅是在測試是否可以偵測得出 type。
		library_namespace.debug({
			// gettext_config:{"id":"unable-to-determine-the-type-of-file-for-$1"}
			T : [ '無法判別檔案 [%1] 的類型。', file_name ]
		});
	}

	function normalize_item(item_data, strict) {
		if (is_manifest_item(item_data)) {
			if (strict && (KEY_DATA in item_data)) {
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
				// 自行決定合適的 path+檔名。 e.g., "media/1.png"
				href = this.directory[detect_file_type(href)] + href;
			}
		}

		if (!id) {
			if (!href) {
				library_namespace.error({
					// gettext_config:{"id":"invalid-item-data-$1"}
					T : [ '項目資訊無效：%1', JSON.stringify(item_data) ]
				});
				console.error(item_data);
				return;
			}

			// 對檔案，以href(path+檔名)作為id。
			// 去掉 file name extension 當作id。
			id = href.replace(/\.[a-z\d\-]+$/i, '').replace(
					this.directory[detect_file_type(href)], '');

		} else if (!href) {
			// default: xhtml file
			href = this.directory.text + id + '.xhtml';
		}

		var _this = this;
		href = href.replace(/[^\\\/]+$/, function(file_name) {
			file_name = encode_file_name.call(_this, file_name);

			// 截斷 trim 主檔名，限制在 _this.MAX_ID_LENGTH 字元。
			// WARNING: assert: 截斷後的主檔名不會重複，否則會被覆蓋!
			return file_name.replace(/^(.*)(\.[^.]+)$/, function(all, main,
					extension) {
				return main.slice(0, _this.MAX_ID_LENGTH - extension.length)
						+ extension;
			})
		});

		// escape: 不可使用中文日文名稱。
		// 採用能從 id 復原成 title 之演算法。
		// 未失真的 title = decode_identifier.call(this, item.id)
		if (PATTERN_NEED_ENCODE_ID.test(id)) {
			id = encode_identifier.call(this, id);
		}
		while (id in this.chapter_index_of_id) {
			var index = this.chapter_index_of_id[id], previous_data = this.chapters[index][KEY_DATA];
			if (item_data.title && item_data.title === previous_data.title
			// 測試新舊章節兩者是否實質相同。若是相同的話就直接覆蓋。
			&& (!item_data.url || item_data.url === previous_data.url)) {
				break;
			}

			// 若 id / href 已存在，可能是因為有重複的標題，這時應發出警告。
			library_namespace.info([ 'normalize_item: ', {
				// gettext_config:{"id":"this-id-already-exists-will-change-the-id-of-former-chapter"}
				T : '先前已經存在相同 id 之章節，將更改後者之 id。'
			}, '\n	',
			//
			previous_data.title + '	' + (previous_data.url || '') + '\n',
			//
			'	' + item_data.title + '	' + (item_data.url || '') ]);
			// console.error(index+'/'+this.chapters.length);
			// console.error(this.chapters[index]);
			// console.error(item_data);
			var NO;
			// assert: 這兩者都必須被執行
			id = id.replace(/(?:\-([1-9]\d{0,4}))?$/, function(all, _NO) {
				NO = (_NO | 0) + 1;
				return '-' + NO;
			});
			href = href.replace(/(?:\-([1-9]\d{0,4}))?(\.[^.]+)?$/, function(
					all, _NO, extension) {
				return (NO === (_NO | 0) + 1 ? '' : all) + '-' + NO
				//
				+ extension;
			});
		}

		var item = {
			item : null,
			id : id,
			// e.g., "media/1.png"
			href : href,
			'media-type' : item_data['media-type'] || item_data.type
					|| library_namespace.MIME_of(href)
		};

		if (library_namespace.is_debug()
		// ↑ 可能是placeholder，因此僅作debug。
		&& !/^[a-z]+\/[a-z\d+]+$/.test(item['media-type'])) {
			library_namespace.warn({
				// gettext_config:{"id":"media-type-is-not-set-or-media-type-is-invalid-$1"}
				T : [ '未設定 media-type，或 media-type 無效：%1',
				//
				JSON.stringify(item) ]
			});
		}

		if (!strict) {
			if (!item_data.url && href.includes('://')) {
				item_data.url = href;
			}
			item[KEY_DATA] = item_data;
		}

		return item;
	}

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

		var encoded = encode_identifier.call(this, title);

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
			// title === item.id ||
			// title === decode_identifier.call(this, item.id) ||
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

	function escape_ampersand(text) {
		// https://stackoverflow.com/questions/12566098/what-are-the-longest-and-shortest-html-character-entity-names
		return text.replace(/&([^&;]{0,50})([^&]?)/g, function(entity, postfix,
				semicolon) {
			if (semicolon === ';' && (/^#\d{1,10}$/.test(postfix)
			// "&CounterClockwiseContourIntegral;"
			|| /^[a-z]\w{0,49}$/i.test(postfix))) {
				return entity;
			}
			// TODO: &copy, &shy
			return '&amp;' + postfix + semicolon;
		});
	}

	function to_XHTML_URL(url) {
		return escape_ampersand(encodeURI(url));
	}

	// 正規化 XHTML 書籍章節內容。
	// assert: normailize_contents(contents) ===
	// normailize_contents(normailize_contents(contents))
	function normailize_contents(contents) {
		library_namespace.debug({
			// gettext_config:{"id":"formalizating-xhtml-chapter-content-$1"}
			T : [ '正規化 XHTML 書籍章節內容：%1', contents ]
		}, 6);
		contents = contents
		// 去掉 "\r"，全部轉為 "\n"。
		.replace(/\r\n?/g, '\n')
		// 去除 '\b', '\f' 之類無效的 XML字元 https://www.w3.org/TR/REC-xml/#NT-Char
		// e.g., http://www.alphapolis.co.jp/content/sentence/213451/
		// e.g., "，干笑一声" @ https://www.ptwxz.com/html/9/9503/7886636.html
		// ""==="\b"
		// .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '')
		// 已去掉 "\r"，全部轉為 "\n"。
		.replace(/[\x00-\x08\x0b-\x1f]/g, '')
		// 最多允許兩個 "\n" 以為分段。
		.replace(/\n{3,}/g, '\n\n')
		// .replace(/<br \/>\n/g, '\n')
		// .replace(/\n/g, '\r\n')

		//
		.replace(/<hr(?:[\s\/][^<>]*)?>/ig, '<hr />')
		// <BR> → <br />
		// <br[^<>]*>
		.replace(/<br(?:[\s\/][^<>]*)?>/ig, '<br />')

		// .replace(/(?:<br \/>)+<\/p>/ig, '</p>')

		// .trim(), remove head/tail <BR>
		.replace(/^(?:<br \/>|[\s\n]|&nbsp;|&#160;)+/ig, '')
		// 這會卡住:
		// .replace(/(?:<br *\/>|[\s\n]+)+$/ig, '')
		.replace(/(?:<br \/>|[\s\n]|&nbsp;|&#160;)+$/ig, '')

		// 改正 <img> 錯誤: <img></img> → <img />
		.replace(/(<img\s([^<>]+)>)(\s*<\/img>)?/ig,
		//
		function(all, opening_tag, opening_inner) {
			opening_inner = opening_inner.trim();
			if (opening_inner.endsWith('\/')) {
				return opening_tag;
			}
			return '<img ' + opening_inner.replace(/[\s\/]+$/g, '') + ' \/>';
		})

		// 去掉單純的空連結 <a ...></a>。
		.replace(/<a(?:\s[^<>]*)*><\/a(?:\s[^<>]*)?>/ig, '')

		// 2017/2/2 15:1:26
		// 標準可以沒 <rb>。若有<rb>，反而無法通過 EpubCheck 檢測。
		// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ruby
		.replace(/<\/?rb\s*>/ig, '')

		// e.g., id="text" → id="text"
		// .replace(/ ([a-z]+)=([a-z]+)/g, ' $1="$2"')

		// [[non-breaking space]]
		// EpubCheck 不認識 HTML character entity，
		// 但卻又不允許 <!DOCTYPE html> 加入其他宣告。
		.replace(/&nbsp;/g, '&#160;');

		contents = escape_ampersand(contents);

		// contents = contents.replace(/<script[^<>]*>[\s\S]*?<\/script>/g, '');

		library_namespace.debug({
			// gettext_config:{"id":"the-content-of-the-chapter-after-formalization-$1"}
			T : [ '正規化後之章節內容：%1', contents ]
		}, 6);
		return contents;
	}

	Ebook.normailize_contents = normailize_contents;

	// 註冊 callback
	function add_listener(event, listener) {
		event = 'on_' + event;
		if (listener) {
			if (this[event]) {
				this[event].push(listener);
			} else {
				this[event] = [ listener ];
			}
		}
		return this[event];
	}

	// item data / config
	function add_chapter(item_data, contents) {
		if (!item_data) {
			return;
		}

		if (Array.isArray(item_data)) {
			if (contents) {
				// gettext_config:{"id":"set-multiple-files-to-the-same-content-$1"}
				throw new Error(gettext('設定多個檔案為相同的內容：%1', item_data));
			}
			return item_data.map(function(_item_data) {
				return add_chapter.call(this, _item_data);
			}, this);
		}

		var _this = this, item = normalize_item.call(this, item_data);
		item_data = item[KEY_DATA] || Object.create(null);
		// assert: library_namespace.is_Object(item_data)
		// console.log(item_data);
		// console.log(item);
		// console.trace(item);

		rebuild_index_of_id.call(this);
		rebuild_index_of_id.call(this, true);

		// 有contents的話，採用contents做為內容。並從item.href擷取出檔名。
		if (!contents && item_data.url) {
			// 沒contents的一律當作resource。
			var resource_href_hash = Object.create(null),
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
					// gettext_config:{"id":"already-have-the-same-resource-file-$1-$2"}
					var message = gettext('已經有相同的資源檔 [%1] %2。',
					//
					item['media-type'], resource[KEY_DATA].url);
					if (item_data.href
					// 有手動設定.href
					&& item_data.href !== resource.href) {
						library_namespace.error([ message + '\n', {
							// gettext_config:{"id":"but-.href-is-different-please-manually-fix-it-$1"}
							T : [ '但 .href 不同，您必須手動修正：%1',
							//
							resource.href + '→' + item_data.href ]
						} ]);
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

			// 避免衝突，檢測是不是有不同 URL，相同檔名存在。
			while (file_path in this.downloading) {
				if (this.downloading[file_path].url === item_data.url) {
					library_namespace.log([ 'add_chapter: ', {
						// gettext_config:{"id":"the-file-is-already-in-the-download-queue-skipping-the-repeated-download-request-$1"}
						T : [ '檔案已在下載隊列中，跳過重複下載動作：%1', file_path ]
					} ]);
					// console.log(this.downloading[file_path]);
					return item;
				}

				library_namespace.debug([ 'add_chapter: ', {
					T : [
					// gettext_config:{"id":"there-are-resources-in-the-download-queue-that-have-the-same-file-name-but-different-urls-url-$1-in-the-download-queue-≠-url-$2-to-be-downloaded-try-to-change-to-another-file-name"}
					'下載隊列中存在相同檔名，卻有著不同網址的資源：下載隊列中 URL [%1] ≠ 準備下載之 URL [%2]，嘗試改成另一個檔案名稱。'
					//
					, this.downloading[file_path].url, item_data.url ]
				} ]);

				file_path = file_path.replace(
				// 必須是encode_identifier()之後不會變化的檔名。
				/(?:-(\d+))?(\.[a-z\d\-]+)?$/, function(all, NO, ext_part) {
					return '-' + ((NO | 0) + 1) + (ext_part || '');
				});
			}

			// 避免衝突，檢測是不是有不同 URL，相同檔名存在。
			while (item.href in resource_href_hash) {
				item.href = item.href.replace(
				// 必須是encode_identifier()之後不會變化的檔名。
				/(?:-(\d+))?(\.[a-z\d\-]+)?$/, function(all, NO, ext_part) {
					return '-' + ((NO | 0) + 1) + (ext_part || '');
				});
			}

			if (item_data.href && item_data.href !== item.href) {
				// 有手動設定.href。
				library_namespace.error([ 'add_chapter: ', {
					// gettext_config:{"id":"to-update-changed-file-name-you-need-to-manually-change-the-original-file-name-from-the-original-folder"}
					T : '儲存檔名改變，您需要自行修正原參照檔案中之檔名：'
				}, '\n', item_data.href + ' →\n' + item.href ]);
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
				library_namespace.error([ 'add_chapter: ', {
					// gettext_config:{"id":"the-id-changes-you-need-to-correct-the-file-name-in-the-original-folder"}
					T : 'id 改變，您需要自行修正原參照檔案中之檔名：'
				}, '\n', item_data.id + ' →\n' + item.id ]);
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

			library_namespace.log([ 'add_chapter: ', {
				// gettext_config:{"id":"fetching-url-$1"}
				T : [ '自網路取得 URL：%1', item_data.url ]
			} ]);

			// assert: CeL.application.net.Ajax included
			library_namespace.get_URL_cache(item_data.url, function(contents,
					error, XMLHttp) {
				// save MIME type
				if (XMLHttp && XMLHttp.type) {
					if (item['media-type']
					// 需要連接網站的重要原因之一是為了取得 media-type。
					&& item['media-type'] !== XMLHttp.type) {
						library_namespace.error([ 'add_chapter: ', {
							T : [
							// gettext_config:{"id":"the-resource-that-has-been-obtained-has-a-media-type-of-$1-which-is-different-from-the-media-type-$2-obtained-from-the-extension-file"}
							'已取得之資源，其內容之媒體類型為 [%1]，與從副檔名所得到的媒體類型 [%2] 不同！',
							//
							XMLHttp.type, item['media-type'] ]
						} ]);
					}
					// 這邊已經不能用 item_data.type。
					item['media-type'] = XMLHttp.type;

				} else if (!item['media-type']) {
					library_namespace.error({
						// gettext_config:{"id":"unable-to-identify-the-media-type-of-the-acquired-resource-$1"}
						T : [ '無法判別已取得資源之媒體類型：%1', item_data.url ]
					});
				}

				// 基本檢測。
				if (/text/i.test(item_data.type)) {
					library_namespace.error({
						// gettext_config:{"id":"the-resource-obtained-type-$1-is-not-a-image-file-$2"}
						T : [ '所取得之資源，類型為[%1]，並非圖像檔：%2', item_data.type,
								item_data.url ]
					});
				}

				// 已經取得資源：
				library_namespace.log([ 'add_chapter: ', {
					// gettext_config:{"id":"resource-acquired-$1-$2"}
					T : [ '已取得資源：[%1] %2', item['media-type'],
					//
					item_data.url + '\n→ ' + item.href ]
				} ]);

				// item_data.write_file = false;

				// 註銷 .downloading 登記。
				if (item_data.file_path in _this.downloading) {
					delete _this.downloading[item_data.file_path];
				} else {
					library_namespace.error({
						// gettext_config:{"id":"the-file-is-not-in-the-download-queue-$1"}
						T : [ '檔案並未在下載隊列中：%1', item_data.file_path ]
					});
				}
				if (false) {
					library_namespace.log([ 'add_chapter: ', {
						// gettext_config:{"id":"still-downloading"}
						T : '資源仍在下載中：'
					} ]);
					console.log(_this.downloading);
					console.log(_this.add_listener('all_downloaded'));
				}
				if (_this.add_listener('all_downloaded')
				// 在事後檢查.on_all_downloaded，看是不是有callback。
				&& library_namespace.is_empty_object(_this.downloading)) {
					library_namespace.debug({
						// gettext_config:{"id":"all-resources-have-been-downloaded.-start-performing-subsequent-$1-register-jobs"}
						T : [ '所有資源下載完畢。開始執行後續 %1 個已登記之{{PLURAL:%1|作業}}。',
						//
						_this.add_listener('all_downloaded').length ]
					}, 2, 'add_chapter');
					_this.add_listener('all_downloaded').forEach(
					//
					function(listener) {
						listener.call(_this);
					});
					// 註銷登記。
					delete _this['on_all_downloaded'];
				}
			}, {
				file_name : item_data.file_path,
				// rebuild時不會讀取content.opf，因此若無法判別media-type時則需要reget。
				// 須注意有沒有同名但不同內容之檔案。
				reget : this.rebuild && !item['media-type'],
				encoding : undefined,
				charset : file_type === 'text' && item_data.charset
				//
				|| 'buffer',
				get_URL_options : Object.assign({
					/**
					 * 每個頁面最多應該不到50張圖片或者其他媒體。
					 * 
					 * 最多平行取得檔案的數量。 <code>
					incase "MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 connect listeners added. Use emitter.setMaxListeners() to increase limit"
					</code>
					 */
					max_listeners : 50,
					error_retry : 4
				}, item_data.get_URL_options)
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
			library_namespace.debug({
				// gettext_config:{"id":"already-have-the-same-chapter-or-resource-file-it-will-not-be-overwritten-$1"}
				T : [ '已經有相同的篇章或資源檔，將不覆寫：%1',
				//
				item_data.file || decode_identifier.call(this, item.id) ]
			}, 2);
			return;
		}

		// modify from CeL.application.net.work_crawler
		function full_URL_of_path(url, base_URL) {
			if (!url.includes('://')) {
				if (url.startsWith('/')) {
					if (url.startsWith('//')) {
						// 借用 base_URL 之 protocol。
						return base_URL.match(/^(https?:)\/\//)[1] + url;
					}
					// url = url.replace(/^[\\\/]+/g, '');
					// 只留存 base_URL 之網域名稱。
					return base_URL.match(/^https?:\/\/[^\/]+/)[0] + url;
				} else {
					// 去掉開頭的 "./"
					url = url.replace(/^\.\//, '');
				}
				if (url.startsWith('.')) {
					library_namespace.warn([ 'full_URL_of_path: ', {
						// gettext_config:{"id":"invalid-url-$1"}
						T : [ '網址無效：%1', url ]
					} ]);
				}
				url = base_URL + url;
			}
			return url;
		}

		function check_text(contents) {
			contents = normailize_contents(contents);

			if (item_data.internalize_media) {
				// include images / 自動載入內含資源, 將外部media內部化
				var links = [];
				// TODO: <object data=""></object>
				contents = contents.replace(/ (src|href)="([^"]+)"/ig,
				//
				function(all, attribute_name, url) {
					if (/^\s*(data|mailto):/.test(url)) {
						// https://en.wikipedia.org/wiki/Data_URI_scheme
						library_namespace.log([ 'check_text: ', {
							// gettext_config:{"id":"skip-data-uri-scheme-$1"}
							T : [ '跳過資料 URI scheme：%1', url ]
						}, '\n', {
							// gettext_config:{"id":"of-file-$1"}
							T : [ '檔案路徑：%1', item_data.file ]
						} ]);
						return all;
					}

					try {
						url = decodeURI(url);
					} catch (e) {
						library_namespace.warn([ 'check_text: ', {
							// gettext_config:{"id":"invalid-url-$1"}
							T : [ '網址無效：%1', url ]
						} ]);
						return all;
					}
					// url = library_namespace.HTML_to_Unicode(url);
					// e.g.,
					// https://ck101.com/forum.php?mod=viewthread&tid=4016100
					url = url.replace(/&amp;/g, '&');

					// [ url, path, file_name, is_directory ]
					var matched = url.match(/^([\s\S]*\/)([^\/]+)(\/)?$/);
					if (!matched || attribute_name.toLowerCase() !== 'src'
					// skip web page, do not modify the link of web pages
					&& (matched[3] || /\.html?$/i.test(matched[2]))) {
						library_namespace.log([ 'check_text: ', {
							// gettext_config:{"id":"skip-web-page-resource-$1"}
							T : [ '跳過網頁資源：%1', url ]
						}, '\n', {
							// gettext_config:{"id":"of-file-$1"}
							T : [ '檔案路徑：%1', item_data.file ]
						} ]);
						return all;
					}

					var file_name = matched[2],
					// links.push的href檔名在之後add_chapter()時可能會被改變。因此在xhtml文件中必須要先編碼一次。
					href = _this.directory.media
							+ encode_file_name.call(_this, file_name);
					url = full_URL_of_path(url, item_data.base_URL
							|| item_data.url);
					links.push({
						url : url,
						href : _this.directory.media + file_name,
						get_URL_options : Object.assign({
							error_retry : 4
						}, item_data.get_URL_options)
					});
					return matched ? ' title="'
					// recover url
					+ to_XHTML_URL(url) + '" ' + attribute_name + '="' + href
							+ '"' : all;
				});

				contents = contents.replace(/<a ([^<>]+)>([^<>]+)<\/a>/ig,
				// <a href="*.png">挿絵</a> → <img alt="挿絵" src="*.png" />
				function(all, attributes, innerText) {
					var href = attributes
							.match(/(?:^|\s)href=(["'])([^"'])\1/i)
							|| attributes.match(/(?:^|\s)href=()([^"'\s])/i);
					if (!href || /\.html?$/i.test(href[2])) {
						return all;
					}
					return '<img '
							+ (attributes.includes('alt="') ? '' : 'alt="'
									+ innerText + '" ')
							+ attributes.replace(/(?:^|\s)href=(["'])/ig,
									' src=$1').trim() + ' />';
				});

				contents = contents.replace(/<img ([^<>]+)>/ig, function(tag,
						attributes) {
					return '<img ' + attributes.replace(
					// <img> 中不能使用 name="" 之類
					/(?:^|\s)(?:name|border|onmouse[a-z]+|onload)\s*=\s*\S+/ig,
					//
					'').trim() + '>';
				});

				if (links.length > 0) {
					links = links.unique();
					// console.log(links);
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
				var // gettext = setup_gettext.call(this),
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

				this.resources.forEach(function(resource) {
					if (resource['media-type'] === 'text/css') {
						html.push(
						// add all styles
						'<link rel="stylesheet" type="text/css" href="'
								+ resource.href + '" />');
					}
				});

				// console.log([ contents.title, contents.sub_title ]);
				html.push('<title>', [ contents.title, contents.sub_title ]
				//
				.filter(function(title) {
					return !!title;
				}).join(this.title_separator), '</title>', '</head><body>');

				// ------------------------------

				// 設定item_data.url可以在閱讀電子書時，直接點選標題就跳到網路上的來源。
				var url_header = item_data.url
						&& ('<a href="' + to_XHTML_URL(item_data.url) + '">'), title_layer = [];
				// 卷標題 part/episode > chapter > section
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
					library_namespace.warn([ 'add_chapter: ', {
						// gettext_config:{"id":"title-not-set-$1"}
						T : [ '未設定標題：%1……',
						//
						String(contents.text).slice(0, 200) || '(無內容)' ]
					} ]);
				}
				// console.log(title_layer);

				// ------------------------------

				html.push(
				// 將作品資訊欄位置右。
				'<div id="chapter_information" style="float:right;'
				// 隱藏電子書的章節資訊欄位。
				+ (item_data.hide_chapter_information ? 'display:none;' : '')
						+ '">');

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
					library_namespace.debug({
						T : [
						// gettext_config:{"id":"content-length-$1-characters"}
						'Content Length: %1 {{PLURAL:%1|character|characters}}'
						//
						, contents.length ]
					});
				}
				if (!(item_data.word_count > 0)) {
					item_data.word_count = library_namespace.count_word(
							contents, 1 + 2);
					if (!(item_data.word_count > 0)) {
						library_namespace.debug({
							// gettext_config:{"id":"no-content-received-$1"}
							T : [ 'No content received: %1',
							//
							item_data.title || item_data.id || item_data.url ]
						});
					}
				}

				var messages = new gettext.Sentence_combination(
				// gettext_config:{"id":"$1-word(s)-in-this-chapter"}
				[ '本章共 %1 {{PLURAL:1|個字}}', item_data.word_count ]);
				// item_data.words_so_far: 本作品到前一個章節總計的字數。
				// @see function count_words_so_far(item) @
				// CeL.application.net.work_crawler.ebook
				if (item_data.words_so_far > 0) {
					messages.push(',',
					// gettext_config:{"id":"$1-word(s)-accumulated"}
					[ '累計 %1 {{PLURAL:1|個字}}',
							item_data.words_so_far + item_data.word_count ]);
				}

				// 加入本章節之字數統計標示。
				html.push('<p class="word_count">', messages, '</p>');
				// console.trace(html.join(this.to_XML_options.separator));

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

		var text = undefined;
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
				library_namespace.warn([ 'add_chapter: ', {
					T : [
					// gettext_config:{"id":"because-the-content-you-want-to-set-is-too-short-or-has-no-content-the-old-content-($1-characters)-will-be-used-from-the-cache-file"}
					'因為欲設定的內容長度過短或者無內容，將從快取檔案中取得舊的內容（%1 個{{PLURAL:%1|字元}}）：',
					//
					contents.length ]
				}, ' \n',
				//
				(item_data.file || decode_identifier.call(this, item.id))
				//
				+ (item_data.url ? ' (' + item_data.url + ')' : '') ]);
			} else if (item_data.write_file !== false) {
				library_namespace.debug({
					T : [
					// gettext_config:{"id":"writing-$1-chars-to-$2"}
					'Writing %1 {{PLURAL:%1|character|characters}} to [%2]...',
							contents.length, this.path.text + item.href ]
				});
				// 需要先準備好目錄結構。
				this.initialize();
				// 將內容文字寫入檔案。
				library_namespace.write_file(this.path.text + item.href,
						contents);
			} else {
				library_namespace.debug({
					// gettext_config:{"id":"only-the-project-data-index-is-set-and-the-file-$1-is-not-automatically-written.-you-need-to-do-this-yourself"}
					T : [ '僅設定項目資料索引，未自動寫入檔案 [%1]，您需要自己完成這動作。',
							this.path.text + item.href ]
				});
			}

		} else if (!item_data.force) {
			library_namespace.info([ 'add_chapter: ', {
				// gettext_config:{"id":"skip-content-that-is-too-short-($1-characters)"}
				T : [ contents ? '跳過長度過短的內容（%1 個{{PLURAL:%1|字元}}）：'
				//
				// gettext_config:{"id":"skip-the-no-content-empty-chapter"}
				: '跳過無內容/空章節：', contents && contents.length ]
			},
			//
			(item_data.file || decode_identifier.call(this, item.id))
			//
			+ (item_data.url ? ' (' + item_data.url + ')' : '') ]);
			// gettext_config:{"id":"too-short"}
			item.error = gettext('too short');
			return item;
		}

		if (item_data.TOC) {
			library_namespace.debug({
				// gettext_config:{"id":"if-this-chapter-already-exists-remove-it-first-$1"}
				T : [ '若是已存在此章節則先移除：%1', item.id ]
			}, 3);
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

			// console.log(item);
			// chapter or resource
			add_manifest_item.call(this, item,
					item['media-type'] === 'text/css');
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
			library_namespace.debug({
				// gettext_config:{"id":"using-language-$1"}
				T : [ 'Using language: %1', language ]
			});
		}

		var gettext = library_namespace.gettext.in_domain
		// @see application/locale/resources/locale.csv
		? library_namespace.gettext.in_domain.bind(null, language)
				: library_namespace.gettext;

		return gettext;
	}

	// 自動生成目錄。
	function generate_TOC() {
		var original_domain = library_namespace.gettext.get_domain_name
				&& library_namespace.gettext.get_domain_name();
		if (original_domain) {
			var use_domain = original_domain && this.metadata['dc:language'];
			use_domain = use_domain && use_domain[0]['dc:language'];
			if (use_domain && original_domain !== use_domain) {
				// 確保目錄使用的語言與書籍相同。
				library_namespace.gettext.use_domain(use_domain);
			} else {
				original_domain = null;
			}
		}

		var // gettext = setup_gettext.call(this),
		// 一般說來，title 應該只有一個。
		book_title = set_meta_information.call(this, 'title').join(', '),
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
		// The 'head' element should have a 'title' child element.
		'<head>', '<meta charset="UTF-8" />' ];

		this.resources.forEach(function(resource) {
			if (resource['media-type'] === 'text/css') {
				// add all styles
				TOC_html.push('<link rel="stylesheet" type="text/css" href="'
						+ resource.href + '" />');
			}
		});

		TOC_html.push('<title>', book_title, '</title>', '</head>',
		//
		'<body>', '<h1>', book_title, '</h1>');

		this.resources.some(function(resource) {
			// only allow 1 cover-image
			if (resource.properties === cover_image_properties) {
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

		TOC_html.push('<h2>',
		// 作品資訊, 小説情報, 電子書籍紹介, 作品情報, book information
		// gettext_config:{"id":"work-information"}
		gettext('Work information'), '</h2>', '<div id="work_data">', '<dl>');

		/**
		 * <code>
		this.metadata = {
			'dc:tagname' : [ {Object} ],
			meta : { [property] : [ {Object} ] },
			link : { href : {Object} }
		}
		</code>
		 */
		function add_information(data) {
			var key = data[0].replace(metadata_prefix, ''),
			// data = [ tag_name or property, element list ]
			values = data[1].map(function(element) {
				var value = data[0] in element ? element[data[0]]
				// for <meta>, data[0] is property
				: element.meta || element.content || '';
				if (library_namespace.is_Date(value)) {
					// e.g., dcterms:modified, <dc:date>
					// value = date_to_String(value);
					value = value.toLocaleTimeString();
				}
				return value;
			});

			if (key === 'language') {
				if (library_namespace.gettext.get_alias) {
					values = values.map(function(value) {
						return library_namespace.gettext.get_alias(value);
					});
				}
			} else if (key === 'source') {
				// if (library_namespace.locale.gettext)
				if (library_namespace.locale) {
					values = values.map(function(value) {
						if (/^https?:\/\/\S+$/.test(value)) {
							value = '<a href="' + value + '">'
							//
							+ value + '</a>';
						}
						return value;
					});
				}
			} else if (key === 'description') {
				// console.log(values);
				values = values.map(function(value) {
					// 作品介紹可以換行。
					return value.replace(/\n/g, '<br />');
				});
			}

			TOC_html.push('<dt>',
			// gettext_config:{"id":"toc.identifier","mark_type":"combination_message_id"}
			// gettext_config:{"id":"toc.title","mark_type":"combination_message_id"}
			// gettext_config:{"id":"toc.language","mark_type":"combination_message_id"}
			// gettext_config:{"id":"toc.date","mark_type":"combination_message_id"}
			// gettext_config:{"id":"toc.creator","mark_type":"combination_message_id"}
			// gettext_config:{"id":"toc.subject","mark_type":"combination_message_id"}
			// gettext_config:{"id":"toc.description","mark_type":"combination_message_id"}
			// gettext_config:{"id":"toc.publisher","mark_type":"combination_message_id"}
			// gettext_config:{"id":"toc.source","mark_type":"combination_message_id"}
			// gettext_config:{"id":"toc.dcterms-modified","mark_type":"combination_message_id"}
			// gettext_config:{"id":"toc.calibre-series","mark_type":"combination_message_id"}
			gettext('TOC.' + key), '</dt>',
			//
			'<dd>', values.join(', '), '</dd>');
		}

		// console.log(this.metadata);
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

		var // gettext = setup_gettext.call(this),
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
			// TODO: 總共幾個字，平均每章節幾個字
			TOC_html.push('<dt>',
			// gettext_config:{"id":"word-count"}
			gettext('word count'), '</dt>', '<dd>',
			// gettext_config:{"id":"$1-words"}
			gettext('%1 {{PLURAL:%1|word|words}}', total_word_count) + ' / '
			// gettext_config:{"id":"$1-chapters"}
			+ gettext('%1 {{PLURAL:%1|chapter|chapters}}',
			//
			this.chapters.length) + ' ≈ '
			// 平均文字数
			+ Math.round(total_word_count / this.chapters.length), '</dd>');
		}
		TOC_html.push('</dl>', '</div>');

		// The toc nav element must occur exactly once in an EPUB
		// Navigation Document.
		TOC_html.push('<nav epub:type="toc" id="toc">', '<h2>',
		// 作品目錄 目次 Table of contents
		// gettext_config:{"id":"contents"}
		gettext('Contents'), '</h2>', '<ol>');

		// recovery
		if (original_domain)
			library_namespace.gettext.use_domain(original_domain);

		// --------------------------------------

		var chapter_list = [];

		this.chapters.map(function(chapter) {
			var data = chapter[KEY_DATA] || Object.create(null);
			// console.log(data);
			var date = Array.isArray(data.date) ? data.date[0] : data.date;
			// console.log(date);
			var chapter_item;
			if (date) {
				if (library_namespace.is_Date(date)) {
					date = date.format('%Y-%2m-%2d');
				}
				// 首发时间
				chapter_item = [ ' ', {
					small : '(' + date + ')'
				} ];
			} else {
				chapter_item = [];
			}

			var title = data.title
			// 未失真的 title = decode_identifier.call(this, item.id)
			|| decode_identifier.call(this, chapter.id);

			var url = chapter.href;
			var parent_list = chapter_list;

			if (this.add_TOC_hierarchy) {
				var NO = title.match(/^(\d{1,4}\s)(.+)$/);
				if (NO) {
					title = NO[2];
					NO = NO[1];
				}
				var title_hierarchy = title.split(this.title_separator);
				/**
				 * 階層顯示目錄。 <code>

				chapter_list = [
					// chapter without part:
					{li:
						{a:['title',' ',{small:'date'}],href:'url'}
					},
					// chapter with part:
					{li: [
						{a:['title']},
						{ol:[{li:'chapters'}]}
					] }
				]

				</code>
				 */
				while (parent_list.length > 0) {
					// get the last <li>
					var anchor = parent_list.at(-1);
					var part_title = (Array.isArray(anchor.li) ? anchor.li[0]
							: anchor.li).a[0];
					// @see chapter with part
					if (part_title !== title_hierarchy[0].trim()) {
						break;
					}
					title_hierarchy.shift();
					if (!Array.isArray(anchor.li)) {
						// assert: anchor.li =
						// {a:['title',' ',{small:'date'}],href:'url'}
						anchor.li = [ anchor.li, {
							ol : /* next parent_list */[]
						} ];
					}
					parent_list = anchor.li[1].ol;
				}

				while (title_hierarchy.length > 1) {
					// assert: {String}title_hierarchy[0] ===
					// title_hierarchy[0].trim() !== ''
					var anchor = {
						li : [ {
							a : [ title_hierarchy.shift().trim() ],
							href : url
						}, {
							ol : /* next parent_list */[]
						} ]
					};
					parent_list.push(anchor);
					parent_list = anchor.li[1].ol;
				}
				// assert: title_hierarchy.length === 1
				title = (NO || '') + title_hierarchy.shift().trim();
				// assert: {String}title === title.trim() !== ''
			}

			// calibre 的目錄只取 <a> 的內容。
			if (true) {
				// 以這方法，目錄中會出現日期。
				chapter_item.unshift(title);
				chapter_item = {
					a : chapter_item,
					href : url
				};
			} else {
				// 以這方法，目錄中不會出現日期。
				chapter_item.unshift({
					a : title,
					href : url
				});
			}
			parent_list.push({
				li : chapter_item
			});
		}, this);

		if (chapter_list.length === 1) {
			var anchor_li = chapter_list[0].li;
			// anchor_li: [ {a:['title']}, {ol:[{li:'chapters'}]} ]
			var part_title = Array.isArray(anchor_li) && anchor_li[0].a;
			if (Array.isArray(part_title)) {
				part_title = part_title[0];
			}
			if (part_title && part_title.includes('正文')) {
				// 只有一卷，叫作"正文卷"。
				chapter_list = anchor_li[1].ol;
			}
		}

		// console.log(chapter_list);
		// console.log(JSON.stringify(chapter_list));

		var to_XML_options = Object.clone(this.to_XML_options);
		// No declaration needed.
		delete to_XML_options.declaration;
		TOC_html.push(JSON.to_XML(chapter_list, to_XML_options), '</ol>',
				'</nav>', '</body>', '</html>');

		return TOC_html.join(this.to_XML_options.separator);
	}

	function write_chapters(callback) {
		// 對 media 過多者，可能到此尚未下載完。
		// add_chapter() 的過程可能資源檔還沒下載完，整本書的章節就已經下載完了。
		// 應該多加上對資源檔是否已完全下載完畢的檢查。
		if (!library_namespace.is_empty_object(this.downloading)) {
			// 註冊 callback，等所有媒體檔案下載完再收尾。
			this.add_listener('all_downloaded', write_chapters.bind(this,
					callback));
			library_namespace.debug([ 'write_chapters: ', {
				// gettext_config:{"id":"waiting-for-all-resources-loaded"}
				T : 'Waiting for all resources loaded...'
			} ], 0);
			// console.log(this.downloading);
			return;
		}

		library_namespace.debug({
			// gettext_config:{"id":"start-writing-e-book-materials"}
			T : '開始寫入電子書資料……'
		}, 2, 'write_chapters');
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
				library_namespace.warn({
					// gettext_config:{"id":"missing-resource-item-$1"}
					T : [ '丟失資源項目 %1', item ]
				});
			}
		}, this);

		this.initialize();

		var meta = this.metadata.meta, link = this.metadata.link;
		// sort: 將 meta, link 置於末尾。
		delete this.metadata.meta;
		delete this.metadata.link;
		this.metadata.meta = meta;
		this.metadata.link = link;
		/**
		 * <code>

		this.metadata = {
			'dc:tagname' : [ {Object} ],
			meta : { [property] : [ {Object} ] },
			link : { href : {Object} }
		}

		</code>
		 */
		this.raw_data_ptr.metadata.clear();
		Object.entries(this.metadata).forEach(function(data) {
			if (data[0] === 'meta' || data[0] === 'link') {
				// 待會處理。
				return;
			}

			// TODO: 正規化{Object}data[1]，如值中有 {Date}。
			var _data;
			// calibre 裡面的標籤採用逗號","做為分隔，若是直接輸入{Array}subject，
			// JSON.to_XML(this.raw_data, this.to_XML_options)
			// 的時候會以 this.to_XML_options.separator : '\n' 為分隔，
			// 造成無法判別，因此需要特別處理。
			if (data[0] === 'dc:subject') {
				_data = data[1].map(function(object) {
					object = Object.clone(object);
					for ( var tag in object) {
						if (Array.isArray(object[tag]))
							object[tag] = object[tag].join(',');
						// only apply to children.
						// 資料結構和 new_node 類似:
						// {tagName:children,attrName:attr,...}
						break;
					}
					return object;
				});
			} else {
				_data = data[1];
			}
			this.raw_data_ptr.metadata.append(_data);
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
		// TODO: check if the TOC file exists.
		) {
			// 不能用 this.add()，因為當 .pack() 時，必須在 archive 前先 add_chapter()。
			add_chapter.call(this, {
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
			normalize_item.call(this, resource, true));
			if (resource[KEY_DATA]) {
				var info = Object.create(null), configured;
				this.preserve_attributes.forEach(function(name) {
					if (resource[KEY_DATA][name]) {
						configured = true;
						info[name] = resource[KEY_DATA][name];
					}
				});
				if (configured) {
					info = JSON.stringify(info);
					if (/%2D(?:-|%2D)|-%2D/.test(info)) {
						library_namespace.error(
						// gettext_config:{"id":"the-instructed-material-to-be-enclosed-in-the-comment-itself-contains-text-such-as-$2d$2d-or-$2d-which-will-cause-an-error-in-decoding"}
						'所欲封入注釋的詮釋資料本身含有 "%2D%2D" 或 "%2D-" 之類文字，將造成解碼時出現錯誤！');
						library_namespace.info(info);
					}
					this.raw_data_ptr.manifest.push('<!-- '
					// The string "--" is not permitted within comments.
					// 在 HTML 注釋中不能包含 "--"。
					// TODO: 還沒排除 "%2D--" 之類問題。
					+ info.replace(/-{2,}/g, function($0) {
						return '%2D'.repeat($0.length);
					}) + ' -->');
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
		// 寫入電子書封包資料。
		JSON.to_XML(this.raw_data, this.to_XML_options));

		typeof callback === 'function' && callback();
	}

	// package, bale packing 打包 epub。
	function archive_to_ZIP(target_file, remove, callback, file_list) {
		if (!library_namespace.is_empty_object(this.downloading)) {
			// 註冊 callback，等所有媒體檔案下載完再收尾。
			this.add_listener('all_downloaded', archive_to_ZIP.bind(this,
					target_file, remove, callback, file_list));
			library_namespace.info([ 'archive_to_ZIP: ', {
				// gettext_config:{"id":"waiting-for-all-resources-loaded"}
				T : 'Waiting for all resources loaded...'
			} ], 0);
			return;
		}

		if (Array.isArray(callback) && !file_list) {
			file_list = callback;
			callback = null;
		}
		if (false && Array.isArray(file_list)) {
			// 警告: 必須自行先排除 mimetype 這個檔案。
			file_list = file_list.filter(function(path) {
				return path !== mimetype_filename;
			});
		}

		library_namespace.debug({
			// gettext_config:{"id":"start-building-e-books"}
			T : '開始建構電子書……'
		}, 2, 'archive_to_ZIP');
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
				library_namespace.debug({
					// gettext_config:{"id":"removing-empty-directory-$1"}
					T : [ '移除空目錄：%1', directory ]
				}, 1, 'archive_to_ZIP');
				library_namespace.remove_directory(directory);
			}
		}, this);

		// 先刪除舊的電子書檔案以防干擾。
		library_namespace.remove_file(target_file);

		library_namespace.debug({
			// gettext_config:{"id":"creating-an-ebook-with-7zip-$1"}
			T : [ '以 7zip 創建電子書：%1……', target_file ]
		}, 1, 'archive_to_ZIP');

		var archive_file = library_namespace.append_path_separator(
				this.path.root, mimetype_filename);
		if (/\.epub$/i.test(target_file)
				|| library_namespace.file_exists(archive_file)) {
			archive_file = [ mimetype_filename ];
		} else {
			// Should be .zip
			library_namespace.error('archive_to_ZIP: ' + '[' + archive_file
					+ '] is not exist! Skip mimetype file.');
			archive_file = [];
		}

		archive_file = library_namespace.storage.archive.archive_under(
		// 注意: 這需要先安裝 7z.exe 程式。
		this.path.root,
		// 確保 mimetype 這個檔在第一順位。
		target_file, {
			level : 0,
			files : archive_file,
			type : 'zip'
		});
		// 改變後的檔案長度必須要和原先的相同，這樣比較保險，不會更改到檔案結構。

		// https://support.microsoft.com/en-us/help/830473/command-prompt-cmd-exe-command-line-string-limitation
		// On computers running Microsoft Windows XP or later, the maximum
		// length of the string that you can use at the command prompt is 8191
		// characters.
		if (false && Array.isArray(file_list)
				&& file_list.join('" "').length > 7800) {
			library_namespace.warn([ archive_to_ZIP.name + ': ', {
				// gettext_config:{"id":"the-file-list-is-too-long-so-it-is-changed-to-compress-the-entire-directory"}
				T : '檔案列表過長，改成壓縮整個目錄。'
			} ]);
			// 當 epub 電子書非本工具產生時，可能有不同的目錄，必須重新讀取。
			file_list = library_namespace.read_directory(this.path.root)
			// archive all directory without mimetype
			.filter(function(fso_name) {
				return fso_name !== mimetype_filename;
			});
			if (file_list.join('" "').length > 7800) {
				library_namespace.error([ archive_to_ZIP.name + ': ', {
					T : [ '檔案列表仍然過長，總長%1位元組。', file_list.join('" "').length ]
				} ]);
			}

		} else if (!file_list) {
			file_list = [ container_directory_name,
					Ebook.prototype.root_directory_name ]
		}

		var mimetype_first_order_name = mimetype_filename.replace(/^./, '!');
		// assert: mimetype_filename.length === mimetype_first_order_name.length

		// 請注意： rename 必須先安裝 7-Zip **16.04 以上的版本**。
		var error, result = archive_file.rename([ mimetype_filename,
				mimetype_first_order_name ]);
		if (result instanceof Error)
			error = result;

		// if error occurred, do not remove directory.
		if (typeof remove === 'function')
			remove = remove(error);

		// console.log([ this.path, file_list ]);
		result = library_namespace.storage.archive.archive_under(
		//
		this.path.root,
		// archive others.
		archive_file,
		// archive_options
		{
			// set MAX lavel
			level : 9,
			files : file_list,
			recurse : true,
			extra : (remove ? '-sdel ' : ''),
			type : 'zip'
		});
		if (result instanceof Error)
			error = result;

		// console.trace('recover mimetype');
		result = archive_file.rename([ mimetype_first_order_name,
				mimetype_filename ]);
		if (result instanceof Error)
			error = result;

		library_namespace.debug({
			// gettext_config:{"id":"the-e-book-is-created-$1"}
			T : [ '電子書創建完畢：%1', target_file ]
		}, 1, 'archive_to_ZIP');

		// 若需要留下/重複利用media如images，請勿remove。
		if (remove) {
			library_namespace.debug({
				// gettext_config:{"id":"removing-directory-$1"}
				T : [ 'Removing directory: %1', this.path.root ]
			}, 1, 'archive_to_ZIP');
			// rd /s /q this.path.root
			// 這會刪除整個目錄，包括未被 index 的檔案。
			result = library_namespace.remove_directory(this.path.root, true);
			if (result) {
				error = error || result;
				// the operatoin failed
				library_namespace.error(result);
			}
		}
		typeof callback === 'function' && callback(error);
		return error;
	}

	Ebook.prototype = {
		// default root directory name
		// Open eBook Publication Structure (OEBPS)
		// @see [[Open eBook]]
		// http://www.idpf.org/epub/31/spec/epub-ocf.html#gloss-ocf-root-directory
		root_directory_name : 'EPUB',
		// 開放包裹格式 Open Packaging Format metadata file
		// http://www.idpf.org/epub/31/spec/epub-spec.html#gloss-package-document
		// e.g., EPUB/content.opf
		package_document_name : 'content.opf',

		title_separator : ' - ',
		// 階層顯示目錄。
		add_TOC_hierarchy : true,

		to_XML_options : {
			declaration : true,
			separator : '\n'
		},

		// 預設所容許的章節最短內容字數。最少應該要容許一句話的長度。
		MIN_CONTENTS_LENGTH : 4,

		// 應該用[A-Za-z]起始，但光單一字母不容易辨識。
		id_prefix : 'i',
		/**
		 * {Natural}id 與檔案名稱最大長度。
		 * 
		 * calibre 會把電子書解開，放在如
		 * C:\Users\user\AppData\Local\calibre-cache\ev\tmpunbkaj\a\
		 * 目錄底下。這個數值可以限制 id 與檔案名稱最大長度，預防寫入的時候出現錯誤。
		 * 
		 * 因為有以下情況，因此80還不夠:<br />
		 * 第五十六章 守夜人 https://ck101.com/thread-2676074-6-1.html#post_88380114
		 * 第五十六章 守夜人的惶恐 https://ck101.com/thread-2676074-74-1.html#post_91512116
		 */
		MAX_ID_LENGTH : 100,

		setup_container : setup_container,
		initialize : initialize,
		set_raw_data : set_raw_data,
		set : set_meta_information,
		set_writing_mode : set_writing_mode,
		// book.set_cover(url)
		// book.set_cover({url:'url',file:'file_name'})
		// book.set_cover(file_name, contents)
		set_cover : set_cover_image,
		arrange : function arrange() {
			rebuild_index_of_id.call(this, false, true);
			rebuild_index_of_id.call(this, true, true);
		},
		add : function add(item_data, contents) {
			// console.trace(item_data);
			return this[KEY_working_queue] = this[KEY_working_queue]
			// clean error
			['catch'](library_namespace.null_function).then(
					add_chapter.bind(this, item_data, contents));
		},
		remove : function remove(item_data, contents) {
			return this[KEY_working_queue] = this[KEY_working_queue]
			// clean error
			['catch'](library_namespace.null_function)
			//
			.then(remove_chapter.bind(this, title, preserve_data, is_resource));
		},

		add_listener : add_listener,

		generate_TOC : generate_TOC,
		flush : write_chapters,
		// pack up
		archive : archive_to_ZIP,
		// preserve additional properties
		preserve_attributes : 'meta,url,file,type,date,word_count'.split(','),
		pack : function(target_file, remove, callback) {
			// console.trace(target_file);
			return this[KEY_working_queue] = this[KEY_working_queue]
			// clean error
			['catch'](library_namespace.null_function).then(
					write_chapters.bind(this))
			// clean error
			['catch'](library_namespace.null_function).then(
					archive_to_ZIP.bind(this, target_file, remove, callback));
		}
	};

	return Ebook;
}
