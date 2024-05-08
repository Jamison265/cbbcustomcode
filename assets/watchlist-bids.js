async function getSections(page) {
  const response = await fetch(`${window.location.pathname}?page=${page}`);
  const content = await response.text();

  return content;
}

function addToWrapper(wrapper, children) {
  for (let index = 0; index < children.length; index++) {
    const item = children[index];
    
    wrapper.appendChild(item);
  }
}

document.addEventListener("DOMContentLoaded", async function() {
  const { totalPages } = window;
  const watchListEl = document.getElementById('watchlist-product-grid');
  const bidListEl = document.getElementById('bidlist-product-grid');

  if (totalPages > 1) {
    for (let index = 2; index <= totalPages; index++) {
      const content = await getSections(index);
      const html = new DOMParser().parseFromString(content, 'text/html');
      const newWatchListEl = html.getElementById('watchlist-product-grid');
      const newBidListEl = document.getElementById('bidlist-product-grid');
      const watchChildren = newWatchListEl.querySelectorAll("li");
      const bidChildren = newBidListEl.querySelectorAll("li");
      
      addToWrapper(watchListEl, watchChildren);
      addToWrapper(bidListEl, bidChildren);
    }
  }  
});