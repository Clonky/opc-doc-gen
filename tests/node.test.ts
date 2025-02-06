import {
  CompanionSpecification,
  CompanionSpecifications,
} from "../src/models/companion_specification";
import { LinkedNode, Node, NodeId } from "../src/models/node";
import { JSDOM } from "jsdom";
import * as fs from "fs";

const setup = async () => {
  const dom = await JSDOM.fromFile(
    "tests/resources/07_Opc.Ua.Weihenstephan.NodeSet2.xml"
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
    const exp = 16;
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
  test("See if grabbing the type definition works for present", async () => {
    const exp_type = "HasTypeDefinition";
    const exp_value = new NodeId("ns=0;i=68");
    const comp_spec = await setup();
    const nodes = comp_spec.get_nodes();
    const node = nodes.find(
      (inode) => inode.browsename === "IsNamespaceSubset"
    )!;
    expect(exp_type).toBe(node.references.get_typedef()?.reftype);
    expect(exp_value).toStrictEqual(node.references.get_typedef()?.nodeid);
  });
  test("Check if lookup for references works", async () => {
    const exp_type = "HasTypeDefinition";
    const exp_value = new NodeId("ns=0;i=68");
    const comp_spec = await setup();
    const nodes = comp_spec.get_nodes();
    const node = nodes.find(
      (inode) => inode.browsename === "IsNamespaceSubset"
    )!;
    expect(exp_type).toBe(node.references.get_typedef()?.reftype);
    expect(exp_value).toStrictEqual(node.references.get_typedef()?.nodeid);
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
    const target_nodeid = new NodeId("ns=4;i=5003");
    const comp_specs = await setup_specs(
      "http://opcfoundation.org/UA/Weihenstephan/"
    );
    const node = comp_specs?.target_spec?.lookup(target_nodeid);
    const linkedNode = new LinkedNode(node!, comp_specs!.target_spec!);
    const nodeStack = linkedNode.trace(comp_specs!, []);
    expect(nodeStack.length).toBe(4);
  });
});
