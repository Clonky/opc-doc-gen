import { INodeId, Node } from "./node";

interface ICompanionSpecifications {
  target: string;
  target_spec: ICompanionSpecification;
  specs: ICompanionSpecification[];

  lookup(uri: string): ICompanionSpecification | undefined;
}

export interface ICompanionSpecification {
  nodeset: Document;
  uri: string;
  nodes?: Map<string, Node>;

  get_model_uri(): string;
  get_own_ns_id(): number;
  get_nodes(): Map<string, Node>;
  get_nodes_of_types(): Node[];
  lookup(nodeid: INodeId): Node;
  get_uri_by_ns_id(nodeid: INodeId): string;
  get_ns_id_by_uri(uri: string): number;
  get_namespaces(): string[];
}

export class CompanionSpecification implements ICompanionSpecification {
  nodeset: Document;
  uri: string;
  nodes?: Map<string, Node>;

  constructor(nodeset: Document) {
    this.nodeset = nodeset;
    this.uri = nodeset
      .getElementsByTagName("Models")[0]
      .getElementsByTagName("Model")[0]
      .getAttribute("ModelUri")!;
  }

  public static from_string(raw_nodeset: string): CompanionSpecification {
    const parser = new DOMParser();
    const parsed_string = parser.parseFromString(
      raw_nodeset,
      "application/xml"
    );
    return new CompanionSpecification(parsed_string);
  }

  public static from_file(content: string) {
    return CompanionSpecification.from_string(content);
  }

  public get_nodes(): Map<string, Node> {
    if (!this.nodes) {
      this.nodes = new Map<string, Node>();
      const types = this.get_nodes_of_types();
      const objs = Array.from(this.nodeset.querySelectorAll("UAObject"));
      const vars = Array.from(this.nodeset.querySelectorAll("UAVariable"));
      const methods = Array.from(this.nodeset.querySelectorAll("UAMethod"));
      const rest = objs.concat(vars, methods).map((inode) => new Node(inode));
      const all_nodes = types.concat(rest);
      for (const node of all_nodes) {
        this.nodes.set(node.nodeid.suffix, node);
      }
      return this.nodes;
    } else {
      return this.nodes;
    }
  }

  public get_nodes_of_types(): Node[] {
    const obj_types = Array.from(this.nodeset.querySelectorAll("UAObjectType"));
    const variable_types = Array.from(
      this.nodeset.querySelectorAll("UAVariableType")
    );
    const data_types = Array.from(this.nodeset.querySelectorAll("UADataType"));
    return obj_types
      .concat(variable_types, data_types)
      .map((inode) => new Node(inode));
  }

  public get_model_uri(): string {
    return this.uri;
  }

  public get_uri_by_ns_id(nodeid: INodeId): string {
    const namespaces = this.get_namespaces();
    return namespaces[nodeid.prefix];
  }

  public get_ns_id_by_uri(uri: string): number {
    const namespaces = this.get_namespaces();
    return namespaces.indexOf(uri);
  }

  public lookup(nodeid: INodeId): Node {
    const nodes = this.get_nodes();
    const node = nodes.get(nodeid.suffix);
    if (node) {
      return node;
    } else {
      throw Error(
        `Node with nodeid ${nodeid.suffix
        } could not be found in spec: ${this.get_model_uri()}`
      );
    }
  }

  public get_namespaces(): string[] {
    const uri_elements = this.nodeset.querySelectorAll("Uri");
    if (uri_elements.length > 0) {
      const uris = Array.from(uri_elements).map((iel) => iel.textContent!);
      return ["http://opcfoundation.org/UA/"].concat(uris); // Add the implicit core spec explicitly
    } else {
      return ["http://opcfoundation.org/UA/"];
    }
  }

  public get_own_ns_id(): number {
    const namespaces = this.get_namespaces();
    if (namespaces) {
      const idx = namespaces.findIndex((iuri) => iuri === this.get_model_uri());
      return idx;
    } else {
      return 0;
    }
  }
}

export class CompanionSpecifications implements ICompanionSpecifications {
  target: string;
  target_spec: ICompanionSpecification;
  specs: ICompanionSpecification[];

  constructor(
    target: string,
    target_spec: CompanionSpecification,
    specs: ICompanionSpecification[]
  ) {
    this.target = target;
    this.target_spec = target_spec;
    this.specs = specs;
  }

  //public static from_folder(target: string, folder: string) {
  //const files = fs.readdirSync(folder);
  //const specs = files.map((ifile) => {
  //if (ifile.endsWith(".xml")) {
  //const filepath = folder + ifile;
  //const content = fs.readFileSync(filepath).toString();
  //return CompanionSpecification.from_string(content)
  //}
  //}).filter((ispec) => ispec != undefined);
  //const target_spec = specs.find((ispec) => ispec.get_model_uri() === target);
  //if (target_spec) {
  //return new CompanionSpecifications(target, target_spec, specs)
  //}
  //}

  lookup(uri: string): ICompanionSpecification {
    const spec = this.specs.find((ispec) => ispec.get_model_uri() === uri);
    if (spec) {
      return spec;
    } else {
      let error_msg = `Looking for ${uri} did not yield a result. Has the supporting companion spec been loaded?\n`;
      this.specs.forEach((ispec) => {
        error_msg = error_msg + `\t ${ispec.get_model_uri()}\n`;
      });
      throw Error(error_msg);
    }
  }

  get_by_uri(uri: string) {
    const target = this.specs.find((ispec) => ispec.get_model_uri() === uri);
    if (target) {
      return target;
    } else {
      throw Error("Target spec was not found in companion specifications");
    }
  }
}
