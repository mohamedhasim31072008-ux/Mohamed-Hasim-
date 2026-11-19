import { LibraryProvider } from './context/LibraryContext';
import { LibraryShell } from './components/LibraryShell';

export default function App() {
  return (
    <LibraryProvider>
      <LibraryShell />
    </LibraryProvider>
  );
}
