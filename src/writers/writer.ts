import * as docx from "docx";
import { Node } from "../models/node";
import { TableRefs } from "./table_components";
import { Table } from "./layout_components";
import { CompanionSpecification } from "../models/companion_specification";

interface IWriter {
  write(): Buffer | Promise<Blob>;
}

export class DocWriter implements IWriter {
  doc: docx.Document;
  target_spec: CompanionSpecification
  nodes: Node[];

  constructor(nodes: Node[], target_spec: CompanionSpecification) {
    this.doc = new docx.Document({ sections: [] });
    this.target_spec = target_spec;
    if (nodes.every((inode) => inode.browsename)) {
      this.nodes = nodes;
    } else {
      throw Error("Some nodes passed to the writer were malformed");
    }
  }

  write(): Promise<Blob> {
    let sections: docx.ISectionOptions[] = [];
    sections.push({
      properties: {
        type: docx.SectionType.CONTINUOUS,
      },
      children: [this.create_table_of_contents()]
    });
    for (const inode of this.nodes) {
      try {
        sections.push(new NodeWriter(inode).write())
      } catch (e) {
        throw `Failed at node: ${inode.browsename} with error: ${e}`;
      }
    }
    sections.push(new NamespaceTableWriter(this.target_spec).write());
    this.doc = new docx.Document({
      features: {
        updateFields: true,
      },
      numbering: {
        config: [
          {
            reference: "headingNumbering",
            levels: [
              {
                level: 0,
                format: "decimal",
                text: "%1",
                alignment: "start",
              },
              {
                level: 1,
                format: "decimal",
                text: "%1.%2",
                alignment: "start",
              },
              {
                level: 2,
                format: "decimal",
                text: "%1.%2.%3",
                alignment: "start",
              }
            ]
          }
        ]
      },
      sections: sections,
      styles: {
        default: {
          heading1:
          {
            next: "paragraph",
            quickFormat: true,
            basedOn: "paragraph",
            run: {
              bold: true,
              font: "Arial",
              size: "11pt",
            },
            paragraph: {
              numbering: {
                reference: "headingNumbering",
                level: 0,
              },
              keepNext: true,
              spacing: {
                before: 10,
                after: 10,
              },
              indent: {
                hanging: "0.7cm",
              },
            }
          },
          heading2: {
            basedOn: "heading1",
            run: {
              bold: true,
              font: "Arial",
              size: "10pt",
            },
            paragraph: {
              numbering: {
                reference: "headingNumbering",
                level: 1,
              },
              spacing: {
                before: 5,
                after: 5,
              },
              indent: {
                hanging: "1.1cm",
              },
            }
          },
        },
        paragraphStyles: [
          {
            id: "paragraph",
            name: "PARAGRAPH;PA",
            basedOn: "Normal",
            quickFormat: true,
            run: {
              font: "Arial",
              size: "10pt",
            },
            paragraph: {
              spacing: {
                before: 5,
                after: 10,
              },
            },
          },
          {
            id: "tableTitle",
            name: "TABLE-title",
            basedOn: "paragraph",
            quickFormat: true,
            paragraph: {
              alignment: "center"
            },
            run: {
              bold: true,
              font: "Arial",
              size: "10pt",
            },
          }
        ]
      }
    });
    return docx.Packer.toBlob(this.doc);
  }

  create_table_of_contents() {
    return new docx.TableOfContents("Summary", {
      hyperlink: true,
      headingStyleRange: "1-3",
    })
  }
}

class NamespaceTableWriter {
  target_spec: CompanionSpecification

  constructor(target_spec: CompanionSpecification) {
    this.target_spec = target_spec
  }

  write(): docx.ISectionOptions {
    const new_section = {
      properties: {
        type: docx.SectionType.CONTINUOUS,
      },
      children: [this.create_heading(), this.create_table()],
    };
    return new_section
  }

  create_heading(): docx.Paragraph {
    return new docx.Paragraph({
      text: "Namespaces used in this document",
      heading: docx.HeadingLevel.HEADING_2,
    })
  }

  create_table(): docx.Table {
    let rows: docx.TableRow[] = [];
    for (const [index, ns] of this.target_spec.get_namespaces().entries()) {
      rows.push(new docx.TableRow({
        children: [
          new docx.TableCell({ children: [new docx.Paragraph(index.toString())] }),
          new docx.TableCell({ children: [new docx.Paragraph(ns)] }),
          new docx.TableCell({ children: [new docx.Paragraph("#Example")] }),
        ]
      })
      )
    };
    let table = new docx.Table({
      width: {
        size: 100,
        type: docx.WidthType.PERCENTAGE,
      },
      rows: rows
    });
    return table
  }
}

class NodeWriter {
  node: Node

  constructor(node: Node) {
    this.node = node
  }

  write(): docx.ISectionOptions {
    const new_section = {
      properties: {
        type: docx.SectionType.CONTINUOUS,
      },
      children: [this.create_heading(), this.create_description(), this.create_caption(), this.create_table()],
    };
    const implementation_notes = this.create_implementation_notes();
    for (const note of implementation_notes) {
      new_section.children.push(note);
    }
    return new_section
  }


  create_implementation_notes(): docx.Paragraph[] {
    return this.node.implementation_notes.write();
  }

  create_heading() {
    return new docx.Paragraph({
      text: this.node.browsename,
      heading: docx.HeadingLevel.HEADING_2,
    });
  }

  create_description() {
    return new docx.Paragraph({
      children: [
        new docx.TextRun({
          text: this.node.description,
        })
      ],
      style: "paragraph"
    });
  }

  create_caption() {
    return new docx.Paragraph({
      children: [
        new docx.TextRun({
          text: "Table ",
          bold: true,
        }),
        new docx.SimpleField("SEQ Table \\* ARABIC"),
        new docx.TextRun(" " + this.node.browsename + "Definition"),
      ],
      style: "tableTitle"
    })

  }

  create_table() {
    const rows = new Table(this.node).write();
    let refrows: docx.TableRow[] = [];
    try {
      refrows = new TableRefs(this.node).write();
    } catch (e) {
      throw Error(
        `Encountered error ${e} during writing of reference rows for node: ${this.node.browsename}`
      );
    }
    const table = new docx.Table({ rows: [...rows, ...refrows] });
    return table;
  }
}