import AuctionDTO from "../DTO/AuctionDTO";

export enum AuctionStatus {
    OPEN = "Open",
    CLOSED = "Closed",
    WAITING_FOR_SELLER = "Waiting for seller",
    NONE = ""
}

export enum AuctionType {
    CLASSIC = 0,
    DUTCH = 1,
    ENGLISH = 2
}

export function getAuctionTypeDescription(auctionType: AuctionType){
    switch(auctionType){
        case AuctionType.CLASSIC:
            return "Classic";
        case AuctionType.DUTCH:
            return "Dutch";
        case AuctionType.ENGLISH:
            return "English";
    }
}

export function getAuctionStatus(auction: AuctionDTO){
    if(!auction.ended && Math.floor(Date.now() / 1000) >= auction.endTime){
        return (AuctionStatus.WAITING_FOR_SELLER);
    } else if (auction.ended) {
        return (AuctionStatus.CLOSED);
    } else {
        return (AuctionStatus.OPEN);
    }
}
