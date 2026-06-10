import { SegmentProvider } from "./SegmentContext";
import { Header } from "./Header";

export const Layout = ({ children, globalSettings, navigation }) => {
  return (
    <SegmentProvider globalSettings={globalSettings}>
      <Header globalSettings={globalSettings} navigation={navigation} />
      <main>{children}</main>
    </SegmentProvider>
  );
};
