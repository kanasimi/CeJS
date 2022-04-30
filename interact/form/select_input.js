
/**
 * @name CeL 下拉式表單 function
 * @fileoverview 本檔案包含了下拉選擇式表單的 functions。
 * 
 * @example<code>

TODO:
HTML 5 <datalist> Tag
date
http://plugins.jquery.com/project/timepicker
http://digitalbush.com/projects/masked-input-plugin/
理想:
http://gs.statcounter.com/


http://plugins.jquery.com/search/node/Autocomplete+type%3Aproject_project
http://bassistance.de/jquery-plugins/jquery-plugin-autocomplete/
	http://jsgears.com/thread-114-1-1.html

set focus/blue background-image instead of HTML 5 placeholder text
	http://dev.w3.org/html5/spec/Overview.html#the-placeholder-attribute
	The placeholder attribute represents a short hint (a word or short phrase) intended to aid the user with data entry.
e.g., background-image: url(http://www.google.com/cse/intl/en/images/google_custom_search_watermark.gif); background-attachment: initial; background-origin: initial; background-clip: initial; background-color: rgb(255, 255, 255); background-position: 0% 50%; background-repeat: no-repeat no-repeat;
or
http://perldoc.perl.org/
usually show a <div>. show <input> only at focus.


http://miketaylr.com/pres/html5/forms2.html
http://people.opera.com/brucel/demo/html5-forms-demo.html
http://www.erichynds.com/examples/jquery-multiselect/examples.htm
http://x.wawooo.com/archives/891

http://www.google.com.tw/dictionary
鍵盤選擇時同時改變值

</code>
 * 
 * @since
 */


//'use strict';
typeof CeL === 'function' && CeL.run(
	{
		name: 'interact.form.select_input',
		// for new URL(url)
		require: 'interact.DOM.get_node_offset|application.net.',
		code: module_code
	});


