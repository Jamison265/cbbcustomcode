class CountdownComponent extends HTMLElement {
    #provider;
    constructor() {
        super();
    }

    connectedCallback() {
        this.#provider = this.parentElement;
        this.#provider.addObserver(this);
        this.settings();
        this.main();
    }

    update() {
        this.settings();
        this.main();
    }

    settings() {
        const { startDate, endDate } = this.#provider.getState();
        this.timezone = this.dataset.timezone;
        this.startTime = new Date(startDate);
        this.endTime = new Date(endDate);
        this.daysRef = this.querySelector('.countdown__days');
        this.hoursRef = this.querySelector('.countdown__hours');
        this.minutesRef = this.querySelector('.countdown__minutes');
        this.secondsRef = this.querySelector('.countdown__seconds');
    }

    main() {
        this.countdownInterval = setInterval(() => {
            this.countdown();
        }, 1000);
    }

    countdown() {
        const { timezone, productId } = this.#provider.getState();
        const endTime = Date.parse(this.endTime) / 1000;
        let now = new Date(new Date().toLocaleString("en-US", {
            timeZone: timezone,
        }));
        now = Date.parse(now) / 1000;

        if (now >= endTime) {
            this.innerHTML = '<span style="color: var(--color-message-success)" class="caption-large">Auction has finished</span>';
            clearInterval(this.countdownInterval);

            this.#provider.mutate({ auctionEnded: true });
        }

        let timeleft = endTime - now;
        let days = Math.floor(timeleft / 86400);
        let hours = Math.floor((timeleft - days * 86400) / 3600);
        let minutes = Math.floor((timeleft - days * 86400 - hours * 3600) / 60);
        let seconds = Math.floor(
            timeleft - days * 86400 - hours * 3600 - minutes * 60
        );

        if (hours < "10") hours = "0" + hours;
        if (minutes < "10") minutes = "0" + minutes;
        if (seconds < "10") seconds = "0" + seconds;

        if (this.daysRef) this.daysRef.innerHTML = days == 0 ? '' : `${days} <span>Days</span>`;
        if (this.hoursRef) this.hoursRef.innerHTML = hours == 0 ? '' : `${hours} <span>Hours</span>`;
        if (this.minutesRef) this.minutesRef.innerHTML = `${minutes} <span>Minutes</span>`;
        if (this.secondsRef) this.secondsRef.innerHTML = `${seconds} <span>Seconds</span>`;
    }
}

customElements.define('countdown-component', CountdownComponent);
