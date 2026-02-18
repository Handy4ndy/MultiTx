
// XRPL MultiTx Demo Logic
let userWallet, destinationWallet, platformWallet, client;
const hardcodedPlatformAmountDrops = '90000'; // 0.09 XRP
const hardcodedPlatformFeeDrops = '1000'; // 0.001 XRP

// Shorten XRPL addresses for UI display
function trimAddress(addr) {
  if (!addr || typeof addr !== 'string' || addr.length < 10) return addr;
  return addr.slice(0, 4) + '...' + addr.slice(-5);
}

// Render account cards for User, Destination, Platform
function renderAccountCards(user, dest, plat) {
  return `
    <div class="accounts-cards">
      <div class="account-card">
        <div class="account-info">
          <b>User</b>
          <span>${trimAddress(user.address)}</span>
        </div>
        <div class="account-balance">${user.balance} XRP</div>
      </div>
      <div class="account-card">
        <div class="account-info">
          <b>Destination</b>
          <span>${trimAddress(dest.address)}</span>
        </div>
        <div class="account-balance">${dest.balance} XRP</div>
      </div>
      <div class="account-card">
        <div class="account-info">
          <b>Platform</b>
          <span>${trimAddress(plat.address)}</span>
        </div>
        <div class="account-balance">${plat.balance} XRP</div>
      </div>
    </div>
  `;
}

// Shorten transaction hashes for UI display
function trimHash(hash) {
  if (!hash || typeof hash !== 'string' || hash.length < 12) return hash;
  return hash.slice(0, 6) + '...' + hash.slice(-6);
}

// Render transaction result cards
function summarizeResult(result, label) {
  const res = result.result;
  const txHash = res.hash || (res.tx_json && res.tx_json.hash);
  const delivered = res.meta && res.meta.delivered_amount ? (parseInt(res.meta.delivered_amount) / 1000000) + ' XRP' : 'N/A';
  const dest = res.tx_json && res.tx_json.Destination ? trimAddress(res.tx_json.Destination) : 'N/A';
  const status = res.meta && res.meta.TransactionResult ? res.meta.TransactionResult : 'N/A';
  return `
    <div class="result-card">
      <b>${label}</b><br>
      Hash: ${trimHash(txHash)}<br>
      Delivered: ${delivered}<br>
      Destination: ${dest}<br>
      Status: ${status}<br>
    </div>
  `;
}

// Connect to XRPL Devnet
async function connectClient() {
  client = new xrpl.Client('wss://s.devnet.rippletest.net:51233');
  await client.connect();
}

// Handle account generation and funding
document.getElementById('generate').onclick = async () => {
  document.getElementById('results').innerHTML = 'Connecting to XRPL devnet...';
  await connectClient();

  userWallet = xrpl.Wallet.generate();
  destinationWallet = xrpl.Wallet.generate();
  platformWallet = xrpl.Wallet.generate();

  document.getElementById('results').innerHTML = 'Generated wallets. Funding...';

  const fundUser = await client.fundWallet(userWallet);
  const fundDest = await client.fundWallet(destinationWallet);
  const fundPlat = await client.fundWallet(platformWallet);

  document.getElementById('accounts').innerHTML = renderAccountCards(
    { address: userWallet.address, balance: fundUser.balance },
    { address: destinationWallet.address, balance: fundDest.balance },
    { address: platformWallet.address, balance: fundPlat.balance }
  );

  document.getElementById('results').innerHTML = 'Accounts funded. Enter amount to send from User to Destination.';
  document.getElementById('sendForm').style.display = 'block';
};

// Handle transaction form submission
document.getElementById('sendForm').onsubmit = async (e) => {
  e.preventDefault();
  const amountXRP = document.getElementById('amount').value;
  const amountDrops = (parseFloat(amountXRP) * 1000000).toString();

  document.getElementById('results').innerHTML = 'Preparing transactions...';

  // Get current sequence for userWallet
  const accountInfo = await client.request({
    command: 'account_info',
    account: userWallet.address,
    ledger_index: 'current',
  });
  let sequence = accountInfo.result.account_data.Sequence;

  // Transaction 1: user -> destination
  const tx1 = {
    TransactionType: 'Payment',
    Account: userWallet.address,
    Destination: destinationWallet.address,
    Amount: amountDrops,
    Sequence: sequence,
  };
  const prepared1 = await client.autofill(tx1);
  prepared1.Sequence = sequence;

  // Transaction 2: user -> platform
  const tx2 = {
    TransactionType: 'Payment',
    Account: userWallet.address,
    Destination: platformWallet.address,
    Amount: hardcodedPlatformAmountDrops,
    Fee: hardcodedPlatformFeeDrops,
    Sequence: sequence + 1,
  };
  const prepared2 = await client.autofill(tx2);
  prepared2.Sequence = sequence + 1;
  prepared2.Fee = hardcodedPlatformFeeDrops;

  // Sign and submit both transactions
  const signed1 = userWallet.sign(prepared1);
  const signed2 = userWallet.sign(prepared2);

  const result1 = await client.submitAndWait(signed1.tx_blob);
  const result2 = await client.submitAndWait(signed2.tx_blob);

  // Refresh account balances
  const balUser = await client.getXrpBalance(userWallet.address);
  const balDest = await client.getXrpBalance(destinationWallet.address);
  const balPlat = await client.getXrpBalance(platformWallet.address);

  document.getElementById('accounts').innerHTML = renderAccountCards(
    { address: userWallet.address, balance: balUser },
    { address: destinationWallet.address, balance: balDest },
    { address: platformWallet.address, balance: balPlat }
  );

  // Show transaction results
  document.getElementById('results').innerHTML = `
    <div class="results-cards">
      ${summarizeResult(result1, 'User → Destination')}
      ${summarizeResult(result2, 'User → Platform')}
    </div>
  `;
    // Set localStorage flag to activate easter egg for future attempts
    try {
      localStorage.setItem('multiTxEasterEgg', '1');
    } catch (e) {}
    if (window.activateMultiTxEasterEgg) {
      window.activateMultiTxEasterEgg();
    }
// On page load, clear the easter egg flag so user gets a fresh flow after reload
try {
  localStorage.removeItem('multiTxEasterEgg');
} catch (e) {}
};