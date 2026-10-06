# SaWrap product images

The original project ZIP contained product records but no product photos. These images were supplied separately by the owner on 2026-10-06. The numbered source images were checked visually against the eleven original flavor names before assignment.

| Product | Source image | Local file |
| --- | ---: | --- |
| Classic / Sugar-Coated | 1 | `classic-sugar-coated.png` |
| Chocowrap | 4 | `chocowrap.png` |
| White Chocolatewrap | 11 | `white-chocolatewrap.png` |
| Strawbewrap | 9 | `strawbewrap.png` |
| Ubewrap | 8 | `ubewrap.png` |
| Condewrap | 10 | `condewrap.png` |
| Biscowrap | 5 | `biscowrap.png` |
| Pistachiowrap | replacement supplied after image 12 | `pistachiowrap.png` |
| Matchawrap | 3 | `matchawrap.png` |
| S’mowrap | 6 | `smowrap.png` |
| Cream chewrap | 12 | `cream-chewrap.png` |

`plain-turon-reference.png` is the unglazed image 2 and is not assigned to a catalog item. `pistachio-with-knafeh-reference.png` is the original image 7 and is not assigned to the base Pistachiowrap because Knafeh is an optional add-on. The owner confirmed the Condewrap and White Chocolatewrap mapping and supplied the replacement Pistachiowrap image.

The live catalog uses `products.image_path` to refer to files in the Supabase Storage `catalog-images` bucket. Preserve the source files in `sawrap-project/catalog-images/` even after uploading them to Supabase.
