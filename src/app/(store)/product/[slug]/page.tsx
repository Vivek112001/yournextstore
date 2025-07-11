// import { ProductModel3D } from "@/app/(store)/product/[slug]/product-model3d";

import Image from "next/image";
import { notFound } from "next/navigation";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { publicUrl } from "@/env.mjs";
import { getLocale, getTranslations } from "@/i18n/server";
import { getRecommendedProducts } from "@/lib/search/trieve";
import { deslugify, formatMoney } from "@/lib/utils";
import type { TrieveProductMetadata } from "@/scripts/upload-trieve";
import { AddToCartButton } from "@/ui/add-to-cart-button";
import { Markdown } from "@/ui/markdown";
import { StickyBottom } from "@/ui/sticky-bottom";
import { YnsLink } from "@/ui/yns-link";
import { Product } from "@/ui/models/product";
import { ProductModel3D } from "./product-model3d";
import { MainProductImage } from "@/ui/products/main-product-image";
import ImageEditor from "@/ui/components/image-editor";

// export const generateMetadata = async (props: {
// 	params: Promise<{ slug: string }>;
// 	searchParams: Promise<{ variant?: string }>;
// }): Promise<Metadata> => {
// 	const searchParams = await props.searchParams;
// 	const params = await props.params;
// 	const variants = await Commerce.productGet({ slug: params.slug });

// 	const selectedVariant = searchParams.variant || variants[0]?.metadata.variant;
// 	const product = variants.find((variant) => variant.metadata.variant === selectedVariant);
// 	if (!product) {
// 		return notFound();
// 	}
// 	const t = await getTranslations("/product.metadata");

// 	const canonical = new URL(`${publicUrl}/product/${product.metadata.slug}`);
// 	if (selectedVariant) {
// 		canonical.searchParams.set("variant", selectedVariant);
// 	}

// 	const productName = formatProductName(product.name, product.metadata.variant);

// 	return {
// 		title: t("title", { productName }),
// 		description: product.description,
// 		alternates: { canonical },
// 	} satisfies Metadata;
// };

export default async function SingleProductPage(props: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ variant?: string; image?: string }>;
}) {
	const params = await props.params;
	const searchParams = await props.searchParams;

	async function fetchProductById(id: string) {
		try {
			const response = await fetch(`https://fakestoreapi.com/products/${id}`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = (await response.json()) as Product;
			console.log(data);
			return data; // optional, depending on your use case
		} catch (error) {
			console.error('Error fetching product:', error);
			throw error; // rethrow if you want the caller to handle it
		}
	}

	const product = await fetchProductById(params.slug)

	if (!product) {
		return notFound();
	}

	const t = await getTranslations("/product.page");
	const locale = await getLocale();

	const category = product.category;
	const images = product.image;

	return (
		<article className="pb-12">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink asChild className="inline-flex min-h-12 min-w-12 items-center justify-center">
							<YnsLink href="/products">{t("allProducts")}</YnsLink>
						</BreadcrumbLink>
					</BreadcrumbItem>
					{category && (
						<>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbLink className="inline-flex min-h-12 min-w-12 items-center justify-center" asChild>
									<YnsLink href={`/category/${category}`}>{deslugify(category)}</YnsLink>
								</BreadcrumbLink>
							</BreadcrumbItem>
						</>
					)}
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>{product.title}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<StickyBottom product={product} locale={locale}>
				<div className="mt-4 grid gap-4 lg:grid-cols-12">
					<div className="lg:col-span-5 lg:col-start-8">
						<h1 className="text-3xl font-bold leading-none tracking-tight text-foreground">{product.title}</h1>
						{product.price && (
							<p className="mt-2 text-2xl font-medium leading-none tracking-tight text-foreground/70">
								{formatMoney({
									amount: product.price,
									currency: "USD",
									locale,
								})}
							</p>
						)}
					</div>

					<div className="lg:col-span-7 lg:row-span-3 lg:row-start-1">
						<h2 className="sr-only">{t("imagesTitle")}</h2>

						<div className="grid gap-4 lg:grid-cols-3 [&>*:first-child]:col-span-3">
							{product.image && (
								<MainProductImage
									className="w-full rounded-lg bg-neutral-100 object-cover object-center transition-opacity max-w-sm m-auto"
									src={product.image}
									loading="eager"
									priority
									alt=""
								/>
							)}

							{/* {images.map((image, idx) => {
								const params = new URLSearchParams({
									image: idx.toString(),
								});
								if (searchParams.variant) {
									params.set("variant", searchParams.variant);
								}
								return (
									<YnsLink key={idx} href={`?${params}`} scroll={false}>
										{idx === 0 && !product.metadata.preview ? (
											<MainProductImage
												key={image}
												className="w-full rounded-lg bg-neutral-100 object-cover object-center transition-opacity"
												src={image}
												loading="eager"
												priority
												alt=""
											/>
										) : (
											<Image
												key={image}
												className="w-full rounded-lg bg-neutral-100 object-cover object-center transition-opacity"
												src={image}
												width={700 / 3}
												height={700 / 3}
												sizes="(max-width: 1024x) 33vw, (max-width: 1280px) 20vw, 225px"
												loading="eager"
												priority
												alt=""
											/>
										)}
									</YnsLink>
								);
							})} */}
						</div>

						<ImageEditor
							imgUrl={product.image}
						/>
					</div>

					<div className="grid gap-8 lg:col-span-5">
						<section>
							<h2 className="sr-only">{t("descriptionTitle")}</h2>
							<div className="prose text-secondary-foreground">
								<Markdown source={product.description || ""} />
							</div>
						</section>

						<AddToCartButton product={product} disabled={false} />
					</div>
				</div>
			</StickyBottom>

			{/* <Suspense>
				<SimilarProducts id={product.id} />
			</Suspense>

			<Suspense>
				<ProductImageModal images={images} />
			</Suspense> */}
		</article>
	);
}

async function SimilarProducts({ id }: { id: string }) {
	const products = await getRecommendedProducts({ productId: id, limit: 4 });

	if (!products) {
		return null;
	}

	return (
		<section className="py-12">
			<div className="mb-8">
				<h2 className="text-2xl font-bold tracking-tight">You May Also Like</h2>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				{products.map((product) => {
					const trieveMetadata = product.metadata as TrieveProductMetadata;
					return (
						<div key={product.tracking_id} className="bg-card rounded overflow-hidden shadow-sm group">
							{trieveMetadata.image_url && (
								<YnsLink href={`${publicUrl}${product.link}`} className="block" prefetch={false}>
									<Image
										className={
											"w-full rounded-lg bg-neutral-100 object-cover object-center group-hover:opacity-80 transition-opacity"
										}
										src={trieveMetadata.image_url}
										width={300}
										height={300}
										sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 300px"
										alt=""
									/>
								</YnsLink>
							)}
							<div className="p-4">
								<h3 className="text-lg font-semibold mb-2">
									<YnsLink href={product.link || "#"} className="hover:text-primary" prefetch={false}>
										{trieveMetadata.name}
									</YnsLink>
								</h3>
								<div className="flex items-center justify-between">
									<span>
										{formatMoney({
											amount: trieveMetadata.amount,
											currency: trieveMetadata.currency,
										})}
									</span>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
