import { TableCell, TableRow, TextRun, Paragraph, convertMillimetersToTwip, WidthType, BorderStyle } from "docx";
import { Node } from "../models/node";

export class Table {
    node: Node;

    constructor(node: Node) {
        this.node = node;
    }

    write(): TableRow[] {
        const header = new Header().write();
        const top = new TopPartition(this.node).write();
        const main_header = new MainTableHeader().write();
        const rows = [header, ...top, main_header]
        return rows
    }
}

class Header {
    constructor() { }

    paragraph(text: string): Paragraph {
        return new Paragraph({
            children: [new TextRun({
                text: text,
                font: "Calibri",
                size: 16,
                bold: true,
            })]
        })
    }

    cell(text: string, width: number, span: number): TableCell {
        return new TableCell({
            width: {
                size: width,
                type: WidthType.PERCENTAGE
            },
            columnSpan: span,
            borders: {
                bottom: {
                    style: BorderStyle.DOUBLE,
                    size: 3
                }
            },
            margins: {
                top: convertMillimetersToTwip(0.0),
                bottom: convertMillimetersToTwip(0.0),
                left: convertMillimetersToTwip(1.9),
                right: convertMillimetersToTwip(1.9),
            },
            children: [this.paragraph(text)]
        })

    }

    write(): TableRow {
        return new TableRow({
            children: [
                this.cell("Attribute", 19, 1),
                this.cell("Value", 81, 5)
            ]
        })

    }
}

class TopPartition {
    node: Node;

    constructor(node: Node) {
        this.node = node;
    }

    paragraph(text: string): Paragraph {
        return new Paragraph({
            children: [new TextRun({
                text: text,
                font: "Calibri",
                size: 16,
                bold: false,
            })]
        })
    }

    cell(text: string, width: number, span: number): TableCell {
        return new TableCell({
            width: {
                size: width,
                type: WidthType.PERCENTAGE
            },
            columnSpan: span,
            borders: {
                bottom: {
                    style: BorderStyle.SINGLE,
                    size: 3
                }
            },
            margins: {
                top: convertMillimetersToTwip(0.0),
                bottom: convertMillimetersToTwip(0.0),
                left: convertMillimetersToTwip(1.9),
                right: convertMillimetersToTwip(1.9),
            },
            children: [this.paragraph(text)]
        })
    }

    write(): TableRow[] {
        const rows = [
            new TableRow({
                children: [
                    this.cell("BrowseName", 19, 1),
                    this.cell(this.node.browsename, 81, 5)
                ]
            }),
            new TableRow({
                children: [
                    this.cell("IsAbstract", 19, 1),
                    this.cell(this.node.isabstract, 81, 5)
                ]
            })
        ];
        return rows
    }
}

class MainTableHeader {
    constructor() { }

    paragraph(text: string): Paragraph {
        return new Paragraph({
            children: [new TextRun({
                text: text,
                font: "Calibri",
                size: 16,
                bold: true,
            })]
        })
    }

    cell(text: string, width: number): TableCell {
        return new TableCell({
            width: {
                size: width,
                type: WidthType.PERCENTAGE
            },
            borders: {
                bottom: {
                    style: BorderStyle.DOUBLE,
                    size: 3
                }
            },
            margins: {
                top: convertMillimetersToTwip(0.0),
                bottom: convertMillimetersToTwip(0.0),
                left: convertMillimetersToTwip(1.9),
                right: convertMillimetersToTwip(1.9),
            },
            children: [this.paragraph(text)]
        })
    }

    write(): TableRow {
        return new TableRow({
            children: [
                this.cell("References", 19),
                this.cell("Node Class", 12.7),
                this.cell("BrowseName", 23.8),
                this.cell("DataType", 14.3),
                this.cell("TypeDefinition", 20.6),
                this.cell("Other", 9.5)
            ]
        })
    }
}

export class RefRow {
    reftype: string;
    nodeclass: string;
    browsename: string;
    datatype: string;
    typedef: string;
    other: string;

