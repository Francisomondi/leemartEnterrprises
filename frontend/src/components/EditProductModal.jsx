import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  X,
  Save,
  Loader,
  Package,
  Tag,
  Banknote,
  AlignLeft,
  ImagePlus,
  Trash2,
  Palette,
  Ruler,
  Plus,
} from "lucide-react";

import { motion } from "framer-motion";

/*
 * ============================================================
 * DEFAULT FASHION SIZES
 * ============================================================
 */

const DEFAULT_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
];

/*
 * ============================================================
 * DEFAULT COLORS
 * ============================================================
 *
 * These are suggestions only.
 * Admin can also add custom colors.
 */

const DEFAULT_COLORS = [
  "Black",
  "White",
  "Red",
  "Blue",
  "Green",
  "Brown",
  "Beige",
  "Grey",
  "Pink",
  "Purple",
  "Yellow",
  "Orange",
];

const EditProductModal = ({
  product,
  onClose,
  onSave,
  loading,
}) => {
  const fileInputRef = useRef(null);

  /*
   * ============================================================
   * BASIC PRODUCT DATA
   * ============================================================
   */

  const [formData, setFormData] =
    useState({
      name: "",
      price: "",
      category: "",
      description: "",
    });

  /*
   * ============================================================
   * SIZES
   * ============================================================
   */

  const [selectedSizes, setSelectedSizes] =
    useState([]);

  const [customSize, setCustomSize] =
    useState("");

  /*
   * ============================================================
   * COLORS
   * ============================================================
   */

  const [
    selectedColors,
    setSelectedColors,
  ] = useState([]);

  const [customColor, setCustomColor] =
    useState("");

  /*
   * ============================================================
   * IMAGES
   * ============================================================
   */

  const [
    existingImages,
    setExistingImages,
  ] = useState([]);

  const [newImages, setNewImages] =
    useState([]);

  const [previews, setPreviews] =
    useState([]);

  /*
   * ============================================================
   * LOAD EXISTING PRODUCT
   * ============================================================
   */

  useEffect(() => {
    if (!product) return;

    setFormData({
      name: product.name || "",
      price: product.price || "",
      category:
        product.category || "",
      description:
        product.description || "",
    });

    setSelectedSizes(
      Array.isArray(product.sizes)
        ? product.sizes
        : []
    );

    setSelectedColors(
      Array.isArray(product.colors)
        ? product.colors
        : []
    );

    setExistingImages(
      Array.isArray(product.images)
        ? product.images
        : []
    );

    setNewImages([]);
    setPreviews([]);
    setCustomSize("");
    setCustomColor("");
  }, [product]);

  /*
   * ============================================================
   * LOCK BACKGROUND SCROLL
   * ============================================================
   */

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, []);

  /*
   * ============================================================
   * ESCAPE KEY
   * ============================================================
   */

  useEffect(() => {
    const handleEscape = (event) => {
      if (
        event.key === "Escape" &&
        !loading
      ) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [loading, onClose]);

  /*
   * ============================================================
   * NORMAL INPUT CHANGES
   * ============================================================
   */

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /*
   * ============================================================
   * SIZE MANAGEMENT
   * ============================================================
   */

  const toggleSize = (size) => {
    setSelectedSizes((current) => {
      if (current.includes(size)) {
        return current.filter(
          (item) => item !== size
        );
      }

      return [...current, size];
    });
  };

  const addCustomSize = () => {
    const size =
      customSize
        .trim()
        .toUpperCase();

    if (!size) return;

    setSelectedSizes((current) => {
      if (current.includes(size)) {
        return current;
      }

      return [...current, size];
    });

    setCustomSize("");
  };

  const handleCustomSizeKeyDown = (
    event
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addCustomSize();
    }
  };

  /*
   * ============================================================
   * COLOR MANAGEMENT
   * ============================================================
   */

  const toggleColor = (color) => {
    setSelectedColors((current) => {
      if (current.includes(color)) {
        return current.filter(
          (item) => item !== color
        );
      }

      return [...current, color];
    });
  };

  const addCustomColor = () => {
    const color =
      customColor.trim();

    if (!color) return;

    /*
     * Capitalize first letter.
     */

    const formattedColor =
      color.charAt(0).toUpperCase() +
      color.slice(1);

    setSelectedColors((current) => {
      const exists = current.some(
        (item) =>
          item.toLowerCase() ===
          formattedColor.toLowerCase()
      );

      if (exists) {
        return current;
      }

      return [
        ...current,
        formattedColor,
      ];
    });

    setCustomColor("");
  };

  const handleCustomColorKeyDown = (
    event
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addCustomColor();
    }
  };

  /*
   * ============================================================
   * IMAGE SELECTION
   * ============================================================
   */

  const handleImageChange = (
    event
  ) => {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) return;

    const validImages =
      files.filter((file) =>
        file.type.startsWith(
          "image/"
        )
      );

    const remainingSlots =
      Math.max(
        0,
        8 -
          existingImages.length -
          newImages.length
      );

    const filesToAdd =
      validImages.slice(
        0,
        remainingSlots
      );

    if (!filesToAdd.length) {
      event.target.value = "";
      return;
    }

    const newPreviewItems =
      filesToAdd.map((file) => ({
        file,
        url:
          URL.createObjectURL(
            file
          ),
      }));

    setNewImages((current) => [
      ...current,
      ...filesToAdd,
    ]);

    setPreviews((current) => [
      ...current,
      ...newPreviewItems,
    ]);

    event.target.value = "";
  };

  /*
   * ============================================================
   * REMOVE EXISTING IMAGE
   * ============================================================
   */

  const removeExistingImage = (
    image
  ) => {
    setExistingImages(
      (current) =>
        current.filter(
          (item) =>
            item !== image
        )
    );
  };

  /*
   * ============================================================
   * REMOVE NEW IMAGE
   * ============================================================
   */

  const removeNewImage = (
    index
  ) => {
    const preview =
      previews[index];

    if (preview?.url) {
      URL.revokeObjectURL(
        preview.url
      );
    }

    setNewImages(
      (current) =>
        current.filter(
          (_, i) =>
            i !== index
        )
    );

    setPreviews(
      (current) =>
        current.filter(
          (_, i) =>
            i !== index
        )
    );
  };

  /*
   * ============================================================
   * SUBMIT UPDATE
   * ============================================================
   */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (loading) return;

    const name =
      formData.name.trim();

    const category =
      formData.category.trim();

    const description =
      formData.description.trim();

    const price =
      Number(formData.price);

    if (!name) {
      alert(
        "Product name is required."
      );
      return;
    }

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      alert(
        "Enter a valid product price."
      );
      return;
    }

    if (!category) {
      alert(
        "Product category is required."
      );
      return;
    }

    const totalImages =
      existingImages.length +
      newImages.length;

    if (totalImages === 0) {
      alert(
        "Product must have at least one image."
      );
      return;
    }

    if (totalImages > 8) {
      alert(
        "Maximum 8 images allowed."
      );
      return;
    }

    /*
     * ==========================================================
     * BUILD MULTIPART FORM DATA
     * ==========================================================
     */

    const payload =
      new FormData();

    payload.append(
      "name",
      name
    );

    payload.append(
      "price",
      String(price)
    );

    payload.append(
      "category",
      category
    );

    payload.append(
      "description",
      description
    );

    /*
     * Arrays are JSON encoded because
     * multipart/form-data sends text fields
     * as strings.
     */

    payload.append(
      "sizes",
      JSON.stringify(
        selectedSizes
      )
    );

    payload.append(
      "colors",
      JSON.stringify(
        selectedColors
      )
    );

    /*
     * Existing Cloudinary images that
     * should remain attached.
     */

    payload.append(
      "existingImages",
      JSON.stringify(
        existingImages
      )
    );

    /*
     * New image files.
     */

    newImages.forEach(
      (image) => {
        payload.append(
          "images",
          image
        );
      }
    );

    try {
      await onSave(payload);
    } catch (error) {
      console.error(
        "SAVE PRODUCT FAILED:",
        error
      );
    }
  };

  /*
   * ============================================================
   * BACKDROP CLICK
   * ============================================================
   */

  const handleBackdropClick = (
    event
  ) => {
    if (
      event.target ===
        event.currentTarget &&
      !loading
    ) {
      onClose();
    }
  };

  const totalImages =
    existingImages.length +
    newImages.length;

  return (
    <div
      onMouseDown={
        handleBackdropClick
      }
      className="
        fixed
        inset-0
        z-[100]
        bg-black/75
        backdrop-blur-sm
        flex
        items-end
        sm:items-center
        justify-center
        sm:p-4
      "
    >
      <motion.form
        onSubmit={handleSubmit}
        initial={{
          opacity: 0,
          y: 30,
          scale: 0.98,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        className="
          bg-gray-800
          w-full
          sm:max-w-2xl
          max-h-[94vh]
          overflow-y-auto
          rounded-t-2xl
          sm:rounded-2xl
          border
          border-gray-700
          shadow-2xl
        "
      >
        {/* HEADER */}

        <header
          className="
            sticky
            top-0
            z-20
            bg-gray-800/95
            backdrop-blur
            border-b
            border-gray-700
            px-4
            sm:px-6
            py-4
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-3
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
                min-w-0
              "
            >
              <div
                className="
                  w-10
                  h-10
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
                    text-emerald-400
                  "
                />
              </div>

              <div className="min-w-0">
                <h2
                  className="
                    text-lg
                    sm:text-xl
                    font-bold
                    text-white
                  "
                >
                  Edit Product
                </h2>

                <p
                  className="
                    text-xs
                    text-gray-400
                    truncate
                  "
                >
                  {product?.name}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="
                w-10
                h-10
                rounded-full
                flex
                items-center
                justify-center
                text-gray-400
                hover:text-white
                hover:bg-gray-700
                transition
              "
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* CONTENT */}

        <div
          className="
            px-4
            sm:px-6
            py-5
            space-y-7
          "
        >
          {/* IMAGES */}

          <section>
            <SectionHeader
              icon={ImagePlus}
              title="Product Images"
              description="Add or remove product images."
              right={
                <span
                  className="
                    text-xs
                    bg-gray-700
                    text-gray-300
                    px-2.5
                    py-1
                    rounded-full
                  "
                >
                  {totalImages}/8
                </span>
              }
            />

            {totalImages > 0 && (
              <div
                className="
                  grid
                  grid-cols-3
                  sm:grid-cols-4
                  gap-3
                  mb-4
                "
              >
                {existingImages.map(
                  (image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="
                        relative
                        aspect-square
                        rounded-xl
                        overflow-hidden
                        bg-gray-700
                      "
                    >
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
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
                            bg-emerald-600
                            text-white
                            text-[10px]
                            px-2
                            py-1
                            rounded-md
                          "
                        >
                          Main
                        </span>
                      )}

                      <button
                        type="button"
                        disabled={
                          loading
                        }
                        onClick={() =>
                          removeExistingImage(
                            image
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
                          flex
                          items-center
                          justify-center
                          hover:bg-red-500
                          hover:text-white
                        "
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                )}

                {previews.map(
                  (
                    preview,
                    index
                  ) => (
                    <div
                      key={
                        preview.url
                      }
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
                        alt={`New ${index + 1}`}
                        className="
                          w-full
                          h-full
                          object-cover
                        "
                      />

                      <span
                        className="
                          absolute
                          bottom-1
                          left-1
                          bg-blue-600
                          text-white
                          text-[10px]
                          px-2
                          py-1
                          rounded-md
                        "
                      >
                        New
                      </span>

                      <button
                        type="button"
                        disabled={
                          loading
                        }
                        onClick={() =>
                          removeNewImage(
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
                          flex
                          items-center
                          justify-center
                          hover:bg-red-500
                          hover:text-white
                        "
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={
                handleImageChange
              }
              className="hidden"
            />

            <button
              type="button"
              disabled={
                loading ||
                totalImages >= 8
              }
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="
                w-full
                min-h-[90px]
                rounded-xl
                border-2
                border-dashed
                border-gray-600
                hover:border-emerald-500
                bg-gray-900/30
                hover:bg-emerald-500/5
                flex
                flex-col
                items-center
                justify-center
                gap-2
                text-gray-400
                hover:text-emerald-400
                transition
                disabled:opacity-40
              "
            >
              <ImagePlus className="w-6 h-6" />

              <span className="text-sm font-medium">
                Add Product Images
              </span>

              <span className="text-xs text-gray-500">
                Maximum 8 images
              </span>
            </button>
          </section>

          {/* BASIC DETAILS */}

          <section>
            <SectionHeader
              icon={Package}
              title="Product Details"
              description="Basic information shown to customers."
            />

            <div className="space-y-4">
              <Field
                label="Product Name"
                icon={Package}
              >
                <input
                  name="name"
                  required
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  className={inputClass}
                />
              </Field>

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  gap-4
                "
              >
                <Field
                  label="Price"
                  icon={Banknote}
                >
                  <input
                    name="price"
                    type="number"
                    min="1"
                    required
                    value={
                      formData.price
                    }
                    onChange={
                      handleChange
                    }
                    className={
                      inputClass
                    }
                  />
                </Field>

                <Field
                  label="Category"
                  icon={Tag}
                >
                  <input
                    name="category"
                    required
                    value={
                      formData.category
                    }
                    onChange={
                      handleChange
                    }
                    className={
                      inputClass
                    }
                  />
                </Field>
              </div>

              <Field
                label="Description"
                icon={AlignLeft}
                textarea
              >
                <textarea
                  name="description"
                  rows={5}
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                  className={`
                    ${inputClass}
                    py-3
                    min-h-[130px]
                    resize-y
                  `}
                />
              </Field>
            </div>
          </section>

          {/* SIZES */}

          <section>
            <SectionHeader
              icon={Ruler}
              title="Available Sizes"
              description="Tap sizes to make them available for this product."
            />

            <div
              className="
                flex
                flex-wrap
                gap-2
              "
            >
              {DEFAULT_SIZES.map(
                (size) => {
                  const selected =
                    selectedSizes.includes(
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
                        font-semibold
                        text-sm
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

            {/* CUSTOM SIZES */}

            <div
              className="
                flex
                gap-2
                mt-4
              "
            >
              <input
                value={customSize}
                onChange={(e) =>
                  setCustomSize(
                    e.target.value
                  )
                }
                onKeyDown={
                  handleCustomSizeKeyDown
                }
                placeholder="Custom size e.g. 42"
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
                  addCustomSize
                }
                className="
                  min-w-[46px]
                  h-[46px]
                  px-4
                  rounded-lg
                  bg-gray-700
                  hover:bg-emerald-600
                  text-white
                  flex
                  items-center
                  justify-center
                  gap-1
                  transition
                "
              >
                <Plus className="w-4 h-4" />

                <span className="hidden sm:inline">
                  Add
                </span>
              </button>
            </div>

            {/* CUSTOM SELECTED SIZES */}

            {selectedSizes.some(
              (size) =>
                !DEFAULT_SIZES.includes(
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
                {selectedSizes
                  .filter(
                    (size) =>
                      !DEFAULT_SIZES.includes(
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
                        bg-emerald-600
                        text-white
                        px-3
                        py-2
                        rounded-lg
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
              {selectedSizes.length}
              {" "}
              size
              {selectedSizes.length ===
              1
                ? ""
                : "s"}
              {" "}
              selected
            </p>
          </section>

          {/* COLORS */}

          <section>
            <SectionHeader
              icon={Palette}
              title="Available Colors"
              description="Choose every color available for this product."
            />

            <div
              className="
                flex
                flex-wrap
                gap-2
              "
            >
              {DEFAULT_COLORS.map(
                (color) => {
                  const selected =
                    selectedColors.includes(
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
                }
              )}
            </div>

            {/* CUSTOM COLOR */}

            <div
              className="
                flex
                gap-2
                mt-4
              "
            >
              <input
                value={
                  customColor
                }
                onChange={(e) =>
                  setCustomColor(
                    e.target.value
                  )
                }
                onKeyDown={
                  handleCustomColorKeyDown
                }
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
                  min-w-[46px]
                  h-[46px]
                  px-4
                  rounded-lg
                  bg-gray-700
                  hover:bg-emerald-600
                  text-white
                  flex
                  items-center
                  justify-center
                  gap-1
                  transition
                "
              >
                <Plus className="w-4 h-4" />

                <span className="hidden sm:inline">
                  Add
                </span>
              </button>
            </div>

            {/* CUSTOM SELECTED COLORS */}

            {selectedColors.some(
              (color) =>
                !DEFAULT_COLORS.includes(
                  color
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
                {selectedColors
                  .filter(
                    (color) =>
                      !DEFAULT_COLORS.includes(
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
                        bg-emerald-600
                        text-white
                        px-3
                        py-2
                        rounded-full
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
              {selectedColors.length}
              {" "}
              color
              {selectedColors.length ===
              1
                ? ""
                : "s"}
              {" "}
              selected
            </p>
          </section>
        </div>

        {/* FOOTER */}

        <footer
          className="
            sticky
            bottom-0
            z-20
            bg-gray-800/95
            backdrop-blur
            border-t
            border-gray-700
            p-4
            sm:px-6
          "
        >
          <div
            className="
              flex
              flex-col-reverse
              sm:flex-row
              sm:justify-end
              gap-3
            "
          >
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="
                w-full
                sm:w-auto
                min-h-[48px]
                px-5
                rounded-lg
                bg-gray-700
                hover:bg-gray-600
                text-gray-200
                font-medium
                transition
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                sm:w-auto
                min-h-[48px]
                px-6
                rounded-lg
                bg-emerald-600
                hover:bg-emerald-700
                text-white
                font-semibold
                flex
                items-center
                justify-center
                gap-2
                transition
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {loading ? (
                <>
                  <Loader
                    className="
                      w-4
                      h-4
                      animate-spin
                    "
                  />

                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />

                  Save Changes
                </>
              )}
            </button>
          </div>
        </footer>
      </motion.form>
    </div>
  );
};

/*
 * ============================================================
 * REUSABLE SECTION HEADER
 * ============================================================
 */

const SectionHeader = ({
  icon: Icon,
  title,
  description,
  right,
}) => {
  return (
    <div
      className="
        flex
        items-start
        justify-between
        gap-3
        mb-4
      "
    >
      <div
        className="
          flex
          items-start
          gap-3
        "
      >
        <div
          className="
            w-9
            h-9
            rounded-lg
            bg-gray-700
            flex
            items-center
            justify-center
            shrink-0
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
                text-xs
                text-gray-500
                mt-0.5
              "
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {right}
    </div>
  );
};

/*
 * ============================================================
 * REUSABLE FIELD
 * ============================================================
 */

const Field = ({
  label,
  icon: Icon,
  children,
  textarea = false,
}) => {
  return (
    <div>
      <label
        className="
          block
          text-sm
          font-medium
          text-gray-300
          mb-2
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
 * SHARED INPUT STYLE
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

export default EditProductModal;