// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SupplyChain {
    struct Record {
        string hash;
        uint256 timestamp;
        address sender;
    }
    
    mapping(string => Record) public records;
    
    event RecordAnchored(
        string indexed batchId,
        string hash,
        uint256 timestamp,
        address sender
    );
    
    function anchorRecord(string memory batchId, string memory hash) public {
        require(bytes(batchId).length > 0, "Batch ID cannot be empty");
        require(bytes(hash).length > 0, "Hash cannot be empty");
        
        records[batchId] = Record({
            hash: hash,
            timestamp: block.timestamp,
            sender: msg.sender
        });
        
        emit RecordAnchored(batchId, hash, block.timestamp, msg.sender);
    }
    
    function getRecord(string memory batchId) public view returns (
        string memory hash,
        uint256 timestamp,
        address sender
    ) {
        Record memory record = records[batchId];
        return (record.hash, record.timestamp, record.sender);
    }
    
    function recordExists(string memory batchId) public view returns (bool) {
        return records[batchId].timestamp > 0;
    }
}
