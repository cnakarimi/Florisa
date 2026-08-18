import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const presentationUrl = new URL(
  "./components/ResponsiveHomeExperience.tsx",
  import.meta.url,
);

test("Home uses one CSS-first responsive presentation tree", async () => {
  const source = await readFile(presentationUrl, "utf8");

  assert.doesNotMatch(source, /matchMedia|useSyncExternalStore|next\/dynamic/);
  assert.doesNotMatch(source, /MobileHomeExperience|DesktopHomeExperience/);
  assert.match(source, /data-home-experience="responsive"/);
  assert.match(source, /className="lg:hidden"/);
  assert.match(source, /className="[^"]*hidden[^"]*lg:block[^"]*"/);

  const productMappings = source.match(/latestProducts\.map/g) ?? [];
  assert.equal(productMappings.length, 1);
});
