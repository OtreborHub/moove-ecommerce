export default class TokenDTO {
    id: number;
    URI: string;
    price: number;
    owner: string;

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