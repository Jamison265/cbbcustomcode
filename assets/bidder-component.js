class BidderComponent extends HTMLElement {
    #provider;
    #isSubscribed;

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
        const { productId, priceLabel, isCustomerLogged, isSubscribed } = this.#provider.getState();
        this.#isSubscribed = isSubscribed;
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
        const { isSubscribed, detailId } = this.#provider.getState();
        const button = this.subscribeFormRef.querySelector('button');

        if (!this.isCustomerLogged) {
            const template = this.modalLoginTemplate.cloneNode(true);
            const modalContent = this.global.modal.querySelector(".modal-video__content-info");
            modalContent.innerHTML = template.innerHTML;
            const firstParagraph = modalContent.querySelector('.rte p');
            firstParagraph.innerHTML = 'Hey! Before subscribing to get notifications about this product, please <a href="/account/login">login</a> into your account.';
            this.global.modal.show(button);
        } else {
            const formData = new FormData(this.subscribeFormRef);
            const method = isSubscribed ? 'DELETE' : 'POST';

            for (let index = 0; index < button.children.length; index++) {
                const element = button.children[index];

                if (element.classList.contains('loading-overlay__spinner')) {
                    element.classList.remove('hidden');
                } else {
                    element.classList.add('hidden');
                }
            }

            const data = await this.mutate({
                url: `/apps/appuction/auction-details/${detailId}/subscriptions`,
                data: formData,
                fetchConfig: {
                    method: method,
                    headers: {
                        Accept: "application/json",
                    },
                },
            });

            if (!data.error) {
                this.showMessage({
                    type: "success",
                    message: `${data.data.message} ✓`,
                    removeMessage: true,
                });

                this.#provider.mutate({ isSubscribed: !isSubscribed });
            }
        }
    }

    onSubscriptionChange() {
        const { isSubscribed } = this.#provider.getState();
        const button = this.subscribeFormRef.querySelector("button");

        if (isSubscribed == this.#isSubscribed) return false;
        this.#isSubscribed = isSubscribed;
        const currentText = button.getAttribute("aria-label");
        const labelAlternative = button.dataset.labelAlternative;

        button.classList.toggle("button--success");
        button.classList.toggle("button--tertiary");
        button.setAttribute("aria-label", labelAlternative);
        button.children[1].textContent = labelAlternative;
        button.dataset.labelAlternative = currentText;

        for (let index = 0; index < button.children.length; index++) {
            const element = button.children[index];
            element.classList.toggle('hidden');
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
        let { min, priceLabel, currentBid } = this.#provider.getState();
        const errors = {};
        const amount = Number(this.formRef["amount"].value);

        if (priceLabel == "Min price: ") {
            min = currentBid;
        }

        if (!this.formRef['amount']) {
            errors["amount"] = "Amount field is required";
        } else if (this.formRef['amount'].value == "") {
            errors["amount"] = "Bid can't be blank submitted";
        } else if (!this.formRef["product_id"]) {
            errors["product"] = "Product field is required";
        } else if (!this.formRef["auction_id"]) {
            errors["auction"] = "Auction field is required";
        } else if (amount < min) {
            errors["amount"] = `Next bid should be ${this.#provider.formatCurrency(min)} or higher`;
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
        this.onAuctionEnded();
        this.onSubscriptionChange();
    }
}

customElements.define("bidder-component", BidderComponent);

