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
  Images,
} from "lucide-react";

import { motion } from "framer-motion";

const EditProductModal = ({
  product,
  onClose,
  onSave,
  loading,
}) => {
  const fileInputRef = useRef(null);

  const [formData, setFormData] =
    useState({
      name: "",
      price: "",
      category: "",
      description: "",
    });

  /*
   * Images already stored in
   * Cloudinary/MongoDB.
   */
  const [
    existingImages,
    setExistingImages,
  ] = useState([]);

  /*
   * New File objects selected
   * from the device.
   */
  const [newImages, setNewImages] =
    useState([]);

  /*
   * Preview URLs for new files.
   */
  const [previews, setPreviews] =
    useState([]);

  /*
   * ============================================================
   * LOAD PRODUCT
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

    setExistingImages(
      Array.isArray(product.images)
        ? product.images
        : []
    );

    setNewImages([]);
    setPreviews([]);
  }, [product]);

  /*
   * ============================================================
   * PREVENT BACKGROUND SCROLL
   * ============================================================
   */
  useEffect(() => {
    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
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
   * CLEAN IMAGE PREVIEWS
   * ============================================================
   */
  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        URL.revokeObjectURL(
          preview.url
        );
      });
    };
  }, [previews]);

  /*
   * ============================================================
   * NORMAL INPUTS
   * ============================================================
   */
  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /*
   * ============================================================
   * SELECT NEW IMAGES
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

    /*
     * Maximum 8 total images.
     */
    const remainingSlots =
      Math.max(
        0,
        8 -
          existingImages.length -
          newImages.length
      );

    const filesToAdd =
      imageFiles.slice(
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

    /*
     * Allows choosing the same
     * image again later.
     */
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
   * SUBMIT
   * ============================================================
   */
  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

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

    if (
      existingImages.length === 0 &&
      newImages.length === 0
    ) {
      alert(
        "Product must have at least one image."
      );
      return;
    }

    /*
     * IMPORTANT:
     * This is now FormData,
     * not a normal JS object.
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
     * Tell backend which old
     * images should remain.
     */
    payload.append(
      "existingImages",
      JSON.stringify(
        existingImages
      )
    );

    /*
     * Add newly selected files.
     *
     * Backend multer field must
     * also be called "images".
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
   * BACKDROP
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
        {/* ================================================ */}
        {/* HEADER */}
        {/* ================================================ */}

        <header
          className="
            sticky
            top-0
            z-20
            bg-gray-800
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
              aria-label="Close"
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

        {/* ================================================ */}
        {/* CONTENT */}
        {/* ================================================ */}

        <div
          className="
            px-4
            sm:px-6
            py-5
            space-y-6
          "
        >
          {/* ============================================== */}
          {/* IMAGES */}
          {/* ============================================== */}

          <section>
            <div
              className="
                flex
                items-center
                justify-between
                gap-3
                mb-3
              "
            >
              <div>
                <label
                  className="
                    text-sm
                    font-medium
                    text-gray-200
                  "
                >
                  Product Images
                </label>

                <p
                  className="
                    text-xs
                    text-gray-500
                    mt-1
                  "
                >
                  Add, remove or
                  replace product
                  images.
                </p>
              </div>

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
            </div>

            {/* IMAGE GRID */}

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
                {/* EXISTING */}

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
                        group
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
                            px-1.5
                            py-0.5
                            rounded
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
                          flex
                          items-center
                          justify-center
                          rounded-full
                          bg-black/70
                          text-red-400
                          hover:bg-red-500
                          hover:text-white
                          transition
                        "
                        aria-label="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                )}

                {/* NEW */}

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
                          px-1.5
                          py-0.5
                          rounded
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
                          flex
                          items-center
                          justify-center
                          rounded-full
                          bg-black/70
                          text-red-400
                          hover:bg-red-500
                          hover:text-white
                          transition
                        "
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            {/* UPLOAD BUTTON */}

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

              <span
                className="
                  text-sm
                  font-medium
                "
              >
                Add Product Images
              </span>

              <span className="text-xs text-gray-500">
                Tap to choose from
                your device
              </span>
            </button>
          </section>

          {/* ============================================== */}
          {/* NAME */}
          {/* ============================================== */}

          <div>
            <label
              htmlFor="edit-name"
              className="
                block
                text-sm
                font-medium
                text-gray-300
                mb-2
              "
            >
              Product Name
            </label>

            <div className="relative">
              <Package
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  w-5
                  h-5
                  text-gray-500
                "
              />

              <input
                id="edit-name"
                name="name"
                required
                value={
                  formData.name
                }
                onChange={
                  handleChange
                }
                className="
                  w-full
                  min-h-[48px]
                  pl-11
                  pr-4
                  rounded-lg
                  bg-gray-700
                  border
                  border-gray-600
                  text-white
                  outline-none
                  focus:border-emerald-500
                  focus:ring-2
                  focus:ring-emerald-500/20
                "
              />
            </div>
          </div>

          {/* ============================================== */}
          {/* PRICE + CATEGORY */}
          {/* ============================================== */}

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-4
            "
          >
            {/* PRICE */}

            <div>
              <label
                htmlFor="edit-price"
                className="
                  block
                  text-sm
                  font-medium
                  text-gray-300
                  mb-2
                "
              >
                Price
              </label>

              <div className="relative">
                <Banknote
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    w-5
                    h-5
                    text-gray-500
                  "
                />

                <input
                  id="edit-price"
                  name="price"
                  type="number"
                  min="1"
                  inputMode="numeric"
                  required
                  value={
                    formData.price
                  }
                  onChange={
                    handleChange
                  }
                  className="
                    w-full
                    min-h-[48px]
                    pl-11
                    pr-4
                    rounded-lg
                    bg-gray-700
                    border
                    border-gray-600
                    text-white
                    outline-none
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-500/20
                  "
                />
              </div>
            </div>

            {/* CATEGORY */}

            <div>
              <label
                htmlFor="edit-category"
                className="
                  block
                  text-sm
                  font-medium
                  text-gray-300
                  mb-2
                "
              >
                Category
              </label>

              <div className="relative">
                <Tag
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    w-5
                    h-5
                    text-gray-500
                  "
                />

                <input
                  id="edit-category"
                  name="category"
                  required
                  value={
                    formData.category
                  }
                  onChange={
                    handleChange
                  }
                  className="
                    w-full
                    min-h-[48px]
                    pl-11
                    pr-4
                    rounded-lg
                    bg-gray-700
                    border
                    border-gray-600
                    text-white
                    outline-none
                    focus:border-emerald-500
                    focus:ring-2
                    focus:ring-emerald-500/20
                  "
                />
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* DESCRIPTION */}
          {/* ============================================== */}

          <div>
            <label
              htmlFor="edit-description"
              className="
                block
                text-sm
                font-medium
                text-gray-300
                mb-2
              "
            >
              Description
            </label>

            <div className="relative">
              <AlignLeft
                className="
                  absolute
                  left-3
                  top-3.5
                  w-5
                  h-5
                  text-gray-500
                "
              />

              <textarea
                id="edit-description"
                name="description"
                rows={5}
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
                className="
                  w-full
                  pl-11
                  pr-4
                  py-3
                  rounded-lg
                  bg-gray-700
                  border
                  border-gray-600
                  text-white
                  outline-none
                  resize-y
                  focus:border-emerald-500
                  focus:ring-2
                  focus:ring-emerald-500/20
                "
              />
            </div>
          </div>
        </div>

        {/* ================================================ */}
        {/* FOOTER */}
        {/* ================================================ */}

        <footer
          className="
            sticky
            bottom-0
            z-20
            bg-gray-800
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

export default EditProductModal;