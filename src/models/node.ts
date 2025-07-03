import {
  CompanionSpecifications,
  ICompanionSpecification,
} from "./companion_specification";
import { ImplementationNoteReader } from "./readers/implementation_note_rw";

interface INode {
  browsename: string;
  nodeid: INodeId;
  references: References;
  isabstract: string;
  nodeclass: string;
  dtype: string;
  modellingrule: string;
  description?: string;
  extensions?: Extensions | null;

  get_browsename(): string;
}

export class Node implements INode {
  browsename: string;
  nodeid: INodeId;
  references: IReferences;
  isabstract: string;
  nodeclass: string;
  dtype: string;
  modellingrule: string;
  description?: string | undefined;
  implementation_notes: ImplementationNoteReader;

  parse_nodeclass(tag: string): string {
    if (tag === "UAObjectType") {
      return "ObjectType";
    } else if (tag === "UAVariableType") {
      return "VariableType";
    } else if (tag === "UAVariable") {
      return "Variable";
    } else if (tag === "UAObject") {
      return "Object";
    } else if (tag === "UAMethod") {
      return "Method";
    } else if (tag === "UADataType") {
      return "DataType";
    } else {
      throw Error(`Tag ${tag} is an unknown node class`);
    }
  }

  parse_dtype(node_dom: Element): string {
    const default_dtype = "";
    const tag = this.parse_nodeclass(node_dom.tagName);
    if (tag === "Variable" || tag == "VariableType") {
      const dtype = node_dom.getAttribute("DataType");
      if (dtype) {
        return dtype;
      } else {
        return default_dtype;
      }
    } else {
      return default_dtype;
    }
  }

  get_browsename(): string {
    const split_browsename = this.browsename.split(":");
    if (split_browsename.length < 2) {
      return this.browsename;
    } else {
      return split_browsename[1].trim();
    }
  }

  public static parse_modelling_rule(node_dom: Element): string {
    const refs = Array.from(node_dom.querySelectorAll("Reference"));
    const modelling_rule = refs.filter(
      (iref) => iref.getAttribute("ReferenceType") === "HasModellingRule"
    );
    if (modelling_rule.length > 0) {
      switch (modelling_rule[0].textContent) {
        case "i=78":
          return "Mandatory";
        case "i=80":
          return "Optional";
        case "i=11508":
          return "OptionalPlaceholder";
        case "i=11510":
          return "MandatoryPlaceholder";
        case undefined:
          return "";
      }
    }
    return "";
  }

  constructor(node_dom: Element) {
    try {
      const dtype = this.parse_dtype(node_dom);
      const nodeclass = this.parse_nodeclass(node_dom.tagName);
      const browsename = node_dom.getAttribute("BrowseName")!;
      const nodeid = new NodeId(node_dom.getAttribute("NodeId")!);
      const isabstract = node_dom.getAttribute("IsAbstract");
      const refs = node_dom.querySelectorAll("Reference");
      const description_node = node_dom.querySelector("Description");
      this.implementation_notes = new ImplementationNoteReader(node_dom);
      if (description_node) {
        this.description = description_node.textContent ?? "";
      } else {
        this.description = "";
      }
      if (refs) {
        const references = Array.from(refs).map(
          (ielement) => new Reference(ielement)
        );
        this.browsename = browsename;
        this.nodeid = nodeid;
        this.references = new References(references);
        this.isabstract = isabstract ?? "False";
        this.nodeclass = nodeclass;
        this.dtype = dtype;
        this.modellingrule = Node.parse_modelling_rule(node_dom);
      }
    } catch (e) {
      throw Error(`Failed during node creation of ${node_dom} with error ${e}`);
    }
  }
}

export interface IReference {
  reftype: string;
  nodeid: INodeId;
  issubtype: boolean;
}

interface IReferences {
  refs: IReference[] | RefAndTrace[];

  get_typedef(): IReference | undefined;
}

