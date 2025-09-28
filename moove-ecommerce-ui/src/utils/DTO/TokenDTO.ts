import AuctionDTO from "./AuctionDTO";

interface Metadata {
    name: string;
    cid: string;
    attributes: Array<{
        type: string;
        color: string;
        backgroundColor: string;
    }>;
}

export default class TokenDTO {
    id: number;
    URI: string;
    price: number;
    owner: string;
    auction: AuctionDTO = AuctionDTO.emptyInstance();
    imageCid?: string;
    metadata?: Metadata;

    constructor(id: number, URI: string, price: number, owner: string) {
        this.id = id;
        this.URI = URI;
        this.price = price;
        this.owner = owner;
    }
    
    static emptyInstance(): TokenDTO {
        return new TokenDTO(0, "", 0, "");
    }

}