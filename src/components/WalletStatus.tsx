import { useCurrentAccount, useCurrentWallet, useCurrentNetwork } from '@mysten/dapp-kit-react';

function WalletStatus() {
	const account = useCurrentAccount();
	const wallet = useCurrentWallet();
	const network = useCurrentNetwork();

	if (!account) {
		return <p>Connect your wallet to get started</p>;
	}

	return (
		<div>
			<p>Wallet: {wallet?.name}</p>
			<p>Address: {account.address}</p>
			<p>Network: {network}</p>
		</div>
	);
}

export default WalletStatus;