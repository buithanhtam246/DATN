# 📊 Visual Data Flow Diagram

## Complete Address Flow from Frontend to Admin

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Checkout Page)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ User Actions:                                                        │  │
│  │                                                                      │  │
│  │  Option A: Select Saved Address              Option B: Manual Entry│  │
│  │  ┌──────────────────────────────────────┐    ┌────────────────────┐│  │
│  │  │ onAddressSelect(address)             │    │ Form binding:      ││  │
│  │  │ ↓                                    │    │ this.address = ...  ││  │
│  │  │ this.selectedAddressId = 1           │    │                    ││  │
│  │  │ this.address = "full text..."        │    │ selectedAddressId  ││  │
│  │  │                                      │    │ = null             ││  │
│  │  └──────────────────────────────────────┘    └────────────────────┘│  │
│  │                                                                      │  │
│  │  Both paths converge at checkout() method:                          │  │
│  │  ┌──────────────────────────────────────────────────────────────┐  │  │
│  │  │ const orderData = {                                          │  │  │
│  │  │   items: [...],                                              │  │  │
│  │  │   address_id: this.selectedAddressId || null,  ← KEY #1    │  │  │
│  │  │   delivery_address: this.address               ← KEY #2    │  │  │
│  │  │ }                                                            │  │  │
│  │  └──────────────────────────────────────────────────────────────┘  │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                           ↓                                │
│                            [HTTP POST to /api/orders/checkout]             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

                                    ↓ API CALL ↓

┌─────────────────────────────────────────────────────────────────────────────┐
│                        BACKEND (Node.js Server)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Order.controller.create(req, res):                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ const order = await orderService.checkout(userId, req.body)          │ │
│  │                                                                       │ │
│  │ req.body contains:                                                  │ │
│  │   { address_id: [or null], delivery_address: "[text]", ... }       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                           ↓                                │
│  Order.service.checkout(userId, orderData):                                │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ const { address_id, delivery_address, ... } = orderData             │ │
│  │                                                                       │ │
│  │ const order = await orderRepository.createOrder({                   │ │
│  │   user_id: userId,                                                  │ │
│  │   address_id: address_id || null,        ← SAVES TO DB            │ │
│  │   delivery_address: delivery_address || null,  ← SAVES TO DB       │ │
│  │   total_price: ...,                                                 │ │
│  │   ...                                                                │ │
│  │ }, t);                                                               │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                           ↓                                │
│                          [MySQL INSERT INTO orders]                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

                                    ↓ SAVE ↓

┌─────────────────────────────────────────────────────────────────────────────┐
│                           MySQL DATABASE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  orders table:                                                              │
│  ┌─────┬──────────┬─────────────┬──────────────────────────────────┐      │
│  │ id  │user_id   │address_id   │ delivery_address               │      │
│  ├─────┼──────────┼─────────────┼──────────────────────────────────┤      │
│  │ ... │          │             │                                  │      │
│  │ 32  │ 10       │ 1           │ 123 Đường ABC, Q1, HCM          │ ← Scenario A │
│  │ 33  │ 10       │ NULL        │ 789 Nguyễn Huệ, Q3, HCM         │ ← Scenario B │
│  │ ... │          │             │                                  │      │
│  └─────┴──────────┴─────────────┴──────────────────────────────────┘      │
│                                                                             │
│  addresses table:                                                           │
│  ┌────┬──────────┬──────────────────────────────────┬───────────┐         │
│  │ id │ user_id  │ full_address                     │ is_default│         │
│  ├────┼──────────┼──────────────────────────────────┼───────────┤         │
│  │ 1  │ 10       │ 123 Đường ABC, Q1, HCM           │ 1         │         │
│  │ 2  │ 10       │ 456 Đường XYZ, Q2, HCM           │ 0         │         │
│  └────┴──────────┴──────────────────────────────────┴───────────┘         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

                            ↓ ADMIN API QUERY ↓

