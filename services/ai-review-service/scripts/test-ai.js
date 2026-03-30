import { reviewCode } from "../services/ai-service.js";

const testCode = `
function test() {
  let x = 5
}
`;

async function run() {
  const result = await reviewCode(testCode, "javascript");

  console.log("\nAI REVIEW:");
  console.log(JSON.stringify(result, null, 2));
}

run();
