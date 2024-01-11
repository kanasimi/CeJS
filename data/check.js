/**
 * @name CeL check function
 * @fileoverview 本檔案包含了 check 處理的 functions。
 * @since
 */

'use strict';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'data.check',

	// require : '',

	// 設定不匯出的子函式。
	// no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// nothing required

	/**
	 * null module constructor
	 * 
	 * @class check / 檢驗處理的 functions
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

	/**
	 * 國際標準書號check
	 * 
	 * 輸入ISBN可test是否正確，若輸入不完全的（僅缺校驗碼check digit），則會輸出完全碼 <code>

	[3]國別語種識別代號：用以識別出版社所屬的國家、語文、地域等。香港的代號是「962」或「988」。
	[3]出版社識別代號：識別某一出版社。
	[3]書名版別代號：由出版社自行為新出版的書種或版本編配。
	[1]稽核數碼：用以核對書號是否正確。
	每部分由連字號或空位分隔。

	常用check法： for 1652
	checksum：1+6+5+2(mod 10)
	質數除法：1652(mod prime)
	modulus & weight(模數與權數)：ISBN等, 1*9+6*8+5*7+2*6(mod p)
	</code>
	 * 
	 * @see http://zh.wikipedia.org/wiki/ISBN
	 *      http://www.hkpl.gov.hk/tc_chi/books_reg/books_reg_n13d/books_reg_n13d.html
	 *      http://www.isbn-international.org/converter/converter.html
	 *      http://www.isbn.org/converterpub.asp
	 * 
	 * @since 2004/11/22 20:
	 */
	// normalize ISBN
	function normalize_ISBN(code) {
		return ('' + code).replace(/[-\s]/g, '').replace(/^ISBN/i, '');
	}
	_.normalize_ISBN = normalize_ISBN;

	function check_ISBN_10(code) {
		if (!/^\d{9}[\dxX]?$/.test(code = normalize_ISBN(code)))
			return;
		// c:check digit
		var i = 0, c = 0;
		for (; i < 9;)
			c += code.charAt(i++) * i;
		c %= 11;
		if (c === 10)
			c = 'X';
		return code.length == 9 ? code + c : c === (i = code.charAt(9))
				|| c === 'X' && i === 'x';
	}
	_.ISBN_10 = check_ISBN_10;

	// 2006/11/8 19:09
	function check_ISBN_13(code) {
		if (!/^\d{12,13}$/.test(code = normalize_ISBN(code)))
			return;
		var i = 1, c = 0; // c:check digit
		for (; i < 12; i += 2)
			c += Math.floor(code.charAt(i));
		for (c *= 3, i = 0; i < 12; i += 2)
			c += Math.floor(code.charAt(i));
		// 220:大於(1*6+3*6)，%10==0即可。
		c = (220 - c) % 10;
		return code.length === 12 ? code + c : c == code.charAt(12);
	}
	_.ISBN_13 = check_ISBN_13;

	// CeL.data.check.ISBN()
	function check_ISBN(ISBN) {
		ISBN = normalize_ISBN(ISBN);
		return ISBN.length === 13 ? check_ISBN_13(ISBN)
		//
		: ISBN.length === 10 && check_ISBN_10(ISBN);
	}
	_.ISBN = check_ISBN;

	/**
	 * 臺灣地區國民身份證代字 Identity Card No. check
	 * 
	 * <code> 
	輸入身份證號碼可test是否正確，若輸入不完全的（僅缺檢查碼），則會輸出完全碼
	var check_TWIDC='ABCDEFGHJKLMNPQRSTUVXYWZIO',
	check_TWID_City='臺北市,臺中市,基隆市,臺南市,高雄市,臺北縣,宜蘭縣,桃園縣,新竹縣,苗栗縣,臺中縣,南投縣,彰化縣,雲林縣,嘉義縣,臺南縣,高雄縣,屏東縣,花蓮縣,臺東縣,澎湖縣,陽明山,,,嘉義市,新竹市'.split(',');
	// check_TWID_City:代號表
	</code>
	 * 
	 * @since 2004/11/22 22:31
	 */
	function check_TWID(ID, city, sex) {
		// 提供city/sex時ID只需要輸入流水號
		ID = String(ID).replace(/ /g, '').toUpperCase();
		if (sex) {
			sex = sex == '男' ? 1 : sex == '女' ? 2 : sex;
			ID = sex + ID;
		}
		var i,
		// check digit
		c;
		if (city
				&& (i = (c = check_TWID_City.join(',')).indexOf('' + city)) != -1) {
			i = c.slice(0, i);
			city = i.length - i.replace(/,/g, '').length;
		}
		if (isNaN(city))
			city = check_TWIDC.indexOf(ID.charAt(0));
		else
			ID = check_TWIDC.charAt(city) + ID;
		if (!/^[A-Z][12]\d{7,8}$/.test(ID))
			return;
		if (!sex)
			sex = ID.charAt(1) == 1 ? '男' : '女';

		// old:網路上流傳的演算法, slow
		if (false) {
			c = '' + (10 + city), c = 9 * c.charAt(1) + parseInt(c.charAt(0));
			for (i = 1; i < 9; i++)
				c += (9 - i) * ID.charAt(i);
			c %= 10;
			if (ID.length == 10 && parseInt(ID.charAt(9)) + c != 10)
				return null;
			if (ID.length == 9)
				ID += 10 - c;
		}

		for (i = 1, c = city, c += 9 - (c - c % 10) / 10; i < 9;)
			c += ID.charAt(i++) * i;
		c %= 10;
		if (ID.length == 10) {
			if (ID.charAt(9) != c)
				return null;
		} else if (ID.length == 9)
			ID += c;

		return [ ID, check_TWID_City[city], sex, c ];
	}

	// check only, no correct.
	function check_TWID_No(ID) {
		var i = 1, c = 'ABCDEFGHJKLMNPQRSTUVXYWZIO'.indexOf(ID.charAt(0)
				.toUpperCase());
		for (c += 9 - (c - c % 10) / 10; i < 9;)
			c += ID.charAt(i++) * i;
		return c % 10 === ID.charAt(9);
	}

	// 最低位數downmost digit>1
	var is_lucky_number_dDigit = 3;
	/**
	 * 判斷キリ番等,counter專用<br />
	 * キリ番ゲッターidお名前(げっちゅ～) home mail num キリである理由 ip date msg point(得點)<br />
	 * キリ番 2000 まで、あと 265 です。ゲットは推定 5月31日(金) 9：17 頃です。
	 * キリの良い番号（キリ番）・数字の揃った番号（ゾロ目）または語呂の良い番号（ゴロ番、面白く読める番号）を踏んだ方
	 * 
	 * TODO: 還可以加的：445533等
	 * 
	 * @param {Number}num
	 *            number
	 * 
	 * @returns {String}lucky kind
	 * 
	 * @since 2004/8/26 20:14
	 */
	function is_lucky_number(num) {
		if (!/^\d{1,20}$/.test(num)) {
			alert();
			return;
		}
		num = parseInt(num, 10);
		if (!num || num < 1)
			return;
		if (typeof num !== 'string')
			num = String(num);
		if (!is_lucky_number_dDigit || is_lucky_number_dDigit < 2)
			// default
			is_lucky_number_dDigit = 3;
		if (false && num.length == 1)
			return '首十位';
		if (num.length < is_lucky_number_dDigit)
			return;
		if (num.match(new RegExp('(0{' + is_lucky_number_dDigit + ',})$')))
			return '下' + RegExp.$1.length + '桁のキリ番';
		if (num.match(new RegExp('(9{' + is_lucky_number_dDigit + ',})$')))
			return '前後賞：差一' + (1 + RegExp.$1.length) + '位數整～';
		if (num
				.match(new RegExp('(0{' + (is_lucky_number_dDigit - 1)
						+ ',}1)$')))
			return '前後賞：' + (1 + RegExp.$1.length) + '位數過一～';
		if (num.match(new RegExp('(' + num.slice(-1) + '{'
				+ is_lucky_number_dDigit + ',})$')))
			return '下' + RegExp.$1.length + '桁のゾロ目';

		var i = 2, c = Math.floor(num.charAt(0)), d = num.charAt(1) - c;
		c += d;
		while (i < num.length)
			if (num.charAt(i++) != (c += d)) {
				d = 0;
				break;
			}
		if (d)
			return '連番（公差' + d + 'の等差数列）';

		i = 2, c = Math.floor(num.charAt(0)), d = num.charAt(1) / c;
		c *= d;
		while (i < num.length)
			if (num.charAt(i++) != (c *= d)) {
				d = 0;
				break;
			}
		if (d)
			return '公比' + (d > 1 ? d : '1/' + (1 / d)) + 'の等比数列';

		if (num.length >= is_lucky_number_dDigit) {
			c = Math.floor(num.length / 2), d = 1;
			if (num.slice(0, c) == num.substr(num.length - c))
				return c + '桁の対称形';

			for (i = 0; i <= c; i++)
				if (num.charAt(i) != num.charAt(num.length - 1 - i)) {
					d = 0;
					break;
				}
			if (d)
				return c + '桁の左右対称（鏡像、シンメトリィ）';

			for (i = 2; i <= c; i++) {
				d = num.slice(0, i);
				var s = d;
				while (s.length < num.length)
					s += d;
				if (num == s.slice(0, num.length))
					return i + '位數循環/回文';
			}

			for (i = 2, c = Math.floor(num.charAt(0)), d = Math.floor(num
					.charAt(1)); i < num.length; i++)
				if (num.charAt(i) == c + d)
					c = d, d = Math.floor(num.charAt(i));
				else {
					d = 0;
					break;
				}
			if (d)
				return 'Fibonacci数列';
		}

	}

	_.is_lucky_number = is_lucky_number;

	/**
	 * 解析姓名/人名。
	 * 
	 * @param {String}name
	 *            姓名。
	 * 
	 * @returns
	 */
	function parse_personal_name(name) {
		var matched, lastIndex = 0, length = (name = String(name)).length,
		/**
		 * family name pattern.<br />
		 * 複姓 (Chinese compound surname) 在前，大單姓在後。不取少用姓。
		 */
		family_pattern =
		//
		/歐陽|司馬|司徒|諸葛|上官|公孫|皇甫|東方|令狐|張簡|范姜|呂蕭|張廖|[王李张刘陈杨黄孙周吴徐赵朱马胡郭林何高梁郑罗宋谢唐韩曹许邓萧冯曾程蔡彭潘袁于董余苏叶吕魏蒋田杜丁沈姜范江傅钟卢汪戴崔任陆廖姚方金邱丘夏谭韦贾邹石熊孟秦阎薛侯雷白龙段郝孔邵史毛常万顾赖武康贺严尹钱施牛洪龚陳黃張吳劉楊許鄭謝賴蘇葉莊呂蕭羅簡鍾游詹盧顏趙柯翁孫歐陽鄧溫紀蔣藍連馬卓馮古湯涂鄒巫尤鐘龔嚴韓黎阮童陸錢]/g
		//
		,
		// given name.
		given,
		// family name.
		family,
		// 可能為冠夫姓，或父母聯姓。珠聯姓，又叫璧聯姓，又稱作“雙姓”。
		family_list = [];

		// reset family_pattern.
		// family_pattern.lastIndex = 0;

		while ((matched = family_pattern.exec(name))
				&& family_pattern.lastIndex < length) {
			if (lastIndex < matched.index)
				family_list.push(name.slice(0, matched.index));
			family_list.push(matched[0]);
			lastIndex = family_pattern.lastIndex;
		}

		// 人名多為2個字。
		if (lastIndex < length - 2) {
			family_list.push(name.slice(lastIndex, length - 2));
			lastIndex = length - 2;
		}

		if (family_list.length > 2 ||
		// e.g., 恒王岑
		length === lastIndex + 1 && family_list.length === 2
				&& family_list[1].length === 1) {
			library_namespace.debug('有 ' + family_list.length + ' 個可能的姓氏: ['
					+ family_list.length + ']');

			lastIndex -= family_list.pop().length;
		} else if (family_list.length === 0) {
			family_list.push(
			// name.slice(0, 1)
			String.fromCodePoint(name.codePointAt(0)));
			lastIndex++;
		}

		family = family_list.join('');
		given = name.slice(lastIndex);

		return {
			// 姓氏
			// family : family,
			姓 : family,

			// 名字
			// given : given,
			名 : given,

			// family_list : family_list
			多姓 : family_list
		};
	}

	_.parse_personal_name = parse_personal_name;

	return (_// JSDT:_module_
	);
}
