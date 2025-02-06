import { Namespaces } from "../models/namespace";
import * as handlebars from "handlebars"


const template_str: string = `
    < section id = "namespaces" >
        <h2>Namespaces used in this Document </h2>
            < table >
            <thead>
            <tr>
            <th>NamespaceURI </th>
            < th > Namespace Index </th>
                < th > Example </th>
                </tr>
                <tbody>
{ { #each namespaces } }
<tr>
    <td>{{ this.uri }}</td>
        < td > {{ this.id }}</td>
            < td > {{ this.id }}: Example </td>
                </tr>
{ {/each } }
</tbody>
    </thead>
    </table>
    </section>
`;

export class NamespacesView {
    namespace_obj: Namespaces;

    constructor(ns: Namespaces) {
        this.namespace_obj = ns;
    }

    render(): string {
        const template = handlebars.compile(template_str);
        return template(this.namespace_obj);
    }
}