import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-8 text-sm">
      <div className="container">
        <div className="flex flex-col items-center gap-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Image
              src="/tayaima-logo.jpeg"
              alt="TaYaima Logo"
              width={32}
              height={32}
              className="rounded-lg object-contain"
            />
            <span className="font-semibold text-lg text-blue-600 dark:text-blue-400">
              TaYaima
            </span>
          </div>
          
          {/* Copyright */}
          <p className="text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} TaYaima. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}