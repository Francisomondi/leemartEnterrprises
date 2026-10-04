import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trash,
  Star,
  ImageIcon,
  Pencil,
  Package,
  Tag,
} from "lucide-react";

import { useProductStore } from "../stores/useProductStore";
import EditProductModal from "./EditProductModal";

const ProductsList = () => {
  const {
    products,
    deleteProduct,
    toggleFeaturedProduct,
    updateProduct,
    loading,
  } = useProductStore();

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [deletingId, setDeletingId] =
    useState(null);

  /*
   * ============================================================
   * FORMAT PRICE
   * ============================================================
   */
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(Number(price || 0));
  };

  /*
   * ============================================================
   * DELETE PRODUCT
   * ============================================================
   */
  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(product._id);

      await deleteProduct(product._id);
    } catch (error) {
      console.error(
        "Failed to delete product:",
        error
      );
    } finally {
      setDeletingId(null);
    }
  };

  /*
   * ============================================================
   * EMPTY STATE
   * ============================================================
   */
  if (!products?.length) {
    return (
      <div
        className="
          max-w-5xl
          mx-auto
          bg-gray-800
          rounded-xl
          p-10
          text-center
          shadow-lg
        "
      >
        <Package
          className="
            w-12
            h-12
            mx-auto
            text-gray-600
            mb-4
          "
        />

        <h3
          className="
            text-lg
            font-semibold
            text-gray-300
          "
        >
          No products found
        </h3>

        <p
          className="
            text-sm
            text-gray-500
            mt-1
          "
        >
          Products you create will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <motion.section
        className="
          bg-gray-800
          shadow-xl
          rounded-xl
          sm:rounded-2xl
          overflow-hidden
          max-w-6xl
          mx-auto
        "
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
      >
        {/* ====================================================== */}
        {/* HEADER */}
        {/* ====================================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-4
            p-4
            sm:p-6
            border-b
            border-gray-700
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                w-10
                h-10
                sm:w-12
                sm:h-12
                rounded-xl
                bg-emerald-500/10
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              <Package
                className="
                  w-5
                  h-5
                  sm:w-6
                  sm:h-6
                  text-emerald-400
                "
              />
            </div>

            <div>
              <h2
                className="
                  text-lg
                  sm:text-2xl
                  font-bold
                  text-white
                "
              >
                Products
              </h2>

              <p
                className="
                  text-xs
                  sm:text-sm
                  text-gray-400
                  mt-1
                "
              >
                {products.length}{" "}
                {products.length === 1
                  ? "product"
                  : "products"}
              </p>
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* MOBILE PRODUCT CARDS */}
        {/* ====================================================== */}

        <div
          className="
            md:hidden
            divide-y
            divide-gray-700
          "
        >
          {products.map((product) => {
            const mainImage =
              product.images?.[0];

            const isDeleting =
              deletingId === product._id;

            return (
              <article
                key={product._id}
                className="p-4"
              >
                {/* ============================================ */}
                {/* PRODUCT */}
                {/* ============================================ */}

                <div
                  className="
                    flex
                    items-start
                    gap-4
                  "
                >
                  {/* IMAGE */}

                  <div
                    className="
                      relative
                      w-24
                      h-24
                      rounded-xl
                      overflow-hidden
                      bg-gray-700
                      flex
                      items-center
                      justify-center
                      shrink-0
                    "
                  >
                    {mainImage ? (
                      <img
                        src={mainImage}
                        alt={product.name}
                        loading="lazy"
                        className="
                          w-full
                          h-full
                          object-cover
                        "
                        onError={(e) => {
                          e.currentTarget.src =
                            "/placeholder.png";
                        }}
                      />
                    ) : (
                      <ImageIcon
                        className="
                          w-8
                          h-8
                          text-gray-500
                        "
                      />
                    )}

                    {product.images?.length >
                      1 && (
                      <span
                        className="
                          absolute
                          bottom-1
                          right-1
                          bg-black/80
                          text-white
                          text-[10px]
                          font-medium
                          px-1.5
                          py-0.5
                          rounded-md
                        "
                      >
                        +
                        {product.images.length -
                          1}
                      </span>
                    )}
                  </div>

                  {/* PRODUCT INFO */}

                  <div className="min-w-0 flex-1">
                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-2
                      "
                    >
                      <h3
                        className="
                          text-base
                          font-semibold
                          text-white
                          leading-tight
                        "
                      >
                        {product.name}
                      </h3>

                      {product.isFeatured && (
                        <Star
                          className="
                            w-4
                            h-4
                            fill-yellow-400
                            text-yellow-400
                            shrink-0
                          "
                        />
                      )}
                    </div>

                    {/* PRICE */}

                    <p
                      className="
                        text-lg
                        font-bold
                        text-emerald-400
                        mt-2
                      "
                    >
                      {formatPrice(
                        product.price
                      )}
                    </p>

                    {/* CATEGORY */}

                    <div
                      className="
                        flex
                        items-center
                        gap-1.5
                        mt-2
                        text-gray-400
                      "
                    >
                      <Tag className="w-3.5 h-3.5" />

                      <span
                        className="
                          text-xs
                          capitalize
                        "
                      >
                        {product.category ||
                          "Uncategorized"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ============================================ */}
                {/* DESCRIPTION */}
                {/* ============================================ */}

                {product.description && (
                  <p
                    className="
                      text-sm
                      text-gray-400
                      leading-relaxed
                      line-clamp-2
                      mt-4
                    "
                  >
                    {product.description}
                  </p>
                )}

                {/* ============================================ */}
                {/* MOBILE ACTIONS */}
                {/* ============================================ */}

                <div
                  className="
                    grid
                    grid-cols-3
                    gap-2
                    mt-4
                    pt-4
                    border-t
                    border-gray-700
                  "
                >
                  {/* FEATURED */}

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      toggleFeaturedProduct(
                        product._id
                      )
                    }
                    className={`
                      flex
                      flex-col
                      items-center
                      justify-center
                      gap-1
                      min-h-[58px]
                      px-2
                      py-2
                      rounded-lg
                      text-xs
                      font-medium
                      transition
                      disabled:opacity-50
                      ${
                        product.isFeatured
                          ? `
                            bg-yellow-400/10
                            text-yellow-400
                            border
                            border-yellow-400/20
                          `
                          : `
                            bg-gray-700
                            text-gray-300
                            hover:bg-gray-600
                          `
                      }
                    `}
                  >
                    <Star
                      className={`
                        w-4
                        h-4
                        ${
                          product.isFeatured
                            ? "fill-yellow-400"
                            : ""
                        }
                      `}
                    />

                    {product.isFeatured
                      ? "Featured"
                      : "Feature"}
                  </button>

                  {/* EDIT */}

                  <button
                    type="button"
                    onClick={() =>
                      setEditingProduct(
                        product
                      )
                    }
                    className="
                      flex
                      flex-col
                      items-center
                      justify-center
                      gap-1
                      min-h-[58px]
                      px-2
                      py-2
                      rounded-lg
                      bg-blue-500/10
                      text-blue-400
                      border
                      border-blue-500/20
                      hover:bg-blue-500/20
                      text-xs
                      font-medium
                      transition
                    "
                  >
                    <Pencil className="w-4 h-4" />

                    Edit
                  </button>

                  {/* DELETE */}

                  <button
                    type="button"
                    disabled={
                      loading ||
                      isDeleting
                    }
                    onClick={() =>
                      handleDelete(product)
                    }
                    className="
                      flex
                      flex-col
                      items-center
                      justify-center
                      gap-1
                      min-h-[58px]
                      px-2
                      py-2
                      rounded-lg
                      bg-red-500/10
                      text-red-400
                      border
                      border-red-500/20
                      hover:bg-red-500/20
                      text-xs
                      font-medium
                      transition
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                  >
                    <Trash className="w-4 h-4" />

                    {isDeleting
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* ====================================================== */}
        {/* DESKTOP / TABLET TABLE */}
        {/* ====================================================== */}

        <div
          className="
            hidden
            md:block
            overflow-x-auto
          "
        >
          <table
            className="
              min-w-full
              divide-y
              divide-gray-700
            "
          >
            <thead className="bg-gray-900/70">
              <tr>
                {[
                  "Product",
                  "Price",
                  "Category",
                  "Featured",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="
                      px-5
                      lg:px-6
                      py-3
                      text-left
                      text-xs
                      font-semibold
                      text-gray-400
                      uppercase
                      tracking-wider
                      whitespace-nowrap
                    "
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody
              className="
                bg-gray-800
                divide-y
                divide-gray-700
              "
            >
              {products.map((product) => {
                const mainImage =
                  product.images?.[0];

                const isDeleting =
                  deletingId ===
                  product._id;

                return (
                  <tr
                    key={product._id}
                    className="
                      hover:bg-gray-700/40
                      transition-colors
                    "
                  >
                    {/* ======================================== */}
                    {/* PRODUCT */}
                    {/* ======================================== */}

                    <td
                      className="
                        px-5
                        lg:px-6
                        py-4
                        min-w-[260px]
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-4
                        "
                      >
                        <div
                          className="
                            relative
                            h-14
                            w-14
                            rounded-lg
                            overflow-hidden
                            bg-gray-700
                            flex
                            items-center
                            justify-center
                            shrink-0
                          "
                        >
                          {mainImage ? (
                            <img
                              src={
                                mainImage
                              }
                              alt={
                                product.name
                              }
                              loading="lazy"
                              className="
                                h-full
                                w-full
                                object-cover
                              "
                              onError={(
                                e
                              ) => {
                                e.currentTarget.src =
                                  "/placeholder.png";
                              }}
                            />
                          ) : (
                            <ImageIcon className="text-gray-400" />
                          )}

                          {product.images
                            ?.length >
                            1 && (
                            <span
                              className="
                                absolute
                                bottom-0
                                right-0
                                bg-black/80
                                text-[10px]
                                px-1.5
                                py-0.5
                                rounded-tl-md
                                text-white
                              "
                            >
                              +
                              {product
                                .images
                                .length -
                                1}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p
                            className="
                              text-sm
                              font-semibold
                              text-white
                            "
                          >
                            {product.name}
                          </p>

                          {product.description && (
                            <p
                              className="
                                max-w-xs
                                text-xs
                                text-gray-500
                                line-clamp-1
                                mt-1
                              "
                            >
                              {
                                product.description
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* ======================================== */}
                    {/* PRICE */}
                    {/* ======================================== */}

                    <td
                      className="
                        px-5
                        lg:px-6
                        py-4
                        text-sm
                        font-semibold
                        text-emerald-400
                        whitespace-nowrap
                      "
                    >
                      {formatPrice(
                        product.price
                      )}
                    </td>

                    {/* ======================================== */}
                    {/* CATEGORY */}
                    {/* ======================================== */}

                    <td
                      className="
                        px-5
                        lg:px-6
                        py-4
                      "
                    >
                      <span
                        className="
                          inline-flex
                          items-center
                          px-2.5
                          py-1
                          rounded-full
                          text-xs
                          font-medium
                          bg-gray-700
                          text-gray-300
                          capitalize
                        "
                      >
                        {product.category ||
                          "Uncategorized"}
                      </span>
                    </td>

                    {/* ======================================== */}
                    {/* FEATURED */}
                    {/* ======================================== */}

                    <td
                      className="
                        px-5
                        lg:px-6
                        py-4
                      "
                    >
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() =>
                          toggleFeaturedProduct(
                            product._id
                          )
                        }
                        title={
                          product.isFeatured
                            ? "Remove from featured"
                            : "Mark as featured"
                        }
                        aria-label={
                          product.isFeatured
                            ? `Remove ${product.name} from featured products`
                            : `Feature ${product.name}`
                        }
                        className={`
                          inline-flex
                          items-center
                          gap-2
                          px-3
                          py-2
                          rounded-lg
                          text-xs
                          font-medium
                          transition
                          disabled:opacity-50
                          ${
                            product.isFeatured
                              ? `
                                bg-yellow-400/10
                                text-yellow-400
                                border
                                border-yellow-400/20
                              `
                              : `
                                bg-gray-700
                                text-gray-400
                                hover:bg-gray-600
                              `
                          }
                        `}
                      >
                        <Star
                          className={`
                            h-4
                            w-4
                            ${
                              product.isFeatured
                                ? "fill-yellow-400"
                                : ""
                            }
                          `}
                        />

                        {product.isFeatured
                          ? "Featured"
                          : "No"}
                      </button>
                    </td>

                    {/* ======================================== */}
                    {/* ACTIONS */}
                    {/* ======================================== */}

                    <td
                      className="
                        px-5
                        lg:px-6
                        py-4
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct(
                              product
                            )
                          }
                          title="Edit product"
                          aria-label={`Edit ${product.name}`}
                          className="
                            inline-flex
                            items-center
                            justify-center
                            w-9
                            h-9
                            rounded-lg
                            text-blue-400
                            bg-blue-500/10
                            hover:bg-blue-500/20
                            transition
                          "
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          disabled={
                            loading ||
                            isDeleting
                          }
                          onClick={() =>
                            handleDelete(
                              product
                            )
                          }
                          title="Delete product"
                          aria-label={`Delete ${product.name}`}
                          className="
                            inline-flex
                            items-center
                            justify-center
                            w-9
                            h-9
                            rounded-lg
                            text-red-400
                            bg-red-500/10
                            hover:bg-red-500/20
                            transition
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                          "
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* ====================================================== */}
      {/* EDIT PRODUCT MODAL */}
      {/* ====================================================== */}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          loading={loading}
          onClose={() =>
            setEditingProduct(null)
          }
          onSave={async (data) => {
            try {
              console.log(
                "🚀 CALLING updateProduct",
                editingProduct._id,
                data
              );

              await updateProduct(
                editingProduct._id,
                data
              );

              setEditingProduct(null);
            } catch (error) {
              console.error(
                "Failed to update product:",
                error
              );
            }
          }}
        />
      )}
    </>
  );
};

export default ProductsList;