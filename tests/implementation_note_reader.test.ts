import { ImplementationNoteReader } from "../src/models/readers/implementation_note_rw";
import { JSDOM } from "jsdom";

const node = `
<Node>
    <Extensions>
        <Extension>
            <uawsbasis:ImplementationNote>Test note 1 </ImplementationNote>
        </Extension>
        <Extension>
            <uawsbasis:ImplementationNote>Test note 2 </ImplementationNote>
        </Extension>
    </Extensions>
</Node>;
`

describe("Test implementation note reader", () => {
    test("Assert right number of extensions", () => {
        const dom = new JSDOM(node);
        const reader = new ImplementationNoteReader(dom.window.document.querySelector("Node") as Element);
        expect(reader.extensions?.length).toBe(2);
    }),
        test("Read implementation notes from node", async () => {
            const dom = new JSDOM(node);
            const reader = new ImplementationNoteReader(dom.window.document.querySelector("Node") as Element);
            expect(reader.notes).toEqual(["Test note 1", "Test note 2"]);
        });
});

describe("Test implementation note writer", () => {
    test("Right number of paragraphs.", async () => {
        const dom = new JSDOM(node);
        const reader = new ImplementationNoteReader(dom.window.document.querySelector("Node") as Element);
        const paragraphs = reader.write();
        expect(paragraphs.length).toBe(2);
    });
});