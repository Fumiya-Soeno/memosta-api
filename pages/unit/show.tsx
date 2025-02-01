"use client";

import React, { useEffect } from "react";
import { Template } from "../../src/app/components/common/Template";
import { fetchApi } from "../helpers/api";

const Unit = () => {
  useEffect(() => {
    fetchApi(
      "/unit/show",
      "GET",
      (result) => {
        console.log(result.rows);
      },
      (error) => {
        console.error("APIエラー:", error);
      }
    );
  }, []);

  return (
    <Template>
      <div>hoge</div>
    </Template>
  );
};

export default Unit;
