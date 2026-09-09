# Media storage

## Current approach

All upload fields use Django's `STORAGES["default"]`; no model selects a storage
backend or uses local `.path` access. Existing HomeSlide and magazine upload paths
are unchanged. Product `cover_upload` and ProductImage `image_upload` add optional
uploads while preserving existing repository filenames. Uploads take precedence
in the existing API `cover_image` / `image` fields; clearing an upload restores the
legacy filename. HomeSlide and uploaded product URLs are absolute when serialized
with the API request. Admin previews use the field's storage URL.

- Development: `DEBUG=true`, `MEDIA_STORAGE_BACKEND=filesystem` (default), files
  under `api/media`, served by Django's development route. `MEDIA_ROOT` and
  `MEDIA_URL` may be configured for development.
- Production: `DEBUG=false`, `MEDIA_STORAGE_BACKEND=database` (default). Small
  image bytes live in `media_store_mediafile` in the existing PostgreSQL database.
  `/media/<name>` serves public images with GET/HEAD, content type, cache headers,
  and conditional responses, including with DEBUG disabled. URLs are generated
  from this route, independently of the development `MEDIA_URL` setting.
- Static application assets still use WhiteNoise and `collectstatic`.

Render's ordinary filesystem is ephemeral: uploaded files disappear across
deploys/restarts while database field names survive. Django's development media
route is also disabled in production, and WhiteNoise does not serve uploads.
Persistent Render disks require a paid service and are not used here.
See [Render's disk documentation](https://render.com/docs/disks).

Database media is a **temporary, small-catalog solution**, not scalable object
storage. It consumes database quota, backup space, bandwidth, and application
workers. The configured PostgreSQL database must itself be persistent; this code
cannot prevent provider expiration, quota exhaustion, or database deletion. Check
its existing retention/capacity and keep backups including the media table. No new
service, subscription, or credentials are introduced. Production SQLite and
filesystem media configurations fail early instead of silently losing uploads.

## Deploy and restore

1. Back up the existing database and any surviving media files.
2. Set `MEDIA_STORAGE_BACKEND=database` in Render, retain the persistent PostgreSQL
   `DATABASE_URL`, and keep `DEBUG=false`. Replace any explicit `filesystem` value.
3. Run `python manage.py migrate` before starting the new code (`api/build.sh`
   already does this). Three migrations add the media table, optional product
   uploads, and image-field validation state. Existing image names remain intact.
4. Re-upload missing HomeSlide/cover images through Admin and verify both the API
   URL and an actual image GET. A path in a database cannot recover lost bytes.
   No historical files are copied automatically. For surviving originals, either
   re-upload them or copy through Django storage under the exact existing names.
5. Keep Vercel's `BACKEND_URL` pointed at this backend. Product URL handling accepts
   both repository filenames and absolute upload URLs. No new frontend variable
   is required for database media.

All stored images are public, including unpublished content if its URL is known.
Only trusted staff should upload. Replacing or clearing an upload does not delete
old bytes automatically (Django's usual behavior); monitor growth and remove only
files verified to be unreferenced after taking backups.

## Upload limits

HomeSlide mobile/desktop, product uploads, and magazine covers accept actual
JPEG (`.jpg`/`.jpeg`), PNG, or WebP matching the extension. Each file is at most
5 MiB, 16 million pixels, and 8192 pixels per side. Animated and malformed images
are rejected. Admin validates before its normal Pillow processing; there is no
conversion or resizing. Prepare banner dimensions before uploading.

Multipart requests over 20 MiB declared size receive 413 before parsing. An upload
handler also counts file bytes and rejects over-limit streams with 400 before
decoding/storage. Ordinary format/dimension failures appear as Admin form errors.
`FILE_UPLOAD_MAX_MEMORY_SIZE` is only a buffering threshold, not an upload limit.
These bounds reduce oversized-upload work; they do not guarantee against slow
networks or exhausted workers. Future programmatic writers must call model
`full_clean()` or validated forms/serializers: Django `save()` does not run model
validators automatically. Database storage also validates bytes before writing.

## Later: S3 / R2 / another storage

The existing `django-storages[s3]` dependency is retained; nothing connects to S3
unless selected. After object storage is available:

1. Configure `MEDIA_STORAGE_BACKEND=s3`, `AWS_STORAGE_BUCKET_NAME`,
   `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and the provider's
   `AWS_S3_ENDPOINT_URL` / `AWS_S3_REGION_NAME` (R2 normally uses region `auto`).
   Use a least-privilege bucket credential. Configure public reads plus
   `AWS_S3_CUSTOM_DOMAIN` for public images, or `AWS_QUERYSTRING_AUTH=true` for
   signed URLs. A bucket name alone does not grant public access.
2. Copy existing file bytes from `DatabaseMediaStorage` (or local storage) to a
   separately instantiated destination storage, preserving every field name.
   Check destination collisions, byte counts, and retrieval before switching;
   settings changes alone do not transfer files. Retain backups and the old table
   through verification. The database media route stays available for cached old
   URLs while the table is retained.
3. Set Vercel `MEDIA_HOST` to the public storage origin and rebuild so Next.js
   allows that image host. Verify Admin previews, HomeSlide, product, and magazine
   URLs end to end.

No model or serializer changes are needed. For another Django-compatible backend,
configure its class/options in `STORAGES["default"]` and install its dependency.
See [Django's storage interface](https://docs.djangoproject.com/en/5.2/howto/custom-file-storage/).
