class BidPriceComponent extends HTMLElement {
    #provider;
    constructor() {
        super();
    }

    connectedCallback() {
        //Setters
        const parent = this.closest(".card__content") || this.closest(".product__info-container");
        this.#provider = parent.querySelector("auction-provider");
        this.#provider.addObserver(this);
        this.priceLabelRef = this.querySelector("[data-price-label]");
        this.priceRef = this.querySelector(".price-item");
        this.main();
    }

    main() {
        if (this.priceLabelRef.textContent !== "Min price") {
            this.createNextMinBidUI();
        }

        this.onAuctionEnded();
    }

    onBidCreated() {
        const { amount } = this.#provider.getState();

        this.priceRef.innerHTML = this.#provider.formatCurrency(Number(amount));

        if (this.priceLabelRef.textContent === "Min price") {
            this.priceLabelRef.textContent = "Current bid:";
        }
    }

    onAuctionEnded() {
        const { auctionEnded } = this.#provider.getState();
        const nextMinBidRef = this.querySelector("[data-next-min-bid]");

        if (auctionEnded) {
            this.priceLabelRef.textContent = 'Final bid:';
            nextMinBidRef.remove();
        }
    }

    createNextMinBidUI() {
        const { min, amount } = this.#provider.getState();
        let nextMinBidRef = this.querySelector("[data-next-min-bid]");
        let nextBid;
        let needsTobeAppended = false;

        if (!nextMinBidRef) {
            nextBid = this.#provider.nextBid(min);
            nextMinBidRef = document.createElement("div");
            needsTobeAppended = true;
        } else {
            nextBid = this.#provider.nextBid(amount);
        }

        nextMinBidRef.dataset.nextMinBid = `${nextBid}`;
        nextMinBidRef.innerHTML = `
            <span class="h5">Next min bid</span>
            <span class="price-item price-item--regular">
                ${this.#provider.formatCurrency(nextBid)}
            </span>
        `;

        if (needsTobeAppended) this.appendChild(nextMinBidRef);
    }

    update() {
        this.main();
        this.onBidCreated();
    }
}

customElements.define("bid-price-component", BidPriceComponent);
