/**
 * @name CeL function for poker calculations.
 * @fileoverview 本檔案包含了撲克牌演算用的功能。
 * 
 * @see https://en.wikipedia.org/wiki/Poker
 * 
 * @since 2015/11/19 17:16:35
 */

'use strict';

// ------------------------------------------------------------------------------------------------------------------//

if (typeof CeL === 'function')
	CeL.run({
		name : 'application.poker',
		require : 'data.code.compatibility.|data.native.',

		code : function(library_namespace) {

			// ------------------------------------------------------------------------------------------------------//

			var
			/** {RegExp}判斷輸入 Poker_cards() 之撲克牌牌面表達規則。 */
			PATTERN_poker_card = /(10?|[2-9TJQKA])([SHDC♠♥♦♣])/g,

			/**
			 * 各點數 index 值之名稱。
			 * 
			 * 0–12. 0:2, 1:3, ...<br />
			 * 7:9, 8:10, 9:Jack, 10:Queen, 11:King, 12:Ace
			 * 
			 * @type {Array}
			 */
			value_name = '234567891JQKA'.split(''),
			/** {Object}各點數之 index 值。 */
			value_index = Object.create(null),
			/** {Array}各花色 index 值之名稱。 */
			suit_name = '♠♥♦♣'.split(''),
			/** {Object}各花色之 index 值。 */
			suit_index = Object.create(null),

			/** {Object}各牌型之基礎配分。 */
			category_score = {
				'High Card' : 100,
				'One Pair' : 200,
				'Two Pairs' : 300,
				'Three of a Kind' : 400,
				'Straight' : 500,
				'Flush' : 600,
				'Full House' : 700,
				'Four of a Kind' : 800,
				'Straight Flush' : 900,
				'Royal Flush' : 1000
			};

			// [10 - 2]: 1 → 10
			value_name[10 - 2] += 0;
			value_name.forEach(function(name, index) {
				value_index[name] = index;
			});
			value_index[1] = value_name.indexOf('A');
			// Ten
			value_index['T'] = value_name.indexOf('10');

			function set_suit_index(names) {
				if (typeof names === 'string')
					names = names.split('');
				names.forEach(function(name, index) {
					suit_index[name] = index;
				})
			}

			set_suit_index(suit_name);
			set_suit_index('SHDC');

			// ----------------------------------------------------------------

			/**
			 * parse poker card.
			 * 
			 * @param {String}hand
			 *            card 牌面。
			 * @param {Array}values
			 *            value array
			 * @param {Array}suits
			 *            suit array
			 */
			function parse(hand, values, suits) {
				var matched;
				hand = hand.toUpperCase();
				while (matched = PATTERN_poker_card.exec(hand)) {
					values.push(value_index[matched[1]]);
					suits.push(suit_index[matched[2]]);
				}
			}

			// ----------------------------------------------------------------

			/**
			 * poker cards handler.
			 * 
			 * @param {String}hand
			 *            cards 牌面。
			 * 
			 * @constructor
			 */
			function Poker_cards(hand) {
				var values = this.values = [], suits = this.suits = [];
				if (hand.forEach) {
					hand.forEach(function(card) {
						parse(card, values, suits);
					});
				} else if (typeof hand === 'string') {
					parse(hand, values, suits);
				}
			}

			function to_Array() {
				return this.values.map(function(value, index) {
					return value_name[value] + suit_name[this.suits[index]];
				}, this);
			}

			function toString() {
				return this.to_Array().join(' ');
			}

			function consecutive() {
				var values = this.values;
				return values.combines_AP('consecutive')
				// 同花順和順子中A如果配上2345時當做1點
				|| values.includes(12) && values.map(function(value) {
					return value === 12 ? -1 : value;
				}).combines_AP('consecutive');
			}

			// ----------------------------------------------------------------

			// five-card deal 牌型
			// TODO: get specified category
			function category(get_rank) {
				function category_name(name) {
					var score = 0;
					if (high_card && high_card.length > 0) {
						if (get_rank && high_card.length === 1)
							// 只有一張時，直接將之配入 score，也無須登記 high_card 了。
							score = high_card[0];
						else
							_this.high_card = high_card;
					}
					// card rank
					return get_rank ? category_score[name] + score : name;
				}

				var suits = this.suits;
				if (this.suits.length !== 5)
					return;

				suits.max = suits.frequency(1);
				var max_suit = suits.max.value,
				//
				max_suit_count = suits.max.count,
				//
				values = this.values, max_value = Math.max.apply(null, values);
				// console.log(suits.max);

				if (max_suit_count === 5 && this.consecutive()) {
					if (max_value === 12)
						return category_name('Royal Flush');
					high_card.push(max_value);
					return category_name('Straight Flush');
				}

				values.max = values.frequency(1);
				var value, value_frequency = values.max,
				// Hands are ranked first by category, then by individual card
				// ranks
				// 這邊僅列出需要比較之點數，由小至大由後比起。
				// assert: 同種牌型具有相同的 high_card.length
				high_card = [], _this = this,
				//
				max_of_a_kind = value_frequency.count,
				//
				most_frequency_value = value_frequency.value;
				// console.log(value_frequency);

				if (max_of_a_kind === 4) {
					for (value in value_frequency.hash)
						if (+value !== most_frequency_value) {
							high_card.push(+value);
							// 應該就只有這一張。
							break;
						}
					high_card.push(most_frequency_value);
					return category_name('Four of a Kind');
				}

				if (max_of_a_kind === 3) {
					for (value in value_frequency.hash)
						if (+value !== most_frequency_value) {
							if (value_frequency.hash[value] === 2) {
								// [3,2]。
								high_card.push(+value, most_frequency_value);
								return category_name('Full House');
							}
							// 應該為 'Three of a Kind', [3,1,1]。
							break;
						}
				}

				if (max_suit_count === 5) {
					high_card = values.clone().sort();
					return category_name('Flush');
				}

				if (this.consecutive()) {
					high_card.push(most_frequency_value);
					return category_name('Straight');
				}

				if (max_of_a_kind === 3) {
					// assert: [3,2] 已經在 'Full House' 處理過了，
					// 因此此處應該為 [3,1,1]。
					for (value in value_frequency.hash)
						if (+value !== most_frequency_value) {
							high_card.push(+value);
						}
					high_card.push(most_frequency_value);
					return category_name('Three of a Kind');
				}

				if (max_of_a_kind === 2) {
					max_of_a_kind = [];
					// 此處應該為 [2,1,1,1] or [2,2,1]。
					for (value in value_frequency.hash) {
						if (value_frequency.hash[value] === 1)
							high_card.push(+value);
						else
							// assert: value_frequency.hash[value] === 2
							max_of_a_kind.push(+value);
					}
					if (max_of_a_kind.length === 1) {
						// 此處應該為 [2,1,1,1]。
						high_card.sort();
						high_card.push(most_frequency_value);
						return category_name('One Pair');
					}

					// 此處應該為 [2,2,1]。
					if (max_of_a_kind[0] < max_of_a_kind[1]) {
						high_card.push(max_of_a_kind[0], max_of_a_kind[1]);
					} else {
						high_card.push(max_of_a_kind[1], max_of_a_kind[2]);
					}
					return category_name('Two Pairs');
				}

				// assert: max_of_a_kind === 1
				// 'High Card'
				if (get_rank) {
					// max 會被 return
					(this.high_card = values.clone().sort()).pop();

					// assert: score ≥ 1, it's when [2,2,2,2,3]
					return most_frequency_value;
				}
			}

			/**
			 * 判斷是否贏對手。
			 * 
			 * @param {String}hand
			 *            cards 對手牌面。
			 * 
			 * @returns {Boolean}wins, beats; or undefined: ties with
			 */
			function defeats(hand) {
				if (typeof hand === 'string')
					hand = new Poker_cards(hand);
				var my_category = this.category(true), category = hand
						.category(true);
				if (category !== my_category)
					return category < my_category;

				var my_high_card = this.high_card;
				if (!my_high_card)
					return;

				var index = my_high_card.length,
				// 先比牌型，再比點數 (最後花色)。
				// 先比同樣點數張數最多的牌，再比同樣點數張數少的牌。
				high_card = hand.high_card;
				if (!high_card) {
					CeL.warn(this.toString() + ', ' + hand.toString());
					CeL.warn(this);
					CeL.warn(hand);
				}
				while (index--)
					if (high_card[index] !== my_high_card[index])
						return high_card[index] < my_high_card[index];
			}

			// ---------------------------------------------------------------------------------------------------------------------------------------//
			// export.

			Poker_cards.value_name = value_name;
			Poker_cards.value_index = value_index;

			Poker_cards.suit_name = suit_name;
			Poker_cards.suit_index = suit_index;
			Poker_cards.set_suit_index = set_suit_index;

			Poker_cards.category_score = category_score;

			Poker_cards.prototype = {
				to_Array : to_Array,
				toString : toString,

				// TODO: arrange : arrange

				consecutive : consecutive,

				category : category,
				defeats : defeats
			};

			// ---------------------------------------

			return (Poker_cards// JSDT:_module_
			);
		}
	});
