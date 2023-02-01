import Head from "next/head";
import { SliceZone } from "@prismicio/react";
import * as prismicH from "@prismicio/helpers";
import * as prismic from "@prismicio/client";
import { createClient, linkResolver } from "../prismicio";
import { components } from "../slices";

import { Layout } from "../components/Layout";

const Page = ({ page }) => {
  return (
    <Layout>
      <Head>
        <title>{prismicH.asText(page.data.title)}</title>
      </Head>
      <SliceZone slices={page.data.slices} components={components} />
    </Layout>
  );
};

export default Page;

export async function getStaticProps({ params, previewData }) {
  const client = createClient({ previewData });

  const uid = params.path?.[params.path.length - 1] || "home";
  const page = await client.getByUID("page", uid);

  return {
    props: {
      page,
    },
    revalidate: 1,
  };
}

export async function getStaticPaths() {
  const client = createClient();

  // const pages = await client.getAllByType("page");
  const pages = await client.get({
    predicates: [
      prismic.Predicates.at("document.type", "page"),
      prismic.Predicates.at("document.tags", ["cc-next"]),
    ],
  });
  console.log(">>>....", pages);

  return {
    paths: pages?.results.map((page) => prismicH.asLink(page, linkResolver)),
    fallback: false,
  };
}
