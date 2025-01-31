"use client";

import React, { useEffect } from "react";
import { Template } from "../src/app/components/common/Template";

const Unit = () => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
        const response = await fetch(`${apiBaseUrl}/api/unit/show`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const result = await response.json();
          const records = result.records;
          console.log(records);
        } else {
          const errorData = await response.json();
          console.log(errorData);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  return <Template>hoge</Template>;
};

export default Unit;
