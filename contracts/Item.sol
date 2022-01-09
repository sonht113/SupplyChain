pragma solidity ^0.6.0;

import "./ItemManager.sol";
contract Item {

    uint public priceInWei;
    uint public pricePaid;
    uint public index;
    address public addressOwner;
    ItemManager parentContract;

    constructor(ItemManager _parentContract, uint _priceInWei, uint _index, address _addressOwner) public {
        priceInWei = _priceInWei;
        index = _index;
        parentContract = _parentContract;
        addressOwner = _addressOwner;
    }

    receive() external payable{
        require(pricePaid == 0, "Item is paid a already");
        require(priceInWei == msg.value, "Only full payments allowed");
        pricePaid = msg.value;

        (bool success,)=address(parentContract).call.value(msg.value)(abi.encodeWithSignature("triggerPayment(uint256)", index));
        require(success, "The transaction wasn't successful, cancelling");
    }

    fallback() external{

    }
}