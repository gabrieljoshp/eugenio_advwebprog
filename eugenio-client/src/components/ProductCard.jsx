import Button from "./Button";
import constants from "../services/constants";

const ProductCard = ({ product, index }) => {
  const name = product.productName || product.title || product.name;
  const image = product.images?.[0] || product.image;
  const category = product.category?.name || product.category || "Product";
  const description = product.description || product.content?.[0] || "";
  const imageUrl = image?.startsWith("/")
    ? `${constants.HOST}${image}`
    : image;

  return (
    <article className="rounded-3xl border-2 border-zinc-900 bg-zinc-100 p-4">
      <div className="flex aspect-square items-center justify-center rounded-[1.25rem] bg-zinc-200 border-zinc-900 border overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
        {category} {String(index + 1).padStart(2, "0")}
      </p>
      <h3 className="mt-2 text-lg font-semibold text-zinc-900">
        {name}
      </h3>
      <p className="mt-2 text-base font-bold text-zinc-900">₱{product.price}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span
          className="font-semibold text-amber-600"
          aria-label={`${product.rating ?? 0} out of 5 stars`}
        >
          ★ {Number(product.rating || 0).toFixed(1)}
        </span>
        <span className="text-zinc-600">
          {product.reviewCount || 0} review{product.reviewCount === 1 ? "" : "s"}
        </span>
        <span className="rounded-full border border-zinc-300 px-2 py-0.5 text-xs font-medium text-zinc-700">
          {product.inventoryStatus || `${product.stock || 0} in stock`}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-zinc-600">
        {description.substring(0, 120)}{description.length > 120 ? "..." : ""}
      </p>
      <Button to={`/products/${product.slug || product.name}`} className="mt-4">
        View Product
      </Button>
    </article>
  );
};

export default ProductCard;
