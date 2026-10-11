import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Button from "../../components/Button.jsx";
import { fetchProducts } from "../../services/ProductService";
import { fetchReviews } from "../../services/ReviewService";
import constants from "../../services/constants";

function ProductPage() {
  const { name: productSlug } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const { data } = await fetchProducts(); // Assuming fetchProducts returns an array and we need to find the specific product
        const productList = Array.isArray(data) ? data : data.data || [];
        const foundProduct = productList.find(
          (item) => item.slug === productSlug || item.name === productSlug,
        );
        setProduct(foundProduct);
        if (!foundProduct?._id) return;

        setReviewsLoading(true);
        const reviewResponse = await fetchReviews({ product: foundProduct._id });
        const reviewData = reviewResponse.data;
        setReviews(Array.isArray(reviewData) ? reviewData : reviewData.data || []);
        setReviewsError("");
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setReviewsError("Reviews are unavailable right now.");
      } finally {
        setReviewsLoading(false);
      }
    };

    loadProduct();
  }, [productSlug]);
  if (!product) {
    return (
      <div className="flex w-full flex-col gap-6">
        <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold text-zinc-900">
              Product not found
            </h1>
            <Button to="/products" className="mt-6">
              Back to Products
            </Button>
          </div>
        </section>
      </div>
    );
  }

  const productName = product.productName || product.title || product.name;
  const image = product.images?.[0] || product.image;
  const imageUrl = image?.startsWith("/") ? `${constants.HOST}${image}` : image;
  const description = product.description || product.content || "";
  const paragraphs = Array.isArray(description) ? description : [description];

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-4">
            <Button to="/products">Back to Products</Button>
          </div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
            {product.category?.name || product.category}
          </p>
          <h1 className="text-3xl font-bold leading-tight text-zinc-900 sm:text-4xl">
            {productName}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
            <span className="font-bold text-zinc-900">₱{product.price}</span>
            <span className="font-semibold text-amber-600" aria-label={`${product.rating ?? 0} out of 5 stars`}>
              ★ {Number(product.rating || 0).toFixed(1)}
            </span>
            <span>{product.reviewCount || 0} review{product.reviewCount === 1 ? "" : "s"}</span>
            <span className="rounded-full border border-zinc-300 px-2 py-0.5 text-xs font-medium text-zinc-700">
              {product.inventoryStatus || `${product.stock || 0} in stock`}
            </span>
          </div>
        </div>
      </section>

      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex aspect-square items-center justify-center rounded-[1.25rem] border-2 border-zinc-900 bg-zinc-200 mb-8 overflow-hidden">
            <img
              src={imageUrl}
              alt={productName}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="prose prose-sm max-w-none space-y-4 text-zinc-700">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-base leading-7 text-zinc-700 whitespace-pre-wrap"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-8 border-t-2 border-zinc-900 pt-6">
            <Button variant="primary" className="mr-3">
              Add to Cart
            </Button>
            <Button to="/products">Back to Products</Button>
          </div>
        </div>
      </section>
      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-zinc-900">Customer Reviews</h2>
          <p className="mt-2 text-sm text-zinc-600">
            {product.reviewCount || reviews.length} review{(product.reviewCount || reviews.length) === 1 ? "" : "s"} for this product
          </p>
          {reviewsLoading ? (
            <p className="mt-6 text-sm text-zinc-600">Loading reviews…</p>
          ) : reviewsError ? (
            <p className="mt-6 text-sm text-red-700">{reviewsError}</p>
          ) : reviews.length ? (
            <div className="mt-6 space-y-4">
              {reviews.map((review) => {
                const reviewer = review.user;
                const reviewerName = reviewer
                  ? `${reviewer.firstName || ""} ${reviewer.lastName || ""}`.trim() || reviewer.username || "Customer"
                  : "Customer";
                return (
                  <article key={review._id} className="rounded-xl border border-zinc-300 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-zinc-900">{reviewerName}</p>
                      <span className="font-semibold text-amber-600" aria-label={`${review.rating} out of 5 stars`}>
                        ★ {review.rating}.0
                      </span>
                    </div>
                    {review.title && <h3 className="mt-3 font-semibold text-zinc-900">{review.title}</h3>}
                    <p className="mt-2 text-sm leading-6 text-zinc-700">{review.comment}</p>
                    {review.isVerifiedPurchase && <p className="mt-3 text-xs font-medium text-emerald-700">Verified purchase</p>}
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="mt-6 text-sm text-zinc-600">There are no reviews for this product yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default ProductPage;
