import ComponentTypes from "@theme-original/NavbarItem/ComponentTypes";
import UserMenu from "../../components/UserMenu";

// Extend Docusaurus navbar item types with our custom UserMenu
export default {
  ...ComponentTypes,
  "custom-userMenu": UserMenu,
};
