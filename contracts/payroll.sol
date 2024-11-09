/**
 * @title Payroll
 * @author Abhinav Pangaria
 * @dev A contract for managing payroll, allowing the owner to fund the contract, withdraw funds, and process payments to employees.
 * Inherits from ERC2771Context to support meta-transactions.
 * 
 * Error Messages:
 * - Payroll__NotTheOwnerOfTheContract: Thrown when a non-owner tries to execute an owner-only function.
 * - Payroll__NotEnoughAmountFunded: Thrown when the contract is not funded with enough amount.
 * - Payroll__ContractHasNoFunds: Thrown when trying to withdraw or process payment but the contract has no funds.
 * - Payroll__WithdrawFalied: Thrown when the withdrawal of funds fails.
 * - Payroll__PaymentTransferFalied: Thrown when the payment transfer to an employee fails.
 * 
 * Events:
 * - PaymentProcessed: Emitted when a payment is processed to an employee.
 * - ContractDeployed: Emitted when the contract is deployed.
 * - ContractFunded: Emitted when the contract is funded.
 * 
 * State Variables:
 * - i_owner: The immutable address of the contract owner.
 * - s_totalFunds: The total funds available in the contract.
 * 
 * Functions:
 * - constructor(address _trustedForwarder): Initializes the contract and sets the owner.
 * - receive(): External payable function to fund the contract.
 * - fallback(): External payable function to fund the contract.
 * - fundContract(): Public payable function to fund the contract.
 * - withdrawFunds(): Public function to withdraw all funds from the contract, only callable by the owner.
 * - processPayment(address _address, uint256 _amount): Public function to process payment to an employee, only callable by the owner.
 * - owner(): Public view function to get the address of the contract owner.
 * - getTotalFunds(): Public view function to get the total funds available in the contract.
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@gelatonetwork/relay-context/contracts/vendor/ERC2771Context.sol";

contract Payroll is ERC2771Context {
    // Error Messages.
    error Payroll__NotTheOwnerOfTheContract();
    error Payroll__NotEnoughAmountFunded();
    error Payroll__ContractHasNoFunds();
    error Payroll__WithdrawFalied();
    error Payroll__PaymentTransferFalied();

    // Events.
    event PaymentProcessed(address indexed _address, uint256 _amount);
    event ContractDeployed(address indexed _owner);
    event ContractFunded(address indexed _funder, uint256 _amount);

    // State Variables.
    address private immutable i_owner;
    uint256 private s_totalFunds;

    constructor(address _trustedForwarder) ERC2771Context(_trustedForwarder) {
        i_owner = _msgSender(); // Using _msgSender() instead of msg.sender
        emit ContractDeployed(i_owner);
    }

    receive() external payable {
        fundContract();
    }

    fallback() external payable {
        fundContract();
    }

    modifier onlyOwner() {
        if (_msgSender() != i_owner) {
            revert Payroll__NotTheOwnerOfTheContract();
        }
        _;
    }

    // Functions.
    function fundContract() public payable {
        emit ContractFunded(_msgSender(), msg.value);
        s_totalFunds += msg.value;
    }

    // Withdraw funds from the contract.
    function withdrawFunds() public onlyOwner {
        if (s_totalFunds == 0) {
            revert Payroll__ContractHasNoFunds();
        }
        (bool success,) = payable(i_owner).call{value: address(this).balance}("");
        if (!success) {
            revert Payroll__WithdrawFalied();
        }

        s_totalFunds = 0;
    }

    // Process payment to the employee.
    function processPayment(address _address, uint256 _amount) public onlyOwner {
        if (_amount > s_totalFunds) {
            revert Payroll__ContractHasNoFunds();
        }
        (bool success,) = _address.call{value: _amount}("");
        if (!success) {
            revert Payroll__PaymentTransferFalied();
        }
        emit PaymentProcessed(_address, _amount);
        s_totalFunds -= _amount;
    }

    // Getter Functions.
    function owner() public view returns (address) {
        return i_owner;
    }

    function getTotalFunds() public view returns (uint256) {
        return s_totalFunds;
    }
}
