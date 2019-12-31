/**
 * @name npm test frontend for CeL.
 *
 * @fileoverview 本檔案用於在 npm 中測試本 library 正確性。
 *               透過重複執行自動化測試；以設計上所要求必須通過之測試範例，驗證輸出是否符合預期。
 *
 * TODO: 測試涵蓋率, 整合測試
 *
 * @example <code>

# npm test

(git push)

// http://package-json-validator.com/
# npm cache clean && npm publish
$ npm install cejs
$ npm update
## after update, the old package will be preserved in .npm/cejs/.

# npm view

TODO: https://github.com/kanasimi/CeJS/tags
// git add release
// https://git-scm.com/book/en/v2/Git-Basics-Tagging
# git tag "v2.0.0" master
# git tag -a "v2.0.0" -m "tagging message"



-----------------------------------------------------------

node
require('./_for include/_CeL.loader.nodejs.js');


 * </code>
 *
 * @since 2015/10/17 14:5:49
 */

'use strict';

// Date.now()
// console.time(''), console.timeEnd('')
/** {ℕ⁰:Natural}test start time value */
var test_start_time = (new Date).getTime(),
	/** {ℕ⁰:Natural+0}debug level during normal test period */
	test_debug_level = 0,
	/** {ℕ⁰:Natural+0}test level */
	test_level = 1,
	/** {ℕ⁰:Natural+0}count of all errors (failed + fatal) */
	all_error_count = 0,
	/** {Object}tests still running */
	still_running = {
		left_count: 0
	};

// index.js
require('../index');

//require("./_for include/node.loader.js");


// More examples: see /_test suite/test.js


//============================================================================================================================================================


function test_base() {
	all_error_count += CeL.test('set options', function (assert) {
		assert(CeL.is_digits('0123'), 'CeL.is_digits(0123)');
		assert(CeL.is_digits('1'), 'CeL.is_digits(1)');
		assert(CeL.is_digits('1654'), 'CeL.is_digits(1654)');
		assert(CeL.is_digits(13241), 'CeL.is_digits(13241)');
		assert(CeL.is_digits('0'), 'CeL.is_digits("0")');
		assert(CeL.is_digits(0), 'CeL.is_digits(0)');
		assert(!CeL.is_digits('A'), 'CeL.is_digits(A)');
		assert(!CeL.is_digits('A123'), 'CeL.is_digits(A123)');
		assert(!CeL.is_digits('ABC'), 'CeL.is_digits(ABC)');
		assert(!CeL.is_digits({}), 'CeL.is_digits({})');

		assert(CeL.is_Object({}), 'CeL.is_Object({})');
		assert(CeL.is_Object(Object.create(null)), 'CeL.is_Object(Object.create(null))');

		assert(CeL.is_Object(CeL.setup_options()), 'CeL.setup_options()');
		assert(CeL.is_Object(CeL.new_options()), 'CeL.new_options()');

		assert(CeL.is_empty_object({}), 'CeL.is_Object({})');
		assert(!CeL.is_empty_object({ a: 1 }), 'CeL.is_Object({})');

		var options = { a: 2, b: 'abc', c: function (a, b) { return a > b; } };
		assert([options, CeL.setup_options(options)], 'CeL.setup_options(options)===options #1');
		assert([JSON.stringify(options), JSON.stringify(CeL.setup_options(options))], 'CeL.setup_options(options)===options #2');

		var o1 = CeL.new_options(options), o2 = CeL.new_options(o1);
		assert(options !== o1, 'CeL.new_options(options) #1');
		assert([o1, o2], 'CeL.new_options(options) #2');
		assert([JSON.stringify(o1), JSON.stringify(o2)], 'CeL.new_options(options) #3');
		delete o1[CeL.new_options.new_key];
		assert([JSON.stringify(options), JSON.stringify(o1)], 'CeL.new_options(options) #4');
		// 可以用 delete options[library_namespace.new_options.new_key] 的方法強迫造出新的 options。
		o2 = CeL.new_options(o1);
		assert(o1 !== o2, 'CeL.new_options(options) #5');

		o1 = { r: 3, w: '22' };
		o2 = CeL.new_options(o1, options);
		delete o2[CeL.new_options.new_key];
		Object.assign(o1, options);
		assert(o2 !== o1, 'CeL.new_options(options) #6');
		assert([JSON.stringify(o2), JSON.stringify(o1)], 'CeL.new_options(options) #7');
	});

	all_error_count += CeL.test('dependency_chain', function (assert) {
		var dc = new CeL.dependency_chain;
		dc.add(1, 2);
		assert(['1', Array.from(dc.get(2).previous.values()).join()]);
		dc.add(2, 3);
		assert(['2', Array.from(dc.get(3).previous.values()).join()]);
		assert([1, dc.independent(3)]);
		assert(['', Array.from(dc.get(3).next.values()).join()]);
		assert(['1,2,3', Array.from(dc.get()).sort().join()]);
		assert([1, dc.independent()]);
		dc.add(0, 1);
		assert([0, dc.independent()]);
		dc['delete'](0);
		assert([1, dc.independent()]);
	});
}

function test_compatibility() {

	all_error_count += CeL.test('Set, Map, Array.from()', function (assert) {
		var a = [1, 2, 3, 1],
			s = new Set(a),
			e = s.entries(),
			v = s.values(),
			m = new Map([
				[5, 1],
				[7, 1],
				[5, 2],
				[3, 1]
			]);
		// CeL.set_debug(6);
		assert(e.next().value.join() === "1,1", 'set.entries().value');
		assert(e.next().value.join() === "2,2", 'set.entries().value');
		assert(e.next().value.join() === "3,3", 'set.entries().value');
		assert(e.next().done, 'set.entries().done');
		assert(v.next().value === 1, 'set.values().value');
		assert(v.next().value === 2, 'set.values().value');
		assert(v.next().value === 3, 'set.values().value');
		assert(v.next().done, 'set.values().done');

		v = s.values();
		assert(v.next().value === 1, 'set.values().value');
		assert(v.next().value === 2, 'set.values().value');
		assert(v.next().value === 3, 'set.values().value');

		s.add(4);
		if (v.next().value !== 4)
			CeL.error('test_compatibility: iterator 無法反映 Set 之更動！但此項為執行平臺環境問題，將不被視作 fatal error。');
		assert(v.next().done, 'set.values().done');

		e = a.entries();
		assert(e.next().value.join() === "0,1", 'array.entries().value');
		assert(e.next().value.join() === "1,2", 'array.entries().value');
		assert(e.next().value.join() === "2,3", 'array.entries().value');
		assert(e.next().value.join() === "3,1", 'array.entries().value');
		assert(e.next().done, 'array.entries().done');

		e = m.entries();
		assert(e.next().value.join() === "5,2", 'map.entries().value');
		assert(e.next().value.join() === "7,1", 'map.entries().value');
		assert(e.next().value.join() === "3,1", 'map.entries().value');
		assert(e.next().done, 'map.entries().done');

		v = m.keys();
		assert(v.next().value === 5, 'map.keys().value');
		assert(v.next().value === 7, 'map.keys().value');
		assert(v.next().value === 3, 'map.keys().value');
		assert(v.next().done, 'map.keys().done');

		v = m.values();
		assert(v.next().value === 2, 'map.values().value');
		assert(v.next().value === 1, 'map.values().value');
		assert(v.next().value === 1, 'map.values().value');
		assert(v.next().done, 'map.values().done');

		//{String}string
		//string.split('')
		//Object(string)
		//Array.from(string)
		assert([Array.from('abc').join(), "a,b,c"], 'Array.from(String)');
		assert([Array.from(5).join(), ""], 'Array.from(Number)');
		assert([Array.from(true).join(), ""], 'Array.from(Boolean)');
		assert([Array.from(a).join(), "1,2,3,1"], 'Array.from(Array)');
		assert([Array.from(a.entries()).join(';'), "0,1;1,2;2,3;3,1"],
			'Array.from(array.entries())');
		assert([Array.from({
			length: 4
		}, function (v, i) {
			return i * i;
		}).join(), "0,1,4,9"], 'Array.from({length:\d})');
		assert([Array.from(s).join(), "1,2,3,4"], 'Array.from(Set)');
		assert([Array.from(m).join(), "5,2,7,1,3,1"], 'Array.from(Map)');
		assert([Array.from(m.keys()).join(), "5,7,3"], 'Array.from(map.keys())');

		/*
		a=[1,[2,[3,4],5],6];
		a[7]='t';
		assert([ "1;2,3,4,5;6;;;;;t", a.join(';') ], 'array.join()');
		assert([ "1;2;3,4;5;6;t", a.flat().join(';') ], 'array.flat()');
		assert([ "1;2,3,4,5;6;t", a.flat(0).join(';') ], 'array.flat(0)');
		assert([ "1;2;3,4;5;6;t", a.flat(1).join(';') ], 'array.flat(1)');
		assert([ "1;2;3;4;5;6;t", a.flat(2).join(';') ], 'array.flat(2)');
		assert([ "2;2,3,4,51;7;t1", a.flatMap(function(i){return i+1;}).join(';') ], 'array.flatMap()');
		assert([ "1;2,3,4,5;6;t", a.flatMap(function(i){return i+'';}).join(';') ], 'array.flatMap()');
		*/

	});

	// ----------------------------------------------------

	all_error_count += CeL.test('Math.clz32()', function (assert) {
		var BITS = 32;
		assert([BITS, Math.clz32(0)], 'Math.clz32(0) === 32');
		for (var i = BITS, test_number_in_2 = '1'; --i;) {
			assert([i, Math.clz32(parseInt(test_number_in_2, 2))], i + ': ' + test_number_in_2);
			test_number_in_2 = test_number_in_2.replace(new RegExp('^.{1,' + (1 + (test_number_in_2.length * Math.random()) | 0) + '}'), function ($) {
				return $ + (Math.random() < .5 ? 0 : 1)
			});
		}
	});

	all_error_count += CeL.test('String.prototype.split()', [
		[['11,22'.split(/,/).join(';'), '11;22']],
		[['11,'.split(/,/).join(';'), '11;']],
		[[',22'.split(/,/).join(';'), ';22']],
		[['11,22'.split(/,?/).join(';'), '1;1;2;2']],
		[['11,'.split(/,?/).join(';'), '1;1;']],
		[[',22'.split(/,?/).join(';'), ';2;2']],
		[[',,2'.split(/,?/).join(';'), ';;2']],
		[['1'.split(/(,)?/).join(';'), '1']],
		[['11,22'.split(/(,)?/).join(';'), '1;;1;,;2;;2']],
		[['11,'.split(/(,)?/).join(';'), '1;;1;,;']],
		[[',22'.split(/(,)?/).join(';'), ';,;2;;2']],
		[[',,2'.split(/(,)?/).join(';'), ';,;;,;2']],
		[['ab'.split(new RegExp('(?:ab)*')).join(';'), ';']],
		[['.'.split(/(.?)(.?)/).join(';'), ';.;;']],
		[['tesst'.split(new RegExp('(s)*')).join(';'), 't;;e;s;t']],
		[['test'.split(/(?:)/, -1).join(';'), 't;e;s;t']],
		[[''.split(/.?/).length, 0]],
		[['.'.split(/()()/).join(';'), '.']],
		[['dfg_dfg__shge'.split(/(_+)/).join(';'), 'dfg;_;dfg;__;shge']],
		[['.'.split(/(.?)(.?)/).join(';'), ';.;;']],
		// [ "aa", "__", "_", "bb", "___", "_", "cc" ]
		[['aa__bb___cc'.split(/((_)+)/).join(';'), 'aa;__;_;bb;___;_;cc']],
		// [ "a", "", undefined, "a", "__", "_", "b", "", undefined, "b", "___", "_", "c", "", undefined, "c" ]
		[['aa__bb___cc'.split(/((_)*)/).join(';'), 'a;;;a;__;_;b;;;b;___;_;c;;;c']],
		[['ab'.split(/a*?/).join(';'), 'a;b']],
		[['ab'.split(new RegExp('a*')).join(';'), ';b']],
		[["A<B>bold</B>and<CODE>coded</CODE>".split(/<(\/)?([^<>]+)>/).join(';'), "A;;B;bold;/;B;and;;CODE;coded;/;CODE;"]],
		[['..Word1 Word2..'.split(/([a-z]+)(\d+)/i).join(';'), "..;Word;1; ;Word;2;.."]],
	]);

	// sample to test:
	all_error_count += CeL.test('library base functions', [
		[['js.js', CeL.simplify_path('./aaa///./../js.js')], 'simplify_path #1-1'],
		[['js.js', CeL.simplify_path('./aaa/../js.js')], 'simplify_path #1-2'],
		[['js.js', CeL.simplify_path('aaa/../js.js')], 'simplify_path #1-3'],
		[['js.js', CeL.simplify_path("aaa/bbbb/../../js.js")], 'simplify_path #1-4'],
		[['a/b', CeL.simplify_path('./a/b')], 'simplify_path #1-5'],
		[['a/b/', CeL.simplify_path('./a/b/')], 'simplify_path #1-6'],
		[['../a/b', CeL.simplify_path('../a/b')], 'simplify_path #1-7'],
		[['../a/b/', CeL.simplify_path('../a/b/')], 'simplify_path #1-8'],
		[['b', CeL.simplify_path('a/../b')], 'simplify_path #1-9'],
		[['a/b', CeL.simplify_path('a/./b')], 'simplify_path #1-10'],
		[['/a/b', CeL.simplify_path('/../a/b')], 'simplify_path #1-11'],
		[['/a/b', CeL.simplify_path('/./a/b')], 'simplify_path #1-12'],
		[['/a/b', CeL.simplify_path('/a/./b')], 'simplify_path #1-13'],
		[['/b', CeL.simplify_path('/a/../b')], 'simplify_path #1-14'],
		[['/b', CeL.simplify_path('/a/../../../b')], 'simplify_path #1-15'],
		[['/a', CeL.simplify_path('/a/b/..')], 'simplify_path #1-16'],
		[['/a/', CeL.simplify_path('/a/b/../')], 'simplify_path #1-17'],
		[['a', CeL.simplify_path('a/b/..')], 'simplify_path #1-18'],
		[['a/', CeL.simplify_path('a/b/../')], 'simplify_path #1-19'],
		[['.', CeL.simplify_path('a/..')], 'simplify_path #1-20'],
		[['./', CeL.simplify_path('a/../')], 'simplify_path #1-21'],
		[['../c', CeL.simplify_path('./a/b/../../../a.b/../c')], 'simplify_path #1-21'],
		[['../../../c', CeL.simplify_path('../../../a.b/../c')], 'simplify_path #1-22'],
		[['/a/b/js.js', CeL.simplify_path('/a//c///../b////js.js')], 'simplify_path #1-23'],
		[['/a/b/js.js', CeL.simplify_path('/a/b/js.js')], 'simplify_path #1-24'],
		[['../../js.js', CeL.simplify_path("aa/../b/..//../c///../../js.js")], 'simplify_path #1-25'],
		[['/js.js', CeL.simplify_path("/../../js.js")], 'simplify_path #1-26'],
		[['a/b/', CeL.simplify_path('a/b/.//')], 'simplify_path #1-27'],
		[['a/b', CeL.simplify_path('a/b/.')], 'simplify_path #1-28'],
		[['c:\\aa\\bb\\js.js', CeL.simplify_path('c:\\aa\\bb\\js.js')], 'simplify_path #3-1'],
		[['c:\\aa\\bb\\js.js', CeL.simplify_path('c:\\aa\\cc\\..\\\\bb\\js.js')], 'simplify_path #3-2'],
		[['https://github.com/kanasimi/CeJS', CeL.simplify_path('https://github.com/kanasimi/CeJS')], 'simplify_path http://-1'],
		[['https://github.com/kanasimi/CeJS', CeL.simplify_path('https://github.com/kanasimi/a/../CeJS')], 'simplify_path http://-2'],
		[['https://github.com/kanasimi/CeJS', CeL.simplify_path('https://github.com/kanasimi/a/b/../../CeJS')], 'simplify_path http://-3'],
		[['https://github.com/kanasimi/http://CeJS', CeL.simplify_path('https://github.com/kanasimi/http://a/b/../../CeJS')], 'simplify_path http://-4'],
		[['/p/a/http://d.o/p/a', CeL.simplify_path('/p/a/http://d.o/p/a')], 'simplify_path /http://#1'],
		[['/p/a/http://d.o/p/a', CeL.simplify_path('/p/a/http://d.o//p/a')], 'simplify_path /http://#2'],
		[['https://d.o/p/a/http://d.o/p/a', CeL.simplify_path('https://d.o/p/a/http://d.o/p/a')], 'simplify_path /http://#3'],
		[['https://d.o/p/a/http://d.o/p/a/', CeL.simplify_path('https://d.o//p/a/http://d.o//p//a/')], 'simplify_path /http://#4'],
	]);

	all_error_count += CeL.test('compatibility', [
		[[NaN, NaN], 'Object.is(NaN,NaN)'],

		[[/./ig.flags, 'gi'], '/./ig.flags'],
		[[5, Math.hypot(3, 4)], 'normal positive Math.hypot'],
		[[5, Math.hypot(-3, -4)], 'negative Math.hypot'],
		[[Number.MAX_VALUE, Math.hypot(3 / 5 * Number.MAX_VALUE, 4 / 5 * Number.MAX_VALUE)], 'avoid overflow'],
		[[5, Math.hypot(Number.MIN_VALUE * 3, Number.MIN_VALUE * 4) / Number.MIN_VALUE], 'avoid underflow'],

		[[Array.from('_a1b2A3B4a5cc'.matchAll(/(a)(.)/ig)).join(';'), "a1,a,1;A3,A,3;a5,a,5"], 'String.prototype.matchAll(/ /g)'],
		[[Array.from('_a1b2A3B4a5cc'.matchAll(/(a)(.)/i)).join(';'), "a1,a,1"], 'String.prototype.matchAll(/ /)'],
		[[Array.from('_a1b2A3B4a5cc'.matchAll(/(a)(a)/i)).join(';'), ""], 'String.prototype.matchAll(/ /) NOT matched'],
		[[Array.from('_a1b2A3B4a5cc'.matchAll('aa')).join(';'), ""], 'String.prototype.matchAll("") NOT matched'],
		[[Array.from('_a1b2A1B4a1cc'.matchAll('a1')).join(';'), "a1;a1"], 'String.prototype.matchAll("")'],

	]);

}


//============================================================================================================================================================


function test_native() {
	all_error_count += CeL.test('CeL.RegExp()', [
		[CeL.RegExp(/T/i).test('t')],
		[CeL.RegExp(/T/, 'i').test('t')],
		[CeL.RegExp('T', 'i').test('t')],
		[CeL.RegExp(/[\p{C}]/, 'iu').test('\u200E')],
		[CeL.RegExp(/[\p{C}]/, 'iu').test('\u200Et')],
		[!CeL.RegExp(/[\p{C}]/, 'iu').test('t')],
	]);

	all_error_count += CeL.test('pad(): basic test', [
		[[CeL.pad(23, 5), '00023']],
		[[''.pad(5), '     '], 'pad(): empty string'],

		[['sa'.pad(5), '   sa']],
		[['23'.pad(5), '00023']],
		[['2347823'.pad(5), '2347823']],
		[['23'.pad(4, 's', 1), '23ss']],
	]);

	all_error_count += CeL.test('pad(): character.length > 1', [
		[['23'.pad(6, '01'), '010123']],
		[['23'.pad(6, '012'), '012023']],
		[['2347823'.pad(5, '01'), '2347823']],
		[['23'.pad(6, '12', 1), '231212']],
	]);

	all_error_count += CeL.test('between(): character.length > 1', [
		[['0123456789123456789'.between('567', '345'), '8912']],
		[['0123456789123456789'.between('567', '89'), '']],
		[['0123456789123456789'.between('54'), '']],
		[[CeL.get_intermediate('0123456789123456789', '54'), undefined]],
		[['0123456789123456789'.between('567'), '89123456789']],
		[['0123456789123456789'.between(null, '345'), '012']],
		[['[[1,2],[3,4]]'.between('[', { tail: ']' }), '[1,2],[3,4]'], '可以用 {tail:"~"} 來從結尾搜尋。from tail'],

		[['124|523', '1<b>124</b>42<b>523</b>'.all_between('<b>', '</b>').join('|'), '.all_between()']],
	]);

	all_error_count += CeL.test('檢驗 find_between()', function (assert) {
		var html = '<p></p><h2>title1</h2>abc<h2>title2</h2>\nABC<h2>title3</h2>ABC\n<h2>title4</h2>\nABC\n<h2>title5</h2>',
			// matched token
			get_next_between = html.find_between('<h2>', '</h2>'), list = [], text;
		//
		while ((text = get_next_between()) !== undefined) {
			list.push(text);
		}
		// alert(list.join('|'));
		assert(['title1|title2|title3|title4|title5', list.join('|')], 'find_between');

		// ------------------------------------------------

		list = [];
		html.each_between('<h2>', '</h2>', function (token) {
			list.push('>' + token);
		});
		assert(['>title1|>title2|>title3|>title4|>title5', list.join('|')], 'each_between #1');

		html = '123_456_789_012';
		list = [];
		html.each_between(null, '_', function (token) {
			list.push(token);
		});
		assert(['123|456|789', list.join('|')], 'each_between: null header');

		list = [];
		html.each_between('_', null, function (token) {
			list.push(token);
		});
		assert(['456|789|012', list.join('|')], 'each_between: null footer');

		// ------------------------------------------------

		/**
		 * <code>
		2017/1/3 7:20:16
		RegExp.exec vs. String.indexOf
		https://jsperf.com/exec-vs-match-vs-test-vs-search/5
		</code>
		 */

		function test_find_between(html) {
			var get_next_between = html.find_between(' href="', '"'), list = [], text;
			while ((text = get_next_between()) !== undefined) {
				list.push(text);
			}
			return list;
		}

		function test_exec(html) {
			var list = [], matched, pattern = / href="([^"]+)"/g;
			// pattern = / href="(.*?)"/g;
			while (matched = pattern.exec(html)) {
				list.push(matched[1]);
			}
			return list;
		}

		CeL.run('data.native');
		var html = [];
		for (var i = 0; i < 1e4; i++) {
			html.push('<li><a href="' + i + '.htm">' + i + '<\/a><\/li>');
		}
		html = html.join('\n');

		assert([test_exec(html).join(','), test_find_between(html).join(',')], 'test_find_between');

		return;

		console.time('test_find_between');
		for (var i = 0; i < 200; i++)
			test_find_between(html);
		console.timeEnd('test_find_between');
		// test_find_between: 2614.73ms

		console.time('test_exec');
		for (var i = 0; i < 200; i++)
			test_exec(html);
		console.timeEnd('test_exec');
		// test_exec: 4351.75ms
	});

	if (false) {
		// TODO
		var a = new SubUint32Array(8, 7, 4), b = new Uint32Array(4);
		a[6] = 3;
		a[7] = 5;
		a[8] = 4;
		CeL.assert((a instanceof SubUint32Array) && (a instanceof Uint32Array),
			'SubUint32Array');
		CeL.assert(!a[8] && a[6] === 3 && a.length === 8 && a.last() === 5
			&& !b.last, 'SubUint32Array');
	}

	all_error_count += CeL.test('檢驗 search_sorted_Array() 準確度。', function (assert) {
		[0, 1, 2, 3, 4, 8, 10, 127, 128, 129, 1023, 1024, 1025].forEach(function (
			amount) {
			CeL.debug('test ' + amount, 3);
			var array = this.array, i = array.length, test;
			// 擴增 array。
			array.length = amount;
			for (; i < amount; i++)
				// array = [ 0, 2, 4, 6, 8, .. ]
				array[i] = i << 1;

			if (amount > 0)
				amount--;
			// amount: array 之最大值。
			for (i = 0, amount <<= 1; i < 2 + amount; i++) {
				assert([(i > amount ? amount : i) >> 1,
				CeL.search_sorted_Array(array, i, {
					found: true
				})], 'search_sorted_Array(Array[ 0 - ' + (amount >> 1)
				+ ' ], ' + i + ') = ' + CeL.search_sorted_Array(array, i, {
					found: true
				}) + ' !== ' + (i > amount ? amount : i) >> 1);
			}
		}, {
			array: []
		});
	});

	all_error_count += CeL.test('search_sorted_Array()', [
		[[1, CeL.search_sorted_Array([0, 2, 4], 3, { found: true })]],
		[['r', [4, 7, 12].search_sorted(8, { found: ['f', 'r', 'e'] })]],
		[[undefined, [4, 7, 12].search_sorted(8, { found: ['f', 'r', 'e'], /* 以便未找到時回傳 undefined. */ near: [] })]],
		// 處理搜尋 {RegExp} 的情況:　此時回傳最後一個匹配的 index。欲找首次出現，請用 first_matched()。
		[[7, '0abcd,1abc,2abc,3ab,4ab,5ab,6a,7a'.split(',').search_sorted(/a/)], '處理搜尋 {RegExp} 的情況#1-1'],
		[[5, '0abcd,1abc,2abc,3ab,4ab,5ab,6a,7a'.split(',').search_sorted(/b/)], '處理搜尋 {RegExp} 的情況#1-2'],
		[[2, '0abcd,1abc,2abc,3ab,4ab,5ab,6a,7a'.split(',').search_sorted(/c/)], '處理搜尋 {RegExp} 的情況#1-3'],
		[[0, '0abcd,1abc,2abc,3ab,4ab,5ab,6a,7a'.split(',').search_sorted(/d/)], '處理搜尋 {RegExp} 的情況#1-4'],
		[[-1, '0abcd,1abc,2abc,3ab,4ab,5ab,6a,7a'.split(',').search_sorted(/e/)], '處理搜尋 {RegExp} 的情況#1-5'],
	]);

	all_error_count += CeL.test('data.native misc', function (assert) {
		assert([49, (49.4).to_fixed(0)], 'to_fixed() #1');
		assert([50, (49.5).to_fixed(0)], 'to_fixed() #2');
		assert([49.5, (49.5).to_fixed(1)], 'to_fixed() #3');
		assert([49.6, (49.58).to_fixed(1)], 'to_fixed() #4');
		assert([49, (49).to_fixed(3)], 'to_fixed() #5');
		assert([49.7, (49.685).to_fixed(1)], 'to_fixed() #6');
		assert([0.3, (0.2 + 0.1).to_fixed(3)], 'to_fixed() #7');
		assert([0.3, (0.2 + 0.1).to_fixed()], 'to_fixed() #8');
		assert([0.667, (2 / 3).to_fixed(3)], 'to_fixed() #9');
		// or using +CeL.math.normalize_mixed_fraction(3*1.6)
		assert([4.8, (3 * 1.6).to_fixed()], 'to_fixed() #10');
		assert([0.8, (2.4 / 3).to_fixed()], 'to_fixed() #11');

		assert(['Abc Def', 'abc def'.toTitleCase()], 'toTitleCase() #1');
		assert(['Abc DefG', 'abc defG'.toTitleCase()], 'toTitleCase() #2');
		assert(['Abc Defg', 'abc defG'.toTitleCase(true)], 'toTitleCase() #3');

		assert(['', [].unique().join('|')], '.unique() #1');
		assert(['5|4|9|6|2|a|55', [5, 4, 9, 6, 2, 4, 6, 'a', 5, 55, 2, 5, 'a'].unique().join('|')], '.unique() #2');
		assert(['5|4|9|6|2|a|55|2', [5, 4, 9, 6, '2', 4, 6, 'a', 5, 55, 2, 5, 'a'].unique().join('|')], '.unique() #3');
		assert(['5|4|9|6|2|aa|a', '5,4,9,6,2,4,6,5,aa,9,a'.split(',').unique().join('|')], '.unique() #4');
		assert(['4|3|NaN|2|5', [4, 3, NaN, 2, 5, 4, NaN, 2, 5].unique().join('|')], '.unique() #5');
		assert(['3|4|6|7|8|9|56|79|a34|a6', '3,4,6,7,7,8,9,9,9,56,56,79,79,a34,a34,a6'.split(',').unique_sorted().join('|')], '.unique_sorted() #1');
		assert(['2|3|4|5', [3, 4, 2, 2, 5, 4, 3].sort().unique_sorted().join('|')], '.unique_sorted() #2');
		assert([false, [].cardinal_1()], '.cardinal_1() #1');
		assert([true, [1].cardinal_1()], '.cardinal_1() #2');
		assert([true, [undefined, undefined, undefined].cardinal_1()], '.cardinal_1() #3');
		assert([true, [false, false, false].cardinal_1()], '.cardinal_1() #4');
		assert([true, [NaN, NaN, NaN, NaN].cardinal_1()], '.cardinal_1() #5');
		assert([true, [2, 2, 2, 2].cardinal_1()], '.cardinal_1() #6');
		assert([false, [2, 3, 2, 2, 2].cardinal_1()], '.cardinal_1() #7');
		assert([false, [3, 2, 2, 2, 2].cardinal_1()], '.cardinal_1() #8');
		assert([false, [2, '2', 2, 2, 2, 2].cardinal_1()], '.cardinal_1() #9');

		// 找最後一個匹配的 index。
		// @see above: '處理搜尋 {RegExp} 的情況'
		assert([2, 'aaa'.split('').first_matched(/a/, true)], 'first_matched(get_last_matched) 0');
		assert([6, '0abcd,1abc,2abc,3ab,4ab,5ab,6a,7'.split(',').first_matched(/a/, true)], 'first_matched(get_last_matched) #0');
		assert([7, '0abcd,1abc,2abc,3ab,4ab,5ab,6a,7a'.split(',').first_matched(/a/, true)], 'first_matched(get_last_matched) #1');
		assert([5, '0abcd,1abc,2abc,3ab,4ab,5ab,6a,7a'.split(',').first_matched(/b/, true)], 'first_matched(get_last_matched) #2');
		assert([2, '0abcd,1abc,2abc,3ab,4ab,5ab,6a,7a'.split(',').first_matched(/c/, true)], 'first_matched(get_last_matched) #3');
		assert([0, '0abcd,1abc,2abc,3ab,4ab,5ab,6a,7a'.split(',').first_matched(/d/, true)], 'first_matched(get_last_matched) #4');
		assert([-1, '0abcd,1abc,2abc,3ab,4ab,5ab,6a,7a'.split(',').first_matched(/e/, true)], 'first_matched(get_last_matched) #5');
		// 找首次匹配的 index。
		assert([0, '0a,1ab,2ab,3ab,4abc,5abc,6abc,7abcd'.split(',').first_matched(/a/)], 'first_matched() #1');
		assert([1, '0a,1ab,2ab,3ab,4abc,5abc,6abc,7abcd'.split(',').first_matched(/b/)], 'first_matched() #2');
		assert([4, '0a,1ab,2ab,3ab,4abc,5abc,6abc,7abcd'.split(',').first_matched(/c/)], 'first_matched() #3');
		assert([7, '0a,1ab,2ab,3ab,4abc,5abc,6abc,7abcd'.split(',').first_matched(/d/)], 'first_matched() #4');
		assert([-1, '0a,1ab,2ab,3ab,4abc,5abc,6abc,7abcd'.split(',').first_matched(/e/)], 'first_matched() #5');
		assert([1, '0a,1ab,2ab,3ab,4abc,5abc,6abc,7abcd'.split(',').first_matched('b')], 'first_matched() #6');
		assert([7, '0a,1ab,2ab,3ab,4abc,5abc,6abc,7abcd'.split(',').first_matched('d')], 'first_matched() #7');
		assert([0, '0a,1ab,2ab,3ab,4abc,5abc,6abc,7abcd'.split(',').first_matched(function (v) { return v.includes('a'); })], 'first_matched() #8');

		assert(['2,8', Array.intersection([2, 3, 5, 6, 8], [1, 2, 4, 8, 9], true).join(',')], 'Array.intersection()');
		assert(["aa ", "aa '''fff'''".remove_head_tail("'''")], 'string.remove_head_tail() #1');
		assert(["aa f'ff", "aa '''f'ff'''".remove_head_tail("'''", 0, '')], 'string.remove_head_tail() #2');
		assert(["aa b'b c'c dd ", "aa'''b'b'''c'c'''dd'''".remove_head_tail("'''", 0, ' ')], 'string.remove_head_tail() #3');
		assert(["aa", "aa[[bb[[cc]]dd]]".remove_head_tail("[[", "]]")], 'string.remove_head_tail() #4');
		assert(['[df [h [r]r] [ew] g]', '<df <h <r>r> <ew> g>'.replace_till_stable(/<([^<>]+)*>/, '[$1]')], 'string.replace_till_stable() #1');
		assert(['[a]', '{{a1{{b2}}c3}}'.replace_till_stable(/{{([^{}])[^{}]*}}/, '[$1]')], 'string.replace_till_stable() #2');
		// Object 可能重排。
		assert([JSON.stringify({ '1e3': 0, '5': 1, '66': 2 }), JSON.stringify(['1e3', 5, 66].to_hash())], 'Array.prototype.to_hash() #1');
		assert([JSON.stringify({ " aa": 1, "b ": 3, "e\n": 4 }), JSON.stringify([, ' aa', , 'b ', 'e\n'].to_hash())], 'Array.prototype.to_hash() #2');

		assert(['a,\u0300,\uD801\uDC01,\u0301,\n,字,\uD801\uDC04,\u0304', 'a\u0300\uD801\uDC01\u0301\n字\uD801\uDC04\u0304'.chars().join(',')], 'split_by_code_point() #1');
		assert(['a\u0300,\uD801\uDC01\u0301,\n,字,\uD801\uDC04\u0304', 'a\u0300\uD801\uDC01\u0301\n字\uD801\uDC04\u0304'.chars(true).join(',')], 'split_by_code_point() #2');

		assert(['abc123!@#'.length, 'abc123!@#'.display_width()], 'display_width() #1');
		assert(['黑白字翻訳翻译写'.length * 2, '黑白字翻訳翻译写'.display_width()], 'display_width() #2');
		assert(['_<>Pf'.length + '石墨대한민국'.length * 2, '_<石墨>P대한민국f'.display_width()], 'display_width() #3');
		assert(['Title:title' + CeL.env.line_separator + '    →1234', CeL.display_align({ 'Title:': 'title', '→': 1234 })], 'display_align() #4');

		// ----------------------------------------------------------------------------------------

		var KEY_reference = '__REF__', a = [1, 2, 'REF_|1', 'REF_|2'], b = {
			_a: 'REF_|1',
			_b: 'REF_|2',
			a: a,
			c: 'REF_|0',
			d: 'REF_|1',
			e: 321
		};
		a.push(a, b, 'REF_|0', 'REF_|1');
		b.b = b;
		/*
		console.log('> ' + JSON.stringify_circular(a));
		console.log(JSON.parse_circular(JSON.stringify_circular(a)));
		console.log('>>> '
				+ JSON.stringify_circular(JSON.parse_circular(JSON
						.stringify_circular(a))));
		*/
		assert([JSON.stringify_circular(a), JSON.stringify_circular(JSON
			.parse_circular(JSON.stringify_circular(a)))], 'JSON.stringify_circular(a)');

		/*
		console.log('> ' + JSON.stringify_circular(b));
		console.log(JSON.parse_circular(JSON.stringify_circular(b)));
		console.log('>>> '
				+ JSON.stringify_circular(JSON.parse_circular(JSON
						.stringify_circular(b))));
		*/
		assert([JSON.stringify_circular(b), JSON.stringify_circular(JSON
			.parse_circular(JSON.stringify_circular(b)))], 'JSON.stringify_circular(b)');

		var c = JSON.parse_circular(JSON.stringify_circular(b));
		assert([c.a[4], c.a], 'JSON.parse_circular(): c.a');
		assert([c.a[5], c.b], 'JSON.parse_circular(): c.b');

	});

	all_error_count += CeL.test('edit distance & LCS', function (assert) {
		assert([17, 'correction systems'.edit_distance('spell checkers, correction system')], 'edit_distance() #1');
		assert([9, 'Levenshtein distance'.edit_distance('edit distance')], 'edit_distance() #2');
		assert([7, 'spell check'.edit_distance('Spell Check Tool')], 'edit_distance() #3');

		assert(['abcd', CeL.LCS('a1b2c3d', '1a2b3c4d')], 'LCS() #1');
		assert(['abcd', String(CeL.LCS('a1b2c3d', '1a2b3c4d', 'with_diff'))], 'LCS() #2');
		assert(CeL.LCS('a1b2c3d', '1a2b3c4d', 'with_diff').diff.join(';').includes(',1;1,2;2,3;3,4'), 'LCS() #3');
		assert(CeL.LCS('a1b2c3d', '1a2b3c4d', 'diff').join(';').includes(',1;1,2;2,3;3,4'), 'LCS() #4');

		assert(['AC'.length, CeL.LCS_length('AGCAT', 'GAC')], 'LCS_length() #1');
		assert(['abc', CeL.LCS('a1b2c3', '1a2b3c')], 'LCS() #5');
		assert(['abc'.length, CeL.LCS_length('a1b2c3', '1a2b3c')], 'LCS_length() #2');
		assert(['abc.txt', CeL.LCS('a b c.txt', 'abc(1).txt')], 'LCS() #6');
		assert(['a_.', CeL.LCS('a_b.', 'ab_.')], 'LCS() #7');
		assert(['ab', CeL.LCS('ab12', 'abc')], 'LCS() #8');
		assert(['abc', CeL.LCS('abc123', 'abcd')], 'LCS() #9');
		assert(['abc', CeL.LCS('abcd', 'abc123')], 'LCS() #10');
		assert(['abc', CeL.LCS('123abc', 'abcd')], 'LCS() #11');
		assert(['abc', CeL.LCS('abcd', '123abc')], 'LCS() #12');
		assert(['abc', CeL.LCS('abc123', '123abc')], 'LCS() #13');
		assert(['abc'.length, CeL.LCS_length('abc123', '123abc')], 'LCS_length() #14');
		assert(['abc,123', CeL.LCS('abc123', '123abc', 'all').join()], 'LCS() #15');
		assert(['abd', CeL.LCS('ab1d', 'abrcd')], 'LCS() #16');
		assert(['1,rc', CeL.LCS('ab1d', 'abrcd', 'diff').join(';')], 'LCS() #17');
		assert(['abc,def', CeL.LCS('abc123', 'def123', 'diff').join(';')], 'LCS() #18');
		assert(['a,b', CeL.LCS('a0', 'b0', 'diff').join(';')], 'LCS() #19');
		assert(['a,b;_,*', CeL.LCS('a0_', 'b0*', 'diff').join(';')], 'LCS() #20');
		assert(['abc,def', CeL.LCS('123abc', '123def', 'diff').join(';')], 'LCS() #21');
		assert(['a,b', CeL.LCS('0a', '0b', 'diff').join(';')], 'LCS() #22');
		assert(['a,b', CeL.LCS('0a1', '0b1', 'diff').join(';')], 'LCS() #23');
		assert([',b0;a,', CeL.LCS('0a', 'b00', 'diff').join(';')], 'LCS() #24');

		assert(['ccdd,ffee', 'aabb\nbbcc\nccdd'.diff_with('bbcc\nffee\naabb').join(',')], '.diff_with()');

		assert([4, CeL.longest_common_starting_length(['1234', '1234'])], 'longest_common_starting_length() #1');
		assert([3, CeL.longest_common_starting_length(['123', '123', '123'])], 'longest_common_starting_length() #2');
		assert([3, CeL.longest_common_starting_length(['123', '1234', '123'])], 'longest_common_starting_length() #3');
		assert([0, CeL.longest_common_starting_length(['', ''])], 'longest_common_starting_length() #4');
		assert([0, CeL.longest_common_starting_length(['', '', ''])], 'longest_common_starting_length() #5');
		assert([0, CeL.longest_common_starting_length(['123', '', ''])], 'longest_common_starting_length() #6');
		assert([0, CeL.longest_common_starting_length(['', '', '123'])], 'longest_common_starting_length() #7');
		assert([0, CeL.longest_common_starting_length(['', '', '123'])], 'longest_common_starting_length() #8');
		assert([0, CeL.longest_common_starting_length(['123', '123', ''])], 'longest_common_starting_length() #9');
		assert([0, CeL.longest_common_starting_length(['', '', '123'])], 'longest_common_starting_length() #10');
		assert([2, CeL.longest_common_starting_length(['123', '124', '125'])], 'longest_common_starting_length() #11');
		assert([1, CeL.longest_common_starting_length(['123', '124', '100'])], 'longest_common_starting_length() #12');
		assert([3, CeL.longest_common_starting_length(['1234', '123', '123'])], 'longest_common_starting_length() #13');
	});

}


//============================================================================================================================================================


function test_console() {
	// CeL.set_debug(3);
	var SGR = CeL.interact.console.SGR, CSI = SGR.CSI;
	// reset CSI to readable style.
	SGR.CSI = '*[';
	SGR.add_color_alias('黑紅綠黃藍紫青白'.split(''));

	var text = '0123456789', ansi = new SGR(text);

	all_error_count += CeL.test('SGR basic', [
		[[text, ansi.text]],
	]);

	node_info('Test SGR: set style {Object}');
	ansi.style_at(3, {
		bold: true,
		fg: 32,
		// blue background : 44
		bg: 'blue'
	});

	all_error_count += CeL.test('SGR @ 3', [
		[[2, ansi.style_at(3, true).foreground]],
		[['1;32;44', ansi.style_at(3, true).toString(false)]],
		[[undefined, ansi.style_at(4, true)]],
		[[ansi.style_at(3).toString(false), ansi.style_at(4).toString(false)]],
	]);

	node_info('Test SGR: set style alias');
	ansi.style_at(5, 'fg=紫');

	all_error_count += CeL.test('SGR @ 5', [
		[[4, ansi.style_at(5).background]],
		[['blue', SGR.color[ansi.style_at(5).background]]],
	]);

	ansi.style_at(7, '5;-bold');
	all_error_count += CeL.test('SGR: set style multi-alias', [
		[[true, ansi.style_at(8).blink], '(8).blink'],
		[[false, ansi.style_at(9).bold], '(9).bold'],
	]);

	text = '012*[1;32;44m34*[1;35;44m56*[22;35;44;5m789';
	all_error_count += CeL.test('SGR: Test all', [
		[[text, ansi.toString()]],
		[[text, new SGR(text).toString()]],

		[['0123*[32m4567*[44m890',
			//
			(new SGR(['0123', {
				fg: '綠'
			}, '4567', {
					bg: '藍'
				}, '890'])).toString()]],

		[['(*[33m1,2*[' + SGR.style_data.foreground[1] + 'm)',
		//
		(new SGR(['(', 'fg=黃', '1,2', '-fg', ')'])).toString()]],

		[['*[31mrr*[' + SGR.style_data.foreground[1] + 'm',
		//
		(new SGR(['', 'fg=red', 'rr', '-fg'])).toString()]],
	]);

	// Not Yet Implemented!
	// ansi.to_HTML(style_mapping);

	// restore CSI.
	SGR.CSI = CSI;

	if (false) {
		// https://travis-ci.org/kanasimi/CeJS/builds/86612669#L104
		// https://ci.appveyor.com/project/kanasimi/cejs/build/27/job/xswk33cd13owcrkd#L26
		var demo = [['fg '], ['bg ']];
		new Array(8).fill(0).forEach(function (_, index) {
			demo[0].push('fg=' + index, index);
			demo[1].push('bg=' + index, index);
		});
		demo[0].push('-fg');
		demo[1].push('-bg');
		CeL.log(new SGR(demo[0]) + '\n' + new SGR(demo[1]));
	}

	//node_info('Passed: All console tests.');
}



//============================================================================================================================================================



function test_locale() {

	//	##i18n (Internationalization) / l10n (Localization)
	all_error_count += CeL.test('將 domain 別名正規化，轉為正規/標準名稱。', [
		[['cmn-Hant-TW', CeL.gettext.to_standard('zh')], 'gettext.to_standard(zh)'],
		[['cmn-Hant-TW', CeL.gettext.to_standard('tw')], 'gettext.to_standard(tw)'],
		[['cmn-Hant-TW', CeL.gettext.to_standard('zh-TW')], 'gettext.to_standard(zh-TW)'],
		[['cmn-Hans-CN', CeL.gettext.to_standard('cn')], 'gettext.to_standard(cn)'],
		[['cmn-Hans-CN', CeL.gettext.to_standard('zh-cn')], 'gettext.to_standard(zh-cn)'],
		[['ja-JP', CeL.gettext.to_standard('ja')], 'gettext.to_standard(ja)'],
		[['ja-JP', CeL.gettext.to_standard('jp')], 'gettext.to_standard(jp)'],
		[['日本語', CeL.gettext.get_alias('jp')], 'gettext.get_alias(jp)'],
	]);

	//	###usage 2014/2/5

	//	for i18n: define gettext() user domain resource location.
	//	gettext() will auto load (CeL.env.domain_location + language + '.js').
	//	e.g., resource/cmn-Hant-TW.js, resource/ja-JP.js
	CeL.env.domain_location = CeL.env.resource_directory_name + '/';
	//	declaration for gettext()
	var _;

	//	###including
	CeL.run('application.locale', function () {
		// alias for CeL.gettext, then we can use _('message').
		_ = CeL.gettext;
	});



	//	###System message test
	all_error_count += CeL.test('System message', function (assert) {
		CeL.gettext.use_domain('TW', function () {
			assert(['載入中…', CeL.gettext('Loading...')]);
			assert(['已載入 20%…', CeL.gettext('Loading %1%...', 20)]);
			//CeL.info('System message test OK.');
		},
			// 強制使用此 domain。 forces to this domain.
			true);
	});



	//	###單數複數形式 (plural) test
	all_error_count += CeL.test('單數複數形式 (plural)', function (assert) {
		// CeL.gettext.use_domain('en', function() {}, true);
		var message_id = '已載入 %1 筆資料。';
		CeL.gettext.set_text({
			'已載入 %1 筆資料。': function (domain_name, arg) {
				// with error detection:
				//return (arg[1] < 2 ? (arg[1] ? arg[1] === 1 ? 'One' : 'ERROR: %1' : 'No') + ' entry' : '%1 entries') + ' loaded.';

				// No, One & more.
				return (arg[1] < 2 ? (arg[1] ? 'One' : 'No') + ' entry' : '%1 entries') + ' loaded.';

				// More simplified:
				// arg[>>>1<<<] : from %>>>1<<<'s "1"
				//return '%1 ' + (1 < arg[1] ? 'entries' : 'entry') + ' loaded.';
			}
		}, 'en');

		CeL.gettext.use_domain('en', function () {
			assert(['No entry loaded.', CeL.gettext(message_id, 0)], '單數複數形式 (plural): 0');
			assert(['One entry loaded.', CeL.gettext(message_id, 1)], '單數複數形式 (plural): 1');
			assert(['2 entries loaded.', CeL.gettext(message_id, 2)], '單數複數形式 (plural): 2');
			assert(['3 entries loaded.', CeL.gettext(message_id, 3)], '單數複數形式 (plural): 3');
			//CeL.info('單數複數形式 (plural) test OK.');
		}, true);
	});


	all_error_count += CeL.test('直接取得特定domain的文字。', function (assert) {
		CeL.gettext.use_domain('zh-TW', function () {
			CeL.gettext.use_domain('en', function () {
				assert(['Loading...', CeL.gettext('Loading...')]);
				assert(['載入中…', CeL.gettext.in_domain('TW', 'Loading...')], '不改變預設domain，直接取得特定domain的轉換過的文字。');
			}, true);
		}, true);
	});


	//	###basic test
	CeL.gettext.use_domain('zh-TW', true);
	CeL.gettext.use_domain('zh-TW', function () {
		// callback
	}, true);

	//	設定欲轉換的文字格式。
	all_error_count += CeL.test('設定欲轉換的文字格式。', function (assert) {
		CeL.gettext.set_text({
			'%n1 smart ways to spend %c2': '%Chinese/n1個花%c2的聰明方法'
		}, 'Traditional Chinese');

		assert(['十個花新臺幣柒萬圓整的聰明方法',
			CeL.gettext('%n1 smart ways to spend %c2', 10, 70000)],
			'test it with 貨幣/currency#1');

		assert(['二十五個花新臺幣捌拾億捌萬圓整的聰明方法',
			CeL.gettext('%n1 smart ways to spend %c2', 25, 8000080000)],
			'test it with 貨幣/currency#2');

		assert(['四萬〇三十五個花新臺幣伍佰玖拾捌萬陸仟玖佰貳拾捌圓整的聰明方法',
			CeL.gettext('%n1 smart ways to spend %c2', 40035, 5986928)],
			'test it with 貨幣/currency#3');
	});


	//	###test with 貨幣
	all_error_count += CeL.test('轉換文字 with 貨幣。', function (assert) {
		CeL.gettext.conversion['smart way'] = ['no %n', '1 %n', '%d %ns'];
		// You can also use this:
		CeL.gettext.conversion['smart way'] = function (count) {
			var pattern = ['no %n', '1 %n', '%d %ns'];
			return pattern[count < pattern.length ? count : pattern.length - 1]
				.replace(/%n/, 'smart way').replace(/%d/, count);
		};

		//	then we can use:
		CeL.gettext.set_text({
			'%smart way@1 to spend %c2': '%Chinese/n1個花%c2的聰明方法'
		}, 'TW');

		CeL.gettext.use_domain('繁體中文');
		assert(['十個花新臺幣柒萬圓整的聰明方法',
			CeL.gettext('%smart way@1 to spend %c2', 10, 70000)]);
		assert(['二十五個花新臺幣捌拾億捌萬圓整的聰明方法',
			CeL.gettext('%smart way@1 to spend %c2', 25, 8000080000)]);
		assert(['四萬〇三十五個花新臺幣伍佰玖拾捌萬陸仟玖佰貳拾捌圓整的聰明方法',
			CeL.gettext('%smart way@1 to spend %c2', 40035, 5986928)]);

		CeL.gettext.use_domain('en-US', true);
		assert(['10 smart ways to spend US$70,000',
			CeL.gettext('%smart way@1 to spend %c2', 10, 70000)]);

		assert(['one thousand and fifty-four days', CeL.gettext('%n1 days', 1054)], 'written out in words');
	});


	all_error_count += CeL.test('locale', [
		[["二十世紀八十年代", CeL.gettext('%數1世紀%數2年代', 20, 80)], 'conversion:小寫中文數字'],
		[["央行上調基準利率2碼", CeL.gettext('央行上調基準利率%碼1', .005)], 'conversion:碼'],

		[["女人401枝花", CeL.gettext('女人%1|1枝花', 40)], 'index 可以 "|" 終結#1'],
		[["女人四十1枝花", CeL.gettext('女人%數1|1枝花', 40)], 'index 可以 "|" 終結#2'],
	]);


}



//============================================================================================================================================================


function test_numeral() {
	all_error_count += CeL.test('中文數字 basic', [
		[['一百兆〇八億〇八百', CeL.to_Chinese_numeral(100000800000800)], '小寫中文數字'],
		[['捌兆肆仟陸佰柒拾貳億捌仟柒佰參拾捌萬玖仟零肆拾柒', CeL.to_Chinese_numeral(8467287389047, true)], '大寫中文數字'],
		[['新臺幣肆萬參拾伍圓參角肆分貳文參', CeL.to_TWD(40035.3423)], '貨幣/currency test'],
		[[8467287389047, CeL.from_Chinese_numeral(CeL.to_Chinese_numeral(8467287389047, true))], '中文數字'],
	]);
	// 此步驟頗費時。
	if (test_level) {
		all_error_count += CeL.test('中文數字 0 to 1000', function (assert) {
			for (var natural = 0; natural <= 1000; natural++) {
				assert([natural, CeL.from_Chinese_numeral(
					//
					CeL.to_Chinese_numeral(natural, true))], '中文數字 ' + natural);
			}
		});
	}

	all_error_count += CeL.test('Roman numerals 1 to 1000000', function (assert) {
		for (var natural = 1; natural < 1e6; natural++) {
			if (natural % 10000 === 0)
				CeL.debug(natural + ': ' + CeL.to_Roman_numeral(natural, true), 2);
			assert([natural,
				CeL.from_Roman_numeral(CeL.to_Roman_numeral(natural, true))],
				'Roman numeral ' + natural);
		}
	});

	all_error_count += CeL.test('中文數字', [
		[["壬辰以來，至景初元年丁已歲，積4046，算上。", CeL.from_Chinese_numeral('壬辰以來，至景初元年丁已歲，積四千四十六，算上。')]],
		[['40179字', CeL.from_Chinese_numeral('四萬百七十九字')]],
		[[10000000000000000, CeL.from_Chinese_numeral('京')]],
		[['10000字', CeL.from_Chinese_numeral('一萬字')]],
		[['正常情況下:40379字', CeL.from_Chinese_numeral('正常情況下:四萬〇三百七十九字')]],
		[['第1234章', CeL.from_Chinese_numeral('第一二三四章')]],
		[['第123456章', CeL.from_Chinese_numeral('第一二三四五六章')]],
		[['卷 二  第一章', CeL.to_Chinese_numeral(CeL.from_Chinese_numeral('卷 二  第一章'))]],
		[[4.5, CeL.from_Chinese_numeral('2分之九')]],
		[["1974年", CeL.from_positional_Chinese_numeral('一九七四年')]],
		[["一九七四年", CeL.to_positional_Chinese_numeral('1974年')]],
		[[4022, CeL.from_positional_Chinese_numeral('〤〇〢二')], '擴充蘇州碼子'],
	]);

	all_error_count += CeL.test('貨幣/currency test', [
		[['新臺幣肆萬參拾伍圓參角肆分貳文參', CeL.to_TWD(40035.3423)], '中文貨幣/currency test'],
	]);
}



//============================================================================================================================================================


function test_math() {
	CeL.set_debug(test_debug_level);

	// ---------------------------------------------------------------------//

	// for all test:
	CeL.run('data.math.rational');
	CeL.run('data.math.quadratic');

	// ---------------------------------------------------------------------//

	CeL.run('data.math');

	all_error_count += CeL.test('Combinatorics 組合數學', function (assert) {
		assert([false, [2, 3, 5, 6, 4].is_AP()], 'is_AP(): false');
		assert([true, [5, 6, 7, 8, 9].is_AP()], 'is_AP(): true');
		assert([false, [2, 3, 5, 6, 4, 4].combines_AP()], 'combines_AP(): false');
		assert([1, [2, 3, 5, 6, 4].combines_AP()], 'combines_AP(): 1');
		assert([false, [2, 3, 5, 6, 4].combines_AP('integer', 3)], 'combines_AP(): min');
		var n = 8260569835;
		assert(n.is_permutation(3680589526), 'Permutation 排列');
		n = 1233455;
		n.for_permutation(function (permutation) {
			assert(n.is_permutation(permutation), 'Permutation 排列: ' + permutation);
		});
	});

	all_error_count += CeL.test('Basic math functions', function (assert) {
		assert([CeL.polynomial_value([3, 4, 5, 6], 2),
		3 + 4 * 2 + 5 * 2 * 2 + 6 * 2 * 2 * 2], 'polynomial value');

		var v = Math.LN2, d = CeL.data.math.mutual_division(v), q = CeL.data.math.to_rational_number(v), tmp = 25;
		assert([d.slice(0, tmp).join(','), [0, 1, 2, 3, 1, 6, 3, 1, 1, 2, 1, 1, 1, 1, 3, 10, 1, 1, 1, 2, 1, 1, 1, 1, 3, 2, 3, 1, 13, 7, 4, 1, 1, 1, 7, 2, 4, 1, 1, 2, 5, 14, 1, 10, 1, 4, 2, 18, 3, 1, 4, 1, 6, 2, 7, 3].slice(0, tmp).join(',')], '連分數序列 (continued fraction)');
		assert([q[0] / q[1], v], { name: '取得值最接近之有理數', error_rate: 1e-13 });
		if (false) {
			CeL.log(
				//
				'值	' + v + '\n序列	' + d + '\n近似值	' + q[0] + ' / ' + q[1]
				//
				+ '\n約	' + (q = q[0] / q[1]) + '\n值-近似	' + (q -= v)
				//
				+ '\n差' + (Math.abs(q = 10000 * q / v) > 1
					//
					? '萬分之' + q.to_fixed(2) + ' ( ' + q + ' / 10000 )'
					//
					: '億分之' + (q *= 10000).to_fixed(2) + ' ( ' + q + ' / 100000000 )'), 0, '近似值	' + v);
		}

		if (false) {
			var d = new Date, a = .142857, b = 1000000, i = 0, c;
			for (i = 0; i < 10000; i++)
				c = CeL.data.math.mutual_division(a);
			CeL.log(c + '\n' + gDate(new Date - d));
		}

		assert([JSON.stringify([{ a: 2, b: 4 }, { d: 1 }]),
		JSON.stringify(CeL.get_set_complement({ a: 2, b: 4 }, { d: 1 }))], 'get_set_complement() #1');
		assert([JSON.stringify([{ a: 2, b: 4 }, { d: 1 }]),
		JSON.stringify(CeL.get_set_complement({ a: 2, b: 4, c: 6 }, { c: 6, d: 1 }))], 'get_set_complement() #2');
		assert([JSON.stringify([{ a: 2 }, { d: 1 }]),
		JSON.stringify(CeL.get_set_complement({ a: 2, b: 4, c: 6 }, { b: 4, c: 6, d: 1 }))], 'get_set_complement() #3');
		assert([JSON.stringify([[2, 6], [1, 5]]),
		JSON.stringify(CeL.get_set_complement([2, 4, 6], [1, 4, 5]))], 'get_set_complement() #4');
		assert([JSON.stringify([[2], [5]]),
		JSON.stringify(CeL.get_set_complement([1, 2, 4, 6], [1, 4, 5, 6]))], 'get_set_complement() #5');

		var a = CeL.data.math.continued_fraction([1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]);
		//CeL.log(a+'\n'+a[0]/a[1]+'\n'+Math.SQRT2+'\n'+(Math.SQRT2-a[0]/a[1])+'\n'+CeL.data.math.mutual_division(a[0],a[1]));
		assert([a[0] / a[1], Math.SQRT2], { name: '取得連分數序列的數值', error_rate: Number.EPSILON });

		assert([118126, CeL.data.math.GCD(5583697894, 136671782)], 'GCD type 1: input number sequence');
		assert([1, CeL.data.math.GCD([342 * 1, 563 * 1, 3452 * 1, 5333 * 1])], 'GCD type 2: input Array #1');
		var v = 5235;
		assert([v, CeL.data.math.GCD([342 * v, 563 * v, 3452 * v, 5333 * v])], 'GCD type 2: input Array #2');
		if (CeL.env.has_bigint) {
			v = 34 * 117239;
			// 這邊的 CeL.GCD 等於這個 CeL.data.math.integer.GCD
			assert([v, CeL.data.math.GCD(BigInt(v) * BigInt('46548941561489489'), -BigInt(v) * BigInt('69585986564567654345'), v * 15348347, -v * 153786453)], 'GCD BigInt #1');
			assert([34, CeL.data.math.GCD(BigInt(v) * BigInt('148949478945654'), -BigInt(v) * BigInt('35894156451561264'), v * 235445, -v * 15646, 34 * 589415, BigInt(34) * BigInt('5690645679574563'))], 'GCD BigInt #2');
			v = BigInt(34 * 117239) * BigInt(568785);
			assert([Number(v), CeL.data.math.GCD(BigInt(v) * BigInt('94784456789734875'), -BigInt(v) * BigInt('898567843574764865685'), v * BigInt(103884839), -v * BigInt(35419844547))], 'GCD BigInt #3');
			v = BigInt(34 * 117239) * BigInt('564614564568989123645647');
			assert([v, CeL.data.math.GCD(BigInt(v) * BigInt('3490666734985649'), -BigInt(v) * BigInt('148346348367897457'), v * BigInt(64841), -v * BigInt(887413))], 'GCD BigInt #4');
			v = BigInt('906986785894578648748946545');
			assert([v, CeL.data.math.GCD(v * BigInt(2), v * BigInt(3))], 'GCD BigInt #5');
		}

		assert([CeL.data.math.LCM(69790 * 656890, 95897 * 656890), 4396335929230700], 'LCM type 1: input number sequence');
		assert([CeL.data.math.LCM([389, 4342, 5411, 442]), 155369538506], 'LCM type 2: input Array');
		var v = 6893;
		assert([CeL.data.math.LCM([389 * v, 4342 * v, 5411 * v, 442 * v]), 1070962228921858], 'LCM type 2: input Array');

		assert([CeL.data.math.LCM2(69790 * 656890, 95897 * 656890), 4396335929230700], 'LCM2 type 1: input number sequence');
		assert([CeL.data.math.LCM2([389, 4342, 5411, 442]), 155369538506], 'LCM2 type 2: input Array');
		var v = 6893;
		assert([CeL.data.math.LCM2([389 * v, 4342 * v, 5411 * v, 442 * v]), 1070962228921858], 'LCM2 type 2: input Array');

		assert(['3/8', CeL.normalize_mixed_fraction(.375).toString()], 'normalize_mixed_fraction #1');
		assert(['1+1/6', CeL.normalize_mixed_fraction([2 - 5 / 6]).toString()], 'normalize_mixed_fraction #2');
		assert(['-1-11/12', CeL.normalize_mixed_fraction([-2.75, 5, 6]).toString()], 'normalize_mixed_fraction #3');
		assert(['3+1/5', CeL.normalize_mixed_fraction([3.45, 2, -8]).toString()], 'normalize_mixed_fraction #4');
		assert(['2', CeL.normalize_mixed_fraction([2.5 - 5 / 6, 1, 3]).toString()], 'normalize_mixed_fraction #5');
		assert([4.8, +CeL.normalize_mixed_fraction(3 * 1.6)], 'normalize_mixed_fraction #6');
		assert([0.8, +CeL.normalize_mixed_fraction(2.4 / 3)], 'normalize_mixed_fraction #7');
		assert([0.3, +CeL.normalize_mixed_fraction(0.2 + 0.1)], 'normalize_mixed_fraction #8');

		assert(Number.isSafeInteger(CeL.factorial(18)), 'Number.isSafeInteger()');
		assert([CeL.data.math.factorial(18), 6402373705728000], 'factorial');
		assert([30414093201713378043612608166064768844377641568960512000000000000, CeL.data.math.factorial(50)], { name: 'factorial', error_rate: Number.EPSILON });
		assert([CeL.data.math.primorial(13), 304250263527210], 'primorial(13)');
		assert([CeL.data.math.primorial.natural(42), 304250263527210], 'primorial.natural(42)');

		var p = 20374345;
		assert([p.digits().join(','), '2,0,3,7,4,3,4,5'], '.digits()');
		assert([CeL.data.math.floor_sqrt(p * p), p], 'floor_sqrt(p^2)');
		assert([CeL.data.math.floor_sqrt(p * p - 1), p - 1], 'floor_sqrt(p^2-1)');

		assert(!!CeL.data.math.is_square(p * p), 'is_square(p^2)');
		assert(!CeL.data.math.is_square(p * p - 1), 'is_square(p^2-1)');
		assert(!!CeL.data.math.product_is_square(66472571449 * 23 * 23 * 4, 66472571449 * 4), 'product_is_square #1');
		assert(!CeL.data.math.product_is_square(66472571449 * 23 * 23 * 4, 66472571449 * 4 - 1), 'product_is_square #2');
		assert(!CeL.data.math.product_is_square(4137299 * 177534289, 4137299 * 177534289 + 1), 'product_is_square #3');
		assert(!CeL.data.math.product_is_square(4137299 * 177534289, (4137299 + 1) * 177534289), 'product_is_square #4');
		assert(!!CeL.data.math.product_is_square(639846 * 63532 * 63532, 639846 * 6342 * 6342), 'product_is_square #5');
		assert(!!CeL.data.math.product_is_square(1237 * 1237 * 1076858357, 1249 * 1249 * 1076858357), 'product_is_square #6');

		assert([p.digit_length(), String(p).length], 'count digits of integer: (' + p + ').digit_length()');
		assert([p.digit_sum(), p.digits().sum()], 'count digits of integer: (' + p + ').digit_sum()');
		assert([CeL.data.math.ceil_log(p), String(p).length], 'ceil_log(' + p + ')');
		assert([CeL.data.math.ceil_log(p, 2), p.toString(2).length], 'ceil_log(' + p + ',2)');
		assert([CeL.data.math.ceil_log(1 / p), Math.ceil(Math.log10(1 / p))], 'ceil_log(' + p + ')');
		assert([CeL.data.math.ceil_log(1 / p, 2), Math.ceil(Math.log(1 / p) / Math.log(2))], 'ceil_log(' + p + ',2)');
		p = 1e12;
		assert([p.digit_length(), String(p).length], 'count digits of integer: (' + p + ').digit_length()');
		assert([CeL.data.math.ceil_log(p), Math.ceil(Math.log10(p))], 'ceil_log(' + p + ')');
		assert([CeL.data.math.ceil_log(p, 2), Math.ceil(Math.log(p) / Math.log(2))], 'ceil_log(' + p + ',2)');
		assert([CeL.data.math.ceil_log(p), 12], 'ceil_log(' + p + ')');
		assert([CeL.data.math.ceil_log(p, 2), p.toString(2).length], 'ceil_log(' + p + ',2)');
		p = 1e-12;
		assert([CeL.data.math.ceil_log(p), Math.ceil(Math.log10(p))], 'ceil_log(' + p + ')');
		assert([CeL.data.math.ceil_log(p, 2), Math.ceil(Math.log(p) / Math.log(2))], 'ceil_log(' + p + ',2)');
		assert([Math.log10(p), -12], 'Math.log10(' + p + ')');
		assert([CeL.data.math.ceil_log(p), -12], 'ceil_log(' + p + ')');

		if (test_level)
			assert([CeL.data.math.prime(490998), 7226371], 'prime');

		assert([CeL.data.math.guess_exponent(Math.pow(2 / 3, 1 / 1)).join(','), '2,3,1,1'], '猜測一個數可能的次方數');


		assert([Math.pow(CeL.secant_method(function (x) { return x * x; }, 3, 5, 15), 2), 15], { name: 'secant method', error_rate: 1e-15 });
		assert([CeL.secant_method(function (x) { return x * x * x - 8; }, 5, 4), 2], 'secant method');

		assert([Math.pow(CeL.find_root(function (x) { return x * x; }, 3, 5, 15), 2), 15], { name: 'find root of equation', error_rate: 1e-15 });
		assert([CeL.data.math.find_root(function (x) { return x * x * x - 8; }, 5, 4), 2], 'find root of equation');

		// Essentially the same as A001065, but with a(1)=1.
		// https://oeis.org/A001065
		// Sum of proper divisors (or aliquot parts) of n: sum of divisors of n that are less than n.
		assert([CeL.factor_sum_map(40, { add_1: true }).slice(1).join(), '1,1,1,3,1,6,1,7,4,8,1,16,1,10,9,15,1,21,1,22,11,14,1,36,6,16,13,28,1,42,1,31,15,20,13,55,1,22,17,50'], 'Sum of proper divisors');
		assert([CeL.perfect_numbers(500).join(), '6,28,496'], 'Perfect numbers n: n is equal to the sum of the proper divisors of n.');
		assert([CeL.perfect_numbers(40, -1).join(), '1,2,3,4,5,7,8,9,10,11,13,14,15,16,17,19,21,22,23,25,26,27,29,31,32,33,34,35,37,38,39'], 'Deficient numbers: numbers n such that sigma(n) < 2n.');
		assert([CeL.perfect_numbers(99, 1).join(), '12,18,20,24,30,36,40,42,48,54,56,60,66,70,72,78,80,84,88,90,96'], 'Abundant numbers (sum of divisors of n exceeds 2n).');

		assert([1, CeL.Catalan_number(1)], 'Catalan number 1');
		assert([2, CeL.Catalan_number(2)], 'Catalan number 2');
		assert([42, CeL.Catalan_number(5)], 'Catalan number 5');
		assert([477638700, CeL.Catalan_number(18)], 'Catalan number 18');
		assert([1, CeL.Catalan_number(0)], 'Catalan number 0');
		CeL.Catalan_number_list.length = 1;
		assert([129644790, CeL.Catalan_number(17)], 'Catalan number 17');


		// ---------------------------------------------------------------------//

		assert([CeL.data.math.prime(5), 11], 'prime(5)');
		assert([CeL.data.math.prime(25), 97], 'prime(25)');
		assert([CeL.data.math.prime(100000), 1299709], 'prime(10000000)');
		assert([CeL.data.math.factorial(16), 20922789888000], 'math.factorial(16)');
		assert([CeL.data.math.factorial(17), 355687428096000], 'math.factorial(17)');
		assert([CeL.data.math.factorial(18), 6402373705728000], 'math.factorial(18)');
		assert([CeL.data.math.factorial(19), 121645100408832000], 'math.factorial(19)');
		assert([CeL.data.math.factorial(20), 2432902008176640000], 'math.factorial(20)');

		assert([CeL.math.period_length(562424324), 303858], 'Repeating decimal: get period (repetend length)');

		assert([CeL.integer_partitions(100, null, [1, 2, 5]), 541], 'Get the count of integer partitions');

		// ---------------------------------------------------------------------//

		assert([6, [3, 6, 5, 2, 3, 6, 2, 4, 6, 4, 2, 4].frequency(1).value], 'frequency(1)');
		assert('123321'.is_palindromic(), '.is_palindromic()');
		assert('1234321'.is_palindromic(), '.is_palindromic()');
		assert([7654321, (1234567).reverse()], '.reverse()');
		assert([98706540321, (123045607890).reverse()], '.reverse()');

		// ---------------------------------------------------------------------//

		var MULTIPLICATION_SIGN = CeL.math.closest_product.separator;
		assert([CeL.math.closest_product([2, 3, 7, 11, 47, 557], 26200).join(), '21,47' + MULTIPLICATION_SIGN + '557'], 'closest_product#1');
		assert([CeL.math.closest_product([7, 11, 13, 23, 43], 996).join(), '5,7' + MULTIPLICATION_SIGN + '11' + MULTIPLICATION_SIGN + '13'], 'closest_product#2');
		assert([CeL.math.closest_product([7, 11, 13, 23, 43], 995).join(), '6,7' + MULTIPLICATION_SIGN + '11' + MULTIPLICATION_SIGN + '13,23' + MULTIPLICATION_SIGN + '43'], 'closest_product#3');
		assert([CeL.math.closest_product([7, 11, 13, 23, 43], 995, 1).join(), '6,7' + MULTIPLICATION_SIGN + '11' + MULTIPLICATION_SIGN + '13'], 'closest_product#4');
		assert([CeL.math.closest_product([7, 11, 13, 23, 43], 995, -1).join(), '6,23' + MULTIPLICATION_SIGN + '43'], 'closest_product#5');
		assert([!!CeL.math.closest_product([], 995), false], 'closest_product#6');
		assert([CeL.math.closest_product([7, 11, 13, 23, 43], 996, -1).join(), '7,23' + MULTIPLICATION_SIGN + '43'], 'closest_product#7');

		// ---------------------------------------------------------------------//

		assert([CeL.Collatz_conjecture(70).join(), '70,35,106,53,160,80,40,20,10,5,16,8,4,2,1'], 'Collatz conjecture');
		assert([CeL.Collatz_conjecture.longest(99).join(), '97,119'], 'longest Collatz conjecture');

	});


	// ---------------------------------------------------------------------//
	// test for CeL.data.math.integer

	CeL.run('data.math.integer');

	// ---------------------------------------------------------------------//

	all_error_count += CeL.test('Basic integer examples', function (assert) {
		assert([(new CeL.data.math.integer(123)).add(2).toString(), '125']);
		assert([(new CeL.data.math.integer(123)).add(-2).toString(), '121']);
		assert([new CeL.data.math.integer(967803).digits().join(','), '9,6,7,8,0,3'], '.digits()');
		var v = '41232000000000000000000000003423';
		assert([new CeL.data.math.integer(v).digits().join(','), v.split('').join(',')], v + '.digits()');
		v = '76350768902347890756892374607'; assert([(new CeL.data.math.integer(v)).toString(), v]);
		assert([new CeL.data.math.integer(v).digits().join(','), v.split('').join(',')], v + '.digits()');
		v = '2893746179283692.863092367498021379480794'; assert([(new CeL.data.math.integer(v)).toString(), v]);
		v = '40%'; assert([(new CeL.data.math.integer(v)).toString(), '0.4']);
		v = '76.3%'; assert([(new CeL.data.math.integer(v)).toString(), '0.763']);
		v = '24.7 ‰'; assert([(new CeL.data.math.integer(v)).toString(), '0.0247']);
		v = '51‱'; assert([(new CeL.data.math.integer(v)).toString(), '0.0051']);
		assert([(new CeL.data.math.integer('35654675687675674657254634575695687534673656523463457426346555555475462563146536925686919636540917625486716955489618379548712386586959138654790816654798103704555555256134513567')).toString(2), '10010000001010000111011111100110100011010000001111110100100100011011111001010001011100000010000001111100111101010111111010001100100001010101011001000110100100100111010011010111101011000011100001101100100011110111100110111101001000100110110110011110101110010111101001110011001110110001100100011101111101000101001101100100011011001010110011110100111010010000110111111111110001110100111000100001100100100010010101010101101110010101001010001110111100100101001000110101010111001101100001110110001100011111110100010010111011101101001100010011000111101111010101010010010111111011001110011111'], 'base 2');

		v = '10'; assert([+new CeL.data.math.integer(v), +v], 'Integer.valueOf ' + v);
		assert([(new CeL.data.math.integer(100, 10)).add(9, true).toString(), '91'], '100 - 9 in 10');
		v = '1036458901670367598230709587298345'; assert([new CeL.data.math.integer(v), v], { name: 'Integer.valueOf ' + v, error_rate: 1e-15 });
		v = '6583964798678932'.repeat(30); assert([+new CeL.data.math.integer(v), +v], 'Integer.valueOf ' + v);
		v = '6.5'; assert([+new CeL.data.math.integer(v), +v], 'Integer.valueOf ' + v);
		v = '34534.43543'; assert([+new CeL.data.math.integer(v), +v], 'Integer.valueOf ' + v);
		v = '654561264556287547824234523'; assert([+new CeL.data.math.integer(v), parseInt(v)], { name: 'Integer.valueOf ' + v, error_rate: 1e-15 });

		v = '67798709667895676798'; assert([(new CeL.data.math.integer(v)).abs().toString(), v]); assert([(new CeL.data.math.integer('-' + v)).abs().toString(), v]); assert([(new CeL.data.math.integer(v)).negate().toString(), '-' + v]); assert([new CeL.data.math.integer('-' + v).negate().toString(), v]);
		v = '46545343687545453441534'; assert([(new CeL.data.math.integer(v)).add('100000000000000000000').toString(), '46645343687545453441534']);
		v = '46545343687545453441534'; assert([(new CeL.data.math.integer(v)).add('-100000000000000000000').toString(), '46445343687545453441534']);
		v = '46545343687545453441534'; assert([(new CeL.data.math.integer(v)).subtract('1000000000000000000').toString(), '46544343687545453441534']);
		v = '46545343687545453441534'; assert([(new CeL.data.math.integer(v)).subtract('-1000000000000000000').toString(), '46546343687545453441534']);
		v = '102030405060708090'; assert([(new CeL.data.math.integer(v)).multiply(2).toString(), '204060810121416180']);
		v = '102030405060708090'; assert([(new CeL.data.math.integer(v)).multiply('2000000000').toString(), '204060810121416180000000000']);
		v = '102030405060708090'; assert([(new CeL.data.math.integer(v)).modulo(20).toString(), '10']);
		v = '204060802040608020406080'; assert([(new CeL.data.math.integer(v)).divide(20).toString(), '10203040102030401020304']);
		assert([new CeL.data.math.integer('678907890797980798806789').square().toString(), '460915924187763021393636630594741064726152490521']);
		assert([new CeL.data.math.integer('1.37').add('.64').toString(), '2.01'], 'simple fraction toString()');
		assert([+(new CeL.data.math.integer('4.61')).subtract('.049'), 4.561], 'simple fraction valueOf()');
		assert([+(new CeL.data.math.integer(3423)).op('+', 523), +(new CeL.data.math.integer(3423)).add(523)], '.op()');

		assert((new CeL.data.math.integer(45532345245.00000)).compare(45532345245.0001) < 0, '1234.0000 < 1234.5678');
		assert((new CeL.data.math.integer(8967896578.0001)).compare(8967896578) > 0, '1234.0000 < 1234.5678');
	});

	// ---------------------------------------------------------------------//

	all_error_count += CeL.test('normal number test. 正常四則運算測試案例。', function (assert) {
		// ≈11 s @ Chrome/31.0.1640.0
		// ≈19 s @ Firefox/27.0 nightly
		// ≈35 s @ Firefox/3.0.19
		// too long @ IE8
		var a = 0, b = 0, v,
			// 誤差/誤差比例
			error_rate = 1e-15,
			BASE = (1 + '0'.repeat(Math.log10(Number.MAX_SAFE_INTEGER) >> 1)) | 0,
			MAX_BASE = Math.floor(Math.sqrt(Number.MAX_SAFE_INTEGER + 1)),
			_OP = '+,-,*,/,%'.split(','), OP = {},
			normal_test_case = [0, 1,
				//.64, 1.37,
				2, 12, 16, 17, 32, 1000, 1024, 1024 * 1024,
				BASE - 1, BASE, BASE + 1,// BASE - .9, BASE + .1, BASE + 1.1,
				MAX_BASE - 1, MAX_BASE, MAX_BASE + 1,// MAX_BASE - .9, MAX_BASE + .1, MAX_BASE + 1.1,
				Math.floor(Number.MAX_SAFE_INTEGER / 2)
			],

			do_test = function () {
				var op, _op, i, m;
				function test(assignment) {
					_op = op + (assignment ? '=' : '');
					m = '(' + typeof a + ')' + a + ' ' + _op + ' (' + typeof b + ')' + b + ' !== ' + v + '; i=new CeL.data.math.integer(' + a + ');i.op("' + _op + '",' + b + ');i.toString();';
					try {
						i = new CeL.data.math.integer(a);
						i = i.op(_op, b);
						i = i.toString();
					} catch (e) {
						console.error('throw @ ' + m + ':');
						throw e;
					}
					assert(i === String(v) || !(Number.isSafeInteger(v) || error_rate < Math.abs(v - i)), m + (Number.isSafeInteger(v) ? '' : ' (誤差 ' + error_rate < Math.abs(v - i) + ')'));
				}

				for (var op in OP) {
					//CeL.log(m);
					v = OP[op](+a, +b);
					test(true);
					test();
				}
			};

		_OP.forEach(function (op, index) {
			OP[op] = new Function('a', 'b', 'var v=a' + op + 'b;return v<0?-Math.floor(-v):Math.floor(v)');
		});

		normal_test_case.forEach(function (va) {
			//CeL.log(va);
			[va, -va].forEach(function (va) {
				[va, '' + va].forEach(function (va) {
					normal_test_case.forEach(function (vb) {
						[vb, -vb].forEach(function (vb) {
							[vb, '' + vb].forEach(function (vb) {
								a = va, b = vb, do_test();
							});
						});
					});
				});
			});
		});


		//test_count = normal_test_case.length * /* 正負 */2 * /* Number/String */2;
		// tests * tests: 有兩組相互運算。
		//test_count = test_count * test_count * _OP.length;
	});

	// ---------------------------------------------------------------------//

	if (test_level) {
		// 此步驟頗費時。
		all_error_count += CeL.test('division test', function (assert) {
			// ≈1.5 m @ Chrome/31.0.1640.0
			var base = 10, limit = parseInt('1111', base) + 2, d = 1, n, numerator, denominator = new CeL.data.math.integer(d, null, base), q;

			for (; d < limit; d++ , denominator.add(1)) {
				for (n = 0; n < limit; n++) {
					numerator = new CeL.data.math.integer(n, null, base);
					q = numerator.division(denominator);
					assert(+q === (n / d | 0) && +numerator === n % d, {
						NG: n + ' ÷ ' + d + ' → ' + Math.floor(n / d) + ' r ' + (n % d) + ', but get ' + q + ' r ' + numerator + '. Try: numerator=new CeL.data.math.integer(' + n + ', null, ' + base + ');q = numerator.division(denominator);'
					});
				}
			}
			//test_count = limit * (limit - 1);
		});
	}


	// ---------------------------------------------------------------------//

	// @see
	// http://www.wolframalpha.com/

	all_error_count += CeL.test('Advanced integer examples #1', function (assert) {
		var v = '90846795678256376423066498367647582364097529386948569238664755236548675867234.576856065785675678';
		assert([(new CeL.data.math.integer(v)).toString(), v], 'assignment');
		assert([(new CeL.data.math.integer(v)).round().toString(), '90846795678256376423066498367647582364097529386948569238664755236548675867235'], 'round #1');
		assert([(new CeL.data.math.integer(v)).round(1).toString(), '90846795678256376423066498367647582364097529386948569238664755236548675867234.5768561'], 'round #2');
		v = '9606906987890609878968978907980.45879689';
		assert([(new CeL.data.math.integer(v)).round().toString(), '9606906987890609878968978907980'], 'round #3');

		assert([CeL.data.math.integer.GCD(
			'21909141633140461',
			'79005841046603115',
			'1043156885011338053872',
			'10431545237344872'
		), 2287], 'GCD');

		assert([CeL.data.math.integer.LCM(
			// 634565	*893072287*6323654441*744767455467
			'2669018277955772548343947255625836785',
			// 45674389	*6323654441*744767455467*67854672341
			'14596251052591727855517198662202533214603',
			// 9063846	*893072287*744767455467*67854672341
			'409071835469639370187635522102958919094',
			// 79466782	*893072287*6323654441*67854672341
			'30452301921993849144328012863543979354'
		).toString(), '2979011645836605603160837828310291449671811310579320020725333917148490'], 'LCM');

		assert([(new CeL.data.math.integer(
			'90846795678256376423066498367647582364097529386948569238664755236548675867234'
		)).add(
			'9237420394785793064798623864758790234659828356485769234657639864590827639845324554'
		).toString(),
			'9237511241581471321175046931257157882242192454015156183226878529346064188521191788'
		], 'add');

		assert([(new CeL.data.math.integer(
			'979807986890796808790696780653985276980629768379820798367910627686309'
		)).subtract(
			'3749750983786892346345234534543466643562345245676598768977895685689568967869567867867'
		).toString(),
			'-3749750983786891366537247643746657852865564591691321788348127305868770599958940181558'
		], 'subtract');

		assert([(new CeL.data.math.integer(
			'906705785068675679578567456785876570895364576925386495364709153864'
		)).multiply(
			'269479586239806398064098273980647092637694592364980720938649283674879123'
		).toString(),
			'244338699801545552122300585908839018247286956516089061341390591947903027289735679572264494216568615023180261868511447285758758421808381272'
		], 'multiply');

		assert([(new CeL.data.math.integer(
			'365478478648376340000000000000000000000000000000003498573402768940'
		)).multiply(
			'139864955629836740000000000000000000000000000003476579267546682'
		).toString(),
			'51117631199815391149217660278731600000000000001271104229417193877256942850446735600000000000000012163067758056744300539509657080'
		], 'multiply d0d×d0d');

		var n, d, q, r;

		n = '36746579817092486509806547910370948509276695796954679801245';
		d = n; q = (r = new CeL.data.math.integer(n)).division(d); assert([q.toString(),
			'1'
		], 'divide ='); assert([r.toString(),
			'0'
		], 'modulo =');

		d = '36746579817092486509806547910370948509276695796954679801244'; q = (r = new CeL.data.math.integer(n)).division(d); assert([q.toString(),
			'1'
		], 'divide =-1'); assert([r.toString(),
			'1'
		], 'modulo =-1');

		d = '36746579817092486509806547910370948509276695796954679801246'; q = (r = new CeL.data.math.integer(n)).division(d); assert([q.toString(),
			'0'
		], 'divide =+1'); assert([r.toString(),
			n
		], 'modulo =+1');

		n = '66928369294098730088345409833402165831322970024009822224076225344166156243102508002393816464210062718405382';
		d = '698767578976579867079798060998670678589467954567586567587'; q = (r = new CeL.data.math.integer(n)).division(d); assert([q.toString(),
			'95780587576948706975674655785649468587058567486786'
		], 'divide 整除'); assert([r.toString(),
			'0'
		], 'modulo 整除');

		n = '3647982638676923847695928563649253674496263489629836462983749862634825673657486928536742763899546769234';
		d = '236894709286472766948906296594679801692385462894567293856472537'; q = (r = new CeL.data.math.integer(n)).division(d); assert([q.toString(),
			'15399173116464496960534190934596819207307'
		], 'divide 未整除'); assert([r.toString(),
			'7374250202118712318695929147516643831968015175135335991541375'
		], 'modulo 未整除');

		n = '465853647958000000000000000000004645675673';
		d = '2465807609378765678694'; q = (r = new CeL.data.math.integer(n)).division(d); assert([q.toString(),
			'188925383386000229079'
		], 'divide d0d/d'); assert([r.toString(),
			'536209343857736132847'
		], 'modulo d0d/d');

		n = '356748567830000000000000000000000000000000000000000000000023647938987347864785672';
		d = '320589193466752639062'; q = (r = new CeL.data.math.integer(n)).division(d); assert([q.toString(),
			'1112790371915631470414520562999149357273191076754845447402558'
		], 'divide d00d/d'); assert([r.toString(),
			'117212213288275265076'
		], 'modulo d00d/d');

		n = '360714528376619307907910039640000000000000000000000000000000000003654672';
		d = '38579680495876'; q = (r = new CeL.data.math.integer(n)).division(d); assert([q.toString(),
			'9349857845898390000000000000000000000000000000000000000000'
		], 'divide d0d/d=d00'); assert([r.toString(),
			'3654672'
		], 'modulo d0d/d=d00');

		n = '12733016344083346692300402349029000000000000000000000000000000376354238579680495876';
		d = '1290759024758923'; q = (r = new CeL.data.math.integer(n)).division(d); assert([q.toString(),
			'9864750971980623000000000000000000000000000000000000000000000291575'
		], 'divide d0d/d=d0d'); assert([r.toString(),
			'1175935597522151'
		], 'modulo d0d/d=d0d');



		var factors = (new CeL.data.math.integer('951867636729137211740731172717657305563806457866732544596246918836942492129581130135811456284513620359932602107297790045590578610150577993192921276509711230957262721802902995505204606076416')).factorize(), p, s = [];
		for (p in factors)
			s.push(p + '^' + factors[p]);
		assert([s.join('*'), '2^9*3^3*19^1*47^1*71^5*1181^1*1223^42*2957^1*4391^1*9733^1*30013^1*43177^1*129281^1*134053^1*2713963129^1'], 'factorize()');

		assert([(new CeL.data.math.integer('106289679876980793806')).power_modulo('17657985673965876', '96765785467346574567').toString(), '14107833359163479494'], '.power_modulo() #1');
		assert([(new CeL.data.math.integer('689069807629806769538762253678')).power_modulo('109826789265795672825', '7982670986870639756872').toString(), '1999434266103759459736'], '.power_modulo() #2');
		// 312929×9182297783×34129200421
		// (new CeL.data.math.integer('98067092367913679480627347')).factorize();
		// TODO: (new CeL.data.math.integer('9182297783')).Pollards_rho();

		assert([(new CeL.data.math.integer(
			'2739807489306248957209639804679802759802730984'
		)).square().toString(),
			'7506545078458611494016611783500433488802476501247879982312706372536383828960346744673608256'
		], 'square');

		assert([(new CeL.data.math.integer(
			'78907980659337948'
		)).power(
			'42'
		).toString(),
			'47761618711323070793259863280335506729733307293384058047541348409813645483754284252921466893928347697364910000822260216137229610441978630446251316565661358972915590951994606703291431298819409923212714711814875146820241333561309244431073739863283693904261106171456559701306594100140162963180310370912558510737748091696284667966266236980473454212777960407702429174550243845724642608758465501795845613889565525284084473413574804717311637081860905843995590971706115199959934323423480578385908022124670951533288213813004168728882568801289098611724501018894594724440243630806046986837050508264852287919636209821428962800662455901324555780970580709266383194695873321599569138032665431487237770161180099288195666018304'
		], 'power');

		assert([(new CeL.data.math.integer(
			'61772802353737826185922027691847094138479005416114482598544421159684'
		)).square_root().toString(),
			'7859567567858795765867896986575678'
		], 'square root 完全平方數');

		v = CeL.data.math.integer.random(50);
		assert([v.square().square_root().toString(), v.toString()], 'square root 完全平方數#1');

		assert([(new CeL.data.math.integer(
			'5865716820551785830877347945389902355543768293856005808558587982205189502805464741054139091359212804'
		)).square_root().toString(),
			'76587967857567456356789087658747657867056746756798'
		], 'square root 完全平方數#2');

		assert([(new CeL.data.math.integer(
			'5786786979876983676458907293665498023985470792386469583579867984759867923954346536'
		)).square_root().toString(),
			//76070933870151638072422708773303573677519.318928489340846100216218951773080645400412584957731068383344903655604944258787157682534085756241146109852420736795239854059617799656742776938325682158507199321
			'76070933870151638072422708773303573677519'
		], 'square root 未整');

		var I = '34854600000000000'; assert([(new CeL.data.math.integer(I)).square().add(-1).square_root().add(1).toString(), I], 'square root of ' + I + '^2');


		assert([CeL.square_root(2, 50).toString(), '1.41421356237309504880168872420969807856967187537694807317667973799073247846210703885038753432764157273501384623091229702492483605585073721264412149709993583141322266592750559275579995050115278206057147010955997160597027453459686201472851741864088919860955232923048430871432145083976260362799525140798968725339654633180882964062061525835239505474575028'], 'square root of 2, √2');
		assert([CeL.square_root(5, 50).add(1).divide(2).toString(), '1.61803398874989484820458683436563811772030917980576286213544862270526046281890244970720720418939113748475408807538689175212663386222353693179318006076672635443338908659593958290563832266131992829026788067520876689250171169620703222104321626954862629631361443814975870122034080588795445474924618569536486444924104432077134494704956584678850987433944221'], 'Golden ratio, 黃金分割比例φ');

		assert([(new CeL.data.math.integer(
			'67283649806736492863980479802653479263956175362954769235467234'
		)).log(),
			142.3640228418553331786491736054982412909892945545826974238558
		], { name: 'log 未整', error_rate: Number.EPSILON });

		assert([(new CeL.data.math.integer(
			'349857039645890739806479586738905867389047895673465983704594758907980739487509409534875938064534235'
		)).log(),
			226.9056935403154926974986040706359022424394462109633916450169
		], { name: 'log 未整#2', error_rate: Number.EPSILON });


		assert([CeL.factorial(16), 20922789888000], 'integer.factorial(16)');
		assert([CeL.factorial(17), 355687428096000], 'integer.factorial(17)');
		assert([CeL.factorial(18), 6402373705728000], 'integer.factorial(18)');
		assert([CeL.factorial(19).toString(), '121645100408832000'], 'integer.factorial(19)');
		assert([CeL.factorial(20).toString(), '2432902008176640000'], 'integer.factorial(20)');

		assert([CeL.data.math.integer.factorial(100).toString(), '93326215443944152681699238856266700490715968264381621468592963895217599993229915608941463976156518286253697920827223758251185210916864000000000000000000000000'], 'integer.factorial(100)');
		assert([CeL.data.math.integer.factorial(1000).toString(), '402387260077093773543702433923003985719374864210714632543799910429938512398629020592044208486969404800479988610197196058631666872994808558901323829669944590997424504087073759918823627727188732519779505950995276120874975462497043601418278094646496291056393887437886487337119181045825783647849977012476632889835955735432513185323958463075557409114262417474349347553428646576611667797396668820291207379143853719588249808126867838374559731746136085379534524221586593201928090878297308431392844403281231558611036976801357304216168747609675871348312025478589320767169132448426236131412508780208000261683151027341827977704784635868170164365024153691398281264810213092761244896359928705114964975419909342221566832572080821333186116811553615836546984046708975602900950537616475847728421889679646244945160765353408198901385442487984959953319101723355556602139450399736280750137837615307127761926849034352625200015888535147331611702103968175921510907788019393178114194545257223865541461062892187960223838971476088506276862967146674697562911234082439208160153780889893964518263243671616762179168909779911903754031274622289988005195444414282012187361745992642956581746628302955570299024324153181617210465832036786906117260158783520751516284225540265170483304226143974286933061690897968482590125458327168226458066526769958652682272807075781391858178889652208164348344825993266043367660176999612831860788386150279465955131156552036093988180612138558600301435694527224206344631797460594682573103790084024432438465657245014402821885252470935190620929023136493273497565513958720559654228749774011413346962715422845862377387538230483865688976461927383814900140767310446640259899490222221765904339901886018566526485061799702356193897017860040811889729918311021171229845901641921068884387121855646124960798722908519296819372388642614839657382291123125024186649353143970137428531926649875337218940694281434118520158014123344828015051399694290153483077644569099073152433278288269864602789864321139083506217095002597389863554277196742822248757586765752344220207573630569498825087968928162753848863396909959826280956121450994871701244516461260379029309120889086942028510640182154399457156805941872748998094254742173582401063677404595741785160829230135358081840096996372524230560855903700624271243416909004153690105933983835777939410970027753472000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'], 'integer.factorial(1000)');
		assert([CeL.data.math.integer.factorial(4000).toString(), '18288019515140650133147431755739190442173777107304392197064526954208959797973177364850370286870484107336443041569285571754672461861543557333942615617956996716745284831597317498818760937482804980419576512948720610558928129788097800620593429537705326740624453884285091743951756746144447362378722469436194575929579900114212973360658998073977714697261205048663725936337490404066097966637170254021348800944280342285355946649681316260163459743803577175903394733170076841764779082166891184529324230033414145497801832598218518406552257097392530024582738982919104406782168708871495603501905867399966298798534877747923179195791416504408054878974770308650707120878837624986576073340449414854578367383301715706358194127400849855604080473305196833482408079420964275187538889115296655522397723924887154624810659788321005620558369604778657904771918388054319251513981954296741688447246185021250402225010116433016818588036690180177691461779713104301640395708274734701186772756966064611023656528765138735704190876200697145804692125236821066805337175220605745377557452592208653939853278523841448314026548802309860391087939783218946129582647928430739985554883806198749831633640196211202756086016039171607744078776876219661603702759454887945247605749205543464095883664514960293873244842409803801480566600124415293789831496309554117113888561569494314926134470477513516416560102984058751906208865570183683850791317395702861350821464653600469443279077733978568711404244774089509216727922510660941411716412467443445414001188915966547283773988670739792818897314762082568914041952211779194055311405259158538932388745292324386826830135904886472292289993848482289254307628467614523292519222687689180219788377184005246290896703260524910362136627321135976515358528150143796798116836263053229733971612275184896139539613129329008449214723196703789119820971205922195513915546814704778682373487718946560822811623038853887054357316290622378472322045316639418491798517077275839637525427601452961835674484434498885698840692468550825765131610925966585339561854456154229048295742274725126218799745448031391826295221114381890600683208441558088271228618006589059444108806652992787854634497487158675770983422610936590600627170500972481399444145398522756870626097250230229195799277299921844954715690883242553569256657132515663544931830393317518828986443942138971609142621397646808351809694603734872977984148002699965137870448199866167162949256435040416146886823942144459105175033488395869910405207521329016842673168563837531518918339627724066152933627236730561155418227888673513937454508103826102827706121560330906016404162420051373313654570111102003319577878502216919170112074608722852376799943191590480651623958062982829452035227119036502426583752512199824089725611711059153935434418985109241404135069047109527514730648502064630431371185922523036941621026392783813435540195800531988645430344745298845640017082732623248838473771603478336326662579219137601422632057648758807935233915527562817942378675243919886800056209434731407685691942327092464101136254795499159351103542747723434544436366313104996373661654989465498180892716462805042227038222104784062626027480151567377841821316292095295686368619300417863327530764301323081902435971165925163513225511176258919471673437553320934916910573999020966087207663133871516530391787535755420348174519954013015999193335205032571176460105005716115305748669364682675265014310223271762807620242805617435594927890676408953057384890719681225840400396698155624793888816156585043604782961704971397764959404751358445856914581957186533573207690355894150776647727994156425641953755517727965486096675384222232344185537279888780570854092084221993660761154788359777439798490851148031275123759286793224660188593768897291749180357297185650430735063126035278321749629995702200115722386600046772883018963166273463715186812543356173550341233310175600817771447170656517505385258772069067139665478506263898380526394388218036388768999161538645432932116471146392562992204259450889291928261780531925618148311151259088519869787637913607866079920830781433275298468534248595471485354420794089854693167644320115900404444471266030942746376074187982809857292874382829734306879420308783010740784767155894363033186129183748698373599293267795620690003900348542140553208244771165593739117369452474295075445169488356550100854423929030967163401348223503674045821834526710830392520955478859202303175309815706259592416130388770535449570146586161954289529234209342432075461261173246383180702862172009624828852517861214008242944903162464816939278645210656431141653019224783906038062818006434258491952705341708781231767324026544165240012431457995565227331912056216396141277926932316783631899833106810492890045890947294731794016389385348294079360921757589715698098491612254898203787546124091057862387229987442131738499764391062422228395736099751277880661280909246369674792326056952220508861243875642482808175793303703933394191224832165950388337931626643339913192088808753619030386928808349931733881036690498513779587801764477865791351420222949860738228995728065763459283625096944678593378349990211317403358327367677358882377095918185840441346045760435580063918587956888086127034558064154832456098224664532422114583653763989534559801683261113731162039500068729224661509382267286483841867542303955164213391663536072749966590737898408144092699675796793165775891429992491955485860639629542416955757565163223827874193321274119938618709482020627749094917473754346320653165690129809741806883246764053966717253521140010801409998318494470531219051920354752556183478378238398583402765337923843167749738355049636714529840534145950376598809459294819192486096200503652538835417613002983933634477053826438814791235363934440952835213240806543802505241445900981152753843778634021300832293332432473400040109754281828950625464331409151961292319287863535740382445771128522343533054993071872524564127962306298218521662304206610010638488461150361786151832595182055013210238035059473479841417644445066550217093994746959565730463201996845756999575031950401331385688683576883429289274419202816101239071817771853612534620088858074904095239406471009098851796038360101243053736361346640211872570375441319261567131238168652234864182359667285536913841122976956009892970909409178865928472056691904571596961458646895132972589012090613887584436018692038947475932753085268106507554394567201654757930957224629573401948677157237825005540282635839895509019254240256916422227590032685003087320017232658420681209681389364174854034319152111706246564733896551636271748411627920466475472421243033805492052542237647091252577811952376244836844025673570936216945539206875730684120187779664758451508678786539887154966732995692212544207529457534936853900663520665102592278581210192104846016594846265525000394264201946315492667174670489454576610993722063668720936949698308641684437046485292906040368218708947194882991333823400676584552108673913669306118549159369734833071319506680872661886898225398171896329288732499509337836463164384614967690283284184136334006184670970038275153458133098776493171693249836721707632973537518273692928527497068121779606865163943692606596848941143683627629169873171114739189794632775706536177409526869936538136348369630762610163490694986911903178859927739423796596582439105912599204583810744740479342404550513976713360591833475711496976836332005885151231030818986389033126325119226309584818058301429763149472903925739659774337307109687940297813700796873400566095281249251559137923743113469044584820584542770746490047535898370961450995287930441328833542933636539386097851378739174078158132593877463567524868470795313740375647059352650583871001646082364842709333314532933141725314262510333047099681128329792983694287727106008519184538377065089964546579000542260452715147077137452076302879112802094308224402060706282308208678850263037733351444756065285721900833083634023860920356321356382318484421995141074387149942542550133039926139155010190614633196727199469768170121209097613598302048321148497175007150184555423280152476407230065108963493864309805262458731715886593175689747530567359088332598961192319881186961400055356294945140450806114214490420494488195417136403967132286869444062615622815233336396279517485469862880809956041938378161336156979526713793454354319018535526139196959277008828634440008764782171726908279132449346924807112458895951881542382952497102061566169481361027449429416228859029591798532192088531772405831332410104172391828682208239266557146168642210154401086974397003647170356217905465594944933170065175291981240572835024374361017977695084363373226470846255498368067535698751768103817520605779489720985090002595078926475029239124403277040719184010486962844211160986922952144938430963756963408787147933184107904312838985994963982784496688190643908936394858404598837762653245968848299901455260080572627872653099337092686312650606546084656202210845053932679131706841390889951865628810708670194485207654079244417321332232196041180225814997707988397637369268804955010409293139079608620689856756139863786355461818276369292665568749282154818479663283704713663666842236273009790537968973379093662517795316051746410279831975339791651704861188979834156418998505732384020730350075052669695594594753081616632885311572351609352631187129393729557398993321794518158269658073683417584260274184235030846683698193879109933863561435059993549597333514217973995915742796206889856584584493875193805504685107321011420502217815128118404137521250590361329385146997427292035829509205811367395885622247504950811752188165627552137681095618860955664505372763469788466067973748736658759105548049054658237200096293754479296344115915560231138432518248450383276234795400180535655551222536669390799317067896797756236783441752907948891802488298281245615590113512482344591092230909649423933991714557108941323849548468680509335203770970493785006636718394242326057416155509029270066096293813080877339787718442773014833232754755736783313789547145535129557193581885962158684756484475219230828423777756012721234731368785218564362953263092286535139160440838713013861328416662947756104857391740722209360021068158824717926850831589591367302143596625426553706038593255843919505223140871543995210720444637571268651195165483531243799087083070940544241515809139594158704843980567202482856647644447362604252961907705738740354460336586792214638225365973993001974668174157206242597452556046629209551599663117912609702944345176608757619561247872050409609062772362769045711709729061066411540898769707847042980034982033351136308779676287974627667703893888026848748953201438481632037717854462054861859986684636917120883602793194058658599425778515519713798214407689849211487929150179918547200558584524139792439377469676039518101451697712860634235352474290575260172151562129240720796835619967878383018961055921622371480562682714603085506932806187937976625431071742833007749235636990700120567425836156233607547500827789537909071263596294926763891075439575973972560478399510790078797663071024149826759934524980569432847819403219226207098701759952415628476519584752248050578584198211799092030838909208236225141975964892778944163008811179723219354847713753084628828883321692575327835658786892010648865205021985527642612795652759365359359048052205587306960853879351302215329380382709288672566169552660197788055450054177652374955319992805345989662399494012874012278677451052584166987084866267245492968785684175508510910492913793478551456991152291522750377308973310200505007906906671435839262115546753934391579860133029544403932422271218975046896384482252108820546415274174791693426071019927278518520520164621127271231748277979659289204850823018535192067323372368224831050642902153626845618478009622824733150764188329304815843651352730897836727021023023627320228373645802602496000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'], 'integer.factorial(4000)');

	});

	// ---------------------------------------------------------------------//

	// ≈4 s @ Chrome/31.0.1640.0
	// ≈15 s @ Firefox/27.0 nightly
	// ≈14 s @ Firefox/3.0.19
	// ≈3.5 m @ IE8
	if (test_level) {
		all_error_count += CeL.test('power() and log()', function (assert) {
			var test_count = 101,
				factor = 1, power = new CeL.data.math.integer('42364232342234'), I = new CeL.data.math.integer(factor), i = 0;
			factor = Math.log(factor) / Math.log(power);
			for (; i < test_count; i++ , I.multiply(power))
				assert([I.log(power), i + factor], 'power ' + i);
		});
	}

	// ---------------------------------------------------------------------//

	all_error_count += CeL.test('square root of small integer', function (assert) {
		for (var m = 'test square_root: ', i = 1, I2; i < 100000000; i += 1000000) {
			I2 = (new CeL.data.math.integer(i)).square();
			assert([I2.clone().square_root().compare(i), 0], m + i + '^2');
			assert([I2.clone().add(1).square_root().compare(i), 0], m + i + '^2 + 1');
			assert([I2.add(-1).square_root().compare(i - 1), 0], m + i + '^2 - 1');
		}
	});


	all_error_count += CeL.test('square root of big integer', function (assert) {
		// ~5 s @ Gecko/20100101 Firefox/35.0
		var test_count = 200
		for (var i = test_count, I = new CeL.data.math.integer(1), a = new CeL.data.math.integer('62537864798693472567385647825635478963754675867263725675627835674527634854699999999999'), I2;
			//
			--i; I.add(a)) {
			I2 = I.clone().square();
			assert([I2.clone().square_root().compare(I), 0], I.toString() + '^2');
			assert([I2.clone().add(1).square_root().compare(I), 0], I.toString() + '^2 + 1');
			assert([I2.add(-1).square_root().add(1).compare(I), 0], I.toString() + '^2 - 1');
		}
	});

	// ---------------------------------------------------------------------//

	all_error_count += CeL.test('integer', function (assert) {
		assert([(new CeL.data.math.integer(37)).precise_divide(30).join(','), '1,2,3'], 'precise_divide');

		var d = '2396479263746238964792536748675698343467598263986482', i = new CeL.data.math.integer(1), q = i.division(d, 20);
		assert([q.toString(), '0.00000000000000000000000000000000000000000000000000041727880358821627641201133856640960484497446720483282943407733409538321273349917320385315']);
		assert([i.toString(), '0.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000089996564146736916482171047075638439407724380868817']);
		assert([q.multiply(d).toString(), '0.9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999910003435853263083517828952924361560592275619131183']);
		assert([q.add(i).toString(), '1']);


		// https://en.wikipedia.org/wiki/E_(mathematical_constant)
		var i = 0, E = new CeL.data.math.integer(1), t = E.clone();
		while (!t.is_0())
			E.add(t.divide(++i, 50));
		assert([E.toString().slice(0, -7), '2.7182818284590452353602874713526624977572470936999595749669676277240766303535475945713821785251664274274663919320030599218174135966290435729003342952605956307381323286279434907632338298807531952510190115738341879307021540891499348841675092447614606680822648001684774118537423454424371075390777449920695517027618386062613313845830007520449338265'], 'calculate mathematical constant ℯ ≈');
		assert([CeL.data.math.integer.E(500).toString(), '2.7182818284590452353602874713526624977572470936999595749669676277240766303535475945713821785251664274274663919320030599218174135966290435729003342952605956307381323286279434907632338298807531952510190115738341879307021540891499348841675092447614606680822648001684774118537423454424371075390777449920695517027618386062613313845830007520449338265602976067371132007093287091274437470472306969772093101416928368190255151086574637721112523897844250569536967707854499699679468644549059879316368892300987931'], 'calculate mathematical constant ℯ ≈ (@library)');
		assert([CeL.data.math.integer.exp(2, 200).toString(), '7.3890560989306502272304274605750078131803155705518473240871278225225737960790577633843124850791217947737531612654788661238846036927812733744783922133980777749001228956074107537023913309475506820865818'], 'calculate ℯ ^ 2 ≈ (@library)');
		assert([CeL.data.math.integer.exp(2, 200).toString(), '7.3890560989306502272304274605750078131803155705518473240871278225225737960790577633843124850791217947737531612654788661238846036927812733744783922133980777749001228956074107537023913309475506820865818'], 'calculate ℯ ^ 2 ≈ (@library)');
		assert([CeL.data.math.integer.exp(2.5, 500).toString(), '12.18249396070347343807017595116796618318276779006316131156039834183818512614331441006025552300629578874164976170442788361811914791233047345329826015811045541072018313739514744649945165471735106876656193062580286526019353646720719240969280336407960691149355062211383623341141381597679059213234085377534982449897144149757702154071767673391647700128283229509044157024350254547986278083590260873502804790184457610585004322758059113845137095502198902701594820305069978661178272342138560205768565075271211'], 'calculate ℯ ^ 2.5 ≈ (@library)');
		// N[Exp[426745672/100000000], 500]
		assert([CeL.data.math.integer.exp('4.26745672', 500).toString(), '71.339967188548164108945077160145089004795386012423482939465327234170871523571918144487473567747415233228616562053148094253831160315437575878346180763478208263912864815028817182290022594036946702093275679392446412856998127102698997290740359492734406335275905647569969164090797887615100244043593945854502014144331657359008480775701166366162146856464360389451109748638120247447947741104105958465943429654991890214733228480203125564018758972683947752075979151421544989048481886808175927044642723615470931'], 'calculate ℯ ^ 4.26745672 ≈ (@library)');
		// IntegerPart[Exp[42674545673674567777777777777777777770298763890401570907896578356745623654897238904689720370659802799993806954279380654772893765479286376547023764578962734657634656927546789236654792863765476273654897297365618946593809324659693147180559945309417232121458176568075500134360255254120680009493393621969694715605863326996418687542001481020570685733685520235758130557032670751635075961930727570828371435190307038623891673471123350115364497955239120475172681574932065155524734139525882950453007095326366642654104239157814952043740430385500801944170641671518644712839968171784546954589672938452458672/10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000]]
		// 214768399411494680175529229077122554402777058117867927935982540817343063618290167474261731378018548672646682246469441515439217199687191992446553927937614387842082551650605602675589492515410229169611860664338587068157790761549762739219004584550975598796438316184786791730456396305379124223547405559190666559543462629374277298023491348730950154257495692612980166688725242932322393043564968206837655541511662739132330179140089887370198911622600420308114222206876321562955710560116785051521467304811439440141944137528978256490965849748402631090683238487549578855566780459293963963234628464060049206490079616224856349515940650322978251334226392798071854768081313740299854380833928801826688367174295219673042335154046381912290865471196598537194895047773328059950839267151193098388336129771952946464637494862166799670220048051735947537887830524988501209936825260140057907131172256368033087343676619215980888037438683549957496858169448719632813824147889107610739313324061378175922351444446739917717992029529634073773403021205908159982224493782527586736394712855547825340868693902193014081823138719373744082136067266746929600921454798649411815979696834447183349020876026033538851764017467336213249964621081568659974927294591234183066275288547022506038453817104847363395464696133886001246492244707985909627835143263782352191768700006249296649559322121467060890173851030285480748731827344893488976554094186617320598663826181516200438183020054384217731390669990759812790616728448107142120204671651145977877802693402598655902078891636378312825836962916760564172280736638066558797029840152228353772719866669446222676319124879920181082529045254379367377799363650558131691571685033592710056821678419437310477793256244954988277329856788372272957521842725561717295628561915198898144519828796779112253973010827806733185912646629742017394162750818907740963029891496232135381
		if (test_level)
			assert([CeL.data.math.integer.exp('4267.4545673674567777777777777777777770298763890401570907896578356745623654897238904689720370659802799993806954279380654772893765479286376547023764578962734657634656927546789236654792863765476273654897297365618946593809324659693147180559945309417232121458176568075500134360255254120680009493393621969694715605863326996418687542001481020570685733685520235758130557032670751635075961930727570828371435190307038623891673471123350115364497955239120475172681574932065155524734139525882950453007095326366642654104239157814952043740430385500801944170641671518644712839968171784546954589672938452458672', 500).toString(),
				'214768399411494680175529229077122554402777058117867927935982540817343063618290167474261731378018548672646682246469441515439217199687191992446553927937614387842082551650605602675589492515410229169611860664338587068157790761549762739219004584550975598796438316184786791730456396305379124223547405559190666559543462629374277298023491348730950154257495692612980166688725242932322393043564968206837655541511662739132330179140089887370198911622600420308114222206876321562955710560116785051521467304811439440000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'], 'ℯ ^ 4267.454..');
		// IntegerPart[Exp[193864507980563945768907098279380789057980679802938670958678037200954832450298609865074985769807293679576692746579637947679238665479617623579642795679616257547926579536916465796624579612459867256485617253865976894765916478659316958698460561090649561703649856398475986239847510909457698310645906794567981054679102654798012395401209536791809457609120765901702376461570957910948751902654791027948016265498170695478679054908766253709167029547602637054761907627549800659017602501263986549817669238064798010396476579283670654980279384/100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000]]
		// 87671922189380391833193078240391130619463963424867362893820541503443131651013726010992723264242120613104697791076294317647267356095538797494164903438862993179585416339929315344513405407195151377296352004278047812353447319422141912648783984600331154959434037487588340586295637979582333843768397439214377517675388549995671204279841213854250342211020471986712706313800520918524439404448343122474003425145054638091815260672810682003882556089419096447578819746622904195879867066769459692390128046374769947077248093545492679049563962519304254353431927351774907448898241052600048992537953042212887992334416175650232568731162234904939744961407411585424740633620124763408131865660692809598272100163432082530356919123408122301166070061988543951291205793982568819590698373327503794957654148275481037993598550948756397217096750138432976459268180137127239
		if (test_level)
			assert([CeL.data.math.integer.exp('1938.64507980563945768907098279380789057980679802938670958678037200954832450298609865074985769807293679576692746579637947679238665479617623579642795679616257547926579536916465796624579612459867256485617253865976894765916478659316958698460561090649561703649856398475986239847510909457698310645906794567981054679102654798012395401209536791809457609120765901702376461570957910948751902654791027948016265498170695478679054908766253709167029547602637054761907627549800659017602501263986549817669238064798010396476579283670654980279384', 501).toString(),
				'87671922189380391833193078240391130619463963424867362893820541503443131651013726010992723264242120613104697791076294317647267356095538797494164903438862993179585416339929315344513405407195151377296352004278047812353447319422141912648783984600331154959434037487588340586295637979582333843768397439214377517675388549995671204279841213854250342211020471986712706313800520918524439404448343122474003425145054638091815260672810682003882556089419096447578819746622904195879867066769459692390128046374769947100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'], 'ℯ ^ 1938.645..');


		// https://en.wikipedia.org/wiki/List_of_formulae_involving_%CF%80#Efficient_infinite_series
		var i = 0, PI = new CeL.data.math.integer(2), t = PI.clone();
		while (!t.is_0())
			PI.add(t.multiply(++i).divide(2 * i + 1, 50));
		assert([PI.toString().slice(0, -8), '3.141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067982148086513282306647093844609550582231725359408128481117450284102701938521105559644622948954930381964428810975665933446128475648233786783165271201909145648566923460348610454326648213393607260249141273724587006606315588174881520920962829254091'], 'calculate mathematical constant π ≈');
		assert([CeL.data.math.integer.PI(200).toString(), '3.141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067982148086513282306647093844609550582231725359408128481117450284102701938521105559644622948954930382'], 'calculate mathematical constant π ≈ (@library)');


		// calculate ln2 = 2/3 ( Σ 1/(2k+1)9^k, k ≥ 0 )
		// https://en.wikipedia.org/wiki/Natural_logarithm_of_2#Series_representations
		// https://en.wikipedia.org/wiki/Logarithm#Power_series
		var i = 1, term = new CeL.data.math.integer(2), ln2 = term.clone(), ln10 = term.clone(), nines = term.clone();
		while (!term.is_0())
			ln2.add(term = nines.divide(9, 52).clone().divide(i += 2));
		ln2.divide(3);
		assert([ln2.toString().slice(0, -14), '0.69314718055994530941723212145817656807550013436025525412068000949339362196969471560586332699641868754200148102057068573368552023575813055703267075163507596193072757082837143519030703862389167347112335011536449795523912047517268157493206515552473413952588295045300709532636664265410423915781495204374043038550080194417064167151864471283996817178454695'], 'calculate ln 2 ≈');
		assert([CeL.data.math.integer.LN2(200).toString(), '0.69314718055994530941723212145817656807550013436025525412068000949339362196969471560586332699641868754200148102057068573368552023575813055703267075163507596193072757082837143519030703862389167347112335'], 'calculate ln 2 (@library)');
		i = 1, term = ln10.clone(), nines = term.clone();
		while (!term.is_0())
			ln10.add(term = nines.divide(81, 52).clone().divide(i += 2));
		ln10.divide(9).add(ln2.clone().multiply(3));
		assert([ln10.toString().slice(0, -14), '2.30258509299404568401799145468436420760110148862877297603332790096757260967735248023599720508959829834196778404228624863340952546508280675666628736909878168948290720832555468084379989482623319852839350530896537773262884616336622228769821988674654366747440424327436515504893431493939147961940440022210510171417480036880840126470806855677432162283552201'], 'calculate ln 10 ≈');
		assert([CeL.data.math.integer.LN10(200).toString(), '2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935'], 'calculate ln 10 (@library)');

		var n = new CeL.data.math.integer('1.456346078907302748950623'), ln = new CeL.data.math.integer(2), i = 1, term = ln.clone(), d, b;
		// d=((n+1)/(n-1))^2
		d = n.clone().add(1).divide(n.clone().add(-1), 20).square();
		// TODO:簡化d，去掉末尾的 0。
		b = ln.clone();
		while (!term.is_0())
			ln.add(term = b.divide(d, 20).clone().divide(i += 2));
		ln.multiply(n.clone().add(-1)).divide(n.clone().add(1));
		//ln.add(ln10.clone().multiply(24)).toString();
		assert([ln.round(19).toString(), '0.3759306130875449786781684942559277322239146265567012567385045315221076226591358308684793424745823848998540396310912637275082432553179'], 'ln 1.456346078907302748950623');

		assert([(new CeL.data.math.integer(2)).power(300).log(2, 2).toString(), '300'], 'log_2 2 ^ 300');
		assert([(new CeL.data.math.integer('32000')).log(0, 200).toString(), '10.373491181781863599140134971343975463180805137687595198703383750369685938880531018737308250250888332735910757229712174568656177574039073055162215865471724878102359479118521218482934877598157962940797'], 'ln 32000');
		assert([(new CeL.data.math.integer('2.232964789167235678234')).log(0, 200).toString(), '0.80333020433568475048964622092356498085755034254471648691029669313267715630635233088538529845207507339962330259282959971945018908120167030262448460960532252740647480469141066960496792401036425428609452'], 'ln 2.232964..');
		assert([(new CeL.data.math.integer('340962365479186.206389406798106232352341234242342')).log(0, 200).toString(), '33.462793221957705370469193184995787391473221399851469792187820353348168330845466548364500036759846474062406430421378642479328630265949107196209383381633036083469391500788930777381839910475761691255327'], 'ln 340962365479186.206389406..');
		assert([(new CeL.data.math.integer('0.00000000000000000798367986748232679647928637925647')).log(0, 200).toString(), '-39.369132232445781562335871584781941588016172974007629696132117241595051306231395177467094401126003996486057240251662941825826334873943652376567200694856659806736306802640457568203157790239411250053561'], 'ln 0.000000000000000007983..');
		assert([(new CeL.data.math.integer('2893746179283692.863092367498021379480794')).power('0.20986472963798', 200).toString(), '1757.1758020271775602000734556723776659353554419055306767535403304182306676244036874955226748398377039361485645567811486387943446695377056724214824778277395977217385492444168610448439702089628871289234'], 'fraction ^ fraction');
		assert([(new CeL.data.math.integer('376478.34512328963479156364982479580629830764924')).power('32.4232298306498206739840672938647833434', 200).toString(), '6074345949760423008951333864069300038498803225714615404105746379298744467173038846444241480466185801998831268528848584313727574995268782096006068531051147304629111277571992023008165.6868594302342766688'], 'fraction ^ 32.423229...');


		assert([+CeL.permutation(42, 3), 68880], 'permutation 1');
		assert([CeL.permutation(102, 35).toString(), '26361869635948624490863154474529352861782020823433057665024000000000'], 'permutation 2');
		assert([CeL.permutation(242, 41).toString(), '1496636789970889988441005679772605586082055249910063081224767399585685746798364297527296000000000'], 'permutation 3');

		assert([CeL.multinomial_coefficient(32, 41, 52).toString(), '265171468465932729519058491487100429640902160006248672250'], 'multinomial_coefficient 1');
		assert([CeL.multinomial_coefficient(25, 93, 108).toString(), '119747520616327290599705408496397631643239333950513914041060349028904067909700272489325728000'], 'multinomial_coefficient 2');

		assert([+CeL.combination(62, 3), 37820], 'combination 1');
		assert([+CeL.combination(121, 5).toString(), 198792594], 'combination 2');
		assert([CeL.combination(521, 25).toString(), '2993705640778223566007029029114352910015520'], 'combination 3');
	});


	// ---------------------------------------------------------------------//
	// test for CeL.rational

	CeL.run('data.math.rational');

	// ---------------------------------------------------------------------//

	all_error_count += CeL.test('rational', function (assert) {
		var rational = new CeL.rational(2.37);
		assert([rational.reduce().toString(), '237/100'], 'Rational.assignment(Number)');
		rational = new CeL.rational(new CeL.data.math.integer('.021'));
		assert([rational.reduce().toString(), '21/1000'], 'Rational.assignment(Integer)');
		rational = new CeL.rational('1543', '3541', 7);
		assert([rational.reduce().toString(), '619/1303'], 'Rational.assignment(number String, base)');
		rational = new CeL.rational(new CeL.rational('253/345'));
		assert([rational.reduce().toString(), '11/15'], 'Rational.assignment(Integer, Number): 11/15');

		rational = new CeL.rational(new CeL.data.math.integer('2.5'), 5);
		assert([rational.reduce().toString(), '1/2'], 'Rational.assignment(Integer, Number): 1/2');
		rational = new CeL.rational(2.5, new CeL.data.math.integer('5.5'));
		assert([rational.reduce().toString(), '5/11'], 'Rational.assignment(Integer, Number): 5/11');
		rational = new CeL.rational('3.424', 9);
		assert([rational.reduce().toString(), '2533/729'], 'Rational.assignment(decimal String, base)');
		rational = new CeL.rational('5 345/4231', 7);
		assert([rational.reduce().toString(), '1910/373'], 'Rational.assignment(fraction String, base)');

		rational = new CeL.rational(10783, 2775);
		assert([rational.toString(), '10783/2775'], 'Rational.assignment(10783, 2775)');
		rational = new CeL.rational('10783/2775');
		assert([rational.toString(), '10783/2775'], 'Rational.assignment(10783/2775)');
		rational = new CeL.rational('3+2458/2775');
		assert([rational.toString(), '10783/2775'], 'Rational.assignment(3+2458/2775)');
		rational = new CeL.rational('3 2458/2775');
		assert([rational.toString(), '10783/2775'], 'Rational.assignment(3 2458/2775)');
		// https://en.wikipedia.org/wiki/Vinculum_(symbol)
		rational = new CeL.rational('3.88¯576');
		assert([rational.reduce().toString(), '10783/2775'], 'Rational.assignment(3.88¯576)');
		// Brackets
		rational = new CeL.rational('3.88(576)');
		assert([rational.reduce().toString(), '10783/2775'], 'Rational.assignment(3.88(576))');
		//
		rational = new CeL.rational('4.65325');
		assert([rational.reduce().toString(), '18613/4000'], 'Rational.assignment(4.65325)');

		rational = new CeL.rational('3465798269364982664792836924634');
		assert([rational, rational.toString()], { name: 'Rational.valueOf', error_rate: 1e-15 });

		rational = new CeL.rational('3904675890230754980376895067982063954768902345678390465236445872375980306973465/35672355672345723560');
		assert(rational.compare('780935178046150996075379013596412790953780469135678093047289174475196061394693/7134471134469144712') === 0, 'Rational.compare');
		rational = new CeL.rational('96734758902798637465729379805472893657892634792853764568792679542783904/2376423452342354');
		assert(rational.compare('96734758902798637465729379805472893657892634792853764568792679542783905/2376423452342355') > 0, 'Rational.compare');
		rational = new CeL.rational('456029384578901269837598304956067209385970693596892079830958734512348/9865982637948567928679856709');
		assert(rational.compare('456029384578901269837598304956067209385970693596892079830958734512347/9865982637948567928679856708') < 0, 'Rational.compare');

		rational = (new CeL.rational('8956782369452/356234543425342')).add('345345/56455464356');
		assert([rational.toString(), '252891165810722916992951/10055693284362664714054876'], 'Rational.+');
		rational = (new CeL.rational('34 356456/353425342')).subtract('53+4564/5656');
		assert([rational.toString(1), '-19 1692244901/2099762326'], 'Rational.-');
		rational = (new CeL.rational('45 45/456')).multiply('-78/24146');
		assert([rational.toString(), '-267345/1835096'], 'Rational.*');
		rational = (new CeL.rational('46.4565')).divide('56 34/3434');
		assert([rational.toString(), '9384213/11314000'], 'Rational./');

		rational = new CeL.rational('6582/234');
		assert([rational.toString(2), '28.¯128205'], 'Rational.toString(TYPE_DECIMAL)');
		rational = new CeL.rational('8962/4230');
		assert([rational.toString(2), '2.1¯1867612293144208037825059101654846335697399527'], 'Rational.toString(TYPE_DECIMAL)');
		rational = new CeL.rational('654452353461243567893536235613456236346536236/25345672');
		assert([rational.toString(2), '25821069311606477346252103144610102914.0¯8080385479619557926891818058720242256745056907546187767284292166331198478383212723655541664075823280597965601385514655125340531511652166886717385122004261713794765433719808257599167226657079757048856309668964389659899331136298141947074829974916427546288770721881037519936342583459613933297961087794397402444093808205203633977430150599281802431594632803580824371119455818729130559252877572155119816906018510773752615436671002449648997272591549358012681612860767708190968461992248617436539066709298534282302714246440181187541604736303697136142217890297010077302349687157633855594754007705931016545941255769426827586185128569485157071392701680981273647035280816385535171448600770971864545552392534709673509544351398534629502030958184892473949793084989026923413196541011025472120052685918132294933825388413453784141134628428869433803136093609985957365817722252540788817909424536070694831054390666777349600357804677658576186103883929374608808951682164907681279865059407381268091846213428470154588917587192006587949216734123285427192461103418366654472605816093572109668269991026475841713725325570377459315341885588987342691091402113938821586580935790536546042259207015698774922992769732047349148998692952390451513773239076083680085499409918979461266602045508992620120705420633550374991043835807549312561134697868732776152078350891623627102883679706736518960712503499611294583154078534591625741862358196697250717992405172764801817051842223792685394176962441556096835783245360391312568078684202967670377806514658597333698629099279750799268608857559586504551940859962205776197214262064150439570116744192065611833057730724204116584480379924430490538976437476189228677779780311210529355860045849247950498215237694230399572755458999074871638834432955654125090863639362175917055977052018979808465918757253703906528893769318880162262022486521564707378837696629231215491149731599146394698077052366179125177663468540112094877579099106151140912736501916382410377598195068570286871857254366741588070736494972396076142703969340406519898150658621322015056456187076042016167494000553625092284000203269418147603267334951702996866683984547736591872569012966000664728873631758510881068767874846640483629710034912469474078256832172372466589167570700039044141342948018896480629907938522995168563690084839731217227146315157869951130117994109605774114018361793682171851667614099953633109431858819920024215574161931867499902942009191944092072208620075253873718558340059004945696448687570801042481730214136756760680876798216279292180534806889318223639917694823794768590077232909823815284913337472370036193950588487060039284024507221587969733057383524887404839769093516242141853646650205210577963764385493507530595361606510176569790692470099037026913312852782123906598333632661229104519304124191301773336291892359374018570113272198898494385944866642320629731182507214643983398822489299159241072795386920496722280632369897314223903789175524720749167747456054824665923239281246912687894012042766118018097922201470925687036429730488108581220493976249672922461870413220844963195294249842734491316702906910497381959334122212265668079347038026847344982606892411453916076874978891859722638247666110411276528789609523866638848636564065060101779901515335636001286531286288246766548545250644764912920833189982100297044797234020861628762496413588876238909743643806327170966309356485004619329090978530772433258033166372546760646156866545104821051893988054449690661190596958723367050595462609947765440979430334299283917191069149794095023402812125083919653027941022830248888252006101870173337680689626220997415258904952293235705093950556923485792761778026639025392579845584682071163865767693987360051057237701174385906990353224803035405808139551399544663877919670072271115952261987766589893532907709055810396346958171004501281323296537570595879249127819534632974024125302339586813874968475880221285906327518165626068229715905737279327216102220529011817086562155463859865305603260390965368761972458256383969618165973267546427650448565735404450905858799088065212869479254683008602020889404707833353165779151564811538632710152644601413606236204745330879370647580383743622974368168261626679300513318407971191294513714215192242683484580720526960184760538209442621998738088301624040585706309148165414592282264206685859424046835294009959570217747629654483021795594924451006862236676936401607343454929898879777186416678950157644271574255360047269608791591716329320445715544649989947001602482664495934453819176702042068563027249780554250051054081343749733682342294968545320084628255269775447263737966781863191475057358905299492552416838661843331674141447107813910004043293860979499774162626266133326431431764760468769579279649795831019986370848640351693969684449479185243145259671947147426195683428713194110615808489907073681060813854136516877516603229143026864704948442479647018236486292413158349086187180201811181017413939547548788605802205599441198481539570148307766312134079538313286781269796279222740671464540375966358280025086728811135881502767020736321372737720270348326136312345555485764985832689699448489667190516787244780884089401930238819471821461273546031843227514346433584400524081586789255380563592869031051928707986120865132319237777558235583574189707812836842518912104599159967035003056932165775679571644421185597288562717926752938332035544372230493632206713635369383774870912872225285642456037464700087652045682592278476577776276754469165386500701184801886491705566141627651458600111293162793237441090534115647042224802719770065674328934738838252148137954282687789852247752594604711999744966320088100248436892894376602048665350044772930068691806632706365015691830936658534837821620985231719245794706094200224795775783731439434709010674485174431358537268216837967444698250652024534997533306672634286437542472734595476497920433910767881790626817864604260640633241051963427917792039603447878596393104116552916805677908244058393874899036016878936964070236527956331163758451541549184413023256988412064986874287649583723801049741352290836873451214866190961518005914382542313338545531560575706968826867166907233708382243721926173431108869395926846997783290180666742629668686630206529935367269015396395881711086610763368199509565183357537334184708142676193395069580321247745966254120230073205397749959046262415137385191444125056143707691001445927336233184111275487191659388632504989411999019004112418088579383493955102078177291965271230528036502642344618047609864121969226146381125740126361613138527161560364231021375168115487330539115317202873926562294343586550003487774954240708236104373164775429903772131194627627154647941471033003188867906126142561933256297169788988037089724825603361394402957633161196120584216508443729564558398767253044227827141454367435986704159984394968892519401339999981061855452086652111650462453708072920694310255415599160282670745522154630581505197415953303585716725127666766933620856452336319983940453423369480990679592160744445836748775096592428087919704792202787126733116407408728401440687782908261418359710486271581199346381504503017319880096294152311290069562961281910379018555909663787963483469682713482601684421703239906205682769034492358300857045731515818558687258321657441159973978989391167060001407735411394892193033982290941033246228389604347440462418988141249519839126774780325414137766795056765510103657934183003709666881193759628862868579692816982717996192801674384486629512131301943779592823579505013715951188826242208137152567901928187187145797515252308165275712555579508801344860771495819878044661826287344048325094714395420251631126608124653392500305377580835102734699636292933957324153804247131423463540441934228455256581873228691667752979680317807316373383195363689706076840258960188548167119025291576407995810882426001567447097082294760225730057581428497930534254526768909500604284628949668408870753160539598239888845716933447256793980447628297249329195138325785956671419088829051366245093047838700035256512433365349318810722398680137579307425741167959563273761295419588796067431157477300266491257363387327035558575838904567217629897522543493816222351492594080756667252697028510429709656149578515811299065181621540750625984586244152453326153672311391073000550153099116882756156554065719780481653830287080176844393788414842581407981607274015066556530834929135041280420578314120059629904466529828051116577220757847730373848442448083443989964045932575786509033968402968364776439938148019906515005796650410373810566158987617294187346857483202654875357023479195974760503489510950824266959660805205717173330421067549520880724724915559547996991360102821499465470870135145755851334302755910358186596906959105286298978381792362814448162984197065281993706854566728394496701448673367192631546719297874603600961931488737011983742234177101321282781533667759923666652042210599111359130663412672585678533202828475015379351551617964597663853615717902448986162213414582181920447798740550260415269320931794588046432542802573946352655396155998546813041690115772033978818947866128781276740265556975565690268539733331986620832148384150161810663374796296582706507051775940286767697459353218174684814038467790477206522675745192315279705347721693865524654465661829759337215442541827259502135117979905997363179007445531529012132722304620686324671131229031923083357190134867996397964906986881231635917958695275469516057810580046960285763975798313810736602288548514318342003321119282219070774686897234368060945474241124875284427258428973593598149617023371879822322327851476970111504638740689140141954018816309151321772016934488854744115681762156473894241194315147769607371230875235819354089329334018052470654555933652104390840377007956230160320862670360446548823010098134308689862316532779245308627050803782199974812267751275247308495115063431736984523432639702746883175952091544465658673401912563217893769003244419796800021715739081607305578640803053081409717603857573790112962875870878467929356933207373629706878555044821853608773916114751267987686418414946741202995130687400989013035440528071222574015792518738504940804094679359852837991433014678008931860240280865309075253558082815874836540139870822916038683054053567804396742765392055890252189801872288097155206616735196446951574217483758173782095815017254227861861386038610457832800803229837425498128437865052463394933856951987700306387615210991446587014934936426226931367217251134631585226858455360741668242215081138902136822412915309564488958903910695285569859816697698920746705788664826089440437799400228962167584272375970145908934669398388805789012025406152182510686637150516269602163241124559648684793206508787772523845491253891394159918111462974822683730776599649833707309082197544417050769062268303637796622634428473626582084704639119452031100220976583299902247610558520602649635803698556503058983798101703517665659052164803521484851535993995345635341607829533973295322372987388142638317105973753625471046891161536375914594018260790244582980478876235753386219154102522908053098769683439444809354433372293305144957292905865743074399447763704982846775575727485150127406367446087047918871513842678939426029027756691556649198332559499704722762923784384174150127090731703621825454065688216907407308040599594281816635203043738591740633272615537674440038520186010455749604902959369157779679307772940484671307985047703607937481397218428455950980506652181090325796057015177975947925152665117736866475664957709545045797168052991453531001269171320452659530984224841227330646431469641049564596275056348870923603840529460019840862771363884137694198835998508936752594289076257279743855282274622665360776388173886255610030777641247783842543216056768982096825051630116573748764680612926735578366199957136666173222789279368880020225938377171455544757306099439778120698476647216140096818107643782338854538952449159761871770454537563651892914892925308904810257151595743841394301954195572324931846352308196839286802101755281927423348649031676887478067261345447853976805191829200661951279098064553190777502368057157845331542205706757350919715208182288479074454999654378862000581401037620939780172330802671162161334684675158741105779322008112469852841147790439330233579918496538580630255137839706913274976493028079902556933586136520665145512811812604534612457700865062879374435209293326292552038075770885064716374456356888071462457180066087811757368279681043769524043394864417088645351364130333573321709521057480740696084128288253710534879485538990641084600163688696042464370248301169525116556388798845025691171257956782522870176809673856743668110279340788439146533577803737064063639740938808014244009785970559391757298839817701420581786113226747351579393909934603430518630557516880988596396260473977569030325966500316109196078920298503034364210189416165410804653354624016281754139326035624543709079798712774315078329744028881932978537716419592268060598274924413130573140850240624908268362346044721165806927510148478209613065299669308432619186423622936491879165799983523814243315387337135902334726023441004049922211571269445923548604274528605909521751879374119573550861070087232250145113532598386028194478331448461891245179847667877971434334035412436490143169216424800257811274445593709253398371130187433972948123056275643431351908917625068295683775912510822360519776315262029746143641407495528230618623960729863465446881818718398944009060008351721745629786418762146057914739841973809177361720770315342201224729807913556207939564593118698924218698955782273202304519682887082260040294058883110299857111699385993790182402739213227410186638570877110695664332750774964656687737456714503367675554232691088245756514169361932877534278830721079322734074677522852816843838269508103789869923354172657170028871201363293898855788869989322042832401524015618919080149068448451475265678495326539379188683574852542872013809695004338413280184482778756073226229708961750945092321876492365244843379966410044286851025295364036905393552003671474956355467710621363678974461596441396385150095842793199564801438288951265525727627186211515717555249669450468703295773732099113410762989436618606916399770343433782304134607281274688633230951619669030673165817027853907365328486851719693997460394816124820048172327015042252578665107005251231847393906146974520935960979846973479338010844612839620113445798556850258300509846414804073847400850133308755830186708010740453044606590032412634393753694910910233510478633196231687997856202037176209019038832349759753854622595920913045824943998328393107904181826388347485913965903133284451878016885880950404471422182059327525425248144929832596271268719961340934262859552510582477355502746188777318668055043085857025215192558319227045942991766010386309741560610426900498041638035874527217112254904900528973940797466328768083166230510676536806757382483289454704534959657017576807590660843397642011622339309054421599080111192159355648569901796251446795334524963473053703212130260345829457589445645789150905132836880395201200425855743734078149516019934290951133589987276723221226882443677169025149540323886460773263380035849907629199967552645674575130617961125670686498270789584904278726561284309210661291600396312238239333326810194655718735727346270400721669561572484643532039710764031034568742150533629567998828360123969094210640775277136072778026954661135045068049487896789637299811975788213466977715169674727898317314293343652517873663006449385125791890623377435011389715766857552642518217705965736477612430240555468405019997102463884169257773082520755417335156866229469078586671523248624064889658478970295204640855448614658944533015340843991037207456957542889373775530591573977600593900213022562589778641497451714833207026430390166810333535445420425230784963997009035704399551923499996370188961649941654733005303627380643133076132287989839054178559558412970861455162838057716520595705649469463662277330820031127996921920239479150523213588497476018785376848560180215383517943418505534199290513978086672943609465158390750105185611176535386396541389788363078319643685123045859663929999567579032822645223216018892693000998355853417498656180826454315356089197398277702007664267098540531890415057844984342888995012639633307019833603149287184021003664846605763698038860441340833259421963639393739491302499298499562371043071969052546722769867770718409044352818895470595532049811107789921687615936953654257026603989825166205891088624519405127628890644525029756559620908847869569210869611190423359065011178239819405853591098314536698809958560183371740942595643153592455548229299266557225233562558530702993394690817430289479008487129479147366856163845251370727120590844859035499236319321105394246402304898445778040526998061049634036138398697813180885478199197085798316967094026940773162376598261036440462103352398784297374320949154553882019778366894355770089662645362095745577390885512919128756972788095734845775641695355325358901511863642834169084173424164883061691952772055126413693036033923267057192249627470914955421185912924305183149217744157661315904348482060369123375383379063691820836314775950702747198811694556766930464499027684095335882197165654159810795310536647045696795886887512787193016622325105446010664069194930006195929624592316984138357033895175476112844828103196474727519554423335076694750882912080610843539678095731689418217043130677300645254148321654284802549326764743108803743692414231510610568936582150988145037148748709444357995321647025180472626648052574814350947175517776762833512561829096502156265574651167268320997762458221664037946991502138905608815580032756677353040787397548583442569603204839074694882818652431073833828513207304189843536206102564571971104179048793813791956275611867777662395378587713121198759299023517703535341260630217261550611086579199793952987318702774974757031496343833377154095578921718863875457711281042380726776547885571943012597969389014424237794918201419161425272133246259953178593962708899570703826673050925617596566388139166323938856306512606965007674683078041884231753650090634803448888630768992828440295447680377146835956845018747184923721888297142013042700150147922690706326508131250179517828527095276858313324657558892105918517370539632959820516891404575897612815316161275976427060209727325438441718964878895300152231118590976794775849699309609940505818902730217608749927798323911080361175667388104762028010147057848771971798577682217303214529091988565148321969920545014549229548934429515224532219938772978676596146276965945112838199752604705055758632085193874520273125920670006303245777030492622172337746657496396228910403322508079485917753532042867121455686793390208789887283320008244405593191610780728165345152418921857743602142409165556944002116022017486851404058254995172351318994422400794897053824416255366991255943026485942057484212689251245735366574616762972392288513794386670828849990641400235906153918507270195874072701643104984551208585039686460078864746612360485056383590855275015000588660659697639896862864792063907400048418522894165126101213650993353026899424880113654118146877305127281691327813285045273212720499184239423598632539709343670193475241058907414252026933829176042363366810712298336378692188551954747934874245985665718391684386983308235031211640393673523432324067004417953487285718839887141283924135055484028989249130975892057626248773360595844529196148360161845383306467471053835147870610808819746424557218289576224295808767666527050456582883263067556464867058959809785276160758333809417244885043884415453652205394277965879144968024521109560638202845834981214938787182285007081287882207265997918697914184323067070385823662517213984304697070174347715065514932884793900907421196013268064070268091530577686004932124111761566235055831228305960875687178465814597458690383115507846862375556663086305227969493174219251318331587341617929877732182441246773808167327344881603454822582727339010778644969444881950654139294472050297186833318130211737925117945186065692004536316890710177264189325893588459599729689550152783481140290934089259894154710121712298652014434653774419553760500017517783706819846796723322230320032548357763013740570776738529560392006966712107692390243194183212029256908240586400707781588904014855080583383230083621377251311387601007383035652004018674273067212421907771867323146926228667363800809858188017267800198787390604597108334708979110910927909112056685654260814232899407835783560996133777790543490028593441909924503086759743438643094568571707232698347867833214286052466866927024069434813170469498697844744459724721443566380879544247238739615978617572262435969344194148807733328198991922565714572491903154116410880721568558134895772343301846563784144290985853521658451194349867701278545702003876638188957862312745150335725957473133874690716426851890137298391614947119965886088954358756003786366366612808687810684206755299287389184236267241207887484695611937217525737727529970402836429036089475157731071403433296225091210838678887661767263460207328493795706028232354620544288587021878922760461825592945414901605291822603874933755948550111435198877346791199696737178639414255814562738758711941036718221556721794553326500871628102817711836561287465568085943825044370494497048647990078937342833127486223288930749202467387725999137051880100081781220872739140631189419637403971770801736880363637626179333497253495586938866722492108317349013275323692344791647268219994324869350475300082791255248627852518568061639872874548364707000074805670964257724158980673307853111963257474491108383316883450555187489209203054470206984450836418935745716270612197617013271536063435208977690550086815610965059438944842338368459909052717166070798990849404190190735522814309283257512367397479143579227254262581793057213081586473619638098370404225226302936454002876704156828037544240294753281743723346534272202370487553062313755184711614669360512516693185329629453107418102782991904890112994439445124990175837515769950782918677397861062827610173444996842064396635449239617714614155821159525776235090551159977135346815819284649465991669110213372918263915038433386181277813427081357322070608346860955195821992804136343277858247356787383660610774099814753382747160935405460940234687799952591511481723585786164991009115875878138090006057049897907619099623793758555701344197936436642910868569592473223830877319015254359797601736501600746667912375730262744661100325136378313425660996480977107255234739879850098273188416547014417293808583966524935697108366272553357433174389694619262807472613075715648809784960525015868586952439059418112883335663777231868225865149679203613145471147894599125247103331882461037134860736775888206870190697646525213456561735668322386559725068642883092624255533646927964663947359533414620058209543625436326959490361904785953199425921711604253381011164351846737383802646858209164862545368692532594914035027360884335597809361692994370005261647826895258488313113181611440406867097467370366033301464644535761371803438472651267640487101703202029916586942338715659225764461877357207179198089519978006501465023298652330070396239642018566325643289315824808274959133062244315321369265727103230879023448263671998911687959979912941349513242339757257175899696011216431744244145509339819437417165344836783179392521137336583539785411884127593855077111390062966174264387229504114154085162942217511534119119035391920166882929756212421592136124857924461422841738029277740199589105390458773395315776200370619488802664218175000449780933012942012348301516724433268133510131433879519943286569793848827523689251561371109039839227778217914285326504659257012400381414231194974826471359686182319411377216591455929832911907011185183805740088485324042700465783665155928791313956875951049946515523439268053338652847713013882606860847879669554628498309297145485035867267595035554788209994984548052227615034235430806490354645163876499309231177614860635772450617999001959782324966566283979371310415442920590150460402075746896748289017549031645323903820739098967271414228038617401819135038124063153661895411571648208814506871232295596660447590420960233368442549086881578835234670439986755924246159265376747556742626512329205554305287309012757681074701826804986665968059556676974277896439281625675578852279000533108769023760743057039481928117747282455166310050883638042818513551347149130628692740914504062074187656180510818572890866732592452076236132149110112369480675043849695521981030923149325060310099491542382462773131444295499444638911132441073174149811454989238399360648240062445375289319612437184541802639914222830627651142964368827940328431615464762583529053796640310030051679040113830874162657829707572953678245343031346732491448638647260960372248169233784766093398510009914118670832637619550982905483823826016528581289933839592021864719152050890582029152748445572877294395666447510249481647201936488407172632866076701379233503850282604462016236933863895974034541281840939155213560721530681845799945647525147488691560436827242142169282392670433042769590011265039648583789768919916583785981291007001116403621099491858018205238353909101325070410443250429501336559551468984527220268612329552753621999053724044089263050512134773936946710270692369095599438042124114917923659708055876364217133402499645698879082787783255460735071455197557989387695066834290288298530810309547128993068323459721249450399263432431383156856129125319699552649462204040200630703340594007529175000765416675478164477154127142495965386121938293843619533938575390701812917013997498271105220646743949026090134836432823718384740400649073340805483476626699816836578647431403673179389364779911931315137353627869878533897227108438868774124434341295034513190259859750414193003049988179441444677418693021830314856122181333365317755236475876433656996744848587956160720457520321418189267185340361068351235666586389976166345086451051682512106997991609770693789456440531543215741133239631602586824290947977232562624498573168626185961847845265258699789060633310491826770266734296885085548333459061570748646948480987207598993626998723884693213105574790046995005695646972784939377421123417047297069101186190683758552544986773284211994852612311877152043946595694917854219844713527421959851764829908632921628592053112657656107914597805889699827252558148783745011771635015240471824933266713149290340378428317071253821954296575762520717541046061039533692379511578939394465453510169310168615769982346492923920107543410172750598208640907212876423241017243496246617568474807059761524571137825818940606506704576623575022986172945029825999484251196811826492507280927489316519206908382622484817131698066636386677772836324876294461634317685480976791619492274657385292447562645014896428865646174226510940408287458308463867124927679960507655902751365203495097703465901397287868319293329448909462727995533122972632171678067955744081277466227764645577359321938672606510492205533157692563842852539084384900112334760743372675224393340212088280792081583001626470980923291361144419449600705003994370320897390292117723294138738953143558395295259877110380028590285552499850862111685182385379247391822951074250467693261397843387226032120986967715829353429650632265737519210380375789602264244562148519873531070709034662801601788265862510964396603885665371192367675238596948623023291708343736161345416290402558669582720079388701944852754347961261394055758316449451409297808320095044234771127788602330212432323751368675488264820913014261369751806146627321619249235135687071149662159283052349134795084541455440597511085916364734776020142610541160636814048568134236093641549531612339968733123351395062636334913511072028392066306231691154213626689400857077295090065080933738904220018313185777832207408034002807264293485688601983013115612006657389080076472227684474098773155432611926801546236375188631810590778575529581539601711882012834380560120875863934481595122038981645465939904848449076434035759635806854913927711208446159959775380980232049085145582251675946883554714982502732616440392663489056435355117039311484816816062324171164212967010699104762343645889523071236777624203453749421202957254398305162317258741452978638719857181139249336139124660020850897147252596025072840838467411714315564408787425324528779509180107751729762777645035412752125885634438889606083437045977711697681560780870201429261769031020365133739598618651736675200405023784731373466838835442990030013802751018004178385958754614989099519633963542177930812013980138305269633411179628616672700569943460169452204699879332455655545451704732863267543271293023913510756392649601083766885328587855157282868649132680325066938450083312054223695469585497673922395902543045613468050876694056484278657121420966861719034318758642501173375872614464512915656763805670648621981693758208502027486191725356502680220907143436559898668301238964979898737741102307328840995022739977065906952476935707208710031440476306960809719308290583102314272827329257634202794070719450642302954129604454756614857163779283500551889095700441479712986106661523908302766641973430414470762503357575210473803969371970094144672905101904577633609398874884832408468001953153974374796612218448972274240746112393468991471206602847223778481785766027430639834682623526415081833300770245902337882380865656274570269827527161244728488556152703309661704767583199214445764152554329591261182579810864750399989394639053168525182524258974076520835588813743032735529758295617492406593125642910552933850008001366071493389482827679613308339191006653917086909354780571610016889668579314054091759729235034683633560790970545188148887904806785158428626394281437872312085471633973642521689699132853924725294322438955258317869812250391309411721259550743022319550256943276153814347475182350659315720648479945609648858392864864660128167049585428234059053553600788331830381139628099030082926978617887898178434566658954633359099731109910993876982231917149405231788685658048443142482077413453468505392163206404627977510322077867968937655312512526793529088516571981204522807680932665742695636556805438025079784824801646608541292572554399031124524928753122032037659131705010622720912667062053040061435340913430900549805899800171011445267657531431796324043016101526130378393597139582647483167934943685849008067333941668620977972097169094589403666235403030545017705586973586654163282788477654094158560877770374366085065726408832245599958841099182534990589320338399392211814308967621769902175014337753601482730463804629050671846459624349277462440135735994689744268765097252106789672019743646962684595618534004543260877044412158415054057355433306325434969725797761448187288149235104123496903139912802469786557641872742612624356537084516835852685223733661510335965840637407443763968854327476501708062820350551368296725373862646056494379000880308085735505454343447670276803077069726144960764899032860521512311845588469700073448437271657267560315623117035523855907233392746501256703708625283243624394729009355127770926728634379865722242440445059022305662284274806365362891147648403246124229809333917049033065684744914240190593486730199933148349745865881954126132461589497410050915201617065035797827731693205845952713346878315161657580039700663687275681623276747209543309800584494267897098960327427893803723176090971271150356557916475838557367900918152811257085627873666162806809778016538681633692726710895651139176739918357658853945557253325143637935502361113171511096647979978593583946008612436868906060174691758024802025371432250839512166021875450767294708145832550819721804969306002223969441409957487021847359186215303346464832339028138610805032117514974548711906316786550382250665912507666003095124090613971489885926086315643948994526560589910577237802177823495861541962667235652698417307696556634994724148564693806500770624665228840647823423265321195666068747358523380244169497656246794324490587584341815833488257876926680026475526077982860347912653489716114056869354262928992373924826297760027826447055734012497281587168018271521859826798042679633824662451246114129465575029930159279264720225212414963785533088252700500503596827103262442597694785918479494250537133124740192329483313758656704781786807625380775068816482750980127889290132058838290024427050109383566551322845178458870611124455488889779683095401850067340885654955212866322897258356377372831148450118031985894869940714138492757264435521772711333122278233538254578533171264900768857105071035402020510641816875086208012160813885700091124038849709725589441858160241322463259210487691942040439882596129232635851990825100238020913393024260710073104394312370175073677273184944553847299846695719884641448843810493562766850293020441517589275202488219685001841734557284573082141992526376889908462478327660832981662510269997970462175948619551298541226289048481334406915705371710010292881561790904577317973656409662367602642376181621856386368449808708958278951925204429379501162959893113112171577064518155210088728363564398687081565641660635393687727040735002015334215640445437785196620551232573356113816986189989359919121497350711395618155241652302610086645167664128218813847192530543281709003414863097731241846734227445222205984516804289110977211415029753403263484195644921152613353475102179180729554142419265900702889234895803906876093086030624873548430674870250037166108675279945230885967434597906893137416123746886647945258661912771537483796050071191641713030926936953969892769069212289972031516860156637393555791300384539025045380528872937359877457579345302030263786259050460370512172650226042536966469068170692021896282726297412828509735311022726089093238482688484250881176084027284816121663690747674790394194322407391684071347565769808746834568047751900206078576255543747271723551066233319834644747237319255137524071170809754028222254276785401468148092502735772797817315713704493611374754632664701097686421571304165855219778745657246728356620412352846671415932471626714020444989582442319935332549083725221410582445791928499666530838085492465932645226372376317345225646414109675213977360710735939453489337351165911087305162001622998987756173914031555367717218150696497611110883151963775117108751348159165004581452801882704076656558958073788692602034777377376303141617235479098758951824200991790629974222028912865281299308221143238971923885071975996533057004761996446572811326525491216015105064091415686275747591146922441038454218140280518109758541813371529466648191454541035645060032340038172986693744004893616551180809094349520501961833957292590230000609176982957879357075243457739056987717666353450798227010907424352370692716294916149786835401326112008393385663635195784116515040516582081548281694799806452162720325584581067726276896505249495850810347423418088895019236420324542983117591042762646024930804754358061605152942877190235871433986836095724745431882808236451572481487174615058539382976312484435212449683717204262723829141322431695636241169695559857320018976020837009174584126236621384510933464301124073569641396763912986801060157331792189214789807111841422077899532511901834759007376091665669783780047339048654934065271577727353214387055904455798212807299013417359776454141756430841525922058803570092755875638254925732487976645480143513259384087350297912795525800223406978516884460589563377921090433112209453353613981905865427438656982541240177021149804195367161699243957706073052630050605878589449117782318022579949744477084687279153616443864656656173882467981121194971670113935033957671353120958876134749948630282913785043852851879405683147797383316567814812722266744397228844435452332847990773335976256616908796105307446573126962267956438479910889717187218393736019309332181052449506961188482199248850060081263578255096175788907865611138659097300714694011664003227059830964434480174761197888144374313689532477181903087832904963024850948911514360321557068993870038245582914511006060521891074736546736657840439188197495809146429418008723540650253818482303408645073604676964177552680394506801792432254311505333139322563631376591632685848692431591476446156172146471397562471415238072993290531022416766065622564672974541767919982551656156522502145533959407349704517599691181989572026340433980207745132975760121885898310370307009417623647934842682411419196145203804420731081819412797577432549430924538122327157078336688015216167872763444583359241767194020343986144853448746594684883478331132826148779957382862052345662801917424008327733429202429511436903310356103401006688637018580529251700250835724537112292781189624800636574165403860667020389122056025975559061917947963660225698494007181975684053671964191756288805441812708694407471224278448801830939814892262473845633289975503510027274084506419873183871392322918090315380077513825634609332907014657176972857535598188124583952636963028638577821097029899226976503128423661444052459922940689834540587442305731724138148714305148429286072983190187263529647191836144648285513992290281354544476074652903264904556486014653704979690418151075260502069150109730765868034589889745278799473140818677050661746115865462158588653715711305661968639063900140426341822777474592111820905754639293051689456093332226503996421953223414238138961160706253911910483178350923187201349405926187319081537865715298454110824128079934120507832658767145728075388965816333455273941839064278903317300089735241582862746744296225406846581144110126573089085978860611784134190642094634539577407929843012250770072302679526508510013070476095484862267609239163199145005900810205387333979544910073798792945793664496250089561641924506874388653021312672238479216491083763728971163202932634810392874965003887054168459214654083742581376418033027492820075948272351981829481577762073146058230375584439031642167546396086874319213157970323296221934853414026663013709007202492007313911424404134954480591400377942238027857379358495604298832558079343881669422692757958834155196200755695094610235625238107713222202196887894706441399541507520495017847623057696004272445410009251283611655670443458749091363606378240829440229479810201915340812427462960934711062306811198377379775134784352926211623033707687845088502684008536053019229476338208748223365314598879051224209008938488590872634980836175896224018049314297131281427456332584119292635050276039238572960306595934801018493413786779849435438129239579838325059994463749077159997967305818523967326650482970031333160154522634081274309870339993352711263682414891189312321251533595163702899650875305259217431678276275334108324292999609558586570519811035193700920614770048314363099151602687827728536848421300488698820058903942258859816382063178281483323859000463668905681411800799757844258380681325000970579908080559079277913799247461262814416599409950543035513124291989575182697858632432393191232017837207078194651931106817763600823051762052314099227670901761847150866625276299638060494115129399607159754927784120302669426164751125951602309064837578581463533497947894220362356145064924694046383934898234302093075299009629730866871472178760934016663673387708954806958758086982266637081076406259814298867278011015056140551333576793702688174927853560166011775107008407589272046130795032777193676301026857760962108244752792508322525439451753340767607187530873121059879572338819819020777985290743129635702695118914187795060237503270775381295867791550368047057501572655086832970930895026180406658777877343319206529619731526550173931075885460839231250211081402773617523338895887234712103904761333611513634359349398982200984846643639987134687137117532334514547493552350870791668100178997029552027659791383712375035864111237610902563561936728290336906435149953806709090214692275667419668336274532393538431334548951789481060119455503093388094030412766329494045373900522345590205696657007160828089308502059049765971878749160803469720589771697511117479938981298266623193103737790025847410950477067642949060494430765142072382219733609746074201544153179288361342323060126399489427622988256140930096467751969645941918604486004553361220803299277288840477380122334101064670922909441896036530418289954987186767034624294041207508721804653670259758746976604131861250315241197787140936724818343739317702840942627206727838977794709881829134378445361401346943967396090346312380275417436160303818340267324535723495514342645955490941412009119347871305207453169913979791105952921666468342208484351884613672898473553985863937637952546691206293524196162563770256318317383733206994866815920288087054862857848077573165154192794730398152394617905573780012619116983759594142936908518345854077177357933141405759531647059900404297822523703455169782044050755489931377633230635983926565450701011202228135833210498423557284257446399527303912084082836706795542844553500100529983975173355040655461808232979579314369727502194457499489459186562502663176577050314546799153717447302245527362620332181368085249426410947005074475831613381566683258585528921860899959567061390205002258373737338666735685682352395312304207203502041689800136291513596483060303155505208147568547403280528525738043165712868058893841915100929263189391861458634831224833967708569731352950515575203529817635137075868416509138128197981888189825860604524512113941977944005588015184604298516922336878659204616867132187302037207772593285354596240336417199749132711888641184972329792636786272622797296516738636876544445142350141673103005515103328094832127552191159105980697611805281785387264539681567724856535664155994759184132107446194364071309689480712920138791348676807622224417644164258102921871631574810878954008400329649969430678342243204283555788144027114372820732470616679644556277695063677932863646306162251290871277747143575439625352999123479543174077215234222237232455308346134992988151981135082944338583723485413998887068372067625589094658843529577751972802299343256710652611617478518620457173122101477522474053952880002550336799118997515631071056233979513346499552270699313081933672936349843081690633414651621783790147682807542052939057997752042242162685605652909893255148255686414627317831620325553017493479754650024666933273657135624575272654045235020795660892321182093731821353957393593667589480365720822079603965521214036068958834470831943220917559416061251009639831210630359297634720436688362415484584508155869767430115879350131257123504162761989502586477091631265487851338090384819940856174576866614544684394242930311731328330927662916177562780738265688911306040731530022167098193332573703313133697934700646327309846036041182889133892366318004904348166424626658152918573238066049304196787522540337458797699267946022500409537375848626148085558749438562923089985540726637668158887245128083406113674950105880009809958875819114206165060448979218227080347287694719634973576553819523901358780307738536188742598736383868614728384396357689786248318845126694608846827971260734377056564134499965122250457592917638956268352245700962278688053723728453520585289669968111320938738574380667437028302110119629102751743966386055970423668388038794157834915562704354416012327469557721728585456325640132958400156050311074805986600000189381445479133478883495375462919270793056897445844008397173292544778453694184948025840466964142832748723332330663791435476636800160595465766305190093204078392555541632512249034075719120802952077972128732668835925912715985593122170917385816402895137284188006536184954969826801199037058476887099304370387180896209814440903362120365165303172865173983155782967600937943172309655076416991429542684841814413127416783425588400260210106088329399985922645886051078069660177090589667537716103956525595375810118587504801608732252196745858622332049432344898963420658169962903331188062403711371314203071830172820038071983256155133704878686980562204071764204949862840488111737577918628474320980718128128542024847476918347242874444204911986551392285041801219553381737126559516749052856045797483688733918753466074996946224191648972653003637070660426758461957528685765364595580657715447434181267713083322470203196821926836266168046363102939231597410398114518328809747084235920041891175739984325529029177052397742699424185715020694657454732310904993957153710503315911292468394604017601111542830665527432060195523717027506708048616742140433285809111709486337549069521612999647434875666346506811892776013198624206925742588320404367262387045804112039325688425226997335087426366126729644414241610954327823701024774565061837776485074059192433327473029714895702903438504214841887009348183784592493740154137558475466738463276886089269994498469008831172438434459342802195183461697129198231556062115851574185920183927259849334434691650708649587195794216858799403700955334701719488834227792421522696261515575519165560100359540674242134909660315970316352235600618519800934849942033495896261894338410123827058126531425167973451246429765208040252394965104890491757330403391947942828266695789324504791192752750844404520030086398971785005345291298648542441486656972440896418134030930408947137010216182076371855518370158029347180062931454332716055032985513266328073684532807021253963990380685112629880162577658228986787172184663322400763333479577894008886408693365873274143214667971715249846206484483820354023361463842820975510138377865854178180795522012594497395847306790682054119535674571974260536473446038440014531869583098842279660211810521338712187232597344430244343097314602666680133791678516158498381893366252037034172934929482240597132323025406467818253151859615322095227934773242548076847202946522783061344753455343381702406627845574581727404978648820200940026368209925544684709878672776953793136753288687709680769166428098651320036020350930131187683640820413047245304839421894199530397142360242016861892633977114514856816579966788807177809292253131027656319390545257588751247155727415710264064018503829766281201776776721485230298884953612593108598580459811836908486782279830655111452558843182378435261057588056848522303926287691247641806459106706659819475293454440663478956091596229920437698396791373296395534511769899018656913101376834672207546913729491962178000251877322487247526915048849365682630154765673602972531168240479084555343413265980874367821062309967555802031999782842609183926944213591969469185902823961424262098870371241291215320706430667926263702931214449551781463912260838852487320123135815850532587970048693125990109869645594719287774259842074812614950591959053206401471620085669853219910681397597191346909247464419171841251634598601291770839613169459464321956032572346079441097478101981277119028447933832648035530484257825162418262179041849827457721381386139613895421671991967701625745018715621349475366050661430480122996936123847890085534129850650635737730686327827488653684147731415446392583317577849188610978631775870846904355110410960893047144301401833023010792532942113351739105595622005997710378324157276240298540910653306016111942109879745938478174893133628494837303978367588754403513152067934912122274761545087461086058400818885370251773162692234003501662926909178024555829492309377316963622033773655715263734179152953608805479688997790234167000977523894414793973503641963014434969410162018982964823343409478351964785151484640060046543646583921704660267046776270126118573616828940262463745289531088384636240854059817392097554170195211237642466137808458974770919469012303165605551906455666277066948550427070941342569256005522362950171532244242725148498725936325539129520811284861573210605739709722433084433508016674405002952772370762156158258498729092682963781745459343117830925926919594004057181833647969562614082593667273844623255599614798139895442503950970406308422203206922270595153286920149522963920625186027815715440490194933478189096742039429848220240520748473348822631335243350422904549542028319470085464689987308286795473404690157751587726693535685303589504354037249436511290763961594705399801591372286361158623058011640014910632474057109237427202561447177253773346392236118261137443899692223587522161574567839432310179031749483698834262512353193870732644216338000428633338267772107206311199797740616228285444552426939005602218793015233527838599031818923562176611454610475508402381282295454624363481070851070746910951897428484042561586056980458044276750681536476918031607131978982447180725766513509683231125219327386545521460231948081707993380487209019354468092224976319428421546684577942932426490802847918177115209255450003456211379994185989623790602198276691973288378386653153248412588942206779918875301471588522095606697664200815034614193697448621602930867250235069719200974430664138634793348544871881873954653875422991349371206255647907066737074479619242291149352836255436431119285375428199339121882426317203189562304759566051355829113546486358696664266782904789425192593039158717117462894651205144610093589153998363113039575356297516988304748834436112011549743088287420432174771298231903261432563318897206592115608534664221962629359363602590611919857559902140294406082427011601822985794182138867732526484206060900653965694813694424831190114036037395260224309696740334996838908039210797014969656357898105838345891953466453759837182458606739643754562909202012872256849216702559711180670214622835804077319394017250755868694268591497593750917316376539552788341930724898515217903869347003306915673808135763770635081208342000164761857566846126628640976652739765589959500777884287305540764513957254713940904782481206258804264491389299127677498548864674016139718055216685515381087548201523321220285656659645875635098568307835751997421887255544062907466016288698125660270518769437243565686480910823749317043162240874891776394802236847379702538563585925044717693813760392701365345531181812816010559909399916482782543702135812378539420852601580261908226382792296846577987752701920864437920604354068813010757813010442177267976954803171129177399597059411168897001428883006140062098175972607867725898133614291228893043356672492250353433122625432854966323244457673089117542434858306380671224657211692789206772659253224771471831561617304918962101300766458273428299711287986367061011442111300106779571675984759843810809198509315515485247343215046734606208113164251474571279861903049956615867198155172212439267737702910382490549076781235076347551566200335899557131489747046359630946064479963285250436445322893786363210255384035586036148499041572068004351985617110487344742723728137884842824447503305495312967042262679008865892370105633813930836002296565662176958653927187253113667690483803309693268341829721460926346715131482803060025396051838751799518276729849577474213348929947487681526060938530254790640390201530265206619891553871603798865542014431497416994901535851959261525991498666912441698132919892595469553934099675873656062463050890897664895213668037683120021437979628237909809611676502402461453774040790869541750560016716068920958181736116525140860340968667155481219831141190495955285778179406724745747518550701674037287312800386590657371404474894175226444972538112226813319449569141429747848074416807729540570082339896136902584393895730995019583619641254727828877450950994710260592025336712319168337694893234631932426175167105452954650403429824231924093391566023579883776606909455784009198888078406443514300982037485532046654750365269462967878697396541705424105543542108490948671631196047987995741442562659218504839800657090488664100127232767787731175563228309748504596761135392267366199641500923708000324473543254248693820388743293135017292104150957212734387156907893387083996036877617606666731898053442812642726537295992783304384275153564679602892359689654312578494663704320011716398760309057893592247228639272219730453388649549319505121032103627001880242117865330222848303252721016826857066563474821263369935506148742081093766225649886102842331424473574817822940342635223875697594445315949800028975361158307422269174792445826648431337705309214133284767513759351103415210297047953591445513853410554669846591560089627925430424571106262244694084260223994060997869774374102213585025482851667929735696098331896664645545795747692150360029909642956004480765000036298110383500583452669946963726193568669238677120101609458214404415870291385448371619422834794042943505305363377226691799688720030780797605208494767864115025239812146231514398197846164820565814944658007094860219133270563905348416092498948143888234646136034586102116369216803563148769541403360700004324209671773547767839811073069990016441465825013438191735456846439108026017222979923357329014594681095849421550156571110049873603666929801663968507128159789963351533942363019611395586591667405780363606062605086975007015004376289569280309474532772301322292815909556471811045294044679501888922100783123840630463457429733960101748337941089113754805948723711093554749702434403790911521304307891303888095766409349888217601805941464089016854633011900414398166282590574043568464075444517707007334427747664374414692970066053091825697105209915128705208526331438361547486292728794091551409645007636806788946057535976951015542219594730019389503659638616013021868191145218008029142016830329059730592268376234017389635595378966476012157026256790508454461179802216331056442299103373546379042544226091144870808712430272119042651542243583046446746410984881363571658309158265758351169383080472279448735863069639660767329428077503725290850445788140870756948168507822558423386840956515179396308766246166209363081791636852240492972528011883054432330695355009723159046641178028343458401892046894633529543032041131124872128069833776748945539893359308050699938040703754076830158616429661048245238871551718968035252724804455766649233052491170879193891564603219042683105817829568693226993547458516783457151974506732352568911962563075857684893894310634178490118549628512512905556420046783529748195273733519474251856490528244822232371664874381709034978437344253488327316790022375417783359620530084978610943911844199672433226469592126024514165574303967951609253051171813475689261661714867926958101564637938974354280288958209512061862080437243881322223376046214122868788012407009764822964646587393697827384493889134208002060470126812972250252429685036561666228459044210782811361245422887189576192732234521144280569874020306109855757622050817985808385747278667537400468214060372911004292961733269490743824034336118608336760611436934873930349923253169219581157682463499093651965511113692310071715597045523196228531640431549812528150762781117028579869572998498520773092936734918687498204821714729047231416866753424411078940814826294603670401794831085954241023871846838387240235729397902726745615582810351211046998477688814090232052241503006903900594941810972697823912500722016760889196388243326118952379719898529421512280282014223177826967854709080114348516780300794549854507704510655704847754677800612270213234038537230340548871618002473952949442413679148061254797268740793299936967542229695073778276622533425036037710895966774919205140822464679571328785443132066097912101127166799917555944068083892192718346548475810781422563978575908344430559978839779825131485959417450048276486810055775992051029461755837446330087440569735140579425157873107487542646334253832370276077114862056133291711500093585997640938460814927298041259272983568950154487914149603135399211352533876395149436164091447249849994113393403023601031371352079360925999515814771058348738987863490066469731005751198863458818531226948727183086721867149547267872795008157605764013674602906563298065247589410925857479730661708239576366331892877016636213078114480452520651257540143342816083156130166917649687883596063264765676759329955820465127142811601128587160758649445159710107508690241079423737512266394041554708038516398381546166935325289461648521293891911802535754427817104237757041912323334729495434171167369324435351329410401902147238392416661905827551149561155845463477946057220341208550319754788904393617971541650187850612128177149929187121177927340020813020858156769329296141763374827860156953029298256522849344850671152060990925788039867319359297319084694223139950678758882384337649441687716940391243128215341854025413096168844921531376244433369136947720305068257807486816684126583820701222678175587532261918326726551183965451774172726609892213550305551180493458607055279497028131666818697882620748820548139343079954636831092898227358106741064115404002703104498472165188597090659107401058452898782877013479855653462255804462394999824822162931801532032766777696799674516422369862594292232614704396079930332878923076097568058167879707430917594135992922184110959851449194166167699163786227486886123989926169643479959813257269327875780922281326768530737713326361991901418119827321998012126093954028916652910208890890720908879433143457391857671005921642164390038662222094565099714065580900754969132402565613569054314282927673016521321667857139475331330729759305651868295305013021552555402752785564336191204557527612603840213824277375640306558058511922666718010080774342854275080968458835891192784314418651042276566981534362158557090141464783415488056501322987214542979961233618110421376872548496642740425268661253092835731481098627016083850528800341139110456412439962136336333871913121893157932447007126108157637327587921125153043880627824742622724700295971635709639105248422689285965667037749087891613211123382327365397926715062042939717676453794557114129781210772395381744070545850983947081773961250662440514498885648011226532088003032628213605857441854372612412880589632817784432782054466734991283718971822881634387125344319140561749556295055029513520099210626571668725137767110692507975326122740008629481198999182187791272608593688105803625960282291982631196363623738206665027465044130611332775078916826509867246763076552083527317800056751306495246999172087447513721474814319383601271254516352929999251943290357422758410193266921468880367425255088916166831165494448125107907969455297930155491635810642542837293878023829867284639365647910223094499131843890349405610551576616315400909472828339292010091505958098092644771856907167424876326025208564207727457374182069427869184135263803619016295957747736970635459971232958431719624557597052467182562766534657277976295124469376862448152883853306394874833068146703705468925818972170080951098870055605548750098241624842300492170813226021389371723898265550031579356033645507603822853858441788404742237649094488400228646531841807153505340083308897866270817360849615666138187221865729186426779293916531390448041780071958636567221417526432126163393892259001852466172528390645945390597653122000474084885182764142138350089908841241218619099939429501020923809003762062414442986558020635633570891314304075267761691226809847456402023982634983992533320876242697372553388996748636216865743390035190228927447652601201499017268115834529855827061914160334750643028916337274466425668256103053807371925273869242843511902150394749841314130475609405818871166643362227681317741348503207963868545288521054008747528966681175389628651392632241117931298093023534747865434382643316776134402749313571169073757444663530720353360526404665853799417904563745636730405096380952140468005740782883957466189888356481532626161973531417908351374546313074674050859649726391156644021906383070056299947383521731047415116868868183885595931329025326296339666985353554642386281965615273487323595128982967979700834130576612843407742355381226427928208019104800219934985349767013476699296037603579814336743567106841751917250408669377556846786307342728967691209765517363280010883120400200870586504867576602427428241003039887835682557558544906601805625828346551632168206074788626634164602145881158724061449228886099370338257356127704958858459148370577824884658808809646080798331170702437875784078638751420755385771582619707222598004108946095412266046842237996293805111973357818249995502190669870579876516984832755667318664898685661204800567134302061511724763107484386288909601607722217820857146734953407429875996185857688050251735286403138176805886227834085440701670880929888148161942599115146759572995342163348440712086860431240489500534844765607319466613471522869861173931391521203304453715016907028545149641327324049644452117900050154519477723849657645691935096453548361235006907688223851393642275493820009980402176750334337160206286895845570794098495395979242531032517109824509683546760961792609010327285857719613825981808649618759368463381045884283517911854931287677044033395524095790397666315574509131184211647653295600132440757538407346232524432573734876707944456947126909872423189252981731950133340319404433230257221035607183743244211477209994668912309762392569429605180718822527175448336899491163619571814864486528508693713072590854959379258123438194891814271091332674075479237638678508898876305193249561503044780189690768506749396899005084576175372268685557045005553610888675589268258501885450107616006393517599375546247106803875628154581973600857771693723488570356311720596715683845352374164709462033596899699483209598861691258373421702924270463217546569686532675085513613527390396277518307662152339066014899900858813291673623804490170945161761739834714187100661604079781352808479491094179708472515544271227056043335524897505183527980635115928273671339232986207664961497173955379837630661361040259654587181590608447864392784693181542000543524748525113084395631727578578307176073295669572304099887349603514162102310800834162140187089929988835963789005081419817947616460908986749295895567495704986634404485310154727797313876704472463780009462759559107369494878652260630532897293076309044005619578758850820763402919441236357828665975003543011209172122167445392649285448024420106123049331657097117014691896904528710069316765402787505496007365675686168431438708746803004473505377959597993692966594059924708249992345833245218355228458728575040346138780617061563804660614246092981870829860025017288947793532560509739098651635671762816152595993509266591945165233733001831634213525685963268206106352200880686848626463721301214661027728915611312258755656587049654868097401402495858069969500118205585553225813069781696851438778186666346822447635241235663430032551514120438392795424796785818107328146596389316487643334136100238336549135489483174878930020083902293062105435594684567842588667603683974131757090520227674373755014268313738140381521547347413002109393666895081732297332657031149144516665409384292513530515190127924010063730012761153067868944252099530049943043530272150606225788765829527029308988138093162414474550132267157880051473876881228479560534043050821457801552864725780401482351700913670783714079468873423438920854021941103001727474418512162549882283649847595281750667332868507096596215716829287461780457034242374792824589539389604663076204884210606055345464898306898313842300176535070760798924565898272494017913590927871235767589827565037533824315251929402384754288621741810593934932954233764249770138270549701740005157488031881735074927190725106834807930916173775151828683019333636133222271636751237055383656823145190232083805077253426147075524373549851035711343538257734890595917125416915361328750723200394923440972486347965049022965340986027121316807066705510905372720044668770273678283219320442559187225337722353544226406780613273934895077944668423074361571474609156150998876652392566273247756066597879117192079184169983735290190767086388555805503992949960056296791026097078822767058612610468564416047047401228896199714097144475001491378883148176146207526081770489257495323067386021566127739678790130322841706465703493677342624807896196242103977357554378514801264689292909653371983982117341374890356033961143346288076323247614030513769767082916562638386545837095974413304172799206112980551472456520387386059442416835505485907021916799049557652288722113976697875676762486313245117351790869857386302481938533726783807507648643129288503378407169476508652049154585445594024889140836352652239798573894588393631859514318657639063584504683876600312668766486049373636650864889279716079336937683088457863733105991429227049099349190662610957799816868142221677925919659971927357065143113980169868843879933426109199235277723155259012268445673880731984537636248113681894092214244704184603982881179871656194398791241360655184048779610183545340600951515509235659642403641931450860722887915538400402246190197679509148544177483240531164452850174972673835596073365109435646448829606885151831839376758288357870329893008952376563541104769287632223757965462505787970427456016948376827412585470213612801428188607506638608753399791491028527474039749271591615325882856844355912125746754712204908198922482702372223549645872478741143655611103939165629540222883023184392191297985707382309689796348662604013813482633247995949762152686265331611645570099699861972489819958216140412453850109004803660364578220691879860198616947303665888203713833272994300565398305477953001206675443444545482952671367324567287069760864892436073503989162331146714121448427171313508673196749330615499166879457763045304145023260776040974569543865319491233059435157213428785790331382809656812413574988266241273855354870843432361943293513780183062417914979725138082746434973197790928565634401013316987610350201012622588976926711590049772600229340930475230642927912899685595236930391902806917094168976857271726707423657972059292805493576970458703955452433851428362207164994481109042995585202870138933384760916972333580265695855292374966424247895261960306280299058553270948980954223663906011251151675915319980468460256252033877815510277257592538876065310085287933971527762215182142339725693601653173764735849181666992297540976621176191343437254297301724728387552715114438472966903382952324168007855542358474456704087388174201891352496000106053609468314748174757410259234791644111862569672644702417043825075934068743570894470661499919986339285066105171723203866916608089933460829130906452194283899831103314206859459082402707649653163664392090294548118511120951932148415713736057185621276879145283660263574783103008671460752747056775610447416821301877496086905882787404492569776804497430567238461856525248176493406842793515200543903511416071351353398718329504145717659409464463992116681696188603719009699170730213821121018215654333410453666409002688900890061230177680828505947682113143419515568575179225865465314946078367935953720224896779221320310623446874874732064709114834280187954771923190673342573043634431945619749202151751983533914587074274456009688754750712468779679623408682949893772790873329379469599385646590865690994501941001998289885547323424685682036759569838984738696216064028604173525168320650563141509919326660583313790220279028309054105963337645969694549822944130264133458367172115223459058414391222296256339149342735911677544000411589008174650094106796616006077881856910323782300978249856622463985172695361953709493281535403756507225375598642640053102557312349027478932103279802563530373154043814659954567391229555878415849459426445666936745650302742022385518127118507648958765030968600871975302134423581272573873756434629154831641473147762663384896640341593625925562360311456725234982919371796494486317032746261373539435056209991196919142644945456565523297231969229302738550392351009671394784876881544115302999265515627283427324396843768829644761440927666072534987432962913747167563756052709906448722290732713656201342777575595549409776943377157251936346371088523515967538757701906660829509669343152550857598094065132698000668516502541341180458738675384105025899490847983829349642021722683067941540472866531216848383424199602993363127243183767232527904566901994155057321029010396725721061962768239090287288496434420835241614426320990818471887429143721263338371931902219834613183663072732891043488608232600816423411460544427466748563620644976388868284889033520200214064160539913875631310939398253082419751979746285677491604878339781245492327052918541674491802781950306939977760305585900425129781526408137846966535351676609718613891949678824850254512880936832134496177493340874923339969048759093860285101140739136843560510054734394100894227621978221765041384580373327643473015826923034433650052758514353061934992293753347711593521765767346788043339312526414766197558305023437532056755094124156581841665117421230733199735244739220171396520873465102838859431306457370710076260751737022399721735529442659875027184128319817284781401732019573203661753375487538858705344249700698407207352797747875850362144669117472994994964031728967375574023052140815205057494628668752598076705166862413432952182131923746192249311835172490198721107098679411617099755729498906164334486771548215411293888755445111102203169045981499326591143450447871336771027416436226271688515498819680141051300592858615072427355644782272886668777217664617454214668287350992311428949289645979794893581831249137919878391861142999088759611502902744105581418397586775367407895123080579595601174038707673641480091748997619790866069757392899268956056876298249263227268150554461527001533042801153585511561895064372331497069795584824107247975117803149981582654427154269178580074736231100915375216723391670183374897300020295378240513804487014587737109515186655930842946282899897071184382090954226820263435903376323973576238183781436136315501912910417210480747955706204988370401068868878284229354818447899112716364356013129184343583393646063122729592649979846657843595545622148033794487674266438861830138100106400808785026492886043818447583476973899133548323358717811861528074694567182909965851369022687581532657725547777940154831957108890227885849702465967365158043550788473866465248978208192704458575807340992971107651041960931239069139693751264515693251297499628338913247200547691140325654020931068625838762531133520547413380872284625162039499288083582869690730630460301072309307877100279684831398433626064442086996154609749546194711270626401225424206546979697362137409495396294878273497739574630335309318293079781037172737025871714902646889772739109067615173115157491188239159727151838783363092523252096058056775926083159286524342301912531654319522480997939214237444562527282764489337666801653552527626807448624759288291902459717777457232145985318519074972642272021826842862955063886252453673352989023135784286958341447802212543427532716433795876471533285840675283732859795550104175576800646674509162747785894175542080715003334691619145075340673547736276236826547743535858903247860226392892640605465106626488340889126948379983770010122438260859684446322827818493035023888891168480362248828912486518408349954185471981172959233434410419262113073979652226226236968583827645209012410481757990082093700257779710871347187006917788567610280761149280240034669429952380035534271886734745087839848949359085843137242524088530775589615457818597194818902414581866284705333518085454589643549399676599618270133062559951063834488191909056504794980381660427074097699993908230170421206429247565422609430122823336465492017729890925756476293072837050838502131645986738879916066143363648042158834849594834179184517183052001935478372796744154189322737231034947505041491896525765819111049807635796754570168824089572373539750691952456419383948470571228097641285660131639042752545681171917635484275185128253849414606170236875155647875503162827957372761708586775683043637588303044401426799810239791629908254158737633786154890665356988759264303586032360870131989398426682078107852101928881585779221004674880981652409926239083343302162199526609513450659347284222726467856129440955442017871927009865826402235458582435691584740779411964299072441243617450742675120233545198564867406159126497020872044741997765930214831155394104366220789095668877905466463860180941345725613430174587598229788501958046328383007560422939269473699493941214105508822176819774200502555229153127208463835561353433438261175320188788050283298860649660423286468790411238652500513697170862149561471481205943168522026166834321851872777332556027711555645476671520092266640237433830912038946925534268730377320435615200891102828127816062639806906678189475504930388115178007511499399187364217449038242110921343888613409026992853059883359967729401690355655198252388021118556256863104675228180969121670950369751490510884856396784429310061299617544170854889939394781089252634532633421595608118025041908535705819912764593497461815176965913549263953230358224473196054931982075677456884946668606774363686234083673141513075684085235538438278535286024375285847619270067094689775832339343774353270254582320800174483438434774978544660405926502954824003088180104279736595660197922548670242398781141016896296929905823763520651573175885'], 'Rational.toString(TYPE_DECIMAL)');
		rational = new CeL.rational('9063928/42400');
		assert([rational.toString(3), '213.77(1886792452830)'], 'Rational.toString(TYPE_PARENTHESES)');

		rational = new CeL.rational('902639234/3451234');
		assert([rational.power(534).toString(), '31229758817978985739024734300764334954080163408579268818480302016366246027391120492418434625990958003670447337910333689178235069378467489262762125554459180863036087982902627119612973400610997102518298332428920586865837517166250618249280107701596484519121936858903388665638367289786232660226495343612197516517847726421566281941630615520593121230919612725974678757852448141831485013504571820386822240114015737118367201208281559937305574400054997626680068317593649148020229680533595812727803429399289371319016078233343051379711595876045715155867157667831959132821593779076170922380204071073759327409905360705018756586945390582786081055143841868469863682947644852756721743849186025211415552901022563545157173571780674021241079940029478075463009971062888398700827620663648010902212530914978260144644767446669148732415752270482214139117156831947726522346098097072587025313352262099698579067468567586589329055428947923012623668182462818724559746286303951040439877725994931595481566846007723201941053170074037582733019267314168489831999968130381882496149502466995181949544594852960134038110341588589896570230045940912866854909649501092178879528788837015747726116176727029046850791587678125931140567658163423251163150741264264973851751530526282677445187749655970483781220100703871051761498034054715016432502842306637703409025491461175475014337976394985249082148523373265411680269477633032590215408093047592273951148268777779131207577413325879035279812969302312278447726797894500603115272970690185241688113621465478774899447122259549477126229440711957510964414475600626769388408181989218556321025207153432617679063562388403404810620144130000849238582792645732576848062654833422061513437705024710293079293476169073863830871409560133604321330908883613580814325483776709023440369251190840734570326208913420887294572180904294053763092457640378927493807244912056779193628555869387286924667471174285338147014079787492701124782399640968466875569292586684707973157179903282125061530594567101513530829539324271937747593950281730889401360366116108532844407610334987590177276988054089932628689492964391074891615295779214819971950183040585376326353828289017499660146245692536020822110033713576177322470327694446698514715310288447755194387662847020099287276163573063226409376079727862453161377697524904636850595836153675942778650002621852024120614712343526878311671086713754876261569395776988187878686243439152556680807411055641719796452924072512860044228884953937802347386069511681762804742462559227210179640624617173725080302924899663088261160407262958676784756168385840992484051650615641139541010374572348676152064988689965113332438182116901711755260329316361279430773026776793105674958378474373994320691477558452187616859595675348469810545659007738884276428845304144050817260226967040345959357315326000851807836425621425655975482405245163974120421149818982298925771012805667041681167995014154733824759738689902163645074941565590010184465337318117798974918047711572041319600527078219771092848257770478506146035872747424253352204474237971835794945349024930268410092372991815826163986368446126024906963287218500285549310162674786970730372592788167555640398043699357180740347733622634534031238574969005239117163663713391055893100929018898721950125225698141147305239225621382194045292410947637183601736432855100301089332404035363357718298457399587472054305361620576208345777901901969178958166745019264192151298751973028431922871839983707656220671230013140606464315593332341473348909184208693994946642773205979072822749866808278456327097275986411634614027951337449598047583398850550961976887742568643422559483060811347439812940422882779144236368444681227638743018818682752027478372608338636173103356132395330134970079648060545953210889435220732459775758863543931820597794238921208113812050543362195615405295073891785937274065537742055461451535101145392816215639887716165579344737634128972179131768575053891139202091378804259382441698593817237912361804845171983695930407662183003969811815417755700663158161241163302642902069353672078119027998281356474153361501644283375416893543629072798046630695657327767896433553036176862238311653378489852740910392180346894992663196188068201233655721977673321956636638774560292397557267877162406759661471625794845943589431065980766583044876033320926161610126051973977441652558680964864152741706499932740579044945028884783616261396547574308696432841968485372824672989478517027773871102914663034438363088794390005495991616208202248260982446084251227683393419314169432976135757098531602033964701264748998247932403990552575726325200942740930509821055626319436116481820280346202034984561183971658544018332132158304129/3375322344538320528416953588085526288339525064737731373923865598648175141219568348589587893615047405446722518255753796666350936006864479548187392711987358827080586922309318191392753148935883545424129318552058548949691873685897950294579901025793619406557419441005241511232135576208901436881297614863033763321432317610647133982123056929603845835532310426179876110534790427287617878161945319613197532817574260527594238608884324743855209787946635459738519023009977264147453659730585956282807171979735216929700883347717318500005034840252692530300802453238635231361324686861457812974399095184977505902138493635572190321070968344033129264331808827368315713905204146024896022975436953760109581289672718750681994143564916722761819326094166083285335505227554531855030066543949375221395909264483547448483927750032897578951517341394586055461554825325098002014702270167977267292790209063114427300199604431680416475167550171882724126898518360723395028687814378661550261088972427205530340820816042734556399360135684496761452869965158152364925555923930106615484563895714378585342446844391753901934528604062938425688348281691286566612028497727578151539743054657967212393431951386822268288833992017105880301281104856227579595086270615273855459681157946403540428200403031668271636994447091391431449627492328787463675198700064648635342616025799164073215231960288376169453538830526819694078404998841560980902620880728400182941711850541825241188842950250350557341082332678490313071064004233961941986937773626418946153201000351655534179216932073427775337658968171444500446931011834671919813486749653316746923796268853601772387434428500766397910265156375713575271266283667457945524218987725310502821476326941981879514296641383919983999693662771504428614435791645258219552109850265969661381314214791914949943553513557960876946462215291981890723783051000222109995897429880513181167862862646338631465954755857352784859766174430863174579840371174775406286470005161047510868179386027506506318298435846114093165065283380549122183519119269149590039566414088844846472034872241106451230526570497537531427182671647391136853120647377524668880995258599752770867679484047195547798716642684440762403574321038806583385528114986697835855307797693352489234620989171788534358459534279915403267023629564680873577600907233892594608954210283883733211194448253892958175844799387839265076929462023293409694925596027461138260076494702381769100426342734323301476556080754255514588263927640734068889497284262158094425100903203844285415575777963503713735550432685110593507707001168436117387265878355846486464392723494158805035154119594278321485741404729283058333227642529405301826640424610050171623416489867901020883977142669899096155518268383048046261656741099255327777931328907610659126332230354929090147219239424893723691038277566205870475386595730565619108143115194897745475173704722947624036882393007508276955021942154512382659531600841127954813737398536431125638630264110112628307426451156352542839815064495836644159962979106441038282923948437985112605138243026203860400621133832970661028088378524409267647620211250475276642917154909303466467046950437252963577918547735971079527803818001003153393369451943680879486552401642909472644662891138665713509599634426592729362961852939647234697961340890572440945786594956577775024254240947103941718671462026235035562800361870835652129'], 'Rational.power()');

		rational = new CeL.rational('23678239889268796833236/29536798526');
		assert([rational.log(10), 11.90398599554034963153767586952051325588161538274258895570318], { name: 'Rational.log()', error_rate: 1e-15 });
		rational = new CeL.rational('40969806879309648589012/3451234');
		assert([rational.log(), 37.01287992449852708063090255676739601468039225363464281006275], { name: 'Rational.log()', error_rate: 1e-15 });

		rational = new CeL.rational('2398649782609386549826302648976289307434/465793864');
		assert([+rational.square_root(), 2269271923632097], 'Rational.square_root()');

		rational = new CeL.rational('-206389467189026342637984/234789');
		assert([rational.square().toString(1), '772715399741062753629321994954161970 5683268654/6125097169'], 'Rational.square');

		rational = new CeL.rational('332/43');
		assert([rational.toPrecision(500), '7.7209302325581395348837209302325581395348837209302325581395348837209302325581395348837209302325581395348837209302325581395348837209302325581395348837209302325581395348837209302325581395348837209302325581395348837209302325581395348837209302325581395348837209302325581395348837209302325581395348837209302325581395348837209302325581395348837209302325581395348837209302325581395348837209302325581395348837209302325581395348837209302325581395348837209302325581395348837209302325581395348837209302325581395'], 'Rational.toPrecision(d/d)');
		rational = new CeL.rational('-234652347/234237');
		assert([rational.toPrecision(500), '-1001.7731912550109504476235607525711138718477439516387248812100564812561636291448404820758462582768734230715045018506896860871681245917596280690070313400530232200719783808706566426311812395138257405960629618719502042802802289988345137617028906620217984349184800010246032864150411762445728044672703287695795284263374274772986334353667439388311838010220417781990035733039613724561021529476555796052715839086053868517783270789841058415194866737535060643707014690249618975652864406562584049488338733846489'], 'Rational.toPrecision(-d/d)');
		rational = new CeL.rational('-34343459679863/936046798026706374');
		assert([rational.toPrecision(500), '-0.000036689896009753933173694168026727566015411305991009581871755580183021229072187100848838647794568063472339328624520295869699300448772172622374295560759250943741622328947471357854458259214996000832444886364820848978913545692372120838207729432050929240075067589373901642130185628716885056755529575092115854446338130136765374594131000655203394319509111878008597345555002928469182001540490049294299382454880214893049536243235831339878787682190517980376475672279732727523518567881172132731574206469207897054'], 'Rational.toPrecision(-D/D)');


		rational = new CeL.rational('38789023456981793878107248957'.repeat(50) + '/' + '72923054798304985798204'.repeat(50));
		assert([rational, 531917149717148176862391623387274552160949443482536248584824710305840797821329704650037347546669021164758382826678439063314977578801791420908426160838919531174023839959185572587805735280879173833788588843515089698686633007151522622001909462562297544592000254824566017358910669942955688004564778116956], { name: 'Rational.valueOf', error_rate: 1e-15 });

		assert([CeL.rational.max('2695678469285/34962984628639807', 1, 236598793.3476567, -87965789524341412435231234, 141343, '423.34213').toString(), '236598793.3476567'], 'Rational.max()');
		assert([CeL.rational.min(2986, 3745619.3423, 245252, '2865476298549265785426/2765467258376894625753762583672586953918', 234523, -234252.25123).toString(), '-234252.25123'], 'Rational.min()');
	});


	// ---------------------------------------------------------------------//
	// test for CeL.quadratic

	CeL.run('data.math.quadratic');

	// ---------------------------------------------------------------------//

	var solution;
	all_error_count += CeL.test('quadratic', [
		[['√3', (new CeL.quadratic(3)).toString()], 'quadratic.assignment 1'],
		[['2√3', (new CeL.quadratic(12)).toString()], 'quadratic.assignment 2'],
		[['3√5', (new CeL.quadratic(5, 3)).toString()], 'quadratic.assignment 3'],
		[['6√2', (new CeL.quadratic(8, 3)).toString()], 'quadratic.assignment 4'],
		[['3+9√2', (new CeL.quadratic(2, 9, 3)).toString()], 'quadratic.assignment 5'],
		[['(4+3√7)/5', (new CeL.quadratic(7, 3, 4, 5)).toString()], 'quadratic.assignment 6'],
		[['(2√6)/3', (new CeL.quadratic(6, 2, 0, 3)).toString()], 'quadratic.assignment 7'],

		[[-1, (new CeL.quadratic(2, 2, -3, 4)).sign()], 'quadratic.sign(-)'],
		[[1, (new CeL.quadratic(2, 2, -3, -4)).sign()], 'quadratic.sign(+)'],

		[['(22+78√6)/5', (new CeL.quadratic(24, 4, 2, 5)).add(new CeL.quadratic(24, 7, 4)).toString()], 'quadratic.add'],

		[['27,6,2,6,58', (new CeL.quadratic(34, 5, -2)).to_continued_fraction().join(',')], 'continued fraction'],
		[['55,1,10,1,4,3,1,1,1,1,2,25,1,1,2,1,1,25,2,1,1,1,1,3,4,1,10,1,128', (new CeL.quadratic(86, 7, -9)).to_continued_fraction().join(',')], 'continued fraction'],
		[['1,3,1,8', (new CeL.quadratic(23)).to_continued_fraction().pop().join(',')], 'continued fraction'],
		[['(-5+6√3)/83', (new CeL.quadratic(12, 3, 5)).reciprocal().toString()], '倒數, multiplicative inverse or reciprocal'],

		[(solution = CeL.quadratic.solve_quadratic(6, 4, 3)[0]).clone().multiply(3).multiply(solution).add(solution.multiply(4)).add(6).is_0(), "整係數一元二次方程式 3x^2+4x+6=0 的兩根公式解"],

		[[(solution = CeL.quadratic.solve_Pell(13, 1, 10)[9])[0].square().add(solution[1].clone().square().multiply(-13)).valueOf(), 1], "Get the 10th solution of Pell's equation: x^2 + 13 y^2 = 1."],

		[['(3+2√7)/4', (new CeL.quadratic(7, 2, 3, 4)).abs().toString()], 'quadratic.abs(+real)'],
		[['(-18+5√13)/2', (new CeL.quadratic(13, -5, 18, 2)).abs().toString()], 'quadratic.abs(-real)'],
		[['√649', (new CeL.quadratic(-13, -5, 18)).abs().toString()], 'quadratic.abs(-complex)'],
		[['(√79)/5', (new CeL.quadratic(-3, 5, 2, 5)).abs().toString()], 'quadratic.abs(complex)'],

		[['1', (new CeL.quadratic(2, 3, 8)).power(0).toString()], 'quadratic.power(0)'],
		[['8+3√2', (new CeL.quadratic(2, 3, 8)).power(1).toString()], 'quadratic.power(1)'],
		[['(196+48√5)/9', (new CeL.quadratic(5, 6, 4, 3)).square().toString()], 'quadratic.square()'],
		[['(2248025595671205504602012576111141463751576278371837411607230368027658579805709115310781933878876812858784756497723330301801242+849673809579121312776905852839499203983912155632466809914198420393630908927241613958279299255541956301528948931050605449034713√7)/58774717541114375398436826861112283890933277838604376075437585313920862972736358642578125', (new CeL.quadratic(7, 3, 2, 5)).power(127).toString()], 'quadratic.power(127)'],
	]);

	// ---------------------------------------------------------------------//

	// All test of arbitrary-precision_arithmetic OK. 測試全部通過。
	//node_info('Passed: arbitrary-precision_arithmetic 測試全部通過。');

}



//============================================================================================================================================================


function test_Hamming() {
	var data, code;
	all_error_count += CeL.test('CSV basic', [
		[[code = '101110010010', CeL.Hamming.encode(data = '11000010')]],
		[[data, CeL.Hamming.decode(code)]],
		[[code = '101001001111', CeL.Hamming.encode(data = '10101111')]],
		[[data, CeL.Hamming.decode(code)]],
		[[code = '001110001010', CeL.Hamming.encode(data = '11001010')]],
		[[data, CeL.Hamming.decode(code)]],
	]);
}



//============================================================================================================================================================


function test_quantity() {
	all_error_count += CeL.test('單位換算', [
		[[(new CeL.quantity('5.4cm')).toString(), '5.4 cm'], ''],
		[[(new CeL.quantity('4cm^2')).toString(), '4 cm²'], ''],
		[[(new CeL.quantity('4cm2')).toString(), '4 cm²'], ''],
		[[(new CeL.quantity('四千五百六十七公尺')).toString(), '4567 m'], ''],
		[[(new CeL.quantity('54公尺')).toString(), '54 m'], ''],
		[[(new CeL.quantity('5公尺')).multiple(4).toString(), '20 m'], ''],
		/*
		// TODO
		[[(new CeL.quantity('54cm')).multiple('8.5公尺').toString(),'4.59 m²'],''],
		[[(new CeL.quantity('54cm')).multiple('8.5公尺').toString('繁體中文'),'4.59平方公尺'],''],
		[[(new CeL.quantity('500平方公尺')).convert_to('a').toString(),'5 a'],''],
		[[(new CeL.quantity('500平方公尺')).convert_to('ha').toString(),'0.05 ha'],''],
		[[(new CeL.quantity('500平方公尺')).convert_to('a').toString('繁體中文'),'5 公畝'],''],
		*/
	]);
}


//============================================================================================================================================================


function test_code() {
	return;
	all_error_count += CeL.test('code', function (assert) {
		var e = CeL.parse_escape('00%M0\\\\\\\\\\%Mg\\a1\\n1\\s1\\a222',
			function (s) {
				//CeL.log('s: [' + s + ']');
				return s.replace(/%M/g, '_');
			});
		//CeL.info(e.replace(/\n/g, '<br />'));
		assert(e === '00_0\\\\%Mga1\n1s1a222', 'parse_escape()');

		// --------------------------------------------------------------------

		var Camel_test = function (identifier, separator) {
			var _1, _2;
			if (identifier.indexOf(separator) === -1) {
				_1 = identifier.to_underscore(separator);
				_2 = _1.to_Camel(separator);
				assert(identifier === _2, 'Camel [' + identifier
					+ '] → underscore [' + _1 + '] → Camel [' + _2 + ']');
			} else {
				_1 = identifier.to_Camel(separator);
				_2 = _1.to_underscore(separator);
				assert(identifier === _2, 'underscore [' + identifier
					+ '] → Camel [' + _1 + '] → underscore [' + _2 + ']');
			}
		};

		Camel_test('idOfShip', '-');
		Camel_test('id-of-ship', '-');
	});
}


// ============================================================================================================================================================


function test_CSV() {

	//node_info('test: 讀入 CSV 檔。');

	all_error_count += CeL.test('CSV basic', [
		[[CeL.parse_CSV('"a","b""c"\n_1,_2\n_3,_4\n_5,_6\n')[0][1], 'b"c']],
		[[CeL.parse_CSV('"a","b"\n_1,_2\n_3,_4\n_5,_6\n')[2][1], '_4']],
		[[CeL.parse_CSV('"a","b"\n_1,_2\n_3,_4\n_5,_6')[2][1], '_4']],
		[[CeL.parse_CSV('"a","b"\n_1,_2\n_3,_4\n_5,_6', { select_column: true })[2].b, '_4']],
	]);

	all_error_count += CeL.test('CSV title', [
		[[CeL.parse_CSV('"a","b"\n_1,_2\n_3,_4\n_5,_6', { has_title: 1 }).index.b, 1]],
		[[CeL.parse_CSV('"a","b"\n_1,_2\n_3,_4\n_5,_6', { has_title: 1 }).title.join('|'), 'a|b']],
	]);

	all_error_count += CeL.test('CSV skip_title', [
		[[CeL.parse_CSV('"a","b"\n_1,_2\n_3,_4\n_5,_6', { skip_title: 1 }).join('|'), 'a,b|_1,_2|_3,_4|_5,_6']],
		[[CeL.parse_CSV('"a","b"\n_1,_2\n_3,_4\n_5,_6', { skip_title: 1, has_title: 1 }).join('|'), '_1,_2|_3,_4|_5,_6']],
	]);

	all_error_count += CeL.test('CSV handle_array', [
		[[CeL.parse_CSV('"a","b"\n_1,_2\n_3,_4\n_5,_6', { handle_array: [, function (v) { return ':' + v; }] })[2][0], '_3']],
		[[CeL.parse_CSV('"a","b"\n_1,_2\n_3,_4\n_5,_6', { handle_array: [, function (v) { return ':' + v; }] })[2][1], ':_4']],
		[[CeL.parse_CSV('"a","b"\n_1,_2\n_3,_4\n_5,_6', { handle_array: [, function (v) { return ':' + v; }] })[0][1], 'b']],
		[[CeL.parse_CSV('"a","b"\n_1,_2\n_3,_4\n_5,_6', { handle_array: [, function (v) { return ':' + v; }] })[0][1], 'b']],
	]);

	CeL.set_debug(0);

	all_error_count += CeL.test('CSV no_text_qualifier', [
		[[CeL.parse_CSV('"a","b"\n_1,"_2"\n"_3",_4\n_5,_6', { no_text_qualifier: undefined })[1][0], '_2']],
		[[CeL.parse_CSV('a,b\n_1,"_2"\n"_3",_4\n_5,_6', { no_text_qualifier: undefined })[1][0], '_1']],
		[[CeL.parse_CSV('"a","b"\n_1,"_2"\n"_3",_4\n_5,_6', { no_text_qualifier: 1 })[1][0], '_1']],
	]);

	all_error_count += CeL.test('CSV row_limit', [
		[[CeL.parse_CSV('"a","b"\n_1,"_2"\n"_3",_4\n_5,_6', { row_limit: 1 })[1].join('|'), '_1|_2']],
		[[CeL.parse_CSV('"a","b"\n_1,"_2"\n"_3",_4\n_5,_6', { row_limit: 1 })[2], undefined]],
		[[CeL.parse_CSV('"a","b"\n_1,"_2"\n"_3",_4\n_5,_6', { row_limit: 1, to_Object: 1 })._2.join('|'), '_1|_2']],
		[[CeL.parse_CSV('"a","b"\n_1,"_2"\n"_3",_4\n_5,_6', { row_limit: 1, to_Object: 1 })._3, undefined]],
	]);

	all_error_count += CeL.test('CSV to_Object', [
		[[CeL.parse_CSV('"a","b"\n_1,"_2"\n"_3",_4\n_5,_6', { to_Object: 1 })._4.join('|'), '_3|_4']],
		[[CeL.parse_CSV('"a","b"\n_1,"_2"\n"_3",_4\n_5,_6', { to_Object: 1, select_column: true })._4.b, '_4']],
	]);

	node_info('test: 將 {Array|Object} 依設定轉成 CSV text。');

	CeL.to_CSV_String.config.line_separator = "\n";
	all_error_count += CeL.test('CSV basic', [
		[[CeL.to_CSV_String([["a", "b"], [1, 2], [3, 4]]), '"a","b"\n"1","2"\n"3","4"']],
		[[CeL.to_CSV_String([["a", "b"], ['"e"', 2], [3, 4]]), '"a","b"\n"""e""","2"\n"3","4"']],
		[[CeL.to_CSV_String([["a", "b"], ['"e"', 2], [3, 4]], { no_text_qualifier: 'auto' }), 'a,b\n"""e""",2\n3,4']],
		[[CeL.to_CSV_String([["a", "b"], ['"e"', 2], [3, 4]], { no_text_qualifier: true }), 'a,b\n"e",2\n3,4']],
	]);

	all_error_count += CeL.test('CSV Object', [
		[[CeL.to_CSV_String({ a: [1, 2], b: [3, 4] }), '"1","2"\n"3","4"']],
		[[CeL.to_CSV_String({ a: { r: 1, s: 2 }, b: { t: 3, u: 4 } }), '"1","2"\n"3","4"']],
	]);

	all_error_count += CeL.test('CSV select_column', [
		[[CeL.to_CSV_String([["a", "b"], [1, 2], [3, 4]], { select_column: 1 }), '"b"\n"2"\n"4"']],
		[[CeL.to_CSV_String([["a", "b", "c"], [1, 2, 3], [3, 4, 5]], { select_column: [2, 1] }), '"c","b"\n"3","2"\n"5","4"']],
		[[CeL.to_CSV_String({ a: [1, 2], b: [3, 4] }, { select_column: 1 }), '"2"\n"4"']],
		[[CeL.to_CSV_String({ a: { r: 1, s: 2 }, b: { r: 3, s: 4 } }, { select_column: 's' }), '"2"\n"4"']],
		[[CeL.to_CSV_String({ a: { r: 1, s: 2, t: 3 }, b: { r: 3, s: 4, t: 5 } }, { select_column: ['s', 't'] }), '"2","3"\n"4","5"']],
		[[CeL.to_CSV_String({ a: { r: 1, s: 2 }, b: { r: 3, s: 4, t: 5 } }, { select_column: ['s', 't'] }), '"2",""\n"4","5"']],
	]);

	all_error_count += CeL.test('CSV has_title', [
		[[CeL.to_CSV_String({ a: { r: 1, s: 2 }, b: { r: 3, s: 4, t: 5 } }, { has_title: 1, select_column: ['s', 't'] }), '"s","t"\n"2",""\n"4","5"']],
		[[CeL.to_CSV_String([["a", "b", "c"], [1, 2, 3], [3, 4, 5]], { has_title: 1, select_column: [2, 1] }), '"2","1"\n"c","b"\n"3","2"\n"5","4"']],
		[[CeL.to_CSV_String([["a", "b", "c"], [1, 2], [3, 4, 5]], { has_title: 1, select_column: [2, 1] }), '"2","1"\n"c","b"\n"","2"\n"5","4"']],
	]);

	CeL.set_debug(test_debug_level);

	node_info('Passed: All CSV tests');
}



//============================================================================================================================================================


function test_XML() {
	all_error_count += CeL.test('XML', [
		[[
			JSON.stringify(JSON.from_XML('<n:t1 a1="a1"><ns:c1 /><c2 /></n:t1>')),
			JSON.stringify({ "n:t1": [{ "ns:c1": null }, { "c2": null }], "a1": "a1" })
		], 'XML to JSON #1'],
		[[
			JSON.stringify(JSON.from_XML('<?xml version="1.0" encoding="UTF-8"?><root><t1 a1="a1"><c1 a2="a2"></c1><c2 a3="a3"/><c3 /></t1></root>', { numeralize: true })),
			JSON.stringify({ "root": { "t1": [{ "c1": null, "a2": "a2" }, { "c2": null, "a3": "a3" }, { "c3": null }], "a1": "a1" } })
		], 'XML to JSON #2'],

		[[
			'<a b="34">12</a>',
			JSON.to_XML({ a: 12, b: 34 })
		], 'JSON to XML #1'],
		[[
			'<a b="34">23<r><t>e</t></r></a>',
			JSON.to_XML({ a: [2, 3, { r: { t: 'e' } }], b: 34 })
		], 'JSON to XML #2'],
		[[
			'<n:t t="b">4<ns:k />5</n:t>',
			JSON.to_XML({ "n:t": [4, { "ns:k": null }, 5], t: 'b' })
		], 'JSON to XML #3'],
	]);
}



//============================================================================================================================================================


function test_net() {
	all_error_count += CeL.test('get_full_URL', [
		[['https://host.name/root/sub/path/to/file.htm', CeL.get_full_URL('path/to/file.htm', 'https://host.name/root/sub/CGI.pl')], 'get_full_URL() #1'],
		[['https://host.name/root/sub/path/to/file.htm', CeL.get_full_URL('path/to/file.htm', 'https://host.name/root/sub/')], 'get_full_URL() #2'],
		[['https://host.name/path/to/file.htm', CeL.get_full_URL('/path/to/file.htm', 'https://host.name/root/sub/CGI.pl')], 'get_full_URL() #3'],
		[['https://host.name/path/to/file.htm', CeL.get_full_URL('/path/to/file.htm', 'https://host.name/root/sub/')], 'get_full_URL() #4'],
		[['https://host1.name.org/path/to/file.htm', CeL.get_full_URL('https://host1.name.org/path/to/file.htm', 'https://host.name/root/sub/CGI.pl')], 'get_full_URL() #5'],
		[['https://host1.name.org/path/to/file.htm', CeL.get_full_URL('https://host1.name.org/path/to/file.htm', 'https://host.name/root/sub/')], 'get_full_URL() #6'],
	]);
}



//============================================================================================================================================================


function test_date() {
	CeL.run('data.date');

	all_error_count += CeL.test('parse date', [
		[[0, new Date('May 5 2022') - 'May 5 2022'.to_Date()], '.to_Date(): 無法 parse 的值'],
		[[0, new Date('May 5 2022 UTC+09:00') - 'May 5 2022'.to_Date({ zone: 'UTC+9' })], '.to_Date(): 無法 parse 的值+TZ@options'],
		[[0, new Date('May 5 2022 UTC+09:00') - 'May 5 2022 UTC+09:00'.to_Date()], '.to_Date(): 無法 parse 的值+TZ'],

		[[0, new Date('2022/5/5') - '2022/5/5'.to_Date()], '.to_Date(): 理應可 parse 的值'],
		[[0, new Date('2022/5/5 UTC+09:00') - '2022/5/5'.to_Date({ zone: 'UTC+9' })], '.to_Date(): 理應可 parse 的值+TZ @ options'],
		[[0, new Date('2022/5/5 UTC+09:00') - '2022/5/5 UTC+9'.to_Date()], '.to_Date(): 理應可 parse 的值+TZ'],
		[[0, new Date('2016-11-21T08:00:00Z') - '2016年11月21日(金) 08:00'.to_Date({ zone: 0 })], '.to_Date(): 理應可 parse 的值+星期'],

		[[0, new Date('2022/5/5 UTC') - '2022/5/5 UTC'.to_Date()], '.to_Date(): 理應可 parse 的值 2022/5/5 UTC'],
		[[0, '2022/5/5'.to_Date({ zone: 0 }) - '2022/5/5 UTC'.to_Date()], '.to_Date(): 理應可 parse 的值 2022/5/5 zone:0'],
		[[0, new Date('0322/3/5 UTC') - '322/3/5 UTC'.to_Date()], '.to_Date(): 理應可 parse 的值 322/3/5 UTC'],
		[[0, '322/3/5'.to_Date({ zone: 0 }) - '322/3/5 UTC'.to_Date()], '.to_Date(): 理應可 parse 的值 322/3/5 zone:0'],
		[[0, new Date('0082/3/5 UTC') - '82/3/5 UTC'.to_Date()], '.to_Date(): 理應可 parse 的值 82/3/5 UTC'],
		[[0, '82/3/5'.to_Date({ zone: 0 }) - '82/3/5 UTC'.to_Date()], '.to_Date(): 理應可 parse 的值 82/3/5 zone:0'],
		[[0, new Date('-000005-03-04T00:00:00.000Z') - '-6/3/4 UTC'.to_Date()], '.to_Date(): 理應可 parse 的值 -6/3/4 UTC'],
		[[0, '-6/3/4'.to_Date({ zone: 0 }) - '-6/3/4 UTC'.to_Date()], '.to_Date(): 理應可 parse 的值 -6/3/4 zone:0'],
		// 注意:"紀"會轉換成結束時間。
		[[0, new Date('1800/1/1 UTC') - '1800/1/1 UTC'.to_Date()], '.to_Date(): 理應可 parse 的值 1800/1/1 UTC'],
		[[0, '18世紀'.to_Date({ zone: 0 }) - '1800/1/1 UTC'.to_Date()], '.to_Date(): 理應可 parse 的值 18世紀 zone:0'],
		[[0, new Date('800/1/1 UTC') - '800/1/1 UTC'.to_Date()], '.to_Date(): 理應可 parse 的值 800/1/1 UTC'],
		[[0, '8百年'.to_Date({ zone: 0 }) - '800/1/1 UTC'.to_Date()], '.to_Date(): 理應可 parse 的值 8百年 zone:0'],
		[[0, new Date('2000/1/1 UTC') - '2000/1/1 UTC'.to_Date()], '.to_Date(): 理應可 parse 的值 2000/1/1 UTC'],
		[[0, '2千紀'.to_Date({ zone: 0 }) - '2000/1/1 UTC'.to_Date()], '.to_Date(): 理應可 parse 的值 2千紀 zone:0'],
		[[0, new Date('1000/1/1 UTC') - '1000/1/1 UTC'.to_Date()], '.to_Date(): 理應可 parse 的值 1000/1/1 UTC'],
		[[0, '1千年'.to_Date({ zone: 0 }) - '1000/1/1 UTC'.to_Date()], '.to_Date(): 理應可 parse 的值 1千年 zone:0'],

		[[0, new Date('1234/5/6') - '1234年5月6日'.to_Date(/(\d+)年(\d+)月(\d+)日/)], '.to_Date(): 自訂 pattern #1'],
		[[0, new Date('1234/5/6') - '5/6/1234'.to_Date({ pattern: /(\d+)\/(\d+)\/(\d+)/, pattern_matched: [3, 1, 2] })], '.to_Date(): 自訂 pattern #2'],

		[['microsecond', '2543年2月1日 1:2:3.45'.to_Date().precision], '.to_Date(): precision #1'],
		[['second', '2543年2月1日 1:2:3'.to_Date().precision], '.to_Date(): precision #2'],
		[['minute', '2543年2月1日 1:2'.to_Date().precision], '.to_Date(): precision #3'],
		[['hour', '2543年2月1日5時'.to_Date().precision], '.to_Date(): precision #4'],
		[['day', '2543年2月1日'.to_Date().precision], '.to_Date(): precision #5'],
		[['month', '2543年2月'.to_Date().precision], '.to_Date(): precision #6'],
		[['year', '2543年'.to_Date().precision], '.to_Date(): precision #7'],
		[['decade', '1930年代'.to_Date().precision], '.to_Date(): precision #8'],
		[['century', '20世紀'.to_Date().precision], '.to_Date(): precision #9'],
		[['century', '5百年'.to_Date().precision], '.to_Date(): precision #10'],
		[['millennium', '4千紀'.to_Date().precision], '.to_Date(): precision #11'],
		[['millennium', '2千年'.to_Date().precision], '.to_Date(): precision #12'],

		// http://support.microsoft.com/kb/214094
		[[1, (new Date('1/1/1900')).to_Excel()], 'date.to_Excel()=1'],
		[[32331.06, (new Date('7/7/1988 1:26:24')).to_Excel()], 'date.to_Excel()'],
		[[35981, (new Date('July 5, 1998')).to_Excel()], 'date.to_Excel()'],
		[[34519, (new Date('July 4, 1994')).to_Excel()], 'date.to_Excel()'],
		[[1, (new Date('1/2/1904')).to_Excel(true)], 'date.to_Excel(Mac)=1'],
		// https://support.microsoft.com/en-us/kb/214330
		[[34519, (new Date('July 5, 1998')).to_Excel(true)], 'date.to_Excel(Mac)'],
		[[35981, (new Date('July 6, 2002')).to_Excel(true)], 'date.to_Excel(Mac)'],
		[[NaN, (new Date('1/1/1800')).to_Excel()], 'date.to_Excel()=NaN'],

		[[123, CeL.to_millisecond(123)], 'time_interval_to_millisecond() #1'],
		[[12300, CeL.to_millisecond('12.3s')], 'time_interval_to_millisecond() #2'],
		[[120000, CeL.to_millisecond('2 m')], 'time_interval_to_millisecond() #3'],
		[[3720000, CeL.to_millisecond('1 h 2 m')], 'time_interval_to_millisecond() #4'],
		[[103680000, CeL.to_millisecond('1.2 d')], 'time_interval_to_millisecond() #5'],
		[[103680000, CeL.to_millisecond('1d') + CeL.to_millisecond('.2day')], 'time_interval_to_millisecond() #6'],
		[[1825200000, CeL.to_millisecond('21 days, 3 hours')], 'time_interval_to_millisecond() #7'],
		[[1825200000, CeL.to_millisecond('P21DT3H')], 'time_interval_to_millisecond() ISO 8601 Durations'],
		[[20040000, CeL.to_millisecond('5h34m')], 'time_interval_to_millisecond() #8'],
		[[20040000, CeL.to_millisecond('5:34')], 'time_interval_to_millisecond() #9'],
		[[20067000, CeL.to_millisecond('5:34:27')], 'time_interval_to_millisecond() #10'],

	]);


	var tmp;
	all_error_count += CeL.test('to_Date(CE)', [
		[["1582/10/15 0:0:0.000", '1582/10/5'.to_Date({ parser: 'CE', no_year_0: false }).format()]],

		[["1582/10/15 0:0:0.000", '1582/10/5'.to_Date({ parser: 'CE', no_year_0: false }).format()]],

		[["100/2/26 0:0:0.000", '100/2/28'.to_Date({ parser: 'CE', no_year_0: false }).format()]],
		[["100/2/27 0:0:0.000", '100/2/29'.to_Date({ parser: 'CE', no_year_0: false }).format()]],
		[["100/2/28 0:0:0.000", '100/3/1'.to_Date({ parser: 'CE', no_year_0: false }).format()]],

		[["-300/2/23 0:0:0.000", '-0300/2/28'.to_Date({ parser: 'CE', no_year_0: false }).format()]],
		[["-300/2/24 0:0:0.000", '-0300/2/29'.to_Date({ parser: 'CE', no_year_0: false }).format()]],
		[["-300/2/25 0:0:0.000", '-0300/3/1'.to_Date({ parser: 'CE', no_year_0: false }).format()]],

		[["-4714/11/24 0:0:0.000", '-4713/1/1'.to_Date({ parser: 'CE', no_year_0: false }).format()]],

		[["2000/2/27 0:0:0.000", '2000/2/26'.to_Date({ parser: 'CE', period_end: true }).format()]],


		[[0, new Date(tmp = '2010/1/2 5:0') - tmp.to_Date()]],
		[[0, new Date(tmp = '2010/1/2 5:0') - tmp.to_Date('CE')]],
	]);


	// Date.parse('100/2/29')===Date.parse('100/3/1')
	// /(?:^|\D)29(?:\D|$)/.test('100/2/29');

	// /(?!\d)29(?!\d|$)/.test('100/2/29');


	CeL.debug((new Date).format('\\%m\\x61%m/%d/%Y'));

	all_error_count += CeL.test('time zone', function (assert) {
		var tmp = '2001/8/7 03:35:8PM';
		CeL.debug(tmp + ' → ' + tmp.to_Date('CST') + ' → ' + tmp.to_Date('CST').format('%Y年%m月%d日%H時%M分%S秒%f毫秒'), 3);
		assert(['2001年8月7日15時35分8秒000毫秒', tmp.to_Date('CST').format({ format: '%Y年%m月%d日%H時%M分%S秒%f毫秒', offset: 8 * 60 })]);
		assert(['2001年08月07日', tmp.to_Date('CST').format({ format: '%Y年%2m月%2d日', offset: 8 * 60 })]);
	});

	all_error_count += CeL.test('CeL.Julian_day', function (assert) {
		for (var JD = 4e6; JD > -1364; JD--) {
			// Julian calendar, first NG: -1402
			var date = CeL.Julian_day.to_YMD(JD);
			// assert([ JD, CeL.Julian_day.from_YMD(date[0], date[1], date[2]) ], 'Julian calendar: JD ' + JD);
			if (JD !== CeL.Julian_day.from_YMD(date[0], date[1], date[2])) {
				throw 'Julian calendar: JD ' + JD;
			}
			// 4e6: [ 6239, 5, 27 ]

			// Gregorian calendar, first NG: -1364
			date = CeL.Julian_day.to_YMD(JD, true);
			// assert([ JD, CeL.Julian_day.from_YMD(date[0], date[1], date[2], true) ], 'Gregorian calendar: JD ' + JD);
			if (JD !== CeL.Julian_day.from_YMD(date[0], date[1], date[2], true)) {
				throw 'Gregorian calendar: JD ' + JD;
			}
			// 4e6: [ 6239, 7, 11 ]
		}

		CeL.Julian_day.to_YMD(-1401);
		// [ -4716, 3, 1 ]

		CeL.Julian_day.to_YMD(-1363, true);
		// [ -4716, 3, 1 ]
	});

	CeL.run('data.date');

	all_error_count += CeL.test('Julian date', function (assert) {
		// Date_to_String.no_year_0 = true;

		// leap year @ Julian
		'-5/2/28'.to_Date('CE')
		'-5/2/29'.to_Date('CE')
		'-5/3/1'.to_Date('CE')

		// common year @ Julian
		'-4/2/28'.to_Date('CE')
		assert([0, '-4/2/29'.to_Date('CE') - '-4/3/1'.to_Date('CE')]);

		// leap year @ Julian
		'-1/2/28'.to_Date('CE')
		'-1/2/29'.to_Date('CE')
		'-1/3/1'.to_Date('CE')

		//Date_to_String.no_year_0 = false;

		// common year @ Julian
		'-5/2/28'.to_Date({ parser: 'CE', no_year_0: false })
		assert([0, '-5/2/29'.to_Date({ parser: 'CE', no_year_0: false }) - '-5/3/1'.to_Date({ parser: 'CE', no_year_0: false })]);


		// leap year @ Julian
		'-4/2/28'.to_Date({ parser: 'CE', no_year_0: false })
		'-4/2/29'.to_Date({ parser: 'CE', no_year_0: false })
		'-4/3/1'.to_Date({ parser: 'CE', no_year_0: false })

		// common year @ Julian
		'-1/2/28'.to_Date({ parser: 'CE', no_year_0: false })
		assert([0, '-1/2/29'.to_Date({ parser: 'CE', no_year_0: false }) - '-1/3/1'.to_Date({ parser: 'CE', no_year_0: false })]);


		// leap year @ Gregorian
		'0000/2/28'.to_Date()
		'0000/2/29'.to_Date()
		'0000/3/1'.to_Date()
	});

	all_error_count += CeL.test('date Basic tests', function (assert) {
		// e.g., UTC+8: -8 * 60 = -480
		var present_local_minute_offset = (new Date).getTimezoneOffset() || 0;
		//year = -2010
		for (var year = -500; year < 2010; year++)if (year) {
			assert([year + '/1/1 0:0:0.000', (year.pad(4) + '/1/1').to_Date('CE').format('CE')], 'date Basic tests: ' + year + '/1/1');
			assert([year + '/2/28 0:0:0.000', (year.pad(4) + '/2/28').to_Date('CE').format('CE')], 'date Basic tests: ' + year + '/2/28');
			if (year <= 1582 && year % 4 === (year < 0 ? -1 : 0))
				assert([year + '/2/29 0:0:0.000', (year.pad(4) + '/2/29').to_Date('CE').format('CE')], 'date Basic tests: ' + year + '/2/29');
			var date = (year.pad(4) + '/3/1').to_Date('CE');
			if (date.getTimezoneOffset() === present_local_minute_offset) {
				// for 1952/3/1 @ 臺北標準時間: 實施日光節約時間
				// https://blog.yorkxin.org/2014/07/11/dst-in-taiwan-study.html
				assert([year + '/3/1 0:0:0.000', date.format('CE')], 'date Basic tests: ' + year + '/3/1');
			}
			assert([year + '/12/31 0:0:0.000', (year.pad(4) + '/12/31').to_Date('CE').format('CE')], 'date Basic tests: ' + year + '/12/31');
		}
	});


	//CeL.Date_to_String.no_year_0 = CeL.String_to_Date.no_year_0 = false;


	all_error_count += CeL.test('date: .format(CE)', [
		[["-300/2/28 0:0:0.000", '-0300/2/23'.to_Date({ no_year_0: false }).format({ parser: 'CE', no_year_0: false })]],
		[["-300/2/29 0:0:0.000", '-0300/2/24'.to_Date({ no_year_0: false }).format({ parser: 'CE', no_year_0: false })]],
		[["-300/3/1 0:0:0.000", '-0300/2/25'.to_Date({ no_year_0: false }).format({ parser: 'CE', no_year_0: false })]],

		[["-100/2/28 0:0:0.000", '-0100/2/25'.to_Date({ no_year_0: false }).format({ parser: 'CE', no_year_0: false })]],
		[["-100/2/29 0:0:0.000", '-0100/2/26'.to_Date({ no_year_0: false }).format({ parser: 'CE', no_year_0: false })]],
		[["-100/3/1 0:0:0.000", '-0100/2/27'.to_Date({ no_year_0: false }).format({ parser: 'CE', no_year_0: false })]],

		[["-99/1/3 0:0:0.000", '-0099/1/1'.to_Date({ no_year_0: false }).format({ parser: 'CE', no_year_0: false })]],

		[["-1/1/3 0:0:0.000", '-0001/1/1'.to_Date({ no_year_0: false }).format({ parser: 'CE', no_year_0: false })]],
		[["0/1/3 0:0:0.000", '0000/1/1'.to_Date({ no_year_0: false }).format({ parser: 'CE', no_year_0: false })]],
		[["1/1/3 0:0:0.000", '0001/1/1'.to_Date({ no_year_0: false }).format({ parser: 'CE', no_year_0: false })]],

		[["100/2/28 0:0:0.000", '0100/2/26'.to_Date({ no_year_0: false }).format({ parser: 'CE', no_year_0: false })]],
		[["100/2/29 0:0:0.000", '0100/2/27'.to_Date({ no_year_0: false }).format({ parser: 'CE', no_year_0: false })]],
		[["100/3/1 0:0:0.000", '0100/2/28'.to_Date({ no_year_0: false }).format({ parser: 'CE', no_year_0: false })]],

		[["1582/10/4 0:0:0.000", '1582/10/14'.to_Date({ no_year_0: false }).format({ parser: 'CE', no_year_0: false })], 'Gregorian calendar 改曆前。'],
		[["1582/10/15 0:0:0.000", '1582/10/15'.to_Date({ no_year_0: false }).format({ parser: 'CE', no_year_0: false })], 'Gregorian calendar 改曆後。'],
		[["1582/10/5 0:0:0.000", '1582/10/15'.to_Date({ no_year_0: false }).format('Julian')], 'Gregorian calendar 改曆後 using Julian。'],

		[["1700/2/28 0:0:0.000", '1700/3/10'.to_Date({ no_year_0: false }).format('Julian')], 'Julian 1700 閏日前。'],
		[["1700/2/29 0:0:0.000", '1700/3/11'.to_Date({ no_year_0: false }).format('Julian')], 'Julian 1700 閏日當日。'],
		[["1700/3/1 0:0:0.000", '1700/3/12'.to_Date({ no_year_0: false }).format('Julian')], 'Julian 1700 閏日後。'],
	]);


	all_error_count += CeL.test('Date_to_JD', [
		[[2451545, CeL.Date_to_JD(new Date(Date.parse('1 January 2000 12:00 UTC')))], 'Date_to_JD: 標準曆元 J2000.0 #1'],
		[[2451545, CeL.Date_to_JDN(new Date(Date.parse('1 January 2000 UTC')))], 'Date_to_JD: 標準曆元 J2000.0 #2'],
		[[2456413, CeL.Date_to_JD(new Date(Date.parse('2013/4/30 12:00 UTC')))], 'Date_to_JD: 2013/4/30'],
	]);



	CeL.run('data.date');

	//CeL.Date_to_String.no_year_0 = CeL.String_to_Date.no_year_0 = true;


	all_error_count += CeL.test('date: .to_Date(CE)', [
		[[0, CeL.Date_to_JD('-4713/1/1 12:0'.to_Date({ parser: 'CE', zone: 0 }))], 'JD 0'],

		[[1096, CeL.Date_to_JD('-4710/1/1 12:0'.to_Date({ parser: 'CE', zone: 0 }))]],
		[[4383, CeL.Date_to_JD('-4701/1/1 12:0'.to_Date({ parser: 'CE', zone: 0 }))]],
		[[4749, CeL.Date_to_JD('-4700/1/1 12:0'.to_Date({ parser: 'CE', zone: 0 }))]],
		[[4807, CeL.Date_to_JD('-4700/2/28 12:0'.to_Date({ parser: 'CE', zone: 0 }))]],
		[[260424, CeL.Date_to_JD('-4000/1/1 12:0'.to_Date({ parser: 'CE', zone: 0 }))]],
		[[1356174, CeL.Date_to_JD('-1000/1/1 12:0'.to_Date({ parser: 'CE', zone: 0 }))], '1000 BCE'],

		[[1721057.5, CeL.Date_to_JD('-0001/1/1 0:0'.to_Date({ parser: 'CE', zone: 0 }))], '-1 CE'],
		[[1721057.5, CeL.Date_to_JD('0000/1/1 0:0'.to_Date({ parser: 'CE', zone: 0 }))], 'bad test: 0 CE'],

		[[1721423, CeL.Date_to_JD('-0001/12/31 12:0'.to_Date({ parser: 'CE', zone: 0 }))], '1 BCE'],
		[[1721423.5, CeL.Date_to_JD('0001/1/1 0:0'.to_Date({ parser: 'CE', zone: 0 }))], '1 CE'],

		[[1722578, CeL.Date_to_JD('0004/2/29 12:0'.to_Date({ parser: 'CE', zone: 0 }))], '4 CE leap day'],
		[[1722578.5, CeL.Date_to_JD('0004/3/1 0:0'.to_Date({ parser: 'CE', zone: 0 }))], 'after 4 CE leap day'],

		[[2299159.5, CeL.Date_to_JD('1582/10/4 0:0'.to_Date({ parser: 'CE', zone: 0 }))], 'before reform'],
		[[2299160.5, CeL.Date_to_JD('1582/10/15 0:0'.to_Date({ parser: 'CE', zone: 0 }))], 'after reform'],

		[[2451545, CeL.Date_to_JD('2000/1/1 12:0'.to_Date({ parser: 'CE', zone: 0 }))], 'date: .to_Date(CE): 標準曆元 J2000.0'],


		[[2451545, CeL.Date_to_JD('2000/1/1 12:'.to_Date({ zone: 0 }))], 'J2000.0 fault'],
	]);



	CeL.run('data.date');

	//CeL.Date_to_String.no_year_0 = CeL.String_to_Date.no_year_0 = true;

	all_error_count += CeL.test('日干支#1', [
		[["甲子", '1912年2月18日'.to_Date('CE').format({ format: '%日干支', locale: 'cmn-Hant-TW' })], '1912年（中華民國元年）2月18日，合農曆壬子年正月初一，是「甲子日」'],

		[["己巳", '公元前720年2月22日'.to_Date('CE').format({ format: '%日干支', locale: 'cmn-Hant-TW' })], '《春秋》所記，魯隱公三年夏曆二月己巳日（周平王五十一年，公元前720年2月22日）之日食'],

		[["甲子", '1923年12月17日'.to_Date('CE').format({ format: '%日干支', locale: 'cmn-Hant-TW' })], '1923年12月17日 甲子日'],

		[["庚辰庚辰", '1940年4月7日'.to_Date('CE').format({ format: '%歲次%日干支', locale: 'cmn-Hant-TW' })], "庚辰年庚辰月庚辰日"],

		[["庚辰庚辰庚辰", '1940年4月7日7時'.to_Date('CE').format({ format: '%歲次%日干支%時干支', locale: 'cmn-Hant-TW' })], "庚辰年庚辰月庚辰日庚辰時 start"],
		[["庚辰庚辰庚辰", '1940年4月7日8時59分59秒'.to_Date('CE').format({ format: '%歲次%日干支%時干支', locale: 'cmn-Hant-TW' })], "庚辰年庚辰月庚辰日庚辰時 end"],
		[["庚辰庚辰辛巳", '1940年4月7日9時'.to_Date('CE').format({ format: '%歲次%日干支%時干支', locale: 'cmn-Hant-TW' })], "庚辰年庚辰月庚辰日辛巳時"],

		[["庚辰庚辰庚辰", '2120年4月23日7時'.to_Date('CE').format({ format: '%歲次%日干支%時干支', locale: 'cmn-Hant-TW' })], "庚辰年庚辰月庚辰日庚辰時始"],
		[["庚辰庚辰庚辰", '2120年4月23日8時59分59秒'.to_Date('CE').format({ format: '%歲次%日干支%時干支', locale: 'cmn-Hant-TW' })], "庚辰年庚辰月庚辰日庚辰時止"],
		[["庚辰庚辰辛巳", '2120年4月23日9時'.to_Date('CE').format({ format: '%歲次%日干支%時干支', locale: 'cmn-Hant-TW' })], "庚辰年庚辰月庚辰日辛巳時"],

		[["甲子甲子甲子", '1984/3/31 0:0'.to_Date('CE').format({ format: '%歲次%日干支%時干支', locale: 'cmn-Hant-TW' })], "(甲子年丁卯月)甲子日甲子時始"],
		[["甲子甲子甲子", '1984/3/31 0:59:59.999'.to_Date('CE').format({ format: '%歲次%日干支%時干支', locale: 'cmn-Hant-TW' })], "(甲子年丁卯月)甲子日甲子時止"],
	]);

	CeL.String_to_Date.default_parser.year_padding = 0;
	all_error_count += CeL.test('日干支#2', [
		[["甲子壬辰", '西元4年3月1日'.to_Date('CE').format({ format: '%歲次%日干支', locale: 'cmn-Hant-TW' })], "西元4年3月1日"],


		[["1616/2/27 壬午", '1616年2月壬午'.to_Date('Chinese').format({ format: '%Y/%m/%d %日干支', locale: 'cmn-Hant-TW' })], 'String_to_Date.parser.Chinese'],
		[["1645/9/30 庚寅", '1645/9/庚寅'.to_Date('Chinese').format({ format: '%Y/%m/%d %日干支', locale: 'cmn-Hant-TW' })], 'String_to_Date.parser.Chinese'],
		[["1645/10/10 庚子", '1645/9/庚子'.to_Date('Chinese').format({ format: '%Y/%m/%d %日干支', locale: 'cmn-Hant-TW' })], 'String_to_Date.parser.Chinese'],
		[["1329/2/27 丙戌", '1329/2/丙戌'.to_Date('Chinese').format({ format: '%Y/%m/%d %日干支', locale: 'cmn-Hant-TW', parser: 'CE' })], 'String_to_Date.parser.Chinese: 元明宗天厯二年正月丙戌即位'],
	]);


	all_error_count += CeL.test('stem_branch_index', function (assert) {
		for (var i = 0; i < 60; i++) {
			assert([i, CeL.stem_branch_index(CeL.to_stem_branch(i))]);
		}
	});

	node_info('Passed: All date tests.');
}



//============================================================================================================================================================


function test_character() {
	var test_name = 'character encoding 文字/字元編碼: ';
	setup_test(test_name);
	CeL.character.load(['Big-5', 'GB2312', 'EUCJP', 'Shift JIS'], function () {
		var text = '2017年 good 世界中の書籍を';
		all_error_count += CeL.test(test_name + 'Big5', [
			[['作輩', Buffer.from('A740BDFA', 'hex').toString('Big-5')], 'Big5 #1'],
			[[text, text.encode('Big5').toString('Big5')], 'Big5 #2'],
		]);
		all_error_count += CeL.test(test_name + 'GBK', [
			[['労鰷', Buffer.from('84BAF69C', 'hex').toString('GB2312')], 'GBK #1'],
			[[text, text.encode('GBK').toString('GBK')], 'GBK #2'],
		]);
		all_error_count += CeL.test(test_name + 'EUC-JP', [
			[['駈鮎鮏ﾆ', Buffer.from('B6EFB0BEFCE68EC6', 'hex').toString('EUCJP')], 'EUC-JP #1'],
			[[text, text.encode('EUC-JP').toString('EUC-JP')], 'EUC-JP #2'],
		]);
		all_error_count += CeL.test(test_name + 'Shift_JIS', [
			[['嫋ﾕ錵', Buffer.from('9B5DD5E845', 'hex').toString('ShiftJIS')], 'Shift_JIS #1'],
			[[text, text.encode('Shift_JIS').toString('Shift_JIS')], 'Shift_JIS #2'],
		]);
		all_error_count += CeL.test(test_name + 'encode_URI_component', [
			[[text, CeL.decode_URI_component(CeL.encode_URI_component(text, 'Shift_JIS'), 'Shift_JIS')], 'encode_URI_component #1'],
		]);
		finish_test(test_name);
	});
}



//============================================================================================================================================================


function test_encoding() {
	all_error_count += CeL.test('ロマ字↔仮名', [
		[['わたし', CeL.to_kana('watasi')], 'convert romaji to kana. ロマ字→仮名.'],
		// TODO: Pair.reverse 對 duplicated key 不穩定。
		// [[ 'watasi', CeL.to_romaji('わたし') ], 'convert romaji to kana. 仮名→ロマ字.'],
	]);
}



//============================================================================================================================================================


function test_check() {
	all_error_count += CeL.test('姓/名', [
		[[CeL.parse_personal_name('歐陽司徒').名, '司徒'], '解析姓名/人名'],
		[[CeL.parse_personal_name('歐陽佩君').姓, '歐陽'], '解析姓名/人名'],
		[[CeL.parse_personal_name('歐陽佩君').名, '佩君'], '解析姓名/人名'],
		[[CeL.parse_personal_name('恒王岑').姓, '恒'], '解析姓名/人名'],
		[[CeL.parse_personal_name('恒岑王').姓, '恒'], '解析姓名/人名'],
		[[CeL.parse_personal_name('呂蕭王').姓, '呂蕭'], '解析姓名/人名'],
		[[CeL.parse_personal_name('呂王蕭').姓, '呂'], '解析姓名/人名'],
		[[CeL.parse_personal_name('林元月').名, '元月'], '解析姓名/人名'],
		[[CeL.parse_personal_name('歐陽林元月').姓, '歐陽林'], '解析姓名/人名'],
		[[CeL.parse_personal_name('歐陽林元月').多姓.join(','), '歐陽,林'], '解析姓名/人名'],
		[[CeL.parse_personal_name('林歐陽元月').多姓.join(','), '林,歐陽'], '解析姓名/人名'],
		[[CeL.parse_personal_name('呂蕭').姓, '呂'], '解析姓名/人名'],
		[[CeL.parse_personal_name('蕭呂').姓, '蕭'], '解析姓名/人名'],
		[[CeL.parse_personal_name('林元').姓, '林'], '解析姓名/人名'],
	]);

}



//============================================================================================================================================================


function test_astronomy() {
	all_error_count += CeL.test('astronomy', [
		// http://songgz.iteye.com/blog/1571007
		[[66, Math.round(CeL.deltaT(2008))], 'get ΔT of year 2008 in seconds'],
		[[29, Math.round(CeL.deltaT(1950))], 'get ΔT of year 1950 in seconds'],
		[[5710, Math.round(CeL.deltaT(500))], 'get ΔT of year 500 in seconds'],
		[[1.11, Math.round(10 * CeL.deltaT(2010) / 6) / 100], 'get ΔT of year 2010 in minutes'],
		[[95.17, Math.round(10 * CeL.deltaT(500) / 6) / 100], 'get ΔT of year 500 in minutes'],

		// Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版

		// get ≈ 57.9′
		[[57.9, CeL.refraction(CeL.refraction.to_real(30 / 60) + 32 / 60) * 60], { name: '例15.a：表面光滑的太陽圓盤下邊沿視緯度是30′。設太陽的真直徑是32′，氣溫及大氣壓為常規條件。求真位置。', error_rate: .001 }],

		[[2014, CeL.立春年(new Date('2015/2/3'))], '立春年 2015/2/3'],
		[[2015, CeL.立春年(new Date('2015/2/4'))], '立春年 2015/2/4'],

	]);

	return;


	// other examples

	CeL.JD_to_Date(CeL.equinox(1962, 1));
	// get ≈ 1962-06-21 21:24

	CeL.nutation(2446895.5);
	// get ≈ [ -3.788/3600, 9.443/3600 ]

	// 取得 Gregorian calendar 1977年，中曆 1978年年內之冬至日 midnight (0:0) 時間。
	CeL.solar_term_JD(1977, '冬至');

	// ----------------------------------------------------------------------------
	// VSOP87

	// Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版
	// p. 219, Example 32.a with full VSOP87
	CeL.VSOP87.load_terms('Venus', function () {
		// corresponds to JD 2448976.5
		var JD = CeL.Julian_day.from_YMD(1992, 12, 20, 'CE') - .5;
		console.log(CeL.VSOP87(JD, 'Venus'), {
			degrees: true
		});
	});

	// Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版
	// p. 221, Example 32.b with full VSOP87
	CeL.VSOP87.load_terms('Saturn', function () {
		var JD = CeL.Julian_day.from_YMD(1999, 7, 26, 'CE') - .5;
		console.log(CeL.VSOP87(JD, 'Saturn', {
			FK5: false,
			degrees: true
		}));
	});

	// Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版
	// p. 225, Example 33.a with full VSOP87
	CeL.VSOP87.load_terms(['Venus', 'Earth'], function () {
		var JD = CeL.Julian_day.from_YMD(1992, 12, 20, 'CE') - .5;
		console.log(CeL.object_coordinates(JD, 'Venus'));
	});

	// Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版
	// p. 89, Example 12.b
	CeL.GMST(CeL.Julian_day.from_YMD(1987, 4, 10, 'CE') - .5
		+ CeL.Julian_day.from_HMS(19, 21));

	// Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版
	// p. 95, Example 13.b with full VSOP87
	CeL.VSOP87.load_terms(['Venus', 'Earth'], function () {
		var JD = CeL.Julian_day.from_YMD(1987, 4, 10, 'CE') - .5
			+ CeL.Julian_day.from_HMS(19, 21);
		console.log(CeL.object_coordinates(JD, 'Venus', {
			// United States Naval Observatory (USNO)
			// Coordinates: 38.921473°N 77.066946°W
			// @see
			// https://en.wikipedia.org/wiki/United_States_Naval_Observatory
			local: [38.921473, -77.066946],
			degrees: true
		}));
	});

	// Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版
	// p. 82. Example 11.a
	// p. 280. Example 40.a
	CeL.VSOP87.load_terms(['Mars', 'Earth'], function () {
		var JD = CeL.Julian_day.from_YMD(2003, 8, 28, 'CE') - .5
			+ CeL.Julian_day.from_HMS(3, 17);
		console.log(CeL.object_coordinates(JD, 'Mars', {
			// Palomar Observatory
			// Coordinates: 33°21′21″N 116°51′50″W
			// Altitude: 1,712 meters (5,617 ft)
			// @see https://en.wikipedia.org/wiki/Palomar_Observatory
			local: [33.355833, -116.863889, , 1712],
			degrees: true
		}));
	});

	// ----------------------------------------------------------------------------

	// 取得 Le calendrier républicain (法國共和曆)行用期間之年首。
	// method 1: 取得法國當地之 midnight (0:0)
	for (var year = 1792, offset = 1 * 60; year <= 1805; year++)
		console.log(CeL.JD_to_Date(
			// 1: UTC+1 → minute offset
			CeL.midnight_of(CeL.solar_term_JD(year, '秋分'), offset)).format({
				offset: offset
			}));
	// method 2: 將 date 當作 local 之 midnight (0:0)
	for (var year = 1792, offset = 1 * 60; year <= 1805; year++) {
		// 1: UTC+1 → minute offset
		var date = CeL.JD_to_Date(CeL.midnight_of(CeL.solar_term_JD(year,
			'秋分'), offset)
			+ (offset - CeL.String_to_Date.default_offset) / 60 / 24),
			// 歸零用
			ms = date.getMilliseconds();
		// 歸零
		if (ms)
			date.setMilliseconds(Math.round(ms / 500) * 500);
		console.log(date.format());
	}
	// method 3: using solar_term_calendar()
	for (var c = CeL.solar_term_calendar('秋分', 1 * 60),
		//
		year = 1792; year <= 1805; year++)
		console.log(new Date(c(year)).format());

	// 取得 Iran 當地之春分時刻。
	for (var year = 1975, offset = 3.5 * 60; year <= 2041; year++)
		console.log(CeL.JD_to_Date(
			// 3.5: UTC+3.5 → minute offset
			CeL.solar_term_JD(year, '春分')).format({
				offset: offset
			}));

	// 取得 Solar Hijri calendar (the official calendar in Iran and
	// Afghanistan from 1979) 年首。
	for (var year = 1975, offset = (3.5 + 12) * 60; year <= 2041; year++)
		console.log(CeL.JD_to_Date(
			// 3.5: UTC+3.5 → minute offset
			// 12: 移半天可以取代正午之效果。
			CeL.midnight_of(CeL.solar_term_JD(year, '春分'), offset)).format({
				offset: offset
			}));

	// method: using solar_term_calendar()
	for (var c = CeL.solar_term_calendar('春分', (3.5 + 12) * 60),
		//
		year = 1975; year <= 2041; year++)
		console.log(new Date(c(year)).format());

	// ----------------------------------------------------------------------------

	// 立春年
	CeL.assert([2014, CeL.立春年(new Date('2015/2/3'))], '立春年 2015/2/3');
	CeL.assert([2015, CeL.立春年(new Date('2015/2/4'))], '立春年 2015/2/4');

	// 取得 2000/1/1 月亮地心瞬時黃道視黃經 in degrees。
	CeL.LEA406.load_terms('V', function () {
		CeL.format_degrees(CeL.LEA406(CeL.Julian_day.from_YMD(2000, 1, 1,
			'CE'), 'V', {
			degrees: true
		}));
	});

	// 取得 2200年01月02日0:0 TT 月亮地心視黃經 in degrees。
	CeL.format_degrees(CeL.lunar_coordinates(CeL.Date_to_JD(new Date(
		'2200-01-02T00:00:00Z')), {
		degrees: true
	}).V, 3);

	// 取得 Gregorian calendar 1977 年之整年度日月合朔時間。
	CeL.lunar_phase(1977, 0, {
		duration: 1,
		mean: false,
		to_Date: true,
		format: 'CE'
	});

	CeL.lunar_phase_of_JD(2457101, {
		time: true
	});

	// 取得今年之天文曆譜。
	var 年朔日 = CeL.定朔((new Date).getFullYear(), {
		月名: true
	});
	年朔日.map(function (JD, index) {
		return 年朔日.月名[index] + ': ' + CeL.JD_to_Date(JD).format('CE');
	}).join('\n');

	// 取得新王莽天鳳3年之天文曆譜。
	var 年朔日 = CeL.定朔(CeL.era('新王莽天鳳3年'), {
		歲首: '丑',
		月名: true
	});
	年朔日.map(function (d, index) {
		return 年朔日.月名[index] + ': ' + CeL.JD_to_Date(d).format('CE');
	}).join('\n');
	// 取得月日
	var index = 年朔日.search_sorted(1727054, true);
	年朔日.月名[index] + '月' + (1727054 - 年朔日[index] | 0) + '日'

	// ----------------------------------------------------------------------------

	var sun_coordinates = new CeL.celestial_coordinates(
		//
		'solar', new Date, [25.048592, 121.556940]);
	sun_coordinates.object === 'sun';
	sun_coordinates.UT === 2457249;
	// TT in JD
	typeof sun_coordinates.TT === 'number';

	new CeL.celestial_coordinates('lunar',
		new Date(2015, 7, 6, 23, 2, 4, 5), [39 + 54 / 60,
		116 + 23 / 60]).Hd[1];

	// CeL.LEA406.load_terms('R');
	var moon_coordinates = new CeL.celestial_coordinates(
		//
		'lunar', new Date);
	moon_coordinates.object === 'moon';
	moon_coordinates.UT === 2457249;
	//
	typeof moon_coordinates.c('dynamical latitude') === 'number';

	// Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版
	// p. 95, Example 13.b with full VSOP87
	var Venus_coordinates = new CeL.celestial_coordinates('Venus',
		CeL.Julian_day.from_YMD([1987, 4, 10], [19, 21], 'CE'), [
		38.921473, -77.066946], {
		TT: true
	});
	// Venus_coordinates.H

	// Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版
	// p. 82. Example 11.a
	// p. 280. Example 40.a
	var Mars_coordinates = new CeL.celestial_coordinates('Mars',
		CeL.Julian_day.from_YMD(2003, 8, 28, 'CE') - .5
		+ CeL.Julian_day.from_HMS(3, 17), [33.355833,
		-116.863889, , 1712], {
		TT: true
	});
	// Mars_coordinates.E

	// ----------------------------------------------------------------------------

	// 壽星天文歷(V5.05) 北京市天安門 經 +116°23' 緯 + 39°54'
	// 日出 05:17:00 日落 19:23:15 中天 12:20:26
	/**
	 * <q>["2015/8/6 0:20:29.307", "2015/8/6 5:16:39.667", "2015/8/6 12:20:26.147", "2015/8/6 19:23:35.709"]</q>
	 */
	CeL.rise_set([39 + 54 / 60, 116 + 23 / 60, 8],
		CeL.Julian_day.from_YMD(2015, 8, 6, 'CE')).map(function (JD) {
			return CeL.JD_to_Date(JD).format('CE');
		});

	CeL.rise_set([89 + 54 / 60, 116 + 23 / 60, 8],
		CeL.Julian_day.from_YMD(2015, 8, 6, 'CE'), null, null, true)
		.map(function (JD) {
			return CeL.JD_to_Date(JD).format('CE');
		});

	// 日落
	CeL.rise_set([25.048592, 121.556940],
		CeL.Julian_day.from_YMD(2015, 8, 6, 'CE')).map(function (JD) {
			return CeL.JD_to_Date(JD).format('CE');
		});
	// http://aa.usno.navy.mil/rstt/onedaytable?form=2&ID=AA&year=2015&month=8&day=6&place=&lon_sign=1&lon_deg=116&lon_min=23&lat_sign=1&lat_deg=39&lat_min=54&tz=8&tz_sign=1
	CeL.rise_set([39 + 54 / 60, 116 + 23 / 60],
		CeL.Julian_day.from_YMD(2015, 8, 6, 'CE')).map(function (JD) {
			return CeL.JD_to_Date(JD).format('CE');
		});
	// 月出
	CeL.LEA406.load_terms('V');
	CeL.LEA406.load_terms('U');
	CeL.LEA406.load_terms('R');
	CeL.rise_set([39 + 54 / 60, 116 + 23 / 60],
		CeL.Julian_day.from_YMD(2015, 8, 6, 'CE'), null, 'moon').map(
			function (JD) {
				return CeL.JD_to_Date(JD).format('CE');
			});

	// Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版
	// p. 103. Example 15.a
	CeL.VSOP87.load_terms('Venus');
	CeL.rise_set([42 + 20 / 60, -(71 + 5 / 60)],
		CeL.Julian_day.from_YMD(1988, 3, 20, 'CE'), null, 'Venus').map(
			function (JD) {
				return CeL.JD_to_Date(JD).format('CE');
			});

	// Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版
	// p. 109. formula 17.1
	// 計算Arcturus(α Boo)和Spica(α Vir)之間的角距離。
	CeL.format_radians(CeL.angular_distance({
		α: CeL.time_to_radians(14, 15, 39.7),
		δ: CeL.degrees_to_radians(19, 10, 57)
	}, {
		α: CeL.time_to_radians(13, 25, 11.6),
		δ: CeL.degrees_to_radians(-11, 9, 41)
	}));

	CeL.LEA406.default_type = 'a';
	CeL.LEA406.load_terms('Va');
	CeL.LEA406.load_terms('Ua');
	CeL.LEA406.load_terms('Ra');
	(new CeL.celestial_coordinates('lunar', CeL.Julian_day.from_YMD(2257,
		1, 1, 'CE'))).Gd;
	/**
	 * 1987年5月，月亮經過升交點的時刻。 1987/5/23 06:25:34.5 TT by JPL's HORIZONS system
	 * DE-0431LE-0431
	 * <q>
	Date__(UT)__HR:MN:SC.fff Date_________JDUT            CT-UT    ObsEcLon    ObsEcLat
	1987-May-23 06:24:39.000 2446938.767118055        55.185126  10.4622714  -0.0000047
	1987-May-23 06:24:39.500 2446938.767123843        55.185126  10.4623472   0.0000021
	</q>
	 * .767118055+(.767123843-.767118055)*47/(47+21) + 55.185126/86400 ≈
	 * 0.767760772265523 TT
	 *
	 * (((.767118055+(.767123843-.767118055)*47/(47+21))*24-18)*60-25)*60+55.185126 ≈
	 * 34.5 s
	 *
	 * CeL.LEA406.default_type = 'a'; CeL.LEA406.load_terms('Va');
	 * CeL.LEA406.load_terms('Ua'); CeL.LEA406.load_terms('Ra');
	 * <code>CeL.find_root(function(TT){return CeL.LEA406(TT).U;},2446938.767,2446938.768)</code> ≈
	 * 2446938.767738394 TT
	 *
	 * (.767738394-0.767760772265523)*86400 ≈ -1.9334821411856495
	 *
	 * <code>CeL.find_root(function(TT){return CeL.LEA406(TT,{FK5:false}).U;},2446938.767,2446938.768)</code> ≈
	 * 2446938.767744784 TT
	 *
	 * (.767744784-0.767760772265523)*86400 ≈ -1.3813861411836825
	 *
	 * no FK5 較接近。但仍有誤差 1.4 s
	 */
	CeL.find_root(function (TT) {
		return CeL.lunar_coordinates(TT, {
			FK5: false
		}).β;
	}, 2446938.767, 2446938.768);
	(new CeL.celestial_coordinates('lunar', CeL.Julian_day.from_YMD(1987,
		5, 23, 'CE')
		- .5 + CeL.Julian_day.from_HMS(6, 24, 37.7))).Gd;

	// ----------------------------------------------------------------------------

	CeL.JD_to_Date(
		// Jean Meeus, Astronomical Algorithms, 2nd Edition. 《天文算法》2版
		// p. 357. Example 50.a
		CeL.lunar_perigee_apogee(1988.75, true)[0]).format('CE');

	// p. 353. Example 49.a
	CeL.mean_lunar_phase(CeL.Julian_century(2443192) * 100 + 2000, 0, {
		eclipse: true
	});

	// p. 384. Example 54.a - Solar eclipse of 1993 May 21.
	CeL.mean_lunar_phase(
		CeL.Julian_century(2449128.1673547593) * 100 + 2000, 0, {
		eclipse: true
	});
	// p. 385. Example 54.b - Solar eclipse of 2009 July 22.
	CeL.mean_lunar_phase(CeL.Julian_century(2455034) * 100 + 2000, 0, {
		eclipse: true
	});


}



//============================================================================================================================================================


function test_wiki() {
	// Set default language. 改變預設之語言。 e.g., 'zh'
	CeL.wiki.set_language('zh');

	all_error_count += CeL.test('wiki: regular functions', [

		[['Abc', CeL.wiki.normalize_title('abc')], 'normalize_title #0'],
		[['en:Abc', CeL.wiki.normalize_title('EN:abc')], 'normalize_title #1'],
		[['A. bc: abc', CeL.wiki.normalize_title('a. bc: abc')], 'normalize_title #2'],
		[['en:Abc', CeL.wiki.normalize_title(' En : abc')], 'normalize_title #3'],
		[['en:Abc', CeL.wiki.normalize_title(':eN:abc')], 'normalize_title #4'],
		[['en:Abc: def', CeL.wiki.normalize_title('En:abc: def')], 'normalize_title #5'],
		[['User talk:Abc', CeL.wiki.normalize_title('user_talk: abc')], 'normalize_title #6'],
		[['User:Abc', CeL.wiki.normalize_title('user: abc')], 'normalize_title #7'],
		[['en:Wikipedia:SD', CeL.wiki.normalize_title(' :En:wikipedia: SD')], 'normalize_title #8'],
		[['Abc def', CeL.wiki.normalize_title('abc_def')], 'normalize_title #9'],
		[['en-us:Abc', CeL.wiki.normalize_title('en-us:abc')], 'normalize_title #10'],
		[['en-us:Abc def', CeL.wiki.normalize_title('en-us:abc_def')], 'normalize_title #11'],
		[['Abc_def', CeL.wiki.normalize_title('abc def', true)], 'normalize_title #12'],
		[['User_talk:Abc_def', CeL.wiki.normalize_title('user talk: abc def', true)], 'normalize_title #13'],
		[['ABC DEF:QQQ', CeL.wiki.normalize_title('ABC DEF:QQQ')], 'normalize_title #14'],

		[['[[User:Adam/test]]', CeL.wiki.title_link_of('User:Adam/test')], 'title_link_of #1'],
		[['Adam', CeL.wiki.parse.user('[[User:Adam/test]]')], 'parse.user #1'],
		[['Adam', CeL.wiki.parse.user('[[en:User:Adam/test]]')], 'parse.user #2: 連接到其他維基媒體站點上的用戶頁面'],
		[[true, CeL.wiki.parse.user('[[User:Adam/test]]', 'adam')], 'parse.user #3'],
	]);

	all_error_count += CeL.test('wiki: CeL.wiki.plain_text() basic test', [
		[['エアポート快特', CeL.wiki.plain_text('<font lang="ja">エアポート快特</font>')]],
		[["卡斯蒂利亞王后 凱瑟琳", CeL.wiki.plain_text("卡斯蒂利亞王后'''凱瑟琳'''")]],
		[["MS 明朝 (MS Mincho) 及 MS P明朝 (MS PMincho)",
			CeL.wiki.plain_text("'''MS 明朝''' ('''MS Mincho''') 及 '''MS P明朝''' ('''MS PMincho''')")]],
		[['洗腳風俗及儀式', CeL.wiki.plain_text("洗腳風俗及儀式<small>（英文）</small>")]],
		[['節目列表', CeL.wiki.plain_text("節目列表 {{En icon}}")]],
		[["It's good", CeL.wiki.plain_text("''It's good''")]],
		[["alb", CeL.wiki.plain_text("a[[l]]b")]],
		[["a l b", CeL.wiki.plain_text("a [[l]] b")]]

	]);

	all_error_count += CeL.test('wiki: file_pattern & parse_template', [
		[[4, CeL.wiki.namespace('Wikipedia:NAME')], 'wiki.namespace #1'],
		[[0, CeL.wiki.namespace(':ABC')], 'wiki.namespace #2'],
		[[8, CeL.wiki.namespace('MediaWiki')], 'wiki.namespace #3'],
		[['NAME', CeL.wiki.remove_namespace('Wikipedia:NAME')], 'wiki.remove_namespace #1'],
		[['ABC', CeL.wiki.remove_namespace('ABC')], 'wiki.remove_namespace #2'],
		[['ABC', CeL.wiki.remove_namespace(':ABC')], 'wiki.remove_namespace #3'],
		[[true, CeL.wiki.is_talk_namespace('talk:ABC')], 'wiki.is_talk_namespace #1'],
		[[false, CeL.wiki.is_talk_namespace('ABC')], 'wiki.is_talk_namespace #2'],
		[[false, CeL.wiki.is_talk_namespace('Wikipedia:NAME')], 'wiki.is_talk_namespace #3'],
		[[true, CeL.wiki.is_talk_namespace('Wikipedia talk:NAME')], 'wiki.is_talk_namespace #4'],
		[['Talk:ABC', CeL.wiki.to_talk_page('ABC')], 'wiki.to_talk_page #1'],
		[['Talk:ABC', CeL.wiki.to_talk_page('talk:ABC')], 'wiki.to_talk_page #2'],
		[['Wikipedia talk:NAME', CeL.wiki.to_talk_page('Wikipedia:NAME')], 'wiki.to_talk_page #3'],
		[['Wikipedia talk:NAME', CeL.wiki.to_talk_page('Wikipedia talk:NAME')], 'wiki.to_talk_page #4'],
		[['Talk:ABC DEF: RRR', CeL.wiki.to_talk_page('ABC DEF: RRR')], 'wiki.to_talk_page #5'],
		[!CeL.wiki.to_talk_page('topic:NAME'), 'wiki.to_talk_page: There is no talk page for Topic.'],
		[['NAME', CeL.wiki.talk_page_to_main('NAME')], 'wiki.talk_page_to_main #1'],
		[['NAME', CeL.wiki.talk_page_to_main('talk:NAME')], 'wiki.talk_page_to_main #2'],
		[['明朝', CeL.wiki.talk_page_to_main('明朝')], 'wiki.talk_page_to_main #3'],
		[['明朝', CeL.wiki.talk_page_to_main('Talk:明朝')], 'wiki.talk_page_to_main #4'],
		[['Wikipedia:NAME', CeL.wiki.talk_page_to_main('Wikipedia:NAME')], 'wiki.talk_page_to_main #5'],
		[['Wikipedia:NAME', CeL.wiki.talk_page_to_main('Wikipedia talk:NAME')], 'wiki.talk_page_to_main #6'],

		[['!![[File:abc d.svg]]@@', '!![[File : Abc_d.png]]@@'
			//
			.replace(CeL.wiki.file_pattern('abc d.png'), '[[$1File:abc d.svg$3')], 'file_pattern'],

		[[undefined, CeL.wiki.parse.template('a{temp}b', '')], '不包含模板'],
		[[undefined, CeL.wiki.parse.template('a{{t}}b', 'temp')], '不包含此模板'],
		[['temp', CeL.wiki.parse.template('a{{temp|{{temp2|p{a}r}}}}b', '', false)[1]], '未指定模板名，擷取首個模板名'],
		[['|{{temp2|p{a}r}}', CeL.wiki.parse.template('a{{temp|{{temp2|p{a}r}}}}b', '', true)[2]], '未指定模板名，不解析 parameters'],
		[[',{{temp2,p{a}r}}', CeL.wiki.parse.template('a{{temp|{{temp2|p{a}r}}}}b', '', false)[2].join()], '未指定模板名，解析 parameters: 無 [0]'],
		[['|{{temp2|p{a}r}}', CeL.wiki.parse.template('a{{temp|{{temp2|p{a}r}}}}b', 'temp', true)[2]], '指定模板名，不解析 parameters'],
		[[',{{temp2,p{a}r}}', CeL.wiki.parse.template('a{{temp|{{temp2|p{a}r}}}}b', 'temp', false)[2].join()], '未指定模板名，解析 parameters: 無 [0]'],
		[['|p{a}r', CeL.wiki.parse.template('a{{temp|{{temp2|p{a}r}}}}b', 'temp2', true)[2]], '指定內部模板名，不解析 parameters'],
		[[',p{a}r', CeL.wiki.parse.template('a{{temp|{{temp2|p{a}r}}}}b', 'temp2', false)[2].join()], '指定內部模板名，解析 parameters: 無 [0]'],

		[['{{temp|{{temp2|p{a}r}}}}', CeL.wiki.parse.template('a{{temp|{{temp2|p{a}r}}}}b')[0]], 'get template wikitext/完整的模板 wikitext token'],
		[['{{temp|{{temp2|p{a}r}}}}', CeL.wiki.parse.template('a{{temp|{{temp2|p{a}r}}}}b', 'temp')[0]], '指定內部模板名，get template wikitext'],
		[['{{temp2|p{a}r}}', CeL.wiki.parse.template('a{{temp|{{temp2|p{a}r}}}}b', 'temp2')[0]]],
		[['1', CeL.wiki.parse.template('"{{t|p=p|1|q=q|2}}"', 't')[2][1]], 'parameters index #1'],
		[['2', CeL.wiki.parse.template('"{{t|p=p|1|q=q|2}}"', 't')[2][2]], 'parameters index #2'],
		[['p', CeL.wiki.parse.template('"{{t|p=p|1|q=q|2}}"', 't')[2].p], 'parameters index .p'],
		[['q', CeL.wiki.parse.template('"{{t|p=p|1|q=q|2}}"', 't')[2].q], 'parameters index .q'],

		[['vfd', CeL.wiki.parse.template('{{vfd|已提刪}}\n...', ['vfd', 'afd'], true)[1]]],
		[['2015/10/21', CeL.wiki.parse.template('\n{{vfd|已提刪|date=2015/10/21}}\n...', ['vfd', 'afd'])[2].date]],

		[['[[Special:用户贡献/Cewbot|cewbot]]', CeL.wiki.parse.wiki_URL('https://zh.wikipedia.org/wiki/Special:%E7%94%A8%E6%88%B7%E8%B4%A1%E7%8C%AE/Cewbot cewbot', true)], 'URL_to_wiki_link'],
		[['Wikipedia:沙盒', CeL.wiki.parse.wiki_URL('https://zh.wikipedia.org/wiki/Wikipedia:%E6%B2%99%E7%9B%92')], 'URL_to_wiki_link'],
		[['[[Wikipedia:沙盒]]', CeL.wiki.parse.wiki_URL('https://zh.wikipedia.org/wiki/Wikipedia:%E6%B2%99%E7%9B%92', true)], 'URL_to_wiki_link'],
		[['[[Wikipedia:沙盒|SB]]', CeL.wiki.parse.wiki_URL('https://zh.wikipedia.org/wiki/Wikipedia:%E6%B2%99%E7%9B%92 SB', true)], 'URL_to_wiki_link'],
		[[':en:Wikipedia:Sandbox', CeL.wiki.parse.wiki_URL('https://en.wikipedia.org/wiki/Wikipedia:Sandbox')], 'URL_to_wiki_link'],
		[['網頁', CeL.wiki.parse.wiki_URL('https://zh.wikipedia.org/wiki/%E7%B6%B2%E9%A0%81')], 'URL_to_wiki_link'],
		[['網頁|頁面', CeL.wiki.parse.wiki_URL('https://zh.wikipedia.org/wiki/%E7%B6%B2%E9%A0%81 頁面')], 'URL_to_wiki_link'],
		[['網頁#儲存網頁', CeL.wiki.parse.wiki_URL('https://zh.wikipedia.org/wiki/%E7%B6%B2%E9%A0%81#.E5.84.B2.E5.AD.98.E7.B6.B2.E9.A0.81')], 'URL_to_wiki_link'],
		[['網頁#儲存網頁|頁面', CeL.wiki.parse.wiki_URL('https://zh.wikipedia.org/wiki/%E7%B6%B2%E9%A0%81#.E5.84.B2.E5.AD.98.E7.B6.B2.E9.A0.81 頁面')], 'URL_to_wiki_link'],
		[['網頁', CeL.wiki.parse.wiki_URL('http://zh.wikipedia.org/zh-tw/%E7%B6%B2%E9%A0%81')], 'URL_to_wiki_link'],
		[['網頁', CeL.wiki.parse.wiki_URL('https://zh.wikipedia.org/w/index.php?title=%E7%B6%B2%E9%A0%81')], 'URL_to_wiki_link'],
		[['網頁', CeL.wiki.parse.wiki_URL('https://zh.wikipedia.org/w/index.php?uselang=zh-tw&title=%E7%B6%B2%E9%A0%81')], 'URL_to_wiki_link'],
		[['File:ShanghaiMetro2020plus.svg', CeL.wiki.parse.wiki_URL('https://zh.wikipedia.org/wiki/%E4%B8%8A%E6%B5%B7%E5%9C%B0%E9%93%81#/media/File:ShanghaiMetro2020plus.svg')], 'URL_to_wiki_link'],
		[['[http://a.b.c/]', CeL.wiki.parse.wiki_URL('http://a.b.c/', true)], 'URL_to_wiki_link'],
		[['[http://a.b.c/ def ghi]', CeL.wiki.parse.wiki_URL('http://a.b.c/ def ghi', true)], 'URL_to_wiki_link'],

		[['param_1=abc|p2=123', CeL.wiki.template_text({ param_1: 'abc', p2: 123 })], 'to_template_wikitext #1'],
		[['{{pp|p1=pqr|p 2=234}}', CeL.wiki.template_text({ p1: 'pqr', 'p 2': 234 }, 'pp')], 'to_template_wikitext #2'],
		[['{{p|1|w|4}}', CeL.wiki.template_text([1, 'w', 4], 'p')], 'to_template_wikitext #3'],

	]);

	all_error_count += CeL.test('CeL.wiki.parser', function (assert) {
		var wikitext, parsed;
		wikitext = 't[http://a.b/ x[[l]]'; parsed = CeL.wiki.parse(wikitext);
		assert([wikitext, parsed.toString()], 'wiki.parse: external link');
		wikitext = '++\npp:http://h /p n\n++'; parsed = CeL.wiki.parse(wikitext);
		assert([wikitext, parsed.toString()], 'wiki.parse: plain url #1');
		assert(['++\npp:~~ /p n\n++', CeL.wiki.parser(wikitext).each('url', function (token) { return '~~'; }, true).toString()], 'wiki.parse: plain url #2');
		wikitext = 'http://http://h'; parsed = CeL.wiki.parse(wikitext);
		assert([wikitext, parsed.toString()], 'wiki.parse: plain url #3');
		assert(['~~', CeL.wiki.parser(wikitext).each('url', function (token) { return '~~'; }, true).toString()], 'wiki.parse: plain url #4');
		wikitext = 'http://http://h{{t}}http://s.r[g]ftp://p.q'; parsed = CeL.wiki.parse(wikitext);
		assert([wikitext, parsed.toString()], 'wiki.parse: plain url #5');
		assert(['~~{{t}}~~[g]~~', CeL.wiki.parser(wikitext).each('url', function (token) { return '~~'; }, true).toString()], 'wiki.parse: plain url #6');

		wikitext = '1{{t|a=\nb\n}}{{p|b}}2'; parsed = CeL.wiki.parser(wikitext);
		assert(['b', parsed.parse()[1].parameters.a], 'wiki.parse: template .parameters');

		wikitext = 't<!--='; parsed = CeL.wiki.parse(wikitext);
		assert([wikitext, parsed.toString()]);
		wikitext = 'a[[l]]b'; parsed = CeL.wiki.parser(wikitext).parse();
		assert(['a{{t}}b', parsed.each('link', function (token, parent, index) { return '{{t}}'; }, true).toString()]);

		wikitext = '[[Image:a.svg|thumb|20px|b{{c|d[[e]]f}}]]'; parsed = CeL.wiki.parser(wikitext).parse();
		assert(['file', parsed[0].type], 'wiki.parse.file #1-1');
		assert(['A.svg', parsed[0].name], 'wiki.parse.file #1-2');
		assert(['b{{c|d[[e]]f}}', parsed[0][4].toString()], 'wiki.parse.file #1-3');
		wikitext = "[[File:a.svg|alt= alt_of_{{tl|t}} |  !!{{tl|t}}| 654px|thumb  ]]"; parsed = CeL.wiki.parse(wikitext);
		assert([wikitext, parsed.toString()], 'wiki.parse.file #2-1');
		assert(['!!{{tl|t}}', parsed.caption.toString()], 'wiki.parse.file #2-2');
		assert(['{{tl|t}}', parsed.caption[1].toString()], 'wiki.parse.file #2-3');
		assert(['654px', parsed.size], 'wiki.parse.file #2-4');
		assert(['alt_of_{{tl|t}}', parsed.alt.toString()], 'wiki.parse.file #2-5');
		assert(['thumb', parsed.format], 'wiki.parse.file #2-6');
		wikitext = '[[Media:a.ogg|thumb |  a<br/>b   |200px | link= ABC]]'; parsed = CeL.wiki.parse(wikitext);
		assert([wikitext, parsed.toString()], 'wiki.parse.file #3-1');
		assert(['ABC', parsed.link.toString()], 'wiki.parse.file #3-2');
		assert(['thumb', parsed.format], 'wiki.parse.file #3-3');
		assert(['a<br/>b', parsed.caption.toString()], 'wiki.parse.file #3-4');
		assert(['  a<br/>b   ', parsed[3].toString()], 'wiki.parse.file #3-5');

		wikitext = '{{c|d[[e]]f}}'; parsed = CeL.wiki.parser(wikitext).parse();
		assert(['{{c|df}}', CeL.wiki.parser(wikitext).each('link', function (token, parent, index) { return ''; }, true).toString()], 'search all links');
		assert(['{{c|d[[e]]f}}', CeL.wiki.parser(wikitext).each('link', function (token, parent, index) { return ''; }, true, 1).toString()], 'only links of level 1');
		assert(['file', CeL.wiki.parse('[[FiLe:a]]').type]);
		assert(['Ab', CeL.wiki.parse('[[FiLe:ab]]').name]);
		// TODO: 當前解析為 'link', 應為 'text'
		// assert([ 'text', CeL.wiki.parse('[[File:]]').type ]);
		assert(['link', CeL.wiki.parse('[[File]]').type]);
		assert(['category', CeL.wiki.parse('[[Category:a]]').type]);
		assert(['Ab', CeL.wiki.parse('[[Category:ab]]').name]);
		// TODO: 當前解析為 'link', 應為 'text'
		// assert([ 'text', CeL.wiki.parse('[[Category:]]').type ]);
		assert(['link', CeL.wiki.parse('[[Category]]').type]);
		// CeL.wiki.parser('[[Category:a]]').each('category', function(token) {console.log(token);});0;
		wikitext = '{{ {{tl|t}} | p }}'; parsed = CeL.wiki.parse(wikitext);
		assert(['transclusion', parsed.type], 'template in template name #1-1');
		assert([' p ', parsed[1]], 'template in template name #1-2');
		assert(['p', parsed.parameters[1]], 'template in template name #1-3');
		wikitext = '{{Wikipedia:削除依頼/ログ/{{今日}}}}'; parsed = CeL.wiki.parse(wikitext);
		assert(['transclusion', parsed.type], 'template in template name #2-1');
		assert(['transclusion', parsed[0][1].type], 'template in template name #2-2');
		wikitext = '{{#ifexpr: {{{1}}} > 0 and {{{1}}} < 1.0 or {{#ifeq:{{{decimal}}}| yes}} |is decimal |not decimal}}'; parsed = CeL.wiki.parse(wikitext);
		assert(['function', parsed.type]);

		wikitext = 'a[[link]]b'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a[[link#section]]b'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a[[link#section|displayed]]b'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a[[link#section|displayed|2]]b'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a[[link#section|displayed|2#3]]b'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a[[link#section#2|displayed|2#3]]b'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a[[#section#2|displayed|2#3]]b'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a[[text{abc}[[link]]text]]b'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a[[file:abc.jpg]]b'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a[[WP:abc]]b'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a[[:file:abc.jpg]]b'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a[[]]b'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a[[#]]b'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a[[text{abc}text]]b'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a[[#a| s[[r]] ]]b'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a[[#a| s[[r] ]]b'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		assert([' s[[r] ', CeL.wiki.parser(wikitext).parse()[1][2]]);
		wikitext = 'a[[#a3| s[r] ]]b'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a[[#a3| s[r]{3} ]]b'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a[[#a3| s[r]-{3}- ]]b'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a[[abc|s{{=}} -{ab}-]]b'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a [[b<!-- c -->]]d'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a [[:en:b<!-- c -->]] d'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a [[b{{=}}<!-- c -->]]d'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a [[:en:b{{=}}<!-- c -->]] d'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a [[<!-- c -->b{{=}}]]d'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a [[<!-- c -->:en:b{{=}}]]d'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a [[:<!-- c -->en:b{{=}}]] d'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a [[:en:<!-- c -->b{{=}}]] d'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a [[:en<!-- c -->:b{{=}}]] d'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a \n==[[:en<!--comments-->:link{{=}}<!--comments-->]] ==\n d'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = '{|\n|-\n|[[{{t}}]]\n|}'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = '{|\n|-\n|[[{{t}}]]<!-- c -->\n|}'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = '{|\n!|t\n|-\n|[[{{t|p}}]]\n|}'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a\n{|\n!|t\n|-\n|t\n|[[{{t|p}}]]<!-- c -->\n|}\nb'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = "text --'''-{[[User:user|user1]]}-'''（[[User talk:user|-{user2}-]]）"; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = '==t1==\n== t2 =='; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = '[[t#-{c}-]]'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = '[[t#a-{c}-b]]'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = '==t==\n[[w:t/t#a-{c}-]] \n'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = '[[:[[Portal:中國大陸新聞動態|中国大陆新闻]] 3月16日新闻]]'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		assert(['plain', parsed.type]);
		assert(['link', parsed[1].type]);
		wikitext = '==[[:[[Portal:中國大陸新聞動態|中国大陆新闻]] 3月16日新闻]]=='; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = '== [[:[[Portal:中國大陸新聞動態|中国大陆新闻]] 3月16日新闻]]==\ntext\n'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = "'''''Italic and bold formatting'''''"; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		assert(['italic', parsed[0].type], "'''''t''''' will render as <i><b>t</b></i>");
		assert(['bold', parsed[0][0].type]);
		wikitext = "a '''''b''''' c's ''d'' e ''f'' g ''h''."; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = 'a[[t|\'\'\' <span>T</span>\'\'\']].'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = '<nowiki>-{ </nowiki> a <nowiki>}-</nowiki>'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		assert(['<nowiki>-{ </nowiki>', parsed[0].toString()]);
		wikitext = '-{ <nowiki>dd}-<b></nowiki> }-<nowiki> ff</b></nowiki>'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		assert(['-{ <nowiki>dd}-<b></nowiki> }-', parsed[0].toString()]);
		// language conversion -{}- 以後來使用的為主。
		wikitext = '-{}-'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		assert(['', CeL.wiki.parse(wikitext).converted], 'null conversion');
		wikitext = '-{  阿  }-'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		assert(['  阿  ', CeL.wiki.parse(wikitext).converted]);
		wikitext = '-{zh-cn:2 ;  zh-tw: 阿  }-'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		assert(['阿', CeL.wiki.parse(wikitext).toString('zh-tw')]);
		wikitext = '-{zh-cn:2 ;  zh-tw: 阿 ;  }-'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		assert(['阿 ', CeL.wiki.parse(wikitext).toString('zh-tw')], '最後的單一/\s/會被轉換為"&#160;"');
		wikitext = '-{zh-cn:2 ;  zh-tw: 阿  ;  }-'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		assert(['阿', CeL.wiki.parse(wikitext).toString('zh-tw')]);
		wikitext = '-{ "ee" [[dd]]  ;zh-hk:阿;- ;zh-tw:1亞1;zh-cn:阿2 ;  zh-tw: 亞;;}-'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		assert(['亞;', CeL.wiki.parse(wikitext).toString('zh-tw')]);

		wikitext = '-{A|zh-hans:哥伦拜恩中学;zh-hant:科倫拜中學}-'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = '-{|zh-hans:哥伦拜恩中学;zh-hant:科倫拜中學}-'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = '-{  zh-hans | zh-hans:哥伦拜恩中学;zh-hant:科倫拜中學}-'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = '-{zh-hans; zh-hant | zh-hans:哥伦拜恩中学;zh-hant:科倫拜中學 }-'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = "'''[[哥伦拜恩中学|-{A|zh-hans:哥伦拜恩中学;zh-hant:科倫拜中學}-]]'''"; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);

		// TODO: Should use options.with_properties
		wikitext = "-{H|zh-cn:俄-{匊}-斯;zh-tw:俄-{匊}-斯;zh-hk:俄-{匊}-斯;}- "; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		assert(['', parsed.conversion_table.俄匊斯.toString('zh-tw')], 'conversion_table 1');
		assert(['俄匊斯', parsed.conversion_table.俄匊斯.toString('zh-tw', null, true)], 'conversion_table force_show');

		wikitext = '-{;  zh-hk:阿;- ;zh-tw:1亞1;zh-cn:阿2  ;  zh-tw: 2亞 ; zh-cn:阿3 ;  	 }-'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		assert(['2亞 ', CeL.wiki.parse(wikitext).toString('zh-tw')], '最後的單一/\s/會被轉換為"&#160;"');
		wikitext = '-{  zh-tw:1;  zh-cn:2 ;}--{}--{  }--{;zh-tw:1;zh-cn:2}--{zh-tw:1;  zh-cn:2 ;  }-a[[t#a3| s[r]-{  ;  zh-hk:阿;- ;zh-tw:亞;zh-cn:阿2 ;  zh-tw:  亞姆----; ddff;;-ees: ggfggf;;}- ]]b'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		wikitext = '-{zh-cn: cn ;  zh-hant :tw2  }-'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		assert(['tw2', parsed[0].toString('zh-tw')], 'language fallback');
		wikitext = '-{zh-tw:    tw ; tw : tw2   ; f ;; ccc ;   }-'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		assert(['tw ; tw : tw2   ; f ;; ccc ', parsed[0].toString('zh-tw')], 'language fallback');
		wikitext = '-{zh-tw:    tw ; tw : tw2   ; f ;; ccc  ;   }-'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()]);
		assert(['tw ; tw : tw2   ; f ;; ccc', parsed[0].toString('zh-tw')], 'language fallback: 最後的單一/\s/會被轉換為"&#160;"');

		wikitext = '1<br>2'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parse: HTML single tag #1');
		assert(['br', parsed[1].tag], 'wiki.parse: HTML single tag #2');
		wikitext = '1<br clear="all">2'; parsed = CeL.wiki.parser(wikitext).parse();
		assert(['tag_single', parsed[1].type], 'wiki.parse: HTML single tag #3');
		assert([wikitext, parsed.toString()], 'wiki.parse: HTML single tag #4');
		assert([' clear="all"', parsed[1][0].toString()], 'wiki.parse: HTML single tag #5');

		wikitext = '1<b>a</b>2'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parse: HTML tag #1');
		assert(['b', parsed[1].tag], 'wiki.parse: HTML tag #2');
		wikitext = '1<b style="color:#000"  >{{a}}{{c}}</b>2'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parse: HTML tag #3');
		assert(['b', parsed[1].tag], 'wiki.parse: HTML tag #4');
		assert([' style="color:#000"  ', String(parsed[1][0]).toString()], 'wiki.parse: HTML tag #5: tag attributes');
		assert(['tag_inner', parsed[1][1].type], 'wiki.parse: HTML tag #6');
		assert(['1<b style="color:#000"  ></b>2', CeL.wiki.parser(wikitext).each('tag_inner', function (token, parent, index) { return ''; }, true).toString()], 'wiki.parse: HTML tag #7');

		wikitext = '1<pre class="c">\n==t==\nw\n</pre>2'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parse: HTML tag pre #1');
		assert(['<pre class="c">\n==t==\nw\n</pre>', parsed[1].toString()], 'wiki.parse: HTML tag pre #2');
		assert([' class="c"', parsed[1][0].toString()], 'wiki.parse: HTML tag pre #3');
		assert(['\n==t==\nw\n', parsed[1][1].toString()], 'wiki.parse: HTML tag pre #4');
		wikitext = '1<nowiki>\n==t==\nw\n</nowiki>2'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parse: nowiki #1');
		assert(['<nowiki>\n==t==\nw\n</nowiki>', parsed[1].toString()], 'wiki.parse: nowiki #2');
		assert(['', parsed[1][0].toString()], 'wiki.parse: nowiki #3');
		assert(['\n==t==\nw\n', parsed[1][1].toString()], 'wiki.parse: nowiki #4');

		wikitext = '{{tl|1=<b a{{=}}"A">i</b>|p=P}}'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parse: {{=}} #1');
		wikitext = '{{tl|<b a{{=}}"A">i</b>}}'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parse: {{=}} #2');
		wikitext = '<b a{{=}}"A">i</b>'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parse: {{=}} #3');
		wikitext = '<b a="A">i</b>'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parse: {{=}} #4');

		assert(['{{t|v1|v2|p1=vp1|p2=vp2}}', CeL.wiki.parse.template_object_to_wikitext('t', { 1 : 'v1', 2 : 'v2', p1 : 'vp1', p2 : 'vp2' }) ], 'template_object_to_wikitext: #1');
		assert(['{{t|v1|v2|4=v4|p1=vp1}}', CeL.wiki.parse.template_object_to_wikitext('t', { 1 : 'v1', 2 : 'v2', 4 : 'v4', p1 : 'vp1' }) ], 'template_object_to_wikitext: #2');
		assert(['{{t|v1|v2|p1=vp1}}', CeL.wiki.parse.template_object_to_wikitext('t', { 1 : 'v1', 2 : 'v2', p1 : 'vp1', q2 : 'vq2' }, function(text_array) { return text_array.filter(function(text, index) { return !/^q/.test(text); }); }) ], 'template_object_to_wikitext: #3');

		var token;
		token = CeL.wiki.parse('{{t|1}}');
		assert([0, CeL.wiki.parse.replace_parameter(token, 2, 'aa') && token.toString()], 'wiki.parse.replace_parameter: #0');
		token = CeL.wiki.parse('{{t|1}}');
		assert(['{{t|aa}}', CeL.wiki.parse.replace_parameter(token, 1, 'aa') && token.toString()], 'wiki.parse.replace_parameter: #1');
		token = CeL.wiki.parse('{{t | }}');
		assert(['{{t |bb}}', CeL.wiki.parse.replace_parameter(token, 1, 'bb') && token.toString()], 'wiki.parse.replace_parameter: #2');
		token = CeL.wiki.parse('{{ t|1}}');
		assert(['{{ t| c}}', CeL.wiki.parse.replace_parameter(token, 1, ' c') && token.toString()], 'wiki.parse.replace_parameter: #3');
		token = CeL.wiki.parse('{{t| 1 =1}}');
		assert(['{{t|1=d }}', CeL.wiki.parse.replace_parameter(token, 1, '1=d ') && token.toString()], 'wiki.parse.replace_parameter: #4');
		token = CeL.wiki.parse('{{t| 1=}}');
		assert(['{{t| 1= e}}', CeL.wiki.parse.replace_parameter(token, 1, { '1': ' e' }) && token.toString()], 'wiki.parse.replace_parameter: #5');
		token = CeL.wiki.parse('{{t|a|3 =r}}');
		assert(['{{t|a|3= ff}}', CeL.wiki.parse.replace_parameter(token, 3, '3= ff') && token.toString()], 'wiki.parse.replace_parameter: #6');
		token = CeL.wiki.parse('{{t|a|b=r|ww}}');
		assert(['{{t|a|b= ss|ww}}', CeL.wiki.parse.replace_parameter(token, 'b', { b: ' ss' }) && token.toString()], 'wiki.parse.replace_parameter: #7');
		token = CeL.wiki.parse('{{t|a|b={{r}}|ww}}');
		assert(['{{t|a| b=s |ww}}', CeL.wiki.parse.replace_parameter(token, 'b', ' b=s ') && token.toString()], 'wiki.parse.replace_parameter: #8');
		token = CeL.wiki.parse('{{t|a|b{{=}}r|ww}}');
		assert(['{{t|a| t|ww}}', CeL.wiki.parse.replace_parameter(token, 2, ' t') && token.toString()], 'wiki.parse.replace_parameter: #9');
		token = CeL.wiki.parse('{{t|{{tl|A{{=}}B}}|ww}}');
		assert(['{{t| s |ww}}', CeL.wiki.parse.replace_parameter(token, 1, ' s ') && token.toString()], 'wiki.parse.replace_parameter: #10');
		token = CeL.wiki.parse('{{t|1=2}}');
		assert(['{{t|3}}', CeL.wiki.parse.replace_parameter(token, 1, 3) && token.toString()], 'wiki.parse.replace_parameter: #11');
		token = CeL.wiki.parse('{{t| 2=2}}');
		assert(['{{t| 2=3}}', CeL.wiki.parse.replace_parameter(token, 2, { '2': 3 }) && token.toString()], 'wiki.parse.replace_parameter: #12');
		token = CeL.wiki.parse('{{t| 12|34}}');
		assert([1, CeL.wiki.parse.replace_parameter(token, 2, { '2': 4 })], 'wiki.parse.replace_parameter: #13-1');
		assert(['{{t| 12|4}}', token.toString()], 'wiki.parse.replace_parameter: #13-2');
		assert(['{{t| 12|5}}', CeL.wiki.parse.replace_parameter(token, 2, ' 2 = 5') && token.toString()], 'wiki.parse.replace_parameter: #14');
		assert([0, CeL.wiki.parse.replace_parameter(token, 2, 5) && token.toString()], 'wiki.parse.replace_parameter: #15');
		token = CeL.wiki.parse('{{t| a= 1| v=4|b=5}}');
		assert([2, CeL.wiki.parse.replace_parameter(token, { a: 'k =1', b: 'r = 1' })], 'wiki.parse.replace_parameter: #16-1');
		assert(['{{t|k =1| v=4|r = 1}}', token.toString()], 'wiki.parse.replace_parameter: #16-2');

		wikitext = '{{Wikipedia:削除依頼/ログ/{{#time:Y年Fj日|-7 days +9 hours}}}}'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parse: {{#parserfunctions:}} #1');
		token = [];
		parsed.each('function', function (t) { token.push(t) });
		assert(['{{#time:Y年Fj日|-7 days +9 hours}}', token.join()], 'wiki.parse: {{#parserfunctions:}} #2');
		assert(['time', token[0].name], 'wiki.parse: {{#parserfunctions:}} #3');
		assert(['Y年Fj日', token[0].parameters[1]], 'wiki.parse: {{#parserfunctions:}} #4');
		assert(['-7 days +9 hours', token[0].parameters[2]], 'wiki.parse: {{#parserfunctions:}} #5');

		wikitext = 't\n**a[[L#{{t:p}}|l]]b\n**a[[L#{{t:p}}]]b\n'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parse: list #1');

		wikitext = '\n--user 2017年9月3日 (日) 02:06 (UTC)~~\n';
		assert(['2017-09-03T02:06:00.000Z', CeL.wiki.parse.date(wikitext, 'zh').toISOString()], 'wiki.parse.date: zh #1');
		assert(['2017年9月3日 (日) 02:06 (UTC)', CeL.wiki.parse.date.to_String(new Date('2017-09-03T02:06:00.000Z'), 'zh')], 'wiki.parse.date: zh #2');
		wikitext = '\n--user 二〇一七年九月三日 （日） 〇二時一八分 (UTC)~~\n';
		assert(['2017-09-03T02:18:00.000Z', CeL.wiki.parse.date(wikitext, 'zh-classical').toISOString()], 'wiki.parse.date: zh-classical #1');
		assert(['二〇一七年九月三日 （日） 〇二時一八分 (UTC)', CeL.wiki.parse.date.to_String(new Date('2017-09-03T02:18:00.000Z'), 'zh-classical')], 'wiki.parse.date: zh-classical #2');
		wikitext = '\n--user 23:56, 9 September 2017 (UTC)~~\n';
		assert(['2017-09-09T23:56:00.000Z', CeL.wiki.parse.date(wikitext, 'en').toISOString()], 'wiki.parse.date: en #1');
		assert(['23:56, 9 September 2017 (UTC)', CeL.wiki.parse.date.to_String(new Date('2017-09-09T23:56:00.000Z'), 'en')], 'wiki.parse.date: en #2');
		wikitext = '\n--user 2017年9月5日 (火) 09:29 (UTC)~~\n';
		assert(['2017-09-05T09:29:00.000Z', CeL.wiki.parse.date(wikitext, 'ja').toISOString()], 'wiki.parse.date: ja #1');
		assert(['2017年9月5日 (火) 09:29 (UTC)', CeL.wiki.parse.date.to_String(new Date('2017-09-05T09:29:00.000Z'), 'ja')], 'wiki.parse.date: ja #2');
		var test_date = new Date; test_date.setSeconds(0, 0); test_date = test_date.toISOString();
		assert([test_date, CeL.wiki.parse.date(CeL.wiki.parse.date.to_String(new Date(test_date), 'zh'), 'zh').toISOString()], 'wiki.parse.date: zh #3: ' + test_date);
		assert([test_date, CeL.wiki.parse.date(CeL.wiki.parse.date.to_String(new Date(test_date), 'zh-classical'), 'zh-classical').toISOString()], 'wiki.parse.date: zh-classical #3: ' + test_date);
		assert([test_date, CeL.wiki.parse.date(CeL.wiki.parse.date.to_String(new Date(test_date), 'en'), 'en').toISOString()], 'wiki.parse.date: en #3: ' + test_date);
		assert([test_date, CeL.wiki.parse.date(CeL.wiki.parse.date.to_String(new Date(test_date), 'ja'), 'ja').toISOString()], 'wiki.parse.date: ja #3: ' + test_date);

		wikitext = '\nabc\n123\n'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([undefined, parsed.each_section().sections[0].section_title], 'wiki.parser.each_section #1-1: 沒有章節標題的文章');
		assert([wikitext, parsed.each_section().sections[0].toString()], 'wiki.parser.each_section #1-2: 沒有章節標題的文章');
		assert([wikitext, parsed.each_section().sections.join('|')], 'wiki.parser.each_section #1-3: 沒有章節標題的文章');
		wikitext = '==t1==\nabc\n123\n==t2==\n==t3=='; parsed = CeL.wiki.parser(wikitext).parse();
		assert(['\nabc\n123\n|\n|', parsed.each_section().sections.join('|')], 'wiki.parser.each_section #2-1: 以章節標題開頭的文章, 以章節標題結尾的文章, 章節標題+章節標題');
		assert(['==t1==', parsed.each_section().sections[0].section_title.toString()], 'wiki.parser.each_section #2-2: 以章節標題開頭的文章, 以章節標題結尾的文章, 章節標題+章節標題');
		wikitext = 'cde\n==t1==\nabc\n123\n==t2==\n456'; parsed = CeL.wiki.parser(wikitext).parse();
		assert(['cde\n|\nabc\n123\n|\n456', parsed.each_section().sections.join('|')], 'wiki.parser.each_section #3-1: 正常文章');
		assert([undefined, parsed.each_section().sections[0].section_title], 'wiki.parser.each_section #3-2: 正常文章');
		assert(['==t1==', parsed.each_section().sections[1].section_title.toString()], 'wiki.parser.each_section #3-3: 正常文章');
		wikitext = 'aaa<ref>a[[b]]c</ref>bbb<ref name="r2">111</ref>ccc<ref name="r2" />'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parser.ref #1');
		assert(['r2', parsed[3].attributes.name], 'wiki.parser.ref #2: .name');

		// [[n:zh:Special:Permalink/121433]]
		wikitext = " <> >< <title> '''<试>'''  ''ii'' <i>iii</i> <b>bbb</b>   [[File:YesCheck_BlueLinear.svg|20px]] [[:Category:中国]] & &amp; &amp;amp; \"quot\" &quot; &amp;quot; 'apos' '&apos;apos '&apos; &amp;apos; <nowiki>  & &amp; &amp;amp; \"quot\" &quot; &amp;quot; 'apos' '&apos;apos '&apos; &amp;apos;  '''bbb''' <b>bbb</b> <i>iii</i> <ref /> {{VOA}} {{tl|VOA}}</nowiki> '''[[abc]]'''  <b>[[w:abc]]</b>  '''<i>[[w :  123   #  cba]]</i>''' [[ABC|ab'c]] [[ABC|ab''c'']] __NOINDEX__ ____  ___ __ __  _ {{tl|VOA}} [[template:VOA]] [https://zh.wikipedia.org zh''wiki''] __TOC__ -{}- C-{樂}-D A-{  这  }-B  '''<nowiki>''< nowiki>''</nowiki>'''  <span style=\"color:green\">green</span> ";
		// console.log(JSON.stringify(link+''))
		assert(["[[#%3c> >%3c %3ctitle> %3c试> ii iii bbb Category:中国 &amp; &amp; &amp;amp; \"quot\" \" &amp;quot; 'apos' ''apos '' &amp;apos; &amp; &amp; &amp;amp; \"quot\" \" &amp;quot; 'apos' ''apos '' &amp;apos; '''bbb''' %3cb>bbb%3c/b> %3ci>iii%3c/i> %3cref /> %7b%7bVOA%7d%7d %7b%7btl%7cVOA%7d%7d abc w:abc w : 123 # cba ab'c abc %7b%7bVOA%7d%7d template:VOA zhwiki -%7b%7d- C-%7b樂%7d-D A-%7b 这 %7d-B ''%3c nowiki>'' green|&lt;> >&lt; &lt;title> '''&lt;试>''' ''ii'' <i>iii</i> <b>bbb</b> Category:中国 &amp; &amp; &amp;amp; &quot;quot&quot; &quot; &amp;quot; &apos;apos&apos; &apos;&apos;apos &apos;&apos; &amp;apos; &amp; &amp; &amp;amp; &quot;quot&quot; &quot; &amp;quot; &apos;apos&apos; &apos;&apos;apos &apos;&apos; &amp;apos; &apos;&apos;&apos;bbb&apos;&apos;&apos; &lt;b>bbb&lt;/b> &lt;i>iii&lt;/i> &lt;ref /> &#123;&#123;VOA}} &#123;&#123;tl&#124;VOA}} '''abc''' <b>w:abc</b> '''<i>w : 123 # cba</i>''' ab&apos;c ab''c'' ____ ___ __ __ _ &#123;&#123;VOA}} template:VOA zh''wiki'' -{}- C-{樂}-D A-{ 这 }-B '''&apos;&apos;&lt; nowiki>&apos;&apos;''' <span style=\"color:green\">green</span>]]", CeL.wiki.section_link(wikitext).toString()], 'wiki.section_link #1-1');
		// [[w:zh:Special:Permalink/46747219]]
		wikitext = " [[:File:title.jpg]] [[:File:title.jpg|abc]] [[:File:title.jpg| 20px |def]]";
		assert(["[[#File:title.jpg abc 20px %7cdef|File:title.jpg abc 20px &#124;def]]", CeL.wiki.section_link(wikitext).toString()], 'wiki.section_link #2-1');

		wikitext = '#1\n#2\nf'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parse: list #1');
		assert(['#1\n#2', parsed[0].toString()], 'wiki.parse: list #1-1');
		assert(['#', parsed[0].list_type], 'wiki.parse: list #1-1');
		assert([2, parsed[0].length], 'wiki.parse: list #1-2');
		wikitext = 'a\n*1\n*2\n*3\nf'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parse: list #2');
		assert(['\n', parsed[1]], 'wiki.parse: list #2-1');
		assert(['*1\n*2\n*3', parsed[2].toString()], 'wiki.parse: list #2-2');
		assert(['*', parsed[2].list_type], 'wiki.parse: list #2-3');
		assert([3, parsed[2].length], 'wiki.parse: list #2-4');
		assert(['2', parsed[2][1]], 'wiki.parse: list #2-5');
		wikitext = 'a\n#1\n#2\n##31\n##32\n#4\nf'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parse: list #3');
		wikitext = 'a{{T|\n*1\n*2\n}}f'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parse: list #4');
		wikitext = 'a{{T|*1\n*2\n}}f'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parse: list #5');
		wikitext = 'a\n;t1:d1\n;t2:d2\n:d2-1\n;#1\n;#2\n;#3\n;t3\n:d3\nf'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parse: list #6');
		wikitext = '#1\n#2\n#3\n #4\n #5\n\n;1\n;2\n;3\n ;4\n ;5\n;6\n\n;#a\n;#a\n;#a\n\n;a\n;b\n;c\n\n:#a\n;#a\n:#a\n;#a\n\n;t:#a\n;#b\n'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parse: list #7');
		wikitext = "a\n:* 1\n:* 2"; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parse: list #8');
		wikitext = "a{{t\n|1=\n'''r'''\n:* 1\n:* 2}}b"; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parse: list #9');

		wikitext = 'a\n p\n  2\n {{t}}\n  [[a]]\nb'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parse: pre #1');

		wikitext = 'a\n----\nb'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parse: hr #1');
		assert(['----', parsed[2].toString()], 'wiki.parse: hr #1-1');
		assert(['hr', parsed[2].type], 'wiki.parse: hr #1-2');
		wikitext = 'a\n----------\nb'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parse: hr #2');
		assert(['----------', parsed[2].toString()], 'wiki.parse: hr #2-1');
		assert(['hr', parsed[2].type], 'wiki.parse: hr #2-2');
		wikitext = 'a\n----------c\nb'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parse: hr #3');

		wikitext = 'a\n{|\n|a||b\n|}\nb'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parse: table #1');
		wikitext = '{|\n!{{t}}|t\n|}'; parsed = CeL.wiki.parser(wikitext).parse();
		assert([wikitext, parsed.toString()], 'wiki.parse: table #2');
	});


	setup_test('CeL.wiki: asynchronous functions');
	CeL.test('CeL.wiki: asynchronous functions', function (assert, _setup_test, _finish_test) {
		var wiki = new CeL.wiki(null, null, 'en');
		_setup_test('wiki: get_creation_Date');
		wiki.page('Wikipedia:Sandbox', function (page_data) {
			// {Date}page_data.creation_Date
			assert(['2002-12-20T21:50:14.000Z', page_data && page_data.creation_Date.toISOString()], 'get_creation_Date: [[Wikipedia:Sandbox]]');
			_finish_test('wiki: get_creation_Date');
		}, {
			get_creation_Date: true
		});


		_setup_test('wiki: get categorymembers');
		wiki.categorymembers('Countries in North America', function (list) {
			assert(list.some(function (page_data) {
				return page_data.title === 'United States';
			}), 'get categorymembers: [[Category:Countries in North America]]');
			_finish_test('wiki: get categorymembers');
		}, {
			limit: 'max',
			namespace: '0'
		});


		_setup_test('wiki: CeL.wiki.convert()');
		CeL.wiki.convert('中国', function (text) {
			var test_name = 'wiki: CeL.wiki.convert() #1';
			assert(['中國', text], test_name);
			_finish_test(test_name);
		});
		CeL.wiki.convert('  </nowiki><!-- 简体 & " \' &lt;<nowiki> ', function (text) {
			var test_name = 'wiki: CeL.wiki.convert() #2';
			assert(['  </nowiki><!-- 簡體 & " \' &lt;<nowiki> ', text], test_name);
			_finish_test(test_name);
		});
		CeL.wiki.convert(' <!-- 轉換 --> &amp; < >-{華}-<nowiki>-{華}-</nowiki>  ', function (text) {
			var test_name = 'wiki: CeL.wiki.convert() #3';
			assert([' <!-- 转换 --> &amp; < >-{华}-<nowiki>-{华}-</nowiki>  ', text], test_name);
			_finish_test(test_name);
		}, 'zh-cn');

		_setup_test('wiki: CeL.wiki.langlinks()');
		CeL.wiki.langlinks('文明', function (title) {
			var test_name = 'wiki: CeL.wiki.langlinks()';
			assert(['Civilization', title], test_name);
			_finish_test(test_name);
		}, 'en');

		_setup_test('wiki: CeL.wiki.data.search()');
		CeL.wiki.data.search('宇宙', function (data) {
			var test_name = 'wiki: CeL.wiki.data.search()';
			assert(['Q1', data && data[0]], test_name);
			_finish_test(test_name);
		}, { get_id: true });

		_setup_test('wiki: CeL.wiki.data.search() limit=1');
		CeL.wiki.data.search('宇宙', function (entity) {
			var test_name = 'wiki: CeL.wiki.data.search() limit=1';
			assert(['Q1', entity], test_name);
			_finish_test(test_name);
		}, { get_id: true, limit: 1 });

		_setup_test('wiki: CeL.wiki.data.search() property');
		CeL.wiki.data.search('形狀', function (id) {
			var test_name = 'wiki: CeL.wiki.data.search() property';
			assert(['P1419', id], test_name);
			_finish_test(test_name);
		}, { get_id: true, type: 'property' });

		_setup_test('wiki: CeL.wiki.data.search().use_cache');
		CeL.wiki.data.search.use_cache('視訊', function (id) {
			var test_name = 'wiki: CeL.wiki.data.search().use_cache';
			assert(['P10', id], test_name);
			_finish_test(test_name);
		});

		_setup_test('wiki: CeL.wiki.data(basic), wikidata_entity()');
		CeL.wiki.data('宇宙', '形狀', function (data, error) {
			var test_name = 'wiki: CeL.wiki.data(basic)';
			// console.log(data);
			assert(Array.isArray(data) ? data.includes('宇宙的形狀') : [data, '宇宙的形狀'], test_name);
			_finish_test(test_name);
		});

		_setup_test('wiki: CeL.wiki.data(get property of item)');
		var test_property_name = '性質';
		CeL.wiki.data.search.use_cache(test_property_name, function (id_list) {
			// Get the id of property '性質' first.
			// and here we get the id of '性質': "P31"
			var test_name = 'wiki: CeL.wiki.data(get property of item)';
			assert(['P31', id_list], 'get data id of 性質');

			// 執行剩下的程序. run rest codes.
			var wiki = CeL.wiki.login(null, null, 'zh');
			wiki.data('孔子', function (data_JSON) {
				CeL.wiki.data.search.use_cache(test_property_name, function (id_list) {
					data_JSON.value(test_property_name, {
						// resolve wikibase-item
						resolve_item: true
					}, function (entity) {
						assert(/human|person/i.test(entity.value('label', 'en')), 'get "' + test_property_name + '" id of 孔子');
						_finish_test(test_name);
					});
				}, {
					must_callback: true,
					type: 'property'
				});
			});

		}, {
			must_callback: true,
			type: 'property'
		});

	}, function (recorder, error_count, test_name) {
		// console.log('CeL.wiki: asynchronous functions: ' + _error_count + ' errors');
		all_error_count += error_count;
		finish_test('CeL.wiki: asynchronous functions');
	});

	return;

	// examples

	// for debug: 'interact.DOM', 'application.debug',
	//CeL.run([ 'interact.DOM', 'application.debug', 'application.net.wiki' ]);

	var wiki = CeL.wiki.login('', '', 'zh')
		// Select page and get the content of page.
		.page('Wikipedia:沙盒', function (page_data) {
			CeL.info(CeL.wiki.title_of(page_data));
			/** {String}page content, maybe undefined. */
			var content = CeL.wiki.content_of(page_data);
			CeL.log(content === undefined ? 'page deleted!' : content);
		})
		// get the content of page, and then replace it.
		.page('Wikipedia:沙盒').edit('* [[沙盒]]', {
			section: 'new',
			sectiontitle: '沙盒測試 section',
			summary: '沙盒 test edit (section)',
			nocreate: 1
		})
		// get the content of page, and then modify it.
		.page('Wikipedia:沙盒').edit(function (page_data) {
			return CeL.wiki.content_of(page_data) + '\n\n* [[WP:Sandbox|沙盒]]';
		}, {
			summary: '沙盒 test edit',
			nocreate: 1,
			bot: 1
		})
		// 執行過 .page() 後，與上一種方法相同。
		.page(function (page_data) {
			CeL.info(CeL.wiki.title_of(page_data));
			CeL.log(CeL.wiki.content_of(page_data));
		})
		// get the content of page, replace it, and set summary.
		.edit('text to replace', {
			summary: 'summary'
		})
		// get the content of page, modify it, and set summary.
		.edit(function (page_data) {
			/** {String}page title */
			var title = CeL.wiki.title_of(page_data),
				/** {String}page content, maybe undefined. */
				content = CeL.wiki.content_of(page_data);
			return 'text to replace';
		}, {
			summary: 'summary'
		});

	CeL.wiki.page('Wikipedia:沙盒', function (page_data) {
		CeL.info(CeL.wiki.title_of(page_data));
		CeL.log(CeL.wiki.content_of(page_data));
	});

	wiki.page('Wikipedia_talk:Flow_tests')
		.edit(function (page_data) {
			return '* [[WP:Sandbox|沙盒]]';
		}, {
			section: 'new',
			sectiontitle: '沙盒測試 section',
			summary: '沙盒 test edit (section)',
			nocreate: 1
		});

	// --------------------------------

	wiki.logout();

	// --------------------------------

	// 取得完整 embeddedin list 後才作業。
	CeL.wiki.list('Template:a‎‎', function (pages) {
		// console.log(pages);
		console.log(pages.length + ' pages got.');
	}, {
		type: 'embeddedin'
	});

	var wiki = CeL.wiki.login('', '', 'zh.wikisource');
	wiki.page('史記').edit(function (page_data) {
		/** {String}page title */
		var title = CeL.wiki.title_of(page_data),
			/** {String}page content, maybe undefined. */
			content = CeL.wiki.content_of(page_data);
		CeL.info(title);
		CeL.log(content);
	});
	//
	wiki.work({
		each: function (page_data) {
			/** {String}page content, maybe undefined. */
			var content = CeL.wiki.content_of(page_data);
		},
		summary: '',
		log_to: ''
	}, ['史記']);


	// test for parser, parse_wikitext()
	var wiki_page = CeL.wiki.parser(page_data);
	wiki_page.parse().each('plain', function (token) { if (token = token.trim()) CeL.log(token); });
	wiki_page.each('transclusion', function (token, parent, index) { ; });
	//CeL.log('-'.repeat(70) + '\n' + wiki_page.toString());

	CeL.wiki.parse('{{temp|{{temp2|p{a}r{}}}}}');
	JSON.stringify(CeL.wiki.parse('a{{temp|e{{temp2|p{a}r}}}}b'));
	CeL.wiki.parser('a{{temp|e{{temp2|p{a}r}}}}b').parse().each('plain', function (token) { CeL.log(token); });
	CeL.wiki.parser('a{{temp|e{{temp2|p{a}r}}}}b').parse().each('template', function (template) { CeL.log(template.toString()); }) && '';
	CeL.wiki.parser('a{{temp|e{{temp2|p{a}r}}}}b<!--ff[[r]]-->[[t|e]]\n{|\n|r1-1||r1-2\n|-\n|r2-1\n|r2-2\n|}[http://r.r ee]').parse();
	CeL.wiki.parser('{|\n|r1-1||r1-2\n|-\n|r2-1\n|r2-2\n|}').parse().each('table', function (table) { CeL.log(table); }) && '';
	var p = CeL.wiki.parser('==[[L]]==\n==[[L|l]]==\n== [[L]] ==').parse(); CeL.log(JSON.stringify(p) + '\n' + p.toString()); p;
	CeL.wiki.parser('a{{ #expr: {{CURRENTHOUR}}+8}}}}b').parse()[1];
	CeL.wiki.parser('{{Tl|a<ref>[http://a.a.a b|c {{!}} {{CURRENTHOUR}}]</ref>}}').parse().toString();

	// More examples: see /_test suite/test.js

	// Flow support
	CeL.wiki.Flow('Wikipedia_talk:Flow_tests', function (page_data) {
		CeL.log(page_data.is_Flow === true);
	});
	CeL.wiki.Flow('ABC', function (page_data) {
		CeL.log(page_data.is_Flow === false);
	});
	CeL.wiki.Flow('not_exist', function (page_data) {
		CeL.log(page_data.is_Flow === undefined);
	});

	CeL.wiki.Flow.page('Wikipedia_talk:Flow_tests', function (page_data) {
		/** {String}page title */
		var title = CeL.wiki.title_of(page_data),
			/** {String}page content, maybe undefined. */
			content = CeL.wiki.content_of(page_data);
		CeL.info(title);
		CeL.log(content);
	}, {
		flow_view: 'header'
	});

	CeL.wiki.page('Wikipedia_talk:Flow_tests', function (page_data) {
		/** {String}page title */
		var title = CeL.wiki.title_of(page_data),
			/** {String}page content, maybe undefined. */
			content = CeL.wiki.content_of(page_data);
		CeL.info(title);
		CeL.log(content);
	}, {
		flow_view: 'header'
	});

	// edit flow page
	var wiki = CeL.wiki.login('', '');
	wiki.page('Wikipedia talk:Flow tests').edit('test edit', {
		notification: 'afd',
		section: 'new',
		sectiontitle: 'test {{bot}}'
	});

}


//============================================================================================================================================================


function test_calendar() {
	//CeL.Tabular_Date.test(-2e4, 4e6, 4);
}


//============================================================================================================================================================

function test_era() {
	if (!CeL.era) {
		// 未載入必要的元件。
		return;
	}

	setup_test('era');
	CeL.set_debug(0);
	// 判斷是否已載入曆數資料。
	if (!CeL.era.loaded) {
		setTimeout(test_era, 80);
		return;
	}

	CeL.set_debug(0);

	// 設計上所要求必須通過之測試範例：測試正確性。
	all_error_count += CeL.test('紀年/曆數', [
		[['孺子嬰', CeL.era('初始').君主], '初始.君主: 孺子嬰#1'],
		[['孺子嬰', '初始元年11月1日'.to_Date('era').君主], '初始.君主: 孺子嬰#2'],
		[['庚辰年庚辰月庚辰日庚辰時', '一八八〇年四月二十一日七時'.to_Date({ parser: 'era', range: '中國' }).format({ parser: 'CE', format: '%歲次年%月干支月%日干支日%時干支時', locale: 'cmn-Hant-TW' })], '可提供統一時間標準與各干支間的轉換。統一時間標準→各特殊紀年（西→中）：查詢某時間點（時刻）的日期資訊，如月干支等。'],
		[['清德宗光緒六年三月十三日', CeL.to_Chinese_numeral('一八八〇年四月二十一日七時'.to_Date({ parser: 'era', range: '中國' }).format({ parser: 'CE', format: '%朝代%君主%紀年%年年%月月%日日', locale: 'cmn-Hant-TW' }))], '查詢一八八〇年四月二十一日七時的中曆日期'],
		[['1628年3月1日', '明思宗崇禎1年1月26日'.to_Date('era').format({ parser: 'CE', format: '%Y年%m月%d日' })], '可提供統一時間標準與各特殊紀年間的轉換。'],
		[['1628年3月1日', '天聰二年甲寅月戊子日'.to_Date('era').format({ parser: 'CE', format: '%Y年%m月%d日' })], '可提供統一時間標準與各特殊紀年間的轉換。'],
		[['1628年3月1日', '天聰2年寅月戊子日'.to_Date('era').format({ parser: 'CE', format: '%Y年%m月%d日' })], '可提供統一時間標準與各特殊紀年間的轉換。'],
		[['1880年4月21日', '清德宗光緒六年三月十三日'.to_Date('era').format({ parser: 'CE', format: '%Y年%m月%d日' })], '可提供統一時間標準與各特殊紀年間的轉換。'],
		[['1880年4月21日', '清德宗光緒庚辰年三月十三日'.to_Date('era').format({ parser: 'CE', format: '%Y年%m月%d日' })], '可提供統一時間標準與各特殊紀年間的轉換。'],
		[['1880年4月21日', '清德宗光緒庚辰年庚辰月庚辰日'.to_Date('era').format({ parser: 'CE', format: '%Y年%m月%d日' })], '可提供統一時間標準與各特殊紀年間的轉換。'],
		[['庚辰年庚辰月庚辰日 3', '清德宗光緒六年三月十三日'.to_Date('era').format({ parser: 'CE', format: '%歲次年%月干支月%日干支日 %w', locale: 'cmn-Hant-TW' })], '統一時間標準→各特殊紀年（西→中）：查詢某時間點（時刻）的日期資訊，如月干支等。'],
		[['庚辰年庚辰月庚辰日庚辰時 三', '一八八〇年庚辰月庚辰日7時'.to_Date({ parser: 'era', range: '中國' }).format({ parser: 'CE', format: '%歲次年%月干支月%日干支日%時干支時 %a', locale: 'cmn-Hant-TW' })], '各特殊紀年→統一時間標準（中→西）：查詢某農曆+紀年/君主(帝王)對應的標準時間(如UTC+8)。'],
		[['庚辰年庚辰月庚辰日庚辰時 星期三', '一八八〇年庚辰月庚辰日庚辰時'.to_Date({ parser: 'era', range: '中國' }).format({ parser: 'CE', format: '%歲次年%月干支月%日干支日%時干支時 %A', locale: 'cmn-Hant-TW' })], '各特殊紀年→統一時間標準（中→西）：查詢某農曆+紀年/君主(帝王)對應的時辰。'],
		[['清德宗光緒六年三月十三日', CeL.to_Chinese_numeral('一八八〇年庚辰月庚辰日庚辰時'.to_Date({ parser: 'era', range: '中國' }).format({ parser: 'CE', format: '%朝代%君主%紀年%年年%月月%日日', locale: 'cmn-Hant-TW' }))]],
		[['庚辰年庚辰月庚辰日庚辰時', '西元一八八〇年四月二十一日七時'.to_Date({ parser: 'era', range: '中國' }).format({ parser: 'CE', format: '%歲次年%月干支月%日干支日%時干支時', locale: 'cmn-Hant-TW' })], '統一時間標準→各特殊紀年（西→中）：查詢某時間點（時刻）的日期資訊，如月干支等。'],
		[['庚辰年庚辰月庚辰日庚辰時', '清德宗光緒六年三月十三日辰正一刻'.to_Date('era').format({ parser: 'CE', format: '%歲次年%月干支月%日干支日%時干支時', locale: 'cmn-Hant-TW' })], '統一時間標準→各特殊紀年（西→中）：查詢某時間點（時刻）的日期資訊，如月干支等。'],
		[['252年5月26日', '魏少帝嘉平4年5月1日'.to_Date('era').format({ parser: 'CE', format: '%Y年%m月%d日' })]],
		[['252年6月24日', '魏少帝嘉平4年閏5月1日'.to_Date('era').format({ parser: 'CE', format: '%Y年%m月%d日' })]],
		[['252年6月24日', '魏少帝嘉平4年閏月1日'.to_Date('era').format({ parser: 'CE', format: '%Y年%m月%d日' })]],
		[['1357/1/21', '元至正十七年'.to_Date('era').format({ parser: 'CE', format: '%Y/%m/%d' })], 'parse 年分 only: 元至正十七年'],
		[['1357/1/21', '元至正十七'.to_Date('era').format({ parser: 'CE', format: '%Y/%m/%d' })], 'parse 年分 only: 元至正十七'],
		[['1357/1/21', '至正十七年'.to_Date('era').format({ parser: 'CE', format: '%Y/%m/%d' })], 'parse 年分 only: 至正十七年'],
		[['1357/1/21', '至正十七'.to_Date('era').format({ parser: 'CE', format: '%Y/%m/%d' })], 'parse 年分 only: 至正十七'],
		[['1357/1/21', '元至正17年'.to_Date('era').format({ parser: 'CE', format: '%Y/%m/%d' })], 'parse 年分 only: 元至正17年'],
		[['1357/1/21', '元至正17'.to_Date('era').format({ parser: 'CE', format: '%Y/%m/%d' })], 'parse 年分 only: 元至正17'],
		[['1357/1/21', '至正17年'.to_Date('era').format({ parser: 'CE', format: '%Y/%m/%d' })], 'parse 年分 only: 至正17年'],
		[['1357/1/21', '至正17'.to_Date('era').format({ parser: 'CE', format: '%Y/%m/%d' })], 'parse 年分 only: 至正17'],
		[['1880年4月21日', '庚辰年庚辰月庚辰日庚辰時'.to_Date({ parser: 'era', base: '1850年' }).format({ parser: 'CE', format: '%Y年%m月%d日' })]],
		[['1880年4月21日', CeL.era('庚辰年庚辰月庚辰日庚辰時', { base: '1850年' }).format({ parser: 'CE', format: '%Y年%m月%d日' })]],
		[['260年6月26日', '魏元帝景元元年6月1日'.to_Date('era').format({ parser: 'CE', format: '%Y年%m月%d日' })]],
		[['260年6月26日', '元帝景元元年6月1日'.to_Date('era').format({ parser: 'CE', format: '%Y年%m月%d日' })]],
		[['260年6月26日', '景元元年6月1日'.to_Date('era').format({ parser: 'CE', format: '%Y年%m月%d日' })]],
		[['260年6月26日', '魏元帝景元元年'.to_Date('era').format({ parser: 'CE', format: '%Y年%m月%d日' })], '省略月日，當作年初。'],
		[['260年6月26日', '元帝景元元年'.to_Date('era').format({ parser: 'CE', format: '%Y年%m月%d日' })], '省略月日，當作年初。'],
		[['260年6月26日', '景元元年'.to_Date('era').format({ parser: 'CE', format: '%Y年%m月%d日' })], '省略月日，當作年初。'],
		[['260年7月25日', '魏元帝景元元年7月'.to_Date('era').format({ parser: 'CE', format: '%Y年%m月%d日' })], '省略日，當作月初。'],
		[['260年7月25日', '元帝景元元年7月'.to_Date('era').format({ parser: 'CE', format: '%Y年%m月%d日' })], '省略日，當作月初。'],
		[['260年7月25日', '景元元年7月'.to_Date('era').format({ parser: 'CE', format: '%Y年%m月%d日' })], '省略日，當作月初。'],
		[['304/12/23', '西晉惠帝永安1年11月10日'.to_Date('era').format({ parser: 'CE', format: '%Y/%m/%d' })]],
		[['304/12/23', '前涼太祖永安1年11月10日'.to_Date('era').format({ parser: 'CE', format: '%Y/%m/%d' })]],
		[['1911年11月30日', '清遜帝宣統三年10月10日'.to_Date('era').format({ parser: 'CE', format: '%Y年%m月%d日' })], '閏月或之後'],
		[['1329年9月1日', '元文宗天曆2年8月8日'.to_Date('era').format({ parser: 'CE', format: '%Y年%m月%d日' })], '天曆在元明宗(1329年)時被重複使用，共計3年。'],
		[['762年1月1日', '唐肅宗元年建丑月初二'.to_Date('era').format({ parser: 'CE', format: '%Y年%m月%d日' })], '唐肅宗上元二年九月二十一日去年號，稱元年，以建子之月為歲首。'],
		[['694年11月25日 戊子小', '證聖元年正月初三'.to_Date('era').format({ parser: 'CE', format: '%Y年%m月%d日 %月干支%大小月', locale: 'cmn-Hant-TW' })], '證聖元年正月初一辛巳（694年11月23日），改元證聖。'],
		[['1855年2月5日 ' + (CeL.gettext ? '星期二' : 2), '太平天囯乙榮五年正月初一甲寅'.to_Date('era').format({ parser: 'CE', format: '%Y年%m月%d日 %A', locale: 'cmn-Hant-TW' })], '天历与夏历阳历对照及简表'],
		[['西漢武帝元朔6年12月1日', '武帝元朔六年十二月甲寅'.to_Date('era').format({ parser: 'CE', format: '%紀年名%年年%月月%日日', locale: 'cmn-Hant-TW' })], '秦至汉初( 前246 至前104) 历法研究'],
		[["癸丑年八月初一", '2033年8月25日'.to_Date().format('Chinese')], '2033年閏年八月初一'],
		[["癸丑年閏十一月初一", '2033年12月22日'.to_Date().format('Chinese')], '2033年閏十一月初一'],
		[["甲寅年正月初一", '2034年2月19日'.to_Date().format('Chinese')], '2034年正月初一'],
		[["癸丑年閏11月1日", '2033年12月22日'.to_Date().format({ parser: 'Chinese', numeral: null, format: '%歲次年%月月%日日' })], '2033年閏十一月初一'],
		[["癸丑年閏11月1日", '2033年12月22日'.to_Date().format({ parser: 'era', era: '中曆', format: '%歲次年%月月%日日', locale: 'cmn-Hant-TW' })], '2033年閏十一月初一'],
		[CeL.era('公元1895年4月17日').共存紀年.join().includes('光緒21年3月23日'), '馬關條約公元 日期.共存紀年 包含光緒日期'],
		[[undefined, CeL.era('2200/1/1').共存紀年]],
		[[undefined, CeL.era('-4000/1/1').共存紀年]],
		[[0, CeL.era('明年', { base: '嘉靖元年' }) - CeL.era('二年', { base: '嘉靖元年' })], '明年'],
		[[0, CeL.era('去年', { base: '嘉靖二年' }) - CeL.era('元年', { base: '嘉靖二年' })], '去年'],
		[[0, CeL.era('五千六百七十八') - CeL.era('公元5678年1月1日')], '公元5678年'],
		[[0, CeL.era('前五千六百七十八') - CeL.era('公元前5678年1月1日')], '公元前5678年'],
		[[0, CeL.era('五千六百七十八') - CeL.era('五千六百七十八年')], '五千六百七十八年'],
		[[0, CeL.era('前五千六百七十八') - CeL.era('前五千六百七十八年')], '前五千六百七十八年'],
		[[undefined, CeL.era('三月庚子')], 'NG: 三月庚子'],
		[[undefined, CeL.era('三月庚子日')], 'NG: 三月庚子日'],
		[[CeL.era('庚子三月'), CeL.era('西涼太祖庚子三月')], 'NG: 庚子三月'],
		[['401年3月25日', CeL.era('西涼太祖庚子二年二月庚子').format({ parser: 'CE', format: '%Y年%m月%d日' })], '西涼太祖庚子二年二月庚子'],
		[[0, CeL.era('庚子二年二月庚子') - CeL.era('西涼太祖庚子二年二月庚子')], '庚子二年二月庚子'],
		[CeL.era('正月乙巳', { base: '建隆元年', parse_only: true }).slice(1).join().includes('建隆,元,正,乙巳'), '標注文本 "建隆元年  正月乙巳大赦" bug'],
		[[',,乙巳,正,', CeL.era('乙巳正月', { parse_only: true }).join()], '農曆年月'],
		[[',,乙巳,正,二', CeL.era('乙巳正月二日', { parse_only: true }).join()], '農曆年月日'],
		[[CeL.era('南梁敬帝太平1年12月').月干支, CeL.era('北齊文宣帝天保7年12月').月干支]],
		[[CeL.era('西晉武帝泰始1年12月').月干支, CeL.era('吳末帝甘露1年12月').月干支], '西晉武帝泰始月建有誤'],
		[["南齊明帝建武", CeL.era('建武二年', { parse_only: true, base: CeL.era('劉宋孝武帝大明八年', { date_only: true }) })[1].toString()], '標注文本 大明八年...建武二年'],

		[['412/3/29', CeL.era.中曆(412, 3).format({ parser: 'CE', format: '%Y/%m/%d' })], '取得公元 412 年, 中曆 3/1 之 CE Date。'],
		[['2016/3/11', CeL.era.中曆(2016, 2, 3).format({ parser: 'CE', format: '%Y/%m/%d' })], '取得公元 2016 年, 中曆 2/3 之 CE Date。'],
		[['525/12/30', CeL.era.中曆(525, 12).format({ parser: 'CE', format: '%Y/%m/%d' })], '取得公元 525 年, 中曆 12月 之 CE Date。'],
		[['415/3/26', CeL.era.中曆('415年三月').format({ parser: 'CE', format: '%Y/%m/%d' })], '取得公元 415年, 中曆 三月 之 CE Date。'],
		[['401/9/29', CeL.era.中曆('401年閏八月初六').format({ parser: 'CE', format: '%Y/%m/%d' })], '取得公元 401年, 中曆 閏八月初六 之 CE Date。'],
	]);

	var tmp = '後黎神宗永祚10年1月26日|朝鮮仁祖6年1月26日|江戸朝廷後水尾天皇寛永5年1月26日|莫光祖永祚4年|';
	all_error_count += CeL.test('.共存紀年 test: 可能需要因添加紀年而改變。', [
		[CeL.era('238/6/2').共存紀年.join('|').covers('吳大帝嘉禾7年5月3日|魏明帝景初2年6月3日|蜀後主延熙1年5月2日'), '統一時間標準→各特殊紀年（西→中）：查詢某時間點（時刻）存在的所有紀年與資訊。#1'],
		[CeL.era('延熙1年5月2日').共存紀年.join('|').covers('弥生時代神功皇后38年|高句麗東川王12年6月3日|新羅助賁尼師今9年6月3日|吳大帝嘉禾7年5月3日|百濟古尒王5年6月3日|魏明帝景初2年6月3日|魏燕王紹漢2年6月3日'), '各特殊紀年→統一時間標準（中→西）：查詢某朝代/君主(帝王)所有的共存紀年與資訊。#1'],
		[CeL.era('240-1-19').共存紀年.join().covers('魏明帝景初3年後12月8日,蜀後主延熙2年12月8日,吳大帝赤烏2年12月8日'), '測試特殊月名#1'],
		[CeL.era('魏明帝景初3年後12月8日').共存紀年.join('|').covers('弥生時代神功皇后39年12月9日|高句麗東川王13年後12月8日|新羅助賁尼師今10年後12月8日|百濟古尒王6年後12月8日|Roman Empire Gordianus 3年Tybi月23日|蜀後主延熙2年12月8日|吳大帝赤烏2年12月8日'), '測試特殊月名#2'],
		[CeL.era('1329年9月1日').共存紀年.join('|').covers('高麗忠肅王16年8月8日|鎌倉朝廷後醍醐天皇嘉暦4年8月8日|陳憲宗開祐1年8月8日|元文宗天曆2年8月8日'), '統一時間標準→各特殊紀年（西→中）：查詢某時間點（時刻）存在的所有紀年與資訊。#2'],

		[CeL.era('1628年3月1日').共存紀年.join('|').covers(tmp + '後金太宗天聰2年1月26日|明思宗崇禎1年1月26日'), '統一時間標準→各特殊紀年（西→中）：查詢某時間點（時刻）存在的所有紀年與資訊。#3'],
		[CeL.era('中國清太宗天聰2年1月26日').共存紀年.join('|').covers(tmp + '明思宗崇禎1年1月26日'), '各特殊紀年→統一時間標準（中→西）：查詢某朝代/君主(帝王)所有的共存紀年與資訊。#2'],
		[CeL.era('中國明思宗崇禎1年1月26日').共存紀年.join('|').covers(tmp + '後金太宗天聰2年1月26日'), '各特殊紀年→統一時間標準（中→西）：查詢某朝代/君主(帝王)所有的共存紀年與資訊。#3'],

		[["唐代宗寶應2年1月13日", CeL.era('二年春正月丁亥', { base: '寶應元年' }).format({ parser: 'CE', format: '%朝代%君主%紀年%年年%月月%日日', locale: 'cmn-Hant-TW' })], '寶應二年春正月丁亥'],
		[["唐代宗寶應2年1月13日", CeL.era('丁亥', { base: '寶應二年春正月' }).format({ parser: 'CE', format: '%朝代%君主%紀年%年年%月月%日日', locale: 'cmn-Hant-TW' })], '寶應二年春正月丁亥 (by base)'],
		[["763/5/17", CeL.era('寶應二年三月晦日').format({ parser: 'CE', format: '%Y/%m/%d' })], '寶應二年三月晦日'],
		[["唐代宗寶應|二|三|一", CeL.era('三月一日', { parse_only: true, base: '寶應二年春正月' }).slice(1).join('|')], 'parse_only + base: 寶應二年春正月'],
		[["唐代宗寶應|二|三|一", CeL.era('三月一日', { parse_only: true, base: '寶應二年' }).slice(1).join('|')], 'parse_only + base: 寶應二年'],
		[["唐代宗寶應|二|三|晦", CeL.era('晦日', { parse_only: true, base: '代宗寶應二年三月一日' }).slice(1).join('|')], 'parse_only + base: 代宗寶應二年三月一日'],
		[["134/7/29", CeL.era('陽嘉3年6月20日', { get_range: true })[1].format({ parser: 'CE', format: '%Y/%m/%d' })], '陽嘉3年6月20日.末'],
		[["134/8/8", CeL.era('陽嘉3年6月', { get_range: true })[1].format({ parser: 'CE', format: '%Y/%m/%d' })], '陽嘉3年6月.末'],
		[["135/2/1", CeL.era('陽嘉3年', { get_range: true })[1].format({ parser: 'CE', format: '%Y/%m/%d' })], '陽嘉3年.末'],
		[["136/2/20", CeL.era('陽嘉', { get_range: true })[1].format({ parser: 'CE', format: '%Y/%m/%d' })], '陽嘉.末'],
	]);


	all_error_count += CeL.test('參照紀年之演算機制', function (assert) {
		assert([8, CeL.era('明宣宗宣德', { get_era: 1 }).calendar[7].leap], '明宣宗宣德8年閏8月');
		//setup 8月–, CE~CE
		CeL.era.set('曆A|1433/8/15~9/13|:宣德');
		//setup 閏8月–
		CeL.era.set('曆B|1433/9/14~10/12|:宣德');
		//setup 9月–
		CeL.era.set('曆C|1433/10/13~11/11|:宣德');
		//test part
		var _c0 = CeL.era('宣德', { get_era: 1 }).calendar[8 - 1];
		assert(['30,29,30,29,29,30,29,30,29,30,30,30,29', _c0.join(',')], '宣德8年 calendar data');
		// 取得 era 第一年之 calendar data, and do test.
		_c0 = CeL.era('曆A', { get_era: 1 }).calendar[0]; assert(['8,6,1', [_c0.start, _c0.length, +_c0.leap].join()], '測試 參照紀年之演算機制:8月–');
		_c0 = CeL.era('曆B', { get_era: 1 }).calendar[0]; assert(['9,5,0', [_c0.start, _c0.length, +_c0.leap].join()], '測試 參照紀年之演算機制:閏8月–');
		_c0 = CeL.era('曆C', { get_era: 1 }).calendar[0]; assert(['9,4,NaN', [_c0.start, _c0.length, +_c0.leap].join()], '測試 參照紀年之演算機制:9月–');
	});

	all_error_count += CeL.test('period_end of era()', [
		[[CeL.era('1627年', { date_only: true, period_end: true }).format('CE'), '1627年'.to_Date({ parser: 'CE', period_end: true }).format('CE')], 'period_end of era() 年'],
		[[CeL.era('1627年9月', { date_only: true, period_end: true }).format('CE'), '1627年9月'.to_Date({ parser: 'CE', period_end: true }).format('CE')], 'period_end of era() 月'],
		[[CeL.era('1627年9月3日', { date_only: true, period_end: true }).format('CE'), '1627年9月3日'.to_Date({ parser: 'CE', period_end: true }).format('CE')], 'period_end of era() 日'],
		[['0001年'.to_Date().format(), '0001/1/1'.to_Date().format()], '1/1/1'],
		[['前1年'.to_Date().format(), '-1年'.to_Date().format()], 'year -1'],
		[['前1年'.to_Date({ parser: 'CE', period_end: true }).format('CE'), '0001年'.to_Date('CE').format('CE')], 'period_end of CE'],
		[[CeL.era('前1年', { period_end: true }).format('CE'), '0001年'.to_Date('CE').format('CE')], 'period_end of CE@era()'],
	]);

	finish_test('era');
}



//============================================================================================================================================================


node_info.color = {
	test: 'fg=yellow',
	passed: 'fg=green;bg=white',
	error: 'fg=red;bg=white'
};

function node_info(messages) {
	if (CeL.SGR.CSI !== CeL.SGR.default_CSI) {
		CeL.info(messages);
		return;
	}

	var matched;
	if (typeof messages === 'string'
		&& (matched = messages.match(/^([a-z\d\-]+)([:\s].+)$/i))
		&& matched[1].toLowerCase() !== 'all') {
		messages = [
			'',
			node_info.color[matched[1].toLowerCase()]
			|| 'fg=black;bg=white', matched[1], '-fg;-bg',
			matched[2]];
	}
	CeL.info(new CeL.SGR(messages).toString());
}


// return has error
function setup_test(type) {
	if (type && !still_running[type]) {
		still_running[type] = true;
		++still_running.left_count;
		return false;
	}
	return true;
}

function finish_test(type) {
	if (type && still_running[type]) {
		delete still_running[type];
		--still_running.left_count;
	}
	if (!still_running.all_configured || still_running.left_count !== 0) {
		return;
	}

	// 耗時，經過時間 Takes ? ms
	var elapsed_message = ' Elapsed time: '
		+ Math.round((Date.now() - test_start_time) / 1000) + ' s.';

	if (all_error_count === 0) {
		// console.trace(still_running);
		node_info(['CeJS: ', 'fg=green;bg=white', 'All tests passed. 測試全部通過。',
			'-fg;-bg', elapsed_message]);
		// normal done. No error.
		return;
	}

	// add gettext format [error]
	CeL.gettext.conversion['error'] = ['no %n', '1 %n', '%d %ns'];
	node_info(['CeJS: ', 'fg=red;bg=white', CeL.gettext('All %error@1 occurred.', all_error_count),
		'-fg;-bg']);
	if (all_error_count > 0) {
		var error_message = CeL.gettext('All %error@1.', all_error_count) + elapsed_message;
		throw new Error(error_message);
	}
}

function do_test() {
	// CeL.assert([ typeof CeL.assert, 'function' ], 'CeL.assert is working.');
	CeL.env.ignore_COM_error = true;
	CeL.set_debug(test_debug_level);
	// 即時顯示，不延遲顯示
	CeL.Log.interval = 0;
	CeL.run(
		/*
		*/
		// 測試期間時需要用到的功能先作測試。這些不可 comment out。
		'interact.console', test_console,
		//
		'application.locale', test_locale,
		// 基本的功能先作測試。
		/*
		*/
		test_base,
		test_compatibility,
		//
		'data.native', test_native,
		//
		'data.date', test_date,
		//
		'data.character', test_character,
		//
		'application.locale.encoding', test_encoding,
		//
		'data.code', test_code,
		//
		'data.check', test_check,
		//
		function () { CeL.set_debug(0); },
		['data.math.rational', 'data.math.quadratic'], test_math,
		//
		'data.math.Hamming', test_Hamming,
		//
		'data.quantity', test_quantity,
		//
		'data.CSV', test_CSV,
		//
		'data.XML', test_XML,
		//
		'data.numeral', test_numeral,
		//
		'application.net', test_net,
		//
		'application.astronomy', test_astronomy,
		//
		'data.date.calendar', test_calendar,
		//
		'data.date.era', test_era,
		//
		[
			'application.net.wiki.parser',
			'application.net.wiki.edit',
			'application.net.wiki.list',
			'application.net.wiki.data',
			'application.net.wiki.admin'
		], test_wiki,
		//
		function () {
			still_running.all_configured = true;
			CeL.info('所有測試設定完畢。 Waiting for asynchronous tests...');
		});
}

CeL.env.no_catch = true;
// CeL.set_debug(3);
CeL.run(['application.debug', 'application.debug.log'], do_test);
