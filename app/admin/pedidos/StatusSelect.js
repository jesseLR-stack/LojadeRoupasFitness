"use client";

import { useRef } from "react";
import { setOrderStatus } from "../actions";

// Muda o status do pedido assim que a opção é escolhida.
export default function StatusSelect({ number, status, statuses }) {
  const formRef = useRef(null);
  return (
    <form ref={formRef} action={setOrderStatus}>
      <input type="hidden" name="number" value={number} />
      <select
        id={`status-${number}`}
        name="status"
        defaultValue={status}
        className={`status-select st-${status}`}
        aria-label={`Status do pedido ${number}`}
        onChange={(e) => {
          e.target.className = `status-select st-${e.target.value}`;
          formRef.current.requestSubmit();
        }}
      >
        {Object.entries(statuses).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
      </select>
    </form>
  );
}
