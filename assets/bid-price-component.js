class BidPriceComponent extends HTMLElement {
    constructor() {
        super();
        this.minPrice = this.dataset.minPrice;
        this.priceLabelRef = this.querySelector('[data-price-label]');
        this.priceRef = this.querySelector('.price-item');
        console.log("from bid price");
    }

    connectedCallback() {
        document.addEventListener('bid:created', this.onBidCreated.bind(this));
        this.addEventListener('bid:created', this.onBidCreated.bind(this));
    }

    onBidCreated(evt) {
        const { amount } = evt.detail.bid.data;
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
