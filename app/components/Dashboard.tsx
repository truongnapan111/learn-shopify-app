import { Page, Card, Button } from "@shopify/polaris";

export default function Dashboard() {
  return (
    <Page title="Products">
      <Card>
        <Button variant="primary">Create product</Button>
      </Card>
    </Page>
  );
}