import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CategoryItem = ({ category }) => {
  /*
   * Support either:
   *
   * category.value = "t-shirts"
   *
   * OR legacy:
   *
   * category.href = "/t-shirts"
   */

  const categorySlug =
    category.value ||
    category.slug ||
    String(category.href || "")
      .replace(/^\/+/, "")
      .trim()
      .toLowerCase();

  const categoryUrl =
    `/category/${categorySlug}`;

  return (
    <Link
      to={categoryUrl}
      aria-label={`Explore ${category.name}`}
      className="
        group
        relative
        block
        h-52
        w-full
        overflow-hidden
        rounded-2xl
        bg-gray-800
        sm:h-60
        lg:h-64
      "
    >
      {/* IMAGE */}

      {category.imageUrl ? (
        <img
          src={category.imageUrl}
          alt={category.name}
          loading="lazy"
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-500
            ease-out
            group-hover:scale-110
          "
        />
      ) : (
        <div
          className="
            flex
            h-full
            w-full
            items-center
            justify-center
            bg-gray-800
            text-gray-500
          "
        >
          No image
        </div>
      )}

      {/* DARK GRADIENT */}

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-t
          from-black/90
          via-black/20
          to-transparent
        "
      />

      {/* CATEGORY DETAILS */}

      <div
        className="
          absolute
          inset-x-0
          bottom-0
          z-10
          p-4
          sm:p-5
        "
      >
        <h3
          className="
            text-xl
            font-bold
            text-white
            sm:text-2xl
          "
        >
          {category.name}
        </h3>

        <div
          className="
            mt-1
            flex
            items-center
            gap-1.5
            text-sm
            font-medium
            text-gray-200
            transition
            group-hover:text-emerald-400
          "
        >
          <span>
            Explore {category.name}
          </span>

          <ArrowRight
            size={16}
            className="
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          />
        </div>
      </div>
    </Link>
  );
};

export default CategoryItem;