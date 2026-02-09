import React from "react";
import Layout from "@theme-original/Layout";
import type LayoutType from "@theme/Layout";
import type { WrapperProps } from "@docusaurus/types";
import AuthGuard from "../../components/AuthGuard";

type Props = WrapperProps<typeof LayoutType>;

// Swizzled Layout component that wraps content with AuthGuard
export default function LayoutWrapper(props: Props): React.ReactElement {
  return (
    <AuthGuard>
      <Layout {...props} />
    </AuthGuard>
  );
}
