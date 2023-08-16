class BidderComponent extends HTMLElement {

    constructor() {
        super();
        this.formRef = this.querySelector('form');
        this.buttonRef = this.querySelector('button');
        this.modalLoginTemplate = this.querySelector(".modalLoginTemplate");
        this.global = {
            modal: document.getElementById("PopupModal-global"),
        };
        this.productId = this.dataset.productId;
        this.url = "/apps/appuction/bid";
        this.min = Number(this.dataset.min);
        this.priceLabel = this.dataset.priceLabel.split(':')[0].toLocaleLowerCase();
        this.isCustomerLogged = this.dataset.loggedIn.toLocaleLowerCase() == 'true' ? true : false;
    }

    connectedCallback() {
        this.formRef.addEventListener("submit", this.onSubmitHandler.bind(this));
        document.addEventListener('auction:ended', this.onAuctionEnded.bind(this));
        document.addEventListener('bid:created', this.onBidCreated.bind(this));
    }

    async onSubmitHandler(evt) {
        evt.preventDefault();

        if (!this.isCustomerLogged) {
            const template = this.modalLoginTemplate.cloneNode(true);
            const modalContent = this.global.modal.querySelector(
                ".modal-video__content-info"
            );
            modalContent.innerHTML = template.innerHTML;
            this.global.modal.show(this.buttonRef);
        } else {
            const hasErrors = this.validateForm();
            if (hasErrors) return false;

            const { url } = this;
            const formData = new FormData(this.formRef);
            const data = await this.mutate({
                url,
                data: formData,
                fetchConfig: {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                    },
                },
            });

            if (data.errors) {
                this.handlerErrors(data.errors);
            } else if (data.message) {
                this.showMessage({
                    type: "info",
                    message: data.message,
                    removeMessage: true,
                });
                this.formRef['amount'].value = data.bid.amount;
            } else {
                this.showMessage({
                    type: "success",
                    message: "Bid successfully ✓",
                    removeMessage: true,
                });
            }
        }
    }

    async mutate({ url, data, fetchConfig }) {
        const response = await fetch(url, { ...fetchConfig, body: data });
        const formattedData = await response.json();

        return formattedData;
    }

    handlerErrors(errors) {
        for (const prop in errors) {
            const value = Array.isArray(errors[prop]) ? errors[prop][0] : errors[prop];

            this.showMessage({
                type: "error",
                message: `🚨 ${value}`,
            });
        }
    }

    validateForm() {
        const errors = {};
        const amount = Number(this.formRef["amount"].value);
        const nextBid = this.nextBid(this.min);

        if (!this.formRef['amount']) {
            errors["amount"] = "Amount field is required";
        } else if (this.formRef['amount'].value == "") {
            errors["amount"] = "Bid can't be blank submitted";
        } else if (amount < this.min && this.priceLabel == 'min price') {
            errors["amount"] = `Your bid should be equal or greater than the ${this.priceLabel}`;
        } else if (!this.formRef["product_id"]) {
            errors["product"] = "Product field is required";
        } else if (!this.formRef["auction_id"]) {
            errors["auction"] = "Auction field is required";
        } else if (amount < nextBid) {
            errors["amount"] = `Next bid should be ${this.formatCurrency(nextBid)} or higher`;
        }

        this.handlerErrors(errors);

        return Object.keys(errors).length === 0 ? false : true;
    }

    showMessage({ type, message, removeMessage }) {
        //Clear previous messages
        const previousMessages = Array.from(this.querySelectorAll('.formMessage'));
        for (let index = 0; index < previousMessages.length; index++) {
            const message = previousMessages[index];
            message.remove();
        }

        const span = document.createElement('span');
        span.classList.add("formMessage");
        span.classList.add(`formMessage--${type}`);
        span.innerHTML = message;

        this.prepend(span);
        if (removeMessage) setTimeout(() => span.remove(), 5000);
    }

    onAuctionEnded(evt) {
        const productId = evt.detail.productId;

        if (productId == this.formRef['product_id'].value) {
            const elements = this.formRef.elements;

            for (let index = 0; index < elements.length; index++) {
                const element = elements[index];
                element.disabled = true;
            }
        }
    }

    onBidCreated(evt) {
        const { product_id: productId, amount } = evt.detail.bid;

        if (this.productId !== productId) return false;

        this.min = Number(amount);
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
}

customElements.define("bidder-component", BidderComponent);

