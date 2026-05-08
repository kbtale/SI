# Svelte + Supabase Inventory Dashboard (PoC)

This repository contains a Proof of Concept for an inventory management system. It was created for demonstration purposes and is now archived. The repository will not receive further updates or maintenance.

## Contents

* **Frontend:** Built with Svelte 5 and Vite. Includes functional UI components for:
* A dashboard with graphical stock summaries using Chart.js.
* Product management (addition, search, CSV import/export, and ABC classification).
* Inventory movement tracking (entries, exits, and adjustments).
* Authentication and role-based interface views.


* **Database Schema:** Designed for Supabase (PostgreSQL). The `src/database/schema.sql` file contains the complete setup, including:
* Tables for `products`, `inventory_movements`, `profiles`, and `company_settings`.
* Database triggers for automatic stock updates upon movement approval.
* Stored procedures for calculating ABC inventory classifications.
* Row Level Security (RLS) policies for administrative and staff roles.
