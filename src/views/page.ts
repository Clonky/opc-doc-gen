import * as handlebars from "handlebars";

const template_str = `
<html>

<head>
    <link rel="stylesheet" type="text/css" href="../templates/style.css" />
    <title>Parser Output</title>
</head>
{{{nodes}}}
{{{namespaces}}}

</html>
`

export class PageView {
    nodes: string;
    namespaces: string;

    constructor(nodes: string, namespaces: string) {
        this.nodes = nodes;
        this.namespaces = namespaces;
    }

    render(): string {
        const template = handlebars.compile(template_str);
        return template(this)
    }
}