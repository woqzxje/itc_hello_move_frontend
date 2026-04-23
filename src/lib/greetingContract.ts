import { Transaction } from '@mysten/sui/transactions';

export const GREETING_PACKAGE_ID =
	'0x1c6af369bddda1ff8ae2be99e5db177fcc82aafd164fded54d490d44fbb03d22';
export const GREETING_MODULE = 'greeting';
export const GREETING_STRUCT = 'Greeting';

const GREETING_NEW_TARGET = `${GREETING_PACKAGE_ID}::${GREETING_MODULE}::new`;
const GREETING_UPDATE_TEXT_TARGET = `${GREETING_PACKAGE_ID}::${GREETING_MODULE}::update_text`;
const GREETING_STRUCT_TYPE = `${GREETING_PACKAGE_ID}::${GREETING_MODULE}::${GREETING_STRUCT}`;

type ObjectChangeLike = {
	type?: string;
	objectType?: string;
	objectId?: string;
};

type TransactionSuccessLike = {
	Transaction?: {
		digest?: string;
		objectChanges?: ObjectChangeLike[];
		effects?: {
			changedObjects?: Array<{
				objectId?: string;
				idOperation?: string;
			}>;
		};
	};
};

type TransactionFailureLike = {
	FailedTransaction?: {
		status?: {
			error?: {
				message?: string;
			};
		};
	};
};

export type TransactionResultLike = TransactionSuccessLike & TransactionFailureLike;

export function buildNewGreetingTransaction() {
	const tx = new Transaction();
	tx.moveCall({
		target: GREETING_NEW_TARGET,
	});
	return tx;
}

export function buildUpdateGreetingTransaction(greetingObjectId: string, newText: string) {
	const tx = new Transaction();
	tx.moveCall({
		target: GREETING_UPDATE_TEXT_TARGET,
		arguments: [tx.object(greetingObjectId), tx.pure.string(newText)],
	});
	return tx;
}

export function getTransactionDigest(result: TransactionResultLike): string | null {
	return result.Transaction?.digest ?? null;
}

export function getFailedTransactionError(result: TransactionResultLike): string | null {
	return result.FailedTransaction?.status?.error?.message ?? null;
}

export function getCreatedGreetingObjectId(result: TransactionResultLike): string | null {
	const objectChanges = result.Transaction?.objectChanges;
	if (objectChanges && objectChanges.length > 0) {
		const createdGreeting = objectChanges.find((change) => {
			return (
				change.type === 'created' &&
				change.objectType === GREETING_STRUCT_TYPE &&
				Boolean(change.objectId)
			);
		});

		if (createdGreeting?.objectId) {
			return createdGreeting.objectId;
		}
	}

	const changedObjects = result.Transaction?.effects?.changedObjects;
	if (!changedObjects || changedObjects.length === 0) {
		return null;
	}

	const createdObject = changedObjects.find(
		(change) => change.idOperation === 'Created' && Boolean(change.objectId),
	);
	return createdObject?.objectId ?? null;
}
