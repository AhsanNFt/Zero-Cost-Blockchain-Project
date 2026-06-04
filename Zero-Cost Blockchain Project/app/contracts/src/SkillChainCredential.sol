// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SkillChainCredential is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    struct Credential {
        address issuer;
        string metadataURI;
        uint8 credType;
        uint256 issueTimestamp;
        bool isRevoked;
    }

    mapping(uint256 => Credential) public credentials;
    mapping(address => bool) public authorizedIssuers;
    
    // Mapping from owner to list of owned token IDs
    mapping(address => uint256[]) private _ownedTokens;

    event IssuerAuthorized(address issuer, string institution);
    event IssuerDeauthorized(address issuer);
    event CredentialIssued(uint256 tokenId, address recipient, address issuer, uint8 credType, uint256 timestamp);
    event CredentialRevoked(uint256 tokenId, address revokedBy, uint256 timestamp);

    constructor() ERC721("SkillChain Credential", "SCC") Ownable(msg.sender) {
        // Contract deployer is automatically an authorized issuer
        authorizedIssuers[msg.sender] = true;
    }

    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Not an authorized issuer");
        _;
    }

    function authorizeIssuer(address issuer, string calldata institution) external onlyOwner {
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer, institution);
    }

    function deauthorizeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = false;
        emit IssuerDeauthorized(issuer);
    }

    function issueCredential(address recipient, string calldata metadataURI, uint8 credType) external onlyAuthorizedIssuer returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, metadataURI);

        credentials[tokenId] = Credential({
            issuer: msg.sender,
            metadataURI: metadataURI,
            credType: credType,
            issueTimestamp: block.timestamp,
            isRevoked: false
        });

        _ownedTokens[recipient].push(tokenId);

        emit CredentialIssued(tokenId, recipient, msg.sender, credType, block.timestamp);
        return tokenId;
    }

    function revokeCredential(uint256 tokenId) external {
        require(_ownerOf(tokenId) != address(0), "Credential does not exist");
        require(msg.sender == owner() || msg.sender == credentials[tokenId].issuer, "Only admin or issuer can revoke");
        require(!credentials[tokenId].isRevoked, "Already revoked");

        credentials[tokenId].isRevoked = true;
        emit CredentialRevoked(tokenId, msg.sender, block.timestamp);
    }

    function verifyCredential(uint256 tokenId) external view returns (
        address issuer,
        string memory metadataURI,
        uint8 credType,
        uint256 issueTimestamp,
        bool isRevoked,
        address ownerAddress
    ) {
        require(_ownerOf(tokenId) != address(0), "Credential does not exist");
        Credential memory cred = credentials[tokenId];
        
        return (
            cred.issuer,
            cred.metadataURI,
            cred.credType,
            cred.issueTimestamp,
            cred.isRevoked,
            ownerOf(tokenId)
        );
    }

    function getCredentialsByOwner(address tokenOwner) external view returns (uint256[] memory) {
        return _ownedTokens[tokenOwner];
    }

    function totalIssued() external view returns (uint256) {
        return _nextTokenId;
    }

    // Optional: Make it soulbound (non-transferable) by reverting transfers
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = super._update(to, tokenId, auth);
        
        // Allow minting (from == 0) and burning (to == 0), but block transfers
        require(from == address(0) || to == address(0), "Credentials cannot be transferred");
        
        return from;
    }
}
