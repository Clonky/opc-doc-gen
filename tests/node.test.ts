import {
  CompanionSpecification,
  CompanionSpecifications,
} from "../src/models/companion_specification";
import { LinkedNode, Node, NodeId } from "../src/models/node";
import { JSDOM } from "jsdom";
import * as fs from "fs";

const setup = async () => {
  const dom = await JSDOM.fromFile(
    "tests/resources/Opc.Ua.Weihenstephan.NodeSet2.xml"
  );
  return new CompanionSpecification(dom.window.document);
};

const setup_specs = async (target: string) => {
  const folder = "./tests/resources/";
  const files = fs.readdirSync(folder);
  let specs: CompanionSpecification[] = [];
  for (const ifile of files) {
    if (ifile.endsWith(".xml")) {
      const filepath = folder + ifile;
      const dom = await JSDOM.fromFile(filepath);
      const spec = new CompanionSpecification(dom.window.document);
      specs.push(spec);
    }
  }
  specs = specs.filter((ispec) => ispec != undefined);
  const target_spec = specs.find((ispec) => ispec.get_model_uri() === target);
  if (target_spec) {
    return new CompanionSpecifications(target, target_spec, specs);
  }
};

describe("Test the node interface and node creation", () => {
  test("Try creating a node from a DOM element", async () => {
    const exp = "4:WSMachineType";
    const comp_spec = await setup();
    const object_types =
      comp_spec.nodeset.getElementsByTagName("UAObjectType")!;
    const node = new Node(object_types[0]);
    expect(exp).toBe(node.browsename);
  });
  test("See if all references are parsed", async () => {
    const exp = 1;
    const comp_spec = await setup();
    const object_types =
      comp_spec.nodeset.getElementsByTagName("UAObjectType")!;
    const node = new Node(object_types[0]);
    expect(exp).toBe(node.references.refs.length);
  });
  test("See if grabbing the type definition works for not present but HasSubtype", async () => {
    const exp = {
      issubtype: true,
      nodeid: { prefix: 0, suffix: "58" },
      reftype: "HasSubtype",
    };
    const comp_spec = await setup();
    const object_types =
      comp_spec.nodeset.getElementsByTagName("UAObjectType")!;
    const node = new Node(object_types[0]);
    expect(exp).toEqual(node.references.get_typedef());
  });
});

describe("Test linked node functionality", () => {
  test("Test if type definition is extracted properly", async () => {
    const target_nodeid = new NodeId("ns=4;i=6003");
    const comp_specs = await setup_specs(
      "http://opcfoundation.org/UA/Weihenstephan/"
    );
    const node = comp_specs?.target_spec?.lookup(target_nodeid);
    expect(node?.references.get_typedef()?.nodeid).toStrictEqual(
      new NodeId("ns=0;i=68")
    );
  });
  test("Try tracing nodes", async () => {
    const expected = 2 // This was reduced from 4 to 2 because the tracer is limited to two traces now.
    const target_nodeid = new NodeId("ns=4;i=5003");
    const comp_specs = await setup_specs(
      "http://opcfoundation.org/UA/Weihenstephan/"
    );
    const nodes = comp_specs?.target_spec?.get_nodes();
    const node = comp_specs?.target_spec?.lookup(target_nodeid);
    const linkedNode = new LinkedNode(node!, comp_specs!.target_spec!);
    const nodeStack = linkedNode.trace(comp_specs!, []);
    expect(nodeStack.length).toBe(expected);
  });
});
