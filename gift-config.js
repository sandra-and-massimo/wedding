/*
  Fill these in yourselves (see README, "Honeymoon page").
  Everything here is shown publicly on the page, so only put what guests should see.

  supabaseUrl / supabaseKey: Supabase > Project Settings > API.
    Use the "Project URL" and the public key ("publishable" or "anon public").
    NEVER paste the "service_role" / "secret" key here.
    While these are empty the page runs in demo mode: it works, but nothing is saved.

  payment: whatever you leave empty ("") is simply not shown.
*/
window.SM_GIFT_CONFIG = {
  supabaseUrl: "https://ejnpanbanonswwdvntco.supabase.co",
  supabaseKey: "sb_publishable_l7J__fexgrUYMPr8DQok6w_UEFy-pJx",

  payment: {
    holder: "Massimo Toscanelli: blabla",
    iban: "PASTE HERE: IBAN",
    bic: "",
    revolut: "PASTE HERE: Revolut @username or revolut.me link",
    paypal: "PASTE HERE: PayPal email or paypal.me link"
  }
};
