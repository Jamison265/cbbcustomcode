async function getSections() {
    const sections = [
        "template--18335069962537__product-grid"
    ];
    const response = await fetch(`${window.ending_soon_url}&sections=${sections.join(",")}`);
    const content = await response.json();

    return content["template--18335069962537__product-grid"];
}

function addToWrapper(wrapper, children) {
    for (let index = 0; index < children.length; index++) {
        const item = children[index];

        wrapper.children[index].innerHTML = item.innerHTML;
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    const content = await getSections();
    const wrapper = document.getElementById('Slider-template--18335070191913__d2543e03-de3f-44ac-9b18-349e4b4e3117');
    const html = new DOMParser().parseFromString(content, 'text/html');
    const children = html?.querySelectorAll("#product-grid li");
    const first10 = Array.from(children).slice(0, 10);


    addToWrapper(wrapper, first10);
});
