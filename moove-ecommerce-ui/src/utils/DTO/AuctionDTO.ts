import CollectionDTO from "./CollectionDTO";

export default class AuctionDTO {
    tokenId: number;
    auctionType: number;
    seller: string;
    startTime: number;
    endTime: number;
    startPrice: number;
    currentPrice: number;
    minIncrement: number;
    highestBidder: string;
    highestBid: number;
    ended: boolean;
    bids: string[];
    collection: CollectionDTO = CollectionDTO.emptyInstance();

    constructor(
        tokenId: number,
        auctionType: number, 
        seller: string, 
        startTime: number, 
        endTime: number, 
        startPrice: number,
        minIncrement: number,
        highestBidder: string,
        highestBid: number,
        ended: boolean) {
            this.tokenId = tokenId;
            this.auctionType = auctionType;
            this.seller = seller;
            this.startTime = startTime;
            this.endTime = endTime;
            this.startPrice = startPrice;
            this.currentPrice = startPrice;
            this.minIncrement = minIncrement;
            this.highestBidder = highestBidder;
            this.highestBid = highestBid;
            this.ended = ended;
            this.bids = [];
    }
    
    static emptyInstance(): AuctionDTO {
        return new AuctionDTO(0, 0, "", 0, 0, 0, 0, "", 0, true);
    }
}