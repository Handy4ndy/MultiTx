# XRPL MultiTx Demo

This is a simple web demonstration of sending multiple transactions on the XRPL Devnet, including a platform fee.

## Features
- Generates three accounts: User, Destination, Platform
- Sends user-specified amount from User to Destination
- Sends a platform fee (0.09 XRP) from User to Platform
- Displays account balances and transaction results
- Shows a Terms of Service popup explaining the platform fee

## Platform Fee Demonstration
For every transaction, a service fee of 0.09 XRP is sent to the platform provider. This mimics a real-world scenario where platforms charge a fee for facilitating payments.

## Usage
1. Open the app in your browser.
2. Click "Generate & Fund Accounts" to create and fund accounts.
3. Enter the amount to send and submit the transaction.
4. Review balances and transaction results.

## Technologies
- HTML, CSS, JavaScript
- [xrpl.js](https://github.com/XRPLF/xrpl.js) (client-side library)

## Disclaimer
This demo is for educational purposes only. Devnet tokens have no real value.
