import { Paragraph } from "docx";

export class ImplementationNoteReader {
    notes: string[];
    extensions?: Element[];

    constructor(node_dom: Element) {
        const extensions_el = node_dom.querySelector("Extensions");
        this.notes = [];
        if (extensions_el) {
            const extension = Array.from(extensions_el.querySelectorAll('Extension'));
            this.extensions = extension;
            extension.forEach((ext) => {
                this.notes.push(ext.textContent?.trim() ?? "");
            });
        }
    }

    read(): string[] {
        return this.notes;
    }

    write(): Paragraph[] {
        let paragraphs: Paragraph[] = [];
        for (const note of this.notes) {
            if (note.trim() !== "") {
                paragraphs.push(new Paragraph({
                    text: note,
                }));
            }
        }
        return paragraphs;
    }
}