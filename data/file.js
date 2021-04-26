/**
 * @name CeL file system functions
 * @fileoverview 本檔案包含了 file system functions。
 * @since 2013/1/5 9:38:34
 * @see <a href="http://en.wikipedia.org/wiki/Filesystem" accessdate="2013/1/5
 *      9:44">File system</a>
 */

'use strict';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'data.file',

	// includes() @ data.code.compatibility.
	require : 'data.code.compatibility.|application.OS.Windows.new_COM'
	//
	+ '|data.code.thread.Serial_execute',

	// 設定不匯出的子函式。
	no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring.
	var new_COM = this.r('new_COM'), Serial_execute = this.r('Serial_execute');

	// ---------------------------------------------------------------------//
	// 基本宣告與定義。

	var
	// cache.
	path_separator = library_namespace.env.path_separator,
	/**
	 * FileSystemObject
	 * 
	 * @inner
	 * @ignore
	 * @see <a
	 *      href="http://msdn.microsoft.com/en-us/library/z9ty6h50(v=VS.84).aspx"
	 *      accessdate="2010/1/9 8:10">FileSystemObject Object</a>, Scripting
	 *      Run-Time Reference/FileSystemObject
	 *      http://msdn.microsoft.com/en-US/library/hww8txat%28v=VS.84%29.aspx
	 */
	FSO = new_COM("Scripting.FileSystemObject");

	// 可 test FSO.

	var
	// const flag enumeration: 用於指示 type.
	// assert: (!!type) MUST true!
	FILE = 1, FOLDER = 2,

	// const flag enumeration: file/folder callback index.
	FILE_HANDLER_INDEX = 0, FOLDER_HANDLER_INDEX = 1,

	// const: sub files.
	// 必須是不會被用於目錄名之值。
	FILES = '',
	// TODO: file/directory status/infomation, even contents.
	// 必須是不會被用於目錄名之值。
	DATA = '.',

	// 預設最多處理之 folder 層數。
	// directory depth limit.
	default_depth = 64,

	// const flag enumeration: default property data.
	fso_property = {
		file : {
			Attributes : '',
			DateCreated : '',
			DateLastAccessed : '',
			DateLastModified : '',
			Drive : '',
			Name : '',
			ParentFolder : '',
			Path : '',
			ShortName : '',
			ShortPath : '',
			Size : '',
			Type : ''
		},
		folder : {
			Attributes : '',
			DateCreated : '',
			DateLastAccessed : '',
			DateLastModified : '',
			Drive : '',
			Name : '',
			ParentFolder : '',
			Path : '',
			ShortName : '',
			ShortPath : '',
			Size : '',
			Type : '',
			Files : '',
			IsRootFolder : '',
			SubFolders : ''
		},
		driver : {
			AvailableSpace : '',
			DriveLetter : '',
			DriveType : '',
			FileSystem : '',
			FreeSpace : '',
			IsReady : '',
			Path : '',
			RootFolder : '',
			SerialNumber : '',
			ShareName : '',
			TotalSize : '',
			VolumeName : ''
		}
	};

	// a network drive.
	// http://msdn.microsoft.com/en-us/library/ys4ctaz0(v=vs.84).aspx
	// NETWORK_DRIVE = 3,

	/**
	 * 取得指定 path 之檔名/資料夾名稱。
	 * 
	 * @param {String}path
	 *            指定之目標路徑。
	 * @returns {String} 檔名/資料夾名稱。
	 * @inner
	 */
	function name_of_path(path) {
		var match = typeof path === 'string' && path.match(/[^\\\/]+/);
		return match && match[0] || path || '';
	}

	/**
	 * 傳回新的資料夾結構。
	 * 
	 * @returns 新的資料夾結構。
	 * @inner
	 */
	function new_folder() {
		var folder = Object.create(null);
		// 檔案, sub-files.
		folder[FILES] = Object.create(null);
		// directory status/infomation.
		folder[DATA] = Object.create(null);
		return folder;
	}

	// ---------------------------------------------------------------------//
	// filter 處理。

	/**
	 * options 所使用到的 filter name。
	 */
	var regular_filter_name = {
		// path filter.
		// 通常我們輸入的只會指定 path filter。
		filter : 0,
		// file name filter. 篩選檔案.
		// WARNING: 若有設定，只要檔名不符合，即使 folder name 符合亦一樣會被剔除！
		file_filter : 1,
		// folder name filter. 篩選資料夾.
		folder_filter : 2
	};

	/**
	 * 判別是否為可接受之字串篩選器。<br />
	 * filter should has NO global flag.
	 * 
	 * @param {undefined|String|RegExp|Function}filter
	 *            字串篩選器。
	 * 
	 * @returns {Boolean} 為可接受之字串篩選器。
	 */
	function is_regular_filter(filter) {
		return !filter || typeof filter === 'string'
		// RegExp
		|| library_namespace.is_RegExp(filter)
		// function
		|| typeof filter === 'function';
	}

	/**
	 * 檢測 options 的 filter。
	 * 
	 * @param {Object}options
	 *            optional flag. e.g., filter.
	 */
	function check_filter_of_options(options) {
		for ( var filter_name in regular_filter_name)
			if ((filter_name in options)
					&& !is_regular_filter(options[filter_name]))
				delete options[filter_name];
	}

	/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
	var NOT_FOUND = ''.indexOf('_');

	/**
	 * 判斷指定字串是否合乎篩選。
	 * 
	 * @param {undefined|String|RegExp|Function}filter
	 *            字串篩選器。
	 * @param {String}string
	 *            欲測試之指定字串。string to test.
	 * @param [argument]
	 *            當篩選器為 function 時之附加引數。
	 * 
	 * @returns {Boolean} 為可接受之字串篩選器。
	 */
	function match_filter(filter, string, argument) {
		return !filter
		//
		|| (typeof filter === 'string'
		// String
		? string.includes(filter)
		// RegExp
		: filter.test ? filter.test(string)
		// function
		: filter(string, argument));
	}

	// ---------------------------------------------------------------------//
	// 檔案系統模擬結構。

	/**
	 * 建立模擬檔案系統結構 (file system structure) 之 Class。取得檔案列表。<br />
	 * 注意: 在此設定的 callback，不具有防呆滯功能。<br />
	 * TODO: fs.readdir or fs.readdirSync @ node.js<br />
	 * TODO: follow link
	 * 
	 * @example <code>
	//	列出指定目錄下所有壓縮檔。
	CeL.run('data.file', function() {
		var folder = new CeL.file_system_structure('D:\\a', { file_filter : /\.(zip|rar|7z|exe)$/i });
		folder.each(function(fso, info) {
			CeL[info.is_file ? 'log' : 'info']([ info.index, '/', info.length, '[', fso.Path, ']' ]); }, {
				// filter : 'f',
				max_count : 5,
				'final' : function() { CeL.log([ this.count.filtered_file, ' done']); }
			}
		);
	});
	</code>
	 * 
	 * @param {String|Array}path
	 *            指定之目標路徑。<br />
	 *            使用相對路徑，如 '..' 開頭時，須用 get_file_path() 調整過。
	 * @param {Object}[options]
	 *            optional flag. e.g., filter.
	 * 
	 * @constructor
	 * 
	 * @see <a
	 *      href="http://msdn.microsoft.com/library/en-US/script56/html/0fa93e5b-b657-408d-9dd3-a43846037a0e.asp">FileSystemObject</a>
	 * 
	 * @since 2013/1/6 18:57:16 堪用。
	 */
	function file_system_structure(path, options) {
		if (this === file_system_structure)
			throw 'Please use "new file_system_structure()"'
					+ ' instead of "file_system_structure()"!';

		// private properties.
		this.structure = new_folder();
		this.count = Object.create(null);
		this.path_list = [];

		this.add(path, options);
	}

	/**
	 * 解析/取得模擬結構中，指定 path 所在位置。
	 * 
	 * @param {String}path
	 *            指定之目標路徑。
	 * @param {Number}create_type
	 *            以 FILE or FOLDER 創建此標的。
	 * 
	 * @returns {Object} 檔案系統模擬結構中，指定 path 所在位置。
	 * @returns undefined error occurred.
	 */
	function resolve_path(path, create_type) {
		var base = this.structure;

		if (path && typeof path === 'string') {
			var name, i = 0, list = library_namespace.simplify_path(path)
					.replace(/[\\\/]+$/, '');
			if (name = list.match(/^\\\\[^\\]+/)) {
				// a network drive.
				name = name[0];
				list = list.slice(name.length).split(/[\\]+/);
				list[0] = name;
			} else
				list = list.split(/[\\\/]+/);

			for (; i < list.length; i++) {
				name = list[i];
				if (name in base)
					base = base[name];
				else if (!create_type)
					return undefined;

				else if (create_type === FOLDER
				// 不是最後一個。
				|| i + 1 < list.length)
					base = base[name] = new_folder();
				else
					base[FILES][name] = null;
			}
		}

		return base;
	}

	/**
	 * 將 fso 所有 data_fields 中的項目 extend 到 data 中。
	 * 
	 * @inner
	 * @private
	 * 
	 * @param {file_system_object}fso
	 *            file system object.
	 * @param {Object}data_fields
	 *            欲 extend 之項目。
	 * @param {檔案系統模擬結構}data
	 *            所在位置。
	 * 
	 * @returns {Number} extend 之項目數。
	 */
	function fill_data(fso, data_fields, data) {
		var name,
		// {Number} extend 之項目數。
		// count = 0,
		item;
		for (name in data_fields)
			try {
				// Get the infomation/status of fso.
				if ((item = fso[name]) !== undefined) {
					data[name]
					//
					= typeof data_fields[name] === 'function'
					//
					? data_fields[name](item) : item;
					// count++;
				}
			} catch (e) {
				// 在取得 RootFolder 的 .DateCreated,
				// .DateLastAccessed, .DateLastModified 時，會
				// throw。
				if (library_namespace.is_debug(3)) {
					library_namespace.warn('fill_data: 擷取資訊 [' + name
							+ '] 時發生錯誤！');
					library_namespace.error(e);
				}
			}
		// return count;
		return data;
	}

	/**
	 * 將指定 path 加入模擬結構。<br />
	 * 注意: base path 本身不受 filter 限制！
	 * 
	 * @param {String|Array}path
	 *            指定之目標路徑。<br />
	 *            使用相對路徑，如 '..' 開頭時，須用 get_file_path() 調整過。
	 * @param {Object}[options]
	 *            optional flag. e.g., filter.
	 */
	function add_path(path, options) {

		library_namespace.debug('初始化+正規化。', 2, 'add_path');
		// 前置處理。
		if (!library_namespace.is_Object(options))
			options = Object.create(null);
		if (isNaN(options.depth) || options.depth < 0
		// || options.depth > default_depth
		)
			options.depth = default_depth;

		check_filter_of_options(options);

		var callback_Array;
		if ('callback' in options) {
			callback_Array = options.callback;
			if (typeof callback_Array === 'function')
				options.callback = callback_Array = [ callback_Array,
						callback_Array ];
			else if (!Array.isArray(callback_Array)
					|| callback_Array.length === 0) {
				delete options.callback;
				callback_Array = undefined;
			}
		}

		// for Array [path].
		if (Array.isArray(path)) {
			path.forEach(function(p) {
				this.add(p, options);
			}, this);
			return;
		}

		var base = this.structure;
		if (!path) {
			library_namespace.debug(
			// 省略 path 會當作所有 Drivers。
			'取得各個 driver code。', 2, 'add_path');
			for (var driver, drivers = new Enumerator(FSO.Drives);
			//
			!drivers.atEnd(); drivers.moveNext()) {
				driver = drivers.item();
				// http://msdn.microsoft.com/en-us/library/ts2t8ybh(v=vs.84).aspx
				if (driver.IsReady)
					base[driver.Path] = new_folder();
				else
					library_namespace.warn('add_path: Drive [' + driver.Path
							+ '] 尚未就緒！');
			}

			return;
		}

		var fso,
		// 類型
		type;
		// 轉換輸入之 path 成 FSO object。
		try {
			if (typeof path === 'string') {
				// 注意: 輸入 "C:" 會得到 C: 的工作目錄。
				if (FSO.FolderExists(path)) {
					fso = FSO.GetFolder(path);
					type = FOLDER;
				} else if (FSO.FileExists(path)) {
					fso = FSO.GetFile(path);
					type = FILE;
				}

			} else if (typeof path === 'object' && path.Path) {
				fso = isNaN(path.DriveType) ? path : FSO.GetFolder(path.Path);
				type = fso.SubFolders ? FOLDER : FILE;
			}
		} catch (e) {
			library_namespace.error(e);
		}

		if (typeof fso !== 'object' || !(path = fso.Path)) {
			library_namespace.warn('add_path: 無法判別 path [' + path
					+ ']！指定的文件不存在？');
			return;
		}

		var list = this.path_list;
		for (var i = 0; i < list.length; i++)
			if (list[i].startsWith(path)) {
				library_namespace.debug('已處理過 path [' + path + ']。', 2,
						'add_path');
				return;
			}

		library_namespace.debug(
		//
		'Adding [' + path + ']', 2, 'add_path');
		list.push(path);

		if (base = callback_Array && callback_Array[
		//
		type === FOLDER ? FOLDER_HANDLER_INDEX : FILE_HANDLER_INDEX])
			try {
				base(fso, {
					depth : 0,
					is_file : type !== FOLDER
				});
			} catch (e) {
				library_namespace.error(e);
			}

		base = this.get(path, type);

		var filter = options.filter,
		//
		file_filter = options.file_filter,
		//
		folder_filter = options.folder_filter,
		//
		folder_first = !!options.folder_first,

		//
		count = this.count,
		// 注意: assert(undefined|0===0)
		total_size = count.size | 0,
		//
		total_file_count = count.file | 0,
		//
		total_folder_count = count.folder | 0,
		//
		filtered_total_file_count = count.filtered_file | 0,
		//
		filtered_total_folder_count = count.filtered_folder | 0,

		//
		file_data_fields = library_namespace.is_Object(options.data)
		//
		? options.data : options.data === true ? fso_property.file : false,
		//
		folder_data_fields = library_namespace.is_Object(options.folder_data) ? options.folder_data
				//
				: options.folder_data === true || options.data === true
				//
				? fso_property.folder : file_data_fields,

		// 巡覽/遍歷子目錄與所包含的檔案。
		traverse = function(fso, base, depth) {
			var item, collection, name, callback,
			//
			folder_data = base[DATA],
			// 有無加入 file count 功能，在 JScript 10.0.16438 差別不到 4%。
			// 為求方便，不如皆加入。
			size = 0,
			//
			file_count = 0, folder_count = 0,
			//
			filtered_file_count = 0, filtered_folder_count = 0,

			// list files of folder. 所包含的檔案.
			each_file = function() {
				library_namespace.debug('巡覽 [' + fso.Path + '] 之 sub-files。',
						3, 'add_path');
				try {
					for (collection = new Enumerator(fso.Files);
					//
					!collection.atEnd(); collection.moveNext()) {
						item = collection.item();
						file_count++;
						size += item.Size;

						if (match_filter(filter, item.Path, depth)
								&& match_filter(file_filter, name = item.Name,
										depth)) {
							++filtered_file_count;
							library_namespace.debug(
							//
							'Adding sub-file [' + filtered_file_count + '/'
									+ file_count + '] [' + item.Path + ']', 4,
									'add_path');
							base[FILES][name] = file_data_fields
							//
							? fill_data(item, file_data_fields, Object
									.create(null)) : null;
							// 預防 callback 動到 item，排在最後才處理。
							if (callback = callback_Array
							//
							&& callback_Array[FILE_HANDLER_INDEX])
								try {
									callback(item, {
										depth : depth,
										is_file : true
									});
								} catch (e) {
									library_namespace.error(e);
								}
						}
					}
				} catch (e) {
					// TODO: handle exception
				}
				total_size += size;
				total_file_count += file_count;
				filtered_total_file_count += filtered_file_count;
			},

			// 處理子目錄。
			each_folder = function() {
				library_namespace.debug('巡覽 [' + fso.Path + '] 之 sub-folders。',
						3, 'add_path');
				// 執行途中可能更動/刪除到此項目。try: 以防 item 已經被刪除。
				try {
					// 因為檔案可能因改名等改變順序，因此用 .moveNext()
					// 的方法可能有些重複，有些漏掉未處理。
					for (collection = new Enumerator(fso.SubFolders);
					//
					!collection.atEnd(); collection.moveNext()) {
						item = collection.item();
						folder_count++;
						if (match_filter(filter, item.Path, depth)
						//
						&& match_filter(folder_filter, name = item.Name, depth)) {
							filtered_folder_count++;
							library_namespace.debug(
							//
							'Adding sub-folder [' + filtered_folder_count + '/'
									+ folder_count + '] [' + item.Path + ']',
									4, 'add_path');
							name = base[name] = new_folder();

							if (callback = callback_Array
							//
							&& callback_Array[FOLDER_HANDLER_INDEX])
								try {
									callback(item, {
										depth : depth,
										is_file : false
									});
								} catch (e) {
									library_namespace.error(e);
								}

							if (depth < options.depth)
								traverse(item, name, depth);
						}
					}
				} catch (e) {
					// TODO: handle exception
				}
				// 可加上次一層: 會連這次一層之檔案都加上去。
				total_folder_count += folder_count;
				filtered_total_folder_count += filtered_folder_count;
			};

			if (folder_data_fields)
				fill_data(fso, folder_data_fields, folder_data);

			// 自身已經處理完，接下來 sub-files/sub-folders 之 depth 皆 +1。
			depth++;

			if (folder_first) {
				each_folder();
				each_file();
			} else {
				each_file();
				each_folder();
			}

			library_namespace.debug('巡覽 [' + fso.Path + ']: ' + file_count
					+ '/' + total_file_count + ' files, ' + size + '/'
					+ total_size + ' bytes, ' + folder_count + '/'
					+ total_folder_count + ' folders。', 2, 'add_path');

			folder_data.count = {
				size : size,

				file : file_count,
				folder : folder_count,

				filtered_file : filtered_file_count,
				filtered_folder : filtered_folder_count
			};
		};

		if (type === FOLDER) {
			if (options.depth > 0) {
				library_namespace.debug('開始巡覽 [' + path + ']。', 2, 'add_path');
				traverse(fso, base, 0);
			}

			count.size = total_size;
			count.file = total_file_count;
			// +1: base path 本身。
			count.folder = total_folder_count + 1;
			count.filtered_file = filtered_total_file_count;
			count.filtered_folder = filtered_total_folder_count + 1;

		} else {
			count.size = total_size + fso.Size;
			// +1: base path 本身。
			count.file = total_file_count + 1;
			count.folder = total_folder_count;
			// +1: base path 本身。
			count.filtered_file = filtered_total_file_count + 1;
			count.filtered_folder = filtered_total_folder_count;
		}
	}

	/**
	 * 重新整理/同步模擬結構。
	 * 
	 * @param {String|Array}path
	 *            指定之目標路徑。
	 * @param {Object}[options]
	 *            optional flag. e.g., filter.
	 */
	function refresh_structure(path, options) {
		// TODO: 勿 reset。
		this.structure = new_folder();

		this.path_list.forEach(function(p) {
			this.add(p, options);
		}, this);
	}

	/**
	 * 當呼叫 JSON.stringify() 時的前置處理。
	 */
	function structure_to_JSON(key) {
		// hierarchy:
		// {
		// FILES:[],
		// DATA:{},
		// 資料夾名稱(sub directory name):{}
		// };
		var structure = Object.create(null),
		//
		traverse = function(folder, base) {
			if (folder[FILES].length)
				base[FILES] = folder[FILES];

			for ( var name in folder)
				if (name !== FILES && name !== DATA)
					traverse(folder[name], base[name] = Object.create(null));
		};

		traverse(this.structure, structure);

		return structure;
	}

	// ---------------------------------------------------------------------//
	// 巡覽/遍歷檔案系統模擬結構之功能。

	/**
	 * 處理執行 callback 發生錯誤時的函數。
	 * 
	 * @inner
	 * @private
	 * 
	 * @since 2013/1/7 22:38:47。
	 */
	function callback_error_handler(controller, error_Object, options, stack) {
		var message = [ '執行 callback 時發生錯誤！您可' ],
		//
		skip_error = options.skip_error;
		if (skip_error)
			message.push({
				a : '停止執行',
				href : '#',
				onclick : function() {
					controller.stop();
				}
			}, '，或者', {
				// 忽略錯誤
				a : '不再提醒錯誤',
				href : '#',
				onclick : function() {
					delete options.skip_error;
				}
			});
		else
			message.push({
				a : '重試',
				href : '#',
				onclick : function() {
					stack.index--;
					controller.start();
				}
			}, '、', {
				a : '跳過並繼續執行',
				href : '#',
				onclick : function() {
					controller.start();
				}
			}, '，或者', {
				a : '忽略所有錯誤',
				href : '#',
				title : '★若忽略所有錯誤，之後發生錯誤將不會停止，而會直接忽略。',
				onclick : function() {
					options.skip_error = true;
					controller.start();
				}
			});
		message.push('。');
		CeL.warn(message);

		if (error_Object)
			library_namespace.error(error_Object);

		if (!skip_error) {
			controller.stop();
			return true;
		}
	}

	/**
	 * 巡覽/遍歷檔案系統模擬結構時，實際處理的函數。
	 * 
	 * @param {Array}LIFO_stack
	 *            處理堆疊。
	 * @param {file_system_structure}_this
	 *            file_system_structure instance.
	 * @param {Array}callback_Array
	 *            callback_Array[]
	 * @param {Object}options
	 *            optional flag. e.g., filter.
	 * 
	 * @inner
	 * @private
	 * 
	 * @since 2013/1/6 18:57:16 堪用。
	 */
	function travel_handler(LIFO_stack, _this,
	//
	callback_Array, options) {

		// 每個 folder 會跑一次 travel_handler。

		// 處理順序:
		// 處理/執行 folder 本身
		// → expand sub-files
		// → 處理/執行 sub-files (若檔案過多會跳出至下一循環處理)
		// → expand sub-folders
		// → 下一循環 from sub-folder[0]。

		var stack, base_space, base_path,
		//
		path, name, depth, path_exists;

		if (LIFO_stack.length > 0) {
			var callback, index;
			stack = LIFO_stack.at(-1);
			// 若有設定 stack.path，必以 path_separator 作結。
			base_path = stack.path || '';

			if (!stack.is_file)
				while (stack.index < stack.length) {
					name = stack[stack.index++];
					if (FSO.FolderExists(path = base_path
					//
					+ name
					// 若有設定 stack.path，必以 path_separator 作結。
					+ path_separator)) {
						base_path = path;
						path_exists = true;
						base_space = stack.base[name];
						library_namespace.debug('處理/執行 folder [' + path
								+ '] 本身。', 2, 'travel_handler');
						// 判別是否在標的區域內。
						// depth: 正處理之 folder 本身的深度。
						if (isNaN(depth = stack.depth))
							if (stack.length > 1) {
								stack.depth = depth = 0;
							} else
								for (var i = 0,
								//
								path_list = _this.path_list;
								//
								i < path_list.length; i++)
									if (path.startsWith(path_list[i])) {
										stack.depth = depth = 0;
										break;
									}

						if (!isNaN(depth)) {
							// 無論有無 match filter，皆應計數。
							index = options.single_count
							//
							? options.index++ : options.folder_index++;

							if ((callback
							//
							= callback_Array[FOLDER_HANDLER_INDEX])
									&& match_filter(options.filter, path, depth)
									&& match_filter(options.folder_filter,
											name, depth))
								try {
									/**
									 * 處理/執行資料夾本身。 用 folder.Size==0 可判別是否為 empty
									 * folder。
									 * 
									 * @see <a
									 *      href="http://msdn.microsoft.com/en-us/library/1c87day3(v=vs.84).aspx"
									 *      accessdate="2013/1/5 12:43">Folder
									 *      Object</a>
									 */
									callback.call(this, FSO.GetFolder(path), {
										is_file : false,
										depth : depth,
										data : base_space[DATA],
										index : index,
										length : options.folder_count
									});
								} catch (e) {
									if (callback_error_handler(this, e,
											options, stack))
										return;
								}
						}

						// expand sub-files.
						// TODO: check fso.SubFolders
						if (callback_Array[FILE_HANDLER_INDEX]
								&& depth < options.depth) {
							stack = [];
							for (name in
							//
							(stack.base = base_space[FILES]))
								stack.push(name);

							if (stack.length > 0) {
								if (options.sort)
									if (typeof options.sort
									//
									=== 'function')
										stack.sort(options.sort);
									else
										stack.sort();

								library_namespace.debug('開始處理 [' + base_path
										+ '] 之' + stack.length + ' sub-files ['
										+ stack + '].', 2, 'travel_handler');
								stack.index = 0;
								stack.path = path;
								stack.depth = depth + 1;
								stack.is_file = true;
								LIFO_stack.push(stack);
							}
						}
						// 預防有 sub-folder，還是先 break;
						break;

					} else {
						if (path.startsWith('\\\\')) {
							// a network drive.
							base_path = path;
							path_exists = true;
						} else
							library_namespace.warn([ 'travel_handler: ',
									'無法 access folder [', path, ']！',
									'或許是操作期間，檔案有所更動。您可能需要 refresh？' ]);
					}
				}

			// depth: 正處理之 files 的深度。
			depth = stack.depth;
			callback = callback_Array[FILE_HANDLER_INDEX];
			if (stack.is_file) {
				library_namespace.debug('處理/執行 folder [' + base_path
						+ '] 的 sub-files。', 2, 'travel_handler');
				// main loop of file.
				for (var max_count = options.max_count,
				//
				filter = options.filter,
				//
				base = stack.base, pass_data = {
					is_file : true,
					depth : depth,
					// data : stack.base[DATA],
					// index : options.index,
					length : options.count
				};;)
					if (stack.index < stack.length) {
						name = stack[stack.index++];
						if (match_filter(options.filter, path = base_path
								+ name, depth)
								&& match_filter(filter, name, depth)) {
							/**
							 * 處理/執行 sub-files。
							 * 
							 * @see <a
							 *      href="http://msdn.microsoft.com/en-us/library/1ft05taf(v=vs.84).aspx"
							 *      accessdate="2013/1/5 12:43">File Object</a>
							 */
							if (FSO.FileExists(path))
								try {
									// sub-file 存在，則 parent
									// folder 亦存在。
									path_exists = true;
									pass_data.index = options.index++;
									pass_data.data = base[name];
									callback.call(this, FSO.GetFile(path),
											pass_data);
									if (--max_count === 0
									//
									&& stack.index < stack.length)
										return;
								} catch (e) {
									if (callback_error_handler(this, e,
											options, stack))
										return;
								}
							else
								library_namespace.warn([
										'travel_handler: 檔案 [', path,
										'] 不存在或無法 access！', '或許是操作期間，檔案有所更動。',
										'您可能需要 refresh？' ]);
						}
						// 無論有無 match filter，皆應計數。
						pass_data.index++;

					} else {
						// 去掉 sub-files 之stack。
						LIFO_stack.pop();
						options.index = pass_data.index;
						break;
					}
			}

			library_namespace.debug('已處理過 folder [' + base_path
					+ '] 本身與 sub-files。expand sub-folders.', 2,
					'travel_handler');
			stack = LIFO_stack.at(-1);
			// depth: 正處理之 folder 本身的深度。
			depth = stack.depth;
			if (!base_space) {
				base_space = stack.base[stack[stack.index - 1]];
				library_namespace.debug(
						'可能因為 file list 長度超過 options.max_count，已經被截斷過，因此需要重設 base_space ['
								+ stack[stack.index - 1] + '] → ' + base_space
								+ '。', 2, 'travel_handler');
			}
		} else {
			base_path = '';
			base_space = _this.structure;
		}

		if (isNaN(depth) || depth < options.depth) {
			if (LIFO_stack.length === 0
			// 確認所在的 folder 存在。
			// 若不存在，也毋須 expand 了。
			|| path_exists
			// 亦可以下列檢測 base_path 的方式判別。
			// || base_path !== LIFO_stack[LIFO_stack.length -
			// 1].path
			) {
				library_namespace.debug('expand sub-folders.', 3,
						'travel_handler');
				for (name in ((stack = []).base = base_space))
					if (name !== FILES && name !== DATA)
						stack.push(name);

				if (stack.length > 0) {
					if (options.sort)
						if (typeof options.sort === 'function')
							stack.sort(options.sort);
						else
							stack.sort();

					// sub-folders / sub-directory.
					library_namespace.debug([ '開始處理 [', base_path, '] 之 ',
							stack.length, ' 個子資料夾 [<span style="color:#25a;">',
							stack.join('<b style="color:#47e;">|</b>'),
							'</span>].' ], 2, 'travel_handler');
					stack.index = 0;
					stack.path = base_path;
					if (!isNaN(depth))
						stack.depth = depth + 1;
					LIFO_stack.push(stack);
					return;
				}
			}

			if (!base_path) {
				// 應該只有 structure 為空時會用到。
				library_namespace.warn(
				//		
				'travel_handler: structure 為空？');
				return this.finish();
			}
		}

		// 檢查本 stack 是否已處理完畢。
		while ((stack = LIFO_stack.at(-1))
		//
		.index === stack.length) {
			library_namespace.debug('Move up. stack.length = '
					+ LIFO_stack.length, 2, 'travel_handler');
			LIFO_stack.pop();
			if (LIFO_stack.length === 0)
				return this.finish();
		}

	}

	/**
	 * travel structure.<br />
	 * 巡覽/遍歷檔案系統模擬結構的 public 公用函數。
	 * 
	 * TODO:<br />
	 * 不區分大小寫。ignore case<br />
	 * 與 dir/a/s 相較，network drive 的速度過慢。
	 * 
	 * @param {Function|Array}callback
	 *            file system handle function / Array [file handler, folder
	 *            handler].<br />
	 *            可以安排僅對folder或是file作用之function。<br />
	 *            handle function 應有的長度: 2<br />
	 *            callback(fso, info = {is_file, depth, data : fso data, index,
	 *            length}); index = 0 to (length - 1)
	 * @param {Object}[options]
	 *            optional flag. e.g., filter.<br />
	 *            options 之內容會被改動！
	 * 
	 * @returns {Serial_execute} controller
	 * @returns undefined error occurred.
	 * 
	 * @since 2013/1/6 18:57:16 堪用。
	 */
	function for_each_FSO(callback, options) {

		var path_length = this.path_list.length;
		if (path_length === 0) {
			if (library_namespace.is_debug())
				library_namespace.warn(
				//		
				'for_each_FSO: 尚未設定可供巡覽之 path。');
			return undefined;
		}

		library_namespace.debug('初始化+正規化。', 2, 'for_each_FSO');
		if (typeof callback === 'function')
			callback = [ callback, callback ];
		else if (!Array.isArray(callback) || callback.length === 0)
			return;

		// 前置處理。
		if (!library_namespace.is_Object(options))
			options = Object.create(null);

		// 計數 + 進度。
		options.index = 0;
		// 至此 options.count 代表 file count.
		options.count = this.count.filtered_file;
		options.folder_count = this.count.filtered_folder;
		if (options.single_count
		//
		= callback[FOLDER_HANDLER_INDEX]
		//
		=== callback[FILE_HANDLER_INDEX])
			options.folder_count
			//
			= (options.count += options.folder_count);
		else
			options.folder_index = 0;

		check_filter_of_options(options);

		if (typeof options.sort !== 'function'
				&& !(options.sort = !!options.sort))
			delete options.sort;

		// 限定 traverse 深度幾層。深入/不深入下層子目錄及檔案。
		if (isNaN(options.depth) || (options.depth |= 0) < 0)
			options.depth = default_depth;

		if (isNaN(options.max_count) || (options.max_count |= 0) < 1
				|| options.max_count > 1e5)
			// 預設一次 thread 最多處理之檔案個數。
			options.max_count = 800;

		options.argument = [ [], this, callback, options ];

		if (typeof options.final === 'function')
			options.final = options.final.bind(this);

		library_namespace.debug('開始巡覽 ' + path_length + ' paths。', 2,
				'for_each_FSO');
		return new Serial_execute(travel_handler, options);
	}

	// ---------------------------------------------------------------------//
	// public interface of file_system_structure.

	Object.assign(file_system_structure.prototype, {
		get : resolve_path,
		add : add_path,
		each : for_each_FSO,
		refresh : refresh_structure,
		list : function(options) {
			var list = [];
			// TODO: 可用萬用字元。
			this.each(function(fso, info) {
				if (info.is_file)
					list.push(fso.Path);
			}, options);
			return list;
		},
		toJSON : structure_to_JSON
	});

	// ---------------------------------------------------------------------//

	// CeL.run('data.file');
	// var file_handler = new CeL.file([ 'path', 'path' ]);
	// file_handler.merge('to_path').add('path').forEach(function(){});
	function Files(path_list, options) {
		// private property:
		// this.data[path] = data of file = {
		// encoding : encoding cache. NOT absolutely correct.
		// other data.
		// }
		this.data = {};
		// private property:
		// this.order = ['path'];
		if (options) {
			if (typeof options.comparator === 'function')
				// e.g., function(a, b){return a-b;};
				this.comparator = options.comparator;
		}

		this.add(path_list, options);
	}

	function Files_add_object(path, data, order, filter, attributes) {
		var object, count = 0;
		// 注意: 輸入 "C:" 會得到 C: 的工作目錄。
		if (FSO.FolderExists(path)) {
			library_namespace.debug('Add folder [' + path + ']!', 2);
			var fso = FSO.GetFolder(path), item, collection;
			for (collection = new Enumerator(fso.Files);
			//
			!collection.atEnd(); collection.moveNext()) {
				item = collection.item();
				path = item.Path;
				if (!match_filter(filter, path))
					continue;
				data[path] = object = {
					size : item.Size
				};
				if (attributes)
					Object.assign(object, attributes);
				if (order)
					order.push(path);
				count++;
			}

		} else if (FSO.FileExists(path)) {
			library_namespace.debug('Add file [' + path + ']!', 2);
			if (match_filter(filter, path)) {
				data[path] = object = {};
				if (attributes)
					Object.assign(object, attributes);
				if (order)
					order.push(path);
				count++;
			}

		} else
			library_namespace.warn('Files_add_object: 無法辨識 path [' + path
					+ ']!');

		library_namespace.debug('Get ' + count + ' files.', 2);
	}

	function Files_add(path_list, options) {
		var data = this.data,
		//
		order = Array.isArray(this.order) && this.order,
		//
		filter = is_regular_filter(options.filter) && options.filter;

		if (typeof path_list === 'string')
			Files_add_object(path_list, data, order, filter);

		else if (Array.isArray(path_list))
			path_list.forEach(function(path) {
				Files_add_object(path, data, order, filter);
			});

		else if (library_namespace.is_Object(path_list))
			for ( var path in path_list)
				Files_add_object(path, data, order, filter, path_list[path]);

		else {
			library_namespace.warn('Files: Unknown path list [' + path_list
					+ ']!');
			order = false;
		}

		if (order && this.comparator)
			this.sort(
			// default: this.comparator
			);

		return this;
	}

	// create and return this 之 list。
	// 請勿直接使用 this.order，而應該使用 this.list()；
	// 因為 this.order 可能尚未準備好。
	// 不想改到 this 的，得自己 .slice()。
	function Files_list(rebuilt) {
		if (rebuilt || !Array.isArray(this.order)) {
			var order = [];
			// 重新創建 order。
			for ( var path in this.data)
				order.push(path);
			this.order = order;
		}

		return this.order;
	}

	function Files_sort(comparator, options) {
		// 重製 order。
		var order = this.list(),
		//
		comparator = comparator || this.comparator;

		if (options && options.no_set_order)
			order = order.slice();

		if (typeof use_function === 'function')
			order.sort(use_function);
		else if (library_namespace.is_RegExp(use_function))
			order.sort(function(key_1, key_2) {
				if ((key_1 = key_1.match(use_function))
				//
				&& (key_2 = key_2.match(use_function)))
					return key_1[1] - key_2[1];
			});
		else
			order.sort();

		library_namespace.debug(order.join('<br />'), 2);

		if (options) {
			if (!options.no_set_order) {
				this.order = order;
				if (comparator === 'function' && !options.no_set_sort)
					this.comparator = comparator;
			}

			if (options.get_list)
				return order;
		}

		return this;
	}

	var get_file_extension, read_file, write_file, guess_encoding;

	function setup_Files(function_body, function_name) {
		if (!function_name)
			function_name = library_namespace.get_function_name(function_body);
		setup_Files.conversion[function_name] = function_body;

		return function() {
			setup_Files.setup();
			return function_body.apply(this, arguments);
		};
	}
	setup_Files.conversion = {};
	setup_Files.setup = function() {
		library_namespace.debug('Trying setup Files.', 1, 'setup_Files.setup');
		library_namespace.is_included([ 'application.storage.file',
				'application.OS.Windows.file', 'application.locale.encoding' ],
				true);

		get_file_extension = library_namespace.
		//
		application.storage.file.get_file_extension;
		var file = library_namespace.application.OS.Windows.file;
		read_file = file.read_file;
		write_file = file.write_file;
		guess_encoding = library_namespace.
		//
		application.locale.encoding.guess_encoding;

		Object.assign(Files.prototype, setup_Files.conversion);
		library_namespace.debug('Setup Files done.', 1, 'setup_Files.setup');
	};

	function detect_encoding(this_Files, path, force) {
		var data = this_Files.data.path;
		if (!data)
			return;
		if (force || !data.encoding)
			// cache encoding
			data.encoding = guess_encoding(path);
		library_namespace.debug('(' + data.encoding + ') [' + path + ']');
		return data.encoding;
	}

	function decide_target(path, options) {
		var target = typeof options.target === 'function'
		// default: overwrite / save to original file.
		? options.target(path) : path;

		if (typeof options.target_file === 'function') {
			// get file name.
			target = target.match(/^(.*?)([^\\\/]+)$/);
			target = target[1] + options.target_file(target[2]);
		}

		if (target !== path) {
			library_namespace.debug('check extension 一致性。', 2);
			var has_error,
			//
			ext1 = get_file_extension(path),
			//
			ext2 = get_file_extension(target);
			if (ext1 !== ext2) {
				has_error = 1;
				library_namespace.error('副檔名不同! [' + ext1 + ']→[' + ext2 + ']');
			}

			library_namespace.debug('check target_file 檔案存在與否。', 2);
			if (FSO.FileExists(target)) {
				library_namespace.debug('check target_file 檔案大小是否差異太大。', 2);
				var ratio = FSO.GetFile(target).Size / FSO.GetFile(path).Size;
				if (ratio > 8) {
					has_error = 2;
					library_namespace.error('目標檔案 [' + target_file
							+ '] 已存在，且檔案大小差異太大！');
				} else {
					library_namespace.warn('目標檔案 [' + target_file + '] 已存在！'
							+ (has_error ? '' : '將覆寫之。'));
				}
			}

			if (has_error)
				return;
		}

		library_namespace.debug('['
				+ path
				+ ']'
				+ (path === target ? ': original = decided' : '<br />→ ['
						+ target + ']'), 2);
		return target;
	}

	/**
	 * @example <code>
		// Files_encode('target encoding')
		// if set save_to, then backup_to will be ignored.
		options = {
			from : 'encoding',
			save_to : function(path) {
				return 'save to';
			},
			backup_to : function(path) {
				return 'save to';
			}
		}
	 </code>
	 */
	function Files_encode(target_encoding, options) {
		if (!options)
			options = Object.create(null);

		var modify = typeof options.modify === 'function' && options.modify,
		//
		filter = is_regular_filter(options.filter) && options.filter,
		//
		handle_file = function(path) {
			if (!match_filter(filter, path))
				return;
			library_namespace.debug('處理 [' + path + ']', 2, 'Files_encode');
			var source_encoding = options.source_encoding
					|| detect_encoding(this, path) || this.encoding,
			//
			source_text, converted_text,
			//
			target_file = decide_target(path, options);
			if (!target_file)
				return;

			source_text = read_file(path, source_encoding);
			converted_text = modify ? modify(text) : text;

			if (typeof converted_text === 'string'
			//
			&& (source_text !== converted_text
			//
			|| source_enc && target_encoding
			//
			&& source_enc !== target_encoding)) {
				// TODO: !!workaround!!
				write_file(target_file, converted_text,
				// TODO: truncate file
				target_encoding);
			} else if (target_file !== path) {
				// copy file.
				library_namespace.debug(path + ' → ' + target_file);
				FSO.CopyFile(path, target_file);
			}

		};

		if (target_encoding || modify)
			this.list().forEach(handle_file, this);
		else
			library_namespace.warn(
			//
			'Files_encode: Target encoding does not specified.');

		return this;
	}

	function Files_replace(RegExp_from, to) {
		return this.encode(null, {
			modify : function(text) {
				return text.replace(RegExp_from, to);
			}
		});
	}

	function Files_merge(target, options) {
		if (!target)
			// TODO: auto detect.
			throw new Error('Files_merge: No target specified!');

		target = decide_target(target, options);
		if (!target)
			return;

		if (!options)
			options = Object.create(null);
		else if (typeof options === 'string')
			options = {
				encoding : options
			};

		var encoding = options.encoding,
		//
		modify = typeof options.modify === 'function'
		//
		&& options.modify,
		//
		filter = is_regular_filter(options.filter) && options.filter,
		//
		text_Array = [],
		//
		add_text = function(item, path) {
			item = options[item];
			if (!item)
				return;

			if (typeof item === 'string')
				text_Array.push(item);
			else if (typeof item === 'function')
				text_Array.push(item(path));
			else if (Array.isArray(item))
				Array.prototype.push.apply(
				//
				text_Array, item);
			else
				library_namespace.debug('Unknown text: [' + item + ']', 3);
		},
		//
		handle_file = function(path) {
			if (!match_filter(filter, path))
				return;
			library_namespace.debug('處理 [' + path + ']', 2, 'Files_merge');
			var encoding = options.source_encoding
			//
			|| detect_encoding(this, path),
			//
			text = read_file(path, encoding);
			library_namespace.debug('(' + encoding + ') [' + path + ']: '
					+ text.length + ' characters.', 3);

			if (modify) {
				text = modify(text, path);
				library_namespace.debug(
				//
				'→ ' + text.length + ' characters.', 3);
				if (text.length === 0)
					library_namespace.warn('[' + path + ']: 經 modify 後，無內容回傳！');
			}

			add_text('subhead', path);
			text_Array.push(text);
			// sub-footer
			add_text('subfooter', path);
		};

		if (!encoding)
			encoding = FSO.FileExists(target) && detect_encoding(this, target)
					|| this.encoding;
		if (library_namespace.is_debug(3))
			library_namespace.debug('Merge ' + this.list().length
			//
			+ ' files to (' + encoding + ') [' + target + '].');

		add_text('head', target);
		this.list().forEach(handle_file, this);
		add_text('footer', target);

		text_Array = text_Array.join('');
		if (typeof options.modify_all === 'function')
			text_Array = options.modify_all(text_Array);

		library_namespace.debug('Merge ' + this.order.length
				+ ' files, writing ' + text_Array.length + ' characters to ('
				+ encoding + ') [' + target + '].');
		write_file(target, text_Array, encoding);

		(this.data = {})[target] = {};

		delete this.order;

		return this;
	}

	/**
	 * batch operation
	 * 
	 * @param {Function}callback
	 *            callback(path, data)
	 * @param {Function}comparator
	 * @returns {@Files}
	 */
	function Files_forEach(callback, comparator) {
		var data = this.data,
		//
		order = comparator ? this.sort(comparator, {
			no_set_order : true,
			get_list : true
		}) : this.list();
		order.forEach(function(path) {
			library_namespace.debug('處理 [' + path + ']', 2, 'Files_forEach');
			callback(path, data[path]);
		});

		return this;
	}

	/**
	 * get HTML contents.<br />
	 * get contents between "body" tag.
	 * 
	 * @param {String}HTML
	 *            HTML text
	 * @returns {String}contents
	 * @since 2014/7/19 23:9:41
	 */
	function HTML_contents(HTML, use_RegExp) {
		if (use_RegExp)
			return HTML.replace(/[\s\n]*<\/body>(.+|\n)*$/i, '')
			// default 不用 RegExp，因為 RegExp 太慢。
			.replace(/^(.+|\n)*<body>[\s\n]*/i, '');

		var foot = HTML.lastIndexOf('</body>'),
		//
		head = HTML.indexOf('<body');

		// 去尾。
		if (false && foot === NOT_FOUND)
			foot = HTML.lastIndexOf('</BODY>');
		if (foot === NOT_FOUND) {
			foot = HTML.lastIndexOf('</div>');
			if (foot !== NOT_FOUND && !/^[\s\n]*$/.test(HTML.slice(foot)))
				foot = NOT_FOUND;
		}

		// 去頭。
		if (false && head === NOT_FOUND)
			head = HTML.indexOf('<BODY');
		if (head === NOT_FOUND) {
			head = HTML.indexOf('<div');
			if (head !== NOT_FOUND && !/^[\s\n]*$/.test(HTML.slice(0, head)))
				head = NOT_FOUND;
		}
		head = HTML.indexOf('>', head) + 1;

		// 切割。
		if (foot === NOT_FOUND) {
			if (head !== NOT_FOUND)
				HTML = HTML.slice(head);
		} else
			HTML = HTML.slice(head, foot);

		return HTML;
	}

	// ---------------------------------------------------------------------//
	// public interface of Files.

	Object.assign(Files.prototype, {
		add : Files_add,
		list : Files_list,
		sort : Files_sort,

		// convert encoding
		encode : setup_Files(Files_encode, 'encode'),
		merge : setup_Files(Files_merge, 'merge'),

		replace : setup_Files(Files_replace, 'replace'),

		forEach : Files_forEach,
		encoding : 'UTF-8'
	});

	// ---------------------------------------------------------------------//
	// export.

	return Object.assign(Files, {
		HTML_contents : HTML_contents,
		file_system_structure : file_system_structure
	});

}
