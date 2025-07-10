import { Paragraph } from "docx";

export class ImplementationNoteReader {
    notes: string[];
    extensions?: Element[];

    constructor(node_dom: Element) {
        const extensions_el = node_dom.querySelector("Extensions");
        if (extensions_el) {
            const extension = Array.from(extensions_el.querySelectorAll('Extension'));
            this.extensions = extension;
            this.notes = extension.map((ext) => {
                return ext.textContent?.trim() ?? "";
            });
        }
    }

    read(): string[] {
        return this.notes;
    }

    write(): Paragraph[] {
        const paragraphs: Paragraph[] = [];
        if (this.extensions && this.extensions.length > 0) {
            for (const note of this.notes) {
                paragraphs.push(new Paragraph({
                    text: note,
                }));
            }
        }
        return paragraphs;
    }
}