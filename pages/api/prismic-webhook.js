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
    "https://api.vercel.com/v1/integrations/deploy/prj_LVh6gyfTqVH51mMu5q4HQ1Yj9rSA/fTKzCNlDlw";

  // Make an HTTP POST request to the deploy hook URL
  console.log(">>>>Deploy site 2...");
  callDeployHookUrl(deployHookUrl);
};

// Prismic API configuration
const prismicApiEndpoint = process.env.PRISMIC_API;
const prismicAccessToken = process.env.PRISMIC_ACCESS_TOKEN;

// Function to fetch document IDs based on tags
const fetchDocumentIdsByTags = async (tags) => {
  try {
    const client = prismic.createClient(prismicApiEndpoint, {
      prismicAccessToken,
    });

    const response = await client.get([], {
      pageSize: 100,
      fetch: [],
      predicates: ["document.tags", tags],
    });
    console.log(">>>>", response);
    const documentIds = response.results.map((document) => document.id);

    return documentIds;
  } catch (error) {
    console.error("Failed to fetch document IDs:", error);
    return [];
  }
};

export default function handler(req, res) {
  if (req.method === "POST") {
    // Parse the Prismic webhook payload
    console.log(">>>>req.body", req.body);
    console.log(">>>>req.body type", typeof req.body);

    jsonParser(req, res, async () => {
      //   var resObj = eval("(" + req.body + ")");

      const { documents, secret } = req.body;
      const tags = ["cc-next"];
      // Check if the secret is present in the webhook payload
      if (secret === "secret123") {
        // Fetch the document IDs based on tags
        const desiredDocumentIds = await fetchDocumentIdsByTags(tags).catch(
          (error) => {
            console.error("Failed to fetch document IDs:", error);
          }
        );

        // Trigger the build process

        if (Array.isArray(desiredDocumentIds) && Array.isArray(documents)) {
          for (const documentId of desiredDocumentIds) {
            if (documents.includes(documentId)) {
              // Trigger the build process
              console.log(">>>>triggering...");
              await triggerBuildSiteOne();
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
