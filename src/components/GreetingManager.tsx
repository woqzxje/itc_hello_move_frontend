import { useState } from 'react';
import { useCurrentAccount, useCurrentClient, useCurrentNetwork, useDAppKit } from '@mysten/dapp-kit-react';
import {
	buildNewGreetingTransaction,
	buildUpdateGreetingTransaction,
	getCreatedGreetingObjectId,
	getFailedTransactionError,
	getTransactionDigest,
	type TransactionResultLike,
} from '../lib/greetingContract';

type StatusTone = 'idle' | 'success' | 'error';

function getGreetingTextFromObjectResponse(response: unknown): string | null {
	const json = (response as { object?: { json?: { text?: string } } })?.object?.json;
	const text = json?.text;
	return typeof text === 'string' ? text : null;
}

export default function GreetingManager() {
	const account = useCurrentAccount();
	const currentNetwork = useCurrentNetwork();
	const client = useCurrentClient();
	const dAppKit = useDAppKit();

	const [greetingObjectId, setGreetingObjectId] = useState('');
	const [newText, setNewText] = useState('Xin chao ITC!');
	const [currentGreetingText, setCurrentGreetingText] = useState<string | null>(null);
	const [lastDigest, setLastDigest] = useState<string | null>(null);
	const [statusMessage, setStatusMessage] = useState('Connect wallet, then create a shared Greeting.');
	const [statusTone, setStatusTone] = useState<StatusTone>('idle');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isReadingObject, setIsReadingObject] = useState(false);

	const isConnected = Boolean(account);
	const isWrongNetwork = currentNetwork !== 'testnet';
	const canCreate = isConnected && !isWrongNetwork && !isSubmitting;
	const canUpdate = canCreate && greetingObjectId.trim().length > 0 && newText.trim().length > 0;

	const setErrorStatus = (message: string) => {
		setStatusTone('error');
		setStatusMessage(message);
	};

	const setSuccessStatus = (message: string) => {
		setStatusTone('success');
		setStatusMessage(message);
	};

	const readGreetingObject = async (objectId: string) => {
		setIsReadingObject(true);
		try {
			const object = await client.getObject({
				objectId,
				include: { json: true },
			});
			const text = getGreetingTextFromObjectResponse(object);
			if (!text) {
				setCurrentGreetingText(null);
				setErrorStatus('Object read succeeded, but `text` field was not found.');
				return;
			}

			setCurrentGreetingText(text);
			setSuccessStatus('Greeting object loaded successfully.');
		} catch (error) {
			setCurrentGreetingText(null);
			setErrorStatus(`Unable to read greeting object: ${String(error)}`);
		} finally {
			setIsReadingObject(false);
		}
	};

	const handleCreateGreeting = async () => {
		setStatusTone('idle');
		setStatusMessage('Submitting `new` transaction...');
		setIsSubmitting(true);
		setLastDigest(null);
		try {
			const tx = buildNewGreetingTransaction();
			const result = (await dAppKit.signAndExecuteTransaction({
				transaction: tx,
			})) as TransactionResultLike;

			const failedMessage = getFailedTransactionError(result);
			if (failedMessage) {
				setErrorStatus(`Create transaction failed: ${failedMessage}`);
				return;
			}

			const digest = getTransactionDigest(result);
			setLastDigest(digest);

			const createdObjectId = getCreatedGreetingObjectId(result);
			if (!createdObjectId) {
				setSuccessStatus('Create transaction succeeded. Please paste the Greeting object ID to continue.');
				return;
			}

			setGreetingObjectId(createdObjectId);
			await readGreetingObject(createdObjectId);
		} catch (error) {
			setErrorStatus(`Unable to submit create transaction: ${String(error)}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleUpdateGreeting = async () => {
		const objectId = greetingObjectId.trim();
		const text = newText.trim();
		if (!objectId || !text) {
			setErrorStatus('Please provide both Greeting object ID and new text.');
			return;
		}

		setStatusTone('idle');
		setStatusMessage('Submitting `update_text` transaction...');
		setIsSubmitting(true);
		setLastDigest(null);
		try {
			const tx = buildUpdateGreetingTransaction(objectId, text);
			const result = (await dAppKit.signAndExecuteTransaction({
				transaction: tx,
			})) as TransactionResultLike;

			const failedMessage = getFailedTransactionError(result);
			if (failedMessage) {
				setErrorStatus(`Update transaction failed: ${failedMessage}`);
				return;
			}

			const digest = getTransactionDigest(result);
			setLastDigest(digest);
			await readGreetingObject(objectId);
		} catch (error) {
			setErrorStatus(`Unable to submit update transaction: ${String(error)}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	const statusColor =
		statusTone === 'error'
			? 'text-red-600 dark:text-red-400'
			: statusTone === 'success'
				? 'text-emerald-600 dark:text-emerald-400'
				: 'text-slate-600 dark:text-slate-300';

	const txExplorerUrl = lastDigest
		? `https://suiexplorer.com/txblock/${lastDigest}?network=testnet`
		: null;
	const objectExplorerUrl = greetingObjectId.trim()
		? `https://suiexplorer.com/object/${greetingObjectId.trim()}?network=testnet`
		: null;

	return (
		<section className='mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900'>
			<div className='mb-4'>
				<h2 className='text-xl font-semibold text-slate-900 dark:text-slate-100'>Greeting Contract Actions</h2>
				<p className='mt-1 break-all text-xs text-slate-500 dark:text-slate-400'>
					Package: 0x1c6af369bddda1ff8ae2be99e5db177fcc82aafd164fded54d490d44fbb03d22
				</p>
			</div>

			{isWrongNetwork ? (
				<p className='mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300'>
					Switch to <strong>testnet</strong> to submit transactions.
				</p>
			) : null}

			<div className='grid gap-4'>
				<label className='grid gap-1 text-sm font-medium text-slate-700 dark:text-slate-200'>
					Greeting object ID
					<input
						type='text'
						value={greetingObjectId}
						onChange={(event) => setGreetingObjectId(event.target.value)}
						placeholder='0x...'
						className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-800'
					/>
				</label>

				<label className='grid gap-1 text-sm font-medium text-slate-700 dark:text-slate-200'>
					New greeting text
					<input
						type='text'
						value={newText}
						onChange={(event) => setNewText(event.target.value)}
						placeholder='Xin chao ITC!'
						className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-800'
					/>
				</label>

				<div className='flex flex-wrap gap-2'>
					<button
						type='button'
						onClick={handleCreateGreeting}
						disabled={!canCreate}
						className='rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400'
					>
						{isSubmitting ? 'Submitting...' : 'Create Greeting'}
					</button>
					<button
						type='button'
						onClick={handleUpdateGreeting}
						disabled={!canUpdate}
						className='rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400'
					>
						{isSubmitting ? 'Submitting...' : 'Update Greeting'}
					</button>
					<button
						type='button'
						onClick={() => {
							void readGreetingObject(greetingObjectId.trim());
						}}
						disabled={!greetingObjectId.trim() || isReadingObject}
						className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
					>
						{isReadingObject ? 'Loading...' : 'Refresh Greeting'}
					</button>
				</div>
			</div>

			<div className='mt-4 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/60'>
				<p className={statusColor}>Status: {statusMessage}</p>
				{lastDigest ? (
					<p className='mt-2 break-all text-slate-700 dark:text-slate-200'>
						Last tx digest: <span className='font-mono text-xs'>{lastDigest}</span>{' '}
						{txExplorerUrl ? (
							<a
								href={txExplorerUrl}
								target='_blank'
								rel='noreferrer'
								className='ml-1 text-sky-600 underline hover:text-sky-700 dark:text-sky-400'
							>
								View on Explorer
							</a>
						) : null}
					</p>
				) : null}
				{greetingObjectId.trim() ? (
					<p className='mt-2 break-all text-slate-700 dark:text-slate-200'>
						Greeting object ID: <span className='font-mono text-xs'>{greetingObjectId.trim()}</span>{' '}
						{objectExplorerUrl ? (
							<a
								href={objectExplorerUrl}
								target='_blank'
								rel='noreferrer'
								className='ml-1 text-sky-600 underline hover:text-sky-700 dark:text-sky-400'
							>
								View on Explorer
							</a>
						) : null}
					</p>
				) : null}
				{currentGreetingText !== null ? (
					<p className='mt-2 text-slate-700 dark:text-slate-200'>
						Current on-chain text: <span className='font-medium'>{currentGreetingText}</span>
					</p>
				) : null}
			</div>
		</section>
	);
}
