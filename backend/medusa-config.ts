import { QUOTE_MODULE } from "./src/modules/quote";
import { APPROVAL_MODULE } from "./src/modules/approval";
import { COMPANY_MODULE } from "./src/modules/company";
import { BRAND_MODULE } from "./src/modules/brand";

import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils";
import {
  MINIO_ACCESS_KEY,
  MINIO_BUCKET,
  MINIO_ENDPOINT,
  MINIO_SECRET_KEY,
  STRIPE_API_KEY,
  STRIPE_WEBHOOK_SECRET,
  BACKEND_URL,
  // REDIS_URL,
  // SENDGRID_API_KEY,
  // SENDGRID_FROM_EMAIL,
  RESEND_API_KEY,
  RESEND_FROM_EMAIL,
  MEILISEARCH_HOST,
  MEILISEARCH_ADMIN_KEY,
} from "./src/lib/constants";

loadEnv(process.env.NODE_ENV!, process.cwd());

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: [
    // Custom modules
    {
      key: COMPANY_MODULE,
      resolve: "./modules/company",
      options: {},
      definition: { isQueryable: true },
    },
    {
      key: QUOTE_MODULE,
      resolve: "./modules/quote",
      options: {},
      definition: { isQueryable: true },
    },
    {
      key: APPROVAL_MODULE,
      resolve: "./modules/approval",
      options: {},
      definition: { isQueryable: true },
    },
    {
      key: BRAND_MODULE,
      resolve: "./modules/brand",
      options: {},
      definition: { isQueryable: true },
    },
    // Dynamic modules
    {
      key: Modules.FILE,
      resolve: "@medusajs/file",
      options: {
        providers: [
          ...(MINIO_ENDPOINT && MINIO_ACCESS_KEY && MINIO_SECRET_KEY
            ? [
                {
                  resolve: "./src/modules/minio-file",
                  id: "minio",
                  options: {
                    endPoint: MINIO_ENDPOINT,
                    accessKey: MINIO_ACCESS_KEY,
                    secretKey: MINIO_SECRET_KEY,
                    bucket: MINIO_BUCKET, // Optional, default: medusa-media
                  },
                },
              ]
            : [
                {
                  resolve: "@medusajs/file-local",
                  id: "local",
                  options: {
                    upload_dir: "static",
                    backend_url: `${BACKEND_URL}/static`,
                  },
                },
              ])
        ],
      },
    },
    /* ...(REDIS_URL
      ? [
          {
            key: Modules.EVENT_BUS,
            resolve: "@medusajs/event-bus-redis",
            options: {
              redisUrl: REDIS_URL,
            },
          },
          {
            key: Modules.WORKFLOW_ENGINE,
            resolve: "@medusajs/workflow-engine-redis",
            options: {
              redis: {
                url: REDIS_URL,
              },
            },
          },
        ]
      : [
          {
            key: Modules.WORKFLOW_ENGINE,
            resolve: "@medusajs/medusa/workflow-engine-inmemory",
          },
        ]),*/
    ...((RESEND_API_KEY && RESEND_FROM_EMAIL)
      ? [
          {
            key: Modules.NOTIFICATION,
            resolve: "@medusajs/notification",
            options: {
              providers: [
                {
                  resolve: "./src/modules/email-notifications",
                  id: "resend",
                  options: {
                    channels: ["email"],
                    api_key: RESEND_API_KEY,
                    from: RESEND_FROM_EMAIL,
                  },
                },
              ],
            },
          },
        ]
      : []),
    ...(STRIPE_API_KEY && STRIPE_WEBHOOK_SECRET
      ? [
          {
            key: Modules.PAYMENT,
            resolve: "@medusajs/payment",
            options: {
              providers: [
                {
                  resolve: "@medusajs/payment-stripe",
                  id: "stripe",
                  options: {
                    apiKey: STRIPE_API_KEY,
                    webhookSecret: STRIPE_WEBHOOK_SECRET,
                  },
                },
              ],
            },
          },
        ]
      : []),
  ],
  plugins: [
    ...(MEILISEARCH_HOST && MEILISEARCH_ADMIN_KEY
      ? [
          {
            resolve: "@rokmohar/medusa-plugin-meilisearch",
            options: {
              config: {
                host: MEILISEARCH_HOST,
                apiKey: MEILISEARCH_ADMIN_KEY,
              },
              settings: {
                products: {
                  type: "products",
                  enabled: true,
                  fields: [
                    "id",
                    "title",
                    "description",
                    "handle",
                    "variant_sku",
                    "thumbnail",
                  ],
                  indexSettings: {
                    searchableAttributes: [
                      "title",
                      "description",
                      "variant_sku",
                    ],
                    displayedAttributes: [
                      "id",
                      "handle",
                      "title",
                      "description",
                      "variant_sku",
                      "thumbnail",
                    ],
                    filterableAttributes: ["id", "handle"],
                  },
                  primaryKey: "id",
                },
              },
            },
          },
        ]
      : []),
  ],
});


