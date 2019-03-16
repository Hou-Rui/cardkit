///<reference path="cardkit.ts" />

let game: Solitaire

class GameCard extends cardkit.Card {
    constructor(
        deck: cardkit.Deck,
        suit: cardkit.Suit,
        point: number,
        private targets: TargetDeck[]
    ) {
        super(deck, suit, point)
    }
    onClick(_event: MouseEvent) {
        if (!this.faceUp) {
            this.faceUp = true
        }
    }
    movable() {
        return this.faceUp
    }
    onDoubleClick(_event: MouseEvent) {
        for (let deck of this.targets) {
            if (deck.acceptCard(this)) {
                deck.addCard(this)
            }
        }
    }
    onMoveEnd(_event: MouseEvent) {
        game.checkGameOver()
    }
}

class ServingDeck extends cardkit.Deck {
    replayCount = 0
    constructor(
        scene: HTMLElement,
        left: number,
        top: number,
        private placingDeck: PlacingDeck
    ) {
        super(scene, left, top)
        this.faceUpDelta = this.faceDownDelta = 0
        placingDeck.move(left + 100, top)
    }
    acceptCard(_card: cardkit.Card) {
        return false
    }
    onClick(_event: MouseEvent) {
        this.replayCount++
        for (let card of this.placingDeck.cards) {
            card.faceUp = false
            this.addCard(card)
        }
    }
    onCardClick(card: GameCard, _event: MouseEvent) {
        this.placingDeck.addCard(card)
    }
}

class NormalDeck extends cardkit.Deck {
    acceptCard(card: cardkit.Card) {
        let topCard = this.topCard
        if (topCard === null) {
            return card.point === 13
        }
        return (
            card.point === topCard.point - 1 &&
            cardkit.suitConflict(card.suit, topCard.suit)
        )
    }
}

class TargetDeck extends cardkit.Deck {
    replayCount = 0
    constructor(scene: HTMLElement, private suit: cardkit.Suit) {
        super(scene)
        this.faceUpDelta = this.faceDownDelta = 0
    }
    acceptCard(card: cardkit.Card) {
        let topCard = this.topCard
        if (topCard === null) {
            return card.point === 1 && card.suit === this.suit
        }
        return card.point === topCard.point + 1 && card.suit === topCard.suit
    }
}

class PlacingDeck extends cardkit.Deck {
    constructor(scene: HTMLElement, left = 0, top = 0) {
        super(scene, left, top)
        this.faceUpDelta = this.faceDownDelta = 0
    }
    acceptCard(_card: cardkit.Card) {
        return false
    }
}

class Solitaire {
    private placingDeck = new PlacingDeck(this.scene)
    private servingDeck = new ServingDeck(this.scene, 50, 50, this.placingDeck)
    private normalDecks = new Array<NormalDeck>()
    private targetDecks = new Array<TargetDeck>()
    static Height = 700
    static Width = 1000
    constructor(private scene: HTMLElement) {
        this.initSceneStyle()
        this.initServingDeck()
        this.initNormalDecks()
        this.initTargetDecks()
    }
    private initSceneStyle() {
        this.scene.style.background = 'rgb(0, 128, 0)'
        this.scene.style.height = `${Solitaire.Height}px`
        this.scene.style.width = `${Solitaire.Width}px`
    }
    private initServingDeck() {
        for (let suit of cardkit.SuitFromNumber) {
            for (let point = 1; point <= 13; point++) {
                new GameCard(this.servingDeck, suit, point, this.targetDecks)
            }
        }
        this.servingDeck.shuffle()
    }
    private initNormalDecks() {
        const singleSpace = Solitaire.Width / 7
        for (let index = 0; index < 7; index++) {
            this.normalDecks[index] = new NormalDeck(this.scene)
            let deck = this.normalDecks[index]
            const mid = singleSpace * (index + 0.5)
            const left = Math.floor(mid - deck.width / 2)
            deck.move(left, 200)
            for (let cnt = 0; cnt < index + 1; cnt++) {
                deck.addCard(this.servingDeck.topCard!)
            }
            deck.topCard!.faceUp = true
        }
    }
    private initTargetDecks() {
        const singleSpace = (Solitaire.Width - 400) / 4
        for (let index = 0; index < 4; index++) {
            let suit = cardkit.SuitFromNumber[index]
            this.targetDecks[index] = new TargetDeck(this.scene, suit)
            let deck = this.targetDecks[index]
            const mid = singleSpace * (index + 0.5)
            const left = Math.floor(Solitaire.Width - mid - deck.width / 2)
            deck.move(left, 50)
        }
    }
    checkGameOver() {
        if (this.targetDecks.every(deck => deck.cards.length === 13)) {
            alert('游戏完成！')
        }
    }
}

let scene = document.getElementById('game-scene')
game = new Solitaire(scene!)
