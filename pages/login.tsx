"use client";

import React, { useState, useEffect } from "react";
import { Template } from "../src/app/components/common/Template";
import { useRouter } from "next/navigation";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // ✅ ログイン状態をチェック
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          router.push("/"); // すでにログイン済みならトップページにリダイレクト
        }
      } catch (error) {
        console.error("認証チェックエラー:", error);
      }
    };

    checkAuth();
  }, [router]);

  // フロントエンドでのバリデーション
  const validateInput = () => {
    if (!email) {
      return "メールアドレスを入力してください";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "正しいメールアドレスを入力してください";
    }
    if (!password) {
      return "パスワードを入力してください";
    }
    if (password.length < 6) {
      return "パスワードは6文字以上で入力してください";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーションのチェック
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      return;
    }

    // ログインAPIの呼び出し
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("ログイン成功:", result);
        router.push("/"); // トップページにリダイレクト
      } else {
        const errorData = await response.json();
        setError(errorData.message || "ログインに失敗しました");
      }
    } catch (err) {
      setError("サーバーエラーが発生しました");
    }
  };

  return (
    <Template>
      <div className="flex flex-col items-center justify-center bg-gray-100">
        <form
          className="bg-white p-6 rounded shadow-md w-80"
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-bold mb-4 text-center">ログイン</h2>
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300 text-gray-900"
              placeholder="example@example.com"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300 text-gray-900"
              placeholder="6文字以上"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            ログイン
          </button>
        </form>
      </div>
    </Template>
  );
};

export default Login;
