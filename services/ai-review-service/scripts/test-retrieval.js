import { retrieveRelevantChunks } from "../retrieval.js";

const testCode = `
function test() {
  let x = 5
}
`;

async function run() {
  const results = await retrieveRelevantChunks(testCode, {
    topK: 3,
  });

  console.log("\n RESULTS:");
  console.log(JSON.stringify(results, null, 2));
}

run();
