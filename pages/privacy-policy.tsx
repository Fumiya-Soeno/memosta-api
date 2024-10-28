import React from "react";

const PrivacyPolicy = () => {
  return (
    <main className="container mx-auto p-4" style={styles.container}>
      <div style={styles.content}>
        <h1 className="text-4xl font-bold mb-6">プライバシーポリシー</h1>
        <p>最終更新日: 2024年10月29日</p>

        <h2 className="text-2xl font-bold mt-6 mb-4">1. 収集する情報</h2>
        <p>
          当アプリでは、以下の情報を収集する場合があります。
          <ul className="list-disc list-inside">
            <li>ユーザー名: ゲームプレイ中のランキング表示に利用します。</li>
            <li>
              ゲームプレイ情報:
              連勝記録や勝率など、ゲーム体験の向上のために利用します。
            </li>
            <li>
              デバイス情報:
              アプリの安定性やパフォーマンス向上のために匿名のデバイス情報を収集します。
            </li>
          </ul>
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-4">2. 情報の利用方法</h2>
        <p>
          収集した情報は以下の目的で利用されます。
          <ul className="list-disc list-inside">
            <li>ゲームのランキング機能の提供</li>
            <li>ユーザー体験の向上のための分析</li>
            <li>アプリの改善およびバグ修正</li>
          </ul>
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-4">3. 情報の共有</h2>
        <p>
          当アプリは、収集した情報を第三者と共有することはありません。ただし、以下の場合を除きます。
          <ul className="list-disc list-inside">
            <li>法令に基づく開示が必要な場合</li>
            <li>ユーザーの同意が得られた場合</li>
          </ul>
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-4">
          4. クッキー（Cookies）の使用
        </h2>
        <p>
          当アプリは、クッキーを使用してユーザーの利便性を向上させるための情報を保存する場合があります。クッキーの使用は、ユーザーの設定で無効にすることが可能です。
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-4">5. データの保存期間</h2>
        <p>
          当アプリは、収集した情報を必要な期間に限り保存します。ランキング情報などのゲームデータは、ユーザーがアプリを利用する期間中保存されます。
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-4">6. ユーザーの権利</h2>
        <p>
          ユーザーは、当アプリが保持する自身の情報について、開示、修正、削除を要求する権利があります。これらのリクエストについては、下記の問い合わせ先までご連絡ください。
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-4">7. セキュリティ対策</h2>
        <p>
          当アプリは、ユーザー情報を適切に保護するために、技術的および組織的なセキュリティ対策を講じています。不正アクセス、情報の紛失、破壊、改ざん、漏洩を防止するために努めています。
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-4">
          8. プライバシーポリシーの変更
        </h2>
        <p>
          本プライバシーポリシーは、必要に応じて変更されることがあります。重要な変更がある場合は、ユーザーに対して適切な方法で通知します。
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-4">9. お問い合わせ</h2>
        <p>
          本プライバシーポリシーに関するお問い合わせは、以下のメールアドレスまでご連絡ください。
        </p>
        <p>Email: fumiya.soeno@gmail.com</p>
      </div>
    </main>
  );
};

export default PrivacyPolicy;

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    minHeight: "100vh",
    backgroundColor: "#f9f9f9",
  },
  content: {
    maxWidth: "1200px",
    width: "100%",
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
};