    constructor(reftype: string, nodeclass: string, browsename: string, datatype: string, typedef: string, other: string) {
        this.reftype = reftype;
        this.nodeclass = nodeclass;
        this.browsename = browsename;
        this.datatype = datatype;
        this.typedef = typedef;
        this.other = other;
    }

    paragraph(text: string): Paragraph {
        return new Paragraph({
            children: [new TextRun({
                text: text,
                font: "Calibri",
                size: 16,
                bold: false,
            })]
        })
    }

    cell(text: string, width: number, span: number): TableCell {
        return new TableCell({
            width: {
                size: width,
                type: WidthType.PERCENTAGE
            },
            columnSpan: span,
            borders: {
                bottom: {
                    style: BorderStyle.SINGLE,
                    size: 3
                }
            },
            margins: {
                top: convertMillimetersToTwip(0.0),
                bottom: convertMillimetersToTwip(0.0),
                left: convertMillimetersToTwip(1.9),
                right: convertMillimetersToTwip(1.9),
            },
            children: [this.paragraph(text)]
        })
    }

    cell_subtype(): TableCell {
        return new TableCell({
            width: {
                size: 100,
                type: WidthType.PERCENTAGE
            },
            columnSpan: 6,
            borders: {
                bottom: {
                    style: BorderStyle.SINGLE,
                    size: 3
                }
            },
            margins: {
                top: convertMillimetersToTwip(0.0),
                bottom: convertMillimetersToTwip(0.0),
                left: convertMillimetersToTwip(1.9),
                right: convertMillimetersToTwip(1.9),
            },
            children: [this.paragraph("Subtype of " + this.browsename + " defined in TODO")]
        })
    }

    write(): TableRow {
        if (this.reftype === "HasSubtype") {
            return new TableRow({
                children: [
                    this.cell_subtype()
                ]
            })
        } else {
            return new TableRow({
                children: [
                    this.cell(this.reftype, 19, 1),
                    this.cell(this.nodeclass, 12.7, 1),
                    this.cell(this.browsename, 23.8, 1),
                    this.cell(this.datatype, 14.3, 1),
                    this.cell(this.typedef, 20.6, 1),
                    this.cell(this.other, 9.5, 1)
                ]
            })
        }
    }
}


function top_partition_index_paragraph(text: string) {
    return new Paragraph({
        children: [new TextRun({
            text: text,
            font: "Calibri",
            size: 16,
            bold: true,
        })]
    })
}

function top_partition_value_paragraph(text: string) {
    return new Paragraph({
        children: [new TextRun({
            text: text,
            font: "Calibri",
            size: 16,
            bold: true,
        })]
    })
}

export function top_partition_index_field(content: Paragraph) {
    return new TableCell({
        width: {
            size: 19,
            type: WidthType.PERCENTAGE
        },
        borders: {
            bottom: {
                style: BorderStyle.DOUBLE,
                size: 3
            }
        },
        margins: {
            top: convertMillimetersToTwip(0.0),
            bottom: convertMillimetersToTwip(0.0),
            left: convertMillimetersToTwip(1.9),
            right: convertMillimetersToTwip(1.9),
        },
        children: [content]
    })
}

export function top_partition_value_field(content: Paragraph) {
    return new TableCell({
        width: {
            size: 81,
            type: WidthType.PERCENTAGE
        },
        columnSpan: 5,
        borders: {
            bottom: {
                style: BorderStyle.DOUBLE,
                size: 3
            }
        },
        margins: {
            top: convertMillimetersToTwip(0.0),
            bottom: convertMillimetersToTwip(0.0),
            left: convertMillimetersToTwip(1.9),
            right: convertMillimetersToTwip(1.9),
        },
        children: [content]
    })
}

export function top_partition_row(index: string, value: string) {
    return new TableRow({
        children: [
            top_partition_index_field(top_partition_index_paragraph(index)),
            top_partition_value_field(top_partition_value_paragraph(value))
        ]
    })
}

