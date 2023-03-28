class BidPriceComponent extends HTMLElement {
    constructor() {
        super();
        this.minPrice = this.dataset.minPrice;
        this.priceLabelRef = this.querySelector('[data-price-label]');
        this.priceRef = this.querySelector('.price-item');
        this.productId = this.dataset.productId;
    }

    connectedCallback() {
        document.addEventListener('bid:created', this.onBidCreated.bind(this));
        this.addEventListener('bid:created', this.onBidCreated.bind(this));
    }

    onBidCreated(evt) {
        const { product_id: productId, amount } = evt.detail.bid.data;

        if (this.productId !== productId) return false;

        const dollarUS = Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        });

        this.priceRef.innerHTML = dollarUS.format(Number(amount));

        if (this.priceLabelRef.textContent === 'Min price') {
            this.priceLabelRef.textContent = 'Current bid:';
        }
    }
}

customElements.define("bid-price-component", BidPriceComponent);
