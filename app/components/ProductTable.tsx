import { DataTable } from "@shopify/polaris";

export default function ProductTable({ rows }: { rows: string[][] }) {
  return (
        <DataTable
          columnContentTypes={["text", "text", "text"]}
          headings={["Product", "Price","Action"]}
          rows={rows}
        />
  );
}