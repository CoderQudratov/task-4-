import { getVerifyUrl } from "./email.service";

function pass(msg: string) {
  console.log("[PASS]", msg);
}
function fail(msg: string) {
  console.error("[FAIL]", msg);
  process.exitCode = 1;
}

(() => {
  console.log("\n=== Test 1: getVerifyUrl produces correct URL ===");
  {
    process.env.APP_BASE_URL = "https://example.com";
    const token = "abc123";
    const url = getVerifyUrl(token);
    const expected = "https://example.com/verify/abc123";
    if (url === expected) {
      pass(`URL matches: "${url}"`);
    } else {
      fail(`Expected "${expected}", got "${url}"`);
    }
  }

  console.log("\n=== Test 2: getVerifyUrl uses env at call time ===");
  {
    process.env.APP_BASE_URL = "https://staging.example.com";
    const url = getVerifyUrl("tok-xyz");
    if (url === "https://staging.example.com/verify/tok-xyz") {
      pass("Picks up updated APP_BASE_URL");
    } else {
      fail(`Unexpected URL: "${url}"`);
    }
  }

  console.log("\n=== Test 3: getVerifyUrl works with uuid-style token ===");
  {
    process.env.APP_BASE_URL = "https://app.example.com";
    const token = "550e8400-e29b-41d4-a716-446655440000";
    const url = getVerifyUrl(token);
    if (url.endsWith(`/verify/${token}`)) {
      pass(`UUID token embedded correctly: "${url}"`);
    } else {
      fail(`Token not found in URL: "${url}"`);
    }
  }

  console.log("\n=== All tests complete ===\n");
})();
