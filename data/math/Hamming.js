/**
 * @name CeL Hamming function
 * @fileoverview 本檔案包含了 Hamming Code, 漢明碼的 functions。
 * @since 2010/3/21 14:26:08
 * @example <code>
	CeL.run('data.math.Hamming');
	var hc = CeL.Hamming.encode('1100');

 
	TODO:
	最佳化
	calculate generator matrix
	SEC-DED ("single error correction, double error detection") 版本（加在最後）
	http://www.ee.unb.ca/cgi-bin/tervo/hamming.pl
	最小漢明距離3
	http://phpbb.godfat.org/viewtopic.php?t=66&sid=6e34dd040aa98c64c75bfe099008c82a
	BCH碼

 </code>
 */

// More examples: see /_test suite/test.js
'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'data.math.Hamming',

	// require : '',

	// 設定不匯出的子函式。
	no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// nothing required

	var module_name = this.id;

	// ============================================================================
	// definition of module Hamming

	var
	/**
	 * Hamming code
	 * 
	 * @class Hamming Code 的 constructor
	 * @constructor
	 */
	_// JSDT:_module_
	= function() {
		return this.encode.apply(this, arguments);
	};

	// class public interface ---------------------------

	_// JSDT:_module_
	.
	/**
	 * 是否左右顛倒。 default: data[1,2,..] 左至右, reverse: data[..,2,1] 右至左
	 * 
	 * @_memberOf _module_
	 */
	reverse = false;

	_// JSDT:_module_
	.
	/**
	 * encode data to Hamming Code.
	 * 
	 * @param data
	 *            data stream
	 * @param no_reverse
	 *            forced NO reverse
	 * @return {String} encoded Hamming Code
	 * @_memberOf _module_
	 */
	encode = function(data, no_reverse) {
		data = (Array.isArray(data) ? data.join('') : '' + data).replace(
				/[ ,]/g, '');
		if (!/^[01]{1,20}$/.test(data))
			return '';
		if (this.reverse && !no_reverse)
			data = data.split('').reverse().join('');
		if (false)
			library_namespace.debug('encode [' + d + ']', 1, module_name
					+ '.encode');
		var g = [ '' ], i_g = 1, bin = 1, i, i_d = 0, l_d = data.length, ch;
		for (;; i_g++) {
			if (i_g === bin) {
				if (false)
					library_namespace.debug('initial [' + g.length + '] as 0',
							1, module_name + '.encode');
				g.push(0);
				bin *= 2;
			} else {
				if (false)
					library_namespace.debug('initial [' + g.length + '] as '
							+ d.charAt(i_d) + ' (' + i_d + '/' + l_d + ')', 1,
							module_name + '.encode');
				g.push(ch = data.charAt(i_d));
				for (i = 1; i < bin; i *= 2)
					if (i_g & i)
						g[i] ^= ch;
				if (++i_d === l_d)
					break;
			}
		}

		if (library_namespace.is_debug(2)) {
			// for debug print
			for (bin = i = 1, i_d = []; i < g.length; i++) {
				ch = g[i];
				if (i === bin)
					ch = '<span style="color: #292;">' + ch + '</span>',
							bin *= 2;
				// i_d 在這表示一個專門用於顯示的 array
				i_d.push(ch);
			}
			library_namespace.log('Hamming code of [' + data + ']: ['
					+ i_d.join('') + ']');
		}

		if (this.reverse && !no_reverse)
			g = g.reverse();
		return g.join('');
	};

	_// JSDT:_module_
	.
	/**
	 * 將 Hamming Code 分成 data & check bits
	 * 
	 * @param code
	 *            Hamming Code to split
	 * @return [資料位元 data bits, 檢查位元 check bits (parity bits)]
	 * @_memberOf _module_
	 */
	split_code = function(code) {
		if (Array.isArray(code))
			code = code.join('');
		code = (' ' + code).split('');
		library_namespace.debug('split [' + code + ']', 1, module_name
				+ '.split_code', 3);
		var i = 1, l = code.length, cb = [];
		while (i < l) {
			cb.push(code[i]);
			code[i] = '';
			i *= 2;
		}
		library_namespace.debug('→ data [' + code.join('').replace(/ +/g, '')
				+ '], check bits  [' + cb + ']', 1,
				module_name + '.split_code', 3);
		return [ code.join('').replace(/ +/g, ''), cb ];
	};

	_// JSDT:_module_
	.
	/**
	 * decode Hamming Code to data
	 * 
	 * @param code
	 * @return
	 * @_memberOf _module_
	 */
	decode = function(code) {
		if (!code
				|| !/^[01]{3,30}$/
						.test(code = ('' + code).replace(/[ ,]/g, '')))
			return '';
		code = code.split('');
		if (this.reverse)
			code = code.reverse();

		var i = 0, l = code.length, ch, bin = 1, split_c = this
				.split_code(code), test_c, cb;

		if (!split_c)
			return;
		// check bits (parity bits)
		cb = split_c[1];
		test_c = this.encode(split_c[0], 1);
		if (!test_c || !(test_c = this.split_code(test_c)))
			return;

		library_namespace.debug('received check bits: [' + cb.join('')
				+ '], calculated: [' + test_c[1].join('') + ']', 1, module_name
				+ '.decode');
		test_c = parseInt(test_c[1].reverse().join(''), 2)
				^ parseInt(cb.reverse().join(''), 2);
		library_namespace.debug('error bit'
				+ (this.reverse ? ' (do reversed XOR)' : '') + ': ' + test_c
				+ '(' + test_c.toString(2) + '), ' + code.join(''), 1,
				module_name + '.decode');
		if (test_c)
			if (test_c < code.length) {
				code[test_c - 1] ^= 1;
				split_c = this.split_code(code);
			} else {
				// 這算是能檢測出 2 bits 以上錯誤的特殊例子，機率通常也不大：已經超過 index 了。
				// e.g., reversed 011010001100
				library_namespace.debug(
						'<em>Out of index!</em> More than 2 errors occurred.',
						1, module_name + '.decode');
			}

		if (library_namespace.is_debug())
			if (test_c) {
				cb = code.join('\0').split('\0');
				cb[test_c - 1] = '<span style="color:#f33;">' + cb[test_c - 1]
						+ '</span>';
				library_namespace.debug('→ ' + cb.join(''), 1, module_name
						+ '.decode');
			} else
				library_namespace.debug('The Hamming code is correct.', 1,
						module_name + '.decode');

		split_c = split_c[0];
		if (this.reverse)
			split_c = split_c.split('').reverse().join('');
		return split_c;
	};

	_// JSDT:_module_
	.
	/**
	 * 顯示 Hamming Code 的計算方法
	 * 
	 * @param {Number}
	 *            bit_length bit length. e.g., 8, 16.
	 * @_memberOf _module_
	 */
	show = function(bit_length) {
		var code = [], bit = [], parity = [], i = 1, j, k, d = 1, a = 1, cc = 1, dc = 1;
		for (;; i++) {
			bit[i] = i.toString(2);
			if (i === a) {
				code[i] = 'C' + Math.pow(2, cc++ - 1);
				a *= 2;
			} else {
				code[i] = 'D' + dc++;
				for (j = 1, k = 1; j < cc; j++, k *= 2)
					if (i & k)
						if (parity[j])
							parity[j] += '<span style="color:#aaa;">⊕</span>'
									+ code[i];
						else
							parity[j] = code[i];
				if (dc > bit_length)
					break;
			}
		}
		for (i = 1; i < code.length; i++) {
			a = code[i];
			if (j = a.match(/^C(\d+)$/))
				a += ' = '
						+ parity[Math.round(Math.log(j[1]) * Math.LOG2E) + 1];
			library_namespace.debug(bit[i] + ': ' + a);
		}

	};

	return (_// JSDT:_module_
	);
}
