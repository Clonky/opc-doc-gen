import { Namespace } from '../src/models/namespace';

describe('Namespace', () => {
    it('should create a namespace instance with valid properties', () => {
        const namespace = new Namespace('http://example.com', 1);
        expect(namespace.uri).toBe('http://example.com');
        expect(namespace.id).toBe(1);
    });

    it('should handle empty URI gracefully', () => {
        const namespace = new Namespace('', 0);
        expect(namespace.uri).toBe('');
        expect(namespace.id).toBe(0);
    });

    // Add more tests as needed to cover all functionality of Namespace
});