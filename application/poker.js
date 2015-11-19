/**
 * @name CeL function for poker calculations.
 * @fileoverview 本檔案包含了撲克牌演算用的日期轉換功能。
 * 
 * @since 2015/11/19 17:16:35
 * 
 */

'use strict';

// ------------------------------------------------------------------------------------------------------------------//

if (typeof CeL === 'function')
	CeL.run({
		name : 'application.poker',
		require : 'data.code.compatibility.|data.native.',

		code : function(library_namespace) {

			// ------------------------------------------------------------------------------------------------------//


			// https://en.wikipedia.org/wiki/List_of_poker_hands

			function Poker_cards(cards) {
				var values = this.values = [], suits = this.suits = [];
				if (cards.forEach) {
					cards.forEach(function() {
						Poker_cards.parse(cards, values, suits);
					});
				} else if (typeof cards == 'string') {
					Poker_cards.parse(cards, values, suits);
				}
			}

			var PATTERN_poker_card = /(10?|[2-9JQKA])([SHDC♠♥♦♣])/g;

			Poker_cards.value_index = {};
			// 0–12. 0:2, 1:3, ...
			// 7:9, 8:10, 9:Jack, 10:Queen, 11:King, 12:Ace
			Poker_cards.value_name = '234567891JQKA'.split('');
			// [9]: 1 → 10
			Poker_cards.value_name[9] += 0;
			Poker_cards.value_name.forEach(function(name, index) {
				Poker_cards.value_index[name] = index;
			});
			Poker_cards.value_index[1] = Poker_cards.value_name.indexOf('A');

			Poker_cards.suit_index = {};
			Poker_cards.suit_name = '♠♥♦♣'.split('');
			Poker_cards.set_suit_index = function(names) {
				if (typeof names === 'string')
					names = names.split('');
				names.forEach(function(name, index) {
					Poker_cards.suit_index[name] = index;
				})
			};

			Poker_cards.set_suit_index(Poker_cards.suit_name);
			Poker_cards.set_suit_index('SHDC');

			Poker_cards.parse = function(card, values, suits) {
				var matched;
				card = card.toUpperCase();
				while (matched = PATTERN_poker_card.exec(card)) {
					values.push(Poker_cards.value_index[matched[1]]);
					suits.push(Poker_cards.suit_index[matched[2]]);
				}
			};

			Poker_cards.category_score = {
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

			Poker_cards.prototype.to_Array = function() {
				return this.values.map(function(value, index) {
					return Poker_cards.value_name[value]
							+ Poker_cards.suit_name[this.suits[index]];
				}, this);
			};

			Poker_cards.prototype.toString = function() {
				return this.to_Array().join(' ');
			};

			Poker_cards.prototype.consecutive = function() {
				var values = this.values;
				return values.combines_AP('consecutive')
				//
				|| values.includes(12) && values.map(function(value) {
					return value === 12 ? -1 : value;
				}).combines_AP('consecutive');
			};


			//------------------------

			// five-card deal 牌型
			// TODO: get specified category
			Poker_cards.prototype.category = function(get_rank) {
				function category_name(name) {
					if (high_card && high_card.length)
						_this.high_card = high_card.sort();
					// card rank
					return get_rank ? Poker_cards.category_score[name] : name;
				}

				var suits = this.suits;
				if (this.suits.length !== 5)
					return;

				var max_suit = suits.max = suits.frequency(1), max_suit_count = max_suit.count,
				//
				values = this.values, max_value = Math.max(values);
				// console.log(max_suit);
				max_suit = max_suit.value;

				if (max_suit_count === 5 && this.consecutive()) {
					return category_name(max_value === 12 ? 'Royal Flush' : 'Straight Flush');
				}

				var value_frequency = values.max = values.frequency(1), high_card = [], _this=this,
				//
				max_of_a_kind = value_frequency.count, most_frequency_value = value_frequency.value;
				// console.log(value_frequency);
				if (max_of_a_kind === 4) {
					for ( var value in value_frequency.hash)
						if (+value !== most_frequency_value){
							high_card.push(+value);
							break;
						}
					return category_name('Four of a Kind');
				}

				if (max_of_a_kind === 3) {
					for ( var value in value_frequency.hash)
						if (+value !== most_frequency_value
								&& value_frequency.hash[value] === 2)
							return category_name('Full House');
				}

				if (max_suit_count === 5){
					high_card=values.clone();
					return category_name('Flush');
				}

				if (this.consecutive())
					return category_name('Straight');

				if (max_of_a_kind === 3){
					for ( var value in value_frequency.hash)
						if (+value !== most_frequency_value){
							high_card.push(+value);
							if(value_frequency.hash[value]===2)
								high_card.push(+value);
						}
					return category_name('Three of a Kind');
				}

				if (max_of_a_kind === 2) {
					for ( var value in value_frequency.hash)
						if (value_frequency.hash[value] === 1)
							high_card.push(+value);
					return category_name(high_card.length===1?'Two Pairs' : 'One Pair');
				}

				if (get_rank){
					high_card=values.clone().sort();

					// 'High Card'
					// assert: score ≥ 1, it's when [2,2,2,2,3]
					return most_frequency_value;
				}
			};

			// wins, beats 贏對手
			// return undefined: ties with
			Poker_cards.prototype.defeats = function(hands) {
				if (typeof hands === 'string')
					hands = new Poker_cards(hands);
				var my_category = this.category(true), category = hands.category(true);
				if (category !== my_category)
					return category < my_category;

				var my_high_card = this.high_card;
				if (!my_high_card)
					return;
				my_high_card = my_high_card.sort();

				var index=this.values.length,
				// 先比牌型，再比點數 (最後花色)
				high_card = hands.high_card.clone().sort();
				while(index--)
					if(high_card[index]!== my_high_card[index])
						return high_card[index]< my_high_card[index];
			};



			//------------------------


			// five-card deal 牌型
			// TODO: get specified category
			Poker_cards.prototype.category = function(get_rank) {
				function category_name(name) {
					// card rank
					return get_rank ? Poker_cards.category_score[name] : name;
				}

				var suits = this.suits;
				if (this.suits.length !== 5)
					return;

				var max_suit = suits.max = suits.frequency(1), max_suit_count = max_suit.count,
				//
				values = this.values, max_value = Math.max(values);
				// console.log(max_suit);
				max_suit = max_suit.value;

				if (max_suit_count === 5 && this.consecutive()) {
					return category_name(max_value === 12 ? 'Royal Flush' : 'Straight Flush');
				}

				var value_frequency = values.max = values.frequency(1),
				//
				max_of_a_kind = value_frequency.count, most_frequency_value = value_frequency.value;
				// console.log(value_frequency);
				if (max_of_a_kind === 4) {
					return category_name('Four of a Kind');
				}

				if (max_of_a_kind === 3) {
					for ( var value in value_frequency.hash)
						if (+value !== most_frequency_value
								&& value_frequency.hash[value] === 2)
							return category_name('Full House');
				}

				if (max_suit_count === 5)
					return category_name('Flush');

				if (this.consecutive())
					return category_name('Straight');

				if (max_of_a_kind === 3)
					return category_name('Three of a Kind');

				if (max_of_a_kind === 2) {
					for ( var value in value_frequency.hash)
						if (+value !== most_frequency_value
								&& value_frequency.hash[value] === 2)
							return category_name('Two Pairs');
					return category_name('One Pair');
				}

				if (get_rank)
					// 'High Card'
					// assert: score ≥ 1, it's when [2,2,2,2,3]
					return most_frequency_value;
			};

			// wins, beats 贏對手
			// return undefined: ties with
			Poker_cards.prototype.defeats = function(hands) {
				if (typeof hands === 'string')
					hands = new Poker_cards(hands);
				var my_category = this.category(true), category = hands.category(true);
				if (category !== my_category)
					return category < my_category;

				var index=this.values.length,
				// 先比牌型，再比點數 (最後花色)
				my_values = this.values.clone().sort(),values = hands.values.clone().sort();
				while(index--)
					if(values[index]!== my_values[index])
						return values[index]< my_values[index];
			};

			// Poker_cards.prototype.arrange

			// ---------------------------------------------------------------------------------------------------------------------------------------//
			// export.

			// ---------------------------------------

			return (Poker_cards// JSDT:_module_
			);
		}
	});
