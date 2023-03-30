const getBids = async () => {
    let data = [];

    try {
        const response = await fetch('/apps/appuction/bids', {
            method: 'GET',
            headers: new Headers({
                "ngrok-skip-browser-warning": "69420",
                Accept: "application/json"
            }),
        });

        data = await response.json();
    } catch (error) {
        data = error;
    }

    return data;
}



class ObservableImp {
    #bids = [];
    #updates = [];
    #observers = [];

    setBids(value) {
        this.#bids = value;
        this.notifyObservers("created");
    }

    updateBid(bid) {
        //TODO: update bids array
        this.#updates.push(bid);
        this.notifyObservers("updated");
    }

    addObserver(observer) {
        this.#observers.push(observer);
    }

    removeObserver(observer) {
        const index = this.#observers.indexOf(observer);

        if (index > -1) this.#observers.splice(index, 1);
    }

    notifyObservers(cb) {
        for (let index = 0; index < this.#observers.length; index++) {
            const observer = this.#observers[index];

            if (cb == "updated") {
                observer[cb](this.#updates);
            } else {
                observer[cb](this.#bids);
            }
        }
    }
}

class ObserverImp {
    #template = document.querySelector('.card-wrapper').cloneNode(true);
    #wrapper = document.getElementById("product-grid");

    dollarUS() {
        return Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        });
    }

    makeCard(obj) {
        const { product } = obj;
        const { dollarUS } = this;
        const templateCopy = this.#template.cloneNode(true);
        const mediasRef = Array.from(templateCopy.querySelectorAll('.card__media .media'));
        const titlesRef = Array.from(templateCopy.querySelectorAll('.card__heading'));
        const pricesRef = Array.from(templateCopy.querySelectorAll('.card__information .price'));
        const button = templateCopy.querySelector(".quick-add.no-js-hidden");

        if (mediasRef.length) {
            mediasRef.forEach((mediaRef) => {
                mediaRef.innerHTML = `
                    <img src="${product.image.src}" alt="${product.image.alt}" width="${product.image.width}" height="${product.image.height}" />
                `;
            });
        }

        if (titlesRef.length) {
            titlesRef.forEach(titleRef => {
                titleRef.innerHTML = `
                    <a href="/products/${product.handle}" class="full-unstyled-link">
                        ${product.title}
                    </a>
                `;
            });
        }

        if (pricesRef.length) {
            pricesRef.forEach(priceRef => {
                const bidderPriceComponent = document.createElement('bid-price-component');
                bidderPriceComponent.dataset.productId = product.id;
                bidderPriceComponent.innerHTML = `
                    <span data-price-label="Current bid" class="h5">Current bid</span>
                    <span class="price-item price-item--regular">
                        ${dollarUS().format(Number(obj.currentBid))}
                    </span>
                `;
                priceRef.parentElement.appendChild(bidderPriceComponent);
                priceRef.innerHTML = `
                    <div class="price__container">
                        <div class="price__regular">
                            <span class="h5">Your bid</span>
                            <span data-product-id="${product.id}" class="price-item price-item--regular">
                                ${dollarUS().format(Number(obj.myBid))}
                            </span>
                        </div>
                    </div>
                `;
            });
        }

        if (button) {
            button.innerHTML = `
                <countdown-component data-start="${obj.auction.start_at}" data-end="${obj.auction.end_at}" class="countdown">
                    <div class="countdown__days">00 <span>Days</span></div>
                    <div class="countdown__hours">00 <span>Hours</span></div>
                    <div class="countdown__minutes">00 <span>Minutes</span></div>
                    <div class="countdown__seconds">00 <span>Seconds</span></div>
                </countdown-component>

                <bidder-component data-logged-in="true" data-min="${Number(obj.currentBid)}" data-price-label="Current bid:">
                    <form>
                        <input type="hidden" name="product_id" value="${product.id}">
                        <input type="hidden" name="auction_id" value="${obj.auction_id}">
                        <div class="field">
                            <input id="BidForm--template--${product.id}__product-grid" class="field__input" type="number" name="amount">
                            <label class="field__label" for="BidForm--template--${product.id}__product-grid">
                                Amount
                            </label>
                        </div>
                        <div class="field u-mt-1">
                            <button type="submit" class="button button--secondary button--full-width">Place a bid</button>
                        </div>
                    </form>
                </bidder-component>
            `;
        }
        templateCopy.firstElementChild.classList.remove('card--loading');

        return templateCopy;
    }

    priceUpdated({ productId, price }) {
        const priceRef = this.#wrapper.querySelector(`.card-information .price [data-product-id="${productId}"]`);
        priceRef.textContent = this.dollarUS().format(price);
    }

    created(data) {
        this.#wrapper.innerHTML = '';

        if (!data.length) {
            this.#wrapper.parentElement.remove();
        } else {
            data.forEach((item) => {
                const li = document.createElement("li");
                li.classList.add("grid__item");
                li.appendChild(this.makeCard(item));
                this.#wrapper.appendChild(li);
            });
        }
    }

    updated(data) {
        const current = data[data.length - 1];
        this.priceUpdated({ productId: current.product_id, price: current.amount });
    }
}


const onDomLoaded = () => {
    const model = new ObservableImp();
    const view = new ObserverImp();

    getBids().then((data) => {
        model.addObserver(view);
        model.setBids(data);
    });

    document.addEventListener("bid:created", (evt) => model.updateBid(evt.detail.bid.data));
};

document.addEventListener('DOMContentLoaded', onDomLoaded);
