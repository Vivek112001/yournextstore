"use client"
import { formatMoney } from "@/lib/utils";
import { YnsLink } from "@/ui/yns-link";
import { useProducts } from "../hooks/useProducts";

export const ProductList = () => {
	const { data, loading } = useProducts()

	const locale = 'en';
	if (loading) {
		return (
			<>
				Loading...
			</>
		)
	}

	if (!data) {
		return null;
	}

	return (
		<>
			<ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{data.map((product, idx) => {
					return (
						<li key={product.id} className="group">
							<YnsLink href={`/product/${product.id}`}>
								<article className="overflow-hidden bg-white">
									{product.image && (
										<div className="rounded-lg aspect-square w-full overflow-hidden bg-neutral-100 flex items-center">
											<img
												className="group-hover:rotate hover-perspective w-full bg-neutral-100 object-contain aspect-square p-8 mix-blend-darken object-center transition-opacity group-hover:opacity-75"
												src={product.image}
												loading={idx < 3 ? "eager" : "lazy"}
												sizes="(max-width: 1024x) 100vw, (max-width: 1280px) 50vw, 700px"
												alt=""
											/>
										</div>
									)}
									<div className="p-2">
										<h2 className="text-xl font-medium text-neutral-700">{product.title}</h2>
										<footer className="text-base font-normal text-neutral-900">
											{product.price && (
												<p>
													{formatMoney({
														amount: product.price,
														currency: "USD",
														locale,
													})}
												</p>
											)}
										</footer>
									</div>
								</article>
							</YnsLink>
						</li>
					);
				})}
			</ul >
		</>
	);
};
