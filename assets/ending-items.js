function template(item) {
    const {
        id,
        title,
        productId,
        auctionId,
        handle,
        featuredImage,
        startDate,
        endDate,
        timezone,
        min,
        currentBid,
        active
    } = item;

    const { customerId, subscriptions, bids } = window.ending || { customerId: null, subscriptions: [], bids: [] };
    const isSubscribed = subscriptions?.find(subscription => subscription.includes(handle)) ? true : false;
    const customerBid = bids?.find((bid) => bid.handle == handle);

    const dollarUS = Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    });

    return `
        <div class="card-wrapper product-card-wrapper underline-links-hover">
            <div
                class="card card--card card--secondary card--media color-background-2 gradient"
                style="--ratio-percent: 100%;"
            >
                <div
                    class="card__inner  ratio"
                    style="--ratio-percent: 100%;"
                >
                    <div class="card__media">
                        <div class="media media--transparent media--hover-effect">
                            <img src="${featuredImage?.url}" width="${featuredImage?.width}" height="${featuredImage?.height}" class="motion-reduce" loading="lazy">
                        </div>
                    </div>
                    <div class="card__content">
                        <div class="card__information">
                            <h3 class="card__heading">
                                <a href="/products/${handle}" class="full-unstyled-link" aria-labelledby>${title}</a>
                            </h3>
                        </div>
                    </div>
                </div>
                <div class="card__content">
                    <div class="card__information u-pb-0">
                        <h3 class="card__heading h4">
                            <a href="/products/${handle}" class="full-unstyled-link" aria-labelledby>${title}</a>
                        </h3>
                        <bid-price-component
                            data-product-id="${productId}"
                            data-min-price="${currentBid ? currentBid.amount : min}"
                        >
                            ${active ? `
                                ${currentBid ? `
                                    <span data-price-label class="h5">Current bid:</span>
                                    <span class="price-item price-item--regular">
                                        ${dollarUS.format(currentBid.amount)}
                                    </span>
                                    ` : `
                                    <span data-price-label class="h5">Min price:</span>
                                    <span class="price-item price-item--regular">
                                        ${min}
                                    </span>
                                `}
                                ` : `
                                <span data-price-label class="h5">Final bid</span>
                                <span class="price-item price-item--regular">
                                    ${dollarUS.format(currentBid.amount)}
                                </span>
                            `}
                        </bid-price-component>
                    </div>
                    <div class="quick-add no-js-hidden">
                        <auction-provider>
                            <script type="application/json">
                                {
                                    "startDate": "${startDate}",
                                    "endDate": "${endDate}",
                                    "productId": ${productId},
                                    "timezone": "${timezone}",
                                    "active": ${active},
                                    "isCustomerLogged": ${customerId != null},
                                    ${customerId != null ? `"customerBid": ${customerBid?.amount || 0},` : ''}
                                    "min": ${currentBid ? currentBid.amount : min},
                                    "priceLabel": "Min price: ",
                                    "auctionId": ${auctionId},
                                    "detailId": ${id},
                                    "amount": 0,
                                    "isSubscribed": ${isSubscribed},
                                    "channel": null,
                                    "customerId": ${customerId}
                                }
                            </script>
                            <countdown-component
                                class="countdown"
                            >
                                <div class="countdown__days">
                                    00<span>Days</span>
                                </div>
                                <div class="countdown__hours">
                                    00<span>Hours</span>
                                </div>
                                <div class="countdown__minutes">
                                    00<span>Minutes</span>
                                </div>
                                <div class="countdown__seconds">
                                    00<span>Seconds</span>
                                </div>
                            </countdown-component>
                            <bidder-component
                                data-product-id="${productId}"
                                data-logged-in="${customerId != null}"
                                data-min="${min}"
                                data-price-label="Current bid: "
                            >
                                <form data-action="bid">
                                    <input type="hidden" name="product_id" value="${productId}">
                                    <input type="hidden" name="auction_id" value="${auctionId}">
                                    <div class="field">
                                        <input
                                            id="BidForm--template--${id}"
                                            class="field__input"
                                            type="number"
                                            name="amount"
                                            ${!active ? 'disabled' : ''}
                                        >
                                        <label
                                            class="field__label"
                                            for="BidForm--template--${id}"
                                        >
                                            Amount
                                        </label>
                                    </div>
                                    <div class="field u-mt-1">
                                        <button
                                            type="submit"
                                            class="button button--secondary button--full-width"
                                            ${!active ? 'disabled' : ''}
                                        >
                                            <span>Place a bid</span>
                                            <div class="loading-overlay__spinner hidden">
                                                <svg
                                                    aria-hidden="true"
                                                    focusable="false"
                                                    class="spinner"
                                                    viewBox="0 0 66 66"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>
                                                </svg>
                                            </div>
                                        </button>
                                    </div>
                                </form>
                                <form data-action="subscribe">
                                    <input type="hidden" name="channel" value="sms and email">
                                    <div class="u-mt-1">
                                        <button
                                            aria-label="${isSubscribed ? 'Unsubscribe' : 'Watch'}"
                                            data-label-alternative="${isSubscribed ? 'Unsubscribe' : 'Watch'}"
                                            type="submit"
                                            class="button button--full-width ${!isSubscribed ? 'button--tertiary' : 'button--success'}"
                                            ${!active ? 'disabled' : ''}
                                        >
                                            <svg
                                                class="icon"
                                                aria-hidden="true"
                                                width="2.4rem"
                                                height="2.4rem"
                                                viewBox="0 0 24 24"
                                                fill="#fff"
                                                stroke="#000"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path d="M12.0009 5C13.4331 5 14.8066 5.50571 15.8193 6.40589C16.832 7.30606 17.4009 8.52696 17.4009 9.8C17.4009 11.7691 17.846 13.2436 18.4232 14.3279C19.1606 15.7133 19.5293 16.406 19.5088 16.5642C19.4849 16.7489 19.4544 16.7997 19.3026 16.9075C19.1725 17 18.5254 17 17.2311 17H6.77066C5.47638 17 4.82925 17 4.69916 16.9075C4.54741 16.7997 4.51692 16.7489 4.493 16.5642C4.47249 16.406 4.8412 15.7133 5.57863 14.3279C6.1558 13.2436 6.60089 11.7691 6.60089 9.8C6.60089 8.52696 7.16982 7.30606 8.18251 6.40589C9.19521 5.50571 10.5687 5 12.0009 5ZM12.0009 5V3M9.35489 20C10.0611 20.6233 10.9888 21.0016 12.0049 21.0016C13.0209 21.0016 13.9486 20.6233 14.6549 20" stroke="inherit" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                            </svg>
                                            <span aria-hidden="true" class="u-ml-small">${isSubscribed ? 'Unsubscribe' : 'Watch'}</span>
                                            <div class="loading-overlay__spinner hidden">
                                                <svg
                                                    aria-hidden="true"
                                                    focusable="false"
                                                    class="spinner"
                                                    viewBox="0 0 66 66"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>
                                                </svg>
                                            </div>
                                        </button>
                                    </div>
                                </form>
                                ${customerId != null ? `
                                    <template class="modalTemplate">
                                        <h2>Bid Confirmation</h2>
                                        <div class="rte">
                                            <p>By clicking the Confirm Bid button below you are confirming that you want to place a bid of <span class="price-item price-item--regular font-body-bold" id="bidAmount"></span> on this product and agree to our <a href="https://cbbauctions.com/pages/auction-rules">auction rules</a></p>
                                        </div>
                                        <br/>
                                        <div class="right">
                                            <button class="button button--primary" id="cancelBid">Cancel</button>
                                            <button class="button button--secondary" id="confirmBid">
                                                <span>Confirm Bid</span>
                                                <div class="loading-overlay__spinner hidden">
                                                    <svg
                                                        aria-hidden="true"
                                                        focusable="false"
                                                        class="spinner"
                                                        viewBox="0 0 66 66"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>
                                                    </svg>
                                                </div>
                                            </button>
                                        </div>
                                    </template>
                                    ` : `
                                    <template class="modalTemplate">
                                        <h2 class="center">Login to your account</h2>
                                        <div class="rte center">
                                            <p>Hey! Before placing a bid please <a href="/account/login">login</a> into your account.</p>
                                            <p><span class="font-body-bold">Don't have an account?</span> don't worry you can create one by clicking <a href="/account/register">here</a></p>
                                        </div>
                                    </template>
                                `}
                            </bidder-component>
                        </auction-provider>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function getEndingItems(page = 1) {
    const response = await fetch(`/apps/appuction/ending-soon?page=${page}`);
    const data = await response.json();

    return data;
}

async function getTemplates(handles) {
    // use promise.all to fetch all products
    const promises = handles.map(async (handle) => {
        const response = await fetch(`/products/${handle}?section_id=product-card`);
        const content = await response.text();

        return content;
    });

    const contents = await Promise.all(promises);

    return contents;
}

class EndingSoon {
    constructor(wrapper) {
        this.page = 1;
        this.totalPages = 1;
        this.templatesToRender = [];
        this.renderIsPending = false;
        this.wrapper = wrapper;

        subscribe('afterRender', async () => {
            await this.fetchData();
        });

        subscribe('afterDataFetched', () => {
            if (this.renderIsPending) {
                this.renderTemplates();
            }
        });
    }

    async fetchData() {
        const endingItems = await getEndingItems(this.page);

        if (!endingItems) return;

        this.templatesToRender = endingItems.data.map(item => template(item));
        this.totalPages = endingItems.meta.last_page;
        this.page += 1;

        publish('afterDataFetched');
    }

    renderTemplates() {
        if (this.templatesToRender.length > 0) {
            this.templatesToRender.forEach((markup) => {
                const li = document.createElement('li');
                li.innerHTML = markup;
                li.classList.add('grid__item');

                this.wrapper.appendChild(li);
            });

            publish('afterRender');
            this.templatesToRender = [];
            this.renderIsPending = false;
        } else {
            if (this.page <= this.totalPages) {
                this.renderIsPending = true;
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", async function() {

    const wrapper = document.querySelector('.product-grid');
    const endingSoon = new EndingSoon(wrapper);
    await endingSoon.fetchData();
    wrapper.innerHTML = '';
    endingSoon.renderTemplates();

    // Infinite scroll
    const options = {
        root: null,
        rootMargin: '150px',
        threshold: 1.0
    };
    const target = document.getElementById('loadMore');
    const callback = (entries, observer) => {
        entries.forEach(async (entry) => {
            if (entry.isIntersecting) {
                endingSoon.renderTemplates();

                if (endingSoon.page > endingSoon.totalPages) {
                    observer.unobserve(target);
                    target.remove();
                }
            }
        });
    };

    const observer = new IntersectionObserver(callback, options);
    observer.observe(target);
});
