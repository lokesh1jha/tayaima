import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-4 text-sm">
      <div className="container">
        <div className="flex flex-col items-center gap-2">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2">
            <Image
              src="/tayaima-logo.jpeg"
              alt="TaYaima Logo"
              width={24}
              height={24}
              className="rounded-lg object-contain"
            />
            <span className="font-semibold text-base text-blue-600 dark:text-blue-400">
              Tayaima Store
            </span>
          </div>
          
          {/* Copyright */}
          <p className="text-gray-600 dark:text-gray-400 text-xs">
            © {new Date().getFullYear()} Tayaima Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}