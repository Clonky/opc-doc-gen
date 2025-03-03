import * as docx from "docx";
import { Node } from "../models/node";
import { TableRefs, TableTop } from "./table_components";
import { Table } from "./layout_components";

interface IWriter {
  write(): Buffer | Promise<Blob>;
}

export class DocWriter implements IWriter {
  doc: docx.Document;
  nodes: Node[];

  constructor(nodes: Node[]) {
    this.doc = new docx.Document({ sections: [] });
    if (nodes.every((inode) => inode.browsename)) {
      this.nodes = nodes;
    } else {
      throw Error("Some nodes passed to the writer were malformed");
    }
  }

  create_section(node: Node, sections: docx.ISectionOptions[]) {
    const new_section = {
      properties: {
        type: docx.SectionType.CONTINUOUS,
      },
      children: [this.create_heading(node), this.create_description(node), this.create_table(node), ...this.create_implementation_notes(node)],
    };
    sections.push(new_section);
    return sections;
  }

  create_implementation_notes(node: Node): docx.Paragraph[] {
    if (node.extensions) {
      const pars = Array.from(node.extensions.extension).map((iextension) => {
        if (iextension.text) {
          return new docx.Paragraph({
            text: iextension.text,
          });
        } else {
          return new docx.Paragraph({
            text: "",
          });
        }
      });
      return pars
    } else {
      return [];
    }
  }

  create_heading(node: Node) {
    return new docx.Paragraph({
      text: node.browsename,
      heading: docx.HeadingLevel.HEADING_2,
    });
  }

  create_description(node: Node) {
    return new docx.Paragraph({
      children: [
        new docx.TextRun({
          text: node.description,
          font: "Calibri",
          size: 16,
        })
      ]
    });
  }

  create_table(node: Node) {
    const rows = new Table(node).write();
    let refrows: docx.TableRow[] = [];
    try {
      refrows = new TableRefs(node).write();
    } catch (e) {
      throw Error(
        `Encountered error ${e} during writing of reference rows for node: ${node.browsename}`
      );
    }
    const table = new docx.Table({ rows: [...rows, ...refrows] });
    return table;
  }

  write(): Promise<Blob> {
    let sections: docx.ISectionOptions[] = [];
    for (const inode of this.nodes) {
      try {
        sections = this.create_section(inode, sections);
      } catch (e) {
        throw `Failed at node: ${inode.browsename} with error: ${e}`;
      }
    }
    this.doc = new docx.Document({
      sections: sections,
    });
    return docx.Packer.toBlob(this.doc);
  }
}
