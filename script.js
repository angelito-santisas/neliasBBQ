(function () {
'use strict';

        // ---------------------------------------------------------------
        // Data. In a real backend this would come from an API; kept as a
        // static catalog here since this is a front-end mockup.
        // ---------------------------------------------------------------
        const FEE = 50;
        const currency = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

        const menuItems = [
            { id: 'isaw', name: 'Isaw ng Manok', category: 'Offal Delights', price: 180,
              desc: 'Carefully cleansed chicken intestines grilled over coconut charcoal with our signature sweet glaze.',
              img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80' },
            { id: 'porkbbq', name: 'Pork BBQ Skewers', category: 'Classics', price: 220,
              desc: 'Tender pork shoulder marinated in soy sauce, banana ketchup, calamansi, and garlic.',
              img: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80' },
            { id: 'tenga', name: 'Tenga (Pig Ears)', category: 'Offal Delights', price: 170,
              desc: 'Slow-simmered and flame-grilled pork ears offering a crisp, gelatinous, smoky texture.',
              img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80' },
            { id: 'baluna', name: 'Baluna (Gizzard)', category: 'Offal Delights', price: 160,
              desc: 'Savory chicken gizzards seasoned with crushed peppercorns and dark cane vinegar glaze.',
              img: 'https://images.unsplash.com/photo-1532636875304-0c89119d9b4d?auto=format&fit=crop&w=600&q=80' },
            { id: 'tumbong', name: 'Tumbong Gold', category: 'Offal Delights', price: 200,
              desc: 'Slow-braised pig large intestine skewered and charred to caramelized perfection.',
              img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80' },
            { id: 'adidas', name: 'Chicken Feet (Adidas)', category: 'Classics', price: 150,
              desc: 'Flavorful chicken feet marinated in star anise, soy, chili, and sweet palm sugar.',
              img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80' },
            { id: 'suka', name: 'Spiced Vinegar (Sinamak)', category: 'Specialty Dipping Sauces', price: 50,
              desc: 'Infused coconut vinegar with wild labuyo chilis, garlic cloves, red onions, and ginger.',
              img: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=600&q=80' },
            { id: 'manong', name: 'Sweet & Sour Manong Sauce', category: 'Specialty Dipping Sauces', price: 50,
              desc: 'The timeless street-side dipping sauce thickened with garlic, brown sugar, and chili.',
              img: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=600&q=80' }
        ];

        const menuById = new Map(menuItems.map(item => [item.id, item]));

        // ---------------------------------------------------------------
        // Cart module: encapsulated state instead of a bare global object.
        // Nothing outside this module can mutate `items` directly, which
        // means every mutation goes through one code path we can reason
        // about, validate, and (later) sync with a backend.
        // ---------------------------------------------------------------
        const Cart = (function () {
            const items = new Map(); // itemId -> quantity

            function add(itemId) {
                if (!menuById.has(itemId)) return;
                items.set(itemId, (items.get(itemId) || 0) + 1);
            }

            function updateQty(itemId, delta) {
                if (!items.has(itemId)) return;
                const next = items.get(itemId) + delta;
                if (next <= 0) {
                    items.delete(itemId);
                } else {
                    items.set(itemId, next);
                }
            }

            function clear() {
                items.clear();
            }

            function getEntries() {
                return Array.from(items.entries()).map(([id, qty]) => ({ item: menuById.get(id), qty }));
            }

            function getCount() {
                let total = 0;
                for (const qty of items.values()) total += qty;
                return total;
            }

            function getSubtotal() {
                let subtotal = 0;
                for (const [id, qty] of items.entries()) {
                    subtotal += menuById.get(id).price * qty;
                }
                return subtotal;
            }

            function isEmpty() {
                return items.size === 0;
            }

            return { add, updateQty, clear, getEntries, getCount, getSubtotal, isEmpty };
        })();

        // ---------------------------------------------------------------
        // Small DOM helpers
        // ---------------------------------------------------------------
        function escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        function showToast(message) {
            const toast = document.getElementById('toast');
            document.getElementById('toast-msg').textContent = message;
            toast.classList.add('show');
            clearTimeout(showToast._t);
            showToast._t = setTimeout(() => toast.classList.remove('show'), 3000);
        }

        // ---------------------------------------------------------------
        // Tab switching (accessible tablist pattern)
        // ---------------------------------------------------------------
        function switchTab(tabName) {
            document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
            document.querySelectorAll('.nav-link[role="tab"]').forEach(link => link.setAttribute('aria-selected', 'false'));

            document.getElementById(`page-${tabName}`).classList.add('active');
            document.getElementById(`nav-${tabName}`).setAttribute('aria-selected', 'true');

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // ---------------------------------------------------------------
        // Rendering
        // ---------------------------------------------------------------
        function renderMenu() {
            const container = document.getElementById('menu-grid-container');
            container.innerHTML = menuItems.map(item => `
                <div class="menu-card">
                    <img src="${item.img}" alt="${escapeHtml(item.name)}" class="menu-card-img" loading="lazy" onerror="this.style.opacity=0">
                    <div class="menu-card-body">
                        <span class="menu-card-badge">${escapeHtml(item.category)}</span>
                        <div class="menu-card-title">
                            <span>${escapeHtml(item.name)}</span>
                            <span class="menu-card-price">${currency.format(item.price)}</span>
                        </div>
                        <p class="menu-card-desc">${escapeHtml(item.desc)}</p>
                        <button class="btn btn-primary add-to-cart-btn" data-add-to-cart="${item.id}" type="button">Add To Order</button>
                    </div>
                </div>
            `).join('');
        }

        function renderCartCount() {
            document.getElementById('cart-count').textContent = String(Cart.getCount());
        }

        function renderCart() {
            const cartContainer = document.getElementById('cart-items-container');
            const entries = Cart.getEntries();

            if (entries.length === 0) {
                cartContainer.innerHTML = `
                    <div style="text-align: center; padding: 3rem 0;">
                        <p style="font-size:1.1rem; color: var(--text-muted);">Your order cart is currently empty.</p>
                        <button class="btn btn-outline" style="margin-top: 1.5rem;" data-tab="menu" type="button">Explore Menu</button>
                    </div>
                `;
                document.getElementById('summary-subtotal').textContent = currency.format(0);
                document.getElementById('summary-total').textContent = currency.format(FEE);
                return;
            }

            cartContainer.innerHTML = entries.map(({ item, qty }) => `
                <div class="cart-item">
                    <img src="${item.img}" class="cart-item-img" alt="${escapeHtml(item.name)}" loading="lazy" onerror="this.style.opacity=0">
                    <div class="cart-item-info">
                        <h4>${escapeHtml(item.name)}</h4>
                        <p>${currency.format(item.price)} each</p>
                    </div>
                    <div class="qty-controls">
                        <button class="qty-btn" data-qty-delta="-1" data-item-id="${item.id}" type="button" aria-label="Decrease quantity of ${escapeHtml(item.name)}">-</button>
                        <span style="font-weight:600; padding:0 6px;">${qty}</span>
                        <button class="qty-btn" data-qty-delta="1" data-item-id="${item.id}" type="button" aria-label="Increase quantity of ${escapeHtml(item.name)}">+</button>
                    </div>
                    <div style="font-weight:700; color:var(--accent-gold);">
                        ${currency.format(item.price * qty)}
                    </div>
                </div>
            `).join('');

            const subtotal = Cart.getSubtotal();
            document.getElementById('summary-subtotal').textContent = currency.format(subtotal);
            document.getElementById('summary-total').textContent = currency.format(subtotal + FEE);
        }

        function refreshCartUI() {
            renderCartCount();
            renderCart();
        }

        // ---------------------------------------------------------------
        // Event wiring — delegated listeners instead of inline onclick.
        // This keeps behavior out of markup and means dynamically
        // rendered buttons never need a new listener attached by hand.
        // ---------------------------------------------------------------
        document.addEventListener('click', function (e) {
            const tabTrigger = e.target.closest('[data-tab]');
            if (tabTrigger) {
                switchTab(tabTrigger.dataset.tab);
                return;
            }

            const addBtn = e.target.closest('[data-add-to-cart]');
            if (addBtn) {
                const id = addBtn.dataset.addToCart;
                Cart.add(id);
                refreshCartUI();
                showToast(`Added ${menuById.get(id).name} to your order.`);
                return;
            }

            const qtyBtn = e.target.closest('[data-qty-delta]');
            if (qtyBtn) {
                Cart.updateQty(qtyBtn.dataset.itemId, Number(qtyBtn.dataset.qtyDelta));
                refreshCartUI();
                return;
            }

            if (e.target.id === 'book-table-btn') {
                showToast('Table reservation feature coming soon!');
                return;
            }

            if (e.target.id === 'checkout-btn') {
                handleCheckout();
            }
        });

        function handleCheckout() {
            if (Cart.isEmpty()) {
                showToast('Please add items to your cart first!');
                return;
            }
            showToast('Order submitted successfully! We look forward to serving you.');
            Cart.clear();
            refreshCartUI();
        }

        // ---------------------------------------------------------------
        // Feedback form: basic validation before "submit" so the empty
        // state (no rating selected) doesn't silently succeed.
        // ---------------------------------------------------------------
        document.getElementById('feedback-form').addEventListener('submit', function (e) {
            e.preventDefault();
            const form = e.target;
            const rated = form.querySelector('input[name="rate"]:checked');
            const rateError = document.getElementById('rate-error');

            if (!rated) {
                rateError.classList.add('show');
                form.querySelector('.stars').scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
            rateError.classList.remove('show');

            showToast('Thank you for your feedback!');
            form.reset();
        });

        // ---------------------------------------------------------------
        // Init
        // ---------------------------------------------------------------
        renderMenu();
        refreshCartUI();
})();
