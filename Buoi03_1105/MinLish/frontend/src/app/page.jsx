import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mt-5 text-center">
      <h1>Chào mừng đến với MinLish</h1>
      <p className="lead">Nền tảng học tiếng Anh chuyên sâu: Listening, Shadowing, Vocabulary</p>
      <div className="d-flex justify-content-center gap-3 mt-4">
        <Link href="/login" className="btn btn-primary">Đăng nhập</Link>
        <Link href="/register" className="btn btn-outline-primary">Đăng ký</Link>
      </div>
    </div>
  );
}
