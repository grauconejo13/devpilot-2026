
import { reviewCode } from "../review.js";  
import { reflectOnReview } from "../reflection.js";
import { retrieveRelevantChunks } from "../retrieval.js";

const testCode = `
function test() {
  let x = 5
}
`;

async function run() {
  const docs = await retrieveRelevantChunks(testCode, { topK: 3 });

  const review = await reviewCode(testCode);

  const reflection = await reflectOnReview(testCode, review, docs);

  console.log("\nFINAL REFLECTION:");
  console.log(JSON.stringify(reflection, null, 2));
}

run();
