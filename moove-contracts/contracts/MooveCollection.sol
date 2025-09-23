// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";


contract MooveCollection is ERC721URIStorage, Ownable, ReentrancyGuard {

    uint256 public maxSupply;
    uint256 public creationFee;

    enum AuctionType { Classic, Dutch, English }

    struct Auction {
        AuctionType auctionType;
        uint256 tokenId;
        address seller;
        uint256 startTime;
        uint256 endTime;
        uint256 startPrice;
        uint256 currentPrice;
        uint256 minIncrement; // for English auction
        address highestBidder;
        uint256 highestBid;
        bool ended;
        mapping(address => uint256) bids; // for refunds
    }

    mapping(uint256 => Auction) public auctions;
    uint256 public _tokenIds; //Rideployare per avere a disposizione
    mapping(uint256 => uint256) public tokenPrices;
    bool public active = true; //Rideployare per avere a disposizione

    event AuctionCreated(uint256 indexed tokenId, AuctionType auctionType, uint256 startPrice, uint256 endTime);
    event BidPlaced(uint256 indexed tokenId, address bidder, uint256 amount);
    event AuctionEnded(uint256 indexed tokenId, address winner, uint256 amount);

    constructor(string memory name, string memory symbol, address initialOwner)
        Ownable(initialOwner)
        ERC721(name, symbol)
    {
        maxSupply = 10;
        creationFee = 0; 
    }
    
    //Rideployare per avere a disposizione
    modifier isActive() {
        require(active, "Collection is not active");
        _;
    }

    function disableCollection() public onlyOwner(){
        active = false;
    }

    function mintNFT(string memory tokenURI, uint256 price) public isActive onlyOwner payable returns (uint256) {
        require(msg.value == creationFee, "Incorrect creation fee");
        require(_tokenIds < maxSupply, "Max supply reached");

        _tokenIds++;
        _mint(msg.sender, _tokenIds);
        _setTokenURI(_tokenIds, tokenURI);
        tokenPrices[_tokenIds] = price;

        return _tokenIds;
    }

    function transfer(address to, uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Caller is not the owner of the token");
        _transfer(msg.sender, to, tokenId);
    }

    function setTokenPrice(uint256 tokenId, uint256 price) public onlyOwner {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        require(msg.sender == ownerOf(tokenId), "Can set price only for owned tokens");
        tokenPrices[tokenId] = price;
    }

    function buyNFT(uint256 tokenId) isActive public payable {
        require(msg.value == tokenPrices[tokenId], "Incorrect price");
        require(ownerOf(tokenId) != address(0), "Token does not exist");

        address seller = ownerOf(tokenId);
        _transfer(seller, msg.sender, tokenId);
        payable(seller).transfer(msg.value);
    }

    function createAuction(
    uint256 tokenId,
    uint8 auctionTypeNum, // 0: Classic, 1: Dutch, 2: English
    uint256 startPrice,
    uint256 duration,
    uint256 minIncrement // only for English
    ) public {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(auctions[tokenId].endTime == 0, "Auction already exists");

        Auction storage auction = auctions[tokenId];
        auction.auctionType = AuctionType(auctionTypeNum);
        auction.tokenId = tokenId;
        auction.seller = msg.sender;
        auction.startTime = block.timestamp;
        auction.endTime = block.timestamp + duration;
        auction.startPrice = startPrice;
        auction.currentPrice = startPrice;
        auction.minIncrement = minIncrement;
        auction.highestBidder = address(0);
        auction.highestBid = 0;
        auction.ended = false;

        emit AuctionCreated(tokenId, auction.auctionType, startPrice, auction.endTime);
    }

    // --- CLASSIC AUCTION ---

    function placeBidClassic(uint256 tokenId) public payable nonReentrant{
        Auction storage auction = auctions[tokenId];
        require(auction.auctionType == AuctionType.Classic, "Not classic auction");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value > auction.bids[msg.sender], "Bid not higher than previous");

        auction.bids[msg.sender] += msg.value;
        if (auction.bids[msg.sender] > auction.highestBid) {
            auction.highestBid = auction.bids[msg.sender];
            auction.highestBidder = msg.sender;
        }
        emit BidPlaced(tokenId, msg.sender, auction.bids[msg.sender]);
    }

    function endClassicAuction(uint256 tokenId) public nonReentrant{
        Auction storage auction = auctions[tokenId];
        require(auction.auctionType == AuctionType.Classic, "Not classic auction");
        require(block.timestamp >= auction.endTime, "Auction not ended");
        require(!auction.ended, "Already ended");

        auction.ended = true;
        if (auction.highestBidder != address(0)) {
            _transfer(auction.seller, auction.highestBidder, tokenId);
            payable(auction.seller).transfer(auction.highestBid);
        }
        // Refund all except winner
        for (uint i = 0; i < 10; i++) { /* Pseudocode: serve off-chain per lista offerenti */
            // address bidder = ...;
            // if (bidder != auction.highestBidder) payable(bidder).transfer(auction.bids[bidder]);
        }
        emit AuctionEnded(tokenId, auction.highestBidder, auction.highestBid);
    }

    // --- DUTCH AUCTION ---
    function getCurrentDutchPrice(uint256 tokenId) public view returns (uint256)  {
        Auction storage auction = auctions[tokenId];
        require(auction.auctionType == AuctionType.Dutch, "Not dutch auction");
        uint256 elapsed = block.timestamp > auction.startTime ? block.timestamp - auction.startTime : 0;
        uint256 duration =   auction.endTime - auction.startTime;
        if (elapsed >= duration) return 0;
        return auction.startPrice * (duration - elapsed) / duration;
    }

    function buyDutch(uint256 tokenId) public payable nonReentrant{
        Auction storage auction = auctions[tokenId];
        require(auction.auctionType == AuctionType.Dutch, "Not dutch auction");
        require(block.timestamp < auction.endTime, "Auction ended");
        uint256 price = getCurrentDutchPrice(tokenId);
        require(msg.value >= price, "Insufficient payment");
        require(!auction.ended, "Already ended");

        auction.ended = true;
        _transfer(auction.seller, msg.sender, tokenId);
        payable(auction.seller).transfer(msg.value);
        emit AuctionEnded(tokenId, msg.sender, msg.value);
    }

    // --- ENGLISH AUCTION ---

    function placeBidEnglish(uint256 tokenId) public payable nonReentrant{
        Auction storage auction = auctions[tokenId];
        require(auction.auctionType == AuctionType.English, "Not english auction");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value >= auction.currentPrice + auction.minIncrement, "Bid too low");

        if (auction.highestBidder != address(0)) {
            // Refund previous highest
            payable(auction.highestBidder).transfer(auction.highestBid);
        }
        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;
        auction.currentPrice = msg.value;
        // Optionally extend auction time if bid is near end
        if (auction.endTime - block.timestamp < 5 minutes) {
            auction.endTime += 5 minutes;
        }
        emit BidPlaced(tokenId, msg.sender, msg.value);
    }

    function endEnglishAuction(uint256 tokenId) public nonReentrant{
        Auction storage auction = auctions[tokenId];
        require(auction.auctionType == AuctionType.English, "Not english auction");
        require(block.timestamp >= auction.endTime, "Auction not ended");
        require(!auction.ended, "Already ended");

        auction.ended = true;
        if (auction.highestBidder != address(0)) {
            _transfer(auction.seller, auction.highestBidder, tokenId);
            payable(auction.seller).transfer(auction.highestBid);
        }
        emit AuctionEnded(tokenId, auction.highestBidder, auction.highestBid);
    }

    //Valutare l'utilizzo invece di reinviare i soldi ai partecipanti dell'asta che non hanno vinto
    /*mapping(address => uint256) public pendingReturns;
    function withdraw() public {
        uint256 amount = pendingReturns[msg.sender];
        require(amount > 0, "Nothing to withdraw");
        pendingReturns[msg.sender] = 0;
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send Ether");
        emit RefundWithdrawn(msg.sender, amount);
    }*/
}
