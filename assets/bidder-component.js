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
        document.addEventListener("bid:created", this.onBidCreated.bind(this));
    }

    settings() {
        const { productId, priceLabel, isCustomerLogged, isSubscribed, customerId } = this.#provider.getState();
        this.#isSubscribed = isSubscribed;
        this.formRef = this.querySelector('form[data-action="bid"]');
        this.subscribeFormRef = this.querySelector('form[data-action="subscribe"]');
        this.buttonRef = this.querySelector("button");
        this.modalTemplate = this.querySelector(".modalTemplate");
        this.global = {
            modal: document.getElementById("PopupModal-global"),
        };
        this.productId = productId;
        this.priceLabel = priceLabel;
        this.customerId = customerId;
        this.isCustomerLogged = isCustomerLogged;
    }

    main() {
        this.onAuctionEnded();
    }

    onBidCreated(evt) {
        const { product_id, amount, customer_id } = evt.detail.bid;

        if (this.productId !== Number(product_id) && this.customerId !== Number(customer_id)) return false;
      
        this.toggleFormLoading();
        this.showMessage({
            type: "success",
            message: "Bid successfully ✓",
            removeMessage: true,
        });

        this.formRef.reset();
    }

    toggleFormLoading() {
        const button = this.buttonRef;
        const spinner = button.querySelector('.loading-overlay__spinner');
        const span = button.querySelector('span');

        if (!button.disabled) {
            span.classList.add('hidden');
            spinner.classList.remove('hidden');
            button.disabled = true;
        } else {
            spinner.classList.add('hidden');
            span.classList.remove('hidden');
            button.disabled = false;
        }
    }

    async onSubmitHandler(evt) {
        evt.preventDefault();
        let template = this.modalTemplate.cloneNode(true);
        const modalContent = this.global.modal.querySelector(
            ".modal-video__content-info"
        );

        if (!this.isCustomerLogged) {
            modalContent.innerHTML = template.innerHTML;
            this.global.modal.show(this.buttonRef);
        } else {
            const hasErrors = this.validateForm();
            if (hasErrors) return false;

            const closeBtn = document.getElementById("ModalClose-global");

            modalContent.classList.add("modal-video__content-info--confirm-bid");

            modalContent.innerHTML = template.innerHTML;
            const spanAmount = modalContent.querySelector("#bidAmount");
            spanAmount.innerHTML = "$" + this.formRef["amount"].value;
            this.global.modal.show(this.buttonRef);
            this.#provider.mutate({ isModalOpen: true });

            const confirmBtn = modalContent.querySelector("#confirmBid");
            const cancelBtn = modalContent.querySelector("#cancelBid");
            const _this = this;

            confirmBtn.addEventListener("click", async function(evt) {
                const { url } = _this;
                const formData = new FormData(_this.formRef);
                const spinner = confirmBtn.querySelector('.loading-overlay__spinner');
                const span = confirmBtn.querySelector('span');

                span.classList.add('hidden');
                spinner.classList.remove('hidden');
                confirmBtn.disabled = true;

                spinner.classList.add('hidden');
                span.classList.remove('hidden');
                confirmBtn.disabled = false;

                _this.toggleFormLoading();
                closeBtn.click();
                _this.#provider.mutate({ isModalOpen: false });

                const data = await _this.mutate({
                    url,
                    data: formData,
                    fetchConfig: {
                        method: "POST",
                        headers: {
                            Accept: "application/json",
                        },
                    },
                });

                if (_this.buttonRef.disabled) {
                    _this.toggleFormLoading();
                }

                if (data.errors) {
                    _this.handlerErrors(data.errors);
                } else if (data.message) {
                    _this.showMessage({
                        type: "info",
                        message: data.message,
                        removeMessage: true,
                    });
                    _this.formRef['amount'].value = data.bid.amount;
                }
            });

            cancelBtn.addEventListener("click", function(evt) {
                evt.preventDefault();
                closeBtn.click();

                modalContent.classList.remove("modal-video__content-info--confirm-bid");
                _this.#provider.mutate({ isModalOpen: false });
            });

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
        const { auctionEnded, isModalOpen } = this.#provider.getState();

        if (auctionEnded) {

            if(isModalOpen) {
                /**
                * If the auction has ended, we need to update the content of the modal
                */
               const modalContent = this.global.modal.querySelector(
                   ".modal-video__content-info"
               );

               modalContent.innerHTML = `
                   <h2>Sorry, this auction has ended.</h2>
                   <div class="rte">
                       <p>
                           Our auctions are only available for a limited time. Please check back soon for more auctions.
                           <a href="/collections/all">Shop now</a>
                       </p>
                   </div>
               `;
            } // Here ends the modal update

            const elements = this.formRef.elements;
            const notifyBtn = this.subscribeFormRef.querySelector("button");

            for (let index = 0; index < elements.length; index++) {
                const element = elements[index];
                element.disabled = true;
            }

            notifyBtn.disabled = true;
            this.#provider.removeObserver(this);
        }
    }

    update() {
        this.onAuctionEnded();
        this.onSubscriptionChange();
    }
}

customElements.define("bidder-component", BidderComponent);

