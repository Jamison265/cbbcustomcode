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
        console.log("from bidder");
    }

    connectedCallback() {
        this.formRef.addEventListener("submit", this.onSubmitHandler.bind(this));
    }

    async onSubmitHandler(evt) {
        evt.preventDefault();

        if (!this.formRef['customer_id']) {
            console.log("abrir pop up");
            const template = this.modalLoginTemplate.cloneNode(true);
            const modalContent = this.global.modal.querySelector(
                ".modal-video__content-info"
            );
            modalContent.innerHTML = template.innerHTML;
            this.global.modal.show(this.buttonRef);
        } else {
            const amount = Number(this.formRef['amount'].value);
          
            if (amount < this.min) {
                this.handlerErrors({ amount: ['Your bid should be equal or greater than the minimum price.']});
                return false;
            }
            console.log("submit");
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
                        },
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
            const values = errors[prop];

            for (let index = 0; index < values.length; index++) {
                this.showMessage({
                    type: "error",
                    message: `🚨 ${values[index]}`,
                });
            }
        }
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

