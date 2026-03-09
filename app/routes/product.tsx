import { Card, Page } from "@shopify/polaris";
import ProductTable from "app/components/ProductTable";

export default function Products() {
  const rows = [
    ["iPhone", "$1000", "Edit"],
    ["Macbook", "$2000", "Edit"]
  ];
  return (
    <Page title="Products">
        <Card>
            <ProductTable rows={rows} />
        </Card>
    </Page>
  );
}