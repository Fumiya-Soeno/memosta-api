// TailwindCSSをpagesディレクトリ以下に読み込ませるためのファイル
import "../src/app/globals.css";

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
