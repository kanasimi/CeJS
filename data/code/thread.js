/**
 * @name CeL function for thread
 * @fileoverview 本檔案包含了 thread / process 流程控制的 functions。
 * @since 2012/2/3 19:13:49
 */

'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	name : 'data.code.thread',

	require : 'data.code.compatibility.',

	// 設定不匯出的子函式。
	// 完全不 export 至 library_namespace.
	no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	/**
	 * null module constructor
	 * 
	 * @class thread 的 functions
	 */
	var _// JSDT:_module_
	= function() {
		// null module constructor
	};

	/**
	 * for JSDT: 有 prototype 才會將之當作 Class
	 */
	_// JSDT:_module_
	.prototype = {
	// constructor : _
	};

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	var
	/**
	 * const, 不可能為 setTimeout() id.
	 */
	is_running = [ 'is running' ],
	/**
	 * const, 紀錄 process hook。
	 */
	Serial_execute_process = {},
	/**
	 * const, Serial_execute core data 中，可被變更的值。
	 */
	Serial_execute_allow_to_set = {
		interval : '{Integer}設定執行之週期間隔(ms)',

		thread : '{Function}設定每次 loop 所欲執行之執行緒 (handler thread)。',

		// 傳給 handler thread 之 this 與 arguments。
		'this' : '在各 thread 間當作 this 傳遞的 data. "this" argument send to thread.',
		argument : 'argument : 傳給 handler 之 arguments',

		// loop 序號控制。單純輸入數字相當於 {start : 1, length : 自然數序號}
		index : '{Integer}index : process to 哪一序號',
		start : '{Integer}start from 哪一序號(index)',
		// length, last 二選一。
		length : '{Integer}執行 length 次',
		last : '{Integer}執行至哪一序號(end index)',

		// 設定流程控制用 signals。
		stopped : '{Boolean}process stopped',
		finished : '{Boolean}process finished',
		terminated : '{Boolean}process terminated',

		// 設定當 handler 產生錯誤時，是否繼續執行下去。Or stop on throw error of thread.
		skip_throw : '{Boolean}skip throw of thread'
	};

	/**
	 * 設定循序執行(serial execution) 程序，並可以作 stop, resume 等流程控制 (inter-process
	 * communication)。<br />
	 * 本函數可代替迴圈操作 loop, for, setTimeout / setInterval，亦可避免長時間之迴圈操作被 browser
	 * 判別為耗時 loop 而 hang 住。<br />
	 * 可視作一種 iterator / forEach()。<br />
	 * This module use asynchronous method (e.g., setTimeout) to avoid the
	 * "Script Taking Too Long" message.
	 * 
	 * TODO:<br />
	 * .result[], .next() = .step(), input array as option
	 * 
	 * <code>
	// 單 thread
	var i=0,s=0;for(;i<100;i++)s+=Math.random();alert(s);
	
	CeL.run('data.code.thread');
	// 方法1
	new CeL.Serial_execute(function(i, d) {d.s+=Math.random();}, {length: 100, first: function(d) {d.s=0;}, final: function(i, d) {alert(d.s);}});
	// 方法2
	new CeL.Serial_execute(function() {this.s+=Math.random();}, {length: 100, first: function() {this.s=0;}, final: function() {alert(this.s);}});
	 * </code>
	 * 
	 * @param {Function}loop_thread
	 *            loop_thread({Integer}process_to_index) {<br />
	 *            return<br />
	 *            'SIGABRT': terminated (accident occurred), won't run
	 *            options.final();<br />
	 *            others(!0): all done<br /> }
	 * 
	 * @param {Object}[options]
	 *            設定選項。<br /> {<br />
	 *            {String}id : process id (有設定 id 則可以從
	 *            Serial_execute.process(id) 控制。),<br />
	 *            <br />
	 *            {Integer}start : start from 哪一序號(index),<br />
	 *            {Integer}index : process to 哪一序號,<br /> // length, last 二選一。<br />
	 *            {Integer}length : 執行 length 次,<br />
	 *            {Integer}last : 執行至哪一序號(end index),<br />
	 *            <br />
	 *            argument : 傳給 handler 之 arguments,<br />
	 *            {Integer}interval : 週期間隔(ms),<br />
	 *            {Function}first : run first,<br />
	 *            {Function}final : run after all, 結尾, epilogue.<br />
	 *            {Boolean}skip_throw : skip throw of thread(),<br /> }
	 * 
	 * @returns {Serial_execute}process handler
	 * 
	 * @constructor
	 * 
	 * @see http://wiki.ecmascript.org/doku.php?id=strawman:async_functions
	 *      http://support.mozilla.org/en-US/kb/warning-unresponsive-script
	 *      http://support.microsoft.com/kb/175500
	 * 
	 * @since 2012/2/3 18:38:02 初成。<br />
	 *        2012/2/4 12:31:53 包裝成物件。<br />
	 *        2012/11/16 19:30:53 re-write start。<br />
	 *        2012/11/23 23:51:44 re-write finished。<br />
	 *        2013/3/3 19:20:52 重新定義 options.length。<br />
	 */
	function Serial_execute(loop_thread, options) {
		if (typeof loop_thread !== 'function')
			return;

		var tmp,
		// (private) 行程間核心 data.
		core_data = {
			start_time : new Date,
			// interval : 0,
			thread : loop_thread,
			skip_throw : false,
			count : 0
		};

		// public interface.
		// 處理初始化必要，且不允許被 loop_thread 改變的 methods/設定/狀態值.
		this.get = function(name) {
			if (name in core_data)
				return core_data[name];
		};
		this.set = function(name, value) {
			if (name in Serial_execute_allow_to_set) {
				if (arguments.length > 1)
					return core_data[name] = value;
				else
					delete core_data[name];
			}
		};

		if (library_namespace.is_digits(options))
			// 當作執行次數。
			options = {
				length : options
			};
		if (Array.isArray(options))
			// 當作 Array.prototype.forEach()
			options = {
				list : options
			};

		// 處理 options 中與執行相關，且不允許被 loop_thread 改變的設定。
		if (library_namespace.is_Object(options)) {
			// 將 options 之 digits 設定 copy 到 core_data。
			library_namespace.set_method(core_data, options, [ function(key) {
				return !library_namespace.is_digits(options[key]);
			}, 'start', 'last', 'index', 'interval' ]);
			if (false)
				library_namespace.extend(
						[ 'start', 'last', 'index', 'interval' ], core_data,
						options, function(i, v) {
							return !library_namespace.is_digits(v);
						});

			if (!('last' in core_data) && options.length > 0) {
				if (!library_namespace.is_digits(core_data.start))
					core_data.start = 1;
				core_data.last = core_data.start + options.length - 1;
			}
			// 從這邊起，.last 表示結束之序號。

			// 將 options 之 digits 設定 copy 到 core_data。
			library_namespace.set_method(core_data, options, [ 'skip_throw',
					'final', 'this' ]);
			if (false)
				library_namespace.extend([ 'skip_throw', 'final', 'this' ],
						core_data, options);

			if ('argument' in options)
				core_data.argument = Array.isArray(tmp = options.argument) ? tmp
						: [ tmp ];

			// data list.
			if ('list' in options)
				try {
					// check if list is an array-like object, we can use []
					// operator and .length.
					var last = options.list.length - 1, test = options.list[last];
					if (!library_namespace.is_digits(last))
						// 確認 test 會被演算。
						throw '' + test;

					// 這邊不作 Array.prototype.slice.call()，讓 caller 可再作更動。
					// 若希望保留 const，caller 需要自己作 Array.prototype.slice.call()。
					core_data.list = options.list;

					if (!library_namespace.is_digits(options.start))
						// 若尚未設定 .start，則定為 0。
						core_data.start = 0;

					if (!library_namespace.is_digits(core_data.last))
						core_data.last = last;

					// add an item to list.
					this.add = function(item) {
						// 為確保為 generic method，不用 .push()!
						core_data.list[++core_data.last] = item;
					};
					// 取得/設定當前 index。
					this.index = function(index) {
						if (library_namespace.is_digits(index))
							core_data.index = index;
						else
							return core_data.index;
					};

				} catch (e) {
					if (library_namespace.is_Object(options.list)) {
						// TODO
					}
				}

			if (options.record) {
				// 執行結果將會依序置於此 Array。
				core_data.result = [];
			}

			// 登記 process id.
			if (tmp = options.id) {
				if (tmp in Serial_execute_process)
					library_namespace.debug('已有相同 id (' + tmp
							+ ') 之 process 執行中!');
				else
					// 作個登記。
					Serial_execute_process[core_data.id = tmp] = this;
			}

		} else
			// 還是給予個預設值，省略判斷，簡化流程。
			options = {};

		// 外包裹執行緒: 可寫在 prototype 中。
		this.package_thread = Serial_execute_package_thread.bind(this,
				core_data);

		// 既然首尾都設定了，自動設定 index。
		if (!library_namespace.is_digits(core_data.index)
				&& library_namespace.is_digits(core_data.start)
				&& library_namespace.is_digits(core_data.last))
			// start from 哪一序號。
			core_data.index = core_data.start;

		// 必須先執行之程序。
		tmp = options.first;
		if (typeof tmp === 'function')
			if (core_data.argument)
				tmp.apply(core_data['this'] || this, core_data.argument);
			else
				tmp.call(core_data['this'] || this, core_data);

		// 預設自動開始執行。
		if (!('autostart' in options) || options.autostart)
			setTimeout(this.package_thread, 0);
	}

	/**
	 * 取得指定 id 之控制程序。
	 */
	Serial_execute.process = function(id) {
		if (id in Serial_execute_process)
			return Serial_execute_process[id];
	};

	/**
	 * signal 定義。
	 * 
	 * @see <a href="http://en.wikipedia.org/wiki/Unix_signal"
	 *      accessdate="2012/2/4 15:35">Unix signal</a>
	 */
	Serial_execute.signal = {
		// running : 0,
		STOP : 1,
		// 結束程序。
		FINISH : 2,
		// abort
		TERMINATE : 3
	};

	/**
	 * Serial_execute controller.
	 * 
	 * @param signal
	 * @param result
	 * @returns {Serial_execute_controller}
	 */
	function Serial_execute_controller(signal, result) {
		this.signal = signal;
		if (arguments.length > 1)
			this.result = result;
	}

	Serial_execute.controller = Serial_execute_controller;

	// private: 預設外包裹執行緒。iterator.
	function Serial_execute_package_thread(data, force) {

		if (data.stopped) {
			library_namespace.debug('執行緒已被中止。欲執行請先解除暫停設置。', 1,
					'Serial_execute_package_thread');
			return;
		}

		if (data.timer_id !== undefined) {
			if (data.timer_id === is_running) {
				library_namespace.debug('執行緒正執行中，忽略本次執行要求。', 1,
						'Serial_execute_package_thread');
				return;
			}
			clearTimeout(data.timer_id);
		}
		// lock
		data.timer_id = is_running;

		var result, list = data.list, to_terminate = data.terminated, argument_array,
		// 設定是否已結束。
		to_finish = to_terminate || data.finished || data.index > data.last,
		// debug 用
		id_tag = 'process [' + data.id + '] @ ' + data.index + ' / '
				+ data.start + '-' + data.last;

		if (!to_finish) {
			// 已執行幾次。在 thread 中為從 1，而非從 0 開始！
			data.count++;
			library_namespace.debug('實際執行 loop thread()。', 2,
					'Serial_execute_package_thread');

			if (list)
				list = [ list[data.index], data.index, list ];

			if (data.argument) {
				// data.argument 應為 Array。
				argument_array = data.argument;
				if (list)
					// 不動到原先的 data.argument。
					// 將 data.argument 當作最前面的 arguments，之後才填入 list 的部分。
					argument_array = argument_array.concat(list);
			} else if (list)
				// 當作 Array.prototype.forEach()
				argument_array = list;

			try {
				result = argument_array ?
				//
				data.thread.apply(data['this'] || this, argument_array) :
				//
				data.thread.call(data['this'] || this, data.index, data.count);
				library_namespace.debug('loop thread() 程序執行完畢。', 2,
						'Serial_execute_package_thread');
				if (data.result)
					data.result.push(result);

			} catch (e) {
				if (e.constructor === Serial_execute_controller) {
					// signal cache
					var signal = Serial_execute.signal;
					switch (e.signal) {
					case signal.STOP:
						library_namespace.debug('Stop ' + id_tag, 1,
								'Serial_execute_package_thread');
						data.stopped = true;
						break;
					case signal.TERMINATE:
						library_namespace.debug('Terminate ' + id_tag, 1,
								'Serial_execute_package_thread');
						to_terminate = true;
						// terminate 的同時，也設定 to_finish。
					case signal.FINISH:
						to_finish = true;
						break;
					default:
						// ignore others.
						break;
					}

					result = e.result;
					if (data.result)
						data.result.push(result);
				} else {
					library_namespace.warn(id_tag + ' failed.');
					library_namespace.error(e);
					if (!data.skip_throw)
						data.stopped = true;
				}
			}
		}

		data.index++;

		if (to_finish) {
			library_namespace.debug('執行收尾/收拾工作。', 1,
					'Serial_execute_package_thread');
			if (!to_terminate && typeof data['final'] === 'function')
				try {
					argument_array = [ data.result || data.count ];
					data['final'].apply(data['this'] || this,
							data.argument ? data.argument
									.concat(argument_array) : argument_array);
				} catch (e) {
					library_namespace.error(e);
				}

			if (data.id in Serial_execute_process)
				delete Serial_execute_process[data.id];

			data.stopped = data.finished = true;
			// TODO: delete all elements in this.
		} else if (data.stopped)
			delete data.timer_id;
		else {
			data.timer_id = setTimeout(this.package_thread, data.interval | 0);
		}

		return result;
	}
	;

	library_namespace.set_method(Serial_execute.prototype, {

		// 行程控制。
		// run, continue, resume
		start : function() {
			this.set('stopped', false);
			library_namespace.debug('Resume [' + this.get('id') + ']');
			return this.package_thread();
		},

		// pause. 中止/停止執行緒。
		stop : function() {
			this.set('stopped', true);
		},

		// next one, step, moveNext.
		next : function() {
			var result = this.start();
			this.stop();
			return result;
		},

		// set position = start.
		rewind : function() {
			this.set('index', this.get('start') || 0);
		},

		// 結束程序。
		finish : function() {
			// gettext_config:{"id":"finished"}
			this.set('finished', true);
			this.set('stopped', false);
			// return this.package_thread();
		},

		// abort (abnormal termination), remove.
		terminate : function() {
			this.set('terminated', true);
			this.set('stopped', false);
			// return this.package_thread();
		},

		// -----------------------------------------------------------------------------------------------------
		// status / property

		// 每隔多少 ms 執行一次。
		interval : function(interval_ms) {
			if (library_namespace.is_digits(interval_ms))
				this.set('interval', interval_ms);
		},

		finished : function() {
			// gettext_config:{"id":"finished"}
			return this.get('finished');
		},

		stopped : function() {
			return this.get('stopped');
		},

		argument : function() {
			if (arguments.length)
				this.set('argument', arguments.length > 1
				//
				? Array.prototype.slice.call(arguments)
				//
				: Array.isArray(argument) ? argument : [ argument ]);

			return this.get('argument');
		},

		length : function() {
			return this.get('length');
		}

	});

	_.Serial_execute = Serial_execute;

	/**
	 * <code>

	// testing for data.code.thread
	
	// adding 0 to 100.
	CeL.run('data.code.thread', function() {
		if (typeof runCode === 'object')
			runCode.setR = 0;
		p = new CeL.Serial_execute(function(i) {
			CeL.debug(this.sum += i);
		}, {
			// id : 't',
			interval : 800,
			length : 100,
			first : function() {
				this.sum = 0;
				CeL.log('Setuped.');
			},
			final : function(i) {
				CeL.log('Done @ ' + i);
			}
		});
		// p.stop();
	});
	// p.next();
	// p.terminate();
	// CeL.log(p);
	
	// adding 0 to 100.
	CeL.Serial_execute(function(data) {
		data[1] += ++data[0];
		CeL.debug(data[0]);
	}, {
		argument : [[ 0, 0 ]],
		length : 100,
		final : function(data) {
			CeL.log('done @ ' + data[0] + ' : ' + data[1]);
		}
	});
	
	//	run 100 times: 0~99.
	new CeL.Serial_execute(function(i) {
		CeL.log(i + ': ' + (this.s = (this.s || 0) + i));
	}, 100);
	
	new CeL.Serial_execute(function(i) {
		this.s = (this.s || 0) + i;
		if (i === 100) {
			CeL.log(i + ':' + this.s);
			this.finish();
		}
	});
	
	
	
	
	// 當作 Array.prototype.forEach()
	
	CeL.run('data.code.thread');
	new CeL.Serial_execute(function(item, index) {
		CeL.log(item);
	}, [2, 1, 3, 6]);


	</code>
	 */

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//
	return (_// JSDT:_module_
	);
}
