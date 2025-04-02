import {
  CompanionSpecification,
  CompanionSpecifications,
} from "./models/companion_specification";
import { LinkedNode, Node, RefAndTrace } from "./models/node";
import * as handlebars from "handlebars";
import { DocWriter } from "./writers/writer";

interface IConverter {
  target: string;
  specs: CompanionSpecifications;

  write(): void;
}

const template_refs = `
<tr>
    {{#if issubtype}}
    <td colspan="6">Subtype of {{trace.0.node.browsename}} defined in TODO</td>
    {{/if}}
    <td>{{reftype}}</td>
    <td>{{trace.0.node.nodeclass}}</td>
    <td>{{trace.0.node.browsename}}</td>
    <td>{{trace.0.node.dtype}}</td>
    <td>{{trace.1.node.browsename}}</td>
    <td>{{trace.0.node.modellingrule}}</td>
</tr>
`;

const template_node = `
<section id="{{browsename}}">
    <h2>{{browsename}}</h2>
    <table>
        <thead>
            <tr class="thick-border">
            <th>Attribute</th>
            <th colspan="5">Value</th>
            </tr>
            <tr>
                <td>BrowseName</td><td colspan="5">{{browsename}}</td>
            </tr>
            <tr class="toprow">
                <td>IsAbstract</td><td class="val" colspan="5">{{isabstract}}</td>
            </tr>
            {{#if dtype}}
            <tr class="toprow">
                <td>DataType</td><td class="val" colspan="5">{{dtype}}</td>
            </tr>
            {{/if}}
            <tr class="headerrow">
                <th>References</th>
                <th>Node Class</th>
                <th>BrowseName</th>
                <th>DataType</th>
                <th>TypeDefinition</th>
                <th>Other</th>
            </tr>
        </thead>
        <tbody>
            {{#each references.refs}}
                {{>ref}}
            {{/each}}
        </tbody>
    </table>
</section>
`;

export class SiomeConverter implements IConverter {
  target: string;
  node_template: handlebars.TemplateDelegate;
  specs: CompanionSpecifications;

  constructor(target: string, raw_specs: Document[]) {
    this.setup_templates();
    this.target = target;
    const converted_specs = raw_specs.map(
      (ispec) => new CompanionSpecification(ispec)
    );
    const target_spec = converted_specs.find(
      (ispec) => ispec.get_model_uri() == target
    )!;
    const specs = new CompanionSpecifications(
      target,
      target_spec,
      converted_specs
    );
    this.specs = specs;
  }

  link_refs_in_node(inode: Node): void {
    inode.references.refs.forEach((iref, index) => {
      const ref_uri = this.specs.target_spec?.get_uri_by_ns_id(iref.nodeid);
      const ref_spec = this.specs.lookup(ref_uri!);
      const ref_node = ref_spec.lookup(iref.nodeid);
      const trace = new LinkedNode(ref_node, ref_spec).trace(this.specs, []);
      trace.forEach((itrace) => {
        // Localize the browsename prefixes in relation to the target_spec
        const ns_id = this.specs.target_spec?.get_ns_id_by_uri(
          itrace.parent_nodeset.get_model_uri()
        );
        itrace.node.browsename = itrace.node.browsename.replace(
          /^.:/,
          `${ns_id}:`
        );
      });
      inode.references.refs[index] = new RefAndTrace(iref, trace);
    });
  }

  get_traced_nodes(): Node[] {
    const nodes = this.specs.target_spec?.get_nodes_of_types();
    if (nodes) {
      const traced_nodes = nodes.map((inode) => {
        this.link_refs_in_node(inode);
        return inode;
      });
      return traced_nodes;
    } else {
      throw Error("No eligible nodes have been found for the given spec.");
    }
  }

  setup_templates(): void {
    handlebars.registerPartial("ref", template_refs);
    this.node_template = handlebars.compile(template_node);
  }

  write(): WriteResult {
    const nodes = this.get_traced_nodes();
    const node_contents: string[] = nodes.map((inode) =>
      this.node_template(inode)
    );
    const blob = new DocWriter(nodes).write();
    return new WriteResult(node_contents.join("\n"), blob);
  }
}

export class WriteResult {
  html: string;
  blob: Promise<Blob>;

  constructor(html: string, blob: Promise<Blob>) {
    this.html = html;
    this.blob = blob;
  }

  async saveToFile(directory: string, filename: string = "document.docx"): Promise<void> {
    if (typeof window === 'undefined') {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const filepath = path.join(directory, filename);
        const content = await (await this.blob).arrayBuffer();
        const buffer = Buffer.from(content);

        await fs.promises.writeFile(filepath, buffer);
      } catch {
        throw new Error("Failed to write to file in NodeJS.");
      }
    } else {
      throw new Error("Failed to write file in NodeJS.")
    }
  }
}
