/**
 * @jest-environment node
 */
import { JSDOM } from "jsdom";
import { SiomeConverter } from "../src/converter";
import * as fs from "fs";

const setup_converter = async (target: string) => {
  const folder = "./tests/resources/reduced_set/";
  const files = fs.readdirSync(folder);
  const specs: Document[] = [];
  for (const ifile of files) {
    if (ifile.endsWith(".xml")) {
      const filepath = folder + ifile;
      const nodeset = await JSDOM.fromFile(filepath);
      specs.push(nodeset.window.document);
    }
  }
  return new SiomeConverter(target, specs);
};

describe("Check the correct execution of the converter classes", () => {
  test("Linking nodes yields non null results", async () => {
    const converter = await setup_converter("http://opcfoundation.org/UA/DI/");
    const nodes = converter.get_traced_nodes();
    expect(nodes.length).toBeGreaterThan(0);
  });
  test("Create converter", async () => {
    const converter = await setup_converter("http://opcfoundation.org/UA/DI/");
    const out = converter.write();
    expect(out).toBeDefined();
  });
});
