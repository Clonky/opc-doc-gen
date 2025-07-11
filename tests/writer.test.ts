import { DocWriter } from '../src/writers/writer';
import { Node } from '../src/models/node';
import { CompanionSpecification } from '../src/models/companion_specification';
import { Document, Packer, HeadingLevel, SectionType, WidthType, BorderStyle } from 'docx';

jest.mock('docx', () => {
    const mockParagraph = jest.fn().mockImplementation(function (options = {}) {
        return { type: 'paragraph', ...options };
    });

    const mockTable = jest.fn().mockImplementation(function (options = {}) {
        return { type: 'table', ...options };
    });

    const mockTableRow = jest.fn().mockImplementation(function (options = {}) {
        return { type: 'table-row', ...options };
    });

    const mockTableCell = jest.fn().mockImplementation(function (options = {}) {
        return { type: 'table-cell', ...options };
    });

    const mockTextRun = jest.fn().mockImplementation(function (options = {}) {
        return { type: 'text-run', ...options };
    });

    const mockDocument = jest.fn().mockImplementation(function (options = {}) {
        return {
            ...options,
            sections: options.sections || [],
            Paragraph: mockParagraph,
            Table: mockTable,
            TableRow: mockTableRow,
            TableCell: mockTableCell,
            TextRun: mockTextRun
        };
    });

    return {
        Document: mockDocument,
        Paragraph: mockParagraph,
        Table: mockTable,
        TableRow: mockTableRow,
        TableCell: mockTableCell,
        TextRun: mockTextRun,
        TableOfContents: jest.fn().mockImplementation(function (options = {}) {
            return { type: 'table-of-contents', ...options };
        }),
        SimpleField: jest.fn().mockImplementation(function (options = {}) {
            return { type: 'simple-field', ...options };
        }),
        Packer: {
            toBlob: jest.fn()
        },
        HeadingLevel: { HEADING_1: 'HEADING_1', HEADING_2: 'HEADING_2' },
        SectionType: { CONTINUOUS: 'CONTINUOUS' },
        WidthType: { PERCENTAGE: 'PERCENTAGE' },
        BorderStyle: {
            SINGLE: 'single',
            DOUBLE: 'double',
            NONE: 'none'
        },
        convertMillimetersToTwip: jest.fn().mockImplementation((mm) => mm * 56.7) // Approximate conversion: 1mm ≈ 56.7 twips
    };
});

describe('DocWriter', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (Packer.toBlob as jest.Mock).mockResolvedValue('mockBlob');
    });

    it('should create a DocWriter instance with valid nodes and target_spec', () => {
        const mockNodes = [
            createMockNode('Node1'),
            createMockNode('Node2')
        ] as Node[];
        const mockSpec = {
            get_namespaces: jest.fn().mockReturnValue(['Namespace1', 'Namespace2']),
            get_model_uri: jest.fn().mockReturnValue('http://test.org/UA/Mock/'),
            get_uri_by_ns_id: jest.fn().mockReturnValue('http://test.org/UA/Mock/'),
            lookup: jest.fn(),
            get_browsename: jest.fn().mockReturnValue('MockNode')
        } as unknown as CompanionSpecification;

        const writer = new DocWriter(mockNodes, mockSpec);

        expect(writer.nodes).toEqual(mockNodes);
        expect(writer.target_spec).toBe(mockSpec);
    });

    it('should throw an error if nodes are malformed', () => {
        const mockNodes = [{ invalidProp: 'Invalid' }] as unknown as Node[];
        const mockSpec = { get_namespaces: jest.fn() } as unknown as CompanionSpecification;

        expect(() => new DocWriter(mockNodes, mockSpec)).toThrowError('Some nodes passed to the writer were malformed');
    });

    it('should call docx.Packer.toBlob when write is invoked', async () => {
        const mockNodes = [createMockNode('Node1')] as Node[];
        const mockSpec = {
            get_namespaces: jest.fn().mockReturnValue(['Namespace1']),
            get_model_uri: jest.fn().mockReturnValue('http://test.org/UA/Mock/'),
            get_uri_by_ns_id: jest.fn().mockReturnValue('http://test.org/UA/Mock/'),
            lookup: jest.fn()
        } as unknown as CompanionSpecification;

        const writer = new DocWriter(mockNodes, mockSpec);
        const result = await writer.write();

        expect(Packer.toBlob).toHaveBeenCalledWith(writer.doc);
        expect(result).toBe('mockBlob');
        expect(writer.doc).toBeDefined();
    });
});

function createMockNode(name: string): Node {
    return {
        browsename: name,
        description: 'Test Node',
        isabstract: 'false',
        nodeclass: 'Object',
        dtype: '',
        modellingrule: '',
        nodeid: {
            prefix: 0,
            suffix: '1'
        },
        references: {
            refs: [
                {
                    reftype: 'HasTypeDefinition',
                    nodeid: { prefix: 0, suffix: '58' },
                    issubtype: false,
                    trace: [{
                        node: {
                            browsename: 'BaseObjectType',
                            nodeclass: 'ObjectType',
                            dtype: '',
                            modellingrule: '',
                            references: { refs: [] }
                        },
                        parent_nodeset: {
                            get_model_uri: () => 'http://test.org/UA/Mock/',
                            get_uri_by_ns_id: () => 'http://test.org/UA/Mock/'
                        }
                    }]
                }
            ],
            get_typedef: () => ({
                reftype: 'HasTypeDefinition',
                nodeid: { prefix: 0, suffix: '58' },
                issubtype: false
            })
        },
    } as unknown as Node;
}