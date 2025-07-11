import { writeFileSync } from "fs";
import { SiomeConverter } from "../src/converter";
import { PageView } from "../src/views/page";
import { Namespaces } from "../src/models/namespace";
import { NamespacesView } from "../src/views/namespaces";

const converter = new SiomeConverter("http://opcfoundation.org/UA/Weihenstephan/", "tests/resources/");
const nodes = converter.write()
const namespaces = new Namespaces(converter.specs.target_spec!);
const namespaces_view = new NamespacesView(namespaces)
const namespaces_str = namespaces_view.render();
let view = new PageView(nodes, namespaces_str)
writeFileSync("examples/parse_ws_out.html", view.render());