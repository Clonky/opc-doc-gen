import { Paragraph } from "docx";

export class ImplementationNoteReader {
    notes: string[];
    extensions?: Element[];

    constructor(node_dom: Element) {
        const extensions_el = node_dom.querySelector("Extensions");
        if (extensions_el) {
            const notes = extensions_el.querySelectorAll("ImplementationNote");
            this.extensions = Array.from(notes);
            this.notes = Array.from(notes).map((ext) => {
                const note = ext.textContent?.trim();
                return note ? note : "";
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