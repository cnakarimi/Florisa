# Reusable plant pots

Plants retain their base price and plant inventory on `Product`. The baseline plastic pot is represented by `pot_option_id: null`, adds no charge, and consumes no decorative-pot inventory. It is available whenever the plant meets its minimum order quantity. Pots are configuration data for plants, not a separate product type.

`Pot` stores reusable name, material, color, diameter, height, optional image, active status and shared stock. `PlantPotAssignment` links a plant to a compatible pot and stores its surcharge, active status, display order and optional image of that particular plant/pot combination. `PlantDetails.initial_pot_assignment` may point only to an assignment owned by that plant.

The product API exposes available `pot_options` and an effective `initial_pot_option_id`. For a new product view, it uses the preferred available decorative pot, then the first available decorative option in display order, then baseline plastic. Options that cannot satisfy the plant's minimum quantity are unavailable. Public option data exposes a derived maximum quantity, not the shared pot's stock count.

The final unit price is `Product.price + PlantPotAssignment.additional_price`; baseline plastic adds zero. The combination image is used when present. A standalone pot image is identified as a pot image and is not presented as an exact image of the plant/pot combination. When no combination image exists, the plant gallery remains available with a generic-image caption.

## Admin workflow

1. Create a reusable pot under **گلدان‌های تزئینی**, including its attributes, optional image, active status and shared stock.
2. Edit a plant. Under **گلدان‌های سازگار گیاه**, assign the reusable pot, surcharge, display order and optional combination image. Save the plant.
3. Reopen the plant and select the saved assignment under **انتخاب اولیه گلدان**. The choices are limited to assignments for this plant.
4. Save and check the storefront selection, image and price. An unavailable preferred pot falls back only when choosing the initial option for a new view. An existing customer selection or cart line is never silently moved to another paid pot.

Legacy plant pot fields remain available as historical information and do not define the new purchase configuration. Existing values are preserved. Baseline plastic needs no `Pot` record or inventory entry.

## Cart, checkout and orders

Plant checkout items use `pot_option_id`; it is separate from `variant_id`, which remains for cut-flower variants. An omitted or null option resolves to baseline plastic, including requests from legacy clients. The server rejects assignments owned by another plant, inactive assignments or pots, unavailable plants and insufficient stock.

Before creating an order, checkout aggregates each plant's demand across its configurations and each shared pot's demand across all plants. It locks products, variants, assignments and pots in deterministic primary-key order in one transaction, then decrements each aggregated inventory once. Errors leave the order and inventory unchanged.

Cart storage version 3 reads older version 2 and version 1 carts; older plant entries become baseline plastic. An unavailable or deleted paid option retains its identity and display information, requires explicit reselection and blocks checkout. Distinct configurations of one plant have separate cart, checkout and order identities.

Order items keep snapshots of assignment and pot IDs, pot name and attributes, surcharge, final unit price and the selected configuration image. Foreign-key references can be cleared after deletion while snapshots remain readable. Existing orders retain their historical prices, quantities and images; no unknown pot configuration is inferred.

## Migrations

Apply products migration `0017_plantpotassignment_and_more` and orders migration `0003_remove_orderitem_unique_unvaried_product_per_order_and_more` together with `python manage.py migrate`, after backing up the intended database. These are additive schema changes with revised order uniqueness constraints. They create no inferred pots, inventory or assignments. Populate reusable pots, stock and surcharges in Admin. Reversing these migrations removes the new configuration and snapshot fields, so restore a verified backup before rolling back a database that contains new orders.
