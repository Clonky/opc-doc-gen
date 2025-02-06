import { ICompanionSpecification } from "./companion_specification";

interface INamespace {
    uri: string;
    id: number;
}

export class Namespace implements INamespace {
    uri: string;
    id: number;

    constructor(uri: string, id: number) {
        this.uri = uri;
        this.id = id;
    }
}

interface INamespaces {
    namespaces: INamespace[];
}

export class Namespaces implements INamespaces {
    namespaces: INamespace[];

    constructor(comp_spec: ICompanionSpecification) {
        const namespaces = comp_spec.get_namespaces();
        const namespace_objs = namespaces.map((uri, idx) => new Namespace(uri, idx))
        this.namespaces = namespace_objs;
    }
}