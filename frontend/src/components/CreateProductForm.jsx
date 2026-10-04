import {
  useEffect,
  useRef,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  PlusCircle,
  Upload,
  Loader,
  X,
  ImagePlus,
  Package,
  Tag,
  Banknote,
  AlignLeft,
  Ruler,
  Palette,
  Plus,
} from "lucide-react";

import { useProductStore } from "../stores/useProductStore";
import { toast } from "react-hot-toast";

/*
 * ============================================================
 * PRODUCT CATEGORIES
 * ============================================================
 *
 * These values should be used consistently throughout
 * the application.
 */

export const PRODUCT_CATEGORIES = [
  {
    value: "pants",
    label: "Pants",
  },
  {
    value: "t-shirts",
    label: "T-Shirts",
  },
  {
    value: "shoes",
    label: "Shoes",
  },
  {
    value: "sandals",
    label: "Sandals",
  },
  {
    value: "jackets",
    label: "Jackets",
  },
  {
    value: "suits",
    label: "Suits",
  },
  {
    value: "bags",
    label: "Bags",
  },
  {
    value: "dresses",
    label: "Dresses",
  },
  {
    value: "twopiece",
    label: "Two Piece",
  },
  {
    value: "hoodies",
    label: "Hoodies",
  },
  {
    value: "shorts",
    label: "Shorts",
  },
  {
    value: "hats",
    label: "Hats",
  },
];

/*
 * ============================================================
 * SIZE OPTIONS
 * ============================================================
 */

const SHOE_SIZES = Array.from(
  { length: 9 },
  (_, index) => index + 37
);

const CLOTHING_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
];

/*
 * Categories where a normal clothing/shoe size
 * is usually not necessary.
 */

const SIZE_OPTIONAL_CATEGORIES = [
  "bags",
  "hats",
];

/*
 * ============================================================
 * COLOR OPTIONS
 * ============================================================
 */

const COLORS = [
  "Black",
  "White",
  "Brown",
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Purple",
  "Pink",
  "Gray",
  "Beige",
  "Orange",
];

/*
 * ============================================================
 * INITIAL PRODUCT
 * ============================================================
 */

const initialProduct = {
  name: "",
  description: "",
  price: "",
  category: "",
  images: [],
  sizes: [],
  colors: [],
};

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

