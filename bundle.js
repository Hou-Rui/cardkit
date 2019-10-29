"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var cardkit;
(function (cardkit) {
    var Suit;
    (function (Suit) {
        Suit["Spades"] = "S";
        Suit["Hearts"] = "H";
        Suit["Clubs"] = "C";
        Suit["Diamonds"] = "D";
    })(Suit = cardkit.Suit || (cardkit.Suit = {}));
    cardkit.SuitFromString = {
        S: Suit.Spades,
        H: Suit.Hearts,
        C: Suit.Clubs,
        D: Suit.Diamonds
    };
    cardkit.SuitFromNumber = [
        Suit.Spades,
        Suit.Hearts,
        Suit.Clubs,
        Suit.Diamonds
    ];
    function suitConflict(a, b) {
        if (a === Suit.Spades || a === Suit.Clubs) {
            return b === Suit.Hearts || b === Suit.Diamonds;
        }
        else {
            return b === Suit.Spades || b === Suit.Clubs;
        }
    }
    cardkit.suitConflict = suitConflict;
    var Wrapper = /** @class */ (function () {
        function Wrapper(scene) {
            this.scene = scene;
            this.element = document.createElement('div');
            this.initStyle();
            this.initEvents();
            scene.style.zIndex = '-1';
            scene.appendChild(this.element);
        }
        Wrapper.prototype.initStyle = function (left, top) {
            this.style.position = 'absolute';
            this.style.width = '107px';
            this.style.height = '145px';
            this.style.borderRadius = '4px';
            this.style.backgroundSize = '107px 145px';
            if (left !== undefined && top !== undefined) {
                this.style.left = left + "px";
                this.style.top = top + "px";
            }
        };
        Wrapper.prototype.initEvents = function () {
            var _this = this;
            this.element.onclick = function (event) { return _this.onClick(event); };
            this.element.ondblclick = function (event) { return _this.onDoubleClick(event); };
        };
        Object.defineProperty(Wrapper.prototype, "style", {
            get: function () {
                return this.element.style;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Wrapper.prototype, "left", {
            get: function () {
                return Number(this.style.left.split('px')[0]);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Wrapper.prototype, "top", {
            get: function () {
                return Number(this.style.top.split('px')[0]);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Wrapper.prototype, "width", {
            get: function () {
                return Number(this.style.width.split('px')[0]);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Wrapper.prototype, "height", {
            get: function () {
                return Number(this.style.height.split('px')[0]);
            },
            enumerable: true,
            configurable: true
        });
        Wrapper.prototype.containsPoint = function (left, top) {
            return (left > this.left &&
                left < this.left + this.width &&
                top > this.top &&
                top < this.top + this.height);
        };
        Wrapper.prototype.move = function (left, top) {
            this.style.left = left + "px";
            this.style.top = top + "px";
        };
        Wrapper.prototype.onClick = function (event) {
            // 重载此方法
        };
        Wrapper.prototype.onDoubleClick = function (event) {
            // 重载此方法
        };
        Wrapper.prototype.movable = function () {
            // 重载此方法
            return true;
        };
        return Wrapper;
    }());
    var MovingEventHandler = /** @class */ (function () {
        function MovingEventHandler() {
            var _this = this;
            this.movingCard = null;
            this.deltaX = 0;
            this.deltaY = 0;
            document.onmousemove = function (event) {
                if (_this.movingCard !== null && _this.movingCard.movable()) {
                    var x = event.clientX - _this.deltaX;
                    var y = event.clientY - _this.deltaY;
                    _this.movingCard.moveWithNext(x, y);
                }
            };
        }
        MovingEventHandler.instance = function () {
            if (MovingEventHandler._instance === null) {
                return (MovingEventHandler._instance = new MovingEventHandler());
            }
            return MovingEventHandler._instance;
        };
        MovingEventHandler.prototype.moveBegin = function (event, card) {
            this.movingCard = card;
            this.deltaX = event.clientX - card.left;
            this.deltaY = event.clientY - card.top;
            card.style.zIndex = "" + MovingEventHandler.TopZIndex;
            var nextCards = card.next;
            for (var index = 0; index < nextCards.length; index++) {
                var newZIndex = MovingEventHandler.TopZIndex + index + 1;
                nextCards[index].style.zIndex = "" + newZIndex;
            }
        };
        MovingEventHandler.prototype.moveEnd = function (event) {
            var deck = Deck.puttingCardAt(this.movingCard, event.clientX, event.clientY);
            if (deck === null || !deck.acceptCard(this.movingCard)) {
                this.movingCard.deck.adjustCardPosition();
                this.movingCard = null;
                return;
            }
            var nextCards = this.movingCard.next;
            deck.addCard(this.movingCard);
            for (var _i = 0, nextCards_1 = nextCards; _i < nextCards_1.length; _i++) {
                var card = nextCards_1[_i];
                deck.addCard(card);
            }
            this.movingCard = null;
        };
        MovingEventHandler._instance = null;
        MovingEventHandler.TopZIndex = 10000;
        return MovingEventHandler;
    }());
    var Deck = /** @class */ (function (_super) {
        __extends(Deck, _super);
        function Deck(scene, left, top) {
            if (left === void 0) { left = 0; }
            if (top === void 0) { top = 0; }
            var _this = _super.call(this, scene) || this;
            _this.cards = new Array();
            _this.faceDownDelta = 8;
            _this.faceUpDelta = 18;
            _this.initStyle(left, top);
            Deck.pool.push(_this);
            return _this;
        }
        Deck.prototype.initStyle = function (left, top) {
            _super.prototype.initStyle.call(this, left, top);
            this.style.background = 'rgba(0, 0, 0, 0.2)';
            this.style.zIndex = "0";
        };
        Deck.prototype.adjustCardPosition = function () {
            var left = Number(this.style.left.split('px')[0]);
            var top = Number(this.style.top.split('px')[0]);
            for (var index = 0; index < this.cards.length; index++) {
                var card = this.cards[index];
                card.rank = index;
                card.style.zIndex = "" + (index + 1);
                card.move(left, top);
                top += card.faceUp ? this.faceUpDelta : this.faceDownDelta;
            }
        };
        Deck.puttingCardAt = function (movingCard, left, top) {
            for (var _i = 0, _a = Deck.pool; _i < _a.length; _i++) {
                var deck = _a[_i];
                if (deck === movingCard.deck) {
                    continue;
                }
                var card = deck.topCard;
                if (card === null) {
                    if (deck.containsPoint(left, top)) {
                        return deck;
                    }
                }
                else if (card.containsPoint(left, top)) {
                    return deck;
                }
            }
            return null;
        };
        Deck.prototype.addCard = function (card) {
            card.deck.removeCard(card);
            this.cards.push(card);
            card.deck = this;
            this.adjustCardPosition();
        };
        Object.defineProperty(Deck.prototype, "topCard", {
            get: function () {
                if (this.cards.length === 0) {
                    return null;
                }
                return this.cards[this.cards.length - 1];
            },
            enumerable: true,
            configurable: true
        });
        Deck.prototype.removeCard = function (card) {
            this.cards = this.cards.filter(function (x) { return x !== card; });
        };
        Deck.prototype.shuffle = function () {
            this.cards.sort(function (_x, _y) { return (Math.random() > 0.5 ? -1 : 1); });
            this.adjustCardPosition();
        };
        Deck.prototype.acceptCard = function (card) {
            // 重载此方法
            return true;
        };
        Deck.prototype.onCardClick = function (card, event) {
            // 重载此方法
        };
        Deck.prototype.onCardDoubleClick = function (card, event) {
            // 重载此方法
        };
        Deck.pool = new Array();
        return Deck;
    }(Wrapper));
    cardkit.Deck = Deck;
    var Card = /** @class */ (function (_super) {
        __extends(Card, _super);
        function Card(deck, suit, point) {
            var _this = _super.call(this, deck.scene) || this;
            _this.deck = deck;
            _this.suit = suit;
            _this.point = point;
            _this.rank = -1;
            _this._faceUp = true;
            // 初始化卡牌
            _this.name = "" + _this.suit + _this.point;
            _this.faceUp = false;
            deck.addCard(_this);
            // 初始化事件
            _this.initEvents();
            return _this;
        }
        Card.prototype.initEvents = function () {
            var _this = this;
            var handler = MovingEventHandler.instance();
            this.element.onmousedown = function (event) {
                handler.moveBegin(event, _this);
                _this.onMoveBegin(event);
            };
            this.element.onmouseup = function (event) {
                handler.moveEnd(event);
                _this.onMoveEnd(event);
            };
            this.element.onclick = function (event) {
                _this.onClick(event);
                _this.deck.onCardClick(_this, event);
            };
            this.element.ondblclick = function (event) {
                _this.onDoubleClick(event);
                _this.deck.onCardDoubleClick(_this, event);
            };
        };
        Card.fromName = function (deck, name) {
            var suit = cardkit.SuitFromString[name[0]];
            var point = Number(name.slice(1));
            return new this(deck, suit, point);
        };
        Object.defineProperty(Card.prototype, "next", {
            get: function () {
                var cards = this.deck.cards;
                return cards.slice(this.rank + 1);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Card.prototype, "faceUp", {
            get: function () {
                return this._faceUp;
            },
            set: function (up) {
                this._faceUp = up;
                if (up) {
                    this.style.backgroundImage = "url(\"images/" + this.name + ".png\")";
                }
                else {
                    this.style.backgroundImage = "url(\"images/blue_back.png\")";
                }
            },
            enumerable: true,
            configurable: true
        });
        Card.prototype.moveWithNext = function (left, top) {
            var startX = this.left, startY = this.top;
            this.move(left, top);
            var nextCards = this.next;
            for (var _i = 0, nextCards_2 = nextCards; _i < nextCards_2.length; _i++) {
                var card = nextCards_2[_i];
                var deltaX = left - startX, deltaY = top - startY;
                var newX = card.left + deltaX;
                var newY = card.top + deltaY;
                card.move(newX, newY);
            }
        };
        Card.prototype.onMoveBegin = function (event) {
            // 重载此方法
        };
        Card.prototype.onMoveEnd = function (event) {
            // 重载此方法
        };
        return Card;
    }(Wrapper));
    cardkit.Card = Card;
})(cardkit || (cardkit = {}));
///<reference path="cardkit.ts" />
var solitaire;
///<reference path="cardkit.ts" />
(function (solitaire) {
    var GameCard = /** @class */ (function (_super) {
        __extends(GameCard, _super);
        function GameCard(game, deck, suit, point, targets) {
            var _this = _super.call(this, deck, suit, point) || this;
            _this.game = game;
            _this.targets = targets;
            return _this;
        }
        GameCard.prototype.onClick = function (_event) {
            if (!this.faceUp) {
                this.faceUp = true;
            }
        };
        GameCard.prototype.movable = function () {
            return this.faceUp;
        };
        GameCard.prototype.onDoubleClick = function (_event) {
            for (var _i = 0, _a = this.targets; _i < _a.length; _i++) {
                var deck = _a[_i];
                if (deck.acceptCard(this)) {
                    deck.addCard(this);
                    this.game.checkGameCompleted();
                    break;
                }
            }
        };
        GameCard.prototype.onMoveEnd = function (_event) {
            this.game.checkGameCompleted();
        };
        return GameCard;
    }(cardkit.Card));
    var ServingDeck = /** @class */ (function (_super) {
        __extends(ServingDeck, _super);
        function ServingDeck(scene, left, top, placingDeck) {
            var _this = _super.call(this, scene, left, top) || this;
            _this.placingDeck = placingDeck;
            _this.replayCount = 0;
            _this.faceUpDelta = _this.faceDownDelta = 0;
            placingDeck.move(left + 120, top);
            return _this;
        }
        ServingDeck.prototype.acceptCard = function (_card) {
            return false;
        };
        ServingDeck.prototype.onClick = function (_event) {
            this.replayCount++;
            for (var _i = 0, _a = this.placingDeck.cards; _i < _a.length; _i++) {
                var card = _a[_i];
                card.faceUp = false;
                this.addCard(card);
            }
        };
        ServingDeck.prototype.onCardClick = function (card, _event) {
            this.placingDeck.addCard(card);
        };
        return ServingDeck;
    }(cardkit.Deck));
    var NormalDeck = /** @class */ (function (_super) {
        __extends(NormalDeck, _super);
        function NormalDeck() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        NormalDeck.prototype.acceptCard = function (card) {
            var topCard = this.topCard;
            if (topCard === null) {
                return card.point === 13;
            }
            return (card.point === topCard.point - 1 &&
                cardkit.suitConflict(card.suit, topCard.suit));
        };
        return NormalDeck;
    }(cardkit.Deck));
    var TargetDeck = /** @class */ (function (_super) {
        __extends(TargetDeck, _super);
        function TargetDeck(scene, suit) {
            var _this = _super.call(this, scene) || this;
            _this.suit = suit;
            _this.replayCount = 0;
            _this.faceUpDelta = _this.faceDownDelta = 0;
            return _this;
        }
        TargetDeck.prototype.acceptCard = function (card) {
            var topCard = this.topCard;
            if (topCard === null) {
                return card.point === 1 && card.suit === this.suit;
            }
            return card.point === topCard.point + 1 && card.suit === topCard.suit;
        };
        return TargetDeck;
    }(cardkit.Deck));
    var PlacingDeck = /** @class */ (function (_super) {
        __extends(PlacingDeck, _super);
        function PlacingDeck(scene, left, top) {
            if (left === void 0) { left = 0; }
            if (top === void 0) { top = 0; }
            var _this = _super.call(this, scene, left, top) || this;
            _this.faceUpDelta = _this.faceDownDelta = 0;
            return _this;
        }
        PlacingDeck.prototype.acceptCard = function (_card) {
            return false;
        };
        return PlacingDeck;
    }(cardkit.Deck));
    var Game = /** @class */ (function () {
        function Game(scene) {
            this.scene = scene;
            this.placingDeck = new PlacingDeck(this.scene);
            this.servingDeck = new ServingDeck(this.scene, 50, 50, this.placingDeck);
            this.normalDecks = new Array();
            this.targetDecks = new Array();
            this.initSceneStyle();
            this.initServingDeck();
            this.initNormalDecks();
            this.initTargetDecks();
        }
        Game.prototype.initSceneStyle = function () {
            this.scene.style.background = 'rgb(0, 128, 0)';
            this.scene.style.height = Game.Height + "px";
            this.scene.style.width = Game.Width + "px";
        };
        Game.prototype.initServingDeck = function () {
            for (var _i = 0, _a = cardkit.SuitFromNumber; _i < _a.length; _i++) {
                var suit = _a[_i];
                for (var point = 1; point <= 13; point++) {
                    new GameCard(this, this.servingDeck, suit, point, this.targetDecks);
                }
            }
            this.servingDeck.shuffle();
        };
        Game.prototype.initNormalDecks = function () {
            var singleSpace = Game.Width / 7;
            for (var index = 0; index < 7; index++) {
                this.normalDecks[index] = new NormalDeck(this.scene);
                var deck = this.normalDecks[index];
                var mid = singleSpace * (index + 0.5);
                var left = Math.floor(mid - deck.width / 2);
                deck.move(left, 250);
                for (var cnt = 0; cnt < index + 1; cnt++) {
                    deck.addCard(this.servingDeck.topCard);
                }
                deck.topCard.faceUp = true;
            }
        };
        Game.prototype.initTargetDecks = function () {
            var singleSpace = (Game.Width - 400) / 4;
            for (var index = 0; index < 4; index++) {
                var suit = cardkit.SuitFromNumber[index];
                this.targetDecks[index] = new TargetDeck(this.scene, suit);
                var deck = this.targetDecks[index];
                var mid = singleSpace * (index + 0.5);
                var left = Math.floor(Game.Width - mid - deck.width / 2);
                deck.move(left, 50);
            }
        };
        Game.prototype.checkGameCompleted = function () {
            if (this.targetDecks.every(function (deck) { return deck.cards.length === 13; })) {
                alert('游戏完成！');
            }
        };
        Game.Height = 800;
        Game.Width = 1000;
        return Game;
    }());
    solitaire.Game = Game;
    function newGame() {
        var scene = document.getElementById('game-scene');
        new Game(scene);
    }
    solitaire.newGame = newGame;
})(solitaire || (solitaire = {}));
