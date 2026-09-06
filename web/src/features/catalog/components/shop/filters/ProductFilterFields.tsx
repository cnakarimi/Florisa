import type { ProductQuery } from "@/features/catalog/types";

import {
  FilterBoolean,
  FilterGroup,
  FilterInput,
  FilterSelect,
  type UpdateFilter,
} from "./FilterControls";

interface ProductFilterFieldsProps {
  filters: ProductQuery;
  update: UpdateFilter;
}

export function PlantFilterFields({
  filters,
  update,
}: ProductFilterFieldsProps) {
  return (
    <FilterGroup title="مشخصات گیاه">
      <FilterSelect
        label="اندازه گیاه"
        value={filters.plant_size ?? ""}
        onChange={(value) =>
          update(
            "plant_size",
            value === "small" || value === "medium" || value === "large"
              ? value
              : undefined,
          )
        }
        options={[
          ["", "همه"],
          ["small", "کوچک"],
          ["medium", "متوسط"],
          ["large", "بزرگ"],
        ]}
      />

      <div className="grid grid-cols-2 gap-2">
        <FilterInput
          label="کمترین ارتفاع"
          type="number"
          value={filters.min_height ?? ""}
          onChange={(value) =>
            update("min_height", value ? Number(value) : undefined)
          }
        />

        <FilterInput
          label="بیشترین ارتفاع"
          type="number"
          value={filters.max_height ?? ""}
          onChange={(value) =>
            update("max_height", value ? Number(value) : undefined)
          }
        />
      </div>

      <FilterSelect
        label="درجه کیفیت"
        value={filters.quality_grade ?? ""}
        onChange={(value) =>
          update(
            "quality_grade",
            value === "standard" || value === "premium" || value === "luxury"
              ? value
              : undefined,
          )
        }
        options={[
          ["", "همه"],
          ["standard", "استاندارد"],
          ["premium", "ممتاز"],
          ["luxury", "لوکس"],
        ]}
      />

      <div className="grid grid-cols-2 gap-2">
        <FilterBoolean
          label="سازگار با حیوانات"
          value={filters.pet_friendly}
          onChange={(value) => update("pet_friendly", value)}
        />

        <FilterBoolean
          label="گلدان همراه"
          value={filters.pot_included}
          onChange={(value) => update("pot_included", value)}
        />

        <FilterBoolean
          label="دارای زهکشی"
          value={filters.has_drainage}
          onChange={(value) => update("has_drainage", value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <FilterInput
          label="جنس گلدان"
          value={filters.pot_material ?? ""}
          onChange={(value) => update("pot_material", value || undefined)}
        />

        <FilterInput
          label="رنگ گلدان"
          value={filters.pot_color ?? ""}
          onChange={(value) => update("pot_color", value || undefined)}
        />
      </div>

      <FilterSelect
        label="نور"
        value={filters.light_requirement ?? ""}
        onChange={(value) =>
          update(
            "light_requirement",
            value === "low" ||
              value === "indirect" ||
              value === "bright" ||
              value === "direct"
              ? value
              : undefined,
          )
        }
        options={[
          ["", "همه"],
          ["low", "کم"],
          ["indirect", "غیرمستقیم"],
          ["bright", "زیاد"],
          ["direct", "مستقیم"],
        ]}
      />

      <FilterSelect
        label="آبیاری"
        value={filters.watering_requirement ?? ""}
        onChange={(value) =>
          update(
            "watering_requirement",
            value === "low" || value === "medium" || value === "high"
              ? value
              : undefined,
          )
        }
        options={[
          ["", "همه"],
          ["low", "کم"],
          ["medium", "متوسط"],
          ["high", "زیاد"],
        ]}
      />

      <FilterSelect
        label="سختی نگهداری"
        value={filters.care_difficulty ?? ""}
        onChange={(value) =>
          update(
            "care_difficulty",
            value === "easy" || value === "medium" || value === "hard"
              ? value
              : undefined,
          )
        }
        options={[
          ["", "همه"],
          ["easy", "آسان"],
          ["medium", "متوسط"],
          ["hard", "حساس"],
        ]}
      />
    </FilterGroup>
  );
}

export function CutFlowerFilterFields({
  filters,
  update,
}: ProductFilterFieldsProps) {
  return (
    <FilterGroup title="مشخصات گل شاخه‌ای">
      <div className="grid grid-cols-2 gap-2">
        <FilterInput
          label="نوع گل"
          value={filters.flower_type ?? ""}
          onChange={(value) => update("flower_type", value || undefined)}
        />

        <FilterInput
          label="رقم"
          value={filters.variety ?? ""}
          onChange={(value) => update("variety", value || undefined)}
        />

        <FilterInput
          label="رنگ"
          value={filters.color ?? ""}
          onChange={(value) => update("color", value || undefined)}
        />

        <FilterInput
          label="کمترین ماندگاری"
          type="number"
          value={filters.min_vase_life ?? ""}
          onChange={(value) =>
            update("min_vase_life", value ? Number(value) : undefined)
          }
        />

        <FilterInput
          label="کمترین طول ساقه"
          type="number"
          value={filters.min_stem_length ?? ""}
          onChange={(value) =>
            update("min_stem_length", value ? Number(value) : undefined)
          }
        />

        <FilterInput
          label="بیشترین طول ساقه"
          type="number"
          value={filters.max_stem_length ?? ""}
          onChange={(value) =>
            update("max_stem_length", value ? Number(value) : undefined)
          }
        />
      </div>

      <FilterSelect
        label="درجه گل"
        value={filters.flower_grade ?? ""}
        onChange={(value) =>
          update(
            "flower_grade",
            value === "standard" || value === "premium" || value === "luxury"
              ? value
              : undefined,
          )
        }
        options={[
          ["", "همه"],
          ["standard", "استاندارد"],
          ["premium", "ممتاز"],
          ["luxury", "لوکس"],
        ]}
      />

      <FilterSelect
        label="میزان رایحه"
        value={filters.fragrance_level ?? ""}
        onChange={(value) =>
          update(
            "fragrance_level",
            value === "none" ||
              value === "light" ||
              value === "medium" ||
              value === "strong"
              ? value
              : undefined,
          )
        }
        options={[
          ["", "همه"],
          ["none", "بدون رایحه"],
          ["light", "ملایم"],
          ["medium", "متوسط"],
          ["strong", "قوی"],
        ]}
      />

      <FilterSelect
        label="فصل عرضه"
        value={filters.seasonal_availability ?? ""}
        onChange={(value) =>
          update(
            "seasonal_availability",
            value === "year_round" ||
              value === "spring" ||
              value === "summer" ||
              value === "autumn" ||
              value === "winter"
              ? value
              : undefined,
          )
        }
        options={[
          ["", "همه"],
          ["year_round", "چهارفصل"],
          ["spring", "بهار"],
          ["summer", "تابستان"],
          ["autumn", "پاییز"],
          ["winter", "زمستان"],
        ]}
      />
    </FilterGroup>
  );
}
