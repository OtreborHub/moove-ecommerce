
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./MooveCollection.sol";

contract MooveFactory is Ownable{
    address[] private collections;
    mapping(address => bool) private admins;

    event CollectionCreated(address indexed collection, string name, string symbol);

    constructor() Ownable(msg.sender) {
        admins[msg.sender] = true;
    }

    function createCollection(string memory name, string memory symbol) public onlyOwner returns (address) {
        MooveCollection collection = new MooveCollection(name, symbol, msg.sender);
        collections.push(address(collection));
        emit CollectionCreated(address(collection), name, symbol);
        return address(collection);
    }

    function getCollections() public view returns (address[] memory) {
        return collections;
    }

    function addAdmin(address admin) public onlyOwner {
        admins[admin] = true;
    }

    function removeAdmin(address admin) public onlyOwner {
        admins[admin] = false;
    }

    function isAdmin() public view returns (bool) {
        return admins[msg.sender];
    }
}