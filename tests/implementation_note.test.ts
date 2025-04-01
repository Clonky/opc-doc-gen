import {
    CompanionSpecification,
} from "../src/models/companion_specification";
import { JSDOM } from "jsdom";
import * as fs from "fs";
import { SiomeConverter } from "../src/converter";

const load_ws_sweets = () => {
    const file = fs.readFileSync("./tests/resources/WS.Sweets.NodeSet2.xml");
    const dom = new JSDOM(file);
    return new CompanionSpecification(dom.window.document);
}

const setup_converter = async (target: string) => {
    const folder = "./tests/resources/";
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
}

describe("Test extraction of extension tags and writing them to the according sections", () => {
    test("Find all extension tags associated to a certain node", async () => {
        const converter = await setup_converter("http://weihenstephan-standards.com/WS/");
        const nodes = converter.get_traced_nodes()
        const target_node = nodes.filter((inode) => inode.browsename === "8:WSFormType").at(0);
        expect(target_node).toBeDefined();
        if (target_node) {
            expect(target_node.extensions?.extension.length).toEqual(4)
        }
    })
})
