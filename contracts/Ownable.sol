pragma solidity ^0.6.0;

contract Ownable{
    address payable _owner;
    constructor() public{
        _owner = msg.sender;
    }

    modifier onlyOwner(){
        require(isOwner() , "You are not owner");
        _;
    }
    
    function setOwner(address payable newOwner) public {
         _owner = newOwner;
    }
    function getOwner() public view returns(address){
        return _owner;
    }
    
    function isOwner() public view returns(bool){
        return msg.sender == _owner;
    }
}