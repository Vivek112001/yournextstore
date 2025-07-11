"use client";
import { Loader2Icon } from "lucide-react";
import { useTransition } from "react";
import { addToCartAction } from "@/actions/cart-actions";
import { Button } from "@/components/ui/button";
import { useCartModal } from "@/context/cart-modal";
import { useTranslations } from "@/i18n/client";
import { cn } from "@/lib/utils";
import { Product } from "./models/product";

export const AddToCartButton = ({
	product,
	disabled,
	className,
}: {
	product: Product
	disabled?: boolean;
	className?: string;
}) => {
	const t = useTranslations("Global.addToCart");
	const [pending, startTransition] = useTransition();
	const isDisabled = disabled || pending;
	const { setOpen } = useCartModal();

	return (
		<Button
			id="button-add-to-cart"
			size="lg"
			type="submit"
			className={cn("rounded-full text-lg relative", className)}
			onClick={async (e) => {
				if (isDisabled) {
					e.preventDefault();
					return;
				}

				setOpen(true);

				startTransition(async () => {
					const formData = new FormData();
					formData.append("id", String(product.id));
					formData.append("title", product.title);
					formData.append("category", product.category);
					formData.append("description", product.description);
					formData.append("image", product.image);
					formData.append("price", String(product.price));
					await addToCartAction(formData);
				});
			}}
			aria-disabled={isDisabled}
		>
			<span className={cn("transition-opacity ease-in", pending ? "opacity-0" : "opacity-100")}>
				{disabled ? t("disabled") : t("actionButton")}
			</span>
			<span
				className={cn(
					"ease-out transition-opacity pointer-events-none absolute z-10",
					pending ? "opacity-100" : "opacity-0",
				)}
			>
				<Loader2Icon className="h-4 w-4 animate-spin" />
			</span>
		</Button>
	);
};
