import {
  Miniblink,
  useBlink,
  useBlinksRegistryInterval,
} from '@dialectlabs/blinks';
import { useBlinkSolanaWalletAdapter } from '@dialectlabs/blinks/hooks/solana';
import '@dialectlabs/blinks/index.css';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  useBlinksRegistryInterval();

  const { adapter } = useBlinkSolanaWalletAdapter(
    import.meta.env.VITE_PUBLIC_RPC_URL,
  );
  const { action, isLoading } = useBlink({
    url: 'solana-action:https://dial.to/api/donate',
  });

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex min-w-[400px] flex-col items-center">
        <h1 className="mb-4 text-center text-4xl font-bold">Mini Blinks</h1>
        <div className="mb-4 w-full">
          {isLoading || !action ? (
            <span>Loading</span>
          ) : (
            <Miniblink
              adapter={adapter}
              selector={(currentAction) =>
                currentAction.actions.find((a) => a.label === 'Donate')!
              }
              blink={action}
            />
          )}
        </div>
        <WalletMultiButton />
      </div>
    </div>
  );
}

export default App;
