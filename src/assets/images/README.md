# Shoply image assets

Product and category photos are served from this folder. The Angular app **does not** load catalog images from external URLs at runtime.

## Layout

| Path | Purpose |
| --- | --- |
| `product-placeholder.png` | Final fallback when a product file is missing |
| `products/` | One file per catalog image reference (usually the filename stored in Hasura) |
| `categories/` | Category hero backgrounds (`electronics.jpg`, etc.) |
| `image-manifest.json` | Checklist of expected files (used by `npm run images:sync`) |

## Adding images

1. Open `image-manifest.json` and confirm the filename you need.
2. Drop the image into `products/` or `categories/` with that exact name.
3. Run the app — `ProductImageService` resolves API values like `iphone13pro.jpg` to `assets/images/products/iphone13pro.jpg`.

Optional: run `npm run images:sync` after adding `sourceUrl` entries to the manifest (see script help). The sync script is for maintainers only; the built app never fetches those URLs.
