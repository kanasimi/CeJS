/**
 * @name CeL function for numeral systems
 * @fileoverview 本檔案包含了 numeral systems 用的 functions。
 * 
 * @since
 * 
 * @see <a href="https://en.wikipedia.org/wiki/List_of_numeral_systems"
 *      accessdate="2015/4/30 21:50">List of numeral systems</a>
 */

'use strict';

if (false) {
	CeL.run('data.numeral', function() {
		// ...
	});
}

if (typeof CeL === 'function')
	CeL.run({
		name : 'data.numeral',
		//
		require : 'data.code.compatibility.',

		code : function(library_namespace) {
			var
			// const: 基本上與程式碼設計合一，僅表示名義，不可更改。(== -1)
			NOT_FOUND = ''.indexOf('_');
			// nothing required

			/**
			 * null module constructor
			 * 
			 * @class 處理記數系統的 functions
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

			// -----------------------------------------------------------------------------------------------------------------
			// 中文數字 (Chinese numerals)

			function to_search_pattern(keys) {
				var key, chars = [], long_keys = [];
				function add(key) {
					if (key)
						if (key.length === 1)
							chars.push(key);
						else
							long_keys.push(key);
				}

				if (Array.isArray(keys))
					keys.forEach(add);
				else
					for (key in keys)
						add(key);

				chars = chars.length > 0 ? '[' + chars.join('') + ']' : '';
				if (long_keys.length > 0 && chars)
					long_keys.push(chars);

				// /(?:long_keys|long_keys|[chars])/g
				// /[chars]/g
				return new RegExp(long_keys.length > 0 ? '(?:'
						+ long_keys.join('|') + ')' : chars, 'g');
			}

			var
			// 小寫數字
			Chinese_numerals_Normal_digits = '〇一二三四五六七八九',
			//
			Chinese_numerals_Normal_digits_Array
			//
			= Chinese_numerals_Normal_digits.split(''),
			//
			Chinese_numerals_Normal_digits_pattern
			//
			= to_search_pattern(Chinese_numerals_Normal_digits_Array),
			//
			numerals_Normal_pattern = new RegExp('('
			//
			+ Chinese_numerals_Normal_digits_pattern.source + '|\\d+)', 'g'),
			//
			amount_pattern = new RegExp(numerals_Normal_pattern.source
					+ '?([十百千])', 'g'),

			// 正式大寫數字
			Chinese_numerals_Formal_digits = '零壹貳參肆伍陸柒捌玖',
			//
			Chinese_numerals_Formal_digits_Array
			//
			= Chinese_numerals_Formal_digits.split(''),
			//
			Chinese_numerals_Formal_digits_pattern
			//
			= to_search_pattern(Chinese_numerals_Formal_digits_Array),

			// http://thdl.ntu.edu.tw/suzhou/
			// 蘇州碼子又稱花碼、番仔碼、草碼、菁仔碼
			Suzhou_numerals_digits = '〇〡〢〣〤〥〦〧〨〩',
			// 全形阿拉伯數字 U+FF10~U+FF19 FULLWIDTH DIGIT
			FULLWIDTH_DIGITS = '０１２３４５６７８９',
			//
			positional_Chinese_numerals_digits
			//
			= Chinese_numerals_Normal_digits
			//
			+ Chinese_numerals_Formal_digits
			//
			+ Suzhou_numerals_digits.slice(1) + FULLWIDTH_DIGITS,
			//
			positional_Chinese_numerals_digits_pattern
			//
			= new RegExp('[' + positional_Chinese_numerals_digits + ']', 'g'),

			// 舊時/非正式/通用數字
			numeral_convert_pair = {
				// o : '〇',
				Ｏ : '〇',
				'○' : '〇',
				弌 : '壹',
				弍 : '貳',
				兩 : '二',
				叁 : '參',
				叄 : '參',
				弎 : '參',
				亖 : '四',
				// Firefox/3.0.19 無法 parse '䦉': 錯誤: invalid property id
				'䦉' : '肆',

				// 念圓 : '貳拾圓',
				// 念 : '貳拾',
				廿 : '二十',
				卄 : '二十',
				卅 : '三十',
				// http://www.bsm.org.cn/show_article.php?id=1888
				// "丗五年" = "卅五年"
				丗 : '三十',
				// e.g., 卌又三年
				卌 : '四十',
				皕 : '二百',
				陌 : '百',
				阡 : '仟',
				萬萬 : '億',
				// 太常使用。
				// 經 : '京',
				杼 : '秭',
				壤 : '穰',

				厘 : '釐'
			// 太常使用。
			// 毛 : '毫'
			},
			//
			numeral_convert_pattern,

			// denomination, 萬進系統單位
			// http://zh.wikipedia.org/wiki/%E4%B8%AD%E6%96%87%E6%95%B0%E5%AD%97
			// http://zh.wikipedia.org/wiki/%E5%8D%81%E8%BF%9B%E5%88%B6
			// http://zh.wikipedia.org/wiki/%E4%B8%AD%E6%96%87%E6%95%B0%E5%AD%97
			// http://lists.w3.org/Archives/Public/www-style/2003Apr/0063.html
			// http://forum.moztw.org/viewtopic.php?t=3043
			// http://www.moroo.com/uzokusou/misc/suumei/suumei.html
			// http://espero.51.net/qishng/zhao.htm
			// http://www.nchu.edu.tw/~material/nano/newsbook1.htm
			// http://www.moroo.com/uzokusou/misc/suumei/suumei1.html
			// 十億（吉）,兆（萬億）,千兆（拍）,百京（艾）,十垓（澤）,秭（堯）,秭:禾予;溝(土旁);,無量大數→,無量,大數;[載]之後的[極]有的用[報]
			// 異體：阿僧[禾氏],For Korean:阿僧祗;秭:禾予,抒,杼,For Korean:枾 For
			// Korean:不可思議(不:U+4E0D→U+F967)
			// Espana應該是梵文所譯
			// 因為根據「大方廣佛華嚴經卷第四十五卷」中在「無量」這個數位以後還有無邊、無等、不可數、不可稱、不可思、不可量、不可說、不可說不可說，Espana應該是指上面其中一個..因為如果你有心查查Espana其實應該是解作西班牙文的「西班牙」
			// ',萬,億,兆,京,垓,秭,穰,溝,澗,正,載,極,恒河沙,阿僧祇,那由他,不可思議,無量大數'
			Chinese_numerals_Denominations
			//
			= ',萬,億,兆,京,垓,秭,穰,溝,澗,正,載,極',
			//
			Chinese_numerals_Denominations_Array
			//
			= Chinese_numerals_Denominations.split(','),
			//
			Chinese_numerals_Denominations_pattern
			//
			= to_search_pattern(Chinese_numerals_Denominations_Array),
			//
			Chinese_numerals_token_pattern
			//
			= new RegExp('(.*?)('
			//
			+ Chinese_numerals_Denominations_pattern.source + ')', 'g'),

			// TODO:
			// http://zh.wikipedia.org/wiki/%E5%8D%81%E9%80%80%E4%BD%8D
			// 比漠微細的，是自天竺的佛經上的數字。而這些「佛經數字」已成為「古代用法」了。
			// 小數單位(十退位)：分,釐(厘),毫(毛),絲,忽,微,纖,沙,塵（納）,埃,渺,漠(皮),模糊,逡巡,須臾（飛）,瞬息,彈指,剎那（阿）,六德(德),虛,空,清,淨
			// or:,虛,空,清,淨→,空虛,清淨（仄）,阿賴耶,阿摩羅,涅槃寂靜（攸）
			// 六釐英金庚款公債條例: 年息定為?釐, 年利率?厘
			Chinese_numerals_Decimal_denominations = '分釐毫絲忽微纖沙塵埃渺漠',
			//
			numerals_Decimal_token_pattern
			//
			= new RegExp(numerals_Normal_pattern.source
			//
			+ '([' + Chinese_numerals_Decimal_denominations + '])', 'g'),

			// 下數系統單位
			Chinese_numerals_Normal_base_denomination
			//
			= (',十,百,千' + Chinese_numerals_Denominations).split(','),
			//
			Chinese_numerals_Formal_base_denomination
			//
			= (',拾,佰,仟' + Chinese_numerals_Denominations).split(','),
			//
			Chinese_numerals_Normal_pattern = new RegExp('(?:負?(?:['
					+ Chinese_numerals_Normal_digits + '\\d ]['
					+ Chinese_numerals_Normal_base_denomination.join('')
					+ ']*|['
					+ Chinese_numerals_Normal_base_denomination.join('')
					+ ']+)+(又|分之)?)+', 'g'),
			//
			Chinese_numerals_Normal_Full_matched = new RegExp('^(?:負?['
					+ Chinese_numerals_Normal_digits + '\\d '
					+ Chinese_numerals_Normal_base_denomination.join('')
					+ '又]+|分之)+$'),
			//
			numeral_value = library_namespace.null_Object();

			_.Chinese_numerals_Normal_digits = Chinese_numerals_Normal_digits;
			_.Chinese_numerals_Formal_digits = Chinese_numerals_Formal_digits;
			_.Chinese_numerals_Denominations
			//
			= Chinese_numerals_Denominations_Array.join('');

			(function() {
				var base, scale = 0;
				Chinese_numerals_Normal_digits_Array
				//
				.forEach(function(digits) {
					numeral_value[digits] = scale;
					scale++;
				});

				base = scale;
				'十,百,千'.split(',')
				//
				.forEach(function(denomination) {
					numeral_value[denomination] = scale;
					scale *= base;
				});

				base = scale;
				Chinese_numerals_Denominations_Array
				//
				.forEach(function(denomination) {
					if (denomination) {
						numeral_value[denomination] = scale;
						scale *= base;
					}
				});

				scale = .1;
				Chinese_numerals_Decimal_denominations.split('')
				//
				.forEach(function(denomination) {
					if (denomination) {
						numeral_value[denomination] = scale;
						scale /= 10;
					}
				});

				for (scale = 1;
				//
				scale < Suzhou_numerals_digits.length; scale++) {
					base = Suzhou_numerals_digits.charAt(scale);
					numeral_value[base] = scale;
					numeral_convert_pair[base]
					//
					= Chinese_numerals_Normal_digits[scale];
				}

				for (scale = 0;
				//
				scale < FULLWIDTH_DIGITS.length; scale++) {
					base = FULLWIDTH_DIGITS.charAt(scale);
					numeral_value[base] = scale;
					numeral_convert_pair[base]
					//
					= Chinese_numerals_Normal_digits[scale];
				}

				numeral_convert_pattern
				//
				= to_search_pattern(numeral_convert_pair);
			})();

			// 對所有非正規之數字。
			// TODO (bug): 十廿, 二廿
			function normalize_Chinese_numeral(number_String) {
				return number_String
				// .replace(/\s+/g, '')
				//
				.replace(numeral_convert_pattern, function($0) {
					return numeral_convert_pair[$0];
				});
			}

			_.normalize_Chinese_numeral = normalize_Chinese_numeral;

			function Chinese_numerals_Formal_to_Normal(number_String) {
				return number_String
						.replace(
								Chinese_numerals_Formal_digits_pattern,
								function($0) {
									return Chinese_numerals_Normal_digits
									//
									.charAt(Chinese_numerals_Formal_digits
											.indexOf($0));
								})
						//
						.replace(/[拾佰仟]/g, function(denomination) {
							return '十百千'.charAt('拾佰仟'.indexOf(denomination));
						});
			}

			_.Chinese_numerals_Formal_to_Normal
			//
			= Chinese_numerals_Formal_to_Normal;

			function Chinese_numerals_Normal_to_Formal(number_String) {
				return number_String
						.replace(
								Chinese_numerals_Normal_digits_pattern,
								function($0) {
									return Chinese_numerals_Formal_digits
									//
									.charAt(Chinese_numerals_Normal_digits
											.indexOf($0));
								})
						//
						.replace(/[十百千]/g, function($0) {
							return '拾佰仟'.charAt('十百千'.indexOf($0));
						});

			}

			_.Chinese_numerals_Normal_to_Formal
			//
			= Chinese_numerals_Normal_to_Formal;

			/**
			 * 將漢字中文數字轉換為半形阿拉伯數字表示法(小數系統 0-99999)
			 * 
			 * @deprecated use from_Chinese_numeral.
			 */
			function deprecated_from_Chinese_numeral(number_String) {
				if (!number_String || !isNaN(number_String))
					return number_String;

				number_String = Chinese_numerals_Formal_to_Normal(
				//
				normalize_Chinese_numeral('' + number_String));

				var i = 0, l, m,
				//
				n = Chinese_numerals_Normal_digits_Array,
				//
				d = '萬千百十'.split(''), r = 0,
				/**
				 * @see <a
				 *      href="http://zh.wikipedia.org/wiki/%E6%97%A5%E8%AA%9E%E6%95%B8%E5%AD%97"
				 *      accessdate="2012/9/10 21:0">日語數字</a>
				 */
				p = ('' + number_String).replace(/\s/g, '')
				//
				.replace(/[Ｏ○]/g, '〇');
				for (; i < n.length; i++)
					n[n[i]] = i;
				for (i = 0; i < d.length; i++) {
					if (p && NOT_FOUND !==
					//
					(m = d[i] ? p.indexOf(d[i]) : p.length))
						if (!m && d[i] === '十')
							r += 1, p = p.slice(1);
						else if (isNaN(l = n[
						//
						p.slice(0, m).replace(/^〇+/, '')]))
							return number_String;
						else
							r += l, p = p.slice(m + 1);
					if (d[i])
						r *= 10;
				}

				return r;
			}

			/**
			 * <code>

			CeL.assert(['一百兆〇八億〇八百',CeL.to_Chinese_numeral(100000800000800)],'小寫中文數字');
			CeL.assert(['捌兆肆仟陸佰柒拾貳億捌仟柒佰參拾捌萬玖仟零肆拾柒',CeL.to_Chinese_numeral(8467287389047,true)],'大寫中文數字');
			CeL.assert(['新臺幣肆萬參拾伍圓參角肆分貳文參',CeL.to_TWD(40035.3423)],'貨幣/currency test');
			CeL.assert([8467287389047,CeL.from_Chinese_numeral(CeL.to_Chinese_numeral(8467287389047,true))],'中文數字');
			for(var i=0;i<=1000;i++)
				CeL.assert([i,CeL.from_Chinese_numeral(CeL.to_Chinese_numeral(i,true))],'中文數字 '+i);

			CeL.assert(["壬辰以來，至景初元年丁已歲，積4046，算上。",CeL.from_Chinese_numeral('壬辰以來，至景初元年丁已歲，積四千四十六，算上。')]);
			CeL.assert(['40179字',CeL.from_Chinese_numeral('四萬百七十九字')]);
			CeL.assert([10000000000000000,CeL.from_Chinese_numeral('京')]);
			CeL.assert(['10000字',CeL.from_Chinese_numeral('一萬字')]);
			CeL.assert(['正常情況下:40379字',CeL.from_Chinese_numeral('正常情況下:四萬〇三百七十九字')]);
			CeL.assert([4.5,CeL.from_Chinese_numeral('2分之九')]);
			CeL.assert(["1974年",CeL.from_positional_Chinese_numeral('一九七四年')]);
			CeL.assert(["一九七四年",CeL.to_positional_Chinese_numeral('1974年')]);
			CeL.assert([4022,CeL.from_positional_Chinese_numeral('〤〇〢二')],'擴充蘇州碼子');

			</code>
			 */

			function from_positional_Chinese_numeral(number_String) {
				return isNaN(number_String = number_String.replace(
						positional_Chinese_numerals_digits_pattern, function(
								digit) {
							return numeral_value[digit];
						})) ? number_String : +number_String;
			}

			function to_positional_Chinese_numeral(number_String, formal) {
				formal = formal ? Chinese_numerals_Formal_digits_Array
				//
				: Chinese_numerals_Normal_digits_Array;
				return ('' + number_String)
				//
				.replace(/\d/g, function(digit) {
					return formal[digit];
				});
			}

			_.positional_Chinese_numerals_digits
			//
			= positional_Chinese_numerals_digits;
			_.from_positional_Chinese_numeral
			//
			= from_positional_Chinese_numeral;
			_.to_positional_Chinese_numeral
			//
			= to_positional_Chinese_numeral;

			// 將漢字中文數字轉換為半形阿拉伯數字表示法。(正常情況下:小數系統 0-9999)
			function from_Chinese_numeral_token(amount) {
				if (!isNaN(amount))
					return +amount;

				// reset
				amount_pattern.lastIndex = 0;

				var token_sum = 0, matched, lastIndex = 0;
				while (matched = amount_pattern.exec(amount)) {
					lastIndex = amount_pattern.lastIndex;
					// [ , digit, denomination ]
					// for "一千零十一" 等。
					token_sum += (matched[1]
					//
					&& matched[1] !== '〇' ? numeral_value[matched[1]] : 1)
					//
					* numeral_value[matched[2]];
				}

				// lastIndex 後面的全部放棄。
				amount = amount.slice(lastIndex).replace(/^〇+/, '');
				numerals_Normal_pattern.lastIndex = 0;

				matched = numerals_Normal_pattern.exec(amount);
				if (matched)
					token_sum += isNaN(matched = matched[0])
					//
					? numeral_value[matched] : +matched;

				return token_sum || 0;
			}

			/**
			 * 將漢字中文數字轉換為阿拉伯數字表示法。<br />
			 * 注意：本函數不會檢查 number_String 之正規與否！
			 */
			function from_Chinese_numeral(number_String) {
				if (!number_String || !isNaN(number_String))
					return number_String;

				number_String = Chinese_numerals_Formal_to_Normal(
				//
				normalize_Chinese_numeral('' + number_String));

				if (!Chinese_numerals_Normal_Full_matched.test(number_String)) {
					// 部分符合，僅針對符合部分處理。
					Chinese_numerals_Normal_pattern.lastIndex = 0;
					return number_String.replace(
					//
					Chinese_numerals_Normal_pattern, from_Chinese_numeral);
				}

				var sum = 0, lastIndex = 0,
				//
				negative = number_String.charAt(0) === '負',
				//
				matched = number_String
				//
				.match(/^(負)?(?:(.+)又)?(.+)分之(.+)$/);
				if (matched) {
					sum = (matched[2]
					//
					&& from_Chinese_numeral(matched[2]) || 0)
							+ from_Chinese_numeral(matched[4])
							/ from_Chinese_numeral(matched[3]);
					return negative ? -sum : sum;
				}

				// reset
				Chinese_numerals_token_pattern.lastIndex = 0;

				while (matched = Chinese_numerals_token_pattern
				//
				.exec(number_String)) {
					// [ , amount, denomination ]
					sum += from_Chinese_numeral_token(matched[1] || 1)
							* numeral_value[matched[2]];
					lastIndex = Chinese_numerals_token_pattern.lastIndex;
				}

				number_String = number_String.slice(lastIndex);
				numerals_Decimal_token_pattern.lastIndex = 0;
				if (lastIndex = numerals_Decimal_token_pattern
				//
				.exec(number_String)) {
					// 輸入 '捌佰3分' 之類。
					lastIndex = lastIndex.index;
					matched = [ , number_String.slice(0, lastIndex),
							number_String.slice(lastIndex) ];
				} else
					// 輸入 '捌佰3又3分' 之類。
					matched = number_String.match(/(.*)[點又.](.*)/)
							|| [ , number_String ];
				sum += from_Chinese_numeral_token(matched[1]);

				if (number_String = matched[2])
					// 小數。
					for (var base = .1, lastIndex = 0;; base /= 10) {
						numerals_Decimal_token_pattern.lastIndex = lastIndex;
						if (matched = numerals_Decimal_token_pattern
						//
						.exec(number_String)) {
							lastIndex
							//
							= numerals_Decimal_token_pattern.lastIndex;
							// 單位
							base = numeral_value[matched[2]];
							matched = matched[1];
						} else {
							numerals_Normal_pattern.lastIndex = lastIndex;
							if (matched = numerals_Normal_pattern
							//
							.exec(number_String)) {
								lastIndex
								//
								= numerals_Normal_pattern.lastIndex;
								matched = matched[0];
							} else
								break;
						}
						if (isNaN(matched))
							matched = numeral_value[matched];
						else if (matched > 9)
							matched = matched.replace(/^(\d)/, '$1.');
						else
							matched = +matched;
						sum += matched * base;
					}

				return negative ? -sum : sum;
			}

			/**
			 * 將阿拉伯數字轉為中文數字<b>下數系統</b>大寫、小寫兩種表示法/讀法<br />
			 * 處理1-99999的數,尚有bug
			 */
			function to_Chinese_numeral_Low_count(number_String, formal) {
				// 用r=[]約多花一倍時間!
				var i = 0, r = '', l = number_String.length - 1, d,
				//
				tnum = formal ? Chinese_numerals_Formal_digits_Array
						: Chinese_numerals_Normal_digits_Array,
				//
				zero = tnum[0],
				//
				tbd = formal ? Chinese_numerals_Formal_base_denomination
						: Chinese_numerals_Normal_base_denomination;

				for (; i <= l; i++)
					// if(d=parseInt(number_String.charAt(i)))比較慢
					if ((d = number_String.charAt(i)) !== '0')
						// '〇一二三四五六七八'.charAt(d) 比較慢
						r += tnum[d] + tbd[l - i];
					else if (r.slice(-1) != zero)
						if (Math.floor(number_String.slice(i + 1)))
							r += zero;
						else
							break;
				return r;
			}

			if (false)
				(function() {
					// 2.016,2.297,2.016
					var d = new Date, v = '12345236', i = 0, a;
					for (; i < 10000; i++)
						a = to_Chinese_numeral(v);
					alert(v + '\n→' + a + '\ntime:' + gDate(new Date - d));
				});

			/**
			 * 將阿拉伯數字轉為萬進中文數字表示法。 num>1京時僅會取概數，此時得轉成string再輸入！ TODO: 統整:尚有bug。
			 * 廿卅 小數
			 * 
			 * @param {Number}number
			 *            native number
			 * @param {Boolean}[formal]
			 *            kind
			 * 
			 * @returns {String} 中文數字
			 * 
			 */
			function to_Chinese_numeral(number, formal) {
				// number = parseFloat(number);
				number = (typeof number === 'number'
				//
				? number.toString(10)
				//
				: '' + number).replace(/[,\s]/g, '');

				if (!/^[+\-]?(?:\d+(?:\.\d*)?|(?:\d*\.)?\d+)$/.test(number))
					// 非數值
					return number.replace(
					//
					/[+\-]?(?:\d+(?:\.\d*)?|(?:\d*\.)?\d+)/g, function($0) {
						return to_Chinese_numeral($0, formal);
					});

				var j,
				// i:integer,整數;
				i,
				// d:decimal,小數
				d = number.indexOf('.'), k, l, m, addZero = false,
				//
				tnum = formal ? Chinese_numerals_Formal_digits_Array
				//
				: Chinese_numerals_Normal_digits_Array,
				//
				zero = tnum[0];
				if (d === NOT_FOUND)
					d = 0;
				else
					for (number = number.replace(/0+$/, ''),
					//
					i = number.slice(d + 1),
					//
					number = number.slice(0, d),
					//
					d = '', j = 0; j < i.length; j++)
						// 小數
						d += tnum[i.charAt(j)];

				// 至此 number 為整數。
				if (number.charAt(0) === '-')
					i = '負', number = number.slice(1);
				else
					i = '';
				number = number.replace(/^0+/, '');

				m = number.length % 4, j = m - 4,
						l = (number.length - (m || 4)) / 4;
				// addZero=false, l=Math.floor((number.length-1)/4)
				for (; j < number.length; m = 0, l--)
					// 這邊得用 parseInt( ,10):
					// parseInt('0~')會用八進位，其他也有奇怪的效果。
					if (Math.floor(m = m ? number.slice(0, m) : number.substr(
							j += 4, 4))) {
						m = to_Chinese_numeral_Low_count(m, formal);
						if (addZero = addZero && m.charAt(0) != zero) {
							i += zero + m
							//
							+ Chinese_numerals_Denominations_Array[l];
							addZero = false;
						} else
							i += m
							//
							+ Chinese_numerals_Denominations_Array[l];
					} else
						addZero = true;

				// 習慣用法： 一十 → 十
				return (i ? i.replace(/^(負)?[一壹]([十拾])/, '$1$2') : zero)
						+ (d ? '點' + d : '');
			}

			_.from_Chinese_numeral = from_Chinese_numeral;
			_.to_Chinese_numeral = to_Chinese_numeral;

			/**
			 * 各區文化特色 - 貨幣轉換:<br />
			 * 轉換成新臺幣中文大寫金額表示法。<br />
			 * Converted into money notation.
			 * 
			 * @example <code>

				//	貨幣/currency test
				CeL.assert([ '新臺幣肆萬參拾伍圓參角肆分貳文參',
				    CeL.to_TWD(40035.3423) ]);

			 * </code>
			 * 
			 * @param {Number|String}amount
			 *            貨幣數量。
			 * @returns {String} 新臺幣金額中文大寫表示法。
			 * 
			 * @requires to_Chinese_numeral()
			 */
			function to_TWD(amount) {
				if (typeof amount === 'string')
					amount = amount.replace(/[\s,$]+/g, '');

				amount = to_Chinese_numeral(amount, true)
				// 銀行習慣用法，零可以不用寫。
				.replace(/([仟萬億兆京垓秭穰溝澗正載極])零/g, '$1');

				return '新臺幣' + (amount.includes('點') ? amount.replace(
				//
				/點(.)(.)?(.)?/, function($0, $1, $2, $3) {
					return '圓' + $1 + '角'
					//
					+ ($2 ? $2 + '分' + ($3 ? $3 + '文' : '') : '');
				}) : amount + '圓整');
			}

			_// JSDT:_module_
			.to_TWD = to_TWD;

			/**
			 * Japanese numerals
			 * 
			 * @param {Number}number
			 *            native number
			 * 
			 * @returns {String} Japanese numerals
			 */
			function to_Japanese_numeral(number) {
				return to_Chinese_numeral(number).replace(/〇/g, '').replace(
						/萬/, '万');
			}

			_.to_Japanese_numeral = to_Japanese_numeral;

			// -----------------------------------------------------------------------------------------------------------------
			// (十進位)位值直接轉換用
			// https://en.wikipedia.org/wiki/Positional_notation

			function convert_positional(digit_set, name) {
				var digits;
				if (typeof digit_set !== 'string' || 10 !==
				//
				(digits = digit_set.chars()).length) {
					library_namespace.err('Invalid digits of [' + name + ']: ('
							+ digits.length + ') [' + digit_set + ']');
					return;
				}

				var PATTERN_numeral = new RegExp(
						digit_set.length === digits.length ? '[' + digit_set
								+ ']' : digits.join('|'), 'g');
				digits.forEach(function(digit, index) {
					numeral_convert_pair[digit] = index;
				});

				/**
				 * native number → positional numeral system
				 * 
				 * @param {Number}number
				 *            native number
				 * 
				 * @returns {String} specified numerals
				 */
				function to_numeral(number) {
					return String(number).replace(/\d/g, function(digit) {
						return digits[digit];
					});
				}

				/**
				 * positional numeral system → native number
				 * 
				 * @param {String}number
				 *            specified numerals
				 * 
				 * @returns {Number} native number
				 */
				to_numeral.from = function from_numeral(number) {
					number = String(number).replace(PATTERN_numeral,
							function(digit) {
								return numeral_convert_pair[digit];
							});
					if (!isNaN(number))
						number = Number(number);
					return number;
				}

				return to_numeral;
			}

			// http://wikimediafoundation.org/wiki/Template:ConvertDigit
			// https://github.com/esetera/Objavi/blob/master/digits.txt
			// https://de.wikipedia.org/wiki/Zahlzeichen_in_Unicode
			// TODO: https://en.wiktionary.org/wiki/8
			(function() {
				var positional_digits = {
					// Eastern Arabic numerals
					// https://en.wikipedia.org/wiki/Eastern_Arabic_numerals
					// 中東阿拉伯文數字, 標準阿拉伯文數字
					// Western Arabic / Hindu–Arabic numeral system: 0123456789
					// 在埃及，「二」通常用另一種寫法。
					Arabic : '٠١٢٣٤٥٦٧٨٩',
					// Perso-Arabic variant, Persian, Urdu, 東阿拉伯文數字
					Perso : '۰۱۲۳۴۵۶۷۸۹',

					Balinese : '᭐᭑᭒᭓᭔᭕᭖᭗᭘᭙',

					// Bengali numerals (সংখ্যা shôngkhæ), 孟加拉文數字,
					// Bengali-Assamese numerals
					// https://en.wikipedia.org/wiki/Bengali_numerals
					// ৴৵৶৷৸৹
					Bangla : '০১২৩৪৫৬৭৮৯',

					Brahmi : '𑁦𑁧𑁨𑁩𑁪𑁫𑁬𑁭𑁮𑁯',
					Chakma : '𑄶𑄷𑄸𑄹𑄺𑄻𑄼𑄽𑄾𑄿',
					Cham : '꩐꩑꩒꩓꩔꩕꩖꩗꩘꩙',

					// 天城文（देवनागरी / devanāgarī）
					// https://hi.wikipedia.org/wiki/%E0%A4%AE%E0%A5%80%E0%A4%A1%E0%A4%BF%E0%A4%AF%E0%A4%BE%E0%A4%B5%E0%A4%BF%E0%A4%95%E0%A4%BF:Gadget-Numeral_converter.js
					// https://hi.wikipedia.org/wiki/%E0%A4%B5%E0%A4%BF%E0%A4%95%E0%A4%BF%E0%A4%AA%E0%A5%80%E0%A4%A1%E0%A4%BF%E0%A4%AF%E0%A4%BE:%E0%A4%85%E0%A4%82%E0%A4%95_%E0%A4%AA%E0%A4%B0%E0%A4%BF%E0%A4%B5%E0%A4%B0%E0%A5%8D%E0%A4%A4%E0%A4%95
					Devanagari : '०१२३४५६७८९',

					Gujarati : '૦૧૨૩૪૫૬૭૮૯',
					// Gurmukhī numerals
					// https://en.wikipedia.org/wiki/Gurmukh%C4%AB_alphabet#Numerals
					Gurmukhi : '੦੧੨੩੪੫੬੭੮੯',
					Javanese : '꧐꧑꧒꧓꧔꧕꧖꧗꧘꧙',
					Kannada : '೦೧೨೩೪೫೬೭೮೯',
					// Kayah Li
					Kayah_Li : '꤀꤁꤂꤃꤄꤅꤆꤇꤈꤉',

					// Khmer, Cambodian, 高棉文數字.
					// https://km.wikipedia.org/wiki/%E1%9E%91%E1%9F%86%E1%9E%96%E1%9F%90%E1%9E%9A%E1%9E%82%E1%9F%86%E1%9E%9A%E1%9E%BC:Number_table_sorting
					Khmer : '០១២៣៤៥៦៧៨៩',

					// Tai Tham Hora 十進位數字系統。
					Lanna : '᪀᪁᪂᪃᪄᪅᪆᪇᪈᪉',
					// Tai Tham Tham 十進位數字系統。老傣文，又稱老傣仂文、蘭納文. Lanna script
					Tai_Tham : '᪐᪑᪒᪓᪔᪕᪖᪗᪘᪙',

					// 寮國/寮文數字
					Lao : '໐໑໒໓໔໕໖໗໘໙',
					Lepcha : '᱀᱁᱂᱃᱄᱅᱆᱇᱈᱉',
					Limbu : '᥆᥇᥈᥉᥊᥋᥌᥍᥎᥏',
					Malayalam : '൦൧൨൩൪൫൬൭൮൯',
					// Meitei-Mayek
					Meitei_Mayek : '꯰꯱꯲꯳꯴꯵꯶꯷꯸꯹',
					Mongolian : '᠐᠑᠒᠓᠔᠕᠖᠗᠘᠙',
					// or Burmese. 緬甸文數字.
					// 警告:其中非空!
					Myanmar : '၀၁၂၃၄၅၆၇၈၉',
					// 緬甸撣邦文十進位數字系統。
					// 警告:其中非空!
					Myanmar_Shan : '႐႑႒႓႔႕႖႗႘႙',
					// Neu-Tai-Lue.
					Neu_Tai_Lue : '᧐᧑᧒᧓᧔᧕᧖᧗᧘᧙',
					// N'Ko, r to l
					NKo : '߀߁߂߃߄߅߆߇߈߉',
					Oriya : '୦୧୨୩୪୫୬୭୮୯',
					// Ol Chiki decimal numeral system. 桑塔爾文十進位數字系統。
					Ol_Chiki : '᱐᱑᱒᱓᱔᱕᱖᱗᱘᱙',
					Osmanya : '𐒠𐒡𐒢𐒣𐒤𐒥𐒦𐒧𐒨𐒩',
					Saurashtra : '꣐꣑꣒꣓꣔꣕꣖꣗꣘꣙',
					Sharada : '𑇐𑇑𑇒𑇓𑇔𑇕𑇖𑇗𑇘𑇙',
					// Sorang-Sompeng
					Sorang_Sompeng : '𑃰𑃱𑃲𑃳𑃴𑃵𑃶𑃷𑃸𑃹',
					Sundanese : '᮰᮱᮲᮳᮴᮵᮶᮷᮸᮹',
					Takri : '𑛀𑛁𑛂𑛃𑛄𑛅𑛆𑛇𑛈𑛉',
					// Tamil (Grantha), 泰米爾文數字
					// https://www.adobe.com/type/browser/pdfs/1965.pdf
					Tamil : '௦௧௨௩௪௫௬௭௮௯',
					Telugu : '౦౧౨౩౪౫౬౭౮౯',
					// 藏文數字
					Tibetan : '༠༡༢༣༤༥༦༧༨༩',
					// 泰文數字
					Thai : '๐๑๒๓๔๕๖๗๘๙',
					Vai : '꘠꘡꘢꘣꘤꘥꘦꘧꘨꘩'
				};

				for ( var name in positional_digits) {
					var to_numeral = convert_positional(
							positional_digits[name], name);
					if (to_numeral) {
						_['to_' + name + '_numeral'] = to_numeral;
						_['from_' + name + '_numeral'] = to_numeral.from;
					}
				}
			})();

			// -----------------------------------------------------------------------------------------------------------------
			// Roman numerals
			// https://en.wikipedia.org/wiki/Roman_numerals
			// https://en.wiktionary.org/wiki/Appendix:Roman_numerals
			// Alternative forms
			var Roman_numeral_alternative = {
				'ↅ' : 'VI',
				'ↆ' : 'L',
				Ⅼ : 'L',
				Ⅽ : 'C',
				Ⅾ : 'D',
				Ⅿ : 'M',
				ⅼ : 'L',
				ⅽ : 'C',
				ⅾ : 'D',
				ⅿ : 'M',
				ↀ : 'M'
			}, PATTERN_Roman_numeral_alternative,
			//
			Roman_numeral_pair = {},
			// 
			PATTERN_Roman = [],

			Roman_numeral_value = 'IVXLCDMↁↂↇↈ'.split('');

			Roman_numeral_value.forEach(function(digit, index) {
				var is_unit = index % 2 === 0, next;
				Roman_numeral_pair[digit] = (is_unit ? 1 : 5)
						* Math.pow(10, index / 2 | 0);
				if (is_unit) {
					var next = Roman_numeral_value[index + 1];
					PATTERN_Roman.unshift('('
							+ (next ? digit + '[' + next
									+ Roman_numeral_value[index + 2] + ']|'
									+ next + '?' : '') + digit + '*)');
				}
			});

			// 千百十個: /(M*)(C[DM]|D?C*)(X[LC]|L?X*)(I[VX]|V?I*)/i
			PATTERN_Roman = new RegExp(PATTERN_Roman.join(''), 'i');
			// console.log(PATTERN_Roman);
			// /(ↈ*)(ↂ[ↇↈ]|ↇ?ↂ*)(M[ↁↂ]|ↁ?M*)(C[DM]|D?C*)(X[LC]|L?X*)(I[VX]|V?I*)/i

			function to_Roman_numeral(number) {
				if (!(number > 0) || number != (number | 0))
					return number;

				var value = [], left = number | 0;
				for (var index = 0; left > 0; index += 2) {
					if (index >= Roman_numeral_value.length)
						// OUT OF RANGE
						throw new Error('The number is too large: ' + number);

					var digits, position = left % 10;
					left = left / 10 | 0;
					if ((position + 1) % 5 === 0)
						digits = Roman_numeral_value[index]
								+ Roman_numeral_value[index
										+ (position === 4 ? 1 : 2)];
					else {
						if (position > 4) {
							position -= 5;
							digits = Roman_numeral_value[index + 1];
						} else
							digits = '';
						digits += Roman_numeral_value[index].repeat(position);
					}
					value.push(digits);
				}

				return value.reverse().join('');
			}

			function Roman_position(previous, position) {
				if (!position)
					return previous;

				if (position.length === 1)
					return previous + Roman_numeral_pair[position];

				var _1 = Roman_numeral_pair[position[0]],
				//
				_2 = Roman_numeral_pair[position[1]];
				if (_2 > _1)
					// assert: position.length === 2
					return previous + _2 - _1;

				return previous + _1 + _2 * (position.length - 1);
			}

			// TODO: 'Ↄ', 'ↄ'
			function from_Roman_numeral(number) {
				var matched = normalize_Roman_numeral(number).match(
						PATTERN_Roman);

				return matched ? matched.slice(1).reduce(Roman_position, 0)
						: number;
			}

			function normalize_Roman_numeral(number) {
				return String(number)
				// 正規化。
				.replace(PATTERN_Roman_numeral_alternative, function(digit) {
					return Roman_numeral_alternative[digit];
				});
			}

			_.to_Roman_numeral = to_Roman_numeral;
			_.from_Roman_numeral = from_Roman_numeral;
			_.normalize_Roman_numeral = normalize_Roman_numeral;

			'ⅠⅡⅢⅣⅤⅥⅦⅧⅩⅪⅫ'.split('').forEach(function(digit, index) {
				Roman_numeral_alternative[digit] = to_Roman_numeral(index + 1);
			});
			'ⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹⅺⅻ'.split('').forEach(function(digit, index) {
				Roman_numeral_alternative[digit] = to_Roman_numeral(index + 1);
			});
			PATTERN_Roman_numeral_alternative = new RegExp('['
					+ Object.keys(Roman_numeral_alternative) + ']', 'g');

			if (false)
				(function() {
					for (var i = 1; i < 50000; i++)
						if (i !== CeL.from_Roman_numeral(CeL
								.to_Roman_numeral(i)))
							throw 'Error: '
									+ i
									+ ' → '
									+ CeL.to_Roman_numeral(i)
									+ ' → '
									+ CeL.from_Roman_numeral(CeL
											.to_Roman_numeral(i));
				});

			// -----------------------------------------------------------------------------------------------------------------

			return (_// JSDT:_module_
			);
		}

	});
