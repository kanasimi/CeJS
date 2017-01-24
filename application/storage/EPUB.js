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
 {String}ebook.directory.text / .htm
 {String}ebook.directory.style / .css
 {String}ebook.directory.media / .jpg, .png, .mp3

 </code>
 * 
 * @since 2017/1/24 11:55:51
 * @see [[en:file format]], [[document]], [[e-book]], [[EPUB]], [[Open eBook]]
 *      http://www.idpf.org/epub/31/spec/epub-packages.html
 */

'use strict';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	// application.storage.format.EPUB
	name : 'application.storage.EPUB',

	// JSON.to_XML()
	require : 'data.XML.|application.storage.',

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
			text : boot_directory,
			style : boot_directory + 'style' + path_separator,
			media : boot_directory + 'media' + path_separator
		};

		this.set_raw_data(JSON.from_XML(library_namespace
		// book data
		.read_file(this.directory.book + 'content.opf')), options);
	}

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

	// {JSON}raw_data
	function set_raw_data(raw_data, options) {
		this.raw_data = raw_data = raw_data || {
			package : [ {
				metadata : [ {
					'dc:identifier' : options.id || Math.random() * 1e9,
					id : options.id_type || 'bookid'
				}, {
					'dc:title' : options.title || ''
				}, {
					'dc:language' : options.language || 'en'
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
					href : '.htm',
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
			// http://www.idpf.org/epub/31/spec/
			version : "3.1",
			xmlns : "http://www.idpf.org/2007/opf",
			// http://www.idpf.org/epub/31/spec/epub-packages.html#sec-package-metadata-identifiers
			'unique-identifier' : options.id_type || 'bookid'
		};

		// {Array}raw_data.package[0].metadata
		// {Array}raw_data.package[1].manifest
		// {Array}raw_data.package[2].spine

		var resources = raw_data.package[1].manifest, chapters = raw_data.package[2].spine,
		// id to resources index
		index_of_id = library_namespace.null_Object();

		resources.forEach(function(resource, index) {
			index_of_id[resource.id] = index;
		});

		this.chapters = [];

		// rebuild by the sort of <spine>
		chapters.forEach(function(chapter) {
			var index = index_of_id[chapter.idref];
			if (!(index >= 0)) {
				throw new Error('Invalid id: ' + chapter.idref);
			}
			this.chapters.push(resources[index]);
			delete resources[index];
		});

		// e.g., .css, images. 不包含 chapters
		this.resources = resources.filter(function(resource) {
			return resource;
		});
	}

	function add_chapter(data, contents) {
		if (typeof data === 'string') {
			var title = data;
			if (/\.html?$/i.test(title)) {
				title = title.replace(/\.html?$/i, '');
			} else {
				data += '.htm';
			}
			data = {
				item : null,
				id : title,
				href : data,
				'media-type' : "application/xhtml+xml"
			};
		} else {
			data = {
				item : null,
				id : data.id || data.title,
				href : data.file || data.url.match(/[^\\\/]*$/)[0]
						|| data.title && (data.title + '.htm'),
				'media-type' : "application/xhtml+xml"
			};
		}

		if (contents) {
			library_namespace.write_file(this.directory.text + data.href,
					contents);
		}

		this.chapters.push(data);
	}

	function write_chapters() {
		if (!this.initializated) {
			this.initialize();
		}

		// {Array}raw_data.package[0].metadata
		// {Array}raw_data.package[1].manifest
		// {Array}raw_data.package[2].spine

		this.raw_data.package[1].manifest = this.resources
				.concat(this.chapters);
		this.raw_data.package[2].spine = this.chapters.map(function(chapter) {
			return {
				itemref : null,
				idref : chapter.id
			};
		});

		library_namespace.write_file(this.directory.book + 'content.opf', JSON
				.to_XML(this.raw_data));
	}

	function archive_to_ZIP() {
		// TODO
		TODO;
	}

	Ebook.prototype = {
		initialize : initialize,
		set_raw_data : set_raw_data,
		add : add_chapter,
		flush : write_chapters,
		archive : archive_to_ZIP
	};

	return Ebook;
}
