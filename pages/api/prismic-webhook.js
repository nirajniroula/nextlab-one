import * as prismic from "@prismicio/client";
import axios from "axios";
import bodyParser from "body-parser";

// Configure bodyParser to parse webhook payload
const jsonParser = bodyParser.json();

const callDeployHookUrl = async (url) => {
  console.log(">>>>Deploy starting...");

  await axios
    .post(url)
    .then((response) => {
      console.log("Deploy hook called successfully");
      console.log("Response:", response.data);
    })
    .catch((error) => {
      console.error("Failed to call deploy hook:", error);
    });
};
// Define your build logic here
const triggerBuildSiteOne = async () => {
  // Replace the deploy hook URL with your actual deploy hook URL
  const deployHookUrl =
    "https://api.vercel.com/v1/integrations/deploy/prj_qdZTrbbo3MIhhxbyTIdcDXITsFKR/5NZNj5uLUM?buildCache=false";
  console.log(">>>>Deploy site 1...");

  callDeployHookUrl(deployHookUrl);
};

// Define your build logic here
const triggerBuildSiteTwo = async () => {
  // Replace the deploy hook URL with your actual deploy hook URL
  const deployHookUrl =
    "https://api.vercel.com/v1/integrations/deploy/prj_LVh6gyfTqVH51mMu5q4HQ1Yj9rSA/fTKzCNlDlw?buildCache=false";

  // Make an HTTP POST request to the deploy hook URL
  console.log(">>>>Deploy site 2...");
  callDeployHookUrl(deployHookUrl);
};

// Prismic API configuration
const prismicApiEndpoint = process.env.PRISMIC_API;
const prismicAccessToken = process.env.PRISMIC_ACCESS_TOKEN;

// Function to fetch document IDs based on tags
// const fetchDocumentIdsByTags = async (tags) => {
//   try {
//     const client = prismic.createClient(prismicApiEndpoint, {
//       prismicAccessToken,
//     });

//     const response = await client.get([], {
//       pageSize: 100,
//       fetch: [],
//       predicates: ["document.tags", tags],
//     });
//     console.log(">>>>", response);
//     const documentIds = response.results.map((document) => document.id);

//     return documentIds;
//   } catch (error) {
//     console.error("Failed to fetch document IDs:", error);
//     return [];
//   }
// };

async function docHasTag(documentId, tagToCheck) {
  try {
    const client = prismic.createClient(prismicApiEndpoint, {
      prismicAccessToken,
    });
    const document = await client.getByID(documentId);
    if (document && document.tags.includes(tagToCheck)) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Doc has Tag: Error:", error);
  }
}

export default function handler(req, res) {
  if (req.method === "POST") {
    // Parse the Prismic webhook payload
    jsonParser(req, res, async () => {
      const { documents, secret } = req.body;
      const tag = "cc-next";
      const xTag = "cc-next-x";
      console.log("Documents:", documents);
      // Check if the secret is present in the webhook payload
      if (secret === "secret123") {
        // Trigger the build process
        if (Array.isArray(documents)) {
          let siteOneBuildTriggered = false;
          let siteTwoBuildTriggered = false;

          for (const documentId of documents) {
            if (!siteOneBuildTriggered && docHasTag(documentId, tag)) {
              // Trigger the build process
              await triggerBuildSiteOne();
              siteOneBuildTriggered = true;
            }
            if (!siteTwoBuildTriggered && docHasTag(documentId, xTag)) {
              // Trigger the build process
              await triggerBuildSiteTwo();
              siteTwoBuildTriggered = true;
            }
            if (siteTwoBuildTriggered && siteOneBuildTriggered) {
              break; // If one desired document is found, no need to continue checking the rest
            }
          }
        }
        res.status(200).end();
      } else {
        res.status(401).end();
      }
    });
  } else {
    res.status(405).end();
  }
}
