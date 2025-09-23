import TokenDTO from "./TokenDTO";

export default class CollectionDTO {
    address: string;
    name: string;
    symbol: string;
    totalSupply: number;
    owner: string;
    tokens: TokenDTO[] = [];

    constructor(address: string, name: string, symbol: string, totalSupply: number, owner: string) {
        this.address = address;
        this.name = name;
        this.symbol = symbol;
        this.totalSupply = totalSupply;
        this.owner = owner;
    }   

    static emptyInstance(): CollectionDTO {
        return new CollectionDTO("", "", "", 0, "");
    }
}