export function main_table_col_names() {
    return new TableRow({
        children: [
            new TableCell({
                width: {
                    size: 19,
                    type: WidthType.PERCENTAGE
                },
                margins: {
                    top: convertMillimetersToTwip(0),
                    bottom: convertMillimetersToTwip(0),
                    left: convertMillimetersToTwip(1.9),
                    right: convertMillimetersToTwip(1.9),
                },
                borders: {
                    bottom: {
                        style: BorderStyle.DOUBLE,
                        size: 3,
                    }
                },
                children: [new Paragraph({
                    children: [new TextRun({
                        text: "References",
                        font: "Calibri",
                        size: 16,
                        bold: true,
                    })],
                })]
            }),
            new TableCell({
                width: {
                    size: 12.7,
                    type: WidthType.PERCENTAGE
                },
                margins: {
                    top: convertMillimetersToTwip(0),
                    bottom: convertMillimetersToTwip(0),
                    left: convertMillimetersToTwip(1.9),
                    right: convertMillimetersToTwip(1.9),
                },
                borders: {
                    bottom: {
                        style: BorderStyle.DOUBLE,
                        size: 3,
                    }
                },
                children: [new Paragraph({
                    children: [new TextRun({
                        text: "Node Class",
                        font: "Calibri", // Set the font to Calibri
                        size: 16, // Size 8 is represented as 16 half-points in docx (1 point = 2 half-points)
                        bold: true, // Set bold to true
                    })],
                })]
            }),
            new TableCell({
                width: {
                    size: 23.8,
                    type: WidthType.PERCENTAGE
                },
                margins: {
                    top: convertMillimetersToTwip(0),
                    bottom: convertMillimetersToTwip(0),
                    left: convertMillimetersToTwip(1.9),
                    right: convertMillimetersToTwip(1.9),
                },
                borders: {
                    bottom: {
                        style: BorderStyle.DOUBLE,
                        size: 3,
                    }
                },
                children: [new Paragraph({
                    children: [new TextRun({
                        text: "BrowseName",
                        font: "Calibri", // Set the font to Calibri
                        size: 16, // Size 8 is represented as 16 half-points in docx (1 point = 2 half-points)
                        bold: true, // Set bold to true
                    })],
                })]
            }),
            new TableCell({
                width: {
                    size: 14.3,
                    type: WidthType.PERCENTAGE
                },
                margins: {
                    top: convertMillimetersToTwip(0),
                    bottom: convertMillimetersToTwip(0),
                    left: convertMillimetersToTwip(1.9),
                    right: convertMillimetersToTwip(1.9),
                },
                borders: {
                    bottom: {
                        style: BorderStyle.DOUBLE,
                        size: 3,
                    }
                },
                children: [new Paragraph({
                    children: [new TextRun({
                        text: "DataType",
                        font: "Calibri", // Set the font to Calibri
                        size: 16, // Size 8 is represented as 16 half-points in docx (1 point = 2 half-points)
                        bold: true, // Set bold to true
                    })],
                })]
            }),
            new TableCell({
                width: {
                    size: 20.6,
                    type: WidthType.PERCENTAGE
                },
                margins: {
                    top: convertMillimetersToTwip(0),
                    bottom: convertMillimetersToTwip(0),
                    left: convertMillimetersToTwip(1.9),
                    right: convertMillimetersToTwip(1.9),
                },
                borders: {
                    bottom: {
                        style: BorderStyle.DOUBLE,
                        size: 3,
                    }
                },
                children: [new Paragraph({
                    children: [new TextRun({
                        text: "TypeDefinition",
                        font: "Calibri", // Set the font to Calibri
                        size: 16, // Size 8 is represented as 16 half-points in docx (1 point = 2 half-points)
                        bold: true, // Set bold to true
                    })],
                })]
            }),
            new TableCell({
                width: {
                    size: 9.5,
                    type: WidthType.PERCENTAGE
                },
                margins: {
                    top: convertMillimetersToTwip(0),
                    bottom: convertMillimetersToTwip(0),
                    left: convertMillimetersToTwip(1.9),
                    right: convertMillimetersToTwip(1.9),
                },
                borders: {
                    bottom: {
                        style: BorderStyle.DOUBLE,
                        size: 3,
                    }
                },
                children: [new Paragraph({
                    children: [new TextRun({
                        text: "Other",
                        font: "Calibri", // Set the font to Calibri
                        size: 16, // Size 8 is represented as 16 half-points in docx (1 point = 2 half-points)
                        bold: true, // Set bold to true
                    })],
                })]
            })
        ]
    })
};

