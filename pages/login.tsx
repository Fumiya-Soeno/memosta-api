"use client";

import React, { useState, useEffect } from "react";
import { Template } from "../src/app/components/common/Template";
import { useRouter } from "next/navigation";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // ログイン状態チェック（ログイン済みならトップへリダイレクト）
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.loggedIn) {
            router.push("/");
          }
        }
      } catch (error) {
        console.error("認証チェックエラー:", error);
      }
    };

    checkAuth();
  }, [router]);

  // 入力値バリデーション
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

  // 通常のログイン処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("ログイン成功:", result);
        router.push("/");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "ログインに失敗しました");
      }
    } catch (err) {
      setError("サーバーエラーが発生しました");
    }
  };

  // ゲストログイン処理（固定の認証情報でログイン）
  const handleGuestLogin = async () => {
    // 固定の認証情報
    const guestEmail = "Test@test.com";
    const guestPassword = "testtest";
    setError(null);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: guestEmail, password: guestPassword }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("ゲストログイン成功:", result);
        router.push("/unit/new");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "ゲストログインに失敗しました");
      }
    } catch (err) {
      setError("サーバーエラーが発生しました");
    }
  };

  return (
    <Template>
      <div className="flex flex-col items-center justify-center">
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
        <button
          onClick={handleGuestLogin}
          className="mt-4 w-80 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          ゲストで遊ぶ
        </button>
      </div>
    </Template>
  );
};

export default Login;
