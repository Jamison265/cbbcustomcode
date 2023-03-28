class BidderComponent extends HTMLElement {

    constructor() {
        super();
        this.formRef = this.querySelector('form');
        this.buttonRef = this.querySelector('button');
        this.modalLoginTemplate = this.querySelector(".modalLoginTemplate");
        this.global = {
            modal: document.getElementById("PopupModal-global"),
        };
        this.url = "/apps/appuction/bid";
        this.min = Number(this.dataset.min);
        this.priceLabel = this.dataset.priceLabel.split(':')[0].toLocaleLowerCase();
        this.isCustomerLogged = this.formRef['customer_id'] ? true : false;
    }

    connectedCallback() {
        this.formRef.addEventListener("submit", this.onSubmitHandler.bind(this));
    }

    async onSubmitHandler(evt) {
        evt.preventDefault();

        if (!this.isCustomerLogged) {
            console.log("abrir pop up");
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
            } else {
                this.showMessage({
                    type: "success",
                    message: "Bid successfully ✓",
                    removeMessage: true,
                });
                document.dispatchEvent(
                    new CustomEvent("bid:created", {
                        detail: {
                            bid: data,
                        }
                    })
                );
            }
        }
    }

    async mutate({ url, data, fetchConfig}) {
        const response = await fetch(url, {...fetchConfig, body: data});
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

        if (!this.formRef['amount']) {
            errors["amount"] = "Amount field is required";
        } else if (this.formRef['amount'].value == "") {
            errors["amount"] = "Bid can't be blank submitted";
        } else if (Number(this.formRef["amount"].value) < this.min && this.priceLabel == 'min price') {
            errors["amount"] = `Your bid should be equal or greater than the ${this.priceLabel}`;
        } else if (Number(this.formRef["amount"].value) <= this.min && this.priceLabel != 'min price') {
            errors["amount"] = `Your bid should be greater than the ${this.priceLabel}`;
        } else if (!this.formRef["customer_id"]) {
            errors["customer"] = "Customer field is required";
        } else if (!this.formRef["product_id"]) {
            errors["product"] = "Product field is required";
        } else if (!this.formRef["auction_id"]) {
            errors["auction"] = "Auction field is required";
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
}

customElements.define("bidder-component", BidderComponent);

