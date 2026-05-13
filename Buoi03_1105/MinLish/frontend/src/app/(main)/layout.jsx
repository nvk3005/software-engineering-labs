import Link from 'next/link';

export default function MainLayout({ children }) {
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container">
          <Link href="/dashboard" className="navbar-brand">MinLish</Link>
          <div className="navbar-nav">
            <Link href="/lessons" className="nav-link">Bài Học</Link>
            <Link href="/vocabulary" className="nav-link">Từ Vựng</Link>
            <Link href="/profile" className="nav-link">Hồ Sơ</Link>
          </div>
        </div>
      </nav>
      <main className="container mt-4">
        {children}
      </main>
    </div>
  );
}
