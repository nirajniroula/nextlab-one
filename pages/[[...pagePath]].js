import Head from "next/head";
import { SliceZone } from "@prismicio/react";
import * as prismicH from "@prismicio/helpers";
import * as prismic from "@prismicio/client";
import { createClient, linkResolver } from "../prismicio";
import { components } from "../slices";

import { Layout } from "../components/Layout";

const Page = ({ page, globalSettings, navigation }) => {
  if (!page) return null;

  return (
    <Layout globalSettings={globalSettings} navigation={navigation}>
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

  let uid = "home";
  if (params.path && params.path.length > 0) {
    if (params.path[0] === "account") {
      if (params.path.length === 1) {
        uid = "account";
      } else {
        uid = `account-${params.path[params.path.length - 1]}`;
      }
    } else {
      uid = params.path[params.path.length - 1];
    }
  }

  try {
    // Run all Prismic fetches in parallel for maximum speed
    const [pageResult, globalSettingsResult, navigationResult] = await Promise.allSettled([
      client.getByUID("page", uid),
      client.getSingle("global_settings"),
      client.getAllByType("navigation"),
    ]);

    if (pageResult.status === "rejected") {
      return { notFound: true };
    }

    const page = pageResult.value;
    const globalSettings = globalSettingsResult.status === "fulfilled" ? globalSettingsResult.value : null;
    const navigation = navigationResult.status === "fulfilled" ? navigationResult.value : [];

    if (!globalSettings) console.warn("Global Settings not found, please create it in Prismic.");
    if (!navigation.length) console.warn("Navigation items not found, please create them in Prismic.");

    return {
      props: {
        page,
        globalSettings,
        navigation,
      },
      revalidate: 1,
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
}

export async function getStaticPaths() {
  const client = createClient();

  const pages = await client.getAllByType("page");

  return {
    paths: pages.map((page) => {
      // Basic dynamic routing fallback logic
      // In a real app, linkResolver handles generating paths for /account vs /
      if (page.uid === "home") return "/";
      if (page.uid === "account") return "/account";
      if (page.uid.startsWith("account-")) return `/account/${page.uid.replace("account-", "")}`;
      return `/${page.uid}`;
    }),
    fallback: "blocking",
  };
}
