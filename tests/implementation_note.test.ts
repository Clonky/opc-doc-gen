import {
    CompanionSpecification,
} from "../src/models/companion_specification";
import { JSDOM } from "jsdom";
import * as fs from "fs";
import { SiomeConverter } from "../src/converter";

const load_ws_sweets = () => {
    const file = fs.readFileSync("./tests/resources/Opc.Ua.WSBasis.NodeSet2.xml");
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
        const converter = await setup_converter("http://opcfoundation.org/UA/WeihenstephanStandards/WSBasis/");
        const nodes = converter.get_traced_nodes()
        const target_node = nodes.filter((inode) => inode.browsename === "10:WSFormType").at(0);
        expect(target_node).toBeDefined();
        if (target_node) {
            expect(target_node.implementation_notes.notes.length).toEqual(4)
        }
    });
    test("Check for included extensions in the docx file", async () => {
        const converter = await setup_converter("http://opcfoundation.org/UA/WeihenstephanStandards/WSBasis/");
        const out = converter.write();
        await out.saveToFile("./", "test_extensions.docx");
        const file = fs.readFileSync("./test_extensions.docx");
        expect(file).toBeDefined();
    }, 0);
})
