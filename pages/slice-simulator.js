import fs from "fs";
import path from "path";
import { SliceSimulator } from "@prismicio/slice-simulator-react";
import { SliceZone } from "@prismicio/react";
import { components } from "../slices";

const SliceSimulatorPage = ({ state }) => (
  <SliceSimulator
    sliceZone={(props) => <SliceZone {...props} components={components} />}
    state={state}
  />
);

export default SliceSimulatorPage;

export const getStaticProps = async () => {
  if (process.env.NODE_ENV === "production") {
    return { notFound: true };
  }

  const statePath = path.join(process.cwd(), ".slicemachine", "libraries-state.json");
  let state = { manifests: [] };

  if (fs.existsSync(statePath)) {
    state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  }

  return { props: { state } };
};
