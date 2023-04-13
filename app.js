import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: "pusher",
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    wsHost: import.meta.env.VITE_PUSHER_HOST,
    wsPort: import.meta.env.VITE_PUSHER_PORT,
    wssPort: import.meta.env.VITE_PUSHER_PORT,
    forceTLS: false,
    encrypted: true,
    disableStats: true,
    enabledTransports: ["ws", "wss"],
    cluster: import.meta.env.VITE_PUSHER_CLUSTER,
});

document.onreadystatechange = function() {
    if (document.readyState === 'complete') {
        const bidCreated = (e) => {
            const { bid } = e;
            return document.dispatchEvent(
                new CustomEvent("bid:created", {
                    detail: {
                        bid,
                    },
                })
            );
        }

        window.Echo.channel("bids").listen("BidCreated", bidCreated);
    }
}