┌─────────────────────────────────────────────────────────────────────────────┐
│                   Admin Backend (Order Service)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  getOrderById(orderId):                                                     │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ SELECT                                                                │ │
│  │   ...,                                                                │ │
│  │   COALESCE(                                                           │ │
│  │     MAX(a.full_address),              ← Try saved address first     │ │
│  │     MAX(o.delivery_address),          ← Then delivery_address column │ │
│  │     MAX(da.full_address)              ← Finally default address      │ │
│  │   ) as address                                                       │ │
│  │ FROM orders o                                                        │ │
│  │ LEFT JOIN addresses a ON o.address_id = a.id                       │ │
│  │ LEFT JOIN addresses da ON o.user_id = da.user_id AND da.is_default │ │
│  │ WHERE o.id = ?                                                       │ │
│  │ GROUP BY o.id                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                           ↓                                │
│  For Order #32:                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ address_id = 1 (not null)                                             │ │
│  │ → LEFT JOIN finds addresses.id=1                                      │ │
│  │ → COALESCE picks: "123 Đường ABC, Q1, HCM"  ✓                        │ │
│  │ → Result: address = "123 Đường ABC, Q1, HCM"                         │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  For Order #33:                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ address_id = NULL                                                     │ │
│  │ → LEFT JOIN finds nothing for address_id                             │ │
│  │ → COALESCE skips to delivery_address column: not null                │ │
│  │ → COALESCE picks: "789 Nguyễn Huệ, Q3, HCM"  ✓                     │ │
│  │ → Result: address = "789 Nguyễn Huệ, Q3, HCM"                      │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

                              ↓ HTTP RESPONSE ↓

┌─────────────────────────────────────────────────────────────────────────────┐
│                        Admin Frontend (Angular)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  getAdminOrderDetail(orderId):                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ this.apiService.getAdminOrderDetail(orderId).subscribe(data => {    │ │
│  │   this.selectedOrder = data;                                          │ │
│  │   this.selectedOrder.address = "...";  ← From COALESCE above        │ │
│  │ })                                                                     │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  orders.component.html:                                                     │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ <div class="order-detail">                                            │ │
│  │   <p>Khách hàng: {{ selectedOrder.customerName }}</p>                │ │
│  │   <p>Địa chỉ: {{ selectedOrder.address }}</p>  ← Displays here!    │ │
│  │   <p>Ngày đặt: {{ selectedOrder.create_at }}</p>                     │ │
│  │ </div>                                                                 │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

                                ↓ RENDER ↓

┌─────────────────────────────────────────────────────────────────────────────┐
│                        Admin Panel Browser                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Order #32 Details Modal:                    Order #33 Details Modal:      │
│  ┌──────────────────────────────┐            ┌──────────────────────────┐  │
│  │ Khách hàng: John Doe         │            │ Khách hàng: Jane Smith   │  │
│  │ Địa chỉ: 123 Đường ABC,     │            │ Địa chỉ: 789 Nguyễn     │  │
│  │           Q1, HCM      ✅     │            │           Huệ, Q3, HCM  │  │
│  │ Ngày đặt: 2024-01-15         │            │ Ngày đặt: 2024-01-16    │  │
│  └──────────────────────────────┘            └──────────────────────────┘  │
│                                                                             │
│  ✅ Addresses display correctly                                            │
│  ✅ No "Chưa có địa chỉ" messages                                         │
│  ✅ Users can see where their orders go                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Summary Table

| Layer | Scenario A (Saved Address) | Scenario B (Manual Address) |
|-------|---------------------------|----------------------------|
| **Frontend** | `selectedAddressId = 1` | `selectedAddressId = null` |
| | `this.address = "text"` | `this.address = "text"` |
| **Request Body** | `{ address_id: 1, delivery_address: "text" }` | `{ address_id: null, delivery_address: "text" }` |
| **Database Storage** | `address_id = 1, delivery_address = "text"` | `address_id = null, delivery_address = "text"` |
| **Admin Query** | COALESCE picks addresses.full_address | COALESCE picks orders.delivery_address |
| **Admin Display** | ✅ Shows saved address | ✅ Shows manual address |

---

## Key Points

1. **Frontend sends TWO pieces**: address_id (if applicable) + delivery_address (always)
2. **Backend stores BOTH**: preserves the reference AND the text
3. **Admin queries with FALLBACK**: tries saved address first, then text column
4. **Result**: All new orders have address information for admin to see

This design is robust because:
- ✅ Works with saved addresses (uses reference)
- ✅ Works with manual addresses (uses text)
- ✅ Works with mixed scenarios (fallback chain)
- ✅ Backward compatible (doesn't break existing orders)
