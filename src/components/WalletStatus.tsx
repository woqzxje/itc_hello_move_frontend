import { useCurrentAccount, useCurrentWallet, useCurrentNetwork } from '@mysten/dapp-kit-react';

function WalletStatus() {
	const account = useCurrentAccount();
	const wallet = useCurrentWallet();
	const network = useCurrentNetwork();

	if (!account) {
		return (
			<p className='mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300'>
				Connect your wallet to get started.
			</p>
		);
	}

	return (
		<div className='mt-3 grid gap-1 rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900'>
			<p>
				<span className='font-medium'>Wallet:</span> {wallet?.name}
			</p>
			<p className='break-all'>
				<span className='font-medium'>Address:</span> {account.address}
			</p>
			<p>
				<span className='font-medium'>Network:</span> {network}
			</p>
		</div>
	);
}

export default WalletStatus;