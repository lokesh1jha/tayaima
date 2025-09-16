export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-8 text-sm">
      <div className="container flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">© {new Date().getFullYear()} TaYaima. All rights reserved.</p>
      </div>
    </footer>
  );
}