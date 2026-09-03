# Assumptions & Improvements

## Assumptions made
- Each invoice belongs to at most one customer; walk-in customers are allowed (customer_id can be null).
- Cancelling an invoice restores stock; deleting an invoice does not restore stock (assumed already cancelled first, or a data-cleanup action).
- Tax and discount are entered as percentages, applied to the subtotal.
- Only one login role used for simplicity (admin/staff distinction exists in schema but isn't enforced everywhere).

## What I would improve with more time
- Enforce role-based permissions (e.g. only admin can delete products).
- Add unit and integration tests (Jest + Supertest for backend).
- Add a proper job queue (e.g. BullMQ + Redis) for high invoice-creation concurrency instead of relying only on row locks. Note: the current backend already uses MySQL transactions with row-level locking (SELECT ... FOR UPDATE) inside invoice creation, which safely handles multiple simultaneous orders without overselling stock.
- Add invoice PDF export/print.
- Add pagination and sorting to invoices and customers lists.
- Add audit logging (who created/cancelled which invoice, and when).