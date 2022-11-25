/**
 * imp_uid 를 통해 아임포트 서버에서 받아오는 결제 정보입니다.
 * @author 현웅
 */
export type IamportPaymentResponse = {
  code: number;
  message: string;
  response: {
    //* Controller 를 통해 제공되는 정보이므로 여기서 정의할 필요는 없습니다.
    // imp_uid: string;
    // merchant_uid: string;
    amount: number;
    name: string;
    apply_num: string;
    bank_code: string;
    bank_name: string;
    buyer_addr: string;
    buyer_email: string;
    buyer_name: string;
    buyer_postcode: string;
    buyer_tel: string;
    card_code: string;
    card_name: string;
    card_quota: number;
    card_number: string;
    card_type: string | null;
    cancel_amount: number;
    cancel_history: [
      {
        pg_tid: string;
        amount: number;
        cancelled_at: number;
        reason: string;
        receipt_url: string;
      },
    ];
    cancel_reason: string;
    cancel_receipt_urls: string[];
    cancelled_at: number;
    cash_receipt_issued: boolean;
    channel: string;
    currency: string;
    customer_uid: string;
    customer_uid_usage: string;
    custom_data: string;
    emb_pg_provider: string;
    escrow: true;
    failed_at: number;
    fail_reason: string;
    paid_at: number;
    pay_method: string;
    pg_id: string;
    pg_provider: string;
    pg_tid: string;
    receipt_url: string;
    started_at: number;
    status: string;
    user_agent: string;
    vbank_code: string;
    vbank_date: number;
    vbank_holder: string;
    vbank_issued_at: number;
    vbank_name: string;
    vbank_num: string;
  };
};
