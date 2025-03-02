"use client";

import React, { useState } from "react";
import { Template } from "../../src/app/components/common/Template";
import { fetchApi } from "../../helpers/api";

const NewUnit = () => {
  const handleSearchUnit = () => {
    fetchApi(
      "/unit/search",
      "POST",
      async (result: any) => {},
      (error: unknown) => {},
      {
        //body
      }
    );
  };

  return <Template>この機能は準備中です</Template>;
};

export default NewUnit;
