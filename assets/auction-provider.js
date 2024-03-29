class AuctionProvider extends HTMLElement {
    #observers = new Array();
    #state = {
        startDate: null,
        endDate: null,
        productId: null,
        timezone: null,
        active: null,
        isCustomerLogged: null,
        customerBid: null,
        currentBid: null,
        min: null,
        priceLabel: "",
        auctionId: null,
        detailId: null,
        amount: 0,
        isSubscribed: null,
        channel: null,
        auctionEnded: false,
    };

    constructor() {
        super();
    }

    connectedCallback() {
        const data = this.#getData();
        data.currentBid = data.min;
        data.min = this.nextBid(data.min);
        this.#state = data;
        document.addEventListener("bid:created", this.onBidCreated.bind(this));

        if (this.#state.isCustomerLogged) {

            // intersection observer to fetch the customer bid
            const options = {
                root: null,
                rootMargin: "0px",
                threshold: 0.1,
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        this.#getCustomerBid().then((response) => {
                            if (response.data) {
                                this.mutate({ customerBid: response.data.maxBid });
                            }
                        });
                    }
                });
            }, options);

            observer.observe(this);
        }
    }

    onBidCreated(evt) {
        const { product_id, amount, customer_id } = evt.detail.bid;
        const { customerId } = this.getState();
        const currentAmount = Number(amount);

        if (this.#state.productId !== Number(product_id)) return false;
        this.mutate({
            amount: currentAmount,
            min: this.nextBid(currentAmount),
            currentBid: currentAmount,
            customerBid: currentAmount,
            isMine: customerId == Number(customer_id)
        });

        this.updateClock();
    }

    updateClock() {
        //check if clock is a minute and a half or less
        const { endDate, timezone } = this.getState();
        const endTime = Date.parse(endDate) / 1000;
        let now = new Date(new Date().toLocaleString("en-US", {
            timeZone: timezone,
        }));

        now = Date.parse(now) / 1000;
        let timeleft = endTime - now;
        let days = Math.floor(timeleft / 86400);
        let hours = Math.floor((timeleft - days * 86400) / 3600);
        let minutes = Math.floor((timeleft - days * 86400 - hours * 3600) / 60);
        let seconds = Math.floor(
            timeleft - days * 86400 - hours * 3600 - minutes * 60
        );

        if (hours > 0) return false;

        if ((minutes === 1 && seconds <= 30) || minutes === 0) {
            //reset the clock to 1 minute and 30 seconds
            const newEndDate = new Date(new Date().toLocaleString("en-US", {
                timeZone: timezone,
            }));
            newEndDate.setSeconds(newEndDate.getSeconds() + 90);
            this.mutate({ endDate: newEndDate });
        }
    }

    async #getCustomerBid() {
        const { auctionId, detailId } = this.getState();
        const URL = `/apps/appuction/auction-details/${detailId}/bid`;

        try {
            const response = await fetch(URL, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            return await response.json();
        } catch (error) {
            console.error(error);
        }

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
