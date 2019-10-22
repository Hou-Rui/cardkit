module cardkit {
    export enum Suit {
        Spades = 'S',
        Hearts = 'H',
        Clubs = 'C',
        Diamonds = 'D'
    }

    export const SuitFromString: { [key: string]: Suit } = {
        S: Suit.Spades,
        H: Suit.Hearts,
        C: Suit.Clubs,
        D: Suit.Diamonds
    }

    export const SuitFromNumber: Suit[] = [
        Suit.Spades,
        Suit.Hearts,
        Suit.Clubs,
        Suit.Diamonds
    ]

    export function suitConflict(a: Suit, b: Suit) {
        if (a === Suit.Spades || a === Suit.Clubs) {
            return b === Suit.Hearts || b === Suit.Diamonds
        } else {
            return b === Suit.Spades || b === Suit.Clubs
        }
    }

    class Wrapper {
        protected element = document.createElement('div')

        constructor(public scene: HTMLElement) {
            this.initStyle()
            this.initEvents()
            scene.style.zIndex = '-1'
            scene.appendChild(this.element)
        }
        protected initStyle(left?: number, top?: number) {
            this.style.position = 'absolute'
            this.style.width = '71px'
            this.style.height = '96px'
            this.style.borderRadius = '4px'
            this.style.backgroundSize = '71px 96px'
            if (left !== undefined && top !== undefined) {
                this.style.left = `${left}px`
                this.style.top = `${top}px`
            }
        }
        protected initEvents() {
            this.element.onclick = event => this.onClick(event)
            this.element.ondblclick = event => this.onDoubleClick(event)
        }
        get style() {
            return this.element.style
        }
        get left() {
            return Number(this.style.left!.split('px')[0])
        }
        get top() {
            return Number(this.style.top!.split('px')[0])
        }
        get width() {
            return Number(this.style.width!.split('px')[0])
        }
        get height() {
            return Number(this.style.height!.split('px')[0])
        }
        containsPoint(left: number, top: number) {
            return (
                left > this.left &&
                left < this.left + this.width &&
                top > this.top &&
                top < this.top + this.height
            )
        }
        move(left: number, top: number) {
            this.style.left = `${left}px`
            this.style.top = `${top}px`
        }
        onClick(event: MouseEvent): void {
            // 重载此方法
        }
        onDoubleClick(event: MouseEvent): void {
            // 重载此方法
        }
        movable(): boolean {
            // 重载此方法
            return true
        }
    }

    class MovingEventHandler {
        private movingCard: Card | null = null
        private deltaX = 0
        private deltaY = 0
        private static _instance: MovingEventHandler | null = null
        private static readonly TopZIndex = 10000
        private constructor() {
            document.onmousemove = event => {
                if (this.movingCard !== null && this.movingCard.movable()) {
                    let x = event.clientX - this.deltaX
                    let y = event.clientY - this.deltaY
                    this.movingCard.moveWithNext(x, y)
                }
            }
        }
        static instance() {
            if (MovingEventHandler._instance === null) {
                return (MovingEventHandler._instance = new MovingEventHandler())
            }
            return MovingEventHandler._instance
        }
        moveBegin(event: MouseEvent, card: Card) {
            this.movingCard = card
            this.deltaX = event.clientX - card.left
            this.deltaY = event.clientY - card.top
            card.style.zIndex = `${MovingEventHandler.TopZIndex}`
            let nextCards = card.next
            for (let index = 0; index < nextCards.length; index++) {
                let newZIndex = MovingEventHandler.TopZIndex + index + 1
                nextCards[index].style.zIndex = `${newZIndex}`
            }
        }
        moveEnd(event: MouseEvent) {
            let deck = Deck.puttingCardAt(
                this.movingCard!,
                event.clientX,
                event.clientY
            )
            if (deck === null || !deck.acceptCard(this.movingCard!)) {
                this.movingCard!.deck.adjustCardPosition()
                this.movingCard = null
                return
            }
            let nextCards = this.movingCard!.next
            deck.addCard(this.movingCard!)
            for (let card of nextCards) {
                deck.addCard(card)
            }
            this.movingCard = null
        }
    }

    export class Deck extends Wrapper {
        cards = new Array<Card>()
        faceDownDelta = 5
        faceUpDelta = 15
        static pool = new Array<Deck>()
        constructor(scene: HTMLElement, left: number = 0, top: number = 0) {
            super(scene)
            this.initStyle(left, top)
            Deck.pool.push(this)
        }
        protected initStyle(left: number, top: number) {
            super.initStyle(left, top)
            this.style.background = 'rgba(0, 0, 0, 0.2)'
            this.style.zIndex = `0`
        }
        adjustCardPosition() {
            let left = Number(this.style.left!.split('px')[0])
            let top = Number(this.style.top!.split('px')[0])
            for (let index = 0; index < this.cards.length; index++) {
                let card = this.cards[index]
                card.rank = index
                card.style.zIndex = `${index + 1}`
                card.move(left, top)
                top += card.faceUp ? this.faceUpDelta : this.faceDownDelta
            }
        }
        static puttingCardAt(movingCard: Card, left: number, top: number) {
            for (let deck of Deck.pool) {
                if (deck === movingCard.deck) {
                    continue
                }
                let card = deck.topCard
                if (card === null) {
                    if (deck.containsPoint(left, top)) {
                        return deck
                    }
                } else if (card.containsPoint(left, top)) {
                    return deck
                }
            }
            return null
        }
        addCard(card: Card) {
            card.deck.removeCard(card)
            this.cards.push(card)
            card.deck = this
            this.adjustCardPosition()
        }
        get topCard(): Card | null {
            if (this.cards.length === 0) {
                return null
            }
            return this.cards[this.cards.length - 1]
        }
        removeCard(card: Card) {
            this.cards = this.cards.filter(x => x !== card)
        }
        shuffle() {
            this.cards.sort((_x, _y) => (Math.random() > 0.5 ? -1 : 1))
            this.adjustCardPosition()
        }
        acceptCard(card: Card): boolean {
            // 重载此方法
            return true
        }
        onCardClick(card: Card, event: MouseEvent): void {
            // 重载此方法
        }
        onCardDoubleClick(card: Card, event: MouseEvent): void {
            // 重载此方法
        }
    }

    export class Card extends Wrapper {
        rank = -1
        name: string
        private _faceUp = true
        constructor(public deck: Deck, public suit: Suit, public point: number) {
            super(deck.scene)
            // 初始化卡牌
            this.name = `${this.suit}${this.point}`
            this.faceUp = false
            deck.addCard(this)
            // 初始化事件
            this.initEvents()
        }
        protected initEvents() {
            let handler = MovingEventHandler.instance()
            this.element.onmousedown = event => {
                handler.moveBegin(event, this)
                this.onMoveBegin(event)
            }
            this.element.onmouseup = event => {
                handler.moveEnd(event)
                this.onMoveEnd(event)
            }
            this.element.onclick = event => {
                this.onClick(event)
                this.deck.onCardClick(this, event)
            }
            this.element.ondblclick = event => {
                this.onDoubleClick(event)
                this.deck.onCardDoubleClick(this, event)
            }
        }
        static fromName(deck: Deck, name: string) {
            let suit = SuitFromString[name[0]]
            let point = Number(name.slice(1))
            return new this(deck, suit, point)
        }
        get next(): Card[] {
            let cards = this.deck.cards
            return cards.slice(this.rank + 1)
        }
        get faceUp(): boolean {
            return this._faceUp
        }
        set faceUp(up: boolean) {
            this._faceUp = up
            if (up) {
                this.style.backgroundImage = `url("images/${this.name}.png")`
            } else {
                this.style.backgroundImage = `url("images/blue_back.png")`
            }
        }
        moveWithNext(left: number, top: number) {
            let startX = this.left,
                startY = this.top
            this.move(left, top)
            let nextCards = this.next
            for (let card of nextCards) {
                let deltaX = left - startX,
                    deltaY = top - startY
                let newX = card.left + deltaX
                let newY = card.top + deltaY
                card.move(newX, newY)
            }
        }
        onMoveBegin(event: MouseEvent): void {
            // 重载此方法
        }
        onMoveEnd(event: MouseEvent): void {
            // 重载此方法
        }
    }
}
