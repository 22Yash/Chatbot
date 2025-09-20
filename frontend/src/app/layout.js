import "./globals.css";

export const metadata = { title: "Contentstack Chat Demo" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <header className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-bold text-indigo-600">CS Chat Platform</h1>
            <a href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-indigo-600">
              Dashboard
            </a>
          </div>
        </header>
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
