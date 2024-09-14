interface Entry {
    getName(): string;
    getAttribute(name: string): { getValue(): string };
    getChildren(): Entry[];
}