const CreateProductForm = () => {
  const fileInputRef = useRef(null);

  const [newProduct, setNewProduct] =
    useState(initialProduct);

  const [customSize, setCustomSize] =
    useState("");

  const [customColor, setCustomColor] =
    useState("");

  const [imagePreviews, setImagePreviews] =
    useState([]);

  const { createProduct, loading } =
    useProductStore();

  /*
   * ============================================================
   * CATEGORY INFORMATION
   * ============================================================
   */

  const isFootwear = [
    "shoes",
    "sandals",
  ].includes(newProduct.category);

  const sizesOptional =
    SIZE_OPTIONAL_CATEGORIES.includes(
      newProduct.category
    );

  const availableSizes = isFootwear
    ? SHOE_SIZES
    : CLOTHING_SIZES;

  /*
   * ============================================================
   * CLEAN IMAGE PREVIEWS ON UNMOUNT
   * ============================================================
   */

  useEffect(() => {
    return () => {
      imagePreviews.forEach(
        (preview) => {
          URL.revokeObjectURL(
            preview.url
          );
        }
      );
    };
  }, [imagePreviews]);

  /*
   * ============================================================
   * NORMAL INPUT
   * ============================================================
   */

  const handleInputChange = (
    event
  ) => {
    const { name, value } =
      event.target;

    setNewProduct((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /*
   * ============================================================
   * CATEGORY CHANGE
   * ============================================================
   */

  const handleCategoryChange = (
    event
  ) => {
    const category =
      event.target.value;

    setNewProduct((current) => ({
      ...current,
      category,

      /*
       * Sizes are reset because changing
       * Shoes -> Dresses should not retain
       * shoe sizes such as 40/41.
       */
      sizes: [],
    }));

    setCustomSize("");
  };

  /*
   * ============================================================
   * SIZE MANAGEMENT
   * ============================================================
   */

  const toggleSize = (size) => {
    setNewProduct((current) => ({
      ...current,

      sizes:
        current.sizes.includes(size)
          ? current.sizes.filter(
              (item) =>
                item !== size
            )
          : [
              ...current.sizes,
              size,
            ],
    }));
  };

  const addCustomSize = () => {
    const raw =
      customSize.trim();

    if (!raw) return;

    /*
     * Keep numeric shoe sizes numeric.
     * Clothing/custom labels remain strings.
     */

    const size =
      isFootwear &&
      !Number.isNaN(Number(raw))
        ? Number(raw)
        : raw.toUpperCase();

    setNewProduct((current) => {
      if (
        current.sizes.includes(size)
      ) {
        return current;
      }

      return {
        ...current,
        sizes: [
          ...current.sizes,
          size,
        ],
      };
    });

    setCustomSize("");
  };

  /*
   * ============================================================
   * COLOR MANAGEMENT
   * ============================================================
   */

  const toggleColor = (color) => {
    setNewProduct((current) => ({
      ...current,

      colors:
        current.colors.includes(color)
          ? current.colors.filter(
              (item) =>
                item !== color
            )
          : [
              ...current.colors,
              color,
            ],
    }));
  };

  const addCustomColor = () => {
    const raw =
      customColor.trim();

    if (!raw) return;

    const color =
      raw.charAt(0).toUpperCase() +
      raw.slice(1);

    setNewProduct((current) => {
      const exists =
        current.colors.some(
          (item) =>
            item.toLowerCase() ===
            color.toLowerCase()
        );

      if (exists) {
        return current;
      }

      return {
        ...current,

        colors: [
          ...current.colors,
          color,
        ],
      };
    });

    setCustomColor("");
  };

  /*
   * ============================================================
   * IMAGE MANAGEMENT
   * ============================================================
   */

  const handleImageChange = (
    event
  ) => {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) return;

    const imageFiles =
      files.filter((file) =>
        file.type.startsWith(
          "image/"
        )
      );

    const remainingSlots =
      8 -
      newProduct.images.length;

    if (remainingSlots <= 0) {
      toast.error(
        "Maximum 8 images allowed"
      );

      event.target.value = "";
      return;
    }

    const filesToAdd =
      imageFiles.slice(
        0,
        remainingSlots
      );

    if (
      imageFiles.length >
      remainingSlots
    ) {
      toast.error(
        "Only 8 product images are allowed"
      );
    }

    const previews =
      filesToAdd.map((file) => ({
        file,
        url:
          URL.createObjectURL(
            file
          ),
      }));

    setNewProduct((current) => ({
      ...current,

      images: [
        ...current.images,
        ...filesToAdd,
      ],
    }));

    setImagePreviews(
      (current) => [
        ...current,
        ...previews,
      ]
    );

    event.target.value = "";
  };

  const removeImage = (index) => {
    const preview =
      imagePreviews[index];

    if (preview?.url) {
      URL.revokeObjectURL(
        preview.url
      );
    }

    setNewProduct((current) => ({
      ...current,

      images:
        current.images.filter(
          (_, i) => i !== index
        ),
    }));

    setImagePreviews(
      (current) =>
        current.filter(
          (_, i) => i !== index
        )
    );
  };

  /*
   * ============================================================
   * SUBMIT
   * ============================================================
   */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (loading) return;

    const name =
      newProduct.name.trim();

    const description =
      newProduct.description.trim();

    const category =
      newProduct.category;

    const price =
      Number(newProduct.price);

    /*
     * ==========================================================
     * VALIDATION
     * ==========================================================
     */

    if (!name) {
      toast.error(
        "Product name is required"
      );
      return;
    }

    if (!description) {
      toast.error(
        "Product description is required"
      );
      return;
    }

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      toast.error(
        "Enter a valid product price"
      );
      return;
    }

    if (!category) {
      toast.error(
        "Select a product category"
      );
      return;
    }

    if (
      !newProduct.images.length
    ) {
      toast.error(
        "Please select at least one image"
      );
      return;
    }

    if (
      !sizesOptional &&
      !newProduct.sizes.length
    ) {
      toast.error(
        "Please select at least one size"
      );
      return;
    }

    if (
      !newProduct.colors.length
    ) {
      toast.error(
        "Please select at least one color"
      );
      return;
    }

    /*
     * ==========================================================
     * BUILD FORM DATA
     * ==========================================================
     */

    const formData =
      new FormData();

    formData.append(
      "name",
      name
    );

    formData.append(
      "description",
      description
    );

    formData.append(
      "price",
      String(price)
    );

    formData.append(
      "category",
      category
    );

    /*
     * IMPORTANT:
     *
     * Send arrays consistently as JSON.
     */

    formData.append(
      "sizes",
      JSON.stringify(
        newProduct.sizes
      )
    );

    formData.append(
      "colors",
      JSON.stringify(
        newProduct.colors
      )
    );

    newProduct.images.forEach(
      (image) => {
        formData.append(
          "images",
          image
        );
      }
    );

    /*
     * ==========================================================
     * CREATE PRODUCT
     * ==========================================================
     */

    try {
      await createProduct(
        formData
      );

      /*
       * Store already shows success toast,
       * so don't display another success
       * toast here.
       */

      imagePreviews.forEach(
        (preview) => {
          URL.revokeObjectURL(
            preview.url
          );
        }
      );

      setNewProduct(
        initialProduct
      );

      setImagePreviews([]);
      setCustomSize("");
      setCustomColor("");
    } catch (error) {
      /*
       * Store already handles the
       * error toast.
       */
      console.error(
        "CREATE PRODUCT FAILED:",
        error
      );
    }
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
      }}
      className="
        w-full
        max-w-3xl
        mx-auto
        bg-gray-800
        border
        border-gray-700
        shadow-xl
        rounded-2xl
        overflow-hidden
      "
    >
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div
        className="
          px-4
          sm:px-6
          py-5
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
              w-11
              h-11
              rounded-xl
              bg-emerald-500/10
              flex
              items-center
              justify-center
            "
          >
            <PlusCircle
              className="
                w-6
                h-6
                text-emerald-400
              "
            />
          </div>

          <div>
            <h2
              className="
                text-xl
                sm:text-2xl
                font-bold
                text-white
              "
            >
              Create New Product
            </h2>

            <p
              className="
                text-xs
                sm:text-sm
                text-gray-400
                mt-1
              "
            >
              Add a new product to
              your Leemart catalogue.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="
          p-4
          sm:p-6
          space-y-7
        "
      >
        {/* ==================================================== */}
        {/* PRODUCT DETAILS */}
        {/* ==================================================== */}

        <FormSection
          icon={Package}
          title="Product Details"
          description="Enter the main product information."
        >
          <FormField
            label="Product Name"
            icon={Package}
          >
            <input
              type="text"
              name="name"
              value={
                newProduct.name
              }
              onChange={
                handleInputChange
              }
              placeholder="e.g. Classic Denim Jacket"
              required
              className={
                inputClass
              }
            />
          </FormField>

          <FormField
            label="Description"
            icon={AlignLeft}
            textarea
          >
            <textarea
              name="description"
              rows={4}
              value={
                newProduct.description
              }
              onChange={
                handleInputChange
              }
              placeholder="Describe the product..."
              required
              className={`
                ${inputClass}
                py-3
                min-h-[120px]
                resize-y
              `}
            />
          </FormField>

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-4
            "
          >
            <FormField
              label="Price (KES)"
              icon={Banknote}
            >
              <input
                type="number"
                name="price"
                min="1"
                inputMode="numeric"
                value={
                  newProduct.price
                }
                onChange={
                  handleInputChange
                }
                placeholder="4500"
                required
                className={
                  inputClass
                }
              />
            </FormField>

            <FormField
              label="Category"
              icon={Tag}
            >
              <select
                name="category"
                value={
                  newProduct.category
                }
                onChange={
                  handleCategoryChange
                }
                required
                className={
                  inputClass
                }
              >
                <option value="">
                  Select category
                </option>

                {PRODUCT_CATEGORIES.map(
                  (category) => (
                    <option
                      key={
                        category.value
                      }
                      value={
                        category.value
                      }
                    >
                      {
                        category.label
                      }
                    </option>
                  )
                )}
              </select>
            </FormField>
          </div>
        </FormSection>

        {/* ==================================================== */}
        {/* SIZES */}
        {/* ==================================================== */}

        <FormSection
          icon={Ruler}
          title="Available Sizes"
          description={
            isFootwear
              ? "Select the available shoe sizes."
              : sizesOptional
              ? "Sizes are optional for this category."
              : "Select every size currently available."
          }
        >
          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >
            {availableSizes.map(
              (size) => {
                const selected =
                  newProduct.sizes.includes(
                    size
                  );

                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() =>
                      toggleSize(
                        size
                      )
                    }
                    className={`
                      min-w-[48px]
                      min-h-[44px]
                      px-3
                      rounded-lg
                      border
                      text-sm
                      font-semibold
                      transition

                      ${
                        selected
                          ? `
                            bg-emerald-600
                            border-emerald-500
                            text-white
                          `
                          : `
                            bg-gray-700
                            border-gray-600
                            text-gray-300
                            hover:border-emerald-500
                          `
                      }
                    `}
                  >
                    {size}
                  </button>
                );
              }
            )}
          </div>

          <div
            className="
              flex
              gap-2
              mt-4
            "
          >
            <input
              type={
                isFootwear
                  ? "number"
                  : "text"
              }
              value={customSize}
              onChange={(e) =>
                setCustomSize(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter"
                ) {
                  e.preventDefault();
                  addCustomSize();
                }
              }}
              placeholder={
                isFootwear
                  ? "Other shoe size e.g. 46"
                  : "Custom size e.g. 4XL"
              }
              className="
                flex-1
                min-w-0
                min-h-[46px]
                px-3
                rounded-lg
                bg-gray-700
                border
                border-gray-600
                text-white
                placeholder:text-gray-500
                outline-none
                focus:border-emerald-500
              "
            />

            <button
              type="button"
              onClick={addCustomSize}
              className="
                min-h-[46px]
                px-4
                rounded-lg
                bg-gray-700
                hover:bg-emerald-600
                text-white
                flex
                items-center
                justify-center
                gap-2
                transition
              "
            >
              <Plus className="w-4 h-4" />

              <span className="hidden sm:inline">
                Add
              </span>
            </button>
          </div>

          {newProduct.sizes.some(
            (size) =>
              !availableSizes.includes(
                size
              )
          ) && (
            <div
              className="
                flex
                flex-wrap
                gap-2
                mt-3
              "
            >
              {newProduct.sizes
                .filter(
                  (size) =>
                    !availableSizes.includes(
                      size
                    )
                )
                .map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() =>
                      toggleSize(
                        size
                      )
                    }
                    className="
                      px-3
                      py-2
                      rounded-lg
                      bg-emerald-600
                      text-white
                      text-sm
                      flex
                      items-center
                      gap-2
                    "
                  >
                    {size}

                    <X className="w-3 h-3" />
                  </button>
                ))}
            </div>
          )}

          <p
            className="
              text-xs
              text-gray-500
              mt-3
            "
          >
            {newProduct.sizes.length}{" "}
            size
            {newProduct.sizes.length ===
            1
              ? ""
              : "s"}{" "}
            selected
          </p>
        </FormSection>

        {/* ==================================================== */}
        {/* COLORS */}
        {/* ==================================================== */}

        <FormSection
          icon={Palette}
          title="Available Colors"
          description="Select all colors currently available."
        >
          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >
            {COLORS.map((color) => {
              const selected =
                newProduct.colors.includes(
                  color
                );

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() =>
                    toggleColor(
                      color
                    )
                  }
                  className={`
                    min-h-[42px]
                    px-3
                    rounded-full
                    border
                    text-sm
                    font-medium
                    transition

                    ${
                      selected
                        ? `
                          bg-emerald-600
                          border-emerald-500
                          text-white
                        `
                        : `
                          bg-gray-700
                          border-gray-600
                          text-gray-300
                          hover:border-emerald-500
                        `
                    }
                  `}
                >
                  {color}
                </button>
              );
            })}
          </div>

          <div
            className="
              flex
              gap-2
              mt-4
            "
          >
            <input
              type="text"
              value={customColor}
              onChange={(e) =>
                setCustomColor(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter"
                ) {
                  e.preventDefault();
                  addCustomColor();
                }
              }}
              placeholder="Custom color e.g. Navy Blue"
              className="
                flex-1
                min-w-0
                min-h-[46px]
                px-3
                rounded-lg
                bg-gray-700
                border
                border-gray-600
                text-white
                placeholder:text-gray-500
                outline-none
                focus:border-emerald-500
              "
            />

            <button
              type="button"
              onClick={
                addCustomColor
              }
              className="
                min-h-[46px]
                px-4
                rounded-lg
                bg-gray-700
                hover:bg-emerald-600
                text-white
                flex
                items-center
                justify-center
                gap-2
                transition
              "
            >
              <Plus className="w-4 h-4" />

              <span className="hidden sm:inline">
                Add
              </span>
            </button>
          </div>

          {newProduct.colors.some(
            (color) =>
              !COLORS.includes(color)
          ) && (
            <div
              className="
                flex
                flex-wrap
                gap-2
                mt-3
              "
            >
              {newProduct.colors
                .filter(
                  (color) =>
                    !COLORS.includes(
                      color
                    )
                )
                .map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      toggleColor(
                        color
                      )
                    }
                    className="
                      px-3
                      py-2
                      rounded-full
                      bg-emerald-600
                      text-white
                      text-sm
                      flex
                      items-center
                      gap-2
                    "
                  >
                    {color}

                    <X className="w-3 h-3" />
                  </button>
                ))}
            </div>
          )}

          <p
            className="
              text-xs
              text-gray-500
              mt-3
            "
          >
            {newProduct.colors.length}{" "}
            color
            {newProduct.colors.length ===
            1
              ? ""
              : "s"}{" "}
            selected
          </p>
        </FormSection>

        {/* ==================================================== */}
        {/* IMAGES */}
        {/* ==================================================== */}

        <FormSection
          icon={ImagePlus}
          title="Product Images"
          description="Upload up to 8 clear product photos."
        >
          {imagePreviews.length >
            0 && (
            <div
              className="
                grid
                grid-cols-3
                sm:grid-cols-4
                gap-3
                mb-4
              "
            >
              {imagePreviews.map(
                (preview, index) => (
                  <div
                    key={preview.url}
                    className="
                      relative
                      aspect-square
                      rounded-xl
                      overflow-hidden
                      bg-gray-700
                    "
                  >
                    <img
                      src={
                        preview.url
                      }
                      alt={`Product preview ${
                        index + 1
                      }`}
                      className="
                        w-full
                        h-full
                        object-cover
                      "
                    />

                    {index === 0 && (
                      <span
                        className="
                          absolute
                          bottom-1
                          left-1
                          px-2
                          py-1
                          rounded-md
                          bg-emerald-600
                          text-white
                          text-[10px]
                        "
                      >
                        Main
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        removeImage(
                          index
                        )
                      }
                      className="
                        absolute
                        top-1
                        right-1
                        w-8
                        h-8
                        rounded-full
                        bg-black/70
                        text-red-400
                        hover:bg-red-500
                        hover:text-white
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={
              handleImageChange
            }
            className="hidden"
          />

          <button
            type="button"
            disabled={
              newProduct.images
                .length >= 8
            }
            onClick={() =>
              fileInputRef.current?.click()
            }
            className="
              w-full
              min-h-[100px]
              rounded-xl
              border-2
              border-dashed
              border-gray-600
              bg-gray-900/30
              hover:border-emerald-500
              hover:bg-emerald-500/5
              text-gray-400
              hover:text-emerald-400
              flex
              flex-col
              items-center
              justify-center
              gap-2
              transition
              disabled:opacity-40
            "
          >
            <Upload className="w-6 h-6" />

            <span
              className="
                text-sm
                font-medium
              "
            >
              Choose Product Images
            </span>

            <span
              className="
                text-xs
                text-gray-500
              "
            >
              {
                newProduct.images
                  .length
              }
              /8 selected
            </span>
          </button>
        </FormSection>

        {/* ==================================================== */}
        {/* SUBMIT */}
        {/* ==================================================== */}

        <button
          type="submit"
          disabled={loading}
          className="
            w-full
            min-h-[52px]
            flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-emerald-600
            hover:bg-emerald-700
            text-white
            font-semibold
            transition
            disabled:bg-gray-600
            disabled:cursor-not-allowed
          "
        >
          {loading ? (
            <>
              <Loader
                className="
                  w-5
                  h-5
                  animate-spin
                "
              />

              Creating Product...
            </>
          ) : (
            <>
              <PlusCircle className="w-5 h-5" />

              Create Product
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

/*
 * ============================================================
 * FORM SECTION
 * ============================================================
 */

const FormSection = ({
  icon: Icon,
  title,
  description,
  children,
}) => {
  return (
    <section>
      <div
        className="
          flex
          items-start
          gap-3
          mb-4
        "
      >
        <div
          className="
            w-9
            h-9
            shrink-0
            rounded-lg
            bg-gray-700
            flex
            items-center
            justify-center
          "
        >
          <Icon
            className="
              w-4
              h-4
              text-emerald-400
            "
          />
        </div>

        <div>
          <h3
            className="
              text-sm
              sm:text-base
              font-semibold
              text-white
            "
          >
            {title}
          </h3>

          {description && (
            <p
              className="
                mt-0.5
                text-xs
                text-gray-500
              "
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
};

/*
 * ============================================================
 * FORM FIELD
 * ============================================================
 */

const FormField = ({
  label,
  icon: Icon,
  textarea = false,
  children,
}) => {
  return (
    <div>
      <label
        className="
          block
          mb-2
          text-sm
          font-medium
          text-gray-300
        "
      >
        {label}
      </label>

      <div className="relative">
        <Icon
          className={`
            absolute
            left-3
            w-5
            h-5
            text-gray-500

            ${
              textarea
                ? "top-3.5"
                : `
                  top-1/2
                  -translate-y-1/2
                `
            }
          `}
        />

        {children}
      </div>
    </div>
  );
};

/*
 * ============================================================
 * INPUT STYLE
 * ============================================================
 */

const inputClass = `
  w-full
  min-h-[48px]
  pl-11
  pr-4
  rounded-lg
  bg-gray-700
  border
  border-gray-600
  text-white
  placeholder:text-gray-500
  outline-none
  focus:border-emerald-500
  focus:ring-2
  focus:ring-emerald-500/20
  transition
`;

export default CreateProductForm;