import { DAppKitProvider } from '@mysten/dapp-kit-react';
import { ConnectButton } from '@mysten/dapp-kit-react/ui';
import { dAppKit } from './dapp-kit';
import WalletStatus from './components/WalletStatus';
import GreetingManager from './components/GreetingManager';

export default function App() {
	return (
		<DAppKitProvider dAppKit={dAppKit}>
			<div className='min-h-screen bg-slate-100 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-100'>
				<div className='mx-auto max-w-3xl'>
					<h1 className='text-3xl font-bold tracking-tight'>ITC Hello Sui dApp</h1>
					<p className='mt-1 text-sm text-slate-600 dark:text-slate-300'>
						Create and update shared Greeting object on Sui testnet.
					</p>
					<div className='mt-4'>
						<ConnectButton />
					</div>
				</div>
				<div className='mx-auto mt-4 max-w-3xl'>
				<WalletStatus />
				<GreetingManager />
				</div>
			</div>
		</DAppKitProvider>
	);
}