import axios from "axios";
import bodyParser from "body-parser";

// Configure bodyParser to parse webhook payload
const jsonParser = bodyParser.json();

// Define your desired tag name
const desiredBuild = "not-x";

// // Define your build logic here
// const triggerBuild = () => {
//   // Replace the build command with your specific build command
//   const buildCommand = "npm run build";

//   // Run the build command
//   exec(buildCommand, (error, stdout, stderr) => {
//     if (error) {
//       console.error(`Build command failed: ${error}`);
//       return;
//     }
//     console.log(`Build output: ${stdout}`);
//   });
// };

// Define your build logic here
const triggerBuild = async () => {
  // Replace the deploy hook URL with your actual deploy hook URL
  const deployHookUrl =
    "https://api.vercel.com/v1/integrations/deploy/prj_qdZTrbbo3MIhhxbyTIdcDXITsFKR/5NZNj5uLUM?buildCache=false";

  // Make an HTTP POST request to the deploy hook URL
  console.log(">>>>axios call...");

  await axios
    .post(deployHookUrl)
    .then((response) => {
      console.log("Deploy hook called successfully");
      console.log("Response:", response.data);
    })
    .catch((error) => {
      console.error("Failed to call deploy hook:", error);
    });
};

export default function handler(req, res) {
  if (req.method === "POST") {
    // Parse the Prismic webhook payload
    console.log(">>>>req.body", req.body);
    console.log(">>>>req.body type", typeof req.body);

    jsonParser(req, res, async () => {
      //   var resObj = eval("(" + req.body + ")");
      console.log(">>>>secret", req.body.secret);

      const { secret } = req.body;

      // Check if the desired tag name is present in the webhook payload
      if (secret === desiredBuild) {
        // Trigger the build process
        console.log(">>>>triggering...");

        await triggerBuild();
      }

      res.status(200).end();
    });
  } else {
    res.status(405).end();
  }
}
