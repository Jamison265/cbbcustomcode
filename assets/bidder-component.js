class BidderComponent extends HTMLElement {
    #provider;

    constructor() {
        super();
        this.url = "/apps/appuction/bid";
    }

    connectedCallback() {
        this.#provider = this.parentElement;
        this.#provider.addObserver(this);
        this.settings();
        this.formRef.addEventListener("submit", this.onSubmitHandler.bind(this));
        this.subscribeFormRef.addEventListener("submit", this.onSubscribe.bind(this));
        this.main();
    }

    settings() {
        const { productId, min, priceLabel, isCustomerLogged } = this.#provider.getState();
        this.formRef = this.querySelector('form[data-action="bid"]');
        this.subscribeFormRef = this.querySelector('form[data-action="subscribe"]');
        this.buttonRef = this.querySelector("button");
        this.modalLoginTemplate = this.querySelector(".modalLoginTemplate");
        this.global = {
            modal: document.getElementById("PopupModal-global"),
        };
        this.productId = productId;
        this.priceLabel = priceLabel;
        this.isCustomerLogged = isCustomerLogged;
    }

    main() {
        this.onAuctionEnded();
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

    async onSubscribe(evt) {
        evt.preventDefault();
        const button = this.subscribeFormRef.querySelector('button');

        if (!this.isCustomerLogged) {
            const template = this.modalLoginTemplate.cloneNode(true);
            const modalContent = this.global.modal.querySelector(".modal-video__content-info");
            modalContent.innerHTML = template.innerHTML;
            const firstParagraph = modalContent.querySelector('.rte p');
            firstParagraph.innerHTML = 'Hey! Before subscribing to get notifications about this product, please <a href="/account/login">login</a> into your account.';
            this.global.modal.show(button);
        } else {
            const URL = `/apps/appuction/auction-details/${this.formRef["auction_id"].value}/${this.formRef["product_id"].value}`;
            const response = await fetch(URL);

            if (response.error) {
                console.error(response.error);
                return false;
            }

            const auctionDetail = await response.json();
            const formData = new FormData(this.subscribeFormRef);
            const data = await this.mutate({
                url: `/apps/appuction/auction-details/${auctionDetail.data.id}/subscriptions`,
                data: formData,
                fetchConfig: {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                    },
                },
            });

            if (!data.error) {
                this.showMessage({
                    type: "success",
                    message: `Subscribed successfully ✓`,
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
        const { min } = this.#provider.getState();
        const errors = {};
        const amount = Number(this.formRef["amount"].value);
        const nextBid = this.#provider.nextBid(min);

        if (!this.formRef['amount']) {
            errors["amount"] = "Amount field is required";
        } else if (this.formRef['amount'].value == "") {
            errors["amount"] = "Bid can't be blank submitted";
        } else if (amount < min && this.priceLabel == 'min price') {
            errors["amount"] = `Your bid should be equal or greater than the ${this.priceLabel}`;
        } else if (!this.formRef["product_id"]) {
            errors["product"] = "Product field is required";
        } else if (!this.formRef["auction_id"]) {
            errors["auction"] = "Auction field is required";
        } else if (amount < nextBid) {
            errors["amount"] = `Next bid should be ${this.#provider.formatCurrency(nextBid)} or higher`;
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

    onAuctionEnded() {
        const { auctionEnded } = this.#provider.getState()

        if (auctionEnded) {
            const elements = this.formRef.elements;
            const notifyBtn = this.subscribeFormRef.querySelector("button");

            for (let index = 0; index < elements.length; index++) {
                const element = elements[index];
                element.disabled = true;
            }

            notifyBtn.disabled = true;
        }
    }

    update() {
        this.main();
    }
}

customElements.define("bidder-component", BidderComponent);

