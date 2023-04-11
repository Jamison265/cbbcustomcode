class BidPriceComponent extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        //Setters
        this.minPrice = this.dataset.minPrice;
        this.priceLabelRef = this.querySelector("[data-price-label]");
        this.priceRef = this.querySelector(".price-item");
        this.productId = this.dataset.productId;

        document.addEventListener("bid:created", this.onBidCreated.bind(this));
        document.addEventListener("auction:ended", this.onAuctionEnded.bind(this));
    }

    onBidCreated(evt) {
        const { product_id: productId, amount } = evt.detail.bid;

        if (this.productId !== productId) return false;

        const dollarUS = Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        });

        this.priceRef.innerHTML = dollarUS.format(Number(amount));

        if (this.priceLabelRef.textContent === "Min price") {
            this.priceLabelRef.textContent = "Current bid:";
        }
    }

    onAuctionEnded(evt) {
        const productId = evt.detail.productId;

        if (this.productId == productId) this.priceLabelRef.textContent = 'Final bid:';
    }
}

customElements.define("bid-price-component", BidPriceComponent);
