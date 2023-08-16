class BidPriceComponent extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        //Setters
        this.minPrice = Number(this.dataset.minPrice);
        this.priceLabelRef = this.querySelector("[data-price-label]");
        this.priceRef = this.querySelector(".price-item");
        this.productId = this.dataset.productId;

        document.addEventListener("bid:created", this.onBidCreated.bind(this));
        document.addEventListener("auction:ended", this.onAuctionEnded.bind(this));

        if (this.priceLabelRef.textContent !== "Min price") {
            this.createNextMinBidUI();
        }
    }

    formatCurrency(amount) {
        const dollarUS = Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        });

        return dollarUS.format(amount);
    }

    onBidCreated(evt) {
        const { product_id: productId, amount } = evt.detail.bid;
        const nextMinBidRef = this.querySelector("[data-next-min-bid]");

        if (this.productId !== productId) return false;

        this.priceRef.innerHTML = this.formatCurrency(Number(amount));

        if (this.priceLabelRef.textContent === "Min price") {
            this.priceLabelRef.textContent = "Current bid:";
        }

        if (nextMinBidRef) {
            const nextBid = this.nextBid(Number(amount));
            nextMinBidRef.dataset.nextMinBid = nextBid;
            nextMinBidRef.querySelector(".price-item").textContent = this.formatCurrency(nextBid);
        } else {
            this.createNextMinBidUI();
        }
    }

    onAuctionEnded(evt) {
        const productId = evt.detail.productId;

        if (this.productId == productId) this.priceLabelRef.textContent = 'Final bid:';
    }

    nextBid(amount) {
        const ranges = [ 50, 99, 199, 499, 999, 1999, 4999, 9999, 19999, 49999, 99999, 199999, 499999, 999999, 1999999, 9999999, 10000000];
        const increments = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 12500, 25000, 50000, 100000];

        const currentRange = ranges.find(range => range >= amount);

        if (currentRange) {
            const incrementIndex = ranges.indexOf(currentRange);
            return amount + increments[incrementIndex];
        }

        return amount + 1;
    }

    createNextMinBidUI() {
        const nextBid = this.nextBid(this.minPrice);
        const div = document.createElement("div");
        div.dataset.nextMinBid = `${nextBid}`;
        div.innerHTML = `
                <span class="h5">Next min bid</span>
                <span class="price-item price-item--regular">
                    ${this.formatCurrency(nextBid)}
                </span>
            `;
        this.appendChild(div);
    }
}

customElements.define("bid-price-component", BidPriceComponent);
