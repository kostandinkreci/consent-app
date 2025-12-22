// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ConsentRegistry {
    struct Consent {
        address partyA;
        address partyB;
        bool active;
    }

    mapping(bytes32 => Consent) public consents;

    event ConsentCreated(bytes32 indexed id, address indexed partyA, address indexed partyB);
    event ConsentRevoked(bytes32 indexed id);

    function createConsent(bytes32 id, address partyA, address partyB) external returns (bool) {
        require(consents[id].partyA == address(0), "Consent already exists");
        consents[id] = Consent({
            partyA: partyA,
            partyB: partyB,
            active: true
        });

        emit ConsentCreated(id, partyA, partyB);
        return true;
    }

    function revokeConsent(bytes32 id) external returns (bool) {
        Consent storage consent = consents[id];
        require(consent.partyA != address(0), "Consent missing");
        require(consent.active, "Consent not active");

        consent.active = false;
        emit ConsentRevoked(id);
        return true;
    }
}
