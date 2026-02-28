const API_BASE = 'http://localhost:4000/api';


async function fetchProducts(filter = {}) {
  const params = new URLSearchParams();

  if (filter.rare) params.append("rare", "true");
  if (filter.category) params.append("category", filter.category);

  const res = await fetch(`${API_BASE}/products?${params.toString()}`);
  return res.json();
}


function renderList(products) {
  const list = document.getElementById("list");
  if (!list) return;

  if (!products.length) {
    list.innerHTML = `<p class="text-light">No products found</p>`;
    return;
  }

  list.innerHTML = products.map(p => `
    <div class="col-lg-4 col-md-6 col-sm-12">
      <div class="product-card h-100">
        ${p.imageUrl ? `
          <img src="${p.imageUrl}"
               class="img-fluid mb-2"
               style="height:200px;object-fit:cover">
        ` : ''}
        <h5>${p.title}</h5>
        <p>${p.description || ''}</p>
        <p>
          <strong>₹${p.price}</strong>
          ${p.rare ? '<span class="badge bg-warning text-dark ms-1">Rare</span>' : ''}
        </p>
        <a class="btn btn-sm btn-outline-primary"
           href="product?id=${p._id}">
          View
        </a>
      </div>
    </div>
  `).join('');
}


document.addEventListener("DOMContentLoaded", async () => {

  
  const list = document.getElementById("list");
  const searchInput = document.getElementById("search");

  if (list) {
    let products = [];

    try {
      products = await fetchProducts();
      renderList(products);
    } catch {
      list.innerHTML = `<p class="text-danger">Failed to load products</p>`;
    }

    if (searchInput) {
      searchInput.addEventListener("input", e => {
        const q = e.target.value.toLowerCase();
        renderList(products.filter(p =>
          p.title.toLowerCase().includes(q)
        ));
      });
    }

    document.querySelectorAll("[data-cat]").forEach(btn => {
      btn.addEventListener("click", async () => {
        document.querySelectorAll("[data-cat]").forEach(b =>
          b.classList.remove("active")
        );
        btn.classList.add("active");

        const cat = btn.dataset.cat;

        if (cat === "all") products = await fetchProducts();
        else if (cat === "rare") products = await fetchProducts({ rare: true });
        else products = await fetchProducts({ category: cat });

        renderList(products);
      });
    });
  }

  
  const addForm = document.getElementById("addForm");
  const msg = document.getElementById("msg");

  if (addForm && msg) {
    addForm.addEventListener("submit", async (e) => {
      e.preventDefault(); 

      msg.innerHTML = "";

      const fd = new FormData(addForm);
      const body = {
        shopName: fd.get("shopName"),
        shopAddress: fd.get("shopAddress"),
        title: fd.get("title"),
        description: fd.get("description"),
        imageUrl: fd.get("imageUrl"),
        price: Number(fd.get("price") || 0),
        category: fd.get("category"),
        rare: fd.get("rare") ? true : false
      };

      if (!body.category) {
        msg.innerHTML = `<div class="alert alert-danger">Please select category</div>`;
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");

        msg.innerHTML = `
          <div class="alert alert-success">
            ✅ Product added successfully!
          </div>
        `;
        addForm.reset();

      } catch (err) {
        msg.innerHTML = `
          <div class="alert alert-danger">
            ❌ ${err.message}
          </div>
        `;
      }
    });
  }

  
  const productContainer = document.getElementById("product");
  if (productContainer) {
    const id = new URLSearchParams(location.search).get("id");

    if (!id) {
      productContainer.innerHTML = `<p class="text-danger">Invalid Product</p>`;
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/products/${id}`);
      if (!res.ok) throw new Error("Not found");

      const p = await res.json();
      productContainer.innerHTML = `
      <div class="card shadow-sm border-0 mx-auto" style="max-width: 720px;">
      ${p.imageUrl ? `
      <img 
        src="${p.imageUrl}" 
        class="card-img-top" 
        style="max-height:360px; object-fit:cover;"
        alt="${p.title}"
      >
    ` : ""}

    <div class="card-body">

      <div class="d-flex justify-content-between align-items-start mb-2">
        <h3 class="card-title mb-0">${p.title}</h3>
        ${p.rare ? `<span class="badge bg-warning text-dark">Rare</span>` : ""}
      </div>

      <p class="text-muted mb-3">${p.description || "No description provided."}</p>

      <hr>

      <div class="row mb-3">
        <div class="col-6">
          <small class="text-muted">Shop</small>
          <p class="mb-0 fw-semibold">${p.shopName}</p>
        </div>
        <div class="col-6">
          <small class="text-muted">Category</small>
          <p class="mb-0 fw-semibold text-capitalize">${p.category}</p>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-6">
          <small class="text-muted">Address</small>
          <p class="mb-0">${p.shopAddress}</p>
        </div>
        <div class="col-6 text-end">
          <small class="text-muted">Price</small>
          <h4 class="fw-bold text-success mb-0">₹${p.price}</h4>
        </div>
      </div>

      <div class="d-flex justify-content-between">
        <a href="products.html" class="btn btn-outline-secondary">
          ← Back to Products
        </a>
      </div>

    </div>
  </div>
`;
    } catch {
      productContainer.innerHTML = `<p class="text-danger">Failed to load product</p>`;
    }
  }
});


async function subscribe() {
  const emailInput = document.getElementById('email');
  const msg = document.getElementById('msg');

  if (!emailInput || !msg) return;

  const email = emailInput.value.trim();
  if (!email) {
    msg.innerHTML = "<span class='text-danger'>Please enter email</span>";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    msg.innerHTML = `<span class="text-success">${data.message}</span>`;
    emailInput.value = "";

  } catch {
    msg.innerHTML = "<span class='text-danger'>Server error</span>";
  }
}
