class AuctionProvider extends HTMLElement {
    #observers = new Array();
    #state = {
        startDate: null,
        endDate: null,
        productId: null,
        timezone: null,
        active: null,
        isCustomerLogged: null,
        min: null,
        priceLabel: "",
        auctionId: null,
        amount: 0,
        subscribed: null,
        channel: null,
        auctionEnded: false,
    };

    constructor() {
        super();
    }

    connectedCallback() {
        const data = this.#getData();
        this.#state = data;
        document.addEventListener("bid:created", this.onBidCreated.bind(this));
    }

    onBidCreated(evt) {
        const { product_id, amount } = evt.detail.bid;

        if (this.#state.productId !== Number(product_id)) return false;
        this.mutate({ amount: Number(amount) });
    }

    #getData() {
        return JSON.parse(this.firstElementChild.textContent);
    }

    mutate(obj) {
        this.#state = Object.assign(this.#state, obj);
        this.notify();
    }

    getState() {
        return new Proxy(this.#state, {});
    }

    nextBid(amount) {
        const ranges = [
            50, 99, 199, 499, 999, 1999, 4999, 9999, 19999, 49999, 99999,
            199999, 499999, 999999, 1999999, 9999999, 10000000,
        ];
        const increments = [
            1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 12500,
            25000, 50000, 100000,
        ];

        const currentRange = ranges.find((range) => range >= amount);

        if (currentRange) {
            const incrementIndex = ranges.indexOf(currentRange);
            return amount + increments[incrementIndex];
        }

        return amount + 1;
    }

    formatCurrency(amount) {
        const dollarUS = Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        });

        return dollarUS.format(amount);
    }

    addObserver(observer) {
        this.#observers.push(observer);
    }

    removeObserver(observer) {
        const index = this.#observers.indexOf(observer);
        this.#observers.splice(index, 1);
    }

    notify() {
        this.#observers.forEach((observer) => observer.update());
    }
}

customElements.define('auction-provider', AuctionProvider);
