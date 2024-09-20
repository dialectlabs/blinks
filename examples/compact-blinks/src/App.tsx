import {
  CompactBlink,
  useAction,
  useActionsRegistryInterval,
} from '@dialectlabs/blinks';
import { useActionSolanaWalletAdapter } from '@dialectlabs/blinks/hooks/solana';
import '@dialectlabs/blinks/index.css';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  useActionsRegistryInterval();

  const { adapter } = useActionSolanaWalletAdapter(
    import.meta.env.VITE_PUBLIC_RPC_URL,
  );
  const { action, isLoading } = useAction({
    url: 'https://dial.to/api/donate',
    adapter,
  });

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex min-w-[400px] flex-col items-center">
        <h1 className="mb-4 text-center text-4xl font-bold">Compact Blinks</h1>
        <div className="mb-4 w-full">
          {isLoading || !action ? (
            <span>Loading</span>
          ) : (
            <CompactBlink
              component={(currentAction) =>
                currentAction.actions.find(
                  (component) => component.label === 'Donate',
                )!
              }
              action={action}
            />
          )}
        </div>
        <WalletMultiButton />
      </div>
    </div>
  );
}

export default App;