function module_code(library_namespace, load_arguments) {

	// requiring
	var get_node_offset = this.r('get_node_offset');

	// 載入 CSS resource(s)。
	// include resources of module.
	library_namespace.run(library_namespace.get_module_path(this.id, 'select_input.css'));


	/**
	 * 簡易型 interact.DOM.XML_node @ interact.form.select_input
	 * @param tag
	 *            p.appendChild tag
	 * @param p
	 *            parent node
	 * @param t
	 *            text
	 * @param classN
	 *            className
	 * @inner
	 * @ignore
	 * @return
	 */
	var create_DO = function (tag, p, t, classN) {
		var _e;
		if (t && (typeof t != 'object' || library_namespace.is_Object(t)))
			t = document.createTextNode('' + t);

		if (typeof tag === 'object') {
			_e = tag;
		} else if (tag) {
			_e = document.createElement(tag);
			if (classN)
				_e.className = classN;
			if (t
				// 真有出錯應該改源頭…
				// && t.nodeType
			) {
				_e.appendChild(t);
			}
		} else if (t)
			_e = t;
		if (p && _e)
			p.appendChild(_e);
		return _e;
	};


	/**
	 * get scrollbar height
	 * 
	 * @return
	 * @since 2008/9/3 23:31:21
	 * @inner
	 * @ignore
	 * @see http://jdsharp.us/jQuery/minute/calculate-scrollbar-width.php<br />
	 *      lazy evaluation
	 *      http://peter.michaux.ca/articles/lazy-function-definition-pattern
	 */
	function scrollbar_width() {
		var _f = scrollbar_width;
		if (!_f.w) {
			var w, p = create_DO('div', document.body), c = create_DO('div', p, ' '), s = p.style;
			s.width = s.height = '80px';
			// 有時沒這行才出得來
			// c.style.width = '100%';
			s.overflow = 'hidden';
			w = c.offsetWidth;
			s.overflow = 'scroll';
			_f.w = w - c.offsetWidth;
			library_namespace.debug('scrollbar_width: ' + w + '-' + c.offsetWidth + '=' + _f.w, 2);
			document.body.removeChild(p);
		}
		return _f.w;
	}


	/**
	 * scroll 到可以看到 object TODO: 考慮可能沒 scrollbar 包括橫向
	 * 
	 * @param o
	 *            object
	 * @param [p]
	 *            parentNode to scroll
	 * @return
	 * @since 2008/9/3 23:31:29
	 * @inner
	 * @ignore
	 */
	function scroll_to_show(o, p) {
		if (!p) {
			p = o;
			while ((p = p.parentNode) && p.offsetHeight == p.scrollHeight)
				;
		}
		library_namespace.debug('scroll_to_show: ' + p.scrollTop + ', ' + p.scrollHeight + ',' + p.offsetHeight + ', ' + o.offsetTop, 2);

		var s, a;
		if (a = o.offsetTop, a < p.scrollTop)
			s = a;
		else if (a = o.offsetTop + o.offsetHeight - p.offsetHeight
			+ scrollbar_width(), a > p.scrollTop)
			if (s = a, a = o.offsetTop, a < s)
				s = a;

		if (!isNaN(s))
			p.scrollTop = s;
	}


	/**
	 * <code>
	
	{
		title: '',
		name: '',
		container: 'id' | obj,
		list: [] | {} | {group1:{}, group2:[],.. },
		default: '' | [],
		type: 'select' | 'radio' | 'checkbox',
	}
	
	return <select>
	
	
	TODO:
	複選 <select>
	<radio>
	<checkbox>
	+<label>
	autocomplete: 假如所有備取 list 都有一樣的 prefix，則自動完成。
		把後面的用反白自動完成。
	
	在 list 上下安排三角，onmouseover 即可自動滾動。
	
	color panel
	
	http://www.itlearner.com/code/js_ref/choi3.htm
	selectName.options[i]=new Options("option_value","option_Text", defaultSelected, selected);
	</code>
	 */

	/**
	 * container object, list
	 * @param o
	 * @param l
	 * @return
	 * @inner
	 * @ignore
	 */
	function menu_creater(o, l) {

	};



	//	===================================================

	var

		//	class private	-----------------------------------


		/*	可紀錄的 set class name，不過對大多數人來說，更常用的是 instance.setClassName
		
		usage:
		(item[, obj])		set obj to className item, return real className that assigned
		(0,'prefix')	set prefix & 重設（全部重跑）
		*/
		setClassName = function (i, o, noRec) {	//	(0, prefix) or (item, object)
			var _t = this, s = _.classNameSet;
			if (!_t.assignedClass) _t.assignedClass = [];

			if (!o || typeof o === 'object') {
				//	設定並回傳 className
				library_namespace.debug('setClassName: test ' + 'class_' + i + ': ' + ('class_' + i in _t ? '<em>YES</em>' : 'none'), 2);
				s = [i in s ?
					s[i].charAt(0) === '~' ? s.prefix + s[i].slice(1) :
						s[i] :
					''
				];
				if ('class_' + i in _t)
					if (i === 'error' || i === 'warning') s.unshift(_t['class_' + i]);
					else s.push(_t['class_' + i]);
				s = s.join(' ');
				library_namespace.debug('setClassName: set ' + o + (s ? ' to [' + s + ']' : ', <em>There is no [' + i + '] in classNameSet or instance set.</em>'), 2);
				if (o && (o.className = s, !noRec))
					_t.assignedClass.push(s, o);
				return s;
			}

			s.prefix = o;
			o = _t.assignedClass;
			//	重設（全部重跑）
			for (var i = 0; i < o.length; i++)
				_f.call(_t, o[0], o[1], 1);
		},

		funcButton = function (_t, t, f, title) {	//	add text t, function f to instance _t
			var _p = pv(_t), o = create_DO('span', _p.listO, '['), b;
			setClassName.call(_t, 'functionB', o);
			b = create_DO('span', o, t);
			setClassName.call(_t, 'functionT', b);
			b.title = title, b.onclick = f;
			create_DO(0, o, ']');
			return b;
		},

		//	簡易型
		removeAllChild = function (o) {
			o.innerHTML = '';
			return o;
		},

		//	show/hide list
		showList = function (show) {	//	():get, 0:hide, 1:show
			var _t = this, _p = pv(_t), o = _p.listO, s, c = 0;

			if (!o) return;
			s = o.style;
			if (show) {
				c = get_node_offset(_p.inputO);
				s.top = c.top + c.height + 2 + 'px';
				s.left = c.left + 'px';

				s.width = c.width + 'px';
				s.height = '';	//	reset
				c = s.display = 'block';
				if (_t.maxListHeight && o.offsetHeight > _t.maxListHeight)
					s.height = _t.maxListHeight + 'px';
			} else if (typeof show != 'undefined')
				c = s.display = 'none';

			if (c)
				create_DO(0, removeAllChild(_p.arrowO), _.textSet[c != 'none' ? 'hideList' : 'showList']);
			else c = s.display;

			return c != 'none';
		},


		/*	準備選擇清單的某一項
		TODO:
		自動完成
		到最後若可能自動轉到全部
		→
		*/
		cK = 0,	//	control key pressed
		readyTo = function (e, o) {
			if (!e) e = event;
			var _t = this, _p = pv(_t), c, gI = function (o) {
				return o &&
					//(can_use_special_attribute ? o.getAttribute("sIndex") : o.sIndex)
					o.sIndex;
			};
			library_namespace.debug('readyTo: ' + e.type + ', key: ' + (e.keyCode || e.which || e.charCode) + ', _p.listA: ' + (_p.listA && _p.listA.length), 2);

			if (!_p.listA || !_p.listA.length) return;

			if (e.type === 'mouseover' || e.type === 'mouseout') {
				if (_p.readyItem) setClassName.call(_t, 'item', _p.readyItem, 0);
				if (e.type === 'mouseover') c = 'item_select', _p.readyItem = o;
				else if (c = 'item', _p.readyItem === o) _p.readyItem = 0;
				//	需更改 _p.inputO.onkeyup 以防止重新 list!!
			} else if ((c = e.keyCode || e.which || e.charCode) === 13) {
				if (_p.readyItem) {
					library_namespace.debug('readyTo: 以鍵盤選擇: ' + _p.readyItem.innerHTML, 4);
					cK = c, _p.readyItem.onclick();	//	用 .click() 無效!
					return false;
				} else return;
				//	key input 用鍵盤控制上下	←↑→↓: 37~40
			} else if (c == 38 || c == 40) {
				cK = c;
				o = _p.readyItem;
				library_namespace.debug('readyTo: 以鍵盤移至: ' + (o && (o.getAttribute("sIndex") + ',' + o.sIndex)), 4);
				if (!o) o = _p.listA[c == 40 ? 0 : _p.listA.length - 1];
				else {
					//	IE 可用 getAttribute，FF 或許在 appendChild 之後屬性重設?，得用 o.sIndex
					if (!o.getAttribute) throw 1;
					c = gI(o) + (c == 38 ? -1 : 1);
					if (c < 0 || c >= _p.listA.length) return;

					setClassName.call(_t, 'item', o, 0);
					o = _p.listA[c];
				}
				_p.readyItem = o;

				scroll_to_show(o, _p.listO);
				c = 'item_select';
			} else if (c == 35 || c == 36) {	//	35: End, 36: Home
				cK = c;
				if (o = _p.readyItem) setClassName.call(_t, 'item', o, 0);
				_p.readyItem = o = _p.listA[c == 36 ? 0 : _p.listA.length - 1];
				scroll_to_show(o, _p.listO);
				c = 'item_select';
			} else if (c == 33 || c == 34) {	//	33: PageUP, 34: PageDown
				cK = c;
				o = _p.readyItem;
				if (!o) return;
				setClassName.call(_t, 'item', o, 0);
				var i = gI(o), t;
				if (c == 33) {
					t = _p.listO.scrollTop - 1;
					while (i && _p.listA[i - 1].offsetTop > t) i--;
				} else {
					t = _p.listO.scrollTop + _p.listO.offsetHeight - scrollbar_width();
					while (i < _p.listA.length - 1 && _p.listA[i + 1].offsetTop < t) i++;
				}
				library_namespace.debug('readyTo: Page: ' + i + ', top: ' + t + ', scroll: ' + _p.listO.scrollTop, 4);
				if (i == gI(o))
					if (c == 33) {
						t -= _p.listO.offsetHeight;
						if (t < 2) i = 0;
						else while (i && _p.listA[i - 1].offsetTop > t) i--;
					} else {
						t += _p.listO.offsetHeight;
						while (i < _p.listA.length - 1 && _p.listA[i + 1].offsetTop < t) i++;
					}
				library_namespace.debug('readyTo: Page: ' + i + ', top: ' + t + ', height: ' + _p.listO.offsetHeight, 4);
				_p.readyItem = o = _p.listA[i];
				scroll_to_show(o, _p.listO);
				c = 'item_select';
			} else return;

			setClassName.call(_t, c, o, 0);
			return false;
		},

		//can_use_special_attribute,

		//	顯示清單的工具函數
		setList = function (l, force, limit, f) {
			var _t = this, _p = pv(_t), i, c = 0, k, o;
			if (isNaN(limit)) limit = isNaN(_t.maxList) ? _.maxList : _t.maxList || Number.MAX_VALUE;
			if (!f) f = function (l, i) {
				var a = _t.onList(l, i), o;
				if (!a) return;
				// a[0] 可能是 Array 之類。
				o = create_DO('div', 0, String(a[0]));
				setClassName.call(_t, 'item', o);
				o.title = a[1];
				k = a[2] || a[1];
				o.onmouseover = o.onmouseout = function (e) { readyTo.call(_t, e, o); };
				o.onclick = function () { var v = _t.onSelect(l, i); _t.setValue(v); _t.onInput(v); };

				//	這邊本來放在下面 for 的地方
				c++, _p.listO.appendChild(o);
				//if (!can_use_special_attribute) { o.setAttribute("sIndex", 1); can_use_special_attribute = o.getAttribute("sIndex") ? 1 : -1; }
				//if (can_use_special_attribute == 1) o.setAttribute("sIndex", _p.listA.length); else o.sIndex = _p.listA.length;

				//o.setAttribute("sIndex", o.sIndex = _p.listA.length);
				o.sIndex = _p.listA.length;

				_p.listA.push(o);

				return o;
			};

			//_t.showList(0);

			_p.listO = removeAllChild(_p.listO);
			_p.listA = [];
			_p.readyItem = 0;
			if (Array.isArray(l)) {
				for (i = 0; i < l.length && c < limit; i++)
					f(l, i);
			} else
				for (i in l)
					if (c < limit) {
						f(l, i);
					} else break;

			library_namespace.debug('setList: list ' + c + ' items, key ' + k + '=?' + _t.setValue(), 2);
			if (c == 1 && _t.setValue() == k) {
				//	僅有一個且與 key 相同
				c = 0;
			}
			if (!force && !c) {
				//	無 list
				return;
			}

			//	add function
			if (c != _t.allListCount) funcButton(_t, _.textSet.allBtn, function () { _t.doFunc = 1; _t.focus(); _t.setList(_t.setAllList(), 1, Number.MAX_VALUE); }, '顯示全部 ' + _t.allListCount + ' 列表。');
			if (_t.setValue()) funcButton(_t, _.textSet.clearBtn, function () { _t.doFunc = 2; _t.focus(); _t.onInput(_t.setValue('')); }, '清除輸入內容，重新列表。');
			funcButton(_t, _.textSet.closeBtn, function () { _t.doFunc = 3; _t.showList(0); }, 'close menu \n關閉列表');

			showList.call(_t, 1);
			return _t.listCount = c;
		},

		//	return verify 之後的 key(<input>) 值
		do_verify = function (k) {
			var _t = this, c = _t.verify(k || _t.setValue());
			library_namespace.debug('do_verify: input status: ' + (c == 1 ? 'warning' : c == 2 ? 'error' : 'OK'), 2);

			if (typeof c === 'string') {
				//	可以設定 key 值！
				k = c;
				_t.setValue(k, do_verify);
			} else {
				setClassName.call(_t, c == 1 ? 'warning' : c == 2 ? 'error' : 'input', pv(_t).inputO, 1);
			}

			return k;
		},

		//	簡易設定常用的 onInput 型式
		searchInList = function (f, o) {	//	o: 傳入 (list, index, key)
			var _t = this;
			if (typeof f === 'string' && (f in _.searchFunctionSet)) f = _.searchFunctionSet[f];

			//	因為允許傳入 list，所以不能在這邊用 _t.setAllList() 判別函數，而得要寫一個泛用的。
			return _t.onInput = function (key, list, force) {
				library_namespace.debug('searchInList, onInput: search [' + key + '] use ' + f, 2);

				if (!list) list = _t.setAllList();
				key = do_verify.call(_t, key || '');

				var l, i;

				library_namespace.debug('searchInList: search ' + (list instanceof Array ? 'array' : 'object'), 2);
				if (Array.isArray(list)) {
					l = [];//new list.constructor();
					for (i = 0; i < list.length; i++)
						if (o ? f(list, i, key) : list[i] && f(list[i], key)) l.push(list[i]);	//	search value
				} else {
					l = {};
					for (i in list)
						if (o ? f(list, i, key) : i && f(i, key) || list[i] && f(list[i], key)) l[i] = list[i];	//	search key+value
				}
				_t.setList(l, force);
			};

		},


		/**
		 * 切換 [input] / inputted [span]
		 * @param {Boolean|undefined} to_input	切換至 input or not. default: 切換至 [input]
		 * @return
		 * @private
		 * @inner
		 * @ignore
		 */
		toggleToInput = function (to_input) {
			var _t = this, _p = pv(_t);
			if (to_input || typeof to_input === 'undefined') {
				//	to <input>
				_p.inputtedO.style.display = 'none';
				if (_t.allListCount)
					_p.arrowO.style.display = 'inline';
				_p.inputO.style.display = 'inline';
				return 1;
			} else {
				//	to inputted <span>
				_t.showList(0);
				_t.setInputted();

				if (to_input = library_namespace.get_style
					&& parseInt(library_namespace.get_style(_p.inputO, 'width'))) {
					//library_namespace.debug(to_input);
					//	TODO: +16, +10: magic number
					try {
						//	.get_style(_p.arrowO, 'width') 可能回傳 'auto' @ IE8
						_p.inputtedO.style.width = (to_input + parseInt(library_namespace.get_style(_p.arrowO, 'width')) + 16) + 'px';
						_p.inputtedO.style.height = (parseInt(library_namespace.get_style(_p.inputO, 'height')) + 10) + 'px';
					} catch (e) {
						// TODO: handle exception
					}
				}

				_p.arrowO.style.display = _p.inputO.style.display = 'none';
				if (!_p.inputtedO.innerHTML)
					_p.inputtedO.innerHTML = '&nbsp;';

				//_p.inputtedO.style.border = '3px #aaa dotted';
				_p.inputtedO.style.display = to_input ? 'inline-block' : 'inline';
			}
		},

		//	TODO: http://blog.xuite.net/sugopili/computerblog/17695447
		set_source = function (URL) {
			;
		},

		/*	配置元件
		
		本函數會配置/增加:
		<div>		.container
			<input>	.inputO
			<span>	.inputtedO
			<span>	.arrowO
			<div>	.listO
		
		arguments:
		<input> 會被當作 inputO 主元件
		<select> 會被當作選項
		others: container
		*/
		layout = function (o) {
			var _t = this, _p = pv(_t), t;

			if (typeof o !== 'object')
				o = document.getElementById(o);

			if (!o || (o.tagName.toLowerCase() in { hr: 1, br: 1 })) return;	//	** 這邊應該檢查 o 是不是 <hr /> 等不能加 child 的！

			//library_namespace.debug(('layout: use <' + o.tagName + (o.id ? '#' + o.id : '') + '>: ' + o.innerHTML).replace(/</g, '&lt;'));

			//	TODO: 這邊應該有一個更完善的刪除策略
			if (_t.loaded) {
				t = _p.container;
				//	不必多做功，已經達到所需配置了。
				if (t === o.parentNode) return;
				for (var i = 0, e = 'inputO,inputtedO,arrowO,listO'.split(','); i < e.length; i++) {
					library_namespace.debug('layout: removeChild ' + e[i]);
					//t.removeChild(_p[e[i]]);
					_p[e[i]].parentNode.removeChild(_p[e[i]]);
				}
				if (!t.childNodes.length) t.parentNode.removeChild(t);
			}


			//	依照各種不同的傳入 object 作出應對
			t = o.tagName.toLowerCase();

			if (t === 'input') {

				try {
					//	http://www.w3.org/TR/html5/forms.html#the-pattern-attribute
					//	http://www.whatwg.org/specs/web-apps/current-work/#attr-input-pattern
					//	http://www.w3school.com.cn/html5/html5_input.asp
					t = o.pattern ||
						//o.getAttribute&&
						o.getAttribute('pattern');
					//	compiled as a JavaScript regular expression with the global, ignoreCase, and multiline flags disabled
					//	somewhat as if it implied a ^(?: at the start of the pattern and a )$ at the end
					if (t && (t = new RegExp('^(' + t + ')?$'))) {
						//library_namespace.debug('set verify pattern of [' + o.id + ']: ' + t);
						_t.set_verify(t);
					}
				} catch (e) {
					library_namespace.error('error pattern: [' + t + ']');
					library_namespace.error(e);
				}

				o.parentNode.insertBefore(
					t = _p.container = create_DO('span'),
					_p.inputO = o
				);
				setClassName.call(_t, 'container', t);

				if (!o.className) setClassName.call(_t, 'input', o);

				t.appendChild(o.parentNode.removeChild(o));

				o = t;

			} else if (t === 'select') {
				o.parentNode.insertBefore(t = _p.container = create_DO('span'), o);

				_p.inputO = create_DO('input', t);
				setClassName.call(_t, 'input', _p.inputO);
				_p.inputO.name = o.name;
				if (o.selectedIndex >= 0) _p.inputO.value = o.options[o.selectedIndex].value;

				var l = {}, opt = o.options, i = 0;
				for (; i < opt.length; i++)
					l[opt[i].value || opt[i].innerHTML] = opt[i].innerHTML;

				//	list setting
				_t.setAllList(l);

				o.parentNode.removeChild(removeAllChild(o));

				o = t;

			} else {
				//	容器
				_p.container = o;
				if (!o.className) setClassName.call(_t, 'container', o);

				_p.inputO = create_DO('input', o);
				setClassName.call(_t, 'input', _p.inputO);

			}


			//	補足其他的設定
			_p.inputO.setAttribute("autocomplete", "off");

			_p.inputtedO = create_DO('span', o);
			setClassName.call(_t, 'inputted', _p.inputtedO);
			_p.inputtedO.style.display = 'none';

			_p.inputtedO.onclick = function () {
				_t.clickNow = 1;
				_t.toggleToInput();
				_p.inputO.focus();
				_t.clickNow = 0;
			};

			(_p.arrowO = create_DO('span', o, _.textSet.showList))
				.title = _.textSet.arrowTitle;
			setClassName.call(_t, 'arrow', _p.arrowO);

			_p.listO = create_DO('div', o);
			_p.arrowO.onmouseover = _p.listO.onmouseover = function () { _t.clickNow = 1; };
			_p.arrowO.onmouseout = _p.listO.onmouseout = function () { _t.clickNow = 0; };
			setClassName.call(_t, 'list', _p.listO);
			_t.showList(0);


			// event setting
			//_p.inputO.onmouseover =
			_p.inputO.onkeydown = function (e) { readyTo.call(_t, e); };
			_p.inputO.onmouseup = _p.inputO.onkeyup = _p.inputO.ondragend = function (e) {
				if (!e) e = event;
				var c = e.keyCode || e.which || e.charCode;
				library_namespace.debug('up: ' + e.type + ', key: ' + c + ', _p.listA: ' + (_p.listA && _p.listA.length), 2);
				if (cK && cK == c) { cK = 0; return false; }
				//	Esc
				if (c == 27) { _t.showList(0); return false; }
				_t.clickNow = 1; _t.onInput(_t.setValue());
			};
			_p.inputO.onmouseout = function () { _t.clickNow = 0; };
			if (_p.inputO.addEventListener) _p.inputO.addEventListener('dragdrop', _p.inputO.ondragend, false);
			//if (window.addEventListener) window.addEventListener('click', function () { _t.showList(0); }, true);
			//addListener(0, 'click', function () { sl('close..'); _t.showList(0); sl('close done.'); })
			_p.inputO.onblur = function () {
				//	這在 Firefox 似乎沒啥效果..
				//if (_t.verify(_t.setValue()) == 2) { alert('Wrong input!'); return false; }

				/*	設定這項在按 _p.arrowO 的時候會出問題，所以建議在其他地方自訂。
				if (_t.setValue() && (_t.setValue() in _t.setAllList()))
					_t.toggleToInput(0);
				*/

				//	TODO: 假如以鍵盤離開，應該也 showList(0);
				//library_namespace.debug('clickNow=' + _t.clickNow, 1, '_p.inputO.onblur');
				if (_t.clickNow) _t.clickNow = 0;
				else _t.showList(0);
			};

			//	show/hide by press arrow
			_p.arrowO.onclick = function () {
				library_namespace.debug('arrowO.onclick start', 3);
				_t.clickNow = 1;
				if (_t.showList())
					//	正在顯示就把他關起來
					_t.showList(0);
				else
					//	沒在顯示就把他開起來: setValue 設定完 list，onInput 模擬 key-down
					_t.onInput(_t.setValue(), 0, 1);
				_t.clickNow = 0;
				library_namespace.debug('arrowO.onclick end', 3);
			};
			// ondblclick: double click
			//_p.inputO.ondblclick = function () { _t.onInput(_p.inputO.value, 0, 1); };


			_t.loaded = 1;	//	isLoaded

		},

		//	instance constructor	---------------------------
		instanceL = [],
		initI = function (o, l, s) {	//	(HTML object, list: Array or Object, onInput handler)
			var _t = this, _p;
			// objects setting
			if (typeof o != 'object') {
				//library_namespace.debug('Use object [' + o + ']');
				o = document.getElementById(o);
			}

			_p = pv(_t);	//	also do initial
			instanceL.push(_t);	//	for destructor

			if (o) {
				layout.call(this, o);
			} else if (false) {
				throw new Error(1, 'Cannot get document object' + (o ? ' [' + o + ']' : '') + '!');
				return;
			}

			//	list setting
			if (l && !_t.allListCount) _t.setAllList(l);

			if (_p.arrowO)
				_p.arrowO.style.display = _t.allListCount ? 'inline' : 'none';	//	無 list 的話先不顯示，等有 list 再說。

			//	setup default inputted value
			_t.dInputted = _t.setValue;

			if (s)
				_t.setSearch(s);
			//return _t;
		};


	//===================================================

	/**<code>
	
	_ = this
	
	TODO:
	浮水印 background-image:url();
	
	
	HISTORY:
	2008/7/22 0:38:14	create
	7/27 22:55:18	verify()
	8/7 21:18:47	attach()
	</code>*/
	/**
	* 提供有選單的  input
	* @class	form 的 functions
	* @see
	* http://dojocampus.org/explorer/#Dijit_Form%20Controls_Filtering%20Select_Basic
	*/
	var _// JSDT:_module_
		= function () { initI.apply(this, arguments); typeof load_arguments === 'function' && load_arguments.apply(this, arguments); },

		//	(instance private handle)	不要 instance private 的把這函數刪掉即可。
		_p = '_' + (Math.random() + '').replace(/\./, ''),
		//	get private variables (instance[,destroy]), init private variables (instance[,access function list[, instance destructor]])
		pv = function (i, d, k) { var V, K = _p('k'); return arguments.callee.caller === _p('i') ? (V = _p(i[K] = _p()), V.O = i, V.L = {}) : (K in i) && (V = _p(i[K])) && i === V.O ? d ? (_p(i[K], 1), delete i[K]) : V.L : {}; };

	//	(for inherit)	不要 inherit 的把這段刪掉即可。
	//(_.clone = arguments.callee).toString = function () { return '[class_template]'; };


	//	class destructor	---------------------------
	/**<code>
	please call at last (e.g., window.unload)
	
	// usage:
	classT = classT.destroy();
	// or if you has something more to do:
	classT.destroy() && classT= null;
	</code>*/

	_.destroy = function () { for (var i = 0; i < instanceL.length; i++)instanceL[i].destroy(); _p(); };

	//	(instance private handle, continue)
	eval('_p=(function(_,pv,initI){var ' + _p + '={a:pv,d:_.destroy,c:0,k:"+pv+' + Math.random() + '",i:initI};return function(i,d){var f=arguments.callee.caller;if(f===' + _p + '.a){if(!d)return i in ' + _p + '?' + _p + '[i]:(' + _p + '[i=' + _p + '.c++]={},i);' + _p + '[i]={};}if(f===' + _p + '.d)' + _p + '={};}})(_,pv,initI);');
	_p.toString = function () { return ''; };


	/**<code>
	//	測試是否可用自訂之屬性
	var o = document.createElement('div');
	o.setAttribute('testA', 2);
	can_use_special_attribute = o.getAttribute('testA');
	sl('can_use_special_attribute: ' + can_use_special_attribute);
	</code>*/

	//	class public interface	---------------------------


	//	預設清單最大顯示數
	_.maxList = 10;


	//	searchInList 常用到的函數
	_.searchFunctionSet = {
		allTheSame: function (i, k) {
			return (i + '') === k;
		},
		startWith: function (i, k) {
			return (i + '').slice(0, k.length) === k;
		},
		//	不管大小寫 Whether the case
		startWithWC: function (i, k) {
			return (i + '').slice(0, k.length).toLowerCase() === k.toLowerCase();
		},
		includeKey: function (i, k) {
			return (i + '').toLowerCase().indexOf(k.toLowerCase()) !== -1;
		},
		includeKeyWC: function (i, k) {
			return (i + '').toLowerCase().indexOf((k + '').toLowerCase()) !== -1;
		},
		always: function () {
			return true;
		}
	};


	//	預設 className	前有 ~ 的會轉成 prefix
	_.classNameSet = {
		prefix: 'si_',
		container: '~container',
		input: '~input',
		inputted: '~inputted',
		arrow: '~arrow',
		list: '~list',
		item: '~item',
		item_select: '~item_select',
		functionB: '~function',

		functionT: '~functionText',
		error: '~error',
		warning: '~warning'
	};


	//	預設顯示文字
	_.textSet = {
		showList: '▼',	//	4 way: [▴▸▾◂]
		hideList: '▲',
		arrowTitle: 'toggle list \n切換顯示查詢列表',

		allBtn: '全部',
		clearBtn: '清除',
		closeBtn: '關閉'//'×'
	};


	//	default 欄位驗證 pattern
	//	http://blog.wu-boy.com/2009/06/16/1454/
	//	TODO: ID, Age, 電話, 地址, 性別, ...
	//	TODO: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/pattern
	_.default_verify_pattern = {
		'|word': /^\w*$/,
		'word': /^\w+$/,
		//	整數
		'|integer': /^(?:[+\-]\d)?\d*$/,
		'integer': /^[+\-]?\d+$/,
		//	自然數
		'|natural': /^(?:[1-9]\d*)?$/,
		'natural': /^[1-9]\d*$/,
		//	十進位小數
		'|decimal': /^(?:[+\-]\d)?\d*(\.\d+)?$/,
		'decimal': /^[+\-]?(?:\d+|\d*\.\d+)$/,
		//	數字
		'|digit': /^\d*$/,
		'digit': /^\d+$/,

		IPv4: /^[12]?\d{1,2}\.[12]?\d{1,2}\.[12]?\d{1,2}\.[12]?\d{1,2}$/,

		URI: function (k) {
			//return !!library_namespace.URI(k);
			try {
				return !!new URL(k);
			} catch (e) { }
		},

		//	RFC 2822
		//	http://regexlib.com/DisplayPatterns.aspx
		//'RFC2822' : /^(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/,
		//	http://www.regular-expressions.info/email.html
		//'email' : /^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+([a-z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b$/i,
		email: /^[a-z0-9+_~-]+(\.[a-z0-9+_~-]+)*@([a-z\d]([a-z\d-]*[a-z\d])?\.)+([a-z]{2}|com|org|net)\b$/i,

		any: function (k) { return k === '' ? 2 : 0; }
	};

	_.prototype = {
		//	應該盡量把東西放在 class，instance少一點？

		//	instance public interface	-------------------


		/*	click 事件進行中
		TODO:
		用更好的方法取代
		*/
		clickNow: 0,

		//	instance 的 <input>,.. 之 className, override _.classNameSet.input,..
		//class_input : '~',
		//class_item : '~',
		//..

		//maxList : \d,

		//	預設清單 height (px)
		maxListHeight: 200,


		//	設定/取得所有可選的 list
		setAllList: function (l) {
			var _t = this, _p = pv(_t), i, c = 0, s = _p.arrowO;
			_t.showList(0);
			if (typeof l === 'object') {
				_p.list = l;
				if (Array.isArray(l)) {
					//	這不準，得用 onList 測試。
					c = _t.allListCount = l.length;
				} else { for (i in l) c++; _t.allListCount = c; }
				library_namespace.debug('setAllList: Get about ' + _t.allListCount + ' items.', 2);
				if (s)
					if (s = s.style, !c) s.display = 'none';
					else if (_t.autoShowArrow) s.display = '';
			}
			return _p.list;
		},
		//	自動於有 list 時 show arrow，無時 hide
		autoShowArrow: 0,

		//	設定要顯現的 list，會回傳 list，需注意可能被更改！
		setList: function (l) {	//	key
			return setList.apply(this, arguments);
		},

		showList: function (show) {
			return showList.apply(this, arguments);
		},

		/*
		showArrow: function (show) {
			var a = pv(this).arrowO.style;
			if (typeof show != 'undefined') a.display = show ? '' : 'none';
			return a.display;
		},
		*/

		//	每次 input 就會被 call 一次。可用 instance.setSearch('includeKey') 簡易設定
		onInput: function (k) {	//	key
		},

		//	設定表單文字欄位的欄位驗證	return 1: warning, 2: error ('Suffering from a pattern mismatch'), string: 將輸入改為回傳值, else OK
		//	另外可設定 onkeypress(){return true/false;} 來對每一次按鍵作 check。但這不能處理 paste。	http://irw.ncut.edu.tw/peterju/jscript.html#skill
		verify: function (k) {	//	key
		},

		set_verify: function (v) {
			var m = _.default_verify_pattern;
			if (library_namespace.is_Object(m) && (v in m))
				v = m[v];

			if (library_namespace.is_RegExp(v))
				this.verify = function (k) {
					return v.test(k) ? 0 : 2;
				};
			else if (typeof v === 'function')
				this.verify = v;
			else if (typeof v === 'string' && (m = v.match(/^(\d*)-(\d*)$/)) && (m[1] || m[2]))
				this.verify = new Function('k', 'return isNaN(k)' + (m[1] ? '||k<' + m[1] : '') + (m[2] ? '||k>' + m[2] : '') + ' ? 2 : 0;');
			else
				library_namespace.error('error verify condition of [' + pv(this).inputO.id + ']: [' + v + ']');

			return this;
		},

		//	input: (list, index), return [value, title[, key=title||value]]
		onList: function (l, i) {
			return [l[i] || i, Array.isArray(l) ? l[i] : i];
		},

		//	input: (list, index), return value to set as input key
		onSelect: function (l, i) {
			return Array.isArray(l) ? l[i] : i;
		},

		/*	searchInList 的減縮版
		_.searchInList.call(_instance_, 'includeKey');
		eq
		_instance_.setSearch('includeKey');
		*/
		setSearch: function (f) {
			return searchInList.call(this, f);
		},

		setClassName: function (n) {
			var t = this;
			if (n) t.class_input = t.class_error = t.class_warning = n;
			else if (typeof n != 'undefined') { delete t.class_input; delete t.class_error; delete t.class_warning; }
			return setClassName.call(this, 'input', pv(this).inputO);
		},


		setProperty: function (p, v) {
			var i = pv(this).inputO;
			library_namespace.debug('setProperty: ' + p + '=' + i[p] + '→' + v, 3);
			if (typeof v != 'undefined' && v != null) i[p] = v;
			return i[p];
		},

		//	set/get input value
		setValue: function (v, caller) {
			if (arguments.length > 0)
				this.toggleToInput();
			//library_namespace.log('setValue: ' + this.setProperty('value', v));
			v = this.setProperty('value', v);
			//library_namespace.log('setValue: ' + v);
			if (arguments.length > 0 && caller !== do_verify) {
				//library_namespace.log('setValue: call do_verify(' + v + '), list: [' + this.allListCount + ']' + this.setAllList());
				do_verify.call(this, v);
			}
			return v;
		},

		//	set inputted value: 轉換成輸入過的 <span> 時，設定其之值。
		setInputted: function (v) {
			var _p = pv(this), i = _p.inputO;
			if (typeof v === 'undefined') v = this.dInputted();	//	dInputted: default inputted value, ===setValue
			create_DO(0, removeAllChild(_p.inputtedO), v);
			return v;
		},

		setMaxLength: function (l) {
			library_namespace.debug('setMaxLength: set length ' + (l > 0 ? l : null), 3);
			return this.setProperty('maxLength', l > 0 ? l : null);
		},

		setName: function (n) {
			this.setProperty('id', n);
			return this.setProperty('name', n);
		},

		setTitle: function (t) {
			if (t) pv(this).inputtedO.title = t;
			return this.setProperty('title', t || null);
		},

		//	切換 inputted span/input
		toggleToInput: function () {
			return toggleToInput.apply(this, arguments);
		},


		/*
			for Unobtrusive JavaScript: 為未啟用JavaScript的情況提供替代方案。
			接上 <input> 或 <select>
		*/
		attach: function (o) {	//	(input or select object)
			library_namespace.debug('attach: ' + o, 4);
			//o.replaceNode(_p.inputO);
			o = layout.call(this, o);
			this.setAllList(this.setAllList());
			return o;
		},


		//	(focus or blur, 不驅動 onfocus/onblur)
		focus: function (f) {	//	,noE
			var i = pv(this).inputO;
			if (false) {
				sl('focus: ' + (f ? 'focus' : 'blur') + (noE ? ' and no event' : ''));
				if (f || typeof f === 'undefined') {
					if (noE) noE = i.onfocus, i.onfocus = null;
					i.focus();
					//if(noE)i.onfocus = noE;
				} else {
					if (noE) noE = i.onblur, i.onblur = null; else this.showList(0);
					i.blur();
					//if(noE)i.onblur = noE;
				}
			}
			if (f || typeof f === 'undefined')
				try {
					//	@IE5-8 initial:  Error @CeL: 2110 [Error] (facility code 10): 控制項不可見、未啟動或無法接受焦點，因此無法將焦點移到控制項上。
					//	Error @CeL: 2110 [Error] (facility code 10): Can't move focus to the control because it is invisible, not enabled, or of a type that does not accept the focus.
					i.focus();
				} catch (e) { }
			else
				this.showList(0),
					i.blur();
		},


		//	instance destructor	---------------------------
		/*
		// usage:
		instance = instance.destroy();
		// or if you has something more to do:
		instance.destroy() && instance = null;
		*/
		destroy: function () {
			pv(this, 1);
		}

	};	//	_.prototype=


	//	===================================================


	//	prevent re-use. 防止再造 
	//delete _.clone;

	//_.allow_inherit = true;



	return (
		_// JSDT:_module_
	);
}
