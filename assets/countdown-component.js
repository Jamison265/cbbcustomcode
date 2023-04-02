class CountdownComponent extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.settings();
        this.main();
    }

    settings() {
        this.productId = this.dataset.productId;
        this.startDate = this.dataset.start;
        this.endDate = this.dataset.end;
        this.startTime = new Date(this.startDate);
        this.endTime = new Date(this.endDate);
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
        const endTime = Date.parse(this.endTime) / 1000;
        let now = new Date();
        now = Date.parse(now) / 1000;

        if (now >= endTime) {
            this.innerHTML = '<span style="color: var(--color-message-success)" class="caption-large">Auction has finished</span>';
            clearInterval(this.countdownInterval);

            document.dispatchEvent(
                new CustomEvent("auction:ended", {
                    detail: {
                        productId: this.productId,
                    },
                })
            );
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

        this.daysRef.innerHTML = days == 0 ? '' : `${days} <span>Days</span>`;
        this.hoursRef.innerHTML = hours == 0 ? '' : `${hours} <span>Hours</span>`;
        this.minutesRef.innerHTML = `${minutes} <span>Minutes</span>`;
        this.secondsRef.innerHTML = `${seconds} <span>Seconds</span>`;
    }
}

customElements.define('countdown-component', CountdownComponent);
