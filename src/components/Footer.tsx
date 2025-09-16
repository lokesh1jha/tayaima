export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-8 text-sm">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-gray-600 dark:text-gray-400">© {new Date().getFullYear()} TaYaima. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a className="hover:underline" href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a>
          <a className="hover:underline" href="/privacy">Privacy</a>
          <a className="hover:underline" href="/terms">Terms</a>
        </div>
      </div>
    </footer>
  );
}