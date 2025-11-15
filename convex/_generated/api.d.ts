/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as budgets from "../budgets.js";
import type * as dashboard from "../dashboard.js";
import type * as firecrawl from "../firecrawl.js";
import type * as http from "../http.js";
import type * as insights from "../insights.js";
import type * as splits from "../splits.js";
import type * as transactions from "../transactions.js";
import type * as user from "../user.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  budgets: typeof budgets;
  dashboard: typeof dashboard;
  firecrawl: typeof firecrawl;
  http: typeof http;
  insights: typeof insights;
  splits: typeof splits;
  transactions: typeof transactions;
  user: typeof user;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
