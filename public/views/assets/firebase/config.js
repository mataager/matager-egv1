// Firebase Client SDK Configuration & Cloud Firestore Integration
(function () {
  "use strict";

  const firebaseConfig = {
    apiKey: "AIzaSyDtR4bpaQkEpCmmKeIdmww9yckJmbqibHU",
    authDomain: "matager-f1f00.firebaseapp.com",
    databaseURL: "https://matager-f1f00-default-rtdb.firebaseio.com",
    projectId: "matager-f1f00",
    storageBucket: "matager-f1f00.firebasestorage.app",
    messagingSenderId: "922824110897",
    appId: "1:922824110897:web:c96f9a90a2b2ff4a2e7610",
    measurementId: "G-TVHBP63CSV",
  };

  let app = null;
  let db = null;
  let auth = null;

  if (typeof firebase !== "undefined") {
    try {
      app = firebase.apps && firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      auth = firebase.auth();
      // Anonymous authentication for customer fastcart session
      if (auth && !auth.currentUser) {
        auth.signInAnonymously().catch(() => null);
      }
    } catch (e) {
      console.warn("Firebase client init notice:", e);
    }
  }

  window.MatagerFirebase = {
    config: firebaseConfig,
    app,
    db,
    auth,

    /**
     * Submits an order to Cloud Firestore (Transaction & TransactionItem)
     * and broadcasts it live to the Admin Dashboard.
     */
    async submitOrder(orderData) {
      const storeId =
        localStorage.getItem("matager_active_store_id") || "store_peacock_default";
      const orderId = "ord_" + Date.now();
      const amount = orderData.total || 4500;

      const transaction = {
        id: orderId,
        store_id: storeId,
        amount: amount,
        commission_earned: Math.round(amount * 0.05),
        gateway_fee: Math.round(amount * 0.02),
        status: "Completed",
        type: "Order",
        channel: "Online",
        payment_method: orderData.paymentMethod || "Mada",
        customer_name: orderData.customerName || "Customer FastCart",
        customer_phone: orderData.customerPhone || "+20 101 077 3587",
        shipping_address: orderData.address || "Cairo, Egypt",
        items_count: orderData.itemsCount || 1,
        created_at: new Date().toISOString(),
      };

      // 1. Write to Firestore if connected
      if (db) {
        try {
          await db.collection("Transaction").doc(orderId).set(transaction);

          await db.collection("TransactionItem").doc(orderId + "_item_1").set({
            id: orderId + "_item_1",
            transaction_id: orderId,
            store_id: storeId,
            name_snapshot: orderData.productName || "Adidas classic t-shirt",
            quantity: orderData.itemsCount || 1,
            unit_price: amount,
            total: amount,
            created_at: new Date().toISOString(),
          });
        } catch (err) {
          console.warn("Firestore sync fallback to localStorage:", err);
        }
      }

      // 2. Persist locally for dashboard real-time cross-tab sync
      try {
        const local = JSON.parse(localStorage.getItem("matager_local_orders") || "[]");
        local.unshift(transaction);
        localStorage.setItem("matager_local_orders", JSON.stringify(local.slice(0, 50)));
      } catch (e) {
        console.warn("localStorage quota/error:", e);
      }

      // 3. Play checkout audio feedback
      if (window.ShopEaseSounds && typeof window.ShopEaseSounds.play === "function") {
        window.ShopEaseSounds.play("payment-success");
      }

      // 4. Alert via sticky nav pill
      if (typeof window.showAlert === "function") {
        window.showAlert(
          "cart",
          "Order #" +
            orderId.slice(-6).toUpperCase() +
            " sent to store dashboard!"
        );
      }

      // 5. Broadcast to dashboard and customer doc hub
      window.dispatchEvent(
        new CustomEvent("matager:new_order", { detail: transaction })
      );

      return transaction;
    },
  };
})();
