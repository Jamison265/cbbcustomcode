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
        this.fetcher = fetcher;
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
        const endingItems = await this.fetcher.fetchData(() => getEndingItems(this.page), true);

        console.log(this.fetcher.isLoading, "loading");
        if (!endingItems) return;

        console.log(endingItems, "items");
        this.templatesToRender = await this.fetcher.fetchData(() => getTemplates(endingItems.data), true);
        console.log(this.templatesToRender);
        this.totalPages = endingItems.meta.last_page;
        this.page += 1;

        publish('afterDataFetched');
    }

    renderTemplates() {
        this.templatesToRender?.forEach((template) => {
            const html = new DOMParser().parseFromString(template, 'text/html');
            const li = document.createElement('li');
            li.innerHTML = html.querySelector('.shopify-section').innerHTML;
            li.classList.add('grid__item');

            this.wrapper.appendChild(li);
        });

        if (this.templatesToRender?.length > 0) {
            publish('afterRender');
            this.templatesToRender = [];
            this.renderIsPending = false;
        } else {
            // waiting for more items to be fetched
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
                    console.log('disconnecting observer');
                    observer.unobserve(target);
                    target.remove();
                }
            }
        });
    };

    const observer = new IntersectionObserver(callback, options);
    observer.observe(target);
});