export interface INodeId {
  prefix: number;
  suffix: string;
}

export class NodeId implements INodeId {
  prefix: number;
  suffix: string;

  constructor(nodeid: string) {
    const id_parts = nodeid.split(";");
    if (id_parts.length === 1) {
      const prefix = 0;
      const suffix = id_parts[0].split("=")[1];
      this.prefix = prefix;
      this.suffix = suffix;
    } else {
      const prefix: number = +id_parts[0].split("=")[1];
      const suffix = id_parts[1].split("=")[1];
      this.prefix = prefix;
      this.suffix = suffix;
    }
  }
}

export class Reference implements IReference {
  reftype: string;
  nodeid: INodeId;
  issubtype: boolean;

  constructor(ref: Element) {
    const reftype: string = ref.getAttribute("ReferenceType")!;
    const id = new NodeId(ref.textContent!);
    this.reftype = reftype;
    this.nodeid = id;
    this.issubtype = reftype === "HasSubtype";
  }
}

class References {
  refs: IReference[];

  constructor(refs: IReference[]) {
    this.refs = refs;
  }

  get_typedef(): IReference | undefined {
    const typedef = this.refs.find(
      (iref) => iref.reftype === "HasTypeDefinition"
    );
    if (!typedef) {
      return this.refs.find((iref) => iref.reftype === "HasSubtype");
    } else {
      return typedef;
    }
  }
}

class Extension {
  tag: string;
  implementation_note_text: string | null;

  constructor(node: Element) {
    this.tag = node.tagName;
    this.implementation_note_text = node.querySelector("ImplementationNote")?.textContent ?? null;
  }
}

class Extensions {
  extension: Extension[]

  constructor(node: Element) {
    // This is currently hardwired to expect the ws namespace. Might have to change in the future
    this.extension = Array.from(node.querySelectorAll("Extension")).map(
      (ielement) => new Extension(ielement)
    );
  }
}

class ImplementationNotes {
  notes: string[];
  constructor(node: Element) {
    const notes = Array.from(node.querySelectorAll("ImplementationNote"));
    this.notes = [];
    for (const note of notes) {
      this.notes.push(note.textContent ?? "");
    }
  }
}

interface ILinkedNode {
  node: INode;
  parent_nodeset: ICompanionSpecification;

  trace(cs: CompanionSpecifications, state: ILinkedNode[]): ILinkedNode[];
}

export class LinkedNode {
  node: INode;
  parent_nodeset: ICompanionSpecification;

  constructor(node: INode, parent_nodeset: ICompanionSpecification) {
    this.node = node;
    this.parent_nodeset = parent_nodeset;
  }

  trace(cs: CompanionSpecifications, state: ILinkedNode[]): ILinkedNode[] {
    state.push(new LinkedNode(this.node, this.parent_nodeset));
    if (state.length >= 2) {
      // exit early if we already got two links, otherwise we are tracing until corespec
      return state
    }
    const next_ref = this.node.references.get_typedef();
    if (next_ref) {
      const target_uri = this.parent_nodeset.get_uri_by_ns_id(next_ref.nodeid);
      const target_spec = cs.lookup(target_uri);
      const target_node = target_spec.lookup(next_ref.nodeid);
      return new LinkedNode(target_node, target_spec).trace(cs, state);
    } else {
      // In case we haven't found a next reference by typedef or subtype, return the current trace
      return state;
    }
  }
}

interface NodeTrace {
  trace: LinkedNode[];
}

export class RefAndTrace implements IReference, NodeTrace {
  reftype: string;
  nodeid: INodeId;
  issubtype: boolean;
  trace: LinkedNode[];

  constructor(ref: IReference, trace: LinkedNode[]) {
    this.reftype = ref.reftype;
    this.nodeid = ref.nodeid;
    this.trace = trace;
    this.issubtype = ref.reftype === "HasSubtype";
  }
}
