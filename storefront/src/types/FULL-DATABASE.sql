-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.account_holder (
  id text NOT NULL,
  provider_id text NOT NULL,
  external_id text NOT NULL,
  email text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT account_holder_pkey PRIMARY KEY (id)
);
CREATE TABLE public.api_key (
  id text NOT NULL,
  token text NOT NULL,
  salt text NOT NULL,
  redacted text NOT NULL,
  title text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['publishable'::text, 'secret'::text])),
  last_used_at timestamp with time zone,
  created_by text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  revoked_by text,
  revoked_at timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT api_key_pkey PRIMARY KEY (id)
);
CREATE TABLE public.application_method_buy_rules (
  application_method_id text NOT NULL,
  promotion_rule_id text NOT NULL,
  CONSTRAINT application_method_buy_rules_pkey PRIMARY KEY (application_method_id, promotion_rule_id),
  CONSTRAINT application_method_buy_rules_application_method_id_foreign FOREIGN KEY (application_method_id) REFERENCES public.promotion_application_method(id),
  CONSTRAINT application_method_buy_rules_promotion_rule_id_foreign FOREIGN KEY (promotion_rule_id) REFERENCES public.promotion_rule(id)
);
CREATE TABLE public.application_method_target_rules (
  application_method_id text NOT NULL,
  promotion_rule_id text NOT NULL,
  CONSTRAINT application_method_target_rules_pkey PRIMARY KEY (application_method_id, promotion_rule_id),
  CONSTRAINT application_method_target_rules_application_method_id_foreign FOREIGN KEY (application_method_id) REFERENCES public.promotion_application_method(id),
  CONSTRAINT application_method_target_rules_promotion_rule_id_foreign FOREIGN KEY (promotion_rule_id) REFERENCES public.promotion_rule(id)
);
CREATE TABLE public.approval (
  id text NOT NULL,
  cart_id text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['admin'::text, 'sales_manager'::text])),
  status text NOT NULL CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  created_by text NOT NULL,
  handled_by text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT approval_pkey PRIMARY KEY (id)
);
CREATE TABLE public.approval_settings (
  id text NOT NULL,
  requires_admin_approval boolean NOT NULL DEFAULT false,
  requires_sales_manager_approval boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  company_id text NOT NULL,
  CONSTRAINT approval_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.approval_status (
  id text NOT NULL,
  cart_id text NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT approval_status_pkey PRIMARY KEY (id)
);
CREATE TABLE public.auth_identity (
  id text NOT NULL,
  app_metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT auth_identity_pkey PRIMARY KEY (id)
);
CREATE TABLE public.capture (
  id text NOT NULL,
  amount numeric NOT NULL,
  raw_amount jsonb NOT NULL,
  payment_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  created_by text,
  metadata jsonb,
  CONSTRAINT capture_pkey PRIMARY KEY (id),
  CONSTRAINT capture_payment_id_foreign FOREIGN KEY (payment_id) REFERENCES public.payment(id)
);
CREATE TABLE public.cart (
  id text NOT NULL,
  region_id text,
  customer_id text,
  sales_channel_id text,
  email text,
  currency_code text NOT NULL,
  shipping_address_id text,
  billing_address_id text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  completed_at timestamp with time zone,
  CONSTRAINT cart_pkey PRIMARY KEY (id),
  CONSTRAINT cart_shipping_address_id_foreign FOREIGN KEY (shipping_address_id) REFERENCES public.cart_address(id),
  CONSTRAINT cart_billing_address_id_foreign FOREIGN KEY (billing_address_id) REFERENCES public.cart_address(id)
);
CREATE TABLE public.cart_address (
  id text NOT NULL,
  customer_id text,
  company text,
  first_name text,
  last_name text,
  address_1 text,
  address_2 text,
  city text,
  country_code text,
  province text,
  postal_code text,
  phone text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT cart_address_pkey PRIMARY KEY (id)
);
CREATE TABLE public.cart_cart_approval_approval (
  cart_id character varying NOT NULL,
  approval_id character varying NOT NULL,
  id character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT cart_cart_approval_approval_pkey PRIMARY KEY (cart_id, approval_id)
);
CREATE TABLE public.cart_cart_approval_approval_status (
  cart_id character varying NOT NULL,
  approval_status_id character varying NOT NULL,
  id character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT cart_cart_approval_approval_status_pkey PRIMARY KEY (cart_id, approval_status_id)
);
CREATE TABLE public.cart_line_item (
  id text NOT NULL,
  cart_id text NOT NULL,
  title text NOT NULL,
  subtitle text,
  thumbnail text,
  quantity integer NOT NULL,
  variant_id text,
  product_id text,
  product_title text,
  product_description text,
  product_subtitle text,
  product_type text,
  product_collection text,
  product_handle text,
  variant_sku text,
  variant_barcode text,
  variant_title text,
  variant_option_values jsonb,
  requires_shipping boolean NOT NULL DEFAULT true,
  is_discountable boolean NOT NULL DEFAULT true,
  is_tax_inclusive boolean NOT NULL DEFAULT false,
  compare_at_unit_price numeric,
  raw_compare_at_unit_price jsonb,
  unit_price numeric NOT NULL CHECK (unit_price >= 0::numeric),
  raw_unit_price jsonb NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  product_type_id text,
  is_custom_price boolean NOT NULL DEFAULT false,
  is_giftcard boolean NOT NULL DEFAULT false,
  CONSTRAINT cart_line_item_pkey PRIMARY KEY (id),
  CONSTRAINT cart_line_item_cart_id_foreign FOREIGN KEY (cart_id) REFERENCES public.cart(id)
);
CREATE TABLE public.cart_line_item_adjustment (
  id text NOT NULL,
  description text,
  promotion_id text,
  code text,
  amount numeric NOT NULL CHECK (amount >= 0::numeric),
  raw_amount jsonb NOT NULL,
  provider_id text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  item_id text,
  CONSTRAINT cart_line_item_adjustment_pkey PRIMARY KEY (id),
  CONSTRAINT cart_line_item_adjustment_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.cart_line_item(id)
);
CREATE TABLE public.cart_line_item_tax_line (
  id text NOT NULL,
  description text,
  tax_rate_id text,
  code text NOT NULL,
  rate real NOT NULL,
  provider_id text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  item_id text,
  CONSTRAINT cart_line_item_tax_line_pkey PRIMARY KEY (id),
  CONSTRAINT cart_line_item_tax_line_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.cart_line_item(id)
);
CREATE TABLE public.cart_payment_collection (
  cart_id character varying NOT NULL,
  payment_collection_id character varying NOT NULL,
  id character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT cart_payment_collection_pkey PRIMARY KEY (cart_id, payment_collection_id)
);
CREATE TABLE public.cart_promotion (
  cart_id character varying NOT NULL,
  promotion_id character varying NOT NULL,
  id character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT cart_promotion_pkey PRIMARY KEY (cart_id, promotion_id)
);
CREATE TABLE public.cart_shipping_method (
  id text NOT NULL,
  cart_id text NOT NULL,
  name text NOT NULL,
  description jsonb,
  amount numeric NOT NULL CHECK (amount >= 0::numeric),
  raw_amount jsonb NOT NULL,
  is_tax_inclusive boolean NOT NULL DEFAULT false,
  shipping_option_id text,
  data jsonb,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT cart_shipping_method_pkey PRIMARY KEY (id),
  CONSTRAINT cart_shipping_method_cart_id_foreign FOREIGN KEY (cart_id) REFERENCES public.cart(id)
);
CREATE TABLE public.cart_shipping_method_adjustment (
  id text NOT NULL,
  description text,
  promotion_id text,
  code text,
  amount numeric NOT NULL,
  raw_amount jsonb NOT NULL,
  provider_id text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  shipping_method_id text,
  CONSTRAINT cart_shipping_method_adjustment_pkey PRIMARY KEY (id),
  CONSTRAINT cart_shipping_method_adjustment_shipping_method_id_foreign FOREIGN KEY (shipping_method_id) REFERENCES public.cart_shipping_method(id)
);
CREATE TABLE public.cart_shipping_method_tax_line (
  id text NOT NULL,
  description text,
  tax_rate_id text,
  code text NOT NULL,
  rate real NOT NULL,
  provider_id text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  shipping_method_id text,
  CONSTRAINT cart_shipping_method_tax_line_pkey PRIMARY KEY (id),
  CONSTRAINT cart_shipping_method_tax_line_shipping_method_id_foreign FOREIGN KEY (shipping_method_id) REFERENCES public.cart_shipping_method(id)
);
CREATE TABLE public.company (
  id text NOT NULL,
  name text NOT NULL,
  phone text,
  email text NOT NULL,
  address text,
  city text,
  state text,
  zip text,
  country text,
  logo_url text,
  currency_code text,
  spending_limit_reset_frequency text NOT NULL DEFAULT 'monthly'::text CHECK (spending_limit_reset_frequency = ANY (ARRAY['never'::text, 'daily'::text, 'weekly'::text, 'monthly'::text, 'yearly'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT company_pkey PRIMARY KEY (id)
);
CREATE TABLE public.company_company_approval_approval_settings (
  company_id character varying NOT NULL,
  approval_settings_id character varying NOT NULL,
  id character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT company_company_approval_approval_settings_pkey PRIMARY KEY (company_id, approval_settings_id)
);
CREATE TABLE public.company_company_cart_cart (
  company_id character varying NOT NULL,
  cart_id character varying NOT NULL,
  id character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT company_company_cart_cart_pkey PRIMARY KEY (company_id, cart_id)
);
CREATE TABLE public.company_company_customer_customer_group (
  company_id character varying NOT NULL,
  customer_group_id character varying NOT NULL,
  id character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT company_company_customer_customer_group_pkey PRIMARY KEY (company_id, customer_group_id)
);
CREATE TABLE public.company_employee_customer_customer (
  employee_id character varying NOT NULL,
  customer_id character varying NOT NULL,
  id character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT company_employee_customer_customer_pkey PRIMARY KEY (employee_id, customer_id)
);
CREATE TABLE public.credit_line (
  id text NOT NULL,
  cart_id text NOT NULL,
  reference text,
  reference_id text,
  amount numeric NOT NULL,
  raw_amount jsonb NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT credit_line_pkey PRIMARY KEY (id),
  CONSTRAINT credit_line_cart_id_foreign FOREIGN KEY (cart_id) REFERENCES public.cart(id)
);
CREATE TABLE public.currency (
  code text NOT NULL,
  symbol text NOT NULL,
  symbol_native text NOT NULL,
  decimal_digits integer NOT NULL DEFAULT 0,
  rounding numeric NOT NULL DEFAULT 0,
  raw_rounding jsonb NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT currency_pkey PRIMARY KEY (code)
);
CREATE TABLE public.customer (
  id text NOT NULL,
  company_name text,
  first_name text,
  last_name text,
  email text,
  phone text,
  has_account boolean NOT NULL DEFAULT false,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  created_by text,
  CONSTRAINT customer_pkey PRIMARY KEY (id)
);
CREATE TABLE public.customer_account_holder (
  customer_id character varying NOT NULL,
  account_holder_id character varying NOT NULL,
  id character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT customer_account_holder_pkey PRIMARY KEY (customer_id, account_holder_id)
);
CREATE TABLE public.customer_address (
  id text NOT NULL,
  customer_id text NOT NULL,
  address_name text,
  is_default_shipping boolean NOT NULL DEFAULT false,
  is_default_billing boolean NOT NULL DEFAULT false,
  company text,
  first_name text,
  last_name text,
  address_1 text,
  address_2 text,
  city text,
  country_code text,
  province text,
  postal_code text,
  phone text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT customer_address_pkey PRIMARY KEY (id),
  CONSTRAINT customer_address_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES public.customer(id)
);
CREATE TABLE public.customer_group (
  id text NOT NULL,
  name text NOT NULL,
  metadata jsonb,
  created_by text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT customer_group_pkey PRIMARY KEY (id)
);
CREATE TABLE public.customer_group_customer (
  id text NOT NULL,
  customer_id text NOT NULL,
  customer_group_id text NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by text,
  deleted_at timestamp with time zone,
  CONSTRAINT customer_group_customer_pkey PRIMARY KEY (id),
  CONSTRAINT customer_group_customer_customer_group_id_foreign FOREIGN KEY (customer_group_id) REFERENCES public.customer_group(id),
  CONSTRAINT customer_group_customer_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES public.customer(id)
);
CREATE TABLE public.employee (
  id text NOT NULL,
  spending_limit numeric NOT NULL DEFAULT 0,
  is_admin boolean NOT NULL DEFAULT false,
  company_id text NOT NULL,
  raw_spending_limit jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT employee_pkey PRIMARY KEY (id),
  CONSTRAINT employee_company_id_foreign FOREIGN KEY (company_id) REFERENCES public.company(id)
);
CREATE TABLE public.fulfillment (
  id text NOT NULL,
  location_id text NOT NULL,
  packed_at timestamp with time zone,
  shipped_at timestamp with time zone,
  delivered_at timestamp with time zone,
  canceled_at timestamp with time zone,
  data jsonb,
  provider_id text,
  shipping_option_id text,
  metadata jsonb,
  delivery_address_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  marked_shipped_by text,
  created_by text,
  requires_shipping boolean NOT NULL DEFAULT true,
  CONSTRAINT fulfillment_pkey PRIMARY KEY (id),
  CONSTRAINT fulfillment_provider_id_foreign FOREIGN KEY (provider_id) REFERENCES public.fulfillment_provider(id),
  CONSTRAINT fulfillment_delivery_address_id_foreign FOREIGN KEY (delivery_address_id) REFERENCES public.fulfillment_address(id),
  CONSTRAINT fulfillment_shipping_option_id_foreign FOREIGN KEY (shipping_option_id) REFERENCES public.shipping_option(id)
);
CREATE TABLE public.fulfillment_address (
  id text NOT NULL,
  company text,
  first_name text,
  last_name text,
  address_1 text,
  address_2 text,
  city text,
  country_code text,
  province text,
  postal_code text,
  phone text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT fulfillment_address_pkey PRIMARY KEY (id)
);
CREATE TABLE public.fulfillment_item (
  id text NOT NULL,
  title text NOT NULL,
  sku text NOT NULL,
  barcode text NOT NULL,
  quantity numeric NOT NULL,
  raw_quantity jsonb NOT NULL,
  line_item_id text,
  inventory_item_id text,
  fulfillment_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT fulfillment_item_pkey PRIMARY KEY (id),
  CONSTRAINT fulfillment_item_fulfillment_id_foreign FOREIGN KEY (fulfillment_id) REFERENCES public.fulfillment(id)
);
CREATE TABLE public.fulfillment_label (
  id text NOT NULL,
  tracking_number text NOT NULL,
  tracking_url text NOT NULL,
  label_url text NOT NULL,
  fulfillment_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT fulfillment_label_pkey PRIMARY KEY (id),
  CONSTRAINT fulfillment_label_fulfillment_id_foreign FOREIGN KEY (fulfillment_id) REFERENCES public.fulfillment(id)
);
CREATE TABLE public.fulfillment_provider (
  id text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT fulfillment_provider_pkey PRIMARY KEY (id)
);
CREATE TABLE public.fulfillment_set (
  id text NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT fulfillment_set_pkey PRIMARY KEY (id)
);
CREATE TABLE public.geo_zone (
  id text NOT NULL,
  type text NOT NULL DEFAULT 'country'::text CHECK (type = ANY (ARRAY['country'::text, 'province'::text, 'city'::text, 'zip'::text])),
  country_code text NOT NULL,
  province_code text,
  city text,
  service_zone_id text NOT NULL,
  postal_expression jsonb,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT geo_zone_pkey PRIMARY KEY (id),
  CONSTRAINT geo_zone_service_zone_id_foreign FOREIGN KEY (service_zone_id) REFERENCES public.service_zone(id)
);
CREATE TABLE public.image (
  id text NOT NULL,
  url text NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  rank integer NOT NULL DEFAULT 0,
  product_id text NOT NULL,
  CONSTRAINT image_pkey PRIMARY KEY (id),
  CONSTRAINT image_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(id)
);
CREATE TABLE public.inventory_item (
  id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  sku text,
  origin_country text,
  hs_code text,
  mid_code text,
  material text,
  weight integer,
  length integer,
  height integer,
  width integer,
  requires_shipping boolean NOT NULL DEFAULT true,
  description text,
  title text,
  thumbnail text,
  metadata jsonb,
  CONSTRAINT inventory_item_pkey PRIMARY KEY (id)
);
CREATE TABLE public.inventory_level (
  id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  inventory_item_id text NOT NULL,
  location_id text NOT NULL,
  stocked_quantity numeric NOT NULL DEFAULT 0,
  reserved_quantity numeric NOT NULL DEFAULT 0,
  incoming_quantity numeric NOT NULL DEFAULT 0,
  metadata jsonb,
  raw_stocked_quantity jsonb,
  raw_reserved_quantity jsonb,
  raw_incoming_quantity jsonb,
  CONSTRAINT inventory_level_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_level_inventory_item_id_foreign FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_item(id)
);
CREATE TABLE public.invite (
  id text NOT NULL,
  email text NOT NULL,
  accepted boolean NOT NULL DEFAULT false,
  token text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT invite_pkey PRIMARY KEY (id)
);
CREATE TABLE public.link_module_migrations (
  id integer NOT NULL DEFAULT nextval('link_module_migrations_id_seq'::regclass),
  table_name character varying NOT NULL UNIQUE,
  link_descriptor jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT link_module_migrations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.location_fulfillment_provider (
  stock_location_id character varying NOT NULL,
  fulfillment_provider_id character varying NOT NULL,
  id character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT location_fulfillment_provider_pkey PRIMARY KEY (stock_location_id, fulfillment_provider_id)
);
CREATE TABLE public.location_fulfillment_set (
  stock_location_id character varying NOT NULL,
  fulfillment_set_id character varying NOT NULL,
  id character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT location_fulfillment_set_pkey PRIMARY KEY (stock_location_id, fulfillment_set_id)
);
CREATE TABLE public.message (
  id text NOT NULL,
  text text NOT NULL,
  item_id text,
  admin_id text,
  customer_id text,
  quote_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT message_pkey PRIMARY KEY (id),
  CONSTRAINT message_quote_id_foreign FOREIGN KEY (quote_id) REFERENCES public.quote(id)
);
CREATE TABLE public.mikro_orm_migrations (
  id integer NOT NULL DEFAULT nextval('mikro_orm_migrations_id_seq'::regclass),
  name character varying,
  executed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT mikro_orm_migrations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.notification (
  id text NOT NULL,
  to text NOT NULL,
  channel text NOT NULL,
  template text NOT NULL,
  data jsonb,
  trigger_type text,
  resource_id text,
  resource_type text,
  receiver_id text,
  original_notification_id text,
  idempotency_key text,
  external_id text,
  provider_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'success'::text, 'failure'::text])),
  CONSTRAINT notification_pkey PRIMARY KEY (id),
  CONSTRAINT notification_provider_id_foreign FOREIGN KEY (provider_id) REFERENCES public.notification_provider(id)
);
CREATE TABLE public.notification_provider (
  id text NOT NULL,
  handle text NOT NULL,
  name text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  channels ARRAY NOT NULL DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT notification_provider_pkey PRIMARY KEY (id)
);
CREATE TABLE public.order (
  id text NOT NULL,
  region_id text,
  display_id integer DEFAULT nextval('order_display_id_seq'::regclass),
  customer_id text,
  version integer NOT NULL DEFAULT 1,
  sales_channel_id text,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::order_status_enum,
  is_draft_order boolean NOT NULL DEFAULT false,
  email text,
  currency_code text NOT NULL,
  shipping_address_id text,
  billing_address_id text,
  no_notification boolean,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  canceled_at timestamp with time zone,
  CONSTRAINT order_pkey PRIMARY KEY (id),
  CONSTRAINT order_shipping_address_id_foreign FOREIGN KEY (shipping_address_id) REFERENCES public.order_address(id),
  CONSTRAINT order_billing_address_id_foreign FOREIGN KEY (billing_address_id) REFERENCES public.order_address(id)
);
CREATE TABLE public.order_address (
  id text NOT NULL,
  customer_id text,
  company text,
  first_name text,
  last_name text,
  address_1 text,
  address_2 text,
  city text,
  country_code text,
  province text,
  postal_code text,
  phone text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT order_address_pkey PRIMARY KEY (id)
);
CREATE TABLE public.order_cart (
  order_id character varying NOT NULL,
  cart_id character varying NOT NULL,
  id character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT order_cart_pkey PRIMARY KEY (order_id, cart_id)
);
CREATE TABLE public.order_change (
  id text NOT NULL,
  order_id text NOT NULL,
  version integer NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['confirmed'::text, 'declined'::text, 'requested'::text, 'pending'::text, 'canceled'::text])),
  internal_note text,
  created_by text,
  requested_by text,
  requested_at timestamp with time zone,
  confirmed_by text,
  confirmed_at timestamp with time zone,
  declined_by text,
  declined_reason text,
  metadata jsonb,
  declined_at timestamp with time zone,
  canceled_by text,
  canceled_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  change_type text,
  deleted_at timestamp with time zone,
  return_id text,
  claim_id text,
  exchange_id text,
  CONSTRAINT order_change_pkey PRIMARY KEY (id),
  CONSTRAINT order_change_order_id_foreign FOREIGN KEY (order_id) REFERENCES public.order(id)
);
CREATE TABLE public.order_change_action (
  id text NOT NULL,
  order_id text,
  version integer,
  ordering bigint NOT NULL DEFAULT nextval('order_change_action_ordering_seq'::regclass),
  order_change_id text,
  reference text,
  reference_id text,
  action text NOT NULL,
  details jsonb,
  amount numeric,
  raw_amount jsonb,
  internal_note text,
  applied boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  return_id text,
  claim_id text,
  exchange_id text,
  CONSTRAINT order_change_action_pkey PRIMARY KEY (id),
  CONSTRAINT order_change_action_order_change_id_foreign FOREIGN KEY (order_change_id) REFERENCES public.order_change(id)
);
CREATE TABLE public.order_claim (
  id text NOT NULL,
  order_id text NOT NULL,
  return_id text,
  order_version integer NOT NULL,
  display_id integer NOT NULL DEFAULT nextval('order_claim_display_id_seq'::regclass),
  type USER-DEFINED NOT NULL,
  no_notification boolean,
  refund_amount numeric,
  raw_refund_amount jsonb,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  canceled_at timestamp with time zone,
  created_by text,
  CONSTRAINT order_claim_pkey PRIMARY KEY (id)
);
CREATE TABLE public.order_claim_item (
  id text NOT NULL,
  claim_id text NOT NULL,
  item_id text NOT NULL,
  is_additional_item boolean NOT NULL DEFAULT false,
  reason USER-DEFINED,
  quantity numeric NOT NULL,
  raw_quantity jsonb NOT NULL,
  note text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT order_claim_item_pkey PRIMARY KEY (id)
);
CREATE TABLE public.order_claim_item_image (
  id text NOT NULL,
  claim_item_id text NOT NULL,
  url text NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT order_claim_item_image_pkey PRIMARY KEY (id)
);
CREATE TABLE public.order_credit_line (
  id text NOT NULL,
  order_id text NOT NULL,
  reference text,
  reference_id text,
  amount numeric NOT NULL,
  raw_amount jsonb NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT order_credit_line_pkey PRIMARY KEY (id),
  CONSTRAINT order_credit_line_order_id_foreign FOREIGN KEY (order_id) REFERENCES public.order(id)
);
CREATE TABLE public.order_exchange (
  id text NOT NULL,
  order_id text NOT NULL,
  return_id text,
  order_version integer NOT NULL,
  display_id integer NOT NULL DEFAULT nextval('order_exchange_display_id_seq'::regclass),
  no_notification boolean,
  allow_backorder boolean NOT NULL DEFAULT false,
  difference_due numeric,
  raw_difference_due jsonb,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  canceled_at timestamp with time zone,
  created_by text,
  CONSTRAINT order_exchange_pkey PRIMARY KEY (id)
);
CREATE TABLE public.order_exchange_item (
  id text NOT NULL,
  exchange_id text NOT NULL,
  item_id text NOT NULL,
  quantity numeric NOT NULL,
  raw_quantity jsonb NOT NULL,
  note text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT order_exchange_item_pkey PRIMARY KEY (id)
);
CREATE TABLE public.order_fulfillment (
  order_id character varying NOT NULL,
  fulfillment_id character varying NOT NULL,
  id character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT order_fulfillment_pkey PRIMARY KEY (order_id, fulfillment_id)
);
CREATE TABLE public.order_item (
  id text NOT NULL,
  order_id text NOT NULL,
  version integer NOT NULL,
  item_id text NOT NULL,
  quantity numeric NOT NULL,
  raw_quantity jsonb NOT NULL,
  fulfilled_quantity numeric NOT NULL,
  raw_fulfilled_quantity jsonb NOT NULL,
  shipped_quantity numeric NOT NULL,
  raw_shipped_quantity jsonb NOT NULL,
  return_requested_quantity numeric NOT NULL,
  raw_return_requested_quantity jsonb NOT NULL,
  return_received_quantity numeric NOT NULL,
  raw_return_received_quantity jsonb NOT NULL,
  return_dismissed_quantity numeric NOT NULL,
  raw_return_dismissed_quantity jsonb NOT NULL,
  written_off_quantity numeric NOT NULL,
  raw_written_off_quantity jsonb NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  delivered_quantity numeric NOT NULL DEFAULT 0,
  raw_delivered_quantity jsonb NOT NULL,
  unit_price numeric,
  raw_unit_price jsonb,
  compare_at_unit_price numeric,
  raw_compare_at_unit_price jsonb,
  CONSTRAINT order_item_pkey PRIMARY KEY (id),
  CONSTRAINT order_item_order_id_foreign FOREIGN KEY (order_id) REFERENCES public.order(id),
  CONSTRAINT order_item_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.order_line_item(id)
);
CREATE TABLE public.order_line_item (
  id text NOT NULL,
  totals_id text,
  title text NOT NULL,
  subtitle text,
  thumbnail text,
  variant_id text,
  product_id text,
  product_title text,
  product_description text,
  product_subtitle text,
  product_type text,
  product_collection text,
  product_handle text,
  variant_sku text,
  variant_barcode text,
  variant_title text,
  variant_option_values jsonb,
  requires_shipping boolean NOT NULL DEFAULT true,
  is_discountable boolean NOT NULL DEFAULT true,
  is_tax_inclusive boolean NOT NULL DEFAULT false,
  compare_at_unit_price numeric,
  raw_compare_at_unit_price jsonb,
  unit_price numeric NOT NULL,
  raw_unit_price jsonb NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  is_custom_price boolean NOT NULL DEFAULT false,
  product_type_id text,
  is_giftcard boolean NOT NULL DEFAULT false,
  CONSTRAINT order_line_item_pkey PRIMARY KEY (id),
  CONSTRAINT order_line_item_totals_id_foreign FOREIGN KEY (totals_id) REFERENCES public.order_item(id)
);
CREATE TABLE public.order_line_item_adjustment (
  id text NOT NULL,
  description text,
  promotion_id text,
  code text,
  amount numeric NOT NULL,
  raw_amount jsonb NOT NULL,
  provider_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  item_id text NOT NULL,
  deleted_at timestamp with time zone,
  CONSTRAINT order_line_item_adjustment_pkey PRIMARY KEY (id),
  CONSTRAINT order_line_item_adjustment_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.order_line_item(id)
);
CREATE TABLE public.order_line_item_tax_line (
  id text NOT NULL,
  description text,
  tax_rate_id text,
  code text NOT NULL,
  rate numeric NOT NULL,
  raw_rate jsonb NOT NULL,
  provider_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  item_id text NOT NULL,
  deleted_at timestamp with time zone,
  CONSTRAINT order_line_item_tax_line_pkey PRIMARY KEY (id),
  CONSTRAINT order_line_item_tax_line_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.order_line_item(id)
);
CREATE TABLE public.order_order_company_company (
  order_id character varying NOT NULL,
  company_id character varying NOT NULL,
  id character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT order_order_company_company_pkey PRIMARY KEY (order_id, company_id)
);
CREATE TABLE public.order_payment_collection (
  order_id character varying NOT NULL,
  payment_collection_id character varying NOT NULL,
  id character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT order_payment_collection_pkey PRIMARY KEY (order_id, payment_collection_id)
);
CREATE TABLE public.order_promotion (
  order_id character varying NOT NULL,
  promotion_id character varying NOT NULL,
  id character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT order_promotion_pkey PRIMARY KEY (order_id, promotion_id)
);
CREATE TABLE public.order_shipping (
  id text NOT NULL,
  order_id text NOT NULL,
  version integer NOT NULL,
  shipping_method_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  return_id text,
  claim_id text,
  exchange_id text,
  CONSTRAINT order_shipping_pkey PRIMARY KEY (id),
  CONSTRAINT order_shipping_order_id_foreign FOREIGN KEY (order_id) REFERENCES public.order(id)
);
CREATE TABLE public.order_shipping_method (
  id text NOT NULL,
  name text NOT NULL,
  description jsonb,
  amount numeric NOT NULL,
  raw_amount jsonb NOT NULL,
  is_tax_inclusive boolean NOT NULL DEFAULT false,
  shipping_option_id text,
  data jsonb,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  is_custom_amount boolean NOT NULL DEFAULT false,
  CONSTRAINT order_shipping_method_pkey PRIMARY KEY (id)
);
CREATE TABLE public.order_shipping_method_adjustment (
  id text NOT NULL,
  description text,
  promotion_id text,
  code text,
  amount numeric NOT NULL,
  raw_amount jsonb NOT NULL,
  provider_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  shipping_method_id text NOT NULL,
  deleted_at timestamp with time zone,
  CONSTRAINT order_shipping_method_adjustment_pkey PRIMARY KEY (id),
  CONSTRAINT order_shipping_method_adjustment_shipping_method_id_foreign FOREIGN KEY (shipping_method_id) REFERENCES public.order_shipping_method(id)
);
CREATE TABLE public.order_shipping_method_tax_line (
  id text NOT NULL,
  description text,
  tax_rate_id text,
  code text NOT NULL,
  rate numeric NOT NULL,
  raw_rate jsonb NOT NULL,
  provider_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  shipping_method_id text NOT NULL,
  deleted_at timestamp with time zone,
  CONSTRAINT order_shipping_method_tax_line_pkey PRIMARY KEY (id),
  CONSTRAINT order_shipping_method_tax_line_shipping_method_id_foreign FOREIGN KEY (shipping_method_id) REFERENCES public.order_shipping_method(id)
);
CREATE TABLE public.order_summary (
  id text NOT NULL,
  order_id text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  totals jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT order_summary_pkey PRIMARY KEY (id),
  CONSTRAINT order_summary_order_id_foreign FOREIGN KEY (order_id) REFERENCES public.order(id)
);
CREATE TABLE public.order_transaction (
  id text NOT NULL,
  order_id text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  amount numeric NOT NULL,
  raw_amount jsonb NOT NULL,
  currency_code text NOT NULL,
  reference text,
  reference_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  return_id text,
  claim_id text,
  exchange_id text,
  CONSTRAINT order_transaction_pkey PRIMARY KEY (id),
  CONSTRAINT order_transaction_order_id_foreign FOREIGN KEY (order_id) REFERENCES public.order(id)
);
CREATE TABLE public.payment (
  id text NOT NULL,
  amount numeric NOT NULL,
  raw_amount jsonb NOT NULL,
  currency_code text NOT NULL,
  provider_id text NOT NULL,
  data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  captured_at timestamp with time zone,
  canceled_at timestamp with time zone,
  payment_collection_id text NOT NULL,
  payment_session_id text NOT NULL,
  metadata jsonb,
  CONSTRAINT payment_pkey PRIMARY KEY (id),
  CONSTRAINT payment_payment_collection_id_foreign FOREIGN KEY (payment_collection_id) REFERENCES public.payment_collection(id)
);
CREATE TABLE public.payment_collection (
  id text NOT NULL,
  currency_code text NOT NULL,
  amount numeric NOT NULL,
  raw_amount jsonb NOT NULL,
  authorized_amount numeric,
  raw_authorized_amount jsonb,
  captured_amount numeric,
  raw_captured_amount jsonb,
  refunded_amount numeric,
  raw_refunded_amount jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  completed_at timestamp with time zone,
  status text NOT NULL DEFAULT 'not_paid'::text CHECK (status = ANY (ARRAY['not_paid'::text, 'awaiting'::text, 'authorized'::text, 'partially_authorized'::text, 'canceled'::text, 'failed'::text, 'completed'::text])),
  metadata jsonb,
  CONSTRAINT payment_collection_pkey PRIMARY KEY (id)
);
CREATE TABLE public.payment_collection_payment_providers (
  payment_collection_id text NOT NULL,
  payment_provider_id text NOT NULL,
  CONSTRAINT payment_collection_payment_providers_pkey PRIMARY KEY (payment_collection_id, payment_provider_id),
  CONSTRAINT payment_collection_payment_providers_payment_col_aa276_foreign FOREIGN KEY (payment_collection_id) REFERENCES public.payment_collection(id),
  CONSTRAINT payment_collection_payment_providers_payment_pro_2d555_foreign FOREIGN KEY (payment_provider_id) REFERENCES public.payment_provider(id)
);
CREATE TABLE public.payment_provider (
  id text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT payment_provider_pkey PRIMARY KEY (id)
);
CREATE TABLE public.payment_session (
  id text NOT NULL,
  currency_code text NOT NULL,
  amount numeric NOT NULL,
  raw_amount jsonb NOT NULL,
  provider_id text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  context jsonb,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['authorized'::text, 'captured'::text, 'pending'::text, 'requires_more'::text, 'error'::text, 'canceled'::text])),
  authorized_at timestamp with time zone,
  payment_collection_id text NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT payment_session_pkey PRIMARY KEY (id),
  CONSTRAINT payment_session_payment_collection_id_foreign FOREIGN KEY (payment_collection_id) REFERENCES public.payment_collection(id)
);
CREATE TABLE public.price (
  id text NOT NULL,
  title text,
  price_set_id text NOT NULL,
  currency_code text NOT NULL,
  raw_amount jsonb NOT NULL,
  rules_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  price_list_id text,
  amount numeric NOT NULL,
  min_quantity integer,
  max_quantity integer,
  CONSTRAINT price_pkey PRIMARY KEY (id),
  CONSTRAINT price_price_set_id_foreign FOREIGN KEY (price_set_id) REFERENCES public.price_set(id),
  CONSTRAINT price_price_list_id_foreign FOREIGN KEY (price_list_id) REFERENCES public.price_list(id)
);
CREATE TABLE public.price_list (
  id text NOT NULL,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['active'::text, 'draft'::text])),
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  rules_count integer DEFAULT 0,
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL DEFAULT 'sale'::text CHECK (type = ANY (ARRAY['sale'::text, 'override'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT price_list_pkey PRIMARY KEY (id)
);
CREATE TABLE public.price_list_rule (
  id text NOT NULL,
  price_list_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  value jsonb,
  attribute text NOT NULL DEFAULT ''::text,
  CONSTRAINT price_list_rule_pkey PRIMARY KEY (id),
  CONSTRAINT price_list_rule_price_list_id_foreign FOREIGN KEY (price_list_id) REFERENCES public.price_list(id)
);
CREATE TABLE public.price_preference (
  id text NOT NULL,
  attribute text NOT NULL,
  value text,
  is_tax_inclusive boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT price_preference_pkey PRIMARY KEY (id)
);
CREATE TABLE public.price_rule (
  id text NOT NULL,
  value text NOT NULL,
  priority integer NOT NULL DEFAULT 0,
  price_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  attribute text NOT NULL DEFAULT ''::text,
  operator text NOT NULL DEFAULT 'eq'::text CHECK (operator = ANY (ARRAY['gte'::text, 'lte'::text, 'gt'::text, 'lt'::text, 'eq'::text])),
  CONSTRAINT price_rule_pkey PRIMARY KEY (id),
  CONSTRAINT price_rule_price_id_foreign FOREIGN KEY (price_id) REFERENCES public.price(id)
);
CREATE TABLE public.price_set (
  id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT price_set_pkey PRIMARY KEY (id)
);
CREATE TABLE public.product (
  id text NOT NULL,
  title text NOT NULL,
  handle text NOT NULL,
  subtitle text,
  description text,
  is_giftcard boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'proposed'::text, 'published'::text, 'rejected'::text])),
  thumbnail text,
  weight text,
  length text,
  height text,
  width text,
  origin_country text,
  hs_code text,
  mid_code text,
  material text,
  collection_id text,
  type_id text,
  discountable boolean NOT NULL DEFAULT true,
  external_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  metadata jsonb,
  CONSTRAINT product_pkey PRIMARY KEY (id),
  CONSTRAINT product_collection_id_foreign FOREIGN KEY (collection_id) REFERENCES public.product_collection(id),
  CONSTRAINT product_type_id_foreign FOREIGN KEY (type_id) REFERENCES public.product_type(id)
);
CREATE TABLE public.product_category (
  id text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT ''::text,
  handle text NOT NULL,
  mpath text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  is_internal boolean NOT NULL DEFAULT false,
  rank integer NOT NULL DEFAULT 0,
  parent_category_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  metadata jsonb,
  CONSTRAINT product_category_pkey PRIMARY KEY (id),
  CONSTRAINT product_category_parent_category_id_foreign FOREIGN KEY (parent_category_id) REFERENCES public.product_category(id)
);
CREATE TABLE public.product_category_product (
  product_id text NOT NULL,
  product_category_id text NOT NULL,
  CONSTRAINT product_category_product_pkey PRIMARY KEY (product_id, product_category_id),
  CONSTRAINT product_category_product_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(id),
  CONSTRAINT product_category_product_product_category_id_foreign FOREIGN KEY (product_category_id) REFERENCES public.product_category(id)
);
CREATE TABLE public.product_collection (
  id text NOT NULL,
  title text NOT NULL,
  handle text NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT product_collection_pkey PRIMARY KEY (id)
);
CREATE TABLE public.product_option (
  id text NOT NULL,
  title text NOT NULL,
  product_id text NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT product_option_pkey PRIMARY KEY (id),
  CONSTRAINT product_option_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(id)
);
CREATE TABLE public.product_option_value (
  id text NOT NULL,
  value text NOT NULL,
  option_id text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT product_option_value_pkey PRIMARY KEY (id),
  CONSTRAINT product_option_value_option_id_foreign FOREIGN KEY (option_id) REFERENCES public.product_option(id)
);
CREATE TABLE public.product_sales_channel (
  product_id character varying NOT NULL,
  sales_channel_id character varying NOT NULL,
  id character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT product_sales_channel_pkey PRIMARY KEY (product_id, sales_channel_id)
);
CREATE TABLE public.product_shipping_profile (
  product_id character varying NOT NULL,
  shipping_profile_id character varying NOT NULL,
  id character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT product_shipping_profile_pkey PRIMARY KEY (product_id, shipping_profile_id)
);
CREATE TABLE public.product_tag (
  id text NOT NULL,
  value text NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT product_tag_pkey PRIMARY KEY (id)
);
CREATE TABLE public.product_tags (
  product_id text NOT NULL,
  product_tag_id text NOT NULL,
  CONSTRAINT product_tags_pkey PRIMARY KEY (product_id, product_tag_id),
  CONSTRAINT product_tags_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(id),
  CONSTRAINT product_tags_product_tag_id_foreign FOREIGN KEY (product_tag_id) REFERENCES public.product_tag(id)
);
CREATE TABLE public.product_type (
  id text NOT NULL,
  value text NOT NULL,
  metadata json,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT product_type_pkey PRIMARY KEY (id)
);
CREATE TABLE public.product_variant (
  id text NOT NULL,
  title text NOT NULL,
  sku text,
  barcode text,
  ean text,
  upc text,
  allow_backorder boolean NOT NULL DEFAULT false,
  manage_inventory boolean NOT NULL DEFAULT true,
  hs_code text,
  origin_country text,
  mid_code text,
  material text,
  weight integer,
  length integer,
  height integer,
  width integer,
  metadata jsonb,
  variant_rank integer DEFAULT 0,
  product_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT product_variant_pkey PRIMARY KEY (id),
  CONSTRAINT product_variant_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(id)
);
CREATE TABLE public.product_variant_inventory_item (
  variant_id character varying NOT NULL,
  inventory_item_id character varying NOT NULL,
  id character varying NOT NULL,
  required_quantity integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT product_variant_inventory_item_pkey PRIMARY KEY (variant_id, inventory_item_id)
);
CREATE TABLE public.product_variant_option (
  variant_id text NOT NULL,
  option_value_id text NOT NULL,
  CONSTRAINT product_variant_option_pkey PRIMARY KEY (variant_id, option_value_id),
  CONSTRAINT product_variant_option_variant_id_foreign FOREIGN KEY (variant_id) REFERENCES public.product_variant(id),
  CONSTRAINT product_variant_option_option_value_id_foreign FOREIGN KEY (option_value_id) REFERENCES public.product_option_value(id)
);
CREATE TABLE public.product_variant_price_set (
  variant_id character varying NOT NULL,
  price_set_id character varying NOT NULL,
  id character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT product_variant_price_set_pkey PRIMARY KEY (variant_id, price_set_id)
);
CREATE TABLE public.promotion (
  id text NOT NULL,
  code text NOT NULL,
  campaign_id text,
  is_automatic boolean NOT NULL DEFAULT false,
  type text NOT NULL CHECK (type = ANY (ARRAY['standard'::text, 'buyget'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'active'::text, 'inactive'::text])),
  CONSTRAINT promotion_pkey PRIMARY KEY (id),
  CONSTRAINT promotion_campaign_id_foreign FOREIGN KEY (campaign_id) REFERENCES public.promotion_campaign(id)
);
CREATE TABLE public.promotion_application_method (
  id text NOT NULL,
  value numeric,
  raw_value jsonb,
  max_quantity integer,
  apply_to_quantity integer,
  buy_rules_min_quantity integer,
  type text NOT NULL CHECK (type = ANY (ARRAY['fixed'::text, 'percentage'::text])),
  target_type text NOT NULL CHECK (target_type = ANY (ARRAY['order'::text, 'shipping_methods'::text, 'items'::text])),
  allocation text CHECK (allocation = ANY (ARRAY['each'::text, 'across'::text])),
  promotion_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  currency_code text,
  CONSTRAINT promotion_application_method_pkey PRIMARY KEY (id),
  CONSTRAINT promotion_application_method_promotion_id_foreign FOREIGN KEY (promotion_id) REFERENCES public.promotion(id)
);
CREATE TABLE public.promotion_campaign (
  id text NOT NULL,
  name text NOT NULL,
  description text,
  campaign_identifier text NOT NULL,
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT promotion_campaign_pkey PRIMARY KEY (id)
);
CREATE TABLE public.promotion_campaign_budget (
  id text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['spend'::text, 'usage'::text])),
  campaign_id text NOT NULL,
  limit numeric,
  raw_limit jsonb,
  used numeric NOT NULL DEFAULT 0,
  raw_used jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  currency_code text,
  CONSTRAINT promotion_campaign_budget_pkey PRIMARY KEY (id),
  CONSTRAINT promotion_campaign_budget_campaign_id_foreign FOREIGN KEY (campaign_id) REFERENCES public.promotion_campaign(id)
);
CREATE TABLE public.promotion_promotion_rule (
  promotion_id text NOT NULL,
  promotion_rule_id text NOT NULL,
  CONSTRAINT promotion_promotion_rule_pkey PRIMARY KEY (promotion_id, promotion_rule_id),
  CONSTRAINT promotion_promotion_rule_promotion_id_foreign FOREIGN KEY (promotion_id) REFERENCES public.promotion(id),
  CONSTRAINT promotion_promotion_rule_promotion_rule_id_foreign FOREIGN KEY (promotion_rule_id) REFERENCES public.promotion_rule(id)
);
CREATE TABLE public.promotion_rule (
  id text NOT NULL,
  description text,
  attribute text NOT NULL,
  operator text NOT NULL CHECK (operator = ANY (ARRAY['gte'::text, 'lte'::text, 'gt'::text, 'lt'::text, 'eq'::text, 'ne'::text, 'in'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT promotion_rule_pkey PRIMARY KEY (id)
);
CREATE TABLE public.promotion_rule_value (
  id text NOT NULL,
  promotion_rule_id text NOT NULL,
  value text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT promotion_rule_value_pkey PRIMARY KEY (id),
  CONSTRAINT promotion_rule_value_promotion_rule_id_foreign FOREIGN KEY (promotion_rule_id) REFERENCES public.promotion_rule(id)
);
CREATE TABLE public.provider_identity (
  id text NOT NULL,
  entity_id text NOT NULL,
  provider text NOT NULL,
  auth_identity_id text NOT NULL,
  user_metadata jsonb,
  provider_metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT provider_identity_pkey PRIMARY KEY (id),
  CONSTRAINT provider_identity_auth_identity_id_foreign FOREIGN KEY (auth_identity_id) REFERENCES public.auth_identity(id)
);
CREATE TABLE public.publishable_api_key_sales_channel (
  publishable_key_id character varying NOT NULL,
  sales_channel_id character varying NOT NULL,
  id character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT publishable_api_key_sales_channel_pkey PRIMARY KEY (publishable_key_id, sales_channel_id)
);
CREATE TABLE public.quote (
  id text NOT NULL,
  status text NOT NULL DEFAULT 'pending_merchant'::text CHECK (status = ANY (ARRAY['pending_merchant'::text, 'pending_customer'::text, 'accepted'::text, 'customer_rejected'::text, 'merchant_rejected'::text])),
  customer_id text NOT NULL,
  draft_order_id text NOT NULL,
  order_change_id text NOT NULL,
  cart_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT quote_pkey PRIMARY KEY (id)
);
CREATE TABLE public.refund (
  id text NOT NULL,
  amount numeric NOT NULL,
  raw_amount jsonb NOT NULL,
  payment_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  created_by text,
  metadata jsonb,
  refund_reason_id text,
  note text,
  CONSTRAINT refund_pkey PRIMARY KEY (id),
  CONSTRAINT refund_payment_id_foreign FOREIGN KEY (payment_id) REFERENCES public.payment(id)
);
CREATE TABLE public.refund_reason (
  id text NOT NULL,
  label text NOT NULL,
  description text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT refund_reason_pkey PRIMARY KEY (id)
);
CREATE TABLE public.region (
  id text NOT NULL,
  name text NOT NULL,
  currency_code text NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  automatic_taxes boolean NOT NULL DEFAULT true,
  CONSTRAINT region_pkey PRIMARY KEY (id)
);
CREATE TABLE public.region_country (
  iso_2 text NOT NULL,
  iso_3 text NOT NULL,
  num_code text NOT NULL,
  name text NOT NULL,
  display_name text NOT NULL,
  region_id text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT region_country_pkey PRIMARY KEY (iso_2),
  CONSTRAINT region_country_region_id_foreign FOREIGN KEY (region_id) REFERENCES public.region(id)
);
CREATE TABLE public.region_payment_provider (
  region_id character varying NOT NULL,
  payment_provider_id character varying NOT NULL,
  id character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT region_payment_provider_pkey PRIMARY KEY (region_id, payment_provider_id)
);
CREATE TABLE public.reservation_item (
  id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  line_item_id text,
  location_id text NOT NULL,
  quantity numeric NOT NULL,
  external_id text,
  description text,
  created_by text,
  metadata jsonb,
  inventory_item_id text NOT NULL,
  allow_backorder boolean DEFAULT false,
  raw_quantity jsonb,
  CONSTRAINT reservation_item_pkey PRIMARY KEY (id),
  CONSTRAINT reservation_item_inventory_item_id_foreign FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_item(id)
);
CREATE TABLE public.return (
  id text NOT NULL,
  order_id text NOT NULL,
  claim_id text,
  exchange_id text,
  order_version integer NOT NULL,
  display_id integer NOT NULL DEFAULT nextval('return_display_id_seq'::regclass),
  status USER-DEFINED NOT NULL DEFAULT 'open'::return_status_enum,
  no_notification boolean,
  refund_amount numeric,
  raw_refund_amount jsonb,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  received_at timestamp with time zone,
  canceled_at timestamp with time zone,
  location_id text,
  requested_at timestamp with time zone,
  created_by text,
  CONSTRAINT return_pkey PRIMARY KEY (id)
);
CREATE TABLE public.return_fulfillment (
  return_id character varying NOT NULL,
  fulfillment_id character varying NOT NULL,
  id character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT return_fulfillment_pkey PRIMARY KEY (return_id, fulfillment_id)
);
CREATE TABLE public.return_item (
  id text NOT NULL,
  return_id text NOT NULL,
  reason_id text,
  item_id text NOT NULL,
  quantity numeric NOT NULL,
  raw_quantity jsonb NOT NULL,
  received_quantity numeric NOT NULL DEFAULT 0,
  raw_received_quantity jsonb NOT NULL,
  note text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  damaged_quantity numeric NOT NULL DEFAULT 0,
  raw_damaged_quantity jsonb NOT NULL,
  CONSTRAINT return_item_pkey PRIMARY KEY (id)
);
CREATE TABLE public.return_reason (
  id character varying NOT NULL,
  value character varying NOT NULL,
  label character varying NOT NULL,
  description character varying,
  metadata jsonb,
  parent_return_reason_id character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT return_reason_pkey PRIMARY KEY (id),
  CONSTRAINT return_reason_parent_return_reason_id_foreign FOREIGN KEY (parent_return_reason_id) REFERENCES public.return_reason(id)
);
CREATE TABLE public.sales_channel (
  id text NOT NULL,
  name text NOT NULL,
  description text,
  is_disabled boolean NOT NULL DEFAULT false,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT sales_channel_pkey PRIMARY KEY (id)
);
CREATE TABLE public.sales_channel_stock_location (
  sales_channel_id character varying NOT NULL,
  stock_location_id character varying NOT NULL,
  id character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT sales_channel_stock_location_pkey PRIMARY KEY (sales_channel_id, stock_location_id)
);
CREATE TABLE public.script_migrations (
  id integer NOT NULL DEFAULT nextval('script_migrations_id_seq'::regclass),
  script_name character varying NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  finished_at timestamp with time zone,
  CONSTRAINT script_migrations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.service_zone (
  id text NOT NULL,
  name text NOT NULL,
  metadata jsonb,
  fulfillment_set_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT service_zone_pkey PRIMARY KEY (id),
  CONSTRAINT service_zone_fulfillment_set_id_foreign FOREIGN KEY (fulfillment_set_id) REFERENCES public.fulfillment_set(id)
);
CREATE TABLE public.shipping_option (
  id text NOT NULL,
  name text NOT NULL,
  price_type text NOT NULL DEFAULT 'flat'::text CHECK (price_type = ANY (ARRAY['calculated'::text, 'flat'::text])),
  service_zone_id text NOT NULL,
  shipping_profile_id text,
  provider_id text,
  data jsonb,
  metadata jsonb,
  shipping_option_type_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT shipping_option_pkey PRIMARY KEY (id),
  CONSTRAINT shipping_option_shipping_option_type_id_foreign FOREIGN KEY (shipping_option_type_id) REFERENCES public.shipping_option_type(id),
  CONSTRAINT shipping_option_service_zone_id_foreign FOREIGN KEY (service_zone_id) REFERENCES public.service_zone(id),
  CONSTRAINT shipping_option_shipping_profile_id_foreign FOREIGN KEY (shipping_profile_id) REFERENCES public.shipping_profile(id),
  CONSTRAINT shipping_option_provider_id_foreign FOREIGN KEY (provider_id) REFERENCES public.fulfillment_provider(id)
);
CREATE TABLE public.shipping_option_price_set (
  shipping_option_id character varying NOT NULL,
  price_set_id character varying NOT NULL,
  id character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT shipping_option_price_set_pkey PRIMARY KEY (shipping_option_id, price_set_id)
);
CREATE TABLE public.shipping_option_rule (
  id text NOT NULL,
  attribute text NOT NULL,
  operator text NOT NULL CHECK (operator = ANY (ARRAY['in'::text, 'eq'::text, 'ne'::text, 'gt'::text, 'gte'::text, 'lt'::text, 'lte'::text, 'nin'::text])),
  value jsonb,
  shipping_option_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT shipping_option_rule_pkey PRIMARY KEY (id),
  CONSTRAINT shipping_option_rule_shipping_option_id_foreign FOREIGN KEY (shipping_option_id) REFERENCES public.shipping_option(id)
);
CREATE TABLE public.shipping_option_type (
  id text NOT NULL,
  label text NOT NULL,
  description text,
  code text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT shipping_option_type_pkey PRIMARY KEY (id)
);
CREATE TABLE public.shipping_profile (
  id text NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT shipping_profile_pkey PRIMARY KEY (id)
);
CREATE TABLE public.stock_location (
  id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  name text NOT NULL,
  address_id text,
  metadata jsonb,
  CONSTRAINT stock_location_pkey PRIMARY KEY (id),
  CONSTRAINT stock_location_address_id_foreign FOREIGN KEY (address_id) REFERENCES public.stock_location_address(id)
);
CREATE TABLE public.stock_location_address (
  id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  address_1 text NOT NULL,
  address_2 text,
  company text,
  city text,
  country_code text NOT NULL,
  phone text,
  province text,
  postal_code text,
  metadata jsonb,
  CONSTRAINT stock_location_address_pkey PRIMARY KEY (id)
);
CREATE TABLE public.store (
  id text NOT NULL,
  name text NOT NULL DEFAULT 'Medusa Store'::text,
  default_sales_channel_id text,
  default_region_id text,
  default_location_id text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT store_pkey PRIMARY KEY (id)
);
CREATE TABLE public.store_currency (
  id text NOT NULL,
  currency_code text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  store_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT store_currency_pkey PRIMARY KEY (id),
  CONSTRAINT store_currency_store_id_foreign FOREIGN KEY (store_id) REFERENCES public.store(id)
);
CREATE TABLE public.tax_provider (
  id text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT tax_provider_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tax_rate (
  id text NOT NULL,
  rate real,
  code text NOT NULL,
  name text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  is_combinable boolean NOT NULL DEFAULT false,
  tax_region_id text NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by text,
  deleted_at timestamp with time zone,
  CONSTRAINT tax_rate_pkey PRIMARY KEY (id),
  CONSTRAINT FK_tax_rate_tax_region_id FOREIGN KEY (tax_region_id) REFERENCES public.tax_region(id)
);
CREATE TABLE public.tax_rate_rule (
  id text NOT NULL,
  tax_rate_id text NOT NULL,
  reference_id text NOT NULL,
  reference text NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by text,
  deleted_at timestamp with time zone,
  CONSTRAINT tax_rate_rule_pkey PRIMARY KEY (id),
  CONSTRAINT FK_tax_rate_rule_tax_rate_id FOREIGN KEY (tax_rate_id) REFERENCES public.tax_rate(id)
);
CREATE TABLE public.tax_region (
  id text NOT NULL,
  provider_id text,
  country_code text NOT NULL,
  province_code text,
  parent_id text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by text,
  deleted_at timestamp with time zone,
  CONSTRAINT tax_region_pkey PRIMARY KEY (id),
  CONSTRAINT FK_tax_region_provider_id FOREIGN KEY (provider_id) REFERENCES public.tax_provider(id),
  CONSTRAINT FK_tax_region_parent_id FOREIGN KEY (parent_id) REFERENCES public.tax_region(id)
);
CREATE TABLE public.user (
  id text NOT NULL,
  first_name text,
  last_name text,
  email text NOT NULL,
  avatar_url text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT user_pkey PRIMARY KEY (id)
);
CREATE TABLE public.workflow_execution (
  id character varying NOT NULL,
  workflow_id character varying NOT NULL,
  transaction_id character varying NOT NULL,
  execution jsonb,
  context jsonb,
  state character varying NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  deleted_at timestamp without time zone,
  retention_time integer,
  run_id text NOT NULL DEFAULT '01K04WFQPSZ1MMDVETC8YCHBDD'::text,
  CONSTRAINT workflow_execution_pkey PRIMARY KEY (workflow_id, transaction_id, run_id)
);