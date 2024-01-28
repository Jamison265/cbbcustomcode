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
        if (this.priceLabelRef.textContent !== "Min price: ") {
            this.createNextMinBidUI();
        }

        this.onAuctionEnded();
    }

    onBidCreated() {
        const { amount } = this.#provider.getState();
        if (amount > 0) this.priceRef.innerHTML = this.#provider.formatCurrency(Number(amount));

        if (this.priceLabelRef.textContent === "Min price: " && amount > 0) {
            this.priceLabelRef.textContent = "Current bid: ";
        }
    }

    onAuctionEnded() {
        const { auctionEnded, active } = this.#provider.getState();
        const nextMinBidRef = this.querySelector("[data-next-min-bid]");

        if (auctionEnded || !active) {
            this.priceLabelRef.textContent = 'Final bid';
            nextMinBidRef.remove();
        }
    }

    createNextMinBidUI() {
        const { min, amount } = this.#provider.getState();
        let nextMinBidRef = this.querySelector("[data-next-min-bid]");
        let needsTobeAppended = false;

        if (min == null) {
            setTimeout(() => {
                this.createNextMinBidUI();
            }, 1000);
        }

        if (!nextMinBidRef) {
            nextMinBidRef = document.createElement("div");
            needsTobeAppended = true;
        }

        nextMinBidRef.dataset.nextMinBid = `${min}`;
        nextMinBidRef.innerHTML = `
            <span class="h5">Next min bid:</span>
            <span class="price-item price-item--regular">
                ${this.#provider.formatCurrency(min)}
            </span>
        `;

        if (needsTobeAppended) this.appendChild(nextMinBidRef);
    }

    createCustomerBidUI() {
        const { customerBid, min, auctionEnded, active } = this.#provider.getState();
        let customerBidRef = this.querySelector("[data-customer-bid]");
        let needsTobeAppended = false;

        if (customerBid) {
            if (!customerBidRef) {
                customerBidRef = document.createElement("div");
                needsTobeAppended = true;
            }

            customerBidRef.dataset.customerBid = `${customerBid}`;
            customerBidRef.innerHTML = `
                <span class="h5">Your bid:</span>
                <span class="price-item price-item--regular">
                    ${this.#provider.formatCurrency(customerBid)}
                </span>
            `;

            if (needsTobeAppended) this.appendChild(customerBidRef);

            if (this.#provider.nextBid(customerBid) == min) {
                customerBidRef.style = "color: var(--color-message-success);"
            } else {
                customerBidRef.style = "color: var(--color-message-error);";
            }
        }
    }

    update() {
        this.onBidCreated();
        this.main();
        this.createCustomerBidUI();
    }
}

customElements.define("bid-price-component", BidPriceComponent);
