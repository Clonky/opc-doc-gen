"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const converter_1 = require("../src/converter");
const page_1 = require("../src/views/page");
const namespace_1 = require("../src/models/namespace");
const namespaces_1 = require("../src/views/namespaces");
const converter = new converter_1.Converter("http://opcfoundation.org/UA/Weihenstephan/", "tests/resources/");
const nodes = converter.write();
const namespaces = new namespace_1.Namespaces(converter.specs.target_spec);
const namespaces_view = new namespaces_1.NamespacesView(namespaces);
const namespaces_str = namespaces_view.render();
let view = new page_1.PageView(nodes, namespaces_str);
(0, fs_1.writeFileSync)("examples/parse_ws_out.html", view.render());
//# sourceMappingURL=parse_ws.js.map