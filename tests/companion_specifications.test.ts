import { CompanionSpecification, CompanionSpecifications } from "../src/models/companion_specification";
import * as fs from "fs";
import { JSDOM } from "jsdom";


const setup_companionspecs = async (target: string) => {
    const base_path = "./tests/resources/"
    const files = fs.readdirSync("./tests/resources/").filter(ifile => ifile.endsWith(".xml"))
    const specs_dom: Document[] = [];
    for (const ifile of files) {
        const dom = await JSDOM.fromFile(base_path + ifile);
        specs_dom.push(dom.window.document)
    }
    const specs_cs: CompanionSpecification[] = specs_dom.map(ispec => new CompanionSpecification(ispec))
    const target_spec = specs_cs.find(ispec => ispec.get_model_uri() == target)
    if (specs_cs.some(ispec => ispec === null)) {
        throw Error("Some specs were parsed as null")
    }
    return new CompanionSpecifications(target, target_spec!, specs_cs)
}


describe("Test creation of companion specs from folder", () => {
    test("Try creating from folder", async () => {
        const core = await fs.readFileSync("./tests/resources/_Opc.Ua.NodeSet2.xml");
        const core_dom = new JSDOM(core).window.document
        const core_spec = new CompanionSpecification(core_dom)
        expect(core_spec != undefined).toBe(true);
    }),
        test("See if target spec is constructed correctly", async () => {
            const expected = "http://opcfoundation.org/UA/Weihenstephan/";
            const weihenstephan = await fs.readFileSync("./tests/resources/Opc.Ua.Weihenstephan.NodeSet2.xml");
            const weihenstephan_dom = new JSDOM(weihenstephan).window.document
            const weihenstephan_spec = new CompanionSpecification(weihenstephan_dom)
            expect(weihenstephan_spec.get_model_uri()).toBe(expected);
        }),
        test("Test if own ns id is correctly extracted", async () => {
            const expected = 4;
            const target_spec_uri = "http://opcfoundation.org/UA/Weihenstephan/";
            const comp_spec = await setup_companionspecs(target_spec_uri)
            const spec = comp_spec.target_spec
            expect(spec!.get_own_ns_id()).toBe(expected);
        })
})
//test("Test if lookup for specs works", () => {
//const expected = "http://opcfoundation.org/UA/";
//const target_spec = "http://opcfoundation.org/UA/Weihenstephan/";
//const comp_specs = CompanionSpecifications.from_folder(target_spec, "./tests/resources/")!;
//const spec = comp_specs.lookup("http://opcfoundation.org/UA/");
//expect(spec.get_model_uri()).toBe(expected);
//}),
//it.each`
//expected | nodeId
//${'http://opcfoundation.org/UA/'} | ${'ns=0;i=1'}
//${'http://opcfoundation.org/UA/DI/'} | ${'ns=1;i=1'}
//${'http://opcfoundation.org/UA/Machinery/'} | ${'ns=2;i=1'}
//${'http://opcfoundation.org/UA/PackML/'} | ${'ns=3;i=1'}
//${'http://opcfoundation.org/UA/Weihenstephan/'} | ${'ns=4;i=1'}
//`("Test fetching the correct uri from different ids", ({ expected, nodeId }) => {
//const target_spec = "http://opcfoundation.org/UA/Weihenstephan/";
//const comp_specs = CompanionSpecifications.from_folder(target_spec, "./tests/resources/")!;
//const spec = comp_specs.target_spec?.get_uri_by_ns_id(new NodeId(nodeId));
//expect(spec).toBe(expected);
//})