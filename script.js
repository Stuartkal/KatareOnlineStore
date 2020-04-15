//contentful Request
const client = contentful.createClient({
	// This is the space ID. A space is like a project folder in Contentful terms
	space: '86hc0dtv3g49',
	// This is the access token for this space. Normally you get both ID and the token in the Contentful web app
	accessToken: 'G9eaaCuz3xk1fz5wfHi6ZLvPn77MZ3xo1TDl5muA2tE'
});

//Variable Declaration
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDom = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productDom = document.querySelector('.products-center');

//cart
let cart = [];

//buttons
let buttonDOM = [];

//getting products
class Products {
	async getProducts() {
		try {
			let contentful = await client.getEntries({
				content_type: 'katareOnlineStore'
			});

			// let result = await fetch('products.json');
			// let data = await result.json();

			let products = contentful.items;
			products = products.map((item) => {
				const { title, price } = item.fields;
				const { id } = item.sys;
				const image = item.fields.image.fields.file.url;
				return { title, price, image, id };
			});

			return products;
		} catch (error) {
			console.log(error);
		}
	}
}

//getting products
class UI {
	displayProducts(products) {
		console.log(products);
		let result = '';
		products.forEach((product) => {
			result += `
			<article class="product">
                    <div class="img-container">
                        <img src=${product.image} class="product-img"/>
                        <button class="bag-btn" data-id=${product.id}>
                            <i class="fas fa-shopping-cart"></i>
                            add to cart
                        </button>
                    </div> 
                    <h3>${product.title}</h3>
                    <h4>Shs ${product.price}</h4>
            </article>
			`;
		});
		productDom.innerHTML = result;
	}

	getBagButtons() {
		const buttons = [ ...document.querySelectorAll('.bag-btn') ];
		buttonDOM = buttons;
		buttons.forEach((button) => {
			let id = button.dataset.id;
			let inCart = cart.find((item) => item.id === id);
			if (inCart) {
				button.innerText = 'In Cart';
				button.disabled = true;
			}
			button.addEventListener('click', (e) => {
				e.target.innerText = 'In cart';
				e.target.disabled = true;

				// get product
				let cartItem = { ...Storage.getProduct(id), amount: 1 };

				// add product to cart
				cart = [ ...cart, cartItem ];

				// save cart in local storage
				Storage.saveCart(cart);
				// set cart values
				this.setCartValues(cart);
				// display cart item
				this.addCartItem(cartItem);
				// show cart
				this.showCart();
			});
		});
	}
	setCartValues(cart) {
		let tempTotal = 0;
		let itemsTotal = 0;
		cart.map((item) => {
			tempTotal += item.price * item.amount;
			itemsTotal += item.amount;
		});
		cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
		cartItems.innerText = itemsTotal;
	}
	addCartItem(item) {
		const div = document.createElement('div');
		div.classList.add('cart-item');
		div.innerHTML = `
			<img src=${item.image} alt="matooke">
            <div>
                <h4>${item.title}</h4>
                <h5>Shs${item.price}</h5>
                <Span class="remove-item" data-id=${item.id}>remove</Span>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>
		`;
		cartContent.appendChild(div);
		console.log(cartContent);
	}
	showCart() {
		cartOverlay.classList.add('transparentBg');
		cartDom.classList.add('showCart');
	}
	setupApp() {
		cart = Storage.getCart();
		this.setCartValues(cart);
		this.populateCart(cart);
		cartBtn.addEventListener('click', this.showCart);
		closeCartBtn.addEventListener('click', this.hideCart);
	}
	populateCart(cart) {
		cart.forEach((item) => this.addCartItem(item));
	}
	hideCart() {
		cartOverlay.classList.remove('transparentBg');
		cartDom.classList.remove('showCart');
	}
	cartLogic() {
		//clear cart btn
		clearCartBtn.addEventListener('click', () => {
			this.clearCart();
		});
		// cart funtionality
		cartContent.addEventListener('click', (e) => {
			if (e.target.classList.contains('remove-item')) {
				let removeItem = e.target;
				let id = removeItem.dataset.id;
				cartContent.removeChild(removeItem.parentElement.parentElement);
				this.removeItem(id);
			} else if (e.target.classList.contains('fa-chevron-up')) {
				let addAmount = e.target;
				let id = addAmount.dataset.id;
				let tempItem = cart.find((item) => item.id === id);
				tempItem.amount = tempItem.amount + 1;
				Storage.saveCart(cart);
				this.setCartValues(cart);
				addAmount.nextElementSibling.innerText = tempItem.amount;
			} else if (e.target.classList.contains('fa-chevron-down')) {
				let lowerAmount = e.target;
				let id = lowerAmount.dataset.id;
				let tempItem = cart.find((item) => item.id === id);
				tempItem.amount = tempItem.amount - 1;
				if (tempItem.amount > 0) {
					Storage.saveCart(cart);
					this.setCartValues(cart);
					lowerAmount.previousElementSibling.innerText = tempItem.amount;
				} else {
					cartContent.removeChild(lowerAmount.parentElement.parentElement);
					this.removeChild(id);
				}
			}
		});
	}
	clearCart() {
		let cartItems = cart.map((item) => item.id);
		cartItems.forEach((id) => this.removeItem(id));
		while (cartContent.children.length > 0) {
			cartContent.removeChild(cartContent.children[0]);
		}
		this.hideCart();
	}
	removeItem(id) {
		cart = cart.filter((item) => item.id !== id);
		this.setCartValues(cart);
		Storage.saveCart(cart);
		let button = this.getSingleButton(id);
		button.disabled = false;
		button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
	}
	getSingleButton(id) {
		return buttonDOM.find((button) => button.dataset.id === id);
	}
}

//local storage
class Storage {
	static saveProducts(products) {
		localStorage.setItem('products', JSON.stringify(products));
	}
	static getProduct(id) {
		let products = JSON.parse(localStorage.getItem('products'));
		return products.find((product) => product.id === id);
	}
	static saveCart(cart) {
		localStorage.setItem('cart', JSON.stringify(cart));
	}
	static getCart() {
		return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const ui = new UI();
	const products = new Products();
	ui.setupApp();
	products
		.getProducts()
		.then((products) => {
			ui.displayProducts(products);
			Storage.saveProducts(products);
		})
		.then(() => {
			ui.getBagButtons();
			ui.cartLogic();
		});
});
