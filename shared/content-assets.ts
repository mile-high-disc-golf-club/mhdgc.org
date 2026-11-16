/**
 * Where the browser fetches encoded content images in production: a custom
 * domain on the R2 bucket that `bun run images:upload` fills. The build only
 * writes URLs here; it never encodes or uploads anything.
 */
export const contentAssetsOrigin = 'https://assets.mhdgc.org'

/** The R2 bucket, in the club's Cloudflare account, behind `contentAssetsOrigin`. */
export const contentAssetsBucket = 'mhdgc-content-images'
