/**
 * NetSuite ERP Module (Medusa Custom Module)
 *
 * This module provides integration with NetSuite's SuiteTalk REST API using OAuth 1.0a Token-Based Authentication (TBA).
 *
 * -----------------------------
 * **Authentication Requirements:**
 * -----------------------------
 * - You must configure the following environment variables:
 *     NETSUITE_CONSUMER_KEY
 *     NETSUITE_CONSUMER_SECRET
 *     NETSUITE_TOKEN_ID
 *     NETSUITE_TOKEN_SECRET
 *     NETSUITE_REALM (your NetSuite account realm, usually same as account ID)
 * - The realm must match your NetSuite account ID.
 * - The user/role for the token must have Web Services and TBA permissions.
 *
 * -----------------------------
 * **Module Usage:**
 * -----------------------------
 * - This module registers the NetSuiteModuleService in the Medusa container as 'netsuite'.
 * - All requests are signed using OAuth 1.0a and routed through the service.
 * - See service.ts for detailed authentication and integration notes.
 *
 * -----------------------------
 * **Debugging:**
 * -----------------------------
 * - The service logs the OAuth header (with secrets redacted) and request URL for every request.
 * - If you get 401 Unauthorized, check the Login Audit Trail in NetSuite and your .env values.
 */

import { Module } from "@medusajs/framework/utils"
import NetSuiteModuleService from "./service"

export const NETSUITE_MODULE = "netsuite"

export default Module(NETSUITE_MODULE, {
  service: NetSuiteModuleService,
}) 