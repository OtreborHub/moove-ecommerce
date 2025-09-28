import TokenDTO from "./TokenDTO";

export default class CollectionDTO {
    address: string;
    name: string;
    symbol: string;
    totalSupply: number;
    owner: string;
    tokenIds: number;
    tokens: TokenDTO[] = [];
    active: boolean;

    constructor(address: string, name: string, symbol: string, tokenIds: number,  totalSupply: number, active: boolean, owner: string) {
        this.address = address;
        this.name = name;
        this.symbol = symbol;
        this.tokenIds = tokenIds;
        this.totalSupply = totalSupply;
        this.active = active;
        this.owner = owner;
    }   

    static emptyInstance(): CollectionDTO {
        return new CollectionDTO("", "", "", 0, 0, false, "");
    }
}

