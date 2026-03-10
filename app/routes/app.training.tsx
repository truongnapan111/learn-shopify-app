import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

type ProductNode = {
  id: string;
  title: string;
  handle: string;
  status: string;
  totalInventory: number;
  vendor: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
      query TrainingDashboard {
        shop {
          name
          myshopifyDomain
        }
        products(first: 5, sortKey: UPDATED_AT, reverse: true) {
          nodes {
            id
            title
            handle
            status
            totalInventory
            vendor
          }
        }
      }
    `,
  );

  const responseJson = await response.json();
  const shop = responseJson.data?.shop;
  const products = (responseJson.data?.products?.nodes ?? []) as ProductNode[];

  return {
    shop,
    products,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const metafieldNamespace = "$app";
  const metafieldKey = "training_note_v2";

  if (intent === "create-product") {
    const rawTitle = formData.get("title");

    if (typeof rawTitle !== "string") {
      return {
        step: "create-product",
        errors: [{ message: "Title must be a string" }],
      };
    }

    const title = rawTitle.trim();

    if (!title) {
      return {
        step: "create-product",
        errors: [{ message: "Title is required" }],
      };
    }

    const createResponse = await admin.graphql(
      `#graphql
        mutation CreateTrainingProduct($product: ProductCreateInput!) {
          productCreate(product: $product) {
            product {
              id
              title
              handle
              status
              totalInventory
              vendor
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      {
        variables: {
          product: {
            title: title,
            tags: ["training", "shopify-app"],
          },
        },
      },
    );

    const createJson = await createResponse.json();
    const createdProduct = createJson.data?.productCreate?.product;
    const createErrors = createJson.data?.productCreate?.userErrors ?? [];

    return {
      step: "create-product",
      createdProduct,
      errors: createErrors,
    };
  }

  if (intent === "set-metafield") {
    const productId = formData.get("productId");

    if (!productId || typeof productId !== "string") {
      return {
        step: "set-metafield",
        errors: [{ message: "Missing productId" }],
      };
    }

    const metafieldResponse = await admin.graphql(
      `#graphql
        mutation SetTrainingMetafield($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            metafields {
              id
              key
              namespace
              value
              jsonValue
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      {
        variables: {
          metafields: [
            {
              ownerId: productId,
              namespace: metafieldNamespace,
              key: metafieldKey,
              type: "json",
              value: JSON.stringify({
                source: "/app/training",
                level: "day-4",
                updatedAt: new Date().toISOString(),
              }),
            },
          ],
        },
      },
    );

    const metafieldJson = await metafieldResponse.json();
    const metafields = metafieldJson.data?.metafieldsSet?.metafields ?? [];
    const metafieldErrors = metafieldJson.data?.metafieldsSet?.userErrors ?? [];

    return {
      step: "set-metafield",
      metafields,
      namespace: metafieldNamespace,
      key: metafieldKey,
      errors: metafieldErrors,
    };
  }

  if (intent === "read-metafield") {
    const productId = formData.get("productId");

    if (!productId || typeof productId !== "string") {
      return {
        step: "read-metafield",
        errors: [{ message: "Missing productId" }],
      };
    }

    const readMetafieldResponse = await admin.graphql(
      `#graphql
        query ReadTrainingMetafield($id: ID!, $namespace: String!, $key: String!) {
          product(id: $id) {
            id
            title
            metafield(namespace: $namespace, key: $key) {
              id
              namespace
              key
              type
              value
              jsonValue
              updatedAt
            }
          }
        }
      `,
      {
        variables: {
          id: productId,
          namespace: metafieldNamespace,
          key: metafieldKey,
        },
      },
    );

    const readMetafieldJson = await readMetafieldResponse.json();

    return {
      step: "read-metafield",
      product: readMetafieldJson.data?.product ?? null,
      namespace: metafieldNamespace,
      key: metafieldKey,
      errors: [],
    };
  }

  return {
    step: "unknown",
    errors: [{ message: "Unsupported action" }],
  };
};

export default function TrainingPage() {
  const { shop, products } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();

  const isSubmitting =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  useEffect(() => {
    if (fetcher.data?.step === "create-product" && fetcher.data?.createdProduct?.id) {
      shopify.toast.show("Created a training product");
    }

    if (fetcher.data?.step === "set-metafield" && (fetcher.data?.errors?.length ?? 0) === 0) {
      shopify.toast.show("Metafield saved");
    }

    if (fetcher.data?.step === "read-metafield" && (fetcher.data?.errors?.length ?? 0) === 0) {
      shopify.toast.show("Metafield fetched");
    }
  }, [fetcher.data, shopify]);

  return (
    <s-page heading="Shopify App Training Lab">
      <s-section heading="Mini project goal">
        <s-paragraph>
          Build confidence with Shopify Admin GraphQL by doing 3 practical steps inside this app.
        </s-paragraph>
        <s-unordered-list>
          <s-list-item>Step 1: Read shop + products in loader.</s-list-item>
          <s-list-item>Step 2: Create a product via action mutation.</s-list-item>
          <s-list-item>Step 3: Write a product metafield using metafieldsSet.</s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section heading="Current shop context">
        <s-paragraph>
          <strong>Shop:</strong> {shop?.name} ({shop?.myshopifyDomain})
        </s-paragraph>
        <s-paragraph>
          <strong>Latest products:</strong> {products.length}
        </s-paragraph>
      </s-section>

      <s-section heading="Step 1 - Query result">
        <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
          <pre style={{ margin: 0 }}>
            <code>{JSON.stringify(products, null, 2)}</code>
          </pre>
        </s-box>
      </s-section>

      <s-section heading="Step 2 - Create training product">
        <fetcher.Form method="post">
          <input type="hidden" name="intent" value="create-product" />
          <input name="title" placeholder="Product title" required={true}/>
          <s-button type="submit" {...(isSubmitting ? { loading: true } : {})}>
            Create product
          </s-button>
        </fetcher.Form>

        {fetcher.data?.step === "create-product" && (
          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <pre style={{ margin: 0 }}>
              <code>{JSON.stringify(fetcher.data, null, 2)}</code>
            </pre>
          </s-box>
        )}
      </s-section>

      <s-section heading="Day 4 - Write and read metafield">
        <fetcher.Form method="post">
          <input type="hidden" name="intent" value="set-metafield" />
          <input type="hidden" name="productId" value={products[0]?.id ?? ""} />
          <s-button type="submit" variant="secondary" {...(isSubmitting ? { loading: true } : {})}>
            Set JSON metafield for latest product
          </s-button>
        </fetcher.Form>

        <fetcher.Form method="post">
          <input type="hidden" name="intent" value="read-metafield" />
          <input type="hidden" name="productId" value={products[0]?.id ?? ""} />
          <s-button type="submit" variant="tertiary" {...(isSubmitting ? { loading: true } : {})}>
            Read latest product metafield
          </s-button>
        </fetcher.Form>

        {fetcher.data?.step === "set-metafield" && (
          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <pre style={{ margin: 0 }}>
              <code>{JSON.stringify(fetcher.data, null, 2)}</code>
            </pre>
          </s-box>
        )}

        {fetcher.data?.step === "read-metafield" && (
          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <pre style={{ margin: 0 }}>
              <code>{JSON.stringify(fetcher.data, null, 2)}</code>
            </pre>
          </s-box>
        )}
      </s-section>
    </s-page>
  );
}