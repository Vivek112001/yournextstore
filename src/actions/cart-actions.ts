"use server";

import * as Commerce from "commerce-kit";
import { revalidateTag } from "next/cache";
import { clearCartCookie, getCartCookieJson, setCartCookieJson } from "@/lib/cart";
import { Cart, Product } from "@/ui/models/product";

export async function getCartFromCookiesAction() {
	const cartJson = await getCartCookieJson();
	if (!cartJson) {
		return null;
	}

	const cart = await fetchCart();
	if (cart) {
		return structuredClone(cart);
	}
	return null;
}

export async function setInitialCartCookiesAction(cartId: number, linesCount: number) {
	await setCartCookieJson({
		id: cartId,
		linesCount,
	});
	revalidateTag(`cart-${cartId}`);
}

export async function findOrCreateCartIdFromCookiesAction() {
	const cart = await getCartFromCookiesAction();
	if (cart) {
		return structuredClone(cart);
	}

	const newCart = await Commerce.cartCreate();
	await setCartCookieJson({
		id: 0,
		linesCount: 0,
	});
	revalidateTag(`cart-${newCart.id}`);

	return newCart.id;
}

export async function clearCartCookieAction() {
	const cookie = await getCartCookieJson();
	if (!cookie) {
		return;
	}

	await clearCartCookie();
	revalidateTag(`cart-${cookie.id}`);
	// FIXME not ideal, revalidate per domain instead (multi-tenant)
	revalidateTag(`admin-orders`);
}

async function fetchCart(): Promise<Cart> {
	try {
		const response = await fetch(`https://fakestoreapi.com/carts/${0}`);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = await (response.json()) as Cart;
		console.log(data);
		return data;
	} catch (error) {
		console.error('Failed to fetch carts:', error);
		throw error;
	}
}

async function createCart(cart: Cart): Promise<Cart> {

	try {
		const response = await fetch('https://fakestoreapi.com/carts', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(cart),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = (await response.json()) as Cart;
		console.log('Cart created:', data);
		return data;
	} catch (error) {
		console.error('Failed to create cart:', error);
		throw error;
	}
}


export async function addToCartAction(formData: FormData) {

	const productId = formData.get("id");
	const productTitle = formData.get("title");
	const productCategory = formData.get("category");
	const productDescription = formData.get("description");
	const productImage = formData.get("image");
	const productPrice = formData.get("price");

	if (!productId && !productTitle && !productCategory && !productDescription && !productImage && !productPrice) {
		throw new Error("Invalid product");
	}

	// const cart = await fetchCart();

	// const oldProducts = Array.isArray(cart.products) ? cart.products : [];

	const updatedCart = await createCart({
		userId: 0,
		id: 0,
		products: [
			{
				id: Number(productId),
				title: String(productTitle),
				category: String(productCategory),
				description: String(productDescription),
				image: String(productImage),
				price: Number(productPrice)
			}
		]
	});

	// if (updatedCart) {
	// 	await setCartCookieJson({
	// 		id: updatedCart.id,
	// 		linesCount: 1,
	// 	});

	// 	// revalidateTag(`cart-${updatedCart.id}`);
	// 	return structuredClone(updatedCart);
	// }
}

export async function increaseQuantity(productId: string) {
	const cart = await getCartFromCookiesAction();
	if (!cart) {
		throw new Error("Cart not found");
	}
	await Commerce.cartChangeQuantity({
		productId,
		cartId: 'cart.id',
		operation: "INCREASE",
	});
}

export async function decreaseQuantity(productId: string) {
	const cart = await getCartFromCookiesAction();
	if (!cart) {
		throw new Error("Cart not found");
	}
	await Commerce.cartChangeQuantity({
		productId,
		cartId: 'cart.id',
		operation: "DECREASE",
	});
}

export async function setQuantity({
	productId,
	cartId,
	quantity,
}: {
	productId: string;
	cartId: string;
	quantity: number;
}) {
	const cart = await getCartFromCookiesAction();
	if (!cart) {
		throw new Error("Cart not found");
	}
	await Commerce.cartSetQuantity({ productId, cartId, quantity });
}

export async function commerceGPTRevalidateAction() {
	const cart = await getCartCookieJson();
	if (cart) {
		revalidateTag(`cart-${cart.id}`);
	}
}