function main_table_paragraph(text: string) {
    return new Paragraph({
        children: [new TextRun({
            text: text,
            font: "Calibri",
            size: 16,
            bold: false,
        })]
    })
}

export function main_table_row(ref: string, node_class: string, browsename: string, datatype: string, typedef: string, other: string) {
    return new TableRow({
        children: [
            new TableCell({
                width: {
                    size: 19,
                    type: WidthType.PERCENTAGE
                },
                margins: {
                    top: convertMillimetersToTwip(0),
                    bottom: convertMillimetersToTwip(0),
                    left: convertMillimetersToTwip(1.9),
                    right: convertMillimetersToTwip(1.9),
                },
                //children: [attributeDParagraph],
                children: [main_table_paragraph(ref)]
            }),
            new TableCell({
                width: {
                    size: 12.7,
                    type: WidthType.PERCENTAGE
                },
                margins: {
                    top: convertMillimetersToTwip(0),
                    bottom: convertMillimetersToTwip(0),
                    left: convertMillimetersToTwip(1.9),
                    right: convertMillimetersToTwip(1.9),
                },
                children: [main_table_paragraph(node_class)]
            }),
            new TableCell({
                width: {
                    size: 23.8,
                    type: WidthType.PERCENTAGE
                },
                margins: {
                    top: convertMillimetersToTwip(0),
                    bottom: convertMillimetersToTwip(0),
                    left: convertMillimetersToTwip(1.9),
                    right: convertMillimetersToTwip(1.9),
                },
                children: [new Paragraph({
                    children: [main_table_paragraph(browsename)],
                })]
            }),
            new TableCell({
                width: {
                    size: 14.3,
                    type: WidthType.PERCENTAGE
                },
                margins: {
                    top: convertMillimetersToTwip(0),
                    bottom: convertMillimetersToTwip(0),
                    left: convertMillimetersToTwip(1.9),
                    right: convertMillimetersToTwip(1.9),
                },
                children: [new Paragraph({
                    children: [main_table_paragraph(datatype)],
                })]
            }),
            new TableCell({
                width: {
                    size: 20.6,
                    type: WidthType.PERCENTAGE
                },
                margins: {
                    top: convertMillimetersToTwip(0),
                    bottom: convertMillimetersToTwip(0),
                    left: convertMillimetersToTwip(1.9),
                    right: convertMillimetersToTwip(1.9),
                },
                children: [new Paragraph({
                    children: [main_table_paragraph(typedef)],
                })]
            }),
            new TableCell({
                width: {
                    size: 9.5,
                    type: WidthType.PERCENTAGE
                },
                margins: {
                    top: convertMillimetersToTwip(0),
                    bottom: convertMillimetersToTwip(0),
                    left: convertMillimetersToTwip(1.9),
                    right: convertMillimetersToTwip(1.9),
                },
                children: [new Paragraph({
                    children: [main_table_paragraph(other)],
                })]
            })
        ]
    })
}

export function main_table_subtype_row(text: string) {
    return new TableRow({
        // height: {value: `0.25cm`, rule: HeightRule.ATLEAST},
        children: [
            new TableCell({
                width: {
                    size: 19,
                    type: WidthType.PERCENTAGE
                },
                margins: {
                    top: convertMillimetersToTwip(0),
                    bottom: convertMillimetersToTwip(0),
                    left: convertMillimetersToTwip(1.9),
                    right: convertMillimetersToTwip(1.9),
                },
                columnSpan: 6,
                //children: [attributeDParagraph],
                children: [new Paragraph({
                    children: [new TextRun({
                        text: text,
                        font: "Calibri", // Set the font to Calibri
                        size: 16, // Size 8 is represented as 16 half-points in docx (1 point = 2 half-points)
                        bold: false, // Set bold to true
                    })],
                })]
            })
        ]
    })
}

function top_partition_attribute_text(text: string) {
    return new Paragraph({
        children: [new TextRun({
            text: text,
            font: "Calibri",
            size: 16,
            bold: true,
        })]
    })
}

