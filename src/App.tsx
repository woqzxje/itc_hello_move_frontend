import { DAppKitProvider } from '@mysten/dapp-kit-react';
import { ConnectButton } from '@mysten/dapp-kit-react/ui';
import { dAppKit } from './dapp-kit';
import WalletStatus from './components/WalletStatus';

export default function App() {
	return (
		<DAppKitProvider dAppKit={dAppKit}>
			<div>
				<h1>My Sui dApp</h1>
				<ConnectButton />
				<WalletStatus />
			</div>
		</DAppKitProvider>
	);
}