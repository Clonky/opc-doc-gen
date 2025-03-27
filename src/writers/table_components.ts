import * as docx from "docx";
import * as layout from "./layout_components";
import { Node, RefAndTrace, IReference } from "../models/node";


interface ITableComponent {
  node: Node;
  write(): docx.TableRow[];
}

class TableCellDef {
  content: docx.Paragraph;
  opts: object | undefined;

  constructor(name: docx.Paragraph, opts: object | undefined = undefined) {
    this.content = name;
    this.opts = opts;
  }

  to_cell(): docx.TableCell {
    return new docx.TableCell({
      children: [
        this.content
      ],
      ...this.opts,
    });
  }
}

class TableRowDef {
  cells: TableCellDef[];

  constructor(cells: TableCellDef[]) {
    this.cells = cells;
  }

  to_row(): docx.TableRow {
    const cells = this.cells.map((icell) => icell.to_cell());
    const row = new docx.TableRow({
      children: cells,
    });
    return row;
  }
}

export class TableTop implements ITableComponent {
  node: Node;

  //TABLE_TOP_HEADERS: TableRowDef = new TableRowDef([
  //new TableCellDef(TOP_ROW_ATTRIBUTE_FIELD, {
  //width: {

  //}
  //}),
  //new TableCellDef("Value", { columnSpan: 5 }),
  //]);

  constructor(node: Node) {
    this.node = node;
  }

  create_top_rows(): docx.TableRow[] {
    const rows: docx.TableRow[] = [];
    //const top_row = this.TABLE_TOP_HEADERS.to_row();
    //rows.push(top_row);
    const top_partition_row = layout.top_partition_row("Attribute", "Value");
    rows.push(top_partition_row);
    const bn_top_row = layout.top_partition_row("BrowseName", this.node.browsename);
    rows.push(bn_top_row);
    const abstract_top_row = layout.top_partition_row("IsAbstract", this.node.isabstract);
    rows.push(abstract_top_row);
    if (this.node.dtype != "") {
      const dtype_top_row = layout.top_partition_row("DataType", this.node.dtype);
      rows.push(dtype_top_row);
    }
    return rows;
  }

  write(): docx.TableRow[] {
    return this.create_top_rows();
  }
}

export class TableRefs implements ITableComponent {
  node: Node;


  constructor(node: Node) {
    this.node = node;
  }

  isRefAndTrace(ref: IReference | RefAndTrace | undefined): ref is RefAndTrace {
    return (ref as RefAndTrace).trace !== undefined;
  }

  write(): docx.TableRow[] {
    const refrows: docx.TableRow[] = [];
    let subtype_ref = this.node.references.refs.find((iref) => iref.reftype === "HasSubtype");
    if (subtype_ref) {
      if (this.isRefAndTrace(subtype_ref)) {
        refrows.push(new layout.RefRow(subtype_ref.reftype, subtype_ref.trace[0].node.nodeclass, subtype_ref.trace[0].node.browsename, "", "HasSubtype", "").write())
      }
    }

    for (const iref of this.node.references.refs as unknown as RefAndTrace[]) {
      if (iref === null) {
        console.log(iref);
        throw Error(
          `Reference ${iref} did not survive being cast to RefAndTrace`
        );
      }
      try {
        let typedef = "";
        if (iref.trace[0].node.nodeclass === "Method") {
          typedef = "";
        } else if (iref.reftype == "HasSubtype") {
          continue;
        } else if (iref.trace.length > 0) {
          typedef = iref.trace[1].node.browsename;
        } else {
          typedef = iref.trace[0].node.browsename;
        }
        const refrow = new layout.RefRow(iref.reftype, iref.trace[0].node.nodeclass, iref.trace[0].node.browsename, iref.trace[0].node.dtype, typedef, iref.trace[0].node.modellingrule).write();
        refrows.push(refrow);
      } catch (e) {
        throw Error(
          `Failed with ${e} while writing ref: ${JSON.stringify(iref, null, 2)}`
        );
      }
    }
    return refrows;
  }
}
