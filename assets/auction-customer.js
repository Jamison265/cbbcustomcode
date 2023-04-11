document.addEventListener("DOMContentLoaded", () => {
  const data = {
    items: []
  };

  const metafields = {
    metafields: []
  };

  for (let index = 0; index < customer.data.length; index++) {
    const id = customer.data[index].variantId;
    data.items.push({ id, quantity: 1});
    metafields.metafields.push(customer.data[index].metafieldId);
  }

  if (customer.data.length) {
    const config = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    };

    fetch(`${routes.cart_add_url}`, config)
        .then((response) => {
            console.log(response);
            fetch("/apps/appuction/metafield/clear", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(metafields),
            }).then((res) => {
                console.log(res);
                if (res.ok) {
                    location.href = "/cart";
                }
            });
        })
        .catch((e) => {
            console.error(e);
        })
  }
});
