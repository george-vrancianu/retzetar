import {
  ActionLink,
  Heading,
  Page,
  PageHeader,
  Section,
  Text,
} from "@retzetar/ui";
import { Link } from "react-router-dom";
import { PantryContent } from "./components/PantryContent.tsx";

export function PantryPage() {
  return (
    <Page>
      <PageHeader sx={{ alignItems: "center" }}>
        <Heading>Your pantry</Heading>
        <ActionLink as={Link} to="/pantry/add" variant="primary">
          + Add ingredients
        </ActionLink>
      </PageHeader>
      <Text sx={{ mt: 1 }} variant="muted">
        Track ingredients and their expiry dates so carts only include what is
        missing.
      </Text>
      <Section spacing="lg">
        <PantryContent />
      </Section>
    </Page>
  );
}
